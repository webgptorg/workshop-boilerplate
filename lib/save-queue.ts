const SAVE_DELAY_MILLISECONDS = 400;

export interface SaveStatus {
  isSaving: boolean;
  isDirty: boolean;
  isConflict: boolean;
  error: string;
}

export class SaveConflictError extends Error {}

// Serializes writes and coalesces edits made during an in-flight request.
export class SaveQueue<Value> {
  private current: Value;
  private saved: Value;
  private revision: number;
  private isDisposed = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private activeSave: Promise<boolean> | null = null;
  status: SaveStatus = { isSaving: false, isDirty: false, isConflict: false, error: "" };

  constructor(initial: Value, revision: number,
    private readonly save: (value: Value, revision: number) => Promise<number>,
    private readonly onStatus: () => void,
  ) {
    this.current = initial;
    this.saved = initial;
    this.revision = revision;
  }

  update(value: Value) {
    this.current = value;
    this.setStatus({ ...this.status, isDirty: true });
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => { void this.flush(); }, SAVE_DELAY_MILLISECONDS);
  }

  flush(): Promise<boolean> {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.isDisposed || this.status.isConflict) return Promise.resolve(false);
    if (this.activeSave) return this.activeSave;
    if (this.current === this.saved) return Promise.resolve(true);
    this.activeSave = this.drain().finally(() => { this.activeSave = null; });
    return this.activeSave;
  }

  dispose() {
    this.isDisposed = true;
    if (this.timer) clearTimeout(this.timer);
  }

  private setStatus(status: SaveStatus) {
    this.status = status;
    if (!this.isDisposed) this.onStatus();
  }

  private async drain() {
    this.setStatus({ isSaving: true, isDirty: true, isConflict: false, error: "" });
    try {
      while (!this.isDisposed && this.current !== this.saved) {
        const snapshot = this.current;
        const revision = await this.save(snapshot, this.revision);
        if (this.isDisposed) return false;
        this.revision = revision;
        this.saved = snapshot;
      }
      this.setStatus({ isSaving: false, isDirty: false, isConflict: false, error: "" });
      return !this.isDisposed;
    } catch (error) {
      this.setStatus({
        isSaving: false, isDirty: true, isConflict: error instanceof SaveConflictError,
        error: error instanceof Error ? error.message : "Could not save your changes.",
      });
      return false;
    }
  }
}
