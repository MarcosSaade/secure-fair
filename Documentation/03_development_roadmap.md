# Development Roadmap - Secure Fair

## Team Organization

### Team Structure (5 Members)

1. **Scrum Master / PM / Integrator / QA Lead**
   - Backlog and sprint management
   - Integration coordination and conflict resolution
   - Demo script preparation
   - CI/CD configuration and code standards
   - QA checklist and quality control

2. **Backend Lead (API + Database)**
   - Database schema design and migrations
   - REST endpoint implementation and business rules
   - Transaction management and validations
   - Backend deployment responsibility

3. **Security/Crypto + Auth Engineer**
   - Authentication implementation (JWT/sessions)
   - Role-based access control (RBAC)
   - OTP code system (generation, hashing, expiration)
   - Digital signatures implementation (Ed25519)
   - Security audit of endpoints

4. **Frontend Lead (Student & Socio Applications)**
   - Student flow: slot registration, QR, check-in status, code redemption
   - Socio flow: code generation, real-time counters, student list
   - UI components, routing, form validation
   - User experience (UX)

5. **Admin Dashboard + Data/Exports Engineer**
   - Admin panel: CRUD for organizations/projects/slots
   - Excel data import
   - Analytics dashboard: attendance per slot, enrollments, capacity status
   - Exports: master CSV/XLSX table, per-project export

### Working Principles

- Each member is capable of working in any area (full-stack)
- Each person owns a specific area to avoid orphaned components
- Weekly short sync meetings
- Mandatory code reviews before merge
- Continuous documentation during development

## 16-Week Calendar

### Calendar Structure

The calendar spans from Week 2 to Week 17 (final presentation). Week 1 is assumed as onboarding and course introduction.

### Main Milestones

- **Week 3**: Skeleton app with authentication
- **Week 5**: Functional slot registration
- **Week 6**: Operational check-in system
- **Week 8**: Enrollment with physical verification gate
- **Week 9**: Hardening milestone
- **Week 10**: Export system
- **Week 12**: Analytics dashboard
- **Week 13**: Cryptographic component finalized
- **Week 15**: Production deployment
- **Week 16**: Code freeze
- **Week 17**: Final presentation

## Detailed Weekly Calendar

### Week 2: Foundations

**Objectives**: Establish base architecture and define precise MVP scope

**Tasks by Role**:
- **PM/Scrum Master**: Define MVP scope and user stories, create acceptance criteria
- **Backend Lead**: Create initial ER diagram, define migration skeleton with Alembic
- **Security/Crypto**: Design RBAC model, decide auth strategy (JWT vs sessions), research crypto libraries
- **Frontend Lead**: Define general application layout, design routes for 3 roles, select component library
- **Admin/Data**: Specify export formats, define Excel template structure for import

**Deliverable**: Architecture document, draft ER diagram, endpoint list, data format specs

### Week 3: Skeleton Application

**Objectives**: Have minimal functional app with authentication and role separation

**Tasks by Role**:
- **Backend Lead**: Configure FastAPI project, setup PostgreSQL with SQLAlchemy, run initial migrations, create seed data
- **Security/Crypto**: Implement `/auth/login` with JWT generation, implement `/auth/me`, create FastAPI dependencies for role verification, implement Argon2 password hashing
- **Frontend Lead**: Configure React project with Vite and TypeScript, implement login screens, create protected routes by role, implement JWT token storage
- **Admin/Data**: Create basic wireframes of admin CRUD screens
- **PM/Scrum Master**: Configure Git repository with branch structure, setup linting, establish PR rules

**Deliverable**: "Hello World" app with functional login, differentiated roles, running database

**Internal Demo**: Successful login, navigation to different views by role

### Week 4: CRUD for Core Data

**Objectives**: Implement CRUD operations for organizations, projects, and slots

**Tasks by Role**:
- **Backend Lead**: CRUD endpoints for Organizations, Projects, Time Slots, data validations
- **Admin/Data**: Admin UI for organizations CRUD, projects CRUD, slots CRUD, connect UI to backend API
- **Frontend Lead**: Socio view: list of assigned projects
- **Security/Crypto**: Apply permission verification on endpoints (only ADMIN can create)
- **PM/Scrum Master**: Start integration testing checklist

**Deliverable**: Admin can create org/projects/slots; socio can view their projects

**Internal Demo**: Create organization, project, and slot from admin panel; view in socio panel

### Week 5: Student Slot Registration

**Objectives**: Allow students to register in time slots with capacity control

**Tasks by Role**:
- **Backend Lead**: Endpoint `GET /student/slots` (with available capacity), `POST /student/slot-registrations`, implement real-time capacity verification, unique registration per slot restriction
- **Frontend Lead**: Student screen: explore available slots, slot registration form, registration confirmation page
- **Security/Crypto**: Protect against duplicate registrations in same slot, implement basic rate limiting
- **Admin/Data**: Admin view: slot registrations
- **PM/Scrum Master**: Define demo scenario 1 (time slot flow)

**Deliverable**: Students can reserve slots; capacity updates correctly

