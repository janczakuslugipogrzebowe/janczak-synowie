import test from "node:test";
import assert from "node:assert/strict";
import {DEFAULT_HOME_FLORIST,parseHomeFlorist,safeFloristImage,safeFloristHref} from "../../src/lib/home-florist/schema.ts";

test("defaults keep approved florist texts and image path",()=>{
  assert.deepEqual(parseHomeFlorist(DEFAULT_HOME_FLORIST),DEFAULT_HOME_FLORIST);
  assert.equal(DEFAULT_HOME_FLORIST.imageUrl,"/kwiaciarnia-home.png");
  assert.equal(DEFAULT_HOME_FLORIST.features.length,3);
  assert.equal(DEFAULT_HOME_FLORIST.buttonHref,"/oferta");
});
test("reject unexpected fields and tampered feature data",()=>{
  assert.throws(()=>parseHomeFlorist({...DEFAULT_HOME_FLORIST,uid:"admin"}));
  assert.throws(()=>parseHomeFlorist({...DEFAULT_HOME_FLORIST,features:[]}));
  assert.throws(()=>parseHomeFlorist({...DEFAULT_HOME_FLORIST,features:DEFAULT_HOME_FLORIST.features.map((f,i)=>i===0?{...f,html:"<script>"}:f)}));
  assert.throws(()=>parseHomeFlorist({...DEFAULT_HOME_FLORIST,headline:""}));
});
test("all proportions and photo controls are bounded",()=>{
  assert.throws(()=>parseHomeFlorist({...DEFAULT_HOME_FLORIST,overlayOpacity:101}));
  assert.throws(()=>parseHomeFlorist({...DEFAULT_HOME_FLORIST,leftShade:-2}));
  assert.throws(()=>parseHomeFlorist({...DEFAULT_HOME_FLORIST,imagePositionX:102}));
  assert.throws(()=>parseHomeFlorist({...DEFAULT_HOME_FLORIST,iconScale:200}));
  assert.equal(parseHomeFlorist({...DEFAULT_HOME_FLORIST,descriptionScale:112}).descriptionScale,112);
});
test("photographs restricted to local paths or public Vercel Blob",()=>{
  assert.equal(safeFloristImage("/kwiaciarnia-home.png"),true);
  assert.equal(safeFloristImage("https://img.public.blob.vercel-storage.com/a.webp"),true);
  assert.equal(safeFloristImage("//attacker.test/a.png"),false);
  assert.equal(safeFloristImage("/../secrets.png"),false);
  assert.equal(safeFloristImage("javascript:alert(1)"),false);
  assert.equal(safeFloristImage("https://img.public.blob.vercel-storage.com.attacker.test/a.png"),false);
  assert.throws(()=>parseHomeFlorist({...DEFAULT_HOME_FLORIST,imageUrl:"https://attacker.test/p.png"}));
});
test("CTA points only into the offer page",()=>{
  assert.equal(safeFloristHref("/oferta"),true);
  assert.equal(safeFloristHref("/oferta#kwiaciarnia"),true);
  assert.equal(safeFloristHref("/oferta#%20"),false);
  assert.equal(safeFloristHref("javascript:alert(1)"),false);
  assert.equal(safeFloristHref("//attacker.test"),false);
  assert.throws(()=>parseHomeFlorist({...DEFAULT_HOME_FLORIST,buttonHref:"https://attacker.test"}));
});
