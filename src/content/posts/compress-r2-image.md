---
title: Cloudflare R2 图像压缩
published: 2025-07-31
description: '介绍一款 Cloudflare R2 图像压缩工具，支持多种格式图片批量压缩至 AVIF 格式'
image: 'https://img.170529.xyz/2025/07/20250731140249142.avif'
tags: [对象存储, Cloudflare, 图像处理, AVIF]
category: '技术'
draft: false 
lang: ''
---

>Cover Image: [「天外大合唱」耀嘉音x知更鸟(@若宫晴月)](https://www.pixiv.net/artworks/126959381)

# Cloudflare R2 图像压缩

## 前言

博客之前上传的图片都是直接上传到基于 Cloudflare R2 的图床的。并且早期都是直接上传的原图。随着时间的推移，发现原图的体积实在是太大了。导致网站加载速度变慢。所以需要对图片进行压缩。

## 工具介绍

为了实现对图片的压缩，在互联网上搜了下，看到了这样的一个帖子[开源一个压缩 Cloudfare R2 图片的工具](https://www.v2ex.com/t/1128967)。帖子中介绍了他开发的一个工具，支持将多种格式图片进行压缩。实现了全自动图片的下载、压缩、上传到 Cloudflare R2 的功能。

::github{repo="zhangchenchen/reduce_cloudfare_image"}

感谢原作者的贡献。

但是他开发的工具是将各种图片保持原格式分类进行压缩的，而我希望能够将所有图片统一压缩为 AVIF 格式。于是我对他的工具进行了改造，改为将图片转换为 AVIF 格式。并且在压缩过后，支持删除原图。

::github{repo="Starfallan/reduce_cloudfare_image"}

## 使用方法

具体的使用方法可以参考仓库中的Readme，这里就不在赘述。

## 结语

希望这个工具能够帮助到需要压缩 Cloudflare R2 图片的朋友们。如果有任何问题或者建议，欢迎在仓库中提出issue或者pr。实际测试了下，在压缩质量为85的时候，整体压缩率在85%左右。效果还是非常不错的。
