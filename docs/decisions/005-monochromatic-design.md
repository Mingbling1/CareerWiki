# ADR-005: Diseño Monocromático para Website

**Fecha:** 21 de febrero de 2026
**Estado:** Aceptado

## Contexto

Competidores como Glassdoor y levels.fyi usan diseños coloridos convencionales. Necesitamos diferenciarnos visualmente y establecer una identidad propia.

## Opciones Evaluadas

1. **Paleta colorida** (azul/verde) — Convencional, no se diferencia
2. **Monocromático** (negro/blanco/plata) — Elegante, diferenciador, color solo para impacto
3. **Dark mode full** — Demasiado oscuro para landing page

## Decisión

Diseño monocromático: la base es negros, blancos y platas. El color se reserva exclusivamente para "decir algo impactante" — por ejemplo, indicadores de cambio positivo (`text-green-600`) y gradientes de hover en cards de features.

**Cambios aplicados:**
- Shader background: `#3b82f6` → `#808080`
- Badges, gradientes de texto: azul → neutral-900/600/400
- Icons on hover: invertir a blanco sobre negro
- Checkmarks: `text-green-500` → `text-neutral-400`
- Footer, CTA, Cookie consent: todos neutrales

**Se mantienen intencionalmente:**
- Gradientes de hover por card en Features/UseCases (`from-blue-500 to-cyan-500`, etc.)
- Indicadores de stats (`+12%` en verde) — color con propósito

## Consecuencias

- **Positivo:** Identidad visual única y sofisticada
- **Positivo:** El color tiene significado cuando aparece
- **Positivo:** Consistencia visual más fácil de mantener
- **Negativo:** Puede parecer "frío" sin las micro-dosis de color
