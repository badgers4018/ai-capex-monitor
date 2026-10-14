import { useState } from "react";
import { Mail, Check, Bell, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export function EmailSubscription() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: result => {
      setSubscribed(true);
      localStorage.setItem("techspend_subscribed", email);
      toast.success(
        result.alreadySubscribed
          ? "You're already subscribed! Weekly updates every Monday."
          : "Subscribed! You'll receive weekly updates every Monday.",
      );
    },
    onError: err => {
      toast.error(err.message || "Could not save your subscription. Please try again.");
    },
  });
  const loading = subscribeMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    subscribeMutation.mutate({ email, source: "dashboard" });
  };

  if (subscribed) {
    return (
      <div className="p-6 rounded-2xl border border-[oklch(0.7_0.15_155_/_0.3)] bg-gradient-to-br dark:from-[oklch(0.15_0.02_155)] dark:to-[oklch(0.12_0.01_200)] from-[oklch(0.96_0.01_155)] to-[oklch(0.97_0.005_200)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[oklch(0.7_0.15_155_/_0.2)] flex items-center justify-center">
            <Check className="w-5 h-5 text-[oklch(0.7_0.15_155)]" />
          </div>
          <div>
            <h4 className="font-mono text-sm font-bold text-foreground">Subscribed</h4>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You'll receive the weekly digest every Monday at 9:00 AM PT with fresh data, projection changes, and market alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border border-border/30 bg-gradient-to-br dark:from-[oklch(0.15_0.02_240)] dark:to-[oklch(0.12_0.01_200)] from-[oklch(0.96_0.005_240)] to-[oklch(0.97_0.003_200)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-mono text-sm font-bold text-foreground">Weekly Intelligence Digest</h4>
          <p className="text-xs text-muted-foreground">Get the changelog delivered to your inbox</p>
        </div>
      </div>

      {/* What you get */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-[oklch(0.7_0.15_155)]" />
          <span className="text-xs text-muted-foreground">Fresh stock data & capex revisions</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-[oklch(0.75_0.15_70)]" />
          <span className="text-xs text-muted-foreground">Earnings surprises & forecast changes</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-[oklch(0.7_0.15_240)]" />
          <span className="text-xs text-muted-foreground">Policy alerts & risk signal updates</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          name="email"
          autoComplete="email"
          className="flex-1 px-4 py-2.5 rounded-lg bg-background/50 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50 transition-[transform,opacity,border-color,background-color] duration-200 active:scale-[0.97] whitespace-nowrap"
        >
          {loading ? "…" : "Subscribe"}
        </button>
      </form>

      <p className="text-fluid-xs text-muted-foreground/50 mt-3">
        Delivered every Monday at 9:00 AM PT. Unsubscribe anytime. No spam, ever.
      </p>
    </div>
  );
}
