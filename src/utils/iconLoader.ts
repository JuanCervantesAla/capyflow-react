import * as TablerIcons from "@tabler/icons-react";

export const ICONS = {
  ...TablerIcons,
};

const iconCache = new Map<string, any>();

export function getIconComponent(name?: string) {
  if (!name) return ICONS["IconBrandReact"];
  
  if (iconCache.has(name)) {
    return iconCache.get(name);
  }
  
  const icon = (ICONS as any)[name] || (ICONS as any)["IconBrandReact"];
  iconCache.set(name, icon);
  return icon;
}