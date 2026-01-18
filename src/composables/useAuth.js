import { ref } from "vue";

const ACCESS_CODE = "soso5";

export function useAuth() {
  const isLoggedIn = ref(false);
  const inputCode = ref("");
  const loginError = ref(false);
  const loginSuccess = ref(false);

  const tryLogin = (onSuccess) => {
    if (inputCode.value === ACCESS_CODE) {
      loginSuccess.value = true;

      if (navigator.vibrate) navigator.vibrate(50);

      setTimeout(() => {
        localStorage.setItem("running-crew-auth", ACCESS_CODE);
        isLoggedIn.value = true;
        if (onSuccess) onSuccess();
        window.scrollTo(0, 0);
      }, 2000);
    } else {
      loginError.value = true;
      inputCode.value = "";
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setTimeout(() => (loginError.value = false), 1000);
    }
  };

  const checkAuth = () => {
    const savedAuth = localStorage.getItem("running-crew-auth");
    if (savedAuth === ACCESS_CODE) {
      isLoggedIn.value = true;
      return true;
    }
    return false;
  };

  return {
    isLoggedIn,
    inputCode,
    loginError,
    loginSuccess,
    tryLogin,
    checkAuth,
  };
}
