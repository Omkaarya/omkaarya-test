import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import ThemeToggle from "./components/ThemeToggle";
import AutoLogoutProvider from "./components/AutoLogoutProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta-sans",
  display: "swap",
});

const defaultTitle = "OmKaarya Platform";
const defaultDescription = "Hindu temple culture and administration platform by Pepulux.";

const brandMarkPath = "/brand-logo/omkaarya-mark.svg";

function metadataOrigin(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return new URL("http://localhost:3000");
  return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
}

export const metadata: Metadata = {
  metadataBase: metadataOrigin(),
  title: defaultTitle,
  description: defaultDescription,
  icons: {
    icon: [{ url: brandMarkPath, type: "image/svg+xml" }],
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    type: "website",
    images: [
      {
        url: brandMarkPath,
        width: 720,
        height: 720,
        alt: defaultTitle,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: defaultDescription,
    images: [brandMarkPath],
  },
};

const themeInitScript = `!function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);else if(window.matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.setAttribute("data-theme","dark")}catch(e){}}();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${plusJakartaSans.variable} antialiased`}
      >
        <ThemeProvider>
          <AutoLogoutProvider>
            <ThemeToggle />
            {children}
          </AutoLogoutProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
