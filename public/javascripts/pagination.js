// Javascript code to add greetings to the page using infinite scroll
// Also to navigate to the relevant page if the page is not the first page
const contentContainer = document.querySelector(".greetings-container");
const footer = document.querySelector(".footer");
const addGreetingsButton = document.getElementById("add-greetings");
const paginationWave = document.querySelector(".pagination__wave");
const pagination__end = document.querySelector(".pagination__end");

const url = new URL(window.location.href);
let currentPage = Number(url.searchParams.get("puslapis")) || 1;
const currentCategory = window.currentCategory;
const numberOfPages = Number(window.numberOfPages);
// Get URL path parameters
const path = window.location.pathname;
// To prevent multiple calls to the function while loading content
let isLoading = false;

// Determine if the page is homepage or category page for Url manipulation
const isHomepage = path === "/" || path.startsWith("/?puslapis=");

// Adding event listener to the addGreetingsButton for compatibility if IntersectionObserver is not supported
addGreetingsButton.addEventListener("click", () => {
  loadContentAndAnimations();
});

// INTERSECTION OBSERVER
//Creating a new IntersectionObserver instance where content is visible 100%
let options = {
  root: null, // it is the viewport
  threshold: 0.8, // 80% visible
};

// Observer callback function
let callback = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      loadContentAndAnimations();
    }
  });
};
// Start observing the footer, if there are more pages to fetch
let addGreetingsObserver = new IntersectionObserver(callback, options);

if (numberOfPages > currentPage) {
  addGreetingsObserver.observe(footer);
}
// Hide the add greetings button if there is just one page
if (numberOfPages === 1) {
  // Hiding the addGreetingsButton
  toggleElementClass(true, addGreetingsButton, "add-greetings__button--hidden");
  // Adding word "Pabaiga" at the end of all greetings
  toggleElementClass(true, pagination__end, "pagination__end--show");
}

// Adds greetings from array to the page
function addGreetings(greetingsArray, contentContainer, currentPage) {
  greetingsArray.forEach((greetingObject, index) => {
    const greetingArticle = createGreetingArticle(greetingObject.greeting);
    // Adding page number to the first greetingArticle
    if (index === 0) {
      greetingArticle.dataset.page = currentPage;
    }
    contentContainer.appendChild(greetingArticle);
  });
}

// Adds greetings enclosed in p inside article.greeting
function createGreetingArticle(text) {
  const greeting = document.createElement("p");
  greeting.innerText = text;
  greeting.classList.add("greeting__text");
  const greetingArticle = document.createElement("article");
  greetingArticle.classList.add("greeting");
  greetingArticle.appendChild(greeting);
  return greetingArticle;
}

// A function that toggles classes on pagination__wave and addGreetingsButton from hidden to show
function toggleElementClass(shouldAddClass, element, className) {
  if (shouldAddClass) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}

// A function that builds the URL
function buildUrl(isHomepage, currentCategory, currentPage) {
  let builtUrl;
  if (isHomepage) {
    builtUrl = `/?puslapis=${currentPage}`;
  } else {
    builtUrl = `/proga/${currentCategory}/?puslapis=${currentPage}`;
  }
  return builtUrl;
}

// A function that loads content and animations
// Encapsules addGreetings and related show/hide functions
async function loadContentAndAnimations() {
  // Preventing multiple calls to the function while loading content
  if (isLoading) {
    return;
  }
  isLoading = true;

  // Hiding the button
  toggleElementClass(true, addGreetingsButton, "add-greetings__button--hidden");
  // Showing the wave
  toggleElementClass(true, paginationWave, "pagination__wave--show");

  // A promise that fetches greetings and finishes no earlier than after 1 second
  currentPage++;
  // Wait for at least 1 second and fetch greetings simultaneously
  const delayPromise = new Promise((resolve) => setTimeout(resolve, 1000));
  // Fetching greetings
  const fetchPromise = fetch(`/api/get-greetings/${currentCategory}/${currentPage}`).then((response) => response.json());
  // Wait for both promises to resolve
  const [_, greetingsArrayOfObjects] = await Promise.all([delayPromise, fetchPromise]);

  // Adding greetings
  addGreetings(greetingsArrayOfObjects, contentContainer, currentPage);

  // Hide the wave
  toggleElementClass(false, paginationWave, "pagination__wave--show");
  // Show the addGreetingsButton
  toggleElementClass(false, addGreetingsButton, "add-greetings__button--hidden");

  // Update the URL, if page is not greater than number of pages
  const builtUrl = buildUrl(isHomepage, currentCategory, currentPage);
  if (currentPage <= numberOfPages) {
    history.pushState({}, "", builtUrl);
  }

  // Stop observing the footer, if page is the last page
  if (currentPage >= numberOfPages) {
    // Stop observing the footer
    addGreetingsObserver.unobserve(footer);
    // Hide the addGreetingsButton
    toggleElementClass(true, addGreetingsButton, "add-greetings__button--hidden");
    // Adding word "Pabaiga" at the end of all greetings
    toggleElementClass(true, pagination__end, "pagination__end--show");
  }
  // Setting back to false to allow the function to be called again
  isLoading = false;
}

// SCROLL INTO VIEW
// Scroll into the relevant page if the page is not the first page
if (currentPage > 1) {
  const greetingArticle = document.querySelector(`article[data-page="${currentPage}"]`);
  greetingArticle.scrollIntoView({ behavior: "smooth", block: "start" });
  // Scroll down account for the fixed header
  // Timeout as scrollIntoView has no callback or promise to wait for
  setTimeout(() => {
    window.scrollBy({
      top: -120,
      left: 0,
      behavior: "smooth",
    });
  }, 500);
}
// Hide the addGreetingsButton if the page is the last page
if (currentPage === numberOfPages) {
  toggleElementClass(true, addGreetingsButton, "add-greetings__button--hidden");
}
