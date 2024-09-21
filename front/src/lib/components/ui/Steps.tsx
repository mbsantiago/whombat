import classNames from "classnames";
import type { FC } from "react";

export function Step({
  Icon,
  title,
  description,
  active = false,
  disabled = false,
}: {
  Icon: FC<{ className?: string }>;
  title: string;
  description: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <li className="mb-10 ml-6">
      <span
        className={classNames(
          "absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-2 ring-stone-100 dark:ring-stone-900",
          {
            "bg-amber-200 dark:bg-amber-700": active,
            "bg-stone-200 dark:bg-stone-600": disabled,
            "bg-emerald-200 dark:bg-emerald-700": !active && !disabled,
          },
        )}
      >
        <Icon
          className={classNames("w-5 h-5", {
            "text-emerald-500 dark:text-emerald-400": !active,
            "text-amber-500 dark:text-amber-400": active,
            "text-stone-400 dark:text-stone-900": disabled,
          })}
          aria-hidden="true"
        />
      </span>
      <h3
        className={classNames("font-medium leading-tight", {
          "text-amber-700 dark:text-amber-400": active,
        })}
      >
        {title}
      </h3>
      <p className="text-sm">{description}</p>
    </li>
  );
}

export default function Stepper({
  steps,
  activeStep,
}: {
  steps: {
    title: string;
    description: string;
    icon: FC<{ className?: string }>;
  }[];
  activeStep: number;
}) {
  return (
    <div className="pl-5 pt-1">
      <ol className="relative text-stone-500 border-l border-stone-200 dark:border-stone-700 dark:text-stone-400">
        {steps.map((step, index) => (
          <Step
            key={step.title}
            Icon={step.icon}
            title={step.title}
            description={step.description}
            active={index === activeStep}
            disabled={index > activeStep}
          />
        ))}
      </ol>
    </div>
  );
}
