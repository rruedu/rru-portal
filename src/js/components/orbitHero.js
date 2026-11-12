/**
 * RRU School Portal - Unified Radial Orbit Hero Component
 * Displays on both Desktop and Mobile with responsive scaling
 */

import { store } from '../state.js';
import { CONFIG } from '../config.js';
import { escapeHtml, refreshIcons } from '../utils.js';

export function renderOrbitHero(container) {
  if (!container) return;

  function update() {
    const { config, currentView, links, activeRole } = store.get();

    // Only show Orbit Hero when on 'hub' view
    if (currentView !== 'hub') {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');

    // Calculate count per department
    const counts = {};
    for (const dept of CONFIG.DEPARTMENTS) {
      counts[dept.name] = links.filter(l => {
        const matchDept = l.group === dept.name;
        const matchRole = activeRole === 'all' || l.role === 'all' || l.role === activeRole;
        return matchDept && matchRole;
      }).length;
    }

    // 5 nodes calculated with trigonometry
    const nodesMarkup = CONFIG.DEPARTMENTS.map((dept, idx) => {
      const angleDeg = -90 + (idx * (360 / CONFIG.DEPARTMENTS.length));
      const angleRad = (angleDeg * Math.PI) / 180;
      const cosVal = Math.cos(angleRad).toFixed(4);
      const sinVal = Math.sin(angleRad).toFixed(4);

      const count = counts[dept.name] || 0;

      return `
        <div 
          data-dept-id="${dept.id}" 
          class="orbit-node group"
          style="--cos: ${cosVal}; --sin: ${sinVal};"
          title="${escapeHtml(dept.name)} (${count} บริการ) - แตะเพื่อเปิดดู"
        >
          <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr ${dept.color} flex items-center justify-center text-white mb-0.5 sm:mb-1 shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
            <i data-lucide="${dept.icon}" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
          </div>
          <span class="text-[9px] sm:text-[11px] font-semibold text-purple-200 group-hover:text-pink-300 text-center leading-tight max-w-[62px] sm:max-w-[85px] truncate px-0.5">
            ${dept.shortName}
          </span>
          <span class="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 font-mono mt-0.5">
            ${count}
          </span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <section class="relative py-6 sm:py-10 px-4 overflow-hidden view-enter">
        
        <!-- Header Text -->
        <div class="text-center max-w-xl mx-auto mb-4 sm:mb-6">
          <div class="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-pink-500/10 border border-pink-500/25 text-pink-300 mb-2">
            <span class="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
            ศูนย์รวมทุกระบบงาน รร.รัฐราษฎร์อุปถัมภ์
          </div>
          <h2 class="text-xl sm:text-3xl font-extrabold tracking-tight">
            <span class="bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              เลือกกลุ่มบริหารเพื่อเข้าใช้งาน
            </span>
          </h2>
          <p class="text-[11px] sm:text-xs text-purple-200/70 mt-1 max-w-sm mx-auto">
            แตะที่กลุ่มฝ่ายรอบวงโคจร เพื่อดูระบบงานทั้งหมด
          </p>
        </div>

        <!-- Unified Radial Orbit System (Desktop & Mobile) -->
        <div class="orbit-system">
          
          <!-- Orbit Background Rings -->
          <div class="orbit-ring orbit-ring-outer"></div>
          <div class="orbit-ring orbit-ring-inner"></div>

          <!-- Central School Emblem -->
          <div class="center-hub group" id="center-hub-node" title="โรงเรียนรัฐราษฎร์อุปถัมภ์">
            <div class="pulse-halo"></div>
            <div class="w-10 h-10 sm:w-14 sm:h-14 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 mb-0.5">
              <img 
                src="${config.logoUrl || CONFIG.SCHOOL.logoDefault}" 
                alt="RRU" 
                class="w-full h-full object-cover rounded-full bg-slate-900 group-hover:scale-105 transition-transform"
                onerror="this.src='${CONFIG.SCHOOL.logoDefault}'"
              />
            </div>
            <span class="text-[8px] sm:text-[10px] font-bold tracking-wider text-pink-300 uppercase">
              RRU HUB
            </span>
          </div>

          <!-- 5 Orbit Satellites -->
          ${nodesMarkup}

        </div>

      </section>
    `;

    refreshIcons(container);

    // Event Listeners for Orbit Nodes
    const deptNodes = container.querySelectorAll('.orbit-node');
    deptNodes.forEach(node => {
      node.addEventListener('click', () => {
        const deptId = node.dataset.deptId;
        createBurstEffect(node);
        setTimeout(() => {
          store.goToDepartment(deptId);
        }, 220);
      });
    });
  }

  function createBurstEffect(targetEl) {
    const burst = document.createElement('div');
    burst.className = 'burst-effect';
    targetEl.appendChild(burst);
    setTimeout(() => burst.remove(), 600);
  }

  store.subscribe(update);
  update();
}
