// Javascript code to add greetings to the page
const contentContainer = document.querySelector(".content");
const button = document.getElementById("add-greetings");

button.addEventListener("click", () => {
  addGreetings(greetingsArray, contentContainer);
});

// Adds greetings from array to the page
function addGreetings(greetingsArray, contentContainer) {
  greetingsArray.forEach((greeting) => {
    const greetingArticle = createGreetingArticle(greeting);
    contentContainer.appendChild(greetingArticle);
  });
}

// Adds greetings enclosed in p inside article.greeting
function createGreetingArticle(text) {
  const greeting = document.createElement("p");
  greeting.innerText = text;
  const greetingArticle = document.createElement("article");
  greetingArticle.classList.add("greeting");
  greetingArticle.appendChild(greeting);
  return greetingArticle;
}

// An array of greetings
const greetingsArray = [
  "#Atėjo žiema - su žiema Kalėdų Senelis, Su Kalėdų Seneliu dovanos - su dovanomis džiaugsmas Su džiaugsmu draugai - su draugais meilė Su meile gyvenimas! Su šv.Kalėdomis 1",
  "##Linkiu Tau iš tūkstančio žvaigždžių Vieną pačią ryškiausią, Linkiu Tau iš tūkstančio ašarų Vieną pačią saldžiausią, Linkiu Tau iš tūkstančio bučinių Vieną patį karščiausią, Linkiu Tau iš tūkstančio naktų Vieną pačią ilgiausią.",
  "Būkit jūra gerumo, švelnumo ir meilės, Kur galėtu plukdyti mažylis laivus. Jūsų pasakų skliautais vaikystę nuvedęs Jis užaugtu protingu, laimingu žmogum. ",
  "Šv. Kalėdos - tai laikas, kai visiems norisi būti geresniais, o ne tik sau, bet ir kitiems. ",
  "Mes nulibdėm sniego senį Sniego senį besmegenį Na, o senis besmegenis - liūdnas senis... Mes nulipdem senę besmegenę, O ji anukelių užsimanė Mes papustėm delniukus ir nulibdėm anukus.",
  "Mama, jau Kalėdos, o aš tau dovanų nešu. Man ne dovanas, o tave linksma matyt smagu. Tu mano žvaigzdė nakčia, tu mano angelas delne. Galbūt dar tik Kalėdos, bet vistiek as tave myliu.",
  "Linkiu Tau iš tūkstančio žvaigždžių Vieną pačią ryškiausią, Linkiu Tau iš tūkstančio ašarų Vieną pačią saldžiausią, Linkiu Tau iš tūkstančio bučinių Vieną patį karščiausią, Linkiu Tau iš tūkstančio naktų Vieną pačią ilgiausią.",
  "Būkit jūra gerumo, švelnumo ir meilės, Kur galėtu plukdyti mažylis laivus. Jūsų pasakų skliautais vaikystę nuvedęs Jis užaugtu protingu, laimingu žmogum. ",
  "Šv. Kalėdos - tai laikas, kai visiems norisi būti geresniais, o ne tik sau, bet ir kitiems. ",
  "Būkit jūra gerumo, švelnumo ir meilės, Kur galėtu plukdyti mažylis laivus. Jūsų pasakų skliautais vaikystę nuvedęs Jis užaugtu protingu, laimingu žmogum. ",
];
