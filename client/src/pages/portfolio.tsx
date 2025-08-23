import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Portfolio } from "@/components/portfolio";
import { PortfolioGate } from "@/components/portfolio-gate";

export default function PortfolioPage() {
  const [hasAccess, setHasAccess] = useState(false);

  // Check if user already has access from this session
  useEffect(() => {
    const portfolioAccess = sessionStorage.getItem("portfolio_access");
    if (portfolioAccess === "granted") {
      setHasAccess(true);
    }
  }, []);

  const grantAccess = () => {
    sessionStorage.setItem("portfolio_access", "granted");
    setHasAccess(true);
  };

  if (!hasAccess) {
    return <PortfolioGate onAccessGranted={grantAccess} />;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <Portfolio />
      </div>
    </div>
  );
}
