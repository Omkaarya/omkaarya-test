import "./marketing.css";
import { Navigation } from "../components/marketing/Navigation";
import { Footer } from "../components/marketing/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-layout">
      <Navigation />
      {children}
      <Footer />
    </div>
  );
}
