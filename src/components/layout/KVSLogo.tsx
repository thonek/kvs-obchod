export function KVSLogo({ height = 44 }: { height?: number }) {
  const w = height * 2.6
  const ch = height
  const cr = ch * 0.42
  const cx = cr + 2
  const cy = ch / 2
  const flagX = cx + cr + 4
  const flagW = w - flagX - 2
  const stripes = 7
  const sw = flagW / stripes
  const pts = (i: number) => {
    const x = flagX + i * sw
    const wave = Math.sin((i / stripes) * Math.PI * 0.8) * ch * 0.08
    return { x, topY: ch * 0.08 + wave, botY: ch * 0.92 + wave }
  }
  return (
    <svg width={w} height={ch} viewBox={`0 0 ${w} ${ch}`} style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={cr} fill="none" stroke="#4a90c4" strokeWidth={2.5} />
      <text x={cx} y={cy - 1} textAnchor="middle" dominantBaseline="central"
        fill="#4a90c4" fontSize={cr * 0.82} fontWeight="800"
        fontFamily="'Barlow Condensed', sans-serif" fontStyle="italic">KVS</text>
      <text x={cx} y={cy + cr * 0.62} textAnchor="middle"
        fill="#4a90c4" fontSize={cr * 0.36} fontWeight="700"
        fontFamily="'Barlow Condensed', sans-serif">1924</text>
      {Array.from({ length: stripes }).map((_, i) => {
        const p1 = pts(i)
        const p2 = pts(i + 1)
        const path = `M${p1.x},${p1.topY} L${p2.x},${p2.topY} L${p2.x},${p2.botY} L${p1.x},${p1.botY} Z`
        return <path key={i} d={path} fill={i % 2 === 0 ? '#d94040' : '#ffffff'} />
      })}
    </svg>
  )
}
