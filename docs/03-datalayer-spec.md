# ۳) مشخصه‌ی Data Layer (قرارداد داده — نسخه ۱٫۰)

این سند تنها منبع حقیقت برای **نام‌ها و شکل داده** است. تگ‌ها (سند ۰۴) فقط مصرف‌کننده‌ی این قراردادند. اگر جایی در سایت نامی جز این جدول بود، آنجا اصلاح می‌شود نه اینکه تگ سازگار شود.

## ۳.۱ اصول

1. **ساختار CED-مانند** (Common Event Data): یک آبجکت‌های با‌معنا (`page`, `user`, `product`, `basket`, `order`, `customer`, `document`, `form`, `search`, `promo`) + یک `event` نام‌دار. چرا؟ چون ۹۰٪ تگ‌های بازاریابی (GA4، پیکسل‌ها، sGTM) همین شکل را می‌فهمند و نگه‌داشتنش هزینه‌ی تغییر را صفر می‌کند.
2. **Push قبل از GTM**: داده‌ی صفحه باید در `<head>` و **پیش از** اسکریپت GTM باشد؛ رویدادهای تعاملی در لحظه‌ی اتفاق.
3. **Idempotent**: هیچ رویدادی بیش از یک‌بار در هر اقدام push نشود (نگهداشت `__pushed__` flags). دوبار-push = دوبرابر‌شدن conversionها.
4. **بدون خواندن مبلغ/موجودی از DOM** برای داده‌های پولی: قیمت و موجودی نهایی باید از سرور (dataLayer) بیاید؛ DOM فقط برای عناصری که داده‌ی ساختاریافته ندارند، با `fallback` و flag `source:"dom"`.
5. **بدون PII خام**: هرچه در بخش ۱٫۱۰ سند ۰۱ ممنوع شد، در اینجا هم ممنوع است. موبایل/ایمیل فقط `sha256` و فقط برای GA4/سلف.
6. **نسخه‌دار**: `titana.version = "1.0.0"`. با هر تغییر ساختاری، `minor`؛ هر تغییر نام، `major` + اطلاع به همه.

## ۳.۲ آبجکت پایه (روی همه‌ی صفحات)

```js
window.titana = window.titana || {};
titana.version     = "1.0.0";
titana.env         = "prod" | "staging" | "dev";      // از host یا meta
titana.page = {
  id:     "pdp",                // home|listing|brand_listing|pdp|model|cart|checkout|confirm|
                                // auth|tool|content|club|error|search
  type:   "product_detail",     // CED view name (جدول ۳٫۳)
  title:  "فیکسچر ایمپلنت اویتا (Avita)",
  url:    location.href,
  path:   "/product/626/avita-fixture-implant/",
  brand_slug: "avita",          // NULL اگر در مسیر نیست
  category_l1: "ایمپلنت", category_l2: "فیکسچر",
  currency: "IRR",              // کد رسمی؛ مقدار در `value` همیشه **تومان** + پارامتر مجزا
  locale: "fa-IR", rtl: true,
  logged_in: false,
  template_bug: false           // true اگر رندر `{...}` خام دیده شد (نگهبان داده آلوده)
};
titana.user = {                 // فقط اگر لاگین است
  uid_hash:   "8f3c…",         // sha256(salt + 0 + 98 + mobile)
  role:       "dentist",       // dentist|clinic|lab|other|unknown
  city:       "تهران",
  province:   "تهران",
  org_type:   "private_practice", // private_practice|clinic|lab|hospital|chain
  club_tier:  "silver",
  implants_band: "16-30",      // 0-5|6-15|16-30|31-60|60+|unknown
  primary_systems: ["avita","arum"],
  credit_limit_toman: 500000000,
  is_new:     false,
  first_order_date: "2025-04-11"
};
titana.session = {              // اختیاری؛ sGTM/BQ آن را کامل می‌کنند
  id: "s-01J…",                 // سرور-side یا sha(client_id+date)
  auth_state: "anonymous"|"gated"|"authenticated"
};
```

`dataLayer` فیزیکی:

```js
window.dataLayer = window.dataLayer || [];
dataLayer.push({ ecommerce: null });                 // ریست، الگوی رسمی گوگل
dataLayer.push({
  event: "titana_product_detail",
  page: titana.page, user: titana.user, product: {...}, items: [...]
});
```

