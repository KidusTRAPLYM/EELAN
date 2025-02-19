document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".share-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const postId = this.id.replace("share-btn-", ""); // Extract post ID from button ID
      const sharePopup = document.getElementById("share-popup-" + postId);
      if (sharePopup) {
        sharePopup.style.display = "flex";
      }
    });
  });

  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const postId = this.id.replace("close-popup-", ""); // Extract post ID
      const sharePopup = document.getElementById("share-popup-" + postId);
      if (sharePopup) {
        sharePopup.style.display = "none";
      }
    });
  });
});
