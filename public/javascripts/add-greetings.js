// Javascript code to add greetings to the page
const contentContainer = document.querySelector(".content");
const button = document.getElementById("add-greetings");

button.addEventListener("click", () => {
  addGreetings(10, contentContainer);
});

// Adds greetings enclosed in p inside article.greeting
function createGreeting(text) {
  const greeting = document.createElement("p");
  greeting.innerText = text;
  return greeting;
}

function createGreetingArticle(greeting) {
  const greetingArticle = document.createElement("article");
  greetingArticle.classList.add("greeting");
  greetingArticle.appendChild(greeting);
  return greetingArticle;
}

function addGreetings(number, container) {
  for (let i = 0; i < number; i++) {
    const greeting = createGreeting(
      "Atėjo žiema - su žiema Kalėdų Senelis, Su Kalėdų Seneliu dovanos - su dovanomis džiaugsmas Su džiaugsmu draugai - su draugais meilė Su meile gyvenimas! Su šv.Kalėdomis"
    );
    const greetingArticle = createGreetingArticle(greeting);
    container.appendChild(greetingArticle);
  }
}
