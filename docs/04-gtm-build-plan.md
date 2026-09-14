# ۴) استراتژی ساخت تگ‌ها در Google Tag Manager (کانتینر تیتانا)

> پیش‌فرض: یک کانتینر **تازه/خالی** برای `titana.ir` ساخته شده. این سند دقیقاً می‌گوید چه بسازید، به چه ترتیب، با چه نامی، و **چه چیزی نسازید**.

## ۴.۰ پنج اصل حاکم

1. **یک رویداد، یک حقیقت:** هر تبدیل فقط از یک `dataLayer.event` می‌آید. هیچ تگی listener خام روی DOM نگذارد مگر در لایه‌ی «Auto-Event Listener HTML» (مرکزِ جمع‌آوری) که خودش push می‌کند. ← وگرنه بعداً ۳ تعریف متفاوت از «add to cart» خواهید داشت.
2. **تگ‌ها نازک، داده ضخیم:** منطق (شرط، محاسبه، پارس) در GTM Variables/Custom JS و در لایه‌ی shim؛ تگ فقط ارسال می‌کند.
3. **اول GA4، بعد بقیه:** تا quality-gate سبز نشود، هیچ پیکسل ثالثی نصب نشود. ترتیب = هویت → قیف → لید → فعال‌سازی.
4. **قابل‌تست بود:** هر تگ باید با یک کوئری/فیلتر قابل تفکیک باشد (`debug_mode`, `dl_source`, `titana.env`).
5. **حذف‌پذیری:** هر تگ third-party پشت یک Consent State و یک Boolean Variable (`tg_enable_*`) باشد تا بدون deploy خاموش شود.

## ۴.۱ راه‌اندازی کانتینر

| مورد | مقدار پیشنهادی |
|---|---|
| نوع کانتینر | Web (برای `titana.ir`) + در فاز ۴ یک **Server** کانتینر جدا |
| Environment | `Live`, `Staging` (روی `staging.titana.ir` یا با `?gtm_auth` preview URL), `Dev` |
| Workspaces | همیشه یک `WS/QA-<date>`؛ Merge بعد از تأیید سند ۰۶ |
| دسترسی | Manager (۱ نفر)، Editor (تگ‌ساز)، Viewer (تحلیلگر/مدیر)؛ «Publish» فقط با changelog |
| Prefer container setup | ✅ «Use text/plain for custom tags» · ✅ «Enable data layer in preview» · ❌ Failsafe off (تا داده ناپدید نشود) |
| Google Signals | خاموش مگر لازم باشد؛ در بازار ایران ارزشی ندارد و ریسک افشای داده‌ی سلامت را بالا می‌برد |
| Consent Mode | v2 فعال، پیش‌فرض `denied` فقط اگر بنر دارید؛ اگر بنر ندارید → `granted` برای analytics و `denied` برای ads (سند ۰۵ بند ۵.۵) |

**نصب در سایت:** `<head>` snippet (اسناد `snippets/gtm-loader.html`) + `<body>` noscript. جایگزین اگر سایت‌ساز اجازه نمی‌دهد: قرار دادن در «کد سفارشی هدر». تست نهایی: `dataLayer.length` و نبودِ دو `googletagmanager.com/gtm.js` در `view-source`.

## ۴.۲ قرارداد نام‌گذاری (بدون استثنا)

```
Folder :  00 Core | 01 GA4 | 02 Ecommerce | 03 Leads | 04 Tools&Instruments | 05 Media |
          06 Identity&Consent | 07 QA&Maintenance | 99 Archive

Tag    :  [dst]_[action]_[object]            →  ga4_evt_add_to_cart , html_lst_product_card ,
                                                 ga4_cfg_base , cbk_blocker_oos , sgtm_map_checkout
Trigger:  evt | clk | dom | hist | custom | tl  →  evt_add_to_cart , clk_all_outbound ,
                                                   custom_login_gate_hit , tl_scroll_50
Variable: v_dl_  (dataLayer) | v_js_ (custom JS) | v_cv_ (constant) | v_re_ (regex) | v_url_ | v_cook_
                                                    →  v_dl_titana_product , v_js_parse_price_toman
```

قوانین: نام فارسی در متادیتای توضیح (Description) بنویسید، نه در نام. هر تگ **باید** Description داشته باشد: «چرا + به درد چه کسی می‌خورد + مالک». تگِ بدون توضیح در Review رد می‌شود.

## ۴.۳ رجیستری متغیرها (اول این‌ها، بعد تگ‌ها)

