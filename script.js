// ===========================
// Constants & State
// ===========================

const STORAGE_KEY = 'daily_expense_tracker_data';

const CATEGORY_ICONS = {
  Makanan: '🍽️',
  Transportasi: '🚌',
  Pendidikan: '📚',
  Hiburan: '🎮',
  Belanja: '🛍️',
  Lainnya: '📦',
};

// ===========================
// DOM References
// ===========================

const form           = document.getElementById('expenseForm');
const nameInput      = document.getElementById('expenseName');
const amountInput    = document.getElementById('expenseAmount');
const categoryInput  = document.getElementById('expenseCategory');
const dateInput      = document.getElementById('expenseDate');
const totalAmountEl  = document.getElementById('totalAmount');
const tableBody      = document.getElementById('expenseTableBody');
const emptyState     = document.getElementById('emptyState');
const tableWrapper   = document.getElementById('tableWrapper');

const nameError      = document.getElementById('nameError');
const amountError    = document.getElementById('amountError');
const categoryError  = document.getElementById('categoryError');
const dateError      = document.getElementById('dateError');

// ===========================
// Storage Helpers
// ===========================

function loadExpenses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

// ===========================
// Currency Formatter
// ===========================

function formatRupiah(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

// ===========================
// Date Formatter
// ===========================

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
}

// ===========================
// Validation
// ===========================

function clearErrors() {
  [nameInput, amountInput, categoryInput, dateInput].forEach(el =>
    el.classList.remove('is-invalid')
  );
  [nameError, amountError, categoryError, dateError].forEach(el =>
    (el.textContent = '')
  );
}

function validateForm() {
  let valid = true;

  const name     = nameInput.value.trim();
  const amount   = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date     = dateInput.value;

  if (!name) {
    nameError.textContent = 'Nama pengeluaran tidak boleh kosong.';
    nameInput.classList.add('is-invalid');
    valid = false;
  }

  if (!amountInput.value || isNaN(amount) || amount <= 0) {
    amountError.textContent = 'Jumlah harus berupa angka positif.';
    amountInput.classList.add('is-invalid');
    valid = false;
  }

  if (!category) {
    categoryError.textContent = 'Pilih kategori pengeluaran.';
    categoryInput.classList.add('is-invalid');
    valid = false;
  }

  if (!date) {
    dateError.textContent = 'Tanggal tidak boleh kosong.';
    dateInput.classList.add('is-invalid');
    valid = false;
  }

  return valid;
}

// ===========================
// Render
// ===========================

function renderTable(expenses) {
  if (expenses.length === 0) {
    emptyState.style.display = 'block';
    tableWrapper.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  tableWrapper.style.display = 'block';

  // Sort newest first
  const sorted = [...expenses].sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.id - a.id;
  });

  tableBody.innerHTML = sorted
    .map(
      expense => `
      <tr data-id="${expense.id}">
        <td>${escapeHtml(expense.name)}</td>
        <td>
          <span class="badge badge--${escapeHtml(expense.category)}">
            ${CATEGORY_ICONS[expense.category] || ''} ${escapeHtml(expense.category)}
          </span>
        </td>
        <td>${formatDate(expense.date)}</td>
        <td class="amount-cell">${formatRupiah(expense.amount)}</td>
        <td>
          <button
            class="btn btn--danger"
            onclick="deleteExpense(${expense.id})"
            title="Hapus pengeluaran ini"
          >Hapus</button>
        </td>
      </tr>`
    )
    .join('');
}

function updateTotal(expenses) {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  totalAmountEl.textContent = formatRupiah(total);
}

// ===========================
// XSS guard
// ===========================

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===========================
// Add Expense
// ===========================

form.addEventListener('submit', function (e) {
  e.preventDefault();
  clearErrors();

  if (!validateForm()) return;

  const expenses = loadExpenses();

  const newExpense = {
    id:       Date.now(),
    name:     nameInput.value.trim(),
    amount:   parseFloat(amountInput.value),
    category: categoryInput.value,
    date:     dateInput.value,
  };

  expenses.push(newExpense);
  saveExpenses(expenses);

  renderTable(expenses);
  updateTotal(expenses);

  // Reset form
  form.reset();
  clearErrors();
  setDefaultDate();
});

// ===========================
// Delete Expense
// ===========================

function deleteExpense(id) {
  const expenses = loadExpenses().filter(e => e.id !== id);
  saveExpenses(expenses);
  renderTable(expenses);
  updateTotal(expenses);
}

// ===========================
// Default Date
// ===========================

function setDefaultDate() {
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, '0');
  const dd    = String(today.getDate()).padStart(2, '0');
  dateInput.value = `${yyyy}-${mm}-${dd}`;
}

// ===========================
// Clear invalid state on input
// ===========================

[nameInput, amountInput, categoryInput, dateInput].forEach(el => {
  el.addEventListener('input', () => el.classList.remove('is-invalid'));
  el.addEventListener('change', () => el.classList.remove('is-invalid'));
});

// ===========================
// Init
// ===========================

(function init() {
  setDefaultDate();
  const expenses = loadExpenses();
  renderTable(expenses);
  updateTotal(expenses);
})();
