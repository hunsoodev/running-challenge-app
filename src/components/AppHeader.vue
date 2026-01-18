<script setup>
const props = defineProps({
  year: Number,
  month: Number,
  isDarkMode: Boolean,
});

const emit = defineEmits(["toggleTheme"]);
</script>

<template>
  <header>
    <div class="header-content">
      <div class="spacer"></div>
      <div class="date-badge">{{ year }}년 {{ month }}월 챌린지</div>
      <button class="btn-theme" @click="$emit('toggleTheme')">
        {{ isDarkMode ? "☀️" : "🌙" }}
      </button>
    </div>
  </header>
</template>

<style scoped>
header {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.date-badge {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-highlight);
  background: rgba(79, 172, 254, 0.08);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(79, 172, 254, 0.15);
}

.btn-theme {
  background: var(--bg-card);
  border: 1px solid var(--border);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-theme:active {
  transform: scale(0.95);
  background: var(--input-bg);
}

.spacer {
  width: 40px;
}
</style>
