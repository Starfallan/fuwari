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

/**
 * 保存文章解锁状态到本地存储
 * @param slug 文章的slug
 * @param password 用于解锁的密码
 * @param expirationHours 过期时间（小时），默认3小时
 */
export function saveArticleUnlockStatus(slug: string, password: string, expirationHours: number = 3): void {
  const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();
  localStorage.setItem(`encrypted_post_${slug}`, JSON.stringify({
    password,
    expiresAt
  }));
}

/**
 * 检查文章解锁状态是否有效且未过期
 * @param slug 文章的slug
 * @returns 解锁信息对象，如果无效或已过期则返回null
 */
export function getValidArticleUnlockStatus(slug: string): { password: string, expiresAt: string } | null {
  try {
    const tokenKey = `encrypted_post_${slug}`;
    const authData = localStorage.getItem(tokenKey);
    
    if (!authData) return null;
    
    const auth = JSON.parse(authData);
    
    // 检查是否有密码和过期时间，并且未过期
    if (auth && auth.password && auth.expiresAt && new Date(auth.expiresAt) > new Date()) {
      return auth;
    }
    
    // 如果已过期，清除它
    localStorage.removeItem(tokenKey);
    return null;
  } catch (e) {
    console.error('检查文章解锁状态出错:', e);
    return null;
  }
}

/**
 * 清除文章的解锁状态
 * @param slug 文章的slug
 */
export function clearArticleUnlockStatus(slug: string): void {
  localStorage.removeItem(`encrypted_post_${slug}`);
}

/**
 * 获取文章解锁状态的过期时间格式化文本
 * @param slug 文章的slug
 * @returns 格式化的过期时间，如果不存在则返回null
 */
export function getUnlockExpirationTime(slug: string): string | null {
  const unlockStatus = getValidArticleUnlockStatus(slug);
  
  if (!unlockStatus || !unlockStatus.expiresAt) {
    return null;
  }
  
  try {
    const expiresAt = new Date(unlockStatus.expiresAt);
    // 格式化为：YYYY-MM-DD HH:MM:SS
    return expiresAt.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error('格式化过期时间出错:', e);
    return null;
  }
}
