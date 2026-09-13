const myLibrary = [];

function Book(title, author, pages, read) {
  this.id = crypto.randomUUID();
  this.title = title;
  this.author = author;
  this.pages = Number(pages);
  this.read = Boolean(read);
}

Book.prototype.toggleRead = function () {
  this.read = !this.read;
};

function addBookToLibrary(title, author, pages, read) {
  const book = new Book(title, author, pages, read);
  myLibrary.push(book);
  return book;
}

function removeBookFromLibrary(id) {
  const index = myLibrary.findIndex((book) => book.id === id);
  if (index !== -1) myLibrary.splice(index, 1);
}

function findBook(id) {
  return myLibrary.find((book) => book.id === id);
}

// --- DOM references ---
const shelf = document.getElementById("shelf");
const emptyState = document.getElementById("empty-state");
const newBookBtn = document.getElementById("new-book-btn");
const dialog = document.getElementById("book-dialog");
const form = document.getElementById("book-form");
const cancelBtn = document.getElementById("cancel-btn");

function createBookRow(book) {
  const row = document.createElement("div");
  row.className = "book-row";
  row.dataset.id = book.id;

  const info = document.createElement("div");
  info.className = "book-info";

  const title = document.createElement("p");
  title.className = "book-title";
  title.textContent = book.title;

  const meta = document.createElement("p");
  meta.className = "book-meta";
  meta.textContent = `${book.author} \u00b7 ${book.pages} pages`;

  info.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "book-actions";

  const readToggle = document.createElement("button");
  readToggle.type = "button";
  readToggle.className = `read-toggle${book.read ? " is-read" : ""}`;
  readToggle.textContent = book.read ? "Read" : "Unread";
  readToggle.dataset.action = "toggle";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-btn";
  removeBtn.setAttribute("aria-label", "Remove book");
  removeBtn.textContent = "\u00d7";
  removeBtn.dataset.action = "remove";

  actions.append(readToggle, removeBtn);
  row.append(info, actions);
  return row;
}

function renderLibrary() {
  shelf.innerHTML = "";
  emptyState.hidden = myLibrary.length !== 0;
  myLibrary.forEach((book) => shelf.appendChild(createBookRow(book)));
}

shelf.addEventListener("click", (event) => {
  const actionBtn = event.target.closest("button[data-action]");
  if (!actionBtn) return;

  const row = event.target.closest(".book-row");
  const id = row.dataset.id;

  if (actionBtn.dataset.action === "remove") {
    removeBookFromLibrary(id);
    renderLibrary();
  }

  if (actionBtn.dataset.action === "toggle") {
    const book = findBook(id);
    if (book) {
      book.toggleRead();
      renderLibrary();
    }
  }
});

newBookBtn.addEventListener("click", () => {
  form.reset();
  dialog.showModal();
  document.getElementById("title").focus();
});

cancelBtn.addEventListener("click", () => {
  dialog.close();
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  addBookToLibrary(
    data.get("title").trim(),
    data.get("author").trim(),
    data.get("pages"),
    data.get("read") === "on"
  );

  renderLibrary();
  form.reset();
  dialog.close();
});

// Seed a few books so the shelf isn't empty on first load.
addBookToLibrary("The Hobbit", "J.R.R. Tolkien", 310, true);
addBookToLibrary("Dune", "Frank Herbert", 412, false);
addBookToLibrary("The Pragmatic Programmer", "Hunt & Thomas", 352, true);

renderLibrary();