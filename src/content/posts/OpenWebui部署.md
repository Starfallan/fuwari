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
:::note
以下配置文件来自于[](https://linux.do/t/topic/677664/)的讨论，经过测试可以正常使用。
:::

### 子配置文件 `/etc/nginx/conf.d/openwebui.conf`
```bash title="openwebui.conf"
server {
    listen 80 ; 
    listen 443 ssl; 
    http2 on;
    server_name chat.170529.xyz;  # 改域名
    access_log   /var/log/nginx/nginx.openwebui.access.log main;
    error_log    /var/log/nginx/nginx.openwebui.error.log;
    ssl_certificate      /etc/letsencrypt/live/chat.170529.xyz/fullchain.pem;
    ssl_certificate_key  /etc/letsencrypt/live/chat.170529.xyz/privkey.pem;
    # ==================== 性能優化配置 ====================
    client_max_body_size 1024M; 
    tcp_nopush on; 
    tcp_nodelay on; 
    keepalive_timeout 65s; 
    keepalive_requests 1000; 
    sendfile on; 
    sendfile_max_chunk 1m; 
    # ==================== 全域代理緩衝優化 ====================
    proxy_buffering on; 
    proxy_buffer_size 128k; 
    proxy_buffers 4 256k; 
    proxy_temp_file_write_size 512k; 
    proxy_busy_buffers_size 256k; 
    proxy_connect_timeout 60s; 
    proxy_send_timeout 60s; 
    proxy_read_timeout 60s; 
    # Gzip 壓縮
    gzip on; 
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss application/vnd.ms-fontobject font/ttf font/otf font/woff font/woff2 image/svg+xml; 
    gzip_min_length 1024; 
    gzip_comp_level 5; 
    gzip_http_version 1.1; 
    gzip_vary on; 
    gzip_proxied any; 
    # ==================== 品牌設置變數 ====================
    set $custom_logo_url https://img.170529.xyz/2025/05/favicon.png; 
    set $brand_name "Prometheus"; 
    set $brand_short_name "Prometheus"; 
    set $static_proxy_host img.170529.xyz; 
    set $icon_replacement_url '"https://img.170529.xyz/2025/05/favicon.png"'; 
    set $backend_host http://127.0.0.1:3000;     # port
    # 分層緩存策略變數
    set $immutable_cache "public, immutable, max-age=31536000"; # 1年永久緩存
    set $static_cache "public, max-age=86400"; # 24小時緩存
    set $static_cache_control "public, max-age=86400"; # 24小時緩存（兼容性變數）
    set $font_cache "public, max-age=604800"; # 7天緩存（字體可以久一點）
    set $icon_cache "no-cache, no-store, must-revalidate"; # 圖標無緩存，立即顯示
    set $html_cache "public, max-age=86400"; # 24小時緩存（OI的index.html較大7KB）
    # 強制 HTTPS 重定向
    if ($scheme = http) {
        return 301 https://$host$request_uri; 
    }
    # ==================== 優化緩存策略  ====================
    # 1. /_app/immutable/ - hash 文件名，永久緩存
    location ~ ^/_app/immutable/ {
        proxy_pass $backend_host; 
        expires max; 
        access_log off; 
        add_header Cache-Control $immutable_cache; 
        proxy_set_header Host $host; 
        proxy_set_header X-Real-IP $remote_addr; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Proto https; 
    }
    # 2. 字型文件 - 較長緩存 (7天，字體變化不大)
    location ~* ^/(assets|static)/.*\.(woff|woff2|ttf|eot)$ {
        proxy_pass $backend_host; 
        expires 7d; 
        access_log off; 
        add_header Cache-Control $font_cache; 
        proxy_set_header Host $host; 
        proxy_set_header X-Real-IP $remote_addr; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Proto https; 
    }
    # 3. /assets/ 和 /static/ 其他文件 - 24小時緩存 (文件名不唯一，不建議永久緩存)
    location ~* ^/(assets|static)/.*\.(js|css|jpg|jpeg|gif|webp)$ {
        proxy_pass $backend_host; 
        expires 1d; 
        access_log off; 
        add_header Cache-Control $static_cache; 
        proxy_set_header Host $host; 
        proxy_set_header X-Real-IP $remote_addr; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Proto https; 
    }
    # ==================== 圖標處理配置 ====================
    # 精確匹配重要圖標路徑 - 最高優先級（避免與正則匹配衝突）
    location = /static/favicon.png {
        resolver 1.1.1.1 valid=30s ipv6=off; 
        proxy_pass $custom_logo_url; 
        add_header Cache-Control $icon_cache; 
        proxy_ssl_server_name on; 
        proxy_ssl_name $static_proxy_host; 
        proxy_set_header Host $static_proxy_host; 
        proxy_set_header Referer ""; 
    }
    location = /static/favicon-96x96.png {
        resolver 1.1.1.1 valid=30s ipv6=off; 
        proxy_pass $custom_logo_url; 
        add_header Cache-Control $icon_cache; 
        proxy_ssl_server_name on; 
        proxy_ssl_name $static_proxy_host; 
        proxy_set_header Host $static_proxy_host; 
        proxy_set_header Referer ""; 
    }
    location = /static/apple-touch-icon.png {
        resolver 1.1.1.1 valid=30s ipv6=off; 
        proxy_pass $custom_logo_url; 
        add_header Cache-Control $icon_cache; 
        proxy_ssl_server_name on; 
        proxy_ssl_name $static_proxy_host; 
        proxy_set_header Host $static_proxy_host; 
        proxy_set_header Referer ""; 
        types {
        }
        default_type image/png; 
    }
    location = /favicon.ico {
        return 301 /static/favicon.png; 
    }
    # iOS Safari 根目錄 apple-touch-icon 處理（關鍵！）
    location = /apple-touch-icon.png {
        resolver 1.1.1.1 valid=30s ipv6=off; 
        proxy_pass $custom_logo_url; 
        add_header Cache-Control $icon_cache; 
        proxy_ssl_server_name on; 
        proxy_ssl_name $static_proxy_host; 
        proxy_set_header Host $static_proxy_host; 
        proxy_set_header Referer ""; 
        types {
        }
        default_type image/png; 
    }
    # iOS Safari 優先查找的 precomposed 圖標（關鍵！）- 精確匹配優先
    location = /apple-touch-icon-precomposed.png {
        resolver 1.1.1.1 valid=30s ipv6=off; 
        proxy_pass $custom_logo_url; 
        add_header Cache-Control $icon_cache; 
        proxy_ssl_server_name on; 
        proxy_ssl_name $static_proxy_host; 
        proxy_set_header Host $static_proxy_host; 
        proxy_set_header Referer ""; 
        types {
        }
        default_type image/png; 
    }
    # iOS 會自動查找的各種尺寸 apple-touch-icon
    location ~ ^/apple-touch-icon-([0-9]+x[0-9]+)\.png$ {
        resolver 1.1.1.1 valid=30s ipv6=off; 
        proxy_pass $custom_logo_url; 
        add_header Cache-Control $icon_cache; 
        proxy_ssl_server_name on; 
        proxy_ssl_name $static_proxy_host; 
        proxy_set_header Host $static_proxy_host; 
        proxy_set_header Referer ""; 
        types {
        }
        default_type image/png; 
    }
    # iOS 其他格式的 apple-touch-icon（兜底方案）
    location ~ ^/apple-touch-icon-.*\.png$ {
        resolver 1.1.1.1 valid=30s ipv6=off; 
        proxy_pass $custom_logo_url; 
        add_header Cache-Control $icon_cache; 
        proxy_ssl_server_name on; 
        proxy_ssl_name $static_proxy_host; 
        proxy_set_header Host $static_proxy_host; 
        proxy_set_header Referer ""; 
        types {
        }
        default_type image/png; 
    }
    location = /static/favicon.ico {
        resolver 1.1.1.1 valid=30s ipv6=off; 
        proxy_pass $custom_logo_url; 
        add_header Cache-Control $icon_cache; 
        proxy_ssl_server_name on; 
        proxy_ssl_name $static_proxy_host; 
        proxy_set_header Host $static_proxy_host; 
        proxy_set_header Referer ""; 
        types {
        }
        default_type image/x-icon; 
    }
    location = /static/favicon.svg {
        resolver 1.1.1.1 valid=30s ipv6=off; 
        proxy_pass $custom_logo_url; 
        add_header Cache-Control $icon_cache; 
        proxy_ssl_server_name on; 
        proxy_ssl_name $static_proxy_host; 
        proxy_set_header Host $static_proxy_host; 
        proxy_set_header Referer ""; 
    }
    # ==================== 圖標處理配置 ====================
    # 正則匹配其他圖標（排除已精確匹配的）
    location ~ ^/static/(logo|logo-dark|favicon-dark|android-chrome-192x192|android-chrome-512x512)\.png$ {
        resolver 1.1.1.1 valid=30s ipv6=off; 
        proxy_pass $custom_logo_url; 
        add_header Cache-Control $icon_cache; 
        proxy_ssl_server_name on; 
        proxy_ssl_name $static_proxy_host; 
        proxy_set_header Host $static_proxy_host; 
        proxy_set_header Referer ""; 
    }
    location ~ ^/static/(splash|splash-dark)\.png$ {
        resolver 1.1.1.1 valid=30s ipv6=off; 
        proxy_pass $custom_logo_url; 
        add_header Cache-Control $icon_cache; 
        proxy_ssl_server_name on; 
        proxy_ssl_name $static_proxy_host; 
        proxy_set_header Host $static_proxy_host; 
        proxy_set_header Referer ""; 
    }
    # 4. manifest.json - 無緩存確保圖標立即顯示
    location = /manifest.json {
        proxy_pass $backend_host; 
        proxy_set_header Host $host; 
        proxy_set_header X-Real-IP $remote_addr; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Proto https; 
        proxy_set_header Accept-Encoding ""; 
        # 圖標相關配置無緩存，確保立即顯示
        add_header Cache-Control $icon_cache always; 
        add_header Pragma "no-cache" always; 
        add_header Expires "Thu, 01 Jan 1970 00:00:00 GMT" always; 
        proxy_hide_header ETag; 
        proxy_hide_header Last-Modified; 
        sub_filter_types application/json application/manifest+json; 
        sub_filter_once off; 
        sub_filter '"name":"Open WebUI"' '"name":"$brand_name"'; 
        sub_filter '"short_name":"Open WebUI"' '"short_name":"$brand_short_name"'; 
        sub_filter '"/static/logo.png"' $icon_replacement_url; 
        sub_filter '"/static/logo-dark.png"' $icon_replacement_url; 
        sub_filter '"/static/favicon.png"' $icon_replacement_url; 
        sub_filter '"/static/favicon-96x96.png"' $icon_replacement_url; 
        sub_filter '"/static/apple-touch-icon.png"' $icon_replacement_url; 
        sub_filter '"/static/android-chrome-192x192.png"' $icon_replacement_url; 
        sub_filter '"/static/android-chrome-512x512.png"' $icon_replacement_url; 
    }
    # API 配置端點
    location = /api/config {
        proxy_pass $backend_host; 
        proxy_set_header Host $host; 
        proxy_set_header X-Real-IP $remote_addr; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Proto https; 
        proxy_set_header Accept-Encoding ""; 
        sub_filter_types application/json; 
        sub_filter_once off; 
        sub_filter '"name":"Open WebUI"' '"name":"$brand_name"'; 
        sub_filter '"short_name":"Open WebUI"' '"short_name":"$brand_short_name"'; 
    }
    # 認證相關 API
    location ~ ^/api/(v1/)?auths?/?$ {
        proxy_pass $backend_host; 
        proxy_set_header Host $host; 
        proxy_set_header X-Real-IP $remote_addr; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Proto https; 
        proxy_set_header Accept-Encoding ""; 
        sub_filter_types application/json; 
        sub_filter_once off; 
        sub_filter '"name":"Open WebUI"' '"name":"$brand_name"'; 
        sub_filter '"short_name":"Open WebUI"' '"short_name":"$brand_short_name"'; 
    }
    # 其他靜態資源 - 24小時緩存
    location ~* ^/static/.*\.(html|json|txt|xml)$ {
        proxy_pass $backend_host; 
        expires 1d; 
        access_log off; 
        add_header Cache-Control $static_cache; 
        proxy_set_header Host $host; 
        proxy_set_header X-Real-IP $remote_addr; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Proto https; 
    }
    # 通用靜態文件處理（排除圖標文件，避免衝突）
    location ~ ^/static/(?!.*\.(png|ico|svg)$).*$ {
        proxy_pass $backend_host; 
        expires 1d; 
        access_log off; 
        add_header Cache-Control $static_cache; 
        proxy_set_header Host $host; 
        proxy_set_header X-Real-IP $remote_addr; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Proto https; 
    }
    # WebSocket 代理
    location /ws/ {
        proxy_pass $backend_host; 
        proxy_http_version 1.1; 
        proxy_set_header Upgrade $http_upgrade; 
        proxy_set_header Connection "upgrade"; 
        proxy_set_header Host $host; 
        proxy_set_header X-Real-IP $remote_addr; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Proto https; 
        # WebSocket 特殊優化 - 覆蓋全域緩衝設置
        proxy_buffering off; 
        proxy_cache off; 
        proxy_connect_timeout 7d; 
        proxy_send_timeout 7d; 
        proxy_read_timeout 7d; 
        proxy_set_header X-Forwarded-Host $server_name; 
        proxy_set_header X-Forwarded-Server $host; 
        tcp_nodelay on; 
    }
    # 其他 API 端點
    location /api/ {
        proxy_pass $backend_host; 
        proxy_set_header Host $host; 
        proxy_set_header X-Real-IP $remote_addr; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Proto https; 
        proxy_set_header X-Forwarded-Host $server_name; 
        proxy_set_header Upgrade $http_upgrade; 
        proxy_set_header Connection $http_connection; 
        proxy_http_version 1.1; 
        # API 代理優化設置
        proxy_buffering on; 
        proxy_buffer_size 128k; 
        proxy_buffers 4 256k; 
        proxy_temp_file_write_size 512k; 
        proxy_busy_buffers_size 256k; 
        proxy_connect_timeout 60s; 
        proxy_send_timeout 60s; 
        proxy_read_timeout 60s; 
    }
    # ==================== SPA 路由處理 ====================
    # 5. SPA 特定路由 - 24小時緩存 (index.html較大7KB，使用適度緩存)
    location ~ ^/(auth|error|c/.+)$ {
        proxy_pass $backend_host; 
        add_header Cache-Control $html_cache; 
        proxy_set_header Host $host; 
        proxy_set_header X-Real-IP $remote_addr; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Proto https; 
        proxy_set_header X-Forwarded-Host $server_name; 
        proxy_set_header Upgrade $http_upgrade; 
        proxy_set_header Connection $http_connection; 
        proxy_http_version 1.1; 
        proxy_set_header Accept-Encoding ""; 
        sub_filter_types text/html application/json application/manifest+json; 
        sub_filter_once off; 
        sub_filter '<title>Open WebUI</title>' '<title>$brand_name</title>'; 
        sub_filter '"name":"Open WebUI"' '"name":"$brand_name"'; 
        sub_filter '"short_name":"Open WebUI"' '"short_name":"$brand_short_name"'; 
        sub_filter '<head>' '<head><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="$brand_name"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png"><link rel="manifest" href="/manifest.json?v=$date_gmt">'; 
        sub_filter '</body>' '<script>document.addEventListener("DOMContentLoaded",function(){var s=document.createElement("style");s.textContent="#sidebar{transition:all 0.5s cubic-bezier(0.3,0.3,0.2,1)!important;--tw-duration:0.5s;--tw-ease:cubic-bezier(0.3,0.3,0.2,1);}#sidebar[data-state=true]{animation:sidebarFade 0.4s ease-in forwards!important;}@keyframes sidebarFade{0%,30%{opacity:0;}100%{opacity:1;}}";document.head.appendChild(s);});</script></body>'; 
    }
    # 主要頁面代理 - index.html (24小時緩存，考慮到文件較大7KB)
    location / {
        proxy_pass $backend_host; 
        add_header Cache-Control $html_cache; 
        proxy_set_header Host $host; 
        proxy_set_header X-Real-IP $remote_addr; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Proto https; 
        proxy_set_header X-Forwarded-Host $server_name; 
        proxy_set_header Upgrade $http_upgrade; 
        proxy_set_header Connection $http_connection; 
        proxy_http_version 1.1; 
        proxy_set_header Accept-Encoding ""; 
        sub_filter_types text/html application/json application/manifest+json; 
        sub_filter_once off; 
        sub_filter '<title>Open WebUI</title>' '<title>$brand_name</title>'; 
        sub_filter '"name":"Open WebUI"' '"name":"$brand_name"'; 
        sub_filter '"short_name":"Open WebUI"' '"short_name":"$brand_short_name"'; 
        sub_filter '<head>' '<head><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="$brand_name"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png"><link rel="manifest" href="/manifest.json?v=$date_gmt">'; 
        sub_filter '</body>' '<script>document.addEventListener("DOMContentLoaded",function(){var s=document.createElement("style");s.textContent="#sidebar{transition:all 0.5s cubic-bezier(0.3,0.3,0.2,1)!important;--tw-duration:0.5s;--tw-ease:cubic-bezier(0.3,0.3,0.2,1);}#sidebar[data-state=true]{animation:sidebarFade 0.4s ease-in forwards!important;}@keyframes sidebarFade{0%,30%{opacity:0;}100%{opacity:1;}}";document.head.appendChild(s);});</script></body>'; 
    }
    # ==================== 完美的安全標頭設定 ====================
    add_header Strict-Transport-Security "max-age=31536000"; 
    add_header X-Frame-Options DENY always; 
    add_header X-Content-Type-Options nosniff always; 
    add_header X-XSS-Protection "1; mode=block" always; 
    add_header Referrer-Policy "strict-origin-when-cross-origin" always; 
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

## 4. 测试 Nginx 缓存是否生效

在配置完成后，可以通过以下几种方法测试缓存是否生效：

### 4.1 查看响应头中的缓存状态

1. 使用浏览器开发者工具（F12）打开网络面板
2. 刷新页面并查找对 `/api/models` 的请求
3. 在响应头中查看 `X-Cache-Status` 字段：
   - `MISS`: 表示请求未命中缓存，从上游服务器获取
   - `HIT`: 表示请求命中缓存，直接从缓存返回
   - `BYPASS`: 表示请求绕过了缓存
   - `EXPIRED`: 表示缓存已过期
   - `UPDATING`: 表示缓存正在更新

### 4.2 使用 curl 命令行工具测试

```bash
# 第一次请求，应该显示 MISS
curl -I -H "Host: chat.170529.xyz" https://chat.170529.xyz/api/models | grep X-Cache-Status

# 第二次请求，如果缓存有效，应该显示 HIT
curl -I -H "Host: chat.170529.xyz" https://chat.170529.xyz/api/models | grep X-Cache-Status
```

### 4.3 检查缓存文件

查看 Nginx 缓存目录中是否有文件生成：

```bash
# 查看缓存目录
ls -la /var/cache/nginx

# 检查缓存目录大小
du -sh /var/cache/nginx
```

### 4.4 查看 Nginx 缓存日志

如果你配置了缓存日志，可以查看日志来确认缓存状态：

```bash
# 查看 Nginx 访问日志
grep "X-Cache-Status" /var/log/nginx/nginx.openwebui.access.log
```

缓存成功的特征是：当你第一次访问某个资源时，`X-Cache-Status` 显示 `MISS`，而后续访问同一资源时显示 `HIT`，并且你会注意到第二次请求的响应时间明显缩短。