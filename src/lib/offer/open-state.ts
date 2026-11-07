/** Open drawers are tracked per category, not as a single selected service. */
export type OfferOpenState = Record<string, readonly string[]>;

export function openedServices(
  state: OfferOpenState,
  categoryId: string,
  defaultServiceId?: string,
): readonly string[] {
  return state[categoryId] ?? (defaultServiceId ? [defaultServiceId] : []);
}

/** Opening a new service must never close another one. */
export function toggleOfferService(
  state: OfferOpenState,
  categoryId: string,
  serviceId: string,
  defaultServiceId?: string,
): OfferOpenState {
  const current = openedServices(state, categoryId, defaultServiceId);
  return {
    ...state,
    [categoryId]: current.includes(serviceId)
      ? current.filter((id) => id !== serviceId)
      : [...current, serviceId],
  };
}

/** A deep link expands its target without closing any already open drawers. */
export function expandOfferService(
  state: OfferOpenState,
  categoryId: string,
  serviceId: string,
  defaultServiceId?: string,
): OfferOpenState {
  const current = openedServices(state, categoryId, defaultServiceId);
  return current.includes(serviceId) ? state : { ...state, [categoryId]: [...current, serviceId] };
}
