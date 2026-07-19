# Alfa Start AI

> AI-операционная система для молодых предпринимателей (17–25 лет), участвующих в Чемпионате Альфа-Банка.

## Видение

Alfa Start AI — это не просто AI-чат. Это полноценная операционная система, которая сопровождает предпринимателя от идеи создания бизнеса до устойчивого роста. Платформа демонстрирует стратегию, при которой AI естественно интегрирует платёжные продукты Альфа-Банка, помогая предпринимателям принимать обоснованные решения на каждом этапе бизнес-пути.

**Ключевой принцип:** Рекомендации продуктов Альфа-Банка появляются естественно, на основе контекста бизнеса. Никогда не реклама — только объяснение, почему продукт полезен в данной ситуации.

## Архитектура

### Обзор

```
┌─────────────────────────────────────────────────────────┐
│                      Nginx (80/443)                      │
│                   Reverse Proxy + Static                │
├──────────────────────┬──────────────────────────────────┤
│    Frontend (SPA)    │        Backend (API)             │
│   React 19 + Vite    │    Fastify + Prisma + Redis     │
│   shadcn/ui + Tailor │    BullMQ + LangChain           │
└──────────────────────┴──────────┬───────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              ┌─────┴─────┐ ┌────┴────┐ ┌──────┴──────┐
              │ PostgreSQL │ │  Redis  │ │  OpenRouter  │
              │  (5432)    │ │ (6379)  │ │    API       │
              └───────────┘ └─────────┘ └─────────────┘
```

### Принципы

- **Feature-based архитектура** — код организован по фичам, а не по типам файлов
- **Clean Architecture** — разделение на domain, application, infrastructure слои
- **SOLID** — каждый модуль имеет одну ответственность
- **Mono-repo** — единый репозиторий с workspace'ами

## Структура проекта

