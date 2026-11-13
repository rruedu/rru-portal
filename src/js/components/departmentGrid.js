/**
 * RRU School Portal - Focused Department & Search Results Cards View
 * Includes Favorites System, Status Badges, and Broken Link Reporting
 */

import { store } from '../state.js';
import { CONFIG } from '../config.js';
import { escapeHtml, refreshIcons, formatDisplayUrl, normalizeDriveImage, showToast } from '../utils.js';

export function renderDepartmentGrid(container) {
  if (!container) return;

  function update() {
    const { links, activeRole, activeDepartment, searchQuery, currentView, isAdmin, favorites = [] } = store.get();

    // If on home/hub view or admin view, hide cards completely
    if (currentView === 'hub' || currentView === 'admin') {
      container.classList.add('hidden');
      container.innerHTML = '';
      return;
    }

    container.classList.remove('hidden');

    // Filter links based on Role and Search Query
    const query = (searchQuery || '').toLowerCase();
    const isFavView = activeRole === 'favorites';

    let targetDept = null;
    if (currentView === 'department' && activeDepartment && !isFavView) {
      targetDept = CONFIG.DEPARTMENTS.find(d => d.id === activeDepartment) || null;
    }

    const filteredLinks = links.filter(item => {
      // Role filter
      if (isFavView) {
        if (!favorites.includes(item.id)) return false;
      } else if (activeRole !== 'all') {
        const matchRole = item.role === 'all' || item.role === activeRole;
        if (!matchRole) return false;
      }

      // Department filter (only filter by department when not in favorites view)
      if (targetDept && !isFavView && item.group !== targetDept.name) {
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
              ${isFavView ? '⭐ รายการโปรดของฉัน' : (targetDept ? escapeHtml(targetDept.name) : `ผลการค้นหา: "${escapeHtml(searchQuery)}"`)}
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
                ${isFavView ? `
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs sm:text-sm px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold shadow-sm shadow-amber-500/25 flex items-center gap-1">
                      <i data-lucide="star" class="w-3.5 h-3.5 fill-white"></i>
                      <span>รายการโปรด</span>
                    </span>
                    <span class="text-xs sm:text-sm text-purple-200 font-mono font-bold">${filteredLinks.length} บริการ</span>
                  </div>
                  <h3 class="text-xl sm:text-2xl font-extrabold text-purple-100 mt-1 leading-snug">
                    ระบบงานโปรดของฉัน
                  </h3>
                  <p class="text-xs sm:text-sm text-purple-300/80 hidden sm:block mt-0.5">
                    รวมทุกระบบงานที่คุณกดบันทึกดาวไว้ เพื่อการเปิดใช้งานอย่างสะดวกและรวดเร็ว
                  </p>
                ` : targetDept ? `
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs sm:text-sm px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-sm shadow-pink-500/25">
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

        <!-- Cards Grid (2 Columns on Mobile, Up to 5 on Desktop) -->
        ${filteredLinks.length > 0 ? `
          <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
            ${filteredLinks.map((link, idx) => renderServiceCard(link, targetDept, isAdmin, idx, favorites.includes(link.id))).join('')}
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
        ` : isFavView ? `
          <div class="py-14 text-center glass-panel rounded-3xl border border-dashed border-amber-500/30 max-w-md mx-auto my-6 p-6">
            <div class="w-14 h-14 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/25">
              <i data-lucide="star" class="w-7 h-7"></i>
            </div>
            <h4 class="text-base sm:text-lg font-bold text-purple-100">ยังไม่มีระบบงานโปรด</h4>
            <p class="text-xs sm:text-sm text-purple-300/70 mt-1 leading-relaxed">
              คุณสามารถกดที่ไอคอนรูปดาว <span class="text-amber-400 font-bold">★</span> บนการ์ดระบบงานใดก็ได้ เพื่อปักหมุดเป็นระบบที่คุณใช้งานเป็นประจำ
            </p>
            <button 
              id="btn-browse-all-from-fav" 
              class="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-md shadow-pink-500/30 hover:scale-105 transition-all cursor-pointer"
            >
              <i data-lucide="layout-grid" class="w-4 h-4"></i>
              <span>ดูระบบงานทั้งหมด</span>
            </button>
          </div>
        ` : `
          <div class="py-16 text-center bg-purple-950/20 rounded-3xl border border-dashed border-pink-500/25">
            <i data-lucide="inbox" class="w-14 h-14 mx-auto mb-3 text-pink-400/50"></i>
            <h4 class="text-base sm:text-lg font-bold text-purple-200">ไม่พบระบบงานในบทบาทหรือเงื่อนไขนี้</h4>
            <p class="text-xs sm:text-sm text-purple-300/70 mt-1 max-w-sm mx-auto">
              ลองสลับปุ่มบทบาท (นักเรียน / ผู้ปกครอง / ครู) ด้านบน หรือกดกลับหน้าหลัก
            </p>
          </div>
        `}

      </section>
    `;

    refreshIcons(container);

    // Bind return actions
    const returnActions = [
      container.querySelector('#btn-back-to-hub'),
      container.querySelector('#breadcrumb-hub'),
      container.querySelector('#btn-bottom-back-hub')
    ];

    returnActions.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => store.goToHub());
      }
    });

    // Empty state browse all button
    const btnBrowseAll = container.querySelector('#btn-browse-all-from-fav');
    if (btnBrowseAll) {
      btnBrowseAll.addEventListener('click', () => {
        store.setActiveRole('all');
      });
    }

    // Favorite Toggle Buttons
    const favBtns = container.querySelectorAll('.btn-toggle-favorite');
    favBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const favId = btn.dataset.favId;
        const isNowFav = store.toggleFavorite(favId);
        showToast(isNowFav ? 'บันทึกลงรายการโปรดเรียบร้อยแล้ว ⭐' : 'นำออกจากรายการโปรดแล้ว', 'info');
      });
    });

    // Report Issue Buttons
    const reportBtns = container.querySelectorAll('.btn-card-report');
    reportBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const { reportId, systemName, link } = btn.dataset;
        document.dispatchEvent(new CustomEvent('open-report-modal', {
          detail: { linkId: reportId, systemName, link }
        }));
      });
    });

    // Maintenance Warning on Cards
    const maintCards = container.querySelectorAll('.service-app-card[data-status="maintenance"]');
    maintCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const sysName = card.dataset.systemName || 'ระบบงานนี้';
        if (!confirm(`แจ้งเตือน: "${sysName}" กำลังอยู่ระหว่างปิดปรับปรุงชั่วคราวโดยผู้ดูแลระบบ\n\nคุณยังต้องการเปิดลิงก์ไปยังระบบนี้อยู่หรือไม่?`)) {
          e.preventDefault();
        }
      });
    });

    // Admin Card Actions
    if (isAdmin) {
      const editBtns = container.querySelectorAll('.btn-admin-edit-link');
      editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = btn.dataset.id;
          const rowIndex = btn.dataset.rowIndex;
          document.dispatchEvent(new CustomEvent('admin-edit-link', { detail: { id, rowIndex } }));
        });
      });

      const delBtns = container.querySelectorAll('.btn-admin-delete-link');
      delBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = btn.dataset.id;
          const rowIndex = btn.dataset.rowIndex;
          const systemName = btn.dataset.systemName;
          document.dispatchEvent(new CustomEvent('admin-delete-link', { detail: { id, rowIndex, systemName } }));
        });
      });
    }
  }

  function renderServiceCard(link, dept, isAdmin, index = 0, isFavorite = false) {
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
    const iconUrl = normalizeDriveImage(link.iconUrl || link.icon_url || '');
    const isMaintenance = link.status === 'maintenance';

    return `
      <a 
        href="${escapeHtml(link.link)}" 
        target="_blank" 
        rel="noopener noreferrer" 
        data-status="${isMaintenance ? 'maintenance' : 'active'}"
        data-system-name="${escapeHtml(link.systemName)}"
        class="service-app-card stagger-card glass-panel group relative flex flex-col justify-between p-3 sm:p-5 rounded-2xl sm:rounded-3xl block text-center sm:text-left border ${isMaintenance ? 'border-amber-500/40 bg-amber-950/10' : 'border-pink-500/25 hover:border-pink-500/50'} active:scale-95 active:border-pink-400 active:shadow-pink-500/40 transition-all shadow-md select-none"
        style="animation-delay: ${(index * 0.035).toFixed(2)}s;"
      >
        <!-- Top Row: Role Badge & Actions (Favorite & Report) -->
        <div class="flex items-center justify-between gap-1 w-full mb-1 sm:mb-2">
          <!-- Role Badge -->
          <span class="text-[9px] sm:text-[11px] px-2 py-0.5 rounded-full border font-bold ${roleBadgeClass} truncate max-w-[75px] sm:max-w-none">
            ${roleLabel}
          </span>

          <!-- Quick Action Buttons: Favorite & Report -->
          <div class="flex items-center gap-1 flex-shrink-0" onclick="event.stopPropagation();">
            <!-- Favorite Star Button -->
            <button 
              data-fav-id="${link.id}" 
              class="btn-toggle-favorite p-1 sm:p-1.5 rounded-lg border transition-all cursor-pointer ${
                isFavorite 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' 
                  : 'bg-purple-900/30 text-purple-300/60 border-purple-500/20 hover:text-amber-300 hover:border-amber-500/30'
              }" 
              title="${isFavorite ? 'นำออกจากรายการโปรด' : 'บันทึกลงรายการโปรด'}"
            >
              <i data-lucide="star" class="w-3 h-3 sm:w-3.5 sm:h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}"></i>
            </button>

            <!-- Report Broken Link Button -->
            <button 
              data-report-id="${link.id}" 
              data-system-name="${escapeHtml(link.systemName)}" 
              data-link="${escapeHtml(link.link)}"
              class="btn-card-report p-1 sm:p-1.5 rounded-lg bg-purple-900/30 text-purple-300/50 hover:text-pink-300 border border-purple-500/20 hover:border-pink-500/30 transition-all cursor-pointer"
              title="แจ้งปัญหาระบบงานหรือลิงก์เสีย"
            >
              <i data-lucide="flag" class="w-3 h-3 sm:w-3.5 sm:h-3.5"></i>
            </button>
          </div>
        </div>

        <!-- Center: Big 3D Squircle App Icon (Focal Point) -->
        <div class="my-2 sm:my-3 flex justify-center items-center w-full relative">
          <div class="app-icon-squircle w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 flex items-center justify-center relative overflow-hidden shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform duration-200 ${isMaintenance ? 'opacity-80 grayscale-[20%]' : ''}">
            ${iconUrl ? `
              <img 
                src="${escapeHtml(iconUrl)}" 
                alt="${escapeHtml(link.systemName)}" 
                class="w-full h-full object-contain rounded-xl sm:rounded-2xl"
                onerror="this.onerror=null; this.parentElement.innerHTML='<i data-lucide=\\'layers\\' class=\\'w-8 h-8 sm:w-10 sm:h-10 text-pink-400\\'></i>'; window.lucide && window.lucide.createIcons();"
              />
            ` : `
              <i data-lucide="${dept?.icon || 'layers'}" class="w-8 h-8 sm:w-10 sm:h-10 text-pink-400"></i>
            `}
          </div>

          ${isMaintenance ? `
            <div class="absolute -bottom-1 px-2 py-0.5 rounded-full bg-amber-500 text-purple-950 font-black text-[9px] shadow-md flex items-center gap-0.5">
              <i data-lucide="wrench" class="w-2.5 h-2.5"></i>
              <span>ปิดปรับปรุง</span>
            </div>
          ` : ''}
        </div>

        <!-- Title & Information -->
        <div class="mt-1 flex-1 flex flex-col justify-between">
          <div>
            <h4 class="text-xs sm:text-sm md:text-base font-extrabold text-purple-100 group-hover:text-pink-300 transition-colors leading-snug break-words line-clamp-2 sm:line-clamp-none">
              ${escapeHtml(link.systemName)}
            </h4>
            <span class="text-[10px] sm:text-xs text-purple-300/70 mt-1 block">
              ${escapeHtml(link.group)}
            </span>
          </div>

          <!-- Domain Preview Footer -->
          <div class="mt-2.5 pt-1.5 border-t border-pink-500/15 flex items-center justify-center sm:justify-between text-[10px] sm:text-[11px] font-mono text-purple-300/60 w-full overflow-hidden">
            <span class="truncate text-pink-400/80 font-medium flex items-center gap-1 max-w-full">
              <i data-lucide="link" class="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0"></i>
              <span class="truncate text-[9px] sm:text-[11px]">${formatDisplayUrl(link.link)}</span>
            </span>
            <span class="hidden sm:inline text-[10px] text-purple-400/40 group-hover:text-pink-300 transition-colors flex-shrink-0">
              ${isMaintenance ? 'แจ้งปิด ➔' : 'แตะเปิด ➔'}
            </span>
          </div>
        </div>

        ${isAdmin ? `
          <div class="mt-2 pt-1.5 border-t border-pink-500/15 flex items-center justify-center sm:justify-end gap-1.5" onclick="event.preventDefault(); event.stopPropagation();">
            <button 
              data-id="${link.id || ''}"
              data-row-index="${link.rowIndex}" 
              class="btn-admin-edit-link p-1.5 rounded-lg bg-purple-900/40 hover:bg-pink-600 text-purple-200 hover:text-white transition-all text-xs font-semibold" 
              title="แก้ไขลิงก์นี้"
            >
              <i data-lucide="pencil" class="w-3 h-3 sm:w-3.5 sm:h-3.5"></i>
            </button>
            <button 
              data-id="${link.id || ''}"
              data-row-index="${link.rowIndex}" 
              data-system-name="${escapeHtml(link.systemName)}"
              class="btn-admin-delete-link p-1.5 rounded-lg bg-purple-900/40 hover:bg-rose-600 text-rose-300 hover:text-white transition-all text-xs font-semibold" 
              title="ลบลิงก์นี้"
            >
              <i data-lucide="trash-2" class="w-3 h-3 sm:w-3.5 sm:h-3.5"></i>
            </button>
          </div>
        ` : ''}
      </a>
    `;
  }

  store.subscribe(update);
  update();
}