**Internal Demo**: Student reserves slot, attempts to reserve again (error), another student reserves until capacity full

### Week 6: Check-in with QR

**Objectives**: Generate entry QR codes and allow entry verification

**Tasks by Role**:
- **Backend Lead**: Endpoint `GET /student/slot-qr` (generates signed token), `POST /admin/checkin` (verifies token and registers check-in)
- **Security/Crypto**: Implement signed JWT token for QR, signature and expiration validation at check-in
- **Frontend Lead**: Student screen: "My QR" with visualization, Admin screen: scanner/manual token entry
- **Admin/Data**: Basic attendance metrics (registered vs verified)
- **PM/Scrum Master**: Test plan for check-in edge cases

**Deliverable**: Check-in works; attendance numbers update

**Internal Demo**: Student shows QR, admin scans/enters token, successful verification

### Week 7: OTP Enrollment Codes

**Objectives**: Socio can generate ephemeral enrollment codes

**Tasks by Role**:
- **Backend Lead**: Endpoint `POST /socio/projects/{id}/codes` (generates code), random alphanumeric code generation logic, storage with expiration timestamp
- **Security/Crypto**: Implement HMAC hashing of code, configure expiration time (60-120s), expiration verification in validation
- **Frontend Lead**: Socio UI: "Generate Code" button, display code on screen with expiration countdown
- **Admin/Data**: Admin view: count of used codes (optional)
- **PM/Scrum Master**: Define demo scenario 2 (enrollment flow)

**Deliverable**: Codes can be generated and validated

**Internal Demo**: Socio generates code, code displays on screen, expires after 2 minutes

### Week 8: Enrollment with Verification Gate

**Objectives**: Students can redeem codes only if physically verified

**Tasks by Role**:
- **Backend Lead**: Endpoint `POST /student/enrollments/redeem`, implement complete atomic transaction (verify check-in, validate code, verify unique enrollment per period, verify available capacity, create enrollment, mark code as used)
- **Security/Crypto**: Finalize business rules enforcement, implement audit logs for enrollments
- **Frontend Lead**: Student screen: enter code, show project rules for acceptance, successful enrollment confirmation, error handling (not verified, invalid code, etc.)
- **Admin/Data**: Enrollments table view
- **PM/Scrum Master**: End-to-end verification of complete flow

**Deliverable**: End-to-end functional enrollment with physical verification gate

**Internal Demo**: Student without check-in attempts to redeem code (fails); student with check-in redeems successfully; second enrollment attempt is blocked

### Week 9: Hardening and Edge Cases

**Objectives**: Strengthen system against race conditions and attacks

**Tasks by Role**:
- **Backend Lead**: Add database constraints (UNIQUE, CHECK), handle race conditions with SELECT FOR UPDATE, optimize queries with indexes
- **Security/Crypto**: Implement brute force protection (limit code attempts), rate limiting on critical endpoints
- **Frontend Lead**: Polish error states (full capacity, expired code, not verified), clear and actionable error messages
- **Admin/Data**: Master table query (join student/project/org/period)
- **PM/Scrum Master**: Mid-semester internal demo, backlog re-prioritization

**Deliverable**: Hardening milestone achieved

**Internal Demo**: Stress tests: multiple students attempt to redeem codes simultaneously; system maintains integrity

### Week 10: Exports (CSV/XLSX)

**Objectives**: Implement data export system

**Tasks by Role**:
- **Admin/Data**: Per-project export endpoint, master export endpoint, implement CSV and XLSX generation
- **Backend Lead**: Implement export endpoints with filters, pagination for large queries
- **Frontend Lead**: Download buttons in socio UI, download buttons in admin UI, export filters (by period, organization)
- **Security/Crypto**: Authorization verification for exports
- **PM/Scrum Master**: Exported data validation checklist

**Deliverable**: One-click exports for socio and admin

**Internal Demo**: Download enrolled students list for a project; download complete master table

### Week 11: Excel Import

**Objectives**: Allow admins to bulk upload projects via Excel

**Tasks by Role**:
- **Admin/Data**: Define Excel template with specific columns, file upload UI with preview, show validation errors by row
- **Backend Lead**: Excel file parser, row-by-row data validation, error reporting with row numbers
- **Security/Crypto**: File size and type restrictions
- **Frontend Lead**: Import status UI, error display
- **PM/Scrum Master**: Import demo scenario

**Deliverable**: Social Service can load org/projects/slots in bulk securely

**Internal Demo**: Upload Excel file, see preview, confirm successful import

### Week 12: Analytics Dashboard

**Objectives**: Create admin dashboard with key metrics and visualizations

**Tasks by Role**:
- **Admin/Data**: Attendance graphs per slot, enrollment graphs per project, occupancy rates, dashboard UI with visual components
- **Backend Lead**: Analytics endpoints (aggregations), dashboard query optimization
- **Frontend Lead**: Integrate chart library (Chart.js, Recharts)
- **Security/Crypto**: Verify admin-only access
- **PM/Scrum Master**: Define final demo narrative

