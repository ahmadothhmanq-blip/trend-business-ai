import type { SupportedLocale } from "@/lib/i18n/config";
import {
  deepMergeMessages,
  type TranslationMessages,
} from "@/lib/i18n/messages";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import de from "@/locales/de.json";
import it from "@/locales/it.json";
import pt from "@/locales/pt.json";
import nl from "@/locales/nl.json";
import tr from "@/locales/tr.json";
import zhCN from "@/locales/zh-CN.json";
import zhTW from "@/locales/zh-TW.json";
import ja from "@/locales/ja.json";
import ko from "@/locales/ko.json";
import ru from "@/locales/ru.json";
import hi from "@/locales/hi.json";
import id from "@/locales/id.json";
import vi from "@/locales/vi.json";
import th from "@/locales/th.json";
import pl from "@/locales/pl.json";
import sv from "@/locales/sv.json";
import no from "@/locales/no.json";
import da from "@/locales/da.json";
import fi from "@/locales/fi.json";
import el from "@/locales/el.json";
import cs from "@/locales/cs.json";
import ro from "@/locales/ro.json";
import uk from "@/locales/uk.json";
import ms from "@/locales/ms.json";
import bn from "@/locales/bn.json";
import fa from "@/locales/fa.json";
import ur from "@/locales/ur.json";

const BASE = en as TranslationMessages;

const LOCALE_OVERRIDES: Record<SupportedLocale, TranslationMessages> = {
  en: {},
  ar: ar as TranslationMessages,
  es: es as TranslationMessages,
  fr: fr as TranslationMessages,
  de: de as TranslationMessages,
  it: it as TranslationMessages,
  pt: pt as TranslationMessages,
  nl: nl as TranslationMessages,
  tr: tr as TranslationMessages,
  "zh-CN": zhCN as TranslationMessages,
  "zh-TW": zhTW as TranslationMessages,
  ja: ja as TranslationMessages,
  ko: ko as TranslationMessages,
  ru: ru as TranslationMessages,
  hi: hi as TranslationMessages,
  id: id as TranslationMessages,
  vi: vi as TranslationMessages,
  th: th as TranslationMessages,
  pl: pl as TranslationMessages,
  sv: sv as TranslationMessages,
  no: no as TranslationMessages,
  da: da as TranslationMessages,
  fi: fi as TranslationMessages,
  el: el as TranslationMessages,
  cs: cs as TranslationMessages,
  ro: ro as TranslationMessages,
  uk: uk as TranslationMessages,
  ms: ms as TranslationMessages,
  bn: bn as TranslationMessages,
  fa: fa as TranslationMessages,
  ur: ur as TranslationMessages,
};

const cache = new Map<SupportedLocale, TranslationMessages>();

export function loadMessages(locale: SupportedLocale): TranslationMessages {
  const cached = cache.get(locale);
  if (cached) return cached;

  const override = LOCALE_OVERRIDES[locale] ?? {};
  const merged =
    locale === "en"
      ? BASE
      : deepMergeMessages(BASE, override);
  cache.set(locale, merged);
  return merged;
}
