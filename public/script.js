const noteForm = document.querySelector('#note-form');
const notesList = document.querySelector('#notes-list');
const noteCount = document.querySelector('#note-count');
const formMessage = document.querySelector('#form-message');

async function loadNotes() {
  try {
    const response = await fetch('/notes');
    if (!response.ok) throw new Error('Could not load notes.');
    renderNotes(await response.json());
  } catch (error) {
    notesList.innerHTML = `<p class="empty-state">${error.message}</p>`;
  }
}

function renderNotes(notes) {
  noteCount.textContent = notes.length;

  if (notes.length === 0) {
    notesList.innerHTML = '<p class="empty-state">Your first technical note is waiting here.</p>';
    return;
  }

  notesList.innerHTML = notes.map((note) => `
    <article class="note-card">
      <h3>${escapeHtml(note.title)}</h3>
      <p>${escapeHtml(note.description)}</p>
      <small class="note-date">${new Date(note.createdAt).toLocaleString()}</small>
      <button class="delete-button" type="button" data-id="${note._id}" aria-label="Delete ${escapeHtml(note.title)}">×</button>
    </article>
  `).join('');
}

noteForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(noteForm);
  formMessage.textContent = '';

  try {
    const response = await fetch('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.get('title'),
        description: formData.get('description')
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    noteForm.reset();
    formMessage.textContent = 'Note saved to your session.';
    await loadNotes();
  } catch (error) {
    formMessage.textContent = error.message;
  }
});

notesList.addEventListener('click', async (event) => {
  const button = event.target.closest('.delete-button');
  if (!button) return;

  const response = await fetch(`/notes/${button.dataset.id}`, { method: 'DELETE' });
  if (response.ok) await loadNotes();
});

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  }[character]));
}

loadNotes();
