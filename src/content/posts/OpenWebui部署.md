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
```bash
# 注意：proxy_cache_path 指令必须放在 http 配置块中

http {
    proxy_cache_path /var/cache/nginx
        levels=1:2
        keys_zone=nginx_cache:1m
        max_size=100m
        inactive=24h
        use_temp_path=off;

    upstream openwebui {
        server 127.0.0.1:3000;
    }

    include       mime.types;
    default_type  application/octet-stream;
    keepalive_timeout  65;

    # 日志格式等其他 http 级别配置...
    # log_format main '...';

    server {
        listen 80;
        listen [::]:80;
        listen 443 ssl http2; # 合并 listen 指令
        listen [::]:443 ssl http2; # 合并 listen 指令
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
        add_header Strict-Transport-Security "max-age=31536000"; # 建议放在 HTTPS 配置部分
        add_header X-Frame-Options SAMEORIGIN;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy "strict-origin-when-cross-origin";

        # 日志
        access_log   /var/log/nginx/nginx.openwebui.access.log main;
        error_log    /var/log/nginx/nginx.openwebui.error.log;

        # HTTP 到 HTTPS 重定向 (应放在配置靠前的位置)
        if ($scheme = http) {
            return 301 https://$host$request_uri;
        }
        error_page 497 https://$host$request_uri; # 处理非标准端口的 HTTP 请求

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

            proxy_http_version 1.1; # 需要为 upgrade/connection
            proxy_set_header Upgrade $http_upgrade; # 传递 upgrade 头
            proxy_set_header Connection "upgrade"; # 传递 connection 头
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
            proxy_http_version 1.1; # 需要为 upgrade/connection
            proxy_set_header Upgrade $http_upgrade; # 支持 Websockets
            proxy_set_header Connection "upgrade"; # 支持 Websockets
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme; # 传递原始协议

            # 禁用流式响应缓冲 (SSE)
            proxy_buffering off;
            proxy_cache off; # 此 location 不缓存

            # 连接超时 (1 小时，请确认是否必要，特别是 connect/send)
            proxy_connect_timeout 3600s; # 连接后端超时
            proxy_read_timeout 3600s;    # 读取后端响应超时 (SSE 可能需要较长)
            proxy_send_timeout 3600s;     # 发送请求到后端超时
            # keepalive_timeout 3600; # 此指令不适用于 proxy，应在 http/server 设置客户端 keepalive
        }

        # index 指令通常在不使用 proxy_pass 时生效，此处可以移除或注释掉
        # index index.php index.html index.htm default.php default.htm default.html;

        # 移除 server 级别的 proxy_set_header，已在 location 中处理
        # proxy_set_header Host $host;
        # proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # proxy_set_header X-Forwarded-Host $server_name;
        # proxy_set_header X-Real-IP $remote_addr;
        # proxy_http_version 1.1;
        # proxy_set_header Upgrade $http_upgrade;
        # proxy_set_header Connection $http_connection;
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