export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
          {/* Spinning ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
          {/* Inner glow */}
          <div className="absolute inset-4 bg-cyan-500/10 rounded-full animate-pulse" />
        </div>
        <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">
          Loading...
        </p>
      </div>
    </div>
  );
}
