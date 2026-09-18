"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, buttonClassName } from "@/components/ui/button";
import { createWorld, deleteWorld, listWorlds, type SavedWorld } from "@/lib/game/saves";

export function WorldWelcome() {
  const router = useRouter();
  const [worlds, setWorlds] = useState<SavedWorld[]>([]);
  const [name, setName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      try { setWorlds(listWorlds(localStorage)); setError(null); }
      catch { setError("Worlds could not be read. Check that browser storage is available and your saves are intact."); }
      setLoaded(true);
    };
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  return (
    <main className="world-welcome">
      <header>
        <p className="world-eyebrow">Voxel Garden</p>
        <h1>A world of your own.</h1>
        <p>Explore, build, and pick up where you left off.</p>
      </header>
      <section className="world-panel" aria-labelledby="create-world-title">
        <h2 id="create-world-title">Create a world</h2>
        <form onSubmit={(event) => {
          event.preventDefault();
          try {
            const world = createWorld(localStorage, name);
            router.push(`/worlds/${world.id}`);
          } catch { setError("Could not create your world. Enter a name and make sure browser storage has space."); }
        }}>
          <label htmlFor="world-name">World name</label>
          <div className="world-create-row">
            <input id="world-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="My world" maxLength={80} required />
            <Button type="submit" disabled={!loaded || !name.trim()}>Create & enter</Button>
          </div>
        </form>
      </section>
      <section className="world-panel" aria-labelledby="your-worlds-title">
        <h2 id="your-worlds-title">Your worlds</h2>
        {!loaded && <p role="status">Loading worlds…</p>}
        {loaded && !error && worlds.length === 0 && <p>No worlds yet. Create your first one above.</p>}
        <ul className="world-list">
          {worlds.map((world) => (
            <li key={world.id}>
              <div className="world-details"><h3>{world.name}</h3><p>Last saved {new Date(world.updatedAt).toLocaleString()}</p></div>
              {deleting === world.id ? (
                <div className="world-actions">
                  <p>Delete this world and all its progress?</p>
                  <Button variant="secondary" onClick={() => {
                    try { deleteWorld(localStorage, world.id); setWorlds(listWorlds(localStorage)); setDeleting(null); }
                    catch { setError("This world could not be deleted. Please try again."); }
                  }}>Delete permanently</Button>
                  <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
                </div>
              ) : (
                <div className="world-actions">
                  <Link className={buttonClassName("primary")} href={`/worlds/${world.id}`}>Enter world</Link>
                  <Button variant="ghost" aria-label={`Delete ${world.name}`} onClick={() => setDeleting(world.id)}>Delete</Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
      {error && <p role="alert">{error}</p>}
      <p className="world-storage-note">Worlds are saved in this browser on this device.</p>
    </main>
  );
}
