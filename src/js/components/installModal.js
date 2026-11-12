/**
 * RRU School Portal - PWA "Add to Home Screen" Component
 * Works seamlessly across Android, iOS, and Desktop
 */

import { refreshIcons } from '../utils.js';

let deferredInstallPrompt = null;

export function initPwaInstall(container) {
  if (!container) return;

  // Listen for native Android/Chromium PWA install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
  });

  // Listen for custom trigger event
  document.addEventListener('trigger-pwa-install', () => {
    openInstallGuide(container);
  });
}

export function openInstallGuide(container) {
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (isStandalone) {
    alert('คุณได้ติดตั้ง RRU Portal ไว้บนหน้าจอมือถือเรียบร้อยแล้ว');
    return;
  }

  // If Android/Chromium has deferred prompt ready
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choice) => {
      deferredInstallPrompt = null;
    });
    return;
  }

  // Render Guide Modal (Specifically tailored for iOS or Android manual install)
  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div class="glass-panel w-full max-w-md p-6 rounded-3xl border border-pink-500/30 shadow-2xl relative text-left">
        
        <button id="btn-close-install-modal" class="absolute right-4 top-4 text-purple-300/60 hover:text-pink-300 p-1">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>

        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-pink-500/30">
            <i data-lucide="smartphone" class="w-6 h-6"></i>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-purple-100">ติดตั้งแอปลงหน้าจอมือถือ</h3>
            <p class="text-xs text-purple-300/70">เปิดใช้งานได้ทันทีเหมือนแอปทั่วไป</p>
          </div>
        </div>

        ${isIos ? `
          <!-- iOS Instructions -->
          <div class="space-y-3 bg-purple-950/40 p-4 rounded-2xl border border-pink-500/20 text-xs sm:text-sm text-purple-100">
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-pink-500/30 text-pink-300 flex items-center justify-center font-bold flex-shrink-0 text-xs">1</span>
              <div>
                แตะที่ปุ่มแชร์ <b>Share</b> <span class="inline-block px-1.5 py-0.5 rounded bg-purple-900 border border-pink-500/30 text-pink-300 font-mono text-xs">⎋</span> ที่แถบเมนูด้านล่างของ Safari
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-pink-500/30 text-pink-300 flex items-center justify-center font-bold flex-shrink-0 text-xs">2</span>
              <div>
                เลื่อนลงแล้วเลือก <b>"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</b>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-pink-500/30 text-pink-300 flex items-center justify-center font-bold flex-shrink-0 text-xs">3</span>
              <div>
                กด <b>"เพิ่ม" (Add)</b> ที่มุมขวาบน จะมีไอคอน RRU Portal ปรากฏบนหน้าจอมือถือทันที!
              </div>
            </div>
          </div>
        ` : `
          <!-- Android / Chrome Instructions -->
          <div class="space-y-3 bg-purple-950/40 p-4 rounded-2xl border border-pink-500/20 text-xs sm:text-sm text-purple-100">
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-pink-500/30 text-pink-300 flex items-center justify-center font-bold flex-shrink-0 text-xs">1</span>
              <div>
                แตะที่ปุ่มเมนู <b>3 จุด (⋮)</b> ที่มุมขวาบนของเบราว์เซอร์ Chrome
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-pink-500/30 text-pink-300 flex items-center justify-center font-bold flex-shrink-0 text-xs">2</span>
              <div>
                เลือก <b>"ติดตั้งแอป" (Install App)</b> หรือ <b>"เพิ่มลงในหน้าจอหลัก"</b>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-pink-500/30 text-pink-300 flex items-center justify-center font-bold flex-shrink-0 text-xs">3</span>
              <div>
                กด <b>"ติดตั้ง" (Install)</b> ไอคอนของโรงเรียนจะถูกเพิ่มลงบนหน้าจอมือถือทันที!
              </div>
            </div>
          </div>
        `}

        <button 
          id="btn-confirm-install-modal" 
          class="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-xs sm:text-sm shadow-md"
        >
          เข้าใจแล้ว
        </button>

      </div>
    </div>
  `;

  refreshIcons(container);

  const close = () => {
    container.classList.add('hidden');
    container.innerHTML = '';
  };

  const closeBtn = container.querySelector('#btn-close-install-modal');
  if (closeBtn) closeBtn.addEventListener('click', close);

  const confirmBtn = container.querySelector('#btn-confirm-install-modal');
  if (confirmBtn) confirmBtn.addEventListener('click', close);
}
