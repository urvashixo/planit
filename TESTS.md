# Automated tests

1. `tests/auditEngine.test.ts` — verifies monthly/annual savings math.
2. `tests/auditEngine.test.ts` — verifies honest no-savings outcome.
3. `tests/auditEngine.test.ts` — verifies API-heavy optimization path.
4. `tests/auditEngine.test.ts` — verifies optimization score bounds (0-100).
5. `tests/auditEngine.test.ts` — verifies multi-tool aggregation totals.

## Coverage focus
- Audit rules
- Savings computation
- Recommendation category behavior
- Aggregate scoring and confidence output

## Run instructions
```bash
npm install
npm test
```