```
alfa-start-ai/
├── apps/
│   ├── web/                          # Frontend приложение
│   │   ├── src/
│   │   │   ├── app/                  # Providers,路由 конфигурация
│   │   │   ├── features/             # Feature-based модули
│   │   │   │   ├── auth/             # Авторизация
│   │   │   │   ├── chat/             # AI чат
│   │   │   │   ├── dashboard/        # Дашборд
│   │   │   │   ├── roadmap/          # Бизнес-дорожная карта
│   │   │   │   ├── health-score/     # Оценка здоровья бизнеса
│   │   │   │   ├── checklist/        # Чек-лист стартапа
│   │   │   │   ├── risk-analyzer/    # Анализатор рисков
│   │   │   │   ├── financial/        # Финансовый прогноз
│   │   │   │   ├── unit-economics/   # Юнит-экономика
│   │   │   │   ├── swot/             # SWOT-анализ
│   │   │   │   ├── competitors/      # Анализ конкурентов
│   │   │   │   ├── payments/         # Рекомендации платежей
│   │   │   │   ├── timeline/         # Таймлайн
│   │   │   │   ├── tasks/            # Задачи
│   │   │   │   ├── documents/        # Документы
│   │   │   │   └── settings/         # Настройки
│   │   │   ├── shared/               # Общие компоненты
│   │   │   │   ├── ui/               # shadcn/ui компоненты
│   │   │   │   ├── hooks/            # Переиспользуемые хуки
│   │   │   │   ├── lib/              # Утилиты
│   │   │   │   ├── api/              # API клиент
│   │   │   │   └── types/            # Общие типы
│   │   │   └── styles/               # Глобальные стили
│   │   ├── public/                   # Статические ассеты
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                          # Backend приложение
│       ├── src/
│       │   ├── app/                  # Fastify инстанс, plugins
│       │   │   ├── server.ts         # Entry point
│       │   │   ├── config/           # Конфигурация
│       │   │   └── plugins/          # Fastify плагины
│       │   │       ├── auth.ts       # JWT аутентификация
│       │   │       ├── cors.ts       # CORS
│       │   │       ├── swagger.ts    # Swagger документация
│       │   │       └── error.ts      # Обработка ошибок
│       │   │
│       │   ├── features/             # Feature-based модули
│       │   │   ├── auth/             # Авторизация
│       │   │   │   ├── auth.routes.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.schema.ts
│       │   │   │   └── auth.types.ts
│       │   │   ├── chat/             # AI чат
│       │   │   │   ├── chat.routes.ts
│       │   │   │   ├── chat.service.ts
│       │   │   │   ├── chat.schema.ts
│       │   │   │   └── chat.types.ts
│       │   │   ├── roadmap/          # Бизнес-дорожная карта
│       │   │   ├── health-score/     # Оценка здоровья
│       │   │   ├── checklist/        # Чек-лист
│       │   │   ├── risk/             # Анализ рисков
│       │   │   ├── financial/        # Финансы
│       │   │   ├── swot/             # SWOT
│       │   │   ├── competitors/      # Конкуренты
│       │   │   ├── payments/         # Платежные продукты
│       │   │   ├── tasks/            # Задачи
│       │   │   ├── documents/        # Документы
│       │   │   └── settings/         # Настройки
│       │   │
│       │   ├── ai/                   # AI слой
│       │   │   ├── llm/              # LLM абстракция
│       │   │   │   ├── client.ts     # OpenRouter клиент
│       │   │   │   ├── provider.ts   # Провайдер (OpenRouter)
│       │   │   │   ├── models.ts     # Модели
│       │   │   │   └── types.ts
│       │   │   ├── agents/           # AI агенты
│       │   │   │   ├── coordinator/  # Координатор
│       │   │   │   │   ├── coordinator.agent.ts
│       │   │   │   │   └── coordinator.prompt.ts
│       │   │   │   ├── ceo/          # CEO агент
│       │   │   │   ├── planner/      # Бизнес-планировщик
│       │   │   │   ├── finance/      # Финансовый аналитик
│       │   │   │   ├── marketing/    # Маркетинг
│       │   │   │   ├── legal/        # Юрист
│       │   │   │   ├── tax/          # Налоговый консультант
│       │   │   │   ├── payments/     # Платежные продукты
│       │   │   │   └── growth/       # Рост
│       │   │   ├── chains/           # LangChain цепочки
│       │   │   ├── prompts/          # Промпты
│       │   │   └── tools/            # Инструменты агентов
│       │   │
│       │   ├── shared/               # Общие утилиты
│       │   │   ├── db/               # Prisma клиент
│       │   │   ├── redis/            # Redis клиент
│       │   │   ├── queue/            # BullMQ очереди
│       │   │   ├── errors/           # Кастомные ошибки
│       │   │   ├── logger.ts         # Pino логгер
│       │   │   └── types.ts
│       │   │
│       │   └── workers/              # BullMQ воркеры
│       │       ├── ai-processing.worker.ts
│       │       ├── document-generation.worker.ts
│       │       └── notification.worker.ts
│       │
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                       # Общие типы и утилиты
│       ├── src/
│       │   ├── types/                # Общие TypeScript типы
│       │   └── constants/            # Константы
│       ├── package.json
│       └── tsconfig.json
│
├── docker/
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── Dockerfile
│   ├── api/
│   │   └── Dockerfile
│   └── web/
│       └── Dockerfile
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .eslintrc.cjs
├── .prettierrc
├── .env.example
└── .gitignore
```

## Технологический стек

### Frontend

| Технология | Версия | Назначение |
|---|---|---|
| React | 19 | UI фреймворк |
| Vite | 6 | Сборщик |
| TailwindCSS | 4 | CSS-утилиты |
| shadcn/ui | latest | UI-компоненты |
| Framer Motion | 12 | Анимации |
| React Query | 5 | Серверное состояние |
| React Router | 7 | Маршрутизация |
| Zustand | 5 | Клиентское состояние |
| Lucide React | latest | Иконки |
| TypeScript | 5.7 | Типизация |

### Backend

| Технология | Версия | Назначение |
|---|---|---|
| Node.js | 22 | Рантайм |
| Fastify | 5 | HTTP фреймворк |
| Prisma | 6 | ORM |
| PostgreSQL | 16 | База данных |
| Redis | 7 | Кэш + очереди |
| BullMQ | 5 | Очереди задач |
| JWT | — | Аутентификация |
| Swagger | — | API документация |
| Pino | 9 | Логирование |
| Zod | 3 | Валидация |
| LangChain | 0.3 | AI-оркестрация |
| OpenRouter | — | LLM API |

### AI Stack

| Компонент | Описание |
|---|---|
| OpenRouter | Абстракция над провайдерами LLM |
| LangChain | Оркестрация цепочек и агентов |
| Agents | Специализированные AI-агенты |
| Tools | Инструменты для работы с данными |

### Docker

| Компонент | Описание |
|---|---|
| Docker Compose | Оркестрация сервисов |
| Nginx | Reverse proxy + статика |
| Multi-stage builds | Оптимизация образов |

## AI Архитектура

