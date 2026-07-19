# Production Deployment

## Server
- **IP:** 64.188.124.65
- **Domain:** alfa.necsoura.ru
- **Port:** 80 (HTTPS)

## DNS Setup
Add A record:
```
Type: A
Name: alfa
Value: 64.188.124.65
TTL: 3600
```

## Deploy
```bash
ssh root@64.188.124.65
cd /opt/alfa-start-ai
chmod +x deploy.sh
./deploy.sh
```

## What deploy.sh does:
1. Installs certbot for SSL
2. Builds Docker containers
3. Pushes DB schema
4. Sets up Let's Encrypt SSL

## Port Conflict
If port 80 is occupied by another service, stop it manually first:
```bash
docker stop <container-using-port-80>
```

## Services
| Container | Port | Purpose |
|-----------|------|---------|
| alfastart-nginx | 80 | Frontend + API proxy |
| alfastart-api | internal | Backend API |
| alfastart-postgres | internal | Database |
| alfastart-redis | internal | Cache |

## Access
- **https://alfa.necsoura.ru** — Frontend
- **https://alfa.necsoura.ru/docs** — API Docs
- **https://alfa.necsoura.ru/health** — Health check

## SSL
Auto-configured by certbot. Auto-renewal via cron.
Manual renew: `certbot renew`
