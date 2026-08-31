const container = document.querySelector('.container');
const GRID_SPACE = 960; // total px, stays constant regardless of grid size

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function createGrid(size) {
  const squareSize = GRID_SPACE / size;

  for (let i = 0; i < size * size; i++) {
    const square = document.createElement('div');
    square.classList.add('grid-square');
    square.style.width = `${squareSize}px`;
    square.style.height = `${squareSize}px`;

    let opacity = 0;

    square.addEventListener('mouseover', () => {
   //  square.classList.add('hovered'); with hovered effect

      if (opacity === 0) {
        square.style.backgroundColor = getRandomColor();
      }
      opacity = Math.min(opacity + 0.1, 1);
      square.style.opacity = opacity;
    });

    // uncommment this to apply mouseleave function
    // square.addEventListener('mouseleave', () => {
    //   square.classList.remove('hovered');
    // });

    container.appendChild(square);
  }
}

function clearGrid() {
  container.innerHTML = '';
}

function resetGrid() {
  let size = Math.floor(Number(prompt('Squares per side (max 100):', '16')));

  if (!size || size < 1) return; // covers cancel and bad input
  if (size > 100) size = 100;

  clearGrid();
  createGrid(size);
}

document.querySelector('#new-grid-btn').addEventListener('click', resetGrid);

createGrid(16);
