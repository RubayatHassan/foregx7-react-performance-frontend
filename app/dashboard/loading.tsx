export default function DashboardLoading() {
  return (
    <main className="loading-screen" aria-busy="true" aria-live="polite">
      <span className="spinner" />
      <p>Your workspace is loading…</p>
    </main>
  );
}
