# ۲) Measurement Plan (نقشه‌ی سنجش)

> این سند «قرارداد» بین مارکتینگ، داده و فنی است: هر عددی که گزارش می‌شود، باید اینجا تعریف شده باشد؛ وگرنه گزارش نمی‌شود.

## ۲.۱ درخت KPI

```
                                NORTH STAR
             «GMVِ تکرارشونده از مطب‌های فعال» (Active-Clinic Margin, ماهانه)
                     ├── P1  فعال‌سازی مشتری: accounts با ≥۱ سفارش در ۹۰ روز
                     ├── P2  سودمندی: حاشیه‌ی سود / فیکسچر فروش‌رفته (نه فقط فروش)
                     ├── P3  Churn: % accounts بدون سفارش در دو سیکلِ مصرفی
                     │
   Primary ──┼── CAC (Qualified) به تفکیک کانال │ LTV 12m │ LTV:CAC │ Time-to-first-order
             ├── Attach-Rate (پروتز به فیکسچر) │ Share of Wallet │ Reorder-Cycle days
             ├── Rate: lead→qualified→order    │ Quote→Won rate  │ Credit-approval rate
             │
Diagnostic ──┼── هویت: gate_hit rate, OTP success, profile completion
             ├── محصول: variant_expand rate, price-undislosed abandon, OOS rate
             ├── ابزار: quick_order completion, package builder depth, compare→cart
             ├── رسانه‌ای: promo CTR, video VTR, download→lead rate
             └── پشتیبانی: chat→lead rate, response time, ticket→churn
```

## ۲.۲ جدول سنجش (Business Question → Metric → Event → Params)

