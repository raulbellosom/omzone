/**
 * CheckoutPage - checkout for offerings booking.
 * Route: /checkout
 * Expects location.state from BookingPage with intentType='offering_booking'.
 */
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  CreditCard,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import PageMeta from "@/components/seo/PageMeta";
import {
  createOrder,
  confirmOrder,
  createOfferingBooking,
} from "@/services/appwrite/customerService";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useCurrency } from "@/hooks/useCurrency";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

function fmtCard(v) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function fmtExp(v) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
}

function validateForm(billing, card, tv) {
  const b = {};
  const c = {};

  if (!billing.firstName.trim()) b.firstName = tv("required");
  if (!billing.lastName.trim()) b.lastName = tv("required");
  if (!billing.email.trim()) b.email = tv("required");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email)) {
    b.email = tv("email");
  }

  if (!card.holder.trim()) c.holder = tv("required");
  if (card.number.replace(/\s/g, "").length < 16) c.number = tv("cardNumber");
  if (!/^\d{2} \/ \d{2}$/.test(card.expiry)) c.expiry = tv("expiry");
  if (card.cvv.length < 3) c.cvv = tv("cvv");

  return Object.keys(b).length || Object.keys(c).length ? { b, c } : null;
}

function OrderSummary({ items, t }) {
  const { formatPrice } = useCurrency();
  const total = items.reduce(
    (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 1),
    0,
  );

  return (
    <aside className="lg:sticky lg:top-24 space-y-4">
      <Card className="overflow-hidden">
        <div
          className="h-1.5 bg-linear-to-r from-sage to-olive"
          aria-hidden="true"
        />
        <CardContent className="p-5">
          <h3 className="font-semibold text-charcoal mb-4">{t("orderSummary")}</h3>
          <ul className="space-y-3 pb-4 border-b border-warm-gray-dark/50">
            {items.map((item, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div className="flex-1">
                  <p className="font-medium text-charcoal leading-tight">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-xs text-charcoal-muted mt-0.5 line-clamp-2">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <span className="font-semibold text-charcoal shrink-0">
                  {formatPrice(
                    Number(item.price ?? 0) * Number(item.quantity ?? 1) || 0,
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center pt-4">
            <span className="font-bold text-charcoal">{t("total")}</span>
            <span className="text-xl font-bold text-sage font-display">
              {formatPrice(total)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2 px-1">
        {[
          [Lock, t("trust.secure")],
          [ShieldCheck, t("trust.privacy")],
          [Headphones, t("trust.support")],
        ].map(([Icon, label]) => (
          <p
            key={label}
            className="flex items-center gap-2 text-xs text-charcoal-muted"
          >
            <Icon className="w-4 h-4 text-sage shrink-0" />
            {label}
          </p>
        ))}
      </div>
    </aside>
  );
}

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation("checkout");
  const tv = (k) => t(k, { ns: "validation" });
  const { user } = useAuth();
  const state = location.state ?? {};

  const intentType =
    state.intentType === "offering_booking" && Array.isArray(state.items)
      ? "offering_booking"
      : null;
  const items = intentType ? state.items ?? [] : [];

  const [billing, setBilling] = useState({
    firstName: state.customerInfo?.firstName ?? user?.first_name ?? "",
    lastName: state.customerInfo?.lastName ?? user?.last_name ?? "",
    email: state.customerInfo?.email ?? user?.email ?? "",
    phone: state.customerInfo?.phone ?? "",
  });
  const [card, setCard] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [promoCode, setPromoCode] = useState("");
  const [promoState, setPromoState] = useState(null);
  const [errs, setErrs] = useState({ b: {}, c: {} });
  const [submitting, setSubmitting] = useState(false);

  function onBilling(k, v) {
    setBilling((p) => ({ ...p, [k]: v }));
    if (errs.b[k]) setErrs((p) => ({ ...p, b: { ...p.b, [k]: undefined } }));
  }

  function onCard(k, v) {
    setCard((p) => ({ ...p, [k]: v }));
    if (errs.c[k]) setErrs((p) => ({ ...p, c: { ...p.c, [k]: undefined } }));
  }

  function applyPromo() {
    setPromoState(promoCode.toUpperCase() === "OMZONE20" ? "applied" : "invalid");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!state.offeringId) {
      return;
    }

    const validation = validateForm(billing, card, tv);
    if (validation) {
      setErrs(validation);
      return;
    }

    setSubmitting(true);
    try {
      const total = items.reduce(
        (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 1),
        0,
      );

      const order = await createOrder({
        items,
        customer_email: billing.email,
        grand_total: total,
        intent: "offering_booking",
        user_id: user?.$id,
      });

      await confirmOrder(order.$id);

      await createOfferingBooking({
        offering_id: state.offeringId,
        slot_id: state.slotId ?? null,
        order_id: order.$id,
        booking_type: state.bookingType ?? null,
        guest_count: state.guestCount ?? 1,
        unit_price: state.unitPrice ?? null,
        extras_json: state.extrasJson ?? null,
        request_data: {
          customer_info: billing,
          source: "checkout",
          ...state.requestData,
        },
        pricing_snapshot: state.pricingSnapshot ?? null,
        custom_answers: state.customAnswers ?? null,
      });

      navigate(ROUTES.CHECKOUT_CONFIRMATION, {
        replace: true,
        state: {
          orderNo: order.order_no,
          email: billing.email,
          items,
          total,
          intentType: "offering_booking",
        },
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!intentType) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-charcoal-muted">{t("empty.noActiveOrder")}</p>
        <Button asChild variant="outline">
          <Link to={ROUTES.SESSIONS}>{t("empty.exploreOfferings")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${t("title")} - Omzone`}
        description={t("meta.description")}
        noindex
      />
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 min-h-[calc(100vh-4rem)]">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> {t("common:actions.back")}
          </button>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-charcoal">
            {t("title")}
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            <div className="space-y-6">
              <section className="bg-white rounded-2xl border border-warm-gray-dark/40 p-6 shadow-card space-y-4">
                <h3 className="font-semibold text-charcoal">{t("billing.title")}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      k: "firstName",
                      label: t("billing.firstName"),
                      ac: "given-name",
                    },
                    {
                      k: "lastName",
                      label: t("billing.lastName"),
                      ac: "family-name",
                    },
                  ].map(({ k, label, ac }) => (
                    <div key={k}>
                      <Label htmlFor={`b-${k}`}>{label}</Label>
                      <Input
                        id={`b-${k}`}
                        value={billing[k]}
                        onChange={(e) => onBilling(k, e.target.value)}
                        autoComplete={ac}
                        className={cn(
                          "mt-1.5",
                          errs.b[k] && "border-red-400 focus:border-red-400",
                        )}
                      />
                      {errs.b[k] && (
                        <p className="text-xs text-red-500 mt-1 animate-fade-in">
                          {errs.b[k]}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <Label htmlFor="b-email">{t("billing.email")}</Label>
                    <Input
                      id="b-email"
                      type="email"
                      value={billing.email}
                      onChange={(e) => onBilling("email", e.target.value)}
                      autoComplete="email"
                      className={cn(
                        "mt-1.5",
                        errs.b.email && "border-red-400 focus:border-red-400",
                      )}
                    />
                    {errs.b.email && (
                      <p className="text-xs text-red-500 mt-1 animate-fade-in">
                        {errs.b.email}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-warm-gray-dark/40 p-6 shadow-card space-y-4">
                <h3 className="font-semibold text-charcoal flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sage" aria-hidden="true" />
                  {t("payment.title")}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {["VISA", "MC", "AMEX"].map((n) => (
                    <span
                      key={n}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-warm-gray-dark/40 text-charcoal-muted"
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="c-holder">{t("payment.cardHolder")}</Label>
                    <Input
                      id="c-holder"
                      value={card.holder}
                      onChange={(e) => onCard("holder", e.target.value)}
                      className={cn(
                        "mt-1.5",
                        errs.c.holder && "border-red-400 focus:border-red-400",
                      )}
                    />
                    {errs.c.holder && (
                      <p className="text-xs text-red-500 mt-1">{errs.c.holder}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="c-number">{t("payment.cardNumber")}</Label>
                    <Input
                      id="c-number"
                      inputMode="numeric"
                      value={card.number}
                      onChange={(e) => onCard("number", fmtCard(e.target.value))}
                      className={cn(
                        "mt-1.5",
                        errs.c.number && "border-red-400 focus:border-red-400",
                      )}
                    />
                    {errs.c.number && (
                      <p className="text-xs text-red-500 mt-1">{errs.c.number}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="c-expiry">{t("payment.expiry")}</Label>
                      <Input
                        id="c-expiry"
                        inputMode="numeric"
                        value={card.expiry}
                        onChange={(e) => onCard("expiry", fmtExp(e.target.value))}
                        className={cn(
                          "mt-1.5",
                          errs.c.expiry && "border-red-400 focus:border-red-400",
                        )}
                      />
                      {errs.c.expiry && (
                        <p className="text-xs text-red-500 mt-1">{errs.c.expiry}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="c-cvv">{t("payment.cvv")}</Label>
                      <Input
                        id="c-cvv"
                        inputMode="numeric"
                        type="password"
                        value={card.cvv}
                        onChange={(e) =>
                          onCard("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        className={cn(
                          "mt-1.5",
                          errs.c.cvv && "border-red-400 focus:border-red-400",
                        )}
                      />
                      {errs.c.cvv && (
                        <p className="text-xs text-red-500 mt-1">{errs.c.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-warm-gray-dark/40 p-6 shadow-card space-y-3">
                <h3 className="font-semibold text-charcoal">
                  {t("promoCode.label")}
                </h3>
                <div className="flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t("promoCode.placeholder")}
                  />
                  <Button type="button" variant="outline" onClick={applyPromo}>
                    {t("promoCode.apply")}
                  </Button>
                </div>
                {promoState === "applied" && (
                  <p className="text-xs text-sage">{t("promoCode.applied")}</p>
                )}
                {promoState === "invalid" && (
                  <p className="text-xs text-red-500">{t("promoCode.invalid")}</p>
                )}
              </section>

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? t("processing") : t("submit")}
                </Button>
              </div>
            </div>

            <OrderSummary items={items} t={t} />
          </div>
        </form>
      </main>
    </>
  );
}
