# ۱) معماری آنالیز داده‌ی موردنیاز تیتانا (قبل از هر تگی)

هدف این سند: مشخص کند این بیزینس برای «درآوردن ریزترین دیتای مشتریان» به چه **ساختار** داده‌ای نیاز دارد. تا این تعریف نشود، هر تگی که در GTM بزنید فقط ترافیک را نشان می‌دهد، نه مشتری را.

---

## ۱.۱ اصل حاکم: مشتریِ تیتانا «مطب» است، نه «کاربر»

| چیزی که GA به‌طور پیش‌فرض می‌بیند | چیزی که بیزینس باید ببیند |
|---|---|
| کاربر ناشناس با `client_id` | **حساب حرفه‌ای تأییدشده** (دندانپزشک/کلینیک/لابراتوار) |
| سشن ۳۰ دقیقه‌ای | **سیکل مصرف** (هر چند روز یک‌بار پکیج می‌خرد) |
| تراکنش ۱ باره | **LTV + سهم کیف پول (Share of Wallet)** |
| تبدیل/عدم‌تبدیل | **مقدارِ بالقوه** (چند فیکسچر در ماه مصرف می‌کند) در برابر **مقدارِ خریداری‌شده از تیتانا** |
| دستگاه/مرورگر | **پلتفرم/سیستم ایمپلنتِ مستقرشده** (Installed Base) — چون قطعات پروتز به آن قفل‌اند |

> نتیجه‌ی استراتژیک: **۷۰٪ دقت در این بیزینس از «هویت و اتصال» می‌آید، نه از «رویدادهای بیشتر».** پس ستون اول معماری، Identity Resolution است، نه Tag.

---

## ۱.۲ هشت پرسش تجاری که معماری باید جواب دهد

هر کدام یک «شاخص مادر» دارد که بدون ساختار داده‌ی زیر قابل محاسبه نیست:

| # | پرسش | شاخص مادر | داده‌ی لازم (که امروز یا نیست یا پراکنده است) |
|---|---|---|---|
| Q1 | کدام کانال **مشتریِ سودآور** می‌آورد، نه ترافیک؟ | `BLended CAC` و `CAC:LTV` به تفکیک کانال | UTM منظم + لید→مذاکره→سفارش (CRM) + حاشیه‌ی سود هر خط کالا |
| Q2 | هر مطب چند فیکسچر در ماه مصرف می‌کند و چند را از ما می‌خرد؟ | `Share of Wallet` | فیلد ثبت‌نام `implants_per_month` + تاریخچه‌ی سفارش |
| Q3 | سیستم ایمپلنتِ غالبِ هر مشتری چیست و چقدر قابل مهاجرت است؟ | `Installed-base concentration` | `primary_system_id` (از سبد خرید/تاریخچه) + سازگاری پلتفرم |
| Q4 | کدام برند را باید در سایت تقویت کنیم تا سود کل بالا برود؟ | `Brand GMV mix × margin` | شناسه برند (از `FieldOptions.Id`) روی هر رویداد + حاشیه سود |
| Q5 | بزرگ‌ترین نشتی قیف کجاست: درگاه لاگین، انتخاب تنوع، یا قیمت پنهان؟ | `step drop-off` با فیلتر نقش/شهر | رویدادهای مرحله‌ای استاندارد + `login_gate_hit` |
| Q6 | فروش انسانی (چت/تلفن/واتساپ) چه سهمی در بسته‌شدن فروش دارد؟ | `Assisted-close ratio` | شناسه اپراتور/کانال چت + بسته‌شدن در CRM + Match |
| Q7 | چه تقاضایی به‌خاطر موجودی/قیمت صفر سرکوب می‌شود؟ | `Suppressed demand value` | `availability`, `stock_units`, `price_undisclosed` + فرم «خبرم کن» |
| Q8 | کدام مشتری در آستانه‌ی ریزش است؟ | `Churn-risk score` | `days_since_last_order / avg_reorder_cycle` + درخواست مرجوعی/گارانتی |

---

## ۱.۳ مدل موجودیت (Entity Model) — «ریزترین دیتای مشتری» یعنی چه