### LLM Abstraction Layer

```typescript
// Конфигурация через переменные окружения
DEFAULT_MODEL=openai/gpt-4o
PROVIDER_API_KEY=sk-or-...
FALLBACK_MODEL=anthropic/claude-3.5-sonnet
```

**Абстракция:**
- Единый интерфейс для всех провайдеров
- Конфигурируемая модель через `DEFAULT_MODEL`
- Автоматический fallback при ошибке
- Поддержка моделей: OpenAI, Anthropic, Google, Mistral,开源 модели

### Агентская система

```
                    ┌─────────────────┐
                    │   Coordinator   │
                    │   (Маршрутиз.)  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────┴────┐         ┌────┴────┐         ┌────┴────┐
   │   CEO   │         │ Planner │         │Finance  │
   └─────────┘         └─────────┘         └─────────┘
        │                    │                    │
   ┌────┴────┐         ┌────┴────┐         ┌────┴────┐
   │Marketing│         │  Legal  │         │   Tax   │
   └─────────┘         └─────────┘         └─────────┘
        │                    │                    │
   ┌────┴────┐         ┌────┴────┐         ┌────┴────┐
   │Payments │         │ Growth  │         │ Risk    │
   └─────────┘         └─────────┘         └─────────┘
```

**Агенты:**

| Агент | Роль | Когда активируется |
|---|---|---|
| Coordinator | Маршрутизация запросов | Каждый запрос |
| CEO | Стратегические решения | Стратегия, видение |
| Business Planner | Бизнес-планы, roadmap | Планирование |
| Finance | Финансовые прогнозы, юнит-экономика | Финансы |
| Marketing | Маркетинговая стратегия | Продвижение |
| Legal | Юридические вопросы | Документы, регистрация |
| Tax | Налоговое планирование | Налоги, отчётность |
| Payments | Рекомендации платёжных продуктов | Интеграция платежей |
| Growth | Стратегия роста | Масштабирование |

**Координатор:**
- Анализирует контекст запроса
- Определяет, какие агенты должны ответить
- Может вызывать несколько агентов параллельно
- Агрегирует результаты
- Естественно интегрирует рекомендации платёжных продуктов

**Интеграция Alfa-Bank:**
- Агент Payments анализирует потребности бизнеса в платежах
- Рекомендации появляются только когда это уместно
- Всегда объясняется польза продукта
- Никогда не навязчивая реклама

## Backend Архитектура

### Слои

1. **Routes** — HTTP маршруты, валидация запросов
2. **Services** — Бизнес-логика
3. **Repositories** — Работа с данными (через Prisma)
4. **Workers** — Фоновые задачи (BullMQ)

### API Endpoints

```
POST   /api/auth/register          # Регистрация
POST   /api/auth/login             # Вход
POST   /api/auth/refresh           # Обновление токена
GET    /api/auth/me                # Текущий пользователь

POST   /api/chat                   # Отправить сообщение в чат
GET    /api/chat/history           # История чата
GET    /api/chat/conversations     # Список бесед
GET    /api/chat/conversations/:id # Беседа

POST   /api/roadmap/generate       # Генерация дорожной карты
GET    /api/roadmap                # Получить дорожную карту
PATCH  /api/roadmap/:stepId        # Обновить шаг

GET    /api/health-score           # Оценка здоровья бизнеса
GET    /api/checklist              # Чек-лист стартапа
PATCH  /api/checklist/:itemId      # Обновить элемент чек-листа

POST   /api/risk/analyze           # Анализ рисков
GET    /api/risk                   # Получить результаты анализа

POST   /api/financial/forecast     # Финансовый прогноз
GET    /api/financial              # Получить данные
POST   /api/financial/unit         # Юнит-экономика

POST   /api/swot/analyze           # SWOT-анализ
GET    /api/swot                   # Получить результаты

POST   /api/competitors/analyze    # Анализ конкурентов
GET    /api/competitors            # Получить результаты

GET    /api/payments/recommendations # Рекомендации продуктов

GET    /api/tasks                  # Список задач
POST   /api/tasks                  # Создать задачу
PATCH  /api/tasks/:id              # Обновить задачу

GET    /api/documents              # Список документов
POST   /api/documents/generate     # Генерация документа

GET    /api/settings               # Настройки
PATCH  /api/settings               # Обновить настройки
```

### Мидлвары

- **JWT Auth** — Аутентификация через JWT
- **Request Validation** — Zod-валидация
- **Error Handler** — Централизованная обработка ошибок
- **Rate Limiter** — Ограничение запросов
- **Request Logging** — Логирование запросов через Pino

