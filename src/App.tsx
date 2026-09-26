import type { SubmitEvent, KeyboardEvent, ElementType } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PhoneInput, {
  getCountryCallingCode,
  isValidPhoneNumber,
  type Country,
} from "react-phone-number-input";
import {
  FaLinkedinIn,
  FaXTwitter,
  FaFacebookF,
  FaWhatsapp,
} from "react-icons/fa6";
import leadShot from "./assets/images/lead-shot.webp";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function reveal(delay: number) {
  return {
    initial: reduced ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.62, delay, ease: EASE },
  };
}

interface PathData {
  id: string;
  name: string;
  sub: string;
  weeks: string[];
}

const PATHS: PathData[] = [
  {
    id: "cloud",
    name: "Cloud & DevOps",
    sub: "Cloud & DevOps and Network Engineering \u2014 AWS, Docker, Kubernetes, Terraform.",
    weeks: [
      "Set up AWS and map how the cloud works",
      "Launch and reach your first EC2 server",
      "Put a live site on S3 and CloudFront",
      "Build a three-tier VPC from scratch",
      "Stand up a LAMP stack inside your VPC",
      "Wire a managed RDS database to your app",
      "Lock it down with IAM roles and MFA",
      "Ship billing alerts and a cost report",
      "Put CloudWatch and CloudTrail on everything",
      "Write your first infrastructure-as-code template",
      "Run a Git branching workflow that holds",
      "Containerise an application with Docker",
      "Push images to ECR and run them live",
      "Capstone: an auto-scaling site on AWS",
    ],
  },
  {
    id: "security",
    name: "Cybersecurity",
    sub: "From Security+ foundations to authorised penetration testing and incident response.",
    weeks: [
      "Map the CIA triad onto a real business",
      "Capture and read your first packet trace",
      "Subnet and defend a small office network",
      "Harden a Windows domain with group policy",
      "Harden a Linux server to CIS benchmarks",
      "Run a phishing awareness simulation",
      "Break down malware families and delivery",
      "Roll out MFA and role-based access",
      "Encrypt, hash and issue a certificate",
      "Sweep a network with Nmap and triage it",
      "Analyse live logs inside a SIEM",
      "Write an incident response runbook",
      "Complete a full vulnerability assessment",
      "Capstone: security audit with a board summary",
    ],
  },
  {
    id: "software",
    name: "Software Development",
    sub: "Frontend, Backend and Mobile \u2014 React, Python, Flutter and React Native.",
    weeks: [
      "Ship a semantic, responsive page",
      "Rebuild it in Tailwind, then in Bootstrap",
      "Make JavaScript do real work on the page",
      "Fetch live API data without it breaking",
      "Your first React components and props",
      "State, effects and a form that validates",
      "Add routing and lazy loading",
      "Handle loading, empty and error states",
      "Design a database and query it in SQL",
      "Build an API with Django or FastAPI",
      "Add JWT auth and protect your routes",
      "Connect your frontend to your own API",
      "Deploy the whole stack to the internet",
      "Capstone: a working e-commerce app, live",
    ],
  },
  {
    id: "data",
    name: "Data & AI",
    sub: "Data Analytics + BI and Prompt Engineering \u2014 SQL, Python, Power BI, Tableau.",
    weeks: [
      "Turn a messy sheet into clean data",
      "Build a pivot dashboard that answers a question",
      "Write SQL joins that survive real data",
      "Segment customers with a single query",
      "Clean an e-commerce dataset in pandas",
      "Find the story inside descriptive stats",
      "Run an A/B test and read it honestly",
      "Model your first Power BI dataset with DAX",
      "Design a dashboard an executive will use",
      "Rebuild it in Tableau and compare",
      "Build a prompt library for your real work",
      "Automate a weekly report end to end",
      "Present findings to a non-technical room",
      "Capstone: a BI solution for a Nigerian SME",
    ],
  },
  {
    id: "business",
    name: "Business & Product",
    sub: "Product Management & Design and Digital Marketing \u2014 research, Figma, agile, growth.",
    weeks: [
      "Run five user interviews and synthesise them",
      "Turn interviews into a persona and a journey",
      "Size the market and read the competition",
      "Wireframe the solution in Figma",
      "Prototype it and test with five people",
      "Write a PRD an engineer can build from",
      "Prioritise with RICE and defend your call",
      "Build a roadmap with real trade-offs",
      "Run a sprint from planning to review",
      "Instrument the funnel in GA4",
      "Position the product and write the copy",
      "Launch a 30-day campaign on a budget",
      "Read the numbers and decide what is next",
      "Capstone: product case study and pitch",
    ],
  },
];