```
ORG (مطب/کلینیک/لابراتوار)  1 ── *  ACCOUNT (دندانپزشک/کاربر)  1 ── *  SESSION  1 ── *  EVENT
 │                                │                                        │
 │                                └── * CREDIT_PROFILE (اقساطی/کلاب)      └── * ORDER ── * ORDER_LINE ──> VARIANT ──> PRODUCT ──> BRAND ──> COUNTRY
 └── * LOCATION (شهر/استان)                                                  └── * TICKET (گارانتی/فیلر/مرجوعی)
 └── * CONTRACT (قرارداد/حساب‌جاری)
```

### جدول ابعاد اجباری

| بُعد | کلید | اعضا/سطح | منبع داده |
|---|---|---|---|
| `dim_account` | `account_id` (هش‌شده) | شناسه‌ی حساب تیتانا | پنل ادمین/CRM (با `hashed_phone` به‌عنوان join key) |
| `dim_org` | `org_id` | نوع: مطب منفرد / کلینیک / لابراتوار / بیمارستان / شبکه زنجیره‌ای؛ سال تأسیس مطب | فرم ثبت‌نام + شماره نظام صنفی (بدون ذخیره‌ی عدد واقعی در آنالیتیکس) |
| `dim_geo` | `city_id` | شهر، استان، تهران/مشهد/سایر (چون SLA تحویل و تسویه‌درمحل فرق دارد) | آدرس سفارش + IP-derived region (فقط سطح استان) |
| `dim_role` | `role_id` | جراح ایمپلنت / پروتزیست / پریو / عمومی / تکنسین لاب / مدیر خرید | فرم ثبت‌نام + الگوی خرید (استنتاجی) |
| `dim_capacity` | band | `implants_per_month`: 0–5 / 6–15 / 16–30 / 31–60 / 60+ | **پرسش در ثبت‌نام** (zero-party) — مهم‌ترین فیلد کل بیزینس |
| `dim_installed_base` | set | سیستم‌های مستقر (Avita, Arum, Naxis…)، پلتفرم (Narrow/Regular)، نوع کانکشن | استنتاج از تاریخچه‌ی خرید قطعات پروتز + پرسش |
| `dim_brand` | `brand_id` (عددی) | از `FieldOptions.Id` — ۲۵+ برند؛ `origin_group` (سوئیسی/آلمانی/آمریکایی/ایتالیایی/کره‌ای/ایرانی) | سایت (بخش ۰.۳-ب B2) → فایل `data/dim-brand.csv` |
| `dim_product` | `product_id` | دسته (fixture/prosthesis/kit/healing…)، نوع (پکیج/تک‌واحدی)، `has_offer`، `is_installment_eligible`، `price_undisclosed` | کاتالوگ |
| `dim_variant` | `sku`/`variant_id` | `diameter` (3.3/3.7/4/4.5/5)، `length` (6/8/10/12/14)، `platform`، `connection` | صفحه‌ی `model/*` |
| `dim_offer` | `offer_id` | نوع آفر: free-fixtures(25/40/22…)، free-surgical-kit، free-motor-and-angle، rial-discount، free-goods | لینک‌های `/search/package/free-*` + متادیتای پکیج |
| `dim_promo_slot` | `creative_id` | بنر/اسلایدر (`Photos/Sliders/{id}`)، منوی لندینگ (`LandingPageItemMenus/{id}`) | DOM |
| `dim_channel` | `source/medium/campaign` | + کانال‌های بومی: instagram, telegram, bale, eitaa, aparat, sms, enamad/emalls, imed directory | UTM governance (بخش ۱.۹) |
| `dim_credit` | tier + limit | سطح کلاب، سقف اقساط، مانده، وضعیت چک/ضامن | کلاب/مالی |
| `dim_service` | `ticket_id` | گارانتی فیکسچر فیلر، مرجوعی ۳۰ روزه، تعویض، درخواست پشتیبانی | CRM/فرم |

---

## ۱.۴ دامنه‌های داده (۱۰ دامنه) — و اینکه هر کدام از کجا می‌آید

