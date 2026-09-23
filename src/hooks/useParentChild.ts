"use client";

import { spaceTrim } from "spacetrim";
import { findUserById } from "@/auth/findUserById";
import type { MockedUser } from "@/auth/mockedUsers";
import { useSession } from "@/auth/SessionProvider";
import { UnexpectedError } from "@/errors";

export interface ParentChild {
  readonly parent: MockedUser;
  readonly child: MockedUser;
}

/**
 * The signed-in parent and the pupil they take care of.
 */
export function useParentChild(): ParentChild {
  const { currentUser } = useSession();

  if (!currentUser || currentUser.role !== "parent" || !currentUser.childId) {
    throw new UnexpectedError(
      spaceTrim(`
        Hook \`useParentChild\` vyžaduje přihlášeného rodiče s přiřazeným dítětem.

        **Přihlášený uživatel:** \`${currentUser?.id ?? "nikdo"}\`
      `),
    );
  }

  return { parent: currentUser, child: findUserById(currentUser.childId) };
}
