// 1. Setup intial scores
let humanScore = 0;
let computerScore = 0;

// 2. Select the DOM elements
const buttons = document.querySelectorAll('button');
const roundResult = document.querySelector('#round-result');
const scoreDisplay = document.querySelector('#score');

// 3. Create getComputerChoice function

function getComputerChoice() {
  let randomNumber = Math.random();
  if (randomNumber < 0.33) return 'rock';
  else if (randomNumber < 0.66) return 'paper';
  else return 'scissors';
}

function playRound(humanChoice) {
  const computerChoice = getComputerChoice();

  if (humanChoice === computerChoice) {
    roundResult.textContent = `It's a tie! Both chose ${humanChoice}.`;
  } else if (
    (humanChoice === 'rock' && computerChoice === 'scissors') ||
    (humanChoice === 'papaer' && computerChoice === 'rock') ||
    (humanChoice === 'scissors' && computerChoice === 'paper')
  ) {
    humanScore++;
    roundResult.textContent = `You win ${humanChoice} beats ${computerChoice}.`;
  } else {
    computerScore++;
    roundResult.textContent = `You lose! ${humanChoice} beats ${computerChoice}.`;
  }

  // update the score display
  scoreDisplay.textContent = `Player: ${humanScore} | Computer: ${computerScore}.`;

  // Check if someone reached 5 points
  checkWinner();
}

// 5. Create a function to check for the final winner
function checkWinner() {
  if (humanScore === 5 || computerScore === 5) {
    if (humanScore === 5) {
      roundResult.textContent = "🎉 YOU WON THE GAME! 🎉";
    } else {
      roundResult.textContent = "💀 THE COMPUTER WON THE GAME! 💀";
    }
    
    // Disable buttons so the game stops playing
    buttons.forEach(button => button.disabled = true);
  }
}

// 6. Add event listeners to all buttons
// We use a loop so we don't have to write 3 separate listeners!
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    // We pass the button's ID ("rock", "paper", or "scissors") into playRound
    playRound(button.id);
  });
});