type FieldName = "name" | "phone" | "email" | "course";
type FieldErrors = Partial<Record<FieldName, string>>;

function findPath(id: string): PathData {
  return PATHS.find((p) => p.id === id) ?? PATHS[0];
}

interface CountryOption {
  value?: string;
  label: string;
  divider?: boolean;
}

interface CountryCodeSelectProps {
  value?: string;
  options: CountryOption[];
  onChange: (value?: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  iconComponent?: ElementType;
  "aria-label"?: string;
}

function CountryCodeSelect({
  value,
  options,
  onChange,
  onFocus,
  onBlur,
  disabled,
  readOnly,
  iconComponent: Icon,
  "aria-label": ariaLabel,
}: CountryCodeSelectProps) {
  const callingCode = (country?: string) =>
    country ? "+" + getCountryCallingCode(country as Country) : "";
  const selected = options.find((o) => !o.divider && o.value === value);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const activeValue =
    options[active] && !options[active].divider ? options[active].value : undefined;

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children[active] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openList = () => {
    const idx = options.findIndex((o) => !o.divider && o.value === value);
    if (idx >= 0) setActive(idx);
    const r = rootRef.current?.getBoundingClientRect();
    if (r) setDropUp(r.bottom + 250 > window.innerHeight && r.top > 250);
    setOpen(true);
  };

  const pick = (v?: string) => {
    onChange(v);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        openList();
        return;
      }
      setActive((i) => (e.key === "ArrowDown" ? Math.min(i + 1, last) : Math.max(i - 1, 0)));
    } else if (!open && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openList();
    } else if (open && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      pick(activeValue);
    } else if (open && (e.key === "Home" || e.key === "End")) {
      e.preventDefault();
      setActive(e.key === "Home" ? 0 : last);
    } else if (open && e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (open && e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div
      className={"cc" + (open ? " open" : "") + (dropUp ? " up" : "")}
      ref={rootRef}
    >
      <button
        type="button"
        className="cc-trigger"
        ref={triggerRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? listId + "-o" + active : undefined}
        aria-label={ariaLabel}
        disabled={disabled || readOnly}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {Icon ? (
          <Icon country={value} label={selected ? selected.label : ""} />
        ) : null}
        <span className="cc-code">{value ? callingCode(value) : "Intl"}</span>
        <svg className="cc-caret" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <ul className="cc-list" role="listbox" aria-label={ariaLabel} id={listId} ref={listRef}>
          {options.map((o, i) =>
            o.divider ? (
              <li className="cc-div" key="div" role="presentation" />
            ) : (
              <li
                className={"cc-opt" + (o.value === value ? " on" : "")}
                key={o.value}
                id={listId + "-o" + i}
                role="option"
                aria-selected={o.value === value}
                data-active={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o.value)}
              >
                <span className="cc-opt-name">{o.label}</span>
                <span className="cc-opt-code">{callingCode(o.value)}</span>
              </li>
            )
          )}
        </ul>
      ) : null}
    </div>
  );
}

interface ConfettiPiece {
  left: string;
  background: string;
  x: number;
  y: number;
  rotate: number;
  delay: number;
}

function makeConfetti(): ConfettiPiece[] {
  if (reduced) return [];
  const cols = ["#E2680C", "#0F51C4", "#F4A24E", "#0A3A8C"];
  return Array.from({ length: 30 }, (_, i) => ({
    left: (46 + Math.random() * 8).toFixed(0) + "%",
    background: cols[i % 4],
    x: (Math.random() - 0.5) * 480,
    y: 130 + Math.random() * 430,
    rotate: Math.random() * 860 - 430,
    delay: (Math.random() * 110) / 1000,
  }));
}

