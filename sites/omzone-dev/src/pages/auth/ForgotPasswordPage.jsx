/**
 * ForgotPasswordPage — solicitar recuperación de contraseña.
 * Ruta: /auth/forgot-password
 * Muestra un formulario para ingresar el email.
 * En éxito: muestra estado de confirmación "revisa tu correo".
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageMeta from "@/components/seo/PageMeta";
import ROUTES from "@/constants/routes";
import AuthSidePanel from "@/features/auth/AuthSidePanel";
import { sendPasswordRecovery } from "@/services/appwrite/authService";

export default function ForgotPasswordPage() {
  const { t } = useTranslation("common");

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setSubmitting(true);
    try {
      await sendPasswordRecovery(email.trim());
      setSuccess(true);
    } catch (err) {
      const msg = err?.message ?? "";
      if (
        msg.includes("404") ||
        msg.includes("user_not_found") ||
        msg.includes("not found")
      ) {
        setError(t("auth.forgotPassword.error"));
      } else {
        setError(t("errors.generic"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageMeta
        title={`${t("auth.forgotPassword.title")} — Omzone`}
        description="Recupera el acceso a tu cuenta Omzone."
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
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-muted/40 border border-sage/20 mb-8 mx-auto">
                  <Mail className="w-9 h-9 text-sage" aria-hidden="true" />
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal mb-3">
                  {t("auth.forgotPassword.successTitle")}
                </h1>
                <p className="text-charcoal-muted mb-10 max-w-sm mx-auto leading-relaxed">
                  {t("auth.forgotPassword.successSubtitle")}
                </p>
                <Link
                  to={ROUTES.LOGIN}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-sage hover:text-sage-dark hover:underline transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  {t("auth.forgotPassword.backToLogin")}
                </Link>
              </div>
            ) : (
              /* ── Form state ──────────────────────────────────────── */
              <>
                <div className="text-center mb-10">
                  <h1 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal leading-tight auth-stagger-1">
                    {t("auth.forgotPassword.title")}
                  </h1>
                  <p className="text-charcoal-muted mt-2 text-sm sm:text-base auth-stagger-2">
                    {t("auth.forgotPassword.subtitle")}
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
                        {error}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-charcoal-light">
                        {t("auth.forgotPassword.email")}
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

                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting || !email.trim()}
                      className="w-full h-12 group"
                    >
                      {submitting ? (
                        t("auth.forgotPassword.submitting")
                      ) : (
                        <>
                          {t("auth.forgotPassword.submit")}
                          <ArrowRight
                            className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                <div className="text-center mt-8 auth-stagger-4">
                  <Link
                    to={ROUTES.LOGIN}
                    className="inline-flex items-center gap-1.5 text-sm text-charcoal-subtle hover:text-charcoal transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    {t("auth.forgotPassword.backToLogin")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
