// Define UI elements
let noteForm = document.querySelector('.note-form');
let noteTitle = document.querySelector('.note-title');
let noteText = document.querySelector('.note-textarea');
let saveNoteBtn = document.querySelector('.save-note');
let newNoteBtn = document.querySelector('.new-note');
let clearBtn = document.querySelector('.clear-btn');
let noteList = document.querySelector('.list-container .list-group');

// Active note tracker
let activeNote = {};

// Fetch all notes from the server and render them
function getAndRenderNotes() {
    getNotes().then(renderNoteList);
}

// Fetch notes from the backend
function getNotes() {
    return fetch('/api/notes', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

// Save a new note to the backend
function saveNote(note) {
    return fetch('/api/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
    });
}

// Delete a note from the backend
function deleteNote(id) {
    return fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

// Render the currently active note
function renderActiveNote() {
    if (activeNote.id) {
        noteTitle.setAttribute('readonly', true);
        noteText.setAttribute('readonly', true);
        noteTitle.value = activeNote.title;
        noteText.value = activeNote.text;
        saveNoteBtn.style.display = 'none';
        clearBtn.style.display = 'none';
        newNoteBtn.style.display = 'inline';
    } else {
        noteTitle.removeAttribute('readonly');
        noteText.removeAttribute('readonly');
        noteTitle.value = '';
        noteText.value = '';
        newNoteBtn.style.display = 'none';
        handleInputChange();
    }
}

// Handle save button clicks
function handleNoteSave() {
    const newNote = {
        title: noteTitle.value,
        text: noteText.value,
    };
    saveNote(newNote).then(() => {
        getAndRenderNotes();
        renderActiveNote();
    });
}

// Handle delete button clicks
function handleNoteDelete(e) {
    e.stopPropagation();
    const noteId = e.target.closest('.list-group-item').getAttribute('data-note-id');
    if (noteId) {
        deleteNote(noteId).then(() => {
            getAndRenderNotes();
            if (activeNote.id === noteId) {
                activeNote = {};
                renderActiveNote();
            }
        }).catch(err => console.error("Error deleting note:", err));
    }
}

// Handle note selection for viewing
function handleNoteView(e) {
    e.preventDefault();
    const selectedNote = JSON.parse(e.target.closest('.list-group-item').dataset.note);
    activeNote = selectedNote;
    renderActiveNote();
}

// Handle new note button clicks
function handleNewNoteView() {
    activeNote = {};
    renderActiveNote();
}

// Dynamically show or hide the save and clear buttons based on user input
function handleInputChange() {
    if (noteTitle.value.trim() || noteText.value.trim()) {
        saveNoteBtn.style.display = 'inline';
        clearBtn.style.display = 'inline';
    } else {
        saveNoteBtn.style.display = 'none';
        clearBtn.style.display = 'none';
    }
}

// Render the list of note titles, excluding specific entries
async function renderNoteList(notes) {
    let jsonNotes = await notes.json();
    noteList.innerHTML = ''; // Clear the list

    jsonNotes.forEach(note => {
        if (note.title === "Notes") {
            // Skip rendering this entry
            return;
        }

        const noteElement = document.createElement('li');
        noteElement.classList.add('list-group-item');
        noteElement.setAttribute('data-note-id', note.id);
        noteElement.dataset.note = JSON.stringify(note);

        const spanEl = document.createElement('span');
        spanEl.classList.add('list-item-title');
        spanEl.innerText = note.title;
        spanEl.addEventListener('click', handleNoteView);
        noteElement.appendChild(spanEl);

        const delBtnEl = document.createElement('i');
        delBtnEl.classList.add('fas', 'fa-trash-alt', 'float-right', 'text-danger', 'delete-note');
        delBtnEl.addEventListener('click', handleNoteDelete);
        noteElement.appendChild(delBtnEl);

        noteList.appendChild(noteElement);
    });
}

// Attach event listeners
saveNoteBtn.addEventListener('click', handleNoteSave);
newNoteBtn.addEventListener('click', handleNewNoteView);
clearBtn.addEventListener('click', handleNewNoteView); // Using clear button to start a new note
noteTitle.addEventListener('input', handleInputChange);
noteText.addEventListener('input', handleInputChange);

// Load and display notes upon initial load
getAndRenderNotes();
