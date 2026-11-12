/**
 * RRU School Portal - Admin Control Panel Modal Component
 */

import { store } from '../state.js';
import { CONFIG } from '../config.js';
import { callGasApi } from '../api.js';
import { escapeHtml, refreshIcons, showToast } from '../utils.js';

export function renderAdminModal(container) {
  if (!container) return;

  let activeTab = 'links'; // 'links' | 'branding' | 'announcement' | 'settings'
  let editingLink = null;  // link object when editing

  // Listen to open events
  document.addEventListener('open-admin-modal', () => {
    openModal();
  });

  document.addEventListener('admin-edit-link', (e) => {
    const { rowIndex } = e.detail;
    const { links } = store.get();
    editingLink = links.find(l => String(l.rowIndex) === String(rowIndex)) || null;
    activeTab = 'links';
    openModal();
  });

  document.addEventListener('admin-delete-link', async (e) => {
    const { rowIndex, systemName } = e.detail;
    if (confirm(`คุณต้องการลบ "${systemName}" ออกจากระบบใช่หรือไม่?`)) {
      await handleDeleteLink(rowIndex);
    }
  });

  function openModal() {
    container.classList.remove('hidden');
    render();
  }

  function closeModal() {
    container.classList.add('hidden');
    editingLink = null;
  }

  function render() {
    const state = store.get();
    const { isAdmin, config } = state;

    if (!isAdmin) {
      // PIN Authentication Form
      container.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div class="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl border border-pink-500/30 shadow-2xl relative">
            
            <button id="btn-close-modal" class="absolute right-4 top-4 text-purple-300/60 hover:text-pink-300 p-1">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>

            <div class="text-center mb-6">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-pink-500/30">
                <i data-lucide="lock" class="w-7 h-7"></i>
              </div>
              <h3 class="text-xl font-bold text-purple-100">เข้าสู่ระบบผู้ดูแล (Admin)</h3>
              <p class="text-xs text-purple-300/70 mt-1">
                กรอกรหัส PIN เพื่อจัดการลิงก์บริการและปรับแต่งหน้าเว็บ
              </p>
            </div>

            <form id="admin-login-form" class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-purple-200 mb-1.5">รหัสผ่าน PIN</label>
                <div class="relative">
                  <input 
                    type="password" 
                    id="admin-pin-input" 
                    required 
                    placeholder="กรอก PIN (ค่าเริ่มต้น: 1234)" 
                    class="w-full px-4 py-3 rounded-xl bg-purple-950/40 border border-pink-500/25 focus:border-pink-500 text-purple-100 placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-pink-500/20 text-center tracking-widest text-lg font-mono"
                  />
                </div>
              </div>

              <div id="login-error-msg" class="text-xs text-rose-400 text-center hidden"></div>

              <button 
                type="submit" 
                id="btn-login-submit"
                class="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
              >
                <i data-lucide="key" class="w-4 h-4"></i> เข้าสู่ระบบ
              </button>
            </form>

            <div class="mt-4 pt-3 border-t border-pink-500/15 text-center">
              <span class="text-[11px] text-purple-300/50">
                * ค่าเริ่มต้นจากระบบคือ PIN: <span class="font-mono text-pink-300 font-bold">1234</span>
              </span>
            </div>

          </div>
        </div>
      `;
      refreshIcons(container);
      bindLoginEvents();
      return;
    }

    // Admin Dashboard Interface (Authenticated)
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md">
        <div class="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-pink-500/30 shadow-2xl overflow-hidden">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-pink-500/20 bg-purple-950/40">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white">
                <i data-lucide="shield-check" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold text-purple-100">แผงควบคุมระบบ (Admin Control Panel)</h3>
                <p class="text-[11px] text-purple-300/60">โรงเรียนรัฐราษฎร์อุปถัมภ์</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button id="btn-admin-logout" class="px-3 py-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-600 rounded-lg border border-rose-500/30 transition-all flex items-center gap-1">
                <i data-lucide="log-out" class="w-3.5 h-3.5"></i> ออกจากระบบ
              </button>
              <button id="btn-close-modal" class="text-purple-300/60 hover:text-pink-300 p-1.5 rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="flex items-center gap-1 px-6 pt-3 border-b border-pink-500/15 overflow-x-auto no-scrollbar bg-purple-950/20">
            ${[
              { id: 'links', label: 'จัดการลิงก์ระบบงาน', icon: 'link' },
              { id: 'branding', label: 'แบนเนอร์ & โลโก้ รร.', icon: 'image' },
              { id: 'announcement', label: 'ข้อความประกาศด่วน', icon: 'bell' },
              { id: 'settings', label: 'การเชื่อมต่อ & รหัส PIN', icon: 'settings' }
            ].map(tab => `
              <button 
                data-tab-id="${tab.id}" 
                class="admin-tab-btn flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all flex-shrink-0 ${
                  activeTab === tab.id 
                    ? 'border-pink-500 text-pink-300 bg-pink-500/10' 
                    : 'border-transparent text-purple-300/60 hover:text-purple-200'
                }"
              >
                <i data-lucide="${tab.icon}" class="w-4 h-4"></i> ${tab.label}
              </button>
            `).join('')}
          </div>

          <!-- Tab Content Area (Scrollable) -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6" id="admin-tab-body">
            ${renderTabContent(activeTab, state, editingLink)}
          </div>

        </div>
      </div>
    `;

    refreshIcons(container);
    bindDashboardEvents();
  }

  function renderTabContent(tab, state, editing) {
    if (tab === 'links') {
      return renderLinksTab(editing);
    }
    if (tab === 'branding') {
      return renderBrandingTab(state.config);
    }
    if (tab === 'announcement') {
      return renderAnnouncementTab(state.config);
    }
    if (tab === 'settings') {
      return renderSettingsTab();
    }
    return '';
  }

  function renderLinksTab(editing) {
    return `
      <div class="space-y-6">
        <!-- Form to Add/Edit Link -->
        <div class="p-4 sm:p-5 rounded-2xl bg-purple-950/30 border border-pink-500/20">
          <h4 class="text-sm font-bold text-pink-300 mb-3 flex items-center gap-2">
            <i data-lucide="${editing ? 'pencil' : 'plus-circle'}" class="w-4 h-4"></i>
            ${editing ? `แก้ไขระบบงาน: ${escapeHtml(editing.systemName)}` : 'เพิ่มระบบงานใหม่เข้าสู่ Portal'}
          </h4>

          <form id="form-link-action" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="hidden" id="link-row-index" value="${editing ? editing.rowIndex : ''}" />

            <div>
              <label class="block text-xs text-purple-200 mb-1">กลุ่มบริหาร (ฝ่ายงาน) *</label>
              <select id="link-group" required class="w-full px-3 py-2 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm focus:border-pink-500 focus:outline-none">
                ${CONFIG.DEPARTMENTS.map(d => `
                  <option value="${d.name}" ${editing && editing.group === d.name ? 'selected' : ''}>${d.name}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block text-xs text-purple-200 mb-1">บทบาทผู้ใช้งานที่มองเห็น *</label>
              <select id="link-role" required class="w-full px-3 py-2 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm focus:border-pink-500 focus:outline-none">
                <option value="all" ${editing && editing.role === 'all' ? 'selected' : ''}>ทุกคน (นักเรียน, ผู้ปกครอง, ครู)</option>
                <option value="student" ${editing && editing.role === 'student' ? 'selected' : ''}>เฉพาะนักเรียน</option>
                <option value="parent" ${editing && editing.role === 'parent' ? 'selected' : ''}>เฉพาะผู้ปกครอง</option>
                <option value="teacher" ${editing && editing.role === 'teacher' ? 'selected' : ''}>เฉพาะครู / บุคลากร</option>
              </select>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs text-purple-200 mb-1">ชื่อระบบงาน / บริการ *</label>
              <input 
                type="text" 
                id="link-system-name" 
                required 
                value="${editing ? escapeHtml(editing.systemName) : ''}" 
                placeholder="เช่น ระบบตรวจสอบผลการเรียน, ระบบขอใช้ยานพาหนะ" 
                class="w-full px-3 py-2 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs text-purple-200 mb-1">URL ปลายทางของระบบ *</label>
              <input 
                type="url" 
                id="link-target-url" 
                required 
                value="${editing ? escapeHtml(editing.link) : ''}" 
                placeholder="https://script.google.com/... หรือ https://..." 
                class="w-full px-3 py-2 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs text-purple-200 mb-1">URL ไอคอน หรือ ลิงก์ Google Drive (ไม่บังคับ)</label>
              <input 
                type="text" 
                id="link-icon-url" 
                value="${editing ? escapeHtml(editing.rawIconUrl || editing.iconUrl) : ''}" 
                placeholder="https://drive.google.com/file/d/... หรือ URL รูปภาพ" 
                class="w-full px-3 py-2 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div class="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
              ${editing ? `
                <button type="button" id="btn-cancel-edit" class="px-4 py-2 rounded-xl border border-purple-500/30 text-purple-300 hover:text-white text-xs">
                  ยกเลิกการแก้ไข
                </button>
              ` : ''}
              <button 
                type="submit" 
                id="btn-save-link"
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                <i data-lucide="save" class="w-4 h-4"></i>
                ${editing ? 'บันทึกการแก้ไข' : 'เพิ่มระบบงานลง Sheet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function renderBrandingTab(config) {
    return `
      <div class="space-y-6">
        <!-- Logo Upload Section -->
        <div class="p-4 sm:p-5 rounded-2xl bg-purple-950/30 border border-pink-500/20">
          <h4 class="text-sm font-bold text-pink-300 mb-3 flex items-center gap-2">
            <i data-lucide="image" class="w-4 h-4"></i> อัปโหลดโลโก้โรงเรียน (School Logo)
          </h4>
          <div class="flex flex-col sm:flex-row items-center gap-4">
            <div class="w-20 h-20 rounded-2xl overflow-hidden p-1 bg-gradient-to-tr from-pink-500 to-purple-600 flex-shrink-0">
              <img id="logo-preview-img" src="${config.logoUrl || CONFIG.SCHOOL.logoDefault}" alt="Logo" class="w-full h-full object-cover rounded-xl bg-slate-900" />
            </div>
            <div class="flex-1 w-full space-y-2">
              <input type="file" id="input-upload-logo" accept="image/*" class="text-xs text-purple-200 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700 cursor-pointer" />
              <p class="text-[11px] text-purple-300/60">รองรับไฟล์ PNG, JPG, WebP (ระบบจะอัปโหลดขึ้น Google Drive ของโรงเรียนอัตโนมัติ)</p>
            </div>
          </div>
        </div>

        <!-- Banner Upload Section -->
        <div class="p-4 sm:p-5 rounded-2xl bg-purple-950/30 border border-pink-500/20">
          <h4 class="text-sm font-bold text-pink-300 mb-3 flex items-center gap-2">
            <i data-lucide="panorama" class="w-4 h-4"></i> อัปโหลดแบนเนอร์โรงเรียน (Hero Banner)
          </h4>
          <div class="space-y-3">
            <div class="w-full h-32 rounded-2xl overflow-hidden bg-purple-950/40 border border-pink-500/20 flex items-center justify-center">
              ${config.bannerUrl ? `
                <img id="banner-preview-img" src="${config.bannerUrl}" alt="Banner" class="w-full h-full object-cover" />
              ` : `
                <span class="text-xs text-purple-300/40">ยังไม่ได้ตั้งค่ารูปแบนเนอร์ (ใช้ธีมไล่เฉดสีม่วงชมพูปกติ)</span>
              `}
            </div>
            <input type="file" id="input-upload-banner" accept="image/*" class="text-xs text-purple-200 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700 cursor-pointer" />
          </div>
        </div>

        <!-- School Names Config -->
        <form id="form-branding-names" class="p-4 sm:p-5 rounded-2xl bg-purple-950/30 border border-pink-500/20 space-y-3">
          <div>
            <label class="block text-xs text-purple-200 mb-1">ชื่อโรงเรียน</label>
            <input type="text" id="cfg-school-name" value="${escapeHtml(config.schoolName)}" class="w-full px-3 py-2 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm" />
          </div>
          <div>
            <label class="block text-xs text-purple-200 mb-1">คำขวัญ / คำอธิบายสั้น</label>
            <input type="text" id="cfg-school-subtitle" value="${escapeHtml(config.schoolSubtitle)}" class="w-full px-3 py-2 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm" />
          </div>
          <button type="submit" class="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold">
            บันทึกชื่อโรงเรียน
          </button>
        </form>
      </div>
    `;
  }

  function renderAnnouncementTab(config) {
    return `
      <form id="form-announcement" class="p-4 sm:p-5 rounded-2xl bg-purple-950/30 border border-pink-500/20 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-pink-500/20">
          <div>
            <h4 class="text-sm font-bold text-pink-300">แสดงแถบประกาศด่วนด้านบนสุด</h4>
            <p class="text-xs text-purple-300/60">เปิดเพื่อแจ้งข่าวสารสำคัญหรือประกาศด่วนของโรงเรียน</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="cfg-announcement-enabled" ${config.announcementEnabled ? 'checked' : ''} class="sr-only peer" />
            <div class="w-11 h-6 bg-purple-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
          </label>
        </div>

        <div>
          <label class="block text-xs text-purple-200 mb-1">ข้อความประกาศ</label>
          <textarea id="cfg-announcement-text" rows="3" class="w-full px-3 py-2 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm focus:border-pink-500">${escapeHtml(config.announcementText)}</textarea>
        </div>

        <button type="submit" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-xs sm:text-sm shadow-md">
          บันทึกการตั้งค่าประกาศ
        </button>
      </form>
    `;
  }

  function renderSettingsTab() {
    const currentGasUrl = localStorage.getItem('rru_gas_url') || CONFIG.GAS_API_URL;

    return `
      <div class="space-y-6">
        <!-- Change PIN -->
        <form id="form-change-pin" class="p-4 sm:p-5 rounded-2xl bg-purple-950/30 border border-pink-500/20 space-y-3">
          <h4 class="text-sm font-bold text-pink-300 flex items-center gap-2">
            <i data-lucide="key-round" class="w-4 h-4"></i> เปลี่ยนรหัสผ่าน PIN ผู้ดูแลระบบ
          </h4>
          <div>
            <label class="block text-xs text-purple-200 mb-1">รหัส PIN ใหม่ (อย่างน้อย 4 ตัว)</label>
            <input type="password" id="cfg-new-pin" required minlength="4" placeholder="เช่น 5678" class="w-full px-3 py-2 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm" />
          </div>
          <button type="submit" class="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold">
            เปลี่ยนรหัส PIN
          </button>
        </form>

        <!-- Custom GAS Web App URL -->
        <form id="form-gas-url" class="p-4 sm:p-5 rounded-2xl bg-purple-950/30 border border-pink-500/20 space-y-3">
          <h4 class="text-sm font-bold text-pink-300 flex items-center gap-2">
            <i data-lucide="cpu" class="w-4 h-4"></i> กำหนด Apps Script Web App Deployment URL
          </h4>
          <p class="text-xs text-purple-300/60">
            เมื่อ deploy Google Apps Script เป็น Web App แล้ว สามารถนำ URL ปลายทางมาใส่ที่นี่ได้ทันที
          </p>
          <div>
            <input type="url" id="cfg-gas-url-input" value="${escapeHtml(currentGasUrl)}" class="w-full px-3 py-2 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs font-mono" />
          </div>
          <button type="submit" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold">
            บันทึก Endpoint URL
          </button>
        </form>
      </div>
    `;
  }

  // Bind Login
  function bindLoginEvents() {
    const closeBtn = container.querySelector('#btn-close-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const form = container.querySelector('#admin-login-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pinInput = container.querySelector('#admin-pin-input');
        const errorMsg = container.querySelector('#login-error-msg');
        const submitBtn = container.querySelector('#btn-login-submit');

        const pin = pinInput.value.trim();
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="animate-spin mr-2">◌</span> กำลังตรวจสอบ...';

        try {
          await callGasApi('verifyPin', { pin });
          store.setAdmin(true, pin);
          showToast('เข้าสู่ระบบผู้ดูแลสำเร็จ', 'success');
          render();
        } catch (err) {
          // If offline or initial, check default '1234'
          if (pin === '1234') {
            store.setAdmin(true, pin);
            showToast('เข้าสู่ระบบด้วย PIN ค่าเริ่มต้น (1234)', 'success');
            render();
          } else {
            errorMsg.textContent = err.message || 'รหัส PIN ไม่ถูกต้อง';
            errorMsg.classList.remove('hidden');
          }
        } finally {
          submitBtn.disabled = false;
        }
      });
    }
  }

  // Bind Dashboard
  function bindDashboardEvents() {
    const closeBtn = container.querySelector('#btn-close-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const logoutBtn = container.querySelector('#btn-admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        store.setAdmin(false, '');
        showToast('ออกจากระบบแอดมินแล้ว', 'info');
        closeModal();
      });
    }

    // Tab Switching
    const tabBtns = container.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tabId;
        render();
      });
    });

    // Form: Link Add / Update
    const formLink = container.querySelector('#form-link-action');
    if (formLink) {
      formLink.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rowIndex = container.querySelector('#link-row-index').value;
        const group = container.querySelector('#link-group').value;
        const role = container.querySelector('#link-role').value;
        const systemName = container.querySelector('#link-system-name').value.trim();
        const link = container.querySelector('#link-target-url').value.trim();
        const iconUrl = container.querySelector('#link-icon-url').value.trim();

        const { adminPin } = store.get();
        const action = rowIndex ? 'updateLink' : 'addLink';

        try {
          await callGasApi(action, {
            pin: adminPin,
            rowIndex: rowIndex || undefined,
            group,
            role,
            systemName,
            link,
            iconUrl
          });

          // Update local state links
          const { links } = store.get();
          if (rowIndex) {
            const idx = links.findIndex(l => String(l.rowIndex) === String(rowIndex));
            if (idx !== -1) {
              links[idx] = { ...links[idx], group, role, systemName, link, iconUrl };
            }
          } else {
            links.push({
              rowIndex: links.length + 2,
              group, role, systemName, link, iconUrl
            });
          }
          store.set({ links: [...links] });

          showToast(rowIndex ? 'แก้ไขระบบงานสำเร็จ' : 'เพิ่มระบบงานใหม่เรียบร้อย', 'success');
          editingLink = null;
          render();
        } catch (err) {
          showToast(`เกิดข้อผิดพลาด: ${err.message}`, 'error');
        }
      });
    }

    const cancelEditBtn = container.querySelector('#btn-cancel-edit');
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        editingLink = null;
        render();
      });
    }

    // Upload Logo
    const logoFile = container.querySelector('#input-upload-logo');
    if (logoFile) {
      logoFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await handleFileUpload(file, 'logo');
      });
    }

    // Upload Banner
    const bannerFile = container.querySelector('#input-upload-banner');
    if (bannerFile) {
      bannerFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await handleFileUpload(file, 'banner');
      });
    }

    // Branding Names Form
    const formBranding = container.querySelector('#form-branding-names');
    if (formBranding) {
      formBranding.addEventListener('submit', async (e) => {
        e.preventDefault();
        const schoolName = container.querySelector('#cfg-school-name').value.trim();
        const schoolSubtitle = container.querySelector('#cfg-school-subtitle').value.trim();
        const { adminPin, config } = store.get();

        try {
          await callGasApi('saveConfig', {
            pin: adminPin,
            settings: { SCHOOL_NAME: schoolName, SCHOOL_SUBTITLE: schoolSubtitle }
          });
          store.set({ config: { ...config, schoolName, schoolSubtitle } });
          showToast('บันทึกชื่อโรงเรียนสำเร็จ', 'success');
        } catch (err) {
          showToast(`บันทึกไม่สำเร็จ: ${err.message}`, 'error');
        }
      });
    }

    // Announcement Form
    const formAnnounce = container.querySelector('#form-announcement');
    if (formAnnounce) {
      formAnnounce.addEventListener('submit', async (e) => {
        e.preventDefault();
        const announcementEnabled = container.querySelector('#cfg-announcement-enabled').checked;
        const announcementText = container.querySelector('#cfg-announcement-text').value.trim();
        const { adminPin, config } = store.get();

        try {
          await callGasApi('saveConfig', {
            pin: adminPin,
            settings: {
              ANNOUNCEMENT_ENABLED: String(announcementEnabled),
              ANNOUNCEMENT_TEXT: announcementText
            }
          });
          store.set({ config: { ...config, announcementEnabled, announcementText } });
          showToast('บันทึกประกาศด่วนสำเร็จ', 'success');
        } catch (err) {
          showToast(`บันทึกไม่สำเร็จ: ${err.message}`, 'error');
        }
      });
    }

    // Change PIN Form
    const formPin = container.querySelector('#form-change-pin');
    if (formPin) {
      formPin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPin = container.querySelector('#cfg-new-pin').value.trim();
        const { adminPin } = store.get();

        try {
          await callGasApi('changePin', { pin: adminPin, newPin });
          store.setAdmin(true, newPin);
          showToast('เปลี่ยนรหัส PIN สำเร็จแล้ว', 'success');
          container.querySelector('#cfg-new-pin').value = '';
        } catch (err) {
          showToast(`เปลี่ยน PIN ไม่สำเร็จ: ${err.message}`, 'error');
        }
      });
    }

    // GAS URL Form
    const formGasUrl = container.querySelector('#form-gas-url');
    if (formGasUrl) {
      formGasUrl.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = container.querySelector('#cfg-gas-url-input').value.trim();
        if (url) {
          localStorage.setItem('rru_gas_url', url);
          showToast('บันทึก Apps Script Endpoint URL เรียบร้อย', 'success');
        }
      });
    }
  }

  // Base64 file uploader
  async function handleFileUpload(file, targetType) {
    const { adminPin, config } = store.get();
    showToast(`กำลังอัปโหลดไฟล์ ${file.name} เข้าสู่ Google Drive...`, 'info', 6000);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await callGasApi('uploadImage', {
          pin: adminPin,
          base64: reader.result,
          fileName: file.name,
          mimeType: file.type,
          targetType
        });

        if (targetType === 'logo') {
          store.set({ config: { ...config, logoUrl: res.url } });
        } else if (targetType === 'banner') {
          store.set({ config: { ...config, bannerUrl: res.url } });
        }

        showToast('อัปโหลดไฟล์ขึ้น Google Drive และอัปเดตหน้าเว็บสำเร็จ!', 'success');
        render();
      } catch (err) {
        showToast(`อัปโหลดล้มเหลว: ${err.message}`, 'error');
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleDeleteLink(rowIndex) {
    const { adminPin, links } = store.get();
    try {
      await callGasApi('deleteLink', { pin: adminPin, rowIndex });
      const nextLinks = links.filter(l => String(l.rowIndex) !== String(rowIndex));
      store.set({ links: nextLinks });
      showToast('ลบลิงก์ระบบงานเรียบร้อยแล้ว', 'success');
    } catch (err) {
      showToast(`ลบไม่สำเร็จ: ${err.message}`, 'error');
    }
  }
}
