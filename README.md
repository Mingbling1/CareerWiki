# 📊 Organigrama Colaborativo - Sueldos Perú

Una aplicación open source para crear y gestionar organigramas de forma colaborativa en tiempo real, con gestión de sueldos integrada.

![Demo](https://via.placeholder.com/800x400?text=Organigrama+Colaborativo)

## ✨ Características

- 🔄 **Colaboración en Tiempo Real**: Múltiples usuarios pueden editar el organigrama simultáneamente
- 💾 **Sincronización Offline**: Los cambios se guardan localmente y se sincronizan cuando hay conexión
- 🎨 **Organigrama Visual**: Visualización interactiva con zoom, pan, expandir/colapsar
- 💰 **Gestión de Sueldos**: Seguimiento de salarios con estadísticas automáticas
- 📥 **Exportación**: Exporta el organigrama como imagen PNG o datos CSV
- 🔍 **Búsqueda**: Encuentra empleados rápidamente
- 📱 **Responsive**: Funciona en desktop y móvil

## 🛠️ Stack Tecnológico

### Frontend (Visualización)
- **[d3-org-chart](https://github.com/bumbeishvili/org-chart)** (1.1k ⭐): La librería más completa para organigramas con D3.js
  - Altamente personalizable
  - Soporte para expandir/colapsar nodos
  - Zoom, pan, centrar nodos
  - Exportación a imagen
  - Drag & Drop (con extensión)

### Colaboración en Tiempo Real
- **[Yjs](https://github.com/yjs/yjs)** (21k ⭐): CRDT framework para colaboración
  - Resolución automática de conflictos
  - Funciona offline
  - Escalable a miles de usuarios
  - Usado por: Notion, Linear, JupyterLab, etc.

- **[y-websocket](https://github.com/yjs/y-websocket)**: Provider WebSocket para sincronización
- **[y-indexeddb](https://github.com/yjs/y-indexeddb)**: Persistencia local

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sueldos-organigrama.git
cd sueldos-organigrama

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

La aplicación se abrirá en `http://localhost:3000`

## 📦 Estructura del Proyecto

```
sueldos-organigrama/
├── index.html              # HTML principal
├── package.json            # Dependencias
├── vite.config.js          # Configuración de Vite
├── src/
│   ├── main.js             # Punto de entrada de la aplicación
│   ├── collaborative-store.js  # Store colaborativo con Yjs
│   ├── utils.js            # Utilidades
│   └── styles.css          # Estilos
└── server/
    └── websocket-server.js # Servidor WebSocket propio (opcional)
```

## 🔧 Uso

### Agregar Empleados
1. Clic en "➕ Agregar Empleado"
2. Completa el formulario con nombre, cargo, departamento y sueldo
3. Selecciona a quién reporta
4. Clic en "Agregar"

### Editar Empleados
1. Clic en cualquier nodo del organigrama
2. Modifica los datos en el panel lateral
3. Clic en "Guardar"

### Colaboración
- Abre la aplicación en múltiples navegadores/pestañas
- Los cambios se sincronizan automáticamente
- El contador de usuarios muestra cuántos están conectados

## 🌐 Servidor WebSocket Propio

Para producción, se recomienda usar tu propio servidor WebSocket:

```bash
# Iniciar servidor WebSocket
npm run server
```

Luego actualiza la URL en `collaborative-store.js`:
```javascript
const WEBSOCKET_URL = 'ws://tu-servidor:1234';
```

### Opciones de Backend

1. **[y-websocket](https://github.com/yjs/y-websocket)**: Servidor simple incluido
2. **[Hocuspocus](https://tiptap.dev/docs/hocuspocus)**: Servidor extensible con auth, webhooks
3. **[Liveblocks](https://liveblocks.io/)**: Servicio gestionado (freemium)
4. **[PartyKit](https://www.partykit.io/)**: Serverless WebSocket

## 📚 Librerías Alternativas

### Para Organigramas

| Librería | Estrellas | Pros | Contras |
|----------|-----------|------|---------|
| [d3-org-chart](https://github.com/bumbeishvili/org-chart) | 1.1k ⭐ | Muy completo, personalizable | Curva de aprendizaje D3 |
| [react-organizational-chart](https://github.com/daniel-lundin/react-organizational-chart) | 400+ ⭐ | Simple, React nativo | Menos features |
| [OrgChart.js](https://github.com/nicedoc/orgchart) | 300+ ⭐ | Simple API | Menos activo |
| [GoJS](https://gojs.net/) | Comercial | Muy potente | Pago |

### Para Colaboración

| Librería | Estrellas | Tipo | Uso |
|----------|-----------|------|-----|
| [Yjs](https://github.com/yjs/yjs) | 21k ⭐ | CRDT | Estándar de facto |
| [Automerge](https://github.com/automerge/automerge) | 5.9k ⭐ | CRDT | Más simple API |
| [Liveblocks](https://liveblocks.io/) | SaaS | Servicio | Más fácil de integrar |
| [Socket.IO](https://socket.io/) | 60k ⭐ | WebSocket | Más bajo nivel |

## 🎯 Próximas Funcionalidades

- [ ] Drag & Drop para reorganizar nodos
- [ ] Historial de cambios (undo/redo)
- [ ] Cursores colaborativos en tiempo real
- [ ] Roles y permisos
- [ ] Importar desde CSV/Excel
- [ ] Diferentes vistas (vertical, horizontal, radial)
- [ ] Filtros por departamento/sueldo
- [ ] Comparación de sueldos por mercado
- [ ] Integración con APIs de datos salariales

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT © 2024

## 🔗 Links Útiles

- [Demo de d3-org-chart](https://stackblitz.com/edit/web-platform-o5t1ha)
- [Documentación de Yjs](https://docs.yjs.dev/)
- [Ejemplos de Yjs](https://github.com/yjs/yjs-demos)
- [SalariosPeru](https://www.salariosperu.com/) - Inspiración del proyecto
