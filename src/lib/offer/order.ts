/** Swap within one category while keeping every other category's relative order unchanged. */
export function moveOfferService<T extends { id: string; categoryId: string }>(
  items: T[],
  id: string,
  direction: number,
): T[] {
  if (direction !== -1 && direction !== 1) return items;
  const item = items.find((entry) => entry.id === id);
  if (!item) return items;
  const positions = items.flatMap((entry, index) => (entry.categoryId === item.categoryId ? [index] : []));
  const selected = positions.findIndex((index) => items[index]?.id === id);
  if (selected < 0 || positions[selected + direction] === undefined) return items;
  const copy = [...items];
  const target = positions[selected + direction];
  [copy[positions[selected]], copy[target]] = [copy[target], copy[positions[selected]]];
  return copy;
}
