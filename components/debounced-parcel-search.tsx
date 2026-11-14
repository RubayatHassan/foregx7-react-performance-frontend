"use client";

import { memo, useEffect, useState } from "react";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { Icon } from "./icon";

export const DebouncedParcelSearch = memo(function DebouncedParcelSearch({
  onSearch,
}: {
  onSearch: (value: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const query = useDebouncedValue(draft, 300);

  useEffect(() => onSearch(query), [onSearch, query]);

  return (
    <label className="table-search">
      <Icon name="search" size={15} />
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search by tracking number…"
        aria-label="Search parcels"
      />
    </label>
  );
});
