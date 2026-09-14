-- ═══════════════════════════════════════════════════════════════════════════
-- Titana · Analytics warehouse skeleton (BigQuery standard SQL)
-- فاز اجرا: هفته ۴ (بعد از فعال‌سازی GA4 BigQuery export — این با تأخیر غیرقابل‌جبران است)
-- lgtm: این DDL «حداقل قابل اجرا» است، نه کامل. هر جدول یک تصمیم آگاهانه دارد.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1) خام GA4 (از export گوگل، partitioned by date) ───────────────────────
-- نام جداول خودبه‌خود: analytics_<property_id>.events_YYYYMMDD
-- ما فقط یک view اتحاد می‌سازیم:
create or replace view analytics.ga4_events_all as
select *, date(timestamp_micros(event_timestamp)) as event_date
from `analytics_*.events_*`
where _TABLE_SUFFIX BETWEEN '20260101' and format_date('%Y%m%d', current_date());

-- ─── 2) استیجینگ رفتار (نرمال‌سازی params → ستون) ───────────────────────────
create or replace table analytics.stg_event (
  event_date       date,
  event_ts         timestamp,
  event_name       string,        -- بدون پیشوند titana_
  ga4_session_id   string,
  client_id        string,
  account_hash     string,        -- user.uid_hash → از GA4: user_properties.titana_uid.value.string_value
  page_type        string,
  product_id       int64,
  brand_id         int64,
  brand_slug       string,
  system_id        string,
  category         string,
  availability     string,
  stock_units      int64,
  undisclosed      bool,
  offer_type       string,
  package_size     int64,
  installment      bool,
  doc_type         string,
  tool             string,
  blocked_action   string,
  channel          string,
  creative_id      string,
  checkout_step    int64,
  form_id          string,
  form_result      string,
  error_code       string,
  dl_ver           string,
  dl_source        string,
  env              string,
  value_rial       numeric,
  value_toman      numeric,
  items            array<struct<product_id int64, item_name string, brand_id int64, system_id string,
                                category string, variant_sku string, price_toman numeric, quantity int64,
                                free_qty int64, index int64>>,
  source_traffic   struct<session_source string, session_medium string, session_campaign string,
                          session_content string, session_term string, session_source_medium string,
                          first_user_source string, first_user_medium string, first_user_campaign string>
)
partition by event_date
cluster by event_name, account_hash;

insert analytics.stg_event
select
  date(timestamp_micros(event_timestamp)),
  timestamp_micros(event_timestamp),
  replace(event_name, 'titana_', ''),
  user_pseudo_id,
  (select value.string_value   from unnest(user_properties) where key='client_id')            as client_id,
  (select value.string_value   from unnest(user_properties) where key='titana_uid')            as account_hash,
  (select value.string_value   from unnest(event_params)    where key='page_type'),
  (select cast(value.int_value as int64) from unnest(event_params) where key='product_id'),
  (select cast(value.int_value as int64) from unnest(event_params) where key='brand_id'),
  (select value.string_value   from unnest(event_params)    where key='brand_slug'),
  (select value.string_value   from unnest(event_params)    where key='system_id'),
  (select value.string_value   from unnest(event_params)    where key='category'),
  (select value.string_value   from unnest(event_params)    where key='availability'),
  (select cast(value.int_value as int64) from unnest(event_params) where key='stock_units'),
  (select value.boolean_value  from unnest(event_params)    where key='undisclosed'),
  (select value.string_value   from unnest(event_params)    where key='offer_type'),
  (select cast(value.int_value as int64) from unnest(event_params) where key='package_size'),
  (select value.boolean_value  from unnest(event_params)    where key='installment'),
  (select value.string_value   from unnest(event_params)    where key='doc_type'),
  (select value.string_value   from unnest(event_params)    where key='tool'),
  (select value.string_value   from unnest(event_params)    where key='blocked_action'),
  (select value.string_value   from unnest(event_params)    where key='channel'),
  (select value.string_value   from unnest(event_params)    where key='creative_id'),
  (select cast(value.int_value as int64) from unnest(event_params) where key='step'),
  (select value.string_value   from unnest(event_params)    where key='form_id'),
  (select value.string_value   from unnest(event_params)    where key='form_result'),
  (select value.string_value   from unnest(event_params)    where key='error_code'),
  (select value.string_value   from unnest(event_params)    where key='dl_ver'),
  (select value.string_value   from unnest(event_params)    where key='dl_source'),
  (select value.string_value   from unnest(event_params)    where key='env'),
  (select value.double_value   from unnest(event_params)    where key='value'),
  (select value.double_value   from unnest(event_params)    where key='value_toman'),
  items,
  traffic_data.*    /* session_source/medium/campaign/content/term + first_user_* از فیلد traffic_data در export گوگل */
