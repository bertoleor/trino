# ADR-0003 — Money with decimal.js, no float (UNVERIFIED)

- Status: accepted (reconstructed from openspec/specs/money-arithmetic + tests t-b01/t-b03 + decimal.js dep).
- Decision: all ARS/money arithmetic via decimal.js; formatting per locale; migration-preview test.
- Consequences: no raw float math on prices; reviewers must reject float price code.
