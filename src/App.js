import React, { useState, useRef, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";

import { createTodo, deleteTodo, updateTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import {
  onCreateTodo,
  onDeleteTodo,
  onUpdateTodo
} from "./graphql/subscriptions";

function App() {
  const [notes, setNotes] = useState({
    id: "",
    note: "",
    notes: []
  });

  const noteElRef = useRef(null);

  useEffect(() => {
    fetchNotes();
    const createNoteListener = API.graphql(
      graphqlOperation(onCreateTodo)
    ).subscribe({
      next: noteData => {
        const newNote = noteData.value.data.onCreateTodo;
        // const prevNotes = notes.notes.filter(note => note.id !== newNote.id);
        // const updatedNotes = [...prevNotes, newNote];
        // setNotes({ ...notes, notes: updatedNotes });

        // using prevstate
        setNotes(prevNotes => {
          const oldNotes = prevNotes.notes.filter(
            note => note.id !== newNote.id
          );
          const updatedNotes = [...oldNotes, newNote];
          return updatedNotes;
        });
      }
    });

    const deleteNoteListener = API.graphql(
      graphqlOperation(onDeleteTodo)
    ).subscribe({
      next: noteData => {
        const deletedNote = noteData.value.data.onDeleteTodo;
        console.log(deletedNote);
      }
    });

    // clean-up componentWillUnmount
    return () => {
      createNoteListener.unsubscribre();
      deleteNoteListener.unsubscribre();
    };
  }, []);

  const fetchNotes = async () => {
    const result = await API.graphql(graphqlOperation(listTodos));
    setNotes({ ...notes, notes: result.data.listTodos.items });
  };

  const listNotes = () => {
    const list = notes.map(note => {
      return (
        <div key={note.id} className="flex items-center">
          <li
            className="list pa1 f3"
            onClick={() => {
              setNoteHandler(note);
            }}
          >
            {note.note}
          </li>
          <button
            className="bg-transparent bn f4"
            onClick={() => deleteNoteHandler(note.id)}
          >
            <span>&times;</span>
          </button>
        </div>
      );
    });

    return list;
  };

  const addNoteHandler = async event => {
    event.preventDefault();

    if (hasExistingNote()) {
      updateNoteHandler();
    } else {
      const note = noteElRef.current.value;
      const input = { note };

      await API.graphql(graphqlOperation(createTodo, { input }));
      // const result = await API.graphql(graphqlOperation(createTodo, { input }));
      // const newNote = result.data.createTodo;

      // const updatedNotes = notes.notes;
      // updatedNotes.push(newNote);

      // setNotes({ ...notes, note: "", notes: updatedNotes });
      setNotes({ ...notes, note: "" });
    }
  };

  const setNoteHandler = ({ id, note }) => {
    setNotes({ ...notes, id, note });
  };

  const hasExistingNote = () => {
    const { id } = notes;

    if (id) {
      const isNote = notes.notes.findIndex(note => note.id === id) > -1;
      return isNote;
    }
    return false;
  };

  const updateNoteHandler = async () => {
    const { id, note } = notes;
    const input = {
      id,
      note
    };
    const result = await API.graphql(graphqlOperation(updateTodo, { input }));
    const updatedNote = result.data.updateTodo;

    const index = notes.notes.findIndex(note => note.id === updatedNote.id);
    const updatedNotes = [
      ...notes.notes.slice(0, index),
      updatedNote,
      ...notes.notes.slice(index + 1)
    ];

    setNotes({ ...notes, note: "", id: "", notes: updatedNotes });
  };

  const deleteNoteHandler = async noteId => {
    const input = { id: noteId };
    const result = await API.graphql(graphqlOperation(deleteTodo, { input }));
    const deletedNoteId = result.data.deletedTodo.id;

    const updatedNotes = notes.notes.filter(note => note.id !== deletedNoteId);
    setNotes({ ...notes, notes: updatedNotes });
  };

  return (
    <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
      <h1 className="code f2-l">Amplify Notetaker</h1>
      <form className="mb3" onSubmit={event => addNoteHandler(event)}>
        <label htmlFor="note">Note</label>
        <input
          type="text"
          id="note"
          className="pa2 f4"
          placeholder="Write your note"
          ref={noteElRef}
          value={notes.note}
        />
        <button className="pa2 f4" type="submit">
          {notes.id ? "Update Note" : "Add note"}
        </button>
      </form>
      {/* Notes list */}
      <div>{listNotes()}</div>
    </div>
  );
}

export default withAuthenticator(App, {
  includeGreetings: true
});
