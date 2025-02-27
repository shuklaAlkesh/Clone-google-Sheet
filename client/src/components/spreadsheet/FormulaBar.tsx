import { Input } from "@/components/ui/input";

interface FormulaBarProps {
  value: string;
  onChange: (value: string) => void;
  selectedCell: string;
}

export function FormulaBar({ value, onChange, selectedCell }: FormulaBarProps) {
  return (
    <div className="p-2 border-b flex items-center gap-2">
      <div className="w-20 text-sm text-muted-foreground">
        {selectedCell}
      </div>
      <div className="flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter a value or formula (e.g. =SUM(A1:A5))"
        />
      </div>
    </div>
  );
}
