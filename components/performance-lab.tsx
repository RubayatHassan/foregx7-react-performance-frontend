"use client";

import { Profiler, useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ProfilerOnRenderCallback } from "react";
import type { Customer, Parcel } from "@/lib/api";
import { VirtualizedCustomerDirectory } from "./virtualized-customer-directory";
import { VirtualizedParcelList } from "./virtualized-parcel-list";

const ParcelStatusChart = dynamic(() => import("./parcel-status-chart").then((module) => module.ParcelStatusChart), {
  loading: () => (
    <div className="lazy-chart-fallback" aria-busy="true">
      Preparing delivery snapshot…
    </div>
  ),
});
const sampleStatuses = ["IN_TRANSIT", "DELIVERED", "AT_HUB", "OUT_FOR_DELIVERY", "CREATED"];

export function PerformanceLab() {
  const [selected, setSelected] = useState("");
  const [mode, setMode] = useState<"baseline" | "optimized">("optimized");
  const parcels = useMemo<Parcel[]>(
    () =>
      Array.from({ length: 1000 }, (_, index) => {
        const id = index + 1;
        return {
          id: "sample-parcel-" + id,
          trackingNumber: "PACE-" + String(id).padStart(6, "0"),
          status: sampleStatuses[index % sampleStatuses.length],
          createdAt: "2026-11-11T09:00:00.000Z",
          deliveryAddress: "Block " + ((index % 48) + 1) + ", Dhaka",
          customer: { name: "Customer " + String(id).padStart(4, "0"), phone: "01700000000" },
        };
      }),
    [],
  );
  const customers = useMemo<Customer[]>(
    () =>
      Array.from({ length: 1000 }, (_, index) => {
        const id = index + 1;
        return {
          id: "sample-customer-" + id,
          name: "Customer " + String(id).padStart(4, "0"),
          phone: "017" + String(10000000 + id),
          email: "customer" + id + "@example.com",
        };
      }),
    [],
  );
  const onSelectParcel = useCallback((parcel: Parcel) => setSelected(parcel.trackingNumber), []);
  const onBookCustomer = useCallback((customer: Customer) => setSelected("Selected " + customer.name), []);
  const profileRender: ProfilerOnRenderCallback = useCallback((id, phase, actualDuration, baseDuration) => {
    if (process.env.NODE_ENV === "development") {
      console.info(
        "[React Profiler] " +
          id +
          " phase=" +
          phase +
          " actualDuration=" +
          actualDuration.toFixed(2) +
          "ms baseDuration=" +
          baseDuration.toFixed(2) +
          "ms",
      );
    }
  }, []);
  const counts = useMemo(
    () =>
      parcels.reduce<Record<string, number>>((result, parcel) => {
        const label =
          parcel.status === "IN_TRANSIT"
            ? "In transit"
            : parcel.status === "DELIVERED"
              ? "Delivered"
              : parcel.status === "AT_HUB"
                ? "At hub"
                : parcel.status === "OUT_FOR_DELIVERY"
                  ? "Out for delivery"
                  : "Other";
        result[label] = (result[label] ?? 0) + 1;
        return result;
      }, {}),
    [parcels],
  );

  return (
    <div className="performance-lab">
      {selected && (
        <p className="performance-selection" role="status">
          {selected}
        </p>
      )}
      <div className="performance-mode-switch" role="group" aria-label="Rendering mode">
        <button
          className={mode === "baseline" ? "active" : ""}
          type="button"
          aria-pressed={mode === "baseline"}
          onClick={() => setMode("baseline")}
        >
          Baseline · render all rows
        </button>
        <button
          className={mode === "optimized" ? "active" : ""}
          type="button"
          aria-pressed={mode === "optimized"}
          onClick={() => setMode("optimized")}
        >
          Optimized · virtualize rows
        </button>
      </div>
      <ParcelStatusChart counts={counts} />
      <Profiler id="1,000 parcel list" onRender={profileRender}>
        <section className="panel performance-list-panel">
          <div className="performance-list-heading">
            <div>
              <h2>Parcels</h2>
              <p>1,000 representative records</p>
            </div>
            <span>Scroll to explore</span>
          </div>
          <VirtualizedParcelList
            parcels={parcels}
            isCustomer={false}
            onSelect={onSelectParcel}
            virtualize={mode === "optimized"}
          />
        </section>
      </Profiler>
      <Profiler id="1,000 customer list" onRender={profileRender}>
        <section className="panel performance-list-panel">
          <div className="performance-list-heading">
            <div>
              <h2>Customers</h2>
              <p>1,000 representative records</p>
            </div>
            <span>Search is debounced</span>
          </div>
          <VirtualizedCustomerDirectory
            customers={customers}
            onBook={onBookCustomer}
            virtualize={mode === "optimized"}
          />
        </section>
      </Profiler>
      <p className="performance-note">
        The browser only mounts the visible rows plus a small overscan buffer. Search and selection remain keyboard
        accessible.
      </p>
    </div>
  );
}
