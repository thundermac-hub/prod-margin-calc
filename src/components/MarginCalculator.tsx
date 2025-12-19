import { useMemo, useState } from "react";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";

const DEFAULT_CURRENCY = "RM";

type Language = "en" | "bm";
type DiscountMode = "pct" | "amount";

const LANGUAGE_OPTIONS: Language[] = ["en", "bm"];

const num = (value: number | string | null | undefined, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const pctToUnit = (value: number) => clamp01(value / 100);
const unitToPct = (value: number) => (Number.isFinite(value) ? value * 100 : 0);

const fmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const fmt4 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 });

const formatMoney = (symbol: string, value: number) => {
  if (!Number.isFinite(value)) {
    return "N/A";
  }
  return `${symbol}${fmt.format(value)}`;
};

type Translation = {
  title: string;
  languageLabel: string;
  productSection: string;
  productFields: {
    listPrice: string;
    unitCost: string;
    discountLabel: (mode: DiscountMode) => string;
    discountToggle: string;
    targetMarginPct: string;
  };
  discountModes: { pct: string; amount: string };
  resultsSection: string;
  resultLabels: {
    netPrice: string;
    grossProfitPerUnit: string;
    marginOnNetSales: string;
    markupOnCost: string;
    priceForTargetMargin: string;
  };
  notes: string;
  footer: string;
};

const translations: Record<Language, Translation> = {
  en: {
    title: "Slurp! Margin Calculator",
    languageLabel: "Language",
    productSection: "Product Inputs",
    productFields: {
      listPrice: "Selling Price",
      unitCost: "Unit Cost",
      discountLabel: (mode) => `Discount (${mode === "pct" ? "%" : "Amount"})`,
      discountToggle: "Discount Type",
      targetMarginPct: "Target Margin (%)",
    },
    discountModes: { pct: "Percentage", amount: "Amount" },
    resultsSection: "Results",
    resultLabels: {
      netPrice: "Net Price (After Discount)",
      grossProfitPerUnit: "Gross Profit / Unit",
      marginOnNetSales: "Margin %",
      markupOnCost: "Markup %",
      priceForTargetMargin: "Price for Target Margin",
    },
    notes: "Notes: Margin% = Gross Profit ÷ Net Price. Markup% = Gross Profit ÷ COGS.",
    footer: "Built for business owners: quick pricing, reliable margin checks, and clear targets.",
  },
  bm: {
    title: "Kalkulator Margin Slurp!",
    languageLabel: "Bahasa",
    productSection: "Maklumat Produk",
    productFields: {
      listPrice: "Harga Jualan",
      unitCost: "Kos Unit",
      discountLabel: (mode) => `Diskaun (${mode === "pct" ? "%" : "Amaun"})`,
      discountToggle: "Jenis Diskaun",
      targetMarginPct: "Margin Sasaran (%)",
    },
    discountModes: { pct: "Peratus", amount: "Amaun" },
    resultsSection: "Keputusan",
    resultLabels: {
      netPrice: "Harga Bersih (Selepas Diskaun)",
      grossProfitPerUnit: "Untung Kasar / Unit",
      marginOnNetSales: "Margin %",
      markupOnCost: "Markup %",
      priceForTargetMargin: "Harga Untuk Margin Sasaran",
    },
    notes: "Nota: Margin% = Untung Kasar ÷ Harga Bersih. Markup% = Untung Kasar ÷ COGS.",
    footer: "Dibina untuk pemilik perniagaan: pengiraan pantas, semakan margin yang tepat dan sasaran yang jelas.",
  },
};

