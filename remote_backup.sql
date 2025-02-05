

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


CREATE SCHEMA IF NOT EXISTS "budget";


ALTER SCHEMA "budget" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "budget"."budgets" (
    "id" bigint NOT NULL,
    "user_id" bigint,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "budget"."budgets" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "budget"."budgets_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "budget"."budgets_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "budget"."budgets_id_seq" OWNED BY "budget"."budgets"."id";



CREATE TABLE IF NOT EXISTS "budget"."categories" (
    "id" bigint NOT NULL,
    "budget_id" bigint,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "budget"."categories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "budget"."categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "budget"."categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "budget"."categories_id_seq" OWNED BY "budget"."categories"."id";



CREATE TABLE IF NOT EXISTS "budget"."transactions" (
    "id" bigint NOT NULL,
    "category_id" bigint,
    "amount" numeric(12,2) NOT NULL,
    "description" "text",
    "date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "budget"."transactions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "budget"."transactions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "budget"."transactions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "budget"."transactions_id_seq" OWNED BY "budget"."transactions"."id";



CREATE TABLE IF NOT EXISTS "budget"."users" (
    "id" bigint NOT NULL,
    "auth_id" "text" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "budget"."users" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "budget"."users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "budget"."users_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "budget"."users_id_seq" OWNED BY "budget"."users"."id";



ALTER TABLE ONLY "budget"."budgets" ALTER COLUMN "id" SET DEFAULT "nextval"('"budget"."budgets_id_seq"'::"regclass");



ALTER TABLE ONLY "budget"."categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"budget"."categories_id_seq"'::"regclass");



ALTER TABLE ONLY "budget"."transactions" ALTER COLUMN "id" SET DEFAULT "nextval"('"budget"."transactions_id_seq"'::"regclass");



ALTER TABLE ONLY "budget"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"budget"."users_id_seq"'::"regclass");



ALTER TABLE ONLY "budget"."budgets"
    ADD CONSTRAINT "budgets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget"."users"
    ADD CONSTRAINT "users_auth_id_key" UNIQUE ("auth_id");



ALTER TABLE ONLY "budget"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "budget"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "budget"."budgets"
    ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "budget"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "budget"."categories"
    ADD CONSTRAINT "categories_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budget"."budgets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "budget"."transactions"
    ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "budget"."categories"("id") ON DELETE CASCADE;



CREATE POLICY "Users can create budgets" ON "budget"."budgets" FOR INSERT WITH CHECK ((("auth"."uid"())::"text" IN ( SELECT "users"."auth_id"
   FROM "budget"."users"
  WHERE ("users"."id" = "budgets"."user_id"))));



CREATE POLICY "Users can create categories in own budgets" ON "budget"."categories" FOR INSERT WITH CHECK ((("auth"."uid"())::"text" IN ( SELECT "users"."auth_id"
   FROM "budget"."users"
  WHERE ("users"."id" = ( SELECT "budgets"."user_id"
           FROM "budget"."budgets"
          WHERE ("budgets"."id" = "categories"."budget_id"))))));



CREATE POLICY "Users can create transactions in own categories" ON "budget"."transactions" FOR INSERT WITH CHECK ((("auth"."uid"())::"text" IN ( SELECT "users"."auth_id"
   FROM "budget"."users"
  WHERE ("users"."id" = ( SELECT "budgets"."user_id"
           FROM "budget"."budgets"
          WHERE ("budgets"."id" = ( SELECT "categories"."budget_id"
                   FROM "budget"."categories"
                  WHERE ("categories"."id" = "transactions"."category_id"))))))));



CREATE POLICY "Users can delete own budgets" ON "budget"."budgets" FOR DELETE USING ((("auth"."uid"())::"text" IN ( SELECT "users"."auth_id"
   FROM "budget"."users"
  WHERE ("users"."id" = "budgets"."user_id"))));



CREATE POLICY "Users can delete own categories" ON "budget"."categories" FOR DELETE USING ((("auth"."uid"())::"text" IN ( SELECT "users"."auth_id"
   FROM "budget"."users"
  WHERE ("users"."id" = ( SELECT "budgets"."user_id"
           FROM "budget"."budgets"
          WHERE ("budgets"."id" = "categories"."budget_id"))))));



CREATE POLICY "Users can delete own transactions" ON "budget"."transactions" FOR DELETE USING ((("auth"."uid"())::"text" IN ( SELECT "users"."auth_id"
   FROM "budget"."users"
  WHERE ("users"."id" = ( SELECT "budgets"."user_id"
           FROM "budget"."budgets"
          WHERE ("budgets"."id" = ( SELECT "categories"."budget_id"
                   FROM "budget"."categories"
                  WHERE ("categories"."id" = "transactions"."category_id"))))))));



CREATE POLICY "Users can update own budgets" ON "budget"."budgets" FOR UPDATE USING ((("auth"."uid"())::"text" IN ( SELECT "users"."auth_id"
   FROM "budget"."users"
  WHERE ("users"."id" = "budgets"."user_id"))));



CREATE POLICY "Users can update own categories" ON "budget"."categories" FOR UPDATE USING ((("auth"."uid"())::"text" IN ( SELECT "users"."auth_id"
   FROM "budget"."users"
  WHERE ("users"."id" = ( SELECT "budgets"."user_id"
           FROM "budget"."budgets"
          WHERE ("budgets"."id" = "categories"."budget_id"))))));



CREATE POLICY "Users can update own profile" ON "budget"."users" FOR UPDATE USING ((("auth"."uid"())::"text" = "auth_id"));



CREATE POLICY "Users can update own transactions" ON "budget"."transactions" FOR UPDATE USING ((("auth"."uid"())::"text" IN ( SELECT "users"."auth_id"
   FROM "budget"."users"
  WHERE ("users"."id" = ( SELECT "budgets"."user_id"
           FROM "budget"."budgets"
          WHERE ("budgets"."id" = ( SELECT "categories"."budget_id"
                   FROM "budget"."categories"
                  WHERE ("categories"."id" = "transactions"."category_id"))))))));



CREATE POLICY "Users can view own budgets" ON "budget"."budgets" FOR SELECT USING ((("auth"."uid"())::"text" IN ( SELECT "users"."auth_id"
   FROM "budget"."users"
  WHERE ("users"."id" = "budgets"."user_id"))));



CREATE POLICY "Users can view own categories" ON "budget"."categories" FOR SELECT USING ((("auth"."uid"())::"text" IN ( SELECT "users"."auth_id"
   FROM "budget"."users"
  WHERE ("users"."id" = ( SELECT "budgets"."user_id"
           FROM "budget"."budgets"
          WHERE ("budgets"."id" = "categories"."budget_id"))))));



CREATE POLICY "Users can view own profile" ON "budget"."users" FOR SELECT USING ((("auth"."uid"())::"text" = "auth_id"));



CREATE POLICY "Users can view own transactions" ON "budget"."transactions" FOR SELECT USING ((("auth"."uid"())::"text" IN ( SELECT "users"."auth_id"
   FROM "budget"."users"
  WHERE ("users"."id" = ( SELECT "budgets"."user_id"
           FROM "budget"."budgets"
          WHERE ("budgets"."id" = ( SELECT "categories"."budget_id"
                   FROM "budget"."categories"
                  WHERE ("categories"."id" = "transactions"."category_id"))))))));



ALTER TABLE "budget"."budgets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "budget"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "budget"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "budget"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


CREATE PUBLICATION "supabase_realtime_messages_publication" WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION "supabase_realtime_messages_publication" OWNER TO "supabase_admin";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



































































































































































































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
