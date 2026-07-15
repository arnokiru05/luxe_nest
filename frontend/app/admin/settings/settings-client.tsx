"use client";

import { useState } from "react";
import { Plus, Trash2, Check, Save } from "lucide-react";

interface ShippingZone { name: string; rate: number }
interface Settings {
  storeName: string;
  paymentMethods: string[];
  paymentNotes: string;
  mpesaTillNumber: string;
  whatsappNumber: string;
  shippingZones: ShippingZone[];
  freeShippingOver: number | null;
}

const PAYMENT_OPTIONS = [
  { key: "MPESA",  label: "M-Pesa", description: "Mobile money transfer" },
  { key: "CASH",   label: "Cash",   description: "Cash on delivery" },
  { key: "OTHER",  label: "Other",  description: "Bank transfer / cheque" },
];

const inp = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20";

export function SettingsClient({ initialSettings }: { initialSettings: Settings | null }) {
  const defaults: Settings = {
    storeName: "Luxe Nest Household",
    paymentMethods: ["MPESA"],
    paymentNotes: "",
    mpesaTillNumber: "",
    whatsappNumber: "254769567516",
    shippingZones: [
      { name: "Eldoret", rate: 200 },
      { name: "Upcountry", rate: 500 },
    ],
    freeShippingOver: null,
  };

  const [settings, setSettings] = useState<Settings>(initialSettings ?? defaults);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newZone, setNewZone] = useState({ name: "", rate: "" });

  const togglePayment = (key: string) => {
    setSettings((s) => ({
      ...s,
      paymentMethods: s.paymentMethods.includes(key)
        ? s.paymentMethods.filter((m) => m !== key)
        : [...s.paymentMethods, key],
    }));
  };

  const addZone = () => {
    if (!newZone.name || !newZone.rate) return;
    setSettings((s) => ({
      ...s,
      shippingZones: [...s.shippingZones, { name: newZone.name, rate: parseFloat(newZone.rate) }],
    }));
    setNewZone({ name: "", rate: "" });
  };

  const removeZone = (idx: number) => {
    setSettings((s) => ({ ...s, shippingZones: s.shippingZones.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Save failed");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Store configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {saved ? <Check className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : loading ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">{error}</p>}

      {/* ── Store info ───────────────────────────────────────────────────── */}
      <section className="bg-white border rounded-xl divide-y">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Store Info</h2>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Store Name</label>
            <input
              className={inp}
              value={settings.storeName}
              onChange={(e) => setSettings((s) => ({ ...s, storeName: e.target.value }))}
            />
          </div>
        </div>
      </section>

      {/* ── Payment channels ─────────────────────────────────────────────── */}
      <section className="bg-white border rounded-xl divide-y">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Payment Channels</h2>
          <p className="text-xs text-gray-500 mt-0.5">Toggle which methods are available to customers at checkout</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          {PAYMENT_OPTIONS.map(({ key, label, description }) => {
            const active = settings.paymentMethods.includes(key);
            return (
              <label key={key} className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePayment(key)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${active ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-1 ${active ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </label>
            );
          })}
        </div>
        <div className="px-5 py-4 space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Payment Notes (shown at checkout)</label>
          <textarea
            className={`${inp} resize-none`}
            rows={2}
            placeholder="e.g. Send M-Pesa to 0712 345 678 — Luxe Nest"
            value={settings.paymentNotes ?? ""}
            onChange={(e) => setSettings((s) => ({ ...s, paymentNotes: e.target.value }))}
          />
        </div>
        <div className="px-5 py-4 space-y-3 border-t">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">M-Pesa Till Number</label>
            <input
              className={inp}
              placeholder="e.g. 000000"
              value={settings.mpesaTillNumber ?? ""}
              onChange={(e) => setSettings((s) => ({ ...s, mpesaTillNumber: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">WhatsApp Number (include country code)</label>
            <input
              className={inp}
              placeholder="e.g. 254769567516"
              value={settings.whatsappNumber ?? ""}
              onChange={(e) => setSettings((s) => ({ ...s, whatsappNumber: e.target.value }))}
            />
          </div>
        </div>
      </section>

      {/* ── Shipping rules ───────────────────────────────────────────────── */}
      <section className="bg-white border rounded-xl divide-y">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Shipping Rules</h2>
          <p className="text-xs text-gray-500 mt-0.5">Flat-rate zones shown to customers at checkout</p>
        </div>

        {/* Zones list */}
        <div className="px-5 py-4 space-y-2">
          {settings.shippingZones.length === 0 && (
            <p className="text-sm text-gray-400">No shipping zones yet.</p>
          )}
          {settings.shippingZones.map((zone, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                className={`${inp} flex-1`}
                value={zone.name}
                onChange={(e) => setSettings((s) => ({
                  ...s,
                  shippingZones: s.shippingZones.map((z, i) => i === idx ? { ...z, name: e.target.value } : z),
                }))}
                placeholder="Zone name"
              />
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-gray-500">KES</span>
                <input
                  type="number"
                  min="0"
                  className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  value={zone.rate}
                  onChange={(e) => setSettings((s) => ({
                    ...s,
                    shippingZones: s.shippingZones.map((z, i) => i === idx ? { ...z, rate: parseFloat(e.target.value) || 0 } : z),
                  }))}
                />
              </div>
              <button onClick={() => removeZone(idx)} className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add zone */}
          <div className="flex items-center gap-3 pt-1">
            <input
              className={`${inp} flex-1`}
              placeholder="New zone name (e.g. Eldoret)"
              value={newZone.name}
              onChange={(e) => setNewZone((z) => ({ ...z, name: e.target.value }))}
            />
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-gray-500">KES</span>
              <input
                type="number"
                min="0"
                className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                placeholder="0"
                value={newZone.rate}
                onChange={(e) => setNewZone((z) => ({ ...z, rate: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") addZone(); }}
              />
            </div>
            <button
              onClick={addZone}
              disabled={!newZone.name || !newZone.rate}
              className="p-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Free shipping threshold */}
        <div className="px-5 py-4 space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Free Shipping Threshold (optional)</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">KES</span>
            <input
              type="number"
              min="0"
              className="w-36 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              placeholder="e.g. 5000"
              value={settings.freeShippingOver ?? ""}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  freeShippingOver: e.target.value ? parseFloat(e.target.value) : null,
                }))
              }
            />
            <span className="text-xs text-gray-400">Leave blank to disable</span>
          </div>
        </div>
      </section>
    </div>
  );
}
