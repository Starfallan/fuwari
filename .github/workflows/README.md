# 🔄 分支同步 GitHub Actions

本仓库添加了两个 GitHub Actions 工作流，用于自动和手动同步 `main` 分支到 `private` 分支。

## 📋 工作流说明

### 1. 自动同步 (`sync-main-to-private.yml`)

**触发条件:**

- 当有代码推送到 `main` 分支时自动触发
- 可以手动触发 (`workflow_dispatch`)

**功能特性:**

- ✅ 自动将 `main` 分支的更改合并到 `private` 分支
- ✅ 智能冲突检测，冲突时创建 Issue 通知
- ✅ 自动创建 `private` 分支（如果不存在）
- ✅ 防止无限循环（忽略 bot 推送）
- ✅ 详细的同步报告和日志

### 2. 手动同步 (`manual-sync.yml`)

**触发条件:**

- 仅手动触发，支持自定义参数

**功能特性:**

- ✅ 灵活的源分支和目标分支选择
- ✅ 强制同步选项（覆盖冲突）
- ✅ 自定义同步说明
- ✅ 详细的参数验证和错误处理

## 🚀 使用方法

### 自动同步

自动同步会在每次推送到 `main` 分支时自动运行，无需手动操作。

```bash
# 在 main 分支上进行开发
git checkout main
git add .
git commit -m "feat: 添加新功能"
git push origin main

# GitHub Actions 会自动将更改同步到 private 分支
```

### 手动同步

1. 在 GitHub 仓库页面，点击 **Actions** 标签
2. 选择 **手动同步分支** 工作流
3. 点击 **Run workflow** 按钮
4. 填写参数：
   - **源分支**: 通常选择 `main`
   - **目标分支**: 通常选择 `private`
   - **强制同步**: 如果存在冲突且希望强制覆盖，勾选此项
   - **同步说明**: 可选的说明文字

### 在 private 分支上添加加密文章

```bash
# 切换到 private 分支
git checkout private

# 添加加密文章
git add src/content/posts/my-private-post.md
git commit -m "docs: 添加新的加密文章"
git push origin private

# private 分支会通过 Vercel 部署到生产环境
```

## ⚙️ 配置说明

### Vercel 配置

`vercel.json` 文件已配置为使用 `private` 分支作为生产环境：

```json
{
  "git": {
    "productionBranch": "private"
  }
}
```

### 权限要求

GitHub Actions 需要以下权限：

- `contents: write` - 读写仓库内容
- `issues: write` - 创建 Issue（冲突通知）
- `pull-requests: write` - 创建 PR（可选）

这些权限通过 `GITHUB_TOKEN` 自动提供。

## 🔧 故障排除

### 常见问题

**Q: 同步失败，显示权限错误**
A: 检查仓库的 Actions 权限设置，确保允许 Actions 写入仓库。

**Q: 自动同步出现合并冲突**
A:

1. 检查创建的 Issue，按照说明手动解决冲突
2. 或者使用手动同步的强制模式

**Q: private 分支不存在**
A: 工作流会自动创建 `private` 分支，基于当前的 `main` 分支。

### 手动解决冲突

如果自动同步失败，可以手动解决：

```bash
# 1. 检出 private 分支
git checkout private

# 2. 尝试合并 main 分支
git merge main

# 3. 解决冲突文件（编辑冲突文件，删除冲突标记）
# 4. 添加解决后的文件
git add .

# 5. 提交合并
git commit -m "🔧 手动解决合并冲突"

# 6. 推送更改
git push origin private
```

## 📊 监控同步状态

### 查看同步历史

1. 在 GitHub 仓库页面，点击 **Actions** 标签
2. 查看 **同步 main 分支到 private 分支** 工作流的运行历史
3. 点击任一运行记录查看详细日志和报告

### 同步报告

每次同步成功后，工作流会生成详细的报告，包括：

- 同步的提交信息
- 更改统计
- 时间戳
- 任何警告或注意事项

## 🔐 安全考虑

1. **分支保护**: 建议为 `private` 分支设置分支保护规则
2. **访问控制**: 确保只有授权用户可以访问 `private` 分支
3. **敏感信息**: 不要在 `main` 分支中包含任何敏感信息
4. **定期审查**: 定期检查同步日志，确保没有意外的内容泄露

## 📞 支持

如果遇到问题或需要帮助：

1. 查看 Actions 运行日志
2. 检查本文档的故障排除部分
3. 创建 Issue 描述具体问题
