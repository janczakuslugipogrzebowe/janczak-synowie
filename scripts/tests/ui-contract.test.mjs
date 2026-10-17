import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,readdirSync} from "node:fs";
import {resolve,join} from "node:path";
const root=resolve(import.meta.dirname,"../..");
const read=(path)=>readFileSync(join(root,path),"utf8");
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(dir,entry.name)):[join(dir,entry.name)]);}

test("no blocking browser dialogs remain in the site",()=>{
  const source=walk(join(root,"src")).filter(name=>/\.(ts|tsx)$/.test(name));
  for(const file of source)assert.doesNotMatch(readFileSync(file,"utf8"),/\b(?:window\.)?(?:alert|confirm|prompt)\s*\(/,file);
});
test("one toast provider covers all admin routes",()=>{
  assert.match(read("src/app/(admin)/admin/layout.tsx"),/<ToastProvider>/);
  assert.match(read("src/components/admin/use-cms-editor.ts"),/notify\.success/);
  assert.match(read("src/components/admin/obituaries-manager.tsx"),/<ConfirmDialog/);
});
test("services sit above the florist photo at the shared curved mask",()=>{
  const services=read("src/components/home-services/home-services-section.tsx");
  const florist=read("src/components/home-florist/home-florist-section.tsx");
  const guidance=read("src/components/home-guidance/home-guidance-section.tsx");
  // Guidance should mask services above; services should mask florist below.
  assert.match(guidance,/relative isolate z-30 overflow-hidden bg-forest-deep/);
  assert.match(guidance,/GUIDANCE_LOWER_MASK/);
  assert.match(services,/followedByFlorist\s*\?\s*"z-20"/);
  assert.match(services,/SERVICES_LOWER_MASK/);
  assert.match(florist,/joinsServices\?"-mt-\[clamp\(48px,6\.9vw,140px\)\]"/);
});
test("home obituary carousel uses arrows without the page counter",()=>{
  const content=read("src/components/home-obituaries/home-obituaries-section.tsx");
  assert.doesNotMatch(content,/>\{start\+1\}–\{Math\.min\(/);
  assert.match(content,/Poprzednie nekrologi/);
  assert.match(content,/Kolejne nekrologi/);
});

test("toast portal waits until hydration completes",()=>{
  const toast=read("src/components/ui/toast-provider.tsx");
  assert.match(toast,/useSyncExternalStore\(subscribeToHydration,getClientSnapshot,getServerSnapshot\)/);
  assert.match(toast,/const getServerSnapshot=\(\)=>false/);
  assert.match(toast,/hasHydrated&&createPortal\(/);
  assert.doesNotMatch(toast,/typeof document\s*!==\s*["']undefined["']/);
});
