// Core domain types mirroring the Data Vault schema (see supabase/migrations).
// Kept hand-written for the Release 1 scaffold; swap for `supabase gen types`
// once the schema stabilises.

export type ConfidenceLabel =
  | "high_confidence"
  | "moderate_confidence"
  | "low_confidence"
  | "early_signal"
  | "conflicting_evidence"
  | "unverified";

export type SignalCategory =
  | "company_performance"
  | "workforce_hiring"
  | "sales_gtm"
  | "marketing_positioning"
  | "ai_integration"
  | "new_initiative"
  | "new_product"
  | "market_influence"
  | "event"
  | "ecosystem_partnership";

export type AlertLevel = "critical" | "strategic" | "emerging" | "informational";

export type RoleView =
  | "leadership"
  | "partnership_alliance"
  | "product"
  | "sales_gtm"
  | "investor_strategy";

export interface Company {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  hq_country: string | null;
  ai_maturity_level: number | null;
  lifecycle_classification: string | null;
  gtm_model: string | null;
}

export interface Signal {
  id: string;
  company_id: string;
  category: SignalCategory;
  headline: string;
  description: string | null;
  evidence_excerpt: string | null;
  confidence_label: ConfidenceLabel;
  magnitude: "minor" | "moderate" | "major";
  strategic_relevance: "low" | "medium" | "high";
  occurred_at: string | null;
  detected_at: string;
  requires_review: boolean;
}

export interface Alert {
  id: string;
  company_id: string;
  level: AlertLevel;
  title: string;
  what_changed: string;
  why_it_matters: string | null;
  suggested_follow_up: string | null;
  confidence_label: ConfidenceLabel | null;
  created_at: string;
}

export interface CompanyTimelineEvent {
  id: string;
  company_id: string;
  event_type: string;
  title: string;
  description: string | null;
  occurred_at: string;
}

export interface ReviewQueueItem {
  id: string;
  item_type: "signal" | "movement" | "prediction" | "entity_match" | "contradiction";
  item_id: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "edited" | "merged";
  created_at: string;
}
