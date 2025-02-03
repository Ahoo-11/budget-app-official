

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "backup_20250127";


ALTER SCHEMA "backup_20250127" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "budget_app";


ALTER SCHEMA "budget_app" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."measurement_unit_type" AS ENUM (
    'weight',
    'volume',
    'length',
    'unit',
    'time'
);


ALTER TYPE "public"."measurement_unit_type" OWNER TO "postgres";


CREATE TYPE "public"."payment_method" AS ENUM (
    'cash',
    'transfer'
);


ALTER TYPE "public"."payment_method" OWNER TO "postgres";


CREATE TYPE "public"."product_type_enum" AS ENUM (
    'basic',
    'composite',
    'consignment'
);


ALTER TYPE "public"."product_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."recurring_frequency" AS ENUM (
    'daily',
    'weekly',
    'monthly',
    'yearly'
);


ALTER TYPE "public"."recurring_frequency" OWNER TO "postgres";


CREATE TYPE "public"."session_status" AS ENUM (
    'active',
    'closing',
    'closed',
    'reconciled'
);


ALTER TYPE "public"."session_status" OWNER TO "postgres";


CREATE TYPE "public"."template_type" AS ENUM (
    'business',
    'personal'
);


ALTER TYPE "public"."template_type" OWNER TO "postgres";


CREATE TYPE "public"."transaction_status" AS ENUM (
    'pending',
    'completed',
    'partially_paid'
);


ALTER TYPE "public"."transaction_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role_type" AS ENUM (
    'super_admin',
    'admin',
    'manager',
    'viewer',
    'controller'
);


ALTER TYPE "public"."user_role_type" OWNER TO "postgres";


CREATE TYPE "public"."user_status_type" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE "public"."user_status_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "budget_app"."calculate_available_quantity"("product_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    available_quantity numeric;
BEGIN
    -- For basic products, just return current_stock
    IF EXISTS (
        SELECT 1 FROM budget_app.products 
        WHERE id = product_id 
        AND product_type = 'basic'
    ) THEN
        SELECT current_stock INTO available_quantity
        FROM budget_app.products
        WHERE id = product_id;
        
        RETURN COALESCE(available_quantity, 0);
    END IF;
    
    -- For composite products, calculate based on recipe ingredients
    SELECT MIN(
        FLOOR(
            p.current_stock / ri.content_quantity
        )
    ) INTO available_quantity
    FROM budget_app.recipe_ingredients ri
    JOIN budget_app.products p ON p.id = ri.ingredient_id
    WHERE ri.product_id = product_id;
    
    RETURN COALESCE(available_quantity, 0);
END;
$$;


