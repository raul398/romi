# ROMI

**Video generation multitool** — genera y edita videos con IA desde un dashboard unificado. Soporta múltiples proveedores de generación en una misma interfaz.

## Stack

| Capa       | Tecnologías                                                              |
| ---------- | ------------------------------------------------------------------------ |
| Backend    | FastAPI + Motor (MongoDB) + Celery + WebSockets                         |
| Frontend   | React 19 + TypeScript + Vite + TailwindCSS + Zustand + React Query      |
| Infra      | Docker Compose (MongoDB, RabbitMQ, Redis)                               |
| Proveedores| Seedance 2.0, Kling 3.0, HappyHorse 1.0 (todos vía API)                |

## Funcionalidades

- **Text-to-Video** — generá video a partir de un prompt
- **Image-to-Video** — animate una imagen inicial con o sin imagen final
- **Edición** — extendé, hacé transiciones o aplicá estilos a videos existentes
- **Dashboard en tiempo real** — grilla de trabajos con actualización vía WebSocket
- **Múltiples modelos** — cambiá entre proveedores sin salir del modal

## Cómo arrancar

```bash
# 1. Clonar y entrar
git clone <repo-url>
cd romi

# 2. Configurar variables de entorno
cp .env.example .env
# Completá las API keys de los proveedores que quieras usar

# 3. Levantar todo
docker compose up --build
```

La app queda disponible en:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

## Estructura

```
romi/
├── backend/
│   └── app/
│       ├── api/          # Rutas: generate, jobs, websocket
│       ├── models/       # Esquemas y acceso a MongoDB
│       ├── providers/    # Integraciones con APIs de video
│       │   ├── fal_base.py    # Base para proveedores vía fal.ai
│       │   ├── seedance.py    # Seedance 2.0
│       │   ├── kling.py       # Kling 3.0
│       │   └── happyhorse.py  # HappyHorse 1.0
│       └── worker/       # Tareas asíncronas (Celery)
├── frontend/
│   └── src/
│       ├── pages/        # Dashboard, Txt2Video, Img2Video, Edit, JobView
│       ├── components/   # UI reutilizable
│       ├── lib/          # API client, utils
│       ├── stores/       # Estado global (Zustand)
│       └── types/        # Tipos TypeScript
└── docker-compose.yml
```

## Variables de entorno

| Variable               | Descripción                        |
| ---------------------- | ---------------------------------- |
| `MONGO_URI`            | Conexión a MongoDB                 |
| `KLING_ACCESS_KEY`     | API key de Kling                   |
| `KLING_SECRET_KEY`     | Secret key de Kling                |
| `HAPPYHORSE_API_KEY`   | API key de HappyHorse              |
| `FAL_KEY`              | API key de fal.ai (Seedance)       |
| `CELERY_BROKER_URL`    | RabbitMQ (por defecto local)       |
| `CELERY_RESULT_BACKEND`| Redis (por defecto local)          |

## Licencia

Uso interno.
