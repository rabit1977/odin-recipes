Here is the complete walkthrough and code for your first major JavaScript project!

Since you recently reviewed the problem-solving process (Understand, Plan, Divide & Conquer), let's start with the Pseudocode (The Plan) to map out the logic before writing the actual JavaScript.

1. The Pseudocode & Logic Plan
Goal: Play a 5-round game of Rock, Paper, Scissors against the computer, keep score, and declare a final winner.

Step-by-Step Logic:

Wrap everything in a main function (playGame) so the game can be started whenever we want.

Declare scores: Create two variables starting at 0 to track the human and computer scores.

Computer Choice: Generate a random number. If it's between 0-0.33, return "rock". If 0.34-0.66, return "paper". Otherwise, return "scissors".

Human Choice: Prompt the user to type their choice and return whatever they typed.

Play a Round:

Take the human choice and force it to lowercase so "RoCk" and "rock" are treated the same.

Compare the human choice to the computer choice using if/else statements.

Announce the winner of the round and add 1 to their score variable.

Loop 5 times: Ask for choices and play a round 5 times.

Final Winner: Compare the final scores and console.log the ultimate winner.