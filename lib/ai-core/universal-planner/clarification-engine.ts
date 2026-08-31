import type {
  ClarificationQuestion,
  RequirementAnalysisResult,
} from "@/lib/ai-core/universal-planner/types";

function q(
  id: string,
  question: string,
  why: string,
  expectedAnswerFormat: ClarificationQuestion["expectedAnswerFormat"],
  priority: ClarificationQuestion["priority"],
): ClarificationQuestion {
  return { id, question, why, expectedAnswerFormat, priority };
}

export function buildClarificationQuestions(
  analysis: RequirementAnalysisResult,
): ClarificationQuestion[] {
  const questions: ClarificationQuestion[] = [];

  if (analysis.missingRequirements.includes("target-service")) {
    questions.push(
      q(
        "target-service",
        "Which primary service should execute first (Website Builder, App Builder, Landing Page Builder, or another)?",
        "Routing to the wrong service causes invalid plans and wasted compute.",
        "choice",
        "high",
      ),
    );
  }

  if (analysis.missingRequirements.includes("data-entities")) {
    questions.push(
      q(
        "data-entities",
        "Which core entities must the system manage first (for example: products, leads, orders)?",
        "Database and API planning requires stable entity definitions.",
        "list",
        "high",
      ),
    );
  }

  if (!analysis.intent.constraints.length) {
    questions.push(
      q(
        "hard-constraints",
        "Do you have hard constraints on timeline, compliance, budget, or technology choices?",
        "Hard constraints affect architecture and service sequencing decisions.",
        "text",
        "medium",
      ),
    );
  }

  return questions;
}
