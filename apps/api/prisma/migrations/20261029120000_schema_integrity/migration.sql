BEGIN;

DO $$
DECLARE
  project_workspace_conflicts BIGINT;
  project_scope_conflicts BIGINT := 0;
  missing_workspace_members BIGINT;
  owner_membership_conflicts BIGINT;
  active_owner_conflicts BIGINT;
  active_sprint_conflicts BIGINT;
  linked_record_conflicts BIGINT := 0;
  invalid_transition_links BIGINT;
  duplicate_legacy_board_columns BIGINT;
  owner_lead_differences BIGINT;
  membership_status_differences BIGINT;
  project_membership_rows BIGINT;
  table_name TEXT;
  relation RECORD;
  relation_conflict_count BIGINT;
BEGIN
  SELECT count(*) INTO project_workspace_conflicts
  FROM (
    SELECT "workspaceId"
    FROM "Project"
    GROUP BY "workspaceId"
    HAVING count(*) > 1
  ) conflicts;

  FOREACH table_name IN ARRAY ARRAY[
    'ProjectKeyReservation', 'ProjectMembership', 'Issue', 'IssueDependency',
    'IssueComment', 'BoardConfig', 'WorkflowStatus', 'Sprint', 'SprintScopeChange',
    'SprintSnapshot', 'ProjectGoal', 'ProjectStatusUpdate', 'Milestone', 'Meeting',
    'MeetingAgendaItem', 'MeetingMinutes', 'MeetingMinutesVersion', 'Decision',
    'ActionItem', 'DocumentFolder', 'ProjectDocument', 'DocumentVersion', 'Requirement',
    'Retrospective', 'RetrospectiveFeedback', 'Risk', 'Stakeholder', 'ChangeRequest',
    'Integration', 'WebhookDelivery', 'ClientPortalItem', 'ActivityEvent', 'AuditEvent',
    'SavedFilter', 'StorageObject'
  ] LOOP
    EXECUTE format(
      'SELECT count(*) FROM %I child LEFT JOIN "Project" parent ON parent."id" = child."projectId" WHERE child."projectId" IS NOT NULL AND (parent."id" IS NULL OR child."workspaceId" <> parent."workspaceId")',
      table_name
    ) INTO relation_conflict_count;
    project_scope_conflicts := project_scope_conflicts + relation_conflict_count;
  END LOOP;

  SELECT count(*) INTO missing_workspace_members
  FROM "ProjectMembership" project_membership
  LEFT JOIN "WorkspaceMember" workspace_member
    ON workspace_member."workspaceId" = project_membership."workspaceId"
    AND workspace_member."userId" = project_membership."userId"
  WHERE workspace_member."id" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM "Workspace" workspace
      WHERE workspace."id" = project_membership."workspaceId"
        AND workspace."ownerId" = project_membership."userId"
    );

  SELECT count(*) INTO owner_membership_conflicts
  FROM "Workspace" workspace
  JOIN "WorkspaceMember" workspace_member
    ON workspace_member."workspaceId" = workspace."id"
    AND workspace_member."userId" = workspace."ownerId"
  WHERE workspace_member."role" <> 'OWNER' OR workspace_member."status" <> 'ACTIVE';

  SELECT count(*) INTO active_owner_conflicts
  FROM (
    SELECT workspace_member."workspaceId"
    FROM "WorkspaceMember" workspace_member
    JOIN "Workspace" workspace ON workspace."id" = workspace_member."workspaceId"
    WHERE workspace_member."role" = 'OWNER' AND workspace_member."status" = 'ACTIVE'
    GROUP BY workspace_member."workspaceId", workspace."ownerId"
    HAVING count(*) FILTER (WHERE workspace_member."userId" = workspace."ownerId") <> 1
      OR count(*) FILTER (WHERE workspace_member."userId" <> workspace."ownerId") > 0
  ) conflicts;

  SELECT count(*) INTO active_sprint_conflicts
  FROM (
    SELECT "projectId"
    FROM "Sprint"
    WHERE "status" = 'ACTIVE'
    GROUP BY "projectId"
    HAVING count(*) > 1
  ) conflicts;

  FOR relation IN
    SELECT * FROM (VALUES
      ('Issue', 'parentId', 'Issue'),
      ('Issue', 'epicId', 'Issue'),
      ('Issue', 'sprintId', 'Sprint'),
      ('IssueDependency', 'blockingIssueId', 'Issue'),
      ('IssueDependency', 'blockedIssueId', 'Issue'),
      ('IssueComment', 'issueId', 'Issue'),
      ('SprintScopeChange', 'sprintId', 'Sprint'),
      ('SprintScopeChange', 'issueId', 'Issue'),
      ('SprintSnapshot', 'sprintId', 'Sprint'),
      ('Meeting', 'sprintId', 'Sprint'),
      ('MeetingAgendaItem', 'meetingId', 'Meeting'),
      ('MeetingMinutes', 'meetingId', 'Meeting'),
      ('MeetingMinutes', 'supersedesId', 'MeetingMinutes'),
      ('MeetingMinutesVersion', 'minutesId', 'MeetingMinutes'),
      ('Decision', 'meetingId', 'Meeting'),
      ('Decision', 'minutesId', 'MeetingMinutes'),
      ('Decision', 'supersedesId', 'Decision'),
      ('ActionItem', 'sourceMeetingId', 'Meeting'),
      ('ActionItem', 'sourceMinutesId', 'MeetingMinutes'),
      ('ActionItem', 'sourceDecisionId', 'Decision'),
      ('ActionItem', 'linkedIssueId', 'Issue'),
      ('DocumentFolder', 'parentFolderId', 'DocumentFolder'),
      ('ProjectDocument', 'folderId', 'DocumentFolder'),
      ('DocumentVersion', 'documentId', 'ProjectDocument'),
      ('Requirement', 'sourceDocumentId', 'ProjectDocument'),
      ('Retrospective', 'sprintId', 'Sprint'),
      ('Retrospective', 'meetingId', 'Meeting'),
      ('RetrospectiveFeedback', 'retrospectiveId', 'Retrospective'),
      ('WebhookDelivery', 'integrationId', 'Integration')
    ) AS links(child_table, child_id, parent_table)
  LOOP
    EXECUTE format(
      'SELECT count(*) FROM %I child LEFT JOIN %I parent ON parent."id" = child.%I WHERE child.%I IS NOT NULL AND (parent."id" IS NULL OR child."workspaceId" <> parent."workspaceId" OR child."projectId" <> parent."projectId")',
      relation.child_table,
      relation.parent_table,
      relation.child_id,
      relation.child_id
    ) INTO relation_conflict_count;
    linked_record_conflicts := linked_record_conflicts + relation_conflict_count;
  END LOOP;

  SELECT count(*) INTO invalid_transition_links
  FROM "WorkflowStatus" source
  CROSS JOIN LATERAL unnest(source."transitionsTo") AS targets(target_id)
  LEFT JOIN "WorkflowStatus" target
    ON target."workspaceId" = source."workspaceId"
    AND target."projectId" = source."projectId"
    AND target."id" = target_id
  WHERE target."id" IS NULL;

  SELECT count(*) INTO duplicate_legacy_board_columns
  FROM (
    SELECT board."id"
    FROM "BoardConfig" board
  CROSS JOIN LATERAL unnest(board."columnIds") AS columns(column_id)
    GROUP BY board."id", columns.column_id
    HAVING count(*) > 1
  ) conflicts;

  SELECT count(*) INTO owner_lead_differences
  FROM "Workspace" workspace
  JOIN "Project" project ON project."workspaceId" = workspace."id"
  WHERE project."leadId" <> workspace."ownerId";

  SELECT count(*) INTO membership_status_differences
  FROM "ProjectMembership" project_membership
  JOIN "WorkspaceMember" workspace_member
    ON workspace_member."workspaceId" = project_membership."workspaceId"
    AND workspace_member."userId" = project_membership."userId"
  WHERE project_membership."status" <> workspace_member."status";

  SELECT count(*) INTO project_membership_rows FROM "ProjectMembership";

  RAISE NOTICE 'preserved project_lead_owner_differences=%, membership_status_differences=%, project_membership_rows=%', owner_lead_differences, membership_status_differences, project_membership_rows;

  IF project_workspace_conflicts > 0
    OR project_scope_conflicts > 0
    OR missing_workspace_members > 0
    OR owner_membership_conflicts > 0
    OR active_owner_conflicts > 0
    OR active_sprint_conflicts > 0
    OR linked_record_conflicts > 0
    OR invalid_transition_links > 0
    OR duplicate_legacy_board_columns > 0
  THEN
    RAISE EXCEPTION 'schema migration stopped without changing data: multi_project_workspaces=%, project_scope_mismatches=%, project_members_without_workspace_member=%, owner_membership_conflicts=%, active_owner_conflicts=%, multiple_active_sprints=%, cross_scope_links=%, invalid_workflow_transitions=%, duplicate_board_column_ids=%',
      project_workspace_conflicts, project_scope_conflicts, missing_workspace_members,
      owner_membership_conflicts, active_owner_conflicts, active_sprint_conflicts,
      linked_record_conflicts, invalid_transition_links, duplicate_legacy_board_columns;
  END IF;
