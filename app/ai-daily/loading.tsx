export default function Loading() {
  return (
    <section className="route-loading" aria-live="polite" aria-busy="true">
      <div className="route-loading-card">
        <span className="route-loading-dot" aria-hidden="true" />
        <strong>正在打开内容…</strong>
      </div>
    </section>
  );
}
