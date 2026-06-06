import { describe, expect, it } from "vitest";
import sample from "../fixtures/powerbi-metric-sample.json" with { type: "json" };
import { buildCertification, certifyMetric, classifyTier, renderMarkdown } from "../src/index.js";

describe("power bi board metric certifier", () => {
  it("classifies certification tiers", () => {
    expect(classifyTier(90)).toBe("CERTIFIED");
    expect(classifyTier(72)).toBe("WATCH");
    expect(classifyTier(55)).toBe("REVIEW");
    expect(classifyTier(40)).toBe("BLOCKED");
  });

  it("certifies metrics from trust posture", () => {
    const metric = certifyMetric(sample.metrics[0]);
    expect(metric.trustScore).toBeLessThan(75);
    expect(metric.route).toContain("metric");
  });

  it("sorts weakest metrics first", () => {
    const certification = buildCertification(sample);
    expect(certification.summary.metricCount).toBe(4);
    expect(certification.metrics[0].trustScore).toBeLessThanOrEqual(certification.metrics[1].trustScore);
    expect(certification.summary.primaryRecommendation).toContain(certification.summary.lowestTrustMetric);
  });

  it("renders markdown output", () => {
    const markdown = renderMarkdown(buildCertification(sample));
    expect(markdown).toContain("| Metric | Tier | Trust score |");
    expect(markdown).toContain("Net revenue retention");
  });
});
