---
title: Pillow的AVIF 支持
published: 2025-07-31
description: '在折腾 Pillow 的过程中，艰难搞定了 AVIF 格式的支持'
image: 'https://img.170529.xyz/2025/07/image-1.avif'
tags: [Pillow, AVIF, 图像处理]
category: '技术'
draft: false 
lang: ''
---
>Cover Image: [Summertime🏝️(@Remmui)](https://www.pixiv.net/artworks/132791587)

# Pillow AVIF 支持

## 前言

之前在使用 Pillow 处理图像时，发现 AVIF 格式的支持并不完善。在查阅最新的 Pillow 文档后，发现Pillow在11.3.0版本中终于在已经内置了对 AVIF 格式的支持。

> Pillow 11.3.0 has now been released with AVIF support in the wheels.

但是在实际使用中，仍然遇到了一些问题。经过一番折腾，终于搞定了 AVIF 格式的支持。

省流版：有问题就尝试手动安装`libavif`库。再从pypi源安装Pillow。

## 实际使用

:::tip
因为我在前面的文章已经介绍过了我已经将Python切换到了Pixi进行管理。

所以以下命令，均为Pixi的命令。可以自行替换为pip命令。
:::

### 踩坑

首先我直接使用`pixi add pillow`安装了Pillow，结果发现 AVIF 格式的支持并没有生效。运行代码直接报错。于是使用检查代码查看Pillow的信息。

```bash
pixi run python -m PIL --report
```

报告内容显示：

```bash collapse={13-23}
pixi run python -m PIL --report
--------------------------------------------------------------------                                              
Pillow 11.3.0
Python 3.12.11 | packaged by conda-forge | (main, Jun  4 2025, 14:29:09) [MSC v.1943 64 bit (AMD64)]
--------------------------------------------------------------------
Python executable is D:\Code\Python\reduce_cloudfare_image\.pixi\envs\default\python.EXE
System Python files loaded from D:\Code\Python\reduce_cloudfare_image\.pixi\envs\default
--------------------------------------------------------------------
Python Pillow modules loaded from D:\Code\Python\reduce_cloudfare_image\.pixi\envs\default\Lib\site-packages\PIL
Binary Pillow modules loaded from D:\Code\Python\reduce_cloudfare_image\.pixi\envs\default\Lib\site-packages\PIL
--------------------------------------------------------------------
--- PIL CORE support ok, compiled for 11.3.0
--- TKINTER support ok, loaded 8.6
--- FREETYPE2 support ok, loaded 2.13.3
--- LITTLECMS2 support ok, loaded 2.17
--- WEBP support ok, loaded 1.6.0
*** AVIF support not installed
--- JPEG support ok, compiled for libjpeg-turbo 3.1.0
--- OPENJPEG (JPEG2000) support ok, loaded 2.5.3
--- ZLIB (PNG/ZIP) support ok, loaded 1.3.1
--- LIBTIFF support ok, loaded 4.7.0
*** RAQM (Bidirectional Text) support not installed
*** LIBIMAGEQUANT (Quantization method) support not installed
*** XCB (X protocol) support not installed
```

可以看到 AVIF 的支持并没有安装。

又因为在默认情况下，Pixi安装是从Conda Forge源获取的。我于是猜测可能是因为Conda Forge源的Pillow的wheel包没有包含 AVIF 的支持。

于是使用`pixi add --pypi pillow`命令从PyPI源安装Pillow。
发现还是不行,这就有点奇怪了。官方明确表示11.3.0版本已经内置了 AVIF 的支持。

### 解决方案

经过一番查找，发现是因为Pillow的AVIF支持依赖于`libavif`库，而这个库有可能没有被正确安装。于是建议手动安装`libavif`库。

```bash
pixi add libavif
```

安装完成后，再次运行报告命令，检查 AVIF 支持是否已安装。
就已经ok了。

注意，测试了下。从conda-forge源安装的pillow在手动安装libavif后，还是无法工作的。但是pypi源安装的pillow可以正常工作。

有点奇怪，但至少现在可以正常使用 AVIF 格式了。~~**开摆**~~。

```
--- AVIF support ok, loaded 1.3.0
```

## 总结

在使用 Pillow 处理图像时，AVIF 格式的支持虽然在11.3.0版本中已经内置。但从Conda Forge源安装的Pillow可能无法正常工作。建议从PyPI源安装，并手动安装`libavif`库以确保 AVIF 格式的支持。
