const wordElement = document.getElementById("word");
const wrongLettersElement = document.getElementById("wrong-letters");
const playButton = document.getElementById("play-button");
const popup = document.getElementById("popup-container");
const notification = document.getElementById("notification-container");
const finalMessage = document.getElementById("final-message");
const figureParts = document.querySelectorAll(".figure-part");
const startButton = document.getElementById("start-button");
const wordInputContainer = document.getElementById("word-input-container");
const wordInput = document.getElementById("word-input");
const submitWordButton = document.getElementById("submit-word-button");
const homeButton = document.getElementById("home-button");
const timerElement = document.getElementById("timer");
const pointsElement = document.getElementById("points");
const keyboardContainer = document.getElementById("keyboard-container");

let selectedWord = "";
let gameMode = "";
let correctLetters = [];
let wrongLetters = [];
let isGuessing = false;
let timeLeft = 120;
let points = 230;
let interval;

// Function to fetch a random word from a working API
async function getRandomWord() {
  // List of APIs to try (in order of preference)
  const apis = [
    {
      url: "https://random-word-api.vercel.app/api?words=1",
      parse: (data) => data[0]
    },
    {
      url: "https://api.datamuse.com/words?sp=??????&max=50",
      parse: (data) => data[Math.floor(Math.random() * data.length)]?.word
    }
  ];

  for (const api of apis) {
    try {
      const response = await fetch(api.url);
      if (!response.ok) continue;
      const data = await response.json();
      const word = api.parse(data);
      if (word && word.length >= 4) {
        return word.toLowerCase();
      }
    } catch (error) {
      console.error(`Error fetching from ${api.url}:`, error);
    }
  }

  // Fallback words if all APIs fail
  const fallbackWords = [
    "application", "programming", "interface", "wizard", "javascript",
    "developer", "keyboard", "hangman", "computer", "algorithm",
    "function", "variable", "database", "network", "browser",
    "framework", "library", "module", "package", "component"
  ];
  return fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
}

// Function to create on-screen keyboard
function createKeyboard() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  keyboardContainer.innerHTML = letters
    .split("")
    .map(
      (letter) =>
        `<button class="key" data-letter="${letter}">${letter}</button>`
    )
    .join("");
}

// Function to update keyboard button states
function updateKeyboard() {
  const keys = keyboardContainer.querySelectorAll(".key");
  keys.forEach((key) => {
    const letter = key.dataset.letter;
    key.disabled = false;
    key.classList.remove("correct", "wrong");
    
    if (correctLetters.includes(letter)) {
      key.classList.add("correct");
      key.disabled = true;
    } else if (wrongLetters.includes(letter)) {
      key.classList.add("wrong");
      key.disabled = true;
    }
  });
}

// Function to display the word with guessed letters and empty spaces for unguessed letters
function displayWord() {
  wordElement.innerHTML = `
    ${selectedWord
      .split("")
      .map(
        (letter) => `
          <span class="letter">
            ${correctLetters.includes(letter) ? letter : "_"}
          </span>
        `
      )
      .join("")}
    `;

  const innerWord = wordElement.innerText.replace(/\n/g, "").replace(/ /g, "");

  if (isGuessing && innerWord === selectedWord) {
    finalMessage.innerHTML = `Congratulations!<br>You won ${points} points`;
    finalMessage.style.display = "block";
    popup.style.display = "flex";
    clearInterval(interval);
    disableAllKeys();
  }
}

// Function to disable all keyboard keys
function disableAllKeys() {
  const keys = keyboardContainer.querySelectorAll(".key");
  keys.forEach((key) => {
    key.disabled = true;
  });
}

// Function to update the display of wrong letters and hangman parts
function updateWrongLetters() {
  wrongLettersElement.innerHTML = `
    ${wrongLetters.length > 0 ? "<p>Wrong letters:</p>" : ""}
    ${wrongLetters.map((letter) => `<span>${letter}</span>`).join("")}
  `;

  figureParts.forEach((part, index) => {
    const errors = wrongLetters.length;

    if (index < errors) {
      part.style.display = "block";
    } else {
      part.style.display = "none";
    }
  });

  if (wrongLetters.length === figureParts.length) {
    finalMessage.innerHTML = `Unfortunately, you lost!<br>The right word was "${selectedWord}".`;
    finalMessage.style.display = "block";
    popup.style.display = "flex";
    clearInterval(interval);
    points = 0;
    updatePoints();
    disableAllKeys();
  }
}

// Function to show a notification if the same letter is guessed again
function showNotification() {
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);
}

