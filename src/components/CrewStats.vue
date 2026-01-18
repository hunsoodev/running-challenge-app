<script setup>
import { computed } from "vue";

const props = defineProps({
  runners: Array,
});

const stats = computed(() => {
  if (!props.runners || props.runners.length === 0) {
    return {
      totalDistance: 0,
      participantCount: 0,
      completedCount: 0,
      avgRate: 0,
    };
  }

  const totalDistance = props.runners.reduce((sum, r) => sum + (r.current || 0), 0);
  const participantCount = props.runners.length;
  const completedCount = props.runners.filter((r) => r.current >= r.goal).length;

  const totalRate = props.runners.reduce((sum, r) => {
    if (!r.goal || r.goal === 0) return sum;
    return sum + Math.min(100, (r.current / r.goal) * 100);
  }, 0);
  const avgRate = participantCount > 0 ? (totalRate / participantCount).toFixed(0) : 0;

  return {
    totalDistance: totalDistance.toFixed(1),
    participantCount,
    completedCount,
    avgRate,
  };
});
</script>

<template>
  <div class="crew-stats">
    <div class="stats-header">
      <span class="stats-icon">📊</span>
      <span class="stats-title">크루 현황</span>
    </div>
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-value">{{ stats.totalDistance }}<small>km</small></span>
        <span class="stat-label">총 거리</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.completedCount }}<small>/{{ stats.participantCount }}</small></span>
        <span class="stat-label">완주</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.avgRate }}<small>%</small></span>
        <span class="stat-label">평균 달성률</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crew-stats {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.stats-icon {
  font-size: 0.9rem;
}

.stats-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-sub);
}

.stats-grid {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-main);
}

.stat-value small {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-sub);
  margin-left: 1px;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-sub);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--border);
}
</style>