END $$;

INSERT INTO "Project" (
  "id", "workspaceId", "name", "key", "description", "objective", "template",
  "status", "leadId", "nextIssueNumber", "timezone", "createdAt", "createdBy",
  "updatedAt", "updatedBy"
)
SELECT
  gen_random_uuid()::text,
  workspace."id",
  workspace."name",
  COALESCE(NULLIF(upper(left(regexp_replace(workspace."slug", '[^a-zA-Z0-9]', '', 'g'), 10)), ''), 'WORKSPACE'),
  workspace."description",
  '',
  'SCRUM',
  'ACTIVE',
  workspace."ownerId",
  1,
  'UTC',
  workspace."createdAt",
  workspace."createdBy",
  workspace."updatedAt",
  workspace."updatedBy"
FROM "Workspace" workspace
LEFT JOIN "Project" project ON project."workspaceId" = workspace."id"
WHERE project."id" IS NULL;

INSERT INTO "WorkspaceMember" (
  "id", "workspaceId", "userId", "email", "displayName", "role", "status",
  "joinedAt", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  workspace."id",
  workspace."ownerId",
  user_record."email",
  user_record."displayName",
  'OWNER',
  'ACTIVE',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Workspace" workspace
JOIN "User" user_record ON user_record."id" = workspace."ownerId"
LEFT JOIN "WorkspaceMember" member
  ON member."workspaceId" = workspace."id"
  AND member."userId" = workspace."ownerId"
WHERE member."id" IS NULL;

ALTER TABLE "ProjectKeyReservation" DROP CONSTRAINT "ProjectKeyReservation_projectId_fkey";

ALTER TABLE "ProjectMembership" DROP CONSTRAINT "ProjectMembership_projectId_fkey";

ALTER TABLE "Issue" DROP CONSTRAINT "Issue_projectId_fkey";

ALTER TABLE "Issue" DROP CONSTRAINT "Issue_parentId_fkey";

ALTER TABLE "Issue" DROP CONSTRAINT "Issue_epicId_fkey";

ALTER TABLE "Issue" DROP CONSTRAINT "Issue_sprintId_fkey";

ALTER TABLE "IssueDependency" DROP CONSTRAINT "IssueDependency_projectId_fkey";

ALTER TABLE "IssueDependency" DROP CONSTRAINT "IssueDependency_blockingIssueId_fkey";

ALTER TABLE "IssueDependency" DROP CONSTRAINT "IssueDependency_blockedIssueId_fkey";

ALTER TABLE "IssueComment" DROP CONSTRAINT "IssueComment_projectId_fkey";

ALTER TABLE "IssueComment" DROP CONSTRAINT "IssueComment_issueId_fkey";

ALTER TABLE "BoardConfig" DROP CONSTRAINT "BoardConfig_projectId_fkey";

ALTER TABLE "WorkflowStatus" DROP CONSTRAINT "WorkflowStatus_projectId_fkey";

ALTER TABLE "Sprint" DROP CONSTRAINT "Sprint_projectId_fkey";

ALTER TABLE "SprintScopeChange" DROP CONSTRAINT "SprintScopeChange_projectId_fkey";

ALTER TABLE "SprintScopeChange" DROP CONSTRAINT "SprintScopeChange_sprintId_fkey";

ALTER TABLE "SprintScopeChange" DROP CONSTRAINT "SprintScopeChange_issueId_fkey";

ALTER TABLE "SprintSnapshot" DROP CONSTRAINT "SprintSnapshot_projectId_fkey";

ALTER TABLE "SprintSnapshot" DROP CONSTRAINT "SprintSnapshot_sprintId_fkey";

ALTER TABLE "ProjectGoal" DROP CONSTRAINT "ProjectGoal_projectId_fkey";

ALTER TABLE "ProjectStatusUpdate" DROP CONSTRAINT "ProjectStatusUpdate_projectId_fkey";

ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_projectId_fkey";

ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_projectId_fkey";

ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_sprintId_fkey";

ALTER TABLE "MeetingAgendaItem" DROP CONSTRAINT "MeetingAgendaItem_projectId_fkey";

ALTER TABLE "MeetingAgendaItem" DROP CONSTRAINT "MeetingAgendaItem_meetingId_fkey";

ALTER TABLE "MeetingMinutes" DROP CONSTRAINT "MeetingMinutes_projectId_fkey";

ALTER TABLE "MeetingMinutes" DROP CONSTRAINT "MeetingMinutes_supersedesId_fkey";

ALTER TABLE "MeetingMinutesVersion" DROP CONSTRAINT "MeetingMinutesVersion_projectId_fkey";

ALTER TABLE "MeetingMinutesVersion" DROP CONSTRAINT "MeetingMinutesVersion_minutesId_fkey";

ALTER TABLE "Decision" DROP CONSTRAINT "Decision_projectId_fkey";

ALTER TABLE "Decision" DROP CONSTRAINT "Decision_meetingId_fkey";

ALTER TABLE "Decision" DROP CONSTRAINT "Decision_minutesId_fkey";

ALTER TABLE "Decision" DROP CONSTRAINT "Decision_supersedesId_fkey";

ALTER TABLE "ActionItem" DROP CONSTRAINT "ActionItem_projectId_fkey";

ALTER TABLE "ActionItem" DROP CONSTRAINT "ActionItem_sourceMeetingId_fkey";

ALTER TABLE "ActionItem" DROP CONSTRAINT "ActionItem_sourceMinutesId_fkey";

ALTER TABLE "ActionItem" DROP CONSTRAINT "ActionItem_sourceDecisionId_fkey";

ALTER TABLE "ActionItem" DROP CONSTRAINT "ActionItem_linkedIssueId_fkey";

ALTER TABLE "DocumentFolder" DROP CONSTRAINT "DocumentFolder_projectId_fkey";

ALTER TABLE "DocumentFolder" DROP CONSTRAINT "DocumentFolder_parentFolderId_fkey";

ALTER TABLE "ProjectDocument" DROP CONSTRAINT "ProjectDocument_projectId_fkey";

ALTER TABLE "ProjectDocument" DROP CONSTRAINT "ProjectDocument_folderId_fkey";

ALTER TABLE "DocumentVersion" DROP CONSTRAINT "DocumentVersion_projectId_fkey";

ALTER TABLE "DocumentVersion" DROP CONSTRAINT "DocumentVersion_documentId_fkey";

ALTER TABLE "Requirement" DROP CONSTRAINT "Requirement_projectId_fkey";

ALTER TABLE "Requirement" DROP CONSTRAINT "Requirement_sourceDocumentId_fkey";

ALTER TABLE "Retrospective" DROP CONSTRAINT "Retrospective_projectId_fkey";

ALTER TABLE "Retrospective" DROP CONSTRAINT "Retrospective_sprintId_fkey";

ALTER TABLE "Retrospective" DROP CONSTRAINT "Retrospective_meetingId_fkey";

ALTER TABLE "RetrospectiveFeedback" DROP CONSTRAINT "RetrospectiveFeedback_projectId_fkey";

ALTER TABLE "RetrospectiveFeedback" DROP CONSTRAINT "RetrospectiveFeedback_retrospectiveId_fkey";

ALTER TABLE "Risk" DROP CONSTRAINT "Risk_projectId_fkey";

ALTER TABLE "Stakeholder" DROP CONSTRAINT "Stakeholder_projectId_fkey";

ALTER TABLE "ChangeRequest" DROP CONSTRAINT "ChangeRequest_projectId_fkey";

ALTER TABLE "Integration" DROP CONSTRAINT "Integration_projectId_fkey";

ALTER TABLE "WebhookDelivery" DROP CONSTRAINT "WebhookDelivery_projectId_fkey";

ALTER TABLE "WebhookDelivery" DROP CONSTRAINT "WebhookDelivery_integrationId_fkey";

ALTER TABLE "ClientPortalItem" DROP CONSTRAINT "ClientPortalItem_projectId_fkey";

ALTER TABLE "StorageObject" DROP CONSTRAINT "StorageObject_projectId_fkey";

DROP INDEX "Issue_projectId_status_idx";

ALTER TABLE "Issue" ADD COLUMN "workflowStatusId" TEXT;
ALTER TABLE "Issue" ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "BoardConfig" ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "WorkflowStatus" ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "Sprint" ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "Meeting" ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "MeetingMinutes" ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "Decision" ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "ActionItem" ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "ProjectDocument" ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 1;

CREATE TABLE "WorkflowTransition" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fromStatusId" TEXT NOT NULL,
    "toStatusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowTransition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BoardColumn" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "boardConfigId" TEXT NOT NULL,
    "workflowStatusId" TEXT,
    "legacyId" TEXT,
    "name" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "BoardColumn_pkey" PRIMARY KEY ("id")
);

