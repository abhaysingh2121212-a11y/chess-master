import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Crown, Loader2 } from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

export function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, playAsGuest } =
    useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(loginEmail, loginPassword);
      toast.success("Welcome back!");
    } catch (err) {
      toast.error((err as Error).message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEmail || !registerPassword || !registerName) {
      toast.error("Please fill in all fields");
      return;
    }
    if (registerPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(registerEmail, registerPassword, registerName);
      toast.success("Account created! Welcome!");
    } catch (err) {
      toast.error((err as Error).message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google!");
    } catch (err) {
      toast.error((err as Error).message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-background"
      data-ocid="auth.panel"
    >
      {/* Background chess board pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Crown className="w-9 h-9 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            Chess Master
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Play, learn, and master the game
          </p>
        </div>

        {/* Demo mode banner */}
        <div
          className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-5 text-xs"
          data-ocid="auth.error_state"
        >
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span className="text-amber-300">
            <strong>Demo mode</strong> — Connect a real Firebase project to
            enable authentication. Accounts are stored locally for demo
            purposes.
          </span>
        </div>

        {/* Auth tabs */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="w-full mb-5 bg-secondary/40">
            <TabsTrigger
              value="login"
              className="flex-1"
              data-ocid="auth.login.tab"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="flex-1"
              data-ocid="auth.register.tab"
            >
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoComplete="email"
                  data-ocid="auth.email.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  data-ocid="auth.password.input"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                data-ocid="auth.login.submit_button"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Display Name</Label>
                <Input
                  id="reg-name"
                  placeholder="Your name"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  data-ocid="auth.name.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  autoComplete="email"
                  data-ocid="auth.register.email.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  autoComplete="new-password"
                  data-ocid="auth.register.password.input"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                data-ocid="auth.register.submit_button"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google button */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleGoogle}
          disabled={googleLoading}
          data-ocid="auth.google.button"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FcGoogle className="w-5 h-5" />
          )}
          Continue with Google
        </Button>

        {/* Guest mode */}
        <div className="mt-4">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={playAsGuest}
            data-ocid="auth.guest.button"
          >
            Play as Guest →
          </Button>
        </div>
      </div>
    </div>
  );
}