### الف) Data Layer Variables (۲۴ تا — سقف GA4 را می‌بلعد؛ فقط این‌ها)

| Variable | Data Layer name | نوع | پیش‌فرض |
|---|---|---|---|
| `v_dl_event_name` | `event` | string | — |
| `v_dl_page_type` | `page.type` | string | `other` |
| `v_dl_page_path` | `page.path` | string | `location.pathname` |
| `v_dl_logged_in` | `page.logged_in` | bool | false |
| `v_dl_uid_hash` | `user.uid_hash` | string | *(unset)* |
| `v_dl_role` | `user.role` | string | `unknown` |
| `v_dl_city` | `user.city` | string | `unknown` |
| `v_dl_club_tier` | `user.club_tier` | string | `none` |
| `v_dl_implants_band` | `user.implants_band` | string | `unknown` |
| `v_dl_product_id` | `product.id` | string→number | — |
| `v_dl_brand_id` / `v_dl_brand_slug` | `product.brand.id` / `brand_slug` | string | — |
| `v_dl_system_id` | `product.system_id` | string | `na` |
| `v_dl_category` | `product.product_family` | string | `other` |
| `v_dl_price_toman` | `product.price_toman` | number | — |
| `v_dl_undisclosed` | `product.price_undisclosed` | bool | false |
| `v_dl_availability` | `product.availability` | string | `unknown` |
| `v_dl_stock_units` | `product.stock_units` | number | — |
| `v_dl_installment` | `product.installment_eligible` | bool | false |
| `v_dl_offer_type` | `offer.offer_type` | string | `none` |
| `v_dl_items` | `items` | **Object**(sequential) | [] |
| `v_dl_basket_value` | `basket.value_toman` | number | 0 |
| `v_dl_order_id` | `order.id` | string | — |
| `v_dl_form_id` | `form.id` | string | — |
| `v_dl_promo_creative_id` | `promo.creative_id` | string | — |

### ب) Auto-Event Variables (فعال‌سازی در Built-Ins)
`gtm.element`, `gtm.elementUrl`, `gtm.elementClasses`, `gtm.elementId`, `gtm.elementText`, `gtm.triggers`, `gtm.video*`, `gtm.scrollThresholds`, `gtm.formId`, `gtm.elementVisibility*`, `gtm.customEventDimension`.

### ج) متغیرهای ثابت/URL/Regex
- `v_cv_ga4_id` = `G-XXXXXXXXXX` (تنها نقطه‌ی تغییر ID)
- `v_cv_container_ver` = `2026-09-13.1` → روی **همه** تگ‌ها به‌عنوان پارامتر `dl_ver` می‌رود؛ بدون این، نمی‌فهمید کدام عدد بعد از deploy کدام است.
- `v_re_internal_hosts`, `v_re_broken_links` (`/leasing-404/`), `v_re_messenger` (`wa\.me|t\.me|ble\.ir|tel:`), `v_re_downloadable` (`\.(pdf|zip|rar|7z|dme)$`)
- `v_url_*` برای `utm_*`, `page`, `minprice`, `maxprice`, `sorttype`, `ordertype`, `itemperpage`

### د) Custom JS (مغز متفکر — همین‌ها کار را درست می‌کنند)
| Variable | کار |
|---|---|
| `v_js_parse_toman` | پارس رشته‌ی فارسی → عدد (فارسی digits، جداکننده، «تومان»، صفر→null) |
| `v_js_toman_to_rial` | ×۱۰٬۰۰۰ برای `value` در GA4 |
| `v_js_page_type` | نگاشت path → `page.type` (مستقل از اینکه قالب داده بدهد یا نه) |
| `v_js_brand_from_path` | استخراج `brand_slug` از `/search/{slug}-dental-implant-system/` و `/product/...` |
| `v_js_items_clean` | نرمال‌سازی `items[]`: حذف null، تبدیل قیمت‌ها، پر کردن index |
| `v_js_checkout_step` | استخراج شماره/نام مرحله از URL یا داده‌ی فرم |
| `v_js_consent_state` | خواندن وضعیت بنر (localStorage) |
| `v_js_is_internal_traffic` | IP/کوکی/تست: ادمین و کارمندان (فیلتر، نه حذف داده) |
| `v_js_blocked_by_gate` | آیا در این سشن `login_gate_hit` دیدیم؟ → برای رپورت قیف هویت |
| `v_js_sample` | نمونه‌برداری رویدادهای پرحجم (impression/scroll): `Math.random() < 0.1` با seed پایدار سشن |

