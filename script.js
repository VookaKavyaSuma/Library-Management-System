document.addEventListener("DOMContentLoaded", () => {
  const bookForm = document.getElementById("book-form");
  const submitBtn = document.getElementById("submit-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const bookList = document.querySelector("#book-list tbody");
  const searchInput = document.getElementById("search");

  const totalBooksSpan = document.getElementById("total-books");
  const availableBooksSpan = document.getElementById("available-books");
  const booksTakenSpan = document.getElementById("books-taken");

  const issueForm = document.getElementById("issue-form");
  const issueSelect = document.getElementById("issue-select");

  let books = [];
  let totalCopiesAdded = 0;
  let totalCopiesTaken = 0;

  let editIndex = -1;

  function updateStats() {
    totalBooksSpan.textContent = books.length; // number of distinct books
    let totalAvailableCopies = books.reduce((sum, book) => sum + (book.quantity - book.taken), 0);
    availableBooksSpan.textContent = totalAvailableCopies;
    booksTakenSpan.textContent = totalCopiesTaken;
  }

  function updateIssueSelect() {
    issueSelect.innerHTML = `<option value="" disabled selected>Select a book to issue</option>`;
    books.forEach((book, index) => {
      const available = book.quantity - book.taken;
      if (available > 0) {
        issueSelect.innerHTML += `<option value="${index}">${book.title} by ${book.author} (${available} available)</option>`;
      }
    });
  }

  function renderBooks(filteredBooks) {
    bookList.innerHTML = "";
    filteredBooks.forEach((book, index) => addBookToList(book, index));
  }

  function addBookToList(book, index) {
    const available = book.quantity - book.taken;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.isbn}</td>
      <td>${available} / ${book.quantity}</td>
      <td><button class="edit-btn">Edit</button></td>
      <td><button class="action-btn" ${available <= 0 ? "disabled" : ""}>Delete</button></td>
    `;

    row.querySelector(".edit-btn").addEventListener("click", () => {
      editIndex = index;
      document.getElementById("title").value = book.title;
      document.getElementById("author").value = book.author;
      document.getElementById("isbn").value = book.isbn;
      document.getElementById("quantity").value = book.quantity;
      submitBtn.textContent = "Update Book";
      cancelBtn.style.display = "inline-block";
    });

    row.querySelector(".action-btn").addEventListener("click", () => {
      book.taken++;
      totalCopiesTaken++;
      updateStats();
      updateIssueSelect();
      renderBooks(books);
    });

    bookList.appendChild(row);
  }

  function resetForm() {
    bookForm.reset();
    editIndex = -1;
    submitBtn.textContent = "Add Book";
    cancelBtn.style.display = "none";
  }

  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const isbn = document.getElementById("isbn").value.trim();
    const quantityInput = document.getElementById("quantity").value.trim();
    const quantity = parseInt(quantityInput, 10);

    if (title === "" || author === "" || isbn === "" || isNaN(quantity) || quantity < 1) {
      alert("Please fill in all fields correctly, and quantity at least 1.");
      return;
    }

    if (editIndex === -1) {
      let existingBook = books.find(b => b.title === title && b.author === author && b.isbn === isbn);

      if (existingBook) {
        existingBook.quantity += quantity;
      } else {
        books.push({ title, author, isbn, quantity, taken: 0 });
      }

      totalCopiesAdded += quantity;

    } else {
      let book = books[editIndex];

      totalCopiesAdded = totalCopiesAdded - book.quantity + quantity;

      if (quantity < book.taken) {
        totalCopiesTaken -= (book.taken - quantity);
        book.taken = quantity;
      }

      books[editIndex] = { title, author, isbn, quantity, taken: books[editIndex].taken };

      editIndex = -1;
      submitBtn.textContent = "Add Book";
      cancelBtn.style.display = "none";
    }

    updateStats();
    updateIssueSelect();
    renderBooks(books);

    resetForm();
  });

  cancelBtn.addEventListener("click", () => {
    resetForm();
  });

  issueForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const selectedIndex = issueSelect.value;

    if (selectedIndex === "") {
      alert("Please select a book to issue.");
      return;
    }

    const book = books[selectedIndex];
    if (book.quantity - book.taken <= 0) {
      alert("No copies available to issue.");
      return;
    }

    book.taken++;
    totalCopiesTaken++;

    updateStats();
    updateIssueSelect();
    renderBooks(books);
  });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filteredBooks = books.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.isbn.toLowerCase().includes(query)
    );
    renderBooks(filteredBooks);
  });

  updateStats();
  updateIssueSelect();
});
