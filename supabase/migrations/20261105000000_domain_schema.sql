--
-- PostgreSQL database dump
--


-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: action_item_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.action_item_status AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'BLOCKED',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: board_kind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.board_kind AS ENUM (
    'SCRUM',
    'KANBAN'
);


--
-- Name: change_request_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.change_request_status AS ENUM (
    'PROPOSED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'IMPLEMENTED'
);


--
-- Name: decision_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.decision_status AS ENUM (
    'PROPOSED',
    'ACCEPTED',
    'SUPERSEDED',
    'REJECTED'
);


--
-- Name: document_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_status AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


--
-- Name: feedback_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.feedback_category AS ENUM (
    'WENT_WELL',
    'IMPROVE',
    'START',
    'STOP',
    'CONTINUE',
    'CUSTOM'
);


--
-- Name: goal_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.goal_status AS ENUM (
    'NOT_STARTED',
    'AT_RISK',
    'ON_TRACK',
    'ACHIEVED',
    'CANCELLED'
);


--
-- Name: health_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.health_status AS ENUM (
    'ON_TRACK',
    'AT_RISK',
    'BLOCKED'
);


--
-- Name: influence_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.influence_level AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);


--
-- Name: integration_provider; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.integration_provider AS ENUM (
    'GITHUB',
    'GITLAB',
    'CALENDAR',
    'SLACK',
    'TEAMS',
    'CUSTOM'
);


--
-- Name: integration_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.integration_status AS ENUM (
    'ACTIVE',
    'PAUSED',
    'REVOKED'
);


--
-- Name: interest_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.interest_level AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);


--
-- Name: invitation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.invitation_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REVOKED',
    'EXPIRED'
);


--
-- Name: issue_dependency_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.issue_dependency_type AS ENUM (
    'BLOCKS',
    'RELATES_TO',
    'DUPLICATES'
);


--
-- Name: issue_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.issue_type AS ENUM (
    'EPIC',
    'STORY',
    'TASK',
    'BUG',
    'SUBTASK'
);


--
-- Name: meeting_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.meeting_status AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: meeting_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.meeting_type AS ENUM (
    'PLANNING',
    'DAILY_STANDUP',
    'REVIEW',
    'RETROSPECTIVE',
    'REFINEMENT',
    'GENERAL'
);


--
-- Name: membership_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.membership_status AS ENUM (
    'ACTIVE',
    'INVITED',
    'SUSPENDED'
);


--
-- Name: milestone_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.milestone_status AS ENUM (
    'PLANNED',
    'IN_PROGRESS',
    'COMPLETED',
    'MISSED'
);


--
-- Name: minutes_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.minutes_status AS ENUM (
    'DRAFT',
    'FINALIZED',
    'AMENDED'
);


--
-- Name: portal_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.portal_status AS ENUM (
    'PUBLISHED',
    'WITHDRAWN'
);


--
-- Name: priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.priority AS ENUM (
    'LOWEST',
    'LOW',
    'MEDIUM',
    'HIGH',
    'HIGHEST'
);


--
-- Name: project_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_role AS ENUM (
    'SCRUM_MASTER',
    'PRODUCT_OWNER',
    'DEVELOPER',
    'VIEWER',
    'CLIENT'
);


--
-- Name: project_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_status AS ENUM (
    'PLANNED',
    'ACTIVE',
    'ON_HOLD',
    'COMPLETED',
    'ARCHIVED'
);


--
-- Name: project_template; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_template AS ENUM (
    'SCRUM',
    'KANBAN',
    'CUSTOM'
);


--
-- Name: requirement_kind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.requirement_kind AS ENUM (
    'FUNCTIONAL',
    'NON_FUNCTIONAL'
);


--
-- Name: requirement_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.requirement_status AS ENUM (
    'PROPOSED',
    'APPROVED',
    'IMPLEMENTED',
    'VERIFIED',
    'REJECTED'
);


--
-- Name: retrospective_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.retrospective_status AS ENUM (
    'OPEN',
    'CLOSED'
);


--
-- Name: retrospective_template; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.retrospective_template AS ENUM (
    'WENT_WELL_IMPROVE_ACTIONS',
    'START_STOP_CONTINUE',
    'CUSTOM'
);


--
-- Name: risk_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.risk_status AS ENUM (
    'IDENTIFIED',
    'MITIGATING',
    'ACCEPTED',
    'CLOSED'
);


--
-- Name: scope_change_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.scope_change_type AS ENUM (
    'ADDED',
    'REMOVED',
    'COMPLETED',
    'REOPENED'
);


--
-- Name: sprint_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sprint_status AS ENUM (
    'PLANNED',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: status_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status_category AS ENUM (
    'BACKLOG',
    'ACTIVE',
    'DONE'
);


--
-- Name: webhook_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.webhook_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'SUCCEEDED',
    'FAILED'
);


--
-- Name: workspace_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.workspace_role AS ENUM (
    'OWNER',
    'ADMIN',
    'MEMBER',
    'VIEWER'
);


--
-- Name: workspace_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.workspace_status AS ENUM (
    'ACTIVE',
    'ARCHIVED'
);