## ۴.۴ کتابخانه‌ی تریگرها (۱۵ تریگر مادر، بقیه از این‌ها مشتق می‌شوند)

| Trigger | نوع | تنظیم |
|---|---|---|
| `tl_all_pages` | Page View | All Pages — *فقط برای `ga4_cfg_base`* |
| `evt_any_titana` | Custom Event | `^(titana_)\w+` → تریگر مادر برای GA4 Event tags (یک‌جا fire، سپس routing در tag) |
| `evt_ecom` | Custom Event | `titana_(add_to_cart|remove_from_cart|cart_view|product_detail|purchase|refund|checkout_.*)` |
| `evt_leads` | Custom Event | `titana_(quote_request|callback_request|tool_submit|signup_success|profile_complete|form_submit)` |
| `evt_identity` | Custom Event | `titana_(login_gate_hit|otp_send|otp_result|signup_success|profile_complete)` |
| `evt_media` | Custom Event | `titana_(file_download|video_progress|promo_view|promo_click)` |
| `dom_ready` | DOM Ready | برای HTML listenerها (زودتر: `gcm.init` برای consent) |
| `hist_change` | History Change | فعال؛ سایت چندمرحله‌ای/مودال دارد |
| `clk_link_ext` | Just Links | Click URL matches `^https?://` و does not contain `titana.ir` |
| `clk_download` | Just Links | Click URL matches `v_re_downloadable` |
| `clk_messenger` | Just Links | Click URL matches `v_re_messenger` |
| `clk_broken` | Just Links | Click URL contains `/leasing-404/` (یا slug منتهی به ۴۰۴) |
| `tl_form_focus` / `tl_form_submit` | Form (بسته به ساختار فرم — اگر AJAX است، از `titana_form_*` در لایه‌ی shim استفاده کنید) | — |
| `tl_scroll` / `tl_visibility` | Scroll / EV | آستانه‌ها ۲۵/۵۰/۷۵/۹۰ / once per element |
| `tl_dl_version_check` | Custom Event | برای alert ساختاری: `titana_schema_mismatch` |

⚠ یک «Page View» واحد برای `page_view` بسازید و **هیچ تگ دیگری** روی `tl_all_pages` نگذارید؛ همه‌چیز باید از `evt_any_titana` عبور کند تا هم‌زمانی/تکرار قابل کنترل باشد.

## ۴.۵ رجیستری تگ‌ها (۴ فاز — کامل در `data/tag-plan.csv`)

### Phase 0 — فونداسیون (روز ۱–۲)
| Tag | نوع | Trigger | توضیح |
|---|---|---|---|
| `ga4_cfg_base` | GA4 Config `G-XXXX` | `tl_all_pages` | Measurement ID از `v_cv_ga4_id`. Send page view = ✅. Parameters: `page_type`, `logged_in`, `dl_ver` |
| `ga4_evt_page_enhance` | GA4 Event `page_view` augment | `evt_any_titana` | فقط ارسال پارامترهای سفارشی (نه hit تکراری) — از طریق Event Settings مشترک |
| `ga4_set_user_props` | GA4 Event `user_update` | `evt_identity` + `dom_ready` (اگر user exists) | ست‌کردن user properties: role/city/tier/implants_band — این‌ها در اولین hit بعد اعمال می‌شوند، پس روی login هم fire شود |
| `html_dl_shim` | Custom HTML (once per page) | `dom_ready` | بارگذاری `snippets/titana-datalayer.js` (اگر مسیر B را انتخاب کردید) |
| `html_consent_init` | Custom HTML | **Page View (top)** | تنظیم Consent Mode v2 پیش از هر تگ؛ با `consent default` و `update` |
| `ga4_evt_internal_flag` | GA4 Event `internal_traffic` | `tl_all_pages` + `v_js_is_internal_traffic` | داده‌ی تیم داخل را جدا کن، فیلتر کن — نه حذف |
| `ga4_evt_error_view` | GA4 Event `error_view` | `tl_all_pages` + `document.title` matches ۴۰۴ | ردیابی لینک‌های شکسته از همین اول (مثل `/leasing-404/`) |

