# ۵) پیکربندی GA4، مقصدها، و اتصال آفلاین

## ۵.۱ Property — تنظیمات را این‌طور بزنید (همین، نه پیش‌فرض‌ها)

| بخش | مقدار | چرا |
|---|---|---|
| Time zone / Currency | `Asia/Tehran` / `IRR` | ریتم صنفی و گزارش روزانه؛ ریال چون کد Toman وجود ندارد |
| Data retention | **14 months** | cohort مصرفیِ B2B (۹۰–۱۸۰ روز) بدون این محاسبه‌ناپذیر است |
| Data-redaction | ✅ «Redact email addresses in URL and referrer» | محافظت از موبایل/ایمیل OTP در URL |
| Ads personalization / Google Signals | ❌ | داده‌ی پزشکی + عدم کاربرد تبلیغاتی گوگل در ایران |
| Internal traffic filter | Define filter «Office & Admin» با `user_ip` از sGTM یا `hostname`+کوکی | آزمون‌های داخلی، ۳۰٪ داده‌ی شماست |
| Unsampled reports | ✅ | GA4 برای segmentهای دقیق |
| Sessions with no engagements = default | ✏ تغییر: برای بیزینس ما «session با ≥۱ view_item» هم ارزش دارد؛ این را در marts بسازید نه در GA4 |
| Cross-domain measurement | `titana.ir`, `www.titana.ir`, `club.titana.ir`, `staging.titana.ir` | باشگاه مشتریان |
| Referral exclusion | `*.titana.ir` + درگاه‌ها: `ik.pay`, `zarinpal`, `idpay`, `pay.ir`, `samancard`, `ap`, `pec.shaparak`, `shaparak.ir` + SMS gateway domain | وگرنه هر بازگشت از درگاه، «ارجاع» می‌شود و خرید به `Referral` می‌چسبد |
| Roll-up property | اگر اپ موبایل/سایت‌کلاب دارید → از روز اول GA4 **Roll-up** ببندید (غیرقابل‌اعمال برای گذشته است) | یکپارچگی LTV |

## ۵.۲ رویدادهای سفارشی (Custom events) و Key events

در GA4 هیچ رویدادی «ثبت» نمی‌خواهد؛ فقط پارامتر/ابعاد. ولی برای نظم:

**Key events (حداکثر ~۳۰–۵۰؛ این ۹ تا را علامت بزنید):**
`purchase`, `quote_request`, `tool_submit`, `signup`, `profile_complete`, `callback_request`, `login_gate_hit` *(برای سنجش مانع، نه تبدیل!)*, `chat_click`, `file_download`.

> ⚠ دو نکته‌ی فنی: (۱) `login_gate_hit` را به‌عنوان conversion در کمپین‌ها استفاده **نکنید** — این سنجه‌ی اصطکاک است؛ (۲) `add_to_cart` در GA4 به‌صورت built-in شناخته می‌شود؛ همان نام را بگذارید تا Insight reports و funnelهای آماده کار کنند.

## ۵.۳ ابعاد سفارشی (Custom dimensions) — لیست قطعی

 سقف پراپرتی محدود است؛ فقط این‌ها را بسازید (نام ⇄ پارامتر ⇄ سطح). **ذاتاً** رویداد-محور یا کاربر-محور:

| # | Dimension (fa) | GA4 param | Scope | توضیح |
|---|---|---|---|---|
| 1 | نوع صفحه | `page_type` | Event | موتور تفکیک همه گزارش‌ها |
| 2 | شناسه برند | `brand_id` | Event | عددی/پایدار |
| 3 | اسلاگ برند | `brand_slug` | Event | خوانایی گزارش |
| 4 | گروه مبدأ برند | `origin_group` | Event | swiss/korean/iranian… |
| 5 | سیستم سازگار | `system_id` | Event | ⚑ کلید attach-rate |
| 6 | دسته کالا | `category` | Event | fixture/prosthesis/… |
| 7 | خانوادۀ محصول | `product_family` | Event | — |
| 8 | وضعیت موجودی | `availability` | Event | in_stock/out_of_stock/sourcing |
| 9 | تعداد موجودی | `stock_units_bucket` | Event | 0/1-20/21-100/101+ (عددی را در BQ نگه دارید) |
| 10 | قیمت پنهان | `undisclosed` | Event | true/false |
| 11 | نوع آفر | `offer_type` | Event | free_kit/free_fixtures/rial_discount/none |
| 12 | اندازه پکیج | `package_size` | Event | 30/70/100/150/200 |
| 13 | اقساطی | `installment` | Event | — |
| 14 | منبع رویداد | `cta_id` | Event | pdp_card/model_page/quick_order/content/… |
| 15 | نوع فایل | `doc_type` | Event | catalog/pricelist/exocad/failure_form |
| 16 | ابزار | `tool` | Event | quick/smart/custom_package/compare |
| 17 | قفل‌شدگی هویت | `blocked_action` | Event | cart/checkout/review/referral |
| 18 | کانال چت/کلیک | `channel` | Event | whatsapp/telegram/ble/phone |
| 19 | شناسه بنر | `creative_id` | Event | از `Photos/Sliders/{id}` |
| 20 | مرحله چک‌اوت | `checkout_step_name` | Event | — |
| 21 | نتیجه فرم | `form_result` | Event | ok/error |
| 22 | کد خطا | `error_code` | Event | OTP/فرم/درگاه |
| 23 | نسخه دیتالایه | `dl_ver` | Event | ⚑ برای مقایسه‌ی قبل/بعد deploy |
| 24 | منبع داده | `dl_source` | Event | server/dom |
| 25 | گروه محیط | `env` | Event | prod/staging |
| U1 | نقش کاربر | `user_role` | **User** | dentist/clinic/lab |
| U2 | شهر | `user_city` | **User** | — |
| U3 | استان | `user_province` | **User** | برای SLA تحویل |
| U4 | نوع مرکز | `org_type` | **User** | — |
| U5 | باند مصرف | `implants_band` | **User** | ⚑ پول‌سازترین بعد |
| U6 | سطح کلاب | `club_tier` | **User** | bronze/silver/gold/none |
| U7 | وضعیت احراز | `verification_state` | **User** | pending/verified/rejected |
| U8 | سفارش اول؟ | `is_new_customer` | **User** | از ایمپورت |
| U9 | روز از آخرین سفارش | `days_since_last_order` | **User** | از ایمپورت (risky but useful) |
| U10 | سیستم اصلی | `primary_system` | **User** | از استنتاج/پرسش |

## ۵.۴ مخاطب‌ها (Audiences) — با تعریف دقیق و دوره‌ی عضویت

| Audience | شرط | Membership |
|---|---|---|
| `aud_visitor_high_intent_7d` | `quote_request` or `tool_submit` or `callback_request` گذشته، بدون `purchase` | 7 روز |
| `aud_cart_abandon_48h` | `view_cart` بدون `purchase` | 1 روز |
| `aud_gate_blocked_7d` | `login_gate_hit` ≥1، بدون `signup` | 7 روز |
| `aud_oos_waiter` | `notify_me_submit` | 30 روز |
| `aud_implants_16plus` | `user:implants_band` in (16-30, 31-60, 60+) | 540 روز |
| `aud_fixture_no_prostho_45d` | `purchase` با `category=fixture`، بدون prosthesis در ۴۵ روز | 45 روز |
| `aud_churn_risk` | `user:days_since_last_order` > 60 | 60 روز |
| `aud_swiss_brand_lover` | `brand_id` in (implantswiss, SIC, SGS, ROOTT, Biomate, TRI) ≥2 event | 90 روز |
| `aud_installed_avita` | `system_id=avita` on purchase/view_item | 180 روز |
| `aud_pwa_installed` | `pwa_prompt_accept` | 540 روز |
| `excl_customers_180d` | `purchase` | 180 روز (برای Exclude در کمپین‌های آگاهی) |
| `excl_internal` | `internal_traffic` | 30 روز |