WITH default_statuses(name, category, rank, color) AS (
  VALUES
    ('BACKLOG', 'BACKLOG', '100', '#64748B'),
    ('SELECTED', 'BACKLOG', '200', '#64748B'),
    ('IN_PROGRESS', 'ACTIVE', '300', '#64748B'),
    ('REVIEW', 'ACTIVE', '400', '#64748B'),
    ('DONE', 'DONE', '500', '#64748B'),
    ('CANCELLED', 'DONE', '600', '#64748B')
)
INSERT INTO "WorkflowStatus" (
  "id", "workspaceId", "projectId", "name", "category", "rank", "color",
  "createdAt", "createdBy", "updatedAt", "updatedBy"
)
SELECT
  gen_random_uuid()::text,
  project."workspaceId",
  project."id",
  defaults.name,
  defaults.category::"StatusCategory",
  defaults.rank,
  defaults.color,
  project."createdAt",
  project."createdBy",
  project."updatedAt",
  project."updatedBy"
FROM "Project" project
CROSS JOIN default_statuses defaults
WHERE NOT EXISTS (
  SELECT 1 FROM "WorkflowStatus" existing
  WHERE existing."workspaceId" = project."workspaceId"
    AND existing."projectId" = project."id"
    AND existing."name" = defaults.name
);

