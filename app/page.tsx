export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest">
          URUP Connect
        </div>
        <h1 className="text-5xl font-bold tracking-tight">CS Hub</h1>
        <p className="text-xl text-gray-400">
          AI-Powered Client Success Operating System
        </p>
        <p className="text-gray-500 text-sm leading-relaxed">
          Centralising client communications, project delivery, document generation,
          knowledge management, and relationship intelligence for Client Success Managers.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {["Work Management","Knowledge Management","Relationship Intelligence"].map((pillar) => (
            <span key={pillar} className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-4 py-2 rounded-full">
              {pillar}
            </span>
          ))}
        </div>
        <div className="pt-4 text-gray-600 text-xs">
          Development in progress — Sprint 1 starting soon
        </div>
      </div>
    </main>
  )
}
