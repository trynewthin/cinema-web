<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <VaButton @click="$router.push('/')">返回首页</VaButton>
  </div>
</template>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

h1 {
  font-size: 6rem;
  margin-bottom: 1rem;
  color: var(--va-primary);
}

p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: var(--va-text-primary);
}
</style>
