# Project Context — Customer Success Insights Platform

## 1. What We're Building

An AI-powered Customer Success Platform. Teams can manage customers, log meetings and
interactions with them, and automatically generate structured AI insights from meeting
notes — summary, sentiment, action items, and risks — surfaced through a business
dashboard.

The product should feel like something a real customer success team could actually use:
sensible workflows, clean data model, secure by default, and fast under normal load.

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + TypeScript + Redux Toolkit + Axios |
| Backend | Python + FastAPI |
| Database | PostgreSQL |
| Cache | Redis |
| Auth | JWT |
| DevOps | Docker + Docker Compose (frontend, backend, Postgres, Redis) |

## 3. Core Modules

### 3.1 Authentication & Authorization
- Register, Login, Profile
- Role-based access control (e.g. `admin` vs `member`/`agent`)
- JWT-based secure session handling, passwords hashed with Argon2

**Auth details:**
- Login accepts OAuth2 password-flow form body (not JSON), per FastAPI's standard
  `OAuth2PasswordRequestForm` convention
- Access token only — no refresh token
- Role is re-fetched from the DB on each request (via the auth dependency), not trusted
  solely from token claims, so a role change takes effect immediately without re-login
- Password validation is length-only (no forced complexity rules)
- Auth failures return generic, non-specific error messages (e.g. "invalid credentials"),
  never revealing whether the email or the password was wrong
- Security-related values (token expiry, hashing cost factor, min password length, etc.)
  live in named constants/config, not inline magic numbers
- No self-service "first registered user becomes admin" logic — the initial admin account
  is seeded explicitly (e.g. via a migration/seed script), not derived from registration
  order

### 3.2 Customer Management (CRUD)
- Create / Update / Delete customer
- List customers with filters (status, owner, search)
- Customer detail view

**Ownership rule:** `owner_id` is never accepted as client input for members — the backend
always sets it from the authenticated user (`current_user.id`), regardless of what's sent
in the request body. Only admins may explicitly assign or reassign ownership; this goes
through a role check in the service layer, not a trusted request field. Prefer separate
create/update schemas per role over one schema with a sometimes-honored field.

**Access model:**
- **Member:** can create/view/update/delete only their own customers; `owner_id` always
  forced to self
- **Admin:** can view/manage all customers, filter list by any `owner_id`, and reassign
  ownership via a dedicated admin-only `PATCH .../owner` endpoint
- **Cross-owner access** (member hitting another user's customer): returns **404**, not
  403 — hides that the record exists rather than confirming it's merely forbidden
- **Enforcement location:** ownership checks live in the service layer (and repository SQL
  filters for lists) — never trusted from client input, never left to the router alone

### 3.3 Meeting / Interaction Management (CRUD)
- Create / Update interaction (linked to a customer)
- List interactions with filters (customer, `interaction_at` date range, type, sentiment).
  List response always LEFT JOINs `Insight` (1:1 relationship) and includes `sentiment`
  and `insight_status` per row — so a user can see at a glance which meetings need
  attention without opening each one. The `sentiment` filter is just an added `WHERE` on
  top of that same join, not a separate conditional join. Select only `Insight.sentiment`
  and `Insight.status` from the join — never load the full `Insight` entity (summary,
  action_items, risks) into the list query.
- Interaction detail view — also populates `sentiment` and `insight_status` via the same
  LEFT JOIN as the list endpoint. Since Insight is 1:1, the join costs nothing extra here;
  leaving them null on detail while populated on list would be an inconsistent API.

**Sentiment/insight_status response states:**

| Insight state | `sentiment` | `insight_status` |
|---|---|---|
| No Insight row | null | null |
| Insight exists, `pending` | null | pending |
| Insight exists, `failed` | null | failed |
| Insight exists, `completed` | positive/neutral/negative | completed |



**Access model:** mirrors Customer — a member sees only interactions on customers they
own; an admin sees all. Enforced by reusing `CustomerService`'s existing access check (e.g.
`validate_customer_access()`) rather than duplicating ownership logic in
`InteractionService`.

**Business rules:**
- `customer_id` is not patchable — an interaction stays tied to the customer it was created
  under; moving an interaction between customers would be a separate feature if ever needed
- `created_by` is filterable by both roles — members filtering by `created_by` are still
  constrained to interactions on customers they own; admins can filter globally
- Soft-deleted customers cannot receive new interactions (404) — but `inactive` is a
  business status, not a deletion state, so interactions (e.g. follow-ups, re-engagement)
  are still allowed on inactive customers. Only soft-deleted customers reject new
  interactions.
