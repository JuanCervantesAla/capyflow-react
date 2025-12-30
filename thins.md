# 🎨 Paleta de Colores - AI Workflow System

Paleta diseñada para una experiencia **moderna, tech-forward y visualmente impactante**. Combina violetas profundos con acentos cyan/magenta para un look futurista y profesional.

---

## 🌟 Paleta Principal

| Nombre | Hex | RGB | Uso Principal |
|--------|-----|-----|---------------|
| **Primary (Violet Deep)** | `#7C3AED` | `124, 58, 237` | Botones principales, nodos activos, CTAs |
| **Primary Hover** | `#6D28D9` | `109, 40, 217` | Estados hover/pressed |
| **Primary Light** | `#A78BFA` | `167, 139, 250` | Backgrounds sutiles, highlights |
| **Accent Cyan** | `#06B6D4` | `6, 182, 212` | Conexiones entre nodos, estados "processing" |
| **Accent Magenta** | `#EC4899` | `236, 72, 153` | Estados críticos, nodos especiales, alertas |
| **Success Green** | `#10B981` | `16, 185, 129` | Nodos completados, estados success |
| **Warning Amber** | `#F59E0B` | `245, 158, 11` | Advertencias, nodos en espera |

---

## 🎭 Neutrales y Backgrounds

| Nombre | Hex | RGB | Uso |
|--------|-----|-----|-----|
| **Background Dark** | `#0F0F1A` | `15, 15, 26` | Fondo principal (dark mode first) |
| **Surface** | `#1A1A2E` | `26, 26, 46` | Cards, panels, nodos |
| **Surface Elevated** | `#25254A` | `37, 37, 74` | Elementos elevados, modals |
| **Border** | `#2D2D52` | `45, 45, 82` | Bordes sutiles |
| **Text Primary** | `#F9FAFB` | `249, 250, 251` | Texto principal |
| **Text Secondary** | `#9CA3AF` | `156, 163, 175` | Texto secundario |
| **Text Muted** | `#6B7280` | `107, 114, 128` | Placeholders, disabled |

---

## 💡 Modo Light (Opcional)

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Background Light** | `#FAFBFC` | Fondo claro |
| **Surface Light** | `#FFFFFF` | Cards |
| **Border Light** | `#E5E7EB` | Bordes |
| **Text Light** | `#111827` | Texto principal |

---

## 🧩 Uso por Componente

### **Nodos del Workflow**
```css
.node-default {
  background: linear-gradient(135deg, #1A1A2E 0%, #25254A 100%);
  border: 1px solid #7C3AED;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.15);
}

.node-active {
  border: 2px solid #7C3AED;
  box-shadow: 0 0 30px rgba(124, 58, 237, 0.4);
}

.node-processing {
  border: 2px solid #06B6D4;
  animation: pulse 2s infinite;
}

.node-completed {
  border: 2px solid #10B981;
}
```

### **Conexiones entre Nodos**
- **Normal:** `#A78BFA` (opacity: 0.6)
- **Active/Selected:** `#7C3AED` (opacity: 1)
- **Processing:** `#06B6D4` con animación de flujo

### **Botones**
```css
.btn-primary {
  background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.6);
}

.btn-secondary {
  background: transparent;
  border: 2px solid #7C3AED;
  color: #7C3AED;
}

.btn-ghost {
  background: rgba(167, 139, 250, 0.1);
  color: #A78BFA;
}
```

### **Inputs / Formularios**
```css
.input {
  background: #1A1A2E;
  border: 1px solid #2D2D52;
  color: #F9FAFB;
}

.input:focus {
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
}

.input::placeholder {
  color: #6B7280;
}
```

### **Sidebar / Navbar**
```css
.sidebar {
  background: #0F0F1A;
  border-right: 1px solid #2D2D52;
}

.nav-item {
  color: #9CA3AF;
}

.nav-item:hover {
  color: #A78BFA;
  background: rgba(124, 58, 237, 0.1);
}

.nav-item.active {
  color: #7C3AED;
  background: rgba(124, 58, 237, 0.15);
  border-left: 3px solid #7C3AED;
}
```

### **Badges / Tags**
```css
.badge-primary {
  background: rgba(124, 58, 237, 0.15);
  color: #A78BFA;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.badge-success {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
}

.badge-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
}
```

---

## 🔧 Variables CSS

```css
:root {
    --primary: #7C3AED;
  --primary-hover: #6D28D9;
  --primary-light: #A78BFA;
  
    --accent-cyan: #06B6D4;
  --accent-magenta: #EC4899;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  
    --bg-dark: #0F0F1A;
  --surface: #1A1A2E;
  --surface-elevated: #25254A;
  --border: #2D2D52;
  
    --text-primary: #F9FAFB;
  --text-secondary: #9CA3AF;
  --text-muted: #6B7280;
  
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
  --shadow-md: 0 4px 14px rgba(124, 58, 237, 0.15);
  --shadow-lg: 0 10px 40px rgba(124, 58, 237, 0.25);
  --shadow-glow: 0 0 30px rgba(124, 58, 237, 0.4);
  
    --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 350ms ease;
}

body {
  background-color: var(--bg-dark);
  color: var(--text-primary);
}

body.light-mode {
  --bg-dark: #FAFBFC;
  --surface: #FFFFFF;
  --surface-elevated: #F9FAFB;
  --border: #E5E7EB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
}
```

---

## 🎯 Efectos Especiales

### Glow Effects para Nodos AI
```css
.node-ai-active {
  box-shadow: 
    0 0 20px rgba(124, 58, 237, 0.4),
    0 0 40px rgba(124, 58, 237, 0.2),
    inset 0 0 20px rgba(124, 58, 237, 0.1);
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
  }
  50% {
    box-shadow: 0 0 40px rgba(124, 58, 237, 0.8);
  }
}
```

### Gradientes para Backgrounds
```css
.gradient-primary {
  background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
}

.gradient-surface {
  background: linear-gradient(135deg, #1A1A2E 0%, #25254A 100%);
}

.gradient-glow {
  background: radial-gradient(
    circle at top right,
    rgba(124, 58, 237, 0.15) 0%,
    transparent 50%
  );
}
```

---

## 📝 Notas de Diseño

- **Dark mode first**: La paleta está optimizada para modo oscuro, que es más común en herramientas tech/dev
- **Alto contraste**: Ratio WCAG AAA entre texto y fondos
- **Glow effects**: Los brillos sutiles dan sensación de "AI en acción"
- **Accents dinámicos**: Cyan para procesamiento, magenta para especial, verde para éxito
- **Gradientes sutiles**: Añaden profundidad sin saturar visualmente

---

## 🚀 Tips de Implementación

1. Usa `backdrop-filter: blur(10px)` en modales para efecto glassmorphism
2. Agrega `transition: all 250ms ease` a elementos interactivos
3. Considera animaciones sutiles con `@keyframes` para estados "processing"
4. Los nodos pueden tener micro-animaciones de hover con `transform: scale(1.02)`
5. Las conexiones entre nodos pueden animarse con `stroke-dashoffset`