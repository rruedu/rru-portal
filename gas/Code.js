/**
 * RRU School Portal - Google Apps Script Backend
 * Script ID: 1XsqUQrMGNawiUWrtoMhetapokBqT26V4voFfSh0UpYP-h4Ff47bhYhHP
 * Spreadsheet ID: 1BgKm3XODUIBZNkxMGUWbEGBlxYRNYi_Z2YxoCu9XQ3M
 */

const SPREADSHEET_ID = '1BgKm3XODUIBZNkxMGUWbEGBlxYRNYi_Z2YxoCu9XQ3M';
const LINKS_SHEET_NAME = 'Sheet1'; // Default first sheet
const CONFIG_SHEET_NAME = 'Config';
const ASSETS_FOLDER_NAME = 'RRU_Portal_Assets';

/**
 * Handle HTTP GET Requests (Public read data)
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getData';

    if (action === 'ping') {
      return jsonResponse_({ status: 'ok', timestamp: new Date().toISOString() });
    }

    if (action === 'getData') {
      const data = getPortalData_();
      return jsonResponse_({ success: true, ...data });
    }

    return jsonResponse_({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse_({ success: false, error: err.toString() });
  }
}

/**
 * Handle HTTP POST Requests (Admin operations)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ success: false, error: 'Missing request body' });
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    // 1. PIN Verification (Login)
    if (action === 'verifyPin') {
      const isValid = checkAdminPin_(payload.pin);
      if (isValid) {
        return jsonResponse_({ success: true, message: 'Authentication successful' });
      }
      return jsonResponse_({ success: false, error: 'รหัสผ่าน PIN ไม่ถูกต้อง' });
    }

    // 2. Public Action: Report Broken Link / System Issue (No PIN required)
    if (action === 'reportIssue') {
      const lock = LockService.getScriptLock();
      const hasLock = lock.tryLock(10000);
      if (!hasLock) {
        return jsonResponse_({ success: false, error: 'ระบบไม่พร้อมรับข้อมูลชั่วคราว กรุณาลองใหม่อีกครั้ง' });
      }
      try {
        const reportResult = addIssueReport_(payload);
        return jsonResponse_({ success: true, message: 'ส่งรายงานปัญหาสำเร็จ ขอขอบคุณที่ช่วยแจ้งข้อมูลครับ', ...reportResult });
      } finally {
        lock.releaseLock();
      }
    }

    // 3. Public Action: Record Link Click Analytics (No PIN required)
    if (action === 'recordClick') {
      const lock = LockService.getScriptLock();
      const hasLock = lock.tryLock(5000);
      if (!hasLock) {
        return jsonResponse_({ success: false, error: 'Server busy' });
      }
      try {
        const sheet = getLinksSheet_();
        ensureColumns_(sheet);
        const targetRow = findRowIndexByIdOrIndex_(sheet, payload.id, payload.rowIndex);
        if (targetRow >= 2) {
          const currentClicks = parseInt(sheet.getRange(targetRow, 8).getValue(), 10) || 0;
          const nextClicks = currentClicks + 1;
          sheet.getRange(targetRow, 8).setValue(nextClicks);
          return jsonResponse_({ success: true, clicks: nextClicks });
        }
        return jsonResponse_({ success: false, error: 'Item not found' });
      } finally {
        lock.releaseLock();
      }
    }

    // All subsequent actions require valid PIN
    if (!checkAdminPin_(payload.pin)) {
      return jsonResponse_({ success: false, error: 'สิทธิ์ไม่ถูกต้อง (Unauthorized: Invalid PIN)' });
    }

    // 2. Change Admin PIN
    if (action === 'changePin') {
      if (!payload.newPin || String(payload.newPin).trim().length < 4) {
        return jsonResponse_({ success: false, error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' });
      }
      setConfigValue_('ADMIN_PIN', String(payload.newPin).trim());
      return jsonResponse_({ success: true, message: 'เปลี่ยนรหัสผ่าน PIN สำเร็จเรียบร้อย' });
    }

    // 3. Save Configuration (School branding, announcement)
    if (action === 'saveConfig') {
      const settings = payload.settings || {};
      for (const [key, value] of Object.entries(settings)) {
        setConfigValue_(key, value);
      }
      return jsonResponse_({ success: true, message: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' });
    }

    // 4. Upload Image to Google Drive
    if (action === 'uploadImage') {
      const uploadResult = handleImageUpload_(payload);
      return jsonResponse_({ success: true, ...uploadResult });
    }

    // 5. Add New Service Link
    if (action === 'addLink') {
      const lock = LockService.getScriptLock();
      const hasLock = lock.tryLock(10000);
      if (!hasLock) {
        return jsonResponse_({ success: false, error: 'ระบบกำลังประมวลผลคำขออื่น กรุณาลองใหม่อีกครั้ง' });
      }
      try {
        const sheet = getLinksSheet_();
        ensureColumns_(sheet);
        const newId = payload.id || ('rru_' + Date.now().toString(36) + '_' + Utilities.getUuid().slice(0, 6));
        const status = (payload.status === 'maintenance') ? 'maintenance' : 'active';
        const clicks = parseInt(payload.clicks, 10) || 0;
        const priority = parseInt(payload.priority, 10) || 0;
        const newRow = [
          payload.role || 'all',
          payload.group || 'กลุ่มบริหารทั่วไป',
          payload.systemName || '',
          payload.iconUrl || '',
          payload.link || '#',
          newId,
          status,
          clicks,
          priority
        ];
        sheet.appendRow(newRow);
        return jsonResponse_({ success: true, message: 'เพิ่มลิงก์บริการสำเร็จ', id: newId, status: status, clicks: clicks, priority: priority });
      } finally {
        lock.releaseLock();
      }
    }

    // 6. Update Service Link
    if (action === 'updateLink') {
      const lock = LockService.getScriptLock();
      const hasLock = lock.tryLock(10000);
      if (!hasLock) {
        return jsonResponse_({ success: false, error: 'ระบบกำลังประมวลผลคำขออื่น กรุณาลองใหม่อีกครั้ง' });
      }
      try {
        const sheet = getLinksSheet_();
        ensureColumns_(sheet);
        const targetRow = findRowIndexByIdOrIndex_(sheet, payload.id, payload.rowIndex);
        if (targetRow < 2) {
          return jsonResponse_({ success: false, error: 'ไม่พบรายการที่ต้องการแก้ไข (Invalid ID or rowIndex)' });
        }
        
        // Preserve existing ID or set provided ID
        const existingId = sheet.getRange(targetRow, 6).getValue() || payload.id || ('rru_' + Date.now().toString(36) + '_' + Utilities.getUuid().slice(0, 6));
        const currentStatus = sheet.getLastColumn() >= 7 ? sheet.getRange(targetRow, 7).getValue() : 'active';
        const newStatus = payload.status !== undefined ? (payload.status === 'maintenance' ? 'maintenance' : 'active') : (currentStatus || 'active');
        const existingClicks = sheet.getLastColumn() >= 8 ? (parseInt(sheet.getRange(targetRow, 8).getValue(), 10) || 0) : 0;
        const priority = payload.priority !== undefined ? (parseInt(payload.priority, 10) || 0) : (sheet.getLastColumn() >= 9 ? (parseInt(sheet.getRange(targetRow, 9).getValue(), 10) || 0) : 0);

        sheet.getRange(targetRow, 1, 1, 9).setValues([[
          payload.role || 'all',
          payload.group || 'กลุ่มบริหารทั่วไป',
          payload.systemName || '',
          payload.iconUrl || '',
          payload.link || '#',
          existingId,
          newStatus,
          existingClicks,
          priority
        ]]);
        return jsonResponse_({ success: true, message: 'แก้ไขข้อมูลลิงก์สำเร็จ', id: existingId, rowIndex: targetRow, status: newStatus, priority: priority, clicks: existingClicks });
      } finally {
        lock.releaseLock();
      }
    }

    // 7. Toggle Link Status (Active <-> Maintenance)
    if (action === 'toggleLinkStatus') {
      const lock = LockService.getScriptLock();
      const hasLock = lock.tryLock(10000);
      if (!hasLock) {
        return jsonResponse_({ success: false, error: 'ระบบกำลังประมวลผลคำขออื่น กรุณาลองใหม่อีกครั้ง' });
      }
      try {
        const sheet = getLinksSheet_();
        ensureColumns_(sheet);
        const targetRow = findRowIndexByIdOrIndex_(sheet, payload.id, payload.rowIndex);
        if (targetRow < 2) {
          return jsonResponse_({ success: false, error: 'ไม่พบรายการที่ต้องการสลับสถานะ' });
        }

        let newStatus = payload.status;
        if (!newStatus) {
          const current = String(sheet.getRange(targetRow, 7).getValue() || '').trim().toLowerCase();
          newStatus = (current === 'maintenance') ? 'active' : 'maintenance';
        }

        sheet.getRange(targetRow, 7).setValue(newStatus);
        return jsonResponse_({ 
          success: true, 
          message: 'สลับสถานะเป็น ' + (newStatus === 'maintenance' ? 'ปิดปรับปรุง' : 'พร้อมใช้งาน'), 
          status: newStatus, 
          rowIndex: targetRow 
        });
      } finally {
        lock.releaseLock();
      }
    }

    // 8. Delete Service Link
    if (action === 'deleteLink') {
      const lock = LockService.getScriptLock();
      const hasLock = lock.tryLock(10000);
      if (!hasLock) {
        return jsonResponse_({ success: false, error: 'ระบบกำลังประมวลผลคำขออื่น กรุณาลองใหม่อีกครั้ง' });
      }
      try {
        const sheet = getLinksSheet_();
        const targetRow = findRowIndexByIdOrIndex_(sheet, payload.id, payload.rowIndex);
        if (targetRow < 2) {
          return jsonResponse_({ success: false, error: 'ไม่พบรายการที่ต้องการลบ (Invalid ID or rowIndex)' });
        }
        sheet.deleteRow(targetRow);
        return jsonResponse_({ success: true, message: 'ลบลิงก์สำเร็จ', rowIndex: targetRow });
      } finally {
        lock.releaseLock();
      }
    }

    // 9. Get Issue Reports (Admin only)
    if (action === 'getReports') {
      const reports = getIssueReports_();
      return jsonResponse_({ success: true, reports: reports });
    }

    // 10. Resolve or Delete Issue Report (Admin only)
    if (action === 'resolveReport') {
      const result = resolveIssueReport_(payload);
      return jsonResponse_({ success: true, ...result });
    }

    // 11. Restore Backup (Admin only)
    if (action === 'restoreBackup') {
      const lock = LockService.getScriptLock();
      const hasLock = lock.tryLock(25000);
      if (!hasLock) {
        return jsonResponse_({ success: false, error: 'ระบบกำลังประมวลผลคำขออื่น กรุณาลองใหม่อีกครั้ง' });
      }
      try {
        const backupData = payload.backupData;
        if (!backupData || !Array.isArray(backupData.links)) {
          return jsonResponse_({ success: false, error: 'ข้อมูลสำรองไม่ถูกต้อง (Invalid backup payload)' });
        }

        // Restore Config values if present
        if (backupData.config && typeof backupData.config === 'object') {
          for (const [key, value] of Object.entries(backupData.config)) {
            if (value !== undefined) {
              setConfigValue_(key, String(value));
            }
          }
        }

        // Restore Links Sheet
        const sheet = getLinksSheet_();
        ensureColumns_(sheet);

        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          sheet.deleteRows(2, lastRow - 1);
        }

        const rowsToInsert = backupData.links.map((item, idx) => {
          return [
            item.role || 'all',
            item.group || 'กลุ่มบริหารทั่วไป',
            item.systemName || '',
            item.iconUrl || item.rawIconUrl || '',
            item.link || '#',
            item.id || ('rru_' + Date.now().toString(36) + '_' + (idx + 1)),
            item.status || 'active',
            parseInt(item.clicks, 10) || 0,
            parseInt(item.priority, 10) || 0
          ];
        });

        if (rowsToInsert.length > 0) {
          sheet.getRange(2, 1, rowsToInsert.length, 9).setValues(rowsToInsert);
        }

        return jsonResponse_({ 
          success: true, 
          message: `กู้คืนข้อมูลสำรองสำเร็จ (${rowsToInsert.length} ระบบงาน)`,
          restoredCount: rowsToInsert.length 
        });
      } finally {
        lock.releaseLock();
      }
    }

    return jsonResponse_({ success: false, error: 'Unknown POST action: ' + action });
  } catch (err) {
    return jsonResponse_({ success: false, error: err.toString() });
  }
}

/**
 * Retrieve all portal links and configuration
 */
