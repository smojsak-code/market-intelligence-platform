/**
 * Ingestion pipeline reference implementation.
 *
 * Demonstrates the mandatory evidence chain end to end:
 *
 *   Source -> Raw document (Data Vault) -> Normalized document
 *          -> Structured signal (with confidence) -> Company timeline event
 *          -> Alert (if material)
 *
 * This uses a bundled sample document so it runs offline and deterministically.
 * In production, replace `fetchDocument()` with a real connector (RSS, web
 * scrape, filing feed, jobs board API, etc.) that returns { url, content, httpStatus }.
 *
 * Usage:
 *   npm run ingest:example
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (server-only key, never
 * expose it to the browser).
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

// --- Step 0: a document as a real connector would return it -------------
async function fetchDocument() {
  return {
    url: "https://www.uipath.com/newsroom/uipath-expands-agentic-automation-platform",
    httpStatus: 200,
    content:
      "UiPath today announced the general availability of autonomous testing " +
      "agents within its Agentic Automation Platform, and confirmed it is " +
      "doubling its AI engineering headcount over the next two quarters to " +
      "support enterprise rollout. The company said the expansion reflects " +
      "accelerating customer demand for agent-based workflow automation " +
      "across regulated industries.",
  };
}

async function main() {
  const company = await getOrCreateCompany("UiPath");
  const source = await getOrCreateSource();
  const doc = await fetchDocument();

  // --- Step 1: Raw evidence layer (immutable) ----------------------------
  const contentHash = crypto.createHash("sha256").update(doc.content).digest("hex");

  const { data: existing } = await supabase
    .from("raw_documents")
    .select("id")
    .eq("content_hash", contentHash)
    .maybeSingle();

  const rawDocument =
    existing ??
    (
      await supabase
        .from("raw_documents")
        .insert({
          source_id: source.id,
          company_id: company.id,
          url: doc.url,
          content_hash: contentHash,
          raw_content: doc.content,
          http_status: doc.httpStatus,
        })
        .select()
        .single()
    ).data;

  console.log(`[1/5] Raw document stored in Data Vault: ${rawDocument.id}`);

  // --- Step 2: Normalised content layer -----------------------------------
  const { data: normalized } = await supabase
    .from("normalized_documents")
    .insert({
      raw_document_id: rawDocument.id,
      cleaned_text: doc.content,
      extracted_entities: [
        { type: "company", value: "UiPath" },
        { type: "topic", value: "agentic automation" },
        { type: "topic", value: "AI engineering hiring" },
      ],
      classification: ["ai_integration", "workforce_hiring"],
    })
    .select()
    .single();

  console.log(`[2/5] Normalised document created: ${normalized.id}`);

  // --- Step 3: Signal layer, with transparent confidence scoring ----------
  // Confidence rules (simplified v1 — see Evidence Confidence & Contradiction
  // Engine, section 7 of the product plan):
  //  - official first-party source + single corroboration -> moderate_confidence
  //  - official first-party source + 2+ independent corroborations -> high_confidence
  //  - non-first-party / promotional source -> low_confidence or unverified
  const corroborationCount = 1;
  const confidenceLabel =
    source.is_first_party && corroborationCount >= 2
      ? "high_confidence"
      : source.is_first_party
      ? "moderate_confidence"
      : "low_confidence";

  const { data: signal } = await supabase
    .from("signals")
    .insert({
      normalized_document_id: normalized.id,
      raw_document_id: rawDocument.id,
      source_id: source.id,
      company_id: company.id,
      category: "ai_integration",
      subcategory: "product_launch",
      headline: "UiPath launches autonomous testing agents, doubles AI hiring",
      description:
        "Official announcement of agentic automation GA plus a confirmed AI " +
        "engineering headcount commitment for the next two quarters.",
      evidence_excerpt: doc.content.slice(0, 180) + "…",
      entity_match_confidence: 0.95,
      extraction_confidence: 0.9,
      corroboration_count: corroborationCount,
      magnitude: "major",
      strategic_relevance: "high",
      confidence_label: confidenceLabel,
      occurred_at: new Date().toISOString(),
      requires_review: confidenceLabel === "low_confidence",
    })
    .select()
    .single();

  console.log(`[3/5] Signal extracted (${confidenceLabel}): ${signal.id}`);

  // --- Step 4: Company timeline ------------------------------------------
  await supabase.from("company_timeline_events").insert({
    company_id: company.id,
    event_type: "signal",
    title: signal.headline,
    description: signal.description,
    related_signal_id: signal.id,
    occurred_at: signal.occurred_at,
  });

  console.log(`[4/5] Company timeline updated for ${company.name}`);

  // --- Step 5: Action-oriented alert (major + high relevance) -------------
  if (signal.magnitude === "major" && signal.strategic_relevance === "high") {
    const { data: alert } = await supabase
      .from("alerts")
      .insert({
        company_id: company.id,
        signal_id: signal.id,
        level: "strategic",
        title: `${company.name}: agentic AI product launch + hiring surge`,
        what_changed: signal.headline,
        why_it_matters:
          "Signals a shift from AI-assisted to AI-first automation and a " +
          "material investment in AI engineering capacity — a leading " +
          "indicator of accelerating AI maturity and competitive pressure " +
          "on adjacent automation vendors.",
        who_is_affected: "Competing automation and RPA vendors; enterprise buyers evaluating agentic platforms.",
        possible_consequence:
          "Faster displacement of manual QA/testing roles among UiPath customers; increased AI engineering wage competition.",
        suggested_follow_up:
          "Compare AI hiring velocity across peer automation vendors and monitor customer adoption signals over the next two reporting periods.",
        confidence_label: confidenceLabel,
      })
      .select()
      .single();

    console.log(`[5/5] Alert created: ${alert.id}`);
  } else {
    console.log("[5/5] No alert threshold met — signal logged only.");
  }

  console.log("\nEvidence chain complete:");
  console.log(
    `  source(${source.id}) -> raw_document(${rawDocument.id}) -> normalized_document(${normalized.id}) -> signal(${signal.id})`
  );
}

async function getOrCreateCompany(name: string) {
  const { data: existing } = await supabase
    .from("companies")
    .select("id, name")
    .eq("name", name)
    .maybeSingle();
  if (existing) return existing;

  const { data } = await supabase
    .from("companies")
    .insert({ name })
    .select()
    .single();
  return data;
}

async function getOrCreateSource() {
  const { data: existing } = await supabase
    .from("sources")
    .select("*")
    .eq("name", "UiPath Newsroom")
    .maybeSingle();
  if (existing) return existing;

  const { data } = await supabase
    .from("sources")
    .insert({
      name: "UiPath Newsroom",
      base_url: "https://www.uipath.com/newsroom",
      source_type: "official_release_notes",
      is_first_party: true,
      independence_score: 0.3, // first-party, so lower independence
      authority_score: 0.95,
      historical_accuracy_score: 0.9,
      promotional_bias_score: 0.4,
    })
    .select()
    .single();
  return data;
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
