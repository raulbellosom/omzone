/**
 * CheckEmailPage — pantalla "Revisa tu correo".
 * Ruta: /auth/check-email?email=xxx
 * Se muestra justo después del registro para que el usuario verifique su email.
 * Incluye botón para reenviar el correo de verificación.
 */
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PageMeta from "@/components/seo/PageMeta";
import ROUTES from "@/constants/routes";
import AuthSidePanel from "@/features/auth/AuthSidePanel";
import { sendEmailVerification } from "@/services/appwrite/authService";

export default function CheckEmailPage() {
  const { t } = useTranslation("common");
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const redirect = params.get("redirect") ?? "";

  const [resending, setResending] = useState(false);

  async function handleResend() {
    if (resending) return;
    setResending(true);
    try {
      await sendEmailVerification();
      toast.success(t("auth.checkEmail.resendSuccess"));
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <PageMeta
        title={`${t("auth.checkEmail.title")} — Omzone`}
        description="Verifica tu correo electrónico para activar tu cuenta Omzone."
        noindex
      />

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* ── Side panel (desktop) ──────────────────────────────── */}
        <AuthSidePanel variant="register" />

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

          <div className="w-full max-w-md relative z-10 text-center animate-fade-in-up">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-muted/40 border border-sage/20 mb-8 mx-auto">
              <Mail className="w-9 h-9 text-sage" aria-hidden="true" />
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal mb-3">
              {t("auth.checkEmail.title")}
            </h1>

            <p className="text-charcoal-muted mb-2">
              {t("auth.checkEmail.subtitle", { email: email || "tu correo" })}
            </p>

            <p className="text-sm text-charcoal-subtle mb-10 max-w-sm mx-auto leading-relaxed">
              {t("auth.checkEmail.instructions")}
            </p>

            {/* Resend button */}
            <Button
              variant="outline"
              size="lg"
              onClick={handleResend}
              disabled={resending}
              className="w-full max-w-xs mx-auto h-12 group mb-4"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 transition-transform ${resending ? "animate-spin" : "group-hover:rotate-180"}`}
                aria-hidden="true"
              />
              {resending ? t("actions.loading") : t("auth.checkEmail.resend")}
            </Button>

            {/* Already verified */}
            <p className="text-sm text-charcoal-subtle mt-6">
              {t("auth.checkEmail.alreadyVerified")}{" "}
              <Link
                to={ROUTES.LOGIN}
                className="text-sage font-semibold hover:text-sage-dark hover:underline transition-colors"
              >
                {t("auth.checkEmail.goToLogin")}
              </Link>
            </p>

            {/* Back link */}
            <Link
              to={
                redirect
                  ? `${ROUTES.REGISTER}?redirect=${encodeURIComponent(redirect)}`
                  : ROUTES.REGISTER
              }
              className="inline-flex items-center gap-1.5 text-sm text-charcoal-subtle hover:text-charcoal transition-colors mt-8"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {t("auth.checkEmail.back")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
