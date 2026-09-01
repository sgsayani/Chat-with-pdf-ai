"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  docName: string;
  onConfirm: () => void;
}

/** Confirms an irreversible document removal (Pinecone vectors + local
 * metadata + chat history all go with it) before it happens. */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  docName,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove this document?</DialogTitle>
          <DialogDescription>
            &ldquo;{docName}&rdquo; and its chat history will be removed from this
            device. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Remove document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