from analytics.ga4_events_all;

-- ⚑ دو نکته‌ی واقعی که معمولاً در این مرحله غلط می‌شود:
--   ۱) items[] فقط وقتی قابل UNNEST است که در GTM به‌صورت «item-scoped parameters» (پارامتر سطح‌آیتم)
--      ارسال شود، نه یک رشته‌ی JSON در یک custom param. وگرنه attach-rate را نمی‌توانید بسازید.
--   ۲) traffic_data از GA4 export با ۲۴–۴۸ ساعت تأخیر کامل می‌شود؛ برای «امروز» از stg_event_realtime استفاده کنید.

-- ─── 3) ابعاد ───────────────────────────────────────────────────────────────
create or replace table analytics.dim_brand (
  brand_id int64, brand_value_id int64, name_fa string, slug string,
  origin_group string, landing_path string, data_note string
);  -- load از data/dim-brand.csv (منبع: FieldOptions سایت — Id پایدار، Value گاهی تکراری!)

create or replace table analytics.dim_product (
  product_id int64, name_fa string, name_en string,
  product_family string, is_package bool, package_size int64,
  brand_id int64, system_id string, platform string, country_of_origin string,
  surface string, implant_type string,
  list_price_toman numeric, margin_pct numeric,   -- ← از پنل/قیمت‌گذاری، نه از وب
  installment_eligible bool, has_warranty_filler bool,
  effective_from date, effective_to date, is_current bool   -- SCD-2: قیمت در این بازار هر هفته عوض می‌شود
);

create or replace table analytics.dim_variant (
  variant_sku string, product_id int64, diameter_mm numeric, length_mm numeric,
  platform string, stock_units int64, stocked_at timestamp
);

create or replace table analytics.dim_account (
  account_hash string, org_id string, role string, org_type string,
  city string, province string, implants_band string, primary_system string,
  club_tier string, credit_limit_toman numeric, verification_state string,
  registered_at timestamp, first_order_at timestamp, source_first string
);

create or replace table analytics.map_client_uid (   -- ⚑ ستون فقرات هویت: اتصال ناشناس→شناخته‌شده
  client_id string, account_hash string, first_seen timestamp, last_seen timestamp, device_kinds int64
);

-- ─── 4) واقعیت‌ها ───────────────────────────────────────────────────────────
create or replace table analytics.fact_order (
  order_id string, account_hash string, order_ts timestamp,
  value_toman numeric, tax_toman numeric, shipping_toman numeric, discount_toman numeric,
  free_items_value_toman numeric, margin_toman numeric,
  payment_method string, installment bool, installment_months int64,
  city string, province string, is_first_order bool, lead_source string,
  client_id string, session_id string, utm struct<source string, medium string, campaign string, content string, term string>
) partition by date_trunc(order_ts, month);

create or replace table analytics.fact_order_line (
  order_id string, line_no int64, product_id int64, variant_sku string,
  brand_id int64, system_id string, category string,
  qty int64, free_qty int64, unit_price_toman numeric, line_revenue_toman numeric,
  line_margin_toman numeric
);

create or replace table analytics.fact_lead (        -- quote/callback/tool submit/chat/call + نتیجه‌ی CRM
  lead_id string, created_ts timestamp, source string,          -- website|chat|call|whatsapp|form
  account_hash string, client_id string, page_type string, product_id int64, brand_id int64,
  agent_id string, crm_status string, won_amount_toman numeric, converted_ts timestamp
);

create or replace table analytics.fact_service_ticket (   -- گارانتی فیلر / مرجوعی / تعویض → پیش‌بین ریزش
  ticket_id string, account_hash string, opened_ts timestamp, closed_ts timestamp,
  type string, reason string, product_id int64, brand_id int64, sla_days int64, resolved bool
);

create or replace table analytics.fact_credit_application (
  app_id string, account_hash string, applied_ts timestamp, amount_toman numeric,
  club_tier string, status string, approved_limit_toman numeric, months int64, decided_ts timestamp
);

