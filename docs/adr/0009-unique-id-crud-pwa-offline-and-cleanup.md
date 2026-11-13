# ADR 0009: Unique ID CRUD, Multi-tier PWA Offline Caching, and Dead Code Cleanup

## Status
Accepted

## Context
1. Previously, service link modifications (`updateLink` and `deleteLink`) in Google Apps Script and the client relied strictly on 1-based spreadsheet row indices (`rowIndex`). If multiple admins edited links concurrently, or if rows in Google Sheets were added/deleted directly, row indices shifted, causing accidental data corruption or overwriting the wrong row.
2. The initial Service Worker implementation (`sw.js`) did not pre-cache core application shell files or retain API responses, causing offline access to fail when internet connectivity was interrupted.
3. The legacy `adminModal.js` component was replaced by the dedicated full-screen `#admin` dashboard (`adminView.js`), but its unused code, event listeners, and DOM mount points remained in the codebase.

## Decision
1. **Unique Link Identifier & Script Concurrency Locking**:
   - Introduce an `id` column (Column 6: "ID") in the Google Sheet `Sheet1`.
   - On read (`getPortalData_`), return each link's unique `id`, providing deterministic fallbacks (`rru_link_<row>`) if missing.
   - On write (`addLink`), generate a collision-free UUID/timestamp id (`rru_<timestamp>_<uuid>`).
   - On update/delete (`updateLink`, `deleteLink`), match rows by `id` first, with graceful fallback to `rowIndex` for full backwards compatibility.
   - Guard all Google Sheets write operations with `LockService.getScriptLock()` with a 10-second timeout to prevent race conditions.
2. **Multi-tier PWA Offline Architecture**:
   - Upgrade `sw.js` cache versioning to `rru-static-v2`, `rru-api-v2`, and `rru-runtime-v2`.
   - Pre-cache all core HTML, CSS, and JS components during the `install` phase.
   - Implement Stale-While-Revalidate for local assets, Network-First with Cache fallback for navigation and GAS `action=getData` calls, and Cache-First for external CDN resources.
3. **Dead Code Elimination**:
   - Delete `src/js/components/adminModal.js` (654 lines).
   - Remove `adminModal` imports and mount calls from `src/js/app.js` and `index.html`.

## Consequences
- Multi-admin edits and sheet row reorganizations no longer risk overwriting or deleting unrelated service links.
- The portal operates seamlessly offline, loading shell assets and cached service links even without network connectivity.
- Codebase footprint is cleaner and lighter, removing legacy duplicate logic.
