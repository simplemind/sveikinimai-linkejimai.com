const modalOverlay = document.querySelector(".modal-overlay");
const modalMenu = document.querySelector(".modal-menu");

const openMenuButton = document.querySelector(".menu-open-button");

const closeMenuButton = document.querySelector(".modal-menu__close-button");

openMenuButton.addEventListener("click", () => {
  modalOverlay.classList.add("modal-overlay__open");
  modalMenu.classList.add("modal-menu__open");
});

closeMenuButton.addEventListener("click", () => {
  modalOverlay.classList.remove("modal-overlay__open");
  modalMenu.classList.remove("modal-menu__open");
});

modalOverlay.addEventListener("click", () => {
  modalOverlay.classList.remove("modal-overlay__open");
  modalMenu.classList.remove("modal-menu__open");
});