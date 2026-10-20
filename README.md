# PokéGuía · Guía Pokémon completa

Aplicación web progresiva (PWA) tipo guía Pokémon, con Pokédex, tabla de tipos, evoluciones,
movimientos, objetos, habilidades, generaciones, cartas TCG, comparador y constructor de
equipos. Estética cálida y minimalista, en español, con modo claro/oscuro y **funciona sin
conexión**.

## Características

- **Pokédex completa**: búsqueda con autocompletado, command palette (`Ctrl`/`⌘` + `K`),
  ficha detallada con stats, habilidades, efectividad de tipos, evoluciones, movimientos,
  gritos, sprites shiny y encuentros.
- **Tabla de tipos**: matriz de efectividad 18×18, fortalezas/debilidades e inmunidades.
- **Movimientos**: filtros por tipo, categoría y orden; detalle con efecto y precisión.
- **Objetos**: bolsa con sprites, filtro por bolsillo y descripción.
- **Habilidades**: efecto completo y Pokémon que las poseen.
- **Generaciones**: las nueve regiones con sus juegos y especies.
- **Cartas TCG**: expansiones, búsqueda y detalle de carta (ataques, debilidades, ilustrador).
- **Comparador**: hasta tres Pokémon lado a lado con resaltado del mejor stat.
- **Equipos**: constructor de hasta 6 miembros con movimientos, cobertura de tipos,
  debilidades compartidas y exportación/importación JSON y formato Showdown.
- **Favoritos e historial** persistentes.
- **PWA**: instalable, con service worker y caché offline.

## Tecnologías

- **React 19** + **Vite 8** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix UI)
- **TanStack Query** (datos), **Zustand** (estado persistente), **Framer Motion** (animaciones)
- **vite-plugin-pwa** / Workbox (service worker y offline)

## Fuentes de datos

| API | Uso |
| --- | --- |
| [PokéAPI](https://pokeapi.co) | Pokémon, especies, evoluciones, tipos, objetos, habilidades, generaciones |
| [Pokémon Showdown](https://pokemonshowdown.com) | Stats base, movimientos, learnsets, tiers |
| [TCGdex](https://tcgdex.dev) | Cartas del juego de cartas coleccionables |

Sprites vía [`PokeAPI/sprites`](https://github.com/PokeAPI/sprites).

## Requisitos

- Node.js 20+ (probado en v22)

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

> El service worker **no** se registra en modo `dev`. Para probar la PWA y el
> funcionamiento offline usa la build de producción.

## Build y previsualización

```bash
npm run build
npm run preview
```

`npm run preview` sirve la build en http://localhost:4173 (incluye service worker).

## Instalación como app

Con la app servida por HTTPS (o `localhost`), en Chrome/Edge aparece el botón
**Instalar** en la cabecera (arriba a la derecha). En iOS se instala desde
*Compartir → Añadir a pantalla de inicio*.

## Estructura

```
src/
  components/     UI compartida (layout, search, pokemon, tcg, ui)
  features/       Páginas por sección (home, detail, types, moves, ...)
  lib/            Clientes de API, hooks y utilidades
  stores/         Estado persistente (Zustand)
  styles/         Tokens y estilos globales
```

## Licencia

Proyecto personal con fines educativos. Pokémon © Nintendo / Game Freak / The Pokémon
Company. Los datos pertenecen a sus respectivas APIs.