| ID | پرسش تجاری | KPI (تعریف دقیق) | Event | Params کلیدی | مقصد | مسئول | تکرار |
|---|---|---|---|---|---|---|---|
| M-01 | کمپین‌ها مشتری می‌آورند یا کلیک؟ | `Qualified CAC` = spend / (accounts با docs_verified) | `signup_success`, `docs_verified` | `campaign`, `role`, `city`, `implants_band` | GA4+BQ | Growth | هفتگی |
| M-02 | کدام کانال پول می‌آورد؟ | `ROAS_blended` = margin / spend | `purchase` + offline import | `order_id`, `value_toman`, `margin_toman` | BQ/Looker | Growth | هفتگی |
| M-03 | کدام بخشِ قیفِ هویت می‌سوزد؟ | نرخ هر مرحله از A | `login_gate_hit`,`otp_send`,`otp_verify`,`profile_complete` | `blocked_action`,`method`,`error_code` | GA4 | Product | روزانه |
| M-04 | صفحه‌ی محصول می‌فروشد؟ | `PDP→ATC` (کلیک «انتخاب سایز و خرید») | `select_variant_click` | `product_id`,`brand_id`,`price`,`availability`,`stock_units` | GA4 | CRO | هفتگی |
| M-05 | customers در کدام تنوع گیر می‌کنند؟ | `variant_select_rate`، میانگین زمان تا انتخاب | `variant_list_expand`,`variant_select` | `diameter`,`length`,`platform`,`time_to_select_ms` | GA4+BQ | CRO | هفتگی |
| M-06 | آیا سبد رها می‌شود و چرا؟ | `Cart abandonment`، `avg dwell` | `cart_view`,`cart_line_add/remove`,`checkout_abandon` | `items`,`value_toman`,`step`,`idle_ms` | GA4 | CRO | روزانه |
| M-07 | پکیج‌های بی‌قیمت چقدر لید می‌دهند؟ | `Quote request rate` برای `price_undisclosed=true` | `product_detail`,`quote_request` | `package_size`,`offer_type`,`undisclosed` | GA4+CRM | Sales | هفتگی |
| M-08 | تقاضای سرکوب‌شده چقدر است؟ | `Suppressed demand value` (Toman) | `oos_view`,`notify_me_submit` | `product_id`,`requested_qty`,`avg_price_toman` | BQ | Supply | ماهانه |
| M-09 | ابزارها (سریع/هوشمند/اختصاصی) فروش می‌سازند؟ | `Tool completion rate`، `tool→cart` | `tool_*` | `tool`,`rows_used`,`discount_toman`,`final_toman` | GA4+BQ | Product | هفتگی |
| M-10 | بنر/اسلایدر داخلی ارزش دارد؟ | `promo CTR`، `promo→ATC` | `promo_view`,`promo_click` | `creative_id`,`slot`,`brand_id` | GA4 | Content | هفتگی |
| M-11 | محتوای تخصصی به خرید می‌رسد؟ | `content→cart`، VTR ویدیو | `brand_landing_view`,`video_progress`,`file_download` | `doc_type`,`brand_id`,`p25/50/75/100` | GA4 | Content | ماهانه |
| M-12 | چت/تلفن چقدر می‌فروشد؟ | `Chat→lead`، `Call→order` | `chat_click`,`chat_session_start`,`call_click` | `agent_id`,`channel`,`page_type`,`product_id` | GA4+CRM | Sales | هفتگی |
| M-13 | اقساطی چند درصدِ سبد را بزرگ می‌کند؟ | `AOV_installment / AOV_cash` | `installment_view`,`credit_apply_submit`,`credit_approved` | `plan`,`amount_toman`,`tier` | BQ | Finance | ماهانه |
| M-14 | کلاب/رفرال بازگشت دارد؟ | `Referral K`، `club→reorder lift` | `referral_share`,`referral_signup`,`club_view` | `referrer_uid_hash`,`tier`,`points` | GA4+BQ | CRM | ماهانه |
| M-15 | پس‌ازفروش، ریزش می‌سازد یا وفاداری؟ | `Ticket→churn Δ`، NPS | `return_request`,`warranty_claim`,`nps_submit` | `type`,`reason`,`days_to_resolve` | BQ | Support | ماهانه |
| M-16 | کدام برند را باید هل بدهیم؟ | `Brand GMV share × margin`، `Switching index` | همه‌ی رویدادهای محصول | `brand_id`,`origin_group`,`system_id` | BQ/Looker | Merch | ماهانه |
| M-17 | نظر/امتیاز مشتری چند؟ | `review rate`، میانگین امتیاز برند | `review_submit`,`rating_submit` | `rating_value`,`product_id`,`brand_id` | GA4 | Content | ماهانه |
| M-18 | کیفیت داده‌ی کمپین چطور است؟ | `% untagged sessions` | `utm_missing` | `referral`,`path` | GA4 | Growth | هفتگی |
| M-19 | تجربه/سرعت روی تبدیل اثر دارد؟ | ΔCVRB بر حسب LCP/CINP | `web_vitals` | `lcp`,`inp`,`cls`,`txn_id` | GA4 | FE | هفتگی |
| M-20 | PWA به retention کمک می‌کند؟ | `install→reorder lift` | `pwa_prompt_show/accept/dismiss` | `method` | GA4 | FE | ماهانه |

## ۲.۳ تعریف مرحله‌به‌مرحله‌ی قیف‌ها (برای Funnels در GA4/BQ)

| Funnel | Steps (به ترتیب) | هدف فاز اول (مرحله‌ای) | نکته‌ی پیاده‌سازی |
|---|---|---|---|
| A. هویت | `landing → login_gate_hit → otp_send → otp_verify_ok → profile_complete → docs_verified` | gate→otp ≥۸۰٪، otp≥۸۵٪، profile≥۷۰٪ | `docs_verified` از ایمپورت پنل می‌آید نه از مرورگر |
| B. محصول | `listing_view → product_detail → variant_list_expand → variant_select → add_to_cart` | expand≥۶۰٪، select→ATC≥۴۵٪ | ATC روی هر «انتخاب سایز و خرید»؛ اگر فقط بازکردن مودال است، `product_click` نام بگیرد نه `add_to_cart` |
| C. استعلام | `package_view → quote_request → quote_sent → won` | view→quote ≥۸٪ | برای `price==0` قیف B را ببندید و C را باز کنید |
| D. پرداخت | `cart_view → address → shipping → payment → confirmation(purchase)` | cart→purchase ≥۲۵٪ (B2B هدفمند) | مرحله‌های سرور را از HTML/URL استخراج کنید |
| E. ابزار | `tool_open → tool_row_edit → tool_line_add → tool_submit` | quick_order completion ≥۳۵٪ | شمارش `rows_used` = عمق استفاده |
| F. مالی | `leasing_view → eligibility → apply → approved → funded` | apply→approved ≥۶۰٪ | امروز لینک `/leasing-404/` خراب است: تا رفع، فقط `click` را بگیرید |
| G. ارجاع | `referral_share → referral_landing → signup → first_order` | K-factor ≥۰٫۱۵ | `referral_code` از URL یا کوکی |
| I. احیا | `oos_view → notify_me_submit → restock_notify → recovered_order` | submit≥۱۵٪ | بالاترین ROIِ ممکن: موجودی که هنوز نخریده شده |

