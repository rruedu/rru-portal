/**
 * RRU School Portal - State Management Store
 */

class StateStore {
  constructor() {
    this.state = {
      links: [],
      config: {
        schoolName: 'โรงเรียนรัฐราษฎร์อุปถัมภ์',
        schoolSubtitle: 'ระบบรวมงานและบริการสารสนเทศออนไลน์ (RRU Portal)',
        bannerUrl: '',
        logoUrl: '',
        announcementText: 'ยินดีต้อนรับสู่ระบบรวมงานและบริการออนไลน์ โรงเรียนรัฐราษฎร์อุปถัมภ์',
        announcementEnabled: true
      },
      currentView: 'hub', // 'hub' | 'department' | 'search'
      activeRole: 'all',
      activeDepartment: null, // dept id, e.g. 'academic'
      searchQuery: '',
      theme: localStorage.getItem('rru_theme') || 'dark',
      isAdmin: false,
      adminPin: '',
      isLoading: true
    };

    this.listeners = new Set();
    this.initRouter();
  }

  get() {
    return this.state;
  }

  set(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (e) {
        console.error('State listener error:', e);
      }
    }
  }

  initRouter() {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (!hash || hash === 'hub') {
        if (!this.state.searchQuery) {
          this.set({ currentView: 'hub', activeDepartment: null });
        }
      } else {
        this.set({ currentView: 'department', activeDepartment: hash });
      }
    };

    window.addEventListener('hashchange', handleHash);
    // Initial check on load
    setTimeout(handleHash, 50);
  }

  goToHub() {
    window.location.hash = '';
    this.set({ currentView: 'hub', activeDepartment: null, searchQuery: '' });
  }

  goToDepartment(deptId) {
    window.location.hash = deptId;
    this.set({ currentView: 'department', activeDepartment: deptId, searchQuery: '' });
  }

  setSearchQuery(query) {
    if (query && query.trim()) {
      this.set({ searchQuery: query.trim(), currentView: 'search' });
    } else {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash && hash !== 'hub') {
        this.set({ searchQuery: '', currentView: 'department', activeDepartment: hash });
      } else {
        this.set({ searchQuery: '', currentView: 'hub', activeDepartment: null });
      }
    }
  }

  setTheme(theme) {
    this.set({ theme });
    localStorage.setItem('rru_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme() {
    const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setActiveRole(role) {
    this.set({ activeRole: role });
  }

  setAdmin(isAdmin, pin = '') {
    this.set({ isAdmin, adminPin: pin });
  }
}

export const store = new StateStore();
