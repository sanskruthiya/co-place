const map = L.map('map', {
    zoomControl: true,
    maxZoom: 5,
    minZoom: 1
}).setView([12.0000, 18.0000], 2);

const basemap_main = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                               {attribution: '<a href="https://earthquake.usgs.gov/earthquakes/">USGS</a>, &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',maxZoom: 5});

const mapBounds = [[90,-360],[-90,360]];
map.setMaxBounds(mapBounds)

//Simple country boundary setting for default mode
let offstats;

function offstats_style(feature){
    return{
        "fillColor": "transparent",
        "color": "white",
        "weight": 0,
    };
}

function highlightFeature_off(e){
    const stats_layer = e.target;
    stats_layer.setStyle({
                         "fillColor": "grey",
                         "color": "white",
                         "weight": 0,
                         "fillOpacity": 0.2
    })
 if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge){
    stats_layer.bringToFront();
 }
}

function resetHighlight_off(e){
    offstats.resetStyle(e.target);
}

function infoFeature_off(e){
    const stats_layer = e.target;
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge){
        stats_layer.bringToFront();
    }
}

function offstats_onEachFeature(feature, layer){
    if (L.Browser.mobile){
        layer.on({
                 click: infoFeature_off
                 });
    }else{
        layer.on({
                 mouseover: highlightFeature_off,
                 mouseout: resetHighlight_off
                 });
    };
    layer.bindTooltip('<p class="tipstyle04">'+feature.properties.d_Name_jp+'</p>',{className: 'tipstyle', sticky: 'true', direction:'bottom', offset:[0,20], opacity: 0.9});
}

offstats = new L.geoJson(json_country, {style: offstats_style, onEachFeature: offstats_onEachFeature})

//plate layer setting
function plate_style(feature){
    return{
        "fillColor": "transparent",
        "color": "white",
        "weight": 1,
    };
}
plate = new L.geoJson(json_plate, {style: plate_style})

// USGS Feed settings
const FEED_SETTINGS = {
    '#day': {
        text: '1日以内',
        url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson'
    },
    '#week': {
        text: '1週間以内',
        url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson'
    },
    '#month': {
        text: '1ヶ月以内',
        url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson'
    }
};

const defaultSettings = {
    text: '1週間以内',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson'
};

const currentSettings = FEED_SETTINGS[location.hash] || defaultSettings;
const Slider_text = currentSettings.text;
const FEED = currentSettings.url;

// Create magnitude slider
function createMagnitudeSlider() {
    const container = document.getElementById('slider-container');
    container.className = 'slider';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'slider-text';
    textSpan.textContent = `${Slider_text}の M `;
    
    const valueSpan = document.createElement('span');
    valueSpan.id = 'level_mg';
    valueSpan.textContent = '5.0';
    
    const textEndSpan = document.createElement('span');
    textEndSpan.textContent = ' 以上 の地震を表示';
    
    const sliderInput = document.createElement('input');
    sliderInput.type = 'range';
    sliderInput.className = 'custom-range';
    sliderInput.id = 'magnitude-slider';
    sliderInput.min = '4.5';
    sliderInput.max = '7.0';
    sliderInput.step = '0.1';
    sliderInput.value = '5.0';
    
    container.appendChild(textSpan);
    container.appendChild(valueSpan);
    container.appendChild(textEndSpan);
    container.appendChild(sliderInput);

    // Slider change event
    sliderInput.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        valueSpan.textContent = value.toFixed(1);
        mg_value = value;
        updateEarthquakes();
    });

    return container;
}

// Initialize magnitude slider
let mg_value = 5.0;
createMagnitudeSlider();

//Earthquale information using USGS Earthquakes Feed
const NOW = new Date();

const earthquakes_Marker = L.icon.pulse({iconSize:[18,18],fillColor:'rgba(144,200,50,0.8)',color:'green',heartbeat:1.5, animate:false});

function onEachFeature_earthquakes(feature, layer){
    const eq_datetime = new Date(feature.properties.time);//Locale Time
    const eq_year = eq_datetime.getFullYear();
    const eq_month = eq_datetime.getMonth() + 1;
    const eq_date = eq_datetime.getDate();
    const eq_hour = eq_datetime.getHours();
    const eq_min = eq_datetime.getMinutes();
    let tsunami_flag;
    if (feature.properties.tsunami==1){
        tsunami_flag="高";
    }else{
        tsunami_flag="低";
    }
    let info_status;
    if (feature.properties.status="reviewed"){
        info_status="確認済み";
    }else if(feature.properties.status="automatic"){
        info_status="未確認";
    }else{
        info_status=feature.properties.status;
    }

    const popupContent = `
      <style>
        .eq-table { border-collapse: collapse; width: 100%; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .eq-table th, .eq-table td { padding: 8px; border: 1px solid #ddd; }
        .eq-table th { background: #f5f5f5; font-weight: bold; width: 35%; }
        .eq-table tr:hover { background-color: #f9f9f9; }
        .eq-table a { color: #0078A8; text-decoration: none; }
        .eq-table a:hover { text-decoration: underline; }
      </style>
      <table class="eq-table">
        <tr><th>概要（リンク）</th><td><a href="${feature.properties.url}" target="_blank">${feature.properties.title}</a></td></tr>
        <tr><th>場所</th><td>${feature.properties.place}</td></tr>
        <tr><th>地震の規模</th><td>${feature.properties.mag}</td></tr>
        <tr><th>発生日</th><td>${eq_year}/${eq_month}/${eq_date}</td></tr>
        <tr><th>発生時刻</th><td>${eq_hour}時${eq_min}分頃（ユーザー標準時）</td></tr>
        <tr><th>津波発生リスク</th><td>${tsunami_flag}</td></tr>
        <tr><th>情報の確度</th><td>${info_status}</td></tr>
      </table>
    `;
    layer.bindPopup(popupContent, {
        autoPan: false,
        keepInView: false,
    });
}

