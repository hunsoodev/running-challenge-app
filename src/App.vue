<script setup>
import { ref, computed, watch, onMounted } from "vue";
import confetti from "canvas-confetti";
import { useSchedule } from "./hooks/useSchedule.js";

// 2. 함수 실행해서 필요한 변수와 함수들을 쏙쏙 뽑아오기
const {
  showScheduleModal,
  isEditMode,
  newSche,
  sortedSchedules, // 정렬된 리스트
  openScheduleModal, // 모달 열기 함수
  saveSchedule, // 저장 함수
  deleteSchedule, // 삭제 함수 (필요시 사용)
  formatDateFull,
  formatRegDate,
  getBadgeInfo,
  isRaceFinished,
  isRegEnded,
} = useSchedule();

// ==========================================
// 🌓 [NEW] 다크/라이트 모드 설정
// ==========================================
const isDarkMode = ref(true); // 기본은 다크모드

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem(
    "running-crew-theme",
    isDarkMode.value ? "dark" : "light",
  );
};

// ==========================================
// 🔒 1. 보안 설정
// ==========================================
const ACCESS_CODE = "soso1";
const isLoggedIn = ref(false);
const inputCode = ref("");
const loginError = ref(false);
const loginSuccess = ref(false);

const tryLogin = () => {
  if (inputCode.value === ACCESS_CODE) {
    // 1. 성공 상태 ON (입력창 초록색 변경용)
    loginSuccess.value = true;

    // 2. 햅틱 피드백 (모바일에서 '징-' 진동) -> 안드로이드에서만 울림
    if (navigator.vibrate) navigator.vibrate(50);

    // 3. 0.5초 뒤에 화면 전환 (성공 효과 보여줄 시간 벌기)
    setTimeout(() => {
      localStorage.setItem("running-crew-auth", ACCESS_CODE);
      isLoggedIn.value = true;
      loadData();
      window.scrollTo(0, 0);
    }, 2000); // 1초 딜레이
  } else {
    // 실패 시 (기존 유지)
    loginError.value = true;
    inputCode.value = "";
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // 실패 시 '지징-지징'
    setTimeout(() => (loginError.value = false), 1000);
  }
};

// ==========================================
// ⚙️ 2. 기본 설정
// ==========================================
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const STORAGE_KEY = `running-challenge-${year}-${month}`;

const quotes = [
  "시작이 반이다 👟",
  "추위를 뚫고 달리는 당신 🔥",
  "봄바람과 함께 🌸",
  "꽃길만 뛰자 🏃",
  "땀 흘리는 당신이 아름답다 ✨",
  "뜨거운 열정 ☀️",
  "심장은 뛴다 ☔️",
  "한계는 없다 🚀",
  "달리기 좋은 날 🍂",
  "꾸준함이 실력이다 🍁",
  "자신에게 승리하라 ⚔️",
  "후회 없이 달려보자 🏁",
];
const currentQuote = quotes[month - 1] || "오늘도 즐겁게 달리세요!";

// ==========================================
// 💾 3. 데이터 관리
// ==========================================
const runners = ref([]);
const DEFAULT_PRIZE = "상품을 입력해주세요 🎁";
const eventPrize = ref(DEFAULT_PRIZE);
const showPrizeModal = ref(false);
const inputPrizeName = ref(""); // 입력창에 바인딩할 변수

const loadData = () => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) runners.value = JSON.parse(savedData);
  else runners.value = [];

  const savedPrize = localStorage.getItem(`${STORAGE_KEY}-prize`);
  // 저장된 게 있으면 덮어씌우고, 없으면 기본값 유지
  if (savedPrize) {
    eventPrize.value = savedPrize;
  } else {
    eventPrize.value = DEFAULT_PRIZE;
  }
};

const openPrizeModal = () => {
  // 👇 핵심 로직 변경
  // 현재 값이 '기본 멘트(상품을 입력해주세요)'랑 같으면? -> 빈칸으로 시작
  // 이미 '치킨' 같은 걸 써놨으면? -> 수정해야 하니까 '치킨' 보여줌
  if (eventPrize.value === DEFAULT_PRIZE) {
    inputPrizeName.value = "";
  } else {
    inputPrizeName.value = eventPrize.value;
  }

  showPrizeModal.value = true;
};

// 2. 저장하기 (새로 만든 함수)
const savePrize = () => {
  if (inputPrizeName.value.trim()) {
    eventPrize.value = inputPrizeName.value;
    localStorage.setItem(`${STORAGE_KEY}-prize`, inputPrizeName.value);
    showPrizeModal.value = false; // 모달 닫기
  } else {
    alert("상품명을 입력해주세요!");
  }
};

onMounted(() => {
  // 1. 테마 불러오기
  const savedTheme = localStorage.getItem("running-crew-theme");
  if (savedTheme === "light") isDarkMode.value = false;

  // 2. 로그인 체크
  const savedAuth = localStorage.getItem("running-crew-auth");
  if (savedAuth === ACCESS_CODE) {
    isLoggedIn.value = true;
    loadData();
  }
});

watch(
  runners,
  (newVal) => {
    if (isLoggedIn.value)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
  },
  { deep: true },
);

// ==========================================
// 📊 4. 랭킹 로직
// ==========================================
const sortedRunners = computed(() => {
  return [...runners.value].sort((a, b) => {
    const aDone = a.current >= a.goal;
    const bDone = b.current >= b.goal;
    if (aDone && bDone) {
      if (!a.completedAt) return 1;
      if (!b.completedAt) return -1;
      return a.completedAt - b.completedAt;
    }
    if (aDone && !bDone) return -1;
    if (!aDone && bDone) return 1;
    const rateA = a.goal > 0 ? a.current / a.goal : 0;
    const rateB = b.goal > 0 ? b.current / b.goal : 0;
    return rateB - rateA;
  });
});

const getRate = (current, goal) => {
  if (!goal || goal === 0) return "0";
  return Math.min(100, (current / goal) * 100).toFixed(0);
};

// ==========================================
// 📝 5. 멤버 관리 & 기록
// ==========================================
const showAddModal = ref(false);
const showRecordModal = ref(false);
const selectedId = ref("");
const inputDistance = ref("");
const newName = ref("");
const newGoal = ref("");
const newAvatar = ref("🏃‍♂️");

