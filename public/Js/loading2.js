window.addEventListener("load", () => {
  let preloader = document.getElementById("preloader");
  let body = document.getElementById("body");
  body.style.display = "none";
  setTimeout(() => {
    preloader.style.display = "none";
    body.style.display = "flex";
  }, 5000);
});