function filter_earthquakes(feature, layer){
    return feature.properties.mag >= mg_value;
}

const cluster_earthquakes = new L.MarkerClusterGroup({
                                                   showCoverageOnHover: false,
                                                   maxClusterRadius: 55,
                                                   spiderfyDistanceMultiplier: 2
                                                   });

let earthquakes_layer;

async function fetchEarthquakeData() {
    try {
        const response = await fetch(FEED);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching earthquake data:', error);
        return null;
    }
}

async function updateEarthquakes() {
    const data = await fetchEarthquakeData();
    if (!data) return;

    earthquakes_layer = L.geoJSON(data, {
        filter: filter_earthquakes,
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, { icon: earthquakes_Marker });
        },
        onEachFeature: onEachFeature_earthquakes
    });

    cluster_earthquakes.clearLayers();
    cluster_earthquakes.addLayer(earthquakes_layer);
}

// Initial load
updateEarthquakes();

//Reload when hash-value changed
// Handle hash changes
window.addEventListener('hashchange', () => {
    location.reload();
});

// ドロップダウンメニューの制御
const periodToggle = document.getElementById('periodToggle');
const periodMenu = document.getElementById('periodMenu');

periodToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = periodToggle.getAttribute('aria-expanded') === 'true';
    periodToggle.setAttribute('aria-expanded', !isExpanded);
    periodMenu.classList.toggle('show');
});

// メニュー外クリックで閉じる
document.addEventListener('click', (e) => {
    if (!periodMenu.contains(e.target) && !periodToggle.contains(e.target)) {
        periodMenu.classList.remove('show');
        periodToggle.setAttribute('aria-expanded', 'false');
    }
});

// ESCキーでメニューを閉じる
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        periodMenu.classList.remove('show');
        periodToggle.setAttribute('aria-expanded', 'false');
    }
});

//Add default layers
cluster_earthquakes.addTo(map);
basemap_main.addTo(map);

if (!L.Browser.mobile) {
    offstats.addTo(map);
}

plate.addTo(map);



const slidemenutitle = '<h4 class="menu-main-title" align="center">World Earthquake Map</h4>';
let contents = '';
contents += '<p align="center">USGS(米国地質調査所)のデータを参照した<br>世界の地震リアルタイム観測マップです。</p><p align="center">直近〜１ヶ月以内に起こった<br>地震の規模（マグニチュード）4.5以上の<br>地震の情報を自動的に提供します。</p><p align="center">地図中の白線はプレート境界を示します。</p><p align="center">右上のスライダーを動かすことで<br>地震のマグニチュードのレベルに応じて<br>マップに表示する地震情報を調整できます。</p>'
contents += '<p align="center">また、ページ上部のボタンから観測期間を<br>1日・1週間・１ヶ月で設定できます。</p>'
contents += '<p align="center">記載内容や表現に問題等あれば<br>当サイト管理人まで下記のフォームから<br>お問い合わせください<br><a href="https://form.run/@party--1681740493" target="_blank">問い合わせフォーム（外部サービス）</a></p><hr>'
contents += '<table border="0" bordercolor="#999" cellpadding="5" cellspacing="0"><tr><td align="right" valign="top" width="100">参照ソース</td><td width="220"><a href="https://earthquake.usgs.gov" target="_blank">USGS Earthquake Hazard Program</a></td></tr><tr><td align="right" valign="top">フィード</td><td>USGS Earthquake Hazard Program, Real-time Feed, M4.5+ Earthquakes</td></tr><tr><td align="right" valign="top">プロパティ</td><td>概要（リンク）:[url], [title]<br>場所:[place]<br>地震の規模:[mag]<br>発生日・発生時刻:[time]<br>津波の発生リスク:[tsunami]<br> >>[tsunami]=1:高<br> >>[tsunami]=0:低<br>情報の確度:[status]<br> >>[status]=reviewed:確認済み<br> >>[status]=automatic:未確認</td></tr></table><hr>';
contents += '<p align="center" class="tipstyle02"> - created in July 2018, updated in April 2025 - </p>'

//Add zoomhome with text icon
const zoomHome = L.Control.zoomHome();
zoomHome.addTo(map);

//Add slidemenu with text icon
const slideMenu = L.control.slideMenu(slidemenutitle + contents, {
    width: '345px',
    position: 'topleft',
    menuposition: 'topleft'
});
slideMenu.addTo(map);

// Override the button contents
document.querySelector('.leaflet-control-zoomhome-home').innerHTML = '🌏';
document.querySelector('.leaflet-control-slidemenu a').innerHTML = 'i';

L.control.scale({maxWidth:150, metric:true, imperial:false, position:'bottomleft'}).addTo(map);
