<script setup>
import { ref, computed, watch, onMounted } from "vue";

// Components
import LoginScreen from "./components/LoginScreen.vue";
import AppHeader from "./components/AppHeader.vue";
import EventCard from "./components/EventCard.vue";
import CrewStats from "./components/CrewStats.vue";
import RunnerList from "./components/RunnerList.vue";
import RecordModal from "./components/modals/RecordModal.vue";
import AddMemberModal from "./components/modals/AddMemberModal.vue";
import PrizeModal from "./components/modals/PrizeModal.vue";
import RouletteModal from "./components/modals/RouletteModal.vue";

// Composables
import { useTheme } from "./composables/useTheme.js";
import { useAuth } from "./composables/useAuth.js";
import { useRunners } from "./composables/useRunners.js";

// ==========================================
// 🌓 테마 설정
// ==========================================
const { isDarkMode, toggleTheme } = useTheme();

// ==========================================
// 🔒 인증
// ==========================================
const { isLoggedIn, inputCode, loginError, loginSuccess, tryLogin, checkAuth } =
  useAuth();

// ==========================================
// ⚙️ 기본 설정
// ==========================================
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;


// ==========================================
// 💾 러너 데이터 관리
// ==========================================
const {
  runners,
  sortedRunners,
  completedRunners,
  loadRunners,
  addMember,
  saveRecord,
  deleteMember,
  getRunner,
  cheerRunner,
  STORAGE_KEY,
} = useRunners();

// ==========================================
// 🎁 상품 관리
// ==========================================
const DEFAULT_PRIZE = "상품을 입력해주세요 🎁";
const eventPrize = ref(DEFAULT_PRIZE);
const showPrizeModal = ref(false);

const loadPrize = () => {
  const savedPrize = localStorage.getItem(`${STORAGE_KEY}-prize`);
  if (savedPrize) {
    eventPrize.value = savedPrize;
  } else {
    eventPrize.value = DEFAULT_PRIZE;
  }
};

const savePrize = (prizeName) => {
  eventPrize.value = prizeName;
  localStorage.setItem(`${STORAGE_KEY}-prize`, prizeName);
  showPrizeModal.value = false;
};

// ==========================================
// 📝 멤버 관리 모달
// ==========================================
const showAddModal = ref(false);
const showRecordModal = ref(false);
const selectedId = ref("");

const avatars = [
  "🏃",
  "🏃‍♂️",
  "🏃‍♀️",
  "👟",
  "🔥",
  "⚡",
  "🥇",
  "🏆",
  "💪",
  "🌟",
];

const selectedRunner = computed(() => {
  return getRunner(selectedId.value);
});

const openRecordModal = (id) => {
  selectedId.value = id;
  showRecordModal.value = true;
};

const handleAddMember = ({ name, goal, avatar }) => {
  const success = addMember(name, parseFloat(goal), avatar);
  if (success) {
    showAddModal.value = false;
  }
};

const handleSaveRecord = (distance) => {
  const success = saveRecord(selectedId.value, distance);
  if (success) {
    showRecordModal.value = false;
  }
};

const handleDeleteMember = () => {
  const success = deleteMember(selectedId.value);
  if (success) {
    showRecordModal.value = false;
  }
};

// ==========================================
// 🎰 룰렛
// ==========================================
const showRouletteModal = ref(false);

const openRoulette = () => {
  if (completedRunners.value.length === 0) {
    return alert("아직 완주한 러너가 없습니다!");
  }
  showRouletteModal.value = true;
};

// ==========================================
// 초기화
// ==========================================
onMounted(() => {
  if (checkAuth()) {
    loadRunners();
    loadPrize();
  }
});

const handleLogin = () => {
  tryLogin(() => {
    loadRunners();
    loadPrize();
  });
};

// 모달 열릴 때 스크롤 잠금
watch(
  [showAddModal, showRecordModal, showRouletteModal, showPrizeModal],
  ([val1, val2, val3, val4]) => {
    if (val1 || val2 || val3 || val4) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
);
</script>

<template>
  <LoginScreen
    v-if="!isLoggedIn"
    v-model:inputCode="inputCode"
    :loginError="loginError"
    :loginSuccess="loginSuccess"
    @login="handleLogin"
  />

  <div v-else class="container" :class="{ 'light-mode': !isDarkMode }">
    <AppHeader
      :year="year"
      :month="month"
      :isDarkMode="isDarkMode"
      @toggleTheme="toggleTheme"
    />

    <EventCard
      :prize="eventPrize"
      @editPrize="showPrizeModal = true"
      @openRoulette="openRoulette"
    />

    <CrewStats :runners="runners" />

    <RunnerList
      :runners="sortedRunners"
      @selectRunner="openRecordModal"
      @cheer="cheerRunner"
    />

    <button class="btn-floating-add" @click="showAddModal = true">
      + 멤버 등록
    </button>

    <!-- Modals -->
    <RecordModal
      :visible="showRecordModal"
      :runner="selectedRunner"
      @close="showRecordModal = false"
      @save="handleSaveRecord"
      @delete="handleDeleteMember"
    />

    <AddMemberModal
      :visible="showAddModal"
      :avatars="avatars"
      @close="showAddModal = false"
      @add="handleAddMember"
    />

    <PrizeModal
      :visible="showPrizeModal"
      :currentPrize="eventPrize"
      :defaultPrize="DEFAULT_PRIZE"
      @close="showPrizeModal = false"
      @save="savePrize"
    />

    <RouletteModal
      :visible="showRouletteModal"
      :candidates="completedRunners"
      @close="showRouletteModal = false"
    />
  </div>
</template>

<style>
/* 전역 스타일 */
* {
  font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
    system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo",
    "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 터치 최적화 */
  -webkit-tap-highlight-color: transparent;
}

html {
  /* 300ms 터치 딜레이 제거 */
  touch-action: manipulation;
}

html, body {
  background-color: #121212;
  margin: 0;
  padding: 0;
}

body.light-mode-body {
  background-color: #f8f9fa;
}

/* 모든 버튼/입력 터치 최적화 */
button, input, select, textarea {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* 최소 터치 영역 보장 (44px - Apple 권장) */
button {
  min-height: 44px;
  min-width: 44px;
}
</style>

<style scoped>
/* ========================
   CSS Variables & Color System
   ======================== */
.container {
  --bg-main: #121212;
  --bg-card: #1e1e1e;
  --text-main: #ffffff;
  --text-sub: #888888;
  --text-highlight: #4facfe;
  --border: #2a2a2a;
  --input-bg: #2a2a2a;
  --modal-bg: #1e1e1e;

  width: 100%;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding-top: max(16px, env(safe-area-inset-top));
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 90px;
  min-height: 100vh;
  box-sizing: border-box;
}

/* Light Mode */
.container.light-mode {
  --bg-main: #f8f9fa;
  --bg-card: #ffffff;
  --text-main: #212529;
  --text-sub: #6c757d;
  --text-highlight: #0066ff;
  --border: #e9ecef;
  --input-bg: #f1f3f5;
  --modal-bg: #ffffff;
}

/* Floating Button */
.btn-floating-add {
  position: fixed;
  bottom: max(20px, env(safe-area-inset-bottom));
  left: 16px;
  right: 16px;
  background: #10b981;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  cursor: pointer;
  z-index: 10;
  width: auto;
  transform: none;
}

/* Scrollbar Design */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}
</style>