## ۳.۳ جدول صفحات (`page.type`) — چه چیزی باید push شود

| `page.type` | URL الگو | آبجکت‌های الزامی | آبجکت‌های اختیاری | رویداد صفحه |
|---|---|---|---|---|
| `home` | `/` | `page`, `user?` | `promo`(بنرها), `collections` | `titana_page_view` |
| `brand_listing` | `/search/{brand}-dental-implant-system/` | `page`, `search` (facets) | `items[]` (حداکثر ۱۲ مورد اول) | `titana_search_results` |
| `category_listing` | `/search/fixture/` … | `page`, `search` | `items[]` | `titana_search_results` |
| `package_listing` | `/search/package/`, `/search/package/{brand}-implant-package/` | `page`, `search`, `offer` | `items[]` | `titana_search_results` |
| `price_band` | `/search/fixture/?minprice=&maxprice=` | `page`, `search.price_range` | — | `titana_search_results` |
| `product_detail` | `/product/{id}/{slug}/` | `page`, `product`, `offer` | `customer`, `documents[]` | `titana_product_detail` |
| `variant_selection` | `/model/{id}` یا مودال | `page`, `product`, `variants[]` | — | `titana_variant_index` |
| `basket` | `/cart` | `page`, `basket`, `customer` | `offer` | `titana_basket_view` |
| `checkout_step` | `/checkout/…` (پس از احراز) | `page`, `basket`, `checkout.step` | `customer` | `titana_checkout_step` |
| `purchase_confirmation` | `/order/confirmation/{id}` | `page`, `order`, `customer` | `basket` | `titana_purchase` |
| `auth_gate` | `/login` یا مودال | `page`, `form` | — | `titana_form_start` (auth) |
| `tool_quick_order` | `/order` | `page`, `tool`, `lines[]` | `offer` | `titana_tool_view` |
| `tool_smart_order` | `/smartorder` | `page`, `tool` | — | `titana_tool_view` |
| `tool_custom_package` | `/customizedpackages/`, `/order/customizedpackage/` | `page`, `tool`, `lines[]` | `offer` | `titana_tool_view` |
| `tool_compare` | `/compare/brand`, `/compare?hasbrand=true` | `page`, `compare{brands[]}` | — | `titana_compare_view` |
| `content_brand` | `/sic-implant/`, `/naxis-implant/`, `/gdiff/` … | `page`, `content{brand_id}` | `videos[]` | `titana_content_view` |
| `content_review` | `/implant-review/` و `/{brand}-implant/` | `page`, `content`, `rating` | — | `titana_content_view` |
| `club` | `club.titana.ir/*` | `page`, `user`, `loyalty` | — | `titana_page_view` |
| `finance` | `/leasing-404/` → پس از رفع `/leasing/` | `page` | `credit` | `titana_page_view` |
| `error` | ۴۰۴ / ۵۰۰ | `page{error_code}`, `nav{from}` | — | `titana_error_view` |
| `other` | `/faq/`, `/aboutus/`, `/contact-us/`, `/userreferral/`, `/affiliate/`, `/termsandconditions`, `/form/callreq` | `page`, `content` | `form` | `titana_page_view` |

## ۳.۴ آبجکت محصول / تنوع (مهم‌ترین موجودیت سایت)

