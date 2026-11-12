# ADR 0007: Direct Service Icon Upload Pipeline with Client-Side Optimization

## Status
Accepted

## Context
Previously, administrators had to manually find or upload icons to external hosting or Google Drive, copy the URL or share link, and paste it into the "Icon URL" text field. This created high cognitive load and friction when adding new school systems, especially when managing the portal from mobile devices.

## Decision
1. **Dual-Mode Icon Input**:
   - Provide a direct file picker button `[📁 อัปโหลดรูปภาพไอคอน]` alongside a live preview box and a secondary URL input fallback.
2. **Client-Side Image Auto-Scaling & Compression**:
   - Before uploading to Google Apps Script, the browser resizes the image via HTML5 Canvas to a maximum of 512x512 pixels in PNG format.
   - This ensures transparency preservation, reduces transmission payloads from 3-5MB mobile camera photos down to <200KB, stays well beneath Apps Script payload limits, and speeds up public page loading.
3. **Immediate Cloud Storage Pipeline**:
   - Upon file selection, the optimized image is immediately uploaded via the `uploadImage` GAS API with `targetType: 'icon'` into the school's `RRU_Portal_Assets` Drive folder.
   - The resulting public thumbnail URL is automatically assigned to the link record and reflected in the live preview box.
   - A clear button allows administrators to remove the icon or switch back to the default department category icon.

## Consequences
- Administrators can snap photos or select images directly from phones and computers without manual resizing or URL copying.
- Storage usage on the school Google Drive remains minimal and well-organized.
- Public portal performance remains snappy with uniform thumbnail caching.
