import type { AppState, Meeting, Todo } from "./types";
import { dayKey } from "./utils";

export const DEFAULT_WORKSPACE = "my-workspace";

export function createInitialState(): AppState {
  const date = (offset: number, hour = 10, minute = 0) => {
    const value = new Date();
    value.setDate(value.getDate() + offset);
    value.setHours(hour, minute, 0, 0);
    return value.toISOString();
  };
  const base = { workspaceId: DEFAULT_WORKSPACE, languages: ["en" as const], recordings: [] };
  const meetings: Meeting[] = [
    {
      ...base,
      id: "weekly-team-sync",
      title: "Weekly team sync",
      description: "A little alignment goes a long way. Share progress, unblock the team, and plan the week ahead.",
      date: date(0, 14),
      duration: 30,
      participants: ["Alex Morgan", "Sophie Chen", "James Wilson", "Olivia Davis"],
      status: "scheduled",
      color: "cyan",
    },
    {
      ...base,
      id: "product-design-review",
      title: "Product design review",
      description: "Review the new onboarding experience and agree on the next iteration.",
      date: date(-1, 11),
      duration: 45,
      participants: ["Alex Morgan", "Sophie Chen", "James Wilson"],
      status: "completed",
      color: "purple",
      transcript: {
        text: "Alex: Let's walk through the new onboarding flow. We want new users to get to their first useful moment faster.\n\nSophie: The simplified welcome screen tested well. People understood the workspace concept immediately. We should keep the three-step setup and remove the optional fields.\n\nJames: I agree. I'll update the onboarding wireframes by Friday and share them with the team.\n\nAlex: Great. I'll put together the design feedback from today's session. Sophie, please share the updated component library with the engineering team.\n\nSophie: Will do. Let's also schedule five usability sessions for next week so we can validate the changes.\n\nAlex: Perfect. We agreed to simplify setup, keep the existing visual direction, and test the revised flow next week.",
        summary:
          "The team reviewed the new onboarding experience and agreed to keep a **three-step setup**, remove optional fields, and retain the current visual direction.\n\n- Simplify the welcome screen to help users reach their first useful moment.\n- Update wireframes and share the component library with engineering.\n- Validate the revised flow in five usability sessions next week.",
        updatedAt: date(-1, 12),
      },
    },
    {
      ...base,
      id: "website-kickoff",
      title: "Website redesign kickoff",
      description: "A fresh start for our website. Align on goals, scope, and the creative direction.",
      date: date(-2, 15),
      duration: 60,
      participants: ["Alex Morgan", "Olivia Davis", "Sophie Chen", "James Wilson"],
      status: "completed",
      color: "orange",
      transcript: {
        text: "Alex: Our goal is to make the website clearer and more welcoming.\n\nOlivia: We need to start with the homepage and product pages. I'll prepare a moodboard with three visual directions.\n\nJames: I'll audit the existing website and document the pages we can consolidate.\n\nSophie: Let's define the project milestones before we start designing. I'll draft the timeline for review.\n\nAlex: Agreed. We'll review the moodboard and timeline at our next meeting.",
        summary:
          "The website redesign will start with the **homepage and product pages**. The team will explore three visual directions, audit the existing content, and agree on a project timeline before design begins.",
        updatedAt: date(-2, 16),
      },
    },
    {
      ...base,
      id: "sprint-retrospective",
      title: "Sprint retrospective",
      description: "What worked, what we learned, and what we can do better next time.",
      date: date(-3, 10),
      duration: 30,
      participants: ["Alex Morgan", "James Wilson", "Sophie Chen"],
      status: "completed",
      color: "green",
      transcript: {
        text: "Alex: We shipped the dashboard this sprint. What went well?\n\nJames: Pairing on the tricky parts really helped. I'd like to keep doing that.\n\nSophie: We could improve our handoff notes. I'll create a shared handoff checklist.\n\nAlex: Let's keep the pairing sessions and use the checklist starting next sprint.",
        summary:
          "The dashboard shipped successfully. The team will continue pairing sessions and introduce a **shared design handoff checklist** next sprint.",
        updatedAt: date(-3, 11),
      },
    },
    {
      ...base,
      id: "customer-discovery",
      title: "Customer discovery",
      description: "Listen to customer feedback and explore opportunities for the next release.",
      date: date(1, 10, 30),
      duration: 45,
      participants: ["Alex Morgan", "Olivia Davis"],
      status: "scheduled",
      color: "purple",
    },
  ];
  const todo = (
    id: string,
    title: string,
    meetingIds: string[],
    offset: number,
    priority: Todo["priority"],
    description = "",
    completed = false,
  ): Todo => ({
    id,
    title,
    meetingIds,
    workspaceId: DEFAULT_WORKSPACE,
    description,
    dueDate: dayKey(date(offset)),
    priority,
    completed,
    parentId: null,
    createdAt: date(-1),
  });
  return {
    version: 1,
    user: { id: "alex-morgan", name: "Alex Morgan", email: "alex@example.com", language: "en", theme: "light" },
    workspaces: [
      {
        id: DEFAULT_WORKSPACE,
        name: "My workspace",
        description: "A home for good conversations and what comes next.",
        languages: ["en"],
        color: "cyan",
        createdAt: date(-7),
      },
    ],
    memberships: [{ userId: "alex-morgan", workspaceId: DEFAULT_WORKSPACE, role: "owner" }],
    meetings,
    todos: [
      todo(
        "onboarding-wireframes",
        "Update the onboarding wireframes",
        ["product-design-review"],
        0,
        "high",
        "Simplify the welcome screen, keep three setup steps, and remove optional fields.",
      ),
      todo(
        "design-feedback",
        "Put together the design feedback",
        ["product-design-review"],
        0,
        "medium",
        "Collect the team's notes from the product design review.",
      ),
      todo(
        "website-moodboard",
        "Prepare a website moodboard",
        ["website-kickoff"],
        1,
        "medium",
        "Explore three visual directions for the homepage and product pages.",
      ),
      todo(
        "component-library",
        "Share the updated component library",
        ["product-design-review"],
        1,
        "low",
        "Share the latest components with the engineering team.",
      ),
      todo(
        "handoff-checklist",
        "Create a design handoff checklist",
        ["sprint-retrospective"],
        -1,
        "medium",
        "Document the steps for a smooth handoff to engineering.",
        true,
      ),
      todo(
        "tutorial-record",
        "Record your first meeting",
        [],
        3,
        "low",
        "Open **New meeting**, enter a title, then head to the **Meeting studio**. Record from your microphone or drop in an audio file. You can add as many recordings as you need.",
      ),
      todo(
        "tutorial-todo",
        "Make a todo your own",
        [],
        3,
        "low",
        "Open any todo to edit its title, due date, and priority. Add subtodos for smaller steps, and link meetings for context. Check this one off when you're ready!",
      ),
      todo(
        "tutorial-workspace",
        "Create a space for your next project",
        [],
        3,
        "low",
        "Open the workspace switcher in the sidebar and choose **Create workspace**. Give it a name and select the languages your team speaks.",
      ),
    ],
    onboardingDismissed: false,
  };
}
