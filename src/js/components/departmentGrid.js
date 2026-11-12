/**
 * RRU School Portal - Focused Department & Search Results Cards View
 * Clean navigation with a single bottom return button
 */

import { store } from '../state.js';
import { CONFIG } from '../config.js';
import { escapeHtml, refreshIcons } from '../utils.js';

export function renderDepartmentGrid(container) {
  if (!container) return;

  function update() {
    const { links, activeRole, activeDepartment, searchQuery, currentView, isAdmin } = store.get();

    // If on home/hub view, hide cards completely
    if (currentView === 'hub') {
      container.classList.add('hidden');
      container.innerHTML = '';
      return;
    }

    container.classList.remove('hidden');

    // Filter links based on Role and Search Query
    const query = (searchQuery || '').toLowerCase();

    let targetDept = null;
    if (currentView === 'department' && activeDepartment) {
      targetDept = CONFIG.DEPARTMENTS.find(d => d.id === activeDepartment) || null;
    }

    const filteredLinks = links.filter(item => {
      // Role filter
      const matchRole = activeRole === 'all' || item.role === 'all' || item.role === activeRole;
      if (!matchRole) return false;

      // Department filter
      if (targetDept && item.group !== targetDept.name) {
        return false;
      }

      // Search query filter
      if (query) {
        const inName = (item.systemName || '').toLowerCase().includes(query);
        const inGroup = (item.group || '').toLowerCase().includes(query);
        return inName || inGroup;
      }

      return true;
    });

    container.innerHTML = `
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 view-enter relative">
        
        <!-- Breadcrumbs & Quick Return Bar -->
        <div class="flex items-center justify-between gap-3 mb-4 text-xs sm:text-sm">
          <nav class="flex items-center gap-2 text-purple-300/70 overflow-x-auto no-scrollbar py-1">
            <button id="breadcrumb-hub" class="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 font-bold cursor-pointer">
              <i data-lucide="home" class="w-4 h-4"></i>
              <span>หน้าหลัก (Hub)</span>
            </button>
            <i data-lucide="chevron-right" class="w-4 h-4 text-purple-400/50"></i>
            <span class="text-purple-100 font-semibold">
              ${targetDept ? escapeHtml(targetDept.name) : `ผลการค้นหา: "${escapeHtml(searchQuery)}"`}
            </span>
          </nav>
        </div>

        <!-- Header Banner with Prominent Back Button -->
        <div class="glass-panel p-4 sm:p-6 rounded-3xl mb-6 sm:mb-8 border border-pink-500/25 relative overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div class="flex items-center gap-3 sm:gap-4">
              <!-- Big Gradient Back Button -->
              <button 
                id="btn-back-to-hub" 
                class="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
                title="ย้อนกลับไปหน้าวงโคจรหลัก"
              >
                <i data-lucide="arrow-left" class="w-4 h-4"></i>
                <i data-lucide="home" class="w-4 h-4"></i>
                <span>กลับหน้าวงโคจร</span>
              </button>

              <div class="min-w-0">
                ${targetDept ? `
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs sm:text-sm px-3 py-1 rounded-full bg-gradient-to-r ${targetDept.color} text-white font-bold shadow-sm">
                      ${targetDept.shortName}
                    </span>
                    <span class="text-xs sm:text-sm text-purple-200 font-mono font-bold">${filteredLinks.length} บริการ</span>
                  </div>
                  <h3 class="text-xl sm:text-2xl font-extrabold text-purple-100 mt-1 leading-snug">
                    ${escapeHtml(targetDept.name)}
                  </h3>
                  <p class="text-xs sm:text-sm text-purple-300/80 hidden sm:block mt-0.5">
                    ${targetDept.description}
                  </p>
                ` : `
                  <div class="text-xs sm:text-sm text-pink-400 font-bold">ผลการค้นหาระบบงาน</div>
                  <h3 class="text-xl sm:text-2xl font-extrabold text-purple-100 mt-0.5 leading-snug">
                    "${escapeHtml(searchQuery)}"
                  </h3>
                  <p class="text-xs sm:text-sm text-purple-300/80">พบ ${filteredLinks.length} ระบบงานที่ตรงกับคำค้นหา</p>
                `}
              </div>
            </div>

            <!-- Role Indicator -->
            <div class="flex items-center gap-2 self-start sm:self-auto text-xs sm:text-sm text-purple-100 bg-purple-950/40 px-3.5 py-2 rounded-xl border border-pink-500/20">
              <i data-lucide="filter" class="w-4 h-4 text-pink-400"></i>
              <span>กำลังแสดง: <b class="text-pink-300 font-bold">${CONFIG.ROLES.find(r => r.id === activeRole)?.label || 'ทั้งหมด'}</b></span>
            </div>

          </div>
        </div>

        <!-- Cards Grid (Full Title, No Truncate) -->
        ${filteredLinks.length > 0 ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            ${filteredLinks.map(link => renderServiceCard(link, targetDept, isAdmin)).join('')}
          </div>

          <!-- Single Clean Bottom Return to Hub Button -->
          <div class="mt-8 pt-6 border-t border-pink-500/15 text-center">
            <button 
              id="btn-bottom-back-hub" 
              class="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-bold transition-all cursor-pointer shadow-lg shadow-pink-500/25 active:scale-95"
            >
              <i data-lucide="home" class="w-4 h-4"></i>
              <span>หน้าหลัก</span>
            </button>
          </div>
        ` : `
          <div class="py-16 text-center bg-purple-950/20 rounded-3xl border border-dashed border-pink-500/25">
            <i data-lucide="inbox" class="w-14 h-14 mx-auto mb-3 text-pink-400/50"></i>
            <h4 class="text-base sm:text-lg font-bold text-purple-200">ไม่พบระบบงานในบทบาทหรือเงื่อนไขนี้</h4>
            <p class="text-xs sm:text-sm text-purple-300/70 mt-1 max-w-sm mx-auto">
              ลองสลับปุ่มบทบาท (นักเรียน / ผู้ปกครอง / ครู) ด้านบน หรือกดกลับหน้าหลัก
            </p>
            <button id="btn-back-to-hub-empty" class="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-lg cursor-pointer">
              <i data-lucide="home" class="w-4 h-4"></i> กลับหน้าวงโคจรหลัก
            </button>
          </div>
        `}

      </section>
    `;

    refreshIcons(container);

    // Event Bindings
    const returnActions = [
      container.querySelector('#btn-back-to-hub'),
      container.querySelector('#breadcrumb-hub'),
      container.querySelector('#btn-bottom-back-hub'),
      container.querySelector('#btn-back-to-hub-empty')
    ];

    returnActions.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => store.goToHub());
      }
    });

    // Admin Card Actions
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
        <div class="flex items-start justify-between gap-3 mb-3">
          <!-- Big Card Icon -->
          <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden p-1.5 bg-gradient-to-tr from-pink-500/25 to-purple-500/25 border border-pink-500/35 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
            ${link.iconUrl ? `
              <img 
                src="${escapeHtml(link.iconUrl)}" 
                alt="${escapeHtml(link.systemName)}" 
                class="w-full h-full object-contain rounded-xl"
                onerror="this.onerror=null; this.parentElement.innerHTML='<i data-lucide=\\'layers\\' class=\\'w-8 h-8 text-pink-400\\'></i>'; window.lucide && window.lucide.createIcons();"
              />
            ` : `
              <i data-lucide="${dept?.icon || 'layers'}" class="w-8 h-8 text-pink-400"></i>
            `}
          </div>

          <div class="flex items-center gap-1.5">
            <span class="text-xs px-2.5 py-1 rounded-full border font-bold ${roleBadgeClass}">
              ${roleLabel}
            </span>
            <div class="w-7 h-7 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-400/80 group-hover:text-pink-300 group-hover:translate-x-0.5 transition-all">
              <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
            </div>
          </div>
        </div>

        <!-- Full Title Without Truncation (No Line Clamp, No Ellipsis) -->
        <div class="mt-2 flex-1">
          <h4 class="text-base sm:text-lg font-bold text-purple-100 group-hover:text-pink-300 transition-colors leading-snug break-words">
            ${escapeHtml(link.systemName)}
          </h4>
          <span class="text-xs text-purple-300/70 mt-1.5 block">
            ${escapeHtml(link.group)}
          </span>
        </div>

        ${isAdmin ? `
          <div class="mt-3 pt-2.5 border-t border-pink-500/15 flex items-center justify-end gap-1.5" onclick="event.preventDefault(); event.stopPropagation();">
            <button 
              data-row-index="${link.rowIndex}" 
              class="btn-admin-edit-link p-1.5 rounded-lg bg-purple-900/40 hover:bg-pink-600 text-purple-200 hover:text-white transition-all text-xs font-semibold" 
              title="แก้ไขลิงก์นี้"
            >
              <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            </button>
            <button 
              data-row-index="${link.rowIndex}" 
              data-system-name="${escapeHtml(link.systemName)}"
              class="btn-admin-delete-link p-1.5 rounded-lg bg-purple-900/40 hover:bg-rose-600 text-rose-300 hover:text-white transition-all text-xs font-semibold" 
              title="ลบลิงก์นี้"
            >
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        ` : ''}
      </a>
    `;
  }

  store.subscribe(update);
  update();
}
