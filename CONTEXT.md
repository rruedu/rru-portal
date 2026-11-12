# RRU School Portal

Centralized web portal and service gateway for Rattharat Upatham School (โรงเรียนรัฐราษฎร์อุปถัมภ์ - RRU), under the Secondary Educational Service Area Office Ratchaburi (สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาราชบุรี), providing unified access to school applications, tools, and services for students, parents, and teachers. Developed by ครูไตรรัตน์ จันทร์มาศ.

## Language

**School Portal**:
The single entry point and web gateway aggregating all internal and external digital services of the school.
_Avoid_: Directory, Bookmark list

**Department (กลุ่มบริหาร)**:
One of the five official administrative divisions of the school (กลุ่มบริหารวิชาการ, กลุ่มบริหารกิจการนักเรียน, กลุ่มบริหารงบประมาณ, กลุ่มบริหารทั่วไป, กลุ่มบริหารงานบุคคล).
_Avoid_: Division, Category, Folder

**Target Role (บทบาทผู้ใช้งาน)**:
The target audience tier used to filter and tailor system links: Student, Parent, or Teacher.
_Avoid_: User type, Permission group

**Service Link (ระบบงาน/ลิงก์บริการ)**:
An individual application, tool, or document link accessible through the portal, associated with a department and target roles.
_Avoid_: Item, URL, Shortcut

**Portal Administrator (ผู้ดูแลระบบ)**:
An authorized school staff member with rights to modify portal configuration, upload school banners, and manage service links via a secured PIN modal.
_Avoid_: Superuser, Moderator

**Config Sheet (แผ่นงานการตั้งค่า)**:
The dedicated configuration tab within the Google Spreadsheet storing system variables such as school banner, logo, upload destination folder, and hashed admin passcodes.
_Avoid_: System table, Environment file

**Radial Orbit Hero (ศูนย์กลางวงโคจร)**:
The interactive primary visual component displaying the glowing school emblem surrounded by orbiting department nodes that trigger burst-expansion navigation.
_Avoid_: Menu wheel, Pie chart

**Announcement Ticker (แถบประกาศด่วน)**:
A configurable header bar displaying important real-time school news or urgent notices.
_Avoid_: Marquee, Breaking news

**Two-View Navigation (สลับมุมมองสองระดับ)**:
The UX architecture separating the clean Orbit Hub home screen from the focused Department / Search view.
_Avoid_: Single-page scroll, Accordion list

**PWA Home Screen Installation (ติดตั้งลงหน้าจอโฮม)**:
The capability allowing users to install the portal onto Android and iOS home screens with full standalone display.
_Avoid_: App Store download, APK

**Dedicated Admin Dashboard (แผงควบคุมระบบแอดมิน)**:
A full-screen dedicated management workspace (`#admin`) providing administrative control over all school portal services, branding, and announcements, replacing cramped modal popups.
_Avoid_: Settings popup, Admin dialog

**Link Management Directory (ศูนย์จัดการระบบงาน)**:
The comprehensive CRUD interface inside the admin dashboard displaying all Google Sheets service links with real-time filtering, adding, in-place editing, and deletion capabilities.
_Avoid_: URL list, Bookmark manager

**Mobile Hamburger Drawer (เมนูแฮมเบอร์เกอร์แอดมิน)**:
The mobile-exclusive left slide-out navigation drawer allowing smooth switching between admin management sections without cluttering the screen.
_Avoid_: Dropdown menu, Context menu

**Light Theme Color Harmony (ธีมสว่างพาเลตต์พรีเมียม)**:
A crisp Violet-Rose executive palette for daylight usage featuring pure white cards, high-contrast typography, and vibrant accents without murky alpha washes.
_Avoid_: Gray mode, White inversion

**Service Icon Upload (อัปโหลดไอคอนระบบงาน)**:
The direct client-to-cloud asset upload workflow that scales and compresses application icon images to 512x512 pixels before depositing them into the school's `RRU_Portal_Assets` Google Drive folder.
_Avoid_: External image hosting, Raw binary paste



