export interface ActionItem {
  id: string;
  text: string;
  owner: string;
  due: string;
  completed: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number;
  category: string;
  summary: string;
  notes: string[];
  decisions: string[];
  transcript: string;
  participants: string[];
  tasks: ActionItem[];
  starred: boolean;
  sample?: boolean;
  hasAudio?: boolean;
}

export interface MeetingNotes {
  title: string;
  category: string;
  summary: string;
  notes: string[];
  decisions: string[];
  participants: string[];
  tasks: { text: string; owner: string; due: string }[];
}

export function isMeetingNotes(value: unknown): value is MeetingNotes {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    ["title", "category", "summary"].every(
      (key) => typeof item[key] === "string",
    ) &&
    ["notes", "decisions", "participants"].every(
      (key) =>
        Array.isArray(item[key]) &&
        item[key].every((entry: unknown) => typeof entry === "string"),
    ) &&
    Array.isArray(item.tasks) &&
    item.tasks.every((task: unknown) => {
      if (!task || typeof task !== "object") return false;
      const entry = task as Record<string, unknown>;
      return ["text", "owner", "due"].every(
        (key) => typeof entry[key] === "string",
      );
    })
  );
}

export function isMeeting(value: unknown): value is Meeting {
  if (!isMeetingNotes(value)) return false;
  const item = value as unknown as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.date === "string" &&
    Number.isFinite(Date.parse(item.date)) &&
    typeof item.duration === "number" &&
    Number.isFinite(item.duration) &&
    item.duration >= 0 &&
    typeof item.transcript === "string" &&
    typeof item.starred === "boolean" &&
    (item.tasks as Record<string, unknown>[]).every(
      (task) =>
        typeof task.id === "string" && typeof task.completed === "boolean",
    )
  );
}

export function formatDuration(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)
    .toString()
    .padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
}

export function meetingMarkdown(meeting: Meeting) {
  return `# ${meeting.title}\n\n${new Date(meeting.date).toLocaleDateString()} · ${Math.ceil(meeting.duration / 60)} min\n\n## Summary\n\n${meeting.summary}\n\n## Key takeaways\n\n${meeting.notes.map((note) => `- ${note}`).join("\n")}\n\n## Decisions\n\n${meeting.decisions.map((decision) => `- ${decision}`).join("\n")}\n\n## Action items\n\n${meeting.tasks.map((task) => `- [${task.completed ? "x" : " "}] ${task.text}${task.owner ? ` — ${task.owner}` : ""}${task.due ? ` (${task.due})` : ""}`).join("\n")}\n\n## Transcript\n\n${meeting.transcript}`;
}

