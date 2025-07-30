---
title: 升级Windows自带的OpenSSL
published: 2025-05-23
description: '由于在使用中发现Windows自带的OpenSSL版本过低，导致无法使用某些功能，因此决定升级OpenSSL。但升级过程有些曲折，记录一下。'
image: 'https://img.170529.xyz/2025/05/20250523180559414.avif'
tags: [技术, OpenSSL, Windows]
category: '技术'
draft: false 
lang: ''
---
> Cover image source: [鸦居](https://space.bilibili.com/7198052/dynamic)

## 背景

我在尝试使用抓包工具Charles时，教程中提到有一步需要使用`openssl x509 -inform pem -subject_hash_old -in charles.pem`命令来获取证书的指纹。由于Windows自带的OpenSSL版本过低，导致无法使用该命令，因此决定升级OpenSSL。

## 升级过程

1. 首先，访问[Shining Light Productions](https://slproweb.com/products/Win32OpenSSL.html)下载最新版本的OpenSSL，选择适合你系统的版本（32位或64位），并下载对应的安装包。
    - 或者使用winget命令安装：

    ```bash
    winget install -e --id ShiningLight.Light.OpenSSL
    ```

2. 下载完成后，点击对应的安装包进行安装。安装过程中，选择“Copy OpenSSL DLL files to: The Windows system directory”选项，这样可以将OpenSSL的DLL文件复制到Windows系统目录中，方便后续使用。

3. 接下来，需要将OpenSSL的bin目录添加到系统的环境变量中。右键点击“此电脑”，选择“属性”，然后点击“高级系统设置”，在“系统属性”窗口中点击“环境变量”。

4. 在“系统变量”中找到“Path”变量，选择后点击“编辑”，然后添加OpenSSL的bin目录，例如`C:\Program Files\OpenSSL-Win64\bin`。
    :::important
    如果你直接点击新增按钮并添加，你会发现还是使用的默认旧版本。

    所以你需要手动将对应的条目放置在最上面。以防止哪里第三方的OpenSSL版本覆盖你新安装的版本。
    :::
5. 完成后，打开命令提示符，输入`openssl version`，如果显示的是最新版本的OpenSSL，则说明升级成功。
