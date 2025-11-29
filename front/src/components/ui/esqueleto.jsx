import { cn } from "@/lib/utils";

function Esqueleto({ className, ...props }) {
    return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Esqueleto };
