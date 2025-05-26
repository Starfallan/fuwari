// 用于生成加密文章密码的命令行工具
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('============================');
console.log('加密文章密码生成器');
console.log('============================');

rl.question('请输入要设置的密码: ', (password) => {
  if (!password || password.trim() === '') {
    console.error('错误: 密码不能为空');
    rl.close();
    return;
  }

  rl.question('是否使用哈希加密？(y/n，推荐：y): ', (useHash) => {
    const shouldUseHash = useHash.toLowerCase() !== 'n';
    
    if (shouldUseHash) {
      // 生成盐值并加密密码
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      console.log('\n============================');
      console.log('生成的密码哈希:');
      console.log(hash);
      console.log('\n将此哈希复制到文章frontmatter的password字段中');
      console.log('例如:');
      console.log('---');
      console.log('title: 我的加密文章');
      console.log('published: 2023-05-26');
      console.log('encrypted: true');
      console.log(`password: "${hash}"`);
      console.log('---');
      console.log('============================');
    } else {
      console.log('\n============================');
      console.log('您选择了使用明文密码:');
      console.log(password);
      console.log('\n将此明文密码复制到文章frontmatter的password字段中');
      console.log('例如:');
      console.log('---');
      console.log('title: 我的加密文章');
      console.log('published: 2023-05-26');
      console.log('encrypted: true');
      console.log(`password: "${password}"`);
      console.log('---');
      console.log('\n注意：明文密码在源代码中可见，对于重要内容请使用哈希加密');
      console.log('============================');
    }

    rl.close();
  });
});
