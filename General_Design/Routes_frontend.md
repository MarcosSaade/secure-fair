# Route Design by User Role
Andrés Kiewek García, Paulina Leal Mosqueda, Santiago Nava Figueroa, Edgar Samuel Oropeza García y Marcos Sadee Romano

## Index

- [1. Authentication](#1-authentication)
- [2. Student Route Design](#2-student-route-design)
    - [2.1 Student Home](#21-student-home)
    - [2.2 Registration Form](#22-registration-form)
    - [2.3 Registration Time Validation](#23-registration-time-validation)
    - [2.4 QR Validation Screen](#24-qr-validation-screen)
    - [2.5 Policy Acceptance & Code Entry](#25-policy-acceptance--code-entry)
    - [2.6 Final Enrollment Result](#26-final-enrollment-result)
    - [2.7 Student Profile & Status](#27-student-profile--status)
    - [2.8 General Route Map](#28-general-route-map)
    - [2.9 Complete Student Route Map](#29-complete-student-route-map)
    - [2.10 Architectural Principles](#210-architectural-principles)
- [3. Socio-Formador Route Flow](#3-socio-formador-route-flow-complete-navigation-path)
    - [Project Selection Flow — Step 1: Select Project](#step-1-–-select-project)
    - [3.1 Project Main Page](#31-project-main-page)
        - [3.1.1 Generate Code](#311-generate-code)
    - [3.2 Project Dashboard](#32-project-dashboard)
    - [3.3 Profile Access (Global)](#33-profile-access-global)
    - [3.4 Complete Route Tree Representation](#34-complete-route-tree-representation)
    - [3.5 Design Characteristics](#35-design-characteristics)
- [4. Administrator Route Flow](#4-administrator-route-flow-complete-navigation-path)
    - [4.1 Import Data](#41-import-data)
    - [4.2 Export Data](#42-export-data)
    - [4.3 Edit Management](#43-edit-management)
    - [4.4 Check-In](#44-check-in)
    - [4.5 Analytics Dashboard](#45-analytics-dashboard)
    - [4.6 Profile Access (Global)](#46-profile-access-global)
    - [4.7 Complete Route Tree Representation](#47-complete-route-tree-representation)
    - [4.8 Design Characteristics](#8-design-characteristics)
- [5. Complete Route Architecture (All Roles)]
- [6. Library Components]

# 1. Authentication

All roles share the same authentication routes.

| Route | Description |
|-------|------------|
| `/signin` | Role selection (Admin / Socio-Formador / Student), username, and password |
| `/login` | Authentication endpoint |

During sign-in, the user selects their role before logging in.

---

# 2. Student Route Design

This section defines the complete route structure and navigation flow for the **Student role**, based on the controlled multi-step registration process.

The student flow is sequential and state-controlled by backend validation to prevent skipping steps.

---

## 2.1 Student Home

| Route | `/student` |
|-------|------------|
| Description | Main student landing page |
| Actions | Start registration process |
| UI Elements | Profile icon (persistent in all pages) |

---

## 2.2 Registration Form

| Route | `/student/register` |
|-------|--------------------|
| Description | Student personal information form |

### Required Fields:

- Full Name
- Student ID (Matrícula)
- Major
- Alternative Email
- Phone Number
- Registration Time (Dropdown selector)

---

## 2.3 Registration Time Validation

| Route | `/student/register/status` |
|-------|---------------------------|
| Description | Backend validates whether the student is within the assigned registration window |

### Possible Outcomes:

**Valid Time Window**
- Message: "Registro exitoso"
- Button → Continue → `/student/qr`

**Invalid Time Window**
- Message: "Asegúrate de que estés en el horario indicado antes de registrarte."
- Button → Exit → `/student`

Students cannot proceed unless the time window is valid.

---

## 2.4 QR Validation Screen

| Route | `/student/qr` |
|-------|--------------|
| Description | Displays QR code for validation |

### QR States:

**Green (Valid QR)**
- Message: "Código QR aceptado"
- Button → Continue → `/student/confirmation`

**Red (Invalid QR / Not Yet Time)**
- Message: "Aún no es tu turno de insrcipción, espera a la hora establecida.
- Button → Back to `/student/register`

The system prevents progression unless the QR is validated successfully.

---

## 2.5 Policy Acceptance & Code Entry

| Route | `/student/confirmation` |
|-------|------------------------|
| Description | Student must accept policies and enter confirmation code |

### Required Actions:

- Accept policies (checkbox)
- Enter verification code

Button: Continue -> `/student/result`


---

## 2.6 Final Enrollment Result

| Route | `/student/result` |
|-------|------------------|
| Description | Displays final enrollment status |

### Possible Messages:

- Enrollment successful
- You are already registered
- No slots available
- Invalid code
- QR not validated

All outcomes redirect the student back to: `/student/register`


---

# 2.7 Student Profile & Status

Accessible from the profile icon available on all student pages.

| Route | `/student/profile` |
|-------|------------------|
| Description | Edit personal information and view enrollment status |

### Features:

- Edit personal data
- View registration status
- View assigned slot
- View QR validation status

---

# 2.8. General Route Map

```
/signin
   ↓
/login
   ↓
/student
   ↓
/student/register
   ↓
/student/register/status
   ↓
/student/qr
   ↓
/student/confirmation
   ↓
/student/result
   ↓
/student/profile
```

# 2.9 Complete Student Route Map

```
/signin
   ↓
/login
   ↓
/student
   ↓
/student/register
   ↓
/student/register/status
   ├── (valid) → /student/qr
   └── (invalid) → /student
   ↓
/student/qr
   ├── (valid) → /student/confirmation
   └── (invalid) → /student/register
   ↓
/student/confirmation
   ↓
/student/result
   ↓
/student

/student/profile (accessible globally)
```

# 2.10 Architectural Principles

- Role-based route isolation (`/student/*`)
- Backend-controlled multi-step validation
- Session validation required
- Registration window enforcement
- QR validation enforcement
- No step skipping allowed
- Centralized profile access

This structured flow ensures process integrity, security, and controlled enrollment validation.

# 3. Socio-Formador Route Flow (Complete Navigation Path)

This section defines the full navigation structure for the **Socio-Formador (Partner)** role.

The partner manages assigned projects, generates registration codes, monitors enrollment, and views dashboards.

All routes are protected and role-restricted under `/socio/*`.

Authentication Flow

After successful login, the Socio-Formador is redirected to `/socio`.

---

The main page contains three primary actions:

1. Select Project (Dropdown)
2. Dashboard
3. Enrolled List
4. Botton to create code
5. Export data botton

A profile icon is accessible on all pages.

---
## 3.1 Project Main Page

This page contains four buttons:

- Select project
- Generate Code
- Export data
- Go to profile

---

# 3.1.1 Generate Code

## Route
/socio/projects/


### Features:

- Displays current active code
- Shows current number of enrolled students
- Button: "Generate New Code"
- Button: "Return to Home"

### Flow:

```
/socio/projects/pagina_inicial
   ↓
/socio/projects/:project_id/code
   ↓
(Return to /socio)
```
---

# 3.2 Project Dashboard

## Route
/socio/projects/:project_id/dashboard


### Displays:

- Number of enrolled students
- Total capacity
- Enrollment progress (graph)
- Enrollment statistics
- Export data
---


# 3.3 Profile Access (Global)

Accessible from any page via profile icon.

## Route
/socio/profile


Features:

- View personal information
- Change password
- Return to Home button

---

# 3.4 Complete Route Tree Representation

```
/signin
↓
/login
↓
/socio
├── Select Project → /socio/projects/:project_id
│ ├── Generate Code → /socio/projects/:project_id/code
│ ├── Project Dashboard → /socio/projects/:project_id/dashboard
│ └── Project Enrollements → /socio/projects/:project_id/enrollements

/socio/profile (accessible globally)
```

---

# 3.5 Design Characteristics

- Role-isolated route structure (`/socio/*`)
- Project-level and global-level views: All in front-page
- Dynamic project-based routing
- Export capability
- Real-time code generation
- Persistent profile access
- Clear return-to-home navigation

This structure ensures controlled project management, monitoring transparency, and organized enrollment supervision.



# 4. Administrator Route Flow (Complete Navigation Path)

This section defines the full navigation structure for the **Administrator** role.

The administrator has full system control, including data import/export, period management, organization management, project management, student time slots, check-in validation, and analytics dashboard.

All routes are protected and role-restricted under `/admin/*`.

---

#  Authentication Flow
/signin → /login → /admin


After successful login, the Administrator is redirected to `/admin`.

---

## Admin Home
/admin


The main page contains the following:

- Import Data
- Export Data
- Check-In
- Edit information
- Filter by student
- Filter by project
- Filter by organization
- Dashboard

A profile icon is accessible on all pages.

---

# 4.1 Import Data

## Route

/admin/import


### Features:

- Upload master data file (organization/project/slot data)
- System parses and validates file
- Confirmation message after successful import
- Button: "Return to Home"

### Flow:

```
/admin
   ↓
/admin/import
   ↓
(Return to /admin)
```
---

# 4.2 Export Data

## Route
/admin/export


### Behavior:

- Automatically downloads full enrollment data
- No intermediate page required

### Flow:

```
/admin
   ↓
/admin/export (download triggered)
```

---

# 4.3 Edit Management

## Route
/admin/edit


### Features:

- Filter/Search: project, organization, student, period
- Button: Edit
- Button: Add 
- Button: Delete 
- Button: Return to Home

### Edit Behavior:

When editing:

- A confirmation modal appears
- If confirmed → changes saved
- If canceled → no changes applied


## Flow
```
/admin
   ↓
/admin/edit
   ↓
(Edit/Add/Delete)
   ↓
(Return to /admin)
```


# 4.4 Check-In

## Route
/admin/checkin


### Features:

- QR Scanner interface
- Validation result display

### Possible Outcomes:

**Successful Check-In**
- Green message: "Check-In Exitoso"

**Failed Check-In**
- Red message: "Check-In Fallido"

Button: Regresar a página de inicio

```
/admin
   ↓
/admin/checkin
   ↓
(Return to /admin)
```

---

# 4.5 Analytics Dashboard

- Graphs and visual analytics
- Total enrolled students
- Enrollment per project
- Capacity usage
- Filters by:
    - Project
    - Period

---

# 4.6 Profile Access (Global)

Accessible from any admin page.

## Route
/admin/profile

### Features:

- View personal information
- Change password
- Return to Home

---

# 4.7 Complete Route Tree Representation
```
/signin
↓
/login
↓
/admin
├── Import Data → /admin/import
├── Export Data → /admin/export
├── Check-In → /admin/checkin
├── Edit Management → /admin/periods
└── Dashboard → /admin/dashboard

/admin/profile (accessible globally)
```
---

# 4.8 Design Characteristics

- Full system control
- CRUD-based entity management
- Confirmation modals for edits
- Import projects
- Export functionality
- QR-based attendance validation
- Filterable analytics dashboard
- Persistent profile access
- Centralized return-to-home navigation

This structure ensures administrative control, system integrity, and operational transparency.


# 5. Complete Route Architecture (All Roles)

This section defines the full route structure of the system for all three roles:

- Student
- Socio-Formador (Partner)
- Administrator

The system follows a role-based route isolation model using prefix segmentation:

- `/student/*`
- `/socio/*`
- `/admin/*`


---
# 5.1  Flow

```
/signin
   ↓
/login
|   ↓
|──/student
|         ↓
|      /student/register
|         ↓
|      /student/register/status
|         ├── (valid) → /student/qr
|         └── (invalid) → /student
|         ↓
|      /student/qr
|         ├── (valid) → /student/confirmation
|         └── (invalid) → /student/register
|         ↓
|      /student/confirmation
|         ↓
|      /student/result
|         ↓
|      /student
|
|      /student/profile (accessible globally)
|
|
|──/socio
|      ├── Select Project → /socio/projects/:project_id
|      │ ├── Generate Code → /socio/projects/:project_id/code
|      │ ├── Project Dashboard → /socio/projects/dashboard
|
|
|──/admin
├── Import Data → /admin/import
├── Export Data → /admin/export
├── Check-In → /admin/checkin
├── Edit Period Management → /admin/edit
└── Dashboard → /admin/dashboard

/admin/profile (accessible globally)
```

# 5.2 Routes
```
/signin
/login

/student
/student/register
/student/register/status
/student/qr
/student/confirmation
/student/result
/student/profile

/socio
/socio/projects/:project_id/code
/socio/profile

/admin
/admin/import
/admin/export
/admin/checkin
/admin/edit
/admin/profile
```

# 6. Library Components
MUI will be the library in use for this project as it's easier to understand and has all the elements needed for the frontend design. It is to be considered that the team in charge of this task has no expierience in the development of an App, hence the importance of using simpler tools. Moreover, MUI will allow us to generate components easily and professionally.


