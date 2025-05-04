---
title: NewAPi 部署
published: 2025-04-29
description: 'New API部署，使用了Veloera修改版'
image: ''
tags: [AI, Docker, Nginx, Linux]
category: 'AI'
draft: false 
lang: ''
---

# NewAPi 部署
## Docker 配置，使用bridge网络，使openwebui和new api直接连接
```bash
version: '3'

services:
  new-api: 
    image: ghcr.io/veloera/veloera:latest
    container_name: new-api
    restart: always
    command: --log-dir /app/logs
    ports:
      - "3001:3000"  # 修改外部端口为3001避免冲突
    volumes:
      - ./new-api-data:/data
      - ./new-api-logs:/app/logs
    environment:
      - SQL_DSN=root:123456@tcp(mysql:3306)/new-api
      - REDIS_CONN_STRING=redis://redis
      - TZ=Asia/Shanghai
    depends_on:
      - redis
      - mysql
    networks:
      - newapi
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O - http://localhost:3000/api/status | grep -o '\"success\":\\s*true' | awk -F: '{print $$2}'"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:latest
    container_name: redis
    restart: always
    networks:
      - newapi

  mysql:
    image: mysql:8.2
    container_name: mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: new-api
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - newapi

volumes:
  mysql_data:

networks:
  newapi:
    external: true
```
## Nginx 配置
```bash
server{
   server_name api.170529.xyz;  # 请根据实际情况修改你的域名
   location / {
          client_max_body_size  64m;
          proxy_http_version 1.1;
          proxy_pass http://localhost:4233;  # 请根据实际情况修改你的端口
          proxy_set_header Host $host;
          proxy_set_header X-Forwarded-For $remote_addr;
          proxy_cache_bypass $http_upgrade;
          proxy_set_header Accept-Encoding gzip;
          proxy_read_timeout 300s;  # GPT-4 需要较长的超时时间，请自行调整
   }
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.170529.xyz/fullchain.pem; # Cloudflare证书
    ssl_certificate_key  /etc/letsencrypt/live/api.170529.xyz/privkey.pem; # Cloudflare证书密钥
    
    # SSL配置参数（可选，但建议保留以确保安全性）
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
}
```