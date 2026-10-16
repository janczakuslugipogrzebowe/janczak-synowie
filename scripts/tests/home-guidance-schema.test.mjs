import test from "node:test";
import assert from "node:assert/strict";
import {DEFAULT_HOME_GUIDANCE,parseHomeGuidance,safeGuidanceImage} from "../../src/lib/home-guidance/schema.ts";

test("default third-home-section content is valid",()=>{
 const content=parseHomeGuidance(DEFAULT_HOME_GUIDANCE);
 assert.equal(content.steps.length,4);
 assert.equal(content.offerButtonHref,"/oferta");
});
test("missing optional design sliders inherit safe defaults",()=>{
 const {headingScale,overlayOpacity,spacingScale,...legacy}=DEFAULT_HOME_GUIDANCE;
 const content=parseHomeGuidance(legacy);
 assert.equal(content.headingScale,headingScale);
 assert.equal(content.overlayOpacity,overlayOpacity);
 assert.equal(content.spacingScale,spacingScale);
});
test("malformed data, unsafe image and external link are rejected",()=>{
 assert.throws(()=>parseHomeGuidance({...DEFAULT_HOME_GUIDANCE,randomField:"bad"}));
 assert.throws(()=>parseHomeGuidance({...DEFAULT_HOME_GUIDANCE,imageUrl:"javascript:alert(1)"}));
 assert.throws(()=>parseHomeGuidance({...DEFAULT_HOME_GUIDANCE,offerButtonHref:"https://example.com/"}));
 assert.equal(safeGuidanceImage("/co-zrobic-home.png"),true);
});
test("four validated steps, no unknown fields and no control characters",()=>{
 assert.throws(()=>parseHomeGuidance({...DEFAULT_HOME_GUIDANCE,steps:[DEFAULT_HOME_GUIDANCE.steps[0]]}));
 assert.throws(()=>parseHomeGuidance({...DEFAULT_HOME_GUIDANCE,steps:DEFAULT_HOME_GUIDANCE.steps.map((step,i)=>i===0?{...step,other:true}:step)}));
 assert.throws(()=>parseHomeGuidance({...DEFAULT_HOME_GUIDANCE,steps:DEFAULT_HOME_GUIDANCE.steps.map((step,i)=>i===0?{...step,title:"Wrong\nname"}:step)}));
});
test("responsive values stay within bounds",()=>{
 assert.throws(()=>parseHomeGuidance({...DEFAULT_HOME_GUIDANCE,headingScale:300}));
 assert.throws(()=>parseHomeGuidance({...DEFAULT_HOME_GUIDANCE,panelOpacity:0}));
});
