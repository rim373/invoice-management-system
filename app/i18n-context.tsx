'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';

type Lang = 'en' | 'fr';

type Ctx = {
  locale: Lang;
  setLocale: (l: Lang) => void;
  messages: Record<string, any>;
};

const I18nContext = createContext<Ctx | null>(null);

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('I18nContext missing');
  return ctx;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Lang>('en');
  const [messages, setMessages] = useState<Record<string, any>>({});

  // load saved language + messages
  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem('locale')) as Lang | null;
    const initial = stored ?? 'en';
    changeLocale(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeLocale = async (lang: Lang) => {
    const msgs = (await import(`../messages/${lang}.json`)).default;
    localStorage.setItem('locale', lang);
    setLocale(lang);
    setMessages(msgs);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: changeLocale, messages }}>
      {/* only render children when messages are ready */}
      {Object.keys(messages).length > 0 && (
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      )}
    </I18nContext.Provider>
  );
}
