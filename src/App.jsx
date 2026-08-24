import React, { useMemo, useState } from "react";

/* ==========================================================================
   FiddleFit — Ops Console (prototype)
   Sales pipeline + dietician renewals + owner reporting, role-separated.
   All data below is sample data held in memory. No backend, no real auth.
   ========================================================================== */

/* ---------------------------------- tokens -------------------------------- */
const T = {
  ink: "#221A29",
  inkSoft: "#6A5F72",
  inkFaint: "#9C90A2",
  plum: "#7A2E6D",
  plumDeep: "#571E4E",
  plumSoft: "#F4E9F2",
  paper: "#F6F2F4",
  card: "#FFFFFF",
  line: "#E7DEE5",
  amber: "#A96B12",
  amberSoft: "#FAEFDB",
  moss: "#2F6B52",
  mossSoft: "#E2EFE9",
  clay: "#A63B34",
  claySoft: "#F8E6E3",
};
const SANS =
  '"Inter","Segoe UI",system-ui,-apple-system,Helvetica,Arial,sans-serif';
const MONO = 'ui-monospace,"SF Mono",Menlo,Consolas,monospace';

/* ------------------------------- seed helpers ----------------------------- */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260824);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const pickW = (pairs) => {
  const total = pairs.reduce((s, p) => s + p[1], 0);
  let r = rnd() * total;
  for (const [v, w] of pairs) {
    r -= w;
    if (r <= 0) return v;
  }
  return pairs[pairs.length - 1][0];
};
const NOW = new Date();
const daysAgo = (d, hourHint) => {
  const x = new Date(NOW);
  x.setDate(x.getDate() - d);
  x.setHours(
    hourHint != null ? hourHint : 9 + Math.floor(rnd() * 9),
    Math.floor(rnd() * 60),
    0,
    0,
  );
  return x.toISOString();
};
const makePhone = () => {
  const digits = [pick([9, 8, 7, 6])]
    .concat(Array.from({ length: 9 }, () => Math.floor(rnd() * 10)))
    .join("");
  return "+91 " + digits.slice(0, 5) + " " + digits.slice(5);
};
const telHref = (p) => "tel:" + String(p).replace(/[^+\d]/g, "");

/* ---------------------------------- users --------------------------------- */
const USERS = [
  { id: "o1", full_name: "Vikram Shetty", phone: makePhone(), role: "owner" },
  { id: "s1", full_name: "Ritika Malhotra", phone: makePhone(), role: "sales" },
  { id: "s2", full_name: "Aakash Verma", phone: makePhone(), role: "sales" },
  { id: "s3", full_name: "Neha Sundaram", phone: makePhone(), role: "sales" },
  { id: "s4", full_name: "Farhan Qureshi", phone: makePhone(), role: "sales" },
  { id: "s5", full_name: "Devika Nair", phone: makePhone(), role: "sales" },
  { id: "s6", full_name: "Karan Bhatia", phone: makePhone(), role: "sales" },
  { id: "s7", full_name: "Simran Kohli", phone: makePhone(), role: "sales" },
  { id: "d1", full_name: "Ananya Rao", phone: makePhone(), role: "dietician" },
  { id: "d2", full_name: "Pooja Iyer", phone: makePhone(), role: "dietician" },
  {
    id: "d3",
    full_name: "Meghna Deshpande",
    phone: makePhone(),
    role: "dietician",
  },
];
const SALES = USERS.filter((u) => u.role === "sales");
const DIETS = USERS.filter((u) => u.role === "dietician");
const userById = (id) => USERS.find((u) => u.id === id);

/* ------------------------------ label registry ---------------------------- */
const LEAD_STATUS = {
  new: { label: "New", fg: T.plum, bg: T.plumSoft },
  active_pursuing: { label: "Pursuing", fg: T.amber, bg: T.amberSoft },
  enrolled: { label: "Enrolled", fg: T.moss, bg: T.mossSoft },
  dead: { label: "Dead", fg: T.clay, bg: T.claySoft },
};
const CLIENT_STATUS = {
  active: { label: "Active", fg: T.moss, bg: T.mossSoft },
  inactive: { label: "Inactive", fg: T.inkSoft, bg: "#EDE8EC" },
};
const TYPE_LABEL = {
  first_call: "First call",
  callback: "Callback",
  renewal_rehash: "Rehash",
  reference_call: "Reference call",
};
const OUTCOME = {
  connected: { label: "Connected", fg: T.moss, bg: T.mossSoft },
  not_connected: { label: "Not connected", fg: T.inkSoft, bg: "#EDE8EC" },
  interested: { label: "Interested", fg: T.moss, bg: T.mossSoft },
  not_interested: { label: "Not interested", fg: T.clay, bg: T.claySoft },
  renewed: { label: "Renewed", fg: T.moss, bg: T.mossSoft },
  no_response: { label: "No response", fg: T.amber, bg: T.amberSoft },
};
const SALES_OUTCOMES = [
  "connected",
  "not_connected",
  "interested",
  "not_interested",
  "no_response",
];
const DIET_OUTCOMES = [
  "connected",
  "not_connected",
  "renewed",
  "not_interested",
  "no_response",
];

