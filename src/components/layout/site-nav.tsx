import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-6 py-4 md:px-10">
      <Link href="/" className="text-xl font-extrabold tracking-tight text-foreground">
        N<span className="text-[#5b8cff]">I</span>NA
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/onboarding" className="text-muted-foreground hover:text-foreground">
          Get started
        </Link>
        <a
          href="https://docs.nina.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground"
        >
          Docs
        </a>
      </div>
    </nav>
  );
}
