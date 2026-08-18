# Research Repository — API Contract

## Conventions

- **Content-Type:** `application/json` unless `multipart/form-data` for uploads or file/binary
  download.
- **Timestamps:** ISO 8601 UTC, e.g., `2025-10-01T14:00:00Z`
- **Dates:** `YYYY-MM-DD`, e.g., `2025-09-15`
- **Pagination Response:**

```json
{
  "content": [ ... ],
  "totalElements": 123,
  "totalPages": 7,
  "number": 0,
  "size": 20
}
```

- **Authorization header:** `Authorization: Bearer <access_token>`

---

## Error Handling

### Canonical Error Response

All error responses **MUST** conform to this structure:

```json
{
    "code": "ACCESS_DENIED",
    "message": "You do not have permission to perform this action.",
    "details": [
        {
            "field": "paperId",
            "message": "Paper belongs to another department"
        }
    ],
    "traceId": "7f2c9b18c6e4"
}
```

#### Field Semantics

| Field     | Type   | Required | Description                                                |
| --------- | ------ | -------- | ---------------------------------------------------------- |
| `code`    | string | Yes      | Machine-readable error code (see Error Code Registry)      |
| `message` | string | Yes      | User-safe, localized-ready error message                   |
| `details` | array  | No       | Structured validation errors (for `VALIDATION_ERROR` only) |
| `traceId` | string | No       | Correlation ID for log lookup and support                  |

#### Contract Guarantees

1. `code` is **always present** and stable across versions
1. `message` is **always user-safe** (no stack traces, SQL errors, or file paths)
1. `details` is **structured** (array of `{field, message}` objects, never free-form strings)
1. Frontend **MUST route on `code`** for logic; `message` MAY be used for display purposes

---

### Error Code Registry

| HTTP | Code                   | Category | Meaning                                                         |
| ---- | ---------------------- | -------- | --------------------------------------------------------------- |
| 400  | VALIDATION_ERROR       | Input    | Field-level validation failed                                   |
| 400  | INVALID_REQUEST        | Input    | Malformed JSON or missing required fields                       |
| 401  | UNAUTHENTICATED        | Auth     | Missing or invalid JWT access token                             |
| 401  | REFRESH_TOKEN_REVOKED  | Auth     | Refresh token is invalid, expired, or revoked                   |
| 403  | ACCESS_DENIED          | AuthZ    | User lacks required role or department scope                    |
| 403  | DOMAIN_NOT_ALLOWED     | Auth     | Email domain not in whitelist                                   |
| 404  | RESOURCE_NOT_FOUND     | Data     | Resource does not exist (or user cannot know it exists)         |
| 404  | RESOURCE_NOT_AVAILABLE | Data     | Resource exists but is archived/inaccessible                    |
| 404  | FILE_NOT_FOUND         | System   | Physical file is missing from storage                           |
| 409  | DUPLICATE_REQUEST      | Business | Active request (PENDING/ACCEPTED) already exists for this paper |
| 409  | REQUEST_ALREADY_FINAL  | Business | Cannot modify request in terminal state                         |
| 413  | FILE_TOO_LARGE         | Upload   | File exceeds 20MB limit                                         |
| 415  | UNSUPPORTED_MEDIA_TYPE | Upload   | File is not PDF or DOCX                                         |
| 429  | RATE_LIMIT_EXCEEDED    | System   | Too many requests in time window                                |
| 500  | INTERNAL_ERROR         | System   | Unhandled server error                                          |
| 500  | FILE_STORAGE_ERROR     | System   | File missing on disk or I/O failure                             |
| 503  | SERVICE_UNAVAILABLE    | System   | Database or external service down                               |

---

### Security Considerations

1. **Information Leakage Prevention**
    - `RESOURCE_NOT_AVAILABLE` (archived papers) returns HTTP 404, not 403, to prevent enumeration
    - Students receive identical 404 responses for non-existent papers and papers they cannot access
    - Error messages never reveal internal paths, SQL queries, or stack traces
    - `traceId` is opaque and cannot be used to infer system state
    - All refresh token failures return identical generic messages

1. **Defensive Error Handling**
    - All unhandled exceptions are caught by global exception handler and mapped to `INTERNAL_ERROR`
    - Stack traces are logged server-side but never included in API response
    - Database constraint violations are mapped to appropriate business error codes
    - File path traversal attempts are caught and return `INVALID_REQUEST`

1. **Rate Limiting Errors**
    - Rate limiting is enforced at the proxy layer (e.g., API gateway or reverse proxy).
    - When the proxy returns HTTP 429 it SHOULD include a `Retry-After` header (seconds).
    - Rate limiting is handled at the proxy layer; the backend application does not emit 429 for
      request throttling.
    - Frontend **MUST** disable submission during the retry window when receiving 429.

1. **Audit Requirements**
    - All `FILE_STORAGE_ERROR` occurrences must trigger monitoring alerts
    - All `INTERNAL_ERROR` responses must be logged with full stack trace server-side
    - All authentication failures (`UNAUTHENTICATED`, `REFRESH_TOKEN_REVOKED`) must be logged for
      security monitoring
    - Rate limit violations should be logged for abuse detection

---

## Roles and Access Rules

| Role             | Department | Can View Metadata                               | Can Download/View PDF                           | Can CRUD Papers             | Can Approve/Reject Requests                 |
| ---------------- | ---------- | ----------------------------------------------- | ----------------------------------------------- | --------------------------- | ------------------------------------------- |
| STUDENT          | null       | All non-archived papers, all departments        | Only if request ACCEPTED and paper not archived | No                          | No                                          |
| FACULTY          | null       | All papers, including archived, all departments | Only if request ACCEPTED and paper not archived | No                          | No                                          |
| DEPARTMENT_ADMIN | Required   | All papers, including archived, all departments | Full for their department                       | Full for their department   | Approve/reject requests in their department |
| SUPER_ADMIN      | null       | All papers, including archived, all departments | Full across all departments                     | Full across all departments | Full across all departments                 |

**Note:** This table describes homepage behavior (`/` route, `/api/papers` endpoint). For
admin-specific pages and endpoints (`/api/admin/*`), DEPARTMENT_ADMIN operations are scoped to their
assigned department only. See Admin Papers and Admin Requests sections for department-scoped
behavior.

---

## Authentication

The Refresh Token is **never** exposed in the JSON body. It is handled strictly via HTTP Cookies.

### POST /api/auth/google

- **Public.** Exchanges Google ID token for JWT access token and sets the refresh token cookie.

**Request:**

```json
{ "code": "OAuthCode" }
```

**Responses:**

- **200 OK**
    - **Headers:**
      `Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/; Max-Age=2592000`

    - **Body:**

        ```json
        {
            "accessToken": "<jwt_token>",
            "user": {
                "userId": 1,
                "email": "alice@acdeducation.com",
                "fullName": "Alice Student",
                "role": "STUDENT",
                "department": null,
                "profilePictureUrl": "https://lh3.googleusercontent.com/a/default-user=s96-c"
            }
        }
        ```

- **400 INVALID_TOKEN**

    ```json
    {
        "code": "INVALID_TOKEN",
        "message": "Authentication failed",
        "traceId": "..."
    }
    ```

- **403 DOMAIN_NOT_ALLOWED**

    ```json
    {
        "code": "DOMAIN_NOT_ALLOWED",
        "message": "Email domain not allowed",
        "traceId": "..."
    }
    ```

