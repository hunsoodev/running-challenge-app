import { ref, computed } from "vue";
import confetti from "canvas-confetti";

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

export function useRoulette(candidatesRef) {
  const rotation = ref(0);
  const winnerName = ref(null);
  const isSpinning = ref(false);

  const wheelStyle = computed(() => {
    const count = candidatesRef.value.length;
    if (count === 0) return {};

    const anglePerSlice = 360 / count;
    let gradient = `conic-gradient(from 0deg, `;

    const stops = candidatesRef.value.map((_, i) => {
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
    const count = candidatesRef.value.length;
    const anglePerSlice = 360 / count;
    const midAngle = index * anglePerSlice + anglePerSlice / 2;

    return {
      transform: `rotate(${midAngle}deg)`,
    };
  };

  const spinWheel = () => {
    if (candidatesRef.value.length === 0 || isSpinning.value) return;

    isSpinning.value = true;
    winnerName.value = null;

    const winnerIndex = Math.floor(Math.random() * candidatesRef.value.length);

    const count = candidatesRef.value.length;
    const anglePerSlice = 360 / count;
    const winnerCenterAngle = winnerIndex * anglePerSlice + anglePerSlice / 2;
    const targetRotation = 1800 + (360 - winnerCenterAngle);

    rotation.value = targetRotation;

    setTimeout(() => {
      winnerName.value = candidatesRef.value[winnerIndex].name;
      isSpinning.value = false;
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    }, 3000);
  };

  const reset = () => {
    winnerName.value = null;
    rotation.value = 0;
    isSpinning.value = false;
  };

  return {
    rotation,
    winnerName,
    isSpinning,
    wheelStyle,
    getTextStyle,
    spinWheel,
    reset,
  };
}
