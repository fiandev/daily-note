"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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

const NoteDetail = () => {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch note");
      }
      const data: Note[] = await response.json();
      const foundNote = data.find((n) => n.id === decodeURIComponent(id || ""));
      if (foundNote) {
        setNote(foundNote);
      } else {
        setError("Note not found");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Note not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{note.topic}</h1>
        {note.date && (
          <p className="text-muted-foreground">
            {new Date(note.date.start).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="prose prose-invert max-w-none">{note.content}</div>
    </div>
  );
};

export default NoteDetail;