--
-- Name: require_workspace_owner_membership(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.require_workspace_owner_membership() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  target_workspace_id uuid;
  owner_user_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'workspace' THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    target_workspace_id := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    target_workspace_id := OLD.workspace_id;
  ELSE
    target_workspace_id := NEW.workspace_id;
  END IF;

  SELECT owner_id INTO owner_user_id
  FROM public.workspace
  WHERE id = target_workspace_id;

  IF owner_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.workspace_member
    WHERE workspace_id = target_workspace_id
      AND user_id = owner_user_id
      AND role = 'OWNER'
      AND status = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'workspace must have exactly one active owner membership';
  END IF;

  RETURN NULL;
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


--
-- Name: uuid_generate_v7(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uuid_generate_v7() RETURNS uuid
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  ts_hex text := lpad(to_hex(floor(extract(epoch from clock_timestamp()) * 1000)::bigint), 12, '0');
  r text := replace(gen_random_uuid()::text, '-', '');
  variant text := substr('89ab', 1 + floor(random() * 4)::int, 1);
BEGIN
  RETURN (substr(ts_hex, 1, 8) || '-' || substr(ts_hex, 9, 4) || '-7' || substr(r, 1, 3) || '-'
          || variant || substr(r, 5, 3) || '-' || substr(r, 8, 12))::uuid;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: action_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_item (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    source_meeting_id uuid,
    source_minutes_id uuid,
    source_decision_id uuid,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    status public.action_item_status DEFAULT 'OPEN'::public.action_item_status NOT NULL,
    assignee_id uuid,
    due_at timestamp with time zone,
    completed_at timestamp with time zone,
    linked_issue_id uuid,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL,
    revision integer DEFAULT 1 NOT NULL
);


--
-- Name: activity_event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_event (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    action text NOT NULL,
    actor_id uuid NOT NULL,
    changes jsonb NOT NULL,
    occurred_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_event (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid,
    actor_id uuid NOT NULL,
    action text NOT NULL,
    entity_path text NOT NULL,
    request_id text NOT NULL,
    metadata jsonb NOT NULL,
    occurred_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: board_column; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.board_column (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    board_config_id uuid NOT NULL,
    workflow_status_id uuid,
    legacy_id text,
    name text NOT NULL,
    rank text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL
);


--
-- Name: board_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.board_config (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    name text NOT NULL,
    kind public.board_kind NOT NULL,
    filter jsonb NOT NULL,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL,
    revision integer DEFAULT 1 NOT NULL
);


--
-- Name: change_request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.change_request (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    status public.change_request_status DEFAULT 'PROPOSED'::public.change_request_status NOT NULL,
    requester_id uuid NOT NULL,
    approver_id uuid,
    decision_at timestamp with time zone,
    linked_issue_ids text[],
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: client_portal_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_portal_item (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    source_collection text NOT NULL,
    source_id text NOT NULL,
    title text NOT NULL,
    summary text NOT NULL,
    content jsonb NOT NULL,
    status public.portal_status DEFAULT 'PUBLISHED'::public.portal_status NOT NULL,
    published_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    published_by uuid NOT NULL,
    source_updated_at timestamp with time zone NOT NULL
);


--
-- Name: decision; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decision (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    meeting_id uuid,
    minutes_id uuid,
    title text NOT NULL,
    context text NOT NULL,
    rationale text NOT NULL,
    status public.decision_status DEFAULT 'PROPOSED'::public.decision_status NOT NULL,
    approver_ids text[],
    decided_at timestamp with time zone,
    supersedes_id uuid,
    linked_record_ids text[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL,
    revision integer DEFAULT 1 NOT NULL
);


--
-- Name: document_folder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_folder (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    name text NOT NULL,
    parent_folder_id uuid,
    rank text NOT NULL,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: document_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_version (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    document_id uuid NOT NULL,
    version integer NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL
);


--
-- Name: integration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integration (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    provider public.integration_provider NOT NULL,
    status public.integration_status DEFAULT 'ACTIVE'::public.integration_status NOT NULL,
    external_id text NOT NULL,
    settings jsonb NOT NULL,
    secret_ref text,
    connected_by uuid NOT NULL,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: issue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.issue (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    key text NOT NULL,
    number integer NOT NULL,
    type public.issue_type NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    acceptance_criteria text[],
    priority public.priority DEFAULT 'MEDIUM'::public.priority NOT NULL,
    rank text NOT NULL,
    assignee_id uuid,
    reporter_id uuid NOT NULL,
    parent_id uuid,
    epic_id uuid,
    sprint_id uuid,
    estimate double precision,
    labels text[],
    due_at timestamp with time zone,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL,
    workflow_status_id uuid NOT NULL,
    revision integer DEFAULT 1 NOT NULL
);


--
-- Name: issue_comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.issue_comment (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    issue_id uuid NOT NULL,
    author_id uuid NOT NULL,
    body text NOT NULL,
    edited_at timestamp with time zone,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: issue_dependency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.issue_dependency (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    blocking_issue_id uuid NOT NULL,
    blocked_issue_id uuid NOT NULL,
    type public.issue_dependency_type NOT NULL,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: meeting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    sprint_id uuid,
    title text NOT NULL,
    type public.meeting_type NOT NULL,
    status public.meeting_status DEFAULT 'SCHEDULED'::public.meeting_status NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    organizer_id uuid NOT NULL,
    facilitator_id uuid,
    minute_taker_id uuid,
    participant_ids text[],
    location text DEFAULT ''::text NOT NULL,
    meeting_url text,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL,
    revision integer DEFAULT 1 NOT NULL
);


--
-- Name: meeting_agenda_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_agenda_item (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    meeting_id uuid NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    rank text NOT NULL,
    presenter_id text,
    duration_minutes integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: meeting_minutes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_minutes (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    meeting_id uuid NOT NULL,
    status public.minutes_status DEFAULT 'DRAFT'::public.minutes_status NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    summary text NOT NULL,
    attendance jsonb NOT NULL,
    finalized_at timestamp with time zone,
    finalized_by text,
    supersedes_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL,
    revision integer DEFAULT 1 NOT NULL
);


--
-- Name: meeting_minutes_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_minutes_version (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    minutes_id uuid NOT NULL,
    version integer NOT NULL,
    snapshot jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL
);


--
-- Name: milestone; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.milestone (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    status public.milestone_status DEFAULT 'PLANNED'::public.milestone_status NOT NULL,
    due_at timestamp with time zone,
    completed_at timestamp with time zone,
    issue_ids text[],
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    target_path text,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    display_name text DEFAULT ''::text NOT NULL,
    photo_url text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    onboarded_at timestamp with time zone,
    age_confirmed_at timestamp with time zone
);


--
-- Name: project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    name text NOT NULL,
    key text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    objective text DEFAULT ''::text NOT NULL,
    template public.project_template DEFAULT 'SCRUM'::public.project_template NOT NULL,
    status public.project_status DEFAULT 'ACTIVE'::public.project_status NOT NULL,
    lead_id uuid NOT NULL,
    next_issue_number integer DEFAULT 1 NOT NULL,
    timezone text DEFAULT 'UTC'::text NOT NULL,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: project_document; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_document (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    folder_id uuid,
    title text NOT NULL,
    body text NOT NULL,
    status public.document_status DEFAULT 'DRAFT'::public.document_status NOT NULL,
    current_version integer DEFAULT 1 NOT NULL,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL,
    revision integer DEFAULT 1 NOT NULL
);


--
-- Name: project_goal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_goal (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    status public.goal_status DEFAULT 'NOT_STARTED'::public.goal_status NOT NULL,
    target_at timestamp with time zone,
    owner_id uuid,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: project_key_reservation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_key_reservation (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    key text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL
);


--
-- Name: project_membership; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_membership (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    roles public.project_role[],
    status public.membership_status DEFAULT 'ACTIVE'::public.membership_status NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: project_status_update; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_status_update (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    status public.health_status NOT NULL,
    summary text NOT NULL,
    accomplishments text[],
    risks text[],
    author_id uuid NOT NULL,
    reported_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: requirement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requirement (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    key text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    kind public.requirement_kind NOT NULL,
    status public.requirement_status DEFAULT 'PROPOSED'::public.requirement_status NOT NULL,
    priority public.priority DEFAULT 'MEDIUM'::public.priority NOT NULL,
    linked_issue_ids text[],
    source_document_id uuid,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: retrospective; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.retrospective (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    sprint_id uuid NOT NULL,
    meeting_id uuid,
    template public.retrospective_template DEFAULT 'WENT_WELL_IMPROVE_ACTIONS'::public.retrospective_template NOT NULL,
    status public.retrospective_status DEFAULT 'OPEN'::public.retrospective_status NOT NULL,
    facilitator_id uuid NOT NULL,
    closed_at timestamp with time zone,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: retrospective_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.retrospective_feedback (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    retrospective_id uuid NOT NULL,
    author_id uuid,
    category public.feedback_category NOT NULL,
    body text NOT NULL,
    anonymous boolean DEFAULT false NOT NULL,
    vote_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: risk; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.risk (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    status public.risk_status DEFAULT 'IDENTIFIED'::public.risk_status NOT NULL,
    probability integer NOT NULL,
    impact integer NOT NULL,
    owner_id uuid,
    mitigation_plan text DEFAULT ''::text NOT NULL,
    review_at timestamp with time zone,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: saved_filter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_filter (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid,
    owner_id uuid NOT NULL,
    name text NOT NULL,
    query jsonb NOT NULL,
    shared boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: sprint; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sprint (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    name text NOT NULL,
    goal text DEFAULT ''::text NOT NULL,
    status public.sprint_status DEFAULT 'PLANNED'::public.sprint_status NOT NULL,
    start_at timestamp with time zone,
    end_at timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    committed_at timestamp with time zone,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL,
    revision integer DEFAULT 1 NOT NULL
);


--
-- Name: sprint_scope_change; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sprint_scope_change (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    sprint_id uuid NOT NULL,
    issue_id uuid NOT NULL,
    change public.scope_change_type NOT NULL,
    actor_id text NOT NULL,
    occurred_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sprint_snapshot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sprint_snapshot (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    sprint_id uuid NOT NULL,
    goal text NOT NULL,
    issue_ids text[],
    completed_issue_ids text[],
    story_points_committed double precision NOT NULL,
    story_points_completed double precision NOT NULL,
    snapshot_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: stakeholder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stakeholder (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    name text NOT NULL,
    email text,
    organisation text NOT NULL,
    role text NOT NULL,
    influence public.influence_level DEFAULT 'MEDIUM'::public.influence_level NOT NULL,
    interest public.interest_level DEFAULT 'MEDIUM'::public.interest_level NOT NULL,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: storage_object; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.storage_object (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid,
    bucket text NOT NULL,
    key text NOT NULL,
    file_name text NOT NULL,
    content_type text NOT NULL,
    size_bytes bigint NOT NULL,
    etag text,
    uploader_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    archived_at timestamp with time zone
);


--
-- Name: webhook_delivery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhook_delivery (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    integration_id uuid NOT NULL,
    idempotency_key text NOT NULL,
    event_type text NOT NULL,
    status public.webhook_status DEFAULT 'PENDING'::public.webhook_status NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    received_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at timestamp with time zone
);


--
-- Name: workflow_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_status (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    name text NOT NULL,
    category public.status_category NOT NULL,
    rank text NOT NULL,
    color text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL,
    revision integer DEFAULT 1 NOT NULL
);


--
-- Name: workflow_transition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_transition (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    project_id uuid NOT NULL,
    from_status_id uuid NOT NULL,
    to_status_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: workspace; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    owner_id uuid NOT NULL,
    status public.workspace_status DEFAULT 'ACTIVE'::public.workspace_status NOT NULL,
    archived_at timestamp with time zone,
    archived_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: workspace_invitation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_invitation (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    email text NOT NULL,
    role public.workspace_role NOT NULL,
    status public.invitation_status DEFAULT 'PENDING'::public.invitation_status NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    accepted_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid NOT NULL
);


--
-- Name: workspace_member; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_member (
    id uuid DEFAULT public.uuid_generate_v7() NOT NULL,
    workspace_id uuid NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    display_name text NOT NULL,
    role public.workspace_role DEFAULT 'MEMBER'::public.workspace_role NOT NULL,
    status public.membership_status DEFAULT 'ACTIVE'::public.membership_status NOT NULL,
    joined_at timestamp with time zone,
    invited_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: action_item action_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_item
    ADD CONSTRAINT action_item_pkey PRIMARY KEY (id);


--
-- Name: activity_event activity_event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_event
    ADD CONSTRAINT activity_event_pkey PRIMARY KEY (id);


--
-- Name: audit_event audit_event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_event
    ADD CONSTRAINT audit_event_pkey PRIMARY KEY (id);


--
-- Name: board_column board_column_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_column
    ADD CONSTRAINT board_column_pkey PRIMARY KEY (id);


--
-- Name: board_config board_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_config
    ADD CONSTRAINT board_config_pkey PRIMARY KEY (id);


--
-- Name: change_request change_request_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_request
    ADD CONSTRAINT change_request_pkey PRIMARY KEY (id);


--
-- Name: client_portal_item client_portal_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_portal_item
    ADD CONSTRAINT client_portal_item_pkey PRIMARY KEY (id);


--
-- Name: decision decision_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decision
    ADD CONSTRAINT decision_pkey PRIMARY KEY (id);


--
-- Name: document_folder document_folder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_folder
    ADD CONSTRAINT document_folder_pkey PRIMARY KEY (id);


--
-- Name: document_version document_version_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_version
    ADD CONSTRAINT document_version_pkey PRIMARY KEY (id);


--
-- Name: integration integration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration
    ADD CONSTRAINT integration_pkey PRIMARY KEY (id);


--
-- Name: issue_comment issue_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue_comment
    ADD CONSTRAINT issue_comment_pkey PRIMARY KEY (id);


--
-- Name: issue_dependency issue_dependency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue_dependency
    ADD CONSTRAINT issue_dependency_pkey PRIMARY KEY (id);


--
-- Name: issue issue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue
    ADD CONSTRAINT issue_pkey PRIMARY KEY (id);


--
-- Name: meeting_agenda_item meeting_agenda_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_agenda_item
    ADD CONSTRAINT meeting_agenda_item_pkey PRIMARY KEY (id);


--
-- Name: meeting_minutes meeting_minutes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_minutes
    ADD CONSTRAINT meeting_minutes_pkey PRIMARY KEY (id);


--
-- Name: meeting_minutes_version meeting_minutes_version_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_minutes_version
    ADD CONSTRAINT meeting_minutes_version_pkey PRIMARY KEY (id);


--
-- Name: meeting meeting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting
    ADD CONSTRAINT meeting_pkey PRIMARY KEY (id);


--
-- Name: milestone milestone_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestone
    ADD CONSTRAINT milestone_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: project_document project_document_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_document
    ADD CONSTRAINT project_document_pkey PRIMARY KEY (id);


--
-- Name: project_goal project_goal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_goal
    ADD CONSTRAINT project_goal_pkey PRIMARY KEY (id);


--
-- Name: project_key_reservation project_key_reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_key_reservation
    ADD CONSTRAINT project_key_reservation_pkey PRIMARY KEY (id);


--
-- Name: project_membership project_membership_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_membership
    ADD CONSTRAINT project_membership_pkey PRIMARY KEY (id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id);


--
-- Name: project_status_update project_status_update_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_status_update
    ADD CONSTRAINT project_status_update_pkey PRIMARY KEY (id);


--
-- Name: requirement requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirement
    ADD CONSTRAINT requirement_pkey PRIMARY KEY (id);


--
-- Name: retrospective_feedback retrospective_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retrospective_feedback
    ADD CONSTRAINT retrospective_feedback_pkey PRIMARY KEY (id);


--
-- Name: retrospective retrospective_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retrospective
    ADD CONSTRAINT retrospective_pkey PRIMARY KEY (id);


--
-- Name: risk risk_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.risk
    ADD CONSTRAINT risk_pkey PRIMARY KEY (id);


--
-- Name: saved_filter saved_filter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_filter
    ADD CONSTRAINT saved_filter_pkey PRIMARY KEY (id);


--
-- Name: sprint sprint_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprint
    ADD CONSTRAINT sprint_pkey PRIMARY KEY (id);


--
-- Name: sprint_scope_change sprint_scope_change_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprint_scope_change
    ADD CONSTRAINT sprint_scope_change_pkey PRIMARY KEY (id);


--
-- Name: sprint_snapshot sprint_snapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprint_snapshot
    ADD CONSTRAINT sprint_snapshot_pkey PRIMARY KEY (id);


--
-- Name: stakeholder stakeholder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stakeholder
    ADD CONSTRAINT stakeholder_pkey PRIMARY KEY (id);


--
-- Name: storage_object storage_object_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storage_object
    ADD CONSTRAINT storage_object_pkey PRIMARY KEY (id);


--
-- Name: profiles user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: webhook_delivery webhook_delivery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_delivery
    ADD CONSTRAINT webhook_delivery_pkey PRIMARY KEY (id);


--
-- Name: workflow_status workflow_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_status
    ADD CONSTRAINT workflow_status_pkey PRIMARY KEY (id);


--
-- Name: workflow_transition workflow_transition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_transition
    ADD CONSTRAINT workflow_transition_pkey PRIMARY KEY (id);


--
-- Name: workspace_invitation workspace_invitation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_invitation
    ADD CONSTRAINT workspace_invitation_pkey PRIMARY KEY (id);


--
-- Name: workspace_member workspace_member_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_member
    ADD CONSTRAINT workspace_member_pkey PRIMARY KEY (id);


--
-- Name: workspace workspace_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace
    ADD CONSTRAINT workspace_pkey PRIMARY KEY (id);


--
-- Name: action_item_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX action_item_workspace_id_project_id_id_key ON public.action_item USING btree (workspace_id, project_id, id);


--
-- Name: activity_event_project_id_occurred_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_event_project_id_occurred_at_idx ON public.activity_event USING btree (project_id, occurred_at);


--
-- Name: activity_event_workspace_id_occurred_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_event_workspace_id_occurred_at_idx ON public.activity_event USING btree (workspace_id, occurred_at);


--
-- Name: audit_event_workspace_id_occurred_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_event_workspace_id_occurred_at_idx ON public.audit_event USING btree (workspace_id, occurred_at);


--
-- Name: board_column_workspace_id_project_id_board_config_id_legacy_id_; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX board_column_workspace_id_project_id_board_config_id_legacy_id_ ON public.board_column USING btree (workspace_id, project_id, board_config_id, legacy_id);


--
-- Name: board_column_workspace_id_project_id_board_config_id_workflow_s; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX board_column_workspace_id_project_id_board_config_id_workflow_s ON public.board_column USING btree (workspace_id, project_id, board_config_id, workflow_status_id);


--
-- Name: board_column_workspace_id_project_id_rank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX board_column_workspace_id_project_id_rank_idx ON public.board_column USING btree (workspace_id, project_id, rank);


--
-- Name: board_config_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX board_config_workspace_id_project_id_id_key ON public.board_config USING btree (workspace_id, project_id, id);


--
-- Name: change_request_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX change_request_workspace_id_project_id_id_key ON public.change_request USING btree (workspace_id, project_id, id);


--
-- Name: client_portal_item_project_id_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX client_portal_item_project_id_status_idx ON public.client_portal_item USING btree (project_id, status);


--
-- Name: client_portal_item_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX client_portal_item_workspace_id_project_id_id_key ON public.client_portal_item USING btree (workspace_id, project_id, id);


--
-- Name: decision_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX decision_workspace_id_project_id_id_key ON public.decision USING btree (workspace_id, project_id, id);


--
-- Name: document_folder_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX document_folder_workspace_id_project_id_id_key ON public.document_folder USING btree (workspace_id, project_id, id);


--
-- Name: document_version_document_id_version_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX document_version_document_id_version_key ON public.document_version USING btree (document_id, version);


--
-- Name: document_version_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX document_version_workspace_id_project_id_id_key ON public.document_version USING btree (workspace_id, project_id, id);


--
-- Name: integration_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX integration_workspace_id_project_id_id_key ON public.integration USING btree (workspace_id, project_id, id);


--
-- Name: issue_assignee_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX issue_assignee_id_idx ON public.issue USING btree (assignee_id);


--
-- Name: issue_comment_issue_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX issue_comment_issue_id_created_at_idx ON public.issue_comment USING btree (issue_id, created_at);


--
-- Name: issue_comment_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX issue_comment_workspace_id_project_id_id_key ON public.issue_comment USING btree (workspace_id, project_id, id);


--
-- Name: issue_dependency_blocking_issue_id_blocked_issue_id_type_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX issue_dependency_blocking_issue_id_blocked_issue_id_type_key ON public.issue_dependency USING btree (blocking_issue_id, blocked_issue_id, type);


--
-- Name: issue_dependency_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX issue_dependency_workspace_id_project_id_id_key ON public.issue_dependency USING btree (workspace_id, project_id, id);


--
-- Name: issue_project_id_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX issue_project_id_key_key ON public.issue USING btree (project_id, key);


--
-- Name: issue_project_id_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX issue_project_id_number_key ON public.issue USING btree (project_id, number);


--
-- Name: issue_project_id_sprint_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX issue_project_id_sprint_id_idx ON public.issue USING btree (project_id, sprint_id);


--
-- Name: issue_project_id_workflow_status_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX issue_project_id_workflow_status_id_idx ON public.issue USING btree (project_id, workflow_status_id);


--
-- Name: issue_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX issue_workspace_id_project_id_id_key ON public.issue USING btree (workspace_id, project_id, id);


--
-- Name: meeting_agenda_item_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX meeting_agenda_item_workspace_id_project_id_id_key ON public.meeting_agenda_item USING btree (workspace_id, project_id, id);


--
-- Name: meeting_minutes_version_minutes_id_version_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX meeting_minutes_version_minutes_id_version_key ON public.meeting_minutes_version USING btree (minutes_id, version);


--
-- Name: meeting_minutes_version_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX meeting_minutes_version_workspace_id_project_id_id_key ON public.meeting_minutes_version USING btree (workspace_id, project_id, id);


--
-- Name: meeting_minutes_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX meeting_minutes_workspace_id_project_id_id_key ON public.meeting_minutes USING btree (workspace_id, project_id, id);


--
-- Name: meeting_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX meeting_workspace_id_project_id_id_key ON public.meeting USING btree (workspace_id, project_id, id);


--
-- Name: milestone_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX milestone_workspace_id_project_id_id_key ON public.milestone USING btree (workspace_id, project_id, id);


--
-- Name: notification_recipient_id_read_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_recipient_id_read_at_idx ON public.notification USING btree (recipient_id, read_at);


--
-- Name: project_document_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX project_document_workspace_id_project_id_id_key ON public.project_document USING btree (workspace_id, project_id, id);


--
-- Name: project_goal_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX project_goal_workspace_id_project_id_id_key ON public.project_goal USING btree (workspace_id, project_id, id);


--
-- Name: project_key_reservation_workspace_id_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX project_key_reservation_workspace_id_key_key ON public.project_key_reservation USING btree (workspace_id, key);


--
-- Name: project_key_reservation_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX project_key_reservation_workspace_id_project_id_id_key ON public.project_key_reservation USING btree (workspace_id, project_id, id);


--
-- Name: project_membership_project_id_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX project_membership_project_id_user_id_key ON public.project_membership USING btree (project_id, user_id);


--
-- Name: project_membership_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX project_membership_workspace_id_project_id_id_key ON public.project_membership USING btree (workspace_id, project_id, id);


--
-- Name: project_membership_workspace_id_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX project_membership_workspace_id_user_id_idx ON public.project_membership USING btree (workspace_id, user_id);


--
-- Name: project_status_update_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX project_status_update_workspace_id_project_id_id_key ON public.project_status_update USING btree (workspace_id, project_id, id);


--
-- Name: project_workspace_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX project_workspace_id_id_key ON public.project USING btree (workspace_id, id);


--
-- Name: project_workspace_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX project_workspace_id_key ON public.project USING btree (workspace_id);


--
-- Name: project_workspace_id_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX project_workspace_id_key_key ON public.project USING btree (workspace_id, key);


--
-- Name: project_workspace_id_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX project_workspace_id_status_idx ON public.project USING btree (workspace_id, status);


--
-- Name: requirement_project_id_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX requirement_project_id_key_key ON public.requirement USING btree (project_id, key);


--
-- Name: requirement_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX requirement_workspace_id_project_id_id_key ON public.requirement USING btree (workspace_id, project_id, id);


--
-- Name: retrospective_feedback_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX retrospective_feedback_workspace_id_project_id_id_key ON public.retrospective_feedback USING btree (workspace_id, project_id, id);


--
-- Name: retrospective_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX retrospective_workspace_id_project_id_id_key ON public.retrospective USING btree (workspace_id, project_id, id);


--
-- Name: risk_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX risk_workspace_id_project_id_id_key ON public.risk USING btree (workspace_id, project_id, id);


--
-- Name: sprint_one_active_per_project_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sprint_one_active_per_project_key ON public.sprint USING btree (project_id) WHERE (status = 'ACTIVE'::public.sprint_status);


--
-- Name: sprint_project_id_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sprint_project_id_status_idx ON public.sprint USING btree (project_id, status);


--
-- Name: sprint_scope_change_sprint_id_occurred_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sprint_scope_change_sprint_id_occurred_at_idx ON public.sprint_scope_change USING btree (sprint_id, occurred_at);


--
-- Name: sprint_scope_change_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sprint_scope_change_workspace_id_project_id_id_key ON public.sprint_scope_change USING btree (workspace_id, project_id, id);


--
-- Name: sprint_snapshot_sprint_id_snapshot_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sprint_snapshot_sprint_id_snapshot_at_idx ON public.sprint_snapshot USING btree (sprint_id, snapshot_at);


--
-- Name: sprint_snapshot_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sprint_snapshot_workspace_id_project_id_id_key ON public.sprint_snapshot USING btree (workspace_id, project_id, id);


--
-- Name: sprint_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sprint_workspace_id_project_id_id_key ON public.sprint USING btree (workspace_id, project_id, id);


--
-- Name: stakeholder_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX stakeholder_workspace_id_project_id_id_key ON public.stakeholder USING btree (workspace_id, project_id, id);


--
-- Name: storage_object_bucket_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX storage_object_bucket_key_key ON public.storage_object USING btree (bucket, key);


--
-- Name: storage_object_workspace_id_project_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX storage_object_workspace_id_project_id_idx ON public.storage_object USING btree (workspace_id, project_id);


--
-- Name: webhook_delivery_integration_id_idempotency_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX webhook_delivery_integration_id_idempotency_key_key ON public.webhook_delivery USING btree (integration_id, idempotency_key);


--
-- Name: webhook_delivery_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX webhook_delivery_workspace_id_project_id_id_key ON public.webhook_delivery USING btree (workspace_id, project_id, id);


--
-- Name: workflow_status_project_id_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX workflow_status_project_id_name_key ON public.workflow_status USING btree (project_id, name);


--
-- Name: workflow_status_workspace_id_project_id_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX workflow_status_workspace_id_project_id_id_key ON public.workflow_status USING btree (workspace_id, project_id, id);


--
-- Name: workflow_transition_workspace_id_project_id_from_status_id_to_s; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX workflow_transition_workspace_id_project_id_from_status_id_to_s ON public.workflow_transition USING btree (workspace_id, project_id, from_status_id, to_status_id);


--
-- Name: workspace_invitation_token_hash_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX workspace_invitation_token_hash_key ON public.workspace_invitation USING btree (token_hash);


--
-- Name: workspace_invitation_workspace_id_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workspace_invitation_workspace_id_email_idx ON public.workspace_invitation USING btree (workspace_id, email);


--
-- Name: workspace_member_one_active_owner_per_workspace_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX workspace_member_one_active_owner_per_workspace_key ON public.workspace_member USING btree (workspace_id) WHERE ((role = 'OWNER'::public.workspace_role) AND (status = 'ACTIVE'::public.membership_status));


--
-- Name: workspace_member_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workspace_member_user_id_idx ON public.workspace_member USING btree (user_id);


--
-- Name: workspace_member_workspace_id_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX workspace_member_workspace_id_user_id_key ON public.workspace_member USING btree (workspace_id, user_id);


--
-- Name: workspace_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX workspace_slug_key ON public.workspace USING btree (slug);


--
-- Name: action_item set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.action_item FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: board_config set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.board_config FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: change_request set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.change_request FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: decision set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.decision FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: document_folder set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.document_folder FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: integration set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.integration FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: issue set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.issue FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: issue_comment set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.issue_comment FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: issue_dependency set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.issue_dependency FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: meeting set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.meeting FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: meeting_agenda_item set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.meeting_agenda_item FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: meeting_minutes set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.meeting_minutes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: milestone set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.milestone FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: profiles set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: project set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.project FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: project_document set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.project_document FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: project_goal set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.project_goal FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: project_membership set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.project_membership FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: project_status_update set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.project_status_update FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: requirement set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.requirement FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: retrospective set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.retrospective FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: retrospective_feedback set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.retrospective_feedback FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: risk set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.risk FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: saved_filter set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.saved_filter FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: sprint set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.sprint FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: stakeholder set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.stakeholder FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: storage_object set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.storage_object FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: workflow_status set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.workflow_status FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: workspace set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.workspace FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: workspace_invitation set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.workspace_invitation FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: workspace_member set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.workspace_member FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: workspace workspace_active_owner_membership_required; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER workspace_active_owner_membership_required AFTER INSERT OR UPDATE ON public.workspace DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.require_workspace_owner_membership();


--
-- Name: workspace_member workspace_member_owner_membership_required; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER workspace_member_owner_membership_required AFTER INSERT OR DELETE OR UPDATE ON public.workspace_member DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.require_workspace_owner_membership();


--
-- Name: action_item action_item_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_item
    ADD CONSTRAINT action_item_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: action_item action_item_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_item
    ADD CONSTRAINT action_item_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_item action_item_workspace_id_project_id_linked_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_item
    ADD CONSTRAINT action_item_workspace_id_project_id_linked_issue_id_fkey FOREIGN KEY (workspace_id, project_id, linked_issue_id) REFERENCES public.issue(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: action_item action_item_workspace_id_project_id_source_decision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_item
    ADD CONSTRAINT action_item_workspace_id_project_id_source_decision_id_fkey FOREIGN KEY (workspace_id, project_id, source_decision_id) REFERENCES public.decision(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: action_item action_item_workspace_id_project_id_source_meeting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_item
    ADD CONSTRAINT action_item_workspace_id_project_id_source_meeting_id_fkey FOREIGN KEY (workspace_id, project_id, source_meeting_id) REFERENCES public.meeting(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: action_item action_item_workspace_id_project_id_source_minutes_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_item
    ADD CONSTRAINT action_item_workspace_id_project_id_source_minutes_id_fkey FOREIGN KEY (workspace_id, project_id, source_minutes_id) REFERENCES public.meeting_minutes(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: activity_event activity_event_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_event
    ADD CONSTRAINT activity_event_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: activity_event activity_event_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_event
    ADD CONSTRAINT activity_event_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: activity_event activity_event_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_event
    ADD CONSTRAINT activity_event_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: audit_event audit_event_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_event
    ADD CONSTRAINT audit_event_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: audit_event audit_event_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_event
    ADD CONSTRAINT audit_event_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_event audit_event_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_event
    ADD CONSTRAINT audit_event_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: board_column board_column_workspace_id_project_id_board_config_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_column
    ADD CONSTRAINT board_column_workspace_id_project_id_board_config_id_fkey FOREIGN KEY (workspace_id, project_id, board_config_id) REFERENCES public.board_config(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: board_column board_column_workspace_id_project_id_workflow_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_column
    ADD CONSTRAINT board_column_workspace_id_project_id_workflow_status_id_fkey FOREIGN KEY (workspace_id, project_id, workflow_status_id) REFERENCES public.workflow_status(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: board_config board_config_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_config
    ADD CONSTRAINT board_config_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: change_request change_request_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_request
    ADD CONSTRAINT change_request_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: change_request change_request_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_request
    ADD CONSTRAINT change_request_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: change_request change_request_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_request
    ADD CONSTRAINT change_request_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: client_portal_item client_portal_item_published_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_portal_item
    ADD CONSTRAINT client_portal_item_published_by_fkey FOREIGN KEY (published_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: client_portal_item client_portal_item_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_portal_item
    ADD CONSTRAINT client_portal_item_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: decision decision_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decision
    ADD CONSTRAINT decision_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: decision decision_workspace_id_project_id_meeting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decision
    ADD CONSTRAINT decision_workspace_id_project_id_meeting_id_fkey FOREIGN KEY (workspace_id, project_id, meeting_id) REFERENCES public.meeting(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: decision decision_workspace_id_project_id_minutes_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decision
    ADD CONSTRAINT decision_workspace_id_project_id_minutes_id_fkey FOREIGN KEY (workspace_id, project_id, minutes_id) REFERENCES public.meeting_minutes(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: decision decision_workspace_id_project_id_supersedes_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decision
    ADD CONSTRAINT decision_workspace_id_project_id_supersedes_id_fkey FOREIGN KEY (workspace_id, project_id, supersedes_id) REFERENCES public.decision(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_folder document_folder_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_folder
    ADD CONSTRAINT document_folder_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: document_folder document_folder_workspace_id_project_id_parent_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_folder
    ADD CONSTRAINT document_folder_workspace_id_project_id_parent_folder_id_fkey FOREIGN KEY (workspace_id, project_id, parent_folder_id) REFERENCES public.document_folder(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: document_version document_version_workspace_id_project_id_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_version
    ADD CONSTRAINT document_version_workspace_id_project_id_document_id_fkey FOREIGN KEY (workspace_id, project_id, document_id) REFERENCES public.project_document(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: document_version document_version_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_version
    ADD CONSTRAINT document_version_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: integration integration_connected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration
    ADD CONSTRAINT integration_connected_by_fkey FOREIGN KEY (connected_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: integration integration_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration
    ADD CONSTRAINT integration_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issue issue_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue
    ADD CONSTRAINT issue_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: issue_comment issue_comment_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue_comment
    ADD CONSTRAINT issue_comment_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: issue_comment issue_comment_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue_comment
    ADD CONSTRAINT issue_comment_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issue_comment issue_comment_workspace_id_project_id_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue_comment
    ADD CONSTRAINT issue_comment_workspace_id_project_id_issue_id_fkey FOREIGN KEY (workspace_id, project_id, issue_id) REFERENCES public.issue(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issue_dependency issue_dependency_workspace_id_project_id_blocked_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue_dependency
    ADD CONSTRAINT issue_dependency_workspace_id_project_id_blocked_issue_id_fkey FOREIGN KEY (workspace_id, project_id, blocked_issue_id) REFERENCES public.issue(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issue_dependency issue_dependency_workspace_id_project_id_blocking_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue_dependency
    ADD CONSTRAINT issue_dependency_workspace_id_project_id_blocking_issue_id_fkey FOREIGN KEY (workspace_id, project_id, blocking_issue_id) REFERENCES public.issue(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issue_dependency issue_dependency_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue_dependency
    ADD CONSTRAINT issue_dependency_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issue issue_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue
    ADD CONSTRAINT issue_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: issue issue_workspace_id_project_id_epic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue
    ADD CONSTRAINT issue_workspace_id_project_id_epic_id_fkey FOREIGN KEY (workspace_id, project_id, epic_id) REFERENCES public.issue(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: issue issue_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue
    ADD CONSTRAINT issue_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issue issue_workspace_id_project_id_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue
    ADD CONSTRAINT issue_workspace_id_project_id_parent_id_fkey FOREIGN KEY (workspace_id, project_id, parent_id) REFERENCES public.issue(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: issue issue_workspace_id_project_id_sprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue
    ADD CONSTRAINT issue_workspace_id_project_id_sprint_id_fkey FOREIGN KEY (workspace_id, project_id, sprint_id) REFERENCES public.sprint(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: issue issue_workspace_id_project_id_workflow_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.issue
    ADD CONSTRAINT issue_workspace_id_project_id_workflow_status_id_fkey FOREIGN KEY (workspace_id, project_id, workflow_status_id) REFERENCES public.workflow_status(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: meeting_agenda_item meeting_agenda_item_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_agenda_item
    ADD CONSTRAINT meeting_agenda_item_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meeting_agenda_item meeting_agenda_item_workspace_id_project_id_meeting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_agenda_item
    ADD CONSTRAINT meeting_agenda_item_workspace_id_project_id_meeting_id_fkey FOREIGN KEY (workspace_id, project_id, meeting_id) REFERENCES public.meeting(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meeting meeting_facilitator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting
    ADD CONSTRAINT meeting_facilitator_id_fkey FOREIGN KEY (facilitator_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: meeting meeting_minute_taker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting
    ADD CONSTRAINT meeting_minute_taker_id_fkey FOREIGN KEY (minute_taker_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: meeting_minutes meeting_minutes_meeting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_minutes
    ADD CONSTRAINT meeting_minutes_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meeting(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meeting_minutes_version meeting_minutes_version_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_minutes_version
    ADD CONSTRAINT meeting_minutes_version_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meeting_minutes_version meeting_minutes_version_workspace_id_project_id_minutes_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_minutes_version
    ADD CONSTRAINT meeting_minutes_version_workspace_id_project_id_minutes_id_fkey FOREIGN KEY (workspace_id, project_id, minutes_id) REFERENCES public.meeting_minutes(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meeting_minutes meeting_minutes_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_minutes
    ADD CONSTRAINT meeting_minutes_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meeting_minutes meeting_minutes_workspace_id_project_id_supersedes_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_minutes
    ADD CONSTRAINT meeting_minutes_workspace_id_project_id_supersedes_id_fkey FOREIGN KEY (workspace_id, project_id, supersedes_id) REFERENCES public.meeting_minutes(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: meeting meeting_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting
    ADD CONSTRAINT meeting_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: meeting meeting_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting
    ADD CONSTRAINT meeting_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meeting meeting_workspace_id_project_id_sprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting
    ADD CONSTRAINT meeting_workspace_id_project_id_sprint_id_fkey FOREIGN KEY (workspace_id, project_id, sprint_id) REFERENCES public.sprint(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: milestone milestone_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestone
    ADD CONSTRAINT milestone_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project project_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: project_document project_document_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_document
    ADD CONSTRAINT project_document_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_document project_document_workspace_id_project_id_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_document
    ADD CONSTRAINT project_document_workspace_id_project_id_folder_id_fkey FOREIGN KEY (workspace_id, project_id, folder_id) REFERENCES public.document_folder(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: project_goal project_goal_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_goal
    ADD CONSTRAINT project_goal_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: project_goal project_goal_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_goal
    ADD CONSTRAINT project_goal_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_key_reservation project_key_reservation_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_key_reservation
    ADD CONSTRAINT project_key_reservation_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_key_reservation project_key_reservation_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_key_reservation
    ADD CONSTRAINT project_key_reservation_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project project_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: project_membership project_membership_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_membership
    ADD CONSTRAINT project_membership_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_membership project_membership_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_membership
    ADD CONSTRAINT project_membership_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_membership project_membership_workspace_id_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_membership
    ADD CONSTRAINT project_membership_workspace_id_user_id_fkey FOREIGN KEY (workspace_id, user_id) REFERENCES public.workspace_member(workspace_id, user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: project_status_update project_status_update_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_status_update
    ADD CONSTRAINT project_status_update_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: project_status_update project_status_update_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_status_update
    ADD CONSTRAINT project_status_update_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project project_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: requirement requirement_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirement
    ADD CONSTRAINT requirement_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: requirement requirement_workspace_id_project_id_source_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirement
    ADD CONSTRAINT requirement_workspace_id_project_id_source_document_id_fkey FOREIGN KEY (workspace_id, project_id, source_document_id) REFERENCES public.project_document(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: retrospective retrospective_facilitator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retrospective
    ADD CONSTRAINT retrospective_facilitator_id_fkey FOREIGN KEY (facilitator_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: retrospective_feedback retrospective_feedback_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retrospective_feedback
    ADD CONSTRAINT retrospective_feedback_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: retrospective_feedback retrospective_feedback_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retrospective_feedback
    ADD CONSTRAINT retrospective_feedback_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: retrospective_feedback retrospective_feedback_workspace_id_project_id_retrospective_i_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retrospective_feedback
    ADD CONSTRAINT retrospective_feedback_workspace_id_project_id_retrospective_i_ FOREIGN KEY (workspace_id, project_id, retrospective_id) REFERENCES public.retrospective(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: retrospective retrospective_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retrospective
    ADD CONSTRAINT retrospective_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: retrospective retrospective_workspace_id_project_id_meeting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retrospective
    ADD CONSTRAINT retrospective_workspace_id_project_id_meeting_id_fkey FOREIGN KEY (workspace_id, project_id, meeting_id) REFERENCES public.meeting(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: retrospective retrospective_workspace_id_project_id_sprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retrospective
    ADD CONSTRAINT retrospective_workspace_id_project_id_sprint_id_fkey FOREIGN KEY (workspace_id, project_id, sprint_id) REFERENCES public.sprint(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: risk risk_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.risk
    ADD CONSTRAINT risk_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: risk risk_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.risk
    ADD CONSTRAINT risk_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: saved_filter saved_filter_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_filter
    ADD CONSTRAINT saved_filter_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: saved_filter saved_filter_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_filter
    ADD CONSTRAINT saved_filter_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: saved_filter saved_filter_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_filter
    ADD CONSTRAINT saved_filter_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sprint_scope_change sprint_scope_change_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprint_scope_change
    ADD CONSTRAINT sprint_scope_change_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sprint_scope_change sprint_scope_change_workspace_id_project_id_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprint_scope_change
    ADD CONSTRAINT sprint_scope_change_workspace_id_project_id_issue_id_fkey FOREIGN KEY (workspace_id, project_id, issue_id) REFERENCES public.issue(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sprint_scope_change sprint_scope_change_workspace_id_project_id_sprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprint_scope_change
    ADD CONSTRAINT sprint_scope_change_workspace_id_project_id_sprint_id_fkey FOREIGN KEY (workspace_id, project_id, sprint_id) REFERENCES public.sprint(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sprint_snapshot sprint_snapshot_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprint_snapshot
    ADD CONSTRAINT sprint_snapshot_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sprint_snapshot sprint_snapshot_workspace_id_project_id_sprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprint_snapshot
    ADD CONSTRAINT sprint_snapshot_workspace_id_project_id_sprint_id_fkey FOREIGN KEY (workspace_id, project_id, sprint_id) REFERENCES public.sprint(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sprint sprint_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sprint
    ADD CONSTRAINT sprint_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stakeholder stakeholder_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stakeholder
    ADD CONSTRAINT stakeholder_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: storage_object storage_object_uploader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storage_object
    ADD CONSTRAINT storage_object_uploader_id_fkey FOREIGN KEY (uploader_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: storage_object storage_object_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storage_object
    ADD CONSTRAINT storage_object_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: storage_object storage_object_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storage_object
    ADD CONSTRAINT storage_object_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: webhook_delivery webhook_delivery_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_delivery
    ADD CONSTRAINT webhook_delivery_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: webhook_delivery webhook_delivery_workspace_id_project_id_integration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_delivery
    ADD CONSTRAINT webhook_delivery_workspace_id_project_id_integration_id_fkey FOREIGN KEY (workspace_id, project_id, integration_id) REFERENCES public.integration(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workflow_status workflow_status_workspace_id_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_status
    ADD CONSTRAINT workflow_status_workspace_id_project_id_fkey FOREIGN KEY (workspace_id, project_id) REFERENCES public.project(workspace_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workflow_transition workflow_transition_workspace_id_project_id_from_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_transition
    ADD CONSTRAINT workflow_transition_workspace_id_project_id_from_status_id_fkey FOREIGN KEY (workspace_id, project_id, from_status_id) REFERENCES public.workflow_status(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workflow_transition workflow_transition_workspace_id_project_id_to_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_transition
    ADD CONSTRAINT workflow_transition_workspace_id_project_id_to_status_id_fkey FOREIGN KEY (workspace_id, project_id, to_status_id) REFERENCES public.workflow_status(workspace_id, project_id, id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workspace_invitation workspace_invitation_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_invitation
    ADD CONSTRAINT workspace_invitation_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workspace_member workspace_member_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_member
    ADD CONSTRAINT workspace_member_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workspace_member workspace_member_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_member
    ADD CONSTRAINT workspace_member_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspace(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workspace workspace_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace
    ADD CONSTRAINT workspace_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

--
-- Audit columns: created_by and updated_by reference the acting profile (Amendment 2)
--

ALTER TABLE ONLY public.action_item
    ADD CONSTRAINT action_item_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.action_item
    ADD CONSTRAINT action_item_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.board_column
    ADD CONSTRAINT board_column_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.board_config
    ADD CONSTRAINT board_config_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.board_config
    ADD CONSTRAINT board_config_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.change_request
    ADD CONSTRAINT change_request_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.change_request
    ADD CONSTRAINT change_request_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.decision
    ADD CONSTRAINT decision_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.decision
    ADD CONSTRAINT decision_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.document_folder
    ADD CONSTRAINT document_folder_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.document_folder
    ADD CONSTRAINT document_folder_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.document_version
    ADD CONSTRAINT document_version_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.integration
    ADD CONSTRAINT integration_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.integration
    ADD CONSTRAINT integration_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.issue
    ADD CONSTRAINT issue_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.issue
    ADD CONSTRAINT issue_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.issue_comment
    ADD CONSTRAINT issue_comment_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.issue_comment
    ADD CONSTRAINT issue_comment_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.issue_dependency
    ADD CONSTRAINT issue_dependency_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.issue_dependency
    ADD CONSTRAINT issue_dependency_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.meeting
    ADD CONSTRAINT meeting_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.meeting
    ADD CONSTRAINT meeting_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.meeting_agenda_item
    ADD CONSTRAINT meeting_agenda_item_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.meeting_agenda_item
    ADD CONSTRAINT meeting_agenda_item_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.meeting_minutes
    ADD CONSTRAINT meeting_minutes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.meeting_minutes
    ADD CONSTRAINT meeting_minutes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.meeting_minutes_version
    ADD CONSTRAINT meeting_minutes_version_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.milestone
    ADD CONSTRAINT milestone_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.milestone
    ADD CONSTRAINT milestone_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.project_document
    ADD CONSTRAINT project_document_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.project_document
    ADD CONSTRAINT project_document_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.project_goal
    ADD CONSTRAINT project_goal_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.project_goal
    ADD CONSTRAINT project_goal_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.project_key_reservation
    ADD CONSTRAINT project_key_reservation_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.project_membership
    ADD CONSTRAINT project_membership_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.project_membership
    ADD CONSTRAINT project_membership_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.project_status_update
    ADD CONSTRAINT project_status_update_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.project_status_update
    ADD CONSTRAINT project_status_update_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.requirement
    ADD CONSTRAINT requirement_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.requirement
    ADD CONSTRAINT requirement_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.retrospective
    ADD CONSTRAINT retrospective_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.retrospective
    ADD CONSTRAINT retrospective_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.retrospective_feedback
    ADD CONSTRAINT retrospective_feedback_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.retrospective_feedback
    ADD CONSTRAINT retrospective_feedback_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.risk
    ADD CONSTRAINT risk_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.risk
    ADD CONSTRAINT risk_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.saved_filter
    ADD CONSTRAINT saved_filter_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.saved_filter
    ADD CONSTRAINT saved_filter_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.sprint
    ADD CONSTRAINT sprint_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.sprint
    ADD CONSTRAINT sprint_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.stakeholder
    ADD CONSTRAINT stakeholder_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.stakeholder
    ADD CONSTRAINT stakeholder_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.workflow_status
    ADD CONSTRAINT workflow_status_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.workflow_status
    ADD CONSTRAINT workflow_status_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.workspace
    ADD CONSTRAINT workspace_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.workspace
    ADD CONSTRAINT workspace_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.workspace_invitation
    ADD CONSTRAINT workspace_invitation_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.workspace_invitation
    ADD CONSTRAINT workspace_invitation_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;

