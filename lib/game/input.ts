import { PLAYER_CONFIG } from "./config";
import { clamp } from "./terrain/noise";

export interface InputCallbacks {
  edit(remove: boolean): void;
  select(index: number): void;
  cycle(direction: number): void;
}

/** The canvas owns gameplay input. The dock always retains normal browser interaction. */
export class GameInput {
  readonly keys = new Set<string>();
  yaw = 0;
  pitch = 0.12;
  jumpRequested = false;
  private readonly abort = new AbortController();
  private dragging = false;
  private dragDistance = 0;
  private pointerX = 0;
  private pointerY = 0;

  constructor(readonly canvas: HTMLCanvasElement, readonly callbacks: InputCallbacks) {
    const signal = this.abort.signal;
    window.addEventListener("keydown", this.keyDown, { signal });
    window.addEventListener("keyup", (event) => this.keys.delete(event.code), { signal });
    window.addEventListener("blur", this.clear, { signal });
    document.addEventListener("visibilitychange", this.clear, { signal });
    document.addEventListener("pointerlockchange", () => { this.keys.clear(); this.dragging = false; }, { signal });
    canvas.addEventListener("contextmenu", (event) => event.preventDefault(), { signal });
    canvas.addEventListener("pointerdown", this.pointerDown, { signal });
    window.addEventListener("pointermove", this.pointerMove, { signal });
    window.addEventListener("pointerup", this.pointerUp, { signal });
    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      callbacks.cycle(Math.sign(event.deltaY));
    }, { passive: false, signal });
  }

  private clear = () => { this.keys.clear(); this.dragging = false; this.jumpRequested = false; };

  private keyDown = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLElement && (event.target.closest("[role=toolbar]") || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName))) return;
    const handled = ["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"];
    if (handled.includes(event.code)) { event.preventDefault(); this.keys.add(event.code); }
    if (event.code === "Space" && !event.repeat) this.jumpRequested = true;
    if (/^Digit[1-9]$/.test(event.code)) this.callbacks.select(Number(event.code.slice(-1)) - 1);
  };

  private pointerDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.button !== 2) return;
    this.canvas.focus({ preventScroll: true });
    if (document.pointerLockElement === this.canvas) {
      this.callbacks.edit(event.button === 2);
      return;
    }
    if (event.button === 2) { this.callbacks.edit(true); return; }
    this.dragging = true;
    this.dragDistance = 0;
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
  };

  private pointerMove = (event: PointerEvent) => {
    const locked = document.pointerLockElement === this.canvas;
    if (!locked && !this.dragging) return;
    const dx = locked ? event.movementX : event.clientX - this.pointerX;
    const dy = locked ? event.movementY : event.clientY - this.pointerY;
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
    this.dragDistance += Math.abs(dx) + Math.abs(dy);
    this.yaw += dx * PLAYER_CONFIG.mouseSensitivity;
    this.pitch = clamp(this.pitch + dy * PLAYER_CONFIG.mouseSensitivity, -1.48, 1.48);
  };

  private pointerUp = (event: PointerEvent) => {
    if (!this.dragging || event.button !== 0) return;
    this.dragging = false;
    if (this.dragDistance < 5 && event.target === this.canvas) {
      // Clicks edit and enter mouse-look; dragging also works without pointer lock.
      this.callbacks.edit(false);
      if (event.pointerType !== "touch" && this.canvas.requestPointerLock) {
        try { this.canvas.requestPointerLock()?.catch(() => undefined); }
        catch { /* The drag and keyboard controls remain available in embedded browsers. */ }
      }
    }
  };

  update(delta: number) {
    const speed = PLAYER_CONFIG.keyboardLookSpeed * delta;
    if (this.keys.has("ArrowLeft")) this.yaw -= speed;
    if (this.keys.has("ArrowRight")) this.yaw += speed;
    if (this.keys.has("ArrowUp")) this.pitch -= speed;
    if (this.keys.has("ArrowDown")) this.pitch += speed;
    this.pitch = clamp(this.pitch, -1.48, 1.48);
  }

  dispose() {
    this.abort.abort();
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    this.clear();
  }
}
