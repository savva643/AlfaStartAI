# Production Deployment

## Server
- **IP:** 64.188.124.65
- **Domain:** alfa.necsoura.ru

## DNS Setup
Add A record:
```
Type: A
Name: alfa
Value: 64.188.124.65
TTL: 3600
```

## Deploy on Server

### 1. Upload files
```bash
scp -r ./* root@64.188.124.65:/opt/alfa-start-ai/
```

### 2. SSH into server
```bash
ssh root@64.188.124.65
cd /opt/alfa-start-ai
```

### 3. Run deployment
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. Verify
```bash
# Check services
docker ps

# Check API
curl http://localhost/health

# Check frontend
curl -I http://localhost
```

## Services
| Service | Container | Port |
|---------|-----------|------|
| Frontend + API | alfastart-nginx | 80 |
| API | alfastart-api | 3001 (internal) |
| PostgreSQL | alfastart-postgres | 5432 (internal) |
| Redis | alfastart-redis | 6379 (internal) |

## Access
- **Frontend:** http://alfa.necsoura.ru
- **API Docs:** http://alfa.necsoura.ru/docs
- **Health:** http://alfa.necsoura.ru/health

## Environment Variables
Set in docker-compose.yml or .env:
- `OPENROUTER_API_KEY` — AI provider key
- `JWT_SECRET` — JWT signing secret
- `DEFAULT_MODEL` — LLM model (default: llama-3.1-8b-instruct:free)
