/**
 * Titana — QA regression runner  (node >= 18, `npm i puppeteer`)
 * ---------------------------------------------------------------
 * ۱۲ مسیر کلیدی سایت را می‌پیماید، dataLayer را جمع می‌کند، و با
 * snippets/qa-validator.js می‌سنجد. در CI هفتگی اجرا شود (سند ۰۶ بند ۶.۲).
 *
 *   BASE=https://staging.titana.ir node snippets/qa-runner.js
 *   BASE=https://www.titana.ir node snippets/qa-runner.js --headed
 */
const QA = require("./qa-validator.js");

const BASE = process.env.BASE || "https://staging.titana.ir";
const HEADED = process.argv.includes("--headed");

/** مسیرهای پیمایش + رویداد(ها)ی که باید در آن مسیر دیده شوند */
const ROUTES = [
  { name: "home",                 path: "/",                                expect: ["titana_page_view"] },
  { name: "brand_listing",        path: "/search/avita-dental-implant-system/", expect: ["titana_page_view"] },
  { name: "category",             path: "/search/fixture/",                 expect: ["titana_page_view"] },
  { name: "filtered",             path: "/search/package/?ordertype=7&minprice=100000000&maxprice=300000000", expect: ["titana_page_view"] },
  { name: "product_detail",       path: "/product/626/",                    expect: ["titana_page_view", "titana_product_detail"] },
  { name: "variant",              path: "/model/626",                       expect: ["titana_page_view"] },
  { name: "cart_gate",            path: "/cart",                            expect: ["titana_login_gate_hit"] },
  { name: "login",                path: "/login",                           expect: ["titana_page_view"] },
  { name: "quick_order",          path: "/order",                           expect: ["titana_page_view"] },
  { name: "smart_order",          path: "/smartorder",                      expect: ["titana_page_view"] },
  { name: "custom_package",       path: "/customizedpackages/",            expect: ["titana_page_view"] },
  { name: "compare",              path: "/compare/brand",                  expect: ["titana_page_view"] },
  { name: "content_review",       path: "/implant-review/",                expect: ["titana_page_view"] },
  { name: "brand_content",        path: "/sic-implant/",                   expect: ["titana_page_view"] },
  { name: "faq",                  path: "/faq/",                            expect: ["titana_page_view"] },
  { name: "404",                  path: "/definitely-not-a-page-404/",      expect: ["titana_error_view"] }
];

/** تعامل‌هایی که باید رویداد بسازند (selectorها را با DOM واقعی کالیبره کنید) */
const INTERACTIONS = {
  "product_detail": [
    { act: async (p) => p.click("a[href*='/model/'], .variant-open").catch(() => {}), expect: "titana_variant_index" },
    { act: async (p) => p.click(CFG.downloadSel).catch(() => {}), expect: "titana_file_download" }
  ]
};
const CFG = { downloadSel: "a[href$='.pdf'], a[href$='.rar'], a[href$='.zip']" };

/** hook قبل از هر navigation: هر push را در یک آرایه ذخیره می‌کند */
const INIT_SCRIPT = `
  window.__dl = [];
  window.dataLayer = window.dataLayer || [];
  const _p = window.dataLayer.push.bind(window.dataLayer);
  window.dataLayer.push = function () { try { window.__dl.push(JSON.parse(JSON.stringify(arguments[0]))); } catch (e) { window.__dl.push({ event: String(arguments[0] && arguments[0].event), _serializable: false }); } return _p.apply(null, arguments); };
  // sessionStorage برای dedupe در چند navigation یک سشن خنثی شود
  try { sessionStorage.clear(); } catch (e) {}
`;

async function main() {
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({ headless: HEADED ? false : "new", args: ["--no-sandbox", "--lang=fa-IR"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.evaluateOnNewDocument(INIT_SCRIPT);

  const results = [];
  for (const r of ROUTES) {
    const url = BASE + r.path;
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
      await new Promise((res) => setTimeout(res, 1500));        // mouselisteners/modal render
      const pushes = await page.evaluate(() => window.__dl);

      // تعامل‌های این مسیر
      for (const it of (INTERACTIONS[r.name] || [])) {
        await it.act(page);
        await new Promise((res) => setTimeout(res, 900));
      }
      const all = await page.evaluate(() => window.__dl);
      const rep = QA.run(all);
      const names = all.map((x) => x && x.event).filter(Boolean);
      const missing = [...r.expect, ...((INTERACTIONS[r.name] || []).map((i) => i.expect))].filter((e) => !names.includes(e));

      results.push({
        route: r.name, url,
        pushes: all.length,
        qa_failed: rep.failed,
        missing_events: missing,
        errors: rep.issues.flatMap((i) => i.errors),
        warnings: rep.issues.flatMap((i) => i.warnings)
      });
      console.log(`${missing.length || rep.failed ? "✗" : "✓"} ${r.name.padEnd(18)} pushes=${String(all.length).padStart(3)} qa_fail=${rep.failed} missing=${missing.join(",") || "-"}`);
    } catch (e) {
      results.push({ route: r.name, url, error: String(e.message).slice(0, 200) });
      console.log(`✗ ${r.name.padEnd(18)} NAV ERROR ${String(e.message).slice(0, 120)}`);
    }
  }

  await browser.close();

  const fail = results.filter((x) => x.error || (x.missing_events && x.missing_events.length) || x.qa_failed);
  console.log("\n──────────────────────────────────────────");
  console.log(`routes: ${results.length} | failing: ${fail.length}`);
  if (fail.length) console.log(JSON.stringify(fail, null, 2));
  console.log("hint: برای دیدن payloadها --debug بگذارید و در مرورگر window.__dl را بررسی کنید");
  process.exit(fail.length ? 1 : 0);
}

if (require.main === module) main();