## ۲.۴ وزن تبدیل (یک منبع حقیقت برای همه)

| Event | Weight | Macro/Micro | در «Goal» GA4 |
|---|---|---|---|
| `purchase` | 100 | Macro | ✅ key event |
| `order_submit_tool` (quick/smart/custom package) | 40 | Macro | ✅ |
| `quote_request` | 40 | Macro | ✅ |
| `signup_success` + `profile_complete` | 25 | Macro | ✅ |
| `callback_request` | 15 | Micro | — |
| `catalog_download`, `pricelist_download`, `exocad_library_download` | 8 | Micro | — |
| `chat_click`, `call_click`, `whatsapp_click` | 5 | Micro | — |
| `review_submit`, `rating_submit` | 5 | Micro | — |
| `pwa_install_accept`, `newsletter_subscribe`, `referral_share` | 4 | Micro | — |

فایل ماشین‌خوان: `data/weights.csv` (همین جدول) تا در GTM، dbt و Looker از یک منبع بخوانند.

## ۲.۵ نقشه‌ی مخاطب ← اقدام (Activation)

| مخاطب GA4 | تعریف (رویداد/پارامتر) | اقدام |
|---|---|---|
| `leed_high_intent_7d` | `quote_request` یا `callback_request` در ۷ روز، بدون سفارش | پیگیری Sales + پیامک/واتساپ؛ Exclude از کمپین آگاهی |
| `cart_abandon_48h` | `cart_view` بدون `purchase`، ۴۸ ساعت | تماس/چت + یادآوری (نه تخفیف؛ در B2B مرجوعی‌پذیر) |
| `oos_waiters` | `notify_me_submit` روی یک محصول خاص | پیامک «موجود شد» (Reorder) |
| `fixture_buyers_needing_prostho` | `purchase` با خط fixture و بدون prosthetic در ۴۵ روز | کمپین کراس‌سل اباتمنت/اسکن‌بادیِ همان `system_id` |
| `high_capacity_no_order` | `implants_band ≥ 16` و بدون سفارش ۱۴ روز | کالای نمونه/کیت امانی؛ اولویت Sales |
| `churn_risk_2cycle` | `days_since_last_order > 2×reorder_cycle` | کمپین بازگشت + بررسی ticket (اگر تیکت باز دارند، اول پشتیبانی) |
| `club_bronze_near_silver` | `club_tier=bronze` و امتیاز ≥۸۰٪ آستانه | پیشنهاد تراکنش برای ارتقای سقف اقساط |
| `brand_loyal_X` / `brand_switch_candidates` | سهم برند در ۶ ماه ≥۷۰٪ / کاهش ۲۰ واحدی | دفاع / حمله |

## ۲.۶ ریتم گزارش

| گزارش | مخاطب | ابزار | فرکانس |
|---|---|---|---|
| Funnel A/B/D روزانه (با alert ±۲σ) | Growth + CRO | Looker | روزانه |
| هفتگی: کانال×CAC×LTV، Brand share، Tool completion | مدیر بازاریابی | Looker | شنبه |
| ماهانه: LTV cohort، Share of Wallet، Suppressed demand، Margin | مدیرعامل/مالی | BQ | ۵ام هر ماه |
| Post-mortem تغییر قالب/کمپین | تیم محصول | GA4+BQ | رویداد-محور |
