#!/usr/bin/env node

import crypto from 'crypto';

/**
 * 生成随机密码的工具脚本
 * 用于为博客文章生成安全的密码
 */

// 配置选项
const DEFAULT_LENGTH = 12;
const CHARSET = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * 生成随机密码
 * @param {number} length 密码长度
 * @param {object} options 选项
 * @returns {string} 生成的密码
 */
function generatePassword(length = DEFAULT_LENGTH, options = {}) {
    const {
        includeUppercase = true,
        includeLowercase = true, 
        includeNumbers = true,
        includeSymbols = false,
        excludeSimilar = true
    } = options;

    let charset = '';
    if (includeLowercase) charset += CHARSET.lowercase;
    if (includeUppercase) charset += CHARSET.uppercase;
    if (includeNumbers) charset += CHARSET.numbers;
    if (includeSymbols) charset += CHARSET.symbols;

    if (excludeSimilar) {
        // 排除容易混淆的字符
        charset = charset.replace(/[0O1lI]/g, '');
    }

    if (charset.length === 0) {
        throw new Error('至少需要包含一种字符类型');
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charset.length);
        password += charset[randomIndex];
    }

    return password;
}

/**
 * 显示帮助信息
 */
function showHelp() {
    console.log(`
🔐 密码生成工具 - Fuwari 博客

用法:
  node generate-password.js [options]

选项:
  -l, --length <number>     密码长度 (默认: ${DEFAULT_LENGTH})
  -s, --symbols            包含特殊符号
  --no-uppercase           不包含大写字母
  --no-lowercase           不包含小写字母
  --no-numbers            不包含数字
  --include-similar       包含容易混淆的字符 (0, O, 1, l, I)
  -h, --help              显示此帮助信息

示例:
  node generate-password.js                    # 生成默认12位密码
  node generate-password.js -l 16              # 生成16位密码
  node generate-password.js -s                 # 包含特殊符号
  node generate-password.js -l 20 -s           # 生成20位包含符号的密码
`);
}

// 解析命令行参数
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        length: DEFAULT_LENGTH,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
        excludeSimilar: true
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '-h':
            case '--help':
                showHelp();
                process.exit(0);
                
            case '-l':
            case '--length':
                if (i + 1 >= args.length) {
                    console.error('❌ 错误: --length 需要指定一个数值');
                    process.exit(1);
                }
                const length = parseInt(args[++i]);
                if (isNaN(length) || length < 1) {
                    console.error('❌ 错误: 密码长度必须是正整数');
                    process.exit(1);
                }
                options.length = length;
                break;
                
            case '-s':
            case '--symbols':
                options.includeSymbols = true;
                break;
                
            case '--no-uppercase':
                options.includeUppercase = false;
                break;
                
            case '--no-lowercase':
                options.includeLowercase = false;
                break;
                
            case '--no-numbers':
                options.includeNumbers = false;
                break;
                
            case '--include-similar':
                options.excludeSimilar = false;
                break;
                
            default:
                console.error(`❌ 错误: 未知选项 '${arg}'`);
                console.log('使用 --help 查看可用选项');
                process.exit(1);
        }
    }

    return options;
}

// 主函数
function main() {
    try {
        const options = parseArgs();
        const password = generatePassword(options.length, options);
        
        console.log(`\n🔐 生成的密码: ${password}`);
        console.log(`📏 长度: ${password.length} 位`);
        
        // 显示字符组成
        const composition = [];
        if (options.includeLowercase) composition.push('小写字母');
        if (options.includeUppercase) composition.push('大写字母');
        if (options.includeNumbers) composition.push('数字');
        if (options.includeSymbols) composition.push('特殊符号');
        
        console.log(`📝 组成: ${composition.join(', ')}`);
        console.log(`\n💡 使用方法: 在文章的 frontmatter 中添加：`);
        console.log(`   password: ${password}`);
        console.log();
        
    } catch (error) {
        console.error(`❌ 错误: ${error.message}`);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}