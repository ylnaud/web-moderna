document.addEventListener("DOMContentLoaded", () => {
  const skipLink = document.querySelector("#skip a");
  skipLink.addEventListener("click", function (event) {
    event.preventDefault();
    document.querySelector("#content").focus();
  });
});
