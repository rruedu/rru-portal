/**
 * RRU School Portal - Department Cards Grid Component
 */

import { store } from '../state.js';
import { CONFIG } from '../config.js';
import { escapeHtml, refreshIcons } from '../utils.js';

export function renderDepartmentGrid(container) {
  if (!container) return;

  function update() {
    const { links, activeRole, activeDepartment, searchQuery, isAdmin } = store.get();

    // Filter links based on Role and Search Query
    const query = (searchQuery || '').toLowerCase();

    const filteredLinks = links.filter(item => {
      // Role filter
      const matchRole = activeRole === 'all' || item.role === 'all' || item.role === activeRole;
      if (!matchRole) return false;

      // Search filter
      if (query) {
        const inName = (item.systemName || '').toLowerCase().includes(query);
        const inGroup = (item.group || '').toLowerCase().includes(query);
        return inName || inGroup;
      }
      return true;
    });

    // Check which departments to show
    let departmentsToShow = CONFIG.DEPARTMENTS;
    if (activeDepartment) {
      departmentsToShow = CONFIG.DEPARTMENTS.filter(d => d.id === activeDepartment);
    }

    // Build department sections
    let totalDisplayed = 0;
    const sectionsMarkup = departmentsToShow.map(dept => {
      const deptLinks = filteredLinks.filter(l => l.group === dept.name);
      totalDisplayed += deptLinks.length;

      // If activeDepartment is null and this department has 0 links during search, we can omit it
      if (query && deptLinks.length === 0) {
        return '';
      }

      return `
        <div class="mb-10 sm:mb-14 scroll-mt-24" id="dept-sec-${dept.id}">
          
          <!-- Department Header -->
          <div class="flex items-center justify-between pb-3 mb-5 border-b border-pink-500/15">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr ${dept.color} flex items-center justify-center text-white shadow-md shadow-pink-500/20">
                <i data-lucide="${dept.icon}" class="w-4 h-4 sm:w-5 sm:h-5"></i>
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold text-purple-100 flex items-center gap-2">
                  ${escapeHtml(dept.name)}
                  <span class="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-normal">
                    ${deptLinks.length}
                  </span>
                </h3>
                <p class="text-xs text-purple-300/60 hidden sm:block">${dept.description}</p>
              </div>
            </div>

            ${activeDepartment === dept.id ? `
              <button 
                id="btn-show-all-depts" 
                class="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-200 bg-pink-950/40 px-3 py-1.5 rounded-lg border border-pink-500/25 transition-all"
              >
                <i data-lucide="layout-grid" class="w-3.5 h-3.5"></i> แสดงทุกฝ่าย
              </button>
            ` : ''}
          </div>

          <!-- Cards Grid -->
          ${deptLinks.length > 0 ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              ${deptLinks.map(link => renderServiceCard(link, dept, isAdmin)).join('')}
            </div>
          ` : `
            <div class="py-8 text-center text-sm text-purple-300/50 bg-purple-950/20 rounded-2xl border border-dashed border-pink-500/20">
              <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-pink-400/40"></i>
              ไม่มีระบบงานที่ตรงกับเงื่อนไขการค้นหาในกลุ่มนี้
            </div>
          `}

        </div>
      `;
    }).join('');

    container.innerHTML = `
      <section id="departments-section" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        ${sectionsMarkup || `
          <div class="py-16 text-center bg-purple-950/20 rounded-3xl border border-dashed border-pink-500/30">
            <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-3 text-pink-400/50"></i>
            <h4 class="text-lg font-bold text-purple-200">ไม่พบระบบงานที่ค้นหา</h4>
            <p class="text-xs sm:text-sm text-purple-300/60 mt-1">ลองเปลี่ยนคำค้นหา หรือสลับบทบาทผู้ใช้งาน</p>
          </div>
        `}
      </section>
    `;

    refreshIcons(container);

    // Event Bindings
    const showAllBtn = container.querySelector('#btn-show-all-depts');
    if (showAllBtn) {
      showAllBtn.addEventListener('click', () => {
        store.setActiveDepartment(null);
      });
    }

    // Admin action buttons on cards
    if (isAdmin) {
      const editBtns = container.querySelectorAll('.btn-admin-edit-link');
      editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const rowIndex = btn.dataset.rowIndex;
          document.dispatchEvent(new CustomEvent('admin-edit-link', { detail: { rowIndex } }));
        });
      });

      const delBtns = container.querySelectorAll('.btn-admin-delete-link');
      delBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const rowIndex = btn.dataset.rowIndex;
          const systemName = btn.dataset.systemName;
          document.dispatchEvent(new CustomEvent('admin-delete-link', { detail: { rowIndex, systemName } }));
        });
      });
    }
  }

  function renderServiceCard(link, dept, isAdmin) {
    const roleColors = {
      student: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      parent: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      teacher: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      all: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    };

    const roleLabels = {
      student: 'นักเรียน',
      parent: 'ผู้ปกครอง',
      teacher: 'คุณครู',
      all: 'ทุกคน'
    };

    const roleBadgeClass = roleColors[link.role] || roleColors.all;
    const roleLabel = roleLabels[link.role] || 'ทั่วไป';

    return `
      <a 
        href="${escapeHtml(link.link)}" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="service-card glass-panel group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl block text-left"
      >
        <!-- Top bar of card -->
        <div class="flex items-start justify-between gap-3 mb-3">
          <!-- Icon -->
          <div class="w-12 h-12 rounded-xl overflow-hidden p-1 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            ${link.iconUrl ? `
              <img 
                src="${escapeHtml(link.iconUrl)}" 
                alt="${escapeHtml(link.systemName)}" 
                class="w-full h-full object-contain rounded-lg"
                onerror="this.onerror=null; this.parentElement.innerHTML='<i data-lucide=\\'layers\\' class=\\'w-6 h-6 text-pink-400\\'></i>'; window.lucide && window.lucide.createIcons();"
              />
            ` : `
              <i data-lucide="${dept.icon}" class="w-6 h-6 text-pink-400"></i>
            `}
          </div>

          <!-- Role Badge -->
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] px-2 py-0.5 rounded-full border font-medium ${roleBadgeClass}">
              ${roleLabel}
            </span>
            <div class="w-6 h-6 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400/70 group-hover:text-pink-300 group-hover:translate-x-0.5 transition-all">
              <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
            </div>
          </div>
        </div>

        <!-- System Title -->
        <div class="mt-1 flex-1">
          <h4 class="text-sm sm:text-base font-bold text-purple-100 group-hover:text-pink-300 transition-colors line-clamp-2">
            ${escapeHtml(link.systemName)}
          </h4>
          <span class="text-[11px] text-purple-300/50 mt-1 block truncate">
            ${escapeHtml(dept.name)}
          </span>
        </div>

        <!-- Admin Quick Action Toolbar -->
        ${isAdmin ? `
          <div class="mt-3 pt-2.5 border-t border-pink-500/15 flex items-center justify-end gap-1.5" onclick="event.preventDefault(); event.stopPropagation();">
            <button 
              data-row-index="${link.rowIndex}" 
              class="btn-admin-edit-link p-1.5 rounded-lg bg-purple-900/40 hover:bg-pink-600 text-purple-200 hover:text-white transition-all text-xs" 
              title="แก้ไขลิงก์นี้"
            >
              <i data-lucide="pencil" class="w-3 h-3"></i>
            </button>
            <button 
              data-row-index="${link.rowIndex}" 
              data-system-name="${escapeHtml(link.systemName)}"
              class="btn-admin-delete-link p-1.5 rounded-lg bg-purple-900/40 hover:bg-rose-600 text-rose-300 hover:text-white transition-all text-xs" 
              title="ลบลิงก์นี้"
            >
              <i data-lucide="trash-2" class="w-3 h-3"></i>
            </button>
          </div>
        ` : ''}
      </a>
    `;
  }

  store.subscribe(update);
  update();
}
