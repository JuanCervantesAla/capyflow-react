





import * as TablerIcons from "@tabler/icons-react";
import { memo } from "react";

export const ICONS = {
  ...TablerIcons,
};

const iconCache = new Map();

export function getIconComponent(name?: string) {
  if (!name) return ICONS["IconBrandReact"];
  
  if (iconCache.has(name)) {
    return iconCache.get(name);
  }
  
  const icon = ICONS[name] || ICONS["IconBrandReact"];
  iconCache.set(name, icon);
  return icon;
}