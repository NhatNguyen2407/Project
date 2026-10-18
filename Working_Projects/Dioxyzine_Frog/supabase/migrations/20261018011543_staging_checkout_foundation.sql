-- Staging-only Sandbox checkout foundation. No Production data or functions.
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
do $guard$
begin
 if not exists(select 1 from public.products where id='STG-SAMPLE-PLUSH')
 or not exists(select 1 from storage.buckets where id='inquiry-test-references' and public=false)
 or exists(select 1 from public.orders where payment_method<>'synthetic' or customer_email not like '%@example.invalid')
 or to_regprocedure('public.staging_process_paid_order(uuid,text,text,text,text,numeric,text,jsonb,text)') is not null
 then raise exception 'Expected isolated synthetic Staging without existing checkout RPCs';end if;
end $guard$;
create unique index staging_transaction_id_unique on public.orders(transaction_id) where transaction_id is not null;
create function public.staging_increment_voucher_usage(p_code text) returns boolean
language plpgsql security invoker set search_path=''
as $f$
declare touched integer;
begin
 update public.vouchers set used_count=coalesce(used_count,0)+1
 where code=p_code and code like 'STG-%' and is_active=true
 and (expires_at is null or expires_at>pg_catalog.now())
 and (usage_limit is null or coalesce(used_count,0)<usage_limit);
 get diagnostics touched=row_count;
 return touched=1;
end $f$;
CREATE OR REPLACE FUNCTION "public"."staging_reserve_product_stock"("p_paypal_order_id" "text", "p_items" "jsonb", "p_expires_at" timestamp with time zone) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY INVOKER
    SET "search_path" TO ''
    AS $$
DECLARE
  item jsonb;
  v_product_id text;
  v_quantity integer;
  v_stock integer;
  v_reserved integer;
  v_existing_order text;
BEGIN
  IF trim(p_paypal_order_id) = '' THEN
    RAISE EXCEPTION 'PayPal order ID is required';
  END IF;

  IF p_expires_at <= now() THEN
    RAISE EXCEPTION 'Reservation expiry must be in the future';
  END IF;

  SELECT paypal_order_id INTO v_existing_order
  FROM public.stock_reservations
  WHERE paypal_order_id = trim(p_paypal_order_id)
  LIMIT 1;

  IF v_existing_order IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.stock_reservations
      WHERE paypal_order_id = trim(p_paypal_order_id)
        AND status = 'active'
    ) THEN
      RETURN true;
    END IF;

    RAISE EXCEPTION 'PayPal order reservation is no longer active';
  END IF;

  -- Lazy cleanup; no pg_cron required.
  DELETE FROM public.stock_reservations
  WHERE status = 'active'
    AND expires_at <= now();

  FOR item IN
    SELECT value
    FROM jsonb_array_elements(p_items)
    ORDER BY value->>'id'
  LOOP
    v_product_id := trim(item->>'id');
    v_quantity := (item->>'qty')::integer;

    IF v_product_id = '' OR v_quantity IS NULL OR v_quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid cart item';
    END IF;

    SELECT stock INTO v_stock
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', v_product_id;
    END IF;

    SELECT COALESCE(SUM(quantity), 0) INTO v_reserved
    FROM public.stock_reservations
    WHERE product_id = v_product_id
      AND status = 'active'
      AND expires_at > now();

    IF COALESCE(v_stock, 0) - v_reserved < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock: %', v_product_id;
    END IF;

    INSERT INTO public.stock_reservations (
      paypal_order_id,
      product_id,
      quantity,
      expires_at,
      status
    )
    VALUES (
      trim(p_paypal_order_id),
      v_product_id,
      v_quantity,
      p_expires_at,
      'active'
    );
  END LOOP;

  RETURN true;
