/**
 * BookingPage - unified offerings booking flow.
 * Route: /booking/:id (id can be slotId or offeringId).
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Calendar, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PageMeta from "@/components/seo/PageMeta";
import StepIndicator from "@/components/shared/StepIndicator";
import {
  useSlotById,
  useOfferingById,
  useOfferingSlots,
} from "@/hooks/useOfferings";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/hooks/useCurrency";
import { resolveField } from "@/lib/i18n-data";
import { formatDateTime } from "@/lib/dates";
import ROUTES from "@/constants/routes";

function parseQuestions(offering) {
  const questions = offering?.flow_config?.custom_answers;
  return Array.isArray(questions) ? questions : [];
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("booking");
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const slotQuery = useSlotById(id);
  const slotFromId = slotQuery.data ?? null;
  const offeringId =
    slotFromId?.offering_id ?? (!slotQuery.isLoading ? id : null);

  const offeringQuery = useOfferingById(offeringId);
  const offering = offeringQuery.data ?? null;

  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [customAnswers, setCustomAnswers] = useState({});
  const [dateRange, setDateRange] = useState({ checkin: "", checkout: "" });
  const [customerInfo, setCustomerInfo] = useState({
    firstName: user?.first_name ?? "",
    lastName: user?.last_name ?? "",
    email: user?.email ?? "",
    phone: "",
    notes: "",
  });
  const [step, setStep] = useState(1);

  const requiresSchedule = offering?.requires_schedule === true;
  const supportsDateRange = offering?.supports_date_range === true;

  const { data: slots = [], isLoading: loadingSlots } = useOfferingSlots(
    offering?.$id,
    {
      fromDate: new Date().toISOString(),
      status: "open",
    },
  );

  useEffect(() => {
    if (!offering) return;
    const minGuests = offering.min_guests ?? 1;
    setGuestCount((prev) => (prev < minGuests ? minGuests : prev));
  }, [offering]);

  useEffect(() => {
    if (slotFromId?.$id) {
      setSelectedSlotId(slotFromId.$id);
    }
  }, [slotFromId]);

  useEffect(() => {
    if (user) {
      setCustomerInfo((prev) => ({
        ...prev,
        firstName: prev.firstName || user.first_name || "",
        lastName: prev.lastName || user.last_name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const selectedSlot =
    slots.find((slot) => slot.$id === selectedSlotId) ?? slotFromId ?? null;
  const unitPrice = selectedSlot?.price_override ?? offering?.base_price ?? 0;
  const title = resolveField(offering, "title");
  const questions = parseQuestions(offering);
  const hasScheduleStep = requiresSchedule;
  const stepLabels = hasScheduleStep
    ? [t("steps.schedule"), t("steps.info"), t("step4.title")]
    : [t("steps.info"), t("step4.title")];

  if (slotQuery.isLoading || offeringQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-sage animate-spin" />
      </div>
    );
  }

  if (!offering) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-charcoal-muted">{t("errors.offeringNotFound")}</p>
        <Button asChild variant="outline">
          <Link to={ROUTES.SESSIONS}>{t("actions.backToOfferings")}</Link>
        </Button>
      </div>
    );
  }

  const maxGuests = Math.max(offering.max_guests ?? 1, offering.min_guests ?? 1);
  const minGuests = Math.max(1, offering.min_guests ?? 1);
  const isReviewStep = step === stepLabels.length;
  const isInfoStep = step === (hasScheduleStep ? 2 : 1);

  function goNext() {
    if (hasScheduleStep && step === 1 && !selectedSlotId) return;
    if (isInfoStep) {
      if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
        return;
      }
      if (!user) {
        navigate(`/register?redirect=/booking/${id}`);
        return;
      }
    }
    if (!isReviewStep) {
      setStep((prev) => prev + 1);
      return;
    }

    navigate(ROUTES.CHECKOUT, {
      state: {
        intentType: "offering_booking",
        offeringId: offering.$id,
        slotId: selectedSlotId || null,
        bookingType: offering.type,
        guestCount,
        unitPrice,
        requestData: {
          dateRange: supportsDateRange ? dateRange : null,
          notes: customerInfo.notes,
          sourcePath: location.pathname,
        },
        pricingSnapshot: {
          booking_mode: offering.booking_mode,
          pricing_mode: offering.pricing_mode,
          currency: offering.currency,
          unit_price: unitPrice,
        },
        customAnswers,
        items: [
          {
            id: selectedSlot?.$id ?? offering.$id,
            item_type: "offering",
            title,
            subtitle: selectedSlot ? formatDateTime(selectedSlot.start_at) : null,
            price: unitPrice,
            quantity: guestCount,
          },
        ],
      },
    });
  }

  function goBack() {
    if (step > 1) {
      setStep((prev) => prev - 1);
      return;
    }
    navigate(-1);
  }

  return (
    <>
      <PageMeta title={`${t("title")} - Omzone`} noindex />
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 min-h-[calc(100vh-4rem)]">
        <div className="mb-8">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common:actions.back")}
          </button>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-charcoal">
            {title}
          </h1>
        </div>

        <StepIndicator steps={stepLabels} current={step} className="mb-8 md:mb-12" />

        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          <div className="space-y-6">
            {hasScheduleStep && step === 1 && (
              <Card className="border-warm-gray-dark/40">
                <CardContent className="p-6 space-y-3">
                  <h2 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t("step1.title")}
                  </h2>
                  {loadingSlots ? (
                    <Loader2 className="w-5 h-5 animate-spin text-sage" />
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-charcoal-muted">
                      {t("step1.noSessions")}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.$id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.$id)}
                          className={`w-full text-left rounded-xl border p-3 transition ${
                            selectedSlotId === slot.$id
                              ? "border-sage bg-sage-muted/20"
                              : "border-warm-gray-dark/40 hover:border-sage/50"
                          }`}
                        >
                          <p className="text-sm font-medium text-charcoal">
                            {formatDateTime(slot.start_at)}
                          </p>
                          <p className="text-xs text-charcoal-muted mt-1">
                            {slot.location_label || offering.location_label || "-"}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isInfoStep && (
              <Card className="border-warm-gray-dark/40">
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>{t("step3.firstName")}</Label>
                      <Input value={customerInfo.firstName} onChange={(e) => setCustomerInfo((prev) => ({ ...prev, firstName: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("step3.lastName")}</Label>
                      <Input value={customerInfo.lastName} onChange={(e) => setCustomerInfo((prev) => ({ ...prev, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>{t("step3.email")}</Label>
                      <Input type="email" value={customerInfo.email} onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("step3.phone")}</Label>
                      <Input value={customerInfo.phone} onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t("detail.guests", { ns: "offerings" })}
                    </Label>
                    <Input
                      type="number"
                      min={minGuests}
                      max={maxGuests}
                      value={guestCount}
                      onChange={(e) =>
                        setGuestCount(
                          Math.min(maxGuests, Math.max(minGuests, Number(e.target.value) || minGuests)),
                        )
                      }
                    />
                  </div>

                  {supportsDateRange && !hasScheduleStep && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>{t("fields.checkIn")}</Label>
                        <Input type="date" value={dateRange.checkin} onChange={(e) => setDateRange((prev) => ({ ...prev, checkin: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("fields.checkOut")}</Label>
                        <Input type="date" value={dateRange.checkout} onChange={(e) => setDateRange((prev) => ({ ...prev, checkout: e.target.value }))} />
                      </div>
                    </div>
                  )}

                  {questions.length > 0 && (
                    <div className="space-y-3">
                      {questions.map((question, index) => {
                        const key = question.key || `q_${index}`;
                        const label = question.label_es || question.label_en || key;
                        return (
                          <div key={key} className="space-y-1.5">
                            <Label>{label}</Label>
                            <Input value={customAnswers[key] ?? ""} onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [key]: e.target.value }))} />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label>{t("fields.notes")}</Label>
                    <Textarea value={customerInfo.notes} onChange={(e) => setCustomerInfo((prev) => ({ ...prev, notes: e.target.value }))} />
                  </div>
                </CardContent>
              </Card>
            )}

            {isReviewStep && (
              <Card className="border-warm-gray-dark/40">
                <CardContent className="p-6 space-y-3">
                  <h2 className="text-lg font-semibold text-charcoal">{t("step4.title")}</h2>
                  <p className="text-sm text-charcoal-muted">{title}</p>
                  {selectedSlot && (
                    <p className="text-sm text-charcoal-muted">
                      {formatDateTime(selectedSlot.start_at)}
                    </p>
                  )}
                  <p className="text-sm text-charcoal-muted">
                    {t("review.guests", { count: guestCount })}
                  </p>
                  <p className="text-lg font-semibold text-sage">
                    {formatPrice(unitPrice * guestCount, offering.currency)}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
                {t("common:actions.back")}
              </Button>
              <Button onClick={goNext}>
                {isReviewStep ? t("step4.proceedToPayment") : t("common:actions.next")}
                {!isReviewStep && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Card className="border-warm-gray-dark/40">
            <CardContent className="p-5 space-y-2">
              <p className="text-sm font-semibold text-charcoal">{title}</p>
              <p className="text-xs text-charcoal-muted">
                {offering.location_label || "-"}
              </p>
              <p className="text-sm text-charcoal-muted">
                {formatPrice(unitPrice, offering.currency)} x {guestCount}
              </p>
              <p className="text-lg font-bold text-sage">
                {formatPrice(unitPrice * guestCount, offering.currency)}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
