const modalOverlay = document.querySelector(".modal-overlay");
const modalMenu = document.querySelector(".modal-menu");
const menuOpenButton = document.querySelector(".menu-open-button");
const menuCloseButton = document.querySelector(".modal-menu__close-button");

// Event listeners to show/hide modal menu
menuOpenButton.addEventListener("click", (event) => {
  // Preventing the anchor tag from redirecting to the href
  event.preventDefault();
  modalOverlay.classList.add("modal-overlay__open");
  modalMenu.classList.add("modal-menu__open");
});

menuCloseButton.addEventListener("click", (event) => {
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

// Intersection Observer to show menu-open-button when side menu is not visible
// Get the elements
const sideMenu = document.querySelector(".side-menu");

// Create an Intersection Observer
const sideMenuObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      menuOpenButton.style.opacity = 0;
    } else {
      menuOpenButton.style.opacity = 1;
    }
  },
  { root: null, threshold: 0.4 }
);

// Start observing sideMenu
sideMenuObserver.observe(sideMenu);
