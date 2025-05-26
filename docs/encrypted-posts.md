# 加密文章功能

本博客支持为文章设置密码保护，访问者需要输入正确密码才能查看完整内容。

## 创建加密文章

### 方式一：使用明文密码（简单但安全性较低）

直接在文章的 frontmatter 中添加密码：

```yaml
---
title: 我的加密文章
published: 2023-09-09
encrypted: true  # 启用加密
password: "your-password-here"  # 明文密码
---
```

### 方式二：使用哈希密码（推荐用于重要内容）

1. 首先生成文章密码的哈希值：

```bash
pnpm generate-password
```

2. 在文章的 frontmatter 中添加以下内容:

```yaml
---
title: 我的加密文章
published: 2023-09-09
encrypted: true  # 启用加密
password: "$2a$10$xxxxxx"  # 从上述命令生成的密码哈希
---
```

## 工作原理

- 使用 Astro 的静态 API 端点功能
- 自定义身份验证中间件进行密码验证 
- 在前端使用 localStorage 记住已解锁的文章
- 加密文章在列表中会显示🔒图标
- 自定义错误反馈而不触发浏览器原生的认证对话框

## 安全考虑

- 文章密码使用 bcrypt 算法加密存储
- 即使源码泄露，攻击者也无法轻易破解密码
- 密码验证完全在服务端进行
- 请为重要内容使用足够复杂的密码
