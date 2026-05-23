You are performing a FULL-SURFACE MANDATE402 INCIDENT + READINESS INSPECTION.

Goal:
Do not only find the immediate root cause of one visible issue.
Inspect the entire project from every meaningful angle and determine:
- current root cause(s)
- contributing causes
- hidden fragility
- adjacent failures
- systemic weaknesses
- release and operational risks
- what is broken now
- what is likely to break next
- what must be fixed immediately
- what must be hardened long-term

Core mindset:
Assume the visible symptom is only one surface signal.
Do not stop after finding one bug.
Do not stop after finding one failing request.
Do not stop after finding one bad env var.
Look for the entire failure system, not just a single failure point.

Your role:
Act as a principal incident investigator, systems architect, release gate reviewer, SRE, security reviewer, and product reliability auditor.

Primary objective:
Produce a complete inspection of the project across all plausible angles:
- product
- frontend
- backend
- services
- workers
- infrastructure
- networking
- deployment
- security
- state management
- observability
- chain/runtime architecture
- performance
- data layer
- operational readiness
- rollback readiness
- project hygiene
- team/process risks

You must answer not only:
“What caused this issue?”
but also:
“What else is wrong, fragile, missing, misleading, or risky?”

Required inspection principle:
For every conclusion, distinguish clearly between:
- confirmed root cause
- probable contributing cause
- correlated symptom
- architectural weakness
- operational weakness
- technical debt
- false lead
- missing evidence

Required inspection workflow:

STEP 1 — System map
Create a full map of the project:
- frontend apps
- backend apps
- internal services
- workers / queues / cron jobs
- route / worker / vendor / chain boundaries
- database(s)
- cache(s)
- storage
- auth/session system
- AI/LLM systems
- external providers
- deployment platform(s)
- observability stack
- environment layout (dev/staging/prod)
- domains/subdomains
- health check topology
- service dependencies

STEP 2 — Symptom map
List all visible symptoms, not just the reported one:
- UI indicators
- failed requests
- unhealthy services
- broken auth
- stale data
- missing logs
- delayed jobs
- infra warnings
- odd performance
- security scan findings
- release drift
- env/config drift

STEP 3 — Failure tree
Build a failure tree:
- direct cause
- upstream cause
- dependency cause
- config cause
- code cause
- infra cause
- process cause
- detection/monitoring failure
- recovery failure

STEP 4 — Multi-angle inspection
Inspect every area below, even if one root cause is already found.

AREAS TO INSPECT

A. Product truth
- Is the product behavior aligned with what the UI promises?
- Are users seeing misleading status indicators?
- Are there hidden degraded states presented as normal?
- Are critical actions blocked, delayed, or silently failing?
- Are there trust-eroding product inconsistencies?

B. Frontend architecture
- env wiring
- API base URL usage
- route guards
- hydration/SSR/CSR boundaries
- stale config baked into builds
- error boundaries
- retry logic
- timeout logic
- status widgets
- offline/online state logic
- state resets
- loading/empty/error states

Check:
- can frontend show “offline” for non-server reasons?
- can stale env or cached build point to old backend?
- can one failed poll poison the whole UI state?
- can frontend recover after backend comes back?

C. State management
- source of truth
- duplicated state
- query cache invalidation
- optimistic updates
- stale overwrites
- cross-tab inconsistency
- derived state bugs
- status latching bugs
- session/user state drift

Check:
- can state lie to the user?
- can failed writes still look successful?
- can old responses overwrite fresh truth?
- can one widget reflect deprecated backend state?

D. Re-render isolation and frontend performance
- large context providers
- unnecessary rerenders
- polling rerender storms
- hot components
- stream rendering behavior
- expensive selectors
- status polling side effects
- memory leaks
- retry loops causing UI churn

Check:
- are health checks or polls causing excessive render churn?
- is UI degradation masking service truth?
- are critical views coupled to unrelated state?

E. Backend/API correctness
- route definitions
- middleware order
- health endpoint behavior
- auth/session checks
- CORS
- CSRF
- request parsing
- status codes
- error normalization
- retries
- timeout handling
- degraded-mode behavior