UPDATE "Issue" issue
SET "workflowStatusId" = status."id"
FROM "WorkflowStatus" status
WHERE status."workspaceId" = issue."workspaceId"
  AND status."projectId" = issue."projectId"
  AND status."name" = issue."status"::text;

INSERT INTO "WorkflowTransition" (
  "id", "workspaceId", "projectId", "fromStatusId", "toStatusId", "createdAt"
)
SELECT DISTINCT
  gen_random_uuid()::text,
  source."workspaceId",
  source."projectId",
  source."id",
  target_id,
  CURRENT_TIMESTAMP
FROM "WorkflowStatus" source
CROSS JOIN LATERAL unnest(source."transitionsTo") target_id;

INSERT INTO "BoardColumn" (
  "id", "workspaceId", "projectId", "boardConfigId", "workflowStatusId", "legacyId",
  "name", "rank", "createdAt", "createdBy"
)
SELECT
  gen_random_uuid()::text,
  board."workspaceId",
  board."projectId",
  board."id",
  status."id",
  column_id,
  COALESCE(status."name", column_id),
  lpad(column_order::text, 8, '0'),
  board."createdAt",
  board."createdBy"
FROM "BoardConfig" board
CROSS JOIN LATERAL unnest(board."columnIds") WITH ORDINALITY AS columns(column_id, column_order)
LEFT JOIN "WorkflowStatus" status
  ON status."workspaceId" = board."workspaceId"
  AND status."projectId" = board."projectId"
  AND status."id" = column_id;

