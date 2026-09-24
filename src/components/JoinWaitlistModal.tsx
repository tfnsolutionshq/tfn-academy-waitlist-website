import { useEffect, useState } from "react";

interface JoinWaitlistModalProps {
  onClose: () => void;
}

const WAITLIST_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx-S8Ej3PdjLciEYXOYdbgLR0DnaqqHTj6b-VzIQ5ciagYFhq3bZBYrWrcqOp6P8CfU/exec";

export default function JoinWaitlistModal({ onClose }: JoinWaitlistModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06172b]/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Join the waitlist"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          ×
        </button>

        <h2 className="text-2xl font-black tracking-tight text-[#081b30]">
          Join the waitlist
        </h2>
        <p className="mt-2 text-base leading-6 text-slate-500">
          Enter your details below to get early access to the programme and
          exclusive updates.
        </p>

        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;

            setIsSubmitting(true);
            setError("");

            try {
              const response = await fetch(WAITLIST_SCRIPT_URL, {
                method: "POST",
                body: new FormData(form),
              });

              if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
              }

              const result = await response.json();

              if (!result.success) {
                throw new Error(result.error || "Submission failed");
              }

              onClose();
            } catch {
              setError("Something went wrong. Please try again.");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <input
            type="text"
            name="fullName"
            required
            placeholder="Full name"
            className="w-full rounded-full border border-slate-200 px-5 py-3 text-base text-[#081b30] placeholder-slate-400 outline-none transition focus:border-[#ffb21a] focus:ring-2 focus:ring-[#ffb21a]/30"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Email address"
            className="w-full rounded-full border border-slate-200 px-5 py-3 text-base text-[#081b30] placeholder-slate-400 outline-none transition focus:border-[#ffb21a] focus:ring-2 focus:ring-[#ffb21a]/30"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#ffb21a] px-7 py-3 text-base font-bold text-[#06172b] transition hover:bg-[#ffc044] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Joining…" : "Join the waitlist"}
          </button>
        </form>
      </div>
    </div>
  );
}
