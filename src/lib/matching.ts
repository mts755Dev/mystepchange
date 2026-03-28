import type { CandidateProfile, JobListing, Match } from "@/types";

const GERMAN_LEVELS: Record<string, number> = {
  A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6, native: 7,
};

export function calculateMatchScore(candidate: CandidateProfile, job: JobListing): number {
  let score = 0;
  const maxScore = 100;

  // Profession match (40 points)
  if (
    candidate.profession.toLowerCase() === job.profession.toLowerCase() ||
    candidate.professionCategory === job.professionCategory
  ) {
    score += candidate.profession.toLowerCase() === job.profession.toLowerCase() ? 40 : 20;
  }

  // German level match (30 points)
  const candidateLevel = GERMAN_LEVELS[candidate.germanLevel] || 0;
  const requiredLevel = GERMAN_LEVELS[job.germanLevelRequired] || 0;
  if (candidateLevel >= requiredLevel) {
    const excess = candidateLevel - requiredLevel;
    score += Math.max(30 - excess * 3, 15);
  } else {
    score += Math.max(0, 15 - (requiredLevel - candidateLevel) * 5);
  }

  // Location match (20 points)
  if (
    candidate.desiredLocation.some(
      (loc) => loc.toLowerCase() === job.location.toLowerCase() || loc.toLowerCase() === "anywhere"
    )
  ) {
    score += 20;
  }

  // Experience relevance (10 points)
  if (candidate.yearsOfExperience >= 3) score += 10;
  else if (candidate.yearsOfExperience >= 1) score += 5;

  return Math.round((score / maxScore) * 100);
}

export function findMatches(candidate: CandidateProfile, jobs: JobListing[]): Match[] {
  return jobs
    .filter((j) => j.isActive)
    .map((job) => ({
      id: `match-${candidate.userId}-${job.id}`,
      candidateId: candidate.userId,
      jobId: job.id,
      score: calculateMatchScore(candidate, job),
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    }))
    .filter((m) => m.score >= 30)
    .sort((a, b) => b.score - a.score);
}

export function getTopMatches(candidate: CandidateProfile, jobs: JobListing[], limit = 5): Match[] {
  return findMatches(candidate, jobs).slice(0, limit);
}
