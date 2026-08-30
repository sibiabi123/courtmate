export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-4xl space-y-8 animate-pulse">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-56 rounded-lg bg-white/5" />
          <div className="h-4 w-80 rounded-md bg-white/[0.03]" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 border border-white/[0.03]" />
          ))}
        </div>

        {/* Content cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/5 border border-white/[0.03] p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-24 rounded bg-white/5" />
                  <div className="h-3 w-16 rounded bg-white/[0.03]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-white/[0.03]" />
                <div className="h-3 w-3/4 rounded bg-white/[0.03]" />
              </div>
              <div className="flex gap-2 pt-1">
                <div className="h-7 w-16 rounded-lg bg-white/5" />
                <div className="h-7 w-16 rounded-lg bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
