<script setup>
const props = defineProps({
  prize: String,
});

const emit = defineEmits(["editPrize", "openRoulette"]);
</script>

<template>
  <div class="event-card">
    <div class="event-label" @click="$emit('editPrize')">
      🎉 THIS MONTH'S EVENT
    </div>
    <div class="event-title" @click="$emit('editPrize')">{{ prize }}</div>
    <button class="btn-lottery" @click="$emit('openRoulette')">
      🎲 완주자 룰렛 돌리기
    </button>
  </div>
</template>

<style scoped>
.event-card {
  background: linear-gradient(135deg, #fdb931 0%, #f2994a 100%);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
  color: white;
}

.event-label {
  font-size: 0.7rem;
  font-weight: 800;
  opacity: 0.8;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.event-title {
  font-size: 1.1rem;
  font-weight: bold;
  line-height: 1.3;
}

.btn-lottery {
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.95);
  color: #d35400;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.event-card:active {
  transform: scale(0.98);
}

.btn-lottery:active {
  background: rgba(255, 255, 255, 0.85);
  transform: scale(0.96);
}
</style>
