# Sueldos & Organigrama - Documentación

## 🎯 Visión del Proyecto

**Problema:** Las personas que buscan empleo no saben qué se necesita realmente para un puesto específico: experiencia, habilidades, exámenes, ni los rangos salariales reales.

**Solución:** Una plataforma colaborativa donde la comunidad construye conocimiento sobre puestos de trabajo, compartiendo:
- Requisitos reales del puesto
- Rangos salariales verificados
- Habilidades duras y blandas necesarias
- Experiencia en años típica
- Exámenes y evaluaciones comunes
- Consejos de personas que ya ocupan esos puestos

## 🏗️ Arquitectura

```
/apps
  /landing    → Next.js (página pública)
  /web        → Vite + React (aplicación del organigrama)
/server       → WebSocket server para colaboración en tiempo real
/docs         → Documentación del proyecto
```

## 📋 Funcionalidades Core (MVP)

### Organigrama Colaborativo
- [x] Agregar/editar/eliminar cargos
- [x] Vista en árbol jerárquico
- [x] Sincronización en tiempo real (Yjs + WebSocket)
- [x] Persistencia local (IndexedDB)
- [x] Exportar como PNG/JPEG

### Landing Page
- [ ] Hero con propuesta de valor
- [ ] Explicación de cómo funciona
- [ ] Call-to-action para empezar
- [ ] Footer con links

## 🎨 Diseño

- **Color principal:** Azul (#3b82f6)
- **Fondo:** Blanco
- **Estilo:** Minimalista, shadcn/ui
- **Tipografía:** Inter / System fonts

## 📚 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend Landing | Next.js 14 |
| Frontend App | React 19 + Vite |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Estado colaborativo | Yjs + y-websocket |
| Visualización | @xyflow/react (React Flow) |
| Persistencia | IndexedDB |

## 🚀 Próximos Pasos

1. **Fase 1 (Actual):** MVP del organigrama colaborativo
2. **Fase 2:** Sistema de autenticación y perfiles
3. **Fase 3:** Información detallada por puesto (salarios, requisitos)
4. **Fase 4:** Comunidad y contribuciones
