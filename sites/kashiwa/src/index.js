const REDIRECTS = {
  "/cmap/ta-jc": "/tamap",
  "/cmap/ta-jc/": "/tamap/",
  "/cmap/ta-en": "/tamap-en",
  "/cmap/ta-en/": "/tamap-en/",
  "/cmap/piyomiru": "/piyomiru",
  "/cmap/piyomiru/": "/piyomiru/",
  "/cmap/terminator": "/chronoglobe",
  "/cmap/terminator/": "/chronoglobe/",
  "/cmap/tsukuba": "/tsukuba",
  "/cmap/tsukuba/": "/tsukuba/",
};

function redirectTarget(pathname) {
  return REDIRECTS[pathname] ?? null;
}

function isR2Path(pathname) {
  return pathname.endsWith(".pmtiles");
}

function applyRangeHeaders(headers, object) {
  if (!object.range) return 200;

  let start;
  let length;

  if (object.range.suffix !== undefined) {
    length = Math.min(object.range.suffix, object.size);
    start = object.size - length;
  } else {
    start = object.range.offset ?? 0;
    length = object.range.length ?? object.size - start;
  }

  headers.set("content-range", `bytes ${start}-${start + length - 1}/${object.size}`);
  headers.set("content-length", String(length));
  return 206;
}

async function serveR2(request, env, pathname) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: "GET, HEAD" },
    });
  }

  const key = pathname.slice(1);

  if (request.method === "HEAD") {
    const object = await env.PMTILES.head(key);
    if (!object) return null;

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("accept-ranges", "bytes");
    headers.set("cache-control", headers.get("cache-control") ?? "public, max-age=3600");
    headers.set("content-length", String(object.size));
    headers.set("content-type", headers.get("content-type") ?? "application/vnd.pmtiles");
    headers.set("etag", object.httpEtag);
    return new Response(null, { status: 200, headers });
  }

  const object = await env.PMTILES.get(key, { range: request.headers });
  if (!object) return null;

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", headers.get("cache-control") ?? "public, max-age=3600");
  headers.set("content-type", headers.get("content-type") ?? "application/vnd.pmtiles");
  headers.set("etag", object.httpEtag);
  const status = applyRangeHeaders(headers, object);

  return new Response(object.body, { status, headers });
}

async function serveNotFound(request, env) {
  const url = new URL(request.url);
  url.pathname = "/404.html";
  url.search = "";

  const page = await env.ASSETS.fetch(new Request(url, { method: "GET" }));
  const headers = new Headers(page.headers);
  headers.set("cache-control", "no-store");

  return new Response(request.method === "HEAD" ? null : page.body, {
    status: 404,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const target = redirectTarget(url.pathname);

    if (target) {
      return Response.redirect(`${url.origin}${target}`, 301);
    }

    if (isR2Path(url.pathname)) {
      const response = await serveR2(request, env, url.pathname);
      if (response) return response;
      return serveNotFound(request, env);
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    return serveNotFound(request, env);
  },
};
