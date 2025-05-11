---
title: OpenWebui部署
published: 2025-05-03
description: ''
image: ''
tags: [AI, Docker, Nginx, Linux]
category: 'AI'
draft: false 
lang: ''
---
# OpenWebui部署
## 1. 镜像部署（使用二开版）
```bash
services:
  core:
    environment:
      - ENABLE_OPENAI_API=False
      - OFFLINE_MODE=True
      - TZ=Asia/Shanghai
      - AZURE_AI_API_KEY="***REMOVED***"
      - AZURE_AI_ENDPOINT="***REMOVED***"
      - EZFP_ENDPOINT="https://ezfp.cn/"
      - EZFP_CALLBACK_HOST="https://ai.170529.xyz"
      - EZFP_KEY="xxx"
      - EZFP_PID="1"
      - CREDIT_NO_CREDIT_MSG="余额不足，请在 '设置-积分' 中充值"
      - USAGE_CALCULATE_MODEL_PREFIX_TO_REMOVE=""
      - USAGE_DEFAULT_ENCODING_MODEL="gpt-4o"
    image: ghcr.io/u8f69/open-webui:v0.6.5.16
    ports:
      - 3000:8080
    restart: unless-stopped
    volumes:
      - ./data:/app/backend/data
      - ./open-webui-assets-custom:/app/build/assets/custom
    command:
      - /bin/bash
      - -c
      - |
          cp /app/build/assets/custom/fonts/* /app/build/assets/fonts/
          cp /app/build/assets/custom/custom.css /app/build/assets/
          cp /app/build/assets/custom/custom.js /app/build/assets/
          sed -i 's|</head>|<link rel="stylesheet" href="/assets/custom.css"></head>|' /app/build/index.html
          sed -i 's|</body>|<script src="/assets/custom.js"></script></body>|' /app/build/index.html
          bash /app/backend/start.sh
    networks:
      - newapi

networks:
  newapi:
    external: true
```

## 2. 配置 Nginx （含有 websocket 和缓存加速）

### 主配置文件 `/etc/nginx/nginx.conf`
```bash
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    # 缓存配置
    proxy_cache_path /var/cache/nginx
        levels=1:2
        keys_zone=nginx_cache:1m
        max_size=100m
        inactive=24h
        use_temp_path=off;

    # 基本配置
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # 日志格式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log  /var/log/nginx/access.log  main;
    
    # 性能优化
    sendfile        on;
    keepalive_timeout  65;
    tcp_nodelay     on;
    
    # gzip压缩
    gzip  on;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 引入所有的配置文件
    include /etc/nginx/conf.d/*.conf;
}
```

### 子配置文件 `/etc/nginx/conf.d/openwebui.conf`
```bash
# 定义上游服务器
upstream openwebui {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    listen [::]:80;
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name chat.170529.xyz;

    # SSL 配置
    ssl_certificate      /etc/letsencrypt/live/chat.170529.xyz/fullchain.pem;
    ssl_certificate_key  /etc/letsencrypt/live/chat.170529.xyz/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头部
    add_header Strict-Transport-Security "max-age=31536000";
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # 日志
    access_log   /var/log/nginx/nginx.openwebui.access.log main;
    error_log    /var/log/nginx/nginx.openwebui.error.log;

    # HTTP 到 HTTPS 重定向
    if ($scheme = http) {
        return 301 https://$host$request_uri;
    }
    error_page 497 https://$host$request_uri;

    # ACME challenge
    location ^~ /.well-known/acme-challenge {
        allow all;
        root /usr/share/nginx/html;
    }

    # 拒绝访问隐藏文件
    location ~ /\. {
        deny all;
    }

    # models cache
    location /api/models {
        proxy_pass http://openwebui;
        proxy_cache nginx_cache;
        proxy_cache_key $request_uri;
        proxy_cache_valid 200 30m;
        proxy_cache_background_update on;
        proxy_cache_use_stale updating;
        proxy_cache_revalidate on;
        proxy_cache_min_uses 1;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header X-Cache-Status $upstream_cache_status;
    }

    # Static resources browser cache
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)(.*)$ {
        proxy_pass http://openwebui;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        expires 1d;
        add_header Cache-Control "public, no-transform";
    }

    # 反向代理配置 (通用)
    location / {
        proxy_pass http://openwebui;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 禁用流式响应缓冲 (SSE)
        proxy_buffering off;
        proxy_cache off;

        # 连接超时设置
        proxy_connect_timeout 3600s;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

## 3. 美化配置

> [!NOTE] 
> 参考来源 https://linux.do/t/topic/440439

1. 建立自定义文件夹 `open-webui-assets-custom`
2. 对应目录下建立 fonts 文件夹，文件夹中放自定义字体
3. 目录下建立 `custom.js` `custom.css`，具体配置看参考文献，仅修改字体配置

目录结构
```bash
open-webui-assets-custom/
    - fonts/
        - DankMono-Italic.woff2
        - DankMono-Regular.woff2
        - DingTalk-JinBuTi.woff2 
    - custom.css
    - custom.js
```
字体配置的修改
```bash
@font-face {
    font-family: 'Maple Mono Normal';
    src: url('../assets/fonts/MapleMonoNormal-Regular.woff2') format('woff2');
    font-display: swap;
    font-style: normal;
}
@font-face {
    font-family: 'Maple Mono Normal';
    src: url('../assets/fonts/MapleMonoNormal-Italic.woff2') format('woff2');
    font-display: swap;
    font-style: italic;
}

@font-face {
    font-family: 'LXGW';
    src: url('../assets/fonts/LXGWWenKaiMonoGBScreen.woff2') format('woff2');
    font-display: swap;
}
```