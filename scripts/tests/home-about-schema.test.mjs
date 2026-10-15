import test from "node:test";
import assert from "node:assert/strict";
import {DEFAULT_HOME_ABOUT,parseHomeAbout,safeAboutImage,safeAboutLink} from "../../src/lib/home-about/schema.ts";

test("default homepage About content is valid",()=>{
  assert.deepEqual(parseHomeAbout(DEFAULT_HOME_ABOUT),DEFAULT_HOME_ABOUT);
});
test("legacy documents without design controls receive safe defaults",()=>{
  const legacy={...DEFAULT_HOME_ABOUT};
  delete legacy.headingScale;delete legacy.spacingScale;
  assert.deepEqual(parseHomeAbout(legacy),DEFAULT_HOME_ABOUT);
});
test("rejects unexpected fields and script injection",()=>{
  assert.throws(()=>parseHomeAbout({...DEFAULT_HOME_ABOUT,admin:true}));
  assert.throws(()=>parseHomeAbout({...DEFAULT_HOME_ABOUT,buttonHref:"javascript:alert(1)"}));
  assert.throws(()=>parseHomeAbout({...DEFAULT_HOME_ABOUT,imageUrl:"https://evil.example/x.png"}));
  assert.throws(()=>parseHomeAbout({...DEFAULT_HOME_ABOUT,headline:""}));
  assert.throws(()=>parseHomeAbout({...DEFAULT_HOME_ABOUT,description:"test\u0000"}));
});
test("responsive settings cannot exceed the approved bounds",()=>{
  assert.throws(()=>parseHomeAbout({...DEFAULT_HOME_ABOUT,headingScale:160}));
  assert.throws(()=>parseHomeAbout({...DEFAULT_HOME_ABOUT,imagePositionX:-1}));
  assert.throws(()=>parseHomeAbout({...DEFAULT_HOME_ABOUT,spacingScale:100.5}));
  assert.equal(parseHomeAbout({...DEFAULT_HOME_ABOUT,headingScale:115}).headingScale,115);
});
test("trusted image and navigation URLs are accepted",()=>{
  assert.equal(safeAboutImage("/o-nas-home.png"),true);
  assert.equal(safeAboutImage("https://cdn.public.blob.vercel-storage.com/intro.png"),true);
  assert.equal(safeAboutImage("https://cdn.public.blob.vercel-storage.com.evil.com/p.png"),false);
  assert.equal(safeAboutLink("/o-nas"),true);
  assert.equal(safeAboutLink("//evil.test"),false);
});
