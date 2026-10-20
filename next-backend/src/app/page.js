export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans p-6 selection:bg-indigo-500 selection:text-white">
      <main className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs uppercase font-semibold tracking-wider text-emerald-400">
            Backend API Operational
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Online Course Service API
          </h1>
          <p className="text-sm text-slate-400">
            CSX4107 Web Application Development • Final Examination
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs space-y-1.5 text-slate-300 font-mono">
          <div><span className="text-slate-500">Student:</span> Min Khant Tin</div>
          <div><span className="text-slate-500">Student ID:</span> 6726033</div>
          <div><span className="text-slate-500">Section:</span> 542</div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <a
            href="https://react-frontend-manisandar.vercel.app"
            className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
          >
            Launch Web Application →
          </a>
          <a
            href="/api/course"
            className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all border border-slate-700"
          >
            Inspect API (/api/course)
          </a>
        </div>
      </main>

      <footer className="mt-8 text-xs text-slate-500 text-center">
        Vincent Mary School of Engineering, Science and Technology • Assumption University
      </footer>
    </div>
  );
}
