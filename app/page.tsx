"use client";

// daily-notes/src/pages/Index.tsx
import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Note = {
  topic: string;
  date: {
    start: string;
    end: string | null;
    time_zone: string | null;
  } | null;
  content: string;
  status: string;
};

// --- Helper Functions for Sorting and Grouping ---

// Groups notes by month and year
const groupNotesByMonth = (notes: Note[]) => {
  const grouped: Record<string, Note[]> = {};

  notes.forEach((note) => {
    if (note.date) {
      const date = new Date(note.date.start);
      // Create a key like "January 2026"
      const key = `${date.toLocaleString("default", {
        month: "long",
      })} ${date.getFullYear()}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(note);
    } else {
      // Group notes with no date under "Undated"
      if (!grouped["Undated"]) {
        grouped["Undated"] = [];
      }
      grouped["Undated"].push(note);
    }
  });

  return grouped;
};

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("/api/notes");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch notes");
        }
        const data: Note[] = await response.json();
        // Filter out notes without a date and sort them
        const sortedData = data
          .filter((note) => note.date)
          .sort((a, b) => {
            if (a.date && b.date) {
              return (
                new Date(b.date.start).getTime() -
                new Date(a.date.start).getTime()
              );
            }
            return 0; // Should not happen due to filter
          });
        setNotes(sortedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const logVisitor = async () => {
      try {
        const parser = new UAParser();
        const result = parser.getResult();
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        await fetch("/api/log-visitor", {
          method: "POST",
          headers,
          body: JSON.stringify({
            browser: result.browser.name,
            os: result.os.name,
          }),
        });
      } catch (error) {
        console.error("Failed to log visitor", error);
      }
    };

    fetchNotes();
    // logVisitor();
  }, []);

  // --- Pagination Logic ---
  const paginatedNotes = notes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(notes.length / itemsPerPage);
  const groupedNotes = groupNotesByMonth(paginatedNotes);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Fian's Daily</h1>
        <a
          href="/login"
          className="text-primary underline hover:text-primary/90"
        >
          Login
        </a>
      </div>

      {Object.entries(groupedNotes).map(([monthYear, monthNotes]) => (
        <div key={monthYear} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{monthYear}</h2>
          <div className="space-y-4">
            {monthNotes.map((note, index) => (
              <div key={index} className="pl-4 flex flex-col gap-2">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
                    {note.date && `${new Date(note.date.start).getDate()}`}
                  </div>
                  <Link href={`/note/${encodeURIComponent(note.topic)}`}>
                    {note.topic}
                  </Link>
                </h3>
                <p className="text-muted-foreground ml-2">
                  {note.content.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {loading &&
        Array(Math.floor(Math.random() * 3) + 1)
          .fill(1)
          .map((_, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 animate-pulse text-muted-foreground bg-muted-foreground">
                lorem ipsum
              </h2>
              <div className="space-y-4">
                <div className="pl-4 flex flex-col gap-2">
                  <h3 className="text-lg font-medium flex items-center gap-2 animate-pulse">
                    <div className="w-8 h-8 rounded-md bg-muted-foreground text-muted-foreground flex items-center justify-center">
                      x
                    </div>
                  </h3>
                  <p className="text-muted-foreground ml-2 bg-muted-foreground animate-pulse">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Laborum tenetur illum hic aliquam, corrupti minima rem,
                    beatae et quos illo nesciunt eligendi culpa. Rem atque,
                    labore dolore sit error ratione!
                  </p>
                </div>
              </div>
            </div>
          ))}

      {/* --- Pagination Controls --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
