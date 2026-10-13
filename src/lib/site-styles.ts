/**
 * Critical layout styling emitted directly into the document <head>.
 * The header stays styled even if Tailwind's generated CSS temporarily fails to load.
 * When the full site is built, the design system can be moved to regular CSS.
 */
export const siteStyles = String.raw`
:root { color-scheme: light; --js-ink:#101a18; --js-gold:#dec596; --js-gold-strong:#bd9757; --js-cream:#f8f6f0; }
html { scroll-behavior:smooth; min-width:320px; background:var(--js-cream); }
body { margin:0; min-height:100vh; color:var(--js-ink); background:var(--js-cream); font-family:Arial,Helvetica,sans-serif; -webkit-font-smoothing:antialiased; }
*,*::before,*::after { box-sizing:border-box; }
button {font:inherit;} a {color:inherit;text-decoration:none;}
.js-skip { position:fixed; z-index:9999; left:20px; top:-90px; padding:13px 18px; border-radius:8px; background:#fff; color:#111; box-shadow:0 8px 32px #0003; }
.js-skip:focus { top:14px; }
.js-header { position:sticky; top:0; z-index:200; width:100%; color:var(--js-gold); background:rgba(12,19,18,.89); border-bottom:1px solid rgba(210,174,109,.22); -webkit-backdrop-filter:blur(22px) saturate(140%); backdrop-filter:blur(22px) saturate(140%); box-shadow:0 10px 26px rgba(10,18,15,.09); }
.js-header-inner { max-width:1536px; min-height:88px; padding:0 clamp(22px,3.7vw,68px); margin:0 auto; display:flex; align-items:center; gap:clamp(24px,3vw,54px); }
.js-brand { display:flex; flex-direction:column; flex:0 0 auto; justify-content:center; gap:5px; min-width:222px; }
.js-brand-title { font-family:Georgia,'Times New Roman',serif; font-size:clamp(19px,1.55vw,24px); font-weight:400; letter-spacing:-.7px; line-height:1.08; color:#f3e8d1; }
.js-brand-subtitle { font-size:9px; font-weight:600; line-height:1.3; letter-spacing:2.5px; color:#bb9f70; }
.js-nav { display:flex; flex:1; align-items:center; justify-content:flex-end; gap:clamp(14px,1.65vw,29px); min-width:0; }
.js-nav-link { display:inline-flex; position:relative; align-items:center; white-space:nowrap; min-height:42px; font-size:12px; font-weight:500; line-height:1.2; color:#dbcca9; letter-spacing:.14px; transition:color .2s ease; }
.js-nav-link::after { content:""; position:absolute; bottom:5px; left:0; width:0; height:1px; background:#e9cd92; transition:width .22s ease; }
.js-nav-link:hover, .js-nav-link:focus-visible, .js-nav-link[aria-current='page'] { color:#fff2d4; }
.js-nav-link:hover::after, .js-nav-link[aria-current='page']::after {width:100%;}
.js-contact { display:inline-flex; flex:0 0 auto; justify-content:center; align-items:center; gap:11px; min-height:41px; padding:0 19px; border:1px solid rgba(218,185,129,.66); background:rgba(224,192,135,.11); border-radius:100px; font-size:11px; font-weight:600; letter-spacing:.4px; white-space:nowrap; color:#f0d3a0; transition:background .2s ease,transform .2s ease,border .2s ease; }
.js-contact:hover { background:rgba(224,192,135,.21); border-color:#f4d7a3; transform:translateY(-1px); }
.js-contact-arrow { width:14px; height:14px; display:inline-block; font-size:15px; line-height:14px; }
.js-menu-toggle { display:none; justify-content:center; align-items:center; flex-direction:column; gap:5px; flex:0 0 42px; width:42px; height:42px; padding:0; margin-left:auto; border:1px solid rgba(220,194,146,.38); border-radius:9px; background:transparent; cursor:pointer; }
.js-menu-toggle span { display:block; width:19px; height:1.5px; background:#f0d3a0; border-radius:2px; }
.js-mobile-nav { display:none; }
.js-home { position:relative; min-height:calc(100svh - 88px); overflow:hidden; isolation:isolate; background: radial-gradient(ellipse 68% 58% at 92% 26%, rgba(210,188,149,.18), transparent 75%), radial-gradient(ellipse 47% 62% at -10% 85%, rgba(190,190,167,.14), transparent 75%),linear-gradient(125deg,#fbf9f4 0%,#f4f0e8 57%,#fbfaf7 100%); }
.js-home::before { content:""; position:absolute; top:13%; right:-17%; width:min(64vw,830px); height:min(64vw,830px); border:1px solid rgba(164,137,90,.12); border-radius:50%; pointer-events:none; }
.js-home::after { content:""; position:absolute; top:21%; right:-11%; width:min(50vw,650px); height:min(50vw,650px); border:1px solid rgba(164,137,90,.12); border-radius:50%; pointer-events:none; }
.js-subpage { min-height:calc(100svh - 88px); background:radial-gradient(ellipse at 85% 16%,#eee7d8 0%,transparent 45%),linear-gradient(135deg,#fbf9f5,#f2eee6); padding:clamp(96px,12vw,172px) clamp(24px,8.5vw,160px) 80px; }
.js-subpage-content { width:min(100%,760px); }
.js-eyebrow { display:flex; align-items:center; gap:13px; margin:0 0 28px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:3px; color:#997948; }
.js-eyebrow::before { content:"";display:block;width:30px;height:1px;background:#b79863; }
.js-heading { margin:0 0 27px; font-family:Georgia,'Times New Roman',serif; font-weight:400; font-size:clamp(53px,6vw,88px); line-height:1.02; letter-spacing:-3.1px; color:#17231e; }
.js-description { margin:0; max-width:560px; font-size:clamp(16px,1.2vw,19px); line-height:1.85; color:#62685f; }
.js-separator { margin-top:47px; width:58px; height:1px; background:#baa176; }
.js-header a:focus-visible,.js-header button:focus-visible { outline:2px solid #f9e3b3; outline-offset:5px; }
@media (max-width:1190px) { .js-header-inner { gap:18px; } .js-brand { min-width:184px; } .js-nav { gap:16px; } .js-nav-link { font-size:11px; } .js-contact { padding:0 12px; } }
@media (max-width:995px) {
  .js-header-inner { min-height:74px; padding:0 24px; }
  .js-brand { min-width:0; }
  .js-nav,.js-contact {display:none;}
  .js-menu-toggle {display:flex;}
  .js-mobile-nav[data-open='true'] { display:flex; flex-direction:column; padding:9px 24px 24px; gap:0; background:rgba(12,19,18,.98); border-top:1px solid rgba(210,174,109,.17); }
  .js-mobile-link { display:flex; width:100%; align-items:center; min-height:49px; border-bottom:1px solid rgba(231,209,168,.12); color:#e7d2ab; font-size:14px; }
  .js-mobile-link[aria-current='page'] { color:#fff; }
  .js-home,.js-subpage { min-height:calc(100svh - 74px); }
}
@media (max-width:500px) {
  .js-header-inner { padding:0 18px; }
  .js-brand-title { font-size:20px; }
  .js-brand-subtitle {font-size:8px;letter-spacing:2px;}
  .js-subpage { padding:100px 26px 70px; }
  .js-heading { font-size:52px;letter-spacing:-1.9px; }
}
@media (prefers-reduced-motion: reduce) { .js-nav-link,.js-nav-link::after,.js-contact {transition:none;} }
`;
