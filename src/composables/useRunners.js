import { ref, computed, watch } from "vue";
import confetti from "canvas-confetti";

export function useRunners() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const STORAGE_KEY = `running-challenge-${year}-${month}`;

  const runners = ref([]);

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

  const completedRunners = computed(() => {
    return runners.value.filter((r) => r.current >= r.goal);
  });

  const getRate = (current, goal) => {
    if (!goal || goal === 0) return "0";
    return Math.min(100, (current / goal) * 100).toFixed(0);
  };

  const loadRunners = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) runners.value = JSON.parse(savedData);
    else runners.value = [];
  };

  const saveRunners = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runners.value));
  };

  const addMember = (name, goal, avatar) => {
    if (!name || !goal) {
      alert("이름과 목표를 입력해주세요!");
      return false;
    }
    const nameToCheck = name.trim();
    if (runners.value.some((r) => r.name === nameToCheck)) {
      alert(`이미 있는 이름입니다.`);
      return false;
    }

    runners.value.push({
      id: Date.now(),
      name: nameToCheck,
      goal: parseFloat(goal),
      current: 0,
      avatar: avatar,
      completedAt: null,
    });
    return true;
  };

  // 날짜를 YYYY-MM-DD 형식으로 반환
  const getDateString = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // 두 날짜의 차이(일수) 계산
  const getDaysDiff = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(d2 - d1);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const saveRecord = (id, distance) => {
    const target = runners.value.find((r) => r.id === id);
    if (target && distance) {
      const oldCurrent = target.current;
      target.current = parseFloat(
        (target.current + parseFloat(distance)).toFixed(2)
      );
      if (target.current < 0) target.current = 0;

      // 스트릭 계산 (거리가 양수일 때만)
      if (parseFloat(distance) > 0) {
        const today = getDateString(new Date());
        const lastRun = target.lastRunDate;

        if (!lastRun) {
          // 첫 기록
          target.streak = 1;
        } else if (lastRun === today) {
          // 오늘 이미 기록함 - 스트릭 유지
        } else {
          const daysDiff = getDaysDiff(lastRun, today);
          if (daysDiff === 1) {
            // 어제 뛰었음 - 스트릭 증가
            target.streak = (target.streak || 0) + 1;
          } else {
            // 하루 이상 쉬었음 - 스트릭 리셋
            target.streak = 1;
          }
        }
        target.lastRunDate = today;
      }

      if (oldCurrent < target.goal && target.current >= target.goal) {
        if (!target.completedAt) {
          target.completedAt = Date.now();
          confetti({ particleCount: 150, spread: 60, origin: { y: 0.6 } });
          alert(`축하합니다! ${target.name}님 완주 성공!`);
        }
      }
      if (target.current < target.goal) target.completedAt = null;
      return true;
    }
    return false;
  };

  const deleteMember = (id) => {
    if (confirm("정말 삭제하시겠습니까? (복구 불가)")) {
      runners.value = runners.value.filter((r) => r.id !== id);
      return true;
    }
    return false;
  };

  const getRunner = (id) => {
    return runners.value.find((r) => r.id === id) || { name: "", avatar: "" };
  };

  const cheerRunner = (id) => {
    const target = runners.value.find((r) => r.id === id);
    if (target) {
      target.cheers = (target.cheers || 0) + 1;
    }
  };

  watch(
    runners,
    () => {
      saveRunners();
    },
    { deep: true }
  );

  return {
    runners,
    sortedRunners,
    completedRunners,
    getRate,
    loadRunners,
    addMember,
    saveRecord,
    deleteMember,
    getRunner,
    cheerRunner,
    STORAGE_KEY,
  };
}
