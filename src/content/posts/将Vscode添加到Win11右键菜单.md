---
title: 将Vscode添加到Win11右键菜单
published: 2025-06-13
description: '分享下如何将Vscode添加到Windows 11的右键菜单，方便快速打开文件夹或文件。'
image: 'https://img.170529.xyz/2025/06/20250613233130391.png'
tags: [开发, Vscode, Windows]
category: '折腾'
draft: false
lang: ''
---
Cover image：[鱼鹅BABA](https://space.bilibili.com/31923261/dynamic)

## 前言

VScode相信大家都用的，但是由于当初安装的时候没有勾选“将VScode添加到右键菜单”，导致现在想要在文件夹或文件上右键打开VScode时没有这个选项。今天就来分享一下如何将VScode添加到Windows 11的右键菜单。

目前网上的很多办法都是通过修改注册表来实现的，但是这种方法有点麻烦，而且只能添加到Win10的旧版右键菜单中。今天这个方法可以实现直接添加到Win11的新版右键菜单中。

## 方法来源

:::note
以下方法发现于官方 Issue

[[Meta] Enable windows 11 context menu by default in Stable](https://github.com/microsoft/vscode/issues/204696)
:::

BartoszRojek 在评论区分享了其开发的程序 [CodeModernExplorerMenu](https://github.com/BartoszRojek/CodeModernExplorerMenu)，用以一键添加在VScode中打开到Win11右键菜单，同时支持Insider版本。

![20250613234013443.png](https://img.170529.xyz/2025/06/20250613234013443.png)

## 具体使用方法

1. 下载 [CodeModernExplorerMenu](https://github.com/BartoszRojek/CodeModernExplorerMenu/releases)
2. 运行对应版本的msi文件。（可能需要关闭杀毒软件）
3. 完成后，重启 Windows资源管理器。

这样，你就可以在 Win11 的右键菜单中看到“在 Visual Studio Code 中打开”选项了。
![20250613234405328.png](https://img.170529.xyz/2025/06/20250613234405328.png)

### 补充

- 如果你的Vscode没有安装在默认路径（ C:\Program Files\Microsoft VS Code ），你需要先 Fork 该仓库，Fork 仓库后，编辑 `src/explorer_command.cc` 文件中的路径，提交更改后会自动触发构建。在 "Actions" 标签页中打开最新的构建，你可以在 Artifacts 里找到生成的 msi 文件。

    ```cpp title="src/explorer_command.cc" text {2}
     if (!std::filesystem::exists(module_path)) {
        std::filesystem::path fallback_path = std::filesystem::path("C:\\Program Files") / DIR_NAME / EXE_NAME;
        if (std::filesystem::exists(fallback_path)) {
            module_path = fallback_path;
        } else {
            return E_FAIL;
        }
    }
    ```

- 如果你需要自定义安装路径，一样是 Fork 项目后，在 `msi/RunOnInstall.ps1` 文件中修改对应文本。之后同样是等待 Actions 重新打包生成 msi 文件即可。

  ```cpp title="msi/RunOnInstall.ps1" text {3}
  $ProductName = 'Code Modern Explorer Menu'
  $ProductPath = "$Env:LOCALAPPDATA\Programs\$ProductName"
  $MenuName = "Open with Code"
  ```

以上的内容均来自于之前那个[Issue](https://github.com/microsoft/vscode/issues/204696)中软件作者的回答，经过翻译和整理。

## 结语

Vscode右键菜单打开貌似还是一笔烂账。但是通过以上的方法，不管是之前跟我一样忘了在安装的时候勾选“将Vscode添加到右键菜单”，还是莫名其妙消失了的用户，都可以方便地将其添加到右键菜单中，提高我们的开发效率。
