import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSubmitContact } from "@/hooks/useContact";
import { useAuth } from "@/hooks/useAuth";

const INITIAL = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactFormSection() {
  const { t } = useTranslation("landing");
  const { user } = useAuth();
  const isClient = user && user.role_key === "client";

  const [form, setForm] = useState(INITIAL);
  const [sent, setSent] = useState(false);
  const submit = useSubmitContact();

  // Pre-fill when a logged-in client exists
  useEffect(() => {
    if (isClient) {
      setForm((prev) => ({
        ...prev,
        fullName: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [isClient, user?.full_name, user?.email, user?.phone]);

  function set(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    submit.mutate(form, {
      onSuccess: () => {
        setSent(true);
        setForm((prev) =>
          isClient
            ? { ...prev, subject: "", message: "" }
            : INITIAL,
        );
        toast.success(t("contact_form.success"));
      },
      onError: (err) => {
        const msg = err?.message?.includes("Too many")
          ? t("contact_form.rateLimited")
          : t("contact_form.error");
        toast.error(msg);
      },
    });
  }

  return (
    <section
      aria-labelledby="contact-heading"
      className="bg-cream py-20 md:py-28"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2
            id="contact-heading"
            className="font-display text-3xl md:text-4xl font-semibold text-charcoal mb-3"
          >
            {t("contact_form.title")}
          </h2>
          <p className="text-charcoal-muted text-base max-w-md mx-auto">
            {t("contact_form.subtitle")}
          </p>
        </div>

        {/* Success state */}
        {sent ? (
          <div className="text-center py-12 animate-fade-in-up">
            <CheckCircle className="w-12 h-12 text-sage mx-auto mb-4" />
            <p className="text-lg font-semibold text-charcoal mb-1">
              {t("contact_form.success")}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setSent(false)}
            >
              {t("contact_form.submit")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name + Email row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact-name">
                  {t("contact_form.fields.fullName")}
                </Label>
                <Input
                  id="contact-name"
                  value={form.fullName}
                  onChange={set("fullName")}
                  placeholder={t("contact_form.placeholders.fullName")}
                  required
                  minLength={2}
                  maxLength={120}
                  readOnly={isClient}
                  className={isClient ? "bg-warm-gray/40 text-charcoal-muted cursor-not-allowed" : ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-email">
                  {t("contact_form.fields.email")}
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder={t("contact_form.placeholders.email")}
                  required
                  readOnly={isClient}
                  className={isClient ? "bg-warm-gray/40 text-charcoal-muted cursor-not-allowed" : ""}
                />
              </div>
            </div>

            {/* Phone + Subject row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact-phone">
                  {t("contact_form.fields.phone")}
                </Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder={t("contact_form.placeholders.phone")}
                  maxLength={20}
                  readOnly={isClient && !!form.phone}
                  className={isClient && form.phone ? "bg-warm-gray/40 text-charcoal-muted cursor-not-allowed" : ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-subject">
                  {t("contact_form.fields.subject")}
                </Label>
                <Input
                  id="contact-subject"
                  value={form.subject}
                  onChange={set("subject")}
                  placeholder={t("contact_form.placeholders.subject")}
                  maxLength={200}
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label htmlFor="contact-message">
                {t("contact_form.fields.message")}
              </Label>
              <textarea
                id="contact-message"
                value={form.message}
                onChange={set("message")}
                placeholder={t("contact_form.placeholders.message")}
                required
                minLength={10}
                maxLength={4000}
                rows={5}
                className={cn(
                  "flex w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm",
                  "placeholder:text-charcoal-subtle/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30 focus-visible:border-sage/50",
                  "transition-colors duration-200 resize-y",
                )}
              />
            </div>

            {/* Honeypot — hidden field to catch bots */}
            <div aria-hidden="true" className="absolute -left-[9999px]">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={submit.isPending}
                className="gap-2 min-w-48"
              >
                {submit.isPending ? (
                  t("contact_form.sending")
                ) : (
                  <>
                    {t("contact_form.submit")}
                    <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
