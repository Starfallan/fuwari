---
title: 记录Vercel的天坑测试环境
published: 2025-05-29
description: '记录Vercel的天坑测试环境，逆天Vercel的Preview环境测试完全不可靠'
image: 'https://img.170529.xyz/2025/05/20250529233537727.png'
tags: [技术, 吐槽, Vercel]
category: '技术'
draft: false 
lang: ''
---
> Cover Image [Coria](https://space.bilibili.com/7323950/dynamic)


## 前言

因为Fuwari没有自带加密博客的功能，但是觉得这个功能还是挺有用的，所以就想着自己实现一个。
于是就开始了Fuwari的加密博客功能的开发。在网上找到了对应的资料，并尝试着手实现。这就是[给Fuwari添加加密博客](https://blog.170529.xyz/posts/password-test/)。

自然，在开发新功能的时候，肯定是创建了一个测试分支，来进行测试和开发。而Vercel在检测到分支有更新时，会自动部署到预览环境。如图
![Vercel Preview Environment](https://img.170529.xyz/2025/05/20250529230208211.png)

## Vercel的坑爹Preview环境

因为本地测试没有问题，所以就想着在Vercel的预览环境上进行测试。毕竟这也不敢直接merge到主分支上。于是就开始了Vercel的预览环境测试。

自信满满，直接打开velcel，选择对应的deployment，点击预览环境的链接，发现加密文章的浏览非常正常。本来想着下班收工，可以直接合并到主分支，部署到生产环境了。

结果当我访问其他非加密文章时，发现页面直接报500了。
报错`Code: MIDDLEWARE_INVOCATION_FAILED`。

![](https://img.170529.xyz/2025/05/20250529230823351.png)

这下可好了，开始怀疑是不是要开启SSR（服务端渲染）还是哪里配置有问题。

然后就开始查后面。一开始查Vercel对这个问题的说明，发现没啥帮助，后面又看到Astro文档里说要添加Vercel适配器。就开始添加适配器。（一开始没加过，也是正常跑）

安装完适配器，发现还是一模一样的问题。继续查文档，发现Astro官网关于适配器的文档里有设置edgemiddleware的设置项，便又是添加对应的配置。

![](https://img.170529.xyz/2025/05/20250529231258182.png)

添加完配置后，重新部署，还是一样的问题。500错误。
这下我就彻底懵了。明明本地测试没问题，为什么Vercel的预览环境就不行了？难道是Vercel的Preview环境有问题？

于是随便打开了一个之前main分支的预览环境，发现也是500错误。这个时候我就开始怀疑Vercel的Preview环境是不是有问题。

那就只能实践出真知了，直接merge到主分支，看看生产环境会不会有问题。结果那就是一遍过。生产环境一切正常。真的是自己吓自己。。

## 总结

Vercel的Preview环境真的是一个天坑。完全不可靠，测试完全不靠谱。建议大家在开发新功能时，在本地测试完后做好措施，如果发现测试环境有问题，可以试试直接在生产环境测试。

毕竟Vercel的Preview环境可能会给你带来意想不到的麻烦。

当然，如果有哪位大佬知道Vercel的Preview环境到底出了什么问题，欢迎在评论区指导一二。
