class ThemeCache {
  private cache: Record<string, any> = {
    edgeColor: '#3B82F6',
    edgeSelectedColor: '#3B82F6',
    bgPrimary: '#0F0F11',
    bgSecondary: '#18181B',
    bgTertiary: '#27272A',
    bgSidebar: '#F5F1E8',
    bgNode: '#FAF8F4',
    borderPrimary: '#3F3F46',
    borderNode: '#0A0A08',
    textPrimary: '#F3F4F6',
    textSecondary: '#A1A1AA',
    textMuted: '#7A7060',
    textInk: '#0A0A08',
    errorColor: '#B71C1C',
    category: {},
    categoryBg: {},
    status: {},
  };
  
  private isInitialized = false;

  private init() {
    if (this.isInitialized) return;
    
    const style = getComputedStyle(document.documentElement);
    
    this.cache.edgeColor = style.getPropertyValue('--edge-color').trim() || '#3B82F6';
    this.cache.edgeSelectedColor = style.getPropertyValue('--edge-selected-color').trim() || '#3B82F6';
    this.cache.bgPrimary = style.getPropertyValue('--bg-primary').trim() || '#0F0F11';
    this.cache.bgSecondary = style.getPropertyValue('--bg-secondary').trim() || '#18181B';
    this.cache.bgTertiary = style.getPropertyValue('--bg-tertiary').trim() || '#27272A';
    this.cache.bgSidebar = style.getPropertyValue('--bg-sidebar').trim() || '#F5F1E8';
    this.cache.bgNode = style.getPropertyValue('--bg-node').trim() || '#FAF8F4';
    this.cache.borderPrimary = style.getPropertyValue('--border-primary').trim() || '#3F3F46';
    this.cache.borderNode = style.getPropertyValue('--border-node').trim() || '#0A0A08';
    this.cache.textPrimary = style.getPropertyValue('--text-primary').trim() || '#F3F4F6';
    this.cache.textSecondary = style.getPropertyValue('--text-secondary').trim() || '#A1A1AA';
    this.cache.textMuted = style.getPropertyValue('--text-muted').trim() || '#7A7060';
    this.cache.textInk = style.getPropertyValue('--text-ink').trim() || '#0A0A08';
    this.cache.errorColor = '#B71C1C';
    
    // Category colors
    this.cache.category = {
      trigger: style.getPropertyValue('--cat-trigger').trim() || '#B05000',
      data: style.getPropertyValue('--cat-data').trim() || '#1A4F8A',
      io: style.getPropertyValue('--cat-io').trim() || '#2E7D32',
      logic: style.getPropertyValue('--cat-logic').trim() || '#5A1A8A',
      control: style.getPropertyValue('--cat-control').trim() || '#6B7280',
      ai: style.getPropertyValue('--cat-ai').trim() || '#3B82F6',
      integration: style.getPropertyValue('--cat-integration').trim() || '#3B82F6',
    };
    
    // Category background colors
    this.cache.categoryBg = {
      trigger: style.getPropertyValue('--catbg-trigger').trim() || '#FFF3E0',
      data: style.getPropertyValue('--catbg-data').trim() || '#E8F0FA',
      io: style.getPropertyValue('--catbg-io').trim() || '#E8F5E9',
      logic: style.getPropertyValue('--catbg-logic').trim() || '#F3EAFA',
      control: style.getPropertyValue('--catbg-control').trim() || '#F5F5F5',
      ai: style.getPropertyValue('--catbg-ai').trim() || '#E8F0FA',
      integration: style.getPropertyValue('--catbg-integration').trim() || '#E8F0FA',
    };
    
    // Status colors
    this.cache.status = {
      idle: style.getPropertyValue('--status-idle').trim() || 'transparent',
      ready: style.getPropertyValue('--status-ready').trim() || '#2E7D32',
      running: style.getPropertyValue('--status-running').trim() || '#E8A020',
      error: style.getPropertyValue('--status-error').trim() || '#B71C1C',
      success: style.getPropertyValue('--status-success').trim() || '#2E7D32',
    };
    
    this.isInitialized = true;
  }

  invalidate() {
    this.isInitialized = false;
  }
  
  get() {
    this.init();
    return this.cache;
  }
}

export const themeCache = new ThemeCache();
export const getThemeColors = () => themeCache.get();