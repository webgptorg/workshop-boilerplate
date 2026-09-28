import type { ActionItem, Call, UserData, Workspace } from "./types";

export function createWorkspace(
  id = "personal",
  name = "Personal workspace",
): Workspace {
  const calls: Call[] = [
    {
      id: "coffee-workshop",
      title: "Kávová volba a plánování workshopu",
      summary:
        "Odkud bude káva a co ještě připravit na náš příští webový workshop.",
      date: "2026-09-26T09:30:00",
      duration: 60,
      category: "Meeting",
      starred: false,
      participants: ["Alex"],
      language: "cs-CZ",
      notes:
        "## Shrnutí\nDomluvili jsme se na přípravě webového workshopu a výběru kávy pro účastníky.\n\n## Rozhodnutí\n- Objednáme kávu z místní pražírny.\n- Workshop bude obsahovat praktické cvičení.\n\n## Další kroky\n- Zaznamenat rozhodnutí ohledně nákupu kávy.\n- Aktualizovat plánování workshopu na webu.",
      transcript:
        "Alex: Potřebujeme vybrat kávu na workshop. Navrhuji místní pražírnu.\nJana: Souhlasím. Také bychom měli aktualizovat plán workshopu na webu.\nAlex: Dobře, zaznamenám rozhodnutí o kávě a připravím nové informace.",
      recordings: [],
    },
    {
      id: "product-design",
      title: "Product design sync",
      summary:
        "A fresh look at onboarding, a simpler first run, and a few thoughtful details for the next release.",
      date: "2026-09-25T14:00:00",
      duration: 1920,
      category: "Design",
      starred: true,
      participants: ["Alex", "Sarah", "James"],
      language: "en-US",
      notes:
        "## Summary\nReviewed the onboarding flow and agreed to reduce the number of steps from five to three.\n\n## Decisions\n- Start with a single workspace.\n- Keep the first recording one click away.\n- Test the updated flow with five new users.\n\n## Next steps\n- Sarah will share updated onboarding wireframes.\n- James will schedule usability testing sessions.",
      transcript:
        "Alex: Let's look at the onboarding flow. Five steps feels like too many.\nSarah: I can simplify it to three. We should start with a single workspace.\nJames: Agreed. I will schedule usability testing with five people next week.\nSarah: I will share updated onboarding wireframes on Monday.",
      recordings: [],
    },
    {
      id: "weekly-team",
      title: "Weekly team catch-up",
      summary:
        "Progress worth celebrating, a shared plan for next week, and getting everyone on the same page.",
      date: "2026-09-25T10:00:00",
      duration: 2700,
      category: "Team",
      starred: false,
      participants: ["Alex", "Mia", "Ben", "Olivia"],
      language: "en-US",
      notes:
        "## Summary\nThe team reviewed this week's progress and next week's priorities.\n\n## Decisions\n- Prioritize the recording experience.\n- Share weekly progress asynchronously.\n\n## Next steps\n- Publish the weekly progress update.\n- Review the recording studio checklist.",
      transcript:
        "Alex: The new dashboard is ready for review.\nMia: I will publish the weekly progress update.\nBen: We should prioritize recording next week. I will review the recording studio checklist.",
      recordings: [],
    },
    {
      id: "website-kickoff",
      title: "Website refresh kickoff",
      summary:
        "Setting the direction for a website that feels more like us. New stories, clearer messaging, better flow.",
      date: "2026-09-24T11:00:00",
      duration: 3480,
      category: "Project",
      starred: false,
      participants: ["Alex", "Olivia", "James"],
      language: "en-US",
      notes:
        "## Summary\nAligned on the direction for the refreshed website.\n\n## Decisions\n- Use a warmer visual direction.\n- Lead with the product experience.\n\n## Next steps\n- Create a moodboard for the new website.",
      transcript:
        "Olivia: The website should feel warmer and more human.\nJames: Let's lead with the product experience.\nAlex: I will create a moodboard for the new website.",
      recordings: [],
    },
    {
      id: "first-minute",
      title: "Your first minute",
      summary:
        "A quick tour: record a call, keep the useful bits, and turn your next steps into action.",
      date: "2026-09-23T09:00:00",
      duration: 1080,
      category: "Meeting",
      starred: false,
      participants: ["Alex"],
      language: "en-US",
      notes:
        "## Welcome to Minute\nYour personal workspace keeps calls, notes, and action items together.\n\n## Try it out\n- Open the recording studio to record or upload audio.\n- Add several recordings to the same call.\n- Use a transcript to generate an editable notes draft.\n- Open any action item to set a due date, add a subtask, or link another call.\n- Export your work as Markdown, CSV, or a printable PDF.\n\n## Your data\nThis demo stores data in this browser. Microphone audio is kept in IndexedDB. Demo accounts have separate workspaces.",
      transcript:
        "Welcome to Minute. Try recording your first call. You can also upload an audio or video file. Your recordings and notes stay in this browser.",
      recordings: [],
    },
  ];
  const specs = [
    [
      "coffee",
      "Zaznamenat rozhodnutí ohledně nákupu kávy.",
      "coffee-workshop",
      "",
      "",
    ],
    [
      "workshop",
      "Aktualizovat plánování workshopu na webu.",
      "coffee-workshop",
      "",
      "",
    ],
    [
      "wireframes",
      "Share updated onboarding wireframes",
      "product-design",
      "Sarah",
      "2026-09-28",
    ],
    [
      "testing",
      "Schedule usability testing sessions",
      "product-design",
      "James",
      "2026-10-02",
    ],
    [
      "weekly-update",
      "Publish the weekly progress update",
      "weekly-team",
      "Mia",
      "2026-09-28",
    ],
    [
      "studio-checklist",
      "Review the recording studio checklist",
      "weekly-team",
      "Ben",
      "2026-09-29",
    ],
    [
      "moodboard",
      "Create a moodboard for the new website",
      "website-kickoff",
      "Alex",
      "2026-09-30",
    ],
    [
      "try-minute",
      "Record your first call in Minute",
      "first-minute",
      "Alex",
      "",
    ],
  ];
  const actions: ActionItem[] = specs.map(
    ([id, title, callId, assignee, dueDate]) => ({
      id,
      title,
      callIds: [callId],
      assignee,
      dueDate,
      description:
        id === "try-minute"
          ? "Click New call in the sidebar. Record from your microphone or upload files. Add a transcript, generate notes, then save your call. You can revisit and edit everything later."
          : "Open this item to add details, link another call, or leave a comment. Use subtasks to break a larger task into smaller steps.",
      completed: false,
      relatedIds:
        id === "wireframes"
          ? ["testing"]
          : id === "testing"
            ? ["wireframes"]
            : [],
      comments: [],
      history: [{ text: "Created from call", date: "2026-09-26T09:30:00" }],
    }),
  );
  return { id, name, calls, actions };
}
export function createUserData(): UserData {
  return { workspaces: [createWorkspace()] };
}