ALTER TABLE "Issue" ALTER COLUMN "workflowStatusId" SET NOT NULL;
ALTER TABLE "Issue" DROP COLUMN "status";
ALTER TABLE "BoardConfig" DROP COLUMN "columnIds";
ALTER TABLE "WorkflowStatus" DROP COLUMN "transitionsTo";
DROP TYPE "IssueStatus";

CREATE UNIQUE INDEX "WorkflowTransition_workspaceId_projectId_fromStatusId_toSta_key" ON "WorkflowTransition"("workspaceId", "projectId", "fromStatusId", "toStatusId");

CREATE INDEX "BoardColumn_workspaceId_projectId_rank_idx" ON "BoardColumn"("workspaceId", "projectId", "rank");

CREATE UNIQUE INDEX "BoardColumn_workspaceId_projectId_boardConfigId_workflowSta_key" ON "BoardColumn"("workspaceId", "projectId", "boardConfigId", "workflowStatusId");

CREATE UNIQUE INDEX "BoardColumn_workspaceId_projectId_boardConfigId_legacyId_key" ON "BoardColumn"("workspaceId", "projectId", "boardConfigId", "legacyId");

CREATE UNIQUE INDEX "ProjectKeyReservation_workspaceId_projectId_id_key" ON "ProjectKeyReservation"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "Project_workspaceId_key" ON "Project"("workspaceId");