function getPortalData_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const linksSheet = getLinksSheet_(ss);
  const config = getConfigMap_(ss);

  // Read links data
  const dataRange = linksSheet.getDataRange();
  const values = dataRange.getValues();

  const links = [];
  if (values.length > 1) {
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const role = String(row[0] || '').trim();
      let group = String(row[1] || '').trim();
      const systemName = String(row[2] || '').trim();
      const iconUrl = String(row[3] || '').trim();
      const link = String(row[4] || '').trim();
      let id = String(row[5] || '').trim();
      let status = String(row[6] || '').trim().toLowerCase();
      let clicks = parseInt(row[7], 10) || 0;
      let priority = parseInt(row[8], 10) || 0;

      // Skip empty separator rows
      if (!role && !group && !systemName && !link) {
        continue;
      }

      // Auto-correct typo in sheet if present
      if (group === 'กลุ่มบริหารทั่งไป') {
        group = 'กลุ่มบริหารทั่วไป';
      }

      // Default status to active if empty
      if (!status || (status !== 'maintenance' && status !== 'inactive')) {
        status = 'active';
      }

      // If id is missing in sheet row, provide deterministic ID fallback
      if (!id) {
        id = 'rru_link_' + (i + 1);
      }

      links.push({
        id: id,
        rowIndex: i + 1, // 1-based index in sheet for backwards compatibility
        role: role.toLowerCase(),
        group: group,
        systemName: systemName,
        iconUrl: normalizeImageUrl_(iconUrl),
        rawIconUrl: iconUrl,
        link: link,
        status: status,
        clicks: clicks,
        priority: priority
      });
    }
  }

  return {
    links: links,
    config: {
      schoolName: config['SCHOOL_NAME'] || 'โรงเรียนรัฐราษฎร์อุปถัมภ์',
      schoolSubtitle: config['SCHOOL_SUBTITLE'] || 'ระบบรวมงานและบริการสารสนเทศออนไลน์ (RRU Portal)',
      bannerUrl: config['BANNER_URL'] || '',
      logoUrl: config['LOGO_URL'] || '',
      announcementText: config['ANNOUNCEMENT_TEXT'] || 'ยินดีต้อนรับสู่ระบบรวมงานและบริการออนไลน์ โรงเรียนรัฐราษฎร์อุปถัมภ์',
      announcementEnabled: config['ANNOUNCEMENT_ENABLED'] !== 'false'
    }
  };
}

