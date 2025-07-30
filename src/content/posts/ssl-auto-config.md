---
title: Certbot自动配置SSL证书
published: 2025-04-19
description: '使用Certbot自动生成Let’s Encrypt证书'
image: ''
tags: [Certbot, Linux]
category: 'Linux'
draft: false 
lang: ''
---


用Certbot来自动生成Let’s Encrypt证书这件事儿，虽然官方和网上已经有了很详实的文档了，但是我还是想自己记录下，留作以后备查吧。

本文用的操作系统是ubuntu 20.04，DNS的话用的是Cloudflare的服务，web服务使用nginx来提供。然后，按照以下步骤进行就可以了。

## 安装Certbot

用以下命令安装就可以了，某些时候snap install的时候可能比较慢，有时候还可能需要重试几次：

```python
apt install snapd  
snap install core  
snap refresh core  
snap install --classic certbot
```

安装完成后，运行下`certbot --version`命令，如果有版本号输出，就表明安装成功了。

## 安装Cloudflare插件

为了实现自动化地续签证书，需要安装下对应DNS服务商的插件才可以。我使用Cloudflare来做DNS解析，所以可以使用以下的命令来安装Cloudflare插件：

```python
snap set certbot trust-plugin-with-root=ok  
  
snap install certbot-dns-cloudflare
```

## 设置Cloudflare API令牌

要使用Cloudflare插件，需要先登录到Cloudflare控制台来生成一个仅可操作DNS解析的API 令牌。可在登录Cloudflare后，跳转到这个地址来进行创建：[https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)

以下是操作过程的简单演示：

[![XHvupd.png|700](https://s1.ax1x.com/2022/06/16/XHvupd.png)](https://imgtu.com/i/XHvupd)

[![XHvmfH.png|700](https://s1.ax1x.com/2022/06/16/XHvmfH.png)](https://imgtu.com/i/XHvmfH)

[![XHvete.png|700](https://s1.ax1x.com/2022/06/16/XHvete.png)](https://imgtu.com/i/XHvete)

创建完成后记得将出现的令牌复制下来。然后使用以下命令来创建配置文件：
```bash
mkdir -p ~/.secrets/certbot  
  
vim ~/.secrets/certbot/cloudflare.ini
```
填入如下格式的配置就可以了：

```bash
dns_cloudflare_api_token = 刚才获取到的API令牌
```

编辑完成后，可以修改下这个文件的权限，否则执行certbot命令时会报一个警告说文件权限不安全：
```bash
chmod 600 ~/.secrets/certbot/cloudflare.ini
```
## 获取证书

现在通过运行以下的命令就可以生成nginx所需的证书了：
```bash
certbot certonly --dns-cloudflare --dns-cloudflare-credentials ~/.secrets/certbot/cloudflare.ini --dns-cloudflare-propagation-seconds 60 -d api.170529.xyz
```
注意，这里用了`--dns-cloudflare-propagation-seconds 60`把等待时间延长到了60秒，否则默认的10秒有些时候会导致校验失败。

生成的证书和私钥会放到/etc/letsencrypt/live/YOUR_HOST目录下。


```bash 
ssl_certificate /etc/letsencrypt/live/knktc.com/fullchain.pem; # managed by Certbot  
ssl_certificate_key /etc/letsencrypt/live/knktc.com/privkey.pem; # managed by Certbot  
```

## 定时任务

通过以下命令可以查看certbot的定时任务是否添加成功了：
```bash
systemctl list-timers
```
如果要在每次生成新的证书后自动reload下nginx，可以加个hook脚本：
```bash
vim /etc/letsencrypt/renewal-hooks/post/reload-nginx
```
加入以下的脚本：
```bash
#!/bin/sh  
  
systemctl reload nginx
```
然后给这个脚本文件加上权限：
```bash
chmod +x /etc/letsencrypt/renewal-hooks/post/reload-nginx
```
这样的话，每次生成新的证书后，就会自动reload下nginx让新的证书生效了。