Check:
- does API return correct statuses?
- are health endpoints public when they should be?
- can auth/rate limit/CORS block health checks?
- are errors collapsed into generic “offline” behavior?

F. Service layers
- controllers/routes
- business logic services
- repositories/data access
- adapters/clients
- external integration layers
- orchestration glue
- shared middleware/util sprawl

Check:
- are concerns cleanly separated?
- are failures isolated or leaking across layers?
- are important side effects hidden in helpers?
- is service dependency order too fragile?

G. AI architecture
- provider integration
- prompt construction
- tool routing
- orchestration nodes
- retries and fallback behavior
- structured outputs
- persistence of AI results
- failure handling
- cost/time bounds
- partial execution states

Check:
- can provider failure look like server outage?
- can orchestration block health or readiness?
- can malformed AI output break downstream services?
- are AI services isolated from core availability paths?

H. Authorization and session model
- frontend session assumptions
- backend auth enforcement
- service-to-service auth
- internal tokens
- operator auth and worker-token flows
- role/ownership checks
- workspace scoping
- health endpoints and auth exclusions
- stale sessions after deploy

Check:
- can auth misconfig present as server offline?
- are internal services reachable but unauthorized?
- is there inconsistent auth between operator routes, worker routes, and backend services?

I. Validation and sanitization
- env validation
- request validation
- query/header validation
- response contract validation
- file/path validation
- provider payload validation
- config parsing
- startup validation

Check:
- does app fail fast on missing env?
- do malformed payloads break readiness?
- do invalid config values silently degrade behavior?

J. Database and persistence
- DB connectivity
- migrations
- connection pool
- transaction handling
- critical indexes
- slow queries
- startup schema assumptions
- background write failures
- RLS/policy issues
- session storage if applicable

Check:
- does boot depend on DB readiness?
- can migrations pass deploy but fail runtime?
- can DB latency surface as “offline”?
- can auth/session break due to RLS or schema mismatch?

K. Cache, queue, and worker systems
- Redis/cache connectivity
- queue consumers
- background jobs
- dead letters
- retry storms
- scheduler/cron tasks
- startup dependency ordering
- health dependencies on workers

Check:
- is core health incorrectly tied to workers?
- are queue backlogs causing system slowdown?
- are workers failing silently?
- are services blocking on unavailable queue/cache?

L. Infrastructure and runtime
- container boot logs
- process manager
- startup command
- entrypoint correctness
- port binding
- host binding
- resource limits
- OOM kills
- crash loops
- file system permissions
- secret injection
- runtime compatibility

Check:
- did deploy succeed but process fail after start?
- is app binding wrong host/port?
- are containers “running” but not “ready”?
- are startup hooks failing post-deploy?

M. Reverse proxy, ingress, domain, and networking
- domain mapping
- subdomain routing
- TLS termination
- DNS targets
- internal/external ports
- proxy upstreams
- path rewrites
- websocket upgrades
- firewalls/security groups
- private/public accessibility

Check:
- is frontend pointing to wrong subdomain?
- is proxy routing to wrong upstream?
- are duplicate domains causing collisions?
- are SSL/mixed-content/CORS problems involved?

N. Health checks and readiness
- liveness endpoint
- readiness endpoint
- dependency health
- frontend server-status endpoint
- load balancer health probes
- platform health probes
- health response contract
- timeout thresholds
- false negative / false positive logic

Check:
- what exactly defines “healthy”?
- is readiness too strict or too shallow?
- is health endpoint blocked by auth or dependency noise?
- does frontend expect a different payload than backend returns?

O. Observability
- structured logs
- request IDs
- correlation IDs
- traces
- metrics
- service dashboards
- health metrics
- alerts
- incident visibility gaps
- sensitive logging

Check:
- can the incident be traced end-to-end?
- which layer is blind right now?
- were there alerts before the symptom surfaced?
- is debugging slowed by missing correlation?

