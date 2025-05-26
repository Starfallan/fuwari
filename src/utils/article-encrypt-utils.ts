import { encryptPassword } from './encrypt-utils';

/**
 * 加密文章密码
 * @param plainPassword 明文密码
 * @returns 加密后的密码哈希值
 */
export function encryptArticlePassword(plainPassword: string): string {
  return encryptPassword(plainPassword);
}

/**
 * 生成加密文章的frontmatter配置
 * @param plainPassword 明文密码
 * @param useHash 是否使用哈希加密（默认为true）
 * @returns frontmatter配置对象
 */
export function generateEncryptedFrontmatter(plainPassword: string, useHash: boolean = true) {
  return {
    encrypted: true,
    password: useHash ? encryptArticlePassword(plainPassword) : plainPassword
  };
}

/**
 * 检查文章是否已加密
 * @param frontmatter 文章的frontmatter数据
 * @returns 是否已加密
 */
export function isArticleEncrypted(frontmatter: any): boolean {
  return !!frontmatter.encrypted;
}

/**
 * 检查文章是否设置了有效的密码
 * @param frontmatter 文章的frontmatter数据
 * @returns 是否设置了有效密码
 */
export function hasValidPassword(frontmatter: any): boolean {
  return isArticleEncrypted(frontmatter) && !!frontmatter.password && frontmatter.password.length > 0;
}
