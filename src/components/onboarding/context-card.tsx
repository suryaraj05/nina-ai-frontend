import { Info } from "lucide-react";

import { cn } from "@/lib/utils";



type Props = {

  title?: string;

  what: React.ReactNode;

  next?: string;

  variant?: "tip" | "info" | "help";

  className?: string;

};



export function ContextCard({

  title = "Pro tip",

  what,

  next,

  variant = "tip",

  className,

}: Props) {

  if (variant === "help") {

    return (

      <div

        className={cn(

          "rounded-2xl border border-[#f0d4c8] bg-[#fdf0eb] px-4 py-3 text-sm text-[#6b4a3a]",

          className,

        )}

      >

        <p className="font-semibold text-[#a35841]">Need help?</p>

        <p className="mt-1">{what}</p>

        {next ? (

          <p className="mt-2 font-medium text-primary underline underline-offset-2">{next}</p>

        ) : null}

      </div>

    );

  }



  if (variant === "info") {

    return (

      <div

        className={cn(

          "flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft",

          className,

        )}

      >

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">

          <Info className="h-5 w-5" aria-hidden />

        </div>

        <div className="space-y-1 text-sm">

          <p className="font-semibold text-foreground">{title}</p>

          <div className="text-muted-foreground">{what}</div>

        </div>

      </div>

    );

  }



  return (

    <div

      className={cn(

        "rounded-2xl border border-border bg-[#eef5f3] px-4 py-3.5",

        className,

      )}

    >

      <div className="mb-2 flex items-center gap-2">
        <Info className="h-4 w-4 text-primary" aria-hidden />
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
          {title}
        </span>
      </div>
      <div className="text-sm leading-relaxed text-muted-foreground">{what}</div>

      {next ? (

        <p className="mt-2 text-sm text-muted-foreground">

          <span className="font-semibold text-foreground">Next: </span>

          {next}

        </p>

      ) : null}

    </div>

  );

}


