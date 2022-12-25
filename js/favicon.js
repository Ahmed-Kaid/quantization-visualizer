const faviconTag = document.getElementById("faviconTag");
const isDark = window.matchMedia("(prefers-color-scheme: dark)");

const changeFavicon = () => {
  if (isDark.matches) faviconTag.href = "./img/dark.ico";
  else faviconTag.href = "./img/light.ico";
};

changeFavicon();

// Could automatically update, if needed
// setInterval(changeFavicon, 1000);