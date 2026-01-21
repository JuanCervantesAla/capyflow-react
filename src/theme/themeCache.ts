class ThemeCache {
  private cache: Record<string, string> = {
    edgeColor: '#3B82F6',
    edgeSelectedColor: '#3B82F6',
    bgPrimary: '#0F0F11',
    bgSecondary: '#18181B',
    bgTertiary: '#27272A',
    borderPrimary: '#3F3F46',
    textPrimary: '#F3F4F6',
    textSecondary: '#A1A1AA',
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
    this.cache.borderPrimary = style.getPropertyValue('--border-primary').trim() || '#3F3F46';
    this.cache.textPrimary = style.getPropertyValue('--text-primary').trim() || '#F3F4F6';
    this.cache.textSecondary = style.getPropertyValue('--text-secondary').trim() || '#A1A1AA';
    
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