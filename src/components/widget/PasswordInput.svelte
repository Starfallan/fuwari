<!-- filepath: e:\Blog\Elysiam\src\components\widget\PasswordInput.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  
  export let slug: string;
  
  let password = '';
  let loading = false;
  let error = '';
  let inputRef: HTMLInputElement;
  
  const dispatch = createEventDispatcher();
    async function unlockPost() {
    if (!password.trim()) {
      error = '请输入密码';
      return;
    }
    
    loading = true;
    error = '';
    
    // 直接将密码传给父组件，让父组件进行Basic Auth验证
    dispatch('unlock', { password });
    loading = false;
  }
  
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      unlockPost();
    }
  }
    onMount(() => {
    // 自动聚焦到输入框
    if (inputRef) {
      inputRef.focus();
    }
  });
</script>

<div class="password-input-container flex flex-col items-center justify-center w-full p-6 my-8 rounded-xl bg-[var(--card-bg)] border border-[var(--line-divider)]">
  <h2 class="text-xl font-bold mb-4 text-center">🔒 此文章已加密</h2>
  <p class="mb-6 text-center">请输入密码以继续阅读</p>
  
  <div class="w-full max-w-sm flex flex-col gap-2">
    <div class="relative w-full">
      <input
        bind:this={inputRef}
        type="password"
        bind:value={password}
        placeholder="请输入密码"
        on:keypress={handleKeyPress}
        class="w-full px-4 py-2 rounded-md border border-[var(--line-divider)] bg-[var(--page-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
        disabled={loading}
      />
    </div>
    
    {#if error}
      <p class="text-red-500 text-sm">{error}</p>
    {/if}
    
    <button
      on:click={unlockPost}
      disabled={loading}
      class="mt-2 w-full px-4 py-2 rounded-md bg-[var(--primary)] text-white hover:opacity-90 active:opacity-80 transition focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 disabled:opacity-50"
    >
      {#if loading}
        <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
        验证中...
      {:else}
        解锁文章
      {/if}
    </button>
  </div>
</div>
