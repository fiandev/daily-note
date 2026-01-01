"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Note = {
  id: string;
  topic: string;
  date: {
    start: string;
    end: string | null;
    time_zone: string | null;
  } | null;
  content: string;
  status: string;
};

const NotesManager = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }
      const data = await response.json();
      setNotes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote({ ...note });
  };

  const handleDelete = async (noteId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete the note.");
      }

      setNotes(notes.filter((n) => n.id !== noteId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    if (!editingNote) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    const method = editingNote.id ? "PUT" : "POST";
    const url = editingNote.id ? `/api/notes/${editingNote.id}` : "/api/notes";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingNote),
      });

      if (!response.ok) {
        throw new Error("Failed to save the note.");
      }

      fetchNotes(); // Refresh notes
      setEditingNote(null); // Close the form
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreate = () => {
    setEditingNote({
      id: "",
      topic: "",
      date: {
        start: new Date().toISOString().split("T")[0],
        end: null,
        time_zone: null,
      },
      content: "",
      status: "Draft",
    });
  };

  if (loading) return <p>Loading notes...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Notes</h2>
        <Button onClick={handleCreate}>Create New Note</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle>{note.topic}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{note.content.substring(0, 100)}...</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleEdit(note)}>Edit</Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(note.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {editingNote && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingNote.id ? "Edit Note" : "Create Note"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={editingNote.topic}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, topic: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={editingNote.content}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, content: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => setEditingNote(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NotesManager;