ALTER FUNCTION "budget_app"."calculate_available_quantity"("product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "budget_app"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "budget_app"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "budget_app"."test_rls_policies"() RETURNS TABLE("table_name" "text", "public_count" bigint, "budget_app_count" bigint, "policies_match" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'budget_app'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'sources'::text as table_name,
        (SELECT COUNT(*)::bigint FROM public.sources) as public_count,
        (SELECT COUNT(*)::bigint FROM budget_app.sources) as budget_app_count,
        (SELECT COUNT(*)::bigint FROM public.sources) = (SELECT COUNT(*)::bigint FROM budget_app.sources) as policies_match
    UNION ALL
    SELECT 
        'bills'::text,
        (SELECT COUNT(*)::bigint FROM public.bills),
        (SELECT COUNT(*)::bigint FROM budget_app.bills),
        (SELECT COUNT(*)::bigint FROM public.bills) = (SELECT COUNT(*)::bigint FROM budget_app.bills);
END;
$$;


ALTER FUNCTION "budget_app"."test_rls_policies"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "budget_app"."test_schema_access"() RETURNS TABLE("schema_name" "text", "table_name" "text", "row_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'budget_app'
    AS $$
BEGIN
    RETURN QUERY
    WITH table_counts AS (
        SELECT 
            'sources' as tname, 
            (SELECT COUNT(*) FROM budget_app.sources) as cnt
        UNION ALL
        SELECT 
            'bills', 
            (SELECT COUNT(*) FROM budget_app.bills)
        UNION ALL
        SELECT 
            'products', 
            (SELECT COUNT(*) FROM budget_app.products)
        UNION ALL
        SELECT 
            'income_entries', 
            (SELECT COUNT(*) FROM budget_app.income_entries)
    )
    SELECT 
        'budget_app'::text,
        tc.tname::text,
        tc.cnt::bigint
    FROM table_counts tc;
END;
$$;


ALTER FUNCTION "budget_app"."test_schema_access"() OWNER TO "postgres";


COMMENT ON FUNCTION "budget_app"."test_schema_access"() IS '
Test direct access to budget_app schema:
SELECT * FROM budget_app.test_schema_access();

Test data consistency between schemas:
SELECT * FROM budget_app.verify_schema_data();
';



CREATE OR REPLACE FUNCTION "budget_app"."trigger_set_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "budget_app"."trigger_set_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "budget_app"."verify_schema_data"() RETURNS TABLE("table_name" "text", "public_count" bigint, "budget_app_count" bigint, "matches" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'budget_app'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'sources'::text as table_name,
        (SELECT COUNT(*)::bigint FROM public.sources) as public_count,
        (SELECT COUNT(*)::bigint FROM budget_app.sources) as budget_app_count,
        (SELECT COUNT(*)::bigint FROM public.sources) = (SELECT COUNT(*)::bigint FROM budget_app.sources) as matches
    UNION ALL
    SELECT 
        'bills'::text,
        (SELECT COUNT(*)::bigint FROM public.bills),
        (SELECT COUNT(*)::bigint FROM budget_app.bills),
        (SELECT COUNT(*)::bigint FROM public.bills) = (SELECT COUNT(*)::bigint FROM budget_app.bills)
    UNION ALL
    SELECT 
        'products'::text,
        (SELECT COUNT(*)::bigint FROM public.products),
        (SELECT COUNT(*)::bigint FROM budget_app.products),
        (SELECT COUNT(*)::bigint FROM public.products) = (SELECT COUNT(*)::bigint FROM budget_app.products)
    UNION ALL
    SELECT 
        'income_entries'::text,
        (SELECT COUNT(*)::bigint FROM public.income_entries),
        (SELECT COUNT(*)::bigint FROM budget_app.income_entries),
        (SELECT COUNT(*)::bigint FROM public.income_entries) = (SELECT COUNT(*)::bigint FROM budget_app.income_entries);
END;
$$;


ALTER FUNCTION "budget_app"."verify_schema_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."accept_invitation"("token" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
    invitation_record public.invitations;
    user_id uuid;
begin
    -- Get the invitation
    select * into invitation_record
    from public.invitations
    where invitations.token = accept_invitation.token
    and status = 'pending'
    and expires_at > now();

    if invitation_record is null then
        return json_build_object('success', false, 'message', 'Invalid or expired invitation');
    end if;

    -- Get the user ID for the email
    select id into user_id
    from auth.users
    where email = invitation_record.email;

    if user_id is null then
        return json_build_object('success', false, 'message', 'User not found');
    end if;

    -- Create user role
    insert into public.user_roles (user_id, role)
    values (user_id, invitation_record.role);

    -- Update invitation status
    update public.invitations
    set status = 'accepted',
        updated_at = now()
    where token = accept_invitation.token;

    return json_build_object('success', true);
end;
$$;


ALTER FUNCTION "public"."accept_invitation"("token" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."assign_source_to_user"("target_user_email" "text", "source_name" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id uuid;
    v_source_id uuid;
BEGIN
    -- Only allow controller to execute this function
    IF NOT is_controller(auth.uid()) THEN
        RAISE EXCEPTION 'Only controller can assign sources to users';
    END IF;

    -- Get user ID
    SELECT id INTO v_user_id 
    FROM profiles 
    WHERE email = target_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Get source ID
    SELECT id INTO v_source_id 
    FROM sources 
    WHERE name = source_name;

    IF v_source_id IS NULL THEN
        RAISE EXCEPTION 'Source not found';
    END IF;

    -- Insert or update permission
    INSERT INTO source_permissions (user_id, source_id)
    VALUES (v_user_id, v_source_id)
    ON CONFLICT (user_id, source_id) DO NOTHING;
END;
$$;


ALTER FUNCTION "public"."assign_source_to_user"("target_user_email" "text", "source_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_available_content"("product_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  product_record record;
BEGIN
  SELECT 
    current_stock,
    content_per_unit
  INTO product_record
  FROM products
  WHERE id = product_id;

  RETURN COALESCE(product_record.current_stock * product_record.content_per_unit, 0);
END;
$$;


ALTER FUNCTION "public"."calculate_available_content"("product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_available_quantity"("product_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    available_quantity numeric;
BEGIN
    -- For basic products, just return current_stock
    IF EXISTS (
        SELECT 1 FROM products 
        WHERE id = product_id 
        AND product_type = 'basic'
    ) THEN
        SELECT current_stock INTO available_quantity
        FROM products
        WHERE id = product_id;
        
        RETURN COALESCE(available_quantity, 0);
    END IF;
    
    -- For composite products, calculate based on recipe ingredients
    SELECT MIN(
        FLOOR(
            p.current_stock / ri.content_quantity
        )
    ) INTO available_quantity
    FROM recipe_ingredients ri
    JOIN products p ON p.id = ri.ingredient_id
    WHERE ri.product_id = product_id;
    
    RETURN COALESCE(available_quantity, 0);
END;
$$;


ALTER FUNCTION "public"."calculate_available_quantity"("product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_required_units"("required_content" numeric, "content_per_unit" numeric) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN CEIL(required_content / content_per_unit);
END;
$$;


ALTER FUNCTION "public"."calculate_required_units"("required_content" numeric, "content_per_unit" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_audit_log"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.user_id
            ELSE NEW.user_id
        END,
        TG_OP,
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        jsonb_build_object(
            'old_data', to_jsonb(OLD),
            'new_data', to_jsonb(NEW),
            'source_id', CASE
                WHEN TG_TABLE_NAME = 'transactions' THEN 
                    CASE
                        WHEN TG_OP = 'DELETE' THEN OLD.source_id
                        ELSE NEW.source_id
                    END
                ELSE null
            END
        )
    );
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."create_audit_log"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_bill_items"("p_bill_id" "uuid", "p_items" "jsonb"[]) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO bill_items (
    bill_id,
    item_id,
    item_type,
    quantity,
    price,
    total
  )
  SELECT
    p_bill_id,
    (item->>'item_id')::UUID,
    (item->>'item_type')::TEXT,
    (item->>'quantity')::NUMERIC,
    (item->>'price')::NUMERIC,
    (item->>'total')::NUMERIC
  FROM jsonb_array_elements(p_items::JSONB) AS item;
END;
$$;


ALTER FUNCTION "public"."create_bill_items"("p_bill_id" "uuid", "p_items" "jsonb"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_profile"("user_id" "uuid", "user_email" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into profiles (id, email)
  values (user_id, user_email);
end;
$$;


ALTER FUNCTION "public"."create_profile"("user_id" "uuid", "user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_source_permission"("user_id" "uuid", "source_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  user_role text;
begin
  -- Get the user's role
  select role into user_role from user_roles where user_id = create_source_permission.user_id;
  
  insert into source_permissions (user_id, source_id, can_view, can_create, can_edit, can_delete)
  values (
    user_id,
    source_id,
    true,
    user_role != 'viewer',
    user_role != 'viewer',
    user_role in ('admin', 'super_admin')
  );
end;
$$;


ALTER FUNCTION "public"."create_source_permission"("user_id" "uuid", "source_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_role"("user_id" "uuid", "user_role" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into user_roles (user_id, role)
  values (user_id, user_role::user_role_type);
end;
$$;


ALTER FUNCTION "public"."create_user_role"("user_id" "uuid", "user_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_auth_user"("user_email" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get the user id first
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
  
  -- Delete related records in the correct order
  DELETE FROM transactions WHERE source_id IN (SELECT id FROM sources WHERE user_id = target_user_id);
  DELETE FROM source_permissions WHERE source_id IN (SELECT id FROM sources WHERE user_id = target_user_id);
  DELETE FROM sources WHERE user_id = target_user_id;
  DELETE FROM payers WHERE user_id = target_user_id;
  DELETE FROM user_roles WHERE user_id = target_user_id;
  DELETE FROM profiles WHERE id = target_user_id;
  DELETE FROM audit_logs WHERE user_id = target_user_id;
  
  -- Finally delete from auth.users
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;


ALTER FUNCTION "public"."delete_auth_user"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_session_stats"("source_id" "uuid") RETURNS TABLE("total_sessions" bigint, "active_sessions" bigint, "closed_sessions" bigint, "avg_duration" interval, "status_lengths" "json")
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE status = 'active') as active_sessions,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_sessions,
        AVG(end_time - start_time) FILTER (WHERE status = 'closed') as avg_duration,
        json_object_agg(
            status::text,
            length(status::text)
        ) as status_lengths
    FROM sessions
    WHERE sessions.source_id = $1;
END;
$_$;


ALTER FUNCTION "public"."get_session_stats"("source_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Create the profile as before
  INSERT INTO public.profiles (id, email, display_name, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      split_part(new.email, '@', 1),
      'User_' || substring(new.id::text, 1, 8)
    ),
    'pending'
  );
  
  -- Create an audit log entry for controllers to see
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    details
  )
  VALUES (
    new.id,
    'USER_SIGNUP',
    'profiles',
    new.id,
    jsonb_build_object(
      'email', new.email,
      'status', 'pending'
    )
  );
  
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_full_access"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_roles.user_id = $1 
    AND user_roles.role = 'controller'
  );
END;
$_$;


ALTER FUNCTION "public"."has_full_access"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_controller"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles 
        WHERE user_id = user_id 
        AND role = 'controller'
    );
END;
$$;


ALTER FUNCTION "public"."is_controller"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."make_price_optional"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  ALTER TABLE products ALTER COLUMN price DROP NOT NULL;
END;
$$;


ALTER FUNCTION "public"."make_price_optional"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_bill_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.status := 
    CASE 
      WHEN NEW.status = 'active' THEN 'active'  -- Keep active status if explicitly set
      WHEN NEW.paid_amount = 0 THEN 'pending'
      WHEN NEW.paid_amount < NEW.total THEN 'partially_paid'
      WHEN NEW.paid_amount >= NEW.total THEN 'paid'
      ELSE NEW.status -- Keep existing status if none of the above apply
    END;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_bill_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_session_totals"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- If bill is being deleted, update old session
    IF (TG_OP = 'DELETE' AND OLD.session_id IS NOT NULL) THEN
        UPDATE sessions
        SET 
            total_cash = COALESCE((
                SELECT SUM(total)
                FROM bills
                WHERE session_id = OLD.session_id
                AND payment_method = 'cash'
                AND status != 'cancelled'
            ), 0),
            total_transfer = COALESCE((
                SELECT SUM(total)
                FROM bills
                WHERE session_id = OLD.session_id
                AND payment_method = 'transfer'
                AND status != 'cancelled'
            ), 0),
            total_sales = COALESCE((
                SELECT SUM(total)
                FROM bills
                WHERE session_id = OLD.session_id
                AND status != 'cancelled'
            ), 0),
            updated_at = NOW()
        WHERE id = OLD.session_id;
    END IF;

    -- For INSERT or UPDATE, update new session
    IF (TG_OP != 'DELETE' AND NEW.session_id IS NOT NULL) THEN
        UPDATE sessions
        SET 
            total_cash = COALESCE((
                SELECT SUM(total)
                FROM bills
                WHERE session_id = NEW.session_id
                AND payment_method = 'cash'
                AND status != 'cancelled'
            ), 0),
            total_transfer = COALESCE((
                SELECT SUM(total)
                FROM bills
                WHERE session_id = NEW.session_id
                AND payment_method = 'transfer'
                AND status != 'cancelled'
            ), 0),
            total_sales = COALESCE((
                SELECT SUM(total)
                FROM bills
                WHERE session_id = NEW.session_id
                AND status != 'cancelled'
            ), 0),
            updated_at = NOW()
        WHERE id = NEW.session_id;
    END IF;

    -- For UPDATE, if session_id changed, update old session too
    IF (TG_OP = 'UPDATE' AND OLD.session_id IS NOT NULL AND OLD.session_id != NEW.session_id) THEN
        UPDATE sessions
        SET 
            total_cash = COALESCE((
                SELECT SUM(total)
                FROM bills
                WHERE session_id = OLD.session_id
                AND payment_method = 'cash'
                AND status != 'cancelled'
            ), 0),
            total_transfer = COALESCE((
                SELECT SUM(total)
                FROM bills
                WHERE session_id = OLD.session_id
                AND payment_method = 'transfer'
                AND status != 'cancelled'
            ), 0),
            total_sales = COALESCE((
                SELECT SUM(total)
                FROM bills
                WHERE session_id = OLD.session_id
                AND status != 'cancelled'
            ), 0),
            updated_at = NOW()
        WHERE id = OLD.session_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_session_totals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_transaction_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- For POS transactions, set status based on paid amount vs total amount
  IF NEW.type = 'pos_sale' THEN
    IF NEW.paid_amount >= NEW.total_amount THEN
      NEW.status = 'completed';
    ELSIF NEW.paid_amount > 0 THEN
      NEW.status = 'partially_paid';
    ELSE
      NEW.status = 'pending';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_transaction_status"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "backup_20250127"."audit_logs" (
    "id" "uuid",
    "user_id" "uuid",
    "action" "text",
    "table_name" "text",
    "record_id" "uuid",
    "old_data" "jsonb",
    "new_data" "jsonb",
    "created_at" timestamp with time zone
);


ALTER TABLE "backup_20250127"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "backup_20250127"."bills" (
    "id" "uuid",
    "description" "text",
    "amount" numeric(10,2),
    "date" timestamp with time zone,
    "status" "text",
    "source_id" "uuid",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "document_url" "text",
    "payer_id" "uuid"
);


ALTER TABLE "backup_20250127"."bills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "backup_20250127"."income_entries" (
    "id" "uuid",
    "amount" numeric(10,2),
    "date" timestamp with time zone,
    "description" "text",
    "source_id" "uuid",
    "income_type_id" "uuid",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "document_url" "text"
);


ALTER TABLE "backup_20250127"."income_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "backup_20250127"."income_types" (
    "id" "uuid",
    "name" "text",
    "description" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "backup_20250127"."income_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "backup_20250127"."measurement_units" (
    "id" "uuid",
    "name" "text",
    "symbol" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "backup_20250127"."measurement_units" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "backup_20250127"."payers" (
    "id" "uuid",
    "user_id" "uuid",
    "name" "text",
    "created_at" timestamp with time zone
);


ALTER TABLE "backup_20250127"."payers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "backup_20250127"."products" (
    "id" "uuid",
    "name" "text",
    "description" "text",
    "product_type" "text",
    "current_stock" numeric(10,3),
    "minimum_stock_level" numeric(10,3),
    "price" numeric(10,2),
    "cost" numeric(10,2),
    "category" "text",
    "subcategory" "text",
    "image_url" "text",
    "source_id" "uuid",
    "measurement_unit_id" "uuid",
    "content_unit_id" "uuid",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "backup_20250127"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "backup_20250127"."recipe_ingredients" (
    "id" "uuid",
    "product_id" "uuid",
    "ingredient_id" "uuid",
    "content_quantity" numeric(10,3),
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "backup_20250127"."recipe_ingredients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "backup_20250127"."source_payer_settings" (
    "id" "uuid",
    "source_id" "uuid",
    "payer_id" "uuid",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "backup_20250127"."source_payer_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "backup_20250127"."source_permissions" (
    "id" "uuid",
    "source_id" "uuid",
    "user_id" "uuid",
    "permission_level" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "backup_20250127"."source_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "backup_20250127"."source_templates" (
    "id" "uuid",
    "source_id" "uuid",
    "name" "text",
    "template_data" "jsonb",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "backup_20250127"."source_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "backup_20250127"."sources" (
    "id" "uuid",
    "name" "text",
    "created_at" timestamp with time zone,
    "user_id" "uuid"
);


ALTER TABLE "backup_20250127"."sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "budget_app"."audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid" NOT NULL,
    "old_data" "jsonb",
    "new_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "budget_app"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "budget_app"."bills" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "description" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "date" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'pending'::"text",
    "source_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "document_url" "text",
    "payer_id" "uuid"
);


ALTER TABLE "budget_app"."bills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "budget_app"."income_entries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "date" timestamp with time zone DEFAULT "now"(),
    "description" "text",
    "source_id" "uuid",
    "income_type_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "document_url" "text"
);


ALTER TABLE "budget_app"."income_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "budget_app"."income_types" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "budget_app"."income_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "budget_app"."measurement_units" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "symbol" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "budget_app"."measurement_units" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "budget_app"."payers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "budget_app"."payers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "budget_app"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "product_type" "text" DEFAULT 'basic'::"text" NOT NULL,
    "current_stock" numeric(10,3),
    "minimum_stock_level" numeric(10,3),
    "price" numeric(10,2),
    "cost" numeric(10,2),
    "category" "text",
    "subcategory" "text",
    "image_url" "text",
    "source_id" "uuid",
    "measurement_unit_id" "uuid",
    "content_unit_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_product_type" CHECK (("product_type" = ANY (ARRAY['basic'::"text", 'composite'::"text"])))
);


ALTER TABLE "budget_app"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "budget_app"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "display_name" "text",
    "status" "text"
);


ALTER TABLE "budget_app"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "budget_app"."profiles" IS 'User profiles table with extended information not stored in auth.users.';



CREATE TABLE IF NOT EXISTS "budget_app"."recipe_ingredients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "ingredient_id" "uuid",
    "content_quantity" numeric(10,3) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "recipe_ingredients_content_quantity_check" CHECK (("content_quantity" > (0)::numeric))
);


ALTER TABLE "budget_app"."recipe_ingredients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "budget_app"."source_payer_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "source_id" "uuid",
    "payer_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "budget_app"."source_payer_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "budget_app"."source_permissions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "source_id" "uuid",
    "user_id" "uuid",
    "permission_level" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "budget_app"."source_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "budget_app"."source_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "source_id" "uuid",
    "name" "text" NOT NULL,
    "template_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "budget_app"."source_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "budget_app"."sources" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid"
);


ALTER TABLE "budget_app"."sources" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."audit_logs" AS
 SELECT "audit_logs"."id",
    "audit_logs"."user_id",
    "audit_logs"."action",
    "audit_logs"."table_name",
    "audit_logs"."record_id",
    "audit_logs"."old_data",
    "audit_logs"."new_data",
    "audit_logs"."created_at"
   FROM "budget_app"."audit_logs";


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."bills" AS
 SELECT "bills"."id",
    "bills"."description",
    "bills"."amount",
    "bills"."date",
    "bills"."status",
    "bills"."source_id",
    "bills"."created_at",
    "bills"."updated_at",
    "bills"."document_url",
    "bills"."payer_id"
   FROM "budget_app"."bills";


ALTER TABLE "public"."bills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "source_id" "uuid",
    "parent_id" "uuid"
);

ALTER TABLE ONLY "public"."categories" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."consignment_settlements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "consignment_id" "uuid" NOT NULL,
    "settlement_date" timestamp with time zone NOT NULL,
    "quantity_sold" integer NOT NULL,
    "total_amount" numeric NOT NULL,
    "supplier_amount" numeric NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "payment_date" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."consignment_settlements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."consignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_id" "uuid" NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "unit_cost" numeric NOT NULL,
    "selling_price" numeric NOT NULL,
    "current_stock" integer DEFAULT 0,
    "minimum_stock_level" integer DEFAULT 0,
    "category" "text",
    "subcategory" "text",
    "image_url" "text",
    "storage_location" "text",
    "unit_of_measurement" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "measurement_unit_id" "uuid"
);


ALTER TABLE "public"."consignments" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."income_entries" AS
 SELECT "income_entries"."id",
    "income_entries"."amount",
    "income_entries"."date",
    "income_entries"."description",
    "income_entries"."source_id",
    "income_entries"."income_type_id",
    "income_entries"."created_at",
    "income_entries"."updated_at",
    "income_entries"."document_url"
   FROM "budget_app"."income_entries";


ALTER TABLE "public"."income_entries" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."income_types" AS
 SELECT "income_types"."id",
    "income_types"."name",
    "income_types"."description",
    "income_types"."created_at",
    "income_types"."updated_at"
   FROM "budget_app"."income_types";


ALTER TABLE "public"."income_types" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."measurement_units" AS
 SELECT "measurement_units"."id",
    "measurement_units"."name",
    "measurement_units"."symbol",
    "measurement_units"."created_at",
    "measurement_units"."updated_at"
   FROM "budget_app"."measurement_units";


ALTER TABLE "public"."measurement_units" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE ONLY "public"."payers" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."payers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_batches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "batch_number" "text" NOT NULL,
    "quantity" numeric DEFAULT 0 NOT NULL,
    "purchase_date" timestamp with time zone NOT NULL,
    "expiry_date" timestamp with time zone,
    "unit_cost" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."product_batches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_recipes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."product_recipes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."products" AS
 SELECT "products"."id",
    "products"."name",
    "products"."description",
    "products"."product_type",
    "products"."current_stock",
    "products"."minimum_stock_level",
    "products"."price",
    "products"."cost",
    "products"."category",
    "products"."subcategory",
    "products"."image_url",
    "products"."source_id",
    "products"."measurement_unit_id",
    "products"."content_unit_id",
    "products"."created_at",
    "products"."updated_at"
   FROM "budget_app"."products";


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."profiles" AS
 SELECT "profiles"."id",
    "profiles"."email",
    "profiles"."created_at",
    "profiles"."updated_at",
    "profiles"."display_name",
    "profiles"."status"
   FROM "budget_app"."profiles";


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."recipe_ingredients" AS
 SELECT "recipe_ingredients"."id",
    "recipe_ingredients"."product_id",
    "recipe_ingredients"."ingredient_id",
    "recipe_ingredients"."content_quantity",
    "recipe_ingredients"."created_at",
    "recipe_ingredients"."updated_at"
   FROM "budget_app"."recipe_ingredients";


ALTER TABLE "public"."recipe_ingredients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "price" numeric NOT NULL,
    "category" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "measurement_unit_id" "uuid"
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_id" "uuid" NOT NULL,
    "status" "public"."session_status" DEFAULT 'active'::"public"."session_status" NOT NULL,
    "start_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "end_time" timestamp with time zone,
    "total_cash" numeric DEFAULT 0 NOT NULL,
    "total_transfer" numeric DEFAULT 0 NOT NULL,
    "total_sales" numeric DEFAULT 0 NOT NULL,
    "total_expenses" numeric DEFAULT 0 NOT NULL,
    "consolidated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reconciliation_notes" "text",
    "reconciliation_time" timestamp with time zone,
    "verified_cash_amount" numeric DEFAULT 0
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."source_payer_settings" AS
 SELECT "source_payer_settings"."id",
    "source_payer_settings"."source_id",
    "source_payer_settings"."payer_id",
    "source_payer_settings"."created_at",
    "source_payer_settings"."updated_at"
   FROM "budget_app"."source_payer_settings";


ALTER TABLE "public"."source_payer_settings" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."source_permissions" AS
 SELECT "source_permissions"."id",
    "source_permissions"."source_id",
    "source_permissions"."user_id",
    "source_permissions"."permission_level",
    "source_permissions"."created_at",
    "source_permissions"."updated_at"
   FROM "budget_app"."source_permissions";


ALTER TABLE "public"."source_permissions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."source_templates" AS
 SELECT "source_templates"."id",
    "source_templates"."source_id",
    "source_templates"."name",
    "source_templates"."template_data",
    "source_templates"."created_at",
    "source_templates"."updated_at"
   FROM "budget_app"."source_templates";


ALTER TABLE "public"."source_templates" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."sources" AS
 SELECT "sources"."id",
    "sources"."name",
    "sources"."created_at",
    "sources"."user_id"
   FROM "budget_app"."sources";


ALTER TABLE "public"."sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stock_movements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "movement_type" "text" NOT NULL,
    "quantity" numeric NOT NULL,
    "unit_cost" numeric,
    "batch_number" "text",
    "expiry_date" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_by" "uuid" NOT NULL,
    "is_consignment_return" boolean DEFAULT false,
    CONSTRAINT "stock_movements_movement_type_check" CHECK (("movement_type" = ANY (ARRAY['purchase'::"text", 'sale'::"text", 'waste'::"text", 'adjustment'::"text"])))
);


ALTER TABLE "public"."stock_movements" OWNER TO "postgres";


COMMENT ON COLUMN "public"."stock_movements"."is_consignment_return" IS 'Indicates if this movement is a return of unsold consignment items';



CREATE TABLE IF NOT EXISTS "public"."supplier_settlement_terms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "settlement_frequency" "text" NOT NULL,
    "payment_terms" integer NOT NULL,
    "commission_rate" numeric,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."supplier_settlement_terms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."suppliers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "contact_info" "jsonb",
    "address" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."suppliers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "public"."template_type" NOT NULL,
    "config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "source_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "type" "text" NOT NULL,
    "category" "text",
    "date" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "payer_id" "uuid",
    "category_id" "uuid",
    "created_by_name" "text" DEFAULT 'Unknown User'::"text" NOT NULL,
    "status" "public"."transaction_status" DEFAULT 'pending'::"public"."transaction_status" NOT NULL,
    "document_url" "text",
    "total_amount" numeric,
    "remaining_amount" numeric,
    "parent_transaction_id" "uuid",
    "is_recurring" boolean DEFAULT false,
    "recurring_frequency" "text",
    "next_occurrence" timestamp with time zone,
    "payment_method" "public"."payment_method" DEFAULT 'transfer'::"public"."payment_method" NOT NULL,
    "session_id" "uuid",
    CONSTRAINT "chk_transaction_status" CHECK (("status" = ANY (ARRAY['pending'::"public"."transaction_status", 'completed'::"public"."transaction_status", 'partially_paid'::"public"."transaction_status"]))),
    CONSTRAINT "transactions_recurring_frequency_check" CHECK (("recurring_frequency" = ANY (ARRAY['daily'::"text", 'weekly'::"text", 'monthly'::"text", 'yearly'::"text"]))),
    CONSTRAINT "transactions_type_check" CHECK (("type" = ANY (ARRAY['income'::"text", 'expense'::"text"])))
);

