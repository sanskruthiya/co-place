"use strict";

const FEED_BASE = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary";
const FEEDS = {
  day: { label: "1日以内", url: `${FEED_BASE}/4.5_day.geojson` },
  week: { label: "1週間以内", url: `${FEED_BASE}/4.5_week.geojson` },
  month: { label: "1ヶ月以内", url: `${FEED_BASE}/4.5_month.geojson` },
};
const DEFAULT_PERIOD = "week";
const REFRESH_MS = 5 * 60 * 1000;
const RECENT_MS = 60 * 60 * 1000;
const HOME_CENTER = [12, 18];
const STATUS_LABELS = { reviewed: "確認済み", automatic: "自動解析（未確認）", deleted: "削除済み" };

const $ = (id) => document.getElementById(id);
const panel = $("panel");
const magnitudeInput = $("magnitude");
const magnitudeValue = $("magnitudeValue");
const clusterToggle = $("clusterToggle");
const plateToggle = $("plateToggle");
const summary = $("summary");
const updated = $("updated");
const refreshButton = $("refresh");
const listToggle = $("listToggle");
const sortSelect = $("sort");
const quakeList = $("quakeList");
const info = $("info");
const mobileQuery = matchMedia("(max-width: 720px)");

const state = { period: periodFromHash(), minMag: Number(magnitudeInput.value), features: [], markers: new Map() };
const cache = new Map();
let requestId = 0;

const dateFormat = new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
const timeFormat = new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit" });
const relativeFormat = new Intl.RelativeTimeFormat("ja", { numeric: "auto" });

function periodFromHash() {
  const period = location.hash.slice(1);
  return FEEDS[period] ? period : DEFAULT_PERIOD;
}

function homeZoom() {
  return innerWidth < 600 ? 1 : 2;
}

function magClass(mag) {
  if (mag >= 7) return "mag-7";
  if (mag >= 6) return "mag-6";
  if (mag >= 5) return "mag-5";
  return "mag-45";
}

function markerSize(mag) {
  return Math.round(10 + Math.max(0, mag - 4.5) * 8);
}

function relativeTime(time) {
  const seconds = (time - Date.now()) / 1000;
  const units = [["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeFormat.format(Math.round(seconds / size), unit);
  }
  return "たった今";
}

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children.filter((child) => child != null));
  return node;
}

function quakeInfo(feature) {
  const { mag, place, time, tsunami, status, title, url, magType } = feature.properties;
  const depth = feature.geometry.coordinates[2];
  return { mag: mag ?? 0, place: place || title || "不明", time, tsunami: tsunami === 1, status, title, url, magType, depth };
}

// Map
const map = L.map("map", {
  minZoom: 1,
  maxZoom: 7,
  zoomControl: false,
  maxBounds: [[-90, -360], [90, 360]],
  maxBoundsViscosity: 0.8,
}).setView(HOME_CENTER, homeZoom());

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 7,
  attribution: '<a href="https://earthquake.usgs.gov/earthquakes/">USGS</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

L.control.zoom({ position: "topright", zoomInTitle: "拡大", zoomOutTitle: "縮小" }).addTo(map);

const HomeControl = L.Control.extend({
  options: { position: "topright" },
  onAdd() {
    const container = L.DomUtil.create("div", "leaflet-bar leaflet-control-home");
    const link = L.DomUtil.create("a", "", container);
    link.href = "#";
    link.title = "世界全体を表示";
    link.setAttribute("role", "button");
    link.setAttribute("aria-label", "世界全体を表示");
    link.textContent = "🌏";
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.on(link, "click", (event) => {
      L.DomEvent.preventDefault(event);
      map.setView(HOME_CENTER, homeZoom());
    });
    return container;
  },
});
new HomeControl().addTo(map);
L.control.scale({ maxWidth: 150, imperial: false, position: "bottomleft" }).addTo(map);

new ResizeObserver(() => map.invalidateSize()).observe($("map"));

// Static layers
const plateLayer = L.geoJSON(null, { interactive: false, style: { color: getComputedStyle(document.documentElement).getPropertyValue("--plate").trim(), weight: 1.2, opacity: 0.6 } });
const countryLayer = L.geoJSON(null, {
  style: { fillColor: "transparent", fillOpacity: 0, weight: 0 },
  onEachFeature(feature, layer) {
    layer.bindTooltip(feature.properties.name, { className: "country-tooltip", sticky: true, direction: "bottom", offset: [0, 16], opacity: 0.9 });
    layer.on({
      mouseover: () => layer.setStyle({ fillColor: "#64748b", fillOpacity: 0.15 }),
      mouseout: () => countryLayer.resetStyle(layer),
    });
  },
});

