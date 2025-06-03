---
title: Pixi使用笔记
date: 2025-06-03
description: '在网上看到了Pixi的推荐，写一篇关于迁移和入门的笔记'
image: 'https://img.170529.xyz/2025/06/20250603201739875.png'
tags: [Pixi, Python, Conda]
category: 'Python'
draft: false
lang: ''
---
> Cover image [ASK](https://www.pixiv.net/artworks/114287760)

## Pixi使用笔记

### 1. 为何选择Pixi
以下是官网介绍：

Pixi is a **fast, modern, and reproducible** package management tool for developers of all backgrounds.

#### 1.1 性能
Pixi 集成了UV，是目前最为强大的Conda包管理工具。比Conda快10倍以上，在Python方面，UV更是比PIP快的不知道多少倍。像我一样厌烦了Conda和pip那蜗牛般速度的用户，Pixi是一个不错的选择。
如图
![Pixi性能对比](https://img.170529.xyz/2025/06/20250603190532875.png)

#### 1.2 隔离环境
pixi 可以为常用的 CLI 工具全局安装软件包，例如 git 、 bat 、 rg （ripgrep）、 bash 等。每个全局安装的工具都生活在其自己的隔离环境中，因此没有损坏“基础环境”的风险。
```bash title='Pixi Global'
$ pixi global install git bash ripgrep bat
✔ Installed package bash 5.2.21 h15d410d_0 from conda-forge
✔ Installed package ripgrep 14.1.0 h5ef7bb8_0 from conda-forge
✔ Installed package bat 0.24.0 h5ef7bb8_0 from conda-forge
  These executables are now globally available:
   -  bash
   -  bashbug
   -  rg
   -  bat
```

#### 1.3 不再需要激活
相信每个人都被Conda的激活和取消激活搞得头疼不已。Pixi没有“conda activate” / “conda deactivate”功能。相反，项目应该在一个 pixi.toml 中定义所有配置，并在项目文件夹中运行 pixi shell 或 pixi run 。Pixi 会自动发现环境，安装并激活它。再也不用担心conda激活污染终端的配置文件了。

现在都忘不了powershell折腾了conda activate搞了半天，成功后成功使powershell的启动慢到需要5,6秒。

#### 1.4 兼容性
Pixi可以一行命令实现从Conda迁移到Pixi
```bash title='Conda to Pixi migration'
pixi init --import ./environment.yml
```

### 2. 安装Pixi
Pixi的安装非常简单

```bash title="Pixi installation"
curl -fsSL https://pixi.sh/install.sh | bash
# or on Windows PowerShell
iwr -useb https://pixi.sh/install.ps1 | iex
```
### 3. Pixi入门
Pixi的入门非常简单，和Conda类似。Pixi使用`pixi`命令来管理包和环境。

 1. **初始化**

     ``` bash title="Initialize a Pixi workspace"
     //新建hello-world工作空间
     //也可以在当前目录直接Pixi init就行

     pixi init hello-world
     cd hello-world
     ```

 2. **添加依赖:**
    // 添加Python 3.12基础环境

     ``` bash
     pixi add python=3.12
     ```

 3. **添加依赖:**

     ``` bash
     pixi add cowpy
     ```

    如果对应包不在conda-forge中，可以使用pypi源

        ``` bash
        pixi add cowpy --pypi
        ```
 4. **直接运行:**

     ```
     pixi run python hello.py
     ```

    也可以使用pixi shell实现类似于conda activate后的效果

    ``` bash
    pixi shell

    python hello.py
    ```

 5. **添加任务:**
    Pixi有独有的任务管理功能，可以方便地添加和运行任务。
     ```
     pixi task add start python hello.py
     ```
     随后可以直接运行任务

     ```
     pixi run start
     ```
     ```
     ✨ Pixi task (start): python hello.py
      __________________
      < Hello Pixi fans! >
      ------------------
           \   ^__^
            \  (oo)\_______
               (__)\       )\/\
                 ||----w |
                 ||     ||
     ```

### 4.Pixi的自定义配置
以下配置为我个人的使用习惯，参考了官网的文档。[Pixi Configuration](https://pixi.sh/latest/reference/pixi_configuration/#configuration-options)
#### 4.1 自定义Pixi存储位置
Pixi默认的存储位置在C盘个人用户目录下的`.pixi`文件夹中，可以通过设置环境变量`PIXI_HOME`来修改。

我们可以使用`pixi info`命令查看当前的Pixi配置。

![](https://img.170529.xyz/2025/06/20250603194351032.png)
#### 4.2 修改缓存位置
经过上面的配置后，Pixi Global环境会使用新的存储位置，如上图，但是缓存位置还是在C盘

Pixi的缓存默认位置在C盘的`%LOCALAPPDATA%\rattler`文件夹中，可以通过设置环境变量`PIXI_CACHE`来修改。

#### 4.3 新建Global环境
不得不说，拥有一个独立的Global环境是非常有必要的。我们可以使用以下命令来创建一个新的Global环境：

```bash
pixi global install python=3.12 --environment python3-12 --expose python=python
```

上面的命令会创建一个名为`python3-12`的全局环境，并将Python 3.12暴露为`python`命令。这样的话，用户可以在任何地方使用`python`命令，而不必担心环境问题。

此外，如果你想要有多个版本的Python，可以使用以下命令来安装不同版本的Python：

```bash
pixi global install python=3.10 --environment python3-10 --expose python3.10=python
pixi global install python=3.11 --environment python3-11 --expose python3.11=python
```

在运行上述命令后，我们的系统上有 python3.10 和 python3.11 可用。