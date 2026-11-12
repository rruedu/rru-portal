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
      currentView: 'hub', // 'hub' | 'department' | 'search' | 'admin'
      activeRole: 'all',
      activeDepartment: null, // dept id, e.g. 'academic'
      searchQuery: '',
      theme: (typeof localStorage !== 'undefined' ? localStorage.getItem('rru_theme') : 'dark') || 'dark',
      isAdmin: false,
      adminPin: '',
      isLoading: true
    };

    this.listeners = new Set();
    if (typeof window !== 'undefined') {
      this.initRouter();
    }
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
      } else if (hash === 'admin') {
        this.set({ currentView: 'admin', activeDepartment: null, searchQuery: '' });
      } else {
        this.set({ currentView: 'department', activeDepartment: hash });
      }
    };

    window.addEventListener('hashchange', handleHash);
    setTimeout(handleHash, 50);
  }

  goToHub() {
    if (typeof window !== 'undefined') {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.set({ currentView: 'hub', activeDepartment: null, searchQuery: '' });
  }

  goToAdmin() {
    if (typeof window !== 'undefined') {
      window.location.hash = 'admin';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.set({ currentView: 'admin', activeDepartment: null, searchQuery: '' });
  }

  goToDepartment(deptId) {
    if (typeof window !== 'undefined') {
      window.location.hash = deptId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.set({ currentView: 'department', activeDepartment: deptId, searchQuery: '' });
  }

  setSearchQuery(query) {
    if (query && query.trim()) {
      this.set({ searchQuery: query.trim(), currentView: 'search' });
    } else {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash === 'admin') {
        this.set({ searchQuery: '', currentView: 'admin', activeDepartment: null });
      } else if (hash && hash !== 'hub') {
        this.set({ searchQuery: '', currentView: 'department', activeDepartment: hash });
      } else {
        this.set({ searchQuery: '', currentView: 'hub', activeDepartment: null });
      }
    }
  }

  setTheme(theme) {
    const validTheme = theme === 'light' ? 'light' : 'dark';
    this.set({ theme: validTheme });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('rru_theme', validTheme);
    }
    
    if (typeof document !== 'undefined') {
      if (validTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
      document.documentElement.setAttribute('data-theme', validTheme);
    }
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
