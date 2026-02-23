# ADR-001: Arquitectura Hexagonal para Backend

**Fecha:** Enero 2026
**Estado:** Aceptado

## Contexto

Necesitamos una arquitectura backend que sea testeable, mantenible y permita cambiar implementaciones (DB, auth, storage) sin tocar la lógica de negocio.

## Opciones Evaluadas

1. **MVC clásico** — Controller → Service → Repository directo
2. **Arquitectura Hexagonal (Ports & Adapters)** — Domain aislado, interfaces explícitas
3. **CQRS + Event Sourcing** — Overkill para MVP

## Decisión

Arquitectura Hexagonal. Estructura en 3 capas:

```
domain/          → Entidades + interfaces de repositorio (Ports)
application/     → Use Cases (orquestación)
infrastructure/  → Prisma repositories, HTTP controllers, Auth, Storage (Adapters)
```

## Consecuencias

- **Positivo:** El dominio no depende de Prisma, NestJS ni ningún framework
- **Positivo:** Tests unitarios de use cases sin DB real
- **Positivo:** Cambiar de Prisma a TypeORM = solo cambiar `infrastructure/persistence/`
- **Negativo:** Más archivos y boilerplate que MVC
- **Negativo:** Curva de aprendizaje para nuevos contributors

## Aplica a

- `apps/api/` — API principal
- `apps/empliq-scraper-api/` — Microservicio de scraping
