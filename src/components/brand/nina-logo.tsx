import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

export function NinaLogo({ className, href = "/", size = "md" }: Props) {
  const el = (
    <span
      className={cn(
        "font-serif font-bold tracking-tight text-primary",
        sizes[size],
        className,
      )}
    >
      NINA
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {el}
      </Link>
    );
  }

  return el;
}

export function OnboardingDeskHero({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl shadow-soft", className)}>
      <Image
        src="/images/onboarding-step1-hero.png"
        alt=""
        width={800}
        height={400}
        className="h-36 w-full object-cover object-[center_92%]"
        priority
      />
      <span className="absolute bottom-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground">
        EST. 2024
      </span>
    </div>
  );
}
