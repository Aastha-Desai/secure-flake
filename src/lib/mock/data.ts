export type AssetStatus = "OK" | "WARN" | "FAIL";

export type Asset = {
  id: string;
  database: string;
  schema: string;
  table: string;

  // Configurable by user
  criticality: "High" | "Medium" | "Low";
  cadence: "Hourly" | "Daily" | "Weekly";
  monitored: boolean;

  // Computed by checks
  status: AssetStatus;
  updatedAt: string;
  why: string;
};

export type Incident = {
  id: string;
  assetId: string;
  assetName: string;
  state: "Open" | "Monitoring" | "Resolved";
  startedAt: string;
  cause: string;
  evidence: string;
};

export const assets: Asset[] = [
  {
    id: "1",
    database: "PROD",
    schema: "ANALYTICS",
    table: "ORDERS",

    criticality: "High",
    cadence: "Hourly",
    monitored: true,

    status: "OK",
    updatedAt: "2026-01-21 15:10",
    why: "Fresh within SLA. Row counts stable. No schema changes.",
  },
  {
    id: "2",
    database: "PROD",
    schema: "ANALYTICS",
    table: "CUSTOMERS",

    criticality: "High",
    cadence: "Daily",
    monitored: true,

    status: "WARN",
    updatedAt: "2026-01-20 03:02",
    why: "Freshness is late vs expected cadence. Row count within baseline.",
  },
  {
    id: "3",
    database: "PROD",
    schema: "FINANCE",
    table: "REVENUE_DAILY",

    criticality: "Medium",
    cadence: "Daily",
    monitored: false,

    status: "FAIL",
    updatedAt: "2026-01-18 01:05",
    why: "Schema change detected: column type changed (amount: NUMBER → VARCHAR).",
  },
];

export const incidents: Incident[] = [
  {
    id: "inc_1",
    assetId: "3",
    assetName: "PROD.FINANCE.REVENUE_DAILY",
    state: "Open",
    startedAt: "2026-01-18 01:10",
    cause: "Schema change",
    evidence:
      "Column `amount` changed type from NUMBER to VARCHAR, breaking downstream BI models.",
  },
  {
    id: "inc_2",
    assetId: "2",
    assetName: "PROD.ANALYTICS.CUSTOMERS",
    state: "Monitoring",
    startedAt: "2026-01-20 09:00",
    cause: "Late freshness",
    evidence:
      "Timestamp column exceeded freshness threshold for daily cadence.",
  },
];
