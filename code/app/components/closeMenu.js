function closeMenu() {
  // Seleccionar elementos relevantes
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelectorAll(".nav__link");

  // Función para cerrar el menú
  const closeMenu = () => {
    menuToggle.checked = false; // Desmarcar el checkbox
    document.documentElement.style.setProperty(
      "--transform-list-menu",
      "translateX(-100%)"
    );
  };

  // Añadir evento a cada enlace
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      //e.preventDefault()
      // Prevenir comportamiento por defecto solo para anclas
      if (link.getAttribute("href").startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        target.scrollIntoView({ behavior: "smooth" });
      }

      // Cerrar el menú solo en móvil
      if (
        window.getComputedStyle(document.querySelector(".nav__label"))
          .display !== "none"
      ) {
        closeMenu();
      }
    });
  });
}

export default closeMenu;
