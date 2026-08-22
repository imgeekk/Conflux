"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  UsersThreeIcon,
  ChartLineUpIcon,
  CheckCircleIcon,
  GithubLogoIcon,
  LightningIcon,
  DatabaseIcon,
  BrainIcon,
  ShieldIcon,
  FileIcon,
  FolderIcon,
  ClockIcon,
  QuestionMarkIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ─── data ─────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "https://github.com", label: "GitHub", external: true },
];

const PROBLEMS = [
  {
    title: "Knowledge lives in the wrong places",
    body: "Docs in Google Drive nobody can find. Answers in Slack threads that scroll away. Decisions in one person\u2019s head who just quit.",
  },
  {
    title: "Search returns documents, not answers",
    body: "You search \u201Cpayment retry logic\u201D and get eight documents to read. You wanted a two-sentence answer. You have a bug to fix.",
  },
  {
    title: "Nobody knows who knows what",
    body: "The new engineer asks the wrong person. The senior engineer gets interrupted for the fourteenth time this week. Same question, answered from scratch, again.",
  },
];


const STEPS = [
  {
    num: "01",
    title: "Write your team\u2019s knowledge",
    body: "Create spaces for Engineering, Product, Operations \u2014 whatever your team needs. Write documents in a clean editor. Tag them by topic.",
  },
  {
    num: "02",
    title: "Ask anything",
    body: "Search with a question, not keywords. Conflux embeds your query, finds the most relevant content using vector similarity search, and synthesises a grounded answer from your own documents.",
  },
  {
    num: "03",
    title: "Verify and improve",
    body: "Post questions your team asks repeatedly. The AI drafts answers. Teammates verify them. Verified answers enter the search index \u2014 the knowledge base gets smarter every time someone contributes.",
  },
  {
    num: "04",
    title: "Discover your experts",
    body: "Conflux scores every contribution silently. Who wrote the most about payments? Who\u2019s answered the most auth questions? The right person surfaces automatically when the AI isn\u2019t confident enough.",
  },
];

const TECH_CARDS = [
  {
    icon: DatabaseIcon,
    title: "pgvector semantic search",
    body: "Every document is chunked and embedded into PostgreSQL with pgvector. Cosine similarity retrieval \u2014 no separate vector database needed.",
  },
  {
    icon: BrainIcon,
    title: "Grounded RAG pipeline",
    body: "Retrieved chunks are passed to Gemini with a strict grounded-answer prompt. The AI only answers from your documents. No hallucination.",
  },
  {
    icon: ChartLineUpIcon,
    title: "Self-building knowledge graph",
    body: "Expert scores accumulate from writing, answering, and peer acceptance. The expertise map builds itself from behaviour \u2014 nobody fills in a profile.",
  },
  {
    icon: CheckCircleIcon,
    title: "Human-in-the-loop verification",
    body: "AI drafts answers. Humans verify them. Accepted answers re-enter the search index as a new embedded source \u2014 improving retrieval over time.",
  },
  {
    icon: ShieldIcon,
    title: "Workspace isolation",
    body: "Every team\u2019s data is fully isolated by workspace. Row-level access control enforced at the API layer on every query.",
  },
  {
    icon: GithubLogoIcon,
    title: "Open source",
    body: "Every line of code is on GitHub. No black boxes. Read it, fork it, deploy it yourself.",
  },
];

const USE_CASES = [
  {
    icon: LightningIcon,
    title: "Engineering teams",
    body: "Stop answering the same questions about the codebase. Runbooks, architecture decisions, and deployment guides \u2014 searchable and AI-answerable in seconds.",
  },
  {
    icon: BookOpenIcon,
    title: "Product teams",
    body: "Keep specs, decisions, and research findable. When someone asks \u201Cwhy did we build it this way\u201D, the answer is one search away \u2014 not buried in a two-year-old Notion page.",
  },
  {
    icon: UsersThreeIcon,
    title: "Onboarding new teammates",
    body: "New hire asks a question on day one. Conflux answers it from your team\u2019s own docs. They\u2019re productive faster. Your senior engineers stay in flow.",
  },
];

const STACK = ["Next.js", "PostgreSQL", "pgvector", "Gemini AI", "Prisma", "BetterAuth"];

const MOCK_DOCS = [
  { title: "Billing retry runbook", meta: "Engineering · Maya", date: "Aug 18" },
  { title: "Launch checklist", meta: "Product · Rohan", date: "Aug 16" },
  { title: "Auth architecture notes", meta: "Engineering · Anika", date: "Aug 12" },
];

