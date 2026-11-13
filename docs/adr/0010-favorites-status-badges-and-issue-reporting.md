# ADR 0010: Favorite Bookmarking, Service Status Badges, and Issue Reporting Pipeline

## Status
Accepted

## Context
With dozens of school applications available across five departments, daily users (students and teachers) frequently utilize only a handful of specific links and sought a way to pin them for instant access. Additionally, when external services (e.g. Google Forms or Google Apps Scripts) undergo temporary updates, users encountered unexpected permission or availability errors without advance notice. Finally, administrators lacked an integrated mechanism to receive user notifications about broken or expired links.

## Decision
1. **Client-Side Favorite Services (⭐)**:
   - Persist pinned link IDs in `localStorage` under `rru_favorites`.
   - Provide an interactive star toggle on each 3D squircle service card with gold fill and toast feedback.
   - Introduce a dedicated "⭐ รายการโปรด" filter pill on the sticky navigation bar displaying a real-time badge counter and triggering a focused view.
   - Include an empty state with an invitation to pin frequently used school tools.
2. **Operational Status Badges (`active` vs. `maintenance`)**:
   - Store status in Column 7 of Google Sheets (`Sheet1`).
   - Visually flag maintenance applications with amber badges (`🔧 ปิดปรับปรุงชั่วคราว`) and muted squircle opacities.
   - Intercept navigation clicks on maintenance items with confirmation alerts, preventing accidental confusion while allowing override.
   - Add a status selector to the Admin Form and a 1-click `toggleLinkStatus` action in the Admin Link Directory.
3. **Issue Reporting Pipeline**:
   - Implement a "Flag / แจ้งปัญหา" button on every service card opening `reportModal.js`.
   - Allow students, parents, and teachers to report broken links, permission errors, or wrong destinations without needing administrative credentials.
   - Record submitted issues in a dedicated `Reports` sheet via public GAS endpoint `reportIssue`.
   - Provide a dedicated "รายงานปัญหาลิงก์" tab in the Admin Dashboard for viewing pending reports, marking them as resolved, or deleting them.

## Consequences
- Daily users reach their essential daily tools with a single click.
- School staff can flag ongoing maintenance without deleting or altering destination URLs.
- Broken link reports reach administrators immediately without external messaging bottlenecks.