export default function App() {
  const [active, setActive] = useState("cloud");
  const [course, setCourse] = useState("");
  const [pathRev, setPathRev] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const [phase, setPhase] = useState<"idle" | "sending" | "tick">("idle");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [wonLabel, setWonLabel] = useState("");
  const [position, setPosition] = useState<number | null>(null);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [dockOn, setDockOn] = useState(false);

  const leadRef = useRef<HTMLElement>(null);
  const joinRef = useRef<HTMLElement>(null);
  const wonRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const leadEl = leadRef.current;
    const joinEl = joinRef.current;
    if (!leadEl || !joinEl || !("IntersectionObserver" in window)) return;
    let pastLead = false;
    let atJoin = false;
    const sync = () => setDockOn(pastLead && !atJoin);
    const io1 = new IntersectionObserver(
      (en) => {
        pastLead = !en[0].isIntersecting;
        sync();
      },
      { rootMargin: "-60px 0px 0px 0px" },
    );
    const io2 = new IntersectionObserver(
      (en) => {
        atJoin = en[0].isIntersecting;
        sync();
      },
      { threshold: 0.12 },
    );
    io1.observe(leadEl);
    io2.observe(joinEl);
    return () => {
      io1.disconnect();
      io2.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!success) return;
    wonRef.current?.scrollIntoView({ block: "nearest" });
  }, [success]);

  useEffect(() => {
    if (!success || !position || position <= 1 || reduced) return;
    const el = posRef.current;
    if (!el) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 850);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = "#" + Math.round(position * e);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [success, position]);

  const board = findPath(active);

  const formLink = location.origin + location.pathname + "#join";

  const clearErr = (f: FieldName) =>
    setErrors((prev) => (prev[f] ? { ...prev, [f]: undefined } : prev));

  const setErr = (f: FieldName, msg: string) =>
    setErrors((prev) =>
      msg ? { ...prev, [f]: msg } : { ...prev, [f]: undefined },
    );

  const fieldError = (f: FieldName): string => {
    switch (f) {
      case "name":
        return name.trim().length >= 2
          ? ""
          : "Enter your full name so we know who to contact.";
      case "phone":
        if (phone.trim() === "")
          return "Enter your number so we know where to reach you.";
        return isValidPhoneNumber(phone)
          ? ""
          : "That number is not valid yet. Check the digits you typed.";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
          ? ""
          : "That email does not look right. Check for a typo.";
      case "course":
        return course !== "" ? "" : "Pick the path you want to start with.";
    }
  };

  const validateField = (f: FieldName) => setErr(f, fieldError(f));

  const validateAll = (): boolean => {
    const nm = fieldError("name");
    const ph = fieldError("phone");
    const em = fieldError("email");
    const cs = fieldError("course");
    setErrors({
      name: nm || undefined,
      phone: ph || undefined,
      email: em || undefined,
      course: cs || undefined,
    });
    const first: FieldName | null = nm
      ? "name"
      : ph
        ? "phone"
        : em
          ? "email"
          : cs
            ? "course"
            : null;
    if (first) {
      if (first === "course") document.getElementById("course")?.focus();
      else document.getElementById(first)?.focus();
      return false;
    }
    return true;
  };

  const setPathFromTab = (id: string) => {
    setActive(id);
    setCourse(id);
    setPathRev((r) => r + 1);
    clearErr("course");
  };

  const onSelectChange = (v: string) => {
    setCourse(v);
    if (v !== active) {
      setActive(v);
      setPathRev((r) => r + 1);
    }
    clearErr("course");
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const k = e.key;
    let n: number | null = null;
    if (k === "ArrowRight") n = (idx + 1) % PATHS.length;
    else if (k === "ArrowLeft") n = (idx - 1 + PATHS.length) % PATHS.length;
    else if (k === "Home") n = 0;
    else if (k === "End") n = PATHS.length - 1;
    if (n === null) return;
    e.preventDefault();
    setPathFromTab(PATHS[n].id);
    document.getElementById("tab-" + PATHS[n].id)?.focus();
  };

  const onSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateAll()) return;

    setPhase("sending");
    setSubmitError("");

    const fd = new FormData();
    fd.append("fullName", name.trim());
    fd.append("phone", phone);
    fd.append("email", email.trim().toLowerCase());
    fd.append("course", course);

    try {
      const response = await fetch(import.meta.env.VITE_WAITLIST_SCRIPT_URL, {
        method: "POST",
        body: fd,
      });
      if (!response.ok) throw new Error("Request failed: " + response.status);

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Submission failed");

      const c = findPath(course).name;
      setWonLabel(c);
      setPosition(typeof result.position === "number" ? result.position : null);
      setLink(formLink);
      setPhase("tick");
      setTimeout(
        () => {
          setSuccess(true);
          const pcs = makeConfetti();
          setPieces(pcs);
          if (pcs.length > 0) setTimeout(() => setPieces([]), 1600);
        },
        reduced ? 0 : 400,
      );
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setPhase("idle");
    }
  };

  const onCopy = async () => {
    const inp = linkRef.current;
    if (!inp) return;
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    };
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(link);
        done();
      } catch {
        inp.select();
        done();
      }
    } else {
      inp.select();
      document.execCommand("copy");
      done();
    }
  };

  const shareMsg =
    "I just joined the TFN Academy waitlist \u2014 14 weeks, 14 projects, Cohort 1 starts October. Join me: " +
    formLink;

  return (
    <>
      <a className="skip" href="#join">
        Skip to the waitlist form
      </a>

      <header className="mast">
        <div className="wrap">
          <a className="mark" href="https://academy.tfnsolutions.us">
            TFN <span>Academy</span>
          </a>
          <div className="cohort">
            <span className="dot" />
            Cohort 1 &mdash; <b>classes start October</b>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" ref={leadRef}>
          <div className="wrap">
            <div>
              <motion.h1 {...reveal(0.04)}>
                In 14 weeks, you will have built 14 things.
              </motion.h1>
              <motion.p className="lede" {...reveal(0.14)}>
                TFN Academy trains young Nigerians in tech and business the way
                the work actually happens.
              </motion.p>
              <motion.div className="act" {...reveal(0.24)}>
                <a className="btn" href="#join" id="top-cta">
                  Join the waitlist
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 12h15M13 6l6 6-6 6" />
                  </svg>
                </a>
                <p className="note">
                  28 students per class. The waitlist gets the application link
                  first.
                </p>
              </motion.div>
            </div>

            <motion.div className="lead-shot" {...reveal(0.18)}>
              <img src={leadShot} alt="" width={640} height={640} />
              <div className="stats">
                <div className="stat">
                  <b>Six days a week</b>
                  <span>
                    Mon&ndash;Sat, three batches a day. Built around a working
                    schedule.
                  </span>
                </div>
                <div className="stat">
                  <b>One graded project per week</b>
                  <span>
                    Three sessions a week, for fourteen weeks. You leave with a
                    portfolio, not a certificate you have to explain.
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="board-sec" aria-labelledby="board-h">
          <div className="wrap">
            <div
              className="tabs"
              role="tablist"
              aria-label="Choose a path"
              id="tabs"
            >
              {PATHS.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  className="tab"
                  id={"tab-" + p.id}
                  role="tab"
                  aria-selected={p.id === active}
                  aria-controls="board"
                  tabIndex={p.id === active ? 0 : -1}
                  onClick={() => setPathFromTab(p.id)}
                  onKeyDown={(e) => onTabKey(e, idx)}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="tabline" />

            <div className="board-head">
              <h2 id="board-h">What you ship, week by week</h2>
              <p id="board-sub">{board.sub}</p>
            </div>

            <motion.ul
              className="board"
              key={pathRev}
              id="board"
              initial={pathRev > 0 && !reduced ? "hidden" : false}
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.022 } },
              }}
            >
              {board.weeks.map((w, i) => (
                <motion.li
                  key={w}
                  className={"cell" + (i === 13 ? " final" : "")}
                  variants={{
                    hidden: { opacity: 0, y: 7 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.42, ease: EASE },
                    },
                  }}
                >
                  <span className="wk">
                    {i === 13 ? "WEEK 14 · CAPSTONE" : "WEEK " + (i + 1)}
                  </span>
                  <span className="txt">{w}</span>
                </motion.li>
              ))}
            </motion.ul>

            <p className="board-foot">
              Every deliverable is <b>graded and due before the next class</b>.
              Week 14 is the capstone you defend in front of the room &mdash;
              and the piece that goes at the top of your portfolio.
            </p>
          </div>
        </section>

        <section className="facts">
          <div className="wrap">
            <ul>
              <li>
                <b>14 weeks</b>
                <span>Mon/Wed/Fri or Tue/Thu/Sat, 2.5 hours a session</span>
              </li>
              <li>
                <b>3 batches</b>
                <span>
                  Morning, afternoon or evening &mdash; pick what fits your life
                </span>
              </li>
              <li>
                <b>28 seats</b>
                <span>
                  Per class, so instructors know your name and your work
                </span>
              </li>
              <li>
                <b>~12.5 hrs</b>
                <span>A week in total, class time plus your own practice</span>
              </li>
            </ul>
            <p className="certs">
              <b>
                Every path maps to certifications employers already recognise:
              </b>{" "}
              AWS &middot; CompTIA Security+ &middot; Cisco CCNA &middot; Google
              Data Analytics &middot; Microsoft PL-300 &middot; Meta Front-End
              &middot; Scrum.org PSPO
            </p>
          </div>
        </section>

        <section className="join" id="join" ref={joinRef}>
          <div className="wrap join-grid">
            <div>
              <h2>Cohort 1 opens before it opens to everyone.</h2>
              <p className="sub">
                Join the waitlist and we email you the start dates and
                application link first &mdash; while there are still seats in
                your batch.
              </p>
              <ul className="next">
                <li>
                  <span className="n">1</span>
                  <span>
                    <b>You join today.</b> Four details, no payment, no
                    commitment.
                  </span>
                </li>
                <li>
                  <span className="n">2</span>
                  <span>
                    <b>We email you first</b> with start dates and the
                    application link.
                  </span>
                </li>
                <li>
                  <span className="n">3</span>
                  <span>
                    <b>You pick your batch</b> &mdash; morning, afternoon or
                    evening &mdash; while seats are open.
                  </span>
                </li>
              </ul>
            </div>

            <div className="card">
              <div id="form-view" hidden={success}>
                <h3>Save your seat</h3>
                <p className="hint">
                  Four details. Takes about twenty seconds.
                </p>
                <form id="form" ref={formRef} noValidate onSubmit={onSubmit}>
                  <div
                    className={
                      "f" +
                      (name.trim() !== "" ? " filled" : "") +
                      (errors.name ? " bad" : "")
                    }
                    id="f-name"
                  >
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder=" "
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearErr("name");
                      }}
                      onBlur={() => validateField("name")}
                    />
                    <label htmlFor="name">Full name</label>
                  </div>
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        className="err"
                        role="alert"
                        data-err="f-name"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.16, ease: EASE }}
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div
                    className={
                      "f f-phone" +
                      (phone.trim() !== "" ? " filled" : "") +
                      (errors.phone ? " bad" : "")
                    }
                    id="f-phone"
                  >
                    <PhoneInput
                      international={false}
                      addInternationalOption={false}
                      defaultCountry="NG"
                      countrySelectComponent={CountryCodeSelect}
                      id="phone"
                      autoComplete="tel-national"
                      required
                      value={phone}
                      onChange={(v) => {
                        setPhone(v || "");
                        clearErr("phone");
                      }}
                      onBlur={() => validateField("phone")}
                    />
                    <label htmlFor="phone">Phone / WhatsApp</label>
                  </div>
                  <AnimatePresence>
                    {errors.phone && (
                      <motion.p
                        className="err"
                        role="alert"
                        data-err="f-phone"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.16, ease: EASE }}
                      >
                        {errors.phone}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div
                    className={
                      "f" +
                      (email.trim() !== "" ? " filled" : "") +
                      (errors.email ? " bad" : "")
                    }
                    id="f-email"
                  >
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder=" "
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearErr("email");
                      }}
                      onBlur={() => validateField("email")}
                    />
                    <label htmlFor="email">Email address</label>
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        className="err"
                        role="alert"
                        data-err="f-email"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.16, ease: EASE }}
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div
                    className={"f always" + (errors.course ? " bad" : "")}
                    id="f-course"
                  >
                    <select
                      id="course"
                      required
                      value={course}
                      onChange={(e) => onSelectChange(e.target.value)}
                    >
                      <option value="" disabled>
                        Select a path
                      </option>
                      {PATHS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="course">Path you want</label>
                    <svg
                      className="caret"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                  <AnimatePresence>
                    {errors.course && (
                      <motion.p
                        className="err"
                        role="alert"
                        data-err="f-course"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.16, ease: EASE }}
                      >
                        {errors.course}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <p className="consent">
                    We email you about Cohort 1 only. Unsubscribe any time.
                  </p>
                  <AnimatePresence>
                    {submitError && (
                      <motion.p
                        className="err"
                        role="alert"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.16, ease: EASE }}
                      >
                        {submitError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <button
                    className="submit"
                    id="go"
                    type="submit"
                    disabled={phase !== "idle"}
                  >
                    {phase === "sending" ? (
                      <span className="spin" />
                    ) : phase === "tick" ? (
                      <svg className="tick" viewBox="0 0 24 24">
                        <path d="M4 12.5l5.5 5.5L20 7" />
                      </svg>
                    ) : (
                      "Join the waitlist"
                    )}
                  </button>
                </form>
              </div>

              <div
                className="won"
                id="won-view"
                role="status"
                ref={wonRef}
                hidden={!success}
              >
                <div className="seal">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 12.5l5.5 5.5L20 7" />
                  </svg>
                </div>
                <h3>You're on the list.</h3>
                <p className="line" id="won-line">
                  You're in for {wonLabel}. We'll email you when we launch.
                </p>
                <div className="boost">
                  <div>
                    <p>Share this form with your friends on:</p>
                    <div className="shares">
                      <a
                        className="li"
                        id="sh-li"
                        aria-label="Share on LinkedIn"
                        target="_blank"
                        rel="noopener"
                        href={
                          "https://www.linkedin.com/sharing/share-offsite/?url=" +
                          encodeURIComponent(formLink)
                        }
                      >
                        <FaLinkedinIn aria-hidden="true" />
                      </a>
                      <a
                        className="x"
                        id="sh-x"
                        aria-label="Share on X"
                        target="_blank"
                        rel="noopener"
                        href={
                          "https://twitter.com/intent/tweet?text=" +
                          encodeURIComponent(shareMsg)
                        }
                      >
                        <FaXTwitter aria-hidden="true" />
                      </a>
                      <a
                        className="fb"
                        id="sh-fb"
                        aria-label="Share on Facebook"
                        target="_blank"
                        rel="noopener"
                        href={
                          "https://www.facebook.com/sharer/sharer.php?u=" +
                          encodeURIComponent(formLink)
                        }
                      >
                        <FaFacebookF aria-hidden="true" />
                      </a>
                      <a
                        className="wa"
                        id="sh-wa"
                        aria-label="Share on WhatsApp"
                        target="_blank"
                        rel="noopener"
                        href={
                          "https://wa.me/?text=" + encodeURIComponent(shareMsg)
                        }
                      >
                        <FaWhatsapp aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                  <div className="font-bold text-center my-2">Or</div>
                  <div className="copy">
                    <input
                      id="reflink"
                      ref={linkRef}
                      readOnly
                      aria-label="Your referral link"
                      value={link}
                    />
                    <button
                      type="button"
                      id="copybtn"
                      className={copied ? "done" : ""}
                      onClick={onCopy}
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <a href="https://academy.tfnsolutions.us">academy.tfnsolutions.us</a>
          <a href="mailto:academy@tfnsolutions.us">academy@tfnsolutions.us</a>
          <span className="end">
            TFN Academy, a{" "}
            <a href="https://tfnsolutions.us">TurboFlux Network Solutions</a>{" "}
            company
          </span>
        </div>
      </footer>

      <motion.div
        className="dock"
        id="dock"
        initial={false}
        animate={{ y: dockOn ? 0 : "120%" }}
        transition={{ duration: 0.32, ease: EASE }}
      >
        <a className="btn" href="#join">
          Join the waitlist
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12h15M13 6l6 6-6 6" />
          </svg>
        </a>
      </motion.div>

      {pieces.length > 0 && (
        <div className="conf">
          {pieces.map((p, i) => (
            <motion.i
              key={i}
              style={{ left: p.left, top: "42%", background: p.background }}
              initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rotate }}
              transition={{ duration: 1.05, delay: p.delay, ease: EASE }}
            />
          ))}
        </div>
      )}
    </>
  );
}
