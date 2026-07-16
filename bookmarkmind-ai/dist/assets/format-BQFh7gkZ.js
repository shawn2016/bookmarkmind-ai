import{r as w,g as T,R as j,c as s}from"./globe-2DA5Xby1.js";const P={},g=e=>{let t;const n=new Set,r=(u,y)=>{const d=typeof u=="function"?u(t):u;if(!Object.is(d,t)){const i=t;t=y??(typeof d!="object"||d===null)?d:Object.assign({},t,d),n.forEach(h=>h(t,i))}},a=()=>t,f={setState:r,getState:a,getInitialState:()=>v,subscribe:u=>(n.add(u),()=>n.delete(u)),destroy:()=>{(P?"production":void 0)!=="production"&&console.warn("[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."),n.clear()}},v=t=e(r,a,f);return f},R=e=>e?g(e):g;var $={exports:{}},_={},A={exports:{}},I={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var p=w;function z(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var C=typeof Object.is=="function"?Object.is:z,V=p.useState,D=p.useEffect,F=p.useLayoutEffect,O=p.useDebugValue;function W(e,t){var n=t(),r=V({inst:{value:n,getSnapshot:t}}),a=r[0].inst,o=r[1];return F(function(){a.value=n,a.getSnapshot=t,k(a)&&o({inst:a})},[e,n,t]),D(function(){return k(a)&&o({inst:a}),e(function(){k(a)&&o({inst:a})})},[e]),O(n),n}function k(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!C(e,n)}catch{return!0}}function B(e,t){return t()}var U=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?B:W;I.useSyncExternalStore=p.useSyncExternalStore!==void 0?p.useSyncExternalStore:U;A.exports=I;var q=A.exports;/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var b=w,H=q;function Z(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var N=typeof Object.is=="function"?Object.is:Z,X=H.useSyncExternalStore,G=b.useRef,K=b.useEffect,J=b.useMemo,Q=b.useDebugValue;_.useSyncExternalStoreWithSelector=function(e,t,n,r,a){var o=G(null);if(o.current===null){var c={hasValue:!1,value:null};o.current=c}else c=o.current;o=J(function(){function f(i){if(!v){if(v=!0,u=i,i=r(i),a!==void 0&&c.hasValue){var h=c.value;if(a(h,i))return y=h}return y=i}if(h=y,N(u,i))return h;var S=r(i);return a!==void 0&&a(h,S)?(u=i,h):(u=i,y=S)}var v=!1,u,y,d=n===void 0?null:n;return[function(){return f(t())},d===null?void 0:function(){return f(d())}]},[t,n,r,a]);var l=X(e,o[0],o[1]);return K(function(){c.hasValue=!0,c.value=l},[l]),Q(l),l};$.exports=_;var Y=$.exports;const ee=T(Y),L={},{useDebugValue:te}=j,{useSyncExternalStoreWithSelector:ne}=ee;let x=!1;const re=e=>e;function ae(e,t=re,n){(L?"production":void 0)!=="production"&&n&&!x&&(console.warn("[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"),x=!0);const r=ne(e.subscribe,e.getState,e.getServerState||e.getInitialState,t,n);return te(r),r}const M=e=>{(L?"production":void 0)!=="production"&&typeof e!="function"&&console.warn("[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`.");const t=typeof e=="function"?R(e):e,n=(r,a)=>ae(t,r,a);return Object.assign(n,t),n},ye=e=>e?M(e):M,E={small:.9,medium:1,large:1.12};function oe(e){return e==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e}function se(e,t=document.documentElement){const n=oe(e.theme);t.setAttribute("data-theme",n),t.setAttribute("data-lang",e.language),t.style.setProperty("--bm-text-scale",String(E[e.fontSize]));const r=E[e.fontSize];t.style.setProperty("--bm-text-xs",`${Math.round(11*r)}px`),t.style.setProperty("--bm-text-sm",`${Math.round(12*r)}px`),t.style.setProperty("--bm-text-base",`${Math.round(13*r)}px`),t.style.setProperty("--bm-text-md",`${Math.round(14*r)}px`),t.style.setProperty("--bm-text-lg",`${Math.round(15*r)}px`),t.style.setProperty("--bm-text-xl",`${Math.round(18*r)}px`),t.style.setProperty("--bm-text-2xl",`${Math.round(22*r)}px`)}let m=null;function pe(e,t=document.documentElement){m&&(window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change",m),m=null),e.theme==="system"&&(m=()=>se(e,t),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",m))}function ce(e,t){const n=e.replace(/[.+?^${}()|[\]\\]/g,"\\$&").replace(/\*/g,".*").replace(/\\\./g,"\\.");return new RegExp(`^${n}$`,"i").test(t)}function ue(e,t){return e.some(n=>ce(n,t))}function me(e){try{return`*://${new URL(e).hostname}/*`}catch{return""}}function ve(e){return e.startsWith("chrome://")||e.startsWith("chrome-extension://")||e.startsWith("chrome-web-store://")||e.startsWith("about:")||e.startsWith("edge://")||e.startsWith("brave://")}function be(){return document.contentType==="application/pdf"}function ke(){return window!==window.top}function Se(e){const t=e.match(/\*:\/\/(?:\*\.)?([^/*]+)/i);return t!=null&&t[1]?t[1]:e||"未知站点"}function ge(e,t){if(!e.enabled)return!1;const n=ue(e.disabledSites,t);return e.whitelistMode?n:!n}const ie=36,le=64,de=48,he=.67;function xe(e,t=!1){const n=e.size??de,r=Math.max(ie,Math.min(le,n));return t?Math.round(r*he):r}/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Me=s("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=s("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we=s("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e=s("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e=s("EyeOff",[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=s("FolderInput",[["path",{d:"M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1",key:"fm4g5t"}],["path",{d:"M2 13h10",key:"pgb2dq"}],["path",{d:"m9 16 3-3-3-3",key:"6m91ic"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=s("FolderTree",[["path",{d:"M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",key:"hod4my"}],["path",{d:"M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",key:"w4yl2u"}],["path",{d:"M3 5a2 2 0 0 0 2 2h3",key:"f2jnh7"}],["path",{d:"M3 3v13a2 2 0 0 0 2 2h3",key:"k8epm1"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=s("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te=s("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=s("SquareCheckBig",[["path",{d:"M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5",key:"1uzm8b"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pe=s("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=s("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze=s("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);function Ce(e){const n=Date.now()-e,r=Math.floor(n/1e3),a=Math.floor(r/60),o=Math.floor(a/60),c=Math.floor(o/24),l=Math.floor(c/30),f=Math.floor(c/365);return r<60?"刚刚":a<60?`${a} 分钟前`:o<24?`${o} 小时前`:c<30?`${c} 天前`:l<12?`${l} 个月前`:`${f} 年前`}function Ve(e,t=40){if(e.length<=t)return e;try{const n=new URL(e),r=n.hostname,a=n.pathname+n.search,o=t-r.length-3;return o>0&&a.length>o?r+a.slice(0,o)+"…":r}catch{return e.slice(0,t-1)+"…"}}function De(e){try{return`https://www.google.com/s2/favicons?domain=${new URL(e).hostname}&sz=32`}catch{return""}}export{le as B,Ee as C,_e as E,Ae as F,Le as I,Te as S,Pe as T,ze as X,se as a,me as b,ye as c,De as d,$e as e,Ce as f,xe as g,je as h,Ie as i,we as j,Me as k,Re as l,ve as m,be as n,ke as o,ie as p,Se as q,ge as s,Ve as t,pe as w};
