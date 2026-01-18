<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  visible: Boolean,
  currentPrize: String,
  defaultPrize: String,
});

const emit = defineEmits(["close", "save"]);

const inputPrizeName = ref("");

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.currentPrize === props.defaultPrize) {
        inputPrizeName.value = "";
      } else {
        inputPrizeName.value = props.currentPrize;
      }
    }
  }
);

const handleSave = () => {
  if (inputPrizeName.value.trim()) {
    emit("save", inputPrizeName.value);
  } else {
    alert("상품명을 입력해주세요!");
  }
};

const handleClose = () => {
  emit("close");
};
</script>

<template>
  <div v-if="visible" class="modal-dim" @click="handleClose">
    <div class="modal-content prize-modal" @click.stop>
      <div class="modal-header">
        <h3>🎁 상품 수정</h3>
        <button class="btn-icon-close" @click="handleClose">✕</button>
      </div>

      <div class="prize-input-section">
        <label class="input-label">이번 달의 목표 상품은?</label>

        <div class="input-underline-wrap">
          <input
            type="text"
            v-model="inputPrizeName"
            placeholder="상품명 입력"
            class="prize-input"
            autofocus
            @keyup.enter="handleSave"
          />
          <span class="focus-border"></span>
        </div>
      </div>

      <div class="btn-group-col">
        <button class="btn-confirm-gradient" @click="handleSave">
          수정 완료 ✨
        </button>

        <button class="btn-text-cancel" @click="handleClose">취소</button>
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

.prize-modal {
  background-color: var(--bg-card);
  width: 90vw;
  max-width: 350px;
  padding: 0;
  padding-bottom: 25px;
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

.prize-input-section {
  width: 100%;
  padding: 40px 30px 20px 30px;
  box-sizing: border-box;
  text-align: center;
}

.input-label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-sub);
  margin-bottom: 15px;
  font-weight: bold;
}

.input-underline-wrap {
  position: relative;
  width: 100%;
}

.prize-input {
  width: 100%;
  border: none;
  border-bottom: 2px solid var(--border);
  background: transparent;
  padding: 10px 0;
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--text-main);
  text-align: center;
  outline: none;
  transition: all 0.3s;
  border-radius: 0;
}

.prize-input:focus {
  border-bottom-color: #dd2476;
}

.prize-input::placeholder {
  color: var(--text-sub);
  opacity: 0.3;
}

.btn-group-col {
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.btn-confirm-gradient {
  width: 100%;
  padding: 16px;
  background: linear-gradient(90deg, #ff512f, #dd2476);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 5px 20px rgba(221, 36, 118, 0.3);
  transition:
    transform 0.1s,
    box-shadow 0.2s;
}

.btn-text-cancel {
  background: transparent;
  color: var(--text-sub);
  border: none;
  padding: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-text-cancel:hover {
  color: var(--text-main);
}
</style>
