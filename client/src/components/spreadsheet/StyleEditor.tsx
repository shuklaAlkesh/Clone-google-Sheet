
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { CellStyle } from "@shared/schema";

interface StyleEditorProps {
  onChange: (style: Partial<CellStyle>) => void;
}

export function StyleEditor({ onChange }: StyleEditorProps) {
  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange({ fontWeight: "bold" })}
      >
        <Bold className="h-4 w-4"
      />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange({ fontStyle: "italic" })}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange({ textDecoration: "underline" })}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange({ textAlign: "left" })}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange({ textAlign: "center" })}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange({ textAlign: "right" })}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
