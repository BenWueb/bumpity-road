import { ReactNode } from "react";

interface ToggleOption {
  value: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ToggleGroup({
  options,
  value,
  onChange,
  className = "",
}: ToggleGroupProps) {
  return (
    <div className={`flex flex-1 items-center gap-1 rounded-lg bg-muted p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {option.icon}
          <span>{option.label}</span>
          {option.badge}
        </button>
      ))}
    </div>
  );
}
