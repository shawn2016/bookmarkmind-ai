import{r as w,g as T,R as j,c as s}from"./globe-2DA5Xby1.js";const z={},S=e=>{let t;const a=new Set,n=(u,y)=>{const d=typeof u=="function"?u(t):u;if(!Object.is(d,t)){const i=t;t=y??(typeof d!="object"||d===null)?d:Object.assign({},t,d),a.forEach(h=>h(t,i))}},r=()=>t,f={setState:n,getState:r,getInitialState:()=>v,subscribe:u=>(a.add(u),()=>a.delete(u)),destroy:()=>{(z?"production":void 0)!=="production"&&console.warn("[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."),a.clear()}},v=t=e(n,r,f);return f},V=e=>e?S(e):S;var _={exports:{}},$={},A={exports:{}},L={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var p=w;function C(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var R=typeof Object.is=="function"?Object.is:C,D=p.useState,P=p.useEffect,F=p.useLayoutEffect,O=p.useDebugValue;function B(e,t){var a=t(),n=D({inst:{value:a,getSnapshot:t}}),r=n[0].inst,o=n[1];return F(function(){r.value=a,r.getSnapshot=t,b(r)&&o({inst:r})},[e,a,t]),P(function(){return b(r)&&o({inst:r}),e(function(){b(r)&&o({inst:r})})},[e]),O(a),a}function b(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!R(e,a)}catch{return!0}}function H(e,t){return t()}var U=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?H:B;L.useSyncExternalStore=p.useSyncExternalStore!==void 0?p.useSyncExternalStore:U;A.exports=L;var q=A.exports;/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var k=w,W=q;function Z(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var N=typeof Object.is=="function"?Object.is:Z,X=W.useSyncExternalStore,G=k.useRef,K=k.useEffect,J=k.useMemo,Q=k.useDebugValue;$.useSyncExternalStoreWithSelector=function(e,t,a,n,r){var o=G(null);if(o.current===null){var c={hasValue:!1,value:null};o.current=c}else c=o.current;o=J(function(){function f(i){if(!v){if(v=!0,u=i,i=n(i),r!==void 0&&c.hasValue){var h=c.value;if(r(h,i))return y=h}return y=i}if(h=y,N(u,i))return h;var M=n(i);return r!==void 0&&r(h,M)?(u=i,h):(u=i,y=M)}var v=!1,u,y,d=a===void 0?null:a;return[function(){return f(t())},d===null?void 0:function(){return f(d())}]},[t,a,n,r]);var l=X(e,o[0],o[1]);return K(function(){c.hasValue=!0,c.value=l},[l]),Q(l),l};_.exports=$;var Y=_.exports;const ee=T(Y),I={},{useDebugValue:te}=j,{useSyncExternalStoreWithSelector:ne}=ee;let E=!1;const ae=e=>e;function re(e,t=ae,a){(I?"production":void 0)!=="production"&&a&&!E&&(console.warn("[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"),E=!0);const n=ne(e.subscribe,e.getState,e.getServerState||e.getInitialState,t,a);return te(n),n}const x=e=>{(I?"production":void 0)!=="production"&&typeof e!="function"&&console.warn("[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`.");const t=typeof e=="function"?V(e):e,a=(n,r)=>re(t,n,r);return Object.assign(a,t),a},he=e=>e?x(e):x,g={small:.9,medium:1,large:1.12};function oe(e){return e==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e}function se(e,t=document.documentElement){const a=oe(e.theme);t.setAttribute("data-theme",a),t.setAttribute("data-lang",e.language),t.style.setProperty("--bm-text-scale",String(g[e.fontSize]));const n=g[e.fontSize];t.style.setProperty("--bm-text-xs",`${Math.round(11*n)}px`),t.style.setProperty("--bm-text-sm",`${Math.round(12*n)}px`),t.style.setProperty("--bm-text-base",`${Math.round(13*n)}px`),t.style.setProperty("--bm-text-md",`${Math.round(14*n)}px`),t.style.setProperty("--bm-text-lg",`${Math.round(15*n)}px`),t.style.setProperty("--bm-text-xl",`${Math.round(18*n)}px`),t.style.setProperty("--bm-text-2xl",`${Math.round(22*n)}px`)}let m=null;function fe(e,t=document.documentElement){m&&(window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change",m),m=null),e.theme==="system"&&(m=()=>se(e,t),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",m))}/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ye=s("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pe=s("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=s("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ve=s("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke=s("EyeOff",[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const be=s("FolderInput",[["path",{d:"M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1",key:"fm4g5t"}],["path",{d:"M2 13h10",key:"pgb2dq"}],["path",{d:"m9 16 3-3-3-3",key:"6m91ic"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Me=s("FolderTree",[["path",{d:"M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",key:"hod4my"}],["path",{d:"M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",key:"w4yl2u"}],["path",{d:"M3 5a2 2 0 0 0 2 2h3",key:"f2jnh7"}],["path",{d:"M3 3v13a2 2 0 0 0 2 2h3",key:"k8epm1"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=s("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=s("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe=s("SquareCheckBig",[["path",{d:"M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5",key:"1uzm8b"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge=s("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we=s("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e=s("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),ce=36,ue=64,ie=48,le=.67;function $e(e,t=!1){const a=e.size??ie,n=Math.max(ce,Math.min(ue,a));return t?Math.round(n*le):n}function Ae(e){const a=Date.now()-e,n=Math.floor(a/1e3),r=Math.floor(n/60),o=Math.floor(r/60),c=Math.floor(o/24),l=Math.floor(c/30),f=Math.floor(c/365);return n<60?"刚刚":r<60?`${r} 分钟前`:o<24?`${o} 小时前`:c<30?`${c} 天前`:l<12?`${l} 个月前`:`${f} 年前`}function Le(e,t=40){if(e.length<=t)return e;try{const a=new URL(e),n=a.hostname,r=a.pathname+a.search,o=t-n.length-3;return o>0&&r.length>o?n+r.slice(0,o)+"…":n}catch{return e.slice(0,t-1)+"…"}}function Ie(e){try{return`https://www.google.com/s2/favicons?domain=${new URL(e).hostname}&sz=32`}catch{return""}}export{ue as B,pe as C,ke as E,be as F,Se as I,Ee as S,ge as T,_e as X,se as a,Ie as b,he as c,ve as d,xe as e,Ae as f,$e as g,Me as h,me as i,ye as j,we as k,ce as l,Le as t,fe as w};
