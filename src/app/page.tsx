"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  delayMs?: number;
  style?: React.CSSProperties;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

function Reveal({ children, delayMs = 0, style }: RevealProps) {
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = document.getElementById((children as any)?.key || "") || null;
    // We'll use IntersectionObserver on wrapper via ref-less approach: query the first wrapper with data-reveal-id
  }, [reduced, children]);

  // The actual observer is attached in useEffect below using a generated id
  const id = useMemo(
    () => `reveal_${Math.random().toString(16).slice(2)}`,
    []
  );

  useEffect(() => {
    if (reduced) return;

    const node = document.querySelector(`[data-reveal-id="${id}"]`);
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [id, reduced]);

  return (
    <div
      data-reveal-id={id}
      style={{
        ...style,
        transform: visible ? "translateY(0px)" : "translateY(14px)",
        opacity: visible ? 1 : 0,
        transition: reduced
          ? "none"
          : `opacity 700ms ease, transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
        transitionDelay: reduced ? "0ms" : `${delayMs}ms`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}

function Divider({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        height: 1,
        width: "100%",
        background:
          "linear-gradient(90deg, rgba(255,255,255,0), rgba(148,163,184,0.28), rgba(255,255,255,0))",
        ...style,
      }}
    />
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 12px",
        borderRadius: 999,
        border: "1px solid rgba(148,163,184,0.22)",
        background: "rgba(2,6,23,0.35)",
        color: "rgba(226,232,240,0.92)",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.1px",
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </span>
  );
}

function Button({
  href,
  children,
  variant = "primary",
  onClick,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 14,
    textDecoration: "none",
    userSelect: "none",
    transition:
      "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease, border-color 160ms ease",
    transform: "translateY(0px)",
  };

  const primary: React.CSSProperties = {
    ...base,
    background:
      "linear-gradient(135deg, rgba(37,99,235,1) 0%, rgba(59,130,246,1) 60%, rgba(14,165,233,0.92) 100%)",
    color: "white",
    boxShadow: "0 14px 40px rgba(37,99,235,0.24)",
    border: "1px solid rgba(59,130,246,0.35)",
  };

  const secondary: React.CSSProperties = {
    ...base,
    background: "rgba(2,6,23,0.35)",
    color: "rgba(226,232,240,0.92)",
    border: "1px solid rgba(148,163,184,0.25)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
    backdropFilter: "blur(10px)",
  };

  const style = variant === "primary" ? primary : secondary;

  const Comp: any = href ? Link : "button";
  const compProps = href
    ? { href }
    : { type: "button", onClick: onClick ?? (() => {}) };

  return (
    <Comp
      {...compProps}
      style={style}
      onMouseEnter={(e: any) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow =
          variant === "primary"
            ? "0 18px 55px rgba(37,99,235,0.30)"
            : "0 16px 45px rgba(0,0,0,0.26)";
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow =
          variant === "primary"
            ? "0 14px 40px rgba(37,99,235,0.24)"
            : "0 12px 30px rgba(0,0,0,0.22)";
      }}
    >
      {children}
    </Comp>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "bad";
}) {
  const tones = {
    good: { c: "rgba(34,197,94,0.95)", bg: "rgba(34,197,94,0.10)" },
    warn: { c: "rgba(245,158,11,0.95)", bg: "rgba(245,158,11,0.12)" },
    bad: { c: "rgba(239,68,68,0.95)", bg: "rgba(239,68,68,0.10)" },
  }[tone];

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: 14,
        borderRadius: 14,
        border: "1px solid rgba(148,163,184,0.20)",
        background: "rgba(2,6,23,0.45)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: tones.c,
            boxShadow: `0 0 0 3px ${tones.bg}`,
          }}
        />
        <div style={{ fontSize: 12, fontWeight: 700, color: tones.c }}>
          {label}
        </div>
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: "-0.4px",
          color: "rgba(255,255,255,0.95)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  desc,
  bullets,
}: {
  title: string;
  desc: string;
  bullets: string[];
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(148,163,184,0.18)",
        background:
          "linear-gradient(180deg, rgba(2,6,23,0.55), rgba(2,6,23,0.35))",
        padding: 18,
        boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: "-0.2px",
          color: "rgba(255,255,255,0.92)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 6,
          color: "rgba(148,163,184,0.92)",
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        {desc}
      </div>
      <ul
        style={{
          marginTop: 12,
          paddingLeft: 18,
          color: "rgba(226,232,240,0.86)",
          fontSize: 13,
          lineHeight: 1.55,
        }}
      >
        {bullets.map((b) => (
          <li key={b} style={{ marginBottom: 6 }}>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Smooth scrolling for hash links
    const handler = (e: any) => {
      const a = e.target?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      e.preventDefault();
      const el = document.querySelector(href);
      if (!el) return;
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", href);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [reduced]);

  const wrap: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#050812",
    color: "rgba(226,232,240,0.94)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
    overflowX: "hidden",
  };

  const background: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    background:
      "radial-gradient(1200px 600px at 10% 10%, rgba(37,99,235,0.35), rgba(0,0,0,0) 60%), radial-gradient(1000px 700px at 85% 20%, rgba(14,165,233,0.22), rgba(0,0,0,0) 55%), radial-gradient(900px 650px at 60% 85%, rgba(99,102,241,0.20), rgba(0,0,0,0) 60%), linear-gradient(180deg, #050812 0%, #020617 50%, #050812 100%)",
  };

  const header: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 20,
    borderBottom: scrolled
      ? "1px solid rgba(148,163,184,0.20)"
      : "1px solid rgba(148,163,184,0.10)",
    background: scrolled
      ? "rgba(2,6,23,0.62)"
      : "rgba(2,6,23,0.20)",
    backdropFilter: "blur(14px)",
    transition: "background 220ms ease, border-color 220ms ease",
  };

  const headerInner: React.CSSProperties = {
    maxWidth: 1160,
    margin: "0 auto",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  };

  const brand: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
    color: "inherit",
  };

  const mark: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 10,
    background:
      "linear-gradient(135deg, rgba(59,130,246,1), rgba(14,165,233,0.95))",
    boxShadow: "0 18px 60px rgba(37,99,235,0.28)",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(148,163,184,0.18)",
    color: "white",
    fontWeight: 900,
    letterSpacing: "-0.5px",
    fontSize: 14,
  };

  const main: React.CSSProperties = {
    position: "relative",
    zIndex: 1,
  };

  const container: React.CSSProperties = {
    maxWidth: 1160,
    margin: "0 auto",
    padding: "76px 24px 64px",
  };

  const heroGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: 28,
    alignItems: "start",
  };

  const title: React.CSSProperties = {
    margin: "14px 0 14px",
    fontSize: 56,
    fontWeight: 900,
    letterSpacing: "-1.2px",
    lineHeight: 1.02,
    color: "rgba(255,255,255,0.97)",
  };

  const subtitle: React.CSSProperties = {
    margin: "0 0 22px",
    maxWidth: 680,
    color: "rgba(148,163,184,0.96)",
    fontSize: 16,
    lineHeight: 1.7,
  };

  const ctaRow: React.CSSProperties = {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  };

  const finePrint: React.CSSProperties = {
    marginTop: 14,
    color: "rgba(148,163,184,0.75)",
    fontSize: 13,
  };

  const preview: React.CSSProperties = {
    borderRadius: 20,
    border: "1px solid rgba(148,163,184,0.18)",
    background:
      "linear-gradient(180deg, rgba(2,6,23,0.65), rgba(2,6,23,0.35))",
    padding: 18,
    boxShadow: "0 28px 90px rgba(0,0,0,0.45)",
    backdropFilter: "blur(14px)",
  };

  const previewHead: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 14,
    marginBottom: 12,
  };

  const previewTitle: React.CSSProperties = {
    fontWeight: 900,
    color: "rgba(255,255,255,0.92)",
    letterSpacing: "-0.2px",
  };

  const previewMeta: React.CSSProperties = {
    color: "rgba(148,163,184,0.70)",
    fontSize: 12,
  };

  const previewRow: React.CSSProperties = {
    display: "flex",
    gap: 10,
    marginBottom: 12,
  };

  const incident: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.45)",
    padding: 14,
  };

  const incidentName: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 900,
    color: "rgba(255,255,255,0.92)",
    letterSpacing: "0.2px",
  };

  const incidentWhy: React.CSSProperties = {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(248,113,113,0.95)",
    lineHeight: 1.45,
  };

  const previewNote: React.CSSProperties = {
    marginTop: 10,
    fontSize: 13,
    color: "rgba(148,163,184,0.85)",
    lineHeight: 1.55,
  };

  const section: React.CSSProperties = {
    marginTop: 76,
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: "-0.6px",
    color: "rgba(255,255,255,0.95)",
    margin: 0,
  };

  const sectionDesc: React.CSSProperties = {
    marginTop: 10,
    maxWidth: 820,
    color: "rgba(148,163,184,0.95)",
    fontSize: 15,
    lineHeight: 1.7,
  };

  const grid3: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
    marginTop: 18,
  };

  const grid2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
    marginTop: 18,
  };

  const footer: React.CSSProperties = {
    borderTop: "1px solid rgba(148,163,184,0.16)",
    padding: "26px 24px",
    color: "rgba(148,163,184,0.75)",
    fontSize: 13,
    textAlign: "center",
  };

  // Responsive without Tailwind: handle via simple CSS in JS using media query in a style tag
  const responsiveCss = `
    @media (max-width: 980px) {
      .heroGrid { grid-template-columns: 1fr !important; }
      .grid3 { grid-template-columns: 1fr !important; }
      .grid2 { grid-template-columns: 1fr !important; }
      .heroTitle { font-size: 44px !important; }
    }
    @media (max-width: 520px) {
      .heroTitle { font-size: 38px !important; }
    }
  `;

  return (
    <div style={wrap}>
      <style>{responsiveCss}</style>
      <div style={background} />

      <header style={header}>
        <div style={headerInner}>
          <Link href="/" style={brand} aria-label="SecureFlake home">
            <div style={mark}>SF</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div
                style={{
                  fontWeight: 900,
                  letterSpacing: "-0.3px",
                  color: "rgba(255,255,255,0.92)",
                  fontSize: 14,
                }}
              >
                SecureFlake
              </div>
              <div style={{ fontSize: 12, color: "rgba(148,163,184,0.75)" }}>
                Snowflake trust & decision readiness
              </div>
            </div>
          </Link>

          <nav style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a
              href="#product"
              style={{
                color: "rgba(226,232,240,0.78)",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 13,
                padding: "8px 10px",
                borderRadius: 10,
              }}
            >
              Product
            </a>
            <a
              href="#security"
              style={{
                color: "rgba(226,232,240,0.78)",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 13,
                padding: "8px 10px",
                borderRadius: 10,
              }}
            >
              Security
            </a>
            <a
              href="#onboarding"
              style={{
                color: "rgba(226,232,240,0.78)",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 13,
                padding: "8px 10px",
                borderRadius: 10,
              }}
            >
              Onboarding
            </a>

            <div style={{ width: 10 }} />

            <Link
              href="/login"
              style={{
                color: "rgba(226,232,240,0.85)",
                textDecoration: "none",
                fontWeight: 800,
                fontSize: 13,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.18)",
                background: "rgba(2,6,23,0.28)",
              }}
            >
              Log in
            </Link>

            <Button href="/login" variant="primary">
              Start free
              <span style={{ opacity: 0.9 }}>→</span>
            </Button>
          </nav>
        </div>
      </header>

      <main style={main}>
        <div style={container}>
          <div className="heroGrid" style={heroGrid}>
            <div>
              <Reveal>
                <Pill>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: "rgba(34,197,94,0.95)",
                      boxShadow: "0 0 0 3px rgba(34,197,94,0.10)",
                    }}
                  />
                  Read-only monitoring for Snowflake
                </Pill>
              </Reveal>

              <Reveal delayMs={60}>
                <h1 className="heroTitle" style={title}>
                  Know which tables you can trust{" "}
                  <span style={{ color: "rgba(148,163,184,0.9)" }}>
                    before decisions ship.
                  </span>
                </h1>
              </Reveal>

              <Reveal delayMs={120}>
                <p style={subtitle}>
                  SecureFlake evaluates Snowflake assets using metadata and safe,
                  read-only checks—freshness, drift, and schema stability—then
                  explains every warning with evidence and incident history.
                </p>
              </Reveal>

              <Reveal delayMs={180}>
                <div style={ctaRow}>
                  <Button href="/login" variant="primary">
                    Connect Snowflake <span style={{ opacity: 0.9 }}>→</span>
                  </Button>
                  <Button href="#product" variant="secondary">
                    See the product <span style={{ opacity: 0.9 }}>↘</span>
                  </Button>
                </div>
              </Reveal>

              <Reveal delayMs={240}>
                <div style={finePrint}>
                  Read-only role • Key-pair auth • Credentials stored server-side • Auditable access
                </div>
              </Reveal>

              <Reveal delayMs={320}>
                <div style={{ marginTop: 22 }}>
                  <Divider />
                </div>
              </Reveal>

              <Reveal delayMs={380}>
                <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Pill>✅ Table-level trust status</Pill>
                  <Pill>🧾 Evidence & incident timeline</Pill>
                  <Pill>⚙️ Cadence + criticality tagging</Pill>
                </div>
              </Reveal>
            </div>

            <Reveal delayMs={160} style={{}}>
              <div style={preview}>
                <div style={previewHead}>
                  <div style={previewTitle}>Trust Overview</div>
                  <div style={previewMeta}>Last run: 2 min ago</div>
                </div>

                <div style={previewRow}>
                  <MiniStat label="OK" value="12" tone="good" />
                  <MiniStat label="Warn" value="4" tone="warn" />
                  <MiniStat label="Fail" value="2" tone="bad" />
                </div>

                <div style={incident}>
                  <div style={incidentName}>PROD.FINANCE.REVENUE_DAILY</div>
                  <div style={incidentWhy}>
                    Schema change detected: column type changed (amount)
                  </div>
                </div>

                <div style={previewNote}>
                  Designed for clarity: every WARN/FAIL includes a “why” plus evidence and a timeline.
                </div>
              </div>
            </Reveal>
          </div>

          {/* Product */}
          <section id="product" style={section}>
            <Reveal>
              <h2 style={sectionTitle}>Product</h2>
              <p style={sectionDesc}>
                SecureFlake provides a trust layer on top of Snowflake—without ingesting or modifying customer data.
                It highlights which tables are decision-ready and why.
              </p>
            </Reveal>

            <div className="grid3" style={grid3}>
              <Reveal delayMs={80}>
                <FeatureCard
                  title="Freshness"
                  desc="Detect late updates using your timestamp column and expected cadence."
                  bullets={[
                    "Configurable thresholds per asset",
                    "Clear SLA breach explanations",
                    "Supports hourly / daily / weekly cadence",
                  ]}
                />
              </Reveal>
              <Reveal delayMs={140}>
                <FeatureCard
                  title="Row count drift"
                  desc="Catch spikes/drops by comparing to rolling baselines."
                  bullets={[
                    "Baselines per asset",
                    "Abnormal spike/drop detection",
                    "Evidence captured per run",
                  ]}
                />
              </Reveal>
              <Reveal delayMs={200}>
                <FeatureCard
                  title="Schema stability"
                  desc="Detect additions/removals/type changes with diffs."
                  bullets={[
                    "Column/type diff summaries",
                    "Prevents downstream breakages",
                    "Incidents opened automatically",
                  ]}
                />
              </Reveal>
            </div>
          </section>

          {/* Security */}
          <section id="security" style={section}>
            <Reveal>
              <h2 style={sectionTitle}>Security model (enterprise-friendly)</h2>
              <p style={sectionDesc}>
                SecureFlake authentication (your app login) is separate from Snowflake access.
                Snowflake connectivity uses a dedicated read-only role and non-interactive auth.
              </p>
            </Reveal>

            <div className="grid2" style={grid2}>
              <Reveal delayMs={80}>
                <FeatureCard
                  title="Read-only Snowflake role"
                  desc="Customers create a least-privilege role scoped to the databases/schemas they want monitored."
                  bullets={[
                    "No writes, deletes, or admin access",
                    "Revocable any time",
                    "Auditable access in Snowflake",
                  ]}
                />
              </Reveal>
              <Reveal delayMs={140}>
                <FeatureCard
                  title="Key-pair authentication"
                  desc="SecureFlake connects using a service user and key-pair auth. Human Snowflake passwords are never used."
                  bullets={[
                    "Credentials stored server-side only",
                    "Never exposed to the browser",
                    "Designed for continuous monitoring",
                  ]}
                />
              </Reveal>
            </div>

            <Reveal delayMs={200}>
              <div style={{ marginTop: 18 }}>
                <Pill>🔒 No ingestion • No mutation • Read-only monitoring</Pill>
              </div>
            </Reveal>
          </section>

          {/* Onboarding */}
          <section id="onboarding" style={section}>
            <Reveal>
              <h2 style={sectionTitle}>Onboarding in minutes</h2>
              <p style={sectionDesc}>
                A simple flow: create a read-only role, assign a service user, connect via key-pair auth—then SecureFlake runs checks on a schedule.
              </p>
            </Reveal>

            <div className="grid3" style={grid3}>
              <Reveal delayMs={80}>
                <FeatureCard
                  title="1) Create role"
                  desc="Grant USAGE/SELECT on monitored schemas."
                  bullets={[
                    "Least-privilege permissions",
                    "Scoped to selected assets",
                    "Matches enterprise best practices",
                  ]}
                />
              </Reveal>
              <Reveal delayMs={140}>
                <FeatureCard
                  title="2) Create service user"
                  desc="Assign the role to a dedicated user used only for SecureFlake."
                  bullets={[
                    "Separates humans from automation",
                    "Easy to rotate / revoke",
                    "Clear audit trail",
                  ]}
                />
              </Reveal>
              <Reveal delayMs={200}>
                <FeatureCard
                  title="3) Connect & monitor"
                  desc="Validate connection server-side and begin scheduled checks."
                  bullets={[
                    "Checks run on a cron schedule",
                    "Incidents created automatically",
                    "History retained for accountability",
                  ]}
                />
              </Reveal>
            </div>

            <Reveal delayMs={260}>
              <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button href="/login" variant="primary">
                  Sign in to start <span style={{ opacity: 0.9 }}>→</span>
                </Button>
                <Button href="#product" variant="secondary">
                  Review features <span style={{ opacity: 0.9 }}>↖</span>
                </Button>
              </div>
            </Reveal>
          </section>
        </div>

        <footer style={footer}>
          © {new Date().getFullYear()} SecureFlake — Trust & Decision Readiness for Snowflake
        </footer>
      </main>
    </div>
  );
}