// prettier-ignore
// const avatars = [
//   '🏃', '🏃‍♂️', '🏃‍♀️', '⚡', '🔥', '👟', '🥇', '🏆', '⏱️', '💦',
//   '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🦈', '🐊',
//   '😀', '😃', '😄', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖',
//   '🏔️', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️', '🏟️', '🏛️', '🏗️', '🧱', '🪵', '🛖', '🏘️', '🏚️', '🏠', '🏡', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '♨️', '🎠', '🎡', '🎢', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🦽', '🦼', '🛺', '🚲', '🛴', '🛹', '🛼', '🚏', '🛣️', '🛤️', '🛢️', '⛽', '🚨', '🚥', '🚦', '🛑', '🚧', '⚓', '⛵', '🛶', '🚤', '🛳️', '⛴️', '🛥️', '🚢', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚁', '🚟', '🚠', '🚡', '🛰️', '🚀', '🛸', '🛎️', '🧳', '⌛', '⏳', '⌚', '⏰', '⏱️', '⏲️', '🕰️', '🌡️', '⛱️', '🧨', '🎈', '🎉', '🎊', '🎎', '🎏', '🎐', '🎀', '🎁', '🔮', '🧿', '🎮', '🕹️', '🎰', '🎲', '🧩', '🧸', '🪅', '🪆', '🃏', '🀄', '🎴', '🎭', '🖼️', '🎨', '🧵', '🧶', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '🥻', '🩴', '🩱', '🩲', '🩳', '👙', '👚', '👛', '👜', '👝', '🛍️', '🎒', '👞', '👟', '🥾', '🥿', '👠', '👡', '🩰', '👢', '👑', '👒', '🎩', '🎓', '🧢', '🪖', '⛑️', '📿', '💄', '💍', '💎', '🔇', '🔈', '🔉', '🔊', '📢', '📣', '📯', '🔔', '🔕', '🎼', '🎵', '🎶', '🎙️', '🎚️', '🎛️', '🎤', '🎧', '📻', '🎷', '🪗', '🎸', '🎹', '🎺', '🎻', '🪕', '🥁', '🪘', '📱', '📲', '☎️', '📞', '📟', '📠', '🔋', '🔌', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎞️', '📽️', '🎬', '📺', '📷', '📸', '📹', '📼', '🔍', '🔎', '🕯️', '💡', '🔦', '🏮', '🪔', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞️', '📑', '🔖', '🏷️', '💰', '🪙', '💴', '💵', '💶', '💷', '💸', '💳', '🧾', '✉️', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳️', '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝', '💼', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️', '🔨', '🪓', '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '🔫', '🪃', '🏹', '🛡️', '🪚', '🔧', '🪛', '🔩', '⚙️', '🗜️', '⚖️', '🦯', '🔗', '⛓️', '🪝', '🧰', '🧲', '🪜', '⚗️', '🧪', '🧫', '🧬', '🔬', '🔭', '📡', '💉', '🩸', '💊', '🩹', '🩺', '🚪', '🛗', '🪞', '🪟', '🛏️', '🛋️', '🪑', '🚽', '🪠', '🚿', '🛁', '🪤', '🪒', '🧴', '🧷', '🧹', '🧺', '🧻', '🪣', '🧼', '🫧', '🪥', '🧽', '🧯', '🛒', '🚬', '⚰️', '🪦', '⚱️'
// ];

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
]

// [NEW] 선택된 멤버 정보 가져오기
const selectedRunner = computed(() => {
  return (
    runners.value.find((r) => r.id === selectedId.value) || {
      name: "",
      avatar: "",
    }
  );
});

const addMember = () => {
  if (!newName.value || !newGoal.value)
    return alert("이름과 목표를 입력해주세요!");
  const nameToCheck = newName.value.trim();
  if (runners.value.some((r) => r.name === nameToCheck))
    return alert(`이미 있는 이름입니다.`);

  runners.value.push({
    id: Date.now(),
    name: nameToCheck,
    goal: parseFloat(newGoal.value),
    current: 0,
    avatar: newAvatar.value,
    completedAt: null,
  });
  showAddModal.value = false;
  newName.value = "";
  newGoal.value = "";
};

const openRecordModal = (id) => {
  selectedId.value = id;
  inputDistance.value = "";
  showRecordModal.value = true;
};

const saveRecord = () => {
  const target = runners.value.find((r) => r.id === selectedId.value);
  if (target && inputDistance.value) {
    const oldCurrent = target.current;
    target.current = parseFloat(
      (target.current + parseFloat(inputDistance.value)).toFixed(2),
    );
    if (target.current < 0) target.current = 0;

    if (oldCurrent < target.goal && target.current >= target.goal) {
      if (!target.completedAt) {
        target.completedAt = Date.now();
        confetti({ particleCount: 150, spread: 60, origin: { y: 0.6 } });
        alert(`🎉 축하합니다! ${target.name}님 완주 성공!`);
      }
    }
    if (target.current < target.goal) target.completedAt = null;

    showRecordModal.value = false;
  }
};

const deleteMember = () => {
  if (confirm("정말 삭제하시겠습니까? (복구 불가)")) {
    runners.value = runners.value.filter((r) => r.id !== selectedId.value);
    showRecordModal.value = false;
  }
};

// ==========================================
// 🎰 룰렛 로직 (완전 수정됨)
// ==========================================
const showRouletteModal = ref(false);
const candidates = ref([]);
const rotation = ref(0);
const winnerName = ref(null);
const isSpinning = ref(false); // 돌고 있는지 확인

// 🎨 룰렛 색상 팔레트 (다양하고 예쁜 색 12종)
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

