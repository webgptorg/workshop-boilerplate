"use client";

import spaceTrim from "spacetrim";
import { createContext, useContext, type ReactNode } from "react";
import { UnexpectedError } from "@/lib/errors";
import type { ParentUser, PupilUser, StaffUser, User } from "@/lib/users";

const CurrentUserContext = createContext<User | null>(null);

export function CurrentUserProvider({ user, children }: { user: User; children: ReactNode }) {
  return <CurrentUserContext.Provider value={user}>{children}</CurrentUserContext.Provider>;
}

/**
 * The logged-in user. Only available below a `RoleGuard`.
 */
export function useCurrentUser(): User {
  const user = useContext(CurrentUserContext);

  if (user === null) {
    throw new UnexpectedError(
      spaceTrim(`
        \`useCurrentUser\` was called outside of a \`RoleGuard\`.

        Wrap the screen in \`<RoleGuard role="…">\` so the current user is provided.
      `),
    );
  }

  return user;
}

function useCurrentUserWithRole<TUser extends User>(role: TUser["role"]): TUser {
  const user = useCurrentUser();

  if (user.role !== role) {
    throw new UnexpectedError(
      spaceTrim(`
        Expected the current user to have the role \`${role}\`, but it is \`${user.role}\`.

        **Note:** The \`RoleGuard\` above this component should have redirected the user.
      `),
    );
  }

  return user as TUser;
}

export function useCurrentPupil(): PupilUser {
  return useCurrentUserWithRole<PupilUser>("PUPIL");
}

export function useCurrentStaff(): StaffUser {
  return useCurrentUserWithRole<StaffUser>("STAFF");
}

export function useCurrentParent(): ParentUser {
  return useCurrentUserWithRole<ParentUser>("PARENT");
}
