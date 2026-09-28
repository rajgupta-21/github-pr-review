/*
  Facts about how the product works, not invented usage metrics.
*/
const STATS = [
  { value: "3", label: "Review passes per PR: security, performance, quality" },
  { value: "4", label: "Scores on every report, overall included" },
  { value: "0", label: "Lines of your source retained after a run" },
  { value: "1", label: "Webhook per repository — nothing else to install" },
];

export function StatBand() {
  return (
    <section className="border-b border-ink-line bg-[#100F1D] px-4 py-8 sm:px-8 lg:px-16 lg:py-0">
      <div className="mx-auto grid max-w-[1312px] grid-cols-1 gap-6 sm:grid-cols-2 lg:h-[148px] lg:grid-cols-4 lg:items-center lg:gap-0">
        {STATS.map((stat, index) => (
          <div
            key={stat.label}
            className={
              index === 0
                ? "lg:pr-8"
                : index === STATS.length - 1
                  ? "lg:border-l lg:border-ink-line lg:pl-8"
                  : "lg:border-l lg:border-ink-line lg:px-8"
            }
          >
            <div className="font-display text-[38px] font-bold tracking-[-0.02em] text-ink-fg-strong">
              {stat.value}
            </div>
            <div className="mt-1 text-[13.5px] text-ink-subtle">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