/**
 * Handle base64 image upload to Google Drive
 */
function handleImageUpload_(payload) {
  const base64Data = payload.base64;
  const fileName = payload.fileName || ('upload_' + Date.now() + '.png');
  const mimeType = payload.mimeType || 'image/png';
  const targetType = payload.targetType; // 'banner', 'logo', or 'icon'

  if (!base64Data) {
    throw new Error('No base64 image data received');
  }

  // Strip data URL scheme prefix if present
  const pureBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  const decodedBytes = Utilities.base64Decode(pureBase64);
  const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

  const folder = getOrCreateAssetFolder_();
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const fileId = file.getId();
  const directThumbnailUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1000';

  // Automatically update config if target is banner or logo
  if (targetType === 'banner') {
    setConfigValue_('BANNER_URL', directThumbnailUrl);
  } else if (targetType === 'logo') {
    setConfigValue_('LOGO_URL', directThumbnailUrl);
  }

  return {
    fileId: fileId,
    url: directThumbnailUrl,
    viewUrl: file.getUrl(),
    message: 'อัปโหลดรูปภาพสำเร็จ'
  };
}

/**
 * Convert Google Drive view URL to direct thumbnail image
 */
function normalizeImageUrl_(url) {
  if (!url) return '';
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return 'https://drive.google.com/thumbnail?id=' + driveMatch[1] + '&sz=w300';
  }
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1] && url.includes('drive.google.com')) {
    return 'https://drive.google.com/thumbnail?id=' + idParamMatch[1] + '&sz=w300';
  }
  return url;
}

