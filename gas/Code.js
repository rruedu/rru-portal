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
        ensureIdColumn_(sheet);
        const newId = payload.id || ('rru_' + Date.now().toString(36) + '_' + Utilities.getUuid().slice(0, 6));
        const newRow = [
          payload.role || 'all',
          payload.group || 'กลุ่มบริหารทั่วไป',
          payload.systemName || '',
          payload.iconUrl || '',
          payload.link || '#',
          newId
        ];
        sheet.appendRow(newRow);
        return jsonResponse_({ success: true, message: 'เพิ่มลิงก์บริการสำเร็จ', id: newId });
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
        ensureIdColumn_(sheet);
        const targetRow = findRowIndexByIdOrIndex_(sheet, payload.id, payload.rowIndex);
        if (targetRow < 2) {
          return jsonResponse_({ success: false, error: 'ไม่พบรายการที่ต้องการแก้ไข (Invalid ID or rowIndex)' });
        }
        
        // Preserve existing ID or set provided ID
        const existingId = sheet.getRange(targetRow, 6).getValue() || payload.id || ('rru_' + Date.now().toString(36) + '_' + Utilities.getUuid().slice(0, 6));

        sheet.getRange(targetRow, 1, 1, 6).setValues([[
          payload.role || 'all',
          payload.group || 'กลุ่มบริหารทั่วไป',
          payload.systemName || '',
          payload.iconUrl || '',
          payload.link || '#',
          existingId
        ]]);
        return jsonResponse_({ success: true, message: 'แก้ไขข้อมูลลิงก์สำเร็จ', id: existingId, rowIndex: targetRow });
      } finally {
        lock.releaseLock();
      }
    }

    // 7. Delete Service Link
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

      // Skip empty separator rows
      if (!role && !group && !systemName && !link) {
        continue;
      }

      // Auto-correct typo in sheet if present
      if (group === 'กลุ่มบริหารทั่งไป') {
        group = 'กลุ่มบริหารทั่วไป';
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
        link: link
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
 * Ensure column 6 has the 'ID' header if not present
 */
function ensureIdColumn_(sheet) {
  try {
    const lastCol = sheet.getLastColumn();
    if (lastCol < 6) {
      sheet.getRange(1, 6).setValue('ID');
      sheet.getRange(1, 6).setFontWeight('bold');
    } else {
      const headerVal = sheet.getRange(1, 6).getValue();
      if (!headerVal) {
        sheet.getRange(1, 6).setValue('ID');
        sheet.getRange(1, 6).setFontWeight('bold');
      }
    }
  } catch (e) {
    // Non-fatal if header styling fails
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
