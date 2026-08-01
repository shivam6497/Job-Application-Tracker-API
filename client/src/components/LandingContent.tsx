const FEATURES = [
  {
    title: "Track every application",
    description: "Add jobs with company, role, status, and notes. Never lose track of where you applied.",
  },
  {
    title: "Status at a glance",
    description: "See all your applications sorted by Applied, Interview, Offer, and Rejected in one clean dashboard.",
  },
  {
    title: "Filter and search",
    description: "Find any application instantly. Filter by status or search by company and role name.",
  },
  {
    title: "Follow-up reminders",
    description: "Automatic email reminders so you never forget to follow up on an application.",
  },
  {
    title: "Stats that matter",
    description: "Know your numbers — how many you've applied to, how many interviews, offers, and rejections.",
  },
  {
    title: "Simple and fast",
    description: "No clutter, no bloat. Just a clean tool that gets out of your way.",
  },
];

export default function LandingContent() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* Nav */}
      <nav className="border-b border-[#DDD8CF] px-4 sm:px-6 py-4 flex items-center justify-between">
        <h1 className="font-serif text-xl text-[#1C1C1C] tracking-tight">Job Tracker</h1>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-[#6B6B6B] hover:text-[#1C1C1C] transition-colors">
            Sign in
          </a>
          <a href="/register" className="text-sm bg-[#6B7B5E] hover:bg-[#5C6B50] text-white px-4 py-2 rounded-sm transition-colors">
            Get started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 sm:pb-20 text-center">
        <p className="text-xs uppercase tracking-widest text-[#6B7B5E] mb-4">Job application tracker</p>
        <h2 className="font-serif text-4xl sm:text-5xl text-[#1C1C1C] tracking-tight leading-tight mb-6">
          Stop losing track of<br className="hidden sm:block" /> where you applied.
        </h2>
        <p className="text-[#6B6B6B] text-base sm:text-lg leading-relaxed mb-10 max-w-lg mx-auto">
          A clean, minimal tool to track your job applications from first apply to final offer.
          Built for developers who are serious about their job search.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/register" className="w-full sm:w-auto bg-[#6B7B5E] hover:bg-[#5C6B50] text-white text-sm px-6 py-3 rounded-sm transition-colors">
            Start tracking for free
          </a>
          <a href="/login" className="w-full sm:w-auto border border-[#DDD8CF] text-[#1C1C1C] text-sm px-6 py-3 rounded-sm hover:bg-[#F0EBE0] transition-colors">
            Sign in
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="border-t border-[#DDD8CF]" />
      </div>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <p className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-10 text-center">Everything you need</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#DDD8CF]">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#F5F0E8] px-6 py-8">
              <h3 className="font-serif text-lg text-[#1C1C1C] mb-2">{f.title}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#DDD8CF]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1C1C] tracking-tight mb-4">
            Ready to get organised?
          </h2>
          <p className="text-sm text-[#6B6B6B] mb-8">Free to use. No credit card required.</p>
          <a href="/register" className="inline-block bg-[#6B7B5E] hover:bg-[#5C6B50] text-white text-sm px-6 py-3 rounded-sm transition-colors">
            Create your account
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DDD8CF] px-4 sm:px-6 py-6">
        <p className="text-xs text-[#B8B3A8] text-center">
          © {new Date().getFullYear()} Job Tracker. Built for developers.
        </p>
      </footer>

    </div>
  );
}