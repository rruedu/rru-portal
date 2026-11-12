# 🌟 RRU School Portal (โรงเรียนรัฐราษฎร์อุปถัมภ์)

ระบบรวมงานและบริการออนไลน์ (All-in-One Service Gateway) สำหรับโรงเรียนรัฐราษฎร์อุปถัมภ์ รวบรวมทุกระบบงานของ 5 กลุ่มบริหารไว้ในที่เดียว ออกแบบสำหรับนักเรียน ผู้ปกครอง และครูบุคลากร ใช้งานได้ทุกอุปกรณ์ (Fully Responsive) โฮสต์บน **GitHub Pages** และเชื่อมต่อฐานข้อมูล **Google Sheets** ผ่าน **Google Apps Script**.

![RRU Portal Banner](https://via.placeholder.com/1200x400/130a26/ec4899?text=RRU+School+Portal+All-in-One)

---

## 🎨 จุดเด่นของระบบ (Features)

1. **สถาปัตยกรรมประสิทธิภาพสูง (Static SPA + Apps Script API):**
   - โฮสต์ส่วนหน้าเว็บฟรีบน **GitHub Pages** โหลดรวดเร็ว ไม่ติดข้อจำกัด Iframe และไม่มีหน้าต่างเตือนสิทธิ์ของ Google
   - ใช้ **Google Apps Script** เป็น RESTful API เชื่อมต่อกับ **Google Spreadsheet**
2. **ธีมม่วงชมพู Dual-Theme (Dark Neon Glow / Light Pastel):**
   - โหมดเริ่มต้น **Dark Violet-Pink Cyber-Glass** เปล่งแสงนีออน ล้ำสมัย สวยงาม
   - มีปุ่มสลับโหมดเป็น **Light Mode** สีขาวพาสเทลสะอาดตาได้ทันที
3. **Radial Orbit Hero (แอนิเมชันวงโคจร):**
   - ตรงกลางแสดงตราสัญลักษณ์ รร. เปล่งรัศมี พร้อม 5 กลุ่มฝ่ายงานโคจรรอบทิศทาง
   - คลิกเพื่อแตกตัว (Burst Expansion Effect) และนำทางไปยังการ์ดของฝ่ายนั้น
   - ปรับเป็น Adaptive Carousel บนสมาร์ตโฟน ใช้งานสะดวกด้วยมือเดียว
4. **Instant Search & Role Filter:**
   - กรองระบบงานตามบทบาททันที: **[ทั้งหมด] [นักเรียน] [ผู้ปกครอง] [ครู / บุคลากร]**
   - ช่องค้นหาด่วน (Live Search) พิมพ์แล้วผลลัพธ์ปรากฏทันที
5. **Admin Control Panel (ระบบแอดมินครบวงจร):**
   - ล็อกอินด้วยรหัส PIN (ค่าเริ่มต้น: `1234` ปรับเปลี่ยนได้ในระบบ)
   - **จัดการลิงก์:** เพิ่ม แก้ไข และลบระบบงาน โดยข้อมูลจะซิงค์ไปยัง Google Sheet แบบ Realtime
   - **อัปโหลดรูปภาพ:** อัปโหลดแบนเนอร์และโลโก้โรงเรียน โดยระบบจะส่งไปเก็บใน Google Drive โฟลเดอร์ `"RRU_Portal_Assets"` อัตโนมัติ พร้อมสร้าง Direct Thumbnail Link
   - **ประกาศด่วน (Announcement Ticker):** เปิด/ปิดแถบตัววิ่งประกาศข่าวด่วนที่ด้านบนสุดของหน้าเว็บ

---

## 📁 โครงสร้างโปรเจกต์ (Clean Component Architecture)

```
ระบบรวมงานrru/
├── index.html                      # หน้าแรก Single Page Application
├── .clasp.json                     # การตั้งค่าเชื่อมต่อ Google Apps Script
├── .gitignore                      # ไฟล์ที่ไม่ต้องการนำเข้า git
├── CONTEXT.md                      # ศัพท์เฉพาะและบริบทของโปรเจกต์
├── README.md                       # คู่มือการใช้งานและติดตั้ง
├── .github/
│   └── workflows/
│       └── pages.yml               # CI/CD Deploy ไปยัง GitHub Pages อัตโนมัติ
├── docs/
│   └── adr/                        # Architecture Decision Records
│       ├── 0001-static-frontend-with-apps-script-backend.md
│       ├── 0002-admin-auth-and-asset-pipeline.md
│       └── 0003-ui-motion-and-theming.md
├── gas/                            # โค้ดฝั่ง Google Apps Script Backend
│   ├── appsscript.json             # Manifest การตั้งค่า Apps Script
│   └── Code.js                     # API endpoints (GET / POST / Image Upload / CRUD)
└── src/
    ├── styles/
    │   ├── main.css                # ธีมหลัก สี แสงนีออน และ Glassmorphism
    │   └── orbit.css               # เลย์เอาต์และแอนิเมชัน Radial Orbit
    └── js/
        ├── config.js               # ค่าคงที่และโครงสร้างกลุ่มงาน
        ├── state.js                # State Store จัดการสถานะแอปพลิเคชัน
        ├── api.js                  # ฟังก์ชันเรียก API เชื่อมกับ Apps Script
        ├── utils.js                # ฟังก์ชันช่วยเหลือ (Toast, Drive URL, Debounce)
        ├── app.js                  # Entry point เริ่มต้นการทำงานของเว็บ
        └── components/             # คอมโพเนนต์แยกการทำงานเป็นอิสระ
            ├── announcement.js     # แถบประกาศด่วน
            ├── navbar.js           # แถบเมนูด้านบน ตัวกรองบทบาท และปุ่มสลับธีม
            ├── orbitHero.js        # แอนิเมชันโลโก้ตรงกลางและ 5 ฝ่ายงาน
            ├── departmentGrid.js   # การ์ดแสดงระบบงานแยกตามกลุ่มบริหาร
            └── adminModal.js       # หน้าต่างแผงควบคุมของผู้ดูแลระบบ
```

---

## 🚀 ขั้นตอนการติดตั้งและการนำไปใช้งาน

### 1. นำโค้ดขึ้น GitHub
รันคำสั่งในเทอร์มินัลเพื่อ Commit และ Push โค้ดไปยัง Repository:

```bash
git add .
git commit -m "feat: complete RRU School Portal with modular components and Apps Script backend"
git branch -M main
git push -u origin main
```

### 2. เปิดใช้งาน GitHub Pages
1. ไปที่ GitHub Repository: `https://github.com/rruedu/rru-portal`
2. ไปที่เมนู **Settings** > **Pages**
3. ที่หัวข้อ **Build and deployment** > **Source** ให้เลือกเป็น **GitHub Actions** (ระบบจะรัน Workflow `.github/workflows/pages.yml` อัตโนมัติ)
4. เมื่อ Deploy เสร็จสิ้น หน้าเว็บจะพร้อมใช้งานที่ URL:
   `https://rruedu.github.io/rru-portal/`

### 3. ติดตั้งโค้ดบน Google Apps Script
มี 2 ทางเลือกในการนำโค้ด `gas/Code.js` ไปยัง Google Apps Script (Script ID: `1XsqUQrMGNawiUWrtoMhetapokBqT26V4voFfSh0UpYP-h4Ff47bhYhHP`):

#### ทางเลือก ก: ใช้ Google clasp (CLI)
```bash
npx @google/clasp login
npx @google/clasp push
```

#### ทางเลือก ข: คัดลอกโดยตรง (สะดวกและรวดเร็ว)
1. เปิดโปรเจกต์ Apps Script: [https://script.google.com/d/1XsqUQrMGNawiUWrtoMhetapokBqT26V4voFfSh0UpYP-h4Ff47bhYhHP/edit](https://script.google.com/d/1XsqUQrMGNawiUWrtoMhetapokBqT26V4voFfSh0UpYP-h4Ff47bhYhHP/edit)
2. คัดลอกโค้ดจากไฟล์ `gas/Code.js` ไปวางทับในไฟล์ `Code.gs`
3. บันทึก (Ctrl + S)
4. คลิกปุ่ม **Deploy (การทำให้ใช้งานได้)** > **New deployment (การทำให้ใช้งานได้รายการใหม่)**
5. เลือกประเภท: **Web app (เว็บแอป)**
   - **Execute as (ดำเนินการในฐานะ):** Me (ฉัน - บัญชีของคุณ)
   - **Who has access (ผู้มีสิทธิ์เข้าถึง):** Anyone (ทุกคน)
6. คลิก **Deploy** และคัดลอก **Web app URL** ที่ได้รับ
7. เปิดหน้าเว็บ Portal คลิกที่ปุ่ม **แอดมิน** > แท็บ **การเชื่อมต่อ & รหัส PIN** > วาง Web app URL แล้วกดบันทึก

---

## 🔒 ข้อมูลความปลอดภัย (Security Note)
- รหัสผ่าน PIN เริ่มต้นสำหรับแอดมินคือ: `1234`
- สามารถเปลี่ยนรหัส PIN ได้ที่แท็บตั้งค่าในหน้าแอดมิน โดยรหัสจะถูกอัปเดตลงใน Google Sheet แท็บ `Config` โดยอัตโนมัติ

---

&copy; โรงเรียนรัฐราษฎร์อุปถัมภ์ &bull; All Rights Reserved
