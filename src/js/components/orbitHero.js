/**
 * RRU School Portal - Unified Radial Orbit Hero Component
 * Displays on both Desktop and Mobile with enlarged, untruncated touch nodes
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
          <div class="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr ${dept.color} flex items-center justify-center text-white mb-1 shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
            <i data-lucide="${dept.icon}" class="w-4 h-4 sm:w-6 sm:h-6"></i>
          </div>
          <span class="text-xs sm:text-sm font-bold text-purple-100 group-hover:text-pink-300 text-center leading-tight whitespace-normal break-words px-1">
            ${dept.shortName}
          </span>
          <span class="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-pink-500/25 text-pink-300 font-mono font-bold mt-1 border border-pink-500/30">
            ${count}
          </span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <section class="relative py-4 sm:py-8 px-4 overflow-hidden view-enter">
        
        <!-- Header Text -->
        <div class="text-center max-w-xl mx-auto mb-3 sm:mb-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 border border-pink-500/25 text-pink-300 mb-2">
            <span class="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
            ศูนย์รวมทุกระบบงาน รร.รัฐราษฎร์อุปถัมภ์
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span class="bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              เลือกกลุ่มบริหารเพื่อเข้าใช้งาน
            </span>
          </h2>
          <p class="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-sm mx-auto">
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
            <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 mb-0.5 shadow-inner">
              <img 
                src="${config.logoUrl || CONFIG.SCHOOL.logoDefault}" 
                alt="RRU" 
                class="w-full h-full object-cover rounded-full bg-slate-900 group-hover:scale-105 transition-transform"
                onerror="this.src='${CONFIG.SCHOOL.logoDefault}'"
              />
            </div>
            <span class="text-[10px] sm:text-xs font-extrabold tracking-wider text-pink-300 uppercase">
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
        }, 200);
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
