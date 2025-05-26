<!-- 
  这是一个用于处理加密文章内容的组件
  如果文章加密，会显示密码输入界面
  如果解锁成功，发出事件通知父组件显示文章内容
-->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import PasswordInput from './widget/PasswordInput.svelte';
  
  export let slug: string;
  export let encrypted: boolean;
  
  let isUnlocked = false;
  let isCheckingAuth = false;
  let authError = '';
  const dispatch = createEventDispatcher();
  
  onMount(() => {
    // 检查文章是否需要加密
    if (!encrypted) {
      isUnlocked = true;
      dispatch('unlocked', true);
    } else {
      // 检查本地存储中是否已有有效令牌
      const tokenKey = `encrypted_post_${slug}`;
      const authData = localStorage.getItem(tokenKey);
      
      if (authData) {
        try {
          const auth = JSON.parse(authData);
          if (auth && auth.username && auth.password) {
            validateBasicAuth(auth.username, auth.password);
          }
        } catch (e) {
          console.error('无效的本地存储数据:', e);
          localStorage.removeItem(tokenKey);
        }
      }
    }
  });
    async function validateBasicAuth(username: string, password: string) {
    isCheckingAuth = true;
    authError = '';
    
    try {
      // 使用 Basic Auth 请求保护的内容 API
      const encodedAuth = btoa(`${username}:${password}`);
      
      const response = await fetch(`/api/protected-content/${slug}`, {
        headers: {
          'Authorization': `Basic ${encodedAuth}`
        }
      });
      
      if (response.ok) {
        // 验证成功
        const data = await response.json();
        
        // 保存认证信息到本地存储
        localStorage.setItem(`encrypted_post_${slug}`, JSON.stringify({
          username,
          password
        }));
        
        isUnlocked = true;
        dispatch('unlocked', true);
        
        // 触发一个全局事件，让页面脚本可以捕获
        const unlockEvent = new CustomEvent('article-unlocked', {
          detail: { slug }
        });
        window.dispatchEvent(unlockEvent);
      } else {
        // 验证失败
        authError = response.status === 401 ? '密码错误' : '验证文章访问权限失败';
        localStorage.removeItem(`encrypted_post_${slug}`);
      }
    } catch (err) {
      console.error('验证文章访问权限失败:', err);
      authError = '连接服务器失败，请稍后再试';
    } finally {
      isCheckingAuth = false;
    }
  }
    function handleUnlock(event) {
    // 密码验证成功，使用 slug 作为用户名，密码作为密码
    validateBasicAuth(slug, event.detail.password);
  }
</script>

<div>
  {#if !isUnlocked}
    <PasswordInput {slug} on:unlock={handleUnlock} />
    {#if authError}
      <div class="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-center">
        {authError}
      </div>
    {/if}
    {#if isCheckingAuth}
      <div class="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-center">
        正在验证...
      </div>
    {/if}
  {/if}
</div>

<style>
  div {
    width: 100%;
  }
</style>
