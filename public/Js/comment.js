document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".comment-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const postId = this.id.replace("comment-", "");
      const commentPopup = document.getElementById("comment-popup-" + postId);
      if (commentPopup) {
        commentPopup.style.display = "flex";
      }
    });
  });
  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const postId = this.id.replace("close-btn-", "");
      const commentPopup = document.getElementById("comment-popup-" + postId);
      if (commentPopup) {
        commentPopup.style.display = "none";
      }
    });
  });
});
