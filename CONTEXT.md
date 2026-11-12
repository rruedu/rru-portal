# RRU School Portal

Centralized web portal and service gateway for Rattharat Upatham School (โรงเรียนรัฐราษฎร์อุปถัมภ์ - RRU) providing unified access to school applications, tools, and services for students, parents, and teachers.

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



