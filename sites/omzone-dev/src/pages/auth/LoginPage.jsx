/**
 * LoginPage — formulario de inicio de sesión.
 * Ruta: /login
 * Muestra aviso si el email no está verificado + opción de reenvío.
 */
import { useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, ArrowRight, MailWarning, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageMeta from "@/components/seo/PageMeta";
import { useAuth } from "@/hooks/useAuth.jsx";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";
import AuthSidePanel from "@/features/auth/AuthSidePanel";

export default function LoginPage() {
  const { t } = useTranslation("common");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get("redirect") ?? "";
  // Priority: ?redirect param > router state (from RequireAuth) > /app (smart-redirects clients to /account)
  const from = redirectParam || location.state?.from?.pathname || ROUTES.ADMIN;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Shown when user logs in but email is not yet verified
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setUnverified(false);
    setSubmitting(true);

    try {
      const user = await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.message ?? "";
      const type = err?.type ?? "";
      const code = err?.code ?? "";

      if (err?.code === "email_not_verified" || msg === "email_not_verified") {
        setUnverified(true);
        return;
      }

      // Invalid credentials (wrong email/password)
      if (
        type === "user_invalid_credentials" ||
        msg.includes("invalid_credentials") ||
        msg.includes("Invalid credentials")
      ) {
        setError(t("auth.login.error"));
        return;
      }

      // Network / CORS failure — browser can't reach the Appwrite endpoint.
      // "Load failed" (Safari) / "Failed to fetch" (Chrome) are TypeErrors
      // thrown before any HTTP response arrives.
      if (
        err instanceof TypeError ||
        msg.toLowerCase().includes("load failed") ||
        msg.toLowerCase().includes("failed to fetch") ||
        msg.toLowerCase().includes("network")
      ) {
        setError(
          "Error de red: no se pudo conectar al servidor. Verifica tu conexión o que la URL de la app esté permitida en la consola Appwrite (Settings → Platforms).",
        );
        return;
      }

      // Any other error — show descriptive details so it can be diagnosed
      // on mobile where network inspector is unavailable.
      const detail = type || msg || String(code);
      setError(`${t("errors.generic")}${detail ? ` (${detail})` : ""}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendVerification() {
    if (resending) return;
    setResending(true);
    try {
      const { sendEmailVerification } =
        await import("@/services/appwrite/authService");
      await sendEmailVerification();
      toast.success(t("auth.login.resendSuccess"));
    } catch {
      toast.error(t("auth.login.resendError"));
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <PageMeta
        title={`${t("auth.login.title")} — Omzone`}
        description="Inicia sesión en tu cuenta Omzone."
        noindex
      />

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* ── Side panel (desktop) ──────────────────────────────── */}
        <AuthSidePanel variant="login" />

        {/* ── Form panel ────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-cream relative overflow-hidden">
          <div
            className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-sage/5 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-sand/40 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="w-full max-w-md relative z-10">
            {/* Logo — mobile only */}
            <div className="text-center mb-10 lg:mb-12">
              <Link to={ROUTES.HOME} className="inline-block lg:hidden mb-6">
                <img
                  src="/logo.png"
                  alt="Omzone"
                  className="h-10 w-auto object-contain mx-auto"
                />
              </Link>

              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal leading-tight auth-stagger-1">
                {t("auth.login.title")}
              </h1>
              <p className="text-charcoal-muted mt-2 text-sm sm:text-base auth-stagger-2">
                {t("auth.login.subtitle")}
              </p>
            </div>

            {/* Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-warm-gray-dark/30 shadow-card p-6 sm:p-8 auth-stagger-3">
              {/* Email not verified warning */}
              {unverified && (
                <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <MailWarning
                      className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        {t("auth.login.unverifiedEmail")}
                      </p>
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resending}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 hover:underline transition-colors disabled:opacity-60"
                      >
                        <RefreshCw
                          className={cn("w-3 h-3", resending && "animate-spin")}
                          aria-hidden="true"
                        />
                        {resending
                          ? t("actions.loading")
                          : t("auth.login.resendVerification")}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Error global */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl animate-fade-in">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-charcoal-light">
                    {t("auth.login.email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                      setUnverified(false);
                    }}
                    autoComplete="email"
                    autoFocus
                    required
                    className="h-12 bg-warm-gray/50 border-warm-gray-dark/40 focus:bg-white focus:border-sage transition-colors"
                  />
                </div>

                {/* Contraseña */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-charcoal-light">
                      {t("auth.login.password")}
                    </Label>
                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.AUTH_FORGOT_PASSWORD)}
                      className="text-xs text-sage hover:text-sage-dark hover:underline transition-colors"
                    >
                      {t("auth.login.forgotPassword")}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="h-12 pr-12 bg-warm-gray/50 border-warm-gray-dark/40 focus:bg-white focus:border-sage transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-subtle hover:text-charcoal transition-colors p-1"
                      aria-label={
                        showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                    >
                      {showPass ? (
                        <EyeOff className="w-4.5 h-4.5" />
                      ) : (
                        <Eye className="w-4.5 h-4.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting || !email.trim()}
                  className="w-full h-12 group"
                >
                  {submitting ? (
                    t("auth.login.submitting")
                  ) : (
                    <>
                      {t("auth.login.submit")}
                      <ArrowRight
                        className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Registro link */}
            <p className="text-sm text-center text-charcoal-muted mt-8 auth-stagger-4">
              {t("auth.login.noAccount")}{" "}
              <Link
                to={
                  redirectParam
                    ? `${ROUTES.REGISTER}?redirect=${encodeURIComponent(redirectParam)}`
                    : ROUTES.REGISTER
                }
                className="text-sage font-semibold hover:text-sage-dark hover:underline transition-colors"
              >
                {t("auth.login.createAccount")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