P. Error handling and resilience
- catch paths
- retries
- backoff
- circuit breakers
- degraded mode
- fail-open vs fail-closed
- user-facing recovery paths
- silent failures
- swallowed exceptions

Check:
- where are errors hidden?
- where do retries amplify failure?
- is degraded mode explicit or accidental?
- can user recover without refresh/redeploy?

Q. Security
- auth bypasses
- exposed internal endpoints
- missing rate limiting
- unsafe path handling
- secrets in logs
- CORS overexposure
- SSRF/file/network escape risks
- stale credentials
- broken service auth after deploy

Check:
- could a “server issue” actually be blocked by security config?
- are internal service credentials rotated/expired?
- do security hardenings conflict with health/status checks?

R. Performance and saturation
- latency
- p95/p99 spikes
- throughput
- queue depth
- DB saturation
- CPU
- memory
- disk
- connection exhaustion
- cold start timing

Check:
- is the service technically “up” but timing out under load?
- did deploy increase startup or request latency?
- is health probe timing out before readiness completes?

S. Release and deployment process
- CI/CD outcome
- artifact correctness
- env injection at build vs runtime
- post-deploy hooks
- migration steps
- smoke tests
- rollback steps
- canary/staged rollout
- old deployments still attached
- stale environments

Check:
- did deploy report success before runtime verification?
- is there partial deploy or split deploy mismatch?
- are old and new envs both active?
- did frontend and backend deploy on different revisions?

T. Project hygiene and architectural debt
- duplicated env files
- duplicate deployment targets
- stale configs
- dead services
- unowned scripts
- lockfile drift
- doc drift
- outdated health URLs
- inconsistent package/runtime strategies
- hidden manual steps

Check:
- which project hygiene problems are causing operational incidents?
- what complexity is multiplying failure chances?
- what cleanup would remove future confusion?

U. Team/process and operational gaps
- missing runbooks
- undocumented envs
- manual deploy steps
- unclear ownership
- missing smoke tests
- alert fatigue
- incomplete rollback plan
- local-only assumptions
- misaligned docs

Check:
- what process failure allowed this issue?
- what should have detected it sooner?
- what should prevent recurrence?

Required outputs:

1. Executive verdict
- What is broken now?
- What is the primary root cause?
- What are the secondary contributing causes?
- What are the hidden project-wide risks?
- Is the system actually production-ready?

2. System map
- components
- services
- domains
- dependencies
- critical paths

3. Symptom map
- visible symptoms
- invisible/internal symptoms
- misleading signals

4. Root-cause tree
- primary cause
- secondary causes
- contributing infra/process causes
- detection gaps

5. Findings by area
For each area A–U, mark:
- Healthy
- Acceptable but fragile
- Partial
- Unsafe
- Broken
- Unknown due to missing evidence

6. Evidence table
For every major finding include:
- severity
- area
- file/path/service/component
- exact failing mechanism
- evidence summary
- why it matters
- immediate fix
- permanent fix

7. Immediate fixes
List only the minimum set required to restore stable operation.

8. Hardening fixes
List the structural fixes required to prevent recurrence.

9. Monitoring and validation plan
After fixes, verify:
- health endpoint
- frontend status behavior
- auth/session flow
- API reachability
- service-to-service reachability
- DB/cache/queue health
- logs/traces/alerts
- key user journey
- background jobs
- rollback safety

10. Final judgment
Answer directly:
- What is the exact root cause?
- What else is wrong?
- What is fragile but not yet broken?
- What should be fixed today?
- What should be fixed this week?
- What should be redesigned long-term?

Hard rules:
- Do not stop at one root cause.
- Do not confuse symptom with cause.
- Do not assume deployment success means service health.
- Do not ignore adjacent architecture or operational weaknesses.
- If multiple layers contribute, say so.
- If evidence is missing, explicitly request the missing artifact or log.
- If the issue is a signal of broader project debt, call that out clearly.

Tone:
Be severe, technical, skeptical, and systems-oriented.
Prefer hard truth over comfort.
Do not give generic advice.
Produce a real full-surface inspection.
