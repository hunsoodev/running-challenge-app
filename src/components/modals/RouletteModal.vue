<script setup>
import { ref, computed, watch } from "vue";
import confetti from "canvas-confetti";

const props = defineProps({
  visible: Boolean,
  candidates: Array,
});

const emit = defineEmits(["close"]);

const palette = [
  "#FFD700",
  "#FF9F43",
  "#FF6B6B",
  "#FECA57",
  "#48DBFB",
  "#1DD1A1",
  "#5f27cd",
  "#54a0ff",
  "#00d2d3",
  "#ff9ff3",
  "#feca57",
  "#fab1a0",
];

const rotation = ref(0);
const winnerName = ref(null);
const isSpinning = ref(false);

const wheelStyle = computed(() => {
  const count = props.candidates?.length || 0;
  if (count === 0) return {};

  const anglePerSlice = 360 / count;
  let gradient = `conic-gradient(from 0deg, `;

  const stops = props.candidates.map((_, i) => {
    const color = palette[i % palette.length];
    const start = i * anglePerSlice;
    const end = (i + 1) * anglePerSlice;
    return `${color} ${start}deg ${end}deg`;
  });

  gradient += stops.join(", ") + ")";

  return {
    background: gradient,
    transform: `rotate(${rotation.value}deg)`,
    transition: isSpinning.value
      ? "transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)"
      : "none",
  };
});

const getTextStyle = (index) => {
  const count = props.candidates?.length || 0;
  const anglePerSlice = 360 / count;
  const midAngle = index * anglePerSlice + anglePerSlice / 2;

  return {
    transform: `rotate(${midAngle}deg)`,
  };
};

const spinWheel = () => {
  if (!props.candidates?.length || isSpinning.value) return;

  isSpinning.value = true;
  winnerName.value = null;

  const winnerIndex = Math.floor(Math.random() * props.candidates.length);

  const count = props.candidates.length;
  const anglePerSlice = 360 / count;
  const winnerCenterAngle = winnerIndex * anglePerSlice + anglePerSlice / 2;
  const targetRotation = 1800 + (360 - winnerCenterAngle);

  rotation.value = targetRotation;

  setTimeout(() => {
    winnerName.value = props.candidates[winnerIndex].name;
    isSpinning.value = false;
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
  }, 3000);
};

const closeRoulette = () => {
  if (isSpinning.value) return;
  emit("close");
};

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      winnerName.value = null;
      rotation.value = 0;
      isSpinning.value = false;
    }
  }
);
</script>

<template>
  <div
    v-if="visible"
    class="modal-dim"
    @click="winnerName && closeRoulette()"
  >
    <div class="roulette-content" @click.stop>
      <button class="btn-close-top" @click="closeRoulette" v-if="!isSpinning">
        ✕
      </button>
      <div class="roulette-header">
        <h3 class="title"><span class="highlight-text">행운</span>의 룰렛</h3>
        <p class="subtitle">버튼을 눌러 결과를 확인해보세요!</p>
      </div>

      <div class="roulette-container">
        <div class="pointer"></div>
        <div class="wheel" :style="wheelStyle">
          <div
            v-for="(c, i) in candidates"
            :key="c.id"
            class="segment-text"
            :style="getTextStyle(i)"
          >
            <span class="text-inner">{{
              c.name.length > 4 ? c.name.substring(0, 4) + ".." : c.name
            }}</span>
          </div>
        </div>
      </div>
      <div class="winner-msg" v-if="winnerName">
        🎉 축하합니다! 🎉<br /><span class="highlight">{{ winnerName }}</span>
      </div>

      <div v-if="!winnerName" class="btn-group-col">
        <button
          class="btn-spin-main"
          @click="spinWheel"
          :disabled="isSpinning"
        >
          {{ isSpinning ? "돌아가는 중..." : "룰렛 돌리기" }}
        </button>
      </div>
      <button v-else class="btn-close-lottery" @click="closeRoulette">
        닫기
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

.roulette-content {
  background: #fff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  color: #333;
  padding: 30px 20px;
  border-radius: 24px;
  width: 90%;
  max-width: 340px;
  text-align: center;
  position: relative;
}

.roulette-container {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 20px auto;
}

.roulette-header {
  margin-bottom: 30px;
  text-align: center;
}

.roulette-header .title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 900;
  color: #333;
  letter-spacing: -0.5px;
}

.highlight-text {
  color: #e74c3c;
  display: inline-block;
}

.roulette-header .subtitle {
  margin: 8px 0 0 0;
  font-size: 0.95rem;
  color: #888;
  font-weight: 500;
}

.btn-close-top {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 32px;
  height: 32px;
  background: #f1f3f5;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  font-size: 1rem;
  color: #888;
  cursor: pointer;
  transition: background 0.2s;
}

.pointer {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  width: 40px;
  height: 50px;
  background-color: #e74c3c;
  clip-path: polygon(100% 0, 50% 100%, 0 0);
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow:
    0 0 0 4px #ffd700,
    0 0 20px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.segment-text {
  position: absolute;
  top: 0;
  left: 50%;
  width: 58px;
  margin-left: -30px;
  height: 40%;
  transform-origin: bottom center;
  display: flex;
  justify-content: center;
  padding-top: 30px;
  font-weight: 900;
  color: #333;
  font-size: 0.83rem;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
}

.winner-msg {
  margin-top: 20px;
  font-size: 1.2rem;
  line-height: 1.5;
  animation: pop 0.5s;
}

.highlight {
  font-size: 2rem;
  font-weight: 900;
  color: #d35400;
  display: block;
  margin-top: 5px;
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

.btn-spin-main {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1.2rem;
  box-shadow: 0 4px 10px rgba(231, 76, 60, 0.4);
  animation: pulse 2s infinite;
  width: 100%;
}

.btn-spin-main:disabled {
  animation: none;
  background: #555;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-close-lottery {
  margin-top: 20px;
  width: 100%;
  padding: 15px;
  background: #f1f3f5;
  color: #495057;
  border: none;
  border-radius: 15px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-lottery:active {
  transform: scale(0.98);
}

@keyframes pop {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
  }
}
</style>
