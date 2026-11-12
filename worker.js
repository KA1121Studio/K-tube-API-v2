// worker.js
// Cloudflare Workers 版 K-Tube API
// list.js と video.js の API リストを統合し、/api/list と /api/video を提供する

const APIS = [
  // ── video.js 由来（先頭の yt-comp5 を含む）──
  "https://yt-comp5.chocolatemoo53.com",
  "https://nyc1.iv.ggtyler.dev",
  "https://invid-api.poketube.fun",
  "https://cal1.iv.ggtyler.dev",
  "https://invidious.nikkosphere.com",
  "https://lekker.gay",
  "https://invidious.f5.si",
  "https://inv.nadeko.net",
  "https://invidious.ritoge.com",
  "https://invidious.ducks.party",
  "https://super8.absturztau.be",
  "https://invidious.darkness.services",
  "https://yt.omada.cafe",
  "https://iv.melmac.space",
  "https://iv.duti.dev",
  "https://invidious.schenkel.eti.br",
  "https://invidious.nerdvpn.de",
  "https://invidious.privacydev.net",
  "https://yt.chocolatemoo53.com",
  "https://invidious.tiekoetter.com",
  "https://iv.ggtyler.dev",
  "https://invidious.perennialte.ch",
  "https://invidious.jing.rocks",
  "https://yewtu.be",
  "https://invidious.private.coffee",
  "https://invidious.slipfox.xyz",
  "https://invidious.protokolla.fi",
  "https://inv.tux.pizza",
  "https://invidious.lunar.icu",
  "https://invidious.no-logs.com",
  "https://invidious.zapashcanon.fr",
  "https://invidious.dhusch.de",
  "https://invidious.reallyaweso.me",
  "https://invidious.kavin.rocks",
  "https://vid.puffyan.us",
  "https://invidious.snopyta.org",
  "https://invidious.xyz",
  "https://inv.zzls.xyz",
  "https://invidious.fdn.fr",
  "https://invidious.flokinet.to",
  "https://invidious.materialio.us",
  "https://iv.catgirl.cloud",
  "https://inv.kamuridesu.com",
  "https://inv.thepixora.com",
  "https://inv.eu.projectsegfau.lt",
  "https://inv.bp.projectsegfau.lt",
  "https://inv.perditum.com",
  "https://redirect.invidious.io",
  "https://iteroni.com",
  "https://inv.jp.projectsegfau.lt",
  "https://inv.sg.projectsegfau.lt",
  "https://inv.ca.projectsegfau.lt",
  "https://inv.de.projectsegfau.lt",
  "https://usa-proxy2.poketube.fun",
  "https://invidious.nietzospannend.nl",
  "https://inv7.nadeko.net",
  "https://inv6.nadeko.net",
  "https://inv8.nadeko.net",
  "https://inv9.nadeko.net",
  "https://invidious.io.lol",
  "https://cuddly.tube",
  "https://invidious.einfachzocken.eu",
  "https://y.com.sb",
  "https://invidious.epicsite.xyz",
  "https://inv1.nadeko.net",
  "https://inv2.nadeko.net",
  "https://inv3.nadeko.net",
  "https://inv4.nadeko.net",
  "https://inv5.nadeko.net",
  "https://yt.cdsp.cz",
  "https://invidious.projectsegfau.lt",
  "https://invidious.domain.glass",
  "https://clips.im.allmendenetz.de",
  "https://i.oyster.men",
  "https://youtube.vpn-home-net.de",
  "https://toob.unternet.org",
  "https://inv.antopie.org",
  "https://invidious.weblibre.org",
  "https://inv.in.projectsegfau.lt",
  "https://invidious-us.kavin.rocks",
  "https://invidious.zee.li",
  "https://tube.connect.cafe",
  "https://invidious.privacy.gd",
  "https://eu-proxy.poketube.fun",
  "https://inv.riverside.rocks",
  "https://invidious.site",
  "https://yt.artemislena.eu",
  "https://adminforge.de",
  "https://invidious.chunboan.zone",
  "https://invidious.vpsburti.com",
  "https://youtube.notrack.ch",
  "https://invidious.poast.org",
  "https://invidious.drivet.xyz",
  "https://video.weiler.rocks",
  "https://yt.beparanoid.de",
  "https://youtube.it-service-schopfheim.de",
  "https://monocles.live",
  "https://test.invidious.io",
  "https://inv.us.projectsegfau.lt",
  "https://invidious.rndsh.it",
  "https://invidious.pussthecat.org",
  "https://youtube.lurkmore.com",
  "https://invidious.palejev.dscloud.me",
  "https://invidious.zecircle.xyz",
  "https://inv.owo.si",
  "https://inv.pistasjis.net",
  "https://onion.tube",
  "https://invidious.qwik.space",
  "https://hyperpipe.surge.sh",
  "https://inv.frail.duckdns.org",
  "https://invidious.notraxx.ch",
  "https://youtube.mosesmang.com",
  "https://inv.zoomerville.com",
  "https://id.420129.xyz",
  "https://invidious.0011.lt",
  "https://invidious.adminforge.de",
  "https://invidious.esmailelbob.xyz",
  "https://invidious.lunivers.trade",
  "https://iv.datura.network",
  "https://pol1.iv.ggtyler.dev",
  "https://invidious.drgns.space",
  "https://invidious.mutahar.rocks",
  "https://invidious.privacyredirect.com",
  "https://invidious.catspeed.cc",
  "https://youtube.076.ne.jp"
];

// ── 重複除去 + 定数 ──
const UNIQUE_APIS = [...new Set(APIS)];
const MAX_CANDIDATES = 25;  // 同時に叩く最大数
const TIMEOUT_MS = 6000;    // 各リクエストのタイムアウト

// CORS 用共通ヘッダー
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*"
};

// JSON レスポンス生成ヘルパー
function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
      ...extraHeaders
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── CORS プリフライト ──
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // ── /api/list ──
    if (url.pathname === "/api/list") {
      return jsonResponse(
        {
          count: UNIQUE_APIS.length,
          total: APIS.length,
          apis: UNIQUE_APIS
        },
        200,
        { "Cache-Control": "public, max-age=3600" }
      );
    }

    // ── /api/video ──
    if (url.pathname === "/api/video") {
      const videoId = url.searchParams.get("v");
      if (!videoId) {
        return jsonResponse({ error: "video id required" }, 400);
      }

      // ランダムに並べ替えて、毎回同じAPIに偏らないようにする
      const shuffled = [...UNIQUE_APIS].sort(() => Math.random() - 0.5);
      const candidates = shuffled.slice(0, MAX_CANDIDATES);

      const promises = candidates.map((api) => {
        const target = `${api}/api/v1/videos/${videoId}`;
        return fetch(target, {
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; K-tube/1.0)"
          },
          signal: AbortSignal.timeout(TIMEOUT_MS)
        }).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        });
      });

      try {
        const data = await Promise.any(promises);
        return jsonResponse(data, 200, { "Cache-Control": "public, max-age=300" });
      } catch {
        return jsonResponse({ error: "all apis failed" }, 500);
      }
    }

    // ── それ以外は静的アセット（public/）を返す ──
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  }
};
