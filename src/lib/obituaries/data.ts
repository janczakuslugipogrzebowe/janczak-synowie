import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import {
  obituarySearchName,
  toObituarySlug,
  type ObituaryInput,
  type ObituaryRecord,
  type ObituaryStatus,
  isSafeSlug,
} from "./schema";
import { ObituaryValidationError } from "./schema";

const collection = () => cmsDb().collection("obituaries");
const slugCollection = () => cmsDb().collection("obituarySlugs");
const draftCollection = () => cmsDb().collection("obituaryDrafts");
const code: Record<ObituaryStatus, string> = { draft: "D", published: "P", archived: "A", trash: "T" };
const inverted = (date: string) => String(9999999999999 - Date.parse(date)).padStart(13, "0");
const indexing = (
  status: ObituaryStatus,
  firstName: string,
  lastName: string,
  deathDate: string,
  updatedAt: string,
  id: string,
) => {
  const a = obituarySearchName(firstName, lastName),
    b = obituarySearchName(lastName, firstName);
  const deathSort = deathDate ? inverted(`${deathDate}T00:00:00.000Z`) : "9999999999999";
  return {
    deathKey: `${code[status]}#${deathDate || "0000-00-00"}#${id}`,
    deathSort: `${code[status]}#${deathSort}#${id}`,
    deathSortAll: `${deathSort}#${id}`,
    adminKeyOldest: `${code[status]}#${updatedAt}#${id}`,
    updatedOldest: `${updatedAt}#${id}`,
    searchName: a,
    feedKey: `${code[status]}#${inverted(updatedAt)}#${id}`,
    adminKey: `${code[status]}#${inverted(updatedAt)}#${id}`,
    updatedSort: `${inverted(updatedAt)}#${id}`,
    lastSearchKey: `${code[status]}#${a}`,
    firstSearchKey: `${code[status]}#${b}`,
  };
};
function hydrate(id: string, raw: FirebaseFirestore.DocumentData): ObituaryRecord {
  return {
    id,
    slug: String(raw.slug),
    status: raw.status,
    firstName: raw.firstName,
    lastName: raw.lastName,
    birthDate: raw.birthDate ?? "",
    deathDate: raw.deathDate ?? "",
    ceremonyDate: raw.ceremonyDate ?? "",
    ceremonyPlace: raw.ceremonyPlace ?? "",
    ceremonyAddress: raw.ceremonyAddress ?? "",
    burialPlace: raw.burialPlace ?? "",
    farewell: raw.farewell ?? "",
    symbol: raw.symbol ?? "flower",
    seoIndex: raw.seoIndex === true,
    searchName: raw.searchName ?? "",
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
    publishedAt: raw.publishedAt ?? null,
    updatedBy: raw.updatedBy ?? "",
  };
}
const notice = () => {
  throw new ObituaryValidationError("Nie znaleziono nekrologu.");
};
export async function createObituary(input: ObituaryInput, uid: string, publish: boolean) {
  const id = collection().doc().id,
    base = toObituarySlug(input),
    now = new Date().toISOString(),
    status = publish ? "published" : "draft";
  for (let n = 1; n <= 100; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const slugRef = slugCollection().doc(slug),
      recordRef = collection().doc(id);
    const created = await cmsDb().runTransaction(async (tx) => {
      const slugSnap = await tx.get(slugRef);
      if (slugSnap.exists) return false;
      const record: ObituaryRecord = {
        ...input,
        id,
        slug,
        status,
        createdAt: now,
        updatedAt: now,
        publishedAt: publish ? now : null,
        updatedBy: uid,
        searchName: obituarySearchName(input.firstName, input.lastName),
      };
      tx.create(slugRef, { id });
      tx.create(recordRef, {
        ...record,
        ...indexing(status, input.firstName, input.lastName, input.deathDate, now, id),
      });
      return true;
    });
    if (created) return { id, slug };
  }
  throw new ObituaryValidationError("Nie udało się utworzyć unikalnego adresu nekrologu.");
}
export async function getAdminObituary(id: string) {
  const snap = await collection().doc(id).get();
  if (!snap.exists) return null;
  return hydrate(snap.id, snap.data()!);
}
export async function getAdminObituaryDraft(id: string) {
  const snap = await draftCollection().doc(id).get();
  return snap.exists ? (snap.data()?.content as ObituaryInput) : null;
}
/** Reserve a new canonical slug atomically. Old slugs remain as aliases so published links survive edits. */
async function writeUpdatedObituarySlug(
  id: string,
  input: ObituaryInput,
  uid: string,
  publish: boolean,
  slugOnly = false,
) {
  const ref = collection().doc(id),
    draftRef = draftCollection().doc(id);
  const base = toObituarySlug(input);
  for (let n = 1; n <= 100; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const slugRef = slugCollection().doc(candidate);
    const completed = await cmsDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) notice();
      const current = hydrate(id, snap.data()!);
      if (current.status === "trash") throw new ObituaryValidationError("Najpierw przywróć wpis z kosza.");
      if (!slugOnly && !publish && current.status === "published") {
        // Public version must stay unchanged until publishing; do not rename canonical URL yet.
        tx.set(draftRef, { content: input, updatedAt: new Date().toISOString(), updatedBy: uid });
        return { id, slug: current.slug };
      }
      const reserved = await tx.get(slugRef);
      if (reserved.exists && reserved.data()?.id !== id) return null;
      const now = new Date().toISOString();
      const aliases = Array.isArray(snap.data()?.slugAliases)
        ? (snap.data()!.slugAliases as unknown[]).filter(
            (s): s is string => typeof s === "string" && isSafeSlug(s) && s !== candidate,
          )
        : [];
      if (candidate !== current.slug && !aliases.includes(current.slug)) aliases.push(current.slug);
      const status: ObituaryStatus = slugOnly ? current.status : publish ? "published" : current.status;
      const changes = slugOnly
        ? { slug: candidate, slugAliases: aliases }
        : {
            ...input,
            slug: candidate,
            slugAliases: aliases,
            status,
            ...indexing(status, input.firstName, input.lastName, input.deathDate, now, id),
            updatedAt: now,
            updatedBy: uid,
            publishedAt: publish ? (current.publishedAt ?? now) : null,
          };
      if (!reserved.exists) tx.create(slugRef, { id });
      tx.update(ref, changes);
      if (!slugOnly && publish) tx.delete(draftRef);
      return { id, slug: candidate };
    });
    if (completed) return completed;
  }
  throw new ObituaryValidationError("Nie udało się utworzyć unikalnego adresu nekrologu.");
}
export async function updateObituary(id: string, input: ObituaryInput, uid: string, publish: boolean) {
  return writeUpdatedObituarySlug(id, input, uid, publish);
}
export async function repairObituarySlug(id: string, uid: string) {
  const snap = await collection().doc(id).get();
  if (!snap.exists) notice();
  const data = hydrate(id, snap.data()!);
  const input: ObituaryInput = {
    firstName: data.firstName,
    lastName: data.lastName,
    birthDate: data.birthDate,
    deathDate: data.deathDate,
    ceremonyDate: data.ceremonyDate,
    ceremonyPlace: data.ceremonyPlace,
    ceremonyAddress: data.ceremonyAddress,
    burialPlace: data.burialPlace,
    farewell: data.farewell,
    symbol: data.symbol,
    seoIndex: data.seoIndex,
  };
  return writeUpdatedObituarySlug(id, input, uid, false, true);
}
export async function changeObituaryStatus(
  id: string,
  action: "publish" | "unpublish" | "archive" | "trash" | "restore",
  uid: string,
) {
  const ref = collection().doc(id);
  await cmsDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) notice();
    const old = hydrate(id, snap.data()!);
    if (action === "restore" && old.status !== "trash")
      throw new ObituaryValidationError("Wpis nie jest w koszu.");
    if (action !== "restore" && old.status === "trash")
      throw new ObituaryValidationError("Najpierw przywróć wpis z kosza.");
    const status: ObituaryStatus =
      action === "publish"
        ? "published"
        : action === "archive"
          ? "archived"
          : action === "trash"
            ? "trash"
            : "draft";
    const now = new Date().toISOString();
    tx.update(ref, {
      status,
      ...indexing(status, old.firstName, old.lastName, old.deathDate, now, id),
      updatedAt: now,
      updatedBy: uid,
      publishedAt: status === "published" ? (old.publishedAt ?? now) : null,
    });
  });
}
// Index-only queries: no compound Firestore indexes or paid search services needed.
async function listByPrefix(field: string, prefix: string, limit: number) {
  return (
    await collection()
      .orderBy(field)
      .startAt(prefix)
      .endAt(prefix + "\uf8ff")
      .limit(limit)
      .get()
  ).docs.map((x) => hydrate(x.id, x.data()));
}
export async function getAdminObituariesList(
  status: ObituaryStatus | "all",
  q: string,
  limit = 25,
  cursor = "",
  dateFrom = "",
  dateTo = "",
  sort: "recent" | "oldest" | "death" = "recent",
) {
  const size = Math.min(50, Math.max(1, limit)),
    normalized = obituarySearchName("", q).trim();
  if (dateFrom || dateTo) {
    const pref = status === "all" ? ["D", "P", "A", "T"] : [code[status]];
    const from = dateFrom || "1850-01-01",
      to = dateTo || "2150-12-31";
    const groups = await Promise.all(
      pref.map(async (p) =>
        (
          await collection()
            .orderBy("deathKey")
            .startAt(`${p}#${from}`)
            .endAt(`${p}#${to}\uf8ff`)
            .limit(100)
            .get()
        ).docs.map((x) => hydrate(x.id, x.data())),
      ),
    );
    const matches = groups
      .flat()
      .filter(
        (x) =>
          !normalized ||
          obituarySearchName(x.firstName, x.lastName).includes(normalized) ||
          obituarySearchName(x.lastName, x.firstName).includes(normalized),
      )
      .sort((a, b) =>
        sort === "oldest"
          ? a.updatedAt.localeCompare(b.updatedAt)
          : sort === "death"
            ? b.deathDate.localeCompare(a.deathDate)
            : b.updatedAt.localeCompare(a.updatedAt),
      );
    return { items: matches.slice(0, 100), nextCursor: null, limited: matches.length > 100 };
  }
  if (normalized) {
    const pref = status === "all" ? ["D", "P", "A", "T"] : [code[status]];
    const hits = await Promise.all(
      pref.flatMap((p) => [
        listByPrefix("lastSearchKey", `${p}#${normalized}`, 60),
        listByPrefix("firstSearchKey", `${p}#${normalized}`, 60),
      ]),
    );
    const unique = new Map(hits.flat().map((x) => [x.id, x]));
    const filtered = [...unique.values()].sort((a, b) =>
      sort === "oldest"
        ? a.updatedAt.localeCompare(b.updatedAt)
        : sort === "death"
          ? b.deathDate.localeCompare(a.deathDate)
          : b.updatedAt.localeCompare(a.updatedAt),
    );
    return { items: filtered.slice(0, 100), nextCursor: null, limited: filtered.length > 100 };
  }
  const key =
    status === "all"
      ? sort === "oldest"
        ? "updatedOldest"
        : sort === "death"
          ? "deathSortAll"
          : "updatedSort"
      : sort === "oldest"
        ? "adminKeyOldest"
        : sort === "death"
          ? "deathSort"
          : "adminKey";
  let query = collection()
    .orderBy(key)
    .limit(size + 1);
  if (status !== "all") query = query.startAt(`${code[status]}#`).endAt(`${code[status]}#\uf8ff`);
  if (cursor) {
    const snapshot = await collection().doc(cursor).get();
    if (snapshot.exists && snapshot.get(key)) query = query.startAfter(snapshot);
  }
  const snaps = (await query.get()).docs;
  return {
    items: snaps.slice(0, size).map((x) => hydrate(x.id, x.data())),
    nextCursor: snaps.length > size ? snaps[size - 1].id : null,
    limited: false,
  };
}
export async function getPublicObituaries(q = "", cursor = "", limit = 12) {
  "use cache";
  cacheTag("janczak-obituaries");
  cacheLife("hours");
  if (!hasAdminConfig()) return { items: [] as ObituaryRecord[], nextCursor: null as string | null };
  const size = Math.min(24, Math.max(1, limit)),
    search = obituarySearchName("", q).trim();
  if (search) {
    const [last, first] = await Promise.all([
      listByPrefix("lastSearchKey", `P#${search}`, 60),
      listByPrefix("firstSearchKey", `P#${search}`, 60),
    ]);
    const items = [...new Map([...last, ...first].map((x) => [x.id, x])).values()]
      .filter((x) => x.status === "published")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return { items: items.slice(0, 100), nextCursor: null };
  }
  let query = collection()
    .orderBy("feedKey")
    .startAt("P#")
    .endAt("P#\uf8ff")
    .limit(size + 1);
  if (cursor) {
    const snap = await collection().doc(cursor).get();
    if (snap.exists && snap.data()?.status === "published") query = query.startAfter(snap);
  }
  const snaps = (await query.get()).docs;
  return {
    items: snaps.slice(0, size).map((x) => hydrate(x.id, x.data())),
    nextCursor: snaps.length > size ? snaps[size - 1].id : null,
  };
}
export async function getLatestObituaries() {
  "use cache";
  cacheTag("janczak-obituaries");
  cacheLife("hours");
  if (!hasAdminConfig()) return [] as ObituaryRecord[];
  const snapshots = await collection().orderBy("feedKey").startAt("P#").endAt("P#\uf8ff").limit(12).get();
  return snapshots.docs.map((x) => hydrate(x.id, x.data()));
}
export async function getPublicObituary(slug: string) {
  "use cache";
  cacheTag("janczak-obituaries");
  cacheLife("hours");
  if (!hasAdminConfig() || !isSafeSlug(slug)) return null;
  const ref = await slugCollection().doc(slug).get();
  if (!ref.exists) return null;
  const snap = await collection().doc(String(ref.data()?.id)).get();
  if (!snap.exists || snap.data()?.status !== "published") return null;
  return hydrate(snap.id, snap.data()!);
}
export async function getSitemapObituaries() {
  "use cache";
  cacheTag("janczak-obituaries");
  cacheLife("hours");
  if (!hasAdminConfig()) return [] as { slug: string; updatedAt: string }[];
  const snapshots = await collection().orderBy("feedKey").startAt("P#").endAt("P#\uf8ff").limit(500).get();
  return snapshots.docs
    .filter((x) => x.data().seoIndex === true)
    .map((x) => ({ slug: x.data().slug as string, updatedAt: x.data().updatedAt as string }));
}

export async function deleteObituaryPermanently(id: string) {
  const ref = collection().doc(id),
    draftRef = draftCollection().doc(id);
  await cmsDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) notice();
    if (snap.data()?.status !== "trash")
      throw new ObituaryValidationError("Trwale usunąć można tylko wpis znajdujący się w koszu.");
    const slug = String(snap.data()?.slug ?? "");
    const aliases = Array.isArray(snap.data()?.slugAliases)
      ? snap.data()!.slugAliases.filter((v: unknown): v is string => typeof v === "string" && isSafeSlug(v))
      : [];
    const allSlugs = [...new Set([slug, ...aliases])].filter(isSafeSlug);
    // Read all transaction documents before issuing any writes.
    const refs = allSlugs.map((s) => slugCollection().doc(s));
    const snapshots = await Promise.all(refs.map((r) => tx.get(r)));
    tx.delete(ref);
    tx.delete(draftRef);
    refs.forEach((r, i) => {
      if (snapshots[i].data()?.id === id) tx.delete(r);
    });
  });
}
