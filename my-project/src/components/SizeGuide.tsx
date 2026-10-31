import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { MEASURING_TIPS, SIZE_CHART, US_SIZES, formatRange, type SizeUnit } from "../lib/sizes";

// Body measurement chart for the US sizes, in centimetres or inches.
export default function SizeGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [unit, setUnit] = useState<SizeUnit>("cm");
  const [showTips, setShowTips] = useState(false);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Size Guide"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl max-h-[90vh] overflow-y-auto bg-[#001D23] text-white rounded-t-2xl sm:rounded-2xl p-5"
      >
        <div className="relative mb-4">
          <h2 className="text-center text-lg font-bold">Size Guide</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm font-semibold">Body chart · US sizes</p>
          <div className="flex rounded-full border border-gray-600 p-0.5 text-sm" role="group" aria-label="Units">
            {(["cm", "in"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                aria-pressed={unit === u}
                className={`rounded-full px-3 py-0.5 transition ${
                  unit === u ? "bg-[#00DA6B] text-black font-semibold" : "text-gray-300"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full min-w-[480px] border-collapse text-center text-sm">
            <thead className="bg-[#002A35]">
              <tr>
                {["US", "Size", "Height", "Bust", "Waist", "Hips"].map((h, i) => (
                  <th
                    key={h}
                    className={`border-b border-gray-700 px-3 py-2.5 font-semibold ${
                      i === 0 ? "sticky left-0 bg-[#002A35]" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((row) => (
                <tr key={row.size} className="border-b border-gray-700 last:border-0">
                  <td className="sticky left-0 bg-[#002A35] px-3 py-3 font-semibold">{US_SIZES[row.size]}</td>
                  <td className="px-3 py-3">{row.size}</td>
                  <td className="px-3 py-3">{formatRange(row.height, unit)}</td>
                  <td className="px-3 py-3">{formatRange(row.bust, unit)}</td>
                  <td className="px-3 py-3">{formatRange(row.waist, unit)}</td>
                  <td className="px-3 py-3">{formatRange(row.hip, unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          *Depending on your body type and dressing habits, the above sizes are for reference only.
        </p>

        <button
          type="button"
          onClick={() => setShowTips((v) => !v)}
          aria-expanded={showTips}
          className="mt-4 flex w-full items-center justify-between border-t border-gray-700 pt-4 text-sm font-semibold"
        >
          How to measure your body?
          <ChevronDown size={18} className={`transition-transform ${showTips ? "rotate-180" : ""}`} />
        </button>
        {showTips && (
          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            {MEASURING_TIPS.map(({ label, tip }) => (
              <li key={label}>
                <span className="font-semibold text-white">{label}:</span> {tip}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
