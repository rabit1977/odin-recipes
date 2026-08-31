function createGrid(size) {
  const container = document.querySelector('.container');

  for (let i = 0; i < size * size; i++) {
    const square = document.createElement('div');
    square.classList.add('grid-square');

    square.addEventListener('mouseover', () => {
      square.classList.add('hovered');
    });
    container.appendChild(square);
  }
}

createGrid(16);
