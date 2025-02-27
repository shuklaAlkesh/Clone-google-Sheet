import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formulaHelpers } from "@/lib/formulas";
import { type FC } from "react";

interface FormulaHelperProps {
  onFormulaSelect: (formula: string) => void;
}

// Group formulas by category for better organization
const formulaCategories = {
  "Math Functions": ["SUM", "AVERAGE", "MAX", "MIN", "COUNT"],
  "Text Functions": ["TRIM", "UPPER", "LOWER", "FIND_AND_REPLACE"],
  "Data Quality": ["REMOVE_DUPLICATES", "IS_NUMBER", "IS_DATE"],
};

export const FormulaHelper: FC<FormulaHelperProps> = ({ onFormulaSelect }) => {
  return (
    <div className="w-72 border-l bg-muted/30 p-4 overflow-y-auto">
      <h3 className="mb-4 text-lg font-semibold">Formula Helper</h3>
      <div className="text-sm text-muted-foreground mb-4">
        Click on any example to try it in the selected cell
      </div>
      <Accordion type="single" collapsible className="w-full">
        {Object.entries(formulaCategories).map(([category, formulas]) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger className="text-sm font-medium">
              {category}
            </AccordionTrigger>
            <AccordionContent>
              {formulas.map((name) => {
                const formula = formulaHelpers[name];
                return (
                  <div key={name} className="mb-4 last:mb-0">
                    <h4 className="text-sm font-medium mb-1">{name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {formula.description}
                    </p>
                    <button
                      className="text-sm text-primary hover:text-primary/80 underline"
                      onClick={() => onFormulaSelect(formula.example)}
                    >
                      Try: {formula.example}
                    </button>
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};