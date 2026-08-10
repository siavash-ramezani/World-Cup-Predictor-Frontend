import type { Viewport } from "next";
import { Manrope, Space_Grotesk, Cairo } from "next/font/google";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";
import TabBar from "@/components/TabBar";
import NavigationProgress from "@/components/NavigationProgress";
import LanguageFab from "@/components/LanguageFab";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { getLocale, getT } from "@/lib/i18n/server";
import { dirOf } from "@/lib/i18n/types";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export async function generateMetadata() {
  const t = await getT();
  return { title: t.common.appName, description: t.common.metaDescription };
}

export const viewport: Viewport = {
  themeColor: "#0A0D13",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir={dirOf(locale)} className={`${manrope.variable} ${grotesk.variable} ${cairo.variable}`}>
      <body>
        <LanguageProvider initialLocale={locale}>
          <NavigationProgress />
          <div className="canvas">
            <div className="device">
              <div className="island" aria-hidden />
              <LanguageFab />
              {children}
              <TabBar />
            </div>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
