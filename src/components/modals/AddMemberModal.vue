<script setup>
import { ref } from "vue";

const props = defineProps({
  visible: Boolean,
  avatars: {
    type: Array,
    default: () => ["🏃", "🏃‍♂️", "🏃‍♀️", "👟", "🔥", "⚡", "🥇", "🏆", "💪", "🌟"],
  },
});

const emit = defineEmits(["close", "add"]);

const newName = ref("");
const newGoal = ref("");
const newAvatar = ref("🏃");

const handleAdd = () => {
  if (!newName.value || !newGoal.value) {
    alert("이름과 목표를 입력해주세요!");
    return;
  }
  emit("add", {
    name: newName.value,
    goal: newGoal.value,
    avatar: newAvatar.value,
  });
  newName.value = "";
  newGoal.value = "";
  newAvatar.value = "🏃";
};

const handleClose = () => {
  newName.value = "";
  newGoal.value = "";
  newAvatar.value = "🏃";
  emit("close");
};
</script>

<template>
  <div v-if="visible" class="modal-dim" @click="handleClose">
    <div class="modal-content register-modal" @click.stop>
      <div class="modal-header">
        <h3>👋 새 러너 등록</h3>
        <button class="btn-icon-close" @click="handleClose">✕</button>
      </div>

      <div class="register-body">
        <div class="input-group">
          <label class="input-label">닉네임</label>
          <input
            type="text"
            v-model="newName"
            class="underline-input"
            placeholder="이름을 입력하세요"
            autofocus
          />
        </div>

        <div class="input-group">
          <label class="input-label">목표 거리 (km)</label>
          <input
            type="number"
            inputmode="decimal"
            v-model="newGoal"
            class="underline-input"
            placeholder="0"
          />
        </div>

        <div class="avatar-section">
          <label class="input-label">아바타를 골라주세요</label>
          <div class="avatar-grid-mobile">
            <button
              v-for="a in props.avatars"
              :key="a"
              class="avatar-btn-mobile"
              :class="{ selected: newAvatar === a }"
              @click="newAvatar = a"
            >
              {{ a }}
            </button>
          </div>
        </div>
      </div>

      <button class="btn-register-blue" @click="handleAdd">
        환영합니다! 등록하기 🚀
      </button>
    </div>
  </div>
</template>

<style scoped>
.modal-dim {
  overflow-y: auto;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
}

.register-modal {
  background-color: var(--bg-card);
  width: 90vw;
  max-width: 330px;
  padding: 0;
  padding-bottom: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid var(--border);
  -webkit-overflow-scrolling: touch;
}

.modal-header {
  width: 100%;
  padding: 18px 20px;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
}

.btn-icon-close {
  background: var(--input-bg);
  border: none;
  font-size: 1rem;
  color: var(--text-sub);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-body {
  width: 100%;
  padding: 25px 25px 10px 25px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--text-sub);
  margin-left: 2px;
}

.underline-input {
  width: 100%;
  border: none;
  border-bottom: 2px solid var(--border);
  background: transparent;
  padding: 10px 5px;
  font-size: 18px;
  color: var(--text-main);
  outline: none;
  transition: border-color 0.2s;
  border-radius: 0;
}

.underline-input:focus {
  border-bottom-color: #4facfe;
}

.avatar-section {
  margin-top: 5px;
}

.avatar-grid-mobile {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
  padding: 5px;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.avatar-grid-mobile::-webkit-scrollbar {
  display: none;
}

.avatar-btn-mobile {
  aspect-ratio: 1/1;
  background: var(--bg-main);
  border: 1px solid var(--border);
  border-radius: 14px;
  font-size: 1.6rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.1s,
    background-color 0.1s;
}

.avatar-btn-mobile:active {
  transform: scale(0.95);
  background-color: var(--border);
}

.avatar-btn-mobile.selected {
  border: 2px solid #4facfe;
  background: rgba(79, 172, 254, 0.15);
  box-shadow: 0 0 0 1px #4facfe;
}

.btn-register-blue {
  width: calc(100% - 50px);
  margin: 20px 25px 0 25px;
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.3);
  transition: transform 0.1s;
}

.btn-register-blue:active {
  transform: scale(0.98);
  box-shadow: 0 2px 5px rgba(79, 172, 254, 0.2);
}
</style>
