// test for running
//console.log("The port is running on the server");

// loading function

window.addEventListener("load", () => {
  let preloader = document.getElementById("preloader");
  let register = document.getElementById("register");
  register.style.display = "none";
  setTimeout(() => {
    preloader.style.display = "none";
    register.style.display = "flex";
  }, 5000);
});
