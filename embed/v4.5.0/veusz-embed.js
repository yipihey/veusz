var Gd = Object.defineProperty;
var Kd = (e, t, n) => t in e ? Gd(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Xt = (e, t, n) => Kd(e, typeof t != "symbol" ? t + "" : t, n);
function lu(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var iu = { exports: {} }, Te = {}, ou = { exports: {} }, F = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var mr = Symbol.for("react.element"), Zd = Symbol.for("react.portal"), Jd = Symbol.for("react.fragment"), qd = Symbol.for("react.strict_mode"), ef = Symbol.for("react.profiler"), tf = Symbol.for("react.provider"), nf = Symbol.for("react.context"), rf = Symbol.for("react.forward_ref"), lf = Symbol.for("react.suspense"), of = Symbol.for("react.memo"), af = Symbol.for("react.lazy"), Ta = Symbol.iterator;
function sf(e) {
  return e === null || typeof e != "object" ? null : (e = Ta && e[Ta] || e["@@iterator"], typeof e == "function" ? e : null);
}
var au = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, su = Object.assign, uu = {};
function jn(e, t, n) {
  this.props = e, this.context = t, this.refs = uu, this.updater = n || au;
}
jn.prototype.isReactComponent = {};
jn.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
jn.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function cu() {
}
cu.prototype = jn.prototype;
function zo(e, t, n) {
  this.props = e, this.context = t, this.refs = uu, this.updater = n || au;
}
var Ro = zo.prototype = new cu();
Ro.constructor = zo;
su(Ro, jn.prototype);
Ro.isPureReactComponent = !0;
var Da = Array.isArray, du = Object.prototype.hasOwnProperty, To = { current: null }, fu = { key: !0, ref: !0, __self: !0, __source: !0 };
function pu(e, t, n) {
  var r, l = {}, i = null, o = null;
  if (t != null) for (r in t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (i = "" + t.key), t) du.call(t, r) && !fu.hasOwnProperty(r) && (l[r] = t[r]);
  var a = arguments.length - 2;
  if (a === 1) l.children = n;
  else if (1 < a) {
    for (var s = Array(a), u = 0; u < a; u++) s[u] = arguments[u + 2];
    l.children = s;
  }
  if (e && e.defaultProps) for (r in a = e.defaultProps, a) l[r] === void 0 && (l[r] = a[r]);
  return { $$typeof: mr, type: e, key: i, ref: o, props: l, _owner: To.current };
}
function uf(e, t) {
  return { $$typeof: mr, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function Do(e) {
  return typeof e == "object" && e !== null && e.$$typeof === mr;
}
function cf(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var Na = /\/+/g;
function Kl(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? cf("" + e.key) : t.toString(36);
}
function Wr(e, t, n, r, l) {
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
        case mr:
        case Zd:
          o = !0;
      }
  }
  if (o) return o = e, l = l(o), e = r === "" ? "." + Kl(o, 0) : r, Da(l) ? (n = "", e != null && (n = e.replace(Na, "$&/") + "/"), Wr(l, t, n, "", function(u) {
    return u;
  })) : l != null && (Do(l) && (l = uf(l, n + (!l.key || o && o.key === l.key ? "" : ("" + l.key).replace(Na, "$&/") + "/") + e)), t.push(l)), 1;
  if (o = 0, r = r === "" ? "." : r + ":", Da(e)) for (var a = 0; a < e.length; a++) {
    i = e[a];
    var s = r + Kl(i, a);
    o += Wr(i, t, n, s, l);
  }
  else if (s = sf(e), typeof s == "function") for (e = s.call(e), a = 0; !(i = e.next()).done; ) i = i.value, s = r + Kl(i, a++), o += Wr(i, t, n, s, l);
  else if (i === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return o;
}
function Sr(e, t, n) {
  if (e == null) return e;
  var r = [], l = 0;
  return Wr(e, r, "", "", function(i) {
    return t.call(n, i, l++);
  }), r;
}
function df(e) {
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
var we = { current: null }, Vr = { transition: null }, ff = { ReactCurrentDispatcher: we, ReactCurrentBatchConfig: Vr, ReactCurrentOwner: To };
function hu() {
  throw Error("act(...) is not supported in production builds of React.");
}
F.Children = { map: Sr, forEach: function(e, t, n) {
  Sr(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return Sr(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return Sr(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!Do(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
F.Component = jn;
F.Fragment = Jd;
F.Profiler = ef;
F.PureComponent = zo;
F.StrictMode = qd;
F.Suspense = lf;
F.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ff;
F.act = hu;
F.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = su({}, e.props), l = e.key, i = e.ref, o = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (i = t.ref, o = To.current), t.key !== void 0 && (l = "" + t.key), e.type && e.type.defaultProps) var a = e.type.defaultProps;
    for (s in t) du.call(t, s) && !fu.hasOwnProperty(s) && (r[s] = t[s] === void 0 && a !== void 0 ? a[s] : t[s]);
  }
  var s = arguments.length - 2;
  if (s === 1) r.children = n;
  else if (1 < s) {
    a = Array(s);
    for (var u = 0; u < s; u++) a[u] = arguments[u + 2];
    r.children = a;
  }
  return { $$typeof: mr, type: e.type, key: l, ref: i, props: r, _owner: o };
};
F.createContext = function(e) {
  return e = { $$typeof: nf, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: tf, _context: e }, e.Consumer = e;
};
F.createElement = pu;
F.createFactory = function(e) {
  var t = pu.bind(null, e);
  return t.type = e, t;
};
F.createRef = function() {
  return { current: null };
};
F.forwardRef = function(e) {
  return { $$typeof: rf, render: e };
};
F.isValidElement = Do;
F.lazy = function(e) {
  return { $$typeof: af, _payload: { _status: -1, _result: e }, _init: df };
};
F.memo = function(e, t) {
  return { $$typeof: of, type: e, compare: t === void 0 ? null : t };
};
F.startTransition = function(e) {
  var t = Vr.transition;
  Vr.transition = {};
  try {
    e();
  } finally {
    Vr.transition = t;
  }
};
F.unstable_act = hu;
F.useCallback = function(e, t) {
  return we.current.useCallback(e, t);
};
F.useContext = function(e) {
  return we.current.useContext(e);
};
F.useDebugValue = function() {
};
F.useDeferredValue = function(e) {
  return we.current.useDeferredValue(e);
};
F.useEffect = function(e, t) {
  return we.current.useEffect(e, t);
};
F.useId = function() {
  return we.current.useId();
};
F.useImperativeHandle = function(e, t, n) {
  return we.current.useImperativeHandle(e, t, n);
};
F.useInsertionEffect = function(e, t) {
  return we.current.useInsertionEffect(e, t);
};
F.useLayoutEffect = function(e, t) {
  return we.current.useLayoutEffect(e, t);
};
F.useMemo = function(e, t) {
  return we.current.useMemo(e, t);
};
F.useReducer = function(e, t, n) {
  return we.current.useReducer(e, t, n);
};
F.useRef = function(e) {
  return we.current.useRef(e);
};
F.useState = function(e) {
  return we.current.useState(e);
};
F.useSyncExternalStore = function(e, t, n) {
  return we.current.useSyncExternalStore(e, t, n);
};
F.useTransition = function() {
  return we.current.useTransition();
};
F.version = "18.3.1";
ou.exports = F;
var E = ou.exports;
const pf = /* @__PURE__ */ lu(E);
var mu = { exports: {} }, gu = {};
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
  function t(w, T) {
    var z = w.length;
    w.push(T);
    e: for (; 0 < z; ) {
      var L = z - 1 >>> 1, I = w[L];
      if (0 < l(I, T)) w[L] = T, w[z] = I, z = L;
      else break e;
    }
  }
  function n(w) {
    return w.length === 0 ? null : w[0];
  }
  function r(w) {
    if (w.length === 0) return null;
    var T = w[0], z = w.pop();
    if (z !== T) {
      w[0] = z;
      e: for (var L = 0, I = w.length, V = I >>> 1; L < V; ) {
        var H = 2 * (L + 1) - 1, A = w[H], B = H + 1, O = w[B];
        if (0 > l(A, z)) B < I && 0 > l(O, A) ? (w[L] = O, w[B] = z, L = B) : (w[L] = A, w[H] = z, L = H);
        else if (B < I && 0 > l(O, z)) w[L] = O, w[B] = z, L = B;
        else break e;
      }
    }
    return T;
  }
  function l(w, T) {
    var z = w.sortIndex - T.sortIndex;
    return z !== 0 ? z : w.id - T.id;
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
  var s = [], u = [], f = 1, h = null, d = 3, v = !1, y = !1, S = !1, D = typeof setTimeout == "function" ? setTimeout : null, m = typeof clearTimeout == "function" ? clearTimeout : null, p = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function g(w) {
    for (var T = n(u); T !== null; ) {
      if (T.callback === null) r(u);
      else if (T.startTime <= w) r(u), T.sortIndex = T.expirationTime, t(s, T);
      else break;
      T = n(u);
    }
  }
  function x(w) {
    if (S = !1, g(w), !y) if (n(s) !== null) y = !0, Qt(P);
    else {
      var T = n(u);
      T !== null && Tt(x, T.startTime - w);
    }
  }
  function P(w, T) {
    y = !1, S && (S = !1, m(R), R = -1), v = !0;
    var z = d;
    try {
      for (g(T), h = n(s); h !== null && (!(h.expirationTime > T) || w && !b()); ) {
        var L = h.callback;
        if (typeof L == "function") {
          h.callback = null, d = h.priorityLevel;
          var I = L(h.expirationTime <= T);
          T = e.unstable_now(), typeof I == "function" ? h.callback = I : h === n(s) && r(s), g(T);
        } else r(s);
        h = n(s);
      }
      if (h !== null) var V = !0;
      else {
        var H = n(u);
        H !== null && Tt(x, H.startTime - T), V = !1;
      }
      return V;
    } finally {
      h = null, d = z, v = !1;
    }
  }
  var C = !1, k = null, R = -1, $ = 5, M = -1;
  function b() {
    return !(e.unstable_now() - M < $);
  }
  function _() {
    if (k !== null) {
      var w = e.unstable_now();
      M = w;
      var T = !0;
      try {
        T = k(!0, w);
      } finally {
        T ? Q() : (C = !1, k = null);
      }
    } else C = !1;
  }
  var Q;
  if (typeof p == "function") Q = function() {
    p(_);
  };
  else if (typeof MessageChannel < "u") {
    var me = new MessageChannel(), ge = me.port2;
    me.port1.onmessage = _, Q = function() {
      ge.postMessage(null);
    };
  } else Q = function() {
    D(_, 0);
  };
  function Qt(w) {
    k = w, C || (C = !0, Q());
  }
  function Tt(w, T) {
    R = D(function() {
      w(e.unstable_now());
    }, T);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(w) {
    w.callback = null;
  }, e.unstable_continueExecution = function() {
    y || v || (y = !0, Qt(P));
  }, e.unstable_forceFrameRate = function(w) {
    0 > w || 125 < w ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : $ = 0 < w ? Math.floor(1e3 / w) : 5;
  }, e.unstable_getCurrentPriorityLevel = function() {
    return d;
  }, e.unstable_getFirstCallbackNode = function() {
    return n(s);
  }, e.unstable_next = function(w) {
    switch (d) {
      case 1:
      case 2:
      case 3:
        var T = 3;
        break;
      default:
        T = d;
    }
    var z = d;
    d = T;
    try {
      return w();
    } finally {
      d = z;
    }
  }, e.unstable_pauseExecution = function() {
  }, e.unstable_requestPaint = function() {
  }, e.unstable_runWithPriority = function(w, T) {
    switch (w) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        w = 3;
    }
    var z = d;
    d = w;
    try {
      return T();
    } finally {
      d = z;
    }
  }, e.unstable_scheduleCallback = function(w, T, z) {
    var L = e.unstable_now();
    switch (typeof z == "object" && z !== null ? (z = z.delay, z = typeof z == "number" && 0 < z ? L + z : L) : z = L, w) {
      case 1:
        var I = -1;
        break;
      case 2:
        I = 250;
        break;
      case 5:
        I = 1073741823;
        break;
      case 4:
        I = 1e4;
        break;
      default:
        I = 5e3;
    }
    return I = z + I, w = { id: f++, callback: T, priorityLevel: w, startTime: z, expirationTime: I, sortIndex: -1 }, z > L ? (w.sortIndex = z, t(u, w), n(s) === null && w === n(u) && (S ? (m(R), R = -1) : S = !0, Tt(x, z - L))) : (w.sortIndex = I, t(s, w), y || v || (y = !0, Qt(P))), w;
  }, e.unstable_shouldYield = b, e.unstable_wrapCallback = function(w) {
    var T = d;
    return function() {
      var z = d;
      d = T;
      try {
        return w.apply(this, arguments);
      } finally {
        d = z;
      }
    };
  };
})(gu);
mu.exports = gu;
var hf = mu.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var mf = E, Re = hf;
function j(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var vu = /* @__PURE__ */ new Set(), Zn = {};
function Vt(e, t) {
  yn(e, t), yn(e + "Capture", t);
}
function yn(e, t) {
  for (Zn[e] = t, e = 0; e < t.length; e++) vu.add(t[e]);
}
var it = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Ti = Object.prototype.hasOwnProperty, gf = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, Ma = {}, La = {};
function vf(e) {
  return Ti.call(La, e) ? !0 : Ti.call(Ma, e) ? !1 : gf.test(e) ? La[e] = !0 : (Ma[e] = !0, !1);
}
function yf(e, t, n, r) {
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
function wf(e, t, n, r) {
  if (t === null || typeof t > "u" || yf(e, t, n, r)) return !0;
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
function xe(e, t, n, r, l, i, o) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = l, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = i, this.removeEmptyString = o;
}
var ue = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
  ue[e] = new xe(e, 0, !1, e, null, !1, !1);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
  var t = e[0];
  ue[t] = new xe(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
  ue[e] = new xe(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
  ue[e] = new xe(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
  ue[e] = new xe(e, 3, !1, e.toLowerCase(), null, !1, !1);
});
["checked", "multiple", "muted", "selected"].forEach(function(e) {
  ue[e] = new xe(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function(e) {
  ue[e] = new xe(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function(e) {
  ue[e] = new xe(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function(e) {
  ue[e] = new xe(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var No = /[\-:]([a-z])/g;
function Mo(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
  var t = e.replace(
    No,
    Mo
  );
  ue[t] = new xe(t, 1, !1, e, null, !1, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(No, Mo);
  ue[t] = new xe(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(No, Mo);
  ue[t] = new xe(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  ue[e] = new xe(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
ue.xlinkHref = new xe("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function(e) {
  ue[e] = new xe(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function Lo(e, t, n, r) {
  var l = ue.hasOwnProperty(t) ? ue[t] : null;
  (l !== null ? l.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (wf(t, n, l, r) && (n = null), r || l === null ? vf(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : l.mustUseProperty ? e[l.propertyName] = n === null ? l.type === 3 ? !1 : "" : n : (t = l.attributeName, r = l.attributeNamespace, n === null ? e.removeAttribute(t) : (l = l.type, n = l === 3 || l === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var ut = mf.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, kr = Symbol.for("react.element"), Zt = Symbol.for("react.portal"), Jt = Symbol.for("react.fragment"), Io = Symbol.for("react.strict_mode"), Di = Symbol.for("react.profiler"), yu = Symbol.for("react.provider"), wu = Symbol.for("react.context"), $o = Symbol.for("react.forward_ref"), Ni = Symbol.for("react.suspense"), Mi = Symbol.for("react.suspense_list"), Ao = Symbol.for("react.memo"), dt = Symbol.for("react.lazy"), xu = Symbol.for("react.offscreen"), Ia = Symbol.iterator;
function Rn(e) {
  return e === null || typeof e != "object" ? null : (e = Ia && e[Ia] || e["@@iterator"], typeof e == "function" ? e : null);
}
var q = Object.assign, Zl;
function Fn(e) {
  if (Zl === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    Zl = t && t[1] || "";
  }
  return `
` + Zl + e;
}
var Jl = !1;
function ql(e, t) {
  if (!e || Jl) return "";
  Jl = !0;
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
    Jl = !1, Error.prepareStackTrace = n;
  }
  return (e = e ? e.displayName || e.name : "") ? Fn(e) : "";
}
function xf(e) {
  switch (e.tag) {
    case 5:
      return Fn(e.type);
    case 16:
      return Fn("Lazy");
    case 13:
      return Fn("Suspense");
    case 19:
      return Fn("SuspenseList");
    case 0:
    case 2:
    case 15:
      return e = ql(e.type, !1), e;
    case 11:
      return e = ql(e.type.render, !1), e;
    case 1:
      return e = ql(e.type, !0), e;
    default:
      return "";
  }
}
function Li(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Jt:
      return "Fragment";
    case Zt:
      return "Portal";
    case Di:
      return "Profiler";
    case Io:
      return "StrictMode";
    case Ni:
      return "Suspense";
    case Mi:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case wu:
      return (e.displayName || "Context") + ".Consumer";
    case yu:
      return (e._context.displayName || "Context") + ".Provider";
    case $o:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case Ao:
      return t = e.displayName || null, t !== null ? t : Li(e.type) || "Memo";
    case dt:
      t = e._payload, e = e._init;
      try {
        return Li(e(t));
      } catch {
      }
  }
  return null;
}
function Sf(e) {
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
      return Li(t);
    case 8:
      return t === Io ? "StrictMode" : "Mode";
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
function Su(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function kf(e) {
  var t = Su(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
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
function Er(e) {
  e._valueTracker || (e._valueTracker = kf(e));
}
function ku(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(), r = "";
  return e && (r = Su(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
}
function rl(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function Ii(e, t) {
  var n = t.checked;
  return q({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function $a(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = _t(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function Eu(e, t) {
  t = t.checked, t != null && Lo(e, "checked", t, !1);
}
function $i(e, t) {
  Eu(e, t);
  var n = _t(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? Ai(e, t.type, n) : t.hasOwnProperty("defaultValue") && Ai(e, t.type, _t(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function Aa(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function Ai(e, t, n) {
  (t !== "number" || rl(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var On = Array.isArray;
function cn(e, t, n, r) {
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
function Fi(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(j(91));
  return q({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function Fa(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(j(92));
      if (On(n)) {
        if (1 < n.length) throw Error(j(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = { initialValue: _t(n) };
}
function Cu(e, t) {
  var n = _t(t.value), r = _t(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function Oa(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function _u(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function Oi(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? _u(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var Cr, ju = function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, l) {
    MSApp.execUnsafeLocalFunction(function() {
      return e(t, n, r, l);
    });
  } : e;
}(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
  else {
    for (Cr = Cr || document.createElement("div"), Cr.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = Cr.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
    for (; t.firstChild; ) e.appendChild(t.firstChild);
  }
});
function Jn(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var Bn = {
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
}, Ef = ["Webkit", "ms", "Moz", "O"];
Object.keys(Bn).forEach(function(e) {
  Ef.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), Bn[t] = Bn[e];
  });
});
function Pu(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || Bn.hasOwnProperty(e) && Bn[e] ? ("" + t).trim() : t + "px";
}
function zu(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, l = Pu(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, l) : e[n] = l;
  }
}
var Cf = q({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
function Ui(e, t) {
  if (t) {
    if (Cf[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(j(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(j(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(j(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(j(62));
  }
}
function bi(e, t) {
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
var Bi = null;
function Fo(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var Wi = null, dn = null, fn = null;
function Ua(e) {
  if (e = yr(e)) {
    if (typeof Wi != "function") throw Error(j(280));
    var t = e.stateNode;
    t && (t = Nl(t), Wi(e.stateNode, e.type, t));
  }
}
function Ru(e) {
  dn ? fn ? fn.push(e) : fn = [e] : dn = e;
}
function Tu() {
  if (dn) {
    var e = dn, t = fn;
    if (fn = dn = null, Ua(e), t) for (e = 0; e < t.length; e++) Ua(t[e]);
  }
}
function Du(e, t) {
  return e(t);
}
function Nu() {
}
var ei = !1;
function Mu(e, t, n) {
  if (ei) return e(t, n);
  ei = !0;
  try {
    return Du(e, t, n);
  } finally {
    ei = !1, (dn !== null || fn !== null) && (Nu(), Tu());
  }
}
function qn(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = Nl(n);
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
  if (n && typeof n != "function") throw Error(j(231, t, typeof n));
  return n;
}
var Vi = !1;
if (it) try {
  var Tn = {};
  Object.defineProperty(Tn, "passive", { get: function() {
    Vi = !0;
  } }), window.addEventListener("test", Tn, Tn), window.removeEventListener("test", Tn, Tn);
} catch {
  Vi = !1;
}
function _f(e, t, n, r, l, i, o, a, s) {
  var u = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, u);
  } catch (f) {
    this.onError(f);
  }
}
var Wn = !1, ll = null, il = !1, Hi = null, jf = { onError: function(e) {
  Wn = !0, ll = e;
} };
function Pf(e, t, n, r, l, i, o, a, s) {
  Wn = !1, ll = null, _f.apply(jf, arguments);
}
function zf(e, t, n, r, l, i, o, a, s) {
  if (Pf.apply(this, arguments), Wn) {
    if (Wn) {
      var u = ll;
      Wn = !1, ll = null;
    } else throw Error(j(198));
    il || (il = !0, Hi = u);
  }
}
function Ht(e) {
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
function Lu(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function ba(e) {
  if (Ht(e) !== e) throw Error(j(188));
}
function Rf(e) {
  var t = e.alternate;
  if (!t) {
    if (t = Ht(e), t === null) throw Error(j(188));
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
        if (i === n) return ba(l), e;
        if (i === r) return ba(l), t;
        i = i.sibling;
      }
      throw Error(j(188));
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
        if (!o) throw Error(j(189));
      }
    }
    if (n.alternate !== r) throw Error(j(190));
  }
  if (n.tag !== 3) throw Error(j(188));
  return n.stateNode.current === n ? e : t;
}
function Iu(e) {
  return e = Rf(e), e !== null ? $u(e) : null;
}
function $u(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = $u(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var Au = Re.unstable_scheduleCallback, Ba = Re.unstable_cancelCallback, Tf = Re.unstable_shouldYield, Df = Re.unstable_requestPaint, te = Re.unstable_now, Nf = Re.unstable_getCurrentPriorityLevel, Oo = Re.unstable_ImmediatePriority, Fu = Re.unstable_UserBlockingPriority, ol = Re.unstable_NormalPriority, Mf = Re.unstable_LowPriority, Ou = Re.unstable_IdlePriority, zl = null, Ze = null;
function Lf(e) {
  if (Ze && typeof Ze.onCommitFiberRoot == "function") try {
    Ze.onCommitFiberRoot(zl, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var We = Math.clz32 ? Math.clz32 : Af, If = Math.log, $f = Math.LN2;
function Af(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (If(e) / $f | 0) | 0;
}
var _r = 64, jr = 4194304;
function Un(e) {
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
function al(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0, l = e.suspendedLanes, i = e.pingedLanes, o = n & 268435455;
  if (o !== 0) {
    var a = o & ~l;
    a !== 0 ? r = Un(a) : (i &= o, i !== 0 && (r = Un(i)));
  } else o = n & ~l, o !== 0 ? r = Un(o) : i !== 0 && (r = Un(i));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & l) && (l = r & -r, i = t & -t, l >= i || l === 16 && (i & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - We(t), l = 1 << n, r |= e[n], t &= ~l;
  return r;
}
function Ff(e, t) {
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
function Of(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, i = e.pendingLanes; 0 < i; ) {
    var o = 31 - We(i), a = 1 << o, s = l[o];
    s === -1 ? (!(a & n) || a & r) && (l[o] = Ff(a, t)) : s <= t && (e.expiredLanes |= a), i &= ~a;
  }
}
function Qi(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function Uu() {
  var e = _r;
  return _r <<= 1, !(_r & 4194240) && (_r = 64), e;
}
function ti(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function gr(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - We(t), e[t] = n;
}
function Uf(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var l = 31 - We(n), i = 1 << l;
    t[l] = 0, r[l] = -1, e[l] = -1, n &= ~i;
  }
}
function Uo(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
    var r = 31 - We(n), l = 1 << r;
    l & t | e[r] & t && (e[r] |= t), n &= ~l;
  }
}
var W = 0;
function bu(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var Bu, bo, Wu, Vu, Hu, Yi = !1, Pr = [], vt = null, yt = null, wt = null, er = /* @__PURE__ */ new Map(), tr = /* @__PURE__ */ new Map(), pt = [], bf = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function Wa(e, t) {
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
      wt = null;
      break;
    case "pointerover":
    case "pointerout":
      er.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      tr.delete(t.pointerId);
  }
}
function Dn(e, t, n, r, l, i) {
  return e === null || e.nativeEvent !== i ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: i, targetContainers: [l] }, t !== null && (t = yr(t), t !== null && bo(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, l !== null && t.indexOf(l) === -1 && t.push(l), e);
}
function Bf(e, t, n, r, l) {
  switch (t) {
    case "focusin":
      return vt = Dn(vt, e, t, n, r, l), !0;
    case "dragenter":
      return yt = Dn(yt, e, t, n, r, l), !0;
    case "mouseover":
      return wt = Dn(wt, e, t, n, r, l), !0;
    case "pointerover":
      var i = l.pointerId;
      return er.set(i, Dn(er.get(i) || null, e, t, n, r, l)), !0;
    case "gotpointercapture":
      return i = l.pointerId, tr.set(i, Dn(tr.get(i) || null, e, t, n, r, l)), !0;
  }
  return !1;
}
function Qu(e) {
  var t = Lt(e.target);
  if (t !== null) {
    var n = Ht(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = Lu(n), t !== null) {
          e.blockedOn = t, Hu(e.priority, function() {
            Wu(n);
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
function Hr(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Xi(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      Bi = r, n.target.dispatchEvent(r), Bi = null;
    } else return t = yr(n), t !== null && bo(t), e.blockedOn = n, !1;
    t.shift();
  }
  return !0;
}
function Va(e, t, n) {
  Hr(e) && n.delete(t);
}
function Wf() {
  Yi = !1, vt !== null && Hr(vt) && (vt = null), yt !== null && Hr(yt) && (yt = null), wt !== null && Hr(wt) && (wt = null), er.forEach(Va), tr.forEach(Va);
}
function Nn(e, t) {
  e.blockedOn === t && (e.blockedOn = null, Yi || (Yi = !0, Re.unstable_scheduleCallback(Re.unstable_NormalPriority, Wf)));
}
function nr(e) {
  function t(l) {
    return Nn(l, e);
  }
  if (0 < Pr.length) {
    Nn(Pr[0], e);
    for (var n = 1; n < Pr.length; n++) {
      var r = Pr[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (vt !== null && Nn(vt, e), yt !== null && Nn(yt, e), wt !== null && Nn(wt, e), er.forEach(t), tr.forEach(t), n = 0; n < pt.length; n++) r = pt[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < pt.length && (n = pt[0], n.blockedOn === null); ) Qu(n), n.blockedOn === null && pt.shift();
}
var pn = ut.ReactCurrentBatchConfig, sl = !0;
function Vf(e, t, n, r) {
  var l = W, i = pn.transition;
  pn.transition = null;
  try {
    W = 1, Bo(e, t, n, r);
  } finally {
    W = l, pn.transition = i;
  }
}
function Hf(e, t, n, r) {
  var l = W, i = pn.transition;
  pn.transition = null;
  try {
    W = 4, Bo(e, t, n, r);
  } finally {
    W = l, pn.transition = i;
  }
}
function Bo(e, t, n, r) {
  if (sl) {
    var l = Xi(e, t, n, r);
    if (l === null) di(e, t, r, ul, n), Wa(e, r);
    else if (Bf(l, e, t, n, r)) r.stopPropagation();
    else if (Wa(e, r), t & 4 && -1 < bf.indexOf(e)) {
      for (; l !== null; ) {
        var i = yr(l);
        if (i !== null && Bu(i), i = Xi(e, t, n, r), i === null && di(e, t, r, ul, n), i === l) break;
        l = i;
      }
      l !== null && r.stopPropagation();
    } else di(e, t, r, null, n);
  }
}
var ul = null;
function Xi(e, t, n, r) {
  if (ul = null, e = Fo(r), e = Lt(e), e !== null) if (t = Ht(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = Lu(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return ul = e, null;
}
function Yu(e) {
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
      switch (Nf()) {
        case Oo:
          return 1;
        case Fu:
          return 4;
        case ol:
        case Mf:
          return 16;
        case Ou:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var mt = null, Wo = null, Qr = null;
function Xu() {
  if (Qr) return Qr;
  var e, t = Wo, n = t.length, r, l = "value" in mt ? mt.value : mt.textContent, i = l.length;
  for (e = 0; e < n && t[e] === l[e]; e++) ;
  var o = n - e;
  for (r = 1; r <= o && t[n - r] === l[i - r]; r++) ;
  return Qr = l.slice(e, 1 < r ? 1 - r : void 0);
}
function Yr(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function zr() {
  return !0;
}
function Ha() {
  return !1;
}
function De(e) {
  function t(n, r, l, i, o) {
    this._reactName = n, this._targetInst = l, this.type = r, this.nativeEvent = i, this.target = o, this.currentTarget = null;
    for (var a in e) e.hasOwnProperty(a) && (n = e[a], this[a] = n ? n(i) : i[a]);
    return this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1) ? zr : Ha, this.isPropagationStopped = Ha, this;
  }
  return q(t.prototype, { preventDefault: function() {
    this.defaultPrevented = !0;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = zr);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = zr);
  }, persist: function() {
  }, isPersistent: zr }), t;
}
var Pn = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, Vo = De(Pn), vr = q({}, Pn, { view: 0, detail: 0 }), Qf = De(vr), ni, ri, Mn, Rl = q({}, vr, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: Ho, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== Mn && (Mn && e.type === "mousemove" ? (ni = e.screenX - Mn.screenX, ri = e.screenY - Mn.screenY) : ri = ni = 0, Mn = e), ni);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : ri;
} }), Qa = De(Rl), Yf = q({}, Rl, { dataTransfer: 0 }), Xf = De(Yf), Gf = q({}, vr, { relatedTarget: 0 }), li = De(Gf), Kf = q({}, Pn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Zf = De(Kf), Jf = q({}, Pn, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), qf = De(Jf), ep = q({}, Pn, { data: 0 }), Ya = De(ep), tp = {
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
}, np = {
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
}, rp = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function lp(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = rp[e]) ? !!t[e] : !1;
}
function Ho() {
  return lp;
}
var ip = q({}, vr, { key: function(e) {
  if (e.key) {
    var t = tp[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = Yr(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? np[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: Ho, charCode: function(e) {
  return e.type === "keypress" ? Yr(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? Yr(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), op = De(ip), ap = q({}, Rl, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Xa = De(ap), sp = q({}, vr, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: Ho }), up = De(sp), cp = q({}, Pn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), dp = De(cp), fp = q({}, Rl, {
  deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  },
  deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), pp = De(fp), hp = [9, 13, 27, 32], Qo = it && "CompositionEvent" in window, Vn = null;
it && "documentMode" in document && (Vn = document.documentMode);
var mp = it && "TextEvent" in window && !Vn, Gu = it && (!Qo || Vn && 8 < Vn && 11 >= Vn), Ga = " ", Ka = !1;
function Ku(e, t) {
  switch (e) {
    case "keyup":
      return hp.indexOf(t.keyCode) !== -1;
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
function Zu(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var qt = !1;
function gp(e, t) {
  switch (e) {
    case "compositionend":
      return Zu(t);
    case "keypress":
      return t.which !== 32 ? null : (Ka = !0, Ga);
    case "textInput":
      return e = t.data, e === Ga && Ka ? null : e;
    default:
      return null;
  }
}
function vp(e, t) {
  if (qt) return e === "compositionend" || !Qo && Ku(e, t) ? (e = Xu(), Qr = Wo = mt = null, qt = !1, e) : null;
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
      return Gu && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var yp = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
function Za(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!yp[e.type] : t === "textarea";
}
function Ju(e, t, n, r) {
  Ru(r), t = cl(t, "onChange"), 0 < t.length && (n = new Vo("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var Hn = null, rr = null;
function wp(e) {
  uc(e, 0);
}
function Tl(e) {
  var t = nn(e);
  if (ku(t)) return e;
}
function xp(e, t) {
  if (e === "change") return t;
}
var qu = !1;
if (it) {
  var ii;
  if (it) {
    var oi = "oninput" in document;
    if (!oi) {
      var Ja = document.createElement("div");
      Ja.setAttribute("oninput", "return;"), oi = typeof Ja.oninput == "function";
    }
    ii = oi;
  } else ii = !1;
  qu = ii && (!document.documentMode || 9 < document.documentMode);
}
function qa() {
  Hn && (Hn.detachEvent("onpropertychange", ec), rr = Hn = null);
}
function ec(e) {
  if (e.propertyName === "value" && Tl(rr)) {
    var t = [];
    Ju(t, rr, e, Fo(e)), Mu(wp, t);
  }
}
function Sp(e, t, n) {
  e === "focusin" ? (qa(), Hn = t, rr = n, Hn.attachEvent("onpropertychange", ec)) : e === "focusout" && qa();
}
function kp(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return Tl(rr);
}
function Ep(e, t) {
  if (e === "click") return Tl(t);
}
function Cp(e, t) {
  if (e === "input" || e === "change") return Tl(t);
}
function _p(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var He = typeof Object.is == "function" ? Object.is : _p;
function lr(e, t) {
  if (He(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var l = n[r];
    if (!Ti.call(t, l) || !He(e[l], t[l])) return !1;
  }
  return !0;
}
function es(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function ts(e, t) {
  var n = es(e);
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
    n = es(n);
  }
}
function tc(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? tc(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function nc() {
  for (var e = window, t = rl(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = rl(e.document);
  }
  return t;
}
function Yo(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
}
function jp(e) {
  var t = nc(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && tc(n.ownerDocument.documentElement, n)) {
    if (r !== null && Yo(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
      else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var l = n.textContent.length, i = Math.min(r.start, l);
        r = r.end === void 0 ? i : Math.min(r.end, l), !e.extend && i > r && (l = r, r = i, i = l), l = ts(n, i);
        var o = ts(
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
var Pp = it && "documentMode" in document && 11 >= document.documentMode, en = null, Gi = null, Qn = null, Ki = !1;
function ns(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Ki || en == null || en !== rl(r) || (r = en, "selectionStart" in r && Yo(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), Qn && lr(Qn, r) || (Qn = r, r = cl(Gi, "onSelect"), 0 < r.length && (t = new Vo("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = en)));
}
function Rr(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var tn = { animationend: Rr("Animation", "AnimationEnd"), animationiteration: Rr("Animation", "AnimationIteration"), animationstart: Rr("Animation", "AnimationStart"), transitionend: Rr("Transition", "TransitionEnd") }, ai = {}, rc = {};
it && (rc = document.createElement("div").style, "AnimationEvent" in window || (delete tn.animationend.animation, delete tn.animationiteration.animation, delete tn.animationstart.animation), "TransitionEvent" in window || delete tn.transitionend.transition);
function Dl(e) {
  if (ai[e]) return ai[e];
  if (!tn[e]) return e;
  var t = tn[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in rc) return ai[e] = t[n];
  return e;
}
var lc = Dl("animationend"), ic = Dl("animationiteration"), oc = Dl("animationstart"), ac = Dl("transitionend"), sc = /* @__PURE__ */ new Map(), rs = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function Pt(e, t) {
  sc.set(e, t), Vt(t, [e]);
}
for (var si = 0; si < rs.length; si++) {
  var ui = rs[si], zp = ui.toLowerCase(), Rp = ui[0].toUpperCase() + ui.slice(1);
  Pt(zp, "on" + Rp);
}
Pt(lc, "onAnimationEnd");
Pt(ic, "onAnimationIteration");
Pt(oc, "onAnimationStart");
Pt("dblclick", "onDoubleClick");
Pt("focusin", "onFocus");
Pt("focusout", "onBlur");
Pt(ac, "onTransitionEnd");
yn("onMouseEnter", ["mouseout", "mouseover"]);
yn("onMouseLeave", ["mouseout", "mouseover"]);
yn("onPointerEnter", ["pointerout", "pointerover"]);
yn("onPointerLeave", ["pointerout", "pointerover"]);
Vt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
Vt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
Vt("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Vt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
Vt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
Vt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var bn = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Tp = new Set("cancel close invalid load scroll toggle".split(" ").concat(bn));
function ls(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, zf(r, t, void 0, e), e.currentTarget = null;
}
function uc(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n], l = r.event;
    r = r.listeners;
    e: {
      var i = void 0;
      if (t) for (var o = r.length - 1; 0 <= o; o--) {
        var a = r[o], s = a.instance, u = a.currentTarget;
        if (a = a.listener, s !== i && l.isPropagationStopped()) break e;
        ls(l, a, u), i = s;
      }
      else for (o = 0; o < r.length; o++) {
        if (a = r[o], s = a.instance, u = a.currentTarget, a = a.listener, s !== i && l.isPropagationStopped()) break e;
        ls(l, a, u), i = s;
      }
    }
  }
  if (il) throw e = Hi, il = !1, Hi = null, e;
}
function X(e, t) {
  var n = t[to];
  n === void 0 && (n = t[to] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (cc(t, e, 2, !1), n.add(r));
}
function ci(e, t, n) {
  var r = 0;
  t && (r |= 4), cc(n, e, r, t);
}
var Tr = "_reactListening" + Math.random().toString(36).slice(2);
function ir(e) {
  if (!e[Tr]) {
    e[Tr] = !0, vu.forEach(function(n) {
      n !== "selectionchange" && (Tp.has(n) || ci(n, !1, e), ci(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Tr] || (t[Tr] = !0, ci("selectionchange", !1, t));
  }
}
function cc(e, t, n, r) {
  switch (Yu(t)) {
    case 1:
      var l = Vf;
      break;
    case 4:
      l = Hf;
      break;
    default:
      l = Bo;
  }
  n = l.bind(null, t, n, e), l = void 0, !Vi || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (l = !0), r ? l !== void 0 ? e.addEventListener(t, n, { capture: !0, passive: l }) : e.addEventListener(t, n, !0) : l !== void 0 ? e.addEventListener(t, n, { passive: l }) : e.addEventListener(t, n, !1);
}
function di(e, t, n, r, l) {
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
        if (o = Lt(a), o === null) return;
        if (s = o.tag, s === 5 || s === 6) {
          r = i = o;
          continue e;
        }
        a = a.parentNode;
      }
    }
    r = r.return;
  }
  Mu(function() {
    var u = i, f = Fo(n), h = [];
    e: {
      var d = sc.get(e);
      if (d !== void 0) {
        var v = Vo, y = e;
        switch (e) {
          case "keypress":
            if (Yr(n) === 0) break e;
          case "keydown":
          case "keyup":
            v = op;
            break;
          case "focusin":
            y = "focus", v = li;
            break;
          case "focusout":
            y = "blur", v = li;
            break;
          case "beforeblur":
          case "afterblur":
            v = li;
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
            v = Qa;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            v = Xf;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            v = up;
            break;
          case lc:
          case ic:
          case oc:
            v = Zf;
            break;
          case ac:
            v = dp;
            break;
          case "scroll":
            v = Qf;
            break;
          case "wheel":
            v = pp;
            break;
          case "copy":
          case "cut":
          case "paste":
            v = qf;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            v = Xa;
        }
        var S = (t & 4) !== 0, D = !S && e === "scroll", m = S ? d !== null ? d + "Capture" : null : d;
        S = [];
        for (var p = u, g; p !== null; ) {
          g = p;
          var x = g.stateNode;
          if (g.tag === 5 && x !== null && (g = x, m !== null && (x = qn(p, m), x != null && S.push(or(p, x, g)))), D) break;
          p = p.return;
        }
        0 < S.length && (d = new v(d, y, null, n, f), h.push({ event: d, listeners: S }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (d = e === "mouseover" || e === "pointerover", v = e === "mouseout" || e === "pointerout", d && n !== Bi && (y = n.relatedTarget || n.fromElement) && (Lt(y) || y[ot])) break e;
        if ((v || d) && (d = f.window === f ? f : (d = f.ownerDocument) ? d.defaultView || d.parentWindow : window, v ? (y = n.relatedTarget || n.toElement, v = u, y = y ? Lt(y) : null, y !== null && (D = Ht(y), y !== D || y.tag !== 5 && y.tag !== 6) && (y = null)) : (v = null, y = u), v !== y)) {
          if (S = Qa, x = "onMouseLeave", m = "onMouseEnter", p = "mouse", (e === "pointerout" || e === "pointerover") && (S = Xa, x = "onPointerLeave", m = "onPointerEnter", p = "pointer"), D = v == null ? d : nn(v), g = y == null ? d : nn(y), d = new S(x, p + "leave", v, n, f), d.target = D, d.relatedTarget = g, x = null, Lt(f) === u && (S = new S(m, p + "enter", y, n, f), S.target = g, S.relatedTarget = D, x = S), D = x, v && y) t: {
            for (S = v, m = y, p = 0, g = S; g; g = Gt(g)) p++;
            for (g = 0, x = m; x; x = Gt(x)) g++;
            for (; 0 < p - g; ) S = Gt(S), p--;
            for (; 0 < g - p; ) m = Gt(m), g--;
            for (; p--; ) {
              if (S === m || m !== null && S === m.alternate) break t;
              S = Gt(S), m = Gt(m);
            }
            S = null;
          }
          else S = null;
          v !== null && is(h, d, v, S, !1), y !== null && D !== null && is(h, D, y, S, !0);
        }
      }
      e: {
        if (d = u ? nn(u) : window, v = d.nodeName && d.nodeName.toLowerCase(), v === "select" || v === "input" && d.type === "file") var P = xp;
        else if (Za(d)) if (qu) P = Cp;
        else {
          P = kp;
          var C = Sp;
        }
        else (v = d.nodeName) && v.toLowerCase() === "input" && (d.type === "checkbox" || d.type === "radio") && (P = Ep);
        if (P && (P = P(e, u))) {
          Ju(h, P, n, f);
          break e;
        }
        C && C(e, d, u), e === "focusout" && (C = d._wrapperState) && C.controlled && d.type === "number" && Ai(d, "number", d.value);
      }
      switch (C = u ? nn(u) : window, e) {
        case "focusin":
          (Za(C) || C.contentEditable === "true") && (en = C, Gi = u, Qn = null);
          break;
        case "focusout":
          Qn = Gi = en = null;
          break;
        case "mousedown":
          Ki = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Ki = !1, ns(h, n, f);
          break;
        case "selectionchange":
          if (Pp) break;
        case "keydown":
        case "keyup":
          ns(h, n, f);
      }
      var k;
      if (Qo) e: {
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
      else qt ? Ku(e, n) && (R = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (R = "onCompositionStart");
      R && (Gu && n.locale !== "ko" && (qt || R !== "onCompositionStart" ? R === "onCompositionEnd" && qt && (k = Xu()) : (mt = f, Wo = "value" in mt ? mt.value : mt.textContent, qt = !0)), C = cl(u, R), 0 < C.length && (R = new Ya(R, e, null, n, f), h.push({ event: R, listeners: C }), k ? R.data = k : (k = Zu(n), k !== null && (R.data = k)))), (k = mp ? gp(e, n) : vp(e, n)) && (u = cl(u, "onBeforeInput"), 0 < u.length && (f = new Ya("onBeforeInput", "beforeinput", null, n, f), h.push({ event: f, listeners: u }), f.data = k));
    }
    uc(h, t);
  });
}
function or(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function cl(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var l = e, i = l.stateNode;
    l.tag === 5 && i !== null && (l = i, i = qn(e, n), i != null && r.unshift(or(e, i, l)), i = qn(e, t), i != null && r.push(or(e, i, l))), e = e.return;
  }
  return r;
}
function Gt(e) {
  if (e === null) return null;
  do
    e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function is(e, t, n, r, l) {
  for (var i = t._reactName, o = []; n !== null && n !== r; ) {
    var a = n, s = a.alternate, u = a.stateNode;
    if (s !== null && s === r) break;
    a.tag === 5 && u !== null && (a = u, l ? (s = qn(n, i), s != null && o.unshift(or(n, s, a))) : l || (s = qn(n, i), s != null && o.push(or(n, s, a)))), n = n.return;
  }
  o.length !== 0 && e.push({ event: t, listeners: o });
}
var Dp = /\r\n?/g, Np = /\u0000|\uFFFD/g;
function os(e) {
  return (typeof e == "string" ? e : "" + e).replace(Dp, `
`).replace(Np, "");
}
function Dr(e, t, n) {
  if (t = os(t), os(e) !== t && n) throw Error(j(425));
}
function dl() {
}
var Zi = null, Ji = null;
function qi(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var eo = typeof setTimeout == "function" ? setTimeout : void 0, Mp = typeof clearTimeout == "function" ? clearTimeout : void 0, as = typeof Promise == "function" ? Promise : void 0, Lp = typeof queueMicrotask == "function" ? queueMicrotask : typeof as < "u" ? function(e) {
  return as.resolve(null).then(e).catch(Ip);
} : eo;
function Ip(e) {
  setTimeout(function() {
    throw e;
  });
}
function fi(e, t) {
  var n = t, r = 0;
  do {
    var l = n.nextSibling;
    if (e.removeChild(n), l && l.nodeType === 8) if (n = l.data, n === "/$") {
      if (r === 0) {
        e.removeChild(l), nr(t);
        return;
      }
      r--;
    } else n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = l;
  } while (n);
  nr(t);
}
function xt(e) {
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
function ss(e) {
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
var zn = Math.random().toString(36).slice(2), Ke = "__reactFiber$" + zn, ar = "__reactProps$" + zn, ot = "__reactContainer$" + zn, to = "__reactEvents$" + zn, $p = "__reactListeners$" + zn, Ap = "__reactHandles$" + zn;
function Lt(e) {
  var t = e[Ke];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[ot] || n[Ke]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = ss(e); e !== null; ) {
        if (n = e[Ke]) return n;
        e = ss(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function yr(e) {
  return e = e[Ke] || e[ot], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function nn(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(j(33));
}
function Nl(e) {
  return e[ar] || null;
}
var no = [], rn = -1;
function zt(e) {
  return { current: e };
}
function G(e) {
  0 > rn || (e.current = no[rn], no[rn] = null, rn--);
}
function Y(e, t) {
  rn++, no[rn] = e.current, e.current = t;
}
var jt = {}, he = zt(jt), Ee = zt(!1), Ot = jt;
function wn(e, t) {
  var n = e.type.contextTypes;
  if (!n) return jt;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var l = {}, i;
  for (i in n) l[i] = t[i];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = l), l;
}
function Ce(e) {
  return e = e.childContextTypes, e != null;
}
function fl() {
  G(Ee), G(he);
}
function us(e, t, n) {
  if (he.current !== jt) throw Error(j(168));
  Y(he, t), Y(Ee, n);
}
function dc(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var l in r) if (!(l in t)) throw Error(j(108, Sf(e) || "Unknown", l));
  return q({}, n, r);
}
function pl(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || jt, Ot = he.current, Y(he, e), Y(Ee, Ee.current), !0;
}
function cs(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(j(169));
  n ? (e = dc(e, t, Ot), r.__reactInternalMemoizedMergedChildContext = e, G(Ee), G(he), Y(he, e)) : G(Ee), Y(Ee, n);
}
var tt = null, Ml = !1, pi = !1;
function fc(e) {
  tt === null ? tt = [e] : tt.push(e);
}
function Fp(e) {
  Ml = !0, fc(e);
}
function Rt() {
  if (!pi && tt !== null) {
    pi = !0;
    var e = 0, t = W;
    try {
      var n = tt;
      for (W = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(!0);
        while (r !== null);
      }
      tt = null, Ml = !1;
    } catch (l) {
      throw tt !== null && (tt = tt.slice(e + 1)), Au(Oo, Rt), l;
    } finally {
      W = t, pi = !1;
    }
  }
  return null;
}
var ln = [], on = 0, hl = null, ml = 0, Me = [], Le = 0, Ut = null, nt = 1, rt = "";
function Nt(e, t) {
  ln[on++] = ml, ln[on++] = hl, hl = e, ml = t;
}
function pc(e, t, n) {
  Me[Le++] = nt, Me[Le++] = rt, Me[Le++] = Ut, Ut = e;
  var r = nt;
  e = rt;
  var l = 32 - We(r) - 1;
  r &= ~(1 << l), n += 1;
  var i = 32 - We(t) + l;
  if (30 < i) {
    var o = l - l % 5;
    i = (r & (1 << o) - 1).toString(32), r >>= o, l -= o, nt = 1 << 32 - We(t) + l | n << l | r, rt = i + e;
  } else nt = 1 << i | n << l | r, rt = e;
}
function Xo(e) {
  e.return !== null && (Nt(e, 1), pc(e, 1, 0));
}
function Go(e) {
  for (; e === hl; ) hl = ln[--on], ln[on] = null, ml = ln[--on], ln[on] = null;
  for (; e === Ut; ) Ut = Me[--Le], Me[Le] = null, rt = Me[--Le], Me[Le] = null, nt = Me[--Le], Me[Le] = null;
}
var ze = null, Pe = null, K = !1, Be = null;
function hc(e, t) {
  var n = Ie(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function ds(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, ze = e, Pe = xt(t.firstChild), !0) : !1;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, ze = e, Pe = null, !0) : !1;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = Ut !== null ? { id: nt, overflow: rt } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = Ie(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, ze = e, Pe = null, !0) : !1;
    default:
      return !1;
  }
}
function ro(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function lo(e) {
  if (K) {
    var t = Pe;
    if (t) {
      var n = t;
      if (!ds(e, t)) {
        if (ro(e)) throw Error(j(418));
        t = xt(n.nextSibling);
        var r = ze;
        t && ds(e, t) ? hc(r, n) : (e.flags = e.flags & -4097 | 2, K = !1, ze = e);
      }
    } else {
      if (ro(e)) throw Error(j(418));
      e.flags = e.flags & -4097 | 2, K = !1, ze = e;
    }
  }
}
function fs(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  ze = e;
}
function Nr(e) {
  if (e !== ze) return !1;
  if (!K) return fs(e), K = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !qi(e.type, e.memoizedProps)), t && (t = Pe)) {
    if (ro(e)) throw mc(), Error(j(418));
    for (; t; ) hc(e, t), t = xt(t.nextSibling);
  }
  if (fs(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(j(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              Pe = xt(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      Pe = null;
    }
  } else Pe = ze ? xt(e.stateNode.nextSibling) : null;
  return !0;
}
function mc() {
  for (var e = Pe; e; ) e = xt(e.nextSibling);
}
function xn() {
  Pe = ze = null, K = !1;
}
function Ko(e) {
  Be === null ? Be = [e] : Be.push(e);
}
var Op = ut.ReactCurrentBatchConfig;
function Ln(e, t, n) {
  if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
    if (n._owner) {
      if (n = n._owner, n) {
        if (n.tag !== 1) throw Error(j(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(j(147, e));
      var l = r, i = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === i ? t.ref : (t = function(o) {
        var a = l.refs;
        o === null ? delete a[i] : a[i] = o;
      }, t._stringRef = i, t);
    }
    if (typeof e != "string") throw Error(j(284));
    if (!n._owner) throw Error(j(290, e));
  }
  return e;
}
function Mr(e, t) {
  throw e = Object.prototype.toString.call(t), Error(j(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function ps(e) {
  var t = e._init;
  return t(e._payload);
}
function gc(e) {
  function t(m, p) {
    if (e) {
      var g = m.deletions;
      g === null ? (m.deletions = [p], m.flags |= 16) : g.push(p);
    }
  }
  function n(m, p) {
    if (!e) return null;
    for (; p !== null; ) t(m, p), p = p.sibling;
    return null;
  }
  function r(m, p) {
    for (m = /* @__PURE__ */ new Map(); p !== null; ) p.key !== null ? m.set(p.key, p) : m.set(p.index, p), p = p.sibling;
    return m;
  }
  function l(m, p) {
    return m = Ct(m, p), m.index = 0, m.sibling = null, m;
  }
  function i(m, p, g) {
    return m.index = g, e ? (g = m.alternate, g !== null ? (g = g.index, g < p ? (m.flags |= 2, p) : g) : (m.flags |= 2, p)) : (m.flags |= 1048576, p);
  }
  function o(m) {
    return e && m.alternate === null && (m.flags |= 2), m;
  }
  function a(m, p, g, x) {
    return p === null || p.tag !== 6 ? (p = xi(g, m.mode, x), p.return = m, p) : (p = l(p, g), p.return = m, p);
  }
  function s(m, p, g, x) {
    var P = g.type;
    return P === Jt ? f(m, p, g.props.children, x, g.key) : p !== null && (p.elementType === P || typeof P == "object" && P !== null && P.$$typeof === dt && ps(P) === p.type) ? (x = l(p, g.props), x.ref = Ln(m, p, g), x.return = m, x) : (x = el(g.type, g.key, g.props, null, m.mode, x), x.ref = Ln(m, p, g), x.return = m, x);
  }
  function u(m, p, g, x) {
    return p === null || p.tag !== 4 || p.stateNode.containerInfo !== g.containerInfo || p.stateNode.implementation !== g.implementation ? (p = Si(g, m.mode, x), p.return = m, p) : (p = l(p, g.children || []), p.return = m, p);
  }
  function f(m, p, g, x, P) {
    return p === null || p.tag !== 7 ? (p = Ft(g, m.mode, x, P), p.return = m, p) : (p = l(p, g), p.return = m, p);
  }
  function h(m, p, g) {
    if (typeof p == "string" && p !== "" || typeof p == "number") return p = xi("" + p, m.mode, g), p.return = m, p;
    if (typeof p == "object" && p !== null) {
      switch (p.$$typeof) {
        case kr:
          return g = el(p.type, p.key, p.props, null, m.mode, g), g.ref = Ln(m, null, p), g.return = m, g;
        case Zt:
          return p = Si(p, m.mode, g), p.return = m, p;
        case dt:
          var x = p._init;
          return h(m, x(p._payload), g);
      }
      if (On(p) || Rn(p)) return p = Ft(p, m.mode, g, null), p.return = m, p;
      Mr(m, p);
    }
    return null;
  }
  function d(m, p, g, x) {
    var P = p !== null ? p.key : null;
    if (typeof g == "string" && g !== "" || typeof g == "number") return P !== null ? null : a(m, p, "" + g, x);
    if (typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case kr:
          return g.key === P ? s(m, p, g, x) : null;
        case Zt:
          return g.key === P ? u(m, p, g, x) : null;
        case dt:
          return P = g._init, d(
            m,
            p,
            P(g._payload),
            x
          );
      }
      if (On(g) || Rn(g)) return P !== null ? null : f(m, p, g, x, null);
      Mr(m, g);
    }
    return null;
  }
  function v(m, p, g, x, P) {
    if (typeof x == "string" && x !== "" || typeof x == "number") return m = m.get(g) || null, a(p, m, "" + x, P);
    if (typeof x == "object" && x !== null) {
      switch (x.$$typeof) {
        case kr:
          return m = m.get(x.key === null ? g : x.key) || null, s(p, m, x, P);
        case Zt:
          return m = m.get(x.key === null ? g : x.key) || null, u(p, m, x, P);
        case dt:
          var C = x._init;
          return v(m, p, g, C(x._payload), P);
      }
      if (On(x) || Rn(x)) return m = m.get(g) || null, f(p, m, x, P, null);
      Mr(p, x);
    }
    return null;
  }
  function y(m, p, g, x) {
    for (var P = null, C = null, k = p, R = p = 0, $ = null; k !== null && R < g.length; R++) {
      k.index > R ? ($ = k, k = null) : $ = k.sibling;
      var M = d(m, k, g[R], x);
      if (M === null) {
        k === null && (k = $);
        break;
      }
      e && k && M.alternate === null && t(m, k), p = i(M, p, R), C === null ? P = M : C.sibling = M, C = M, k = $;
    }
    if (R === g.length) return n(m, k), K && Nt(m, R), P;
    if (k === null) {
      for (; R < g.length; R++) k = h(m, g[R], x), k !== null && (p = i(k, p, R), C === null ? P = k : C.sibling = k, C = k);
      return K && Nt(m, R), P;
    }
    for (k = r(m, k); R < g.length; R++) $ = v(k, m, R, g[R], x), $ !== null && (e && $.alternate !== null && k.delete($.key === null ? R : $.key), p = i($, p, R), C === null ? P = $ : C.sibling = $, C = $);
    return e && k.forEach(function(b) {
      return t(m, b);
    }), K && Nt(m, R), P;
  }
  function S(m, p, g, x) {
    var P = Rn(g);
    if (typeof P != "function") throw Error(j(150));
    if (g = P.call(g), g == null) throw Error(j(151));
    for (var C = P = null, k = p, R = p = 0, $ = null, M = g.next(); k !== null && !M.done; R++, M = g.next()) {
      k.index > R ? ($ = k, k = null) : $ = k.sibling;
      var b = d(m, k, M.value, x);
      if (b === null) {
        k === null && (k = $);
        break;
      }
      e && k && b.alternate === null && t(m, k), p = i(b, p, R), C === null ? P = b : C.sibling = b, C = b, k = $;
    }
    if (M.done) return n(
      m,
      k
    ), K && Nt(m, R), P;
    if (k === null) {
      for (; !M.done; R++, M = g.next()) M = h(m, M.value, x), M !== null && (p = i(M, p, R), C === null ? P = M : C.sibling = M, C = M);
      return K && Nt(m, R), P;
    }
    for (k = r(m, k); !M.done; R++, M = g.next()) M = v(k, m, R, M.value, x), M !== null && (e && M.alternate !== null && k.delete(M.key === null ? R : M.key), p = i(M, p, R), C === null ? P = M : C.sibling = M, C = M);
    return e && k.forEach(function(_) {
      return t(m, _);
    }), K && Nt(m, R), P;
  }
  function D(m, p, g, x) {
    if (typeof g == "object" && g !== null && g.type === Jt && g.key === null && (g = g.props.children), typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case kr:
          e: {
            for (var P = g.key, C = p; C !== null; ) {
              if (C.key === P) {
                if (P = g.type, P === Jt) {
                  if (C.tag === 7) {
                    n(m, C.sibling), p = l(C, g.props.children), p.return = m, m = p;
                    break e;
                  }
                } else if (C.elementType === P || typeof P == "object" && P !== null && P.$$typeof === dt && ps(P) === C.type) {
                  n(m, C.sibling), p = l(C, g.props), p.ref = Ln(m, C, g), p.return = m, m = p;
                  break e;
                }
                n(m, C);
                break;
              } else t(m, C);
              C = C.sibling;
            }
            g.type === Jt ? (p = Ft(g.props.children, m.mode, x, g.key), p.return = m, m = p) : (x = el(g.type, g.key, g.props, null, m.mode, x), x.ref = Ln(m, p, g), x.return = m, m = x);
          }
          return o(m);
        case Zt:
          e: {
            for (C = g.key; p !== null; ) {
              if (p.key === C) if (p.tag === 4 && p.stateNode.containerInfo === g.containerInfo && p.stateNode.implementation === g.implementation) {
                n(m, p.sibling), p = l(p, g.children || []), p.return = m, m = p;
                break e;
              } else {
                n(m, p);
                break;
              }
              else t(m, p);
              p = p.sibling;
            }
            p = Si(g, m.mode, x), p.return = m, m = p;
          }
          return o(m);
        case dt:
          return C = g._init, D(m, p, C(g._payload), x);
      }
      if (On(g)) return y(m, p, g, x);
      if (Rn(g)) return S(m, p, g, x);
      Mr(m, g);
    }
    return typeof g == "string" && g !== "" || typeof g == "number" ? (g = "" + g, p !== null && p.tag === 6 ? (n(m, p.sibling), p = l(p, g), p.return = m, m = p) : (n(m, p), p = xi(g, m.mode, x), p.return = m, m = p), o(m)) : n(m, p);
  }
  return D;
}
var Sn = gc(!0), vc = gc(!1), gl = zt(null), vl = null, an = null, Zo = null;
function Jo() {
  Zo = an = vl = null;
}
function qo(e) {
  var t = gl.current;
  G(gl), e._currentValue = t;
}
function io(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function hn(e, t) {
  vl = e, Zo = an = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (ke = !0), e.firstContext = null);
}
function Ae(e) {
  var t = e._currentValue;
  if (Zo !== e) if (e = { context: e, memoizedValue: t, next: null }, an === null) {
    if (vl === null) throw Error(j(308));
    an = e, vl.dependencies = { lanes: 0, firstContext: e };
  } else an = an.next = e;
  return t;
}
var It = null;
function ea(e) {
  It === null ? It = [e] : It.push(e);
}
function yc(e, t, n, r) {
  var l = t.interleaved;
  return l === null ? (n.next = n, ea(t)) : (n.next = l.next, l.next = n), t.interleaved = n, at(e, r);
}
function at(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
  return n.tag === 3 ? n.stateNode : null;
}
var ft = !1;
function ta(e) {
  e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function wc(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function lt(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function St(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, U & 2) {
    var l = r.pending;
    return l === null ? t.next = t : (t.next = l.next, l.next = t), r.pending = t, at(e, n);
  }
  return l = r.interleaved, l === null ? (t.next = t, ea(r)) : (t.next = l.next, l.next = t), r.interleaved = t, at(e, n);
}
function Xr(e, t, n) {
  if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, Uo(e, n);
  }
}
function hs(e, t) {
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
function yl(e, t, n, r) {
  var l = e.updateQueue;
  ft = !1;
  var i = l.firstBaseUpdate, o = l.lastBaseUpdate, a = l.shared.pending;
  if (a !== null) {
    l.shared.pending = null;
    var s = a, u = s.next;
    s.next = null, o === null ? i = u : o.next = u, o = s;
    var f = e.alternate;
    f !== null && (f = f.updateQueue, a = f.lastBaseUpdate, a !== o && (a === null ? f.firstBaseUpdate = u : a.next = u, f.lastBaseUpdate = s));
  }
  if (i !== null) {
    var h = l.baseState;
    o = 0, f = u = s = null, a = i;
    do {
      var d = a.lane, v = a.eventTime;
      if ((r & d) === d) {
        f !== null && (f = f.next = {
          eventTime: v,
          lane: 0,
          tag: a.tag,
          payload: a.payload,
          callback: a.callback,
          next: null
        });
        e: {
          var y = e, S = a;
          switch (d = t, v = n, S.tag) {
            case 1:
              if (y = S.payload, typeof y == "function") {
                h = y.call(v, h, d);
                break e;
              }
              h = y;
              break e;
            case 3:
              y.flags = y.flags & -65537 | 128;
            case 0:
              if (y = S.payload, d = typeof y == "function" ? y.call(v, h, d) : y, d == null) break e;
              h = q({}, h, d);
              break e;
            case 2:
              ft = !0;
          }
        }
        a.callback !== null && a.lane !== 0 && (e.flags |= 64, d = l.effects, d === null ? l.effects = [a] : d.push(a));
      } else v = { eventTime: v, lane: d, tag: a.tag, payload: a.payload, callback: a.callback, next: null }, f === null ? (u = f = v, s = h) : f = f.next = v, o |= d;
      if (a = a.next, a === null) {
        if (a = l.shared.pending, a === null) break;
        d = a, a = d.next, d.next = null, l.lastBaseUpdate = d, l.shared.pending = null;
      }
    } while (!0);
    if (f === null && (s = h), l.baseState = s, l.firstBaseUpdate = u, l.lastBaseUpdate = f, t = l.shared.interleaved, t !== null) {
      l = t;
      do
        o |= l.lane, l = l.next;
      while (l !== t);
    } else i === null && (l.shared.lanes = 0);
    Bt |= o, e.lanes = o, e.memoizedState = h;
  }
}
function ms(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], l = r.callback;
    if (l !== null) {
      if (r.callback = null, r = n, typeof l != "function") throw Error(j(191, l));
      l.call(r);
    }
  }
}
var wr = {}, Je = zt(wr), sr = zt(wr), ur = zt(wr);
function $t(e) {
  if (e === wr) throw Error(j(174));
  return e;
}
function na(e, t) {
  switch (Y(ur, t), Y(sr, e), Y(Je, wr), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Oi(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Oi(t, e);
  }
  G(Je), Y(Je, t);
}
function kn() {
  G(Je), G(sr), G(ur);
}
function xc(e) {
  $t(ur.current);
  var t = $t(Je.current), n = Oi(t, e.type);
  t !== n && (Y(sr, e), Y(Je, n));
}
function ra(e) {
  sr.current === e && (G(Je), G(sr));
}
var Z = zt(0);
function wl(e) {
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
var hi = [];
function la() {
  for (var e = 0; e < hi.length; e++) hi[e]._workInProgressVersionPrimary = null;
  hi.length = 0;
}
var Gr = ut.ReactCurrentDispatcher, mi = ut.ReactCurrentBatchConfig, bt = 0, J = null, re = null, ie = null, xl = !1, Yn = !1, cr = 0, Up = 0;
function ce() {
  throw Error(j(321));
}
function ia(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!He(e[n], t[n])) return !1;
  return !0;
}
function oa(e, t, n, r, l, i) {
  if (bt = i, J = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Gr.current = e === null || e.memoizedState === null ? Vp : Hp, e = n(r, l), Yn) {
    i = 0;
    do {
      if (Yn = !1, cr = 0, 25 <= i) throw Error(j(301));
      i += 1, ie = re = null, t.updateQueue = null, Gr.current = Qp, e = n(r, l);
    } while (Yn);
  }
  if (Gr.current = Sl, t = re !== null && re.next !== null, bt = 0, ie = re = J = null, xl = !1, t) throw Error(j(300));
  return e;
}
function aa() {
  var e = cr !== 0;
  return cr = 0, e;
}
function Ge() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return ie === null ? J.memoizedState = ie = e : ie = ie.next = e, ie;
}
function Fe() {
  if (re === null) {
    var e = J.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = re.next;
  var t = ie === null ? J.memoizedState : ie.next;
  if (t !== null) ie = t, re = e;
  else {
    if (e === null) throw Error(j(310));
    re = e, e = { memoizedState: re.memoizedState, baseState: re.baseState, baseQueue: re.baseQueue, queue: re.queue, next: null }, ie === null ? J.memoizedState = ie = e : ie = ie.next = e;
  }
  return ie;
}
function dr(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function gi(e) {
  var t = Fe(), n = t.queue;
  if (n === null) throw Error(j(311));
  n.lastRenderedReducer = e;
  var r = re, l = r.baseQueue, i = n.pending;
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
      if ((bt & f) === f) s !== null && (s = s.next = { lane: 0, action: u.action, hasEagerState: u.hasEagerState, eagerState: u.eagerState, next: null }), r = u.hasEagerState ? u.eagerState : e(r, u.action);
      else {
        var h = {
          lane: f,
          action: u.action,
          hasEagerState: u.hasEagerState,
          eagerState: u.eagerState,
          next: null
        };
        s === null ? (a = s = h, o = r) : s = s.next = h, J.lanes |= f, Bt |= f;
      }
      u = u.next;
    } while (u !== null && u !== i);
    s === null ? o = r : s.next = a, He(r, t.memoizedState) || (ke = !0), t.memoizedState = r, t.baseState = o, t.baseQueue = s, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    l = e;
    do
      i = l.lane, J.lanes |= i, Bt |= i, l = l.next;
    while (l !== e);
  } else l === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function vi(e) {
  var t = Fe(), n = t.queue;
  if (n === null) throw Error(j(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch, l = n.pending, i = t.memoizedState;
  if (l !== null) {
    n.pending = null;
    var o = l = l.next;
    do
      i = e(i, o.action), o = o.next;
    while (o !== l);
    He(i, t.memoizedState) || (ke = !0), t.memoizedState = i, t.baseQueue === null && (t.baseState = i), n.lastRenderedState = i;
  }
  return [i, r];
}
function Sc() {
}
function kc(e, t) {
  var n = J, r = Fe(), l = t(), i = !He(r.memoizedState, l);
  if (i && (r.memoizedState = l, ke = !0), r = r.queue, sa(_c.bind(null, n, r, e), [e]), r.getSnapshot !== t || i || ie !== null && ie.memoizedState.tag & 1) {
    if (n.flags |= 2048, fr(9, Cc.bind(null, n, r, l, t), void 0, null), oe === null) throw Error(j(349));
    bt & 30 || Ec(n, t, l);
  }
  return l;
}
function Ec(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = J.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, J.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function Cc(e, t, n, r) {
  t.value = n, t.getSnapshot = r, jc(t) && Pc(e);
}
function _c(e, t, n) {
  return n(function() {
    jc(t) && Pc(e);
  });
}
function jc(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !He(e, n);
  } catch {
    return !0;
  }
}
function Pc(e) {
  var t = at(e, 1);
  t !== null && Ve(t, e, 1, -1);
}
function gs(e) {
  var t = Ge();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: dr, lastRenderedState: e }, t.queue = e, e = e.dispatch = Wp.bind(null, J, e), [t.memoizedState, e];
}
function fr(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = J.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, J.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function zc() {
  return Fe().memoizedState;
}
function Kr(e, t, n, r) {
  var l = Ge();
  J.flags |= e, l.memoizedState = fr(1 | t, n, void 0, r === void 0 ? null : r);
}
function Ll(e, t, n, r) {
  var l = Fe();
  r = r === void 0 ? null : r;
  var i = void 0;
  if (re !== null) {
    var o = re.memoizedState;
    if (i = o.destroy, r !== null && ia(r, o.deps)) {
      l.memoizedState = fr(t, n, i, r);
      return;
    }
  }
  J.flags |= e, l.memoizedState = fr(1 | t, n, i, r);
}
function vs(e, t) {
  return Kr(8390656, 8, e, t);
}
function sa(e, t) {
  return Ll(2048, 8, e, t);
}
function Rc(e, t) {
  return Ll(4, 2, e, t);
}
function Tc(e, t) {
  return Ll(4, 4, e, t);
}
function Dc(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function Nc(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Ll(4, 4, Dc.bind(null, t, e), n);
}
function ua() {
}
function Mc(e, t) {
  var n = Fe();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && ia(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function Lc(e, t) {
  var n = Fe();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && ia(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function Ic(e, t, n) {
  return bt & 21 ? (He(n, t) || (n = Uu(), J.lanes |= n, Bt |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, ke = !0), e.memoizedState = n);
}
function bp(e, t) {
  var n = W;
  W = n !== 0 && 4 > n ? n : 4, e(!0);
  var r = mi.transition;
  mi.transition = {};
  try {
    e(!1), t();
  } finally {
    W = n, mi.transition = r;
  }
}
function $c() {
  return Fe().memoizedState;
}
function Bp(e, t, n) {
  var r = Et(e);
  if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, Ac(e)) Fc(t, n);
  else if (n = yc(e, t, n, r), n !== null) {
    var l = ye();
    Ve(n, e, r, l), Oc(n, t, r);
  }
}
function Wp(e, t, n) {
  var r = Et(e), l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (Ac(e)) Fc(t, l);
  else {
    var i = e.alternate;
    if (e.lanes === 0 && (i === null || i.lanes === 0) && (i = t.lastRenderedReducer, i !== null)) try {
      var o = t.lastRenderedState, a = i(o, n);
      if (l.hasEagerState = !0, l.eagerState = a, He(a, o)) {
        var s = t.interleaved;
        s === null ? (l.next = l, ea(t)) : (l.next = s.next, s.next = l), t.interleaved = l;
        return;
      }
    } catch {
    } finally {
    }
    n = yc(e, t, l, r), n !== null && (l = ye(), Ve(n, e, r, l), Oc(n, t, r));
  }
}
function Ac(e) {
  var t = e.alternate;
  return e === J || t !== null && t === J;
}
function Fc(e, t) {
  Yn = xl = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function Oc(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, Uo(e, n);
  }
}
var Sl = { readContext: Ae, useCallback: ce, useContext: ce, useEffect: ce, useImperativeHandle: ce, useInsertionEffect: ce, useLayoutEffect: ce, useMemo: ce, useReducer: ce, useRef: ce, useState: ce, useDebugValue: ce, useDeferredValue: ce, useTransition: ce, useMutableSource: ce, useSyncExternalStore: ce, useId: ce, unstable_isNewReconciler: !1 }, Vp = { readContext: Ae, useCallback: function(e, t) {
  return Ge().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: Ae, useEffect: vs, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Kr(
    4194308,
    4,
    Dc.bind(null, t, e),
    n
  );
}, useLayoutEffect: function(e, t) {
  return Kr(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return Kr(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = Ge();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = Ge();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = Bp.bind(null, J, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = Ge();
  return e = { current: e }, t.memoizedState = e;
}, useState: gs, useDebugValue: ua, useDeferredValue: function(e) {
  return Ge().memoizedState = e;
}, useTransition: function() {
  var e = gs(!1), t = e[0];
  return e = bp.bind(null, e[1]), Ge().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = J, l = Ge();
  if (K) {
    if (n === void 0) throw Error(j(407));
    n = n();
  } else {
    if (n = t(), oe === null) throw Error(j(349));
    bt & 30 || Ec(r, t, n);
  }
  l.memoizedState = n;
  var i = { value: n, getSnapshot: t };
  return l.queue = i, vs(_c.bind(
    null,
    r,
    i,
    e
  ), [e]), r.flags |= 2048, fr(9, Cc.bind(null, r, i, n, t), void 0, null), n;
}, useId: function() {
  var e = Ge(), t = oe.identifierPrefix;
  if (K) {
    var n = rt, r = nt;
    n = (r & ~(1 << 32 - We(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = cr++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = Up++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: !1 }, Hp = {
  readContext: Ae,
  useCallback: Mc,
  useContext: Ae,
  useEffect: sa,
  useImperativeHandle: Nc,
  useInsertionEffect: Rc,
  useLayoutEffect: Tc,
  useMemo: Lc,
  useReducer: gi,
  useRef: zc,
  useState: function() {
    return gi(dr);
  },
  useDebugValue: ua,
  useDeferredValue: function(e) {
    var t = Fe();
    return Ic(t, re.memoizedState, e);
  },
  useTransition: function() {
    var e = gi(dr)[0], t = Fe().memoizedState;
    return [e, t];
  },
  useMutableSource: Sc,
  useSyncExternalStore: kc,
  useId: $c,
  unstable_isNewReconciler: !1
}, Qp = { readContext: Ae, useCallback: Mc, useContext: Ae, useEffect: sa, useImperativeHandle: Nc, useInsertionEffect: Rc, useLayoutEffect: Tc, useMemo: Lc, useReducer: vi, useRef: zc, useState: function() {
  return vi(dr);
}, useDebugValue: ua, useDeferredValue: function(e) {
  var t = Fe();
  return re === null ? t.memoizedState = e : Ic(t, re.memoizedState, e);
}, useTransition: function() {
  var e = vi(dr)[0], t = Fe().memoizedState;
  return [e, t];
}, useMutableSource: Sc, useSyncExternalStore: kc, useId: $c, unstable_isNewReconciler: !1 };
function Ue(e, t) {
  if (e && e.defaultProps) {
    t = q({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function oo(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : q({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var Il = { isMounted: function(e) {
  return (e = e._reactInternals) ? Ht(e) === e : !1;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = ye(), l = Et(e), i = lt(r, l);
  i.payload = t, n != null && (i.callback = n), t = St(e, i, l), t !== null && (Ve(t, e, l, r), Xr(t, e, l));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = ye(), l = Et(e), i = lt(r, l);
  i.tag = 1, i.payload = t, n != null && (i.callback = n), t = St(e, i, l), t !== null && (Ve(t, e, l, r), Xr(t, e, l));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = ye(), r = Et(e), l = lt(n, r);
  l.tag = 2, t != null && (l.callback = t), t = St(e, l, r), t !== null && (Ve(t, e, r, n), Xr(t, e, r));
} };
function ys(e, t, n, r, l, i, o) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, i, o) : t.prototype && t.prototype.isPureReactComponent ? !lr(n, r) || !lr(l, i) : !0;
}
function Uc(e, t, n) {
  var r = !1, l = jt, i = t.contextType;
  return typeof i == "object" && i !== null ? i = Ae(i) : (l = Ce(t) ? Ot : he.current, r = t.contextTypes, i = (r = r != null) ? wn(e, l) : jt), t = new t(n, i), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = Il, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = l, e.__reactInternalMemoizedMaskedChildContext = i), t;
}
function ws(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Il.enqueueReplaceState(t, t.state, null);
}
function ao(e, t, n, r) {
  var l = e.stateNode;
  l.props = n, l.state = e.memoizedState, l.refs = {}, ta(e);
  var i = t.contextType;
  typeof i == "object" && i !== null ? l.context = Ae(i) : (i = Ce(t) ? Ot : he.current, l.context = wn(e, i)), l.state = e.memoizedState, i = t.getDerivedStateFromProps, typeof i == "function" && (oo(e, t, i, n), l.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof l.getSnapshotBeforeUpdate == "function" || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (t = l.state, typeof l.componentWillMount == "function" && l.componentWillMount(), typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount(), t !== l.state && Il.enqueueReplaceState(l, l.state, null), yl(e, n, l, r), l.state = e.memoizedState), typeof l.componentDidMount == "function" && (e.flags |= 4194308);
}
function En(e, t) {
  try {
    var n = "", r = t;
    do
      n += xf(r), r = r.return;
    while (r);
    var l = n;
  } catch (i) {
    l = `
Error generating stack: ` + i.message + `
` + i.stack;
  }
  return { value: e, source: t, stack: l, digest: null };
}
function yi(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function so(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function() {
      throw n;
    });
  }
}
var Yp = typeof WeakMap == "function" ? WeakMap : Map;
function bc(e, t, n) {
  n = lt(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    El || (El = !0, wo = r), so(e, t);
  }, n;
}
function Bc(e, t, n) {
  n = lt(-1, n), n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var l = t.value;
    n.payload = function() {
      return r(l);
    }, n.callback = function() {
      so(e, t);
    };
  }
  var i = e.stateNode;
  return i !== null && typeof i.componentDidCatch == "function" && (n.callback = function() {
    so(e, t), typeof r != "function" && (kt === null ? kt = /* @__PURE__ */ new Set([this]) : kt.add(this));
    var o = t.stack;
    this.componentDidCatch(t.value, { componentStack: o !== null ? o : "" });
  }), n;
}
function xs(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new Yp();
    var l = /* @__PURE__ */ new Set();
    r.set(t, l);
  } else l = r.get(t), l === void 0 && (l = /* @__PURE__ */ new Set(), r.set(t, l));
  l.has(n) || (l.add(n), e = ah.bind(null, e, t, n), t.then(e, e));
}
function Ss(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function ks(e, t, n, r, l) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = l, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = lt(-1, 1), t.tag = 2, St(n, t, 1))), n.lanes |= 1), e);
}
var Xp = ut.ReactCurrentOwner, ke = !1;
function ve(e, t, n, r) {
  t.child = e === null ? vc(t, null, n, r) : Sn(t, e.child, n, r);
}
function Es(e, t, n, r, l) {
  n = n.render;
  var i = t.ref;
  return hn(t, l), r = oa(e, t, n, r, i, l), n = aa(), e !== null && !ke ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, st(e, t, l)) : (K && n && Xo(t), t.flags |= 1, ve(e, t, r, l), t.child);
}
function Cs(e, t, n, r, l) {
  if (e === null) {
    var i = n.type;
    return typeof i == "function" && !va(i) && i.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = i, Wc(e, t, i, r, l)) : (e = el(n.type, null, r, t, t.mode, l), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (i = e.child, !(e.lanes & l)) {
    var o = i.memoizedProps;
    if (n = n.compare, n = n !== null ? n : lr, n(o, r) && e.ref === t.ref) return st(e, t, l);
  }
  return t.flags |= 1, e = Ct(i, r), e.ref = t.ref, e.return = t, t.child = e;
}
function Wc(e, t, n, r, l) {
  if (e !== null) {
    var i = e.memoizedProps;
    if (lr(i, r) && e.ref === t.ref) if (ke = !1, t.pendingProps = r = i, (e.lanes & l) !== 0) e.flags & 131072 && (ke = !0);
    else return t.lanes = e.lanes, st(e, t, l);
  }
  return uo(e, t, n, r, l);
}
function Vc(e, t, n) {
  var r = t.pendingProps, l = r.children, i = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Y(un, je), je |= n;
  else {
    if (!(n & 1073741824)) return e = i !== null ? i.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, Y(un, je), je |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = i !== null ? i.baseLanes : n, Y(un, je), je |= r;
  }
  else i !== null ? (r = i.baseLanes | n, t.memoizedState = null) : r = n, Y(un, je), je |= r;
  return ve(e, t, l, n), t.child;
}
function Hc(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function uo(e, t, n, r, l) {
  var i = Ce(n) ? Ot : he.current;
  return i = wn(t, i), hn(t, l), n = oa(e, t, n, r, i, l), r = aa(), e !== null && !ke ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, st(e, t, l)) : (K && r && Xo(t), t.flags |= 1, ve(e, t, n, l), t.child);
}
function _s(e, t, n, r, l) {
  if (Ce(n)) {
    var i = !0;
    pl(t);
  } else i = !1;
  if (hn(t, l), t.stateNode === null) Zr(e, t), Uc(t, n, r), ao(t, n, r, l), r = !0;
  else if (e === null) {
    var o = t.stateNode, a = t.memoizedProps;
    o.props = a;
    var s = o.context, u = n.contextType;
    typeof u == "object" && u !== null ? u = Ae(u) : (u = Ce(n) ? Ot : he.current, u = wn(t, u));
    var f = n.getDerivedStateFromProps, h = typeof f == "function" || typeof o.getSnapshotBeforeUpdate == "function";
    h || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (a !== r || s !== u) && ws(t, o, r, u), ft = !1;
    var d = t.memoizedState;
    o.state = d, yl(t, r, o, l), s = t.memoizedState, a !== r || d !== s || Ee.current || ft ? (typeof f == "function" && (oo(t, n, f, r), s = t.memoizedState), (a = ft || ys(t, n, a, r, d, s, u)) ? (h || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = s), o.props = r, o.state = s, o.context = u, r = a) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    o = t.stateNode, wc(e, t), a = t.memoizedProps, u = t.type === t.elementType ? a : Ue(t.type, a), o.props = u, h = t.pendingProps, d = o.context, s = n.contextType, typeof s == "object" && s !== null ? s = Ae(s) : (s = Ce(n) ? Ot : he.current, s = wn(t, s));
    var v = n.getDerivedStateFromProps;
    (f = typeof v == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (a !== h || d !== s) && ws(t, o, r, s), ft = !1, d = t.memoizedState, o.state = d, yl(t, r, o, l);
    var y = t.memoizedState;
    a !== h || d !== y || Ee.current || ft ? (typeof v == "function" && (oo(t, n, v, r), y = t.memoizedState), (u = ft || ys(t, n, u, r, d, y, s) || !1) ? (f || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, y, s), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, y, s)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || a === e.memoizedProps && d === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && d === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = y), o.props = r, o.state = y, o.context = s, r = u) : (typeof o.componentDidUpdate != "function" || a === e.memoizedProps && d === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && d === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return co(e, t, n, r, i, l);
}
function co(e, t, n, r, l, i) {
  Hc(e, t);
  var o = (t.flags & 128) !== 0;
  if (!r && !o) return l && cs(t, n, !1), st(e, t, i);
  r = t.stateNode, Xp.current = t;
  var a = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && o ? (t.child = Sn(t, e.child, null, i), t.child = Sn(t, null, a, i)) : ve(e, t, a, i), t.memoizedState = r.state, l && cs(t, n, !0), t.child;
}
function Qc(e) {
  var t = e.stateNode;
  t.pendingContext ? us(e, t.pendingContext, t.pendingContext !== t.context) : t.context && us(e, t.context, !1), na(e, t.containerInfo);
}
function js(e, t, n, r, l) {
  return xn(), Ko(l), t.flags |= 256, ve(e, t, n, r), t.child;
}
var fo = { dehydrated: null, treeContext: null, retryLane: 0 };
function po(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function Yc(e, t, n) {
  var r = t.pendingProps, l = Z.current, i = !1, o = (t.flags & 128) !== 0, a;
  if ((a = o) || (a = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0), a ? (i = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (l |= 1), Y(Z, l & 1), e === null)
    return lo(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (o = r.children, e = r.fallback, i ? (r = t.mode, i = t.child, o = { mode: "hidden", children: o }, !(r & 1) && i !== null ? (i.childLanes = 0, i.pendingProps = o) : i = Fl(o, r, 0, null), e = Ft(e, r, n, null), i.return = t, e.return = t, i.sibling = e, t.child = i, t.child.memoizedState = po(n), t.memoizedState = fo, e) : ca(t, o));
  if (l = e.memoizedState, l !== null && (a = l.dehydrated, a !== null)) return Gp(e, t, o, r, a, l, n);
  if (i) {
    i = r.fallback, o = t.mode, l = e.child, a = l.sibling;
    var s = { mode: "hidden", children: r.children };
    return !(o & 1) && t.child !== l ? (r = t.child, r.childLanes = 0, r.pendingProps = s, t.deletions = null) : (r = Ct(l, s), r.subtreeFlags = l.subtreeFlags & 14680064), a !== null ? i = Ct(a, i) : (i = Ft(i, o, n, null), i.flags |= 2), i.return = t, r.return = t, r.sibling = i, t.child = r, r = i, i = t.child, o = e.child.memoizedState, o = o === null ? po(n) : { baseLanes: o.baseLanes | n, cachePool: null, transitions: o.transitions }, i.memoizedState = o, i.childLanes = e.childLanes & ~n, t.memoizedState = fo, r;
  }
  return i = e.child, e = i.sibling, r = Ct(i, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function ca(e, t) {
  return t = Fl({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function Lr(e, t, n, r) {
  return r !== null && Ko(r), Sn(t, e.child, null, n), e = ca(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function Gp(e, t, n, r, l, i, o) {
  if (n)
    return t.flags & 256 ? (t.flags &= -257, r = yi(Error(j(422))), Lr(e, t, o, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (i = r.fallback, l = t.mode, r = Fl({ mode: "visible", children: r.children }, l, 0, null), i = Ft(i, l, o, null), i.flags |= 2, r.return = t, i.return = t, r.sibling = i, t.child = r, t.mode & 1 && Sn(t, e.child, null, o), t.child.memoizedState = po(o), t.memoizedState = fo, i);
  if (!(t.mode & 1)) return Lr(e, t, o, null);
  if (l.data === "$!") {
    if (r = l.nextSibling && l.nextSibling.dataset, r) var a = r.dgst;
    return r = a, i = Error(j(419)), r = yi(i, r, void 0), Lr(e, t, o, r);
  }
  if (a = (o & e.childLanes) !== 0, ke || a) {
    if (r = oe, r !== null) {
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
      l = l & (r.suspendedLanes | o) ? 0 : l, l !== 0 && l !== i.retryLane && (i.retryLane = l, at(e, l), Ve(r, e, l, -1));
    }
    return ga(), r = yi(Error(j(421))), Lr(e, t, o, r);
  }
  return l.data === "$?" ? (t.flags |= 128, t.child = e.child, t = sh.bind(null, e), l._reactRetry = t, null) : (e = i.treeContext, Pe = xt(l.nextSibling), ze = t, K = !0, Be = null, e !== null && (Me[Le++] = nt, Me[Le++] = rt, Me[Le++] = Ut, nt = e.id, rt = e.overflow, Ut = t), t = ca(t, r.children), t.flags |= 4096, t);
}
function Ps(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), io(e.return, t, n);
}
function wi(e, t, n, r, l) {
  var i = e.memoizedState;
  i === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: l } : (i.isBackwards = t, i.rendering = null, i.renderingStartTime = 0, i.last = r, i.tail = n, i.tailMode = l);
}
function Xc(e, t, n) {
  var r = t.pendingProps, l = r.revealOrder, i = r.tail;
  if (ve(e, t, r.children, n), r = Z.current, r & 2) r = r & 1 | 2, t.flags |= 128;
  else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && Ps(e, n, t);
      else if (e.tag === 19) Ps(e, n, t);
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
  if (Y(Z, r), !(t.mode & 1)) t.memoizedState = null;
  else switch (l) {
    case "forwards":
      for (n = t.child, l = null; n !== null; ) e = n.alternate, e !== null && wl(e) === null && (l = n), n = n.sibling;
      n = l, n === null ? (l = t.child, t.child = null) : (l = n.sibling, n.sibling = null), wi(t, !1, l, n, i);
      break;
    case "backwards":
      for (n = null, l = t.child, t.child = null; l !== null; ) {
        if (e = l.alternate, e !== null && wl(e) === null) {
          t.child = l;
          break;
        }
        e = l.sibling, l.sibling = n, n = l, l = e;
      }
      wi(t, !0, n, null, i);
      break;
    case "together":
      wi(t, !1, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function Zr(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
}
function st(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), Bt |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(j(153));
  if (t.child !== null) {
    for (e = t.child, n = Ct(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = Ct(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function Kp(e, t, n) {
  switch (t.tag) {
    case 3:
      Qc(t), xn();
      break;
    case 5:
      xc(t);
      break;
    case 1:
      Ce(t.type) && pl(t);
      break;
    case 4:
      na(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, l = t.memoizedProps.value;
      Y(gl, r._currentValue), r._currentValue = l;
      break;
    case 13:
      if (r = t.memoizedState, r !== null)
        return r.dehydrated !== null ? (Y(Z, Z.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? Yc(e, t, n) : (Y(Z, Z.current & 1), e = st(e, t, n), e !== null ? e.sibling : null);
      Y(Z, Z.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return Xc(e, t, n);
        t.flags |= 128;
      }
      if (l = t.memoizedState, l !== null && (l.rendering = null, l.tail = null, l.lastEffect = null), Y(Z, Z.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, Vc(e, t, n);
  }
  return st(e, t, n);
}
var Gc, ho, Kc, Zc;
Gc = function(e, t) {
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
ho = function() {
};
Kc = function(e, t, n, r) {
  var l = e.memoizedProps;
  if (l !== r) {
    e = t.stateNode, $t(Je.current);
    var i = null;
    switch (n) {
      case "input":
        l = Ii(e, l), r = Ii(e, r), i = [];
        break;
      case "select":
        l = q({}, l, { value: void 0 }), r = q({}, r, { value: void 0 }), i = [];
        break;
      case "textarea":
        l = Fi(e, l), r = Fi(e, r), i = [];
        break;
      default:
        typeof l.onClick != "function" && typeof r.onClick == "function" && (e.onclick = dl);
    }
    Ui(n, r);
    var o;
    n = null;
    for (u in l) if (!r.hasOwnProperty(u) && l.hasOwnProperty(u) && l[u] != null) if (u === "style") {
      var a = l[u];
      for (o in a) a.hasOwnProperty(o) && (n || (n = {}), n[o] = "");
    } else u !== "dangerouslySetInnerHTML" && u !== "children" && u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && u !== "autoFocus" && (Zn.hasOwnProperty(u) ? i || (i = []) : (i = i || []).push(u, null));
    for (u in r) {
      var s = r[u];
      if (a = l != null ? l[u] : void 0, r.hasOwnProperty(u) && s !== a && (s != null || a != null)) if (u === "style") if (a) {
        for (o in a) !a.hasOwnProperty(o) || s && s.hasOwnProperty(o) || (n || (n = {}), n[o] = "");
        for (o in s) s.hasOwnProperty(o) && a[o] !== s[o] && (n || (n = {}), n[o] = s[o]);
      } else n || (i || (i = []), i.push(
        u,
        n
      )), n = s;
      else u === "dangerouslySetInnerHTML" ? (s = s ? s.__html : void 0, a = a ? a.__html : void 0, s != null && a !== s && (i = i || []).push(u, s)) : u === "children" ? typeof s != "string" && typeof s != "number" || (i = i || []).push(u, "" + s) : u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && (Zn.hasOwnProperty(u) ? (s != null && u === "onScroll" && X("scroll", e), i || a === s || (i = [])) : (i = i || []).push(u, s));
    }
    n && (i = i || []).push("style", n);
    var u = i;
    (t.updateQueue = u) && (t.flags |= 4);
  }
};
Zc = function(e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function In(e, t) {
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
function de(e) {
  var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
  if (t) for (var l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags & 14680064, r |= l.flags & 14680064, l.return = e, l = l.sibling;
  else for (l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags, r |= l.flags, l.return = e, l = l.sibling;
  return e.subtreeFlags |= r, e.childLanes = n, t;
}
function Zp(e, t, n) {
  var r = t.pendingProps;
  switch (Go(t), t.tag) {
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
      return de(t), null;
    case 1:
      return Ce(t.type) && fl(), de(t), null;
    case 3:
      return r = t.stateNode, kn(), G(Ee), G(he), la(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (Nr(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Be !== null && (ko(Be), Be = null))), ho(e, t), de(t), null;
    case 5:
      ra(t);
      var l = $t(ur.current);
      if (n = t.type, e !== null && t.stateNode != null) Kc(e, t, n, r, l), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(j(166));
          return de(t), null;
        }
        if (e = $t(Je.current), Nr(t)) {
          r = t.stateNode, n = t.type;
          var i = t.memoizedProps;
          switch (r[Ke] = t, r[ar] = i, e = (t.mode & 1) !== 0, n) {
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
              for (l = 0; l < bn.length; l++) X(bn[l], r);
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
              $a(r, i), X("invalid", r);
              break;
            case "select":
              r._wrapperState = { wasMultiple: !!i.multiple }, X("invalid", r);
              break;
            case "textarea":
              Fa(r, i), X("invalid", r);
          }
          Ui(n, i), l = null;
          for (var o in i) if (i.hasOwnProperty(o)) {
            var a = i[o];
            o === "children" ? typeof a == "string" ? r.textContent !== a && (i.suppressHydrationWarning !== !0 && Dr(r.textContent, a, e), l = ["children", a]) : typeof a == "number" && r.textContent !== "" + a && (i.suppressHydrationWarning !== !0 && Dr(
              r.textContent,
              a,
              e
            ), l = ["children", "" + a]) : Zn.hasOwnProperty(o) && a != null && o === "onScroll" && X("scroll", r);
          }
          switch (n) {
            case "input":
              Er(r), Aa(r, i, !0);
              break;
            case "textarea":
              Er(r), Oa(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof i.onClick == "function" && (r.onclick = dl);
          }
          r = l, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          o = l.nodeType === 9 ? l : l.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = _u(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = o.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = o.createElement(n, { is: r.is }) : (e = o.createElement(n), n === "select" && (o = e, r.multiple ? o.multiple = !0 : r.size && (o.size = r.size))) : e = o.createElementNS(e, n), e[Ke] = t, e[ar] = r, Gc(e, t, !1, !1), t.stateNode = e;
          e: {
            switch (o = bi(n, r), n) {
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
                for (l = 0; l < bn.length; l++) X(bn[l], e);
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
                $a(e, r), l = Ii(e, r), X("invalid", e);
                break;
              case "option":
                l = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, l = q({}, r, { value: void 0 }), X("invalid", e);
                break;
              case "textarea":
                Fa(e, r), l = Fi(e, r), X("invalid", e);
                break;
              default:
                l = r;
            }
            Ui(n, l), a = l;
            for (i in a) if (a.hasOwnProperty(i)) {
              var s = a[i];
              i === "style" ? zu(e, s) : i === "dangerouslySetInnerHTML" ? (s = s ? s.__html : void 0, s != null && ju(e, s)) : i === "children" ? typeof s == "string" ? (n !== "textarea" || s !== "") && Jn(e, s) : typeof s == "number" && Jn(e, "" + s) : i !== "suppressContentEditableWarning" && i !== "suppressHydrationWarning" && i !== "autoFocus" && (Zn.hasOwnProperty(i) ? s != null && i === "onScroll" && X("scroll", e) : s != null && Lo(e, i, s, o));
            }
            switch (n) {
              case "input":
                Er(e), Aa(e, r, !1);
                break;
              case "textarea":
                Er(e), Oa(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + _t(r.value));
                break;
              case "select":
                e.multiple = !!r.multiple, i = r.value, i != null ? cn(e, !!r.multiple, i, !1) : r.defaultValue != null && cn(
                  e,
                  !!r.multiple,
                  r.defaultValue,
                  !0
                );
                break;
              default:
                typeof l.onClick == "function" && (e.onclick = dl);
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
      return de(t), null;
    case 6:
      if (e && t.stateNode != null) Zc(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(j(166));
        if (n = $t(ur.current), $t(Je.current), Nr(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[Ke] = t, (i = r.nodeValue !== n) && (e = ze, e !== null)) switch (e.tag) {
            case 3:
              Dr(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && Dr(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          i && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[Ke] = t, t.stateNode = r;
      }
      return de(t), null;
    case 13:
      if (G(Z), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (K && Pe !== null && t.mode & 1 && !(t.flags & 128)) mc(), xn(), t.flags |= 98560, i = !1;
        else if (i = Nr(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!i) throw Error(j(318));
            if (i = t.memoizedState, i = i !== null ? i.dehydrated : null, !i) throw Error(j(317));
            i[Ke] = t;
          } else xn(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          de(t), i = !1;
        } else Be !== null && (ko(Be), Be = null), i = !0;
        if (!i) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || Z.current & 1 ? le === 0 && (le = 3) : ga())), t.updateQueue !== null && (t.flags |= 4), de(t), null);
    case 4:
      return kn(), ho(e, t), e === null && ir(t.stateNode.containerInfo), de(t), null;
    case 10:
      return qo(t.type._context), de(t), null;
    case 17:
      return Ce(t.type) && fl(), de(t), null;
    case 19:
      if (G(Z), i = t.memoizedState, i === null) return de(t), null;
      if (r = (t.flags & 128) !== 0, o = i.rendering, o === null) if (r) In(i, !1);
      else {
        if (le !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (o = wl(e), o !== null) {
            for (t.flags |= 128, In(i, !1), r = o.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) i = n, e = r, i.flags &= 14680066, o = i.alternate, o === null ? (i.childLanes = 0, i.lanes = e, i.child = null, i.subtreeFlags = 0, i.memoizedProps = null, i.memoizedState = null, i.updateQueue = null, i.dependencies = null, i.stateNode = null) : (i.childLanes = o.childLanes, i.lanes = o.lanes, i.child = o.child, i.subtreeFlags = 0, i.deletions = null, i.memoizedProps = o.memoizedProps, i.memoizedState = o.memoizedState, i.updateQueue = o.updateQueue, i.type = o.type, e = o.dependencies, i.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return Y(Z, Z.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        i.tail !== null && te() > Cn && (t.flags |= 128, r = !0, In(i, !1), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = wl(o), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), In(i, !0), i.tail === null && i.tailMode === "hidden" && !o.alternate && !K) return de(t), null;
        } else 2 * te() - i.renderingStartTime > Cn && n !== 1073741824 && (t.flags |= 128, r = !0, In(i, !1), t.lanes = 4194304);
        i.isBackwards ? (o.sibling = t.child, t.child = o) : (n = i.last, n !== null ? n.sibling = o : t.child = o, i.last = o);
      }
      return i.tail !== null ? (t = i.tail, i.rendering = t, i.tail = t.sibling, i.renderingStartTime = te(), t.sibling = null, n = Z.current, Y(Z, r ? n & 1 | 2 : n & 1), t) : (de(t), null);
    case 22:
    case 23:
      return ma(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? je & 1073741824 && (de(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : de(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(j(156, t.tag));
}
function Jp(e, t) {
  switch (Go(t), t.tag) {
    case 1:
      return Ce(t.type) && fl(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return kn(), G(Ee), G(he), la(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return ra(t), null;
    case 13:
      if (G(Z), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(j(340));
        xn();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return G(Z), null;
    case 4:
      return kn(), null;
    case 10:
      return qo(t.type._context), null;
    case 22:
    case 23:
      return ma(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var Ir = !1, fe = !1, qp = typeof WeakSet == "function" ? WeakSet : Set, N = null;
function sn(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    ee(e, t, r);
  }
  else n.current = null;
}
function mo(e, t, n) {
  try {
    n();
  } catch (r) {
    ee(e, t, r);
  }
}
var zs = !1;
function eh(e, t) {
  if (Zi = sl, e = nc(), Yo(e)) {
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
        var o = 0, a = -1, s = -1, u = 0, f = 0, h = e, d = null;
        t: for (; ; ) {
          for (var v; h !== n || l !== 0 && h.nodeType !== 3 || (a = o + l), h !== i || r !== 0 && h.nodeType !== 3 || (s = o + r), h.nodeType === 3 && (o += h.nodeValue.length), (v = h.firstChild) !== null; )
            d = h, h = v;
          for (; ; ) {
            if (h === e) break t;
            if (d === n && ++u === l && (a = o), d === i && ++f === r && (s = o), (v = h.nextSibling) !== null) break;
            h = d, d = h.parentNode;
          }
          h = v;
        }
        n = a === -1 || s === -1 ? null : { start: a, end: s };
      } else n = null;
    }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (Ji = { focusedElem: e, selectionRange: n }, sl = !1, N = t; N !== null; ) if (t = N, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, N = e;
  else for (; N !== null; ) {
    t = N;
    try {
      var y = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (y !== null) {
            var S = y.memoizedProps, D = y.memoizedState, m = t.stateNode, p = m.getSnapshotBeforeUpdate(t.elementType === t.type ? S : Ue(t.type, S), D);
            m.__reactInternalSnapshotBeforeUpdate = p;
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
          throw Error(j(163));
      }
    } catch (x) {
      ee(t, t.return, x);
    }
    if (e = t.sibling, e !== null) {
      e.return = t.return, N = e;
      break;
    }
    N = t.return;
  }
  return y = zs, zs = !1, y;
}
function Xn(e, t, n) {
  var r = t.updateQueue;
  if (r = r !== null ? r.lastEffect : null, r !== null) {
    var l = r = r.next;
    do {
      if ((l.tag & e) === e) {
        var i = l.destroy;
        l.destroy = void 0, i !== void 0 && mo(t, n, i);
      }
      l = l.next;
    } while (l !== r);
  }
}
function $l(e, t) {
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
function go(e) {
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
function Jc(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, Jc(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Ke], delete t[ar], delete t[to], delete t[$p], delete t[Ap])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function qc(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Rs(e) {
  e: for (; ; ) {
    for (; e.sibling === null; ) {
      if (e.return === null || qc(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      e.child.return = e, e = e.child;
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function vo(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = dl));
  else if (r !== 4 && (e = e.child, e !== null)) for (vo(e, t, n), e = e.sibling; e !== null; ) vo(e, t, n), e = e.sibling;
}
function yo(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child, e !== null)) for (yo(e, t, n), e = e.sibling; e !== null; ) yo(e, t, n), e = e.sibling;
}
var ae = null, be = !1;
function ct(e, t, n) {
  for (n = n.child; n !== null; ) ed(e, t, n), n = n.sibling;
}
function ed(e, t, n) {
  if (Ze && typeof Ze.onCommitFiberUnmount == "function") try {
    Ze.onCommitFiberUnmount(zl, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      fe || sn(n, t);
    case 6:
      var r = ae, l = be;
      ae = null, ct(e, t, n), ae = r, be = l, ae !== null && (be ? (e = ae, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : ae.removeChild(n.stateNode));
      break;
    case 18:
      ae !== null && (be ? (e = ae, n = n.stateNode, e.nodeType === 8 ? fi(e.parentNode, n) : e.nodeType === 1 && fi(e, n), nr(e)) : fi(ae, n.stateNode));
      break;
    case 4:
      r = ae, l = be, ae = n.stateNode.containerInfo, be = !0, ct(e, t, n), ae = r, be = l;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!fe && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        l = r = r.next;
        do {
          var i = l, o = i.destroy;
          i = i.tag, o !== void 0 && (i & 2 || i & 4) && mo(n, t, o), l = l.next;
        } while (l !== r);
      }
      ct(e, t, n);
      break;
    case 1:
      if (!fe && (sn(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
        r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
      } catch (a) {
        ee(n, t, a);
      }
      ct(e, t, n);
      break;
    case 21:
      ct(e, t, n);
      break;
    case 22:
      n.mode & 1 ? (fe = (r = fe) || n.memoizedState !== null, ct(e, t, n), fe = r) : ct(e, t, n);
      break;
    default:
      ct(e, t, n);
  }
}
function Ts(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new qp()), t.forEach(function(r) {
      var l = uh.bind(null, e, r);
      n.has(r) || (n.add(r), r.then(l, l));
    });
  }
}
function Oe(e, t) {
  var n = t.deletions;
  if (n !== null) for (var r = 0; r < n.length; r++) {
    var l = n[r];
    try {
      var i = e, o = t, a = o;
      e: for (; a !== null; ) {
        switch (a.tag) {
          case 5:
            ae = a.stateNode, be = !1;
            break e;
          case 3:
            ae = a.stateNode.containerInfo, be = !0;
            break e;
          case 4:
            ae = a.stateNode.containerInfo, be = !0;
            break e;
        }
        a = a.return;
      }
      if (ae === null) throw Error(j(160));
      ed(i, o, l), ae = null, be = !1;
      var s = l.alternate;
      s !== null && (s.return = null), l.return = null;
    } catch (u) {
      ee(l, t, u);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) td(t, e), t = t.sibling;
}
function td(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (Oe(t, e), Ye(e), r & 4) {
        try {
          Xn(3, e, e.return), $l(3, e);
        } catch (S) {
          ee(e, e.return, S);
        }
        try {
          Xn(5, e, e.return);
        } catch (S) {
          ee(e, e.return, S);
        }
      }
      break;
    case 1:
      Oe(t, e), Ye(e), r & 512 && n !== null && sn(n, n.return);
      break;
    case 5:
      if (Oe(t, e), Ye(e), r & 512 && n !== null && sn(n, n.return), e.flags & 32) {
        var l = e.stateNode;
        try {
          Jn(l, "");
        } catch (S) {
          ee(e, e.return, S);
        }
      }
      if (r & 4 && (l = e.stateNode, l != null)) {
        var i = e.memoizedProps, o = n !== null ? n.memoizedProps : i, a = e.type, s = e.updateQueue;
        if (e.updateQueue = null, s !== null) try {
          a === "input" && i.type === "radio" && i.name != null && Eu(l, i), bi(a, o);
          var u = bi(a, i);
          for (o = 0; o < s.length; o += 2) {
            var f = s[o], h = s[o + 1];
            f === "style" ? zu(l, h) : f === "dangerouslySetInnerHTML" ? ju(l, h) : f === "children" ? Jn(l, h) : Lo(l, f, h, u);
          }
          switch (a) {
            case "input":
              $i(l, i);
              break;
            case "textarea":
              Cu(l, i);
              break;
            case "select":
              var d = l._wrapperState.wasMultiple;
              l._wrapperState.wasMultiple = !!i.multiple;
              var v = i.value;
              v != null ? cn(l, !!i.multiple, v, !1) : d !== !!i.multiple && (i.defaultValue != null ? cn(
                l,
                !!i.multiple,
                i.defaultValue,
                !0
              ) : cn(l, !!i.multiple, i.multiple ? [] : "", !1));
          }
          l[ar] = i;
        } catch (S) {
          ee(e, e.return, S);
        }
      }
      break;
    case 6:
      if (Oe(t, e), Ye(e), r & 4) {
        if (e.stateNode === null) throw Error(j(162));
        l = e.stateNode, i = e.memoizedProps;
        try {
          l.nodeValue = i;
        } catch (S) {
          ee(e, e.return, S);
        }
      }
      break;
    case 3:
      if (Oe(t, e), Ye(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        nr(t.containerInfo);
      } catch (S) {
        ee(e, e.return, S);
      }
      break;
    case 4:
      Oe(t, e), Ye(e);
      break;
    case 13:
      Oe(t, e), Ye(e), l = e.child, l.flags & 8192 && (i = l.memoizedState !== null, l.stateNode.isHidden = i, !i || l.alternate !== null && l.alternate.memoizedState !== null || (pa = te())), r & 4 && Ts(e);
      break;
    case 22:
      if (f = n !== null && n.memoizedState !== null, e.mode & 1 ? (fe = (u = fe) || f, Oe(t, e), fe = u) : Oe(t, e), Ye(e), r & 8192) {
        if (u = e.memoizedState !== null, (e.stateNode.isHidden = u) && !f && e.mode & 1) for (N = e, f = e.child; f !== null; ) {
          for (h = N = f; N !== null; ) {
            switch (d = N, v = d.child, d.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                Xn(4, d, d.return);
                break;
              case 1:
                sn(d, d.return);
                var y = d.stateNode;
                if (typeof y.componentWillUnmount == "function") {
                  r = d, n = d.return;
                  try {
                    t = r, y.props = t.memoizedProps, y.state = t.memoizedState, y.componentWillUnmount();
                  } catch (S) {
                    ee(r, n, S);
                  }
                }
                break;
              case 5:
                sn(d, d.return);
                break;
              case 22:
                if (d.memoizedState !== null) {
                  Ns(h);
                  continue;
                }
            }
            v !== null ? (v.return = d, N = v) : Ns(h);
          }
          f = f.sibling;
        }
        e: for (f = null, h = e; ; ) {
          if (h.tag === 5) {
            if (f === null) {
              f = h;
              try {
                l = h.stateNode, u ? (i = l.style, typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none") : (a = h.stateNode, s = h.memoizedProps.style, o = s != null && s.hasOwnProperty("display") ? s.display : null, a.style.display = Pu("display", o));
              } catch (S) {
                ee(e, e.return, S);
              }
            }
          } else if (h.tag === 6) {
            if (f === null) try {
              h.stateNode.nodeValue = u ? "" : h.memoizedProps;
            } catch (S) {
              ee(e, e.return, S);
            }
          } else if ((h.tag !== 22 && h.tag !== 23 || h.memoizedState === null || h === e) && h.child !== null) {
            h.child.return = h, h = h.child;
            continue;
          }
          if (h === e) break e;
          for (; h.sibling === null; ) {
            if (h.return === null || h.return === e) break e;
            f === h && (f = null), h = h.return;
          }
          f === h && (f = null), h.sibling.return = h.return, h = h.sibling;
        }
      }
      break;
    case 19:
      Oe(t, e), Ye(e), r & 4 && Ts(e);
      break;
    case 21:
      break;
    default:
      Oe(
        t,
        e
      ), Ye(e);
  }
}
function Ye(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (qc(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(j(160));
      }
      switch (r.tag) {
        case 5:
          var l = r.stateNode;
          r.flags & 32 && (Jn(l, ""), r.flags &= -33);
          var i = Rs(e);
          yo(e, i, l);
          break;
        case 3:
        case 4:
          var o = r.stateNode.containerInfo, a = Rs(e);
          vo(e, a, o);
          break;
        default:
          throw Error(j(161));
      }
    } catch (s) {
      ee(e, e.return, s);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function th(e, t, n) {
  N = e, nd(e);
}
function nd(e, t, n) {
  for (var r = (e.mode & 1) !== 0; N !== null; ) {
    var l = N, i = l.child;
    if (l.tag === 22 && r) {
      var o = l.memoizedState !== null || Ir;
      if (!o) {
        var a = l.alternate, s = a !== null && a.memoizedState !== null || fe;
        a = Ir;
        var u = fe;
        if (Ir = o, (fe = s) && !u) for (N = l; N !== null; ) o = N, s = o.child, o.tag === 22 && o.memoizedState !== null ? Ms(l) : s !== null ? (s.return = o, N = s) : Ms(l);
        for (; i !== null; ) N = i, nd(i), i = i.sibling;
        N = l, Ir = a, fe = u;
      }
      Ds(e);
    } else l.subtreeFlags & 8772 && i !== null ? (i.return = l, N = i) : Ds(e);
  }
}
function Ds(e) {
  for (; N !== null; ) {
    var t = N;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            fe || $l(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !fe) if (n === null) r.componentDidMount();
            else {
              var l = t.elementType === t.type ? n.memoizedProps : Ue(t.type, n.memoizedProps);
              r.componentDidUpdate(l, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var i = t.updateQueue;
            i !== null && ms(t, i, r);
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
              ms(t, o, n);
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
                  var h = f.dehydrated;
                  h !== null && nr(h);
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
            throw Error(j(163));
        }
        fe || t.flags & 512 && go(t);
      } catch (d) {
        ee(t, t.return, d);
      }
    }
    if (t === e) {
      N = null;
      break;
    }
    if (n = t.sibling, n !== null) {
      n.return = t.return, N = n;
      break;
    }
    N = t.return;
  }
}
function Ns(e) {
  for (; N !== null; ) {
    var t = N;
    if (t === e) {
      N = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      n.return = t.return, N = n;
      break;
    }
    N = t.return;
  }
}
function Ms(e) {
  for (; N !== null; ) {
    var t = N;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            $l(4, t);
          } catch (s) {
            ee(t, n, s);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var l = t.return;
            try {
              r.componentDidMount();
            } catch (s) {
              ee(t, l, s);
            }
          }
          var i = t.return;
          try {
            go(t);
          } catch (s) {
            ee(t, i, s);
          }
          break;
        case 5:
          var o = t.return;
          try {
            go(t);
          } catch (s) {
            ee(t, o, s);
          }
      }
    } catch (s) {
      ee(t, t.return, s);
    }
    if (t === e) {
      N = null;
      break;
    }
    var a = t.sibling;
    if (a !== null) {
      a.return = t.return, N = a;
      break;
    }
    N = t.return;
  }
}
var nh = Math.ceil, kl = ut.ReactCurrentDispatcher, da = ut.ReactCurrentOwner, $e = ut.ReactCurrentBatchConfig, U = 0, oe = null, ne = null, se = 0, je = 0, un = zt(0), le = 0, pr = null, Bt = 0, Al = 0, fa = 0, Gn = null, Se = null, pa = 0, Cn = 1 / 0, et = null, El = !1, wo = null, kt = null, $r = !1, gt = null, Cl = 0, Kn = 0, xo = null, Jr = -1, qr = 0;
function ye() {
  return U & 6 ? te() : Jr !== -1 ? Jr : Jr = te();
}
function Et(e) {
  return e.mode & 1 ? U & 2 && se !== 0 ? se & -se : Op.transition !== null ? (qr === 0 && (qr = Uu()), qr) : (e = W, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Yu(e.type)), e) : 1;
}
function Ve(e, t, n, r) {
  if (50 < Kn) throw Kn = 0, xo = null, Error(j(185));
  gr(e, n, r), (!(U & 2) || e !== oe) && (e === oe && (!(U & 2) && (Al |= n), le === 4 && ht(e, se)), _e(e, r), n === 1 && U === 0 && !(t.mode & 1) && (Cn = te() + 500, Ml && Rt()));
}
function _e(e, t) {
  var n = e.callbackNode;
  Of(e, t);
  var r = al(e, e === oe ? se : 0);
  if (r === 0) n !== null && Ba(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && Ba(n), t === 1) e.tag === 0 ? Fp(Ls.bind(null, e)) : fc(Ls.bind(null, e)), Lp(function() {
      !(U & 6) && Rt();
    }), n = null;
    else {
      switch (bu(r)) {
        case 1:
          n = Oo;
          break;
        case 4:
          n = Fu;
          break;
        case 16:
          n = ol;
          break;
        case 536870912:
          n = Ou;
          break;
        default:
          n = ol;
      }
      n = cd(n, rd.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function rd(e, t) {
  if (Jr = -1, qr = 0, U & 6) throw Error(j(327));
  var n = e.callbackNode;
  if (mn() && e.callbackNode !== n) return null;
  var r = al(e, e === oe ? se : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = _l(e, r);
  else {
    t = r;
    var l = U;
    U |= 2;
    var i = id();
    (oe !== e || se !== t) && (et = null, Cn = te() + 500, At(e, t));
    do
      try {
        ih();
        break;
      } catch (a) {
        ld(e, a);
      }
    while (!0);
    Jo(), kl.current = i, U = l, ne !== null ? t = 0 : (oe = null, se = 0, t = le);
  }
  if (t !== 0) {
    if (t === 2 && (l = Qi(e), l !== 0 && (r = l, t = So(e, l))), t === 1) throw n = pr, At(e, 0), ht(e, r), _e(e, te()), n;
    if (t === 6) ht(e, r);
    else {
      if (l = e.current.alternate, !(r & 30) && !rh(l) && (t = _l(e, r), t === 2 && (i = Qi(e), i !== 0 && (r = i, t = So(e, i))), t === 1)) throw n = pr, At(e, 0), ht(e, r), _e(e, te()), n;
      switch (e.finishedWork = l, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(j(345));
        case 2:
          Mt(e, Se, et);
          break;
        case 3:
          if (ht(e, r), (r & 130023424) === r && (t = pa + 500 - te(), 10 < t)) {
            if (al(e, 0) !== 0) break;
            if (l = e.suspendedLanes, (l & r) !== r) {
              ye(), e.pingedLanes |= e.suspendedLanes & l;
              break;
            }
            e.timeoutHandle = eo(Mt.bind(null, e, Se, et), t);
            break;
          }
          Mt(e, Se, et);
          break;
        case 4:
          if (ht(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, l = -1; 0 < r; ) {
            var o = 31 - We(r);
            i = 1 << o, o = t[o], o > l && (l = o), r &= ~i;
          }
          if (r = l, r = te() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * nh(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = eo(Mt.bind(null, e, Se, et), r);
            break;
          }
          Mt(e, Se, et);
          break;
        case 5:
          Mt(e, Se, et);
          break;
        default:
          throw Error(j(329));
      }
    }
  }
  return _e(e, te()), e.callbackNode === n ? rd.bind(null, e) : null;
}
function So(e, t) {
  var n = Gn;
  return e.current.memoizedState.isDehydrated && (At(e, t).flags |= 256), e = _l(e, t), e !== 2 && (t = Se, Se = n, t !== null && ko(t)), e;
}
function ko(e) {
  Se === null ? Se = e : Se.push.apply(Se, e);
}
function rh(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
        var l = n[r], i = l.getSnapshot;
        l = l.value;
        try {
          if (!He(i(), l)) return !1;
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
function ht(e, t) {
  for (t &= ~fa, t &= ~Al, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - We(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function Ls(e) {
  if (U & 6) throw Error(j(327));
  mn();
  var t = al(e, 0);
  if (!(t & 1)) return _e(e, te()), null;
  var n = _l(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Qi(e);
    r !== 0 && (t = r, n = So(e, r));
  }
  if (n === 1) throw n = pr, At(e, 0), ht(e, t), _e(e, te()), n;
  if (n === 6) throw Error(j(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, Mt(e, Se, et), _e(e, te()), null;
}
function ha(e, t) {
  var n = U;
  U |= 1;
  try {
    return e(t);
  } finally {
    U = n, U === 0 && (Cn = te() + 500, Ml && Rt());
  }
}
function Wt(e) {
  gt !== null && gt.tag === 0 && !(U & 6) && mn();
  var t = U;
  U |= 1;
  var n = $e.transition, r = W;
  try {
    if ($e.transition = null, W = 1, e) return e();
  } finally {
    W = r, $e.transition = n, U = t, !(U & 6) && Rt();
  }
}
function ma() {
  je = un.current, G(un);
}
function At(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, Mp(n)), ne !== null) for (n = ne.return; n !== null; ) {
    var r = n;
    switch (Go(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && fl();
        break;
      case 3:
        kn(), G(Ee), G(he), la();
        break;
      case 5:
        ra(r);
        break;
      case 4:
        kn();
        break;
      case 13:
        G(Z);
        break;
      case 19:
        G(Z);
        break;
      case 10:
        qo(r.type._context);
        break;
      case 22:
      case 23:
        ma();
    }
    n = n.return;
  }
  if (oe = e, ne = e = Ct(e.current, null), se = je = t, le = 0, pr = null, fa = Al = Bt = 0, Se = Gn = null, It !== null) {
    for (t = 0; t < It.length; t++) if (n = It[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var l = r.next, i = n.pending;
      if (i !== null) {
        var o = i.next;
        i.next = l, r.next = o;
      }
      n.pending = r;
    }
    It = null;
  }
  return e;
}
function ld(e, t) {
  do {
    var n = ne;
    try {
      if (Jo(), Gr.current = Sl, xl) {
        for (var r = J.memoizedState; r !== null; ) {
          var l = r.queue;
          l !== null && (l.pending = null), r = r.next;
        }
        xl = !1;
      }
      if (bt = 0, ie = re = J = null, Yn = !1, cr = 0, da.current = null, n === null || n.return === null) {
        le = 1, pr = t, ne = null;
        break;
      }
      e: {
        var i = e, o = n.return, a = n, s = t;
        if (t = se, a.flags |= 32768, s !== null && typeof s == "object" && typeof s.then == "function") {
          var u = s, f = a, h = f.tag;
          if (!(f.mode & 1) && (h === 0 || h === 11 || h === 15)) {
            var d = f.alternate;
            d ? (f.updateQueue = d.updateQueue, f.memoizedState = d.memoizedState, f.lanes = d.lanes) : (f.updateQueue = null, f.memoizedState = null);
          }
          var v = Ss(o);
          if (v !== null) {
            v.flags &= -257, ks(v, o, a, i, t), v.mode & 1 && xs(i, u, t), t = v, s = u;
            var y = t.updateQueue;
            if (y === null) {
              var S = /* @__PURE__ */ new Set();
              S.add(s), t.updateQueue = S;
            } else y.add(s);
            break e;
          } else {
            if (!(t & 1)) {
              xs(i, u, t), ga();
              break e;
            }
            s = Error(j(426));
          }
        } else if (K && a.mode & 1) {
          var D = Ss(o);
          if (D !== null) {
            !(D.flags & 65536) && (D.flags |= 256), ks(D, o, a, i, t), Ko(En(s, a));
            break e;
          }
        }
        i = s = En(s, a), le !== 4 && (le = 2), Gn === null ? Gn = [i] : Gn.push(i), i = o;
        do {
          switch (i.tag) {
            case 3:
              i.flags |= 65536, t &= -t, i.lanes |= t;
              var m = bc(i, s, t);
              hs(i, m);
              break e;
            case 1:
              a = s;
              var p = i.type, g = i.stateNode;
              if (!(i.flags & 128) && (typeof p.getDerivedStateFromError == "function" || g !== null && typeof g.componentDidCatch == "function" && (kt === null || !kt.has(g)))) {
                i.flags |= 65536, t &= -t, i.lanes |= t;
                var x = Bc(i, a, t);
                hs(i, x);
                break e;
              }
          }
          i = i.return;
        } while (i !== null);
      }
      ad(n);
    } catch (P) {
      t = P, ne === n && n !== null && (ne = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function id() {
  var e = kl.current;
  return kl.current = Sl, e === null ? Sl : e;
}
function ga() {
  (le === 0 || le === 3 || le === 2) && (le = 4), oe === null || !(Bt & 268435455) && !(Al & 268435455) || ht(oe, se);
}
function _l(e, t) {
  var n = U;
  U |= 2;
  var r = id();
  (oe !== e || se !== t) && (et = null, At(e, t));
  do
    try {
      lh();
      break;
    } catch (l) {
      ld(e, l);
    }
  while (!0);
  if (Jo(), U = n, kl.current = r, ne !== null) throw Error(j(261));
  return oe = null, se = 0, le;
}
function lh() {
  for (; ne !== null; ) od(ne);
}
function ih() {
  for (; ne !== null && !Tf(); ) od(ne);
}
function od(e) {
  var t = ud(e.alternate, e, je);
  e.memoizedProps = e.pendingProps, t === null ? ad(e) : ne = t, da.current = null;
}
function ad(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = Jp(n, t), n !== null) {
        n.flags &= 32767, ne = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        le = 6, ne = null;
        return;
      }
    } else if (n = Zp(n, t, je), n !== null) {
      ne = n;
      return;
    }
    if (t = t.sibling, t !== null) {
      ne = t;
      return;
    }
    ne = t = e;
  } while (t !== null);
  le === 0 && (le = 5);
}
function Mt(e, t, n) {
  var r = W, l = $e.transition;
  try {
    $e.transition = null, W = 1, oh(e, t, n, r);
  } finally {
    $e.transition = l, W = r;
  }
  return null;
}
function oh(e, t, n, r) {
  do
    mn();
  while (gt !== null);
  if (U & 6) throw Error(j(327));
  n = e.finishedWork;
  var l = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(j(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var i = n.lanes | n.childLanes;
  if (Uf(e, i), e === oe && (ne = oe = null, se = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || $r || ($r = !0, cd(ol, function() {
    return mn(), null;
  })), i = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || i) {
    i = $e.transition, $e.transition = null;
    var o = W;
    W = 1;
    var a = U;
    U |= 4, da.current = null, eh(e, n), td(n, e), jp(Ji), sl = !!Zi, Ji = Zi = null, e.current = n, th(n), Df(), U = a, W = o, $e.transition = i;
  } else e.current = n;
  if ($r && ($r = !1, gt = e, Cl = l), i = e.pendingLanes, i === 0 && (kt = null), Lf(n.stateNode), _e(e, te()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) l = t[n], r(l.value, { componentStack: l.stack, digest: l.digest });
  if (El) throw El = !1, e = wo, wo = null, e;
  return Cl & 1 && e.tag !== 0 && mn(), i = e.pendingLanes, i & 1 ? e === xo ? Kn++ : (Kn = 0, xo = e) : Kn = 0, Rt(), null;
}
function mn() {
  if (gt !== null) {
    var e = bu(Cl), t = $e.transition, n = W;
    try {
      if ($e.transition = null, W = 16 > e ? 16 : e, gt === null) var r = !1;
      else {
        if (e = gt, gt = null, Cl = 0, U & 6) throw Error(j(331));
        var l = U;
        for (U |= 4, N = e.current; N !== null; ) {
          var i = N, o = i.child;
          if (N.flags & 16) {
            var a = i.deletions;
            if (a !== null) {
              for (var s = 0; s < a.length; s++) {
                var u = a[s];
                for (N = u; N !== null; ) {
                  var f = N;
                  switch (f.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Xn(8, f, i);
                  }
                  var h = f.child;
                  if (h !== null) h.return = f, N = h;
                  else for (; N !== null; ) {
                    f = N;
                    var d = f.sibling, v = f.return;
                    if (Jc(f), f === u) {
                      N = null;
                      break;
                    }
                    if (d !== null) {
                      d.return = v, N = d;
                      break;
                    }
                    N = v;
                  }
                }
              }
              var y = i.alternate;
              if (y !== null) {
                var S = y.child;
                if (S !== null) {
                  y.child = null;
                  do {
                    var D = S.sibling;
                    S.sibling = null, S = D;
                  } while (S !== null);
                }
              }
              N = i;
            }
          }
          if (i.subtreeFlags & 2064 && o !== null) o.return = i, N = o;
          else e: for (; N !== null; ) {
            if (i = N, i.flags & 2048) switch (i.tag) {
              case 0:
              case 11:
              case 15:
                Xn(9, i, i.return);
            }
            var m = i.sibling;
            if (m !== null) {
              m.return = i.return, N = m;
              break e;
            }
            N = i.return;
          }
        }
        var p = e.current;
        for (N = p; N !== null; ) {
          o = N;
          var g = o.child;
          if (o.subtreeFlags & 2064 && g !== null) g.return = o, N = g;
          else e: for (o = p; N !== null; ) {
            if (a = N, a.flags & 2048) try {
              switch (a.tag) {
                case 0:
                case 11:
                case 15:
                  $l(9, a);
              }
            } catch (P) {
              ee(a, a.return, P);
            }
            if (a === o) {
              N = null;
              break e;
            }
            var x = a.sibling;
            if (x !== null) {
              x.return = a.return, N = x;
              break e;
            }
            N = a.return;
          }
        }
        if (U = l, Rt(), Ze && typeof Ze.onPostCommitFiberRoot == "function") try {
          Ze.onPostCommitFiberRoot(zl, e);
        } catch {
        }
        r = !0;
      }
      return r;
    } finally {
      W = n, $e.transition = t;
    }
  }
  return !1;
}
function Is(e, t, n) {
  t = En(n, t), t = bc(e, t, 1), e = St(e, t, 1), t = ye(), e !== null && (gr(e, 1, t), _e(e, t));
}
function ee(e, t, n) {
  if (e.tag === 3) Is(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      Is(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (kt === null || !kt.has(r))) {
        e = En(n, e), e = Bc(t, e, 1), t = St(t, e, 1), e = ye(), t !== null && (gr(t, 1, e), _e(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function ah(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = ye(), e.pingedLanes |= e.suspendedLanes & n, oe === e && (se & n) === n && (le === 4 || le === 3 && (se & 130023424) === se && 500 > te() - pa ? At(e, 0) : fa |= n), _e(e, t);
}
function sd(e, t) {
  t === 0 && (e.mode & 1 ? (t = jr, jr <<= 1, !(jr & 130023424) && (jr = 4194304)) : t = 1);
  var n = ye();
  e = at(e, t), e !== null && (gr(e, t, n), _e(e, n));
}
function sh(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), sd(e, n);
}
function uh(e, t) {
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
      throw Error(j(314));
  }
  r !== null && r.delete(t), sd(e, n);
}
var ud;
ud = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || Ee.current) ke = !0;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return ke = !1, Kp(e, t, n);
    ke = !!(e.flags & 131072);
  }
  else ke = !1, K && t.flags & 1048576 && pc(t, ml, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      Zr(e, t), e = t.pendingProps;
      var l = wn(t, he.current);
      hn(t, n), l = oa(null, t, r, e, l, n);
      var i = aa();
      return t.flags |= 1, typeof l == "object" && l !== null && typeof l.render == "function" && l.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, Ce(r) ? (i = !0, pl(t)) : i = !1, t.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null, ta(t), l.updater = Il, t.stateNode = l, l._reactInternals = t, ao(t, r, e, n), t = co(null, t, r, !0, i, n)) : (t.tag = 0, K && i && Xo(t), ve(null, t, l, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (Zr(e, t), e = t.pendingProps, l = r._init, r = l(r._payload), t.type = r, l = t.tag = dh(r), e = Ue(r, e), l) {
          case 0:
            t = uo(null, t, r, e, n);
            break e;
          case 1:
            t = _s(null, t, r, e, n);
            break e;
          case 11:
            t = Es(null, t, r, e, n);
            break e;
          case 14:
            t = Cs(null, t, r, Ue(r.type, e), n);
            break e;
        }
        throw Error(j(
          306,
          r,
          ""
        ));
      }
      return t;
    case 0:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Ue(r, l), uo(e, t, r, l, n);
    case 1:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Ue(r, l), _s(e, t, r, l, n);
    case 3:
      e: {
        if (Qc(t), e === null) throw Error(j(387));
        r = t.pendingProps, i = t.memoizedState, l = i.element, wc(e, t), yl(t, r, null, n);
        var o = t.memoizedState;
        if (r = o.element, i.isDehydrated) if (i = { element: r, isDehydrated: !1, cache: o.cache, pendingSuspenseBoundaries: o.pendingSuspenseBoundaries, transitions: o.transitions }, t.updateQueue.baseState = i, t.memoizedState = i, t.flags & 256) {
          l = En(Error(j(423)), t), t = js(e, t, r, n, l);
          break e;
        } else if (r !== l) {
          l = En(Error(j(424)), t), t = js(e, t, r, n, l);
          break e;
        } else for (Pe = xt(t.stateNode.containerInfo.firstChild), ze = t, K = !0, Be = null, n = vc(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (xn(), r === l) {
            t = st(e, t, n);
            break e;
          }
          ve(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return xc(t), e === null && lo(t), r = t.type, l = t.pendingProps, i = e !== null ? e.memoizedProps : null, o = l.children, qi(r, l) ? o = null : i !== null && qi(r, i) && (t.flags |= 32), Hc(e, t), ve(e, t, o, n), t.child;
    case 6:
      return e === null && lo(t), null;
    case 13:
      return Yc(e, t, n);
    case 4:
      return na(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Sn(t, null, r, n) : ve(e, t, r, n), t.child;
    case 11:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Ue(r, l), Es(e, t, r, l, n);
    case 7:
      return ve(e, t, t.pendingProps, n), t.child;
    case 8:
      return ve(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return ve(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, l = t.pendingProps, i = t.memoizedProps, o = l.value, Y(gl, r._currentValue), r._currentValue = o, i !== null) if (He(i.value, o)) {
          if (i.children === l.children && !Ee.current) {
            t = st(e, t, n);
            break e;
          }
        } else for (i = t.child, i !== null && (i.return = t); i !== null; ) {
          var a = i.dependencies;
          if (a !== null) {
            o = i.child;
            for (var s = a.firstContext; s !== null; ) {
              if (s.context === r) {
                if (i.tag === 1) {
                  s = lt(-1, n & -n), s.tag = 2;
                  var u = i.updateQueue;
                  if (u !== null) {
                    u = u.shared;
                    var f = u.pending;
                    f === null ? s.next = s : (s.next = f.next, f.next = s), u.pending = s;
                  }
                }
                i.lanes |= n, s = i.alternate, s !== null && (s.lanes |= n), io(
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
            if (o = i.return, o === null) throw Error(j(341));
            o.lanes |= n, a = o.alternate, a !== null && (a.lanes |= n), io(o, n, t), o = i.sibling;
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
      return l = t.type, r = t.pendingProps.children, hn(t, n), l = Ae(l), r = r(l), t.flags |= 1, ve(e, t, r, n), t.child;
    case 14:
      return r = t.type, l = Ue(r, t.pendingProps), l = Ue(r.type, l), Cs(e, t, r, l, n);
    case 15:
      return Wc(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Ue(r, l), Zr(e, t), t.tag = 1, Ce(r) ? (e = !0, pl(t)) : e = !1, hn(t, n), Uc(t, r, l), ao(t, r, l, n), co(null, t, r, !0, e, n);
    case 19:
      return Xc(e, t, n);
    case 22:
      return Vc(e, t, n);
  }
  throw Error(j(156, t.tag));
};
function cd(e, t) {
  return Au(e, t);
}
function ch(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function Ie(e, t, n, r) {
  return new ch(e, t, n, r);
}
function va(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function dh(e) {
  if (typeof e == "function") return va(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === $o) return 11;
    if (e === Ao) return 14;
  }
  return 2;
}
function Ct(e, t) {
  var n = e.alternate;
  return n === null ? (n = Ie(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function el(e, t, n, r, l, i) {
  var o = 2;
  if (r = e, typeof e == "function") va(e) && (o = 1);
  else if (typeof e == "string") o = 5;
  else e: switch (e) {
    case Jt:
      return Ft(n.children, l, i, t);
    case Io:
      o = 8, l |= 8;
      break;
    case Di:
      return e = Ie(12, n, t, l | 2), e.elementType = Di, e.lanes = i, e;
    case Ni:
      return e = Ie(13, n, t, l), e.elementType = Ni, e.lanes = i, e;
    case Mi:
      return e = Ie(19, n, t, l), e.elementType = Mi, e.lanes = i, e;
    case xu:
      return Fl(n, l, i, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case yu:
          o = 10;
          break e;
        case wu:
          o = 9;
          break e;
        case $o:
          o = 11;
          break e;
        case Ao:
          o = 14;
          break e;
        case dt:
          o = 16, r = null;
          break e;
      }
      throw Error(j(130, e == null ? e : typeof e, ""));
  }
  return t = Ie(o, n, t, l), t.elementType = e, t.type = r, t.lanes = i, t;
}
function Ft(e, t, n, r) {
  return e = Ie(7, e, r, t), e.lanes = n, e;
}
function Fl(e, t, n, r) {
  return e = Ie(22, e, r, t), e.elementType = xu, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
}
function xi(e, t, n) {
  return e = Ie(6, e, null, t), e.lanes = n, e;
}
function Si(e, t, n) {
  return t = Ie(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function fh(e, t, n, r, l) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = ti(0), this.expirationTimes = ti(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = ti(0), this.identifierPrefix = r, this.onRecoverableError = l, this.mutableSourceEagerHydrationData = null;
}
function ya(e, t, n, r, l, i, o, a, s) {
  return e = new fh(e, t, n, a, s), t === 1 ? (t = 1, i === !0 && (t |= 8)) : t = 0, i = Ie(3, null, null, t), e.current = i, i.stateNode = e, i.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, ta(i), e;
}
function ph(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: Zt, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function dd(e) {
  if (!e) return jt;
  e = e._reactInternals;
  e: {
    if (Ht(e) !== e || e.tag !== 1) throw Error(j(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (Ce(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(j(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (Ce(n)) return dc(e, n, t);
  }
  return t;
}
function fd(e, t, n, r, l, i, o, a, s) {
  return e = ya(n, r, !0, e, l, i, o, a, s), e.context = dd(null), n = e.current, r = ye(), l = Et(n), i = lt(r, l), i.callback = t ?? null, St(n, i, l), e.current.lanes = l, gr(e, l, r), _e(e, r), e;
}
function Ol(e, t, n, r) {
  var l = t.current, i = ye(), o = Et(l);
  return n = dd(n), t.context === null ? t.context = n : t.pendingContext = n, t = lt(i, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = St(l, t, o), e !== null && (Ve(e, l, o, i), Xr(e, l, o)), o;
}
function jl(e) {
  if (e = e.current, !e.child) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function $s(e, t) {
  if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function wa(e, t) {
  $s(e, t), (e = e.alternate) && $s(e, t);
}
function hh() {
  return null;
}
var pd = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function xa(e) {
  this._internalRoot = e;
}
Ul.prototype.render = xa.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(j(409));
  Ol(e, t, null, null);
};
Ul.prototype.unmount = xa.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    Wt(function() {
      Ol(null, e, null, null);
    }), t[ot] = null;
  }
};
function Ul(e) {
  this._internalRoot = e;
}
Ul.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = Vu();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < pt.length && t !== 0 && t < pt[n].priority; n++) ;
    pt.splice(n, 0, e), n === 0 && Qu(e);
  }
};
function Sa(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function bl(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function As() {
}
function mh(e, t, n, r, l) {
  if (l) {
    if (typeof r == "function") {
      var i = r;
      r = function() {
        var u = jl(o);
        i.call(u);
      };
    }
    var o = fd(t, r, e, 0, null, !1, !1, "", As);
    return e._reactRootContainer = o, e[ot] = o.current, ir(e.nodeType === 8 ? e.parentNode : e), Wt(), o;
  }
  for (; l = e.lastChild; ) e.removeChild(l);
  if (typeof r == "function") {
    var a = r;
    r = function() {
      var u = jl(s);
      a.call(u);
    };
  }
  var s = ya(e, 0, !1, null, null, !1, !1, "", As);
  return e._reactRootContainer = s, e[ot] = s.current, ir(e.nodeType === 8 ? e.parentNode : e), Wt(function() {
    Ol(t, s, n, r);
  }), s;
}
function Bl(e, t, n, r, l) {
  var i = n._reactRootContainer;
  if (i) {
    var o = i;
    if (typeof l == "function") {
      var a = l;
      l = function() {
        var s = jl(o);
        a.call(s);
      };
    }
    Ol(t, o, e, l);
  } else o = mh(n, t, e, l, r);
  return jl(o);
}
Bu = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Un(t.pendingLanes);
        n !== 0 && (Uo(t, n | 1), _e(t, te()), !(U & 6) && (Cn = te() + 500, Rt()));
      }
      break;
    case 13:
      Wt(function() {
        var r = at(e, 1);
        if (r !== null) {
          var l = ye();
          Ve(r, e, 1, l);
        }
      }), wa(e, 1);
  }
};
bo = function(e) {
  if (e.tag === 13) {
    var t = at(e, 134217728);
    if (t !== null) {
      var n = ye();
      Ve(t, e, 134217728, n);
    }
    wa(e, 134217728);
  }
};
Wu = function(e) {
  if (e.tag === 13) {
    var t = Et(e), n = at(e, t);
    if (n !== null) {
      var r = ye();
      Ve(n, e, t, r);
    }
    wa(e, t);
  }
};
Vu = function() {
  return W;
};
Hu = function(e, t) {
  var n = W;
  try {
    return W = e, t();
  } finally {
    W = n;
  }
};
Wi = function(e, t, n) {
  switch (t) {
    case "input":
      if ($i(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var l = Nl(r);
            if (!l) throw Error(j(90));
            ku(r), $i(r, l);
          }
        }
      }
      break;
    case "textarea":
      Cu(e, n);
      break;
    case "select":
      t = n.value, t != null && cn(e, !!n.multiple, t, !1);
  }
};
Du = ha;
Nu = Wt;
var gh = { usingClientEntryPoint: !1, Events: [yr, nn, Nl, Ru, Tu, ha] }, $n = { findFiberByHostInstance: Lt, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, vh = { bundleType: $n.bundleType, version: $n.version, rendererPackageName: $n.rendererPackageName, rendererConfig: $n.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ut.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = Iu(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: $n.findFiberByHostInstance || hh, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Ar = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Ar.isDisabled && Ar.supportsFiber) try {
    zl = Ar.inject(vh), Ze = Ar;
  } catch {
  }
}
Te.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = gh;
Te.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!Sa(t)) throw Error(j(200));
  return ph(e, t, null, n);
};
Te.createRoot = function(e, t) {
  if (!Sa(e)) throw Error(j(299));
  var n = !1, r = "", l = pd;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (l = t.onRecoverableError)), t = ya(e, 1, !1, null, null, n, !1, r, l), e[ot] = t.current, ir(e.nodeType === 8 ? e.parentNode : e), new xa(t);
};
Te.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function" ? Error(j(188)) : (e = Object.keys(e).join(","), Error(j(268, e)));
  return e = Iu(t), e = e === null ? null : e.stateNode, e;
};
Te.flushSync = function(e) {
  return Wt(e);
};
Te.hydrate = function(e, t, n) {
  if (!bl(t)) throw Error(j(200));
  return Bl(null, e, t, !0, n);
};
Te.hydrateRoot = function(e, t, n) {
  if (!Sa(e)) throw Error(j(405));
  var r = n != null && n.hydratedSources || null, l = !1, i = "", o = pd;
  if (n != null && (n.unstable_strictMode === !0 && (l = !0), n.identifierPrefix !== void 0 && (i = n.identifierPrefix), n.onRecoverableError !== void 0 && (o = n.onRecoverableError)), t = fd(t, null, e, 1, n ?? null, l, !1, i, o), e[ot] = t.current, ir(e), r) for (e = 0; e < r.length; e++) n = r[e], l = n._getVersion, l = l(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, l] : t.mutableSourceEagerHydrationData.push(
    n,
    l
  );
  return new Ul(t);
};
Te.render = function(e, t, n) {
  if (!bl(t)) throw Error(j(200));
  return Bl(null, e, t, !1, n);
};
Te.unmountComponentAtNode = function(e) {
  if (!bl(e)) throw Error(j(40));
  return e._reactRootContainer ? (Wt(function() {
    Bl(null, null, e, !1, function() {
      e._reactRootContainer = null, e[ot] = null;
    });
  }), !0) : !1;
};
Te.unstable_batchedUpdates = ha;
Te.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!bl(n)) throw Error(j(200));
  if (e == null || e._reactInternals === void 0) throw Error(j(38));
  return Bl(e, t, n, !1, r);
};
Te.version = "18.3.1-next-f1338f8080-20240426";
function hd() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(hd);
    } catch (e) {
      console.error(e);
    }
}
hd(), iu.exports = Te;
var md = iu.exports, ka, Fs = md;
ka = Fs.createRoot, Fs.hydrateRoot;
function yh(e, t) {
  const n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  let l = 1;
  const i = (a) => {
    var u;
    const s = a.data;
    if (!(t !== void 0 && s.bridgeId !== t)) {
      if (s.type === "notify") {
        let f;
        try {
          f = JSON.parse(s.payload ?? "");
        } catch {
          return;
        }
        f.method && ((u = n.get(f.method)) == null || u.forEach((h) => h(f.params)));
        return;
      }
      if (typeof s.id == "number") {
        const f = r.get(s.id);
        if (!f) return;
        if (r.delete(s.id), s.error) {
          const h = new Error(s.error.message || "rpc error");
          h.code = s.error.code, h.data = s.error.data, f.reject(h);
        } else
          f.resolve(s.result);
      }
    }
  };
  e.addEventListener("message", i);
  const o = (a, s) => {
    const u = l++;
    return new Promise((f, h) => {
      r.set(u, { resolve: f, reject: h }), e.postMessage(
        t !== void 0 ? { bridgeId: t, id: u, type: a, ...s } : { id: u, type: a, ...s }
      );
    });
  };
  return {
    call: (a, s = {}) => o("call", { method: a, params: s }),
    request: o,
    subscribe: (a, s) => {
      let u = n.get(a);
      return u || (u = /* @__PURE__ */ new Set(), n.set(a, u)), u.add(s), () => {
        u.delete(s);
      };
    },
    dispose: () => {
      var a;
      (a = e.removeEventListener) == null || a.call(e, "message", i);
      for (const s of r.values()) s.reject(new Error("transport disposed"));
      r.clear(), n.clear();
    }
  };
}
function wh(e) {
  var i;
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
  let r = 1, l = !1;
  return e.onMessage((o) => {
    var s;
    const a = o;
    if ((a.id === void 0 || a.id === null) && typeof a.method == "string") {
      (s = t.get(a.method)) == null || s.forEach((u) => u(a.params));
      return;
    }
    if (typeof a.id == "number") {
      const u = n.get(a.id);
      if (!u) return;
      if (n.delete(a.id), a.error) {
        const f = new Error(a.error.message || "rpc error");
        f.code = a.error.code, f.data = a.error.data, u.reject(f);
      } else
        u.resolve(a.result);
    }
  }), (i = e.onClose) == null || i.call(e, () => {
    l = !0;
    for (const o of n.values()) o.reject(new Error("comm closed"));
    n.clear();
  }), {
    call: (o, a = {}) => {
      if (l) return Promise.reject(new Error("comm closed"));
      const s = r++;
      return new Promise((u, f) => {
        n.set(s, { resolve: u, reject: f }), e.send({ id: s, method: o, params: a });
      });
    },
    subscribe: (o, a) => {
      let s = t.get(o);
      return s || (s = /* @__PURE__ */ new Set(), t.set(o, s)), s.add(a), () => {
        s.delete(a);
      };
    }
  };
}
function Hg(e, t = WebSocket) {
  const n = new t(e), r = [];
  let l = !1, i = null;
  return n.addEventListener("open", () => {
    l = !0;
    for (const o of r) n.send(JSON.stringify(o));
    r.length = 0;
  }), n.addEventListener("message", (o) => {
    try {
      i == null || i(JSON.parse(typeof o.data == "string" ? o.data : String(o.data)));
    } catch {
    }
  }), {
    send: (o) => {
      l ? n.send(JSON.stringify(o)) : r.push(o);
    },
    onMessage: (o) => {
      i = o;
    },
    onClose: (o) => n.addEventListener("close", () => o())
  };
}
function gd(e) {
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
      colormaps: (n = 24) => t("doc.colormaps", { samples: n }),
      themes: () => t("doc.themes"),
      applyTheme: (n) => t("doc.apply_theme", { theme: n }),
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
const xh = {}, Os = (e) => {
  let t;
  const n = /* @__PURE__ */ new Set(), r = (f, h) => {
    const d = typeof f == "function" ? f(t) : f;
    if (!Object.is(d, t)) {
      const v = t;
      t = h ?? (typeof d != "object" || d === null) ? d : Object.assign({}, t, d), n.forEach((y) => y(t, v));
    }
  }, l = () => t, s = { setState: r, getState: l, getInitialState: () => u, subscribe: (f) => (n.add(f), () => n.delete(f)), destroy: () => {
    (xh ? "production" : void 0) !== "production" && console.warn(
      "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
    ), n.clear();
  } }, u = t = e(r, l, s);
  return s;
}, Sh = (e) => e ? Os(e) : Os;
var vd = { exports: {} }, yd = {}, wd = { exports: {} }, xd = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var _n = E;
function kh(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Eh = typeof Object.is == "function" ? Object.is : kh, Ch = _n.useState, _h = _n.useEffect, jh = _n.useLayoutEffect, Ph = _n.useDebugValue;
function zh(e, t) {
  var n = t(), r = Ch({ inst: { value: n, getSnapshot: t } }), l = r[0].inst, i = r[1];
  return jh(
    function() {
      l.value = n, l.getSnapshot = t, ki(l) && i({ inst: l });
    },
    [e, n, t]
  ), _h(
    function() {
      return ki(l) && i({ inst: l }), e(function() {
        ki(l) && i({ inst: l });
      });
    },
    [e]
  ), Ph(n), n;
}
function ki(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Eh(e, n);
  } catch {
    return !0;
  }
}
function Rh(e, t) {
  return t();
}
var Th = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? Rh : zh;
xd.useSyncExternalStore = _n.useSyncExternalStore !== void 0 ? _n.useSyncExternalStore : Th;
wd.exports = xd;
var Dh = wd.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Wl = E, Nh = Dh;
function Mh(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Lh = typeof Object.is == "function" ? Object.is : Mh, Ih = Nh.useSyncExternalStore, $h = Wl.useRef, Ah = Wl.useEffect, Fh = Wl.useMemo, Oh = Wl.useDebugValue;
yd.useSyncExternalStoreWithSelector = function(e, t, n, r, l) {
  var i = $h(null);
  if (i.current === null) {
    var o = { hasValue: !1, value: null };
    i.current = o;
  } else o = i.current;
  i = Fh(
    function() {
      function s(v) {
        if (!u) {
          if (u = !0, f = v, v = r(v), l !== void 0 && o.hasValue) {
            var y = o.value;
            if (l(y, v))
              return h = y;
          }
          return h = v;
        }
        if (y = h, Lh(f, v)) return y;
        var S = r(v);
        return l !== void 0 && l(y, S) ? (f = v, y) : (f = v, h = S);
      }
      var u = !1, f, h, d = n === void 0 ? null : n;
      return [
        function() {
          return s(t());
        },
        d === null ? void 0 : function() {
          return s(d());
        }
      ];
    },
    [t, n, r, l]
  );
  var a = Ih(e, i[0], i[1]);
  return Ah(
    function() {
      o.hasValue = !0, o.value = a;
    },
    [a]
  ), Oh(a), a;
};
vd.exports = yd;
var Uh = vd.exports;
const bh = /* @__PURE__ */ lu(Uh), Sd = {}, { useDebugValue: Bh } = pf, { useSyncExternalStoreWithSelector: Wh } = bh;
let Us = !1;
const Vh = (e) => e;
function Hh(e, t = Vh, n) {
  (Sd ? "production" : void 0) !== "production" && n && !Us && (console.warn(
    "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
  ), Us = !0);
  const r = Wh(
    e.subscribe,
    e.getState,
    e.getServerState || e.getInitialState,
    t,
    n
  );
  return Bh(r), r;
}
const bs = (e) => {
  (Sd ? "production" : void 0) !== "production" && typeof e != "function" && console.warn(
    "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
  );
  const t = typeof e == "function" ? Sh(e) : e, n = (r, l) => Hh(t, r, l);
  return Object.assign(n, t), n;
}, Qh = (e) => e ? bs(e) : bs;
function Yh() {
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
function Xh() {
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
function Gh() {
  return typeof window < "u" && window.__TAURI_INTERNALS__ ? Xh() : Yh();
}
const Bs = "text/x-vnd.veusz-widget-3", Kh = "text/x-vnd.veusz-data-1";
function Eo(e, t) {
  const n = [];
  for (const r of e.settings) n.push(Ws(t, r.name));
  for (const r of e.subgroups) n.push(...Eo(r, Ws(t, r.name)));
  return n;
}
function Ws(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
const Zh = 33;
function kd(e, t = Gh()) {
  let n = null, r = null;
  return Qh((l, i) => {
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
      colormaps: [],
      themes: [],
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
      refreshColormaps: async () => {
        const a = await o(() => e.doc.colormaps());
        a && l({ colormaps: a.colormaps });
      },
      refreshThemes: async () => {
        const a = await o(() => e.doc.themes());
        a && l({ themes: a.themes });
      },
      applyTheme: async (a) => {
        if (!await o(() => e.doc.applyTheme(a))) return;
        await i().refreshAll();
        const u = i().selected;
        u.length && await i().select(u);
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
          i().refreshColormaps(),
          i().refreshThemes(),
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
          const h = a[0], d = Ed(i().tree, h);
          if (!d) {
            l({ schema: null, values: {} });
            return;
          }
          const v = await o(() => e.doc.schema(d));
          if (!v) {
            l({ schema: null, values: {} });
            return;
          }
          const y = Eo(v, h), S = await o(() => e.doc.get(y)) ?? {};
          l({ schema: v, values: S });
          return;
        }
        const s = await o(() => e.doc.commonSchema(a));
        if (!s) {
          l({ schema: null, values: {} });
          return;
        }
        const u = Eo(s, a[0]), f = await o(() => e.doc.get(u)) ?? {};
        l({ schema: s, values: f });
      },
      setValue: async (a, s) => {
        const u = await o(() => e.doc.set([{ path: a, value: s }]));
        if (!u) return;
        const f = { ...i().values };
        for (const h of u.diffs) f[h.path] = h.new;
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
          f.includes(a) && await i().select(f.map((h) => h === a ? u.path : h));
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
        const u = [...a].sort((h, d) => d.length - h.length);
        for (const h of u)
          await o(() => e.doc.remove(h));
        const f = i().selected.filter((h) => !a.includes(h));
        f.length !== i().selected.length && await i().select(f), l({ cutPaths: a }), await i().refreshTree(), await i().refreshUndoState();
      },
      pasteWidgets: async (a) => {
        const s = await t.read([Bs]);
        if (!s) return [];
        const u = await o(() => e.doc.pasteWidgetsMime(
          a,
          s.mime_type,
          s.payload_b64
        ));
        return u ? (l({ cutPaths: [] }), await i().refreshTree(), await i().refreshUndoState(), u.paths) : [];
      },
      canPasteWidgets: async (a) => {
        const s = await t.read([Bs]);
        if (!s) return !1;
        const u = await o(() => e.doc.canPasteMime(
          a,
          s.mime_type,
          s.payload_b64
        ));
        return (u == null ? void 0 : u.ok) ?? !1;
      },
      copyWidgetAsImage: async (a, s, u, f = 96) => {
        const h = await o(() => e.render.copyImage(a, s, u, f, "png"));
        h && await t.write({
          mime_type: h.mime_type,
          payload_b64: h.payload_b64
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
        const a = await t.read([Kh]);
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
          const { webgpuAvailable: s } = await Promise.resolve().then(() => jd);
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
        const h = i().backend;
        if (h === "vello-gpu" && i().gpuNativeAvailable === !0) {
          const y = await o(() => e.render.scene(a, s, u, f));
          if (y) {
            const { gpuRenderScene: S } = await import("./velloNative-Cn1MRGX6.js"), D = await o(() => S(y.scene_b64, y.width, y.height));
            D && l({ render: {
              png: D,
              width: y.width,
              height: y.height,
              bounds: y.bounds
            } });
          }
          return;
        }
        if (h === "vello-wasm" && i().webgpuAvailable === !0) {
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
        const d = h === "vello-wasm" || h === "vello-gpu" ? "vello" : h, v = await o(() => e.render.png(a, s, u, f, i().antialias, d));
        v && l({ render: v });
      },
      requestRender: (a, s, u, f = 96) => {
        r = { page: a, w: s, h: u, dpi: f }, n && clearTimeout(n), n = setTimeout(() => {
          n = null;
          const h = r;
          r = null, h && i().renderAt(h.page, h.w, h.h, h.dpi);
        }, Zh);
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
function Ed(e, t) {
  if (!e) return null;
  if (e.path === t) return e.type;
  for (const n of e.children) {
    const r = Ed(n, t);
    if (r) return r;
  }
  return null;
}
function Jh() {
  return (globalThis.__VEUSZ_WASM_BASE__ ?? "/wasm").replace(/\/+$/, "");
}
let Fr = null, Vs = !1;
function qh() {
  if (Vs) return;
  const e = globalThis.GPUAdapter;
  if (!e) return;
  Vs = !0;
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
function Ea() {
  return Fr || (Fr = (async () => {
    qh();
    const e = Jh(), t = await import(
      /* @vite-ignore */
      `${e}/veusz_paint_wasm.js`
    );
    return await t.default({ module_or_path: `${e}/veusz_paint_wasm_bg.wasm` }), t;
  })().catch((e) => {
    throw Fr = null, e;
  })), Fr;
}
async function Cd() {
  const e = navigator.gpu;
  if (!e) return !1;
  for (let t = 0; t < 5; t++) {
    try {
      const n = t === 0 ? void 0 : { powerPreference: t % 2 ? "high-performance" : "low-power" };
      if (await e.requestAdapter(n) != null) return !0;
    } catch (n) {
      t === 0 && console.warn("[veusz] WebGPU requestAdapter threw:", n);
    }
    t < 4 && await new Promise((n) => setTimeout(n, 200));
  }
  return console.warn("[veusz] no WebGPU adapter after retries — degrading to non-interactive"), !1;
}
function Vl(e) {
  const t = atob(e), n = new Uint8Array(t.length);
  for (let r = 0; r < t.length; r++) n[r] = t.charCodeAt(r);
  return n;
}
async function Ca(e, t, n = [0, 0, 0, 0]) {
  await (await Ea()).render_scene_to_canvas(e, t, n[0], n[1], n[2], n[3]);
}
async function em(e, t, n = [0, 0, 0, 0]) {
  await Ca(e, Vl(t), n);
}
async function Hl(e, t, n, r = "image/png", l = 0.92, i = [1, 1, 1, 1]) {
  const o = document.createElement("canvas");
  o.width = Math.max(1, Math.round(t)), o.height = Math.max(1, Math.round(n)), o.style.cssText = "position:absolute;left:-99999px;top:0;pointer-events:none", document.body.appendChild(o);
  try {
    await Ca(o, Vl(e), i);
    const a = await new Promise((s) => o.toBlob(s, r, l));
    if (!a) throw new Error("canvas.toBlob returned null");
    return a;
  } finally {
    o.remove();
  }
}
async function _d() {
  try {
    return typeof (await Ea()).scene_to_svg == "function";
  } catch {
    return !1;
  }
}
async function _a(e, t, n) {
  const r = await Ea();
  if (typeof r.scene_to_svg != "function")
    throw new Error("this runtime does not include the SVG exporter");
  return r.scene_to_svg(Vl(e), t, n);
}
const jd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base64ToBytes: Vl,
  renderSceneBytesToCanvas: Ca,
  renderSceneToCanvas: em,
  renderSceneToImageBlob: Hl,
  sceneToSvg: _a,
  svgExportAvailable: _d,
  webgpuAvailable: Cd
}, Symbol.toStringTag, { value: "Module" })), tm = "0.26.4", nm = `https://cdn.jsdelivr.net/pyodide/v${tm}/full/`;
let gn = null, tl = 0, rm = 0;
function lm() {
  return gn || (gn = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/pyodideWorker-BmpFevM4.js", import.meta.url).href,
    import.meta.url
  ), {
    type: "module"
  })), gn;
}
function Hs() {
  tl = Math.max(0, tl - 1), tl === 0 && gn && (gn.terminate(), gn = null);
}
function im(e, t, n) {
  return new Promise((r, l) => {
    const i = () => {
      e.removeEventListener("message", o), e.removeEventListener("error", a);
    }, o = (s) => {
      const u = s.data;
      u.bridgeId === t && (u.type === "ready" ? (i(), r()) : u.type === "init-error" && (i(), l(new Error(u.message || "Pyodide worker failed to start"))));
    }, a = (s) => {
      i(), l(new Error(s.message || "Pyodide worker error"));
    };
    e.addEventListener("message", o), e.addEventListener("error", a), e.postMessage({ bridgeId: t, type: "init", config: n });
  });
}
async function om(e = {}) {
  const t = e.onProgress ?? (() => {
  });
  e.wasmBase && (globalThis.__VEUSZ_WASM_BASE__ = e.wasmBase);
  const n = lm();
  tl += 1;
  const r = `fig_${rm++}`;
  let l = !1;
  t("Loading runtime…");
  try {
    await im(n, r, {
      pyodideIndexUrl: e.pyodideIndexUrl ?? nm,
      veuszWheelUrl: e.veuszWheelUrl,
      extraWheels: e.extraWheels
    });
  } catch (a) {
    throw Hs(), a;
  }
  const i = yh(n, r), o = (a, s = []) => (
    // The .vsz text + sidecar bytes are written into the worker's in-memory FS
    // there (it owns Pyodide); `request` correlates the reply by id like a
    // normal call and resolves with the `file.open` result.
    i.request("loadVsz", {
      text: a,
      dataFiles: s.map((u) => ({ name: u.name, bytes: u.bytes }))
    })
  );
  return t("Ready"), {
    transport: i,
    loadVsz: o,
    dispose: () => {
      if (!l) {
        l = !0;
        try {
          n.postMessage({ bridgeId: r, type: "dispose" });
        } catch {
        }
        i.dispose(), Hs();
      }
    }
  };
}
async function am(e, t = {}) {
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
    const f = o(u.url), h = i.get(u.url), d = {};
    h.etag && (d["If-None-Match"] = h.etag), h.lastModified && (d["If-Modified-Since"] = h.lastModified), l({ url: u.url, phase: "fetching" });
    try {
      const v = await fetch(f, { headers: d, cache: "no-store" });
      if (v.status === 304) {
        await e.call(
          "data.url_refresh",
          { url: u.url, not_modified: !0 }
        ), l({ url: u.url, phase: "not_modified" });
        return;
      }
      if (!v.ok) throw new Error(`HTTP ${v.status}`);
      const y = new Uint8Array(await v.arrayBuffer()), S = Pd(y), D = v.headers.get("etag"), m = v.headers.get("last-modified"), p = v.headers.get("content-type");
      await e.call("data.url_refresh", {
        url: u.url,
        bytes_b64: S,
        etag: D,
        last_modified: m,
        content_type: p
      }), h.etag = D, h.lastModified = m, l({ url: u.url, phase: "ok" });
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
async function sm(e, t, n = {}) {
  const r = um(e), l = n.onError ?? ((i, o) => console.warn(`[veusz-figure] pre-fetch ${i}: ${o.message}`));
  return await Promise.allSettled(r.map(async (i) => {
    const o = n.urlMap && Object.prototype.hasOwnProperty.call(n.urlMap, i) ? n.urlMap[i] : n.urlBase ? new URL(i, n.urlBase).toString() : i;
    try {
      const a = await fetch(o, { cache: "no-store" });
      if (!a.ok) throw new Error(`HTTP ${a.status}`);
      const s = new Uint8Array(await a.arrayBuffer());
      await t.call("data.url_ingest", {
        url: i,
        // Python's cache key = original URL
        bytes_b64: Pd(s),
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
function um(e) {
  const t = [], n = /ImportFileURL\s*\(\s*(['"])([^'"\n]+)\1/g;
  let r;
  for (; (r = n.exec(e)) !== null; ) t.push(r[2]);
  return t;
}
function Pd(e) {
  let t = "";
  for (let r = 0; r < e.length; r += 32768)
    t += String.fromCharCode.apply(
      null,
      Array.from(e.subarray(r, r + 32768))
    );
  return btoa(t);
}
const cm = /\bImport[A-Za-z0-9]*\s*\(\s*[uUrRbB]?(['"])([^'"\n]+)\1/g;
function dm(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e.matchAll(cm)) {
    const r = n[2];
    /^[a-z][a-z0-9+.-]*:\/\//i.test(r) || /\.[A-Za-z0-9]+$/.test(r) && t.add(r);
  }
  return [...t];
}
async function fm(e, t, n = {}, r = fetch) {
  const l = dm(e);
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
var zd = { exports: {} }, Ql = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var pm = E, hm = Symbol.for("react.element"), mm = Symbol.for("react.fragment"), gm = Object.prototype.hasOwnProperty, vm = pm.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, ym = { key: !0, ref: !0, __self: !0, __source: !0 };
function Rd(e, t, n) {
  var r, l = {}, i = null, o = null;
  n !== void 0 && (i = "" + n), t.key !== void 0 && (i = "" + t.key), t.ref !== void 0 && (o = t.ref);
  for (r in t) gm.call(t, r) && !ym.hasOwnProperty(r) && (l[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) l[r] === void 0 && (l[r] = t[r]);
  return { $$typeof: hm, type: e, key: i, ref: o, props: l, _owner: vm.current };
}
Ql.Fragment = mm;
Ql.jsx = Rd;
Ql.jsxs = Rd;
zd.exports = Ql;
var c = zd.exports;
const Dt = Math.PI / 180, Ei = 180 / Math.PI;
function Co(e, t) {
  const n = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let r = 0; r < 3; r++)
    for (let l = 0; l < 3; l++)
      n[r][l] = e[r][0] * t[0][l] + e[r][1] * t[1][l] + e[r][2] * t[2][l];
  return n;
}
function wm(e) {
  const t = Math.cos(e), n = Math.sin(e);
  return [[1, 0, 0], [0, t, -n], [0, n, t]];
}
function xm(e) {
  const t = Math.cos(e), n = Math.sin(e);
  return [[t, 0, n], [0, 1, 0], [-n, 0, t]];
}
function Sm(e) {
  const t = Math.cos(e), n = Math.sin(e);
  return [[t, -n, 0], [n, t, 0], [0, 0, 1]];
}
function Ci(e, t, n) {
  return Co(Co(wm(e), xm(t)), Sm(n));
}
function km(e) {
  const t = Math.max(-1, Math.min(1, e[0][2])), n = Math.asin(t);
  let r, l;
  return Math.abs(t) < 1 - 1e-9 ? (r = Math.atan2(-e[1][2], e[2][2]), l = Math.atan2(-e[0][1], e[0][0])) : (r = Math.atan2(e[2][1], e[1][1]), l = 0), { x: r * Ei, y: n * Ei, z: l * Ei };
}
function Em(e, t, n, r = "xy") {
  const l = Ci(e.x * Dt, e.y * Dt, e.z * Dt), i = r === "xy" ? Ci(-n * Dt, -t * Dt, 0) : Ci(-t * Dt, 0, -n * Dt);
  return km(Co(i, l));
}
const _i = (e) => (Math.round(e * 10) || 0) / 10;
function Cm(e, t, n, r, l = "xy") {
  const i = Em(t, n, r, l);
  return [
    { path: `${e}/xRotation`, value: _i(i.x) },
    { path: `${e}/yRotation`, value: _i(i.y) },
    { path: `${e}/zRotation`, value: _i(i.z) }
  ];
}
function ja(e) {
  if (!e) return null;
  if (e.type === "scene3d") return e.path;
  for (const t of e.children) {
    const n = ja(t);
    if (n) return n;
  }
  return null;
}
function _m(e, t) {
  const n = new Map(t.map((l) => [l.path, l])), r = [];
  for (const l of e) {
    const i = n.get(l.path);
    if (!i) continue;
    const o = Math.min(l.value, i.value), a = Math.max(l.value, i.value);
    !(a > o) || !Number.isFinite(o) || !Number.isFinite(a) || (r.push({ path: `${l.path}/min`, value: o }), r.push({ path: `${l.path}/max`, value: a }));
  }
  return r;
}
function jm(e) {
  const t = [];
  for (const n of new Set(e))
    t.push({ path: `${n}/min`, value: "Auto" }), t.push({ path: `${n}/max`, value: "Auto" });
  return t;
}
function Pm(e, t, n) {
  const r = new Map(t.map((i) => [i.path, i])), l = [];
  for (const i of e) {
    const o = r.get(i.path), a = n.get(i.path);
    if (!o || !a) continue;
    const s = i.value - o.value;
    Number.isFinite(s) && (l.push({ path: `${i.path}/min`, value: a.min + s }), l.push({ path: `${i.path}/max`, value: a.max + s }));
  }
  return l;
}
function zm(e, t, n, r, l) {
  const i = new Map(t.map((u) => [u.path, u])), o = new Map(n.map((u) => [u.path, u])), a = new Map(r.map((u) => [u.path, u])), s = [];
  for (const u of e) {
    const f = i.get(u.path), h = o.get(u.path), d = a.get(u.path), v = l.get(u.path);
    if (!f || !h || !d || !v) continue;
    const y = u.value, S = f.value, D = h.value, p = d.value - D;
    if (!Number.isFinite(p) || p === 0) continue;
    const g = (S - y) / p;
    if (!Number.isFinite(g) || g <= 0) continue;
    const x = y + g * (v.min - D), P = y + g * (v.max - D);
    if (!Number.isFinite(x) || !Number.isFinite(P)) continue;
    const C = Math.min(x, P), k = Math.max(x, P);
    k > C && (s.push({ path: `${u.path}/min`, value: C }), s.push({ path: `${u.path}/max`, value: k }));
  }
  return s;
}
function Rm(e) {
  const t = (i) => {
    const o = Math.abs(i);
    return o !== 0 && (o < 1e-3 || o >= 1e5) ? i.toExponential(3) : Number(i.toPrecision(5)).toString();
  }, n = e.find((i) => i.direction === "horizontal"), r = e.find((i) => i.direction === "vertical"), l = [];
  return n && l.push(`x: ${t(n.value)}`), r && l.push(`y: ${t(r.value)}`), l.join("   ");
}
const Or = 4, Qs = 0.4;
function Td(e) {
  const { scene3dPath: t, toRenderPx: n, getPlotRect: r } = e, [l, i] = E.useState(null), [o, a] = E.useState(null), [s, u] = E.useState(null), [f, h] = E.useState(!1), d = E.useRef(/* @__PURE__ */ new Set()), v = E.useRef(null), y = E.useRef(null), S = E.useRef(!1), D = E.useRef(null), m = E.useRef(null), p = E.useRef(/* @__PURE__ */ new Map()), g = E.useRef(0), x = () => e.store.getState().rpc, P = async (w) => {
    await e.store.getState().setValues(w), e.requestRender();
  }, C = async (w) => {
    const T = /* @__PURE__ */ new Map();
    for (const z of new Set(w)) {
      const L = await x().doc.get([`${z}/min`, `${z}/max`]), I = Number(L[`${z}/min`]), V = Number(L[`${z}/max`]);
      Number.isFinite(I) && Number.isFinite(V) && T.set(z, { min: I, max: V });
    }
    return T;
  }, k = () => {
    if (S.current) return;
    const w = y.current, T = D.current;
    if (!T || !w || !w.startAngles) return;
    D.current = null;
    const z = (T.clientX - w.startClientX) * Qs, L = (T.clientY - w.startClientY) * Qs, I = Cm(w.scenePath, w.startAngles, z, L, T.shift ? "xz" : "xy");
    S.current = !0, P(I).finally(() => {
      S.current = !1, k();
    });
  }, R = (w, T, z) => {
    D.current = { clientX: w, clientY: T, shift: z }, k();
  }, $ = () => {
    const w = r();
    if (!w) return;
    const T = [...p.current.keys()];
    if (T.length < 2) return;
    const [z, L] = T, I = p.current.get(z), V = p.current.get(L), H = I.clientX - w.left, A = I.clientY - w.top, B = V.clientX - w.left, O = V.clientY - w.top;
    m.current = {
      id1: z,
      id2: L,
      startDist: Math.hypot(B - H, O - A) || 1,
      startCx: (H + B) / 2,
      startCy: (A + O) / 2
    }, v.current = null, i(null), (async () => {
      const [Qe, Yt] = [n(I.clientX, I.clientY), n(V.clientX, V.clientY)], [xr, Ra] = await Promise.all([
        x().render.pixelToData(Qe[0], Qe[1]),
        x().render.pixelToData(Yt[0], Yt[1])
      ]);
      if (!m.current) return;
      m.current.data1 = xr.axes, m.current.data2 = Ra.axes;
      const Yd = await C([...xr.axes, ...Ra.axes].map((Xd) => Xd.path));
      m.current && (m.current.ranges = Yd);
    })();
  }, M = () => {
    const w = m.current, T = r();
    if (!w || !T) return;
    const z = p.current.get(w.id1), L = p.current.get(w.id2);
    if (!z || !L) return;
    const I = z.clientX - T.left, V = z.clientY - T.top, H = L.clientX - T.left, A = L.clientY - T.top, B = Math.hypot(H - I, A - V) || 1;
    u({
      scale: B / w.startDist,
      ox: w.startCx,
      oy: w.startCy,
      tx: (I + H) / 2 - w.startCx,
      ty: (V + A) / 2 - w.startCy
    });
  }, b = (w, T) => {
    const z = m.current;
    if (m.current = null, u(null), !z || !z.data1 || !z.data2 || !z.ranges) return;
    const L = z.id1 === T ? w : p.current.get(z.id1), I = z.id2 === T ? w : p.current.get(z.id2);
    if (!L || !I) return;
    const V = n(L.clientX, L.clientY), H = n(I.clientX, I.clientY);
    (async () => {
      const [A, B] = await Promise.all([
        x().render.pixelToData(V[0], V[1]),
        x().render.pixelToData(H[0], H[1])
      ]), O = zm(z.data1, z.data2, A.axes, B.axes, z.ranges);
      O.length && await P(O);
    })();
  };
  return {
    handlers: { onPointerDown: (w) => {
      var A, B;
      if ((B = (A = w.currentTarget).setPointerCapture) == null || B.call(A, w.pointerId), p.current.set(w.pointerId, { clientX: w.clientX, clientY: w.clientY }), p.current.size >= 2) {
        $();
        return;
      }
      if (t) {
        const O = t;
        v.current = { pointerId: w.pointerId, mode: "rotate", sx: 0, sy: 0, cx: 0, cy: 0, moved: !1 }, y.current = { scenePath: O, startClientX: w.clientX, startClientY: w.clientY }, x().doc.get([`${O}/xRotation`, `${O}/yRotation`, `${O}/zRotation`]).then((Qe) => {
          y.current && y.current.scenePath === O && (y.current.startAngles = {
            x: Number(Qe[`${O}/xRotation`]) || 0,
            y: Number(Qe[`${O}/yRotation`]) || 0,
            z: Number(Qe[`${O}/zRotation`]) || 0
          }, k());
        });
        return;
      }
      const [T, z] = n(w.clientX, w.clientY), L = r(), I = w.clientX - ((L == null ? void 0 : L.left) ?? 0), V = w.clientY - ((L == null ? void 0 : L.top) ?? 0), H = w.pointerType === "mouse" ? w.shiftKey || w.button === 1 : !0;
      v.current = { pointerId: w.pointerId, mode: H ? "pan" : "zoom", sx: T, sy: z, cx: I, cy: V, moved: !1 }, H && x().render.pixelToData(T, z).then(async (O) => {
        if (!v.current) return;
        v.current.from = O.axes;
        const Qe = await C(O.axes.map((Yt) => Yt.path));
        v.current && (v.current.ranges = Qe);
      });
    }, onPointerMove: (w) => {
      if (p.current.has(w.pointerId) && p.current.set(w.pointerId, { clientX: w.clientX, clientY: w.clientY }), m.current) {
        M();
        return;
      }
      const T = v.current;
      if (T && T.pointerId === w.pointerId) {
        if (T.mode === "rotate") {
          const A = y.current, B = w.clientX - ((A == null ? void 0 : A.startClientX) ?? w.clientX), O = w.clientY - ((A == null ? void 0 : A.startClientY) ?? w.clientY);
          (Math.abs(B) > Or || Math.abs(O) > Or) && (T.moved || h(!0), T.moved = !0, R(w.clientX, w.clientY, w.shiftKey));
          return;
        }
        const [V, H] = n(w.clientX, w.clientY);
        if ((Math.abs(V - T.sx) > Or || Math.abs(H - T.sy) > Or) && (T.moved = !0), T.mode === "zoom" && T.moved) {
          const A = r(), B = w.clientX - ((A == null ? void 0 : A.left) ?? 0), O = w.clientY - ((A == null ? void 0 : A.top) ?? 0);
          i({
            left: Math.min(T.cx, B),
            top: Math.min(T.cy, O),
            width: Math.abs(B - T.cx),
            height: Math.abs(O - T.cy)
          });
        }
        return;
      }
      if (t || w.pointerType !== "mouse" || w.buttons !== 0) return;
      const z = performance.now();
      if (z - g.current < 40) return;
      g.current = z;
      const [L, I] = n(w.clientX, w.clientY);
      x().render.pixelToData(L, I).then((V) => {
        V.axes.forEach((xr) => d.current.add(xr.path));
        const H = Rm(V.axes);
        if (!H) {
          a(null);
          return;
        }
        const A = r() ?? { left: 0, top: 0, width: 0, height: 0 }, B = w.clientX - A.left, O = w.clientY - A.top, Qe = A.width > 0 && B > A.width * 0.6, Yt = A.height > 0 && O > A.height * 0.85;
        a({
          ...Qe ? { right: Math.max(4, A.width - B + 12) } : { left: B + 12 },
          top: Yt ? Math.max(4, O - 22) : O + 12,
          text: H
        });
      });
    }, onPointerUp: (w) => {
      var V, H;
      (H = (V = w.currentTarget).releasePointerCapture) == null || H.call(V, w.pointerId);
      const T = p.current.get(w.pointerId) ?? { clientX: w.clientX, clientY: w.clientY };
      if (m.current) {
        b(T, w.pointerId), p.current.delete(w.pointerId);
        return;
      }
      p.current.delete(w.pointerId);
      const z = v.current;
      if (!z || z.pointerId !== w.pointerId) return;
      if (v.current = null, z.mode === "rotate") {
        z.moved && R(w.clientX, w.clientY, w.shiftKey), h(!1);
        return;
      }
      if (i(null), !z.moved) return;
      const [L, I] = n(w.clientX, w.clientY);
      z.mode === "zoom" ? (async () => {
        const [A, B] = await Promise.all([
          x().render.pixelToData(z.sx, z.sy),
          x().render.pixelToData(L, I)
        ]), O = _m(A.axes, B.axes);
        O.length && await P(O);
      })() : z.mode === "pan" && z.from && z.ranges && (async () => {
        const A = await x().render.pixelToData(L, I), B = Pm(z.from, A.axes, z.ranges);
        B.length && await P(B);
      })();
    }, onPointerCancel: (w) => {
      p.current.delete(w.pointerId), m.current = null, v.current = null, D.current = null, h(!1), i(null), u(null);
    }, onPointerLeave: () => {
      a(null);
    }, onDoubleClick: () => {
      d.current.size && P(jm(d.current));
    } },
    band: l,
    tip: o,
    preview: s,
    rotating: f
  };
}
const Pl = 96, Tm = 1, Dm = 3;
function Dd() {
  const e = typeof window < "u" ? window.devicePixelRatio : 2;
  return !Number.isFinite(e) || e <= 0 ? 1 : Math.min(Dm, Math.max(Tm, e));
}
const Ys = 4096;
function Nd({
  store: e,
  width: t,
  height: n
}) {
  const r = e((k) => k.render), l = e((k) => k.tree), i = e((k) => k.currentPage), o = e((k) => k.values), a = e((k) => k.requestRender), s = E.useRef(null), u = E.useRef(null), f = E.useRef(null), h = E.useMemo(() => Dd(), []), d = E.useMemo(() => {
    let k = Math.max(1, Math.round(t * h)), R = Math.max(1, Math.round(n * h));
    const $ = Math.max(k, R);
    if ($ > Ys) {
      const M = Ys / $;
      k = Math.round(k * M), R = Math.round(R * M);
    }
    return { w: k, h: R };
  }, [t, n, h]), v = Math.round(Pl * (d.w / Math.max(t, 1))), y = E.useMemo(
    () => l ? ja(l.children[i] ?? null) : null,
    [l, i]
  ), [S, D] = E.useState({ w: t, h: n });
  E.useEffect(() => {
    const k = u.current;
    if (!k) return;
    const R = t > 0 ? n / t : 0.7143, $ = () => {
      const b = k.clientWidth, _ = k.clientHeight;
      let Q, me;
      if (b > 0 && _ > 0) {
        const ge = Math.min(b / t, _ / n);
        Q = t * ge, me = n * ge;
      } else b > 0 ? (Q = b, me = b * R) : (Q = t, me = n);
      D((ge) => Math.abs(ge.w - Q) < 0.5 && Math.abs(ge.h - me) < 0.5 ? ge : { w: Q, h: me });
    };
    if ($(), typeof ResizeObserver > "u") return;
    const M = new ResizeObserver($);
    return M.observe(k), () => M.disconnect();
  }, [t, n]), E.useEffect(() => {
    l && l.children.length > 0 && a(i, d.w, d.h, v);
  }, [l, o, i, d.w, d.h, a]), E.useEffect(() => {
    const k = r == null ? void 0 : r.sceneB64, R = s.current;
    if (!k || !R) return;
    let $ = !1;
    return (async () => {
      var M;
      try {
        const { renderSceneToCanvas: b } = await Promise.resolve().then(() => jd);
        $ || await b(R, k, [1, 1, 1, 1]);
      } catch (b) {
        if (!$) {
          const _ = b, Q = (_ == null ? void 0 : _.message) || ((M = _ == null ? void 0 : _.toString) == null ? void 0 : M.call(_)) || String(b);
          console.error("embed scene render failed:", Q), _ != null && _.stack && console.error(_.stack);
        }
      }
    })(), () => {
      $ = !0;
    };
  }, [r == null ? void 0 : r.sceneB64]);
  const m = (k, R) => {
    const M = s.current.getBoundingClientRect();
    return [
      (k - M.left) * (d.w / (M.width || 1)),
      (R - M.top) * (d.h / (M.height || 1))
    ];
  }, { handlers: p, band: g, tip: x, preview: P, rotating: C } = Td({
    store: e,
    scene3dPath: y,
    toRenderPx: m,
    getPlotRect: () => {
      var k;
      return ((k = s.current) == null ? void 0 : k.getBoundingClientRect()) ?? null;
    },
    requestRender: () => a(i, d.w, d.h, v)
  });
  return /* @__PURE__ */ c.jsx(
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
      onPointerLeave: p.onPointerLeave,
      children: /* @__PURE__ */ c.jsxs("div", { ref: f, style: { position: "relative", width: S.w, height: S.h }, children: [
        /* @__PURE__ */ c.jsx(
          "canvas",
          {
            ref: s,
            width: d.w,
            height: d.h,
            "data-testid": "embed-canvas",
            onPointerDown: p.onPointerDown,
            onPointerMove: p.onPointerMove,
            onPointerUp: p.onPointerUp,
            onPointerCancel: p.onPointerCancel,
            onDoubleClick: p.onDoubleClick,
            style: {
              width: "100%",
              height: "100%",
              display: "block",
              cursor: y ? C ? "grabbing" : "grab" : "crosshair",
              touchAction: "none",
              transform: P ? `translate(${P.tx}px, ${P.ty}px) scale(${P.scale})` : void 0,
              transformOrigin: P ? `${P.ox}px ${P.oy}px` : void 0
            }
          }
        ),
        g && /* @__PURE__ */ c.jsx("div", { "data-testid": "embed-zoomband", style: {
          position: "absolute",
          pointerEvents: "none",
          border: "1px solid #1f6feb",
          background: "rgba(31,111,235,0.12)",
          left: g.left,
          top: g.top,
          width: g.width,
          height: g.height
        } }),
        x && /* @__PURE__ */ c.jsx("div", { "data-testid": "embed-tooltip", style: {
          position: "absolute",
          left: x.left,
          right: x.right,
          top: x.top,
          pointerEvents: "none",
          background: "rgba(20,22,26,0.9)",
          color: "#fff",
          font: "12px system-ui",
          padding: "2px 6px",
          borderRadius: 4,
          whiteSpace: "nowrap",
          zIndex: 5
        }, children: x.text })
      ] })
    }
  );
}
function Md({
  store: e,
  width: t,
  height: n
}) {
  const r = e((C) => C.render), l = e((C) => C.tree), i = e((C) => C.values), o = e((C) => C.currentPage), a = e((C) => C.requestRender), s = E.useRef(null), u = E.useRef(null), [f, h] = E.useState(""), d = Math.max(1, Math.round(t)), v = Math.max(1, Math.round(n)), y = E.useMemo(
    () => l ? ja(l.children[o] ?? null) : null,
    [l, o]
  );
  E.useEffect(() => {
    l && l.children.length > 0 && a(o, d, v, Pl);
  }, [l, i, o, d, v, a]), E.useEffect(() => {
    const C = r == null ? void 0 : r.sceneB64;
    if (!C) return;
    let k = !0;
    return _a(C, r.width, r.height).then((R) => {
      k && h(R);
    }).catch(() => {
    }), () => {
      k = !1;
    };
  }, [r]), E.useEffect(() => {
    var k;
    const C = (k = s.current) == null ? void 0 : k.querySelector("svg");
    C && (C.getAttribute("viewBox") || C.setAttribute("viewBox", `0 0 ${(r == null ? void 0 : r.width) ?? d} ${(r == null ? void 0 : r.height) ?? v}`), C.removeAttribute("width"), C.removeAttribute("height"), C.style.width = "100%", C.style.height = "100%", C.style.display = "block");
  }, [f, r, d, v]);
  const S = () => {
    var k, R;
    const C = (k = u.current) == null ? void 0 : k.getBoundingClientRect();
    return C && C.width > 0 && C.height > 0 ? C : ((R = s.current) == null ? void 0 : R.getBoundingClientRect()) ?? null;
  }, D = (C, k) => {
    const R = S(), $ = (r == null ? void 0 : r.width) ?? d, M = (r == null ? void 0 : r.height) ?? v;
    return R ? [(C - R.left) / R.width * $, (k - R.top) / R.height * M] : [0, 0];
  }, { handlers: m, band: p, tip: g, preview: x, rotating: P } = Td({
    store: e,
    scene3dPath: y,
    toRenderPx: D,
    getPlotRect: () => S(),
    requestRender: () => a(o, d, v, Pl)
  });
  return /* @__PURE__ */ c.jsxs(
    "div",
    {
      ref: s,
      "data-testid": "embed-svg",
      style: {
        position: "relative",
        width: "100%",
        touchAction: "none",
        userSelect: "none",
        cursor: y ? P ? "grabbing" : "grab" : "crosshair"
      },
      onPointerDown: m.onPointerDown,
      onPointerMove: m.onPointerMove,
      onPointerUp: m.onPointerUp,
      onPointerCancel: m.onPointerCancel,
      onPointerLeave: m.onPointerLeave,
      onDoubleClick: m.onDoubleClick,
      children: [
        /* @__PURE__ */ c.jsx(
          "div",
          {
            ref: u,
            style: {
              width: "100%",
              // Lock the box to the figure aspect so its rect is stable across svg
              // replacements (the svg fills it). Pointer→data mapping reads this.
              aspectRatio: `${(r == null ? void 0 : r.width) ?? d} / ${(r == null ? void 0 : r.height) ?? v}`,
              transform: x ? `translate(${x.tx}px, ${x.ty}px) scale(${x.scale})` : void 0,
              transformOrigin: x ? `${x.ox}px ${x.oy}px` : void 0
            },
            dangerouslySetInnerHTML: { __html: f }
          }
        ),
        p && /* @__PURE__ */ c.jsx("div", { "data-testid": "embed-zoomband", style: {
          position: "absolute",
          pointerEvents: "none",
          border: "1px solid #1f6feb",
          background: "rgba(31,111,235,0.12)",
          zIndex: 2,
          left: p.left,
          top: p.top,
          width: p.width,
          height: p.height
        } }),
        g && /* @__PURE__ */ c.jsx("div", { "data-testid": "embed-tooltip", style: {
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
      ]
    }
  );
}
function Nm({
  root: e,
  selected: t,
  onSelect: n,
  onContextMenu: r,
  renamingPath: l,
  onRenameCommit: i,
  cutPaths: o
}) {
  const a = new Set(t), s = new Set(o ?? []);
  return /* @__PURE__ */ c.jsx("ul", { "data-testid": "tree", role: "tree", children: /* @__PURE__ */ c.jsx(
    Ld,
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
function Mm(e) {
  return e.shiftKey ? "range" : e.ctrlKey || e.metaKey ? "toggle" : "replace";
}
function Ld({
  node: e,
  selectedSet: t,
  cutSet: n,
  onSelect: r,
  onContextMenu: l,
  renamingPath: i,
  onRenameCommit: o
}) {
  const a = t.has(e.path), s = n.has(e.path), u = i === e.path;
  return /* @__PURE__ */ c.jsxs("li", { role: "treeitem", "aria-selected": a, children: [
    u ? /* @__PURE__ */ c.jsx(
      Lm,
      {
        initial: e.name,
        onCommit: (f) => o == null ? void 0 : o(e.path, f)
      }
    ) : /* @__PURE__ */ c.jsxs(
      "button",
      {
        type: "button",
        "data-testid": `tree-node-${e.path}`,
        "data-selected": a || void 0,
        "data-cut": s || void 0,
        style: s ? { opacity: 0.5 } : void 0,
        onClick: (f) => r(e.path, Mm(f)),
        onContextMenu: (f) => l == null ? void 0 : l(e.path, f),
        children: [
          /* @__PURE__ */ c.jsxs("span", { "data-testid": `tree-type-${e.path}`, children: [
            "[",
            e.type,
            "]"
          ] }),
          " ",
          /* @__PURE__ */ c.jsx("span", { "data-testid": `tree-name-${e.path}`, children: e.name || "/" })
        ]
      }
    ),
    e.children.length > 0 && /* @__PURE__ */ c.jsx("ul", { role: "group", children: e.children.map((f) => /* @__PURE__ */ c.jsx(
      Ld,
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
function Lm({
  initial: e,
  onCommit: t
}) {
  return /* @__PURE__ */ c.jsx(
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
function _o({ schema: e, value: t, onChange: n }) {
  const r = e.typename === "int", [l, i] = E.useState(
    () => t == null ? "" : String(t)
  );
  E.useEffect(() => {
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
  return /* @__PURE__ */ c.jsx(
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
function jo({ schema: e, value: t, onChange: n }) {
  const r = typeof t == "string" && t.toLowerCase() === "auto";
  return /* @__PURE__ */ c.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ c.jsxs("label", { children: [
      /* @__PURE__ */ c.jsx(
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
    !r && /* @__PURE__ */ c.jsx(
      _o,
      {
        schema: e,
        value: t,
        onChange: n
      }
    )
  ] });
}
function Im({ schema: e, value: t, onChange: n, siblings: r }) {
  if (!((r == null ? void 0 : r.mode) === "datetime"))
    return /* @__PURE__ */ c.jsx(jo, { schema: e, value: t, onChange: n });
  const i = typeof t == "string" ? t : "", o = i.toLowerCase() === "auto";
  return /* @__PURE__ */ c.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ c.jsxs("label", { children: [
      /* @__PURE__ */ c.jsx(
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
    !o && /* @__PURE__ */ c.jsx(
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
function $m({ schema: e, value: t, onChange: n }) {
  const r = !!t;
  return /* @__PURE__ */ c.jsx(
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
function Ne({ schema: e, value: t, onChange: n, editable: r = !1 }) {
  const l = e.vallist ?? [], i = e.uilist ?? l.map((a) => String(a)), o = t == null ? "" : String(t);
  return r && !l.includes(o) ? /* @__PURE__ */ c.jsx(
    "input",
    {
      type: "text",
      value: o,
      list: `opt-${e.name}`,
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (a) => n(a.target.value)
    }
  ) : /* @__PURE__ */ c.jsx(
    "select",
    {
      value: o,
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (a) => n(a.target.value),
      children: l.map((a, s) => /* @__PURE__ */ c.jsx("option", { value: String(a), children: i[s] ?? String(a) }, String(a)))
    }
  );
}
function Xs(e, t) {
  const n = (r) => `rgb(${r[0]},${r[1]},${r[2]})`;
  if (!e || !e.length) return "#e1e4e8";
  if (t) {
    const r = e.length;
    return "linear-gradient(to right," + e.map((l, i) => `${n(l)} ${(i / r * 100).toFixed(2)}% ${((i + 1) / r * 100).toFixed(2)}%`).join(",") + ")";
  }
  return "linear-gradient(to right," + e.map(n).join(",") + ")";
}
function Am({
  schema: e,
  value: t,
  onChange: n,
  colormaps: r = []
}) {
  const l = t == null ? "" : String(t), [i, o] = E.useState(!1), [a, s] = E.useState(""), u = E.useRef(null), f = E.useMemo(() => {
    const y = /* @__PURE__ */ new Map();
    for (const S of r) y.set(S.name, S);
    return y;
  }, [r]), h = E.useMemo(() => {
    const y = a.trim().toLowerCase();
    return y ? r.filter((S) => S.name.toLowerCase().includes(y)) : r;
  }, [r, a]);
  if (!r.length)
    return /* @__PURE__ */ c.jsx(
      "input",
      {
        type: "text",
        value: l,
        "data-testid": `setting-${e.name}`,
        "aria-label": e.usertext || e.name,
        onChange: (y) => n(y.target.value)
      }
    );
  const d = f.get(l) ?? null, v = (y) => {
    o(!1), s(""), n(y);
  };
  return /* @__PURE__ */ c.jsxs("span", { "data-testid": `setting-${e.name}`, style: { position: "relative", display: "inline-block", minWidth: 180 }, children: [
    /* @__PURE__ */ c.jsxs(
      "button",
      {
        type: "button",
        "data-testid": `setting-${e.name}-trigger`,
        "aria-label": e.usertext || e.name,
        onClick: () => {
          const y = !i;
          o(y), y && setTimeout(() => {
            var S;
            return (S = u.current) == null ? void 0 : S.focus();
          }, 0);
        },
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          cursor: "pointer",
          border: "1px solid #d0d7de",
          borderRadius: 6,
          padding: "2px 6px",
          background: "#fff"
        },
        children: [
          /* @__PURE__ */ c.jsx("span", { style: {
            flex: 1,
            height: 16,
            borderRadius: 3,
            border: "1px solid #00000022",
            minWidth: 40,
            background: d ? Xs(d.colors, d.step) : "#e1e4e8"
          } }),
          /* @__PURE__ */ c.jsx("span", { style: { font: "12px sans-serif", color: "#1f2328", whiteSpace: "nowrap" }, children: l || "(none)" }),
          /* @__PURE__ */ c.jsx("span", { style: { color: "#6e7781", fontSize: 10 }, children: i ? "▴" : "▾" })
        ]
      }
    ),
    i && /* @__PURE__ */ c.jsxs(
      "div",
      {
        "data-testid": `setting-${e.name}-panel`,
        style: {
          position: "absolute",
          zIndex: 30,
          left: 0,
          right: 0,
          marginTop: 4,
          border: "1px solid #d0d7de",
          borderRadius: 6,
          background: "#fff",
          boxShadow: "0 6px 18px #00000022",
          overflow: "hidden"
        },
        children: [
          /* @__PURE__ */ c.jsx(
            "input",
            {
              ref: u,
              type: "text",
              placeholder: "search colormaps…",
              value: a,
              "data-testid": `setting-${e.name}-search`,
              onChange: (y) => s(y.target.value),
              onKeyDown: (y) => {
                y.key === "Escape" && o(!1);
              },
              style: {
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                border: 0,
                borderBottom: "1px solid #eaeef2",
                padding: "5px 8px",
                font: "12px sans-serif",
                outline: "none"
              }
            }
          ),
          /* @__PURE__ */ c.jsxs("div", { style: { maxHeight: 220, overflow: "auto" }, children: [
            h.length === 0 && /* @__PURE__ */ c.jsx("div", { style: { padding: 8, color: "#8b949e", font: "12px sans-serif" }, children: "no match" }),
            h.map((y) => /* @__PURE__ */ c.jsxs(
              "div",
              {
                "data-testid": `cmap-opt-${y.name}`,
                onClick: () => v(y.name),
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "3px 8px",
                  cursor: "pointer",
                  background: y.name === l ? "#ddf4ff" : void 0
                },
                children: [
                  /* @__PURE__ */ c.jsx("span", { style: {
                    flex: 1,
                    height: 14,
                    borderRadius: 3,
                    border: "1px solid #00000022",
                    minWidth: 60,
                    background: Xs(y.colors, y.step)
                  } }),
                  /* @__PURE__ */ c.jsxs("span", { style: { font: "12px sans-serif", color: "#1f2328", whiteSpace: "nowrap" }, children: [
                    y.name,
                    y.step ? " ⋯" : ""
                  ] })
                ]
              },
              y.name
            ))
          ] })
        ]
      }
    )
  ] });
}
function Fm({ schema: e, value: t, onChange: n }) {
  const r = typeof t == "string" ? t : "auto", l = r === "auto", i = t == null ? void 0 : t.$ref;
  return /* @__PURE__ */ c.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ c.jsxs("label", { children: [
      /* @__PURE__ */ c.jsx(
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
    !l && /* @__PURE__ */ c.jsx(
      "input",
      {
        type: "color",
        value: Um(r),
        "data-testid": `setting-${e.name}-color`,
        "aria-label": e.usertext || e.name,
        onChange: (o) => n(o.target.value)
      }
    ),
    i && /* @__PURE__ */ c.jsxs("span", { "data-testid": `setting-${e.name}-ref`, children: [
      "ref: ",
      /* @__PURE__ */ c.jsx("code", { children: i })
    ] })
  ] });
}
const Gs = /* @__PURE__ */ new Map(), Om = {
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
function Um(e) {
  if (/^#[0-9a-fA-F]{6}$/.test(e)) return e;
  const t = Om[e.toLowerCase()];
  if (t) return t;
  if (typeof document > "u") return "#000000";
  const n = Gs.get(e);
  if (n) return n;
  const r = document.createElement("div");
  r.style.color = e, r.style.display = "none", document.body.appendChild(r);
  const l = getComputedStyle(r).color;
  document.body.removeChild(r);
  const i = l.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!i) return "#000000";
  const o = "#" + [i[1], i[2], i[3]].map((a) => parseInt(a, 10).toString(16).padStart(2, "0")).join("");
  return Gs.set(e, o), o;
}
function Ur({
  schema: e,
  value: t,
  onChange: n,
  datasets: r = []
}) {
  const l = t == null ? "" : String(t), i = `ds-${e.name}`;
  return /* @__PURE__ */ c.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ c.jsx(
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
    /* @__PURE__ */ c.jsx("datalist", { id: i, children: r.map((o) => /* @__PURE__ */ c.jsx("option", { value: o }, o)) })
  ] });
}
const Ks = /^(-?\d+(?:\.\d+)?)\s*(pt|cm|mm|in|%|\/)?$/;
function ji({ schema: e, value: t, onChange: n, allowAuto: r = !1 }) {
  const l = typeof t == "string" ? t : "", i = l.toLowerCase() === "auto", o = (() => {
    if (i) return { num: "", unit: "pt" };
    const d = l.match(Ks);
    return { num: (d == null ? void 0 : d[1]) ?? "", unit: (d == null ? void 0 : d[2]) ?? "pt" };
  })(), [a, s] = E.useState(o.num), [u, f] = E.useState(o.unit);
  E.useEffect(() => {
    if (i) return;
    const d = l.match(Ks);
    d && (s(d[1] ?? ""), f(d[2] ?? "pt"));
  }, [l, i]);
  const h = (d, v) => {
    d.trim() !== "" && n(`${d}${v}`);
  };
  return /* @__PURE__ */ c.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    r && /* @__PURE__ */ c.jsxs("label", { children: [
      /* @__PURE__ */ c.jsx(
        "input",
        {
          type: "checkbox",
          checked: i,
          "data-testid": `setting-${e.name}-auto`,
          "aria-label": "auto",
          onChange: (d) => n(d.target.checked ? "Auto" : "1pt")
        }
      ),
      "Auto"
    ] }),
    !i && /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
      /* @__PURE__ */ c.jsx(
        "input",
        {
          type: "text",
          inputMode: "decimal",
          value: a,
          "data-testid": `setting-${e.name}-num`,
          "aria-label": `${e.usertext || e.name} value`,
          onChange: (d) => s(d.target.value),
          onBlur: (d) => h(d.target.value, u),
          onKeyDown: (d) => {
            d.key === "Enter" && h(d.target.value, u);
          }
        }
      ),
      /* @__PURE__ */ c.jsx(
        "select",
        {
          value: u,
          "data-testid": `setting-${e.name}-unit`,
          "aria-label": `${e.usertext || e.name} unit`,
          onChange: (d) => {
            f(d.target.value), h(a, d.target.value);
          },
          children: ["pt", "cm", "mm", "in", "%"].map((d) => /* @__PURE__ */ c.jsx("option", { value: d, children: d }, d))
        }
      )
    ] })
  ] });
}
function Pi({
  schema: e,
  value: t,
  onChange: n,
  onBrowse: r
}) {
  const l = t == null ? "" : String(t);
  return /* @__PURE__ */ c.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ c.jsx(
      "input",
      {
        type: "text",
        value: l,
        "data-testid": `setting-${e.name}-path`,
        "aria-label": e.usertext || e.name,
        onChange: (i) => n(i.target.value)
      }
    ),
    r && /* @__PURE__ */ c.jsx(
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
function bm({ schema: e, value: t, onChange: n }) {
  const r = Bm(t), [l, i] = E.useState(r);
  E.useEffect(() => i(r), [r]);
  const o = (a) => {
    if (a.startsWith("=")) {
      n(a);
      return;
    }
    const s = a.split(`
`).map((f) => f.trim()).filter(Boolean), u = {};
    for (const f of s) {
      const [h, d] = f.split("=", 2).map((y) => y == null ? void 0 : y.trim());
      if (!h) continue;
      const v = Number(d);
      if (!Number.isFinite(v)) {
        n(a);
        return;
      }
      u[h] = v;
    }
    n(u);
  };
  return /* @__PURE__ */ c.jsx(
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
function Bm(e) {
  return typeof e == "string" ? e : e && typeof e == "object" && !Array.isArray(e) ? Object.entries(e).map(([t, n]) => `${t}=${n}`).join(`
`) : "";
}
function Wm({ schema: e, value: t, onChange: n }) {
  const r = Array.isArray(t) ? t.join(", ") : typeof t == "string" ? t : "", [l, i] = E.useState(r);
  E.useEffect(() => i(r), [r]);
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
  return /* @__PURE__ */ c.jsx(
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
function Vm({ schema: e, value: t, onChange: n }) {
  const r = typeof t == "number" ? t : Number(t) || 0, l = e.minval ?? 0, i = e.maxval ?? 100, o = e.step ?? 1;
  return /* @__PURE__ */ c.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ c.jsx(
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
    /* @__PURE__ */ c.jsx(
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
function Hm({ schema: e, value: t, onChange: n }) {
  const r = e.vallist ?? [];
  return /* @__PURE__ */ c.jsx(
    "select",
    {
      value: t == null ? "" : String(t),
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (l) => n(l.target.value),
      children: r.map((l) => /* @__PURE__ */ c.jsx("option", { value: l, children: l }, l))
    }
  );
}
function zi({ schema: e, value: t, onChange: n }) {
  const r = Array.isArray(t) ? JSON.stringify(t, null, 2) : "";
  return /* @__PURE__ */ c.jsx(
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
function Qm({ schema: e, value: t, onChange: n }) {
  const r = e.vallist ?? [];
  return /* @__PURE__ */ c.jsx(
    "select",
    {
      value: t == null ? "" : String(t),
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (l) => n(l.target.value),
      children: r.map((l) => /* @__PURE__ */ c.jsx("option", { value: l, children: l }, l))
    }
  );
}
function br({ schema: e, value: t, onChange: n }) {
  return /* @__PURE__ */ c.jsx(
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
function Ri({
  schema: e,
  value: t,
  onChange: n,
  candidates: r = []
}) {
  const l = t == null ? "" : String(t), i = `wp-${e.name}`;
  return /* @__PURE__ */ c.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ c.jsx(
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
    /* @__PURE__ */ c.jsx("datalist", { id: i, children: r.map((o) => /* @__PURE__ */ c.jsx("option", { value: o }, o)) })
  ] });
}
const Id = {
  // Atomic
  str: br,
  "str-notes": br,
  bool: $m,
  int: _o,
  float: _o,
  "float-or-auto": jo,
  "int-or-auto": jo,
  "float-slider": Vm,
  distance: ji,
  "distance-or-auto": (e) => /* @__PURE__ */ c.jsx(ji, { ...e, allowAuto: !0 }),
  displacement: ji,
  choice: Ne,
  "choice-or-more": (e) => /* @__PURE__ */ c.jsx(Ne, { ...e, editable: !0 }),
  "float-choice": (e) => /* @__PURE__ */ c.jsx(Ne, { ...e, editable: !0 }),
  color: Fm,
  colormap: Am,
  marker: Qm,
  arrow: Ne,
  "line-style": Hm,
  "fill-style": Ne,
  "fill-style-ext": Ne,
  "errorbar-style": Ne,
  "align-horz": Ne,
  "align-vert": Ne,
  "align-horz-+manual": Ne,
  "align-vert-+manual": Ne,
  "font-family": br,
  "font-style": br,
  "rotate-interval": Ne,
  "axis-bound": Im,
  // List / composite
  "float-list": Wm,
  "float-dict": bm,
  "str-multi": zi,
  "line-multi": zi,
  "fill-multi": zi,
  // Reference-by-path
  dataset: Ur,
  "dataset-multi": Ur,
  "dataset-extended": Ur,
  "dataset-or-str": Ur,
  "widget-path": Ri,
  "widget-choice": Ri,
  axis: Ri,
  // File-system
  filename: Pi,
  "filename-image": Pi,
  "filename-svg": Pi,
  // Internal — kept hidden by the inspector via `setting.hidden`,
  // but mapped here so the registry-coverage assertions report 100%.
  "backward-compat": () => null
};
new Set(
  Object.keys(Id)
);
function Ym(e) {
  return Id[e] ?? null;
}
function Xm(e) {
  var h;
  const t = e.widgetPaths[0], n = e.widgetPaths.length > 1, [r, l] = E.useState({}), i = (d, v) => r[d] ?? !$d(v), o = (d, v) => l((y) => ({ ...y, [d]: v })), [a, s] = E.useState(!1), u = (d, v) => {
    var D;
    if (!n) {
      e.onChange(d, v);
      return;
    }
    const y = d.slice(t.length), S = e.widgetPaths.map((m) => ({ path: m + y, value: v }));
    (D = e.onChangeMany) == null || D.call(e, S);
  }, f = n ? `${((h = e.schema.typenames) == null ? void 0 : h.join(", ")) ?? "widgets"} ×${e.widgetPaths.length}` : e.schema.typename ?? "";
  return /* @__PURE__ */ c.jsxs(
    "div",
    {
      "data-testid": "inspector",
      "data-widget": t,
      "data-multi": n || void 0,
      "data-count": e.widgetPaths.length,
      children: [
        /* @__PURE__ */ c.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
          /* @__PURE__ */ c.jsx("h3", { "data-testid": "inspector-title", style: { margin: "0.3em 0" }, children: f }),
          /* @__PURE__ */ c.jsxs(
            "label",
            {
              style: { fontSize: 12, color: "#666", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", whiteSpace: "nowrap" },
              title: "Show only settings changed from their default",
              children: [
                /* @__PURE__ */ c.jsx(
                  "input",
                  {
                    type: "checkbox",
                    "data-testid": "inspector-only-customised",
                    checked: a,
                    onChange: (d) => s(d.target.checked)
                  }
                ),
                "Only customised"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ c.jsx(
          Fd,
          {
            group: e.schema,
            basePath: t,
            widgetPath: t,
            values: e.values,
            datasets: e.datasets,
            colormaps: e.colormaps,
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
function $d(e) {
  if (e.setnsmode) return e.setnsmode === "formatting";
  const t = e.settings.filter((n) => !n.hidden);
  return t.length > 0 ? t.every((n) => n.formatting) : e.subgroups.length > 0 ? e.subgroups.every($d) : !1;
}
function Ad(e, t, n) {
  for (const r of e.settings)
    if (!r.hidden && !Pa(r, n[hr(t, r.name)], r.mixed_value === !0))
      return !0;
  for (const r of e.subgroups)
    if (Ad(r, hr(t, r.name), n)) return !0;
  return !1;
}
function Fd({ group: e, basePath: t, widgetPath: n, values: r, datasets: l, colormaps: i, onChange: o, settingMenu: a, groupLabel: s, groupOpen: u, setGroupOpen: f, hideDefaults: h }) {
  return /* @__PURE__ */ c.jsxs(E.Fragment, { children: [
    e.settings.map((d) => {
      if (d.hidden) return null;
      const v = r[hr(t, d.name)];
      return h && Pa(d, v, d.mixed_value === !0) ? null : /* @__PURE__ */ c.jsx(
        Km,
        {
          schema: d,
          basePath: t,
          widgetPath: n,
          value: v,
          datasets: l,
          colormaps: i,
          onChange: o,
          settingMenu: a,
          groupLabel: s
        },
        d.name
      );
    }),
    e.subgroups.map((d) => {
      const v = d.usertext || Zm(d.name), y = hr(t, d.name), S = Ad(d, y, r);
      if (h && !S) return null;
      const D = h ? S : u(y, d);
      return /* @__PURE__ */ c.jsxs(
        "details",
        {
          "data-testid": `subgroup-${d.name}`,
          "data-customised": S || void 0,
          open: D,
          onToggle: (m) => {
            const p = m.currentTarget, g = typeof p.open == "boolean" ? p.open : p.hasAttribute("open");
            g !== D && f(y, g);
          },
          children: [
            /* @__PURE__ */ c.jsx("summary", { style: { opacity: S ? 1 : 0.5, fontWeight: S ? 600 : 400 }, children: v }),
            /* @__PURE__ */ c.jsx(
              Fd,
              {
                group: d,
                basePath: y,
                widgetPath: n,
                values: r,
                datasets: l,
                colormaps: i,
                onChange: o,
                settingMenu: a,
                groupLabel: v,
                groupOpen: u,
                setGroupOpen: f,
                hideDefaults: h
              }
            )
          ]
        },
        d.name
      );
    })
  ] });
}
function Gm(e, t) {
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
function Pa(e, t, n) {
  return n ? !1 : t === void 0 ? !0 : Gm(t, e.default);
}
function Zs(e) {
  return {
    borderLeft: `2px solid ${e ? "transparent" : "#1f6feb"}`,
    paddingLeft: 6,
    opacity: e ? 0.5 : 1
  };
}
function Km({
  schema: e,
  basePath: t,
  widgetPath: n,
  value: r,
  datasets: l,
  colormaps: i,
  onChange: o,
  settingMenu: a,
  groupLabel: s
}) {
  const u = Ym(e.typename), f = hr(t, e.name), h = qm(e, s), d = e.mixed_value === !0, v = Pa(e, r, d), y = (S) => a ? a(
    {
      path: f,
      name: e.name,
      widgetPath: n,
      isReference: e.is_reference === !0,
      isStylesheet: f.startsWith("/StyleSheet/")
    },
    S
  ) : S;
  return u ? /* @__PURE__ */ c.jsxs(
    "div",
    {
      "data-testid": `row-${e.name}`,
      "data-mixed": d || void 0,
      "data-default": v || void 0,
      style: Zs(v),
      children: [
        y(
          /* @__PURE__ */ c.jsxs("label", { style: d ? { fontStyle: "italic", color: "#888" } : void 0, children: [
            h,
            d ? " (mixed)" : ""
          ] })
        ),
        /* @__PURE__ */ c.jsx(
          u,
          {
            schema: e,
            value: d ? void 0 : r,
            datasets: l,
            colormaps: i,
            onChange: (S) => o(f, S)
          }
        )
      ]
    }
  ) : /* @__PURE__ */ c.jsxs(
    "div",
    {
      "data-testid": `row-${e.name}`,
      "data-mixed": d || void 0,
      "data-default": v || void 0,
      style: Zs(v),
      children: [
        y(/* @__PURE__ */ c.jsx("label", { children: h })),
        /* @__PURE__ */ c.jsx("code", { "data-testid": `fallback-${e.name}`, children: r === void 0 ? "(unset)" : JSON.stringify(r) }),
        /* @__PURE__ */ c.jsxs("small", { children: [
          " [typename=",
          e.typename,
          "]"
        ] })
      ]
    }
  );
}
function hr(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
function Zm(e) {
  if (!e) return e;
  const t = e.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
const Jm = /* @__PURE__ */ new Set(["color", "hide", "width", "style"]);
function qm(e, t) {
  const n = e.usertext || e.name;
  return t ? Jm.has(e.name) ? `${t} ${n.toLowerCase()}` : n : e.name === "color" && e.descr ? e.descr : n;
}
function eg({
  store: e,
  mode: t,
  onClose: n,
  notify: r
}) {
  const l = e(), [i, o] = E.useState(!1), a = l.rpc, s = async (u) => {
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
  return /* @__PURE__ */ c.jsxs("div", { "data-testid": `datadlg-${t}`, style: { minWidth: 380, fontSize: 13 }, children: [
    t === "create1d" && /* @__PURE__ */ c.jsx(tg, { rpc: a, busy: i, run: s }),
    t === "create2d" && /* @__PURE__ */ c.jsx(ng, { rpc: a, busy: i, run: s }),
    t === "filter" && /* @__PURE__ */ c.jsx(rg, { rpc: a, datasets: l.datasets.map((u) => u.name), busy: i, run: s }),
    t === "histogram" && /* @__PURE__ */ c.jsx(lg, { rpc: a, datasets: l.datasets.map((u) => u.name), busy: i, run: s })
  ] });
}
function tg({ rpc: e, busy: t, run: n }) {
  const [r, l] = E.useState("newdata"), [i, o] = E.useState("expression"), [a, s] = E.useState(""), [u, f] = E.useState(100), [h, d] = E.useState(0), [v, y] = E.useState(1);
  return /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    /* @__PURE__ */ c.jsx(pe, { label: "Name", children: /* @__PURE__ */ c.jsx("input", { "data-testid": "dc-name", value: r, onChange: (S) => l(S.target.value) }) }),
    /* @__PURE__ */ c.jsx(pe, { label: "Method", children: /* @__PURE__ */ c.jsxs("select", { "data-testid": "dc-mode", value: i, onChange: (S) => o(S.target.value), children: [
      /* @__PURE__ */ c.jsx("option", { value: "expression", children: "Expression" }),
      /* @__PURE__ */ c.jsx("option", { value: "range", children: "Range (linspace)" }),
      /* @__PURE__ */ c.jsx("option", { value: "parametric", children: "Parametric" })
    ] }) }),
    (i === "expression" || i === "parametric") && /* @__PURE__ */ c.jsx(pe, { label: "Expression", children: /* @__PURE__ */ c.jsx("input", { "data-testid": "dc-expr", value: a, onChange: (S) => s(S.target.value), placeholder: i === "parametric" ? "cos(t)" : "x*2 + 1" }) }),
    (i === "range" || i === "parametric") && /* @__PURE__ */ c.jsxs(pe, { label: "Steps / min / max", children: [
      /* @__PURE__ */ c.jsx("input", { "data-testid": "dc-nsteps", type: "number", value: u, onChange: (S) => f(+S.target.value), style: nl }),
      /* @__PURE__ */ c.jsx("input", { "data-testid": "dc-min", type: "number", value: h, onChange: (S) => d(+S.target.value), style: nl }),
      /* @__PURE__ */ c.jsx("input", { "data-testid": "dc-max", type: "number", value: v, onChange: (S) => y(+S.target.value), style: nl })
    ] }),
    /* @__PURE__ */ c.jsx(Yl, { busy: t, testid: "dc-create", onClick: () => n(() => e.data.create({ name: r, mode: i, expr: a, nsteps: u, min: h, max: v })) })
  ] });
}
function ng({ rpc: e, busy: t, run: n }) {
  const [r, l] = E.useState("newdata2d"), [i, o] = E.useState("x+y"), [a, s] = E.useState("0,1,0.1"), [u, f] = E.useState("0,1,0.1");
  return /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    /* @__PURE__ */ c.jsx(pe, { label: "Name", children: /* @__PURE__ */ c.jsx("input", { "data-testid": "d2-name", value: r, onChange: (h) => l(h.target.value) }) }),
    /* @__PURE__ */ c.jsx(pe, { label: "z = f(x, y)", children: /* @__PURE__ */ c.jsx("input", { "data-testid": "d2-expr", value: i, onChange: (h) => o(h.target.value) }) }),
    /* @__PURE__ */ c.jsx(pe, { label: "x min,max,step", children: /* @__PURE__ */ c.jsx("input", { "data-testid": "d2-xstep", value: a, onChange: (h) => s(h.target.value) }) }),
    /* @__PURE__ */ c.jsx(pe, { label: "y min,max,step", children: /* @__PURE__ */ c.jsx("input", { "data-testid": "d2-ystep", value: u, onChange: (h) => f(h.target.value) }) }),
    /* @__PURE__ */ c.jsx(Yl, { busy: t, testid: "d2-create", onClick: () => n(() => e.data.create2d({
      name: r,
      mode: "xyfunc",
      expr: i,
      xstep: a.split(",").map(Number),
      ystep: u.split(",").map(Number)
    })) })
  ] });
}
function rg({ rpc: e, datasets: t, busy: n, run: r }) {
  const [l, i] = E.useState(""), [o, a] = E.useState([]), [s, u] = E.useState("f_"), [f, h] = E.useState(!1);
  return /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    /* @__PURE__ */ c.jsx(pe, { label: "Filter (e.g. x>0)", children: /* @__PURE__ */ c.jsx("input", { "data-testid": "flt-expr", value: l, onChange: (d) => i(d.target.value) }) }),
    /* @__PURE__ */ c.jsx(pe, { label: "Datasets", children: /* @__PURE__ */ c.jsx(
      "select",
      {
        "data-testid": "flt-datasets",
        multiple: !0,
        value: o,
        style: { minWidth: 160, minHeight: 60 },
        onChange: (d) => a([...d.target.selectedOptions].map((v) => v.value)),
        children: t.map((d) => /* @__PURE__ */ c.jsx("option", { value: d, children: d }, d))
      }
    ) }),
    /* @__PURE__ */ c.jsx(pe, { label: "Prefix", children: /* @__PURE__ */ c.jsx("input", { "data-testid": "flt-prefix", value: s, onChange: (d) => u(d.target.value) }) }),
    /* @__PURE__ */ c.jsx(pe, { label: "Invert", children: /* @__PURE__ */ c.jsx("input", { "data-testid": "flt-invert", type: "checkbox", checked: f, onChange: (d) => h(d.target.checked) }) }),
    /* @__PURE__ */ c.jsx(Yl, { busy: n, testid: "flt-run", onClick: () => r(() => e.data.filter({ filter: l, datasets: o, prefix: s, invert: f })) })
  ] });
}
function lg({ rpc: e, datasets: t, busy: n, run: r }) {
  const [l, i] = E.useState(t[0] ?? ""), [o, a] = E.useState("bins"), [s, u] = E.useState("counts"), [f, h] = E.useState(10), [d, v] = E.useState("counts");
  return /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    /* @__PURE__ */ c.jsx(pe, { label: "Input dataset/expr", children: /* @__PURE__ */ c.jsx("input", { "data-testid": "hist-expr", value: l, onChange: (y) => i(y.target.value) }) }),
    /* @__PURE__ */ c.jsxs(pe, { label: "Out bins / values", children: [
      /* @__PURE__ */ c.jsx("input", { "data-testid": "hist-outbins", value: o, onChange: (y) => a(y.target.value) }),
      /* @__PURE__ */ c.jsx("input", { "data-testid": "hist-outvals", value: s, onChange: (y) => u(y.target.value) })
    ] }),
    /* @__PURE__ */ c.jsx(pe, { label: "Bins", children: /* @__PURE__ */ c.jsx("input", { "data-testid": "hist-bins", type: "number", value: f, onChange: (y) => h(+y.target.value), style: nl }) }),
    /* @__PURE__ */ c.jsx(pe, { label: "Method", children: /* @__PURE__ */ c.jsxs("select", { "data-testid": "hist-method", value: d, onChange: (y) => v(y.target.value), children: [
      /* @__PURE__ */ c.jsx("option", { value: "counts", children: "Counts" }),
      /* @__PURE__ */ c.jsx("option", { value: "density", children: "Density" }),
      /* @__PURE__ */ c.jsx("option", { value: "fractions", children: "Fractions" })
    ] }) }),
    /* @__PURE__ */ c.jsx(Yl, { busy: n, testid: "hist-run", onClick: () => r(() => e.data.histogram({ expr: l, outbins: o, outvals: s, bins: f, method: d })) })
  ] });
}
function pe({ label: e, children: t }) {
  return /* @__PURE__ */ c.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }, children: [
    /* @__PURE__ */ c.jsx("span", { style: { flex: 1 }, children: e }),
    /* @__PURE__ */ c.jsx("span", { style: { display: "flex", gap: 4 }, children: t })
  ] });
}
function Yl({ busy: e, onClick: t, testid: n }) {
  return /* @__PURE__ */ c.jsx("div", { style: { textAlign: "right", marginTop: 8 }, children: /* @__PURE__ */ c.jsx("button", { type: "button", "data-testid": n, disabled: e, onClick: t, children: e ? "Working…" : "Create" }) });
}
const nl = { width: 70 }, ig = 1e5;
function og({
  store: e,
  notify: t,
  initialName: n
}) {
  const r = e(), l = r.datasets.map((g) => g.name), [i, o] = E.useState(n ?? r.selectedDatasets[0] ?? l[0] ?? ""), [a, s] = E.useState(""), [u, f] = E.useState(0), [h, d] = E.useState(0), [v, y] = E.useState(!1), [S, D] = E.useState(!1);
  E.useEffect(() => {
    if (!i) return;
    let g = !1;
    return y(!0), r.rpc.data.peek(i, 0, ig).then((x) => {
      g || (s(x.values.join(`
`)), f(x.total), d(x.values.length));
    }).catch((x) => {
      g || t(x.message);
    }).finally(() => {
      g || y(!1);
    }), () => {
      g = !0;
    };
  }, [i]);
  const m = u > h, p = async () => {
    const g = a.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean).map(Number);
    if (g.some((x) => Number.isNaN(x))) {
      t("All values must be numbers.");
      return;
    }
    D(!0);
    try {
      await r.rpc.data.set(i, g), await r.refreshDatasets(), t(`Saved ${i} (${g.length} values)`);
    } catch (x) {
      t(x.message);
    } finally {
      D(!1);
    }
  };
  return /* @__PURE__ */ c.jsxs("div", { "data-testid": "dataedit", style: { minWidth: 360, fontSize: 13 }, children: [
    /* @__PURE__ */ c.jsxs("label", { style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }, children: [
      /* @__PURE__ */ c.jsx("span", { children: "Dataset" }),
      /* @__PURE__ */ c.jsxs(
        "select",
        {
          "data-testid": "dataedit-name",
          value: i,
          onChange: (g) => o(g.target.value),
          children: [
            l.length === 0 && /* @__PURE__ */ c.jsx("option", { value: "", children: "(no datasets)" }),
            l.map((g) => /* @__PURE__ */ c.jsx("option", { value: g, children: g }, g))
          ]
        }
      ),
      /* @__PURE__ */ c.jsx("span", { style: { color: "#888", fontSize: 11 }, children: v ? "loading…" : u ? `${u} values` : "" })
    ] }),
    m && /* @__PURE__ */ c.jsxs("p", { "data-testid": "dataedit-truncated", style: { color: "#b45309", fontSize: 11 }, children: [
      "Showing first ",
      h,
      " of ",
      u,
      " — too large to edit here (read-only)."
    ] }),
    /* @__PURE__ */ c.jsx(
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
    /* @__PURE__ */ c.jsx("div", { style: { textAlign: "right", marginTop: 8 }, children: /* @__PURE__ */ c.jsx(
      "button",
      {
        type: "button",
        "data-testid": "dataedit-save",
        disabled: S || m || !i,
        onClick: () => void p(),
        children: S ? "Saving…" : "Save"
      }
    ) })
  ] });
}
const Js = [
  { id: "definition", label: "Definitions", nameHint: "pi  or  f(x)", valHint: "3.14159  or  x**2" },
  { id: "import", label: "Imports", nameHint: "numpy", valHint: "arange, sin" },
  { id: "color", label: "Colors", nameHint: "brand", valHint: "#ff8800" }
];
function ag({
  store: e,
  notify: t
}) {
  const n = e.getState().rpc, [r, l] = E.useState("definition"), [i, o] = E.useState([]), [a, s] = E.useState(!1);
  E.useEffect(() => {
    let d = !1;
    return n.doc.getCustoms().then((v) => {
      d || o((v[r] ?? []).map(([y, S]) => [y, String(S)]));
    }).catch((v) => t(v.message)), () => {
      d = !0;
    };
  }, [r]);
  const u = (d, v, y) => o((S) => S.map((D, m) => m === d ? v === 0 ? [y, D[1]] : [D[0], y] : D)), f = async () => {
    s(!0);
    try {
      const d = i.filter(([v]) => v.trim());
      await n.doc.setCustoms(r, d), t(`Saved ${d.length} ${r}(s)`);
    } catch (d) {
      t(d.message);
    } finally {
      s(!1);
    }
  }, h = Js.find((d) => d.id === r);
  return /* @__PURE__ */ c.jsxs("div", { "data-testid": "custom", style: { minWidth: 420, fontSize: 13 }, children: [
    /* @__PURE__ */ c.jsx("div", { style: { display: "flex", gap: 4, marginBottom: 8 }, children: Js.map((d) => /* @__PURE__ */ c.jsx(
      "button",
      {
        type: "button",
        "data-testid": `custom-tab-${d.id}`,
        "aria-pressed": r === d.id,
        onClick: () => l(d.id),
        style: { fontWeight: r === d.id ? 700 : 400 },
        children: d.label
      },
      d.id
    )) }),
    /* @__PURE__ */ c.jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ c.jsx("thead", { children: /* @__PURE__ */ c.jsxs("tr", { style: { color: "#888", textAlign: "left" }, children: [
        /* @__PURE__ */ c.jsx("th", { children: "Name" }),
        /* @__PURE__ */ c.jsx("th", { children: "Definition" }),
        /* @__PURE__ */ c.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ c.jsx("tbody", { "data-testid": "custom-rows", children: i.map((d, v) => /* @__PURE__ */ c.jsxs("tr", { children: [
        /* @__PURE__ */ c.jsx("td", { children: /* @__PURE__ */ c.jsx("input", { "data-testid": `custom-name-${v}`, value: d[0], placeholder: h.nameHint, onChange: (y) => u(v, 0, y.target.value), style: { width: "95%" } }) }),
        /* @__PURE__ */ c.jsx("td", { children: /* @__PURE__ */ c.jsx("input", { "data-testid": `custom-val-${v}`, value: d[1], placeholder: h.valHint, onChange: (y) => u(v, 1, y.target.value), style: { width: "95%" } }) }),
        /* @__PURE__ */ c.jsx("td", { children: /* @__PURE__ */ c.jsx("button", { type: "button", "data-testid": `custom-del-${v}`, onClick: () => o((y) => y.filter((S, D) => D !== v)), children: "✕" }) })
      ] }, v)) })
    ] }),
    /* @__PURE__ */ c.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 8 }, children: [
      /* @__PURE__ */ c.jsx("button", { type: "button", "data-testid": "custom-add", onClick: () => o((d) => [...d, ["", ""]]), children: "+ Add" }),
      /* @__PURE__ */ c.jsx("button", { type: "button", "data-testid": "custom-save", disabled: a, onClick: () => void f(), children: a ? "Saving…" : "Save" })
    ] })
  ] });
}
async function qe(e, t) {
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
const Kt = (e) => e.selected.length > 0, Od = [
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
function sg() {
  const e = {};
  for (const { items: t } of Od)
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
const Xl = {
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
    run: ({ store: e }) => qe("undo", e)
  },
  "edit.redo": {
    id: "edit.redo",
    label: "Redo",
    shortcut: "Ctrl+Shift+Z",
    enabled: (e) => e.canRedo,
    run: ({ store: e }) => qe("redo", e)
  },
  "edit.cut": {
    id: "edit.cut",
    label: "Cut",
    shortcut: "Ctrl+X",
    enabled: Kt,
    run: ({ store: e }) => qe("cut", e)
  },
  "edit.copy": {
    id: "edit.copy",
    label: "Copy",
    shortcut: "Ctrl+C",
    enabled: Kt,
    run: ({ store: e }) => qe("copy", e)
  },
  "edit.paste": {
    id: "edit.paste",
    label: "Paste",
    shortcut: "Ctrl+V",
    enabled: Kt,
    run: ({ store: e }) => qe("paste", e)
  },
  "edit.copyimage": {
    id: "edit.copyimage",
    label: "Copy as image",
    shortcut: "Ctrl+Alt+C",
    enabled: (e) => !!e.render,
    run: ({ store: e }) => qe("copyAsImage", e)
  },
  "edit.delete": {
    id: "edit.delete",
    label: "Delete",
    shortcut: "Del",
    enabled: Kt,
    run: ({ store: e }) => qe("delete", e)
  },
  "edit.moveup": {
    id: "edit.moveup",
    label: "Move up",
    shortcut: "Ctrl+Shift+PgUp",
    enabled: Kt,
    run: ({ store: e }) => qe("moveUp", e)
  },
  "edit.movedown": {
    id: "edit.movedown",
    label: "Move down",
    shortcut: "Ctrl+Shift+PgDn",
    enabled: Kt,
    run: ({ store: e }) => qe("moveDown", e)
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
  ...sg()
};
function Po(e, t) {
  return typeof e.label == "function" ? e.label(t) : e.label;
}
function ug({ t: e, height: t = 20 }) {
  return /* @__PURE__ */ c.jsxs(
    "span",
    {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: e.bg,
        border: "1px solid #00000022",
        borderRadius: 4,
        padding: "0 7px",
        height: t,
        minWidth: 96,
        overflow: "hidden",
        flex: "0 0 auto"
      },
      title: `${e.colorTheme} · ${e.font}`,
      children: [
        /* @__PURE__ */ c.jsx("span", { style: { font: `bold 12px ${e.font}, serif`, color: e.fg, lineHeight: 1 }, children: "Aa" }),
        /* @__PURE__ */ c.jsx("span", { style: { display: "inline-flex", gap: 2 }, children: e.palette.slice(0, 5).map((n, r) => /* @__PURE__ */ c.jsx("span", { style: { width: 7, height: 11, borderRadius: 1, background: n } }, r)) })
      ]
    }
  );
}
function cg({
  themes: e,
  onApply: t,
  disabled: n
}) {
  const [r, l] = E.useState(!1), i = E.useRef(null);
  if (!e.length) return null;
  const o = (a) => {
    l(!1), t(a);
  };
  return /* @__PURE__ */ c.jsxs("span", { ref: i, "data-testid": "theme-picker", style: { position: "relative", display: "inline-block" }, children: [
    /* @__PURE__ */ c.jsxs(
      "button",
      {
        type: "button",
        "data-testid": "theme-picker-trigger",
        "aria-label": "Document theme",
        disabled: n,
        onClick: () => l((a) => !a),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: n ? "default" : "pointer",
          border: "1px solid #d0d7de",
          borderRadius: 6,
          padding: "2px 8px",
          background: "#fff",
          font: "12px sans-serif",
          color: "#1f2328",
          opacity: n ? 0.6 : 1
        },
        children: [
          /* @__PURE__ */ c.jsx("span", { "aria-hidden": !0, children: "🎨" }),
          /* @__PURE__ */ c.jsx("span", { children: "Theme" }),
          /* @__PURE__ */ c.jsx("span", { style: { color: "#6e7781", fontSize: 10 }, children: r ? "▴" : "▾" })
        ]
      }
    ),
    r && /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
      /* @__PURE__ */ c.jsx(
        "div",
        {
          onClick: () => l(!1),
          style: { position: "fixed", inset: 0, zIndex: 39 }
        }
      ),
      /* @__PURE__ */ c.jsxs(
        "div",
        {
          "data-testid": "theme-picker-panel",
          style: {
            position: "absolute",
            zIndex: 40,
            right: 0,
            marginTop: 4,
            width: 280,
            border: "1px solid #d0d7de",
            borderRadius: 8,
            background: "#fff",
            boxShadow: "0 8px 24px #00000026",
            overflow: "hidden"
          },
          children: [
            /* @__PURE__ */ c.jsx("div", { style: {
              padding: "6px 10px",
              font: "11px sans-serif",
              color: "#6e7781",
              borderBottom: "1px solid #eaeef2"
            }, children: "Apply a theme to this document" }),
            /* @__PURE__ */ c.jsx("div", { style: { maxHeight: 320, overflow: "auto" }, children: e.map((a) => /* @__PURE__ */ c.jsxs(
              "div",
              {
                "data-testid": `theme-opt-${a.id}`,
                onClick: () => o(a.id),
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f3f5f8"
                },
                onMouseEnter: (s) => {
                  s.currentTarget.style.background = "#f6f8fa";
                },
                onMouseLeave: (s) => {
                  s.currentTarget.style.background = "";
                },
                children: [
                  /* @__PURE__ */ c.jsx(ug, { t: a }),
                  /* @__PURE__ */ c.jsxs("span", { style: { minWidth: 0 }, children: [
                    /* @__PURE__ */ c.jsx("span", { style: { display: "block", font: "12px sans-serif", color: "#1f2328", fontWeight: 600 }, children: a.label }),
                    /* @__PURE__ */ c.jsx("span", { style: {
                      display: "block",
                      font: "11px sans-serif",
                      color: "#6e7781",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }, children: a.description })
                  ] })
                ]
              },
              a.id
            )) })
          ]
        }
      )
    ] })
  ] });
}
function Ud({ store: e, ctx: t, density: n, onReload: r }) {
  var s;
  const l = e(), i = ((s = l.tree) == null ? void 0 : s.children.length) ?? 0, o = n === "inline", a = l.datasets.some((u) => u.linked);
  return /* @__PURE__ */ c.jsxs(
    "div",
    {
      "data-testid": o ? "embed-toolbar-inline" : "embed-toolbar-full",
      style: o ? gg : vg,
      children: [
        /* @__PURE__ */ c.jsx(fg, { state: l, ctx: t, compact: o }),
        /* @__PURE__ */ c.jsx(Xe, { id: "edit.undo", state: l, ctx: t, label: "↶", title: "Undo" }),
        /* @__PURE__ */ c.jsx(Xe, { id: "edit.redo", state: l, ctx: t, label: "↷", title: "Redo" }),
        a && /* @__PURE__ */ c.jsx(dg, { ctx: t, compact: o, onReload: r }),
        !o && /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
          /* @__PURE__ */ c.jsx(An, {}),
          /* @__PURE__ */ c.jsx(Xe, { id: "edit.cut", state: l, ctx: t, label: "✂ Cut" }),
          /* @__PURE__ */ c.jsx(Xe, { id: "edit.copy", state: l, ctx: t, label: "⧉ Copy" }),
          /* @__PURE__ */ c.jsx(Xe, { id: "edit.paste", state: l, ctx: t, label: "↥ Paste" }),
          /* @__PURE__ */ c.jsx(Xe, { id: "edit.delete", state: l, ctx: t, label: "🗑 Delete" }),
          /* @__PURE__ */ c.jsx(An, {}),
          /* @__PURE__ */ c.jsx(Xe, { id: "edit.moveup", state: l, ctx: t, label: "▲", title: "Move up" }),
          /* @__PURE__ */ c.jsx(Xe, { id: "edit.movedown", state: l, ctx: t, label: "▼", title: "Move down" }),
          /* @__PURE__ */ c.jsx(An, {}),
          /* @__PURE__ */ c.jsx(hg, { state: l, ctx: t }),
          /* @__PURE__ */ c.jsx(An, {}),
          /* @__PURE__ */ c.jsx(mg, { store: e }),
          i > 1 && /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
            /* @__PURE__ */ c.jsx(An, {}),
            /* @__PURE__ */ c.jsx(Xe, { id: "view.prevpage", state: l, ctx: t, label: "◀", title: "Previous page" }),
            /* @__PURE__ */ c.jsxs(
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
            /* @__PURE__ */ c.jsx(Xe, { id: "view.nextpage", state: l, ctx: t, label: "▶", title: "Next page" })
          ] })
        ] })
      ]
    }
  );
}
function Xe({
  id: e,
  state: t,
  ctx: n,
  label: r,
  title: l
}) {
  const i = Xl[e];
  if (!i || !(i.visible ? i.visible(t) : !0)) return null;
  const a = i.enabled ? i.enabled(t) : !0, s = r ?? Po(i, t), u = l ?? Po(i, t) + (i.shortcut ? `  (${i.shortcut})` : "");
  return /* @__PURE__ */ c.jsx(
    "button",
    {
      type: "button",
      "data-testid": `embed-action-${e}`,
      onClick: () => {
        i.run(n);
      },
      disabled: !a,
      title: u,
      style: Gl(a),
      children: s
    }
  );
}
function An() {
  return /* @__PURE__ */ c.jsx("span", { style: { width: 1, height: 18, background: "#e2e4e8" } });
}
function dg({
  ctx: e,
  compact: t,
  onReload: n
}) {
  const [r, l] = E.useState(!1), i = Xl["data.reload"], o = async () => {
    if (!r) {
      l(!0);
      try {
        n ? await n() : i && await i.run(e);
      } finally {
        l(!1);
      }
    }
  }, a = (i != null && i.shortcut ? `Reload data  (${i.shortcut})` : "Reload data") + (n ? " — refetch URL sources and reload linked files" : "");
  return /* @__PURE__ */ c.jsxs(
    "button",
    {
      type: "button",
      "data-testid": "embed-action-data.reload",
      onClick: () => {
        o();
      },
      disabled: r,
      title: a,
      style: Gl(!r),
      children: [
        r ? "⟳" : "↻",
        t ? "" : " Reload"
      ]
    }
  );
}
function fg({
  state: e,
  ctx: t,
  compact: n
}) {
  const [r, l] = E.useState(!1), i = E.useRef(null);
  return E.useEffect(() => {
    if (!r) return;
    const o = (s) => {
      i.current && !i.current.contains(s.target) && l(!1);
    }, a = (s) => {
      s.key === "Escape" && l(!1);
    };
    return document.addEventListener("mousedown", o), document.addEventListener("keydown", a), () => {
      document.removeEventListener("mousedown", o), document.removeEventListener("keydown", a);
    };
  }, [r]), /* @__PURE__ */ c.jsxs("div", { ref: i, style: { position: "relative" }, "data-testid": "embed-insert", children: [
    /* @__PURE__ */ c.jsxs(
      "button",
      {
        type: "button",
        "data-testid": "embed-insert-btn",
        onClick: () => l((o) => !o),
        "aria-expanded": r,
        title: "Insert a new element",
        style: Gl(!0),
        children: [
          "＋ ",
          n ? "" : "Insert ",
          "▾"
        ]
      }
    ),
    r && /* @__PURE__ */ c.jsx("div", { role: "menu", "data-testid": "embed-insert-menu", style: bd, children: Od.map((o) => /* @__PURE__ */ c.jsxs(E.Fragment, { children: [
      /* @__PURE__ */ c.jsx("div", { style: yg, children: o.group }),
      o.items.map(([a, s]) => {
        const u = `add.${a}`, f = Xl[u];
        if (!f) return null;
        const h = f.enabled ? f.enabled(e) : !0;
        return /* @__PURE__ */ c.jsx(
          "button",
          {
            type: "button",
            "data-testid": `embed-insert-${a}`,
            onClick: () => {
              h && (l(!1), f.run(t));
            },
            disabled: !h,
            title: h ? s : `${s} — not allowed from the current selection`,
            style: Bd(h),
            children: s
          },
          a
        );
      })
    ] }, o.group)) })
  ] });
}
const pg = [
  "data.create",
  "data.create2d",
  "data.filter",
  "data.histogram",
  "data.edit",
  "edit.custom"
];
function hg({ state: e, ctx: t }) {
  const [n, r] = E.useState(!1), l = E.useRef(null);
  return E.useEffect(() => {
    if (!n) return;
    const i = (o) => {
      l.current && !l.current.contains(o.target) && r(!1);
    };
    return document.addEventListener("mousedown", i), () => document.removeEventListener("mousedown", i);
  }, [n]), /* @__PURE__ */ c.jsxs("div", { ref: l, style: { position: "relative" }, "data-testid": "embed-data", children: [
    /* @__PURE__ */ c.jsx(
      "button",
      {
        type: "button",
        "data-testid": "embed-data-btn",
        onClick: () => r((i) => !i),
        "aria-expanded": n,
        title: "Data operations",
        style: Gl(!0),
        children: "∑ Data ▾"
      }
    ),
    n && /* @__PURE__ */ c.jsx("div", { role: "menu", "data-testid": "embed-data-menu", style: bd, children: pg.map((i) => {
      const o = Xl[i];
      if (!o) return null;
      const a = o.enabled ? o.enabled(e) : !0;
      return /* @__PURE__ */ c.jsx(
        "button",
        {
          type: "button",
          "data-testid": `embed-data-${i}`,
          onClick: () => {
            a && (r(!1), o.run(t));
          },
          disabled: !a,
          style: Bd(a),
          children: Po(o, e)
        },
        i
      );
    }) })
  ] });
}
function mg({ store: e }) {
  const t = e((o) => o.themes), n = e((o) => o.applyTheme), [r, l] = E.useState(!1), i = async (o) => {
    if (!r) {
      l(!0);
      try {
        await n(o);
      } finally {
        l(!1);
      }
    }
  };
  return /* @__PURE__ */ c.jsx(cg, { themes: t, onApply: (o) => void i(o), disabled: r });
}
const gg = { display: "flex", gap: 4, alignItems: "center" }, vg = {
  display: "flex",
  gap: 4,
  alignItems: "center",
  flexWrap: "wrap"
}, bd = {
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
}, yg = {
  fontSize: 10.5,
  color: "#888",
  textTransform: "uppercase",
  padding: "6px 6px 2px",
  letterSpacing: "0.04em"
}, Bd = (e) => ({
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
}), Gl = (e) => ({
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 9px",
  cursor: e ? "pointer" : "default",
  fontSize: 12,
  lineHeight: 1.2,
  background: "#fff",
  color: e ? "#222" : "#aaa"
});
function Wd(e, t) {
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
function wg({
  store: e,
  title: t,
  width: n,
  height: r,
  renderer: l = "vello",
  toolbar: i,
  onReload: o,
  onClose: a
}) {
  const s = l === "svg" ? Md : Nd, u = e((_) => _.tree), f = e((_) => _.selected), h = e((_) => _.schema), d = e((_) => _.values), v = e((_) => _.datasets), y = e((_) => _.colormaps), S = e((_) => _.error), [D, m] = E.useState(!1), [p, g] = E.useState(!1), [x, P] = E.useState(null);
  E.useEffect(() => {
    if (typeof document > "u") return;
    const _ = document.documentElement, Q = document.body, me = _.style.overflow, ge = Q.style.overflow;
    return _.style.overflow = "hidden", Q.style.overflow = "hidden", () => {
      _.style.overflow = me, Q.style.overflow = ge;
    };
  }, []);
  const C = async () => {
    g(!0);
    try {
      for (let _ = 0; _ < 1e3 && e.getState().canUndo; _++)
        await e.getState().undo();
    } finally {
      g(!1);
    }
  }, k = /* @__PURE__ */ new Set([
    "dataCreate",
    "dataCreate2d",
    "filter",
    "histogram",
    "dataEdit",
    "custom"
  ]), R = Wd(e, {
    notify: (_) => e.setState({ error: _ }),
    openDialog: (_) => {
      k.has(_) ? P(_) : e.setState({ error: `"${_}" dialog is unavailable in the embed.` });
    },
    toggleFullScreen: () => m((_) => !_)
  }), $ = {
    dataCreate: "create1d",
    dataCreate2d: "create2d",
    filter: "filter",
    histogram: "histogram"
  }, M = () => P(null), b = (_) => e.setState({ error: _ });
  return md.createPortal(
    /* @__PURE__ */ c.jsx(
      "div",
      {
        "data-testid": "veusz-modal",
        style: Sg,
        onMouseDown: (_) => {
          _.target === _.currentTarget && a();
        },
        children: /* @__PURE__ */ c.jsxs("div", { style: D ? kg : Vd, "data-testid": "veusz-modal-window", children: [
          /* @__PURE__ */ c.jsxs("header", { style: Eg, children: [
            /* @__PURE__ */ c.jsx("strong", { style: { fontSize: 14 }, children: t ?? "Edit figure" }),
            /* @__PURE__ */ c.jsx(Ud, { store: e, density: "full", ctx: R, onReload: o }),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                type: "button",
                "data-testid": "veusz-reset",
                onClick: () => void C(),
                disabled: !e.getState().canUndo || p,
                style: Br,
                title: "Reset all edits to the original figure",
                children: "⟲ Reset"
              }
            ),
            S && /* @__PURE__ */ c.jsx("span", { "data-testid": "veusz-error", style: { color: "crimson", fontSize: 12 }, children: S }),
            /* @__PURE__ */ c.jsx("span", { style: { flex: 1 } }),
            i,
            /* @__PURE__ */ c.jsx(
              "button",
              {
                type: "button",
                "data-testid": "veusz-modal-fullscreen",
                onClick: () => m((_) => !_),
                style: Br,
                title: D ? "Exit full screen" : "Full screen",
                children: D ? "🗗" : "⛶"
              }
            ),
            /* @__PURE__ */ c.jsx(
              "button",
              {
                type: "button",
                "data-testid": "veusz-modal-close",
                onClick: a,
                style: Br,
                title: "Close (Esc)",
                children: "✕"
              }
            )
          ] }),
          /* @__PURE__ */ c.jsxs("div", { style: Cg, children: [
            /* @__PURE__ */ c.jsx("div", { style: _g, children: /* @__PURE__ */ c.jsx(s, { store: e, width: n, height: r }) }),
            /* @__PURE__ */ c.jsxs("aside", { style: jg, "data-testid": "veusz-edit-panel", children: [
              u ? /* @__PURE__ */ c.jsx(
                Nm,
                {
                  root: u,
                  selected: f,
                  onSelect: (_) => {
                    e.getState().select([_]);
                  }
                }
              ) : /* @__PURE__ */ c.jsx("p", { style: { color: "#888" }, children: "Loading…" }),
              /* @__PURE__ */ c.jsx("hr", { style: { border: 0, borderTop: "1px solid #eee", margin: "8px 0" } }),
              h && f.length > 0 ? /* @__PURE__ */ c.jsx(
                Xm,
                {
                  schema: h,
                  widgetPaths: f,
                  values: d,
                  datasets: v.map((_) => _.name),
                  colormaps: y,
                  onChange: (_, Q) => {
                    e.getState().setValue(_, Q);
                  },
                  onChangeMany: (_) => {
                    e.getState().setValues(_);
                  }
                }
              ) : /* @__PURE__ */ c.jsx("p", { style: { color: "#888", fontSize: 13 }, children: "Select a widget to edit." })
            ] })
          ] }),
          x && /* @__PURE__ */ c.jsx(
            "div",
            {
              style: Pg,
              onMouseDown: (_) => {
                _.target === _.currentTarget && M();
              },
              children: /* @__PURE__ */ c.jsxs(
                "div",
                {
                  style: zg,
                  "data-testid": `embed-dialog-${x}`,
                  children: [
                    /* @__PURE__ */ c.jsxs("div", { style: Rg, children: [
                      /* @__PURE__ */ c.jsx("strong", { style: { fontSize: 13 }, children: xg[x] }),
                      /* @__PURE__ */ c.jsx("span", { style: { flex: 1 } }),
                      /* @__PURE__ */ c.jsx(
                        "button",
                        {
                          type: "button",
                          "data-testid": "embed-dialog-close",
                          onClick: M,
                          style: Br,
                          children: "Close"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ c.jsxs("div", { style: { padding: 12 }, children: [
                      $[x] && /* @__PURE__ */ c.jsx(
                        eg,
                        {
                          store: e,
                          mode: $[x],
                          onClose: M,
                          notify: b
                        }
                      ),
                      x === "dataEdit" && /* @__PURE__ */ c.jsx(og, { store: e, notify: b }),
                      x === "custom" && /* @__PURE__ */ c.jsx(ag, { store: e, notify: b })
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
const xg = {
  dataCreate: "Create dataset",
  dataCreate2d: "Create 2D dataset",
  filter: "Filter data",
  histogram: "Histogram",
  dataEdit: "Data editor",
  custom: "Custom definitions"
}, Sg = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,17,21,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1e3,
  font: "14px system-ui, sans-serif"
}, Vd = {
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
}, kg = {
  ...Vd,
  width: "100vw",
  height: "100vh",
  borderRadius: 0,
  resize: "none"
}, Eg = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
  background: "#fafbfc",
  flex: "0 0 auto"
}, Br = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
  padding: "3px 9px",
  lineHeight: 1
}, Cg = {
  flex: "1 1 auto",
  display: "flex",
  minHeight: 0,
  alignItems: "stretch"
}, _g = {
  flex: "1 1 auto",
  minWidth: 0,
  minHeight: 0,
  padding: 10,
  background: "#fff"
}, jg = {
  flex: "0 0 320px",
  width: 320,
  borderLeft: "1px solid #eee",
  padding: 10,
  overflow: "auto",
  overscrollBehavior: "contain",
  background: "#fff"
}, Pg = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.30)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10
}, zg = {
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  minWidth: 420,
  maxWidth: "90%",
  maxHeight: "85%",
  overflow: "auto"
}, Rg = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderBottom: "1px solid #eee"
};
function qs({ items: e, disabled: t, busy: n }) {
  const [r, l] = E.useState(!1), i = E.useRef(null);
  return E.useEffect(() => {
    if (!r) return;
    const o = (s) => {
      i.current && !i.current.contains(s.target) && l(!1);
    }, a = (s) => {
      s.key === "Escape" && l(!1);
    };
    return document.addEventListener("mousedown", o), document.addEventListener("keydown", a), () => {
      document.removeEventListener("mousedown", o), document.removeEventListener("keydown", a);
    };
  }, [r]), /* @__PURE__ */ c.jsxs("div", { ref: i, style: { position: "relative" }, children: [
    /* @__PURE__ */ c.jsx(
      "button",
      {
        type: "button",
        "data-testid": "veusz-download",
        disabled: t,
        "aria-haspopup": "menu",
        "aria-expanded": r,
        onClick: () => l((o) => !o),
        style: Tg,
        title: "Download this figure",
        children: n ? "…" : "⤓ Download ▾"
      }
    ),
    r && /* @__PURE__ */ c.jsx("div", { role: "menu", "data-testid": "veusz-download-menu", style: Dg, children: e.map((o) => {
      const a = /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
        o.label,
        o.hint && /* @__PURE__ */ c.jsx("span", { style: { color: "#8b94a3", marginLeft: 8, fontSize: 11 }, children: o.hint })
      ] }), s = o.label, u = `download-${o.label.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
      return o.href ? /* @__PURE__ */ c.jsx(
        "a",
        {
          role: "menuitem",
          "data-testid": u,
          href: o.href,
          download: o.download,
          onClick: () => l(!1),
          style: eu,
          children: a
        },
        s
      ) : /* @__PURE__ */ c.jsx(
        "button",
        {
          type: "button",
          role: "menuitem",
          "data-testid": u,
          onClick: () => {
            var f;
            l(!1), (f = o.onSelect) == null || f.call(o);
          },
          style: eu,
          children: a
        },
        s
      );
    }) })
  ] });
}
const Tg = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 10px",
  cursor: "pointer",
  fontSize: 12,
  background: "#fff",
  color: "#222"
}, Dg = {
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
}, eu = {
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
}, tu = "veusz-embed-styles", Ng = `
.vz-fig { position: relative; }
.vz-fig .vz-inline { display: block; }
.vz-fig .vz-preview { display: block; width: 100%; height: auto; background: #fff; }
`;
function Hd() {
  if (typeof document > "u" || document.getElementById(tu)) return;
  const e = document.createElement("style");
  e.id = tu, e.textContent = Ng, document.head.appendChild(e);
}
const vn = 2;
async function Mg(e, t) {
  const { rpc: n } = e.getState(), r = await n.render.scene(t.page, t.width, t.height, t.dpi ?? 96), l = await _a(r.scene_b64, r.width, r.height);
  $g(l, t.filename ?? "figure.svg", "image/svg+xml");
}
async function Lg(e, t) {
  const { rpc: n } = e.getState(), r = t.width * vn, l = t.height * vn, i = await n.render.scene(t.page, r, l, (t.dpi ?? 96) * vn), o = await Hl(i.scene_b64, i.width, i.height, "image/png");
  za(o, t.filename ?? "figure.png");
}
async function Ig(e, t) {
  const { rpc: n } = e.getState(), r = t.width * vn, l = t.height * vn, i = await n.render.scene(t.page, r, l, (t.dpi ?? 96) * vn), o = await Hl(i.scene_b64, i.width, i.height, "image/jpeg"), a = new Uint8Array(await o.arrayBuffer()), s = Ag(a, i.width, i.height, t.width, t.height);
  za(new Blob([s], { type: "application/pdf" }), t.filename ?? "figure.pdf");
}
function $g(e, t, n) {
  za(new Blob([e], { type: n }), t);
}
function za(e, t) {
  const n = URL.createObjectURL(e), r = document.createElement("a");
  r.href = n, r.download = t, document.body.appendChild(r), r.click(), r.remove(), setTimeout(() => URL.revokeObjectURL(n), 1e3);
}
function Ag(e, t, n, r, l) {
  const i = new TextEncoder(), o = [], a = [];
  let s = 0;
  const u = (D) => {
    const m = typeof D == "string" ? i.encode(D) : D;
    o.push(m), s += m.length;
  }, f = (D, m) => {
    a[D] = s, u(`${D} 0 obj
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
  const h = `q
${r} 0 0 ${l} 0 0 cm
/Im0 Do
Q
`;
  f(5, `<< /Length ${h.length} >>
stream
${h}endstream`);
  const d = s;
  let v = `xref
0 6
0000000000 65535 f 
`;
  for (let D = 1; D <= 5; D++) v += `${String(a[D]).padStart(10, "0")} 00000 n 
`;
  u(v), u(`trailer
<< /Size 6 /Root 1 0 R >>
startxref
${d}
%%EOF
`);
  const y = new Uint8Array(s);
  let S = 0;
  for (const D of o)
    y.set(D, S), S += D.length;
  return y;
}
Hd();
function Qd({
  store: e,
  width: t = 700,
  height: n = 500,
  editable: r = !0,
  title: l,
  poster: i,
  vszUrl: o,
  initialEditing: a,
  renderer: s = "vello",
  onReload: u
}) {
  const f = s === "svg" ? Md : Nd, h = e((_) => _.error), d = e((_) => _.webgpuAvailable), v = e((_) => _.currentPage), [y, S] = E.useState(!!a), [D, m] = E.useState(!1), [p, g] = E.useState(!1), [x, P] = E.useState(i), C = E.useRef(null);
  E.useEffect(() => {
    Hd();
    const _ = e.getState();
    return _.setBackend("vello-wasm"), _.probeWebgpu(), _.loadPlotPrefs(), _.refreshAll(), _.subscribeToDaemon();
  }, [e]), E.useEffect(() => {
    let _ = !0;
    return _d().then((Q) => {
      _ && m(Q);
    }), () => {
      _ = !1;
    };
  }, []), E.useEffect(() => () => {
    C.current && URL.revokeObjectURL(C.current);
  }, []);
  const k = (_) => `${(l ?? "figure").replace(/\s+/g, "_")}.${_}`, R = async (_, Q) => {
    g(!0);
    try {
      await _();
    } catch (me) {
      e.setState({ error: `${Q} failed: ${me.message}` });
    } finally {
      g(!1);
    }
  }, $ = async () => {
    try {
      const _ = Dd(), Q = Math.round(t * _), me = Math.round(n * _), ge = await e.getState().rpc.render.scene(v, Q, me, Math.round(Pl * _)), Qt = await Hl(ge.scene_b64, ge.width, ge.height, "image/png"), Tt = URL.createObjectURL(Qt);
      C.current && URL.revokeObjectURL(C.current), C.current = Tt, P(Tt);
    } catch {
    }
  }, M = () => {
    S(!1), x !== void 0 && $();
  }, b = () => {
    const _ = [];
    return o && _.push({ label: "Veusz", href: o, download: k("vsz"), hint: ".vsz" }), D && _.push({ label: "SVG", hint: "vector", onSelect: () => void R(() => Mg(e, { page: v, width: t, height: n, filename: k("svg") }), "SVG export") }), _.push({ label: "PNG", hint: "image", onSelect: () => void R(() => Lg(e, { page: v, width: t, height: n, filename: k("png") }), "PNG export") }), _.push({ label: "PDF", hint: "page", onSelect: () => void R(() => Ig(e, { page: v, width: t, height: n, filename: k("pdf") }), "PDF export") }), _;
  };
  return s !== "svg" && d === !1 ? /* @__PURE__ */ c.jsx("div", { "data-testid": "veusz-figure", className: "vz-fig", style: nu, children: /* @__PURE__ */ c.jsx("div", { "data-testid": "veusz-needs-webgpu", style: { padding: 16, color: "#b06000" }, children: "This interactive figure needs WebGPU. Open in Chrome or Safari 26+." }) }) : /* @__PURE__ */ c.jsxs("div", { "data-testid": "veusz-figure", className: "vz-fig", style: nu, children: [
    /* @__PURE__ */ c.jsxs("div", { className: "vz-toolbar", style: Fg, children: [
      r && /* @__PURE__ */ c.jsx(
        Ud,
        {
          store: e,
          density: "inline",
          ctx: Wd(e, {
            notify: (_) => e.setState({ error: _ })
          }),
          onReload: u
        }
      ),
      /* @__PURE__ */ c.jsx(qs, { items: b(), busy: p }),
      r && /* @__PURE__ */ c.jsx(
        "button",
        {
          type: "button",
          "data-testid": "veusz-edit-toggle",
          onClick: () => S(!0),
          style: Og,
          title: "Edit this figure",
          children: "✎ Edit"
        }
      )
    ] }),
    /* @__PURE__ */ c.jsxs("div", { className: "vz-inline", children: [
      x !== void 0 ? /* @__PURE__ */ c.jsx(
        "img",
        {
          src: x,
          alt: l ?? "Veusz figure",
          className: "vz-preview",
          "data-testid": "veusz-inline-poster"
        }
      ) : /* @__PURE__ */ c.jsx("div", { style: { height: Math.round(n / t * 100) + "%", minHeight: 200 }, children: /* @__PURE__ */ c.jsx(f, { store: e, width: t, height: n }) }),
      h && !y && /* @__PURE__ */ c.jsx("div", { "data-testid": "veusz-error", style: Ug, children: h })
    ] }),
    y && /* @__PURE__ */ c.jsx(
      wg,
      {
        store: e,
        title: l,
        width: t,
        height: n,
        renderer: s,
        toolbar: /* @__PURE__ */ c.jsx(qs, { items: b(), busy: p }),
        onReload: u,
        onClose: M
      }
    )
  ] });
}
const nu = {
  position: "relative",
  border: "1px solid #e2e4e8",
  borderRadius: 10,
  overflow: "hidden",
  background: "#fff",
  font: "14px system-ui, sans-serif"
}, Fg = {
  position: "absolute",
  top: 8,
  right: 8,
  zIndex: 3,
  display: "flex",
  gap: 6,
  alignItems: "flex-start"
}, Og = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 10px",
  cursor: "pointer",
  fontSize: 12,
  background: "#fff",
  color: "#222"
}, Ug = {
  position: "absolute",
  left: 8,
  bottom: 8,
  color: "crimson",
  fontSize: 12,
  background: "rgba(255,255,255,0.9)",
  padding: "2px 6px",
  borderRadius: 4
};
function bg(e, t, n = {}) {
  const r = kd(gd(t));
  r.getState().refreshAll();
  const l = ka(e);
  return l.render(
    E.createElement(Qd, {
      store: r,
      width: n.width ?? 600,
      height: n.height ?? 400,
      editable: n.editable ?? !0,
      initialEditing: n.initialEditing ?? !0,
      title: n.title,
      // The live/remote editor renders via SVG (no WebGPU) so it works in any
      // browser and any notebook frontend. Override with renderer:'vello'.
      renderer: n.renderer ?? "svg"
    })
  ), { store: r, unmount: () => l.unmount() };
}
function Qg(e, t, n = {}) {
  return bg(e, wh(t), n);
}
const ru = "This interactive figure needs WebGPU. Open in Chrome or Safari 26+.";
class Bg extends HTMLElement {
  constructor() {
    super(...arguments);
    Xt(this, "root", null);
    Xt(this, "mounted", !1);
    Xt(this, "noteEl", null);
    Xt(this, "urlLinks", null);
    Xt(this, "runtime", null);
  }
  connectedCallback() {
    this.mounted || (this.mounted = !0, this.boot());
  }
  disconnectedCallback() {
    var n, r, l;
    (n = this.urlLinks) == null || n.stop(), this.urlLinks = null, (r = this.root) == null || r.unmount(), this.root = null, (l = this.runtime) == null || l.dispose(), this.runtime = null;
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
    if (i.src = n, i.alt = this.getAttribute("title") ?? "Veusz figure", i.style.cssText = "display:block;width:100%;height:auto;", i.addEventListener("error", () => this.status(r.note ?? ru)), l.appendChild(i), r.onActivate) {
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
    if (!await Cd()) {
      r ? this.showPoster(r, {
        note: "Static image — the interactive view needs WebGPU (Chrome or Safari 26+)."
      }) : this.status(ru);
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
      const i = await om({
        wasmBase: this.getAttribute("wasm-base") ?? void 0,
        pyodideIndexUrl: this.getAttribute("pyodide-index") ?? void 0,
        veuszWheelUrl: this.getAttribute("veusz-wheel") ?? void 0,
        onProgress: (v) => {
          r ? this.setNote(v) : this.status(v);
        }
      });
      this.runtime = i;
      const o = await fetch(n);
      if (!o.ok) throw new Error(`fetch ${n}: ${o.status}`);
      const a = await o.text(), s = {
        urlBase: this.getAttribute("data-url-base") ?? new URL(".", new URL(n, location.href)).toString(),
        urlMap: Wg(this.getAttribute("data-url-map"))
      };
      await sm(a, i.transport, s);
      const u = await fm(a, n, s);
      await i.loadVsz(a, u), this.urlLinks = await am(i.transport, s);
      const f = kd(gd(i.transport));
      this.replaceChildren(), this.noteEl = null;
      const h = document.createElement("div");
      this.appendChild(h), this.root = ka(h);
      const d = async () => {
        var v;
        await ((v = this.urlLinks) == null ? void 0 : v.refresh()), await f.getState().reloadFile();
      };
      this.root.render(E.createElement(Qd, {
        store: f,
        width: Number(this.getAttribute("width") ?? 600),
        height: Number(this.getAttribute("height") ?? 400),
        editable: this.getAttribute("editable") !== "false",
        title: this.getAttribute("title") ?? void 0,
        poster: r,
        vszUrl: n,
        initialEditing: l,
        onReload: d
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
function Wg(e) {
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
typeof customElements < "u" && !customElements.get("veusz-figure") && customElements.define("veusz-figure", Bg);
export {
  Bg as VeuszFigureElement,
  wh as commTransport,
  bg as mountRemoteEditor,
  Qg as mountRemoteEditorFromComm,
  Hg as websocketComm
};
//# sourceMappingURL=veusz-embed.js.map
