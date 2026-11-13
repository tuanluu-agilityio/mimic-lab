import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currentLocale, LOCALE_NAMES, LOCALES, setLocale, type Locale } from '@/i18n';
import styles from './LanguageSwitcher.module.css';

/**
 * EN | VI | 日本語. Each language is written in its own script and marked with `lang`, so it is
 * recognisable and pronounced correctly whatever the current interface language is.
 */
export function LanguageSwitcher() {
  const { t } = useTranslation('navigation');
  const active = currentLocale();
  const [pending, setPending] = useState<Locale | null>(null);

  const choose = (locale: Locale) => {
    if (locale === active || pending) return;
    setPending(locale);
    setLocale(locale)
      .catch((error: unknown) => console.error('[i18n] language switch failed', error))
      .finally(() => setPending(null));
  };

  return (
    <div className={styles.group} role="group" aria-label={t('language.label')} data-testid="language">
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          className={styles.option}
          aria-pressed={locale === active}
          aria-busy={locale === pending || undefined}
          aria-label={LOCALE_NAMES[locale].full}
          title={LOCALE_NAMES[locale].full}
          data-testid={`lang-${locale}`}
          onClick={() => choose(locale)}
        >
          {LOCALE_NAMES[locale].short}
        </button>
      ))}
    </div>
  );
}
