"use client";

import { useEffect, useRef, useState } from "react";
import { PromptbookBrand } from "@/components/promptbook-brand";

type Screen = "context" | "call" | "after-call";
type ScenarioId = "weekly" | "customer" | "technical";
type Action = { id: number; text: string; owner: string; done: boolean };
type GeneratedSummary = { outcome: string; actions: Action[] };
type SavedCall = GeneratedSummary & {
  id: string;
  scenarioId: ScenarioId;
  title: string;
  participants: string;
  duration: string;
  context: string;
  createdAt: string;
};
type Scenario = {
  id: ScenarioId;
  title: string;
  description: string;
  duration: string;
  tone: string;
  toneClass: string;
  context: string;
  participants: string;
  transcript: { speaker: string; text: string }[];
  outcome: string;
  actions: Action[];
};

type SpeechRecognitionEventLike = Event & { resultIndex?: number; results: SpeechRecognitionResultList };
type SpeechRecognitionErrorEventLike = Event & { error: string };
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const scenarios: Scenario[] = [
  {
    id: "weekly", title: "Weekly project sync", description: "A calm, ordinary team meeting about progress, priorities, and next steps.", duration: "24 min", tone: "Routine", toneClass: "badge-neutral", participants: "You · Alex · Priya",
    context: "The team is preparing the customer portal launch. Align on progress and leave with clear owners for the remaining work.",
    transcript: [
      { speaker: "You", text: "Thanks for making time today. Let’s start with the customer portal launch checklist." }, { speaker: "Alex", text: "The build is on track. I finished the account settings flow and the remaining QA issues are now low priority." }, { speaker: "Priya", text: "I ran through the onboarding journey this morning. The copy is ready, but I still need the final screenshots." }, { speaker: "You", text: "Before we get into details, is anything blocked or waiting on another team?" }, { speaker: "Alex", text: "I’m waiting on one answer from security about the session timeout. It shouldn’t block the build, but I’d rather not guess." }, { speaker: "You", text: "Good catch. I’ll follow up with security after this. What’s the status of the test accounts?" }, { speaker: "Priya", text: "I have three ready. The fourth is missing sample data, so the empty-state screen is what I’ve been using." }, { speaker: "Alex", text: "That empty state is the one place I noticed a visual jump on mobile. I can smooth that out while I’m in the settings flow." }, { speaker: "You", text: "Great. Are there any risks that could affect the proposed Thursday launch?" }, { speaker: "Alex", text: "Nothing major. I’d like one more regression pass on Wednesday, especially around password resets." }, { speaker: "Priya", text: "I also need the final screenshots before I can finish the customer email. If I get them by four, I can send a draft today." }, { speaker: "You", text: "What do you need from me for the screenshots?" }, { speaker: "Priya", text: "Just the seeded account with the new billing plan. Alex, could you create that one after the call?" }, { speaker: "Alex", text: "Yes, I’ll add it to the staging workspace and drop the login details in the shared note." }, { speaker: "You", text: "Let’s assign owners clearly: Alex owns the regression pass and test account, Priya owns the customer materials, and I’ll share the launch checklist." }, { speaker: "Priya", text: "That works. I’ll include the Thursday date, but I’ll phrase it as ‘planned’ until QA signs off." }, { speaker: "You", text: "Perfect. If the regression pass is clean, we’ll keep Thursday as the launch date. If not, we’ll make the call Wednesday afternoon." }, { speaker: "Alex", text: "I’ll post the test results in the project channel before tomorrow’s sync, including anything we decide not to fix for launch." }, { speaker: "You", text: "That’s everything from me. Thanks both—let’s regroup after the security answer comes in." },
    ], outcome: "The team aligned on a Thursday launch. Product work is complete, with a final regression pass and customer materials remaining.",
    actions: [{ id: 1, text: "Send final screenshots and email copy", owner: "Priya", done: false }, { id: 2, text: "Run the final password-reset regression pass", owner: "Alex", done: false }, { id: 3, text: "Share the launch checklist with the team", owner: "You", done: false }],
  },
  {
    id: "customer", title: "Upset customer follow-up", description: "A tense support call where you listen, take responsibility, and agree on a recovery plan.", duration: "18 min", tone: "Needs care", toneClass: "badge-warm", participants: "You · Morgan (customer) · Sam (billing)",
    context: "A long-time customer was charged twice after upgrading. They are frustrated because their first support ticket was closed without a clear explanation.",
    transcript: [
      { speaker: "You", text: "Hi Morgan, I’m sorry this has taken so long. I’ve reviewed the ticket and I’d like to get this resolved with you today." }, { speaker: "Morgan", text: "I’ve already explained this twice. We were charged twice, and then the ticket was marked solved. It’s incredibly frustrating." }, { speaker: "You", text: "You’re right to be frustrated. I can see the duplicate charge, and closing the ticket without explaining it was our mistake." }, { speaker: "Morgan", text: "The two charges are 499 dollars each. One is dated Monday and one Tuesday. Are you actually looking at those, or am I going to have to send everything again?" }, { speaker: "You", text: "I’m looking at both now. The Monday payment is the original upgrade, and Tuesday’s invoice was created when the plan change retried. You don’t need to resend anything." }, { speaker: "Morgan", text: "Okay, but I need to know when the money is coming back. We can’t keep spending time chasing this." }, { speaker: "Sam", text: "I’ve confirmed the second invoice is a duplicate. I can issue the refund now; it should appear within five to seven business days." }, { speaker: "Morgan", text: "That’s longer than I expected. Why can’t it be immediate?" }, { speaker: "Sam", text: "The refund leaves our system today, but the bank controls when it posts. I can give you the refund reference so your bank can trace it if it doesn’t arrive." }, { speaker: "You", text: "I’ll also keep this case open instead of sending you back to the queue. I’ll check the status on Friday and email you either way." }, { speaker: "Morgan", text: "And what about the time we’ve lost? The first response basically told me to wait, then someone closed the case." }, { speaker: "You", text: "That response wasn’t acceptable. I’m applying a service credit for next month, and I’ll ask our support lead to review how the ticket was handled." }, { speaker: "Morgan", text: "I appreciate that, but please don’t make me ask again for the details." }, { speaker: "You", text: "Understood. I’ll send the refund reference, the credit details, and my direct contact within the hour. You’ll have one written update with everything in it." }, { speaker: "Morgan", text: "All right. If the refund is submitted today and I have a contact, that’s a reasonable plan." }, { speaker: "You", text: "It is submitted now. I’m staying on the case until it clears, and I’ll call out any delay rather than waiting for you to find it." }, { speaker: "Morgan", text: "Okay. That gives me a clear next step. Thank you for actually looking into it." },
    ], outcome: "The duplicate invoice was confirmed and refunded. The customer received a service credit and a named owner for follow-up.",
    actions: [{ id: 1, text: "Send refund reference and credit details", owner: "You", done: false }, { id: 2, text: "Keep the case open until the refund clears", owner: "You", done: false }, { id: 3, text: "Review why the original ticket was closed", owner: "Sam", done: false }],
  },
  {
    id: "technical", title: "Technical incident review", description: "A focused troubleshooting call about slow API responses and a safe path to recovery.", duration: "31 min", tone: "Investigating", toneClass: "badge-blue", participants: "You · Elena (engineering) · Ravi (infrastructure)",
    context: "The dashboard has been timing out for some customers since the morning deployment. Identify the likely cause, mitigate the impact, and agree on follow-up work.",
    transcript: [
      { speaker: "You", text: "Let’s establish the impact first. When did the dashboard timeouts start, and who is affected?" }, { speaker: "Elena", text: "We saw the first spike at 09:42, about ten minutes after the deployment. It mostly affects workspaces with large datasets." }, { speaker: "Ravi", text: "The API is healthy at the edge, but database CPU is elevated and the slow-query count jumped after the release." }, { speaker: "You", text: "Are customers seeing errors, or are requests just taking a long time?" }, { speaker: "Elena", text: "Both. Smaller workspaces eventually load, but the larger ones hit the 30-second gateway timeout. We have 17 support reports so far." }, { speaker: "Ravi", text: "I’ve checked the queue and there’s no sign of a network issue. Connections are waiting on the database." }, { speaker: "You", text: "Do we have a clear change to correlate with that jump?" }, { speaker: "Elena", text: "Yes. The new dashboard filter is loading all historical rows before applying the date range. That is much heavier than our test data suggested." }, { speaker: "You", text: "Was that path covered with a large workspace in staging?" }, { speaker: "Elena", text: "Not really. Our biggest fixture has about five thousand rows; the affected customer has nearly two million." }, { speaker: "Ravi", text: "I recommend rolling back the filter change now. I can add a temporary connection limit so the database stays responsive." }, { speaker: "You", text: "Agreed. Roll back first, then we’ll verify error rates and customer impact before changing anything else. Elena, can you own the deploy?" }, { speaker: "Elena", text: "Yes. I’m starting the rollback now. I’ll post when it’s on the previous version and leave the feature flag off." }, { speaker: "Ravi", text: "I’ll watch database CPU, query latency, and connection wait time. I won’t remove the limit until we have a clean window." }, { speaker: "Elena", text: "The rollback is complete. Timeouts are back to baseline, and I’m checking the largest workspaces now." }, { speaker: "You", text: "Good. Should we send a status update to the affected customers now, or wait for another metric sample?" }, { speaker: "Ravi", text: "I’d send the update now. Recovery is visible, but we should be honest that we’re still monitoring." }, { speaker: "Elena", text: "Database CPU has dropped to 38%. The large workspaces are loading again, and I’m pulling the request IDs from support." }, { speaker: "You", text: "Let’s document the incident, add a large-dataset fixture to CI, and redesign the query to filter before loading rows." }, { speaker: "Elena", text: "I’ll own the query fix and a performance test. I’ll bring a benchmark to tomorrow’s review before we redeploy." }, { speaker: "Ravi", text: "I’ll keep the temporary connection limit through the afternoon and remove it once the metrics stay flat for fifteen minutes." }, { speaker: "You", text: "Thanks. I’ll write the customer update and incident timeline. We’ll regroup tomorrow with the benchmark and a release decision." },
    ], outcome: "The team rolled back the expensive filter and restored normal response times. A query redesign and better large-dataset test coverage are next.",
    actions: [{ id: 1, text: "Write the incident timeline and customer update", owner: "You", done: false }, { id: 2, text: "Redesign the dashboard query and add a performance test", owner: "Elena", done: false }, { id: 3, text: "Monitor metrics and remove the temporary connection limit", owner: "Ravi", done: false }],
  },
];

