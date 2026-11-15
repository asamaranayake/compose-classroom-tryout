const form = document.querySelector('#note-form');
const noteBody = document.querySelector('#note-body');
const submitButton = document.querySelector('#submit-button');
const statusMessage = document.querySelector('#status');
const notesList = document.querySelector('#notes');

async function requestNotes(path, options) {
  const response = await fetch(path, options);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'The request could not be completed.');
  }
  return result;
}

function renderNotes(notes) {
  notesList.replaceChildren();
  for (const note of notes) {
    const item = document.createElement('li');
    const body = document.createElement('p');
    const created = document.createElement('time');
    body.textContent = note.body;
    created.dateTime = note.created_at;
    created.textContent = new Date(note.created_at).toLocaleString();
    item.append(body, created);
    notesList.append(item);
  }
}

async function loadNotes() {
  try {
    renderNotes(await requestNotes('/api/notes'));
  } catch (error) {
    statusMessage.textContent = error.message;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  statusMessage.textContent = '';

  try {
    await requestNotes('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: noteBody.value })
    });
    noteBody.value = '';
    await loadNotes();
  } catch (error) {
    statusMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

loadNotes();
