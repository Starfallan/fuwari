import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { Hono } from 'hono';
import { basicAuth } from 'hono/basic-auth';
import { verifyPassword } from '../../../utils/encrypt-utils';

export const GET: APIRoute = async ({ params, request }) => {
  const slug = params.slug;
  
  if (!slug) {
    return new Response(JSON.stringify({
      error: 'Missing slug parameter'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  // 获取文章信息
  const allPosts = await getCollection('posts');
  const post = allPosts.find(post => post.slug === slug);
  
  if (!post) {
    return new Response(JSON.stringify({
      error: 'Article not found'
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  // 如果文章不加密，直接返回内容
  if (!post.data.encrypted) {
    return new Response(JSON.stringify({
      success: true,
      message: 'Article is not encrypted',
      isEncrypted: false,
      content: null
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  // 创建 Hono 应用
  const app = new Hono();
  
  // 使用基础认证中间件
  app.use('*', basicAuth({
    // 自定义身份验证函数
    async authenticate(userId, password) {
      if (userId !== slug) return false;
      
      // 使用我们自己的密码验证函数
      const isPasswordValid = verifyPassword(password, post.data.password);
      return isPasswordValid;
    },
    realm: 'Protected Article'
  }));
  
  // 主处理路由
  app.get('*', (c) => {
    return c.json({
      success: true,
      message: 'Authentication successful',
      isEncrypted: true
    });
  });
  
  // 调用 Hono 处理程序
  const res = await app.fetch(request);
  return res;
};
