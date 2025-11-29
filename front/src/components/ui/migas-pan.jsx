import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const MigasPan = React.forwardRef(({ ...props }, ref) => <nav ref={ref} aria-label="migas de pan" {...props} />);
MigasPan.displayName = "MigasPan";

const ListaMigasPan = React.forwardRef(({ className, ...props }, ref) => (<ol ref={ref} className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5", className)} {...props} />));
ListaMigasPan.displayName = "ListaMigasPan";

const ElementoMigasPan = React.forwardRef(({ className, ...props }, ref) => (<li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />));
ElementoMigasPan.displayName = "ElementoMigasPan";

const EnlaceMigasPan = React.forwardRef(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  return <Comp ref={ref} className={cn("transition-colors hover:text-foreground", className)} {...props} />;
});
EnlaceMigasPan.displayName = "EnlaceMigasPan";

const PaginaMigasPan = React.forwardRef(({ className, ...props }, ref) => (<span ref={ref} role="link" aria-disabled="true" aria-current="page" className={cn("font-normal text-foreground", className)} {...props} />));
PaginaMigasPan.displayName = "PaginaMigasPan";

const SeparadorMigasPan = ({ children, className, ...props }) => (<li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>
  {children ?? <ChevronRight />}
</li>);
SeparadorMigasPan.displayName = "SeparadorMigasPan";

const ElipsisMigasPan = ({ className, ...props }) => (<span role="presentation" aria-hidden="true" className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
  <MoreHorizontal className="h-4 w-4" />
  <span className="sr-only">Más</span>
</span>);
ElipsisMigasPan.displayName = "ElipsisMigasPan";

export { MigasPan, ListaMigasPan, ElementoMigasPan, EnlaceMigasPan, PaginaMigasPan, SeparadorMigasPan, ElipsisMigasPan };
