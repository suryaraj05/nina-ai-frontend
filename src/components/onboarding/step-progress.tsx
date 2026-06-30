import { cn } from "@/lib/utils";



const STEPS = [

  { id: 1, label: "General Information" },

  { id: 2, label: "AI Setup" },

  { id: 3, label: "Install" },

] as const;



type Props = {

  current: 1 | 2 | 3;

  variant?: "bar" | "circles";

};



export function StepProgress({ current, variant = "bar" }: Props) {

  if (variant === "circles") {

    const labels = ["Identity", "AI Setup", "Review"];

    return (

      <div className="flex items-center justify-center gap-0" aria-label="Onboarding progress">

        {labels.map((label, i) => {

          const stepNum = (i + 1) as 1 | 2 | 3;

          const done = current > stepNum;

          const active = current === stepNum;

          return (

            <div key={label} className="flex items-center">

              <div className="flex flex-col items-center gap-1">

                <span

                  className={cn(

                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",

                    done && "bg-accent text-success",

                    active && "bg-primary text-primary-foreground",

                    !done && !active && "bg-secondary text-muted-foreground",

                  )}

                >

                  {done ? "✓" : stepNum}

                </span>

                <span

                  className={cn(

                    "text-[10px] font-medium",

                    active ? "text-primary" : "text-muted-foreground",

                  )}

                >

                  {label}

                </span>

              </div>

              {i < labels.length - 1 ? (

                <div className={cn("mx-3 h-px w-8", done ? "bg-success" : "bg-border")} />

              ) : null}

            </div>

          );

        })}

      </div>

    );

  }



  return (

    <div className="space-y-2" aria-label="Onboarding progress">

      <div className="flex gap-2">

        {STEPS.map((step) => (

          <div

            key={step.id}

            className={cn(

              "h-2 flex-1 rounded-full transition-colors",

              current >= step.id ? "bg-primary" : "bg-[#e8e4dc]",

            )}

          />

        ))}

      </div>

    </div>

  );

}



export function StepProgressLabel({ current }: { current: 1 | 2 | 3 }) {

  const labels = ["General Information", "AI Setup", "Install Merchant SDK"];

  return (

    <p className="text-sm text-muted-foreground">

      Step {current} of 3: {labels[current - 1]}

    </p>

  );

}


