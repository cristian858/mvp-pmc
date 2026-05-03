# SafeSign AI - Frontend React + Vite

Frontend moderno e impactante para la plataforma SafeSign AI, construido con React, Vite, Tailwind CSS y GSAP.

## [DESIGN] Características de Diseño

- **Tema Verde Contemporáneo**: Paleta de colores verde esmeralda (#22c55e) con variantes teal
- **Diseño Moderno y Sobrio**: Interfaz limpia con énfasis en la innovación
- **Animaciones Fluidas**: GSAP para transiciones y efectos visuales
- **Responsive Design**: Totalmente adaptable a móviles, tablets y desktop
- **Glassmorphism**: Efectos de vidrio esmerilado con backdrop blur
- **Componentes Reutilizables**: Estructura modular y fácil de mantener

## 📁 Estructura de Carpetas

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Layout.jsx       # Navbar y estructura principal
│   │   └── ProtectedRoute.jsx # Rutas protegidas
│   ├── pages/               # Páginas de la aplicación
│   │   ├── Login.jsx        # Página de inicio de sesión
│   │   ├── Register.jsx     # Página de registro
│   │   ├── Dashboard.jsx    # Dashboard principal
│   │   └── Upload.jsx       # Subida de documentos
│   ├── context/             # Context API
│   │   └── AuthContext.jsx  # Contexto de autenticación
│   ├── hooks/               # Hooks personalizados
│   │   └── useAuth.js       # Hook de autenticación
│   ├── services/            # Servicios de API
│   │   └── api.js           # Cliente de axios
│   ├── assets/              # Recursos estáticos
│   │   └── logos/           # [NOTE] CARPETA PARA TU LOGO (ver abajo)
│   ├── App.jsx              # Componente principal
│   ├── App.css              # Estilos de App
│   ├── index.css            # Estilos globales con Tailwind
│   └── main.jsx             # Punto de entrada
├── tailwind.config.js       # Configuración de Tailwind
├── postcss.config.js        # Configuración de PostCSS
├── vite.config.js           # Configuración de Vite
├── package.json             # Dependencias
└── index.html               # HTML principal
```

## [IMAGE] Logo - Instrucciones de Subida

### Carpeta de Logo
📁 **Ruta**: `src/assets/logos/`

### Versiones Requeridas del Logo

Por favor, proporciona **3 versiones** de tu logo:

1. **Logo Completo** (`logo-full.svg` o `.png`)
   - Dimensiones: 200x60px (mínimo)
   - Fondo: Transparente
   - Uso: Navbar, pantalla de bienvenida
   - Formato: SVG preferido, PNG como alternativa

2. **Logo Isotipo** (Solo símbolo) (`logo-icon.svg` o `.png`)
   - Dimensiones: 200x200px
   - Fondo: Transparente
   - Uso: Favicon, avatar de usuario, botones
   - Formato: SVG preferido, PNG como alternativa

3. **Logo Vertical** (`logo-vertical.svg` o `.png`)
   - Dimensiones: 100x150px
   - Fondo: Transparente
   - Uso: Página de login/register
   - Formato: SVG preferido, PNG como alternativa

### Guía de Color Sugerida
- **Color Primario**: #22c55e (Verde Esmeralda)
- **Blanco**: #ffffff
- **Gris Oscuro**: #0f172a
- **Ajustes**: El logo debe funcionar en fondo blanco y gradientes verdes

### Cómo Subir
1. Coloca los archivos en `src/assets/logos/`
2. Los nombres de archivos deben ser:
   - `logo-full.[svg|png]`
   - `logo-icon.[svg|png]`
   - `logo-vertical.[svg|png]`

3. Si tienes variantes de color, nombra así:
   - `logo-full-dark.[svg|png]` (versión oscura)
   - `logo-full-white.[svg|png]` (versión blanca)

## [LAUNCH] Instalación y Desarrollo

```bash
# Instalar dependencias (ya hecho)
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build
npm run preview
```

## 🔌 API Integration

El frontend está completamente integrado con la API REST en:
- **Base URL**: `http://localhost:8080/api/v1`
- **Autenticación**: Session-based (cookies)
- **Endpoints usados**: auth, documents, biometry, signatures

### Servicio de API
Ver `src/services/api.js` para métodos disponibles:
- `authService.register()`, `.login()`, `.logout()`, `.getCurrentUser()`
- `documentService.list()`, `.get()`, `.upload()`, `.delete()`, `.updateStatus()`
- `biometryService.list()`, `.get()`, `.getStatus()`
- `signatureService.list()`, `.get()`, `.create()`, `.update()`

## [THEME] Temas y Colores

### Paleta Principal
- **Emerald 500**: `#22c55e` (Verde primario)
- **Teal 500**: `#14b8a6` (Verde secundario)
- **Slate 900**: `#0f172a` (Texto oscuro)

### Clases Tailwind Personalizadas
```css
.gradient-primary  /* Gradiente verde */
.glass            /* Efecto glassmorphism claro */
.btn-primary      /* Botón principal */
.card             /* Tarjeta base */
```

## [PACKAGE] Dependencias Principales

- **react**: 18+
- **react-router-dom**: Para navegación
- **axios**: Cliente HTTP
- **tailwindcss**: Framework CSS
- **gsap**: Animaciones
- **postcss**: Procesamiento CSS

## 🎬 Páginas Implementadas

- [DONE] **Login** - Autenticación con animaciones
- [DONE] **Register** - Registro de nuevo usuario
- [DONE] **Dashboard** - Panel principal con estadísticas
- [DONE] **Upload** - Subida de documentos con drag & drop
- ⏳ **Document View** - Detalle de documento (próxima)
- ⏳ **Documents List** - Lista completa de documentos (próxima)

## 🔐 Autenticación

Sistema de sesiones implementado:
- Context API para estado global de autenticación
- ProtectedRoute para rutas privadas
- useAuth hook personalizado
- Redirección automática a login si no está autenticado

## [DESIGN] Animaciones GSAP

Animaciones suave en:
- Entrada de páginas (fade + slide)
- Transiciones entre rutas
- Interacciones con elementos (hover, drag)
- Indicadores de carga
- Progreso de subida

## 📱 Responsive Design

Breakpoints configurados:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## [PERFORMANCE] Performance

- Hot Module Replacement (HMR) con Vite
- Code splitting automático
- Lazy loading de componentes
- Optimización de imágenes

## 🐛 Desarrollo

El servidor de desarrollo corre en:
```
http://localhost:5173
```

Con auto-reload en cambios de archivo.

## [INFO] Notas Importantes

1. El backend debe estar corriendo en `http://localhost:8080`
2. Los logos deben ser transparentes para mejor integración
3. Todas las animaciones son suaves y sin performance hit
4. El diseño mantiene consistencia verde en toda la UI
5. Los componentes son modular para fácil extensión

## [LAUNCH] Próximos Pasos

1. [NOTE] **Sube tu logo** (3 versiones) en `src/assets/logos/`
2. ⏳ Implementar vista detallada de documentos
3. ⏳ Agregar página de biometría
4. ⏳ Crear página de firma digital
5. ⏳ Agregar notificaciones y toasts
6. ⏳ Implementar dark mode

---

**Estado**: Frontend 80% completado, esperando logo para finalización visual. [DESIGN]