**Deliverable**: Professional-looking dashboard that updates with real data

**Internal Demo**: Navigate dashboard, see updated metrics in real-time

### Week 13: Cryptographic Component Finalization

**Objectives**: Complete and integrate the course's cryptographic requirement

**Tasks by Role**:
- **Security/Crypto**: Implement Ed25519 signature of enrollment receipts, receipt verification endpoint, technical crypto implementation documentation, threat model documentation, explain how cryptography mitigates threats
- **Backend Lead**: Integrate receipt generation in enrollment flow, store signatures in database
- **Frontend Lead**: Show signed receipt to student after enrollment, receipt verification UI (optional)
- **PM/Scrum Master**: Prepare crypto explanation for presentation

**Deliverable**: Cryptographic requirement met, documented and demonstrable

**Internal Demo**: Show receipt with signature, verify signature, attempt to modify data (verification fails)

### Week 14: QA Sprint

**Objectives**: Perform exhaustive testing and bug fixing

**Tasks by Role**:
- **PM/Scrum Master**: Execute complete regression test suite, bug triage by priority
- **Backend Lead**: Fix race conditions and correctness bugs
- **Frontend Lead**: Polish UX, loading states, ensure basic mobile responsiveness
- **Security/Crypto**: Endpoint audit and permission verification
- **Admin/Data**: Verify correctness of exports and imports

**Deliverable**: Release Candidate 1

**QA Checklist**:
- ✅ Login works for all 3 roles
- ✅ Slot registration respects capacity
- ✅ Check-in validates token correctly
- ✅ Enrollment blocks without check-in
- ✅ Codes expire correctly
- ✅ Double enrollment not allowed
- ✅ Exports contain correct data
- ✅ Dashboard shows updated metrics
- ✅ Receipts can be verified
- ✅ No critical vulnerabilities

### Week 15: Deployment and Reliability

**Objectives**: Deploy application to staging/production environment

**Tasks by Role**:
- **Backend Lead + Security**: Deploy backend on Render/Fly.io/Railway, configure environment variables, setup database backups
- **PM/Scrum Master**: Configure basic monitoring, load realistic demonstration dataset
- **Frontend Lead**: Deploy frontend on Vercel/Netlify, configure domain (optional), demo mode toggles if necessary
- **Admin/Data**: Final dashboard adjustments

**Deliverable**: Live staging environment with accessible URL

**Internal Demo**: Access application from browser, perform complete end-to-end flow

### Week 16: Code Freeze and Presentation Prep

**Objectives**: Freeze code and prepare presentation materials

**Tasks by Role**:
- **PM/Scrum Master**: Create slide presentation, write live demo script, assign presentation parts to each member, record backup demo video (in case WiFi fails)
- **All**: Rehearse presentation, fix only critical bugs, finalize documentation

**Deliverable**: Product ready for presentation, demo script, backup video

**Code Freeze**: Early in the week. Only critical bug fixes allowed.

### Week 17: Final Presentation

**Objectives**: Present project to professors and peers

**Presentation Structure (30 minutes)**:

1. **Introduction (3 min)**: Problem context, project objectives
2. **Architecture and Design (5 min)**: Tech stack, architecture diagram, database model
3. **Live Demo (12 min)**: 
   - Admin flow: create project and slot
   - Student flow: register slot, get QR
   - Admin flow: check-in
   - Socio flow: generate code
   - Student flow: redeem code (successful)
   - Attempt enrollment without check-in (blocked)
   - Show analytics dashboard
   - Export data
4. **Cryptographic Component (5 min)**: Explain signed receipts with Ed25519, demonstrate signature verification, explain threat model and mitigations
5. **Conclusion and Learnings (3 min)**: Project achievements, challenges overcome, possible future extensions
6. **Questions (2 min)**

**Backup Video**: Have a 2-3 minute recorded video showing complete flow in case of technical problems.

## Risk Management

### Identified Risks

1. **Initial setup delay**
   - *Mitigation*: Use Docker Compose for quick setup

2. **Transaction complexity**
   - *Mitigation*: Dedicate Week 9 specifically to hardening

3. **Integration problems**
   - *Mitigation*: Weekly integration checkpoints

4. **Crypto component misunderstood**
   - *Mitigation*: Early research in Week 2, gradual implementation

5. **Technical failure during presentation**
   - *Mitigation*: Backup video recorded

## Success Criteria

### Technical
- ✅ System prevents enrollments without check-in: 100%
- ✅ Capacity limits respected: 100%
- ✅ Codes expire correctly: 100%
- ✅ Receipts verify correctly: 100%
- ✅ Test coverage: > 70%
- ✅ Zero critical vulnerabilities

### Process
- ✅ All weekly milestones completed on time
- ✅ Code reviews performed on all PRs
- ✅ Complete technical documentation
- ✅ Final demo without critical errors

### Academic
- ✅ Clear presentation of cryptographic component
- ✅ Demonstration of problem solved
- ✅ Well-structured source code
- ✅ Ability to answer technical questions

---

**Version**: 1.0  
**Last Update**: February 2026
