/**
 * ConfirmationPage — pantalla de éxito post-pago.
 * Ruta: /checkout/confirmation
 * Recibe via location.state: { orderNo, email, items, total, intentType }
 */
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageMeta from "@/components/seo/PageMeta";
import { useCurrency } from "@/hooks/useCurrency";
import ROUTES from "@/constants/routes";

export default function ConfirmationPage() {
  const location = useLocation();
  const { t } = useTranslation("checkout");
  const { formatPrice } = useCurrency();
  const state = location.state ?? {};

  const { orderNo, email, items = [], total = 0, intentType } = state;

  // Si llegaron directo sin state, estado vacío mínimo
  const displayOrderNo = orderNo ?? `OMZ-${Date.now()}`;
  const displayEmail = email ?? "—";

  return (
    <>
      <PageMeta
        title={`${t("confirmation.title")} — Omzone`}
        description="Tu pago ha sido confirmado."
        noindex
      />

      <main className="max-w-2xl mx-auto px-4 py-12 md:py-20 min-h-[calc(100vh-4rem)]">
        {/* Hero de confirmación */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-muted mb-6">
            <CheckCircle className="w-10 h-10 text-sage" aria-hidden="true" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-charcoal mb-3">
            {t("confirmation.title")}
          </h1>
          <p className="text-charcoal-muted text-lg">
            {t("confirmation.subtitle")}
          </p>
        </div>

        {/* Tarjeta de resumen */}
        <div className="bg-white rounded-2xl border border-warm-gray-dark/40 shadow-card overflow-hidden mb-6 animate-fade-in">
          <div
            className="h-1.5 bg-linear-to-r from-sage to-olive"
            aria-hidden="true"
          />
          <div className="p-6 space-y-4">
            {/* Número de orden */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-muted">
                {t("confirmation.orderNumber")}
              </span>
              <span className="font-mono font-semibold text-charcoal bg-warm-gray px-3 py-1 rounded-lg text-sm">
                {displayOrderNo}
              </span>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-muted">
                {t("confirmation.email")}
              </span>
              <span className="text-sm text-charcoal font-medium">
                {displayEmail}
              </span>
            </div>

            {/* Ítems comprados */}
            {items.length > 0 && (
              <div className="pt-3 border-t border-warm-gray-dark/50 space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-charcoal">{item.title}</span>
                    <span className="font-medium text-charcoal">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-warm-gray-dark/40 font-bold">
                  <span className="text-charcoal">{t("total")}</span>
                  <span className="text-sage text-lg font-display">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Siguiente paso según intent */}
        {intentType === "booking" && (
          <div className="bg-sage-muted/40 rounded-xl p-4 flex items-start gap-3 mb-6 animate-fade-in">
            <Calendar
              className="w-5 h-5 text-sage shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-charcoal">
                Tu reserva está confirmada
              </p>
              <p className="text-sm text-charcoal-muted mt-0.5">
                Puedes ver el detalle y el código de tu reserva en tu dashboard.
              </p>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
          <Button asChild size="lg" className="flex-1 gap-2">
            <Link to={ROUTES.ZONE}>
              {t("confirmation.cta")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
            <Link to={ROUTES.CLASSES}>Explorar más clases</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
