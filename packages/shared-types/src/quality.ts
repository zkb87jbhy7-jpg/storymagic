// ─── Quality Pipeline Types ─── matches Chapter 6 Quality Control Layers

export type QualityIssueSeverity = 'critical' | 'major' | 'minor';

export type QualityIssueCategory =
  | 'safety'
  | 'age_appropriateness'
  | 'narrative_coherence'
  | 'name_consistency'
  | 'pronoun_consistency'
  | 'cultural_sensitivity'
  | 'technical'
  | 'likeness'
  | 'consistency'
  | 'anomaly';

export interface QualityIssue {
  severity: QualityIssueSeverity;
  category: QualityIssueCategory;
  description: string;
  recommendation: string;
  page_number?: number;
}

/**
 * Layer L-01: SafetyGate runs on every generated text.
 * Blocklist of 500+ words/phrases (Hebrew + English), regex pattern detection,
 * secondary AI check. Zero tolerance: high-risk results in absolute blocking.
 */
export interface SafetyGateResult {
  passed: boolean;
  risk_level: 'none' | 'low' | 'medium' | 'high';
  blocked_terms: string[];
  pattern_matches: string[];
  ai_check_passed: boolean | null;
  issues: QualityIssue[];
}

/**
 * Layer L-02: TechnicalQualityGate runs on every illustration.
 * Checks min dimensions (1024x1024), aspect ratio, blur detection
 * (Laplacian variance), anomaly detection via vision API.
 */
export interface TechnicalQualityResult {
  passed: boolean;
  page_number: number;
  dimensions: { width: number; height: number };
  aspect_ratio_correct: boolean;
  blur_score: number;
  blur_passed: boolean;
  anomaly_check_passed: boolean;
  anomaly_description: string | null;
  issues: QualityIssue[];
}

/**
 * Layer L-03: ConsistencyGate runs on all book pages together.
 * Character description comparison, style keyword consistency,
 * color palette consistency, multi-reference face embedding check.
 */
export interface ConsistencyResult {
  passed: boolean;
  score: number;
  character_consistency: boolean;
  style_consistency: boolean;
  color_palette_consistency: boolean;
  multi_reference_check_passed: boolean;
  involved_pages: number[];
  issues: QualityIssue[];
}

/**
 * Layer L-04: LikenessGate verifies character resembles the child.
 * Cosine similarity against original face embedding. Threshold: 0.75.
 */
export interface LikenessResult {
  passed: boolean;
  page_number: number;
  cosine_similarity: number;
  threshold: number;
  needs_repair: boolean;
  issues: QualityIssue[];
}

/** Combined output of the full QualityPipeline (all four gates chained) */
export interface QualityPipelineResult {
  overall_passed: boolean;
  overall_score: number;
  safety_gate: SafetyGateResult;
  technical_quality: TechnicalQualityResult[];
  consistency: ConsistencyResult;
  likeness: LikenessResult[];
  pages_needing_repair: number[];
  pages_needing_regeneration: number[];
  issues: QualityIssue[];
}
