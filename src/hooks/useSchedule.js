import { ref, computed, watch, onMounted } from "vue";

export function useSchedule() {
  // ==========================================
  // 💾 1. 상태 (State) - 다른 변수와 안 섞임
  // ==========================================
  const STORAGE_KEY_SCHEDULE = "running-crew-schedules-v1"; // 전용 키 사용
  const showScheduleModal = ref(false);
  const isEditMode = ref(false);

  // 초기 폼 데이터
  const initialForm = {
    id: null,
    title: "",
    raceDate: "", // YYYY-MM-DDTHH:mm
    regEndDate: "",
    location: "",
    url: "",
  };

  const newSche = ref({ ...initialForm });
  const schedules = ref([]); // 일정 리스트

  // ==========================================
  // ⚙️ 2. 데이터 로드 & 저장 (Persistence)
  // ==========================================
  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SCHEDULE);
    if (saved) {
      try {
        schedules.value = JSON.parse(saved);
      } catch (e) {
        schedules.value = [];
      }
    } else {
      // (선택) 초기 샘플 데이터가 필요하면 여기서 설정
      schedules.value = [];
    }
  });

  // 리스트가 변경될 때마다 자동 저장
  watch(
    schedules,
    (newVal) => {
      localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(newVal));
    },
    { deep: true }
  );

  // ==========================================
  // 🧮 3. 정렬 로직 (Sorting)
  // ==========================================
  const sortedSchedules = computed(() => {
    const now = new Date();

    // 1) 아직 안 끝난 대회 (오름차순: 가까운 날짜가 맨 앞)
    const upcoming = schedules.value
      .filter((s) => new Date(s.raceDate) > now)
      .sort((a, b) => new Date(a.raceDate) - new Date(b.raceDate));

    // 2) 이미 끝난 대회 (내림차순: 최근에 끝난게 그나마 위로)
    const finished = schedules.value
      .filter((s) => new Date(s.raceDate) <= now)
      .sort((a, b) => new Date(b.raceDate) - new Date(a.raceDate));

    // 합치기: (예정된 대회들) -> (끝난 대회들)
    return [...upcoming, ...finished];
  });

  // ==========================================
  // 🎮 4. 액션 (Actions) - 모달 열기/저장/삭제
  // ==========================================

  // 현재 날짜/시간을 datetime-local input 형식으로 반환
  const getNowForInput = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${min}`;
  };

  // openScheduleModal 함수
  const openScheduleModal = (sche = null) => {
    if (sche) {
      // [수정 모드]
      isEditMode.value = true;
      newSche.value = JSON.parse(JSON.stringify(sche));
    } else {
      // [등록 모드 / 리셋]
      isEditMode.value = false;

      // 👇 여기가 핵심! 빈 값('') 대신 현재 시간을 넣습니다.
      const currentDateTime = getNowForInput(); // "2025-12-12T13:30"
      const currentDate = currentDateTime.split("T")[0]; // "2025-12-12"

      newSche.value = {
        id: null,
        title: "",
        location: "",
        url: "",
        // 날짜는 비워두면 아이폰에서 클릭 안 됨 -> 오늘 날짜로 세팅
        raceDate: currentDateTime,
        regEndDate: currentDate,
      };
    }
    showScheduleModal.value = true;
  };

  const saveSchedule = () => {
    if (!newSche.value.title || !newSche.value.raceDate) {
      alert("대회명과 일시는 필수입니다! 😅");
      return;
    }

    if (isEditMode.value) {
      // 수정
      const index = schedules.value.findIndex((s) => s.id === newSche.value.id);
      if (index !== -1) schedules.value[index] = { ...newSche.value };
    } else {
      // 신규 등록
      schedules.value.push({
        ...newSche.value,
        id: Date.now(),
      });
    }
    showScheduleModal.value = false;
  };

  // (선택) 일정 삭제 기능도 필요할까봐 추가함
  const deleteSchedule = () => {
    if (!confirm("정말 이 일정을 삭제할까요?")) return;
    schedules.value = schedules.value.filter((s) => s.id !== newSche.value.id);
    showScheduleModal.value = false;
  };

  // ==========================================
  // 🎨 5. 포맷팅 & 상태 계산 (Helpers)
  // ==========================================

  // 날짜 포맷: 25.10.25 (토) 09:00
  const formatDateFull = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear().toString().slice(2);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const week = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
    const hour = date.getHours().toString().padStart(2, "0");
    const min = date.getMinutes().toString().padStart(2, "0");
    return `${year}.${month}.${day} (${week}) ${hour}:${min}`;
  };

  // 접수일 포맷
  const formatRegDate = (dateStr) => {
    if (!dateStr) return "접수일 미정";
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}.${date.getDate()} 접수 시작`;
  };

  // 상태 배지 계산 (핵심 로직)
  const getBadgeInfo = (sche) => {
    const now = new Date();
    const raceDate = new Date(sche.raceDate);

    // 1. 대회가 끝남 (회색)
    if (now > raceDate) {
      return { text: "대회종료", class: "finished" };
    }

    // 2. 접수일 체크
    if (sche.regEndDate) {
      const regEnd = new Date(sche.regEndDate);
      regEnd.setHours(23, 59, 59); // 그 날의 밤까지 인정

      // 접수는 끝났지만 대회는 남음 (빨간색 글씨)
      if (now > regEnd) {
        return { text: "접수마감", class: "reg-closed" };
      }

      // 접수중 (오렌지)
      const diffTime = Math.abs(regEnd - now);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { text: `접수 D-${diffDays}`, class: "urgent" };
    }

    // 3. 접수일 모르면 그냥 대회 D-Day (블루)
    const diffRace = raceDate - now;
    const dDay = Math.ceil(diffRace / (1000 * 60 * 60 * 24));
    return { text: `대회 D-${dDay}`, class: "upcoming" };
  };

  // CSS용 상태 체크 함수들
  const isRaceFinished = (dateStr) => new Date() > new Date(dateStr);
  const isRegEnded = (dateStr) => {
    if (!dateStr) return false;
    const regEnd = new Date(dateStr);
    regEnd.setHours(23, 59, 59);
    return new Date() > regEnd;
  };

  // 밖으로 내보낼 것들만 리턴
  return {
    showScheduleModal,
    isEditMode,
    newSche,
    schedules,
    sortedSchedules,
    openScheduleModal, // 이름 명확하게 변경 (openModal -> openScheduleModal)
    saveSchedule,
    deleteSchedule,
    formatDateFull,
    formatRegDate,
    getBadgeInfo,
    isRaceFinished,
    isRegEnded,
  };
}
