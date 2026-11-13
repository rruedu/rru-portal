/**
 * RRU School Portal - Utility Helpers
 */

/**
 * Display a modern toast notification
 */
export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 shadow-emerald-500/20',
    error: 'bg-rose-950/80 border-rose-500/50 text-rose-200 shadow-rose-500/20',
    info: 'bg-purple-950/80 border-pink-500/50 text-purple-200 shadow-purple-500/20'
  };

  const icons = {
    success: 'check-circle-2',
    error: 'alert-circle',
    info: 'info'
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg text-sm transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto ${typeStyles[type] || typeStyles.info}`;
  toast.innerHTML = `
    <i data-lucide="${icons[type] || 'info'}" class="w-5 h-5 flex-shrink-0"></i>
    <span class="font-medium">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons({ root: toast });

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Sanitize HTML string to prevent XSS
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Convert Google Drive link to thumbnail image URL
 */
export function normalizeDriveImage(url) {
  if (!url) return '';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w300`;
  }
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1] && url.includes('drive.google.com')) {
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w300`;
  }
  return url;
}

/**
 * Debounce helper for instant search
 */
export function debounce(func, wait = 250) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Compress & resize image client-side to fit within max dimensions (512x512)
 * Returns Promise<string> (Base64 dataURL in PNG format)
 */
export function compressImage(file, maxDimension = 512) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('ไฟล์ที่เลือกไม่ใช่รูปภาพที่รองรับ'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('ไม่สามารถโหลดภาพสำหรับย่อขนาดได้'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Export as PNG to preserve transparent backgrounds
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Format long URLs into clean, readable display text (e.g. domain/path...)
 */
export function formatDisplayUrl(rawUrl) {
  if (!rawUrl) return '-';
  try {
    const u = new URL(rawUrl);
    let hostname = u.hostname.replace(/^www\./, '');
    let pathname = u.pathname;
    if (pathname.length > 24) {
      pathname = pathname.slice(0, 12) + '…' + pathname.slice(-8);
    }
    return hostname + (pathname === '/' ? '' : pathname);
  } catch (e) {
    return rawUrl.length > 32 ? rawUrl.slice(0, 16) + '…' + rawUrl.slice(-12) : rawUrl;
  }
}

/**
 * Re-render all Lucide icons inside element
 */
export function refreshIcons(root = document) {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ root });
  }
}

/**
 * Modern Custom SweetAlert2 Delete Confirmation
 */
export async function confirmDelete(title, message = 'ข้อมูลจะถูกลบออกจากระบบและ Google Sheet ทันที และไม่สามารถกู้คืนได้') {
  if (window.Swal) {
    const isLight = document.documentElement.classList.contains('light');
    const result = await Swal.fire({
      title: title || 'ยืนยันการลบรายการ?',
      html: `<div style="font-size: 0.875rem; margin-top: 6px; line-height: 1.6; color: ${isLight ? '#475569' : '#d8b4fe'};">${escapeHtml(message)}</div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '<i class="lucide-trash-2 inline-block mr-1"></i> ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'rru-swal-popup',
        title: 'rru-swal-title',
        confirmButton: 'rru-swal-btn-danger',
        cancelButton: 'rru-swal-btn-cancel'
      },
      backdrop: `rgba(10, 6, 22, ${isLight ? '0.45' : '0.8'})`
    });
    return result.isConfirmed;
  }
  return window.confirm(`${title}\n\n${message}`);
}

/**
 * Modern Custom SweetAlert2 Action Confirmation
 */
export async function confirmAction({ title, message, confirmText = 'ตกลง', cancelText = 'ยกเลิก', icon = 'question', isDanger = false }) {
  if (window.Swal) {
    const isLight = document.documentElement.classList.contains('light');
    const result = await Swal.fire({
      title: title,
      html: `<div style="font-size: 0.875rem; margin-top: 6px; line-height: 1.6; color: ${isLight ? '#475569' : '#d8b4fe'};">${escapeHtml(message)}</div>`,
      icon: icon,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'rru-swal-popup',
        title: 'rru-swal-title',
        confirmButton: isDanger ? 'rru-swal-btn-danger' : 'rru-swal-btn-primary',
        cancelButton: 'rru-swal-btn-cancel'
      },
      backdrop: `rgba(10, 6, 22, ${isLight ? '0.45' : '0.8'})`
    });
    return result.isConfirmed;
  }
  return window.confirm(`${title}\n\n${message}`);
}
