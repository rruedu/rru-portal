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
      activeRole: 'all',
      activeDepartment: null, // null means all or not focused
      searchQuery: '',
      theme: localStorage.getItem('rru_theme') || 'dark',
      isAdmin: false,
      adminPin: '',
      isLoading: true
    };

    this.listeners = new Set();
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

  setActiveDepartment(deptId) {
    // If clicking same department, toggle off
    const next = this.state.activeDepartment === deptId ? null : deptId;
    this.set({ activeDepartment: next });
  }

  setSearchQuery(query) {
    this.set({ searchQuery: query });
  }

  setAdmin(isAdmin, pin = '') {
    this.set({ isAdmin, adminPin: pin });
  }
}

export const store = new StateStore();
