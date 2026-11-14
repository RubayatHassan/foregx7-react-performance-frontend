"use client";

import { memo, useCallback, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Parcel } from "@/lib/api";
import { title } from "@/lib/format";
import { Icon } from "./icon";

const ROW_HEIGHT = 66;

function tone(status: string) {
  if (["DELIVERED", "PAID"].includes(status)) return "tone-green";
  if (
    [
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "PICKED_UP",
      "AT_HUB",
      "PICKUP_ASSIGNED",
      "PENDING",
      "SORTING",
      "RESCHEDULED",
    ].includes(status)
  )
    return "tone-orange";
  return "tone-gray";
}

const ParcelRow = memo(function ParcelRow({
  parcel,
  isCustomer,
  onSelect,
  style,
  index,
  total,
}: {
  parcel: Parcel;
  isCustomer: boolean;
  onSelect: (parcel: Parcel) => void;
  style: React.CSSProperties;
  index: number;
  total: number;
}) {
  return (
    <button
      className="parcel-row virtual-list-item"
      type="button"
      role="listitem"
      aria-posinset={index + 1}
      aria-setsize={total}
      style={style}
      onClick={() => onSelect(parcel)}
    >
      <span className="parcel-primary">
        <strong>{parcel.trackingNumber}</strong>
        <span>{isCustomer ? parcel.deliveryAddress || "Your delivery" : parcel.customer?.name || "Recipient"}</span>
      </span>
      <span className="parcel-destination">
        <Icon name="pin" size={13} />
        {isCustomer ? "Delivery address" : parcel.deliveryAddress || "Address pending"}
      </span>
      <span className={"status-badge " + tone(parcel.status)}>
        <i className="status-dot" />
        {title(parcel.status)}
      </span>
      <span className="row-open">
        <Icon name="arrow" size={13} />
      </span>
    </button>
  );
});

export const VirtualizedParcelList = memo(function VirtualizedParcelList({
  parcels,
  isCustomer,
  onSelect,
  virtualize = true,
}: {
  parcels: Parcel[];
  isCustomer: boolean;
  onSelect: (parcel: Parcel) => void;
  virtualize?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const getItemKey = useCallback((index: number) => parcels[index]?.id ?? index, [parcels]);
  const virtualizer = useVirtualizer({
    count: parcels.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    getItemKey,
    overscan: 6,
    useFlushSync: false,
  });
  const renderedItems = virtualize
    ? virtualizer.getVirtualItems()
    : parcels.map((parcel, index) => ({
        key: parcel.id,
        index,
        start: index * ROW_HEIGHT,
        size: ROW_HEIGHT,
      }));

  return (
    <div
      className="virtual-list-viewport parcel-virtual-list"
      ref={scrollRef}
      role="list"
      tabIndex={0}
      aria-label="Parcel list"
      style={{ height: Math.min(430, Math.max(ROW_HEIGHT, parcels.length * ROW_HEIGHT)) }}
    >
      <div className="virtual-list-spacer" role="presentation" style={{ height: parcels.length * ROW_HEIGHT }}>
        {renderedItems.map((item) => {
          const parcel = parcels[item.index];
          if (!parcel) return null;
          return (
            <ParcelRow
              key={item.key}
              parcel={parcel}
              isCustomer={isCustomer}
              onSelect={onSelect}
              index={item.index}
              total={parcels.length}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: item.size,
                transform: "translateY(" + item.start + "px)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
});
