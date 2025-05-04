---
title: Nginx安装
published: 2025-04-13
description: 'Nginx安装指南，避免直接apt安装到旧版本'
image: ''
tags: [Nginx, Linux]
category: 'Linux'
draft: false 
lang: ''
---

## 1 清除旧版 Nginx（可选）

如果你的系统中之前安装过 Nginx，为了避免新旧版本冲突，建议先将其删除：

1备份现有的 Nginx 配置文件：

```
sudo mv /etc/nginx/ /etc/nginx.old/
```

2停止 Nginx 服务：

```
sudo systemctl stop nginx
```

3清除系统中所有旧的 Nginx 软件包：


```
sudo apt autoremove nginx* --purge 
```

完成这些准备工作后，我们就可以开始安装 Nginx 的新版本了。

## 2. 安装 Nginx

我们选择直接从 Nginx.org 的官方软件源来安装，这样可以立即获得 Nginx 的最新版本。

### 2.1 导入 GPG 密钥

1为了确保软件包的安全性，需要先下载并添加 Nginx 的 GPG 密钥：


```
curl -fSsL https://nginx.org/keys/nginx_signing.key | sudo gpg --dearmor | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null
```

2执行以下命令验证 GPG 密钥：

```
gpg --dry-run --quiet --import --import-options import-show /usr/share/keyrings/nginx-archive-keyring.gpg
```

![导入 Nginx 官方源 GPG 密钥](https://img.sysgeek.cn/img/2024/06/install-nginx-ubuntu-p3.png)

导入 Nginx 官方源 GPG 密钥

### 2.2 添加 Nginx 官方软件源

根据你的需要，为 Ubuntu 添加 Nginx 官方软件源（2 选 1）：

- **stable 稳定版**

```
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/ubuntu `lsb_release -cs` nginx" | sudo tee /etc/apt/sources.list.d/nginx.list
```

- **mainline 主线版**


```
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/mainline/ubuntu `lsb_release -cs` nginx" | sudo tee /etc/apt/sources.list.d/nginx.list
```

![为 Ubuntu 添加 Nginx 官方软件源](https://img.sysgeek.cn/img/2024/06/install-nginx-ubuntu-p4.png)

为 Ubuntu 添加 Nginx 官方软件源

### 2.3 设置 APT 优先使用 Nginx 官方源

为了确保 Nginx.org 的软件包优先级高于 Ubuntu 默认源或其他 PPA，还需要设置 APT Pin：
```
echo -e "Package: *\nPin: origin nginx.org\nPin: release o=nginx\nPin-Priority: 900\n" | sudo tee /etc/apt/preferences.d/99nginx
```

你将看到以下输出：

```
Package: *
Pin: origin nginx.org
Pin: release o=nginx
Pin-Priority: 900
```

![设置 nginx.org 源优先级](https://img.sysgeek.cn/img/2024/06/install-nginx-ubuntu-p5.png)

设置 nginx.org 源优先级

### 2.4 安装 Nginx

在「终端」中执行以下命令更新软件包列表，并安装 Nginx：

```
sudo apt update
sudo apt install nginx
```

![安装 Nginx](https://img.sysgeek.cn/img/2024/06/install-nginx-ubuntu-p6.png)

安装 Nginx

### 2.5 验证安装结果

安装完成后，可以通过以下命令查看 Nginx 版本，验证是否正确安装：

```
nginx -v
```

如果安装成功，你将看到类似以下的输出信息：


```
nginx version: nginx/1.26.1
```

![查看 Nginx 版本](https://img.sysgeek.cn/img/2024/06/install-nginx-ubuntu-p7.png)

查看 Nginx 版本

## 3. 管理 Nginx 服务

安装完成后，我们需要对 Nginx 服务进行管理：

### 3.1 检查服务状态

验证 Nginx 服务是否正常运行：

```
systemctl status nginx
```

![查看 Nginx 服务状态](https://img.sysgeek.cn/img/2024/06/install-nginx-ubuntu-p8.png)

查看 Nginx 服务状态

查看 Nginx 服务状态

### 3.2 启动、停止和重启服务

你可以根据需要，通过以下命令手动启动、停止或重启 Nginx 服务：


```
sudo systemctl start nginx    # 启动服务
sudo systemctl stop nginx     # 停止服务
sudo systemctl reload nginx   # 重新加载配置文件，不中断服务
sudo systemctl restart nginx  # 重启服务
```

### 3.3 设置开机自启动

为了方便使用，你可以设置 Nginx 服务随系统启动时自动启动：


```
sudo systemctl enable nginx   # 启用开机自启动
sudo systemctl disable nginx  # 禁止开机自启动
```