| دامنه | نمونه فیلد | منبع | ریسک/نکته |
|---|---|---|---|
| 1. هویت و صلاحیت | نقش، نوع مرکز، شهر، مجوز (وضعیت تأیید، نه شماره) | فرم ثبت‌نام + تأیید مدارک | هیچ‌وقت شماره نظام پزشکی را در GA4 نفرستید |
| 2. ظرفیت مصرف | `implants_per_month`، تعداد صندلی، تیم جراح | پرسشگرانه (zero-party) | کل LTV؛ ارزشش بالاترین است چون رایگان است |
| 3. نیت و تقاضا | جست‌وجوی سایت، فیلتر قیمت، مقایسه برند، لیست قیمت، دانلود کاتالوگ | رفتار | سیگنال پیش‌بین؛ باید در BigQuery نگهداری شود نه فقط GA4 |
| 4. تجاری/سبد | افزودن، حذف، تنوع، تعداد، کوپن، مبلغ | رفتار + سرور | مبلغ واقعی باید از سرور بیاید نه DOM |
| 5. معامله | `order_id`, خطوط، پرداخت، تسویه‌درمحل/آنلاین، مرجوعی | پنل/DB | «سورس حقیقت»؛ GA فقط بازتاب آن است |
| 6. مالی/اعتباری | درخواست اقساط، سقف، بازپرداخت، معوقه | مالی | یک قیف جدا با تبدیل «تأیید اعتبار» |
| 7. وفاداری | امتیاز کلاب، سطح، هدیه، دعوت موفق | کلاب | نیازمند cross-domain |
| 8. پس از فروش | گارانتی فیلر، مرجوعی، NPS، زمان تحویل واقعی | پشتیبانی | پیش‌بین ریزش؛ اگر اندازه نگیرید، کمپین شما مشتریِ ناراضی را برمی‌گرداند! |
| 9. محتوا و آموزش | ویدیو، بلاگ/برندپیج، آپارات، دانلود Library ExoCAD | رفتار | طبقه‌بندی «رشد‌یافته vs آماده‌ی خرید» |
| 10. تعامل انسانی | چت (اپراتور/بات)، تماس، واتساپ/بله/تلگرام، فرم درخواست تماس | رفتار + CRM | بدون بازگشت نتیجه، Attribution به چت بیش‌برآورد می‌شود |

---

## ۱.۵ هویت‌بخشی و اتصال (Identity Resolution) — قلب معماری

**مسئله:** کاربر در مرورگر ناشناس است، در موبایلِ OTP لاگین می‌کند، بخشی از فروش در واتساپ بسته می‌شود، و سفارش نهایی در پنل ثبت می‌شود. اگر این سه به هم وصل نشوند، تمام گزارش‌های ROAS دروغ است.

**الگوی پیشنهادی (سه‌لایه):**

```
L1  GA4 client_id                ← همه‌ی ترافیک، حتی ناشناس
L2  titana_uid = SHA256(0 + 98 + mobile)  ← از لحظه‌ی لاگین/OTP موفق؛ در cookie اول‌طرف + user property + BigQuery
L3  org_id (مطب)                ← از CRM/پنل، روی L2 سوار می‌شود
```

قوانین:
1. `titana_uid` **هش‌شده** است، با نمک (salt) ثابتِ داخلی؛ عدد خام موبایل هرگز به GA4/هر تگ ثالث نمی‌رود.
2. به‌محض لاگین موفق، `client_id ↔ titana_uid` در سمت سرور (یا در BigQuery از طریق جدول `map_client_uid`) ثبت می‌شود؛ نتیجه: کمپینِ «ناشناسِ» دیروز، امروز به LTV امروز وصل می‌شود.
3. برای تبدیل‌های بیرون از سایت (تماس/چت/اینسپکتور): **Offline Conversion Import** با کلید `gclid`/`wbraid` (اگر تبلیغات خارجی دارید) و در غیر این صورت با `titana_uid` (Import به GA4 via Measurement Protocol / یا فقط در BigQuery-Looker).
4. موبایلِ first-open بعد از ۷ روز: اگر کاربر روی همان دستگاه برگردد، `client_id` تکرارپذیر است → با LTV ۹۰ روزه، تصمیم‌گیری کانالی صحیح می‌شود.

---

## ۱.۶ قیف‌ها و رویدادهای مادر (Canonical Funnels)