```js
titana.product = {
  id: 626,                       // از URL؛ عددی، پایدار
  sku: "AVITA-FIX-4.0-10",       // کد تنوع (کد تنوع در سایت هست: «کد تنوع» در /order)
  name: "فیکسچر ایمپلنت اویتا (Avita)",
  name_en: "Avita Fixture implant",
  product_family: "fixture",     // fixture|prosthesis|healing_cover_screw|kit|cap_housing|
                                 // impression_coping|lab_analog|scan_body|digital_analog|package
  is_package: false,
  package_size: null,            // 30|70|100|150|200 اگر پکیج است
  brand: { id: 556, slug: "avita", name_fa: "اویتا (Avita)", origin_group: "iranian" },
  system_id: "avita",            // ⚑ کلید سازگاری/قفل‌شدگی — برای attach-rate حیاتی است
  platform: "regular",           // narrow|regular|both
  diameter_mm: 4.0, length_mm: 10, connection: "hex2.5",
  implant_type: "bone_level",    // bone_level|tissue_level|one_piece|zygomatic|short|ultra_narrow
  surface: "SLA",
  country_of_origin: "IR",
  price_toman: 4200000,
  compare_at_price_toman: null,  // قیمت خط‌خورده
  discount_pct: 0,
  price_undisclosed: false,      // ⚑ true اگر در سایت 0 تومان نمایش داده می‌شود
  availability: "in_stock",      // in_stock|out_of_stock|sourcing(«در حال تامین»)|discontinued
  stock_units: 345,              // از متن «۳۴۵ واحد در انبار»؛ null اگر عدد نبود
  installment_eligible: true,    // برچسب «اقساطی»
  free_gift: { type: "surgical_kit", label: "کیت جراحی رایگان" } | null,
  warranty: ["filler_replacement","unlimited_exchange","30day_return"],
  documents: [{ type:"catalog", url:"…pdf", ext:"pdf" },
              { type:"exocad_library", url:"…rar", ext:"rar" },
              { type:"failure_form", url:"…pdf", ext:"pdf" }],
  rating: { value: 0, count: 0 },
  position_on_page: 3, list: "search_fixture_page1"   // برای CTR/لیست
};
```

> ⚑ سه فیلدی که این سایت را از یک فروشگاه معمولی جدا می‌کند و باید در **هر** رویداد تجاری کپی شوند: `system_id`، `price_undisclosed`، `availability`.

## ۳.۵ آبجکت سبد / سفارش

```js
titana.basket = {
  id: "b-99312",                 // شناسه سبد/پیش‌فاکتور اگر سرور می‌دهد
  currency: "IRR",
  value_toman: 780000000,
  items_count: 100,              // تعداد «واحد» (فیکسچر) — نه فقط تعداد خطوط
  line_count: 3,
  shipping_method: "express_free",   // express_free|post|courier|cod
  cod_available: true,
  offer_type: "free_fixtures_40",
  discount_toman: 3000000,
  free_items_value_toman: 126000000,   // ارزش کالای رایگان آفر — جدا گزارش شود
  installment: true,
  items: [{ product_id:644, variant_sku:"TSTRONG-FIX-4.0-10", name:"…", brand_id:554,
            system_id:"tstrong", category:"fixture", price_toman:7800000,
            quantity:100, coupon:null, index:0 }]
};
titana.order = {                 // فقط در confirm — مقصد حقیقت: سرور
  id: "T-14050621-4471",
  date: "2026-09-13",
  value_toman: 780000000,        // پرداختی نهایی
  tax_toman: 0, shipping_toman: 0, discount_toman: 3000000,
  coupon: null,
  payment_method: "online" | "cod" | "transfer" | "credit_installment",
  installment_plan: { months: 6, downpayment_toman: 200000000 } | null,
  fixtures_units: 100,           // تعداد کل فیکسچر → برای «واحد فروش» و Share of Wallet
  is_first_order: false,
  city: "تهران", slatier: "T3H", // وعده‌ی تحویل
  items: [/* همان ساختار basket.items */]
};
```

## ۳.۶ رجیستری رویدادها (الزامی — ۳۴ رویداد)

الزام نگاشت: `event` dataLayer ⇄ `GA4 event name` (حداکثر ۴۰ کاراکتر، بدون فاصله، شروع با حرف).

