<!-- 
  这是一个用于处理加密文章内容的组件
  如果文章加密，会显示密码输入界面
  如果解锁成功，发出事件通知父组件显示文章内容
-->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import PasswordInput from './widget/PasswordInput.svelte';
  import { getValidArticleUnlockStatus, saveArticleUnlockStatus, clearArticleUnlockStatus } from '../utils/article-encrypt-utils';
  
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
    } else {      // 检查本地存储中是否已有有效令牌并且未过期
      const unlockStatus = getValidArticleUnlockStatus(slug);
      
      if (unlockStatus && unlockStatus.password) {
        // 有有效的解锁状态，使用密码尝试解锁
        validateBasicAuth("user", unlockStatus.password);
      }

      // 检查URL中是否有已解锁状态的查询参数
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('unlocked') === 'true') {
        isUnlocked = true;
        dispatch('unlocked', true);
        
        const unlockEvent = new CustomEvent('article-unlocked', {
          detail: { slug }
        });
        window.dispatchEvent(unlockEvent);
      }
    }
  });
    async function validateBasicAuth(username: string, password: string) {
    isCheckingAuth = true;
    authError = '';
    
    try {      // 使用 Basic Auth 请求保护的内容 API
      // 任意用户名，因为我们的API不验证用户名，只验证密码
      const anyUsername = "user";
      const encodedAuth = btoa(`${anyUsername}:${password}`);
      
      // 确保 URL 路径末尾有斜杠，适应 trailingSlash: "always" 配置
      const response = await fetch(`/api/protected-content/${slug}/`, {
        headers: {
          'Authorization': `Basic ${encodedAuth}`
        }
      });
      
      const data = await response.json();
        if (response.ok && data.success) {          // 验证成功
        // 保存认证信息到本地存储，包括密码和过期时间，有效期3小时
        saveArticleUnlockStatus(slug, password, 3);
        
        // 设置解锁状态
        isUnlocked = true;
        dispatch('unlocked', true);
        
        // 触发一个全局事件，让页面脚本可以捕获
        const unlockEvent = new CustomEvent('article-unlocked', {
          detail: { slug }
        });
        window.dispatchEvent(unlockEvent);
        
        // 如果当前URL没有unlocked参数，添加unlocked=true参数并刷新页面以显示内容
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.has('unlocked')) {
          urlParams.set('unlocked', 'true');
          const newUrl = `${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;
          window.location.href = newUrl;
        }      } else {
        // 验证失败，使用API返回的错误消息
        authError = data.message || (response.status === 401 ? '密码错误' : '验证文章访问权限失败');
        clearArticleUnlockStatus(slug);
      }
    } catch (err) {
      console.error('验证文章访问权限失败:', err);
      authError = '连接服务器失败，请稍后再试';
    } finally {
      isCheckingAuth = false;
    }
  }
  function handleUnlock(event) {
    // 密码验证成功，使用任意用户名，只关心密码
    validateBasicAuth("user", event.detail.password);
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
