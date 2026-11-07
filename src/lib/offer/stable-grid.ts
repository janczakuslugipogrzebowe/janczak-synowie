/** Intrinsic dimensions of a service, including its heading and expanded details. */
export type ServiceDimensions = {
  header: number;
  detail: number;
};

const validHeight = (value: number): number => (Number.isFinite(value) ? Math.max(0, value) : 0);

/** Height needed by the tallest fully expanded service in the active category. */
export function tallestServiceCardHeight(entries: readonly ServiceDimensions[]): number {
  if (!entries.length) return 0;
  return Math.ceil(
    Math.max(...entries.map(({ header, detail }) => validHeight(header) + validHeight(detail))),
  );
}

/**
 * The grid must not move the next section when the user switches from an open
 * service to another open service, including one in a different grid row.
 *
 * Reserve a stable minimum height for the GRID, not each card. Collapsed cards
 * keep their natural compact height. The opened card alone receives the common
 * expanded-card minimum height.
 */
export function expandedOfferGridHeight(
  entries: readonly ServiceDimensions[],
  columns: number,
  gap: number,
): number {
  if (!entries.length) return 0;
  const count = Math.max(1, Math.floor(columns) || 1);
  const rowHeaders: number[] = [];
  entries.forEach(({ header }, index) => {
    const row = Math.floor(index / count);
    rowHeaders[row] = Math.max(rowHeaders[row] ?? 0, validHeight(header));
  });
  const totalCollapsed = rowHeaders.reduce((sum, height) => sum + height, 0);
  const expanded = tallestServiceCardHeight(entries);
  const mostSpaceNeeded = Math.max(...rowHeaders.map((height) => totalCollapsed - height + expanded));
  return Math.ceil(mostSpaceNeeded + Math.max(0, rowHeaders.length - 1) * validHeight(gap));
}
