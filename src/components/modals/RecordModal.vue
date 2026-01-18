<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  visible: Boolean,
  runner: Object,
});

const emit = defineEmits(["close", "save", "delete"]);

const inputDistance = ref("");

const handleSave = () => {
  if (inputDistance.value) {
    emit("save", inputDistance.value);
    inputDistance.value = "";
  }
};

const handleDelete = () => {
  emit("delete");
};

const handleClose = () => {
  inputDistance.value = "";
  emit("close");
};
</script>

<template>
  <div v-if="visible" class="modal-dim" @click="handleClose">
    <div class="modal-content record-modal" @click.stop>
      <div class="modal-header">
        <h3>🚩 기록하기</h3>
        <button class="btn-icon-close" @click="handleClose">✕</button>
      </div>

      <div class="profile-section">
        <div class="avatar-circle">{{ runner?.avatar }}</div>
        <span class="runner-name">{{ runner?.name }}</span>
      </div>

      <div class="big-input-wrap">
        <input
          type="number"
          v-model="inputDistance"
          inputmode="decimal"
          class="big-number-input"
          placeholder="0"
          autofocus
        />
        <span class="unit">km</span>
      </div>

      <p class="guide-text-sm">
        오늘 뛴 거리를 입력하세요<br />(-를 입력하면 차감됩니다)
      </p>

      <button class="btn-confirm-full" @click="handleSave">저장 완료</button>

      <div class="delete-section">
        <button class="btn-text-delete" @click="handleDelete">
          멤버 삭제하기
        </button>
      </div>
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

.record-modal {
  background-color: var(--bg-card);
  width: 90vw;
  max-width: 330px;
  padding: 0;
  padding-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid var(--border);
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

.profile-section {
  width: 100%;
  margin-top: 30px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-circle {
  width: 60px;
  height: 60px;
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.runner-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--text-main);
}

.big-input-wrap {
  width: 100%;
  position: relative;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

.big-number-input {
  width: 30%;
  border: none;
  border-bottom: 2px solid var(--border);
  font-size: 2.3rem;
  color: var(--text-main);
  font-weight: 900;
  text-align: center;
  background: transparent;
  outline: none;
  padding-bottom: 5px;
  transition: border-color 0.3s;
  letter-spacing: -2px;
}

.big-number-input::placeholder {
  color: var(--border);
  opacity: 0.2;
}

.big-number-input:focus {
  border-color: #00f260;
}

.big-number-input::-webkit-inner-spin-button,
.big-number-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.unit {
  position: absolute;
  left: 50%;
  transform: translateX(55px);
  bottom: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-sub);
}

.guide-text-sm {
  font-size: 0.9rem;
  color: var(--text-sub);
  text-align: center;
  margin-bottom: 30px;
  line-height: 1.5;
}

.btn-confirm-full {
  width: calc(100% - 40px);
  margin: 0 20px;
  padding: 16px;
  border-radius: 16px;
  background: #00f260;
  color: #004d26;
  border: none;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 242, 96, 0.2);
}

.btn-confirm-full:active {
  transform: scale(0.98);
}

.delete-section {
  width: 100%;
  margin-top: 15px;
  text-align: center;
}

.btn-text-delete {
  background: transparent;
  border: none;
  color: #ff6b6b;
  font-size: 0.9rem;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
  padding: 10px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-text-delete:active {
  opacity: 1;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
}
</style>
