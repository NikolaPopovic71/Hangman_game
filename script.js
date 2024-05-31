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

// Function to fetch a random word from the Random Word API
async function getRandomWord() {
  try {
    const response = await fetch("https://random-word-api.herokuapp.com/word");
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Error fetching random word:", error);
    // Fallback words
    const fallbackWords = ["application", "programming", "interface", "wizard"];
    return fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
  }
}

// Function to display the word with guessed letters and empty spaces for unguessed letters
function displayWord() {
  wordElement.innerHTML = `
    ${selectedWord
      .split("")
      .map(
        (letter) => `
          <span class="letter">
            ${correctLetters.includes(letter) ? letter : "*"}
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
  }
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
    finalMessage.innerHTML = `Unfortunately, you lost!<br>The right word was "${selectedWord}".`;
    popup.style.display = "flex";
    clearInterval(interval);
    points = 0;
    updatePoints();
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
  finalMessage.innerHTML = ""; // Clear the final message content
  wordInputContainer.style.display = "none"; // Hide the word input container
  wordInput.value = ""; // Clear the word input field
  isGuessing = false;
  clearInterval(interval);
  timeLeft = 120;
  points = 230;
  timerElement.innerText = `Time left: ${timeLeft}s`;
  pointsElement.innerText = `Points: ${points}`;
}

// Event listener for the start button to select the game mode and start the game
startButton.addEventListener("click", async () => {
  const selectedMode = document.querySelector('input[name="mode"]:checked');
  if (selectedMode) {
    gameMode = selectedMode.value;
    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "flex";
    homeButton.style.display = "block"; // Show the home button
    resetGame(); // Reset the game state

    if (gameMode === "player-vs-player") {
      wordInputContainer.style.display = "block";
      finalMessage.style.display = "none"; // Hide the final message initially
      wordInput.focus(); // Focus on the word input field
    } else {
      selectedWord = await getRandomWord();
      displayWord();
      isGuessing = true;
      if (window.innerWidth <= 768) {
        createKeyboard(); // Create the on-screen keyboard for mobile devices
      }
      interval = setInterval(updateTimer, 1000);
    }
  } else {
    alert("Please select a game mode.");
  }
});

// Event listener for the word input field to dynamically create underscores as Player 1 types the word
wordInput.addEventListener("input", () => {
  selectedWord = wordInput.value.toLowerCase();
  wordElement.innerHTML = `
    ${selectedWord
      .split("")
      .map(() => `<span class="letter">?</span>`)
      .join("")}
  `;
});

// Event listener for the submit word button to set the word for Player 2 to guess
submitWordButton.addEventListener("click", () => {
  if (selectedWord) {
    wordInputContainer.style.display = "none";
    wordInput.value = "";
    displayWord();
    isGuessing = true;
    if (window.innerWidth <= 768) {
      createKeyboard(); // Create the on-screen keyboard for mobile devices
    }
    interval = setInterval(updateTimer, 1000);
  } else {
    alert("Please enter a word.");
  }
});

// Function to create on-screen keyboard
function createKeyboard() {
  const letters = "abcdefghijklmnopqrstuvwxyzčćđšžüöäß";
  keyboardContainer.innerHTML = letters
    .split("")
    .map(
      (letter) =>
        `<button class="key" data-letter="${letter}">${letter}</button>`
    )
    .join("");
}

// Function to handle on-screen keyboard button clicks
function handleKeyboardClick(e) {
  const letter = e.target.dataset.letter;
  if (letter) {
    processGuess(letter);
  }
}

// Function to process a guessed letter
function processGuess(letter) {
  if (
    isGuessing &&
    selectedWord &&
    !correctLetters.includes(letter) &&
    !wrongLetters.includes(letter)
  ) {
    if (selectedWord.includes(letter)) {
      correctLetters.push(letter);
      displayWord();
    } else {
      wrongLetters.push(letter);
      points -= 10;
      updateWrongLetters();
      updatePoints();
    }
  } else {
    showNotification();
  }
}

// Add event listener for on-screen keyboard
keyboardContainer.addEventListener("click", handleKeyboardClick);

// Event listener for keydown events to handle guesses
window.addEventListener("keydown", (e) => {
  const letter = e.key.toLowerCase();
  if (isGuessing && "abcdefghijklmnopqrstuvwxyzčćđšžüöäß".includes(letter)) {
    processGuess(letter);
  }
});

// Event listener for the play again button to reset the game
playButton.addEventListener("click", async () => {
  resetGame();
  isGuessing = false;

  if (gameMode === "player-vs-computer") {
    selectedWord = await getRandomWord();
    displayWord();
    isGuessing = true;
    if (window.innerWidth <= 768) {
      createKeyboard(); // Create the on-screen keyboard for mobile devices
    }
    interval = setInterval(updateTimer, 1000);
  } else {
    wordInputContainer.style.display = "block";
    wordInput.focus(); // Focus on the word input field
    wordInput.value = "";
  }

  displayWord();
  updateWrongLetters();
});

// Event listener for the home button to go back to the home screen
homeButton.addEventListener("click", () => {
  document.getElementById("welcome-screen").style.display = "flex";
  document.getElementById("game-screen").style.display = "none";
  homeButton.style.display = "none"; // Hide the home button
  resetGame(); // Reset the game state
  isGuessing = false;
});

// Initial call to displayWord to handle the initial state
displayWord();
