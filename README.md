# Kivra

**An integrated workspace for Agile planning, teamwork, documentation, and delivery.**

> **Status:** Product specification / planned development  
> **Scope:** v1.0 roadmap  
> **Stack:** Next.js · TypeScript · Firebase · Cloud Firestore  
> **Development:** Solo-developer portfolio project

Kivra is a proposed Agile project management platform that brings together Jira-inspired work tracking, Scrum management, meeting agendas and minutes, project documentation, team collaboration, and traceable decision-making.

Its defining idea is **connected project knowledge**: meetings, decisions, backlog items, sprint commitments, risks, and action items link to one another. Rather than recording a decision in one tool and manually recreating it as work in another, Kivra aims to preserve the relationship from discussion through delivery.

> [!NOTE]
> This README describes **planned functionality**, not completed or shipped features. Checkboxes indicate implementation status and begin unchecked. Features are design proposals, not claims of originality or superiority over existing products.

## Contents

- [Product vision](#product-vision)
- [Users and differentiators](#users-and-differentiators)
- [Priorities](#priorities)
- [Feature inventory](#feature-inventory)
- [Implementation roadmap](#implementation-roadmap)
- [Technical architecture](#technical-architecture)
- [Engineering principles](#engineering-principles)
- [MVP definition of done](#mvp-definition-of-done)
- [References](#references)

## Product vision

Support the entire project lifecycle:

**Initiate → Define requirements → Maintain backlog → Plan sprint → Execute → Meet and document → Decide and assign → Review → Improve**

Kivra is designed primarily for **small software teams, university project groups, student organisations, and early-stage startups**. It should support project-management work beyond code: meeting minutes, stakeholder decisions, action registers, risk management, and documentation.

### Users and differentiators

| Differentiator | Intended improvement | Priority |
| --- | --- | --- |
| Meeting-to-work traceability | Link decisions to accountable people, actions, and backlog items | P0 |
| Unified Agile documentation | Connect minutes, sprint records, decisions, and follow-ups | P0 |
| Retrospective accountability | Track improvement actions across subsequent sprints | P1 |
| Project evidence packs | Export organised minutes, decisions, sprint outcomes, and history | P2 |
| Explainable planning insights | Surface blockers and capacity risks with supporting records | P2 |

These are **product hypotheses** to validate against Jira, Linear, and representative workflows, not assertions that competing tools lack these capabilities.

## Priorities

| Priority | Release | Meaning |
| --- | --- | --- |
| **P0** | MVP | Essential for a functioning, demonstrable product |
| **P1** | V1 | Production-quality features for real teams |
| **P2** | V2 | Advanced and differentiating capabilities |
| **P3** | Future | Enterprise integrations, ecosystem, and optional AI |

Priority means **delivery order**, not intrinsic value. Scope is deliberately phased to remain realistic for one developer.

## Feature inventory

The following checklists form the initial product backlog. Grouped features can later be split into implementation-ready issues with acceptance criteria and dependencies.

### 1. Authentication, workspaces and teams

*Identity, multi-tenancy, and membership*

**P0**

- [ ] Email/password and Google sign-in
- [ ] User profiles and avatars
- [ ] Create, rename, and archive workspaces
- [ ] Workspace invitations and membership
- [ ] Owner, admin, member, and viewer permissions
- [ ] Project-scoped membership and authorisation
- [ ] Account recovery and session management

**P1**

- [ ] Team directory and Scrum accountabilities
- [ ] Personal preferences and notification settings

**P2**

- [ ] Custom role definitions

**P3**

- [ ] Single sign-on and SCIM provisioning

### 2. Project management

*Project setup, objectives, and delivery structure*

**P0**

- [ ] Create, edit, and archive projects
- [ ] Unique project keys and identifiers
- [ ] Project overview and summary
- [ ] Project members and responsibility assignment
- [ ] Scrum or Kanban project templates
- [ ] Project descriptions and objectives

**P1**

- [ ] Project charter and scope statement
- [ ] Milestones and target dates
- [ ] Project status updates and progress history
- [ ] Project-level goals and deliverables

**P2**

- [ ] Project templates and duplication

**P3**

- [ ] Portfolio-level project management

### 3. Product and sprint backlogs

*Prioritisation, requirements, and refinement*

**P0**

- [ ] Centralised product backlog
- [ ] Epics, user stories, tasks, bugs, and subtasks
- [ ] Create, edit, delete, and duplicate issues
- [ ] Issue descriptions and acceptance criteria
- [ ] Priorities, labels, and assignees
- [ ] Backlog ordering and drag-and-drop ranking
- [ ] Story points and configurable estimates
- [ ] Sprint backlog assignment
- [ ] Issue comments and activity history
- [ ] Issue filtering and sorting

**P1**

- [ ] Bulk backlog editing
- [ ] Backlog refinement sessions
- [ ] Issue dependencies and blockers

**P2**

- [ ] Custom issue fields and templates
- [ ] WSJF, RICE, and MoSCoW prioritisation

**P3**

- [ ] AI-assisted story refinement

### 4. Workflows and Agile boards

*Visual execution of project work*

**P0**

- [ ] Scrum board with configurable columns
- [ ] Kanban board and continuous workflow
- [ ] Drag-and-drop work item movement
- [ ] Issue detail modal or page
- [ ] Status transition validation
- [ ] Realtime collaborative updates
- [ ] Board filtering by assignee and priority
- [ ] Personal My Work view

**P1**

- [ ] Configurable statuses and transition rules
- [ ] Swimlanes and quick filters
- [ ] Work-in-progress limits

**P2**

- [ ] Board card customisation
- [ ] Scrumban workflow template

**P3**

- [ ] Advanced workflow designer

### 5. Sprint and Scrum management

*Scrum events, artifacts, and commitments*

**P0**

- [ ] Create, edit, start, and complete sprints
- [ ] Sprint Goal definition
- [ ] Sprint duration and dates
- [ ] Sprint backlog and commitment view
- [ ] Unfinished work rollover
- [ ] Sprint progress summary
- [ ] Sprint planning agenda and session

**P1**

- [ ] Product Goal tracking
- [ ] Sprint capacity and availability planning
- [ ] Sprint scope-change history
- [ ] Sprint review and stakeholder feedback
- [ ] Definition of Done per project
- [ ] Optional Definition of Ready
- [ ] Historical sprint snapshots

**P2**

- [ ] Dependency-aware planning warnings
- [ ] Sprint forecasting and scenario planning

**P3**

- [ ] Cross-team sprint coordination

### 6. Meeting management

*Agile ceremonies and general project meetings*

**P0**

- [ ] Create and schedule meetings
- [ ] Scrum ceremony and custom meeting types
- [ ] Meeting title, date, time, and organiser
- [ ] Agenda creation and ordered agenda items
- [ ] Participants and attendance records
- [ ] Link meetings to projects and sprints
- [ ] Meeting history and upcoming meetings

**P1**

- [ ] Reusable meeting templates
- [ ] Recurring meeting schedules
- [ ] Meeting calendar view
- [ ] Meeting reminders
- [ ] Meeting facilitator and minute-taker roles

**P2**

- [ ] Meeting timeboxing and agenda timer
- [ ] Calendar provider integration
- [ ] Video meeting links and integrations

**P3**

- [ ] Transcription and summaries

### 7. Minutes of Meeting (MoM)

*Structured discussions, outcomes, and formal records*

**P0**

- [ ] Create and edit minutes linked to meetings
- [ ] Structured agenda-based discussion notes
- [ ] Attendance and apologies
- [ ] Record decisions and outcomes
- [ ] Create action items from meeting minutes
- [ ] Save drafts and finalise records
- [ ] Link minutes to backlog items and sprints
- [ ] Rich-text editing

**P1**

- [ ] Meeting minutes search and filtering
- [ ] Approval and amendment history
- [ ] PDF export and print formatting
- [ ] Document attachments

**P2**

- [ ] Minutes distribution and acknowledgement
- [ ] Meeting-to-meeting carry-forward actions
- [ ] Templates for formal governance minutes

**P3**

- [ ] AI-assisted minutes generation

### 8. Actions, decisions and accountability

*From discussion to responsible outcomes*

**P0**

- [ ] Central action-item register
- [ ] Owner, due date, status, and description
- [ ] Create actions from meetings or standalone
- [ ] Link action items to source records
- [ ] Action progress and completion updates

**P1**

- [ ] Meeting decision register
- [ ] Decision rationale and approver
- [ ] Overdue action highlighting
- [ ] Action-item filtering by owner or project

**P2**

- [ ] Approval workflows and decision history
- [ ] Action carry-forward and escalation rules

**P3**

- [ ] Cross-project accountability dashboards

### 9. Documentation and requirements

*Knowledge management beyond code*

**P1**

- [ ] Project documents and notes
- [ ] Rich-text document editor
- [ ] Document folders and categorisation
- [ ] Requirements register
- [ ] Functional and non-functional requirements
- [ ] Link documents to issues, meetings, and decisions
- [ ] Document search

**P2**

- [ ] Document revision history
- [ ] Document templates
- [ ] Knowledge base or project wiki
- [ ] Comments and document mentions
- [ ] Document approval workflow

**P3**

- [ ] Collaborative simultaneous document editing

### 10. Retrospectives and continuous improvement

*Inspect processes and track improvement*

**P0**

- [ ] Sprint retrospective meeting type
- [ ] Retrospective notes and action items

**P1**

- [ ] Went Well / Improve / Actions template
- [ ] Start / Stop / Continue template
- [ ] Anonymous feedback collection
- [ ] Retrospective feedback board
- [ ] Action ownership and follow-up
- [ ] Historical retrospective archive

**P2**

- [ ] Feedback grouping and voting
- [ ] Retrospective improvement trend reporting

**P3**

- [ ] AI-assisted retrospective insights

### 11. Risks, stakeholders and governance

*Non-technical coordination and oversight*

**P1**

- [ ] Risk register with status and owner
- [ ] Risk probability and impact
- [ ] Risk mitigation plans
- [ ] Project impediment and escalation register
- [ ] Stakeholder directory
- [ ] Stakeholder feedback tracking
- [ ] Change request register

**P2**

- [ ] Risk matrix and visualisation
- [ ] Communication plans
- [ ] Approval and sign-off records

**P3**

- [ ] Project governance audit reports

### 12. Calendars, timelines and roadmaps

*Time-based planning*

**P0**

- [ ] Project and sprint date visibility

**P1**

- [ ] Unified project calendar
- [ ] Meetings, deadlines, and milestones calendar
- [ ] Epic roadmap
- [ ] Timeline of planned work
- [ ] Upcoming deadlines and reminders
- [ ] Calendar filters and personal views

**P2**

- [ ] Dependency visualisation
- [ ] Gantt-style planning
- [ ] External calendar sync

**P3**

- [ ] Cross-project resource scheduling

### 13. Analytics, dashboards and reports

*Evidence-based delivery insight*

**P0**

- [ ] Project overview dashboard
- [ ] Basic sprint progress and completion summary

**P1**

- [ ] Sprint burndown and burnup charts
- [ ] Team velocity trends
- [ ] Sprint commitment vs completion report
- [ ] Issue cycle time and lead time
- [ ] Work-in-progress and cumulative flow
- [ ] Meeting and action-item summary
- [ ] Scope-change and blocker reporting

**P2**

- [ ] Custom report filters and date ranges
- [ ] Project health indicators with explanations
- [ ] Exportable project status reports

**P3**

- [ ] Cross-project analytics

### 14. Communication and notifications

*Awareness and team coordination*

**P0**

- [ ] Issue comments and activity feed

**P1**

- [ ] Assignment and membership notifications
- [ ] In-app notification inbox
- [ ] Mentions in discussions
- [ ] Meeting reminders and action notifications
- [ ] Project announcements and updates

**P2**

- [ ] Email notification digests
- [ ] Follow or subscribe to issues
- [ ] Cross-project activity feed

**P3**

- [ ] Slack and Microsoft Teams integration

### 15. Search and productivity

*Fast navigation and low-friction interaction*

**P0**

- [ ] Issue-key lookup and basic filters

**P1**

- [ ] Global search across core records
- [ ] Saved filters and views
- [ ] Keyboard shortcuts
- [ ] Command palette
- [ ] Bulk issue operations

**P2**

- [ ] Advanced query builder
- [ ] Cross-entity linked record search
- [ ] Personalised dashboard and widgets

**P3**

- [ ] Semantic and AI-assisted search

### 16. Developer and external integrations

*Connect tracking with software delivery*

**P2**

- [ ] GitHub repository linking
- [ ] Link pull requests and commits to issues
- [ ] PR status and CI visibility
- [ ] Evidence-based Definition of Done
- [ ] Inbound webhooks and idempotent processing
- [ ] REST API and scoped tokens
- [ ] Workflow automation rules

**P3**

- [ ] GitLab integration
- [ ] Import from Jira CSV exports
- [ ] Public integration marketplace

### 17. Security, reliability and operations

*Essential trust, safety, and deployability*

**P0**

- [ ] Authentication and server-side authorisation
- [ ] Firestore tenant and project isolation
- [ ] Schema validation and error handling
- [ ] Firestore Emulator security-rule tests
- [ ] Atomic counters and transaction safety
- [ ] Basic automated tests and Playwright E2E
- [ ] Accessible responsive application shell
- [ ] Production deployment and CI pipeline
- [ ] Database indexes and query cost controls

**P1**

- [ ] Structured logging and error monitoring
- [ ] Rate limiting and abuse protection
- [ ] Performance and accessibility audits
- [ ] Backup, restore, and retention policy

**P2**

- [ ] Expanded audit history and export

**P3**

- [ ] Disaster recovery drills and SLO tracking

### 18. Kivra differentiators

*Connected knowledge and verifiable delivery*

**P0**

- [ ] Actions generated directly from meeting decisions
- [ ] Bidirectional links between minutes and backlog
- [ ] Unified action register across meetings
- [ ] Sprint-linked meeting records

**P1**

- [ ] Traceable meeting-to-delivery history
- [ ] Retrospective action follow-through

**P2**

- [ ] Decision impact and change history
- [ ] Explainable project-health recommendations
- [ ] Dependency and capacity conflict warnings
- [ ] Verified completion through GitHub and CI
- [ ] Project evidence pack export

**P3**

- [ ] Intelligent context-aware meeting preparation

## Implementation roadmap

| Milestone | Scope | Exit criterion |
| --- | --- | --- |
| **1. Functional foundation** | Authentication, workspaces, memberships, projects, issues, product backlog, Kanban | Team can organise and securely update real work |
| **2. Complete Scrum workflow** | Sprint planning, Sprint Goals, lifecycle, boards, rollover, review records | Team can complete a Scrum sprint in Kivra |
| **3. Meetings and documentation** | Meeting schedules, agendas, attendance, MoM, decisions, action register, backlog links | Team can document meetings and track outcomes without another tool |
| **4. V1 management experience** | Reports, retrospectives, roadmap, risk register, documents, calendar, search, notifications | Team can manage planning, delivery, and governance in one workspace |
| **5. Differentiation and polish** | Dependency warnings, GitHub, completion evidence, evidence packs, benchmarks, comprehensive tests | Public demo validates defensible workflow improvements |

Deliver **P0 first**, then a selected P1 set, then a small number of distinctive P2 features. Do not interpret the inventory as a promise to build every item simultaneously.

## Technical architecture

### Recommended stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Web | Next.js App Router, React, TypeScript | UI, server components, routing |
| Design system | Tailwind CSS, shadcn/ui | Reusable accessible components |
| Mutations | Next.js Server Actions | Authenticated application commands |
| Identity | Firebase Authentication | User sign-in and sessions |
| Database | Cloud Firestore | Workspace, project, sprint, meeting, and linked records |
| Storage | Firebase Cloud Storage | Attachments and document exports |
| Realtime | Firestore snapshot listeners | Live collaboration on supported views |
| Background jobs | Firebase Functions or scheduled workers | Reminders, notifications, webhook processing |
| Testing | Vitest, Firebase Emulator Suite, Playwright | Unit, security rules, integration, and E2E tests |
| Delivery | GitHub Actions, Vercel / Firebase | CI and deployment |

### Request boundaries

```text
Browser / Next.js UI
   |                      ┌─────────────────────────────┐
   +--> Server Actions -->| Shared domain services      |
   |                      | Validation + permissions    |--> Firestore / Storage
   +--> Realtime reads -->| (Firestore security rules)  |
                          └─────────────────────────────┘
Background workers --------> Shared domain services
Future MCP server ----------> Shared domain services
```

Server Actions must authenticate users and enforce project/workspace permissions for every mutation. Browser-based Firestore listeners must be protected by security rules. Firebase Admin SDK operations bypass Firestore Security Rules, so **server-side authorisation is mandatory**.

### Data-modelling principles

- Keep **issues, meetings, meeting minutes, decisions, action items, risks, and documents** as distinct domain entities with their own lifecycles.
- Record explicit, bidirectional references where practical. A meeting action is not automatically a development issue.
- Use Firestore transactions for concurrency-sensitive operations such as sequential issue keys and sprint transitions.
- Maintain immutable or versioned history for finalised minutes, decisions, and sprint snapshots.
- Scope queries, memberships, and permissions to the relevant workspace and project.
- Design Firestore indexes, pagination, and realtime subscriptions deliberately to control costs.
- Extract reusable domain services so a future MCP integration does not duplicate application rules.

### Example record relationships

```text
Workspace
  └── Project
      ├── Product backlog / issues
      ├── Sprints ────────────────┐
      ├── Meetings ───────────────┤
      │   └── Minutes             │
      │       ├── Decisions ──────┤--> Linked records and audit history
      │       └── Action items ───┤
      ├── Risks ──────────────────┤
      └── Documents ──────────────┘
```

## Engineering principles

1. **Functional before exhaustive.** Deliver one complete team workflow instead of dozens of incomplete screens.
2. **Multi-tenancy first.** Tenant isolation and authorisation are foundational, not enhancements.
3. **Single source of business rules.** Next.js actions and future integrations call the same domain services.
4. **Traceability with explicit intent.** Keep documents, decisions, and actions linked without conflating them.
5. **Scrum accuracy.** Follow the Scrum Guide for accountabilities, events, and artifacts. Meeting minutes and Definition of Ready are optional practices, not compulsory Scrum elements.
6. **Evidence over claims.** Measure workflow speed, latency, accessibility, and reliability before publishing comparisons.
7. **Avoid unnecessary infrastructure.** Do not introduce microservices, Kubernetes, or mandatory AI into the MVP.

## MVP definition of done

The first public MVP is complete when a real multi-user team can:

- [ ] Register, create a workspace, invite members, and access only authorised records.
- [ ] Create a project, maintain a ranked product backlog, and manage issue states on a live board.
- [ ] Plan, start, execute, review, and complete a sprint with a visible Sprint Goal.
- [ ] Schedule a Scrum or general project meeting and maintain an agenda and attendance record.
- [ ] Draft and finalise structured meeting minutes with recorded decisions.
- [ ] Assign action items from those decisions and track them independently from backlog issues.
- [ ] Follow references from minutes to decisions, action items, sprints, and backlog work.
- [ ] Use the platform successfully across at least two user accounts without crossing workspace boundaries.
- [ ] Pass permission/security-rule tests, critical end-to-end flows, and a basic accessibility review.
- [ ] Access a deployed demo and a reproducible local development environment.

## References

- [Official Scrum Guide](https://scrumguides.org/scrum-guide.html)
- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [Next.js Server Functions and Actions](https://nextjs.org/docs/app/getting-started/updating-data)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Playwright](https://playwright.dev/docs/intro)

---

**Project positioning:** Kivra is an integrated Agile workspace connecting planning, Scrum execution, meetings, decisions, documentation, and accountability. Its goal is not a pixel-perfect copy of Jira, but a familiar and substantially useful workflow with independently designed branding and verifiable improvements.
