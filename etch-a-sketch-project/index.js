const container = document.querySelector('.container');
const GRID_SPACE = 960; // total px, stays constant regardless of grid size

function createGrid(size) {
  const squareSize = GRID_SPACE / size;

  for (let i = 0; i < size * size; i++) {
    const square = document.createElement('div');
    square.classList.add('grid-square');
    square.style.width = `${squareSize}px`;
    square.style.height = `${squareSize}px`;

    square.addEventListener('mouseover', () => {
      square.classList.add('hovered');
    });

// uncommment this to apply mouseleave
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
