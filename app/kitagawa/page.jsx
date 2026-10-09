import Link from "next/link";
import { Mochiy_Pop_One } from "next/font/google";

const pop = Mochiy_Pop_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pop",
});

export const revalidate = 3600;

export const metadata = {
  title: "Jamais la Flemme ♡",
  robots: { index: false, follow: false },
  icons: {
    icon: { url: "/kitagawa/logo.gif", type: "image/gif" },
    apple: { url: "/kitagawa/logo.gif" },
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1020" },
  ],
};

export default function Kitagawa() {
  return (
    <main className={`not-found theme-kitagawa ${pop.variable}`}>
      <img
        className="marin"
        src="/kitagawa/logo.gif"
        alt=""
        width={446}
        height={307}
      />
      <h1 className="code">{new Date().getFullYear()}</h1>
      <p>Cette page n'a jamais eu la flemme d'exister ♡</p>
      <Link className="home-link" href="/">
        Retour chez les flemmards
      </Link>
    </main>
  );
}
