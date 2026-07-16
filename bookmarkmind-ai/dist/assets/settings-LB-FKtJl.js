import{c as s}from"./globe-2DA5Xby1.js";function r(e){if(!e)return"收藏失败，请重试";const a=e.toLowerCase();return a.includes("503")||a.includes("service unavailable")?"收藏失败：无法写入 Chrome 书签":a.includes("timeout")||a.includes("超时")?"收藏失败，请重试":a.includes("permission")||a.includes("权限")?"收藏失败：无法写入 Chrome 书签":"收藏失败，请重试"}function i(e,a){const c=(a==null?void 0:a.quickLabel)??"已快速收藏";return e.success?e.classified&&e.category?{type:"success",message:`已收藏并归入「${e.category}」`}:{type:"success",message:c}:{type:"error",message:r(e.error)}}function n(){return{type:"warning",message:"已收藏（智能分类暂不可用）"}}function l(e){return{type:"success",message:`已收藏并归入「${e}」`}}/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=s("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=s("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);export{o as S,u as a,n as b,l as c,i as g};
