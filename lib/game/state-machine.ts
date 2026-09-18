/** Small reusable state graph for AI, tools, and future simulation rules. */
export interface StateDefinition<Context, State extends string> {
  enter?: (context: Context) => void;
  update?: (context: Context, delta: number) => void;
  exit?: (context: Context) => void;
  transitions?: readonly { to: State; when: (context: Context, elapsed: number) => boolean }[];
}

export class StateMachine<Context, State extends string> {
  elapsed = 0;
  constructor(
    public state: State,
    readonly context: Context,
    readonly states: Record<State, StateDefinition<Context, State>>,
  ) { states[state].enter?.(context); }

  update(delta: number) {
    this.elapsed += delta;
    const definition = this.states[this.state];
    definition.update?.(this.context, delta);
    const transition = definition.transitions?.find((candidate) => candidate.when(this.context, this.elapsed));
    if (transition) {
      definition.exit?.(this.context);
      this.state = transition.to;
      this.elapsed = 0;
      this.states[this.state].enter?.(this.context);
    }
  }
}