const MOCK_QUESTIONS = [
  { title: "How do retries work after a failed charge?", meta: "Payments · 2 answers" },
  { title: "Who owns invite permissions?", meta: "Platform · 1 answer" },
  { title: "Where is the release checklist?", meta: "Product · 3 answers" },
];

/* ─── components ───────────────────────────────────────────────────── */

function ScrollAwareHeader({ scrollContainer }: { scrollContainer: React.RefObject<HTMLDivElement | null> }) {
  const { scrollY } = useScroll({ container: scrollContainer });
  const top = useTransform(scrollY, [0, 100], ["0px", "12px"]);

  return (
    <motion.header
      style={{ top }}
      className="sticky z-50 bg-background/80 backdrop-blur-xl max-w-6xl mx-auto border border-border/50"
    >
      <div className="flex h-14 items-center justify-between px-6">
        <Link href="/" className="flex flex-1 items-center justify-start gap-1.5">
          <img src="/logo.png" alt="Conflux Logo" className="h-6 w-6" />
          <span className="text-lg uppercase font-semibold">Conflux</span>
        </Link>

        <nav className="hidden flex-3 items-center justify-center gap-6 text-xs text-muted-foreground md:flex">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Link href="/login">
            <Button variant="outline">Log in</Button>
          </Link>
          <Link href="/login">
            <Button>Get started free</Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

/* ─── page ─────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={scrollContainerRef} className="h-full overflow-y-auto bg-chart-1/5">
      <ScrollAwareHeader scrollContainer={scrollContainerRef} />

      <main className="">
        <section id="hero" className="relative overflow-hidden py-24 md:py-50 max-w-380 mx-auto bg-[url('/hero.png')] bg-center bg-cover">
          <div className="text-center">
            <Reveal delay={80}>
              <h1 className="mt-4 text-background text-4xl leading-[1.1] tracking-tighter md:text-6xl">
                Your team&rsquo;s <span className="font-serif italic pr-1">knowledge</span>,
                <br />
                finally <span className="font-serif italic pr-1">findable</span>.
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted md:text-base">
                Conflux combines a document editor, AI-powered search, and
                automatic expert discovery - so your team stops losing
                knowledge in Slack threads and stale Notion pages.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link
                  href="/login"
                >
                  <Button>
                    Start for free
                  </Button>
                </Link>
                <Link
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary">
                    <GithubLogoIcon className="w-3.5 h-3.5" />
                    View on GitHub
                  </Button>
                </Link>

              </div>
            </Reveal>

            <Reveal delay={320}>
              <p className="mt-5 text-[11px] text-muted/80">
                Free to use &middot; Open source &middot; No credit card required
              </p>
            </Reveal>
          </div>
        </section>

        <section id="problem" className="py-24 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                The problem
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="text-2xl tracking-tight md:text-3xl">
                Every team has a knowledge problem.
                <br className="hidden md:block" />
                Nobody has solved it.
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {PROBLEMS.map((p, i) => (
                <Reveal key={p.title} delay={100 + i * 80}>
                  <Card className="h-full">
                    <CardContent>
                      <div className="mb-3 flex h-8 w-8 items-center justify-center bg-muted">
                        {i === 0 ? (
                          <FileIcon className="h-4 w-4 text-muted-foreground" />
                        ) : i === 1 ? (
                          <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <UsersThreeIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="text-sm font-semibold">{p.title}</h3>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                        {p.body}
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-border/50 py-24 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                How Conflux fixes this
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="text-2xl tracking-tight md:text-3xl">
                Three things no single tool does together.
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {/* Mockup 1: SearchSheet */}
              <Reveal delay={100}>
                <div className="flex h-full flex-col border border-border bg-background shadow-sm">
                  <div className="border-b border-border p-4">
                    <h3 className="text-sm font-semibold">Search</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ask a question, get an answer.
                    </p>
                  </div>
                  <div className="flex gap-2 border-b border-border px-4 py-3">
                    <div className="flex h-8 flex-1 items-center border border-chart-2/70 bg-background px-3">
                      <span className="truncate text-xs text-foreground">
                        How does payment retry work?
                      </span>
                    </div>
                    <Button size="sm" className="h-8 px-3 text-xs">
                      Send
                    </Button>
                  </div>
                  <div className="flex-1 space-y-3 overflow-hidden p-4">
                    <div className="flex items-start gap-2 rounded border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-600">
                      <WarningIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>The AI isn&rsquo;t fully confident about this answer.</span>
                    </div>

                    <p className="text-xs leading-relaxed text-foreground">
                      Failed charges retry twice over 48 hours. The billing
                      worker records each attempt, then posts the final status
                      into the customer workspace.
                    </p>

                    <div className="flex items-center gap-2 rounded border border-border p-2.5">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-chart-2/30 text-[10px] font-medium">
                        A
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          Consider asking Anika Menon
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          Top expert on Payments · 184 pts
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-1.5 text-[10px] font-medium text-muted-foreground">
                        Sources
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FileIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate">Billing retry runbook</span>
                          <span className="ml-auto shrink-0 text-[10px]">Maya</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <QuestionMarkIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate">Failed charge handling</span>
                          <span className="ml-auto shrink-0 text-[10px]">Anika</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Mockup 2: Q&A page */}
              <Reveal delay={180}>
                <div className="flex h-full flex-col border border-border bg-background shadow-sm">
                  <div className="border-b border-border p-4">
                    <h3 className="text-sm font-semibold">Q&A</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ask, verify, improve.
                    </p>
                  </div>
                  <div className="flex-1 space-y-4 overflow-hidden p-4">
                    {/* question */}
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        How does payment retry work?
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Asked by Marcus · 2 hours ago
                      </p>
                    </div>

                    {/* ai draft */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-chart-2" />
                        <span className="text-[10px] text-muted-foreground">
                          AI-generated draft
                        </span>
                      </div>
                      <div className="flex items-start gap-2 rounded border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-600">
                        <WarningIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>The AI isn&rsquo;t fully confident about this answer.</span>
                      </div>
                      <div className="flex items-center gap-2 rounded border border-border p-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-chart-2/30 text-[10px] font-medium">
                          A
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">
                            Consider asking Anika Menon
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            Top expert on Payments · 184 pts
                          </p>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-foreground">
                        Failed charges retry twice over 48 hours. The billing
                        worker records each attempt, then posts the final status.
                      </p>
                    </div>

                    {/* accepted answer */}
                    <div className="border-t border-border pt-3">
                      <div className="flex items-center gap-1.5">
                        <CheckCircleIcon className="h-3 w-3 text-green-500" />
                        <span className="text-[10px] font-medium text-green-600">
                          Accepted answer
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-foreground">
                        The retry runs on a 24h cycle. First attempt at T+24h,
                        second at T+48h. After both fail, the charge is marked
                        "final" and the customer gets a notification.
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Answered by Anika · verified by Marcus
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Mockup 3: ExpertPanel */}
              <Reveal delay={260}>
                <div className="flex h-full flex-col border border-border bg-background shadow-sm">
                  <div className="border-b border-border p-4">
                    <h3 className="text-sm font-semibold">Expert discovery</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Know who knows what.
                    </p>
                  </div>
                  <div className="flex-1 overflow-hidden p-4">
                    <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                      Top experts
                    </p>
                    <div className="space-y-3">
                      {[
                        { initials: "AM", name: "Anika Menon", tag: "Payments", pts: 184 },
                        { initials: "PR", name: "Priya Rajan", tag: "Integrations", pts: 142 },
                        { initials: "JL", name: "James Lee", tag: "Auth", pts: 97 },
                        { initials: "SK", name: "Sarah Kim", tag: "Deployment", pts: 83 },
                        { initials: "MC", name: "Marcus Chen", tag: "Billing", pts: 71 },
                      ].map((e) => (
                        <div key={e.name} className="flex items-center gap-2.5">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-chart-2/30 text-[10px] font-medium">
                            {e.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-foreground">
                              {e.name}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {e.tag} · {e.pts} pts
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-border/50 py-24 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                How it works
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="text-2xl  tracking-tight md:text-3xl">
                From question to answer in seconds.
              </h2>
            </Reveal>

            <div className="mt-12 space-y-6">
              <Reveal delay={100}>
                <div className="border border-border bg-background p-5 shadow-sm">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <FolderIcon className="h-7 w-7 shrink-0 text-chart-2" />
                        <h3 className="text-xl font-semibold text-foreground">
                          Engineering
                        </h3>
                      </div>
                      <p className="ml-9 text-sm text-muted-foreground">
                        Runbooks, architecture notes, and launch questions.
                      </p>
                    </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <Button variant="outline" size="sm">
                        <QuestionMarkIcon className="h-3.5 w-3.5" />
                        Ask
                      </Button>
                      <Button size="sm">
                        <FileIcon className="h-3.5 w-3.5" />
                        New doc
                      </Button>
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-2 gap-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>12</CardTitle>
                        <CardDescription>Documents</CardDescription>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>9</CardTitle>
                        <CardDescription>Questions asked</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-md font-medium text-muted-foreground">
                          Documents
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          New doc →
                        </span>
                      </div>
                      <div className="space-y-2">
                        {MOCK_DOCS.map((doc) => (
                          <div
                            key={doc.title}
                            className="flex items-center gap-3 border border-input bg-background p-3"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-muted">
                              <FileIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {doc.title}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {doc.meta.split(" · ")[1]}
                              </p>
                            </div>
                            <div className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
                              <ClockIcon className="h-3 w-3" />
                              {doc.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-md font-medium text-muted-foreground">
                          Questions
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          Ask a question →
                        </span>
                      </div>
                      <div className="space-y-2">
                        {MOCK_QUESTIONS.map((q) => (
                          <div
                            key={q.title}
                            className="flex items-center gap-3 border border-input bg-background p-3"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-chart-4/10">
                              <QuestionMarkIcon className="h-4 w-4 text-chart-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {q.title}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {q.meta}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                {STEPS.map((s, i) => (
                  <Reveal key={s.num} delay={150 + i * 70}>
                    <Card className="h-full">
                      <CardContent>
                        <span className="text-[10px] text-muted-foreground/50">
                          {s.num}
                        </span>
                        <h3 className="mt-2 text-sm font-semibold">{s.title}</h3>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {s.body}
                        </p>
                      </CardContent>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tech credibility */}
        <section className="border-t border-border/50 py-24 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                Under the hood
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="text-2xl  tracking-tight md:text-3xl">
                Built on real infrastructure, not demos.
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TECH_CARDS.map((t, i) => (
                <Reveal key={t.title} delay={80 + i * 60}>
                  <div className="group h-full border border-border bg-background/70 p-5 transition-colors hover:bg-background">
                    <t.icon className="mb-3 w-4 h-4 text-muted-foreground" />
                    <h3 className="text-xs font-semibold">{t.title}</h3>
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                      {t.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="border-t border-border/50 py-24 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <h2 className="text-2xl  tracking-tight md:text-3xl">
                Built for teams that move fast and
                <br className="hidden md:block" />
                can&rsquo;t afford to lose knowledge.
              </h2>
            </Reveal>

            <div className="mt-12">
              <div className="grid gap-4 md:grid-cols-3">
                {USE_CASES.map((u, i) => (
                  <Reveal key={u.title} delay={100 + i * 80}>
                    <Card className="h-full">
                      <CardContent>
                        <u.icon className="mb-3 h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">{u.title}</h3>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {u.body}
                        </p>
                        <div className="mt-5 border-t border-border pt-4">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{i === 0 ? "Runbooks" : i === 1 ? "Specs" : "FAQs"}</span>
                            <span>{i === 0 ? "184" : i === 1 ? "96" : "42"}</span>
                          </div>
                          <div className="mt-2 h-1.5 bg-border">
                            <div
                              className="h-full bg-chart-1"
                              style={{ width: `${72 - i * 12}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* cta */}
        <section className="bg-[url('/cta.png')] bg-cover py-24 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid items-center gap-8 p-6 md:grid-cols-[1fr_auto] md:p-8">
              <div>
                <Reveal>
                  <h2 className="text-2xl tracking-tight md:text-3xl">
                    Your team&rsquo;s knowledge shouldn&rsquo;t
                    <br />
                    live in one person&rsquo;s head.
                  </h2>
                </Reveal>
                <Reveal delay={100}>
                  <p className="mt-4 text-sm text-foreground/70">
                    Conflux is free, open source, and ready to use today.
                  </p>
                </Reveal>
              </div>
              <Reveal delay={200}>
                <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                  <Link
                    href="/login"
                  >
                    <Button>
                      Get started free
                    </Button>
                  </Link>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="flex items-center gap-2">
                      <GithubLogoIcon className="w-3.5 h-3.5" />
                      Star on GitHub
                    </Button>
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <img src="/logo.png" alt="Conflux Logo" className="h-4 w-4" />
            <span>
              Conflux - Team knowledge that compounds.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-muted-foreground/60">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Report a bug
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-center pt-6 text-[11px] text-muted-foreground">
          Built with 🧠 by<Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-chart-4 transition-colors">&nbsp;Maniac</Link>
        </div>
      </footer>
    </div>
  );
}