/**
 * Check Admin PIN against Config sheet (Default: 1234)
 */
function checkAdminPin_(inputPin) {
  if (!inputPin) return false;
  const config = getConfigMap_();
  const savedPin = config['ADMIN_PIN'] || '1234';
  return String(inputPin).trim() === String(savedPin).trim();
}

/**
 * Get or create the Links sheet
 */
function getLinksSheet_(ss) {
  const spreadsheet = ss || SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(LINKS_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.getSheets()[0];
  }
  return sheet;
}

/**
 * Get or create the Config key-value sheet
 */
function getConfigSheet_(ss) {
  const spreadsheet = ss || SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(CONFIG_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG_SHEET_NAME);
    sheet.appendRow(['Key', 'Value', 'Description']);
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
    // Set default initial configurations
    sheet.appendRow(['ADMIN_PIN', '1234', 'รหัสผ่านผู้ดูแลระบบ']);
    sheet.appendRow(['SCHOOL_NAME', 'โรงเรียนรัฐราษฎร์อุปถัมภ์', 'ชื่อสถานศึกษา']);
    sheet.appendRow(['SCHOOL_SUBTITLE', 'ระบบรวมงานและบริการสารสนเทศออนไลน์ (RRU Portal)', 'คำขวัญหรือคำอธิบาย']);
    sheet.appendRow(['BANNER_URL', '', 'URL รูปภาพแบนเนอร์ส่วนหัว']);
    sheet.appendRow(['LOGO_URL', '', 'URL โลโก้โรงเรียน']);
    sheet.appendRow(['ANNOUNCEMENT_TEXT', 'ยินดีต้อนรับสู่ระบบรวมงานและบริการออนไลน์ โรงเรียนรัฐราษฎร์อุปถัมภ์', 'ข้อความแถบประกาศ']);
    sheet.appendRow(['ANNOUNCEMENT_ENABLED', 'true', 'เปิด/ปิดแถบประกาศ (true/false)']);
  }
  return sheet;
}

