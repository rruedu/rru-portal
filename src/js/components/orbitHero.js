/**
 * RRU School Portal - 360-degree Radial Orbit Hero Component
 * Uniform high-tech glowing orbit on all screen sizes (Mobile, Tablet, Desktop)
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

      // Smart label formatting for clean multi-line wrap on mobile circles
      let formattedName = dept.shortName;
      if (dept.id === 'student-affairs') formattedName = 'กิจการ<br/>นักเรียน';
      if (dept.id === 'personnel') formattedName = 'บริหาร<br/>งานบุคคล';
      if (dept.id === 'general') formattedName = 'บริหาร<br/>ทั่วไป';

      return `
        <div 
          data-dept-id="${dept.id}" 
          class="orbit-node group"
          style="--cos: ${cosVal}; --sin: ${sinVal};"
          title="${escapeHtml(dept.name)} (${count} บริการ) - แตะเพื่อเปิดดู"
        >
          <!-- Icon Bubble -->
          <div class="w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr ${dept.color} flex items-center justify-center text-white mb-0.5 sm:mb-1 shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
            <i data-lucide="${dept.icon}" class="w-4 h-4 sm:w-6 sm:h-6"></i>
          </div>

          <!-- Label -->
          <span class="text-[10px] sm:text-xs font-bold text-purple-100 group-hover:text-pink-300 text-center leading-[1.1] sm:leading-tight px-0.5">
            ${formattedName}
          </span>

          <!-- Badge Count -->
          <span class="text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.2 rounded-full bg-pink-500/25 text-pink-300 font-mono font-bold mt-0.5 border border-pink-500/30">
            ${count}
          </span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <section class="relative py-4 sm:py-8 px-2 sm:px-4 overflow-hidden view-enter flex flex-col items-center justify-center">
        
        <!-- Header Text -->
        <div class="text-center max-w-xl mx-auto mb-2 sm:mb-6">
          <div class="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-pink-500/10 border border-pink-500/25 text-pink-300 mb-1.5">
            <span class="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
            ศูนย์รวมทุกระบบงาน รร.รัฐราษฎร์อุปถัมภ์
          </div>
          <h2 class="text-lg sm:text-3xl font-extrabold tracking-tight">
            <span class="bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              วงโคจร 5 กลุ่มบริหารสถานศึกษา
            </span>
          </h2>
          <p class="text-[11px] sm:text-xs text-purple-200/80 mt-1 max-w-sm mx-auto">
            แตะที่กลุ่มฝ่ายรอบวงโคจร เพื่อเข้าสู่ระบบงานทั้งหมด
          </p>
        </div>

        <!-- 360-degree Radial Orbit System (Unified on all devices) -->
        <div class="orbit-system">
          
          <!-- Orbit Background Rings -->
          <div class="orbit-ring orbit-ring-outer"></div>
          <div class="orbit-ring orbit-ring-inner"></div>

          <!-- Central School Emblem Node -->
          <div class="center-hub group" id="center-hub-node" title="โรงเรียนรัฐราษฎร์อุปถัมภ์">
            <div class="pulse-halo"></div>
            <div class="w-10 h-10 sm:w-16 sm:h-16 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 mb-0.5 shadow-inner">
              <img 
                src="${config.logoUrl || CONFIG.SCHOOL.logoDefault}" 
                alt="RRU" 
                class="w-full h-full object-cover rounded-full bg-slate-900 group-hover:scale-105 transition-transform"
                onerror="this.src='${CONFIG.SCHOOL.logoDefault}'"
              />
            </div>
            <span class="text-[8px] sm:text-xs font-extrabold tracking-wider text-pink-300 uppercase">
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
        }, 180);
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