### POST /api/auth/refresh

- **Public (no JWT required).** Exchanges the cookie-based refresh token for a new access token and
  rotates the refresh token.
- **Important:** Although this endpoint is public (does not require an `Authorization` header), it
  requires a valid `refreshToken` present in an `HttpOnly` cookie. The browser attaches this cookie
  automatically; frontend code must not attempt to read or store the refresh token directly.

**Request:**

- **Headers:** `Cookie: refreshToken=<refresh_token>`
- **Body:** _(Empty)_

**Responses:**

- **200 OK**
    - **Headers:**
      `Set-Cookie: refreshToken=<new_refresh_token>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/; Max-Age=2592000`

    - **Body:**

        ```json
        {
            "accessToken": "<new_jwt_token>"
        }
        ```

- **401 UNAUTHORIZED**
    - Occurs if the cookie is missing, expired, revoked, or if the token has already been used.

    ```json
    {
        "code": "REFRESH_TOKEN_REVOKED",
        "message": "Refresh token expired or missing",
        "traceId": "..."
    }
    ```

### POST /api/auth/logout

- **Public (no JWT required).** Logs the user out by revoking the refresh token in the DB and
  clearing the cookie in the browser.
- **Important:** Although this endpoint is public (does not require an `Authorization` header), it
  requires the `refreshToken` to be present in an `HttpOnly` cookie. The browser attaches this cookie
  automatically; frontend code must not attempt to read or store the refresh token directly.

**Request:**

- **Headers:** `Cookie: refreshToken=<refresh_token>`
- **Body:** _(Empty)_

**Responses:**

- **200 OK**
    - **Headers:**
      `Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/; Max-Age=0`

    - **Body:**

        ```json
        { "message": "Logged out successfully" }
        ```

**Notes:**

1. **Rotation:** The old refresh token (from the request cookie) is invalidated. A new one is issued
   in the response `Set-Cookie` header.
1. **Security:** The browser manages the cookie storage automatically. The frontend must **not**
   attempt to read or store this token manually.
1. **Logout:** The `Max-Age=0` directive in the logout response forces the browser to delete the
   cookie immediately.

### GET /api/users/me

- **Authentication:** JWT required
- **Authorization:** All authenticated users
- **Returns:** Current user object with profile details
- **403 ACCESS_DENIED** if user lacks required permissions
- **401 UNAUTHENTICATED** if no JWT or token is invalid

**Response (200 OK):**

```json
{
    "userId": 1,
    "email": "alice@acdeducation.com",
    "fullName": "Alice Student",
    "role": "STUDENT",
    "department": null,
    "profilePictureUrl": "https://lh3.googleusercontent.com/a/default-user=s96-c"
}
```

**Field Descriptions:**

| Field               | Type   | Description                                                        |
| ------------------- | ------ | ------------------------------------------------------------------ |
| `userId`            | number | Unique identifier for the user                                     |
| `email`             | string | User's email (verified by Google SSO)                              |
| `fullName`          | string | User's full name from Google profile                               |
| `role`              | string | User role: `STUDENT`, `FACULTY`, `DEPARTMENT_ADMIN`, `SUPER_ADMIN` |
| `department`        | object | Department info (only for `DEPARTMENT_ADMIN`, otherwise null)      |
| `profilePictureUrl` | string | Google profile picture URL (nullable, may be null)                 |

---

## Filters

### GET /api/filters/years

- **Authentication:** JWT required
- **Response:** `{ "years": number[] }` - An object containing array of years

**Authorization Scoping:**

- **STUDENT**: Only years with non-archived papers (all departments)
- **FACULTY**: All years with papers, including archived (all departments)
- **DEPARTMENT_ADMIN**: All years with papers, including archived (all departments)
- **SUPER_ADMIN**: All years with papers, including archived (all departments)

**Response Example:**

```json
{
    "years": [2025, 2024, 2023, 2022]
}
```

**Notes:**

- Returns years in descending order (newest first)
- Empty array if no papers exist within user's scope
- If no years are available, returns `204 No Content`
- Years are extracted from paper `submissionDate` field
- Frontend may filter displayed options based on page context (e.g., show only user's department
  years on admin pages using auth context)

---

### GET /api/filters/departments

- **Authentication:** JWT required
- **Response:** `{ "departments": Department[] }` - An object containing array of departments

**Authorization Scoping:**

- **STUDENT**: All departments (all departments)
- **FACULTY**: All departments (all departments)
- **DEPARTMENT_ADMIN**: All departments (all departments)
- **SUPER_ADMIN**: All departments (all departments)

**Response Example:**

```json
{
    "departments": [
        { "departmentId": 1, "departmentName": "Computer Science" },
        { "departmentId": 2, "departmentName": "Mathematics" },
        { "departmentId": 3, "departmentName": "Physics" }
    ]
}
```

**Notes:**

- Only includes departments that have at least one paper within user's scope
- Empty array if no departments have accessible papers
- If no departments are available, returns `204 No Content`
- Frontend may filter displayed options based on page context (e.g., show only user's department on
  admin pages using auth context)

---

## Papers

### GET /api/papers

- **Authentication:** JWT required
- **Response:** Paginated `ResearchPaper[]`

**Query Parameters:**

| Parameter      | Type   | Required | Description                                                                 |
| -------------- | ------ | -------- | --------------------------------------------------------------------------- |
| `page`         | number | No       | Zero-indexed page number (default: 0)                                       |
| `size`         | number | No       | Results per page (default: 20, max: 100)                                    |
| `search`       | string | No       | Full-text search across title, author name, and abstract (case-insensitive) |
| `departmentId` | string | No       | Comma-separated list of department IDs (multiselect)                        |
| `year`         | string | No       | Comma-separated list of by submission year (multiselect)                    |
| `archived`     | string | No       | Filter archived status: "true" or "false" (Admin-only)                      |
| `sortBy`       | string | No       | Sort field: `submissionDate` (default), `title`, `authorName`               |
| `sortOrder`    | string | No       | Sort direction: `desc` (default), `asc`                                     |

**Search Behavior:**

- **Case-insensitive** matching across `title`, `authorName`, and `abstractText` fields
- **SQL injection protection:** All search terms are parameterized
- **Empty search:** Returns all papers within user's scope (no filtering applied)
- **Special characters:** Handled safely; wildcards are not supported
- **Partial matching:** Searches for substring matches (e.g., "machine" matches "Machine Learning")
- **Note:** Field names follow API camelCase convention; backend maps to database snake_case fields
  (`author_name`, `abstract_text`)

**Authorization Scoping:**

| Role             | Scope                                           | Can Use `archived` Param |
| ---------------- | ----------------------------------------------- | ------------------------ |
| STUDENT          | Non-archived papers only (all departments)      | ❌ (403 ACCESS_DENIED)   |
| FACULTY          | All papers including archived (all departments) | ❌ (403 ACCESS_DENIED)   |
| DEPARTMENT_ADMIN | All papers (all departments)                    | ✅                       |
| SUPER_ADMIN      | All papers (all departments)                    | ✅                       |

**Important:** DEPARTMENT_ADMIN department scoping applies **only** to `/api/admin/papers` and
`/api/admin/requests` endpoints, not to `/api/papers`. This endpoint always returns papers from all
departments for DEPARTMENT_ADMIN, matching the homepage behavior.

**Response Example:**

