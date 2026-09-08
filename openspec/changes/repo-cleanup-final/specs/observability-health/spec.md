# Delta for observability-health

## ADDED Requirements

### Requirement: T3 complexity dispositions

Each of the 6 `complexity` warnings MUST be refactored below max-12 or carry a COMP ticket with budget (Trace: zero-warnings gate).

#### Scenario: Refactor or ticket

- GIVEN `proxy:20`, `updateSession:17`, `getCustomer360:17`, rates `POST:17`, audit `POST:15`, `emit:13`
- WHEN T3 lands
- THEN each site is simplified or cites its COMP ticket, lint 0 warnings

### Requirement: T3 non-null fix-or-justify with COMP reconcile

Each of the 30 `no-non-null-assertion` sites MUST use optional chaining, a guard, or a justified ticket; the 8 prior COMP tickets MUST be reconciled with no double-ticketing (Trace: strict-TS).

#### Scenario: Safe alternative or justified ticket

- GIVEN 30 non-null sites + 8 existing COMP tickets
- WHEN T3 lands with reconcile table
- THEN every site is fixed or ticket-justified and each ticket maps 1:1 to a live site
