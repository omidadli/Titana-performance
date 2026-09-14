/*!
 * Titana — dataLayer QA validator (v1.0.0)
 * اجرا در کنسول مرورگر (روی staging) یا در Node روی fixture:
 *   > TitanaQA.run()                       // بررسی همه‌ی pushهای این سشن
 *   > TitanaQA.watch()                     // زنده: هر push جدید را چک می‌کند
 *   node snippets/qa-validator.js fixtures/pushes.json
 * خروجی: جدول خطاها + نمره‌ی قبول/رد (سند ۰۶ بند ۶.۲)
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TitanaQA = factory();
})(typeof window !== "undefined" ? window : globalThis, function () {

  var REQUIRED = {
    titana_page_view: ["page.type", "page.path"],
    titana_product_detail: ["product.id", "product.availability"],
    titana_product_click: ["product_id"],
    titana_product_impression: ["items"],
    titana_add_to_cart: ["items"],
    titana_remove_from_cart: ["items"],
    titana_cart_view: ["basket"],
    titana_checkout_step: ["step"],
    titana_purchase: ["transaction_id", "value", "items", "currency"],
    titana_refund: ["transaction_id", "value"],
    titana_login_gate_hit: ["blocked_action"],
    titana_otp_send: ["method"],
    titana_otp_result: ["result"],
    titana_signup_success: ["role"],
    titana_profile_complete: ["implants_band"],
    titana_form_start: ["form.id"],
    titana_form_submit: ["form.id", "form.result"],
    titana_quote_request: ["product_id"],
    titana_file_download: ["doc_type"],
    titana_tool_view: ["tool.tool"],
    titana_tool_submit: ["tool", "final_toman"],
    titana_promo_view: ["promo.creative_id"],
    titana_promo_click: ["promo.creative_id"],
    titana_variant_select: ["product_id"],
    titana_video_progress: ["percent"],
    titana_chat_click: ["channel"],
    titana_error_view: ["error.code"]
  };

  var KNOWN = Object.keys(REQUIRED).concat([
    "titana_search_results", "titana_site_search", "titana_variant_index", "titana_variant_expand",
    "titana_callback_request", "titana_tool_row_edit", "titana_tool_row_copy", "titana_tool_total_change",
    "titana_compare_view", "titana_utm_missing", "titana_broken_link_click", "titana_scroll_depth",
    "titana_web_vitals", "titana_rage_click", "titana_dead_click", "titana_review_submit", "titana_rating_submit",
    "titana_newsletter_subscribe", "titana_referral_share", "titana_referral_landing", "titana_club_view",
    "titana_installment_view", "titana_credit_apply_submit", "titana_credit_approved", "titana_notify_me_submit",
    "titana_availability_view", "titana_pwa_prompt_show", "titana_pwa_prompt_accept", "titana_pwa_prompt_dismiss",
    "titana_content_share", "titana_schema_mismatch", "gtm.js", "gtm.load", "gtm.dom", "gtm.click", "gtm.linkClick"
  ]);

  var PII_KEY = /mobile|phone|national|license|system_?no|patient|iban|card_?no|birth|otp_?code|address|postal/i;
  var PII_VAL = /(^|\D)(0|\+98|98)?\s?9\d{2}[\s-]?\d{3}[\s-]?\d{3}(\D|$)|[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
  var GA4_NAME = /^[a-z][a-z0-9_]{0,39}$/;

  function get(o, p) { return p.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function set(o, p, v) { var ps = p.split("."), c = o; for (var i = 0; i < ps.length - 1; i++) { c[ps[i]] = c[ps[i]] || {}; c = c[ps[i]]; } c[ps[ps.length - 1]] = v; }
  function walk(o, f, path) {
    path = path || "";
    if (o == null || typeof o !== "object") return;
    Object.keys(o).forEach(function (k) {
      f(o[k], k, path + k, o);
      if (o[k] && typeof o[k] === "object") walk(o[k], f, path + k + ".");
    });
  }

  function check(ev, seen) {
    var errs = [], warns = [];
    if (!ev || typeof ev !== "object") return { errors: ["non-object push"], warnings: [] };
    var name = ev.event;
    if (!name) { if (typeof ev.ecommerce !== "object") errs.push("push without `event`"); return { errors: errs, warnings: warns }; }
    if (name.indexOf("gtm.") === 0) return { errors: [], warnings: [] };
    if (KNOWN.indexOf(name) === -1) errs.push("unknown event name (not in data/event-registry.csv): " + name);
    if (name.indexOf("titana_") !== 0) warns.push("event should start with titana_ (GTM routing depends on it): " + name);

    var ga4 = name.replace(/^titana_/, "");
    if (!GA4_NAME.test(ga4)) errs.push("invalid GA4 event name: " + ga4 + " (≤40 chars, ^[a-z][a-z0-9_]*$)");

    (REQUIRED[name] || []).forEach(function (p) {
      var v = get(ev, p);
      if (v === undefined || v === null || v === "") errs.push("missing required: " + p);
    });

    // PII
    walk(ev, function (v, k, p) {
      if (PII_KEY.test(k) && k !== "phone_valid") errs.push("PII-ish key: " + p);
      if (typeof v === "string" && PII_VAL.test(v)) errs.push("PII-ish value at " + p + " → " + v.slice(0, 12) + "…");
    });

    // پول
    var bad = [];
    walk(ev, function (v, k, p) {
      if (/_toman$|^value$|^price$|^tax$|^shipping$/i.test(k)) {
        if (typeof v === "string") bad.push(p + "='" + v + "' (string)");
        else if (typeof v === "number" && (isNaN(v) || v < 0)) bad.push(p + "=" + v);
        else if (typeof v === "number" && v === 0 && /price_toman$/.test(p)) bad.push(p + "=0 (should be null + price_undisclosed)");
      }
      if (v === "null" || v === "undefined") bad.push(p + " is string-" + v);
    });
    if (bad.length) errs.push("numeric integrity: " + bad.join(", "));

    if (ev.value !== undefined && ev.currency && ev.currency === "IRR" && typeof ev.value === "number" && ev.value > 0 && ev.value < 100000) {
      warns.push("value looks like Toman not Rial (×10000 expected): " + ev.value);
    }
    if (ev.items && ev.items.length && (ev.value === undefined)) warns.push("items sent without `value` — GA4 revenue will be 0");
    if (ev.items && typeof ev.items.length === "number" && ev.items.length > 50) errs.push("items[] > 50 (GA4 truncation risk)");

    // dedupe
    if (seen) {
      var key = name + "|" + (ev.transaction_id || (ev.product && ev.product.id) || "");
      if (name === "titana_purchase" && seen[key]) errs.push("duplicate purchase push for " + ev.transaction_id);
      if ((name === "titana_page_view" || name === "titana_product_detail") && seen[key] && seen[key] + 1500 > Date.now())
        warns.push("duplicate " + name + " within 1.5s (modal re-render?)");
      seen[key] = Date.now();
    }
    return { errors: errs, warnings: warns };
  }

  function run(dl) {
    dl = dl || (root && root.dataLayer) || [];
    var seen = {}, out = [], evts = [];
    dl.forEach(function (o, i) {
      var r = check(o, seen);
      evts.push(o.event || "(no event)");
      if (r.errors.length || r.warnings.length) out.push({ index: i, event: o.event, errors: r.errors, warnings: r.warnings, payload: o });
    });
    var report = {
      total_pushes: dl.length,
      titana_events: evts.filter(function (e) { return e.indexOf("titana_") === 0; }).length,
      failed: out.length,
      coverage: evts.filter(function (e) { return e.indexOf("titana_") === 0; }).length + "/" + Object.keys(REQUIRED).length + " registered events",
      issues: out
    };
    if (console.table) console[report.failed ? "warn" : "info"]("Titana QA:", report.total_pushes, "pushes,", report.failed, "problematic");
    if (report.failed) console.table(report.issues.map(function (x) { return { index: x.index, event: x.event, errors: x.errors.join(" | "), warnings: x.warnings.join(" | ") }; }));
    return report;
  }

  function watch() {
    var orig = (root.dataLayer = root.dataLayer || []).push.bind(root.dataLayer);
    root.dataLayer.push = function () {
      var r = check(arguments[0], watch._seen || (watch._seen = {}));
      if (r.errors.length) console.error("❌ TitanaQA", arguments[0].event, r.errors, arguments[0]);
      else if (r.warnings.length) console.warn("⚠ TitanaQA", arguments[0].event, r.warnings);
      else console.log("✅ TitanaQA", arguments[0].event);
      return orig.apply(null, arguments);
    };
    console.log("TitanaQA watching dataLayer…");
  }

  return { run: run, watch: watch, check: check, REQUIRED: REQUIRED, KNOWN: KNOWN };
});

/* CLI: node snippets/qa-validator.js fixtures/pushes.json */
if (typeof require === "function" && module && require.main === module) {
  var fs = require("fs");
  var arr = JSON.parse(fs.readFileSync(process.argv[2] || "/dev/stdin", "utf8"));
  var rep = module.exports.run(Array.isArray(arr) ? arr : arr.dataLayer || []);
  console.log(JSON.stringify({ total: rep.total_pushes, failed: rep.failed }, null, 2));
  process.exit(rep.failed > 0 ? 1 : 0);
}
