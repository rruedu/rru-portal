/**
 * RRU School Portal - Radial Orbit Hero Component
 */

import { store } from '../state.js';
import { CONFIG } from '../config.js';
import { escapeHtml, refreshIcons } from '../utils.js';

export function renderOrbitHero(container) {
  if (!container) return;

  function update() {
    const { config, activeDepartment, links, activeRole } = store.get();

    // Calculate link count per department matching activeRole
    const counts = {};
    for (const dept of CONFIG.DEPARTMENTS) {
      counts[dept.name] = links.filter(l => {
        const matchDept = l.group === dept.name;
        const matchRole = activeRole === 'all' || l.role === 'all' || l.role === activeRole;
        return matchDept && matchRole;
      }).length;
    }

    // Mathematical orbital positioning for 5 nodes (Radius = 195px)
    const radius = 195;
    const nodesMarkup = CONFIG.DEPARTMENTS.map((dept, idx) => {
      // Offset start angle to -90 deg (Top center)
      const angleDeg = -90 + (idx * (360 / CONFIG.DEPARTMENTS.length));
      const angleRad = (angleDeg * Math.PI) / 180;
      const x = Math.round(radius * Math.cos(angleRad));
      const y = Math.round(radius * Math.sin(angleRad));

      const isActive = activeDepartment === dept.id;
      const count = counts[dept.name] || 0;

      return `
        <div 
          data-dept-id="${dept.id}" 
          class="orbit-node desktop-node group ${isActive ? 'active-dept ring-4 ring-pink-500/50' : ''}"
          style="transform: translate(${x}px, ${y}px);"
          title="${escapeHtml(dept.name)} (${count} ระบบงาน)"
        >
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr ${dept.color} flex items-center justify-center text-white mb-1 shadow-sm group-hover:scale-110 transition-transform">
            <i data-lucide="${dept.icon}" class="w-4 h-4"></i>
          </div>
          <span class="text-[11px] font-semibold text-purple-200 group-hover:text-pink-300 text-center leading-tight max-w-[85px] truncate">
            ${dept.shortName}
          </span>
          <span class="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 font-mono mt-0.5">
            ${count}
          </span>
        </div>
      `;
    }).join('');

    // Mobile layout cards
    const mobileNodesMarkup = CONFIG.DEPARTMENTS.map(dept => {
      const isActive = activeDepartment === dept.id;
      const count = counts[dept.name] || 0;

      return `
        <button 
          data-dept-id="${dept.id}" 
          class="mobile-dept-btn flex items-center gap-2 px-3 py-2.5 rounded-2xl border transition-all text-left ${
            isActive 
              ? 'bg-gradient-to-r from-pink-900/60 to-purple-900/60 border-pink-400 shadow-lg shadow-pink-500/20' 
              : 'bg-purple-950/40 border-pink-500/20 hover:border-pink-500/40'
          }"
        >
          <div class="w-7 h-7 rounded-xl bg-gradient-to-tr ${dept.color} flex items-center justify-center text-white flex-shrink-0">
            <i data-lucide="${dept.icon}" class="w-3.5 h-3.5"></i>
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-semibold text-purple-100 truncate">${dept.shortName}</div>
            <div class="text-[10px] text-pink-300/70">${count} บริการ</div>
          </div>
        </button>
      `;
    }).join('');

    container.innerHTML = `
      <section class="relative py-6 sm:py-10 px-4 overflow-hidden">
        
        <!-- Header Text -->
        <div class="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-pink-500/10 border border-pink-500/25 text-pink-300 mb-3 animate-pulse">
            <span class="w-2 h-2 rounded-full bg-pink-400"></span>
            ศูนย์รวมระบบสารสนเทศครบวงจร
          </div>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            <span class="bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              เข้าถึงทุกบริการของโรงเรียน
            </span>
          </h2>
          <p class="text-xs sm:text-sm text-purple-200/70 mt-2 max-w-md mx-auto">
            คลิกเลือกกลุ่มฝ่ายหรือค้นหาระบบงานที่ต้องการ เพื่อเข้าใช้งานได้ทันที
          </p>
        </div>

        <!-- Desktop Radial Orbit System -->
        <div class="desktop-orbit-layout">
          <div class="orbit-system">
            
            <!-- Orbit rings background -->
            <div class="orbit-ring orbit-ring-outer"></div>
            <div class="orbit-ring orbit-ring-inner"></div>

            <!-- Central Hub (Emblem & Reset) -->
            <div class="center-hub group" id="center-hub-node" title="คลิกเพื่อแสดงทุกฝ่ายงาน">
              <div class="pulse-halo"></div>
              <div class="w-16 h-16 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 mb-1">
                <img 
                  src="${config.logoUrl || CONFIG.SCHOOL.logoDefault}" 
                  alt="RRU" 
                  class="w-full h-full object-cover rounded-full bg-slate-900 group-hover:scale-110 transition-transform"
                  onerror="this.src='${CONFIG.SCHOOL.logoDefault}'"
                />
              </div>
              <span class="text-[10px] font-bold tracking-wider text-pink-300 uppercase">
                ${CONFIG.SCHOOL.shortName} HUB
              </span>
            </div>

            <!-- Orbiting Department Satellites -->
            ${nodesMarkup}

          </div>
        </div>

        <!-- Mobile Adaptive Grid / Tabs -->
        <div class="mobile-orbit-layout flex flex-col items-center gap-4">
          <!-- Mobile Center Logo -->
          <div class="flex items-center gap-3 p-3 rounded-2xl bg-purple-950/40 border border-pink-500/25 w-full max-w-sm">
            <div class="w-12 h-12 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-pink-500 to-purple-500 flex-shrink-0">
              <img src="${config.logoUrl || CONFIG.SCHOOL.logoDefault}" alt="RRU" class="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <div class="text-xs font-bold text-pink-300">${CONFIG.SCHOOL.shortName} PORTAL</div>
              <div class="text-[11px] text-purple-200/70">เลือกกลุ่มบริหารงานเพื่อกรองลิงก์</div>
            </div>
          </div>

          <!-- Mobile 5 Departments Grid -->
          <div class="grid grid-cols-2 gap-2 w-full max-w-sm">
            ${mobileNodesMarkup}
          </div>
        </div>

      </section>
    `;

    refreshIcons(container);

    // Event Listeners for Orbit Nodes
    const centerNode = container.querySelector('#center-hub-node');
    if (centerNode) {
      centerNode.addEventListener('click', () => {
        store.setActiveDepartment(null);
        createBurstEffect(centerNode);
        scrollToGrid();
      });
    }

    const deptButtons = container.querySelectorAll('[data-dept-id]');
    deptButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const deptId = btn.dataset.deptId;
        store.setActiveDepartment(deptId);
        createBurstEffect(btn);
        scrollToGrid();
      });
    });
  }

  function createBurstEffect(targetEl) {
    const burst = document.createElement('div');
    burst.className = 'burst-effect';
    targetEl.appendChild(burst);
    setTimeout(() => burst.remove(), 700);
  }

  function scrollToGrid() {
    const gridSection = document.getElementById('departments-section');
    if (gridSection) {
      gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  store.subscribe(update);
  update();
}
