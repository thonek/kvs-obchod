export const fmtPrice = (n: number) => n.toLocaleString('cs-CZ') + ' Kč'
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('cs-CZ')
