# CapyFlow Frontend

Sistema de automatización de flujos de trabajo visual construido con React, TypeScript y Vite.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18 o superior
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Iniciar en modo desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## 🛠️ Stack Tecnológico

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Flow** - Editor de flujos visual
- **Mantine** - Biblioteca de componentes UI
- **TanStack Query** - Gestión de estado del servidor
- **Tabler Icons** - Iconos
- **Tailwind CSS** - Estilos utilitarios

## 🎨 Características

- ✅ Editor visual drag-and-drop
- ✅ Sistema de temas claro/oscuro
- ✅ Autenticación JWT
- ✅ WebSocket para actualizaciones en tiempo real
- ✅ Panel de configuración de nodos
- ✅ Historial de ejecuciones
- ✅ Panel de webhooks con testing
- ✅ Responsive design

## 📁 Estructura del Proyecto

```
src/
├── api/              # Clientes API y endpoints
├── components/       # Componentes React
│   ├── Control/      # Controles del canvas
│   ├── Edges/        # Edges personalizados
│   ├── Flow/         # Componentes del flujo
│   ├── HeaderBar/    # Barra de navegación
│   ├── Nodes/        # Nodos personalizados
│   ├── Rightbar/     # Panel lateral derecho
│   ├── SideBar/      # Panel lateral izquierdo
│   └── UI/           # Componentes UI reutilizables
├── hooks/            # Custom React hooks
├── pages/            # Páginas de la aplicación
├── theme/            # Sistema de temas
└── utils/            # Utilidades
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/api/ws
```

## 🎯 Uso

1. **Inicia sesión** o regístrate en la aplicación
2. **Crea un flujo** desde el selector de flujos
3. **Arrastra nodos** desde la barra lateral al canvas
4. **Conecta nodos** arrastrando desde los puntos de conexión
5. **Configura nodos** haciendo clic en ellos
6. **Guarda** el flujo con el botón de la barra superior
7. **Ejecuta** el flujo con el botón play ▶️

## 🐛 Solución de Problemas

### El frontend no se conecta al backend
- Verifica que el backend esté corriendo
- Comprueba las variables de entorno en `.env`
- Revisa la consola del navegador para errores

### Errores de compilación
```bash
# Limpia caché y reinstala
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentación Adicional

- [MVP Guide](../MVP_GUIDE.md) - Guía completa del MVP
- [TypeScript + Vite](https://vitejs.dev/guide/) - Documentación de Vite

## 🤝 Contribución

Este es un proyecto de titulación. Ver [MVP_GUIDE.md](../MVP_GUIDE.md) para más información.

## 📄 Licencia

Este proyecto es parte de un trabajo de titulación.

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026
