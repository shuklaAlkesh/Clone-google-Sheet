
import React from 'react';
import { Button } from "@/components/ui/button";
import { HelpCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { formulaHelpers } from "@/lib/formulas";

const formulaCategories = {
  "Math Functions": ["SUM", "AVERAGE", "MAX", "MIN", "COUNT"],
  "Text Functions": ["TRIM", "UPPER", "LOWER", "FIND_AND_REPLACE"],
  "Data Quality": ["REMOVE_DUPLICATES", "IS_NUMBER", "IS_DATE"],
};

export function Guide({ onFormulaSelect }: { onFormulaSelect?: (formula: string) => void }) {
  const guides = [
    {
      title: "Delete Row",
      description: "Select a row and click the delete button to remove it from the spreadsheet"
    },
    {
      title: "Format Cells",
      description: "Use the toolbar to apply bold, italic, or alignment to selected cells"
    },
    {
      title: "Formula Bar",
      description: "Enter formulas starting with '=' to perform calculations across cells"
    }
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-50">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Spreadsheet Guide</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-6">
          <div className="space-y-4">
            {guides.map((guide, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">{guide.title}</h3>
                <p className="text-sm text-muted-foreground">{guide.description}</p>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Formula Helper</h3>
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
                          {onFormulaSelect && (
                            <SheetClose asChild>
                              <button
                                className="text-sm text-primary hover:text-primary/80 underline"
                                onClick={() => onFormulaSelect(formula.example)}
                              >
                                Try: {formula.example}
                              </button>
                            </SheetClose>
                          )}
                        </div>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
