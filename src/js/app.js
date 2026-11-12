/**
 * RRU School Portal - Application Main Entry Point
 */

import { store } from './state.js';
import { fetchPortalData } from './api.js';
import { renderAnnouncement } from './components/announcement.js';
import { renderNavbar } from './components/navbar.js';
import { renderOrbitHero } from './components/orbitHero.js';
import { renderDepartmentGrid } from './components/departmentGrid.js';
import { renderAdminView } from './components/adminView.js';
import { renderAdminModal } from './components/adminModal.js';
import { initPwaInstall } from './components/installModal.js';
import { refreshIcons } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Theme
  const currentTheme = store.get().theme;
  store.setTheme(currentTheme);

  // 2. Register Service Worker for PWA (if supported)
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
    } catch (e) {
      console.log('SW registration note:', e);
    }
  }

  // 3. Mount UI Components
  renderAnnouncement(document.getElementById('announcement-container'));
  renderNavbar(document.getElementById('navbar-container'));
  renderOrbitHero(document.getElementById('orbit-container'));
  renderDepartmentGrid(document.getElementById('departments-container'));
  renderAdminView(document.getElementById('admin-view-container'));
  renderAdminModal(document.getElementById('admin-modal-container'));
  initPwaInstall(document.getElementById('pwa-modal-container'));

  refreshIcons();

  // 4. Fetch Live Portal Data
  try {
    const data = await fetchPortalData();
    if (data) {
      store.set({
        links: data.links || [],
        config: { ...store.get().config, ...(data.config || {}) },
        isLoading: false
      });
    }
  } catch (err) {
    console.warn('Initial data load warning:', err);
    store.set({ isLoading: false });
  }

  // Remove initial loading screen
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => loader.remove(), 400);
  }
});