CREATE UNIQUE INDEX "Project_workspaceId_id_key" ON "Project"("workspaceId", "id");

CREATE UNIQUE INDEX "ProjectMembership_workspaceId_projectId_id_key" ON "ProjectMembership"("workspaceId", "projectId", "id");

CREATE INDEX "Issue_projectId_workflowStatusId_idx" ON "Issue"("projectId", "workflowStatusId");

CREATE UNIQUE INDEX "Issue_workspaceId_projectId_id_key" ON "Issue"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "IssueDependency_workspaceId_projectId_id_key" ON "IssueDependency"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "IssueComment_workspaceId_projectId_id_key" ON "IssueComment"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "BoardConfig_workspaceId_projectId_id_key" ON "BoardConfig"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "WorkflowStatus_workspaceId_projectId_id_key" ON "WorkflowStatus"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "Sprint_workspaceId_projectId_id_key" ON "Sprint"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "SprintScopeChange_workspaceId_projectId_id_key" ON "SprintScopeChange"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "SprintSnapshot_workspaceId_projectId_id_key" ON "SprintSnapshot"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "ProjectGoal_workspaceId_projectId_id_key" ON "ProjectGoal"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "ProjectStatusUpdate_workspaceId_projectId_id_key" ON "ProjectStatusUpdate"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "Milestone_workspaceId_projectId_id_key" ON "Milestone"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "Meeting_workspaceId_projectId_id_key" ON "Meeting"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "MeetingAgendaItem_workspaceId_projectId_id_key" ON "MeetingAgendaItem"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "MeetingMinutes_workspaceId_projectId_id_key" ON "MeetingMinutes"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "MeetingMinutesVersion_workspaceId_projectId_id_key" ON "MeetingMinutesVersion"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "Decision_workspaceId_projectId_id_key" ON "Decision"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "ActionItem_workspaceId_projectId_id_key" ON "ActionItem"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "DocumentFolder_workspaceId_projectId_id_key" ON "DocumentFolder"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "ProjectDocument_workspaceId_projectId_id_key" ON "ProjectDocument"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "DocumentVersion_workspaceId_projectId_id_key" ON "DocumentVersion"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "Requirement_workspaceId_projectId_id_key" ON "Requirement"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "Retrospective_workspaceId_projectId_id_key" ON "Retrospective"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "RetrospectiveFeedback_workspaceId_projectId_id_key" ON "RetrospectiveFeedback"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "Risk_workspaceId_projectId_id_key" ON "Risk"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "Stakeholder_workspaceId_projectId_id_key" ON "Stakeholder"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "ChangeRequest_workspaceId_projectId_id_key" ON "ChangeRequest"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "Integration_workspaceId_projectId_id_key" ON "Integration"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "WebhookDelivery_workspaceId_projectId_id_key" ON "WebhookDelivery"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "ClientPortalItem_workspaceId_projectId_id_key" ON "ClientPortalItem"("workspaceId", "projectId", "id");

CREATE UNIQUE INDEX "WorkspaceMember_one_active_owner_per_workspace_key"
ON "WorkspaceMember"("workspaceId")
WHERE "role" = 'OWNER' AND "status" = 'ACTIVE';

CREATE UNIQUE INDEX "Sprint_one_active_per_project_key"
ON "Sprint"("projectId")
WHERE "status" = 'ACTIVE';

