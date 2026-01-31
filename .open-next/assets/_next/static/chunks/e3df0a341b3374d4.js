(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,9165,e=>{"use strict";let t=e.i(47167).default.env.NEXT_PUBLIC_API_URL||"http://localhost:3000";class a extends Error{message;status;data;constructor(e,t,a){super(e),this.message=e,this.status=t,this.data=a,this.name="ApiError"}}async function r(e,i={}){let{method:o="GET",body:s,headers:n={}}=i,l={method:o,headers:{...n},credentials:"include",...!1};s instanceof FormData?l.body=s:void 0!==s&&(l.body=JSON.stringify(s),l.headers={...l.headers,"Content-Type":"application/json"});try{let r=await fetch(`${t}${e}`,l),i=await r.json();if(!r.ok||!i.success)throw new a(i.error||"Something went wrong",r.status,i);return i.data}catch(e){if(e instanceof a)throw e;throw new a("Network error. Please try again.",0)}}e.s(["accountApi",0,{getProfile:()=>r("/api/account/profile"),updateProfile:e=>r("/api/account/profile",{method:"PATCH",body:e}),getAddresses:()=>r("/api/account/addresses"),addAddress:e=>r("/api/account/addresses",{method:"POST",body:e}),updateAddress:(e,t)=>r(`/api/account/addresses/${e}`,{method:"PATCH",body:t}),deleteAddress:e=>r(`/api/account/addresses/${e}`,{method:"DELETE"}),getOrders:e=>{let t=new URLSearchParams;e?.page&&t.set("page",String(e.page)),e?.limit&&t.set("limit",String(e.limit)),e?.status&&t.set("status",e.status);let a=t.toString();return r(`/api/account/orders${a?`?${a}`:""}`)},getOrder:e=>r(`/api/account/orders/${e}`)},"authApi",0,{sendOtp:e=>r("/api/auth/send-otp",{method:"POST",body:{email:e}}),verifyOtp:e=>r("/api/auth/verify-otp",{method:"POST",body:e}),getMe:()=>r("/api/auth/me"),logout:()=>r("/api/auth/logout",{method:"POST"})},"cartApi",0,{get:()=>r("/api/cart"),addItem:e=>r("/api/cart/add",{method:"POST",body:e}),updateItem:(e,t)=>r(`/api/cart/${e}`,{method:"PATCH",body:t}),removeItem:e=>r(`/api/cart/${e}`,{method:"DELETE"})},"checkoutApi",0,{init:e=>r("/api/checkout/init",{method:"POST",body:e}),applyCoupon:(e,t)=>r("/api/checkout/apply-coupon",{method:"POST",body:{code:e,subtotal:t}}),createPayment:e=>r("/api/checkout/create-payment",{method:"POST",body:e}),verify:e=>r("/api/checkout/verify",{method:"POST",body:e})},"default",0,r])},5766,e=>{"use strict";let t,a;var r,i=e.i(71645);let o={data:""},s=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,n=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,d=(e,t)=>{let a="",r="",i="";for(let o in e){let s=e[o];"@"==o[0]?"i"==o[1]?a=o+" "+s+";":r+="f"==o[1]?d(s,o):o+"{"+d(s,"k"==o[1]?"":t)+"}":"object"==typeof s?r+=d(s,t?t.replace(/([^,])+/g,e=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):o):null!=s&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),i+=d.p?d.p(o,s):o+":"+s+";")}return a+(t&&i?t+"{"+i+"}":i)+r},c={},u=e=>{if("object"==typeof e){let t="";for(let a in e)t+=a+u(e[a]);return t}return e};function p(e){let t,a,r=this||{},i=e.call?e(r.p):e;return((e,t,a,r,i)=>{var o;let p=u(e),m=c[p]||(c[p]=(e=>{let t=0,a=11;for(;t<e.length;)a=101*a+e.charCodeAt(t++)>>>0;return"go"+a})(p));if(!c[m]){let t=p!==e?e:(e=>{let t,a,r=[{}];for(;t=s.exec(e.replace(n,""));)t[4]?r.shift():t[3]?(a=t[3].replace(l," ").trim(),r.unshift(r[0][a]=r[0][a]||{})):r[0][t[1]]=t[2].replace(l," ").trim();return r[0]})(e);c[m]=d(i?{["@keyframes "+m]:t}:t,a?"":"."+m)}let f=a&&c.g?c.g:null;return a&&(c.g=c[m]),o=c[m],f?t.data=t.data.replace(f,o):-1===t.data.indexOf(o)&&(t.data=r?o+t.data:t.data+o),m})(i.unshift?i.raw?(t=[].slice.call(arguments,1),a=r.p,i.reduce((e,r,i)=>{let o=t[i];if(o&&o.call){let e=o(a),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;o=t?"."+t:e&&"object"==typeof e?e.props?"":d(e,""):!1===e?"":e}return e+r+(null==o?"":o)},"")):i.reduce((e,t)=>Object.assign(e,t&&t.call?t(r.p):t),{}):i,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||o})(r.target),r.g,r.o,r.k)}p.bind({g:1});let m,f,h,g=p.bind({k:1});function y(e,t){let a=this||{};return function(){let r=arguments;function i(o,s){let n=Object.assign({},o),l=n.className||i.className;a.p=Object.assign({theme:f&&f()},n),a.o=/ *go\d+/.test(l),n.className=p.apply(a,r)+(l?" "+l:""),t&&(n.ref=s);let d=e;return e[0]&&(d=n.as||e,delete n.as),h&&d[0]&&h(n),m(d,n)}return t?t(i):i}}var b=(e,t)=>"function"==typeof e?e(t):e,v=(t=0,()=>(++t).toString()),w=()=>{if(void 0===a&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");a=!e||e.matches}return a},x="default",E=(e,t)=>{let{toastLimit:a}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return E(e,{type:+!!e.toasts.find(e=>e.id===r.id),toast:r});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(e=>e.id===i||void 0===i?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+o}))}}},O=[],S={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},A={},I=(e,t=x)=>{A[t]=E(A[t]||S,e),O.forEach(([e,a])=>{e===t&&a(A[t])})},C=e=>Object.keys(A).forEach(t=>I(e,t)),k=(e=x)=>t=>{I(t,e)},P={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},T=(e={},t=x)=>{let[a,r]=(0,i.useState)(A[t]||S),o=(0,i.useRef)(A[t]);(0,i.useEffect)(()=>(o.current!==A[t]&&r(A[t]),O.push([t,r]),()=>{let e=O.findIndex(([e])=>e===t);e>-1&&O.splice(e,1)}),[t]);let s=a.toasts.map(t=>{var a,r,i;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(a=e[t.type])?void 0:a.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(r=e[t.type])?void 0:r.duration)||(null==e?void 0:e.duration)||P[t.type],style:{...e.style,...null==(i=e[t.type])?void 0:i.style,...t.style}}});return{...a,toasts:s}},$=e=>(t,a)=>{let r,i=((e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(null==a?void 0:a.id)||v()}))(t,e,a);return k(i.toasterId||(r=i.id,Object.keys(A).find(e=>A[e].toasts.some(e=>e.id===r))))({type:2,toast:i}),i.id},L=(e,t)=>$("blank")(e,t);L.error=$("error"),L.success=$("success"),L.loading=$("loading"),L.custom=$("custom"),L.dismiss=(e,t)=>{let a={type:3,toastId:e};t?k(t)(a):C(a)},L.dismissAll=e=>L.dismiss(void 0,e),L.remove=(e,t)=>{let a={type:4,toastId:e};t?k(t)(a):C(a)},L.removeAll=e=>L.remove(void 0,e),L.promise=(e,t,a)=>{let r=L.loading(t.loading,{...a,...null==a?void 0:a.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let i=t.success?b(t.success,e):void 0;return i?L.success(i,{id:r,...a,...null==a?void 0:a.success}):L.dismiss(r),e}).catch(e=>{let i=t.error?b(t.error,e):void 0;i?L.error(i,{id:r,...a,...null==a?void 0:a.error}):L.dismiss(r)}),e};var j=1e3,D=(e,t="default")=>{let{toasts:a,pausedAt:r}=T(e,t),o=(0,i.useRef)(new Map).current,s=(0,i.useCallback)((e,t=j)=>{if(o.has(e))return;let a=setTimeout(()=>{o.delete(e),n({type:4,toastId:e})},t);o.set(e,a)},[]);(0,i.useEffect)(()=>{if(r)return;let e=Date.now(),i=a.map(a=>{if(a.duration===1/0)return;let r=(a.duration||0)+a.pauseDuration-(e-a.createdAt);if(r<0){a.visible&&L.dismiss(a.id);return}return setTimeout(()=>L.dismiss(a.id,t),r)});return()=>{i.forEach(e=>e&&clearTimeout(e))}},[a,r,t]);let n=(0,i.useCallback)(k(t),[t]),l=(0,i.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),d=(0,i.useCallback)((e,t)=>{n({type:1,toast:{id:e,height:t}})},[n]),c=(0,i.useCallback)(()=>{r&&n({type:6,time:Date.now()})},[r,n]),u=(0,i.useCallback)((e,t)=>{let{reverseOrder:r=!1,gutter:i=8,defaultPosition:o}=t||{},s=a.filter(t=>(t.position||o)===(e.position||o)&&t.height),n=s.findIndex(t=>t.id===e.id),l=s.filter((e,t)=>t<n&&e.visible).length;return s.filter(e=>e.visible).slice(...r?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+i,0)},[a]);return(0,i.useEffect)(()=>{a.forEach(e=>{if(e.dismissed)s(e.id,e.removeDelay);else{let t=o.get(e.id);t&&(clearTimeout(t),o.delete(e.id))}})},[a,s]),{toasts:a,handlers:{updateHeight:d,startPause:l,endPause:c,calculateOffset:u}}},N=g`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,z=g`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,H=g`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,F=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${N} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${z} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${H} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,_=g`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,U=y("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${_} 1s linear infinite;
`,M=g`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,R=g`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,B=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${M} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${R} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,J=y("div")`
  position: absolute;
`,K=y("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,V=g`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,q=y("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${V} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,G=({toast:e})=>{let{icon:t,type:a,iconTheme:r}=e;return void 0!==t?"string"==typeof t?i.createElement(q,null,t):t:"blank"===a?null:i.createElement(K,null,i.createElement(U,{...r}),"loading"!==a&&i.createElement(J,null,"error"===a?i.createElement(F,{...r}):i.createElement(B,{...r})))},X=y("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Y=y("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Z=i.memo(({toast:e,position:t,style:a,children:r})=>{let o=e.height?((e,t)=>{let a=e.includes("top")?1:-1,[r,i]=w()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*a}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*a}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${g(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${g(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},s=i.createElement(G,{toast:e}),n=i.createElement(Y,{...e.ariaProps},b(e.message,e));return i.createElement(X,{className:e.className,style:{...o,...a,...e.style}},"function"==typeof r?r({icon:s,message:n}):i.createElement(i.Fragment,null,s,n))});r=i.createElement,d.p=void 0,m=r,f=void 0,h=void 0;var Q=({id:e,className:t,style:a,onHeightUpdate:r,children:o})=>{let s=i.useCallback(t=>{if(t){let a=()=>{r(e,t.getBoundingClientRect().height)};a(),new MutationObserver(a).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,r]);return i.createElement("div",{ref:s,className:t,style:a},o)},W=p`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ee=({reverseOrder:e,position:t="top-center",toastOptions:a,gutter:r,children:o,toasterId:s,containerStyle:n,containerClassName:l})=>{let{toasts:d,handlers:c}=D(a,s);return i.createElement("div",{"data-rht-toaster":s||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...n},className:l,onMouseEnter:c.startPause,onMouseLeave:c.endPause},d.map(a=>{let s,n,l=a.position||t,d=c.calculateOffset(a,{reverseOrder:e,gutter:r,defaultPosition:t}),u=(s=l.includes("top"),n=l.includes("center")?{justifyContent:"center"}:l.includes("right")?{justifyContent:"flex-end"}:{},{left:0,right:0,display:"flex",position:"absolute",transition:w()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${d*(s?1:-1)}px)`,...s?{top:0}:{bottom:0},...n});return i.createElement(Q,{id:a.id,key:a.id,onHeightUpdate:c.updateHeight,className:a.visible?W:"",style:u},"custom"===a.type?b(a.message,a):o?o(a):i.createElement(Z,{toast:a,position:l}))}))};e.s(["CheckmarkIcon",()=>B,"ErrorIcon",()=>F,"LoaderIcon",()=>U,"ToastBar",()=>Z,"ToastIcon",()=>G,"Toaster",()=>ee,"default",()=>L,"resolveValue",()=>b,"toast",()=>L,"useToaster",()=>D,"useToasterStore",()=>T],5766)},68834,e=>{"use strict";var t=e.i(71645);let a=e=>{let t,a=new Set,r=(e,r)=>{let i="function"==typeof e?e(t):e;if(!Object.is(i,t)){let e=t;t=(null!=r?r:"object"!=typeof i||null===i)?i:Object.assign({},t,i),a.forEach(a=>a(t,e))}},i=()=>t,o={setState:r,getState:i,getInitialState:()=>s,subscribe:e=>(a.add(e),()=>a.delete(e))},s=t=e(r,i,o);return o},r=e=>{let r=e?a(e):a,i=e=>(function(e,a=e=>e){let r=t.default.useSyncExternalStore(e.subscribe,t.default.useCallback(()=>a(e.getState()),[e,a]),t.default.useCallback(()=>a(e.getInitialState()),[e,a]));return t.default.useDebugValue(r),r})(r,e);return Object.assign(i,r),i},i=e=>e?r(e):r;e.s(["create",()=>i],68834)},19284,e=>{"use strict";let t,a;var r=e.i(68834);let i=e=>t=>{try{let a=e(t);if(a instanceof Promise)return a;return{then:e=>i(e)(a),catch(e){return this}}}catch(e){return{then(e){return this},catch:t=>i(t)(e)}}};var o=e.i(9165);let s=(0,r.create)()((t=(e,t)=>({user:null,isLoading:!0,isAuthenticated:!1,setUser:t=>e({user:t,isAuthenticated:!!t,isLoading:!1}),checkAuth:async()=>{try{e({isLoading:!0});let{user:t}=await o.authApi.getMe();e({user:t,isAuthenticated:!0,isLoading:!1})}catch{e({user:null,isAuthenticated:!1,isLoading:!1})}},logout:async()=>{try{await o.authApi.logout()}catch{}finally{e({user:null,isAuthenticated:!1})}}}),a={name:"auth-storage",partialize:e=>({user:e.user})},(e,r,o)=>{let s,n={storage:function(e,t){let a;try{a=e()}catch(e){return}return{getItem:e=>{var t;let r=e=>null===e?null:JSON.parse(e,void 0),i=null!=(t=a.getItem(e))?t:null;return i instanceof Promise?i.then(r):r(i)},setItem:(e,t)=>a.setItem(e,JSON.stringify(t,void 0)),removeItem:e=>a.removeItem(e)}}(()=>localStorage),partialize:e=>e,version:0,merge:(e,t)=>({...t,...e}),...a},l=!1,d=0,c=new Set,u=new Set,p=n.storage;if(!p)return t((...t)=>{console.warn(`[zustand persist middleware] Unable to update item '${n.name}', the given storage is currently unavailable.`),e(...t)},r,o);let m=()=>{let e=n.partialize({...r()});return p.setItem(n.name,{state:e,version:n.version})},f=o.setState;o.setState=(e,t)=>(f(e,t),m());let h=t((...t)=>(e(...t),m()),r,o);o.getInitialState=()=>h;let g=()=>{var t,a;if(!p)return;let o=++d;l=!1,c.forEach(e=>{var t;return e(null!=(t=r())?t:h)});let f=(null==(a=n.onRehydrateStorage)?void 0:a.call(n,null!=(t=r())?t:h))||void 0;return i(p.getItem.bind(p))(n.name).then(e=>{if(e)if("number"!=typeof e.version||e.version===n.version)return[!1,e.state];else{if(n.migrate){let t=n.migrate(e.state,e.version);return t instanceof Promise?t.then(e=>[!0,e]):[!0,t]}console.error("State loaded from storage couldn't be migrated since no migrate function was provided")}return[!1,void 0]}).then(t=>{var a;if(o!==d)return;let[i,l]=t;if(e(s=n.merge(l,null!=(a=r())?a:h),!0),i)return m()}).then(()=>{o===d&&(null==f||f(s,void 0),s=r(),l=!0,u.forEach(e=>e(s)))}).catch(e=>{o===d&&(null==f||f(void 0,e))})};return o.persist={setOptions:e=>{n={...n,...e},e.storage&&(p=e.storage)},clearStorage:()=>{null==p||p.removeItem(n.name)},getOptions:()=>n,rehydrate:()=>g(),hasHydrated:()=>l,onHydrate:e=>(c.add(e),()=>{c.delete(e)}),onFinishHydration:e=>(u.add(e),()=>{u.delete(e)})},n.skipHydration||g(),s||h}));e.s(["useAuthStore",0,s],19284)},73511,e=>{"use strict";var t=e.i(68834),a=e.i(9165),r=e.i(5766);let i=(0,t.create)((e,t)=>({items:[],cartId:null,subtotal:0,itemCount:0,isLoading:!1,isOpen:!1,fetchCart:async()=>{try{e({isLoading:!0});let t=await a.cartApi.get();e({items:t.items,cartId:t.cart?.id||null,subtotal:t.subtotal,itemCount:t.itemCount,isLoading:!1})}catch{e({isLoading:!1})}},addItem:async i=>{try{e({isLoading:!0}),await a.cartApi.addItem(i),await t().fetchCart(),r.default.success("Added to bag"),e({isOpen:!0})}catch(t){r.default.error(t instanceof Error?t.message:"Failed to add item"),e({isLoading:!1})}},updateItem:async(i,o)=>{try{e({isLoading:!0}),await a.cartApi.updateItem(i,o),await t().fetchCart()}catch(t){r.default.error(t instanceof Error?t.message:"Failed to update item"),e({isLoading:!1})}},removeItem:async i=>{try{e({isLoading:!0}),await a.cartApi.removeItem(i),await t().fetchCart(),r.default.success("Item removed")}catch(t){r.default.error(t instanceof Error?t.message:"Failed to remove item"),e({isLoading:!1})}},openCart:()=>e({isOpen:!0}),closeCart:()=>e({isOpen:!1}),toggleCart:()=>e(e=>({isOpen:!e.isOpen}))}));e.s(["useCartStore",0,i])},44636,e=>{"use strict";var t=e.i(43476),a=e.i(71645),r=e.i(19284),i=e.i(73511);function o({children:e}){let o=(0,r.useAuthStore)(e=>e.checkAuth),s=(0,i.useCartStore)(e=>e.fetchCart);return(0,a.useEffect)(()=>{o(),s()},[o,s]),(0,t.jsx)(t.Fragment,{children:e})}e.s(["Providers",()=>o])}]);