- Future `interaction_at` values are allowed — supports scheduling/logging planned meetings;
  revisit if future scheduling becomes its own feature
- `interaction_at` (and all datetimes) must be timezone-aware, matching the `TIMESTAMPTZ`
  convention (see section 7)
- Redis caching is out of scope for this module — belongs to the Dashboard/Caching phase
- Integration tests should also cover: creating an interaction on a soft-deleted customer
  (404), updating a soft-deleted interaction (404), deleting an already soft-deleted
  interaction (404)

### 3.4 AI-Powered Insights
When a meeting note is submitted, call an LLM to generate structured output:
- Summary
- Sentiment: Positive / Neutral / Negative
- Action items / follow-ups
- Key risks or blockers

Needs: careful prompt design, strict response parsing (structured/JSON output), error
handling, and fallback behavior if generation fails — e.g. store the raw note, mark the
insight `pending`/`failed`, and allow retry rather than letting the whole request fail or
crash the write. Each generation attempt (initial + retries) is logged in `InsightAttempt`
for a full audit history, while the `Insight` row itself always reflects the latest result.

**LLM provider architecture:** Currently using Groq as the API provider (which itself can
serve different underlying models — the specific model is a Groq-side setting, not a
provider swap). The provider could change later (e.g. straight to OpenAI) — configuration
must be provider-agnostic from the start, not hardcoded to Groq:
- No `Literal["groq"]` (or similar) type constraint on the provider config value — use a
  plain string checked at runtime against a registry, not enforced at the type level
- Provider selection via a registry/factory (`{"groq": GroqLLMService, ...}`), keyed off an
  `LLM_PROVIDER` env var
- Adding a new provider = new service class implementing the existing `LLMService`
  interface + a registry entry + its API key — no changes to routers, services,
  repositories, or orchestration code (Open/Closed Principle)
- `provider` and `model` are already captured per attempt in `InsightAttempt` (section 6),
  so switching providers doesn't lose historical traceability

### 3.5 Dashboard
Business-overview screen — total customers, interactions this week/month, sentiment
breakdown, customers needing follow-up, recent AI insights. Aim for 4–6 meaningful
metrics/widgets rather than a single token chart.

### 3.6 Redis Caching
At minimum, implement one of:
- Cache expiry (TTL)
- Cache invalidation after update actions
- No stale data after create/update/delete

Best candidate: cache dashboard aggregates and/or customer list, invalidate on
customer/interaction writes.

### 3.7 Deployment & DevOps
- Separate Dockerfiles for frontend and backend
- `docker-compose.yml` orchestrating frontend, backend, Postgres, Redis (volumes, env vars,
  healthchecks, correct service dependency ordering)
- App should be genuinely deployable/hostable, not just runnable on localhost

## 4. Deliverables

- Git repo with full source (frontend + backend)
- README with setup instructions, architecture overview, implementation notes
- Hosted/accessible URLs for frontend and backend
- A recorded walkthrough demonstrating the working platform and explaining key features

## 5. Code Quality Standards

Default choices when scaffolding or extending a feature:
- Clear separation of concerns — routers/services/repositories on the backend,
  feature-based folders on the frontend
- Pydantic schemas for request/response validation on the backend, mirrored with
  client-side validation (e.g. Zod/RHF) on the frontend
- RESTful API structure (`/auth`, `/customers`, `/interactions`, `/insights`, `/dashboard`)
- Explicit error handling and loading/empty states in the UI, not happy-path-only code

## 6. Data Model (starting point)

```
User        (id UUID, name VARCHAR(255), email VARCHAR(255) UNIQUE,
             password_hash VARCHAR(255), role ENUM(admin, member), created_at TIMESTAMPTZ)

Customer    (id UUID, name VARCHAR(255), company VARCHAR(255), email VARCHAR(255),
             phone VARCHAR(30), status ENUM(active, inactive), owner_id UUID -> User,
             created_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ NULL, deleted_by UUID NULL)

Interaction (id UUID, customer_id UUID -> Customer, created_by UUID -> User,
             type ENUM(meeting, call, email, demo, follow_up),
             interaction_at TIMESTAMPTZ, raw_notes TEXT, created_at TIMESTAMPTZ,
             deleted_at TIMESTAMPTZ NULL, deleted_by UUID NULL)

Insight     (id UUID, interaction_id UUID -> Interaction, summary TEXT,
             sentiment ENUM(positive, neutral, negative), action_items JSONB,
             risks JSONB, status ENUM(pending, completed, failed),
             created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)

InsightAttempt (id UUID, insight_id UUID -> Insight, attempt_number INT,
                status ENUM(completed, failed), error_message TEXT,
                raw_response JSONB, provider VARCHAR(50), model VARCHAR(100),
                latency_ms INTEGER, created_at TIMESTAMPTZ)
```

