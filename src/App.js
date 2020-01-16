import React, { useState } from "react";
import { withAuthenticator } from "aws-amplify-react";

function App() {
  const [notes, setNotes] = useState([{ id: 1, note: "Hello World" }]);

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

  return (
    <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
      <h1 className="code f2-l">Amplify Notetaker</h1>
      <form className="mb3">
        <input type="text" className="pa2 f4" placeholder="Write your note" />
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
