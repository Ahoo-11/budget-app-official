import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";
import { ThemeSelector } from "./settings/ThemeSelector";
import { CategoryManager } from "./settings/CategoryManager";

export function AccountSettings() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <ThemeSelector />
          <CategoryManager />
        </div>
      </DialogContent>
    </Dialog>
  );
}