/**
 * BookingPage - offering booking with multi-engine support.
 * Route: /booking/:id (eventId or offeringId).
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
  useOfferingDailyInventory,
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

function deriveEngine(offering) {
  const explicit = offering?.booking_engine || offering?.flow_config?.booking?.engine;
  if (explicit) return explicit;
  if (offering?.booking_mode === "scheduled") return "events";
  if (offering?.booking_mode === "date_range") return "daily_range";
  return "daily_range";
}

function listEngines(offering) {
  const engine = deriveEngine(offering);
  if (engine === "hybrid") return ["events", "daily_range"];
  return [engine];
}

function toIsoDateStart(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toIsoDateEndExclusive(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString();
}

function enumerateDates(checkin, checkout) {
  const start = new Date(`${checkin}T00:00:00Z`);
  const end = new Date(`${checkout}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return [];
  }
  const dates = [];
  const cursor = new Date(start);
  while (cursor < end) {
    dates.push(new Date(cursor).toISOString());
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation("booking");
  const { t: tOff } = useTranslation("offerings");
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const eventQuery = useSlotById(id);
  const eventFromId = eventQuery.data ?? null;
  const offeringId = eventFromId?.offering_id ?? (!eventQuery.isLoading ? id : null);

  const offeringQuery = useOfferingById(offeringId);
  const offering = offeringQuery.data ?? null;

  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedEngine, setSelectedEngine] = useState("events");
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

  const fromDate = useMemo(() => new Date().toISOString(), []);
  const { data: events = [], isLoading: loadingEvents } = useOfferingSlots(offering?.$id, {
    fromDate,
    status: "open",
  });

  const inventoryFrom = toIsoDateStart(dateRange.checkin);
  const inventoryTo = toIsoDateEndExclusive(dateRange.checkout);
  const { data: dailyInventory = [], isLoading: loadingInventory } = useOfferingDailyInventory(
    offering?.$id,
    {
      fromDate: inventoryFrom ?? undefined,
      toDate: inventoryTo ?? undefined,
      onlyOpen: true,
      limit: 500,
    },
  );

  useEffect(() => {
    if (!offering) return;
    const engines = listEngines(offering);
    setSelectedEngine((prev) => (engines.includes(prev) ? prev : engines[0]));
  }, [offering]);

  useEffect(() => {
    if (!offering) return;
    const minGuests = offering.min_guests ?? 1;
    setGuestCount((prev) => (prev < minGuests ? minGuests : prev));
  }, [offering]);

  useEffect(() => {
    if (eventFromId?.$id) setSelectedEventId(eventFromId.$id);
  }, [eventFromId]);

  useEffect(() => {
    if (!user) return;
    setCustomerInfo((prev) => ({
      ...prev,
      firstName: prev.firstName || user.first_name || "",
      lastName: prev.lastName || user.last_name || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  const availableEngines = offering ? listEngines(offering) : ["events"];
  const hasEngineChoice = availableEngines.length > 1;
  const usesEvents = selectedEngine === "events";
  const selectedEvent = events.find((item) => item.$id === selectedEventId) ?? eventFromId ?? null;

  const rangeDates = useMemo(() => {
    if (!dateRange.checkin || !dateRange.checkout) return [];
    return enumerateDates(dateRange.checkin, dateRange.checkout);
  }, [dateRange]);

  const inventoryByDate = useMemo(
    () => Object.fromEntries(dailyInventory.map((row) => [new Date(row.date).toISOString(), row])),
    [dailyInventory],
  );

  const rangeValid = useMemo(() => {
    if (selectedEngine !== "daily_range") return true;
    if (rangeDates.length === 0) return false;
    return rangeDates.every((iso) => {
      const row = inventoryByDate[iso];
      return row && row.enabled !== false && row.status !== "blocked" && row.status !== "closed";
    });
  }, [selectedEngine, rangeDates, inventoryByDate]);

  const nights = rangeDates.length;
  const rangeUnitPrice = useMemo(() => {
    if (!rangeValid) return 0;
    return rangeDates.reduce((sum, iso) => sum + Number(inventoryByDate[iso]?.unit_price ?? 0), 0);
  }, [rangeDates, inventoryByDate, rangeValid]);

  const eventUnitPrice = selectedEvent?.unit_price ?? selectedEvent?.price_override ?? offering?.base_price ?? 0;
  const unitPrice = usesEvents ? eventUnitPrice : rangeUnitPrice;

  const title = resolveField(offering, "title");
  const questions = parseQuestions(offering);
  const isSpanish = i18n.language.startsWith("es");
  const stepLabels = [t("steps.schedule"), t("steps.info"), t("step4.title")];
  const formatRangeSummary = (checkin, checkout, nightsCount = 0) => {
    const base = t("summary.range", {
      from: checkin || t("fields.datePlaceholder"),
      to: checkout || t("fields.datePlaceholder"),
    });
    return nightsCount > 0
      ? `${base} (${t("summary.nights", { count: nightsCount })})`
      : base;
  };

  if (eventQuery.isLoading || offeringQuery.isLoading) {
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
        <Button asChild variant="outline"><Link to={ROUTES.SESSIONS}>{t("actions.backToOfferings")}</Link></Button>
      </div>
    );
  }

  const maxGuests = Math.max(offering.max_guests ?? 1, offering.min_guests ?? 1);
  const minGuests = Math.max(1, offering.min_guests ?? 1);
  const isSelectionStep = step === 1;
  const isInfoStep = step === 2;
  const isReviewStep = step === 3;

  function goNext() {
    if (isSelectionStep) {
      if (usesEvents && !selectedEventId) return;
      if (!usesEvents && !rangeValid) return;
    }
    if (isInfoStep) {
      if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) return;
      if (!user) {
        navigate(`/register?redirect=/booking/${id}`);
        return;
      }
    }
    if (!isReviewStep) {
      setStep((prev) => prev + 1);
      return;
    }

    const itemTotalPrice = usesEvents ? unitPrice : rangeUnitPrice;
    navigate(ROUTES.CHECKOUT, {
      state: {
        intentType: "offering_booking",
        offeringId: offering.$id,
        eventId: usesEvents ? selectedEventId : null,
        slotId: usesEvents ? selectedEventId : null,
        bookingEngine: selectedEngine,
        checkInDate: usesEvents ? null : dateRange.checkin,
        checkOutDate: usesEvents ? null : dateRange.checkout,
        nights: usesEvents ? null : nights,
        bookingType: offering.type,
        guestCount,
        unitPrice: itemTotalPrice,
        requestData: {
          dateRange: usesEvents ? null : dateRange,
          notes: customerInfo.notes,
          sourcePath: location.pathname,
        },
        pricingSnapshot: {
          booking_mode: offering.booking_mode,
          booking_engine: selectedEngine,
          pricing_mode: offering.pricing_mode,
          currency: offering.currency,
          unit_price: itemTotalPrice,
        },
        customAnswers,
        items: [
          {
            id: usesEvents ? selectedEvent?.$id ?? offering.$id : offering.$id,
            item_type: "offering",
            title,
            subtitle: usesEvents
              ? (selectedEvent ? formatDateTime(selectedEvent.start_at) : null)
              : formatRangeSummary(dateRange.checkin, dateRange.checkout, nights),
            price: itemTotalPrice,
            quantity: usesEvents ? guestCount : 1,
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
          <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            {t("common:actions.back")}
          </button>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-charcoal">{title}</h1>
        </div>

        <StepIndicator steps={stepLabels} current={step} className="mb-8 md:mb-12" />

        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          <div className="space-y-6">
            {isSelectionStep && (
              <Card className="border-warm-gray-dark/40"><CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold text-charcoal flex items-center gap-2"><Calendar className="w-4 h-4" />{t("step1.title")}</h2>

                {hasEngineChoice && (
                  <div className="flex flex-wrap gap-2">
                    {availableEngines.map((engine) => (
                      <Button key={engine} type="button" variant={selectedEngine === engine ? "default" : "outline"} size="sm" onClick={() => setSelectedEngine(engine)}>
                        {tOff(`bookingEngine.${engine}`)}
                      </Button>
                    ))}
                  </div>
                )}

                {usesEvents ? (
                  loadingEvents ? (
                    <Loader2 className="w-5 h-5 animate-spin text-sage" />
                  ) : events.length === 0 ? (
                    <p className="text-sm text-charcoal-muted">
                      {t("availability.noFutureEvents")}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {events.map((event) => (
                        <button
                          key={event.$id}
                          type="button"
                          onClick={() => setSelectedEventId(event.$id)}
                          className={`w-full text-left rounded-xl border p-3 transition ${selectedEventId === event.$id ? "border-sage bg-sage-muted/20" : "border-warm-gray-dark/40 hover:border-sage/50"}`}
                        >
                          <p className="text-sm font-medium text-charcoal">{event.title || formatDateTime(event.start_at)}</p>
                          <p className="text-xs text-charcoal-muted mt-1">{formatDateTime(event.start_at)}{event.location_label ? ` · ${event.location_label}` : ""}</p>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5"><Label>{t("fields.checkIn")}</Label><Input type="date" value={dateRange.checkin} onChange={(e) => setDateRange((p) => ({ ...p, checkin: e.target.value }))} /></div>
                      <div className="space-y-1.5"><Label>{t("fields.checkOut")}</Label><Input type="date" value={dateRange.checkout} onChange={(e) => setDateRange((p) => ({ ...p, checkout: e.target.value }))} /></div>
                    {loadingInventory && <p className="text-xs text-charcoal-muted md:col-span-2">{t("availability.validating")}</p>}
                    {!loadingInventory && dateRange.checkin && dateRange.checkout && (
                      <p className={`text-xs md:col-span-2 ${rangeValid ? "text-sage" : "text-red-500"}`}>
                        {rangeValid
                          ? t("availability.rangeAvailable", { count: nights })
                          : t("availability.rangeUnavailable")}
                      </p>
                    )}
                  </div>
                )}
              </CardContent></Card>
            )}

            {isInfoStep && (
              <Card className="border-warm-gray-dark/40"><CardContent className="p-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2"><div className="space-y-1.5"><Label>{t("step3.firstName")}</Label><Input value={customerInfo.firstName} onChange={(e) => setCustomerInfo((p) => ({ ...p, firstName: e.target.value }))} /></div><div className="space-y-1.5"><Label>{t("step3.lastName")}</Label><Input value={customerInfo.lastName} onChange={(e) => setCustomerInfo((p) => ({ ...p, lastName: e.target.value }))} /></div></div>
                <div className="grid gap-4 md:grid-cols-2"><div className="space-y-1.5"><Label>{t("step3.email")}</Label><Input type="email" value={customerInfo.email} onChange={(e) => setCustomerInfo((p) => ({ ...p, email: e.target.value }))} /></div><div className="space-y-1.5"><Label>{t("step3.phone")}</Label><Input value={customerInfo.phone} onChange={(e) => setCustomerInfo((p) => ({ ...p, phone: e.target.value }))} /></div></div>
                <div className="space-y-1.5"><Label className="flex items-center gap-2"><Users className="w-4 h-4" />{t("detail.guests", { ns: "offerings" })}</Label><Input type="number" min={minGuests} max={maxGuests} value={guestCount} onChange={(e) => setGuestCount(Math.min(maxGuests, Math.max(minGuests, Number(e.target.value) || minGuests)))} /></div>
                {questions.length > 0 && (
                  <div className="space-y-3">
                    {questions.map((q, i) => {
                      const key = q.key || `q_${i}`;
                      const label = isSpanish
                        ? q.label_es || q.label_en || key
                        : q.label_en || q.label_es || key;
                      return (
                        <div key={key} className="space-y-1.5">
                          <Label>{label}</Label>
                          <Input
                            value={customAnswers[key] ?? ""}
                            onChange={(e) =>
                              setCustomAnswers((p) => ({
                                ...p,
                                [key]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="space-y-1.5"><Label>{t("fields.notes")}</Label><Textarea value={customerInfo.notes} onChange={(e) => setCustomerInfo((p) => ({ ...p, notes: e.target.value }))} /></div>
              </CardContent></Card>
            )}

            {isReviewStep && (
              <Card className="border-warm-gray-dark/40"><CardContent className="p-6 space-y-3">
                <h2 className="text-lg font-semibold text-charcoal">{t("step4.title")}</h2>
                <p className="text-sm text-charcoal-muted">{title}</p>
                {usesEvents && selectedEvent && <p className="text-sm text-charcoal-muted">{formatDateTime(selectedEvent.start_at)}</p>}
                {!usesEvents && <p className="text-sm text-charcoal-muted">{formatRangeSummary(dateRange.checkin, dateRange.checkout, nights)}</p>}
                <p className="text-sm text-charcoal-muted">{t("review.guests", { count: guestCount })}</p>
                <p className="text-lg font-semibold text-sage">{formatPrice(usesEvents ? unitPrice * guestCount : unitPrice, offering.currency)}</p>
              </CardContent></Card>
            )}

            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={goBack}><ArrowLeft className="w-4 h-4" />{t("common:actions.back")}</Button>
              <Button onClick={goNext}>{isReviewStep ? t("step4.proceedToPayment") : t("common:actions.next")}{!isReviewStep && <ArrowRight className="w-4 h-4" />}</Button>
            </div>
          </div>

          <Card className="border-warm-gray-dark/40"><CardContent className="p-5 space-y-2">
            <p className="text-sm font-semibold text-charcoal">{title}</p>
            <p className="text-xs text-charcoal-muted">
              {usesEvents
                ? (selectedEvent?.location_label || offering.location_label || t("fields.notAvailable"))
                : formatRangeSummary(dateRange.checkin, dateRange.checkout)}
            </p>
            <p className="text-sm text-charcoal-muted">
              {usesEvents
                ? t("summary.pricePerGuests", {
                    price: formatPrice(unitPrice, offering.currency),
                    count: guestCount,
                  })
                : t("summary.nights", { count: nights || 0 })}
            </p>
            <p className="text-lg font-bold text-sage">{formatPrice(usesEvents ? unitPrice * guestCount : unitPrice, offering.currency)}</p>
          </CardContent></Card>
        </div>
      </main>
    </>
  );
}

