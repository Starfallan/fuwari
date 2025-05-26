import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { Hono } from 'hono';
import { verifyPassword } from '../../../utils/encrypt-utils';

// 将此端点设置为服务端渲染模式，而非静态预渲染
export const prerender = false;

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
  
  // 自定义身份验证中间件，不使用basicAuth来避免浏览器原生认证对话框
  app.use('*', async (c, next) => {
    const authHeader = c.req.header('Authorization');
    
    // 如果没有Authorization头，返回401但不带WWW-Authenticate头部
    if (!authHeader) {
      return c.json({
        success: false,
        message: 'Authentication required',
        isEncrypted: true,
      }, 401);
    }
    
    try {
      // 解析Basic Auth头部
      const [scheme, credentials] = authHeader.split(' ');
      
      if (scheme !== 'Basic') {
        return c.json({
          success: false,
          message: 'Invalid authentication scheme',
          isEncrypted: true,
        }, 401);
      }
      
      const decoded = atob(credentials);
      const [username, password] = decoded.split(':');
      
      // 验证密码
      if (!verifyPassword(password, post.data.password)) {
        return c.json({
          success: false,
          message: 'Invalid password',
          isEncrypted: true,
        }, 401);
      }
      
      // 验证通过，继续处理请求
      await next();
    } catch (e) {
      console.error('Authentication error:', e);
      return c.json({
        success: false,
        message: 'Authentication failed',
        isEncrypted: true,
      }, 401);
    }
  });
  
  // 主处理路由
  app.get('*', async (c) => {
    try {
      // 获取文章的渲染内容
      const { render } = await import('astro:content');
      const renderedEntry = await render(post);

      return c.json({
        success: true,
        message: 'Authentication successful',
        isEncrypted: true,
        content: renderedEntry.Content // 返回渲染后的内容
      });
    } catch (error) {
      console.error('获取文章内容失败', error);
      return c.json({
        success: false,
        message: 'Authentication successful, but content could not be loaded',
        isEncrypted: true
      });
    }
  });
  
  // 调用 Hono 处理程序
  const res = await app.fetch(request);
  return res;
};
