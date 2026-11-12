/**
 * RRU School Portal - Focused Department & Search Results Cards View
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
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 view-enter">
        
        <!-- Header Banner with Back Button -->
        <div class="glass-panel p-4 sm:p-6 rounded-3xl mb-6 sm:mb-8 border border-pink-500/20 relative overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div class="flex items-center gap-3 sm:gap-4">
              <!-- Back to Hub Button -->
              <button 
                id="btn-back-to-hub" 
                class="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-pink-500/15 hover:bg-pink-500/30 text-pink-300 hover:text-white border border-pink-500/30 transition-all text-xs sm:text-sm font-semibold flex-shrink-0 group"
                title="ย้อนกลับไปหน้าวงโคจรหลัก"
              >
                <i data-lucide="chevron-left" class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"></i>
                <span>กลับหน้าหลัก</span>
              </button>

              <div class="min-w-0">
                ${targetDept ? `
                  <div class="flex items-center gap-2">
                    <span class="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r ${targetDept.color} text-white font-medium">
                      ${targetDept.shortName}
                    </span>
                    <span class="text-xs text-purple-300/60 font-mono">${filteredLinks.length} บริการ</span>
                  </div>
                  <h3 class="text-lg sm:text-2xl font-bold text-purple-100 truncate mt-1">
                    ${escapeHtml(targetDept.name)}
                  </h3>
                  <p class="text-xs text-purple-300/70 hidden sm:block mt-0.5">
                    ${targetDept.description}
                  </p>
                ` : `
                  <div class="text-xs text-pink-400 font-medium">ผลการค้นหาสำหรับ</div>
                  <h3 class="text-lg sm:text-2xl font-bold text-purple-100 truncate mt-0.5">
                    "${escapeHtml(searchQuery)}"
                  </h3>
                  <p class="text-xs text-purple-300/70">พบ ${filteredLinks.length} ระบบงานที่ตรงกับคำค้นหา</p>
                `}
              </div>
            </div>

            <!-- Role Indicator -->
            <div class="flex items-center gap-2 self-start sm:self-auto text-xs text-purple-300/70 bg-purple-950/40 px-3 py-1.5 rounded-xl border border-pink-500/15">
              <i data-lucide="filter" class="w-3.5 h-3.5 text-pink-400"></i>
              <span>บทบาท: <b class="text-purple-100">${CONFIG.ROLES.find(r => r.id === activeRole)?.label || 'ทั้งหมด'}</b></span>
            </div>

          </div>
        </div>

        <!-- Cards Grid -->
        ${filteredLinks.length > 0 ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            ${filteredLinks.map(link => renderServiceCard(link, targetDept, isAdmin)).join('')}
          </div>
        ` : `
          <div class="py-16 text-center bg-purple-950/20 rounded-3xl border border-dashed border-pink-500/25">
            <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-3 text-pink-400/50"></i>
            <h4 class="text-base sm:text-lg font-bold text-purple-200">ไม่พบระบบงานในบทบาทหรือเงื่อนไขนี้</h4>
            <p class="text-xs sm:text-sm text-purple-300/60 mt-1 max-w-sm mx-auto">
              ลองสลับปุ่มบทบาท (นักเรียน / ผู้ปกครอง / ครู) ด้านบน หรือกดกลับหน้าหลัก
            </p>
            <button id="btn-back-to-hub-empty" class="mt-4 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold inline-flex items-center gap-1.5">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> กลับหน้าวงโคจรหลัก
            </button>
          </div>
        `}

      </section>
    `;

    refreshIcons(container);

    // Event Bindings
    const backBtn = container.querySelector('#btn-back-to-hub');
    if (backBtn) {
      backBtn.addEventListener('click', () => store.goToHub());
    }

    const backBtnEmpty = container.querySelector('#btn-back-to-hub-empty');
    if (backBtnEmpty) {
      backBtnEmpty.addEventListener('click', () => store.goToHub());
    }

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
          <div class="w-12 h-12 rounded-xl overflow-hidden p-1 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            ${link.iconUrl ? `
              <img 
                src="${escapeHtml(link.iconUrl)}" 
                alt="${escapeHtml(link.systemName)}" 
                class="w-full h-full object-contain rounded-lg"
                onerror="this.onerror=null; this.parentElement.innerHTML='<i data-lucide=\\'layers\\' class=\\'w-6 h-6 text-pink-400\\'></i>'; window.lucide && window.lucide.createIcons();"
              />
            ` : `
              <i data-lucide="${dept?.icon || 'layers'}" class="w-6 h-6 text-pink-400"></i>
            `}
          </div>

          <div class="flex items-center gap-1.5">
            <span class="text-[10px] px-2 py-0.5 rounded-full border font-medium ${roleBadgeClass}">
              ${roleLabel}
            </span>
            <div class="w-6 h-6 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400/70 group-hover:text-pink-300 group-hover:translate-x-0.5 transition-all">
              <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
            </div>
          </div>
        </div>

        <div class="mt-1 flex-1">
          <h4 class="text-sm sm:text-base font-bold text-purple-100 group-hover:text-pink-300 transition-colors line-clamp-2">
            ${escapeHtml(link.systemName)}
          </h4>
          <span class="text-[11px] text-purple-300/50 mt-1 block truncate">
            ${escapeHtml(link.group)}
          </span>
        </div>

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