مخاطب‌ها را **از رویداد بسازید، نه از «میانگین زمان»/realtime**؛ و برای هر مخاطب ستون «کجا استفاده می‌شود» را در `data/audiences.csv` پر کنید، وگرنه ماه سوم ۴۰ مخاطب یتیم دارید.

## ۵.۵ Consent (واقع‌بینانه برای ایران)

```
html_consent_init  (Page View / top, blocking)
 → default: {analytics_storage:'granted', ad_storage:'denied', ad_user_data:'denied',
             ad_personalization:'denied', functionality... }
 → اگر بنر دارید: denied پیش‌فرض + update پس از انتخاب؛ ذخیره در localStorage('titana_consent_v1')
 → اگر بنر ندارید: همان default + یک تگ «consent_banner_required» برای سنجش ریسک
```
توصیه‌ی صریح: حتی اگر الزام قانونیِ GDPR ندارید، یک بنر ساده‌ی دوزبانه + لینک «حریم خصوصی» بگذارید. دو دلیل: (۱) اعتماد کاربرِ ایرانیِ حساس به داده‌ی پزشکی؛ (۲) اگر روزی کمپین خارجی/اکانت آژانسی اجرا کنید، بدون Consent Mode داده‌های شما ناسازگار و قابل‌تعلیق است.

## ۵.۶ Import آفلاین — جایی که ۶۰٪ واقعیت است

سه جریان:

| جریان | محتوا | فرکانس | روش |
|---|---|---|---|
| A. سفارش‌ها | `order_id, account_hash, value_toman, margin, fixtures_units, payment_method, city, is_first_order` | روزانه | BigQuery (best) → یا GA4 User-property import با dataset `offline_orders` (کلید `user_id` = `account_hash`) |
| B. لیدهای چت/تلفن | `lead_id, account_hash/mobile_hash, status(new/qualified/won/lost), agent_id, created_ts` | روزانه | CSV از CRM → BQ join روی `account_hash` |
| C. اعتبار/کلاب | `tier, points, limit, approved_amount` | هفتگی | BQ |

قالب بهینه: یک view/جدول `stg_offline_orders` در BQ + marts؛ و در GA4 فقط دو چیز: (۱) User properties (`is_new_customer`, `days_since_last_order`, `club_tier`) تا مخاطب‌سازی کار کند، (۲) یک event `order_enriched` با `value` واقعی اگر می‌خواهید در GA4 هم ROI ببینید. **هیچ‌وقت GA4 را منبع درآمد گزارش نکنید**؛ پنل/BI منبع است، GA4 منبع «رفتار».

## ۵.۷ Enhanced Conversions (برای لید) — اگر/وقتی پلتفرم اجازه داد

سناریو: فرم `callback_request`/`quote_request` → hash ایمیل/موبایل در مرورگر، ارسال به GA4 با `enhanced_conversions=1` (و در صورت استفاده از گوگل‌ادز آژانسی، `ECD` با `test_event_name`). در مسیر B (بدون دسترسی فرم) **انجام ندهید**؛ hash از DOM نگیرید — خطای پارس = داده‌ی فاسد.

## ۵.۸ Server-side GTM (فاز ۴): معماری پیشنهادی

```
titana.ir  ──(web container)──> https://tms.titana.ir/gt/js  (sGTM on Cloud Run / Docker روی VPS آلمان)
   sGTM tags: GA4 (forward+enrich), Clarity, Yektanet/Reklamir pixels, WhatsApp click server hook,
              first-party cookie (titana_id), IP normalization (/32→/24 drop), bot filter,
              server dedupe, raw-event tee → BigQuery (firehose)
```
مزیت برای **این** سایت: (۱) پرهیز از ad-blocker و اختلال شبکه‌ی داخلی (مهم‌ترین دلیل در ایران)؛ (۲) کوکی اول‌طرف → هویت پایدارتر؛ (۳) حذف ۳–۵ تگ third-party از صفحه → LCP/CINP بهتر؛ (۴) آینه‌ی کامل رویدادها در BQ.
ریسک: یک نقطه‌ی شکست؛ اگر tms down شد داده نمی‌آید → **همیشه** dual-fallback تا ماه دوم (web+server) و سپس حذف web با تست ۴۸ ساعته.

