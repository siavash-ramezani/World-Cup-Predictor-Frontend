import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";
import TabBar from "@/components/TabBar";
import NavigationProgress from "@/components/NavigationProgress";

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

export const metadata: Metadata = {
  title: "World Cup Predictor",
  description:
    "Predict scores, climb the leaderboard, and settle friendly $1 bets across the World Cup knockout stage.",
};

export const viewport: Viewport = {
  themeColor: "#0A0D13",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${grotesk.variable}`}>
      <body>
        <NavigationProgress />
        <div className="canvas">
          <div className="device">
            <div className="island" aria-hidden />
            {children}
            <TabBar />
          </div>
        </div>
      </body>
    </html>
  );
}
