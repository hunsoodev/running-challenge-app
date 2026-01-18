<script setup>
const props = defineProps({
  runner: Object,
  rank: Number,
});

const emit = defineEmits(["click", "cheer"]);

const getRate = (current, goal) => {
  if (!goal || goal === 0) return "0";
  return Math.min(100, (current / goal) * 100).toFixed(0);
};

const handleCheer = (e) => {
  e.stopPropagation();
  emit("cheer", props.runner.id);
};
</script>

<template>
  <div class="rank-card" @click="$emit('click', runner.id)">
    <div class="rank-badge" :class="`rank-${rank}`">
      <span v-if="runner.current >= runner.goal">👑</span>
      <span v-else>{{ rank + 1 }}</span>
    </div>
    <div class="info-area">
      <div class="row-top">
        <span class="name">{{ runner.avatar }} {{ runner.name }}</span>
        <div class="right-section">
          <button class="cheer-btn" @click="handleCheer">
            ❤️ <span class="cheer-count">{{ runner.cheers || 0 }}</span>
          </button>
          <span
            class="percent"
            :class="{ 'goal-ok': runner.current >= runner.goal }"
          >
            {{ getRate(runner.current, runner.goal) }}%
          </span>
        </div>
      </div>
      <div class="progress-bar">
        <div
          class="fill"
          :style="{ width: getRate(runner.current, runner.goal) + '%' }"
          :class="{ 'fill-ok': runner.current >= runner.goal }"
        ></div>
      </div>
      <div class="row-bottom">
        <span v-if="runner.streak >= 2" class="streak-badge">
          🔥 {{ runner.streak }}일 연속
        </span>
        <span v-if="runner.completedAt" class="finish-time">
          🏁 {{ new Date(runner.completedAt).getMonth() + 1 }}/{{
            new Date(runner.completedAt).getDate()
          }}
        </span>
        <span class="total">{{ runner.current }}km&nbsp;</span>
        <span class="goal">/ {{ runner.goal }}km</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rank-card {
  background: var(--bg-card);
  padding: 14px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  border: 1px solid var(--border);
}

.rank-card:active {
  transform: scale(0.98);
  background: var(--input-bg);
}

.rank-badge {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-sub);
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.rank-0 {
  color: #ffd700;
  font-size: 1.5rem;
}

.rank-1 {
  color: #c0c0c0;
  font-size: 1.5rem;
}

.rank-2 {
  color: #cd7f32;
  font-size: 1.5rem;
}

.info-area {
  flex: 1;
  min-width: 0;
}

.row-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  align-items: center;
}

.name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.cheer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: rgba(255, 100, 100, 0.1);
  border: none;
  padding: 6px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: transform 0.1s, background 0.2s;
  min-height: 32px;
  min-width: auto;
}

.cheer-btn:active {
  transform: scale(0.95);
  background: rgba(255, 100, 100, 0.25);
}

.cheer-count {
  color: #ff6b6b;
  font-weight: 700;
  font-size: 0.8rem;
}

.percent {
  font-weight: 700;
  color: #ff512f;
  font-size: 1rem;
}

.percent.goal-ok {
  color: #00f260;
}

.progress-bar {
  height: 8px;
  background: var(--input-bg);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, #ff512f, #dd2476);
  width: 0%;
  transition: width 0.5s;
  border-radius: 4px;
}

.fill.fill-ok {
  background: linear-gradient(90deg, #00f260, #0575e6);
}

.row-bottom {
  display: flex;
  font-size: 0.85rem;
  color: var(--text-sub);
  align-items: center;
  gap: 6px;
}

.total {
  margin-left: auto;
}

.goal {
  color: var(--text-sub);
}

.streak-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: #ff6b35;
  background: rgba(255, 107, 53, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
}

.finish-time {
  font-size: 0.75rem;
  color: var(--text-highlight);
}
</style>
