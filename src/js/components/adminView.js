/**
 * RRU School Portal - Dedicated Admin Dashboard View Component (#admin)
 * Includes Mobile Left Slide-over Hamburger Menu, Full Link CRUD, Branding, & Settings
 */

import { store } from '../state.js';
import { CONFIG } from '../config.js';
import { callGasApi } from '../api.js';
import { escapeHtml, refreshIcons, showToast, normalizeDriveImage, compressImage, formatDisplayUrl } from '../utils.js';

export function renderAdminView(container) {
  if (!container) return;

  let activeTab = 'links'; // 'links' | 'reports' | 'analytics' | 'branding' | 'announcement' | 'settings'
  let editingLink = null;
  let isMobileDrawerOpen = false;
  let isAddFormVisible = false; // toggle add/edit form visibility

  // Filter state for links directory inside admin
  let linkSearchQuery = '';
  let linkDeptFilter = 'all';
  let linkRoleFilter = 'all';

  // Issue reports state
  let reportsList = [];
  let isLoadingReports = false;

  function update() {
    const state = store.get();
    const { currentView, isAdmin, config, links } = state;

    // Only render when currentView is 'admin'
    if (currentView !== 'admin') {
      container.classList.add('hidden');
      container.innerHTML = '';
      return;
    }

    container.classList.remove('hidden');

    // 1. Unauthenticated: Render dedicated PIN login view
    if (!isAdmin) {
      renderPinLogin();
      return;
    }

    // 2. Authenticated: Render Dedicated Admin Workspace
    renderAdminDashboard(state);
  }

  // --- PIN Login Screen ---
  function renderPinLogin() {
    container.innerHTML = `
      <div class="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 view-enter">
        <div class="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl border border-pink-500/30 shadow-2xl relative">
          
          <!-- Back to Hub Button -->
          <button id="btn-login-back-hub" class="absolute left-5 top-5 flex items-center gap-1.5 text-xs text-purple-300 hover:text-pink-300 transition-colors">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>กลับหน้าหลัก</span>
          </button>

          <div class="text-center mt-6 mb-6">
            <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-3 shadow-xl shadow-pink-500/30">
              <i data-lucide="shield-check" class="w-8 h-8"></i>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-purple-100">
              ระบบจัดการผู้ดูแล (Admin Portal)
            </h2>
            <p class="text-xs text-purple-300/80 mt-1">
              โรงเรียนรัฐราษฎร์อุปถัมภ์ &bull; สพม.ราชบุรี
            </p>
          </div>

          <form id="admin-login-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-purple-200 mb-1.5">
                รหัสผ่าน PIN ผู้ดูแล
              </label>
              <input 
                type="password" 
                id="admin-pin-input" 
                required 
                autofocus
                placeholder="กรอก PIN (เริ่มต้น: 1234)" 
                class="w-full px-4 py-3.5 rounded-2xl bg-purple-950/40 border border-pink-500/25 focus:border-pink-500 text-purple-100 placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-pink-500/20 text-center tracking-widest text-xl font-mono"
              />
            </div>

            <div id="login-error-msg" class="text-xs text-rose-400 font-medium text-center hidden"></div>

            <button 
              type="submit" 
              id="btn-login-submit"
              class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-pink-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="key" class="w-4 h-4"></i>
              <span>เข้าสู่ระบบแอดมิน</span>
            </button>
          </form>

          <div class="mt-6 pt-4 border-t border-pink-500/15 text-center space-y-1">
            <p class="text-[11px] text-purple-300/60">
              ค่าเริ่มต้นจากระบบ: PIN <span class="font-mono text-pink-300 font-bold">1234</span>
            </p>
            <p class="text-[10px] text-purple-300/40">
              พัฒนาระบบโดย ครูไตรรัตน์ จันทร์มาศ
            </p>
          </div>

        </div>
      </div>
    `;

    refreshIcons(container);

    const backBtn = container.querySelector('#btn-login-back-hub');
    if (backBtn) backBtn.addEventListener('click', () => store.goToHub());

    const loginForm = container.querySelector('#admin-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
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
          update();
        } catch (err) {
          if (pin === '1234') {
            store.setAdmin(true, pin);
            showToast('เข้าสู่ระบบสำเร็จด้วย PIN ค่าเริ่มต้น (1234)', 'success');
            update();
          } else {
            errorMsg.textContent = err.message || 'รหัส PIN ไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง';
            errorMsg.classList.remove('hidden');
          }
        } finally {
          submitBtn.disabled = false;
        }
      });
    }
  }

  // --- Authenticated Admin Dashboard Workspace ---
  function renderAdminDashboard(state) {
    const { config, links } = state;

    container.innerHTML = `
      <div class="min-h-screen flex flex-col view-enter">
        
        <!-- Top Admin Navigation Bar -->
        <header class="sticky top-0 z-40 w-full backdrop-blur-xl bg-opacity-95 border-b border-pink-500/20 glass-panel">
          <div class="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
            
            <!-- Left: Mobile Hamburger Button (☰) & Admin Title -->
            <div class="flex items-center gap-2 sm:gap-3">
              <!-- Mobile Hamburger Menu Button (☰) -->
              <button 
                id="btn-admin-hamburger" 
                class="md:hidden p-2 rounded-xl border border-pink-500/30 hover:border-pink-500 bg-pink-500/10 text-pink-300 hover:text-white transition-all cursor-pointer"
                title="เปิดเมนูแอดมิน"
              >
                <i data-lucide="menu" class="w-5 h-5"></i>
              </button>

              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <i data-lucide="shield-check" class="w-4 h-4"></i>
                </div>
                <div>
                  <h1 class="text-xs sm:text-sm md:text-base font-extrabold text-purple-100 flex items-center gap-1.5 leading-tight">
                    <span>แผงควบคุมระบบ (Admin Portal)</span>
                    <span class="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-normal border border-pink-500/30">
                      จัดการ Google Sheet
                    </span>
                  </h1>
                  <p class="text-[10px] text-purple-300/70 truncate max-w-[190px] sm:max-w-none">
                    ${escapeHtml(config.schoolName)} &bull; สพม.ราชบุรี
                  </p>
                </div>
              </div>
            </div>

            <!-- Right: Return to Portal & Logout -->
            <div class="flex items-center gap-1.5 sm:gap-2">
              
              <!-- Theme Toggle -->
              <button 
                id="btn-admin-theme-toggle" 
                class="p-2 rounded-xl border border-pink-500/30 hover:border-pink-500 bg-purple-900/30 text-pink-300 hover:text-white transition-all cursor-pointer"
                title="เปลี่ยนธีมสี"
              >
                <i data-lucide="${state.theme === 'dark' ? 'sun' : 'moon'}" class="w-4 h-4"></i>
              </button>

              <!-- Return to Public Portal Button -->
              <button 
                id="btn-admin-exit-hub" 
                class="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                title="กลับสู่หน้าหลักของระบบ Portal"
              >
                <i data-lucide="home" class="w-3.5 h-3.5"></i>
                <span class="hidden sm:inline">หน้าหลัก Portal</span>
              </button>

              <!-- Logout Button -->
              <button 
                id="btn-admin-logout" 
                class="flex items-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-xl bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
                title="ออกจากระบบแอดมิน"
              >
                <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
                <span class="hidden md:inline">ออกจากระบบ</span>
              </button>
            </div>

          </div>
        </header>

        <!-- Main Workspace (Desktop Sidebar + Content Body) -->
        <div class="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col md:flex-row gap-6">
          
          <!-- Persistent Desktop Sidebar (Hidden on mobile) -->
          <aside class="hidden md:block w-64 flex-shrink-0">
            <div class="glass-panel p-4 rounded-3xl border border-pink-500/20 sticky top-20 space-y-6">
              
              <!-- Sidebar School Header -->
              <div class="flex items-center gap-3 pb-4 border-b border-pink-500/15">
                <div class="w-10 h-10 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-pink-500 to-purple-600 flex-shrink-0">
                  <img src="${config.logoUrl || CONFIG.SCHOOL.logoDefault}" alt="Logo" class="w-full h-full object-cover rounded-full bg-slate-900" />
                </div>
                <div class="leading-tight">
                  <p class="text-xs font-bold text-purple-100">ผู้ดูแลระบบ</p>
                  <p class="text-[10px] text-pink-400 font-semibold">Online &bull; Google Sheets</p>
                </div>
              </div>

              <!-- Navigation Menu List -->
              <nav class="space-y-1.5">
                ${getNavMenuItemsMarkup()}
              </nav>

              <!-- Developer Attribution in Sidebar -->
              <div class="pt-4 border-t border-pink-500/15 text-[11px] text-purple-300/60 leading-relaxed">
                <p class="font-semibold text-purple-200">ระบบจัดการ RRU Portal</p>
                <p>พัฒนาโดย ครูไตรรัตน์ จันทร์มาศ</p>
                <p class="text-[10px] text-purple-300/40 mt-1">สพม.ราชบุรี</p>
              </div>

            </div>
          </aside>

          <!-- Content Body -->
          <main class="flex-1 min-w-0">
            ${renderActiveTabContent(activeTab, state)}
          </main>

        </div>

        <!-- Mobile Left Slide-Over Hamburger Drawer (☰) -->
        <div id="admin-mobile-drawer" class="fixed inset-0 z-50 transition-all duration-300 ${isMobileDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}">
          <!-- Backdrop Overlay -->
          <div id="admin-drawer-backdrop" class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

          <!-- Slide-out Drawer Panel -->
          <div class="absolute inset-y-0 left-0 w-72 max-w-[85vw] glass-panel bg-[#0d071d] border-r border-pink-500/25 p-5 flex flex-col justify-between shadow-2xl transition-transform duration-300 ${isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'}">
            
            <div class="space-y-5">
              <!-- Drawer Header -->
              <div class="flex items-center justify-between pb-4 border-b border-pink-500/15">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white">
                    <i data-lucide="shield-check" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-purple-100">เมนูแอดมิน (Admin)</h3>
                    <p class="text-[10px] text-purple-300/70">รร.รัฐราษฎร์อุปถัมภ์</p>
                  </div>
                </div>

                <button id="btn-close-drawer" class="p-1.5 rounded-xl text-purple-300 hover:text-pink-300 bg-purple-950/40">
                  <i data-lucide="x" class="w-4 h-4"></i>
                </button>
              </div>

              <!-- Drawer Navigation Items -->
              <nav class="space-y-1.5">
                ${getNavMenuItemsMarkup()}
              </nav>
            </div>

            <!-- Drawer Footer Actions -->
            <div class="pt-4 border-t border-pink-500/15 space-y-2">
              <button id="btn-drawer-exit-hub" class="w-full py-2.5 px-3 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-xs font-semibold flex items-center justify-center gap-2 border border-pink-500/20">
                <i data-lucide="home" class="w-4 h-4"></i> กลับสู่หน้าหลัก Portal
              </button>
              <button id="btn-drawer-logout" class="w-full py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-rose-500/30">
                <i data-lucide="log-out" class="w-4 h-4"></i> ออกจากระบบ
              </button>
              <div class="text-[10px] text-center text-purple-300/40 pt-1">
                ครูไตรรัตน์ จันทร์มาศ &bull; สพม.ราชบุรี
              </div>
            </div>

          </div>
        </div>

      </div>
    `;

    refreshIcons(container);
    bindDashboardEvents(state);
  }

  // --- Nav Menu Markup Helper ---
  function getNavMenuItemsMarkup() {
    const pendingReportsCount = reportsList.filter(r => r.status === 'pending').length;
    const items = [
      { id: 'links', label: 'จัดการลิงก์ระบบงาน', icon: 'link-2', badge: 'CRUD' },
      { id: 'reports', label: 'รายงานปัญหาลิงก์', icon: 'flag', badge: pendingReportsCount > 0 ? `${pendingReportsCount} ใหม่` : '' },
      { id: 'analytics', label: 'สถิติ & สำรองข้อมูล', icon: 'bar-chart-2', badge: 'Power' },
      { id: 'branding', label: 'แบนเนอร์ & โลโก้ รร.', icon: 'image', badge: 'Drive' },
      { id: 'announcement', label: 'ข้อความประกาศด่วน', icon: 'bell', badge: '' },
      { id: 'settings', label: 'การเชื่อมต่อ & รหัส PIN', icon: 'settings', badge: '' }
    ];

    return items.map(item => {
      const isActive = activeTab === item.id;
      return `
        <button 
          data-tab-target="${item.id}"
          class="admin-nav-item w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
            isActive 
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20 border border-pink-400' 
              : 'text-purple-200 hover:bg-purple-900/30 hover:text-white'
          }"
        >
          <div class="flex items-center gap-2.5">
            <i data-lucide="${item.icon}" class="w-4 h-4"></i>
            <span>${item.label}</span>
          </div>
          ${item.badge ? `
            <span class="text-[9px] px-1.5 py-0.5 rounded-md font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
              ${item.badge}
            </span>
          ` : ''}
        </button>
      `;
    }).join('');
  }

  // --- Active Tab Content Router ---
  function renderActiveTabContent(tab, state) {
    if (tab === 'links') {
      return renderLinksManagementTab(state);
    }
    if (tab === 'reports') {
      return renderReportsTab();
    }
    if (tab === 'analytics') {
      return renderAnalyticsAndBackupTab(state);
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

  // --- TAB 1: Links Management Directory (Add, Edit, Delete) ---
  function renderLinksManagementTab(state) {
    const { links } = state;
    const currentIconUrl = editingLink ? normalizeDriveImage(editingLink.rawIconUrl || editingLink.iconUrl || '') : '';

    // Filter links according to search & filter dropdowns
    const query = linkSearchQuery.toLowerCase().trim();
    const filteredLinks = links.filter(item => {
      if (linkDeptFilter !== 'all' && item.group !== linkDeptFilter) return false;
      if (linkRoleFilter !== 'all' && item.role !== linkRoleFilter) return false;
      if (query) {
        const inName = (item.systemName || '').toLowerCase().includes(query);
        const inGroup = (item.group || '').toLowerCase().includes(query);
        const inRole = (item.role || '').toLowerCase().includes(query);
        return inName || inGroup || inRole;
      }
      return true;
    });

    return `
      <div class="space-y-6">
        
        <!-- Header Section with Quick Stats & Add Button -->
        <div class="glass-panel p-4 sm:p-5 rounded-3xl border border-pink-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-base sm:text-lg font-bold text-purple-100 flex items-center gap-2">
              <i data-lucide="link-2" class="w-5 h-5 text-pink-400"></i>
              <span>ศูนย์จัดการระบบงานและลิงก์บริการ (Google Sheets)</span>
            </h2>
            <p class="text-xs text-purple-300/70 mt-0.5">
              เพิ่ม แก้ไข และลบลิงก์ระบบงานออนไลน์ ข้อมูลจะเชื่อมโยงกับ Sheet ทันที
            </p>
          </div>

          <button 
            id="btn-toggle-add-form"
            class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-500/25 transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <i data-lucide="${isAddFormVisible || editingLink ? 'minus-circle' : 'plus-circle'}" class="w-4 h-4"></i>
            <span>${isAddFormVisible || editingLink ? 'ซ่อนฟอร์ม' : '➕ เพิ่มระบบงานใหม่'}</span>
          </button>
        </div>

        <!-- Add / Edit Link Form Card -->
        <div id="admin-link-form-card" class="glass-panel p-4 sm:p-6 rounded-3xl border ${editingLink ? 'border-amber-400/50 bg-amber-950/10' : 'border-pink-500/20'} ${isAddFormVisible || editingLink ? 'block' : 'hidden'} transition-all w-full min-w-0 overflow-hidden">
          
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-pink-500/15">
            <h3 class="text-sm sm:text-base font-bold ${editingLink ? 'text-amber-300' : 'text-pink-300'} flex items-center gap-2">
              <i data-lucide="${editingLink ? 'edit-3' : 'plus-circle'}" class="w-4 h-4"></i>
              <span>${editingLink ? `กำลังแก้ไขข้อมูล: ${escapeHtml(editingLink.systemName)}` : 'เพิ่มระบบงานใหม่เข้าสู่ Google Sheet'}</span>
            </h3>

            ${editingLink ? `
              <button id="btn-cancel-link-edit" class="px-2.5 py-1 rounded-lg border border-amber-400/40 text-amber-300 hover:text-white hover:bg-amber-500/20 text-xs">
                ยกเลิกการแก้ไข
              </button>
            ` : ''}
          </div>

          <form id="admin-link-action-form" class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0">
            <input type="hidden" id="field-link-id" value="${editingLink && editingLink.id ? editingLink.id : ''}" />
            <input type="hidden" id="field-link-row-index" value="${editingLink && editingLink.rowIndex ? editingLink.rowIndex : ''}" />

            <div class="min-w-0">
              <label class="block text-xs font-semibold text-purple-200 mb-1">กลุ่มบริหาร (ฝ่ายงาน) *</label>
              <select id="field-link-group" required class="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm focus:border-pink-500 focus:outline-none">
                ${CONFIG.DEPARTMENTS.map(d => `
                  <option value="${d.name}" ${editingLink && editingLink.group === d.name ? 'selected' : ''}>${d.name}</option>
                `).join('')}
              </select>
            </div>

            <div class="min-w-0">
              <label class="block text-xs font-semibold text-purple-200 mb-1">บทบาทผู้ใช้งานที่มองเห็น *</label>
              <select id="field-link-role" required class="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm focus:border-pink-500 focus:outline-none">
                <option value="all" ${editingLink && editingLink.role === 'all' ? 'selected' : ''}>ทุกคน (นักเรียน, ผู้ปกครอง, ครู)</option>
                <option value="student" ${editingLink && editingLink.role === 'student' ? 'selected' : ''}>เฉพาะนักเรียน</option>
                <option value="parent" ${editingLink && editingLink.role === 'parent' ? 'selected' : ''}>เฉพาะผู้ปกครอง</option>
                <option value="teacher" ${editingLink && editingLink.role === 'teacher' ? 'selected' : ''}>เฉพาะครู / บุคลากร</option>
              </select>
            </div>

            <div class="sm:col-span-2 min-w-0">
              <label class="block text-xs font-semibold text-purple-200 mb-1">ชื่อระบบงาน / บริการ *</label>
              <input 
                type="text" 
                id="field-link-system-name" 
                required 
                value="${editingLink ? escapeHtml(editingLink.systemName) : ''}" 
                placeholder="เช่น ระบบงานทะเบียนและวัดผล, ระบบเช็คชื่อนักเรียน" 
                class="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div class="sm:col-span-2 min-w-0">
              <label class="block text-xs font-semibold text-purple-200 mb-1">URL ปลายทางของระบบ *</label>
              <input 
                type="url" 
                id="field-link-target-url" 
                required 
                value="${editingLink ? escapeHtml(editingLink.link) : ''}" 
                placeholder="https://script.google.com/... หรือ https://..." 
                class="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm focus:border-pink-500 focus:outline-none font-mono"
              />
            </div>

            <!-- Dual-Mode Icon Uploader & Preview -->
            <div class="sm:col-span-2 min-w-0 p-3.5 sm:p-4 rounded-2xl bg-purple-950/30 border border-pink-500/20 space-y-3">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-semibold text-purple-200">
                  รูปไอคอนระบบงาน (Service Icon)
                </label>
                <span class="text-[10px] text-pink-300 font-medium">
                  อัปโหลดไฟล์ตรงจากเครื่อง หรือระบุ URL
                </span>
              </div>

              <div class="flex flex-col sm:flex-row items-center gap-4">
                <!-- Preview Thumbnail Box -->
                <div class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-purple-900/40 border-2 border-pink-500/30 flex items-center justify-center flex-shrink-0 shadow-md">
                  <img 
                    id="link-icon-preview-img" 
                    src="${currentIconUrl}" 
                    alt="Icon Preview" 
                    class="w-full h-full object-contain p-1.5 ${currentIconUrl ? '' : 'hidden'}" 
                  />
                  <div id="link-icon-placeholder" class="text-center p-1 ${currentIconUrl ? 'hidden' : 'block'}">
                    <i data-lucide="image-plus" class="w-6 h-6 sm:w-7 sm:h-7 text-pink-400/60 mx-auto mb-0.5"></i>
                    <span class="text-[9px] text-purple-300/60 block leading-tight">ไม่มีไอคอน</span>
                  </div>
                  
                  <!-- Clear Icon Button -->
                  <button 
                    type="button" 
                    id="btn-clear-link-icon" 
                    class="absolute top-1 right-1 p-1 rounded-full bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white transition-all text-xs cursor-pointer ${currentIconUrl ? '' : 'hidden'}"
                    title="ลบไอคอนออก"
                  >
                    <i data-lucide="x" class="w-3 h-3"></i>
                  </button>
                </div>

                <!-- Upload Controls & Input -->
                <div class="flex-1 w-full space-y-2">
                  <!-- File Upload Button -->
                  <div class="flex items-center gap-2 flex-wrap">
                    <input 
                      type="file" 
                      id="field-link-icon-file" 
                      accept="image/*" 
                      class="hidden" 
                    />
                    <button 
                      type="button" 
                      id="btn-trigger-icon-upload"
                      class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-pink-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <i data-lucide="upload-cloud" class="w-4 h-4"></i>
                      <span id="label-icon-upload-text">📁 อัปโหลดรูปภาพไอคอน</span>
                    </button>

                    <span class="text-[11px] text-purple-300/60">
                      (ย่อขนาด 512x512 และเก็บใน Google Drive อัตโนมัติ)
                    </span>
                  </div>

                  <!-- Fallback URL Input -->
                  <div class="space-y-1">
                    <div class="text-[11px] text-purple-300/70 font-medium">
                      หรือระบุ URL รูปภาพ / ลิงก์ Google Drive โดยตรง:
                    </div>
                    <input 
                      type="text" 
                      id="field-link-icon-url" 
                      value="${editingLink ? escapeHtml(editingLink.rawIconUrl || editingLink.iconUrl) : ''}" 
                      placeholder="https://drive.google.com/thumbnail?id=... หรือ URL รูปภาพ" 
                      class="w-full px-3 py-2 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs focus:border-pink-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Service Link Status Selector & Priority -->
            <div class="min-w-0">
              <label class="block text-xs font-semibold text-purple-200 mb-1">สถานะระบบงาน *</label>
              <select id="field-link-status" class="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm focus:border-pink-500 focus:outline-none">
                <option value="active" ${!editingLink || editingLink.status !== 'maintenance' ? 'selected' : ''}>พร้อมใช้งาน (Active) - บุคลากรเข้าถึงได้ปกติ</option>
                <option value="maintenance" ${editingLink && editingLink.status === 'maintenance' ? 'selected' : ''}>ปิดปรับปรุงชั่วคราว (Maintenance) - แสดงป้ายเตือนก่อนเข้าใช้งาน</option>
              </select>
            </div>

            <div class="min-w-0">
              <label class="block text-xs font-semibold text-purple-200 mb-1">ลำดับความสำคัญ (Priority: 0 - 999)</label>
              <input 
                type="number" 
                id="field-link-priority" 
                min="0" 
                max="999" 
                value="${editingLink && editingLink.priority !== undefined ? editingLink.priority : 0}" 
                placeholder="0 (ค่าเริ่มต้น)" 
                class="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm focus:border-pink-500 focus:outline-none font-mono"
              />
              <span class="text-[10px] text-purple-300/60 block mt-0.5">ตัวเลขยิ่งมาก ยิ่งแสดงผลเป็นลำดับแรกในการ์ด (เช่น 10 มาก่อน 0)</span>
            </div>

            <div class="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
              <button 
                type="submit" 
                id="btn-save-link-action"
                class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <i data-lucide="save" class="w-4 h-4"></i>
                <span>${editingLink ? 'บันทึกการแก้ไขลง Sheet' : 'บันทึกระบบงานใหม่ลง Sheet'}</span>
              </button>
            </div>
          </form>

        </div>

        <!-- Directory Filter & Search Toolbar -->
        <div class="glass-panel p-4 rounded-2xl border border-pink-500/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <!-- Search box -->
          <div class="relative flex-1">
            <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pink-400"></i>
            <input 
              type="text" 
              id="admin-link-search" 
              value="${escapeHtml(linkSearchQuery)}" 
              placeholder="ค้นหาชื่อระบบงานใน Sheet..." 
              class="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-purple-950/40 border border-pink-500/25 text-purple-100 placeholder-purple-300/40 focus:outline-none focus:border-pink-500"
            />
            ${linkSearchQuery ? `
              <button id="admin-link-search-clear" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-300 hover:text-pink-300">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
              </button>
            ` : ''}
          </div>

          <!-- Dropdown Filters -->
          <div class="flex items-center gap-2">
            <!-- Department Filter -->
            <select id="admin-filter-dept" class="px-3 py-2 rounded-xl text-xs bg-purple-950/40 border border-pink-500/25 text-purple-100 focus:outline-none">
              <option value="all" ${linkDeptFilter === 'all' ? 'selected' : ''}>ทุกกลุ่มบริหาร (${links.length})</option>
              ${CONFIG.DEPARTMENTS.map(d => `
                <option value="${d.name}" ${linkDeptFilter === d.name ? 'selected' : ''}>${d.shortName}</option>
              `).join('')}
            </select>

            <!-- Role Filter -->
            <select id="admin-filter-role" class="px-3 py-2 rounded-xl text-xs bg-purple-950/40 border border-pink-500/25 text-purple-100 focus:outline-none">
              <option value="all" ${linkRoleFilter === 'all' ? 'selected' : ''}>ทุกบทบาท</option>
              <option value="student" ${linkRoleFilter === 'student' ? 'selected' : ''}>นักเรียน</option>
              <option value="parent" ${linkRoleFilter === 'parent' ? 'selected' : ''}>ผู้ปกครอง</option>
              <option value="teacher" ${linkRoleFilter === 'teacher' ? 'selected' : ''}>ครู</option>
            </select>
          </div>

        </div>

        <!-- Links Cards & Table List -->
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs text-purple-300/80 px-1">
            <span>แสดงรายการที่ตรงกัน: <strong class="text-pink-300 font-mono">${filteredLinks.length}</strong> จากทั้งหมด ${links.length} รายการ</span>
          </div>

          ${filteredLinks.length === 0 ? `
            <div class="glass-panel p-8 text-center rounded-3xl border border-pink-500/20 text-purple-300/60">
              <i data-lucide="inbox" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
              <p class="text-sm font-medium">ไม่พบระบบงานที่ตรงกับเงื่อนไขค้นหา</p>
              <p class="text-xs mt-1">ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรอง</p>
            </div>
          ` : `
            <div class="grid grid-cols-1 gap-3">
              ${filteredLinks.map(item => {
                const targetDept = CONFIG.DEPARTMENTS.find(d => d.name === item.group) || {
                  color: 'from-pink-500 to-purple-600',
                  icon: 'layers',
                  shortName: item.group
                };

                const roleLabel = {
                  'all': 'ทุกคน',
                  'student': 'นักเรียน',
                  'parent': 'ผู้ปกครอง',
                  'teacher': 'ครู'
                }[item.role] || item.role;

                const iconUrl = normalizeDriveImage(item.iconUrl || item.icon_url || '');

                return `
                  <div class="glass-panel p-3.5 sm:p-4 rounded-2xl border border-pink-500/20 hover:border-pink-500/40 transition-all flex flex-col gap-2.5 w-full min-w-0 overflow-hidden">
                    
                    <!-- Top: Icon, Badges, Title -->
                    <div class="flex items-start gap-3 w-full min-w-0">
                      <!-- Icon / Thumbnail -->
                      <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-purple-950/40 border border-pink-500/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                        ${iconUrl ? `
                          <img src="${iconUrl}" alt="${escapeHtml(item.systemName)}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Seal_of_the_Ministry_of_Education_of_Thailand.svg/200px-Seal_of_the_Ministry_of_Education_of_Thailand.svg.png';" />
                        ` : `
                          <div class="w-full h-full bg-gradient-to-tr ${targetDept.color} flex items-center justify-center text-white">
                            <i data-lucide="${targetDept.icon}" class="w-5 h-5 sm:w-6 sm:h-6"></i>
                          </div>
                        `}
                      </div>

                      <!-- Title & Badges -->
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 flex-wrap mb-1">
                          <span class="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 font-medium border border-pink-500/25 whitespace-nowrap">
                            ${escapeHtml(item.group)}
                          </span>
                          <span class="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-medium border border-purple-500/25 whitespace-nowrap">
                            สำหรับ: ${roleLabel}
                          </span>
                          <span class="text-[10px] px-2 py-0.5 rounded-full ${item.status === 'maintenance' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'} font-medium border whitespace-nowrap flex items-center gap-1">
                            <i data-lucide="${item.status === 'maintenance' ? 'wrench' : 'check'}" class="w-2.5 h-2.5"></i>
                            <span>${item.status === 'maintenance' ? 'ปิดปรับปรุง' : 'พร้อมใช้งาน'}</span>
                          </span>
                          <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-mono border border-indigo-500/25 whitespace-nowrap" title="ลำดับความสำคัญ (Priority)">
                            P:${item.priority || 0}
                          </span>
                          <span class="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 font-mono border border-orange-500/25 whitespace-nowrap flex items-center gap-1" title="สถิติจำนวนครั้งที่คลิก">
                            <span>🔥</span>
                            <span>${item.clicks || 0} คลิก</span>
                          </span>
                          <span class="text-[9px] font-mono text-purple-300/50 ml-auto sm:ml-0">
                            #${item.rowIndex}
                          </span>
                        </div>

                        <h4 class="text-xs sm:text-sm font-bold text-purple-100 leading-snug break-words">
                          ${escapeHtml(item.systemName)}
                        </h4>
                      </div>
                    </div>

                    <!-- Bottom: Clean Shortened URL Badge & Actions (Never Overflows) -->
                    <div class="pt-2 border-t border-pink-500/15 flex items-center justify-between gap-2 w-full min-w-0 flex-wrap sm:flex-nowrap">
                      
                      <!-- URL Chip -->
                      <a 
                        href="${escapeHtml(item.link)}" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="min-w-0 flex-1 max-w-full sm:max-w-md inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/40 hover:bg-pink-600/20 text-pink-300 hover:text-white border border-pink-500/20 text-[11px] font-mono transition-colors group/link overflow-hidden"
                        title="คลิกเพื่อเปิดดูลิงก์: ${escapeHtml(item.link)}"
                      >
                        <i data-lucide="link" class="w-3.5 h-3.5 flex-shrink-0 text-pink-400"></i>
                        <span class="truncate block min-w-0 text-[10px] sm:text-xs font-mono font-medium">${escapeHtml(formatDisplayUrl(item.link))}</span>
                        <i data-lucide="external-link" class="w-3 h-3 flex-shrink-0 opacity-50 group-hover/link:opacity-100 ml-auto"></i>
                      </a>

                      <!-- Action Buttons: Status Toggle, Edit & Delete -->
                      <div class="flex items-center gap-1.5 flex-shrink-0 ml-auto sm:ml-0">
                        <!-- Quick Toggle Status Button -->
                        <button 
                          data-action="toggle-status" 
                          data-id="${item.id || ''}" 
                          data-row-index="${item.rowIndex}" 
                          data-current-status="${item.status || 'active'}"
                          class="btn-action-toggle-status px-2 sm:px-2.5 py-1.5 rounded-xl ${item.status === 'maintenance' ? 'bg-amber-600/30 hover:bg-emerald-600 text-amber-200 hover:text-white border border-amber-500/40' : 'bg-purple-900/40 hover:bg-amber-600 text-purple-200 hover:text-white border border-purple-500/30'} text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
                          title="สลับสถานะ: ${item.status === 'maintenance' ? 'คลิกเพื่อเปิดใช้งาน' : 'คลิกเพื่อปิดปรับปรุง'}"
                        >
                          <i data-lucide="power" class="w-3.5 h-3.5 ${item.status === 'maintenance' ? 'text-amber-300' : 'text-purple-300'}"></i>
                          <span class="text-[11px]">${item.status === 'maintenance' ? 'เปิด' : 'ปิด'}</span>
                        </button>

                        <!-- Edit Button -->
                        <button 
                          data-action="edit" 
                          data-id="${item.id || ''}" 
                          data-row-index="${item.rowIndex}" 
                          class="btn-action-edit px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-95" 
                          title="แก้ไขข้อมูลระบบนี้"
                        >
                          <i data-lucide="edit-3" class="w-3.5 h-3.5 text-pink-300"></i>
                          <span>แก้ไข</span>
                        </button>

                        <!-- Delete Button -->
                        <button 
                          data-action="delete" 
                          data-id="${item.id || ''}"
                          data-row-index="${item.rowIndex}"
                          data-system-name="${escapeHtml(item.systemName)}"
                          class="btn-action-delete px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
                          title="ลบระบบนี้ออกจากระบบ"
                        >
                          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                          <span>ลบ</span>
                        </button>
                      </div>

                    </div>

                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

      </div>
    `;
  }

  // --- TAB 2: Reports Directory (Issue Reports from Users) ---
  function renderReportsTab() {
    const pendingCount = reportsList.filter(r => r.status === 'pending').length;

    return `
      <div class="space-y-6">
        <!-- Header Section -->
        <div class="glass-panel p-4 sm:p-5 rounded-3xl border border-pink-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-base sm:text-lg font-bold text-purple-100 flex items-center gap-2">
              <i data-lucide="flag" class="w-5 h-5 text-amber-400"></i>
              <span>ศูนย์รับแจ้งปัญหาและลิงก์เสีย (Issue Reports)</span>
              ${pendingCount > 0 ? `<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">${pendingCount} รอดำเนินการ</span>` : ''}
            </h2>
            <p class="text-xs text-purple-300/70 mt-0.5">
              รายงานปัญหาที่นักเรียน ผู้ปกครอง หรือครูส่งเข้ามาผ่านปุ่มแจ้งปัญหาในการ์ดระบบงาน
            </p>
          </div>

          <button 
            id="btn-refresh-reports"
            class="px-3.5 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800 text-purple-200 hover:text-white border border-pink-500/20 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5 ${isLoadingReports ? 'animate-spin' : ''}"></i>
            <span>รีเฟรชข้อมูล</span>
          </button>
        </div>

        <!-- Reports List Body -->
        ${isLoadingReports ? `
          <div class="py-16 text-center text-purple-300 text-xs flex flex-col items-center justify-center gap-2">
            <span class="animate-spin text-2xl text-pink-400">◌</span>
            <span>กำลังโหลดรายงานปัญหาจาก Google Sheets...</span>
          </div>
        ` : reportsList.length === 0 ? `
          <div class="py-16 text-center glass-panel rounded-3xl border border-dashed border-pink-500/20 max-w-md mx-auto p-6">
            <div class="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
              <i data-lucide="check-circle" class="w-6 h-6"></i>
            </div>
            <h4 class="text-sm sm:text-base font-bold text-purple-100">ไม่มีรายงานปัญหาค้างอยู่</h4>
            <p class="text-xs text-purple-300/70 mt-1 leading-relaxed">
              ทุกลิงก์และระบบงานใช้งานได้ปกติ ยังไม่มีผู้ใช้งานแจ้งปัญหาเข้ามาในขณะนี้
            </p>
          </div>
        ` : `
          <div class="space-y-3">
            ${reportsList.map(rep => {
              const isResolved = rep.status === 'resolved';
              return `
                <div class="glass-panel p-4 rounded-2xl border ${isResolved ? 'border-purple-500/15 opacity-75' : 'border-amber-500/30 bg-amber-950/15'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all">
                  <div class="space-y-1.5 min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-[10px] px-2 py-0.5 rounded-full font-bold border ${isResolved ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}">
                        ${isResolved ? '✓ แก้ไขแล้ว' : '⏳ รอดำเนินการ'}
                      </span>
                      <h4 class="text-xs sm:text-sm font-extrabold text-purple-100">${escapeHtml(rep.systemName || 'ไม่ระบุชื่อระบบ')}</h4>
                      <span class="text-[10px] font-mono text-purple-300/50">${escapeHtml(rep.timestamp || '')}</span>
                    </div>

                    <div class="text-xs text-pink-300/90 font-medium">
                      ลักษณะปัญหา: <span class="text-purple-200 font-normal">${escapeHtml(rep.issueType || '')}</span>
                    </div>

                    ${rep.note ? `
                      <div class="text-xs text-purple-200/90 bg-purple-950/40 p-2.5 rounded-xl border border-pink-500/15 leading-relaxed">
                        ${escapeHtml(rep.note)}
                      </div>
                    ` : ''}
                  </div>

                  <div class="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    ${!isResolved ? `
                      <button 
                        data-action="resolve-report" 
                        data-report-id="${rep.reportId}" 
                        data-row-index="${rep.rowIndex}"
                        class="btn-resolve-report px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                        title="ทำเครื่องหมายว่าแก้ไขแล้ว"
                      >
                        <i data-lucide="check" class="w-3.5 h-3.5"></i>
                        <span>แก้ไขแล้ว</span>
                      </button>
                    ` : ''}

                    <button 
                      data-action="delete-report" 
                      data-report-id="${rep.reportId}" 
                      data-row-index="${rep.rowIndex}"
                      class="btn-delete-report px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                      title="ลบรายงานนี้ออกจากระบบ"
                    >
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      <span>ลบ</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  // Helper to load issue reports
  async function loadReports() {
    isLoadingReports = true;
    update();
    try {
      const { adminPin } = store.get();
      const res = await callGasApi('getReports', { pin: adminPin });
      reportsList = res.reports || [];
    } catch (err) {
      showToast(`โหลดรายงานปัญหาไม่สำเร็จ: ${err.message}`, 'error');
    } finally {
      isLoadingReports = false;
      update();
    }
  }

  // --- TAB 3: Analytics & Backup ---
  function renderAnalyticsAndBackupTab(state) {
    const { links, config } = state;

    // Metrics calculations
    const totalClicks = links.reduce((sum, item) => sum + (parseInt(item.clicks, 10) || 0), 0);
    const activeCount = links.filter(item => item.status !== 'maintenance').length;
    const maintenanceCount = links.filter(item => item.status === 'maintenance').length;

    // Sort links by clicks descending for top ranking
    const sortedByClicks = [...links]
      .filter(item => (parseInt(item.clicks, 10) || 0) > 0)
      .sort((a, b) => (parseInt(b.clicks, 10) || 0) - (parseInt(a.clicks, 10) || 0));

    const topApps = sortedByClicks.slice(0, 5);

    const rankMedals = ['🥇 อันดับ 1', '🥈 อันดับ 2', '🥉 อันดับ 3', 'อันดับ 4', 'อันดับ 5'];
    const rankColors = [
      'bg-amber-500/20 text-amber-300 border-amber-500/40',
      'bg-slate-300/20 text-slate-200 border-slate-300/40',
      'bg-orange-500/20 text-orange-300 border-orange-500/40',
      'bg-purple-900/40 text-purple-300 border-purple-500/30',
      'bg-purple-900/40 text-purple-300 border-purple-500/30'
    ];

    return `
      <div class="space-y-6">
        
        <!-- Header -->
        <div class="glass-panel p-4 sm:p-5 rounded-3xl border border-pink-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-base sm:text-lg font-bold text-purple-100 flex items-center gap-2">
              <i data-lucide="bar-chart-2" class="w-5 h-5 text-pink-400"></i>
              <span>สถิติการใช้งาน & การสำรองข้อมูล (Analytics & Backup)</span>
            </h2>
            <p class="text-xs text-purple-300/70 mt-0.5">
              ตรวจสอบความนิยมของระบบงานบริการ และดาวน์โหลด/กู้คืนฐานข้อมูล Google Sheets
            </p>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div class="glass-panel p-4 rounded-2xl border border-pink-500/20">
            <div class="flex items-center justify-between">
              <span class="text-xs text-purple-300/70">ยอดคลิกทั้งหมด</span>
              <div class="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <i data-lucide="flame" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="text-2xl sm:text-3xl font-extrabold text-orange-400 mt-2 font-mono">
              ${totalClicks.toLocaleString()}
            </div>
            <p class="text-[11px] text-purple-300/50 mt-1">ครั้งที่มีการเปิดใช้งาน</p>
          </div>

          <div class="glass-panel p-4 rounded-2xl border border-pink-500/20">
            <div class="flex items-center justify-between">
              <span class="text-xs text-purple-300/70">ระบบงานทั้งหมด</span>
              <div class="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <i data-lucide="layers" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="text-2xl sm:text-3xl font-extrabold text-pink-300 mt-2 font-mono">
              ${links.length}
            </div>
            <p class="text-[11px] text-purple-300/50 mt-1">บริการใน Google Sheet</p>
          </div>

          <div class="glass-panel p-4 rounded-2xl border border-pink-500/20">
            <div class="flex items-center justify-between">
              <span class="text-xs text-purple-300/70">พร้อมใช้งาน</span>
              <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <i data-lucide="check-circle" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="text-2xl sm:text-3xl font-extrabold text-emerald-300 mt-2 font-mono">
              ${activeCount}
            </div>
            <p class="text-[11px] text-purple-300/50 mt-1">สถานะ Active</p>
          </div>

          <div class="glass-panel p-4 rounded-2xl border border-pink-500/20">
            <div class="flex items-center justify-between">
              <span class="text-xs text-purple-300/70">ปิดปรับปรุง</span>
              <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <i data-lucide="wrench" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-2 font-mono">
              ${maintenanceCount}
            </div>
            <p class="text-[11px] text-purple-300/50 mt-1">สถานะ Maintenance</p>
          </div>

        </div>

        <!-- Top 5 Most Clicked Services Ranking -->
        <div class="glass-panel p-4 sm:p-6 rounded-3xl border border-pink-500/20 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-pink-500/15">
            <div>
              <h3 class="text-sm sm:text-base font-bold text-purple-100 flex items-center gap-2">
                <span>🔥 อันดับระบบงานยอดนิยม (Top 5 Most Popular)</span>
              </h3>
              <p class="text-xs text-purple-300/70 mt-0.5">
                เรียงลำดับจากจำนวนการคลิกเปิดใช้งานจริงของนักเรียน ครู และผู้ปกครอง
              </p>
            </div>
          </div>

          ${topApps.length === 0 ? `
            <div class="py-8 text-center text-purple-300/60 text-xs">
              ยังไม่มีข้อมูลการคลิกใช้งานในขณะนี้ ระบบจะเริ่มบันทึกและแสดงอันดับเมื่อมีผู้ใช้งานแตะเปิดลิงก์
            </div>
          ` : `
            <div class="space-y-3">
              ${topApps.map((item, idx) => {
                const percent = totalClicks > 0 ? Math.round(((item.clicks || 0) / totalClicks) * 100) : 0;
                return `
                  <div class="p-3.5 rounded-2xl bg-purple-950/40 border border-pink-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                      <span class="text-xs px-2.5 py-1 rounded-xl font-bold border ${rankColors[idx] || rankColors[4]} whitespace-nowrap">
                        ${rankMedals[idx] || (idx + 1)}
                      </span>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 flex-wrap">
                          <h4 class="text-xs sm:text-sm font-bold text-purple-100">${escapeHtml(item.systemName)}</h4>
                          <span class="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/25">
                            ${escapeHtml(item.group)}
                          </span>
                        </div>
                        <!-- Progress bar -->
                        <div class="w-full bg-purple-900/40 h-2 rounded-full mt-2 overflow-hidden border border-pink-500/10">
                          <div class="bg-gradient-to-r from-orange-500 to-pink-500 h-full rounded-full transition-all duration-500" style="width: ${percent}%;"></div>
                        </div>
                      </div>
                    </div>

                    <div class="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-pink-500/10">
                      <div class="text-xs sm:text-sm font-extrabold text-orange-400 font-mono flex items-center gap-1">
                        <span>${(item.clicks || 0).toLocaleString()} คลิก</span>
                      </div>
                      <span class="text-[10px] text-purple-300/60 font-mono">${percent}% ของยอดรวม</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Backup & Restore Operations -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          <!-- Card 1: Export JSON Backup -->
          <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-pink-500/20 flex flex-col justify-between space-y-4">
            <div>
              <div class="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-3 border border-indigo-500/30">
                <i data-lucide="download-cloud" class="w-5 h-5"></i>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-purple-100">สำรองข้อมูลระบบ (Export Backup)</h3>
              <p class="text-xs text-purple-300/70 mt-1 leading-relaxed">
                ดาวน์โหลดข้อมูลลิงก์ระบบงานทั้งหมด (${links.length} รายการ), โลโก้, แบนเนอร์, ข้อความประกาศ และสถิติการใช้งาน เก็บไว้เป็นไฟล์ JSON สำหรับความปลอดภัย
              </p>
            </div>

            <button 
              id="btn-export-backup"
              class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>ดาวน์โหลดไฟล์สำรอง (.json)</span>
            </button>
          </div>

          <!-- Card 2: Restore JSON Backup -->
          <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-pink-500/20 flex flex-col justify-between space-y-4">
            <div>
              <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-3 border border-amber-500/30">
                <i data-lucide="upload-cloud" class="w-5 h-5"></i>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-purple-100">กู้คืนข้อมูลระบบ (Restore Backup)</h3>
              <p class="text-xs text-purple-300/70 mt-1 leading-relaxed">
                นำเข้าไฟล์สำรอง (.json) ที่เคยบันทึกไว้ เพื่อแทนที่และกู้คืนข้อมูลทุกลิงก์และโครงสร้างใน Google Sheets อย่างปลอดภัย
              </p>
            </div>

            <div>
              <input type="file" id="input-restore-backup-file" accept=".json" class="hidden" />
              <button 
                type="button"
                id="btn-trigger-restore-backup"
                class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <i data-lucide="folder-up" class="w-4 h-4"></i>
                <span id="label-restore-backup-text">เลือกไฟล์ JSON เพื่อกู้คืน</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  // --- TAB 3: Branding (Logo, Banner, Names) ---
  function renderBrandingTab(config) {
    return `
      <div class="space-y-6">
        
        <!-- Header -->
        <div class="glass-panel p-4 sm:p-5 rounded-3xl border border-pink-500/20">
          <h2 class="text-base sm:text-lg font-bold text-purple-100 flex items-center gap-2">
            <i data-lucide="image" class="w-5 h-5 text-pink-400"></i>
            <span>แบรนด์ดิ้งและไฟล์รูปภาพโรงเรียน (School Branding)</span>
          </h2>
          <p class="text-xs text-purple-300/70 mt-0.5">
            อัปโหลดโลโก้และแบนเนอร์ ไฟล์จะถูกบันทึกขึ้น Google Drive โฟลเดอร์ RRU_Portal_Assets อัตโนมัติ
          </p>
        </div>

        <!-- Logo Upload -->
        <div class="glass-panel p-4 sm:p-6 rounded-3xl border border-pink-500/20 space-y-4">
          <h3 class="text-sm font-bold text-pink-300 flex items-center gap-2">
            <i data-lucide="shield" class="w-4 h-4"></i>
            <span>โลโก้ประจำโรงเรียน (School Logo)</span>
          </h3>
          <div class="flex flex-col sm:flex-row items-center gap-5">
            <div class="w-24 h-24 rounded-3xl overflow-hidden p-1 bg-gradient-to-tr from-pink-500 to-purple-600 flex-shrink-0 shadow-lg">
              <img id="logo-preview-img" src="${config.logoUrl || CONFIG.SCHOOL.logoDefault}" alt="Logo" class="w-full h-full object-cover rounded-2xl bg-slate-900" />
            </div>
            <div class="flex-1 w-full space-y-2">
              <input type="file" id="input-upload-logo" accept="image/*" class="text-xs text-purple-200 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gradient-to-r file:from-pink-500 file:to-purple-600 file:text-white hover:file:opacity-90 cursor-pointer" />
              <p class="text-[11px] text-purple-300/60">รองรับไฟล์ PNG, JPG, WebP ขนาดแนะนำสัดส่วน 1:1 หรือ 512x512px</p>
            </div>
          </div>
        </div>

        <!-- Banner Upload -->
        <div class="glass-panel p-4 sm:p-6 rounded-3xl border border-pink-500/20 space-y-4">
          <h3 class="text-sm font-bold text-pink-300 flex items-center gap-2">
            <i data-lucide="panorama" class="w-4 h-4"></i>
            <span>รูปแบนเนอร์ด้านบน (Hero Banner)</span>
          </h3>
          <div class="space-y-3">
            <div class="w-full h-36 rounded-2xl overflow-hidden bg-purple-950/40 border border-pink-500/20 flex items-center justify-center">
              ${config.bannerUrl ? `
                <img id="banner-preview-img" src="${config.bannerUrl}" alt="Banner" class="w-full h-full object-cover" />
              ` : `
                <span class="text-xs text-purple-300/40">ยังไม่ได้ตั้งค่ารูปแบนเนอร์ (ระบบจะแสดงพื้นหลังไล่เฉดสีม่วงชมพู)</span>
              `}
            </div>
            <input type="file" id="input-upload-banner" accept="image/*" class="text-xs text-purple-200 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gradient-to-r file:from-pink-500 file:to-purple-600 file:text-white hover:file:opacity-90 cursor-pointer" />
          </div>
        </div>

        <!-- School Names Config Form -->
        <form id="form-branding-names" class="glass-panel p-4 sm:p-6 rounded-3xl border border-pink-500/20 space-y-4">
          <h3 class="text-sm font-bold text-pink-300 flex items-center gap-2">
            <i data-lucide="type" class="w-4 h-4"></i>
            <span>ชื่อโรงเรียนและคำอธิบาย</span>
          </h3>

          <div>
            <label class="block text-xs font-semibold text-purple-200 mb-1">ชื่อโรงเรียน</label>
            <input type="text" id="cfg-school-name" value="${escapeHtml(config.schoolName)}" class="w-full px-3.5 py-2.5 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-purple-200 mb-1">คำขวัญ / คำอธิบายบริการ</label>
            <input type="text" id="cfg-school-subtitle" value="${escapeHtml(config.schoolSubtitle)}" class="w-full px-3.5 py-2.5 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm" />
          </div>

          <button type="submit" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer">
            บันทึกชื่อโรงเรียน
          </button>
        </form>

      </div>
    `;
  }

  // --- TAB 3: Announcement Marquee ---
  function renderAnnouncementTab(config) {
    return `
      <div class="space-y-6">
        
        <!-- Header -->
        <div class="glass-panel p-4 sm:p-5 rounded-3xl border border-pink-500/20">
          <h2 class="text-base sm:text-lg font-bold text-purple-100 flex items-center gap-2">
            <i data-lucide="bell" class="w-5 h-5 text-pink-400"></i>
            <span>ข้อความประกาศด่วน (Announcement Banner)</span>
          </h2>
          <p class="text-xs text-purple-300/70 mt-0.5">
            เปิด-ปิด และกำหนดข้อความแจ้งเตือนสำคัญที่จะแสดงผลบนแถบด้านบนสุดของ Portal
          </p>
        </div>

        <form id="form-announcement" class="glass-panel p-4 sm:p-6 rounded-3xl border border-pink-500/20 space-y-5">
          <div class="flex items-center justify-between pb-4 border-b border-pink-500/15">
            <div>
              <h4 class="text-sm font-bold text-purple-100">เปิดใช้งานแถบประกาศด่วน</h4>
              <p class="text-xs text-purple-300/60">แสดงแถบวิ่งตัวอักษรด้านบนสุดของหน้าเว็บ</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="cfg-announcement-enabled" ${config.announcementEnabled ? 'checked' : ''} class="sr-only peer" />
              <div class="w-11 h-6 bg-purple-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          <div>
            <label class="block text-xs font-semibold text-purple-200 mb-1.5">ข้อความประกาศ</label>
            <textarea id="cfg-announcement-text" rows="4" class="w-full px-3.5 py-2.5 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm focus:border-pink-500">${escapeHtml(config.announcementText)}</textarea>
          </div>

          <button type="submit" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer">
            บันทึกการตั้งค่าประกาศ
          </button>
        </form>

      </div>
    `;
  }

  // --- TAB 4: Settings & PIN ---
  function renderSettingsTab() {
    const currentGasUrl = localStorage.getItem('rru_gas_url') || CONFIG.GAS_API_URL;

    return `
      <div class="space-y-6">
        
        <!-- Header -->
        <div class="glass-panel p-4 sm:p-5 rounded-3xl border border-pink-500/20">
          <h2 class="text-base sm:text-lg font-bold text-purple-100 flex items-center gap-2">
            <i data-lucide="settings" class="w-5 h-5 text-pink-400"></i>
            <span>การเชื่อมต่อระบบและรหัสผ่าน (Settings & Security)</span>
          </h2>
          <p class="text-xs text-purple-300/70 mt-0.5">
            เปลี่ยนรหัสผ่าน PIN สำหรับแอดมิน และกำหนด Web App Endpoint URL
          </p>
        </div>

        <!-- Change PIN -->
        <form id="form-change-pin" class="glass-panel p-4 sm:p-6 rounded-3xl border border-pink-500/20 space-y-4">
          <h3 class="text-sm font-bold text-pink-300 flex items-center gap-2">
            <i data-lucide="key-round" class="w-4 h-4"></i>
            <span>เปลี่ยนรหัสผ่าน PIN แอดมิน</span>
          </h3>

          <div>
            <label class="block text-xs font-semibold text-purple-200 mb-1">รหัส PIN ใหม่ (อย่างน้อย 4 ตัวอักษร)</label>
            <input type="password" id="cfg-new-pin" required minlength="4" placeholder="กรอกรหัสใหม่ เช่น 5678" class="w-full px-3.5 py-2.5 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs sm:text-sm" />
          </div>

          <button type="submit" class="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer">
            เปลี่ยนรหัส PIN
          </button>
        </form>

        <!-- Custom GAS Web App URL -->
        <form id="form-gas-url" class="glass-panel p-4 sm:p-6 rounded-3xl border border-pink-500/20 space-y-4">
          <h3 class="text-sm font-bold text-pink-300 flex items-center gap-2">
            <i data-lucide="cpu" class="w-4 h-4"></i>
            <span>Google Apps Script Web App Deployment URL</span>
          </h3>
          <p class="text-xs text-purple-300/60 leading-relaxed">
            เมื่อ deploy Google Apps Script เป็น Web App ใหม่ สามารถนำ URL ปลายทางมาบันทึกที่นี่เพื่อเชื่อมโยงระบบทันที
          </p>
          <div>
            <input type="url" id="cfg-gas-url-input" value="${escapeHtml(currentGasUrl)}" class="w-full px-3.5 py-2.5 rounded-xl bg-purple-900/40 border border-pink-500/25 text-purple-100 text-xs font-mono" />
          </div>
          <button type="submit" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer">
            บันทึก Endpoint URL
          </button>
        </form>

      </div>
    `;
  }

  // --- Dashboard Event Bindings ---
  function bindDashboardEvents(state) {
    // 1. Mobile Hamburger Toggle
    const hamburgerBtn = container.querySelector('#btn-admin-hamburger');
    const drawer = container.querySelector('#admin-mobile-drawer');
    const drawerBackdrop = container.querySelector('#admin-drawer-backdrop');
    const closeDrawerBtn = container.querySelector('#btn-close-drawer');

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', () => {
        isMobileDrawerOpen = true;
        update();
      });
    }

    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', () => {
        isMobileDrawerOpen = false;
        update();
      });
    }

    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', () => {
        isMobileDrawerOpen = false;
        update();
      });
    }

    // 2. Navigation items (Desktop sidebar & Mobile Drawer)
    const navItems = container.querySelectorAll('.admin-nav-item');
    navItems.forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tabTarget;
        isMobileDrawerOpen = false;
        editingLink = null;
        if (activeTab === 'reports' && reportsList.length === 0) {
          loadReports();
        } else {
          update();
        }
      });
    });

    // 3. Return to Portal Hub
    const exitBtns = [
      container.querySelector('#btn-admin-exit-hub'),
      container.querySelector('#btn-drawer-exit-hub')
    ];
    exitBtns.forEach(btn => {
      if (btn) btn.addEventListener('click', () => store.goToHub());
    });

    // 4. Logout
    const logoutBtns = [
      container.querySelector('#btn-admin-logout'),
      container.querySelector('#btn-drawer-logout')
    ];
    logoutBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          store.setAdmin(false, '');
          showToast('ออกจากระบบผู้ดูแลเรียบร้อยแล้ว', 'info');
          store.goToHub();
        });
      }
    });

    // 5. Theme Toggle in Admin
    const themeBtn = container.querySelector('#btn-admin-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        store.toggleTheme();
      });
    }

    // 6. Delegate Tab Events
    if (activeTab === 'links') {
      bindLinksTabEvents();
    } else if (activeTab === 'reports') {
      bindReportsTabEvents();
    } else if (activeTab === 'analytics') {
      bindAnalyticsTabEvents(state);
    } else if (activeTab === 'branding') {
      bindBrandingTabEvents();
    } else if (activeTab === 'announcement') {
      bindAnnouncementTabEvents();
    } else if (activeTab === 'settings') {
      bindSettingsTabEvents();
    }
  }

  // --- Links Tab Event Handlers ---
  function bindLinksTabEvents() {
    // Toggle Add/Edit form
    const toggleFormBtn = container.querySelector('#btn-toggle-add-form');
    if (toggleFormBtn) {
      toggleFormBtn.addEventListener('click', () => {
        if (editingLink) {
          editingLink = null;
        }
        isAddFormVisible = !isAddFormVisible;
        update();
        if (isAddFormVisible) {
          const formCard = container.querySelector('#admin-link-form-card');
          if (formCard) formCard.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Cancel edit
    const cancelEditBtn = container.querySelector('#btn-cancel-link-edit');
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        editingLink = null;
        update();
      });
    }

    // Icon Upload Trigger & Live Preview
    const triggerUploadBtn = container.querySelector('#btn-trigger-icon-upload');
    const fileInput = container.querySelector('#field-link-icon-file');
    const urlInput = container.querySelector('#field-link-icon-url');
    const previewImg = container.querySelector('#link-icon-preview-img');
    const placeholder = container.querySelector('#link-icon-placeholder');
    const clearBtn = container.querySelector('#btn-clear-link-icon');
    const labelUploadText = container.querySelector('#label-icon-upload-text');

    if (triggerUploadBtn && fileInput) {
      triggerUploadBtn.addEventListener('click', () => {
        fileInput.click();
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        triggerUploadBtn.disabled = true;
        if (labelUploadText) labelUploadText.textContent = 'กำลังย่อขนาดภาพ...';
        showToast(`กำลังเตรียมรูปไอคอน ${file.name}...`, 'info', 4000);

        try {
          // 1. Client-side canvas resize & compression to max 512x512
          const compressedBase64 = await compressImage(file, 512);

          if (labelUploadText) labelUploadText.textContent = 'กำลังส่งขึ้น Drive...';
          const { adminPin } = store.get();

          // 2. Upload to Google Drive via GAS API
          const cleanFileName = 'icon_' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const res = await callGasApi('uploadImage', {
            pin: adminPin,
            base64: compressedBase64,
            fileName: cleanFileName,
            mimeType: 'image/png',
            targetType: 'icon'
          });

          // 3. Set the direct thumbnail URL in the input
          const driveThumbnailUrl = res.url || `https://drive.google.com/thumbnail?id=${res.fileId}&sz=w300`;
          if (urlInput) {
            urlInput.value = driveThumbnailUrl;
          }

          // 4. Update preview
          if (previewImg && placeholder && clearBtn) {
            previewImg.src = driveThumbnailUrl;
            previewImg.classList.remove('hidden');
            placeholder.classList.add('hidden');
            clearBtn.classList.remove('hidden');
          }

          showToast('อัปโหลดไอคอนขึ้น Google Drive สำเร็จเรียบร้อย!', 'success');
        } catch (err) {
          showToast(`อัปโหลดไอคอนไม่สำเร็จ: ${err.message}`, 'error');
        } finally {
          triggerUploadBtn.disabled = false;
          if (labelUploadText) labelUploadText.textContent = '📁 อัปโหลดรูปภาพไอคอน';
          fileInput.value = '';
        }
      });
    }

    // URL input live change preview
    if (urlInput) {
      urlInput.addEventListener('input', (e) => {
        const val = normalizeDriveImage(e.target.value.trim());
        if (previewImg && placeholder && clearBtn) {
          if (val) {
            previewImg.src = val;
            previewImg.classList.remove('hidden');
            placeholder.classList.add('hidden');
            clearBtn.classList.remove('hidden');
          } else {
            previewImg.src = '';
            previewImg.classList.add('hidden');
            placeholder.classList.remove('hidden');
            clearBtn.classList.add('hidden');
          }
        }
      });
    }

    // Clear icon button
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (urlInput) urlInput.value = '';
        if (previewImg) {
          previewImg.src = '';
          previewImg.classList.add('hidden');
        }
        if (placeholder) placeholder.classList.remove('hidden');
        clearBtn.classList.add('hidden');
      });
    }

    // Link Action Form Submit (Add or Update)
    const linkForm = container.querySelector('#admin-link-action-form');
    if (linkForm) {
      linkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const linkId = container.querySelector('#field-link-id').value;
        const rowIndex = container.querySelector('#field-link-row-index').value;
        const group = container.querySelector('#field-link-group').value;
        const role = container.querySelector('#field-link-role').value;
        const systemName = container.querySelector('#field-link-system-name').value.trim();
        const link = container.querySelector('#field-link-target-url').value.trim();
        const rawIconUrl = container.querySelector('#field-link-icon-url').value.trim();
        const iconUrl = normalizeDriveImage(rawIconUrl);
        const status = container.querySelector('#field-link-status')?.value || 'active';
        const priority = parseInt(container.querySelector('#field-link-priority')?.value, 10) || 0;

        const submitBtn = container.querySelector('#btn-save-link-action');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="animate-spin mr-1">◌</span> กำลังบันทึกข้อมูล...';

        const { adminPin, links } = store.get();
        const isEditing = Boolean(linkId || rowIndex);
        const action = isEditing ? 'updateLink' : 'addLink';

        try {
          const res = await callGasApi(action, {
            pin: adminPin,
            id: linkId || undefined,
            rowIndex: rowIndex || undefined,
            group,
            role,
            systemName,
            link,
            iconUrl,
            status,
            priority
          });

          // Sync state locally
          if (isEditing) {
            const idx = links.findIndex(l => (linkId && l.id === linkId) || (rowIndex && String(l.rowIndex) === String(rowIndex)));
            if (idx !== -1) {
              links[idx] = { 
                ...links[idx], 
                group, 
                role, 
                systemName, 
                link, 
                iconUrl, 
                status, 
                priority,
                id: res.id || links[idx].id || linkId 
              };
            }
          } else {
            const newId = res.id || ('rru_' + Date.now().toString(36));
            links.push({
              id: newId,
              rowIndex: links.length + 2,
              group, role, systemName, link, iconUrl, status, priority, clicks: 0
            });
          }
          store.set({ links: [...links] });

          showToast(isEditing ? 'แก้ไขระบบงานสำเร็จเรียบร้อย' : 'เพิ่มระบบงานใหม่เข้าสู่ Sheet สำเร็จ', 'success');
          editingLink = null;
          isAddFormVisible = false;
          update();
        } catch (err) {
          showToast(`บันทึกข้อมูลไม่สำเร็จ: ${err.message}`, 'error');
        } finally {
          submitBtn.disabled = false;
        }
      });
    }

    // Search filter input
    const searchInput = container.querySelector('#admin-link-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        linkSearchQuery = e.target.value;
        update();
      });
    }

    const searchClear = container.querySelector('#admin-link-search-clear');
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        linkSearchQuery = '';
        update();
      });
    }

    // Dept filter select
    const deptSelect = container.querySelector('#admin-filter-dept');
    if (deptSelect) {
      deptSelect.addEventListener('change', (e) => {
        linkDeptFilter = e.target.value;
        update();
      });
    }

    // Role filter select
    const roleSelect = container.querySelector('#admin-filter-role');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        linkRoleFilter = e.target.value;
        update();
      });
    }

    // Edit Link buttons
    const editButtons = container.querySelectorAll('.btn-action-edit');
    editButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const rowIndex = btn.dataset.rowIndex;
        const { links } = store.get();
        editingLink = links.find(l => (id && l.id === id) || (rowIndex && String(l.rowIndex) === String(rowIndex))) || null;
        isAddFormVisible = true;
        update();
        const formCard = container.querySelector('#admin-link-form-card');
        if (formCard) formCard.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Toggle Status buttons (Active <-> Maintenance)
    const toggleStatusButtons = container.querySelectorAll('.btn-action-toggle-status');
    toggleStatusButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const rowIndex = btn.dataset.rowIndex;
        const currentStatus = btn.dataset.currentStatus || 'active';
        const nextStatus = (currentStatus === 'maintenance') ? 'active' : 'maintenance';

        btn.disabled = true;
        btn.innerHTML = '<span class="animate-spin text-xs">◌</span>';

        const { adminPin, links } = store.get();
        try {
          await callGasApi('toggleLinkStatus', {
            pin: adminPin,
            id: id || undefined,
            rowIndex: rowIndex || undefined,
            status: nextStatus
          });

          // Sync state locally
          const idx = links.findIndex(l => (id && l.id === id) || (rowIndex && String(l.rowIndex) === String(rowIndex)));
          if (idx !== -1) {
            links[idx] = { ...links[idx], status: nextStatus };
            store.set({ links: [...links] });
          }

          showToast(`สลับสถานะเป็น "${nextStatus === 'maintenance' ? 'ปิดปรับปรุงชั่วคราว' : 'พร้อมใช้งาน'}" สำเร็จ`, 'success');
          update();
        } catch (err) {
          showToast(`สลับสถานะไม่สำเร็จ: ${err.message}`, 'error');
          update();
        }
      });
    });

    // Delete Link buttons
    const deleteButtons = container.querySelectorAll('.btn-action-delete');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const rowIndex = btn.dataset.rowIndex;
        const systemName = btn.dataset.systemName;

        if (confirm(`คุณต้องการลบ "${systemName}" ออกจากระบบและ Google Sheet ใช่หรือไม่?`)) {
          btn.disabled = true;
          btn.innerHTML = '<span class="animate-spin">◌</span>';

          const { adminPin, links } = store.get();
          try {
            await callGasApi('deleteLink', { pin: adminPin, id: id || undefined, rowIndex: rowIndex || undefined });
            const nextLinks = links.filter(l => (id ? l.id !== id : String(l.rowIndex) !== String(rowIndex)));
            store.set({ links: nextLinks });
            showToast(`ลบ "${systemName}" สำเร็จเรียบร้อยแล้ว`, 'success');
            if (editingLink && ((id && editingLink.id === id) || (rowIndex && String(editingLink.rowIndex) === String(rowIndex)))) {
              editingLink = null;
            }
            update();
          } catch (err) {
            showToast(`ลบไม่สำเร็จ: ${err.message}`, 'error');
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="trash-2" class="w-3.5 h-3.5"></i> ลบ';
            refreshIcons(btn);
          }
        }
      });
    });
  }

  // --- Reports Tab Event Handlers ---
  function bindReportsTabEvents() {
    const refreshBtn = container.querySelector('#btn-refresh-reports');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        loadReports();
      });
    }

    const resolveButtons = container.querySelectorAll('.btn-resolve-report');
    resolveButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const reportId = btn.dataset.reportId;
        const rowIndex = btn.dataset.rowIndex;
        btn.disabled = true;
        btn.innerHTML = '<span class="animate-spin text-xs">◌</span>';

        const { adminPin } = store.get();
        try {
          await callGasApi('resolveReport', {
            pin: adminPin,
            reportId,
            rowIndex,
            actionType: 'resolve'
          });

          const rep = reportsList.find(r => r.reportId === reportId);
          if (rep) rep.status = 'resolved';

          showToast('ทำเครื่องหมายว่าแก้ไขแล้วเรียบร้อย', 'success');
          update();
        } catch (err) {
          showToast(`ทำรายการไม่สำเร็จ: ${err.message}`, 'error');
          btn.disabled = false;
        }
      });
    });

    const deleteButtons = container.querySelectorAll('.btn-delete-report');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const reportId = btn.dataset.reportId;
        const rowIndex = btn.dataset.rowIndex;

        if (confirm('คุณต้องการลบรายงานนี้ออกจากระบบใช่หรือไม่?')) {
          btn.disabled = true;
          btn.innerHTML = '<span class="animate-spin text-xs">◌</span>';

          const { adminPin } = store.get();
          try {
            await callGasApi('resolveReport', {
              pin: adminPin,
              reportId,
              rowIndex,
              actionType: 'delete'
            });

            reportsList = reportsList.filter(r => r.reportId !== reportId);
            showToast('ลบรายงานปัญหาสำเร็จ', 'success');
            update();
          } catch (err) {
            showToast(`ลบไม่สำเร็จ: ${err.message}`, 'error');
            btn.disabled = false;
          }
        }
      });
    });
  }

  // --- Analytics & Backup Tab Event Handlers ---
  function bindAnalyticsTabEvents(state) {
    // 1. Export JSON Backup
    const exportBtn = container.querySelector('#btn-export-backup');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        try {
          const { links, config } = store.get();
          const backupPayload = {
            exportDate: new Date().toISOString(),
            portalVersion: '2.0.0',
            school: config.schoolName || 'โรงเรียนรัฐราษฎร์อุปถัมภ์',
            config: { ...config },
            links: links.map(l => ({
              id: l.id,
              role: l.role,
              group: l.group,
              systemName: l.systemName,
              link: l.link,
              iconUrl: l.rawIconUrl || l.iconUrl,
              status: l.status || 'active',
              clicks: parseInt(l.clicks, 10) || 0,
              priority: parseInt(l.priority, 10) || 0
            }))
          };

          const jsonStr = JSON.stringify(backupPayload, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const dateStr = new Date().toISOString().slice(0, 10);
          a.href = url;
          a.download = `rru-portal-backup-${dateStr}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          showToast('ดาวน์โหลดไฟล์สำรองข้อมูลสำเร็จเรียบร้อย 💾', 'success');
        } catch (err) {
          showToast(`ดาวน์โหลดข้อมูลสำรองล้มเหลว: ${err.message}`, 'error');
        }
      });
    }

    // 2. Restore JSON Backup
    const triggerRestoreBtn = container.querySelector('#btn-trigger-restore-backup');
    const restoreFileInput = container.querySelector('#input-restore-backup-file');
    const labelRestoreText = container.querySelector('#label-restore-backup-text');

    if (triggerRestoreBtn && restoreFileInput) {
      triggerRestoreBtn.addEventListener('click', () => {
        restoreFileInput.click();
      });

      restoreFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const rawContent = event.target.result;
            const backupData = JSON.parse(rawContent);

            if (!backupData || !Array.isArray(backupData.links)) {
              throw new Error('โครงสร้างไฟล์ไม่ถูกต้อง (ต้องมีรายการ links เป็น Array)');
            }

            const linkCount = backupData.links.length;
            const confirmMsg = `ยืนยันการกู้คืนข้อมูลสำรองหรือไม่?\n\n• ระบบงานที่จะถูกกู้คืน: ${linkCount} รายการ\n• ข้อมูลลิงก์ปัจจุบันใน Google Sheets จะถูกแทนที่ด้วยข้อมูลจากไฟล์สำรองนี้\n\nกด "ตกลง (OK)" เพื่อดำเนินการต่อ`;
            
            if (!confirm(confirmMsg)) {
              restoreFileInput.value = '';
              return;
            }

            triggerRestoreBtn.disabled = true;
            if (labelRestoreText) labelRestoreText.textContent = 'กำลังกู้คืนข้อมูลขึ้น Google Sheets...';
            showToast('กำลังกู้คืนข้อมูลไปยัง Google Sheets...', 'info', 10000);

            const { adminPin } = store.get();
            const res = await callGasApi('restoreBackup', {
              pin: adminPin,
              backupData: backupData
            });

            // Update store state with restored links and config
            const restoredLinks = backupData.links.map((item, idx) => ({
              id: item.id || ('rru_' + Date.now().toString(36) + '_' + (idx + 1)),
              rowIndex: idx + 2,
              role: item.role || 'all',
              group: item.group || 'กลุ่มบริหารทั่วไป',
              systemName: item.systemName || '',
              link: item.link || '#',
              iconUrl: normalizeDriveImage(item.iconUrl || item.rawIconUrl || ''),
              rawIconUrl: item.iconUrl || item.rawIconUrl || '',
              status: item.status || 'active',
              clicks: parseInt(item.clicks, 10) || 0,
              priority: parseInt(item.priority, 10) || 0
            }));

            const nextConfig = backupData.config ? { ...store.get().config, ...backupData.config } : store.get().config;

            store.set({ links: restoredLinks, config: nextConfig });
            showToast(res.message || `กู้คืนข้อมูลสำรองสำเร็จ (${linkCount} ระบบงาน)`, 'success');
            update();
          } catch (err) {
            showToast(`กู้คืนข้อมูลสำรองไม่สำเร็จ: ${err.message}`, 'error');
          } finally {
            triggerRestoreBtn.disabled = false;
            if (labelRestoreText) labelRestoreText.textContent = 'เลือกไฟล์ JSON เพื่อกู้คืน';
            restoreFileInput.value = '';
          }
        };
        reader.readAsText(file);
      });
    }
  }

  // --- Branding Tab Event Handlers ---
  function bindBrandingTabEvents() {
    const logoFile = container.querySelector('#input-upload-logo');
    if (logoFile) {
      logoFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await handleImageUpload(file, 'logo');
      });
    }

    const bannerFile = container.querySelector('#input-upload-banner');
    if (bannerFile) {
      bannerFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await handleImageUpload(file, 'banner');
      });
    }

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
          showToast('บันทึกชื่อโรงเรียนสำเร็จเรียบร้อย', 'success');
        } catch (err) {
          showToast(`บันทึกไม่สำเร็จ: ${err.message}`, 'error');
        }
      });
    }
  }

  // --- Announcement Tab Event Handlers ---
  function bindAnnouncementTabEvents() {
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
  }

  // --- Settings Tab Event Handlers ---
  function bindSettingsTabEvents() {
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

  // --- Image File Upload to Drive ---
  async function handleImageUpload(file, targetType) {
    const { adminPin, config } = store.get();
    showToast(`กำลังอัปโหลด ${file.name} ไปยัง Google Drive...`, 'info', 7000);

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
        update();
      } catch (err) {
        showToast(`อัปโหลดล้มเหลว: ${err.message}`, 'error');
      }
    };
    reader.readAsDataURL(file);
  }

  // Listen to open events from external buttons
  document.addEventListener('open-admin-modal', () => {
    store.goToAdmin();
  });

  document.addEventListener('admin-edit-link', (e) => {
    const { id, rowIndex } = e.detail;
    const { links } = store.get();
    editingLink = links.find(l => (id && l.id === id) || (rowIndex && String(l.rowIndex) === String(rowIndex))) || null;
    activeTab = 'links';
    isAddFormVisible = true;
    store.goToAdmin();
  });

  document.addEventListener('admin-delete-link', async (e) => {
    const { id, rowIndex, systemName } = e.detail;
    if (confirm(`คุณต้องการลบ "${systemName}" ออกจากระบบและ Google Sheet ใช่หรือไม่?`)) {
      const { adminPin, links } = store.get();
      try {
        await callGasApi('deleteLink', { pin: adminPin, id: id || undefined, rowIndex: rowIndex || undefined });
        const nextLinks = links.filter(l => (id ? l.id !== id : String(l.rowIndex) !== String(rowIndex)));
        store.set({ links: nextLinks });
        showToast(`ลบ "${systemName}" สำเร็จเรียบร้อยแล้ว`, 'success');
      } catch (err) {
        showToast(`ลบไม่สำเร็จ: ${err.message}`, 'error');
      }
    }
  });

  // Re-render on state changes
  store.subscribe(update);
  update();
}
