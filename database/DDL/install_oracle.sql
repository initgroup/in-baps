-- GENERATED FILE: scripts/build_oracle_installer.py produces install_oracle.sql.
-- Run the generated file in the intended schema using SQL Developer F5 / SQLcl @file.
-- Oracle 19c+. One session at a time. No DROP/TRUNCATE or application-row DML.
-- Existing compatible objects are retained; incompatible definitions STOP the script.
-- Connect as the owner. Do not use ALTER SESSION SET CURRENT_SCHEMA to another owner.
DECLARE
  c_version CONSTANT VARCHAR2(100) := 'V001__baseline.sql';
  c_checksum CONSTANT VARCHAR2(64) := '5c48572fea008ddce6ca89879bc41b711665eb672a9e62c47926675fd34c9243';
  v_count NUMBER;

  PROCEDURE fail(p_message VARCHAR2) IS
  BEGIN
    RAISE_APPLICATION_ERROR(-20001, 'IN-BAPS: ' || p_message);
  END;

  FUNCTION normalized(p_text VARCHAR2) RETURN VARCHAR2 IS
  BEGIN
    RETURN REGEXP_REPLACE(p_text, '[[:space:]"()]', '');
  END;

  FUNCTION constraint_columns(p_name VARCHAR2) RETURN VARCHAR2 IS
    v_columns VARCHAR2(4000);
  BEGIN
    SELECT LISTAGG(column_name, ',') WITHIN GROUP (ORDER BY position)
      INTO v_columns FROM user_cons_columns WHERE constraint_name = p_name;
    RETURN v_columns;
  END;

  PROCEDURE ensure_table(p_name VARCHAR2, p_sql VARCHAR2) IS
    n NUMBER;
  BEGIN
    SELECT COUNT(*) INTO n FROM user_tables WHERE table_name = p_name;
    IF n = 0 THEN
      EXECUTE IMMEDIATE p_sql;
      DBMS_OUTPUT.PUT_LINE('CREATE TABLE ' || p_name);
    ELSE
      DBMS_OUTPUT.PUT_LINE('KEEP TABLE ' || p_name);
    END IF;
  END;

  PROCEDURE assert_column(p_table VARCHAR2, p_column VARCHAR2, p_type VARCHAR2, p_chars NUMBER, p_nullable VARCHAR2 DEFAULT 'N') IS
    n NUMBER;
  BEGIN
    SELECT COUNT(*) INTO n FROM user_tab_columns
     WHERE table_name = p_table AND column_name = p_column
       AND data_type = p_type AND nullable = p_nullable
       AND (p_type <> 'VARCHAR2' OR (char_used = 'C' AND char_length >= p_chars))
       AND (p_type <> 'NUMBER' OR (data_precision IS NULL AND data_scale IS NULL));
    IF n <> 1 THEN
      fail('Incompatible/missing column ' || p_table || '.' || p_column || '. Review an ALT migration; existing data was not overwritten.');
    END IF;
  END;

  PROCEDURE assert_migration(p_version VARCHAR2, p_checksum VARCHAR2) IS
    n NUMBER;
    v_checksum VARCHAR2(64);
    v_status VARCHAR2(20);
  BEGIN
    EXECUTE IMMEDIATE 'SELECT COUNT(*) FROM INIT$_TB_BAPS_HISTORY WHERE VERSION = :version'
      INTO n USING p_version;
    IF n > 1 THEN fail('Duplicate migration history. Review schema history.'); END IF;
    IF n = 1 THEN
      EXECUTE IMMEDIATE 'SELECT CHECKSUM, STATUS FROM INIT$_TB_BAPS_HISTORY WHERE VERSION = :version'
        INTO v_checksum, v_status USING p_version;
      IF v_checksum <> p_checksum THEN fail('Migration checksum mismatch. No history was replaced.'); END IF;
      IF v_status NOT IN ('RUNNING','APPLIED') THEN fail('Unexpected migration status.'); END IF;
    END IF;
  END;

  PROCEDURE assert_history IS
    n NUMBER;
  BEGIN
    EXECUTE IMMEDIATE 'SELECT COUNT(*) FROM INIT$_TB_BAPS_HISTORY WHERE VERSION NOT IN (''V001__baseline.sql'',''V002__open_api_collection.sql'')'
      INTO n;
    IF n > 0 THEN fail('Unknown migrations exist. Use the matching newer checkout.'); END IF;
    assert_migration('V001__baseline.sql', '5c48572fea008ddce6ca89879bc41b711665eb672a9e62c47926675fd34c9243');
    assert_migration('V002__open_api_collection.sql', '2da88c560320219738e2c167b89a98210c1481fb69bcdf049de0bcb53d619349');
  END;

  PROCEDURE record_migration(p_version VARCHAR2, p_checksum VARCHAR2) IS
  BEGIN
    EXECUTE IMMEDIATE
      'MERGE INTO INIT$_TB_BAPS_HISTORY t USING (SELECT :version AS version, :checksum AS checksum FROM dual) s
         ON (t.VERSION = s.version)
       WHEN MATCHED THEN UPDATE SET t.STATUS = ''APPLIED'', t.APPLIED_AT = :updated_at WHERE t.STATUS = ''RUNNING''
       WHEN NOT MATCHED THEN INSERT (VERSION, CHECKSUM, APPLIED_AT, STATUS)
         VALUES (s.version, s.checksum, :created_at, ''APPLIED'')'
      USING p_version, p_checksum,
            TO_CHAR(SYS_EXTRACT_UTC(SYSTIMESTAMP), 'YYYY-MM-DD"T"HH24:MI:SS') || '+00:00',
            TO_CHAR(SYS_EXTRACT_UTC(SYSTIMESTAMP), 'YYYY-MM-DD"T"HH24:MI:SS') || '+00:00';
  END;

  PROCEDURE ensure_constraint(p_table VARCHAR2, p_name VARCHAR2, p_type VARCHAR2, p_columns VARCHAR2, p_rule VARCHAR2) IS
    v_existing VARCHAR2(128);
    v_sql VARCHAR2(4000);
    v_parent VARCHAR2(128);
    v_parent_columns VARCHAR2(4000);
    v_status VARCHAR2(20);
    v_validated VARCHAR2(20);
    n NUMBER;
  BEGIN
    -- Validate the actual columns as well as the declared constraint semantics.
    FOR r IN (SELECT constraint_name, constraint_type, search_condition_vc, r_owner,
                     r_constraint_name, delete_rule, status, validated, deferrable AS deferrable_state
                FROM user_constraints WHERE table_name = p_table AND constraint_type = p_type) LOOP
      IF (p_type IN ('P','U','R') AND constraint_columns(r.constraint_name) = p_columns)
         OR (p_type = 'C' AND r.constraint_name = p_name) THEN
        IF p_type = 'C' AND NVL(normalized(r.search_condition_vc), '?') <> normalized(p_rule) THEN
          fail('Check constraint differs: ' || p_name);
        END IF;
        IF p_type = 'R' THEN
          IF r.r_owner <> SYS_CONTEXT('USERENV','SESSION_USER') OR r.delete_rule <> 'NO ACTION' THEN
            fail('Foreign key owner/delete rule differs: ' || r.constraint_name);
          END IF;
          SELECT table_name INTO v_parent FROM user_constraints WHERE constraint_name = r.r_constraint_name;
          v_parent_columns := constraint_columns(r.r_constraint_name);
          IF v_parent || ':' || v_parent_columns <> p_rule THEN fail('Foreign key target differs: ' || r.constraint_name); END IF;
        END IF;
        IF r.deferrable_state <> 'NOT DEFERRABLE' THEN fail('Deferrable constraint differs: ' || r.constraint_name); END IF;
        v_existing := r.constraint_name;
        v_status := r.status;
        v_validated := r.validated;
        EXIT;
      END IF;
    END LOOP;
    IF v_existing IS NULL THEN
      SELECT COUNT(*) INTO n FROM user_constraints WHERE constraint_name = p_name;
      IF n > 0 THEN fail('Constraint name belongs to another definition: ' || p_name); END IF;
      v_sql := 'ALTER TABLE ' || p_table || ' ADD CONSTRAINT ' || p_name || ' ';
      IF p_type = 'P' THEN v_sql := v_sql || 'PRIMARY KEY (' || p_columns || ')';
      ELSIF p_type = 'U' THEN v_sql := v_sql || 'UNIQUE (' || p_columns || ')';
      ELSIF p_type = 'C' THEN v_sql := v_sql || 'CHECK (' || p_rule || ')';
      ELSIF p_type = 'R' THEN
        v_sql := v_sql || 'FOREIGN KEY (' || p_columns || ') REFERENCES ' ||
                 SUBSTR(p_rule, 1, INSTR(p_rule, ':')-1) || ' (' || SUBSTR(p_rule, INSTR(p_rule, ':')+1) || ')';
      ELSE fail('Unsupported constraint type');
      END IF;
      EXECUTE IMMEDIATE v_sql;
      DBMS_OUTPUT.PUT_LINE('CREATE CONSTRAINT ' || p_name);
    ELSIF v_status <> 'ENABLED' OR v_validated <> 'VALIDATED' THEN
      EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table || ' ENABLE VALIDATE CONSTRAINT ' || DBMS_ASSERT.ENQUOTE_NAME(v_existing, FALSE);
    END IF;
  END;

  PROCEDURE ensure_index(p_name VARCHAR2, p_table VARCHAR2, p_columns VARCHAR2, p_sql VARCHAR2) IS
    n NUMBER;
    v_columns VARCHAR2(4000);
  BEGIN
    SELECT COUNT(*) INTO n FROM user_indexes WHERE index_name = p_name;
    IF n = 0 THEN EXECUTE IMMEDIATE p_sql; END IF;
    SELECT COUNT(*) INTO n FROM user_indexes
     WHERE index_name = p_name AND table_name = p_table AND uniqueness = 'NONUNIQUE'
       AND index_type = 'NORMAL' AND status = 'VALID';
    SELECT LISTAGG(column_name, ',') WITHIN GROUP (ORDER BY column_position)
      INTO v_columns FROM user_ind_columns WHERE index_name = p_name;
    IF n <> 1 OR NVL(v_columns, '?') <> p_columns THEN fail('Index differs: ' || p_name); END IF;
    SELECT COUNT(*) INTO n FROM user_ind_columns WHERE index_name = p_name AND descend <> 'ASC';
    IF n <> 0 THEN fail('Index sort order differs: ' || p_name); END IF;
  END;

  PROCEDURE ensure_view(p_name VARCHAR2, p_sql VARCHAR2) IS
    n NUMBER;
  BEGIN
    EXECUTE IMMEDIATE p_sql;
    SELECT COUNT(*) INTO n FROM user_objects WHERE object_name = p_name AND object_type = 'VIEW' AND status = 'VALID';
    IF n <> 1 THEN fail('View compilation failed: ' || p_name); END IF;
  END;

  PROCEDURE ensure_program(p_name VARCHAR2, p_sql VARCHAR2) IS
    n NUMBER;
  BEGIN
    EXECUTE IMMEDIATE p_sql;
    SELECT COUNT(*) INTO n FROM user_objects WHERE object_name = p_name AND object_type = 'PROCEDURE' AND status = 'VALID';
    IF n <> 1 THEN fail('Procedure compilation failed: ' || p_name); END IF;
  END;
