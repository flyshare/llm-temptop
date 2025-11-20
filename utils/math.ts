import { TokenCandidate, ProcessedCandidate } from '../types';

export const processCandidates = (
  candidates: TokenCandidate[],
  temperature: number,
  topK: number,
  topP: number
): ProcessedCandidate[] => {
  // 1. Apply Temperature
  // P_i' = (P_i ^ (1/T)) / Sum(P_j ^ (1/T))
  // Note: We treat baseProb as P_i directly. In real logits, it's exp(logit/T).
  // Mathematically equivalent if we start from probs: new_p ~ old_p^(1/T)
  
  let adjustedCandidates = candidates.map(c => {
    // Protect against division by zero or extreme values
    const t = Math.max(temperature, 0.01);
    const adjustedWeight = Math.pow(c.baseProb, 1 / t);
    return { ...c, weight: adjustedWeight };
  });

  const sumWeights = adjustedCandidates.reduce((acc, c) => acc + c.weight, 0);

  let processed: ProcessedCandidate[] = adjustedCandidates.map(c => ({
    ...c,
    baseProb: c.baseProb,
    adjustedProb: c.weight / sumWeights, // Renormalized after temp
    normalizedProb: 0, // Placeholder
    cumulativeProb: 0, // Placeholder
    isKeptByTopK: false,
    isKeptByTopP: false,
    finalProb: 0
  }));

  // 2. Sort by Adjusted Probability (Desc)
  processed.sort((a, b) => b.adjustedProb - a.adjustedProb);

  // 3. Calculate Cumulative Prob & Apply Filters
  let currentSum = 0;
  processed = processed.map((c, index) => {
    currentSum += c.adjustedProb;
    
    // Top-K Logic: Keep if index < K
    const isKeptByTopK = index < topK;

    // Top-P Logic: Keep if cumulative sum of *previous* items < P
    // (Nucleus sampling usually includes the item that crosses the threshold)
    const prevSum = currentSum - c.adjustedProb;
    const isKeptByTopP = prevSum < topP;

    return {
      ...c,
      cumulativeProb: currentSum,
      isKeptByTopK,
      isKeptByTopP,
    };
  });

  // 4. Determine Final Eligibility
  // Must satisfy BOTH Top-K and Top-P constraints
  const validCandidates = processed.filter(c => c.isKeptByTopK && c.isKeptByTopP);
  const sumValidProb = validCandidates.reduce((acc, c) => acc + c.adjustedProb, 0);

  // 5. Final Renormalization for Sampling
  // If no candidates are valid (rare edge case with extreme P), keep top 1.
  if (validCandidates.length === 0 && processed.length > 0) {
      processed[0].finalProb = 1;
  } else {
      processed = processed.map(c => {
          if (c.isKeptByTopK && c.isKeptByTopP) {
              return { ...c, finalProb: c.adjustedProb / sumValidProb };
          }
          return { ...c, finalProb: 0 };
      });
  }
  
  return processed;
};

export const sampleToken = (candidates: ProcessedCandidate[]): string => {
  const r = Math.random();
  let acc = 0;
  // Use the candidates array which is already sorted by probability
  for (const c of candidates) {
    if (c.finalProb > 0) {
      acc += c.finalProb;
      if (r <= acc) return c.token;
    }
  }
  // Fallback
  return candidates.find(c => c.finalProb > 0)?.token || "";
};
