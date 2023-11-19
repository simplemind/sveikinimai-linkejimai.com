const modalOverlay = document.querySelector(".modal-overlay");
const modalMenu = document.querySelector(".modal-menu");

const openMenuButton = document.querySelector(".menu-open-button");

const closeMenuButton = document.querySelector(".modal-menu__close-button");

openMenuButton.addEventListener("click", (event) => {
  // Preventing the anchor tag from redirecting to the href
  event.preventDefault();
  modalOverlay.classList.add("modal-overlay__open");
  modalMenu.classList.add("modal-menu__open");
});

closeMenuButton.addEventListener("click", (event) => {
  // Preventing the anchor tag from redirecting to the href
  event.preventDefault();
  modalOverlay.classList.remove("modal-overlay__open");
  modalMenu.classList.remove("modal-menu__open");
});

modalOverlay.addEventListener("click", (event) => {
  // Closing the modal menu only if the click was on the modal overlay
  if (event.target === modalOverlay) {
    modalOverlay.classList.remove("modal-overlay__open");
    modalMenu.classList.remove("modal-menu__open");
  }
});

//#DEV: Open modal menu on window load
// window.addEventListener("load", () => {
//   modalOverlay.classList.add("modal-overlay__open");
//   modalMenu.classList.add("modal-menu__open");
// });