```
A) قیف هویت (اول از همه!)
   landing → login_gate_hit → otp_send → otp_verify_ok → profile_complete → docs_verified → first_order
B) قیف کاشی‌کاری محصول (PDP)
   listing_view → product_click → product_detail → variant_list_expand → variant_select → add_to_cart
C) قیف پکیج/استعلام (قیمت ۰)
   package_view → price_undisclosed_view → quote_request / chat_click / call_click → quote_sent → won
D) قیف سبد/پرداخت
   cart_view → checkout_step(1..n) → payment_method_select → purchase → order_track_view
E) قیف ابزارهای تخصصی
   quick_order(/order) | smartorder | customizedpackages | compare/brand  → submit → add_to_cart
F) قیف مالی
   leasing_view → eligibility_check → credit_apply → approved → funded
G) قیف وفاداری/ارجاع
   club_view → referral_share → referral_signup → referral_first_order
H) قیف محتوایی
   brand_landing → video_view → file_download → (review_submit | add_to_cart_from_content)
I) قیف احیای تقاضا
   out_of_stock_view → notify_me_submit → restock_sms → recovered_order
```

**تعریف «تبدیل» برای تیتانا (به ترتیب ارزش):**
1. `purchase` (آنلاین/تلفنیِ ثبت‌شده) — macro
2. `order_submit` در سفارش سریع/هوشمند/پکیج اختصاصی — macro lead
3. `quote_request` برای پکیج‌های بدون قیمت — macro lead
4. `otp_verify_ok` + `profile_complete` (ورود مشتری واجد شرایط) — macro، چون در B2Bِ گیت‌شده، *خودِ ثبت‌نام یعنی لید*
5. `callback_request`, `chat_click`(≥۱۵ ثانیه مکالمه), `call_click`, `price_list_download`, `catalog_download`, `exocad_library_download` — micro با وزن
6. `review_submit`, `pwa_install`, `referral_send`, `follow_telegram/instagram` — micro اجتماعی

> **وزن‌دهی** (برای مدل‌سازی کمپین و Looker): `purchase`=100، `order_submit`/`quote_request`=40، `otp_verify_ok`=25، `callback_request`=15، `file_download`=8، `chat_click`=5، `review_submit`=5، `pwa_install`=4. اعداد را در `data/weights.csv` نگه دارید تا در همه‌جا یک‌سان باشد.

---

## ۱.۷ مدل‌های LTV/CAC/Share-of-Wallet (چیزی که مدیر می‌خواهد)

```
GMV_month            = Σ (order_line.unit_price × qty)  [+ ارزش کالای رایگانِ آفر، جداگانه گزارش شود]
Margin_month         = Σ (order_line.qty × unit_margin)
Active_Clinic        = حسابی که در ۹۰ روز گذشته ≥۱ سفارش داشته
Reorder_Cycle_d      = median(diff(سفارش n+1 − سفارش n))   ← عدد حیاتیِ این صنف
Predictable_Monthly  = Active_Clinics × (Margin_month میانگین)
LTV_12m(clinic)      = Σ_{m=1..12} margin_m × retention(m)      retention از منحنی بقای واقعی
CAC_channel        = spend_channel / qualified_new_accounts_channel     ← «Qualified» یعنی docs_verified
LTV:CAC هدف        ≥ 3.0 (B2B تجهیزات، بعد از ۱۲ ماه)
Share_of_Wallet    = fixtures_bought_from_us / (implants_per_month × 30 × capture_ratio)
Attach_Rate        = lines_prosthetic / lines_fixture  به تفکیک برند  ← موتور سودِ نهاییِ یک تأمین‌کننده
Switching_Index    = سهم مشتریانی که در ۶ ماه برندِ سیستم اصلی‌شان عوض شده
Suppressed_Demand  = Σ (قیمت میانگین × تعداد درخواستی) که به‌دلیل ناموجود/قیمت‌۰ ثبت نشده
```

**چرا Attach_Rate مهم‌ترین عددِ سودآور است:** فیکسچر را یک‌بار می‌خرند؛ اما هیلینگ‌اباتمنت، اباتمنت، ایمپرشن‌کوپینگ، اسکن‌بادی، آنالوگ — همگی به همان «سیستم» قفل‌اند. اگر کمپینِ شما فقط فروش فیکسچر را بهینه کند، سودِ ۵ سالِ آینده‌ی آن مشتری را در جای دیگر می‌خرد. پس:
- تگ‌ها باید `system_id` (خانواده‌ی سازگار) را روی هر رویداد ببرند.
- مخاطبِ کمپینِ «قطعات پروتز» باید کسانی باشند که فیکسچرِ آن برند را خریده‌اند ← دقیقاً همین، دلیل وجودِ L2 در بخش ۱.۵ است.