// [Computed] 룰렛 배경 그리기 (선명한 경계선)
const wheelStyle = computed(() => {
  const count = candidates.value.length; // 현재 완주한 러너의 수
  if (count === 0) return {};

  const anglePerSlice = 360 / count;
  let gradient = `conic-gradient(from 0deg, `; // 원뿔 그라데이션 속성

  // 색상 하드 스탑(Hard Stop)으로 경계선 만들기
  const stops = candidates.value.map((_, i) => {
    const color = palette[i % palette.length];
    const start = i * anglePerSlice;
    const end = (i + 1) * anglePerSlice;
    // 예: "#FF0000 0deg 90deg" -> 색이 번지지 않음
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

// 2.텍스트 위치
const getTextStyle = (index) => {
  const count = candidates.value.length; // 후보자 수
  const anglePerSlice = 360 / count;
  const midAngle = index * anglePerSlice + anglePerSlice / 2;

  return {
    transform: `rotate(${midAngle}deg)`,
  };
};

const openRoulette = () => {
  candidates.value = runners.value.filter((r) => r.current >= r.goal);
  if (candidates.value.length === 0)
    return alert("아직 완주한 러너가 없습니다!");

  showRouletteModal.value = true;
  winnerName.value = null;
  rotation.value = 0; // 각도 초기화
  isSpinning.value = false;
};

// [Core] 돌리기 로직 (수학적 계산)
const spinWheel = () => {
  if (candidates.value.length === 0 || isSpinning.value) return;

  isSpinning.value = true;
  winnerName.value = null;

  // 1. 당첨자 랜덤 선정
  const winnerIndex = Math.floor(Math.random() * candidates.value.length);

  // 2. 회전 각도 계산
  const count = candidates.value.length;
  const anglePerSlice = 360 / count;

  // 당첨자가 있는 칸의 '중앙' 각도
  const winnerCenterAngle = winnerIndex * anglePerSlice + anglePerSlice / 2;

  // 3. 목표 회전값 설정
  // 기본 5바퀴(1800도) + (360 - 당첨자각도)
  // (360 - 각도)를 하는 이유는 룰렛이 시계방향으로 돌기 때문입니다.
  // 예: 당첨자가 90도(3시)에 있다면, 270도를 더 돌려야 12시(화살표)에 옴.
  const targetRotation = 1800 + (360 - winnerCenterAngle);

  rotation.value = targetRotation;

  // 4. 결과 발표 (3초 후)
  setTimeout(() => {
    winnerName.value = candidates.value[winnerIndex].name;
    isSpinning.value = false;
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
  }, 3000);
};

// 모달 닫기 (돌리지 않아도 닫을 수 있음)
const closeRoulette = () => {
  if (isSpinning.value) return; // 도는 중엔 못 닫음
  showRouletteModal.value = false;
};

watch(
  // 감시할 변수들 (모달 상태값 3개)
  [showAddModal, showRecordModal, showRouletteModal],
  ([val1, val2, val3]) => {
    // 셋 중 하나라도 true면(열려있으면)
    if (val1 || val2 || val3) {
      document.body.style.overflow = "hidden"; // 스크롤 잠금 🔒
    } else {
      document.body.style.overflow = ""; // 스크롤 해제 🔓
    }
  },
);
</script>

<template>
  <div v-if="!isLoggedIn" class="login-container">
    <div class="login-box">
      <div class="lock-icon">🔒</div>
      <h2>크루 전용 공간</h2>
      <p>공유받은 인증 코드를 입력하세요.</p>
      <div
        class="code-input-wrap"
        :class="{ error: loginError, success: loginSuccess }"
      >
        <input
          type="password"
          v-model="inputCode"
          placeholder="Code"
          maxlength="10"
          @keyup.enter="tryLogin"
          :disabled="loginSuccess"
        />
        <button @click="tryLogin">
          {{ loginSuccess ? "✔" : "➜" }}
        </button>

        <div
          class="loading-bar"
          :style="{ width: loginSuccess ? '100%' : '0%' }"
        ></div>
      </div>
      <p v-if="loginError" class="error-msg">코드가 일치하지 않습니다.</p>
      <p v-if="loginSuccess" class="success-msg">인증 성공! 환영합니다 👋</p>
    </div>
  </div>

  <div v-else class="container" :class="{ 'light-mode': !isDarkMode }">
    <header>
      <div class="header-top">
        <div class="date-badge">{{ year }}년 {{ month }}월 챌린지</div>
        <button class="btn-theme" @click="toggleTheme">
          {{ isDarkMode ? "☀️" : "🌙" }}
        </button>
      </div>
      <h1>{{ currentQuote }}</h1>

      <section class="schedule-section">
        <div class="section-header">
          <div class="header-left">
            <!-- <h3>📅 일정</h3> -->
            <button class="btn-add-chip" @click="openScheduleModal()">
              <span>+</span> 등록
            </button>
          </div>
          <div class="swipe-hint"><span class="swipe-icon">👉</span></div>
        </div>

        <div class="horizontal-scroll-wrap" id="schedule-scroll-container">
          <div
            v-for="sche in sortedSchedules"
            :key="sche.id"
            class="marathon-card"
            :class="{ finished: isRaceFinished(sche.raceDate) }"
            @click="openScheduleModal(sche)"
          >
            <div class="card-top">
              <div class="badge-group">
                <span class="status-badge" :class="getBadgeInfo(sche).class">
                  {{ getBadgeInfo(sche).text }}
                </span>

                <a
                  v-if="sche.url"
                  :href="sche.url"
                  target="_blank"
                  class="btn-link-icon"
                  @click.stop
                >
                  🌐 홈
                </a>
              </div>
            </div>

            <div class="m-info">
              <h4 class="m-title">{{ sche.title }}</h4>
              <div class="m-dates">
                <p class="race-date">🏃 {{ formatDateFull(sche.raceDate) }}</p>
                <p
                  class="reg-date"
                  :class="{ end: isRegEnded(sche.regEndDate) }"
                >
                  🎫 {{ formatRegDate(sche.regEndDate) }}
                </p>
              </div>
              <p class="m-loc">📍 {{ sche.location }}</p>
            </div>
          </div>
        </div>
      </section>

      <div
        v-if="showScheduleModal"
        class="modal-dim"
        @click="showScheduleModal = false"
      >
        <div class="modal-content register-modal" @click.stop>
          <div class="modal-header">
            <h3>{{ isEditMode ? "🔧 일정 수정하기" : "📅 새 대회 등록" }}</h3>
            <button class="btn-icon-close" @click="showScheduleModal = false">
              ✕
            </button>
          </div>

          <div class="register-body compact-mode">
            <div class="form-row">
              <label>대회명</label>
              <input
                type="text"
                v-model="newSche.title"
                placeholder="대회명 입력"
              />
            </div>

            <div class="form-row">
              <label>대회일시</label>
              <input
                type="datetime-local"
                v-model="newSche.raceDate"
                class="input-date-full"
              />
            </div>

            <div class="form-row">
              <label>접수일</label>
              <input
                type="date"
                v-model="newSche.regEndDate"
                class="input-date-full"
              />
            </div>

            <div class="form-row">
              <label>장소</label>
              <input
                type="text"
                v-model="newSche.location"
                placeholder="장소 입력"
              />
            </div>

            <div class="form-row">
              <label>링크</label>
              <input type="url" v-model="newSche.url" placeholder="https://" />
            </div>

            <div v-if="isEditMode" style="margin-top: 15px; text-align: center">
              <button class="btn-text-delete" @click="deleteSchedule">
                이 일정 삭제하기
              </button>
            </div>
          </div>

          <button class="btn-register-blue" @click="saveSchedule">
            {{ isEditMode ? "수정 완료 ✨" : "일정 등록하기 🚀" }}
          </button>
        </div>
      </div>
    </header>

    <div class="event-card">
      <div class="event-label" @click="openPrizeModal">
        🎉 THIS MONTH'S EVENT
      </div>
      <div class="event-title" @click="openPrizeModal">{{ eventPrize }}</div>
      <button class="btn-lottery" @click="openRoulette">
        🎲 완주자 룰렛 돌리기
      </button>
    </div>

    <div
      v-if="showPrizeModal"
      class="modal-dim"
      @click="showPrizeModal = false"
    >
      <div class="modal-content prize-modal" @click.stop>
        <div class="modal-header">
          <h3>🎁 상품 수정</h3>
          <button class="btn-icon-close" @click="showPrizeModal = false">
            ✕
          </button>
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
              @keyup.enter="savePrize"
            />
            <span class="focus-border"></span>
          </div>
        </div>

        <div class="btn-group-col">
          <button class="btn-confirm-gradient" @click="savePrize">
            수정 완료 ✨
          </button>

          <button class="btn-text-cancel" @click="showPrizeModal = false">
            취소
          </button>
        </div>
      </div>
    </div>

    <div v-if="runners.length === 0" class="empty-state">
      <p>등록된 러너가 없습니다.<br />가장 먼저 등록해보세요!</p>
    </div>

    <div class="rank-list">
      <div
        v-for="(runner, index) in sortedRunners"
        :key="runner.id"
        class="rank-card"
        @click="openRecordModal(runner.id)"
      >
        <div class="rank-badge" :class="`rank-${index}`">
          <span v-if="runner.current >= runner.goal">👑</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="info-area">
          <div class="row-top">
            <span class="name">{{ runner.avatar }} {{ runner.name }}</span>
            <span
              class="percent"
              :class="{ 'goal-ok': runner.current >= runner.goal }"
            >
              {{ getRate(runner.current, runner.goal) }}%
            </span>
          </div>
          <div class="progress-bar">
            <div
              class="fill"
              :style="{ width: getRate(runner.current, runner.goal) + '%' }"
              :class="{ 'fill-ok': runner.current >= runner.goal }"
            ></div>
          </div>
          <div class="row-bottom">
            <span v-if="runner.completedAt" class="finish-time">
              🏁 완주: {{ new Date(runner.completedAt).getMonth() + 1 }}/{{
                new Date(runner.completedAt).getDate()
              }}
            </span>
            <span class="total">{{ runner.current }}km&nbsp;</span>
            <span class="goal">/ {{ runner.goal }}km</span>
          </div>
        </div>
      </div>
    </div>

    <button class="btn-floating-add" @click="showAddModal = true">
      + 멤버 등록
    </button>

    <div
      v-if="showRecordModal"
      class="modal-dim"
      @click="showRecordModal = false"
    >
      <div class="modal-content record-modal" @click.stop>
        <div class="modal-header">
          <h3>🚩 기록하기</h3>
          <button class="btn-icon-close" @click="showRecordModal = false">
            ✕
          </button>
        </div>

        <div class="profile-section">
          <div class="avatar-circle">{{ selectedRunner.avatar }}</div>
          <span class="runner-name">{{ selectedRunner.name }}</span>
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

        <button class="btn-confirm-full" @click="saveRecord">저장 완료</button>

        <div class="delete-section">
          <button class="btn-text-delete" @click="deleteMember">
            멤버 삭제하기
          </button>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-dim" @click="showAddModal = false">
      <div class="modal-content register-modal" @click.stop>
        <div class="modal-header">
          <h3>👋 새 러너 등록</h3>
          <button class="btn-icon-close" @click="showAddModal = false">
            ✕
          </button>
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
                v-for="a in avatars"
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

        <button class="btn-register-blue" @click="addMember">
          환영합니다! 등록하기 🚀
        </button>
      </div>
    </div>

    <div
      v-if="showRouletteModal"
      class="modal-dim"
      @click="winnerName && (showRouletteModal = false)"
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
  </div>
</template>

<style scoped>
/* ========================
   CSS Variables & Color System
   ======================== */
/* 기본 (다크모드) */
.container {
  --bg-main: #121212;
  --bg-card: #1e1e1e;
  --text-main: #ffffff;
  --text-sub: #888888;
  --text-highlight: #4facfe;
  --border: #333333;
  --input-bg: #333333;
  --modal-bg: #222222;
  --shadow: rgba(0, 0, 0, 0.5);

  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  background-color: var(--bg-main);
  color: var(--text-main);
  padding-top: max(20px, env(safe-area-inset-top)); /* 노치 영역만큼 더 띄움 */
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 100px;
  box-shadow: 0 0 50px var(--shadow);
  min-height: 100vh;
  box-sizing: border-box;
  transition: background 0.3s;
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 라이트모드 오버라이드 */
.container.light-mode {
  --bg-main: #f4f6f8;
  --bg-card: #ffffff;
  --text-main: #2c3e50;
  --text-sub: #64748b;
  --text-highlight: #2563eb;
  --border: #e2e8f0;
  --input-bg: #f1f5f9;
  --modal-bg: #ffffff;
  --shadow: rgba(0, 0, 0, 0.1);
}

:global(html),
:global(body) {
  overflow: hidden;
  overscroll-behavior: none;
  margin: 0;
  background-color: #222;
  justify-content: center;
  min-height: 100vh;
  font-family: "Pretendard", sans-serif;
}

/* 전체 폼 래퍼 */
.register-body.compact-mode {
  width: 100%;
  padding: 10px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0; /* 갭을 없애고 border로 구분 */
}

/* ㅡ 가로 한 줄 (Row) 스타일 */
.form-row {
  display: flex;
  align-items: center; /* 수직 중앙 정렬 */
  justify-content: space-between;
  padding: 12px 5px;
  border-bottom: 1px solid var(--border); /* 밑줄로 구분 */
}

/* 마지막 줄은 밑줄 제거 */
.form-row:last-of-type {
  border-bottom: none;
}

/* 왼쪽 라벨 (고정 너비) */
.form-row label {
  font-size: 0.95rem;
  font-weight: bold;
  color: var(--text-main);
  width: 70px; /* 라벨 너비 고정 */
  flex-shrink: 0; /* 줄어들지 않음 */
}

/* 오른쪽 입력창 (나머지 공간 다 차지) */
.form-row input {
  flex: 1; /* 남은 공간 꽉 채움 */
  border: none; /* 테두리 제거 (깔끔하게) */
  background: transparent;
  text-align: right; /* 오른쪽 정렬 (설정앱 스타일) */
  font-size: 1rem;
  color: var(--text-main); /* 다크모드 대응 */
  outline: none;
  padding: 0;
}

.form-row input::placeholder {
  color: var(--text-sub);
  opacity: 0.5;
  font-size: 0.9rem;
}

/* 📅 날짜 그룹 (한 줄에 2개) */
.date-group {
  padding: 8px 0; /* 위아래 여백 살짝 줄임 */
}

.half-col {
  flex: 1;
  display: flex;
  flex-direction: column; /* 라벨 위, 입력 아래 */
  align-items: center;
  gap: 4px;
}
.half-col label {
  width: auto;
  font-size: 0.8rem;
  color: var(--text-sub); /* 보조색 */
}
.half-col input {
  text-align: center;
  width: 100%;
  font-size: 0.9rem;
  font-weight: 600;
  /* 날짜 선택 아이콘 공간 확보 */
}

/* 세로 구분선 */
.divider-vertical {
  width: 1px;
  height: 30px;
  background: var(--border);
  margin: 0 10px;
}

/* 하단 안내 문구 */
.info-text-xs {
  font-size: 0.75rem;
  color: var(--text-sub);
  margin-top: 10px;
  text-align: center;
  background: var(--input-bg);
  padding: 8px;
  border-radius: 8px;
}
/* Header & Theme Toggle */
header {
  text-align: center;
  margin-bottom: 20px;
}
.header-top {
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
  height: 40px;
}
.date-badge {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: inline-block;
  background: var(--bg-card);
  color: var(--text-highlight);
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: bold;
  white-space: nowrap;
}
.btn-theme {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
h1 {
  margin: 5px 0 10px; /* 위 - 좌우 - 아래 */
  font-size: 1.6rem;
  word-break: keep-all;
  color: var(--text-main);
}

/* Login */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #121212;
  color: white;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}
.login-box {
  text-align: center;
  width: 80%;
}
.lock-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

.code-input-wrap {
  position: relative;
  display: flex;
  background: #222;
  border: 1px solid #444;
  border-radius: 50px;
  overflow: hidden;
  padding: 5px;
  margin-bottom: 10px;
  /* 👇 [추가] 색상이 바뀔 때 부드럽게 변하도록 설정 */
  transition: all 0.3s ease;
}

/* 실제 입력칸 */
.code-input-wrap input {
  flex: 1;
  background: transparent;
  color: white;
  padding: 10px;
  font-size: 1.2rem;
  text-align: center;
  outline: none;
  border: none;
}

/* [NEW] 로딩 게이지 스타일 : 부모 요소 바닥에 딱 붙어서 2초 동안 차오르는 게이지바 */
.loading-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px; /* 게이지 두께 */
  background-color: #00f260; /* 성공 초록색 */

  /* 👇 핵심: 0%에서 100%로 찰 때 걸리는 시간을 JS의 setTimeout 시간과 맞춤 */
  transition: width 2s linear;

  z-index: 10;
}

.code-input-wrap.error {
  border-color: #ff6b6b;
  animation: shake 0.3s;
}

.error-msg {
  color: #ff6b6b;
  font-size: 0.8rem;
}

/* 👇 [추가] 성공 상태 (네온 그린 효과) */
.code-input-wrap.success {
  border-color: #00f260;
  box-shadow: 0 0 15px rgba(0, 242, 96, 0.5); /* 초록색 빛 번짐 */
}

.code-input-wrap button {
  background: #ff512f; /* 기본 주황색 */
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1.2rem;

  /* 👇 [추가] 버튼도 부드럽게 변하도록 설정 */
  transition: all 0.3s ease;
}

/* 👇 [추가] 성공 시 버튼 스타일 변경 */
.code-input-wrap.success button {
  background-color: #00f260; /* 초록색으로 변경 */
  transform: scale(1.1); /* 기분 좋게 살짝 커짐 */
}

/* 👇 [추가] 성공 메시지 스타일 */
.success-msg {
  color: #00f260;
  font-size: 0.9rem;
  margin-top: 15px;
  font-weight: bold;
  animation: fadeUp 0.3s forwards; /* 아래에서 위로 쓱 나타남 */
}

/* ---- 📅 일정 섹션 (간격 및 디자인 수정) ---- */
.schedule-section {
  /* 👇 위쪽 마진을 10px로 확 줄여서 룰렛 바로 아래 붙임 */
  margin: 10px 0 5px 0;
  padding-left: 0;
  position: relative;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center; /* 수직 중앙 정렬 */
  padding-right: 20px;
  margin-bottom: 12px; /* 헤더랑 카드 사이도 가깝게 */
}
/* 왼쪽 그룹 (제목+버튼) */
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left h3 {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

/* ➕ 등록 버튼 (칩 스타일) */
.btn-add-chip {
  background: rgba(79, 172, 254, 0.1);
  color: #4facfe;
  border: 1px solid rgba(79, 172, 254, 0.2);
  border-radius: 12px;
  padding: 3px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  transition: all 0.2s;
}

.btn-add-chip:active {
  transform: scale(0.95);
  background: rgba(79, 172, 254, 0.2);
}

/* 👉 스와이프 힌트 (심플하게) */
.swipe-hint {
  font-size: 0.75rem;
  color: var(--text-sub);
  display: flex;
  align-items: center;
  gap: 5px;
  opacity: 0.7;
  font-weight: 500;
}
.swipe-icon {
  font-size: 0.9rem;
  display: inline-block;
  animation: bounce-right 1.5s infinite; /* 움직이는 애니메이션 */
}
@keyframes bounce-right {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(3px);
  }
}
/* 가로 스크롤 컨테이너 */
.horizontal-scroll-wrap {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  /* ⭐ [핵심 1] 화면 양옆 끝까지 뚫고 나가라! (부모 패딩 무시) */
  /* 부모 컨테이너(App.vue)의 패딩이 20px라고 가정 */
  margin-left: -20px;
  margin-right: -20px;

  /* ⭐ [핵심 2] 뚫고 나갔지만, 첫 번째 카드는 다시 라인에 맞춰라! */
  padding-left: 20px;

  /* 오른쪽 끝 여백 (스크롤했을 때 딱 붙지 않게) */
  padding-right: 20px;

  /* 스크롤바 숨김 */
  -ms-overflow-style: none;
  scrollbar-width: none;
  scroll-snap-type: x mandatory; /* 스냅 효과 유지 */
}

.horizontal-scroll-wrap::-webkit-scrollbar {
  display: none;
}

/* ---- 🎫 마라톤 카드 (심플 버전) ---- */
.marathon-card {
  min-width: 160px;
  height: 125px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 16px;

  /* ⭐ 핵심 수정: 부모가 뭐라고 하든 나는 왼쪽 정렬한다! */
  text-align: left;
  align-items: flex-start; /* 플렉스 아이템들도 왼쪽 정렬 */

  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  cursor: pointer; /* 클릭 가능하다는 표시 */
  transition:
    transform 0.2s,
    opacity 0.3s;
}
/* 링크가 있으면 마우스 올렸을 때 살짝 떠오름 */
.marathon-card.has-link:active {
  transform: scale(0.98);
}

/* ⭐ 활성화 규칙 변경: 오직 '대회가 끝났을 때(finished)'만 흐려짐 */
.marathon-card.finished {
  filter: grayscale(1);
  opacity: 0.5;
  background: #f1f3f5;
  pointer-events: none; /* 끝난 대회는 수정도 불가하게 막음 (선택사항) */
}

/* 배지와 링크를 한 줄에 묶는 그룹 */
.badge-group {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 양끝 정렬 */
  width: 100%; /* 너비 100% 필수 */
}

/* 상태별 색상 */
.urgent {
  color: #f59f00;
} /* 접수중 D-Day */
.urgent::before {
  background: #f59f00;
}

.upcoming {
  color: #339af0;
} /* 대회 D-Day */
.upcoming::before {
  background: #339af0;
}

.reg-closed {
  color: #fa5252;
} /* 접수는 끝남 (하지만 카드는 생생함!) */
.reg-closed::before {
  background: #fa5252;
}

.finished {
  color: #adb5bd;
} /* 대회 종료 */
.finished::before {
  background: #adb5bd;
}

/* ---- 상단 배지 (색상 빼고 점으로 표시) ---- */
.card-top {
  display: flex;
  width: 100%;

  align-items: center;
  margin-bottom: 8px;
  height: auto;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 배지 앞의 색상 점 (Dot) */
.status-badge::before {
  content: "";
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* 상태별 색상 (배경색 대신 글자색과 점 색깔만 변경) */
.urgent {
  color: #f59f00;
} /* 접수중: 오렌지 */
.urgent::before {
  background: #f59f00;
}

.upcoming {
  color: #339af0;
} /* 예정: 블루 */
.upcoming::before {
  background: #339af0;
}

.closed {
  color: #adb5bd;
} /* 마감: 회색 */
.closed::before {
  background: #adb5bd;
}

/* ---- 🌐 홈페이지 아이콘 (배지 옆에 붙는 스타일) ---- */
.btn-link-icon {
  /* 👇 위치를 강제로 지정해서 배지 높이에 영향 안 줌 */
  position: absolute;
  top: 15px; /* 카드의 padding-top과 비슷하게 맞춤 */
  right: 15px; /* 카드의 padding-right와 비슷하게 맞춤 */
  z-index: 20; /* 전체 클릭 오버레이보다 위에 있어야 클릭됨! */

  text-decoration: none;
  font-size: 0.7rem;
  color: var(--text-sub);
  background: var(--input-bg);
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  gap: 3px;
  transition: all 0.2s;
}
/* ---- 정보 텍스트 (심플하게) ---- */
.m-info {
  width: 100%; /* 너비 꽉 채우기 */
  flex: 1;
  display: flex;
  flex-direction: column;
  /* align-items: flex-start;  <-- 이것도 추가하면 확실합니다 */
}
.btn-link-icon:active {
  transform: scale(0.9);
}
.m-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.m-dates p {
  margin: 2px 0;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-sub); /* 기본 회색 */
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 접수일 강조 (빨간색 뺌) */
.reg-date {
  color: var(--text-main); /* 중요하니까 진하게 */
  font-weight: 700;
}
.reg-date.end {
  text-decoration: line-through;
  color: var(--text-sub);
  font-weight: 500;
}

/* 장소 (맨 아래 텍스트) */
.m-loc {
  font-size: 0.7rem;
  color: var(--text-sub);
  margin-top: auto;
  padding-top: 5px;

  /* ⭐ 혹시 모르니 여기도 왼쪽 강제 */
  text-align: left;
  width: 100%;
}

/* 날짜 입력창 스타일 (아이폰 터치 버그 방지용) */
.input-date-full {
  text-align: right;
  width: 100%;

  /* ⭐ 핵심 1: 최소 높이를 줘서 터치 영역 강제 확보 */
  height: 40px;
  min-height: 40px;

  font-family: inherit;
  font-size: 1rem;
  background: transparent;
  border: none;
  color: var(--text-main);
  outline: none;

  /* ⭐ 핵심 2: 투명도 1 (가끔 비어있으면 투명해지는 버그 방지) */
  opacity: 1;

  /* 아이폰 기본 스타일 제거 (필요시 사용) */
  /* -webkit-appearance: none; */
  /* appearance: none; */
}

/* ⭐ 핵심 3: 값이 비었을 때도 색상이 보이도록 강제 (선택사항) */
.input-date-full:invalid,
.input-date-full:placeholder-shown {
  color: var(--text-sub);
}

/* (참고) .form-row는 기존 그대로 두시면 됩니다! */

/* ---- ⭐ 투명 링크 오버레이 ---- */
.card-link-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: pointer;
}

/* 스크린 리더용 숨김 클래스 */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* Event & Copy */
.event-card {
  background: linear-gradient(135deg, #ffd700 0%, #fdb931 100%);
  color: #000;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 20px;
  text-align: center; /* 모든 글자와 인라인 요소를 가운데로 정렬시킴 */
  cursor: pointer;
  position: relative;
  box-shadow: 0 4px 15px rgba(253, 185, 49, 0.3);
  /* 👇 추가: 변화가 생기면 0.3초 동안 부드럽게 움직여라 */
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.event-label {
  font-size: 0.8rem;
  font-weight: 900;
  opacity: 0.7;
  margin-bottom: 5px;
}
.event-title {
  font-size: 1.3rem;
  font-weight: bold;
  line-height: 1.3;
}
.btn-lottery {
  margin-top: 15px;
  background: white;
  color: #d35400;
  border: 2px solid #d35400;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

/* 📱 1. 모바일 & 공통: 손가락으로 '누르고 있을 때'만 효과 (즉각 반응) */
.event-card:active,
.btn-lottery:active {
  transform: scale(0.98); /* 눌렀을 때 살짝 들어가는 느낌 (강추) */
  background-color: #f0f0f0; /* 살짝 어두워짐 */
  transition: transform 0.1s; /* 아주 빠르게 반응 */
}

/* 💻 2. PC 전용: 마우스가 '확실히 있는' 기기만 호버 적용 */
@media (hover: hover) and (pointer: fine) {
  /* 아까 만든 카드 둥실 효과 */
  .event-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(253, 185, 49, 0.4);
  }

  /* 아까 만든 버튼 색반전 효과 */
  .btn-lottery:hover {
    background-color: #d35400;
    color: white;
  }
}

/* Ranking List */
.empty-state {
  text-align: center;
  color: var(--text-sub);
  padding: 60px 20px;
  border: 2px dashed var(--border);
  border-radius: 16px;
  margin-top: 20px;
  background: var(--bg-card);
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rank-card {
  background: var(--bg-card);
  padding: 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: transform 0.1s;
}
.rank-card:active {
  transform: scale(0.98);
}
.rank-badge {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-sub);
  width: 35px;
  text-align: center;
}

/* .rank-badge.top-3 {
  color: #ffd700;
  font-size: 2rem;
} */

.rank-0 {
  color: #ffd700;
  font-size: 2rem;
} /* 1등 금색 */
.rank-1 {
  color: #c0c0c0;
  font-size: 2rem;
} /* 2등 은색 */
.rank-2 {
  color: #cd7f32;
  font-size: 2rem;
} /* 3등 동색 */

.info-area {
  flex: 1;
}
.row-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  align-items: flex-end;
}
.name {
  font-weight: bold;
  font-size: 1.3rem;
  color: var(--text-main);
}
.percent {
  font-weight: bold;
  color: #ff512f;
  font-size: 1.2rem;
}
.percent.goal-ok {
  color: #00f260;
}
.progress-bar {
  height: 12px;
  background: var(--input-bg);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}
.fill {
  height: 100%;
  background: linear-gradient(90deg, #ff512f, #dd2476);
  width: 0%;
  transition: width 0.5s;
}
.fill.fill-ok {
  background: linear-gradient(90deg, #00f260, #0575e6);
}
.row-bottom {
  display: flex;
  justify-content: flex-end;
  font-size: 1.1rem;
  color: var(--text-sub);
  align-items: baseline;
  margin-top: 5px; /* 프로그레스 바랑 살짝 띄우기 */
}

.total {
  margin-left: auto; /* 왼쪽 공간을 전부 밀어내서 오른쪽으로 붙음 */
}

.finish-time {
  font-size: 0.8rem;
  color: var(--text-highlight);
}

/* Floating Button */
.btn-floating-add {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  z-index: 10;
  width: 80%;
  max-width: 400px;
}

/* Modals Common */
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
.modal-content {
  background: var(--modal-bg);
  color: var(--text-main);
  padding: 30px;
  border-radius: 20px;
  width: 85%;
  max-width: 300px;
  text-align: center;
  border: 1px solid var(--border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

/* 모달창 안에 있는 제목만 콕 집어서 위쪽 여백 삭제 */
.modal-content h3 {
  margin-top: 0; /* 위쪽 공백 제거 */
  padding-top: 0; /* 혹시 모를 안쪽 여백도 제거 */
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

/* 닫기(X) 버튼 */
.btn-icon-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-sub);
  cursor: pointer;
  padding: 5px;
}

/* 3. 입력 섹션 디자인 */
.prize-input-section {
  width: 100%;
  padding: 40px 30px 20px 30px; /* 위아래 여백 넉넉히 */
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

/* 밑줄 입력창 래퍼 */
.input-underline-wrap {
  position: relative;
  width: 100%;
}

/* 실제 입력창 */
.prize-input {
  width: 100%;
  border: none;
  border-bottom: 2px solid var(--border); /* 평소엔 회색 밑줄 */
  background: transparent;
  padding: 10px 0;

  font-size: 1.6rem; /* 글씨 시원하게 */
  font-weight: bold;
  color: var(--text-main);
  text-align: center; /* 가운데 정렬 */
  outline: none;
  transition: all 0.3s;
  border-radius: 0; /* 모서리 각지게 (밑줄이니까) */
}

/* 포커스 됐을 때 밑줄 색상 변경 (상품이니까 핑크빛!) */
.prize-input:focus {
  border-bottom-color: #dd2476;
}
.prize-input::placeholder {
  color: var(--text-sub);
  opacity: 0.3;
}

/* 4. 버튼 그룹 */
.btn-group-col {
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

/* 그라데이션 버튼 (기존 색상 유지하되 쉐입 개선) */
.btn-confirm-gradient {
  width: 100%;
  padding: 16px;

  /* 🎁 기존의 예쁜 그라데이션 유지 */
  background: linear-gradient(90deg, #ff512f, #dd2476);

  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;

  /* 그림자: 핑크빛으로 은은하게 */
  box-shadow: 0 5px 20px rgba(221, 36, 118, 0.3);
  transition:
    transform 0.1s,
    box-shadow 0.2s;
}

/* 취소 버튼: 텍스트로만 심플하게 (배경색 없음) */
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

/* 2. [NEW] 텍스트용 네온 입력창 (상품 입력용) */
/* 기존 .neon-input은 숫자용이라 너무 크므로, 이걸 새로 추가하세요 */
.neon-input-text {
  width: 100%;
  padding: 10px;
  border: none;
  border-bottom: 2px solid #4facfe;
  background: transparent;
  color: #1d99bc;
  font-size: 1.5rem; /* 3.5rem -> 1.5rem (글자 쓰기 딱 좋은 크기) */
  font-weight: bold;
  text-align: center;
  outline: none;
  margin-bottom: 20px;
}

.neon-input-text:focus {
  border-color: #00f2fe;
  text-shadow: 0 0 10px rgba(0, 242, 254, 0.5); /* 은은한 네온 효과 */
}

/* [Trendy] Record Modal */
/* 모달 내부 패딩 조정 */
/* 1. 모달 창 틀 (배경색 중요!) */
.record-modal {
  /* 👇 다크모드 핵심: 배경을 변수로 처리 */
  background-color: var(--bg-card);

  /* 화면 꽉 차게 설정 */
  width: 90vw;
  max-width: 330px;
  padding: 0; /* 헤더를 꽉 채우기 위해 0으로 시작 */
  padding-bottom: 30px; /* 바닥 여백 */

  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden; /* 둥근 모서리 유지 */
  border-radius: 20px; /* 모달 자체도 둥글게 */

  /* 다크모드에서 입체감을 위한 은은한 테두리 */
  border: 1px solid var(--border);
}

/* 2. 헤더: 꽉 찬 디자인 + 고급스러운 구분선 */
.modal-header {
  width: 100%;
  padding: 18px 20px;

  /* 👇 배경색을 카드색과 맞추거나 살짝 다르게 */
  background-color: var(--bg-card);

  /* 👇 다크모드에서 너무 쨍하지 않은 은은한 밑줄 */
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
  color: var(--text-main); /* 흰색(다크모드) / 검정(라이트) */
  letter-spacing: -0.5px;
}

/* 🗑️ 삭제 버튼 (다크모드에서도 잘 보이는 빨강) */
.btn-icon-delete {
  font-size: 0.85rem;
  /* 살짝 파스텔톤 빨강이 다크모드에서 눈이 편함 */
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.15); /* 반투명 배경 */
  padding: 8px 14px;
  border-radius: 20px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-delete:hover {
  background: rgba(255, 107, 107, 0.25);
}

/* 3. 프로필 영역 (위아래 간격 확보) */
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
  background: var(--bg-card); /* 배경색도 테마에 맞게 */
  border: 2px solid var(--border); /* 테두리 추가 */
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); /* 살짝 띄움 */
}

.runner-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--text-main);
}

/* 3. 대형 입력창 (핵심 디자인) */
.big-input-wrap {
  width: 100%;
  position: relative;
  height: 80px; /* 높이 넉넉하게 */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

.big-number-input {
  width: 30%; /* 적당한 너비 */
  border: none;
  border-bottom: 2px solid #ddd; /* 밑줄만 남김 */
  font-size: 2.3rem; /* 압도적인 크기 */
  border-bottom: 2px solid var(--border);
  color: var(--text-main);
  font-weight: 900;
  text-align: center;
  background: transparent;
  outline: none;
  padding-bottom: 5px;
  transition: border-color 0.3s;

  letter-spacing: -2px;
}

/* (선택) 포커스 잡혔을 때 밑줄 대신 은은한 효과 */
.big-number-input::placeholder {
  color: var(--border); /* placeholder 색상을 연하게 */
  opacity: 0.2;
}

.big-number-input:focus {
  border-color: #00f260; /* 포커스 시 브랜드 컬러 */
}

/* 숫자 입력할 때 화살표(스피너) 제거하는 꿀팁 */
.big-number-input::-webkit-inner-spin-button,
.big-number-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.unit {
  position: absolute;
  /* 화면 정중앙(50%)에서 오른쪽으로 살짝 이동 */
  left: 50%;
  transform: translateX(55px); /* 숫자 크기에 맞춰서 조정 (30~50px) */
  /* 혹은 bottom을 줘서 바닥 라인을 맞춤 */
  bottom: 20px;

  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-sub);
}

/* 4. 가이드 텍스트 */
.guide-text-sm {
  font-size: 0.9rem;
  color: var(--text-sub);
  text-align: center;
  margin-bottom: 30px;
  line-height: 1.5;
}

.btn-confirm-full {
  /* 버튼도 양옆 여백을 줘서 꽉 차지만 답답하지 않게 */
  width: calc(100% - 40px);
  margin: 0 20px;
  padding: 16px;
  border-radius: 16px;
  background: #00f260; /* 시그니처 초록색 */
  color: #004d26;
  border: none;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 242, 96, 0.2); /* 은은한 빛 */
}

.btn-confirm-full:active {
  transform: scale(0.98);
}

/* 2. 하단 삭제 영역 */
.delete-section {
  width: 100%;
  margin-top: 15px; /* 저장 버튼이랑 거리 두기 */
  text-align: center;
}

/* 3. 텍스트형 삭제 버튼 (위험하니까 빨간색 글씨로만) */
.btn-text-delete {
  background: transparent;
  border: none;

  /* 빨간색이지만 너무 자극적이지 않게 */
  color: #ff6b6b;

  font-size: 0.9rem;
  text-decoration: underline; /* 누를 수 있다는 표시 */
  text-underline-offset: 4px; /* 밑줄 간격 예쁘게 */
  cursor: pointer;
  padding: 10px;
  opacity: 0.7; /* 평소엔 좀 흐릿하게 */
  transition: opacity 0.2s;
}

/* 꾹 눌렀을 때만 진하게 */
.btn-text-delete:active {
  opacity: 1;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
}

.guide-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 20px;
}
.sub-text {
  font-size: 0.9rem;
  color: #ff512f;
  display: block;
  margin-bottom: 25px;
}
.input-wrap-trendy {
  margin-bottom: 10px;
}
.neon-input {
  width: 90%;
  padding: 15px;
  border: none;
  border-bottom: 3px solid #4facfe;
  background: transparent;
  color: var(--text-main);
  font-size: 3.5rem;
  font-weight: 500;
  text-align: center;
  outline: none;
}
.neon-input:focus {
  border-color: #00f2fe;
  text-shadow: 0 0 20px rgba(0, 242, 254, 0.5);
}
.btn-confirm-trendy {
  margin-top: 20px;
  width: 100%;
  padding: 15px;
  background: linear-gradient(90deg, #ff512f, #dd2476);
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 900;
  cursor: pointer;
  font-size: 1.3rem;
  box-shadow: 0 5px 20px rgba(221, 36, 118, 0.4);
}
.btn-confirm-trendy:active {
  transform: scale(0.98);
  box-shadow: 0 2px 10px rgba(221, 36, 118, 0.3);
}
.delete-area {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: center;
}
.btn-delete {
  background: transparent;
  color: var(--text-sub);
  border: 1px solid var(--border);
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-delete:hover {
  color: #ff6b6b;
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

/* Add Member Modal */
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
.btn-icon-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-sub);
  cursor: pointer;
  padding: 5px;
}

/* 3. 본문 영역 */
.register-body {
  width: 100%;
  padding: 25px 25px 10px 25px; /* 여백 조정 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* 입력 그룹 */
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

/* 세련된 밑줄 입력창 */
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

/* 포커스 시 파란색 강조 */
.underline-input:focus {
  border-bottom-color: #4facfe;
}

/* 4. 아바타 그리드 (핵심 디자인 변경!) */
.avatar-section {
  margin-top: 5px;
}

.avatar-grid-mobile {
  display: grid;
  /* 손가락 크기 고려해서 한 줄에 4개만 배치 (5개는 너무 좁음) */
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
  padding: 5px;

  /* 터치 스크롤 부드럽게 */
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
.avatar-grid-mobile::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

/* 아바타 버튼 (호버 제거 -> 액티브 강화) */
.avatar-btn-mobile {
  aspect-ratio: 1/1; /* 정사각형 비율 유지 */
  background: var(--bg-main);
  border: 1px solid var(--border);
  border-radius: 14px;
  font-size: 1.6rem;

  /* 버튼 중앙 정렬 */
  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;
  /* 모바일 터치 시 하이라이트 제거 (CSS로 직접 제어하기 위해) */
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.1s,
    background-color 0.1s;
}

/* 👆 중요: 호버(:hover)는 삭제하고, 눌렀을 때(:active) 효과만 남김 */
.avatar-btn-mobile:active {
  transform: scale(0.95); /* 꾹 눌리는 느낌 */
  background-color: var(--border); /* 배경 살짝 어둡게 */
}

/* 선택된 상태 */
.avatar-btn-mobile.selected {
  border: 2px solid #4facfe;
  background: rgba(79, 172, 254, 0.15);
  box-shadow: 0 0 0 1px #4facfe; /* 테두리 더 선명하게 */
}

/* ⭐ 선택된 아바타 (파란색 테두리 + 빛남) */
.avatar-btn.selected {
  border: 2px solid #4facfe;
  background: rgba(79, 172, 254, 0.1); /* 연한 파란 배경 */
  transform: scale(1.1); /* 살짝 커짐 */
  box-shadow: 0 4px 10px rgba(79, 172, 254, 0.3);
  z-index: 1;
}

/* 5. 등록 버튼 */
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

  /* 터치 최적화 */
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.3);
  transition: transform 0.1s;
}

.btn-register-blue:active {
  transform: scale(0.98);
  box-shadow: 0 2px 5px rgba(79, 172, 254, 0.2);
}

/* .register-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: left;
  margin-bottom: 20px;
}
.std-input {
  width: 100%;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--text-main);
  font-size: 1.2rem;
  box-sizing: border-box;
}
.register-form label {
  color: var(--text-sub);
  margin-left: 5px;
}
.avatar-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  max-height: 200px;
  overflow-y: auto;
  background: var(--input-bg);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}
.avatar-item {
  font-size: 1.8rem;
  padding: 5px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
}
.avatar-item.active {
  background: rgba(79, 172, 254, 0.2);
  border-color: #4facfe;
}
.full-width {
  width: 100%;
  padding: 15px;
  background: #ff512f;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
} */

/* 룰렛 모달 본체 */
.roulette-content {
  background: #fff;
  /* border: 4px solid #ffd700;  <-- ❌ 이거 삭제! */

  /* 👇 대신 부드러운 그림자 추가 */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);

  color: #333;
  padding: 30px 20px;
  border-radius: 24px; /* 더 둥글게 */
  width: 90%;
  max-width: 340px;
  text-align: center;
  position: relative;
}

/* 1. 룰렛 전체 크기 키움 */
.roulette-container {
  position: relative;
  width: 300px; /* 기존 250~260px -> 300px로 확대 */
  height: 300px;
  margin: 20px auto;
}

/* .roulette-title {
  font-size: 1.5rem;
  margin: 0 0 15px 0;

  font-weight: 600;
  letter-spacing: -1px;
} */
/* 헤더 전체 영역 */
.roulette-header {
  /* 👇 1. 여백 확보: 룰렛이랑 시원하게 떨어뜨림 */
  margin-bottom: 30px;
  text-align: center;
}

/* 메인 제목 */
.roulette-header .title {
  margin: 0;
  font-size: 1.6rem; /* 크기 키움 */
  font-weight: 900; /* 아주 굵게 */
  color: #333;
  letter-spacing: -0.5px;
}

/* "행운" 글자 강조 (포인트 컬러) */
.highlight-text {
  color: #e74c3c; /* 룰렛 핀 색깔과 맞춤 (빨강) */
  /* 혹은 금색: #ffd700 */
  display: inline-block;
}

/* 부제목 (설명글) */
.roulette-header .subtitle {
  margin: 8px 0 0 0; /* 제목이랑 살짝 띄움 */
  font-size: 0.95rem;
  color: var(--text-sub); /* 은은한 회색 */
  font-weight: 500;
}

/* 우측 상단 X 닫기 버튼 */
.btn-close-top {
  position: absolute;
  top: 15px;
  right: 15px;

  /* 👇 동그란 버튼으로 변경 */
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

/* 화살표 */
/* 기존 .pointer 삭제하고 이걸로 교체 */
.pointer {
  position: absolute;
  top: -15px; /* 위치 조정 */
  left: 50%;
  transform: translateX(-50%);
  z-index: 20; /* 룰렛보다 위에 */

  /* 👇 글자 대신 CSS 도형으로 만듦 */
  width: 40px;
  height: 50px;
  background-color: #e74c3c; /* 빨간색 핀 */

  /* 핀 모양 깎기 (클립패스 사용 - 역삼각형 + 사각형) */
  clip-path: polygon(100% 0, 50% 100%, 0 0);

  /* 그림자 효과 (filter 사용) */
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

/* 원판 */
.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;

  /* 테두리를 굵은 단색 대신, 여러 겹으로 줘서 입체감 표현 */
  border: 4px solid #fff;
  box-shadow:
    0 0 0 4px #ffd700,
    /* 바깥쪽에 얇은 금색 테두리 한 겹 더 */ 0 0 20px rgba(0, 0, 0, 0.2); /* 전체 그림자 */

  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

/* 2. 텍스트 배치 최적화 */
.segment-text {
  position: absolute;
  top: 0;
  left: 50%;

  /* 👇 텍스트 박스 너비 확보 및 중앙 정렬 트릭 👇 */
  width: 58px; /* 글자가 들어갈 충분한 너비 */
  margin-left: -30px; /* 너비의 절반만큼 왼쪽으로 당겨서 정중앙 맞춤 */

  height: 40%; /* 반지름 길이 */
  transform-origin: bottom center;

  display: flex;
  justify-content: center;
  padding-top: 30px; /* 테두리에서 안쪽으로 밀어넣기 (공간 확보) */

  font-weight: 900;
  color: #333;
  font-size: 0.83rem; /* 글씨 크기 약간 줄임 (안전하게) */

  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);

  /* 긴 글씨 방어용 (혹시 몰라 추가) */
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

/* 🌟 [NEW] 메인 룰렛 버튼 (울렁거리는 효과) */
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
  animation: pulse 2s infinite; /* 붉은색 펄스 */
  width: 100%;
}
.btn-spin-main:disabled {
  animation: none;
  background: #555;
  cursor: not-allowed;
  box-shadow: none;
}

/* 기존 .btn-close-lottery를 이걸로 교체하세요 */
.btn-close-lottery {
  margin-top: 20px;
  width: 100%;
  padding: 15px;

  background: #f1f3f5; /* 아주 연한 회색 (쿠션감) */
  color: #495057; /* 진한 회색 글씨 */
  border: none;
  border-radius: 15px; /* 둥글게 */

  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-lottery:active {
  transform: scale(0.98);
}

/* Scrollbar Design */
/* 스크롤바 전체 너비 (아주 얇게) */
::-webkit-scrollbar {
  width: 6px; /* 세로 스크롤바 너비 */
  height: 6px; /* 가로 스크롤바 높이 */
}

/* 스크롤바 막대 (움직이는 부분) */
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2); /* 연한 회색 (반투명) */
  border-radius: 10px; /* 둥글게 */
}

/* 막대에 마우스 올렸을 때 */
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.4); /* 조금 진해짐 */
}

/* 스크롤바 뒷배경 (트랙) */
::-webkit-scrollbar-track {
  background: transparent; /* 배경 투명하게 */
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* bounce라는 이름의 애니메이션 정의 */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0); /* 처음과 끝은 제자리 */
  }
  50% {
    transform: translateY(-10px); /* 중간(1초 시점)에 위로 20px 올라감 */
  }
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
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
