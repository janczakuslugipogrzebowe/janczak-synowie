/** Pure gallery Explorer operations; no dependency on the browser or Firebase. */
export function selectGalleryRange(ids: string[], anchor: string | null, current: string): string[] {
  const b = ids.indexOf(current);
  if (b === -1) return [];
  const raw = ids.indexOf(anchor ?? current);
  const a = raw === -1 ? b : raw;
  return ids.slice(Math.min(a, b), Math.max(a, b) + 1);
}
export function galleryTransfer<
  T extends {
    id: string;
    albumId?: string;
  },
>(
  ids: string[],
  destination: string,
  entries: T[],
  resolveAlbum: (entry: T) => string = (entry) => entry.albumId ?? "",
): {
  moves: Record<string, string>;
  previous: Record<string, string>;
} {
  const allowed = new Map(entries.map((entry) => [entry.id, entry]));
  const moves: Record<string, string> = {},
    previous: Record<string, string> = {};
  for (const id of new Set(ids)) {
    const entry = allowed.get(id);
    if (!entry) continue;
    const old = resolveAlbum(entry);
    if (old === destination) continue;
    moves[id] = destination;
    previous[id] = old;
  }
  return { moves, previous };
}
