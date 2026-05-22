import { useState, useEffect, useRef, useCallback } from "react";
import { useGetStats, useRegister } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ── Particles ────────────────────────────────────────────────────────────────

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile = window.innerWidth < 768;
    const N = isMobile ? 22 : 45;
    const COLORS = ["#FF3D8B", "#00D4FF", "#FFD23F"];

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      r: number; color: string; life: number; maxLife: number;
    };

    let W = 0, H = 0;
    const particles: Particle[] = [];
    let raf = 0;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    function spawn(): Particle {
      return {
        x: Math.random() * W,
        y: H + Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.2 + Math.random() * 0.5),
        r: 2 + Math.random() * 3,
        color: COLORS[Math.floor(Math.random() * 3)],
        life: 0,
        maxLife: 400 + Math.random() * 500,
      };
    }

    for (let i = 0; i < N; i++) {
      const p = spawn();
      p.y = Math.random() * H;
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        if (p.life > p.maxLife) Object.assign(p, spawn());

        const t = p.life / p.maxLife;
        const alpha = Math.sin(t * Math.PI) * 0.7;
        ctx!.save();
        ctx!.globalAlpha = alpha;
        ctx!.shadowBlur = 8;
        ctx!.shadowColor = p.color;
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ── Confetti ─────────────────────────────────────────────────────────────────

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ["#FF3D8B", "#00D4FF", "#FFD23F", "#B8FF3F", "#FF6B4A"];
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      w: 6 + Math.random() * 8,
      h: 8 + Math.random() * 12,
      rot: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      vr: (Math.random() - 0.5) * 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    let raf = 0;
    let frame = 0;

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      }
      frame++;
      if (frame < 300) raf = requestAnimationFrame(draw);
    }
    draw();

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 200 }}
    />
  );
}

// ── Countdown ─────────────────────────────────────────────────────────────────

const EVENT_DATE = new Date("2026-12-13T18:00:00+02:00");

