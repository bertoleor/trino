# ADR-0003 — Money with decimal.js, no float

- Status: accepted
- Decision: all ARS/money arithmetic via decimal.js; formatting per locale; migration-preview test.
- Consequences: no raw float math on prices; reviewers must reject float price code.