/* --------------------------------- seed data ------------------------------ */
const FIRST = [
  "Aarti",
  "Sneha",
  "Ritu",
  "Kavya",
  "Priya",
  "Nandini",
  "Shreya",
  "Tanvi",
  "Ishita",
  "Megha",
  "Divya",
  "Anjali",
  "Radhika",
  "Pallavi",
  "Swati",
  "Nikita",
  "Rohan",
  "Aditya",
  "Manav",
  "Kabir",
  "Sahil",
  "Varun",
];
const LAST = [
  "Sharma",
  "Reddy",
  "Menon",
  "Kulkarni",
  "Bose",
  "Chawla",
  "Pillai",
  "Joshi",
  "Gupta",
  "Ahuja",
  "Sethi",
  "Banerjee",
  "Rathore",
  "Nagpal",
  "Dutta",
  "Sinha",
];
const SOURCES = [
  "Instagram",
  "Website form",
  "Referral",
  "Google ad",
  "Webinar",
];
const NOTE_POOL = {
  first_call: [
    "Asked for details on the 3-month plan. Sending brochure.",
    "Busy at work, asked to call back after 7pm.",
    "Wants to know if consultations are online only.",
    "Comparing us with two other programmes.",
  ],
  callback: [
    "Discussed pricing. Wants to check with spouse.",
    "Follow-up done, still deciding.",
    "Number switched off, will retry tomorrow.",
    "Confirmed budget, asked about payment in parts.",
  ],
  renewal_rehash: [
    "Happy with progress, open to renewing for 3 more months.",
    "Wants a break for a month, will decide after.",
    "Renewed for the quarter, payment link shared.",
    "Not reachable, dropped a message on WhatsApp.",
  ],
  reference_call: [
    "Referred by an existing client, warm lead.",
    "Called the reference she shared, interested.",
  ],
};

let leadSeq = 0;
let clientSeq = 0;
let intSeq = 0;

const seedLeads = [];
for (let i = 0; i < 96; i++) {
  const status = pickW([
    ["new", 18],
    ["active_pursuing", 38],
    ["dead", 26],
    ["enrolled", 18],
  ]);
  seedLeads.push({
    id: "L" + ++leadSeq,
    name: pick(FIRST) + " " + pick(LAST),
    phone: makePhone(),
    source: pick(SOURCES),
    assigned_salesperson_id: SALES[i % SALES.length].id,
    status,
    created_at: daysAgo(1 + Math.floor(rnd() * 40)),
  });
}

const seedClients = [];
const seedInteractions = [];

const addInteraction = (o) => {
  seedInteractions.push({ id: "I" + ++intSeq, notes: "", ...o });
};

seedLeads.forEach((lead) => {
  const n =
    lead.status === "new"
      ? Math.floor(rnd() * 2)
      : lead.status === "active_pursuing"
        ? 3 + Math.floor(rnd() * 4)
        : lead.status === "enrolled"
          ? 4 + Math.floor(rnd() * 4)
          : 2 + Math.floor(rnd() * 4);
  const start = 2 + Math.floor(rnd() * 24);
  for (let k = 0; k < n; k++) {
    const last = k === n - 1;
    const type =
      k === 0
        ? "first_call"
        : pickW([
            ["callback", 9],
            ["reference_call", 1],
          ]);
    let outcome;
    if (last && lead.status === "enrolled") outcome = "interested";
    else if (last && lead.status === "dead")
      outcome = pickW([
        ["not_interested", 6],
        ["no_response", 4],
      ]);
    else
      outcome = pickW([
        ["connected", 5],
        ["not_connected", 3],
        ["interested", 3],
        ["no_response", 2],
      ]);
    const day = Math.max(0, start - k * (1 + Math.floor(rnd() * 4)));
    addInteraction({
      lead_id: lead.id,
      client_id: null,
      logged_by_user_id: lead.assigned_salesperson_id,
      type,
      outcome,
      notes: pick(NOTE_POOL[type] || NOTE_POOL.callback),
      occurred_at: daysAgo(day),
    });
  }
});

/* enrolled leads carry the date the handover happened */
seedLeads
  .filter((l) => l.status === "enrolled")
  .forEach((l) => {
    const mine = seedInteractions
      .filter((i) => i.lead_id === l.id)
      .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at));
    l.enrolled_at = mine[0] ? mine[0].occurred_at : l.created_at;
  });

/* clients: every enrolled lead becomes one, plus older clients with no lead */
seedLeads
  .filter((l) => l.status === "enrolled")
  .forEach((l, idx) => {
    seedClients.push({
      id: "C" + ++clientSeq,
      lead_id: l.id,
      name: l.name,
      phone: l.phone,
      assigned_dietician_id: DIETS[idx % DIETS.length].id,
      status: pickW([
        ["active", 8],
        ["inactive", 2],
      ]),
      created_at: l.created_at,
    });
  });
for (let i = 0; i < 18; i++) {
  seedClients.push({
    id: "C" + ++clientSeq,
    lead_id: null,
    name: pick(FIRST) + " " + pick(LAST),
    phone: makePhone(),
    assigned_dietician_id: DIETS[i % DIETS.length].id,
    status: pickW([
      ["active", 7],
      ["inactive", 3],
    ]),
    created_at: daysAgo(40 + Math.floor(rnd() * 120)),
  });
}

seedClients.forEach((c) => {
  const n = 2 + Math.floor(rnd() * 4);
  const start = 1 + Math.floor(rnd() * 24);
  for (let k = 0; k < n; k++) {
    const last = k === n - 1;
    let outcome;
    if (last && c.status === "active")
      outcome = pickW([
        ["renewed", 6],
        ["connected", 4],
      ]);
    else if (last)
      outcome = pickW([
        ["no_response", 5],
        ["not_interested", 5],
      ]);
    else
      outcome = pickW([
        ["connected", 5],
        ["not_connected", 3],
        ["no_response", 2],
      ]);
    const day = Math.max(0, start - k * (2 + Math.floor(rnd() * 5)));
    addInteraction({
      lead_id: null,
      client_id: c.id,
      logged_by_user_id: c.assigned_dietician_id,
      type: pickW([
        ["renewal_rehash", 9],
        ["reference_call", 1],
      ]),
      outcome,
      notes: pick(NOTE_POOL.renewal_rehash),
      occurred_at: daysAgo(day),
    });
  }
});

const monthKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const THIS_MONTH = monthKey(NOW);

/* each person is deliberately pegged at a different attainment so the owner
   dashboard shows a real spread rather than a wall of identical bars */
const ATTAINMENT = {
  s1: 1.22,
  s2: 1.06,
  s3: 0.97,
  s4: 0.84,
  s5: 1.13,
  s6: 0.71,
  s7: 0.93,
  d1: 1.14,
  d2: 0.95,
  d3: 0.79,
};
const seedTargets = USERS.filter((u) => u.role !== "owner").map((u) => {
  const done = seedInteractions.filter(
    (i) =>
      i.logged_by_user_id === u.id &&
      monthKey(new Date(i.occurred_at)) === THIS_MONTH,
  ).length;
  const raw = done / (ATTAINMENT[u.id] || 1);
  return {
    user_id: u.id,
    period: THIS_MONTH,
    target_count: Math.max(10, Math.round(raw / 5) * 5),
  };
});

/* --------------------------------- utilities ------------------------------ */
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
const sinceLabel = (iso) => {
  if (!iso) return "No calls yet";
  const days = Math.floor((NOW - new Date(iso)) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return days + " days ago";
};
const isSameMonth = (iso) => monthKey(new Date(iso)) === THIS_MONTH;
const isToday = (iso) => new Date(iso).toDateString() === NOW.toDateString();

/* -------------------------------- primitives ------------------------------ */
function Chip({ tone, children, mono }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: mono ? "0.04em" : 0,
        fontFamily: mono ? MONO : SANS,
        color: tone.fg,
        background: tone.bg,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Eyebrow({ children }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 10.5,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: T.inkFaint,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: T.card,
        border: "1px solid " + T.line,
        borderRadius: 14,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Stat({ label, value, sub, tone }) {
  return (
    <Card style={{ padding: "14px 16px" }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: T.inkFaint,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 30,
          fontWeight: 600,
          color: tone || T.ink,
          lineHeight: 1.15,
          marginTop: 6,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {sub ? (
        <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>
          {sub}
        </div>
      ) : null}
    </Card>
  );
}

function Button({
  children,
  onClick,
  variant = "solid",
  href,
  small,
  full,
  title,
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: small ? "7px 12px" : "10px 16px",
    borderRadius: 10,
    fontSize: small ? 12.5 : 14,
    fontWeight: 600,
    fontFamily: SANS,
    cursor: "pointer",
    border: "1px solid transparent",
    textDecoration: "none",
    width: full ? "100%" : undefined,
    transition: "background 120ms ease, border-color 120ms ease",
  };
  const styles = {
    solid: { ...base, background: T.plum, color: "#fff" },
    ghost: { ...base, background: "#fff", color: T.ink, borderColor: T.line },
    quiet: { ...base, background: T.plumSoft, color: T.plumDeep },
    danger: { ...base, background: T.claySoft, color: T.clay },
  };
  const s = styles[variant] || styles.solid;
  if (href)
    return (
      <a className="ff-btn" style={s} href={href} title={title}>
        {children}
      </a>
    );
  return (
    <button className="ff-btn" style={s} onClick={onClick} title={title}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: T.inkFaint,
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "9px 11px",
  borderRadius: 9,
  border: "1px solid " + T.line,
  fontSize: 14,
  fontFamily: SANS,
  color: T.ink,
  background: "#fff",
};

/* signature device: attainment bar with a target notch the fill can pass */
function AttainmentBar({ achieved, target, height = 10 }) {
  const scale = Math.max(target, achieved, 1) * 1.14;
  const fill = Math.min(100, (achieved / scale) * 100);
  const notch = Math.min(100, (target / scale) * 100);
  const hit = achieved >= target;
  return (
    <div
      style={{
        position: "relative",
        height,
        background: "#EFE8EE",
        borderRadius: 999,
        overflow: "visible",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: fill + "%",
          background: hit ? T.moss : T.plum,
          borderRadius: 999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: notch + "%",
          top: -4,
          height: height + 8,
          width: 2,
          background: T.ink,
          borderRadius: 2,
        }}
        title={"Target " + target}
      />
    </div>
  );
}

/* ---------------------------------- header -------------------------------- */
function Header({ currentUser, setUserId }) {
  return (
    <div
      style={{
        background: T.plumDeep,
        color: "#fff",
        padding: "14px 20px",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        className="ff-header-row"
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9.5,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Ops console
          </div>
          <div
            style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            FiddleFit
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Signed in as
          </span>
          <select
            value={currentUser.id}
            onChange={(e) => setUserId(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 9,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.10)",
              color: "#fff",
              fontSize: 13.5,
              fontFamily: SANS,
              fontWeight: 600,
            }}
          >
            <optgroup label="Owner">
              {USERS.filter((u) => u.role === "owner").map((u) => (
                <option key={u.id} value={u.id} style={{ color: T.ink }}>
                  {u.full_name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Sales">
              {SALES.map((u) => (
                <option key={u.id} value={u.id} style={{ color: T.ink }}>
                  {u.full_name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Dieticians">
              {DIETS.map((u) => (
                <option key={u.id} value={u.id} style={{ color: T.ink }}>
                  {u.full_name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- record row ----------------------------- */
function RecordRow({ record, statusMap, lastAt, count, onOpen }) {
  const tone = statusMap[record.status];
  return (
    <div
      className="ff-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderBottom: "1px solid " + T.line,
        background: "#fff",
      }}
    >
      <button
        onClick={onOpen}
        className="ff-btn"
        style={{
          flex: 1,
          minWidth: 0,
          textAlign: "left",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontFamily: SANS,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 650, color: T.ink }}>
            {record.name}
          </span>
          <Chip tone={tone}>{tone.label}</Chip>
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12.5,
            color: T.inkSoft,
            marginTop: 3,
          }}
        >
          {record.phone}
        </div>
        <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 3 }}>
          {sinceLabel(lastAt)} · {count} logged
        </div>
      </button>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <Button
          href={telHref(record.phone)}
          variant="quiet"
          small
          title="Opens your phone dialler"
        >
          Call
        </Button>
        <Button onClick={onOpen} variant="ghost" small>
          Log
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------- detail sheet ----------------------------- */
function DetailSheet({
  record,
  kind,
  interactions,
  onClose,
  onLog,
  onStatus,
  onEnroll,
}) {
  const [type, setType] = useState(
    kind === "lead" ? "callback" : "renewal_rehash",
  );
  const [outcome, setOutcome] = useState(
    kind === "lead" ? "connected" : "connected",
  );
  const [notes, setNotes] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [dietId, setDietId] = useState(DIETS[0].id);

  const statusMap = kind === "lead" ? LEAD_STATUS : CLIENT_STATUS;
  const outcomes = kind === "lead" ? SALES_OUTCOMES : DIET_OUTCOMES;
  const types =
    kind === "lead"
      ? ["first_call", "callback", "reference_call"]
      : ["renewal_rehash", "reference_call"];

  const submit = () => {
    onLog({ type, outcome, notes });
    setNotes("");
  };

  return (
    <>
      <div className="ff-scrim" onClick={onClose} />
      <aside className="ff-sheet">
        <div
          style={{
            padding: "16px 18px",
            borderBottom: "1px solid " + T.line,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 19, fontWeight: 700, color: T.ink }}>
              {record.name}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 13,
                color: T.inkSoft,
                marginTop: 3,
              }}
            >
              {record.phone}
            </div>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              <Chip tone={statusMap[record.status]}>
                {statusMap[record.status].label}
              </Chip>
              {record.source ? (
                <span style={{ fontSize: 12, color: T.inkFaint }}>
                  via {record.source}
                </span>
              ) : null}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ff-btn"
            style={{
              border: "1px solid " + T.line,
              background: "#fff",
              borderRadius: 9,
              width: 30,
              height: 30,
              cursor: "pointer",
              color: T.inkSoft,
              fontSize: 16,
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{ padding: 18, overflowY: "auto", flex: 1 }}>
          <Button href={telHref(record.phone)} full>
            Call {record.name.split(" ")[0]}
          </Button>
          <div
            style={{
              fontSize: 11.5,
              color: T.inkFaint,
              marginTop: 6,
              textAlign: "center",
            }}
          >
            Opens the dialler on your phone. Log the outcome here after the
            call.
          </div>

          <div style={{ height: 20 }} />
          <Eyebrow>Status</Eyebrow>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.keys(statusMap).map((s) => {
              const on = record.status === s;
              return (
                <button
                  key={s}
                  className="ff-btn"
                  onClick={() => {
                    if (kind === "lead" && s === "enrolled") setEnrolling(true);
                    else onStatus(s);
                  }}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 9,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: SANS,
                    border: "1px solid " + (on ? statusMap[s].fg : T.line),
                    background: on ? statusMap[s].bg : "#fff",
                    color: on ? statusMap[s].fg : T.inkSoft,
                  }}
                >
                  {statusMap[s].label}
                </button>
              );
            })}
          </div>

          {enrolling ? (
            <div
              style={{
                marginTop: 12,
                padding: 14,
                borderRadius: 12,
                background: T.mossSoft,
                border: "1px solid #CFE3D9",
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 650, color: T.moss }}>
                Hand over to a dietician
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: T.inkSoft,
                  margin: "4px 0 10px",
                }}
              >
                This creates a client record owned by the dietician. The lead
                stays in your list as enrolled, but the renewal history after
                handover is theirs, not yours.
              </div>
              <select
                value={dietId}
                onChange={(e) => setDietId(e.target.value)}
                style={inputStyle}
              >
                {DIETS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Button
                  small
                  onClick={() => {
                    onEnroll(dietId);
                    setEnrolling(false);
                  }}
                >
                  Enrol and hand over
                </Button>
                <Button
                  small
                  variant="ghost"
                  onClick={() => setEnrolling(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}

          <div style={{ height: 22 }} />
          <Eyebrow>Log a call</Eyebrow>
          <Field label="Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={inputStyle}
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Outcome">
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              style={inputStyle}
            >
              {outcomes.map((o) => (
                <option key={o} value={o}>
                  {OUTCOME[o].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What was said, what happens next"
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Field>
          <Button onClick={submit} full>
            Save call
          </Button>

          <div style={{ height: 26 }} />
          <Eyebrow>History · {interactions.length} calls</Eyebrow>
          {interactions.length === 0 ? (
            <div style={{ fontSize: 13, color: T.inkFaint }}>
              Nothing logged yet. Save the first call above.
            </div>
          ) : (
            <div style={{ borderLeft: "2px solid " + T.line, paddingLeft: 14 }}>
              {interactions.map((i) => (
                <div
                  key={i.id}
                  style={{ position: "relative", paddingBottom: 16 }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: -20,
                      top: 5,
                      width: 8,
                      height: 8,
                      borderRadius: 99,
                      background: OUTCOME[i.outcome].fg,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{ fontSize: 13.5, fontWeight: 650, color: T.ink }}
                    >
                      {TYPE_LABEL[i.type]}
                    </span>
                    <Chip tone={OUTCOME[i.outcome]}>
                      {OUTCOME[i.outcome].label}
                    </Chip>
                  </div>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      color: T.inkFaint,
                      marginTop: 3,
                    }}
                  >
                    {fmtDateTime(i.occurred_at)} ·{" "}
                    {userById(i.logged_by_user_id).full_name}
                  </div>
                  {i.notes ? (
                    <div
                      style={{
                        fontSize: 13,
                        color: T.inkSoft,
                        marginTop: 5,
                        lineHeight: 1.45,
                      }}
                    >
                      {i.notes}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/* --------------------------------- rep view ------------------------------- */
function RepView({
  user,
  records,
  interactions,
  kind,
  target,
  onAdd,
  onLog,
  onStatus,
  onEnroll,
}) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    phone: "",
    source: SOURCES[0],
  });

  const statusMap = kind === "lead" ? LEAD_STATUS : CLIENT_STATUS;
  const mine = records;
  const byRecord = (id) =>
    interactions
      .filter((i) => (kind === "lead" ? i.lead_id === id : i.client_id === id))
      .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at));

  const monthCalls = interactions.filter((i) =>
    isSameMonth(i.occurred_at),
  ).length;
  const todayCalls = interactions.filter((i) => isToday(i.occurred_at)).length;
  const won =
    kind === "lead"
      ? mine.filter(
          (r) =>
            r.status === "enrolled" &&
            r.enrolled_at &&
            isSameMonth(r.enrolled_at),
        ).length
      : interactions.filter(
          (i) => i.outcome === "renewed" && isSameMonth(i.occurred_at),
        ).length;

  const filtered = mine
    .filter((r) => (filter === "all" ? true : r.status === filter))
    .filter((r) =>
      q.trim() === ""
        ? true
        : (r.name + r.phone).toLowerCase().includes(q.trim().toLowerCase()),
    )
    .sort((a, b) => {
      const la = byRecord(a.id)[0];
      const lb = byRecord(b.id)[0];
      return (
        new Date(lb ? lb.occurred_at : 0) - new Date(la ? la.occurred_at : 0)
      );
    });

  const open = mine.find((r) => r.id === openId);

  return (
    <div>
      <div className="ff-grid">
        <Stat
          label={kind === "lead" ? "My leads" : "My clients"}
          value={mine.length}
          sub={
            kind === "lead"
              ? mine.filter((r) => r.status === "active_pursuing").length +
                " still pursuing"
              : mine.filter((r) => r.status === "active").length + " active"
          }
        />
        <Stat label="Calls today" value={todayCalls} sub="logged by you" />
        <Stat
          label={kind === "lead" ? "Enrolled" : "Renewed"}
          value={won}
          sub="this month"
          tone={T.moss}
        />
        <Card style={{ padding: "14px 16px" }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: T.inkFaint,
            }}
          >
            Monthly target
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 30,
              fontWeight: 600,
              color: monthCalls >= target ? T.moss : T.ink,
              marginTop: 6,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {monthCalls}
            <span style={{ fontSize: 15, color: T.inkFaint }}> / {target}</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <AttainmentBar achieved={monthCalls} target={target} height={8} />
          </div>
        </Card>
      </div>

      <div style={{ height: 22 }} />

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["all", ...Object.keys(statusMap)].map((s) => {
            const on = filter === s;
            const label = s === "all" ? "All" : statusMap[s].label;
            const n =
              s === "all"
                ? mine.length
                : mine.filter((r) => r.status === s).length;
            return (
              <button
                key={s}
                className="ff-btn"
                onClick={() => setFilter(s)}
                style={{
                  padding: "7px 12px",
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: SANS,
                  border: "1px solid " + (on ? T.plum : T.line),
                  background: on ? T.plum : "#fff",
                  color: on ? "#fff" : T.inkSoft,
                }}
              >
                {label}{" "}
                <span style={{ fontFamily: MONO, opacity: 0.75 }}>{n}</span>
              </button>
            );
          })}
        </div>
        <div style={{ flex: 1 }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or number"
          style={{ ...inputStyle, width: 210 }}
        />
        {kind === "lead" ? (
          <Button onClick={() => setAdding(true)}>Add lead</Button>
        ) : null}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: T.inkFaint,
              fontSize: 14,
            }}
          >
            Nothing here yet.{" "}
            {kind === "lead"
              ? "Add a lead to start calling."
              : "Enrolled leads land here."}
          </div>
        ) : (
          filtered.map((r) => {
            const list = byRecord(r.id);
            return (
              <RecordRow
                key={r.id}
                record={r}
                statusMap={statusMap}
                lastAt={list[0] ? list[0].occurred_at : null}
                count={list.length}
                onOpen={() => setOpenId(r.id)}
              />
            );
          })
        )}
      </Card>

      {open ? (
        <DetailSheet
          record={open}
          kind={kind}
          interactions={byRecord(open.id)}
          onClose={() => setOpenId(null)}
          onLog={(payload) => onLog(open, payload)}
          onStatus={(s) => onStatus(open, s)}
          onEnroll={(dietId) => onEnroll(open, dietId)}
        />
      ) : null}

      {adding ? (
        <>
          <div className="ff-scrim" onClick={() => setAdding(false)} />
          <div className="ff-modal">
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: T.ink,
                marginBottom: 4,
              }}
            >
              Add a lead
            </div>
            <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 14 }}>
              It will be assigned to you and start as New.
            </div>
            <Field label="Name">
              <input
                style={inputStyle}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Full name"
              />
            </Field>
            <Field label="Phone">
              <input
                style={{ ...inputStyle, fontFamily: MONO }}
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </Field>
            <Field label="Source">
              <select
                style={inputStyle}
                value={draft.source}
                onChange={(e) => setDraft({ ...draft, source: e.target.value })}
              >
                {SOURCES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Button
                onClick={() => {
                  if (!draft.name.trim() || !draft.phone.trim()) return;
                  onAdd(draft);
                  setDraft({ name: "", phone: "", source: SOURCES[0] });
                  setAdding(false);
                }}
              >
                Save lead
              </Button>
              <Button variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------- owner view ------------------------------- */
function Sparkline({ interactions }) {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(NOW);
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    days.push({
      key,
      label: d.getDate(),
      n: interactions.filter(
        (x) => new Date(x.occurred_at).toDateString() === key,
      ).length,
    });
  }
  const max = Math.max(1, ...days.map((d) => d.n));
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 74 }}
    >
      {days.map((d) => (
        <div key={d.key} style={{ flex: 1, textAlign: "center" }}>
          <div
            title={d.n + " calls"}
            style={{
              height: Math.max(3, (d.n / max) * 58),
              background: d.n === 0 ? T.line : T.plum,
              borderRadius: 3,
            }}
          />
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              color: T.inkFaint,
              marginTop: 4,
            }}
          >
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusSplit({ counts, map }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return (
    <div>
      <div
        style={{
          display: "flex",
          height: 12,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        {Object.keys(map).map((k) => (
          <div
            key={k}
            title={map[k].label + ": " + (counts[k] || 0)}
            style={{
              width: ((counts[k] || 0) / total) * 100 + "%",
              background: map[k].fg,
            }}
          />
        ))}
      </div>
      <div
        style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}
      >
        {Object.keys(map).map((k) => (
          <div
            key={k}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: map[k].fg,
              }}
            />
            <span style={{ fontSize: 12.5, color: T.inkSoft }}>
              {map[k].label}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12.5,
                fontWeight: 600,
                color: T.ink,
              }}
            >
              {counts[k] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonTable({ people, rows }) {
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      {people.map((p, idx) => {
        const r = rows(p);
        return (
          <div
            key={p.id}
            style={{
              padding: "14px 16px",
              borderTop: idx === 0 ? "none" : "1px solid " + T.line,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 14.5, fontWeight: 650, color: T.ink }}>
                {p.full_name}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: r.achieved >= r.target ? T.moss : T.inkSoft,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {r.achieved} / {r.target} calls
              </div>
            </div>
            <div style={{ margin: "10px 0 9px" }}>
              <AttainmentBar achieved={r.achieved} target={r.target} />
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {r.stats.map((s) => (
                <div
                  key={s.label}
                  style={{ display: "flex", gap: 6, alignItems: "baseline" }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: T.inkFaint,
                    }}
                  >
                    {s.label}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.ink,
                    }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </Card>
  );
}

function OwnerView({ leads, clients, interactions, targets }) {
  const [tab, setTab] = useState("overview");
  const targetFor = (id) => {
    const t = targets.find((x) => x.user_id === id && x.period === THIS_MONTH);
    return t ? t.target_count : 0;
  };
  const monthInts = interactions.filter((i) => isSameMonth(i.occurred_at));
  const callsBy = (id) =>
    monthInts.filter((i) => i.logged_by_user_id === id).length;

  const leadCounts = Object.keys(LEAD_STATUS).reduce((acc, k) => {
    acc[k] = leads.filter((l) => l.status === k).length;
    return acc;
  }, {});
  const clientCounts = Object.keys(CLIENT_STATUS).reduce((acc, k) => {
    acc[k] = clients.filter((c) => c.status === k).length;
    return acc;
  }, {});
  const renewalsThisMonth = monthInts.filter(
    (i) => i.outcome === "renewed",
  ).length;
  const enrolledThisMonth = leads.filter(
    (l) =>
      l.status === "enrolled" && l.enrolled_at && isSameMonth(l.enrolled_at),
  ).length;

  const teamTarget = (list) => list.reduce((s, u) => s + targetFor(u.id), 0);
  const teamCalls = (list) => list.reduce((s, u) => s + callsBy(u.id), 0);

  const tabs = [
    ["overview", "Overview"],
    ["sales", "Sales team"],
    ["dieticians", "Dietician team"],
    ["activity", "Activity log"],
  ];

  return (
    <div>
      <div
        style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}
      >
        {tabs.map(([k, label]) => {
          const on = tab === k;
          return (
            <button
              key={k}
              className="ff-btn"
              onClick={() => setTab(k)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: SANS,
                border: "1px solid " + (on ? T.plum : T.line),
                background: on ? T.plum : "#fff",
                color: on ? "#fff" : T.inkSoft,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {tab === "overview" ? (
        <div>
          <div className="ff-grid">
            <Stat
              label="Live pipeline"
              value={leadCounts.new + leadCounts.active_pursuing}
              sub="leads not yet closed"
            />
            <Stat
              label="Enrolled"
              value={enrolledThisMonth}
              sub="this month"
              tone={T.moss}
            />
            <Stat
              label="Active clients"
              value={clientCounts.active}
              sub="with a dietician"
            />
            <Stat
              label="Renewals"
              value={renewalsThisMonth}
              sub="this month"
              tone={T.moss}
            />
          </div>

          <div style={{ height: 16 }} />
          <div className="ff-two">
            <Card>
              <Eyebrow>Calls logged · last 14 days</Eyebrow>
              <Sparkline interactions={interactions} />
              <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 10 }}>
                {monthInts.length} calls logged across both teams this month.
              </div>
            </Card>
            <Card>
              <Eyebrow>Where the leads stand</Eyebrow>
              <StatusSplit counts={leadCounts} map={LEAD_STATUS} />
              <div style={{ height: 18 }} />
              <Eyebrow>Client base</Eyebrow>
              <StatusSplit counts={clientCounts} map={CLIENT_STATUS} />
            </Card>
          </div>

          <div style={{ height: 16 }} />
          <div className="ff-two">
            <Card>
              <Eyebrow>Sales team · month to date</Eyebrow>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 26,
                  fontWeight: 600,
                  color: T.ink,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {teamCalls(SALES)}
                <span style={{ fontSize: 14, color: T.inkFaint }}>
                  {" "}
                  / {teamTarget(SALES)}
                </span>
              </div>
              <div style={{ margin: "10px 0 6px" }}>
                <AttainmentBar
                  achieved={teamCalls(SALES)}
                  target={teamTarget(SALES)}
                />
              </div>
              <div style={{ fontSize: 12.5, color: T.inkSoft }}>
                {SALES.filter((u) => callsBy(u.id) >= targetFor(u.id)).length}{" "}
                of {SALES.length} on or past target
              </div>
            </Card>
            <Card>
              <Eyebrow>Dietician team · month to date</Eyebrow>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 26,
                  fontWeight: 600,
                  color: T.ink,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {teamCalls(DIETS)}
                <span style={{ fontSize: 14, color: T.inkFaint }}>
                  {" "}
                  / {teamTarget(DIETS)}
                </span>
              </div>
              <div style={{ margin: "10px 0 6px" }}>
                <AttainmentBar
                  achieved={teamCalls(DIETS)}
                  target={teamTarget(DIETS)}
                />
              </div>
              <div style={{ fontSize: 12.5, color: T.inkSoft }}>
                {renewalsThisMonth} renewals confirmed this month
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "sales" ? (
        <div>
          <Eyebrow>
            Target vs achieved · {SALES.length} salespeople · the notch marks
            target
          </Eyebrow>
          <PersonTable
            people={SALES}
            rows={(p) => {
              const owned = leads.filter(
                (l) => l.assigned_salesperson_id === p.id,
              );
              const enrolled = owned.filter(
                (l) => l.status === "enrolled",
              ).length;
              const dead = owned.filter((l) => l.status === "dead").length;
              const closed = enrolled + dead;
              return {
                achieved: callsBy(p.id),
                target: targetFor(p.id),
                stats: [
                  { label: "Leads", value: owned.length },
                  { label: "Enrolled", value: enrolled },
                  { label: "Dead", value: dead },
                  {
                    label: "Close rate",
                    value: closed
                      ? Math.round((enrolled / closed) * 100) + "%"
                      : "—",
                  },
                ],
              };
            }}
          />
        </div>
      ) : null}

      {tab === "dieticians" ? (
        <div>
          <Eyebrow>
            Target vs achieved · {DIETS.length} dieticians · the notch marks
            target
          </Eyebrow>
          <PersonTable
            people={DIETS}
            rows={(p) => {
              const owned = clients.filter(
                (c) => c.assigned_dietician_id === p.id,
              );
              const mine = monthInts.filter(
                (i) => i.logged_by_user_id === p.id,
              );
              const renewed = mine.filter(
                (i) => i.outcome === "renewed",
              ).length;
              return {
                achieved: callsBy(p.id),
                target: targetFor(p.id),
                stats: [
                  { label: "Clients", value: owned.length },
                  {
                    label: "Active",
                    value: owned.filter((c) => c.status === "active").length,
                  },
                  { label: "Renewed", value: renewed },
                  {
                    label: "Rehash rate",
                    value: mine.length
                      ? Math.round((renewed / mine.length) * 100) + "%"
                      : "—",
                  },
                ],
              };
            }}
          />
        </div>
      ) : null}

      {tab === "activity" ? (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {[...interactions]
            .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))
            .slice(0, 40)
            .map((i, idx) => {
              const who = userById(i.logged_by_user_id);
              const subject = i.lead_id
                ? leads.find((l) => l.id === i.lead_id)
                : clients.find((c) => c.id === i.client_id);
              return (
                <div
                  key={i.id}
                  style={{
                    padding: "12px 16px",
                    borderTop: idx === 0 ? "none" : "1px solid " + T.line,
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 14, color: T.ink }}>
                      <strong>{who.full_name}</strong>
                      <span style={{ color: T.inkSoft }}>
                        {" "}
                        · {TYPE_LABEL[i.type]} with{" "}
                        {subject ? subject.name : "—"}
                      </span>
                    </div>
                    {i.notes ? (
                      <div
                        style={{
                          fontSize: 12.5,
                          color: T.inkFaint,
                          marginTop: 3,
                        }}
                      >
                        {i.notes}
                      </div>
                    ) : null}
                  </div>
                  <Chip tone={OUTCOME[i.outcome]}>
                    {OUTCOME[i.outcome].label}
                  </Chip>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 11.5,
                      color: T.inkFaint,
                      width: 96,
                      textAlign: "right",
                    }}
                  >
                    {fmtDate(i.occurred_at)}
                  </span>
                </div>
              );
            })}
        </Card>
      ) : null}
    </div>
  );
}

/* ----------------------------------- app ---------------------------------- */
export default function FiddleFitOpsConsole() {
  const [userId, setUserId] = useState("o1");
  const [leads, setLeads] = useState(seedLeads);
  const [clients, setClients] = useState(seedClients);
  const [interactions, setInteractions] = useState(seedInteractions);
  const [targets] = useState(seedTargets);
  const [toast, setToast] = useState(null);

  const user = userById(userId);
  const say = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  /* role separation: each rep only ever gets their own slice */
  const visibleLeads = useMemo(
    () =>
      user.role === "sales"
        ? leads.filter((l) => l.assigned_salesperson_id === user.id)
        : leads,
    [leads, user],
  );
  const visibleClients = useMemo(
    () =>
      user.role === "dietician"
        ? clients.filter((c) => c.assigned_dietician_id === user.id)
        : clients,
    [clients, user],
  );
  const myInteractions = useMemo(
    () => interactions.filter((i) => i.logged_by_user_id === user.id),
    [interactions, user],
  );

  const targetFor = (id) => {
    const t = targets.find((x) => x.user_id === id && x.period === THIS_MONTH);
    return t ? t.target_count : 0;
  };

  const logInteraction = (record, kind, payload) => {
    setInteractions((prev) => [
      ...prev,
      {
        id: "I" + ++intSeq,
        lead_id: kind === "lead" ? record.id : null,
        client_id: kind === "client" ? record.id : null,
        logged_by_user_id: user.id,
        type: payload.type,
        outcome: payload.outcome,
        notes: payload.notes,
        occurred_at: new Date().toISOString(),
      },
    ]);
    say("Call saved against " + record.name + ".");
  };

  const setLeadStatus = (lead, status) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status } : l)),
    );
    say(lead.name + " moved to " + LEAD_STATUS[status].label + ".");
  };
  const setClientStatus = (client, status) => {
    setClients((prev) =>
      prev.map((c) => (c.id === client.id ? { ...c, status } : c)),
    );
    say(client.name + " marked " + CLIENT_STATUS[status].label + ".");
  };

  const enrolLead = (lead, dietId) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === lead.id
          ? { ...l, status: "enrolled", enrolled_at: new Date().toISOString() }
          : l,
      ),
    );
    setClients((prev) => [
      ...prev,
      {
        id: "C" + ++clientSeq,
        lead_id: lead.id,
        name: lead.name,
        phone: lead.phone,
        assigned_dietician_id: dietId,
        status: "active",
        created_at: new Date().toISOString(),
      },
    ]);
    say(
      lead.name + " enrolled and handed to " + userById(dietId).full_name + ".",
    );
  };

  const addLead = (draft) => {
    setLeads((prev) => [
      {
        id: "L" + ++leadSeq,
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        source: draft.source,
        assigned_salesperson_id: user.id,
        status: "new",
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    say("Lead added to your list.");
  };

  const scopeNote =
    user.role === "owner"
      ? "You can see every lead, client and call across both teams."
      : user.role === "sales"
        ? "You can see only the leads assigned to you. Client records sit with the dieticians."
        : "You can see only the clients assigned to you. The sales pipeline is not visible here.";

  return (
    <div
      style={{
        fontFamily: SANS,
        background: T.paper,
        color: T.ink,
        minHeight: "100vh",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        .ff-grid{display:grid;gap:12px;grid-template-columns:repeat(4,1fr)}
        .ff-two{display:grid;gap:12px;grid-template-columns:1fr 1fr}
        @media (max-width:820px){
          .ff-grid{grid-template-columns:repeat(2,1fr)}
          .ff-two{grid-template-columns:1fr}
          .ff-header-row{flex-direction:column;align-items:flex-start}
        }
        .ff-scrim{position:fixed;inset:0;background:rgba(34,26,41,0.38);z-index:40}
        .ff-sheet{position:fixed;top:0;right:0;height:100%;width:460px;max-width:100%;
          background:#fff;z-index:50;display:flex;flex-direction:column;
          box-shadow:-18px 0 44px rgba(34,26,41,0.16)}
        .ff-modal{position:fixed;z-index:50;top:50%;left:50%;transform:translate(-50%,-50%);
          width:400px;max-width:92vw;background:#fff;border-radius:16px;padding:22px;
          box-shadow:0 22px 60px rgba(34,26,41,0.24)}
        .ff-btn:focus-visible{outline:2px solid ${T.plum};outline-offset:2px}
        .ff-row:hover{background:${T.plumSoft} !important}
        select,input,textarea{outline-color:${T.plum}}
        @media (prefers-reduced-motion:reduce){*{transition:none !important;animation:none !important}}
      `}</style>

      <Header currentUser={user} setUserId={setUserId} />

      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid " + T.line,
          padding: "9px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            fontSize: 12.5,
            color: T.inkSoft,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Chip tone={{ fg: T.plumDeep, bg: T.plumSoft }} mono>
            {user.role.toUpperCase()}
          </Chip>
          <span>{scopeNote}</span>
          <span style={{ color: T.inkFaint }}>
            · Prototype with sample data — switch user above to see the same
            system through another role.
          </span>
        </div>
      </div>

      <div
        style={{ maxWidth: 1120, margin: "0 auto", padding: "22px 20px 80px" }}
      >
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 25,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: T.ink,
            }}
          >
            {user.role === "owner"
              ? "Business overview"
              : user.role === "sales"
                ? "Your leads"
                : "Your clients"}
          </div>
          <div style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 3 }}>
            {user.full_name} ·{" "}
            {NOW.toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {user.role === "owner" ? (
          <OwnerView
            leads={leads}
            clients={clients}
            interactions={interactions}
            targets={targets}
          />
        ) : user.role === "sales" ? (
          <RepView
            user={user}
            kind="lead"
            records={visibleLeads}
            interactions={myInteractions}
            target={targetFor(user.id)}
            onAdd={addLead}
            onLog={(rec, payload) => logInteraction(rec, "lead", payload)}
            onStatus={setLeadStatus}
            onEnroll={enrolLead}
          />
        ) : (
          <RepView
            user={user}
            kind="client"
            records={visibleClients}
            interactions={myInteractions}
            target={targetFor(user.id)}
            onAdd={() => {}}
            onLog={(rec, payload) => logInteraction(rec, "client", payload)}
            onStatus={setClientStatus}
            onEnroll={() => {}}
          />
        )}
      </div>

      {toast ? (
        <div
          style={{
            position: "fixed",
            bottom: 22,
            left: "50%",
            transform: "translateX(-50%)",
            background: T.ink,
            color: "#fff",
            padding: "11px 18px",
            borderRadius: 999,
            fontSize: 13.5,
            fontWeight: 600,
            zIndex: 60,
            boxShadow: "0 10px 30px rgba(34,26,41,0.3)",
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