ALTER TABLE ONLY "public"."transactions" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."type_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "source_id" "uuid",
    "type_id" "uuid",
    "is_enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."type_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."type_subcategories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "type_id" "uuid",
    "name" character varying(255) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."type_subcategories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."types" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "is_enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."user_role_type" DEFAULT 'viewer'::"public"."user_role_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."user_roles" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "budget_app"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget_app"."bills"
    ADD CONSTRAINT "bills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget_app"."income_entries"
    ADD CONSTRAINT "income_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget_app"."income_types"
    ADD CONSTRAINT "income_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget_app"."measurement_units"
    ADD CONSTRAINT "measurement_units_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget_app"."payers"
    ADD CONSTRAINT "payers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget_app"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget_app"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget_app"."recipe_ingredients"
    ADD CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget_app"."recipe_ingredients"
    ADD CONSTRAINT "recipe_ingredients_unique_product_ingredient" UNIQUE ("product_id", "ingredient_id");



ALTER TABLE ONLY "budget_app"."source_payer_settings"
    ADD CONSTRAINT "source_payer_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget_app"."source_payer_settings"
    ADD CONSTRAINT "source_payer_settings_source_id_payer_id_key" UNIQUE ("source_id", "payer_id");



ALTER TABLE ONLY "budget_app"."source_permissions"
    ADD CONSTRAINT "source_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget_app"."source_permissions"
    ADD CONSTRAINT "source_permissions_source_id_user_id_key" UNIQUE ("source_id", "user_id");