| # | `dataLayer.event` | GA4 event | Trigger/شرط | پارامترها (الزامی پررنگ) |
|---|---|---|---|---|
| 1 | `titana_page_view` | `page_view` | همه صفحات | **page_type**, **page_path**, **logged_in**, brand_slug |
| 2 | `titana_search_results` | `view_search_results` | لیست/فیلتر | **results_count**, **category**, **sort**, **price_range**, page_no, items_per_page |
| 3 | `titana_site_search` | `site_search` | فرم جست‌وجو | **term**, results_count |
| 4 | `titana_product_impression` | `product_impression` | دید ≥۵۰٪ کارت ≥۱s (نمونه ۱۰٪) | **product_id**, brand_id, position, list, availability |
| 5 | `titana_product_click` | `select_product` | کلیک کارت در لیست/بنر | **product_id**, list, position, **placement** |
| 6 | `titana_product_detail` | `view_item` | ورود به PDP | **items[]**, value_toman, currency, availability, undisclosed |
| 7 | `titana_variant_index` | `variant_index_view` | ورود `/model/{id}` | product_id, variants_count |
| 8 | `titana_variant_expand` | `variant_list_expand` | «نمایش تنوع‌های موجود» | product_id |
| 9 | `titana_variant_select` | `select_variant` | تغییر diameter/length/qty | **product_id**, **diameter**, **length**, **platform**, qty, price_toman |
| 10 | `titana_add_to_cart` | `add_to_cart` | افزودن موفق (هر جا، حتی از صفحات محتوا) | **items[]**, value, **source_page_type**, **cta_id** |
| 11 | `titana_remove_from_cart` | `remove_from_cart` | حذف خط | items[] |
| 12 | `titana_cart_view` | `view_cart` | `/cart` (لاگین‌شده) | **line_count**, items_count, value |
| 13 | `titana_checkout_step` | `begin_checkout` / `checkout_step` | هر مرحله | **step**, **step_name**, **option**, value |
| 14 | `titana_checkout_option` | `add_shipping_info` / `add_payment_info` | انتخاب ارسال/پرداخت | option_type, option |
| 15 | `titana_purchase` | `purchase` | صفحه تأیید (فقط یک‌بار) | **transaction_id**, **value**, **tax**, **shipping**, **coupon**, **items[]** |
| 16 | `titana_refund` | `refund` | مرجوعی ثبت‌شده | transaction_id, value |
| 17 | `titana_login_gate_hit` | `login_gate_hit` | باز شدن مودال «ابتدا وارد شوید» | **blocked_action**, **target_page**, product_id |
| 18 | `titana_otp_send` | `otp_send` | «ادامه» بعد از موبایل | **method** (otp/password), phone_valid |
| 19 | `titana_otp_result` | `otp_result` | تأیید/خطا | **result**(ok/fail/expired), **error_code**, attempts |
| 20 | `titana_signup_success` | `signup` | ساخت حساب موفق | **role**, city, **has_capacity_field** |
| 21 | `titana_profile_complete` | `profile_complete` | پایان پروفایل | role, implants_band, org_type |
| 22 | `titana_form_start` | `form_start` | اولین focus در فرم | **form_id**, form_name, page_type, field_count |
| 23 | `titana_form_submit` | `form_submit` | ارسال موفق/ناموفق فرم | form_id, **result**, error_count, time_to_complete_ms |
| 24 | `titana_quote_request` | `quote_request` | درخواست قیمت پکیج `price_undisclosed` | product_id, package_size, offer_type |
| 25 | `titana_callback_request` | `callback_request` | `/form/callreq` موفق | preferred_time, page_type |
| 26 | `titana_tool_view` | `tool_view` | ورود به `/order`,`/smartorder`,`/customizedpackages/` | **tool**, rows_available |
| 27 | `titana_tool_row_edit` | `tool_row_edit` | تغییر برند/محصول/تنوع/تعداد | tool, row_index, field, brand_id |
| 28 | `titana_tool_row_copy` | `tool_row_copy` | «کپی آخرین سطر» | tool, row_index |
| 29 | `titana_tool_total_change` | `tool_total_change` | تغییر مبلغ نهایی پکیج (debounce ۸۰۰ms) | tool, **lines_count**, **discount_toman**, **final_toman** |
| 30 | `titana_tool_submit` | `tool_submit` | افزودن به سبد/ثبت از ابزار | tool, lines_count, final_toman, discount_toman |
| 31 | `titana_compare_view` | `compare_view` | `/compare` | **brands_compared[]**, systems[], dims_used |
| 32 | `titana_promo_view` / `titana_promo_click` | `view_promo` / `select_promo` | بنر/اسلایدر/آفر | **creative_id**, **slot**, promo_name, product_id |
| 33 | `titana_file_download` | `file_download` | کلیک دانلود | **doc_type**(catalog/pricelist/exocad_library/failure_form), **file_ext**, product_id, brand_id |
| 34 | `titana_video_progress` | `video_progress` | پلیر/آپارات | video_id, **percent**(25/50/75/100), brand_id, autoplay |

