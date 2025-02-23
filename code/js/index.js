document.addEventListener("DOMContentLoaded", function () {
  var skipLink = document.querySelector("#skip a");
  skipLink.addEventListener("click", function (event) {
    event.preventDefault();
    document.querySelector("#content").focus();
  });
});