function Countdown() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number; hours: number; mins: number; secs: number; over: boolean;
  }>({ days: 0, hours: 0, mins: 0, secs: 0, over: false });

  useEffect(() => {
    function calc() {
      const diff = EVENT_DATE.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0, over: true });
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ days, hours, mins, secs, over: false });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  if (timeLeft.over) {
    return (
      <div className="mt-8">
        <p className="font-display text-2xl" style={{ color: "#FF3D8B" }}>
          IT'S GOING DOWN — WE'RE LIVE
        </p>
      </div>
    );
  }

  const units = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HRS", value: timeLeft.hours },
    { label: "MIN", value: timeLeft.mins },
    { label: "SEC", value: timeLeft.secs },
  ];

  return (
    <div className="mt-8">
      <p className="font-mono-micro mb-3 text-cream" style={{ opacity: 0.6 }}>
        COUNTDOWN
      </p>
      <div className="flex gap-3 flex-wrap">
        {units.map((u) => (
          <div
            key={u.label}
            className="card-surface px-4 py-3 min-w-[72px] text-center"
            style={{ borderRadius: "1rem" }}
          >
            <p className="font-display text-3xl leading-none text-cream">
              {String(u.value).padStart(2, "0")}
            </p>
            <p className="font-mono-micro mt-1" style={{ color: "#00D4FF" }}>
              {u.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ICS download ──────────────────────────────────────────────────────────────

function downloadICS() {
  const start = "20261213T160000Z";
  const end = "20270101T000000Z";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JAM CRITTY//EN",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    "SUMMARY:JAM CRITTY VOL.01",
    "DESCRIPTION:Pool · Braai · Music · Good Energy. 50 spots only.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "JAM_CRITTY_VOL01.ics";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Form schema ───────────────────────────────────────────────────────────────

const formSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.enum(["female", "male"], { error: "Please select a gender" }),
  phone: z.string().min(6, "Please enter your phone number"),
  instagram_handle: z.string().min(1, "Instagram handle is required"),
  website: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ── Main component ────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [posterOpen, setPosterOpen] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: stats, refetch: refetchStats } = useGetStats({
    query: { refetchInterval: 15000 },
  });

  const registerMutation = useRegister();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      gender: "female",
      phone: "",
      instagram_handle: "",
      website: "",
    },
  });

  const onSubmit = useCallback(
    (values: FormValues) => {
      registerMutation.mutate(
        {
          data: {
            full_name: values.full_name,
            gender: values.gender,
            phone: values.phone,
            instagram_handle: values.instagram_handle.replace(/^@/, ""),
            website: values.website,
          },
        },
        {
          onSuccess: (data) => {
            const isWaitlisted = (data as { waitlisted?: boolean })?.waitlisted ?? false;
            setWaitlisted(isWaitlisted);
            if (!isWaitlisted) {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 5000);
            }
            refetchStats();
          },
        },
      );
    },
    [registerMutation, refetchStats],
  );

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  // Lock body scroll when poster is open
  useEffect(() => {
    document.body.style.overflow = posterOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [posterOpen]);

  const isFemale = form.watch("gender") === "female";
  const femaleFull = stats?.femaleFull ?? false;
  const maleFull = stats?.maleFull ?? false;
  const isFull = stats?.isFull ?? false;
  const currentGenderFull = isFemale ? femaleFull : maleFull;
  const isWaitlistMode = isFull || currentGenderFull;

  const successData = registerMutation.isSuccess
    ? (registerMutation.data as { registration?: { full_name?: string } })
    : null;
  const firstName = successData?.registration?.full_name?.split(" ")[0] ?? "";

  return (
    <div
      className="relative w-full min-h-[100dvh] text-white overflow-hidden"
      style={{ color: "#FFF8F0" }}
    >
      <Particles />
      {showConfetti && <Confetti />}

      {/* ── Loader ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 flex flex-col items-center justify-center"
            style={{
              zIndex: 999,
              background:
                "radial-gradient(ellipse at top, rgba(255,61,139,0.35), transparent 50%), radial-gradient(ellipse at bottom right, rgba(0,212,255,0.25), transparent 50%), #1A0B2E",
            }}
          >
            <div className="relative mb-6">
              <div
                className="absolute -top-8 -left-8 text-yellow text-4xl"
                style={{
                  animation: "spin 8s linear infinite",
                }}
              >
                ✦
              </div>
              <div
                className="absolute -bottom-6 -right-8 text-cyan text-3xl"
                style={{ animation: "spin 6s linear infinite reverse" }}
              >
                ✦
              </div>
            </div>
            <p className="font-mono-micro mb-4 text-cream" style={{ opacity: 0.6 }}>
              WARMING UP THE PARTY
            </p>
            <h1 className="font-display text-6xl text-cream mb-2">
              JAM <span className="rainbow-text">CRITTY</span>
            </h1>
            <p className="mt-2 font-mono-micro" style={{ color: "#00D4FF" }}>
              loading vibes
              <span
                style={{
                  display: "inline-block",
                  animation: "bounce 0.8s ease-in-out infinite",
                }}
              >
                ...
              </span>
            </p>
            <div
              className="mt-8 rounded-full overflow-hidden"
              style={{ width: 200, height: 4, background: "rgba(255,255,255,0.1)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FF3D8B, #00D4FF)",
                }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Poster Modal ── */}
      <AnimatePresence>
        {posterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 200, background: "rgba(0,0,0,0.92)" }}
            onClick={() => setPosterOpen(false)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src="/.netlify/images?url=/poster.jpg&w=900&q=80&fm=webp"
              alt="Event Poster"
              className="max-h-full max-w-full object-contain"
              style={{ borderRadius: "1.75rem" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative" style={{ zIndex: 10 }}>
        {/* ── Nav ── */}
        <nav className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse-dot"
              style={{ background: "#FF3D8B" }}
            />
            <span className="font-mono-micro" style={{ color: "#FFF8F0" }}>
              JAM CRITTY / VOL.01
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span style={{ color: "#FFD23F" }}>✦</span>
            <span className="font-mono-micro" style={{ color: "#FFF8F0" }}>
              POOL SZN '26
            </span>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="min-h-[100svh] flex flex-col justify-center p-6 relative">
          <div className="absolute inset-0 overflow-hidden" style={{ zIndex: -1 }}>
            <img
              src="/.netlify/images?url=/hero.jpg&w=1600&q=75&fm=webp"
              alt=""
              className="w-full h-full object-cover"
              fetchPriority="high"
              decoding="sync"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(26,11,46,0.4) 0%, rgba(26,11,46,0.85) 100%)",
              }}
            />
          </div>
          <motion.div
            className="max-w-xl"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.08 } },
              hidden: {},
            }}
          >
            {[
              <div key="eye" className="flex items-center gap-2 mb-4">
                <span style={{ color: "#00D4FF" }}>✨</span>
                <span className="font-mono-micro" style={{ color: "#FFF8F0" }}>
                  POOL · BRAAI · SUMMER VOL.01
                </span>
              </div>,
              <h1
                key="title"
                className="font-display leading-none mb-4"
                style={{ fontSize: "clamp(4rem,12vw,12rem)", color: "#FFF8F0" }}
              >
                JAM
                <br />
                <span className="rainbow-text block">CRITTY</span>
              </h1>,
              <p
                key="tag"
                className="font-display mb-6"
                style={{
                  fontSize: "clamp(1.5rem,4vw,2.5rem)",
                  color: "#FFF8F0",
                }}
              >
                POOL · BRAAI · MUSIC · GOOD ENERGY
              </p>,
              <p
                key="body"
                className="mb-8 max-w-md"
                style={{ color: "rgba(255,248,240,0.7)", fontSize: "1.1rem" }}
              >
                Day turns into night. Music goes off till late. 50 spots,
                that's it. Lock yours in before they're gone.
              </p>,
              <div key="btns" className="flex gap-4 flex-wrap">
                <a
                  href="#register"
                  className="btn-primary px-8 py-4 flex-1 sm:flex-none"
                >
                  REGISTER NOW
                </a>
                <a
                  href="#details"
                  className="btn-ghost px-8 py-4 flex-1 sm:flex-none"
                >
                  SEE DETAILS
                </a>
              </div>,
              <Countdown key="countdown" />,
            ].map((child, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: "easeOut" },
                  },
                }}
              >
                {child}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Marquee ── */}
        <div
          className="w-full flex items-center overflow-hidden"
          style={{
            background: "#FF3D8B",
            height: 64,
          }}
        >
          <div className="animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, ri) => (
              <span key={ri}>
                {[
                  "JAM CRITTY",
                  "POOL SZN",
                  "BRAAI ENERGY",
                  "GOOD VIBES ONLY",
                  "50 SPOTS",
                  "SUMMER VOL.01",
                ].map((t) => (
                  <span
                    key={t}
                    className="font-display mx-4"
                    style={{ fontSize: "1.75rem", color: "#FFF8F0" }}
                  >
                    {t}
                    <span className="mx-3">⭐</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* ── Event Details ── */}
        <section id="details" className="py-24 px-6 max-w-6xl mx-auto">
          <p className="font-mono-micro mb-4" style={{ color: "#FF3D8B" }}>
            WHAT'S INSIDE
          </p>
          <h2 className="font-display mb-12" style={{ fontSize: "clamp(2.5rem,7vw,5rem)", color: "#FFF8F0" }}>
            WHAT YOU'RE
            <br />
            <span style={{ color: "#FF3D8B" }}>WALKING INTO</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                img: "/card-entry.jpg",
                num: "01 / ENTRY",
                icon: "🍷",
                iconColor: "#FFD23F",
                headline: "US$20",
                body: "Includes food and the first round of drinks. One ticket, full vibes covered.",
              },
              {
                img: "/card-braai.jpg",
                num: "02 / THE SETUP",
                icon: "🔥",
                iconColor: "#FF3D8B",
                headline: "POOL + BRAAI",
                body: "Day grills into golden hour. Sound system runs from afternoon to late.",
              },
              {
                img: "/card-dresscode.jpg",
                num: "03 / DRESS CODE",
                icon: "👕",
                iconColor: "#00D4FF",
                headline: "SUMMER DRIP",
                body: "Pool-ready fits. Swims, shades, statement pieces. Look like the party.",
              },
              {
                img: "/card-limited.jpg",
                num: "04 / ACCESS",
                icon: "👥",
                iconColor: "#FFD23F",
                headline: "50 SPOTS",
                body: "Once they're gone, they're gone. Registration closes when full.",
              },
            ].map((card) => (
              <motion.div
                key={card.num}
                whileHover={{ y: -4 }}
                className="card-surface relative overflow-hidden group cursor-default"
                style={{ minHeight: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}
              >
                <div className="absolute inset-0 z-0">
                  <img
                    src={`/.netlify/images?url=${card.img}&w=800&q=75&fm=webp`}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "rgba(26,11,46,0.65)" }}
                  />
                </div>
                <div className="relative z-10 p-8">
                  <p className="font-mono-micro mb-3" style={{ opacity: 0.7 }}>
                    {card.num}
                  </p>
                  <h3
                    className="font-display mb-2"
                    style={{ fontSize: "2rem", color: "#FFF8F0" }}
                  >
                    {card.headline}
                  </h3>
                  <p style={{ color: "rgba(255,248,240,0.8)" }}>{card.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Poster ── */}
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <p className="font-mono-micro mb-4" style={{ color: "#00D4FF" }}>
                THE FLYER
              </p>
              <h2
                className="font-display mb-6"
                style={{ fontSize: "clamp(2.5rem,6vw,5rem)", color: "#FFF8F0" }}
              >
                SAVE IT.
                <br />
                <span style={{ color: "#00D4FF" }}>SEND IT.</span>
              </h2>
              <p style={{ color: "rgba(255,248,240,0.8)", fontSize: "1.1rem" }}>
                Tap the poster to enlarge. Long-press to save. Forward it to the
                people who'd actually show up and bring the energy.
              </p>
            </div>
            <div
              className="flex-1 w-full max-w-sm cursor-pointer"
              onClick={() => setPosterOpen(true)}
            >
              <div
                className="relative overflow-hidden border-2 shadow-2xl"
                style={{
                  aspectRatio: "3/4",
                  borderRadius: "1.75rem",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <img
                  src="/.netlify/images?url=/poster.jpg&w=600&q=80&fm=webp"
                  alt="Event Poster"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  className="absolute bottom-4 right-4 font-mono-micro px-4 py-2 rounded-full flex items-center gap-2"
                  style={{
                    background: "#FF3D8B",
                    color: "#FFF8F0",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  TAP TO ENLARGE
                </div>
                <div
                  className="absolute top-4 left-4 font-display text-4xl"
                  style={{
                    color: "#FFD23F",
                    transform: "rotate(-6deg)",
                    background: "rgba(26,11,46,0.5)",
                    borderRadius: "0.5rem",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  VOL. 01
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Break Strip ── */}
        <div
          className="w-full relative flex items-center justify-center overflow-hidden"
          style={{ height: "clamp(280px,30vw,380px)" }}
        >
          <img
            src="/.netlify/images?url=/break-pool.jpg&w=1400&q=75&fm=webp"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(26,11,46,0.9) 0%, rgba(26,11,46,0.3) 40%, rgba(26,11,46,0.3) 60%, rgba(26,11,46,0.9) 100%)",
            }}
          />
          <div className="relative z-10 text-center px-4">
            <h2
              className="font-display"
              style={{ fontSize: "clamp(1.75rem,5vw,4rem)", color: "#FFF8F0", lineHeight: 1.2 }}
            >
              <span style={{ color: "#FF3D8B" }}>ONE</span> DAY. ONE POOL.
              <br />
              ONE NIGHT YOU'LL{" "}
              <span style={{ color: "#00D4FF" }}>REMEMBER.</span>
            </h2>
          </div>
          <span
            className="absolute top-8 left-12 font-display text-5xl"
            style={{
              color: "#FFD23F",
              transform: "rotate(10deg)",
              opacity: 0.7,
            }}
          >
            ✦
          </span>
          <span
            className="absolute bottom-8 right-12 font-display text-3xl"
            style={{
              color: "#FFD23F",
              transform: "rotate(-5deg)",
              opacity: 0.5,
            }}
          >
            ✦
          </span>
        </div>

        {/* ── Register ── */}
        <section id="register" className="py-24 px-6 max-w-4xl mx-auto">
          <p className="font-mono-micro mb-4" style={{ color: "#FF3D8B" }}>
            LOCK YOUR SPOT
          </p>
          <h2
            className="font-display mb-6"
            style={{ fontSize: "clamp(2.5rem,7vw,5rem)", color: "#FFF8F0" }}
          >
            MAKE IT
            <br />
            <span style={{ color: "#FF3D8B" }}>OFFICIAL.</span>
          </h2>
          <p className="mb-12" style={{ color: "rgba(255,248,240,0.8)", fontSize: "1.1rem" }}>
            Drop your details. We'll WhatsApp you the address and final
            instructions 48 hours before. Don't share the spot — share the
            vibes.
          </p>


          {/* Form or success */}
          <div className="card-surface p-8 md:p-10">
            {registerMutation.isSuccess ? (
              waitlisted ? (
                /* Waitlist success */
                <div className="text-center py-12">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: "rgba(255,210,63,0.2)" }}
                  >
                    <span style={{ fontSize: "2.5rem" }}>⏳</span>
                  </div>
                  <h3 className="font-display mb-2" style={{ fontSize: "2.5rem", color: "#FFF8F0" }}>
                    YOU'RE ON
                    <br />
                    THE WAITLIST
                  </h3>
                  <p className="mb-8" style={{ color: "rgba(255,248,240,0.7)" }}>
                    We'll WhatsApp you the moment a spot opens up.
                  </p>
                  <div className="flex flex-col gap-4 max-w-sm mx-auto">
                    <a
                      href="https://wa.me/263776482053"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary py-3"
                    >
                      WHATSAPP US
                    </a>
                    <a
                      href="https://instagram.com/jamcritty"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost py-3"
                    >
                      FOLLOW ON IG
                    </a>
                  </div>
                  <p
                    className="mt-8 font-mono-micro"
                    style={{ color: "#FF3D8B" }}
                  >
                    KEEP YOUR PHONE ON — SPOTS MOVE FAST
                  </p>
                </div>
              ) : (
                /* Approved success */
                <div className="text-center py-12">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: "rgba(255,61,139,0.2)" }}
                  >
                    <span style={{ fontSize: "2.5rem" }}>🎉</span>
                  </div>
                  <h3
                    className="font-display mb-2"
                    style={{ fontSize: "2.5rem", color: "#FFF8F0" }}
                  >
                    YOU'RE{" "}
                    <span className="rainbow-text">IN</span>
                  </h3>
                  <p className="mb-8" style={{ color: "rgba(255,248,240,0.7)" }}>
                    {firstName ? `${firstName}, y` : "Y"}ou're locked in for JAM CRITTY. Keep an eye
                    on WhatsApp — we'll be in touch.
                  </p>
                  <div className="flex flex-col gap-4 max-w-sm mx-auto">
                    <button
                      onClick={downloadICS}
                      className="btn-ghost py-3"
                    >
                      ADD TO CALENDAR
                    </button>
                    <a
                      href="https://wa.me/263776482053"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary py-3"
                    >
                      WHATSAPP US
                    </a>
                    <a
                      href="https://instagram.com/jamcritty"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost py-3"
                    >
                      FOLLOW ON IG
                    </a>
                  </div>
                  <p
                    className="mt-8 font-mono-micro"
                    style={{ color: "#FF3D8B" }}
                  >
                    PRO TIP — DON'T POST THE FLYER PUBLICLY
                  </p>
                </div>
              )
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Name */}
                <div>
                  <label className="font-mono-micro block mb-3" style={{ opacity: 0.7 }}>
                    01 — FULL NAME
                  </label>
                  <input
                    placeholder="Your name"
                    {...form.register("full_name")}
                    className="w-full rounded-xl px-4 py-4 text-white outline-none transition-all"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "2px solid rgba(255,255,255,0.1)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "1rem",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#FF3D8B")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                  {form.formState.errors.full_name && (
                    <p className="mt-2 text-sm" style={{ color: "#FF3D8B" }}>
                      {form.formState.errors.full_name.message}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="font-mono-micro block mb-3" style={{ opacity: 0.7 }}>
                    02 — GENDER
                  </label>
                  <div className="flex gap-4">
                    {(["female", "male"] as const).map((g) => {
                      const label = g === "female" ? "WOMAN" : "MAN";
                      const activeColor = g === "female" ? "#FF3D8B" : "#00D4FF";
                      const isActive = form.watch("gender") === g;
                      const thisGenderFull = g === "female" ? femaleFull : maleFull;
                      return (
                        <div key={g} className="flex-1 relative">
                          <button
                            type="button"
                            onClick={() => form.setValue("gender", g)}
                            className="w-full py-4 rounded-xl font-display uppercase transition-all"
                            style={{
                              border: `2px solid ${isActive ? activeColor : "rgba(255,255,255,0.2)"}`,
                              background: isActive
                                ? `${activeColor}22`
                                : "transparent",
                              color: isActive ? activeColor : "rgba(255,255,255,0.5)",
                              fontSize: "1rem",
                            }}
                          >
                            {label}
                          </button>
                          {thisGenderFull && (
                            <span
                              className="absolute -top-2 -right-2 font-mono-micro px-2 py-0.5 rounded-full"
                              style={{
                                background: "#B8FF3F",
                                color: "#1A0B2E",
                                fontSize: "9px",
                              }}
                            >
                              WAITLIST
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {form.formState.errors.gender && (
                    <p className="mt-2 text-sm" style={{ color: "#FF3D8B" }}>
                      {form.formState.errors.gender.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="font-mono-micro block mb-3" style={{ opacity: 0.7 }}>
                    03 — PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    placeholder="077 648 2053"
                    {...form.register("phone")}
                    className="w-full rounded-xl px-4 py-4 text-white outline-none transition-all"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "2px solid rgba(255,255,255,0.1)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "1rem",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#FF3D8B")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                  {form.formState.errors.phone && (
                    <p className="mt-2 text-sm" style={{ color: "#FF3D8B" }}>
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Instagram */}
                <div>
                  <label className="font-mono-micro block mb-3" style={{ opacity: 0.7 }}>
                    04 — INSTAGRAM HANDLE
                  </label>
                  <input
                    placeholder="@yourhandle"
                    {...form.register("instagram_handle")}
                    className="w-full rounded-xl px-4 py-4 text-white outline-none transition-all"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "2px solid rgba(255,255,255,0.1)",
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "1rem",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#FF3D8B")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                  {form.formState.errors.instagram_handle && (
                    <p className="mt-2 text-sm" style={{ color: "#FF3D8B" }}>
                      {form.formState.errors.instagram_handle.message}
                    </p>
                  )}
                </div>

                {/* Honeypot */}
                <input
                  type="text"
                  {...form.register("website")}
                  tabIndex={-1}
                  style={{ position: "absolute", left: "-9999px" }}
                />

                {/* Error */}
                {registerMutation.isError && (
                  <div
                    className="rounded-xl p-4 text-sm"
                    style={{ background: "rgba(255,61,139,0.15)", border: "1px solid rgba(255,61,139,0.4)", color: "#FFF8F0" }}
                  >
                    {(() => {
                      const err = registerMutation.error as { data?: { error?: string }; message?: string } | null;
                      const serverMsg = err?.data?.error;
                      if (serverMsg) return serverMsg;
                      const msg = err?.message ?? "";
                      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Load failed")) {
                        return "Unable to connect to the server. Please check your connection and try again.";
                      }
                      if (msg.includes("429")) return "Too many attempts. Please wait a minute and try again.";
                      if (msg) return msg.replace(/^HTTP \d+ \w+:\s*/i, "");
                      return "Something went wrong. Please try again.";
                    })()}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full btn-primary py-5"
                    style={{ fontSize: "1.25rem" }}
                  >
                    {registerMutation.isPending
                      ? "PROCESSING..."
                      : isWaitlistMode
                      ? "JOIN WAITLIST"
                      : "CONFIRM SPOT"}
                  </button>
                  {isWaitlistMode && (
                    <p
                      className="font-mono-micro mt-3 text-center"
                      style={{ color: "#B8FF3F" }}
                    >
                      YOU'LL BE ON THE WAITLIST — WE'LL WHATSAPP YOU THE MOMENT
                      A SPOT OPENS.
                    </p>
                  )}
                  <p
                    className="text-center text-sm mt-4"
                    style={{ color: "rgba(255,248,240,0.4)" }}
                  >
                    By submitting you agree to be contacted via WhatsApp about
                    this event. No spam, no resale.
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* ── Socials ── */}
        <section id="contact" className="py-24 px-6 max-w-6xl mx-auto">
          <p className="font-mono-micro mb-4" style={{ color: "#FFD23F" }}>
            STAY CLOSE
          </p>
          <h2
            className="font-display mb-12"
            style={{ fontSize: "clamp(2.5rem,7vw,5rem)", lineHeight: 1.15, color: "#FFF8F0" }}
          >
            FOLLOW.
            <br />
            <span style={{ color: "#00D4FF" }}>MESSAGE.</span>
            <br />
            DON'T MISS OUT.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="https://instagram.com/jamcritty"
              target="_blank"
              rel="noopener noreferrer"
              className="card-surface p-8 block group"
              style={{ transition: "border-color 0.2s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#FF3D8B")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)")}
            >
              <p className="font-mono-micro mb-6" style={{ opacity: 0.6 }}>
                INSTAGRAM
              </p>
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-3xl"
                style={{ background: "#FF3D8B" }}
              >
                📷
              </div>
              <h3
                className="font-display mb-4"
                style={{ fontSize: "2rem", color: "#FFF8F0" }}
              >
                @jamcritty
              </h3>
              <p style={{ color: "rgba(255,248,240,0.7)" }}>
                Behind-the-scenes drops, recap reels, next event leaks.
              </p>
            </a>
            <div className="card-surface p-8">
              <p className="font-mono-micro mb-6" style={{ opacity: 0.6 }}>
                WHATSAPP
              </p>
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-3xl"
                style={{ background: "#00D4FF" }}
              >
                💬
              </div>
              <p
                className="font-mono-micro mb-3"
                style={{ color: "#00D4FF" }}
              >
                EITHER WORKS — HIT US UP
              </p>
              <a
                href="https://wa.me/263776482053"
                target="_blank"
                rel="noopener noreferrer"
                className="block font-display mb-2"
                style={{
                  fontSize: "1.4rem",
                  color: "#FFF8F0",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#00D4FF")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#FFF8F0")}
              >
                +263 77 648 2053
              </a>
              <a
                href="https://wa.me/263781093789"
                target="_blank"
                rel="noopener noreferrer"
                className="block font-display mb-6"
                style={{
                  fontSize: "1.4rem",
                  color: "#FFF8F0",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#00D4FF")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#FFF8F0")}
              >
                +263 78 109 3789
              </a>
              <p style={{ color: "rgba(255,248,240,0.7)" }}>
                Quick questions, plus-ones, group transport — straight to us.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-24 px-6 max-w-4xl mx-auto">
          <p className="font-mono-micro mb-4" style={{ color: "#00D4FF" }}>
            QUESTIONS
          </p>
          <h2
            className="font-display mb-12"
            style={{ fontSize: "clamp(2.5rem,7vw,5rem)", color: "#FFF8F0" }}
          >
            BEFORE YOU
            <br />
            <span style={{ color: "#00D4FF" }}>DM US.</span>
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {[
              {
                q: "WHERE IS IT?",
                a: "The address goes out via WhatsApp 48 hours before — only to confirmed registrants. We do this to keep the party who we want it to be.",
              },
              {
                q: "CAN I BRING A PLUS-ONE?",
                a: "They register themselves with their own details — every body counts toward the 50-cap. Ratio rules.",
              },
              {
                q: "WHAT IF I'M RUNNING LATE?",
                a: "Doors close at 8 PM regardless. Show up early — the pool and braai hours are the best part anyway.",
              },
              {
                q: "REFUND POLICY?",
                a: "Entry is US$20. We'll sort payment with you via WhatsApp once you're confirmed. No refunds — just don't ghost, that's how you get cut from the next one.",
              },
            ].map((item, i) => (
              <AccordionItem
                key={i}
                value={`q${i}`}
                className="card-surface overflow-hidden"
                style={{ border: "2px solid rgba(255,255,255,0.08)" }}
              >
                <AccordionTrigger
                  className="px-6 py-5 font-display text-left hover:no-underline"
                  style={{ fontSize: "1.1rem", color: "#FFF8F0" }}
                >
                  {item.q}
                </AccordionTrigger>
                <AccordionContent
                  className="px-6 pb-5"
                  style={{ color: "rgba(255,248,240,0.75)", fontSize: "1rem", lineHeight: 1.7 }}
                >
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ── Footer ── */}
        <footer
          className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 mt-20"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span className="font-display text-2xl" style={{ color: "#FFF8F0" }}>
            JAM <span style={{ color: "#FF3D8B" }}>CRITTY</span>
          </span>
          <span className="font-mono-micro" style={{ color: "rgba(255,248,240,0.4)" }}>
            © 2026 — POOL SZN FOREVER
          </span>
        </footer>
      </div>
    </div>
  );
}
