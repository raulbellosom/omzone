/**
 * ResetPasswordPage — restablecer contraseña con enlace de recuperación.
 * Ruta: /auth/reset-password?userId=xxx&secret=yyy
 * Lee userId + secret de la URL (enviados por Appwrite en el email de recuperación).
 * En éxito: redirige a /login.
 */
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageMeta from "@/components/seo/PageMeta";
import ROUTES from "@/constants/routes";
import AuthSidePanel from "@/features/auth/AuthSidePanel";
import { confirmPasswordRecovery } from "@/services/appwrite/authService";

export default function ResetPasswordPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const userId = params.get("userId") ?? "";
  const secret = params.get("secret") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isValid = password.length >= 8 && password === confirm;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;

    setError("");
    setSubmitting(true);
    try {
      await confirmPasswordRecovery(userId, secret, password);
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 2000);
    } catch (err) {
      const msg = err?.message ?? "";
      if (
        msg.includes("expired") ||
        msg.includes("invalid") ||
        msg.includes("401")
      ) {
        setError(t("auth.resetPassword.errorExpired"));
      } else {
        setError(t("auth.resetPassword.errorInvalid"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageMeta
        title={`${t("auth.resetPassword.title")} — Omzone`}
        description="Establece una nueva contraseña para tu cuenta Omzone."
        noindex
      />

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* ── Side panel (desktop) ──────────────────────────────── */}
        <AuthSidePanel variant="login" />

        {/* ── Content panel ─────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-cream relative overflow-hidden">
          <div
            className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-sage/5 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-sand/40 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="w-full max-w-md relative z-10 animate-fade-in-up">
            {success ? (
              /* ── Success state ──────────────────────────────────── */
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-muted/50 border border-sage/20 mb-8 mx-auto">
                  <CheckCircle
                    className="w-10 h-10 text-sage"
                    aria-hidden="true"
                  />
                </div>
                <h1 className="font-display text-3xl font-semibold text-charcoal mb-3">
                  {t("auth.resetPassword.successTitle")}
                </h1>
                <p className="text-charcoal-muted mb-10 max-w-sm mx-auto">
                  {t("auth.resetPassword.successSubtitle")}
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
                  className="w-full max-w-xs mx-auto group"
                >
                  {t("auth.resetPassword.goToLogin")}
                  <ArrowRight
                    className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            ) : (
              /* ── Form state ──────────────────────────────────────── */
              <>
                <div className="text-center mb-10">
                  <h1 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal leading-tight auth-stagger-1">
                    {t("auth.resetPassword.title")}
                  </h1>
                  <p className="text-charcoal-muted mt-2 text-sm sm:text-base auth-stagger-2">
                    {t("auth.resetPassword.subtitle")}
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-warm-gray-dark/30 shadow-card p-6 sm:p-8 auth-stagger-3">
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-5"
                  >
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl animate-fade-in">
                        {error}{" "}
                        <Link
                          to={ROUTES.AUTH_FORGOT_PASSWORD}
                          className="underline font-medium"
                        >
                          {t("auth.forgotPassword.submit")}
                        </Link>
                      </div>
                    )}

                    {/* Nueva contraseña */}
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-charcoal-light">
                        {t("auth.resetPassword.newPassword")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPass ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                          }}
                          autoComplete="new-password"
                          autoFocus
                          className="h-12 pr-12 bg-warm-gray/50 border-warm-gray-dark/40 focus:bg-white focus:border-sage transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-subtle hover:text-charcoal transition-colors p-1"
                          aria-label={
                            showPass
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
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

                    {/* Confirmar contraseña */}
                    <div className="space-y-1.5">
                      <Label htmlFor="confirm" className="text-charcoal-light">
                        {t("auth.resetPassword.confirmPassword")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm"
                          type={showConf ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirm}
                          onChange={(e) => {
                            setConfirm(e.target.value);
                            setError("");
                          }}
                          autoComplete="new-password"
                          className="h-12 pr-12 bg-warm-gray/50 border-warm-gray-dark/40 focus:bg-white focus:border-sage transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConf(!showConf)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-subtle hover:text-charcoal transition-colors p-1"
                          aria-label={
                            showConf
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {showConf ? (
                            <EyeOff className="w-4.5 h-4.5" />
                          ) : (
                            <Eye className="w-4.5 h-4.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting || !isValid}
                      className="w-full h-12 group"
                    >
                      {submitting ? (
                        t("auth.resetPassword.submitting")
                      ) : (
                        <>
                          {t("auth.resetPassword.submit")}
                          <ArrowRight
                            className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