## Frontend Архитектура

### UI Дизайн

- **Стиль:** Apple + Linear + Notion + Stripe
- **Цвета:** Минималистичная палитра с акцентами
- **Типографика:** Inter / системные шрифты
- **Анимации:** Framer Motion для плавных переходов
- **Адаптивность:** Mobile-first подход

### Состояние

- **Серверное:** React Query для данных с сервера
- **Клиентское:** Zustand для UI-состояния
- **Формы:** React Hook Form + Zod

### Маршрутизация

```
/login                    # Авторизация
/register                 # Регистрация
/dashboard                # Основной дашборд
/chat                     # AI чат
/roadmap                  # Дорожная карта
/health                   # Оценка здоровья
/checklist                # Чек-лист
/risks                    # Анализ рисков
/financial                # Финансы
/unit-economics           # Юнит-экономика
/swot                     # SWOT-анализ
/competitors              # Конкуренты
/payments                 # Платежные продукты
/timeline                 # Таймлайн
/tasks                    # Задачи
/documents                # Документы
/settings                 # Настройки
```

## Схема базы данных

### Таблицы

```sql
-- Пользователи
users
├── id            UUID PK
├── email         VARCHAR UNIQUE
├── password      VARCHAR (hashed)
├── name          VARCHAR
├── businessName  VARCHAR
├── businessType  VARCHAR
├── createdAt     TIMESTAMP
└── updatedAt     TIMESTAMP

-- Беседы
conversations
├── id            UUID PK
├── userId        UUID FK → users
├── title         VARCHAR
├── createdAt     TIMESTAMP
└── updatedAt     TIMESTAMP

-- Сообщения
messages
├── id            UUID PK
├── conversationId UUID FK → conversations
├── role          ENUM (user, assistant, system)
├── content       TEXT
├── agentType     VARCHAR
├── createdAt     TIMESTAMP
└── metadata      JSONB

-- Дорожная карта
roadmaps
├── id            UUID PK
├── userId        UUID FK → users
├── title         VARCHAR
├── description   TEXT
├── createdAt     TIMESTAMP
└── updatedAt     TIMESTAMP

roadmap_steps
├── id            UUID PK
├── roadmapId     UUID FK → roadmaps
├── title         VARCHAR
├── description   TEXT
├── order         INTEGER
├── status        ENUM (pending, in_progress, completed)
├── dueDate       TIMESTAMP
├── completedAt   TIMESTAMP
└── metadata      JSONB

-- Чек-лист
checklists
├── id            UUID PK
├── userId        UUID FK → users
├── title         VARCHAR
├── createdAt     TIMESTAMP
└── updatedAt     TIMESTAMP

checklist_items
├── id            UUID PK
├── checklistId   UUID FK → checklists
├── title         VARCHAR
├── description   TEXT
├── completed     BOOLEAN
├── category      VARCHAR
├── order         INTEGER
└── completedAt   TIMESTAMP

-- Задачи
tasks
├── id            UUID PK
├── userId        UUID FK → users
├── title         VARCHAR
├── description   TEXT
├── status        ENUM (todo, in_progress, review, done)
├── priority      ENUM (low, medium, high, urgent)
├── dueDate       TIMESTAMP
├── assignedTo    VARCHAR
├── createdAt     TIMESTAMP
└── updatedAt     TIMESTAMP

-- Документы
documents
├── id            UUID PK
├── userId        UUID FK → users
├── title         VARCHAR
├── type          VARCHAR
├── content       TEXT
├── format        ENUM (markdown, pdf, docx)
├── createdAt     TIMESTAMP
└── updatedAt     TIMESTAMP

-- Аналитика
analytics
├── id            UUID PK
├── userId        UUID FK → users
├── type          VARCHAR
├── data          JSONB
├── createdAt     TIMESTAMP
└── expiresAt     TIMESTAMP

-- Настройки
settings
├── id            UUID PK
├── userId        UUID FK → users
├── key           VARCHAR
├── value         JSONB
└── updatedAt     TIMESTAMP
```

## Установка

### Предварительные требования

- Node.js 22+
- pnpm 9+
- Docker + Docker Compose
- PostgreSQL 16 (или через Docker)
- Redis 7 (или через Docker)

### Быстрый старт