async function loadStaticLayer(layer, url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    layer.addData(await response.json());
  } catch (error) {
    console.error(`Failed to load ${url}`, error);
  }
}

loadStaticLayer(plateLayer, "app/data/plates.geojson");
plateLayer.addTo(map);
if (matchMedia("(hover: hover)").matches) {
  loadStaticLayer(countryLayer, "app/data/countries.geojson");
  countryLayer.addTo(map);
}

// Earthquake layers
const clusterLayer = L.markerClusterGroup({
  showCoverageOnHover: false,
  maxClusterRadius: 45,
  spiderfyDistanceMultiplier: 2,
  iconCreateFunction(cluster) {
    const markers = cluster.getAllChildMarkers();
    const maxMag = Math.max(...markers.map((marker) => marker.options.mag));
    const size = 30 + Math.min(markers.length, 40) / 2;
    return L.divIcon({
      html: `<span>${markers.length}</span>`,
      className: `quake-cluster ${magClass(maxMag)}`,
      iconSize: [size, size],
    });
  },
});
const plainLayer = L.featureGroup();
const activeLayer = () => (clusterToggle.checked ? clusterLayer : plainLayer);
activeLayer().addTo(map);

function popupContent(feature) {
  const quake = quakeInfo(feature);
  const rows = [
    ["場所", quake.place],
    ["規模", `M${quake.mag.toFixed(1)}${quake.magType ? ` (${quake.magType})` : ""}`],
    ["発生日時", `${dateFormat.format(quake.time)}（${relativeTime(quake.time)}）`],
    ["深さ", Number.isFinite(quake.depth) ? `${quake.depth.toFixed(1)} km` : "不明"],
    ["津波", quake.tsunami
      ? el("span", {}, "海域の大規模地震です。", el("a", { href: "https://www.tsunami.gov/", target: "_blank", rel: "noopener", textContent: "津波情報を確認" }))
      : "フラグなし"],
    ["情報の確度", STATUS_LABELS[quake.status] ?? quake.status ?? "不明"],
  ];
  return el("div", {},
    el("h3", { className: "popup-title" }, quake.url ? el("a", { href: quake.url, target: "_blank", rel: "noopener", textContent: quake.title }) : quake.title),
    el("table", { className: "popup-table" }, ...rows.map(([label, value]) => el("tr", {}, el("th", { textContent: label }), el("td", {}, value)))),
  );
}

function createMarker(feature) {
  const quake = quakeInfo(feature);
  const [lng, lat] = feature.geometry.coordinates;
  const size = markerSize(quake.mag);
  const recent = Date.now() - quake.time < RECENT_MS;
  return L.marker([lat, lng], {
    mag: quake.mag,
    title: `M${quake.mag.toFixed(1)} ${quake.place}`,
    zIndexOffset: Math.round((10 - quake.mag) * 1000),
    icon: L.divIcon({
      className: `quake-marker${recent ? " recent" : ""}`,
      html: `<span class="${magClass(quake.mag)}"></span>`,
      iconSize: [size, size],
    }),
  }).bindPopup(() => popupContent(feature), { maxWidth: 320 });
}

function visibleFeatures() {
  return state.features.filter((feature) => (feature.properties.mag ?? 0) >= state.minMag);
}

function render() {
  const features = visibleFeatures();
  const markers = features.map((feature) => state.markers.get(feature.id));
  clusterLayer.clearLayers();
  plainLayer.clearLayers();
  if (clusterToggle.checked) clusterLayer.addLayers(markers);
  else markers.forEach((marker) => plainLayer.addLayer(marker));

  summary.textContent = `${FEEDS[state.period].label}・M${state.minMag.toFixed(1)}以上: ${features.length}件（全${state.features.length}件）`;
  renderList(features);
}

function renderList(features) {
  const sorted = [...features].sort(sortSelect.value === "mag"
    ? (a, b) => (b.properties.mag ?? 0) - (a.properties.mag ?? 0) || b.properties.time - a.properties.time
    : (a, b) => b.properties.time - a.properties.time);

  if (sorted.length === 0) {
    quakeList.replaceChildren(el("li", { className: "empty", textContent: "条件に合う地震はありません。マグニチュードの下限を下げてみてください。" }));
    return;
  }

  quakeList.replaceChildren(...sorted.map((feature) => {
    const quake = quakeInfo(feature);
    const depth = Number.isFinite(quake.depth) ? ` · 深さ${Math.round(quake.depth)}km` : "";
    const button = el("button", { type: "button" },
      el("span", { className: `quake-mag ${magClass(quake.mag)}`, textContent: quake.mag.toFixed(1) }),
      el("span", {},
        el("span", { className: "quake-place", textContent: quake.place }),
        el("span", { className: "quake-meta" },
          `${relativeTime(quake.time)} · ${timeFormat.format(quake.time)}${depth}`,
          quake.tsunami ? el("span", { className: "quake-tsunami", textContent: "津波" }) : null),
      ),
    );
    button.addEventListener("click", () => focusQuake(feature.id));
    return el("li", {}, button);
  }));
}

