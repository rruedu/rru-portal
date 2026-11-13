/**
 * RRU School Portal - Navbar & Sticky Control Bar Component
 * Mobile-first 2-row spacious layout
 */

import { store } from '../state.js';
import { CONFIG } from '../config.js';
import { escapeHtml, refreshIcons, debounce } from '../utils.js';

export function renderNavbar(container) {
  if (!container) return;

  function update() {
    const state = store.get();
    const { config, activeRole, theme, isAdmin, searchQuery, currentView, activeDepartment, favorites = [] } = state;

    // In admin view, hide the public navbar so the dedicated admin header takes over
    if (currentView === 'admin') {
      container.classList.add('hidden');
      container.innerHTML = '';
      return;
    }

    container.classList.remove('hidden');

    const isSubView = currentView === 'department' || currentView === 'search';

    container.innerHTML = `
      <header class="sticky top-0 z-40 w-full backdrop-blur-xl bg-opacity-90 border-b border-pink-500/15 transition-all duration-300" style="background-color: var(--bg-card);">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 space-y-2">
          
          <!-- Row 1: Brand & Actions -->
          <div class="flex items-center justify-between gap-2">
            
            <!-- Left: Brand / Quick Back -->
            <div class="flex items-center gap-2 flex-shrink-0">
              ${isSubView ? `
                <button 
                  id="nav-back-hub-btn" 
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="กลับสู่หน้าวงโคจรหลัก"
                >
                  <i data-lucide="arrow-left" class="w-4 h-4"></i>
                  <i data-lucide="home" class="w-4 h-4"></i>
                  <span>หน้าหลัก</span>
                </button>
              ` : `
                <div class="flex items-center gap-2 cursor-pointer group" id="nav-brand">
                  <div class="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-pink-500 to-purple-500 shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                    <img 
                      src="${config.logoUrl || CONFIG.SCHOOL.logoDefault}" 
                      alt="${escapeHtml(config.schoolName)}" 
                      class="w-full h-full object-cover rounded-full bg-slate-900"
                      onerror="this.src='${CONFIG.SCHOOL.logoDefault}'"
                    />
                  </div>
                  <div class="leading-tight">
                    <h1 class="text-sm sm:text-base md:text-lg font-extrabold bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
                      ${escapeHtml(config.schoolName)}
                    </h1>
                    <p class="text-[10px] sm:text-xs text-purple-300/80 font-medium">
                      สพม.ราชบุรี
                    </p>
                  </div>
                </div>
              `}
            </div>

            <!-- Right Controls: Install App, Theme Toggle, Admin Login -->
            <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              
              <!-- Install App Button -->
              <button 
                id="btn-install-app" 
                class="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600 hover:to-purple-600 text-pink-200 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="ติดตั้งแอปลงหน้าจอมือถือ (iOS / Android)"
              >
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span class="hidden sm:inline">ติดตั้งแอป</span>
              </button>

              <!-- Theme Toggle -->
              <button 
                id="btn-toggle-theme" 
                class="p-2 sm:p-2 rounded-xl border border-pink-500/30 hover:border-pink-500 bg-purple-900/30 hover:bg-pink-600/30 text-pink-300 hover:text-pink-100 transition-all cursor-pointer"
                title="เปลี่ยนโหมดสี (Dark / Light)"
              >
                <i data-lucide="${theme === 'dark' ? 'sun' : 'moon'}" class="w-4 h-4"></i>
              </button>

              <!-- Admin Control Button -->
              <button 
                id="btn-open-admin" 
                class="flex items-center gap-1 p-2 sm:px-3 sm:py-2 rounded-xl border ${isAdmin ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400' : 'border-pink-500/30 bg-purple-950/40 text-pink-300 hover:border-pink-500'} text-xs font-semibold transition-all shadow-sm cursor-pointer"
                title="${isAdmin ? 'เปิดเมนูผู้ดูแลระบบ' : 'เข้าสู่ระบบแอดมิน'}"
              >
                <i data-lucide="${isAdmin ? 'shield-check' : 'lock'}" class="w-4 h-4"></i>
                <span class="hidden sm:inline">${isAdmin ? 'จัดการระบบ' : 'แอดมิน'}</span>
              </button>
            </div>

          </div>

          <!-- Row 2: Full-Width Search & Role Filter Pills -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-pink-500/10">
            
            <!-- Search Bar (Full Width on mobile, compact on desktop) -->
            <div class="relative w-full sm:max-w-xs md:max-w-sm">
              <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pink-400/70"></i>
              <input 
                type="text" 
                id="nav-search-input" 
                value="${escapeHtml(searchQuery)}"
                placeholder="ค้นหาระบบงานหรือบริการ..." 
                class="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-purple-950/30 border border-pink-500/25 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 placeholder-purple-300/50 text-purple-100 transition-all"
              />
              ${searchQuery ? `
                <button id="nav-search-clear" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-300/70 hover:text-pink-300 p-0.5">
                  <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
              ` : ''}
            </div>

            <!-- Role Filter Pills -->
            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              ${CONFIG.ROLES.map(role => {
                const isActive = activeRole === role.id;
                const isFavRole = role.id === 'favorites';
                const countBadge = isFavRole && favorites.length > 0 
                  ? `<span class="ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/25 text-white' : 'bg-amber-500/20 text-amber-300 font-mono font-bold'}">${favorites.length}</span>` 
                  : '';
                
                let activeClass = 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30 border border-pink-400 scale-105';
                if (isFavRole && isActive) {
                  activeClass = 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-md shadow-amber-500/30 border border-amber-300 scale-105';
                }

                return `
                  <button 
                    data-role-id="${role.id}" 
                    class="role-pill-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 whitespace-nowrap cursor-pointer ${
                      isActive 
                        ? activeClass 
                        : isFavRole && favorites.length > 0
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300/90 border border-amber-500/30'
                          : 'bg-purple-950/20 hover:bg-purple-900/40 text-purple-300/80 border border-pink-500/15 hover:border-pink-500/30'
                    }"
                  >
                    <i data-lucide="${role.icon}" class="w-3.5 h-3.5 ${isFavRole ? (isActive ? 'text-amber-200 fill-amber-200' : 'text-amber-400') : ''}"></i>
                    <span>${role.label}</span>
                    ${countBadge}
                  </button>
                `;
              }).join('')}
            </div>

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
        store.goToAdmin();
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
