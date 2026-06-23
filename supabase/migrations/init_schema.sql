


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


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."announcements" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "author" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."announcements" OWNER TO "postgres";


ALTER TABLE "public"."announcements" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."announcements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."officers" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "year" "text" NOT NULL,
    "position" "text" NOT NULL,
    "name" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "sort_order" integer NOT NULL
);


ALTER TABLE "public"."officers" OWNER TO "postgres";


ALTER TABLE "public"."officers" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."officers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."practices" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "day" "text" NOT NULL,
    "time_range" "text" NOT NULL,
    "location" "text" NOT NULL
);


ALTER TABLE "public"."practices" OWNER TO "postgres";


ALTER TABLE "public"."practices" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."practices_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tournament_archives" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "edition" "text" NOT NULL,
    "event_date" "text" NOT NULL,
    "scores_url" "text",
    "videos_url" "text",
    "photos_urls" "text"[],
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "event_number" integer NOT NULL
);


ALTER TABLE "public"."tournament_archives" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tournament_webpage" (
    "id" integer DEFAULT 1 NOT NULL,
    "event_number" "text" DEFAULT '19th'::"text",
    "uwg_day" "text" DEFAULT 'Saturday, November 15th, 2025'::"text",
    "doors_open" "text" DEFAULT ''::"text",
    "opening_ceremony" "text" DEFAULT ''::"text",
    "competition_begin" "text" DEFAULT ''::"text",
    "venue_location" "text" DEFAULT 'Ritchie Coliseum'::"text",
    "venue_address" "text" DEFAULT '7675 Baltimore Ave, College Park, MD 20742'::"text",
    "parking_locations" "text" DEFAULT 'J2, J1, L'::"text",
    "livestream_ring_1" "text" DEFAULT ''::"text",
    "livestream_ring_2" "text" DEFAULT ''::"text",
    "committee_chief" "text" DEFAULT ''::"text",
    "collegiate_liaison" "text" DEFAULT ''::"text",
    "wushu_liaison" "text" DEFAULT ''::"text",
    "judges_liaison" "text" DEFAULT ''::"text",
    "design_chair" "text" DEFAULT ''::"text",
    "visual_tech_chair" "text" DEFAULT ''::"text",
    "score_contesting" "text" DEFAULT ''::"text",
    "registration_manager" "text" DEFAULT ''::"text",
    "ring_coordinator" "text" DEFAULT ''::"text",
    "webmaster" "text" DEFAULT ''::"text",
    "reg_begins" timestamp with time zone,
    "early_reg_ends" timestamp with time zone,
    "late_reg_ends" timestamp with time zone,
    "early_reg_price" numeric DEFAULT 0,
    "late_fee" numeric DEFAULT 0,
    "collegiate_discount" numeric DEFAULT 0,
    "price_per_event" numeric DEFAULT 0
);


ALTER TABLE "public"."tournament_webpage" OWNER TO "postgres";


ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."officers"
    ADD CONSTRAINT "officers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."practices"
    ADD CONSTRAINT "practices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tournament_archives"
    ADD CONSTRAINT "tournament_archives_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tournament_webpage"
    ADD CONSTRAINT "tournament_webpage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tournament_archives"
    ADD CONSTRAINT "unique_edition" UNIQUE ("edition");



ALTER TABLE ONLY "public"."officers"
    ADD CONSTRAINT "unique_year_position" UNIQUE ("year", "position");



CREATE POLICY "Admins full control practices" ON "public"."tournament_webpage" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow admin write access" ON "public"."officers" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow admin write access" ON "public"."practices" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow auth users full access" ON "public"."officers" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated admins full control" ON "public"."announcements" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated delete" ON "public"."tournament_archives" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated insert" ON "public"."tournament_archives" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated update" ON "public"."tournament_archives" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated write access" ON "public"."tournament_archives" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow public read access" ON "public"."announcements" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."officers" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow public read access" ON "public"."practices" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow public read access" ON "public"."tournament_archives" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow public read practices" ON "public"."tournament_webpage" FOR SELECT USING (true);



ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."officers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."practices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tournament_archives" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tournament_webpage" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."announcements" TO "anon";
GRANT ALL ON TABLE "public"."announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."announcements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."announcements_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."announcements_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."announcements_id_seq" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."officers" TO "anon";
GRANT ALL ON TABLE "public"."officers" TO "authenticated";
GRANT ALL ON TABLE "public"."officers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."officers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."officers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."officers_id_seq" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."practices" TO "anon";
GRANT ALL ON TABLE "public"."practices" TO "authenticated";
GRANT ALL ON TABLE "public"."practices" TO "service_role";



GRANT ALL ON SEQUENCE "public"."practices_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."practices_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."practices_id_seq" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."tournament_archives" TO "anon";
GRANT ALL ON TABLE "public"."tournament_archives" TO "authenticated";
GRANT ALL ON TABLE "public"."tournament_archives" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."tournament_webpage" TO "anon";
GRANT ALL ON TABLE "public"."tournament_webpage" TO "authenticated";
GRANT ALL ON TABLE "public"."tournament_webpage" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "service_role";































