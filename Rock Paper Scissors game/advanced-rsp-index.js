// index.js

let humanScore = 0;
let computerScore = 0;
let isGameOver = false;

// DOM Elements
const gameBoard = document.querySelector("#game-board"); // NEW: Target the board for glow
const buttons = document.querySelectorAll(".play-btn");
const humanScoreDisplay = document.querySelector("#human-score");
const compScoreDisplay = document.querySelector("#comp-score");
const roundResultDisplay = document.querySelector("#round-result");
const historyList = document.querySelector("#history-list");
const resetContainer = document.querySelector("#reset-container");

function getComputerChoice() {
  const rand = Math.random();
  if (rand < 0.33) return "rock";
  else if (rand < 0.66) return "paper";
  else return "scissors";
}

function playRound(humanChoice) {
  if (isGameOver) return;

  const computerChoice = getComputerChoice();
  let resultMessage = "";
  let flashClass = "";

  if (humanChoice === computerChoice) {
    resultMessage = `Tie! Both chose ${humanChoice}.`;
    flashClass = "tie-flash";
  } else if (
    (humanChoice === "rock" && computerChoice === "scissors") ||
    (humanChoice === "paper" && computerChoice === "rock") ||
    (humanChoice === "scissors" && computerChoice === "paper")
  ) {
    humanScore++;
    resultMessage = `You win! ${humanChoice} beats ${computerChoice}.`;
    flashClass = "win-flash";
  } else {
    computerScore++;
    resultMessage = `You lose! ${computerChoice} beats ${humanChoice}.`;
    flashClass = "lose-flash";
  }

  humanScoreDisplay.textContent = humanScore;
  compScoreDisplay.textContent = computerScore;
  roundResultDisplay.textContent = resultMessage;

  // Visual Feedback - Glow the game board instead of the body
  gameBoard.classList.add(flashClass);
  setTimeout(() => {
    gameBoard.classList.remove(flashClass);
  }, 400);

  // Round History (Animation is handled automatically by CSS now!)
  const historyItem = document.createElement("li");
  historyItem.textContent = resultMessage;
  historyList.prepend(historyItem); 

  checkWinner();
}

function checkWinner() {
  if (humanScore === 5 || computerScore === 5) {
    isGameOver = true;
    
    if (humanScore === 5) {
      roundResultDisplay.textContent = "🏆 YOU WON THE MATCH! 🏆";
      roundResultDisplay.style.color = "#4facfe"; // Highlight text
    } else {
      roundResultDisplay.textContent = "💀 THE COMPUTER WON! 💀";
      roundResultDisplay.style.color = "#fe4f4f";
    }

    buttons.forEach((btn) => (btn.disabled = true));

    // Play Again Button
    const resetButton = document.createElement("button");
    resetButton.textContent = "Play Again";
    resetButton.style.padding = "12px 24px";
    resetButton.style.fontSize = "16px";
    
    resetButton.addEventListener("click", () => {
      humanScore = 0;
      computerScore = 0;
      isGameOver = false;
      humanScoreDisplay.textContent = "0";
      compScoreDisplay.textContent = "0";
      roundResultDisplay.textContent = "Make your choice to begin!";
      roundResultDisplay.style.color = "white"; // Reset text color
      historyList.innerHTML = ""; 
      buttons.forEach((btn) => (btn.disabled = false));
      resetContainer.innerHTML = ""; 
    });

    resetContainer.appendChild(resetButton);
  }
}

// Event Listeners
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    playRound(button.id);
  });
});

document.addEventListener("keydown", (event) => {
  if (isGameOver) return;

  const key = event.key.toLowerCase();
  
  if (key === "r") playRound("rock");
  if (key === "p") playRound("paper");
  if (key === "s") playRound("scissors");
});