-- ─── 5) Marts (چیزی که Looker می‌خواند) ────────────────────────────────────
-- قیف روزانه: هر مرحله = یک event_name. (در dbt این را به model + test تبدیل کنید.)
create or replace view analytics.mrt_funnel_daily as
select
  event_date,
  countif(event_name = 'login_gate_hit')                  as a1_gate_hits,
  countif(event_name = 'otp_send')                        as a2_otp_sent,
  countif(event_name = 'otp_result' and error_code is null) as a3_otp_ok,
  countif(event_name = 'signup')                          as a4_signups,
  countif(event_name = 'profile_complete')                as a5_profiles,
  countif(event_name = 'view_item')                       as b1_pdp_views,
  countif(event_name = 'select_variant')                  as b2_variant_selects,
  countif(event_name = 'add_to_cart')                     as b3_atc,
  countif(event_name = 'view_cart')                       as d1_cart_views,
  countif(event_name = 'purchase')                        as d2_purchases,
  countif(event_name = 'quote_request')                   as c1_quotes,
  countif(event_name = 'tool_submit')                     as e1_tool_submits,
  countif(event_name = 'notify_me_submit')                as i1_notify_me,
  count(distinct if(event_name = 'page_view', ga4_session_id, null)) as sessions
from analytics.stg_event
group by event_date;

create or replace view analytics.mrt_account_360 as
select a.account_hash, a.role, a.city, a.implants_band, a.club_tier,
       a.primary_system, a.registered_at, a.first_order_at,
       count(distinct o.order_id)                                   as orders_all,
       sum(o.value_toman)                                           as gmv_toman,
       sum(o.margin_toman)                                          as margin_toman,
       sum(case when l.category='fixture' then l.qty else 0 end)     as fixtures_units,
       sum(case when l.category in ('prosthesis','healing','scan_body','lab_analog','impression_coping') then 1 else 0 end)
                                                                     as prosthetic_lines,
       ifnull(safe_divide(sum(case when l.category in ('prosthesis','healing','scan_body','lab_analog','impression_coping') then 1 else 0 end),
              nullif(sum(case when l.category='fixture' then 1 else 0 end),0)), 0)  as attach_rate,
       max(o.order_ts)                                              as last_order_ts,
       date_diff(current_date(), max(o.order_ts), day)             as days_since_last_order,
       (select countif(x.event_name='quote_request') from analytics.stg_event x
         where x.account_hash=a.account_hash)                       as quotes_90d
from analytics.dim_account a
left join analytics.fact_order o using (account_hash)
left join analytics.fact_order_line l using (order_id)
group by 1,2,3,4,5,6,7,8;

-- Share of Wallet: تنها با فیلد ثبت‌نام ممکن است؛ بدون آن «تخمین» گزارش کنید نه عدد قطعی
create or replace view analytics.mrt_share_of_wallet as
select account_hash, city, role, implants_band,
       fixtures_units / nullif(implants_monthly_est * 30, 0) as sow,
       margin_toman
from (select *, case implants_band when '0-5' then 2.5 when '6-15' then 10 when '16-30' then 22
             when '31-60' then 45 when '60+' then 75 else null end as implants_monthly_est
      from analytics.mrt_account_360);

create or replace view analytics.mrt_channel_roi as
select o.utm.source, o.utm.medium, o.utm.campaign,
       count(distinct o.order_id) as orders, sum(o.value_toman) as gmv, sum(o.margin_toman) as margin,
       count(distinct l.account_hash) as accounts,
       countif(l.verification_state='verified') as qualified_accounts
from analytics.fact_order o
left join analytics.dim_account l using (account_hash)
group by 1,2,3;

-- ─── 6) SLOهای کیفیت داده (کوئری‌های بازبینی هفتگی) ────────────────────────
create or replace view analytics.qa_checks as
select 'purchase_match' as check_name,
       (select count(1) from analytics.stg_event where event_name='purchase') as ga4_cnt,
       (select count(1) from analytics.fact_order) as panel_cnt
union all select 'missing_page_type', countif(page_type is null), count(1) from analytics.stg_event
union all select 'zero_or_null_value', countif((value_rial is null or value_rial=0) and event_name='purchase'), countif(event_name='purchase') from analytics.stg_event
union all select 'missing_uid_on_login', countif(event_name='signup' and account_hash is null), countif(event_name='signup') from analytics.stg_event
union all select 'dom_sourced_ratio', countif(dl_source='dom' and event_name='purchase'), countif(event_name='purchase') from analytics.stg_event
union all select 'stale_dl_ver', countif(dl_ver not in ('1.0.0')), count(1) from analytics.stg_event;
