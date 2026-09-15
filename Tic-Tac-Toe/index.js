/* ============================================================
   PLAYER — a factory function.
   We need MULTIPLE players, so this can't be a singleton module;
   every call to Player() returns a fresh, independent object.
   ============================================================ */
const Player = (name, mark) => ({
  name: name || `Player ${mark}`,
  mark,
});

/* ============================================================
   GAMEBOARD — a module (IIFE).
   There is only ever ONE board, so the factory is wrapped and
   invoked immediately. The `board` array lives inside this
   closure and can never be touched directly from the outside —
   only through the methods we choose to return.
   ============================================================ */
const Gameboard = (function () {
  const board = Array(9).fill("");

  const getBoard = () => [...board]; // copy out, so callers can't mutate our array

  const placeMark = (index, mark) => {
    if (board[index] !== "") return false;
    board[index] = mark;
    return true;
  };

  const reset = () => board.fill("");

  return { getBoard, placeMark, reset };
})();

/* ============================================================
   GAMECONTROLLER — a module (IIFE).
   Owns turn order, win/tie detection, and game-over state.
   This is all about the FLOW of a game, not the board's raw
   data — keeping that separate from Gameboard is what makes
   each piece small enough to reason about on its own.
   ============================================================ */
const GameController = (function () {
  const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],            // diagonals
  ];

  let players = [];
  let activeIndex = 0;
  let over = false;
  let winner = null; // a Player object, or null (tie / game still on)

  const start = (nameX, nameO) => {
    players = [Player(nameX, "X"), Player(nameO, "O")];
    activeIndex = 0;
    over = false;
    winner = null;
    Gameboard.reset();
  };

  const getActivePlayer = () => players[activeIndex];

  const switchTurn = () => {
    activeIndex = activeIndex === 0 ? 1 : 0;
  };

  const checkWin = (board) =>
    WINNING_COMBOS.some(
      ([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]
    );

  const checkTie = (board) => board.every((cell) => cell !== "");

  // Returns a small result object so the display layer knows whether
  // the move was legal, without needing to know HOW that was decided.
  const playRound = (index) => {
    if (over) return { ok: false };

    const placed = Gameboard.placeMark(index, getActivePlayer().mark);
    if (!placed) return { ok: false };

    const board = Gameboard.getBoard();
    if (checkWin(board)) {
      over = true;
      winner = getActivePlayer();
    } else if (checkTie(board)) {
      over = true;
      winner = null;
    } else {
      switchTurn();
    }

    return { ok: true };
  };

  const isOver = () => over;
  const getWinner = () => winner;

  return { start, playRound, getActivePlayer, isOver, getWinner };
})();

/* ============================================================
   DISPLAYCONTROLLER — a module (IIFE).
   The only part of the app that touches the DOM. It renders
   Gameboard's state and translates clicks into calls on
   GameController. Nothing above this line knows the DOM exists,
   which is exactly what lets you test everything above in the
   console before writing a single line of this.
   ============================================================ */
const DisplayController = (function () {
  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");
  const formEl = document.getElementById("setup-form");
  const nameXEl = document.getElementById("player-x-name");
  const nameOEl = document.getElementById("player-o-name");
  const startBtn = document.getElementById("start-btn");

  const renderBoard = (justPlacedIndex = null) => {
    const board = Gameboard.getBoard();
    boardEl.innerHTML = "";

    board.forEach((mark, index) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.textContent = mark;
      cell.disabled = Boolean(mark) || GameController.isOver();

      if (mark === "X") cell.classList.add("mark-x");
      if (mark === "O") cell.classList.add("mark-o");
      if (index === justPlacedIndex) cell.classList.add("pop");

      cell.addEventListener("click", () => handleCellClick(index));
      boardEl.appendChild(cell);
    });
  };

  const renderStatus = () => {
    if (GameController.isOver()) {
      const winner = GameController.getWinner();
      statusEl.textContent = winner ? `${winner.name} wins!` : "It's a tie.";
    } else {
      const active = GameController.getActivePlayer();
      statusEl.textContent = `${active.name}'s turn (${active.mark})`;
    }
  };

  const handleCellClick = (index) => {
    const result = GameController.playRound(index);
    if (!result.ok) return;
    renderBoard(index);
    renderStatus();
  };

  const handleStart = (event) => {
    event.preventDefault();
    GameController.start(nameXEl.value.trim(), nameOEl.value.trim());
    startBtn.textContent = "Restart";
    renderBoard();
    renderStatus();
  };

  const init = () => {
    formEl.addEventListener("submit", handleStart);
    GameController.start();
    renderBoard();
    renderStatus();
  };

  return { init };
})();

DisplayController.init();