### Phase 1 — Commerce + هویت (هفته ۱–۲)
| Tag | GA4 event | Trigger | نکته |
|---|---|---|---|
| `ga4_evt_view_item` | `view_item` | `evt_ecom` (`product_detail`) | items[] از `v_js_items_clean` |
| `ga4_evt_select_item` | `select_item` | `evt_ecom` | از لیست/بنر |
| `ga4_evt_view_item_list` | `view_item_list` | `evt_ecom` | نمونه‌برداری‌شده |
| `ga4_evt_view_cart` | `view_cart` | `evt_ecom` | |
| `ga4_evt_add_to_cart` | `add_to_cart` | `evt_ecom` | ⚑ `source_page_type` را حتماً بفرست |
| `ga4_evt_remove_from_cart` | `remove_from_cart` | `evt_ecom` | |
| `ga4_evt_begin_checkout` | `begin_checkout` | `evt_ecom` | |
| `ga4_evt_checkout_progress` | `checkout_step` | `evt_ecom` | `step`,`option` |
| `ga4_evt_add_shipping_payment` | `add_shipping_info`,`add_payment_info` | `evt_ecom` | اگر مودال جداست |
| `ga4_evt_purchase` | `purchase` | `evt_ecom` | ⚑ **dedupe**: `oncePerCheckout` flag در لایه + `sessionStorage["purch_"+order_id]` |
| `ga4_evt_refund` | `refund` | `evt_ecom` | |
| `ga4_evt_login_gate` | `login_gate_hit` | `evt_identity` | پارامتر `blocked_action` — طلایی‌ترین داده‌ی این سایت |
| `ga4_evt_otp_*` | `otp_send`,`otp_result` | `evt_identity` | `result` و `error_code` |
| `ga4_evt_signup` / `ga4_evt_profile_complete` | `signup`,`profile_complete` | `evt_identity` | mark as Key Event |
| `ga4_evt_variant_*` | `variant_list_expand`,`select_variant` | `evt_ecom` | `diameter`,`length`,`platform` |
| `ga4_evt_availability_view` | `availability_view` | `evt_ecom` | `availability`,`stock_units` |

### Phase 2 — لید و ابزارهای تخصصی (هفته ۳–۴)
| Tag | GA4 event | Trigger |
|---|---|---|
| `ga4_evt_quote_request` | `quote_request` | `evt_leads` (Key Event) |
| `ga4_evt_callback_request` | `callback_request` | `evt_leads` |
| `ga4_evt_form_start` / `ga4_evt_form_submit` | `form_start`/`form_submit` | `evt_leads` |
| `ga4_evt_tool_view/row_edit/total_change/submit` | `tool_*` | `evt_leads` |
| `ga4_evt_compare_view` | `compare_view` | `evt_leads` |
| `ga4_evt_file_download` | `file_download` | `evt_media` + `clk_download` fallback |
| `ga4_evt_chat_click` | `chat_click` | `clk_messenger` (محدود به ویجت گفتگو) |
| `ga4_evt_phone_click` | `phone_click` | `clk_messenger` (`tel:`) |
| `ga4_evt_outbound_link` | `outbound_click` | `clk_link_ext` |
| `ga4_evt_broken_link_click` | `broken_link_click` | `clk_broken` |
| `ga4_evt_promo_view/click` | `view_promo`/`select_promo` | `evt_media` |
| `ga4_evt_video_progress` | `video_progress` | `evt_media` |
| `ga4_evt_newsletter` | `newsletter_subscribe` | `evt_leads` |
| `ga4_evt_review_submit` | `review_submit` | `evt_leads` |
| `ga4_evt_notify_me` | `notify_me_submit` | `evt_leads` |
| `ga4_evt_utm_missing` | `utm_missing` | `tl_all_pages` + landing + بدون utm + referral خارجی |

### Phase 3 — وفاداری، مالی، تجربه (هفته ۵–۶)
`ga4_evt_club_view`, `ga4_evt_referral_share/landing`, `ga4_evt_installment_view/credit_apply/credit_approved`, `ga4_evt_order_track_view`, `ga4_evt_return_request/warranty_claim/nps_submit`, `ga4_evt_pwa_*`, `ga4_evt_content_share`, `ga4_evt_web_vitals`, `ga4_evt_scroll_depth`, `ga4_evt_rage_click/dead_click`.
+ `html_linker_crossdomain` (config `_linker` برای `club.titana.ir`) → قبلش https را درست کنید.

### Phase 4 — فعال‌سازی/سرور (هفته ۷+)
`sgtm_tag_*` (نگاشت رویداد → endpoint)، `ga4_via_sgtm` (endpoint first-party `/g/collect`)، `gtm_srv_*` (tagهای سرور)، `html_offline_import_trigger` (وب‌هوک پنل → MPv2)، `cbk_dedupe_server`.
پیکسل‌های ثالثِ انتخابی (بسته به تصمیم مارکتینگ): `pix_yektanet_*`, `pix_reklamir_*`, `pix_meta_*` (فقط اگر از طریق آژانس اکانت خارج کار می‌کنید)، `clarity` (حرکت/ضبط — رایگان، ارزش CRO بالا)، `hotjar` (اختیاری). همه پشت `v_js_consent_state` + Boolean.

