# Surfaces and States Reference

Use this file when the task needs page inventory, interaction scope, or state coverage.

## Required Surfaces

- landing page / hero split
- main dashboard
- create mandate
- mandate detail
- agent view
- policies page
- settings / system health page
- vendors page
- receipts / audit page
- mobile variants
- modal / drawer / popover set

## Required Interaction Containers

- revoke confirmation modal
- edit mandate drawer or modal
- blocked-reason popover
- degraded-runtime popover
- export options popover
- receipt preview modal or drawer
- worker-task detail popover

## Required States

Every meaningful surface should define treatment for:

- loading
- empty
- success
- warning
- blocked / denied
- unauthorized
- degraded runtime
- chain not ready
- treasury not ready
- worker backlog
- execution unknown

## Responsive Targets

- mobile portrait ~ `360px`
- mobile large ~ `390px` to `430px`
- tablet ~ `768px`
- laptop ~ `1024px` to `1280px`
- desktop wide ~ `1440px+`

## Honest UI Rules

- never imply success before state confirms it
- never hide blocked reasons
- never hide degraded runtime state
- distinguish financial outcome vs receipt evidence
- distinguish chain truth vs projected truth when needed
