<script setup>
import RunnerCard from "./RunnerCard.vue";

const props = defineProps({
  runners: Array,
});

const emit = defineEmits(["selectRunner", "cheer"]);
</script>

<template>
  <div v-if="runners.length === 0" class="empty-state">
    <p>등록된 러너가 없습니다.<br />가장 먼저 등록해보세요!</p>
  </div>

  <div v-else class="rank-list">
    <RunnerCard
      v-for="(runner, index) in runners"
      :key="runner.id"
      :runner="runner"
      :rank="index"
      @click="$emit('selectRunner', runner.id)"
      @cheer="$emit('cheer', $event)"
    />
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  color: var(--text-sub);
  padding: 40px 16px;
  border: 1px dashed var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  font-size: 0.9rem;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
