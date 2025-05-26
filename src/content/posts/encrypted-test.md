---
title: 加密测试文章
published: 2023-05-26
updated: 2023-05-26
tags:
  - 测试
  - 加密
category: 技术
encrypted: true
password: "12345678"  # 简单明文密码示例
description: 这是一篇测试加密功能的文章。需要输入密码才能查看完整内容。
---

# 这是一篇加密文章

恭喜你成功解锁了这篇加密文章！这表明我们的加密功能工作正常。

## 加密是如何工作的

在这篇文章中，我们使用了以下技术：

1. Astro 的静态 API 端点功能
2. Hono 的 Basic Auth 中间件
3. 前端的密码输入和验证组件
4. 本地存储来记住已解锁的文章

## 代码示例

```javascript
// 这是一个示例代码
function testEncryption() {
  console.log("加密文章已解锁！");
  return true;
}
```

## 图表示例

| 功能     | 实现方式              |
|--------|-------------------|
| 密码验证   | Basic Auth + bcrypt |
| 前端交互   | Svelte 组件          |
| API端点  | Astro API 路由       |
| 持久化存储  | localStorage       |

## 总结

通过这种方式，我们成功实现了博客文章的加密功能，既保证了内容的安全性，又提供了良好的用户体验。
