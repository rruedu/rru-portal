# ADR 0011: Click Analytics with Popular Flame Badges, Priority Custom Ordering, and Portal Backup Archive

## Status
Accepted

## Context
Following the implementation of resilience enhancements (Phase 1) and user experience workflows (Phase 2), school administrators needed actionable insights into service adoption to identify which tools are most utilized across the school community. Additionally, critical institutional applications (such as grade submission, enrollment records, or urgent survey forms) frequently became buried among lower-priority tools because link ordering was previously tied strictly to insertion order. Lastly, as Google Sheets serves as the primary system database, school administrators required a safeguard against accidental data deletion, unauthorized sheet overwrites, or corrupted entries.

## Decision
1. **Non-blocking Click Tracking & Popular Flame Badges (`🔥 ยอดนิยม`)**:
   - Added Column 8 (`Clicks`) to `Sheet1` in Google Sheets.
   - Deployed a lightweight, public GAS endpoint `recordClick` protected by script lock (`LockService.getScriptLock()`) to handle concurrent writes safely.
   - Employed `navigator.sendBeacon` with `fetch(..., { keepalive: true })` fallback in `src/js/api.js` to ensure telemetry transmission does not delay or block users opening external school services.
   - Calculate top-ranking services portal-wide and prominently highlight them with animated flame badges (`🔥 ยอดนิยม`) on service cards.
2. **Priority Custom Ordering (`Priority`)**:
   - Added Column 9 (`Priority`) to `Sheet1` in Google Sheets (integer 0–999, default 0).
   - In `src/js/components/departmentGrid.js`, sort filtered links by priority descending (`pB - pA`), maintaining stable secondary sorting by original row index.
   - Added a dedicated Priority input field to the Admin Link Form and displayed priority tags (`P:#`) in both the Admin Directory and Public Cards for administrator convenience.
3. **Admin Analytics Dashboard & JSON Backup Archive**:
   - Created a dedicated "สถิติ & ข้อมูลสำรอง (Analytics & Backup)" tab in the Admin Dashboard with mobile and desktop drawer navigation support.
   - **Usage Analytics**: Display aggregate metrics (total portal clicks, active vs. maintenance count) and a Top 5 Most Popular Systems ranking table with podium medals (🥇, 🥈, 🥉), click volumes, and proportional usage progress bars.
   - **JSON Backup Export**: One-click download of a structured snapshot (`rru-portal-backup-<date>.json`) packaging all links, configuration variables, branding URLs, and telemetry data.
   - **Full-Fidelity Restore**: Client-side JSON file parser validating payload integrity and calling atomic GAS endpoint `restoreBackup` with script lock to restore configuration and rebuild the links database cleanly.
4. **Service Worker Version Increment**:
   - Updated cache namespace in `sw.js` to `v3.0.0` (`rru-static-v3`, `rru-api-v3`, `rru-runtime-v3`) to ensure all clients immediately invalidate old assets and obtain the Phase 3 features.

## Consequences
- Administrators gain quantitative visibility into school app adoption and usage patterns.
- Essential institutional systems can be elevated to the top of the portal launchpad instantly without altering Google Sheet row positions manually.
- The portal is protected by a 1-click disaster recovery mechanism that exports and imports full database state cleanly.
