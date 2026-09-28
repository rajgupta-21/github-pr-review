import { SectionLabel, SectionTitle } from "./section-label";

const SEVERITY_ROWS = [
  { label: "Critical", count: 1, dot: "bg-[#E0566F]", text: "text-[#FF9AA8]", box: "border-[#4A2230] bg-[#1F1533]" },
  { label: "High", count: 3, dot: "bg-[#E0A24C]", text: "text-[#FFCE8A]", box: "border-[#262340] bg-[#1B1930]" },
  { label: "Medium", count: 6, dot: "bg-[#D7C45A]", text: "text-[#E8DA8E]", box: "border-[#262340] bg-[#1B1930]" },
  { label: "Low", count: 4, dot: "bg-low-solid", text: "text-[#A6BEE0]", box: "border-[#262340] bg-[#1B1930]" },
];

const TILES = [
  {
    title: "Security pass first",
    body: "A dedicated security scan looks for secrets, auth gaps, injection surfaces and unsafe patterns in the diff.",
    icon: (
      <>
        <path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    title: "Four scores per PR",
    body: "Every report scores the change overall and for security, performance and quality, with a clear approve or request-changes call.",
    icon: (
      <>
        <path d="M4 18V9" />
        <path d="M10 18V5" />
        <path d="M16 18v-6" />
        <path d="M3 21h18" />
      </>
    ),
  },
  {
    title: "Visual workflows",
    body: "Chain triggers, review passes and actions — comment, approve, notify. The canvas is the config, no pipeline files to maintain.",
    icon: (
      <>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <circle cx="18" cy="12" r="2.5" />
        <path d="M6 8.5v7" />
        <path d="M8.5 6h4a3 3 0 0 1 3 3v1" />
      </>
    ),
  },
  {
    title: "Manual runs",
    body: "Run a workflow against any open pull request from the builder and see each step's result as it finishes.",
    icon: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h10" />
        <path d="M4 18h7" />
        <path d="M17 15l3 3-3 3" />
      </>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-[76px] border-b border-ink-line bg-[#100F1D] px-4 py-16 sm:px-8 lg:px-16 lg:py-[76px]">
      <div className="mx-auto max-w-[1312px]">
        <SectionLabel>What you get</SectionLabel>
        <SectionTitle className="mb-11 max-w-[640px]">
          A reviewer that reads the whole diff, not just the line
        </SectionTitle>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-[30px] rounded-[18px] border border-[#262340] bg-[#16152B] p-[30px] md:col-span-2 sm:flex-row sm:items-center">
            <div className="flex-1">
              <h3 className="font-display text-2xl font-bold text-ink-fg-strong">Findings you can act on</h3>
              <p className="mt-2.5 text-[15px] leading-[1.62] text-[#9C96BE]">
                Each finding names the file, explains why it matters in this codebase, and proposes the
                concrete change. Severity is calibrated, so <span className="text-[#FF9AA8]">Critical</span>{" "}
                stays rare enough to mean something.
              </p>
            </div>
            <ul className="flex shrink-0 flex-col gap-2 sm:w-[250px]" aria-label="Example severity breakdown">
              {SEVERITY_ROWS.map((row) => (
                <li
                  key={row.label}
                  className={`flex items-center gap-[9px] rounded-md border px-3 py-2.5 ${row.box}`}
                >
                  <span aria-hidden="true" className={`size-[7px] rounded-full ${row.dot}`} />
                  <span className="text-[13px] text-ink-fg">{row.label}</span>
                  <span className={`ml-auto font-mono text-[13px] ${row.text}`}>{row.count}</span>
                </li>
              ))}
            </ul>
          </div>

          {TILES.map((tile) => (
            <div key={tile.title} className="rounded-[18px] border border-[#262340] bg-[#16152B] p-[30px]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-6 text-violet-300"
              >
                {tile.icon}
              </svg>
              <h3 className="mt-[18px] font-display text-[21px] font-bold text-ink-fg-strong">{tile.title}</h3>
              <p className="mt-[9px] text-[14.5px] leading-[1.6] text-[#9C96BE]">{tile.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
