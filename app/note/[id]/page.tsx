"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

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
    <div className="container lg:max-w-3xl mx-auto py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="w-fit bg-primary text-primary-foreground p-2 rounded-md flex items-center gap-2 hover:bg-primary/80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <g fill="none">
              <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
              <path
                fill="currentColor"
                d="M3.283 10.94a1.5 1.5 0 0 0 0 2.12l5.656 5.658a1.5 1.5 0 1 0 2.122-2.122L7.965 13.5H19.5a1.5 1.5 0 0 0 0-3H7.965l3.096-3.096a1.5 1.5 0 1 0-2.122-2.121z"
              />
            </g>
          </svg>
          back
        </Link>

        <h1 className="text-2xl font-bold">Fian's Daily</h1>
      </div>

      <div className="flex flex-col gap-2">
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
    </div>
  );
};

export default NoteDetail;
