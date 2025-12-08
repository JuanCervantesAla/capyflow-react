////////////////////////////////////////LIGHT///////////////////////////////
// export const LIGHT_THEME = {
//   colors: {
//     background: {
//       primary: "#F3F4F6", // gris muy claro – fondo general (canvas)
//       secondary: "#E5E7EB", // gris claro – sidebars, panels
//       tertiary: "#D1D5DB", // gris medio – headers, contenedores
//     },

//     border: {
//       primary: "#C7CBD4", // gris suave para bordes
//       accent: "#3B82F6",  // azul para estados activos / focus
//     },

//     text: {
//       primary: "#1F2937",   // negro suave – legible
//       secondary: "#6B7280", // gris – subtítulos, descripciones
//       accent: "#2563EB",    // azul – labels importantes
//     },

//     accent: {
//       primary: "#3B82F6",   // azul principal (botones, iconos activos)
//       secondary: "#2563EB", // azul más oscuro para hover
//       tertiary: "#93C5FD",  // azul claro — fondos suaves
//       cyan: "#06B6D4",      // opcional para elementos decorativos
//       cyanDark: "#0E7490",
//     },

//     selection: {
//       background: "#FFFFFF", // blanco puro – selección clara de nodos
//       border: "#3B82F6",     // borde azul al seleccionar
//     },
//   },

//   effects: {
//     shadow: "0 1px 3px rgba(0,0,0,0.10)",    // sombra ligera para componentes
//     shadowMd: "0 4px 10px rgba(0,0,0,0.12)", // sombra intermedia
//     glowBlue: "0 0 12px rgba(59,130,246,0.30)", // resplandor azul suave
//   },

//   spacing: {
//     xs: 4,
//     sm: 8,
//     md: 12,
//     lg: 16,
//     xl: 20,
//   },

//   borderRadius: {
//     sm: 6,
//     md: 10,
//     lg: 14,
//   },
// };


export const LIGHT_THEME = {
  colors: {
    background: {
      primary: "#F7F7F7", // gris casi blanco – canvas
      secondary: "#E5E5E5", // gris claro – sidebars
      tertiary: "#D4D4D4", // gris medio – headers/containers
    },

    border: {
      primary: "#C2C2C2", // gris suave
      accent: "#000000",  // negro — foco, selección, énfasis
    },

    text: {
      primary: "#111111",   // negro casi puro – fuerte y legible
      secondary: "#6B6B6B", // gris – subtítulos
      accent: "#000000",    // negro sólido – destaque
    },

    accent: {
      primary: "#000000",  // negro — nodos, iconos activos
      secondary: "#1A1A1A", // gris oscuro profundo — hover
      tertiary: "#E5E5E5",  // gris claro — fondos suaves
      cyan: "#000000",      // no se usa — mantiene consistencia
      cyanDark: "#000000",
    },

    selection: {
      background: "#FFFFFF", // blanco puro para selección limpia
      border: "#000000",     // borde negro fuerte al seleccionar
    },
  },

  effects: {
    shadow: "0 1px 3px rgba(0,0,0,0.12)",
    shadowMd: "0 4px 10px rgba(0,0,0,0.16)",
    glowBlue: "0 0 12px rgba(0,0,0,0.25)", // glow negro sutil
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },

  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
  },
};


//////////////////////////////////////////DARK///////////////////////////////

export const DARK_THEME = {
  colors: {
    background: {
      primary: "#0F0F11",   // fondo principal – casi negro, muy limpio
      secondary: "#18181B", // paneles, sidebars – gris oscuro neutro
      tertiary: "#27272A",  // headers, contenedores – gris piedra
    },

    border: {
      primary: "#3F3F46",  // gris oscuro suave para bordes
      accent: "#3B82F6",   // azul para foco y elementos activos
    },

    text: {
      primary: "#F3F4F6",   // blanco suave (no puro)
      secondary: "#A1A1AA", // gris claro para subtítulos
      accent: "#60A5FA",    // azul claro para información destacada
    },

    accent: {
      primary: "#3B82F6",   // azul principal (botones/iconos activos)
      secondary: "#2563EB", // azul más profundo para hover
      tertiary: "#1E3A8A",  // azul muy oscuro para fondos sutiles
      cyan: "#06B6D4",      // cyan vibrante para detalles
      cyanDark: "#083344",  // cyan profundo para efectos
    },

    selection: {
      background: "#1E3A8A", // azul oscuro para selección de nodos
      border: "#3B82F6",     // highlight azul brillante
    },
  },

  effects: {
    shadow: "0 1px 3px rgba(0,0,0,0.50)",      // sombra fuerte para dark
    shadowMd: "0 4px 10px rgba(0,0,0,0.55)",   // sombra más pronunciada
    glowBlue: "0 0 12px rgba(59,130,246,0.35)" // glow azul moderado
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },

  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
  },
};

