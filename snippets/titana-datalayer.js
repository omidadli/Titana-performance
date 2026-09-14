/*!
 * Titana Data Layer shim — v1.0.0
 * -------------------------------------------------------------
 * هدف: وقتی دسترسی به قالب/بک‌اند برای تزریق مستقیم dataLayer محدود است (مسیر B در سند ۰۳ بند ۳.۸)،
 * همین فایل همان «قرارداد داده» را از URL + DOM + رویدادهای شبکه استخراج و به dataLayer می‌فرستد.
 *
 * ⚑ محدودیت صریح: رویدادهای purchase / refund / مقدار نهایی سبد نباید از DOM بیایند.
 *    برای آن‌ها window.TitanaDL.pushServerEvent(...) را از سمت سرور/قالب صدا بزنید.
 *
 * نصب: دقیقاً بعد از <head> snippet گوگل تگ منیجر، یا در «کد سفارشی هدر» فروشگاه‌ساز.
 * همه‌ی selectorها را در CFG بگذارید و با DevTools روی سایت واقعی کالیبره کنید (سند ۰۶).
 */
(function () {
  "use strict";
  if (window.__TITANA_DL_LOADED__) return;            // idempotent — هرگز دو بار اجرا نشود
  window.__TITANA_DL_LOADED__ = true;

  var VERSION = "1.0.0";
  var RTL_NUM = /[۰-۹٠-٩]/g;

  /* ───────────────────────── 0) CONFIG: تنها جایی که باید دست بزنید ───────────────────────── */
  var CFG = {
    version: VERSION,
    env: (location.hostname.indexOf("staging") > -1 || location.hostname.indexOf("localhost") > -1) ? "staging" : "prod",
    sample: { impressions: 0.1, promos: 0.25, ux: 0.2 },       // نرخ نمونه‌برداری → GA4 (sGTM/BQ همیشه ۱۰۰٪)
    consent: { key: "titana_consent_v1", analytics: true },    // اگر بنر ندارید: analytics=true
    salt: "TITANA_DL_SALT_v1",                                  // ⚠ فقط برای hash؛ مقدار واقعی را در ریپو نگه ندارید
    maxItems: 50,
    selectors: {
      // لیست/کارت محصول
      productCard: "a[href*='/product/']",
      // دکمه‌ی افزودن به سبد / «انتخاب سایز و خرید»
      addToCart: "button.add-to-cart, a.add-to-cart, [data-action='add-to-cart'], .basket-add, form[name*=basket] button[type=submit]",
      openVariant: "a[href*='/model/'], [data-open-variant]",
      // تغییرات تنوع
      variantSelect: "select[name*=diameter], select[name*=length], select[name*=size], select[name*=platform], select[name*=varient], select[name*=variant]",
      qtyInput: "input[name*=count], input[name*=qty], input[name*=quantity], input[type=number]",
      // مودال/بنر
      slider: "[class*=slider] a[href], .swiper-slide a[href], [id*=Slider] a[href]",
      chatWidget: "a[href^='wa.me'], a[href*='whatsapp.com'], a[href^='t.me/'], a[href^='ble.ir/'], .support a, .chat a",
      phone: "a[href^='tel:']",
      download: "a[href$='.pdf'], a[href$='.rar'], a[href$='.zip'], a[href$='.7z'], a[href$='.dme'], a[href*='/MyFiles/']",
      // فرم‌ها
      forms: "form",
      // قیف هویت
      authForm: "form[action*='login'], form[action*='Login'], #loginForm, .login-form",
      loginGateModal: ".login-required, #loginModal, .modal-login, [class*=loginModal]",
      // مودال قفل‌شده «ابتدا وارد سایت شوید»
      gateText: /ابتدا\s*وارد|برای دسترسی به این قسمت|ورود\s*\|\s*ثبت\s*نام/,
      // سفارش سریع / پکیج‌ساز
      quickOrder: "#quickOrder, .quick-order, form[action*='order']",
      quickOrderRow: "#quickOrder tbody tr, .quick-order tbody tr",
      cartBadge: ".cart-count, #cartCount, a[href$='/cart'] .count"
    },
    serverBridge: {                            // اگر فنی خواست مستقیم بفرستد (مسیر A)
      metaJsonId: "titana-data"                // <script type="application/json" id="titana-data">{...}</script>
    }
  };

  /* ───────────────────────── 1) Utils ───────────────────────── */
  function fa2en(s) {
    return String(s == null ? "" : s).replace(RTL_NUM, function (c) {
      var i = "۰۱۲۳۴۵۶۷۸۹".indexOf(c); if (i > -1) return String(i);
      i = "٠١٢٣٤٥٦٧٨٩".indexOf(c); return i > -1 ? String(i) : c;
    });
  }
  function toNum(v) {
    if (v == null) return null;
    if (typeof v === "number") return isFinite(v) ? v : null;
    var s = fa2en(v).replace(/[^\d.\-]/g, "");       // جداکننده هزارگان، «تومان»، فاصله، نیم‌فاصله
    if (!s || s === "-" || s === ".") return null;
    var n = Number(s);
    return isFinite(n) ? n : null;
  }
  function toText(el) { return el ? fa2en((el.textContent || "").replace(/\s+/g, " ")).trim() : ""; }
  function closest(el, sel) { while (el && el !== document) { if (el.matches && el.matches(sel)) return el; el = el.parentNode; } return null; }
  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }
  function throttle(fn, ms) { var last = 0; return function () { var now = +new Date(); if (now - last >= ms) { last = now; fn.apply(this, arguments); } }; }
  function once(key) { try { var k = "__once_" + key; if (sessionStorage.getItem(k)) return false; sessionStorage.setItem(k, "1"); return true; } catch (e) { return true; } }
  function oncePer(key, val) { try { var k = "__once_" + key; if (sessionStorage.getItem(k) === String(val)) return false; sessionStorage.setItem(k, String(val)); return true; } catch (e) { return true; } }
  function sampled(rate) { return Math.random() < rate; }
  function hash(str) {                                            // sha256 (async fallback: fnv)
    try {
      if (window.crypto && crypto.subtle && TextEncoder) {
        return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (buf) {
          return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
        });
      }
    } catch (e) { }
    return Promise.resolve(fnv1a(str));
  }
  function fnv1a(s) { var h = 0x811c9dc5; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0; } return "fnv" + h.toString(16); }
  function hasPII(obj) {
    var bad = /mobile|phone|national|license|system_no|address|postal|patient|iban|card_?no|birth|otp_?code/i;
    var hit = [];
    (function walk(o, path) {
      if (!o || typeof o !== "object") return;
      Object.keys(o).forEach(function (k) {
        if (bad.test(k)) hit.push(path + k);
        else if (typeof o[k] === "string" && /^0?9\d{9}$/.test(fa2en(o[k]).replace(/\s/g, ""))) hit.push(path + k + "(value:phone)");
        else if (o[k] && typeof o[k] === "object") walk(o[k], path + k + ".");
      });
    })(obj, "");
    return hit;
  }

  /* ───────────────────────── 2) Core state + push ───────────────────────── */
  var T = window.titana = window.titana || {};
  T.version = CFG.version; T.env = CFG.env;
  window.dataLayer = window.dataLayer || [];

  function readMetaJson() {                                    // مسیر A: island از سرور
    var el = document.getElementById(CFG.serverBridge.metaJsonId);
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (e) { return null; }
  }
  function mergeServer() {
    var s = readMetaJson();
    if (!s) return false;
    Object.keys(s).forEach(function (k) { T[k] = (T[k] && typeof T[k] === "object" && !Array.isArray(T[k])) ? Object.assign({}, s[k], T[k]) : s[k]; });
    if (T.page) T.page.source = "server";
    return true;
  }

  function push(eventName, payload) {
    payload = payload || {};
    var ev = { event: eventName, dl_ver: CFG.version, dl_source: (T.page && T.page.source) || "dom", env: CFG.env };
    if (T.page) ev.page = T.page;
    if (T.user && T.user.uid_hash) ev.user = T.user;
    ["product", "items", "basket", "order", "search", "promo", "tool", "form", "content", "loyalty", "credit", "error"].forEach(function (k) {
      if (payload[k] !== undefined) ev[k] = payload[k];
    });
    Object.keys(payload).forEach(function (k) { if (ev[k] === undefined) ev[k] = payload[k]; });

    var leak = hasPII(ev);                                     // خط قرمز سند ۰۱ بند ۱.۱۰
    if (leak.length) {
      if (window.console) console.warn("[TitanaDL] blocked PII-ish keys:", leak, eventName);
      leak.forEach(function (p) { var o = ev; p.replace(/\(.*\)$/, "").split(".").slice(0, -1).forEach(function (k) { o = o && o[k]; }); if (o) delete o[p.split(".").pop().replace(/\(.*\)$/, "")]; });
    }
    window.dataLayer.push(ev);
    if (window.__TITANA_DEBUG__) (console.info || console.log).call(console, "[TitanaDL]", eventName, ev);
    return ev;
  }
  T.push = push;                                    // API عمومی
  T.set = function (path, value) {                  // TitanaDL.set('user.role','dentist')
    var parts = path.split("."), o = T;
    for (var i = 0; i < parts.length - 1; i++) { o[parts[i]] = o[parts[i]] || {}; o = o[parts[i]]; }
    o[parts[parts.length - 1]] = value;
  };
  /** فراخوانی از سمت سرور/قالب برای رویدادهای حساس (purchase/refund/cart) */
  T.pushServerEvent = function (eventName, payload) { payload = payload || {}; payload.dl_source = "server"; push(eventName, payload); };

  /* ───────────────────────── 3) Page + identity ───────────────────────── */
  var BRAND_SLUG_RX = /\/(?:search|package)\/([a-z0-9\-]+?)-(?:dental-implant-system|implant-package)\//;

  function detectPageType(p) {
    if (/^\/$/.test(p)) return "home";
    if (/^\/product\/\d+/.test(p)) return "product_detail";
    if (/^\/model\/\d+/.test(p)) return "variant_selection";
    if (/^\/cart\b/.test(p) || /^\/basket\b/.test(p)) return "basket";
    if (/checkout|payment/i.test(p)) return "checkout_step";
    if (/confirm|thankyou|order-complete|\/order\/(success|done)/i.test(p)) return "purchase_confirmation";
    if (/^\/login\b|^\/register\b/.test(p)) return "auth_gate";
    if (/^\/order\/customizedpackage|^\/customizedpackages/.test(p)) return "tool_custom_package";
    if (/^\/order\b/.test(p)) return "tool_quick_order";
    if (/^\/smartorder/.test(p)) return "tool_smart_order";
    if (/^\/compare/.test(p)) return "tool_compare";
    if (/^\/implant-review/.test(p)) return "content_review";
    if (/^\/(faq|aboutus|contact-us|userreferral|affiliate|termsandconditions|form)\b/.test(p)) return "other";
    if (/^\/club|club\.titana\.ir/.test(location.host + p)) return "club";
    if (/leasing|installment|اقساط/.test(p)) return "finance";
    if (/^\/search\/(package|fixture|prosthesis|kit|healingcoverscrew|scan-body|lab-analog|digital-analog|impression)/.test(p)) {
      return /package/.test(p) ? "package_listing" : "category_listing";
    }
    if (BRAND_SLUG_RX.test(p)) return "brand_listing";
    if (/^\/search/.test(p)) return "category_listing";
    if (/404|خطا/.test(document.title || "")) return "error";
    return "other";
  }

  function buildPage() {
    var p = location.pathname;
    var q = new URLSearchParams(location.search);
    var brandMatch = p.match(BRAND_SLUG_RX);
    var bug = /\{\s*[A-Za-z_][A-Za-z0-9_]*\s*\}/.test(document.body ? document.body.innerText.slice(0, 6000) : "");
    T.page = Object.assign({
      id: detectPageType(p),
      type: detectPageType(p),
      title: (document.title || "").trim(),
      url: location.href,
      path: p,
      brand_slug: brandMatch ? brandMatch[1] : null,
      logged_in: detectLoggedIn(),
      currency: "IRR", locale: "fa-IR", rtl: true,
      source: "dom",
      template_bug: bug
    }, T.page || {});
    if (q.get("minprice") || q.get("maxprice")) {
      T.search = T.search || {};
      T.search.price_range = { min_toman: toNum(q.get("minprice")), max_toman: toNum(q.get("maxprice")) };
      T.search.sort = sortFromParams(q);
      T.search.page_no = toNum(q.get("Page")) || 1;
      T.search.items_per_page = toNum(q.get("itemperpage"));
    }
  }
  function sortFromParams(q) {
    var map = { "0": "price_asc", "1": "price_desc", "2": "best_selling", "3": "newest", "4": "popular", "5": "special_offer" };
    return map[q.get("ordertype")] || map[q.get("sorttype")] || "unknown";
  }
  function detectLoggedIn() {
    if (T.user && T.user.uid_hash) return true;
    return /\/(logout|dashboard|profile|orders)\b/.test(location.pathname) || !!document.querySelector("[data-logged-in], .user-menu");
  }

  /** خواندن پروفایل از کوکی اول‌طرف/متا که فنی می‌نویسد (نه از DOM کاربر) */
  function readIdentity() {
    try {
      var raw = document.cookie.match(/(?:^|;\s*)titana_profile=([^;]+)/);
      if (!raw) return;
      var j = JSON.parse(decodeURIComponent(raw[1]));            // {"r":"dentist","c":"تهران","ib":"16-30","t":"silver","h":"<sha>"}
      T.user = Object.assign({}, T.user, {
        uid_hash: j.h || null, role: j.r || "unknown", city: j.c || null,
        implants_band: j.ib || "unknown", club_tier: j.t || "none",
        verification_state: j.v || "unknown", org_type: j.o || "unknown"
      });
    } catch (e) { }
  }

  /* ───────────────────────── 4) Product extraction (PDP) ───────────────────────── */
  function extractProduct() {
    var pid = (location.pathname.match(/\/(?:product|model)\/(\d+)/) || [])[1];
    if (!pid) return T.product || null;
    var body = document.body ? document.body.innerText : "";
    var h1 = toText(document.querySelector("h1"));
    var priceEl = document.querySelector("[class*=price], .product-price, .price");
    var priceTxt = toText(priceEl);
    var price = toNum((priceTxt.match(/([\d.,۰-۹٠-٩]+)\s*تومان/) || [])[1]);
    var stock = toNum((body.match(/([\d.,۰-۹٠-٩]+)\s*واحد\s*در\s*انبار/) || [])[1]);
    var avail = /ناموجود/.test(body) ? "out_of_stock" : /در حال تامین/.test(body) ? "sourcing" : "in_stock";
    var brandImg = document.querySelector("img[src*='/FieldOptions/']");
    var brandId = brandImg ? toNum((brandImg.src.match(/\/FieldOptions\/(\d+)\//) || [])[1]) : null;
    var disc = toNum((body.match(/(\d+)\s*%/) || [])[1]);
    var doc = function (rx) { return rx.test(body); };
    T.product = Object.assign({
      id: Number(pid),
      name: h1 || document.title.replace(/\s*\|\s*تیتانا.*$/, ""),
      price_toman: (price === 0 || price === null) ? null : price,
      price_undisclosed: (price === 0 || price === null),
      availability: avail,
      stock_units: stock,
      installment_eligible: /اقساطی/.test(body),
      discount_pct: disc,
      is_package: /پکیج/.test(h1),
      brand: { id: brandId, slug: T.page ? T.page.brand_slug : null },
      system_id: T.page && T.page.brand_slug ? T.page.brand_slug : null,
      product_family: familyFromBody(h1),
      documents: extractDocs()
    }, T.product || {});
    return T.product;

    function familyFromBody(n) {
      if (/پکیج/.test(n)) return "package";
      if (/هیلینگ|کاور\s*اسکرو/.test(n)) return "healing_cover_screw";
      if (/اباتمنت|اتچمنت/.test(n)) return "prosthesis";
      if (/کیت/.test(n)) return "kit";
      if (/اسکن\s*بادی/i.test(n)) return "scan_body";
      if (/آنالوگ/.test(n)) return /دیجیتال/.test(n) ? "digital_analog" : "lab_analog";
      if (/ایمپرشن|کوپینگ/.test(n)) return "impression_coping";
      if (/موتور|آنگل/.test(n)) return "implant_motor";
      if (/فیکسچر|ایمپلنت/.test(n)) return "fixture";
      return "other";
    }
    function extractDocs() {
      var out = [];
      Array.prototype.forEach.call(document.querySelectorAll(CFG.selectors.download), function (a) {
        var t = toText(a) + " " + a.getAttribute("href");
        var type = /catalog|کاتالوگ/i.test(t) ? "catalog" :
          /exocad|اگزوکد|digital.?workflow/i.test(t) ? "exocad_library" :
            /tresoft|تری\s*شیپ/i.test(t) ? "tresoft_library" :
              /failure|فیلر/i.test(t) ? "failure_form" :
                /price|لیست\s*قیمت/i.test(t) ? "pricelist" : "other";
        out.push({ type: type, url: a.href, ext: (a.href.match(/\.(\w{2,4})(\?|$)/) || [])[1] || null });
      });
      return out.slice(0, 12);
    }
  }

  /* ───────────────────────── 5) Basket / cart helpers ───────────────────────── */
  function readCartBadge() { var el = document.querySelector(CFG.selectors.cartBadge); return el ? toNum(el.textContent) : null; }
  function readBasketFromDom() {
    var lines = [], rows = document.querySelectorAll(".cart-item, .basket-item, [data-cart-line], table.cart tbody tr");
    Array.prototype.forEach.call(rows, function (r, i) {
      var a = r.querySelector("a[href*='/product/']");
      var pid = a ? toNum((a.href.match(/\/product\/(\d+)/) || [])[1]) : null;
      lines.push({
        product_id: pid, item_name: toText(a).slice(0, 100), index: i,
        price_toman: toNum((toText(r.querySelector("[class*=price]")).match(/([\d.,۰-۹٠-٩]+)/) || [])[1]),
        quantity: toNum((r.querySelector("input[type=number]") || {}).value) || 1
      });
    });
    return lines;
  }

  /* ───────────────────────── 6) Event wiring ───────────────────────── */
  var consentOk = true;
  try { consentOk = !localStorage.getItem(CFG.consent.key) ? CFG.consent.analytics : (function () { var j = JSON.parse(localStorage.getItem(CFG.consent.key) || "{}"); return j.analytics !== false; })(); } catch (e) { }
  if (!consentOk) return;                                        // بدون اجازه، هیچ push ای انجام نمی‌شود

  function init() {
    mergeServer();
    readIdentity();
    buildPage();
    var isPDP = T.page.type === "product_detail" || T.page.type === "variant_selection";
    if (isPDP) extractProduct();

    push("titana_page_view", {
      page_type: T.page.type, page_path: T.page.path, logged_in: T.page.logged_in,
      brand_slug: T.page.brand_slug,
      items: isPDP && T.product ? [{ product_id: T.product.id, item_name: T.product.name, price_toman: T.product.price_toman, quantity: 1, brand_id: T.product.brand && T.product.brand.id, index: 0 }] : undefined,
      value: isPDP && T.product && T.product.price_toman ? T.product.price_toman * 10000 : undefined
    });
    if (isPDP) push("titana_product_detail", { product: T.product });
    if (T.page.type === "basket") push("titana_cart_view", { basket: { value_toman: 0, line_count: 0, items_count: readCartBadge() } });
    if (/(^|&)utm_source=|utm_source=/.test(location.search) === false && document.referrer && document.referrer.indexOf(location.host) === -1 && !sessionStorage.getItem("__utm_reported")) {
      sessionStorage.setItem("__utm_reported", "1");
      push("titana_utm_missing", { referral: document.referrer.slice(0, 150), path: location.pathname });
    }
    if (/(404|not found|خطا)/i.test(document.title || "") || T.page.type === "error") push("titana_error_view", { error: { code: 404, message: document.title } });

    observeImpressions();
    observeGateModal();
    observeQuickOrder();
    bindUX();
  }

  /* 6.1 کلیک‌ها (capture تا حتی اگر link پیش‌فرض را preventDefault کرد، از دست نرود) */
  document.addEventListener("click", function (e) {
    var t = e.target, a;
    if (!(t && t.closest)) return;

    // افزودن به سبد
    var atc = t.closest(CFG.selectors.addToCart);
    if (atc) {
      e.stopPropagation();
      var pr = extractProduct();
      push("titana_add_to_cart", {
        source_page_type: T.page.type, cta_id: (atc.getAttribute("data-cta") || atc.className || "cta").slice(0, 40),
        items: [{ product_id: pr.id, item_name: pr.name, price_toman: pr.price_toman, quantity: qtyOf(atc) || 1, brand_id: pr.brand && pr.brand.id, system_id: pr.system_id, category: pr.product_family, index: 0 }],
        value: pr.price_toman ? pr.price_toman * (qtyOf(atc) || 1) * 10000 : undefined, currency: "IRR"
      });
      return;
    }
    function qtyOf(btn) { var f = btn.form; var q = f ? f.querySelector("input[type=number],input[name*=count]") : null; return q ? toNum(q.value) : null; }

    // باز کردن انتخاب تنوع
    if (t.closest(CFG.selectors.openVariant)) { push("titana_variant_index", { product: T.product || { id: toNum((location.pathname.match(/\/model\/(\d+)/) || [])[1]) } }); return; }

    // کارت محصول در لیست
    var card = t.closest(CFG.selectors.productCard);
    if (card && T.page.type !== "product_detail") {
      var pid = toNum((card.getAttribute("href") || "").match(/\/product\/(\d+)/) ? (card.getAttribute("href").match(/\/product\/(\d+)/) || [])[1] : (card.querySelector("a[href*='/product/']") || {}).href);
      if (pid) push("titana_product_click", { product_id: pid, product: { id: pid, name: toText(card).slice(0, 100) }, list: T.page.type, position: indexOf(card, CFG.selectors.productCard), placement: placementOf(card) });
    }

    // بنر/اسلایدر
    var sl = t.closest(CFG.selectors.slider);
    if (sl) { push("titana_promo_click", { promo: { creative_id: toNum((sl.querySelector("img") || {}).src ? (sl.querySelector("img").src.match(/\/Sliders\/(\d+)\//) || [])[1] : (sl.href.match(/\/(\d+)\//) || [])[1]), slot: "hero_slider", name: toText(sl).slice(0, 60) } }); }

    // دانلود فایل
    var dl = t.closest(CFG.selectors.download);
    if (dl) {
      var txt = toText(dl) + " " + dl.getAttribute("href");
      push("titana_file_download", {
        doc_type: /کاتالوگ|catalog/i.test(txt) ? "catalog" : /اگزوکد|exocad/i.test(txt) ? "exocad_library" : /فیلر|failure/i.test(txt) ? "failure_form" : /لیست قیمت|price/i.test(txt) ? "pricelist" : "other",
        file_ext: (dl.getAttribute("href").match(/\.(\w{2,4})$/) || [])[1] || null,
        product_id: T.product && T.product.id, brand_id: T.product && T.product.brand && T.product.brand.id, url: dl.href.slice(0, 200)
      });
    }

    // چت/تماس
    var msg = t.closest(CFG.selectors.chatWidget);
    if (msg) {
      var href = msg.href || "";
      var ch = /wa\.me|whatsapp/.test(href) ? "whatsapp" : /t\.me|telegram/.test(href) ? "telegram" : /ble\.ir/.test(href) ? "bale" : "site_chat";
      push("titana_chat_click", { channel: ch, agent_id: (href.match(/\/([a-zA-Z0-9_]+)$/) || [])[1] || null, page_type: T.page.type, product_id: T.product && T.product.id });
    }
    var ph = t.closest(CFG.selectors.phone);
    if (ph) { push("titana_phone_click", { extension: (ph.getAttribute("href") || "").replace("tel:", "").slice(0, 20), page_type: T.page.type }); }

    // لینک شکسته‌ی شناخته‌شده
    var lk = t.closest("a[href]");
    if (lk && /leasing-404|404\//.test(lk.getAttribute("href") || "")) push("titana_broken_link_click", { target: lk.getAttribute("href").slice(0, 120), link_text: toText(lk).slice(0, 40) });

    // اشتراک‌گذاری
    if (t.closest("[data-share], .share a, a[onclick*=copy]")) push("titana_content_share", { method: t.closest("a") ? (toText(t.closest("a")) || "link") : "copy", object_type: T.page.type, object_id: T.product && T.product.id });

    function indexOf(el, sel) { var s = document.querySelectorAll(sel); for (var i = 0; i < s.length; i++) if (s[i] === el) return i + 1; return null; }
    function placementOf(el) { return el.closest(".swiper, [class*=slider]") ? "slider" : el.closest("[class*=related], [class*=similar]") ? "related" : "listing"; }
  }, true);

  /* 6.2 تغییر تنوع / تعداد / فیلتر */
  document.addEventListener("change", function (e) {
    var el = e.target;
    if (el.matches && el.matches(CFG.selectors.variantSelect)) {
      var pr = T.product || extractProduct();
      push("titana_variant_select", {
        product_id: pr.id, diameter: pick("diameter|size|قطر"), length: pick("length|طول"),
        platform: pick("platform"), qty: qtyNow(), price_toman: pr.price_toman
      });
    }
    function pick(rx) { var s = el.form ? el.form.querySelector("select[name], input[name]") : null; var all = el.form ? el.form.querySelectorAll("select,input") : []; for (var i = 0; i < all.length; i++) { if (new RegExp(rx, "i").test(all[i].name || "")) return toText(all[i].selectedOptions ? all[i].selectedOptions[0] : all[i]) || all[i].value; } return null; }
    function qtyNow() { var q = el.form ? el.form.querySelector(CFG.selectors.qtyInput) : null; return q ? toNum(q.value) : null; }
  }, true);

  document.addEventListener("input", throttle(function (e) {
    if (e.target.matches && e.target.matches(CFG.selectors.qtyInput)) {
      var pr = T.product || extractProduct();
      push("titana_variant_select", { product_id: pr.id, qty: toNum(e.target.value), change: "qty" });
    }
  }, 500), true);

  /* 6.3 فرم‌ها: start / submit / ajax result */
  var formStart = {};
  document.addEventListener("focusin", function (e) {
    var f = e.target && e.target.closest ? e.target.closest("form") : null;
    if (!f) return;
    var id = formId(f); if (formStart[id]) return; formStart[id] = { t: Date.now(), n: f.querySelectorAll("input,select,textarea").length };
    push("titana_form_start", { form: { id: id, field_count: formStart[id].n }, page_type: T.page.type });
  }, true);
  document.addEventListener("submit", function (e) {
    var f = e.target; if (!f || !f.tagName || f.tagName !== "FORM") return;
    var id = formId(f);
    push("titana_form_submit", { form: { id: id, result: "attempt" }, time_to_complete_ms: formStart[id] ? Date.now() - formStart[id].t : null });
  }, true);
  function formId(f) {
    if (f.id) return "f:" + f.id;
    var act = (f.getAttribute("action") || "").slice(0, 60);
    var name = /callreq/i.test(act) ? "callback" : /login|auth/i.test(act) ? "auth" : /comment|review/i.test(act) ? "comment" : /register|signup/i.test(act) ? "signup" : /otp|code/i.test(act) ? "otp" : (act || "anon");
    return "a:" + name;
  }
  /* شنود پاسخ AJAX برای نتیجه‌ی فرم و لاگین/OTP (بدون تغییر در کد سایت) */
  (function patchAjax() {
    var XO = XMLHttpRequest.prototype.open, XS = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u) { this.__t = { m: m, u: String(u).slice(0, 160) }; return XO.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function () {
      var x = this;
      x.addEventListener("loadend", function () { onResp(x.__t, x.status, x.responseText); });
      return XS.apply(x, arguments);
    };
    if (window.fetch) {
      var F = window.fetch;
      window.fetch = function (inp, init) {
        var meta = { m: (init && init.method) || "GET", u: String(inp && inp.url ? inp.url : inp).slice(0, 160) };
        return F.apply(this, arguments).then(function (r) { r.clone().text().then(function (b) { onResp(meta, r.status, b); }).catch(function () { }); return r; },
          function (e) { onResp(meta, 0, "network_error"); throw e; });
      };
    }
    function onResp(meta, status, body) {
      if (!meta) return;
      var u = meta.u.toLowerCase(), ok = status >= 200 && status < 300;
      var txt = String(body || "").slice(0, 4000);
      if (/login|auth|otp|verif/.test(u)) {
        var err = (txt.match(/("?(error|message|msg)"?\s*[:=]\s*")([^"]{0,80})/i) || [])[3] || null;
        push(ok && !err ? "titana_otp_result" : "titana_otp_result", { result: ok && !err ? "ok" : "fail", error_code: err ? "E" + (err || "").slice(0, 24) : (ok ? null : "http_" + status), method: /password/.test(u) ? "password" : "otp", page_type: T.page.type });
        if (ok && /register|signup|login/.test(u) && once("signup")) push("titana_signup_success", { role: "unknown", city: null, has_capacity_field: false });
      }
      if (/basket|cart|additem/.test(u) && ok) push("titana_add_to_cart", { source_page_type: T.page.type, cta_id: "ajax", items: readBasketFromDom().slice(0, CFG.maxItems) });
      if (/comment|review/.test(u) && ok) push("titana_review_submit", { product_id: T.product && T.product.id, rating_value: null, page_type: T.page.type });
      if (/callback|callreq|contact/.test(u) && ok) push("titana_callback_request", { form: { id: "callback", result: "ok" }, page_type: T.page.type });
    }
  })();

  /* 6.4 مودال «ابتدا وارد شوید» = تقاضای قفل‌شده (مهم‌ترین سنجه‌ی B2B این سایت) */
  function observeGateModal() {
    if (!document.body) return;
    var mo = new MutationObserver(throttle(function () {
      var m = document.querySelector(CFG.selectors.loginGateModal);
      if (!m || m.offsetParent === null) return;
      if (!CFG.selectors.gateText.test(m.innerText || "")) return;
      if (!oncePer("gate", location.pathname + (T.product && T.product.id))) return;
      push("titana_login_gate_hit", { blocked_action: inferBlockedAction(), target_page: T.page.type, product_id: T.product && T.product.id });
    }, 300));
    mo.observe(document.body, { childList: true, subtree: true });
    function inferBlockedAction() {
      var b = toText(document.querySelector(CFG.selectors.loginGateModal));
      return /سبد|خرید/.test(b) ? "cart" : /ثبت\s*نظر|نظر/.test(b) ? "review" : /دنبال\s*کردن/.test(b) ? "follow" : /باشگاه|کلاب/.test(b) ? "club" : "generic";
    }
  }

  /* 6.5 سفارش سریع / پکیج‌ساز (جدول ۱۰ سطری) */
  function observeQuickOrder() {
    var q = document.querySelector(CFG.selectors.quickOrder); if (!q) return;
    var tool = /customized/i.test(location.pathname) ? "custom_package" : /smart/i.test(location.pathname) ? "smart_order" : "quick_order";
    push("titana_tool_view", { tool: { tool: tool, rows_available: document.querySelectorAll(CFG.selectors.quickOrderRow).length } });
    var lastTotal = null;
    q.addEventListener("change", function (e) {
      var row = e.target.closest && e.target.closest(CFG.selectors.quickOrderRow);
      push("titana_tool_row_edit", { tool: tool, row_index: row ? Array.prototype.indexOf.call(row.parentNode.children, row) : null, field: (e.target.name || e.target.className || "field").slice(0, 40) });
      setTimeout(totals, 250);
    }, true);
    var totals = debounce(function () {
      var lines = document.querySelectorAll(CFG.selectors.quickOrderRow + " td:nth-child(4) select, " + CFG.selectors.quickOrderRow).length;
      var finalT = toNum((Array.prototype.map.call(document.querySelectorAll("body *"), function (n) { return n.children.length === 0 ? toText(n) : ""; }).filter(function (t) { return /مبلغ نهایی/.test(t); })[0] || "").replace(/[^\d۰-۹]/g, ""));
      var disc = toNum((toText(document.querySelector("[class*=discount]"))).match(/([\d.,۰-۹٠-٩]+)/) || [])[1];
      var snap = lines + "|" + finalT + "|" + disc;
      if (snap === lastTotal) return; lastTotal = snap;
      push("titana_tool_total_change", { tool: tool, lines_count: lines, final_toman: finalT, discount_toman: disc });
    }, 800);
    q.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("[data-copy-row], .copy-row")) push("titana_tool_row_copy", { tool: tool });
      if (e.target.closest && e.target.closest(CFG.selectors.addToCart)) push("titana_tool_submit", { tool: tool, lines_count: document.querySelectorAll(CFG.selectors.quickOrderRow).length });
    }, true);
    totals();
  }

  /* 6.6 Impressionها (کارت محصول و بنر) با IntersectionObserver */
  function observeImpressions() {
    if (!("IntersectionObserver" in window)) return;
    var seen = new WeakSet();
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting || en.intersectionRatio < 0.5 || seen.has(en.target)) return;
        seen.add(en.target);
        if (!sampled(CFG.sample.impressions)) return;
        var a = en.target.matches("a") ? en.target : en.target.querySelector("a[href*='/product/']");
        var pid = a ? toNum((a.href.match(/\/product\/(\d+)/) || [])[1]) : null;
        if (!pid) return;
        push("titana_product_impression", { items: [{ product_id: pid, item_name: toText(en.target).slice(0, 80), index: null }], list: T.page.type });
      });
    }, { threshold: [0.5] });
    Array.prototype.forEach.call(document.querySelectorAll("[class*=product], .item, .card, " + CFG.selectors.productCard), function (n) { io.observe(n); });

    var seenP = new WeakSet();
    var iop = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting || seenP.has(en.target)) return; seenP.add(en.target);
        if (!sampled(CFG.sample.promos)) return;
        var img = en.target.querySelector("img[src*='/Sliders/'], img[src*='/LandingPageItemMenus/']");
        push("titana_promo_view", { promo: { creative_id: img ? toNum((img.src.match(/\/(?:Sliders|LandingPageItemMenus)\/(\d+)\//) || [])[1]) : null, slot: /Sliders/.test(img ? img.src : "") ? "hero_slider" : "brand_menu" } });
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(document.querySelectorAll(CFG.selectors.slider), function (n) { iop.observe(n); });
  }

  /* 6.7 UX: scroll / web-vitals / rage / dead click */
  function bindUX() {
    var fired = {};
    window.addEventListener("scroll", throttle(function () {
      var d = (window.scrollY + window.innerHeight) / Math.max(document.body.scrollHeight, 1) * 100;
      [25, 50, 75, 90].forEach(function (t) { if (d >= t && !fired["s" + t] && sampled(CFG.sample.ux)) { fired["s" + t] = 1; push("titana_scroll_depth", { percent: t, page_type: T.page.type }); } });
    }, 500), { passive: true });

    var v = {};
    function sendVitals() { if (v.lcp == null && v.inp == null && v.cls == null) return; if (!sampled(CFG.sample.ux)) return; push("titana_web_vitals", { lcp: v.lcp, inp: v.inp, cls: v.cls, txn_id: "wv-" + Date.now() }); }
    try {
      if (PerformanceObserver) {
        var po = new PerformanceObserver(function (l) { var e = l.getEntries().pop(); if (e) v.lcp = Math.round(e.startTime); sendVitals(); }, { type: "largest-contentful-paint", buffered: true }); po.observe();
        var pc = new PerformanceObserver(function (l) { l.getEntries().forEach(function (e) { v.cls = (v.cls || 0) + e.value; }); }); pc.observe({ type: "layout-shift", buffered: true });
        var pin = new PerformanceObserver(function (l) { l.getEntries().forEach(function (e) { v.inp = Math.max(v.inp || 0, Math.round(e.duration)); }); }); pin.observe({ type: "event", durationThreshold: 40 });
      }
    } catch (e) { }
    setTimeout(sendVitals, 8000);

    var last = { t: 0, n: 0, x: 0, y: 0 };
    document.addEventListener("click", function (e) {
      var now = Date.now();
      if (now - last.t < 500 && Math.abs(e.clientX - last.x) < 40 && Math.abs(e.clientY - last.y) < 40) { last.n++; } else { last.n = 1; }
      last.t = now; last.x = e.clientX; last.y = e.clientY;
      if (last.n >= 3) { last.n = 0; push("titana_rage_click", { x: e.clientX, y: e.clientY, selector: path(e.target), page_type: T.page.type }); }
      function path(el) { var s = []; while (el && el.nodeType === 1 && s.length < 3) { s.push(el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/)[0] : "")); el = el.parentElement; } return s.join(">"); }
    }, true);
  }

  /* 6.8 ناوبری SPA-گونه / تغییر مودال → page_view دوم */
  var lastHref = location.href;
  window.addEventListener("popstate", onNav);
  (function hookPush() { ["pushState", "replaceState"].forEach(function (m) { var o = history[m]; history[m] = function () { var r = o.apply(this, arguments); setTimeout(onNav, 60); return r; }; }); })();
  function onNav() { if (location.href === lastHref) return; lastHref = location.href; init(); }

  /* 6.9 رویدادهای خاص: PWA, پایداری */
  window.addEventListener("beforeinstallprompt", function () { push("titana_pwa_prompt_show", {}); });
  window.addEventListener("appinstalled", function () { push("titana_pwa_prompt_accept", {}); });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