```bash
# Клонирование репозитория
git clone https://github.com/alfa-start/ai.git
cd ai

# Установка зависимостей
pnpm install

# Копирование переменных окружения
cp .env.example .env

# Запуск инфраструктуры (PostgreSQL + Redis)
docker compose -f docker-compose.dev.yml up -d

# Миграция базы данных
pnpm db:migrate

# Запуск в режиме разработки
pnpm dev
```

### Через Docker (полная сборка)

```bash
# Сборка и запуск всех сервисов
docker compose up --build

# Или в фоновом режиме
docker compose up --build -d
```

## Переменные окружения

```env
# === API ===
NODE_ENV=development
API_PORT=3001
API_HOST=0.0.0.0

# === Database ===
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/alfa_start_ai

# === Redis ===
REDIS_URL=redis://localhost:6379

# === JWT ===
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# === AI (OpenRouter) ===
OPENROUTER_API_KEY=sk-or-...
DEFAULT_MODEL=openai/gpt-4o
FALLBACK_MODEL=anthropic/claude-3.5-sonnet
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=4096

# === Frontend ===
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Alfa Start AI
```

## Development Workflow

### Команды

```bash
# Запуск всех сервисов
pnpm dev

# Только backend
pnpm dev:api

# Только frontend
pnpm dev:web

# Миграции
pnpm db:migrate
pnpm db:generate
pnpm db:seed

# Линтинг
pnpm lint
pnpm lint:fix

# Форматирование
pnpm format

# Тесты
pnpm test
pnpm test:watch

# Сборка
pnpm build
```

### Git Workflow

1. Ветка `main` — стабильная версия
2. Ветка `develop` — разработка
3. Feature-ветки: `feature/название-фичи`
4. Bugfix-ветки: `fix/название-бага`
5. PR с ревью перед мержем в `develop`

## Production Deployment

### Docker Compose (Production)

```bash
# Production сборка
docker compose -f docker-compose.yml up --build -d

# Проверка статуса
docker compose ps

# Логи
docker compose logs -f api
docker compose logs -f web
```

### Nginx

- Reverse proxy для API и статики
- SSL/TLS termination
- Gzip сжатие
- Кэширование статических ресурсов
- Rate limiting

### Мониторинг

- Pino логи → stdout
- Health check эндпоинты
- Docker health checks

## Код-стайл

### TypeScript

- Строгая типизация, нет `any`
- Interfacies для объектов, Types для union/intersection
- Zod для runtime-валидации

### Архитектура

- Feature-based организация кода
- Чистая архитектура: domain → application → infrastructure
- Dependency Injection через Fastify.decorate

### Форматирование

- Prettier: 2 одинарных кавычки, без точек с запятой, 100 символов
- ESLint: строгие правила TypeScript

### Компоненты (Frontend)

- Функциональные компоненты с хуками
- React Query для серверного состояния
- shadcn/ui для UI-компонентов
- Framer Motion для анимаций

### API (Backend)

- RESTful API
- Zod-валидация всех входных данных
- Pino логирование
- Централизованная обработка ошибок

## Дорожная карта

### Phase 1: Основа (MVP)
- [ ] Инициализация монорепозитория
- [ ] Docker-инфраструктура
- [ ] Backend: Fastify + Prisma + PostgreSQL
- [ ] Frontend: React + Vite + TailwindCSS
- [ ] Авторизация (JWT)
- [ ] AI чат с координатором

### Phase 2: AI Агенты
- [ ] LLM абстракция (OpenRouter)
- [ ] Система агентов
- [ ] Coordinator agent
- [ ] CEO agent
- [ ] Business Planner agent
- [ ] Finance agent
- [ ] Marketing agent
- [ ] Legal agent
- [ ] Tax agent
- [ ] Payments agent
- [ ] Growth agent

### Phase 3: Фичи
- [ ] Business Roadmap Generator
- [ ] Business Health Score
- [ ] Startup Checklist
- [ ] Risk Analyzer
- [ ] Financial Forecast
- [ ] Unit Economics
- [ ] SWOT Analysis
- [ ] Competitor Analysis
- [ ] Payment Product Recommendations

### Phase 4: UX
- [ ] Dashboard
- [ ] Timeline
- [ ] Tasks management
- [ ] Documents generation
- [ ] Settings

### Phase 5: Polish
- [ ] Анимации и микроинтеракции
- [ ] Адаптивность
- [ ] Оптимизация производительности
- [ ] SEO и мета-теги
- [ ] Error boundaries

## Лицензия

MIT

## Команда

Alfa Start AI — проект для Чемпионата Альфа-Банка.