ALTER TABLE "ProjectKeyReservation" ADD CONSTRAINT "ProjectKeyReservation_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectMembership" ADD CONSTRAINT "ProjectMembership_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectMembership" ADD CONSTRAINT "ProjectMembership_workspaceId_userId_fkey" FOREIGN KEY ("workspaceId", "userId") REFERENCES "WorkspaceMember"("workspaceId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Issue" ADD CONSTRAINT "Issue_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Issue" ADD CONSTRAINT "Issue_workspaceId_projectId_workflowStatusId_fkey" FOREIGN KEY ("workspaceId", "projectId", "workflowStatusId") REFERENCES "WorkflowStatus"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Issue" ADD CONSTRAINT "Issue_workspaceId_projectId_parentId_fkey" FOREIGN KEY ("workspaceId", "projectId", "parentId") REFERENCES "Issue"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Issue" ADD CONSTRAINT "Issue_workspaceId_projectId_epicId_fkey" FOREIGN KEY ("workspaceId", "projectId", "epicId") REFERENCES "Issue"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Issue" ADD CONSTRAINT "Issue_workspaceId_projectId_sprintId_fkey" FOREIGN KEY ("workspaceId", "projectId", "sprintId") REFERENCES "Sprint"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "IssueDependency" ADD CONSTRAINT "IssueDependency_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IssueDependency" ADD CONSTRAINT "IssueDependency_workspaceId_projectId_blockingIssueId_fkey" FOREIGN KEY ("workspaceId", "projectId", "blockingIssueId") REFERENCES "Issue"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IssueDependency" ADD CONSTRAINT "IssueDependency_workspaceId_projectId_blockedIssueId_fkey" FOREIGN KEY ("workspaceId", "projectId", "blockedIssueId") REFERENCES "Issue"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IssueComment" ADD CONSTRAINT "IssueComment_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IssueComment" ADD CONSTRAINT "IssueComment_workspaceId_projectId_issueId_fkey" FOREIGN KEY ("workspaceId", "projectId", "issueId") REFERENCES "Issue"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BoardConfig" ADD CONSTRAINT "BoardConfig_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkflowStatus" ADD CONSTRAINT "WorkflowStatus_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkflowTransition" ADD CONSTRAINT "WorkflowTransition_workspaceId_projectId_fromStatusId_fkey" FOREIGN KEY ("workspaceId", "projectId", "fromStatusId") REFERENCES "WorkflowStatus"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkflowTransition" ADD CONSTRAINT "WorkflowTransition_workspaceId_projectId_toStatusId_fkey" FOREIGN KEY ("workspaceId", "projectId", "toStatusId") REFERENCES "WorkflowStatus"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BoardColumn" ADD CONSTRAINT "BoardColumn_workspaceId_projectId_boardConfigId_fkey" FOREIGN KEY ("workspaceId", "projectId", "boardConfigId") REFERENCES "BoardConfig"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BoardColumn" ADD CONSTRAINT "BoardColumn_workspaceId_projectId_workflowStatusId_fkey" FOREIGN KEY ("workspaceId", "projectId", "workflowStatusId") REFERENCES "WorkflowStatus"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SprintScopeChange" ADD CONSTRAINT "SprintScopeChange_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SprintScopeChange" ADD CONSTRAINT "SprintScopeChange_workspaceId_projectId_sprintId_fkey" FOREIGN KEY ("workspaceId", "projectId", "sprintId") REFERENCES "Sprint"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SprintScopeChange" ADD CONSTRAINT "SprintScopeChange_workspaceId_projectId_issueId_fkey" FOREIGN KEY ("workspaceId", "projectId", "issueId") REFERENCES "Issue"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SprintSnapshot" ADD CONSTRAINT "SprintSnapshot_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SprintSnapshot" ADD CONSTRAINT "SprintSnapshot_workspaceId_projectId_sprintId_fkey" FOREIGN KEY ("workspaceId", "projectId", "sprintId") REFERENCES "Sprint"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectGoal" ADD CONSTRAINT "ProjectGoal_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectStatusUpdate" ADD CONSTRAINT "ProjectStatusUpdate_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_workspaceId_projectId_sprintId_fkey" FOREIGN KEY ("workspaceId", "projectId", "sprintId") REFERENCES "Sprint"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MeetingAgendaItem" ADD CONSTRAINT "MeetingAgendaItem_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MeetingAgendaItem" ADD CONSTRAINT "MeetingAgendaItem_workspaceId_projectId_meetingId_fkey" FOREIGN KEY ("workspaceId", "projectId", "meetingId") REFERENCES "Meeting"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MeetingMinutes" ADD CONSTRAINT "MeetingMinutes_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MeetingMinutes" ADD CONSTRAINT "MeetingMinutes_workspaceId_projectId_supersedesId_fkey" FOREIGN KEY ("workspaceId", "projectId", "supersedesId") REFERENCES "MeetingMinutes"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MeetingMinutesVersion" ADD CONSTRAINT "MeetingMinutesVersion_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MeetingMinutesVersion" ADD CONSTRAINT "MeetingMinutesVersion_workspaceId_projectId_minutesId_fkey" FOREIGN KEY ("workspaceId", "projectId", "minutesId") REFERENCES "MeetingMinutes"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Decision" ADD CONSTRAINT "Decision_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Decision" ADD CONSTRAINT "Decision_workspaceId_projectId_meetingId_fkey" FOREIGN KEY ("workspaceId", "projectId", "meetingId") REFERENCES "Meeting"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Decision" ADD CONSTRAINT "Decision_workspaceId_projectId_minutesId_fkey" FOREIGN KEY ("workspaceId", "projectId", "minutesId") REFERENCES "MeetingMinutes"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Decision" ADD CONSTRAINT "Decision_workspaceId_projectId_supersedesId_fkey" FOREIGN KEY ("workspaceId", "projectId", "supersedesId") REFERENCES "Decision"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_workspaceId_projectId_sourceMeetingId_fkey" FOREIGN KEY ("workspaceId", "projectId", "sourceMeetingId") REFERENCES "Meeting"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_workspaceId_projectId_sourceMinutesId_fkey" FOREIGN KEY ("workspaceId", "projectId", "sourceMinutesId") REFERENCES "MeetingMinutes"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_workspaceId_projectId_sourceDecisionId_fkey" FOREIGN KEY ("workspaceId", "projectId", "sourceDecisionId") REFERENCES "Decision"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_workspaceId_projectId_linkedIssueId_fkey" FOREIGN KEY ("workspaceId", "projectId", "linkedIssueId") REFERENCES "Issue"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_workspaceId_projectId_parentFolderId_fkey" FOREIGN KEY ("workspaceId", "projectId", "parentFolderId") REFERENCES "DocumentFolder"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_workspaceId_projectId_folderId_fkey" FOREIGN KEY ("workspaceId", "projectId", "folderId") REFERENCES "DocumentFolder"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_workspaceId_projectId_documentId_fkey" FOREIGN KEY ("workspaceId", "projectId", "documentId") REFERENCES "ProjectDocument"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_workspaceId_projectId_sourceDocumentId_fkey" FOREIGN KEY ("workspaceId", "projectId", "sourceDocumentId") REFERENCES "ProjectDocument"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Retrospective" ADD CONSTRAINT "Retrospective_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Retrospective" ADD CONSTRAINT "Retrospective_workspaceId_projectId_sprintId_fkey" FOREIGN KEY ("workspaceId", "projectId", "sprintId") REFERENCES "Sprint"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Retrospective" ADD CONSTRAINT "Retrospective_workspaceId_projectId_meetingId_fkey" FOREIGN KEY ("workspaceId", "projectId", "meetingId") REFERENCES "Meeting"("workspaceId", "projectId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RetrospectiveFeedback" ADD CONSTRAINT "RetrospectiveFeedback_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RetrospectiveFeedback" ADD CONSTRAINT "RetrospectiveFeedback_workspaceId_projectId_retrospectiveI_fkey" FOREIGN KEY ("workspaceId", "projectId", "retrospectiveId") REFERENCES "Retrospective"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Risk" ADD CONSTRAINT "Risk_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Stakeholder" ADD CONSTRAINT "Stakeholder_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SavedFilter" ADD CONSTRAINT "SavedFilter_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Integration" ADD CONSTRAINT "Integration_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_workspaceId_projectId_integrationId_fkey" FOREIGN KEY ("workspaceId", "projectId", "integrationId") REFERENCES "Integration"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClientPortalItem" ADD CONSTRAINT "ClientPortalItem_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StorageObject" ADD CONSTRAINT "StorageObject_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "Project"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION "require_workspace_owner_membership"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  target_workspace_id TEXT;
  owner_user_id TEXT;
BEGIN
  IF TG_TABLE_NAME = 'Workspace' THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    target_workspace_id := NEW."id";
  ELSIF TG_OP = 'DELETE' THEN
    target_workspace_id := OLD."workspaceId";
  ELSE
    target_workspace_id := NEW."workspaceId";
  END IF;

  SELECT "ownerId" INTO owner_user_id
  FROM "Workspace"
  WHERE "id" = target_workspace_id;

  IF owner_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "WorkspaceMember"
    WHERE "workspaceId" = target_workspace_id
      AND "userId" = owner_user_id
      AND "role" = 'OWNER'
      AND "status" = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'workspace must have exactly one active owner membership';
  END IF;

  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER "Workspace_active_owner_membership_required"
AFTER INSERT OR UPDATE ON "Workspace"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "require_workspace_owner_membership"();

CREATE CONSTRAINT TRIGGER "WorkspaceMember_owner_membership_required"
AFTER INSERT OR UPDATE OR DELETE ON "WorkspaceMember"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "require_workspace_owner_membership"();

COMMIT;