## ۵.۹ واقعیتِ مقصدها در بازار ایران (تصمیم‌گیری آگاهانه)

| مقصد | وضعیت | توصیه |
|---|---|---|
| Google Ads | دسترسی رسمی برای تبلیغ‌کننده‌ی ایرانی محدود است؛ اکانت‌ها معمولاً از طریق آژانس/حساب خارج اجرا می‌شوند | تگ‌های AW را **آماده ولی خاموش** نگه دارید (`tg_enable_gads=false`)؛ اگر آژانس اکانت داد، فقط toggle شود. Conversion tracking را روی `quote_request` و `purchase` ببندید، نه روی `add_to_cart` |
| Meta (Instagram) | تبلیغ از ایران غیررسمی؛ اما **Pixel روی سایت** مانع ندارد | `fbq` را از طریق GTM + sGTM بفرستید تا اگر روزی کمپین گرفتید داده history داشته باشید؛ در غیر این صورت فعلاً فقط `content_view`/`custom_event` (بدون PII) |
| شبکه‌های بومی (یک‌تپن/رکلامیر/اسنپ‌اد/…) | هرکدام تگ/پیکسل دارند | پشت `tg_enable_*`؛ فقط conversion اصلی (`quote_request`,`purchase`)؛ نه view |
| واتساپ/بله/تلگرام | پیکسل ندارند | سنجش با `chat_click` + **match** در BQ با لاگ CRM؛ بهترین «تبلیغ» اینجا لینک `/go/` با UTM است |
| Clarity / Hotjar | کار می‌کنند | Clarity را اولویت دهید (رایگان، session replay، heat map)؛ برای تحلیل مودال تنوع/سبد بی‌ارزش است |
| GA4 | کار می‌کند، اما از شبکه‌ی داخلی ممکن است افت/تأخیر داشته باشد | به همین دلیل sGTM/first-party endpoint و **حداقل یک مقصدِ مستقلِ داخلی** (وب‌آمار/دیتاورد) برای صحت‌سنجی حجم ترافیک |
| مقصد داخلی (وب‌آمار/دیتاورد/سنجاق) | داده‌ی مستقل برای sanity-check | فقط `page_view` + `purchase` (حجم، نه رفتار ریز) |

## ۵.۱۰ پنل‌های Looker Studio (خروجی نهایی که مدیر می‌بیند)

1. **Executive / هفته‌ای:** GMV، حاشیه، Active Clinics، CAC qualified، LTV:CAC، QoQ — با drill به کانال.
2. **Funnel Health:** A (هویت) + B/C/D/E/I با % تغییر هفتگی و alert.
3. **Brand & System:** Brand GMV share، Switching، Attach-rate به تفکیک `system_id`، Suppressed demand.
4. **Media & Content:** UTM quality (٪untagged)، promo CTR، download→lead، video VTR، chat→won.
5. **Data QA:** پوشش رویداد، ترکیب نسخه‌ی `dl_ver`، match-rate رویداد `purchase` با پنل، نرخ خطای پارس قیمت.

## ۵.۱۱ کنترل حجم و هزینه

| رویداد | حجم مورد انتظار | تصمیم |
|---|---|---|
| `product_impression`, `scroll_depth`, `element_visibility` | ۱۰–۴۰ hit/PV | `v_js_sample` ۱۰٪ در GA4؛ ۱۰۰٪ در sGTM→BQ |
| `variant_list_expand`, `tool_row_edit` | متوسط | GA4 + BQ |
| `file_download`, `chat_click` | کم | GA4 + BQ |
| `page_view` + commerce + leads | — | همیشه ۱۰۰٪ |

سقف هشدار: اگر hit/session > ۱۲ شد، sample را به ۵٪ کاهش دهید و در `data/weights.csv` یادداشت کنید.
