var rf = Object.defineProperty;
var lf = (e, t, n) => t in e ? rf(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var On = (e, t, n) => lf(e, typeof t != "symbol" ? t + "" : t, n);
function pu(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var hu = { exports: {} }, Ae = {}, mu = { exports: {} }, U = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var jr = Symbol.for("react.element"), of = Symbol.for("react.portal"), af = Symbol.for("react.fragment"), sf = Symbol.for("react.strict_mode"), uf = Symbol.for("react.profiler"), cf = Symbol.for("react.provider"), df = Symbol.for("react.context"), ff = Symbol.for("react.forward_ref"), pf = Symbol.for("react.suspense"), hf = Symbol.for("react.memo"), mf = Symbol.for("react.lazy"), Ba = Symbol.iterator;
function gf(e) {
  return e === null || typeof e != "object" ? null : (e = Ba && e[Ba] || e["@@iterator"], typeof e == "function" ? e : null);
}
var gu = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, vu = Object.assign, yu = {};
function Mn(e, t, n) {
  this.props = e, this.context = t, this.refs = yu, this.updater = n || gu;
}
Mn.prototype.isReactComponent = {};
Mn.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
Mn.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function wu() {
}
wu.prototype = Mn.prototype;
function Oo(e, t, n) {
  this.props = e, this.context = t, this.refs = yu, this.updater = n || gu;
}
var Uo = Oo.prototype = new wu();
Uo.constructor = Oo;
vu(Uo, Mn.prototype);
Uo.isPureReactComponent = !0;
var Wa = Array.isArray, xu = Object.prototype.hasOwnProperty, Bo = { current: null }, Su = { key: !0, ref: !0, __self: !0, __source: !0 };
function ku(e, t, n) {
  var r, l = {}, i = null, o = null;
  if (t != null) for (r in t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (i = "" + t.key), t) xu.call(t, r) && !Su.hasOwnProperty(r) && (l[r] = t[r]);
  var a = arguments.length - 2;
  if (a === 1) l.children = n;
  else if (1 < a) {
    for (var s = Array(a), u = 0; u < a; u++) s[u] = arguments[u + 2];
    l.children = s;
  }
  if (e && e.defaultProps) for (r in a = e.defaultProps, a) l[r] === void 0 && (l[r] = a[r]);
  return { $$typeof: jr, type: e, key: i, ref: o, props: l, _owner: Bo.current };
}
function vf(e, t) {
  return { $$typeof: jr, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function Wo(e) {
  return typeof e == "object" && e !== null && e.$$typeof === jr;
}
function yf(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var ba = /\/+/g;
function ai(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? yf("" + e.key) : t.toString(36);
}
function nl(e, t, n, r, l) {
  var i = typeof e;
  (i === "undefined" || i === "boolean") && (e = null);
  var o = !1;
  if (e === null) o = !0;
  else switch (i) {
    case "string":
    case "number":
      o = !0;
      break;
    case "object":
      switch (e.$$typeof) {
        case jr:
        case of:
          o = !0;
      }
  }
  if (o) return o = e, l = l(o), e = r === "" ? "." + ai(o, 0) : r, Wa(l) ? (n = "", e != null && (n = e.replace(ba, "$&/") + "/"), nl(l, t, n, "", function(u) {
    return u;
  })) : l != null && (Wo(l) && (l = vf(l, n + (!l.key || o && o.key === l.key ? "" : ("" + l.key).replace(ba, "$&/") + "/") + e)), t.push(l)), 1;
  if (o = 0, r = r === "" ? "." : r + ":", Wa(e)) for (var a = 0; a < e.length; a++) {
    i = e[a];
    var s = r + ai(i, a);
    o += nl(i, t, n, s, l);
  }
  else if (s = gf(e), typeof s == "function") for (e = s.call(e), a = 0; !(i = e.next()).done; ) i = i.value, s = r + ai(i, a++), o += nl(i, t, n, s, l);
  else if (i === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return o;
}
function Mr(e, t, n) {
  if (e == null) return e;
  var r = [], l = 0;
  return nl(e, r, "", "", function(i) {
    return t.call(n, i, l++);
  }), r;
}
function wf(e) {
  if (e._status === -1) {
    var t = e._result;
    t = t(), t.then(function(n) {
      (e._status === 0 || e._status === -1) && (e._status = 1, e._result = n);
    }, function(n) {
      (e._status === 0 || e._status === -1) && (e._status = 2, e._result = n);
    }), e._status === -1 && (e._status = 0, e._result = t);
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var _e = { current: null }, rl = { transition: null }, xf = { ReactCurrentDispatcher: _e, ReactCurrentBatchConfig: rl, ReactCurrentOwner: Bo };
function Eu() {
  throw Error("act(...) is not supported in production builds of React.");
}
U.Children = { map: Mr, forEach: function(e, t, n) {
  Mr(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return Mr(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return Mr(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!Wo(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
U.Component = Mn;
U.Fragment = af;
U.Profiler = uf;
U.PureComponent = Oo;
U.StrictMode = sf;
U.Suspense = pf;
U.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = xf;
U.act = Eu;
U.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = vu({}, e.props), l = e.key, i = e.ref, o = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (i = t.ref, o = Bo.current), t.key !== void 0 && (l = "" + t.key), e.type && e.type.defaultProps) var a = e.type.defaultProps;
    for (s in t) xu.call(t, s) && !Su.hasOwnProperty(s) && (r[s] = t[s] === void 0 && a !== void 0 ? a[s] : t[s]);
  }
  var s = arguments.length - 2;
  if (s === 1) r.children = n;
  else if (1 < s) {
    a = Array(s);
    for (var u = 0; u < s; u++) a[u] = arguments[u + 2];
    r.children = a;
  }
  return { $$typeof: jr, type: e.type, key: l, ref: i, props: r, _owner: o };
};
U.createContext = function(e) {
  return e = { $$typeof: df, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: cf, _context: e }, e.Consumer = e;
};
U.createElement = ku;
U.createFactory = function(e) {
  var t = ku.bind(null, e);
  return t.type = e, t;
};
U.createRef = function() {
  return { current: null };
};
U.forwardRef = function(e) {
  return { $$typeof: ff, render: e };
};
U.isValidElement = Wo;
U.lazy = function(e) {
  return { $$typeof: mf, _payload: { _status: -1, _result: e }, _init: wf };
};
U.memo = function(e, t) {
  return { $$typeof: hf, type: e, compare: t === void 0 ? null : t };
};
U.startTransition = function(e) {
  var t = rl.transition;
  rl.transition = {};
  try {
    e();
  } finally {
    rl.transition = t;
  }
};
U.unstable_act = Eu;
U.useCallback = function(e, t) {
  return _e.current.useCallback(e, t);
};
U.useContext = function(e) {
  return _e.current.useContext(e);
};
U.useDebugValue = function() {
};
U.useDeferredValue = function(e) {
  return _e.current.useDeferredValue(e);
};
U.useEffect = function(e, t) {
  return _e.current.useEffect(e, t);
};
U.useId = function() {
  return _e.current.useId();
};
U.useImperativeHandle = function(e, t, n) {
  return _e.current.useImperativeHandle(e, t, n);
};
U.useInsertionEffect = function(e, t) {
  return _e.current.useInsertionEffect(e, t);
};
U.useLayoutEffect = function(e, t) {
  return _e.current.useLayoutEffect(e, t);
};
U.useMemo = function(e, t) {
  return _e.current.useMemo(e, t);
};
U.useReducer = function(e, t, n) {
  return _e.current.useReducer(e, t, n);
};
U.useRef = function(e) {
  return _e.current.useRef(e);
};
U.useState = function(e) {
  return _e.current.useState(e);
};
U.useSyncExternalStore = function(e, t, n) {
  return _e.current.useSyncExternalStore(e, t, n);
};
U.useTransition = function() {
  return _e.current.useTransition();
};
U.version = "18.3.1";
mu.exports = U;
var k = mu.exports;
const Sf = /* @__PURE__ */ pu(k);
var _u = { exports: {} }, Cu = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function(e) {
  function t(P, L) {
    var $ = P.length;
    P.push(L);
    e: for (; 0 < $; ) {
      var G = $ - 1 >>> 1, le = P[G];
      if (0 < l(le, L)) P[G] = L, P[$] = le, $ = G;
      else break e;
    }
  }
  function n(P) {
    return P.length === 0 ? null : P[0];
  }
  function r(P) {
    if (P.length === 0) return null;
    var L = P[0], $ = P.pop();
    if ($ !== L) {
      P[0] = $;
      e: for (var G = 0, le = P.length, tn = le >>> 1; G < tn; ) {
        var lt = 2 * (G + 1) - 1, $n = P[lt], it = lt + 1, nn = P[it];
        if (0 > l($n, $)) it < le && 0 > l(nn, $n) ? (P[G] = nn, P[it] = $, G = it) : (P[G] = $n, P[lt] = $, G = lt);
        else if (it < le && 0 > l(nn, $)) P[G] = nn, P[it] = $, G = it;
        else break e;
      }
    }
    return L;
  }
  function l(P, L) {
    var $ = P.sortIndex - L.sortIndex;
    return $ !== 0 ? $ : P.id - L.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var i = performance;
    e.unstable_now = function() {
      return i.now();
    };
  } else {
    var o = Date, a = o.now();
    e.unstable_now = function() {
      return o.now() - a;
    };
  }
  var s = [], u = [], f = 1, p = null, c = 3, v = !1, y = !1, x = !1, N = typeof setTimeout == "function" ? setTimeout : null, m = typeof clearTimeout == "function" ? clearTimeout : null, h = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function g(P) {
    for (var L = n(u); L !== null; ) {
      if (L.callback === null) r(u);
      else if (L.startTime <= P) r(u), L.sortIndex = L.expirationTime, t(s, L);
      else break;
      L = n(u);
    }
  }
  function w(P) {
    if (x = !1, g(P), !y) if (n(s) !== null) y = !0, en(C);
    else {
      var L = n(u);
      L !== null && me(w, L.startTime - P);
    }
  }
  function C(P, L) {
    y = !1, x && (x = !1, m(R), R = -1), v = !0;
    var $ = c;
    try {
      for (g(L), p = n(s); p !== null && (!(p.expirationTime > L) || P && !Q()); ) {
        var G = p.callback;
        if (typeof G == "function") {
          p.callback = null, c = p.priorityLevel;
          var le = G(p.expirationTime <= L);
          L = e.unstable_now(), typeof le == "function" ? p.callback = le : p === n(s) && r(s), g(L);
        } else r(s);
        p = n(s);
      }
      if (p !== null) var tn = !0;
      else {
        var lt = n(u);
        lt !== null && me(w, lt.startTime - L), tn = !1;
      }
      return tn;
    } finally {
      p = null, c = $, v = !1;
    }
  }
  var z = !1, T = null, R = -1, j = 5, _ = -1;
  function Q() {
    return !(e.unstable_now() - _ < j);
  }
  function Se() {
    if (T !== null) {
      var P = e.unstable_now();
      _ = P;
      var L = !0;
      try {
        L = T(!0, P);
      } finally {
        L ? je() : (z = !1, T = null);
      }
    } else z = !1;
  }
  var je;
  if (typeof h == "function") je = function() {
    h(Se);
  };
  else if (typeof MessageChannel < "u") {
    var de = new MessageChannel(), re = de.port2;
    de.port1.onmessage = Se, je = function() {
      re.postMessage(null);
    };
  } else je = function() {
    N(Se, 0);
  };
  function en(P) {
    T = P, z || (z = !0, je());
  }
  function me(P, L) {
    R = N(function() {
      P(e.unstable_now());
    }, L);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(P) {
    P.callback = null;
  }, e.unstable_continueExecution = function() {
    y || v || (y = !0, en(C));
  }, e.unstable_forceFrameRate = function(P) {
    0 > P || 125 < P ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : j = 0 < P ? Math.floor(1e3 / P) : 5;
  }, e.unstable_getCurrentPriorityLevel = function() {
    return c;
  }, e.unstable_getFirstCallbackNode = function() {
    return n(s);
  }, e.unstable_next = function(P) {
    switch (c) {
      case 1:
      case 2:
      case 3:
        var L = 3;
        break;
      default:
        L = c;
    }
    var $ = c;
    c = L;
    try {
      return P();
    } finally {
      c = $;
    }
  }, e.unstable_pauseExecution = function() {
  }, e.unstable_requestPaint = function() {
  }, e.unstable_runWithPriority = function(P, L) {
    switch (P) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        P = 3;
    }
    var $ = c;
    c = P;
    try {
      return L();
    } finally {
      c = $;
    }
  }, e.unstable_scheduleCallback = function(P, L, $) {
    var G = e.unstable_now();
    switch (typeof $ == "object" && $ !== null ? ($ = $.delay, $ = typeof $ == "number" && 0 < $ ? G + $ : G) : $ = G, P) {
      case 1:
        var le = -1;
        break;
      case 2:
        le = 250;
        break;
      case 5:
        le = 1073741823;
        break;
      case 4:
        le = 1e4;
        break;
      default:
        le = 5e3;
    }
    return le = $ + le, P = { id: f++, callback: L, priorityLevel: P, startTime: $, expirationTime: le, sortIndex: -1 }, $ > G ? (P.sortIndex = $, t(u, P), n(s) === null && P === n(u) && (x ? (m(R), R = -1) : x = !0, me(w, $ - G))) : (P.sortIndex = le, t(s, P), y || v || (y = !0, en(C))), P;
  }, e.unstable_shouldYield = Q, e.unstable_wrapCallback = function(P) {
    var L = c;
    return function() {
      var $ = c;
      c = L;
      try {
        return P.apply(this, arguments);
      } finally {
        c = $;
      }
    };
  };
})(Cu);
_u.exports = Cu;
var kf = _u.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ef = k, $e = kf;
function E(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var ju = /* @__PURE__ */ new Set(), sr = {};
function Jt(e, t) {
  Cn(e, t), Cn(e + "Capture", t);
}
function Cn(e, t) {
  for (sr[e] = t, e = 0; e < t.length; e++) ju.add(t[e]);
}
var ft = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Bi = Object.prototype.hasOwnProperty, _f = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, Va = {}, Ha = {};
function Cf(e) {
  return Bi.call(Ha, e) ? !0 : Bi.call(Va, e) ? !1 : _f.test(e) ? Ha[e] = !0 : (Va[e] = !0, !1);
}
function jf(e, t, n, r) {
  if (n !== null && n.type === 0) return !1;
  switch (typeof t) {
    case "function":
    case "symbol":
      return !0;
    case "boolean":
      return r ? !1 : n !== null ? !n.acceptsBooleans : (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-");
    default:
      return !1;
  }
}
function Pf(e, t, n, r) {
  if (t === null || typeof t > "u" || jf(e, t, n, r)) return !0;
  if (r) return !1;
  if (n !== null) switch (n.type) {
    case 3:
      return !t;
    case 4:
      return t === !1;
    case 5:
      return isNaN(t);
    case 6:
      return isNaN(t) || 1 > t;
  }
  return !1;
}
function Ce(e, t, n, r, l, i, o) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = l, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = i, this.removeEmptyString = o;
}
var he = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
  he[e] = new Ce(e, 0, !1, e, null, !1, !1);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
  var t = e[0];
  he[t] = new Ce(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
  he[e] = new Ce(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
  he[e] = new Ce(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
  he[e] = new Ce(e, 3, !1, e.toLowerCase(), null, !1, !1);
});
["checked", "multiple", "muted", "selected"].forEach(function(e) {
  he[e] = new Ce(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function(e) {
  he[e] = new Ce(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function(e) {
  he[e] = new Ce(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function(e) {
  he[e] = new Ce(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var bo = /[\-:]([a-z])/g;
function Vo(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
  var t = e.replace(
    bo,
    Vo
  );
  he[t] = new Ce(t, 1, !1, e, null, !1, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(bo, Vo);
  he[t] = new Ce(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(bo, Vo);
  he[t] = new Ce(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  he[e] = new Ce(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
he.xlinkHref = new Ce("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function(e) {
  he[e] = new Ce(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function Ho(e, t, n, r) {
  var l = he.hasOwnProperty(t) ? he[t] : null;
  (l !== null ? l.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (Pf(t, n, l, r) && (n = null), r || l === null ? Cf(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : l.mustUseProperty ? e[l.propertyName] = n === null ? l.type === 3 ? !1 : "" : n : (t = l.attributeName, r = l.attributeNamespace, n === null ? e.removeAttribute(t) : (l = l.type, n = l === 3 || l === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var gt = Ef.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, Lr = Symbol.for("react.element"), on = Symbol.for("react.portal"), an = Symbol.for("react.fragment"), Qo = Symbol.for("react.strict_mode"), Wi = Symbol.for("react.profiler"), Pu = Symbol.for("react.provider"), zu = Symbol.for("react.context"), Yo = Symbol.for("react.forward_ref"), bi = Symbol.for("react.suspense"), Vi = Symbol.for("react.suspense_list"), Xo = Symbol.for("react.memo"), yt = Symbol.for("react.lazy"), Nu = Symbol.for("react.offscreen"), Qa = Symbol.iterator;
function Un(e) {
  return e === null || typeof e != "object" ? null : (e = Qa && e[Qa] || e["@@iterator"], typeof e == "function" ? e : null);
}
var ee = Object.assign, si;
function Kn(e) {
  if (si === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    si = t && t[1] || "";
  }
  return `
` + si + e;
}
var ui = !1;
function ci(e, t) {
  if (!e || ui) return "";
  ui = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t) if (t = function() {
      throw Error();
    }, Object.defineProperty(t.prototype, "props", { set: function() {
      throw Error();
    } }), typeof Reflect == "object" && Reflect.construct) {
      try {
        Reflect.construct(t, []);
      } catch (u) {
        var r = u;
      }
      Reflect.construct(e, [], t);
    } else {
      try {
        t.call();
      } catch (u) {
        r = u;
      }
      e.call(t.prototype);
    }
    else {
      try {
        throw Error();
      } catch (u) {
        r = u;
      }
      e();
    }
  } catch (u) {
    if (u && r && typeof u.stack == "string") {
      for (var l = u.stack.split(`
`), i = r.stack.split(`
`), o = l.length - 1, a = i.length - 1; 1 <= o && 0 <= a && l[o] !== i[a]; ) a--;
      for (; 1 <= o && 0 <= a; o--, a--) if (l[o] !== i[a]) {
        if (o !== 1 || a !== 1)
          do
            if (o--, a--, 0 > a || l[o] !== i[a]) {
              var s = `
` + l[o].replace(" at new ", " at ");
              return e.displayName && s.includes("<anonymous>") && (s = s.replace("<anonymous>", e.displayName)), s;
            }
          while (1 <= o && 0 <= a);
        break;
      }
    }
  } finally {
    ui = !1, Error.prepareStackTrace = n;
  }
  return (e = e ? e.displayName || e.name : "") ? Kn(e) : "";
}
function zf(e) {
  switch (e.tag) {
    case 5:
      return Kn(e.type);
    case 16:
      return Kn("Lazy");
    case 13:
      return Kn("Suspense");
    case 19:
      return Kn("SuspenseList");
    case 0:
    case 2:
    case 15:
      return e = ci(e.type, !1), e;
    case 11:
      return e = ci(e.type.render, !1), e;
    case 1:
      return e = ci(e.type, !0), e;
    default:
      return "";
  }
}
function Hi(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case an:
      return "Fragment";
    case on:
      return "Portal";
    case Wi:
      return "Profiler";
    case Qo:
      return "StrictMode";
    case bi:
      return "Suspense";
    case Vi:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case zu:
      return (e.displayName || "Context") + ".Consumer";
    case Pu:
      return (e._context.displayName || "Context") + ".Provider";
    case Yo:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case Xo:
      return t = e.displayName || null, t !== null ? t : Hi(e.type) || "Memo";
    case yt:
      t = e._payload, e = e._init;
      try {
        return Hi(e(t));
      } catch {
      }
  }
  return null;
}
function Nf(e) {
  var t = e.type;
  switch (e.tag) {
    case 24:
      return "Cache";
    case 9:
      return (t.displayName || "Context") + ".Consumer";
    case 10:
      return (t._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return e = t.render, e = e.displayName || e.name || "", t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
    case 7:
      return "Fragment";
    case 5:
      return t;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return Hi(t);
    case 8:
      return t === Qo ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof t == "function") return t.displayName || t.name || null;
      if (typeof t == "string") return t;
  }
  return null;
}
function Rt(e) {
  switch (typeof e) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return e;
    case "object":
      return e;
    default:
      return "";
  }
}
function Tu(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function Tf(e) {
  var t = Tu(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
  if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
    var l = n.get, i = n.set;
    return Object.defineProperty(e, t, { configurable: !0, get: function() {
      return l.call(this);
    }, set: function(o) {
      r = "" + o, i.call(this, o);
    } }), Object.defineProperty(e, t, { enumerable: n.enumerable }), { getValue: function() {
      return r;
    }, setValue: function(o) {
      r = "" + o;
    }, stopTracking: function() {
      e._valueTracker = null, delete e[t];
    } };
  }
}
function Ir(e) {
  e._valueTracker || (e._valueTracker = Tf(e));
}
function Du(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(), r = "";
  return e && (r = Tu(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
}
function ml(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function Qi(e, t) {
  var n = t.checked;
  return ee({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function Ya(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = Rt(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function Ru(e, t) {
  t = t.checked, t != null && Ho(e, "checked", t, !1);
}
function Yi(e, t) {
  Ru(e, t);
  var n = Rt(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? Xi(e, t.type, n) : t.hasOwnProperty("defaultValue") && Xi(e, t.type, Rt(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function Xa(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function Xi(e, t, n) {
  (t !== "number" || ml(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var Gn = Array.isArray;
function yn(e, t, n, r) {
  if (e = e.options, t) {
    t = {};
    for (var l = 0; l < n.length; l++) t["$" + n[l]] = !0;
    for (n = 0; n < e.length; n++) l = t.hasOwnProperty("$" + e[n].value), e[n].selected !== l && (e[n].selected = l), l && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + Rt(n), t = null, l = 0; l < e.length; l++) {
      if (e[l].value === n) {
        e[l].selected = !0, r && (e[l].defaultSelected = !0);
        return;
      }
      t !== null || e[l].disabled || (t = e[l]);
    }
    t !== null && (t.selected = !0);
  }
}
function Ki(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(E(91));
  return ee({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function Ka(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(E(92));
      if (Gn(n)) {
        if (1 < n.length) throw Error(E(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = { initialValue: Rt(n) };
}
function Mu(e, t) {
  var n = Rt(t.value), r = Rt(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function Ga(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function Lu(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function Gi(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? Lu(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var $r, Iu = function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, l) {
    MSApp.execUnsafeLocalFunction(function() {
      return e(t, n, r, l);
    });
  } : e;
}(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
  else {
    for ($r = $r || document.createElement("div"), $r.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = $r.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
    for (; t.firstChild; ) e.appendChild(t.firstChild);
  }
});
function ur(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var qn = {
  animationIterationCount: !0,
  aspectRatio: !0,
  borderImageOutset: !0,
  borderImageSlice: !0,
  borderImageWidth: !0,
  boxFlex: !0,
  boxFlexGroup: !0,
  boxOrdinalGroup: !0,
  columnCount: !0,
  columns: !0,
  flex: !0,
  flexGrow: !0,
  flexPositive: !0,
  flexShrink: !0,
  flexNegative: !0,
  flexOrder: !0,
  gridArea: !0,
  gridRow: !0,
  gridRowEnd: !0,
  gridRowSpan: !0,
  gridRowStart: !0,
  gridColumn: !0,
  gridColumnEnd: !0,
  gridColumnSpan: !0,
  gridColumnStart: !0,
  fontWeight: !0,
  lineClamp: !0,
  lineHeight: !0,
  opacity: !0,
  order: !0,
  orphans: !0,
  tabSize: !0,
  widows: !0,
  zIndex: !0,
  zoom: !0,
  fillOpacity: !0,
  floodOpacity: !0,
  stopOpacity: !0,
  strokeDasharray: !0,
  strokeDashoffset: !0,
  strokeMiterlimit: !0,
  strokeOpacity: !0,
  strokeWidth: !0
}, Df = ["Webkit", "ms", "Moz", "O"];
Object.keys(qn).forEach(function(e) {
  Df.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), qn[t] = qn[e];
  });
});
function $u(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || qn.hasOwnProperty(e) && qn[e] ? ("" + t).trim() : t + "px";
}
function Au(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, l = $u(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, l) : e[n] = l;
  }
}
var Rf = ee({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
function Zi(e, t) {
  if (t) {
    if (Rf[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(E(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(E(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(E(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(E(62));
  }
}
function Ji(e, t) {
  if (e.indexOf("-") === -1) return typeof t.is == "string";
  switch (e) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var qi = null;
function Ko(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var eo = null, wn = null, xn = null;
function Za(e) {
  if (e = Nr(e)) {
    if (typeof eo != "function") throw Error(E(280));
    var t = e.stateNode;
    t && (t = bl(t), eo(e.stateNode, e.type, t));
  }
}
function Fu(e) {
  wn ? xn ? xn.push(e) : xn = [e] : wn = e;
}
function Ou() {
  if (wn) {
    var e = wn, t = xn;
    if (xn = wn = null, Za(e), t) for (e = 0; e < t.length; e++) Za(t[e]);
  }
}
function Uu(e, t) {
  return e(t);
}
function Bu() {
}
var di = !1;
function Wu(e, t, n) {
  if (di) return e(t, n);
  di = !0;
  try {
    return Uu(e, t, n);
  } finally {
    di = !1, (wn !== null || xn !== null) && (Bu(), Ou());
  }
}
function cr(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = bl(n);
  if (r === null) return null;
  n = r[t];
  e: switch (t) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      (r = !r.disabled) || (e = e.type, r = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !r;
      break e;
    default:
      e = !1;
  }
  if (e) return null;
  if (n && typeof n != "function") throw Error(E(231, t, typeof n));
  return n;
}
var to = !1;
if (ft) try {
  var Bn = {};
  Object.defineProperty(Bn, "passive", { get: function() {
    to = !0;
  } }), window.addEventListener("test", Bn, Bn), window.removeEventListener("test", Bn, Bn);
} catch {
  to = !1;
}
function Mf(e, t, n, r, l, i, o, a, s) {
  var u = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, u);
  } catch (f) {
    this.onError(f);
  }
}
var er = !1, gl = null, vl = !1, no = null, Lf = { onError: function(e) {
  er = !0, gl = e;
} };
function If(e, t, n, r, l, i, o, a, s) {
  er = !1, gl = null, Mf.apply(Lf, arguments);
}
function $f(e, t, n, r, l, i, o, a, s) {
  if (If.apply(this, arguments), er) {
    if (er) {
      var u = gl;
      er = !1, gl = null;
    } else throw Error(E(198));
    vl || (vl = !0, no = u);
  }
}
function qt(e) {
  var t = e, n = e;
  if (e.alternate) for (; t.return; ) t = t.return;
  else {
    e = t;
    do
      t = e, t.flags & 4098 && (n = t.return), e = t.return;
    while (e);
  }
  return t.tag === 3 ? n : null;
}
function bu(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function Ja(e) {
  if (qt(e) !== e) throw Error(E(188));
}
function Af(e) {
  var t = e.alternate;
  if (!t) {
    if (t = qt(e), t === null) throw Error(E(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ; ) {
    var l = n.return;
    if (l === null) break;
    var i = l.alternate;
    if (i === null) {
      if (r = l.return, r !== null) {
        n = r;
        continue;
      }
      break;
    }
    if (l.child === i.child) {
      for (i = l.child; i; ) {
        if (i === n) return Ja(l), e;
        if (i === r) return Ja(l), t;
        i = i.sibling;
      }
      throw Error(E(188));
    }
    if (n.return !== r.return) n = l, r = i;
    else {
      for (var o = !1, a = l.child; a; ) {
        if (a === n) {
          o = !0, n = l, r = i;
          break;
        }
        if (a === r) {
          o = !0, r = l, n = i;
          break;
        }
        a = a.sibling;
      }
      if (!o) {
        for (a = i.child; a; ) {
          if (a === n) {
            o = !0, n = i, r = l;
            break;
          }
          if (a === r) {
            o = !0, r = i, n = l;
            break;
          }
          a = a.sibling;
        }
        if (!o) throw Error(E(189));
      }
    }
    if (n.alternate !== r) throw Error(E(190));
  }
  if (n.tag !== 3) throw Error(E(188));
  return n.stateNode.current === n ? e : t;
}
function Vu(e) {
  return e = Af(e), e !== null ? Hu(e) : null;
}
function Hu(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = Hu(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var Qu = $e.unstable_scheduleCallback, qa = $e.unstable_cancelCallback, Ff = $e.unstable_shouldYield, Of = $e.unstable_requestPaint, ne = $e.unstable_now, Uf = $e.unstable_getCurrentPriorityLevel, Go = $e.unstable_ImmediatePriority, Yu = $e.unstable_UserBlockingPriority, yl = $e.unstable_NormalPriority, Bf = $e.unstable_LowPriority, Xu = $e.unstable_IdlePriority, Ol = null, nt = null;
function Wf(e) {
  if (nt && typeof nt.onCommitFiberRoot == "function") try {
    nt.onCommitFiberRoot(Ol, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var Ke = Math.clz32 ? Math.clz32 : Hf, bf = Math.log, Vf = Math.LN2;
function Hf(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (bf(e) / Vf | 0) | 0;
}
var Ar = 64, Fr = 4194304;
function Zn(e) {
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return e;
  }
}
function wl(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0, l = e.suspendedLanes, i = e.pingedLanes, o = n & 268435455;
  if (o !== 0) {
    var a = o & ~l;
    a !== 0 ? r = Zn(a) : (i &= o, i !== 0 && (r = Zn(i)));
  } else o = n & ~l, o !== 0 ? r = Zn(o) : i !== 0 && (r = Zn(i));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & l) && (l = r & -r, i = t & -t, l >= i || l === 16 && (i & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - Ke(t), l = 1 << n, r |= e[n], t &= ~l;
  return r;
}
function Qf(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return t + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function Yf(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, i = e.pendingLanes; 0 < i; ) {
    var o = 31 - Ke(i), a = 1 << o, s = l[o];
    s === -1 ? (!(a & n) || a & r) && (l[o] = Qf(a, t)) : s <= t && (e.expiredLanes |= a), i &= ~a;
  }
}
function ro(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function Ku() {
  var e = Ar;
  return Ar <<= 1, !(Ar & 4194240) && (Ar = 64), e;
}
function fi(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function Pr(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - Ke(t), e[t] = n;
}
function Xf(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var l = 31 - Ke(n), i = 1 << l;
    t[l] = 0, r[l] = -1, e[l] = -1, n &= ~i;
  }
}
function Zo(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
    var r = 31 - Ke(n), l = 1 << r;
    l & t | e[r] & t && (e[r] |= t), n &= ~l;
  }
}
var H = 0;
function Gu(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var Zu, Jo, Ju, qu, ec, lo = !1, Or = [], _t = null, Ct = null, jt = null, dr = /* @__PURE__ */ new Map(), fr = /* @__PURE__ */ new Map(), xt = [], Kf = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function es(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      _t = null;
      break;
    case "dragenter":
    case "dragleave":
      Ct = null;
      break;
    case "mouseover":
    case "mouseout":
      jt = null;
      break;
    case "pointerover":
    case "pointerout":
      dr.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      fr.delete(t.pointerId);
  }
}
function Wn(e, t, n, r, l, i) {
  return e === null || e.nativeEvent !== i ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: i, targetContainers: [l] }, t !== null && (t = Nr(t), t !== null && Jo(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, l !== null && t.indexOf(l) === -1 && t.push(l), e);
}
function Gf(e, t, n, r, l) {
  switch (t) {
    case "focusin":
      return _t = Wn(_t, e, t, n, r, l), !0;
    case "dragenter":
      return Ct = Wn(Ct, e, t, n, r, l), !0;
    case "mouseover":
      return jt = Wn(jt, e, t, n, r, l), !0;
    case "pointerover":
      var i = l.pointerId;
      return dr.set(i, Wn(dr.get(i) || null, e, t, n, r, l)), !0;
    case "gotpointercapture":
      return i = l.pointerId, fr.set(i, Wn(fr.get(i) || null, e, t, n, r, l)), !0;
  }
  return !1;
}
function tc(e) {
  var t = Wt(e.target);
  if (t !== null) {
    var n = qt(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = bu(n), t !== null) {
          e.blockedOn = t, ec(e.priority, function() {
            Ju(n);
          });
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function ll(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = io(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      qi = r, n.target.dispatchEvent(r), qi = null;
    } else return t = Nr(n), t !== null && Jo(t), e.blockedOn = n, !1;
    t.shift();
  }
  return !0;
}
function ts(e, t, n) {
  ll(e) && n.delete(t);
}
function Zf() {
  lo = !1, _t !== null && ll(_t) && (_t = null), Ct !== null && ll(Ct) && (Ct = null), jt !== null && ll(jt) && (jt = null), dr.forEach(ts), fr.forEach(ts);
}
function bn(e, t) {
  e.blockedOn === t && (e.blockedOn = null, lo || (lo = !0, $e.unstable_scheduleCallback($e.unstable_NormalPriority, Zf)));
}
function pr(e) {
  function t(l) {
    return bn(l, e);
  }
  if (0 < Or.length) {
    bn(Or[0], e);
    for (var n = 1; n < Or.length; n++) {
      var r = Or[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (_t !== null && bn(_t, e), Ct !== null && bn(Ct, e), jt !== null && bn(jt, e), dr.forEach(t), fr.forEach(t), n = 0; n < xt.length; n++) r = xt[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < xt.length && (n = xt[0], n.blockedOn === null); ) tc(n), n.blockedOn === null && xt.shift();
}
var Sn = gt.ReactCurrentBatchConfig, xl = !0;
function Jf(e, t, n, r) {
  var l = H, i = Sn.transition;
  Sn.transition = null;
  try {
    H = 1, qo(e, t, n, r);
  } finally {
    H = l, Sn.transition = i;
  }
}
function qf(e, t, n, r) {
  var l = H, i = Sn.transition;
  Sn.transition = null;
  try {
    H = 4, qo(e, t, n, r);
  } finally {
    H = l, Sn.transition = i;
  }
}
function qo(e, t, n, r) {
  if (xl) {
    var l = io(e, t, n, r);
    if (l === null) ki(e, t, r, Sl, n), es(e, r);
    else if (Gf(l, e, t, n, r)) r.stopPropagation();
    else if (es(e, r), t & 4 && -1 < Kf.indexOf(e)) {
      for (; l !== null; ) {
        var i = Nr(l);
        if (i !== null && Zu(i), i = io(e, t, n, r), i === null && ki(e, t, r, Sl, n), i === l) break;
        l = i;
      }
      l !== null && r.stopPropagation();
    } else ki(e, t, r, null, n);
  }
}
var Sl = null;
function io(e, t, n, r) {
  if (Sl = null, e = Ko(r), e = Wt(e), e !== null) if (t = qt(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = bu(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return Sl = e, null;
}
function nc(e) {
  switch (e) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (Uf()) {
        case Go:
          return 1;
        case Yu:
          return 4;
        case yl:
        case Bf:
          return 16;
        case Xu:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var kt = null, ea = null, il = null;
function rc() {
  if (il) return il;
  var e, t = ea, n = t.length, r, l = "value" in kt ? kt.value : kt.textContent, i = l.length;
  for (e = 0; e < n && t[e] === l[e]; e++) ;
  var o = n - e;
  for (r = 1; r <= o && t[n - r] === l[i - r]; r++) ;
  return il = l.slice(e, 1 < r ? 1 - r : void 0);
}
function ol(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function Ur() {
  return !0;
}
function ns() {
  return !1;
}
function Fe(e) {
  function t(n, r, l, i, o) {
    this._reactName = n, this._targetInst = l, this.type = r, this.nativeEvent = i, this.target = o, this.currentTarget = null;
    for (var a in e) e.hasOwnProperty(a) && (n = e[a], this[a] = n ? n(i) : i[a]);
    return this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1) ? Ur : ns, this.isPropagationStopped = ns, this;
  }
  return ee(t.prototype, { preventDefault: function() {
    this.defaultPrevented = !0;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = Ur);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = Ur);
  }, persist: function() {
  }, isPersistent: Ur }), t;
}
var Ln = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, ta = Fe(Ln), zr = ee({}, Ln, { view: 0, detail: 0 }), ep = Fe(zr), pi, hi, Vn, Ul = ee({}, zr, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: na, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== Vn && (Vn && e.type === "mousemove" ? (pi = e.screenX - Vn.screenX, hi = e.screenY - Vn.screenY) : hi = pi = 0, Vn = e), pi);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : hi;
} }), rs = Fe(Ul), tp = ee({}, Ul, { dataTransfer: 0 }), np = Fe(tp), rp = ee({}, zr, { relatedTarget: 0 }), mi = Fe(rp), lp = ee({}, Ln, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), ip = Fe(lp), op = ee({}, Ln, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), ap = Fe(op), sp = ee({}, Ln, { data: 0 }), ls = Fe(sp), up = {
  Esc: "Escape",
  Spacebar: " ",
  Left: "ArrowLeft",
  Up: "ArrowUp",
  Right: "ArrowRight",
  Down: "ArrowDown",
  Del: "Delete",
  Win: "OS",
  Menu: "ContextMenu",
  Apps: "ContextMenu",
  Scroll: "ScrollLock",
  MozPrintableKey: "Unidentified"
}, cp = {
  8: "Backspace",
  9: "Tab",
  12: "Clear",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  19: "Pause",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  45: "Insert",
  46: "Delete",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
  144: "NumLock",
  145: "ScrollLock",
  224: "Meta"
}, dp = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function fp(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = dp[e]) ? !!t[e] : !1;
}
function na() {
  return fp;
}
var pp = ee({}, zr, { key: function(e) {
  if (e.key) {
    var t = up[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = ol(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? cp[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: na, charCode: function(e) {
  return e.type === "keypress" ? ol(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? ol(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), hp = Fe(pp), mp = ee({}, Ul, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), is = Fe(mp), gp = ee({}, zr, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: na }), vp = Fe(gp), yp = ee({}, Ln, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), wp = Fe(yp), xp = ee({}, Ul, {
  deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  },
  deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), Sp = Fe(xp), kp = [9, 13, 27, 32], ra = ft && "CompositionEvent" in window, tr = null;
ft && "documentMode" in document && (tr = document.documentMode);
var Ep = ft && "TextEvent" in window && !tr, lc = ft && (!ra || tr && 8 < tr && 11 >= tr), os = " ", as = !1;
function ic(e, t) {
  switch (e) {
    case "keyup":
      return kp.indexOf(t.keyCode) !== -1;
    case "keydown":
      return t.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function oc(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var sn = !1;
function _p(e, t) {
  switch (e) {
    case "compositionend":
      return oc(t);
    case "keypress":
      return t.which !== 32 ? null : (as = !0, os);
    case "textInput":
      return e = t.data, e === os && as ? null : e;
    default:
      return null;
  }
}
function Cp(e, t) {
  if (sn) return e === "compositionend" || !ra && ic(e, t) ? (e = rc(), il = ea = kt = null, sn = !1, e) : null;
  switch (e) {
    case "paste":
      return null;
    case "keypress":
      if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case "compositionend":
      return lc && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var jp = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
function ss(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!jp[e.type] : t === "textarea";
}
function ac(e, t, n, r) {
  Fu(r), t = kl(t, "onChange"), 0 < t.length && (n = new ta("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var nr = null, hr = null;
function Pp(e) {
  yc(e, 0);
}
function Bl(e) {
  var t = dn(e);
  if (Du(t)) return e;
}
function zp(e, t) {
  if (e === "change") return t;
}
var sc = !1;
if (ft) {
  var gi;
  if (ft) {
    var vi = "oninput" in document;
    if (!vi) {
      var us = document.createElement("div");
      us.setAttribute("oninput", "return;"), vi = typeof us.oninput == "function";
    }
    gi = vi;
  } else gi = !1;
  sc = gi && (!document.documentMode || 9 < document.documentMode);
}
function cs() {
  nr && (nr.detachEvent("onpropertychange", uc), hr = nr = null);
}
function uc(e) {
  if (e.propertyName === "value" && Bl(hr)) {
    var t = [];
    ac(t, hr, e, Ko(e)), Wu(Pp, t);
  }
}
function Np(e, t, n) {
  e === "focusin" ? (cs(), nr = t, hr = n, nr.attachEvent("onpropertychange", uc)) : e === "focusout" && cs();
}
function Tp(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return Bl(hr);
}
function Dp(e, t) {
  if (e === "click") return Bl(t);
}
function Rp(e, t) {
  if (e === "input" || e === "change") return Bl(t);
}
function Mp(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Ze = typeof Object.is == "function" ? Object.is : Mp;
function mr(e, t) {
  if (Ze(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var l = n[r];
    if (!Bi.call(t, l) || !Ze(e[l], t[l])) return !1;
  }
  return !0;
}
function ds(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function fs(e, t) {
  var n = ds(e);
  e = 0;
  for (var r; n; ) {
    if (n.nodeType === 3) {
      if (r = e + n.textContent.length, e <= t && r >= t) return { node: n, offset: t - e };
      e = r;
    }
    e: {
      for (; n; ) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = ds(n);
  }
}
function cc(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? cc(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function dc() {
  for (var e = window, t = ml(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = ml(e.document);
  }
  return t;
}
function la(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
}
function Lp(e) {
  var t = dc(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && cc(n.ownerDocument.documentElement, n)) {
    if (r !== null && la(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
      else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var l = n.textContent.length, i = Math.min(r.start, l);
        r = r.end === void 0 ? i : Math.min(r.end, l), !e.extend && i > r && (l = r, r = i, i = l), l = fs(n, i);
        var o = fs(
          n,
          r
        );
        l && o && (e.rangeCount !== 1 || e.anchorNode !== l.node || e.anchorOffset !== l.offset || e.focusNode !== o.node || e.focusOffset !== o.offset) && (t = t.createRange(), t.setStart(l.node, l.offset), e.removeAllRanges(), i > r ? (e.addRange(t), e.extend(o.node, o.offset)) : (t.setEnd(o.node, o.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; e = e.parentNode; ) e.nodeType === 1 && t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++) e = t[n], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
  }
}
var Ip = ft && "documentMode" in document && 11 >= document.documentMode, un = null, oo = null, rr = null, ao = !1;
function ps(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  ao || un == null || un !== ml(r) || (r = un, "selectionStart" in r && la(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), rr && mr(rr, r) || (rr = r, r = kl(oo, "onSelect"), 0 < r.length && (t = new ta("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = un)));
}
function Br(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var cn = { animationend: Br("Animation", "AnimationEnd"), animationiteration: Br("Animation", "AnimationIteration"), animationstart: Br("Animation", "AnimationStart"), transitionend: Br("Transition", "TransitionEnd") }, yi = {}, fc = {};
ft && (fc = document.createElement("div").style, "AnimationEvent" in window || (delete cn.animationend.animation, delete cn.animationiteration.animation, delete cn.animationstart.animation), "TransitionEvent" in window || delete cn.transitionend.transition);
function Wl(e) {
  if (yi[e]) return yi[e];
  if (!cn[e]) return e;
  var t = cn[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in fc) return yi[e] = t[n];
  return e;
}
var pc = Wl("animationend"), hc = Wl("animationiteration"), mc = Wl("animationstart"), gc = Wl("transitionend"), vc = /* @__PURE__ */ new Map(), hs = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function Lt(e, t) {
  vc.set(e, t), Jt(t, [e]);
}
for (var wi = 0; wi < hs.length; wi++) {
  var xi = hs[wi], $p = xi.toLowerCase(), Ap = xi[0].toUpperCase() + xi.slice(1);
  Lt($p, "on" + Ap);
}
Lt(pc, "onAnimationEnd");
Lt(hc, "onAnimationIteration");
Lt(mc, "onAnimationStart");
Lt("dblclick", "onDoubleClick");
Lt("focusin", "onFocus");
Lt("focusout", "onBlur");
Lt(gc, "onTransitionEnd");
Cn("onMouseEnter", ["mouseout", "mouseover"]);
Cn("onMouseLeave", ["mouseout", "mouseover"]);
Cn("onPointerEnter", ["pointerout", "pointerover"]);
Cn("onPointerLeave", ["pointerout", "pointerover"]);
Jt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
Jt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
Jt("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Jt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
Jt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
Jt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var Jn = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Fp = new Set("cancel close invalid load scroll toggle".split(" ").concat(Jn));
function ms(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, $f(r, t, void 0, e), e.currentTarget = null;
}
function yc(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n], l = r.event;
    r = r.listeners;
    e: {
      var i = void 0;
      if (t) for (var o = r.length - 1; 0 <= o; o--) {
        var a = r[o], s = a.instance, u = a.currentTarget;
        if (a = a.listener, s !== i && l.isPropagationStopped()) break e;
        ms(l, a, u), i = s;
      }
      else for (o = 0; o < r.length; o++) {
        if (a = r[o], s = a.instance, u = a.currentTarget, a = a.listener, s !== i && l.isPropagationStopped()) break e;
        ms(l, a, u), i = s;
      }
    }
  }
  if (vl) throw e = no, vl = !1, no = null, e;
}
function X(e, t) {
  var n = t[po];
  n === void 0 && (n = t[po] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (wc(t, e, 2, !1), n.add(r));
}
function Si(e, t, n) {
  var r = 0;
  t && (r |= 4), wc(n, e, r, t);
}
var Wr = "_reactListening" + Math.random().toString(36).slice(2);
function gr(e) {
  if (!e[Wr]) {
    e[Wr] = !0, ju.forEach(function(n) {
      n !== "selectionchange" && (Fp.has(n) || Si(n, !1, e), Si(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Wr] || (t[Wr] = !0, Si("selectionchange", !1, t));
  }
}
function wc(e, t, n, r) {
  switch (nc(t)) {
    case 1:
      var l = Jf;
      break;
    case 4:
      l = qf;
      break;
    default:
      l = qo;
  }
  n = l.bind(null, t, n, e), l = void 0, !to || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (l = !0), r ? l !== void 0 ? e.addEventListener(t, n, { capture: !0, passive: l }) : e.addEventListener(t, n, !0) : l !== void 0 ? e.addEventListener(t, n, { passive: l }) : e.addEventListener(t, n, !1);
}
function ki(e, t, n, r, l) {
  var i = r;
  if (!(t & 1) && !(t & 2) && r !== null) e: for (; ; ) {
    if (r === null) return;
    var o = r.tag;
    if (o === 3 || o === 4) {
      var a = r.stateNode.containerInfo;
      if (a === l || a.nodeType === 8 && a.parentNode === l) break;
      if (o === 4) for (o = r.return; o !== null; ) {
        var s = o.tag;
        if ((s === 3 || s === 4) && (s = o.stateNode.containerInfo, s === l || s.nodeType === 8 && s.parentNode === l)) return;
        o = o.return;
      }
      for (; a !== null; ) {
        if (o = Wt(a), o === null) return;
        if (s = o.tag, s === 5 || s === 6) {
          r = i = o;
          continue e;
        }
        a = a.parentNode;
      }
    }
    r = r.return;
  }
  Wu(function() {
    var u = i, f = Ko(n), p = [];
    e: {
      var c = vc.get(e);
      if (c !== void 0) {
        var v = ta, y = e;
        switch (e) {
          case "keypress":
            if (ol(n) === 0) break e;
          case "keydown":
          case "keyup":
            v = hp;
            break;
          case "focusin":
            y = "focus", v = mi;
            break;
          case "focusout":
            y = "blur", v = mi;
            break;
          case "beforeblur":
          case "afterblur":
            v = mi;
            break;
          case "click":
            if (n.button === 2) break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            v = rs;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            v = np;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            v = vp;
            break;
          case pc:
          case hc:
          case mc:
            v = ip;
            break;
          case gc:
            v = wp;
            break;
          case "scroll":
            v = ep;
            break;
          case "wheel":
            v = Sp;
            break;
          case "copy":
          case "cut":
          case "paste":
            v = ap;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            v = is;
        }
        var x = (t & 4) !== 0, N = !x && e === "scroll", m = x ? c !== null ? c + "Capture" : null : c;
        x = [];
        for (var h = u, g; h !== null; ) {
          g = h;
          var w = g.stateNode;
          if (g.tag === 5 && w !== null && (g = w, m !== null && (w = cr(h, m), w != null && x.push(vr(h, w, g)))), N) break;
          h = h.return;
        }
        0 < x.length && (c = new v(c, y, null, n, f), p.push({ event: c, listeners: x }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (c = e === "mouseover" || e === "pointerover", v = e === "mouseout" || e === "pointerout", c && n !== qi && (y = n.relatedTarget || n.fromElement) && (Wt(y) || y[pt])) break e;
        if ((v || c) && (c = f.window === f ? f : (c = f.ownerDocument) ? c.defaultView || c.parentWindow : window, v ? (y = n.relatedTarget || n.toElement, v = u, y = y ? Wt(y) : null, y !== null && (N = qt(y), y !== N || y.tag !== 5 && y.tag !== 6) && (y = null)) : (v = null, y = u), v !== y)) {
          if (x = rs, w = "onMouseLeave", m = "onMouseEnter", h = "mouse", (e === "pointerout" || e === "pointerover") && (x = is, w = "onPointerLeave", m = "onPointerEnter", h = "pointer"), N = v == null ? c : dn(v), g = y == null ? c : dn(y), c = new x(w, h + "leave", v, n, f), c.target = N, c.relatedTarget = g, w = null, Wt(f) === u && (x = new x(m, h + "enter", y, n, f), x.target = g, x.relatedTarget = N, w = x), N = w, v && y) t: {
            for (x = v, m = y, h = 0, g = x; g; g = rn(g)) h++;
            for (g = 0, w = m; w; w = rn(w)) g++;
            for (; 0 < h - g; ) x = rn(x), h--;
            for (; 0 < g - h; ) m = rn(m), g--;
            for (; h--; ) {
              if (x === m || m !== null && x === m.alternate) break t;
              x = rn(x), m = rn(m);
            }
            x = null;
          }
          else x = null;
          v !== null && gs(p, c, v, x, !1), y !== null && N !== null && gs(p, N, y, x, !0);
        }
      }
      e: {
        if (c = u ? dn(u) : window, v = c.nodeName && c.nodeName.toLowerCase(), v === "select" || v === "input" && c.type === "file") var C = zp;
        else if (ss(c)) if (sc) C = Rp;
        else {
          C = Tp;
          var z = Np;
        }
        else (v = c.nodeName) && v.toLowerCase() === "input" && (c.type === "checkbox" || c.type === "radio") && (C = Dp);
        if (C && (C = C(e, u))) {
          ac(p, C, n, f);
          break e;
        }
        z && z(e, c, u), e === "focusout" && (z = c._wrapperState) && z.controlled && c.type === "number" && Xi(c, "number", c.value);
      }
      switch (z = u ? dn(u) : window, e) {
        case "focusin":
          (ss(z) || z.contentEditable === "true") && (un = z, oo = u, rr = null);
          break;
        case "focusout":
          rr = oo = un = null;
          break;
        case "mousedown":
          ao = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          ao = !1, ps(p, n, f);
          break;
        case "selectionchange":
          if (Ip) break;
        case "keydown":
        case "keyup":
          ps(p, n, f);
      }
      var T;
      if (ra) e: {
        switch (e) {
          case "compositionstart":
            var R = "onCompositionStart";
            break e;
          case "compositionend":
            R = "onCompositionEnd";
            break e;
          case "compositionupdate":
            R = "onCompositionUpdate";
            break e;
        }
        R = void 0;
      }
      else sn ? ic(e, n) && (R = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (R = "onCompositionStart");
      R && (lc && n.locale !== "ko" && (sn || R !== "onCompositionStart" ? R === "onCompositionEnd" && sn && (T = rc()) : (kt = f, ea = "value" in kt ? kt.value : kt.textContent, sn = !0)), z = kl(u, R), 0 < z.length && (R = new ls(R, e, null, n, f), p.push({ event: R, listeners: z }), T ? R.data = T : (T = oc(n), T !== null && (R.data = T)))), (T = Ep ? _p(e, n) : Cp(e, n)) && (u = kl(u, "onBeforeInput"), 0 < u.length && (f = new ls("onBeforeInput", "beforeinput", null, n, f), p.push({ event: f, listeners: u }), f.data = T));
    }
    yc(p, t);
  });
}
function vr(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function kl(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var l = e, i = l.stateNode;
    l.tag === 5 && i !== null && (l = i, i = cr(e, n), i != null && r.unshift(vr(e, i, l)), i = cr(e, t), i != null && r.push(vr(e, i, l))), e = e.return;
  }
  return r;
}
function rn(e) {
  if (e === null) return null;
  do
    e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function gs(e, t, n, r, l) {
  for (var i = t._reactName, o = []; n !== null && n !== r; ) {
    var a = n, s = a.alternate, u = a.stateNode;
    if (s !== null && s === r) break;
    a.tag === 5 && u !== null && (a = u, l ? (s = cr(n, i), s != null && o.unshift(vr(n, s, a))) : l || (s = cr(n, i), s != null && o.push(vr(n, s, a)))), n = n.return;
  }
  o.length !== 0 && e.push({ event: t, listeners: o });
}
var Op = /\r\n?/g, Up = /\u0000|\uFFFD/g;
function vs(e) {
  return (typeof e == "string" ? e : "" + e).replace(Op, `
`).replace(Up, "");
}
function br(e, t, n) {
  if (t = vs(t), vs(e) !== t && n) throw Error(E(425));
}
function El() {
}
var so = null, uo = null;
function co(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var fo = typeof setTimeout == "function" ? setTimeout : void 0, Bp = typeof clearTimeout == "function" ? clearTimeout : void 0, ys = typeof Promise == "function" ? Promise : void 0, Wp = typeof queueMicrotask == "function" ? queueMicrotask : typeof ys < "u" ? function(e) {
  return ys.resolve(null).then(e).catch(bp);
} : fo;
function bp(e) {
  setTimeout(function() {
    throw e;
  });
}
function Ei(e, t) {
  var n = t, r = 0;
  do {
    var l = n.nextSibling;
    if (e.removeChild(n), l && l.nodeType === 8) if (n = l.data, n === "/$") {
      if (r === 0) {
        e.removeChild(l), pr(t);
        return;
      }
      r--;
    } else n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = l;
  } while (n);
  pr(t);
}
function Pt(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (t = e.data, t === "$" || t === "$!" || t === "$?") break;
      if (t === "/$") return null;
    }
  }
  return e;
}
function ws(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === "$" || n === "$!" || n === "$?") {
        if (t === 0) return e;
        t--;
      } else n === "/$" && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var In = Math.random().toString(36).slice(2), tt = "__reactFiber$" + In, yr = "__reactProps$" + In, pt = "__reactContainer$" + In, po = "__reactEvents$" + In, Vp = "__reactListeners$" + In, Hp = "__reactHandles$" + In;
function Wt(e) {
  var t = e[tt];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[pt] || n[tt]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = ws(e); e !== null; ) {
        if (n = e[tt]) return n;
        e = ws(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function Nr(e) {
  return e = e[tt] || e[pt], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function dn(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(E(33));
}
function bl(e) {
  return e[yr] || null;
}
var ho = [], fn = -1;
function It(e) {
  return { current: e };
}
function K(e) {
  0 > fn || (e.current = ho[fn], ho[fn] = null, fn--);
}
function Y(e, t) {
  fn++, ho[fn] = e.current, e.current = t;
}
var Mt = {}, xe = It(Mt), Ne = It(!1), Yt = Mt;
function jn(e, t) {
  var n = e.type.contextTypes;
  if (!n) return Mt;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var l = {}, i;
  for (i in n) l[i] = t[i];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = l), l;
}
function Te(e) {
  return e = e.childContextTypes, e != null;
}
function _l() {
  K(Ne), K(xe);
}
function xs(e, t, n) {
  if (xe.current !== Mt) throw Error(E(168));
  Y(xe, t), Y(Ne, n);
}
function xc(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var l in r) if (!(l in t)) throw Error(E(108, Nf(e) || "Unknown", l));
  return ee({}, n, r);
}
function Cl(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Mt, Yt = xe.current, Y(xe, e), Y(Ne, Ne.current), !0;
}
function Ss(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(E(169));
  n ? (e = xc(e, t, Yt), r.__reactInternalMemoizedMergedChildContext = e, K(Ne), K(xe), Y(xe, e)) : K(Ne), Y(Ne, n);
}
var st = null, Vl = !1, _i = !1;
function Sc(e) {
  st === null ? st = [e] : st.push(e);
}
function Qp(e) {
  Vl = !0, Sc(e);
}
function $t() {
  if (!_i && st !== null) {
    _i = !0;
    var e = 0, t = H;
    try {
      var n = st;
      for (H = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(!0);
        while (r !== null);
      }
      st = null, Vl = !1;
    } catch (l) {
      throw st !== null && (st = st.slice(e + 1)), Qu(Go, $t), l;
    } finally {
      H = t, _i = !1;
    }
  }
  return null;
}
var pn = [], hn = 0, jl = null, Pl = 0, Oe = [], Ue = 0, Xt = null, ut = 1, ct = "";
function Ut(e, t) {
  pn[hn++] = Pl, pn[hn++] = jl, jl = e, Pl = t;
}
function kc(e, t, n) {
  Oe[Ue++] = ut, Oe[Ue++] = ct, Oe[Ue++] = Xt, Xt = e;
  var r = ut;
  e = ct;
  var l = 32 - Ke(r) - 1;
  r &= ~(1 << l), n += 1;
  var i = 32 - Ke(t) + l;
  if (30 < i) {
    var o = l - l % 5;
    i = (r & (1 << o) - 1).toString(32), r >>= o, l -= o, ut = 1 << 32 - Ke(t) + l | n << l | r, ct = i + e;
  } else ut = 1 << i | n << l | r, ct = e;
}
function ia(e) {
  e.return !== null && (Ut(e, 1), kc(e, 1, 0));
}
function oa(e) {
  for (; e === jl; ) jl = pn[--hn], pn[hn] = null, Pl = pn[--hn], pn[hn] = null;
  for (; e === Xt; ) Xt = Oe[--Ue], Oe[Ue] = null, ct = Oe[--Ue], Oe[Ue] = null, ut = Oe[--Ue], Oe[Ue] = null;
}
var Ie = null, Le = null, Z = !1, Xe = null;
function Ec(e, t) {
  var n = Be(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function ks(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, Ie = e, Le = Pt(t.firstChild), !0) : !1;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, Ie = e, Le = null, !0) : !1;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = Xt !== null ? { id: ut, overflow: ct } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = Be(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, Ie = e, Le = null, !0) : !1;
    default:
      return !1;
  }
}
function mo(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function go(e) {
  if (Z) {
    var t = Le;
    if (t) {
      var n = t;
      if (!ks(e, t)) {
        if (mo(e)) throw Error(E(418));
        t = Pt(n.nextSibling);
        var r = Ie;
        t && ks(e, t) ? Ec(r, n) : (e.flags = e.flags & -4097 | 2, Z = !1, Ie = e);
      }
    } else {
      if (mo(e)) throw Error(E(418));
      e.flags = e.flags & -4097 | 2, Z = !1, Ie = e;
    }
  }
}
function Es(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  Ie = e;
}
function Vr(e) {
  if (e !== Ie) return !1;
  if (!Z) return Es(e), Z = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !co(e.type, e.memoizedProps)), t && (t = Le)) {
    if (mo(e)) throw _c(), Error(E(418));
    for (; t; ) Ec(e, t), t = Pt(t.nextSibling);
  }
  if (Es(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(E(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              Le = Pt(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      Le = null;
    }
  } else Le = Ie ? Pt(e.stateNode.nextSibling) : null;
  return !0;
}
function _c() {
  for (var e = Le; e; ) e = Pt(e.nextSibling);
}
function Pn() {
  Le = Ie = null, Z = !1;
}
function aa(e) {
  Xe === null ? Xe = [e] : Xe.push(e);
}
var Yp = gt.ReactCurrentBatchConfig;
function Hn(e, t, n) {
  if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
    if (n._owner) {
      if (n = n._owner, n) {
        if (n.tag !== 1) throw Error(E(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(E(147, e));
      var l = r, i = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === i ? t.ref : (t = function(o) {
        var a = l.refs;
        o === null ? delete a[i] : a[i] = o;
      }, t._stringRef = i, t);
    }
    if (typeof e != "string") throw Error(E(284));
    if (!n._owner) throw Error(E(290, e));
  }
  return e;
}
function Hr(e, t) {
  throw e = Object.prototype.toString.call(t), Error(E(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function _s(e) {
  var t = e._init;
  return t(e._payload);
}
function Cc(e) {
  function t(m, h) {
    if (e) {
      var g = m.deletions;
      g === null ? (m.deletions = [h], m.flags |= 16) : g.push(h);
    }
  }
  function n(m, h) {
    if (!e) return null;
    for (; h !== null; ) t(m, h), h = h.sibling;
    return null;
  }
  function r(m, h) {
    for (m = /* @__PURE__ */ new Map(); h !== null; ) h.key !== null ? m.set(h.key, h) : m.set(h.index, h), h = h.sibling;
    return m;
  }
  function l(m, h) {
    return m = Dt(m, h), m.index = 0, m.sibling = null, m;
  }
  function i(m, h, g) {
    return m.index = g, e ? (g = m.alternate, g !== null ? (g = g.index, g < h ? (m.flags |= 2, h) : g) : (m.flags |= 2, h)) : (m.flags |= 1048576, h);
  }
  function o(m) {
    return e && m.alternate === null && (m.flags |= 2), m;
  }
  function a(m, h, g, w) {
    return h === null || h.tag !== 6 ? (h = Di(g, m.mode, w), h.return = m, h) : (h = l(h, g), h.return = m, h);
  }
  function s(m, h, g, w) {
    var C = g.type;
    return C === an ? f(m, h, g.props.children, w, g.key) : h !== null && (h.elementType === C || typeof C == "object" && C !== null && C.$$typeof === yt && _s(C) === h.type) ? (w = l(h, g.props), w.ref = Hn(m, h, g), w.return = m, w) : (w = pl(g.type, g.key, g.props, null, m.mode, w), w.ref = Hn(m, h, g), w.return = m, w);
  }
  function u(m, h, g, w) {
    return h === null || h.tag !== 4 || h.stateNode.containerInfo !== g.containerInfo || h.stateNode.implementation !== g.implementation ? (h = Ri(g, m.mode, w), h.return = m, h) : (h = l(h, g.children || []), h.return = m, h);
  }
  function f(m, h, g, w, C) {
    return h === null || h.tag !== 7 ? (h = Qt(g, m.mode, w, C), h.return = m, h) : (h = l(h, g), h.return = m, h);
  }
  function p(m, h, g) {
    if (typeof h == "string" && h !== "" || typeof h == "number") return h = Di("" + h, m.mode, g), h.return = m, h;
    if (typeof h == "object" && h !== null) {
      switch (h.$$typeof) {
        case Lr:
          return g = pl(h.type, h.key, h.props, null, m.mode, g), g.ref = Hn(m, null, h), g.return = m, g;
        case on:
          return h = Ri(h, m.mode, g), h.return = m, h;
        case yt:
          var w = h._init;
          return p(m, w(h._payload), g);
      }
      if (Gn(h) || Un(h)) return h = Qt(h, m.mode, g, null), h.return = m, h;
      Hr(m, h);
    }
    return null;
  }
  function c(m, h, g, w) {
    var C = h !== null ? h.key : null;
    if (typeof g == "string" && g !== "" || typeof g == "number") return C !== null ? null : a(m, h, "" + g, w);
    if (typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case Lr:
          return g.key === C ? s(m, h, g, w) : null;
        case on:
          return g.key === C ? u(m, h, g, w) : null;
        case yt:
          return C = g._init, c(
            m,
            h,
            C(g._payload),
            w
          );
      }
      if (Gn(g) || Un(g)) return C !== null ? null : f(m, h, g, w, null);
      Hr(m, g);
    }
    return null;
  }
  function v(m, h, g, w, C) {
    if (typeof w == "string" && w !== "" || typeof w == "number") return m = m.get(g) || null, a(h, m, "" + w, C);
    if (typeof w == "object" && w !== null) {
      switch (w.$$typeof) {
        case Lr:
          return m = m.get(w.key === null ? g : w.key) || null, s(h, m, w, C);
        case on:
          return m = m.get(w.key === null ? g : w.key) || null, u(h, m, w, C);
        case yt:
          var z = w._init;
          return v(m, h, g, z(w._payload), C);
      }
      if (Gn(w) || Un(w)) return m = m.get(g) || null, f(h, m, w, C, null);
      Hr(h, w);
    }
    return null;
  }
  function y(m, h, g, w) {
    for (var C = null, z = null, T = h, R = h = 0, j = null; T !== null && R < g.length; R++) {
      T.index > R ? (j = T, T = null) : j = T.sibling;
      var _ = c(m, T, g[R], w);
      if (_ === null) {
        T === null && (T = j);
        break;
      }
      e && T && _.alternate === null && t(m, T), h = i(_, h, R), z === null ? C = _ : z.sibling = _, z = _, T = j;
    }
    if (R === g.length) return n(m, T), Z && Ut(m, R), C;
    if (T === null) {
      for (; R < g.length; R++) T = p(m, g[R], w), T !== null && (h = i(T, h, R), z === null ? C = T : z.sibling = T, z = T);
      return Z && Ut(m, R), C;
    }
    for (T = r(m, T); R < g.length; R++) j = v(T, m, R, g[R], w), j !== null && (e && j.alternate !== null && T.delete(j.key === null ? R : j.key), h = i(j, h, R), z === null ? C = j : z.sibling = j, z = j);
    return e && T.forEach(function(Q) {
      return t(m, Q);
    }), Z && Ut(m, R), C;
  }
  function x(m, h, g, w) {
    var C = Un(g);
    if (typeof C != "function") throw Error(E(150));
    if (g = C.call(g), g == null) throw Error(E(151));
    for (var z = C = null, T = h, R = h = 0, j = null, _ = g.next(); T !== null && !_.done; R++, _ = g.next()) {
      T.index > R ? (j = T, T = null) : j = T.sibling;
      var Q = c(m, T, _.value, w);
      if (Q === null) {
        T === null && (T = j);
        break;
      }
      e && T && Q.alternate === null && t(m, T), h = i(Q, h, R), z === null ? C = Q : z.sibling = Q, z = Q, T = j;
    }
    if (_.done) return n(
      m,
      T
    ), Z && Ut(m, R), C;
    if (T === null) {
      for (; !_.done; R++, _ = g.next()) _ = p(m, _.value, w), _ !== null && (h = i(_, h, R), z === null ? C = _ : z.sibling = _, z = _);
      return Z && Ut(m, R), C;
    }
    for (T = r(m, T); !_.done; R++, _ = g.next()) _ = v(T, m, R, _.value, w), _ !== null && (e && _.alternate !== null && T.delete(_.key === null ? R : _.key), h = i(_, h, R), z === null ? C = _ : z.sibling = _, z = _);
    return e && T.forEach(function(Se) {
      return t(m, Se);
    }), Z && Ut(m, R), C;
  }
  function N(m, h, g, w) {
    if (typeof g == "object" && g !== null && g.type === an && g.key === null && (g = g.props.children), typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case Lr:
          e: {
            for (var C = g.key, z = h; z !== null; ) {
              if (z.key === C) {
                if (C = g.type, C === an) {
                  if (z.tag === 7) {
                    n(m, z.sibling), h = l(z, g.props.children), h.return = m, m = h;
                    break e;
                  }
                } else if (z.elementType === C || typeof C == "object" && C !== null && C.$$typeof === yt && _s(C) === z.type) {
                  n(m, z.sibling), h = l(z, g.props), h.ref = Hn(m, z, g), h.return = m, m = h;
                  break e;
                }
                n(m, z);
                break;
              } else t(m, z);
              z = z.sibling;
            }
            g.type === an ? (h = Qt(g.props.children, m.mode, w, g.key), h.return = m, m = h) : (w = pl(g.type, g.key, g.props, null, m.mode, w), w.ref = Hn(m, h, g), w.return = m, m = w);
          }
          return o(m);
        case on:
          e: {
            for (z = g.key; h !== null; ) {
              if (h.key === z) if (h.tag === 4 && h.stateNode.containerInfo === g.containerInfo && h.stateNode.implementation === g.implementation) {
                n(m, h.sibling), h = l(h, g.children || []), h.return = m, m = h;
                break e;
              } else {
                n(m, h);
                break;
              }
              else t(m, h);
              h = h.sibling;
            }
            h = Ri(g, m.mode, w), h.return = m, m = h;
          }
          return o(m);
        case yt:
          return z = g._init, N(m, h, z(g._payload), w);
      }
      if (Gn(g)) return y(m, h, g, w);
      if (Un(g)) return x(m, h, g, w);
      Hr(m, g);
    }
    return typeof g == "string" && g !== "" || typeof g == "number" ? (g = "" + g, h !== null && h.tag === 6 ? (n(m, h.sibling), h = l(h, g), h.return = m, m = h) : (n(m, h), h = Di(g, m.mode, w), h.return = m, m = h), o(m)) : n(m, h);
  }
  return N;
}
var zn = Cc(!0), jc = Cc(!1), zl = It(null), Nl = null, mn = null, sa = null;
function ua() {
  sa = mn = Nl = null;
}
function ca(e) {
  var t = zl.current;
  K(zl), e._currentValue = t;
}
function vo(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function kn(e, t) {
  Nl = e, sa = mn = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (ze = !0), e.firstContext = null);
}
function be(e) {
  var t = e._currentValue;
  if (sa !== e) if (e = { context: e, memoizedValue: t, next: null }, mn === null) {
    if (Nl === null) throw Error(E(308));
    mn = e, Nl.dependencies = { lanes: 0, firstContext: e };
  } else mn = mn.next = e;
  return t;
}
var bt = null;
function da(e) {
  bt === null ? bt = [e] : bt.push(e);
}
function Pc(e, t, n, r) {
  var l = t.interleaved;
  return l === null ? (n.next = n, da(t)) : (n.next = l.next, l.next = n), t.interleaved = n, ht(e, r);
}
function ht(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
  return n.tag === 3 ? n.stateNode : null;
}
var wt = !1;
function fa(e) {
  e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function zc(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function dt(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function zt(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, b & 2) {
    var l = r.pending;
    return l === null ? t.next = t : (t.next = l.next, l.next = t), r.pending = t, ht(e, n);
  }
  return l = r.interleaved, l === null ? (t.next = t, da(r)) : (t.next = l.next, l.next = t), r.interleaved = t, ht(e, n);
}
function al(e, t, n) {
  if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, Zo(e, n);
  }
}
function Cs(e, t) {
  var n = e.updateQueue, r = e.alternate;
  if (r !== null && (r = r.updateQueue, n === r)) {
    var l = null, i = null;
    if (n = n.firstBaseUpdate, n !== null) {
      do {
        var o = { eventTime: n.eventTime, lane: n.lane, tag: n.tag, payload: n.payload, callback: n.callback, next: null };
        i === null ? l = i = o : i = i.next = o, n = n.next;
      } while (n !== null);
      i === null ? l = i = t : i = i.next = t;
    } else l = i = t;
    n = { baseState: r.baseState, firstBaseUpdate: l, lastBaseUpdate: i, shared: r.shared, effects: r.effects }, e.updateQueue = n;
    return;
  }
  e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
}
function Tl(e, t, n, r) {
  var l = e.updateQueue;
  wt = !1;
  var i = l.firstBaseUpdate, o = l.lastBaseUpdate, a = l.shared.pending;
  if (a !== null) {
    l.shared.pending = null;
    var s = a, u = s.next;
    s.next = null, o === null ? i = u : o.next = u, o = s;
    var f = e.alternate;
    f !== null && (f = f.updateQueue, a = f.lastBaseUpdate, a !== o && (a === null ? f.firstBaseUpdate = u : a.next = u, f.lastBaseUpdate = s));
  }
  if (i !== null) {
    var p = l.baseState;
    o = 0, f = u = s = null, a = i;
    do {
      var c = a.lane, v = a.eventTime;
      if ((r & c) === c) {
        f !== null && (f = f.next = {
          eventTime: v,
          lane: 0,
          tag: a.tag,
          payload: a.payload,
          callback: a.callback,
          next: null
        });
        e: {
          var y = e, x = a;
          switch (c = t, v = n, x.tag) {
            case 1:
              if (y = x.payload, typeof y == "function") {
                p = y.call(v, p, c);
                break e;
              }
              p = y;
              break e;
            case 3:
              y.flags = y.flags & -65537 | 128;
            case 0:
              if (y = x.payload, c = typeof y == "function" ? y.call(v, p, c) : y, c == null) break e;
              p = ee({}, p, c);
              break e;
            case 2:
              wt = !0;
          }
        }
        a.callback !== null && a.lane !== 0 && (e.flags |= 64, c = l.effects, c === null ? l.effects = [a] : c.push(a));
      } else v = { eventTime: v, lane: c, tag: a.tag, payload: a.payload, callback: a.callback, next: null }, f === null ? (u = f = v, s = p) : f = f.next = v, o |= c;
      if (a = a.next, a === null) {
        if (a = l.shared.pending, a === null) break;
        c = a, a = c.next, c.next = null, l.lastBaseUpdate = c, l.shared.pending = null;
      }
    } while (!0);
    if (f === null && (s = p), l.baseState = s, l.firstBaseUpdate = u, l.lastBaseUpdate = f, t = l.shared.interleaved, t !== null) {
      l = t;
      do
        o |= l.lane, l = l.next;
      while (l !== t);
    } else i === null && (l.shared.lanes = 0);
    Gt |= o, e.lanes = o, e.memoizedState = p;
  }
}
function js(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], l = r.callback;
    if (l !== null) {
      if (r.callback = null, r = n, typeof l != "function") throw Error(E(191, l));
      l.call(r);
    }
  }
}
var Tr = {}, rt = It(Tr), wr = It(Tr), xr = It(Tr);
function Vt(e) {
  if (e === Tr) throw Error(E(174));
  return e;
}
function pa(e, t) {
  switch (Y(xr, t), Y(wr, e), Y(rt, Tr), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Gi(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Gi(t, e);
  }
  K(rt), Y(rt, t);
}
function Nn() {
  K(rt), K(wr), K(xr);
}
function Nc(e) {
  Vt(xr.current);
  var t = Vt(rt.current), n = Gi(t, e.type);
  t !== n && (Y(wr, e), Y(rt, n));
}
function ha(e) {
  wr.current === e && (K(rt), K(wr));
}
var J = It(0);
function Dl(e) {
  for (var t = e; t !== null; ) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (n !== null && (n = n.dehydrated, n === null || n.data === "$?" || n.data === "$!")) return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      t.child.return = t, t = t.child;
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    t.sibling.return = t.return, t = t.sibling;
  }
  return null;
}
var Ci = [];
function ma() {
  for (var e = 0; e < Ci.length; e++) Ci[e]._workInProgressVersionPrimary = null;
  Ci.length = 0;
}
var sl = gt.ReactCurrentDispatcher, ji = gt.ReactCurrentBatchConfig, Kt = 0, q = null, ae = null, ue = null, Rl = !1, lr = !1, Sr = 0, Xp = 0;
function ge() {
  throw Error(E(321));
}
function ga(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!Ze(e[n], t[n])) return !1;
  return !0;
}
function va(e, t, n, r, l, i) {
  if (Kt = i, q = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, sl.current = e === null || e.memoizedState === null ? Jp : qp, e = n(r, l), lr) {
    i = 0;
    do {
      if (lr = !1, Sr = 0, 25 <= i) throw Error(E(301));
      i += 1, ue = ae = null, t.updateQueue = null, sl.current = eh, e = n(r, l);
    } while (lr);
  }
  if (sl.current = Ml, t = ae !== null && ae.next !== null, Kt = 0, ue = ae = q = null, Rl = !1, t) throw Error(E(300));
  return e;
}
function ya() {
  var e = Sr !== 0;
  return Sr = 0, e;
}
function et() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return ue === null ? q.memoizedState = ue = e : ue = ue.next = e, ue;
}
function Ve() {
  if (ae === null) {
    var e = q.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = ae.next;
  var t = ue === null ? q.memoizedState : ue.next;
  if (t !== null) ue = t, ae = e;
  else {
    if (e === null) throw Error(E(310));
    ae = e, e = { memoizedState: ae.memoizedState, baseState: ae.baseState, baseQueue: ae.baseQueue, queue: ae.queue, next: null }, ue === null ? q.memoizedState = ue = e : ue = ue.next = e;
  }
  return ue;
}
function kr(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function Pi(e) {
  var t = Ve(), n = t.queue;
  if (n === null) throw Error(E(311));
  n.lastRenderedReducer = e;
  var r = ae, l = r.baseQueue, i = n.pending;
  if (i !== null) {
    if (l !== null) {
      var o = l.next;
      l.next = i.next, i.next = o;
    }
    r.baseQueue = l = i, n.pending = null;
  }
  if (l !== null) {
    i = l.next, r = r.baseState;
    var a = o = null, s = null, u = i;
    do {
      var f = u.lane;
      if ((Kt & f) === f) s !== null && (s = s.next = { lane: 0, action: u.action, hasEagerState: u.hasEagerState, eagerState: u.eagerState, next: null }), r = u.hasEagerState ? u.eagerState : e(r, u.action);
      else {
        var p = {
          lane: f,
          action: u.action,
          hasEagerState: u.hasEagerState,
          eagerState: u.eagerState,
          next: null
        };
        s === null ? (a = s = p, o = r) : s = s.next = p, q.lanes |= f, Gt |= f;
      }
      u = u.next;
    } while (u !== null && u !== i);
    s === null ? o = r : s.next = a, Ze(r, t.memoizedState) || (ze = !0), t.memoizedState = r, t.baseState = o, t.baseQueue = s, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    l = e;
    do
      i = l.lane, q.lanes |= i, Gt |= i, l = l.next;
    while (l !== e);
  } else l === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function zi(e) {
  var t = Ve(), n = t.queue;
  if (n === null) throw Error(E(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch, l = n.pending, i = t.memoizedState;
  if (l !== null) {
    n.pending = null;
    var o = l = l.next;
    do
      i = e(i, o.action), o = o.next;
    while (o !== l);
    Ze(i, t.memoizedState) || (ze = !0), t.memoizedState = i, t.baseQueue === null && (t.baseState = i), n.lastRenderedState = i;
  }
  return [i, r];
}
function Tc() {
}
function Dc(e, t) {
  var n = q, r = Ve(), l = t(), i = !Ze(r.memoizedState, l);
  if (i && (r.memoizedState = l, ze = !0), r = r.queue, wa(Lc.bind(null, n, r, e), [e]), r.getSnapshot !== t || i || ue !== null && ue.memoizedState.tag & 1) {
    if (n.flags |= 2048, Er(9, Mc.bind(null, n, r, l, t), void 0, null), ce === null) throw Error(E(349));
    Kt & 30 || Rc(n, t, l);
  }
  return l;
}
function Rc(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = q.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, q.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function Mc(e, t, n, r) {
  t.value = n, t.getSnapshot = r, Ic(t) && $c(e);
}
function Lc(e, t, n) {
  return n(function() {
    Ic(t) && $c(e);
  });
}
function Ic(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Ze(e, n);
  } catch {
    return !0;
  }
}
function $c(e) {
  var t = ht(e, 1);
  t !== null && Ge(t, e, 1, -1);
}
function Ps(e) {
  var t = et();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: kr, lastRenderedState: e }, t.queue = e, e = e.dispatch = Zp.bind(null, q, e), [t.memoizedState, e];
}
function Er(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = q.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, q.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function Ac() {
  return Ve().memoizedState;
}
function ul(e, t, n, r) {
  var l = et();
  q.flags |= e, l.memoizedState = Er(1 | t, n, void 0, r === void 0 ? null : r);
}
function Hl(e, t, n, r) {
  var l = Ve();
  r = r === void 0 ? null : r;
  var i = void 0;
  if (ae !== null) {
    var o = ae.memoizedState;
    if (i = o.destroy, r !== null && ga(r, o.deps)) {
      l.memoizedState = Er(t, n, i, r);
      return;
    }
  }
  q.flags |= e, l.memoizedState = Er(1 | t, n, i, r);
}
function zs(e, t) {
  return ul(8390656, 8, e, t);
}
function wa(e, t) {
  return Hl(2048, 8, e, t);
}
function Fc(e, t) {
  return Hl(4, 2, e, t);
}
function Oc(e, t) {
  return Hl(4, 4, e, t);
}
function Uc(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function Bc(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Hl(4, 4, Uc.bind(null, t, e), n);
}
function xa() {
}
function Wc(e, t) {
  var n = Ve();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && ga(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function bc(e, t) {
  var n = Ve();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && ga(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function Vc(e, t, n) {
  return Kt & 21 ? (Ze(n, t) || (n = Ku(), q.lanes |= n, Gt |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, ze = !0), e.memoizedState = n);
}
function Kp(e, t) {
  var n = H;
  H = n !== 0 && 4 > n ? n : 4, e(!0);
  var r = ji.transition;
  ji.transition = {};
  try {
    e(!1), t();
  } finally {
    H = n, ji.transition = r;
  }
}
function Hc() {
  return Ve().memoizedState;
}
function Gp(e, t, n) {
  var r = Tt(e);
  if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, Qc(e)) Yc(t, n);
  else if (n = Pc(e, t, n, r), n !== null) {
    var l = Ee();
    Ge(n, e, r, l), Xc(n, t, r);
  }
}
function Zp(e, t, n) {
  var r = Tt(e), l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (Qc(e)) Yc(t, l);
  else {
    var i = e.alternate;
    if (e.lanes === 0 && (i === null || i.lanes === 0) && (i = t.lastRenderedReducer, i !== null)) try {
      var o = t.lastRenderedState, a = i(o, n);
      if (l.hasEagerState = !0, l.eagerState = a, Ze(a, o)) {
        var s = t.interleaved;
        s === null ? (l.next = l, da(t)) : (l.next = s.next, s.next = l), t.interleaved = l;
        return;
      }
    } catch {
    } finally {
    }
    n = Pc(e, t, l, r), n !== null && (l = Ee(), Ge(n, e, r, l), Xc(n, t, r));
  }
}
function Qc(e) {
  var t = e.alternate;
  return e === q || t !== null && t === q;
}
function Yc(e, t) {
  lr = Rl = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function Xc(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, Zo(e, n);
  }
}
var Ml = { readContext: be, useCallback: ge, useContext: ge, useEffect: ge, useImperativeHandle: ge, useInsertionEffect: ge, useLayoutEffect: ge, useMemo: ge, useReducer: ge, useRef: ge, useState: ge, useDebugValue: ge, useDeferredValue: ge, useTransition: ge, useMutableSource: ge, useSyncExternalStore: ge, useId: ge, unstable_isNewReconciler: !1 }, Jp = { readContext: be, useCallback: function(e, t) {
  return et().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: be, useEffect: zs, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, ul(
    4194308,
    4,
    Uc.bind(null, t, e),
    n
  );
}, useLayoutEffect: function(e, t) {
  return ul(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return ul(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = et();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = et();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = Gp.bind(null, q, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = et();
  return e = { current: e }, t.memoizedState = e;
}, useState: Ps, useDebugValue: xa, useDeferredValue: function(e) {
  return et().memoizedState = e;
}, useTransition: function() {
  var e = Ps(!1), t = e[0];
  return e = Kp.bind(null, e[1]), et().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = q, l = et();
  if (Z) {
    if (n === void 0) throw Error(E(407));
    n = n();
  } else {
    if (n = t(), ce === null) throw Error(E(349));
    Kt & 30 || Rc(r, t, n);
  }
  l.memoizedState = n;
  var i = { value: n, getSnapshot: t };
  return l.queue = i, zs(Lc.bind(
    null,
    r,
    i,
    e
  ), [e]), r.flags |= 2048, Er(9, Mc.bind(null, r, i, n, t), void 0, null), n;
}, useId: function() {
  var e = et(), t = ce.identifierPrefix;
  if (Z) {
    var n = ct, r = ut;
    n = (r & ~(1 << 32 - Ke(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = Sr++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = Xp++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: !1 }, qp = {
  readContext: be,
  useCallback: Wc,
  useContext: be,
  useEffect: wa,
  useImperativeHandle: Bc,
  useInsertionEffect: Fc,
  useLayoutEffect: Oc,
  useMemo: bc,
  useReducer: Pi,
  useRef: Ac,
  useState: function() {
    return Pi(kr);
  },
  useDebugValue: xa,
  useDeferredValue: function(e) {
    var t = Ve();
    return Vc(t, ae.memoizedState, e);
  },
  useTransition: function() {
    var e = Pi(kr)[0], t = Ve().memoizedState;
    return [e, t];
  },
  useMutableSource: Tc,
  useSyncExternalStore: Dc,
  useId: Hc,
  unstable_isNewReconciler: !1
}, eh = { readContext: be, useCallback: Wc, useContext: be, useEffect: wa, useImperativeHandle: Bc, useInsertionEffect: Fc, useLayoutEffect: Oc, useMemo: bc, useReducer: zi, useRef: Ac, useState: function() {
  return zi(kr);
}, useDebugValue: xa, useDeferredValue: function(e) {
  var t = Ve();
  return ae === null ? t.memoizedState = e : Vc(t, ae.memoizedState, e);
}, useTransition: function() {
  var e = zi(kr)[0], t = Ve().memoizedState;
  return [e, t];
}, useMutableSource: Tc, useSyncExternalStore: Dc, useId: Hc, unstable_isNewReconciler: !1 };
function Qe(e, t) {
  if (e && e.defaultProps) {
    t = ee({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function yo(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : ee({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var Ql = { isMounted: function(e) {
  return (e = e._reactInternals) ? qt(e) === e : !1;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = Ee(), l = Tt(e), i = dt(r, l);
  i.payload = t, n != null && (i.callback = n), t = zt(e, i, l), t !== null && (Ge(t, e, l, r), al(t, e, l));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = Ee(), l = Tt(e), i = dt(r, l);
  i.tag = 1, i.payload = t, n != null && (i.callback = n), t = zt(e, i, l), t !== null && (Ge(t, e, l, r), al(t, e, l));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = Ee(), r = Tt(e), l = dt(n, r);
  l.tag = 2, t != null && (l.callback = t), t = zt(e, l, r), t !== null && (Ge(t, e, r, n), al(t, e, r));
} };
function Ns(e, t, n, r, l, i, o) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, i, o) : t.prototype && t.prototype.isPureReactComponent ? !mr(n, r) || !mr(l, i) : !0;
}
function Kc(e, t, n) {
  var r = !1, l = Mt, i = t.contextType;
  return typeof i == "object" && i !== null ? i = be(i) : (l = Te(t) ? Yt : xe.current, r = t.contextTypes, i = (r = r != null) ? jn(e, l) : Mt), t = new t(n, i), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = Ql, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = l, e.__reactInternalMemoizedMaskedChildContext = i), t;
}
function Ts(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Ql.enqueueReplaceState(t, t.state, null);
}
function wo(e, t, n, r) {
  var l = e.stateNode;
  l.props = n, l.state = e.memoizedState, l.refs = {}, fa(e);
  var i = t.contextType;
  typeof i == "object" && i !== null ? l.context = be(i) : (i = Te(t) ? Yt : xe.current, l.context = jn(e, i)), l.state = e.memoizedState, i = t.getDerivedStateFromProps, typeof i == "function" && (yo(e, t, i, n), l.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof l.getSnapshotBeforeUpdate == "function" || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (t = l.state, typeof l.componentWillMount == "function" && l.componentWillMount(), typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount(), t !== l.state && Ql.enqueueReplaceState(l, l.state, null), Tl(e, n, l, r), l.state = e.memoizedState), typeof l.componentDidMount == "function" && (e.flags |= 4194308);
}
function Tn(e, t) {
  try {
    var n = "", r = t;
    do
      n += zf(r), r = r.return;
    while (r);
    var l = n;
  } catch (i) {
    l = `
Error generating stack: ` + i.message + `
` + i.stack;
  }
  return { value: e, source: t, stack: l, digest: null };
}
function Ni(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function xo(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function() {
      throw n;
    });
  }
}
var th = typeof WeakMap == "function" ? WeakMap : Map;
function Gc(e, t, n) {
  n = dt(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    Il || (Il = !0, To = r), xo(e, t);
  }, n;
}
function Zc(e, t, n) {
  n = dt(-1, n), n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var l = t.value;
    n.payload = function() {
      return r(l);
    }, n.callback = function() {
      xo(e, t);
    };
  }
  var i = e.stateNode;
  return i !== null && typeof i.componentDidCatch == "function" && (n.callback = function() {
    xo(e, t), typeof r != "function" && (Nt === null ? Nt = /* @__PURE__ */ new Set([this]) : Nt.add(this));
    var o = t.stack;
    this.componentDidCatch(t.value, { componentStack: o !== null ? o : "" });
  }), n;
}
function Ds(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new th();
    var l = /* @__PURE__ */ new Set();
    r.set(t, l);
  } else l = r.get(t), l === void 0 && (l = /* @__PURE__ */ new Set(), r.set(t, l));
  l.has(n) || (l.add(n), e = mh.bind(null, e, t, n), t.then(e, e));
}
function Rs(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function Ms(e, t, n, r, l) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = l, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = dt(-1, 1), t.tag = 2, zt(n, t, 1))), n.lanes |= 1), e);
}
var nh = gt.ReactCurrentOwner, ze = !1;
function ke(e, t, n, r) {
  t.child = e === null ? jc(t, null, n, r) : zn(t, e.child, n, r);
}
function Ls(e, t, n, r, l) {
  n = n.render;
  var i = t.ref;
  return kn(t, l), r = va(e, t, n, r, i, l), n = ya(), e !== null && !ze ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, mt(e, t, l)) : (Z && n && ia(t), t.flags |= 1, ke(e, t, r, l), t.child);
}
function Is(e, t, n, r, l) {
  if (e === null) {
    var i = n.type;
    return typeof i == "function" && !za(i) && i.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = i, Jc(e, t, i, r, l)) : (e = pl(n.type, null, r, t, t.mode, l), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (i = e.child, !(e.lanes & l)) {
    var o = i.memoizedProps;
    if (n = n.compare, n = n !== null ? n : mr, n(o, r) && e.ref === t.ref) return mt(e, t, l);
  }
  return t.flags |= 1, e = Dt(i, r), e.ref = t.ref, e.return = t, t.child = e;
}
function Jc(e, t, n, r, l) {
  if (e !== null) {
    var i = e.memoizedProps;
    if (mr(i, r) && e.ref === t.ref) if (ze = !1, t.pendingProps = r = i, (e.lanes & l) !== 0) e.flags & 131072 && (ze = !0);
    else return t.lanes = e.lanes, mt(e, t, l);
  }
  return So(e, t, n, r, l);
}
function qc(e, t, n) {
  var r = t.pendingProps, l = r.children, i = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Y(vn, Me), Me |= n;
  else {
    if (!(n & 1073741824)) return e = i !== null ? i.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, Y(vn, Me), Me |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = i !== null ? i.baseLanes : n, Y(vn, Me), Me |= r;
  }
  else i !== null ? (r = i.baseLanes | n, t.memoizedState = null) : r = n, Y(vn, Me), Me |= r;
  return ke(e, t, l, n), t.child;
}
function ed(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function So(e, t, n, r, l) {
  var i = Te(n) ? Yt : xe.current;
  return i = jn(t, i), kn(t, l), n = va(e, t, n, r, i, l), r = ya(), e !== null && !ze ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, mt(e, t, l)) : (Z && r && ia(t), t.flags |= 1, ke(e, t, n, l), t.child);
}
function $s(e, t, n, r, l) {
  if (Te(n)) {
    var i = !0;
    Cl(t);
  } else i = !1;
  if (kn(t, l), t.stateNode === null) cl(e, t), Kc(t, n, r), wo(t, n, r, l), r = !0;
  else if (e === null) {
    var o = t.stateNode, a = t.memoizedProps;
    o.props = a;
    var s = o.context, u = n.contextType;
    typeof u == "object" && u !== null ? u = be(u) : (u = Te(n) ? Yt : xe.current, u = jn(t, u));
    var f = n.getDerivedStateFromProps, p = typeof f == "function" || typeof o.getSnapshotBeforeUpdate == "function";
    p || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (a !== r || s !== u) && Ts(t, o, r, u), wt = !1;
    var c = t.memoizedState;
    o.state = c, Tl(t, r, o, l), s = t.memoizedState, a !== r || c !== s || Ne.current || wt ? (typeof f == "function" && (yo(t, n, f, r), s = t.memoizedState), (a = wt || Ns(t, n, a, r, c, s, u)) ? (p || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = s), o.props = r, o.state = s, o.context = u, r = a) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    o = t.stateNode, zc(e, t), a = t.memoizedProps, u = t.type === t.elementType ? a : Qe(t.type, a), o.props = u, p = t.pendingProps, c = o.context, s = n.contextType, typeof s == "object" && s !== null ? s = be(s) : (s = Te(n) ? Yt : xe.current, s = jn(t, s));
    var v = n.getDerivedStateFromProps;
    (f = typeof v == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (a !== p || c !== s) && Ts(t, o, r, s), wt = !1, c = t.memoizedState, o.state = c, Tl(t, r, o, l);
    var y = t.memoizedState;
    a !== p || c !== y || Ne.current || wt ? (typeof v == "function" && (yo(t, n, v, r), y = t.memoizedState), (u = wt || Ns(t, n, u, r, c, y, s) || !1) ? (f || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, y, s), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, y, s)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || a === e.memoizedProps && c === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && c === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = y), o.props = r, o.state = y, o.context = s, r = u) : (typeof o.componentDidUpdate != "function" || a === e.memoizedProps && c === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && c === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return ko(e, t, n, r, i, l);
}
function ko(e, t, n, r, l, i) {
  ed(e, t);
  var o = (t.flags & 128) !== 0;
  if (!r && !o) return l && Ss(t, n, !1), mt(e, t, i);
  r = t.stateNode, nh.current = t;
  var a = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && o ? (t.child = zn(t, e.child, null, i), t.child = zn(t, null, a, i)) : ke(e, t, a, i), t.memoizedState = r.state, l && Ss(t, n, !0), t.child;
}
function td(e) {
  var t = e.stateNode;
  t.pendingContext ? xs(e, t.pendingContext, t.pendingContext !== t.context) : t.context && xs(e, t.context, !1), pa(e, t.containerInfo);
}
function As(e, t, n, r, l) {
  return Pn(), aa(l), t.flags |= 256, ke(e, t, n, r), t.child;
}
var Eo = { dehydrated: null, treeContext: null, retryLane: 0 };
function _o(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function nd(e, t, n) {
  var r = t.pendingProps, l = J.current, i = !1, o = (t.flags & 128) !== 0, a;
  if ((a = o) || (a = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0), a ? (i = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (l |= 1), Y(J, l & 1), e === null)
    return go(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (o = r.children, e = r.fallback, i ? (r = t.mode, i = t.child, o = { mode: "hidden", children: o }, !(r & 1) && i !== null ? (i.childLanes = 0, i.pendingProps = o) : i = Kl(o, r, 0, null), e = Qt(e, r, n, null), i.return = t, e.return = t, i.sibling = e, t.child = i, t.child.memoizedState = _o(n), t.memoizedState = Eo, e) : Sa(t, o));
  if (l = e.memoizedState, l !== null && (a = l.dehydrated, a !== null)) return rh(e, t, o, r, a, l, n);
  if (i) {
    i = r.fallback, o = t.mode, l = e.child, a = l.sibling;
    var s = { mode: "hidden", children: r.children };
    return !(o & 1) && t.child !== l ? (r = t.child, r.childLanes = 0, r.pendingProps = s, t.deletions = null) : (r = Dt(l, s), r.subtreeFlags = l.subtreeFlags & 14680064), a !== null ? i = Dt(a, i) : (i = Qt(i, o, n, null), i.flags |= 2), i.return = t, r.return = t, r.sibling = i, t.child = r, r = i, i = t.child, o = e.child.memoizedState, o = o === null ? _o(n) : { baseLanes: o.baseLanes | n, cachePool: null, transitions: o.transitions }, i.memoizedState = o, i.childLanes = e.childLanes & ~n, t.memoizedState = Eo, r;
  }
  return i = e.child, e = i.sibling, r = Dt(i, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function Sa(e, t) {
  return t = Kl({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function Qr(e, t, n, r) {
  return r !== null && aa(r), zn(t, e.child, null, n), e = Sa(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function rh(e, t, n, r, l, i, o) {
  if (n)
    return t.flags & 256 ? (t.flags &= -257, r = Ni(Error(E(422))), Qr(e, t, o, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (i = r.fallback, l = t.mode, r = Kl({ mode: "visible", children: r.children }, l, 0, null), i = Qt(i, l, o, null), i.flags |= 2, r.return = t, i.return = t, r.sibling = i, t.child = r, t.mode & 1 && zn(t, e.child, null, o), t.child.memoizedState = _o(o), t.memoizedState = Eo, i);
  if (!(t.mode & 1)) return Qr(e, t, o, null);
  if (l.data === "$!") {
    if (r = l.nextSibling && l.nextSibling.dataset, r) var a = r.dgst;
    return r = a, i = Error(E(419)), r = Ni(i, r, void 0), Qr(e, t, o, r);
  }
  if (a = (o & e.childLanes) !== 0, ze || a) {
    if (r = ce, r !== null) {
      switch (o & -o) {
        case 4:
          l = 2;
          break;
        case 16:
          l = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          l = 32;
          break;
        case 536870912:
          l = 268435456;
          break;
        default:
          l = 0;
      }
      l = l & (r.suspendedLanes | o) ? 0 : l, l !== 0 && l !== i.retryLane && (i.retryLane = l, ht(e, l), Ge(r, e, l, -1));
    }
    return Pa(), r = Ni(Error(E(421))), Qr(e, t, o, r);
  }
  return l.data === "$?" ? (t.flags |= 128, t.child = e.child, t = gh.bind(null, e), l._reactRetry = t, null) : (e = i.treeContext, Le = Pt(l.nextSibling), Ie = t, Z = !0, Xe = null, e !== null && (Oe[Ue++] = ut, Oe[Ue++] = ct, Oe[Ue++] = Xt, ut = e.id, ct = e.overflow, Xt = t), t = Sa(t, r.children), t.flags |= 4096, t);
}
function Fs(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), vo(e.return, t, n);
}
function Ti(e, t, n, r, l) {
  var i = e.memoizedState;
  i === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: l } : (i.isBackwards = t, i.rendering = null, i.renderingStartTime = 0, i.last = r, i.tail = n, i.tailMode = l);
}
function rd(e, t, n) {
  var r = t.pendingProps, l = r.revealOrder, i = r.tail;
  if (ke(e, t, r.children, n), r = J.current, r & 2) r = r & 1 | 2, t.flags |= 128;
  else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && Fs(e, n, t);
      else if (e.tag === 19) Fs(e, n, t);
      else if (e.child !== null) {
        e.child.return = e, e = e.child;
        continue;
      }
      if (e === t) break e;
      for (; e.sibling === null; ) {
        if (e.return === null || e.return === t) break e;
        e = e.return;
      }
      e.sibling.return = e.return, e = e.sibling;
    }
    r &= 1;
  }
  if (Y(J, r), !(t.mode & 1)) t.memoizedState = null;
  else switch (l) {
    case "forwards":
      for (n = t.child, l = null; n !== null; ) e = n.alternate, e !== null && Dl(e) === null && (l = n), n = n.sibling;
      n = l, n === null ? (l = t.child, t.child = null) : (l = n.sibling, n.sibling = null), Ti(t, !1, l, n, i);
      break;
    case "backwards":
      for (n = null, l = t.child, t.child = null; l !== null; ) {
        if (e = l.alternate, e !== null && Dl(e) === null) {
          t.child = l;
          break;
        }
        e = l.sibling, l.sibling = n, n = l, l = e;
      }
      Ti(t, !0, n, null, i);
      break;
    case "together":
      Ti(t, !1, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function cl(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
}
function mt(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), Gt |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(E(153));
  if (t.child !== null) {
    for (e = t.child, n = Dt(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = Dt(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function lh(e, t, n) {
  switch (t.tag) {
    case 3:
      td(t), Pn();
      break;
    case 5:
      Nc(t);
      break;
    case 1:
      Te(t.type) && Cl(t);
      break;
    case 4:
      pa(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, l = t.memoizedProps.value;
      Y(zl, r._currentValue), r._currentValue = l;
      break;
    case 13:
      if (r = t.memoizedState, r !== null)
        return r.dehydrated !== null ? (Y(J, J.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? nd(e, t, n) : (Y(J, J.current & 1), e = mt(e, t, n), e !== null ? e.sibling : null);
      Y(J, J.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return rd(e, t, n);
        t.flags |= 128;
      }
      if (l = t.memoizedState, l !== null && (l.rendering = null, l.tail = null, l.lastEffect = null), Y(J, J.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, qc(e, t, n);
  }
  return mt(e, t, n);
}
var ld, Co, id, od;
ld = function(e, t) {
  for (var n = t.child; n !== null; ) {
    if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
    else if (n.tag !== 4 && n.child !== null) {
      n.child.return = n, n = n.child;
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null; ) {
      if (n.return === null || n.return === t) return;
      n = n.return;
    }
    n.sibling.return = n.return, n = n.sibling;
  }
};
Co = function() {
};
id = function(e, t, n, r) {
  var l = e.memoizedProps;
  if (l !== r) {
    e = t.stateNode, Vt(rt.current);
    var i = null;
    switch (n) {
      case "input":
        l = Qi(e, l), r = Qi(e, r), i = [];
        break;
      case "select":
        l = ee({}, l, { value: void 0 }), r = ee({}, r, { value: void 0 }), i = [];
        break;
      case "textarea":
        l = Ki(e, l), r = Ki(e, r), i = [];
        break;
      default:
        typeof l.onClick != "function" && typeof r.onClick == "function" && (e.onclick = El);
    }
    Zi(n, r);
    var o;
    n = null;
    for (u in l) if (!r.hasOwnProperty(u) && l.hasOwnProperty(u) && l[u] != null) if (u === "style") {
      var a = l[u];
      for (o in a) a.hasOwnProperty(o) && (n || (n = {}), n[o] = "");
    } else u !== "dangerouslySetInnerHTML" && u !== "children" && u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && u !== "autoFocus" && (sr.hasOwnProperty(u) ? i || (i = []) : (i = i || []).push(u, null));
    for (u in r) {
      var s = r[u];
      if (a = l != null ? l[u] : void 0, r.hasOwnProperty(u) && s !== a && (s != null || a != null)) if (u === "style") if (a) {
        for (o in a) !a.hasOwnProperty(o) || s && s.hasOwnProperty(o) || (n || (n = {}), n[o] = "");
        for (o in s) s.hasOwnProperty(o) && a[o] !== s[o] && (n || (n = {}), n[o] = s[o]);
      } else n || (i || (i = []), i.push(
        u,
        n
      )), n = s;
      else u === "dangerouslySetInnerHTML" ? (s = s ? s.__html : void 0, a = a ? a.__html : void 0, s != null && a !== s && (i = i || []).push(u, s)) : u === "children" ? typeof s != "string" && typeof s != "number" || (i = i || []).push(u, "" + s) : u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && (sr.hasOwnProperty(u) ? (s != null && u === "onScroll" && X("scroll", e), i || a === s || (i = [])) : (i = i || []).push(u, s));
    }
    n && (i = i || []).push("style", n);
    var u = i;
    (t.updateQueue = u) && (t.flags |= 4);
  }
};
od = function(e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function Qn(e, t) {
  if (!Z) switch (e.tailMode) {
    case "hidden":
      t = e.tail;
      for (var n = null; t !== null; ) t.alternate !== null && (n = t), t = t.sibling;
      n === null ? e.tail = null : n.sibling = null;
      break;
    case "collapsed":
      n = e.tail;
      for (var r = null; n !== null; ) n.alternate !== null && (r = n), n = n.sibling;
      r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
  }
}
function ve(e) {
  var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
  if (t) for (var l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags & 14680064, r |= l.flags & 14680064, l.return = e, l = l.sibling;
  else for (l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags, r |= l.flags, l.return = e, l = l.sibling;
  return e.subtreeFlags |= r, e.childLanes = n, t;
}
function ih(e, t, n) {
  var r = t.pendingProps;
  switch (oa(t), t.tag) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return ve(t), null;
    case 1:
      return Te(t.type) && _l(), ve(t), null;
    case 3:
      return r = t.stateNode, Nn(), K(Ne), K(xe), ma(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (Vr(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Xe !== null && (Mo(Xe), Xe = null))), Co(e, t), ve(t), null;
    case 5:
      ha(t);
      var l = Vt(xr.current);
      if (n = t.type, e !== null && t.stateNode != null) id(e, t, n, r, l), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(E(166));
          return ve(t), null;
        }
        if (e = Vt(rt.current), Vr(t)) {
          r = t.stateNode, n = t.type;
          var i = t.memoizedProps;
          switch (r[tt] = t, r[yr] = i, e = (t.mode & 1) !== 0, n) {
            case "dialog":
              X("cancel", r), X("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              X("load", r);
              break;
            case "video":
            case "audio":
              for (l = 0; l < Jn.length; l++) X(Jn[l], r);
              break;
            case "source":
              X("error", r);
              break;
            case "img":
            case "image":
            case "link":
              X(
                "error",
                r
              ), X("load", r);
              break;
            case "details":
              X("toggle", r);
              break;
            case "input":
              Ya(r, i), X("invalid", r);
              break;
            case "select":
              r._wrapperState = { wasMultiple: !!i.multiple }, X("invalid", r);
              break;
            case "textarea":
              Ka(r, i), X("invalid", r);
          }
          Zi(n, i), l = null;
          for (var o in i) if (i.hasOwnProperty(o)) {
            var a = i[o];
            o === "children" ? typeof a == "string" ? r.textContent !== a && (i.suppressHydrationWarning !== !0 && br(r.textContent, a, e), l = ["children", a]) : typeof a == "number" && r.textContent !== "" + a && (i.suppressHydrationWarning !== !0 && br(
              r.textContent,
              a,
              e
            ), l = ["children", "" + a]) : sr.hasOwnProperty(o) && a != null && o === "onScroll" && X("scroll", r);
          }
          switch (n) {
            case "input":
              Ir(r), Xa(r, i, !0);
              break;
            case "textarea":
              Ir(r), Ga(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof i.onClick == "function" && (r.onclick = El);
          }
          r = l, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          o = l.nodeType === 9 ? l : l.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Lu(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = o.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = o.createElement(n, { is: r.is }) : (e = o.createElement(n), n === "select" && (o = e, r.multiple ? o.multiple = !0 : r.size && (o.size = r.size))) : e = o.createElementNS(e, n), e[tt] = t, e[yr] = r, ld(e, t, !1, !1), t.stateNode = e;
          e: {
            switch (o = Ji(n, r), n) {
              case "dialog":
                X("cancel", e), X("close", e), l = r;
                break;
              case "iframe":
              case "object":
              case "embed":
                X("load", e), l = r;
                break;
              case "video":
              case "audio":
                for (l = 0; l < Jn.length; l++) X(Jn[l], e);
                l = r;
                break;
              case "source":
                X("error", e), l = r;
                break;
              case "img":
              case "image":
              case "link":
                X(
                  "error",
                  e
                ), X("load", e), l = r;
                break;
              case "details":
                X("toggle", e), l = r;
                break;
              case "input":
                Ya(e, r), l = Qi(e, r), X("invalid", e);
                break;
              case "option":
                l = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, l = ee({}, r, { value: void 0 }), X("invalid", e);
                break;
              case "textarea":
                Ka(e, r), l = Ki(e, r), X("invalid", e);
                break;
              default:
                l = r;
            }
            Zi(n, l), a = l;
            for (i in a) if (a.hasOwnProperty(i)) {
              var s = a[i];
              i === "style" ? Au(e, s) : i === "dangerouslySetInnerHTML" ? (s = s ? s.__html : void 0, s != null && Iu(e, s)) : i === "children" ? typeof s == "string" ? (n !== "textarea" || s !== "") && ur(e, s) : typeof s == "number" && ur(e, "" + s) : i !== "suppressContentEditableWarning" && i !== "suppressHydrationWarning" && i !== "autoFocus" && (sr.hasOwnProperty(i) ? s != null && i === "onScroll" && X("scroll", e) : s != null && Ho(e, i, s, o));
            }
            switch (n) {
              case "input":
                Ir(e), Xa(e, r, !1);
                break;
              case "textarea":
                Ir(e), Ga(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + Rt(r.value));
                break;
              case "select":
                e.multiple = !!r.multiple, i = r.value, i != null ? yn(e, !!r.multiple, i, !1) : r.defaultValue != null && yn(
                  e,
                  !!r.multiple,
                  r.defaultValue,
                  !0
                );
                break;
              default:
                typeof l.onClick == "function" && (e.onclick = El);
            }
            switch (n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = !0;
                break e;
              default:
                r = !1;
            }
          }
          r && (t.flags |= 4);
        }
        t.ref !== null && (t.flags |= 512, t.flags |= 2097152);
      }
      return ve(t), null;
    case 6:
      if (e && t.stateNode != null) od(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(E(166));
        if (n = Vt(xr.current), Vt(rt.current), Vr(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[tt] = t, (i = r.nodeValue !== n) && (e = Ie, e !== null)) switch (e.tag) {
            case 3:
              br(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && br(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          i && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[tt] = t, t.stateNode = r;
      }
      return ve(t), null;
    case 13:
      if (K(J), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (Z && Le !== null && t.mode & 1 && !(t.flags & 128)) _c(), Pn(), t.flags |= 98560, i = !1;
        else if (i = Vr(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!i) throw Error(E(318));
            if (i = t.memoizedState, i = i !== null ? i.dehydrated : null, !i) throw Error(E(317));
            i[tt] = t;
          } else Pn(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          ve(t), i = !1;
        } else Xe !== null && (Mo(Xe), Xe = null), i = !0;
        if (!i) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || J.current & 1 ? se === 0 && (se = 3) : Pa())), t.updateQueue !== null && (t.flags |= 4), ve(t), null);
    case 4:
      return Nn(), Co(e, t), e === null && gr(t.stateNode.containerInfo), ve(t), null;
    case 10:
      return ca(t.type._context), ve(t), null;
    case 17:
      return Te(t.type) && _l(), ve(t), null;
    case 19:
      if (K(J), i = t.memoizedState, i === null) return ve(t), null;
      if (r = (t.flags & 128) !== 0, o = i.rendering, o === null) if (r) Qn(i, !1);
      else {
        if (se !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (o = Dl(e), o !== null) {
            for (t.flags |= 128, Qn(i, !1), r = o.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) i = n, e = r, i.flags &= 14680066, o = i.alternate, o === null ? (i.childLanes = 0, i.lanes = e, i.child = null, i.subtreeFlags = 0, i.memoizedProps = null, i.memoizedState = null, i.updateQueue = null, i.dependencies = null, i.stateNode = null) : (i.childLanes = o.childLanes, i.lanes = o.lanes, i.child = o.child, i.subtreeFlags = 0, i.deletions = null, i.memoizedProps = o.memoizedProps, i.memoizedState = o.memoizedState, i.updateQueue = o.updateQueue, i.type = o.type, e = o.dependencies, i.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return Y(J, J.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        i.tail !== null && ne() > Dn && (t.flags |= 128, r = !0, Qn(i, !1), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = Dl(o), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), Qn(i, !0), i.tail === null && i.tailMode === "hidden" && !o.alternate && !Z) return ve(t), null;
        } else 2 * ne() - i.renderingStartTime > Dn && n !== 1073741824 && (t.flags |= 128, r = !0, Qn(i, !1), t.lanes = 4194304);
        i.isBackwards ? (o.sibling = t.child, t.child = o) : (n = i.last, n !== null ? n.sibling = o : t.child = o, i.last = o);
      }
      return i.tail !== null ? (t = i.tail, i.rendering = t, i.tail = t.sibling, i.renderingStartTime = ne(), t.sibling = null, n = J.current, Y(J, r ? n & 1 | 2 : n & 1), t) : (ve(t), null);
    case 22:
    case 23:
      return ja(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? Me & 1073741824 && (ve(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : ve(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(E(156, t.tag));
}
function oh(e, t) {
  switch (oa(t), t.tag) {
    case 1:
      return Te(t.type) && _l(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return Nn(), K(Ne), K(xe), ma(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return ha(t), null;
    case 13:
      if (K(J), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(E(340));
        Pn();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return K(J), null;
    case 4:
      return Nn(), null;
    case 10:
      return ca(t.type._context), null;
    case 22:
    case 23:
      return ja(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var Yr = !1, ye = !1, ah = typeof WeakSet == "function" ? WeakSet : Set, D = null;
function gn(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    te(e, t, r);
  }
  else n.current = null;
}
function jo(e, t, n) {
  try {
    n();
  } catch (r) {
    te(e, t, r);
  }
}
var Os = !1;
function sh(e, t) {
  if (so = xl, e = dc(), la(e)) {
    if ("selectionStart" in e) var n = { start: e.selectionStart, end: e.selectionEnd };
    else e: {
      n = (n = e.ownerDocument) && n.defaultView || window;
      var r = n.getSelection && n.getSelection();
      if (r && r.rangeCount !== 0) {
        n = r.anchorNode;
        var l = r.anchorOffset, i = r.focusNode;
        r = r.focusOffset;
        try {
          n.nodeType, i.nodeType;
        } catch {
          n = null;
          break e;
        }
        var o = 0, a = -1, s = -1, u = 0, f = 0, p = e, c = null;
        t: for (; ; ) {
          for (var v; p !== n || l !== 0 && p.nodeType !== 3 || (a = o + l), p !== i || r !== 0 && p.nodeType !== 3 || (s = o + r), p.nodeType === 3 && (o += p.nodeValue.length), (v = p.firstChild) !== null; )
            c = p, p = v;
          for (; ; ) {
            if (p === e) break t;
            if (c === n && ++u === l && (a = o), c === i && ++f === r && (s = o), (v = p.nextSibling) !== null) break;
            p = c, c = p.parentNode;
          }
          p = v;
        }
        n = a === -1 || s === -1 ? null : { start: a, end: s };
      } else n = null;
    }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (uo = { focusedElem: e, selectionRange: n }, xl = !1, D = t; D !== null; ) if (t = D, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, D = e;
  else for (; D !== null; ) {
    t = D;
    try {
      var y = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (y !== null) {
            var x = y.memoizedProps, N = y.memoizedState, m = t.stateNode, h = m.getSnapshotBeforeUpdate(t.elementType === t.type ? x : Qe(t.type, x), N);
            m.__reactInternalSnapshotBeforeUpdate = h;
          }
          break;
        case 3:
          var g = t.stateNode.containerInfo;
          g.nodeType === 1 ? g.textContent = "" : g.nodeType === 9 && g.documentElement && g.removeChild(g.documentElement);
          break;
        case 5:
        case 6:
        case 4:
        case 17:
          break;
        default:
          throw Error(E(163));
      }
    } catch (w) {
      te(t, t.return, w);
    }
    if (e = t.sibling, e !== null) {
      e.return = t.return, D = e;
      break;
    }
    D = t.return;
  }
  return y = Os, Os = !1, y;
}
function ir(e, t, n) {
  var r = t.updateQueue;
  if (r = r !== null ? r.lastEffect : null, r !== null) {
    var l = r = r.next;
    do {
      if ((l.tag & e) === e) {
        var i = l.destroy;
        l.destroy = void 0, i !== void 0 && jo(t, n, i);
      }
      l = l.next;
    } while (l !== r);
  }
}
function Yl(e, t) {
  if (t = t.updateQueue, t = t !== null ? t.lastEffect : null, t !== null) {
    var n = t = t.next;
    do {
      if ((n.tag & e) === e) {
        var r = n.create;
        n.destroy = r();
      }
      n = n.next;
    } while (n !== t);
  }
}
function Po(e) {
  var t = e.ref;
  if (t !== null) {
    var n = e.stateNode;
    switch (e.tag) {
      case 5:
        e = n;
        break;
      default:
        e = n;
    }
    typeof t == "function" ? t(e) : t.current = e;
  }
}
function ad(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, ad(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[tt], delete t[yr], delete t[po], delete t[Vp], delete t[Hp])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function sd(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Us(e) {
  e: for (; ; ) {
    for (; e.sibling === null; ) {
      if (e.return === null || sd(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      e.child.return = e, e = e.child;
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function zo(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = El));
  else if (r !== 4 && (e = e.child, e !== null)) for (zo(e, t, n), e = e.sibling; e !== null; ) zo(e, t, n), e = e.sibling;
}
function No(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child, e !== null)) for (No(e, t, n), e = e.sibling; e !== null; ) No(e, t, n), e = e.sibling;
}
var fe = null, Ye = !1;
function vt(e, t, n) {
  for (n = n.child; n !== null; ) ud(e, t, n), n = n.sibling;
}
function ud(e, t, n) {
  if (nt && typeof nt.onCommitFiberUnmount == "function") try {
    nt.onCommitFiberUnmount(Ol, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      ye || gn(n, t);
    case 6:
      var r = fe, l = Ye;
      fe = null, vt(e, t, n), fe = r, Ye = l, fe !== null && (Ye ? (e = fe, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : fe.removeChild(n.stateNode));
      break;
    case 18:
      fe !== null && (Ye ? (e = fe, n = n.stateNode, e.nodeType === 8 ? Ei(e.parentNode, n) : e.nodeType === 1 && Ei(e, n), pr(e)) : Ei(fe, n.stateNode));
      break;
    case 4:
      r = fe, l = Ye, fe = n.stateNode.containerInfo, Ye = !0, vt(e, t, n), fe = r, Ye = l;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!ye && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        l = r = r.next;
        do {
          var i = l, o = i.destroy;
          i = i.tag, o !== void 0 && (i & 2 || i & 4) && jo(n, t, o), l = l.next;
        } while (l !== r);
      }
      vt(e, t, n);
      break;
    case 1:
      if (!ye && (gn(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
        r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
      } catch (a) {
        te(n, t, a);
      }
      vt(e, t, n);
      break;
    case 21:
      vt(e, t, n);
      break;
    case 22:
      n.mode & 1 ? (ye = (r = ye) || n.memoizedState !== null, vt(e, t, n), ye = r) : vt(e, t, n);
      break;
    default:
      vt(e, t, n);
  }
}
function Bs(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new ah()), t.forEach(function(r) {
      var l = vh.bind(null, e, r);
      n.has(r) || (n.add(r), r.then(l, l));
    });
  }
}
function He(e, t) {
  var n = t.deletions;
  if (n !== null) for (var r = 0; r < n.length; r++) {
    var l = n[r];
    try {
      var i = e, o = t, a = o;
      e: for (; a !== null; ) {
        switch (a.tag) {
          case 5:
            fe = a.stateNode, Ye = !1;
            break e;
          case 3:
            fe = a.stateNode.containerInfo, Ye = !0;
            break e;
          case 4:
            fe = a.stateNode.containerInfo, Ye = !0;
            break e;
        }
        a = a.return;
      }
      if (fe === null) throw Error(E(160));
      ud(i, o, l), fe = null, Ye = !1;
      var s = l.alternate;
      s !== null && (s.return = null), l.return = null;
    } catch (u) {
      te(l, t, u);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) cd(t, e), t = t.sibling;
}
function cd(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (He(t, e), Je(e), r & 4) {
        try {
          ir(3, e, e.return), Yl(3, e);
        } catch (x) {
          te(e, e.return, x);
        }
        try {
          ir(5, e, e.return);
        } catch (x) {
          te(e, e.return, x);
        }
      }
      break;
    case 1:
      He(t, e), Je(e), r & 512 && n !== null && gn(n, n.return);
      break;
    case 5:
      if (He(t, e), Je(e), r & 512 && n !== null && gn(n, n.return), e.flags & 32) {
        var l = e.stateNode;
        try {
          ur(l, "");
        } catch (x) {
          te(e, e.return, x);
        }
      }
      if (r & 4 && (l = e.stateNode, l != null)) {
        var i = e.memoizedProps, o = n !== null ? n.memoizedProps : i, a = e.type, s = e.updateQueue;
        if (e.updateQueue = null, s !== null) try {
          a === "input" && i.type === "radio" && i.name != null && Ru(l, i), Ji(a, o);
          var u = Ji(a, i);
          for (o = 0; o < s.length; o += 2) {
            var f = s[o], p = s[o + 1];
            f === "style" ? Au(l, p) : f === "dangerouslySetInnerHTML" ? Iu(l, p) : f === "children" ? ur(l, p) : Ho(l, f, p, u);
          }
          switch (a) {
            case "input":
              Yi(l, i);
              break;
            case "textarea":
              Mu(l, i);
              break;
            case "select":
              var c = l._wrapperState.wasMultiple;
              l._wrapperState.wasMultiple = !!i.multiple;
              var v = i.value;
              v != null ? yn(l, !!i.multiple, v, !1) : c !== !!i.multiple && (i.defaultValue != null ? yn(
                l,
                !!i.multiple,
                i.defaultValue,
                !0
              ) : yn(l, !!i.multiple, i.multiple ? [] : "", !1));
          }
          l[yr] = i;
        } catch (x) {
          te(e, e.return, x);
        }
      }
      break;
    case 6:
      if (He(t, e), Je(e), r & 4) {
        if (e.stateNode === null) throw Error(E(162));
        l = e.stateNode, i = e.memoizedProps;
        try {
          l.nodeValue = i;
        } catch (x) {
          te(e, e.return, x);
        }
      }
      break;
    case 3:
      if (He(t, e), Je(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        pr(t.containerInfo);
      } catch (x) {
        te(e, e.return, x);
      }
      break;
    case 4:
      He(t, e), Je(e);
      break;
    case 13:
      He(t, e), Je(e), l = e.child, l.flags & 8192 && (i = l.memoizedState !== null, l.stateNode.isHidden = i, !i || l.alternate !== null && l.alternate.memoizedState !== null || (_a = ne())), r & 4 && Bs(e);
      break;
    case 22:
      if (f = n !== null && n.memoizedState !== null, e.mode & 1 ? (ye = (u = ye) || f, He(t, e), ye = u) : He(t, e), Je(e), r & 8192) {
        if (u = e.memoizedState !== null, (e.stateNode.isHidden = u) && !f && e.mode & 1) for (D = e, f = e.child; f !== null; ) {
          for (p = D = f; D !== null; ) {
            switch (c = D, v = c.child, c.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                ir(4, c, c.return);
                break;
              case 1:
                gn(c, c.return);
                var y = c.stateNode;
                if (typeof y.componentWillUnmount == "function") {
                  r = c, n = c.return;
                  try {
                    t = r, y.props = t.memoizedProps, y.state = t.memoizedState, y.componentWillUnmount();
                  } catch (x) {
                    te(r, n, x);
                  }
                }
                break;
              case 5:
                gn(c, c.return);
                break;
              case 22:
                if (c.memoizedState !== null) {
                  bs(p);
                  continue;
                }
            }
            v !== null ? (v.return = c, D = v) : bs(p);
          }
          f = f.sibling;
        }
        e: for (f = null, p = e; ; ) {
          if (p.tag === 5) {
            if (f === null) {
              f = p;
              try {
                l = p.stateNode, u ? (i = l.style, typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none") : (a = p.stateNode, s = p.memoizedProps.style, o = s != null && s.hasOwnProperty("display") ? s.display : null, a.style.display = $u("display", o));
              } catch (x) {
                te(e, e.return, x);
              }
            }
          } else if (p.tag === 6) {
            if (f === null) try {
              p.stateNode.nodeValue = u ? "" : p.memoizedProps;
            } catch (x) {
              te(e, e.return, x);
            }
          } else if ((p.tag !== 22 && p.tag !== 23 || p.memoizedState === null || p === e) && p.child !== null) {
            p.child.return = p, p = p.child;
            continue;
          }
          if (p === e) break e;
          for (; p.sibling === null; ) {
            if (p.return === null || p.return === e) break e;
            f === p && (f = null), p = p.return;
          }
          f === p && (f = null), p.sibling.return = p.return, p = p.sibling;
        }
      }
      break;
    case 19:
      He(t, e), Je(e), r & 4 && Bs(e);
      break;
    case 21:
      break;
    default:
      He(
        t,
        e
      ), Je(e);
  }
}
function Je(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (sd(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(E(160));
      }
      switch (r.tag) {
        case 5:
          var l = r.stateNode;
          r.flags & 32 && (ur(l, ""), r.flags &= -33);
          var i = Us(e);
          No(e, i, l);
          break;
        case 3:
        case 4:
          var o = r.stateNode.containerInfo, a = Us(e);
          zo(e, a, o);
          break;
        default:
          throw Error(E(161));
      }
    } catch (s) {
      te(e, e.return, s);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function uh(e, t, n) {
  D = e, dd(e);
}
function dd(e, t, n) {
  for (var r = (e.mode & 1) !== 0; D !== null; ) {
    var l = D, i = l.child;
    if (l.tag === 22 && r) {
      var o = l.memoizedState !== null || Yr;
      if (!o) {
        var a = l.alternate, s = a !== null && a.memoizedState !== null || ye;
        a = Yr;
        var u = ye;
        if (Yr = o, (ye = s) && !u) for (D = l; D !== null; ) o = D, s = o.child, o.tag === 22 && o.memoizedState !== null ? Vs(l) : s !== null ? (s.return = o, D = s) : Vs(l);
        for (; i !== null; ) D = i, dd(i), i = i.sibling;
        D = l, Yr = a, ye = u;
      }
      Ws(e);
    } else l.subtreeFlags & 8772 && i !== null ? (i.return = l, D = i) : Ws(e);
  }
}
function Ws(e) {
  for (; D !== null; ) {
    var t = D;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            ye || Yl(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !ye) if (n === null) r.componentDidMount();
            else {
              var l = t.elementType === t.type ? n.memoizedProps : Qe(t.type, n.memoizedProps);
              r.componentDidUpdate(l, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var i = t.updateQueue;
            i !== null && js(t, i, r);
            break;
          case 3:
            var o = t.updateQueue;
            if (o !== null) {
              if (n = null, t.child !== null) switch (t.child.tag) {
                case 5:
                  n = t.child.stateNode;
                  break;
                case 1:
                  n = t.child.stateNode;
              }
              js(t, o, n);
            }
            break;
          case 5:
            var a = t.stateNode;
            if (n === null && t.flags & 4) {
              n = a;
              var s = t.memoizedProps;
              switch (t.type) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  s.autoFocus && n.focus();
                  break;
                case "img":
                  s.src && (n.src = s.src);
              }
            }
            break;
          case 6:
            break;
          case 4:
            break;
          case 12:
            break;
          case 13:
            if (t.memoizedState === null) {
              var u = t.alternate;
              if (u !== null) {
                var f = u.memoizedState;
                if (f !== null) {
                  var p = f.dehydrated;
                  p !== null && pr(p);
                }
              }
            }
            break;
          case 19:
          case 17:
          case 21:
          case 22:
          case 23:
          case 25:
            break;
          default:
            throw Error(E(163));
        }
        ye || t.flags & 512 && Po(t);
      } catch (c) {
        te(t, t.return, c);
      }
    }
    if (t === e) {
      D = null;
      break;
    }
    if (n = t.sibling, n !== null) {
      n.return = t.return, D = n;
      break;
    }
    D = t.return;
  }
}
function bs(e) {
  for (; D !== null; ) {
    var t = D;
    if (t === e) {
      D = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      n.return = t.return, D = n;
      break;
    }
    D = t.return;
  }
}
function Vs(e) {
  for (; D !== null; ) {
    var t = D;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            Yl(4, t);
          } catch (s) {
            te(t, n, s);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var l = t.return;
            try {
              r.componentDidMount();
            } catch (s) {
              te(t, l, s);
            }
          }
          var i = t.return;
          try {
            Po(t);
          } catch (s) {
            te(t, i, s);
          }
          break;
        case 5:
          var o = t.return;
          try {
            Po(t);
          } catch (s) {
            te(t, o, s);
          }
      }
    } catch (s) {
      te(t, t.return, s);
    }
    if (t === e) {
      D = null;
      break;
    }
    var a = t.sibling;
    if (a !== null) {
      a.return = t.return, D = a;
      break;
    }
    D = t.return;
  }
}
var ch = Math.ceil, Ll = gt.ReactCurrentDispatcher, ka = gt.ReactCurrentOwner, We = gt.ReactCurrentBatchConfig, b = 0, ce = null, ie = null, pe = 0, Me = 0, vn = It(0), se = 0, _r = null, Gt = 0, Xl = 0, Ea = 0, or = null, Pe = null, _a = 0, Dn = 1 / 0, at = null, Il = !1, To = null, Nt = null, Xr = !1, Et = null, $l = 0, ar = 0, Do = null, dl = -1, fl = 0;
function Ee() {
  return b & 6 ? ne() : dl !== -1 ? dl : dl = ne();
}
function Tt(e) {
  return e.mode & 1 ? b & 2 && pe !== 0 ? pe & -pe : Yp.transition !== null ? (fl === 0 && (fl = Ku()), fl) : (e = H, e !== 0 || (e = window.event, e = e === void 0 ? 16 : nc(e.type)), e) : 1;
}
function Ge(e, t, n, r) {
  if (50 < ar) throw ar = 0, Do = null, Error(E(185));
  Pr(e, n, r), (!(b & 2) || e !== ce) && (e === ce && (!(b & 2) && (Xl |= n), se === 4 && St(e, pe)), De(e, r), n === 1 && b === 0 && !(t.mode & 1) && (Dn = ne() + 500, Vl && $t()));
}
function De(e, t) {
  var n = e.callbackNode;
  Yf(e, t);
  var r = wl(e, e === ce ? pe : 0);
  if (r === 0) n !== null && qa(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && qa(n), t === 1) e.tag === 0 ? Qp(Hs.bind(null, e)) : Sc(Hs.bind(null, e)), Wp(function() {
      !(b & 6) && $t();
    }), n = null;
    else {
      switch (Gu(r)) {
        case 1:
          n = Go;
          break;
        case 4:
          n = Yu;
          break;
        case 16:
          n = yl;
          break;
        case 536870912:
          n = Xu;
          break;
        default:
          n = yl;
      }
      n = wd(n, fd.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function fd(e, t) {
  if (dl = -1, fl = 0, b & 6) throw Error(E(327));
  var n = e.callbackNode;
  if (En() && e.callbackNode !== n) return null;
  var r = wl(e, e === ce ? pe : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = Al(e, r);
  else {
    t = r;
    var l = b;
    b |= 2;
    var i = hd();
    (ce !== e || pe !== t) && (at = null, Dn = ne() + 500, Ht(e, t));
    do
      try {
        ph();
        break;
      } catch (a) {
        pd(e, a);
      }
    while (!0);
    ua(), Ll.current = i, b = l, ie !== null ? t = 0 : (ce = null, pe = 0, t = se);
  }
  if (t !== 0) {
    if (t === 2 && (l = ro(e), l !== 0 && (r = l, t = Ro(e, l))), t === 1) throw n = _r, Ht(e, 0), St(e, r), De(e, ne()), n;
    if (t === 6) St(e, r);
    else {
      if (l = e.current.alternate, !(r & 30) && !dh(l) && (t = Al(e, r), t === 2 && (i = ro(e), i !== 0 && (r = i, t = Ro(e, i))), t === 1)) throw n = _r, Ht(e, 0), St(e, r), De(e, ne()), n;
      switch (e.finishedWork = l, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(E(345));
        case 2:
          Bt(e, Pe, at);
          break;
        case 3:
          if (St(e, r), (r & 130023424) === r && (t = _a + 500 - ne(), 10 < t)) {
            if (wl(e, 0) !== 0) break;
            if (l = e.suspendedLanes, (l & r) !== r) {
              Ee(), e.pingedLanes |= e.suspendedLanes & l;
              break;
            }
            e.timeoutHandle = fo(Bt.bind(null, e, Pe, at), t);
            break;
          }
          Bt(e, Pe, at);
          break;
        case 4:
          if (St(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, l = -1; 0 < r; ) {
            var o = 31 - Ke(r);
            i = 1 << o, o = t[o], o > l && (l = o), r &= ~i;
          }
          if (r = l, r = ne() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * ch(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = fo(Bt.bind(null, e, Pe, at), r);
            break;
          }
          Bt(e, Pe, at);
          break;
        case 5:
          Bt(e, Pe, at);
          break;
        default:
          throw Error(E(329));
      }
    }
  }
  return De(e, ne()), e.callbackNode === n ? fd.bind(null, e) : null;
}
function Ro(e, t) {
  var n = or;
  return e.current.memoizedState.isDehydrated && (Ht(e, t).flags |= 256), e = Al(e, t), e !== 2 && (t = Pe, Pe = n, t !== null && Mo(t)), e;
}
function Mo(e) {
  Pe === null ? Pe = e : Pe.push.apply(Pe, e);
}
function dh(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
        var l = n[r], i = l.getSnapshot;
        l = l.value;
        try {
          if (!Ze(i(), l)) return !1;
        } catch {
          return !1;
        }
      }
    }
    if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
    else {
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
  }
  return !0;
}
function St(e, t) {
  for (t &= ~Ea, t &= ~Xl, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - Ke(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function Hs(e) {
  if (b & 6) throw Error(E(327));
  En();
  var t = wl(e, 0);
  if (!(t & 1)) return De(e, ne()), null;
  var n = Al(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = ro(e);
    r !== 0 && (t = r, n = Ro(e, r));
  }
  if (n === 1) throw n = _r, Ht(e, 0), St(e, t), De(e, ne()), n;
  if (n === 6) throw Error(E(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, Bt(e, Pe, at), De(e, ne()), null;
}
function Ca(e, t) {
  var n = b;
  b |= 1;
  try {
    return e(t);
  } finally {
    b = n, b === 0 && (Dn = ne() + 500, Vl && $t());
  }
}
function Zt(e) {
  Et !== null && Et.tag === 0 && !(b & 6) && En();
  var t = b;
  b |= 1;
  var n = We.transition, r = H;
  try {
    if (We.transition = null, H = 1, e) return e();
  } finally {
    H = r, We.transition = n, b = t, !(b & 6) && $t();
  }
}
function ja() {
  Me = vn.current, K(vn);
}
function Ht(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, Bp(n)), ie !== null) for (n = ie.return; n !== null; ) {
    var r = n;
    switch (oa(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && _l();
        break;
      case 3:
        Nn(), K(Ne), K(xe), ma();
        break;
      case 5:
        ha(r);
        break;
      case 4:
        Nn();
        break;
      case 13:
        K(J);
        break;
      case 19:
        K(J);
        break;
      case 10:
        ca(r.type._context);
        break;
      case 22:
      case 23:
        ja();
    }
    n = n.return;
  }
  if (ce = e, ie = e = Dt(e.current, null), pe = Me = t, se = 0, _r = null, Ea = Xl = Gt = 0, Pe = or = null, bt !== null) {
    for (t = 0; t < bt.length; t++) if (n = bt[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var l = r.next, i = n.pending;
      if (i !== null) {
        var o = i.next;
        i.next = l, r.next = o;
      }
      n.pending = r;
    }
    bt = null;
  }
  return e;
}
function pd(e, t) {
  do {
    var n = ie;
    try {
      if (ua(), sl.current = Ml, Rl) {
        for (var r = q.memoizedState; r !== null; ) {
          var l = r.queue;
          l !== null && (l.pending = null), r = r.next;
        }
        Rl = !1;
      }
      if (Kt = 0, ue = ae = q = null, lr = !1, Sr = 0, ka.current = null, n === null || n.return === null) {
        se = 1, _r = t, ie = null;
        break;
      }
      e: {
        var i = e, o = n.return, a = n, s = t;
        if (t = pe, a.flags |= 32768, s !== null && typeof s == "object" && typeof s.then == "function") {
          var u = s, f = a, p = f.tag;
          if (!(f.mode & 1) && (p === 0 || p === 11 || p === 15)) {
            var c = f.alternate;
            c ? (f.updateQueue = c.updateQueue, f.memoizedState = c.memoizedState, f.lanes = c.lanes) : (f.updateQueue = null, f.memoizedState = null);
          }
          var v = Rs(o);
          if (v !== null) {
            v.flags &= -257, Ms(v, o, a, i, t), v.mode & 1 && Ds(i, u, t), t = v, s = u;
            var y = t.updateQueue;
            if (y === null) {
              var x = /* @__PURE__ */ new Set();
              x.add(s), t.updateQueue = x;
            } else y.add(s);
            break e;
          } else {
            if (!(t & 1)) {
              Ds(i, u, t), Pa();
              break e;
            }
            s = Error(E(426));
          }
        } else if (Z && a.mode & 1) {
          var N = Rs(o);
          if (N !== null) {
            !(N.flags & 65536) && (N.flags |= 256), Ms(N, o, a, i, t), aa(Tn(s, a));
            break e;
          }
        }
        i = s = Tn(s, a), se !== 4 && (se = 2), or === null ? or = [i] : or.push(i), i = o;
        do {
          switch (i.tag) {
            case 3:
              i.flags |= 65536, t &= -t, i.lanes |= t;
              var m = Gc(i, s, t);
              Cs(i, m);
              break e;
            case 1:
              a = s;
              var h = i.type, g = i.stateNode;
              if (!(i.flags & 128) && (typeof h.getDerivedStateFromError == "function" || g !== null && typeof g.componentDidCatch == "function" && (Nt === null || !Nt.has(g)))) {
                i.flags |= 65536, t &= -t, i.lanes |= t;
                var w = Zc(i, a, t);
                Cs(i, w);
                break e;
              }
          }
          i = i.return;
        } while (i !== null);
      }
      gd(n);
    } catch (C) {
      t = C, ie === n && n !== null && (ie = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function hd() {
  var e = Ll.current;
  return Ll.current = Ml, e === null ? Ml : e;
}
function Pa() {
  (se === 0 || se === 3 || se === 2) && (se = 4), ce === null || !(Gt & 268435455) && !(Xl & 268435455) || St(ce, pe);
}
function Al(e, t) {
  var n = b;
  b |= 2;
  var r = hd();
  (ce !== e || pe !== t) && (at = null, Ht(e, t));
  do
    try {
      fh();
      break;
    } catch (l) {
      pd(e, l);
    }
  while (!0);
  if (ua(), b = n, Ll.current = r, ie !== null) throw Error(E(261));
  return ce = null, pe = 0, se;
}
function fh() {
  for (; ie !== null; ) md(ie);
}
function ph() {
  for (; ie !== null && !Ff(); ) md(ie);
}
function md(e) {
  var t = yd(e.alternate, e, Me);
  e.memoizedProps = e.pendingProps, t === null ? gd(e) : ie = t, ka.current = null;
}
function gd(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = oh(n, t), n !== null) {
        n.flags &= 32767, ie = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        se = 6, ie = null;
        return;
      }
    } else if (n = ih(n, t, Me), n !== null) {
      ie = n;
      return;
    }
    if (t = t.sibling, t !== null) {
      ie = t;
      return;
    }
    ie = t = e;
  } while (t !== null);
  se === 0 && (se = 5);
}
function Bt(e, t, n) {
  var r = H, l = We.transition;
  try {
    We.transition = null, H = 1, hh(e, t, n, r);
  } finally {
    We.transition = l, H = r;
  }
  return null;
}
function hh(e, t, n, r) {
  do
    En();
  while (Et !== null);
  if (b & 6) throw Error(E(327));
  n = e.finishedWork;
  var l = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(E(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var i = n.lanes | n.childLanes;
  if (Xf(e, i), e === ce && (ie = ce = null, pe = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || Xr || (Xr = !0, wd(yl, function() {
    return En(), null;
  })), i = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || i) {
    i = We.transition, We.transition = null;
    var o = H;
    H = 1;
    var a = b;
    b |= 4, ka.current = null, sh(e, n), cd(n, e), Lp(uo), xl = !!so, uo = so = null, e.current = n, uh(n), Of(), b = a, H = o, We.transition = i;
  } else e.current = n;
  if (Xr && (Xr = !1, Et = e, $l = l), i = e.pendingLanes, i === 0 && (Nt = null), Wf(n.stateNode), De(e, ne()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) l = t[n], r(l.value, { componentStack: l.stack, digest: l.digest });
  if (Il) throw Il = !1, e = To, To = null, e;
  return $l & 1 && e.tag !== 0 && En(), i = e.pendingLanes, i & 1 ? e === Do ? ar++ : (ar = 0, Do = e) : ar = 0, $t(), null;
}
function En() {
  if (Et !== null) {
    var e = Gu($l), t = We.transition, n = H;
    try {
      if (We.transition = null, H = 16 > e ? 16 : e, Et === null) var r = !1;
      else {
        if (e = Et, Et = null, $l = 0, b & 6) throw Error(E(331));
        var l = b;
        for (b |= 4, D = e.current; D !== null; ) {
          var i = D, o = i.child;
          if (D.flags & 16) {
            var a = i.deletions;
            if (a !== null) {
              for (var s = 0; s < a.length; s++) {
                var u = a[s];
                for (D = u; D !== null; ) {
                  var f = D;
                  switch (f.tag) {
                    case 0:
                    case 11:
                    case 15:
                      ir(8, f, i);
                  }
                  var p = f.child;
                  if (p !== null) p.return = f, D = p;
                  else for (; D !== null; ) {
                    f = D;
                    var c = f.sibling, v = f.return;
                    if (ad(f), f === u) {
                      D = null;
                      break;
                    }
                    if (c !== null) {
                      c.return = v, D = c;
                      break;
                    }
                    D = v;
                  }
                }
              }
              var y = i.alternate;
              if (y !== null) {
                var x = y.child;
                if (x !== null) {
                  y.child = null;
                  do {
                    var N = x.sibling;
                    x.sibling = null, x = N;
                  } while (x !== null);
                }
              }
              D = i;
            }
          }
          if (i.subtreeFlags & 2064 && o !== null) o.return = i, D = o;
          else e: for (; D !== null; ) {
            if (i = D, i.flags & 2048) switch (i.tag) {
              case 0:
              case 11:
              case 15:
                ir(9, i, i.return);
            }
            var m = i.sibling;
            if (m !== null) {
              m.return = i.return, D = m;
              break e;
            }
            D = i.return;
          }
        }
        var h = e.current;
        for (D = h; D !== null; ) {
          o = D;
          var g = o.child;
          if (o.subtreeFlags & 2064 && g !== null) g.return = o, D = g;
          else e: for (o = h; D !== null; ) {
            if (a = D, a.flags & 2048) try {
              switch (a.tag) {
                case 0:
                case 11:
                case 15:
                  Yl(9, a);
              }
            } catch (C) {
              te(a, a.return, C);
            }
            if (a === o) {
              D = null;
              break e;
            }
            var w = a.sibling;
            if (w !== null) {
              w.return = a.return, D = w;
              break e;
            }
            D = a.return;
          }
        }
        if (b = l, $t(), nt && typeof nt.onPostCommitFiberRoot == "function") try {
          nt.onPostCommitFiberRoot(Ol, e);
        } catch {
        }
        r = !0;
      }
      return r;
    } finally {
      H = n, We.transition = t;
    }
  }
  return !1;
}
function Qs(e, t, n) {
  t = Tn(n, t), t = Gc(e, t, 1), e = zt(e, t, 1), t = Ee(), e !== null && (Pr(e, 1, t), De(e, t));
}
function te(e, t, n) {
  if (e.tag === 3) Qs(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      Qs(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (Nt === null || !Nt.has(r))) {
        e = Tn(n, e), e = Zc(t, e, 1), t = zt(t, e, 1), e = Ee(), t !== null && (Pr(t, 1, e), De(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function mh(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = Ee(), e.pingedLanes |= e.suspendedLanes & n, ce === e && (pe & n) === n && (se === 4 || se === 3 && (pe & 130023424) === pe && 500 > ne() - _a ? Ht(e, 0) : Ea |= n), De(e, t);
}
function vd(e, t) {
  t === 0 && (e.mode & 1 ? (t = Fr, Fr <<= 1, !(Fr & 130023424) && (Fr = 4194304)) : t = 1);
  var n = Ee();
  e = ht(e, t), e !== null && (Pr(e, t, n), De(e, n));
}
function gh(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), vd(e, n);
}
function vh(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode, l = e.memoizedState;
      l !== null && (n = l.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(E(314));
  }
  r !== null && r.delete(t), vd(e, n);
}
var yd;
yd = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || Ne.current) ze = !0;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return ze = !1, lh(e, t, n);
    ze = !!(e.flags & 131072);
  }
  else ze = !1, Z && t.flags & 1048576 && kc(t, Pl, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      cl(e, t), e = t.pendingProps;
      var l = jn(t, xe.current);
      kn(t, n), l = va(null, t, r, e, l, n);
      var i = ya();
      return t.flags |= 1, typeof l == "object" && l !== null && typeof l.render == "function" && l.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, Te(r) ? (i = !0, Cl(t)) : i = !1, t.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null, fa(t), l.updater = Ql, t.stateNode = l, l._reactInternals = t, wo(t, r, e, n), t = ko(null, t, r, !0, i, n)) : (t.tag = 0, Z && i && ia(t), ke(null, t, l, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (cl(e, t), e = t.pendingProps, l = r._init, r = l(r._payload), t.type = r, l = t.tag = wh(r), e = Qe(r, e), l) {
          case 0:
            t = So(null, t, r, e, n);
            break e;
          case 1:
            t = $s(null, t, r, e, n);
            break e;
          case 11:
            t = Ls(null, t, r, e, n);
            break e;
          case 14:
            t = Is(null, t, r, Qe(r.type, e), n);
            break e;
        }
        throw Error(E(
          306,
          r,
          ""
        ));
      }
      return t;
    case 0:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Qe(r, l), So(e, t, r, l, n);
    case 1:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Qe(r, l), $s(e, t, r, l, n);
    case 3:
      e: {
        if (td(t), e === null) throw Error(E(387));
        r = t.pendingProps, i = t.memoizedState, l = i.element, zc(e, t), Tl(t, r, null, n);
        var o = t.memoizedState;
        if (r = o.element, i.isDehydrated) if (i = { element: r, isDehydrated: !1, cache: o.cache, pendingSuspenseBoundaries: o.pendingSuspenseBoundaries, transitions: o.transitions }, t.updateQueue.baseState = i, t.memoizedState = i, t.flags & 256) {
          l = Tn(Error(E(423)), t), t = As(e, t, r, n, l);
          break e;
        } else if (r !== l) {
          l = Tn(Error(E(424)), t), t = As(e, t, r, n, l);
          break e;
        } else for (Le = Pt(t.stateNode.containerInfo.firstChild), Ie = t, Z = !0, Xe = null, n = jc(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (Pn(), r === l) {
            t = mt(e, t, n);
            break e;
          }
          ke(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return Nc(t), e === null && go(t), r = t.type, l = t.pendingProps, i = e !== null ? e.memoizedProps : null, o = l.children, co(r, l) ? o = null : i !== null && co(r, i) && (t.flags |= 32), ed(e, t), ke(e, t, o, n), t.child;
    case 6:
      return e === null && go(t), null;
    case 13:
      return nd(e, t, n);
    case 4:
      return pa(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = zn(t, null, r, n) : ke(e, t, r, n), t.child;
    case 11:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Qe(r, l), Ls(e, t, r, l, n);
    case 7:
      return ke(e, t, t.pendingProps, n), t.child;
    case 8:
      return ke(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return ke(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, l = t.pendingProps, i = t.memoizedProps, o = l.value, Y(zl, r._currentValue), r._currentValue = o, i !== null) if (Ze(i.value, o)) {
          if (i.children === l.children && !Ne.current) {
            t = mt(e, t, n);
            break e;
          }
        } else for (i = t.child, i !== null && (i.return = t); i !== null; ) {
          var a = i.dependencies;
          if (a !== null) {
            o = i.child;
            for (var s = a.firstContext; s !== null; ) {
              if (s.context === r) {
                if (i.tag === 1) {
                  s = dt(-1, n & -n), s.tag = 2;
                  var u = i.updateQueue;
                  if (u !== null) {
                    u = u.shared;
                    var f = u.pending;
                    f === null ? s.next = s : (s.next = f.next, f.next = s), u.pending = s;
                  }
                }
                i.lanes |= n, s = i.alternate, s !== null && (s.lanes |= n), vo(
                  i.return,
                  n,
                  t
                ), a.lanes |= n;
                break;
              }
              s = s.next;
            }
          } else if (i.tag === 10) o = i.type === t.type ? null : i.child;
          else if (i.tag === 18) {
            if (o = i.return, o === null) throw Error(E(341));
            o.lanes |= n, a = o.alternate, a !== null && (a.lanes |= n), vo(o, n, t), o = i.sibling;
          } else o = i.child;
          if (o !== null) o.return = i;
          else for (o = i; o !== null; ) {
            if (o === t) {
              o = null;
              break;
            }
            if (i = o.sibling, i !== null) {
              i.return = o.return, o = i;
              break;
            }
            o = o.return;
          }
          i = o;
        }
        ke(e, t, l.children, n), t = t.child;
      }
      return t;
    case 9:
      return l = t.type, r = t.pendingProps.children, kn(t, n), l = be(l), r = r(l), t.flags |= 1, ke(e, t, r, n), t.child;
    case 14:
      return r = t.type, l = Qe(r, t.pendingProps), l = Qe(r.type, l), Is(e, t, r, l, n);
    case 15:
      return Jc(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Qe(r, l), cl(e, t), t.tag = 1, Te(r) ? (e = !0, Cl(t)) : e = !1, kn(t, n), Kc(t, r, l), wo(t, r, l, n), ko(null, t, r, !0, e, n);
    case 19:
      return rd(e, t, n);
    case 22:
      return qc(e, t, n);
  }
  throw Error(E(156, t.tag));
};
function wd(e, t) {
  return Qu(e, t);
}
function yh(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function Be(e, t, n, r) {
  return new yh(e, t, n, r);
}
function za(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function wh(e) {
  if (typeof e == "function") return za(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === Yo) return 11;
    if (e === Xo) return 14;
  }
  return 2;
}
function Dt(e, t) {
  var n = e.alternate;
  return n === null ? (n = Be(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function pl(e, t, n, r, l, i) {
  var o = 2;
  if (r = e, typeof e == "function") za(e) && (o = 1);
  else if (typeof e == "string") o = 5;
  else e: switch (e) {
    case an:
      return Qt(n.children, l, i, t);
    case Qo:
      o = 8, l |= 8;
      break;
    case Wi:
      return e = Be(12, n, t, l | 2), e.elementType = Wi, e.lanes = i, e;
    case bi:
      return e = Be(13, n, t, l), e.elementType = bi, e.lanes = i, e;
    case Vi:
      return e = Be(19, n, t, l), e.elementType = Vi, e.lanes = i, e;
    case Nu:
      return Kl(n, l, i, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case Pu:
          o = 10;
          break e;
        case zu:
          o = 9;
          break e;
        case Yo:
          o = 11;
          break e;
        case Xo:
          o = 14;
          break e;
        case yt:
          o = 16, r = null;
          break e;
      }
      throw Error(E(130, e == null ? e : typeof e, ""));
  }
  return t = Be(o, n, t, l), t.elementType = e, t.type = r, t.lanes = i, t;
}
function Qt(e, t, n, r) {
  return e = Be(7, e, r, t), e.lanes = n, e;
}
function Kl(e, t, n, r) {
  return e = Be(22, e, r, t), e.elementType = Nu, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
}
function Di(e, t, n) {
  return e = Be(6, e, null, t), e.lanes = n, e;
}
function Ri(e, t, n) {
  return t = Be(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function xh(e, t, n, r, l) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = fi(0), this.expirationTimes = fi(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = fi(0), this.identifierPrefix = r, this.onRecoverableError = l, this.mutableSourceEagerHydrationData = null;
}
function Na(e, t, n, r, l, i, o, a, s) {
  return e = new xh(e, t, n, a, s), t === 1 ? (t = 1, i === !0 && (t |= 8)) : t = 0, i = Be(3, null, null, t), e.current = i, i.stateNode = e, i.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, fa(i), e;
}
function Sh(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: on, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function xd(e) {
  if (!e) return Mt;
  e = e._reactInternals;
  e: {
    if (qt(e) !== e || e.tag !== 1) throw Error(E(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (Te(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(E(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (Te(n)) return xc(e, n, t);
  }
  return t;
}
function Sd(e, t, n, r, l, i, o, a, s) {
  return e = Na(n, r, !0, e, l, i, o, a, s), e.context = xd(null), n = e.current, r = Ee(), l = Tt(n), i = dt(r, l), i.callback = t ?? null, zt(n, i, l), e.current.lanes = l, Pr(e, l, r), De(e, r), e;
}
function Gl(e, t, n, r) {
  var l = t.current, i = Ee(), o = Tt(l);
  return n = xd(n), t.context === null ? t.context = n : t.pendingContext = n, t = dt(i, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = zt(l, t, o), e !== null && (Ge(e, l, o, i), al(e, l, o)), o;
}
function Fl(e) {
  if (e = e.current, !e.child) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function Ys(e, t) {
  if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function Ta(e, t) {
  Ys(e, t), (e = e.alternate) && Ys(e, t);
}
function kh() {
  return null;
}
var kd = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function Da(e) {
  this._internalRoot = e;
}
Zl.prototype.render = Da.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(E(409));
  Gl(e, t, null, null);
};
Zl.prototype.unmount = Da.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    Zt(function() {
      Gl(null, e, null, null);
    }), t[pt] = null;
  }
};
function Zl(e) {
  this._internalRoot = e;
}
Zl.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = qu();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < xt.length && t !== 0 && t < xt[n].priority; n++) ;
    xt.splice(n, 0, e), n === 0 && tc(e);
  }
};
function Ra(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function Jl(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function Xs() {
}
function Eh(e, t, n, r, l) {
  if (l) {
    if (typeof r == "function") {
      var i = r;
      r = function() {
        var u = Fl(o);
        i.call(u);
      };
    }
    var o = Sd(t, r, e, 0, null, !1, !1, "", Xs);
    return e._reactRootContainer = o, e[pt] = o.current, gr(e.nodeType === 8 ? e.parentNode : e), Zt(), o;
  }
  for (; l = e.lastChild; ) e.removeChild(l);
  if (typeof r == "function") {
    var a = r;
    r = function() {
      var u = Fl(s);
      a.call(u);
    };
  }
  var s = Na(e, 0, !1, null, null, !1, !1, "", Xs);
  return e._reactRootContainer = s, e[pt] = s.current, gr(e.nodeType === 8 ? e.parentNode : e), Zt(function() {
    Gl(t, s, n, r);
  }), s;
}
function ql(e, t, n, r, l) {
  var i = n._reactRootContainer;
  if (i) {
    var o = i;
    if (typeof l == "function") {
      var a = l;
      l = function() {
        var s = Fl(o);
        a.call(s);
      };
    }
    Gl(t, o, e, l);
  } else o = Eh(n, t, e, l, r);
  return Fl(o);
}
Zu = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Zn(t.pendingLanes);
        n !== 0 && (Zo(t, n | 1), De(t, ne()), !(b & 6) && (Dn = ne() + 500, $t()));
      }
      break;
    case 13:
      Zt(function() {
        var r = ht(e, 1);
        if (r !== null) {
          var l = Ee();
          Ge(r, e, 1, l);
        }
      }), Ta(e, 1);
  }
};
Jo = function(e) {
  if (e.tag === 13) {
    var t = ht(e, 134217728);
    if (t !== null) {
      var n = Ee();
      Ge(t, e, 134217728, n);
    }
    Ta(e, 134217728);
  }
};
Ju = function(e) {
  if (e.tag === 13) {
    var t = Tt(e), n = ht(e, t);
    if (n !== null) {
      var r = Ee();
      Ge(n, e, t, r);
    }
    Ta(e, t);
  }
};
qu = function() {
  return H;
};
ec = function(e, t) {
  var n = H;
  try {
    return H = e, t();
  } finally {
    H = n;
  }
};
eo = function(e, t, n) {
  switch (t) {
    case "input":
      if (Yi(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var l = bl(r);
            if (!l) throw Error(E(90));
            Du(r), Yi(r, l);
          }
        }
      }
      break;
    case "textarea":
      Mu(e, n);
      break;
    case "select":
      t = n.value, t != null && yn(e, !!n.multiple, t, !1);
  }
};
Uu = Ca;
Bu = Zt;
var _h = { usingClientEntryPoint: !1, Events: [Nr, dn, bl, Fu, Ou, Ca] }, Yn = { findFiberByHostInstance: Wt, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Ch = { bundleType: Yn.bundleType, version: Yn.version, rendererPackageName: Yn.rendererPackageName, rendererConfig: Yn.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: gt.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = Vu(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: Yn.findFiberByHostInstance || kh, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Kr = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Kr.isDisabled && Kr.supportsFiber) try {
    Ol = Kr.inject(Ch), nt = Kr;
  } catch {
  }
}
Ae.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = _h;
Ae.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!Ra(t)) throw Error(E(200));
  return Sh(e, t, null, n);
};
Ae.createRoot = function(e, t) {
  if (!Ra(e)) throw Error(E(299));
  var n = !1, r = "", l = kd;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (l = t.onRecoverableError)), t = Na(e, 1, !1, null, null, n, !1, r, l), e[pt] = t.current, gr(e.nodeType === 8 ? e.parentNode : e), new Da(t);
};
Ae.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function" ? Error(E(188)) : (e = Object.keys(e).join(","), Error(E(268, e)));
  return e = Vu(t), e = e === null ? null : e.stateNode, e;
};
Ae.flushSync = function(e) {
  return Zt(e);
};
Ae.hydrate = function(e, t, n) {
  if (!Jl(t)) throw Error(E(200));
  return ql(null, e, t, !0, n);
};
Ae.hydrateRoot = function(e, t, n) {
  if (!Ra(e)) throw Error(E(405));
  var r = n != null && n.hydratedSources || null, l = !1, i = "", o = kd;
  if (n != null && (n.unstable_strictMode === !0 && (l = !0), n.identifierPrefix !== void 0 && (i = n.identifierPrefix), n.onRecoverableError !== void 0 && (o = n.onRecoverableError)), t = Sd(t, null, e, 1, n ?? null, l, !1, i, o), e[pt] = t.current, gr(e), r) for (e = 0; e < r.length; e++) n = r[e], l = n._getVersion, l = l(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, l] : t.mutableSourceEagerHydrationData.push(
    n,
    l
  );
  return new Zl(t);
};
Ae.render = function(e, t, n) {
  if (!Jl(t)) throw Error(E(200));
  return ql(null, e, t, !1, n);
};
Ae.unmountComponentAtNode = function(e) {
  if (!Jl(e)) throw Error(E(40));
  return e._reactRootContainer ? (Zt(function() {
    ql(null, null, e, !1, function() {
      e._reactRootContainer = null, e[pt] = null;
    });
  }), !0) : !1;
};
Ae.unstable_batchedUpdates = Ca;
Ae.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!Jl(n)) throw Error(E(200));
  if (e == null || e._reactInternals === void 0) throw Error(E(38));
  return ql(e, t, n, !1, r);
};
Ae.version = "18.3.1-next-f1338f8080-20240426";
function Ed() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Ed);
    } catch (e) {
      console.error(e);
    }
}
Ed(), hu.exports = Ae;
var _d = hu.exports, Cd, Ks = _d;
Cd = Ks.createRoot, Ks.hydrateRoot;
function jh(e) {
  const t = /* @__PURE__ */ new Map();
  let n = 1;
  return e.set_notify((r) => {
    var i;
    let l;
    try {
      l = JSON.parse(r);
    } catch {
      return;
    }
    l.method && ((i = t.get(l.method)) == null || i.forEach((o) => o(l.params)));
  }), {
    call: async (r, l = {}) => {
      const i = JSON.stringify({ jsonrpc: "2.0", id: n++, method: r, params: l }), o = JSON.parse(e.dispatch_json(i));
      if (o.error) {
        const a = new Error(o.error.message || "rpc error");
        throw a.code = o.error.code, a.data = o.error.data, a;
      }
      return o.result;
    },
    subscribe: (r, l) => {
      let i = t.get(r);
      return i || (i = /* @__PURE__ */ new Set(), t.set(r, i)), i.add(l), () => {
        i.delete(l);
      };
    }
  };
}
function Ph(e) {
  const t = (n, r) => e.call(n, r);
  return {
    /** Push-notification subscribe (doc.changed, data.changed, etc.). */
    subscribe: e.subscribe.bind(e),
    ping: () => t("ping"),
    version: () => t("version"),
    doc: {
      tree: () => t("doc.tree"),
      schema: (n, r = "class") => t("doc.schema", { widget_type: n, mode: r }),
      schemaAt: (n) => t("doc.schema_at", { path: n }),
      widgetTypes: () => t("doc.widget_types"),
      add: (n, r, l) => t("doc.add", { parent: n, type: r, name: l }),
      insertTargets: (n) => t("doc.insert_targets", { path: n }),
      new: (n = "graph") => t("doc.new", { mode: n }),
      getCustoms: () => t("doc.get_customs"),
      setCustoms: (n, r) => t("doc.set_customs", { ctype: n, entries: r }),
      set: (n) => t("doc.set", { ops: n }),
      get: (n) => t("doc.get", { paths: n }),
      remove: (n) => t("doc.remove", { path: n }),
      undo: () => t("doc.undo"),
      redo: () => t("doc.redo"),
      canUndo: () => t("doc.can_undo"),
      rename: (n, r) => t("doc.rename", { path: n, name: r }),
      move: (n, r) => t("doc.move", { path: n, direction: r }),
      duplicate: (n) => t("doc.duplicate", { path: n }),
      serializeWidgets: (n) => t("doc.serialize_widgets", { paths: n }),
      pasteWidgetsMime: (n, r, l) => t("doc.paste_widgets_mime", { parent: n, mime_type: r, payload_b64: l }),
      canPasteMime: (n, r, l) => t("doc.can_paste_mime", { parent: n, mime_type: r, payload_b64: l }),
      propagateSetting: (n, r, l) => t("doc.propagate_setting", {
        path: n,
        scope: r,
        widget_paths: l
      }),
      resetSettingDefault: (n) => t("doc.reset_setting_default", { path: n }),
      setSettingDefault: (n) => t("doc.set_setting_default", { path: n }),
      unlinkSetting: (n) => t("doc.unlink_setting", { path: n }),
      commonSchema: (n) => t("doc.common_schema", { paths: n })
    },
    data: {
      list: () => t("data.list"),
      peek: (n, r = 0, l = 100) => t("data.peek", { name: n, start: r, count: l }),
      stats: (n) => t("data.stats", { name: n }),
      set: (n, r, l = "float64") => t("data.set", { name: n, values: r, dtype: l }),
      create: (n) => t("data.create", n),
      create2d: (n) => t("data.create_2d", n),
      filter: (n) => t("data.filter", n),
      histogram: (n) => t("data.histogram", n),
      import: (n, r, l = {}) => t("data.import", { kind: n, filename: r, options: l }),
      inspectFile: (n, r) => t("data.inspect_file", { kind: n, filename: r }),
      previewCsv: (n) => t("data.preview_csv", n),
      delete: (n) => t("data.delete", { names: n }),
      rename: (n, r) => t("data.rename", { old: n, new: r }),
      duplicate: (n, r) => t("data.duplicate", { name: n, new_name: r }),
      unlinkFile: (n) => t("data.unlink_file", { names: n }),
      unlinkRelation: (n) => t("data.unlink_relation", { names: n }),
      tag: (n, r) => t("data.tag", { names: n, tag: r }),
      untag: (n, r) => t("data.untag", { names: n, tag: r }),
      tagsList: () => t("data.tags_list"),
      reloadFile: (n) => t("data.reload_file", { filename: n }),
      unlinkAllFile: (n) => t("data.unlink_all_file", { filename: n }),
      deleteAllFile: (n) => t("data.delete_all_file", { filename: n }),
      useAsTargets: (n) => t("data.use_as_targets", { name: n }),
      serialize: (n) => t("data.serialize", { names: n }),
      pasteMime: (n, r) => t("data.paste_mime", { mime_type: n, payload_b64: r })
    },
    render: {
      png: (n = 0, r = 800, l = 600, i = 96, o = !0, a = "qt") => t("render.png", { page: n, w: r, h: l, dpi: i, antialias: o, backend: a }),
      scene: (n = 0, r = 800, l = 600, i = 96) => t("render.scene", { page: n, w: r, h: l, dpi: i }),
      svg: (n = 0, r = 800, l = 600, i = 96) => t("render.svg", { page: n, w: r, h: l, dpi: i }),
      pixelToData: (n, r) => t("render.pixel_to_data", { x: n, y: r }),
      copyImage: (n = 0, r = 800, l = 600, i = 96, o = "png") => t("render.copy_image", { page: n, w: r, h: l, dpi: i, format: o })
    },
    hittest: {
      point: (n, r, l) => t("hittest.point", { page: n, x: r, y: l })
    },
    bbox: {
      paths: (n) => t("bbox.paths", { paths: n })
    },
    prefs: {
      get: (n) => t("prefs.get", { key: n }),
      set: (n, r) => t("prefs.set", { key: n, value: r }),
      delete: (n) => t("prefs.delete", { key: n }),
      list: () => t("prefs.list")
    },
    eval: {
      python: (n, r = !0) => t("eval.python", { code: n, capture_stdout: r })
    },
    plugins: {
      list: () => t("plugins.list"),
      run: (n, r, l) => t("plugins.run", { kind: n, name: r, fields: l })
    },
    fit: {
      run: (n) => t("fit.run", n)
    },
    state: {
      snapshot: () => t("state.snapshot"),
      restore: (n) => t("state.restore", { blob: n })
    },
    file: {
      open: (n) => t("file.open", { path: n }),
      save: () => t("file.save"),
      saveAs: (n) => t("file.save_as", { path: n }),
      info: () => t("file.info"),
      export: (n, r, l = {}) => t("file.export", { path: n, pages: r, options: l }),
      formats: () => t("file.formats"),
      recentList: () => t("file.recent_list"),
      recentClear: () => t("file.recent_clear"),
      recentRemove: (n) => t("file.recent_remove", { path: n })
    }
  };
}
const zh = {}, Gs = (e) => {
  let t;
  const n = /* @__PURE__ */ new Set(), r = (f, p) => {
    const c = typeof f == "function" ? f(t) : f;
    if (!Object.is(c, t)) {
      const v = t;
      t = p ?? (typeof c != "object" || c === null) ? c : Object.assign({}, t, c), n.forEach((y) => y(t, v));
    }
  }, l = () => t, s = { setState: r, getState: l, getInitialState: () => u, subscribe: (f) => (n.add(f), () => n.delete(f)), destroy: () => {
    (zh ? "production" : void 0) !== "production" && console.warn(
      "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
    ), n.clear();
  } }, u = t = e(r, l, s);
  return s;
}, Nh = (e) => e ? Gs(e) : Gs;
var jd = { exports: {} }, Pd = {}, zd = { exports: {} }, Nd = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Rn = k;
function Th(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Dh = typeof Object.is == "function" ? Object.is : Th, Rh = Rn.useState, Mh = Rn.useEffect, Lh = Rn.useLayoutEffect, Ih = Rn.useDebugValue;
function $h(e, t) {
  var n = t(), r = Rh({ inst: { value: n, getSnapshot: t } }), l = r[0].inst, i = r[1];
  return Lh(
    function() {
      l.value = n, l.getSnapshot = t, Mi(l) && i({ inst: l });
    },
    [e, n, t]
  ), Mh(
    function() {
      return Mi(l) && i({ inst: l }), e(function() {
        Mi(l) && i({ inst: l });
      });
    },
    [e]
  ), Ih(n), n;
}
function Mi(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Dh(e, n);
  } catch {
    return !0;
  }
}
function Ah(e, t) {
  return t();
}
var Fh = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? Ah : $h;
Nd.useSyncExternalStore = Rn.useSyncExternalStore !== void 0 ? Rn.useSyncExternalStore : Fh;
zd.exports = Nd;
var Oh = zd.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ei = k, Uh = Oh;
function Bh(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Wh = typeof Object.is == "function" ? Object.is : Bh, bh = Uh.useSyncExternalStore, Vh = ei.useRef, Hh = ei.useEffect, Qh = ei.useMemo, Yh = ei.useDebugValue;
Pd.useSyncExternalStoreWithSelector = function(e, t, n, r, l) {
  var i = Vh(null);
  if (i.current === null) {
    var o = { hasValue: !1, value: null };
    i.current = o;
  } else o = i.current;
  i = Qh(
    function() {
      function s(v) {
        if (!u) {
          if (u = !0, f = v, v = r(v), l !== void 0 && o.hasValue) {
            var y = o.value;
            if (l(y, v))
              return p = y;
          }
          return p = v;
        }
        if (y = p, Wh(f, v)) return y;
        var x = r(v);
        return l !== void 0 && l(y, x) ? (f = v, y) : (f = v, p = x);
      }
      var u = !1, f, p, c = n === void 0 ? null : n;
      return [
        function() {
          return s(t());
        },
        c === null ? void 0 : function() {
          return s(c());
        }
      ];
    },
    [t, n, r, l]
  );
  var a = bh(e, i[0], i[1]);
  return Hh(
    function() {
      o.hasValue = !0, o.value = a;
    },
    [a]
  ), Yh(a), a;
};
jd.exports = Pd;
var Xh = jd.exports;
const Kh = /* @__PURE__ */ pu(Xh), Td = {}, { useDebugValue: Gh } = Sf, { useSyncExternalStoreWithSelector: Zh } = Kh;
let Zs = !1;
const Jh = (e) => e;
function qh(e, t = Jh, n) {
  (Td ? "production" : void 0) !== "production" && n && !Zs && (console.warn(
    "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
  ), Zs = !0);
  const r = Zh(
    e.subscribe,
    e.getState,
    e.getServerState || e.getInitialState,
    t,
    n
  );
  return Gh(r), r;
}
const Js = (e) => {
  (Td ? "production" : void 0) !== "production" && typeof e != "function" && console.warn(
    "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
  );
  const t = typeof e == "function" ? Nh(e) : e, n = (r, l) => qh(t, r, l);
  return Object.assign(n, t), n;
}, em = (e) => e ? Js(e) : Js;
function tm() {
  let e = null;
  return {
    async write(t) {
      e = { ...t };
    },
    async read(t) {
      return !e || !t.includes(e.mime_type) ? null : { ...e };
    },
    async has(t) {
      return e !== null && t.includes(e.mime_type);
    }
  };
}
function nm() {
  const e = "image/png";
  async function t(n, r) {
    return (await import("@tauri-apps/api/core")).invoke(n, r);
  }
  return {
    async write(n) {
      if (n.mime_type === e) {
        await t("clipboard_write_image_png", { b64: n.payload_b64 });
        return;
      }
      await t("clipboard_write_mime", {
        mime: n.mime_type,
        b64: n.payload_b64
      });
    },
    async read(n) {
      for (const r of n) {
        const l = await t("clipboard_read_mime", { mime: r });
        if (l) return { mime_type: r, payload_b64: l };
      }
      return null;
    },
    async has(n) {
      for (const r of n)
        if (await t("clipboard_has_mime", { mime: r })) return !0;
      return !1;
    }
  };
}
function rm() {
  return typeof window < "u" && window.__TAURI_INTERNALS__ ? nm() : tm();
}
const qs = "text/x-vnd.veusz-widget-3", lm = "text/x-vnd.veusz-data-1";
function Lo(e, t) {
  const n = [];
  for (const r of e.settings) n.push(eu(t, r.name));
  for (const r of e.subgroups) n.push(...Lo(r, eu(t, r.name)));
  return n;
}
function eu(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
const im = 33;
function om(e, t = rm()) {
  let n = null, r = null;
  return em((l, i) => {
    const o = async (a) => {
      try {
        return await a();
      } catch (s) {
        l({ error: s.message });
        return;
      }
    };
    return {
      rpc: e,
      clipboard: t,
      tree: null,
      datasets: [],
      selected: [],
      schema: null,
      values: {},
      insertTargets: {},
      render: null,
      canUndo: !1,
      canRedo: !1,
      error: null,
      filename: null,
      recentFiles: [],
      plugins: { tools: [], datasets: [] },
      cutPaths: [],
      selectedDatasets: [],
      currentPage: 0,
      antialias: !0,
      backend: "qt",
      webgpuAvailable: null,
      gpuNativeAvailable: null,
      updatePolicy: "change",
      panels: { tree: !0, inspector: !0, datasets: !0 },
      togglePanel: (a) => l((s) => ({ panels: { ...s.panels, [a]: !s.panels[a] } })),
      refreshTree: async () => {
        const a = await o(() => e.doc.tree());
        a && l({ tree: a });
      },
      refreshDatasets: async () => {
        const a = await o(() => e.data.list());
        a && l({ datasets: a });
      },
      refreshUndoState: async () => {
        const a = await o(() => e.doc.canUndo());
        a && l({ canUndo: a.can_undo, canRedo: a.can_redo });
      },
      refreshInsertTargets: async () => {
        const a = i().selected[0] ?? "/", s = await o(() => e.doc.insertTargets(a));
        s && l({ insertTargets: s.targets });
      },
      refreshAll: async () => {
        l({ error: null }), await Promise.all([
          i().refreshTree(),
          i().refreshDatasets(),
          i().refreshUndoState(),
          i().refreshFileInfo(),
          i().refreshInsertTargets(),
          i().loadRecentFiles()
        ]);
      },
      clearError: () => l({ error: null }),
      refreshFileInfo: async () => {
        const a = await o(() => e.file.info());
        a && l({ filename: a.path });
      },
      loadRecentFiles: async () => {
        const a = await o(() => e.file.recentList());
        a && l({ recentFiles: a.paths });
      },
      clearRecentFiles: async () => {
        await o(() => e.file.recentClear()), l({ recentFiles: [] });
      },
      newDocument: async (a = "graph") => {
        await o(() => e.doc.new(a)) && (l({ filename: null, selected: [], schema: null, values: {} }), await i().refreshAll());
      },
      openFile: async (a) => {
        const s = await o(() => e.file.open(a));
        s && (l({ filename: s.path, selected: [], schema: null, values: {} }), await Promise.all([
          i().refreshTree(),
          i().refreshDatasets(),
          i().refreshUndoState(),
          i().refreshInsertTargets(),
          i().loadRecentFiles()
        ]));
      },
      saveFile: async () => {
        if (!i().filename)
          return l({ error: "no filename — use Save As" }), null;
        const a = await o(() => e.file.save());
        return (a == null ? void 0 : a.path) ?? null;
      },
      saveFileAs: async (a) => {
        const s = await o(() => e.file.saveAs(a));
        s && (l({ filename: s.path }), i().loadRecentFiles());
      },
      exportFile: async (a, s, u) => {
        const f = await o(() => e.file.export(a, s, u));
        return (f == null ? void 0 : f.path) ?? null;
      },
      select: async (a) => {
        if (l({ selected: a }), i().refreshInsertTargets(), a.length === 0) {
          l({ schema: null, values: {} });
          return;
        }
        if (a.length === 1) {
          const p = a[0], c = Dd(i().tree, p);
          if (!c) {
            l({ schema: null, values: {} });
            return;
          }
          const v = await o(() => e.doc.schema(c));
          if (!v) {
            l({ schema: null, values: {} });
            return;
          }
          const y = Lo(v, p), x = await o(() => e.doc.get(y)) ?? {};
          l({ schema: v, values: x });
          return;
        }
        const s = await o(() => e.doc.commonSchema(a));
        if (!s) {
          l({ schema: null, values: {} });
          return;
        }
        const u = Lo(s, a[0]), f = await o(() => e.doc.get(u)) ?? {};
        l({ schema: s, values: f });
      },
      setValue: async (a, s) => {
        const u = await o(() => e.doc.set([{ path: a, value: s }]));
        if (!u) return;
        const f = { ...i().values };
        for (const p of u.diffs) f[p.path] = p.new;
        l({ values: f }), await i().refreshUndoState();
      },
      addWidget: async (a, s, u) => {
        const f = await o(() => e.doc.add(a, s, u));
        return await i().refreshTree(), await i().refreshUndoState(), (f == null ? void 0 : f.path) ?? "";
      },
      removeWidget: async (a) => {
        await o(() => e.doc.remove(a));
        const s = i().selected.filter((u) => u !== a);
        s.length !== i().selected.length && await i().select(s), await i().refreshTree(), await i().refreshUndoState();
      },
      setValues: async (a) => {
        if (!a.length) return;
        const s = await o(() => e.doc.set(a));
        if (!s) return;
        const u = { ...i().values };
        for (const f of s.diffs) u[f.path] = f.new;
        l({ values: u }), await i().refreshUndoState();
      },
      renameWidget: async (a, s) => {
        const u = await o(() => e.doc.rename(a, s));
        if (await i().refreshTree(), await i().refreshUndoState(), u) {
          const f = i().selected;
          f.includes(a) && await i().select(f.map((p) => p === a ? u.path : p));
        }
        return (u == null ? void 0 : u.path) ?? null;
      },
      moveWidget: async (a, s) => {
        await o(() => e.doc.move(a, s)), await i().refreshTree(), await i().refreshUndoState();
      },
      duplicateWidget: async (a) => {
        const s = await o(() => e.doc.duplicate(a));
        return await i().refreshTree(), await i().refreshUndoState(), (s == null ? void 0 : s.path) ?? null;
      },
      setHidden: async (a, s) => {
        a.length && (await i().setValues(a.map((u) => ({
          path: u + "/hide",
          value: s
        }))), await i().refreshTree());
      },
      copyWidgets: async (a) => {
        if (!a.length) return;
        const s = await o(() => e.doc.serializeWidgets(a));
        s && (await t.write({
          mime_type: s.mime_type,
          payload_b64: s.payload_b64
        }), l({ cutPaths: [] }));
      },
      cutWidgets: async (a) => {
        if (!a.length) return;
        const s = await o(() => e.doc.serializeWidgets(a));
        if (!s) return;
        await t.write({
          mime_type: s.mime_type,
          payload_b64: s.payload_b64
        });
        const u = [...a].sort((p, c) => c.length - p.length);
        for (const p of u)
          await o(() => e.doc.remove(p));
        const f = i().selected.filter((p) => !a.includes(p));
        f.length !== i().selected.length && await i().select(f), l({ cutPaths: a }), await i().refreshTree(), await i().refreshUndoState();
      },
      pasteWidgets: async (a) => {
        const s = await t.read([qs]);
        if (!s) return [];
        const u = await o(() => e.doc.pasteWidgetsMime(
          a,
          s.mime_type,
          s.payload_b64
        ));
        return u ? (l({ cutPaths: [] }), await i().refreshTree(), await i().refreshUndoState(), u.paths) : [];
      },
      canPasteWidgets: async (a) => {
        const s = await t.read([qs]);
        if (!s) return !1;
        const u = await o(() => e.doc.canPasteMime(
          a,
          s.mime_type,
          s.payload_b64
        ));
        return (u == null ? void 0 : u.ok) ?? !1;
      },
      copyWidgetAsImage: async (a, s, u, f = 96) => {
        const p = await o(() => e.render.copyImage(a, s, u, f, "png"));
        p && await t.write({
          mime_type: p.mime_type,
          payload_b64: p.payload_b64
        });
      },
      propagateSetting: async (a, s, u) => {
        await o(() => e.doc.propagateSetting(a, s, u)), await i().refreshUndoState();
        const f = i().selected;
        f.length && await i().select(f);
      },
      resetSettingDefault: async (a) => {
        await o(() => e.doc.resetSettingDefault(a)), await i().refreshUndoState();
        const s = i().selected;
        s.length && await i().select(s);
      },
      setSettingDefault: async (a) => {
        await o(() => e.doc.setSettingDefault(a)), await i().refreshUndoState();
      },
      unlinkSetting: async (a) => {
        await o(() => e.doc.unlinkSetting(a)), await i().refreshUndoState();
        const s = i().selected;
        s.length && await i().select(s);
      },
      selectDatasets: (a) => l({ selectedDatasets: a }),
      importCsv: async (a) => {
        const s = await o(() => e.data.import("csv", a));
        return await i().refreshDatasets(), (s == null ? void 0 : s.imported) ?? [];
      },
      importData: async (a, s, u = {}) => {
        const f = await o(() => e.data.import(a, s, u));
        return await i().refreshDatasets(), await i().refreshUndoState(), (f == null ? void 0 : f.imported) ?? [];
      },
      deleteDatasets: async (a) => {
        a.length && (await o(() => e.data.delete(a)), await i().refreshDatasets(), await i().refreshUndoState());
      },
      renameDataset: async (a, s) => {
        await o(() => e.data.rename(a, s)), await i().refreshDatasets(), await i().refreshUndoState();
      },
      duplicateDataset: async (a, s) => {
        const u = await o(() => e.data.duplicate(a, s));
        return await i().refreshDatasets(), await i().refreshUndoState(), (u == null ? void 0 : u.name) ?? null;
      },
      unlinkDatasetFile: async (a) => {
        a.length && (await o(() => e.data.unlinkFile(a)), await i().refreshDatasets(), await i().refreshUndoState());
      },
      unlinkDatasetRelation: async (a) => {
        a.length && (await o(() => e.data.unlinkRelation(a)), await i().refreshDatasets(), await i().refreshUndoState());
      },
      tagDatasets: async (a, s) => {
        a.length && (await o(() => e.data.tag(a, s)), await i().refreshDatasets(), await i().refreshUndoState());
      },
      untagDatasets: async (a, s) => {
        a.length && (await o(() => e.data.untag(a, s)), await i().refreshDatasets(), await i().refreshUndoState());
      },
      copyDatasets: async (a) => {
        if (!a.length) return;
        const s = await o(() => e.data.serialize(a));
        s && await t.write({
          mime_type: s.mime_type,
          payload_b64: s.payload_b64
        });
      },
      pasteDatasets: async () => {
        const a = await t.read([lm]);
        if (!a) return [];
        const s = await o(() => e.data.pasteMime(
          a.mime_type,
          a.payload_b64
        ));
        return await i().refreshDatasets(), await i().refreshUndoState(), (s == null ? void 0 : s.pasted) ?? [];
      },
      reloadFile: async (a) => {
        await o(() => e.data.reloadFile(a)), await i().refreshDatasets(), await i().refreshUndoState();
      },
      unlinkAllInFile: async (a) => {
        await o(() => e.data.unlinkAllFile(a)), await i().refreshDatasets(), await i().refreshUndoState();
      },
      deleteAllInFile: async (a) => {
        await o(() => e.data.deleteAllFile(a)), await i().refreshDatasets(), await i().refreshUndoState();
      },
      loadPlugins: async () => {
        const a = i().plugins;
        if (a.tools.length || a.datasets.length) return;
        const s = await o(() => e.plugins.list());
        s && l({ plugins: { tools: s.tools, datasets: s.datasets } });
      },
      runPlugin: async (a, s, u) => {
        const f = await o(() => e.plugins.run(a, s, u));
        return await Promise.all([i().refreshTree(), i().refreshDatasets()]), await i().refreshUndoState(), (f == null ? void 0 : f.created) ?? [];
      },
      loadPlotPrefs: async () => {
        const a = await o(() => e.prefs.get("plot.antialias")), s = await o(() => e.prefs.get("plot.update_policy")), u = await o(() => e.prefs.get("plot.backend")), f = {};
        a && typeof a.value == "boolean" && (f.antialias = a.value), s && typeof s.value == "string" && (f.updatePolicy = s.value), u && typeof u.value == "string" && (f.backend = u.value), Object.keys(f).length && l(f);
      },
      setPage: (a) => {
        var f;
        const s = ((f = i().tree) == null ? void 0 : f.children.length) ?? 0, u = Math.max(0, Math.min(a, Math.max(0, s - 1)));
        l({ currentPage: u });
      },
      nextPage: () => i().setPage(i().currentPage + 1),
      prevPage: () => i().setPage(i().currentPage - 1),
      setAntialias: async (a) => {
        l({ antialias: a }), await o(() => e.prefs.set("plot.antialias", a));
      },
      setBackend: async (a) => {
        l({ backend: a }), await o(() => e.prefs.set("plot.backend", a)), a === "vello-wasm" && i().webgpuAvailable === null && await i().probeWebgpu(), a === "vello-gpu" && i().gpuNativeAvailable === null && await i().probeGpuNative();
      },
      probeWebgpu: async () => {
        let a = !1;
        try {
          const { webgpuAvailable: s } = await Promise.resolve().then(() => Id);
          a = await s();
        } catch {
          a = !1;
        }
        return l({ webgpuAvailable: a }), a;
      },
      probeGpuNative: async () => {
        let a = !1;
        try {
          const { gpuAvailable: s } = await import("./velloNative-Cn1MRGX6.js");
          a = await s();
        } catch {
          a = !1;
        }
        return l({ gpuNativeAvailable: a }), a;
      },
      setUpdatePolicy: async (a) => {
        l({ updatePolicy: a }), await o(() => e.prefs.set("plot.update_policy", a));
      },
      forceRender: async (a, s, u = 96) => {
        await i().renderAt(i().currentPage, a, s, u);
      },
      renderAt: async (a, s, u, f = 96) => {
        const p = i().backend;
        if (p === "vello-gpu" && i().gpuNativeAvailable === !0) {
          const y = await o(() => e.render.scene(a, s, u, f));
          if (y) {
            const { gpuRenderScene: x } = await import("./velloNative-Cn1MRGX6.js"), N = await o(() => x(y.scene_b64, y.width, y.height));
            N && l({ render: {
              png: N,
              width: y.width,
              height: y.height,
              bounds: y.bounds
            } });
          }
          return;
        }
        if (p === "vello-wasm" && i().webgpuAvailable === !0) {
          const y = await o(() => e.render.scene(a, s, u, f));
          y && l({ render: {
            png: "",
            sceneB64: y.scene_b64,
            width: y.width,
            height: y.height,
            bounds: y.bounds
          } });
          return;
        }
        const c = p === "vello-wasm" || p === "vello-gpu" ? "vello" : p, v = await o(() => e.render.png(a, s, u, f, i().antialias, c));
        v && l({ render: v });
      },
      requestRender: (a, s, u, f = 96) => {
        r = { page: a, w: s, h: u, dpi: f }, n && clearTimeout(n), n = setTimeout(() => {
          n = null;
          const p = r;
          r = null, p && i().renderAt(p.page, p.w, p.h, p.dpi);
        }, im);
      },
      undo: async () => {
        const a = await o(() => e.doc.undo());
        a && l({ canUndo: a.can_undo, canRedo: a.can_redo }), await i().refreshTree();
        const s = i().selected;
        s.length && await i().select(s);
      },
      redo: async () => {
        const a = await o(() => e.doc.redo());
        a && l({ canUndo: a.can_undo, canRedo: a.can_redo }), await i().refreshTree();
        const s = i().selected;
        s.length && await i().select(s);
      },
      subscribeToDaemon: () => {
        const a = e.subscribe("doc.changed", () => {
          i().refreshTree(), i().refreshUndoState(), i().refreshInsertTargets();
          const u = i().selected;
          u.length && i().select(u);
        }), s = e.subscribe("data.changed", () => {
          i().refreshDatasets();
        });
        return () => {
          a(), s();
        };
      }
    };
  });
}
function Dd(e, t) {
  if (!e) return null;
  if (e.path === t) return e.type;
  for (const n of e.children) {
    const r = Dd(n, t);
    if (r) return r;
  }
  return null;
}
function am() {
  return (globalThis.__VEUSZ_WASM_BASE__ ?? "/wasm").replace(/\/+$/, "");
}
let Gr = null, tu = !1;
function sm() {
  if (tu) return;
  const e = globalThis.GPUAdapter;
  if (!e) return;
  tu = !0;
  const t = e.prototype, n = t.requestDevice;
  t.requestDevice = function(r) {
    if (r != null && r.requiredLimits) {
      const l = this.limits, i = {};
      for (const [o, a] of Object.entries(r.requiredLimits))
        l && l[o] !== void 0 && (i[o] = a);
      r = { ...r, requiredLimits: i };
    }
    return n.call(this, r);
  };
}
function Ma() {
  return Gr || (Gr = (async () => {
    sm();
    const e = am(), t = await import(
      /* @vite-ignore */
      `${e}/veusz_paint_wasm.js`
    );
    return await t.default({ module_or_path: `${e}/veusz_paint_wasm_bg.wasm` }), t;
  })().catch((e) => {
    throw Gr = null, e;
  })), Gr;
}
async function Rd() {
  try {
    const e = navigator.gpu;
    return e ? await e.requestAdapter() != null : !1;
  } catch {
    return !1;
  }
}
function ti(e) {
  const t = atob(e), n = new Uint8Array(t.length);
  for (let r = 0; r < t.length; r++) n[r] = t.charCodeAt(r);
  return n;
}
async function La(e, t, n = [0, 0, 0, 0]) {
  await (await Ma()).render_scene_to_canvas(e, t, n[0], n[1], n[2], n[3]);
}
async function um(e, t, n = [0, 0, 0, 0]) {
  await La(e, ti(t), n);
}
async function ni(e, t, n, r = "image/png", l = 0.92, i = [1, 1, 1, 1]) {
  const o = document.createElement("canvas");
  o.width = Math.max(1, Math.round(t)), o.height = Math.max(1, Math.round(n)), o.style.cssText = "position:absolute;left:-99999px;top:0;pointer-events:none", document.body.appendChild(o);
  try {
    await La(o, ti(e), i);
    const a = await new Promise((s) => o.toBlob(s, r, l));
    if (!a) throw new Error("canvas.toBlob returned null");
    return a;
  } finally {
    o.remove();
  }
}
async function Md() {
  try {
    return typeof (await Ma()).scene_to_svg == "function";
  } catch {
    return !1;
  }
}
async function Ld(e, t, n) {
  const r = await Ma();
  if (typeof r.scene_to_svg != "function")
    throw new Error("this runtime does not include the SVG exporter");
  return r.scene_to_svg(ti(e), t, n);
}
const Id = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base64ToBytes: ti,
  renderSceneBytesToCanvas: La,
  renderSceneToCanvas: um,
  renderSceneToImageBlob: ni,
  sceneToSvg: Ld,
  svgExportAvailable: Md,
  webgpuAvailable: Rd
}, Symbol.toStringTag, { value: "Module" })), cm = "0.26.4", dm = `https://cdn.jsdelivr.net/pyodide/v${cm}/full/`;
let Xn = null;
async function fm(e) {
  if (Xn) return Xn;
  const t = e.pyodideIndexUrl ?? dm, n = e.onProgress ?? (() => {
  });
  return Xn = (async () => {
    var o;
    n("Loading Pyodide…");
    const l = await (await import(
      /* @vite-ignore */
      `${t}pyodide.mjs`
    )).loadPyodide({ indexURL: t });
    n("Loading numpy…"), await l.loadPackage(["numpy", "micropip"]), n("Installing Veusz…");
    const i = l.pyimport("micropip");
    return await i.install("fonttools"), (o = e.extraWheels) != null && o.length && await i.install(e.extraWheels), e.veuszWheelUrl && await i.install(e.veuszWheelUrl), l;
  })().catch((r) => {
    throw Xn = null, r;
  }), Xn;
}
let pm = 0;
async function hm(e = {}) {
  const t = e.onProgress ?? (() => {
  });
  e.wasmBase && (globalThis.__VEUSZ_WASM_BASE__ = e.wasmBase);
  const n = await fm(e);
  t("Starting renderer…");
  const l = n.pyimport("veusz.daemon.pyodide_bridge").Bridge(), i = jh(l), o = `/veusz/fig_${pm++}`, a = `${o}/figure.vsz`, s = async (u, f = []) => {
    await n.runPythonAsync(`import os; os.makedirs(${JSON.stringify(o)}, exist_ok=True)`);
    for (const p of f) {
      const c = `${o}/${p.name}`, v = c.slice(0, c.lastIndexOf("/"));
      v && v !== o && await n.runPythonAsync(`import os; os.makedirs(${JSON.stringify(v)}, exist_ok=True)`), n.FS.writeFile(c, p.bytes);
    }
    return n.FS.writeFile(a, u), i.call("file.open", { path: a });
  };
  return t("Ready"), { transport: i, bridge: l, loadVsz: s, pyodide: n };
}
async function mm(e, t = {}) {
  const n = await e.call("data.list_url_links", {}), r = t.onError ?? ((u, f) => console.warn(`[veusz-figure] URL ${u}: ${f.message}`)), l = t.onStatus ?? (() => {
  }), i = /* @__PURE__ */ new Map();
  for (const u of n)
    i.set(u.url, { etag: u.etag, lastModified: u.last_modified });
  const o = (u) => {
    if (t.urlMap && Object.prototype.hasOwnProperty.call(t.urlMap, u))
      return t.urlMap[u];
    if (t.urlBase)
      try {
        return new URL(u, t.urlBase).toString();
      } catch {
        return u;
      }
    return u;
  }, a = async (u) => {
    const f = o(u.url), p = i.get(u.url), c = {};
    p.etag && (c["If-None-Match"] = p.etag), p.lastModified && (c["If-Modified-Since"] = p.lastModified), l({ url: u.url, phase: "fetching" });
    try {
      const v = await fetch(f, { headers: c, cache: "no-store" });
      if (v.status === 304) {
        await e.call(
          "data.url_refresh",
          { url: u.url, not_modified: !0 }
        ), l({ url: u.url, phase: "not_modified" });
        return;
      }
      if (!v.ok) throw new Error(`HTTP ${v.status}`);
      const y = new Uint8Array(await v.arrayBuffer()), x = $d(y), N = v.headers.get("etag"), m = v.headers.get("last-modified"), h = v.headers.get("content-type");
      await e.call("data.url_refresh", {
        url: u.url,
        bytes_b64: x,
        etag: N,
        last_modified: m,
        content_type: h
      }), p.etag = N, p.lastModified = m, l({ url: u.url, phase: "ok" });
    } catch (v) {
      const y = v instanceof Error ? v : new Error(String(v));
      r(u.url, y), l({ url: u.url, phase: "error", detail: y.message });
    }
  };
  await Promise.allSettled(n.map((u) => a(u)));
  const s = [];
  for (const u of n)
    if (u.poll_seconds > 0) {
      const f = setInterval(
        () => {
          a(u);
        },
        u.poll_seconds * 1e3
      );
      s.push(f);
    }
  return {
    stop() {
      for (const u of s) clearInterval(u);
      s.length = 0;
    },
    async refresh() {
      await Promise.allSettled(n.map((u) => a(u)));
    }
  };
}
async function gm(e, t, n = {}) {
  const r = vm(e), l = n.onError ?? ((i, o) => console.warn(`[veusz-figure] pre-fetch ${i}: ${o.message}`));
  return await Promise.allSettled(r.map(async (i) => {
    const o = n.urlMap && Object.prototype.hasOwnProperty.call(n.urlMap, i) ? n.urlMap[i] : n.urlBase ? new URL(i, n.urlBase).toString() : i;
    try {
      const a = await fetch(o, { cache: "no-store" });
      if (!a.ok) throw new Error(`HTTP ${a.status}`);
      const s = new Uint8Array(await a.arrayBuffer());
      await t.call("data.url_ingest", {
        url: i,
        // Python's cache key = original URL
        bytes_b64: $d(s),
        etag: a.headers.get("etag"),
        last_modified: a.headers.get("last-modified"),
        content_type: a.headers.get("content-type")
      });
    } catch (a) {
      const s = a instanceof Error ? a : new Error(String(a));
      l(i, s);
    }
  })), r;
}
function vm(e) {
  const t = [], n = /ImportFileURL\s*\(\s*(['"])([^'"\n]+)\1/g;
  let r;
  for (; (r = n.exec(e)) !== null; ) t.push(r[2]);
  return t;
}
function $d(e) {
  let t = "";
  for (let r = 0; r < e.length; r += 32768)
    t += String.fromCharCode.apply(
      null,
      Array.from(e.subarray(r, r + 32768))
    );
  return btoa(t);
}
const ym = /\bImport[A-Za-z0-9]*\s*\(\s*[uUrRbB]?(['"])([^'"\n]+)\1/g;
function wm(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e.matchAll(ym)) {
    const r = n[2];
    /^[a-z][a-z0-9+.-]*:\/\//i.test(r) || /\.[A-Za-z0-9]+$/.test(r) && t.add(r);
  }
  return [...t];
}
async function xm(e, t, n = {}, r = fetch) {
  const l = wm(e);
  if (l.length === 0) return [];
  const i = n.urlBase ? new URL(n.urlBase, location.href) : new URL(".", new URL(t, location.href)), o = [];
  return await Promise.all(l.map(async (a) => {
    var u;
    const s = ((u = n.urlMap) == null ? void 0 : u[a]) ?? new URL(a, i).toString();
    try {
      const f = await r(s);
      if (!f.ok) return;
      o.push({ name: a, bytes: new Uint8Array(await f.arrayBuffer()) });
    } catch {
    }
  })), o;
}
var Ad = { exports: {} }, ri = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Sm = k, km = Symbol.for("react.element"), Em = Symbol.for("react.fragment"), _m = Object.prototype.hasOwnProperty, Cm = Sm.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, jm = { key: !0, ref: !0, __self: !0, __source: !0 };
function Fd(e, t, n) {
  var r, l = {}, i = null, o = null;
  n !== void 0 && (i = "" + n), t.key !== void 0 && (i = "" + t.key), t.ref !== void 0 && (o = t.ref);
  for (r in t) _m.call(t, r) && !jm.hasOwnProperty(r) && (l[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) l[r] === void 0 && (l[r] = t[r]);
  return { $$typeof: km, type: e, key: i, ref: o, props: l, _owner: Cm.current };
}
ri.Fragment = Em;
ri.jsx = Fd;
ri.jsxs = Fd;
Ad.exports = ri;
var d = Ad.exports;
function Pm(e, t) {
  const n = new Map(t.map((l) => [l.path, l])), r = [];
  for (const l of e) {
    const i = n.get(l.path);
    if (!i) continue;
    const o = Math.min(l.value, i.value), a = Math.max(l.value, i.value);
    !(a > o) || !Number.isFinite(o) || !Number.isFinite(a) || (r.push({ path: `${l.path}/min`, value: o }), r.push({ path: `${l.path}/max`, value: a }));
  }
  return r;
}
function zm(e) {
  const t = [];
  for (const n of new Set(e))
    t.push({ path: `${n}/min`, value: "Auto" }), t.push({ path: `${n}/max`, value: "Auto" });
  return t;
}
function Nm(e, t, n) {
  const r = new Map(t.map((i) => [i.path, i])), l = [];
  for (const i of e) {
    const o = r.get(i.path), a = n.get(i.path);
    if (!o || !a) continue;
    const s = i.value - o.value;
    Number.isFinite(s) && (l.push({ path: `${i.path}/min`, value: a.min + s }), l.push({ path: `${i.path}/max`, value: a.max + s }));
  }
  return l;
}
function Tm(e, t, n, r, l) {
  const i = new Map(t.map((u) => [u.path, u])), o = new Map(n.map((u) => [u.path, u])), a = new Map(r.map((u) => [u.path, u])), s = [];
  for (const u of e) {
    const f = i.get(u.path), p = o.get(u.path), c = a.get(u.path), v = l.get(u.path);
    if (!f || !p || !c || !v) continue;
    const y = u.value, x = f.value, N = p.value, h = c.value - N;
    if (!Number.isFinite(h) || h === 0) continue;
    const g = (x - y) / h;
    if (!Number.isFinite(g) || g <= 0) continue;
    const w = y + g * (v.min - N), C = y + g * (v.max - N);
    if (!Number.isFinite(w) || !Number.isFinite(C)) continue;
    const z = Math.min(w, C), T = Math.max(w, C);
    T > z && (s.push({ path: `${u.path}/min`, value: z }), s.push({ path: `${u.path}/max`, value: T }));
  }
  return s;
}
function Dm(e) {
  const t = (i) => {
    const o = Math.abs(i);
    return o !== 0 && (o < 1e-3 || o >= 1e5) ? i.toExponential(3) : Number(i.toPrecision(5)).toString();
  }, n = e.find((i) => i.direction === "horizontal"), r = e.find((i) => i.direction === "vertical"), l = [];
  return n && l.push(`x: ${t(n.value)}`), r && l.push(`y: ${t(r.value)}`), l.join("   ");
}
const Ot = Math.PI / 180, Li = 180 / Math.PI;
function Io(e, t) {
  const n = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let r = 0; r < 3; r++)
    for (let l = 0; l < 3; l++)
      n[r][l] = e[r][0] * t[0][l] + e[r][1] * t[1][l] + e[r][2] * t[2][l];
  return n;
}
function Rm(e) {
  const t = Math.cos(e), n = Math.sin(e);
  return [[1, 0, 0], [0, t, -n], [0, n, t]];
}
function Mm(e) {
  const t = Math.cos(e), n = Math.sin(e);
  return [[t, 0, n], [0, 1, 0], [-n, 0, t]];
}
function Lm(e) {
  const t = Math.cos(e), n = Math.sin(e);
  return [[t, -n, 0], [n, t, 0], [0, 0, 1]];
}
function Ii(e, t, n) {
  return Io(Io(Rm(e), Mm(t)), Lm(n));
}
function Im(e) {
  const t = Math.max(-1, Math.min(1, e[0][2])), n = Math.asin(t);
  let r, l;
  return Math.abs(t) < 1 - 1e-9 ? (r = Math.atan2(-e[1][2], e[2][2]), l = Math.atan2(-e[0][1], e[0][0])) : (r = Math.atan2(e[2][1], e[1][1]), l = 0), { x: r * Li, y: n * Li, z: l * Li };
}
function $m(e, t, n, r = "xy") {
  const l = Ii(e.x * Ot, e.y * Ot, e.z * Ot), i = r === "xy" ? Ii(-n * Ot, -t * Ot, 0) : Ii(-t * Ot, 0, -n * Ot);
  return Im(Io(i, l));
}
const $i = (e) => (Math.round(e * 10) || 0) / 10;
function Am(e, t, n, r, l = "xy") {
  const i = $m(t, n, r, l);
  return [
    { path: `${e}/xRotation`, value: $i(i.x) },
    { path: `${e}/yRotation`, value: $i(i.y) },
    { path: `${e}/zRotation`, value: $i(i.z) }
  ];
}
function Od(e) {
  if (!e) return null;
  if (e.type === "scene3d") return e.path;
  for (const t of e.children) {
    const n = Od(t);
    if (n) return n;
  }
  return null;
}
const Ud = 96, Fm = 1, Om = 3;
function Bd() {
  const e = typeof window < "u" ? window.devicePixelRatio : 2;
  return !Number.isFinite(e) || e <= 0 ? 1 : Math.min(Om, Math.max(Fm, e));
}
const Zr = 4, nu = 0.4, ru = 4096;
function Wd({
  store: e,
  width: t,
  height: n
}) {
  const r = e((S) => S.render), l = e((S) => S.tree), i = e((S) => S.currentPage), o = e((S) => S.values), a = e((S) => S.requestRender), s = k.useRef(null), u = k.useRef(null), f = k.useRef(null), p = k.useMemo(() => Bd(), []), c = k.useMemo(() => {
    let S = Math.max(1, Math.round(t * p)), I = Math.max(1, Math.round(n * p));
    const M = Math.max(S, I);
    if (M > ru) {
      const B = ru / M;
      S = Math.round(S * B), I = Math.round(I * B);
    }
    return { w: S, h: I };
  }, [t, n, p]), v = Math.round(Ud * (c.w / Math.max(t, 1))), y = k.useMemo(
    () => l ? Od(l.children[i] ?? null) : null,
    [l, i]
  ), [x, N] = k.useState({ w: t, h: n }), [m, h] = k.useState(null), [g, w] = k.useState(null), [C, z] = k.useState(null), T = k.useRef(/* @__PURE__ */ new Set()), [R, j] = k.useState(!1), _ = k.useRef(null), Q = k.useRef(null), Se = k.useRef(!1), je = k.useRef(null), de = k.useRef(null), re = k.useRef(/* @__PURE__ */ new Map()), en = k.useRef(0);
  k.useEffect(() => {
    const S = u.current;
    if (!S) return;
    const I = t > 0 ? n / t : 0.7143, M = () => {
      const W = S.clientWidth, O = S.clientHeight;
      let A, F;
      if (W > 0 && O > 0) {
        const V = Math.min(W / t, O / n);
        A = t * V, F = n * V;
      } else W > 0 ? (A = W, F = W * I) : (A = t, F = n);
      N((V) => Math.abs(V.w - A) < 0.5 && Math.abs(V.h - F) < 0.5 ? V : { w: A, h: F });
    };
    if (M(), typeof ResizeObserver > "u") return;
    const B = new ResizeObserver(M);
    return B.observe(S), () => B.disconnect();
  }, [t, n]), k.useEffect(() => {
    l && l.children.length > 0 && a(i, c.w, c.h, v);
  }, [l, o, i, c.w, c.h, a]), k.useEffect(() => {
    const S = r == null ? void 0 : r.sceneB64, I = s.current;
    if (!S || !I) return;
    let M = !1;
    return (async () => {
      var B;
      try {
        const { renderSceneToCanvas: W } = await Promise.resolve().then(() => Id);
        M || await W(I, S, [1, 1, 1, 1]);
      } catch (W) {
        if (!M) {
          const O = W, A = (O == null ? void 0 : O.message) || ((B = O == null ? void 0 : O.toString) == null ? void 0 : B.call(O)) || String(W);
          console.error("embed scene render failed:", A), O != null && O.stack && console.error(O.stack);
        }
      }
    })(), () => {
      M = !0;
    };
  }, [r == null ? void 0 : r.sceneB64]);
  const me = () => e.getState().rpc, P = (S, I) => {
    const B = s.current.getBoundingClientRect();
    return [
      (S - B.left) * (c.w / (B.width || 1)),
      (I - B.top) * (c.h / (B.height || 1))
    ];
  }, L = async (S) => {
    await e.getState().setValues(S), a(i, c.w, c.h, v);
  }, $ = () => {
    if (Se.current) return;
    const S = Q.current, I = je.current;
    if (!I || !S || !S.startAngles) return;
    je.current = null;
    const M = (I.clientX - S.startClientX) * nu, B = (I.clientY - S.startClientY) * nu, W = Am(S.scenePath, S.startAngles, M, B, I.shift ? "xz" : "xy");
    Se.current = !0, L(W).finally(() => {
      Se.current = !1, $();
    });
  }, G = (S, I, M) => {
    je.current = { clientX: S, clientY: I, shift: M }, $();
  }, le = () => {
    const S = s.current;
    if (!S) return;
    const I = [...re.current.keys()];
    if (I.length < 2) return;
    const [M, B] = I, W = re.current.get(M), O = re.current.get(B), A = S.getBoundingClientRect(), F = W.clientX - A.left, V = W.clientY - A.top, oe = O.clientX - A.left, At = O.clientY - A.top;
    de.current = {
      id1: M,
      id2: B,
      startDist: Math.hypot(oe - F, At - V) || 1,
      startCx: (F + oe) / 2,
      startCy: (V + At) / 2
    }, _.current = null, h(null), (async () => {
      const [Ft, An] = [P(W.clientX, W.clientY), P(O.clientX, O.clientY)], [Dr, Aa] = await Promise.all([
        me().render.pixelToData(Ft[0], Ft[1]),
        me().render.pixelToData(An[0], An[1])
      ]);
      if (!de.current) return;
      de.current.data1 = Dr.axes, de.current.data2 = Aa.axes;
      const Fa = /* @__PURE__ */ new Map();
      for (const Fn of new Set([...Dr.axes, ...Aa.axes].map((Rr) => Rr.path))) {
        const Rr = await me().doc.get([`${Fn}/min`, `${Fn}/max`]), Oa = Number(Rr[`${Fn}/min`]), Ua = Number(Rr[`${Fn}/max`]);
        Number.isFinite(Oa) && Number.isFinite(Ua) && Fa.set(Fn, { min: Oa, max: Ua });
      }
      de.current && (de.current.ranges = Fa);
    })();
  }, tn = () => {
    const S = de.current, I = s.current;
    if (!S || !I) return;
    const M = re.current.get(S.id1), B = re.current.get(S.id2);
    if (!M || !B) return;
    const W = I.getBoundingClientRect(), O = M.clientX - W.left, A = M.clientY - W.top, F = B.clientX - W.left, V = B.clientY - W.top, oe = Math.hypot(F - O, V - A) || 1;
    z({
      scale: oe / S.startDist,
      ox: S.startCx,
      oy: S.startCy,
      tx: (O + F) / 2 - S.startCx,
      ty: (A + V) / 2 - S.startCy
    });
  }, lt = (S, I) => {
    const M = de.current;
    if (de.current = null, z(null), !M || !M.data1 || !M.data2 || !M.ranges) return;
    const B = M.id1 === I ? S : re.current.get(M.id1), W = M.id2 === I ? S : re.current.get(M.id2);
    if (!B || !W) return;
    const O = P(B.clientX, B.clientY), A = P(W.clientX, W.clientY);
    (async () => {
      const [F, V] = await Promise.all([
        me().render.pixelToData(O[0], O[1]),
        me().render.pixelToData(A[0], A[1])
      ]), oe = Tm(M.data1, M.data2, F.axes, V.axes, M.ranges);
      oe.length && await L(oe);
    })();
  }, $n = (S) => {
    var W, O;
    if ((O = (W = S.currentTarget).setPointerCapture) == null || O.call(W, S.pointerId), re.current.set(S.pointerId, { clientX: S.clientX, clientY: S.clientY }), re.current.size >= 2) {
      le();
      return;
    }
    if (y) {
      const A = y;
      _.current = { pointerId: S.pointerId, mode: "rotate", sx: 0, sy: 0, moved: !1 }, Q.current = { scenePath: A, startClientX: S.clientX, startClientY: S.clientY }, me().doc.get([`${A}/xRotation`, `${A}/yRotation`, `${A}/zRotation`]).then((F) => {
        Q.current && Q.current.scenePath === A && (Q.current.startAngles = {
          x: Number(F[`${A}/xRotation`]) || 0,
          y: Number(F[`${A}/yRotation`]) || 0,
          z: Number(F[`${A}/zRotation`]) || 0
        }, $());
      });
      return;
    }
    const [I, M] = P(S.clientX, S.clientY), B = S.pointerType === "mouse" ? S.shiftKey || S.button === 1 : !0;
    _.current = { pointerId: S.pointerId, mode: B ? "pan" : "zoom", sx: I, sy: M, moved: !1 }, B && me().render.pixelToData(I, M).then(async (A) => {
      if (!_.current) return;
      _.current.from = A.axes;
      const F = /* @__PURE__ */ new Map();
      for (const V of A.axes) {
        const oe = await me().doc.get([`${V.path}/min`, `${V.path}/max`]), At = Number(oe[`${V.path}/min`]), Ft = Number(oe[`${V.path}/max`]);
        Number.isFinite(At) && Number.isFinite(Ft) && F.set(V.path, { min: At, max: Ft });
      }
      _.current && (_.current.ranges = F);
    });
  }, it = (S) => {
    if (re.current.has(S.pointerId) && re.current.set(S.pointerId, { clientX: S.clientX, clientY: S.clientY }), de.current) {
      tn();
      return;
    }
    const I = _.current;
    if (I && I.pointerId === S.pointerId) {
      if (I.mode === "rotate") {
        const F = Q.current, V = S.clientX - ((F == null ? void 0 : F.startClientX) ?? S.clientX), oe = S.clientY - ((F == null ? void 0 : F.startClientY) ?? S.clientY);
        (Math.abs(V) > Zr || Math.abs(oe) > Zr) && (I.moved || j(!0), I.moved = !0, G(S.clientX, S.clientY, S.shiftKey));
        return;
      }
      const [O, A] = P(S.clientX, S.clientY);
      (Math.abs(O - I.sx) > Zr || Math.abs(A - I.sy) > Zr) && (I.moved = !0), I.mode === "zoom" && I.moved && h({ x0: I.sx, y0: I.sy, x1: O, y1: A });
      return;
    }
    if (y || S.pointerType !== "mouse" || S.buttons !== 0) return;
    const M = performance.now();
    if (M - en.current < 40) return;
    en.current = M;
    const [B, W] = P(S.clientX, S.clientY);
    me().render.pixelToData(B, W).then((O) => {
      var An;
      O.axes.forEach((Dr) => T.current.add(Dr.path));
      const A = Dm(O.axes);
      if (!A) {
        w(null);
        return;
      }
      const F = ((An = f.current) == null ? void 0 : An.getBoundingClientRect()) ?? { left: 0, top: 0, width: 0, height: 0 }, V = S.clientX - F.left, oe = S.clientY - F.top, At = F.width > 0 && V > F.width * 0.6, Ft = F.height > 0 && oe > F.height * 0.85;
      w({
        ...At ? { right: Math.max(4, F.width - V + 12) } : { left: V + 12 },
        top: Ft ? Math.max(4, oe - 22) : oe + 12,
        text: A
      });
    });
  }, nn = (S) => {
    var O, A;
    (A = (O = S.currentTarget).releasePointerCapture) == null || A.call(O, S.pointerId);
    const I = re.current.get(S.pointerId) ?? { clientX: S.clientX, clientY: S.clientY };
    if (de.current) {
      lt(I, S.pointerId), re.current.delete(S.pointerId);
      return;
    }
    re.current.delete(S.pointerId);
    const M = _.current;
    if (!M || M.pointerId !== S.pointerId) return;
    if (_.current = null, M.mode === "rotate") {
      M.moved && G(S.clientX, S.clientY, S.shiftKey), j(!1);
      return;
    }
    if (h(null), !M.moved) return;
    const [B, W] = P(S.clientX, S.clientY);
    M.mode === "zoom" ? (async () => {
      const [F, V] = await Promise.all([
        me().render.pixelToData(M.sx, M.sy),
        me().render.pixelToData(B, W)
      ]), oe = Pm(F.axes, V.axes);
      oe.length && await L(oe);
    })() : M.mode === "pan" && M.from && M.ranges && (async () => {
      const F = await me().render.pixelToData(B, W), V = Nm(M.from, F.axes, M.ranges);
      V.length && await L(V);
    })();
  }, tf = (S) => {
    re.current.delete(S.pointerId), de.current = null, _.current = null, je.current = null, j(!1), h(null), z(null);
  }, nf = () => {
    T.current.size && L(zm(T.current));
  };
  return /* @__PURE__ */ d.jsx(
    "div",
    {
      ref: u,
      "data-testid": "embed-plot",
      style: {
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
        overflow: "hidden"
      },
      onPointerLeave: () => {
        w(null);
      },
      children: /* @__PURE__ */ d.jsxs("div", { ref: f, style: { position: "relative", width: x.w, height: x.h }, children: [
        /* @__PURE__ */ d.jsx(
          "canvas",
          {
            ref: s,
            width: c.w,
            height: c.h,
            "data-testid": "embed-canvas",
            onPointerDown: $n,
            onPointerMove: it,
            onPointerUp: nn,
            onPointerCancel: tf,
            onDoubleClick: nf,
            style: {
              width: "100%",
              height: "100%",
              display: "block",
              cursor: y ? R ? "grabbing" : "grab" : "crosshair",
              touchAction: "none",
              transform: C ? `translate(${C.tx}px, ${C.ty}px) scale(${C.scale})` : void 0,
              transformOrigin: C ? `${C.ox}px ${C.oy}px` : void 0
            }
          }
        ),
        m && /* @__PURE__ */ d.jsx("div", { "data-testid": "embed-zoomband", style: {
          position: "absolute",
          pointerEvents: "none",
          border: "1px solid #1f6feb",
          background: "rgba(31,111,235,0.12)",
          left: `${Math.min(m.x0, m.x1) / c.w * 100}%`,
          top: `${Math.min(m.y0, m.y1) / c.h * 100}%`,
          width: `${Math.abs(m.x1 - m.x0) / c.w * 100}%`,
          height: `${Math.abs(m.y1 - m.y0) / c.h * 100}%`
        } }),
        g && /* @__PURE__ */ d.jsx("div", { "data-testid": "embed-tooltip", style: {
          position: "absolute",
          left: g.left,
          right: g.right,
          top: g.top,
          pointerEvents: "none",
          background: "rgba(20,22,26,0.9)",
          color: "#fff",
          font: "12px system-ui",
          padding: "2px 6px",
          borderRadius: 4,
          whiteSpace: "nowrap",
          zIndex: 5
        }, children: g.text })
      ] })
    }
  );
}
function Um({
  root: e,
  selected: t,
  onSelect: n,
  onContextMenu: r,
  renamingPath: l,
  onRenameCommit: i,
  cutPaths: o
}) {
  const a = new Set(t), s = new Set(o ?? []);
  return /* @__PURE__ */ d.jsx("ul", { "data-testid": "tree", role: "tree", children: /* @__PURE__ */ d.jsx(
    bd,
    {
      node: e,
      selectedSet: a,
      cutSet: s,
      onSelect: n,
      onContextMenu: r,
      renamingPath: l ?? null,
      onRenameCommit: i
    }
  ) });
}
function Bm(e) {
  return e.shiftKey ? "range" : e.ctrlKey || e.metaKey ? "toggle" : "replace";
}
function bd({
  node: e,
  selectedSet: t,
  cutSet: n,
  onSelect: r,
  onContextMenu: l,
  renamingPath: i,
  onRenameCommit: o
}) {
  const a = t.has(e.path), s = n.has(e.path), u = i === e.path;
  return /* @__PURE__ */ d.jsxs("li", { role: "treeitem", "aria-selected": a, children: [
    u ? /* @__PURE__ */ d.jsx(
      Wm,
      {
        initial: e.name,
        onCommit: (f) => o == null ? void 0 : o(e.path, f)
      }
    ) : /* @__PURE__ */ d.jsxs(
      "button",
      {
        type: "button",
        "data-testid": `tree-node-${e.path}`,
        "data-selected": a || void 0,
        "data-cut": s || void 0,
        style: s ? { opacity: 0.5 } : void 0,
        onClick: (f) => r(e.path, Bm(f)),
        onContextMenu: (f) => l == null ? void 0 : l(e.path, f),
        children: [
          /* @__PURE__ */ d.jsxs("span", { "data-testid": `tree-type-${e.path}`, children: [
            "[",
            e.type,
            "]"
          ] }),
          " ",
          /* @__PURE__ */ d.jsx("span", { "data-testid": `tree-name-${e.path}`, children: e.name || "/" })
        ]
      }
    ),
    e.children.length > 0 && /* @__PURE__ */ d.jsx("ul", { role: "group", children: e.children.map((f) => /* @__PURE__ */ d.jsx(
      bd,
      {
        node: f,
        selectedSet: t,
        cutSet: n,
        onSelect: r,
        onContextMenu: l,
        renamingPath: i,
        onRenameCommit: o
      },
      f.path
    )) })
  ] });
}
function Wm({
  initial: e,
  onCommit: t
}) {
  return /* @__PURE__ */ d.jsx(
    "input",
    {
      "data-testid": "tree-rename-input",
      autoFocus: !0,
      defaultValue: e,
      onKeyDown: (n) => {
        n.key === "Enter" ? t(n.target.value.trim() || null) : n.key === "Escape" && t(null);
      },
      onBlur: (n) => t(n.target.value.trim() || null)
    }
  );
}
function $o({ schema: e, value: t, onChange: n }) {
  const r = e.typename === "int", [l, i] = k.useState(
    () => t == null ? "" : String(t)
  );
  k.useEffect(() => {
    const a = t == null ? "" : String(t);
    i(a);
  }, [t]);
  const o = (a) => {
    if (a.startsWith("=")) {
      n(a);
      return;
    }
    if (a.trim() === "") {
      n(null);
      return;
    }
    const s = r ? parseInt(a, 10) : parseFloat(a);
    if (!Number.isFinite(s)) {
      i(t == null ? "" : String(t));
      return;
    }
    n(s);
  };
  return /* @__PURE__ */ d.jsx(
    "input",
    {
      type: "text",
      inputMode: r ? "numeric" : "decimal",
      value: l,
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      min: e.minval,
      max: e.maxval,
      onChange: (a) => i(a.target.value),
      onBlur: (a) => o(a.target.value),
      onKeyDown: (a) => {
        a.key === "Enter" && o(a.target.value);
      }
    }
  );
}
function Ao({ schema: e, value: t, onChange: n }) {
  const r = typeof t == "string" && t.toLowerCase() === "auto";
  return /* @__PURE__ */ d.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ d.jsxs("label", { children: [
      /* @__PURE__ */ d.jsx(
        "input",
        {
          type: "checkbox",
          checked: r,
          "data-testid": `setting-${e.name}-auto`,
          "aria-label": "auto",
          onChange: (l) => n(l.target.checked ? "Auto" : 0)
        }
      ),
      "Auto"
    ] }),
    !r && /* @__PURE__ */ d.jsx(
      $o,
      {
        schema: e,
        value: t,
        onChange: n
      }
    )
  ] });
}
function bm({ schema: e, value: t, onChange: n, siblings: r }) {
  if (!((r == null ? void 0 : r.mode) === "datetime"))
    return /* @__PURE__ */ d.jsx(Ao, { schema: e, value: t, onChange: n });
  const i = typeof t == "string" ? t : "", o = i.toLowerCase() === "auto";
  return /* @__PURE__ */ d.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ d.jsxs("label", { children: [
      /* @__PURE__ */ d.jsx(
        "input",
        {
          type: "checkbox",
          checked: o,
          "data-testid": `setting-${e.name}-auto`,
          "aria-label": "auto",
          onChange: (a) => n(a.target.checked ? "Auto" : "")
        }
      ),
      "Auto"
    ] }),
    !o && /* @__PURE__ */ d.jsx(
      "input",
      {
        type: "datetime-local",
        value: i,
        "data-testid": `setting-${e.name}-date`,
        "aria-label": e.usertext || e.name,
        onChange: (a) => n(a.target.value)
      }
    )
  ] });
}
function Vm({ schema: e, value: t, onChange: n }) {
  const r = !!t;
  return /* @__PURE__ */ d.jsx(
    "input",
    {
      type: "checkbox",
      checked: r,
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (l) => n(l.target.checked)
    }
  );
}
function Re({ schema: e, value: t, onChange: n, editable: r = !1 }) {
  const l = e.vallist ?? [], i = e.uilist ?? l.map((a) => String(a)), o = t == null ? "" : String(t);
  return r && !l.includes(o) ? /* @__PURE__ */ d.jsx(
    "input",
    {
      type: "text",
      value: o,
      list: `opt-${e.name}`,
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (a) => n(a.target.value)
    }
  ) : /* @__PURE__ */ d.jsx(
    "select",
    {
      value: o,
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (a) => n(a.target.value),
      children: l.map((a, s) => /* @__PURE__ */ d.jsx("option", { value: String(a), children: i[s] ?? String(a) }, String(a)))
    }
  );
}
function Hm({ schema: e, value: t, onChange: n }) {
  const r = typeof t == "string" ? t : "auto", l = r === "auto", i = t == null ? void 0 : t.$ref;
  return /* @__PURE__ */ d.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ d.jsxs("label", { children: [
      /* @__PURE__ */ d.jsx(
        "input",
        {
          type: "checkbox",
          checked: l,
          "data-testid": `setting-${e.name}-auto`,
          "aria-label": "auto",
          onChange: (o) => n(o.target.checked ? "auto" : "#000000")
        }
      ),
      "Auto"
    ] }),
    !l && /* @__PURE__ */ d.jsx(
      "input",
      {
        type: "color",
        value: Ym(r),
        "data-testid": `setting-${e.name}-color`,
        "aria-label": e.usertext || e.name,
        onChange: (o) => n(o.target.value)
      }
    ),
    i && /* @__PURE__ */ d.jsxs("span", { "data-testid": `setting-${e.name}-ref`, children: [
      "ref: ",
      /* @__PURE__ */ d.jsx("code", { children: i })
    ] })
  ] });
}
const lu = /* @__PURE__ */ new Map(), Qm = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  lime: "#00ff00",
  blue: "#0000ff",
  yellow: "#ffff00",
  cyan: "#00ffff",
  aqua: "#00ffff",
  magenta: "#ff00ff",
  fuchsia: "#ff00ff",
  silver: "#c0c0c0",
  gray: "#808080",
  grey: "#808080",
  maroon: "#800000",
  olive: "#808000",
  green: "#008000",
  teal: "#008080",
  navy: "#000080",
  purple: "#800080",
  orange: "#ffa500",
  pink: "#ffc0cb",
  brown: "#a52a2a"
};
function Ym(e) {
  if (/^#[0-9a-fA-F]{6}$/.test(e)) return e;
  const t = Qm[e.toLowerCase()];
  if (t) return t;
  if (typeof document > "u") return "#000000";
  const n = lu.get(e);
  if (n) return n;
  const r = document.createElement("div");
  r.style.color = e, r.style.display = "none", document.body.appendChild(r);
  const l = getComputedStyle(r).color;
  document.body.removeChild(r);
  const i = l.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!i) return "#000000";
  const o = "#" + [i[1], i[2], i[3]].map((a) => parseInt(a, 10).toString(16).padStart(2, "0")).join("");
  return lu.set(e, o), o;
}
function Jr({
  schema: e,
  value: t,
  onChange: n,
  datasets: r = []
}) {
  const l = t == null ? "" : String(t), i = `ds-${e.name}`;
  return /* @__PURE__ */ d.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ d.jsx(
      "input",
      {
        type: "text",
        value: l,
        list: i,
        "data-testid": `setting-${e.name}-input`,
        "aria-label": e.usertext || e.name,
        onChange: (o) => n(o.target.value)
      }
    ),
    /* @__PURE__ */ d.jsx("datalist", { id: i, children: r.map((o) => /* @__PURE__ */ d.jsx("option", { value: o }, o)) })
  ] });
}
const iu = /^(-?\d+(?:\.\d+)?)\s*(pt|cm|mm|in|%|\/)?$/;
function Ai({ schema: e, value: t, onChange: n, allowAuto: r = !1 }) {
  const l = typeof t == "string" ? t : "", i = l.toLowerCase() === "auto", o = (() => {
    if (i) return { num: "", unit: "pt" };
    const c = l.match(iu);
    return { num: (c == null ? void 0 : c[1]) ?? "", unit: (c == null ? void 0 : c[2]) ?? "pt" };
  })(), [a, s] = k.useState(o.num), [u, f] = k.useState(o.unit);
  k.useEffect(() => {
    if (i) return;
    const c = l.match(iu);
    c && (s(c[1] ?? ""), f(c[2] ?? "pt"));
  }, [l, i]);
  const p = (c, v) => {
    c.trim() !== "" && n(`${c}${v}`);
  };
  return /* @__PURE__ */ d.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    r && /* @__PURE__ */ d.jsxs("label", { children: [
      /* @__PURE__ */ d.jsx(
        "input",
        {
          type: "checkbox",
          checked: i,
          "data-testid": `setting-${e.name}-auto`,
          "aria-label": "auto",
          onChange: (c) => n(c.target.checked ? "Auto" : "1pt")
        }
      ),
      "Auto"
    ] }),
    !i && /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
      /* @__PURE__ */ d.jsx(
        "input",
        {
          type: "text",
          inputMode: "decimal",
          value: a,
          "data-testid": `setting-${e.name}-num`,
          "aria-label": `${e.usertext || e.name} value`,
          onChange: (c) => s(c.target.value),
          onBlur: (c) => p(c.target.value, u),
          onKeyDown: (c) => {
            c.key === "Enter" && p(c.target.value, u);
          }
        }
      ),
      /* @__PURE__ */ d.jsx(
        "select",
        {
          value: u,
          "data-testid": `setting-${e.name}-unit`,
          "aria-label": `${e.usertext || e.name} unit`,
          onChange: (c) => {
            f(c.target.value), p(a, c.target.value);
          },
          children: ["pt", "cm", "mm", "in", "%"].map((c) => /* @__PURE__ */ d.jsx("option", { value: c, children: c }, c))
        }
      )
    ] })
  ] });
}
function Fi({
  schema: e,
  value: t,
  onChange: n,
  onBrowse: r
}) {
  const l = t == null ? "" : String(t);
  return /* @__PURE__ */ d.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ d.jsx(
      "input",
      {
        type: "text",
        value: l,
        "data-testid": `setting-${e.name}-path`,
        "aria-label": e.usertext || e.name,
        onChange: (i) => n(i.target.value)
      }
    ),
    r && /* @__PURE__ */ d.jsx(
      "button",
      {
        type: "button",
        "data-testid": `setting-${e.name}-browse`,
        onClick: async () => {
          const i = await r();
          i && n(i);
        },
        children: "Browse…"
      }
    )
  ] });
}
function Xm({ schema: e, value: t, onChange: n }) {
  const r = Km(t), [l, i] = k.useState(r);
  k.useEffect(() => i(r), [r]);
  const o = (a) => {
    if (a.startsWith("=")) {
      n(a);
      return;
    }
    const s = a.split(`
`).map((f) => f.trim()).filter(Boolean), u = {};
    for (const f of s) {
      const [p, c] = f.split("=", 2).map((y) => y == null ? void 0 : y.trim());
      if (!p) continue;
      const v = Number(c);
      if (!Number.isFinite(v)) {
        n(a);
        return;
      }
      u[p] = v;
    }
    n(u);
  };
  return /* @__PURE__ */ d.jsx(
    "textarea",
    {
      value: l,
      rows: Math.max(2, l.split(`
`).length),
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (a) => i(a.target.value),
      onBlur: (a) => o(a.target.value)
    }
  );
}
function Km(e) {
  return typeof e == "string" ? e : e && typeof e == "object" && !Array.isArray(e) ? Object.entries(e).map(([t, n]) => `${t}=${n}`).join(`
`) : "";
}
function Gm({ schema: e, value: t, onChange: n }) {
  const r = Array.isArray(t) ? t.join(", ") : typeof t == "string" ? t : "", [l, i] = k.useState(r);
  k.useEffect(() => i(r), [r]);
  const o = (a) => {
    if (a.startsWith("=")) {
      n(a);
      return;
    }
    if (a.trim() === "") {
      n([]);
      return;
    }
    const u = a.split(",").map((f) => f.trim()).filter(Boolean).map(Number);
    u.every(Number.isFinite) ? n(u) : n(a);
  };
  return /* @__PURE__ */ d.jsx(
    "input",
    {
      type: "text",
      value: l,
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (a) => i(a.target.value),
      onBlur: (a) => o(a.target.value),
      onKeyDown: (a) => {
        a.key === "Enter" && o(a.target.value);
      }
    }
  );
}
function Zm({ schema: e, value: t, onChange: n }) {
  const r = typeof t == "number" ? t : Number(t) || 0, l = e.minval ?? 0, i = e.maxval ?? 100, o = e.step ?? 1;
  return /* @__PURE__ */ d.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ d.jsx(
      "input",
      {
        type: "range",
        min: l,
        max: i,
        step: o,
        value: r,
        "data-testid": `setting-${e.name}-slider`,
        "aria-label": e.usertext || e.name,
        onChange: (a) => n(Number(a.target.value))
      }
    ),
    /* @__PURE__ */ d.jsx(
      "input",
      {
        type: "number",
        value: r,
        min: l,
        max: i,
        step: o,
        "data-testid": `setting-${e.name}-num`,
        "aria-label": `${e.usertext || e.name} value`,
        onChange: (a) => n(Number(a.target.value))
      }
    )
  ] });
}
function Jm({ schema: e, value: t, onChange: n }) {
  const r = e.vallist ?? [];
  return /* @__PURE__ */ d.jsx(
    "select",
    {
      value: t == null ? "" : String(t),
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (l) => n(l.target.value),
      children: r.map((l) => /* @__PURE__ */ d.jsx("option", { value: l, children: l }, l))
    }
  );
}
function Oi({ schema: e, value: t, onChange: n }) {
  const r = Array.isArray(t) ? JSON.stringify(t, null, 2) : "";
  return /* @__PURE__ */ d.jsx(
    "textarea",
    {
      defaultValue: r,
      rows: Math.max(3, r.split(`
`).length),
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onBlur: (l) => {
        const i = l.target.value.trim();
        if (i === "") {
          n([]);
          return;
        }
        try {
          const o = JSON.parse(i);
          Array.isArray(o) ? n(o) : n(i);
        } catch {
          n(i);
        }
      }
    }
  );
}
function qm({ schema: e, value: t, onChange: n }) {
  const r = e.vallist ?? [];
  return /* @__PURE__ */ d.jsx(
    "select",
    {
      value: t == null ? "" : String(t),
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (l) => n(l.target.value),
      children: r.map((l) => /* @__PURE__ */ d.jsx("option", { value: l, children: l }, l))
    }
  );
}
function qr({ schema: e, value: t, onChange: n }) {
  return /* @__PURE__ */ d.jsx(
    "input",
    {
      type: "text",
      value: t == null ? "" : String(t),
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (r) => n(r.target.value)
    }
  );
}
function Ui({
  schema: e,
  value: t,
  onChange: n,
  candidates: r = []
}) {
  const l = t == null ? "" : String(t), i = `wp-${e.name}`;
  return /* @__PURE__ */ d.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ d.jsx(
      "input",
      {
        type: "text",
        value: l,
        list: i,
        "data-testid": `setting-${e.name}-input`,
        "aria-label": e.usertext || e.name,
        onChange: (o) => n(o.target.value)
      }
    ),
    /* @__PURE__ */ d.jsx("datalist", { id: i, children: r.map((o) => /* @__PURE__ */ d.jsx("option", { value: o }, o)) })
  ] });
}
const Vd = {
  // Atomic
  str: qr,
  "str-notes": qr,
  bool: Vm,
  int: $o,
  float: $o,
  "float-or-auto": Ao,
  "int-or-auto": Ao,
  "float-slider": Zm,
  distance: Ai,
  "distance-or-auto": (e) => /* @__PURE__ */ d.jsx(Ai, { ...e, allowAuto: !0 }),
  displacement: Ai,
  choice: Re,
  "choice-or-more": (e) => /* @__PURE__ */ d.jsx(Re, { ...e, editable: !0 }),
  "float-choice": (e) => /* @__PURE__ */ d.jsx(Re, { ...e, editable: !0 }),
  color: Hm,
  colormap: Re,
  marker: qm,
  arrow: Re,
  "line-style": Jm,
  "fill-style": Re,
  "fill-style-ext": Re,
  "errorbar-style": Re,
  "align-horz": Re,
  "align-vert": Re,
  "align-horz-+manual": Re,
  "align-vert-+manual": Re,
  "font-family": qr,
  "font-style": qr,
  "rotate-interval": Re,
  "axis-bound": bm,
  // List / composite
  "float-list": Gm,
  "float-dict": Xm,
  "str-multi": Oi,
  "line-multi": Oi,
  "fill-multi": Oi,
  // Reference-by-path
  dataset: Jr,
  "dataset-multi": Jr,
  "dataset-extended": Jr,
  "dataset-or-str": Jr,
  "widget-path": Ui,
  "widget-choice": Ui,
  axis: Ui,
  // File-system
  filename: Fi,
  "filename-image": Fi,
  "filename-svg": Fi,
  // Internal — kept hidden by the inspector via `setting.hidden`,
  // but mapped here so the registry-coverage assertions report 100%.
  "backward-compat": () => null
};
new Set(
  Object.keys(Vd)
);
function eg(e) {
  return Vd[e] ?? null;
}
function tg(e) {
  var p;
  const t = e.widgetPaths[0], n = e.widgetPaths.length > 1, [r, l] = k.useState({}), i = (c, v) => r[c] ?? !Hd(v), o = (c, v) => l((y) => ({ ...y, [c]: v })), [a, s] = k.useState(!1), u = (c, v) => {
    var N;
    if (!n) {
      e.onChange(c, v);
      return;
    }
    const y = c.slice(t.length), x = e.widgetPaths.map((m) => ({ path: m + y, value: v }));
    (N = e.onChangeMany) == null || N.call(e, x);
  }, f = n ? `${((p = e.schema.typenames) == null ? void 0 : p.join(", ")) ?? "widgets"} ×${e.widgetPaths.length}` : e.schema.typename ?? "";
  return /* @__PURE__ */ d.jsxs(
    "div",
    {
      "data-testid": "inspector",
      "data-widget": t,
      "data-multi": n || void 0,
      "data-count": e.widgetPaths.length,
      children: [
        /* @__PURE__ */ d.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
          /* @__PURE__ */ d.jsx("h3", { "data-testid": "inspector-title", style: { margin: "0.3em 0" }, children: f }),
          /* @__PURE__ */ d.jsxs(
            "label",
            {
              style: { fontSize: 12, color: "#666", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", whiteSpace: "nowrap" },
              title: "Show only settings changed from their default",
              children: [
                /* @__PURE__ */ d.jsx(
                  "input",
                  {
                    type: "checkbox",
                    "data-testid": "inspector-only-customised",
                    checked: a,
                    onChange: (c) => s(c.target.checked)
                  }
                ),
                "Only customised"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ d.jsx(
          Yd,
          {
            group: e.schema,
            basePath: t,
            widgetPath: t,
            values: e.values,
            datasets: e.datasets,
            onChange: u,
            settingMenu: e.settingMenu,
            groupOpen: i,
            setGroupOpen: o,
            hideDefaults: a
          }
        )
      ]
    }
  );
}
function Hd(e) {
  if (e.setnsmode) return e.setnsmode === "formatting";
  const t = e.settings.filter((n) => !n.hidden);
  return t.length > 0 ? t.every((n) => n.formatting) : e.subgroups.length > 0 ? e.subgroups.every(Hd) : !1;
}
function Qd(e, t, n) {
  for (const r of e.settings)
    if (!r.hidden && !Ia(r, n[Cr(t, r.name)], r.mixed_value === !0))
      return !0;
  for (const r of e.subgroups)
    if (Qd(r, Cr(t, r.name), n)) return !0;
  return !1;
}
function Yd({ group: e, basePath: t, widgetPath: n, values: r, datasets: l, onChange: i, settingMenu: o, groupLabel: a, groupOpen: s, setGroupOpen: u, hideDefaults: f }) {
  return /* @__PURE__ */ d.jsxs(k.Fragment, { children: [
    e.settings.map((p) => {
      if (p.hidden) return null;
      const c = r[Cr(t, p.name)];
      return f && Ia(p, c, p.mixed_value === !0) ? null : /* @__PURE__ */ d.jsx(
        rg,
        {
          schema: p,
          basePath: t,
          widgetPath: n,
          value: c,
          datasets: l,
          onChange: i,
          settingMenu: o,
          groupLabel: a
        },
        p.name
      );
    }),
    e.subgroups.map((p) => {
      const c = p.usertext || lg(p.name), v = Cr(t, p.name), y = Qd(p, v, r);
      if (f && !y) return null;
      const x = f ? y : s(v, p);
      return /* @__PURE__ */ d.jsxs(
        "details",
        {
          "data-testid": `subgroup-${p.name}`,
          "data-customised": y || void 0,
          open: x,
          onToggle: (N) => {
            const m = N.currentTarget, h = typeof m.open == "boolean" ? m.open : m.hasAttribute("open");
            h !== x && u(v, h);
          },
          children: [
            /* @__PURE__ */ d.jsx("summary", { style: { opacity: y ? 1 : 0.5, fontWeight: y ? 600 : 400 }, children: c }),
            /* @__PURE__ */ d.jsx(
              Yd,
              {
                group: p,
                basePath: v,
                widgetPath: n,
                values: r,
                datasets: l,
                onChange: i,
                settingMenu: o,
                groupLabel: c,
                groupOpen: s,
                setGroupOpen: u,
                hideDefaults: f
              }
            )
          ]
        },
        p.name
      );
    })
  ] });
}
function ng(e, t) {
  if (e === t) return !0;
  if (e == null || t == null) return !1;
  if (typeof e == "object" || typeof t == "object")
    try {
      return JSON.stringify(e) === JSON.stringify(t);
    } catch {
      return !1;
    }
  return String(e) === String(t);
}
function Ia(e, t, n) {
  return n ? !1 : t === void 0 ? !0 : ng(t, e.default);
}
function ou(e) {
  return {
    borderLeft: `2px solid ${e ? "transparent" : "#1f6feb"}`,
    paddingLeft: 6,
    opacity: e ? 0.5 : 1
  };
}
function rg({
  schema: e,
  basePath: t,
  widgetPath: n,
  value: r,
  datasets: l,
  onChange: i,
  settingMenu: o,
  groupLabel: a
}) {
  const s = eg(e.typename), u = Cr(t, e.name), f = og(e, a), p = e.mixed_value === !0, c = Ia(e, r, p), v = (y) => o ? o(
    {
      path: u,
      name: e.name,
      widgetPath: n,
      isReference: e.is_reference === !0,
      isStylesheet: u.startsWith("/StyleSheet/")
    },
    y
  ) : y;
  return s ? /* @__PURE__ */ d.jsxs(
    "div",
    {
      "data-testid": `row-${e.name}`,
      "data-mixed": p || void 0,
      "data-default": c || void 0,
      style: ou(c),
      children: [
        v(
          /* @__PURE__ */ d.jsxs("label", { style: p ? { fontStyle: "italic", color: "#888" } : void 0, children: [
            f,
            p ? " (mixed)" : ""
          ] })
        ),
        /* @__PURE__ */ d.jsx(
          s,
          {
            schema: e,
            value: p ? void 0 : r,
            datasets: l,
            onChange: (y) => i(u, y)
          }
        )
      ]
    }
  ) : /* @__PURE__ */ d.jsxs(
    "div",
    {
      "data-testid": `row-${e.name}`,
      "data-mixed": p || void 0,
      "data-default": c || void 0,
      style: ou(c),
      children: [
        v(/* @__PURE__ */ d.jsx("label", { children: f })),
        /* @__PURE__ */ d.jsx("code", { "data-testid": `fallback-${e.name}`, children: r === void 0 ? "(unset)" : JSON.stringify(r) }),
        /* @__PURE__ */ d.jsxs("small", { children: [
          " [typename=",
          e.typename,
          "]"
        ] })
      ]
    }
  );
}
function Cr(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
function lg(e) {
  if (!e) return e;
  const t = e.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
const ig = /* @__PURE__ */ new Set(["color", "hide", "width", "style"]);
function og(e, t) {
  const n = e.usertext || e.name;
  return t ? ig.has(e.name) ? `${t} ${n.toLowerCase()}` : n : e.name === "color" && e.descr ? e.descr : n;
}
function ag({
  store: e,
  mode: t,
  onClose: n,
  notify: r
}) {
  const l = e(), [i, o] = k.useState(!1), a = l.rpc, s = async (u) => {
    o(!0);
    try {
      const f = await u();
      await e.getState().refreshDatasets(), r(`Created: ${f.created.join(", ") || "(none)"}`), n();
    } catch (f) {
      r(f.message);
    } finally {
      o(!1);
    }
  };
  return /* @__PURE__ */ d.jsxs("div", { "data-testid": `datadlg-${t}`, style: { minWidth: 380, fontSize: 13 }, children: [
    t === "create1d" && /* @__PURE__ */ d.jsx(sg, { rpc: a, busy: i, run: s }),
    t === "create2d" && /* @__PURE__ */ d.jsx(ug, { rpc: a, busy: i, run: s }),
    t === "filter" && /* @__PURE__ */ d.jsx(cg, { rpc: a, datasets: l.datasets.map((u) => u.name), busy: i, run: s }),
    t === "histogram" && /* @__PURE__ */ d.jsx(dg, { rpc: a, datasets: l.datasets.map((u) => u.name), busy: i, run: s })
  ] });
}
function sg({ rpc: e, busy: t, run: n }) {
  const [r, l] = k.useState("newdata"), [i, o] = k.useState("expression"), [a, s] = k.useState(""), [u, f] = k.useState(100), [p, c] = k.useState(0), [v, y] = k.useState(1);
  return /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
    /* @__PURE__ */ d.jsx(we, { label: "Name", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "dc-name", value: r, onChange: (x) => l(x.target.value) }) }),
    /* @__PURE__ */ d.jsx(we, { label: "Method", children: /* @__PURE__ */ d.jsxs("select", { "data-testid": "dc-mode", value: i, onChange: (x) => o(x.target.value), children: [
      /* @__PURE__ */ d.jsx("option", { value: "expression", children: "Expression" }),
      /* @__PURE__ */ d.jsx("option", { value: "range", children: "Range (linspace)" }),
      /* @__PURE__ */ d.jsx("option", { value: "parametric", children: "Parametric" })
    ] }) }),
    (i === "expression" || i === "parametric") && /* @__PURE__ */ d.jsx(we, { label: "Expression", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "dc-expr", value: a, onChange: (x) => s(x.target.value), placeholder: i === "parametric" ? "cos(t)" : "x*2 + 1" }) }),
    (i === "range" || i === "parametric") && /* @__PURE__ */ d.jsxs(we, { label: "Steps / min / max", children: [
      /* @__PURE__ */ d.jsx("input", { "data-testid": "dc-nsteps", type: "number", value: u, onChange: (x) => f(+x.target.value), style: hl }),
      /* @__PURE__ */ d.jsx("input", { "data-testid": "dc-min", type: "number", value: p, onChange: (x) => c(+x.target.value), style: hl }),
      /* @__PURE__ */ d.jsx("input", { "data-testid": "dc-max", type: "number", value: v, onChange: (x) => y(+x.target.value), style: hl })
    ] }),
    /* @__PURE__ */ d.jsx(li, { busy: t, testid: "dc-create", onClick: () => n(() => e.data.create({ name: r, mode: i, expr: a, nsteps: u, min: p, max: v })) })
  ] });
}
function ug({ rpc: e, busy: t, run: n }) {
  const [r, l] = k.useState("newdata2d"), [i, o] = k.useState("x+y"), [a, s] = k.useState("0,1,0.1"), [u, f] = k.useState("0,1,0.1");
  return /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
    /* @__PURE__ */ d.jsx(we, { label: "Name", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "d2-name", value: r, onChange: (p) => l(p.target.value) }) }),
    /* @__PURE__ */ d.jsx(we, { label: "z = f(x, y)", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "d2-expr", value: i, onChange: (p) => o(p.target.value) }) }),
    /* @__PURE__ */ d.jsx(we, { label: "x min,max,step", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "d2-xstep", value: a, onChange: (p) => s(p.target.value) }) }),
    /* @__PURE__ */ d.jsx(we, { label: "y min,max,step", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "d2-ystep", value: u, onChange: (p) => f(p.target.value) }) }),
    /* @__PURE__ */ d.jsx(li, { busy: t, testid: "d2-create", onClick: () => n(() => e.data.create2d({
      name: r,
      mode: "xyfunc",
      expr: i,
      xstep: a.split(",").map(Number),
      ystep: u.split(",").map(Number)
    })) })
  ] });
}
function cg({ rpc: e, datasets: t, busy: n, run: r }) {
  const [l, i] = k.useState(""), [o, a] = k.useState([]), [s, u] = k.useState("f_"), [f, p] = k.useState(!1);
  return /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
    /* @__PURE__ */ d.jsx(we, { label: "Filter (e.g. x>0)", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "flt-expr", value: l, onChange: (c) => i(c.target.value) }) }),
    /* @__PURE__ */ d.jsx(we, { label: "Datasets", children: /* @__PURE__ */ d.jsx(
      "select",
      {
        "data-testid": "flt-datasets",
        multiple: !0,
        value: o,
        style: { minWidth: 160, minHeight: 60 },
        onChange: (c) => a([...c.target.selectedOptions].map((v) => v.value)),
        children: t.map((c) => /* @__PURE__ */ d.jsx("option", { value: c, children: c }, c))
      }
    ) }),
    /* @__PURE__ */ d.jsx(we, { label: "Prefix", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "flt-prefix", value: s, onChange: (c) => u(c.target.value) }) }),
    /* @__PURE__ */ d.jsx(we, { label: "Invert", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "flt-invert", type: "checkbox", checked: f, onChange: (c) => p(c.target.checked) }) }),
    /* @__PURE__ */ d.jsx(li, { busy: n, testid: "flt-run", onClick: () => r(() => e.data.filter({ filter: l, datasets: o, prefix: s, invert: f })) })
  ] });
}
function dg({ rpc: e, datasets: t, busy: n, run: r }) {
  const [l, i] = k.useState(t[0] ?? ""), [o, a] = k.useState("bins"), [s, u] = k.useState("counts"), [f, p] = k.useState(10), [c, v] = k.useState("counts");
  return /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
    /* @__PURE__ */ d.jsx(we, { label: "Input dataset/expr", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "hist-expr", value: l, onChange: (y) => i(y.target.value) }) }),
    /* @__PURE__ */ d.jsxs(we, { label: "Out bins / values", children: [
      /* @__PURE__ */ d.jsx("input", { "data-testid": "hist-outbins", value: o, onChange: (y) => a(y.target.value) }),
      /* @__PURE__ */ d.jsx("input", { "data-testid": "hist-outvals", value: s, onChange: (y) => u(y.target.value) })
    ] }),
    /* @__PURE__ */ d.jsx(we, { label: "Bins", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "hist-bins", type: "number", value: f, onChange: (y) => p(+y.target.value), style: hl }) }),
    /* @__PURE__ */ d.jsx(we, { label: "Method", children: /* @__PURE__ */ d.jsxs("select", { "data-testid": "hist-method", value: c, onChange: (y) => v(y.target.value), children: [
      /* @__PURE__ */ d.jsx("option", { value: "counts", children: "Counts" }),
      /* @__PURE__ */ d.jsx("option", { value: "density", children: "Density" }),
      /* @__PURE__ */ d.jsx("option", { value: "fractions", children: "Fractions" })
    ] }) }),
    /* @__PURE__ */ d.jsx(li, { busy: n, testid: "hist-run", onClick: () => r(() => e.data.histogram({ expr: l, outbins: o, outvals: s, bins: f, method: c })) })
  ] });
}
function we({ label: e, children: t }) {
  return /* @__PURE__ */ d.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }, children: [
    /* @__PURE__ */ d.jsx("span", { style: { flex: 1 }, children: e }),
    /* @__PURE__ */ d.jsx("span", { style: { display: "flex", gap: 4 }, children: t })
  ] });
}
function li({ busy: e, onClick: t, testid: n }) {
  return /* @__PURE__ */ d.jsx("div", { style: { textAlign: "right", marginTop: 8 }, children: /* @__PURE__ */ d.jsx("button", { type: "button", "data-testid": n, disabled: e, onClick: t, children: e ? "Working…" : "Create" }) });
}
const hl = { width: 70 }, fg = 1e5;
function pg({
  store: e,
  notify: t,
  initialName: n
}) {
  const r = e(), l = r.datasets.map((g) => g.name), [i, o] = k.useState(n ?? r.selectedDatasets[0] ?? l[0] ?? ""), [a, s] = k.useState(""), [u, f] = k.useState(0), [p, c] = k.useState(0), [v, y] = k.useState(!1), [x, N] = k.useState(!1);
  k.useEffect(() => {
    if (!i) return;
    let g = !1;
    return y(!0), r.rpc.data.peek(i, 0, fg).then((w) => {
      g || (s(w.values.join(`
`)), f(w.total), c(w.values.length));
    }).catch((w) => {
      g || t(w.message);
    }).finally(() => {
      g || y(!1);
    }), () => {
      g = !0;
    };
  }, [i]);
  const m = u > p, h = async () => {
    const g = a.split(/[\s,]+/).map((w) => w.trim()).filter(Boolean).map(Number);
    if (g.some((w) => Number.isNaN(w))) {
      t("All values must be numbers.");
      return;
    }
    N(!0);
    try {
      await r.rpc.data.set(i, g), await r.refreshDatasets(), t(`Saved ${i} (${g.length} values)`);
    } catch (w) {
      t(w.message);
    } finally {
      N(!1);
    }
  };
  return /* @__PURE__ */ d.jsxs("div", { "data-testid": "dataedit", style: { minWidth: 360, fontSize: 13 }, children: [
    /* @__PURE__ */ d.jsxs("label", { style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }, children: [
      /* @__PURE__ */ d.jsx("span", { children: "Dataset" }),
      /* @__PURE__ */ d.jsxs(
        "select",
        {
          "data-testid": "dataedit-name",
          value: i,
          onChange: (g) => o(g.target.value),
          children: [
            l.length === 0 && /* @__PURE__ */ d.jsx("option", { value: "", children: "(no datasets)" }),
            l.map((g) => /* @__PURE__ */ d.jsx("option", { value: g, children: g }, g))
          ]
        }
      ),
      /* @__PURE__ */ d.jsx("span", { style: { color: "#888", fontSize: 11 }, children: v ? "loading…" : u ? `${u} values` : "" })
    ] }),
    m && /* @__PURE__ */ d.jsxs("p", { "data-testid": "dataedit-truncated", style: { color: "#b45309", fontSize: 11 }, children: [
      "Showing first ",
      p,
      " of ",
      u,
      " — too large to edit here (read-only)."
    ] }),
    /* @__PURE__ */ d.jsx(
      "textarea",
      {
        "data-testid": "dataedit-values",
        value: a,
        readOnly: m,
        onChange: (g) => s(g.target.value),
        spellCheck: !1,
        style: { width: "100%", height: 240, font: "12px monospace", boxSizing: "border-box" }
      }
    ),
    /* @__PURE__ */ d.jsx("div", { style: { textAlign: "right", marginTop: 8 }, children: /* @__PURE__ */ d.jsx(
      "button",
      {
        type: "button",
        "data-testid": "dataedit-save",
        disabled: x || m || !i,
        onClick: () => void h(),
        children: x ? "Saving…" : "Save"
      }
    ) })
  ] });
}
const au = [
  { id: "definition", label: "Definitions", nameHint: "pi  or  f(x)", valHint: "3.14159  or  x**2" },
  { id: "import", label: "Imports", nameHint: "numpy", valHint: "arange, sin" },
  { id: "color", label: "Colors", nameHint: "brand", valHint: "#ff8800" }
];
function hg({
  store: e,
  notify: t
}) {
  const n = e.getState().rpc, [r, l] = k.useState("definition"), [i, o] = k.useState([]), [a, s] = k.useState(!1);
  k.useEffect(() => {
    let c = !1;
    return n.doc.getCustoms().then((v) => {
      c || o((v[r] ?? []).map(([y, x]) => [y, String(x)]));
    }).catch((v) => t(v.message)), () => {
      c = !0;
    };
  }, [r]);
  const u = (c, v, y) => o((x) => x.map((N, m) => m === c ? v === 0 ? [y, N[1]] : [N[0], y] : N)), f = async () => {
    s(!0);
    try {
      const c = i.filter(([v]) => v.trim());
      await n.doc.setCustoms(r, c), t(`Saved ${c.length} ${r}(s)`);
    } catch (c) {
      t(c.message);
    } finally {
      s(!1);
    }
  }, p = au.find((c) => c.id === r);
  return /* @__PURE__ */ d.jsxs("div", { "data-testid": "custom", style: { minWidth: 420, fontSize: 13 }, children: [
    /* @__PURE__ */ d.jsx("div", { style: { display: "flex", gap: 4, marginBottom: 8 }, children: au.map((c) => /* @__PURE__ */ d.jsx(
      "button",
      {
        type: "button",
        "data-testid": `custom-tab-${c.id}`,
        "aria-pressed": r === c.id,
        onClick: () => l(c.id),
        style: { fontWeight: r === c.id ? 700 : 400 },
        children: c.label
      },
      c.id
    )) }),
    /* @__PURE__ */ d.jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ d.jsx("thead", { children: /* @__PURE__ */ d.jsxs("tr", { style: { color: "#888", textAlign: "left" }, children: [
        /* @__PURE__ */ d.jsx("th", { children: "Name" }),
        /* @__PURE__ */ d.jsx("th", { children: "Definition" }),
        /* @__PURE__ */ d.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ d.jsx("tbody", { "data-testid": "custom-rows", children: i.map((c, v) => /* @__PURE__ */ d.jsxs("tr", { children: [
        /* @__PURE__ */ d.jsx("td", { children: /* @__PURE__ */ d.jsx("input", { "data-testid": `custom-name-${v}`, value: c[0], placeholder: p.nameHint, onChange: (y) => u(v, 0, y.target.value), style: { width: "95%" } }) }),
        /* @__PURE__ */ d.jsx("td", { children: /* @__PURE__ */ d.jsx("input", { "data-testid": `custom-val-${v}`, value: c[1], placeholder: p.valHint, onChange: (y) => u(v, 1, y.target.value), style: { width: "95%" } }) }),
        /* @__PURE__ */ d.jsx("td", { children: /* @__PURE__ */ d.jsx("button", { type: "button", "data-testid": `custom-del-${v}`, onClick: () => o((y) => y.filter((x, N) => N !== v)), children: "✕" }) })
      ] }, v)) })
    ] }),
    /* @__PURE__ */ d.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 8 }, children: [
      /* @__PURE__ */ d.jsx("button", { type: "button", "data-testid": "custom-add", onClick: () => o((c) => [...c, ["", ""]]), children: "+ Add" }),
      /* @__PURE__ */ d.jsx("button", { type: "button", "data-testid": "custom-save", disabled: a, onClick: () => void f(), children: a ? "Saving…" : "Save" })
    ] })
  ] });
}
async function ot(e, t) {
  const n = t.getState(), r = n.selected, l = r[0];
  switch (e) {
    case "undo":
      return n.undo();
    case "redo":
      return n.redo();
    case "cut":
      return r.length ? n.cutWidgets(r) : void 0;
    case "copy":
      return r.length ? n.copyWidgets(r) : void 0;
    case "paste":
      return l ? n.pasteWidgets(l).then(() => {
      }) : void 0;
    case "copyAsImage":
      return n.render ? n.copyWidgetAsImage(0, n.render.width, n.render.height) : void 0;
    case "delete":
      return r.length ? Promise.all(r.map((i) => n.removeWidget(i))).then(() => {
      }) : void 0;
    case "hide":
      return r.length ? n.setHidden(r, !0) : void 0;
    case "show":
      return r.length ? n.setHidden(r, !1) : void 0;
    case "moveUp":
      return l ? n.moveWidget(l, "up") : void 0;
    case "moveDown":
      return l ? n.moveWidget(l, "down") : void 0;
    case "rename":
      return;
  }
}
const ln = (e) => e.selected.length > 0, Xd = [
  { group: "Pages & Graphs", items: [
    ["page", "Page"],
    ["grid", "Grid"],
    ["graph", "Graph"],
    ["graph3d", "3D Graph"],
    ["scene3d", "3D Scene"]
  ] },
  { group: "Axes", items: [
    ["axis", "Axis"],
    ["axis-broken", "Broken Axis"],
    ["axis-function", "Function Axis"],
    ["axis3d", "3D Axis"]
  ] },
  { group: "Plotters", items: [
    ["xy", "Points (XY)"],
    ["function", "Function"],
    ["bar", "Bar chart"],
    ["histo", "Histogram"],
    ["boxplot", "Box plot"],
    ["fit", "Fit"],
    ["image", "Image"],
    ["density", "Density (2D histogram)"],
    ["contour", "Contour"],
    ["vectorfield", "Vector field"],
    ["covariance", "Covariance"],
    ["polar", "Polar"],
    ["ternary", "Ternary"],
    ["nonorthpoint", "Non-orth. points"],
    ["nonorthfunc", "Non-orth. function"]
  ] },
  { group: "3D plotters", items: [
    ["point3d", "3D points"],
    ["function3d", "3D function"],
    ["surface3d", "3D surface"],
    ["volume3d", "3D volume"]
  ] },
  { group: "Annotations", items: [
    ["key", "Key / legend"],
    ["label", "Text label"],
    ["colorbar", "Colorbar"]
  ] },
  { group: "Shapes", items: [
    ["rect", "Rectangle"],
    ["ellipse", "Ellipse"],
    ["line", "Line"],
    ["polygon", "Polygon"],
    ["imagefile", "Image file"],
    ["svgfile", "SVG file"]
  ] }
];
function mg() {
  const e = {};
  for (const { items: t } of Xd)
    for (const [n, r] of t)
      e[`add.${n}`] = {
        id: `add.${n}`,
        label: r,
        // Enabled only when the current selection has a valid place for this
        // widget; placed at the daemon-resolved parent (self or nearest
        // ancestor — adds as a sibling for leaf selections, like Qt).
        enabled: (l) => n in l.insertTargets,
        run: ({ store: l }) => {
          const i = l.getState(), o = i.insertTargets[n];
          o && i.addWidget(o, n);
        }
      };
  return e;
}
const ii = {
  // ---- File -----------------------------------------------------------
  "file.new": {
    id: "file.new",
    label: "New",
    shortcut: "Ctrl+N",
    run: ({ store: e }) => {
      e.getState().newDocument("graph");
    }
  },
  "file.open": {
    id: "file.open",
    label: "Open…",
    shortcut: "Ctrl+O",
    run: async ({ store: e, pick: t, notify: n }) => {
      if (!t.vsz) return n("No file picker available.");
      const r = await t.vsz();
      r && await e.getState().openFile(r);
    }
  },
  "file.save": {
    id: "file.save",
    label: "Save",
    shortcut: "Ctrl+S",
    run: async ({ store: e, pick: t }) => {
      var l;
      const n = e.getState();
      if (n.filename) {
        await n.saveFile();
        return;
      }
      const r = await ((l = t.savePath) == null ? void 0 : l.call(t));
      r && await n.saveFileAs(r);
    }
  },
  "file.saveas": {
    id: "file.saveas",
    label: "Save As…",
    run: async ({ store: e, pick: t, notify: n }) => {
      if (!t.savePath) return n("No save picker available.");
      const r = await t.savePath();
      r && await e.getState().saveFileAs(r);
    }
  },
  "file.export": {
    id: "file.export",
    label: "Export…",
    enabled: (e) => !!e.tree && e.tree.children.length > 0,
    run: ({ openDialog: e }) => e("export")
  },
  "file.close": {
    id: "file.close",
    label: "Close Window",
    shortcut: "Ctrl+W",
    run: ({ notify: e }) => e("Close handled by the window manager.")
  },
  // ---- Edit -----------------------------------------------------------
  "edit.undo": {
    id: "edit.undo",
    label: "Undo",
    shortcut: "Ctrl+Z",
    enabled: (e) => e.canUndo,
    run: ({ store: e }) => ot("undo", e)
  },
  "edit.redo": {
    id: "edit.redo",
    label: "Redo",
    shortcut: "Ctrl+Shift+Z",
    enabled: (e) => e.canRedo,
    run: ({ store: e }) => ot("redo", e)
  },
  "edit.cut": {
    id: "edit.cut",
    label: "Cut",
    shortcut: "Ctrl+X",
    enabled: ln,
    run: ({ store: e }) => ot("cut", e)
  },
  "edit.copy": {
    id: "edit.copy",
    label: "Copy",
    shortcut: "Ctrl+C",
    enabled: ln,
    run: ({ store: e }) => ot("copy", e)
  },
  "edit.paste": {
    id: "edit.paste",
    label: "Paste",
    shortcut: "Ctrl+V",
    enabled: ln,
    run: ({ store: e }) => ot("paste", e)
  },
  "edit.copyimage": {
    id: "edit.copyimage",
    label: "Copy as image",
    shortcut: "Ctrl+Alt+C",
    enabled: (e) => !!e.render,
    run: ({ store: e }) => ot("copyAsImage", e)
  },
  "edit.delete": {
    id: "edit.delete",
    label: "Delete",
    shortcut: "Del",
    enabled: ln,
    run: ({ store: e }) => ot("delete", e)
  },
  "edit.moveup": {
    id: "edit.moveup",
    label: "Move up",
    shortcut: "Ctrl+Shift+PgUp",
    enabled: ln,
    run: ({ store: e }) => ot("moveUp", e)
  },
  "edit.movedown": {
    id: "edit.movedown",
    label: "Move down",
    shortcut: "Ctrl+Shift+PgDn",
    enabled: ln,
    run: ({ store: e }) => ot("moveDown", e)
  },
  "edit.prefs": {
    id: "edit.prefs",
    label: "Preferences…",
    run: ({ openDialog: e }) => e("preferences")
  },
  "edit.stylesheet": {
    id: "edit.stylesheet",
    label: "Default styles…",
    run: ({ openDialog: e }) => e("stylesheet")
  },
  "edit.custom": {
    id: "edit.custom",
    label: "Custom definitions…",
    run: ({ openDialog: e }) => e("custom")
  },
  // ---- View -----------------------------------------------------------
  "view.prevpage": {
    id: "view.prevpage",
    label: "Previous page",
    shortcut: "Ctrl+PgUp",
    enabled: (e) => e.currentPage > 0,
    run: ({ store: e }) => e.getState().prevPage()
  },
  "view.nextpage": {
    id: "view.nextpage",
    label: "Next page",
    shortcut: "Ctrl+PgDn",
    enabled: (e) => {
      var t;
      return e.currentPage < (((t = e.tree) == null ? void 0 : t.children.length) ?? 1) - 1;
    },
    run: ({ store: e }) => e.getState().nextPage()
  },
  "view.fullscreen": {
    id: "view.fullscreen",
    label: "Full screen",
    shortcut: "Ctrl+F11",
    run: ({ toggleFullScreen: e, notify: t }) => e ? e() : t("Fullscreen unavailable.")
  },
  "view.tree": {
    id: "view.tree",
    label: "Document tree",
    checked: (e) => e.panels.tree,
    run: ({ store: e }) => e.getState().togglePanel("tree")
  },
  "view.inspector": {
    id: "view.inspector",
    label: "Properties",
    checked: (e) => e.panels.inspector,
    run: ({ store: e }) => e.getState().togglePanel("inspector")
  },
  "view.datasets": {
    id: "view.datasets",
    label: "Datasets",
    checked: (e) => e.panels.datasets,
    run: ({ store: e }) => e.getState().togglePanel("datasets")
  },
  // ---- Data -----------------------------------------------------------
  "data.import": {
    id: "data.import",
    label: "Import CSV…",
    shortcut: "Ctrl+I",
    run: ({ openDialog: e }) => e("importCsv")
  },
  "data.importfile": {
    id: "data.importfile",
    label: "Import data file…",
    run: ({ openDialog: e }) => e("import")
  },
  "data.edit": {
    id: "data.edit",
    label: "Editor…",
    shortcut: "Ctrl+E",
    run: ({ openDialog: e }) => e("dataEdit")
  },
  "data.reload": {
    id: "data.reload",
    label: "Reload",
    shortcut: "F5",
    run: ({ store: e }) => {
      e.getState().reloadFile();
    }
  },
  "data.create": {
    id: "data.create",
    label: "Create…",
    run: ({ openDialog: e }) => e("dataCreate")
  },
  "data.create2d": {
    id: "data.create2d",
    label: "Create 2D…",
    run: ({ openDialog: e }) => e("dataCreate2d")
  },
  "data.filter": {
    id: "data.filter",
    label: "Filter…",
    run: ({ openDialog: e }) => e("filter")
  },
  "data.histogram": {
    id: "data.histogram",
    label: "Histogram…",
    run: ({ openDialog: e }) => e("histogram")
  },
  "tools.console": {
    id: "tools.console",
    label: "Python console…",
    run: ({ openDialog: e }) => e("console")
  },
  // ---- Help -----------------------------------------------------------
  "help.about": {
    id: "help.about",
    label: "About Veusz",
    run: ({ openDialog: e }) => e("about")
  },
  "help.home": {
    id: "help.home",
    label: "Veusz home page",
    run: ({ openUrl: e, notify: t }) => e ? e("https://veusz.github.io/") : t("Cannot open links here.")
  },
  ...mg()
};
function Fo(e, t) {
  return typeof e.label == "function" ? e.label(t) : e.label;
}
function Kd({ store: e, ctx: t, density: n, onReload: r }) {
  var s;
  const l = e(), i = ((s = l.tree) == null ? void 0 : s.children.length) ?? 0, o = n === "inline", a = l.datasets.some((u) => u.linked);
  return /* @__PURE__ */ d.jsxs(
    "div",
    {
      "data-testid": o ? "embed-toolbar-inline" : "embed-toolbar-full",
      style: o ? xg : Sg,
      children: [
        /* @__PURE__ */ d.jsx(vg, { state: l, ctx: t, compact: o }),
        /* @__PURE__ */ d.jsx(qe, { id: "edit.undo", state: l, ctx: t, label: "↶", title: "Undo" }),
        /* @__PURE__ */ d.jsx(qe, { id: "edit.redo", state: l, ctx: t, label: "↷", title: "Redo" }),
        a && /* @__PURE__ */ d.jsx(gg, { ctx: t, compact: o, onReload: r }),
        !o && /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
          /* @__PURE__ */ d.jsx(el, {}),
          /* @__PURE__ */ d.jsx(qe, { id: "edit.cut", state: l, ctx: t, label: "✂ Cut" }),
          /* @__PURE__ */ d.jsx(qe, { id: "edit.copy", state: l, ctx: t, label: "⧉ Copy" }),
          /* @__PURE__ */ d.jsx(qe, { id: "edit.paste", state: l, ctx: t, label: "↥ Paste" }),
          /* @__PURE__ */ d.jsx(qe, { id: "edit.delete", state: l, ctx: t, label: "🗑 Delete" }),
          /* @__PURE__ */ d.jsx(el, {}),
          /* @__PURE__ */ d.jsx(qe, { id: "edit.moveup", state: l, ctx: t, label: "▲", title: "Move up" }),
          /* @__PURE__ */ d.jsx(qe, { id: "edit.movedown", state: l, ctx: t, label: "▼", title: "Move down" }),
          /* @__PURE__ */ d.jsx(el, {}),
          /* @__PURE__ */ d.jsx(wg, { state: l, ctx: t }),
          i > 1 && /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
            /* @__PURE__ */ d.jsx(el, {}),
            /* @__PURE__ */ d.jsx(qe, { id: "view.prevpage", state: l, ctx: t, label: "◀", title: "Previous page" }),
            /* @__PURE__ */ d.jsxs(
              "span",
              {
                style: { fontSize: 12, color: "#666" },
                "data-testid": "embed-toolbar-page",
                children: [
                  l.currentPage + 1,
                  " / ",
                  i
                ]
              }
            ),
            /* @__PURE__ */ d.jsx(qe, { id: "view.nextpage", state: l, ctx: t, label: "▶", title: "Next page" })
          ] })
        ] })
      ]
    }
  );
}
function qe({
  id: e,
  state: t,
  ctx: n,
  label: r,
  title: l
}) {
  const i = ii[e];
  if (!i || !(i.visible ? i.visible(t) : !0)) return null;
  const a = i.enabled ? i.enabled(t) : !0, s = r ?? Fo(i, t), u = l ?? Fo(i, t) + (i.shortcut ? `  (${i.shortcut})` : "");
  return /* @__PURE__ */ d.jsx(
    "button",
    {
      type: "button",
      "data-testid": `embed-action-${e}`,
      onClick: () => {
        i.run(n);
      },
      disabled: !a,
      title: u,
      style: oi(a),
      children: s
    }
  );
}
function el() {
  return /* @__PURE__ */ d.jsx("span", { style: { width: 1, height: 18, background: "#e2e4e8" } });
}
function gg({
  ctx: e,
  compact: t,
  onReload: n
}) {
  const [r, l] = k.useState(!1), i = ii["data.reload"], o = async () => {
    if (!r) {
      l(!0);
      try {
        n ? await n() : i && await i.run(e);
      } finally {
        l(!1);
      }
    }
  }, a = (i != null && i.shortcut ? `Reload data  (${i.shortcut})` : "Reload data") + (n ? " — refetch URL sources and reload linked files" : "");
  return /* @__PURE__ */ d.jsxs(
    "button",
    {
      type: "button",
      "data-testid": "embed-action-data.reload",
      onClick: () => {
        o();
      },
      disabled: r,
      title: a,
      style: oi(!r),
      children: [
        r ? "⟳" : "↻",
        t ? "" : " Reload"
      ]
    }
  );
}
function vg({
  state: e,
  ctx: t,
  compact: n
}) {
  const [r, l] = k.useState(!1), i = k.useRef(null);
  return k.useEffect(() => {
    if (!r) return;
    const o = (s) => {
      i.current && !i.current.contains(s.target) && l(!1);
    }, a = (s) => {
      s.key === "Escape" && l(!1);
    };
    return document.addEventListener("mousedown", o), document.addEventListener("keydown", a), () => {
      document.removeEventListener("mousedown", o), document.removeEventListener("keydown", a);
    };
  }, [r]), /* @__PURE__ */ d.jsxs("div", { ref: i, style: { position: "relative" }, "data-testid": "embed-insert", children: [
    /* @__PURE__ */ d.jsxs(
      "button",
      {
        type: "button",
        "data-testid": "embed-insert-btn",
        onClick: () => l((o) => !o),
        "aria-expanded": r,
        title: "Insert a new element",
        style: oi(!0),
        children: [
          "＋ ",
          n ? "" : "Insert ",
          "▾"
        ]
      }
    ),
    r && /* @__PURE__ */ d.jsx("div", { role: "menu", "data-testid": "embed-insert-menu", style: Gd, children: Xd.map((o) => /* @__PURE__ */ d.jsxs(k.Fragment, { children: [
      /* @__PURE__ */ d.jsx("div", { style: kg, children: o.group }),
      o.items.map(([a, s]) => {
        const u = `add.${a}`, f = ii[u];
        if (!f) return null;
        const p = f.enabled ? f.enabled(e) : !0;
        return /* @__PURE__ */ d.jsx(
          "button",
          {
            type: "button",
            "data-testid": `embed-insert-${a}`,
            onClick: () => {
              p && (l(!1), f.run(t));
            },
            disabled: !p,
            title: p ? s : `${s} — not allowed from the current selection`,
            style: Zd(p),
            children: s
          },
          a
        );
      })
    ] }, o.group)) })
  ] });
}
const yg = [
  "data.create",
  "data.create2d",
  "data.filter",
  "data.histogram",
  "data.edit",
  "edit.custom"
];
function wg({ state: e, ctx: t }) {
  const [n, r] = k.useState(!1), l = k.useRef(null);
  return k.useEffect(() => {
    if (!n) return;
    const i = (o) => {
      l.current && !l.current.contains(o.target) && r(!1);
    };
    return document.addEventListener("mousedown", i), () => document.removeEventListener("mousedown", i);
  }, [n]), /* @__PURE__ */ d.jsxs("div", { ref: l, style: { position: "relative" }, "data-testid": "embed-data", children: [
    /* @__PURE__ */ d.jsx(
      "button",
      {
        type: "button",
        "data-testid": "embed-data-btn",
        onClick: () => r((i) => !i),
        "aria-expanded": n,
        title: "Data operations",
        style: oi(!0),
        children: "∑ Data ▾"
      }
    ),
    n && /* @__PURE__ */ d.jsx("div", { role: "menu", "data-testid": "embed-data-menu", style: Gd, children: yg.map((i) => {
      const o = ii[i];
      if (!o) return null;
      const a = o.enabled ? o.enabled(e) : !0;
      return /* @__PURE__ */ d.jsx(
        "button",
        {
          type: "button",
          "data-testid": `embed-data-${i}`,
          onClick: () => {
            a && (r(!1), o.run(t));
          },
          disabled: !a,
          style: Zd(a),
          children: Fo(o, e)
        },
        i
      );
    }) })
  ] });
}
const xg = { display: "flex", gap: 4, alignItems: "center" }, Sg = {
  display: "flex",
  gap: 4,
  alignItems: "center",
  flexWrap: "wrap"
}, Gd = {
  position: "absolute",
  top: "100%",
  left: 0,
  marginTop: 4,
  zIndex: 50,
  background: "#fff",
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  padding: 4,
  minWidth: 200,
  maxHeight: "70vh",
  overflowY: "auto"
}, kg = {
  fontSize: 10.5,
  color: "#888",
  textTransform: "uppercase",
  padding: "6px 6px 2px",
  letterSpacing: "0.04em"
}, Zd = (e) => ({
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "4px 8px",
  background: "transparent",
  border: "none",
  cursor: e ? "pointer" : "default",
  color: e ? "#222" : "#aaa",
  font: "13px system-ui, sans-serif",
  borderRadius: 3
}), oi = (e) => ({
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 9px",
  cursor: e ? "pointer" : "default",
  fontSize: 12,
  lineHeight: 1.2,
  background: "#fff",
  color: e ? "#222" : "#aaa"
});
function Jd(e, t) {
  return {
    store: e,
    notify: t.notify,
    openDialog: (n) => {
      t.openDialog ? t.openDialog(n) : t.notify(`"${n}" dialog unavailable in this embed.`);
    },
    // No native pickers in the embed. The toolbar deliberately omits the
    // actions that need them (file.open/save/saveas, data.import), but if
    // anything else reaches here it'll fail closed rather than crash.
    pick: {},
    toggleFullScreen: t.toggleFullScreen,
    openUrl: (n) => {
      typeof window < "u" && window.open(n, "_blank", "noopener");
    },
    openPlugin: () => {
      t.notify("Plugins are not wired in the embed yet.");
    }
  };
}
function Eg({
  store: e,
  title: t,
  width: n,
  height: r,
  toolbar: l,
  onReload: i,
  onClose: o
}) {
  const a = e((j) => j.tree), s = e((j) => j.selected), u = e((j) => j.schema), f = e((j) => j.values), p = e((j) => j.datasets), c = e((j) => j.error), [v, y] = k.useState(!1), [x, N] = k.useState(!1), [m, h] = k.useState(null);
  k.useEffect(() => {
    if (typeof document > "u") return;
    const j = document.documentElement, _ = document.body, Q = j.style.overflow, Se = _.style.overflow;
    return j.style.overflow = "hidden", _.style.overflow = "hidden", () => {
      j.style.overflow = Q, _.style.overflow = Se;
    };
  }, []);
  const g = async () => {
    N(!0);
    try {
      for (let j = 0; j < 1e3 && e.getState().canUndo; j++)
        await e.getState().undo();
    } finally {
      N(!1);
    }
  }, w = /* @__PURE__ */ new Set([
    "dataCreate",
    "dataCreate2d",
    "filter",
    "histogram",
    "dataEdit",
    "custom"
  ]), C = Jd(e, {
    notify: (j) => e.setState({ error: j }),
    openDialog: (j) => {
      w.has(j) ? h(j) : e.setState({ error: `"${j}" dialog is unavailable in the embed.` });
    },
    toggleFullScreen: () => y((j) => !j)
  }), z = {
    dataCreate: "create1d",
    dataCreate2d: "create2d",
    filter: "filter",
    histogram: "histogram"
  }, T = () => h(null), R = (j) => e.setState({ error: j });
  return _d.createPortal(
    /* @__PURE__ */ d.jsx(
      "div",
      {
        "data-testid": "veusz-modal",
        style: Cg,
        onMouseDown: (j) => {
          j.target === j.currentTarget && o();
        },
        children: /* @__PURE__ */ d.jsxs("div", { style: v ? jg : qd, "data-testid": "veusz-modal-window", children: [
          /* @__PURE__ */ d.jsxs("header", { style: Pg, children: [
            /* @__PURE__ */ d.jsx("strong", { style: { fontSize: 14 }, children: t ?? "Edit figure" }),
            /* @__PURE__ */ d.jsx(Kd, { store: e, density: "full", ctx: C, onReload: i }),
            /* @__PURE__ */ d.jsx(
              "button",
              {
                type: "button",
                "data-testid": "veusz-reset",
                onClick: () => void g(),
                disabled: !e.getState().canUndo || x,
                style: tl,
                title: "Reset all edits to the original figure",
                children: "⟲ Reset"
              }
            ),
            c && /* @__PURE__ */ d.jsx("span", { "data-testid": "veusz-error", style: { color: "crimson", fontSize: 12 }, children: c }),
            /* @__PURE__ */ d.jsx("span", { style: { flex: 1 } }),
            l,
            /* @__PURE__ */ d.jsx(
              "button",
              {
                type: "button",
                "data-testid": "veusz-modal-fullscreen",
                onClick: () => y((j) => !j),
                style: tl,
                title: v ? "Exit full screen" : "Full screen",
                children: v ? "🗗" : "⛶"
              }
            ),
            /* @__PURE__ */ d.jsx(
              "button",
              {
                type: "button",
                "data-testid": "veusz-modal-close",
                onClick: o,
                style: tl,
                title: "Close (Esc)",
                children: "✕"
              }
            )
          ] }),
          /* @__PURE__ */ d.jsxs("div", { style: zg, children: [
            /* @__PURE__ */ d.jsx("div", { style: Ng, children: /* @__PURE__ */ d.jsx(Wd, { store: e, width: n, height: r }) }),
            /* @__PURE__ */ d.jsxs("aside", { style: Tg, "data-testid": "veusz-edit-panel", children: [
              a ? /* @__PURE__ */ d.jsx(
                Um,
                {
                  root: a,
                  selected: s,
                  onSelect: (j) => {
                    e.getState().select([j]);
                  }
                }
              ) : /* @__PURE__ */ d.jsx("p", { style: { color: "#888" }, children: "Loading…" }),
              /* @__PURE__ */ d.jsx("hr", { style: { border: 0, borderTop: "1px solid #eee", margin: "8px 0" } }),
              u && s.length > 0 ? /* @__PURE__ */ d.jsx(
                tg,
                {
                  schema: u,
                  widgetPaths: s,
                  values: f,
                  datasets: p.map((j) => j.name),
                  onChange: (j, _) => {
                    e.getState().setValue(j, _);
                  },
                  onChangeMany: (j) => {
                    e.getState().setValues(j);
                  }
                }
              ) : /* @__PURE__ */ d.jsx("p", { style: { color: "#888", fontSize: 13 }, children: "Select a widget to edit." })
            ] })
          ] }),
          m && /* @__PURE__ */ d.jsx(
            "div",
            {
              style: Dg,
              onMouseDown: (j) => {
                j.target === j.currentTarget && T();
              },
              children: /* @__PURE__ */ d.jsxs(
                "div",
                {
                  style: Rg,
                  "data-testid": `embed-dialog-${m}`,
                  children: [
                    /* @__PURE__ */ d.jsxs("div", { style: Mg, children: [
                      /* @__PURE__ */ d.jsx("strong", { style: { fontSize: 13 }, children: _g[m] }),
                      /* @__PURE__ */ d.jsx("span", { style: { flex: 1 } }),
                      /* @__PURE__ */ d.jsx(
                        "button",
                        {
                          type: "button",
                          "data-testid": "embed-dialog-close",
                          onClick: T,
                          style: tl,
                          children: "Close"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ d.jsxs("div", { style: { padding: 12 }, children: [
                      z[m] && /* @__PURE__ */ d.jsx(
                        ag,
                        {
                          store: e,
                          mode: z[m],
                          onClose: T,
                          notify: R
                        }
                      ),
                      m === "dataEdit" && /* @__PURE__ */ d.jsx(pg, { store: e, notify: R }),
                      m === "custom" && /* @__PURE__ */ d.jsx(hg, { store: e, notify: R })
                    ] })
                  ]
                }
              )
            }
          )
        ] })
      }
    ),
    document.body
  );
}
const _g = {
  dataCreate: "Create dataset",
  dataCreate2d: "Create 2D dataset",
  filter: "Filter data",
  histogram: "Histogram",
  dataEdit: "Data editor",
  custom: "Custom definitions"
}, Cg = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,17,21,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1e3,
  font: "14px system-ui, sans-serif"
}, qd = {
  width: "min(1100px, 92vw)",
  height: "min(760px, 88vh)",
  minWidth: 320,
  minHeight: 240,
  resize: "both",
  overflow: "hidden",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
  display: "flex",
  flexDirection: "column"
}, jg = {
  ...qd,
  width: "100vw",
  height: "100vh",
  borderRadius: 0,
  resize: "none"
}, Pg = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
  background: "#fafbfc",
  flex: "0 0 auto"
}, tl = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
  padding: "3px 9px",
  lineHeight: 1
}, zg = {
  flex: "1 1 auto",
  display: "flex",
  minHeight: 0,
  alignItems: "stretch"
}, Ng = {
  flex: "1 1 auto",
  minWidth: 0,
  minHeight: 0,
  padding: 10,
  background: "#fff"
}, Tg = {
  flex: "0 0 320px",
  width: 320,
  borderLeft: "1px solid #eee",
  padding: 10,
  overflow: "auto",
  overscrollBehavior: "contain",
  background: "#fff"
}, Dg = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.30)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10
}, Rg = {
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  minWidth: 420,
  maxWidth: "90%",
  maxHeight: "85%",
  overflow: "auto"
}, Mg = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderBottom: "1px solid #eee"
};
function su({ items: e, disabled: t, busy: n }) {
  const [r, l] = k.useState(!1), i = k.useRef(null);
  return k.useEffect(() => {
    if (!r) return;
    const o = (s) => {
      i.current && !i.current.contains(s.target) && l(!1);
    }, a = (s) => {
      s.key === "Escape" && l(!1);
    };
    return document.addEventListener("mousedown", o), document.addEventListener("keydown", a), () => {
      document.removeEventListener("mousedown", o), document.removeEventListener("keydown", a);
    };
  }, [r]), /* @__PURE__ */ d.jsxs("div", { ref: i, style: { position: "relative" }, children: [
    /* @__PURE__ */ d.jsx(
      "button",
      {
        type: "button",
        "data-testid": "veusz-download",
        disabled: t,
        "aria-haspopup": "menu",
        "aria-expanded": r,
        onClick: () => l((o) => !o),
        style: Lg,
        title: "Download this figure",
        children: n ? "…" : "⤓ Download ▾"
      }
    ),
    r && /* @__PURE__ */ d.jsx("div", { role: "menu", "data-testid": "veusz-download-menu", style: Ig, children: e.map((o) => {
      const a = /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
        o.label,
        o.hint && /* @__PURE__ */ d.jsx("span", { style: { color: "#8b94a3", marginLeft: 8, fontSize: 11 }, children: o.hint })
      ] }), s = o.label, u = `download-${o.label.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
      return o.href ? /* @__PURE__ */ d.jsx(
        "a",
        {
          role: "menuitem",
          "data-testid": u,
          href: o.href,
          download: o.download,
          onClick: () => l(!1),
          style: uu,
          children: a
        },
        s
      ) : /* @__PURE__ */ d.jsx(
        "button",
        {
          type: "button",
          role: "menuitem",
          "data-testid": u,
          onClick: () => {
            var f;
            l(!1), (f = o.onSelect) == null || f.call(o);
          },
          style: uu,
          children: a
        },
        s
      );
    }) })
  ] });
}
const Lg = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 10px",
  cursor: "pointer",
  fontSize: 12,
  background: "#fff",
  color: "#222"
}, Ig = {
  position: "absolute",
  top: "calc(100% + 4px)",
  right: 0,
  zIndex: 6,
  background: "#fff",
  border: "1px solid #e2e4e8",
  borderRadius: 8,
  boxShadow: "0 4px 16px rgba(0,0,0,0.16)",
  padding: 4,
  minWidth: 150,
  display: "flex",
  flexDirection: "column"
}, uu = {
  display: "flex",
  alignItems: "baseline",
  textAlign: "left",
  border: 0,
  background: "transparent",
  cursor: "pointer",
  font: "13px system-ui",
  color: "#222",
  padding: "6px 10px",
  borderRadius: 6,
  textDecoration: "none",
  width: "100%"
}, cu = "veusz-embed-styles", $g = `
.vz-fig { position: relative; }
.vz-fig .vz-inline { display: block; }
.vz-fig .vz-preview { display: block; width: 100%; height: auto; background: #fff; }
`;
function ef() {
  if (typeof document > "u" || document.getElementById(cu)) return;
  const e = document.createElement("style");
  e.id = cu, e.textContent = $g, document.head.appendChild(e);
}
const _n = 2;
async function Ag(e, t) {
  const { rpc: n } = e.getState(), r = await n.render.scene(t.page, t.width, t.height, t.dpi ?? 96), l = await Ld(r.scene_b64, r.width, r.height);
  Ug(l, t.filename ?? "figure.svg", "image/svg+xml");
}
async function Fg(e, t) {
  const { rpc: n } = e.getState(), r = t.width * _n, l = t.height * _n, i = await n.render.scene(t.page, r, l, (t.dpi ?? 96) * _n), o = await ni(i.scene_b64, i.width, i.height, "image/png");
  $a(o, t.filename ?? "figure.png");
}
async function Og(e, t) {
  const { rpc: n } = e.getState(), r = t.width * _n, l = t.height * _n, i = await n.render.scene(t.page, r, l, (t.dpi ?? 96) * _n), o = await ni(i.scene_b64, i.width, i.height, "image/jpeg"), a = new Uint8Array(await o.arrayBuffer()), s = Bg(a, i.width, i.height, t.width, t.height);
  $a(new Blob([s], { type: "application/pdf" }), t.filename ?? "figure.pdf");
}
function Ug(e, t, n) {
  $a(new Blob([e], { type: n }), t);
}
function $a(e, t) {
  const n = URL.createObjectURL(e), r = document.createElement("a");
  r.href = n, r.download = t, document.body.appendChild(r), r.click(), r.remove(), setTimeout(() => URL.revokeObjectURL(n), 1e3);
}
function Bg(e, t, n, r, l) {
  const i = new TextEncoder(), o = [], a = [];
  let s = 0;
  const u = (N) => {
    const m = typeof N == "string" ? i.encode(N) : N;
    o.push(m), s += m.length;
  }, f = (N, m) => {
    a[N] = s, u(`${N} 0 obj
${m}
endobj
`);
  };
  u(`%PDF-1.4
`), f(1, "<< /Type /Catalog /Pages 2 0 R >>"), f(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>"), f(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${r} ${l}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`), a[4] = s, u(`4 0 obj
<< /Type /XObject /Subtype /Image /Width ${t} /Height ${n} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${e.length} >>
stream
`), u(e), u(`
endstream
endobj
`);
  const p = `q
${r} 0 0 ${l} 0 0 cm
/Im0 Do
Q
`;
  f(5, `<< /Length ${p.length} >>
stream
${p}endstream`);
  const c = s;
  let v = `xref
0 6
0000000000 65535 f 
`;
  for (let N = 1; N <= 5; N++) v += `${String(a[N]).padStart(10, "0")} 00000 n 
`;
  u(v), u(`trailer
<< /Size 6 /Root 1 0 R >>
startxref
${c}
%%EOF
`);
  const y = new Uint8Array(s);
  let x = 0;
  for (const N of o)
    y.set(N, x), x += N.length;
  return y;
}
ef();
function Wg({
  store: e,
  width: t = 700,
  height: n = 500,
  editable: r = !0,
  title: l,
  poster: i,
  vszUrl: o,
  initialEditing: a,
  onReload: s
}) {
  const u = e((_) => _.error), f = e((_) => _.webgpuAvailable), p = e((_) => _.currentPage), [c, v] = k.useState(!!a), [y, x] = k.useState(!1), [N, m] = k.useState(!1), [h, g] = k.useState(i), w = k.useRef(null);
  k.useEffect(() => {
    ef();
    const _ = e.getState();
    return _.setBackend("vello-wasm"), _.probeWebgpu(), _.loadPlotPrefs(), _.refreshAll(), _.subscribeToDaemon();
  }, [e]), k.useEffect(() => {
    let _ = !0;
    return Md().then((Q) => {
      _ && x(Q);
    }), () => {
      _ = !1;
    };
  }, []), k.useEffect(() => () => {
    w.current && URL.revokeObjectURL(w.current);
  }, []);
  const C = (_) => `${(l ?? "figure").replace(/\s+/g, "_")}.${_}`, z = async (_, Q) => {
    m(!0);
    try {
      await _();
    } catch (Se) {
      e.setState({ error: `${Q} failed: ${Se.message}` });
    } finally {
      m(!1);
    }
  }, T = async () => {
    try {
      const _ = Bd(), Q = Math.round(t * _), Se = Math.round(n * _), je = await e.getState().rpc.render.scene(p, Q, Se, Math.round(Ud * _)), de = await ni(je.scene_b64, je.width, je.height, "image/png"), re = URL.createObjectURL(de);
      w.current && URL.revokeObjectURL(w.current), w.current = re, g(re);
    } catch {
    }
  }, R = () => {
    v(!1), h !== void 0 && T();
  }, j = () => {
    const _ = [];
    return o && _.push({ label: "Veusz", href: o, download: C("vsz"), hint: ".vsz" }), y && _.push({ label: "SVG", hint: "vector", onSelect: () => void z(() => Ag(e, { page: p, width: t, height: n, filename: C("svg") }), "SVG export") }), _.push({ label: "PNG", hint: "image", onSelect: () => void z(() => Fg(e, { page: p, width: t, height: n, filename: C("png") }), "PNG export") }), _.push({ label: "PDF", hint: "page", onSelect: () => void z(() => Og(e, { page: p, width: t, height: n, filename: C("pdf") }), "PDF export") }), _;
  };
  return f === !1 ? /* @__PURE__ */ d.jsx("div", { "data-testid": "veusz-figure", className: "vz-fig", style: du, children: /* @__PURE__ */ d.jsx("div", { "data-testid": "veusz-needs-webgpu", style: { padding: 16, color: "#b06000" }, children: "This interactive figure needs WebGPU. Open in Chrome or Safari 26+." }) }) : /* @__PURE__ */ d.jsxs("div", { "data-testid": "veusz-figure", className: "vz-fig", style: du, children: [
    /* @__PURE__ */ d.jsxs("div", { className: "vz-toolbar", style: bg, children: [
      r && /* @__PURE__ */ d.jsx(
        Kd,
        {
          store: e,
          density: "inline",
          ctx: Jd(e, {
            notify: (_) => e.setState({ error: _ })
          }),
          onReload: s
        }
      ),
      /* @__PURE__ */ d.jsx(su, { items: j(), busy: N }),
      r && /* @__PURE__ */ d.jsx(
        "button",
        {
          type: "button",
          "data-testid": "veusz-edit-toggle",
          onClick: () => v(!0),
          style: Vg,
          title: "Edit this figure",
          children: "✎ Edit"
        }
      )
    ] }),
    /* @__PURE__ */ d.jsxs("div", { className: "vz-inline", children: [
      h !== void 0 ? /* @__PURE__ */ d.jsx(
        "img",
        {
          src: h,
          alt: l ?? "Veusz figure",
          className: "vz-preview",
          "data-testid": "veusz-inline-poster"
        }
      ) : /* @__PURE__ */ d.jsx("div", { style: { height: Math.round(n / t * 100) + "%", minHeight: 200 }, children: /* @__PURE__ */ d.jsx(Wd, { store: e, width: t, height: n }) }),
      u && !c && /* @__PURE__ */ d.jsx("div", { "data-testid": "veusz-error", style: Hg, children: u })
    ] }),
    c && /* @__PURE__ */ d.jsx(
      Eg,
      {
        store: e,
        title: l,
        width: t,
        height: n,
        toolbar: /* @__PURE__ */ d.jsx(su, { items: j(), busy: N }),
        onReload: s,
        onClose: R
      }
    )
  ] });
}
const du = {
  position: "relative",
  border: "1px solid #e2e4e8",
  borderRadius: 10,
  overflow: "hidden",
  background: "#fff",
  font: "14px system-ui, sans-serif"
}, bg = {
  position: "absolute",
  top: 8,
  right: 8,
  zIndex: 3,
  display: "flex",
  gap: 6,
  alignItems: "flex-start"
}, Vg = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 10px",
  cursor: "pointer",
  fontSize: 12,
  background: "#fff",
  color: "#222"
}, Hg = {
  position: "absolute",
  left: 8,
  bottom: 8,
  color: "crimson",
  fontSize: 12,
  background: "rgba(255,255,255,0.9)",
  padding: "2px 6px",
  borderRadius: 4
}, fu = "This interactive figure needs WebGPU. Open in Chrome or Safari 26+.";
class Qg extends HTMLElement {
  constructor() {
    super(...arguments);
    On(this, "root", null);
    On(this, "mounted", !1);
    On(this, "noteEl", null);
    On(this, "urlLinks", null);
  }
  connectedCallback() {
    this.mounted || (this.mounted = !0, this.boot());
  }
  disconnectedCallback() {
    var n, r;
    (n = this.urlLinks) == null || n.stop(), this.urlLinks = null, (r = this.root) == null || r.unmount(), this.root = null;
  }
  status(n) {
    this.replaceChildren();
    const r = document.createElement("div");
    r.setAttribute("data-testid", "veusz-figure-status"), r.style.cssText = "font:14px system-ui;color:#555;padding:16px;border:1px solid #e2e4e8;border-radius:10px;", r.textContent = n, this.appendChild(r);
  }
  /** Show the static poster image. `note` adds a caption (updatable in place
   *  via {@link setNote}); `onActivate` overlays a click-to-load control. Falls
   *  back to a text status if the image fails to load (e.g. a stale URL). */
  showPoster(n, r = {}) {
    this.replaceChildren(), this.noteEl = null;
    const l = document.createElement("div");
    l.setAttribute("data-testid", "veusz-figure-poster"), l.style.cssText = "position:relative;border:1px solid #e2e4e8;border-radius:10px;overflow:hidden;background:#fff;font:12px system-ui;";
    const i = document.createElement("img");
    if (i.src = n, i.alt = this.getAttribute("title") ?? "Veusz figure", i.style.cssText = "display:block;width:100%;height:auto;", i.addEventListener("error", () => this.status(r.note ?? fu)), l.appendChild(i), r.onActivate) {
      const o = document.createElement("button");
      o.type = "button", o.setAttribute("data-testid", "veusz-figure-activate"), o.setAttribute("aria-label", "Edit the interactive figure"), o.textContent = "✎ Edit", o.style.cssText = "position:absolute;right:8px;top:8px;border:1px solid rgba(0,0,0,0.12);border-radius:6px;padding:4px 10px;cursor:pointer;font:600 12px system-ui;color:#1a1d21;background:rgba(255,255,255,0.92);box-shadow:0 1px 4px rgba(0,0,0,0.18);", o.addEventListener("click", () => r.onActivate()), l.appendChild(o);
    }
    if (r.note) {
      const o = document.createElement("div");
      o.setAttribute("data-testid", "veusz-figure-poster-note"), o.style.cssText = "color:#8a6d00;background:#fef7e0;padding:4px 8px;", o.textContent = r.note, l.appendChild(o), this.noteEl = o;
    }
    this.appendChild(l);
  }
  /** Update the poster caption in place (no image reload), for boot progress. */
  setNote(n) {
    this.noteEl && (this.noteEl.textContent = n);
  }
  async boot() {
    const n = this.getAttribute("src");
    if (!n) {
      this.status('veusz-figure: missing "src"');
      return;
    }
    const r = this.getAttribute("poster") || void 0;
    if (!await Rd()) {
      r ? this.showPoster(r, {
        note: "Static image — the interactive view needs WebGPU (Chrome or Safari 26+)."
      }) : this.status(fu);
      return;
    }
    this.getAttribute("eager") === "true" || !r ? await this.bootInteractive(n, r, !1) : this.showPoster(r, {
      // Clicking the discrete Edit affordance boots and opens the editor.
      onActivate: () => {
        this.bootInteractive(n, r, !0);
      }
    });
  }
  /** Load the Pyodide runtime + document and mount the live figure. Keeps the
   *  poster (with progress in its caption) until the figure is ready. */
  async bootInteractive(n, r, l = !1) {
    r ? this.showPoster(r, { note: "Loading interactive figure…" }) : this.status("Loading…");
    try {
      const i = await hm({
        wasmBase: this.getAttribute("wasm-base") ?? void 0,
        pyodideIndexUrl: this.getAttribute("pyodide-index") ?? void 0,
        veuszWheelUrl: this.getAttribute("veusz-wheel") ?? void 0,
        onProgress: (v) => {
          r ? this.setNote(v) : this.status(v);
        }
      }), o = await fetch(n);
      if (!o.ok) throw new Error(`fetch ${n}: ${o.status}`);
      const a = await o.text(), s = {
        urlBase: this.getAttribute("data-url-base") ?? new URL(".", new URL(n, location.href)).toString(),
        urlMap: Yg(this.getAttribute("data-url-map"))
      };
      await gm(a, i.transport, s);
      const u = await xm(a, n, s);
      await i.loadVsz(a, u), this.urlLinks = await mm(i.transport, s);
      const f = om(Ph(i.transport));
      this.replaceChildren(), this.noteEl = null;
      const p = document.createElement("div");
      this.appendChild(p), this.root = Cd(p);
      const c = async () => {
        var v;
        await ((v = this.urlLinks) == null ? void 0 : v.refresh()), await f.getState().reloadFile();
      };
      this.root.render(k.createElement(Wg, {
        store: f,
        width: Number(this.getAttribute("width") ?? 600),
        height: Number(this.getAttribute("height") ?? 400),
        editable: this.getAttribute("editable") !== "false",
        title: this.getAttribute("title") ?? void 0,
        poster: r,
        vszUrl: n,
        initialEditing: l,
        onReload: c
      }));
    } catch (i) {
      const o = i.message;
      r ? this.showPoster(r, {
        note: `Couldn’t load the interactive view: ${o}. Click to retry.`,
        onActivate: () => {
          this.bootInteractive(n, r);
        }
      }) : this.status(`Failed to load figure: ${o}`);
    }
  }
}
function Yg(e) {
  if (e)
    try {
      const t = JSON.parse(e);
      if (t && typeof t == "object" && !Array.isArray(t))
        return t;
      console.warn("[veusz-figure] data-url-map must be a JSON object");
      return;
    } catch (t) {
      console.warn("[veusz-figure] invalid data-url-map JSON:", t);
      return;
    }
}
typeof customElements < "u" && !customElements.get("veusz-figure") && customElements.define("veusz-figure", Qg);
export {
  Qg as VeuszFigureElement
};
//# sourceMappingURL=veusz-embed.js.map