## ۴.۶ الگوی «یک تگ GA4، مسیردهی داخلی» (توصیه‌ی اصلی من)

به‌جای ۴۰ تگ GA4 Event، **۷ تگ** با مسیردهی:
```
ga4_evt_router_commerce   ← evt_ecom      (GA4 Event name = {{v_dl_event_name}} بدون پیشوند titana_)
ga4_evt_router_identity   ← evt_identity
ga4_evt_router_leads      ← evt_leads
ga4_evt_router_media      ← evt_media
ga4_evt_router_tools      ← tool_*
ga4_evt_router_ux         ← scroll/vitals/rage/dead (sampled)
ga4_evt_router_page       ← tl_all_pages
```
- GA4 event name را از خودِ dataLayer می‌گیرید (`{{event}}` با transform «replace titana_») → افزودن رویداد جدید = صفر تگ جدید.
- پارامترها: «Additional/web-only fields» مشترک روی همه → `page_type`,`brand_id`,`system_id`,`availability`,`undisclosed`,`dl_ver`,`dl_source`.
- هزینه: دیباگ کمی سخت‌تر؛ با `dl_ver` و `event_group` حل می‌شود. سود: نگهداشت ۱/۵، عدم فراموشی، هموژن بودن schema در BigQuery.

برای تگ‌هایی که **باید** جدا باشند (purchase، هر پیکسل ثالث، هر event با config متفاوت مثل `send_to` دوم) تگ مستقل بگذارید.

## ۴.۷ بلوکرهای اجباری (نه اختیاری)

| Blocker | منطق |
|---|---|
| `cbk_block_internal` | اگر `v_js_is_internal_traffic` → هیچ تگی fire نکند (با override در preview برای تست) |
| `cbk_block_preview` | `window.google_tag_data.bridgeMode`/preview → تگ‌های ثالث خاموش |
| `cbk_block_0_price_revenue` | اگر `price_undisclosed==true` → ارسال `purchase` با value صفر **متوقف** و `quote_request` جایگزین شود |
| `cbk_block_test_orders` | سفارش‌های تستی (تعداد ≤۱ با برچسب ادمین، یا order_id در لیست) → exclude |
| `cbk_once_purchase` | اگر `sessionStorage["purch_"+order_id]` ست است → skip |

## ۴.۸ ضدالگوها (در پروژه‌های ایرانی زیاد دیده می‌شود؛ انجام ندهید)

1. ❌ «All Pages» + `gtag('event', ...)` دستی در قالب (تکراری با GTM).
2. ❌ تگ `Click — All Elements` برای سنجش افزودن به سبد: کلیک روی هر جای صفحه conversion می‌شود. حتماً Custom Event.
3. ❌ `purchase` در صفحه‌ی «ممنون» بر اساس URL regex تنها (ریفرش = خرید دوباره). dedupe با `order_id`.
4. ❌ کپی همان پارامتر در ۳۰ تگ؛ با Event Settings مشترک.
5. ❌ بازکردن GTM روی کانتینر Live بدون Workspace و changelog.
6. ❌ فرستادن `value` به تومان و بعد مقایسه با پنل که به ریال است.
7. ❌ گذاشتن شماره موبایل در URL → بعداً در GA4 بک‌آپِ عمومی؛ پاک‌سازی با transform.
8. ❌ استفاده از Google Ads Conversion برای بازار ایران بدون اکانت تأییدشده: داده‌ی بی‌مصرف و ریسک تعلیق.

## ۴.۹ تقسیم کار تیمی (جلوگیری از «توپ در زمین طرف مقابل»)

| کار | مالک |
|---|---|
| تزریق `titana` dataLayer (path A) | فنی/بک‌اند |
| Auto-event listeners، پارس، نگاشت، تگ‌ها | تگ‌منیجر (بدون deploy) |
| GA4 property/events/CDs/audiences | داده/مارکتینگ |
| Offline import سفارش‌ها و لیدهای چت | بک‌اند + CRM admin |
| اصلاح `/leasing-404/`، `http://club`، `{Balance}` | فنی (بک‌لاگ، ولی بلاکرِ داده است) |
| UTM governance و لینک‌ساز `/go/` | مارکتینگ |