function focusQuake(id) {
  const marker = state.markers.get(id);
  if (!marker) return;
  if (mobileQuery.matches) setListExpanded(false);
  if (clusterToggle.checked) {
    clusterLayer.zoomToShowLayer(marker, () => marker.openPopup());
  } else {
    map.setView(marker.getLatLng(), Math.max(map.getZoom(), 4));
    marker.openPopup();
  }
}

// Data loading
function setStatus({ loading = false, error = null } = {}) {
  refreshButton.disabled = loading;
  panel.querySelector(".status").classList.toggle("error", Boolean(error));
  if (loading && state.features.length === 0) summary.textContent = "読み込み中…";
  if (error) summary.textContent = "地震データを取得できませんでした。時間をおいて「更新」を押してください。";
}

function applyEntry(entry) {
  state.features = entry.features.filter((feature) => feature.geometry?.coordinates);
  state.markers = new Map(state.features.map((feature) => [feature.id, createMarker(feature)]));
  updated.textContent = `最終更新 ${timeFormat.format(entry.fetchedAt)}`;
  render();
}

async function loadPeriod(period, { force = false } = {}) {
  state.period = period;
  document.querySelectorAll("[data-period]").forEach((link) => link.setAttribute("aria-current", String(link.dataset.period === period)));

  const cached = cache.get(period);
  if (cached && !force && Date.now() - cached.fetchedAt < REFRESH_MS) {
    setStatus();
    applyEntry(cached);
    return;
  }

  const id = ++requestId;
  setStatus({ loading: true });
  try {
    const response = await fetch(FEEDS[period].url, { cache: "no-cache" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const data = await response.json();
    const entry = { features: data.features ?? [], fetchedAt: Date.now() };
    cache.set(period, entry);
    if (id !== requestId) return;
    setStatus();
    applyEntry(entry);
  } catch (error) {
    console.error("Error fetching earthquake data:", error);
    if (id === requestId) setStatus({ error });
  }
}

function refreshIfStale() {
  const cached = cache.get(state.period);
  if (!document.hidden && cached && Date.now() - cached.fetchedAt >= REFRESH_MS) loadPeriod(state.period, { force: true });
}

// UI events
let renderFrame = 0;
magnitudeInput.addEventListener("input", () => {
  state.minMag = Number(magnitudeInput.value);
  magnitudeValue.textContent = state.minMag.toFixed(1);
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(render);
});

clusterToggle.addEventListener("change", () => {
  map.removeLayer(clusterToggle.checked ? plainLayer : clusterLayer);
  activeLayer().addTo(map);
  render();
});

plateToggle.addEventListener("change", () => {
  if (plateToggle.checked) plateLayer.addTo(map);
  else map.removeLayer(plateLayer);
});

sortSelect.addEventListener("change", () => renderList(visibleFeatures()));
refreshButton.addEventListener("click", () => loadPeriod(state.period, { force: true }));
window.addEventListener("hashchange", () => loadPeriod(periodFromHash()));
document.addEventListener("visibilitychange", refreshIfStale);
setInterval(refreshIfStale, 60 * 1000);

function setListExpanded(expanded) {
  panel.classList.toggle("expanded", expanded);
  syncListToggle();
}

function syncListToggle() {
  listToggle.disabled = !mobileQuery.matches;
  listToggle.setAttribute("aria-expanded", String(!mobileQuery.matches || panel.classList.contains("expanded")));
}

listToggle.addEventListener("click", () => setListExpanded(!panel.classList.contains("expanded")));
mobileQuery.addEventListener("change", syncListToggle);
syncListToggle();

$("infoOpen").addEventListener("click", () => info.showModal());
info.addEventListener("click", (event) => {
  if (event.target !== info) return;
  const rect = info.getBoundingClientRect();
  const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  if (!inside) info.close();
});

const contactForm = $("contactForm");
const formStatus = $("formStatus");
contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = contactForm.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "送信しています…";
  formStatus.className = "form-status";
  formStatus.textContent = "";
  try {
    const response = await fetch(contactForm.action, { method: "POST", body: new FormData(contactForm), headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Form submission failed");
    contactForm.reset();
    formStatus.classList.add("success");
    formStatus.textContent = "お問い合わせを送信しました。ありがとうございます。";
  } catch {
    formStatus.classList.add("error");
    formStatus.textContent = "送信できませんでした。時間をおいて、もう一度お試しください。";
  } finally {
    button.disabled = false;
    button.textContent = "送信する";
  }
});

loadPeriod(state.period);