ALTER TABLE ONLY "budget_app"."source_templates"
    ADD CONSTRAINT "source_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget_app"."sources"
    ADD CONSTRAINT "sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_source_unique" UNIQUE ("name", "source_id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consignment_settlements"
    ADD CONSTRAINT "consignment_settlements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consignments"
    ADD CONSTRAINT "consignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."type_subcategories"
    ADD CONSTRAINT "income_subcategories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."type_settings"
    ADD CONSTRAINT "income_type_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."type_settings"
    ADD CONSTRAINT "income_type_settings_source_id_income_type_id_key" UNIQUE ("source_id", "type_id");



ALTER TABLE ONLY "public"."types"
    ADD CONSTRAINT "income_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "one_active_session_per_source" EXCLUDE USING "btree" ("source_id" WITH =) WHERE (("status" = 'active'::"public"."session_status"));



ALTER TABLE ONLY "public"."payers"
    ADD CONSTRAINT "payers_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."payers"
    ADD CONSTRAINT "payers_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "public"."payers"
    ADD CONSTRAINT "payers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payers"
    ADD CONSTRAINT "payers_user_id_name_key" UNIQUE ("user_id", "name");



ALTER TABLE ONLY "public"."product_batches"
    ADD CONSTRAINT "product_batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_recipes"
    ADD CONSTRAINT "product_recipes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_settlement_terms"
    ADD CONSTRAINT "supplier_settlement_terms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_settlement_terms"
    ADD CONSTRAINT "supplier_settlement_terms_supplier_id_key" UNIQUE ("supplier_id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "temp_suppliers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_key" UNIQUE ("user_id");



CREATE INDEX "idx_bills_date" ON "budget_app"."bills" USING "btree" ("date");



CREATE INDEX "idx_bills_source" ON "budget_app"."bills" USING "btree" ("source_id");



CREATE INDEX "idx_income_entries_date" ON "budget_app"."income_entries" USING "btree" ("date");



CREATE INDEX "idx_income_entries_source" ON "budget_app"."income_entries" USING "btree" ("source_id");



CREATE INDEX "idx_products_content_unit" ON "budget_app"."products" USING "btree" ("content_unit_id");



CREATE INDEX "idx_products_measurement_unit" ON "budget_app"."products" USING "btree" ("measurement_unit_id");



CREATE INDEX "idx_products_source" ON "budget_app"."products" USING "btree" ("source_id");



CREATE INDEX "idx_recipe_ingredients_ingredient" ON "budget_app"."recipe_ingredients" USING "btree" ("ingredient_id");



CREATE INDEX "idx_recipe_ingredients_product" ON "budget_app"."recipe_ingredients" USING "btree" ("product_id");



CREATE INDEX "idx_source_permissions_source" ON "budget_app"."source_permissions" USING "btree" ("source_id");



CREATE INDEX "idx_source_permissions_user" ON "budget_app"."source_permissions" USING "btree" ("user_id");



CREATE INDEX "idx_categories_parent_id" ON "public"."categories" USING "btree" ("parent_id");



CREATE INDEX "idx_categories_source_id" ON "public"."categories" USING "btree" ("source_id", "name");



CREATE INDEX "idx_product_batches_product_id" ON "public"."product_batches" USING "btree" ("product_id");



CREATE INDEX "idx_services_measurement_unit_id" ON "public"."services" USING "btree" ("measurement_unit_id");



CREATE INDEX "idx_stock_movements_product_id" ON "public"."stock_movements" USING "btree" ("product_id");



CREATE INDEX "idx_transactions_source_date" ON "public"."transactions" USING "btree" ("source_id", "date" DESC);



CREATE INDEX "idx_transactions_type_status" ON "public"."transactions" USING "btree" ("type", "status");



CREATE OR REPLACE TRIGGER "set_profiles_updated_at" BEFORE UPDATE ON "budget_app"."profiles" FOR EACH ROW EXECUTE FUNCTION "budget_app"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "budget_app"."bills" FOR EACH ROW EXECUTE FUNCTION "budget_app"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "budget_app"."income_entries" FOR EACH ROW EXECUTE FUNCTION "budget_app"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "budget_app"."income_types" FOR EACH ROW EXECUTE FUNCTION "budget_app"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "budget_app"."products" FOR EACH ROW EXECUTE FUNCTION "budget_app"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "budget_app"."recipe_ingredients" FOR EACH ROW EXECUTE FUNCTION "budget_app"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "budget_app"."source_payer_settings" FOR EACH ROW EXECUTE FUNCTION "budget_app"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "budget_app"."source_permissions" FOR EACH ROW EXECUTE FUNCTION "budget_app"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "budget_app"."source_templates" FOR EACH ROW EXECUTE FUNCTION "budget_app"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_services_updated_at" BEFORE UPDATE ON "public"."services" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_product_recipes" BEFORE UPDATE ON "public"."product_recipes" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "transactions_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."create_audit_log"();



CREATE OR REPLACE TRIGGER "update_transaction_status_trigger" BEFORE INSERT OR UPDATE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_transaction_status"();



ALTER TABLE ONLY "budget_app"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "budget_app"."bills"
    ADD CONSTRAINT "bills_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "budget_app"."sources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "budget_app"."income_entries"
    ADD CONSTRAINT "income_entries_income_type_id_fkey" FOREIGN KEY ("income_type_id") REFERENCES "budget_app"."income_types"("id");



ALTER TABLE ONLY "budget_app"."income_entries"
    ADD CONSTRAINT "income_entries_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "budget_app"."sources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "budget_app"."payers"
    ADD CONSTRAINT "payers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "budget_app"."products"
    ADD CONSTRAINT "products_content_unit_id_fkey" FOREIGN KEY ("content_unit_id") REFERENCES "budget_app"."measurement_units"("id");



ALTER TABLE ONLY "budget_app"."products"
    ADD CONSTRAINT "products_measurement_unit_id_fkey" FOREIGN KEY ("measurement_unit_id") REFERENCES "budget_app"."measurement_units"("id");



ALTER TABLE ONLY "budget_app"."products"
    ADD CONSTRAINT "products_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "budget_app"."sources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "budget_app"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "budget_app"."recipe_ingredients"
    ADD CONSTRAINT "recipe_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "budget_app"."products"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "budget_app"."recipe_ingredients"
    ADD CONSTRAINT "recipe_ingredients_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "budget_app"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "budget_app"."source_payer_settings"
    ADD CONSTRAINT "source_payer_settings_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "budget_app"."sources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "budget_app"."source_permissions"
    ADD CONSTRAINT "source_permissions_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "budget_app"."sources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "budget_app"."source_permissions"
    ADD CONSTRAINT "source_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "budget_app"."source_templates"
    ADD CONSTRAINT "source_templates_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "budget_app"."sources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "budget_app"."sources"
    ADD CONSTRAINT "sources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."consignment_settlements"
    ADD CONSTRAINT "consignment_settlements_consignment_id_fkey" FOREIGN KEY ("consignment_id") REFERENCES "public"."consignments"("id");



ALTER TABLE ONLY "public"."consignments"
    ADD CONSTRAINT "consignments_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id");



ALTER TABLE ONLY "public"."type_subcategories"
    ADD CONSTRAINT "income_subcategories_income_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."type_settings"
    ADD CONSTRAINT "income_type_settings_income_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_consolidated_by_fkey" FOREIGN KEY ("consolidated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."supplier_settlement_terms"
    ADD CONSTRAINT "supplier_settlement_terms_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "temp_suppliers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_parent_transaction_id_fkey" FOREIGN KEY ("parent_transaction_id") REFERENCES "public"."transactions"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "public"."payers"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Users can delete products from their sources" ON "budget_app"."products" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "budget_app"."sources" "s"
  WHERE (("s"."id" = "products"."source_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete recipe ingredients from their sources" ON "budget_app"."recipe_ingredients" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("budget_app"."products" "p"
     JOIN "budget_app"."sources" "s" ON (("s"."id" = "p"."source_id")))
  WHERE (("p"."id" = "recipe_ingredients"."product_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete their source bills" ON "budget_app"."bills" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "budget_app"."sources" "s"
  WHERE (("s"."id" = "bills"."source_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert bills to their sources" ON "budget_app"."bills" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "budget_app"."sources" "s"
  WHERE (("s"."id" = "bills"."source_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert income to their sources" ON "budget_app"."income_entries" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "budget_app"."sources" "s"
  WHERE (("s"."id" = "income_entries"."source_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert products to their sources" ON "budget_app"."products" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "budget_app"."sources" "s"
  WHERE (("s"."id" = "products"."source_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert recipe ingredients for their sources" ON "budget_app"."recipe_ingredients" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("budget_app"."products" "p"
     JOIN "budget_app"."sources" "s" ON (("s"."id" = "p"."source_id")))
  WHERE (("p"."id" = "recipe_ingredients"."product_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own profile" ON "budget_app"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update products in their sources" ON "budget_app"."products" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "budget_app"."sources" "s"
  WHERE (("s"."id" = "products"."source_id") AND ("s"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "budget_app"."sources" "s"
  WHERE (("s"."id" = "products"."source_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update recipe ingredients for their sources" ON "budget_app"."recipe_ingredients" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("budget_app"."products" "p"
     JOIN "budget_app"."sources" "s" ON (("s"."id" = "p"."source_id")))
  WHERE (("p"."id" = "recipe_ingredients"."product_id") AND ("s"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("budget_app"."products" "p"
     JOIN "budget_app"."sources" "s" ON (("s"."id" = "p"."source_id")))
  WHERE (("p"."id" = "recipe_ingredients"."product_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their source bills" ON "budget_app"."bills" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "budget_app"."sources" "s"
  WHERE (("s"."id" = "bills"."source_id") AND ("s"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "budget_app"."sources" "s"
  WHERE (("s"."id" = "bills"."source_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own profile" ON "budget_app"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view products from their sources" ON "budget_app"."products" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "budget_app"."sources" "s"
  WHERE (("s"."id" = "products"."source_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view recipe ingredients from their sources" ON "budget_app"."recipe_ingredients" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("budget_app"."products" "p"
     JOIN "budget_app"."sources" "s" ON (("s"."id" = "p"."source_id")))
  WHERE (("p"."id" = "recipe_ingredients"."product_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their source bills" ON "budget_app"."bills" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "budget_app"."sources" "s"
  WHERE (("s"."id" = "bills"."source_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their source income" ON "budget_app"."income_entries" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "budget_app"."sources" "s"
  WHERE (("s"."id" = "income_entries"."source_id") AND ("s"."user_id" = "auth"."uid"())))));



ALTER TABLE "budget_app"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "budget_app"."bills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "budget_app"."income_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "budget_app"."income_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "budget_app"."measurement_units" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "budget_app"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "budget_app"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "budget_app"."recipe_ingredients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "budget_app"."source_payer_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "budget_app"."source_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "budget_app"."source_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "budget_app"."sources" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Allow all users to view income subcategories" ON "public"."type_subcategories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow all users to view types" ON "public"."types" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can create their own suppliers" ON "public"."suppliers" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own suppliers" ON "public"."suppliers" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage supplier terms" ON "public"."supplier_settlement_terms" USING ((EXISTS ( SELECT 1
   FROM "public"."suppliers" "s"
  WHERE (("s"."id" = "supplier_settlement_terms"."supplier_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own suppliers" ON "public"."suppliers" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view supplier terms" ON "public"."supplier_settlement_terms" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."suppliers" "s"
  WHERE (("s"."id" = "supplier_settlement_terms"."supplier_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view suppliers" ON "public"."suppliers" FOR SELECT USING (true);



CREATE POLICY "allow_all" ON "public"."user_roles" TO "authenticated" USING (true);



ALTER TABLE "public"."consignment_settlements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."consignments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "controller_full_access" ON "public"."consignments" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'controller'::"public"."user_role_type")))));



CREATE POLICY "controller_full_access" ON "public"."services" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'controller'::"public"."user_role_type")))));



CREATE POLICY "controller_full_access" ON "public"."transactions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'controller'::"public"."user_role_type")))));



CREATE POLICY "controller_manage_sessions" ON "public"."sessions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'controller'::"public"."user_role_type")))));



ALTER TABLE "public"."product_batches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_recipes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public_access" ON "public"."categories" USING (true);



CREATE POLICY "public_access" ON "public"."payers" USING (true);



CREATE POLICY "roles_access" ON "public"."user_roles" TO "authenticated" USING (((( SELECT "user_roles_1"."role"
   FROM "public"."user_roles" "user_roles_1"
  WHERE ("user_roles_1"."user_id" = "auth"."uid"())) = 'controller'::"public"."user_role_type") OR ("user_id" = "auth"."uid"())));



ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stock_movements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_settlement_terms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."suppliers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."type_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."type_subcategories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."types" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


CREATE PUBLICATION "supabase_realtime_messages_publication" WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION "supabase_realtime_messages_publication" OWNER TO "supabase_admin";


GRANT USAGE ON SCHEMA "budget_app" TO "authenticated";
GRANT USAGE ON SCHEMA "budget_app" TO "anon";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."accept_invitation"("token" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_invitation"("token" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_invitation"("token" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."assign_source_to_user"("target_user_email" "text", "source_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."assign_source_to_user"("target_user_email" "text", "source_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_source_to_user"("target_user_email" "text", "source_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_available_content"("product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_available_content"("product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_available_content"("product_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_available_quantity"("product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_available_quantity"("product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_available_quantity"("product_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_required_units"("required_content" numeric, "content_per_unit" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_required_units"("required_content" numeric, "content_per_unit" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_required_units"("required_content" numeric, "content_per_unit" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_audit_log"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_audit_log"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_audit_log"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_bill_items"("p_bill_id" "uuid", "p_items" "jsonb"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."create_bill_items"("p_bill_id" "uuid", "p_items" "jsonb"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_bill_items"("p_bill_id" "uuid", "p_items" "jsonb"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_profile"("user_id" "uuid", "user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile"("user_id" "uuid", "user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile"("user_id" "uuid", "user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_source_permission"("user_id" "uuid", "source_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_source_permission"("user_id" "uuid", "source_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_source_permission"("user_id" "uuid", "source_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_role"("user_id" "uuid", "user_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_role"("user_id" "uuid", "user_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_role"("user_id" "uuid", "user_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_auth_user"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_auth_user"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_auth_user"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_session_stats"("source_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_session_stats"("source_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_session_stats"("source_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_full_access"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."has_full_access"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_full_access"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_controller"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_controller"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_controller"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."make_price_optional"() TO "anon";
GRANT ALL ON FUNCTION "public"."make_price_optional"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."make_price_optional"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_bill_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_bill_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_bill_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_session_totals"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_session_totals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_session_totals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_transaction_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_transaction_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_transaction_status"() TO "service_role";



GRANT SELECT,UPDATE ON TABLE "budget_app"."profiles" TO "authenticated";
GRANT SELECT ON TABLE "budget_app"."profiles" TO "anon";


















GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."bills" TO "anon";
GRANT ALL ON TABLE "public"."bills" TO "authenticated";
GRANT ALL ON TABLE "public"."bills" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."consignment_settlements" TO "anon";
GRANT ALL ON TABLE "public"."consignment_settlements" TO "authenticated";
GRANT ALL ON TABLE "public"."consignment_settlements" TO "service_role";



GRANT ALL ON TABLE "public"."consignments" TO "anon";
GRANT ALL ON TABLE "public"."consignments" TO "authenticated";
GRANT ALL ON TABLE "public"."consignments" TO "service_role";



GRANT ALL ON TABLE "public"."income_entries" TO "anon";
GRANT ALL ON TABLE "public"."income_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."income_entries" TO "service_role";



GRANT ALL ON TABLE "public"."income_types" TO "anon";
GRANT ALL ON TABLE "public"."income_types" TO "authenticated";
GRANT ALL ON TABLE "public"."income_types" TO "service_role";



GRANT ALL ON TABLE "public"."measurement_units" TO "anon";
GRANT ALL ON TABLE "public"."measurement_units" TO "authenticated";
GRANT ALL ON TABLE "public"."measurement_units" TO "service_role";



GRANT ALL ON TABLE "public"."payers" TO "anon";
GRANT ALL ON TABLE "public"."payers" TO "authenticated";
GRANT ALL ON TABLE "public"."payers" TO "service_role";



GRANT ALL ON TABLE "public"."product_batches" TO "anon";
GRANT ALL ON TABLE "public"."product_batches" TO "authenticated";
GRANT ALL ON TABLE "public"."product_batches" TO "service_role";



GRANT ALL ON TABLE "public"."product_recipes" TO "anon";
GRANT ALL ON TABLE "public"."product_recipes" TO "authenticated";
GRANT ALL ON TABLE "public"."product_recipes" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."recipe_ingredients" TO "anon";
GRANT ALL ON TABLE "public"."recipe_ingredients" TO "authenticated";
GRANT ALL ON TABLE "public"."recipe_ingredients" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON TABLE "public"."source_payer_settings" TO "anon";
GRANT ALL ON TABLE "public"."source_payer_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."source_payer_settings" TO "service_role";



GRANT ALL ON TABLE "public"."source_permissions" TO "anon";
GRANT ALL ON TABLE "public"."source_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."source_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."source_templates" TO "anon";
GRANT ALL ON TABLE "public"."source_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."source_templates" TO "service_role";



GRANT ALL ON TABLE "public"."sources" TO "anon";
GRANT ALL ON TABLE "public"."sources" TO "authenticated";
GRANT ALL ON TABLE "public"."sources" TO "service_role";



GRANT ALL ON TABLE "public"."stock_movements" TO "anon";
GRANT ALL ON TABLE "public"."stock_movements" TO "authenticated";
GRANT ALL ON TABLE "public"."stock_movements" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_settlement_terms" TO "anon";
GRANT ALL ON TABLE "public"."supplier_settlement_terms" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_settlement_terms" TO "service_role";



GRANT ALL ON TABLE "public"."suppliers" TO "anon";
GRANT ALL ON TABLE "public"."suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."suppliers" TO "service_role";



GRANT ALL ON TABLE "public"."templates" TO "anon";
GRANT ALL ON TABLE "public"."templates" TO "authenticated";
GRANT ALL ON TABLE "public"."templates" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."type_settings" TO "anon";
GRANT ALL ON TABLE "public"."type_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."type_settings" TO "service_role";



GRANT ALL ON TABLE "public"."type_subcategories" TO "anon";
GRANT ALL ON TABLE "public"."type_subcategories" TO "authenticated";
GRANT ALL ON TABLE "public"."type_subcategories" TO "service_role";



GRANT ALL ON TABLE "public"."types" TO "anon";
GRANT ALL ON TABLE "public"."types" TO "authenticated";
GRANT ALL ON TABLE "public"."types" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
