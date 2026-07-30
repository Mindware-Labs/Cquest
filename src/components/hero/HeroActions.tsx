import QuestCta from "@/components/ui/QuestCta";
import { useI18n } from "@/i18n/I18nProvider";

/* The hero's single action. The button itself lives in ui/QuestCta — the
   footer closes the page with the same one, and it is shared rather than
   copied so the two can't drift apart again. */
export default function HeroActions() {
  const { dict } = useI18n();

  return (
    <div className="flex items-center">
      <QuestCta href="/quote" label={dict.hero.primaryCta} />
    </div>
  );
}
