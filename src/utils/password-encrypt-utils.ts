/**
 * 密码加密解密工具
 * 基于 AES-256-CBC 加密算法
 */

/**
 * 加密文本内容
 * @param data 要加密的文本
 * @param key 密码
 * @returns 加密后的 base64 字符串
 */
export async function encrypt(data: string, key: string): Promise<string> {
	// 确保密钥长度为 32 字节（AES-256）
	const paddedKey = key.padEnd(32, "0").slice(0, 32);

	const dataBuffer = new TextEncoder().encode(data);
	const keyBuffer = new TextEncoder().encode(paddedKey);

	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		keyBuffer,
		{ name: "AES-CBC", length: 256 },
		false,
		["encrypt"],
	);

	const iv = crypto.getRandomValues(new Uint8Array(16));
	const encryptedData = await crypto.subtle.encrypt(
		{ name: "AES-CBC", iv },
		cryptoKey,
		dataBuffer,
	);

	// 将 IV 和加密数据合并
	const combinedData = new Uint8Array(iv.length + encryptedData.byteLength);
	combinedData.set(iv);
	combinedData.set(new Uint8Array(encryptedData), iv.length);

	return Buffer.from(combinedData).toString("base64");
}

/**
 * 解密文本内容（客户端使用）
 * @param data 加密的 base64 字符串
 * @param key 密码
 * @returns 解密后的文本
 */
export async function decrypt(data: string, key: string): Promise<string> {
	const paddedKey = key.padEnd(32, "0").slice(0, 32);

	const decoder = new TextDecoder();
	const dataBuffer = new Uint8Array(
		atob(data)
			.split("")
			.map((c) => c.charCodeAt(0)),
	);
	const keyBuffer = new TextEncoder().encode(paddedKey);

	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		keyBuffer,
		{ name: "AES-CBC", length: 256 },
		false,
		["decrypt"],
	);

	const iv = dataBuffer.slice(0, 16);
	const encryptedData = dataBuffer.slice(16);

	const decryptedData = await crypto.subtle.decrypt(
		{ name: "AES-CBC", iv },
		cryptoKey,
		encryptedData,
	);

	return decoder.decode(decryptedData);
}
