export function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-navy-900 text-white">
      <div
        className="w-12 h-12 rounded-full border-4 border-navy-700 border-t-kvs-red"
        style={{ animation: 'spin 0.8s linear infinite' }}
      />
      <p className="mt-4 text-xs tracking-widest uppercase opacity-70">Načítání...</p>
    </div>
  )
}