/**
 * Read Config sheet as a Key-Value Map
 */
function getConfigMap_(ss) {
  const sheet = getConfigSheet_(ss);
  const data = sheet.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0] || '').trim();
    const val = String(data[i][1] || '').trim();
    if (key) {
      map[key] = val;
    }
  }
  return map;
}

/**
 * Update or set a specific config key
 */
function setConfigValue_(key, value, ss) {
  const sheet = getConfigSheet_(ss);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0] || '').trim() === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  // Not found, append
  sheet.appendRow([key, value, 'Auto added setting']);
}

/**
 * Find or create designated Google Drive asset folder
 */
function getOrCreateAssetFolder_() {
  const config = getConfigMap_();
  const savedFolderId = config['DRIVE_FOLDER_ID'];

  if (savedFolderId) {
    try {
      return DriveApp.getFolderById(savedFolderId);
    } catch (e) {
      // Fallback if folder was deleted
    }
  }

  const folders = DriveApp.getFoldersByName(ASSETS_FOLDER_NAME);
  if (folders.hasNext()) {
    const folder = folders.next();
    setConfigValue_('DRIVE_FOLDER_ID', folder.getId());
    return folder;
  }

  const newFolder = DriveApp.createFolder(ASSETS_FOLDER_NAME);
  newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  setConfigValue_('DRIVE_FOLDER_ID', newFolder.getId());
  return newFolder;
}

/**
 * Standard JSON Response with CORS headers
 */
function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Ensure columns 6 to 9 have headers ('ID', 'Status', 'Clicks', 'Priority') if not present
 */
