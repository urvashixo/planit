# Metrics Framework

North Star metric: **Qualified Savings Leads per Week (QSL/W)** — count of completed audits with projected monthly savings >=$100 and valid lead capture. This metric reflects both user value creation and business potential for Credex, unlike DAU which is weak for low-frequency financial tooling.

Input metrics that drive North Star:
1. Audit completion rate (landing visitors -> completed audits)
2. Median projected monthly savings per completed audit
3. Lead capture rate after results view

Instrumentation priorities:
- Event `landing_cta_clicked`
- Event `audit_started`
- Event `audit_completed` with savings bucket and tool count
- Event `summary_generated` with fallback flag and latency
- Event `lead_submitted` with role/team-size/source
- Event `share_clicked` and `share_visit`

Primary dashboard cuts:
- By source channel (community, DM, SEO, partner)
- By company size bucket
- By recommendation type mix (switch, downgrade, API)

Pivot trigger:
If after 4 weeks, audit completion >20% but lead capture <15% and consult booking <5%, pivot the product from broad multi-tool audit to one high-intent wedge (for example, coding assistant plan optimization only) and rewrite the promise around a single painful decision point.
