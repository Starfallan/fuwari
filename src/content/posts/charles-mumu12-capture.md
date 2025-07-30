---
title: 使用Charles在MuMu12上进行抓包
published: 2025-05-23
description: '使用Charles在MuMu12上进行抓包'
image: 'https://img.170529.xyz/2025/05/20250523182426410.avif'
tags: [Charles, 模拟器]
category: '技术'
draft: false 
lang: ''
---
> Cover image source: [ATDAN](https://space.bilibili.com/355143/dynamic)

因为我使用的模拟器是MuMu12，所以需要在MuMu12中配置代理，使其能够通过Charles进行抓包。具体步骤如下：主要参考了[官网教程](https://mumu.163.com/help/20240814/40912_1174291.html)。

但是还是要额外补充一些要注意的点：

1. 教程中要使用`openssl x509 -inform PEM -subject_hash_old -in charles.pem`命令，win默认自带的OpenSSL版本过低，无法使用该命令。可以手动安装一个新的版本，具体步骤参考另一篇文章[《升级Windows自带的OpenSSL》](https://blog.170529.xyz/posts/升级windows的openssl)。
2. 文中adb连接地址为 `127.0.0.1:7555` ，但mumu12的adb默认端口为16384，故需要将连接地址修改为 `127.0.0.1:16384`。
3. 使用adb root命令时，注意到模拟器界面在弹出的授权框中需要点击“允许”才能获取root权限。

adb push c98c9e74.0 /system/etc/security/cacerts
.\adb shell "chmod 664 /system/etc/security/cacerts/c98c9e74.0"
