import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { usePrivy } from "@privy-io/react-auth";
import { Activity } from "lucide-react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (ready && !authenticated) {
      navigate("/login");
    }
  }, [ready, authenticated, navigate]);

  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#f7f2e9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "12px",
      }}>
        <Activity size={20} color="#c4923a" />
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "10px",
          color: "#3d3020",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}>
          Loading...
        </span>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