const SAVED_CALLS_STORAGE_KEY = "promptbook-saved-calls";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("context");
  const [selectedId, setSelectedId] = useState<ScenarioId>("weekly");
  const [context, setContext] = useState(scenarios[0].context);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recognitionError, setRecognitionError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<GeneratedSummary | null>(null);
  const [savedCallId, setSavedCallId] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [savedCalls, setSavedCalls] = useState<SavedCall[]>(() => {
    if (typeof window === "undefined") return [];
    const storedCalls = window.localStorage.getItem(SAVED_CALLS_STORAGE_KEY);
    if (!storedCalls) return [];
    try {
      return JSON.parse(storedCalls) as SavedCall[];
    } catch {
      window.localStorage.removeItem(SAVED_CALLS_STORAGE_KEY);
      return [];
    }
  });
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [actions, setActions] = useState<Action[]>(scenarios[0].actions);
  const scenario = scenarios.find((item) => item.id === selectedId) ?? scenarios[0];

  function saveCall(summary: GeneratedSummary) {
    const savedCall: SavedCall = {
      ...summary,
      id: `${Date.now()}`,
      scenarioId: scenario.id,
      title: scenario.title,
      participants: scenario.participants,
      duration: scenario.duration,
      context,
      createdAt: new Date().toISOString(),
    };
    setSavedCallId(savedCall.id);
    setSavedCalls((current) => {
      const nextCalls = [savedCall, ...current];
      window.localStorage.setItem(SAVED_CALLS_STORAGE_KEY, JSON.stringify(nextCalls));
      return nextCalls;
    });
  }

  function openSavedCall(savedCall: SavedCall) {
    setSelectedId(savedCall.scenarioId);
    setContext(savedCall.context);
    setGeneratedSummary(savedCall);
    setSavedCallId(savedCall.id);
    setActions(savedCall.actions);
    setSummaryError("");
    setScreen("after-call");
  }

  function chooseScenario(id: ScenarioId) { const next = scenarios.find((item) => item.id === id) ?? scenarios[0]; setSelectedId(id); setContext(next.context); setActions(next.actions); }
  useEffect(() => {
    if (screen !== "call") return;
    const SpeechRecognition = (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language;
    recognition.onresult = (event) => {
      let interim = "";
      const finalLines: string[] = [];
      for (let index = event.resultIndex ?? 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) finalLines.push(result[0].transcript.trim());
        else interim += result[0].transcript;
      }
      if (finalLines.length) setTranscript((current) => [...current, ...finalLines.filter(Boolean)]);
      setInterimTranscript(interim.trim());
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setRecognitionError(event.error === "not-allowed" ? "Microphone access was blocked. Allow microphone access and try again." : `Transcription stopped: ${event.error}.`);
    };
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    return () => { recognition.onresult = null; recognition.stop(); recognitionRef.current = null; };
  }, [screen]);

  function startCall() { setTranscript([]); setInterimTranscript(""); setRecognitionError(""); setGeneratedSummary(null); setSummaryError(""); setActions(scenario.actions); setScreen("call"); }
  async function endCall() {
    recognitionRef.current?.stop();
    window.scrollTo({ top: 0, behavior: "instant" });
    setIsSummarizing(true); setSummaryError(""); setScreen("after-call");
    try {
      const response = await fetch("/api/summarize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context, transcript }) });
      const result = (await response.json()) as GeneratedSummary & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to generate a summary.");
      setGeneratedSummary(result);
      setActions((current) => current.length > 0 ? current : result.actions);
      saveCall(result);
    } catch (error) { setSummaryError(error instanceof Error ? error.message : "Unable to generate a summary."); }
    finally { setIsSummarizing(false); }
  }
  function reset() { recognitionRef.current?.stop(); setSelectedId("weekly"); setContext(scenarios[0].context); setActions(scenarios[0].actions); setGeneratedSummary(null); setSavedCallId(null); setSummaryError(""); setTranscript([]); setInterimTranscript(""); setScreen("context"); }
  function toggleAction(id: number) {
    const nextActions = actions.map((action) => action.id === id ? { ...action, done: !action.done } : action);
    setActions(nextActions);
    setSavedCalls((calls) => {
      const nextCalls = calls.map((call) => call.id === savedCallId ? { ...call, actions: nextActions } : call);
      window.localStorage.setItem(SAVED_CALLS_STORAGE_KEY, JSON.stringify(nextCalls));
      return nextCalls;
    });
  }
  function goToStep(nextScreen: Screen) {
    if (nextScreen === "call") setActions(scenario.actions);
    if (nextScreen === "after-call") recognitionRef.current?.stop();
    setScreen(nextScreen);
  }

  return <div className="site-shell">
    <header className="site-header"><div className="container header-inner"><PromptbookBrand /><span className="header-status">{scenario.title}</span></div></header>
    <div className="app-layout container">
      <aside className="call-tray" aria-label="Saved calls">
        <div className="tray-heading"><div><span className="card-kicker">History</span><h3>Your calls</h3></div><span className="tray-count">{savedCalls.length}</span></div>
        <div className="saved-call-list">
          {savedCalls.length === 0 ? <p className="tray-empty">Completed calls will appear here.</p> : savedCalls.map((savedCall) => <button className="saved-call" key={savedCall.id} type="button" onClick={() => openSavedCall(savedCall)}><strong>{savedCall.title}</strong><span>{new Date(savedCall.createdAt).toLocaleDateString()}</span><small>{savedCall.actions.length} action items</small></button>)}
          <button className="new-call" type="button" onClick={reset}><span aria-hidden="true">+</span> New call</button>
        </div>
      </aside>
      <main className="app-content">
      <div className="app-heading"><div><span className="eyebrow">Mock workspace</span><h1>{screen === "context" ? "Prepare your call" : screen === "call" ? "Your call" : "Call complete"}</h1></div><div className="stepper" aria-label="Call progress"><button className={`step ${screen === "context" ? "active" : "complete"}`} type="button" aria-label="Go to prepare your call" aria-current={screen === "context" ? "step" : undefined} onClick={() => goToStep("context")}>1</button><span className="step-line" /><button className={`step ${screen === "call" ? "active" : screen === "after-call" ? "complete" : ""}`} type="button" aria-label="Go to your call" aria-current={screen === "call" ? "step" : undefined} onClick={() => goToStep("call")}>2</button><span className="step-line" /><button className={`step ${screen === "after-call" ? "active" : ""}`} type="button" aria-label="Go to call complete" aria-current={screen === "after-call" ? "step" : undefined} onClick={() => goToStep("after-call")}>3</button></div></div>
      {screen === "context" ? <section className="workspace-card context-card"><div className="card-copy"><span className="card-kicker">Before the call</span><h2>Choose a scenario</h2><p>Pick a prepared call to rehearse. Each mock includes a complete conversation, a realistic outcome, and follow-up actions.</p></div><div className="scenario-list" aria-label="Prepared call scenarios">{scenarios.map((item) => <button className={`scenario-option${item.id === selectedId ? " selected" : ""}`} key={item.id} type="button" onClick={() => chooseScenario(item.id)}><span className={`scenario-icon ${item.id}`} aria-hidden="true">{item.id === "weekly" ? "↗" : item.id === "customer" ? "!" : "⌁"}</span><span className="scenario-copy"><strong>{item.title}</strong><small>{item.description}</small><em>{item.duration} · {item.participants}</em></span><span className={`badge ${item.toneClass}`}>{item.tone}</span></button>)}</div><label className="textarea-label" htmlFor="context">Call context</label><textarea id="context" value={context} onChange={(event) => setContext(event.target.value)} rows={4} /><div className="card-footer"><span className="helper-text">You can edit the context before starting.</span><button className="button button-primary" type="button" onClick={startCall}>Start mock call <span aria-hidden="true">→</span></button></div></section> : null}
      {screen === "call" ? <section className="workspace-card call-card"><div className="call-topline"><div><span className="card-kicker">Live transcription</span><h2>{scenario.title}</h2><p className="call-participants">{scenario.participants}</p></div><span className="recording-pill"><span className="recording-dot" /> {isListening ? "Listening" : "Not listening"}</span></div><div className="microphone-stage"><div className="microphone-ring microphone-ring-one" /><div className="microphone-ring microphone-ring-two" /><div className="microphone-icon" aria-label="Microphone recording" role="img">♩</div><span>{isListening ? "Listening to your microphone" : "Microphone inactive"}</span></div>{recognitionError ? <p role="alert" className="helper-text">{recognitionError}</p> : null}<div className="transcript" aria-label="Call transcription">{transcript.map((text, index) => <div className="transcript-line" key={`${text}-${index}`}><strong>You</strong><p>{text}</p></div>)}{interimTranscript ? <div className="transcript-line pending-line"><strong>You</strong><p>{interimTranscript}</p></div> : null}{transcript.length === 0 && !interimTranscript ? <p className="helper-text">Speak into your microphone to begin transcription.</p> : null}</div><div className="call-progress"><span>{transcript.length} moments captured</span><span>{isListening ? "Live" : "Paused"}</span></div><div className="call-actions"><button className="button button-secondary" type="button" onClick={() => setScreen("context")}>Back</button><div className="call-action-group"><button className="button button-primary button-danger" type="button" onClick={endCall}><span className="stop-icon" /> End call</button></div></div></section> : null}
      {screen === "after-call" ? <div className="results-grid"><section className="workspace-card summary-card"><span className="card-kicker">After the call</span><h2>Here’s what happened</h2>{isSummarizing ? <p className="summary-lead">AI is reviewing the transcript…</p> : summaryError ? <p className="summary-lead" role="alert">{summaryError}</p> : <p className="summary-lead">{generatedSummary?.outcome}</p>}<div className="summary-meta"><span>⏱ {scenario.duration}</span><span>✦ {actions.length} key actions</span><span>◷ Just now</span></div><div className="context-note"><strong>Scenario context</strong><p>{context || "No additional context was added before this call."}</p></div></section><section className="workspace-card actions-card"><div className="actions-heading"><div><span className="card-kicker">Next steps</span><h2>Action items</h2></div><span className="action-count">{actions.filter((action) => action.done).length}/{actions.length}</span></div><div className="action-list">{actions.map((action) => <button className={`action-item${action.done ? " action-done" : ""}`} key={action.id} type="button" onClick={() => toggleAction(action.id)}><span className="custom-checkbox" aria-hidden="true" /> <span className="action-text"><strong>{action.text}</strong><small>Owner · {action.owner}</small></span></button>)}</div></section><button className="button button-secondary start-over" type="button" onClick={reset}>Start another call</button></div> : null}
      </main>
    </div><footer className="site-footer"><div className="container footer-inner"><PromptbookBrand /><span>Promptbook · 2026</span></div></footer>
  </div>;
}
