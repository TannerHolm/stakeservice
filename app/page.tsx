"use client";

import { useState } from "react";
import { UNITS } from "@/lib/units";
import { compressImage } from "@/lib/compress";

type FormState = {
  unit: string;
  project: string;
  hours: string;
  story: string;
  name: string;
  photos: File[];
};

const TOTAL_STEPS = 5;

const GRADIENT_BG: React.CSSProperties = {
  backgroundImage: [
    "linear-gradient(160deg, transparent 62%, rgba(0,0,0,0.10) 62%)",
    "linear-gradient(115deg, transparent 48%, rgba(255,255,255,0.06) 48%)",
    "linear-gradient(135deg, #5BB0C8 0%, #3D8AA5 45%, #2C6F8B 100%)",
  ].join(", "),
  backgroundAttachment: "fixed",
  color: "white",
};

export default function Home() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    unit: "",
    project: "",
    hours: "",
    story: "",
    name: "",
    photos: [],
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function canAdvance() {
    if (step === 1) return form.unit !== "";
    if (step === 2) {
      const h = parseFloat(form.hours);
      return form.project.trim() !== "" && !isNaN(h) && h > 0;
    }
    return true;
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("unit", form.unit);
      fd.append("project", form.project);
      fd.append("hours", form.hours);
      fd.append("story", form.story);
      fd.append("name", form.name);
      for (const file of form.photos) fd.append("photos", file);
      const res = await fetch("/api/submit", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Submission failed");
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setForm({ unit: "", project: "", hours: "", story: "", name: "", photos: [] });
    setStep(1);
    setDone(false);
    setError(null);
  }

  const inputCls =
    "w-full px-5 py-4 rounded-2xl border border-white/30 bg-white/10 text-lg text-white placeholder-white/50 outline-none focus:border-white focus:bg-white/15";

  const primaryBtnCls =
    "flex-1 px-6 py-4 rounded-full bg-white text-[#2C6F8B] font-medium text-lg disabled:opacity-50 hover:bg-white/95";

  if (done) {
    return (
      <main style={GRADIENT_BG} className="h-[100dvh] flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">Thank you!</h1>
          <p className="text-lg text-white/80 mb-10">
            Your service has been logged. Thank you for serving.
          </p>
          <button onClick={reset} className={`${primaryBtnCls} w-full sm:w-auto`}>
            Log another
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={GRADIENT_BG} className="h-[100dvh] flex flex-col">
      <div className="px-6 pt-6 shrink-0">
        <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-white/70">
          Step {step} of {TOTAL_STEPS}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 flex flex-col justify-center">
        <div className="w-full max-w-2xl mx-auto">
          {step === 1 && (
            <div>
              <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-1">
                Which unit are you with?
              </h1>
              <p className="text-white/70 mb-4 sm:mb-6">Select one.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {UNITS.map((u) => (
                  <button
                    key={u}
                    onClick={() => update("unit", u)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-base transition ${
                      form.unit === u
                        ? "border-white bg-white text-[#2C6F8B]"
                        : "border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/60 text-white"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
                What did you do?
              </h1>
              <p className="text-white/70 mb-8">A brief description and how long it took.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Project</label>
                  <input
                    type="text"
                    value={form.project}
                    onChange={(e) => update("project", e.target.value)}
                    placeholder="Yard work, meal delivery, etc."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hours</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.25"
                    min="0"
                    value={form.hours}
                    onChange={(e) => update("hours", e.target.value)}
                    placeholder="2.5"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
                Tell us about it
              </h1>
              <p className="text-white/70 mb-8">Optional — feelings, stories, anything.</p>
              <textarea
                value={form.story}
                onChange={(e) => update("story", e.target.value)}
                rows={8}
                placeholder="What stood out? Who did you serve? How did it feel?"
                className={`${inputCls} resize-none`}
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">Photos</h1>
              <p className="text-white/70 mb-8">
                Optional — add a few pictures from your service.
              </p>
              <label className={`block w-full px-5 py-10 rounded-2xl border-2 border-dashed border-white/40 text-center bg-white/5 ${processingPhotos ? "opacity-60 cursor-wait" : "cursor-pointer hover:border-white hover:bg-white/10"}`}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={processingPhotos}
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    e.target.value = "";
                    if (files.length === 0) return;
                    setProcessingPhotos(true);
                    try {
                      const compressed = await Promise.all(files.map((f) => compressImage(f)));
                      update("photos", [...form.photos, ...compressed]);
                    } finally {
                      setProcessingPhotos(false);
                    }
                  }}
                />
                <div className="text-lg font-medium">
                  {processingPhotos ? "Processing photos…" : "Tap to add photos"}
                </div>
                <div className="text-sm text-white/70 mt-1">JPEG, PNG, HEIC</div>
              </label>
              {form.photos.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {form.photos.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-sm"
                    >
                      <span className="truncate mr-3">{f.name}</span>
                      <button
                        onClick={() =>
                          update(
                            "photos",
                            form.photos.filter((_, idx) => idx !== i)
                          )
                        }
                        className="text-white/70 hover:text-white"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === 5 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">Your name</h1>
              <p className="text-white/70 mb-8">
                Optional — helps us credit your photos in the slideshow.
              </p>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="First and last name"
                className={inputCls}
              />
              {error && <p className="mt-4 text-red-200 text-sm">{error}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-8 pt-4 border-t border-white/15">
        <div className="w-full max-w-2xl mx-auto flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              disabled={submitting}
              className="px-6 py-4 rounded-full border border-white/40 text-white font-medium disabled:opacity-50 hover:bg-white/10"
            >
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className={`${primaryBtnCls} disabled:opacity-30`}
            >
              Continue
            </button>
          ) : (
            <button onClick={submit} disabled={submitting} className={primaryBtnCls}>
              {submitting ? "Submitting…" : "Submit"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
