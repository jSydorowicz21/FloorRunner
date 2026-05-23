import * as React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: React.ReactElement;
  message: string;
  description?: string;
  cta?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, message, description, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
      <div className="text-muted-foreground opacity-40">{React.cloneElement(icon, { size: 48 })}</div>
      <div>
        <p className="text-sm font-medium text-foreground">{message}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground max-w-xs">{description}</p>}
      </div>
      {cta && (
        <Button variant="secondary" size="sm" onClick={cta.onClick}>
          {cta.label}
        </Button>
      )}
    </div>
  );
}