**رویدادهای پشتیبان (Phase 2/3 — همان قرارداد، همان جدول):**
`chat_click{agent_id,channel}`, `chat_session_start`, `phone_click{extension}`, `whatsapp_click`, `price_list_request`, `notify_me_submit{product_id,requested_qty}`, `availability_view{availability,stock_units}`, `review_submit{rating_value}`, `rating_submit{brand_id,value}`, `newsletter_subscribe`, `referral_share{channel}`, `referral_landing{code}`, `club_view{tier,points}`, `installment_view{plan}`, `credit_apply_submit{amount_toman}`, `credit_approved{limit_toman}`, `order_track_view{order_id}`, `return_request{reason}`, `warranty_claim{type}`, `pwa_prompt_show/accept/dismiss`, `content_share{method,object_type}`, `utm_missing{referral}`, `web_vitals{lcp,inp,cls,txn_id}`, `scroll_depth{percent}`, `element_visibility{element_id}`, `rage_click{x,y}`, `dead_click{selector}`, `error_view{error_code}`.

## ۳.۷ قوانین نوع‌دادن و پارس (این‌جا داده‌ها خراب می‌شوند!)

| قاعده | توضیح |
|---|---|
| اعداد فارسی/عربی | `۳۴۵` → `345`، `٬` و `,` و `،` جداکننده‌ی هزارگان حذف شوند |
| واحد پول | همه‌ی `*_toman` عدد صحیح به **تومان**؛ `value` در GA4 برابرِ **ریال** (= تومان × ۱۰٬۰۰۰) با `currency:"IRR"`، و همیشه `value_toman` هم parallel بفرستید برای خوانایی گزارش |
| صفر مبهم | اگر قیمت در سایت `0` است → `price_toman: null` و `price_undisclosed: true`. **هرگز ۰ را به‌عنوان مقدار واقعی نفرستید** (AOV/ROAS را نابود می‌کند) |
| بولین | `true/false` نه `"true"`؛ GTM regex روی رشته جواب می‌دهد و بعداً همه را می‌سوزاند |
| زمان | `yyyy-mm-dd` یا ISO 8601 با offset `+03:30` |
| شناسه برند | همیشه جفت: `brand_id` (عدد `FieldOptions.Id`) **و** `brand_slug`؛ چون نام فارسی ویرایش می‌شود |
| null | حذف کلید، نه رشته‌ی `"null"`/`"undefined"` |
| رشته‌های طولانی | ≤ 100 کاراکتر در GA4 params؛ عنوان کامل محصول را در GA4 نفرستید (در BQ بله) |
| محدودیت GA4 | 24 پارامتر رویداد، ≤ 100 پارامتر سفارشی-رویداد (event-scoped CD)، ≤ 40 کاراکتر نام رویداد — طراحی بالا رعایت شده |

## ۳.۸ دو مسیر تحویل (بسته به دسترسی فنی)

**مسیر A — Native (ارجح):** تزریق `<script>` بلوک `titana` در قالب (Header/Footer code در پنل سایت‌ساز یا template). داده از سرور/دیتابیس → بدون وابستگی به DOM. دقیق، مقاوم در برابر تغییر ظاهری.

**مسیر B — Shim (موقت، همان چیزی که `snippets/titana-datalayer.js` پیاده می‌کند):** اگر دسترسی به قالب فقط محدود به «کد دلخواه» است، لایه‌ی ما مقادیر را از URL + JSON رندرشده + DOM استخراج می‌کند و همان قرارداد ۳٫۲ تا ۳٫۶ را تولید می‌کند. همه‌ی رویدادها flag می‌گیرند `source:"dom"` تا در گزارش‌ها قابل فیلتر باشند.

مسیر B یک تصمیمِ خوب نیست، یک تصمیمِ **ممکن** است: مزیتش راه‌اندازی ۲ روزه است؛ عیب‌ها شکنندگی با هر تغییر UI و نبودِ داده‌ی سروری (قیمت نهایی، کوپن، `order_id` واقعی). برای دو رویداد `purchase` و `refund` مسیر B **قبول نیست** → در آن‌ها باید ایمپورت سرور/پنل انجام شود.
