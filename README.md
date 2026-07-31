# Personal Trainer

Aplicación web personal, PWA instalable, para planificación adaptativa de entrenamiento. Sin backend obligatorio, sin suscripciones, sin IA de pago. Diseñada para uso diario en iPhone y desktop.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- React Router
- Zustand
- date-fns
- Lucide React
- vite-plugin-pwa
- Vitest

## Instalación

```bash
npm install
npm run dev
```

La app se sirve en `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Pruebas

```bash
npm test
```

## Lint

```bash
npm run lint
```

## Arquitectura

```
src/
  domain/
    models.ts        - Tipos TypeScript del dominio
    ruleEngine.ts    - Motor de reglas determinista
    ruleEngine.test.ts - Pruebas unitarias del motor
  repositories/
    interfaces.ts    - Interfaces para BackendRepository, CalendarProvider, AIProvider
    LocalRepository.ts - Implementación local con localStorage + IndexedDB
  store/
    useAppStore.ts   - Estado global con Zustand
  components/
    Layout.tsx       - Layout con sidebar desktop / bottom nav mobile
    InstallPrompt.tsx - Prompt de instalación PWA
  pages/
    TodayPage.tsx    - Pantalla principal: misión, check-in, resumen
    WeekPage.tsx     - Planificador semanal con reorganización
    RegisterPage.tsx - Registro rápido de Ladder, carrera, natación, recuperación
    ProgressPage.tsx - Peso, cumplimiento, fotos, sueño
    SettingsPage.tsx - Perfil, preferencias, exportar/importar
  hooks/
  App.tsx            - Rutas
  main.tsx           - Entry point
  index.css          - Tailwind + tema personalizado
```

## Pantallas

1. **Hoy**: Misión del día, check-in diario (<60s), recomendación transparente.
2. **Semana**: Vista lunes-domingo, reorganización con reglas, eventos manuales.
3. **Registrar**: Ladder, carrera, natación, recuperación. Capturas locales sin OCR.
4. **Progreso**: Peso, cintura, cumplimiento, sueño, fotos locales.
5. **Ajustes**: Perfil, objetivo, preferencias, export JSON, borrar datos.

## Reglas del motor

- Nunca dos días duros seguidos si fatiga/carga alta de piernas.
- Máximo 3 Ladder por semana.
- Si pierna pesada hoy/ayer: no intervalos de carrera en 24-36h.
- Si energía <=2, sueño <6h o dolor >=7: descanso activo.
- Carrera suave 25-45min. Natación 30-45min.
- Ladder siempre prioritario sobre cardio opcional.

## PWA e instalación

- Manifest configurado en `vite.config.ts`.
- Service worker con Workbox.
- Iconos en `public/`.
- En iPhone Safari: Compartir > Añadir a pantalla de inicio.

## Privacidad

Todos los datos se guardan localmente en el dispositivo (`localStorage` + `IndexedDB` para imágenes). No hay backend, no hay analytics, no hay claves API.

## Futuro (preparado pero no activo)

- Interfaces para `FutureGoogleCalendarProvider`, `FutureHealthDataImporter`, `AICoachProvider`.
- Estructura lista para migrar a Supabase sustituyendo `LocalRepository`.
- Apple Health y HealthKit: interfaces preparadas, sin implementación nativa.
- Análisis de capturas Ladder: placeholder documentado.

## Nota

Esta aplicación no sustituye asesoramiento médico o profesional.
