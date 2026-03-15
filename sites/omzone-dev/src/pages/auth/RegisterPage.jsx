/**
 * RegisterPage — formulario de registro (mock, no crea usuario real).
 * Ruta: /register
 * En producción: conectar con Appwrite Auth.
 * Diseño: split layout con panel lateral inmersivo.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageMeta from "@/components/seo/PageMeta";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";
import AuthSidePanel from "@/features/auth/AuthSidePanel";

function validate(form, t) {
  const tv = (k, p) => t(k, { ns: "validation", ...p });
  const errs = {};
  if (!form.firstName.trim()) errs.firstName = tv("required");
  if (!form.lastName.trim()) errs.lastName = tv("required");
  if (!form.email.trim()) errs.email = tv("required");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = tv("email");
  if (!form.password) errs.password = tv("required");
  else if (form.password.length < 8)
    errs.password = tv("minLength", { min: 8 });
  if (form.confirm !== form.password) errs.confirm = tv("passwordMatch");
  return errs;
}

export default function RegisterPage() {
  const { t } = useTranslation("common");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form, t);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSuccess(true);
  }

  // Estado de éxito
  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <AuthSidePanel variant="register" />
        <div className="flex-1 flex items-center justify-center px-4 py-12 bg-cream relative overflow-hidden">
          <div
            className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-sage/8 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div className="w-full max-w-md text-center animate-fade-in-up relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-muted/50 border border-sage/20 mb-8">
              <CheckCircle className="w-10 h-10 text-sage" aria-hidden="true" />
            </div>
            <h2 className="text-3xl font-display font-semibold text-charcoal mb-3">
              ¡Cuenta creada!
            </h2>
            <p className="text-charcoal-muted mb-10 max-w-sm mx-auto">
              {t("auth.register.success")}
            </p>
            <Button asChild size="lg" className="w-full max-w-xs group">
              <Link to={ROUTES.LOGIN}>
                {t("auth.register.signIn")}
                <ArrowRight
                  className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${t("auth.register.title")} — Omzone`}
        description="Crea tu cuenta Omzone y empieza tu viaje wellness."
        noindex
      />

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* ── Side panel (desktop) ──────────────────────────────── */}
        <AuthSidePanel variant="register" />

        {/* ── Form panel ────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 bg-cream relative overflow-hidden">
          {/* Decorative blobs */}
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
            <div className="text-center mb-8 lg:mb-10">
              <Link to={ROUTES.HOME} className="inline-block lg:hidden mb-5">
                <img
                  src="/logo.png"
                  alt="Omzone"
                  className="h-10 w-auto object-contain mx-auto"
                />
              </Link>

              <div className="inline-flex items-center gap-2 bg-sage-muted/30 border border-sage/15 text-sage-dark text-xs font-medium px-3 py-1.5 rounded-full mb-4 auth-stagger-1">
                <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                Yoga & Wellness Kitchen
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal leading-tight auth-stagger-1">
                {t("auth.register.title")}
              </h1>
              <p className="text-charcoal-muted mt-2 text-sm sm:text-base auth-stagger-2">
                {t("auth.register.subtitle")}
              </p>
            </div>

            {/* Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-warm-gray-dark/30 shadow-card p-6 sm:p-8 auth-stagger-3">
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Nombre + Apellido */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      k: "firstName",
                      label: t("auth.register.firstName"),
                      ac: "given-name",
                      ph: "María",
                    },
                    {
                      k: "lastName",
                      label: t("auth.register.lastName"),
                      ac: "family-name",
                      ph: "García",
                    },
                  ].map(({ k, label, ac, ph }) => (
                    <div key={k} className="space-y-1.5">
                      <Label htmlFor={k} className="text-charcoal-light">
                        {label}
                      </Label>
                      <Input
                        id={k}
                        value={form[k]}
                        onChange={(e) => setField(k, e.target.value)}
                        autoComplete={ac}
                        placeholder={ph}
                        className={cn(
                          "h-11 bg-warm-gray/50 border-warm-gray-dark/40 focus:bg-white focus:border-sage transition-colors",
                          errors[k] && "border-red-400 focus:border-red-400",
                        )}
                      />
                      {errors[k] && (
                        <p className="text-xs text-red-500 animate-fade-in">
                          {errors[k]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-charcoal-light">
                    {t("auth.register.email")}
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    className={cn(
                      "h-11 bg-warm-gray/50 border-warm-gray-dark/40 focus:bg-white focus:border-sage transition-colors",
                      errors.email && "border-red-400 focus:border-red-400",
                    )}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 animate-fade-in">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Teléfono (opcional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-phone" className="text-charcoal-light">
                    {t("auth.register.phone")}
                  </Label>
                  <Input
                    id="reg-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    autoComplete="tel"
                    placeholder="+52 55 1234 5678"
                    className="h-11 bg-warm-gray/50 border-warm-gray-dark/40 focus:bg-white focus:border-sage transition-colors"
                  />
                </div>

                {/* Contraseña */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-pass" className="text-charcoal-light">
                    {t("auth.register.password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-pass"
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                      autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres"
                      className={cn(
                        "h-11 pr-12 bg-warm-gray/50 border-warm-gray-dark/40 focus:bg-white focus:border-sage transition-colors",
                        errors.password &&
                          "border-red-400 focus:border-red-400",
                      )}
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
                  {/* Password strength indicator */}
                  {form.password && (
                    <div className="flex gap-1 pt-1 animate-fade-in">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors",
                            form.password.length >= level * 3
                              ? level <= 2
                                ? "bg-amber-400"
                                : "bg-sage"
                              : "bg-warm-gray-dark/30",
                          )}
                        />
                      ))}
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-xs text-red-500 animate-fade-in">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirmar */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirm" className="text-charcoal-light">
                    {t("auth.register.confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-confirm"
                      type={showConf ? "text" : "password"}
                      value={form.confirm}
                      onChange={(e) => setField("confirm", e.target.value)}
                      autoComplete="new-password"
                      placeholder="Repite tu contraseña"
                      className={cn(
                        "h-11 pr-12 bg-warm-gray/50 border-warm-gray-dark/40 focus:bg-white focus:border-sage transition-colors",
                        errors.confirm && "border-red-400 focus:border-red-400",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConf(!showConf)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-subtle hover:text-charcoal transition-colors p-1"
                      aria-label={
                        showConf
                          ? "Ocultar confirmación"
                          : "Mostrar confirmación"
                      }
                    >
                      {showConf ? (
                        <EyeOff className="w-4.5 h-4.5" />
                      ) : (
                        <Eye className="w-4.5 h-4.5" />
                      )}
                    </button>
                  </div>
                  {errors.confirm && (
                    <p className="text-xs text-red-500 animate-fade-in">
                      {errors.confirm}
                    </p>
                  )}
                </div>

                {/* Términos */}
                <p className="text-xs text-charcoal-subtle leading-relaxed pt-1">
                  {t("auth.register.terms")}
                </p>

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full h-12 group"
                >
                  {submitting ? (
                    t("auth.register.submitting")
                  ) : (
                    <>
                      {t("auth.register.submit")}
                      <ArrowRight
                        className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Login link */}
            <p className="text-sm text-center text-charcoal-muted mt-8 auth-stagger-4">
              {t("auth.register.hasAccount")}{" "}
              <Link
                to={ROUTES.LOGIN}
                className="text-sage font-semibold hover:text-sage-dark hover:underline transition-colors"
              >
                {t("auth.register.signIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
