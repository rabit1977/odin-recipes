// function alertFunction() {
//   alert('You clicked me with onclick!');
// }
const btn = document.querySelector('#btn');

btn.addEventListener('click', function (e) {
  console.log(e.target);
});

btn.addEventListener('click', function (e) {
  e.target.style.background = 'blue';
  e.target.style.color = 'white';
  e.target.style.fontSize = '2rem';
  e.target.style.padding = '1rem';
});

const btn1 = document.querySelector('button');

function random(number) {
  return Math.floor(Math.random() * (number + 1));
}

function random1(number) {
  return Math.floor(Math.random() * (number + 3));
}

function bgChange(e) {
  const rndCol = `rgb(${random(255)} ${random(255)} ${random(255)})`;
  const rndCol1 = `rgb(${random1(255)} ${random1(255)} ${random1(255)})`;
  e.target.style.color = rndCol1;
  e.target.style.backgroundColor = rndCol;
  console.log(e);
}

btn1.addEventListener('click', bgChange);

// ==========================================

const textBox = document.querySelector('#textBox');
const output = document.querySelector('#output');
textBox.addEventListener('keydown', (e) => {
  output.textContent = `You pressed "${e.key}".`;
});

// ==========================================
// Part 1: form submission
// const form = document.querySelector("form");
// const fname = document.getElementById("fname");
// const lname = document.getElementById("lname");
// const para = document.querySelector("p");

// form.addEventListener("submit", (e) => {
//   if (fname.value === "" || lname.value === "") {
//     e.preventDefault();
//     para.textContent = "You need to fill in both names!";
//   }
// });

// ==========================================
// Part 2: form submission

const form = document.querySelector('form');
const fname = document.getElementById('fname');
const lname = document.getElementById('lname');
const para = document.querySelector('p');

form.addEventListener('submit', (e) => {
  // 1. Stop the page from reloading so we can show the result
  e.preventDefault();

  // 2. Get the values and remove extra spaces using .trim()
  const firstName = fname.value.trim();
  const lastName = lname.value.trim();

  // 3. Robust validation check
  if (firstName === '' || lastName === '') {
    // Show error message
    para.textContent = "You need to fill in both names! (Spaces don't count)";
    para.style.color = 'red'; // Make error text red
  } else {
    // 4. If successful, display the typed text on the page
    para.textContent = `Success! Welcome to the page, ${firstName} ${lastName}!`;
    para.style.color = 'green'; // Make success text green

    // 5. (Optional) Clear the form fields for the next submission
    fname.value = '';
    lname.value = '';
  }
});

// ============================

const buttons = document.querySelectorAll('button');

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    alert(button.id);
  });
});

// =============================================

const btn5 = document.querySelector("#dark-mode-btn");

btn5.addEventListener("click", () => {
  // Toggles a dark background on the whole page
  if (document.body.style.backgroundColor === "black") {
    document.body.style.backgroundColor = "white";
    document.body.style.color = "black";
  } else {
    document.body.style.backgroundColor = "black";
    document.body.style.color = "white";
  }
});


// =================================================

const chatInput = document.querySelector("#chat-input");
const chatLog = document.querySelector("#chat-log");

chatInput.addEventListener("keydown", (event) => {
  // Check if the exact key pressed was 'Enter'
  if (event.key === "Enter") {
    chatLog.textContent = `You said: ${chatInput.value}`;
    chatInput.value = ""; // Clear the input box after sending
  }
});


// ===============================================

// 1. Select the elements we need from the DOM

const list = document.querySelector('#shopping-list');
const input = document.querySelector('#item');
const addBtn = document.querySelector('#add-btn');

// 2. Add an event listener to the "Add item" button
addBtn.addEventListener('click', () => {
  
  // Save the current input value and remove extra spaces
  const currentItem = input.value.trim();
  
  // If the user typed nothing, stop the function early so we don't add blank items
  if (currentItem === '') {
    return;
  }

  // Clear the input box for the next item
  input.value = '';

  // 3. Create three new HTML elements in memory
  const listItem = document.createElement('li');
  const listText = document.createElement('span');
  const deleteBtn = document.createElement('button');

  // Put the user's text into the span, and "Delete" into the button
  listText.textContent = currentItem;
  deleteBtn.textContent = 'Delete';

  // Assemble the piece: append the text and button INSIDE the list item
  listItem.appendChild(listText);
  listItem.appendChild(deleteBtn);

  // Append the fully assembled list item onto the actual webpage
  list.appendChild(listItem);

  // 4. Attach an event listener to the NEW delete button we just created
  deleteBtn.addEventListener('click', () => {
    // When clicked, completely remove this specific <li> from the DOM
    listItem.remove();
    
    // Put the cursor back in the input box automatically
    input.focus(); 
  });

  // 5. Put the cursor back in the input box automatically after adding an item
  input.focus();
});