import { validateAccessToken } from '../../utils/token-service';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { slug, token } = data;

    if (!slug || !token) {
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

    // 验证令牌
    const isValid = validateAccessToken(slug, token);

    return new Response(
      JSON.stringify({
        success: isValid,
        message: isValid ? '令牌有效' : '令牌无效或已过期'
      }),
      {
        status: isValid ? 200 : 401,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('验证令牌出错:', error);
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
