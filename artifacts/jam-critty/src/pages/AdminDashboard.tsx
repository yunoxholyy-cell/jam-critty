import { useState, useEffect, useRef, useCallback } from "react";
import {
  useGetRegistrations,
  useUpdateRegistration,
  useDeleteRegistration,
  useLookupTicket,
  useCheckin,
  useWalkup,
  useGetCaps,
  useUpdateCaps,
  getGetRegistrationsQueryKey,
  getGetCapsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

// ── Types ─────────────────────────────────────────────────────────────────────

type Registration = {
  id: string;
  full_name: string;
  gender: string;
  phone: string;
  instagram_handle: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  notes: string;
  ticket_token: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
};

type Caps = {
  max_total: number;
  max_female: number;
  max_male: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return days === 1 ? "yesterday" : `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function checkinTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  approved: { bg: "#00D4FF22", color: "#00D4FF" },
  pending: { bg: "#FFD23F22", color: "#FFD23F" },
  waitlist: { bg: "#B8FF3F22", color: "#B8FF3F" },
  rejected: { bg: "#FF3D8B22", color: "#FF3D8B" },
};

const PAYMENT_COLORS: Record<string, { bg: string; color: string }> = {
  unpaid: { bg: "#FF3D8B22", color: "#FF3D8B" },
  pending: { bg: "#FFD23F22", color: "#FFD23F" },
  paid: { bg: "#B8FF3F22", color: "#B8FF3F" },
};

function Pill({
  label,
  style,
}: {
  label: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="font-mono-micro px-2 py-1 rounded-full"
      style={{ fontSize: 9, display: "inline-block", ...style }}
    >
      {label.toUpperCase()}
    </span>
  );
}

// ── Ticket Modal ──────────────────────────────────────────────────────────────

function TicketModal({
  reg,
  onClose,
}: {
  reg: Registration;
  onClose: () => void;
}) {
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );
  useEffect(() => {
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  async function downloadPng() {
    // Dynamically load html2canvas
    if (!(window as Record<string, unknown>).html2canvas) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src =
          "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
        s.onload = () => resolve();
        s.onerror = () => reject();
        document.head.appendChild(s);
      });
    }
    const h2c = (window as Record<string, unknown>).html2canvas as (
      el: HTMLElement,
      opts: Record<string, unknown>,
    ) => Promise<HTMLCanvasElement>;
    const canvas = await h2c(ticketRef.current!, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#1A0B2E",
    });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `JAM_CRITTY_TICKET_${reg.full_name.replace(/\s+/g, "_").toUpperCase()}.png`;
    a.click();
  }

  function sendWhatsApp() {
    const firstName = reg.full_name.split(" ")[0];
    const msg = encodeURIComponent(
      `Hey ${firstName}! 🎟️ Here's your JAM CRITTY ticket. Save it to your phone and show this QR at the door. We'll send you the address 48 hours before the event. Don't share this ticket or post the flyer publicly 🙏 See you on Sat 13 Dec.`,
    );
    window.open(`https://wa.me/${reg.phone.replace(/\D/g, "")}?text=${msg}`);
  }

  const isPaid = reg.payment_status === "paid";
  const shortId = reg.id.slice(-6).toUpperCase();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 1000, background: "rgba(0,0,0,0.92)" }}
    >
      <div className="w-full max-w-lg">
        {/* Ticket Preview */}
        <div
          ref={ticketRef}
          className="overflow-hidden mb-6"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(255,61,139,0.4), transparent 60%), radial-gradient(ellipse at bottom, rgba(0,212,255,0.3), transparent 60%), #1A0B2E",
            borderRadius: "2rem",
            padding: "2.5rem",
            border: "2px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 40px rgba(255,61,139,0.3)",
          }}
        >
          <div className="text-center mb-6">
            <span
              className="font-mono-micro px-3 py-1 rounded-full inline-block mb-4"
              style={{
                background: "rgba(255,210,63,0.2)",
                border: "1px solid rgba(255,210,63,0.4)",
                color: "#FFD23F",
                transform: "rotate(-6deg)",
                display: "inline-block",
              }}
            >
              VOL. 01
            </span>
            <h2
              className="font-display"
              style={{ fontSize: "3rem", color: "#FFF8F0", lineHeight: 1 }}
            >
              JAM{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #FFD23F, #FF3D8B, #00D4FF)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                CRITTY
              </span>
            </h2>
            <p
              className="font-mono-micro mt-2"
              style={{ color: "rgba(255,248,240,0.5)" }}
            >
              POOL · BRAAI · MUSIC · GOOD ENERGY
            </p>
          </div>

          <div
            style={{
              borderTop: "2px dashed rgba(255,255,255,0.1)",
              margin: "1.5rem 0",
            }}
          />

          <div className="text-center mb-4">
            <p
              className="font-display uppercase"
              style={{ fontSize: "2.5rem", color: "#FFF8F0", lineHeight: 1.1 }}
            >
              {reg.full_name.toUpperCase()}
            </p>
            <p className="font-mono-micro mt-2" style={{ color: "rgba(255,248,240,0.5)" }}>
              TICKET #{shortId}
            </p>
          </div>

          <div className="flex justify-between items-center my-4">
            <div>
              <p className="font-mono-micro" style={{ opacity: 0.5 }}>
                DATE
              </p>
              <p
                className="font-display"
                style={{ color: "#FFD23F", fontSize: "1.1rem" }}
              >
                SUN 13 DEC · 6PM
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono-micro" style={{ opacity: 0.5 }}>
                DRESS CODE
              </p>
              <p
                className="font-display"
                style={{ color: "#00D4FF", fontSize: "1rem" }}
              >
                SUMMER DRIP
              </p>
            </div>
          </div>

          <div className="text-center my-4">
            <span
              className="font-display px-4 py-2 rounded-xl inline-block"
              style={{
                background: isPaid ? "rgba(184,255,63,0.2)" : "rgba(255,210,63,0.2)",
                border: `1px solid ${isPaid ? "#B8FF3F" : "#FFD23F"}`,
                color: isPaid ? "#B8FF3F" : "#FFD23F",
                fontSize: "1rem",
              }}
            >
              {isPaid ? "✓ PAID" : "💵 PAY AT DOOR — US$20"}
            </span>
          </div>

          <div
            style={{
              borderTop: "2px dashed rgba(255,255,255,0.1)",
              margin: "1.5rem 0",
            }}
          />

          <div className="flex flex-col items-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${reg.ticket_token}&bgcolor=FFF8F0&color=1A0B2E&qzone=2&margin=0`}
              alt="QR Code"
              width={140}
              height={140}
              style={{ borderRadius: "0.75rem" }}
            />
            <p
              className="font-mono-micro mt-3"
              style={{ color: "rgba(255,248,240,0.6)", letterSpacing: "0.4em" }}
            >
              {reg.ticket_token}
            </p>
            <p
              className="font-mono-micro mt-2 text-center"
              style={{ color: "rgba(255,248,240,0.4)" }}
            >
              ONE PERSON. ONE TICKET. KEEP IT SAFE.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={downloadPng} className="btn-primary flex-1 py-3" style={{ fontSize: "0.875rem" }}>
            DOWNLOAD PNG
          </button>
          <button
            onClick={sendWhatsApp}
            className="btn-ghost flex-1 py-3"
            style={{ fontSize: "0.875rem", borderColor: "#B8FF3F", color: "#B8FF3F" }}
          >
            SEND VIA WHATSAPP
          </button>
          <button
            onClick={onClose}
            className="btn-ghost py-3 px-6"
            style={{ fontSize: "0.875rem" }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

// ── QR Scanner ────────────────────────────────────────────────────────────────

function QRScanner({
  pw,
  onFound,
  onClose,
}: {
  pw: string;
  onFound: (reg: Registration) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"searching" | "found" | "error">("searching");
  const [errorMsg, setErrorMsg] = useState("");
  const [manualEntry, setManualEntry] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const lookupMutation = useLookupTicket();

  const doLookup = useCallback(
    async (token: string) => {
      setStatus("found");
      try {
        const result = await lookupMutation.mutateAsync({
          data: { token },
          headers: { "x-admin-password": pw },
        } as Parameters<typeof lookupMutation.mutateAsync>[0]);
        onFound(result as unknown as Registration);
      } catch {
        setStatus("error");
        setErrorMsg("Ticket not found.");
        setTimeout(() => setStatus("searching"), 2000);
      }
    },
    [lookupMutation, pw, onFound],
  );

  useEffect(() => {
    let active = true;

    async function init() {
      // Load jsQR
      if (!(window as Record<string, unknown>).jsQR) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src =
            "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
          s.onload = () => resolve();
          s.onerror = () => reject();
          document.head.appendChild(s);
        });
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current && active) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        const jsQR = (window as Record<string, unknown>).jsQR as (
          data: Uint8ClampedArray,
          w: number,
          h: number,
        ) => { data: string } | null;

        function tick() {
          if (!active) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
              );
              const code = jsQR(
                imageData.data,
                imageData.width,
                imageData.height,
              );
              if (code && code.data) {
                stream.getTracks().forEach((t) => t.stop());
                doLookup(code.data);
                return;
              }
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        }
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        setErrorMsg(
          "Camera access needed. Allow it in browser settings, or use Manual Entry.",
        );
        setStatus("error");
      }
    }

    init();

    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [doLookup]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ zIndex: 500, background: "#0A0515" }}
    >
      <div className="w-full max-w-sm">
        {/* Video */}
        <div className="relative mb-6" style={{ borderRadius: "1rem", overflow: "hidden", aspectRatio: "1" }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />
          {/* Corner brackets */}
          {["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"].map(
            (pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-10 h-10`}
                style={{
                  borderColor: "#FF3D8B",
                  borderStyle: "solid",
                  borderWidth: 0,
                  ...(i === 0 && { borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 }),
                  ...(i === 1 && { borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 }),
                  ...(i === 2 && { borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 }),
                  ...(i === 3 && { borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 }),
                }}
              />
            ),
          )}
        </div>

        {/* Status */}
        <div className="text-center mb-6">
          {status === "searching" && (
            <p className="font-display text-xl" style={{ color: "#FFF8F0" }}>
              SEARCHING...
            </p>
          )}
          {status === "found" && (
            <p className="font-display text-xl" style={{ color: "#B8FF3F" }}>
              FOUND
            </p>
          )}
          {status === "error" && (
            <p className="font-display text-xl" style={{ color: "#FF3D8B" }}>
              {errorMsg || "NOT FOUND"}
            </p>
          )}
        </div>

        {/* Manual entry */}
        {manualEntry ? (
          <div className="mb-4">
            <input
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value.toUpperCase())}
              placeholder="8-CHAR TOKEN"
              maxLength={8}
              className="w-full rounded-xl px-4 py-3 text-white outline-none mb-3"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "2px solid rgba(255,255,255,0.2)",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.3em",
                textAlign: "center",
                fontSize: "1.25rem",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#FF3D8B")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.2)")}
            />
            <button
              onClick={() => manualToken.length >= 4 && doLookup(manualToken)}
              className="btn-primary w-full py-3 mb-2"
            >
              LOOK UP
            </button>
          </div>
        ) : (
          <button
            onClick={() => setManualEntry(true)}
            className="btn-ghost w-full py-3 mb-4"
          >
            MANUAL ENTRY
          </button>
        )}

        <button onClick={onClose} className="btn-ghost w-full py-3" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          CANCEL
        </button>
      </div>
    </div>
  );
}

// ── Check-in Confirmation ─────────────────────────────────────────────────────

function CheckinConfirmation({
  reg,
  pw,
  onDone,
}: {
  reg: Registration;
  pw: string;
  onDone: () => void;
}) {
  const checkinMutation = useCheckin();
  const [alreadyIn, setAlreadyIn] = useState(reg.checked_in);
  const [success, setSuccess] = useState(false);

  async function doCheckin(collectCash: boolean) {
    try {
      await checkinMutation.mutateAsync({
        data: { id: reg.id, collect_cash: collectCash },
        headers: { "x-admin-password": pw },
      } as Parameters<typeof checkinMutation.mutateAsync>[0]);
      setSuccess(true);
      setTimeout(onDone, 1500);
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      if (e?.response?.data?.error?.includes("Already")) {
        setAlreadyIn(true);
      }
    }
  }

  const checkinTimeStr = reg.checked_in_at ? checkinTime(reg.checked_in_at) : "";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ zIndex: 600, background: "rgba(0,0,0,0.95)" }}
    >
      <div className="card-surface p-8 w-full max-w-sm text-center">
        {success ? (
          <>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#B8FF3F22", border: "2px solid #B8FF3F" }}
            >
              <span style={{ fontSize: "2.5rem" }}>✓</span>
            </div>
            <p className="font-display text-2xl" style={{ color: "#B8FF3F" }}>
              CHECKED IN!
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-3xl mb-2" style={{ color: "#FFF8F0" }}>
              {reg.full_name.toUpperCase()}
            </p>
            <div className="flex justify-center gap-2 mb-4">
              <Pill
                label={reg.gender}
                style={
                  reg.gender === "female"
                    ? { background: "#FF3D8B22", color: "#FF3D8B" }
                    : { background: "#00D4FF22", color: "#00D4FF" }
                }
              />
              {reg.instagram_handle && (
                <Pill
                  label={`@${reg.instagram_handle}`}
                  style={{ background: "rgba(255,255,255,0.08)", color: "#FFF8F0" }}
                />
              )}
            </div>

            {alreadyIn ? (
              <div
                className="rounded-xl p-4 mb-6"
                style={{ background: "rgba(255,210,63,0.15)", border: "1px solid rgba(255,210,63,0.4)" }}
              >
                <p className="font-display text-lg" style={{ color: "#FFD23F" }}>
                  ALREADY CHECKED IN
                </p>
                {checkinTimeStr && (
                  <p className="font-mono-micro mt-1" style={{ opacity: 0.7 }}>
                    @ {checkinTimeStr}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <Pill
                  label={reg.payment_status}
                  style={PAYMENT_COLORS[reg.payment_status] ?? { background: "#ffffff22", color: "#FFF8F0" }}
                />
              </div>
            )}

            {!alreadyIn && (
              <div className="space-y-3">
                {reg.payment_status === "paid" ? (
                  <button
                    onClick={() => doCheckin(false)}
                    disabled={checkinMutation.isPending}
                    className="btn-primary w-full py-4"
                    style={{ background: "linear-gradient(135deg, #00D4FF, #0099BB)" }}
                  >
                    {checkinMutation.isPending ? "..." : "✓ CHECK IN"}
                  </button>
                ) : (
                  <button
                    onClick={() => doCheckin(true)}
                    disabled={checkinMutation.isPending}
                    className="btn-primary w-full py-4"
                  >
                    {checkinMutation.isPending ? "..." : "💵 COLLECT US$20 + CHECK IN"}
                  </button>
                )}
              </div>
            )}
            <button
              onClick={onDone}
              className="btn-ghost w-full py-3 mt-3"
              style={{ fontSize: "0.875rem" }}
            >
              BACK
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Walk-up Modal ─────────────────────────────────────────────────────────────

function WalkupModal({
  pw,
  onClose,
}: {
  pw: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"female" | "male">("female");
  const [error, setError] = useState("");
  const walkupMutation = useWalkup();

  async function submit() {
    setError("");
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    try {
      await walkupMutation.mutateAsync({
        data: { full_name: name.trim(), gender },
        headers: { "x-admin-password": pw },
      } as Parameters<typeof walkupMutation.mutateAsync>[0]);
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error ?? "Something went wrong.");
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ zIndex: 600, background: "rgba(0,0,0,0.85)" }}
    >
      <div className="card-surface p-8 w-full max-w-sm">
        <h2 className="font-display text-2xl mb-6" style={{ color: "#FFF8F0" }}>
          WALK-UP ENTRY
        </h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="w-full rounded-xl px-4 py-4 text-white outline-none mb-4"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "2px solid rgba(255,255,255,0.1)",
            fontFamily: "Inter, sans-serif",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#FF3D8B")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <div className="flex gap-3 mb-6">
          {(["female", "male"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className="flex-1 py-3 rounded-xl font-display uppercase transition-all"
              style={{
                border: `2px solid ${gender === g ? (g === "female" ? "#FF3D8B" : "#00D4FF") : "rgba(255,255,255,0.2)"}`,
                background:
                  gender === g
                    ? g === "female"
                      ? "rgba(255,61,139,0.15)"
                      : "rgba(0,212,255,0.15)"
                    : "transparent",
                color: gender === g ? (g === "female" ? "#FF3D8B" : "#00D4FF") : "rgba(255,255,255,0.4)",
              }}
            >
              {g === "female" ? "WOMAN" : "MAN"}
            </button>
          ))}
        </div>
        {error && (
          <p className="text-sm mb-4" style={{ color: "#FF3D8B" }}>
            {error}
          </p>
        )}
        <button
          onClick={submit}
          disabled={walkupMutation.isPending}
          className="btn-primary w-full py-4 mb-3"
        >
          {walkupMutation.isPending ? "ADDING..." : "ADD & CHECK IN"}
        </button>
        <button onClick={onClose} className="btn-ghost w-full py-3">
          CANCEL
        </button>
      </div>
    </div>
  );
}

// ── List Mode ─────────────────────────────────────────────────────────────────

function ListMode({
  pw,
  registrations,
}: {
  pw: string;
  registrations: Registration[];
}) {
  const qc = useQueryClient();
  const updateMutation = useUpdateRegistration();
  const deleteMutation = useDeleteRegistration();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [payFilter, setPayFilter] = useState("ANY");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");
  const [ticketReg, setTicketReg] = useState<Registration | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [openPayMenu, setOpenPayMenu] = useState<string | null>(null);
  const [capsEditing, setCapsEditing] = useState<Caps | null>(null);

  const { data: caps } = useGetCaps(undefined, {
    query: { queryKey: getGetCapsQueryKey() },
    request: { headers: { "x-admin-password": pw } },
  });
  const updateCapsMutation = useUpdateCaps();

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetRegistrationsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetCapsQueryKey() });
  }

  function update(id: string, patch: Record<string, unknown>) {
    updateMutation.mutate(
      {
        id,
        data: patch as Parameters<typeof updateMutation.mutate>[0]["data"],
        headers: { "x-admin-password": pw },
      } as Parameters<typeof updateMutation.mutate>[0],
      { onSuccess: invalidate },
    );
  }

  function copyPhone(phone: string) {
    navigator.clipboard.writeText(phone).catch(() => {});
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 1500);
  }

  function exportCSV() {
    const headers = [
      "Full Name",
      "Gender",
      "Phone",
      "Instagram",
      "Status",
      "Payment Status",
      "Payment Method",
      "Notes",
      "Ticket Token",
      "Checked In",
      "Checked In At",
      "Created At",
    ];
    const rows = registrations.map((r) => [
      r.full_name,
      r.gender,
      r.phone,
      r.instagram_handle,
      r.status,
      r.payment_status,
      r.payment_method ?? "",
      r.notes,
      r.ticket_token,
      r.checked_in ? "yes" : "no",
      r.checked_in_at ?? "",
      r.created_at,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jam-critty-registrations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Stats
  const approved = registrations.filter((r) => r.status === "approved").length;
  const pending = registrations.filter((r) => r.status === "pending").length;
  const waitlist = registrations.filter((r) => r.status === "waitlist").length;
  const rejected = registrations.filter((r) => r.status === "rejected").length;
  const womenConfirmed = registrations.filter(
    (r) => r.status === "approved" && r.gender === "female",
  ).length;
  const menConfirmed = registrations.filter(
    (r) => r.status === "approved" && r.gender === "male",
  ).length;
  const paid = registrations.filter((r) => r.payment_status === "paid").length;
  const unpaid = registrations.filter(
    (r) => r.payment_status === "unpaid",
  ).length;

  const statTiles = [
    { label: "CONFIRMED", value: approved, color: "#00D4FF" },
    { label: "PENDING", value: pending, color: "#FFD23F" },
    { label: "WAITLIST", value: waitlist, color: "#B8FF3F" },
    { label: "REJECTED", value: rejected, color: "#FF3D8B" },
    { label: "WOMEN IN", value: womenConfirmed, color: "#FF3D8B" },
    { label: "MEN IN", value: menConfirmed, color: "#00D4FF" },
    { label: "PAID", value: paid, color: "#B8FF3F" },
    { label: "UNPAID", value: unpaid, color: "#FFD23F" },
  ];

  // Filter
  const filtered = registrations.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.full_name.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      r.instagram_handle.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "ALL" ||
      r.status.toUpperCase() === statusFilter;
    const matchPay =
      payFilter === "ANY" ||
      r.payment_status.toUpperCase() === payFilter;
    return matchSearch && matchStatus && matchPay;
  });

  function waMsg(r: Registration) {
    const firstName = r.full_name.split(" ")[0];
    return `Hey ${firstName}! 🌴 You're locked in for JAM CRITTY on Sat 13 Dec. Entry is US$20 — let us know what works best for paying (EcoCash or cash on the day) and we'll send the details. Address + final instructions go out 48 hours before. Don't share the flyer publicly 🙏`;
  }

  return (
    <div>
      {ticketReg && (
        <TicketModal reg={ticketReg} onClose={() => setTicketReg(null)} />
      )}
      {confirmDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6"
          style={{ zIndex: 800, background: "rgba(0,0,0,0.85)" }}
        >
          <div className="card-surface p-8 max-w-sm w-full text-center">
            <p className="font-display text-xl mb-4" style={{ color: "#FFF8F0" }}>
              DELETE REGISTRATION?
            </p>
            <p className="mb-8" style={{ color: "rgba(255,248,240,0.6)" }}>
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  deleteMutation.mutate(
                    { id: confirmDelete, headers: { "x-admin-password": pw } } as Parameters<typeof deleteMutation.mutate>[0],
                    { onSuccess: () => { invalidate(); setConfirmDelete(null); } },
                  );
                }}
                className="btn-primary flex-1 py-3"
                style={{ background: "linear-gradient(135deg,#FF3D8B,#FF6B4A)" }}
              >
                DELETE
              </button>
              <button onClick={() => setConfirmDelete(null)} className="btn-ghost flex-1 py-3">
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
        {statTiles.map((t) => (
          <div key={t.label} className="card-surface p-3 text-center" style={{ borderRadius: "1rem" }}>
            <p className="font-display text-2xl" style={{ color: t.color }}>
              {t.value}
            </p>
            <p className="font-mono-micro mt-1" style={{ opacity: 0.5, fontSize: 8 }}>
              {t.label}
            </p>
          </div>
        ))}
      </div>

      {/* Caps editor */}
      {caps && (
        <div className="card-surface p-5 mb-6" style={{ borderRadius: "1.25rem" }}>
          <p className="font-mono-micro mb-3" style={{ opacity: 0.6 }}>
            CAP SETTINGS
          </p>
          <div className="flex gap-4 items-end flex-wrap">
            {(["max_total", "max_female", "max_male"] as const).map((k) => {
              const labels = {
                max_total: "MAX TOTAL",
                max_female: "MAX WOMEN",
                max_male: "MAX MEN",
              };
              const val = capsEditing ? capsEditing[k] : caps[k];
              return (
                <div key={k}>
                  <p className="font-mono-micro mb-1" style={{ opacity: 0.5, fontSize: 8 }}>
                    {labels[k]}
                  </p>
                  <input
                    type="number"
                    value={val}
                    min={0}
                    onChange={(e) =>
                      setCapsEditing((prev) => ({
                        ...(prev ?? caps),
                        [k]: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="rounded-lg px-3 py-2 text-white w-20 text-center"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "2px solid rgba(255,255,255,0.1)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  />
                </div>
              );
            })}
            {capsEditing && (
              <button
                onClick={() => {
                  updateCapsMutation.mutate(
                    {
                      data: capsEditing,
                      headers: { "x-admin-password": pw },
                    } as Parameters<typeof updateCapsMutation.mutate>[0],
                    { onSuccess: () => { setCapsEditing(null); qc.invalidateQueries({ queryKey: getGetCapsQueryKey() }); } },
                  );
                }}
                className="btn-primary px-6 py-2"
                style={{ fontSize: "0.875rem" }}
              >
                SAVE
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, or @handle..."
          className="flex-1 rounded-xl px-4 py-3 text-white outline-none"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "2px solid rgba(255,255,255,0.1)",
            fontFamily: "Inter, sans-serif",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#FF3D8B")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        <div className="flex gap-2 flex-wrap">
          {["ALL", "APPROVED", "PENDING", "WAITLIST", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="font-mono-micro px-3 py-2 rounded-full transition-all"
              style={{
                fontSize: 9,
                background: statusFilter === s ? "#FF3D8B" : "rgba(255,255,255,0.05)",
                color: statusFilter === s ? "#FFF8F0" : "rgba(255,255,255,0.5)",
                border: "1px solid",
                borderColor: statusFilter === s ? "#FF3D8B" : "rgba(255,255,255,0.1)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ANY", "UNPAID", "PENDING", "PAID"].map((p) => (
            <button
              key={p}
              onClick={() => setPayFilter(p)}
              className="font-mono-micro px-3 py-2 rounded-full transition-all"
              style={{
                fontSize: 9,
                background: payFilter === p ? "#FFD23F" : "rgba(255,255,255,0.05)",
                color: payFilter === p ? "#1A0B2E" : "rgba(255,255,255,0.5)",
                border: "1px solid",
                borderColor: payFilter === p ? "#FFD23F" : "rgba(255,255,255,0.1)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <button onClick={exportCSV} className="btn-ghost px-4 py-2" style={{ fontSize: "0.75rem" }}>
          EXPORT CSV
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">✦</p>
          <p className="font-mono-micro" style={{ opacity: 0.4 }}>
            {registrations.length === 0
              ? "No registrations yet — the form is live and waiting."
              : "No results match your filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {[
                  "NAME",
                  "GENDER",
                  "PHONE",
                  "INSTAGRAM",
                  "STATUS",
                  "PAYMENT",
                  "TICKET",
                  "NOTES",
                  "DATE",
                  "ACTIONS",
                ].map((h) => (
                  <th
                    key={h}
                    className="font-mono-micro text-left py-3 px-3"
                    style={{ opacity: 0.4, fontSize: 8, whiteSpace: "nowrap" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.03)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "")
                  }
                >
                  {/* Name */}
                  <td className="py-3 px-3 font-bold" style={{ color: "#FFF8F0", whiteSpace: "nowrap" }}>
                    {r.full_name}
                  </td>

                  {/* Gender */}
                  <td className="py-3 px-3">
                    <Pill
                      label={r.gender === "female" ? "W" : "M"}
                      style={
                        r.gender === "female"
                          ? { background: "#FF3D8B22", color: "#FF3D8B" }
                          : { background: "#00D4FF22", color: "#00D4FF" }
                      }
                    />
                  </td>

                  {/* Phone */}
                  <td
                    className="py-3 px-3 cursor-pointer"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.75rem",
                      color: copiedPhone === r.phone ? "#B8FF3F" : "rgba(255,248,240,0.7)",
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => r.phone && copyPhone(r.phone)}
                    title="Click to copy"
                  >
                    {r.phone || "—"}
                    {copiedPhone === r.phone && (
                      <span className="ml-1 font-mono-micro" style={{ color: "#B8FF3F", fontSize: 8 }}>
                        COPIED
                      </span>
                    )}
                  </td>

                  {/* Instagram */}
                  <td className="py-3 px-3">
                    {r.instagram_handle ? (
                      <a
                        href={`https://instagram.com/${r.instagram_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "0.75rem",
                          color: "#00D4FF",
                          textDecoration: "none",
                        }}
                      >
                        @{r.instagram_handle}
                      </a>
                    ) : (
                      <span style={{ opacity: 0.3 }}>—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    <Pill
                      label={r.status}
                      style={STATUS_COLORS[r.status] ?? { background: "#ffffff22", color: "#FFF8F0" }}
                    />
                  </td>

                  {/* Payment */}
                  <td className="py-3 px-3 relative">
                    <button
                      onClick={() =>
                        setOpenPayMenu((prev) => (prev === r.id ? null : r.id))
                      }
                      className="font-mono-micro px-2 py-1 rounded-full cursor-pointer transition-all"
                      style={{
                        fontSize: 9,
                        ...(PAYMENT_COLORS[r.payment_status] ?? { background: "#ffffff22", color: "#FFF8F0" }),
                        border: "1px solid transparent",
                      }}
                    >
                      {r.payment_status.toUpperCase()} ▾
                    </button>
                    {openPayMenu === r.id && (
                      <div
                        className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden shadow-2xl"
                        style={{
                          background: "#1A0B2E",
                          border: "1px solid rgba(255,255,255,0.15)",
                          zIndex: 100,
                          minWidth: 140,
                        }}
                      >
                        {(["unpaid", "pending", "paid"] as const).map((ps) => (
                          <button
                            key={ps}
                            onClick={() => {
                              update(r.id, { payment_status: ps });
                              setOpenPayMenu(null);
                            }}
                            className="w-full text-left font-mono-micro px-4 py-2 transition-all"
                            style={{
                              fontSize: 9,
                              color: PAYMENT_COLORS[ps]?.color ?? "#FFF8F0",
                              background:
                                r.payment_status === ps
                                  ? "rgba(255,255,255,0.05)"
                                  : "transparent",
                            }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLElement).style.background =
                                "rgba(255,255,255,0.08)")
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLElement).style.background =
                                r.payment_status === ps
                                  ? "rgba(255,255,255,0.05)"
                                  : "transparent")
                            }
                          >
                            {ps.toUpperCase()}
                          </button>
                        ))}
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "4px 0" }}>
                          {(["cash", "ecocash"] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => {
                                update(r.id, { payment_method: m });
                                setOpenPayMenu(null);
                              }}
                              className="w-full text-left font-mono-micro px-4 py-1 transition-all"
                              style={{
                                fontSize: 8,
                                color:
                                  r.payment_method === m
                                    ? "#FFD23F"
                                    : "rgba(255,248,240,0.4)",
                              }}
                              onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLElement).style.color = "#FFD23F")
                              }
                              onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLElement).style.color =
                                  r.payment_method === m
                                    ? "#FFD23F"
                                    : "rgba(255,248,240,0.4)")
                              }
                            >
                              {m.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Ticket */}
                  <td className="py-3 px-3">
                    {r.payment_status === "unpaid" ? (
                      <span className="font-mono-micro" style={{ opacity: 0.3, fontSize: 9 }}>
                        —
                      </span>
                    ) : (
                      <button
                        onClick={() => setTicketReg(r)}
                        className="font-mono-micro px-2 py-1 rounded-full"
                        style={{
                          background: "#B8FF3F22",
                          color: "#B8FF3F",
                          fontSize: 9,
                          border: "1px solid rgba(184,255,63,0.3)",
                        }}
                      >
                        TICKET
                      </button>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="py-3 px-3" style={{ maxWidth: 160 }}>
                    {editingNote === r.id ? (
                      <input
                        autoFocus
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        onBlur={() => {
                          update(r.id, { notes: noteValue });
                          setEditingNote(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            update(r.id, { notes: noteValue });
                            setEditingNote(null);
                          }
                          if (e.key === "Escape") setEditingNote(null);
                        }}
                        className="rounded-lg px-2 py-1 text-white outline-none w-full"
                        style={{
                          background: "rgba(0,0,0,0.4)",
                          border: "1px solid rgba(255,61,139,0.5)",
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.75rem",
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => {
                          setEditingNote(r.id);
                          setNoteValue(r.notes ?? "");
                        }}
                        className="cursor-pointer block text-sm"
                        style={{
                          color: r.notes ? "rgba(255,248,240,0.6)" : "rgba(255,248,240,0.25)",
                          fontStyle: r.notes ? "normal" : "italic",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 140,
                        }}
                        title={r.notes || "click to add note"}
                      >
                        {r.notes ? (r.notes.length > 30 ? r.notes.slice(0, 30) + "…" : r.notes) : "+ add note"}
                      </span>
                    )}
                  </td>

                  {/* Date */}
                  <td
                    className="py-3 px-3 font-mono-micro"
                    style={{ fontSize: 9, opacity: 0.4, whiteSpace: "nowrap" }}
                  >
                    {timeAgo(r.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      {/* WhatsApp */}
                      {r.phone && (
                        <a
                          href={`https://wa.me/${r.phone.replace(/\D/g, "")}?text=${encodeURIComponent(waMsg(r))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono-micro px-2 py-1 rounded-lg"
                          style={{ background: "#25D366", color: "#fff", fontSize: 9, textDecoration: "none" }}
                          title="WhatsApp"
                        >
                          WA
                        </a>
                      )}
                      {/* Promote (waitlist → approved) */}
                      {r.status === "waitlist" && (
                        <button
                          onClick={() => update(r.id, { status: "approved" })}
                          className="font-mono-micro px-2 py-1 rounded-lg"
                          style={{ background: "#B8FF3F22", color: "#B8FF3F", fontSize: 9, border: "1px solid rgba(184,255,63,0.3)" }}
                          title="Promote to approved"
                        >
                          UP
                        </button>
                      )}
                      {/* Approve */}
                      {r.status !== "approved" && (
                        <button
                          onClick={() => update(r.id, { status: "approved" })}
                          className="font-mono-micro px-2 py-1 rounded-lg"
                          style={{ background: "#00D4FF22", color: "#00D4FF", fontSize: 9 }}
                          title="Approve"
                        >
                          ✓
                        </button>
                      )}
                      {/* Pending */}
                      <button
                        onClick={() => update(r.id, { status: "pending" })}
                        className="font-mono-micro px-2 py-1 rounded-lg"
                        style={{ background: "#FFD23F22", color: "#FFD23F", fontSize: 9 }}
                        title="Set pending"
                      >
                        ↻
                      </button>
                      {/* Reject */}
                      {r.status !== "rejected" && (
                        <button
                          onClick={() => update(r.id, { status: "rejected" })}
                          className="font-mono-micro px-2 py-1 rounded-lg"
                          style={{ background: "#FF3D8B22", color: "#FF3D8B", fontSize: 9 }}
                          title="Reject"
                        >
                          ✕
                        </button>
                      )}
                      {/* Delete */}
                      <button
                        onClick={() => setConfirmDelete(r.id)}
                        className="font-mono-micro px-2 py-1 rounded-lg"
                        style={{ background: "rgba(255,61,61,0.15)", color: "#FF6B6B", fontSize: 9 }}
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Door Mode ─────────────────────────────────────────────────────────────────

function DoorMode({
  pw,
  registrations,
}: {
  pw: string;
  registrations: Registration[];
}) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"NOT_IN" | "IN" | "ALL" | "UNPAID">("NOT_IN");
  const [showScanner, setShowScanner] = useState(false);
  const [showWalkup, setShowWalkup] = useState(false);
  const [checkinTarget, setCheckinTarget] = useState<Registration | null>(null);
  const checkinMutation = useCheckin();
  const updateMutation = useUpdateRegistration();

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetRegistrationsQueryKey() });
  }

  const expected = registrations.filter((r) =>
    ["approved", "pending"].includes(r.status),
  ).length;
  const arrived = registrations.filter((r) => r.checked_in).length;

  let filtered = registrations.filter((r) => {
    const q = search.toLowerCase();
    if (q && !r.full_name.toLowerCase().includes(q)) return false;
    if (filter === "NOT_IN") return !r.checked_in && r.status !== "rejected";
    if (filter === "IN") return r.checked_in;
    if (filter === "UNPAID") return r.payment_status === "unpaid" && !r.checked_in;
    return true;
  });
  filtered = [...filtered].sort((a, b) => {
    if (a.checked_in !== b.checked_in)
      return a.checked_in ? 1 : -1;
    return a.full_name.localeCompare(b.full_name);
  });

  function doCheckin(r: Registration, collectCash: boolean) {
    checkinMutation.mutate(
      {
        data: { id: r.id, collect_cash: collectCash },
        headers: { "x-admin-password": pw },
      } as Parameters<typeof checkinMutation.mutate>[0],
      { onSuccess: invalidate },
    );
  }

  function undoCheckin(r: Registration) {
    updateMutation.mutate(
      {
        id: r.id,
        data: { checked_in: false },
        headers: { "x-admin-password": pw },
      } as Parameters<typeof updateMutation.mutate>[0],
      { onSuccess: invalidate },
    );
  }

  const pct = expected > 0 ? Math.round((arrived / expected) * 100) : 0;
  const counterColor = pct >= 80 ? "#B8FF3F" : pct >= 50 ? "#FFD23F" : "#FF3D8B";

  return (
    <div>
      {showScanner && (
        <QRScanner
          pw={pw}
          onFound={(reg) => {
            setShowScanner(false);
            setCheckinTarget(reg);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
      {showWalkup && (
        <WalkupModal
          pw={pw}
          onClose={() => {
            setShowWalkup(false);
            invalidate();
          }}
        />
      )}
      {checkinTarget && (
        <CheckinConfirmation
          reg={checkinTarget}
          pw={pw}
          onDone={() => {
            setCheckinTarget(null);
            invalidate();
          }}
        />
      )}

      {/* Counter */}
      <div
        className="card-surface p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderRadius: "1.25rem" }}
      >
        <div className="text-center">
          <p className="font-mono-micro mb-1" style={{ opacity: 0.5 }}>
            ARRIVED / EXPECTED
          </p>
          <p
            className="font-display"
            style={{ fontSize: "3rem", lineHeight: 1, color: counterColor }}
          >
            {arrived}{" "}
            <span style={{ color: "rgba(255,248,240,0.3)", fontSize: "2rem" }}>
              /
            </span>{" "}
            {expected}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowScanner(true)}
            className="btn-primary px-6 py-4"
          >
            SCAN TICKET
          </button>
          <button
            onClick={() => setShowWalkup(true)}
            className="btn-ghost px-6 py-4"
            style={{ borderColor: "#00D4FF", color: "#00D4FF" }}
          >
            + WALK-UP
          </button>
        </div>
      </div>

      {/* Search + filter */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search name..."
        className="w-full rounded-xl px-4 py-4 text-white outline-none mb-4"
        style={{
          background: "rgba(0,0,0,0.3)",
          border: "2px solid rgba(255,255,255,0.1)",
          fontFamily: "Inter, sans-serif",
          fontSize: "1.1rem",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#FF3D8B")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
      />
      <div className="flex gap-2 mb-6 flex-wrap">
        {(
          [
            { k: "NOT_IN", label: "NOT YET IN" },
            { k: "IN", label: "ALREADY IN" },
            { k: "ALL", label: "ALL" },
            { k: "UNPAID", label: "UNPAID ONLY" },
          ] as const
        ).map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className="font-mono-micro px-4 py-2 rounded-full transition-all"
            style={{
              fontSize: 9,
              background: filter === f.k ? "#FF3D8B" : "rgba(255,255,255,0.05)",
              color: filter === f.k ? "#FFF8F0" : "rgba(255,255,255,0.5)",
              border: "1px solid",
              borderColor: filter === f.k ? "#FF3D8B" : "rgba(255,255,255,0.1)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="card-surface p-5 transition-all"
            style={{
              borderRadius: "1.25rem",
              ...(r.checked_in && {
                background: "linear-gradient(180deg, rgba(184,255,63,0.08), rgba(26,11,46,0.7))",
                borderColor: "rgba(184,255,63,0.2)",
              }),
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p
                  className="font-display"
                  style={{ fontSize: "1.4rem", color: "#FFF8F0", lineHeight: 1.2 }}
                >
                  {r.full_name}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Pill
                    label={r.gender === "female" ? "W" : "M"}
                    style={
                      r.gender === "female"
                        ? { background: "#FF3D8B22", color: "#FF3D8B" }
                        : { background: "#00D4FF22", color: "#00D4FF" }
                    }
                  />
                  <Pill
                    label={r.payment_status}
                    style={PAYMENT_COLORS[r.payment_status] ?? { background: "#ffffff22", color: "#FFF8F0" }}
                  />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {r.checked_in ? (
                  <>
                    <span
                      className="font-mono-micro px-3 py-2 rounded-xl"
                      style={{
                        background: "#B8FF3F22",
                        color: "#B8FF3F",
                        border: "1px solid rgba(184,255,63,0.3)",
                        fontSize: 9,
                      }}
                    >
                      IN {r.checked_in_at ? `@ ${checkinTime(r.checked_in_at)}` : ""}
                    </span>
                    <button
                      onClick={() => undoCheckin(r)}
                      className="font-mono-micro"
                      style={{ color: "rgba(255,248,240,0.3)", fontSize: 9, textDecoration: "underline" }}
                    >
                      ↩ Undo
                    </button>
                  </>
                ) : r.payment_status === "paid" ? (
                  <button
                    onClick={() => doCheckin(r, false)}
                    disabled={checkinMutation.isPending}
                    className="btn-primary px-5 py-3"
                    style={{
                      fontSize: "0.875rem",
                      background: "linear-gradient(135deg, #00D4FF, #0099BB)",
                      minWidth: 120,
                    }}
                  >
                    ✓ CHECK IN
                  </button>
                ) : (
                  <button
                    onClick={() => doCheckin(r, true)}
                    disabled={checkinMutation.isPending}
                    className="btn-primary px-5 py-3"
                    style={{ fontSize: "0.8rem", minWidth: 160 }}
                  >
                    💵 US$20 + CHECK IN
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center font-mono-micro py-12" style={{ opacity: 0.3 }}>
            {filter === "NOT_IN" ? "Everyone is already checked in!" : "No results."}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [pw, setPw] = useState<string>(
    () => sessionStorage.getItem("jamcritty.adminpw") ?? "",
  );
  const [inputPw, setInputPw] = useState("");
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<"list" | "door">("list");
  const prevCountRef = useRef(0);

  const {
    data: registrations = [],
    isLoading,
    isError,
  } = useGetRegistrations(undefined, {
    query: {
      queryKey: getGetRegistrationsQueryKey(),
      enabled: !!pw,
      refetchInterval: 10000,
    },
    request: { headers: { "x-admin-password": pw } },
  });

  // Detect auth failure
  useEffect(() => {
    if (isError && pw) {
      sessionStorage.removeItem("jamcritty.adminpw");
      setPw("");
      setAuthError("Incorrect password.");
    }
  }, [isError, pw]);

  useEffect(() => {
    prevCountRef.current = registrations.length;
  }, [registrations.length]);

  function login() {
    setAuthError("");
    sessionStorage.setItem("jamcritty.adminpw", inputPw);
    setPw(inputPw);
    setInputPw("");
  }

  if (!pw) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(255,61,139,0.2), transparent 50%), #1A0B2E",
        }}
      >
        <div className="card-surface p-8 w-full max-w-sm">
          <div className="mb-6 text-center">
            <p className="font-display text-3xl" style={{ color: "#FFF8F0" }}>
              JAM <span style={{ color: "#FF3D8B" }}>CRITTY</span>
            </p>
            <p className="font-mono-micro mt-2" style={{ opacity: 0.4 }}>
              ADMIN ACCESS ONLY
            </p>
          </div>
          <input
            type="password"
            value={inputPw}
            onChange={(e) => setInputPw(e.target.value)}
            placeholder="Password..."
            className="w-full rounded-xl px-4 py-4 text-white outline-none mb-4"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: `2px solid ${authError ? "rgba(255,61,139,0.5)" : "rgba(255,255,255,0.1)"}`,
              fontFamily: "Inter, sans-serif",
            }}
            onKeyDown={(e) => e.key === "Enter" && login()}
            onFocus={(e) => (e.target.style.borderColor = "#FF3D8B")}
            onBlur={(e) =>
              (e.target.style.borderColor = authError
                ? "rgba(255,61,139,0.5)"
                : "rgba(255,255,255,0.1)")
            }
          />
          {authError && (
            <p className="font-mono-micro mb-4" style={{ color: "#FF3D8B" }}>
              {authError}
            </p>
          )}
          <button onClick={login} className="btn-primary w-full py-4">
            ENTER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{ color: "#FFF8F0", background: "rgba(26,11,46,0.97)" }}
    >
      {/* Top bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <p className="font-display text-xl" style={{ color: "#FFF8F0" }}>
            JAM <span style={{ color: "#FF3D8B" }}>CRITTY</span> / DASHBOARD
          </p>
          <div
            className="w-2 h-2 rounded-full animate-pulse-dot"
            style={{ background: "#B8FF3F" }}
            title="Live"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)", padding: 4 }}
          >
            {(["list", "door"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="font-display px-5 py-2 rounded-lg transition-all"
                style={{
                  fontSize: "0.9rem",
                  background: tab === t ? "#FF3D8B" : "transparent",
                  color: tab === t ? "#FFF8F0" : "rgba(255,248,240,0.4)",
                }}
              >
                {t === "list" ? "LIST MODE" : "DOOR MODE"}
              </button>
            ))}
          </div>
          <button
            className="font-mono-micro px-4 py-2 rounded-xl transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 9,
              color: "rgba(255,248,240,0.5)",
            }}
            onClick={() => {
              sessionStorage.removeItem("jamcritty.adminpw");
              setPw("");
            }}
          >
            SIGN OUT
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p
            className="font-mono-micro animate-pulse"
            style={{ color: "#FF3D8B" }}
          >
            LOADING REGISTRATIONS...
          </p>
        </div>
      ) : tab === "list" ? (
        <ListMode pw={pw} registrations={registrations as unknown as Registration[]} />
      ) : (
        <DoorMode pw={pw} registrations={registrations as unknown as Registration[]} />
      )}
    </div>
  );
}
