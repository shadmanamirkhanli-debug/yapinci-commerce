import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getSurveyResults } from "@/lib/admin/survey";
import { adminCardClass, adminTableClass, adminTableHeadClass } from "@/lib/admin/styles";

function SegmentTable({
  title,
  segments,
}: {
  title: string;
  segments: { label: string; count: number; averageScore: number; wouldBuyPercent: number }[];
}) {
  if (segments.length === 0) {
    return (
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.15em] text-neutral-500">{title}</p>
        <p className="text-sm text-neutral-600">No data</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.15em] text-neutral-500">{title}</p>
      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className={adminTableClass}>
          <thead className={adminTableHeadClass}>
            <tr>
              <th className="px-3 py-2 font-medium">Segment</th>
              <th className="px-3 py-2 font-medium">n</th>
              <th className="px-3 py-2 font-medium">Avg score</th>
              <th className="px-3 py-2 font-medium">Would buy</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((segment) => (
              <tr key={segment.label} className="border-t border-neutral-800/80">
                <td className="px-3 py-2">{segment.label}</td>
                <td className="px-3 py-2 text-neutral-400">{segment.count}</td>
                <td className="px-3 py-2">{segment.averageScore.toFixed(1)}</td>
                <td className="px-3 py-2">{segment.wouldBuyPercent.toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function SurveyResultsPage() {
  const results = await getSurveyResults();

  return (
    <div>
      <AdminPageHeader
        title="Survey Results"
        description="Designs ranked by average score"
      />

      {results.length === 0 ? (
        <p className="text-sm text-neutral-500">No designs uploaded yet.</p>
      ) : (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={result.id} className={`${adminCardClass} space-y-6 p-6`}>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex items-start gap-4 md:w-72 md:shrink-0">
                  <span className="text-2xl font-light text-neutral-500">#{index + 1}</span>
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={result.imageUrl} alt={result.title} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{result.title}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {result.count} {result.count === 1 ? "vote" : "votes"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-8 md:w-72 md:shrink-0">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">Avg score</p>
                    <p className="mt-1 text-xl font-light">{result.averageScore.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">Would buy</p>
                    <p className="mt-1 text-xl font-light">{result.wouldBuyPercent.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">Top price</p>
                    <p className="mt-1 text-xl font-light">
                      {result.topPriceBand ? result.topPriceBand.label : "—"}
                    </p>
                    {result.topPriceBand && (
                      <p className="text-xs text-neutral-500">{result.topPriceBand.count} votes</p>
                    )}
                  </div>
                </div>

                <div className="flex-1 border-t border-neutral-800 pt-4 md:border-t-0 md:border-l md:pl-6 md:pt-0">
                  <p className="mb-2 text-xs uppercase tracking-[0.15em] text-neutral-500">
                    Suggestions
                  </p>
                  {result.suggestions.length === 0 ? (
                    <p className="text-sm text-neutral-600">No suggestions left</p>
                  ) : (
                    <ul className="space-y-1.5 text-sm text-neutral-300">
                      {result.suggestions.map((suggestion, suggestionIndex) => (
                        <li key={suggestionIndex} className="border-b border-neutral-800/60 pb-1.5 last:border-0">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 border-t border-neutral-800 pt-4 md:grid-cols-2">
                <SegmentTable title="By gender" segments={result.genderSegments} />
                <SegmentTable title="By age band" segments={result.ageSegments} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
