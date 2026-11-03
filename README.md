# Team 16 - Change Management Software (CMS)

A web app that controls how changes to IT systems are requested, approved, scheduled, carried out and logged.
Stack: Node.js + Express (server), SQLite (database), React + Vite (client).

## Requirements
Node.js 20 or newer and Git.

## Run
Terminal 1:  cd server && npm install && npm start      (API on http://localhost:4000)
Terminal 2:  cd client && npm install && npm run dev    (UI on http://localhost:5173)

## Run the tests
cd server && npm test

## Seeded users (username / password)
requester / requester123   (Requester: submits change requests)
cab / cab123               (CAB: approves, rejects, asks for info, schedules)
implementer / impl123      (Implementer: carries out changes, writes review notes)
admin / admin123           (Admin: reads the audit log)

## How a change moves through the system
Submitted -> Approved -> Scheduled -> In Progress -> Completed (or Failed).
The CAB can also send a request back (Info Requested) or reject it. Requesters get an in-app notification
on every status change, and every action is written to the audit log.

## More
docs/DEVIATIONS.md - differences from the original plan
demo/ - demo videos
