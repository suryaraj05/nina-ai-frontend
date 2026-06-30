import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NinaLogo } from "@/components/brand/nina-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4">
        <NinaLogo href="/" size="lg" />
        <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Dashboard
        </Link>
      </header>
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Conversational AI for <span className="text-primary">any store</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          NINA maps shopper chat onto your APIs — search, cart, checkout — with one script tag.
        </p>
        <Link
          href="/onboarding"
          className={cn(buttonVariants({ size: "lg" }), "mt-10 h-12 rounded-full px-8 text-base")}
        >
          Get started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </main>
    </div>
  );
}
