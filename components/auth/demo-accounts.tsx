import { MOCKED_USERS, ROLE_DEFINITIONS, type User } from "@/lib/users";
import { RoleBadge } from "@/components/layout/role-badge";

export type DemoAccountsProps = {
  onPick: (user: User) => void;
};

/**
 * The three mocked accounts. Clicking one fills the login form.
 */
export function DemoAccounts({ onPick }: DemoAccountsProps) {
  return (
    <section className="demo-accounts" aria-labelledby="demo-accounts-heading">
      <h2 id="demo-accounts-heading" className="section-heading">
        Ukázkové účty
      </h2>
      <ul className="demo-account-list">
        {MOCKED_USERS.map((user) => (
          <li key={user.id}>
            <button
              type="button"
              className="demo-account"
              data-role={user.role}
              onClick={() => onPick(user)}
            >
              <span className="demo-account-header">
                <RoleBadge role={user.role} />
                <strong>{user.displayName}</strong>
              </span>
              <span className="demo-account-capabilities">{ROLE_DEFINITIONS[user.role].capabilities}</span>
              <span className="demo-account-credentials">
                <code>{user.username}</code> / <code>{user.password}</code>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