export default function MarginCalculator() {
  // Global / shared
  const [language, setLanguage] = useState<Language>("en");

  // Product (per SKU) inputs
  const [listPrice, setListPrice] = useState<number>(NaN);
  const [discountMode, setDiscountMode] = useState<DiscountMode>("pct");
  const [discountValue, setDiscountValue] = useState<number>(NaN);
  const [unitCost, setUnitCost] = useState<number>(NaN);
  const [targetMarginPct, setTargetMarginPct] = useState<number>(30);

  const currencySymbol = DEFAULT_CURRENCY;
  const money = (value: number) => formatMoney(currencySymbol, value);
  const t = translations[language];

  // ----- Product Calculations -----
  const product = useMemo(() => {
    const basePrice = Math.max(0, num(listPrice));
    const discount = discountMode === "pct"
      ? basePrice * pctToUnit(num(discountValue))
      : Math.min(basePrice, Math.max(0, num(discountValue)));
    const totalDiscount = Math.min(basePrice, discount);

    const netPrice = Math.max(0, basePrice - totalDiscount);
    const cogs = Math.max(0, num(unitCost));
    const grossProfitPerUnit = Math.max(0, netPrice - cogs);

    const marginPct = netPrice > 0 ? grossProfitPerUnit / netPrice : 0;
    const markupPct = cogs > 0 ? grossProfitPerUnit / cogs : 0;

    const targetMarginUnit = pctToUnit(num(targetMarginPct));
    const priceForTargetMargin = targetMarginUnit >= 1 || cogs <= 0
      ? Number.POSITIVE_INFINITY
      : cogs / (1 - targetMarginUnit);

    return {
      netPrice,
      grossProfitPerUnit,
      marginPct,
      markupPct,
      priceForTargetMargin,
    };
  }, [listPrice, discountValue, discountMode, unitCost, targetMarginPct]);

  return (
    <div className="w-full bg-white text-gray-900 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-5">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6" /> {t.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-gray-500">{t.languageLabel}</span>
              <div className="flex gap-2">
                {LANGUAGE_OPTIONS.map((code) => (
                  <button
                    key={code}
                    onClick={() => setLanguage(code)}
                    className={`px-3 py-1 rounded-lg border text-sm ${language === code ? "bg-gray-900 text-white" : "bg-white"}`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Product Margin */}
        <section className="space-y-4 md:space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"><DollarSign className="w-5 h-5"/>{t.productSection}</h2>
            <div className="flex flex-col gap-4">
              <NumberField label={t.productFields.listPrice} value={listPrice} setValue={setListPrice} prefix={currencySymbol} />
              <NumberField label={t.productFields.unitCost} value={unitCost} setValue={setUnitCost} prefix={currencySymbol} />
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-gray-600">{t.productFields.discountToggle}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDiscountMode("pct")}
                    className={`px-3 py-1 rounded-lg border text-sm ${discountMode === "pct" ? "bg-gray-900 text-white" : "bg-white"}`}
                  >{t.discountModes.pct}</button>
                  <button
                    onClick={() => setDiscountMode("amount")}
                    className={`px-3 py-1 rounded-lg border text-sm ${discountMode === "amount" ? "bg-gray-900 text-white" : "bg-white"}`}
                  >{t.discountModes.amount}</button>
                </div>
              </div>
              <NumberField
                label={t.productFields.discountLabel(discountMode)}
                value={discountValue}
                setValue={setDiscountValue}
                prefix={discountMode === "amount" ? currencySymbol : undefined}
                suffix={discountMode === "pct" ? "%" : undefined}
              />
              <NumberField label={t.productFields.targetMarginPct} value={targetMarginPct} setValue={setTargetMarginPct} suffix="%" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5"/>{t.resultsSection}</h3>
            <div className="grid grid-cols-2 gap-3">
              <KV label={t.resultLabels.netPrice} emphasis value={money(product.netPrice)} />
              <KV label={t.resultLabels.grossProfitPerUnit} value={money(product.grossProfitPerUnit)} />
              <KV label={t.resultLabels.marginOnNetSales} value={`${fmt4.format(unitToPct(product.marginPct))}%`} />
              <KV label={t.resultLabels.markupOnCost} value={`${fmt4.format(unitToPct(product.markupPct))}%`} />
              <KV label={t.resultLabels.priceForTargetMargin} value={money(product.priceForTargetMargin)} />
            </div>
            <div className="text-xs text-gray-500 pt-1">
              <p>{t.notes}</p>
            </div>
          </div>
        </section>

        <footer className="text-xs text-gray-500 text-center">
          {t.footer}
        </footer>
      </div>
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  setValue: (next: number) => void;
  prefix?: string;
  suffix?: string;
};

type KVProps = {
  label: string;
  value: string;
  emphasis?: boolean;
};

function NumberField({ label, value, setValue, prefix, suffix }: NumberFieldProps) {
  return (
    <label className="text-sm grid gap-1 text-gray-600">
      <span className="font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white">
        {prefix && <span className="text-gray-500 font-medium whitespace-nowrap flex-shrink-0">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          className="flex-1 min-w-0 text-gray-900 focus:outline-none"
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => {
            const next = e.target.value;
            setValue(next === "" ? NaN : num(next));
          }}
        />
        {suffix && <span className="text-gray-500 font-medium whitespace-nowrap flex-shrink-0">{suffix}</span>}
      </div>
    </label>
  );
}

function KV({ label, value, emphasis }: KVProps) {
  return (
    <div className={`p-3 rounded-lg border ${emphasis ? 'bg-gray-50 border-gray-200' : 'border-gray-200'}`}>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className={`text-base ${emphasis ? 'font-semibold' : 'text-gray-900'}`}>{value}</div>
    </div>
  );
}
