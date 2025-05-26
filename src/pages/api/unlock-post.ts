import { getCollection } from 'astro:content';
import { verifyPassword, generateToken } from '../../utils/encrypt-utils';
import { addAccessToken } from '../../utils/token-service';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { slug, password } = data;

    if (!slug || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '缺少必要参数'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 获取文章信息
    const allPosts = await getCollection('posts');
    const post = allPosts.find(post => post.slug === slug);

    if (!post) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '文章不存在'
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 验证文章是否需要密码
    if (!post.data.encrypted) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '此文章不需要密码'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 验证密码
    if (!verifyPassword(password, post.data.password)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '密码错误'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 生成并存储访问令牌
    const token = generateToken();
    addAccessToken(slug, token);

    return new Response(
      JSON.stringify({
        success: true,
        message: '验证成功',
        token
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('解锁文章出错:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '服务器错误'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
