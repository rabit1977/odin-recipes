// ==========================================
// PART 1: CANVAS CIRCLE DRAWING
// ==========================================
const btn = document.querySelector('button');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

function random(number) {
  return Math.floor(Math.random() * number);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    ctx.fillStyle = 'rgb(255 0 0 / 50%)';
    ctx.arc(
      random(canvas.width),
      random(canvas.height),
      random(50),
      0,
      2 * Math.PI,
    );
    ctx.fill();
  }
}

// 1. Tell the button to run the `draw` function when clicked!
btn.addEventListener('click', draw);

// ==========================================
// PART 2: THE CAT LIST
// ==========================================
const catBtn = document.querySelector('#cat-btn');

const catsLooping = ['Leopard', 'Serval', 'Jaguar', 'Tiger', 'Caracal', 'Lion'];
const catList = document.querySelector('.cat-list');

catBtn.addEventListener('click', () => {
  // 3. This runs when the button is clicked.
  for (const cat of catsLooping) {
    const listOfCats = document.createElement('li');
    listOfCats.textContent = cat;
    catList.appendChild(listOfCats);
  }
});

// Part 3: THE CAT LIST (MAP VERSION)
// ==========================================
// Your original logic to uppercase the cats

function toUpper(string) {
  return string.toUpperCase();
}

const catsMapping = ['Leopard', 'Serval', 'Jaguar', 'Tiger', 'Caracal', 'Lion'];
const upperCats = catsMapping.map(toUpper);

// 2. Grab the new button and the list container
const uppercaseBtn = document.querySelector('#uppercase-btn');
const uppercaseList = document.querySelector('#uppercase-cats');

// 3. Make the button wait for a click!
uppercaseBtn.addEventListener('click', () => {
  for (const cat of upperCats) {
    const listItem = document.createElement('li');
    listItem.textContent = cat;
    uppercaseList.appendChild(listItem).style.color = 'red';
  }
});

const arr = [1, 2, 3, 4, 5];
const mappedArr = arr.map((num) => num + 1);
console.log(mappedArr); // Outputs [2, 3, 4, 5, 6]

// ==========================================
function addOne(num) {
  return num + 1;
}
const arr1 = [1, 2, 3, 4, 5];
const mappedArr1 = arr1.map(addOne);
console.log(mappedArr1); // Outputs [2, 3, 4, 5, 6]

// ==========================================
function isOdd(num) {
  return num % 2 !== 0;
}

const arr2 = [1, 2, 3, 4, 5];
const oddNums = arr2.filter(isOdd);
console.log(oddNums); // Outputs [1, 3, 5];
console.log(arr2); // Outputs [1, 2, 3, 4, 5], original array is not affected

const arr3 = [1, 2, 3, 4, 5];
const oddNums1 = arr3.filter((num) => num % 2 !== 0);
console.log(oddNums1); // Outputs [1, 3, 5];
console.log(arr3); // Outputs [1, 2, 3, 4, 5], original array is not affected

// ==========================================

const arr4 = [1, 2, 3, 4, 5];
const productOfAllNums = arr4.reduce((total, currentItem) => {
  return total * currentItem;
}, 1);
console.log(productOfAllNums); // Outputs 120;
console.log(arr4); // Outputs [1, 2, 3, 4, 5]

// ==========================================
const myNumbers = [1, 2, 3, 4, 5, 6];

function sumOfTripledEvens(array) {
  return array
    .filter((num) => num % 2 === 0)
    .map((num) => num * 3)
    .reduce((acc, curr) => acc + curr);
}
console.log(sumOfTripledEvens(myNumbers)); // Outputs 36

// ==========================================

function camelize(str) {
  return str
    .split('-') // Split into an array by dashes
    .map((word, index) =>
      index == 0 ? word : word[0].toUpperCase() + word.slice(1),
    ) // Capitalize first letter of all words except the first
    .join(''); // Join back into a single string
}
console.log(camelize('background-color')); // Outputs "backgroundColor"

// ==========================================

function filterRange(arr, a, b) {
  return arr.filter((item) => item >= a && item <= b);
}
console.log(filterRange([5, 3, 8, 1, 9], 1, 4)); // Outputs [3, 1]

// ==========================================

function filterRangeInPlace(arr, a, b) {
  for (let i = 0; i < arr.length; i++) {
    let val = arr[i];
    // If the value is outside the range, remove it
    if (val < a || val > b) {
      arr.splice(i, 1);
      i--; // Decrement i so we don't skip the next element after the array shifts!
    }
  }
}
console.log(filterRangeInPlace([5, 3, 8, 1, 9], 1, 4)); // Outputs [3, 1]

// ==========================================

let arr6 = [5, 2, 1, -10, 8];

arr6.sort((a, b) => b - a);

console.log(arr6); // 8, 5, 2, 1, -10

// ==========================================

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

    // swap elements array[i] and array[j]
    [array[i], array[j]] = [array[j], array[i]];
  }
}
const arr7 = [1, 2, 3, 4, 5];
shuffle(arr7);
console.log(arr7); // The order of elements will be random each time you run this code

// ==========================================

function unique(arr7) {
  return Array.from(new Set(arr7));
}
console.log(unique([1, 2, 2, 3, 3, 4])); // Outputs [1, 2, 3, 4]

// ==========================================

function groupById(arr7) {
  return arr7.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});
}
console.log(
  groupById([
    { id: 'john', name: 'John' },
    { id: 'jane', name: 'Jane' },
    { id: 'doe', name: 'Doe' },
    { id: 'kate', name: 'Kate' },
    { id: 'Alice', name: 'Alice' },
    { id: 'Bob', name: 'Bob' },
  ]),
); // Outputs { john: {id: 'john', name: 'John'}, jane: {id: 'jane', name: 'Jane'}, doe: {id: 'doe', name: 'Doe'}, kate: {id: 'kate', name: 'Kate'} }


// ==========================================

function getAverageAge(users) {
  return users.reduce((sum, user) => sum + user.age, 0) / users.length;
}
const users = [
  { name: 'John', age: 125 },
  { name: 'Jane', age: 30 },
  { name: 'Alice', age: 35 },
  { name: 'Bob', age: 40 }
];
console.log(getAverageAge(users)); // Outputs 32.5
