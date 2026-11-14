"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Customer } from "@/lib/api";
import { initials } from "@/lib/format";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { Icon } from "./icon";

const ROW_HEIGHT = 63;

const CustomerRow = memo(function CustomerRow({
  customer,
  onBook,
  style,
  index,
  total,
}: {
  customer: Customer;
  onBook?: (customer: Customer) => void;
  style: React.CSSProperties;
  index: number;
  total: number;
}) {
  return (
    <div
      className="directory-row virtual-list-item"
      role="listitem"
      aria-posinset={index + 1}
      aria-setsize={total}
      style={style}
    >
      <span className="avatar">{initials(customer.name)}</span>
      <span className="directory-name">
        <strong>{customer.name}</strong>
        <small>{customer.email || customer.phone}</small>
      </span>
      <span className="directory-note">
        {customer.email ? "Portal connected by email" : "Add an email so they can see their parcels"}
      </span>
      {onBook && (
        <button
          className="icon-button directory-action"
          type="button"
          aria-label={"Book a parcel for " + customer.name}
          onClick={() => onBook(customer)}
        >
          <Icon name="plus" size={15} />
        </button>
      )}
    </div>
  );
});

export const VirtualizedCustomerDirectory = memo(function VirtualizedCustomerDirectory({
  customers,
  onBook,
  virtualize = true,
}: {
  customers: Customer[];
  onBook?: (customer: Customer) => void;
  virtualize?: boolean;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const visibleCustomers = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) =>
      (customer.name + " " + customer.email + " " + customer.phone).toLowerCase().includes(query),
    );
  }, [customers, debouncedSearch]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const getItemKey = useCallback((index: number) => visibleCustomers[index]?.id ?? index, [visibleCustomers]);
  const virtualizer = useVirtualizer({
    count: visibleCustomers.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    getItemKey,
    overscan: 6,
    useFlushSync: false,
  });
  const renderedItems = virtualize
    ? virtualizer.getVirtualItems()
    : visibleCustomers.map((customer, index) => ({
        key: customer.id,
        index,
        start: index * ROW_HEIGHT,
        size: ROW_HEIGHT,
      }));

  return (
    <>
      <div className="directory-tools">
        <label className="table-search">
          <Icon name="search" size={15} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customers…"
            aria-label="Search customers"
          />
        </label>
        <span>
          {visibleCustomers.length.toLocaleString("en-BD")} of {customers.length.toLocaleString("en-BD")}
        </span>
      </div>
      {visibleCustomers.length ? (
        <div
          className="virtual-list-viewport customer-virtual-list"
          ref={scrollRef}
          role="list"
          tabIndex={0}
          aria-label="Customer directory"
          style={{ height: Math.min(441, Math.max(ROW_HEIGHT, visibleCustomers.length * ROW_HEIGHT)) }}
        >
          <div
            className="virtual-list-spacer"
            role="presentation"
            style={{ height: visibleCustomers.length * ROW_HEIGHT }}
          >
            {renderedItems.map((item) => {
              const customer = visibleCustomers[item.index];
              if (!customer) return null;
              return (
                <CustomerRow
                  key={item.key}
                  customer={customer}
                  onBook={onBook}
                  index={item.index}
                  total={visibleCustomers.length}
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
      ) : (
        <div className="empty-state compact-empty">
          <span className="empty-mark">
            <Icon name="search" />
          </span>
          <h3>No matching customers</h3>
          <p>Try another name, email or phone number.</p>
        </div>
      )}
    </>
  );
});
