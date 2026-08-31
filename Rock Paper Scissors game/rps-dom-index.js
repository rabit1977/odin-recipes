// STEP 6: Wrap everything in a main playGame function
function playGame() {
  
  // STEP 4: Declare the players' score variables
  // We use 'let' because these values will change as the game progresses.
  let humanScore = 0;
  let computerScore = 0;

  // STEP 2: Logic to get the computer's choice
  function getComputerChoice() {
    // Math.random() generates a random decimal between 0 and 1.
    let randomNumber = Math.random();
    
    if (randomNumber < 0.33) {
      return "rock";
    } else if (randomNumber < 0.66) {
      return "paper";
    } else {
      return "scissors";
    }
  }

  // STEP 3: Logic to get the human's choice
  function getHumanChoice() {
    // prompt() opens a popup asking the user for input
    let choice = prompt("Enter Rock, Paper, or Scissors:");
    return choice;
  }

  // STEP 5: Logic to play a single round
  function playRound(humanChoice, computerChoice) {
    // Make the human choice case-insensitive by forcing it to lowercase
    humanChoice = humanChoice.toLowerCase();

    // Check for a tie first
    if (humanChoice === computerChoice) {
      console.log(`It's a tie! Both chose ${humanChoice}.`);
    } 
    // Check all the ways the human can win
    else if (
      (humanChoice === "rock" && computerChoice === "scissors") ||
      (humanChoice === "paper" && computerChoice === "rock") ||
      (humanChoice === "scissors" && computerChoice === "paper")
    ) {
      humanScore++; // Increment human score by 1
      console.log(`You win this round! ${humanChoice} beats ${computerChoice}.`);
    } 
    // If it's not a tie and the human didn't win, the computer must have won
    else {
      computerScore++; // Increment computer score by 1
      console.log(`You lose this round! ${computerChoice} beats ${humanChoice}.`);
    }
  }

  // STEP 6 (Continued): Play 5 rounds
  // We use a simple 'for' loop to run the code inside 5 times.
  for (let i = 1; i <= 5; i++) {
    console.log(`--- Round ${i} ---`);
    
    // We must call the choice functions inside the loop so we get NEW choices every round
    const humanSelection = getHumanChoice();
    const computerSelection = getComputerChoice();
    
    // Play the round with the choices we just got
    playRound(humanSelection, computerSelection);
    
    // Show the current score after the round
    console.log(`Current Score: Human: ${humanScore} | Computer: ${computerScore}`);
  }

  // Final Winner Declaration
  console.log("--- FINAL RESULTS ---");
  if (humanScore > computerScore) {
    console.log(`🎉 You won the game! Final Score: ${humanScore} to ${computerScore}`);
  } else if (computerScore > humanScore) {
    console.log(`💀 The computer won the game. Final Score: ${computerScore} to ${humanScore}`);
  } else {
    console.log(`🤝 It's a complete tie! Final Score: ${humanScore} to ${computerScore}`);
  }
}

// Start the game!
playGame();