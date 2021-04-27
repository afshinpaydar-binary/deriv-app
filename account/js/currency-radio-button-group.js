/*! For license information please see currency-radio-button-group.js.LICENSE.txt */
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("@deriv/translations"),require("react")):"function"==typeof define&&define.amd?define(["@deriv/translations","react"],t):"object"==typeof exports?exports["@deriv/account"]=t(require("@deriv/translations"),require("react")):e["@deriv/account"]=t(e["@deriv/translations"],e.react)}(self,(function(e,t){return(()=>{var r={"../../../node_modules/classnames/index.js":(e,t)=>{var r;!function(){"use strict";var n={}.hasOwnProperty;function a(){for(var e=[],t=0;t<arguments.length;t++){var r=arguments[t];if(r){var o=typeof r;if("string"===o||"number"===o)e.push(r);else if(Array.isArray(r)&&r.length){var i=a.apply(null,r);i&&e.push(i)}else if("object"===o)for(var c in r)n.call(r,c)&&r[c]&&e.push(c)}}return e.join(" ")}e.exports?(a.default=a,e.exports=a):void 0===(r=function(){return a}.apply(t,[]))||(e.exports=r)}()},"@deriv/translations":t=>{"use strict";t.exports=e},react:e=>{"use strict";e.exports=t}},n={};function a(e){if(n[e])return n[e].exports;var t=n[e]={exports:{}};return r[e](t,t.exports,a),t.exports}a.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return a.d(t,{a:t}),t},a.d=(e,t)=>{for(var r in t)a.o(t,r)&&!a.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);var o={};return(()=>{"use strict";a.d(o,{default:()=>l});var e=a("react"),t=a.n(e),r=a("../../../node_modules/classnames/index.js"),n=a.n(r),i=a("@deriv/translations");function c(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var r=[],n=!0,a=!1,o=void 0;try{for(var i,c=e[Symbol.iterator]();!(n=(i=c.next()).done)&&(r.push(i.value),!t||r.length!==t);n=!0);}catch(e){a=!0,o=e}finally{try{n||null==c.return||c.return()}finally{if(a)throw o}}return r}}(e,t)||function(e,t){if(e){if("string"==typeof e)return s(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?s(e,t):void 0}}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function s(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var u=function(r){var a=r.label,o=r.className,s=r.children,u=r.is_title_enabled,l=r.is_fiat,f=r.item_count,d=c((0,e.useState)(!1),2),p=d[0],y=d[1];return t().createElement("div",{className:o},u&&t().createElement("h2",{className:n()("".concat(o,"--is-header"),{"currency-selector__is-crypto":!l})},a),t().createElement("div",{className:n()("currency-list__items",{"currency-list__items__center":f<4,"currency-list__items__is-fiat":l,"currency-list__items__is-crypto":!l}),onClick:function(){y(!0)}},s),l&&p&&t().createElement("p",{className:"currency-selector__description"},t().createElement(i.Localize,{i18n_default_text:"You are limited to one fiat account. You can change the currency of your fiat account anytime before you make a first-time deposit or create an MT5 account."})))};u.defaultProps={is_title_enabled:!0};const l=u})(),o.default})()}));