BEGIN
  IF SYS_CONTEXT('USERENV','CURRENT_SCHEMA') <> SYS_CONTEXT('USERENV','SESSION_USER') THEN
    fail('Connect directly as the intended schema owner. CURRENT_SCHEMA differs from SESSION_USER.');
  END IF;
  IF SYS_CONTEXT('USERENV','SESSION_USER') IN ('SYS','SYSTEM') THEN fail('Use an application schema, not SYS/SYSTEM.'); END IF;
  SELECT COUNT(*) INTO v_count FROM session_privs WHERE privilege IN ('CREATE TABLE','CREATE VIEW','CREATE PROCEDURE');
  IF v_count <> 3 THEN fail('CREATE TABLE, VIEW, PROCEDURE privileges and tablespace quota are required.'); END IF;
  SELECT COUNT(*) INTO v_count FROM session_privs WHERE privilege = 'UNLIMITED TABLESPACE';
  IF v_count = 0 THEN
    SELECT COUNT(*) INTO v_count FROM user_ts_quotas q JOIN user_users u ON q.tablespace_name = u.default_tablespace
     WHERE q.max_bytes = -1 OR q.max_bytes > q.bytes;
    IF v_count = 0 THEN fail('No writable quota on the default tablespace. Ask the DBA to grant a bounded quota before installation.'); END IF;
  END IF;
  ensure_table('INIT$_TB_BAPS_HISTORY', 'CREATE TABLE INIT$_TB_BAPS_HISTORY (
    VERSION VARCHAR2(100 CHAR) NOT NULL,
    CHECKSUM VARCHAR2(64 CHAR) NOT NULL,
    APPLIED_AT VARCHAR2(40 CHAR) NOT NULL,
    STATUS VARCHAR2(20 CHAR) NOT NULL,
    CONSTRAINT INIT$_PK_BAPS_HISTORY PRIMARY KEY (VERSION),
    CONSTRAINT INIT$_CK_BAPS_MIG_STATUS CHECK (STATUS IN (''RUNNING'',''APPLIED''))
)');
  assert_column('INIT$_TB_BAPS_HISTORY', 'VERSION', 'VARCHAR2', 100);
  assert_column('INIT$_TB_BAPS_HISTORY', 'CHECKSUM', 'VARCHAR2', 64);
  assert_column('INIT$_TB_BAPS_HISTORY', 'APPLIED_AT', 'VARCHAR2', 40);
  assert_column('INIT$_TB_BAPS_HISTORY', 'STATUS', 'VARCHAR2', 20);
  assert_history;
  ensure_constraint('INIT$_TB_BAPS_HISTORY', 'INIT$_PK_BAPS_HISTORY', 'P', 'VERSION', '');
  ensure_constraint('INIT$_TB_BAPS_HISTORY', 'INIT$_CK_BAPS_MIG_STATUS', 'C', '', 'STATUS IN (''RUNNING'',''APPLIED'')');
  ensure_table('INIT$_TB_BAPS_MEMBER', 'CREATE TABLE INIT$_TB_BAPS_MEMBER (
    ID VARCHAR2(32 CHAR) NOT NULL,
    USERNAME VARCHAR2(100 CHAR) NOT NULL,
    DISPLAY_NAME VARCHAR2(150 CHAR) NOT NULL,
    PASSWORD_HASH VARCHAR2(300 CHAR) NOT NULL,
    ROLE VARCHAR2(20 CHAR) NOT NULL,
    CREATED_AT VARCHAR2(40 CHAR) NOT NULL,
    CONSTRAINT INIT$_PK_BAPS_MEMBER PRIMARY KEY (ID),
    CONSTRAINT INIT$_UK_BAPS_USERNAME UNIQUE (USERNAME),
    CONSTRAINT INIT$_CK_BAPS_MEMBER_ROLE CHECK (ROLE IN (''admin'',''analyst''))
)');
  assert_column('INIT$_TB_BAPS_MEMBER', 'ID', 'VARCHAR2', 32);
  assert_column('INIT$_TB_BAPS_MEMBER', 'USERNAME', 'VARCHAR2', 100);
  assert_column('INIT$_TB_BAPS_MEMBER', 'DISPLAY_NAME', 'VARCHAR2', 150);
  assert_column('INIT$_TB_BAPS_MEMBER', 'PASSWORD_HASH', 'VARCHAR2', 300);
  assert_column('INIT$_TB_BAPS_MEMBER', 'ROLE', 'VARCHAR2', 20);
  assert_column('INIT$_TB_BAPS_MEMBER', 'CREATED_AT', 'VARCHAR2', 40);
  ensure_constraint('INIT$_TB_BAPS_MEMBER', 'INIT$_PK_BAPS_MEMBER', 'P', 'ID', '');
  ensure_constraint('INIT$_TB_BAPS_MEMBER', 'INIT$_UK_BAPS_USERNAME', 'U', 'USERNAME', '');
  ensure_constraint('INIT$_TB_BAPS_MEMBER', 'INIT$_CK_BAPS_MEMBER_ROLE', 'C', '', 'ROLE IN (''admin'',''analyst'')');
  ensure_table('INIT$_TB_BAPS_SESSION', 'CREATE TABLE INIT$_TB_BAPS_SESSION (
    TOKEN_HASH VARCHAR2(64 CHAR) NOT NULL,
    USER_ID VARCHAR2(32 CHAR) NOT NULL,
    CSRF_TOKEN VARCHAR2(100 CHAR) NOT NULL,
    EXPIRES_AT NUMBER NOT NULL,
    IDLE_EXPIRES_AT NUMBER NOT NULL,
    LAST_SEEN_AT NUMBER NOT NULL,
    CONSTRAINT INIT$_PK_BAPS_SESSION PRIMARY KEY (TOKEN_HASH),
    CONSTRAINT INIT$_FK_BAPS_SESSION_USER FOREIGN KEY (USER_ID) REFERENCES INIT$_TB_BAPS_MEMBER(ID)
)');
  assert_column('INIT$_TB_BAPS_SESSION', 'TOKEN_HASH', 'VARCHAR2', 64);
  assert_column('INIT$_TB_BAPS_SESSION', 'USER_ID', 'VARCHAR2', 32);
  assert_column('INIT$_TB_BAPS_SESSION', 'CSRF_TOKEN', 'VARCHAR2', 100);
  assert_column('INIT$_TB_BAPS_SESSION', 'EXPIRES_AT', 'NUMBER', 0);
  assert_column('INIT$_TB_BAPS_SESSION', 'IDLE_EXPIRES_AT', 'NUMBER', 0);
  assert_column('INIT$_TB_BAPS_SESSION', 'LAST_SEEN_AT', 'NUMBER', 0);
  ensure_constraint('INIT$_TB_BAPS_SESSION', 'INIT$_PK_BAPS_SESSION', 'P', 'TOKEN_HASH', '');
  ensure_constraint('INIT$_TB_BAPS_SESSION', 'INIT$_FK_BAPS_SESSION_USER', 'R', 'USER_ID', 'INIT$_TB_BAPS_MEMBER:ID');
  ensure_table('INIT$_TB_BAPS_RECORD', 'CREATE TABLE INIT$_TB_BAPS_RECORD (
    ID VARCHAR2(32 CHAR) NOT NULL,
    KIND VARCHAR2(30 CHAR) NOT NULL,
    OWNER_ID VARCHAR2(32 CHAR) NOT NULL,
    PAYLOAD CLOB NOT NULL,
    CREATED_AT VARCHAR2(40 CHAR) NOT NULL,
    CONSTRAINT INIT$_PK_BAPS_RECORD PRIMARY KEY (ID),
    CONSTRAINT INIT$_FK_BAPS_RECORD_OWNER FOREIGN KEY (OWNER_ID) REFERENCES INIT$_TB_BAPS_MEMBER(ID),
    CONSTRAINT INIT$_CK_BAPS_RECORD_JSON CHECK (PAYLOAD IS JSON),
    CONSTRAINT INIT$_CK_BAPS_RECORD_KIND CHECK (KIND IN (''dataset'',''analysis'',''visualization'',''dashboard''))
)');
  assert_column('INIT$_TB_BAPS_RECORD', 'ID', 'VARCHAR2', 32);
  assert_column('INIT$_TB_BAPS_RECORD', 'KIND', 'VARCHAR2', 30);
  assert_column('INIT$_TB_BAPS_RECORD', 'OWNER_ID', 'VARCHAR2', 32);
  assert_column('INIT$_TB_BAPS_RECORD', 'PAYLOAD', 'CLOB', 0);
  assert_column('INIT$_TB_BAPS_RECORD', 'CREATED_AT', 'VARCHAR2', 40);
  ensure_constraint('INIT$_TB_BAPS_RECORD', 'INIT$_PK_BAPS_RECORD', 'P', 'ID', '');
  ensure_constraint('INIT$_TB_BAPS_RECORD', 'INIT$_FK_BAPS_RECORD_OWNER', 'R', 'OWNER_ID', 'INIT$_TB_BAPS_MEMBER:ID');
  ensure_constraint('INIT$_TB_BAPS_RECORD', 'INIT$_CK_BAPS_RECORD_JSON', 'C', '', 'PAYLOAD IS JSON');
  ensure_constraint('INIT$_TB_BAPS_RECORD', 'INIT$_CK_BAPS_RECORD_KIND', 'C', '', 'KIND IN (''dataset'',''analysis'',''visualization'',''dashboard'')');
  ensure_table('INIT$_TB_BAPS_CONNECTION', 'CREATE TABLE INIT$_TB_BAPS_CONNECTION (
    ID VARCHAR2(32 CHAR) NOT NULL,
    OWNER_ID VARCHAR2(32 CHAR) NOT NULL,
    NAME VARCHAR2(150 CHAR) NOT NULL,
    CONFIG_JSON CLOB NOT NULL,
    CREATED_AT VARCHAR2(40 CHAR) NOT NULL,
    UPDATED_AT VARCHAR2(40 CHAR) NOT NULL,
    CONSTRAINT INIT$_PK_BAPS_CONNECTION PRIMARY KEY (ID),
    CONSTRAINT INIT$_FK_BAPS_CONN_OWNER FOREIGN KEY (OWNER_ID) REFERENCES INIT$_TB_BAPS_MEMBER(ID),
    CONSTRAINT INIT$_CK_BAPS_CONN_JSON CHECK (CONFIG_JSON IS JSON)
)');
  assert_column('INIT$_TB_BAPS_CONNECTION', 'ID', 'VARCHAR2', 32);
  assert_column('INIT$_TB_BAPS_CONNECTION', 'OWNER_ID', 'VARCHAR2', 32);
  assert_column('INIT$_TB_BAPS_CONNECTION', 'NAME', 'VARCHAR2', 150);
  assert_column('INIT$_TB_BAPS_CONNECTION', 'CONFIG_JSON', 'CLOB', 0);
  assert_column('INIT$_TB_BAPS_CONNECTION', 'CREATED_AT', 'VARCHAR2', 40);
  assert_column('INIT$_TB_BAPS_CONNECTION', 'UPDATED_AT', 'VARCHAR2', 40);
  ensure_constraint('INIT$_TB_BAPS_CONNECTION', 'INIT$_PK_BAPS_CONNECTION', 'P', 'ID', '');
  ensure_constraint('INIT$_TB_BAPS_CONNECTION', 'INIT$_FK_BAPS_CONN_OWNER', 'R', 'OWNER_ID', 'INIT$_TB_BAPS_MEMBER:ID');
  ensure_constraint('INIT$_TB_BAPS_CONNECTION', 'INIT$_CK_BAPS_CONN_JSON', 'C', '', 'CONFIG_JSON IS JSON');
  ensure_table('INIT$_TB_BAPS_API_SOURCE', 'CREATE TABLE INIT$_TB_BAPS_API_SOURCE (
    ID VARCHAR2(32 CHAR) NOT NULL,
    OWNER_ID VARCHAR2(32 CHAR) NOT NULL,
    NAME VARCHAR2(150 CHAR) NOT NULL,
    CONFIG_JSON CLOB NOT NULL,
    LOCK_TOKEN VARCHAR2(64 CHAR),
    LOCK_UNTIL NUMBER DEFAULT 0 NOT NULL,
    CREATED_AT VARCHAR2(40 CHAR) NOT NULL,
    UPDATED_AT VARCHAR2(40 CHAR) NOT NULL,
    CONSTRAINT INIT$_PK_BAPS_API_SOURCE PRIMARY KEY (ID),
    CONSTRAINT INIT$_FK_BAPS_API_SRC_OWNER FOREIGN KEY (OWNER_ID) REFERENCES INIT$_TB_BAPS_MEMBER(ID),
    CONSTRAINT INIT$_CK_BAPS_API_SRC_JSON CHECK (CONFIG_JSON IS JSON)
)');
  assert_column('INIT$_TB_BAPS_API_SOURCE', 'ID', 'VARCHAR2', 32);
  assert_column('INIT$_TB_BAPS_API_SOURCE', 'OWNER_ID', 'VARCHAR2', 32);
  assert_column('INIT$_TB_BAPS_API_SOURCE', 'NAME', 'VARCHAR2', 150);
  assert_column('INIT$_TB_BAPS_API_SOURCE', 'CONFIG_JSON', 'CLOB', 0);
  assert_column('INIT$_TB_BAPS_API_SOURCE', 'LOCK_TOKEN', 'VARCHAR2', 64, 'Y');
  assert_column('INIT$_TB_BAPS_API_SOURCE', 'LOCK_UNTIL', 'NUMBER', 0);
  assert_column('INIT$_TB_BAPS_API_SOURCE', 'CREATED_AT', 'VARCHAR2', 40);
  assert_column('INIT$_TB_BAPS_API_SOURCE', 'UPDATED_AT', 'VARCHAR2', 40);
  ensure_constraint('INIT$_TB_BAPS_API_SOURCE', 'INIT$_PK_BAPS_API_SOURCE', 'P', 'ID', '');
  ensure_constraint('INIT$_TB_BAPS_API_SOURCE', 'INIT$_FK_BAPS_API_SRC_OWNER', 'R', 'OWNER_ID', 'INIT$_TB_BAPS_MEMBER:ID');
  ensure_constraint('INIT$_TB_BAPS_API_SOURCE', 'INIT$_CK_BAPS_API_SRC_JSON', 'C', '', 'CONFIG_JSON IS JSON');
  ensure_table('INIT$_TB_BAPS_API_JOB', 'CREATE TABLE INIT$_TB_BAPS_API_JOB (
    ID VARCHAR2(32 CHAR) NOT NULL,
    OWNER_ID VARCHAR2(32 CHAR) NOT NULL,
    SOURCE_ID VARCHAR2(32 CHAR) NOT NULL,
    NAME VARCHAR2(150 CHAR) NOT NULL,
    INTERVAL_SECONDS NUMBER NOT NULL,
    NEXT_RUN_AT NUMBER NOT NULL,
    ENABLED NUMBER NOT NULL,
    CREATED_AT VARCHAR2(40 CHAR) NOT NULL,
    UPDATED_AT VARCHAR2(40 CHAR) NOT NULL,
    CONSTRAINT INIT$_PK_BAPS_API_JOB PRIMARY KEY (ID),
    CONSTRAINT INIT$_FK_BAPS_API_JOB_OWNER FOREIGN KEY (OWNER_ID) REFERENCES INIT$_TB_BAPS_MEMBER(ID),
    CONSTRAINT INIT$_FK_BAPS_API_JOB_SRC FOREIGN KEY (SOURCE_ID) REFERENCES INIT$_TB_BAPS_API_SOURCE(ID),
    CONSTRAINT INIT$_UK_BAPS_API_JOB_SRC UNIQUE (OWNER_ID,SOURCE_ID),
    CONSTRAINT INIT$_CK_BAPS_API_JOB_ON CHECK (ENABLED IN (0,1)),
    CONSTRAINT INIT$_CK_BAPS_API_JOB_INT CHECK (INTERVAL_SECONDS >= 300 AND INTERVAL_SECONDS <= 604800)
)');
  assert_column('INIT$_TB_BAPS_API_JOB', 'ID', 'VARCHAR2', 32);
  assert_column('INIT$_TB_BAPS_API_JOB', 'OWNER_ID', 'VARCHAR2', 32);
  assert_column('INIT$_TB_BAPS_API_JOB', 'SOURCE_ID', 'VARCHAR2', 32);
  assert_column('INIT$_TB_BAPS_API_JOB', 'NAME', 'VARCHAR2', 150);
  assert_column('INIT$_TB_BAPS_API_JOB', 'INTERVAL_SECONDS', 'NUMBER', 0);
  assert_column('INIT$_TB_BAPS_API_JOB', 'NEXT_RUN_AT', 'NUMBER', 0);
  assert_column('INIT$_TB_BAPS_API_JOB', 'ENABLED', 'NUMBER', 0);
  assert_column('INIT$_TB_BAPS_API_JOB', 'CREATED_AT', 'VARCHAR2', 40);
  assert_column('INIT$_TB_BAPS_API_JOB', 'UPDATED_AT', 'VARCHAR2', 40);
  ensure_constraint('INIT$_TB_BAPS_API_JOB', 'INIT$_PK_BAPS_API_JOB', 'P', 'ID', '');
  ensure_constraint('INIT$_TB_BAPS_API_JOB', 'INIT$_FK_BAPS_API_JOB_OWNER', 'R', 'OWNER_ID', 'INIT$_TB_BAPS_MEMBER:ID');
  ensure_constraint('INIT$_TB_BAPS_API_JOB', 'INIT$_FK_BAPS_API_JOB_SRC', 'R', 'SOURCE_ID', 'INIT$_TB_BAPS_API_SOURCE:ID');
  ensure_constraint('INIT$_TB_BAPS_API_JOB', 'INIT$_UK_BAPS_API_JOB_SRC', 'U', 'OWNER_ID,SOURCE_ID', '');
  ensure_constraint('INIT$_TB_BAPS_API_JOB', 'INIT$_CK_BAPS_API_JOB_ON', 'C', '', 'ENABLED IN (0,1)');
  ensure_constraint('INIT$_TB_BAPS_API_JOB', 'INIT$_CK_BAPS_API_JOB_INT', 'C', '', 'INTERVAL_SECONDS >= 300 AND INTERVAL_SECONDS <= 604800');
  ensure_table('INIT$_TB_BAPS_API_RUN', 'CREATE TABLE INIT$_TB_BAPS_API_RUN (
    ID VARCHAR2(32 CHAR) NOT NULL,
    OWNER_ID VARCHAR2(32 CHAR) NOT NULL,
    SOURCE_ID VARCHAR2(32 CHAR) NOT NULL,
    JOB_ID VARCHAR2(32 CHAR),
    STARTED_AT NUMBER NOT NULL,
    FINISHED_AT NUMBER,
    STATUS VARCHAR2(30 CHAR) NOT NULL,
    RESULT_JSON CLOB NOT NULL,
    CONSTRAINT INIT$_PK_BAPS_API_RUN PRIMARY KEY (ID),
    CONSTRAINT INIT$_FK_BAPS_API_RUN_OWNER FOREIGN KEY (OWNER_ID) REFERENCES INIT$_TB_BAPS_MEMBER(ID),
    CONSTRAINT INIT$_FK_BAPS_API_RUN_SRC FOREIGN KEY (SOURCE_ID) REFERENCES INIT$_TB_BAPS_API_SOURCE(ID),
    CONSTRAINT INIT$_CK_BAPS_API_RUN_JSON CHECK (RESULT_JSON IS JSON)
)');
  assert_column('INIT$_TB_BAPS_API_RUN', 'ID', 'VARCHAR2', 32);
  assert_column('INIT$_TB_BAPS_API_RUN', 'OWNER_ID', 'VARCHAR2', 32);
  assert_column('INIT$_TB_BAPS_API_RUN', 'SOURCE_ID', 'VARCHAR2', 32);
  assert_column('INIT$_TB_BAPS_API_RUN', 'JOB_ID', 'VARCHAR2', 32, 'Y');
  assert_column('INIT$_TB_BAPS_API_RUN', 'STARTED_AT', 'NUMBER', 0);
  assert_column('INIT$_TB_BAPS_API_RUN', 'FINISHED_AT', 'NUMBER', 0, 'Y');
  assert_column('INIT$_TB_BAPS_API_RUN', 'STATUS', 'VARCHAR2', 30);
  assert_column('INIT$_TB_BAPS_API_RUN', 'RESULT_JSON', 'CLOB', 0);
  ensure_constraint('INIT$_TB_BAPS_API_RUN', 'INIT$_PK_BAPS_API_RUN', 'P', 'ID', '');
  ensure_constraint('INIT$_TB_BAPS_API_RUN', 'INIT$_FK_BAPS_API_RUN_OWNER', 'R', 'OWNER_ID', 'INIT$_TB_BAPS_MEMBER:ID');
  ensure_constraint('INIT$_TB_BAPS_API_RUN', 'INIT$_FK_BAPS_API_RUN_SRC', 'R', 'SOURCE_ID', 'INIT$_TB_BAPS_API_SOURCE:ID');
  ensure_constraint('INIT$_TB_BAPS_API_RUN', 'INIT$_CK_BAPS_API_RUN_JSON', 'C', '', 'RESULT_JSON IS JSON');
  ensure_index('INIT$_IX_BAPS_SESSION_EXP', 'INIT$_TB_BAPS_SESSION', 'EXPIRES_AT', 'CREATE INDEX INIT$_IX_BAPS_SESSION_EXP ON INIT$_TB_BAPS_SESSION(EXPIRES_AT)');
  ensure_index('INIT$_IX_BAPS_RECORD_OWNER', 'INIT$_TB_BAPS_RECORD', 'OWNER_ID,KIND', 'CREATE INDEX INIT$_IX_BAPS_RECORD_OWNER ON INIT$_TB_BAPS_RECORD(OWNER_ID,KIND)');
  ensure_index('INIT$_IX_BAPS_CONN_OWNER', 'INIT$_TB_BAPS_CONNECTION', 'OWNER_ID', 'CREATE INDEX INIT$_IX_BAPS_CONN_OWNER ON INIT$_TB_BAPS_CONNECTION(OWNER_ID)');
  ensure_index('INIT$_IX_BAPS_API_SRC_OWNER', 'INIT$_TB_BAPS_API_SOURCE', 'OWNER_ID', 'CREATE INDEX INIT$_IX_BAPS_API_SRC_OWNER ON INIT$_TB_BAPS_API_SOURCE(OWNER_ID)');
  ensure_index('INIT$_IX_BAPS_API_JOB_DUE', 'INIT$_TB_BAPS_API_JOB', 'ENABLED,NEXT_RUN_AT', 'CREATE INDEX INIT$_IX_BAPS_API_JOB_DUE ON INIT$_TB_BAPS_API_JOB(ENABLED,NEXT_RUN_AT)');
  ensure_index('INIT$_IX_BAPS_API_RUN_OWNER', 'INIT$_TB_BAPS_API_RUN', 'OWNER_ID,STARTED_AT', 'CREATE INDEX INIT$_IX_BAPS_API_RUN_OWNER ON INIT$_TB_BAPS_API_RUN(OWNER_ID,STARTED_AT)');
  ensure_index('INIT$_IX_BAPS_API_RUN_SRC', 'INIT$_TB_BAPS_API_RUN', 'SOURCE_ID,STATUS', 'CREATE INDEX INIT$_IX_BAPS_API_RUN_SRC ON INIT$_TB_BAPS_API_RUN(SOURCE_ID,STATUS)');
  ensure_view('INIT$_VW_BAPS_CATALOG', 'CREATE OR REPLACE VIEW INIT$_VW_BAPS_CATALOG AS
SELECT ID, OWNER_ID,
       JSON_VALUE(PAYLOAD, ''$.name'' RETURNING VARCHAR2(150)) AS DATASET_NAME,
       JSON_VALUE(PAYLOAD, ''$.row_count'' RETURNING NUMBER) AS ROW_COUNT,
       JSON_VALUE(PAYLOAD, ''$.module'' RETURNING VARCHAR2(20)) AS MODULE_CODE,
       CREATED_AT
  FROM INIT$_TB_BAPS_RECORD WHERE KIND = ''dataset''');
  ensure_program('INIT$_SP_BAPS_SESSION_PURGE', 'CREATE OR REPLACE PROCEDURE INIT$_SP_BAPS_SESSION_PURGE (P_NOW IN NUMBER) AUTHID DEFINER AS
BEGIN
  IF P_NOW IS NULL OR P_NOW < 0 THEN
    RAISE_APPLICATION_ERROR(-20010, ''A valid epoch time is required'');
  END IF;
  DELETE FROM INIT$_TB_BAPS_SESSION WHERE EXPIRES_AT <= P_NOW OR IDLE_EXPIRES_AT <= P_NOW;
END;');
  EXECUTE IMMEDIATE 'COMMENT ON TABLE INIT$_TB_BAPS_RECORD IS ''IN-BAPS owned dataset definitions, analysis results and visualizations''';
  -- Adopt verified manual versions or complete compatible interrupted creation.
  -- Never modify application rows. Existing APPLIED history keeps its timestamp.
  record_migration('V001__baseline.sql', '5c48572fea008ddce6ca89879bc41b711665eb672a9e62c47926675fd34c9243');
  record_migration('V002__open_api_collection.sql', '2da88c560320219738e2c167b89a98210c1481fb69bcdf049de0bcb53d619349');
  COMMIT;
  DBMS_OUTPUT.PUT_LINE('IN-BAPS Oracle installation verified. Re-running this file preserves application data.');
END;
/
