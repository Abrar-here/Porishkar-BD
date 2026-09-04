import { Link } from "react-router-dom";

// ─── Design tokens for this page only (kept local, not touching the
// rest of the app's Tailwind config) ───
const COLORS = {
  bg: "#F6F8F5",
  ink: "#16231C",
  inkMuted: "#5B6B60",
  primary: "#0F7A42",
  primaryDark: "#0A5E32",
  accent: "#D98A2B",
};

const serif = { fontFamily: "'Fraunces', serif" };

const PIPELINE_STEPS = [
  { icon: "📍", label: "Report" },
  { icon: "🎯", label: "Prioritise" },
  { icon: "🚚", label: "Collect" },
  { icon: "♻️", label: "Recycle" },
  { icon: "🏆", label: "Reward" },
];

const TEAM = [
  "Fahmid Alam Khan",
  "Abrar Ahmed",
  "Maisha Maisara",
  "Ahsanul Fahim Ahmed",
];

const STAKEHOLDERS = [
  {
    icon: "🧑",
    role: "Citizens",
    text: "Report issues, sell recyclables, earn rewards",
  },
  {
    icon: "🚛",
    role: "Collectors",
    text: "Follow optimised routes, confirm collections",
  },
  {
    icon: "🏭",
    role: "Recycling companies",
    text: "Bid on materials, track transactions",
  },
  {
    icon: "🏛️",
    role: "Municipal admins",
    text: "Triage reports, monitor operations",
  },
];

const FEATURES = [
  {
    accent: COLORS.primary,
    title: "Report a waste issue in seconds",
    text: "Snap a photo, tag the location, and describe the problem — illegal dumping, an overflowing bin, or hazardous waste. Every report gets a case reference you can track.",
    featured: true,
  },
  {
    accent: COLORS.primary,
    title: "Automatic urgency detection",
    text: "Medical waste and dense clusters of complaints rise to the top of the queue automatically, so critical issues never wait behind routine ones.",
  },
  {
    accent: COLORS.accent,
    title: "Sell recyclables, not throw them away",
    text: "List materials, receive bids from recycling companies, and get paid securely — turning waste into income instead of landfill.",
  },
  {
    accent: COLORS.accent,
    title: "Optimised collection routes",
    text: "Collectors get a route that minimises travel between stops, recalculated whenever a supervisor needs to reprioritise.",
  },
  {
    accent: "#2D7D74",
    title: "Earn Eco Points that mean something",
    text: "Every report, pickup, and sale builds toward a visible tier, a place on the leaderboard, and badges you can actually unlock.",
  },
  {
    accent: "#2D7D74",
    title: "Never miss an update",
    text: "In-app and email alerts for every status change, assignment, and reward — with full control over which ones reach your inbox.",
  },
];

const HOW_IT_WORKS = [
  {
    n: "1",
    title: "You report it",
    text: "Photo, location, and a short description — takes under a minute.",
  },
  {
    n: "2",
    title: "It's prioritised & assigned",
    text: "The system scores urgency and a collector picks it up.",
  },
  {
    n: "3",
    title: "It gets resolved, with proof",
    text: "The collector uploads photo evidence once it's cleared.",
  },
  {
    n: "4",
    title: "You earn Eco Points",
    text: "Credited automatically, visible on your dashboard and the leaderboard.",
  },
];

