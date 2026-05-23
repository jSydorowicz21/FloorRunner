"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md mx-4 rounded-xl border border-border bg-surface shadow-lg"
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 p-5 pb-4">
            <div>
              {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
              {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5 pt-0">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 p-5 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
