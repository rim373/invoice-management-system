'use client';

import './globals.css';
import { I18nProvider } from './i18n-context';
import { SoundProvider } from "./sound-context"


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <I18nProvider>
          <SoundProvider>
          {children}
          </SoundProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
