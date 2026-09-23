import type { MealFeedback, MealIdea } from "@/model/types";
import { PARENT_USER, PUPIL_USER } from "@/auth/mockedUsers";

export const INITIAL_FEEDBACK: readonly MealFeedback[] = [
  { id: "feedback-1", mealId: "main-dzuvec", date: "2026-09-21", authorId: PUPIL_USER.id, authorRole: "pupil", rating: 3, comment: "Rýže byla dobrá.", createdAt: "2026-09-21T12:40:00.000Z" },
  { id: "feedback-2", mealId: "main-bramborovy-gulas", date: "2026-09-22", authorId: PUPIL_USER.id, authorRole: "pupil", rating: 2, comment: "", createdAt: "2026-09-22T12:35:00.000Z" },
  { id: "feedback-3", mealId: "main-koprova-omacka", date: "2026-09-21", authorId: PARENT_USER.id, authorRole: "parent", rating: 1, comment: "Dcera koprovou nejí, díky za alternativu.", createdAt: "2026-09-21T18:10:00.000Z" },
];

export const INITIAL_IDEAS: readonly MealIdea[] = [
  {
    id: "idea-1",
    text: "Děti milují špagety s boloňskou omáčkou.",
    authorId: PARENT_USER.id,
    createdAt: "2026-09-14T19:20:00.000Z",
    status: "adjusted",
    response: "Zařazeno jako lasagne s boloňskou omáčkou ve čtvrtek 15. 10. Ten týden už jsou těstoviny ve středu, proto jiná podoba.",
  },
  {
    id: "idea-2",
    text: "Kuřecí nudličky s rýží, děláme doma často.",
    authorId: PARENT_USER.id,
    createdAt: "2026-09-20T08:05:00.000Z",
    status: "new",
    response: "",
  },
];
