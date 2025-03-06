BEGIN;

DO $$
DECLARE
    target_tables text[] := ARRAY[
        'accounts_accesstoken', 'accounts_refreshtoken', 'alert_adddropperiod',
        'alert_pcademanddistributionestimate', 'alert_registration',
        'alert_v2_notification_history', 'alert_v2_registration', 'auth_group',
        'auth_group_permissions', 'auth_permission', 'auth_user', 'auth_user_groups',
        'auth_user_user_permissions', 'courses_apikey', 'courses_apikey_privileges',
        'courses_apiprivilege', 'courses_attribute', 'courses_attribute_courses',
        'courses_building', 'courses_comment', 'courses_comment_downvotes',
        'courses_comment_upvotes', 'courses_course', 'courses_department',
        'courses_friendship', 'courses_instructor', 'courses_meeting',
        'courses_ngssrestriction', 'courses_prengssrequirement',
        'courses_prengssrequirement_courses', 'courses_prengssrequirement_departments',
        'courses_prengssrequirement_overrides', 'courses_prengssrestriction',
        'courses_room', 'courses_section', 'courses_section_associated_sections',
        'courses_section_instructors', 'courses_section_ngss_restrictions',
        'courses_section_pre_ngss_restrictions', 'courses_statusupdate',
        'courses_topic', 'courses_userprofile', 'degree_degree', 'degree_degree_rules',
        'degree_degreeplan', 'degree_degreeplan_degrees', 'degree_dockedcourse',
        'degree_doublecountrestriction', 'degree_fulfillment',
        'degree_fulfillment_rules', 'degree_pdpbetauser', 'degree_rule',
        'degree_satisfactionstatus', 'django_admin_log',
        'django_celery_beat_clockedschedule', 'django_celery_beat_crontabschedule',
        'django_celery_beat_intervalschedule', 'django_celery_beat_periodictask',
        'django_celery_beat_periodictasks', 'django_celery_beat_solarschedule',
        'django_celery_results_taskresult', 'django_content_type',
        'django_migrations', 'django_session', 'options_option',
        'plan_primaryschedule', 'plan_schedule', 'plan_schedule_sections',
        'review_review', 'review_reviewbit', 'shortener_url'
    ];
    r RECORD;
    current_table text;
BEGIN
    -- Drop constraints
    FOR r IN (SELECT DISTINCT tc.table_schema, tc.constraint_name, tc.table_name, tc.constraint_type
              FROM information_schema.table_constraints tc
              WHERE tc.table_schema = 'public'
              AND tc.table_name = ANY(target_tables)
              AND tc.constraint_type != 'CHECK')
    LOOP
        EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I CASCADE',
            r.table_schema, r.table_name, r.constraint_name);
    END LOOP;

    -- Drop indexes
    FOR r IN (SELECT schemaname, tablename, indexname 
              FROM pg_indexes 
              WHERE schemaname = 'public'
              AND tablename = ANY(target_tables))
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I.%I CASCADE',
            r.schemaname, r.indexname);
    END LOOP;

    -- Truncate tables
    FOREACH current_table IN ARRAY target_tables
    LOOP
        IF EXISTS (SELECT FROM information_schema.tables 
                  WHERE table_schema = 'public' 
                  AND table_name = current_table) THEN
            EXECUTE format('TRUNCATE TABLE public.%I CASCADE', current_table);
        END IF;
    END LOOP;

    -- Reset sequences
    FOR r IN 
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    LOOP
        EXECUTE format('ALTER SEQUENCE public.%I RESTART WITH 1', r.sequence_name);
    END LOOP;
END $$;

COMMIT;