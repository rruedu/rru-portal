/**
 * RRU School Portal - API Service
 */

import { CONFIG } from './config.js';
import { normalizeDriveImage } from './utils.js';

// Seed initial data directly from the user's Google Sheet as robust fallback
const INITIAL_SEED_LINKS = [
  { rowIndex: 2, role: 'student', group: 'กลุ่มบริหารวิชาการ', systemName: 'ระบบงานทะเบียนและวัดผล', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://drive.google.com/file/d/1i67Q3cmBqEFqIdQwrF1F97Cm7kWL2IbS/view' },
  { rowIndex: 3, role: 'parent', group: 'กลุ่มบริหารวิชาการ', systemName: 'ระบบรายงานผลการเรียนนักเรียน', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://drive.google.com/file/d/1i67Q3cmBqEFqIdQwrF1F97Cm7kWL2IbS/view' },
  { rowIndex: 4, role: 'teacher', group: 'กลุ่มบริหารวิชาการ', systemName: 'ระบบตรวจสอบและส่งผลการเรียน', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://drive.google.com/file/d/1i67Q3cmBqEFqIdQwrF1F97Cm7kWL2IbS/view' },
  { rowIndex: 6, role: 'student', group: 'กลุ่มบริหารกิจการนักเรียน', systemName: 'ระบบพฤติกรรมนักเรียน', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://script.google.com/macros/s/AKfycbwcd_XDkJzj38Pn3BR9Lmzg4UdDbBwe_D_WKVVxO8G3xsu4fI0Lu3vV5Y1hfqNG2LFEkg/exec' },
  { rowIndex: 7, role: 'parent', group: 'กลุ่มบริหารกิจการนักเรียน', systemName: 'ระบบพฤติกรรมนักเรียน', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://script.google.com/macros/s/AKfycbwcd_XDkJzj38Pn3BR9Lmzg4UdDbBwe_D_WKVVxO8G3xsu4fI0Lu3vV5Y1hfqNG2LFEkg/exec' },
  { rowIndex: 8, role: 'teacher', group: 'กลุ่มบริหารกิจการนักเรียน', systemName: 'ระบบพฤติกรรมนักเรียน', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://script.google.com/macros/s/AKfycbwcd_XDkJzj38Pn3BR9Lmzg4UdDbBwe_D_WKVVxO8G3xsu4fI0Lu3vV5Y1hfqNG2LFEkg/exec' },
  { rowIndex: 9, role: 'teacher', group: 'กลุ่มบริหารกิจการนักเรียน', systemName: 'ระบบตรวจเครื่องแต่งกาย', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://script.google.com/macros/s/AKfycbzUpUWcmkiS4OwJuOtMBexd9E8a9-rpcB1Ubj_3UYjyR8AStYkQsCceRZdYzzLgXhUVjw/exec' },
  { rowIndex: 10, role: 'teacher', group: 'กลุ่มบริหารกิจการนักเรียน', systemName: 'ระบบปัจจัยพื้นฐานนักเรียนยากจน (CCT)', iconUrl: 'https://drive.google.com/thumbnail?id=1vFpU8kf76jom7RgKjViD6TyQtH73bOIp&sz=w300', link: 'https://cct.eef.or.th/' },
  { rowIndex: 11, role: 'teacher', group: 'กลุ่มบริหารกิจการนักเรียน', systemName: 'ระบบเช็คชื่อนักเรียน (สพม.)', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://app.sesaorb.go.th/time-check/login.php' },
  { rowIndex: 12, role: 'student', group: 'กลุ่มบริหารกิจการนักเรียน', systemName: 'ระบบติดตามนักเรียนมาสาย', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://script.google.com/macros/s/AKfycbxmy1kOJAcRJxxrw2L-tYD3MBiBZn08cTIv4kUD-fYVtlPihPPj7UXnFtBZ5qUz05_u3A/exec' },
  { rowIndex: 13, role: 'parent', group: 'กลุ่มบริหารกิจการนักเรียน', systemName: 'ระบบติดตามนักเรียนมาสาย', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://script.google.com/macros/s/AKfycbxmy1kOJAcRJxxrw2L-tYD3MBiBZn08cTIv4kUD-fYVtlPihPPj7UXnFtBZ5qUz05_u3A/exec' },
  { rowIndex: 14, role: 'teacher', group: 'กลุ่มบริหารกิจการนักเรียน', systemName: 'ระบบติดตามนักเรียนมาสาย', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://script.google.com/macros/s/AKfycbxmy1kOJAcRJxxrw2L-tYD3MBiBZn08cTIv4kUD-fYVtlPihPPj7UXnFtBZ5qUz05_u3A/exec' },
  { rowIndex: 15, role: 'teacher', group: 'กลุ่มบริหารกิจการนักเรียน', systemName: 'ระบบประเมินความสะอาดเขตพื้นที่', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://script.google.com/macros/s/AKfycbwc94e9adXeiqFfb5AeLVlDGXb3QdVNTAmy0mxzI0ithnmm2sUS7D-zP1yI6rqDvJDd/exec' },
  { rowIndex: 16, role: 'student', group: 'กลุ่มบริหารกิจการนักเรียน', systemName: 'ระบบประเมินความสะอาดเขตพื้นที่', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://script.google.com/macros/s/AKfycbwc94e9adXeiqFfb5AeLVlDGXb3QdVNTAmy0mxzI0ithnmm2sUS7D-zP1yI6rqDvJDd/exec' },
  { rowIndex: 20, role: 'student', group: 'กลุ่มบริหารงบประมาณ', systemName: 'ระบบเบิกจ่ายและสวัสดิการนักเรียน', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://drive.google.com/file/d/1i67Q3cmBqEFqIdQwrF1F97Cm7kWL2IbS/view' },
  { rowIndex: 21, role: 'parent', group: 'กลุ่มบริหารงบประมาณ', systemName: 'ระบบตรวจสอบเงินอุดหนุนการศึกษา', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://drive.google.com/file/d/1i67Q3cmBqEFqIdQwrF1F97Cm7kWL2IbS/view' },
  { rowIndex: 22, role: 'teacher', group: 'กลุ่มบริหารงบประมาณ', systemName: 'ระบบพัสดุและจัดซื้อจัดจ้าง', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://drive.google.com/file/d/1i67Q3cmBqEFqIdQwrF1F97Cm7kWL2IbS/view' },
  { rowIndex: 24, role: 'teacher', group: 'กลุ่มบริหารทั่วไป', systemName: 'ระบบขอใช้ห้องและยานพาหนะ', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://drive.google.com/file/d/1i67Q3cmBqEFqIdQwrF1F97Cm7kWL2IbS/view' },
  { rowIndex: 26, role: 'teacher', group: 'กลุ่มบริหารงานบุคคล', systemName: 'ระบบบันทึกเวลาและการลาออนไลน์', iconUrl: 'https://drive.google.com/thumbnail?id=1ttgBDo5VFaP38CVNHze3iDSXR67fGur0&sz=w300', link: 'https://drive.google.com/file/d/1i67Q3cmBqEFqIdQwrF1F97Cm7kWL2IbS/view' }
];

export async function fetchPortalData() {
  const customUrl = localStorage.getItem('rru_gas_url') || CONFIG.GAS_API_URL;

  try {
    const res = await fetch(`${customUrl}?action=getData`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.success && Array.isArray(json.links)) {
      return {
        links: json.links,
        config: json.config
      };
    }
  } catch (err) {
    console.warn('Cannot fetch from live Apps Script API, utilizing local verified dataset:', err.message);
  }

  // Fallback to local verified dataset
  return {
    links: INITIAL_SEED_LINKS,
    config: {
      schoolName: CONFIG.SCHOOL.name,
      schoolSubtitle: CONFIG.SCHOOL.subtitle,
      bannerUrl: '',
      logoUrl: CONFIG.SCHOOL.logoDefault,
      announcementText: 'ยินดีต้อนรับสู่ระบบรวมงานและบริการออนไลน์ โรงเรียนรัฐราษฎร์อุปถัมภ์ (RRU Portal)',
      announcementEnabled: true
    }
  };
}

export async function callGasApi(action, payload = {}) {
  const customUrl = localStorage.getItem('rru_gas_url') || CONFIG.GAS_API_URL;

  const res = await fetch(customUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight triggers in GAS
    body: JSON.stringify({ action, ...payload })
  });

  if (!res.ok) {
    throw new Error(`Server returned HTTP ${res.status}`);
  }

  const result = await res.json();
  if (!result.success) {
    throw new Error(result.error || 'Operation failed');
  }

  return result;
}
