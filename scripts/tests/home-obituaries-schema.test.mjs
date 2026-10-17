import test from "node:test";
import assert from "node:assert/strict";
import {DEFAULT_HOME_OBITUARIES,parseHomeObituaries} from "../../src/lib/home-obituaries/schema.ts";
test("default content uses expected image and settings",()=>{assert.deepEqual(parseHomeObituaries(DEFAULT_HOME_OBITUARIES),DEFAULT_HOME_OBITUARIES);assert.equal(DEFAULT_HOME_OBITUARIES.imageUrl,"/nekrolog-home.png");});
test("rejects unknown fields and harmful paths",()=>{assert.throws(()=>parseHomeObituaries({...DEFAULT_HOME_OBITUARIES,uid:"admin"}));assert.throws(()=>parseHomeObituaries({...DEFAULT_HOME_OBITUARIES,imageUrl:"https://example.com/a.png"}));assert.throws(()=>parseHomeObituaries({...DEFAULT_HOME_OBITUARIES,imageUrl:"/../secret.png"}));});
test("limits responsive settings and number of entries",()=>{assert.throws(()=>parseHomeObituaries({...DEFAULT_HOME_OBITUARIES,headingScale:1000}));assert.throws(()=>parseHomeObituaries({...DEFAULT_HOME_OBITUARIES,visibleCount:40}));assert.throws(()=>parseHomeObituaries({...DEFAULT_HOME_OBITUARIES,imagePositionX:-1}));assert.equal(parseHomeObituaries({...DEFAULT_HOME_OBITUARIES,visibleCount:1}).visibleCount,1);});