```json
{
    "content": [
        {
            "paperId": 123,
            "title": "Machine Learning in Healthcare",
            "authorName": "Dr. Jane Smith",
            "abstractText": "This paper explores the application of machine learning.. .",
            "department": {
                "departmentId": 1,
                "departmentName": "Computer Science"
            },
            "submissionDate": "2023-09-15",
            "filePath": "2023/dept_cs/paper_123.pdf",
            "archived": false,
            "archivedAt": null
        }
    ],
    "totalElements": 45,
    "totalPages": 3,
    "number": 0,
    "size": 20
}
```

**Error Codes:**

| Condition                             | HTTP | Code            | Message                                                          |
| ------------------------------------- | ---- | --------------- | ---------------------------------------------------------------- |
| Student/Faculty uses `archived` param | 403  | ACCESS_DENIED   | "You do not have permission to filter by archived status"        |
| Invalid `sortBy` value                | 400  | INVALID_REQUEST | "Invalid sort field. Must be: submissionDate, title, authorName" |
| Invalid `sortOrder` value             | 400  | INVALID_REQUEST | "Invalid sort order. Must be: asc, desc"                         |
| Invalid `year` format                 | 400  | INVALID_REQUEST | "Invalid year format. Must be a 4-digit year (e.g., 2023)"       |
| Invalid `departmentId` format         | 400  | INVALID_REQUEST | "Invalid department ID format"                                   |
| Invalid `page` or `size`              | 400  | INVALID_REQUEST | "Invalid pagination parameters"                                  |

**Security Considerations:**

- **SQL injection prevention:** All parameters are properly escaped and parameterized
- **Enumeration attack prevention:** Students receive identical responses for non-existent and
  inaccessible papers
- **Role-based filtering:** Backend enforces role-specific scoping regardless of client-provided
  parameters
- **Department ID validation:** Invalid department IDs are rejected with 400 error

### GET /api/papers/{id}

- **Authentication:** JWT required
- **Path Parameter:** `id` (number) — Paper ID
- **Response:** `ResearchPaper` object
- **Authorization Scoping:**
    - **STUDENT:** Only non-archived papers, all departments
    - **FACULTY:** All papers, including archived, all departments
    - **DEPARTMENT_ADMIN:** All papers, including archived, all departments
    - **SUPER_ADMIN:** All papers, including archived, all departments

**Error Codes:**

| Condition                                  | HTTP | Code                   | Message               |
| ------------------------------------------ | ---- | ---------------------- | --------------------- |
| Paper does not exist or inaccessible       | 404  | RESOURCE_NOT_FOUND     | "Paper not found"     |
| Paper is archived (student/faculty access) | 404  | RESOURCE_NOT_AVAILABLE | "Paper not available" |
| Invalid paper ID format                    | 400  | INVALID_REQUEST        | "Invalid paper ID"    |

**Security:** Students/faculty receive identical 404 for non-existent and inaccessible/archived
papers.

### GET /api/papers/{paperId}/my-request

Returns the current user's request for the specified paper, if it exists. Available to STUDENT and FACULTY roles.

**Path Parameters:**
- `paperId` (integer, required)

**Request:** No body.

**Response (200 OK):**

```json
{
    "requestId": 42,
    "status": "PENDING",
    "createdAt": "2024-06-01T12:00:00Z",
    "updatedAt": "2024-06-01T12:00:00Z"
}
```

**Field Descriptions:**

| Field       | Type   | Description                                 |
|-------------|--------|---------------------------------------------|
| `requestId` | number | Unique identifier for the request           |
| `status`    | string | Current status: `PENDING`, `ACCEPTED`, or `REJECTED` |
| `createdAt` | string | ISO 8601 timestamp of when the request was created |
| `updatedAt` | string | ISO 8601 timestamp of the last status change |

**Error Codes:**

| Condition                     | HTTP | Code               | Message                           |
|-------------------------------|------|--------------------|-----------------------------------|
| No request for this paper/user | 404  | RESOURCE_NOT_FOUND | "Request not found"               |
| Missing/Invalid JWT           | 401  | UNAUTHENTICATED    | "Authentication required"         |

---

## Submissions

Student-facing endpoints for submitting, listing, updating, and deleting research papers that await
administrative review. Submissions are stored in the `research_papers` table with status
`PENDING_REVIEW`. Only the `STUDENT` role may create submissions; `DEPARTMENT_ADMIN` and
`SUPER_ADMIN` review them via `PUT /api/admin/papers/{id}/approve` and
`PUT /api/admin/papers/{id}/reject-submission`.

### POST /api/submissions

Submit a new paper. Creates a `PENDING_REVIEW` submission and notifies the department's admins.
Uses `multipart/form-data`.

