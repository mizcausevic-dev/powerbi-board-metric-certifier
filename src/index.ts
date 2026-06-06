import { readFile } from "node:fs/promises";

export type CertificationTier = "CERTIFIED" | "WATCH" | "REVIEW" | "BLOCKED";

export interface BoardMetric {
  name: string;
  owner: string;
  audience: string;
  dashboard: string;
  businessCriticality: number;
  lineageCompleteness: number;
  refreshSuccessRate: number;
  reconciliationCoverage: number;
  definitionClarity: number;
  ownerSignoffAgeDays: number;
  varianceFromSource: number;
  downstreamDashboardCount: number;
  narrative: string;
  nextAction: string;
}

export interface MetricInput {
  generatedAt: string;
  organization: string;
  metrics: BoardMetric[];
}

export interface CertifiedMetric extends BoardMetric {
  trustScore: number;
  riskScore: number;
  tier: CertificationTier;
  route: string;
}

export interface MetricCertification {
  generatedAt: string;
  organization: string;
  metrics: CertifiedMetric[];
  summary: {
    metricCount: number;
    certifiedCount: number;
    blockedCount: number;
    lowestTrustMetric: string;
    meanTrustScore: number;
    primaryRecommendation: string;
  };
}

const clamp = (value: number, min = 0, max = 100): number => Math.min(max, Math.max(min, value));

export function classifyTier(trustScore: number): CertificationTier {
  if (trustScore >= 82) return "CERTIFIED";
  if (trustScore >= 68) return "WATCH";
  if (trustScore >= 50) return "REVIEW";
  return "BLOCKED";
}

export function certifyMetric(metric: BoardMetric): CertifiedMetric {
  const signoffFreshness = 100 - clamp(metric.ownerSignoffAgeDays * 2);
  const variancePenalty = clamp(metric.varianceFromSource * 8);
  const blastRadiusPenalty = clamp(metric.downstreamDashboardCount * 2);
  const trustScore = Math.round(
    clamp(
      metric.lineageCompleteness * 0.2 +
        metric.refreshSuccessRate * 0.16 +
        metric.reconciliationCoverage * 0.2 +
        metric.definitionClarity * 0.16 +
        signoffFreshness * 0.12 +
        (100 - variancePenalty) * 0.1 +
        (100 - blastRadiusPenalty) * 0.03 +
        metric.businessCriticality * 0.03
    )
  );
  const riskScore = 100 - trustScore;
  const tier = classifyTier(trustScore);
  const route =
    tier === "BLOCKED"
      ? "Block board use until source reconciliation, lineage, and owner signoff are restored."
      : tier === "REVIEW"
        ? "Route to metric review with owner signoff, source variance, and refresh evidence attached."
        : tier === "WATCH"
          ? "Keep certified with watch conditions and refresh evidence before each board cycle."
          : "Certified for board use with current owner signoff and evidence.";

  return { ...metric, trustScore, riskScore, tier, route };
}

export function buildCertification(input: MetricInput): MetricCertification {
  const metrics = input.metrics.map(certifyMetric).sort((a, b) => a.trustScore - b.trustScore);
  const meanTrustScore = Math.round(metrics.reduce((sum, metric) => sum + metric.trustScore, 0) / Math.max(metrics.length, 1));
  const lowestTrustMetric = metrics[0]?.name ?? "No metrics";
  const certifiedCount = metrics.filter((metric) => metric.tier === "CERTIFIED").length;
  const blockedCount = metrics.filter((metric) => metric.tier === "BLOCKED").length;

  return {
    generatedAt: input.generatedAt,
    organization: input.organization,
    metrics,
    summary: {
      metricCount: metrics.length,
      certifiedCount,
      blockedCount,
      lowestTrustMetric,
      meanTrustScore,
      primaryRecommendation: `Fix ${lowestTrustMetric} first; it has the weakest certification posture for board use.`
    }
  };
}

export async function loadCertification(path: string): Promise<MetricCertification> {
  return buildCertification(JSON.parse(await readFile(path, "utf8")) as MetricInput);
}

export function renderMarkdown(certification: MetricCertification): string {
  const rows = certification.metrics
    .map((metric) => `| ${metric.name} | ${metric.tier} | ${metric.trustScore} | ${metric.dashboard} | ${metric.lineageCompleteness}% | ${metric.reconciliationCoverage}% | ${metric.nextAction} |`)
    .join("\n");

  return [
    "# Power BI Board Metric Certifier",
    "",
    `Organization: ${certification.organization}`,
    "",
    `Primary recommendation: ${certification.summary.primaryRecommendation}`,
    "",
    "| Metric | Tier | Trust score | Dashboard | Lineage | Reconciliation | Next action |",
    "| --- | --- | ---: | --- | ---: | ---: | --- |",
    rows
  ].join("\n");
}
