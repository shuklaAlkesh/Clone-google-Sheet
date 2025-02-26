import { useEffect, useState, type FC } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Grid } from "@/components/spreadsheet/Grid";
import { Toolbar } from "@/components/spreadsheet/Toolbar";
import { FormulaBar } from "@/components/spreadsheet/FormulaBar";
import { FormulaHelper } from "@/components/spreadsheet/FormulaHelper";
import { Cell, CellStyle, type Spreadsheet } from "@shared/schema";
import { getDefaultGrid, updateCellStyle } from "@/lib/spreadsheet";
import { evaluateFormula } from "@/lib/formulas";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const Home: FC = () => {
  const [selectedCell, setSelectedCell] = useState<string>("");

  const { data: spreadsheet, isLoading } = useQuery<Spreadsheet>({
    queryKey: ["/api/spreadsheet"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { address: string; value: string }) => {
      return apiRequest("POST", "/api/spreadsheet/cell", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spreadsheet"] });
    }
  });

  const dimensionsMutation = useMutation({
    mutationFn: async (data: { rowCount?: number; colCount?: number }) => {
      return apiRequest("POST", "/api/spreadsheet/dimensions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spreadsheet"] });
    }
  });

  const [gridData, setGridData] = useState<Record<string, Cell>>(
    getDefaultGrid(100, 26)
  );

  useEffect(() => {
    if (spreadsheet?.data) {
      setGridData(spreadsheet.data);
    }
  }, [spreadsheet]);

  function handleCellChange(address: string, value: string) {
    const newData = { ...gridData };

    if (value.startsWith('=')) {
      const result = evaluateFormula(value, (addr) => gridData[addr]);
      newData[address] = {
        value: result,
        formula: value,
        style: gridData[address]?.style
      };

      // Update dependent cells
      Object.entries(gridData).forEach(([addr, cell]) => {
        if (cell.formula && cell.formula.includes(address)) {
          const updatedResult = evaluateFormula(cell.formula, (a) => 
            a === address ? newData[address] : gridData[a]
          );
          newData[addr] = {
            ...cell,
            value: updatedResult
          };
        }
      });
    } else {
      newData[address] = {
        value,
        style: gridData[address]?.style
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
      value: newData[selectedCell].value || ""
    });
  }

  function handleFormulaSelect(formula: string) {
    if (selectedCell) {
      handleCellChange(selectedCell, formula);
    }
  }

  function handleAddRow() {
    if (!spreadsheet) return;
    dimensionsMutation.mutate({
      rowCount: spreadsheet.rowCount + 1
    });
  }

  function handleAddColumn() {
    if (!spreadsheet) return;
    dimensionsMutation.mutate({
      colCount: spreadsheet.colCount + 1
    });
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <Toolbar onStyleChange={handleStyleChange} onAddRow={handleAddRow} onAddColumn={handleAddColumn}/>
      <FormulaBar
        value={gridData[selectedCell]?.formula || gridData[selectedCell]?.value || ""}
        onChange={(value) => handleCellChange(selectedCell, value)}
        selectedCell={selectedCell}
      />
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1">
          <Grid
            data={gridData}
            rowCount={spreadsheet?.rowCount || 100}
            colCount={spreadsheet?.colCount || 26}
            onCellChange={handleCellChange}
            onCellSelect={setSelectedCell}
          />
        </div>
        <FormulaHelper onFormulaSelect={handleFormulaSelect} />
      </div>
    </div>
  );
};

export default Home;