"use client";

import { AudioLines, CheckCheck, Layers2, Mic, Sparkles } from "lucide-react";
import { Modal } from "./ui/modal";
import { useMinute } from "./minute-provider";

export function HelpDialog({ onClose }: { onClose: () => void }) {
  const { t } = useMinute();
  const steps = [
    {
      icon: Layers2,
      title: t("Make yourself at home", "Zabydlete se"),
      text: t(
        "Use the workspace switcher to create a space for each project. Choose English, Czech, or both for your meetings.",
        "V přepínači prostorů vytvořte prostor pro každý projekt. Zvolte angličtinu, češtinu nebo oba jazyky schůzek.",
      ),
    },
    {
      icon: Mic,
      title: t("Be in the conversation", "Buďte součástí rozhovoru"),
      text: t(
        "Create a meeting and open the studio. Record with your microphone or add audio files. Make sure everyone knows you’re recording.",
        "Vytvořte schůzku a otevřete studio. Nahrávejte mikrofonem nebo přidejte zvukové soubory. Informujte účastníky, že nahráváte.",
      ),
    },
    {
      icon: Sparkles,
      title: t("Let the next steps find you", "Objevte další kroky"),
      text: t(
        "Finish your meeting to transcribe recordings and find action items. Review and edit the transcript, summary, and suggested todos.",
        "Dokončete schůzku a vytvořte přepis a úkoly z nahrávek. Přepis, shrnutí i navržené úkoly můžete upravit.",
      ),
    },
    {
      icon: CheckCheck,
      title: t("Keep things moving", "Posouvejte věci vpřed"),
      text: t(
        "Set due dates, add subtodos, and connect a todo to several meetings. Paste a Minute link into any Markdown description to display a chip.",
        "Nastavte termíny, přidejte podúkoly a propojte úkol s více schůzkami. Vložte odkaz Minute do popisu v Markdownu a zobrazí se jako štítek.",
      ),
    },
  ];
  return (
    <Modal
      title={t("A minute to get started.", "Minuta pro začátek.")}
      subtitle={t("Better meetings. Clearer next steps.", "Lepší schůzky. Jasnější další kroky.")}
      onClose={onClose}
    >
      <div className="help-steps">
        {steps.map((step, i) => (
          <div key={i}>
            <span>
              <step.icon size={22} />
            </span>
            <section>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </section>
          </div>
        ))}
      </div>
      <div className="info-banner">
        <AudioLines size={19} />
        <span>
          {t(
            "Your work stays in this browser. Export it in Settings to keep a backup.",
            "Vaše práce zůstává v tomto prohlížeči. Zálohu vytvoříte exportem v Nastavení.",
          )}
        </span>
      </div>
    </Modal>
  );
}
