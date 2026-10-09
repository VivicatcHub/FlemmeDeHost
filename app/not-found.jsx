import Link from "next/link";
import Logo from "./Logo";

export const metadata = {
  title: "Page introuvable · Flemme de Host",
};

export default function NotFound() {
  return (
    <main className="not-found">
      <Logo size={160} res={512} />
      <h1 className="code">404</h1>
      <p>Cette page a eu la flemme d'exister.</p>
      <Link className="home-link" href="/">
        Retour à l'accueil
      </Link>
    </main>
  );
}
