import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useFloorTables,
  useCreateFloorTable,
  useUpdateFloorTable,
  useDeleteFloorTable,
  FloorTable,
} from "@/hooks/useFloorTables";
import { useIsManager } from "@/hooks/useUserRole";
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TableManagementDialog({ open, onOpenChange }: TableManagementDialogProps) {
  const { data: tables = [], isLoading } = useFloorTables();
  const createTable = useCreateFloorTable();
  const updateTable = useUpdateFloorTable();
  const deleteTable = useDeleteFloorTable();
  const { isManager } = useIsManager();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ table_number: 0, seats: 0 });
  const [isAdding, setIsAdding] = useState(false);
  const [newTable, setNewTable] = useState({ table_number: "", seats: "4" });

  const handleStartEdit = (table: FloorTable) => {
    setEditingId(table.id);
    setEditValues({ table_number: table.table_number, seats: table.seats });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({ table_number: 0, seats: 0 });
  };

  const handleSaveEdit = async () => {
    if (editingId && editValues.seats > 0 && editValues.table_number > 0) {
      await updateTable.mutateAsync({
        id: editingId,
        seats: editValues.seats,
        table_number: editValues.table_number,
      });
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTable.mutateAsync(id);
  };

  const handleAddTable = async () => {
    const tableNum = parseInt(newTable.table_number);
    const seats = parseInt(newTable.seats);
    
    if (tableNum > 0 && seats > 0) {
      await createTable.mutateAsync({ table_number: tableNum, seats });
      setNewTable({ table_number: "", seats: "4" });
      setIsAdding(false);
    }
  };

  const getNextTableNumber = () => {
    if (tables.length === 0) return 1;
    const maxNum = Math.max(...tables.map((t) => t.table_number));
    return maxNum + 1;
  };

  const handleStartAdd = () => {
    setNewTable({ table_number: getNextTableNumber().toString(), seats: "4" });
    setIsAdding(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Manage Floor Tables</DialogTitle>
          <DialogDescription>
            {isManager 
              ? "Add, edit, or remove tables from your floor plan. Set the number of seats for each table."
              : "View floor plan tables. Contact a manager to add or remove tables."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Table #</TableHead>
                  <TableHead className="w-[120px]">Seats</TableHead>
                  <TableHead>Status</TableHead>
                  {isManager && <TableHead className="text-right w-[120px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => (
                  <TableRow key={table.id}>
                    <TableCell>
                      {editingId === table.id ? (
                        <Input
                          type="number"
                          min={1}
                          value={editValues.table_number}
                          onChange={(e) =>
                            setEditValues({ ...editValues, table_number: parseInt(e.target.value) || 0 })
                          }
                          className="w-20 h-8"
                        />
                      ) : (
                        <span className="font-medium">T{table.table_number}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === table.id ? (
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={editValues.seats}
                          onChange={(e) =>
                            setEditValues({ ...editValues, seats: parseInt(e.target.value) || 0 })
                          }
                          className="w-20 h-8"
                        />
                      ) : (
                        <span>{table.seats} seats</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize",
                          table.status === "available" && "bg-success/20 text-success",
                          table.status === "occupied" && "bg-destructive/20 text-destructive",
                          table.status === "reserved" && "bg-warning/20 text-warning",
                          table.status === "cleaning" && "bg-muted text-muted-foreground"
                        )}
                      >
                        {table.status}
                      </span>
                    </TableCell>
                    {isManager && (
                      <TableCell className="text-right">
                        {editingId === table.id ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-success hover:text-success"
                              onClick={handleSaveEdit}
                              disabled={updateTable.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleStartEdit(table)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(table.id)}
                              disabled={deleteTable.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}

                {/* Add new table row - only for managers */}
                {isAdding && isManager && (
                  <TableRow>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Table #"
                        value={newTable.table_number}
                        onChange={(e) => setNewTable({ ...newTable, table_number: e.target.value })}
                        className="w-20 h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        placeholder="Seats"
                        value={newTable.seats}
                        onChange={(e) => setNewTable({ ...newTable, seats: e.target.value })}
                        className="w-20 h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">Will be available</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-success hover:text-success"
                          onClick={handleAddTable}
                          disabled={createTable.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setIsAdding(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          {isManager ? (
            <Button
              variant="outline"
              onClick={handleStartAdd}
              disabled={isAdding}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Table
            </Button>
          ) : (
            <div />
          )}
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
