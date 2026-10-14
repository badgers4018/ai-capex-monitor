import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
      {/* Brand logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <img
          src="/manus-storage/brand-logo_d3def2d5.png"
          alt="Capital Misallocation"
          className="w-12 h-12 opacity-80"
        />
        <div className="flex flex-col items-center leading-none">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/70">
            CAPITAL MISALLOCATION
          </span>
          <span className="font-mono text-[10px] font-bold uppercase text-[oklch(0.78_0.15_85)]">
            AI CAPEX BOOM MONITOR
          </span>
        </div>
      </div>

      <Card className="w-full max-w-lg mx-4 shadow-lg border border-border bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-destructive/10 rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-destructive" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-2 font-mono">404</h1>

          <h2 className="text-xl font-semibold text-foreground/80 mb-4">
            Page Not Found
          </h2>

          <p className="text-muted-foreground mb-8 leading-relaxed">
            Sorry, the page you are looking for doesn't exist.
            <br />
            It may have been moved or deleted.
          </p>

          <div
            id="not-found-button-group"
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              onClick={handleGoHome}
              className="px-6 py-2.5 rounded-lg transition-[transform,opacity,border-color,background-color] duration-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
