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
 * Re-render all Lucide icons inside element
 */
export function refreshIcons(root = document) {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ root });
  }
}