---

## ۱.۸ انبار داده‌ی پیشنهادی (ساختار فیزیک)

```
[وب‌سایت + dataLayer] → GTM → GA4 ──(Native Export)──> BigQuery
                          └→ sGTM (اختیاری، فاز ۴) ──> BigQuery  (همه‌ی eventها + پاک‌سازی)
[پنل فروش/CRM/کلاب/مالی] → ELT روزانه (نمایه/فایل) ──> BigQuery: stg_*
                                                        ↓
                                     dbt: dim_*  fact_event  fact_order  fact_order_line
                                          fact_lead  fact_ticket  fact_credit  map_client_uid
                                                        ↓
                                     marts: mrt_funnel_daily, mrt_account_360,
                                            mrt_channel_roi, mrt_brand_share, mrt_retention
                                                        ↓
                                        Looker Studio (پنل مدیر) + Gmail/Telegram Alerts
```

حداقل DDL (برای شروع؛ کامل‌تر در `data/warehouse-ddl.sql`):

```sql
create table analytics.fact_event (
  event_ts     timestamp,
  event_name   string,          -- titana_* / CED name
  session_key  string,
  client_id    string,
  account_hash string,          -- NULL تا زمان لاگین
  page_type    string,          -- home|listing|pdp|model|cart|tool|content|auth|checkout|confirm
  product_id   int64,  brand_id int64,  system_id string,  category string,
  variant      struct<diameter string, length string, platform string>,
  value_toman  numeric,  currency string,
  params       json            -- باقی پارامترها؛ بدون PII خام
);
create table analytics.fact_order_line (
  order_id string, account_hash string, product_id int64, variant_id int64,
  brand_id int64, qty int64, unit_price_toman numeric, discount_toman numeric,
  free_qty int64,              -- «۲۵ واحد رایگان» آفر
  line_margin_toman numeric, installment bool, order_ts timestamp
);
```

تصمیم‌های آگاهانه:
- GA4 = لایه‌ی **فعال‌سازی** (مخاطب، گزارش سریع، دیباگ). BigQuery = **حقیقت** (ترکیب با مالی و CRM). هیچ‌وقت عددِ پولیِ نهایی را از GA4 برای مدیر گزارش نکنید؛ از marts.
- ریزش GA4: رویدادهای کم‌ارزش ولی پرحجم (scroll/impression) را با نمونه‌برداری ۱۰٪ بفرستید تا حجم/هزینه کنترل شود، اما در sGTM کامل به BigQuery بروند.

---

## ۱.۹ UTM و حاکمیت کانال (بدون این، B2B در Direct گم می‌شود)

