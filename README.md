Change Management Software (CMS)

A web-based application to manage the lifecycle of IT change requests — from submission, through Change Advisory Board (CAB) review and approval, to scheduling, implementation, and audit reporting. Built as a college mini-project by a 3-member student team.

What it does

Employees ("Requesters") raise a change request describing what they want changed. A review team ("CAB") checks the risk and either approves or rejects it. Approved changes get scheduled and tracked through to completion, with a full audit trail kept for every step.

Features
1. Authentication & Role-Based Access Control — separate roles for Requester, CAB Approver, Implementer, and Administrator
2. Change Request Submission — create a CR with title, description, category, priority, and attachments
3. Risk & Impact Assessment — record risk level (Low/Medium/High) and require a rollback plan for high-risk changes
4. CAB Approval Workflow — approve/reject with mandatory comments
5. Scheduling — change calendar with blackout-period conflict checks
6. Implementation Tracking — status updates (Scheduled → In Progress → Completed/Failed/Rolled Back) and post-implementation review notes
7. Notifications — email alerts on every status change
8. Audit Trail & Reporting — tamper-evident logs and summary reports
   
Tech Stack:
- Layer	Technology
- Frontend	React
- Backend	Java Spring Boot (REST API)
- Database	MySQL / PostgreSQL
- Auth	JWT-based session auth, RBAC
- Notifications	SMTP / sandbox email service
- Testing	Selenium, Postman, JMeter


Architecture (short version):

React UI  →  REST API (Spring Boot)  →  MySQL/PostgreSQL
                    │
                    ├── Auth Service (login, RBAC)
                    ├── Change Request Service (CR lifecycle)
                    ├── Approval / Workflow Engine (CAB routing & decisions)
                    ├── Scheduler Service (calendar, blackout checks)
                    ├── Notification Service (email alerts)
                    └── Reporting Module (audit trail, summaries)
