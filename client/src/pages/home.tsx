import { useEffect, useState, type FC } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Grid } from "@/components/spreadsheet/Grid";
import { Toolbar } from "@/components/spreadsheet/Toolbar";
import { FormulaBar } from "@/components/spreadsheet/FormulaBar";
import { FormulaHelper } from "@/components/spreadsheet/FormulaHelper";
import { Guide } from "@/components/spreadsheet/Guide";
import { Cell, CellStyle, type Spreadsheet } from "@shared/schema";
import { getDefaultGrid, updateCellStyle } from "@/lib/spreadsheet";
import { evaluateFormula } from "@/lib/formulas";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useRoute, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Home: FC = () => {
  const [selectedCell, setSelectedCell] = useState<string>("");
  const [_, params] = useRoute<{ id: string }>("/spreadsheet/:id");
  const [location, navigate] = useLocation();
  const spreadsheetId = parseInt(params?.id || "1");
  const { toast } = useToast();

  const { data: spreadsheet, isLoading, error } = useQuery<Spreadsheet>({
    queryKey: [`/api/spreadsheet/${spreadsheetId}`],
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { address: string; value: string }) => {
      return apiRequest("POST", `/api/spreadsheet/${spreadsheetId}/cell`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/spreadsheet/${spreadsheetId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update cell. Please try again.",
        variant: "destructive"
      });
    }
  });

  const dimensionsMutation = useMutation({
    mutationFn: async (data: { rowCount?: number; colCount?: number }) => {
      return apiRequest("POST", `/api/spreadsheet/${spreadsheetId}/dimensions`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/spreadsheet/${spreadsheetId}`] });
    }
  });

  const deleteRowMutation = useMutation({
    mutationFn: async (rowIndex: number) => {
      return apiRequest("DELETE", `/api/spreadsheet/${spreadsheetId}/row/${rowIndex}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/spreadsheet/${spreadsheetId}`] });
      toast({
        title: "Success",
        description: "Row deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete row. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleDeleteRow = (rowIndex: number) => {
    if (!spreadsheet) return;
    deleteRowMutation.mutate(rowIndex);
  };

  const handleAddRow = () => {
    if (!spreadsheet) return;
    dimensionsMutation.mutate({ rowCount: spreadsheet.rowCount + 1 });
  };

  const [gridData, setGridData] = useState<Record<string, Cell>>(
    getDefaultGrid(100, 26)
  );

  useEffect(() => {
    if (spreadsheet?.data) {
      setGridData(spreadsheet.data);
    }
  }, [spreadsheet]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load spreadsheet. Redirecting to home page.",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [error, navigate]);

  function handleCellChange(address: string, value: string) {
    const newData = { ...gridData };

    if (value.startsWith("=")) {
      try {
        const result = evaluateFormula(value, (addr) => gridData[addr]);
        newData[address] = {
          value: result,
          formula: value,
          style: gridData[address]?.style,
        };

        // Update dependent cells
        Object.entries(gridData).forEach(([addr, cell]) => {
          if (cell.formula && cell.formula.includes(address)) {
            const updatedResult = evaluateFormula(cell.formula, (a) =>
              a === address ? newData[address] : gridData[a]
            );
            newData[addr] = {
              ...cell,
              value: updatedResult,
            };
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          toast({
            title: "Formula Error",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }
    } else {
      newData[address] = {
        value,
        style: gridData[address]?.style,
      };
    }

    setGridData(newData);
    updateMutation.mutate({ address, value });
  }

  function handleStyleChange(style: Partial<CellStyle>) {
    if (!selectedCell) return;

    const newData = { ...gridData };
    newData[selectedCell] = updateCellStyle(
      gridData[selectedCell] || { value: "" },
      style
    );

    setGridData(newData);
    updateMutation.mutate({
      address: selectedCell,
      value: newData[selectedCell].value || "",
    });
  }

  function handleFormulaSelect(formula: string) {
    if (selectedCell) {
      handleCellChange(selectedCell, formula);
    }
  }

  const handleSave = () => {
    // Implement save functionality here
    console.log("Save clicked");
  };

  const handleLoad = () => {
    // Implement load functionality here
    console.log("Load clicked");
  };

  const handleRename = () => {
    // Implement rename functionality here
    console.log("Rename clicked");
  };

  // Row and column manipulation removed

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!spreadsheet) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      <Guide onFormulaSelect={handleFormulaSelect} />
      <Toolbar
        onStyleChange={handleStyleChange}
        onDeleteRow={handleDeleteRow}
        selectedCell={selectedCell}
        onSave={handleSave}
        onLoad={handleLoad}
        onRename={handleRename}
      />
      <FormulaBar
        value={
          gridData[selectedCell]?.formula || gridData[selectedCell]?.value || ""
        }
        onChange={(value) => handleCellChange(selectedCell, value)}
        selectedCell={selectedCell}
      />
      <div className="flex-1 overflow-hidden">
        <Grid
          data={gridData}
          rowCount={spreadsheet.rowCount}
          colCount={spreadsheet.colCount}
          onCellChange={handleCellChange}
          onCellSelect={setSelectedCell}
          onDeleteRow={handleDeleteRow}
        />
      </div>
    </div>
  );
};

export default Home;
