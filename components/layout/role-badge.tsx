import { ROLE_DEFINITIONS, type UserRole } from "@/lib/users";

/**
 * Small pill with the role name in the role's tint.
 */
export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className="role-badge" data-role={role}>
      {ROLE_DEFINITIONS[role].label}
    </span>
  );
}
