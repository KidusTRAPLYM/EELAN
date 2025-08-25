const dropdown = document.querySelector(".dropdown");
const input = dropdown.querySelector("input");
const options = dropdown.querySelector(".dropdown-options");

input.addEventListener("click", () => {
  options.style.display = options.style.display === "block" ? "none" : "block";
});

options.querySelectorAll("li").forEach(option => {
  option.addEventListener("click", () => {
    input.value = option.dataset.value;
    options.style.display = "none";
  });
});

document.addEventListener("click", e => {
  if (!dropdown.contains(e.target)) {
    options.style.display = "none";
  }
});


