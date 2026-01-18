<script setup>
const props = defineProps({
  inputCode: String,
  loginError: Boolean,
  loginSuccess: Boolean,
});

const emit = defineEmits(["update:inputCode", "login"]);

const handleInput = (e) => {
  emit("update:inputCode", e.target.value);
};

const handleLogin = () => {
  emit("login");
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="lock-icon">🔒</div>
      <h2>크루 전용 공간</h2>
      <p>공유받은 인증 코드를 입력하세요.</p>
      <div
        class="code-input-wrap"
        :class="{ error: loginError, success: loginSuccess }"
      >
        <input
          type="password"
          :value="inputCode"
          @input="handleInput"
          placeholder="Code"
          maxlength="10"
          @keyup.enter="handleLogin"
          :disabled="loginSuccess"
        />
        <button @click="handleLogin">
          {{ loginSuccess ? "✔" : "➜" }}
        </button>

        <div
          class="loading-bar"
          :style="{ width: loginSuccess ? '100%' : '0%' }"
        ></div>
      </div>
      <p v-if="loginError" class="error-msg">코드가 일치하지 않습니다.</p>
      <p v-if="loginSuccess" class="success-msg">인증 성공! 환영합니다 👋</p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding: 20px;
}

.login-box {
  text-align: center;
  padding: 40px;
  max-width: 320px;
  width: 100%;
}

.lock-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

.login-box h2 {
  color: white;
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.login-box p {
  color: #aaa;
  margin-bottom: 30px;
}

.code-input-wrap {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 30px;
  padding: 5px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.loading-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 0%;
  background: linear-gradient(90deg, #00f260, #0575e6);
  transition: width 2s ease-in-out;
  z-index: 5;
}

.code-input-wrap:focus-within {
  border-color: rgba(79, 172, 254, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.code-input-wrap.error {
  animation: shake 0.4s;
  border-color: #ff6b6b;
}

.code-input-wrap.success {
  border-color: #00f260;
  background: rgba(0, 242, 96, 0.1);
}

.code-input-wrap.success input {
  color: #00f260;
}

.code-input-wrap input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 15px;
  color: white;
  font-size: 1.1rem;
  outline: none;
}

.code-input-wrap button {
  background: #ff512f;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.code-input-wrap.success button {
  background-color: #00f260;
  transform: scale(1.1);
}

.error-msg {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 15px;
}

.success-msg {
  color: #00f260;
  font-size: 0.9rem;
  margin-top: 15px;
  font-weight: bold;
  animation: fadeUp 0.3s forwards;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
