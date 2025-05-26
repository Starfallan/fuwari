import bcrypt from 'bcryptjs';

/**
 * 加密密码
 * @param password 原始密码
 * @returns 加密后的密码
 */
export function encryptPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

/**
 * 验证密码是否正确
 * @param password 输入的密码
 * @param storedPassword 存储的密码（可能是哈希值或明文）
 * @returns 是否匹配
 */
export function verifyPassword(password: string, storedPassword: string): boolean {
  // 如果存储的密码以 "$" 开头，则视为哈希值（bcrypt 哈希通常以 "$2a$" 开头）
  if (storedPassword.startsWith('$')) {
    return bcrypt.compareSync(password, storedPassword);
  }
  
  // 否则，直接比较明文密码
  return password === storedPassword;
}

/**
 * 生成会话令牌
 * @returns 随机生成的令牌字符串
 */
export function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
