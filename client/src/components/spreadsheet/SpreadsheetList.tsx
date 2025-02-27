
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Spreadsheet } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function SpreadsheetList() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const { data: spreadsheets, isLoading, error } = useQuery<Spreadsheet[]>({
    queryKey: ["/api/spreadsheets"],
    retry: false,
  });

  const [newSpreadsheetName, setNewSpreadsheetName] = useState("Untitled Spreadsheet");
  const [showNameDialog, setShowNameDialog] = useState(false);

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/spreadsheets", { name: newSpreadsheetName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spreadsheets"] });
      toast({
        title: "Success",
        description: "New spreadsheet created",
      });
      setShowNameDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create spreadsheet",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center text-red-500">
          Failed to load spreadsheets. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Spreadsheets</h1>
        <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
          <DialogTrigger asChild>
            <Button disabled={createMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              New Spreadsheet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Spreadsheet</DialogTitle>
            </DialogHeader>
            <Input
              value={newSpreadsheetName}
              onChange={(e) => setNewSpreadsheetName(e.target.value)}
              placeholder="Enter spreadsheet name"
            />
            <DialogFooter>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Spreadsheet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {spreadsheets?.map(sheet => (
          <div
            key={sheet.id}
            className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/spreadsheet/${sheet.id}`)}
          >
            <h2 className="font-medium">{sheet.name}</h2>
            <p className="text-sm text-muted-foreground">
              {sheet.rowCount} rows × {sheet.colCount} columns
            </p>
          </div>
        ))}

        {spreadsheets?.length === 0 && (
          <div className="text-center text-muted-foreground p-8">
            No spreadsheets yet. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
}