function LandingPage() {
  return (
    <div
      style={{ backgroundColor: COLORS.bg, color: COLORS.ink }}
      className="min-h-screen"
    >
      {/* ── Top bar ── */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <span style={serif} className="text-xl font-semibold">
          Porishkar<span style={{ color: COLORS.primary }}>BD</span>
        </span>
        <nav className="flex items-center gap-6">
          <Link
            to="/login"
            className="text-sm font-medium"
            style={{ color: COLORS.inkMuted }}
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium text-white px-4 py-2 rounded-lg"
            style={{ backgroundColor: COLORS.primary }}
          >
            Create free account
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div>
          <h1
            style={serif}
            className="text-4xl md:text-5xl leading-[1.1] font-semibold"
          >
            Waste reported today, resolved and rewarded tomorrow.
          </h1>
          <p
            className="mt-6 text-lg leading-relaxed"
            style={{ color: COLORS.inkMuted, maxWidth: "38ch" }}
          >
            PorishkarBD connects citizens, collectors, and recycling companies
            on one platform — turning waste reports into tracked, prioritised
            action, and recyclable materials into real income.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="text-white font-medium px-6 py-3 rounded-lg"
              style={{ backgroundColor: COLORS.primary }}
            >
              Create a free account
            </Link>
            <Link
              to="/login"
              className="font-medium px-6 py-3 rounded-lg border"
              style={{ borderColor: "#D5DED8", color: COLORS.ink }}
            >
              Log in
            </Link>
          </div>

          <p className="mt-8 text-sm" style={{ color: COLORS.inkMuted }}>
            Bangladesh generates over 20,000 tonnes of solid waste daily — fewer
            than 1 in 5 tonnes is recycled.
          </p>
        </div>

        {/* Pipeline visual — the one bold moment on this page */}
        <div className="relative">
          <div
            className="rounded-2xl p-8 md:p-10"
            style={{ backgroundColor: "#EAF0E7", border: "1px solid #D5DED8" }}
          >
            <p
              className="text-sm font-medium mb-6"
              style={{ color: COLORS.inkMuted }}
            >
              The full loop, in one platform
            </p>
            <div className="flex flex-col gap-0">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step.label}>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0"
                      style={{
                        backgroundColor: "white",
                        border: `1.5px solid ${COLORS.primary}`,
                      }}
                    >
                      {step.icon}
                    </div>
                    <span style={serif} className="text-lg font-medium">
                      {step.label}
                    </span>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div
                      className="ml-[22px] w-px h-6"
                      style={{ backgroundColor: COLORS.primary, opacity: 0.4 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stakeholders ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAKEHOLDERS.map((s) => (
            <div
              key={s.role}
              className="p-5 rounded-xl bg-white"
              style={{ border: "1px solid #E4E9E1" }}
            >
              <span className="text-2xl">{s.icon}</span>
              <p className="mt-3 font-semibold">{s.role}</p>
              <p className="mt-1 text-sm" style={{ color: COLORS.inkMuted }}>
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature highlights ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 style={serif} className="text-3xl font-semibold mb-2">
          What the platform actually does
        </h2>
        <p
          className="mb-10"
          style={{ color: COLORS.inkMuted, maxWidth: "60ch" }}
        >
          Six pieces working together — from the moment an issue is spotted to
          the moment it turns into a reward.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`bg-white rounded-xl p-6 ${f.featured ? "md:col-span-2" : ""}`}
              style={{
                border: "1px solid #E4E9E1",
                borderLeftWidth: "3px",
                borderLeftColor: f.accent,
              }}
            >
              <p className="font-semibold text-lg">{f.title}</p>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{
                  color: COLORS.inkMuted,
                  maxWidth: f.featured ? "70ch" : "45ch",
                }}
              >
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works (genuine sequence — numbered) ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 style={serif} className="text-3xl font-semibold mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.n}>
              <span
                style={{ ...serif, color: COLORS.primary }}
                className="text-3xl font-semibold"
              >
                {step.n}
              </span>
              <p className="mt-3 font-semibold">{step.title}</p>
              <p
                className="mt-1 text-sm leading-relaxed"
                style={{ color: COLORS.inkMuted }}
              >
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Team ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 style={serif} className="text-3xl font-semibold mb-10">
          Built by
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TEAM.map((name) => {
            const initials = name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("");
            return (
              <div
                key={name}
                className="p-5 rounded-xl bg-white text-center"
                style={{ border: "1px solid #E4E9E1" }}
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center font-semibold"
                  style={{ backgroundColor: "#EAF0E7", color: COLORS.primary }}
                >
                  {initials}
                </div>
                <p className="mt-3 text-sm font-medium">{name}</p>
              </div>
            );
          })}
        </div>

        <div
          className="mt-8 flex flex-wrap items-center gap-5 text-sm"
          style={{ color: COLORS.inkMuted }}
        >
          <a
            href="https://github.com/Abrar-here"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            style={{ color: COLORS.ink }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
            </svg>
          </a>
          <span>
            Questions or issues?{" "}
            <a
              href="mailto:porishkarbd@gmail.com"
              style={{ color: COLORS.ink }}
              className="font-medium"
            >
              porishkarbd@gmail.com
            </a>
          </span>
        </div>
      </section>

      {/* ── Final CTA band ── */}
      <section
        style={{ backgroundColor: COLORS.primaryDark }}
        className="py-16"
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <h3
            style={serif}
            className="text-2xl md:text-3xl text-white font-semibold max-w-md"
          >
            Your next report could be the one that gets a neighborhood cleaned
            up.
          </h3>
          <Link
            to="/register"
            className="shrink-0 font-medium px-6 py-3 rounded-lg bg-white"
            style={{ color: COLORS.primaryDark }}
          >
            Create a free account
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-between text-sm"
        style={{ color: COLORS.inkMuted }}
      >
        <span>
          PorishkarBD — Smart Waste Management & Recycling Platform for
          Bangladesh
        </span>
        <div className="flex gap-6">
          <Link to="/login" style={{ color: COLORS.inkMuted }}>
            Log in
          </Link>
          <Link to="/register" style={{ color: COLORS.inkMuted }}>
            Register
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
