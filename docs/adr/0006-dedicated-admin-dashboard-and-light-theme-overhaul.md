# ADR 0006: Dedicated Admin Dashboard and Light Theme Overhaul

## Status
Accepted

## Context
The RRU School Portal previously relied on an overlay modal (`adminModal.js`) for administrative tasks. User testing on mobile devices revealed two critical issues:
1. **Modal Usability on Mobile**: A cramped modal popup cannot comfortably accommodate rich link management, file uploads, and settings. Users explicitly requested navigating to a dedicated admin page with a mobile-first left slide-out hamburger menu (☰).
2. **Missing In-Panel Link Edit & Delete**: Administrators could only add new links from the modal; editing and deleting required finding cards in the public views, which lacked full visibility into all Google Sheet rows.
3. **Light Mode Color Clashes**: Hardcoded dark-purple Tailwind classes (`bg-purple-950/*`, `text-purple-100/200/300`) caused muddy, low-contrast text and discolored backgrounds when switching to the light theme.

## Decision
1. **Dedicated Full-Page Admin Dashboard (`#admin`)**:
   - Promote the admin interface to a top-level SPA view mounted at route `#admin`.
   - Provide a PIN authentication screen for unauthenticated visitors, seamlessly granting full workspace access once verified.
   - Implement a mobile-exclusive left slide-out Hamburger Menu (☰) and persistent desktop sidebar containing:
     - 🔗 จัดการลิงก์ระบบงาน (Full CRUD Directory)
     - 🖼️ แบนเนอร์ & โลโก้ รร. (Branding)
     - 📢 ข้อความประกาศด่วน (Announcement)
     - ⚙️ การเชื่อมต่อ & รหัส PIN (Settings)
     - 🚪 กลับสู่หน้าหลัก Portal (Exit to public view)
2. **Comprehensive Link Management Directory**:
   - Build a searchable, filterable directory of all database links within the admin view.
   - Include prominent `[➕ เพิ่มลิงก์ใหม่]`, `[✏️ แก้ไข]`, and `[🗑️ ลบ]` controls.
   - In-place editing loads row data into the editor with one-click cancel or save, communicating directly with Google Apps Script `updateLink` and `deleteLink` endpoints.
3. **Violet-Rose Executive Light Theme Palette**:
   - Establish pure white `#FFFFFF` card surfaces, soft snow canvas `#FAFAFE`, deep charcoal headings `#1E1B4B`, slate body text `#334155`, and vibrant rose `#DB2777` to purple `#7C3AED` gradient accents.
   - Remove muddy dark alpha transparency overlaps in light mode.

## Consequences
- Administrators gain a desktop- and mobile-optimized workspace with complete control over Google Sheets data.
- Public views remain focused and clutter-free.
- Daylight readability and aesthetic polish are drastically improved in light mode.