- **Authentication:** JWT Required (`STUDENT` only)
- **Email restriction:** Only accounts with an `@acdeducation.com` email may submit.
- **Content-Type:** `multipart/form-data`
- **Request Parts:**
  - `metadata`: Stringified JSON. Must conform to the [paper validation rules](#validation-rules).
  ```json
  {
      "title": "Impact of AI in Ethics",
      "authorName": "Sarah Jenkins",
      "abstractText": "This research analyzes...",
      "departmentId": 1,
      "submissionDate": "2025-11-20"
  }
  ```
  - `file`: The binary PDF or DOCX file (max 20MB). Required.
- **Response (201 Created):** Returns the created `ResearchPaper`.
- **Notification:** `NEW_SUBMISSION` sent to all `DEPARTMENT_ADMIN` users of the paper's department
  (related entity = the paper).

### GET /api/submissions

Retrieve a paginated list of the authenticated user's own submissions. Any authenticated user may
list their uploads.

- **Authentication:** JWT Required
- The result is always scoped to the caller's own uploads — no other user's papers are returned.

**Query Parameters:**

| Parameter      | Type   | Required | Description                                                              |
| -------------- | ------ | -------- | ------------------------------------------------------------------------ |
| `page`         | number | No       | Zero-indexed page number (default: 0)                                    |
| `size`         | number | No       | Results per page (default: 20, max: 100)                                 |
| `search`       | string | No       | Full-text search across title, author name, and abstract                 |
| `status`       | string | No       | Filter by paper status: `ACTIVE`, `PENDING_REVIEW`, or `REJECTED`        |
| `sortBy`       | string | No       | Sort field: `submissionDate` (default), `title`, `authorName`            |
| `sortOrder`    | string | No       | Sort direction: `desc` (default), `asc`                                  |

- **Response (200 OK):** Paginated `ResearchPaper[]`.

### PUT /api/submissions/{id}

Update a pending submission's metadata. The file part is optional — omit it to keep the current file.

- **Authentication:** JWT Required
- **Authorization:** Only the submitter may update their submission, and only while it is
  `PENDING_REVIEW`.
- **Content-Type:** `multipart/form-data`
- **Request Parts:**
  - `metadata`: Stringified JSON (same schema as POST).
  - `file`: Optional binary PDF or DOCX file (max 20MB). When omitted, the existing file is kept.
- **Department change:** If `departmentId` changes, the stored file is relocated to the new
  department's folder (or replaced to track a new upload).
- **Response (200 OK):** Returns the updated `ResearchPaper`.

### DELETE /api/submissions/{id}

Delete a pending submission and its stored file.

- **Authentication:** JWT Required
- **Authorization:** Only the submitter may delete their submission, and only while it is
  `PENDING_REVIEW`.
- **Response:** `204 No Content`

**Submissions Error Codes:**

| Condition                                   | HTTP | Code                  | Message                                          |
| ------------------------------------------- | ---- | --------------------- | ------------------------------------------------ |
| Non-student attempting to submit            | 403  | `ACCESS_DENIED`       | "Only students can submit papers"                |
| Email not from allowed domain               | 403  | `ACCESS_DENIED`       | "Only @acdeducation.com emails can submit papers" |
| Department not found                        | 400  | `VALIDATION_ERROR`    | "Department not found"                           |
| Uploader mismatch                           | 403  | `ACCESS_DENIED`       | "You do not have access to this paper"           |
| Paper not in PENDING_REVIEW (edit/delete)   | 400  | `INVALID_REQUEST`     | "Only PENDING_REVIEW submissions can be edited/deleted" |
| Metadata JSON is malformed                  | 400  | `INVALID_REQUEST`     | "The metadata part must be valid JSON."         |
| File uploaded is not PDF/DOCX               | 415  | `UNSUPPORTED_MEDIA_TYPE` | "Only PDF and DOCX files are allowed."         |
| Required field missing (e.g., title)        | 400  | `VALIDATION_ERROR`    | "Title is required."                            |
| Paper not found                             | 404  | `RESOURCE_NOT_FOUND` | "Paper not found"                               |

---

## Student/Faculty Requests

### GET /api/users/me/requests

Retrieve a paginated and filterable list of requests created by the authenticated user.

- **Authentication:** JWT Required (`STUDENT` or `FACULTY`).
- **Authorization:** Users can only see their own requests.
- **Query Parameters:**

| Parameter   | Type   | Required | Description                                                     |
| ----------- | ------ | -------- | --------------------------------------------------------------- |
| `page`      | number | No       | Zero-indexed page number (default: 0).                          |
| `size`      | number | No       | Results per page (default: 20, max: 100).                       |
| `status`    | string | No       | Filter by request status: `PENDING`, `ACCEPTED`, or `REJECTED`. |
| `search`    | string | No       | Partial match against `paper.title` or `paper.authorName`.      |
| `sortBy`    | string | No       | Sort field: `createdAt` (default), `paper.title`, or `status`.  |
| `sortOrder` | string | No       | Sort direction: `desc` (default) or `asc`.                      |

- **Response (200 OK):**

```json
{
    "content": [
        {
            "requestId": 42,
            "status": "PENDING",
            "createdAt": "2024-06-01T12:00:00Z",
            "updatedAt": "2024-06-01T12:00:00Z",
            "paper": {
                "paperId": 123,
                "title": "Machine Learning in Healthcare",
                "authorName": "Dr. Jane Smith",
                "abstractText": "This paper explores the application of machine learning...",
                "department": {
                    "departmentId": 1,
                    "departmentName": "Computer Science"
                },
                "submissionDate": "2023-09-15",
                "filePath": "2023/dept_cs/paper_123.pdf",
                "archived": false,
                "archivedAt": null
            }
        }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "number": 0,
    "size": 20
}
```

- **Notes:**

- **Archived Papers:** This endpoint SHOULD return the authenticated user's requests even if the
  associated paper has been archived, with the following constraints to avoid information leakage:
    - The returned request object MUST include `requestId`, `status`, `createdAt`, `updatedAt`, and
      a minimal `paper` summary containing `paperId`, `title`, `department` and `archived: true`.
    - The `paper` object MUST NOT include sensitive fields such as `filePath` or download links for
      archived papers.
    - The UI SHOULD prominently indicate the paper is archived and allow the user to remove the
      request row (DELETE). Users MUST NOT be allowed to create new requests for archived papers.
    - This change allows users to see and remove their historical requests while preserving
      information security for archived resources.

- **Metadata:** Includes the full `paper` and nested `department` objects to allow the frontend to
  render the card/row without secondary API calls.

- **Error Codes:**

| Condition             | HTTP | Code              | Message                                                  |
| --------------------- | ---- | ----------------- | -------------------------------------------------------- |
| Missing/Invalid JWT   | 401  | `UNAUTHENTICATED` | "Authentication required"                                |
| Invalid status filter | 400  | `INVALID_REQUEST` | "Invalid status. Must be PENDING, ACCEPTED, or REJECTED" |
| Invalid sort field    | 400  | `INVALID_REQUEST` | "Invalid sort field"                                     |

---

### POST /api/requests

Create a new access request for a research paper.

- **Request Body:**

```json
{
    "paperId": 123
}
```

- **Constraints:**

- Only one active (`PENDING` or `ACCEPTED`) request allowed per user/paper.

- Users can only request access to non-archived papers.

- **Response (201 Created):**

```json
{
    "requestId": 42,
    "status": "PENDING"
}
```

- **Errors:**
- `404 RESOURCE_NOT_FOUND`: Paper does not exist or is archived.
- `409 DUPLICATE_REQUEST`: An active request already exists for this paper.

---

### DELETE /api/requests/{requestId}

Cancel a `PENDING` request or remove a `REJECTED` request from the user's history.

- **Authorization:** Returns `404 RESOURCE_NOT_FOUND` if the request does not belong to the user
  (security through obscurity).
- **Constraints:** `ACCEPTED` requests cannot be deleted (they must be revoked by an Admin or the
  paper must be archived).
- **Constraints:** `ACCEPTED` requests cannot be deleted by the requesting user. They must be
  revoked by an Admin. Archiving the associated paper will also revoke access (see Archiving
  behavior below).
- **Response:** `204 No Content`

---

## Admin Requests

### GET /api/admin/requests

Retrieve a paginated and filterable list of document access requests.

- **Authentication:** JWT required.
- **Roles:** `DEPARTMENT_ADMIN` (restricted to own department) or `SUPER_ADMIN` (global access).

**Request Query Parameters**

| Parameter      | Type   | Required | Description                                                                                                        |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `page`         | number | No       | Zero-indexed page number (default: 0).                                                                             |
| `size`         | number | No       | Results per page (default: 20, max: 100).                                                                          |
| `search`       | string | No       | Case-insensitive partial match against `user.fullName`, `user.email`, or `paper.title`.                            |
| `status`       | string | No       | Filter by status: `PENDING`, `ACCEPTED`, or `REJECTED`. Supports comma-separated lists (e.g., `PENDING,ACCEPTED`). |
| `departmentId` | string | No       | **SUPER_ADMIN only.** Filter by specific department ID. Must be rejected with 400 for `DEPARTMENT_ADMIN`.          |
| `sortBy`       | string | No       | Sort field: `createdAt` (default), `status`, `paper.title`, or `user.fullName`.                                    |
| `sortOrder`    | string | No       | Sort direction: `desc` (default) or `asc`.                                                                         |

**Response Body (200 OK)**

The response uses the canonical pagination format with fully expanded user and paper objects to
prevent secondary API round-trips.

```json
{
    "content": [
        {
            "requestId": 42,
            "status": "PENDING",
            "createdAt": "2024-06-01T12:00:00Z",
            "updatedAt": "2024-06-01T12:00:00Z",
            "user": {
                "userId": 100,
                "email": "student@acdeducation.com",
                "fullName": "Jane Doe",
                "role": "STUDENT"
            },
            "paper": {
                "paperId": 123,
                "title": "Neural Network Efficiency",
                "authorName": "Dr. Smith",
                "abstractText": "This paper discusses...",
                "department": {
                    "departmentId": 1,
                    "departmentName": "Computer Science"
                },
                "submissionDate": "2023-09-15",
                "filePath": "2023/dept_cs/paper_123.pdf",
                "archived": false,
                "archivedAt": null
            }
        }
        /* additional requests omitted for brevity */
    ],
    "totalElements": 1,
    "totalPages": 1,
    "number": 0,
    "size": 20
}
```

**Authorization & Security Rules**

- **Department Scoping:** `DEPARTMENT_ADMIN` access is strictly scoped to their assigned department.
  The backend must automatically append `WHERE paper.department_id = user.department_id` to the
  query.
- **Information Concealment:** Attempts by a `DEPARTMENT_ADMIN` to query or search for requests
  outside their department must return `403 ACCESS_DENIED`.
- **Status Transitions:** Only `PENDING` requests may be modified. `ACCEPTED` and `REJECTED` are
  terminal states.

**Error Codes**

| Condition                            | HTTP | Code              | Message                                                            |
| ------------------------------------ | ---- | ----------------- | ------------------------------------------------------------------ |
| Missing/Invalid JWT                  | 401  | `UNAUTHENTICATED` | "Authentication required".                                         |
| Cross-department access              | 403  | `ACCESS_DENIED`   | "You do not have permission to view requests for this department". |
| Admin attempts `departmentId` filter | 400  | `INVALID_REQUEST` | "departmentId filter not permitted for your role".                 |
| Invalid status value                 | 400  | `INVALID_REQUEST` | "Invalid status. Must be PENDING, ACCEPTED, or REJECTED".          |

### PUT /api/admin/requests/{requestId}/accept

Approve a pending document access request. Sets the status from `PENDING` to `ACCEPTED`. Only
`DEPARTMENT_ADMIN` (for their department) or `SUPER_ADMIN` can perform this operation.

- **Authentication:** JWT required.

- **Authorization:**
    - `DEPARTMENT_ADMIN` may only approve requests for papers within their assigned department.
    - `SUPER_ADMIN` may approve any request.

- **Path Parameter:**
    - `requestId` (integer, required): ID of the document request.

- **Request Body:**

    ```json
    {}
    ```

    _(Empty body. All necessary info is in the path and user context.)_

- **Business Rules:**
    - Only requests with `status: "PENDING"` can be approved.
    - Approving sets the request's status to `ACCEPTED` and updates `updatedAt`.
    - Cannot approve requests outside the admin’s department (`DEPARTMENT_ADMIN`).
    - Cannot approve requests for archived papers (should not be possible via normal UI, enforced
      for safety).
    - Side effect: Grants user access to download/view the corresponding paper.

- **Response (200 OK):**

    ```json
    {
        "requestId": 42,
        "status": "ACCEPTED",
        "createdAt": "2024-06-01T12:00:00Z",
        "updatedAt": "2024-06-02T14:00:00Z",
        "user": {
            "userId": 100,
            "email": "student@acdeducation.com",
            "fullName": "Jane Doe",
            "role": "STUDENT"
        },
        "paper": {
            "paperId": 123,
            "title": "Neural Network Efficiency",
            "authorName": "Dr. Smith",
            "abstractText": "This paper discusses...",
            "department": {
                "departmentId": 1,
                "departmentName": "Computer Science"
            },
            "submissionDate": "2023-09-15",
            "filePath": "2023/dept_cs/paper_123.pdf",
            "archived": false,
            "archivedAt": null
        }
    }
    ```

- **Error Codes:**

| Condition                             | HTTP | Code                     | Message                                                               |
| ------------------------------------- | ---- | ------------------------ | --------------------------------------------------------------------- |
| Request does not exist                | 404  | `RESOURCE_NOT_FOUND`     | "Request not found"                                                   |
| Request not `PENDING`                 | 409  | `REQUEST_ALREADY_FINAL`  | "Request is already in a terminal state"                              |
| Not authorized for this department    | 403  | `ACCESS_DENIED`          | "You do not have permission to approve requests for this department." |
| Missing/invalid JWT                   | 401  | `UNAUTHENTICATED`        | "Authentication required."                                            |
| Non-admin role                        | 403  | `ACCESS_DENIED`          | "Admin privileges required."                                          |
| Request for archived or missing paper | 404  | `RESOURCE_NOT_AVAILABLE` | "Paper not available"                                                 |

- **Notes:**
    - Status transition is idempotent. If called on a request already in terminal state (`ACCEPTED`,
      `REJECTED`), an error is returned.
    - All state transitions are audit-logged (timestamp, admin user, old/new status).

---

### PUT /api/admin/requests/{requestId}/reject

Reject a document access request or revoke previously granted access. Sets the status from `PENDING`
or `ACCEPTED` to `REJECTED`. Only `DEPARTMENT_ADMIN` (for their department) or `SUPER_ADMIN` can
perform this operation.

- **Authentication:** JWT required.

- **Authorization:**
    - `DEPARTMENT_ADMIN` may only reject requests for papers within their assigned department.
    - `SUPER_ADMIN` may reject any request.

- **Path Parameter:**
    - `requestId` (integer, required): ID of the document request.

- **Request Body:**

    ```json
    {
        "reason": "Insufficient justification"
    }
    ```

    _(Optional: `reason` may be omitted; if provided, it will be recorded and returned in the
    response)_

- **Business Rules:**
    - Requests with `status: "PENDING"` or `status: "ACCEPTED"` can be rejected (revocation
      allowed).
    - Requests already in `status: "REJECTED"` cannot be rejected again (terminal state).
    - Rejecting sets the request's status to `REJECTED`, updates `updatedAt`, and stores an optional
      rejection reason.
    - Cannot reject requests outside the admin's department (`DEPARTMENT_ADMIN`).
    - Archiving a paper automatically transitions active requests (PENDING or ACCEPTED) for that
      paper to `REJECTED`. If a request has already been transitioned due to archiving, attempting
      to reject it will return `REQUEST_ALREADY_FINAL`.
    - Once rejected, the user loses eligibility to download/view the full document.

- **Response (200 OK):**

    ```json
    {
        "requestId": 42,
        "status": "REJECTED",
        "reason": "Insufficient justification",
        "createdAt": "2024-06-01T12:00:00Z",
        "updatedAt": "2024-06-02T14:30:00Z",
        "user": {
            "userId": 100,
            "email": "student@acdeducation.com",
            "fullName": "Jane Doe",
            "role": "STUDENT"
        },
        "paper": {
            "paperId": 123,
            "title": "Neural Network Efficiency",
            "authorName": "Dr. Smith",
            "abstractText": "This paper discusses...",
            "department": {
                "departmentId": 1,
                "departmentName": "Computer Science"
            },
            "submissionDate": "2023-09-15",
            "filePath": "2023/dept_cs/paper_123.pdf",
            "archived": false,
            "archivedAt": null
        }
    }
    ```

- **Error Codes:**

| Condition                             | HTTP | Code                     | Message                                                              |
| ------------------------------------- | ---- | ------------------------ | -------------------------------------------------------------------- |
| Request does not exist                | 404  | `RESOURCE_NOT_FOUND`     | "Request not found"                                                  |
| Request already `REJECTED`            | 409  | `REQUEST_ALREADY_FINAL`  | "Request is already in a terminal state"                             |
| Not authorized for this department    | 403  | `ACCESS_DENIED`          | "You do not have permission to reject requests for this department." |
| Missing/invalid JWT                   | 401  | `UNAUTHENTICATED`        | "Authentication required."                                           |
| Non-admin role                        | 403  | `ACCESS_DENIED`          | "Admin privileges required."                                         |
| Request for archived or missing paper | 404  | `RESOURCE_NOT_AVAILABLE` | "Paper not available"                                                |
| Reason exceeds max length             | 400  | `VALIDATION_ERROR`       | "Reason must be at most 255 characters."                             |

- **Notes:**
    - The `reason` field is optional, max 255 chars, stored in the backend if provided, and included
      in rejection notification to the user.
    - Admins can reject PENDING requests (rejection) or ACCEPTED requests (revocation of previously
      granted access).
    - REJECTED is a terminal state—requests already rejected cannot be rejected again.
    - Users whose requests are rejected must create a new request to re-apply for access.
    - All state transitions are audit-logged (timestamp, admin user, old/new status, and rejection
      reason).

---

## Admin Papers (CRUD)

### GET /api/admin/papers

Retrieve a paginated list of all research papers for administrative management. This view includes
archived papers and enforces strict department-level isolation for `DEPARTMENT_ADMIN` roles.

- **Authentication:** JWT Required (`DEPARTMENT_ADMIN` or `SUPER_ADMIN`)
- **Authorization Scoping:**
- **DEPARTMENT_ADMIN:** Backend strictly enforces `WHERE department_id = user.dept_id`. Attempts to
  bypass this via query parameters must be ignored or rejected.
- **SUPER_ADMIN:** Full global access.

**Query Parameters:**

| Parameter      | Type    | Required | Description                                                                                                |
| -------------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `page`         | number  | No       | Zero-indexed page number (default: 0).                                                                     |
| `size`         | number  | No       | Results per page (default: 20, max: 100).                                                                  |
| `search`       | string  | No       | Full-text search across `title`, `authorName`, and `abstractText`.                                         |
| `departmentId` | string  | No       | Comma-separated list of department IDs (multiselect). **SUPER_ADMIN only** — ignored for DEPARTMENT_ADMIN. |
| `year`         | string  | No       | Comma-separated list of submission years (multiselect).                                                    |
| `archived`     | boolean | No       | Filter by archived status (true/false). If omitted, returns both.                                          |
| `sortBy`       | string  | No       | `submissionDate` (default), `title`, `authorName`.                                                         |
| `sortOrder`    | string  | No       | `desc` (default), `asc`.                                                                                   |

**Note:** The `departmentId` parameter is only effective for `SUPER_ADMIN`. For `DEPARTMENT_ADMIN`,
this parameter is ignored and results are always scoped to their assigned department.

**Request Example:**
`GET /api/admin/papers?page=0&size=10&search=Quantum&departmentId=1,2&year=2024,2025&archived=false&sortBy=title&sortOrder=asc`

**Response Body (200 OK):**

```json
{
    "content": [
        {
            "paperId": 123,
            "title": "Quantum Computing Trends",
            "authorName": "Dr. Aris Thorne",
            "abstractText": "Detailed exploration of qubits and error correction...",
            "department": {
                "departmentId": 1,
                "departmentName": "Computer Science"
            },
            "submissionDate": "2025-12-01",
            "filePath": "2025/dept_1/paper_123.pdf",
            "archived": false,
            "archivedAt": null
        }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "number": 0,
    "size": 10
}
```

**Error Codes:**

| Condition               | HTTP | Code              | Message                     |
| ----------------------- | ---- | ----------------- | --------------------------- |
| Missing/Invalid JWT     | 401  | `UNAUTHENTICATED` | "Authentication required"   |
| Non-admin role          | 403  | `ACCESS_DENIED`   | "Admin privileges required" |
| Invalid pagination/sort | 400  | `INVALID_REQUEST` | "Invalid query parameters"  |

### POST /api/admin/papers

Create a new paper and upload its file. This uses `multipart/form-data`.

- **Authentication:** JWT Required
- **Content-Type:** `multipart/form-data`
- **Request Parts:**
- `metadata`: Stringified JSON.

```json
{
    "title": "Impact of AI in Ethics",
    "authorName": "Sarah Jenkins",
    "abstractText": "This research analyzes...",
    "departmentId": 1,
    "submissionDate": "2025-11-20"
}
```

- `file`: The binary PDF or DOCX file (Max 20MB).

- **Enforcement:** `DEPARTMENT_ADMIN` must provide a `departmentId` matching their own; otherwise,
  return `403 ACCESS_DENIED`.

- **Response (201 Created):** Returns the newly created `ResearchPaper` object.

---

### PUT /api/admin/papers/{id}

Update the metadata of an existing paper. **Note:** To update the physical file, the user must
delete and re-create the paper (standard MVP behavior).

- **Authentication:** JWT Required
- **Request Body:**

```json
{
    "title": "Updated Title",
    "authorName": "Updated Author",
    "abstractText": "Updated abstract content...",
    "departmentId": 1,
    "submissionDate": "2025-11-21"
}
```

- **Authorization:** `DEPARTMENT_ADMIN` cannot update papers belonging to other departments.
- **Response (200 OK):** Returns the updated `ResearchPaper` object.

---

### PUT /api/admin/papers/{id}/archive

### PUT /api/admin/papers/{id}/unarchive

Idempotent endpoints to toggle paper visibility.

- **Authentication:** JWT Required
- **Response:** `200 OK` (no body)

**Archiving behavior and side-effects**

- When an admin archives a paper, the system MUST perform the following deterministic actions to
  prevent information leakage and to revoke access:
    - All `PENDING` requests for the paper MUST be transitioned to `REJECTED`. When possible, the
      system SHOULD set the optional `rejection_reason` to `"Paper archived"`, but the field remains
      optional to preserve backward compatibility.
    - All `ACCEPTED` requests for the paper MUST be revoked by transitioning to `REJECTED`
      (revocation). When possible, the system SHOULD set the optional `rejection_reason` to
      `"Paper archived"`; implementations MUST NOT rely on the presence of the `rejection_reason`
      field.
    - All such transitions MUST be audit-logged (admin/system actor, timestamp, old/new status, and
      `rejection_reason`).
    - The system SHOULD notify affected users that their request has been rejected due to the paper
      being archived. Notifications are delivered via SSE — see
      [Real-time Notifications](#real-time-and-inbox-notifications-sse).

- Effects on endpoints:
    - `GET /api/users/me/requests` SHOULD return the authenticated user's requests for archived
      papers (typically `REJECTED`) so the user can view and optionally remove their request row using [DELETE /api/requests/{requestId}](#delete-apirequestsrequestid).
    - Returned request objects MUST include `requestId`, `status`, `createdAt`, `updatedAt` and a
      minimal `paper` summary with `paperId`, `title`, `department`, and `archived: true` only. The
      `paper` object MUST NOT include sensitive fields such as `filePath` or download links for
      archived papers. Users MUST NOT be allowed to create new requests for archived papers.
    - Admin endpoints (`/api/admin/*`) MAY continue to surface historical requests for archived
      papers (now marked `REJECTED`) so admins can audit and view history.

---

### PUT /api/admin/papers/{id}/approve

Approve a paper submission, transitioning it from `PENDING_REVIEW` to `ACTIVE` and making it
publicly visible. Sends a `SUBMISSION_APPROVED` notification to the submitting user.

- **Authentication:** JWT Required (`DEPARTMENT_ADMIN` or `SUPER_ADMIN`)
- **Authorization:** Paper must belong to the admin's own department (for `DEPARTMENT_ADMIN`).
- **Process:** 1. Paper must be in `PENDING_REVIEW`. 2. Move to `ACTIVE`.
- **Response (200 OK):** Returns the updated `ResearchPaper` object.

**Error Codes:**

| Condition                         | HTTP | Code               | Message                                          |
| --------------------------------- | ---- | ------------------ | ------------------------------------------------ |
| Paper not found                   | 404  | `RESOURCE_NOT_FOUND` | "Paper not found"                              |
| Paper not pending review          | 400  | `INVALID_REQUEST`  | "Only PENDING_REVIEW submissions can be approved" |
| Wrong department                  | 403  | `ACCESS_DENIED`    | "You can only manage papers within your department." |

---

### PUT /api/admin/papers/{id}/reject-submission

Reject a paper submission. The paper and its stored file are **permanently deleted** and a
`SUBMISSION_REJECTED` notification is sent to the submitting user.

- **Authentication:** JWT Required (`DEPARTMENT_ADMIN` or `SUPER_ADMIN`)
- **Authorization:** Paper must belong to the admin's own department (for `DEPARTMENT_ADMIN`).
- **Process:** 1. Paper must be in `PENDING_REVIEW`. 2. Delete database record. 3. Delete
  physical file from storage. 4. Notify uploader.
- **Response:** `200 OK` (no body)

**Error Codes:**

| Condition                         | HTTP | Code                 | Message                                          |
| --------------------------------- | ---- | -------------------- | ------------------------------------------------ |
| Paper not found                   | 404  | `RESOURCE_NOT_FOUND` | "Paper not found"                                |
| Paper not pending review          | 400  | `INVALID_REQUEST`    | "Only PENDING_REVIEW submissions can be rejected" |
| Wrong department                  | 403  | `ACCESS_DENIED`      | "You can only manage papers within your department." |

---

### DELETE /api/admin/papers/{id}

Permanently delete a paper and its associated file.

- **Authentication:** JWT Required
- **Process:** 1. Verify department ownership.

2. Delete database record.
1. Delete physical file from filesystem.

- **Response:** `204 No Content`

---

### Admin Papers Error Registry

| Condition                            | HTTP | Code                     | Message                                              |
| ------------------------------------ | ---- | ------------------------ | ---------------------------------------------------- |
| Create/Update for wrong department   | 403  | `ACCESS_DENIED`          | "You can only manage papers within your department." |
| File uploaded is not PDF/DOCX        | 415  | `UNSUPPORTED_MEDIA_TYPE` | "Only PDF and DOCX files are allowed."               |
| Metadata JSON is malformed           | 400  | `INVALID_REQUEST`        | "The metadata part must be valid JSON."              |
| Required field missing (e.g., title) | 400  | `VALIDATION_ERROR`       | "Title is required."                                 |
| Physical file cannot be saved        | 500  | `FILE_STORAGE_ERROR`     | "Internal storage failure while saving file."        |

---

## Admin Departments

SuperAdmin CRUD for departments. Department names generate a filesystem-safe folder `slug`
(e.g. `Information Technology` → `information_technology`) used for paper file folders.
`DEPARTMENT_ADMIN` and other non-super-admin roles are denied.

### GET /api/admin/departments

Retrieve a paginated list of departments with usage counts.

- **Authentication:** JWT Required (`SUPER_ADMIN`)
- **Query Parameters:** `page` (default 0), `size` (default 20, max 100)
- **Response (200 OK):** Paginated `DepartmentDetail[]`.

| Field              | Type   | Description                                    |
| ------------------ | ------ | ---------------------------------------------- |
| `departmentId`     | number | Unique identifier                              |
| `departmentName`   | string | Display name                                   |
| `slug`             | string | Filesystem-safe folder slug                    |
| `paperCount`       | number | Number of research papers in the department    |
| `userCount`        | number | Number of users assigned to the department     |
| `createdAt`        | string | ISO 8601 timestamp of creation                 |
| `updatedAt`        | string | ISO 8601 timestamp of last update              |

### POST /api/admin/departments

Create a new department.

- **Authentication:** JWT Required (`SUPER_ADMIN`)
- **Request Body:** `{ "departmentName": string (required, ≤64) }`
- **Response (201 Created):** The created `DepartmentDetail`.

### PUT /api/admin/departments/{id}

Rename a department.

- **Authentication:** JWT Required (`SUPER_ADMIN`)
- **Request Body:** `{ "departmentName": string (required, ≤64) }`
- **Response (200 OK):** The updated `DepartmentDetail`.

### DELETE /api/admin/departments/{id}

Delete an empty department.

- **Authentication:** JWT Required (`SUPER_ADMIN`)
- **Fails** if any research papers or users are still linked to the department.
- **Response:** `204 No Content`

**Admin Departments Error Codes:**

| Condition                                                     | HTTP | Code                  | Message                                                          |
| ------------------------------------------------------------- | ---- | --------------------- | ---------------------------------------------------------------- |
| Non-super-admin role                                         | 403  | `ACCESS_DENIED`       | "Access denied"                                                  |
| Department not found                                         | 404  | `RESOURCE_NOT_FOUND`  | "Department not found"                                          |
| Delete with linked papers or users                           | 400  | `INVALID_REQUEST`     | "Cannot delete department with linked papers or users. Remove all linked papers and users first." |
| Missing department name                                      | 400  | `VALIDATION_ERROR`    | "Department name is required"                                   |

---

## Admin Users

SuperAdmin user management — list, create users, and change roles. Role changes are logged in
`RoleChangeLog` and revoke the target user's refresh tokens.

Roles: `STUDENT`, `FACULTY`, `DEPARTMENT_ADMIN`, `SUPER_ADMIN`.

### GET /api/admin/users

Retrieve a paginated list of users, optionally filtered by search term (matches email/full name).

- **Authentication:** JWT Required (`SUPER_ADMIN`)
- **Query Parameters:** `page` (default 0), `size` (default 20, max 100), `search` (optional)
- **Response (200 OK):** Paginated `User[]`.
- `User` fields: `userId`, `email`, `fullName`, `role`, `department` (id/name/slug), `profilePictureUrl`, `createdAt`.

### POST /api/admin/users

Create a user.

- **Authentication:** JWT Required (`SUPER_ADMIN`)
- **Request Body:**
  ```json
  {
      "email": "user@acdeducation.com",
      "role": "FACULTY",
      "departmentId": 1
  }
  ```
  - `email`: required, must be a valid email
  - `role`: required, one of `STUDENT`, `FACULTY`, `DEPARTMENT_ADMIN`, `SUPER_ADMIN`
  - `departmentId`: required for department-bound roles
- **Response (201 Created):** The created `User`.

### PUT /api/admin/users/{id}/role

Change a user's role (and optionally their department). Logged in `RoleChangeLog`; revokes the
target's refresh tokens.

- **Authentication:** JWT Required (`SUPER_ADMIN`)
- **Request Body:**
  ```json
  {
      "role": "FACULTY",
      "departmentId": 1
  }
  ```
- **Response (200 OK):** The updated `User`.

**Admin Users Error Codes:**

| Condition                        | HTTP | Code                 | Message                                  |
| -------------------------------- | ---- | -------------------- | ---------------------------------------- |
| Non-super-admin role             | 403  | `ACCESS_DENIED`      | "Admin privileges required" or "Access denied" |
| User not found                   | 404  | `RESOURCE_NOT_FOUND` | "User not found"                         |
| Invalid email / missing fields   | 400  | `VALIDATION_ERROR`   | Validation field messages                |

---

## Files

### GET /api/files/{paperId}

Download or view a research paper file.

- **Authentication:** JWT required
- **Path Parameter:** `paperId` (number) — Paper ID (used to look up the `filePath` from the
  database)

**Query Parameters:**

| Parameter | Type    | Required | Description                                                        |
| --------- | ------- | -------- | ------------------------------------------------------------------ |
| `view`    | boolean | No       | If `true`, opens in browser (inline). Default: `false` (download). |

**Authorization Matrix:**

| Role             | Access Rule                                                    |
| ---------------- | -------------------------------------------------------------- |
| SUPER_ADMIN      | Always allowed                                                 |
| DEPARTMENT_ADMIN | Allowed only if paper belongs to their department              |
| FACULTY          | Allowed only if has ACCEPTED request AND paper is not archived |
| STUDENT          | Allowed only if has ACCEPTED request AND paper is not archived |

**Response Headers:**

| Header                | Value                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `Content-Type`        | Based on file type: `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `Content-Disposition` | `view=true`: `inline; filename="<filename>"` / `view=false` or omitted: `attachment; filename="<filename>"`        |

**Response (200 OK):** Binary file content

**Error Codes:**

| Condition                             | HTTP | Code                     | Message                                              |
| ------------------------------------- | ---- | ------------------------ | ---------------------------------------------------- |
| Missing/Invalid JWT                   | 401  | `UNAUTHENTICATED`        | "Authentication required"                            |
| Paper not found                       | 404  | `RESOURCE_NOT_FOUND`     | "Paper not found"                                    |
| File missing from storage             | 404  | `FILE_NOT_FOUND`         | "File not found"                                     |
| No approved request (Student/Faculty) | 403  | `ACCESS_DENIED`          | "You do not have access to this file"                |
| Paper archived (Student/Faculty)      | 404  | `RESOURCE_NOT_AVAILABLE` | "Paper not available"                                |
| Wrong department (DEPARTMENT_ADMIN)   | 403  | `ACCESS_DENIED`          | "You do not have access to files in this department" |
| File read/storage error               | 500  | `FILE_STORAGE_ERROR`     | "Unable to retrieve file"                            |

---

## Real-time and Inbox Notifications (SSE)

Notifications are created as a side effect of system events and delivered to the affected user
through two channels:

1. **SSE streaming** (`GET /stream`) — real-time push. Events are published after the triggering
   transaction commits and are delivered only to the owning user.
2. **REST inbox** — persisted notifications that can be listed, counted, and marked as read.

Users only ever see their own notifications. Multiple simultaneous SSE connections per user are
supported (e.g., multiple browser tabs) — each tab independently receives events.

**Notification types** (`type` field):

| Type                   | Meaning                                          | `relatedEntityType`  |
| ---------------------- | ------------------------------------------------ | -------------------- |
| `NEW_REQUEST`          | A new document request was received              | `DOCUMENT_REQUEST`   |
| `REQUEST_ACCEPTED`     | A document request was accepted                  | `DOCUMENT_REQUEST`   |
| `REQUEST_REJECTED`     | A document request was rejected                  | `DOCUMENT_REQUEST`   |
| `NEW_SUBMISSION`       | A new student submission was received            | `RESEARCH_PAPER`     |
| `SUBMISSION_APPROVED`  | A submission was approved and is now live        | `RESEARCH_PAPER`     |
| `SUBMISSION_REJECTED`  | A submission was rejected                        | `RESEARCH_PAPER`     |

### GET /api/notifications/stream

Open a Server-Sent Events stream for the authenticated user.

- **Authentication:** JWT Required
- **Content-Type:** `text/event-stream`
- **Events:** Named `notification` events whose data is a serialized
  `NotificationResponse` (see fields below). Emits a keep-alive/connected event first.
- **Authorization:** Only the caller's own notifications are pushed.
- **Notes:** Long-lived connection. Clients should reconnect on disconnect; invalidated access
  tokens can be refreshed via the normal refresh flow.

### GET /api/notifications

Retrieve a paginated list of the authenticated user's notifications, newest first.

- **Authentication:** JWT Required
- **Query Parameters:** `page` (default 0), `size` (default 20, max 100)
- **Response (200 OK):** Paginated `Notification[]`.

`Notification` fields:

| Field                  | Type    | Description                                            |
| ---------------------- | ------- | ------------------------------------------------------ |
| `notificationId`       | number  | Unique identifier                                      |
| `message`              | string  | Human-readable message                                 |
| `type`                 | string  | One of the notification types above                    |
| `relatedEntityId`      | number  | ID of the related request or paper (nullable)          |
| `relatedEntityType`    | string  | `DOCUMENT_REQUEST` or `RESEARCH_PAPER` (nullable)      |
| `isRead`               | boolean | Whether the notification has been read                 |
| `createdAt`            | string  | ISO 8601 timestamp of creation                         |

### GET /api/notifications/unread-count

Return the number of unread notifications for the authenticated user.

- **Authentication:** JWT Required
- **Response (200 OK):** number

### PUT /api/notifications/mark-all-read

Mark all of the authenticated user's notifications as read.

- **Authentication:** JWT Required
- **Response:** `204 No Content`

### PUT /api/notifications/{id}/read

Mark a single notification as read. Ownership is enforced server-side.

- **Authentication:** JWT Required
- **Path Parameter:** `id` (number) — Notification ID
- **Response:** `204 No Content`

**Notifications Error Codes:**

| Condition            | HTTP | Code                 | Message                       |
| -------------------- | ---- | -------------------- | ----------------------------- |
| Missing/Invalid JWT  | 401  | `UNAUTHENTICATED`    | "Authentication required"     |
| Notification not found | 404 | `RESOURCE_NOT_FOUND` | "Notification not found"      |
| Not the owning user  | 403  | `ACCESS_DENIED`      | "Access denied"               |

---

## Validation Rules

**Paper Create/Update**

- title: non-empty (up to database TEXT limit)
- authorName: non-empty, ≤255
- abstractText: non-empty
- submissionDate: YYYY-MM-DD format
- departmentId: must exist
- file: PDF or DOCX ≤20MB

**DocumentRequest**

- paperId must exist, not archived
- Only one PENDING or ACCEPTED request allowed per user/paper (no duplicate active requests) -
  enforced by database partial unique index
- Users can create new requests after previous ones are REJECTED
- Approve/Reject: only PENDING
- Attempting to create duplicate PENDING/ACCEPTED request → **409 DUPLICATE_REQUEST**

---

## State Machines

**Paper. archived**: `false → true` via /archive; `true → false` via /unarchive
**Paper. status**: `PENDING_REVIEW → ACTIVE` via approve; `PENDING_REVIEW → (deleted)` via
reject-submission or submitter delete. Admin-created papers start `ACTIVE`.
**DocumentRequest.status**: `PENDING → ACCEPTED | REJECTED`; `ACCEPTED → REJECTED` (revocation);
`REJECTED` is terminal
