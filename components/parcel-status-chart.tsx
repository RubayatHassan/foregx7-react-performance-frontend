"use client";

const colors: Record<string, string> = {
  "In transit": "#8baa68",
  Delivered: "#bad48f",
  "At hub": "#d2b870",
  "Out for delivery": "#e8a173",
  Other: "#aab6a8",
};

export function ParcelStatusChart({ counts }: { counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const rows = Object.entries(counts);

  return (
    <section className="panel status-chart" aria-label="Parcel status breakdown">
      <div className="status-chart-heading">
        <div>
          <h2>Delivery snapshot</h2>
          <p>Current parcel mix · {total.toLocaleString("en-BD")} parcels</p>
        </div>
      </div>
      {rows.map(([label, value]) => (
        <div className="status-chart-row" key={label}>
          <span>{label}</span>
          <div className="status-chart-track" aria-hidden="true">
            <i style={{ width: total ? (value / total) * 100 + "%" : "0%", backgroundColor: colors[label] }} />
          </div>
          <strong>{value.toLocaleString("en-BD")}</strong>
        </div>
      ))}
    </section>
  );
}
