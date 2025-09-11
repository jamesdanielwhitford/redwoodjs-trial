interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface NoteListProps {
  notes: Note[];
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div style={{
        display: "grid",
        gap: "20px",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))"
      }}>
        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
        }}>
          <h3>No notes yet</h3>
          <p>Create your first note above!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "grid",
      gap: "20px",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))"
    }}>
      {notes.map((note) => (
        <div 
          key={note.id}
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
          }}
        >
          <h3 style={{
            marginBottom: "10px",
            color: "#2c3e50"
          }}>
            {note.title}
          </h3>
          <p style={{
            color: "#666",
            marginBottom: "10px",
            lineHeight: "1.5"
          }}>
            {note.content}
          </p>
          <div style={{
            fontSize: "12px",
            color: "#999"
          }}>
            Created: {new Date(note.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}