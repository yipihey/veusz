var kf = Object.defineProperty;
var Ef = (e, t, n) => t in e ? kf(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var _n = (e, t, n) => Ef(e, typeof t != "symbol" ? t + "" : t, n);
function Va(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Wa = { exports: {} }, Te = {}, Ha = { exports: {} }, F = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var fr = Symbol.for("react.element"), _f = Symbol.for("react.portal"), Cf = Symbol.for("react.fragment"), Pf = Symbol.for("react.strict_mode"), zf = Symbol.for("react.profiler"), Tf = Symbol.for("react.provider"), Nf = Symbol.for("react.context"), jf = Symbol.for("react.forward_ref"), Rf = Symbol.for("react.suspense"), Lf = Symbol.for("react.memo"), Df = Symbol.for("react.lazy"), vu = Symbol.iterator;
function Mf(e) {
  return e === null || typeof e != "object" ? null : (e = vu && e[vu] || e["@@iterator"], typeof e == "function" ? e : null);
}
var Qa = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, Ya = Object.assign, Xa = {};
function yn(e, t, n) {
  this.props = e, this.context = t, this.refs = Xa, this.updater = n || Qa;
}
yn.prototype.isReactComponent = {};
yn.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
yn.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function Ka() {
}
Ka.prototype = yn.prototype;
function mo(e, t, n) {
  this.props = e, this.context = t, this.refs = Xa, this.updater = n || Qa;
}
var vo = mo.prototype = new Ka();
vo.constructor = mo;
Ya(vo, yn.prototype);
vo.isPureReactComponent = !0;
var yu = Array.isArray, Ga = Object.prototype.hasOwnProperty, yo = { current: null }, Za = { key: !0, ref: !0, __self: !0, __source: !0 };
function Ja(e, t, n) {
  var r, l = {}, i = null, o = null;
  if (t != null) for (r in t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (i = "" + t.key), t) Ga.call(t, r) && !Za.hasOwnProperty(r) && (l[r] = t[r]);
  var u = arguments.length - 2;
  if (u === 1) l.children = n;
  else if (1 < u) {
    for (var a = Array(u), s = 0; s < u; s++) a[s] = arguments[s + 2];
    l.children = a;
  }
  if (e && e.defaultProps) for (r in u = e.defaultProps, u) l[r] === void 0 && (l[r] = u[r]);
  return { $$typeof: fr, type: e, key: i, ref: o, props: l, _owner: yo.current };
}
function If(e, t) {
  return { $$typeof: fr, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function go(e) {
  return typeof e == "object" && e !== null && e.$$typeof === fr;
}
function $f(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var gu = /\/+/g;
function Bl(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? $f("" + e.key) : t.toString(36);
}
function Ur(e, t, n, r, l) {
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
        case fr:
        case _f:
          o = !0;
      }
  }
  if (o) return o = e, l = l(o), e = r === "" ? "." + Bl(o, 0) : r, yu(l) ? (n = "", e != null && (n = e.replace(gu, "$&/") + "/"), Ur(l, t, n, "", function(s) {
    return s;
  })) : l != null && (go(l) && (l = If(l, n + (!l.key || o && o.key === l.key ? "" : ("" + l.key).replace(gu, "$&/") + "/") + e)), t.push(l)), 1;
  if (o = 0, r = r === "" ? "." : r + ":", yu(e)) for (var u = 0; u < e.length; u++) {
    i = e[u];
    var a = r + Bl(i, u);
    o += Ur(i, t, n, a, l);
  }
  else if (a = Mf(e), typeof a == "function") for (e = a.call(e), u = 0; !(i = e.next()).done; ) i = i.value, a = r + Bl(i, u++), o += Ur(i, t, n, a, l);
  else if (i === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return o;
}
function wr(e, t, n) {
  if (e == null) return e;
  var r = [], l = 0;
  return Ur(e, r, "", "", function(i) {
    return t.call(n, i, l++);
  }), r;
}
function Ff(e) {
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
var ve = { current: null }, Ar = { transition: null }, Of = { ReactCurrentDispatcher: ve, ReactCurrentBatchConfig: Ar, ReactCurrentOwner: yo };
function qa() {
  throw Error("act(...) is not supported in production builds of React.");
}
F.Children = { map: wr, forEach: function(e, t, n) {
  wr(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return wr(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return wr(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!go(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
F.Component = yn;
F.Fragment = Cf;
F.Profiler = zf;
F.PureComponent = mo;
F.StrictMode = Pf;
F.Suspense = Rf;
F.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Of;
F.act = qa;
F.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = Ya({}, e.props), l = e.key, i = e.ref, o = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (i = t.ref, o = yo.current), t.key !== void 0 && (l = "" + t.key), e.type && e.type.defaultProps) var u = e.type.defaultProps;
    for (a in t) Ga.call(t, a) && !Za.hasOwnProperty(a) && (r[a] = t[a] === void 0 && u !== void 0 ? u[a] : t[a]);
  }
  var a = arguments.length - 2;
  if (a === 1) r.children = n;
  else if (1 < a) {
    u = Array(a);
    for (var s = 0; s < a; s++) u[s] = arguments[s + 2];
    r.children = u;
  }
  return { $$typeof: fr, type: e.type, key: l, ref: i, props: r, _owner: o };
};
F.createContext = function(e) {
  return e = { $$typeof: Nf, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: Tf, _context: e }, e.Consumer = e;
};
F.createElement = Ja;
F.createFactory = function(e) {
  var t = Ja.bind(null, e);
  return t.type = e, t;
};
F.createRef = function() {
  return { current: null };
};
F.forwardRef = function(e) {
  return { $$typeof: jf, render: e };
};
F.isValidElement = go;
F.lazy = function(e) {
  return { $$typeof: Df, _payload: { _status: -1, _result: e }, _init: Ff };
};
F.memo = function(e, t) {
  return { $$typeof: Lf, type: e, compare: t === void 0 ? null : t };
};
F.startTransition = function(e) {
  var t = Ar.transition;
  Ar.transition = {};
  try {
    e();
  } finally {
    Ar.transition = t;
  }
};
F.unstable_act = qa;
F.useCallback = function(e, t) {
  return ve.current.useCallback(e, t);
};
F.useContext = function(e) {
  return ve.current.useContext(e);
};
F.useDebugValue = function() {
};
F.useDeferredValue = function(e) {
  return ve.current.useDeferredValue(e);
};
F.useEffect = function(e, t) {
  return ve.current.useEffect(e, t);
};
F.useId = function() {
  return ve.current.useId();
};
F.useImperativeHandle = function(e, t, n) {
  return ve.current.useImperativeHandle(e, t, n);
};
F.useInsertionEffect = function(e, t) {
  return ve.current.useInsertionEffect(e, t);
};
F.useLayoutEffect = function(e, t) {
  return ve.current.useLayoutEffect(e, t);
};
F.useMemo = function(e, t) {
  return ve.current.useMemo(e, t);
};
F.useReducer = function(e, t, n) {
  return ve.current.useReducer(e, t, n);
};
F.useRef = function(e) {
  return ve.current.useRef(e);
};
F.useState = function(e) {
  return ve.current.useState(e);
};
F.useSyncExternalStore = function(e, t, n) {
  return ve.current.useSyncExternalStore(e, t, n);
};
F.useTransition = function() {
  return ve.current.useTransition();
};
F.version = "18.3.1";
Ha.exports = F;
var M = Ha.exports;
const Uf = /* @__PURE__ */ Va(M);
var ba = { exports: {} }, es = {};
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
  function t(P, I) {
    var w = P.length;
    P.push(I);
    e: for (; 0 < w; ) {
      var L = w - 1 >>> 1, z = P[L];
      if (0 < l(z, I)) P[L] = I, P[w] = z, w = L;
      else break e;
    }
  }
  function n(P) {
    return P.length === 0 ? null : P[0];
  }
  function r(P) {
    if (P.length === 0) return null;
    var I = P[0], w = P.pop();
    if (w !== I) {
      P[0] = w;
      e: for (var L = 0, z = P.length, $ = z >>> 1; L < $; ) {
        var U = 2 * (L + 1) - 1, V = P[U], O = U + 1, A = P[O];
        if (0 > l(V, w)) O < z && 0 > l(A, V) ? (P[L] = A, P[O] = w, L = O) : (P[L] = V, P[U] = w, L = U);
        else if (O < z && 0 > l(A, w)) P[L] = A, P[O] = w, L = O;
        else break e;
      }
    }
    return I;
  }
  function l(P, I) {
    var w = P.sortIndex - I.sortIndex;
    return w !== 0 ? w : P.id - I.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var i = performance;
    e.unstable_now = function() {
      return i.now();
    };
  } else {
    var o = Date, u = o.now();
    e.unstable_now = function() {
      return o.now() - u;
    };
  }
  var a = [], s = [], c = 1, d = null, p = 3, y = !1, v = !1, k = !1, N = typeof setTimeout == "function" ? setTimeout : null, h = typeof clearTimeout == "function" ? clearTimeout : null, f = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function m(P) {
    for (var I = n(s); I !== null; ) {
      if (I.callback === null) r(s);
      else if (I.startTime <= P) r(s), I.sortIndex = I.expirationTime, t(a, I);
      else break;
      I = n(s);
    }
  }
  function x(P) {
    if (k = !1, m(P), !v) if (n(a) !== null) v = !0, Sn(S);
    else {
      var I = n(s);
      I !== null && xn(x, I.startTime - P);
    }
  }
  function S(P, I) {
    v = !1, k && (k = !1, h(R), R = -1), y = !0;
    var w = p;
    try {
      for (m(I), d = n(a); d !== null && (!(d.expirationTime > I) || P && !b()); ) {
        var L = d.callback;
        if (typeof L == "function") {
          d.callback = null, p = d.priorityLevel;
          var z = L(d.expirationTime <= I);
          I = e.unstable_now(), typeof z == "function" ? d.callback = z : d === n(a) && r(a), m(I);
        } else r(a);
        d = n(a);
      }
      if (d !== null) var $ = !0;
      else {
        var U = n(s);
        U !== null && xn(x, U.startTime - I), $ = !1;
      }
      return $;
    } finally {
      d = null, p = w, y = !1;
    }
  }
  var _ = !1, C = null, R = -1, j = 5, D = -1;
  function b() {
    return !(e.unstable_now() - D < j);
  }
  function _t() {
    if (C !== null) {
      var P = e.unstable_now();
      D = P;
      var I = !0;
      try {
        I = C(!0, P);
      } finally {
        I ? Ct() : (_ = !1, C = null);
      }
    } else _ = !1;
  }
  var Ct;
  if (typeof f == "function") Ct = function() {
    f(_t);
  };
  else if (typeof MessageChannel < "u") {
    var vr = new MessageChannel(), Al = vr.port2;
    vr.port1.onmessage = _t, Ct = function() {
      Al.postMessage(null);
    };
  } else Ct = function() {
    N(_t, 0);
  };
  function Sn(P) {
    C = P, _ || (_ = !0, Ct());
  }
  function xn(P, I) {
    R = N(function() {
      P(e.unstable_now());
    }, I);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(P) {
    P.callback = null;
  }, e.unstable_continueExecution = function() {
    v || y || (v = !0, Sn(S));
  }, e.unstable_forceFrameRate = function(P) {
    0 > P || 125 < P ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : j = 0 < P ? Math.floor(1e3 / P) : 5;
  }, e.unstable_getCurrentPriorityLevel = function() {
    return p;
  }, e.unstable_getFirstCallbackNode = function() {
    return n(a);
  }, e.unstable_next = function(P) {
    switch (p) {
      case 1:
      case 2:
      case 3:
        var I = 3;
        break;
      default:
        I = p;
    }
    var w = p;
    p = I;
    try {
      return P();
    } finally {
      p = w;
    }
  }, e.unstable_pauseExecution = function() {
  }, e.unstable_requestPaint = function() {
  }, e.unstable_runWithPriority = function(P, I) {
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
    var w = p;
    p = P;
    try {
      return I();
    } finally {
      p = w;
    }
  }, e.unstable_scheduleCallback = function(P, I, w) {
    var L = e.unstable_now();
    switch (typeof w == "object" && w !== null ? (w = w.delay, w = typeof w == "number" && 0 < w ? L + w : L) : w = L, P) {
      case 1:
        var z = -1;
        break;
      case 2:
        z = 250;
        break;
      case 5:
        z = 1073741823;
        break;
      case 4:
        z = 1e4;
        break;
      default:
        z = 5e3;
    }
    return z = w + z, P = { id: c++, callback: I, priorityLevel: P, startTime: w, expirationTime: z, sortIndex: -1 }, w > L ? (P.sortIndex = w, t(s, P), n(a) === null && P === n(s) && (k ? (h(R), R = -1) : k = !0, xn(x, w - L))) : (P.sortIndex = z, t(a, P), v || y || (v = !0, Sn(S))), P;
  }, e.unstable_shouldYield = b, e.unstable_wrapCallback = function(P) {
    var I = p;
    return function() {
      var w = p;
      p = I;
      try {
        return P.apply(this, arguments);
      } finally {
        p = w;
      }
    };
  };
})(es);
ba.exports = es;
var Af = ba.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Bf = M, ze = Af;
function E(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var ts = /* @__PURE__ */ new Set(), Kn = {};
function At(e, t) {
  sn(e, t), sn(e + "Capture", t);
}
function sn(e, t) {
  for (Kn[e] = t, e = 0; e < t.length; e++) ts.add(t[e]);
}
var be = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), gi = Object.prototype.hasOwnProperty, Vf = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, wu = {}, Su = {};
function Wf(e) {
  return gi.call(Su, e) ? !0 : gi.call(wu, e) ? !1 : Vf.test(e) ? Su[e] = !0 : (wu[e] = !0, !1);
}
function Hf(e, t, n, r) {
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
function Qf(e, t, n, r) {
  if (t === null || typeof t > "u" || Hf(e, t, n, r)) return !0;
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
function ye(e, t, n, r, l, i, o) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = l, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = i, this.removeEmptyString = o;
}
var se = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
  se[e] = new ye(e, 0, !1, e, null, !1, !1);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
  var t = e[0];
  se[t] = new ye(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
  se[e] = new ye(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
  se[e] = new ye(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
  se[e] = new ye(e, 3, !1, e.toLowerCase(), null, !1, !1);
});
["checked", "multiple", "muted", "selected"].forEach(function(e) {
  se[e] = new ye(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function(e) {
  se[e] = new ye(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function(e) {
  se[e] = new ye(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function(e) {
  se[e] = new ye(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var wo = /[\-:]([a-z])/g;
function So(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
  var t = e.replace(
    wo,
    So
  );
  se[t] = new ye(t, 1, !1, e, null, !1, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(wo, So);
  se[t] = new ye(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(wo, So);
  se[t] = new ye(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  se[e] = new ye(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
se.xlinkHref = new ye("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function(e) {
  se[e] = new ye(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function xo(e, t, n, r) {
  var l = se.hasOwnProperty(t) ? se[t] : null;
  (l !== null ? l.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (Qf(t, n, l, r) && (n = null), r || l === null ? Wf(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : l.mustUseProperty ? e[l.propertyName] = n === null ? l.type === 3 ? !1 : "" : n : (t = l.attributeName, r = l.attributeNamespace, n === null ? e.removeAttribute(t) : (l = l.type, n = l === 3 || l === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var rt = Bf.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, Sr = Symbol.for("react.element"), Wt = Symbol.for("react.portal"), Ht = Symbol.for("react.fragment"), ko = Symbol.for("react.strict_mode"), wi = Symbol.for("react.profiler"), ns = Symbol.for("react.provider"), rs = Symbol.for("react.context"), Eo = Symbol.for("react.forward_ref"), Si = Symbol.for("react.suspense"), xi = Symbol.for("react.suspense_list"), _o = Symbol.for("react.memo"), it = Symbol.for("react.lazy"), ls = Symbol.for("react.offscreen"), xu = Symbol.iterator;
function Cn(e) {
  return e === null || typeof e != "object" ? null : (e = xu && e[xu] || e["@@iterator"], typeof e == "function" ? e : null);
}
var J = Object.assign, Vl;
function In(e) {
  if (Vl === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    Vl = t && t[1] || "";
  }
  return `
` + Vl + e;
}
var Wl = !1;
function Hl(e, t) {
  if (!e || Wl) return "";
  Wl = !0;
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
      } catch (s) {
        var r = s;
      }
      Reflect.construct(e, [], t);
    } else {
      try {
        t.call();
      } catch (s) {
        r = s;
      }
      e.call(t.prototype);
    }
    else {
      try {
        throw Error();
      } catch (s) {
        r = s;
      }
      e();
    }
  } catch (s) {
    if (s && r && typeof s.stack == "string") {
      for (var l = s.stack.split(`
`), i = r.stack.split(`
`), o = l.length - 1, u = i.length - 1; 1 <= o && 0 <= u && l[o] !== i[u]; ) u--;
      for (; 1 <= o && 0 <= u; o--, u--) if (l[o] !== i[u]) {
        if (o !== 1 || u !== 1)
          do
            if (o--, u--, 0 > u || l[o] !== i[u]) {
              var a = `
` + l[o].replace(" at new ", " at ");
              return e.displayName && a.includes("<anonymous>") && (a = a.replace("<anonymous>", e.displayName)), a;
            }
          while (1 <= o && 0 <= u);
        break;
      }
    }
  } finally {
    Wl = !1, Error.prepareStackTrace = n;
  }
  return (e = e ? e.displayName || e.name : "") ? In(e) : "";
}
function Yf(e) {
  switch (e.tag) {
    case 5:
      return In(e.type);
    case 16:
      return In("Lazy");
    case 13:
      return In("Suspense");
    case 19:
      return In("SuspenseList");
    case 0:
    case 2:
    case 15:
      return e = Hl(e.type, !1), e;
    case 11:
      return e = Hl(e.type.render, !1), e;
    case 1:
      return e = Hl(e.type, !0), e;
    default:
      return "";
  }
}
function ki(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Ht:
      return "Fragment";
    case Wt:
      return "Portal";
    case wi:
      return "Profiler";
    case ko:
      return "StrictMode";
    case Si:
      return "Suspense";
    case xi:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case rs:
      return (e.displayName || "Context") + ".Consumer";
    case ns:
      return (e._context.displayName || "Context") + ".Provider";
    case Eo:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case _o:
      return t = e.displayName || null, t !== null ? t : ki(e.type) || "Memo";
    case it:
      t = e._payload, e = e._init;
      try {
        return ki(e(t));
      } catch {
      }
  }
  return null;
}
function Xf(e) {
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
      return ki(t);
    case 8:
      return t === ko ? "StrictMode" : "Mode";
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
function wt(e) {
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
function is(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function Kf(e) {
  var t = is(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
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
function xr(e) {
  e._valueTracker || (e._valueTracker = Kf(e));
}
function os(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(), r = "";
  return e && (r = is(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
}
function Jr(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function Ei(e, t) {
  var n = t.checked;
  return J({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function ku(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = wt(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function us(e, t) {
  t = t.checked, t != null && xo(e, "checked", t, !1);
}
function _i(e, t) {
  us(e, t);
  var n = wt(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? Ci(e, t.type, n) : t.hasOwnProperty("defaultValue") && Ci(e, t.type, wt(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function Eu(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function Ci(e, t, n) {
  (t !== "number" || Jr(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var $n = Array.isArray;
function tn(e, t, n, r) {
  if (e = e.options, t) {
    t = {};
    for (var l = 0; l < n.length; l++) t["$" + n[l]] = !0;
    for (n = 0; n < e.length; n++) l = t.hasOwnProperty("$" + e[n].value), e[n].selected !== l && (e[n].selected = l), l && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + wt(n), t = null, l = 0; l < e.length; l++) {
      if (e[l].value === n) {
        e[l].selected = !0, r && (e[l].defaultSelected = !0);
        return;
      }
      t !== null || e[l].disabled || (t = e[l]);
    }
    t !== null && (t.selected = !0);
  }
}
function Pi(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(E(91));
  return J({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function _u(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(E(92));
      if ($n(n)) {
        if (1 < n.length) throw Error(E(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = { initialValue: wt(n) };
}
function as(e, t) {
  var n = wt(t.value), r = wt(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function Cu(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function ss(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function zi(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? ss(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var kr, cs = function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, l) {
    MSApp.execUnsafeLocalFunction(function() {
      return e(t, n, r, l);
    });
  } : e;
}(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
  else {
    for (kr = kr || document.createElement("div"), kr.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = kr.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
    for (; t.firstChild; ) e.appendChild(t.firstChild);
  }
});
function Gn(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var Un = {
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
}, Gf = ["Webkit", "ms", "Moz", "O"];
Object.keys(Un).forEach(function(e) {
  Gf.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), Un[t] = Un[e];
  });
});
function fs(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || Un.hasOwnProperty(e) && Un[e] ? ("" + t).trim() : t + "px";
}
function ds(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, l = fs(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, l) : e[n] = l;
  }
}
var Zf = J({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
function Ti(e, t) {
  if (t) {
    if (Zf[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(E(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(E(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(E(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(E(62));
  }
}
function Ni(e, t) {
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
var ji = null;
function Co(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var Ri = null, nn = null, rn = null;
function Pu(e) {
  if (e = hr(e)) {
    if (typeof Ri != "function") throw Error(E(280));
    var t = e.stateNode;
    t && (t = Cl(t), Ri(e.stateNode, e.type, t));
  }
}
function ps(e) {
  nn ? rn ? rn.push(e) : rn = [e] : nn = e;
}
function hs() {
  if (nn) {
    var e = nn, t = rn;
    if (rn = nn = null, Pu(e), t) for (e = 0; e < t.length; e++) Pu(t[e]);
  }
}
function ms(e, t) {
  return e(t);
}
function vs() {
}
var Ql = !1;
function ys(e, t, n) {
  if (Ql) return e(t, n);
  Ql = !0;
  try {
    return ms(e, t, n);
  } finally {
    Ql = !1, (nn !== null || rn !== null) && (vs(), hs());
  }
}
function Zn(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = Cl(n);
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
var Li = !1;
if (be) try {
  var Pn = {};
  Object.defineProperty(Pn, "passive", { get: function() {
    Li = !0;
  } }), window.addEventListener("test", Pn, Pn), window.removeEventListener("test", Pn, Pn);
} catch {
  Li = !1;
}
function Jf(e, t, n, r, l, i, o, u, a) {
  var s = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, s);
  } catch (c) {
    this.onError(c);
  }
}
var An = !1, qr = null, br = !1, Di = null, qf = { onError: function(e) {
  An = !0, qr = e;
} };
function bf(e, t, n, r, l, i, o, u, a) {
  An = !1, qr = null, Jf.apply(qf, arguments);
}
function ed(e, t, n, r, l, i, o, u, a) {
  if (bf.apply(this, arguments), An) {
    if (An) {
      var s = qr;
      An = !1, qr = null;
    } else throw Error(E(198));
    br || (br = !0, Di = s);
  }
}
function Bt(e) {
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
function gs(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function zu(e) {
  if (Bt(e) !== e) throw Error(E(188));
}
function td(e) {
  var t = e.alternate;
  if (!t) {
    if (t = Bt(e), t === null) throw Error(E(188));
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
        if (i === n) return zu(l), e;
        if (i === r) return zu(l), t;
        i = i.sibling;
      }
      throw Error(E(188));
    }
    if (n.return !== r.return) n = l, r = i;
    else {
      for (var o = !1, u = l.child; u; ) {
        if (u === n) {
          o = !0, n = l, r = i;
          break;
        }
        if (u === r) {
          o = !0, r = l, n = i;
          break;
        }
        u = u.sibling;
      }
      if (!o) {
        for (u = i.child; u; ) {
          if (u === n) {
            o = !0, n = i, r = l;
            break;
          }
          if (u === r) {
            o = !0, r = i, n = l;
            break;
          }
          u = u.sibling;
        }
        if (!o) throw Error(E(189));
      }
    }
    if (n.alternate !== r) throw Error(E(190));
  }
  if (n.tag !== 3) throw Error(E(188));
  return n.stateNode.current === n ? e : t;
}
function ws(e) {
  return e = td(e), e !== null ? Ss(e) : null;
}
function Ss(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = Ss(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var xs = ze.unstable_scheduleCallback, Tu = ze.unstable_cancelCallback, nd = ze.unstable_shouldYield, rd = ze.unstable_requestPaint, ee = ze.unstable_now, ld = ze.unstable_getCurrentPriorityLevel, Po = ze.unstable_ImmediatePriority, ks = ze.unstable_UserBlockingPriority, el = ze.unstable_NormalPriority, id = ze.unstable_LowPriority, Es = ze.unstable_IdlePriority, xl = null, Ye = null;
function od(e) {
  if (Ye && typeof Ye.onCommitFiberRoot == "function") try {
    Ye.onCommitFiberRoot(xl, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var Ae = Math.clz32 ? Math.clz32 : sd, ud = Math.log, ad = Math.LN2;
function sd(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (ud(e) / ad | 0) | 0;
}
var Er = 64, _r = 4194304;
function Fn(e) {
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
function tl(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0, l = e.suspendedLanes, i = e.pingedLanes, o = n & 268435455;
  if (o !== 0) {
    var u = o & ~l;
    u !== 0 ? r = Fn(u) : (i &= o, i !== 0 && (r = Fn(i)));
  } else o = n & ~l, o !== 0 ? r = Fn(o) : i !== 0 && (r = Fn(i));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & l) && (l = r & -r, i = t & -t, l >= i || l === 16 && (i & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - Ae(t), l = 1 << n, r |= e[n], t &= ~l;
  return r;
}
function cd(e, t) {
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
function fd(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, i = e.pendingLanes; 0 < i; ) {
    var o = 31 - Ae(i), u = 1 << o, a = l[o];
    a === -1 ? (!(u & n) || u & r) && (l[o] = cd(u, t)) : a <= t && (e.expiredLanes |= u), i &= ~u;
  }
}
function Mi(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function _s() {
  var e = Er;
  return Er <<= 1, !(Er & 4194240) && (Er = 64), e;
}
function Yl(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function dr(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - Ae(t), e[t] = n;
}
function dd(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var l = 31 - Ae(n), i = 1 << l;
    t[l] = 0, r[l] = -1, e[l] = -1, n &= ~i;
  }
}
function zo(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
    var r = 31 - Ae(n), l = 1 << r;
    l & t | e[r] & t && (e[r] |= t), n &= ~l;
  }
}
var H = 0;
function Cs(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var Ps, To, zs, Ts, Ns, Ii = !1, Cr = [], ft = null, dt = null, pt = null, Jn = /* @__PURE__ */ new Map(), qn = /* @__PURE__ */ new Map(), ut = [], pd = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function Nu(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      ft = null;
      break;
    case "dragenter":
    case "dragleave":
      dt = null;
      break;
    case "mouseover":
    case "mouseout":
      pt = null;
      break;
    case "pointerover":
    case "pointerout":
      Jn.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      qn.delete(t.pointerId);
  }
}
function zn(e, t, n, r, l, i) {
  return e === null || e.nativeEvent !== i ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: i, targetContainers: [l] }, t !== null && (t = hr(t), t !== null && To(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, l !== null && t.indexOf(l) === -1 && t.push(l), e);
}
function hd(e, t, n, r, l) {
  switch (t) {
    case "focusin":
      return ft = zn(ft, e, t, n, r, l), !0;
    case "dragenter":
      return dt = zn(dt, e, t, n, r, l), !0;
    case "mouseover":
      return pt = zn(pt, e, t, n, r, l), !0;
    case "pointerover":
      var i = l.pointerId;
      return Jn.set(i, zn(Jn.get(i) || null, e, t, n, r, l)), !0;
    case "gotpointercapture":
      return i = l.pointerId, qn.set(i, zn(qn.get(i) || null, e, t, n, r, l)), !0;
  }
  return !1;
}
function js(e) {
  var t = jt(e.target);
  if (t !== null) {
    var n = Bt(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = gs(n), t !== null) {
          e.blockedOn = t, Ns(e.priority, function() {
            zs(n);
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
function Br(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = $i(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      ji = r, n.target.dispatchEvent(r), ji = null;
    } else return t = hr(n), t !== null && To(t), e.blockedOn = n, !1;
    t.shift();
  }
  return !0;
}
function ju(e, t, n) {
  Br(e) && n.delete(t);
}
function md() {
  Ii = !1, ft !== null && Br(ft) && (ft = null), dt !== null && Br(dt) && (dt = null), pt !== null && Br(pt) && (pt = null), Jn.forEach(ju), qn.forEach(ju);
}
function Tn(e, t) {
  e.blockedOn === t && (e.blockedOn = null, Ii || (Ii = !0, ze.unstable_scheduleCallback(ze.unstable_NormalPriority, md)));
}
function bn(e) {
  function t(l) {
    return Tn(l, e);
  }
  if (0 < Cr.length) {
    Tn(Cr[0], e);
    for (var n = 1; n < Cr.length; n++) {
      var r = Cr[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (ft !== null && Tn(ft, e), dt !== null && Tn(dt, e), pt !== null && Tn(pt, e), Jn.forEach(t), qn.forEach(t), n = 0; n < ut.length; n++) r = ut[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < ut.length && (n = ut[0], n.blockedOn === null); ) js(n), n.blockedOn === null && ut.shift();
}
var ln = rt.ReactCurrentBatchConfig, nl = !0;
function vd(e, t, n, r) {
  var l = H, i = ln.transition;
  ln.transition = null;
  try {
    H = 1, No(e, t, n, r);
  } finally {
    H = l, ln.transition = i;
  }
}
function yd(e, t, n, r) {
  var l = H, i = ln.transition;
  ln.transition = null;
  try {
    H = 4, No(e, t, n, r);
  } finally {
    H = l, ln.transition = i;
  }
}
function No(e, t, n, r) {
  if (nl) {
    var l = $i(e, t, n, r);
    if (l === null) ni(e, t, r, rl, n), Nu(e, r);
    else if (hd(l, e, t, n, r)) r.stopPropagation();
    else if (Nu(e, r), t & 4 && -1 < pd.indexOf(e)) {
      for (; l !== null; ) {
        var i = hr(l);
        if (i !== null && Ps(i), i = $i(e, t, n, r), i === null && ni(e, t, r, rl, n), i === l) break;
        l = i;
      }
      l !== null && r.stopPropagation();
    } else ni(e, t, r, null, n);
  }
}
var rl = null;
function $i(e, t, n, r) {
  if (rl = null, e = Co(r), e = jt(e), e !== null) if (t = Bt(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = gs(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return rl = e, null;
}
function Rs(e) {
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
      switch (ld()) {
        case Po:
          return 1;
        case ks:
          return 4;
        case el:
        case id:
          return 16;
        case Es:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var st = null, jo = null, Vr = null;
function Ls() {
  if (Vr) return Vr;
  var e, t = jo, n = t.length, r, l = "value" in st ? st.value : st.textContent, i = l.length;
  for (e = 0; e < n && t[e] === l[e]; e++) ;
  var o = n - e;
  for (r = 1; r <= o && t[n - r] === l[i - r]; r++) ;
  return Vr = l.slice(e, 1 < r ? 1 - r : void 0);
}
function Wr(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function Pr() {
  return !0;
}
function Ru() {
  return !1;
}
function Ne(e) {
  function t(n, r, l, i, o) {
    this._reactName = n, this._targetInst = l, this.type = r, this.nativeEvent = i, this.target = o, this.currentTarget = null;
    for (var u in e) e.hasOwnProperty(u) && (n = e[u], this[u] = n ? n(i) : i[u]);
    return this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1) ? Pr : Ru, this.isPropagationStopped = Ru, this;
  }
  return J(t.prototype, { preventDefault: function() {
    this.defaultPrevented = !0;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = Pr);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = Pr);
  }, persist: function() {
  }, isPersistent: Pr }), t;
}
var gn = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, Ro = Ne(gn), pr = J({}, gn, { view: 0, detail: 0 }), gd = Ne(pr), Xl, Kl, Nn, kl = J({}, pr, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: Lo, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== Nn && (Nn && e.type === "mousemove" ? (Xl = e.screenX - Nn.screenX, Kl = e.screenY - Nn.screenY) : Kl = Xl = 0, Nn = e), Xl);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : Kl;
} }), Lu = Ne(kl), wd = J({}, kl, { dataTransfer: 0 }), Sd = Ne(wd), xd = J({}, pr, { relatedTarget: 0 }), Gl = Ne(xd), kd = J({}, gn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Ed = Ne(kd), _d = J({}, gn, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), Cd = Ne(_d), Pd = J({}, gn, { data: 0 }), Du = Ne(Pd), zd = {
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
}, Td = {
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
}, Nd = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function jd(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = Nd[e]) ? !!t[e] : !1;
}
function Lo() {
  return jd;
}
var Rd = J({}, pr, { key: function(e) {
  if (e.key) {
    var t = zd[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = Wr(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Td[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: Lo, charCode: function(e) {
  return e.type === "keypress" ? Wr(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? Wr(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), Ld = Ne(Rd), Dd = J({}, kl, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Mu = Ne(Dd), Md = J({}, pr, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: Lo }), Id = Ne(Md), $d = J({}, gn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Fd = Ne($d), Od = J({}, kl, {
  deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  },
  deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), Ud = Ne(Od), Ad = [9, 13, 27, 32], Do = be && "CompositionEvent" in window, Bn = null;
be && "documentMode" in document && (Bn = document.documentMode);
var Bd = be && "TextEvent" in window && !Bn, Ds = be && (!Do || Bn && 8 < Bn && 11 >= Bn), Iu = " ", $u = !1;
function Ms(e, t) {
  switch (e) {
    case "keyup":
      return Ad.indexOf(t.keyCode) !== -1;
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
function Is(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var Qt = !1;
function Vd(e, t) {
  switch (e) {
    case "compositionend":
      return Is(t);
    case "keypress":
      return t.which !== 32 ? null : ($u = !0, Iu);
    case "textInput":
      return e = t.data, e === Iu && $u ? null : e;
    default:
      return null;
  }
}
function Wd(e, t) {
  if (Qt) return e === "compositionend" || !Do && Ms(e, t) ? (e = Ls(), Vr = jo = st = null, Qt = !1, e) : null;
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
      return Ds && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var Hd = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
function Fu(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!Hd[e.type] : t === "textarea";
}
function $s(e, t, n, r) {
  ps(r), t = ll(t, "onChange"), 0 < t.length && (n = new Ro("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var Vn = null, er = null;
function Qd(e) {
  Xs(e, 0);
}
function El(e) {
  var t = Kt(e);
  if (os(t)) return e;
}
function Yd(e, t) {
  if (e === "change") return t;
}
var Fs = !1;
if (be) {
  var Zl;
  if (be) {
    var Jl = "oninput" in document;
    if (!Jl) {
      var Ou = document.createElement("div");
      Ou.setAttribute("oninput", "return;"), Jl = typeof Ou.oninput == "function";
    }
    Zl = Jl;
  } else Zl = !1;
  Fs = Zl && (!document.documentMode || 9 < document.documentMode);
}
function Uu() {
  Vn && (Vn.detachEvent("onpropertychange", Os), er = Vn = null);
}
function Os(e) {
  if (e.propertyName === "value" && El(er)) {
    var t = [];
    $s(t, er, e, Co(e)), ys(Qd, t);
  }
}
function Xd(e, t, n) {
  e === "focusin" ? (Uu(), Vn = t, er = n, Vn.attachEvent("onpropertychange", Os)) : e === "focusout" && Uu();
}
function Kd(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return El(er);
}
function Gd(e, t) {
  if (e === "click") return El(t);
}
function Zd(e, t) {
  if (e === "input" || e === "change") return El(t);
}
function Jd(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Ve = typeof Object.is == "function" ? Object.is : Jd;
function tr(e, t) {
  if (Ve(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var l = n[r];
    if (!gi.call(t, l) || !Ve(e[l], t[l])) return !1;
  }
  return !0;
}
function Au(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function Bu(e, t) {
  var n = Au(e);
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
    n = Au(n);
  }
}
function Us(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Us(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function As() {
  for (var e = window, t = Jr(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = Jr(e.document);
  }
  return t;
}
function Mo(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
}
function qd(e) {
  var t = As(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && Us(n.ownerDocument.documentElement, n)) {
    if (r !== null && Mo(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
      else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var l = n.textContent.length, i = Math.min(r.start, l);
        r = r.end === void 0 ? i : Math.min(r.end, l), !e.extend && i > r && (l = r, r = i, i = l), l = Bu(n, i);
        var o = Bu(
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
var bd = be && "documentMode" in document && 11 >= document.documentMode, Yt = null, Fi = null, Wn = null, Oi = !1;
function Vu(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Oi || Yt == null || Yt !== Jr(r) || (r = Yt, "selectionStart" in r && Mo(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), Wn && tr(Wn, r) || (Wn = r, r = ll(Fi, "onSelect"), 0 < r.length && (t = new Ro("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = Yt)));
}
function zr(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var Xt = { animationend: zr("Animation", "AnimationEnd"), animationiteration: zr("Animation", "AnimationIteration"), animationstart: zr("Animation", "AnimationStart"), transitionend: zr("Transition", "TransitionEnd") }, ql = {}, Bs = {};
be && (Bs = document.createElement("div").style, "AnimationEvent" in window || (delete Xt.animationend.animation, delete Xt.animationiteration.animation, delete Xt.animationstart.animation), "TransitionEvent" in window || delete Xt.transitionend.transition);
function _l(e) {
  if (ql[e]) return ql[e];
  if (!Xt[e]) return e;
  var t = Xt[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in Bs) return ql[e] = t[n];
  return e;
}
var Vs = _l("animationend"), Ws = _l("animationiteration"), Hs = _l("animationstart"), Qs = _l("transitionend"), Ys = /* @__PURE__ */ new Map(), Wu = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function xt(e, t) {
  Ys.set(e, t), At(t, [e]);
}
for (var bl = 0; bl < Wu.length; bl++) {
  var ei = Wu[bl], ep = ei.toLowerCase(), tp = ei[0].toUpperCase() + ei.slice(1);
  xt(ep, "on" + tp);
}
xt(Vs, "onAnimationEnd");
xt(Ws, "onAnimationIteration");
xt(Hs, "onAnimationStart");
xt("dblclick", "onDoubleClick");
xt("focusin", "onFocus");
xt("focusout", "onBlur");
xt(Qs, "onTransitionEnd");
sn("onMouseEnter", ["mouseout", "mouseover"]);
sn("onMouseLeave", ["mouseout", "mouseover"]);
sn("onPointerEnter", ["pointerout", "pointerover"]);
sn("onPointerLeave", ["pointerout", "pointerover"]);
At("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
At("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
At("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
At("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
At("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
At("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var On = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), np = new Set("cancel close invalid load scroll toggle".split(" ").concat(On));
function Hu(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, ed(r, t, void 0, e), e.currentTarget = null;
}
function Xs(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n], l = r.event;
    r = r.listeners;
    e: {
      var i = void 0;
      if (t) for (var o = r.length - 1; 0 <= o; o--) {
        var u = r[o], a = u.instance, s = u.currentTarget;
        if (u = u.listener, a !== i && l.isPropagationStopped()) break e;
        Hu(l, u, s), i = a;
      }
      else for (o = 0; o < r.length; o++) {
        if (u = r[o], a = u.instance, s = u.currentTarget, u = u.listener, a !== i && l.isPropagationStopped()) break e;
        Hu(l, u, s), i = a;
      }
    }
  }
  if (br) throw e = Di, br = !1, Di = null, e;
}
function Y(e, t) {
  var n = t[Wi];
  n === void 0 && (n = t[Wi] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (Ks(t, e, 2, !1), n.add(r));
}
function ti(e, t, n) {
  var r = 0;
  t && (r |= 4), Ks(n, e, r, t);
}
var Tr = "_reactListening" + Math.random().toString(36).slice(2);
function nr(e) {
  if (!e[Tr]) {
    e[Tr] = !0, ts.forEach(function(n) {
      n !== "selectionchange" && (np.has(n) || ti(n, !1, e), ti(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Tr] || (t[Tr] = !0, ti("selectionchange", !1, t));
  }
}
function Ks(e, t, n, r) {
  switch (Rs(t)) {
    case 1:
      var l = vd;
      break;
    case 4:
      l = yd;
      break;
    default:
      l = No;
  }
  n = l.bind(null, t, n, e), l = void 0, !Li || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (l = !0), r ? l !== void 0 ? e.addEventListener(t, n, { capture: !0, passive: l }) : e.addEventListener(t, n, !0) : l !== void 0 ? e.addEventListener(t, n, { passive: l }) : e.addEventListener(t, n, !1);
}
function ni(e, t, n, r, l) {
  var i = r;
  if (!(t & 1) && !(t & 2) && r !== null) e: for (; ; ) {
    if (r === null) return;
    var o = r.tag;
    if (o === 3 || o === 4) {
      var u = r.stateNode.containerInfo;
      if (u === l || u.nodeType === 8 && u.parentNode === l) break;
      if (o === 4) for (o = r.return; o !== null; ) {
        var a = o.tag;
        if ((a === 3 || a === 4) && (a = o.stateNode.containerInfo, a === l || a.nodeType === 8 && a.parentNode === l)) return;
        o = o.return;
      }
      for (; u !== null; ) {
        if (o = jt(u), o === null) return;
        if (a = o.tag, a === 5 || a === 6) {
          r = i = o;
          continue e;
        }
        u = u.parentNode;
      }
    }
    r = r.return;
  }
  ys(function() {
    var s = i, c = Co(n), d = [];
    e: {
      var p = Ys.get(e);
      if (p !== void 0) {
        var y = Ro, v = e;
        switch (e) {
          case "keypress":
            if (Wr(n) === 0) break e;
          case "keydown":
          case "keyup":
            y = Ld;
            break;
          case "focusin":
            v = "focus", y = Gl;
            break;
          case "focusout":
            v = "blur", y = Gl;
            break;
          case "beforeblur":
          case "afterblur":
            y = Gl;
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
            y = Lu;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            y = Sd;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            y = Id;
            break;
          case Vs:
          case Ws:
          case Hs:
            y = Ed;
            break;
          case Qs:
            y = Fd;
            break;
          case "scroll":
            y = gd;
            break;
          case "wheel":
            y = Ud;
            break;
          case "copy":
          case "cut":
          case "paste":
            y = Cd;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            y = Mu;
        }
        var k = (t & 4) !== 0, N = !k && e === "scroll", h = k ? p !== null ? p + "Capture" : null : p;
        k = [];
        for (var f = s, m; f !== null; ) {
          m = f;
          var x = m.stateNode;
          if (m.tag === 5 && x !== null && (m = x, h !== null && (x = Zn(f, h), x != null && k.push(rr(f, x, m)))), N) break;
          f = f.return;
        }
        0 < k.length && (p = new y(p, v, null, n, c), d.push({ event: p, listeners: k }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (p = e === "mouseover" || e === "pointerover", y = e === "mouseout" || e === "pointerout", p && n !== ji && (v = n.relatedTarget || n.fromElement) && (jt(v) || v[et])) break e;
        if ((y || p) && (p = c.window === c ? c : (p = c.ownerDocument) ? p.defaultView || p.parentWindow : window, y ? (v = n.relatedTarget || n.toElement, y = s, v = v ? jt(v) : null, v !== null && (N = Bt(v), v !== N || v.tag !== 5 && v.tag !== 6) && (v = null)) : (y = null, v = s), y !== v)) {
          if (k = Lu, x = "onMouseLeave", h = "onMouseEnter", f = "mouse", (e === "pointerout" || e === "pointerover") && (k = Mu, x = "onPointerLeave", h = "onPointerEnter", f = "pointer"), N = y == null ? p : Kt(y), m = v == null ? p : Kt(v), p = new k(x, f + "leave", y, n, c), p.target = N, p.relatedTarget = m, x = null, jt(c) === s && (k = new k(h, f + "enter", v, n, c), k.target = m, k.relatedTarget = N, x = k), N = x, y && v) t: {
            for (k = y, h = v, f = 0, m = k; m; m = Vt(m)) f++;
            for (m = 0, x = h; x; x = Vt(x)) m++;
            for (; 0 < f - m; ) k = Vt(k), f--;
            for (; 0 < m - f; ) h = Vt(h), m--;
            for (; f--; ) {
              if (k === h || h !== null && k === h.alternate) break t;
              k = Vt(k), h = Vt(h);
            }
            k = null;
          }
          else k = null;
          y !== null && Qu(d, p, y, k, !1), v !== null && N !== null && Qu(d, N, v, k, !0);
        }
      }
      e: {
        if (p = s ? Kt(s) : window, y = p.nodeName && p.nodeName.toLowerCase(), y === "select" || y === "input" && p.type === "file") var S = Yd;
        else if (Fu(p)) if (Fs) S = Zd;
        else {
          S = Kd;
          var _ = Xd;
        }
        else (y = p.nodeName) && y.toLowerCase() === "input" && (p.type === "checkbox" || p.type === "radio") && (S = Gd);
        if (S && (S = S(e, s))) {
          $s(d, S, n, c);
          break e;
        }
        _ && _(e, p, s), e === "focusout" && (_ = p._wrapperState) && _.controlled && p.type === "number" && Ci(p, "number", p.value);
      }
      switch (_ = s ? Kt(s) : window, e) {
        case "focusin":
          (Fu(_) || _.contentEditable === "true") && (Yt = _, Fi = s, Wn = null);
          break;
        case "focusout":
          Wn = Fi = Yt = null;
          break;
        case "mousedown":
          Oi = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Oi = !1, Vu(d, n, c);
          break;
        case "selectionchange":
          if (bd) break;
        case "keydown":
        case "keyup":
          Vu(d, n, c);
      }
      var C;
      if (Do) e: {
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
      else Qt ? Ms(e, n) && (R = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (R = "onCompositionStart");
      R && (Ds && n.locale !== "ko" && (Qt || R !== "onCompositionStart" ? R === "onCompositionEnd" && Qt && (C = Ls()) : (st = c, jo = "value" in st ? st.value : st.textContent, Qt = !0)), _ = ll(s, R), 0 < _.length && (R = new Du(R, e, null, n, c), d.push({ event: R, listeners: _ }), C ? R.data = C : (C = Is(n), C !== null && (R.data = C)))), (C = Bd ? Vd(e, n) : Wd(e, n)) && (s = ll(s, "onBeforeInput"), 0 < s.length && (c = new Du("onBeforeInput", "beforeinput", null, n, c), d.push({ event: c, listeners: s }), c.data = C));
    }
    Xs(d, t);
  });
}
function rr(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function ll(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var l = e, i = l.stateNode;
    l.tag === 5 && i !== null && (l = i, i = Zn(e, n), i != null && r.unshift(rr(e, i, l)), i = Zn(e, t), i != null && r.push(rr(e, i, l))), e = e.return;
  }
  return r;
}
function Vt(e) {
  if (e === null) return null;
  do
    e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function Qu(e, t, n, r, l) {
  for (var i = t._reactName, o = []; n !== null && n !== r; ) {
    var u = n, a = u.alternate, s = u.stateNode;
    if (a !== null && a === r) break;
    u.tag === 5 && s !== null && (u = s, l ? (a = Zn(n, i), a != null && o.unshift(rr(n, a, u))) : l || (a = Zn(n, i), a != null && o.push(rr(n, a, u)))), n = n.return;
  }
  o.length !== 0 && e.push({ event: t, listeners: o });
}
var rp = /\r\n?/g, lp = /\u0000|\uFFFD/g;
function Yu(e) {
  return (typeof e == "string" ? e : "" + e).replace(rp, `
`).replace(lp, "");
}
function Nr(e, t, n) {
  if (t = Yu(t), Yu(e) !== t && n) throw Error(E(425));
}
function il() {
}
var Ui = null, Ai = null;
function Bi(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var Vi = typeof setTimeout == "function" ? setTimeout : void 0, ip = typeof clearTimeout == "function" ? clearTimeout : void 0, Xu = typeof Promise == "function" ? Promise : void 0, op = typeof queueMicrotask == "function" ? queueMicrotask : typeof Xu < "u" ? function(e) {
  return Xu.resolve(null).then(e).catch(up);
} : Vi;
function up(e) {
  setTimeout(function() {
    throw e;
  });
}
function ri(e, t) {
  var n = t, r = 0;
  do {
    var l = n.nextSibling;
    if (e.removeChild(n), l && l.nodeType === 8) if (n = l.data, n === "/$") {
      if (r === 0) {
        e.removeChild(l), bn(t);
        return;
      }
      r--;
    } else n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = l;
  } while (n);
  bn(t);
}
function ht(e) {
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
function Ku(e) {
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
var wn = Math.random().toString(36).slice(2), Qe = "__reactFiber$" + wn, lr = "__reactProps$" + wn, et = "__reactContainer$" + wn, Wi = "__reactEvents$" + wn, ap = "__reactListeners$" + wn, sp = "__reactHandles$" + wn;
function jt(e) {
  var t = e[Qe];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[et] || n[Qe]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = Ku(e); e !== null; ) {
        if (n = e[Qe]) return n;
        e = Ku(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function hr(e) {
  return e = e[Qe] || e[et], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function Kt(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(E(33));
}
function Cl(e) {
  return e[lr] || null;
}
var Hi = [], Gt = -1;
function kt(e) {
  return { current: e };
}
function X(e) {
  0 > Gt || (e.current = Hi[Gt], Hi[Gt] = null, Gt--);
}
function Q(e, t) {
  Gt++, Hi[Gt] = e.current, e.current = t;
}
var St = {}, pe = kt(St), Se = kt(!1), It = St;
function cn(e, t) {
  var n = e.type.contextTypes;
  if (!n) return St;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var l = {}, i;
  for (i in n) l[i] = t[i];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = l), l;
}
function xe(e) {
  return e = e.childContextTypes, e != null;
}
function ol() {
  X(Se), X(pe);
}
function Gu(e, t, n) {
  if (pe.current !== St) throw Error(E(168));
  Q(pe, t), Q(Se, n);
}
function Gs(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var l in r) if (!(l in t)) throw Error(E(108, Xf(e) || "Unknown", l));
  return J({}, n, r);
}
function ul(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || St, It = pe.current, Q(pe, e), Q(Se, Se.current), !0;
}
function Zu(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(E(169));
  n ? (e = Gs(e, t, It), r.__reactInternalMemoizedMergedChildContext = e, X(Se), X(pe), Q(pe, e)) : X(Se), Q(Se, n);
}
var Ge = null, Pl = !1, li = !1;
function Zs(e) {
  Ge === null ? Ge = [e] : Ge.push(e);
}
function cp(e) {
  Pl = !0, Zs(e);
}
function Et() {
  if (!li && Ge !== null) {
    li = !0;
    var e = 0, t = H;
    try {
      var n = Ge;
      for (H = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(!0);
        while (r !== null);
      }
      Ge = null, Pl = !1;
    } catch (l) {
      throw Ge !== null && (Ge = Ge.slice(e + 1)), xs(Po, Et), l;
    } finally {
      H = t, li = !1;
    }
  }
  return null;
}
var Zt = [], Jt = 0, al = null, sl = 0, je = [], Re = 0, $t = null, Ze = 1, Je = "";
function Tt(e, t) {
  Zt[Jt++] = sl, Zt[Jt++] = al, al = e, sl = t;
}
function Js(e, t, n) {
  je[Re++] = Ze, je[Re++] = Je, je[Re++] = $t, $t = e;
  var r = Ze;
  e = Je;
  var l = 32 - Ae(r) - 1;
  r &= ~(1 << l), n += 1;
  var i = 32 - Ae(t) + l;
  if (30 < i) {
    var o = l - l % 5;
    i = (r & (1 << o) - 1).toString(32), r >>= o, l -= o, Ze = 1 << 32 - Ae(t) + l | n << l | r, Je = i + e;
  } else Ze = 1 << i | n << l | r, Je = e;
}
function Io(e) {
  e.return !== null && (Tt(e, 1), Js(e, 1, 0));
}
function $o(e) {
  for (; e === al; ) al = Zt[--Jt], Zt[Jt] = null, sl = Zt[--Jt], Zt[Jt] = null;
  for (; e === $t; ) $t = je[--Re], je[Re] = null, Je = je[--Re], je[Re] = null, Ze = je[--Re], je[Re] = null;
}
var Pe = null, Ce = null, K = !1, Ue = null;
function qs(e, t) {
  var n = Le(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function Ju(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, Pe = e, Ce = ht(t.firstChild), !0) : !1;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, Pe = e, Ce = null, !0) : !1;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = $t !== null ? { id: Ze, overflow: Je } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = Le(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, Pe = e, Ce = null, !0) : !1;
    default:
      return !1;
  }
}
function Qi(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function Yi(e) {
  if (K) {
    var t = Ce;
    if (t) {
      var n = t;
      if (!Ju(e, t)) {
        if (Qi(e)) throw Error(E(418));
        t = ht(n.nextSibling);
        var r = Pe;
        t && Ju(e, t) ? qs(r, n) : (e.flags = e.flags & -4097 | 2, K = !1, Pe = e);
      }
    } else {
      if (Qi(e)) throw Error(E(418));
      e.flags = e.flags & -4097 | 2, K = !1, Pe = e;
    }
  }
}
function qu(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  Pe = e;
}
function jr(e) {
  if (e !== Pe) return !1;
  if (!K) return qu(e), K = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !Bi(e.type, e.memoizedProps)), t && (t = Ce)) {
    if (Qi(e)) throw bs(), Error(E(418));
    for (; t; ) qs(e, t), t = ht(t.nextSibling);
  }
  if (qu(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(E(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              Ce = ht(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      Ce = null;
    }
  } else Ce = Pe ? ht(e.stateNode.nextSibling) : null;
  return !0;
}
function bs() {
  for (var e = Ce; e; ) e = ht(e.nextSibling);
}
function fn() {
  Ce = Pe = null, K = !1;
}
function Fo(e) {
  Ue === null ? Ue = [e] : Ue.push(e);
}
var fp = rt.ReactCurrentBatchConfig;
function jn(e, t, n) {
  if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
    if (n._owner) {
      if (n = n._owner, n) {
        if (n.tag !== 1) throw Error(E(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(E(147, e));
      var l = r, i = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === i ? t.ref : (t = function(o) {
        var u = l.refs;
        o === null ? delete u[i] : u[i] = o;
      }, t._stringRef = i, t);
    }
    if (typeof e != "string") throw Error(E(284));
    if (!n._owner) throw Error(E(290, e));
  }
  return e;
}
function Rr(e, t) {
  throw e = Object.prototype.toString.call(t), Error(E(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function bu(e) {
  var t = e._init;
  return t(e._payload);
}
function ec(e) {
  function t(h, f) {
    if (e) {
      var m = h.deletions;
      m === null ? (h.deletions = [f], h.flags |= 16) : m.push(f);
    }
  }
  function n(h, f) {
    if (!e) return null;
    for (; f !== null; ) t(h, f), f = f.sibling;
    return null;
  }
  function r(h, f) {
    for (h = /* @__PURE__ */ new Map(); f !== null; ) f.key !== null ? h.set(f.key, f) : h.set(f.index, f), f = f.sibling;
    return h;
  }
  function l(h, f) {
    return h = gt(h, f), h.index = 0, h.sibling = null, h;
  }
  function i(h, f, m) {
    return h.index = m, e ? (m = h.alternate, m !== null ? (m = m.index, m < f ? (h.flags |= 2, f) : m) : (h.flags |= 2, f)) : (h.flags |= 1048576, f);
  }
  function o(h) {
    return e && h.alternate === null && (h.flags |= 2), h;
  }
  function u(h, f, m, x) {
    return f === null || f.tag !== 6 ? (f = fi(m, h.mode, x), f.return = h, f) : (f = l(f, m), f.return = h, f);
  }
  function a(h, f, m, x) {
    var S = m.type;
    return S === Ht ? c(h, f, m.props.children, x, m.key) : f !== null && (f.elementType === S || typeof S == "object" && S !== null && S.$$typeof === it && bu(S) === f.type) ? (x = l(f, m.props), x.ref = jn(h, f, m), x.return = h, x) : (x = Zr(m.type, m.key, m.props, null, h.mode, x), x.ref = jn(h, f, m), x.return = h, x);
  }
  function s(h, f, m, x) {
    return f === null || f.tag !== 4 || f.stateNode.containerInfo !== m.containerInfo || f.stateNode.implementation !== m.implementation ? (f = di(m, h.mode, x), f.return = h, f) : (f = l(f, m.children || []), f.return = h, f);
  }
  function c(h, f, m, x, S) {
    return f === null || f.tag !== 7 ? (f = Mt(m, h.mode, x, S), f.return = h, f) : (f = l(f, m), f.return = h, f);
  }
  function d(h, f, m) {
    if (typeof f == "string" && f !== "" || typeof f == "number") return f = fi("" + f, h.mode, m), f.return = h, f;
    if (typeof f == "object" && f !== null) {
      switch (f.$$typeof) {
        case Sr:
          return m = Zr(f.type, f.key, f.props, null, h.mode, m), m.ref = jn(h, null, f), m.return = h, m;
        case Wt:
          return f = di(f, h.mode, m), f.return = h, f;
        case it:
          var x = f._init;
          return d(h, x(f._payload), m);
      }
      if ($n(f) || Cn(f)) return f = Mt(f, h.mode, m, null), f.return = h, f;
      Rr(h, f);
    }
    return null;
  }
  function p(h, f, m, x) {
    var S = f !== null ? f.key : null;
    if (typeof m == "string" && m !== "" || typeof m == "number") return S !== null ? null : u(h, f, "" + m, x);
    if (typeof m == "object" && m !== null) {
      switch (m.$$typeof) {
        case Sr:
          return m.key === S ? a(h, f, m, x) : null;
        case Wt:
          return m.key === S ? s(h, f, m, x) : null;
        case it:
          return S = m._init, p(
            h,
            f,
            S(m._payload),
            x
          );
      }
      if ($n(m) || Cn(m)) return S !== null ? null : c(h, f, m, x, null);
      Rr(h, m);
    }
    return null;
  }
  function y(h, f, m, x, S) {
    if (typeof x == "string" && x !== "" || typeof x == "number") return h = h.get(m) || null, u(f, h, "" + x, S);
    if (typeof x == "object" && x !== null) {
      switch (x.$$typeof) {
        case Sr:
          return h = h.get(x.key === null ? m : x.key) || null, a(f, h, x, S);
        case Wt:
          return h = h.get(x.key === null ? m : x.key) || null, s(f, h, x, S);
        case it:
          var _ = x._init;
          return y(h, f, m, _(x._payload), S);
      }
      if ($n(x) || Cn(x)) return h = h.get(m) || null, c(f, h, x, S, null);
      Rr(f, x);
    }
    return null;
  }
  function v(h, f, m, x) {
    for (var S = null, _ = null, C = f, R = f = 0, j = null; C !== null && R < m.length; R++) {
      C.index > R ? (j = C, C = null) : j = C.sibling;
      var D = p(h, C, m[R], x);
      if (D === null) {
        C === null && (C = j);
        break;
      }
      e && C && D.alternate === null && t(h, C), f = i(D, f, R), _ === null ? S = D : _.sibling = D, _ = D, C = j;
    }
    if (R === m.length) return n(h, C), K && Tt(h, R), S;
    if (C === null) {
      for (; R < m.length; R++) C = d(h, m[R], x), C !== null && (f = i(C, f, R), _ === null ? S = C : _.sibling = C, _ = C);
      return K && Tt(h, R), S;
    }
    for (C = r(h, C); R < m.length; R++) j = y(C, h, R, m[R], x), j !== null && (e && j.alternate !== null && C.delete(j.key === null ? R : j.key), f = i(j, f, R), _ === null ? S = j : _.sibling = j, _ = j);
    return e && C.forEach(function(b) {
      return t(h, b);
    }), K && Tt(h, R), S;
  }
  function k(h, f, m, x) {
    var S = Cn(m);
    if (typeof S != "function") throw Error(E(150));
    if (m = S.call(m), m == null) throw Error(E(151));
    for (var _ = S = null, C = f, R = f = 0, j = null, D = m.next(); C !== null && !D.done; R++, D = m.next()) {
      C.index > R ? (j = C, C = null) : j = C.sibling;
      var b = p(h, C, D.value, x);
      if (b === null) {
        C === null && (C = j);
        break;
      }
      e && C && b.alternate === null && t(h, C), f = i(b, f, R), _ === null ? S = b : _.sibling = b, _ = b, C = j;
    }
    if (D.done) return n(
      h,
      C
    ), K && Tt(h, R), S;
    if (C === null) {
      for (; !D.done; R++, D = m.next()) D = d(h, D.value, x), D !== null && (f = i(D, f, R), _ === null ? S = D : _.sibling = D, _ = D);
      return K && Tt(h, R), S;
    }
    for (C = r(h, C); !D.done; R++, D = m.next()) D = y(C, h, R, D.value, x), D !== null && (e && D.alternate !== null && C.delete(D.key === null ? R : D.key), f = i(D, f, R), _ === null ? S = D : _.sibling = D, _ = D);
    return e && C.forEach(function(_t) {
      return t(h, _t);
    }), K && Tt(h, R), S;
  }
  function N(h, f, m, x) {
    if (typeof m == "object" && m !== null && m.type === Ht && m.key === null && (m = m.props.children), typeof m == "object" && m !== null) {
      switch (m.$$typeof) {
        case Sr:
          e: {
            for (var S = m.key, _ = f; _ !== null; ) {
              if (_.key === S) {
                if (S = m.type, S === Ht) {
                  if (_.tag === 7) {
                    n(h, _.sibling), f = l(_, m.props.children), f.return = h, h = f;
                    break e;
                  }
                } else if (_.elementType === S || typeof S == "object" && S !== null && S.$$typeof === it && bu(S) === _.type) {
                  n(h, _.sibling), f = l(_, m.props), f.ref = jn(h, _, m), f.return = h, h = f;
                  break e;
                }
                n(h, _);
                break;
              } else t(h, _);
              _ = _.sibling;
            }
            m.type === Ht ? (f = Mt(m.props.children, h.mode, x, m.key), f.return = h, h = f) : (x = Zr(m.type, m.key, m.props, null, h.mode, x), x.ref = jn(h, f, m), x.return = h, h = x);
          }
          return o(h);
        case Wt:
          e: {
            for (_ = m.key; f !== null; ) {
              if (f.key === _) if (f.tag === 4 && f.stateNode.containerInfo === m.containerInfo && f.stateNode.implementation === m.implementation) {
                n(h, f.sibling), f = l(f, m.children || []), f.return = h, h = f;
                break e;
              } else {
                n(h, f);
                break;
              }
              else t(h, f);
              f = f.sibling;
            }
            f = di(m, h.mode, x), f.return = h, h = f;
          }
          return o(h);
        case it:
          return _ = m._init, N(h, f, _(m._payload), x);
      }
      if ($n(m)) return v(h, f, m, x);
      if (Cn(m)) return k(h, f, m, x);
      Rr(h, m);
    }
    return typeof m == "string" && m !== "" || typeof m == "number" ? (m = "" + m, f !== null && f.tag === 6 ? (n(h, f.sibling), f = l(f, m), f.return = h, h = f) : (n(h, f), f = fi(m, h.mode, x), f.return = h, h = f), o(h)) : n(h, f);
  }
  return N;
}
var dn = ec(!0), tc = ec(!1), cl = kt(null), fl = null, qt = null, Oo = null;
function Uo() {
  Oo = qt = fl = null;
}
function Ao(e) {
  var t = cl.current;
  X(cl), e._currentValue = t;
}
function Xi(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function on(e, t) {
  fl = e, Oo = qt = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (we = !0), e.firstContext = null);
}
function Me(e) {
  var t = e._currentValue;
  if (Oo !== e) if (e = { context: e, memoizedValue: t, next: null }, qt === null) {
    if (fl === null) throw Error(E(308));
    qt = e, fl.dependencies = { lanes: 0, firstContext: e };
  } else qt = qt.next = e;
  return t;
}
var Rt = null;
function Bo(e) {
  Rt === null ? Rt = [e] : Rt.push(e);
}
function nc(e, t, n, r) {
  var l = t.interleaved;
  return l === null ? (n.next = n, Bo(t)) : (n.next = l.next, l.next = n), t.interleaved = n, tt(e, r);
}
function tt(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
  return n.tag === 3 ? n.stateNode : null;
}
var ot = !1;
function Vo(e) {
  e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function rc(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function qe(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function mt(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, B & 2) {
    var l = r.pending;
    return l === null ? t.next = t : (t.next = l.next, l.next = t), r.pending = t, tt(e, n);
  }
  return l = r.interleaved, l === null ? (t.next = t, Bo(r)) : (t.next = l.next, l.next = t), r.interleaved = t, tt(e, n);
}
function Hr(e, t, n) {
  if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, zo(e, n);
  }
}
function ea(e, t) {
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
function dl(e, t, n, r) {
  var l = e.updateQueue;
  ot = !1;
  var i = l.firstBaseUpdate, o = l.lastBaseUpdate, u = l.shared.pending;
  if (u !== null) {
    l.shared.pending = null;
    var a = u, s = a.next;
    a.next = null, o === null ? i = s : o.next = s, o = a;
    var c = e.alternate;
    c !== null && (c = c.updateQueue, u = c.lastBaseUpdate, u !== o && (u === null ? c.firstBaseUpdate = s : u.next = s, c.lastBaseUpdate = a));
  }
  if (i !== null) {
    var d = l.baseState;
    o = 0, c = s = a = null, u = i;
    do {
      var p = u.lane, y = u.eventTime;
      if ((r & p) === p) {
        c !== null && (c = c.next = {
          eventTime: y,
          lane: 0,
          tag: u.tag,
          payload: u.payload,
          callback: u.callback,
          next: null
        });
        e: {
          var v = e, k = u;
          switch (p = t, y = n, k.tag) {
            case 1:
              if (v = k.payload, typeof v == "function") {
                d = v.call(y, d, p);
                break e;
              }
              d = v;
              break e;
            case 3:
              v.flags = v.flags & -65537 | 128;
            case 0:
              if (v = k.payload, p = typeof v == "function" ? v.call(y, d, p) : v, p == null) break e;
              d = J({}, d, p);
              break e;
            case 2:
              ot = !0;
          }
        }
        u.callback !== null && u.lane !== 0 && (e.flags |= 64, p = l.effects, p === null ? l.effects = [u] : p.push(u));
      } else y = { eventTime: y, lane: p, tag: u.tag, payload: u.payload, callback: u.callback, next: null }, c === null ? (s = c = y, a = d) : c = c.next = y, o |= p;
      if (u = u.next, u === null) {
        if (u = l.shared.pending, u === null) break;
        p = u, u = p.next, p.next = null, l.lastBaseUpdate = p, l.shared.pending = null;
      }
    } while (!0);
    if (c === null && (a = d), l.baseState = a, l.firstBaseUpdate = s, l.lastBaseUpdate = c, t = l.shared.interleaved, t !== null) {
      l = t;
      do
        o |= l.lane, l = l.next;
      while (l !== t);
    } else i === null && (l.shared.lanes = 0);
    Ot |= o, e.lanes = o, e.memoizedState = d;
  }
}
function ta(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], l = r.callback;
    if (l !== null) {
      if (r.callback = null, r = n, typeof l != "function") throw Error(E(191, l));
      l.call(r);
    }
  }
}
var mr = {}, Xe = kt(mr), ir = kt(mr), or = kt(mr);
function Lt(e) {
  if (e === mr) throw Error(E(174));
  return e;
}
function Wo(e, t) {
  switch (Q(or, t), Q(ir, e), Q(Xe, mr), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : zi(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = zi(t, e);
  }
  X(Xe), Q(Xe, t);
}
function pn() {
  X(Xe), X(ir), X(or);
}
function lc(e) {
  Lt(or.current);
  var t = Lt(Xe.current), n = zi(t, e.type);
  t !== n && (Q(ir, e), Q(Xe, n));
}
function Ho(e) {
  ir.current === e && (X(Xe), X(ir));
}
var G = kt(0);
function pl(e) {
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
var ii = [];
function Qo() {
  for (var e = 0; e < ii.length; e++) ii[e]._workInProgressVersionPrimary = null;
  ii.length = 0;
}
var Qr = rt.ReactCurrentDispatcher, oi = rt.ReactCurrentBatchConfig, Ft = 0, Z = null, ne = null, le = null, hl = !1, Hn = !1, ur = 0, dp = 0;
function ce() {
  throw Error(E(321));
}
function Yo(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!Ve(e[n], t[n])) return !1;
  return !0;
}
function Xo(e, t, n, r, l, i) {
  if (Ft = i, Z = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Qr.current = e === null || e.memoizedState === null ? vp : yp, e = n(r, l), Hn) {
    i = 0;
    do {
      if (Hn = !1, ur = 0, 25 <= i) throw Error(E(301));
      i += 1, le = ne = null, t.updateQueue = null, Qr.current = gp, e = n(r, l);
    } while (Hn);
  }
  if (Qr.current = ml, t = ne !== null && ne.next !== null, Ft = 0, le = ne = Z = null, hl = !1, t) throw Error(E(300));
  return e;
}
function Ko() {
  var e = ur !== 0;
  return ur = 0, e;
}
function He() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return le === null ? Z.memoizedState = le = e : le = le.next = e, le;
}
function Ie() {
  if (ne === null) {
    var e = Z.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = ne.next;
  var t = le === null ? Z.memoizedState : le.next;
  if (t !== null) le = t, ne = e;
  else {
    if (e === null) throw Error(E(310));
    ne = e, e = { memoizedState: ne.memoizedState, baseState: ne.baseState, baseQueue: ne.baseQueue, queue: ne.queue, next: null }, le === null ? Z.memoizedState = le = e : le = le.next = e;
  }
  return le;
}
function ar(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function ui(e) {
  var t = Ie(), n = t.queue;
  if (n === null) throw Error(E(311));
  n.lastRenderedReducer = e;
  var r = ne, l = r.baseQueue, i = n.pending;
  if (i !== null) {
    if (l !== null) {
      var o = l.next;
      l.next = i.next, i.next = o;
    }
    r.baseQueue = l = i, n.pending = null;
  }
  if (l !== null) {
    i = l.next, r = r.baseState;
    var u = o = null, a = null, s = i;
    do {
      var c = s.lane;
      if ((Ft & c) === c) a !== null && (a = a.next = { lane: 0, action: s.action, hasEagerState: s.hasEagerState, eagerState: s.eagerState, next: null }), r = s.hasEagerState ? s.eagerState : e(r, s.action);
      else {
        var d = {
          lane: c,
          action: s.action,
          hasEagerState: s.hasEagerState,
          eagerState: s.eagerState,
          next: null
        };
        a === null ? (u = a = d, o = r) : a = a.next = d, Z.lanes |= c, Ot |= c;
      }
      s = s.next;
    } while (s !== null && s !== i);
    a === null ? o = r : a.next = u, Ve(r, t.memoizedState) || (we = !0), t.memoizedState = r, t.baseState = o, t.baseQueue = a, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    l = e;
    do
      i = l.lane, Z.lanes |= i, Ot |= i, l = l.next;
    while (l !== e);
  } else l === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function ai(e) {
  var t = Ie(), n = t.queue;
  if (n === null) throw Error(E(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch, l = n.pending, i = t.memoizedState;
  if (l !== null) {
    n.pending = null;
    var o = l = l.next;
    do
      i = e(i, o.action), o = o.next;
    while (o !== l);
    Ve(i, t.memoizedState) || (we = !0), t.memoizedState = i, t.baseQueue === null && (t.baseState = i), n.lastRenderedState = i;
  }
  return [i, r];
}
function ic() {
}
function oc(e, t) {
  var n = Z, r = Ie(), l = t(), i = !Ve(r.memoizedState, l);
  if (i && (r.memoizedState = l, we = !0), r = r.queue, Go(sc.bind(null, n, r, e), [e]), r.getSnapshot !== t || i || le !== null && le.memoizedState.tag & 1) {
    if (n.flags |= 2048, sr(9, ac.bind(null, n, r, l, t), void 0, null), ie === null) throw Error(E(349));
    Ft & 30 || uc(n, t, l);
  }
  return l;
}
function uc(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = Z.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, Z.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function ac(e, t, n, r) {
  t.value = n, t.getSnapshot = r, cc(t) && fc(e);
}
function sc(e, t, n) {
  return n(function() {
    cc(t) && fc(e);
  });
}
function cc(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Ve(e, n);
  } catch {
    return !0;
  }
}
function fc(e) {
  var t = tt(e, 1);
  t !== null && Be(t, e, 1, -1);
}
function na(e) {
  var t = He();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: ar, lastRenderedState: e }, t.queue = e, e = e.dispatch = mp.bind(null, Z, e), [t.memoizedState, e];
}
function sr(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = Z.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, Z.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function dc() {
  return Ie().memoizedState;
}
function Yr(e, t, n, r) {
  var l = He();
  Z.flags |= e, l.memoizedState = sr(1 | t, n, void 0, r === void 0 ? null : r);
}
function zl(e, t, n, r) {
  var l = Ie();
  r = r === void 0 ? null : r;
  var i = void 0;
  if (ne !== null) {
    var o = ne.memoizedState;
    if (i = o.destroy, r !== null && Yo(r, o.deps)) {
      l.memoizedState = sr(t, n, i, r);
      return;
    }
  }
  Z.flags |= e, l.memoizedState = sr(1 | t, n, i, r);
}
function ra(e, t) {
  return Yr(8390656, 8, e, t);
}
function Go(e, t) {
  return zl(2048, 8, e, t);
}
function pc(e, t) {
  return zl(4, 2, e, t);
}
function hc(e, t) {
  return zl(4, 4, e, t);
}
function mc(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function vc(e, t, n) {
  return n = n != null ? n.concat([e]) : null, zl(4, 4, mc.bind(null, t, e), n);
}
function Zo() {
}
function yc(e, t) {
  var n = Ie();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Yo(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function gc(e, t) {
  var n = Ie();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Yo(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function wc(e, t, n) {
  return Ft & 21 ? (Ve(n, t) || (n = _s(), Z.lanes |= n, Ot |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, we = !0), e.memoizedState = n);
}
function pp(e, t) {
  var n = H;
  H = n !== 0 && 4 > n ? n : 4, e(!0);
  var r = oi.transition;
  oi.transition = {};
  try {
    e(!1), t();
  } finally {
    H = n, oi.transition = r;
  }
}
function Sc() {
  return Ie().memoizedState;
}
function hp(e, t, n) {
  var r = yt(e);
  if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, xc(e)) kc(t, n);
  else if (n = nc(e, t, n, r), n !== null) {
    var l = me();
    Be(n, e, r, l), Ec(n, t, r);
  }
}
function mp(e, t, n) {
  var r = yt(e), l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (xc(e)) kc(t, l);
  else {
    var i = e.alternate;
    if (e.lanes === 0 && (i === null || i.lanes === 0) && (i = t.lastRenderedReducer, i !== null)) try {
      var o = t.lastRenderedState, u = i(o, n);
      if (l.hasEagerState = !0, l.eagerState = u, Ve(u, o)) {
        var a = t.interleaved;
        a === null ? (l.next = l, Bo(t)) : (l.next = a.next, a.next = l), t.interleaved = l;
        return;
      }
    } catch {
    } finally {
    }
    n = nc(e, t, l, r), n !== null && (l = me(), Be(n, e, r, l), Ec(n, t, r));
  }
}
function xc(e) {
  var t = e.alternate;
  return e === Z || t !== null && t === Z;
}
function kc(e, t) {
  Hn = hl = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function Ec(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, zo(e, n);
  }
}
var ml = { readContext: Me, useCallback: ce, useContext: ce, useEffect: ce, useImperativeHandle: ce, useInsertionEffect: ce, useLayoutEffect: ce, useMemo: ce, useReducer: ce, useRef: ce, useState: ce, useDebugValue: ce, useDeferredValue: ce, useTransition: ce, useMutableSource: ce, useSyncExternalStore: ce, useId: ce, unstable_isNewReconciler: !1 }, vp = { readContext: Me, useCallback: function(e, t) {
  return He().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: Me, useEffect: ra, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Yr(
    4194308,
    4,
    mc.bind(null, t, e),
    n
  );
}, useLayoutEffect: function(e, t) {
  return Yr(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return Yr(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = He();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = He();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = hp.bind(null, Z, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = He();
  return e = { current: e }, t.memoizedState = e;
}, useState: na, useDebugValue: Zo, useDeferredValue: function(e) {
  return He().memoizedState = e;
}, useTransition: function() {
  var e = na(!1), t = e[0];
  return e = pp.bind(null, e[1]), He().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = Z, l = He();
  if (K) {
    if (n === void 0) throw Error(E(407));
    n = n();
  } else {
    if (n = t(), ie === null) throw Error(E(349));
    Ft & 30 || uc(r, t, n);
  }
  l.memoizedState = n;
  var i = { value: n, getSnapshot: t };
  return l.queue = i, ra(sc.bind(
    null,
    r,
    i,
    e
  ), [e]), r.flags |= 2048, sr(9, ac.bind(null, r, i, n, t), void 0, null), n;
}, useId: function() {
  var e = He(), t = ie.identifierPrefix;
  if (K) {
    var n = Je, r = Ze;
    n = (r & ~(1 << 32 - Ae(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = ur++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = dp++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: !1 }, yp = {
  readContext: Me,
  useCallback: yc,
  useContext: Me,
  useEffect: Go,
  useImperativeHandle: vc,
  useInsertionEffect: pc,
  useLayoutEffect: hc,
  useMemo: gc,
  useReducer: ui,
  useRef: dc,
  useState: function() {
    return ui(ar);
  },
  useDebugValue: Zo,
  useDeferredValue: function(e) {
    var t = Ie();
    return wc(t, ne.memoizedState, e);
  },
  useTransition: function() {
    var e = ui(ar)[0], t = Ie().memoizedState;
    return [e, t];
  },
  useMutableSource: ic,
  useSyncExternalStore: oc,
  useId: Sc,
  unstable_isNewReconciler: !1
}, gp = { readContext: Me, useCallback: yc, useContext: Me, useEffect: Go, useImperativeHandle: vc, useInsertionEffect: pc, useLayoutEffect: hc, useMemo: gc, useReducer: ai, useRef: dc, useState: function() {
  return ai(ar);
}, useDebugValue: Zo, useDeferredValue: function(e) {
  var t = Ie();
  return ne === null ? t.memoizedState = e : wc(t, ne.memoizedState, e);
}, useTransition: function() {
  var e = ai(ar)[0], t = Ie().memoizedState;
  return [e, t];
}, useMutableSource: ic, useSyncExternalStore: oc, useId: Sc, unstable_isNewReconciler: !1 };
function Fe(e, t) {
  if (e && e.defaultProps) {
    t = J({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function Ki(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : J({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var Tl = { isMounted: function(e) {
  return (e = e._reactInternals) ? Bt(e) === e : !1;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = me(), l = yt(e), i = qe(r, l);
  i.payload = t, n != null && (i.callback = n), t = mt(e, i, l), t !== null && (Be(t, e, l, r), Hr(t, e, l));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = me(), l = yt(e), i = qe(r, l);
  i.tag = 1, i.payload = t, n != null && (i.callback = n), t = mt(e, i, l), t !== null && (Be(t, e, l, r), Hr(t, e, l));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = me(), r = yt(e), l = qe(n, r);
  l.tag = 2, t != null && (l.callback = t), t = mt(e, l, r), t !== null && (Be(t, e, r, n), Hr(t, e, r));
} };
function la(e, t, n, r, l, i, o) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, i, o) : t.prototype && t.prototype.isPureReactComponent ? !tr(n, r) || !tr(l, i) : !0;
}
function _c(e, t, n) {
  var r = !1, l = St, i = t.contextType;
  return typeof i == "object" && i !== null ? i = Me(i) : (l = xe(t) ? It : pe.current, r = t.contextTypes, i = (r = r != null) ? cn(e, l) : St), t = new t(n, i), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = Tl, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = l, e.__reactInternalMemoizedMaskedChildContext = i), t;
}
function ia(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Tl.enqueueReplaceState(t, t.state, null);
}
function Gi(e, t, n, r) {
  var l = e.stateNode;
  l.props = n, l.state = e.memoizedState, l.refs = {}, Vo(e);
  var i = t.contextType;
  typeof i == "object" && i !== null ? l.context = Me(i) : (i = xe(t) ? It : pe.current, l.context = cn(e, i)), l.state = e.memoizedState, i = t.getDerivedStateFromProps, typeof i == "function" && (Ki(e, t, i, n), l.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof l.getSnapshotBeforeUpdate == "function" || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (t = l.state, typeof l.componentWillMount == "function" && l.componentWillMount(), typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount(), t !== l.state && Tl.enqueueReplaceState(l, l.state, null), dl(e, n, l, r), l.state = e.memoizedState), typeof l.componentDidMount == "function" && (e.flags |= 4194308);
}
function hn(e, t) {
  try {
    var n = "", r = t;
    do
      n += Yf(r), r = r.return;
    while (r);
    var l = n;
  } catch (i) {
    l = `
Error generating stack: ` + i.message + `
` + i.stack;
  }
  return { value: e, source: t, stack: l, digest: null };
}
function si(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function Zi(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function() {
      throw n;
    });
  }
}
var wp = typeof WeakMap == "function" ? WeakMap : Map;
function Cc(e, t, n) {
  n = qe(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    yl || (yl = !0, oo = r), Zi(e, t);
  }, n;
}
function Pc(e, t, n) {
  n = qe(-1, n), n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var l = t.value;
    n.payload = function() {
      return r(l);
    }, n.callback = function() {
      Zi(e, t);
    };
  }
  var i = e.stateNode;
  return i !== null && typeof i.componentDidCatch == "function" && (n.callback = function() {
    Zi(e, t), typeof r != "function" && (vt === null ? vt = /* @__PURE__ */ new Set([this]) : vt.add(this));
    var o = t.stack;
    this.componentDidCatch(t.value, { componentStack: o !== null ? o : "" });
  }), n;
}
function oa(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new wp();
    var l = /* @__PURE__ */ new Set();
    r.set(t, l);
  } else l = r.get(t), l === void 0 && (l = /* @__PURE__ */ new Set(), r.set(t, l));
  l.has(n) || (l.add(n), e = Dp.bind(null, e, t, n), t.then(e, e));
}
function ua(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function aa(e, t, n, r, l) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = l, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = qe(-1, 1), t.tag = 2, mt(n, t, 1))), n.lanes |= 1), e);
}
var Sp = rt.ReactCurrentOwner, we = !1;
function he(e, t, n, r) {
  t.child = e === null ? tc(t, null, n, r) : dn(t, e.child, n, r);
}
function sa(e, t, n, r, l) {
  n = n.render;
  var i = t.ref;
  return on(t, l), r = Xo(e, t, n, r, i, l), n = Ko(), e !== null && !we ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, nt(e, t, l)) : (K && n && Io(t), t.flags |= 1, he(e, t, r, l), t.child);
}
function ca(e, t, n, r, l) {
  if (e === null) {
    var i = n.type;
    return typeof i == "function" && !lu(i) && i.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = i, zc(e, t, i, r, l)) : (e = Zr(n.type, null, r, t, t.mode, l), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (i = e.child, !(e.lanes & l)) {
    var o = i.memoizedProps;
    if (n = n.compare, n = n !== null ? n : tr, n(o, r) && e.ref === t.ref) return nt(e, t, l);
  }
  return t.flags |= 1, e = gt(i, r), e.ref = t.ref, e.return = t, t.child = e;
}
function zc(e, t, n, r, l) {
  if (e !== null) {
    var i = e.memoizedProps;
    if (tr(i, r) && e.ref === t.ref) if (we = !1, t.pendingProps = r = i, (e.lanes & l) !== 0) e.flags & 131072 && (we = !0);
    else return t.lanes = e.lanes, nt(e, t, l);
  }
  return Ji(e, t, n, r, l);
}
function Tc(e, t, n) {
  var r = t.pendingProps, l = r.children, i = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Q(en, _e), _e |= n;
  else {
    if (!(n & 1073741824)) return e = i !== null ? i.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, Q(en, _e), _e |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = i !== null ? i.baseLanes : n, Q(en, _e), _e |= r;
  }
  else i !== null ? (r = i.baseLanes | n, t.memoizedState = null) : r = n, Q(en, _e), _e |= r;
  return he(e, t, l, n), t.child;
}
function Nc(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function Ji(e, t, n, r, l) {
  var i = xe(n) ? It : pe.current;
  return i = cn(t, i), on(t, l), n = Xo(e, t, n, r, i, l), r = Ko(), e !== null && !we ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, nt(e, t, l)) : (K && r && Io(t), t.flags |= 1, he(e, t, n, l), t.child);
}
function fa(e, t, n, r, l) {
  if (xe(n)) {
    var i = !0;
    ul(t);
  } else i = !1;
  if (on(t, l), t.stateNode === null) Xr(e, t), _c(t, n, r), Gi(t, n, r, l), r = !0;
  else if (e === null) {
    var o = t.stateNode, u = t.memoizedProps;
    o.props = u;
    var a = o.context, s = n.contextType;
    typeof s == "object" && s !== null ? s = Me(s) : (s = xe(n) ? It : pe.current, s = cn(t, s));
    var c = n.getDerivedStateFromProps, d = typeof c == "function" || typeof o.getSnapshotBeforeUpdate == "function";
    d || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (u !== r || a !== s) && ia(t, o, r, s), ot = !1;
    var p = t.memoizedState;
    o.state = p, dl(t, r, o, l), a = t.memoizedState, u !== r || p !== a || Se.current || ot ? (typeof c == "function" && (Ki(t, n, c, r), a = t.memoizedState), (u = ot || la(t, n, u, r, p, a, s)) ? (d || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = a), o.props = r, o.state = a, o.context = s, r = u) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    o = t.stateNode, rc(e, t), u = t.memoizedProps, s = t.type === t.elementType ? u : Fe(t.type, u), o.props = s, d = t.pendingProps, p = o.context, a = n.contextType, typeof a == "object" && a !== null ? a = Me(a) : (a = xe(n) ? It : pe.current, a = cn(t, a));
    var y = n.getDerivedStateFromProps;
    (c = typeof y == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (u !== d || p !== a) && ia(t, o, r, a), ot = !1, p = t.memoizedState, o.state = p, dl(t, r, o, l);
    var v = t.memoizedState;
    u !== d || p !== v || Se.current || ot ? (typeof y == "function" && (Ki(t, n, y, r), v = t.memoizedState), (s = ot || la(t, n, s, r, p, v, a) || !1) ? (c || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, v, a), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, v, a)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || u === e.memoizedProps && p === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || u === e.memoizedProps && p === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = v), o.props = r, o.state = v, o.context = a, r = s) : (typeof o.componentDidUpdate != "function" || u === e.memoizedProps && p === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || u === e.memoizedProps && p === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return qi(e, t, n, r, i, l);
}
function qi(e, t, n, r, l, i) {
  Nc(e, t);
  var o = (t.flags & 128) !== 0;
  if (!r && !o) return l && Zu(t, n, !1), nt(e, t, i);
  r = t.stateNode, Sp.current = t;
  var u = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && o ? (t.child = dn(t, e.child, null, i), t.child = dn(t, null, u, i)) : he(e, t, u, i), t.memoizedState = r.state, l && Zu(t, n, !0), t.child;
}
function jc(e) {
  var t = e.stateNode;
  t.pendingContext ? Gu(e, t.pendingContext, t.pendingContext !== t.context) : t.context && Gu(e, t.context, !1), Wo(e, t.containerInfo);
}
function da(e, t, n, r, l) {
  return fn(), Fo(l), t.flags |= 256, he(e, t, n, r), t.child;
}
var bi = { dehydrated: null, treeContext: null, retryLane: 0 };
function eo(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function Rc(e, t, n) {
  var r = t.pendingProps, l = G.current, i = !1, o = (t.flags & 128) !== 0, u;
  if ((u = o) || (u = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0), u ? (i = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (l |= 1), Q(G, l & 1), e === null)
    return Yi(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (o = r.children, e = r.fallback, i ? (r = t.mode, i = t.child, o = { mode: "hidden", children: o }, !(r & 1) && i !== null ? (i.childLanes = 0, i.pendingProps = o) : i = Rl(o, r, 0, null), e = Mt(e, r, n, null), i.return = t, e.return = t, i.sibling = e, t.child = i, t.child.memoizedState = eo(n), t.memoizedState = bi, e) : Jo(t, o));
  if (l = e.memoizedState, l !== null && (u = l.dehydrated, u !== null)) return xp(e, t, o, r, u, l, n);
  if (i) {
    i = r.fallback, o = t.mode, l = e.child, u = l.sibling;
    var a = { mode: "hidden", children: r.children };
    return !(o & 1) && t.child !== l ? (r = t.child, r.childLanes = 0, r.pendingProps = a, t.deletions = null) : (r = gt(l, a), r.subtreeFlags = l.subtreeFlags & 14680064), u !== null ? i = gt(u, i) : (i = Mt(i, o, n, null), i.flags |= 2), i.return = t, r.return = t, r.sibling = i, t.child = r, r = i, i = t.child, o = e.child.memoizedState, o = o === null ? eo(n) : { baseLanes: o.baseLanes | n, cachePool: null, transitions: o.transitions }, i.memoizedState = o, i.childLanes = e.childLanes & ~n, t.memoizedState = bi, r;
  }
  return i = e.child, e = i.sibling, r = gt(i, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function Jo(e, t) {
  return t = Rl({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function Lr(e, t, n, r) {
  return r !== null && Fo(r), dn(t, e.child, null, n), e = Jo(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function xp(e, t, n, r, l, i, o) {
  if (n)
    return t.flags & 256 ? (t.flags &= -257, r = si(Error(E(422))), Lr(e, t, o, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (i = r.fallback, l = t.mode, r = Rl({ mode: "visible", children: r.children }, l, 0, null), i = Mt(i, l, o, null), i.flags |= 2, r.return = t, i.return = t, r.sibling = i, t.child = r, t.mode & 1 && dn(t, e.child, null, o), t.child.memoizedState = eo(o), t.memoizedState = bi, i);
  if (!(t.mode & 1)) return Lr(e, t, o, null);
  if (l.data === "$!") {
    if (r = l.nextSibling && l.nextSibling.dataset, r) var u = r.dgst;
    return r = u, i = Error(E(419)), r = si(i, r, void 0), Lr(e, t, o, r);
  }
  if (u = (o & e.childLanes) !== 0, we || u) {
    if (r = ie, r !== null) {
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
      l = l & (r.suspendedLanes | o) ? 0 : l, l !== 0 && l !== i.retryLane && (i.retryLane = l, tt(e, l), Be(r, e, l, -1));
    }
    return ru(), r = si(Error(E(421))), Lr(e, t, o, r);
  }
  return l.data === "$?" ? (t.flags |= 128, t.child = e.child, t = Mp.bind(null, e), l._reactRetry = t, null) : (e = i.treeContext, Ce = ht(l.nextSibling), Pe = t, K = !0, Ue = null, e !== null && (je[Re++] = Ze, je[Re++] = Je, je[Re++] = $t, Ze = e.id, Je = e.overflow, $t = t), t = Jo(t, r.children), t.flags |= 4096, t);
}
function pa(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), Xi(e.return, t, n);
}
function ci(e, t, n, r, l) {
  var i = e.memoizedState;
  i === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: l } : (i.isBackwards = t, i.rendering = null, i.renderingStartTime = 0, i.last = r, i.tail = n, i.tailMode = l);
}
function Lc(e, t, n) {
  var r = t.pendingProps, l = r.revealOrder, i = r.tail;
  if (he(e, t, r.children, n), r = G.current, r & 2) r = r & 1 | 2, t.flags |= 128;
  else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && pa(e, n, t);
      else if (e.tag === 19) pa(e, n, t);
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
  if (Q(G, r), !(t.mode & 1)) t.memoizedState = null;
  else switch (l) {
    case "forwards":
      for (n = t.child, l = null; n !== null; ) e = n.alternate, e !== null && pl(e) === null && (l = n), n = n.sibling;
      n = l, n === null ? (l = t.child, t.child = null) : (l = n.sibling, n.sibling = null), ci(t, !1, l, n, i);
      break;
    case "backwards":
      for (n = null, l = t.child, t.child = null; l !== null; ) {
        if (e = l.alternate, e !== null && pl(e) === null) {
          t.child = l;
          break;
        }
        e = l.sibling, l.sibling = n, n = l, l = e;
      }
      ci(t, !0, n, null, i);
      break;
    case "together":
      ci(t, !1, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function Xr(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
}
function nt(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), Ot |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(E(153));
  if (t.child !== null) {
    for (e = t.child, n = gt(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = gt(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function kp(e, t, n) {
  switch (t.tag) {
    case 3:
      jc(t), fn();
      break;
    case 5:
      lc(t);
      break;
    case 1:
      xe(t.type) && ul(t);
      break;
    case 4:
      Wo(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, l = t.memoizedProps.value;
      Q(cl, r._currentValue), r._currentValue = l;
      break;
    case 13:
      if (r = t.memoizedState, r !== null)
        return r.dehydrated !== null ? (Q(G, G.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? Rc(e, t, n) : (Q(G, G.current & 1), e = nt(e, t, n), e !== null ? e.sibling : null);
      Q(G, G.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return Lc(e, t, n);
        t.flags |= 128;
      }
      if (l = t.memoizedState, l !== null && (l.rendering = null, l.tail = null, l.lastEffect = null), Q(G, G.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, Tc(e, t, n);
  }
  return nt(e, t, n);
}
var Dc, to, Mc, Ic;
Dc = function(e, t) {
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
to = function() {
};
Mc = function(e, t, n, r) {
  var l = e.memoizedProps;
  if (l !== r) {
    e = t.stateNode, Lt(Xe.current);
    var i = null;
    switch (n) {
      case "input":
        l = Ei(e, l), r = Ei(e, r), i = [];
        break;
      case "select":
        l = J({}, l, { value: void 0 }), r = J({}, r, { value: void 0 }), i = [];
        break;
      case "textarea":
        l = Pi(e, l), r = Pi(e, r), i = [];
        break;
      default:
        typeof l.onClick != "function" && typeof r.onClick == "function" && (e.onclick = il);
    }
    Ti(n, r);
    var o;
    n = null;
    for (s in l) if (!r.hasOwnProperty(s) && l.hasOwnProperty(s) && l[s] != null) if (s === "style") {
      var u = l[s];
      for (o in u) u.hasOwnProperty(o) && (n || (n = {}), n[o] = "");
    } else s !== "dangerouslySetInnerHTML" && s !== "children" && s !== "suppressContentEditableWarning" && s !== "suppressHydrationWarning" && s !== "autoFocus" && (Kn.hasOwnProperty(s) ? i || (i = []) : (i = i || []).push(s, null));
    for (s in r) {
      var a = r[s];
      if (u = l != null ? l[s] : void 0, r.hasOwnProperty(s) && a !== u && (a != null || u != null)) if (s === "style") if (u) {
        for (o in u) !u.hasOwnProperty(o) || a && a.hasOwnProperty(o) || (n || (n = {}), n[o] = "");
        for (o in a) a.hasOwnProperty(o) && u[o] !== a[o] && (n || (n = {}), n[o] = a[o]);
      } else n || (i || (i = []), i.push(
        s,
        n
      )), n = a;
      else s === "dangerouslySetInnerHTML" ? (a = a ? a.__html : void 0, u = u ? u.__html : void 0, a != null && u !== a && (i = i || []).push(s, a)) : s === "children" ? typeof a != "string" && typeof a != "number" || (i = i || []).push(s, "" + a) : s !== "suppressContentEditableWarning" && s !== "suppressHydrationWarning" && (Kn.hasOwnProperty(s) ? (a != null && s === "onScroll" && Y("scroll", e), i || u === a || (i = [])) : (i = i || []).push(s, a));
    }
    n && (i = i || []).push("style", n);
    var s = i;
    (t.updateQueue = s) && (t.flags |= 4);
  }
};
Ic = function(e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function Rn(e, t) {
  if (!K) switch (e.tailMode) {
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
function fe(e) {
  var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
  if (t) for (var l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags & 14680064, r |= l.flags & 14680064, l.return = e, l = l.sibling;
  else for (l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags, r |= l.flags, l.return = e, l = l.sibling;
  return e.subtreeFlags |= r, e.childLanes = n, t;
}
function Ep(e, t, n) {
  var r = t.pendingProps;
  switch ($o(t), t.tag) {
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
      return fe(t), null;
    case 1:
      return xe(t.type) && ol(), fe(t), null;
    case 3:
      return r = t.stateNode, pn(), X(Se), X(pe), Qo(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (jr(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Ue !== null && (so(Ue), Ue = null))), to(e, t), fe(t), null;
    case 5:
      Ho(t);
      var l = Lt(or.current);
      if (n = t.type, e !== null && t.stateNode != null) Mc(e, t, n, r, l), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(E(166));
          return fe(t), null;
        }
        if (e = Lt(Xe.current), jr(t)) {
          r = t.stateNode, n = t.type;
          var i = t.memoizedProps;
          switch (r[Qe] = t, r[lr] = i, e = (t.mode & 1) !== 0, n) {
            case "dialog":
              Y("cancel", r), Y("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              Y("load", r);
              break;
            case "video":
            case "audio":
              for (l = 0; l < On.length; l++) Y(On[l], r);
              break;
            case "source":
              Y("error", r);
              break;
            case "img":
            case "image":
            case "link":
              Y(
                "error",
                r
              ), Y("load", r);
              break;
            case "details":
              Y("toggle", r);
              break;
            case "input":
              ku(r, i), Y("invalid", r);
              break;
            case "select":
              r._wrapperState = { wasMultiple: !!i.multiple }, Y("invalid", r);
              break;
            case "textarea":
              _u(r, i), Y("invalid", r);
          }
          Ti(n, i), l = null;
          for (var o in i) if (i.hasOwnProperty(o)) {
            var u = i[o];
            o === "children" ? typeof u == "string" ? r.textContent !== u && (i.suppressHydrationWarning !== !0 && Nr(r.textContent, u, e), l = ["children", u]) : typeof u == "number" && r.textContent !== "" + u && (i.suppressHydrationWarning !== !0 && Nr(
              r.textContent,
              u,
              e
            ), l = ["children", "" + u]) : Kn.hasOwnProperty(o) && u != null && o === "onScroll" && Y("scroll", r);
          }
          switch (n) {
            case "input":
              xr(r), Eu(r, i, !0);
              break;
            case "textarea":
              xr(r), Cu(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof i.onClick == "function" && (r.onclick = il);
          }
          r = l, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          o = l.nodeType === 9 ? l : l.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = ss(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = o.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = o.createElement(n, { is: r.is }) : (e = o.createElement(n), n === "select" && (o = e, r.multiple ? o.multiple = !0 : r.size && (o.size = r.size))) : e = o.createElementNS(e, n), e[Qe] = t, e[lr] = r, Dc(e, t, !1, !1), t.stateNode = e;
          e: {
            switch (o = Ni(n, r), n) {
              case "dialog":
                Y("cancel", e), Y("close", e), l = r;
                break;
              case "iframe":
              case "object":
              case "embed":
                Y("load", e), l = r;
                break;
              case "video":
              case "audio":
                for (l = 0; l < On.length; l++) Y(On[l], e);
                l = r;
                break;
              case "source":
                Y("error", e), l = r;
                break;
              case "img":
              case "image":
              case "link":
                Y(
                  "error",
                  e
                ), Y("load", e), l = r;
                break;
              case "details":
                Y("toggle", e), l = r;
                break;
              case "input":
                ku(e, r), l = Ei(e, r), Y("invalid", e);
                break;
              case "option":
                l = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, l = J({}, r, { value: void 0 }), Y("invalid", e);
                break;
              case "textarea":
                _u(e, r), l = Pi(e, r), Y("invalid", e);
                break;
              default:
                l = r;
            }
            Ti(n, l), u = l;
            for (i in u) if (u.hasOwnProperty(i)) {
              var a = u[i];
              i === "style" ? ds(e, a) : i === "dangerouslySetInnerHTML" ? (a = a ? a.__html : void 0, a != null && cs(e, a)) : i === "children" ? typeof a == "string" ? (n !== "textarea" || a !== "") && Gn(e, a) : typeof a == "number" && Gn(e, "" + a) : i !== "suppressContentEditableWarning" && i !== "suppressHydrationWarning" && i !== "autoFocus" && (Kn.hasOwnProperty(i) ? a != null && i === "onScroll" && Y("scroll", e) : a != null && xo(e, i, a, o));
            }
            switch (n) {
              case "input":
                xr(e), Eu(e, r, !1);
                break;
              case "textarea":
                xr(e), Cu(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + wt(r.value));
                break;
              case "select":
                e.multiple = !!r.multiple, i = r.value, i != null ? tn(e, !!r.multiple, i, !1) : r.defaultValue != null && tn(
                  e,
                  !!r.multiple,
                  r.defaultValue,
                  !0
                );
                break;
              default:
                typeof l.onClick == "function" && (e.onclick = il);
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
      return fe(t), null;
    case 6:
      if (e && t.stateNode != null) Ic(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(E(166));
        if (n = Lt(or.current), Lt(Xe.current), jr(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[Qe] = t, (i = r.nodeValue !== n) && (e = Pe, e !== null)) switch (e.tag) {
            case 3:
              Nr(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && Nr(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          i && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[Qe] = t, t.stateNode = r;
      }
      return fe(t), null;
    case 13:
      if (X(G), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (K && Ce !== null && t.mode & 1 && !(t.flags & 128)) bs(), fn(), t.flags |= 98560, i = !1;
        else if (i = jr(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!i) throw Error(E(318));
            if (i = t.memoizedState, i = i !== null ? i.dehydrated : null, !i) throw Error(E(317));
            i[Qe] = t;
          } else fn(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          fe(t), i = !1;
        } else Ue !== null && (so(Ue), Ue = null), i = !0;
        if (!i) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || G.current & 1 ? re === 0 && (re = 3) : ru())), t.updateQueue !== null && (t.flags |= 4), fe(t), null);
    case 4:
      return pn(), to(e, t), e === null && nr(t.stateNode.containerInfo), fe(t), null;
    case 10:
      return Ao(t.type._context), fe(t), null;
    case 17:
      return xe(t.type) && ol(), fe(t), null;
    case 19:
      if (X(G), i = t.memoizedState, i === null) return fe(t), null;
      if (r = (t.flags & 128) !== 0, o = i.rendering, o === null) if (r) Rn(i, !1);
      else {
        if (re !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (o = pl(e), o !== null) {
            for (t.flags |= 128, Rn(i, !1), r = o.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) i = n, e = r, i.flags &= 14680066, o = i.alternate, o === null ? (i.childLanes = 0, i.lanes = e, i.child = null, i.subtreeFlags = 0, i.memoizedProps = null, i.memoizedState = null, i.updateQueue = null, i.dependencies = null, i.stateNode = null) : (i.childLanes = o.childLanes, i.lanes = o.lanes, i.child = o.child, i.subtreeFlags = 0, i.deletions = null, i.memoizedProps = o.memoizedProps, i.memoizedState = o.memoizedState, i.updateQueue = o.updateQueue, i.type = o.type, e = o.dependencies, i.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return Q(G, G.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        i.tail !== null && ee() > mn && (t.flags |= 128, r = !0, Rn(i, !1), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = pl(o), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), Rn(i, !0), i.tail === null && i.tailMode === "hidden" && !o.alternate && !K) return fe(t), null;
        } else 2 * ee() - i.renderingStartTime > mn && n !== 1073741824 && (t.flags |= 128, r = !0, Rn(i, !1), t.lanes = 4194304);
        i.isBackwards ? (o.sibling = t.child, t.child = o) : (n = i.last, n !== null ? n.sibling = o : t.child = o, i.last = o);
      }
      return i.tail !== null ? (t = i.tail, i.rendering = t, i.tail = t.sibling, i.renderingStartTime = ee(), t.sibling = null, n = G.current, Q(G, r ? n & 1 | 2 : n & 1), t) : (fe(t), null);
    case 22:
    case 23:
      return nu(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? _e & 1073741824 && (fe(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : fe(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(E(156, t.tag));
}
function _p(e, t) {
  switch ($o(t), t.tag) {
    case 1:
      return xe(t.type) && ol(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return pn(), X(Se), X(pe), Qo(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return Ho(t), null;
    case 13:
      if (X(G), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(E(340));
        fn();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return X(G), null;
    case 4:
      return pn(), null;
    case 10:
      return Ao(t.type._context), null;
    case 22:
    case 23:
      return nu(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var Dr = !1, de = !1, Cp = typeof WeakSet == "function" ? WeakSet : Set, T = null;
function bt(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    q(e, t, r);
  }
  else n.current = null;
}
function no(e, t, n) {
  try {
    n();
  } catch (r) {
    q(e, t, r);
  }
}
var ha = !1;
function Pp(e, t) {
  if (Ui = nl, e = As(), Mo(e)) {
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
        var o = 0, u = -1, a = -1, s = 0, c = 0, d = e, p = null;
        t: for (; ; ) {
          for (var y; d !== n || l !== 0 && d.nodeType !== 3 || (u = o + l), d !== i || r !== 0 && d.nodeType !== 3 || (a = o + r), d.nodeType === 3 && (o += d.nodeValue.length), (y = d.firstChild) !== null; )
            p = d, d = y;
          for (; ; ) {
            if (d === e) break t;
            if (p === n && ++s === l && (u = o), p === i && ++c === r && (a = o), (y = d.nextSibling) !== null) break;
            d = p, p = d.parentNode;
          }
          d = y;
        }
        n = u === -1 || a === -1 ? null : { start: u, end: a };
      } else n = null;
    }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (Ai = { focusedElem: e, selectionRange: n }, nl = !1, T = t; T !== null; ) if (t = T, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, T = e;
  else for (; T !== null; ) {
    t = T;
    try {
      var v = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (v !== null) {
            var k = v.memoizedProps, N = v.memoizedState, h = t.stateNode, f = h.getSnapshotBeforeUpdate(t.elementType === t.type ? k : Fe(t.type, k), N);
            h.__reactInternalSnapshotBeforeUpdate = f;
          }
          break;
        case 3:
          var m = t.stateNode.containerInfo;
          m.nodeType === 1 ? m.textContent = "" : m.nodeType === 9 && m.documentElement && m.removeChild(m.documentElement);
          break;
        case 5:
        case 6:
        case 4:
        case 17:
          break;
        default:
          throw Error(E(163));
      }
    } catch (x) {
      q(t, t.return, x);
    }
    if (e = t.sibling, e !== null) {
      e.return = t.return, T = e;
      break;
    }
    T = t.return;
  }
  return v = ha, ha = !1, v;
}
function Qn(e, t, n) {
  var r = t.updateQueue;
  if (r = r !== null ? r.lastEffect : null, r !== null) {
    var l = r = r.next;
    do {
      if ((l.tag & e) === e) {
        var i = l.destroy;
        l.destroy = void 0, i !== void 0 && no(t, n, i);
      }
      l = l.next;
    } while (l !== r);
  }
}
function Nl(e, t) {
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
function ro(e) {
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
function $c(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, $c(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Qe], delete t[lr], delete t[Wi], delete t[ap], delete t[sp])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function Fc(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function ma(e) {
  e: for (; ; ) {
    for (; e.sibling === null; ) {
      if (e.return === null || Fc(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      e.child.return = e, e = e.child;
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function lo(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = il));
  else if (r !== 4 && (e = e.child, e !== null)) for (lo(e, t, n), e = e.sibling; e !== null; ) lo(e, t, n), e = e.sibling;
}
function io(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child, e !== null)) for (io(e, t, n), e = e.sibling; e !== null; ) io(e, t, n), e = e.sibling;
}
var ue = null, Oe = !1;
function lt(e, t, n) {
  for (n = n.child; n !== null; ) Oc(e, t, n), n = n.sibling;
}
function Oc(e, t, n) {
  if (Ye && typeof Ye.onCommitFiberUnmount == "function") try {
    Ye.onCommitFiberUnmount(xl, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      de || bt(n, t);
    case 6:
      var r = ue, l = Oe;
      ue = null, lt(e, t, n), ue = r, Oe = l, ue !== null && (Oe ? (e = ue, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : ue.removeChild(n.stateNode));
      break;
    case 18:
      ue !== null && (Oe ? (e = ue, n = n.stateNode, e.nodeType === 8 ? ri(e.parentNode, n) : e.nodeType === 1 && ri(e, n), bn(e)) : ri(ue, n.stateNode));
      break;
    case 4:
      r = ue, l = Oe, ue = n.stateNode.containerInfo, Oe = !0, lt(e, t, n), ue = r, Oe = l;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!de && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        l = r = r.next;
        do {
          var i = l, o = i.destroy;
          i = i.tag, o !== void 0 && (i & 2 || i & 4) && no(n, t, o), l = l.next;
        } while (l !== r);
      }
      lt(e, t, n);
      break;
    case 1:
      if (!de && (bt(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
        r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
      } catch (u) {
        q(n, t, u);
      }
      lt(e, t, n);
      break;
    case 21:
      lt(e, t, n);
      break;
    case 22:
      n.mode & 1 ? (de = (r = de) || n.memoizedState !== null, lt(e, t, n), de = r) : lt(e, t, n);
      break;
    default:
      lt(e, t, n);
  }
}
function va(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new Cp()), t.forEach(function(r) {
      var l = Ip.bind(null, e, r);
      n.has(r) || (n.add(r), r.then(l, l));
    });
  }
}
function $e(e, t) {
  var n = t.deletions;
  if (n !== null) for (var r = 0; r < n.length; r++) {
    var l = n[r];
    try {
      var i = e, o = t, u = o;
      e: for (; u !== null; ) {
        switch (u.tag) {
          case 5:
            ue = u.stateNode, Oe = !1;
            break e;
          case 3:
            ue = u.stateNode.containerInfo, Oe = !0;
            break e;
          case 4:
            ue = u.stateNode.containerInfo, Oe = !0;
            break e;
        }
        u = u.return;
      }
      if (ue === null) throw Error(E(160));
      Oc(i, o, l), ue = null, Oe = !1;
      var a = l.alternate;
      a !== null && (a.return = null), l.return = null;
    } catch (s) {
      q(l, t, s);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) Uc(t, e), t = t.sibling;
}
function Uc(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ($e(t, e), We(e), r & 4) {
        try {
          Qn(3, e, e.return), Nl(3, e);
        } catch (k) {
          q(e, e.return, k);
        }
        try {
          Qn(5, e, e.return);
        } catch (k) {
          q(e, e.return, k);
        }
      }
      break;
    case 1:
      $e(t, e), We(e), r & 512 && n !== null && bt(n, n.return);
      break;
    case 5:
      if ($e(t, e), We(e), r & 512 && n !== null && bt(n, n.return), e.flags & 32) {
        var l = e.stateNode;
        try {
          Gn(l, "");
        } catch (k) {
          q(e, e.return, k);
        }
      }
      if (r & 4 && (l = e.stateNode, l != null)) {
        var i = e.memoizedProps, o = n !== null ? n.memoizedProps : i, u = e.type, a = e.updateQueue;
        if (e.updateQueue = null, a !== null) try {
          u === "input" && i.type === "radio" && i.name != null && us(l, i), Ni(u, o);
          var s = Ni(u, i);
          for (o = 0; o < a.length; o += 2) {
            var c = a[o], d = a[o + 1];
            c === "style" ? ds(l, d) : c === "dangerouslySetInnerHTML" ? cs(l, d) : c === "children" ? Gn(l, d) : xo(l, c, d, s);
          }
          switch (u) {
            case "input":
              _i(l, i);
              break;
            case "textarea":
              as(l, i);
              break;
            case "select":
              var p = l._wrapperState.wasMultiple;
              l._wrapperState.wasMultiple = !!i.multiple;
              var y = i.value;
              y != null ? tn(l, !!i.multiple, y, !1) : p !== !!i.multiple && (i.defaultValue != null ? tn(
                l,
                !!i.multiple,
                i.defaultValue,
                !0
              ) : tn(l, !!i.multiple, i.multiple ? [] : "", !1));
          }
          l[lr] = i;
        } catch (k) {
          q(e, e.return, k);
        }
      }
      break;
    case 6:
      if ($e(t, e), We(e), r & 4) {
        if (e.stateNode === null) throw Error(E(162));
        l = e.stateNode, i = e.memoizedProps;
        try {
          l.nodeValue = i;
        } catch (k) {
          q(e, e.return, k);
        }
      }
      break;
    case 3:
      if ($e(t, e), We(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        bn(t.containerInfo);
      } catch (k) {
        q(e, e.return, k);
      }
      break;
    case 4:
      $e(t, e), We(e);
      break;
    case 13:
      $e(t, e), We(e), l = e.child, l.flags & 8192 && (i = l.memoizedState !== null, l.stateNode.isHidden = i, !i || l.alternate !== null && l.alternate.memoizedState !== null || (eu = ee())), r & 4 && va(e);
      break;
    case 22:
      if (c = n !== null && n.memoizedState !== null, e.mode & 1 ? (de = (s = de) || c, $e(t, e), de = s) : $e(t, e), We(e), r & 8192) {
        if (s = e.memoizedState !== null, (e.stateNode.isHidden = s) && !c && e.mode & 1) for (T = e, c = e.child; c !== null; ) {
          for (d = T = c; T !== null; ) {
            switch (p = T, y = p.child, p.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                Qn(4, p, p.return);
                break;
              case 1:
                bt(p, p.return);
                var v = p.stateNode;
                if (typeof v.componentWillUnmount == "function") {
                  r = p, n = p.return;
                  try {
                    t = r, v.props = t.memoizedProps, v.state = t.memoizedState, v.componentWillUnmount();
                  } catch (k) {
                    q(r, n, k);
                  }
                }
                break;
              case 5:
                bt(p, p.return);
                break;
              case 22:
                if (p.memoizedState !== null) {
                  ga(d);
                  continue;
                }
            }
            y !== null ? (y.return = p, T = y) : ga(d);
          }
          c = c.sibling;
        }
        e: for (c = null, d = e; ; ) {
          if (d.tag === 5) {
            if (c === null) {
              c = d;
              try {
                l = d.stateNode, s ? (i = l.style, typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none") : (u = d.stateNode, a = d.memoizedProps.style, o = a != null && a.hasOwnProperty("display") ? a.display : null, u.style.display = fs("display", o));
              } catch (k) {
                q(e, e.return, k);
              }
            }
          } else if (d.tag === 6) {
            if (c === null) try {
              d.stateNode.nodeValue = s ? "" : d.memoizedProps;
            } catch (k) {
              q(e, e.return, k);
            }
          } else if ((d.tag !== 22 && d.tag !== 23 || d.memoizedState === null || d === e) && d.child !== null) {
            d.child.return = d, d = d.child;
            continue;
          }
          if (d === e) break e;
          for (; d.sibling === null; ) {
            if (d.return === null || d.return === e) break e;
            c === d && (c = null), d = d.return;
          }
          c === d && (c = null), d.sibling.return = d.return, d = d.sibling;
        }
      }
      break;
    case 19:
      $e(t, e), We(e), r & 4 && va(e);
      break;
    case 21:
      break;
    default:
      $e(
        t,
        e
      ), We(e);
  }
}
function We(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (Fc(n)) {
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
          r.flags & 32 && (Gn(l, ""), r.flags &= -33);
          var i = ma(e);
          io(e, i, l);
          break;
        case 3:
        case 4:
          var o = r.stateNode.containerInfo, u = ma(e);
          lo(e, u, o);
          break;
        default:
          throw Error(E(161));
      }
    } catch (a) {
      q(e, e.return, a);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function zp(e, t, n) {
  T = e, Ac(e);
}
function Ac(e, t, n) {
  for (var r = (e.mode & 1) !== 0; T !== null; ) {
    var l = T, i = l.child;
    if (l.tag === 22 && r) {
      var o = l.memoizedState !== null || Dr;
      if (!o) {
        var u = l.alternate, a = u !== null && u.memoizedState !== null || de;
        u = Dr;
        var s = de;
        if (Dr = o, (de = a) && !s) for (T = l; T !== null; ) o = T, a = o.child, o.tag === 22 && o.memoizedState !== null ? wa(l) : a !== null ? (a.return = o, T = a) : wa(l);
        for (; i !== null; ) T = i, Ac(i), i = i.sibling;
        T = l, Dr = u, de = s;
      }
      ya(e);
    } else l.subtreeFlags & 8772 && i !== null ? (i.return = l, T = i) : ya(e);
  }
}
function ya(e) {
  for (; T !== null; ) {
    var t = T;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            de || Nl(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !de) if (n === null) r.componentDidMount();
            else {
              var l = t.elementType === t.type ? n.memoizedProps : Fe(t.type, n.memoizedProps);
              r.componentDidUpdate(l, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var i = t.updateQueue;
            i !== null && ta(t, i, r);
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
              ta(t, o, n);
            }
            break;
          case 5:
            var u = t.stateNode;
            if (n === null && t.flags & 4) {
              n = u;
              var a = t.memoizedProps;
              switch (t.type) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  a.autoFocus && n.focus();
                  break;
                case "img":
                  a.src && (n.src = a.src);
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
              var s = t.alternate;
              if (s !== null) {
                var c = s.memoizedState;
                if (c !== null) {
                  var d = c.dehydrated;
                  d !== null && bn(d);
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
        de || t.flags & 512 && ro(t);
      } catch (p) {
        q(t, t.return, p);
      }
    }
    if (t === e) {
      T = null;
      break;
    }
    if (n = t.sibling, n !== null) {
      n.return = t.return, T = n;
      break;
    }
    T = t.return;
  }
}
function ga(e) {
  for (; T !== null; ) {
    var t = T;
    if (t === e) {
      T = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      n.return = t.return, T = n;
      break;
    }
    T = t.return;
  }
}
function wa(e) {
  for (; T !== null; ) {
    var t = T;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            Nl(4, t);
          } catch (a) {
            q(t, n, a);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var l = t.return;
            try {
              r.componentDidMount();
            } catch (a) {
              q(t, l, a);
            }
          }
          var i = t.return;
          try {
            ro(t);
          } catch (a) {
            q(t, i, a);
          }
          break;
        case 5:
          var o = t.return;
          try {
            ro(t);
          } catch (a) {
            q(t, o, a);
          }
      }
    } catch (a) {
      q(t, t.return, a);
    }
    if (t === e) {
      T = null;
      break;
    }
    var u = t.sibling;
    if (u !== null) {
      u.return = t.return, T = u;
      break;
    }
    T = t.return;
  }
}
var Tp = Math.ceil, vl = rt.ReactCurrentDispatcher, qo = rt.ReactCurrentOwner, De = rt.ReactCurrentBatchConfig, B = 0, ie = null, te = null, ae = 0, _e = 0, en = kt(0), re = 0, cr = null, Ot = 0, jl = 0, bo = 0, Yn = null, ge = null, eu = 0, mn = 1 / 0, Ke = null, yl = !1, oo = null, vt = null, Mr = !1, ct = null, gl = 0, Xn = 0, uo = null, Kr = -1, Gr = 0;
function me() {
  return B & 6 ? ee() : Kr !== -1 ? Kr : Kr = ee();
}
function yt(e) {
  return e.mode & 1 ? B & 2 && ae !== 0 ? ae & -ae : fp.transition !== null ? (Gr === 0 && (Gr = _s()), Gr) : (e = H, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Rs(e.type)), e) : 1;
}
function Be(e, t, n, r) {
  if (50 < Xn) throw Xn = 0, uo = null, Error(E(185));
  dr(e, n, r), (!(B & 2) || e !== ie) && (e === ie && (!(B & 2) && (jl |= n), re === 4 && at(e, ae)), ke(e, r), n === 1 && B === 0 && !(t.mode & 1) && (mn = ee() + 500, Pl && Et()));
}
function ke(e, t) {
  var n = e.callbackNode;
  fd(e, t);
  var r = tl(e, e === ie ? ae : 0);
  if (r === 0) n !== null && Tu(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && Tu(n), t === 1) e.tag === 0 ? cp(Sa.bind(null, e)) : Zs(Sa.bind(null, e)), op(function() {
      !(B & 6) && Et();
    }), n = null;
    else {
      switch (Cs(r)) {
        case 1:
          n = Po;
          break;
        case 4:
          n = ks;
          break;
        case 16:
          n = el;
          break;
        case 536870912:
          n = Es;
          break;
        default:
          n = el;
      }
      n = Kc(n, Bc.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function Bc(e, t) {
  if (Kr = -1, Gr = 0, B & 6) throw Error(E(327));
  var n = e.callbackNode;
  if (un() && e.callbackNode !== n) return null;
  var r = tl(e, e === ie ? ae : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = wl(e, r);
  else {
    t = r;
    var l = B;
    B |= 2;
    var i = Wc();
    (ie !== e || ae !== t) && (Ke = null, mn = ee() + 500, Dt(e, t));
    do
      try {
        Rp();
        break;
      } catch (u) {
        Vc(e, u);
      }
    while (!0);
    Uo(), vl.current = i, B = l, te !== null ? t = 0 : (ie = null, ae = 0, t = re);
  }
  if (t !== 0) {
    if (t === 2 && (l = Mi(e), l !== 0 && (r = l, t = ao(e, l))), t === 1) throw n = cr, Dt(e, 0), at(e, r), ke(e, ee()), n;
    if (t === 6) at(e, r);
    else {
      if (l = e.current.alternate, !(r & 30) && !Np(l) && (t = wl(e, r), t === 2 && (i = Mi(e), i !== 0 && (r = i, t = ao(e, i))), t === 1)) throw n = cr, Dt(e, 0), at(e, r), ke(e, ee()), n;
      switch (e.finishedWork = l, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(E(345));
        case 2:
          Nt(e, ge, Ke);
          break;
        case 3:
          if (at(e, r), (r & 130023424) === r && (t = eu + 500 - ee(), 10 < t)) {
            if (tl(e, 0) !== 0) break;
            if (l = e.suspendedLanes, (l & r) !== r) {
              me(), e.pingedLanes |= e.suspendedLanes & l;
              break;
            }
            e.timeoutHandle = Vi(Nt.bind(null, e, ge, Ke), t);
            break;
          }
          Nt(e, ge, Ke);
          break;
        case 4:
          if (at(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, l = -1; 0 < r; ) {
            var o = 31 - Ae(r);
            i = 1 << o, o = t[o], o > l && (l = o), r &= ~i;
          }
          if (r = l, r = ee() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * Tp(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = Vi(Nt.bind(null, e, ge, Ke), r);
            break;
          }
          Nt(e, ge, Ke);
          break;
        case 5:
          Nt(e, ge, Ke);
          break;
        default:
          throw Error(E(329));
      }
    }
  }
  return ke(e, ee()), e.callbackNode === n ? Bc.bind(null, e) : null;
}
function ao(e, t) {
  var n = Yn;
  return e.current.memoizedState.isDehydrated && (Dt(e, t).flags |= 256), e = wl(e, t), e !== 2 && (t = ge, ge = n, t !== null && so(t)), e;
}
function so(e) {
  ge === null ? ge = e : ge.push.apply(ge, e);
}
function Np(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
        var l = n[r], i = l.getSnapshot;
        l = l.value;
        try {
          if (!Ve(i(), l)) return !1;
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
function at(e, t) {
  for (t &= ~bo, t &= ~jl, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - Ae(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function Sa(e) {
  if (B & 6) throw Error(E(327));
  un();
  var t = tl(e, 0);
  if (!(t & 1)) return ke(e, ee()), null;
  var n = wl(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Mi(e);
    r !== 0 && (t = r, n = ao(e, r));
  }
  if (n === 1) throw n = cr, Dt(e, 0), at(e, t), ke(e, ee()), n;
  if (n === 6) throw Error(E(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, Nt(e, ge, Ke), ke(e, ee()), null;
}
function tu(e, t) {
  var n = B;
  B |= 1;
  try {
    return e(t);
  } finally {
    B = n, B === 0 && (mn = ee() + 500, Pl && Et());
  }
}
function Ut(e) {
  ct !== null && ct.tag === 0 && !(B & 6) && un();
  var t = B;
  B |= 1;
  var n = De.transition, r = H;
  try {
    if (De.transition = null, H = 1, e) return e();
  } finally {
    H = r, De.transition = n, B = t, !(B & 6) && Et();
  }
}
function nu() {
  _e = en.current, X(en);
}
function Dt(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, ip(n)), te !== null) for (n = te.return; n !== null; ) {
    var r = n;
    switch ($o(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && ol();
        break;
      case 3:
        pn(), X(Se), X(pe), Qo();
        break;
      case 5:
        Ho(r);
        break;
      case 4:
        pn();
        break;
      case 13:
        X(G);
        break;
      case 19:
        X(G);
        break;
      case 10:
        Ao(r.type._context);
        break;
      case 22:
      case 23:
        nu();
    }
    n = n.return;
  }
  if (ie = e, te = e = gt(e.current, null), ae = _e = t, re = 0, cr = null, bo = jl = Ot = 0, ge = Yn = null, Rt !== null) {
    for (t = 0; t < Rt.length; t++) if (n = Rt[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var l = r.next, i = n.pending;
      if (i !== null) {
        var o = i.next;
        i.next = l, r.next = o;
      }
      n.pending = r;
    }
    Rt = null;
  }
  return e;
}
function Vc(e, t) {
  do {
    var n = te;
    try {
      if (Uo(), Qr.current = ml, hl) {
        for (var r = Z.memoizedState; r !== null; ) {
          var l = r.queue;
          l !== null && (l.pending = null), r = r.next;
        }
        hl = !1;
      }
      if (Ft = 0, le = ne = Z = null, Hn = !1, ur = 0, qo.current = null, n === null || n.return === null) {
        re = 1, cr = t, te = null;
        break;
      }
      e: {
        var i = e, o = n.return, u = n, a = t;
        if (t = ae, u.flags |= 32768, a !== null && typeof a == "object" && typeof a.then == "function") {
          var s = a, c = u, d = c.tag;
          if (!(c.mode & 1) && (d === 0 || d === 11 || d === 15)) {
            var p = c.alternate;
            p ? (c.updateQueue = p.updateQueue, c.memoizedState = p.memoizedState, c.lanes = p.lanes) : (c.updateQueue = null, c.memoizedState = null);
          }
          var y = ua(o);
          if (y !== null) {
            y.flags &= -257, aa(y, o, u, i, t), y.mode & 1 && oa(i, s, t), t = y, a = s;
            var v = t.updateQueue;
            if (v === null) {
              var k = /* @__PURE__ */ new Set();
              k.add(a), t.updateQueue = k;
            } else v.add(a);
            break e;
          } else {
            if (!(t & 1)) {
              oa(i, s, t), ru();
              break e;
            }
            a = Error(E(426));
          }
        } else if (K && u.mode & 1) {
          var N = ua(o);
          if (N !== null) {
            !(N.flags & 65536) && (N.flags |= 256), aa(N, o, u, i, t), Fo(hn(a, u));
            break e;
          }
        }
        i = a = hn(a, u), re !== 4 && (re = 2), Yn === null ? Yn = [i] : Yn.push(i), i = o;
        do {
          switch (i.tag) {
            case 3:
              i.flags |= 65536, t &= -t, i.lanes |= t;
              var h = Cc(i, a, t);
              ea(i, h);
              break e;
            case 1:
              u = a;
              var f = i.type, m = i.stateNode;
              if (!(i.flags & 128) && (typeof f.getDerivedStateFromError == "function" || m !== null && typeof m.componentDidCatch == "function" && (vt === null || !vt.has(m)))) {
                i.flags |= 65536, t &= -t, i.lanes |= t;
                var x = Pc(i, u, t);
                ea(i, x);
                break e;
              }
          }
          i = i.return;
        } while (i !== null);
      }
      Qc(n);
    } catch (S) {
      t = S, te === n && n !== null && (te = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function Wc() {
  var e = vl.current;
  return vl.current = ml, e === null ? ml : e;
}
function ru() {
  (re === 0 || re === 3 || re === 2) && (re = 4), ie === null || !(Ot & 268435455) && !(jl & 268435455) || at(ie, ae);
}
function wl(e, t) {
  var n = B;
  B |= 2;
  var r = Wc();
  (ie !== e || ae !== t) && (Ke = null, Dt(e, t));
  do
    try {
      jp();
      break;
    } catch (l) {
      Vc(e, l);
    }
  while (!0);
  if (Uo(), B = n, vl.current = r, te !== null) throw Error(E(261));
  return ie = null, ae = 0, re;
}
function jp() {
  for (; te !== null; ) Hc(te);
}
function Rp() {
  for (; te !== null && !nd(); ) Hc(te);
}
function Hc(e) {
  var t = Xc(e.alternate, e, _e);
  e.memoizedProps = e.pendingProps, t === null ? Qc(e) : te = t, qo.current = null;
}
function Qc(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = _p(n, t), n !== null) {
        n.flags &= 32767, te = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        re = 6, te = null;
        return;
      }
    } else if (n = Ep(n, t, _e), n !== null) {
      te = n;
      return;
    }
    if (t = t.sibling, t !== null) {
      te = t;
      return;
    }
    te = t = e;
  } while (t !== null);
  re === 0 && (re = 5);
}
function Nt(e, t, n) {
  var r = H, l = De.transition;
  try {
    De.transition = null, H = 1, Lp(e, t, n, r);
  } finally {
    De.transition = l, H = r;
  }
  return null;
}
function Lp(e, t, n, r) {
  do
    un();
  while (ct !== null);
  if (B & 6) throw Error(E(327));
  n = e.finishedWork;
  var l = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(E(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var i = n.lanes | n.childLanes;
  if (dd(e, i), e === ie && (te = ie = null, ae = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || Mr || (Mr = !0, Kc(el, function() {
    return un(), null;
  })), i = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || i) {
    i = De.transition, De.transition = null;
    var o = H;
    H = 1;
    var u = B;
    B |= 4, qo.current = null, Pp(e, n), Uc(n, e), qd(Ai), nl = !!Ui, Ai = Ui = null, e.current = n, zp(n), rd(), B = u, H = o, De.transition = i;
  } else e.current = n;
  if (Mr && (Mr = !1, ct = e, gl = l), i = e.pendingLanes, i === 0 && (vt = null), od(n.stateNode), ke(e, ee()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) l = t[n], r(l.value, { componentStack: l.stack, digest: l.digest });
  if (yl) throw yl = !1, e = oo, oo = null, e;
  return gl & 1 && e.tag !== 0 && un(), i = e.pendingLanes, i & 1 ? e === uo ? Xn++ : (Xn = 0, uo = e) : Xn = 0, Et(), null;
}
function un() {
  if (ct !== null) {
    var e = Cs(gl), t = De.transition, n = H;
    try {
      if (De.transition = null, H = 16 > e ? 16 : e, ct === null) var r = !1;
      else {
        if (e = ct, ct = null, gl = 0, B & 6) throw Error(E(331));
        var l = B;
        for (B |= 4, T = e.current; T !== null; ) {
          var i = T, o = i.child;
          if (T.flags & 16) {
            var u = i.deletions;
            if (u !== null) {
              for (var a = 0; a < u.length; a++) {
                var s = u[a];
                for (T = s; T !== null; ) {
                  var c = T;
                  switch (c.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Qn(8, c, i);
                  }
                  var d = c.child;
                  if (d !== null) d.return = c, T = d;
                  else for (; T !== null; ) {
                    c = T;
                    var p = c.sibling, y = c.return;
                    if ($c(c), c === s) {
                      T = null;
                      break;
                    }
                    if (p !== null) {
                      p.return = y, T = p;
                      break;
                    }
                    T = y;
                  }
                }
              }
              var v = i.alternate;
              if (v !== null) {
                var k = v.child;
                if (k !== null) {
                  v.child = null;
                  do {
                    var N = k.sibling;
                    k.sibling = null, k = N;
                  } while (k !== null);
                }
              }
              T = i;
            }
          }
          if (i.subtreeFlags & 2064 && o !== null) o.return = i, T = o;
          else e: for (; T !== null; ) {
            if (i = T, i.flags & 2048) switch (i.tag) {
              case 0:
              case 11:
              case 15:
                Qn(9, i, i.return);
            }
            var h = i.sibling;
            if (h !== null) {
              h.return = i.return, T = h;
              break e;
            }
            T = i.return;
          }
        }
        var f = e.current;
        for (T = f; T !== null; ) {
          o = T;
          var m = o.child;
          if (o.subtreeFlags & 2064 && m !== null) m.return = o, T = m;
          else e: for (o = f; T !== null; ) {
            if (u = T, u.flags & 2048) try {
              switch (u.tag) {
                case 0:
                case 11:
                case 15:
                  Nl(9, u);
              }
            } catch (S) {
              q(u, u.return, S);
            }
            if (u === o) {
              T = null;
              break e;
            }
            var x = u.sibling;
            if (x !== null) {
              x.return = u.return, T = x;
              break e;
            }
            T = u.return;
          }
        }
        if (B = l, Et(), Ye && typeof Ye.onPostCommitFiberRoot == "function") try {
          Ye.onPostCommitFiberRoot(xl, e);
        } catch {
        }
        r = !0;
      }
      return r;
    } finally {
      H = n, De.transition = t;
    }
  }
  return !1;
}
function xa(e, t, n) {
  t = hn(n, t), t = Cc(e, t, 1), e = mt(e, t, 1), t = me(), e !== null && (dr(e, 1, t), ke(e, t));
}
function q(e, t, n) {
  if (e.tag === 3) xa(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      xa(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (vt === null || !vt.has(r))) {
        e = hn(n, e), e = Pc(t, e, 1), t = mt(t, e, 1), e = me(), t !== null && (dr(t, 1, e), ke(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function Dp(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = me(), e.pingedLanes |= e.suspendedLanes & n, ie === e && (ae & n) === n && (re === 4 || re === 3 && (ae & 130023424) === ae && 500 > ee() - eu ? Dt(e, 0) : bo |= n), ke(e, t);
}
function Yc(e, t) {
  t === 0 && (e.mode & 1 ? (t = _r, _r <<= 1, !(_r & 130023424) && (_r = 4194304)) : t = 1);
  var n = me();
  e = tt(e, t), e !== null && (dr(e, t, n), ke(e, n));
}
function Mp(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), Yc(e, n);
}
function Ip(e, t) {
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
  r !== null && r.delete(t), Yc(e, n);
}
var Xc;
Xc = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || Se.current) we = !0;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return we = !1, kp(e, t, n);
    we = !!(e.flags & 131072);
  }
  else we = !1, K && t.flags & 1048576 && Js(t, sl, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      Xr(e, t), e = t.pendingProps;
      var l = cn(t, pe.current);
      on(t, n), l = Xo(null, t, r, e, l, n);
      var i = Ko();
      return t.flags |= 1, typeof l == "object" && l !== null && typeof l.render == "function" && l.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, xe(r) ? (i = !0, ul(t)) : i = !1, t.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null, Vo(t), l.updater = Tl, t.stateNode = l, l._reactInternals = t, Gi(t, r, e, n), t = qi(null, t, r, !0, i, n)) : (t.tag = 0, K && i && Io(t), he(null, t, l, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (Xr(e, t), e = t.pendingProps, l = r._init, r = l(r._payload), t.type = r, l = t.tag = Fp(r), e = Fe(r, e), l) {
          case 0:
            t = Ji(null, t, r, e, n);
            break e;
          case 1:
            t = fa(null, t, r, e, n);
            break e;
          case 11:
            t = sa(null, t, r, e, n);
            break e;
          case 14:
            t = ca(null, t, r, Fe(r.type, e), n);
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
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Fe(r, l), Ji(e, t, r, l, n);
    case 1:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Fe(r, l), fa(e, t, r, l, n);
    case 3:
      e: {
        if (jc(t), e === null) throw Error(E(387));
        r = t.pendingProps, i = t.memoizedState, l = i.element, rc(e, t), dl(t, r, null, n);
        var o = t.memoizedState;
        if (r = o.element, i.isDehydrated) if (i = { element: r, isDehydrated: !1, cache: o.cache, pendingSuspenseBoundaries: o.pendingSuspenseBoundaries, transitions: o.transitions }, t.updateQueue.baseState = i, t.memoizedState = i, t.flags & 256) {
          l = hn(Error(E(423)), t), t = da(e, t, r, n, l);
          break e;
        } else if (r !== l) {
          l = hn(Error(E(424)), t), t = da(e, t, r, n, l);
          break e;
        } else for (Ce = ht(t.stateNode.containerInfo.firstChild), Pe = t, K = !0, Ue = null, n = tc(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (fn(), r === l) {
            t = nt(e, t, n);
            break e;
          }
          he(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return lc(t), e === null && Yi(t), r = t.type, l = t.pendingProps, i = e !== null ? e.memoizedProps : null, o = l.children, Bi(r, l) ? o = null : i !== null && Bi(r, i) && (t.flags |= 32), Nc(e, t), he(e, t, o, n), t.child;
    case 6:
      return e === null && Yi(t), null;
    case 13:
      return Rc(e, t, n);
    case 4:
      return Wo(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = dn(t, null, r, n) : he(e, t, r, n), t.child;
    case 11:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Fe(r, l), sa(e, t, r, l, n);
    case 7:
      return he(e, t, t.pendingProps, n), t.child;
    case 8:
      return he(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return he(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, l = t.pendingProps, i = t.memoizedProps, o = l.value, Q(cl, r._currentValue), r._currentValue = o, i !== null) if (Ve(i.value, o)) {
          if (i.children === l.children && !Se.current) {
            t = nt(e, t, n);
            break e;
          }
        } else for (i = t.child, i !== null && (i.return = t); i !== null; ) {
          var u = i.dependencies;
          if (u !== null) {
            o = i.child;
            for (var a = u.firstContext; a !== null; ) {
              if (a.context === r) {
                if (i.tag === 1) {
                  a = qe(-1, n & -n), a.tag = 2;
                  var s = i.updateQueue;
                  if (s !== null) {
                    s = s.shared;
                    var c = s.pending;
                    c === null ? a.next = a : (a.next = c.next, c.next = a), s.pending = a;
                  }
                }
                i.lanes |= n, a = i.alternate, a !== null && (a.lanes |= n), Xi(
                  i.return,
                  n,
                  t
                ), u.lanes |= n;
                break;
              }
              a = a.next;
            }
          } else if (i.tag === 10) o = i.type === t.type ? null : i.child;
          else if (i.tag === 18) {
            if (o = i.return, o === null) throw Error(E(341));
            o.lanes |= n, u = o.alternate, u !== null && (u.lanes |= n), Xi(o, n, t), o = i.sibling;
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
        he(e, t, l.children, n), t = t.child;
      }
      return t;
    case 9:
      return l = t.type, r = t.pendingProps.children, on(t, n), l = Me(l), r = r(l), t.flags |= 1, he(e, t, r, n), t.child;
    case 14:
      return r = t.type, l = Fe(r, t.pendingProps), l = Fe(r.type, l), ca(e, t, r, l, n);
    case 15:
      return zc(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Fe(r, l), Xr(e, t), t.tag = 1, xe(r) ? (e = !0, ul(t)) : e = !1, on(t, n), _c(t, r, l), Gi(t, r, l, n), qi(null, t, r, !0, e, n);
    case 19:
      return Lc(e, t, n);
    case 22:
      return Tc(e, t, n);
  }
  throw Error(E(156, t.tag));
};
function Kc(e, t) {
  return xs(e, t);
}
function $p(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function Le(e, t, n, r) {
  return new $p(e, t, n, r);
}
function lu(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function Fp(e) {
  if (typeof e == "function") return lu(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === Eo) return 11;
    if (e === _o) return 14;
  }
  return 2;
}
function gt(e, t) {
  var n = e.alternate;
  return n === null ? (n = Le(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function Zr(e, t, n, r, l, i) {
  var o = 2;
  if (r = e, typeof e == "function") lu(e) && (o = 1);
  else if (typeof e == "string") o = 5;
  else e: switch (e) {
    case Ht:
      return Mt(n.children, l, i, t);
    case ko:
      o = 8, l |= 8;
      break;
    case wi:
      return e = Le(12, n, t, l | 2), e.elementType = wi, e.lanes = i, e;
    case Si:
      return e = Le(13, n, t, l), e.elementType = Si, e.lanes = i, e;
    case xi:
      return e = Le(19, n, t, l), e.elementType = xi, e.lanes = i, e;
    case ls:
      return Rl(n, l, i, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case ns:
          o = 10;
          break e;
        case rs:
          o = 9;
          break e;
        case Eo:
          o = 11;
          break e;
        case _o:
          o = 14;
          break e;
        case it:
          o = 16, r = null;
          break e;
      }
      throw Error(E(130, e == null ? e : typeof e, ""));
  }
  return t = Le(o, n, t, l), t.elementType = e, t.type = r, t.lanes = i, t;
}
function Mt(e, t, n, r) {
  return e = Le(7, e, r, t), e.lanes = n, e;
}
function Rl(e, t, n, r) {
  return e = Le(22, e, r, t), e.elementType = ls, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
}
function fi(e, t, n) {
  return e = Le(6, e, null, t), e.lanes = n, e;
}
function di(e, t, n) {
  return t = Le(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function Op(e, t, n, r, l) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Yl(0), this.expirationTimes = Yl(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Yl(0), this.identifierPrefix = r, this.onRecoverableError = l, this.mutableSourceEagerHydrationData = null;
}
function iu(e, t, n, r, l, i, o, u, a) {
  return e = new Op(e, t, n, u, a), t === 1 ? (t = 1, i === !0 && (t |= 8)) : t = 0, i = Le(3, null, null, t), e.current = i, i.stateNode = e, i.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Vo(i), e;
}
function Up(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: Wt, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function Gc(e) {
  if (!e) return St;
  e = e._reactInternals;
  e: {
    if (Bt(e) !== e || e.tag !== 1) throw Error(E(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (xe(t.type)) {
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
    if (xe(n)) return Gs(e, n, t);
  }
  return t;
}
function Zc(e, t, n, r, l, i, o, u, a) {
  return e = iu(n, r, !0, e, l, i, o, u, a), e.context = Gc(null), n = e.current, r = me(), l = yt(n), i = qe(r, l), i.callback = t ?? null, mt(n, i, l), e.current.lanes = l, dr(e, l, r), ke(e, r), e;
}
function Ll(e, t, n, r) {
  var l = t.current, i = me(), o = yt(l);
  return n = Gc(n), t.context === null ? t.context = n : t.pendingContext = n, t = qe(i, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = mt(l, t, o), e !== null && (Be(e, l, o, i), Hr(e, l, o)), o;
}
function Sl(e) {
  if (e = e.current, !e.child) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function ka(e, t) {
  if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function ou(e, t) {
  ka(e, t), (e = e.alternate) && ka(e, t);
}
function Ap() {
  return null;
}
var Jc = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function uu(e) {
  this._internalRoot = e;
}
Dl.prototype.render = uu.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(E(409));
  Ll(e, t, null, null);
};
Dl.prototype.unmount = uu.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    Ut(function() {
      Ll(null, e, null, null);
    }), t[et] = null;
  }
};
function Dl(e) {
  this._internalRoot = e;
}
Dl.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = Ts();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < ut.length && t !== 0 && t < ut[n].priority; n++) ;
    ut.splice(n, 0, e), n === 0 && js(e);
  }
};
function au(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function Ml(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function Ea() {
}
function Bp(e, t, n, r, l) {
  if (l) {
    if (typeof r == "function") {
      var i = r;
      r = function() {
        var s = Sl(o);
        i.call(s);
      };
    }
    var o = Zc(t, r, e, 0, null, !1, !1, "", Ea);
    return e._reactRootContainer = o, e[et] = o.current, nr(e.nodeType === 8 ? e.parentNode : e), Ut(), o;
  }
  for (; l = e.lastChild; ) e.removeChild(l);
  if (typeof r == "function") {
    var u = r;
    r = function() {
      var s = Sl(a);
      u.call(s);
    };
  }
  var a = iu(e, 0, !1, null, null, !1, !1, "", Ea);
  return e._reactRootContainer = a, e[et] = a.current, nr(e.nodeType === 8 ? e.parentNode : e), Ut(function() {
    Ll(t, a, n, r);
  }), a;
}
function Il(e, t, n, r, l) {
  var i = n._reactRootContainer;
  if (i) {
    var o = i;
    if (typeof l == "function") {
      var u = l;
      l = function() {
        var a = Sl(o);
        u.call(a);
      };
    }
    Ll(t, o, e, l);
  } else o = Bp(n, t, e, l, r);
  return Sl(o);
}
Ps = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Fn(t.pendingLanes);
        n !== 0 && (zo(t, n | 1), ke(t, ee()), !(B & 6) && (mn = ee() + 500, Et()));
      }
      break;
    case 13:
      Ut(function() {
        var r = tt(e, 1);
        if (r !== null) {
          var l = me();
          Be(r, e, 1, l);
        }
      }), ou(e, 1);
  }
};
To = function(e) {
  if (e.tag === 13) {
    var t = tt(e, 134217728);
    if (t !== null) {
      var n = me();
      Be(t, e, 134217728, n);
    }
    ou(e, 134217728);
  }
};
zs = function(e) {
  if (e.tag === 13) {
    var t = yt(e), n = tt(e, t);
    if (n !== null) {
      var r = me();
      Be(n, e, t, r);
    }
    ou(e, t);
  }
};
Ts = function() {
  return H;
};
Ns = function(e, t) {
  var n = H;
  try {
    return H = e, t();
  } finally {
    H = n;
  }
};
Ri = function(e, t, n) {
  switch (t) {
    case "input":
      if (_i(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var l = Cl(r);
            if (!l) throw Error(E(90));
            os(r), _i(r, l);
          }
        }
      }
      break;
    case "textarea":
      as(e, n);
      break;
    case "select":
      t = n.value, t != null && tn(e, !!n.multiple, t, !1);
  }
};
ms = tu;
vs = Ut;
var Vp = { usingClientEntryPoint: !1, Events: [hr, Kt, Cl, ps, hs, tu] }, Ln = { findFiberByHostInstance: jt, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Wp = { bundleType: Ln.bundleType, version: Ln.version, rendererPackageName: Ln.rendererPackageName, rendererConfig: Ln.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: rt.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = ws(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: Ln.findFiberByHostInstance || Ap, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Ir = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Ir.isDisabled && Ir.supportsFiber) try {
    xl = Ir.inject(Wp), Ye = Ir;
  } catch {
  }
}
Te.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Vp;
Te.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!au(t)) throw Error(E(200));
  return Up(e, t, null, n);
};
Te.createRoot = function(e, t) {
  if (!au(e)) throw Error(E(299));
  var n = !1, r = "", l = Jc;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (l = t.onRecoverableError)), t = iu(e, 1, !1, null, null, n, !1, r, l), e[et] = t.current, nr(e.nodeType === 8 ? e.parentNode : e), new uu(t);
};
Te.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function" ? Error(E(188)) : (e = Object.keys(e).join(","), Error(E(268, e)));
  return e = ws(t), e = e === null ? null : e.stateNode, e;
};
Te.flushSync = function(e) {
  return Ut(e);
};
Te.hydrate = function(e, t, n) {
  if (!Ml(t)) throw Error(E(200));
  return Il(null, e, t, !0, n);
};
Te.hydrateRoot = function(e, t, n) {
  if (!au(e)) throw Error(E(405));
  var r = n != null && n.hydratedSources || null, l = !1, i = "", o = Jc;
  if (n != null && (n.unstable_strictMode === !0 && (l = !0), n.identifierPrefix !== void 0 && (i = n.identifierPrefix), n.onRecoverableError !== void 0 && (o = n.onRecoverableError)), t = Zc(t, null, e, 1, n ?? null, l, !1, i, o), e[et] = t.current, nr(e), r) for (e = 0; e < r.length; e++) n = r[e], l = n._getVersion, l = l(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, l] : t.mutableSourceEagerHydrationData.push(
    n,
    l
  );
  return new Dl(t);
};
Te.render = function(e, t, n) {
  if (!Ml(t)) throw Error(E(200));
  return Il(null, e, t, !1, n);
};
Te.unmountComponentAtNode = function(e) {
  if (!Ml(e)) throw Error(E(40));
  return e._reactRootContainer ? (Ut(function() {
    Il(null, null, e, !1, function() {
      e._reactRootContainer = null, e[et] = null;
    });
  }), !0) : !1;
};
Te.unstable_batchedUpdates = tu;
Te.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!Ml(n)) throw Error(E(200));
  if (e == null || e._reactInternals === void 0) throw Error(E(38));
  return Il(e, t, n, !1, r);
};
Te.version = "18.3.1-next-f1338f8080-20240426";
function qc() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(qc);
    } catch (e) {
      console.error(e);
    }
}
qc(), Wa.exports = Te;
var bc = Wa.exports, ef, _a = bc;
ef = _a.createRoot, _a.hydrateRoot;
function Hp(e) {
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
        const u = new Error(o.error.message || "rpc error");
        throw u.code = o.error.code, u.data = o.error.data, u;
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
function Qp(e) {
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
      png: (n = 0, r = 800, l = 600, i = 96, o = !0, u = "qt") => t("render.png", { page: n, w: r, h: l, dpi: i, antialias: o, backend: u }),
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
const Yp = {}, Ca = (e) => {
  let t;
  const n = /* @__PURE__ */ new Set(), r = (c, d) => {
    const p = typeof c == "function" ? c(t) : c;
    if (!Object.is(p, t)) {
      const y = t;
      t = d ?? (typeof p != "object" || p === null) ? p : Object.assign({}, t, p), n.forEach((v) => v(t, y));
    }
  }, l = () => t, a = { setState: r, getState: l, getInitialState: () => s, subscribe: (c) => (n.add(c), () => n.delete(c)), destroy: () => {
    (Yp ? "production" : void 0) !== "production" && console.warn(
      "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
    ), n.clear();
  } }, s = t = e(r, l, a);
  return a;
}, Xp = (e) => e ? Ca(e) : Ca;
var tf = { exports: {} }, nf = {}, rf = { exports: {} }, lf = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var vn = M;
function Kp(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Gp = typeof Object.is == "function" ? Object.is : Kp, Zp = vn.useState, Jp = vn.useEffect, qp = vn.useLayoutEffect, bp = vn.useDebugValue;
function eh(e, t) {
  var n = t(), r = Zp({ inst: { value: n, getSnapshot: t } }), l = r[0].inst, i = r[1];
  return qp(
    function() {
      l.value = n, l.getSnapshot = t, pi(l) && i({ inst: l });
    },
    [e, n, t]
  ), Jp(
    function() {
      return pi(l) && i({ inst: l }), e(function() {
        pi(l) && i({ inst: l });
      });
    },
    [e]
  ), bp(n), n;
}
function pi(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Gp(e, n);
  } catch {
    return !0;
  }
}
function th(e, t) {
  return t();
}
var nh = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? th : eh;
lf.useSyncExternalStore = vn.useSyncExternalStore !== void 0 ? vn.useSyncExternalStore : nh;
rf.exports = lf;
var rh = rf.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var $l = M, lh = rh;
function ih(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var oh = typeof Object.is == "function" ? Object.is : ih, uh = lh.useSyncExternalStore, ah = $l.useRef, sh = $l.useEffect, ch = $l.useMemo, fh = $l.useDebugValue;
nf.useSyncExternalStoreWithSelector = function(e, t, n, r, l) {
  var i = ah(null);
  if (i.current === null) {
    var o = { hasValue: !1, value: null };
    i.current = o;
  } else o = i.current;
  i = ch(
    function() {
      function a(y) {
        if (!s) {
          if (s = !0, c = y, y = r(y), l !== void 0 && o.hasValue) {
            var v = o.value;
            if (l(v, y))
              return d = v;
          }
          return d = y;
        }
        if (v = d, oh(c, y)) return v;
        var k = r(y);
        return l !== void 0 && l(v, k) ? (c = y, v) : (c = y, d = k);
      }
      var s = !1, c, d, p = n === void 0 ? null : n;
      return [
        function() {
          return a(t());
        },
        p === null ? void 0 : function() {
          return a(p());
        }
      ];
    },
    [t, n, r, l]
  );
  var u = uh(e, i[0], i[1]);
  return sh(
    function() {
      o.hasValue = !0, o.value = u;
    },
    [u]
  ), fh(u), u;
};
tf.exports = nf;
var dh = tf.exports;
const ph = /* @__PURE__ */ Va(dh), of = {}, { useDebugValue: hh } = Uf, { useSyncExternalStoreWithSelector: mh } = ph;
let Pa = !1;
const vh = (e) => e;
function yh(e, t = vh, n) {
  (of ? "production" : void 0) !== "production" && n && !Pa && (console.warn(
    "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
  ), Pa = !0);
  const r = mh(
    e.subscribe,
    e.getState,
    e.getServerState || e.getInitialState,
    t,
    n
  );
  return hh(r), r;
}
const za = (e) => {
  (of ? "production" : void 0) !== "production" && typeof e != "function" && console.warn(
    "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
  );
  const t = typeof e == "function" ? Xp(e) : e, n = (r, l) => yh(t, r, l);
  return Object.assign(n, t), n;
}, gh = (e) => e ? za(e) : za;
function wh() {
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
function Sh() {
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
function xh() {
  return typeof window < "u" && window.__TAURI_INTERNALS__ ? Sh() : wh();
}
const Ta = "text/x-vnd.veusz-widget-3", kh = "text/x-vnd.veusz-data-1";
function co(e, t) {
  const n = [];
  for (const r of e.settings) n.push(Na(t, r.name));
  for (const r of e.subgroups) n.push(...co(r, Na(t, r.name)));
  return n;
}
function Na(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
const Eh = 33;
function _h(e, t = xh()) {
  let n = null, r = null;
  return gh((l, i) => {
    const o = async (u) => {
      try {
        return await u();
      } catch (a) {
        l({ error: a.message });
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
      togglePanel: (u) => l((a) => ({ panels: { ...a.panels, [u]: !a.panels[u] } })),
      refreshTree: async () => {
        const u = await o(() => e.doc.tree());
        u && l({ tree: u });
      },
      refreshDatasets: async () => {
        const u = await o(() => e.data.list());
        u && l({ datasets: u });
      },
      refreshUndoState: async () => {
        const u = await o(() => e.doc.canUndo());
        u && l({ canUndo: u.can_undo, canRedo: u.can_redo });
      },
      refreshInsertTargets: async () => {
        const u = i().selected[0] ?? "/", a = await o(() => e.doc.insertTargets(u));
        a && l({ insertTargets: a.targets });
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
        const u = await o(() => e.file.info());
        u && l({ filename: u.path });
      },
      loadRecentFiles: async () => {
        const u = await o(() => e.file.recentList());
        u && l({ recentFiles: u.paths });
      },
      clearRecentFiles: async () => {
        await o(() => e.file.recentClear()), l({ recentFiles: [] });
      },
      newDocument: async (u = "graph") => {
        await o(() => e.doc.new(u)) && (l({ filename: null, selected: [], schema: null, values: {} }), await i().refreshAll());
      },
      openFile: async (u) => {
        const a = await o(() => e.file.open(u));
        a && (l({ filename: a.path, selected: [], schema: null, values: {} }), await Promise.all([
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
        const u = await o(() => e.file.save());
        return (u == null ? void 0 : u.path) ?? null;
      },
      saveFileAs: async (u) => {
        const a = await o(() => e.file.saveAs(u));
        a && (l({ filename: a.path }), i().loadRecentFiles());
      },
      exportFile: async (u, a, s) => {
        const c = await o(() => e.file.export(u, a, s));
        return (c == null ? void 0 : c.path) ?? null;
      },
      select: async (u) => {
        if (l({ selected: u }), i().refreshInsertTargets(), u.length === 0) {
          l({ schema: null, values: {} });
          return;
        }
        if (u.length === 1) {
          const d = u[0], p = uf(i().tree, d);
          if (!p) {
            l({ schema: null, values: {} });
            return;
          }
          const y = await o(() => e.doc.schema(p));
          if (!y) {
            l({ schema: null, values: {} });
            return;
          }
          const v = co(y, d), k = await o(() => e.doc.get(v)) ?? {};
          l({ schema: y, values: k });
          return;
        }
        const a = await o(() => e.doc.commonSchema(u));
        if (!a) {
          l({ schema: null, values: {} });
          return;
        }
        const s = co(a, u[0]), c = await o(() => e.doc.get(s)) ?? {};
        l({ schema: a, values: c });
      },
      setValue: async (u, a) => {
        const s = await o(() => e.doc.set([{ path: u, value: a }]));
        if (!s) return;
        const c = { ...i().values };
        for (const d of s.diffs) c[d.path] = d.new;
        l({ values: c }), await i().refreshUndoState();
      },
      addWidget: async (u, a, s) => {
        const c = await o(() => e.doc.add(u, a, s));
        return await i().refreshTree(), await i().refreshUndoState(), (c == null ? void 0 : c.path) ?? "";
      },
      removeWidget: async (u) => {
        await o(() => e.doc.remove(u));
        const a = i().selected.filter((s) => s !== u);
        a.length !== i().selected.length && await i().select(a), await i().refreshTree(), await i().refreshUndoState();
      },
      setValues: async (u) => {
        if (!u.length) return;
        const a = await o(() => e.doc.set(u));
        if (!a) return;
        const s = { ...i().values };
        for (const c of a.diffs) s[c.path] = c.new;
        l({ values: s }), await i().refreshUndoState();
      },
      renameWidget: async (u, a) => {
        const s = await o(() => e.doc.rename(u, a));
        if (await i().refreshTree(), await i().refreshUndoState(), s) {
          const c = i().selected;
          c.includes(u) && await i().select(c.map((d) => d === u ? s.path : d));
        }
        return (s == null ? void 0 : s.path) ?? null;
      },
      moveWidget: async (u, a) => {
        await o(() => e.doc.move(u, a)), await i().refreshTree(), await i().refreshUndoState();
      },
      duplicateWidget: async (u) => {
        const a = await o(() => e.doc.duplicate(u));
        return await i().refreshTree(), await i().refreshUndoState(), (a == null ? void 0 : a.path) ?? null;
      },
      setHidden: async (u, a) => {
        u.length && (await i().setValues(u.map((s) => ({
          path: s + "/hide",
          value: a
        }))), await i().refreshTree());
      },
      copyWidgets: async (u) => {
        if (!u.length) return;
        const a = await o(() => e.doc.serializeWidgets(u));
        a && (await t.write({
          mime_type: a.mime_type,
          payload_b64: a.payload_b64
        }), l({ cutPaths: [] }));
      },
      cutWidgets: async (u) => {
        if (!u.length) return;
        const a = await o(() => e.doc.serializeWidgets(u));
        if (!a) return;
        await t.write({
          mime_type: a.mime_type,
          payload_b64: a.payload_b64
        });
        const s = [...u].sort((d, p) => p.length - d.length);
        for (const d of s)
          await o(() => e.doc.remove(d));
        const c = i().selected.filter((d) => !u.includes(d));
        c.length !== i().selected.length && await i().select(c), l({ cutPaths: u }), await i().refreshTree(), await i().refreshUndoState();
      },
      pasteWidgets: async (u) => {
        const a = await t.read([Ta]);
        if (!a) return [];
        const s = await o(() => e.doc.pasteWidgetsMime(
          u,
          a.mime_type,
          a.payload_b64
        ));
        return s ? (l({ cutPaths: [] }), await i().refreshTree(), await i().refreshUndoState(), s.paths) : [];
      },
      canPasteWidgets: async (u) => {
        const a = await t.read([Ta]);
        if (!a) return !1;
        const s = await o(() => e.doc.canPasteMime(
          u,
          a.mime_type,
          a.payload_b64
        ));
        return (s == null ? void 0 : s.ok) ?? !1;
      },
      copyWidgetAsImage: async (u, a, s, c = 96) => {
        const d = await o(() => e.render.copyImage(u, a, s, c, "png"));
        d && await t.write({
          mime_type: d.mime_type,
          payload_b64: d.payload_b64
        });
      },
      propagateSetting: async (u, a, s) => {
        await o(() => e.doc.propagateSetting(u, a, s)), await i().refreshUndoState();
        const c = i().selected;
        c.length && await i().select(c);
      },
      resetSettingDefault: async (u) => {
        await o(() => e.doc.resetSettingDefault(u)), await i().refreshUndoState();
        const a = i().selected;
        a.length && await i().select(a);
      },
      setSettingDefault: async (u) => {
        await o(() => e.doc.setSettingDefault(u)), await i().refreshUndoState();
      },
      unlinkSetting: async (u) => {
        await o(() => e.doc.unlinkSetting(u)), await i().refreshUndoState();
        const a = i().selected;
        a.length && await i().select(a);
      },
      selectDatasets: (u) => l({ selectedDatasets: u }),
      importCsv: async (u) => {
        const a = await o(() => e.data.import("csv", u));
        return await i().refreshDatasets(), (a == null ? void 0 : a.imported) ?? [];
      },
      importData: async (u, a, s = {}) => {
        const c = await o(() => e.data.import(u, a, s));
        return await i().refreshDatasets(), await i().refreshUndoState(), (c == null ? void 0 : c.imported) ?? [];
      },
      deleteDatasets: async (u) => {
        u.length && (await o(() => e.data.delete(u)), await i().refreshDatasets(), await i().refreshUndoState());
      },
      renameDataset: async (u, a) => {
        await o(() => e.data.rename(u, a)), await i().refreshDatasets(), await i().refreshUndoState();
      },
      duplicateDataset: async (u, a) => {
        const s = await o(() => e.data.duplicate(u, a));
        return await i().refreshDatasets(), await i().refreshUndoState(), (s == null ? void 0 : s.name) ?? null;
      },
      unlinkDatasetFile: async (u) => {
        u.length && (await o(() => e.data.unlinkFile(u)), await i().refreshDatasets(), await i().refreshUndoState());
      },
      unlinkDatasetRelation: async (u) => {
        u.length && (await o(() => e.data.unlinkRelation(u)), await i().refreshDatasets(), await i().refreshUndoState());
      },
      tagDatasets: async (u, a) => {
        u.length && (await o(() => e.data.tag(u, a)), await i().refreshDatasets(), await i().refreshUndoState());
      },
      untagDatasets: async (u, a) => {
        u.length && (await o(() => e.data.untag(u, a)), await i().refreshDatasets(), await i().refreshUndoState());
      },
      copyDatasets: async (u) => {
        if (!u.length) return;
        const a = await o(() => e.data.serialize(u));
        a && await t.write({
          mime_type: a.mime_type,
          payload_b64: a.payload_b64
        });
      },
      pasteDatasets: async () => {
        const u = await t.read([kh]);
        if (!u) return [];
        const a = await o(() => e.data.pasteMime(
          u.mime_type,
          u.payload_b64
        ));
        return await i().refreshDatasets(), await i().refreshUndoState(), (a == null ? void 0 : a.pasted) ?? [];
      },
      reloadFile: async (u) => {
        await o(() => e.data.reloadFile(u)), await i().refreshDatasets(), await i().refreshUndoState();
      },
      unlinkAllInFile: async (u) => {
        await o(() => e.data.unlinkAllFile(u)), await i().refreshDatasets(), await i().refreshUndoState();
      },
      deleteAllInFile: async (u) => {
        await o(() => e.data.deleteAllFile(u)), await i().refreshDatasets(), await i().refreshUndoState();
      },
      loadPlugins: async () => {
        const u = i().plugins;
        if (u.tools.length || u.datasets.length) return;
        const a = await o(() => e.plugins.list());
        a && l({ plugins: { tools: a.tools, datasets: a.datasets } });
      },
      runPlugin: async (u, a, s) => {
        const c = await o(() => e.plugins.run(u, a, s));
        return await Promise.all([i().refreshTree(), i().refreshDatasets()]), await i().refreshUndoState(), (c == null ? void 0 : c.created) ?? [];
      },
      loadPlotPrefs: async () => {
        const u = await o(() => e.prefs.get("plot.antialias")), a = await o(() => e.prefs.get("plot.update_policy")), s = await o(() => e.prefs.get("plot.backend")), c = {};
        u && typeof u.value == "boolean" && (c.antialias = u.value), a && typeof a.value == "string" && (c.updatePolicy = a.value), s && typeof s.value == "string" && (c.backend = s.value), Object.keys(c).length && l(c);
      },
      setPage: (u) => {
        var c;
        const a = ((c = i().tree) == null ? void 0 : c.children.length) ?? 0, s = Math.max(0, Math.min(u, Math.max(0, a - 1)));
        l({ currentPage: s });
      },
      nextPage: () => i().setPage(i().currentPage + 1),
      prevPage: () => i().setPage(i().currentPage - 1),
      setAntialias: async (u) => {
        l({ antialias: u }), await o(() => e.prefs.set("plot.antialias", u));
      },
      setBackend: async (u) => {
        l({ backend: u }), await o(() => e.prefs.set("plot.backend", u)), u === "vello-wasm" && i().webgpuAvailable === null && await i().probeWebgpu(), u === "vello-gpu" && i().gpuNativeAvailable === null && await i().probeGpuNative();
      },
      probeWebgpu: async () => {
        let u = !1;
        try {
          const { webgpuAvailable: a } = await Promise.resolve().then(() => ff);
          u = await a();
        } catch {
          u = !1;
        }
        return l({ webgpuAvailable: u }), u;
      },
      probeGpuNative: async () => {
        let u = !1;
        try {
          const { gpuAvailable: a } = await import("./velloNative-Cn1MRGX6.js");
          u = await a();
        } catch {
          u = !1;
        }
        return l({ gpuNativeAvailable: u }), u;
      },
      setUpdatePolicy: async (u) => {
        l({ updatePolicy: u }), await o(() => e.prefs.set("plot.update_policy", u));
      },
      forceRender: async (u, a, s = 96) => {
        await i().renderAt(i().currentPage, u, a, s);
      },
      renderAt: async (u, a, s, c = 96) => {
        const d = i().backend;
        if (d === "vello-gpu" && i().gpuNativeAvailable === !0) {
          const v = await o(() => e.render.scene(u, a, s, c));
          if (v) {
            const { gpuRenderScene: k } = await import("./velloNative-Cn1MRGX6.js"), N = await o(() => k(v.scene_b64, v.width, v.height));
            N && l({ render: {
              png: N,
              width: v.width,
              height: v.height,
              bounds: v.bounds
            } });
          }
          return;
        }
        if (d === "vello-wasm" && i().webgpuAvailable === !0) {
          const v = await o(() => e.render.scene(u, a, s, c));
          v && l({ render: {
            png: "",
            sceneB64: v.scene_b64,
            width: v.width,
            height: v.height,
            bounds: v.bounds
          } });
          return;
        }
        const p = d === "vello-wasm" || d === "vello-gpu" ? "vello" : d, y = await o(() => e.render.png(u, a, s, c, i().antialias, p));
        y && l({ render: y });
      },
      requestRender: (u, a, s, c = 96) => {
        r = { page: u, w: a, h: s, dpi: c }, n && clearTimeout(n), n = setTimeout(() => {
          n = null;
          const d = r;
          r = null, d && i().renderAt(d.page, d.w, d.h, d.dpi);
        }, Eh);
      },
      undo: async () => {
        const u = await o(() => e.doc.undo());
        u && l({ canUndo: u.can_undo, canRedo: u.can_redo }), await i().refreshTree();
        const a = i().selected;
        a.length && await i().select(a);
      },
      redo: async () => {
        const u = await o(() => e.doc.redo());
        u && l({ canUndo: u.can_undo, canRedo: u.can_redo }), await i().refreshTree();
        const a = i().selected;
        a.length && await i().select(a);
      },
      subscribeToDaemon: () => {
        const u = e.subscribe("doc.changed", () => {
          i().refreshTree(), i().refreshUndoState(), i().refreshInsertTargets();
          const s = i().selected;
          s.length && i().select(s);
        }), a = e.subscribe("data.changed", () => {
          i().refreshDatasets();
        });
        return () => {
          u(), a();
        };
      }
    };
  });
}
function uf(e, t) {
  if (!e) return null;
  if (e.path === t) return e.type;
  for (const n of e.children) {
    const r = uf(n, t);
    if (r) return r;
  }
  return null;
}
function Ch() {
  return (globalThis.__VEUSZ_WASM_BASE__ ?? "/wasm").replace(/\/+$/, "");
}
let $r = null, ja = !1;
function Ph() {
  if (ja) return;
  const e = globalThis.GPUAdapter;
  if (!e) return;
  ja = !0;
  const t = e.prototype, n = t.requestDevice;
  t.requestDevice = function(r) {
    if (r != null && r.requiredLimits) {
      const l = this.limits, i = {};
      for (const [o, u] of Object.entries(r.requiredLimits))
        l && l[o] !== void 0 && (i[o] = u);
      r = { ...r, requiredLimits: i };
    }
    return n.call(this, r);
  };
}
function su() {
  return $r || ($r = (async () => {
    Ph();
    const e = Ch(), t = await import(
      /* @vite-ignore */
      `${e}/veusz_paint_wasm.js`
    );
    return await t.default({ module_or_path: `${e}/veusz_paint_wasm_bg.wasm` }), t;
  })().catch((e) => {
    throw $r = null, e;
  })), $r;
}
async function af() {
  try {
    const e = navigator.gpu;
    return e ? await e.requestAdapter() != null : !1;
  } catch {
    return !1;
  }
}
function Fl(e) {
  const t = atob(e), n = new Uint8Array(t.length);
  for (let r = 0; r < t.length; r++) n[r] = t.charCodeAt(r);
  return n;
}
async function cu(e, t, n = [0, 0, 0, 0]) {
  await (await su()).render_scene_to_canvas(e, t, n[0], n[1], n[2], n[3]);
}
async function zh(e, t, n = [0, 0, 0, 0]) {
  await cu(e, Fl(t), n);
}
async function Ol(e, t, n, r = "image/png", l = 0.92, i = [1, 1, 1, 1]) {
  const o = document.createElement("canvas");
  o.width = Math.max(1, Math.round(t)), o.height = Math.max(1, Math.round(n)), o.style.cssText = "position:absolute;left:-99999px;top:0;pointer-events:none", document.body.appendChild(o);
  try {
    await cu(o, Fl(e), i);
    const u = await new Promise((a) => o.toBlob(a, r, l));
    if (!u) throw new Error("canvas.toBlob returned null");
    return u;
  } finally {
    o.remove();
  }
}
async function sf() {
  try {
    return typeof (await su()).scene_to_svg == "function";
  } catch {
    return !1;
  }
}
async function cf(e, t, n) {
  const r = await su();
  if (typeof r.scene_to_svg != "function")
    throw new Error("this runtime does not include the SVG exporter");
  return r.scene_to_svg(Fl(e), t, n);
}
const ff = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base64ToBytes: Fl,
  renderSceneBytesToCanvas: cu,
  renderSceneToCanvas: zh,
  renderSceneToImageBlob: Ol,
  sceneToSvg: cf,
  svgExportAvailable: sf,
  webgpuAvailable: af
}, Symbol.toStringTag, { value: "Module" })), Th = "0.26.4", Nh = `https://cdn.jsdelivr.net/pyodide/v${Th}/full/`;
let Dn = null;
async function jh(e) {
  if (Dn) return Dn;
  const t = e.pyodideIndexUrl ?? Nh, n = e.onProgress ?? (() => {
  });
  return Dn = (async () => {
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
    throw Dn = null, r;
  }), Dn;
}
let Rh = 0;
async function Lh(e = {}) {
  const t = e.onProgress ?? (() => {
  });
  e.wasmBase && (globalThis.__VEUSZ_WASM_BASE__ = e.wasmBase);
  const n = await jh(e);
  t("Starting renderer…");
  const l = n.pyimport("veusz.daemon.pyodide_bridge").Bridge(), i = Hp(l), o = `/veusz/fig_${Rh++}`, u = `${o}/figure.vsz`, a = async (s, c = []) => {
    await n.runPythonAsync(`import os; os.makedirs(${JSON.stringify(o)}, exist_ok=True)`);
    for (const d of c) {
      const p = `${o}/${d.name}`, y = p.slice(0, p.lastIndexOf("/"));
      y && y !== o && await n.runPythonAsync(`import os; os.makedirs(${JSON.stringify(y)}, exist_ok=True)`), n.FS.writeFile(p, d.bytes);
    }
    return n.FS.writeFile(u, s), i.call("file.open", { path: u });
  };
  return t("Ready"), { transport: i, bridge: l, loadVsz: a, pyodide: n };
}
async function Dh(e, t = {}) {
  const n = await e.call("data.list_url_links", {}), r = t.onError ?? ((s, c) => console.warn(`[veusz-figure] URL ${s}: ${c.message}`)), l = t.onStatus ?? (() => {
  }), i = /* @__PURE__ */ new Map();
  for (const s of n)
    i.set(s.url, { etag: s.etag, lastModified: s.last_modified });
  const o = (s) => {
    if (t.urlMap && Object.prototype.hasOwnProperty.call(t.urlMap, s))
      return t.urlMap[s];
    if (t.urlBase)
      try {
        return new URL(s, t.urlBase).toString();
      } catch {
        return s;
      }
    return s;
  }, u = async (s) => {
    const c = o(s.url), d = i.get(s.url), p = {};
    d.etag && (p["If-None-Match"] = d.etag), d.lastModified && (p["If-Modified-Since"] = d.lastModified), l({ url: s.url, phase: "fetching" });
    try {
      const y = await fetch(c, { headers: p, cache: "no-store" });
      if (y.status === 304) {
        await e.call(
          "data.url_refresh",
          { url: s.url, not_modified: !0 }
        ), l({ url: s.url, phase: "not_modified" });
        return;
      }
      if (!y.ok) throw new Error(`HTTP ${y.status}`);
      const v = new Uint8Array(await y.arrayBuffer()), k = df(v), N = y.headers.get("etag"), h = y.headers.get("last-modified"), f = y.headers.get("content-type");
      await e.call("data.url_refresh", {
        url: s.url,
        bytes_b64: k,
        etag: N,
        last_modified: h,
        content_type: f
      }), d.etag = N, d.lastModified = h, l({ url: s.url, phase: "ok" });
    } catch (y) {
      const v = y instanceof Error ? y : new Error(String(y));
      r(s.url, v), l({ url: s.url, phase: "error", detail: v.message });
    }
  };
  await Promise.allSettled(n.map((s) => u(s)));
  const a = [];
  for (const s of n)
    if (s.poll_seconds > 0) {
      const c = setInterval(
        () => {
          u(s);
        },
        s.poll_seconds * 1e3
      );
      a.push(c);
    }
  return {
    stop() {
      for (const s of a) clearInterval(s);
      a.length = 0;
    }
  };
}
async function Mh(e, t, n = {}) {
  const r = Ih(e), l = n.onError ?? ((i, o) => console.warn(`[veusz-figure] pre-fetch ${i}: ${o.message}`));
  return await Promise.allSettled(r.map(async (i) => {
    const o = n.urlMap && Object.prototype.hasOwnProperty.call(n.urlMap, i) ? n.urlMap[i] : n.urlBase ? new URL(i, n.urlBase).toString() : i;
    try {
      const u = await fetch(o, { cache: "no-store" });
      if (!u.ok) throw new Error(`HTTP ${u.status}`);
      const a = new Uint8Array(await u.arrayBuffer());
      await t.call("data.url_ingest", {
        url: i,
        // Python's cache key = original URL
        bytes_b64: df(a),
        etag: u.headers.get("etag"),
        last_modified: u.headers.get("last-modified"),
        content_type: u.headers.get("content-type")
      });
    } catch (u) {
      const a = u instanceof Error ? u : new Error(String(u));
      l(i, a);
    }
  })), r;
}
function Ih(e) {
  const t = [], n = /ImportFileURL\s*\(\s*(['"])([^'"\n]+)\1/g;
  let r;
  for (; (r = n.exec(e)) !== null; ) t.push(r[2]);
  return t;
}
function df(e) {
  let t = "";
  for (let r = 0; r < e.length; r += 32768)
    t += String.fromCharCode.apply(
      null,
      Array.from(e.subarray(r, r + 32768))
    );
  return btoa(t);
}
const $h = /\bImport[A-Za-z0-9]*\s*\(\s*[uUrRbB]?(['"])([^'"\n]+)\1/g;
function Fh(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e.matchAll($h)) {
    const r = n[2];
    /^[a-z][a-z0-9+.-]*:\/\//i.test(r) || /\.[A-Za-z0-9]+$/.test(r) && t.add(r);
  }
  return [...t];
}
async function Oh(e, t, n = {}, r = fetch) {
  const l = Fh(e);
  if (l.length === 0) return [];
  const i = n.urlBase ? new URL(n.urlBase, location.href) : new URL(".", new URL(t, location.href)), o = [];
  return await Promise.all(l.map(async (u) => {
    var s;
    const a = ((s = n.urlMap) == null ? void 0 : s[u]) ?? new URL(u, i).toString();
    try {
      const c = await r(a);
      if (!c.ok) return;
      o.push({ name: u, bytes: new Uint8Array(await c.arrayBuffer()) });
    } catch {
    }
  })), o;
}
var pf = { exports: {} }, Ul = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Uh = M, Ah = Symbol.for("react.element"), Bh = Symbol.for("react.fragment"), Vh = Object.prototype.hasOwnProperty, Wh = Uh.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, Hh = { key: !0, ref: !0, __self: !0, __source: !0 };
function hf(e, t, n) {
  var r, l = {}, i = null, o = null;
  n !== void 0 && (i = "" + n), t.key !== void 0 && (i = "" + t.key), t.ref !== void 0 && (o = t.ref);
  for (r in t) Vh.call(t, r) && !Hh.hasOwnProperty(r) && (l[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) l[r] === void 0 && (l[r] = t[r]);
  return { $$typeof: Ah, type: e, key: i, ref: o, props: l, _owner: Wh.current };
}
Ul.Fragment = Bh;
Ul.jsx = hf;
Ul.jsxs = hf;
pf.exports = Ul;
var g = pf.exports;
function Qh(e, t) {
  const n = new Map(t.map((l) => [l.path, l])), r = [];
  for (const l of e) {
    const i = n.get(l.path);
    if (!i) continue;
    const o = Math.min(l.value, i.value), u = Math.max(l.value, i.value);
    !(u > o) || !Number.isFinite(o) || !Number.isFinite(u) || (r.push({ path: `${l.path}/min`, value: o }), r.push({ path: `${l.path}/max`, value: u }));
  }
  return r;
}
function Yh(e) {
  const t = [];
  for (const n of new Set(e))
    t.push({ path: `${n}/min`, value: "Auto" }), t.push({ path: `${n}/max`, value: "Auto" });
  return t;
}
function Xh(e, t, n) {
  const r = new Map(t.map((i) => [i.path, i])), l = [];
  for (const i of e) {
    const o = r.get(i.path), u = n.get(i.path);
    if (!o || !u) continue;
    const a = i.value - o.value;
    Number.isFinite(a) && (l.push({ path: `${i.path}/min`, value: u.min + a }), l.push({ path: `${i.path}/max`, value: u.max + a }));
  }
  return l;
}
function Kh(e, t, n, r, l) {
  const i = new Map(t.map((s) => [s.path, s])), o = new Map(n.map((s) => [s.path, s])), u = new Map(r.map((s) => [s.path, s])), a = [];
  for (const s of e) {
    const c = i.get(s.path), d = o.get(s.path), p = u.get(s.path), y = l.get(s.path);
    if (!c || !d || !p || !y) continue;
    const v = s.value, k = c.value, N = d.value, f = p.value - N;
    if (!Number.isFinite(f) || f === 0) continue;
    const m = (k - v) / f;
    if (!Number.isFinite(m) || m <= 0) continue;
    const x = v + m * (y.min - N), S = v + m * (y.max - N);
    if (!Number.isFinite(x) || !Number.isFinite(S)) continue;
    const _ = Math.min(x, S), C = Math.max(x, S);
    C > _ && (a.push({ path: `${s.path}/min`, value: _ }), a.push({ path: `${s.path}/max`, value: C }));
  }
  return a;
}
function Gh(e) {
  const t = (i) => {
    const o = Math.abs(i);
    return o !== 0 && (o < 1e-3 || o >= 1e5) ? i.toExponential(3) : Number(i.toPrecision(5)).toString();
  }, n = e.find((i) => i.direction === "horizontal"), r = e.find((i) => i.direction === "vertical"), l = [];
  return n && l.push(`x: ${t(n.value)}`), r && l.push(`y: ${t(r.value)}`), l.join("   ");
}
const Ra = 4, La = 2400, Da = 2;
function mf({
  store: e,
  width: t,
  height: n
}) {
  const r = e((w) => w.render), l = e((w) => w.tree), i = e((w) => w.currentPage), o = e((w) => w.values), u = e((w) => w.requestRender), a = M.useRef(null), s = M.useRef(null), c = M.useRef(null), d = M.useMemo(() => {
    let w = Math.max(1, Math.round(t * Da)), L = Math.max(1, Math.round(n * Da));
    const z = Math.max(w, L);
    if (z > La) {
      const $ = La / z;
      w = Math.round(w * $), L = Math.round(L * $);
    }
    return { w, h: L };
  }, [t, n]), [p, y] = M.useState({ w: t, h: n }), [v, k] = M.useState(null), [N, h] = M.useState(null), [f, m] = M.useState(null), x = M.useRef(/* @__PURE__ */ new Set()), S = M.useRef(null), _ = M.useRef(null), C = M.useRef(/* @__PURE__ */ new Map()), R = M.useRef(0);
  M.useEffect(() => {
    const w = s.current;
    if (!w) return;
    const L = t > 0 ? n / t : 0.7143, z = () => {
      const U = w.clientWidth, V = w.clientHeight;
      let O, A;
      if (U > 0 && V > 0) {
        const W = Math.min(U / t, V / n);
        O = t * W, A = n * W;
      } else U > 0 ? (O = U, A = U * L) : (O = t, A = n);
      y((W) => Math.abs(W.w - O) < 0.5 && Math.abs(W.h - A) < 0.5 ? W : { w: O, h: A });
    };
    if (z(), typeof ResizeObserver > "u") return;
    const $ = new ResizeObserver(z);
    return $.observe(w), () => $.disconnect();
  }, [t, n]), M.useEffect(() => {
    l && l.children.length > 0 && u(i, d.w, d.h);
  }, [l, o, i, d.w, d.h, u]), M.useEffect(() => {
    const w = r == null ? void 0 : r.sceneB64, L = a.current;
    if (!w || !L) return;
    let z = !1;
    return (async () => {
      try {
        const { renderSceneToCanvas: $ } = await Promise.resolve().then(() => ff);
        z || await $(L, w, [1, 1, 1, 1]);
      } catch ($) {
        z || console.error("embed scene render failed", $);
      }
    })(), () => {
      z = !0;
    };
  }, [r == null ? void 0 : r.sceneB64]);
  const j = () => e.getState().rpc, D = (w, L) => {
    const $ = a.current.getBoundingClientRect();
    return [
      (w - $.left) * (d.w / ($.width || 1)),
      (L - $.top) * (d.h / ($.height || 1))
    ];
  }, b = async (w) => {
    await e.getState().setValues(w), u(i, d.w, d.h);
  }, _t = () => {
    const w = a.current;
    if (!w) return;
    const L = [...C.current.keys()];
    if (L.length < 2) return;
    const [z, $] = L, U = C.current.get(z), V = C.current.get($), O = w.getBoundingClientRect(), A = U.clientX - O.left, W = U.clientY - O.top, oe = V.clientX - O.left, Pt = V.clientY - O.top;
    _.current = {
      id1: z,
      id2: $,
      startDist: Math.hypot(oe - A, Pt - W) || 1,
      startCx: (A + oe) / 2,
      startCy: (W + Pt) / 2
    }, S.current = null, k(null), (async () => {
      const [zt, kn] = [D(U.clientX, U.clientY), D(V.clientX, V.clientY)], [yr, du] = await Promise.all([
        j().render.pixelToData(zt[0], zt[1]),
        j().render.pixelToData(kn[0], kn[1])
      ]);
      if (!_.current) return;
      _.current.data1 = yr.axes, _.current.data2 = du.axes;
      const pu = /* @__PURE__ */ new Map();
      for (const En of new Set([...yr.axes, ...du.axes].map((gr) => gr.path))) {
        const gr = await j().doc.get([`${En}/min`, `${En}/max`]), hu = Number(gr[`${En}/min`]), mu = Number(gr[`${En}/max`]);
        Number.isFinite(hu) && Number.isFinite(mu) && pu.set(En, { min: hu, max: mu });
      }
      _.current && (_.current.ranges = pu);
    })();
  }, Ct = () => {
    const w = _.current, L = a.current;
    if (!w || !L) return;
    const z = C.current.get(w.id1), $ = C.current.get(w.id2);
    if (!z || !$) return;
    const U = L.getBoundingClientRect(), V = z.clientX - U.left, O = z.clientY - U.top, A = $.clientX - U.left, W = $.clientY - U.top, oe = Math.hypot(A - V, W - O) || 1;
    m({
      scale: oe / w.startDist,
      ox: w.startCx,
      oy: w.startCy,
      tx: (V + A) / 2 - w.startCx,
      ty: (O + W) / 2 - w.startCy
    });
  }, vr = (w, L) => {
    const z = _.current;
    if (_.current = null, m(null), !z || !z.data1 || !z.data2 || !z.ranges) return;
    const $ = z.id1 === L ? w : C.current.get(z.id1), U = z.id2 === L ? w : C.current.get(z.id2);
    if (!$ || !U) return;
    const V = D($.clientX, $.clientY), O = D(U.clientX, U.clientY);
    (async () => {
      const [A, W] = await Promise.all([
        j().render.pixelToData(V[0], V[1]),
        j().render.pixelToData(O[0], O[1])
      ]), oe = Kh(z.data1, z.data2, A.axes, W.axes, z.ranges);
      oe.length && await b(oe);
    })();
  }, Al = (w) => {
    var U, V;
    if ((V = (U = w.currentTarget).setPointerCapture) == null || V.call(U, w.pointerId), C.current.set(w.pointerId, { clientX: w.clientX, clientY: w.clientY }), C.current.size >= 2) {
      _t();
      return;
    }
    const [L, z] = D(w.clientX, w.clientY), $ = w.pointerType === "mouse" ? w.shiftKey || w.button === 1 : !0;
    S.current = { pointerId: w.pointerId, mode: $ ? "pan" : "zoom", sx: L, sy: z, moved: !1 }, $ && j().render.pixelToData(L, z).then(async (O) => {
      if (!S.current) return;
      S.current.from = O.axes;
      const A = /* @__PURE__ */ new Map();
      for (const W of O.axes) {
        const oe = await j().doc.get([`${W.path}/min`, `${W.path}/max`]), Pt = Number(oe[`${W.path}/min`]), zt = Number(oe[`${W.path}/max`]);
        Number.isFinite(Pt) && Number.isFinite(zt) && A.set(W.path, { min: Pt, max: zt });
      }
      S.current && (S.current.ranges = A);
    });
  }, Sn = (w) => {
    if (C.current.has(w.pointerId) && C.current.set(w.pointerId, { clientX: w.clientX, clientY: w.clientY }), _.current) {
      Ct();
      return;
    }
    const L = S.current;
    if (L && L.pointerId === w.pointerId) {
      const [V, O] = D(w.clientX, w.clientY);
      (Math.abs(V - L.sx) > Ra || Math.abs(O - L.sy) > Ra) && (L.moved = !0), L.mode === "zoom" && L.moved && k({ x0: L.sx, y0: L.sy, x1: V, y1: O });
      return;
    }
    if (w.pointerType !== "mouse" || w.buttons !== 0) return;
    const z = performance.now();
    if (z - R.current < 40) return;
    R.current = z;
    const [$, U] = D(w.clientX, w.clientY);
    j().render.pixelToData($, U).then((V) => {
      var kn;
      V.axes.forEach((yr) => x.current.add(yr.path));
      const O = Gh(V.axes);
      if (!O) {
        h(null);
        return;
      }
      const A = ((kn = c.current) == null ? void 0 : kn.getBoundingClientRect()) ?? { left: 0, top: 0, width: 0, height: 0 }, W = w.clientX - A.left, oe = w.clientY - A.top, Pt = A.width > 0 && W > A.width * 0.6, zt = A.height > 0 && oe > A.height * 0.85;
      h({
        ...Pt ? { right: Math.max(4, A.width - W + 12) } : { left: W + 12 },
        top: zt ? Math.max(4, oe - 22) : oe + 12,
        text: O
      });
    });
  }, xn = (w) => {
    var V, O;
    (O = (V = w.currentTarget).releasePointerCapture) == null || O.call(V, w.pointerId);
    const L = C.current.get(w.pointerId) ?? { clientX: w.clientX, clientY: w.clientY };
    if (_.current) {
      vr(L, w.pointerId), C.current.delete(w.pointerId);
      return;
    }
    C.current.delete(w.pointerId);
    const z = S.current;
    if (!z || z.pointerId !== w.pointerId || (S.current = null, k(null), !z.moved)) return;
    const [$, U] = D(w.clientX, w.clientY);
    z.mode === "zoom" ? (async () => {
      const [A, W] = await Promise.all([
        j().render.pixelToData(z.sx, z.sy),
        j().render.pixelToData($, U)
      ]), oe = Qh(A.axes, W.axes);
      oe.length && await b(oe);
    })() : z.mode === "pan" && z.from && z.ranges && (async () => {
      const A = await j().render.pixelToData($, U), W = Xh(z.from, A.axes, z.ranges);
      W.length && await b(W);
    })();
  }, P = (w) => {
    C.current.delete(w.pointerId), _.current = null, S.current = null, k(null), m(null);
  }, I = () => {
    x.current.size && b(Yh(x.current));
  };
  return /* @__PURE__ */ g.jsx(
    "div",
    {
      ref: s,
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
        h(null);
      },
      children: /* @__PURE__ */ g.jsxs("div", { ref: c, style: { position: "relative", width: p.w, height: p.h }, children: [
        /* @__PURE__ */ g.jsx(
          "canvas",
          {
            ref: a,
            width: d.w,
            height: d.h,
            "data-testid": "embed-canvas",
            onPointerDown: Al,
            onPointerMove: Sn,
            onPointerUp: xn,
            onPointerCancel: P,
            onDoubleClick: I,
            style: {
              width: "100%",
              height: "100%",
              display: "block",
              cursor: "crosshair",
              touchAction: "none",
              transform: f ? `translate(${f.tx}px, ${f.ty}px) scale(${f.scale})` : void 0,
              transformOrigin: f ? `${f.ox}px ${f.oy}px` : void 0
            }
          }
        ),
        v && /* @__PURE__ */ g.jsx("div", { "data-testid": "embed-zoomband", style: {
          position: "absolute",
          pointerEvents: "none",
          border: "1px solid #1f6feb",
          background: "rgba(31,111,235,0.12)",
          left: `${Math.min(v.x0, v.x1) / d.w * 100}%`,
          top: `${Math.min(v.y0, v.y1) / d.h * 100}%`,
          width: `${Math.abs(v.x1 - v.x0) / d.w * 100}%`,
          height: `${Math.abs(v.y1 - v.y0) / d.h * 100}%`
        } }),
        N && /* @__PURE__ */ g.jsx("div", { "data-testid": "embed-tooltip", style: {
          position: "absolute",
          left: N.left,
          right: N.right,
          top: N.top,
          pointerEvents: "none",
          background: "rgba(20,22,26,0.9)",
          color: "#fff",
          font: "12px system-ui",
          padding: "2px 6px",
          borderRadius: 4,
          whiteSpace: "nowrap",
          zIndex: 5
        }, children: N.text })
      ] })
    }
  );
}
function Zh({
  root: e,
  selected: t,
  onSelect: n,
  onContextMenu: r,
  renamingPath: l,
  onRenameCommit: i,
  cutPaths: o
}) {
  const u = new Set(t), a = new Set(o ?? []);
  return /* @__PURE__ */ g.jsx("ul", { "data-testid": "tree", role: "tree", children: /* @__PURE__ */ g.jsx(
    vf,
    {
      node: e,
      selectedSet: u,
      cutSet: a,
      onSelect: n,
      onContextMenu: r,
      renamingPath: l ?? null,
      onRenameCommit: i
    }
  ) });
}
function Jh(e) {
  return e.shiftKey ? "range" : e.ctrlKey || e.metaKey ? "toggle" : "replace";
}
function vf({
  node: e,
  selectedSet: t,
  cutSet: n,
  onSelect: r,
  onContextMenu: l,
  renamingPath: i,
  onRenameCommit: o
}) {
  const u = t.has(e.path), a = n.has(e.path), s = i === e.path;
  return /* @__PURE__ */ g.jsxs("li", { role: "treeitem", "aria-selected": u, children: [
    s ? /* @__PURE__ */ g.jsx(
      qh,
      {
        initial: e.name,
        onCommit: (c) => o == null ? void 0 : o(e.path, c)
      }
    ) : /* @__PURE__ */ g.jsxs(
      "button",
      {
        type: "button",
        "data-testid": `tree-node-${e.path}`,
        "data-selected": u || void 0,
        "data-cut": a || void 0,
        style: a ? { opacity: 0.5 } : void 0,
        onClick: (c) => r(e.path, Jh(c)),
        onContextMenu: (c) => l == null ? void 0 : l(e.path, c),
        children: [
          /* @__PURE__ */ g.jsxs("span", { "data-testid": `tree-type-${e.path}`, children: [
            "[",
            e.type,
            "]"
          ] }),
          " ",
          /* @__PURE__ */ g.jsx("span", { "data-testid": `tree-name-${e.path}`, children: e.name || "/" })
        ]
      }
    ),
    e.children.length > 0 && /* @__PURE__ */ g.jsx("ul", { role: "group", children: e.children.map((c) => /* @__PURE__ */ g.jsx(
      vf,
      {
        node: c,
        selectedSet: t,
        cutSet: n,
        onSelect: r,
        onContextMenu: l,
        renamingPath: i,
        onRenameCommit: o
      },
      c.path
    )) })
  ] });
}
function qh({
  initial: e,
  onCommit: t
}) {
  return /* @__PURE__ */ g.jsx(
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
function fo({ schema: e, value: t, onChange: n }) {
  const r = e.typename === "int", [l, i] = M.useState(
    () => t == null ? "" : String(t)
  );
  M.useEffect(() => {
    const u = t == null ? "" : String(t);
    i(u);
  }, [t]);
  const o = (u) => {
    if (u.startsWith("=")) {
      n(u);
      return;
    }
    if (u.trim() === "") {
      n(null);
      return;
    }
    const a = r ? parseInt(u, 10) : parseFloat(u);
    if (!Number.isFinite(a)) {
      i(t == null ? "" : String(t));
      return;
    }
    n(a);
  };
  return /* @__PURE__ */ g.jsx(
    "input",
    {
      type: "text",
      inputMode: r ? "numeric" : "decimal",
      value: l,
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      min: e.minval,
      max: e.maxval,
      onChange: (u) => i(u.target.value),
      onBlur: (u) => o(u.target.value),
      onKeyDown: (u) => {
        u.key === "Enter" && o(u.target.value);
      }
    }
  );
}
function po({ schema: e, value: t, onChange: n }) {
  const r = typeof t == "string" && t.toLowerCase() === "auto";
  return /* @__PURE__ */ g.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ g.jsxs("label", { children: [
      /* @__PURE__ */ g.jsx(
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
    !r && /* @__PURE__ */ g.jsx(
      fo,
      {
        schema: e,
        value: t,
        onChange: n
      }
    )
  ] });
}
function bh({ schema: e, value: t, onChange: n, siblings: r }) {
  if (!((r == null ? void 0 : r.mode) === "datetime"))
    return /* @__PURE__ */ g.jsx(po, { schema: e, value: t, onChange: n });
  const i = typeof t == "string" ? t : "", o = i.toLowerCase() === "auto";
  return /* @__PURE__ */ g.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ g.jsxs("label", { children: [
      /* @__PURE__ */ g.jsx(
        "input",
        {
          type: "checkbox",
          checked: o,
          "data-testid": `setting-${e.name}-auto`,
          "aria-label": "auto",
          onChange: (u) => n(u.target.checked ? "Auto" : "")
        }
      ),
      "Auto"
    ] }),
    !o && /* @__PURE__ */ g.jsx(
      "input",
      {
        type: "datetime-local",
        value: i,
        "data-testid": `setting-${e.name}-date`,
        "aria-label": e.usertext || e.name,
        onChange: (u) => n(u.target.value)
      }
    )
  ] });
}
function em({ schema: e, value: t, onChange: n }) {
  const r = !!t;
  return /* @__PURE__ */ g.jsx(
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
function Ee({ schema: e, value: t, onChange: n, editable: r = !1 }) {
  const l = e.vallist ?? [], i = e.uilist ?? l.map((u) => String(u)), o = t == null ? "" : String(t);
  return r && !l.includes(o) ? /* @__PURE__ */ g.jsx(
    "input",
    {
      type: "text",
      value: o,
      list: `opt-${e.name}`,
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (u) => n(u.target.value)
    }
  ) : /* @__PURE__ */ g.jsx(
    "select",
    {
      value: o,
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (u) => n(u.target.value),
      children: l.map((u, a) => /* @__PURE__ */ g.jsx("option", { value: String(u), children: i[a] ?? String(u) }, String(u)))
    }
  );
}
function tm({ schema: e, value: t, onChange: n }) {
  const r = typeof t == "string" ? t : "auto", l = r === "auto", i = t == null ? void 0 : t.$ref;
  return /* @__PURE__ */ g.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ g.jsxs("label", { children: [
      /* @__PURE__ */ g.jsx(
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
    !l && /* @__PURE__ */ g.jsx(
      "input",
      {
        type: "color",
        value: rm(r),
        "data-testid": `setting-${e.name}-color`,
        "aria-label": e.usertext || e.name,
        onChange: (o) => n(o.target.value)
      }
    ),
    i && /* @__PURE__ */ g.jsxs("span", { "data-testid": `setting-${e.name}-ref`, children: [
      "ref: ",
      /* @__PURE__ */ g.jsx("code", { children: i })
    ] })
  ] });
}
const Ma = /* @__PURE__ */ new Map(), nm = {
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
function rm(e) {
  if (/^#[0-9a-fA-F]{6}$/.test(e)) return e;
  const t = nm[e.toLowerCase()];
  if (t) return t;
  if (typeof document > "u") return "#000000";
  const n = Ma.get(e);
  if (n) return n;
  const r = document.createElement("div");
  r.style.color = e, r.style.display = "none", document.body.appendChild(r);
  const l = getComputedStyle(r).color;
  document.body.removeChild(r);
  const i = l.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!i) return "#000000";
  const o = "#" + [i[1], i[2], i[3]].map((u) => parseInt(u, 10).toString(16).padStart(2, "0")).join("");
  return Ma.set(e, o), o;
}
function Fr({
  schema: e,
  value: t,
  onChange: n,
  datasets: r = []
}) {
  const l = t == null ? "" : String(t), i = `ds-${e.name}`;
  return /* @__PURE__ */ g.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ g.jsx(
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
    /* @__PURE__ */ g.jsx("datalist", { id: i, children: r.map((o) => /* @__PURE__ */ g.jsx("option", { value: o }, o)) })
  ] });
}
const Ia = /^(-?\d+(?:\.\d+)?)\s*(pt|cm|mm|in|%|\/)?$/;
function hi({ schema: e, value: t, onChange: n, allowAuto: r = !1 }) {
  const l = typeof t == "string" ? t : "", i = l.toLowerCase() === "auto", o = (() => {
    if (i) return { num: "", unit: "pt" };
    const p = l.match(Ia);
    return { num: (p == null ? void 0 : p[1]) ?? "", unit: (p == null ? void 0 : p[2]) ?? "pt" };
  })(), [u, a] = M.useState(o.num), [s, c] = M.useState(o.unit);
  M.useEffect(() => {
    if (i) return;
    const p = l.match(Ia);
    p && (a(p[1] ?? ""), c(p[2] ?? "pt"));
  }, [l, i]);
  const d = (p, y) => {
    p.trim() !== "" && n(`${p}${y}`);
  };
  return /* @__PURE__ */ g.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    r && /* @__PURE__ */ g.jsxs("label", { children: [
      /* @__PURE__ */ g.jsx(
        "input",
        {
          type: "checkbox",
          checked: i,
          "data-testid": `setting-${e.name}-auto`,
          "aria-label": "auto",
          onChange: (p) => n(p.target.checked ? "Auto" : "1pt")
        }
      ),
      "Auto"
    ] }),
    !i && /* @__PURE__ */ g.jsxs(g.Fragment, { children: [
      /* @__PURE__ */ g.jsx(
        "input",
        {
          type: "text",
          inputMode: "decimal",
          value: u,
          "data-testid": `setting-${e.name}-num`,
          "aria-label": `${e.usertext || e.name} value`,
          onChange: (p) => a(p.target.value),
          onBlur: (p) => d(p.target.value, s),
          onKeyDown: (p) => {
            p.key === "Enter" && d(p.target.value, s);
          }
        }
      ),
      /* @__PURE__ */ g.jsx(
        "select",
        {
          value: s,
          "data-testid": `setting-${e.name}-unit`,
          "aria-label": `${e.usertext || e.name} unit`,
          onChange: (p) => {
            c(p.target.value), d(u, p.target.value);
          },
          children: ["pt", "cm", "mm", "in", "%"].map((p) => /* @__PURE__ */ g.jsx("option", { value: p, children: p }, p))
        }
      )
    ] })
  ] });
}
function mi({
  schema: e,
  value: t,
  onChange: n,
  onBrowse: r
}) {
  const l = t == null ? "" : String(t);
  return /* @__PURE__ */ g.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ g.jsx(
      "input",
      {
        type: "text",
        value: l,
        "data-testid": `setting-${e.name}-path`,
        "aria-label": e.usertext || e.name,
        onChange: (i) => n(i.target.value)
      }
    ),
    r && /* @__PURE__ */ g.jsx(
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
function lm({ schema: e, value: t, onChange: n }) {
  const r = im(t), [l, i] = M.useState(r);
  M.useEffect(() => i(r), [r]);
  const o = (u) => {
    if (u.startsWith("=")) {
      n(u);
      return;
    }
    const a = u.split(`
`).map((c) => c.trim()).filter(Boolean), s = {};
    for (const c of a) {
      const [d, p] = c.split("=", 2).map((v) => v == null ? void 0 : v.trim());
      if (!d) continue;
      const y = Number(p);
      if (!Number.isFinite(y)) {
        n(u);
        return;
      }
      s[d] = y;
    }
    n(s);
  };
  return /* @__PURE__ */ g.jsx(
    "textarea",
    {
      value: l,
      rows: Math.max(2, l.split(`
`).length),
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (u) => i(u.target.value),
      onBlur: (u) => o(u.target.value)
    }
  );
}
function im(e) {
  return typeof e == "string" ? e : e && typeof e == "object" && !Array.isArray(e) ? Object.entries(e).map(([t, n]) => `${t}=${n}`).join(`
`) : "";
}
function om({ schema: e, value: t, onChange: n }) {
  const r = Array.isArray(t) ? t.join(", ") : typeof t == "string" ? t : "", [l, i] = M.useState(r);
  M.useEffect(() => i(r), [r]);
  const o = (u) => {
    if (u.startsWith("=")) {
      n(u);
      return;
    }
    if (u.trim() === "") {
      n([]);
      return;
    }
    const s = u.split(",").map((c) => c.trim()).filter(Boolean).map(Number);
    s.every(Number.isFinite) ? n(s) : n(u);
  };
  return /* @__PURE__ */ g.jsx(
    "input",
    {
      type: "text",
      value: l,
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (u) => i(u.target.value),
      onBlur: (u) => o(u.target.value),
      onKeyDown: (u) => {
        u.key === "Enter" && o(u.target.value);
      }
    }
  );
}
function um({ schema: e, value: t, onChange: n }) {
  const r = typeof t == "number" ? t : Number(t) || 0, l = e.minval ?? 0, i = e.maxval ?? 100, o = e.step ?? 1;
  return /* @__PURE__ */ g.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ g.jsx(
      "input",
      {
        type: "range",
        min: l,
        max: i,
        step: o,
        value: r,
        "data-testid": `setting-${e.name}-slider`,
        "aria-label": e.usertext || e.name,
        onChange: (u) => n(Number(u.target.value))
      }
    ),
    /* @__PURE__ */ g.jsx(
      "input",
      {
        type: "number",
        value: r,
        min: l,
        max: i,
        step: o,
        "data-testid": `setting-${e.name}-num`,
        "aria-label": `${e.usertext || e.name} value`,
        onChange: (u) => n(Number(u.target.value))
      }
    )
  ] });
}
function am({ schema: e, value: t, onChange: n }) {
  const r = e.vallist ?? [];
  return /* @__PURE__ */ g.jsx(
    "select",
    {
      value: t == null ? "" : String(t),
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (l) => n(l.target.value),
      children: r.map((l) => /* @__PURE__ */ g.jsx("option", { value: l, children: l }, l))
    }
  );
}
function vi({ schema: e, value: t, onChange: n }) {
  const r = Array.isArray(t) ? JSON.stringify(t, null, 2) : "";
  return /* @__PURE__ */ g.jsx(
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
function sm({ schema: e, value: t, onChange: n }) {
  const r = e.vallist ?? [];
  return /* @__PURE__ */ g.jsx(
    "select",
    {
      value: t == null ? "" : String(t),
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (l) => n(l.target.value),
      children: r.map((l) => /* @__PURE__ */ g.jsx("option", { value: l, children: l }, l))
    }
  );
}
function Or({ schema: e, value: t, onChange: n }) {
  return /* @__PURE__ */ g.jsx(
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
function yi({
  schema: e,
  value: t,
  onChange: n,
  candidates: r = []
}) {
  const l = t == null ? "" : String(t), i = `wp-${e.name}`;
  return /* @__PURE__ */ g.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ g.jsx(
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
    /* @__PURE__ */ g.jsx("datalist", { id: i, children: r.map((o) => /* @__PURE__ */ g.jsx("option", { value: o }, o)) })
  ] });
}
const yf = {
  // Atomic
  str: Or,
  "str-notes": Or,
  bool: em,
  int: fo,
  float: fo,
  "float-or-auto": po,
  "int-or-auto": po,
  "float-slider": um,
  distance: hi,
  "distance-or-auto": (e) => /* @__PURE__ */ g.jsx(hi, { ...e, allowAuto: !0 }),
  displacement: hi,
  choice: Ee,
  "choice-or-more": (e) => /* @__PURE__ */ g.jsx(Ee, { ...e, editable: !0 }),
  "float-choice": (e) => /* @__PURE__ */ g.jsx(Ee, { ...e, editable: !0 }),
  color: tm,
  colormap: Ee,
  marker: sm,
  arrow: Ee,
  "line-style": am,
  "fill-style": Ee,
  "fill-style-ext": Ee,
  "errorbar-style": Ee,
  "align-horz": Ee,
  "align-vert": Ee,
  "align-horz-+manual": Ee,
  "align-vert-+manual": Ee,
  "font-family": Or,
  "font-style": Or,
  "rotate-interval": Ee,
  "axis-bound": bh,
  // List / composite
  "float-list": om,
  "float-dict": lm,
  "str-multi": vi,
  "line-multi": vi,
  "fill-multi": vi,
  // Reference-by-path
  dataset: Fr,
  "dataset-multi": Fr,
  "dataset-extended": Fr,
  "dataset-or-str": Fr,
  "widget-path": yi,
  "widget-choice": yi,
  axis: yi,
  // File-system
  filename: mi,
  "filename-image": mi,
  "filename-svg": mi,
  // Internal — kept hidden by the inspector via `setting.hidden`,
  // but mapped here so the registry-coverage assertions report 100%.
  "backward-compat": () => null
};
new Set(
  Object.keys(yf)
);
function cm(e) {
  return yf[e] ?? null;
}
function fm(e) {
  var s;
  const t = e.widgetPaths[0], n = e.widgetPaths.length > 1, [r, l] = M.useState({}), i = (c, d) => r[c] ?? !gf(d), o = (c, d) => l((p) => ({ ...p, [c]: d })), u = (c, d) => {
    var v;
    if (!n) {
      e.onChange(c, d);
      return;
    }
    const p = c.slice(t.length), y = e.widgetPaths.map((k) => ({ path: k + p, value: d }));
    (v = e.onChangeMany) == null || v.call(e, y);
  }, a = n ? `${((s = e.schema.typenames) == null ? void 0 : s.join(", ")) ?? "widgets"} ×${e.widgetPaths.length}` : e.schema.typename ?? "";
  return /* @__PURE__ */ g.jsxs(
    "div",
    {
      "data-testid": "inspector",
      "data-widget": t,
      "data-multi": n || void 0,
      "data-count": e.widgetPaths.length,
      children: [
        /* @__PURE__ */ g.jsx("h3", { "data-testid": "inspector-title", children: a }),
        /* @__PURE__ */ g.jsx(
          wf,
          {
            group: e.schema,
            basePath: t,
            widgetPath: t,
            values: e.values,
            datasets: e.datasets,
            onChange: u,
            settingMenu: e.settingMenu,
            groupOpen: i,
            setGroupOpen: o
          }
        )
      ]
    }
  );
}
function gf(e) {
  if (e.setnsmode) return e.setnsmode === "formatting";
  const t = e.settings.filter((n) => !n.hidden);
  return t.length > 0 ? t.every((n) => n.formatting) : e.subgroups.length > 0 ? e.subgroups.every(gf) : !1;
}
function wf({ group: e, basePath: t, widgetPath: n, values: r, datasets: l, onChange: i, settingMenu: o, groupLabel: u, groupOpen: a, setGroupOpen: s }) {
  return /* @__PURE__ */ g.jsxs(M.Fragment, { children: [
    e.settings.map(
      (c) => c.hidden ? null : /* @__PURE__ */ g.jsx(
        hm,
        {
          schema: c,
          basePath: t,
          widgetPath: n,
          value: r[ho(t, c.name)],
          datasets: l,
          onChange: i,
          settingMenu: o,
          groupLabel: u
        },
        c.name
      )
    ),
    e.subgroups.map((c) => {
      const d = c.usertext || mm(c.name), p = ho(t, c.name), y = a(p, c);
      return /* @__PURE__ */ g.jsxs(
        "details",
        {
          "data-testid": `subgroup-${c.name}`,
          open: y,
          onToggle: (v) => {
            const k = v.currentTarget, N = typeof k.open == "boolean" ? k.open : k.hasAttribute("open");
            N !== y && s(p, N);
          },
          children: [
            /* @__PURE__ */ g.jsx("summary", { children: d }),
            /* @__PURE__ */ g.jsx(
              wf,
              {
                group: c,
                basePath: p,
                widgetPath: n,
                values: r,
                datasets: l,
                onChange: i,
                settingMenu: o,
                groupLabel: d,
                groupOpen: a,
                setGroupOpen: s
              }
            )
          ]
        },
        c.name
      );
    })
  ] });
}
function dm(e, t) {
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
function pm(e, t, n) {
  return n ? !1 : t === void 0 ? !0 : dm(t, e.default);
}
function $a(e) {
  return {
    borderLeft: `2px solid ${e ? "transparent" : "#1f6feb"}`,
    paddingLeft: 6,
    opacity: e ? 0.5 : 1
  };
}
function hm({
  schema: e,
  basePath: t,
  widgetPath: n,
  value: r,
  datasets: l,
  onChange: i,
  settingMenu: o,
  groupLabel: u
}) {
  const a = cm(e.typename), s = ho(t, e.name), c = ym(e, u), d = e.mixed_value === !0, p = pm(e, r, d), y = (v) => o ? o(
    {
      path: s,
      name: e.name,
      widgetPath: n,
      isReference: e.is_reference === !0,
      isStylesheet: s.startsWith("/StyleSheet/")
    },
    v
  ) : v;
  return a ? /* @__PURE__ */ g.jsxs(
    "div",
    {
      "data-testid": `row-${e.name}`,
      "data-mixed": d || void 0,
      "data-default": p || void 0,
      style: $a(p),
      children: [
        y(
          /* @__PURE__ */ g.jsxs("label", { style: d ? { fontStyle: "italic", color: "#888" } : void 0, children: [
            c,
            d ? " (mixed)" : ""
          ] })
        ),
        /* @__PURE__ */ g.jsx(
          a,
          {
            schema: e,
            value: d ? void 0 : r,
            datasets: l,
            onChange: (v) => i(s, v)
          }
        )
      ]
    }
  ) : /* @__PURE__ */ g.jsxs(
    "div",
    {
      "data-testid": `row-${e.name}`,
      "data-mixed": d || void 0,
      "data-default": p || void 0,
      style: $a(p),
      children: [
        y(/* @__PURE__ */ g.jsx("label", { children: c })),
        /* @__PURE__ */ g.jsx("code", { "data-testid": `fallback-${e.name}`, children: r === void 0 ? "(unset)" : JSON.stringify(r) }),
        /* @__PURE__ */ g.jsxs("small", { children: [
          " [typename=",
          e.typename,
          "]"
        ] })
      ]
    }
  );
}
function ho(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
function mm(e) {
  if (!e) return e;
  const t = e.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
const vm = /* @__PURE__ */ new Set(["color", "hide", "width", "style"]);
function ym(e, t) {
  const n = e.usertext || e.name;
  return t ? vm.has(e.name) ? `${t} ${n.toLowerCase()}` : n : e.name === "color" && e.descr ? e.descr : n;
}
function gm({
  store: e,
  title: t,
  width: n,
  height: r,
  toolbar: l,
  onClose: i
}) {
  const o = e((S) => S.tree), u = e((S) => S.selected), a = e((S) => S.schema), s = e((S) => S.values), c = e((S) => S.datasets), d = e((S) => S.error), p = e((S) => S.canUndo), y = e((S) => S.canRedo), [v, k] = M.useState(!1), [N, h] = M.useState(!1);
  M.useEffect(() => {
    if (typeof document > "u") return;
    const S = document.documentElement, _ = document.body, C = S.style.overflow, R = _.style.overflow;
    return S.style.overflow = "hidden", _.style.overflow = "hidden", () => {
      S.style.overflow = C, _.style.overflow = R;
    };
  }, []);
  const f = () => {
    e.getState().undo();
  }, m = () => {
    e.getState().redo();
  }, x = async () => {
    h(!0);
    try {
      for (let S = 0; S < 1e3 && e.getState().canUndo; S++)
        await e.getState().undo();
    } finally {
      h(!1);
    }
  };
  return bc.createPortal(
    /* @__PURE__ */ g.jsx(
      "div",
      {
        "data-testid": "veusz-modal",
        style: wm,
        onMouseDown: (S) => {
          S.target === S.currentTarget && i();
        },
        children: /* @__PURE__ */ g.jsxs("div", { style: v ? Sm : Sf, "data-testid": "veusz-modal-window", children: [
          /* @__PURE__ */ g.jsxs("header", { style: xm, children: [
            /* @__PURE__ */ g.jsx("strong", { style: { fontSize: 14 }, children: t ?? "Edit figure" }),
            /* @__PURE__ */ g.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
              /* @__PURE__ */ g.jsx(
                "button",
                {
                  type: "button",
                  "data-testid": "veusz-undo",
                  onClick: f,
                  disabled: !p || N,
                  style: Mn,
                  title: "Undo last change",
                  children: "↶ Undo"
                }
              ),
              /* @__PURE__ */ g.jsx(
                "button",
                {
                  type: "button",
                  "data-testid": "veusz-redo",
                  onClick: m,
                  disabled: !y || N,
                  style: Mn,
                  title: "Redo",
                  children: "↷ Redo"
                }
              ),
              /* @__PURE__ */ g.jsx(
                "button",
                {
                  type: "button",
                  "data-testid": "veusz-reset",
                  onClick: () => void x(),
                  disabled: !p || N,
                  style: Mn,
                  title: "Reset all edits to the original figure",
                  children: "⟲ Reset"
                }
              )
            ] }),
            d && /* @__PURE__ */ g.jsx("span", { "data-testid": "veusz-error", style: { color: "crimson", fontSize: 12 }, children: d }),
            /* @__PURE__ */ g.jsx("span", { style: { flex: 1 } }),
            l,
            /* @__PURE__ */ g.jsx(
              "button",
              {
                type: "button",
                "data-testid": "veusz-modal-fullscreen",
                onClick: () => k((S) => !S),
                style: Mn,
                title: v ? "Exit full screen" : "Full screen",
                children: v ? "🗗" : "⛶"
              }
            ),
            /* @__PURE__ */ g.jsx(
              "button",
              {
                type: "button",
                "data-testid": "veusz-modal-close",
                onClick: i,
                style: Mn,
                title: "Close (Esc)",
                children: "✕"
              }
            )
          ] }),
          /* @__PURE__ */ g.jsxs("div", { style: km, children: [
            /* @__PURE__ */ g.jsx("div", { style: Em, children: /* @__PURE__ */ g.jsx(mf, { store: e, width: n, height: r }) }),
            /* @__PURE__ */ g.jsxs("aside", { style: _m, "data-testid": "veusz-edit-panel", children: [
              o ? /* @__PURE__ */ g.jsx(
                Zh,
                {
                  root: o,
                  selected: u,
                  onSelect: (S) => {
                    e.getState().select([S]);
                  }
                }
              ) : /* @__PURE__ */ g.jsx("p", { style: { color: "#888" }, children: "Loading…" }),
              /* @__PURE__ */ g.jsx("hr", { style: { border: 0, borderTop: "1px solid #eee", margin: "8px 0" } }),
              a && u.length > 0 ? /* @__PURE__ */ g.jsx(
                fm,
                {
                  schema: a,
                  widgetPaths: u,
                  values: s,
                  datasets: c.map((S) => S.name),
                  onChange: (S, _) => {
                    e.getState().setValue(S, _);
                  },
                  onChangeMany: (S) => {
                    e.getState().setValues(S);
                  }
                }
              ) : /* @__PURE__ */ g.jsx("p", { style: { color: "#888", fontSize: 13 }, children: "Select a widget to edit." })
            ] })
          ] })
        ] })
      }
    ),
    document.body
  );
}
const wm = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,17,21,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1e3,
  font: "14px system-ui, sans-serif"
}, Sf = {
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
}, Sm = {
  ...Sf,
  width: "100vw",
  height: "100vh",
  borderRadius: 0,
  resize: "none"
}, xm = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
  background: "#fafbfc",
  flex: "0 0 auto"
}, Mn = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
  padding: "3px 9px",
  lineHeight: 1
}, km = {
  flex: "1 1 auto",
  display: "flex",
  minHeight: 0,
  alignItems: "stretch"
}, Em = {
  flex: "1 1 auto",
  minWidth: 0,
  minHeight: 0,
  padding: 10,
  background: "#fff"
}, _m = {
  flex: "0 0 320px",
  width: 320,
  borderLeft: "1px solid #eee",
  padding: 10,
  overflow: "auto",
  overscrollBehavior: "contain",
  background: "#fff"
};
function Fa({ items: e, disabled: t, busy: n }) {
  const [r, l] = M.useState(!1), i = M.useRef(null);
  return M.useEffect(() => {
    if (!r) return;
    const o = (a) => {
      i.current && !i.current.contains(a.target) && l(!1);
    }, u = (a) => {
      a.key === "Escape" && l(!1);
    };
    return document.addEventListener("mousedown", o), document.addEventListener("keydown", u), () => {
      document.removeEventListener("mousedown", o), document.removeEventListener("keydown", u);
    };
  }, [r]), /* @__PURE__ */ g.jsxs("div", { ref: i, style: { position: "relative" }, children: [
    /* @__PURE__ */ g.jsx(
      "button",
      {
        type: "button",
        "data-testid": "veusz-download",
        disabled: t,
        "aria-haspopup": "menu",
        "aria-expanded": r,
        onClick: () => l((o) => !o),
        style: Cm,
        title: "Download this figure",
        children: n ? "…" : "⤓ Download ▾"
      }
    ),
    r && /* @__PURE__ */ g.jsx("div", { role: "menu", "data-testid": "veusz-download-menu", style: Pm, children: e.map((o) => {
      const u = /* @__PURE__ */ g.jsxs(g.Fragment, { children: [
        o.label,
        o.hint && /* @__PURE__ */ g.jsx("span", { style: { color: "#8b94a3", marginLeft: 8, fontSize: 11 }, children: o.hint })
      ] }), a = o.label, s = `download-${o.label.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
      return o.href ? /* @__PURE__ */ g.jsx(
        "a",
        {
          role: "menuitem",
          "data-testid": s,
          href: o.href,
          download: o.download,
          onClick: () => l(!1),
          style: Oa,
          children: u
        },
        a
      ) : /* @__PURE__ */ g.jsx(
        "button",
        {
          type: "button",
          role: "menuitem",
          "data-testid": s,
          onClick: () => {
            var c;
            l(!1), (c = o.onSelect) == null || c.call(o);
          },
          style: Oa,
          children: u
        },
        a
      );
    }) })
  ] });
}
const Cm = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 10px",
  cursor: "pointer",
  fontSize: 12,
  background: "#fff",
  color: "#222"
}, Pm = {
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
}, Oa = {
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
}, Ua = "veusz-embed-styles", zm = `
.vz-fig { position: relative; }
.vz-fig .vz-inline { display: block; }
.vz-fig .vz-preview { display: block; width: 100%; height: auto; background: #fff; }
`;
function xf() {
  if (typeof document > "u" || document.getElementById(Ua)) return;
  const e = document.createElement("style");
  e.id = Ua, e.textContent = zm, document.head.appendChild(e);
}
const an = 2;
async function Tm(e, t) {
  const { rpc: n } = e.getState(), r = await n.render.scene(t.page, t.width, t.height, t.dpi ?? 96), l = await cf(r.scene_b64, r.width, r.height);
  Rm(l, t.filename ?? "figure.svg", "image/svg+xml");
}
async function Nm(e, t) {
  const { rpc: n } = e.getState(), r = t.width * an, l = t.height * an, i = await n.render.scene(t.page, r, l, (t.dpi ?? 96) * an), o = await Ol(i.scene_b64, i.width, i.height, "image/png");
  fu(o, t.filename ?? "figure.png");
}
async function jm(e, t) {
  const { rpc: n } = e.getState(), r = t.width * an, l = t.height * an, i = await n.render.scene(t.page, r, l, (t.dpi ?? 96) * an), o = await Ol(i.scene_b64, i.width, i.height, "image/jpeg"), u = new Uint8Array(await o.arrayBuffer()), a = Lm(u, i.width, i.height, t.width, t.height);
  fu(new Blob([a], { type: "application/pdf" }), t.filename ?? "figure.pdf");
}
function Rm(e, t, n) {
  fu(new Blob([e], { type: n }), t);
}
function fu(e, t) {
  const n = URL.createObjectURL(e), r = document.createElement("a");
  r.href = n, r.download = t, document.body.appendChild(r), r.click(), r.remove(), setTimeout(() => URL.revokeObjectURL(n), 1e3);
}
function Lm(e, t, n, r, l) {
  const i = new TextEncoder(), o = [], u = [];
  let a = 0;
  const s = (N) => {
    const h = typeof N == "string" ? i.encode(N) : N;
    o.push(h), a += h.length;
  }, c = (N, h) => {
    u[N] = a, s(`${N} 0 obj
${h}
endobj
`);
  };
  s(`%PDF-1.4
`), c(1, "<< /Type /Catalog /Pages 2 0 R >>"), c(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>"), c(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${r} ${l}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`), u[4] = a, s(`4 0 obj
<< /Type /XObject /Subtype /Image /Width ${t} /Height ${n} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${e.length} >>
stream
`), s(e), s(`
endstream
endobj
`);
  const d = `q
${r} 0 0 ${l} 0 0 cm
/Im0 Do
Q
`;
  c(5, `<< /Length ${d.length} >>
stream
${d}endstream`);
  const p = a;
  let y = `xref
0 6
0000000000 65535 f 
`;
  for (let N = 1; N <= 5; N++) y += `${String(u[N]).padStart(10, "0")} 00000 n 
`;
  s(y), s(`trailer
<< /Size 6 /Root 1 0 R >>
startxref
${p}
%%EOF
`);
  const v = new Uint8Array(a);
  let k = 0;
  for (const N of o)
    v.set(N, k), k += N.length;
  return v;
}
xf();
function Dm({
  store: e,
  width: t = 700,
  height: n = 500,
  editable: r = !0,
  title: l,
  poster: i,
  vszUrl: o,
  initialEditing: u
}) {
  const a = e((j) => j.error), s = e((j) => j.webgpuAvailable), c = e((j) => j.currentPage), [d, p] = M.useState(!!u), [y, v] = M.useState(!1), [k, N] = M.useState(!1), [h, f] = M.useState(i), m = M.useRef(null);
  M.useEffect(() => {
    xf();
    const j = e.getState();
    return j.setBackend("vello-wasm"), j.probeWebgpu(), j.loadPlotPrefs(), j.refreshAll(), j.subscribeToDaemon();
  }, [e]), M.useEffect(() => {
    let j = !0;
    return sf().then((D) => {
      j && v(D);
    }), () => {
      j = !1;
    };
  }, []), M.useEffect(() => () => {
    m.current && URL.revokeObjectURL(m.current);
  }, []);
  const x = (j) => `${(l ?? "figure").replace(/\s+/g, "_")}.${j}`, S = async (j, D) => {
    N(!0);
    try {
      await j();
    } catch (b) {
      e.setState({ error: `${D} failed: ${b.message}` });
    } finally {
      N(!1);
    }
  }, _ = async () => {
    try {
      const j = await e.getState().rpc.render.scene(c, t, n, 96), D = await Ol(j.scene_b64, j.width, j.height, "image/png"), b = URL.createObjectURL(D);
      m.current && URL.revokeObjectURL(m.current), m.current = b, f(b);
    } catch {
    }
  }, C = () => {
    p(!1), h !== void 0 && _();
  }, R = () => {
    const j = [];
    return o && j.push({ label: "Veusz", href: o, download: x("vsz"), hint: ".vsz" }), y && j.push({ label: "SVG", hint: "vector", onSelect: () => void S(() => Tm(e, { page: c, width: t, height: n, filename: x("svg") }), "SVG export") }), j.push({ label: "PNG", hint: "image", onSelect: () => void S(() => Nm(e, { page: c, width: t, height: n, filename: x("png") }), "PNG export") }), j.push({ label: "PDF", hint: "page", onSelect: () => void S(() => jm(e, { page: c, width: t, height: n, filename: x("pdf") }), "PDF export") }), j;
  };
  return s === !1 ? /* @__PURE__ */ g.jsx("div", { "data-testid": "veusz-figure", className: "vz-fig", style: Aa, children: /* @__PURE__ */ g.jsx("div", { "data-testid": "veusz-needs-webgpu", style: { padding: 16, color: "#b06000" }, children: "This interactive figure needs WebGPU. Open in Chrome or Safari 26+." }) }) : /* @__PURE__ */ g.jsxs("div", { "data-testid": "veusz-figure", className: "vz-fig", style: Aa, children: [
    /* @__PURE__ */ g.jsxs("div", { className: "vz-toolbar", style: Mm, children: [
      /* @__PURE__ */ g.jsx(Fa, { items: R(), busy: k }),
      r && /* @__PURE__ */ g.jsx(
        "button",
        {
          type: "button",
          "data-testid": "veusz-edit-toggle",
          onClick: () => p(!0),
          style: Im,
          title: "Edit this figure",
          children: "✎ Edit"
        }
      )
    ] }),
    /* @__PURE__ */ g.jsxs("div", { className: "vz-inline", children: [
      h !== void 0 ? /* @__PURE__ */ g.jsx(
        "img",
        {
          src: h,
          alt: l ?? "Veusz figure",
          className: "vz-preview",
          "data-testid": "veusz-inline-poster"
        }
      ) : /* @__PURE__ */ g.jsx("div", { style: { height: Math.round(n / t * 100) + "%", minHeight: 200 }, children: /* @__PURE__ */ g.jsx(mf, { store: e, width: t, height: n }) }),
      a && !d && /* @__PURE__ */ g.jsx("div", { "data-testid": "veusz-error", style: $m, children: a })
    ] }),
    d && /* @__PURE__ */ g.jsx(
      gm,
      {
        store: e,
        title: l,
        width: t,
        height: n,
        toolbar: /* @__PURE__ */ g.jsx(Fa, { items: R(), busy: k }),
        onClose: C
      }
    )
  ] });
}
const Aa = {
  position: "relative",
  border: "1px solid #e2e4e8",
  borderRadius: 10,
  overflow: "hidden",
  background: "#fff",
  font: "14px system-ui, sans-serif"
}, Mm = {
  position: "absolute",
  top: 8,
  right: 8,
  zIndex: 3,
  display: "flex",
  gap: 6,
  alignItems: "flex-start"
}, Im = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 10px",
  cursor: "pointer",
  fontSize: 12,
  background: "#fff",
  color: "#222"
}, $m = {
  position: "absolute",
  left: 8,
  bottom: 8,
  color: "crimson",
  fontSize: 12,
  background: "rgba(255,255,255,0.9)",
  padding: "2px 6px",
  borderRadius: 4
}, Ba = "This interactive figure needs WebGPU. Open in Chrome or Safari 26+.";
class Fm extends HTMLElement {
  constructor() {
    super(...arguments);
    _n(this, "root", null);
    _n(this, "mounted", !1);
    _n(this, "noteEl", null);
    _n(this, "urlLinks", null);
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
    if (i.src = n, i.alt = this.getAttribute("title") ?? "Veusz figure", i.style.cssText = "display:block;width:100%;height:auto;", i.addEventListener("error", () => this.status(r.note ?? Ba)), l.appendChild(i), r.onActivate) {
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
    if (!await af()) {
      r ? this.showPoster(r, {
        note: "Static image — the interactive view needs WebGPU (Chrome or Safari 26+)."
      }) : this.status(Ba);
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
      const i = await Lh({
        wasmBase: this.getAttribute("wasm-base") ?? void 0,
        pyodideIndexUrl: this.getAttribute("pyodide-index") ?? void 0,
        veuszWheelUrl: this.getAttribute("veusz-wheel") ?? void 0,
        onProgress: (p) => {
          r ? this.setNote(p) : this.status(p);
        }
      }), o = await fetch(n);
      if (!o.ok) throw new Error(`fetch ${n}: ${o.status}`);
      const u = await o.text(), a = {
        urlBase: this.getAttribute("data-url-base") ?? new URL(".", new URL(n, location.href)).toString(),
        urlMap: Om(this.getAttribute("data-url-map"))
      };
      await Mh(u, i.transport, a);
      const s = await Oh(u, n, a);
      await i.loadVsz(u, s), this.urlLinks = await Dh(i.transport, a);
      const c = _h(Qp(i.transport));
      this.replaceChildren(), this.noteEl = null;
      const d = document.createElement("div");
      this.appendChild(d), this.root = ef(d), this.root.render(M.createElement(Dm, {
        store: c,
        width: Number(this.getAttribute("width") ?? 600),
        height: Number(this.getAttribute("height") ?? 400),
        editable: this.getAttribute("editable") !== "false",
        title: this.getAttribute("title") ?? void 0,
        poster: r,
        vszUrl: n,
        initialEditing: l
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
function Om(e) {
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
typeof customElements < "u" && !customElements.get("veusz-figure") && customElements.define("veusz-figure", Fm);
export {
  Fm as VeuszFigureElement
};
//# sourceMappingURL=veusz-embed.js.map
