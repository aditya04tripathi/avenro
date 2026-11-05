export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      action_item: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          assignee_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string
          due_at: string | null
          id: string
          linked_issue_id: string | null
          project_id: string
          revision: number
          source_decision_id: string | null
          source_meeting_id: string | null
          source_minutes_id: string | null
          status: Database["public"]["Enums"]["action_item_status"]
          title: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string
          due_at?: string | null
          id?: string
          linked_issue_id?: string | null
          project_id: string
          revision?: number
          source_decision_id?: string | null
          source_meeting_id?: string | null
          source_minutes_id?: string | null
          status?: Database["public"]["Enums"]["action_item_status"]
          title: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string
          due_at?: string | null
          id?: string
          linked_issue_id?: string | null
          project_id?: string
          revision?: number
          source_decision_id?: string | null
          source_meeting_id?: string | null
          source_minutes_id?: string | null
          status?: Database["public"]["Enums"]["action_item_status"]
          title?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_item_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_item_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_item_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_item_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "action_item_workspace_id_project_id_linked_issue_id_fkey"
            columns: ["workspace_id", "project_id", "linked_issue_id"]
            isOneToOne: false
            referencedRelation: "issue"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "action_item_workspace_id_project_id_source_decision_id_fkey"
            columns: ["workspace_id", "project_id", "source_decision_id"]
            isOneToOne: false
            referencedRelation: "decision"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "action_item_workspace_id_project_id_source_meeting_id_fkey"
            columns: ["workspace_id", "project_id", "source_meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "action_item_workspace_id_project_id_source_minutes_id_fkey"
            columns: ["workspace_id", "project_id", "source_minutes_id"]
            isOneToOne: false
            referencedRelation: "meeting_minutes"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      activity_event: {
        Row: {
          action: string
          actor_id: string
          changes: NonNullable<Json>
          entity_id: string
          entity_type: string
          id: string
          occurred_at: string
          project_id: string | null
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          action: string
          actor_id: string
          changes: NonNullable<Json>
          entity_id: string
          entity_type: string
          id?: string
          occurred_at?: string
          project_id?: string | null
          workspace_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          changes?: NonNullable<Json>
          entity_id?: string
          entity_type?: string
          id?: string
          occurred_at?: string
          project_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_event_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_event_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_event_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      audit_event: {
        Row: {
          action: string
          actor_id: string
          entity_path: string
          id: string
          metadata: NonNullable<Json>
          occurred_at: string
          project_id: string | null
          request_id: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          action: string
          actor_id: string
          entity_path: string
          id?: string
          metadata: NonNullable<Json>
          occurred_at?: string
          project_id?: string | null
          request_id: string
          workspace_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          entity_path?: string
          id?: string
          metadata?: NonNullable<Json>
          occurred_at?: string
          project_id?: string | null
          request_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_event_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_event_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_event_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      board_column: {
        Row: {
          board_config_id: string
          created_at: string
          created_by: string
          id: string
          legacy_id: string | null
          name: string
          project_id: string
          rank: string
          workflow_status_id: string | null
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          board_config_id: string
          created_at?: string
          created_by: string
          id?: string
          legacy_id?: string | null
          name: string
          project_id: string
          rank: string
          workflow_status_id?: string | null
          workspace_id: string
        }
        Update: {
          board_config_id?: string
          created_at?: string
          created_by?: string
          id?: string
          legacy_id?: string | null
          name?: string
          project_id?: string
          rank?: string
          workflow_status_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_column_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_column_workspace_id_project_id_board_config_id_fkey"
            columns: ["workspace_id", "project_id", "board_config_id"]
            isOneToOne: false
            referencedRelation: "board_config"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "board_column_workspace_id_project_id_workflow_status_id_fkey"
            columns: ["workspace_id", "project_id", "workflow_status_id"]
            isOneToOne: false
            referencedRelation: "workflow_status"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      board_config: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string
          filter: NonNullable<Json>
          id: string
          kind: Database["public"]["Enums"]["board_kind"]
          name: string
          project_id: string
          revision: number
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by: string
          filter: NonNullable<Json>
          id?: string
          kind: Database["public"]["Enums"]["board_kind"]
          name: string
          project_id: string
          revision?: number
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string
          filter?: NonNullable<Json>
          id?: string
          kind?: Database["public"]["Enums"]["board_kind"]
          name?: string
          project_id?: string
          revision?: number
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_config_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_config_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      change_request: {
        Row: {
          approver_id: string | null
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string
          decision_at: string | null
          description: string
          id: string
          linked_issue_ids: string[] | null
          project_id: string
          requester_id: string
          status: Database["public"]["Enums"]["change_request_status"]
          title: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          approver_id?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by: string
          decision_at?: string | null
          description: string
          id?: string
          linked_issue_ids?: string[] | null
          project_id: string
          requester_id: string
          status?: Database["public"]["Enums"]["change_request_status"]
          title: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          approver_id?: string | null
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string
          decision_at?: string | null
          description?: string
          id?: string
          linked_issue_ids?: string[] | null
          project_id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["change_request_status"]
          title?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_request_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_request_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_request_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_request_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_request_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      client_portal_item: {
        Row: {
          content: NonNullable<Json>
          id: string
          project_id: string
          published_at: string
          published_by: string
          source_collection: string
          source_id: string
          source_updated_at: string
          status: Database["public"]["Enums"]["portal_status"]
          summary: string
          title: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          content: NonNullable<Json>
          id?: string
          project_id: string
          published_at?: string
          published_by: string
          source_collection: string
          source_id: string
          source_updated_at: string
          status?: Database["public"]["Enums"]["portal_status"]
          summary: string
          title: string
          workspace_id: string
        }
        Update: {
          content?: NonNullable<Json>
          id?: string
          project_id?: string
          published_at?: string
          published_by?: string
          source_collection?: string
          source_id?: string
          source_updated_at?: string
          status?: Database["public"]["Enums"]["portal_status"]
          summary?: string
          title?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_item_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_item_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      decision: {
        Row: {
          approver_ids: string[] | null
          context: string
          created_at: string
          created_by: string
          decided_at: string | null
          id: string
          linked_record_ids: string[] | null
          meeting_id: string | null
          minutes_id: string | null
          project_id: string
          rationale: string
          revision: number
          status: Database["public"]["Enums"]["decision_status"]
          supersedes_id: string | null
          title: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          approver_ids?: string[] | null
          context: string
          created_at?: string
          created_by: string
          decided_at?: string | null
          id?: string
          linked_record_ids?: string[] | null
          meeting_id?: string | null
          minutes_id?: string | null
          project_id: string
          rationale: string
          revision?: number
          status?: Database["public"]["Enums"]["decision_status"]
          supersedes_id?: string | null
          title: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          approver_ids?: string[] | null
          context?: string
          created_at?: string
          created_by?: string
          decided_at?: string | null
          id?: string
          linked_record_ids?: string[] | null
          meeting_id?: string | null
          minutes_id?: string | null
          project_id?: string
          rationale?: string
          revision?: number
          status?: Database["public"]["Enums"]["decision_status"]
          supersedes_id?: string | null
          title?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decision_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decision_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decision_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "decision_workspace_id_project_id_meeting_id_fkey"
            columns: ["workspace_id", "project_id", "meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "decision_workspace_id_project_id_minutes_id_fkey"
            columns: ["workspace_id", "project_id", "minutes_id"]
            isOneToOne: false
            referencedRelation: "meeting_minutes"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "decision_workspace_id_project_id_supersedes_id_fkey"
            columns: ["workspace_id", "project_id", "supersedes_id"]
            isOneToOne: false
            referencedRelation: "decision"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      document_folder: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          parent_folder_id: string | null
          project_id: string
          rank: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          parent_folder_id?: string | null
          project_id: string
          rank: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          parent_folder_id?: string | null
          project_id?: string
          rank?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_folder_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folder_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folder_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "document_folder_workspace_id_project_id_parent_folder_id_fkey"
            columns: ["workspace_id", "project_id", "parent_folder_id"]
            isOneToOne: false
            referencedRelation: "document_folder"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      document_version: {
        Row: {
          body: string
          created_at: string
          created_by: string
          document_id: string
          id: string
          project_id: string
          title: string
          version: number
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          body: string
          created_at?: string
          created_by: string
          document_id: string
          id?: string
          project_id: string
          title: string
          version: number
          workspace_id: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          document_id?: string
          id?: string
          project_id?: string
          title?: string
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_version_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_version_workspace_id_project_id_document_id_fkey"
            columns: ["workspace_id", "project_id", "document_id"]
            isOneToOne: false
            referencedRelation: "project_document"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "document_version_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      integration: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          connected_by: string
          created_at: string
          created_by: string
          external_id: string
          id: string
          project_id: string
          provider: Database["public"]["Enums"]["integration_provider"]
          secret_ref: string | null
          settings: NonNullable<Json>
          status: Database["public"]["Enums"]["integration_status"]
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          connected_by: string
          created_at?: string
          created_by: string
          external_id: string
          id?: string
          project_id: string
          provider: Database["public"]["Enums"]["integration_provider"]
          secret_ref?: string | null
          settings: NonNullable<Json>
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          connected_by?: string
          created_at?: string
          created_by?: string
          external_id?: string
          id?: string
          project_id?: string
          provider?: Database["public"]["Enums"]["integration_provider"]
          secret_ref?: string | null
          settings?: NonNullable<Json>
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_connected_by_fkey"
            columns: ["connected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      issue: {
        Row: {
          acceptance_criteria: string[] | null
          archived_at: string | null
          archived_by: string | null
          assignee_id: string | null
          created_at: string
          created_by: string
          description: string
          due_at: string | null
          epic_id: string | null
          estimate: number | null
          id: string
          key: string
          labels: string[] | null
          number: number
          parent_id: string | null
          priority: Database["public"]["Enums"]["priority"]
          project_id: string
          rank: string
          reporter_id: string
          revision: number
          sprint_id: string | null
          title: string
          type: Database["public"]["Enums"]["issue_type"]
          updated_at: string
          updated_by: string
          workflow_status_id: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          acceptance_criteria?: string[] | null
          archived_at?: string | null
          archived_by?: string | null
          assignee_id?: string | null
          created_at?: string
          created_by: string
          description?: string
          due_at?: string | null
          epic_id?: string | null
          estimate?: number | null
          id?: string
          key: string
          labels?: string[] | null
          number: number
          parent_id?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          project_id: string
          rank: string
          reporter_id: string
          revision?: number
          sprint_id?: string | null
          title: string
          type: Database["public"]["Enums"]["issue_type"]
          updated_at?: string
          updated_by: string
          workflow_status_id: string
          workspace_id: string
        }
        Update: {
          acceptance_criteria?: string[] | null
          archived_at?: string | null
          archived_by?: string | null
          assignee_id?: string | null
          created_at?: string
          created_by?: string
          description?: string
          due_at?: string | null
          epic_id?: string | null
          estimate?: number | null
          id?: string
          key?: string
          labels?: string[] | null
          number?: number
          parent_id?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          project_id?: string
          rank?: string
          reporter_id?: string
          revision?: number
          sprint_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["issue_type"]
          updated_at?: string
          updated_by?: string
          workflow_status_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_workspace_id_project_id_epic_id_fkey"
            columns: ["workspace_id", "project_id", "epic_id"]
            isOneToOne: false
            referencedRelation: "issue"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "issue_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "issue_workspace_id_project_id_parent_id_fkey"
            columns: ["workspace_id", "project_id", "parent_id"]
            isOneToOne: false
            referencedRelation: "issue"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "issue_workspace_id_project_id_sprint_id_fkey"
            columns: ["workspace_id", "project_id", "sprint_id"]
            isOneToOne: false
            referencedRelation: "sprint"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "issue_workspace_id_project_id_workflow_status_id_fkey"
            columns: ["workspace_id", "project_id", "workflow_status_id"]
            isOneToOne: false
            referencedRelation: "workflow_status"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      issue_comment: {
        Row: {
          author_id: string
          body: string
          created_at: string
          created_by: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          issue_id: string
          project_id: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          author_id: string
          body: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          issue_id: string
          project_id: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          issue_id?: string
          project_id?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_comment_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_comment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_comment_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_comment_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "issue_comment_workspace_id_project_id_issue_id_fkey"
            columns: ["workspace_id", "project_id", "issue_id"]
            isOneToOne: false
            referencedRelation: "issue"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      issue_dependency: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          blocked_issue_id: string
          blocking_issue_id: string
          created_at: string
          created_by: string
          id: string
          project_id: string
          type: Database["public"]["Enums"]["issue_dependency_type"]
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          blocked_issue_id: string
          blocking_issue_id: string
          created_at?: string
          created_by: string
          id?: string
          project_id: string
          type: Database["public"]["Enums"]["issue_dependency_type"]
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          blocked_issue_id?: string
          blocking_issue_id?: string
          created_at?: string
          created_by?: string
          id?: string
          project_id?: string
          type?: Database["public"]["Enums"]["issue_dependency_type"]
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_dependency_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_dependency_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_dependency_workspace_id_project_id_blocked_issue_id_fkey"
            columns: ["workspace_id", "project_id", "blocked_issue_id"]
            isOneToOne: false
            referencedRelation: "issue"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "issue_dependency_workspace_id_project_id_blocking_issue_id_fkey"
            columns: ["workspace_id", "project_id", "blocking_issue_id"]
            isOneToOne: false
            referencedRelation: "issue"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "issue_dependency_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      legal_acceptances: {
        Row: {
          accepted_at: string
          document_slug: string
          document_version: string
          id: string
          profile_id: string
        }
        ComputedFields: never
        Insert: {
          accepted_at?: string
          document_slug: string
          document_version: string
          id?: string
          profile_id: string
        }
        Update: {
          accepted_at?: string
          document_slug?: string
          document_version?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_acceptances_document_slug_document_version_fkey"
            columns: ["document_slug", "document_version"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["slug", "version"]
          },
          {
            foreignKeyName: "legal_acceptances_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          published_at: string
          slug: string
          version: string
        }
        ComputedFields: never
        Insert: {
          published_at: string
          slug: string
          version: string
        }
        Update: {
          published_at?: string
          slug?: string
          version?: string
        }
        Relationships: []
      }
      marketing_consents: {
        Row: {
          opted_in: boolean
          opted_in_at: string | null
          opted_out_at: string | null
          profile_id: string
          source: string | null
        }
        ComputedFields: never
        Insert: {
          opted_in?: boolean
          opted_in_at?: string | null
          opted_out_at?: string | null
          profile_id: string
          source?: string | null
        }
        Update: {
          opted_in?: boolean
          opted_in_at?: string | null
          opted_out_at?: string | null
          profile_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_consents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string
          ends_at: string
          facilitator_id: string | null
          id: string
          location: string
          meeting_url: string | null
          minute_taker_id: string | null
          organizer_id: string
          participant_ids: string[] | null
          project_id: string
          revision: number
          sprint_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["meeting_status"]
          title: string
          type: Database["public"]["Enums"]["meeting_type"]
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by: string
          ends_at: string
          facilitator_id?: string | null
          id?: string
          location?: string
          meeting_url?: string | null
          minute_taker_id?: string | null
          organizer_id: string
          participant_ids?: string[] | null
          project_id: string
          revision?: number
          sprint_id?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["meeting_status"]
          title: string
          type: Database["public"]["Enums"]["meeting_type"]
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string
          ends_at?: string
          facilitator_id?: string | null
          id?: string
          location?: string
          meeting_url?: string | null
          minute_taker_id?: string | null
          organizer_id?: string
          participant_ids?: string[] | null
          project_id?: string
          revision?: number
          sprint_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["meeting_status"]
          title?: string
          type?: Database["public"]["Enums"]["meeting_type"]
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_minute_taker_id_fkey"
            columns: ["minute_taker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "meeting_workspace_id_project_id_sprint_id_fkey"
            columns: ["workspace_id", "project_id", "sprint_id"]
            isOneToOne: false
            referencedRelation: "sprint"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      meeting_agenda_item: {
        Row: {
          created_at: string
          created_by: string
          description: string
          duration_minutes: number | null
          id: string
          meeting_id: string
          presenter_id: string | null
          project_id: string
          rank: string
          title: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          created_by: string
          description?: string
          duration_minutes?: number | null
          id?: string
          meeting_id: string
          presenter_id?: string | null
          project_id: string
          rank: string
          title: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          duration_minutes?: number | null
          id?: string
          meeting_id?: string
          presenter_id?: string | null
          project_id?: string
          rank?: string
          title?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_agenda_item_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_agenda_item_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_agenda_item_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "meeting_agenda_item_workspace_id_project_id_meeting_id_fkey"
            columns: ["workspace_id", "project_id", "meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      meeting_minutes: {
        Row: {
          attendance: NonNullable<Json>
          created_at: string
          created_by: string
          finalized_at: string | null
          finalized_by: string | null
          id: string
          meeting_id: string
          project_id: string
          revision: number
          status: Database["public"]["Enums"]["minutes_status"]
          summary: string
          supersedes_id: string | null
          updated_at: string
          updated_by: string
          version: number
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          attendance: NonNullable<Json>
          created_at?: string
          created_by: string
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          meeting_id: string
          project_id: string
          revision?: number
          status?: Database["public"]["Enums"]["minutes_status"]
          summary: string
          supersedes_id?: string | null
          updated_at?: string
          updated_by: string
          version?: number
          workspace_id: string
        }
        Update: {
          attendance?: NonNullable<Json>
          created_at?: string
          created_by?: string
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          meeting_id?: string
          project_id?: string
          revision?: number
          status?: Database["public"]["Enums"]["minutes_status"]
          summary?: string
          supersedes_id?: string | null
          updated_at?: string
          updated_by?: string
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_minutes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_minutes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_minutes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_minutes_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "meeting_minutes_workspace_id_project_id_supersedes_id_fkey"
            columns: ["workspace_id", "project_id", "supersedes_id"]
            isOneToOne: false
            referencedRelation: "meeting_minutes"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      meeting_minutes_version: {
        Row: {
          created_at: string
          created_by: string
          id: string
          minutes_id: string
          project_id: string
          snapshot: NonNullable<Json>
          version: number
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          minutes_id: string
          project_id: string
          snapshot: NonNullable<Json>
          version: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          minutes_id?: string
          project_id?: string
          snapshot?: NonNullable<Json>
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_minutes_version_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_minutes_version_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "meeting_minutes_version_workspace_id_project_id_minutes_id_fkey"
            columns: ["workspace_id", "project_id", "minutes_id"]
            isOneToOne: false
            referencedRelation: "meeting_minutes"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      milestone: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string
          due_at: string | null
          id: string
          issue_ids: string[] | null
          project_id: string
          status: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string
          due_at?: string | null
          id?: string
          issue_ids?: string[] | null
          project_id: string
          status?: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string
          due_at?: string | null
          id?: string
          issue_ids?: string[] | null
          project_id?: string
          status?: Database["public"]["Enums"]["milestone_status"]
          title?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      notification: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          target_path: string | null
          title: string
          type: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          target_path?: string | null
          title: string
          type: string
          workspace_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          target_path?: string | null
          title?: string
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_requests: {
        Row: {
          completed_at: string | null
          due_at: string
          id: string
          kind: string
          notes: string | null
          profile_id: string | null
          received_at: string
          status: string
        }
        ComputedFields: never
        Insert: {
          completed_at?: string | null
          due_at?: string
          id?: string
          kind: string
          notes?: string | null
          profile_id?: string | null
          received_at?: string
          status: string
        }
        Update: {
          completed_at?: string | null
          due_at?: string
          id?: string
          kind?: string
          notes?: string | null
          profile_id?: string | null
          received_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "privacy_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_confirmed_at: string | null
          created_at: string
          deleted_at: string | null
          display_name: string
          id: string
          onboarded_at: string | null
          photo_url: string | null
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          age_confirmed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id?: string
          onboarded_at?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          age_confirmed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id?: string
          onboarded_at?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          key: string
          lead_id: string
          name: string
          next_issue_number: number
          objective: string
          status: Database["public"]["Enums"]["project_status"]
          template: Database["public"]["Enums"]["project_template"]
          timezone: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by: string
          description?: string
          id?: string
          key: string
          lead_id: string
          name: string
          next_issue_number?: number
          objective?: string
          status?: Database["public"]["Enums"]["project_status"]
          template?: Database["public"]["Enums"]["project_template"]
          timezone?: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          key?: string
          lead_id?: string
          name?: string
          next_issue_number?: number
          objective?: string
          status?: Database["public"]["Enums"]["project_status"]
          template?: Database["public"]["Enums"]["project_template"]
          timezone?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      project_document: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          body: string
          created_at: string
          created_by: string
          current_version: number
          folder_id: string | null
          id: string
          project_id: string
          revision: number
          status: Database["public"]["Enums"]["document_status"]
          title: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          body: string
          created_at?: string
          created_by: string
          current_version?: number
          folder_id?: string | null
          id?: string
          project_id: string
          revision?: number
          status?: Database["public"]["Enums"]["document_status"]
          title: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          body?: string
          created_at?: string
          created_by?: string
          current_version?: number
          folder_id?: string | null
          id?: string
          project_id?: string
          revision?: number
          status?: Database["public"]["Enums"]["document_status"]
          title?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_document_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_document_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_document_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "project_document_workspace_id_project_id_folder_id_fkey"
            columns: ["workspace_id", "project_id", "folder_id"]
            isOneToOne: false
            referencedRelation: "document_folder"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      project_goal: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          owner_id: string | null
          project_id: string
          status: Database["public"]["Enums"]["goal_status"]
          target_at: string | null
          title: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by: string
          description?: string
          id?: string
          owner_id?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_at?: string | null
          title: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          owner_id?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_at?: string | null
          title?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_goal_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_goal_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_goal_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_goal_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      project_key_reservation: {
        Row: {
          created_at: string
          created_by: string
          id: string
          key: string
          project_id: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          key: string
          project_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          key?: string
          project_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_key_reservation_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_key_reservation_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_key_reservation_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      project_membership: {
        Row: {
          created_at: string
          created_by: string
          id: string
          project_id: string
          roles: Database["public"]["Enums"]["project_role"][] | null
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          updated_by: string
          user_id: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          project_id: string
          roles?: Database["public"]["Enums"]["project_role"][] | null
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          updated_by: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          project_id?: string
          roles?: Database["public"]["Enums"]["project_role"][] | null
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          updated_by?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_membership_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_membership_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_membership_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_membership_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "project_membership_workspace_id_user_id_fkey"
            columns: ["workspace_id", "user_id"]
            isOneToOne: false
            referencedRelation: "workspace_member"
            referencedColumns: ["workspace_id", "user_id"]
          },
        ]
      }
      project_status_update: {
        Row: {
          accomplishments: string[] | null
          author_id: string
          created_at: string
          created_by: string
          id: string
          project_id: string
          reported_at: string
          risks: string[] | null
          status: Database["public"]["Enums"]["health_status"]
          summary: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          accomplishments?: string[] | null
          author_id: string
          created_at?: string
          created_by: string
          id?: string
          project_id: string
          reported_at?: string
          risks?: string[] | null
          status: Database["public"]["Enums"]["health_status"]
          summary: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          accomplishments?: string[] | null
          author_id?: string
          created_at?: string
          created_by?: string
          id?: string
          project_id?: string
          reported_at?: string
          risks?: string[] | null
          status?: Database["public"]["Enums"]["health_status"]
          summary?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_status_update_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_status_update_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_status_update_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_status_update_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      requirement: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          key: string
          kind: Database["public"]["Enums"]["requirement_kind"]
          linked_issue_ids: string[] | null
          priority: Database["public"]["Enums"]["priority"]
          project_id: string
          source_document_id: string | null
          status: Database["public"]["Enums"]["requirement_status"]
          title: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by: string
          description: string
          id?: string
          key: string
          kind: Database["public"]["Enums"]["requirement_kind"]
          linked_issue_ids?: string[] | null
          priority?: Database["public"]["Enums"]["priority"]
          project_id: string
          source_document_id?: string | null
          status?: Database["public"]["Enums"]["requirement_status"]
          title: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          key?: string
          kind?: Database["public"]["Enums"]["requirement_kind"]
          linked_issue_ids?: string[] | null
          priority?: Database["public"]["Enums"]["priority"]
          project_id?: string
          source_document_id?: string | null
          status?: Database["public"]["Enums"]["requirement_status"]
          title?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirement_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "requirement_workspace_id_project_id_source_document_id_fkey"
            columns: ["workspace_id", "project_id", "source_document_id"]
            isOneToOne: false
            referencedRelation: "project_document"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      retrospective: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          closed_at: string | null
          created_at: string
          created_by: string
          facilitator_id: string
          id: string
          meeting_id: string | null
          project_id: string
          sprint_id: string
          status: Database["public"]["Enums"]["retrospective_status"]
          template: Database["public"]["Enums"]["retrospective_template"]
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          closed_at?: string | null
          created_at?: string
          created_by: string
          facilitator_id: string
          id?: string
          meeting_id?: string | null
          project_id: string
          sprint_id: string
          status?: Database["public"]["Enums"]["retrospective_status"]
          template?: Database["public"]["Enums"]["retrospective_template"]
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string
          facilitator_id?: string
          id?: string
          meeting_id?: string | null
          project_id?: string
          sprint_id?: string
          status?: Database["public"]["Enums"]["retrospective_status"]
          template?: Database["public"]["Enums"]["retrospective_template"]
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retrospective_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospective_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospective_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospective_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "retrospective_workspace_id_project_id_meeting_id_fkey"
            columns: ["workspace_id", "project_id", "meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "retrospective_workspace_id_project_id_sprint_id_fkey"
            columns: ["workspace_id", "project_id", "sprint_id"]
            isOneToOne: false
            referencedRelation: "sprint"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      retrospective_feedback: {
        Row: {
          anonymous: boolean
          author_id: string | null
          body: string
          category: Database["public"]["Enums"]["feedback_category"]
          created_at: string
          created_by: string
          id: string
          project_id: string
          retrospective_id: string
          updated_at: string
          updated_by: string
          vote_count: number
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          anonymous?: boolean
          author_id?: string | null
          body: string
          category: Database["public"]["Enums"]["feedback_category"]
          created_at?: string
          created_by: string
          id?: string
          project_id: string
          retrospective_id: string
          updated_at?: string
          updated_by: string
          vote_count?: number
          workspace_id: string
        }
        Update: {
          anonymous?: boolean
          author_id?: string | null
          body?: string
          category?: Database["public"]["Enums"]["feedback_category"]
          created_at?: string
          created_by?: string
          id?: string
          project_id?: string
          retrospective_id?: string
          updated_at?: string
          updated_by?: string
          vote_count?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retrospective_feedback_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospective_feedback_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospective_feedback_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospective_feedback_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "retrospective_feedback_workspace_id_project_id_retrospective_i_"
            columns: ["workspace_id", "project_id", "retrospective_id"]
            isOneToOne: false
            referencedRelation: "retrospective"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      risk: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          impact: number
          mitigation_plan: string
          owner_id: string | null
          probability: number
          project_id: string
          review_at: string | null
          status: Database["public"]["Enums"]["risk_status"]
          title: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by: string
          description: string
          id?: string
          impact: number
          mitigation_plan?: string
          owner_id?: string | null
          probability: number
          project_id: string
          review_at?: string | null
          status?: Database["public"]["Enums"]["risk_status"]
          title: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          impact?: number
          mitigation_plan?: string
          owner_id?: string | null
          probability?: number
          project_id?: string
          review_at?: string | null
          status?: Database["public"]["Enums"]["risk_status"]
          title?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      saved_filter: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          owner_id: string
          project_id: string | null
          query: NonNullable<Json>
          shared: boolean
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          owner_id: string
          project_id?: string | null
          query: NonNullable<Json>
          shared?: boolean
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          owner_id?: string
          project_id?: string | null
          query?: NonNullable<Json>
          shared?: boolean
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_filter_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_filter_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_filter_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_filter_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_filter_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      sprint: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          committed_at: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          end_at: string | null
          goal: string
          id: string
          name: string
          project_id: string
          revision: number
          start_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["sprint_status"]
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          committed_at?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          end_at?: string | null
          goal?: string
          id?: string
          name: string
          project_id: string
          revision?: number
          start_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["sprint_status"]
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          committed_at?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          end_at?: string | null
          goal?: string
          id?: string
          name?: string
          project_id?: string
          revision?: number
          start_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["sprint_status"]
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      sprint_scope_change: {
        Row: {
          actor_id: string
          change: Database["public"]["Enums"]["scope_change_type"]
          id: string
          issue_id: string
          occurred_at: string
          project_id: string
          sprint_id: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          actor_id: string
          change: Database["public"]["Enums"]["scope_change_type"]
          id?: string
          issue_id: string
          occurred_at?: string
          project_id: string
          sprint_id: string
          workspace_id: string
        }
        Update: {
          actor_id?: string
          change?: Database["public"]["Enums"]["scope_change_type"]
          id?: string
          issue_id?: string
          occurred_at?: string
          project_id?: string
          sprint_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_scope_change_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "sprint_scope_change_workspace_id_project_id_issue_id_fkey"
            columns: ["workspace_id", "project_id", "issue_id"]
            isOneToOne: false
            referencedRelation: "issue"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "sprint_scope_change_workspace_id_project_id_sprint_id_fkey"
            columns: ["workspace_id", "project_id", "sprint_id"]
            isOneToOne: false
            referencedRelation: "sprint"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      sprint_snapshot: {
        Row: {
          completed_issue_ids: string[] | null
          goal: string
          id: string
          issue_ids: string[] | null
          project_id: string
          snapshot_at: string
          sprint_id: string
          story_points_committed: number
          story_points_completed: number
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          completed_issue_ids?: string[] | null
          goal: string
          id?: string
          issue_ids?: string[] | null
          project_id: string
          snapshot_at?: string
          sprint_id: string
          story_points_committed: number
          story_points_completed: number
          workspace_id: string
        }
        Update: {
          completed_issue_ids?: string[] | null
          goal?: string
          id?: string
          issue_ids?: string[] | null
          project_id?: string
          snapshot_at?: string
          sprint_id?: string
          story_points_committed?: number
          story_points_completed?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_snapshot_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "sprint_snapshot_workspace_id_project_id_sprint_id_fkey"
            columns: ["workspace_id", "project_id", "sprint_id"]
            isOneToOne: false
            referencedRelation: "sprint"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      stakeholder: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string
          email: string | null
          id: string
          influence: Database["public"]["Enums"]["influence_level"]
          interest: Database["public"]["Enums"]["interest_level"]
          name: string
          organisation: string
          project_id: string
          role: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          influence?: Database["public"]["Enums"]["influence_level"]
          interest?: Database["public"]["Enums"]["interest_level"]
          name: string
          organisation: string
          project_id: string
          role: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          influence?: Database["public"]["Enums"]["influence_level"]
          interest?: Database["public"]["Enums"]["interest_level"]
          name?: string
          organisation?: string
          project_id?: string
          role?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      storage_object: {
        Row: {
          archived_at: string | null
          bucket: string
          content_type: string
          created_at: string
          etag: string | null
          file_name: string
          id: string
          key: string
          project_id: string | null
          size_bytes: number
          updated_at: string
          uploader_id: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          bucket: string
          content_type: string
          created_at?: string
          etag?: string | null
          file_name: string
          id?: string
          key: string
          project_id?: string | null
          size_bytes: number
          updated_at?: string
          uploader_id: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          bucket?: string
          content_type?: string
          created_at?: string
          etag?: string | null
          file_name?: string
          id?: string
          key?: string
          project_id?: string | null
          size_bytes?: number
          updated_at?: string
          uploader_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_object_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_object_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_object_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      webhook_delivery: {
        Row: {
          attempts: number
          completed_at: string | null
          event_type: string
          id: string
          idempotency_key: string
          integration_id: string
          project_id: string
          received_at: string
          status: Database["public"]["Enums"]["webhook_status"]
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          attempts?: number
          completed_at?: string | null
          event_type: string
          id?: string
          idempotency_key: string
          integration_id: string
          project_id: string
          received_at?: string
          status?: Database["public"]["Enums"]["webhook_status"]
          workspace_id: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          event_type?: string
          id?: string
          idempotency_key?: string
          integration_id?: string
          project_id?: string
          received_at?: string
          status?: Database["public"]["Enums"]["webhook_status"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_delivery_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "webhook_delivery_workspace_id_project_id_integration_id_fkey"
            columns: ["workspace_id", "project_id", "integration_id"]
            isOneToOne: false
            referencedRelation: "integration"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      workflow_status: {
        Row: {
          category: Database["public"]["Enums"]["status_category"]
          color: string
          created_at: string
          created_by: string
          id: string
          name: string
          project_id: string
          rank: string
          revision: number
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          category: Database["public"]["Enums"]["status_category"]
          color: string
          created_at?: string
          created_by: string
          id?: string
          name: string
          project_id: string
          rank: string
          revision?: number
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["status_category"]
          color?: string
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          project_id?: string
          rank?: string
          revision?: number
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_status_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_status_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_status_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      workflow_transition: {
        Row: {
          created_at: string
          from_status_id: string
          id: string
          project_id: string
          to_status_id: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          from_status_id: string
          id?: string
          project_id: string
          to_status_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          from_status_id?: string
          id?: string
          project_id?: string
          to_status_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_transition_workspace_id_project_id_from_status_id_fkey"
            columns: ["workspace_id", "project_id", "from_status_id"]
            isOneToOne: false
            referencedRelation: "workflow_status"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
          {
            foreignKeyName: "workflow_transition_workspace_id_project_id_to_status_id_fkey"
            columns: ["workspace_id", "project_id", "to_status_id"]
            isOneToOne: false
            referencedRelation: "workflow_status"
            referencedColumns: ["workspace_id", "project_id", "id"]
          },
        ]
      }
      workspace: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          name: string
          owner_id: string
          slug: string
          status: Database["public"]["Enums"]["workspace_status"]
          updated_at: string
          updated_by: string
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by: string
          description?: string
          id?: string
          name: string
          owner_id: string
          slug: string
          status?: Database["public"]["Enums"]["workspace_status"]
          updated_at?: string
          updated_by: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          status?: Database["public"]["Enums"]["workspace_status"]
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invitation: {
        Row: {
          accepted_by: string | null
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          updated_at: string
          updated_by: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          accepted_by?: string | null
          created_at?: string
          created_by: string
          email: string
          expires_at: string
          id?: string
          role: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          updated_at?: string
          updated_by: string
          workspace_id: string
        }
        Update: {
          accepted_by?: string | null
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash?: string
          updated_at?: string
          updated_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitation_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_invitation_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_invitation_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_member: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
          invited_by: string | null
          joined_at: string | null
          role: Database["public"]["Enums"]["workspace_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
          workspace_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          display_name: string
          email: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_member_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_member_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_current_terms: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_onboarding: {
        Args: {
          p_age_confirmed?: boolean
          p_marketing_opt_in?: boolean
          p_privacy_version: string
          p_terms_version: string
        }
        Returns: undefined
      }
      export_my_data: { Args: Record<PropertyKey, never>; Returns: Json }
      prepare_account_deletion: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      set_marketing_consent: {
        Args: { p_opted_in: boolean; p_source: string }
        Returns: undefined
      }
      uuid_generate_v7: { Args: Record<PropertyKey, never>; Returns: string }
    }
    Enums: {
      action_item_status:
        "OPEN" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" | "CANCELLED"
      board_kind: "SCRUM" | "KANBAN"
      change_request_status:
        "PROPOSED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "IMPLEMENTED"
      decision_status: "PROPOSED" | "ACCEPTED" | "SUPERSEDED" | "REJECTED"
      document_status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
      feedback_category:
        "WENT_WELL" | "IMPROVE" | "START" | "STOP" | "CONTINUE" | "CUSTOM"
      goal_status:
        "NOT_STARTED" | "AT_RISK" | "ON_TRACK" | "ACHIEVED" | "CANCELLED"
      health_status: "ON_TRACK" | "AT_RISK" | "BLOCKED"
      influence_level: "LOW" | "MEDIUM" | "HIGH"
      integration_provider:
        "GITHUB" | "GITLAB" | "CALENDAR" | "SLACK" | "TEAMS" | "CUSTOM"
      integration_status: "ACTIVE" | "PAUSED" | "REVOKED"
      interest_level: "LOW" | "MEDIUM" | "HIGH"
      invitation_status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED"
      issue_dependency_type: "BLOCKS" | "RELATES_TO" | "DUPLICATES"
      issue_type: "EPIC" | "STORY" | "TASK" | "BUG" | "SUBTASK"
      meeting_status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
      meeting_type:
        | "PLANNING"
        | "DAILY_STANDUP"
        | "REVIEW"
        | "RETROSPECTIVE"
        | "REFINEMENT"
        | "GENERAL"
      membership_status: "ACTIVE" | "INVITED" | "SUSPENDED"
      milestone_status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "MISSED"
      minutes_status: "DRAFT" | "FINALIZED" | "AMENDED"
      portal_status: "PUBLISHED" | "WITHDRAWN"
      priority: "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST"
      project_role:
        "SCRUM_MASTER" | "PRODUCT_OWNER" | "DEVELOPER" | "VIEWER" | "CLIENT"
      project_status:
        "PLANNED" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED"
      project_template: "SCRUM" | "KANBAN" | "CUSTOM"
      requirement_kind: "FUNCTIONAL" | "NON_FUNCTIONAL"
      requirement_status:
        "PROPOSED" | "APPROVED" | "IMPLEMENTED" | "VERIFIED" | "REJECTED"
      retrospective_status: "OPEN" | "CLOSED"
      retrospective_template:
        "WENT_WELL_IMPROVE_ACTIONS" | "START_STOP_CONTINUE" | "CUSTOM"
      risk_status: "IDENTIFIED" | "MITIGATING" | "ACCEPTED" | "CLOSED"
      scope_change_type: "ADDED" | "REMOVED" | "COMPLETED" | "REOPENED"
      sprint_status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
      status_category: "BACKLOG" | "ACTIVE" | "DONE"
      webhook_status: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED"
      workspace_role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
      workspace_status: "ACTIVE" | "ARCHIVED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      action_item_status: [
        "OPEN",
        "IN_PROGRESS",
        "BLOCKED",
        "COMPLETED",
        "CANCELLED",
      ],
      board_kind: ["SCRUM", "KANBAN"],
      change_request_status: [
        "PROPOSED",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
        "IMPLEMENTED",
      ],
      decision_status: ["PROPOSED", "ACCEPTED", "SUPERSEDED", "REJECTED"],
      document_status: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      feedback_category: [
        "WENT_WELL",
        "IMPROVE",
        "START",
        "STOP",
        "CONTINUE",
        "CUSTOM",
      ],
      goal_status: [
        "NOT_STARTED",
        "AT_RISK",
        "ON_TRACK",
        "ACHIEVED",
        "CANCELLED",
      ],
      health_status: ["ON_TRACK", "AT_RISK", "BLOCKED"],
      influence_level: ["LOW", "MEDIUM", "HIGH"],
      integration_provider: [
        "GITHUB",
        "GITLAB",
        "CALENDAR",
        "SLACK",
        "TEAMS",
        "CUSTOM",
      ],
      integration_status: ["ACTIVE", "PAUSED", "REVOKED"],
      interest_level: ["LOW", "MEDIUM", "HIGH"],
      invitation_status: ["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"],
      issue_dependency_type: ["BLOCKS", "RELATES_TO", "DUPLICATES"],
      issue_type: ["EPIC", "STORY", "TASK", "BUG", "SUBTASK"],
      meeting_status: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      meeting_type: [
        "PLANNING",
        "DAILY_STANDUP",
        "REVIEW",
        "RETROSPECTIVE",
        "REFINEMENT",
        "GENERAL",
      ],
      membership_status: ["ACTIVE", "INVITED", "SUSPENDED"],
      milestone_status: ["PLANNED", "IN_PROGRESS", "COMPLETED", "MISSED"],
      minutes_status: ["DRAFT", "FINALIZED", "AMENDED"],
      portal_status: ["PUBLISHED", "WITHDRAWN"],
      priority: ["LOWEST", "LOW", "MEDIUM", "HIGH", "HIGHEST"],
      project_role: [
        "SCRUM_MASTER",
        "PRODUCT_OWNER",
        "DEVELOPER",
        "VIEWER",
        "CLIENT",
      ],
      project_status: ["PLANNED", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"],
      project_template: ["SCRUM", "KANBAN", "CUSTOM"],
      requirement_kind: ["FUNCTIONAL", "NON_FUNCTIONAL"],
      requirement_status: [
        "PROPOSED",
        "APPROVED",
        "IMPLEMENTED",
        "VERIFIED",
        "REJECTED",
      ],
      retrospective_status: ["OPEN", "CLOSED"],
      retrospective_template: [
        "WENT_WELL_IMPROVE_ACTIONS",
        "START_STOP_CONTINUE",
        "CUSTOM",
      ],
      risk_status: ["IDENTIFIED", "MITIGATING", "ACCEPTED", "CLOSED"],
      scope_change_type: ["ADDED", "REMOVED", "COMPLETED", "REOPENED"],
      sprint_status: ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"],
      status_category: ["BACKLOG", "ACTIVE", "DONE"],
      webhook_status: ["PENDING", "PROCESSING", "SUCCEEDED", "FAILED"],
      workspace_role: ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
      workspace_status: ["ACTIVE", "ARCHIVED"],
    },
  },
} as const
