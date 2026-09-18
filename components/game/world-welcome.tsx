"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Box, Compass, Plus, Sprout, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createWorld, deleteWorld, listWorlds, type SavedWorld } from "@/lib/game/saves";
import { SAVE_VERSION, WORLD_CONFIG } from "@/lib/game/config";
import { WorldPreview } from "./world-preview";

const titleWorld = { version: SAVE_VERSION, seed: WORLD_CONFIG.seed, edits: [] };

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
      <div className="menu-cloud menu-cloud-one" aria-hidden="true" />
      <div className="menu-cloud menu-cloud-two" aria-hidden="true" />
      <div className="welcome-content">
        <header className="welcome-hero">
          <div className="welcome-title">
            <p className="world-eyebrow"><Sprout size={16} aria-hidden="true" /> A little wilderness. Endless possibility.</p>
            <h1>Voxel<span>Garden<span className="title-dot">.</span></span></h1>
            <p className="welcome-tagline">Somewhere to wander.<br />Something to make your own.</p>
            <a className="hero-new-world" href="#create-world"><Plus size={17} aria-hidden="true" /> Start a new adventure <ArrowRight size={16} aria-hidden="true" /></a>
          </div>
          <div className="welcome-diorama" aria-hidden="true">
            <div className="diorama-halo" />
            <WorldPreview state={titleWorld} name="Voxel Garden" />
            <span className="diorama-caption"><span /> A whole world starts with one block.</span>
          </div>
        </header>

        <section className="world-library" aria-labelledby="your-worlds-title">
          <div className="world-library-heading">
            <div><p className="world-eyebrow">Your next adventure</p><h2 id="your-worlds-title">Choose your world<span className="world-count">{worlds.length.toString().padStart(2, "0")}</span></h2></div>
            <p>Pick up where you left off.</p>
          </div>
          {!loaded && <p role="status">Discovering your worlds…</p>}
          {error && <p className="menu-error" role="alert">{error}</p>}
          <ul className="world-list">
            {worlds.map((world, index) => (
              <li className="world-card" key={world.id}>
                <Link className="world-card-preview" href={`/worlds/${world.id}`} aria-label={`Enter ${world.name}`}>
                  <span className="world-number">WORLD {String(index + 1).padStart(2, "0")}</span>
                  <WorldPreview state={world.state} name={world.name} />
                  <span className="preview-explore"><Compass size={15} aria-hidden="true" /> Explore world</span>
                </Link>
                <div className="world-card-info">
                  <h3>{world.name}</h3>
                  <p className="world-last-played">Last played {new Date(world.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                  {deleting === world.id ? (
                    <div className="world-delete-confirm">
                      <p>Delete this world and all its progress?</p>
                      <div className="world-actions">
                        <Button className="game-button game-button-danger" onClick={() => {
                          try { deleteWorld(localStorage, world.id); setWorlds(listWorlds(localStorage)); setDeleting(null); }
                          catch { setError("This world could not be deleted. Please try again."); }
                        }}>Delete permanently</Button>
                        <Button className="game-button game-button-quiet" onClick={() => setDeleting(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="world-actions">
                      <Link className="game-button world-enter" href={`/worlds/${world.id}`}>Enter world <ArrowRight size={17} aria-hidden="true" /></Link>
                      <Button className="game-button game-button-quiet world-delete" aria-label={`Delete ${world.name}`} title={`Delete ${world.name}`} onClick={() => setDeleting(world.id)}><Trash2 size={17} aria-hidden="true" /></Button>
                    </div>
                  )}
                </div>
              </li>
            ))}
            <li className="world-create-card" id="create-world">
              <div className="new-world-emblem" aria-hidden="true"><Box size={46} strokeWidth={1.25} /><span><Plus size={15} /></span></div>
              <h3>A new beginning</h3>
              <p>{loaded && worlds.length === 0 ? "Your first adventure is one block away." : "Fresh land. A blank canvas. All yours."}</p>
              <form onSubmit={(event) => {
                event.preventDefault();
                try { const world = createWorld(localStorage, name); router.push(`/worlds/${world.id}`); }
                catch { setError("Could not create your world. Enter a name and make sure browser storage has space."); }
              }}>
                <label className="sr-only" htmlFor="world-name">World name</label>
                <input id="world-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name your world…" maxLength={80} required />
                <Button className="game-button" type="submit" disabled={!loaded || !name.trim()}><Plus size={17} aria-hidden="true" /> Create & explore</Button>
              </form>
            </li>
          </ul>
        </section>
        <footer className="welcome-footer"><span><span className="save-dot" /> Your adventures stay in this browser.</span><span>Wander. Build. Breathe.</span></footer>
      </div>
    </main>
  );
}
