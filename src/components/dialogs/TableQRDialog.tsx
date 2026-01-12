import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink, QrCode } from "lucide-react";
import { toast } from "sonner";

interface TableQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableNumber: number;
}

export function TableQRDialog({ open, onOpenChange, tableNumber }: TableQRDialogProps) {
  const [qrUrl, setQrUrl] = useState("");
  const orderUrl = `${window.location.origin}/order/${tableNumber}`;
  
  useEffect(() => {
    // Generate QR code using a free API
    const encodedUrl = encodeURIComponent(orderUrl);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`);
  }, [orderUrl]);

  const copyLink = () => {
    navigator.clipboard.writeText(orderUrl);
    toast.success("Link copied to clipboard!");
  };

  const openInNewTab = () => {
    window.open(orderUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Table {tableNumber} QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <img 
              src={qrUrl} 
              alt={`QR code for Table ${tableNumber}`}
              className="w-[200px] h-[200px]"
            />
          </div>

          {/* Order URL */}
          <div className="space-y-2">
            <Label>Customer Order Link</Label>
            <div className="flex gap-2">
              <Input 
                value={orderUrl} 
                readOnly 
                className="text-sm"
              />
              <Button variant="outline" size="icon" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={openInNewTab}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Customers can scan this QR code to place orders directly from their table.
          </p>

          {/* Print Button */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={() => window.print()}>
              Print QR Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}