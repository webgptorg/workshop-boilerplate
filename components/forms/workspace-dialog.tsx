"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers2 } from "lucide-react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { LanguagePicker } from "./language-picker";
import { useMinute } from "../minute-provider";
import { mutate } from "@/lib/store";
import { uid } from "@/lib/utils";
import type { Language, Workspace } from "@/lib/types";

export function WorkspaceDialog({ onClose, workspace }: { onClose: () => void; workspace?: Workspace }) {
  const { t, notify, state } = useMinute();
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>(workspace?.languages ?? [state.user.language]);
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    if (!name) return;
    const next: Workspace = {
      id: workspace?.id ?? uid(),
      name,
      description: String(data.get("description")).trim(),
      languages,
      color: "cyan",
      createdAt: workspace?.createdAt ?? new Date().toISOString(),
    };
    mutate((current) => ({
      ...current,
      workspaces: workspace ? current.workspaces.map((item) => (item.id === workspace.id ? next : item)) : [...current.workspaces, next],
      memberships: workspace
        ? current.memberships
        : [...current.memberships, { workspaceId: next.id, userId: current.user.id, role: "owner" }],
    }));
    notify(workspace ? t("Workspace updated", "Prostor upraven") : t("Your new workspace is ready", "Váš nový prostor je připraven"));
    onClose();
    if (!workspace) router.push(`/${next.id}`);
  }
  return (
    <Modal
      title={workspace ? t("Edit workspace", "Upravit prostor") : t("Room for your next idea.", "Prostor pro další nápad.")}
      subtitle={t("Keep related meetings and todos together.", "Udržujte související schůzky a úkoly pohromadě.")}
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={submit}>
        <label className="field-label">
          {t("Workspace name", "Název prostoru")}
          <input
            name="name"
            required
            autoFocus
            maxLength={80}
            defaultValue={workspace?.name}
            placeholder={t("e.g. Product team", "Např. Produktový tým")}
          />
        </label>
        <label className="field-label">
          {t("Description", "Popis")}
          <textarea
            name="description"
            rows={3}
            defaultValue={workspace?.description}
            placeholder={t("What is this space for?", "K čemu tento prostor slouží?")}
          />
        </label>
        <div className="field-label">
          {t("Workspace languages", "Jazyky prostoru")}
          <LanguagePicker value={languages} onChange={setLanguages} />
          <span className="field-hint">
            {t("New meetings will use these languages by default.", "Nové schůzky budou ve výchozím nastavení používat tyto jazyky.")}
          </span>
        </div>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>
            {t("Cancel", "Zrušit")}
          </Button>
          <Button type="submit">
            <Layers2 size={16} />
            {workspace ? t("Save changes", "Uložit změny") : t("Create workspace", "Vytvořit prostor")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
