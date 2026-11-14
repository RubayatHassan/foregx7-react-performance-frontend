"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ApiError, api, type Parcel } from "@/lib/api";
import { date, title } from "@/lib/format";
import { Icon } from "./icon";

export function TrackParcel() {
  const [tracking, setTracking] = useState("");
  const [submittedTracking, setSubmittedTracking] = useState("");
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!submittedTracking) return;
    let active = true;
    setIsFetching(true);
    setError(null);
    api
      .get<Parcel>("/parcels/track/" + encodeURIComponent(submittedTracking))
      .then((result) => {
        if (active) setParcel(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason);
      })
      .finally(() => {
        if (active) setIsFetching(false);
      });
    return () => {
      active = false;
    };
  }, [submittedTracking]);

  function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedTracking(tracking.trim());
  }

  const trackingError = error instanceof ApiError ? error.message : error ? "Tracking পাওয়া যায়নি। নম্বরটি আবার দেখুন।" : "";

  return (
    <section id="track" className="tracking-section">
      <div className="section-head">
        <div>
          <h2>Wondering where it is?</h2>
          <p>Pop in your tracking number. We’ll take a look.</p>
        </div>
        <span className="status-pill">LIVE TRACKING</span>
      </div>
      <form className="tracking-search" onSubmit={track}>
        <Icon name="search" size={17} className="search-icon" />
        <input
          aria-label="Tracking number"
          required
          minLength={4}
          placeholder="e.g. CLP0AB12CD"
          value={tracking}
          onChange={(event) => setTracking(event.target.value)}
        />
        <button className="btn btn-small" type="submit" disabled={isFetching}>
          {isFetching ? <span className="spinner" /> : "Find my parcel"}
        </button>
      </form>
      {trackingError && <p className="track-error">{trackingError}</p>}
      {parcel && (
        <div className="track-result">
          <div>
            <span className="form-help">PARCEL STATUS</span>
            <h3>
              {parcel.trackingNumber} <span className="status-pill">{title(parcel.status)}</span>
            </h3>
            <p>Last updated {date(parcel.trackingEvents?.at(-1)?.createdAt ?? parcel.createdAt)}</p>
          </div>
          <Link className="btn btn-light btn-small" href="/sign-in">
            Open your account <Icon name="arrowRight" size={13} />
          </Link>
          {parcel.trackingEvents?.length ? (
            <div className="track-event">
              {parcel.trackingEvents.map((item, index) => (
                <div className="track-event-item" key={item.status + "-" + item.createdAt}>
                  <i
                    className={
                      index === (parcel.trackingEvents?.length ?? 0) - 1 ? "timeline-dot" : "timeline-dot muted-dot"
                    }
                  />
                  <span>
                    <strong>{title(item.status)}</strong>
                    <small>
                      {item.note || item.location || date(item.createdAt)} · {date(item.createdAt)}
                    </small>
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