export const sampleMeetings: Meeting[] = [
  {
    id: "sample-1",
    title: "Product design sync",
    date: "2026-09-25T10:00:00",
    duration: 1920,
    category: "Design",
    starred: true,
    sample: true,
    summary:
      "A fresh look at onboarding, a simpler first run, and a few thoughtful details for the next release.",
    notes: [
      "The new onboarding should help people reach their first project in under two minutes.",
      "The team reviewed three welcome screen directions and preferred the quieter, more focused option.",
      "Usability sessions will focus on the setup flow and empty states.",
    ],
    decisions: [
      "Move forward with the simplified, three-step onboarding flow.",
      "Keep the welcome screen focused on a single primary action.",
    ],
    participants: ["Alex", "Sarah", "James"],
    transcript:
      "Alex: Let’s focus on the first-run experience today. We want people to create their first project in under two minutes.\n\nSarah: I explored three welcome screen directions. The quieter one gives the primary action room to breathe. I’ll share the updated onboarding wireframes on Monday.\n\nJames: That looks good. Let’s keep the flow to three steps and test it with five people. I’ll schedule the usability sessions next week.\n\nAlex: Agreed. We’ll go with the focused welcome screen and the three-step flow. I’ll update the project brief today.",
    tasks: [
      {
        id: "s1-t1",
        text: "Share updated onboarding wireframes",
        owner: "Sarah",
        due: "Monday",
        completed: false,
      },
      {
        id: "s1-t2",
        text: "Schedule usability testing sessions",
        owner: "James",
        due: "Next week",
        completed: false,
      },
      {
        id: "s1-t3",
        text: "Update the project brief",
        owner: "Alex",
        due: "Friday",
        completed: true,
      },
    ],
  },
  {
    id: "sample-2",
    title: "Weekly team catch-up",
    date: "2026-09-25T09:00:00",
    duration: 2700,
    category: "Team",
    starred: false,
    sample: true,
    summary:
      "Progress worth celebrating, a shared plan for next week, and getting everyone on the same page.",
    notes: [
      "The dashboard release is on schedule and all critical bugs are resolved.",
      "Support feedback highlights a need for a clearer export flow.",
      "The team will protect two mornings next week for focused work.",
    ],
    decisions: [
      "Release the dashboard on Tuesday.",
      "Prioritize the export improvements in the next sprint.",
    ],
    participants: ["Alex", "Mia", "Ben", "Sarah"],
    transcript:
      "Alex: The dashboard release is looking good. All critical bugs are resolved.\n\nMia: Support keeps hearing that exporting is hard to discover. I’ll pull the customer feedback into a short document by Monday.\n\nBen: Let’s ship the dashboard on Tuesday and put export improvements in the next sprint. I’ll prepare the release checklist today.\n\nSarah: Could we protect Tuesday and Thursday mornings for focused work?\n\nAlex: Yes, let’s do that.",
    tasks: [
      {
        id: "s2-t1",
        text: "Prepare the release checklist",
        owner: "Ben",
        due: "Friday",
        completed: false,
      },
      {
        id: "s2-t2",
        text: "Bring together customer feedback",
        owner: "Mia",
        due: "Monday",
        completed: false,
      },
    ],
  },
  {
    id: "sample-3",
    title: "Website refresh kickoff",
    date: "2026-09-24T14:00:00",
    duration: 3480,
    category: "Project",
    starred: false,
    sample: true,
    summary:
      "Setting the direction for a website that feels more like us. New stories, clearer messaging, better flow.",
    notes: [
      "The refresh will focus on the homepage and customer stories.",
      "The team wants more natural photography and a warmer visual identity.",
      "The first design review is planned for the following Thursday.",
    ],
    decisions: [
      "Keep the existing site structure and improve the content first.",
    ],
    participants: ["Alex", "Olivia", "James"],
    transcript:
      "Olivia: I’d like the website to feel warmer and more personal. Let’s start with the homepage and customer stories.\n\nJames: We can keep the existing structure and focus on content first. I’ll put together a moodboard for next Thursday.\n\nAlex: Great. I’ll draft the homepage messaging by Wednesday. Let’s review the first designs on Thursday.",
    tasks: [
      {
        id: "s3-t1",
        text: "Draft the homepage messaging",
        owner: "Alex",
        due: "Wednesday",
        completed: false,
      },
      {
        id: "s3-t2",
        text: "Put together a visual moodboard",
        owner: "James",
        due: "Thursday",
        completed: true,
      },
    ],
  },
  {
    id: "sample-4",
    title: "Customer discovery · Acme",
    date: "2026-09-24T11:00:00",
    duration: 2100,
    category: "Research",
    starred: true,
    sample: true,
    summary:
      "Learning how Acme collaborates, where work gets stuck, and what a better handoff could look like.",
    notes: [
      "Acme uses three separate tools to track handoffs between teams.",
      "Their biggest pain point is losing the context behind decisions.",
      "They would value a shared view of decisions and next steps.",
    ],
    decisions: ["Explore a shared decision log in the next prototype."],
    participants: ["Alex", "Mia"],
    transcript:
      "Mia: Our team uses three tools just to track handoffs. We often lose the reason behind a decision.\n\nAlex: Would a shared decision log help?\n\nMia: Yes, especially with clear next steps and owners.\n\nAlex: I’ll summarize these insights for the product team on Monday, and explore a decision log in the next prototype.",
    tasks: [
      {
        id: "s4-t1",
        text: "Share discovery insights with the team",
        owner: "Alex",
        due: "Monday",
        completed: false,
      },
    ],
  },
];
