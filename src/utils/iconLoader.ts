import * as TablerIcons from "@tabler/icons-react";

//Importa todos los iconos de icons react esto para hacer un paso de prop dinamico

export const ICONS = {
  ...TablerIcons,
};

export function getIconComponent(name?: string) {
  if (!name || !ICONS[name]) return ICONS["IconBrandReact"];
  return ICONS[name];
}
