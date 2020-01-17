import React, { useState, useRef, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";

import { createTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";

function App() {
  const [notes, setNotes] = useState({
    note: "",
    notes: []
  });

  const noteElRef = useRef(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const result = await API.graphql(graphqlOperation(listTodos));
    setNotes({ ...notes, notes: result.data.listTodos.items });
  };

  const listNotes = () => {
    const list = notes.map(note => {
      return (
        <div key={note.id} className="flex items-center">
          <li className="list pa1 f3">{note.note}</li>
          <button className="bg-transparent bn f4">
            <span>&times;</span>
          </button>
        </div>
      );
    });

    return list;
  };

  const addNoteHandler = async event => {
    event.preventDefault();

    const note = noteElRef.current.value;
    const input = { note };

    const result = await API.graphql(graphqlOperation(createTodo, { input }));
    const newNote = result.data.createTodo;

    const updatedNotes = notes.notes;
    updatedNotes.push(newNote);

    setNotes({ ...notes, note: "", notes: updatedNotes });
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
          Add note
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
