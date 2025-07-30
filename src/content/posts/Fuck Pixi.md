---
title: Fuck Pixi
published: 2025-06-04
description: '折腾了3个小时，结果你告诉我Pixi不支持在Global环境下使用Pypi！'
image: 'https://img.170529.xyz/2025/06/image.avif'
tags: [吐槽, Pixi, Python]
category: 'Python'
draft: false
lang: ''
---

> Cover Image [冷蝉](https://www.pixiv.net/artworks/82924488)

**Fuck!!!**
:::tip
温馨提示，本文无任何价值，纯纯输出情绪
:::

从11点打算随手装个thefuck在Global环境下

```bash
pixi global add --environment python3-12 thefuck
Error:   × Failed to determine virtual packages for environment python3-12
  ╰─▶ Cannot solve the request because of: No candidates were found for thefuck *.
```

很好，Conda下没有，那就Pypi吧

```bash
pixi global add --environment python3-12 thefuck --pypi
error: unexpected argument '--pypi' found

  tip: a similar argument exists: '--pypi-keyring-provider'

Usage: pixi.exe global add --environment <ENVIRONMENT> --pypi-keyring-provider <PYPI_KEYRING_PROVIDER> <PACKAGE>...

For more information, try '--help'.
```

报错，提示要使用`--pypi-keyring-provider`参数。那就继续研究吧。找到keyring章节，发现要配置keyring。

虽然对于我这种Python小白来说，还没用过keyring，但还是试着配置了一下。

```bash
pixi global install keyring
```

然后

```
keyring set https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple starfallen
```

结果报错，提示找不到`keyring`命令。我真的是艹了。试了各种方法，结果都不行。网上唯一有关的issue上只说了

With no Pixi changes, this now works. Some dependency of keyring pushed a broken version I guess.

在没有 Pixi 更改的情况下，这现在可以正常工作。我想是 keyring 的某个依赖推送了一个损坏的版本。

这就是说了没说。就这样一直尝试配置Keyring，尝试了换源，各种方法重装。反正明明对外暴露了`keyring`命令，结果就是找不到。

最后，又去找issue。我看看别人在Global上是如何安装pypi dependencies的。

结果就看到了[Allow pypi dependencies in global envs](https://github.com/prefix-dev/pixi/issues/2261)

![Issue](https://img.170529.xyz/2025/06/20250609172636492.avif)

这个issue，里面说了Pixia暂不支持在Global环境下使用Pypi。这一个不支持，就拖到了25年6月。还不支持！

希望支持的可以到对应Issue上点个赞，激励Pixi团队。

So，这几个小时就是纯纯的浪费。希望大家引以为戒，同时也希望Pixi能早日支持Global环境下的Pypi依赖。

最后，有没有人能告诉我，这个Keyring到底怎么配？清华源就没提过要keyring这件事。项目内pixi安装pypi依赖也没提过要配置keyring。来个大佬，救一救！
