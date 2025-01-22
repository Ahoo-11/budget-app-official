import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

const Grid = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid", className)}
    {...props}
  />
));
Grid.displayName = "Grid";

export { Grid };
