/**
 * RRU School Portal - Announcement Banner Component
 */

import { store } from '../state.js';
import { escapeHtml, refreshIcons } from '../utils.js';

export function renderAnnouncement(container) {
  if (!container) return;

  function update() {
    const { config, currentView } = store.get();
    if (currentView === 'admin' || !config.announcementEnabled || !config.announcementText) {
      container.innerHTML = '';
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="relative overflow-hidden bg-gradient-to-r from-pink-900/60 via-purple-900/60 to-pink-900/60 border-b border-pink-500/20 py-2.5 px-4 backdrop-blur-md">
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div class="flex items-center gap-2 flex-shrink-0 font-bold text-pink-300">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
            </span>
            <i data-lucide="bell" class="w-4 h-4"></i>
            <span class="font-bold">ประกาศ:</span>
          </div>

          <div class="overflow-hidden relative w-full">
            <div class="text-purple-100 font-medium text-xs sm:text-sm leading-snug">
              ${escapeHtml(config.announcementText)}
            </div>
          </div>

          <button id="btn-close-announcement" class="text-pink-400/80 hover:text-pink-200 transition-colors p-1 rounded cursor-pointer" title="ปิดการแจ้งเตือน">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;

    refreshIcons(container);

    const closeBtn = container.querySelector('#btn-close-announcement');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        container.classList.add('hidden');
      });
    }
  }

  store.subscribe(update);
  update();
}
