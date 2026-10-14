import test from "node:test";
import assert from "node:assert/strict";
import {PAGE_DEFAULTS,PAGE_SLUGS,isPageSlug,parsePageContent} from "../../src/lib/pages/schema.ts";
test("all known pages have valid initial content",()=>{for(const slug of PAGE_SLUGS){assert.equal(isPageSlug(slug),true);assert.deepEqual(parsePageContent(PAGE_DEFAULTS[slug]),PAGE_DEFAULTS[slug]);}});
test("unexpected fields and unsafe values cannot be saved",()=>{assert.throws(()=>parsePageContent({...PAGE_DEFAULTS["o-nas"],admin:true}));assert.throws(()=>parsePageContent({...PAGE_DEFAULTS.oferta,title:""}));assert.throws(()=>parsePageContent({...PAGE_DEFAULTS.kontakt,description:"A\nB\u0000"}));});