// Function to update the timer and points
function updateTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    timerElement.innerText = `Time left: ${timeLeft}s`;
    if (timeLeft % 10 === 0) {
      points -= 15;
      updatePoints();
    }
  } else {
    finalMessage.innerHTML = `Time's up!<br>The right word was "${selectedWord}".`;
    finalMessage.style.display = "block";
    popup.style.display = "flex";
    clearInterval(interval);
    points = 0;
    updatePoints();
    disableAllKeys();
  }
}

function updatePoints() {
  pointsElement.innerText = `Points: ${points}`;
}

// Function to reset the game
function resetGame() {
  correctLetters = [];
  wrongLetters = [];
  selectedWord = "";
  wordElement.innerHTML = "";
  wrongLettersElement.innerHTML = "";
  figureParts.forEach((part) => (part.style.display = "none"));
  popup.style.display = "none";
  finalMessage.innerHTML = "";
  finalMessage.style.display = "none";
  wordInputContainer.style.display = "none";
  wordInput.value = "";
  isGuessing = false;
  clearInterval(interval);
  timeLeft = 120;
  points = 230;
  timerElement.innerText = `Time left: ${timeLeft}s`;
  pointsElement.innerText = `Points: ${points}`;
  createKeyboard();
}

// Function to process a guessed letter
function processGuess(letter) {
  if (!isGuessing || !selectedWord) return;
  
  if (correctLetters.includes(letter) || wrongLetters.includes(letter)) {
    showNotification();
    return;
  }

  if (selectedWord.includes(letter)) {
    correctLetters.push(letter);
    displayWord();
  } else {
    wrongLetters.push(letter);
    points -= 10;
    updateWrongLetters();
    updatePoints();
  }
  updateKeyboard();
}

// Event listener for the start button to select the game mode and start the game
startButton.addEventListener("click", async () => {
  const selectedMode = document.querySelector('input[name="mode"]:checked');
  if (selectedMode) {
    gameMode = selectedMode.value;
    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "flex";
    homeButton.style.display = "block";
    resetGame();

    if (gameMode === "player-vs-player") {
      wordInputContainer.style.display = "flex";
      finalMessage.style.display = "none";
    } else {
      selectedWord = await getRandomWord();
      displayWord();
      isGuessing = true;
      interval = setInterval(updateTimer, 1000);
    }
  } else {
    alert("Please select a game mode.");
  }
});

// Event listener for the word input field to dynamically create underscores as Player 1 types the word
wordInput.addEventListener("input", () => {
  selectedWord = wordInput.value.toLowerCase().replace(/[^a-z]/g, "");
  wordElement.innerHTML = `
    ${selectedWord
      .split("")
      .map(() => `<span class="letter">?</span>`)
      .join("")}
  `;
});

// Event listener for the submit word button to set the word for Player 2 to guess
submitWordButton.addEventListener("click", () => {
  if (selectedWord && selectedWord.length >= 2) {
    wordInputContainer.style.display = "none";
    wordInput.value = "";
    displayWord();
    isGuessing = true;
    interval = setInterval(updateTimer, 1000);
  } else {
    alert("Please enter a word (at least 2 letters).");
  }
});

// Extend the set of valid letters
const validLetters = new Set("abcdefghijklmnopqrstuvwxyz");

// Event listener for keydown events to handle guesses
window.addEventListener("keydown", (e) => {
  const letter = e.key.toLowerCase();
  if (
    isGuessing &&
    validLetters.has(letter) &&
    selectedWord &&
    (wordInputContainer.style.display === "none" ||
      wordInputContainer.style.display === "")
  ) {
    processGuess(letter);
  }
});

// Event listener for the play again button to reset the game
playButton.addEventListener("click", async () => {
  resetGame();

  if (gameMode === "player-vs-computer") {
    selectedWord = await getRandomWord();
    displayWord();
    isGuessing = true;
    interval = setInterval(updateTimer, 1000);
  } else {
    wordInputContainer.style.display = "flex";
    wordInput.value = "";
  }
});

// Event listener for the home button to go back to the home screen
homeButton.addEventListener("click", () => {
  document.getElementById("welcome-screen").style.display = "flex";
  document.getElementById("game-screen").style.display = "none";
  homeButton.style.display = "none";
  resetGame();
});

// Event listener for on-screen keyboard clicks
keyboardContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("key")) {
    const letter = e.target.dataset.letter;
    if (letter) {
      processGuess(letter);
    }
  }
});

// Initialize the keyboard on page load
createKeyboard();
