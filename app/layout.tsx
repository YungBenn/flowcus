import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flowcus - Focus timer with ambient sound",
  description:
    "A pomodoro and deep work timer with living 3D fluid and ambient YouTube music to help you flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var r=localStorage.getItem("flowcus:state:v1");var t=r?JSON.parse(r).theme:"light";document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})();`}
        </Script>
        {/* Netlify injects "\n<!-- This site is hosted on Netlify -->" into
            <head> on production; React cannot hydrate the stray whitespace
            text node (#418) and re-renders the whole page. Drop it first. */}
        <Script id="head-whitespace" strategy="beforeInteractive">
          {`(function(){for(var n=document.head.firstChild,x;n;n=x){x=n.nextSibling;if(n.nodeType===3&&!n.data.trim())n.remove()}})();`}
        </Script>
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