function ensureColumns_(sheet) {
  try {
    const lastCol = sheet.getLastColumn();
    const headers = [
      [6, 'ID'],
      [7, 'Status'],
      [8, 'Clicks'],
      [9, 'Priority']
    ];

    for (const [col, name] of headers) {
      if (lastCol < col) {
        sheet.getRange(1, col).setValue(name);
        sheet.getRange(1, col).setFontWeight('bold');
      } else {
        const val = sheet.getRange(1, col).getValue();
        if (!val) {
          sheet.getRange(1, col).setValue(name);
          sheet.getRange(1, col).setFontWeight('bold');
        }
      }
    }
  } catch (e) {
    // Non-fatal if header styling fails
  }
}

/**
 * Backward-compatible aliases
 */
function ensureIdAndStatusColumns_(sheet) {
  ensureColumns_(sheet);
}

function ensureIdColumn_(sheet) {
  ensureColumns_(sheet);
}

/**
 * Reports Sheet Management
 */
const REPORTS_SHEET_NAME = 'Reports';

function getReportsSheet_(ss) {
  const spreadsheet = ss || SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(REPORTS_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(REPORTS_SHEET_NAME);
    sheet.appendRow(['Report ID', 'Timestamp', 'Link ID', 'System Name', 'Issue Type', 'Note', 'Status']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
  }
  return sheet;
}

function addIssueReport_(payload) {
  const sheet = getReportsSheet_();
  const reportId = 'rep_' + Date.now().toString(36) + '_' + Utilities.getUuid().slice(0, 4);
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
  const row = [
    reportId,
    timestamp,
    payload.linkId || '',
    payload.systemName || '',
    payload.issueType || 'ลิงก์เสีย / เข้าไม่ได้',
    payload.note || '',
    'pending' // 'pending' | 'resolved'
  ];
  sheet.appendRow(row);
  return { reportId: reportId, timestamp: timestamp };
}

function getIssueReports_() {
  const sheet = getReportsSheet_();
  const data = sheet.getDataRange().getValues();
  const reports = [];
  if (data.length > 1) {
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] && !row[3]) continue;
      reports.push({
        rowIndex: i + 1,
        reportId: String(row[0] || ''),
        timestamp: String(row[1] || ''),
        linkId: String(row[2] || ''),
        systemName: String(row[3] || ''),
        issueType: String(row[4] || ''),
        note: String(row[5] || ''),
        status: String(row[6] || 'pending').toLowerCase()
      });
    }
  }
  reports.reverse(); // latest first
  return reports;
}

function resolveIssueReport_(payload) {
  const sheet = getReportsSheet_();
  const reportId = payload.reportId;
  const rowIndex = parseInt(payload.rowIndex, 10);
  const data = sheet.getDataRange().getValues();
  let targetRow = -1;

  if (reportId) {
    const targetId = String(reportId).trim();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === targetId) {
        targetRow = i + 1;
        break;
      }
    }
  }
  if (targetRow === -1 && rowIndex >= 2 && rowIndex <= data.length) {
    targetRow = rowIndex;
  }

  if (targetRow < 2) {
    throw new Error('ไม่พบรายงานที่ต้องการทำรายการ');
  }

  if (payload.actionType === 'delete') {
    sheet.deleteRow(targetRow);
    return { message: 'ลบรายงานปัญหาสำเร็จ' };
  } else {
    sheet.getRange(targetRow, 7).setValue('resolved');
    return { message: 'เปลี่ยนสถานะเป็นแก้ไขแล้ว' };
  }
}

/**
 * Find 1-based row index by unique ID, with graceful fallback to rowIndex
 */
function findRowIndexByIdOrIndex_(sheet, id, fallbackRowIndex) {
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  // 1. Try matching by unique ID
  if (id) {
    const targetId = String(id).trim();
    for (let i = 1; i < values.length; i++) {
      if (values[i].length >= 6 && String(values[i][5] || '').trim() === targetId) {
        return i + 1;
      }
    }
  }

  // 2. Fallback to rowIndex if valid
  if (fallbackRowIndex) {
    const rIndex = parseInt(fallbackRowIndex, 10);
    if (rIndex >= 2 && rIndex <= values.length) {
      return rIndex;
    }
  }

  return -1;
}
