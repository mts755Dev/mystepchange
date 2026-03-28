"use client";

import type { CandidateStatus } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Clock } from "lucide-react";

const STEPS: { key: CandidateStatus; label: string; labelDe: string }[] = [
  { key: "in_review", label: "Under Review", labelDe: "In Prüfung" },
  { key: "active", label: "Active", labelDe: "Aktiv" },
  { key: "matched", label: "Matched", labelDe: "Zugeordnet" },
  { key: "interview", label: "Interview", labelDe: "Gespräch" },
  { key: "placed", label: "Placed", labelDe: "Vermittelt" },
];

const STATUS_ORDER: CandidateStatus[] = ["in_review", "active", "matched", "interview", "placed"];

interface StatusStepperProps {
  status: CandidateStatus;
  locale?: string;
}

export function StatusStepper({ status, locale = "en" }: StatusStepperProps) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-4 left-4 h-0.5 bg-blue-600 z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isPending = i > currentIndex;
          const label = locale === "de" ? step.labelDe : step.label;

          return (
            <div key={step.key} className="flex flex-col items-center z-10">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white transition-all",
                  isDone && "border-blue-600 bg-blue-600",
                  isCurrent && "border-blue-600 bg-white ring-4 ring-blue-100",
                  isPending && "border-gray-300 bg-white"
                )}
              >
                {isDone ? (
                  <CheckCircle className="w-4 h-4 text-white fill-white" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 text-blue-600" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300" />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[60px]",
                  isDone && "text-blue-600",
                  isCurrent && "text-blue-700 font-semibold",
                  isPending && "text-gray-400"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
