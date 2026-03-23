import {
  IconApi,
  IconBolt,
  IconBrandReact,
  IconBrandTelegram,
  IconBrain,
  IconBraces,
  IconClock,
  IconDatabase,
  IconFileText,
  IconGitBranch,
  IconListDetails,
  IconMail,
  IconMessage,
  IconPlayerPlay,
  IconRepeat,
  IconTransform,
  IconVariable,
  IconWebhook,
  IconWorld,
} from "@tabler/icons-react";

export const ICONS: Record<string, any> = {
  IconApi,
  IconBolt,
  IconBrandReact,
  IconBrandTelegram,
  IconBrain,
  IconBraces,
  IconClock,
  IconDatabase,
  IconFileText,
  IconGitBranch,
  IconListDetails,
  IconMail,
  IconMessage,
  IconPlayerPlay,
  IconRepeat,
  IconTransform,
  IconVariable,
  IconWebhook,
  IconWorld,
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