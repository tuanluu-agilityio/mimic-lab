import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';

/** Supported locales. English is bundled (default and fallback); the others load on demand. */
export const LOCALES = ['en', 'vi', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export type Messages = typeof en;
export const NAMESPACES = Object.keys(en) as (keyof Messages)[];

/** How each language names itself in the switcher. Never translated. */
export const LOCALE_NAMES: Record<Locale, { short: string; full: string }> = {
  en: { short: 'EN', full: 'English' },
  vi: { short: 'VI', full: 'Tiếng Việt' },
  ja: { short: '日本語', full: '日本語' },
};

const OG_LOCALES: Record<Locale, string> = { en: 'en_US', vi: 'vi_VN', ja: 'ja_JP' };

export const STORAGE_KEY = 'mimic-lab.locale';

const loaders: Record<Exclude<Locale, 'en'>, () => Promise<{ default: unknown }>> = {
  vi: () => import('./locales/vi'),
  // A font failure must not block the language itself; system Japanese fonts are the fallback.
  ja: () =>
    import('./fonts-ja')
      .catch(() => undefined)
      .then(() => import('./locales/ja')),
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Map a BCP 47 tag such as "vi-VN" to a supported locale, or undefined. */
export function matchLocale(tag: string | undefined | null): Locale | undefined {
  const primary = tag?.toLowerCase().split('-')[0];
  return isLocale(primary) ? primary : undefined;
}

/**
 * The visitor's own choice always wins. Without one, the browser's first language is used if
 * it is Vietnamese or Japanese; everything else gets the site default, English.
 */
export function detectLocale(stored: string | null, browserLanguage: string | undefined): Locale {
  if (isLocale(stored)) return stored;
  return matchLocale(browserLanguage) ?? DEFAULT_LOCALE;
}

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

async function ensureLoaded(locale: Locale): Promise<void> {
  if (locale === 'en' || i18n.hasResourceBundle(locale, 'common')) return;
  const messages = (await loaders[locale]()).default as Record<string, object>;
  for (const ns of NAMESPACES) i18n.addResourceBundle(locale, ns, messages[ns]);
}

/** Keep `<html lang>` and the document metadata in step with the active locale. */
function applyDocumentLocale(locale: string): void {
  document.documentElement.lang = locale;
  const title = i18n.t('meta.title');
  const description = i18n.t('meta.description');
  document.title = title;
  const set = (selector: string, value: string) => document.head.querySelector(selector)?.setAttribute('content', value);
  set('meta[name="description"]', description);
  set('meta[property="og:title"]', i18n.t('meta.ogTitle'));
  set('meta[property="og:description"]', description);
  set('meta[property="og:locale"]', OG_LOCALES[matchLocale(locale) ?? DEFAULT_LOCALE]);
}

/**
 * Initialise before the first render, with the visitor's locale already loaded, so the page
 * never paints in English and then switches.
 */
export async function initI18n(): Promise<void> {
  const wanted = detectLocale(readStored(), navigator.language);
  await i18n.use(initReactI18next).init({
    resources: { en },
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...LOCALES],
    ns: NAMESPACES,
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    returnNull: false,
    // A missing key falls back to English for the visitor, and is reported loudly while
    // developing. `src/i18n/i18n.test.ts` fails the build if any locale is incomplete.
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lngs, ns, key) => console.error(`[i18n] missing key ${ns}:${key} (${lngs.join(', ')})`),
  });
  i18n.on('languageChanged', applyDocumentLocale);
  if (wanted !== DEFAULT_LOCALE) {
    try {
      await ensureLoaded(wanted);
      await i18n.changeLanguage(wanted);
      return;
    } catch (error) {
      console.error(`[i18n] could not load locale ${wanted}`, error);
    }
  }
  applyDocumentLocale(DEFAULT_LOCALE);
}

/** Switch language in place. Only text re-renders; app state and the 3D engine are untouched. */
export async function setLocale(locale: Locale): Promise<void> {
  await ensureLoaded(locale);
  await i18n.changeLanguage(locale);
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this visit only.
  }
}

export function currentLocale(): Locale {
  return matchLocale(i18n.language) ?? DEFAULT_LOCALE;
}

export default i18n;
