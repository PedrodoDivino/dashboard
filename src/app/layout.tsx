import type { Metadata } from "next";
import { JetBrains_Mono, Newsreader } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  axes: ["opsz"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Nexus", template: "%s · Nexus" },
  description: "Painel Nexus",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html lang={locale === "pt" ? "pt-BR" : "en"} className={`${newsreader.variable} ${jetbrainsMono.variable}`}>
      {/* suppressHydrationWarning: extensões (ex.: ColorZilla) injetam atributos no <body> */}
      <body suppressHydrationWarning className="min-h-screen bg-[#030303] font-serif text-white antialiased selection:bg-[#FF6400]/30">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
