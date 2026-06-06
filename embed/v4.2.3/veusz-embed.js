var Sf = Object.defineProperty;
var xf = (e, t, n) => t in e ? Sf(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Cn = (e, t, n) => xf(e, typeof t != "symbol" ? t + "" : t, n);
function Ua(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Ba = { exports: {} }, Re = {}, Va = { exports: {} }, O = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var fr = Symbol.for("react.element"), kf = Symbol.for("react.portal"), Ef = Symbol.for("react.fragment"), _f = Symbol.for("react.strict_mode"), Cf = Symbol.for("react.profiler"), Pf = Symbol.for("react.provider"), zf = Symbol.for("react.context"), Tf = Symbol.for("react.forward_ref"), Nf = Symbol.for("react.suspense"), jf = Symbol.for("react.memo"), Rf = Symbol.for("react.lazy"), vu = Symbol.iterator;
function Lf(e) {
  return e === null || typeof e != "object" ? null : (e = vu && e[vu] || e["@@iterator"], typeof e == "function" ? e : null);
}
var Wa = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, Ha = Object.assign, Qa = {};
function wn(e, t, n) {
  this.props = e, this.context = t, this.refs = Qa, this.updater = n || Wa;
}
wn.prototype.isReactComponent = {};
wn.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
wn.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function Ya() {
}
Ya.prototype = wn.prototype;
function mo(e, t, n) {
  this.props = e, this.context = t, this.refs = Qa, this.updater = n || Wa;
}
var vo = mo.prototype = new Ya();
vo.constructor = mo;
Ha(vo, wn.prototype);
vo.isPureReactComponent = !0;
var yu = Array.isArray, Xa = Object.prototype.hasOwnProperty, yo = { current: null }, Ka = { key: !0, ref: !0, __self: !0, __source: !0 };
function Ga(e, t, n) {
  var r, l = {}, i = null, o = null;
  if (t != null) for (r in t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (i = "" + t.key), t) Xa.call(t, r) && !Ka.hasOwnProperty(r) && (l[r] = t[r]);
  var u = arguments.length - 2;
  if (u === 1) l.children = n;
  else if (1 < u) {
    for (var a = Array(u), s = 0; s < u; s++) a[s] = arguments[s + 2];
    l.children = a;
  }
  if (e && e.defaultProps) for (r in u = e.defaultProps, u) l[r] === void 0 && (l[r] = u[r]);
  return { $$typeof: fr, type: e, key: i, ref: o, props: l, _owner: yo.current };
}
function Df(e, t) {
  return { $$typeof: fr, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function go(e) {
  return typeof e == "object" && e !== null && e.$$typeof === fr;
}
function Mf(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var gu = /\/+/g;
function Bl(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? Mf("" + e.key) : t.toString(36);
}
function Ar(e, t, n, r, l) {
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
        case kf:
          o = !0;
      }
  }
  if (o) return o = e, l = l(o), e = r === "" ? "." + Bl(o, 0) : r, yu(l) ? (n = "", e != null && (n = e.replace(gu, "$&/") + "/"), Ar(l, t, n, "", function(s) {
    return s;
  })) : l != null && (go(l) && (l = Df(l, n + (!l.key || o && o.key === l.key ? "" : ("" + l.key).replace(gu, "$&/") + "/") + e)), t.push(l)), 1;
  if (o = 0, r = r === "" ? "." : r + ":", yu(e)) for (var u = 0; u < e.length; u++) {
    i = e[u];
    var a = r + Bl(i, u);
    o += Ar(i, t, n, a, l);
  }
  else if (a = Lf(e), typeof a == "function") for (e = a.call(e), u = 0; !(i = e.next()).done; ) i = i.value, a = r + Bl(i, u++), o += Ar(i, t, n, a, l);
  else if (i === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return o;
}
function wr(e, t, n) {
  if (e == null) return e;
  var r = [], l = 0;
  return Ar(e, r, "", "", function(i) {
    return t.call(n, i, l++);
  }), r;
}
function If(e) {
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
var ge = { current: null }, Ur = { transition: null }, $f = { ReactCurrentDispatcher: ge, ReactCurrentBatchConfig: Ur, ReactCurrentOwner: yo };
function Za() {
  throw Error("act(...) is not supported in production builds of React.");
}
O.Children = { map: wr, forEach: function(e, t, n) {
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
O.Component = wn;
O.Fragment = Ef;
O.Profiler = Cf;
O.PureComponent = mo;
O.StrictMode = _f;
O.Suspense = Nf;
O.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = $f;
O.act = Za;
O.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = Ha({}, e.props), l = e.key, i = e.ref, o = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (i = t.ref, o = yo.current), t.key !== void 0 && (l = "" + t.key), e.type && e.type.defaultProps) var u = e.type.defaultProps;
    for (a in t) Xa.call(t, a) && !Ka.hasOwnProperty(a) && (r[a] = t[a] === void 0 && u !== void 0 ? u[a] : t[a]);
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
O.createContext = function(e) {
  return e = { $$typeof: zf, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: Pf, _context: e }, e.Consumer = e;
};
O.createElement = Ga;
O.createFactory = function(e) {
  var t = Ga.bind(null, e);
  return t.type = e, t;
};
O.createRef = function() {
  return { current: null };
};
O.forwardRef = function(e) {
  return { $$typeof: Tf, render: e };
};
O.isValidElement = go;
O.lazy = function(e) {
  return { $$typeof: Rf, _payload: { _status: -1, _result: e }, _init: If };
};
O.memo = function(e, t) {
  return { $$typeof: jf, type: e, compare: t === void 0 ? null : t };
};
O.startTransition = function(e) {
  var t = Ur.transition;
  Ur.transition = {};
  try {
    e();
  } finally {
    Ur.transition = t;
  }
};
O.unstable_act = Za;
O.useCallback = function(e, t) {
  return ge.current.useCallback(e, t);
};
O.useContext = function(e) {
  return ge.current.useContext(e);
};
O.useDebugValue = function() {
};
O.useDeferredValue = function(e) {
  return ge.current.useDeferredValue(e);
};
O.useEffect = function(e, t) {
  return ge.current.useEffect(e, t);
};
O.useId = function() {
  return ge.current.useId();
};
O.useImperativeHandle = function(e, t, n) {
  return ge.current.useImperativeHandle(e, t, n);
};
O.useInsertionEffect = function(e, t) {
  return ge.current.useInsertionEffect(e, t);
};
O.useLayoutEffect = function(e, t) {
  return ge.current.useLayoutEffect(e, t);
};
O.useMemo = function(e, t) {
  return ge.current.useMemo(e, t);
};
O.useReducer = function(e, t, n) {
  return ge.current.useReducer(e, t, n);
};
O.useRef = function(e) {
  return ge.current.useRef(e);
};
O.useState = function(e) {
  return ge.current.useState(e);
};
O.useSyncExternalStore = function(e, t, n) {
  return ge.current.useSyncExternalStore(e, t, n);
};
O.useTransition = function() {
  return ge.current.useTransition();
};
O.version = "18.3.1";
Va.exports = O;
var M = Va.exports;
const Ff = /* @__PURE__ */ Ua(M);
var Ja = { exports: {} }, qa = {};
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
  function t(z, I) {
    var $ = z.length;
    z.push(I);
    e: for (; 0 < $; ) {
      var x = $ - 1 >>> 1, L = z[x];
      if (0 < l(L, I)) z[x] = I, z[$] = L, $ = x;
      else break e;
    }
  }
  function n(z) {
    return z.length === 0 ? null : z[0];
  }
  function r(z) {
    if (z.length === 0) return null;
    var I = z[0], $ = z.pop();
    if ($ !== I) {
      z[0] = $;
      e: for (var x = 0, L = z.length, D = L >>> 1; x < D; ) {
        var F = 2 * (x + 1) - 1, Q = z[F], A = F + 1, B = z[A];
        if (0 > l(Q, $)) A < L && 0 > l(B, Q) ? (z[x] = B, z[A] = $, x = A) : (z[x] = Q, z[F] = $, x = F);
        else if (A < L && 0 > l(B, $)) z[x] = B, z[A] = $, x = A;
        else break e;
      }
    }
    return I;
  }
  function l(z, I) {
    var $ = z.sortIndex - I.sortIndex;
    return $ !== 0 ? $ : z.id - I.id;
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
  var a = [], s = [], c = 1, f = null, p = 3, y = !1, v = !1, S = !1, N = typeof setTimeout == "function" ? setTimeout : null, h = typeof clearTimeout == "function" ? clearTimeout : null, d = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function m(z) {
    for (var I = n(s); I !== null; ) {
      if (I.callback === null) r(s);
      else if (I.startTime <= z) r(s), I.sortIndex = I.expirationTime, t(a, I);
      else break;
      I = n(s);
    }
  }
  function w(z) {
    if (S = !1, m(z), !v) if (n(a) !== null) v = !0, kn(E);
    else {
      var I = n(s);
      I !== null && En(w, I.startTime - z);
    }
  }
  function E(z, I) {
    v = !1, S && (S = !1, h(P), P = -1), y = !0;
    var $ = p;
    try {
      for (m(I), f = n(a); f !== null && (!(f.expirationTime > I) || z && !X()); ) {
        var x = f.callback;
        if (typeof x == "function") {
          f.callback = null, p = f.priorityLevel;
          var L = x(f.expirationTime <= I);
          I = e.unstable_now(), typeof L == "function" ? f.callback = L : f === n(a) && r(a), m(I);
        } else r(a);
        f = n(a);
      }
      if (f !== null) var D = !0;
      else {
        var F = n(s);
        F !== null && En(w, F.startTime - I), D = !1;
      }
      return D;
    } finally {
      f = null, p = $, y = !1;
    }
  }
  var C = !1, _ = null, P = -1, j = 5, R = -1;
  function X() {
    return !(e.unstable_now() - R < j);
  }
  function Ye() {
    if (_ !== null) {
      var z = e.unstable_now();
      R = z;
      var I = !0;
      try {
        I = _(!0, z);
      } finally {
        I ? Nt() : (C = !1, _ = null);
      }
    } else C = !1;
  }
  var Nt;
  if (typeof d == "function") Nt = function() {
    d(Ye);
  };
  else if (typeof MessageChannel < "u") {
    var vr = new MessageChannel(), Ul = vr.port2;
    vr.port1.onmessage = Ye, Nt = function() {
      Ul.postMessage(null);
    };
  } else Nt = function() {
    N(Ye, 0);
  };
  function kn(z) {
    _ = z, C || (C = !0, Nt());
  }
  function En(z, I) {
    P = N(function() {
      z(e.unstable_now());
    }, I);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(z) {
    z.callback = null;
  }, e.unstable_continueExecution = function() {
    v || y || (v = !0, kn(E));
  }, e.unstable_forceFrameRate = function(z) {
    0 > z || 125 < z ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : j = 0 < z ? Math.floor(1e3 / z) : 5;
  }, e.unstable_getCurrentPriorityLevel = function() {
    return p;
  }, e.unstable_getFirstCallbackNode = function() {
    return n(a);
  }, e.unstable_next = function(z) {
    switch (p) {
      case 1:
      case 2:
      case 3:
        var I = 3;
        break;
      default:
        I = p;
    }
    var $ = p;
    p = I;
    try {
      return z();
    } finally {
      p = $;
    }
  }, e.unstable_pauseExecution = function() {
  }, e.unstable_requestPaint = function() {
  }, e.unstable_runWithPriority = function(z, I) {
    switch (z) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        z = 3;
    }
    var $ = p;
    p = z;
    try {
      return I();
    } finally {
      p = $;
    }
  }, e.unstable_scheduleCallback = function(z, I, $) {
    var x = e.unstable_now();
    switch (typeof $ == "object" && $ !== null ? ($ = $.delay, $ = typeof $ == "number" && 0 < $ ? x + $ : x) : $ = x, z) {
      case 1:
        var L = -1;
        break;
      case 2:
        L = 250;
        break;
      case 5:
        L = 1073741823;
        break;
      case 4:
        L = 1e4;
        break;
      default:
        L = 5e3;
    }
    return L = $ + L, z = { id: c++, callback: I, priorityLevel: z, startTime: $, expirationTime: L, sortIndex: -1 }, $ > x ? (z.sortIndex = $, t(s, z), n(a) === null && z === n(s) && (S ? (h(P), P = -1) : S = !0, En(w, $ - x))) : (z.sortIndex = L, t(a, z), v || y || (v = !0, kn(E))), z;
  }, e.unstable_shouldYield = X, e.unstable_wrapCallback = function(z) {
    var I = p;
    return function() {
      var $ = p;
      p = I;
      try {
        return z.apply(this, arguments);
      } finally {
        p = $;
      }
    };
  };
})(qa);
Ja.exports = qa;
var Of = Ja.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Af = M, je = Of;
function k(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var ba = /* @__PURE__ */ new Set(), Kn = {};
function Vt(e, t) {
  fn(e, t), fn(e + "Capture", t);
}
function fn(e, t) {
  for (Kn[e] = t, e = 0; e < t.length; e++) ba.add(t[e]);
}
var lt = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), gi = Object.prototype.hasOwnProperty, Uf = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, wu = {}, Su = {};
function Bf(e) {
  return gi.call(Su, e) ? !0 : gi.call(wu, e) ? !1 : Uf.test(e) ? Su[e] = !0 : (wu[e] = !0, !1);
}
function Vf(e, t, n, r) {
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
function Wf(e, t, n, r) {
  if (t === null || typeof t > "u" || Vf(e, t, n, r)) return !0;
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
function we(e, t, n, r, l, i, o) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = l, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = i, this.removeEmptyString = o;
}
var fe = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
  fe[e] = new we(e, 0, !1, e, null, !1, !1);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
  var t = e[0];
  fe[t] = new we(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
  fe[e] = new we(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
  fe[e] = new we(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
  fe[e] = new we(e, 3, !1, e.toLowerCase(), null, !1, !1);
});
["checked", "multiple", "muted", "selected"].forEach(function(e) {
  fe[e] = new we(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function(e) {
  fe[e] = new we(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function(e) {
  fe[e] = new we(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function(e) {
  fe[e] = new we(e, 5, !1, e.toLowerCase(), null, !1, !1);
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
  fe[t] = new we(t, 1, !1, e, null, !1, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(wo, So);
  fe[t] = new we(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(wo, So);
  fe[t] = new we(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  fe[e] = new we(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
fe.xlinkHref = new we("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function(e) {
  fe[e] = new we(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function xo(e, t, n, r) {
  var l = fe.hasOwnProperty(t) ? fe[t] : null;
  (l !== null ? l.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (Wf(t, n, l, r) && (n = null), r || l === null ? Bf(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : l.mustUseProperty ? e[l.propertyName] = n === null ? l.type === 3 ? !1 : "" : n : (t = l.attributeName, r = l.attributeNamespace, n === null ? e.removeAttribute(t) : (l = l.type, n = l === 3 || l === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var at = Af.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, Sr = Symbol.for("react.element"), Qt = Symbol.for("react.portal"), Yt = Symbol.for("react.fragment"), ko = Symbol.for("react.strict_mode"), wi = Symbol.for("react.profiler"), es = Symbol.for("react.provider"), ts = Symbol.for("react.context"), Eo = Symbol.for("react.forward_ref"), Si = Symbol.for("react.suspense"), xi = Symbol.for("react.suspense_list"), _o = Symbol.for("react.memo"), ct = Symbol.for("react.lazy"), ns = Symbol.for("react.offscreen"), xu = Symbol.iterator;
function Pn(e) {
  return e === null || typeof e != "object" ? null : (e = xu && e[xu] || e["@@iterator"], typeof e == "function" ? e : null);
}
var ee = Object.assign, Vl;
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
function Hf(e) {
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
    case Yt:
      return "Fragment";
    case Qt:
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
    case ts:
      return (e.displayName || "Context") + ".Consumer";
    case es:
      return (e._context.displayName || "Context") + ".Provider";
    case Eo:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case _o:
      return t = e.displayName || null, t !== null ? t : ki(e.type) || "Memo";
    case ct:
      t = e._payload, e = e._init;
      try {
        return ki(e(t));
      } catch {
      }
  }
  return null;
}
function Qf(e) {
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
function _t(e) {
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
function rs(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function Yf(e) {
  var t = rs(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
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
  e._valueTracker || (e._valueTracker = Yf(e));
}
function ls(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(), r = "";
  return e && (r = rs(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
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
  return ee({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function ku(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = _t(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function is(e, t) {
  t = t.checked, t != null && xo(e, "checked", t, !1);
}
function _i(e, t) {
  is(e, t);
  var n = _t(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? Ci(e, t.type, n) : t.hasOwnProperty("defaultValue") && Ci(e, t.type, _t(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
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
function rn(e, t, n, r) {
  if (e = e.options, t) {
    t = {};
    for (var l = 0; l < n.length; l++) t["$" + n[l]] = !0;
    for (n = 0; n < e.length; n++) l = t.hasOwnProperty("$" + e[n].value), e[n].selected !== l && (e[n].selected = l), l && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + _t(n), t = null, l = 0; l < e.length; l++) {
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
  if (t.dangerouslySetInnerHTML != null) throw Error(k(91));
  return ee({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function _u(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(k(92));
      if ($n(n)) {
        if (1 < n.length) throw Error(k(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = { initialValue: _t(n) };
}
function os(e, t) {
  var n = _t(t.value), r = _t(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function Cu(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function us(e) {
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
  return e == null || e === "http://www.w3.org/1999/xhtml" ? us(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var kr, as = function(e) {
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
var An = {
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
}, Xf = ["Webkit", "ms", "Moz", "O"];
Object.keys(An).forEach(function(e) {
  Xf.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), An[t] = An[e];
  });
});
function ss(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || An.hasOwnProperty(e) && An[e] ? ("" + t).trim() : t + "px";
}
function cs(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, l = ss(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, l) : e[n] = l;
  }
}
var Kf = ee({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
function Ti(e, t) {
  if (t) {
    if (Kf[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(k(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(k(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(k(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(k(62));
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
var Ri = null, ln = null, on = null;
function Pu(e) {
  if (e = hr(e)) {
    if (typeof Ri != "function") throw Error(k(280));
    var t = e.stateNode;
    t && (t = Cl(t), Ri(e.stateNode, e.type, t));
  }
}
function fs(e) {
  ln ? on ? on.push(e) : on = [e] : ln = e;
}
function ds() {
  if (ln) {
    var e = ln, t = on;
    if (on = ln = null, Pu(e), t) for (e = 0; e < t.length; e++) Pu(t[e]);
  }
}
function ps(e, t) {
  return e(t);
}
function hs() {
}
var Ql = !1;
function ms(e, t, n) {
  if (Ql) return e(t, n);
  Ql = !0;
  try {
    return ps(e, t, n);
  } finally {
    Ql = !1, (ln !== null || on !== null) && (hs(), ds());
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
  if (n && typeof n != "function") throw Error(k(231, t, typeof n));
  return n;
}
var Li = !1;
if (lt) try {
  var zn = {};
  Object.defineProperty(zn, "passive", { get: function() {
    Li = !0;
  } }), window.addEventListener("test", zn, zn), window.removeEventListener("test", zn, zn);
} catch {
  Li = !1;
}
function Gf(e, t, n, r, l, i, o, u, a) {
  var s = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, s);
  } catch (c) {
    this.onError(c);
  }
}
var Un = !1, qr = null, br = !1, Di = null, Zf = { onError: function(e) {
  Un = !0, qr = e;
} };
function Jf(e, t, n, r, l, i, o, u, a) {
  Un = !1, qr = null, Gf.apply(Zf, arguments);
}
function qf(e, t, n, r, l, i, o, u, a) {
  if (Jf.apply(this, arguments), Un) {
    if (Un) {
      var s = qr;
      Un = !1, qr = null;
    } else throw Error(k(198));
    br || (br = !0, Di = s);
  }
}
function Wt(e) {
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
function vs(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function zu(e) {
  if (Wt(e) !== e) throw Error(k(188));
}
function bf(e) {
  var t = e.alternate;
  if (!t) {
    if (t = Wt(e), t === null) throw Error(k(188));
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
      throw Error(k(188));
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
        if (!o) throw Error(k(189));
      }
    }
    if (n.alternate !== r) throw Error(k(190));
  }
  if (n.tag !== 3) throw Error(k(188));
  return n.stateNode.current === n ? e : t;
}
function ys(e) {
  return e = bf(e), e !== null ? gs(e) : null;
}
function gs(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = gs(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var ws = je.unstable_scheduleCallback, Tu = je.unstable_cancelCallback, ed = je.unstable_shouldYield, td = je.unstable_requestPaint, ne = je.unstable_now, nd = je.unstable_getCurrentPriorityLevel, Po = je.unstable_ImmediatePriority, Ss = je.unstable_UserBlockingPriority, el = je.unstable_NormalPriority, rd = je.unstable_LowPriority, xs = je.unstable_IdlePriority, xl = null, Je = null;
function ld(e) {
  if (Je && typeof Je.onCommitFiberRoot == "function") try {
    Je.onCommitFiberRoot(xl, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var We = Math.clz32 ? Math.clz32 : ud, id = Math.log, od = Math.LN2;
function ud(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (id(e) / od | 0) | 0;
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
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - We(t), l = 1 << n, r |= e[n], t &= ~l;
  return r;
}
function ad(e, t) {
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
function sd(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, i = e.pendingLanes; 0 < i; ) {
    var o = 31 - We(i), u = 1 << o, a = l[o];
    a === -1 ? (!(u & n) || u & r) && (l[o] = ad(u, t)) : a <= t && (e.expiredLanes |= u), i &= ~u;
  }
}
function Mi(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function ks() {
  var e = Er;
  return Er <<= 1, !(Er & 4194240) && (Er = 64), e;
}
function Yl(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function dr(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - We(t), e[t] = n;
}
function cd(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var l = 31 - We(n), i = 1 << l;
    t[l] = 0, r[l] = -1, e[l] = -1, n &= ~i;
  }
}
function zo(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
    var r = 31 - We(n), l = 1 << r;
    l & t | e[r] & t && (e[r] |= t), n &= ~l;
  }
}
var H = 0;
function Es(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var _s, To, Cs, Ps, zs, Ii = !1, Cr = [], vt = null, yt = null, gt = null, Jn = /* @__PURE__ */ new Map(), qn = /* @__PURE__ */ new Map(), dt = [], fd = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function Nu(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      vt = null;
      break;
    case "dragenter":
    case "dragleave":
      yt = null;
      break;
    case "mouseover":
    case "mouseout":
      gt = null;
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
function Tn(e, t, n, r, l, i) {
  return e === null || e.nativeEvent !== i ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: i, targetContainers: [l] }, t !== null && (t = hr(t), t !== null && To(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, l !== null && t.indexOf(l) === -1 && t.push(l), e);
}
function dd(e, t, n, r, l) {
  switch (t) {
    case "focusin":
      return vt = Tn(vt, e, t, n, r, l), !0;
    case "dragenter":
      return yt = Tn(yt, e, t, n, r, l), !0;
    case "mouseover":
      return gt = Tn(gt, e, t, n, r, l), !0;
    case "pointerover":
      var i = l.pointerId;
      return Jn.set(i, Tn(Jn.get(i) || null, e, t, n, r, l)), !0;
    case "gotpointercapture":
      return i = l.pointerId, qn.set(i, Tn(qn.get(i) || null, e, t, n, r, l)), !0;
  }
  return !1;
}
function Ts(e) {
  var t = Lt(e.target);
  if (t !== null) {
    var n = Wt(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = vs(n), t !== null) {
          e.blockedOn = t, zs(e.priority, function() {
            Cs(n);
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
function pd() {
  Ii = !1, vt !== null && Br(vt) && (vt = null), yt !== null && Br(yt) && (yt = null), gt !== null && Br(gt) && (gt = null), Jn.forEach(ju), qn.forEach(ju);
}
function Nn(e, t) {
  e.blockedOn === t && (e.blockedOn = null, Ii || (Ii = !0, je.unstable_scheduleCallback(je.unstable_NormalPriority, pd)));
}
function bn(e) {
  function t(l) {
    return Nn(l, e);
  }
  if (0 < Cr.length) {
    Nn(Cr[0], e);
    for (var n = 1; n < Cr.length; n++) {
      var r = Cr[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (vt !== null && Nn(vt, e), yt !== null && Nn(yt, e), gt !== null && Nn(gt, e), Jn.forEach(t), qn.forEach(t), n = 0; n < dt.length; n++) r = dt[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < dt.length && (n = dt[0], n.blockedOn === null); ) Ts(n), n.blockedOn === null && dt.shift();
}
var un = at.ReactCurrentBatchConfig, nl = !0;
function hd(e, t, n, r) {
  var l = H, i = un.transition;
  un.transition = null;
  try {
    H = 1, No(e, t, n, r);
  } finally {
    H = l, un.transition = i;
  }
}
function md(e, t, n, r) {
  var l = H, i = un.transition;
  un.transition = null;
  try {
    H = 4, No(e, t, n, r);
  } finally {
    H = l, un.transition = i;
  }
}
function No(e, t, n, r) {
  if (nl) {
    var l = $i(e, t, n, r);
    if (l === null) ni(e, t, r, rl, n), Nu(e, r);
    else if (dd(l, e, t, n, r)) r.stopPropagation();
    else if (Nu(e, r), t & 4 && -1 < fd.indexOf(e)) {
      for (; l !== null; ) {
        var i = hr(l);
        if (i !== null && _s(i), i = $i(e, t, n, r), i === null && ni(e, t, r, rl, n), i === l) break;
        l = i;
      }
      l !== null && r.stopPropagation();
    } else ni(e, t, r, null, n);
  }
}
var rl = null;
function $i(e, t, n, r) {
  if (rl = null, e = Co(r), e = Lt(e), e !== null) if (t = Wt(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = vs(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return rl = e, null;
}
function Ns(e) {
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
      switch (nd()) {
        case Po:
          return 1;
        case Ss:
          return 4;
        case el:
        case rd:
          return 16;
        case xs:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var ht = null, jo = null, Vr = null;
function js() {
  if (Vr) return Vr;
  var e, t = jo, n = t.length, r, l = "value" in ht ? ht.value : ht.textContent, i = l.length;
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
function Le(e) {
  function t(n, r, l, i, o) {
    this._reactName = n, this._targetInst = l, this.type = r, this.nativeEvent = i, this.target = o, this.currentTarget = null;
    for (var u in e) e.hasOwnProperty(u) && (n = e[u], this[u] = n ? n(i) : i[u]);
    return this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1) ? Pr : Ru, this.isPropagationStopped = Ru, this;
  }
  return ee(t.prototype, { preventDefault: function() {
    this.defaultPrevented = !0;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = Pr);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = Pr);
  }, persist: function() {
  }, isPersistent: Pr }), t;
}
var Sn = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, Ro = Le(Sn), pr = ee({}, Sn, { view: 0, detail: 0 }), vd = Le(pr), Xl, Kl, jn, kl = ee({}, pr, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: Lo, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== jn && (jn && e.type === "mousemove" ? (Xl = e.screenX - jn.screenX, Kl = e.screenY - jn.screenY) : Kl = Xl = 0, jn = e), Xl);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : Kl;
} }), Lu = Le(kl), yd = ee({}, kl, { dataTransfer: 0 }), gd = Le(yd), wd = ee({}, pr, { relatedTarget: 0 }), Gl = Le(wd), Sd = ee({}, Sn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), xd = Le(Sd), kd = ee({}, Sn, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), Ed = Le(kd), _d = ee({}, Sn, { data: 0 }), Du = Le(_d), Cd = {
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
}, Pd = {
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
}, zd = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function Td(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = zd[e]) ? !!t[e] : !1;
}
function Lo() {
  return Td;
}
var Nd = ee({}, pr, { key: function(e) {
  if (e.key) {
    var t = Cd[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = Wr(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Pd[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: Lo, charCode: function(e) {
  return e.type === "keypress" ? Wr(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? Wr(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), jd = Le(Nd), Rd = ee({}, kl, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Mu = Le(Rd), Ld = ee({}, pr, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: Lo }), Dd = Le(Ld), Md = ee({}, Sn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Id = Le(Md), $d = ee({}, kl, {
  deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  },
  deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), Fd = Le($d), Od = [9, 13, 27, 32], Do = lt && "CompositionEvent" in window, Bn = null;
lt && "documentMode" in document && (Bn = document.documentMode);
var Ad = lt && "TextEvent" in window && !Bn, Rs = lt && (!Do || Bn && 8 < Bn && 11 >= Bn), Iu = " ", $u = !1;
function Ls(e, t) {
  switch (e) {
    case "keyup":
      return Od.indexOf(t.keyCode) !== -1;
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
function Ds(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var Xt = !1;
function Ud(e, t) {
  switch (e) {
    case "compositionend":
      return Ds(t);
    case "keypress":
      return t.which !== 32 ? null : ($u = !0, Iu);
    case "textInput":
      return e = t.data, e === Iu && $u ? null : e;
    default:
      return null;
  }
}
function Bd(e, t) {
  if (Xt) return e === "compositionend" || !Do && Ls(e, t) ? (e = js(), Vr = jo = ht = null, Xt = !1, e) : null;
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
      return Rs && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var Vd = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
function Fu(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!Vd[e.type] : t === "textarea";
}
function Ms(e, t, n, r) {
  fs(r), t = ll(t, "onChange"), 0 < t.length && (n = new Ro("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var Vn = null, er = null;
function Wd(e) {
  Qs(e, 0);
}
function El(e) {
  var t = Zt(e);
  if (ls(t)) return e;
}
function Hd(e, t) {
  if (e === "change") return t;
}
var Is = !1;
if (lt) {
  var Zl;
  if (lt) {
    var Jl = "oninput" in document;
    if (!Jl) {
      var Ou = document.createElement("div");
      Ou.setAttribute("oninput", "return;"), Jl = typeof Ou.oninput == "function";
    }
    Zl = Jl;
  } else Zl = !1;
  Is = Zl && (!document.documentMode || 9 < document.documentMode);
}
function Au() {
  Vn && (Vn.detachEvent("onpropertychange", $s), er = Vn = null);
}
function $s(e) {
  if (e.propertyName === "value" && El(er)) {
    var t = [];
    Ms(t, er, e, Co(e)), ms(Wd, t);
  }
}
function Qd(e, t, n) {
  e === "focusin" ? (Au(), Vn = t, er = n, Vn.attachEvent("onpropertychange", $s)) : e === "focusout" && Au();
}
function Yd(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return El(er);
}
function Xd(e, t) {
  if (e === "click") return El(t);
}
function Kd(e, t) {
  if (e === "input" || e === "change") return El(t);
}
function Gd(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Qe = typeof Object.is == "function" ? Object.is : Gd;
function tr(e, t) {
  if (Qe(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var l = n[r];
    if (!gi.call(t, l) || !Qe(e[l], t[l])) return !1;
  }
  return !0;
}
function Uu(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function Bu(e, t) {
  var n = Uu(e);
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
    n = Uu(n);
  }
}
function Fs(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Fs(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function Os() {
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
function Zd(e) {
  var t = Os(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && Fs(n.ownerDocument.documentElement, n)) {
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
var Jd = lt && "documentMode" in document && 11 >= document.documentMode, Kt = null, Fi = null, Wn = null, Oi = !1;
function Vu(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Oi || Kt == null || Kt !== Jr(r) || (r = Kt, "selectionStart" in r && Mo(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), Wn && tr(Wn, r) || (Wn = r, r = ll(Fi, "onSelect"), 0 < r.length && (t = new Ro("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = Kt)));
}
function zr(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var Gt = { animationend: zr("Animation", "AnimationEnd"), animationiteration: zr("Animation", "AnimationIteration"), animationstart: zr("Animation", "AnimationStart"), transitionend: zr("Transition", "TransitionEnd") }, ql = {}, As = {};
lt && (As = document.createElement("div").style, "AnimationEvent" in window || (delete Gt.animationend.animation, delete Gt.animationiteration.animation, delete Gt.animationstart.animation), "TransitionEvent" in window || delete Gt.transitionend.transition);
function _l(e) {
  if (ql[e]) return ql[e];
  if (!Gt[e]) return e;
  var t = Gt[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in As) return ql[e] = t[n];
  return e;
}
var Us = _l("animationend"), Bs = _l("animationiteration"), Vs = _l("animationstart"), Ws = _l("transitionend"), Hs = /* @__PURE__ */ new Map(), Wu = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function Pt(e, t) {
  Hs.set(e, t), Vt(t, [e]);
}
for (var bl = 0; bl < Wu.length; bl++) {
  var ei = Wu[bl], qd = ei.toLowerCase(), bd = ei[0].toUpperCase() + ei.slice(1);
  Pt(qd, "on" + bd);
}
Pt(Us, "onAnimationEnd");
Pt(Bs, "onAnimationIteration");
Pt(Vs, "onAnimationStart");
Pt("dblclick", "onDoubleClick");
Pt("focusin", "onFocus");
Pt("focusout", "onBlur");
Pt(Ws, "onTransitionEnd");
fn("onMouseEnter", ["mouseout", "mouseover"]);
fn("onMouseLeave", ["mouseout", "mouseover"]);
fn("onPointerEnter", ["pointerout", "pointerover"]);
fn("onPointerLeave", ["pointerout", "pointerover"]);
Vt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
Vt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
Vt("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Vt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
Vt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
Vt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var On = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), ep = new Set("cancel close invalid load scroll toggle".split(" ").concat(On));
function Hu(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, qf(r, t, void 0, e), e.currentTarget = null;
}
function Qs(e, t) {
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
function K(e, t) {
  var n = t[Wi];
  n === void 0 && (n = t[Wi] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (Ys(t, e, 2, !1), n.add(r));
}
function ti(e, t, n) {
  var r = 0;
  t && (r |= 4), Ys(n, e, r, t);
}
var Tr = "_reactListening" + Math.random().toString(36).slice(2);
function nr(e) {
  if (!e[Tr]) {
    e[Tr] = !0, ba.forEach(function(n) {
      n !== "selectionchange" && (ep.has(n) || ti(n, !1, e), ti(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Tr] || (t[Tr] = !0, ti("selectionchange", !1, t));
  }
}
function Ys(e, t, n, r) {
  switch (Ns(t)) {
    case 1:
      var l = hd;
      break;
    case 4:
      l = md;
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
        if (o = Lt(u), o === null) return;
        if (a = o.tag, a === 5 || a === 6) {
          r = i = o;
          continue e;
        }
        u = u.parentNode;
      }
    }
    r = r.return;
  }
  ms(function() {
    var s = i, c = Co(n), f = [];
    e: {
      var p = Hs.get(e);
      if (p !== void 0) {
        var y = Ro, v = e;
        switch (e) {
          case "keypress":
            if (Wr(n) === 0) break e;
          case "keydown":
          case "keyup":
            y = jd;
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
            y = gd;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            y = Dd;
            break;
          case Us:
          case Bs:
          case Vs:
            y = xd;
            break;
          case Ws:
            y = Id;
            break;
          case "scroll":
            y = vd;
            break;
          case "wheel":
            y = Fd;
            break;
          case "copy":
          case "cut":
          case "paste":
            y = Ed;
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
        var S = (t & 4) !== 0, N = !S && e === "scroll", h = S ? p !== null ? p + "Capture" : null : p;
        S = [];
        for (var d = s, m; d !== null; ) {
          m = d;
          var w = m.stateNode;
          if (m.tag === 5 && w !== null && (m = w, h !== null && (w = Zn(d, h), w != null && S.push(rr(d, w, m)))), N) break;
          d = d.return;
        }
        0 < S.length && (p = new y(p, v, null, n, c), f.push({ event: p, listeners: S }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (p = e === "mouseover" || e === "pointerover", y = e === "mouseout" || e === "pointerout", p && n !== ji && (v = n.relatedTarget || n.fromElement) && (Lt(v) || v[it])) break e;
        if ((y || p) && (p = c.window === c ? c : (p = c.ownerDocument) ? p.defaultView || p.parentWindow : window, y ? (v = n.relatedTarget || n.toElement, y = s, v = v ? Lt(v) : null, v !== null && (N = Wt(v), v !== N || v.tag !== 5 && v.tag !== 6) && (v = null)) : (y = null, v = s), y !== v)) {
          if (S = Lu, w = "onMouseLeave", h = "onMouseEnter", d = "mouse", (e === "pointerout" || e === "pointerover") && (S = Mu, w = "onPointerLeave", h = "onPointerEnter", d = "pointer"), N = y == null ? p : Zt(y), m = v == null ? p : Zt(v), p = new S(w, d + "leave", y, n, c), p.target = N, p.relatedTarget = m, w = null, Lt(c) === s && (S = new S(h, d + "enter", v, n, c), S.target = m, S.relatedTarget = N, w = S), N = w, y && v) t: {
            for (S = y, h = v, d = 0, m = S; m; m = Ht(m)) d++;
            for (m = 0, w = h; w; w = Ht(w)) m++;
            for (; 0 < d - m; ) S = Ht(S), d--;
            for (; 0 < m - d; ) h = Ht(h), m--;
            for (; d--; ) {
              if (S === h || h !== null && S === h.alternate) break t;
              S = Ht(S), h = Ht(h);
            }
            S = null;
          }
          else S = null;
          y !== null && Qu(f, p, y, S, !1), v !== null && N !== null && Qu(f, N, v, S, !0);
        }
      }
      e: {
        if (p = s ? Zt(s) : window, y = p.nodeName && p.nodeName.toLowerCase(), y === "select" || y === "input" && p.type === "file") var E = Hd;
        else if (Fu(p)) if (Is) E = Kd;
        else {
          E = Yd;
          var C = Qd;
        }
        else (y = p.nodeName) && y.toLowerCase() === "input" && (p.type === "checkbox" || p.type === "radio") && (E = Xd);
        if (E && (E = E(e, s))) {
          Ms(f, E, n, c);
          break e;
        }
        C && C(e, p, s), e === "focusout" && (C = p._wrapperState) && C.controlled && p.type === "number" && Ci(p, "number", p.value);
      }
      switch (C = s ? Zt(s) : window, e) {
        case "focusin":
          (Fu(C) || C.contentEditable === "true") && (Kt = C, Fi = s, Wn = null);
          break;
        case "focusout":
          Wn = Fi = Kt = null;
          break;
        case "mousedown":
          Oi = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Oi = !1, Vu(f, n, c);
          break;
        case "selectionchange":
          if (Jd) break;
        case "keydown":
        case "keyup":
          Vu(f, n, c);
      }
      var _;
      if (Do) e: {
        switch (e) {
          case "compositionstart":
            var P = "onCompositionStart";
            break e;
          case "compositionend":
            P = "onCompositionEnd";
            break e;
          case "compositionupdate":
            P = "onCompositionUpdate";
            break e;
        }
        P = void 0;
      }
      else Xt ? Ls(e, n) && (P = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (P = "onCompositionStart");
      P && (Rs && n.locale !== "ko" && (Xt || P !== "onCompositionStart" ? P === "onCompositionEnd" && Xt && (_ = js()) : (ht = c, jo = "value" in ht ? ht.value : ht.textContent, Xt = !0)), C = ll(s, P), 0 < C.length && (P = new Du(P, e, null, n, c), f.push({ event: P, listeners: C }), _ ? P.data = _ : (_ = Ds(n), _ !== null && (P.data = _)))), (_ = Ad ? Ud(e, n) : Bd(e, n)) && (s = ll(s, "onBeforeInput"), 0 < s.length && (c = new Du("onBeforeInput", "beforeinput", null, n, c), f.push({ event: c, listeners: s }), c.data = _));
    }
    Qs(f, t);
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
function Ht(e) {
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
var tp = /\r\n?/g, np = /\u0000|\uFFFD/g;
function Yu(e) {
  return (typeof e == "string" ? e : "" + e).replace(tp, `
`).replace(np, "");
}
function Nr(e, t, n) {
  if (t = Yu(t), Yu(e) !== t && n) throw Error(k(425));
}
function il() {
}
var Ai = null, Ui = null;
function Bi(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var Vi = typeof setTimeout == "function" ? setTimeout : void 0, rp = typeof clearTimeout == "function" ? clearTimeout : void 0, Xu = typeof Promise == "function" ? Promise : void 0, lp = typeof queueMicrotask == "function" ? queueMicrotask : typeof Xu < "u" ? function(e) {
  return Xu.resolve(null).then(e).catch(ip);
} : Vi;
function ip(e) {
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
function wt(e) {
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
var xn = Math.random().toString(36).slice(2), Ze = "__reactFiber$" + xn, lr = "__reactProps$" + xn, it = "__reactContainer$" + xn, Wi = "__reactEvents$" + xn, op = "__reactListeners$" + xn, up = "__reactHandles$" + xn;
function Lt(e) {
  var t = e[Ze];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[it] || n[Ze]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = Ku(e); e !== null; ) {
        if (n = e[Ze]) return n;
        e = Ku(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function hr(e) {
  return e = e[Ze] || e[it], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function Zt(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(k(33));
}
function Cl(e) {
  return e[lr] || null;
}
var Hi = [], Jt = -1;
function zt(e) {
  return { current: e };
}
function G(e) {
  0 > Jt || (e.current = Hi[Jt], Hi[Jt] = null, Jt--);
}
function Y(e, t) {
  Jt++, Hi[Jt] = e.current, e.current = t;
}
var Ct = {}, me = zt(Ct), ke = zt(!1), Ft = Ct;
function dn(e, t) {
  var n = e.type.contextTypes;
  if (!n) return Ct;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var l = {}, i;
  for (i in n) l[i] = t[i];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = l), l;
}
function Ee(e) {
  return e = e.childContextTypes, e != null;
}
function ol() {
  G(ke), G(me);
}
function Gu(e, t, n) {
  if (me.current !== Ct) throw Error(k(168));
  Y(me, t), Y(ke, n);
}
function Xs(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var l in r) if (!(l in t)) throw Error(k(108, Qf(e) || "Unknown", l));
  return ee({}, n, r);
}
function ul(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Ct, Ft = me.current, Y(me, e), Y(ke, ke.current), !0;
}
function Zu(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(k(169));
  n ? (e = Xs(e, t, Ft), r.__reactInternalMemoizedMergedChildContext = e, G(ke), G(me), Y(me, e)) : G(ke), Y(ke, n);
}
var et = null, Pl = !1, li = !1;
function Ks(e) {
  et === null ? et = [e] : et.push(e);
}
function ap(e) {
  Pl = !0, Ks(e);
}
function Tt() {
  if (!li && et !== null) {
    li = !0;
    var e = 0, t = H;
    try {
      var n = et;
      for (H = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(!0);
        while (r !== null);
      }
      et = null, Pl = !1;
    } catch (l) {
      throw et !== null && (et = et.slice(e + 1)), ws(Po, Tt), l;
    } finally {
      H = t, li = !1;
    }
  }
  return null;
}
var qt = [], bt = 0, al = null, sl = 0, De = [], Me = 0, Ot = null, tt = 1, nt = "";
function jt(e, t) {
  qt[bt++] = sl, qt[bt++] = al, al = e, sl = t;
}
function Gs(e, t, n) {
  De[Me++] = tt, De[Me++] = nt, De[Me++] = Ot, Ot = e;
  var r = tt;
  e = nt;
  var l = 32 - We(r) - 1;
  r &= ~(1 << l), n += 1;
  var i = 32 - We(t) + l;
  if (30 < i) {
    var o = l - l % 5;
    i = (r & (1 << o) - 1).toString(32), r >>= o, l -= o, tt = 1 << 32 - We(t) + l | n << l | r, nt = i + e;
  } else tt = 1 << i | n << l | r, nt = e;
}
function Io(e) {
  e.return !== null && (jt(e, 1), Gs(e, 1, 0));
}
function $o(e) {
  for (; e === al; ) al = qt[--bt], qt[bt] = null, sl = qt[--bt], qt[bt] = null;
  for (; e === Ot; ) Ot = De[--Me], De[Me] = null, nt = De[--Me], De[Me] = null, tt = De[--Me], De[Me] = null;
}
var Ne = null, Te = null, Z = !1, Ve = null;
function Zs(e, t) {
  var n = Ie(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function Ju(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, Ne = e, Te = wt(t.firstChild), !0) : !1;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, Ne = e, Te = null, !0) : !1;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = Ot !== null ? { id: tt, overflow: nt } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = Ie(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, Ne = e, Te = null, !0) : !1;
    default:
      return !1;
  }
}
function Qi(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function Yi(e) {
  if (Z) {
    var t = Te;
    if (t) {
      var n = t;
      if (!Ju(e, t)) {
        if (Qi(e)) throw Error(k(418));
        t = wt(n.nextSibling);
        var r = Ne;
        t && Ju(e, t) ? Zs(r, n) : (e.flags = e.flags & -4097 | 2, Z = !1, Ne = e);
      }
    } else {
      if (Qi(e)) throw Error(k(418));
      e.flags = e.flags & -4097 | 2, Z = !1, Ne = e;
    }
  }
}
function qu(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  Ne = e;
}
function jr(e) {
  if (e !== Ne) return !1;
  if (!Z) return qu(e), Z = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !Bi(e.type, e.memoizedProps)), t && (t = Te)) {
    if (Qi(e)) throw Js(), Error(k(418));
    for (; t; ) Zs(e, t), t = wt(t.nextSibling);
  }
  if (qu(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(k(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              Te = wt(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      Te = null;
    }
  } else Te = Ne ? wt(e.stateNode.nextSibling) : null;
  return !0;
}
function Js() {
  for (var e = Te; e; ) e = wt(e.nextSibling);
}
function pn() {
  Te = Ne = null, Z = !1;
}
function Fo(e) {
  Ve === null ? Ve = [e] : Ve.push(e);
}
var sp = at.ReactCurrentBatchConfig;
function Rn(e, t, n) {
  if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
    if (n._owner) {
      if (n = n._owner, n) {
        if (n.tag !== 1) throw Error(k(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(k(147, e));
      var l = r, i = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === i ? t.ref : (t = function(o) {
        var u = l.refs;
        o === null ? delete u[i] : u[i] = o;
      }, t._stringRef = i, t);
    }
    if (typeof e != "string") throw Error(k(284));
    if (!n._owner) throw Error(k(290, e));
  }
  return e;
}
function Rr(e, t) {
  throw e = Object.prototype.toString.call(t), Error(k(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function bu(e) {
  var t = e._init;
  return t(e._payload);
}
function qs(e) {
  function t(h, d) {
    if (e) {
      var m = h.deletions;
      m === null ? (h.deletions = [d], h.flags |= 16) : m.push(d);
    }
  }
  function n(h, d) {
    if (!e) return null;
    for (; d !== null; ) t(h, d), d = d.sibling;
    return null;
  }
  function r(h, d) {
    for (h = /* @__PURE__ */ new Map(); d !== null; ) d.key !== null ? h.set(d.key, d) : h.set(d.index, d), d = d.sibling;
    return h;
  }
  function l(h, d) {
    return h = Et(h, d), h.index = 0, h.sibling = null, h;
  }
  function i(h, d, m) {
    return h.index = m, e ? (m = h.alternate, m !== null ? (m = m.index, m < d ? (h.flags |= 2, d) : m) : (h.flags |= 2, d)) : (h.flags |= 1048576, d);
  }
  function o(h) {
    return e && h.alternate === null && (h.flags |= 2), h;
  }
  function u(h, d, m, w) {
    return d === null || d.tag !== 6 ? (d = fi(m, h.mode, w), d.return = h, d) : (d = l(d, m), d.return = h, d);
  }
  function a(h, d, m, w) {
    var E = m.type;
    return E === Yt ? c(h, d, m.props.children, w, m.key) : d !== null && (d.elementType === E || typeof E == "object" && E !== null && E.$$typeof === ct && bu(E) === d.type) ? (w = l(d, m.props), w.ref = Rn(h, d, m), w.return = h, w) : (w = Zr(m.type, m.key, m.props, null, h.mode, w), w.ref = Rn(h, d, m), w.return = h, w);
  }
  function s(h, d, m, w) {
    return d === null || d.tag !== 4 || d.stateNode.containerInfo !== m.containerInfo || d.stateNode.implementation !== m.implementation ? (d = di(m, h.mode, w), d.return = h, d) : (d = l(d, m.children || []), d.return = h, d);
  }
  function c(h, d, m, w, E) {
    return d === null || d.tag !== 7 ? (d = $t(m, h.mode, w, E), d.return = h, d) : (d = l(d, m), d.return = h, d);
  }
  function f(h, d, m) {
    if (typeof d == "string" && d !== "" || typeof d == "number") return d = fi("" + d, h.mode, m), d.return = h, d;
    if (typeof d == "object" && d !== null) {
      switch (d.$$typeof) {
        case Sr:
          return m = Zr(d.type, d.key, d.props, null, h.mode, m), m.ref = Rn(h, null, d), m.return = h, m;
        case Qt:
          return d = di(d, h.mode, m), d.return = h, d;
        case ct:
          var w = d._init;
          return f(h, w(d._payload), m);
      }
      if ($n(d) || Pn(d)) return d = $t(d, h.mode, m, null), d.return = h, d;
      Rr(h, d);
    }
    return null;
  }
  function p(h, d, m, w) {
    var E = d !== null ? d.key : null;
    if (typeof m == "string" && m !== "" || typeof m == "number") return E !== null ? null : u(h, d, "" + m, w);
    if (typeof m == "object" && m !== null) {
      switch (m.$$typeof) {
        case Sr:
          return m.key === E ? a(h, d, m, w) : null;
        case Qt:
          return m.key === E ? s(h, d, m, w) : null;
        case ct:
          return E = m._init, p(
            h,
            d,
            E(m._payload),
            w
          );
      }
      if ($n(m) || Pn(m)) return E !== null ? null : c(h, d, m, w, null);
      Rr(h, m);
    }
    return null;
  }
  function y(h, d, m, w, E) {
    if (typeof w == "string" && w !== "" || typeof w == "number") return h = h.get(m) || null, u(d, h, "" + w, E);
    if (typeof w == "object" && w !== null) {
      switch (w.$$typeof) {
        case Sr:
          return h = h.get(w.key === null ? m : w.key) || null, a(d, h, w, E);
        case Qt:
          return h = h.get(w.key === null ? m : w.key) || null, s(d, h, w, E);
        case ct:
          var C = w._init;
          return y(h, d, m, C(w._payload), E);
      }
      if ($n(w) || Pn(w)) return h = h.get(m) || null, c(d, h, w, E, null);
      Rr(d, w);
    }
    return null;
  }
  function v(h, d, m, w) {
    for (var E = null, C = null, _ = d, P = d = 0, j = null; _ !== null && P < m.length; P++) {
      _.index > P ? (j = _, _ = null) : j = _.sibling;
      var R = p(h, _, m[P], w);
      if (R === null) {
        _ === null && (_ = j);
        break;
      }
      e && _ && R.alternate === null && t(h, _), d = i(R, d, P), C === null ? E = R : C.sibling = R, C = R, _ = j;
    }
    if (P === m.length) return n(h, _), Z && jt(h, P), E;
    if (_ === null) {
      for (; P < m.length; P++) _ = f(h, m[P], w), _ !== null && (d = i(_, d, P), C === null ? E = _ : C.sibling = _, C = _);
      return Z && jt(h, P), E;
    }
    for (_ = r(h, _); P < m.length; P++) j = y(_, h, P, m[P], w), j !== null && (e && j.alternate !== null && _.delete(j.key === null ? P : j.key), d = i(j, d, P), C === null ? E = j : C.sibling = j, C = j);
    return e && _.forEach(function(X) {
      return t(h, X);
    }), Z && jt(h, P), E;
  }
  function S(h, d, m, w) {
    var E = Pn(m);
    if (typeof E != "function") throw Error(k(150));
    if (m = E.call(m), m == null) throw Error(k(151));
    for (var C = E = null, _ = d, P = d = 0, j = null, R = m.next(); _ !== null && !R.done; P++, R = m.next()) {
      _.index > P ? (j = _, _ = null) : j = _.sibling;
      var X = p(h, _, R.value, w);
      if (X === null) {
        _ === null && (_ = j);
        break;
      }
      e && _ && X.alternate === null && t(h, _), d = i(X, d, P), C === null ? E = X : C.sibling = X, C = X, _ = j;
    }
    if (R.done) return n(
      h,
      _
    ), Z && jt(h, P), E;
    if (_ === null) {
      for (; !R.done; P++, R = m.next()) R = f(h, R.value, w), R !== null && (d = i(R, d, P), C === null ? E = R : C.sibling = R, C = R);
      return Z && jt(h, P), E;
    }
    for (_ = r(h, _); !R.done; P++, R = m.next()) R = y(_, h, P, R.value, w), R !== null && (e && R.alternate !== null && _.delete(R.key === null ? P : R.key), d = i(R, d, P), C === null ? E = R : C.sibling = R, C = R);
    return e && _.forEach(function(Ye) {
      return t(h, Ye);
    }), Z && jt(h, P), E;
  }
  function N(h, d, m, w) {
    if (typeof m == "object" && m !== null && m.type === Yt && m.key === null && (m = m.props.children), typeof m == "object" && m !== null) {
      switch (m.$$typeof) {
        case Sr:
          e: {
            for (var E = m.key, C = d; C !== null; ) {
              if (C.key === E) {
                if (E = m.type, E === Yt) {
                  if (C.tag === 7) {
                    n(h, C.sibling), d = l(C, m.props.children), d.return = h, h = d;
                    break e;
                  }
                } else if (C.elementType === E || typeof E == "object" && E !== null && E.$$typeof === ct && bu(E) === C.type) {
                  n(h, C.sibling), d = l(C, m.props), d.ref = Rn(h, C, m), d.return = h, h = d;
                  break e;
                }
                n(h, C);
                break;
              } else t(h, C);
              C = C.sibling;
            }
            m.type === Yt ? (d = $t(m.props.children, h.mode, w, m.key), d.return = h, h = d) : (w = Zr(m.type, m.key, m.props, null, h.mode, w), w.ref = Rn(h, d, m), w.return = h, h = w);
          }
          return o(h);
        case Qt:
          e: {
            for (C = m.key; d !== null; ) {
              if (d.key === C) if (d.tag === 4 && d.stateNode.containerInfo === m.containerInfo && d.stateNode.implementation === m.implementation) {
                n(h, d.sibling), d = l(d, m.children || []), d.return = h, h = d;
                break e;
              } else {
                n(h, d);
                break;
              }
              else t(h, d);
              d = d.sibling;
            }
            d = di(m, h.mode, w), d.return = h, h = d;
          }
          return o(h);
        case ct:
          return C = m._init, N(h, d, C(m._payload), w);
      }
      if ($n(m)) return v(h, d, m, w);
      if (Pn(m)) return S(h, d, m, w);
      Rr(h, m);
    }
    return typeof m == "string" && m !== "" || typeof m == "number" ? (m = "" + m, d !== null && d.tag === 6 ? (n(h, d.sibling), d = l(d, m), d.return = h, h = d) : (n(h, d), d = fi(m, h.mode, w), d.return = h, h = d), o(h)) : n(h, d);
  }
  return N;
}
var hn = qs(!0), bs = qs(!1), cl = zt(null), fl = null, en = null, Oo = null;
function Ao() {
  Oo = en = fl = null;
}
function Uo(e) {
  var t = cl.current;
  G(cl), e._currentValue = t;
}
function Xi(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function an(e, t) {
  fl = e, Oo = en = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (xe = !0), e.firstContext = null);
}
function Fe(e) {
  var t = e._currentValue;
  if (Oo !== e) if (e = { context: e, memoizedValue: t, next: null }, en === null) {
    if (fl === null) throw Error(k(308));
    en = e, fl.dependencies = { lanes: 0, firstContext: e };
  } else en = en.next = e;
  return t;
}
var Dt = null;
function Bo(e) {
  Dt === null ? Dt = [e] : Dt.push(e);
}
function ec(e, t, n, r) {
  var l = t.interleaved;
  return l === null ? (n.next = n, Bo(t)) : (n.next = l.next, l.next = n), t.interleaved = n, ot(e, r);
}
function ot(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
  return n.tag === 3 ? n.stateNode : null;
}
var ft = !1;
function Vo(e) {
  e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function tc(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function rt(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function St(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, U & 2) {
    var l = r.pending;
    return l === null ? t.next = t : (t.next = l.next, l.next = t), r.pending = t, ot(e, n);
  }
  return l = r.interleaved, l === null ? (t.next = t, Bo(r)) : (t.next = l.next, l.next = t), r.interleaved = t, ot(e, n);
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
  ft = !1;
  var i = l.firstBaseUpdate, o = l.lastBaseUpdate, u = l.shared.pending;
  if (u !== null) {
    l.shared.pending = null;
    var a = u, s = a.next;
    a.next = null, o === null ? i = s : o.next = s, o = a;
    var c = e.alternate;
    c !== null && (c = c.updateQueue, u = c.lastBaseUpdate, u !== o && (u === null ? c.firstBaseUpdate = s : u.next = s, c.lastBaseUpdate = a));
  }
  if (i !== null) {
    var f = l.baseState;
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
          var v = e, S = u;
          switch (p = t, y = n, S.tag) {
            case 1:
              if (v = S.payload, typeof v == "function") {
                f = v.call(y, f, p);
                break e;
              }
              f = v;
              break e;
            case 3:
              v.flags = v.flags & -65537 | 128;
            case 0:
              if (v = S.payload, p = typeof v == "function" ? v.call(y, f, p) : v, p == null) break e;
              f = ee({}, f, p);
              break e;
            case 2:
              ft = !0;
          }
        }
        u.callback !== null && u.lane !== 0 && (e.flags |= 64, p = l.effects, p === null ? l.effects = [u] : p.push(u));
      } else y = { eventTime: y, lane: p, tag: u.tag, payload: u.payload, callback: u.callback, next: null }, c === null ? (s = c = y, a = f) : c = c.next = y, o |= p;
      if (u = u.next, u === null) {
        if (u = l.shared.pending, u === null) break;
        p = u, u = p.next, p.next = null, l.lastBaseUpdate = p, l.shared.pending = null;
      }
    } while (!0);
    if (c === null && (a = f), l.baseState = a, l.firstBaseUpdate = s, l.lastBaseUpdate = c, t = l.shared.interleaved, t !== null) {
      l = t;
      do
        o |= l.lane, l = l.next;
      while (l !== t);
    } else i === null && (l.shared.lanes = 0);
    Ut |= o, e.lanes = o, e.memoizedState = f;
  }
}
function ta(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], l = r.callback;
    if (l !== null) {
      if (r.callback = null, r = n, typeof l != "function") throw Error(k(191, l));
      l.call(r);
    }
  }
}
var mr = {}, qe = zt(mr), ir = zt(mr), or = zt(mr);
function Mt(e) {
  if (e === mr) throw Error(k(174));
  return e;
}
function Wo(e, t) {
  switch (Y(or, t), Y(ir, e), Y(qe, mr), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : zi(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = zi(t, e);
  }
  G(qe), Y(qe, t);
}
function mn() {
  G(qe), G(ir), G(or);
}
function nc(e) {
  Mt(or.current);
  var t = Mt(qe.current), n = zi(t, e.type);
  t !== n && (Y(ir, e), Y(qe, n));
}
function Ho(e) {
  ir.current === e && (G(qe), G(ir));
}
var q = zt(0);
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
var Qr = at.ReactCurrentDispatcher, oi = at.ReactCurrentBatchConfig, At = 0, b = null, ie = null, ue = null, hl = !1, Hn = !1, ur = 0, cp = 0;
function de() {
  throw Error(k(321));
}
function Yo(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!Qe(e[n], t[n])) return !1;
  return !0;
}
function Xo(e, t, n, r, l, i) {
  if (At = i, b = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Qr.current = e === null || e.memoizedState === null ? hp : mp, e = n(r, l), Hn) {
    i = 0;
    do {
      if (Hn = !1, ur = 0, 25 <= i) throw Error(k(301));
      i += 1, ue = ie = null, t.updateQueue = null, Qr.current = vp, e = n(r, l);
    } while (Hn);
  }
  if (Qr.current = ml, t = ie !== null && ie.next !== null, At = 0, ue = ie = b = null, hl = !1, t) throw Error(k(300));
  return e;
}
function Ko() {
  var e = ur !== 0;
  return ur = 0, e;
}
function Ge() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return ue === null ? b.memoizedState = ue = e : ue = ue.next = e, ue;
}
function Oe() {
  if (ie === null) {
    var e = b.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = ie.next;
  var t = ue === null ? b.memoizedState : ue.next;
  if (t !== null) ue = t, ie = e;
  else {
    if (e === null) throw Error(k(310));
    ie = e, e = { memoizedState: ie.memoizedState, baseState: ie.baseState, baseQueue: ie.baseQueue, queue: ie.queue, next: null }, ue === null ? b.memoizedState = ue = e : ue = ue.next = e;
  }
  return ue;
}
function ar(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function ui(e) {
  var t = Oe(), n = t.queue;
  if (n === null) throw Error(k(311));
  n.lastRenderedReducer = e;
  var r = ie, l = r.baseQueue, i = n.pending;
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
      if ((At & c) === c) a !== null && (a = a.next = { lane: 0, action: s.action, hasEagerState: s.hasEagerState, eagerState: s.eagerState, next: null }), r = s.hasEagerState ? s.eagerState : e(r, s.action);
      else {
        var f = {
          lane: c,
          action: s.action,
          hasEagerState: s.hasEagerState,
          eagerState: s.eagerState,
          next: null
        };
        a === null ? (u = a = f, o = r) : a = a.next = f, b.lanes |= c, Ut |= c;
      }
      s = s.next;
    } while (s !== null && s !== i);
    a === null ? o = r : a.next = u, Qe(r, t.memoizedState) || (xe = !0), t.memoizedState = r, t.baseState = o, t.baseQueue = a, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    l = e;
    do
      i = l.lane, b.lanes |= i, Ut |= i, l = l.next;
    while (l !== e);
  } else l === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function ai(e) {
  var t = Oe(), n = t.queue;
  if (n === null) throw Error(k(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch, l = n.pending, i = t.memoizedState;
  if (l !== null) {
    n.pending = null;
    var o = l = l.next;
    do
      i = e(i, o.action), o = o.next;
    while (o !== l);
    Qe(i, t.memoizedState) || (xe = !0), t.memoizedState = i, t.baseQueue === null && (t.baseState = i), n.lastRenderedState = i;
  }
  return [i, r];
}
function rc() {
}
function lc(e, t) {
  var n = b, r = Oe(), l = t(), i = !Qe(r.memoizedState, l);
  if (i && (r.memoizedState = l, xe = !0), r = r.queue, Go(uc.bind(null, n, r, e), [e]), r.getSnapshot !== t || i || ue !== null && ue.memoizedState.tag & 1) {
    if (n.flags |= 2048, sr(9, oc.bind(null, n, r, l, t), void 0, null), ae === null) throw Error(k(349));
    At & 30 || ic(n, t, l);
  }
  return l;
}
function ic(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = b.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, b.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function oc(e, t, n, r) {
  t.value = n, t.getSnapshot = r, ac(t) && sc(e);
}
function uc(e, t, n) {
  return n(function() {
    ac(t) && sc(e);
  });
}
function ac(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Qe(e, n);
  } catch {
    return !0;
  }
}
function sc(e) {
  var t = ot(e, 1);
  t !== null && He(t, e, 1, -1);
}
function na(e) {
  var t = Ge();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: ar, lastRenderedState: e }, t.queue = e, e = e.dispatch = pp.bind(null, b, e), [t.memoizedState, e];
}
function sr(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = b.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, b.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function cc() {
  return Oe().memoizedState;
}
function Yr(e, t, n, r) {
  var l = Ge();
  b.flags |= e, l.memoizedState = sr(1 | t, n, void 0, r === void 0 ? null : r);
}
function zl(e, t, n, r) {
  var l = Oe();
  r = r === void 0 ? null : r;
  var i = void 0;
  if (ie !== null) {
    var o = ie.memoizedState;
    if (i = o.destroy, r !== null && Yo(r, o.deps)) {
      l.memoizedState = sr(t, n, i, r);
      return;
    }
  }
  b.flags |= e, l.memoizedState = sr(1 | t, n, i, r);
}
function ra(e, t) {
  return Yr(8390656, 8, e, t);
}
function Go(e, t) {
  return zl(2048, 8, e, t);
}
function fc(e, t) {
  return zl(4, 2, e, t);
}
function dc(e, t) {
  return zl(4, 4, e, t);
}
function pc(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function hc(e, t, n) {
  return n = n != null ? n.concat([e]) : null, zl(4, 4, pc.bind(null, t, e), n);
}
function Zo() {
}
function mc(e, t) {
  var n = Oe();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Yo(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function vc(e, t) {
  var n = Oe();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Yo(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function yc(e, t, n) {
  return At & 21 ? (Qe(n, t) || (n = ks(), b.lanes |= n, Ut |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, xe = !0), e.memoizedState = n);
}
function fp(e, t) {
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
function gc() {
  return Oe().memoizedState;
}
function dp(e, t, n) {
  var r = kt(e);
  if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, wc(e)) Sc(t, n);
  else if (n = ec(e, t, n, r), n !== null) {
    var l = ye();
    He(n, e, r, l), xc(n, t, r);
  }
}
function pp(e, t, n) {
  var r = kt(e), l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (wc(e)) Sc(t, l);
  else {
    var i = e.alternate;
    if (e.lanes === 0 && (i === null || i.lanes === 0) && (i = t.lastRenderedReducer, i !== null)) try {
      var o = t.lastRenderedState, u = i(o, n);
      if (l.hasEagerState = !0, l.eagerState = u, Qe(u, o)) {
        var a = t.interleaved;
        a === null ? (l.next = l, Bo(t)) : (l.next = a.next, a.next = l), t.interleaved = l;
        return;
      }
    } catch {
    } finally {
    }
    n = ec(e, t, l, r), n !== null && (l = ye(), He(n, e, r, l), xc(n, t, r));
  }
}
function wc(e) {
  var t = e.alternate;
  return e === b || t !== null && t === b;
}
function Sc(e, t) {
  Hn = hl = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function xc(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, zo(e, n);
  }
}
var ml = { readContext: Fe, useCallback: de, useContext: de, useEffect: de, useImperativeHandle: de, useInsertionEffect: de, useLayoutEffect: de, useMemo: de, useReducer: de, useRef: de, useState: de, useDebugValue: de, useDeferredValue: de, useTransition: de, useMutableSource: de, useSyncExternalStore: de, useId: de, unstable_isNewReconciler: !1 }, hp = { readContext: Fe, useCallback: function(e, t) {
  return Ge().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: Fe, useEffect: ra, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Yr(
    4194308,
    4,
    pc.bind(null, t, e),
    n
  );
}, useLayoutEffect: function(e, t) {
  return Yr(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return Yr(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = Ge();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = Ge();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = dp.bind(null, b, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = Ge();
  return e = { current: e }, t.memoizedState = e;
}, useState: na, useDebugValue: Zo, useDeferredValue: function(e) {
  return Ge().memoizedState = e;
}, useTransition: function() {
  var e = na(!1), t = e[0];
  return e = fp.bind(null, e[1]), Ge().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = b, l = Ge();
  if (Z) {
    if (n === void 0) throw Error(k(407));
    n = n();
  } else {
    if (n = t(), ae === null) throw Error(k(349));
    At & 30 || ic(r, t, n);
  }
  l.memoizedState = n;
  var i = { value: n, getSnapshot: t };
  return l.queue = i, ra(uc.bind(
    null,
    r,
    i,
    e
  ), [e]), r.flags |= 2048, sr(9, oc.bind(null, r, i, n, t), void 0, null), n;
}, useId: function() {
  var e = Ge(), t = ae.identifierPrefix;
  if (Z) {
    var n = nt, r = tt;
    n = (r & ~(1 << 32 - We(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = ur++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = cp++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: !1 }, mp = {
  readContext: Fe,
  useCallback: mc,
  useContext: Fe,
  useEffect: Go,
  useImperativeHandle: hc,
  useInsertionEffect: fc,
  useLayoutEffect: dc,
  useMemo: vc,
  useReducer: ui,
  useRef: cc,
  useState: function() {
    return ui(ar);
  },
  useDebugValue: Zo,
  useDeferredValue: function(e) {
    var t = Oe();
    return yc(t, ie.memoizedState, e);
  },
  useTransition: function() {
    var e = ui(ar)[0], t = Oe().memoizedState;
    return [e, t];
  },
  useMutableSource: rc,
  useSyncExternalStore: lc,
  useId: gc,
  unstable_isNewReconciler: !1
}, vp = { readContext: Fe, useCallback: mc, useContext: Fe, useEffect: Go, useImperativeHandle: hc, useInsertionEffect: fc, useLayoutEffect: dc, useMemo: vc, useReducer: ai, useRef: cc, useState: function() {
  return ai(ar);
}, useDebugValue: Zo, useDeferredValue: function(e) {
  var t = Oe();
  return ie === null ? t.memoizedState = e : yc(t, ie.memoizedState, e);
}, useTransition: function() {
  var e = ai(ar)[0], t = Oe().memoizedState;
  return [e, t];
}, useMutableSource: rc, useSyncExternalStore: lc, useId: gc, unstable_isNewReconciler: !1 };
function Ue(e, t) {
  if (e && e.defaultProps) {
    t = ee({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function Ki(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : ee({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var Tl = { isMounted: function(e) {
  return (e = e._reactInternals) ? Wt(e) === e : !1;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = ye(), l = kt(e), i = rt(r, l);
  i.payload = t, n != null && (i.callback = n), t = St(e, i, l), t !== null && (He(t, e, l, r), Hr(t, e, l));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = ye(), l = kt(e), i = rt(r, l);
  i.tag = 1, i.payload = t, n != null && (i.callback = n), t = St(e, i, l), t !== null && (He(t, e, l, r), Hr(t, e, l));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = ye(), r = kt(e), l = rt(n, r);
  l.tag = 2, t != null && (l.callback = t), t = St(e, l, r), t !== null && (He(t, e, r, n), Hr(t, e, r));
} };
function la(e, t, n, r, l, i, o) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, i, o) : t.prototype && t.prototype.isPureReactComponent ? !tr(n, r) || !tr(l, i) : !0;
}
function kc(e, t, n) {
  var r = !1, l = Ct, i = t.contextType;
  return typeof i == "object" && i !== null ? i = Fe(i) : (l = Ee(t) ? Ft : me.current, r = t.contextTypes, i = (r = r != null) ? dn(e, l) : Ct), t = new t(n, i), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = Tl, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = l, e.__reactInternalMemoizedMaskedChildContext = i), t;
}
function ia(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Tl.enqueueReplaceState(t, t.state, null);
}
function Gi(e, t, n, r) {
  var l = e.stateNode;
  l.props = n, l.state = e.memoizedState, l.refs = {}, Vo(e);
  var i = t.contextType;
  typeof i == "object" && i !== null ? l.context = Fe(i) : (i = Ee(t) ? Ft : me.current, l.context = dn(e, i)), l.state = e.memoizedState, i = t.getDerivedStateFromProps, typeof i == "function" && (Ki(e, t, i, n), l.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof l.getSnapshotBeforeUpdate == "function" || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (t = l.state, typeof l.componentWillMount == "function" && l.componentWillMount(), typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount(), t !== l.state && Tl.enqueueReplaceState(l, l.state, null), dl(e, n, l, r), l.state = e.memoizedState), typeof l.componentDidMount == "function" && (e.flags |= 4194308);
}
function vn(e, t) {
  try {
    var n = "", r = t;
    do
      n += Hf(r), r = r.return;
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
var yp = typeof WeakMap == "function" ? WeakMap : Map;
function Ec(e, t, n) {
  n = rt(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    yl || (yl = !0, oo = r), Zi(e, t);
  }, n;
}
function _c(e, t, n) {
  n = rt(-1, n), n.tag = 3;
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
    Zi(e, t), typeof r != "function" && (xt === null ? xt = /* @__PURE__ */ new Set([this]) : xt.add(this));
    var o = t.stack;
    this.componentDidCatch(t.value, { componentStack: o !== null ? o : "" });
  }), n;
}
function oa(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new yp();
    var l = /* @__PURE__ */ new Set();
    r.set(t, l);
  } else l = r.get(t), l === void 0 && (l = /* @__PURE__ */ new Set(), r.set(t, l));
  l.has(n) || (l.add(n), e = Rp.bind(null, e, t, n), t.then(e, e));
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
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = l, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = rt(-1, 1), t.tag = 2, St(n, t, 1))), n.lanes |= 1), e);
}
var gp = at.ReactCurrentOwner, xe = !1;
function ve(e, t, n, r) {
  t.child = e === null ? bs(t, null, n, r) : hn(t, e.child, n, r);
}
function sa(e, t, n, r, l) {
  n = n.render;
  var i = t.ref;
  return an(t, l), r = Xo(e, t, n, r, i, l), n = Ko(), e !== null && !xe ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, ut(e, t, l)) : (Z && n && Io(t), t.flags |= 1, ve(e, t, r, l), t.child);
}
function ca(e, t, n, r, l) {
  if (e === null) {
    var i = n.type;
    return typeof i == "function" && !lu(i) && i.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = i, Cc(e, t, i, r, l)) : (e = Zr(n.type, null, r, t, t.mode, l), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (i = e.child, !(e.lanes & l)) {
    var o = i.memoizedProps;
    if (n = n.compare, n = n !== null ? n : tr, n(o, r) && e.ref === t.ref) return ut(e, t, l);
  }
  return t.flags |= 1, e = Et(i, r), e.ref = t.ref, e.return = t, t.child = e;
}
function Cc(e, t, n, r, l) {
  if (e !== null) {
    var i = e.memoizedProps;
    if (tr(i, r) && e.ref === t.ref) if (xe = !1, t.pendingProps = r = i, (e.lanes & l) !== 0) e.flags & 131072 && (xe = !0);
    else return t.lanes = e.lanes, ut(e, t, l);
  }
  return Ji(e, t, n, r, l);
}
function Pc(e, t, n) {
  var r = t.pendingProps, l = r.children, i = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Y(nn, ze), ze |= n;
  else {
    if (!(n & 1073741824)) return e = i !== null ? i.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, Y(nn, ze), ze |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = i !== null ? i.baseLanes : n, Y(nn, ze), ze |= r;
  }
  else i !== null ? (r = i.baseLanes | n, t.memoizedState = null) : r = n, Y(nn, ze), ze |= r;
  return ve(e, t, l, n), t.child;
}
function zc(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function Ji(e, t, n, r, l) {
  var i = Ee(n) ? Ft : me.current;
  return i = dn(t, i), an(t, l), n = Xo(e, t, n, r, i, l), r = Ko(), e !== null && !xe ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, ut(e, t, l)) : (Z && r && Io(t), t.flags |= 1, ve(e, t, n, l), t.child);
}
function fa(e, t, n, r, l) {
  if (Ee(n)) {
    var i = !0;
    ul(t);
  } else i = !1;
  if (an(t, l), t.stateNode === null) Xr(e, t), kc(t, n, r), Gi(t, n, r, l), r = !0;
  else if (e === null) {
    var o = t.stateNode, u = t.memoizedProps;
    o.props = u;
    var a = o.context, s = n.contextType;
    typeof s == "object" && s !== null ? s = Fe(s) : (s = Ee(n) ? Ft : me.current, s = dn(t, s));
    var c = n.getDerivedStateFromProps, f = typeof c == "function" || typeof o.getSnapshotBeforeUpdate == "function";
    f || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (u !== r || a !== s) && ia(t, o, r, s), ft = !1;
    var p = t.memoizedState;
    o.state = p, dl(t, r, o, l), a = t.memoizedState, u !== r || p !== a || ke.current || ft ? (typeof c == "function" && (Ki(t, n, c, r), a = t.memoizedState), (u = ft || la(t, n, u, r, p, a, s)) ? (f || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = a), o.props = r, o.state = a, o.context = s, r = u) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    o = t.stateNode, tc(e, t), u = t.memoizedProps, s = t.type === t.elementType ? u : Ue(t.type, u), o.props = s, f = t.pendingProps, p = o.context, a = n.contextType, typeof a == "object" && a !== null ? a = Fe(a) : (a = Ee(n) ? Ft : me.current, a = dn(t, a));
    var y = n.getDerivedStateFromProps;
    (c = typeof y == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (u !== f || p !== a) && ia(t, o, r, a), ft = !1, p = t.memoizedState, o.state = p, dl(t, r, o, l);
    var v = t.memoizedState;
    u !== f || p !== v || ke.current || ft ? (typeof y == "function" && (Ki(t, n, y, r), v = t.memoizedState), (s = ft || la(t, n, s, r, p, v, a) || !1) ? (c || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, v, a), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, v, a)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || u === e.memoizedProps && p === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || u === e.memoizedProps && p === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = v), o.props = r, o.state = v, o.context = a, r = s) : (typeof o.componentDidUpdate != "function" || u === e.memoizedProps && p === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || u === e.memoizedProps && p === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return qi(e, t, n, r, i, l);
}
function qi(e, t, n, r, l, i) {
  zc(e, t);
  var o = (t.flags & 128) !== 0;
  if (!r && !o) return l && Zu(t, n, !1), ut(e, t, i);
  r = t.stateNode, gp.current = t;
  var u = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && o ? (t.child = hn(t, e.child, null, i), t.child = hn(t, null, u, i)) : ve(e, t, u, i), t.memoizedState = r.state, l && Zu(t, n, !0), t.child;
}
function Tc(e) {
  var t = e.stateNode;
  t.pendingContext ? Gu(e, t.pendingContext, t.pendingContext !== t.context) : t.context && Gu(e, t.context, !1), Wo(e, t.containerInfo);
}
function da(e, t, n, r, l) {
  return pn(), Fo(l), t.flags |= 256, ve(e, t, n, r), t.child;
}
var bi = { dehydrated: null, treeContext: null, retryLane: 0 };
function eo(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function Nc(e, t, n) {
  var r = t.pendingProps, l = q.current, i = !1, o = (t.flags & 128) !== 0, u;
  if ((u = o) || (u = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0), u ? (i = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (l |= 1), Y(q, l & 1), e === null)
    return Yi(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (o = r.children, e = r.fallback, i ? (r = t.mode, i = t.child, o = { mode: "hidden", children: o }, !(r & 1) && i !== null ? (i.childLanes = 0, i.pendingProps = o) : i = Rl(o, r, 0, null), e = $t(e, r, n, null), i.return = t, e.return = t, i.sibling = e, t.child = i, t.child.memoizedState = eo(n), t.memoizedState = bi, e) : Jo(t, o));
  if (l = e.memoizedState, l !== null && (u = l.dehydrated, u !== null)) return wp(e, t, o, r, u, l, n);
  if (i) {
    i = r.fallback, o = t.mode, l = e.child, u = l.sibling;
    var a = { mode: "hidden", children: r.children };
    return !(o & 1) && t.child !== l ? (r = t.child, r.childLanes = 0, r.pendingProps = a, t.deletions = null) : (r = Et(l, a), r.subtreeFlags = l.subtreeFlags & 14680064), u !== null ? i = Et(u, i) : (i = $t(i, o, n, null), i.flags |= 2), i.return = t, r.return = t, r.sibling = i, t.child = r, r = i, i = t.child, o = e.child.memoizedState, o = o === null ? eo(n) : { baseLanes: o.baseLanes | n, cachePool: null, transitions: o.transitions }, i.memoizedState = o, i.childLanes = e.childLanes & ~n, t.memoizedState = bi, r;
  }
  return i = e.child, e = i.sibling, r = Et(i, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function Jo(e, t) {
  return t = Rl({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function Lr(e, t, n, r) {
  return r !== null && Fo(r), hn(t, e.child, null, n), e = Jo(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function wp(e, t, n, r, l, i, o) {
  if (n)
    return t.flags & 256 ? (t.flags &= -257, r = si(Error(k(422))), Lr(e, t, o, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (i = r.fallback, l = t.mode, r = Rl({ mode: "visible", children: r.children }, l, 0, null), i = $t(i, l, o, null), i.flags |= 2, r.return = t, i.return = t, r.sibling = i, t.child = r, t.mode & 1 && hn(t, e.child, null, o), t.child.memoizedState = eo(o), t.memoizedState = bi, i);
  if (!(t.mode & 1)) return Lr(e, t, o, null);
  if (l.data === "$!") {
    if (r = l.nextSibling && l.nextSibling.dataset, r) var u = r.dgst;
    return r = u, i = Error(k(419)), r = si(i, r, void 0), Lr(e, t, o, r);
  }
  if (u = (o & e.childLanes) !== 0, xe || u) {
    if (r = ae, r !== null) {
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
      l = l & (r.suspendedLanes | o) ? 0 : l, l !== 0 && l !== i.retryLane && (i.retryLane = l, ot(e, l), He(r, e, l, -1));
    }
    return ru(), r = si(Error(k(421))), Lr(e, t, o, r);
  }
  return l.data === "$?" ? (t.flags |= 128, t.child = e.child, t = Lp.bind(null, e), l._reactRetry = t, null) : (e = i.treeContext, Te = wt(l.nextSibling), Ne = t, Z = !0, Ve = null, e !== null && (De[Me++] = tt, De[Me++] = nt, De[Me++] = Ot, tt = e.id, nt = e.overflow, Ot = t), t = Jo(t, r.children), t.flags |= 4096, t);
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
function jc(e, t, n) {
  var r = t.pendingProps, l = r.revealOrder, i = r.tail;
  if (ve(e, t, r.children, n), r = q.current, r & 2) r = r & 1 | 2, t.flags |= 128;
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
  if (Y(q, r), !(t.mode & 1)) t.memoizedState = null;
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
function ut(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), Ut |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(k(153));
  if (t.child !== null) {
    for (e = t.child, n = Et(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = Et(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function Sp(e, t, n) {
  switch (t.tag) {
    case 3:
      Tc(t), pn();
      break;
    case 5:
      nc(t);
      break;
    case 1:
      Ee(t.type) && ul(t);
      break;
    case 4:
      Wo(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, l = t.memoizedProps.value;
      Y(cl, r._currentValue), r._currentValue = l;
      break;
    case 13:
      if (r = t.memoizedState, r !== null)
        return r.dehydrated !== null ? (Y(q, q.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? Nc(e, t, n) : (Y(q, q.current & 1), e = ut(e, t, n), e !== null ? e.sibling : null);
      Y(q, q.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return jc(e, t, n);
        t.flags |= 128;
      }
      if (l = t.memoizedState, l !== null && (l.rendering = null, l.tail = null, l.lastEffect = null), Y(q, q.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, Pc(e, t, n);
  }
  return ut(e, t, n);
}
var Rc, to, Lc, Dc;
Rc = function(e, t) {
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
Lc = function(e, t, n, r) {
  var l = e.memoizedProps;
  if (l !== r) {
    e = t.stateNode, Mt(qe.current);
    var i = null;
    switch (n) {
      case "input":
        l = Ei(e, l), r = Ei(e, r), i = [];
        break;
      case "select":
        l = ee({}, l, { value: void 0 }), r = ee({}, r, { value: void 0 }), i = [];
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
      else s === "dangerouslySetInnerHTML" ? (a = a ? a.__html : void 0, u = u ? u.__html : void 0, a != null && u !== a && (i = i || []).push(s, a)) : s === "children" ? typeof a != "string" && typeof a != "number" || (i = i || []).push(s, "" + a) : s !== "suppressContentEditableWarning" && s !== "suppressHydrationWarning" && (Kn.hasOwnProperty(s) ? (a != null && s === "onScroll" && K("scroll", e), i || u === a || (i = [])) : (i = i || []).push(s, a));
    }
    n && (i = i || []).push("style", n);
    var s = i;
    (t.updateQueue = s) && (t.flags |= 4);
  }
};
Dc = function(e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function Ln(e, t) {
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
function pe(e) {
  var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
  if (t) for (var l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags & 14680064, r |= l.flags & 14680064, l.return = e, l = l.sibling;
  else for (l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags, r |= l.flags, l.return = e, l = l.sibling;
  return e.subtreeFlags |= r, e.childLanes = n, t;
}
function xp(e, t, n) {
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
      return pe(t), null;
    case 1:
      return Ee(t.type) && ol(), pe(t), null;
    case 3:
      return r = t.stateNode, mn(), G(ke), G(me), Qo(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (jr(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Ve !== null && (so(Ve), Ve = null))), to(e, t), pe(t), null;
    case 5:
      Ho(t);
      var l = Mt(or.current);
      if (n = t.type, e !== null && t.stateNode != null) Lc(e, t, n, r, l), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(k(166));
          return pe(t), null;
        }
        if (e = Mt(qe.current), jr(t)) {
          r = t.stateNode, n = t.type;
          var i = t.memoizedProps;
          switch (r[Ze] = t, r[lr] = i, e = (t.mode & 1) !== 0, n) {
            case "dialog":
              K("cancel", r), K("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              K("load", r);
              break;
            case "video":
            case "audio":
              for (l = 0; l < On.length; l++) K(On[l], r);
              break;
            case "source":
              K("error", r);
              break;
            case "img":
            case "image":
            case "link":
              K(
                "error",
                r
              ), K("load", r);
              break;
            case "details":
              K("toggle", r);
              break;
            case "input":
              ku(r, i), K("invalid", r);
              break;
            case "select":
              r._wrapperState = { wasMultiple: !!i.multiple }, K("invalid", r);
              break;
            case "textarea":
              _u(r, i), K("invalid", r);
          }
          Ti(n, i), l = null;
          for (var o in i) if (i.hasOwnProperty(o)) {
            var u = i[o];
            o === "children" ? typeof u == "string" ? r.textContent !== u && (i.suppressHydrationWarning !== !0 && Nr(r.textContent, u, e), l = ["children", u]) : typeof u == "number" && r.textContent !== "" + u && (i.suppressHydrationWarning !== !0 && Nr(
              r.textContent,
              u,
              e
            ), l = ["children", "" + u]) : Kn.hasOwnProperty(o) && u != null && o === "onScroll" && K("scroll", r);
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
          o = l.nodeType === 9 ? l : l.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = us(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = o.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = o.createElement(n, { is: r.is }) : (e = o.createElement(n), n === "select" && (o = e, r.multiple ? o.multiple = !0 : r.size && (o.size = r.size))) : e = o.createElementNS(e, n), e[Ze] = t, e[lr] = r, Rc(e, t, !1, !1), t.stateNode = e;
          e: {
            switch (o = Ni(n, r), n) {
              case "dialog":
                K("cancel", e), K("close", e), l = r;
                break;
              case "iframe":
              case "object":
              case "embed":
                K("load", e), l = r;
                break;
              case "video":
              case "audio":
                for (l = 0; l < On.length; l++) K(On[l], e);
                l = r;
                break;
              case "source":
                K("error", e), l = r;
                break;
              case "img":
              case "image":
              case "link":
                K(
                  "error",
                  e
                ), K("load", e), l = r;
                break;
              case "details":
                K("toggle", e), l = r;
                break;
              case "input":
                ku(e, r), l = Ei(e, r), K("invalid", e);
                break;
              case "option":
                l = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, l = ee({}, r, { value: void 0 }), K("invalid", e);
                break;
              case "textarea":
                _u(e, r), l = Pi(e, r), K("invalid", e);
                break;
              default:
                l = r;
            }
            Ti(n, l), u = l;
            for (i in u) if (u.hasOwnProperty(i)) {
              var a = u[i];
              i === "style" ? cs(e, a) : i === "dangerouslySetInnerHTML" ? (a = a ? a.__html : void 0, a != null && as(e, a)) : i === "children" ? typeof a == "string" ? (n !== "textarea" || a !== "") && Gn(e, a) : typeof a == "number" && Gn(e, "" + a) : i !== "suppressContentEditableWarning" && i !== "suppressHydrationWarning" && i !== "autoFocus" && (Kn.hasOwnProperty(i) ? a != null && i === "onScroll" && K("scroll", e) : a != null && xo(e, i, a, o));
            }
            switch (n) {
              case "input":
                xr(e), Eu(e, r, !1);
                break;
              case "textarea":
                xr(e), Cu(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + _t(r.value));
                break;
              case "select":
                e.multiple = !!r.multiple, i = r.value, i != null ? rn(e, !!r.multiple, i, !1) : r.defaultValue != null && rn(
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
      return pe(t), null;
    case 6:
      if (e && t.stateNode != null) Dc(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(k(166));
        if (n = Mt(or.current), Mt(qe.current), jr(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[Ze] = t, (i = r.nodeValue !== n) && (e = Ne, e !== null)) switch (e.tag) {
            case 3:
              Nr(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && Nr(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          i && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[Ze] = t, t.stateNode = r;
      }
      return pe(t), null;
    case 13:
      if (G(q), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (Z && Te !== null && t.mode & 1 && !(t.flags & 128)) Js(), pn(), t.flags |= 98560, i = !1;
        else if (i = jr(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!i) throw Error(k(318));
            if (i = t.memoizedState, i = i !== null ? i.dehydrated : null, !i) throw Error(k(317));
            i[Ze] = t;
          } else pn(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          pe(t), i = !1;
        } else Ve !== null && (so(Ve), Ve = null), i = !0;
        if (!i) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || q.current & 1 ? oe === 0 && (oe = 3) : ru())), t.updateQueue !== null && (t.flags |= 4), pe(t), null);
    case 4:
      return mn(), to(e, t), e === null && nr(t.stateNode.containerInfo), pe(t), null;
    case 10:
      return Uo(t.type._context), pe(t), null;
    case 17:
      return Ee(t.type) && ol(), pe(t), null;
    case 19:
      if (G(q), i = t.memoizedState, i === null) return pe(t), null;
      if (r = (t.flags & 128) !== 0, o = i.rendering, o === null) if (r) Ln(i, !1);
      else {
        if (oe !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (o = pl(e), o !== null) {
            for (t.flags |= 128, Ln(i, !1), r = o.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) i = n, e = r, i.flags &= 14680066, o = i.alternate, o === null ? (i.childLanes = 0, i.lanes = e, i.child = null, i.subtreeFlags = 0, i.memoizedProps = null, i.memoizedState = null, i.updateQueue = null, i.dependencies = null, i.stateNode = null) : (i.childLanes = o.childLanes, i.lanes = o.lanes, i.child = o.child, i.subtreeFlags = 0, i.deletions = null, i.memoizedProps = o.memoizedProps, i.memoizedState = o.memoizedState, i.updateQueue = o.updateQueue, i.type = o.type, e = o.dependencies, i.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return Y(q, q.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        i.tail !== null && ne() > yn && (t.flags |= 128, r = !0, Ln(i, !1), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = pl(o), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), Ln(i, !0), i.tail === null && i.tailMode === "hidden" && !o.alternate && !Z) return pe(t), null;
        } else 2 * ne() - i.renderingStartTime > yn && n !== 1073741824 && (t.flags |= 128, r = !0, Ln(i, !1), t.lanes = 4194304);
        i.isBackwards ? (o.sibling = t.child, t.child = o) : (n = i.last, n !== null ? n.sibling = o : t.child = o, i.last = o);
      }
      return i.tail !== null ? (t = i.tail, i.rendering = t, i.tail = t.sibling, i.renderingStartTime = ne(), t.sibling = null, n = q.current, Y(q, r ? n & 1 | 2 : n & 1), t) : (pe(t), null);
    case 22:
    case 23:
      return nu(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? ze & 1073741824 && (pe(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : pe(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(k(156, t.tag));
}
function kp(e, t) {
  switch ($o(t), t.tag) {
    case 1:
      return Ee(t.type) && ol(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return mn(), G(ke), G(me), Qo(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return Ho(t), null;
    case 13:
      if (G(q), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(k(340));
        pn();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return G(q), null;
    case 4:
      return mn(), null;
    case 10:
      return Uo(t.type._context), null;
    case 22:
    case 23:
      return nu(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var Dr = !1, he = !1, Ep = typeof WeakSet == "function" ? WeakSet : Set, T = null;
function tn(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    te(e, t, r);
  }
  else n.current = null;
}
function no(e, t, n) {
  try {
    n();
  } catch (r) {
    te(e, t, r);
  }
}
var ha = !1;
function _p(e, t) {
  if (Ai = nl, e = Os(), Mo(e)) {
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
        var o = 0, u = -1, a = -1, s = 0, c = 0, f = e, p = null;
        t: for (; ; ) {
          for (var y; f !== n || l !== 0 && f.nodeType !== 3 || (u = o + l), f !== i || r !== 0 && f.nodeType !== 3 || (a = o + r), f.nodeType === 3 && (o += f.nodeValue.length), (y = f.firstChild) !== null; )
            p = f, f = y;
          for (; ; ) {
            if (f === e) break t;
            if (p === n && ++s === l && (u = o), p === i && ++c === r && (a = o), (y = f.nextSibling) !== null) break;
            f = p, p = f.parentNode;
          }
          f = y;
        }
        n = u === -1 || a === -1 ? null : { start: u, end: a };
      } else n = null;
    }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (Ui = { focusedElem: e, selectionRange: n }, nl = !1, T = t; T !== null; ) if (t = T, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, T = e;
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
            var S = v.memoizedProps, N = v.memoizedState, h = t.stateNode, d = h.getSnapshotBeforeUpdate(t.elementType === t.type ? S : Ue(t.type, S), N);
            h.__reactInternalSnapshotBeforeUpdate = d;
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
          throw Error(k(163));
      }
    } catch (w) {
      te(t, t.return, w);
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
function Mc(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, Mc(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Ze], delete t[lr], delete t[Wi], delete t[op], delete t[up])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function Ic(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function ma(e) {
  e: for (; ; ) {
    for (; e.sibling === null; ) {
      if (e.return === null || Ic(e.return)) return null;
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
var se = null, Be = !1;
function st(e, t, n) {
  for (n = n.child; n !== null; ) $c(e, t, n), n = n.sibling;
}
function $c(e, t, n) {
  if (Je && typeof Je.onCommitFiberUnmount == "function") try {
    Je.onCommitFiberUnmount(xl, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      he || tn(n, t);
    case 6:
      var r = se, l = Be;
      se = null, st(e, t, n), se = r, Be = l, se !== null && (Be ? (e = se, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : se.removeChild(n.stateNode));
      break;
    case 18:
      se !== null && (Be ? (e = se, n = n.stateNode, e.nodeType === 8 ? ri(e.parentNode, n) : e.nodeType === 1 && ri(e, n), bn(e)) : ri(se, n.stateNode));
      break;
    case 4:
      r = se, l = Be, se = n.stateNode.containerInfo, Be = !0, st(e, t, n), se = r, Be = l;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!he && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        l = r = r.next;
        do {
          var i = l, o = i.destroy;
          i = i.tag, o !== void 0 && (i & 2 || i & 4) && no(n, t, o), l = l.next;
        } while (l !== r);
      }
      st(e, t, n);
      break;
    case 1:
      if (!he && (tn(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
        r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
      } catch (u) {
        te(n, t, u);
      }
      st(e, t, n);
      break;
    case 21:
      st(e, t, n);
      break;
    case 22:
      n.mode & 1 ? (he = (r = he) || n.memoizedState !== null, st(e, t, n), he = r) : st(e, t, n);
      break;
    default:
      st(e, t, n);
  }
}
function va(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new Ep()), t.forEach(function(r) {
      var l = Dp.bind(null, e, r);
      n.has(r) || (n.add(r), r.then(l, l));
    });
  }
}
function Ae(e, t) {
  var n = t.deletions;
  if (n !== null) for (var r = 0; r < n.length; r++) {
    var l = n[r];
    try {
      var i = e, o = t, u = o;
      e: for (; u !== null; ) {
        switch (u.tag) {
          case 5:
            se = u.stateNode, Be = !1;
            break e;
          case 3:
            se = u.stateNode.containerInfo, Be = !0;
            break e;
          case 4:
            se = u.stateNode.containerInfo, Be = !0;
            break e;
        }
        u = u.return;
      }
      if (se === null) throw Error(k(160));
      $c(i, o, l), se = null, Be = !1;
      var a = l.alternate;
      a !== null && (a.return = null), l.return = null;
    } catch (s) {
      te(l, t, s);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) Fc(t, e), t = t.sibling;
}
function Fc(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (Ae(t, e), Ke(e), r & 4) {
        try {
          Qn(3, e, e.return), Nl(3, e);
        } catch (S) {
          te(e, e.return, S);
        }
        try {
          Qn(5, e, e.return);
        } catch (S) {
          te(e, e.return, S);
        }
      }
      break;
    case 1:
      Ae(t, e), Ke(e), r & 512 && n !== null && tn(n, n.return);
      break;
    case 5:
      if (Ae(t, e), Ke(e), r & 512 && n !== null && tn(n, n.return), e.flags & 32) {
        var l = e.stateNode;
        try {
          Gn(l, "");
        } catch (S) {
          te(e, e.return, S);
        }
      }
      if (r & 4 && (l = e.stateNode, l != null)) {
        var i = e.memoizedProps, o = n !== null ? n.memoizedProps : i, u = e.type, a = e.updateQueue;
        if (e.updateQueue = null, a !== null) try {
          u === "input" && i.type === "radio" && i.name != null && is(l, i), Ni(u, o);
          var s = Ni(u, i);
          for (o = 0; o < a.length; o += 2) {
            var c = a[o], f = a[o + 1];
            c === "style" ? cs(l, f) : c === "dangerouslySetInnerHTML" ? as(l, f) : c === "children" ? Gn(l, f) : xo(l, c, f, s);
          }
          switch (u) {
            case "input":
              _i(l, i);
              break;
            case "textarea":
              os(l, i);
              break;
            case "select":
              var p = l._wrapperState.wasMultiple;
              l._wrapperState.wasMultiple = !!i.multiple;
              var y = i.value;
              y != null ? rn(l, !!i.multiple, y, !1) : p !== !!i.multiple && (i.defaultValue != null ? rn(
                l,
                !!i.multiple,
                i.defaultValue,
                !0
              ) : rn(l, !!i.multiple, i.multiple ? [] : "", !1));
          }
          l[lr] = i;
        } catch (S) {
          te(e, e.return, S);
        }
      }
      break;
    case 6:
      if (Ae(t, e), Ke(e), r & 4) {
        if (e.stateNode === null) throw Error(k(162));
        l = e.stateNode, i = e.memoizedProps;
        try {
          l.nodeValue = i;
        } catch (S) {
          te(e, e.return, S);
        }
      }
      break;
    case 3:
      if (Ae(t, e), Ke(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        bn(t.containerInfo);
      } catch (S) {
        te(e, e.return, S);
      }
      break;
    case 4:
      Ae(t, e), Ke(e);
      break;
    case 13:
      Ae(t, e), Ke(e), l = e.child, l.flags & 8192 && (i = l.memoizedState !== null, l.stateNode.isHidden = i, !i || l.alternate !== null && l.alternate.memoizedState !== null || (eu = ne())), r & 4 && va(e);
      break;
    case 22:
      if (c = n !== null && n.memoizedState !== null, e.mode & 1 ? (he = (s = he) || c, Ae(t, e), he = s) : Ae(t, e), Ke(e), r & 8192) {
        if (s = e.memoizedState !== null, (e.stateNode.isHidden = s) && !c && e.mode & 1) for (T = e, c = e.child; c !== null; ) {
          for (f = T = c; T !== null; ) {
            switch (p = T, y = p.child, p.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                Qn(4, p, p.return);
                break;
              case 1:
                tn(p, p.return);
                var v = p.stateNode;
                if (typeof v.componentWillUnmount == "function") {
                  r = p, n = p.return;
                  try {
                    t = r, v.props = t.memoizedProps, v.state = t.memoizedState, v.componentWillUnmount();
                  } catch (S) {
                    te(r, n, S);
                  }
                }
                break;
              case 5:
                tn(p, p.return);
                break;
              case 22:
                if (p.memoizedState !== null) {
                  ga(f);
                  continue;
                }
            }
            y !== null ? (y.return = p, T = y) : ga(f);
          }
          c = c.sibling;
        }
        e: for (c = null, f = e; ; ) {
          if (f.tag === 5) {
            if (c === null) {
              c = f;
              try {
                l = f.stateNode, s ? (i = l.style, typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none") : (u = f.stateNode, a = f.memoizedProps.style, o = a != null && a.hasOwnProperty("display") ? a.display : null, u.style.display = ss("display", o));
              } catch (S) {
                te(e, e.return, S);
              }
            }
          } else if (f.tag === 6) {
            if (c === null) try {
              f.stateNode.nodeValue = s ? "" : f.memoizedProps;
            } catch (S) {
              te(e, e.return, S);
            }
          } else if ((f.tag !== 22 && f.tag !== 23 || f.memoizedState === null || f === e) && f.child !== null) {
            f.child.return = f, f = f.child;
            continue;
          }
          if (f === e) break e;
          for (; f.sibling === null; ) {
            if (f.return === null || f.return === e) break e;
            c === f && (c = null), f = f.return;
          }
          c === f && (c = null), f.sibling.return = f.return, f = f.sibling;
        }
      }
      break;
    case 19:
      Ae(t, e), Ke(e), r & 4 && va(e);
      break;
    case 21:
      break;
    default:
      Ae(
        t,
        e
      ), Ke(e);
  }
}
function Ke(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (Ic(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(k(160));
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
          throw Error(k(161));
      }
    } catch (a) {
      te(e, e.return, a);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function Cp(e, t, n) {
  T = e, Oc(e);
}
function Oc(e, t, n) {
  for (var r = (e.mode & 1) !== 0; T !== null; ) {
    var l = T, i = l.child;
    if (l.tag === 22 && r) {
      var o = l.memoizedState !== null || Dr;
      if (!o) {
        var u = l.alternate, a = u !== null && u.memoizedState !== null || he;
        u = Dr;
        var s = he;
        if (Dr = o, (he = a) && !s) for (T = l; T !== null; ) o = T, a = o.child, o.tag === 22 && o.memoizedState !== null ? wa(l) : a !== null ? (a.return = o, T = a) : wa(l);
        for (; i !== null; ) T = i, Oc(i), i = i.sibling;
        T = l, Dr = u, he = s;
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
            he || Nl(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !he) if (n === null) r.componentDidMount();
            else {
              var l = t.elementType === t.type ? n.memoizedProps : Ue(t.type, n.memoizedProps);
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
                  var f = c.dehydrated;
                  f !== null && bn(f);
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
            throw Error(k(163));
        }
        he || t.flags & 512 && ro(t);
      } catch (p) {
        te(t, t.return, p);
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
            te(t, n, a);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var l = t.return;
            try {
              r.componentDidMount();
            } catch (a) {
              te(t, l, a);
            }
          }
          var i = t.return;
          try {
            ro(t);
          } catch (a) {
            te(t, i, a);
          }
          break;
        case 5:
          var o = t.return;
          try {
            ro(t);
          } catch (a) {
            te(t, o, a);
          }
      }
    } catch (a) {
      te(t, t.return, a);
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
var Pp = Math.ceil, vl = at.ReactCurrentDispatcher, qo = at.ReactCurrentOwner, $e = at.ReactCurrentBatchConfig, U = 0, ae = null, re = null, ce = 0, ze = 0, nn = zt(0), oe = 0, cr = null, Ut = 0, jl = 0, bo = 0, Yn = null, Se = null, eu = 0, yn = 1 / 0, be = null, yl = !1, oo = null, xt = null, Mr = !1, mt = null, gl = 0, Xn = 0, uo = null, Kr = -1, Gr = 0;
function ye() {
  return U & 6 ? ne() : Kr !== -1 ? Kr : Kr = ne();
}
function kt(e) {
  return e.mode & 1 ? U & 2 && ce !== 0 ? ce & -ce : sp.transition !== null ? (Gr === 0 && (Gr = ks()), Gr) : (e = H, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Ns(e.type)), e) : 1;
}
function He(e, t, n, r) {
  if (50 < Xn) throw Xn = 0, uo = null, Error(k(185));
  dr(e, n, r), (!(U & 2) || e !== ae) && (e === ae && (!(U & 2) && (jl |= n), oe === 4 && pt(e, ce)), _e(e, r), n === 1 && U === 0 && !(t.mode & 1) && (yn = ne() + 500, Pl && Tt()));
}
function _e(e, t) {
  var n = e.callbackNode;
  sd(e, t);
  var r = tl(e, e === ae ? ce : 0);
  if (r === 0) n !== null && Tu(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && Tu(n), t === 1) e.tag === 0 ? ap(Sa.bind(null, e)) : Ks(Sa.bind(null, e)), lp(function() {
      !(U & 6) && Tt();
    }), n = null;
    else {
      switch (Es(r)) {
        case 1:
          n = Po;
          break;
        case 4:
          n = Ss;
          break;
        case 16:
          n = el;
          break;
        case 536870912:
          n = xs;
          break;
        default:
          n = el;
      }
      n = Yc(n, Ac.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function Ac(e, t) {
  if (Kr = -1, Gr = 0, U & 6) throw Error(k(327));
  var n = e.callbackNode;
  if (sn() && e.callbackNode !== n) return null;
  var r = tl(e, e === ae ? ce : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = wl(e, r);
  else {
    t = r;
    var l = U;
    U |= 2;
    var i = Bc();
    (ae !== e || ce !== t) && (be = null, yn = ne() + 500, It(e, t));
    do
      try {
        Np();
        break;
      } catch (u) {
        Uc(e, u);
      }
    while (!0);
    Ao(), vl.current = i, U = l, re !== null ? t = 0 : (ae = null, ce = 0, t = oe);
  }
  if (t !== 0) {
    if (t === 2 && (l = Mi(e), l !== 0 && (r = l, t = ao(e, l))), t === 1) throw n = cr, It(e, 0), pt(e, r), _e(e, ne()), n;
    if (t === 6) pt(e, r);
    else {
      if (l = e.current.alternate, !(r & 30) && !zp(l) && (t = wl(e, r), t === 2 && (i = Mi(e), i !== 0 && (r = i, t = ao(e, i))), t === 1)) throw n = cr, It(e, 0), pt(e, r), _e(e, ne()), n;
      switch (e.finishedWork = l, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(k(345));
        case 2:
          Rt(e, Se, be);
          break;
        case 3:
          if (pt(e, r), (r & 130023424) === r && (t = eu + 500 - ne(), 10 < t)) {
            if (tl(e, 0) !== 0) break;
            if (l = e.suspendedLanes, (l & r) !== r) {
              ye(), e.pingedLanes |= e.suspendedLanes & l;
              break;
            }
            e.timeoutHandle = Vi(Rt.bind(null, e, Se, be), t);
            break;
          }
          Rt(e, Se, be);
          break;
        case 4:
          if (pt(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, l = -1; 0 < r; ) {
            var o = 31 - We(r);
            i = 1 << o, o = t[o], o > l && (l = o), r &= ~i;
          }
          if (r = l, r = ne() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * Pp(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = Vi(Rt.bind(null, e, Se, be), r);
            break;
          }
          Rt(e, Se, be);
          break;
        case 5:
          Rt(e, Se, be);
          break;
        default:
          throw Error(k(329));
      }
    }
  }
  return _e(e, ne()), e.callbackNode === n ? Ac.bind(null, e) : null;
}
function ao(e, t) {
  var n = Yn;
  return e.current.memoizedState.isDehydrated && (It(e, t).flags |= 256), e = wl(e, t), e !== 2 && (t = Se, Se = n, t !== null && so(t)), e;
}
function so(e) {
  Se === null ? Se = e : Se.push.apply(Se, e);
}
function zp(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
        var l = n[r], i = l.getSnapshot;
        l = l.value;
        try {
          if (!Qe(i(), l)) return !1;
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
function pt(e, t) {
  for (t &= ~bo, t &= ~jl, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - We(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function Sa(e) {
  if (U & 6) throw Error(k(327));
  sn();
  var t = tl(e, 0);
  if (!(t & 1)) return _e(e, ne()), null;
  var n = wl(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Mi(e);
    r !== 0 && (t = r, n = ao(e, r));
  }
  if (n === 1) throw n = cr, It(e, 0), pt(e, t), _e(e, ne()), n;
  if (n === 6) throw Error(k(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, Rt(e, Se, be), _e(e, ne()), null;
}
function tu(e, t) {
  var n = U;
  U |= 1;
  try {
    return e(t);
  } finally {
    U = n, U === 0 && (yn = ne() + 500, Pl && Tt());
  }
}
function Bt(e) {
  mt !== null && mt.tag === 0 && !(U & 6) && sn();
  var t = U;
  U |= 1;
  var n = $e.transition, r = H;
  try {
    if ($e.transition = null, H = 1, e) return e();
  } finally {
    H = r, $e.transition = n, U = t, !(U & 6) && Tt();
  }
}
function nu() {
  ze = nn.current, G(nn);
}
function It(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, rp(n)), re !== null) for (n = re.return; n !== null; ) {
    var r = n;
    switch ($o(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && ol();
        break;
      case 3:
        mn(), G(ke), G(me), Qo();
        break;
      case 5:
        Ho(r);
        break;
      case 4:
        mn();
        break;
      case 13:
        G(q);
        break;
      case 19:
        G(q);
        break;
      case 10:
        Uo(r.type._context);
        break;
      case 22:
      case 23:
        nu();
    }
    n = n.return;
  }
  if (ae = e, re = e = Et(e.current, null), ce = ze = t, oe = 0, cr = null, bo = jl = Ut = 0, Se = Yn = null, Dt !== null) {
    for (t = 0; t < Dt.length; t++) if (n = Dt[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var l = r.next, i = n.pending;
      if (i !== null) {
        var o = i.next;
        i.next = l, r.next = o;
      }
      n.pending = r;
    }
    Dt = null;
  }
  return e;
}
function Uc(e, t) {
  do {
    var n = re;
    try {
      if (Ao(), Qr.current = ml, hl) {
        for (var r = b.memoizedState; r !== null; ) {
          var l = r.queue;
          l !== null && (l.pending = null), r = r.next;
        }
        hl = !1;
      }
      if (At = 0, ue = ie = b = null, Hn = !1, ur = 0, qo.current = null, n === null || n.return === null) {
        oe = 1, cr = t, re = null;
        break;
      }
      e: {
        var i = e, o = n.return, u = n, a = t;
        if (t = ce, u.flags |= 32768, a !== null && typeof a == "object" && typeof a.then == "function") {
          var s = a, c = u, f = c.tag;
          if (!(c.mode & 1) && (f === 0 || f === 11 || f === 15)) {
            var p = c.alternate;
            p ? (c.updateQueue = p.updateQueue, c.memoizedState = p.memoizedState, c.lanes = p.lanes) : (c.updateQueue = null, c.memoizedState = null);
          }
          var y = ua(o);
          if (y !== null) {
            y.flags &= -257, aa(y, o, u, i, t), y.mode & 1 && oa(i, s, t), t = y, a = s;
            var v = t.updateQueue;
            if (v === null) {
              var S = /* @__PURE__ */ new Set();
              S.add(a), t.updateQueue = S;
            } else v.add(a);
            break e;
          } else {
            if (!(t & 1)) {
              oa(i, s, t), ru();
              break e;
            }
            a = Error(k(426));
          }
        } else if (Z && u.mode & 1) {
          var N = ua(o);
          if (N !== null) {
            !(N.flags & 65536) && (N.flags |= 256), aa(N, o, u, i, t), Fo(vn(a, u));
            break e;
          }
        }
        i = a = vn(a, u), oe !== 4 && (oe = 2), Yn === null ? Yn = [i] : Yn.push(i), i = o;
        do {
          switch (i.tag) {
            case 3:
              i.flags |= 65536, t &= -t, i.lanes |= t;
              var h = Ec(i, a, t);
              ea(i, h);
              break e;
            case 1:
              u = a;
              var d = i.type, m = i.stateNode;
              if (!(i.flags & 128) && (typeof d.getDerivedStateFromError == "function" || m !== null && typeof m.componentDidCatch == "function" && (xt === null || !xt.has(m)))) {
                i.flags |= 65536, t &= -t, i.lanes |= t;
                var w = _c(i, u, t);
                ea(i, w);
                break e;
              }
          }
          i = i.return;
        } while (i !== null);
      }
      Wc(n);
    } catch (E) {
      t = E, re === n && n !== null && (re = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function Bc() {
  var e = vl.current;
  return vl.current = ml, e === null ? ml : e;
}
function ru() {
  (oe === 0 || oe === 3 || oe === 2) && (oe = 4), ae === null || !(Ut & 268435455) && !(jl & 268435455) || pt(ae, ce);
}
function wl(e, t) {
  var n = U;
  U |= 2;
  var r = Bc();
  (ae !== e || ce !== t) && (be = null, It(e, t));
  do
    try {
      Tp();
      break;
    } catch (l) {
      Uc(e, l);
    }
  while (!0);
  if (Ao(), U = n, vl.current = r, re !== null) throw Error(k(261));
  return ae = null, ce = 0, oe;
}
function Tp() {
  for (; re !== null; ) Vc(re);
}
function Np() {
  for (; re !== null && !ed(); ) Vc(re);
}
function Vc(e) {
  var t = Qc(e.alternate, e, ze);
  e.memoizedProps = e.pendingProps, t === null ? Wc(e) : re = t, qo.current = null;
}
function Wc(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = kp(n, t), n !== null) {
        n.flags &= 32767, re = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        oe = 6, re = null;
        return;
      }
    } else if (n = xp(n, t, ze), n !== null) {
      re = n;
      return;
    }
    if (t = t.sibling, t !== null) {
      re = t;
      return;
    }
    re = t = e;
  } while (t !== null);
  oe === 0 && (oe = 5);
}
function Rt(e, t, n) {
  var r = H, l = $e.transition;
  try {
    $e.transition = null, H = 1, jp(e, t, n, r);
  } finally {
    $e.transition = l, H = r;
  }
  return null;
}
function jp(e, t, n, r) {
  do
    sn();
  while (mt !== null);
  if (U & 6) throw Error(k(327));
  n = e.finishedWork;
  var l = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(k(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var i = n.lanes | n.childLanes;
  if (cd(e, i), e === ae && (re = ae = null, ce = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || Mr || (Mr = !0, Yc(el, function() {
    return sn(), null;
  })), i = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || i) {
    i = $e.transition, $e.transition = null;
    var o = H;
    H = 1;
    var u = U;
    U |= 4, qo.current = null, _p(e, n), Fc(n, e), Zd(Ui), nl = !!Ai, Ui = Ai = null, e.current = n, Cp(n), td(), U = u, H = o, $e.transition = i;
  } else e.current = n;
  if (Mr && (Mr = !1, mt = e, gl = l), i = e.pendingLanes, i === 0 && (xt = null), ld(n.stateNode), _e(e, ne()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) l = t[n], r(l.value, { componentStack: l.stack, digest: l.digest });
  if (yl) throw yl = !1, e = oo, oo = null, e;
  return gl & 1 && e.tag !== 0 && sn(), i = e.pendingLanes, i & 1 ? e === uo ? Xn++ : (Xn = 0, uo = e) : Xn = 0, Tt(), null;
}
function sn() {
  if (mt !== null) {
    var e = Es(gl), t = $e.transition, n = H;
    try {
      if ($e.transition = null, H = 16 > e ? 16 : e, mt === null) var r = !1;
      else {
        if (e = mt, mt = null, gl = 0, U & 6) throw Error(k(331));
        var l = U;
        for (U |= 4, T = e.current; T !== null; ) {
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
                  var f = c.child;
                  if (f !== null) f.return = c, T = f;
                  else for (; T !== null; ) {
                    c = T;
                    var p = c.sibling, y = c.return;
                    if (Mc(c), c === s) {
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
                var S = v.child;
                if (S !== null) {
                  v.child = null;
                  do {
                    var N = S.sibling;
                    S.sibling = null, S = N;
                  } while (S !== null);
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
        var d = e.current;
        for (T = d; T !== null; ) {
          o = T;
          var m = o.child;
          if (o.subtreeFlags & 2064 && m !== null) m.return = o, T = m;
          else e: for (o = d; T !== null; ) {
            if (u = T, u.flags & 2048) try {
              switch (u.tag) {
                case 0:
                case 11:
                case 15:
                  Nl(9, u);
              }
            } catch (E) {
              te(u, u.return, E);
            }
            if (u === o) {
              T = null;
              break e;
            }
            var w = u.sibling;
            if (w !== null) {
              w.return = u.return, T = w;
              break e;
            }
            T = u.return;
          }
        }
        if (U = l, Tt(), Je && typeof Je.onPostCommitFiberRoot == "function") try {
          Je.onPostCommitFiberRoot(xl, e);
        } catch {
        }
        r = !0;
      }
      return r;
    } finally {
      H = n, $e.transition = t;
    }
  }
  return !1;
}
function xa(e, t, n) {
  t = vn(n, t), t = Ec(e, t, 1), e = St(e, t, 1), t = ye(), e !== null && (dr(e, 1, t), _e(e, t));
}
function te(e, t, n) {
  if (e.tag === 3) xa(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      xa(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (xt === null || !xt.has(r))) {
        e = vn(n, e), e = _c(t, e, 1), t = St(t, e, 1), e = ye(), t !== null && (dr(t, 1, e), _e(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function Rp(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = ye(), e.pingedLanes |= e.suspendedLanes & n, ae === e && (ce & n) === n && (oe === 4 || oe === 3 && (ce & 130023424) === ce && 500 > ne() - eu ? It(e, 0) : bo |= n), _e(e, t);
}
function Hc(e, t) {
  t === 0 && (e.mode & 1 ? (t = _r, _r <<= 1, !(_r & 130023424) && (_r = 4194304)) : t = 1);
  var n = ye();
  e = ot(e, t), e !== null && (dr(e, t, n), _e(e, n));
}
function Lp(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), Hc(e, n);
}
function Dp(e, t) {
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
      throw Error(k(314));
  }
  r !== null && r.delete(t), Hc(e, n);
}
var Qc;
Qc = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || ke.current) xe = !0;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return xe = !1, Sp(e, t, n);
    xe = !!(e.flags & 131072);
  }
  else xe = !1, Z && t.flags & 1048576 && Gs(t, sl, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      Xr(e, t), e = t.pendingProps;
      var l = dn(t, me.current);
      an(t, n), l = Xo(null, t, r, e, l, n);
      var i = Ko();
      return t.flags |= 1, typeof l == "object" && l !== null && typeof l.render == "function" && l.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, Ee(r) ? (i = !0, ul(t)) : i = !1, t.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null, Vo(t), l.updater = Tl, t.stateNode = l, l._reactInternals = t, Gi(t, r, e, n), t = qi(null, t, r, !0, i, n)) : (t.tag = 0, Z && i && Io(t), ve(null, t, l, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (Xr(e, t), e = t.pendingProps, l = r._init, r = l(r._payload), t.type = r, l = t.tag = Ip(r), e = Ue(r, e), l) {
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
            t = ca(null, t, r, Ue(r.type, e), n);
            break e;
        }
        throw Error(k(
          306,
          r,
          ""
        ));
      }
      return t;
    case 0:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Ue(r, l), Ji(e, t, r, l, n);
    case 1:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Ue(r, l), fa(e, t, r, l, n);
    case 3:
      e: {
        if (Tc(t), e === null) throw Error(k(387));
        r = t.pendingProps, i = t.memoizedState, l = i.element, tc(e, t), dl(t, r, null, n);
        var o = t.memoizedState;
        if (r = o.element, i.isDehydrated) if (i = { element: r, isDehydrated: !1, cache: o.cache, pendingSuspenseBoundaries: o.pendingSuspenseBoundaries, transitions: o.transitions }, t.updateQueue.baseState = i, t.memoizedState = i, t.flags & 256) {
          l = vn(Error(k(423)), t), t = da(e, t, r, n, l);
          break e;
        } else if (r !== l) {
          l = vn(Error(k(424)), t), t = da(e, t, r, n, l);
          break e;
        } else for (Te = wt(t.stateNode.containerInfo.firstChild), Ne = t, Z = !0, Ve = null, n = bs(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (pn(), r === l) {
            t = ut(e, t, n);
            break e;
          }
          ve(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return nc(t), e === null && Yi(t), r = t.type, l = t.pendingProps, i = e !== null ? e.memoizedProps : null, o = l.children, Bi(r, l) ? o = null : i !== null && Bi(r, i) && (t.flags |= 32), zc(e, t), ve(e, t, o, n), t.child;
    case 6:
      return e === null && Yi(t), null;
    case 13:
      return Nc(e, t, n);
    case 4:
      return Wo(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = hn(t, null, r, n) : ve(e, t, r, n), t.child;
    case 11:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Ue(r, l), sa(e, t, r, l, n);
    case 7:
      return ve(e, t, t.pendingProps, n), t.child;
    case 8:
      return ve(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return ve(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, l = t.pendingProps, i = t.memoizedProps, o = l.value, Y(cl, r._currentValue), r._currentValue = o, i !== null) if (Qe(i.value, o)) {
          if (i.children === l.children && !ke.current) {
            t = ut(e, t, n);
            break e;
          }
        } else for (i = t.child, i !== null && (i.return = t); i !== null; ) {
          var u = i.dependencies;
          if (u !== null) {
            o = i.child;
            for (var a = u.firstContext; a !== null; ) {
              if (a.context === r) {
                if (i.tag === 1) {
                  a = rt(-1, n & -n), a.tag = 2;
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
            if (o = i.return, o === null) throw Error(k(341));
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
        ve(e, t, l.children, n), t = t.child;
      }
      return t;
    case 9:
      return l = t.type, r = t.pendingProps.children, an(t, n), l = Fe(l), r = r(l), t.flags |= 1, ve(e, t, r, n), t.child;
    case 14:
      return r = t.type, l = Ue(r, t.pendingProps), l = Ue(r.type, l), ca(e, t, r, l, n);
    case 15:
      return Cc(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Ue(r, l), Xr(e, t), t.tag = 1, Ee(r) ? (e = !0, ul(t)) : e = !1, an(t, n), kc(t, r, l), Gi(t, r, l, n), qi(null, t, r, !0, e, n);
    case 19:
      return jc(e, t, n);
    case 22:
      return Pc(e, t, n);
  }
  throw Error(k(156, t.tag));
};
function Yc(e, t) {
  return ws(e, t);
}
function Mp(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function Ie(e, t, n, r) {
  return new Mp(e, t, n, r);
}
function lu(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function Ip(e) {
  if (typeof e == "function") return lu(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === Eo) return 11;
    if (e === _o) return 14;
  }
  return 2;
}
function Et(e, t) {
  var n = e.alternate;
  return n === null ? (n = Ie(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function Zr(e, t, n, r, l, i) {
  var o = 2;
  if (r = e, typeof e == "function") lu(e) && (o = 1);
  else if (typeof e == "string") o = 5;
  else e: switch (e) {
    case Yt:
      return $t(n.children, l, i, t);
    case ko:
      o = 8, l |= 8;
      break;
    case wi:
      return e = Ie(12, n, t, l | 2), e.elementType = wi, e.lanes = i, e;
    case Si:
      return e = Ie(13, n, t, l), e.elementType = Si, e.lanes = i, e;
    case xi:
      return e = Ie(19, n, t, l), e.elementType = xi, e.lanes = i, e;
    case ns:
      return Rl(n, l, i, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case es:
          o = 10;
          break e;
        case ts:
          o = 9;
          break e;
        case Eo:
          o = 11;
          break e;
        case _o:
          o = 14;
          break e;
        case ct:
          o = 16, r = null;
          break e;
      }
      throw Error(k(130, e == null ? e : typeof e, ""));
  }
  return t = Ie(o, n, t, l), t.elementType = e, t.type = r, t.lanes = i, t;
}
function $t(e, t, n, r) {
  return e = Ie(7, e, r, t), e.lanes = n, e;
}
function Rl(e, t, n, r) {
  return e = Ie(22, e, r, t), e.elementType = ns, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
}
function fi(e, t, n) {
  return e = Ie(6, e, null, t), e.lanes = n, e;
}
function di(e, t, n) {
  return t = Ie(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function $p(e, t, n, r, l) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Yl(0), this.expirationTimes = Yl(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Yl(0), this.identifierPrefix = r, this.onRecoverableError = l, this.mutableSourceEagerHydrationData = null;
}
function iu(e, t, n, r, l, i, o, u, a) {
  return e = new $p(e, t, n, u, a), t === 1 ? (t = 1, i === !0 && (t |= 8)) : t = 0, i = Ie(3, null, null, t), e.current = i, i.stateNode = e, i.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Vo(i), e;
}
function Fp(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: Qt, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function Xc(e) {
  if (!e) return Ct;
  e = e._reactInternals;
  e: {
    if (Wt(e) !== e || e.tag !== 1) throw Error(k(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (Ee(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(k(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (Ee(n)) return Xs(e, n, t);
  }
  return t;
}
function Kc(e, t, n, r, l, i, o, u, a) {
  return e = iu(n, r, !0, e, l, i, o, u, a), e.context = Xc(null), n = e.current, r = ye(), l = kt(n), i = rt(r, l), i.callback = t ?? null, St(n, i, l), e.current.lanes = l, dr(e, l, r), _e(e, r), e;
}
function Ll(e, t, n, r) {
  var l = t.current, i = ye(), o = kt(l);
  return n = Xc(n), t.context === null ? t.context = n : t.pendingContext = n, t = rt(i, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = St(l, t, o), e !== null && (He(e, l, o, i), Hr(e, l, o)), o;
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
function Op() {
  return null;
}
var Gc = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function uu(e) {
  this._internalRoot = e;
}
Dl.prototype.render = uu.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(k(409));
  Ll(e, t, null, null);
};
Dl.prototype.unmount = uu.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    Bt(function() {
      Ll(null, e, null, null);
    }), t[it] = null;
  }
};
function Dl(e) {
  this._internalRoot = e;
}
Dl.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = Ps();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < dt.length && t !== 0 && t < dt[n].priority; n++) ;
    dt.splice(n, 0, e), n === 0 && Ts(e);
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
function Ap(e, t, n, r, l) {
  if (l) {
    if (typeof r == "function") {
      var i = r;
      r = function() {
        var s = Sl(o);
        i.call(s);
      };
    }
    var o = Kc(t, r, e, 0, null, !1, !1, "", Ea);
    return e._reactRootContainer = o, e[it] = o.current, nr(e.nodeType === 8 ? e.parentNode : e), Bt(), o;
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
  return e._reactRootContainer = a, e[it] = a.current, nr(e.nodeType === 8 ? e.parentNode : e), Bt(function() {
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
  } else o = Ap(n, t, e, l, r);
  return Sl(o);
}
_s = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Fn(t.pendingLanes);
        n !== 0 && (zo(t, n | 1), _e(t, ne()), !(U & 6) && (yn = ne() + 500, Tt()));
      }
      break;
    case 13:
      Bt(function() {
        var r = ot(e, 1);
        if (r !== null) {
          var l = ye();
          He(r, e, 1, l);
        }
      }), ou(e, 1);
  }
};
To = function(e) {
  if (e.tag === 13) {
    var t = ot(e, 134217728);
    if (t !== null) {
      var n = ye();
      He(t, e, 134217728, n);
    }
    ou(e, 134217728);
  }
};
Cs = function(e) {
  if (e.tag === 13) {
    var t = kt(e), n = ot(e, t);
    if (n !== null) {
      var r = ye();
      He(n, e, t, r);
    }
    ou(e, t);
  }
};
Ps = function() {
  return H;
};
zs = function(e, t) {
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
            if (!l) throw Error(k(90));
            ls(r), _i(r, l);
          }
        }
      }
      break;
    case "textarea":
      os(e, n);
      break;
    case "select":
      t = n.value, t != null && rn(e, !!n.multiple, t, !1);
  }
};
ps = tu;
hs = Bt;
var Up = { usingClientEntryPoint: !1, Events: [hr, Zt, Cl, fs, ds, tu] }, Dn = { findFiberByHostInstance: Lt, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Bp = { bundleType: Dn.bundleType, version: Dn.version, rendererPackageName: Dn.rendererPackageName, rendererConfig: Dn.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: at.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = ys(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: Dn.findFiberByHostInstance || Op, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Ir = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Ir.isDisabled && Ir.supportsFiber) try {
    xl = Ir.inject(Bp), Je = Ir;
  } catch {
  }
}
Re.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Up;
Re.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!au(t)) throw Error(k(200));
  return Fp(e, t, null, n);
};
Re.createRoot = function(e, t) {
  if (!au(e)) throw Error(k(299));
  var n = !1, r = "", l = Gc;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (l = t.onRecoverableError)), t = iu(e, 1, !1, null, null, n, !1, r, l), e[it] = t.current, nr(e.nodeType === 8 ? e.parentNode : e), new uu(t);
};
Re.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function" ? Error(k(188)) : (e = Object.keys(e).join(","), Error(k(268, e)));
  return e = ys(t), e = e === null ? null : e.stateNode, e;
};
Re.flushSync = function(e) {
  return Bt(e);
};
Re.hydrate = function(e, t, n) {
  if (!Ml(t)) throw Error(k(200));
  return Il(null, e, t, !0, n);
};
Re.hydrateRoot = function(e, t, n) {
  if (!au(e)) throw Error(k(405));
  var r = n != null && n.hydratedSources || null, l = !1, i = "", o = Gc;
  if (n != null && (n.unstable_strictMode === !0 && (l = !0), n.identifierPrefix !== void 0 && (i = n.identifierPrefix), n.onRecoverableError !== void 0 && (o = n.onRecoverableError)), t = Kc(t, null, e, 1, n ?? null, l, !1, i, o), e[it] = t.current, nr(e), r) for (e = 0; e < r.length; e++) n = r[e], l = n._getVersion, l = l(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, l] : t.mutableSourceEagerHydrationData.push(
    n,
    l
  );
  return new Dl(t);
};
Re.render = function(e, t, n) {
  if (!Ml(t)) throw Error(k(200));
  return Il(null, e, t, !1, n);
};
Re.unmountComponentAtNode = function(e) {
  if (!Ml(e)) throw Error(k(40));
  return e._reactRootContainer ? (Bt(function() {
    Il(null, null, e, !1, function() {
      e._reactRootContainer = null, e[it] = null;
    });
  }), !0) : !1;
};
Re.unstable_batchedUpdates = tu;
Re.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!Ml(n)) throw Error(k(200));
  if (e == null || e._reactInternals === void 0) throw Error(k(38));
  return Il(e, t, n, !1, r);
};
Re.version = "18.3.1-next-f1338f8080-20240426";
function Zc() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Zc);
    } catch (e) {
      console.error(e);
    }
}
Zc(), Ba.exports = Re;
var Jc = Ba.exports, qc, _a = Jc;
qc = _a.createRoot, _a.hydrateRoot;
function Vp(e) {
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
function Wp(e) {
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
const Hp = {}, Ca = (e) => {
  let t;
  const n = /* @__PURE__ */ new Set(), r = (c, f) => {
    const p = typeof c == "function" ? c(t) : c;
    if (!Object.is(p, t)) {
      const y = t;
      t = f ?? (typeof p != "object" || p === null) ? p : Object.assign({}, t, p), n.forEach((v) => v(t, y));
    }
  }, l = () => t, a = { setState: r, getState: l, getInitialState: () => s, subscribe: (c) => (n.add(c), () => n.delete(c)), destroy: () => {
    (Hp ? "production" : void 0) !== "production" && console.warn(
      "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
    ), n.clear();
  } }, s = t = e(r, l, a);
  return a;
}, Qp = (e) => e ? Ca(e) : Ca;
var bc = { exports: {} }, ef = {}, tf = { exports: {} }, nf = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var gn = M;
function Yp(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Xp = typeof Object.is == "function" ? Object.is : Yp, Kp = gn.useState, Gp = gn.useEffect, Zp = gn.useLayoutEffect, Jp = gn.useDebugValue;
function qp(e, t) {
  var n = t(), r = Kp({ inst: { value: n, getSnapshot: t } }), l = r[0].inst, i = r[1];
  return Zp(
    function() {
      l.value = n, l.getSnapshot = t, pi(l) && i({ inst: l });
    },
    [e, n, t]
  ), Gp(
    function() {
      return pi(l) && i({ inst: l }), e(function() {
        pi(l) && i({ inst: l });
      });
    },
    [e]
  ), Jp(n), n;
}
function pi(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Xp(e, n);
  } catch {
    return !0;
  }
}
function bp(e, t) {
  return t();
}
var eh = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? bp : qp;
nf.useSyncExternalStore = gn.useSyncExternalStore !== void 0 ? gn.useSyncExternalStore : eh;
tf.exports = nf;
var th = tf.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var $l = M, nh = th;
function rh(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var lh = typeof Object.is == "function" ? Object.is : rh, ih = nh.useSyncExternalStore, oh = $l.useRef, uh = $l.useEffect, ah = $l.useMemo, sh = $l.useDebugValue;
ef.useSyncExternalStoreWithSelector = function(e, t, n, r, l) {
  var i = oh(null);
  if (i.current === null) {
    var o = { hasValue: !1, value: null };
    i.current = o;
  } else o = i.current;
  i = ah(
    function() {
      function a(y) {
        if (!s) {
          if (s = !0, c = y, y = r(y), l !== void 0 && o.hasValue) {
            var v = o.value;
            if (l(v, y))
              return f = v;
          }
          return f = y;
        }
        if (v = f, lh(c, y)) return v;
        var S = r(y);
        return l !== void 0 && l(v, S) ? (c = y, v) : (c = y, f = S);
      }
      var s = !1, c, f, p = n === void 0 ? null : n;
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
  var u = ih(e, i[0], i[1]);
  return uh(
    function() {
      o.hasValue = !0, o.value = u;
    },
    [u]
  ), sh(u), u;
};
bc.exports = ef;
var ch = bc.exports;
const fh = /* @__PURE__ */ Ua(ch), rf = {}, { useDebugValue: dh } = Ff, { useSyncExternalStoreWithSelector: ph } = fh;
let Pa = !1;
const hh = (e) => e;
function mh(e, t = hh, n) {
  (rf ? "production" : void 0) !== "production" && n && !Pa && (console.warn(
    "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
  ), Pa = !0);
  const r = ph(
    e.subscribe,
    e.getState,
    e.getServerState || e.getInitialState,
    t,
    n
  );
  return dh(r), r;
}
const za = (e) => {
  (rf ? "production" : void 0) !== "production" && typeof e != "function" && console.warn(
    "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
  );
  const t = typeof e == "function" ? Qp(e) : e, n = (r, l) => mh(t, r, l);
  return Object.assign(n, t), n;
}, vh = (e) => e ? za(e) : za;
function yh() {
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
function gh() {
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
function wh() {
  return typeof window < "u" && window.__TAURI_INTERNALS__ ? gh() : yh();
}
const Ta = "text/x-vnd.veusz-widget-3", Sh = "text/x-vnd.veusz-data-1";
function co(e, t) {
  const n = [];
  for (const r of e.settings) n.push(Na(t, r.name));
  for (const r of e.subgroups) n.push(...co(r, Na(t, r.name)));
  return n;
}
function Na(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
const xh = 33;
function kh(e, t = wh()) {
  let n = null, r = null;
  return vh((l, i) => {
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
          const f = u[0], p = lf(i().tree, f);
          if (!p) {
            l({ schema: null, values: {} });
            return;
          }
          const y = await o(() => e.doc.schema(p));
          if (!y) {
            l({ schema: null, values: {} });
            return;
          }
          const v = co(y, f), S = await o(() => e.doc.get(v)) ?? {};
          l({ schema: y, values: S });
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
        for (const f of s.diffs) c[f.path] = f.new;
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
          c.includes(u) && await i().select(c.map((f) => f === u ? s.path : f));
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
        const s = [...u].sort((f, p) => p.length - f.length);
        for (const f of s)
          await o(() => e.doc.remove(f));
        const c = i().selected.filter((f) => !u.includes(f));
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
        const f = await o(() => e.render.copyImage(u, a, s, c, "png"));
        f && await t.write({
          mime_type: f.mime_type,
          payload_b64: f.payload_b64
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
        const u = await t.read([Sh]);
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
          const { webgpuAvailable: a } = await Promise.resolve().then(() => sf);
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
        const f = i().backend;
        if (f === "vello-gpu" && i().gpuNativeAvailable === !0) {
          const v = await o(() => e.render.scene(u, a, s, c));
          if (v) {
            const { gpuRenderScene: S } = await import("./velloNative-Cn1MRGX6.js"), N = await o(() => S(v.scene_b64, v.width, v.height));
            N && l({ render: {
              png: N,
              width: v.width,
              height: v.height,
              bounds: v.bounds
            } });
          }
          return;
        }
        if (f === "vello-wasm" && i().webgpuAvailable === !0) {
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
        const p = f === "vello-wasm" || f === "vello-gpu" ? "vello" : f, y = await o(() => e.render.png(u, a, s, c, i().antialias, p));
        y && l({ render: y });
      },
      requestRender: (u, a, s, c = 96) => {
        r = { page: u, w: a, h: s, dpi: c }, n && clearTimeout(n), n = setTimeout(() => {
          n = null;
          const f = r;
          r = null, f && i().renderAt(f.page, f.w, f.h, f.dpi);
        }, xh);
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
function lf(e, t) {
  if (!e) return null;
  if (e.path === t) return e.type;
  for (const n of e.children) {
    const r = lf(n, t);
    if (r) return r;
  }
  return null;
}
function Eh() {
  return (globalThis.__VEUSZ_WASM_BASE__ ?? "/wasm").replace(/\/+$/, "");
}
let $r = null;
function su() {
  return $r || ($r = (async () => {
    const e = Eh(), t = await import(
      /* @vite-ignore */
      `${e}/veusz_paint_wasm.js`
    );
    return await t.default({ module_or_path: `${e}/veusz_paint_wasm_bg.wasm` }), t;
  })().catch((e) => {
    throw $r = null, e;
  })), $r;
}
async function of() {
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
async function _h(e, t, n = [0, 0, 0, 0]) {
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
async function uf() {
  try {
    return typeof (await su()).scene_to_svg == "function";
  } catch {
    return !1;
  }
}
async function af(e, t, n) {
  const r = await su();
  if (typeof r.scene_to_svg != "function")
    throw new Error("this runtime does not include the SVG exporter");
  return r.scene_to_svg(Fl(e), t, n);
}
const sf = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base64ToBytes: Fl,
  renderSceneBytesToCanvas: cu,
  renderSceneToCanvas: _h,
  renderSceneToImageBlob: Ol,
  sceneToSvg: af,
  svgExportAvailable: uf,
  webgpuAvailable: of
}, Symbol.toStringTag, { value: "Module" })), Ch = "0.26.4", Ph = `https://cdn.jsdelivr.net/pyodide/v${Ch}/full/`;
let Mn = null;
async function zh(e) {
  if (Mn) return Mn;
  const t = e.pyodideIndexUrl ?? Ph, n = e.onProgress ?? (() => {
  });
  return Mn = (async () => {
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
    throw Mn = null, r;
  }), Mn;
}
let Th = 0;
async function Nh(e = {}) {
  const t = e.onProgress ?? (() => {
  });
  e.wasmBase && (globalThis.__VEUSZ_WASM_BASE__ = e.wasmBase);
  const n = await zh(e);
  t("Starting renderer…");
  const l = n.pyimport("veusz.daemon.pyodide_bridge").Bridge(), i = Vp(l), o = `/veusz/fig_${Th++}`, u = `${o}/figure.vsz`, a = async (s, c = []) => {
    await n.runPythonAsync(`import os; os.makedirs(${JSON.stringify(o)}, exist_ok=True)`);
    for (const f of c) {
      const p = `${o}/${f.name}`, y = p.slice(0, p.lastIndexOf("/"));
      y && y !== o && await n.runPythonAsync(`import os; os.makedirs(${JSON.stringify(y)}, exist_ok=True)`), n.FS.writeFile(p, f.bytes);
    }
    return n.FS.writeFile(u, s), i.call("file.open", { path: u });
  };
  return t("Ready"), { transport: i, bridge: l, loadVsz: a, pyodide: n };
}
async function jh(e, t = {}) {
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
    const c = o(s.url), f = i.get(s.url), p = {};
    f.etag && (p["If-None-Match"] = f.etag), f.lastModified && (p["If-Modified-Since"] = f.lastModified), l({ url: s.url, phase: "fetching" });
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
      const v = new Uint8Array(await y.arrayBuffer()), S = cf(v), N = y.headers.get("etag"), h = y.headers.get("last-modified"), d = y.headers.get("content-type");
      await e.call("data.url_refresh", {
        url: s.url,
        bytes_b64: S,
        etag: N,
        last_modified: h,
        content_type: d
      }), f.etag = N, f.lastModified = h, l({ url: s.url, phase: "ok" });
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
async function Rh(e, t, n = {}) {
  const r = Lh(e), l = n.onError ?? ((i, o) => console.warn(`[veusz-figure] pre-fetch ${i}: ${o.message}`));
  return await Promise.allSettled(r.map(async (i) => {
    const o = n.urlMap && Object.prototype.hasOwnProperty.call(n.urlMap, i) ? n.urlMap[i] : n.urlBase ? new URL(i, n.urlBase).toString() : i;
    try {
      const u = await fetch(o, { cache: "no-store" });
      if (!u.ok) throw new Error(`HTTP ${u.status}`);
      const a = new Uint8Array(await u.arrayBuffer());
      await t.call("data.url_ingest", {
        url: i,
        // Python's cache key = original URL
        bytes_b64: cf(a),
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
function Lh(e) {
  const t = [], n = /ImportFileURL\s*\(\s*(['"])([^'"\n]+)\1/g;
  let r;
  for (; (r = n.exec(e)) !== null; ) t.push(r[2]);
  return t;
}
function cf(e) {
  let t = "";
  for (let r = 0; r < e.length; r += 32768)
    t += String.fromCharCode.apply(
      null,
      Array.from(e.subarray(r, r + 32768))
    );
  return btoa(t);
}
const Dh = /\bImport[A-Za-z0-9]*\s*\(\s*[uUrRbB]?(['"])([^'"\n]+)\1/g;
function Mh(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e.matchAll(Dh)) {
    const r = n[2];
    /^[a-z][a-z0-9+.-]*:\/\//i.test(r) || /\.[A-Za-z0-9]+$/.test(r) && t.add(r);
  }
  return [...t];
}
async function Ih(e, t, n = {}, r = fetch) {
  const l = Mh(e);
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
var ff = { exports: {} }, Al = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var $h = M, Fh = Symbol.for("react.element"), Oh = Symbol.for("react.fragment"), Ah = Object.prototype.hasOwnProperty, Uh = $h.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, Bh = { key: !0, ref: !0, __self: !0, __source: !0 };
function df(e, t, n) {
  var r, l = {}, i = null, o = null;
  n !== void 0 && (i = "" + n), t.key !== void 0 && (i = "" + t.key), t.ref !== void 0 && (o = t.ref);
  for (r in t) Ah.call(t, r) && !Bh.hasOwnProperty(r) && (l[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) l[r] === void 0 && (l[r] = t[r]);
  return { $$typeof: Fh, type: e, key: i, ref: o, props: l, _owner: Uh.current };
}
Al.Fragment = Oh;
Al.jsx = df;
Al.jsxs = df;
ff.exports = Al;
var g = ff.exports;
function Vh(e, t) {
  const n = new Map(t.map((l) => [l.path, l])), r = [];
  for (const l of e) {
    const i = n.get(l.path);
    if (!i) continue;
    const o = Math.min(l.value, i.value), u = Math.max(l.value, i.value);
    !(u > o) || !Number.isFinite(o) || !Number.isFinite(u) || (r.push({ path: `${l.path}/min`, value: o }), r.push({ path: `${l.path}/max`, value: u }));
  }
  return r;
}
function Wh(e) {
  const t = [];
  for (const n of new Set(e))
    t.push({ path: `${n}/min`, value: "Auto" }), t.push({ path: `${n}/max`, value: "Auto" });
  return t;
}
function Hh(e, t, n) {
  const r = new Map(t.map((i) => [i.path, i])), l = [];
  for (const i of e) {
    const o = r.get(i.path), u = n.get(i.path);
    if (!o || !u) continue;
    const a = i.value - o.value;
    Number.isFinite(a) && (l.push({ path: `${i.path}/min`, value: u.min + a }), l.push({ path: `${i.path}/max`, value: u.max + a }));
  }
  return l;
}
function Qh(e, t, n, r, l) {
  const i = new Map(t.map((s) => [s.path, s])), o = new Map(n.map((s) => [s.path, s])), u = new Map(r.map((s) => [s.path, s])), a = [];
  for (const s of e) {
    const c = i.get(s.path), f = o.get(s.path), p = u.get(s.path), y = l.get(s.path);
    if (!c || !f || !p || !y) continue;
    const v = s.value, S = c.value, N = f.value, d = p.value - N;
    if (!Number.isFinite(d) || d === 0) continue;
    const m = (S - v) / d;
    if (!Number.isFinite(m) || m <= 0) continue;
    const w = v + m * (y.min - N), E = v + m * (y.max - N);
    if (!Number.isFinite(w) || !Number.isFinite(E)) continue;
    const C = Math.min(w, E), _ = Math.max(w, E);
    _ > C && (a.push({ path: `${s.path}/min`, value: C }), a.push({ path: `${s.path}/max`, value: _ }));
  }
  return a;
}
function Yh(e) {
  const t = (i) => {
    const o = Math.abs(i);
    return o !== 0 && (o < 1e-3 || o >= 1e5) ? i.toExponential(3) : Number(i.toPrecision(5)).toString();
  }, n = e.find((i) => i.direction === "horizontal"), r = e.find((i) => i.direction === "vertical"), l = [];
  return n && l.push(`x: ${t(n.value)}`), r && l.push(`y: ${t(r.value)}`), l.join("   ");
}
const ja = 4, Ra = 2400;
function pf({
  store: e,
  width: t,
  height: n
}) {
  const r = e((x) => x.render), l = e((x) => x.tree), i = e((x) => x.currentPage), o = e((x) => x.values), u = e((x) => x.requestRender), a = M.useRef(null), s = M.useRef(null), c = M.useRef(null), [f, p] = M.useState({ w: t, h: n }), [y, v] = M.useState({ w: t, h: n }), [S, N] = M.useState(null), [h, d] = M.useState(null), [m, w] = M.useState(null), E = M.useRef(/* @__PURE__ */ new Set()), C = M.useRef(null), _ = M.useRef(null), P = M.useRef(/* @__PURE__ */ new Map()), j = M.useRef(0);
  M.useEffect(() => {
    const x = s.current;
    if (!x) return;
    const L = typeof window < "u" && window.devicePixelRatio || 1, D = t > 0 ? n / t : 0.7143, F = () => {
      const A = x.clientWidth, B = x.clientHeight;
      let V, W;
      if (A > 0 && B > 0) {
        const le = Math.min(A / t, B / n);
        V = t * le, W = n * le;
      } else A > 0 ? (V = A, W = A * D) : (V = t, W = n);
      let J = Math.max(1, Math.round(V * L)), Ce = Math.max(1, Math.round(W * L));
      const Xe = Math.max(J, Ce);
      if (Xe > Ra) {
        const le = Ra / Xe;
        J = Math.round(J * le), Ce = Math.round(Ce * le);
      }
      v((le) => Math.abs(le.w - V) < 0.5 && Math.abs(le.h - W) < 0.5 ? le : { w: V, h: W }), p((le) => le.w === J && le.h === Ce ? le : { w: J, h: Ce });
    };
    if (F(), typeof ResizeObserver > "u") return;
    const Q = new ResizeObserver(F);
    return Q.observe(x), () => Q.disconnect();
  }, [t, n]), M.useEffect(() => {
    l && l.children.length > 0 && u(i, f.w, f.h);
  }, [l, o, i, f.w, f.h, u]), M.useEffect(() => {
    const x = r == null ? void 0 : r.sceneB64, L = a.current;
    if (!x || !L) return;
    let D = !1;
    return (async () => {
      try {
        const { renderSceneToCanvas: F } = await Promise.resolve().then(() => sf);
        D || await F(L, x, [1, 1, 1, 1]);
      } catch (F) {
        D || console.error("embed scene render failed", F);
      }
    })(), () => {
      D = !0;
    };
  }, [r == null ? void 0 : r.sceneB64, f.w, f.h]);
  const R = () => e.getState().rpc, X = (x, L) => {
    const F = a.current.getBoundingClientRect();
    return [
      (x - F.left) * (f.w / (F.width || 1)),
      (L - F.top) * (f.h / (F.height || 1))
    ];
  }, Ye = async (x) => {
    await e.getState().setValues(x), u(i, f.w, f.h);
  }, Nt = () => {
    const x = a.current;
    if (!x) return;
    const L = [...P.current.keys()];
    if (L.length < 2) return;
    const [D, F] = L, Q = P.current.get(D), A = P.current.get(F), B = x.getBoundingClientRect(), V = Q.clientX - B.left, W = Q.clientY - B.top, J = A.clientX - B.left, Ce = A.clientY - B.top;
    _.current = {
      id1: D,
      id2: F,
      startDist: Math.hypot(J - V, Ce - W) || 1,
      startCx: (V + J) / 2,
      startCy: (W + Ce) / 2
    }, C.current = null, N(null), (async () => {
      const [Xe, le] = [X(Q.clientX, Q.clientY), X(A.clientX, A.clientY)], [yr, du] = await Promise.all([
        R().render.pixelToData(Xe[0], Xe[1]),
        R().render.pixelToData(le[0], le[1])
      ]);
      if (!_.current) return;
      _.current.data1 = yr.axes, _.current.data2 = du.axes;
      const pu = /* @__PURE__ */ new Map();
      for (const _n of new Set([...yr.axes, ...du.axes].map((gr) => gr.path))) {
        const gr = await R().doc.get([`${_n}/min`, `${_n}/max`]), hu = Number(gr[`${_n}/min`]), mu = Number(gr[`${_n}/max`]);
        Number.isFinite(hu) && Number.isFinite(mu) && pu.set(_n, { min: hu, max: mu });
      }
      _.current && (_.current.ranges = pu);
    })();
  }, vr = () => {
    const x = _.current, L = a.current;
    if (!x || !L) return;
    const D = P.current.get(x.id1), F = P.current.get(x.id2);
    if (!D || !F) return;
    const Q = L.getBoundingClientRect(), A = D.clientX - Q.left, B = D.clientY - Q.top, V = F.clientX - Q.left, W = F.clientY - Q.top, J = Math.hypot(V - A, W - B) || 1;
    w({
      scale: J / x.startDist,
      ox: x.startCx,
      oy: x.startCy,
      tx: (A + V) / 2 - x.startCx,
      ty: (B + W) / 2 - x.startCy
    });
  }, Ul = (x, L) => {
    const D = _.current;
    if (_.current = null, w(null), !D || !D.data1 || !D.data2 || !D.ranges) return;
    const F = D.id1 === L ? x : P.current.get(D.id1), Q = D.id2 === L ? x : P.current.get(D.id2);
    if (!F || !Q) return;
    const A = X(F.clientX, F.clientY), B = X(Q.clientX, Q.clientY);
    (async () => {
      const [V, W] = await Promise.all([
        R().render.pixelToData(A[0], A[1]),
        R().render.pixelToData(B[0], B[1])
      ]), J = Qh(D.data1, D.data2, V.axes, W.axes, D.ranges);
      J.length && await Ye(J);
    })();
  }, kn = (x) => {
    var Q, A;
    if ((A = (Q = x.currentTarget).setPointerCapture) == null || A.call(Q, x.pointerId), P.current.set(x.pointerId, { clientX: x.clientX, clientY: x.clientY }), P.current.size >= 2) {
      Nt();
      return;
    }
    const [L, D] = X(x.clientX, x.clientY), F = x.pointerType === "mouse" ? x.shiftKey || x.button === 1 : !0;
    C.current = { pointerId: x.pointerId, mode: F ? "pan" : "zoom", sx: L, sy: D, moved: !1 }, F && R().render.pixelToData(L, D).then(async (B) => {
      if (!C.current) return;
      C.current.from = B.axes;
      const V = /* @__PURE__ */ new Map();
      for (const W of B.axes) {
        const J = await R().doc.get([`${W.path}/min`, `${W.path}/max`]), Ce = Number(J[`${W.path}/min`]), Xe = Number(J[`${W.path}/max`]);
        Number.isFinite(Ce) && Number.isFinite(Xe) && V.set(W.path, { min: Ce, max: Xe });
      }
      C.current && (C.current.ranges = V);
    });
  }, En = (x) => {
    if (P.current.has(x.pointerId) && P.current.set(x.pointerId, { clientX: x.clientX, clientY: x.clientY }), _.current) {
      vr();
      return;
    }
    const L = C.current;
    if (L && L.pointerId === x.pointerId) {
      const [A, B] = X(x.clientX, x.clientY);
      (Math.abs(A - L.sx) > ja || Math.abs(B - L.sy) > ja) && (L.moved = !0), L.mode === "zoom" && L.moved && N({ x0: L.sx, y0: L.sy, x1: A, y1: B });
      return;
    }
    if (x.pointerType !== "mouse" || x.buttons !== 0) return;
    const D = performance.now();
    if (D - j.current < 40) return;
    j.current = D;
    const [F, Q] = X(x.clientX, x.clientY);
    R().render.pixelToData(F, Q).then((A) => {
      var le;
      A.axes.forEach((yr) => E.current.add(yr.path));
      const B = Yh(A.axes);
      if (!B) {
        d(null);
        return;
      }
      const V = ((le = c.current) == null ? void 0 : le.getBoundingClientRect()) ?? { left: 0, top: 0, width: 0, height: 0 }, W = x.clientX - V.left, J = x.clientY - V.top, Ce = V.width > 0 && W > V.width * 0.6, Xe = V.height > 0 && J > V.height * 0.85;
      d({
        ...Ce ? { right: Math.max(4, V.width - W + 12) } : { left: W + 12 },
        top: Xe ? Math.max(4, J - 22) : J + 12,
        text: B
      });
    });
  }, z = (x) => {
    var A, B;
    (B = (A = x.currentTarget).releasePointerCapture) == null || B.call(A, x.pointerId);
    const L = P.current.get(x.pointerId) ?? { clientX: x.clientX, clientY: x.clientY };
    if (_.current) {
      Ul(L, x.pointerId), P.current.delete(x.pointerId);
      return;
    }
    P.current.delete(x.pointerId);
    const D = C.current;
    if (!D || D.pointerId !== x.pointerId || (C.current = null, N(null), !D.moved)) return;
    const [F, Q] = X(x.clientX, x.clientY);
    D.mode === "zoom" ? (async () => {
      const [V, W] = await Promise.all([
        R().render.pixelToData(D.sx, D.sy),
        R().render.pixelToData(F, Q)
      ]), J = Vh(V.axes, W.axes);
      J.length && await Ye(J);
    })() : D.mode === "pan" && D.from && D.ranges && (async () => {
      const V = await R().render.pixelToData(F, Q), W = Hh(D.from, V.axes, D.ranges);
      W.length && await Ye(W);
    })();
  }, I = (x) => {
    P.current.delete(x.pointerId), _.current = null, C.current = null, N(null), w(null);
  }, $ = () => {
    E.current.size && Ye(Wh(E.current));
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
        d(null);
      },
      children: /* @__PURE__ */ g.jsxs("div", { ref: c, style: { position: "relative", width: y.w, height: y.h }, children: [
        /* @__PURE__ */ g.jsx(
          "canvas",
          {
            ref: a,
            width: f.w,
            height: f.h,
            "data-testid": "embed-canvas",
            onPointerDown: kn,
            onPointerMove: En,
            onPointerUp: z,
            onPointerCancel: I,
            onDoubleClick: $,
            style: {
              width: "100%",
              height: "100%",
              display: "block",
              cursor: "crosshair",
              touchAction: "none",
              transform: m ? `translate(${m.tx}px, ${m.ty}px) scale(${m.scale})` : void 0,
              transformOrigin: m ? `${m.ox}px ${m.oy}px` : void 0
            }
          }
        ),
        S && /* @__PURE__ */ g.jsx("div", { "data-testid": "embed-zoomband", style: {
          position: "absolute",
          pointerEvents: "none",
          border: "1px solid #1f6feb",
          background: "rgba(31,111,235,0.12)",
          left: `${Math.min(S.x0, S.x1) / f.w * 100}%`,
          top: `${Math.min(S.y0, S.y1) / f.h * 100}%`,
          width: `${Math.abs(S.x1 - S.x0) / f.w * 100}%`,
          height: `${Math.abs(S.y1 - S.y0) / f.h * 100}%`
        } }),
        h && /* @__PURE__ */ g.jsx("div", { "data-testid": "embed-tooltip", style: {
          position: "absolute",
          left: h.left,
          right: h.right,
          top: h.top,
          pointerEvents: "none",
          background: "rgba(20,22,26,0.9)",
          color: "#fff",
          font: "12px system-ui",
          padding: "2px 6px",
          borderRadius: 4,
          whiteSpace: "nowrap",
          zIndex: 5
        }, children: h.text })
      ] })
    }
  );
}
function Xh({
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
    hf,
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
function Kh(e) {
  return e.shiftKey ? "range" : e.ctrlKey || e.metaKey ? "toggle" : "replace";
}
function hf({
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
      Gh,
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
        onClick: (c) => r(e.path, Kh(c)),
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
      hf,
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
function Gh({
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
function Zh({ schema: e, value: t, onChange: n, siblings: r }) {
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
function Jh({ schema: e, value: t, onChange: n }) {
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
function Pe({ schema: e, value: t, onChange: n, editable: r = !1 }) {
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
function qh({ schema: e, value: t, onChange: n }) {
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
        value: em(r),
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
const La = /* @__PURE__ */ new Map(), bh = {
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
function em(e) {
  if (/^#[0-9a-fA-F]{6}$/.test(e)) return e;
  const t = bh[e.toLowerCase()];
  if (t) return t;
  if (typeof document > "u") return "#000000";
  const n = La.get(e);
  if (n) return n;
  const r = document.createElement("div");
  r.style.color = e, r.style.display = "none", document.body.appendChild(r);
  const l = getComputedStyle(r).color;
  document.body.removeChild(r);
  const i = l.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!i) return "#000000";
  const o = "#" + [i[1], i[2], i[3]].map((u) => parseInt(u, 10).toString(16).padStart(2, "0")).join("");
  return La.set(e, o), o;
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
const Da = /^(-?\d+(?:\.\d+)?)\s*(pt|cm|mm|in|%|\/)?$/;
function hi({ schema: e, value: t, onChange: n, allowAuto: r = !1 }) {
  const l = typeof t == "string" ? t : "", i = l.toLowerCase() === "auto", o = (() => {
    if (i) return { num: "", unit: "pt" };
    const p = l.match(Da);
    return { num: (p == null ? void 0 : p[1]) ?? "", unit: (p == null ? void 0 : p[2]) ?? "pt" };
  })(), [u, a] = M.useState(o.num), [s, c] = M.useState(o.unit);
  M.useEffect(() => {
    if (i) return;
    const p = l.match(Da);
    p && (a(p[1] ?? ""), c(p[2] ?? "pt"));
  }, [l, i]);
  const f = (p, y) => {
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
          onBlur: (p) => f(p.target.value, s),
          onKeyDown: (p) => {
            p.key === "Enter" && f(p.target.value, s);
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
            c(p.target.value), f(u, p.target.value);
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
function tm({ schema: e, value: t, onChange: n }) {
  const r = nm(t), [l, i] = M.useState(r);
  M.useEffect(() => i(r), [r]);
  const o = (u) => {
    if (u.startsWith("=")) {
      n(u);
      return;
    }
    const a = u.split(`
`).map((c) => c.trim()).filter(Boolean), s = {};
    for (const c of a) {
      const [f, p] = c.split("=", 2).map((v) => v == null ? void 0 : v.trim());
      if (!f) continue;
      const y = Number(p);
      if (!Number.isFinite(y)) {
        n(u);
        return;
      }
      s[f] = y;
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
function nm(e) {
  return typeof e == "string" ? e : e && typeof e == "object" && !Array.isArray(e) ? Object.entries(e).map(([t, n]) => `${t}=${n}`).join(`
`) : "";
}
function rm({ schema: e, value: t, onChange: n }) {
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
function lm({ schema: e, value: t, onChange: n }) {
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
function im({ schema: e, value: t, onChange: n }) {
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
function om({ schema: e, value: t, onChange: n }) {
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
const mf = {
  // Atomic
  str: Or,
  "str-notes": Or,
  bool: Jh,
  int: fo,
  float: fo,
  "float-or-auto": po,
  "int-or-auto": po,
  "float-slider": lm,
  distance: hi,
  "distance-or-auto": (e) => /* @__PURE__ */ g.jsx(hi, { ...e, allowAuto: !0 }),
  displacement: hi,
  choice: Pe,
  "choice-or-more": (e) => /* @__PURE__ */ g.jsx(Pe, { ...e, editable: !0 }),
  "float-choice": (e) => /* @__PURE__ */ g.jsx(Pe, { ...e, editable: !0 }),
  color: qh,
  colormap: Pe,
  marker: om,
  arrow: Pe,
  "line-style": im,
  "fill-style": Pe,
  "fill-style-ext": Pe,
  "errorbar-style": Pe,
  "align-horz": Pe,
  "align-vert": Pe,
  "align-horz-+manual": Pe,
  "align-vert-+manual": Pe,
  "font-family": Or,
  "font-style": Or,
  "rotate-interval": Pe,
  "axis-bound": Zh,
  // List / composite
  "float-list": rm,
  "float-dict": tm,
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
  Object.keys(mf)
);
function um(e) {
  return mf[e] ?? null;
}
function am(e) {
  var s;
  const t = e.widgetPaths[0], n = e.widgetPaths.length > 1, [r, l] = M.useState({}), i = (c, f) => r[c] ?? !vf(f), o = (c, f) => l((p) => ({ ...p, [c]: f })), u = (c, f) => {
    var v;
    if (!n) {
      e.onChange(c, f);
      return;
    }
    const p = c.slice(t.length), y = e.widgetPaths.map((S) => ({ path: S + p, value: f }));
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
          yf,
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
function vf(e) {
  if (e.setnsmode) return e.setnsmode === "formatting";
  const t = e.settings.filter((n) => !n.hidden);
  return t.length > 0 ? t.every((n) => n.formatting) : e.subgroups.length > 0 ? e.subgroups.every(vf) : !1;
}
function yf({ group: e, basePath: t, widgetPath: n, values: r, datasets: l, onChange: i, settingMenu: o, groupLabel: u, groupOpen: a, setGroupOpen: s }) {
  return /* @__PURE__ */ g.jsxs(M.Fragment, { children: [
    e.settings.map(
      (c) => c.hidden ? null : /* @__PURE__ */ g.jsx(
        sm,
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
      const f = c.usertext || cm(c.name), p = ho(t, c.name), y = a(p, c);
      return /* @__PURE__ */ g.jsxs(
        "details",
        {
          "data-testid": `subgroup-${c.name}`,
          open: y,
          onToggle: (v) => {
            const S = v.currentTarget, N = typeof S.open == "boolean" ? S.open : S.hasAttribute("open");
            N !== y && s(p, N);
          },
          children: [
            /* @__PURE__ */ g.jsx("summary", { children: f }),
            /* @__PURE__ */ g.jsx(
              yf,
              {
                group: c,
                basePath: p,
                widgetPath: n,
                values: r,
                datasets: l,
                onChange: i,
                settingMenu: o,
                groupLabel: f,
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
function sm({
  schema: e,
  basePath: t,
  widgetPath: n,
  value: r,
  datasets: l,
  onChange: i,
  settingMenu: o,
  groupLabel: u
}) {
  const a = um(e.typename), s = ho(t, e.name), c = dm(e, u), f = e.mixed_value === !0, p = (y) => o ? o(
    {
      path: s,
      name: e.name,
      widgetPath: n,
      isReference: e.is_reference === !0,
      isStylesheet: s.startsWith("/StyleSheet/")
    },
    y
  ) : y;
  return a ? /* @__PURE__ */ g.jsxs(
    "div",
    {
      "data-testid": `row-${e.name}`,
      "data-mixed": f || void 0,
      children: [
        p(
          /* @__PURE__ */ g.jsxs("label", { style: f ? { fontStyle: "italic", color: "#888" } : void 0, children: [
            c,
            f ? " (mixed)" : ""
          ] })
        ),
        /* @__PURE__ */ g.jsx(
          a,
          {
            schema: e,
            value: f ? void 0 : r,
            datasets: l,
            onChange: (y) => i(s, y)
          }
        )
      ]
    }
  ) : /* @__PURE__ */ g.jsxs("div", { "data-testid": `row-${e.name}`, "data-mixed": f || void 0, children: [
    p(/* @__PURE__ */ g.jsx("label", { children: c })),
    /* @__PURE__ */ g.jsx("code", { "data-testid": `fallback-${e.name}`, children: r === void 0 ? "(unset)" : JSON.stringify(r) }),
    /* @__PURE__ */ g.jsxs("small", { children: [
      " [typename=",
      e.typename,
      "]"
    ] })
  ] });
}
function ho(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
function cm(e) {
  if (!e) return e;
  const t = e.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
const fm = /* @__PURE__ */ new Set(["color", "hide", "width", "style"]);
function dm(e, t) {
  const n = e.usertext || e.name;
  return t ? fm.has(e.name) ? `${t} ${n.toLowerCase()}` : n : e.name === "color" && e.descr ? e.descr : n;
}
function pm({
  store: e,
  title: t,
  width: n,
  height: r,
  toolbar: l,
  onClose: i
}) {
  const o = e((v) => v.tree), u = e((v) => v.selected), a = e((v) => v.schema), s = e((v) => v.values), c = e((v) => v.datasets), f = e((v) => v.error), [p, y] = M.useState(!1);
  return Jc.createPortal(
    /* @__PURE__ */ g.jsx(
      "div",
      {
        "data-testid": "veusz-modal",
        style: hm,
        onMouseDown: (v) => {
          v.target === v.currentTarget && i();
        },
        children: /* @__PURE__ */ g.jsxs("div", { style: p ? mm : gf, "data-testid": "veusz-modal-window", children: [
          /* @__PURE__ */ g.jsxs("header", { style: vm, children: [
            /* @__PURE__ */ g.jsx("strong", { style: { fontSize: 14 }, children: t ?? "Edit figure" }),
            f && /* @__PURE__ */ g.jsx("span", { "data-testid": "veusz-error", style: { color: "crimson", fontSize: 12 }, children: f }),
            /* @__PURE__ */ g.jsx("span", { style: { flex: 1 } }),
            l,
            /* @__PURE__ */ g.jsx(
              "button",
              {
                type: "button",
                "data-testid": "veusz-modal-fullscreen",
                onClick: () => y((v) => !v),
                style: Ma,
                title: p ? "Exit full screen" : "Full screen",
                children: p ? "🗗" : "⛶"
              }
            ),
            /* @__PURE__ */ g.jsx(
              "button",
              {
                type: "button",
                "data-testid": "veusz-modal-close",
                onClick: i,
                style: Ma,
                title: "Close (Esc)",
                children: "✕"
              }
            )
          ] }),
          /* @__PURE__ */ g.jsxs("div", { style: ym, children: [
            /* @__PURE__ */ g.jsx("div", { style: gm, children: /* @__PURE__ */ g.jsx(pf, { store: e, width: n, height: r }) }),
            /* @__PURE__ */ g.jsxs("aside", { style: wm, "data-testid": "veusz-edit-panel", children: [
              o ? /* @__PURE__ */ g.jsx(
                Xh,
                {
                  root: o,
                  selected: u,
                  onSelect: (v) => {
                    e.getState().select([v]);
                  }
                }
              ) : /* @__PURE__ */ g.jsx("p", { style: { color: "#888" }, children: "Loading…" }),
              /* @__PURE__ */ g.jsx("hr", { style: { border: 0, borderTop: "1px solid #eee", margin: "8px 0" } }),
              a && u.length > 0 ? /* @__PURE__ */ g.jsx(
                am,
                {
                  schema: a,
                  widgetPaths: u,
                  values: s,
                  datasets: c.map((v) => v.name),
                  onChange: (v, S) => {
                    e.getState().setValue(v, S);
                  },
                  onChangeMany: (v) => {
                    e.getState().setValues(v);
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
const hm = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,17,21,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1e3,
  font: "14px system-ui, sans-serif"
}, gf = {
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
}, mm = {
  ...gf,
  width: "100vw",
  height: "100vh",
  borderRadius: 0,
  resize: "none"
}, vm = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
  background: "#fafbfc",
  flex: "0 0 auto"
}, Ma = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
  padding: "3px 9px",
  lineHeight: 1
}, ym = {
  flex: "1 1 auto",
  display: "flex",
  minHeight: 0,
  alignItems: "stretch"
}, gm = {
  flex: "1 1 auto",
  minWidth: 0,
  minHeight: 0,
  padding: 10,
  background: "#fff"
}, wm = {
  flex: "0 0 320px",
  width: 320,
  borderLeft: "1px solid #eee",
  padding: 10,
  overflow: "auto",
  background: "#fff"
};
function Ia({ items: e, disabled: t, busy: n }) {
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
        style: Sm,
        title: "Download this figure",
        children: n ? "…" : "⤓ Download ▾"
      }
    ),
    r && /* @__PURE__ */ g.jsx("div", { role: "menu", "data-testid": "veusz-download-menu", style: xm, children: e.map((o) => {
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
          style: $a,
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
          style: $a,
          children: u
        },
        a
      );
    }) })
  ] });
}
const Sm = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 10px",
  cursor: "pointer",
  fontSize: 12,
  background: "#fff",
  color: "#222"
}, xm = {
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
}, $a = {
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
}, Fa = "veusz-embed-styles", km = `
.vz-fig { position: relative; }
.vz-fig .vz-inline { display: block; }
.vz-fig .vz-preview { display: block; width: 100%; height: auto; background: #fff; }
`;
function wf() {
  if (typeof document > "u" || document.getElementById(Fa)) return;
  const e = document.createElement("style");
  e.id = Fa, e.textContent = km, document.head.appendChild(e);
}
const cn = 2;
async function Em(e, t) {
  const { rpc: n } = e.getState(), r = await n.render.scene(t.page, t.width, t.height, t.dpi ?? 96), l = await af(r.scene_b64, r.width, r.height);
  Pm(l, t.filename ?? "figure.svg", "image/svg+xml");
}
async function _m(e, t) {
  const { rpc: n } = e.getState(), r = t.width * cn, l = t.height * cn, i = await n.render.scene(t.page, r, l, (t.dpi ?? 96) * cn), o = await Ol(i.scene_b64, i.width, i.height, "image/png");
  fu(o, t.filename ?? "figure.png");
}
async function Cm(e, t) {
  const { rpc: n } = e.getState(), r = t.width * cn, l = t.height * cn, i = await n.render.scene(t.page, r, l, (t.dpi ?? 96) * cn), o = await Ol(i.scene_b64, i.width, i.height, "image/jpeg"), u = new Uint8Array(await o.arrayBuffer()), a = zm(u, i.width, i.height, t.width, t.height);
  fu(new Blob([a], { type: "application/pdf" }), t.filename ?? "figure.pdf");
}
function Pm(e, t, n) {
  fu(new Blob([e], { type: n }), t);
}
function fu(e, t) {
  const n = URL.createObjectURL(e), r = document.createElement("a");
  r.href = n, r.download = t, document.body.appendChild(r), r.click(), r.remove(), setTimeout(() => URL.revokeObjectURL(n), 1e3);
}
function zm(e, t, n, r, l) {
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
  const f = `q
${r} 0 0 ${l} 0 0 cm
/Im0 Do
Q
`;
  c(5, `<< /Length ${f.length} >>
stream
${f}endstream`);
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
  let S = 0;
  for (const N of o)
    v.set(N, S), S += N.length;
  return v;
}
wf();
function Tm({
  store: e,
  width: t = 700,
  height: n = 500,
  editable: r = !0,
  title: l,
  poster: i,
  vszUrl: o,
  initialEditing: u
}) {
  const a = e((j) => j.error), s = e((j) => j.webgpuAvailable), c = e((j) => j.currentPage), [f, p] = M.useState(!!u), [y, v] = M.useState(!1), [S, N] = M.useState(!1), [h, d] = M.useState(i), m = M.useRef(null);
  M.useEffect(() => {
    wf();
    const j = e.getState();
    return j.setBackend("vello-wasm"), j.probeWebgpu(), j.loadPlotPrefs(), j.refreshAll(), j.subscribeToDaemon();
  }, [e]), M.useEffect(() => {
    let j = !0;
    return uf().then((R) => {
      j && v(R);
    }), () => {
      j = !1;
    };
  }, []), M.useEffect(() => () => {
    m.current && URL.revokeObjectURL(m.current);
  }, []);
  const w = (j) => `${(l ?? "figure").replace(/\s+/g, "_")}.${j}`, E = async (j, R) => {
    N(!0);
    try {
      await j();
    } catch (X) {
      e.setState({ error: `${R} failed: ${X.message}` });
    } finally {
      N(!1);
    }
  }, C = async () => {
    try {
      const j = await e.getState().rpc.render.scene(c, t, n, 96), R = await Ol(j.scene_b64, j.width, j.height, "image/png"), X = URL.createObjectURL(R);
      m.current && URL.revokeObjectURL(m.current), m.current = X, d(X);
    } catch {
    }
  }, _ = () => {
    p(!1), h !== void 0 && C();
  }, P = () => {
    const j = [];
    return o && j.push({ label: "Veusz", href: o, download: w("vsz"), hint: ".vsz" }), y && j.push({ label: "SVG", hint: "vector", onSelect: () => void E(() => Em(e, { page: c, width: t, height: n, filename: w("svg") }), "SVG export") }), j.push({ label: "PNG", hint: "image", onSelect: () => void E(() => _m(e, { page: c, width: t, height: n, filename: w("png") }), "PNG export") }), j.push({ label: "PDF", hint: "page", onSelect: () => void E(() => Cm(e, { page: c, width: t, height: n, filename: w("pdf") }), "PDF export") }), j;
  };
  return s === !1 ? /* @__PURE__ */ g.jsx("div", { "data-testid": "veusz-figure", className: "vz-fig", style: Oa, children: /* @__PURE__ */ g.jsx("div", { "data-testid": "veusz-needs-webgpu", style: { padding: 16, color: "#b06000" }, children: "This interactive figure needs WebGPU. Open in Chrome or Safari 26+." }) }) : /* @__PURE__ */ g.jsxs("div", { "data-testid": "veusz-figure", className: "vz-fig", style: Oa, children: [
    /* @__PURE__ */ g.jsxs("div", { className: "vz-toolbar", style: Nm, children: [
      /* @__PURE__ */ g.jsx(Ia, { items: P(), busy: S }),
      r && /* @__PURE__ */ g.jsx(
        "button",
        {
          type: "button",
          "data-testid": "veusz-edit-toggle",
          onClick: () => p(!0),
          style: jm,
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
      ) : /* @__PURE__ */ g.jsx("div", { style: { height: Math.round(n / t * 100) + "%", minHeight: 200 }, children: /* @__PURE__ */ g.jsx(pf, { store: e, width: t, height: n }) }),
      a && !f && /* @__PURE__ */ g.jsx("div", { "data-testid": "veusz-error", style: Rm, children: a })
    ] }),
    f && /* @__PURE__ */ g.jsx(
      pm,
      {
        store: e,
        title: l,
        width: t,
        height: n,
        toolbar: /* @__PURE__ */ g.jsx(Ia, { items: P(), busy: S }),
        onClose: _
      }
    )
  ] });
}
const Oa = {
  position: "relative",
  border: "1px solid #e2e4e8",
  borderRadius: 10,
  overflow: "hidden",
  background: "#fff",
  font: "14px system-ui, sans-serif"
}, Nm = {
  position: "absolute",
  top: 8,
  right: 8,
  zIndex: 3,
  display: "flex",
  gap: 6,
  alignItems: "flex-start"
}, jm = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 10px",
  cursor: "pointer",
  fontSize: 12,
  background: "#fff",
  color: "#222"
}, Rm = {
  position: "absolute",
  left: 8,
  bottom: 8,
  color: "crimson",
  fontSize: 12,
  background: "rgba(255,255,255,0.9)",
  padding: "2px 6px",
  borderRadius: 4
}, Aa = "This interactive figure needs WebGPU. Open in Chrome or Safari 26+.";
class Lm extends HTMLElement {
  constructor() {
    super(...arguments);
    Cn(this, "root", null);
    Cn(this, "mounted", !1);
    Cn(this, "noteEl", null);
    Cn(this, "urlLinks", null);
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
    if (i.src = n, i.alt = this.getAttribute("title") ?? "Veusz figure", i.style.cssText = "display:block;width:100%;height:auto;", i.addEventListener("error", () => this.status(r.note ?? Aa)), l.appendChild(i), r.onActivate) {
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
    if (!await of()) {
      r ? this.showPoster(r, {
        note: "Static image — the interactive view needs WebGPU (Chrome or Safari 26+)."
      }) : this.status(Aa);
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
      const i = await Nh({
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
        urlMap: Dm(this.getAttribute("data-url-map"))
      };
      await Rh(u, i.transport, a);
      const s = await Ih(u, n, a);
      await i.loadVsz(u, s), this.urlLinks = await jh(i.transport, a);
      const c = kh(Wp(i.transport));
      this.replaceChildren(), this.noteEl = null;
      const f = document.createElement("div");
      this.appendChild(f), this.root = qc(f), this.root.render(M.createElement(Tm, {
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
function Dm(e) {
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
typeof customElements < "u" && !customElements.get("veusz-figure") && customElements.define("veusz-figure", Lm);
export {
  Lm as VeuszFigureElement
};
//# sourceMappingURL=veusz-embed.js.map
