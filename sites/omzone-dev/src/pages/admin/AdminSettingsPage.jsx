/**
 * AdminSettingsPage — configuración del estudio.
 * Ruta: /app/settings
 * Modo real: persiste en app_settings (Appwrite) vía useAppSettings / useUpsertAppSettings.
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSettings, useUpsertAppSettings } from "@/hooks/useAdmin";
import AdminPageHeader from "@/components/shared/AdminPageHeader";
import SearchCombobox from "@/components/shared/SearchCombobox";
import { CURRENCY_OPTIONS } from "@/lib/currency";

const TIMEZONES = [
  {
    value: "America/Mexico_City",
    label: "America/Mexico_City (CDMX, Monterrey)",
  },
  { value: "America/Cancun", label: "America/Cancun (Cancún, Q. Roo)" },
  {
    value: "America/Chihuahua",
    label: "America/Chihuahua (Chihuahua, Culiacán)",
  },
  { value: "America/Tijuana", label: "America/Tijuana (Tijuana, Mexicali)" },
  { value: "America/Bogota", label: "America/Bogota (Colombia)" },
  { value: "America/Lima", label: "America/Lima (Perú)" },
  { value: "America/Santiago", label: "America/Santiago (Chile)" },
  { value: "America/Buenos_Aires", label: "America/Buenos_Aires (Argentina)" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (Brasil)" },
  { value: "America/Caracas", label: "America/Caracas (Venezuela)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "Europe/Madrid", label: "Europe/Madrid (España)" },
  { value: "Europe/London", label: "Europe/London (Reino Unido)" },
  { value: "UTC", label: "UTC" },
];

const LANGUAGE_OPTIONS = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

const EMPTY_SETTINGS = {
  studioName: "",
  address: "",
  phone: "",
  email: "",
  instagram: "",
  website: "",
  timezone: "",
  currency: "MXN",
  defaultLang: "es",
};

function SettingsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <div className="mb-6">
        <Skeleton className="h-7 w-64" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-5 w-40" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-10 sm:col-span-2" />
                <Skeleton className="h-10 sm:col-span-2" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            </CardContent>
          </Card>
        ))}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-charcoal-muted">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        className="text-sm"
      />
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <h3 className="font-semibold text-charcoal text-sm pb-3 mb-4 border-b border-warm-gray-dark/20">
      {title}
    </h3>
  );
}

export default function AdminSettingsPage() {
  const { t } = useTranslation("admin");
  const [settings, setSettings] = useState(EMPTY_SETTINGS);

  const { data: remoteSettings, isLoading } = useAppSettings();
  const upsertSettings = useUpsertAppSettings();

  // Seed form from Appwrite when loaded
  useEffect(() => {
    if (remoteSettings) {
      setSettings((s) => ({
        ...s,
        studioName: remoteSettings.appName ?? s.studioName,
        address: remoteSettings.address ?? s.address,
        email: remoteSettings.supportEmail ?? s.email,
        phone: remoteSettings.contactPhone ?? s.phone,
        instagram: remoteSettings.instagram ?? s.instagram,
        website: remoteSettings.website ?? s.website,
        timezone: remoteSettings.timezone ?? s.timezone,
        currency: remoteSettings.defaultCurrency ?? s.currency,
        defaultLang: remoteSettings.defaultLocale ?? s.defaultLang,
      }));
    }
  }, [remoteSettings]);

  function set(key) {
    return (value) => setSettings((s) => ({ ...s, [key]: value }));
  }

  function handleSave() {
    upsertSettings.mutate(
      {
        app_name: settings.studioName,
        address: settings.address,
        support_email: settings.email,
        contact_phone: settings.phone,
        instagram: settings.instagram,
        website: settings.website,
        timezone: settings.timezone,
        default_currency: settings.currency,
        default_locale: settings.defaultLang,
      },
      {
        onSuccess: () => toast.success(t("settings.saved")),
        onError: () => toast.error("Error al guardar"),
      },
    );
  }

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
      <AdminPageHeader title={t("settings.title")} />

      <div className="space-y-6">
        {/* Studio info */}
        <Card>
          <CardContent className="p-6">
            <SectionHeader title={t("settings.studio")} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field
                  label={t("settings.fields.studioName")}
                  value={settings.studioName}
                  onChange={set("studioName")}
                />
              </div>
              <div className="sm:col-span-2">
                <Field
                  label={t("settings.fields.address")}
                  value={settings.address}
                  onChange={set("address")}
                />
              </div>
              <Field
                label={t("settings.fields.phone")}
                value={settings.phone}
                onChange={set("phone")}
                type="tel"
              />
              <Field
                label={t("settings.fields.email")}
                value={settings.email}
                onChange={set("email")}
                type="email"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social */}
        <Card>
          <CardContent className="p-6">
            <SectionHeader title={t("settings.branding")} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label={t("settings.fields.instagram")}
                value={settings.instagram}
                onChange={set("instagram")}
              />
              <Field
                label={t("settings.fields.website")}
                value={settings.website}
                onChange={set("website")}
                type="url"
              />
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card>
          <CardContent className="p-6">
            <SectionHeader title={t("settings.localization")} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Timezone */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-charcoal-muted">
                  {t("settings.fields.timezone")}
                </Label>
                <SearchCombobox
                  value={settings.timezone}
                  onValueChange={set("timezone")}
                  options={TIMEZONES}
                  placeholder={t("settings.fields.timezone")}
                  searchPlaceholder={t("common.search")}
                  emptyMessage={t("common.noData")}
                />
              </div>

              {/* Currency */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-charcoal-muted">
                  {t("settings.fields.currency")}
                </Label>
                <SearchCombobox
                  value={settings.currency}
                  onValueChange={set("currency")}
                  options={CURRENCY_OPTIONS}
                  placeholder={t("settings.fields.currency")}
                  searchPlaceholder={t("common.search")}
                  emptyMessage={t("common.noData")}
                />
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-charcoal-muted">
                  {t("settings.fields.defaultLang")}
                </Label>
                <SearchCombobox
                  value={settings.defaultLang}
                  onValueChange={set("defaultLang")}
                  options={LANGUAGE_OPTIONS}
                  placeholder={t("settings.fields.defaultLang")}
                  searchPlaceholder={t("common.search")}
                  emptyMessage={t("common.noData")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={upsertSettings.isPending}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {upsertSettings.isPending
              ? t("settings.saving")
              : t("settings.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
