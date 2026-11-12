/**
 * RRU School Portal - Navbar & Sticky Control Bar Component
 */

import { store } from '../state.js';
import { CONFIG } from '../config.js';
import { escapeHtml, refreshIcons, debounce } from '../utils.js';

export function renderNavbar(container) {
  if (!container) return;

  function update() {
    const state = store.get();
    const { config, activeRole, theme, isAdmin, searchQuery, currentView, activeDepartment } = state;

    const isSubView = currentView === 'department' || currentView === 'search';
    const deptInfo = activeDepartment ? CONFIG.DEPARTMENTS.find(d => d.id === activeDepartment) : null;

    container.innerHTML = `
      <header class="sticky top-0 z-40 w-full backdrop-blur-xl bg-opacity-80 border-b border-pink-500/15 transition-all duration-300" style="background-color: var(--bg-card);">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-3">
            
            <!-- School Brand or Active View Back Button -->
            <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              ${isSubView ? `
                <!-- Quick Return Button in Navbar -->
                <button 
                  id="nav-back-hub-btn" 
                  class="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                  title="กลับสู่หน้าวงโคจรหลัก"
                >
                  <i data-lucide="arrow-left" class="w-4 h-4"></i>
                  <i data-lucide="home" class="w-4 h-4"></i>
                  <span>หน้าหลัก</span>
                </button>
              ` : `
                <!-- Brand Logo & Title -->
                <div class="flex items-center gap-2.5 sm:gap-3 cursor-pointer group" id="nav-brand">
                  <div class="relative w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-pink-500 to-purple-500 shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                    <img 
                      src="${config.logoUrl || CONFIG.SCHOOL.logoDefault}" 
                      alt="${escapeHtml(config.schoolName)}" 
                      class="w-full h-full object-cover rounded-full bg-slate-900"
                      onerror="this.src='${CONFIG.SCHOOL.logoDefault}'"
                    />
                  </div>
                  <div class="leading-tight">
                    <h1 class="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent leading-tight">
                      ${escapeHtml(config.schoolName)}
                    </h1>
                    <p class="text-[10px] sm:text-xs text-purple-300/80 hidden sm:block">
                      ${escapeHtml(config.schoolSubtitle)}
                    </p>
                  </div>
                </div>
              `}
            </div>

            <!-- Instant Search Bar -->
            <div class="flex-1 max-w-[170px] sm:max-w-sm md:max-w-md mx-1 sm:mx-2">
              <div class="relative">
                <i data-lucide="search" class="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pink-400/60"></i>
                <input 
                  type="text" 
                  id="nav-search-input" 
                  value="${escapeHtml(searchQuery)}"
                  placeholder="ค้นหาระบบงาน..." 
                  class="w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm bg-purple-950/30 border border-pink-500/20 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 placeholder-purple-300/40 text-purple-100 transition-all"
                />
                ${searchQuery ? `
                  <button id="nav-search-clear" class="absolute right-2 top-1/2 -translate-y-1/2 text-purple-300/60 hover:text-pink-300 p-0.5">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i>
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Right Controls: Install App, Theme Toggle, Admin Login -->
            <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              
              <!-- Install App Button (PWA Add to Home Screen) -->
              <button 
                id="btn-install-app" 
                class="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600 hover:to-purple-600 text-pink-200 hover:text-white text-xs font-semibold transition-all shadow-sm"
                title="ติดตั้งแอปลงหน้าจอมือถือ (iOS / Android)"
              >
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span class="hidden md:inline">ติดตั้งแอป</span>
              </button>

              <!-- Theme Toggle -->
              <button 
                id="btn-toggle-theme" 
                class="p-2 sm:p-2.5 rounded-xl border border-pink-500/30 hover:border-pink-500 bg-purple-900/30 hover:bg-pink-600/30 text-pink-300 hover:text-pink-100 transition-all cursor-pointer"
                title="เปลี่ยนโหมดสี (Dark / Light)"
              >
                <i data-lucide="${theme === 'dark' ? 'sun' : 'moon'}" class="w-4 h-4"></i>
              </button>

              <!-- Admin Control Button -->
              <button 
                id="btn-open-admin" 
                class="flex items-center gap-1 p-2 sm:px-3 sm:py-2 rounded-xl border ${isAdmin ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400' : 'border-pink-500/30 bg-purple-950/40 text-pink-300 hover:border-pink-500'} text-xs font-medium transition-all shadow-sm cursor-pointer"
                title="${isAdmin ? 'เปิดเมนูผู้ดูแลระบบ' : 'เข้าสู่ระบบแอดมิน'}"
              >
                <i data-lucide="${isAdmin ? 'shield-check' : 'lock'}" class="w-4 h-4"></i>
                <span class="hidden lg:inline">${isAdmin ? 'จัดการระบบ' : 'แอดมิน'}</span>
              </button>
            </div>

          </div>

          <!-- Role Filter Pill Bar -->
          <div class="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 pb-2.5 overflow-x-auto no-scrollbar pt-1">
            <span class="text-xs text-purple-300/60 flex items-center gap-1 mr-1 flex-shrink-0 hidden lg:flex">
              <i data-lucide="filter" class="w-3.5 h-3.5"></i> บทบาท:
            </span>
            ${CONFIG.ROLES.map(role => {
              const isActive = activeRole === role.id;
              return `
                <button 
                  data-role-id="${role.id}" 
                  class="role-pill-btn flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex-shrink-0 whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30 border border-pink-400 scale-105' 
                      : 'bg-purple-950/20 hover:bg-purple-900/40 text-purple-300/80 border border-pink-500/15 hover:border-pink-500/30'
                  }"
                >
                  <i data-lucide="${role.icon}" class="w-3.5 h-3.5"></i>
                  <span>${role.label}</span>
                </button>
              `;
            }).join('')}
          </div>

        </div>
      </header>
    `;

    refreshIcons(container);

    // Event Bindings
    const brand = container.querySelector('#nav-brand');
    if (brand) {
      brand.addEventListener('click', () => {
        store.goToHub();
      });
    }

    const navBackBtn = container.querySelector('#nav-back-hub-btn');
    if (navBackBtn) {
      navBackBtn.addEventListener('click', () => {
        store.goToHub();
      });
    }

    const searchInput = container.querySelector('#nav-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        store.setSearchQuery(e.target.value);
      }, 200));
    }

    const searchClear = container.querySelector('#nav-search-clear');
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        store.setSearchQuery('');
      });
    }

    const installBtn = container.querySelector('#btn-install-app');
    if (installBtn) {
      installBtn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('trigger-pwa-install'));
      });
    }

    const themeBtn = container.querySelector('#btn-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        store.toggleTheme();
      });
    }

    const adminBtn = container.querySelector('#btn-open-admin');
    if (adminBtn) {
      adminBtn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('open-admin-modal'));
      });
    }

    const roleButtons = container.querySelectorAll('.role-pill-btn');
    roleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const roleId = btn.dataset.roleId;
        store.setActiveRole(roleId);
      });
    });
  }

  store.subscribe(update);
  update();
}
