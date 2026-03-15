/**
 * VerifyEmailPage — confirmación de email desde el enlace enviado por Appwrite.
 * Ruta: /auth/verify-email?userId=xxx&secret=xxx
 *
 * Flujo:
 * 1. Lee userId + secret de la query string.
 * 2. Llama a account.updateVerification(userId, secret).
 * 3. Invoca sync-email-verification Function para actualizar users_profile.
 * 4. Redirige al área de cliente o muestra estado de error.
 */
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageMeta from "@/components/seo/PageMeta";
import ROUTES from "@/constants/routes";
import { confirmEmailVerification } from "@/services/appwrite/authService";
import { syncEmailVerification }    from "@/services/appwrite/profileService";
import { useAuth } from "@/hooks/useAuth.jsx";

const STATUS = { VERIFYING: "verifying", SUCCESS: "success", ERROR: "error" }

export default function VerifyEmailPage() {
  const { t }          = useTranslation("common");
  const [params]       = useSearchParams();
  const navigate       = useNavigate();
  const { refreshUser } = useAuth();

  const userId  = params.get("userId")
  const secret  = params.get("secret")

  const [status,   setStatus]   = useState(STATUS.VERIFYING)
  const [errorMsg, setErrorMsg] = useState("")
  const ranRef = useRef(false)  // prevent double-invocation in StrictMode

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    if (!userId || !secret) {
      setErrorMsg(t("auth.verifyEmail.errorInvalid"))
      setStatus(STATUS.ERROR)
      return
    }

    async function verify() {
      try {
        await confirmEmailVerification(userId, secret)
        // Sync profile.emailVerified via Function (best-effort, non-blocking)
        await syncEmailVerification(userId).catch(() => {})
        // Refresh auth context so the user object reflects the new state
        await refreshUser()
        setStatus(STATUS.SUCCESS)
      } catch (err) {
        const msg = err?.message ?? ""
        if (msg.includes("expired") || msg.includes("invalid") || msg.includes("401")) {
          setErrorMsg(t("auth.verifyEmail.errorLinkExpired"))
        } else {
          setErrorMsg(t("auth.verifyEmail.errorInvalid"))
        }
        setStatus(STATUS.ERROR)
      }
    }

    verify()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <PageMeta
        title={`${t("auth.verifyEmail.verifying")} — Omzone`}
        description="Verificando tu correo electrónico."
        noindex
      />

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-cream relative overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-sage/5 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="w-full max-w-sm text-center animate-fade-in">

          {/* ── Verifying ─────────────────────────────────────────── */}
          {status === STATUS.VERIFYING && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-muted/30 border border-sage/15 mb-8 mx-auto">
                <Loader2 className="w-9 h-9 text-sage animate-spin" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl font-semibold text-charcoal mb-2">
                {t("auth.verifyEmail.verifying")}
              </h1>
              <p className="text-sm text-charcoal-muted">
                {t("actions.loading")}
              </p>
            </>
          )}

          {/* ── Success ───────────────────────────────────────────── */}
          {status === STATUS.SUCCESS && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-muted/50 border border-sage/20 mb-8 mx-auto">
                <CheckCircle className="w-10 h-10 text-sage" aria-hidden="true" />
              </div>
              <h1 className="font-display text-3xl font-semibold text-charcoal mb-3">
                {t("auth.verifyEmail.successTitle")}
              </h1>
              <p className="text-charcoal-muted mb-10 max-w-xs mx-auto">
                {t("auth.verifyEmail.successSubtitle")}
              </p>
              <Button
                size="lg"
                className="w-full group"
                onClick={() => navigate(ROUTES.ACCOUNT_DASHBOARD, { replace: true })}
              >
                {t("auth.verifyEmail.goToDashboard")}
                <ArrowRight
                  className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Button>
            </>
          )}

          {/* ── Error ─────────────────────────────────────────────── */}
          {status === STATUS.ERROR && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border border-red-200 mb-8 mx-auto">
                <XCircle className="w-10 h-10 text-red-500" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl font-semibold text-charcoal mb-3">
                {t("auth.verifyEmail.errorTitle")}
              </h1>
              <p className="text-charcoal-muted mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                {errorMsg || t("auth.verifyEmail.errorInvalid")}
              </p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Button asChild size="lg" variant="outline" className="w-full group">
                  <Link to={ROUTES.AUTH_CHECK_EMAIL}>
                    <RefreshCw className="w-4 h-4 mr-2 transition-transform group-hover:rotate-180" aria-hidden="true" />
                    {t("auth.verifyEmail.tryAgain")}
                  </Link>
                </Button>
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm text-charcoal-subtle hover:text-charcoal transition-colors"
                >
                  {t("auth.verifyEmail.backToLogin")}
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}