## 7. Database Techniques to Showcase

Redis handles caching (section 3.6). Beyond that, here's the concrete set of database
techniques to implement at this project's scale. Denormalization, partitioning, and
sharding are deliberately left out — production-scale concerns worth naming in the README,
but out of scope to build here.

### Type Conventions
- UUID for entity primary/foreign keys only — not for cache keys or business identifiers,
  which should stay human-readable (e.g. `dashboard:aggregates`, not a random UUID)
- Constrained `VARCHAR(n)` where a max length is known (email, name, company: 255; phone: 30)
  instead of defaulting everything to `TEXT`
- `TEXT` reserved for genuinely unbounded content (`raw_notes`, `summary`, error messages)
- `JSONB` (not plain `JSON`) for structured/semi-structured fields (`action_items`, `risks`,
  `raw_response`) — binary-stored, indexable, and queryable in Postgres
- `ENUM` for fixed value sets (`role`, `status`, `sentiment`) instead of free-form strings
- `TIMESTAMPTZ` for all timestamps, never timezone-naive `TIMESTAMP`

### Schema & modeling
- Proper normalization (3NF) across User / Customer / Interaction / Insight
- Correct foreign key relationships with `ON DELETE` behavior thought through — `RESTRICT`
  on `User` deletion (don't orphan or cascade-delete records a user created/owns), cascade
  or restrict on Customer → Interaction as appropriate
- Enums for constrained fields (`role`, `status`, `sentiment`, `interaction type`) instead
  of free-text strings
- `created_at` / `updated_at` timestamps on every table
- Soft deletes via `deleted_at TIMESTAMPTZ NULL` (+ optional `deleted_by`) on `Customer` and
  `Interaction` only — not on `User`, `Insight`, or `InsightAttempt`, which follow their
  parent's lifecycle or need a different mechanism (account deactivation for `User`).
  `status` (business state, e.g. active/inactive) and `deleted_at` (record lifecycle) are
  kept as separate concerns rather than folded into one field. Normal queries always filter
  `deleted_at IS NULL`; delete endpoints set the timestamp instead of removing the row;
  dashboard metrics exclude soft-deleted records. Deleting a customer soft-deletes its
  interactions in the application layer — insights and attempts are left untouched so the
  audit trail stays intact. `ON DELETE CASCADE` at the DB level still exists as a backstop
  for genuine hard deletes (dev/admin cleanup), but the application performs soft deletes
  in normal operation.

### Indexing
- Index every foreign key that's actually queried on — not defensively on every FK just
  because it's a FK (e.g. skip indexing `deleted_by`, which is populated but not queried)
- Index columns used in real filters/sorts (`status`, `sentiment`, `interaction_at`,
  `created_at`)
- Composite index for common query patterns (e.g. `customer_id + interaction_at`)
- Unique index on `email`
- Prefer partial indexes (`WHERE deleted_at IS NULL`) over separate non-partial ones on the
  same columns for `Customer` and `Interaction`, since nearly every query excludes
  soft-deleted rows — a non-partial index and its partial counterpart on the same column(s)
  is redundant; keep the partial one unless a specific admin/reporting query needs to
  include deleted rows too
- Avoid redundant single-column indexes when a composite index already covers that column as
  its leading key (e.g. don't separately index `customer_id` if
  `(customer_id, interaction_at)` already exists — Postgres can use the composite's leading
  column alone). Same applies to unique composite constraints like
  `(insight_id, attempt_number)`, which already serves single-column `insight_id` lookups
- Net principle: index for query paths the app actually uses, not every column that could
  theoretically be filtered — each extra index adds write overhead for a read benefit
  nobody's using

### Query design
- Pagination on all list endpoints (offset-based is fine; keyset/cursor pagination is a
  nice-to-have upgrade if time allows — worth it since offset degrades at scale)
- Filtering via query params translated to proper `WHERE` clauses, not fetch-all-then-filter
  in application code
- JOINs / eager loading to avoid N+1 queries (e.g. customers with their interactions,
  interactions with insights)
- Loading strategy: don't hardcode `joined` everywhere — default to `selectin` for
  collections (e.g. a customer's interactions) and plain `select` (lazy/default) for
  many-to-one or one-to-one relationships; only reach for `joined` where profiling shows a
  specific N+1 problem it actually fixes. Blanket `joined` loading tends to produce
  unnecessarily large result sets.
  **Exception:** `User.customers` and `User.interactions` use `lazy="select"`, not
  `selectin`, despite being collections — because `User` loads on essentially every
  authenticated request via `get_current_user`, and `selectin` is eager (fires whenever the
  parent loads, not just when the relationship is accessed). Eager-loading a user's full
  customer/interaction lists on every request regardless of whether auth flow needs them
  would be pure waste. This is a targeted exception for relationships hanging off a
  frequently-loaded parent, not a reversal of the `selectin` default elsewhere.
- List endpoints select only list-relevant columns (skip large text fields like
  `raw_notes`); use separate response schemas for list vs. detail views so full note text
  is only ever sent on the single-interaction detail fetch, not on every list row
- A paginated endpoint's list query and count query must be built from the same base query
  object (branch into `.all()` vs `.count()`), not constructed independently — so filters,
  joins, ownership, and soft-delete scoping can't silently drift apart between the two over
  time

### Validation & integrity
- DB-level constraints (NOT NULL, foreign keys, unique) as a backstop to Pydantic
  validation — don't rely on app-layer validation alone
- Alembic migrations for schema changes (not hand-edited tables)

### Caching (Redis)
- Cache-aside pattern on read-heavy endpoints (dashboard aggregates, customer list)
- TTL-based expiry
- Explicit invalidation on writes (create/update/delete customer or interaction busts the
  relevant cache keys)

### Concurrency (Redis Lock)
- A short-lived Redis lock (`SETNX` / `redis-py` `Lock`) keyed on `interaction_id` while AI
  insight generation is in-flight, to prevent duplicate LLM calls or duplicate Insight rows
  from double-clicks or retries — acquire lock → call LLM → write result → release lock,
  with a TTL as a safety net if a worker dies mid-call

### Connection Pooling
- Use a proper DB connection pool (e.g. SQLAlchemy's built-in pool, or PgBouncer in front of
  Postgres) instead of opening a new connection per request — keeps latency low and avoids
  exhausting Postgres's max connections under concurrent load
- Tune pool size to the deployment (small pool locally/in Docker Compose is fine; document
  the setting in the README)

### Transactions
- Wrap multi-step writes in a DB transaction wherever a partial failure would leave the
  data inconsistent — e.g. creating an Interaction and kicking off its Insight record
  should be atomic, so a failure doesn't leave orphaned rows
- Also wrap any write that updates more than one table together (e.g. customer status
  change that also logs an audit/history row, if implemented)

## 8. Frontend Standards

### API client
The Axios HTTP client stays decoupled from any specific state library — it must not import
the Redux store directly. Expose injectable hooks instead (e.g. `setTokenGetter(fn)` for
the auth token source, `setUnauthorizedHandler(fn)` for 401 handling), wired up once at app
initialization. This keeps the HTTP layer testable in isolation and free of a hard
dependency on how/where auth state happens to be stored.

### Route structure
Use Next.js route groups to separate authentication from the app shell:
```
app/
├── (auth)/
│     └── login/
├── (shell)/
│     ├── dashboard/
│     ├── customers/
│     ├── interactions/
│     └── unauthorized/
```
`(auth)` and `(shell)` get separate root layouts without affecting the URL path. Auth
protection lives once in `(shell)/layout.tsx` (redirect to `/login` if unauthenticated),
not duplicated per page. `unauthorized` (role-blocked, not unauthenticated) lives inside
`(shell)`, since it's reachable only after login.

### Customer Management (frontend specifics)
- **Assign Owner:** admins reassign ownership from the customer detail page via a user
  select backed by `GET /api/v1/users/` and `PATCH /api/v1/customers/{id}/owner`. Never use
  a raw UUID text input or invent/mock user data. Members never see reassignment controls;
  show the current owner (or "You" when it's the current user) for display.
- **Delete:** no optimistic update/rollback — execute the mutation, invalidate the
  customer list query on success, remove the customer detail query, and navigate away if
  currently viewing the deleted customer. Customer CRUD isn't latency-sensitive enough to
  justify rollback complexity against an already-fast backend.
- **Query invalidation:** be explicit about scope — invalidate only `customerKeys.lists()`
  and update `customerKeys.detail(id)` on relevant mutations. Never invalidate broader or
  unrelated query scopes (e.g. don't let a customer mutation invalidate interaction or
  dashboard queries).