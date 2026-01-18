import { ref, onMounted } from "vue";

export function useTheme() {
  const isDarkMode = ref(true);

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem(
      "running-crew-theme",
      isDarkMode.value ? "dark" : "light"
    );
  };

  const loadTheme = () => {
    const savedTheme = localStorage.getItem("running-crew-theme");
    if (savedTheme === "light") isDarkMode.value = false;
  };

  onMounted(() => {
    loadTheme();
  });

  return {
    isDarkMode,
    toggleTheme,
    loadTheme,
  };
}