END;
$$;
CREATE OR REPLACE FUNCTION "public"."staging_process_paid_order"("p_user_id" "uuid", "p_customer_name" "text", "p_customer_email" "text", "p_phone_number" "text", "p_shipping_address" "text", "p_total_amount" numeric, "p_transaction_id" "text", "p_cart_items" "jsonb", "p_voucher_code" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY INVOKER
    SET "search_path" TO ''
    AS $$
DECLARE
    v_order_id uuid;
    v_existing_amount numeric;
    v_existing_status text;
    v_item jsonb;
    v_product_id text;
    v_quantity integer;
    v_stock integer;
    v_voucher_ok boolean;
    v_transaction_id text;
BEGIN
    -- Basic validation
    IF p_customer_name IS NULL OR trim(p_customer_name) = '' THEN
        RAISE EXCEPTION 'Customer name is required';
    END IF;

    IF p_customer_email IS NULL OR trim(p_customer_email) = '' THEN
        RAISE EXCEPTION 'Customer email is required';
    END IF;

    IF p_total_amount IS NULL OR p_total_amount < 0 THEN
        RAISE EXCEPTION 'Invalid order amount';
    END IF;

    IF p_transaction_id IS NULL OR trim(p_transaction_id) = '' THEN
        RAISE EXCEPTION 'PayPal transaction ID is required';
    END IF;

    IF p_cart_items IS NULL
       OR jsonb_typeof(p_cart_items) <> 'array'
       OR jsonb_array_length(p_cart_items) = 0 THEN
        RAISE EXCEPTION 'Cart cannot be empty';
    END IF;

    v_transaction_id := trim(p_transaction_id);

    /*
     * Serialize processing for the same PayPal transaction.
     * This prevents two concurrent retries from both decrementing stock.
     */
    PERFORM pg_advisory_xact_lock(
        hashtextextended(v_transaction_id, 0)
    );

    /*
     * Idempotency:
     * If this PayPal transaction was already processed,
     * return the existing order without touching stock/voucher again.
     */
    SELECT id, total_amount, payment_status
    INTO v_order_id, v_existing_amount, v_existing_status
    FROM public.orders
    WHERE transaction_id = v_transaction_id
    LIMIT 1;

    IF FOUND THEN
        IF v_existing_status <> 'paid'
           OR v_existing_amount <> p_total_amount THEN
            RAISE EXCEPTION
                'Transaction already exists with inconsistent order data';
        END IF;

        RETURN v_order_id;
    END IF;

    /*
     * Lock every product row before changing stock.
     * Items are processed in deterministic product-id order
     * to reduce deadlock risk.
     */
    FOR v_item IN
        SELECT value
        FROM jsonb_array_elements(p_cart_items) AS items(value)
        ORDER BY value->>'id'
    LOOP
        v_product_id := v_item->>'id';

        IF v_product_id IS NULL OR trim(v_product_id) = '' THEN
            RAISE EXCEPTION 'Cart item is missing product id';
        END IF;

        v_quantity := (v_item->>'qty')::integer;

        IF v_quantity IS NULL OR v_quantity <= 0 THEN
            RAISE EXCEPTION
                'Invalid quantity for product %',
                v_product_id;
        END IF;

        SELECT stock
        INTO v_stock
        FROM public.products
        WHERE id = v_product_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'Product not found: %',
                v_product_id;
        END IF;

        IF v_stock < v_quantity THEN
            RAISE EXCEPTION
                'Insufficient stock for product %. Available: %, requested: %',
                v_product_id,
                v_stock,
                v_quantity;
        END IF;

        UPDATE public.products
        SET stock = stock - v_quantity
        WHERE id = v_product_id;
    END LOOP;

    /*
     * Consume voucher inside the same transaction.
     */
    IF p_voucher_code IS NOT NULL
       AND trim(p_voucher_code) <> '' THEN

        v_voucher_ok := public.staging_increment_voucher_usage(
            trim(p_voucher_code)
        );

        IF NOT v_voucher_ok THEN
            RAISE EXCEPTION
                'Voucher is invalid, expired, inactive, or exhausted';
        END IF;
    END IF;

    /*
     * Create the real purchase record.
     */
    INSERT INTO public.orders (
        user_id,
        customer_name,
        customer_email,
        phone_number,
        shipping_address,
        total_amount,
        payment_method,
        payment_status,
        transaction_id,
        order_status,
        cart_items
    )
    VALUES (
        p_user_id,
        trim(p_customer_name),
        trim(p_customer_email),
        NULLIF(trim(COALESCE(p_phone_number, '')), ''),
        NULLIF(trim(COALESCE(p_shipping_address, '')), ''),
        p_total_amount,
        'synthetic',
        'paid',
        v_transaction_id,
        'processing',
        p_cart_items
    )
    RETURNING id INTO v_order_id;

    RETURN v_order_id;
END;
$$;
revoke all on function public.staging_increment_voucher_usage(text) from public,anon,authenticated;
revoke all on function public.staging_reserve_product_stock(text,jsonb,timestamptz) from public,anon,authenticated;
revoke all on function public.staging_process_paid_order(uuid,text,text,text,text,numeric,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.staging_increment_voucher_usage(text) to service_role;
grant execute on function public.staging_reserve_product_stock(text,jsonb,timestamptz) to service_role;
grant execute on function public.staging_process_paid_order(uuid,text,text,text,text,numeric,text,jsonb,text) to service_role;
commit;