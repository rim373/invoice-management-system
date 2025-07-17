'use client';

import './globals.css';
import { I18nProvider } from './i18n-context';
import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Invoice',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
