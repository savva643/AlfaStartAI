# Alfa Start AI — План разработки

## Phase 1: Основа (MVP) ✅

### Репозиторий и инфраструктура
- [x] README.md — документация проекта
- [x] PLAN.md — план разработки
- [x] Инициализация pnpm monorepo (pnpm-workspace.yaml)
- [x] Корневой package.json со скриптами
- [x] tsconfig.base.json
- [x] .eslintrc.cjs + Prettier конфигурация
- [x] .gitignore
- [x] .env.example
- [x] Пакет shared (общие типы и утилиты)

### Docker
- [x] Docker Compose для разработки (PostgreSQL + Redis)
- [x] Dockerfile для backend (многостадийная сборка)
- [x] Dockerfile для frontend (многостадийная сборка)
- [x] Nginx конфигурация
- [x] Docker Compose для production
- [x] Health checks для всех сервисов

### Backend: Fastify + Prisma
- [x] Инициализация apps/api
- [x] Fastify сервер с плагинами
- [x] Prisma схема (все таблицы)
- [ ] Миграции базы данных
- [x] Конфигурация (dotenv + Zod)
- [x] Pino логгер
- [x] Swagger документация
- [x] Обработка ошибок
- [x] CORS плагин

### Backend: Авторизация
- [x] Auth routes (register, login, me)
- [x] Auth service (хеширование паролей, JWT)
- [x] Auth middleware (JWT верификация)
- [x] Валидация через Zod

### Frontend: React + Vite
- [x] Инициализация apps/web
- [x] Vite конфигурация
- [x] TailwindCSS конфигурация
- [x] shadcn/ui установка и настройка
- [x] React Router конфигурация
- [x] React Query провайдер
- [x] Zustand store (auth)
- [x] API клиент (axios)

### Frontend: Авторизация
- [x] Login страница (Alfa стиль)
- [x] Register страница (Alfa стиль)
- [x] Auth guard (protected routes)
- [x] Токен management (access + refresh)

### Frontend: Layout
- [x] Sidebar навигация (Alfa красный акцент)
- [x] TopBar
- [x] Layout контейнер

### Frontend: Страницы
- [x] Dashboard страница (реальные данные)
- [x] Chat страница (реальный API)
- [x] Роутинг для всех страниц

## Phase 2: AI Система ✅

### LLM Abstraction
- [x] OpenRouter клиент (chat + streaming)
- [x] Интерфейс провайдера
- [x] Конфигурация модели (DEFAULT_MODEL)
- [x] Fallback механизм
- [x] Обработка ошибок LLM

### Агентская система
- [x] Базовый класс агента
- [x] Coordinator агент (маршрутизация по ключевым словам)
- [x] CEO агент
- [x] Business Planner агент
- [x] Finance агент
- [x] Marketing агент
- [x] Legal агент
- [x] Tax агент
- [x] Payments агент (естественные рекомендации Альфа)
- [x] Growth агент
- [ ] Система tools для агентов (вызов внешних API)

### AI Chat
- [x] Chat routes (send, list, get, delete)
- [x] Chat service (интеграция с координатором)
- [x] SSE для стриминга (Provider.chatStream)
- [x] Сохранение истории в PostgreSQL
- [x] Контекст беседы (последние 10 сообщений)
- [x] Frontend: Chat UI с реальным API
- [x] Frontend: Список бесед
- [x] Frontend: Индикация агента

## Phase 3: AI Фичи ✅

### Business Roadmap
- [x] Roadmap routes (generate, list, updateStep)
- [x] Roadmap service (AI-генерация 8-12 шагов)
- [x] Frontend: Roadmap страница

### Business Health Score
- [x] Health score routes
- [x] Health score service (AI-анализ 5 параметров)
- [x] Frontend: Health score с визуализацией

### Startup Checklist
- [x] Checklist routes (generate, list, toggleItem)
- [x] Checklist service (AI-генерация 15-20 пунктов)
- [x] Frontend: Интерактивный чек-лист

### Financial Forecast
- [x] Financial routes (forecast)
- [x] Financial service (AI-прогноз + юнит-экономика)
- [x] Frontend: Financial страница

### SWOT Analysis
- [x] SWOT routes (analyze)
- [x] SWOT service (AI-анализ)
- [x] Frontend: SWOT матрица

### Payment Recommendations
- [x] Payments routes (recommendations)
- [x] Payments service (AI-рекомендации Альфа-Банка)
- [x] Frontend: Карточки продуктов

## Phase 4: UX Фичи

### Tasks
- [x] Tasks routes (CRUD)
- [x] Tasks service
- [x] Frontend: Tasks страница

### Documents
- [x] Documents routes (generate, list, get, delete)
- [x] Documents service (AI-генерация: бизнес-план, питч-дек, маркетинг, финмодель)
- [x] Frontend: Documents страница

### Settings
- [ ] Settings routes
- [ ] Settings service
- [ ] Frontend: Settings страница

### Timeline
- [ ] Timeline routes
- [ ] Timeline service
- [ ] Frontend: Timeline страница

## Phase 5: Polish

### Анимации
- [x] Framer Motion анимации переходов
- [x] Микроинтеракции (hover, click)
- [x] Loading состояния
- [ ] Skeleton загрузки
- [ ] Toast уведомления

### Адаптивность
- [x] Desktop layout
- [x] Tablet layout
- [x] Mobile layout (sidebar сворачивается)

### Производительность
- [ ] Lazy loading страниц
- [ ] Оптимизация bundle size
- [ ] Кэширование (React Query + Redis)

### Качество кода
- [x] TypeScript strict mode
- [x] ESLint + Prettier
- [ ] Unit тесты (backend)
- [ ] Unit тесты (frontend)

### Documentation
- [x] Swagger API документация
- [x] README.md

## Phase 6: Deploy

### Production
- [ ] Prisma миграции
- [ ] SSL/TLS сертификаты
- [ ] CI/CD пайплайн (GitHub Actions)
- [ ] Database backups
- [ ] Мониторинг
