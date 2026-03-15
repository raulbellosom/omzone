/**
 * LoginPage — formulario de inicio de sesión con mock auth.
 * Ruta: /login
 * Demo: valeria@example.com (cualquier contraseña)
 * Diseño: split layout con panel lateral inmersivo.
 */
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageMeta from "@/components/seo/PageMeta";
import { loginMock } from "@/services/mocks/userService.mock";
import { useAuth } from "@/hooks/useAuth.jsx";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";
import AuthSidePanel from "@/features/auth/AuthSidePanel";

export default function LoginPage() {
  const { t } = useTranslation("common");
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? ROUTES.ACCOUNT_DASHBOARD;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setSubmitting(true);
    try {
      const user = await loginMock(email.trim());
      setUser(user);
      navigate(from, { replace: true });
    } catch {
      setError(t("auth.login.error"));
    } finally {
      setSubmitting(false);
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
          {/* Decorative blobs — mobile visible too */}
          <div
            className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-sage/5 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-sand/40 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="w-full max-w-md relative z-10">
            {/* Logo — mobile only (desktop has it in side panel) */}
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

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-warm-gray-dark/40" />
                <span className="text-xs text-charcoal-subtle uppercase tracking-wide">
                  {t("auth.login.orContinueWith")}
                </span>
                <div className="flex-1 h-px bg-warm-gray-dark/40" />
              </div>

              {/* Social login placeholder */}
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-warm-gray-dark/40 bg-white hover:bg-warm-gray/50 text-charcoal-light text-sm font-medium transition-colors disabled:opacity-50"
                title="Próximamente"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {t("auth.login.google")}
              </button>

              {/* Demo hint */}
              <p className="text-xs text-center text-charcoal-subtle mt-5 bg-sage-muted/30 border border-sage/10 rounded-xl px-3 py-2.5">
                {t("auth.login.demoHint")}
              </p>
            </div>

            {/* Registro link */}
            <p className="text-sm text-center text-charcoal-muted mt-8 auth-stagger-4">
              {t("auth.login.noAccount")}{" "}
              <Link
                to={ROUTES.REGISTER}
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
