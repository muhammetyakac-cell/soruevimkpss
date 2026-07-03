export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div className="spinner"></div>
      <p className="text-muted" style={{ marginTop: '1rem', fontFamily: 'var(--font-heading)' }}>Yükleniyor...</p>
    </div>
  )
}
