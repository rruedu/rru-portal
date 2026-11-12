/**
 * RRU School Portal - Unified Hero Component
 * Desktop: 360-degree Radial Orbit
 * Mobile: Smart Adaptive Bento Cards (Thumb-optimized, big touch targets, full titles)
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

    // Desktop 5 nodes calculated with trigonometry
    const desktopNodesMarkup = CONFIG.DEPARTMENTS.map((dept, idx) => {
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
          <div class="w-11 h-11 rounded-full bg-gradient-to-tr ${dept.color} flex items-center justify-center text-white mb-1 shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
            <i data-lucide="${dept.icon}" class="w-6 h-6"></i>
          </div>
          <span class="text-xs sm:text-sm font-bold text-purple-100 group-hover:text-pink-300 text-center leading-tight whitespace-normal break-words px-1">
            ${dept.shortName}
          </span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-pink-500/25 text-pink-300 font-mono font-bold mt-1 border border-pink-500/30">
            ${count}
          </span>
        </div>
      `;
    }).join('');

    // Mobile Bento Action Cards (Large, thumb-friendly, full names, no truncation)
    const mobileBentoMarkup = CONFIG.DEPARTMENTS.map(dept => {
      const count = counts[dept.name] || 0;
      return `
        <button 
          data-dept-id="${dept.id}" 
          class="mobile-bento-btn w-full glass-panel flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-pink-500/25 hover:border-pink-500 active:scale-[0.98] transition-all text-left cursor-pointer group shadow-md"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${dept.color} flex items-center justify-center text-white flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <i data-lucide="${dept.icon}" class="w-6 h-6"></i>
            </div>
            <div class="min-w-0">
              <div class="text-sm font-extrabold text-purple-100 group-hover:text-pink-300 transition-colors">
                ${escapeHtml(dept.name)}
              </div>
              <div class="text-xs text-purple-300/70 line-clamp-1 mt-0.5">
                ${escapeHtml(dept.description)}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0 ml-2">
            <span class="text-xs px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 font-mono font-bold border border-pink-500/30">
              ${count}
            </span>
            <i data-lucide="chevron-right" class="w-4 h-4 text-pink-400 group-hover:translate-x-0.5 transition-transform"></i>
          </div>
        </button>
      `;
    }).join('');

    container.innerHTML = `
      <section class="relative py-4 sm:py-8 px-4 overflow-hidden view-enter">
        
        <!-- Header Text -->
        <div class="text-center max-w-xl mx-auto mb-4 sm:mb-6">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-pink-500/10 border border-pink-500/25 text-pink-300 mb-2">
            <span class="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
            ศูนย์รวมทุกระบบงาน รร.รัฐราษฎร์อุปถัมภ์
          </div>
          <h2 class="text-xl sm:text-3xl font-extrabold tracking-tight">
            <span class="bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              เลือกกลุ่มบริหารเพื่อเข้าใช้งาน
            </span>
          </h2>
          <p class="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-sm mx-auto">
            แตะที่กลุ่มฝ่ายเพื่อดูระบบงานและบริการออนไลน์ทั้งหมด
          </p>
        </div>

        <!-- 1. Desktop: 360-degree Radial Orbit (Visible on sm: screens and above) -->
        <div class="hidden sm:block">
          <div class="orbit-system">
            
            <!-- Orbit Background Rings -->
            <div class="orbit-ring orbit-ring-outer"></div>
            <div class="orbit-ring orbit-ring-inner"></div>

            <!-- Central School Emblem -->
            <div class="center-hub group" id="center-hub-node" title="โรงเรียนรัฐราษฎร์อุปถัมภ์">
              <div class="pulse-halo"></div>
              <div class="w-16 h-16 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 mb-0.5 shadow-inner">
                <img 
                  src="${config.logoUrl || CONFIG.SCHOOL.logoDefault}" 
                  alt="RRU" 
                  class="w-full h-full object-cover rounded-full bg-slate-900 group-hover:scale-105 transition-transform"
                  onerror="this.src='${CONFIG.SCHOOL.logoDefault}'"
                />
              </div>
              <span class="text-xs font-extrabold tracking-wider text-pink-300 uppercase">
                RRU HUB
              </span>
            </div>

            <!-- 5 Orbit Satellites -->
            ${desktopNodesMarkup}

          </div>
        </div>

        <!-- 2. Mobile: Smart Adaptive Bento Cards (Visible on screens below sm:) -->
        <div class="block sm:hidden max-w-md mx-auto space-y-3">
          
          <!-- Mobile Center Emblem Banner -->
          <div class="flex items-center gap-3 p-3.5 rounded-2xl bg-purple-950/40 border border-pink-500/30 shadow-md">
            <div class="w-12 h-12 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-pink-500 to-purple-600 flex-shrink-0 shadow-sm">
              <img 
                src="${config.logoUrl || CONFIG.SCHOOL.logoDefault}" 
                alt="RRU" 
                class="w-full h-full object-cover rounded-xl bg-slate-900" 
                onerror="this.src='${CONFIG.SCHOOL.logoDefault}'"
              />
            </div>
            <div>
              <h3 class="text-sm font-extrabold text-purple-100">${escapeHtml(config.schoolName)}</h3>
              <p class="text-[11px] text-pink-300 font-semibold">แตะเลือกกลุ่มบริหารงานเพื่อดูระบบงาน</p>
            </div>
          </div>

          <!-- 5 Mobile Bento Action Cards -->
          <div class="space-y-2.5">
            ${mobileBentoMarkup}
          </div>

        </div>

      </section>
    `;

    refreshIcons(container);

    // Event Listeners for Orbit Nodes & Bento Buttons
    const deptButtons = container.querySelectorAll('[data-dept-id]');
    deptButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const deptId = btn.dataset.deptId;
        createBurstEffect(btn);
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
