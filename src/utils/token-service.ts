// 存储解锁状态的Map，键为文章slug，值为访问令牌数组
type TokenStore = {
  [slug: string]: Set<string>;
};

// 保存文章的访问令牌
const tokenStore: TokenStore = {};

/**
 * 为文章添加访问令牌
 * @param slug 文章的slug
 * @param token 访问令牌
 */
export function addAccessToken(slug: string, token: string): void {
  if (!tokenStore[slug]) {
    tokenStore[slug] = new Set();
  }
  tokenStore[slug].add(token);
}

/**
 * 验证文章的访问令牌是否有效
 * @param slug 文章的slug
 * @param token 访问令牌
 * @returns 是否有效
 */
export function validateAccessToken(slug: string, token: string): boolean {
  return !!tokenStore[slug]?.has(token);
}

/**
 * 删除文章的访问令牌
 * @param slug 文章的slug
 * @param token 访问令牌
 */
export function removeAccessToken(slug: string, token: string): void {
  tokenStore[slug]?.delete(token);
}

/**
 * 清理所有过期的令牌（如果需要定时清理）
 */
export function cleanupTokens(): void {
  // 可以在这里实现基于时间的清理机制
}