الزاماً: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` (شناسه‌ی خلاقه), `utm_term` (برند هدف‌گیری‌شده).

| کانال بومی | `utm_source` | `utm_medium` | نکته |
|---|---|---|---|
| بیو/استوری اینستاگرام | `instagram` | `social_bio` / `stories` | لینک بیو UTM نمی‌پذیرد ← لینک به مسیر کوتاه `/go/ig` که ریدایرکت ۳۰۲ با UTM می‌زند (این مسیر را فنی باید بسازد) |
| کانال/گروه تلگرام | `telegram` | `channel` | در موبایلِ ایرانیِ بدون پروکسی، تگ‌های گوگل ممکن است افت داشته باشند → سنجش با `untagged_ratio` |
| بله / ایتا | `bale`, `eitaa` | `social` | |
| واتساپِ پشتیبانی (کلیک از سایت) | `titana` | `whatsapp_click` | تبدیل «به» واتساپ را macro micro ندانید؛ وزن ۵ |
| پیامک OTP/کمپین | `sms` | `crm_otp` / `campaign` | لینک کوتاه دامنه‌ی خودی، نه کوتاه‌کننده‌ی سوم |
| آپارات/یوتیوب | `aparat` | `video` | |
| گوگل ارگانیک | (خودکار) | `organic` | با `gsc` در Looker جفت شود |
| دایرکتوری‌های صنفی/IMED/ایمالز | `directory` | `referral` | |

قانون فنی: هر لینکِ خروجی از تیم مارکتینگ باید از **سازنده‌ی لینک** (`/go/`) تولید شود؛ تگ `utm_missing` در فاز ۱ روشن می‌شود تا تخلف‌ها دیده شوند، و در ماه دوم گزارش «درصد لینک‌های بدون UTM» به تیم داده می‌شود.

---

## ۱.۱۰ خط قرمزها: چه چیزی **نباید** ثبت شود

چون کالا «پزشکی» است و مشتری «درمانگر»، مرزها را از روز اول مشخص کنید:

1. ❌ هیچ داده‌ای درباره‌ی **بیمار**: نام، کد پرونده، تاریخ جراحی، تصویر رادیوگرافی، تعداد ایمپلنتِ بیمارِ خاص. (حتی در نام فایل/URL هم نباشد: `/Failure_Form/{brand}.pdf` درست است، `/Avita/14050621-Reza-3implants.pdf` فاجعه است.)
2. ❌ شماره نظام پزشکی، کد ملی، شماره پرونده/فکس مطب، آدرس دقیق پلاک → در تگ‌ها نه؛ فقط در DB داخلی و هش‌شده/مجاز.
3. ❌ پیامِ چت و متن فرمِ «فرم فیلر/گارانتی» (شامل شرح مورد بالینی) → هرگز به تگ ثالث.
4. ❌ ارسال خامِ `user_id`: فقط `titana_uid` هش‌شده، و فقط به GA4/BigQueryِ خودتان (نه به پیکسل ثالث).
5. ✅ شفافیت: لینک «حریم خصوصی» در فوتر، و در Consent Banner دقیقاً بنویسید چه می‌گیرید (رفتار خرید، نه داده‌ی بالینی).

---

## ۱.۱۱ SLO کیفیت داده (عدد، نه شعار)

| سنجه | آستانه‌ی قبولی | روش سنجش |
|---|---|---|
| پوشش رویداد (حداقل ۱ رویداد مفید در ≥۹۸٪ سشن‌های PDP+) | ≥۹۸٪ | تست خودکار هفتگی (بند ۶.۳ سند ۰۶) |
| نرخ خطای پارس قیمت (NaN/0/منفی) | <۰٫۵٪ | QAnomaly در sGTM + کوئری BQ |
| `purchase` GA4 در برابر `order_count` پنل | اختلاف <۳٪ | تطبیق روزانه |
| سهم سشن‌های بدون identity پس از لاگین | <۲٪ | `missing_titana_uid` |
| لینک‌های بدون UTM | <۱۰٪ | تگ `utm_missing` |
| تأخیر ایمپورت سفارش | <۲۴ ساعت | لاگ ELT |

---

## ۱.۱۲ «پرسشگر هوشمند»: داده‌ای که هیچ تگی نمی‌تواند بگیرد

برای پر کردن Q2/Q3 باید در سه نقطه بپرسید (هر کدام ≤۱ ثانیه وقت مشتری):

1. **پایان ثبت‌نام (OTP موفق):** `نقش` (دندانپزشک/کلینیک/لابراتوار) + `شهر` + `تعداد ایمپلنت در ماه` (اسلایدر ۴ گزینه‌ای). → `user_properties`
2. **اولین ورود به باشگاه مشتریان:** `سیستم(ها)ی فعلاً در حال استفاده` (چندانتخابی از `dim_brand`).
3. **میکرو-سروِی ۳ سوالی** در صفحه‌ی «ممنون از سفارش»: «چطور ما را پیدا کردید؟» (برای صحه‌گذاری Attribution) — با یک `attribution_selfreport` در BigQuery، خطای مدل دیتا-دریون را اندازه بگیرید.

> اگر پاسخ‌ها را به `user_prop_implants_band` تبدیل کنید، همان لحظه می‌توانید در GA4 ببینید **کدام کانال مشتریِ پرمصرف می‌آورد** — و این تنها عددی است که بودجه را جابه‌جا می‌کند.
