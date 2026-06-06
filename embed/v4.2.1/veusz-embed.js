var Hc = Object.defineProperty;
var Qc = (e, t, n) => t in e ? Hc(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var vn = (e, t, n) => Qc(e, typeof t != "symbol" ? t + "" : t, n);
function va(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var ya = { exports: {} }, Ee = {}, ga = { exports: {} }, R = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var nr = Symbol.for("react.element"), Kc = Symbol.for("react.portal"), Gc = Symbol.for("react.fragment"), Yc = Symbol.for("react.strict_mode"), Xc = Symbol.for("react.profiler"), Zc = Symbol.for("react.provider"), Jc = Symbol.for("react.context"), qc = Symbol.for("react.forward_ref"), bc = Symbol.for("react.suspense"), ef = Symbol.for("react.memo"), tf = Symbol.for("react.lazy"), Jo = Symbol.iterator;
function nf(e) {
  return e === null || typeof e != "object" ? null : (e = Jo && e[Jo] || e["@@iterator"], typeof e == "function" ? e : null);
}
var wa = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, Sa = Object.assign, ka = {};
function pn(e, t, n) {
  this.props = e, this.context = t, this.refs = ka, this.updater = n || wa;
}
pn.prototype.isReactComponent = {};
pn.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
pn.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function xa() {
}
xa.prototype = pn.prototype;
function no(e, t, n) {
  this.props = e, this.context = t, this.refs = ka, this.updater = n || wa;
}
var ro = no.prototype = new xa();
ro.constructor = no;
Sa(ro, pn.prototype);
ro.isPureReactComponent = !0;
var qo = Array.isArray, _a = Object.prototype.hasOwnProperty, lo = { current: null }, Ea = { key: !0, ref: !0, __self: !0, __source: !0 };
function Ca(e, t, n) {
  var r, l = {}, i = null, o = null;
  if (t != null) for (r in t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (i = "" + t.key), t) _a.call(t, r) && !Ea.hasOwnProperty(r) && (l[r] = t[r]);
  var u = arguments.length - 2;
  if (u === 1) l.children = n;
  else if (1 < u) {
    for (var a = Array(u), s = 0; s < u; s++) a[s] = arguments[s + 2];
    l.children = a;
  }
  if (e && e.defaultProps) for (r in u = e.defaultProps, u) l[r] === void 0 && (l[r] = u[r]);
  return { $$typeof: nr, type: e, key: i, ref: o, props: l, _owner: lo.current };
}
function rf(e, t) {
  return { $$typeof: nr, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function io(e) {
  return typeof e == "object" && e !== null && e.$$typeof === nr;
}
function lf(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var bo = /\/+/g;
function Tl(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? lf("" + e.key) : t.toString(36);
}
function Tr(e, t, n, r, l) {
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
        case nr:
        case Kc:
          o = !0;
      }
  }
  if (o) return o = e, l = l(o), e = r === "" ? "." + Tl(o, 0) : r, qo(l) ? (n = "", e != null && (n = e.replace(bo, "$&/") + "/"), Tr(l, t, n, "", function(s) {
    return s;
  })) : l != null && (io(l) && (l = rf(l, n + (!l.key || o && o.key === l.key ? "" : ("" + l.key).replace(bo, "$&/") + "/") + e)), t.push(l)), 1;
  if (o = 0, r = r === "" ? "." : r + ":", qo(e)) for (var u = 0; u < e.length; u++) {
    i = e[u];
    var a = r + Tl(i, u);
    o += Tr(i, t, n, a, l);
  }
  else if (a = nf(e), typeof a == "function") for (e = a.call(e), u = 0; !(i = e.next()).done; ) i = i.value, a = r + Tl(i, u++), o += Tr(i, t, n, a, l);
  else if (i === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return o;
}
function sr(e, t, n) {
  if (e == null) return e;
  var r = [], l = 0;
  return Tr(e, r, "", "", function(i) {
    return t.call(n, i, l++);
  }), r;
}
function of(e) {
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
var fe = { current: null }, jr = { transition: null }, uf = { ReactCurrentDispatcher: fe, ReactCurrentBatchConfig: jr, ReactCurrentOwner: lo };
function Pa() {
  throw Error("act(...) is not supported in production builds of React.");
}
R.Children = { map: sr, forEach: function(e, t, n) {
  sr(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return sr(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return sr(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!io(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
R.Component = pn;
R.Fragment = Gc;
R.Profiler = Xc;
R.PureComponent = no;
R.StrictMode = Yc;
R.Suspense = bc;
R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = uf;
R.act = Pa;
R.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = Sa({}, e.props), l = e.key, i = e.ref, o = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (i = t.ref, o = lo.current), t.key !== void 0 && (l = "" + t.key), e.type && e.type.defaultProps) var u = e.type.defaultProps;
    for (a in t) _a.call(t, a) && !Ea.hasOwnProperty(a) && (r[a] = t[a] === void 0 && u !== void 0 ? u[a] : t[a]);
  }
  var a = arguments.length - 2;
  if (a === 1) r.children = n;
  else if (1 < a) {
    u = Array(a);
    for (var s = 0; s < a; s++) u[s] = arguments[s + 2];
    r.children = u;
  }
  return { $$typeof: nr, type: e.type, key: l, ref: i, props: r, _owner: o };
};
R.createContext = function(e) {
  return e = { $$typeof: Jc, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: Zc, _context: e }, e.Consumer = e;
};
R.createElement = Ca;
R.createFactory = function(e) {
  var t = Ca.bind(null, e);
  return t.type = e, t;
};
R.createRef = function() {
  return { current: null };
};
R.forwardRef = function(e) {
  return { $$typeof: qc, render: e };
};
R.isValidElement = io;
R.lazy = function(e) {
  return { $$typeof: tf, _payload: { _status: -1, _result: e }, _init: of };
};
R.memo = function(e, t) {
  return { $$typeof: ef, type: e, compare: t === void 0 ? null : t };
};
R.startTransition = function(e) {
  var t = jr.transition;
  jr.transition = {};
  try {
    e();
  } finally {
    jr.transition = t;
  }
};
R.unstable_act = Pa;
R.useCallback = function(e, t) {
  return fe.current.useCallback(e, t);
};
R.useContext = function(e) {
  return fe.current.useContext(e);
};
R.useDebugValue = function() {
};
R.useDeferredValue = function(e) {
  return fe.current.useDeferredValue(e);
};
R.useEffect = function(e, t) {
  return fe.current.useEffect(e, t);
};
R.useId = function() {
  return fe.current.useId();
};
R.useImperativeHandle = function(e, t, n) {
  return fe.current.useImperativeHandle(e, t, n);
};
R.useInsertionEffect = function(e, t) {
  return fe.current.useInsertionEffect(e, t);
};
R.useLayoutEffect = function(e, t) {
  return fe.current.useLayoutEffect(e, t);
};
R.useMemo = function(e, t) {
  return fe.current.useMemo(e, t);
};
R.useReducer = function(e, t, n) {
  return fe.current.useReducer(e, t, n);
};
R.useRef = function(e) {
  return fe.current.useRef(e);
};
R.useState = function(e) {
  return fe.current.useState(e);
};
R.useSyncExternalStore = function(e, t, n) {
  return fe.current.useSyncExternalStore(e, t, n);
};
R.useTransition = function() {
  return fe.current.useTransition();
};
R.version = "18.3.1";
ga.exports = R;
var F = ga.exports;
const af = /* @__PURE__ */ va(F);
var za = { exports: {} }, Na = {};
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
  function t(C, j) {
    var L = C.length;
    C.push(j);
    e: for (; 0 < L; ) {
      var K = L - 1 >>> 1, J = C[K];
      if (0 < l(J, j)) C[K] = j, C[L] = J, L = K;
      else break e;
    }
  }
  function n(C) {
    return C.length === 0 ? null : C[0];
  }
  function r(C) {
    if (C.length === 0) return null;
    var j = C[0], L = C.pop();
    if (L !== j) {
      C[0] = L;
      e: for (var K = 0, J = C.length, ur = J >>> 1; K < ur; ) {
        var _t = 2 * (K + 1) - 1, Nl = C[_t], Et = _t + 1, ar = C[Et];
        if (0 > l(Nl, L)) Et < J && 0 > l(ar, Nl) ? (C[K] = ar, C[Et] = L, K = Et) : (C[K] = Nl, C[_t] = L, K = _t);
        else if (Et < J && 0 > l(ar, L)) C[K] = ar, C[Et] = L, K = Et;
        else break e;
      }
    }
    return j;
  }
  function l(C, j) {
    var L = C.sortIndex - j.sortIndex;
    return L !== 0 ? L : C.id - j.id;
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
  var a = [], s = [], c = 1, m = null, d = 3, y = !1, v = !1, k = !1, D = typeof setTimeout == "function" ? setTimeout : null, p = typeof clearTimeout == "function" ? clearTimeout : null, f = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function h(C) {
    for (var j = n(s); j !== null; ) {
      if (j.callback === null) r(s);
      else if (j.startTime <= C) r(s), j.sortIndex = j.expirationTime, t(a, j);
      else break;
      j = n(s);
    }
  }
  function w(C) {
    if (k = !1, h(C), !v) if (n(a) !== null) v = !0, He(_);
    else {
      var j = n(s);
      j !== null && tt(w, j.startTime - C);
    }
  }
  function _(C, j) {
    v = !1, k && (k = !1, p(x), x = -1), y = !0;
    var L = d;
    try {
      for (h(j), m = n(a); m !== null && (!(m.expirationTime > j) || C && !I()); ) {
        var K = m.callback;
        if (typeof K == "function") {
          m.callback = null, d = m.priorityLevel;
          var J = K(m.expirationTime <= j);
          j = e.unstable_now(), typeof J == "function" ? m.callback = J : m === n(a) && r(a), h(j);
        } else r(a);
        m = n(a);
      }
      if (m !== null) var ur = !0;
      else {
        var _t = n(s);
        _t !== null && tt(w, _t.startTime - j), ur = !1;
      }
      return ur;
    } finally {
      m = null, d = L, y = !1;
    }
  }
  var z = !1, P = null, x = -1, T = 5, N = -1;
  function I() {
    return !(e.unstable_now() - N < T);
  }
  function ae() {
    if (P !== null) {
      var C = e.unstable_now();
      N = C;
      var j = !0;
      try {
        j = P(!0, C);
      } finally {
        j ? re() : (z = !1, P = null);
      }
    } else z = !1;
  }
  var re;
  if (typeof f == "function") re = function() {
    f(ae);
  };
  else if (typeof MessageChannel < "u") {
    var pe = new MessageChannel(), xt = pe.port2;
    pe.port1.onmessage = ae, re = function() {
      xt.postMessage(null);
    };
  } else re = function() {
    D(ae, 0);
  };
  function He(C) {
    P = C, z || (z = !0, re());
  }
  function tt(C, j) {
    x = D(function() {
      C(e.unstable_now());
    }, j);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(C) {
    C.callback = null;
  }, e.unstable_continueExecution = function() {
    v || y || (v = !0, He(_));
  }, e.unstable_forceFrameRate = function(C) {
    0 > C || 125 < C ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : T = 0 < C ? Math.floor(1e3 / C) : 5;
  }, e.unstable_getCurrentPriorityLevel = function() {
    return d;
  }, e.unstable_getFirstCallbackNode = function() {
    return n(a);
  }, e.unstable_next = function(C) {
    switch (d) {
      case 1:
      case 2:
      case 3:
        var j = 3;
        break;
      default:
        j = d;
    }
    var L = d;
    d = j;
    try {
      return C();
    } finally {
      d = L;
    }
  }, e.unstable_pauseExecution = function() {
  }, e.unstable_requestPaint = function() {
  }, e.unstable_runWithPriority = function(C, j) {
    switch (C) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        C = 3;
    }
    var L = d;
    d = C;
    try {
      return j();
    } finally {
      d = L;
    }
  }, e.unstable_scheduleCallback = function(C, j, L) {
    var K = e.unstable_now();
    switch (typeof L == "object" && L !== null ? (L = L.delay, L = typeof L == "number" && 0 < L ? K + L : K) : L = K, C) {
      case 1:
        var J = -1;
        break;
      case 2:
        J = 250;
        break;
      case 5:
        J = 1073741823;
        break;
      case 4:
        J = 1e4;
        break;
      default:
        J = 5e3;
    }
    return J = L + J, C = { id: c++, callback: j, priorityLevel: C, startTime: L, expirationTime: J, sortIndex: -1 }, L > K ? (C.sortIndex = L, t(s, C), n(a) === null && C === n(s) && (k ? (p(x), x = -1) : k = !0, tt(w, L - K))) : (C.sortIndex = J, t(a, C), v || y || (v = !0, He(_))), C;
  }, e.unstable_shouldYield = I, e.unstable_wrapCallback = function(C) {
    var j = d;
    return function() {
      var L = d;
      d = j;
      try {
        return C.apply(this, arguments);
      } finally {
        d = L;
      }
    };
  };
})(Na);
za.exports = Na;
var sf = za.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var cf = F, _e = sf;
function S(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var Ta = /* @__PURE__ */ new Set(), An = {};
function Ft(e, t) {
  ln(e, t), ln(e + "Capture", t);
}
function ln(e, t) {
  for (An[e] = t, e = 0; e < t.length; e++) Ta.add(t[e]);
}
var Ze = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), oi = Object.prototype.hasOwnProperty, ff = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, eu = {}, tu = {};
function df(e) {
  return oi.call(tu, e) ? !0 : oi.call(eu, e) ? !1 : ff.test(e) ? tu[e] = !0 : (eu[e] = !0, !1);
}
function pf(e, t, n, r) {
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
function mf(e, t, n, r) {
  if (t === null || typeof t > "u" || pf(e, t, n, r)) return !0;
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
function de(e, t, n, r, l, i, o) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = l, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = i, this.removeEmptyString = o;
}
var ne = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
  ne[e] = new de(e, 0, !1, e, null, !1, !1);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
  var t = e[0];
  ne[t] = new de(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
  ne[e] = new de(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
  ne[e] = new de(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
  ne[e] = new de(e, 3, !1, e.toLowerCase(), null, !1, !1);
});
["checked", "multiple", "muted", "selected"].forEach(function(e) {
  ne[e] = new de(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function(e) {
  ne[e] = new de(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function(e) {
  ne[e] = new de(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function(e) {
  ne[e] = new de(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var oo = /[\-:]([a-z])/g;
function uo(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
  var t = e.replace(
    oo,
    uo
  );
  ne[t] = new de(t, 1, !1, e, null, !1, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(oo, uo);
  ne[t] = new de(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(oo, uo);
  ne[t] = new de(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  ne[e] = new de(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
ne.xlinkHref = new de("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function(e) {
  ne[e] = new de(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function ao(e, t, n, r) {
  var l = ne.hasOwnProperty(t) ? ne[t] : null;
  (l !== null ? l.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (mf(t, n, l, r) && (n = null), r || l === null ? df(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : l.mustUseProperty ? e[l.propertyName] = n === null ? l.type === 3 ? !1 : "" : n : (t = l.attributeName, r = l.attributeNamespace, n === null ? e.removeAttribute(t) : (l = l.type, n = l === 3 || l === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var et = cf.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, cr = Symbol.for("react.element"), Ut = Symbol.for("react.portal"), Bt = Symbol.for("react.fragment"), so = Symbol.for("react.strict_mode"), ui = Symbol.for("react.profiler"), ja = Symbol.for("react.provider"), La = Symbol.for("react.context"), co = Symbol.for("react.forward_ref"), ai = Symbol.for("react.suspense"), si = Symbol.for("react.suspense_list"), fo = Symbol.for("react.memo"), rt = Symbol.for("react.lazy"), Ra = Symbol.for("react.offscreen"), nu = Symbol.iterator;
function yn(e) {
  return e === null || typeof e != "object" ? null : (e = nu && e[nu] || e["@@iterator"], typeof e == "function" ? e : null);
}
var H = Object.assign, jl;
function Pn(e) {
  if (jl === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    jl = t && t[1] || "";
  }
  return `
` + jl + e;
}
var Ll = !1;
function Rl(e, t) {
  if (!e || Ll) return "";
  Ll = !0;
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
    Ll = !1, Error.prepareStackTrace = n;
  }
  return (e = e ? e.displayName || e.name : "") ? Pn(e) : "";
}
function hf(e) {
  switch (e.tag) {
    case 5:
      return Pn(e.type);
    case 16:
      return Pn("Lazy");
    case 13:
      return Pn("Suspense");
    case 19:
      return Pn("SuspenseList");
    case 0:
    case 2:
    case 15:
      return e = Rl(e.type, !1), e;
    case 11:
      return e = Rl(e.type.render, !1), e;
    case 1:
      return e = Rl(e.type, !0), e;
    default:
      return "";
  }
}
function ci(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Bt:
      return "Fragment";
    case Ut:
      return "Portal";
    case ui:
      return "Profiler";
    case so:
      return "StrictMode";
    case ai:
      return "Suspense";
    case si:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case La:
      return (e.displayName || "Context") + ".Consumer";
    case ja:
      return (e._context.displayName || "Context") + ".Provider";
    case co:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case fo:
      return t = e.displayName || null, t !== null ? t : ci(e.type) || "Memo";
    case rt:
      t = e._payload, e = e._init;
      try {
        return ci(e(t));
      } catch {
      }
  }
  return null;
}
function vf(e) {
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
      return ci(t);
    case 8:
      return t === so ? "StrictMode" : "Mode";
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
function yt(e) {
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
function Da(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function yf(e) {
  var t = Da(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
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
function fr(e) {
  e._valueTracker || (e._valueTracker = yf(e));
}
function Ma(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(), r = "";
  return e && (r = Da(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
}
function Br(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function fi(e, t) {
  var n = t.checked;
  return H({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function ru(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = yt(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function Ia(e, t) {
  t = t.checked, t != null && ao(e, "checked", t, !1);
}
function di(e, t) {
  Ia(e, t);
  var n = yt(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? pi(e, t.type, n) : t.hasOwnProperty("defaultValue") && pi(e, t.type, yt(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function lu(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function pi(e, t, n) {
  (t !== "number" || Br(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var zn = Array.isArray;
function qt(e, t, n, r) {
  if (e = e.options, t) {
    t = {};
    for (var l = 0; l < n.length; l++) t["$" + n[l]] = !0;
    for (n = 0; n < e.length; n++) l = t.hasOwnProperty("$" + e[n].value), e[n].selected !== l && (e[n].selected = l), l && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + yt(n), t = null, l = 0; l < e.length; l++) {
      if (e[l].value === n) {
        e[l].selected = !0, r && (e[l].defaultSelected = !0);
        return;
      }
      t !== null || e[l].disabled || (t = e[l]);
    }
    t !== null && (t.selected = !0);
  }
}
function mi(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(S(91));
  return H({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function iu(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(S(92));
      if (zn(n)) {
        if (1 < n.length) throw Error(S(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = { initialValue: yt(n) };
}
function $a(e, t) {
  var n = yt(t.value), r = yt(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function ou(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function Fa(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function hi(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? Fa(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var dr, Oa = function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, l) {
    MSApp.execUnsafeLocalFunction(function() {
      return e(t, n, r, l);
    });
  } : e;
}(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
  else {
    for (dr = dr || document.createElement("div"), dr.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = dr.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
    for (; t.firstChild; ) e.appendChild(t.firstChild);
  }
});
function Un(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var jn = {
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
}, gf = ["Webkit", "ms", "Moz", "O"];
Object.keys(jn).forEach(function(e) {
  gf.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), jn[t] = jn[e];
  });
});
function Aa(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || jn.hasOwnProperty(e) && jn[e] ? ("" + t).trim() : t + "px";
}
function Ua(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, l = Aa(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, l) : e[n] = l;
  }
}
var wf = H({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
function vi(e, t) {
  if (t) {
    if (wf[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(S(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(S(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(S(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(S(62));
  }
}
function yi(e, t) {
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
var gi = null;
function po(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var wi = null, bt = null, en = null;
function uu(e) {
  if (e = ir(e)) {
    if (typeof wi != "function") throw Error(S(280));
    var t = e.stateNode;
    t && (t = hl(t), wi(e.stateNode, e.type, t));
  }
}
function Ba(e) {
  bt ? en ? en.push(e) : en = [e] : bt = e;
}
function Va() {
  if (bt) {
    var e = bt, t = en;
    if (en = bt = null, uu(e), t) for (e = 0; e < t.length; e++) uu(t[e]);
  }
}
function Wa(e, t) {
  return e(t);
}
function Ha() {
}
var Dl = !1;
function Qa(e, t, n) {
  if (Dl) return e(t, n);
  Dl = !0;
  try {
    return Wa(e, t, n);
  } finally {
    Dl = !1, (bt !== null || en !== null) && (Ha(), Va());
  }
}
function Bn(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = hl(n);
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
  if (n && typeof n != "function") throw Error(S(231, t, typeof n));
  return n;
}
var Si = !1;
if (Ze) try {
  var gn = {};
  Object.defineProperty(gn, "passive", { get: function() {
    Si = !0;
  } }), window.addEventListener("test", gn, gn), window.removeEventListener("test", gn, gn);
} catch {
  Si = !1;
}
function Sf(e, t, n, r, l, i, o, u, a) {
  var s = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, s);
  } catch (c) {
    this.onError(c);
  }
}
var Ln = !1, Vr = null, Wr = !1, ki = null, kf = { onError: function(e) {
  Ln = !0, Vr = e;
} };
function xf(e, t, n, r, l, i, o, u, a) {
  Ln = !1, Vr = null, Sf.apply(kf, arguments);
}
function _f(e, t, n, r, l, i, o, u, a) {
  if (xf.apply(this, arguments), Ln) {
    if (Ln) {
      var s = Vr;
      Ln = !1, Vr = null;
    } else throw Error(S(198));
    Wr || (Wr = !0, ki = s);
  }
}
function Ot(e) {
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
function Ka(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function au(e) {
  if (Ot(e) !== e) throw Error(S(188));
}
function Ef(e) {
  var t = e.alternate;
  if (!t) {
    if (t = Ot(e), t === null) throw Error(S(188));
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
        if (i === n) return au(l), e;
        if (i === r) return au(l), t;
        i = i.sibling;
      }
      throw Error(S(188));
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
        if (!o) throw Error(S(189));
      }
    }
    if (n.alternate !== r) throw Error(S(190));
  }
  if (n.tag !== 3) throw Error(S(188));
  return n.stateNode.current === n ? e : t;
}
function Ga(e) {
  return e = Ef(e), e !== null ? Ya(e) : null;
}
function Ya(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = Ya(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var Xa = _e.unstable_scheduleCallback, su = _e.unstable_cancelCallback, Cf = _e.unstable_shouldYield, Pf = _e.unstable_requestPaint, G = _e.unstable_now, zf = _e.unstable_getCurrentPriorityLevel, mo = _e.unstable_ImmediatePriority, Za = _e.unstable_UserBlockingPriority, Hr = _e.unstable_NormalPriority, Nf = _e.unstable_LowPriority, Ja = _e.unstable_IdlePriority, fl = null, Ve = null;
function Tf(e) {
  if (Ve && typeof Ve.onCommitFiberRoot == "function") try {
    Ve.onCommitFiberRoot(fl, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var $e = Math.clz32 ? Math.clz32 : Rf, jf = Math.log, Lf = Math.LN2;
function Rf(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (jf(e) / Lf | 0) | 0;
}
var pr = 64, mr = 4194304;
function Nn(e) {
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
function Qr(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0, l = e.suspendedLanes, i = e.pingedLanes, o = n & 268435455;
  if (o !== 0) {
    var u = o & ~l;
    u !== 0 ? r = Nn(u) : (i &= o, i !== 0 && (r = Nn(i)));
  } else o = n & ~l, o !== 0 ? r = Nn(o) : i !== 0 && (r = Nn(i));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & l) && (l = r & -r, i = t & -t, l >= i || l === 16 && (i & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - $e(t), l = 1 << n, r |= e[n], t &= ~l;
  return r;
}
function Df(e, t) {
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
function Mf(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, i = e.pendingLanes; 0 < i; ) {
    var o = 31 - $e(i), u = 1 << o, a = l[o];
    a === -1 ? (!(u & n) || u & r) && (l[o] = Df(u, t)) : a <= t && (e.expiredLanes |= u), i &= ~u;
  }
}
function xi(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function qa() {
  var e = pr;
  return pr <<= 1, !(pr & 4194240) && (pr = 64), e;
}
function Ml(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function rr(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - $e(t), e[t] = n;
}
function If(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var l = 31 - $e(n), i = 1 << l;
    t[l] = 0, r[l] = -1, e[l] = -1, n &= ~i;
  }
}
function ho(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
    var r = 31 - $e(n), l = 1 << r;
    l & t | e[r] & t && (e[r] |= t), n &= ~l;
  }
}
var $ = 0;
function ba(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var es, vo, ts, ns, rs, _i = !1, hr = [], st = null, ct = null, ft = null, Vn = /* @__PURE__ */ new Map(), Wn = /* @__PURE__ */ new Map(), it = [], $f = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function cu(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      st = null;
      break;
    case "dragenter":
    case "dragleave":
      ct = null;
      break;
    case "mouseover":
    case "mouseout":
      ft = null;
      break;
    case "pointerover":
    case "pointerout":
      Vn.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      Wn.delete(t.pointerId);
  }
}
function wn(e, t, n, r, l, i) {
  return e === null || e.nativeEvent !== i ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: i, targetContainers: [l] }, t !== null && (t = ir(t), t !== null && vo(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, l !== null && t.indexOf(l) === -1 && t.push(l), e);
}
function Ff(e, t, n, r, l) {
  switch (t) {
    case "focusin":
      return st = wn(st, e, t, n, r, l), !0;
    case "dragenter":
      return ct = wn(ct, e, t, n, r, l), !0;
    case "mouseover":
      return ft = wn(ft, e, t, n, r, l), !0;
    case "pointerover":
      var i = l.pointerId;
      return Vn.set(i, wn(Vn.get(i) || null, e, t, n, r, l)), !0;
    case "gotpointercapture":
      return i = l.pointerId, Wn.set(i, wn(Wn.get(i) || null, e, t, n, r, l)), !0;
  }
  return !1;
}
function ls(e) {
  var t = zt(e.target);
  if (t !== null) {
    var n = Ot(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = Ka(n), t !== null) {
          e.blockedOn = t, rs(e.priority, function() {
            ts(n);
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
function Lr(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Ei(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      gi = r, n.target.dispatchEvent(r), gi = null;
    } else return t = ir(n), t !== null && vo(t), e.blockedOn = n, !1;
    t.shift();
  }
  return !0;
}
function fu(e, t, n) {
  Lr(e) && n.delete(t);
}
function Of() {
  _i = !1, st !== null && Lr(st) && (st = null), ct !== null && Lr(ct) && (ct = null), ft !== null && Lr(ft) && (ft = null), Vn.forEach(fu), Wn.forEach(fu);
}
function Sn(e, t) {
  e.blockedOn === t && (e.blockedOn = null, _i || (_i = !0, _e.unstable_scheduleCallback(_e.unstable_NormalPriority, Of)));
}
function Hn(e) {
  function t(l) {
    return Sn(l, e);
  }
  if (0 < hr.length) {
    Sn(hr[0], e);
    for (var n = 1; n < hr.length; n++) {
      var r = hr[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (st !== null && Sn(st, e), ct !== null && Sn(ct, e), ft !== null && Sn(ft, e), Vn.forEach(t), Wn.forEach(t), n = 0; n < it.length; n++) r = it[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < it.length && (n = it[0], n.blockedOn === null); ) ls(n), n.blockedOn === null && it.shift();
}
var tn = et.ReactCurrentBatchConfig, Kr = !0;
function Af(e, t, n, r) {
  var l = $, i = tn.transition;
  tn.transition = null;
  try {
    $ = 1, yo(e, t, n, r);
  } finally {
    $ = l, tn.transition = i;
  }
}
function Uf(e, t, n, r) {
  var l = $, i = tn.transition;
  tn.transition = null;
  try {
    $ = 4, yo(e, t, n, r);
  } finally {
    $ = l, tn.transition = i;
  }
}
function yo(e, t, n, r) {
  if (Kr) {
    var l = Ei(e, t, n, r);
    if (l === null) Hl(e, t, r, Gr, n), cu(e, r);
    else if (Ff(l, e, t, n, r)) r.stopPropagation();
    else if (cu(e, r), t & 4 && -1 < $f.indexOf(e)) {
      for (; l !== null; ) {
        var i = ir(l);
        if (i !== null && es(i), i = Ei(e, t, n, r), i === null && Hl(e, t, r, Gr, n), i === l) break;
        l = i;
      }
      l !== null && r.stopPropagation();
    } else Hl(e, t, r, null, n);
  }
}
var Gr = null;
function Ei(e, t, n, r) {
  if (Gr = null, e = po(r), e = zt(e), e !== null) if (t = Ot(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = Ka(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return Gr = e, null;
}
function is(e) {
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
      switch (zf()) {
        case mo:
          return 1;
        case Za:
          return 4;
        case Hr:
        case Nf:
          return 16;
        case Ja:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var ut = null, go = null, Rr = null;
function os() {
  if (Rr) return Rr;
  var e, t = go, n = t.length, r, l = "value" in ut ? ut.value : ut.textContent, i = l.length;
  for (e = 0; e < n && t[e] === l[e]; e++) ;
  var o = n - e;
  for (r = 1; r <= o && t[n - r] === l[i - r]; r++) ;
  return Rr = l.slice(e, 1 < r ? 1 - r : void 0);
}
function Dr(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function vr() {
  return !0;
}
function du() {
  return !1;
}
function Ce(e) {
  function t(n, r, l, i, o) {
    this._reactName = n, this._targetInst = l, this.type = r, this.nativeEvent = i, this.target = o, this.currentTarget = null;
    for (var u in e) e.hasOwnProperty(u) && (n = e[u], this[u] = n ? n(i) : i[u]);
    return this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1) ? vr : du, this.isPropagationStopped = du, this;
  }
  return H(t.prototype, { preventDefault: function() {
    this.defaultPrevented = !0;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = vr);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = vr);
  }, persist: function() {
  }, isPersistent: vr }), t;
}
var mn = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, wo = Ce(mn), lr = H({}, mn, { view: 0, detail: 0 }), Bf = Ce(lr), Il, $l, kn, dl = H({}, lr, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: So, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== kn && (kn && e.type === "mousemove" ? (Il = e.screenX - kn.screenX, $l = e.screenY - kn.screenY) : $l = Il = 0, kn = e), Il);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : $l;
} }), pu = Ce(dl), Vf = H({}, dl, { dataTransfer: 0 }), Wf = Ce(Vf), Hf = H({}, lr, { relatedTarget: 0 }), Fl = Ce(Hf), Qf = H({}, mn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Kf = Ce(Qf), Gf = H({}, mn, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), Yf = Ce(Gf), Xf = H({}, mn, { data: 0 }), mu = Ce(Xf), Zf = {
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
}, Jf = {
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
}, qf = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function bf(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = qf[e]) ? !!t[e] : !1;
}
function So() {
  return bf;
}
var ed = H({}, lr, { key: function(e) {
  if (e.key) {
    var t = Zf[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = Dr(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Jf[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: So, charCode: function(e) {
  return e.type === "keypress" ? Dr(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? Dr(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), td = Ce(ed), nd = H({}, dl, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), hu = Ce(nd), rd = H({}, lr, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: So }), ld = Ce(rd), id = H({}, mn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), od = Ce(id), ud = H({}, dl, {
  deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  },
  deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), ad = Ce(ud), sd = [9, 13, 27, 32], ko = Ze && "CompositionEvent" in window, Rn = null;
Ze && "documentMode" in document && (Rn = document.documentMode);
var cd = Ze && "TextEvent" in window && !Rn, us = Ze && (!ko || Rn && 8 < Rn && 11 >= Rn), vu = " ", yu = !1;
function as(e, t) {
  switch (e) {
    case "keyup":
      return sd.indexOf(t.keyCode) !== -1;
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
function ss(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var Vt = !1;
function fd(e, t) {
  switch (e) {
    case "compositionend":
      return ss(t);
    case "keypress":
      return t.which !== 32 ? null : (yu = !0, vu);
    case "textInput":
      return e = t.data, e === vu && yu ? null : e;
    default:
      return null;
  }
}
function dd(e, t) {
  if (Vt) return e === "compositionend" || !ko && as(e, t) ? (e = os(), Rr = go = ut = null, Vt = !1, e) : null;
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
      return us && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var pd = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
function gu(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!pd[e.type] : t === "textarea";
}
function cs(e, t, n, r) {
  Ba(r), t = Yr(t, "onChange"), 0 < t.length && (n = new wo("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var Dn = null, Qn = null;
function md(e) {
  ks(e, 0);
}
function pl(e) {
  var t = Qt(e);
  if (Ma(t)) return e;
}
function hd(e, t) {
  if (e === "change") return t;
}
var fs = !1;
if (Ze) {
  var Ol;
  if (Ze) {
    var Al = "oninput" in document;
    if (!Al) {
      var wu = document.createElement("div");
      wu.setAttribute("oninput", "return;"), Al = typeof wu.oninput == "function";
    }
    Ol = Al;
  } else Ol = !1;
  fs = Ol && (!document.documentMode || 9 < document.documentMode);
}
function Su() {
  Dn && (Dn.detachEvent("onpropertychange", ds), Qn = Dn = null);
}
function ds(e) {
  if (e.propertyName === "value" && pl(Qn)) {
    var t = [];
    cs(t, Qn, e, po(e)), Qa(md, t);
  }
}
function vd(e, t, n) {
  e === "focusin" ? (Su(), Dn = t, Qn = n, Dn.attachEvent("onpropertychange", ds)) : e === "focusout" && Su();
}
function yd(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return pl(Qn);
}
function gd(e, t) {
  if (e === "click") return pl(t);
}
function wd(e, t) {
  if (e === "input" || e === "change") return pl(t);
}
function Sd(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Oe = typeof Object.is == "function" ? Object.is : Sd;
function Kn(e, t) {
  if (Oe(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var l = n[r];
    if (!oi.call(t, l) || !Oe(e[l], t[l])) return !1;
  }
  return !0;
}
function ku(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function xu(e, t) {
  var n = ku(e);
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
    n = ku(n);
  }
}
function ps(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? ps(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function ms() {
  for (var e = window, t = Br(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = Br(e.document);
  }
  return t;
}
function xo(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
}
function kd(e) {
  var t = ms(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && ps(n.ownerDocument.documentElement, n)) {
    if (r !== null && xo(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
      else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var l = n.textContent.length, i = Math.min(r.start, l);
        r = r.end === void 0 ? i : Math.min(r.end, l), !e.extend && i > r && (l = r, r = i, i = l), l = xu(n, i);
        var o = xu(
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
var xd = Ze && "documentMode" in document && 11 >= document.documentMode, Wt = null, Ci = null, Mn = null, Pi = !1;
function _u(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Pi || Wt == null || Wt !== Br(r) || (r = Wt, "selectionStart" in r && xo(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), Mn && Kn(Mn, r) || (Mn = r, r = Yr(Ci, "onSelect"), 0 < r.length && (t = new wo("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = Wt)));
}
function yr(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var Ht = { animationend: yr("Animation", "AnimationEnd"), animationiteration: yr("Animation", "AnimationIteration"), animationstart: yr("Animation", "AnimationStart"), transitionend: yr("Transition", "TransitionEnd") }, Ul = {}, hs = {};
Ze && (hs = document.createElement("div").style, "AnimationEvent" in window || (delete Ht.animationend.animation, delete Ht.animationiteration.animation, delete Ht.animationstart.animation), "TransitionEvent" in window || delete Ht.transitionend.transition);
function ml(e) {
  if (Ul[e]) return Ul[e];
  if (!Ht[e]) return e;
  var t = Ht[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in hs) return Ul[e] = t[n];
  return e;
}
var vs = ml("animationend"), ys = ml("animationiteration"), gs = ml("animationstart"), ws = ml("transitionend"), Ss = /* @__PURE__ */ new Map(), Eu = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function wt(e, t) {
  Ss.set(e, t), Ft(t, [e]);
}
for (var Bl = 0; Bl < Eu.length; Bl++) {
  var Vl = Eu[Bl], _d = Vl.toLowerCase(), Ed = Vl[0].toUpperCase() + Vl.slice(1);
  wt(_d, "on" + Ed);
}
wt(vs, "onAnimationEnd");
wt(ys, "onAnimationIteration");
wt(gs, "onAnimationStart");
wt("dblclick", "onDoubleClick");
wt("focusin", "onFocus");
wt("focusout", "onBlur");
wt(ws, "onTransitionEnd");
ln("onMouseEnter", ["mouseout", "mouseover"]);
ln("onMouseLeave", ["mouseout", "mouseover"]);
ln("onPointerEnter", ["pointerout", "pointerover"]);
ln("onPointerLeave", ["pointerout", "pointerover"]);
Ft("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
Ft("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
Ft("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Ft("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
Ft("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
Ft("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var Tn = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Cd = new Set("cancel close invalid load scroll toggle".split(" ").concat(Tn));
function Cu(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, _f(r, t, void 0, e), e.currentTarget = null;
}
function ks(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n], l = r.event;
    r = r.listeners;
    e: {
      var i = void 0;
      if (t) for (var o = r.length - 1; 0 <= o; o--) {
        var u = r[o], a = u.instance, s = u.currentTarget;
        if (u = u.listener, a !== i && l.isPropagationStopped()) break e;
        Cu(l, u, s), i = a;
      }
      else for (o = 0; o < r.length; o++) {
        if (u = r[o], a = u.instance, s = u.currentTarget, u = u.listener, a !== i && l.isPropagationStopped()) break e;
        Cu(l, u, s), i = a;
      }
    }
  }
  if (Wr) throw e = ki, Wr = !1, ki = null, e;
}
function A(e, t) {
  var n = t[Li];
  n === void 0 && (n = t[Li] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (xs(t, e, 2, !1), n.add(r));
}
function Wl(e, t, n) {
  var r = 0;
  t && (r |= 4), xs(n, e, r, t);
}
var gr = "_reactListening" + Math.random().toString(36).slice(2);
function Gn(e) {
  if (!e[gr]) {
    e[gr] = !0, Ta.forEach(function(n) {
      n !== "selectionchange" && (Cd.has(n) || Wl(n, !1, e), Wl(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[gr] || (t[gr] = !0, Wl("selectionchange", !1, t));
  }
}
function xs(e, t, n, r) {
  switch (is(t)) {
    case 1:
      var l = Af;
      break;
    case 4:
      l = Uf;
      break;
    default:
      l = yo;
  }
  n = l.bind(null, t, n, e), l = void 0, !Si || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (l = !0), r ? l !== void 0 ? e.addEventListener(t, n, { capture: !0, passive: l }) : e.addEventListener(t, n, !0) : l !== void 0 ? e.addEventListener(t, n, { passive: l }) : e.addEventListener(t, n, !1);
}
function Hl(e, t, n, r, l) {
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
        if (o = zt(u), o === null) return;
        if (a = o.tag, a === 5 || a === 6) {
          r = i = o;
          continue e;
        }
        u = u.parentNode;
      }
    }
    r = r.return;
  }
  Qa(function() {
    var s = i, c = po(n), m = [];
    e: {
      var d = Ss.get(e);
      if (d !== void 0) {
        var y = wo, v = e;
        switch (e) {
          case "keypress":
            if (Dr(n) === 0) break e;
          case "keydown":
          case "keyup":
            y = td;
            break;
          case "focusin":
            v = "focus", y = Fl;
            break;
          case "focusout":
            v = "blur", y = Fl;
            break;
          case "beforeblur":
          case "afterblur":
            y = Fl;
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
            y = pu;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            y = Wf;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            y = ld;
            break;
          case vs:
          case ys:
          case gs:
            y = Kf;
            break;
          case ws:
            y = od;
            break;
          case "scroll":
            y = Bf;
            break;
          case "wheel":
            y = ad;
            break;
          case "copy":
          case "cut":
          case "paste":
            y = Yf;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            y = hu;
        }
        var k = (t & 4) !== 0, D = !k && e === "scroll", p = k ? d !== null ? d + "Capture" : null : d;
        k = [];
        for (var f = s, h; f !== null; ) {
          h = f;
          var w = h.stateNode;
          if (h.tag === 5 && w !== null && (h = w, p !== null && (w = Bn(f, p), w != null && k.push(Yn(f, w, h)))), D) break;
          f = f.return;
        }
        0 < k.length && (d = new y(d, v, null, n, c), m.push({ event: d, listeners: k }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (d = e === "mouseover" || e === "pointerover", y = e === "mouseout" || e === "pointerout", d && n !== gi && (v = n.relatedTarget || n.fromElement) && (zt(v) || v[Je])) break e;
        if ((y || d) && (d = c.window === c ? c : (d = c.ownerDocument) ? d.defaultView || d.parentWindow : window, y ? (v = n.relatedTarget || n.toElement, y = s, v = v ? zt(v) : null, v !== null && (D = Ot(v), v !== D || v.tag !== 5 && v.tag !== 6) && (v = null)) : (y = null, v = s), y !== v)) {
          if (k = pu, w = "onMouseLeave", p = "onMouseEnter", f = "mouse", (e === "pointerout" || e === "pointerover") && (k = hu, w = "onPointerLeave", p = "onPointerEnter", f = "pointer"), D = y == null ? d : Qt(y), h = v == null ? d : Qt(v), d = new k(w, f + "leave", y, n, c), d.target = D, d.relatedTarget = h, w = null, zt(c) === s && (k = new k(p, f + "enter", v, n, c), k.target = h, k.relatedTarget = D, w = k), D = w, y && v) t: {
            for (k = y, p = v, f = 0, h = k; h; h = At(h)) f++;
            for (h = 0, w = p; w; w = At(w)) h++;
            for (; 0 < f - h; ) k = At(k), f--;
            for (; 0 < h - f; ) p = At(p), h--;
            for (; f--; ) {
              if (k === p || p !== null && k === p.alternate) break t;
              k = At(k), p = At(p);
            }
            k = null;
          }
          else k = null;
          y !== null && Pu(m, d, y, k, !1), v !== null && D !== null && Pu(m, D, v, k, !0);
        }
      }
      e: {
        if (d = s ? Qt(s) : window, y = d.nodeName && d.nodeName.toLowerCase(), y === "select" || y === "input" && d.type === "file") var _ = hd;
        else if (gu(d)) if (fs) _ = wd;
        else {
          _ = yd;
          var z = vd;
        }
        else (y = d.nodeName) && y.toLowerCase() === "input" && (d.type === "checkbox" || d.type === "radio") && (_ = gd);
        if (_ && (_ = _(e, s))) {
          cs(m, _, n, c);
          break e;
        }
        z && z(e, d, s), e === "focusout" && (z = d._wrapperState) && z.controlled && d.type === "number" && pi(d, "number", d.value);
      }
      switch (z = s ? Qt(s) : window, e) {
        case "focusin":
          (gu(z) || z.contentEditable === "true") && (Wt = z, Ci = s, Mn = null);
          break;
        case "focusout":
          Mn = Ci = Wt = null;
          break;
        case "mousedown":
          Pi = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Pi = !1, _u(m, n, c);
          break;
        case "selectionchange":
          if (xd) break;
        case "keydown":
        case "keyup":
          _u(m, n, c);
      }
      var P;
      if (ko) e: {
        switch (e) {
          case "compositionstart":
            var x = "onCompositionStart";
            break e;
          case "compositionend":
            x = "onCompositionEnd";
            break e;
          case "compositionupdate":
            x = "onCompositionUpdate";
            break e;
        }
        x = void 0;
      }
      else Vt ? as(e, n) && (x = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (x = "onCompositionStart");
      x && (us && n.locale !== "ko" && (Vt || x !== "onCompositionStart" ? x === "onCompositionEnd" && Vt && (P = os()) : (ut = c, go = "value" in ut ? ut.value : ut.textContent, Vt = !0)), z = Yr(s, x), 0 < z.length && (x = new mu(x, e, null, n, c), m.push({ event: x, listeners: z }), P ? x.data = P : (P = ss(n), P !== null && (x.data = P)))), (P = cd ? fd(e, n) : dd(e, n)) && (s = Yr(s, "onBeforeInput"), 0 < s.length && (c = new mu("onBeforeInput", "beforeinput", null, n, c), m.push({ event: c, listeners: s }), c.data = P));
    }
    ks(m, t);
  });
}
function Yn(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function Yr(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var l = e, i = l.stateNode;
    l.tag === 5 && i !== null && (l = i, i = Bn(e, n), i != null && r.unshift(Yn(e, i, l)), i = Bn(e, t), i != null && r.push(Yn(e, i, l))), e = e.return;
  }
  return r;
}
function At(e) {
  if (e === null) return null;
  do
    e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function Pu(e, t, n, r, l) {
  for (var i = t._reactName, o = []; n !== null && n !== r; ) {
    var u = n, a = u.alternate, s = u.stateNode;
    if (a !== null && a === r) break;
    u.tag === 5 && s !== null && (u = s, l ? (a = Bn(n, i), a != null && o.unshift(Yn(n, a, u))) : l || (a = Bn(n, i), a != null && o.push(Yn(n, a, u)))), n = n.return;
  }
  o.length !== 0 && e.push({ event: t, listeners: o });
}
var Pd = /\r\n?/g, zd = /\u0000|\uFFFD/g;
function zu(e) {
  return (typeof e == "string" ? e : "" + e).replace(Pd, `
`).replace(zd, "");
}
function wr(e, t, n) {
  if (t = zu(t), zu(e) !== t && n) throw Error(S(425));
}
function Xr() {
}
var zi = null, Ni = null;
function Ti(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var ji = typeof setTimeout == "function" ? setTimeout : void 0, Nd = typeof clearTimeout == "function" ? clearTimeout : void 0, Nu = typeof Promise == "function" ? Promise : void 0, Td = typeof queueMicrotask == "function" ? queueMicrotask : typeof Nu < "u" ? function(e) {
  return Nu.resolve(null).then(e).catch(jd);
} : ji;
function jd(e) {
  setTimeout(function() {
    throw e;
  });
}
function Ql(e, t) {
  var n = t, r = 0;
  do {
    var l = n.nextSibling;
    if (e.removeChild(n), l && l.nodeType === 8) if (n = l.data, n === "/$") {
      if (r === 0) {
        e.removeChild(l), Hn(t);
        return;
      }
      r--;
    } else n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = l;
  } while (n);
  Hn(t);
}
function dt(e) {
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
function Tu(e) {
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
var hn = Math.random().toString(36).slice(2), Be = "__reactFiber$" + hn, Xn = "__reactProps$" + hn, Je = "__reactContainer$" + hn, Li = "__reactEvents$" + hn, Ld = "__reactListeners$" + hn, Rd = "__reactHandles$" + hn;
function zt(e) {
  var t = e[Be];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[Je] || n[Be]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = Tu(e); e !== null; ) {
        if (n = e[Be]) return n;
        e = Tu(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function ir(e) {
  return e = e[Be] || e[Je], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function Qt(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(S(33));
}
function hl(e) {
  return e[Xn] || null;
}
var Ri = [], Kt = -1;
function St(e) {
  return { current: e };
}
function U(e) {
  0 > Kt || (e.current = Ri[Kt], Ri[Kt] = null, Kt--);
}
function O(e, t) {
  Kt++, Ri[Kt] = e.current, e.current = t;
}
var gt = {}, ue = St(gt), ve = St(!1), Rt = gt;
function on(e, t) {
  var n = e.type.contextTypes;
  if (!n) return gt;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var l = {}, i;
  for (i in n) l[i] = t[i];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = l), l;
}
function ye(e) {
  return e = e.childContextTypes, e != null;
}
function Zr() {
  U(ve), U(ue);
}
function ju(e, t, n) {
  if (ue.current !== gt) throw Error(S(168));
  O(ue, t), O(ve, n);
}
function _s(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var l in r) if (!(l in t)) throw Error(S(108, vf(e) || "Unknown", l));
  return H({}, n, r);
}
function Jr(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || gt, Rt = ue.current, O(ue, e), O(ve, ve.current), !0;
}
function Lu(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(S(169));
  n ? (e = _s(e, t, Rt), r.__reactInternalMemoizedMergedChildContext = e, U(ve), U(ue), O(ue, e)) : U(ve), O(ve, n);
}
var Ke = null, vl = !1, Kl = !1;
function Es(e) {
  Ke === null ? Ke = [e] : Ke.push(e);
}
function Dd(e) {
  vl = !0, Es(e);
}
function kt() {
  if (!Kl && Ke !== null) {
    Kl = !0;
    var e = 0, t = $;
    try {
      var n = Ke;
      for ($ = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(!0);
        while (r !== null);
      }
      Ke = null, vl = !1;
    } catch (l) {
      throw Ke !== null && (Ke = Ke.slice(e + 1)), Xa(mo, kt), l;
    } finally {
      $ = t, Kl = !1;
    }
  }
  return null;
}
var Gt = [], Yt = 0, qr = null, br = 0, Pe = [], ze = 0, Dt = null, Ge = 1, Ye = "";
function Ct(e, t) {
  Gt[Yt++] = br, Gt[Yt++] = qr, qr = e, br = t;
}
function Cs(e, t, n) {
  Pe[ze++] = Ge, Pe[ze++] = Ye, Pe[ze++] = Dt, Dt = e;
  var r = Ge;
  e = Ye;
  var l = 32 - $e(r) - 1;
  r &= ~(1 << l), n += 1;
  var i = 32 - $e(t) + l;
  if (30 < i) {
    var o = l - l % 5;
    i = (r & (1 << o) - 1).toString(32), r >>= o, l -= o, Ge = 1 << 32 - $e(t) + l | n << l | r, Ye = i + e;
  } else Ge = 1 << i | n << l | r, Ye = e;
}
function _o(e) {
  e.return !== null && (Ct(e, 1), Cs(e, 1, 0));
}
function Eo(e) {
  for (; e === qr; ) qr = Gt[--Yt], Gt[Yt] = null, br = Gt[--Yt], Gt[Yt] = null;
  for (; e === Dt; ) Dt = Pe[--ze], Pe[ze] = null, Ye = Pe[--ze], Pe[ze] = null, Ge = Pe[--ze], Pe[ze] = null;
}
var xe = null, ke = null, B = !1, Ie = null;
function Ps(e, t) {
  var n = Ne(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function Ru(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, xe = e, ke = dt(t.firstChild), !0) : !1;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, xe = e, ke = null, !0) : !1;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = Dt !== null ? { id: Ge, overflow: Ye } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = Ne(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, xe = e, ke = null, !0) : !1;
    default:
      return !1;
  }
}
function Di(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function Mi(e) {
  if (B) {
    var t = ke;
    if (t) {
      var n = t;
      if (!Ru(e, t)) {
        if (Di(e)) throw Error(S(418));
        t = dt(n.nextSibling);
        var r = xe;
        t && Ru(e, t) ? Ps(r, n) : (e.flags = e.flags & -4097 | 2, B = !1, xe = e);
      }
    } else {
      if (Di(e)) throw Error(S(418));
      e.flags = e.flags & -4097 | 2, B = !1, xe = e;
    }
  }
}
function Du(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  xe = e;
}
function Sr(e) {
  if (e !== xe) return !1;
  if (!B) return Du(e), B = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !Ti(e.type, e.memoizedProps)), t && (t = ke)) {
    if (Di(e)) throw zs(), Error(S(418));
    for (; t; ) Ps(e, t), t = dt(t.nextSibling);
  }
  if (Du(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(S(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              ke = dt(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      ke = null;
    }
  } else ke = xe ? dt(e.stateNode.nextSibling) : null;
  return !0;
}
function zs() {
  for (var e = ke; e; ) e = dt(e.nextSibling);
}
function un() {
  ke = xe = null, B = !1;
}
function Co(e) {
  Ie === null ? Ie = [e] : Ie.push(e);
}
var Md = et.ReactCurrentBatchConfig;
function xn(e, t, n) {
  if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
    if (n._owner) {
      if (n = n._owner, n) {
        if (n.tag !== 1) throw Error(S(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(S(147, e));
      var l = r, i = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === i ? t.ref : (t = function(o) {
        var u = l.refs;
        o === null ? delete u[i] : u[i] = o;
      }, t._stringRef = i, t);
    }
    if (typeof e != "string") throw Error(S(284));
    if (!n._owner) throw Error(S(290, e));
  }
  return e;
}
function kr(e, t) {
  throw e = Object.prototype.toString.call(t), Error(S(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function Mu(e) {
  var t = e._init;
  return t(e._payload);
}
function Ns(e) {
  function t(p, f) {
    if (e) {
      var h = p.deletions;
      h === null ? (p.deletions = [f], p.flags |= 16) : h.push(f);
    }
  }
  function n(p, f) {
    if (!e) return null;
    for (; f !== null; ) t(p, f), f = f.sibling;
    return null;
  }
  function r(p, f) {
    for (p = /* @__PURE__ */ new Map(); f !== null; ) f.key !== null ? p.set(f.key, f) : p.set(f.index, f), f = f.sibling;
    return p;
  }
  function l(p, f) {
    return p = vt(p, f), p.index = 0, p.sibling = null, p;
  }
  function i(p, f, h) {
    return p.index = h, e ? (h = p.alternate, h !== null ? (h = h.index, h < f ? (p.flags |= 2, f) : h) : (p.flags |= 2, f)) : (p.flags |= 1048576, f);
  }
  function o(p) {
    return e && p.alternate === null && (p.flags |= 2), p;
  }
  function u(p, f, h, w) {
    return f === null || f.tag !== 6 ? (f = bl(h, p.mode, w), f.return = p, f) : (f = l(f, h), f.return = p, f);
  }
  function a(p, f, h, w) {
    var _ = h.type;
    return _ === Bt ? c(p, f, h.props.children, w, h.key) : f !== null && (f.elementType === _ || typeof _ == "object" && _ !== null && _.$$typeof === rt && Mu(_) === f.type) ? (w = l(f, h.props), w.ref = xn(p, f, h), w.return = p, w) : (w = Ur(h.type, h.key, h.props, null, p.mode, w), w.ref = xn(p, f, h), w.return = p, w);
  }
  function s(p, f, h, w) {
    return f === null || f.tag !== 4 || f.stateNode.containerInfo !== h.containerInfo || f.stateNode.implementation !== h.implementation ? (f = ei(h, p.mode, w), f.return = p, f) : (f = l(f, h.children || []), f.return = p, f);
  }
  function c(p, f, h, w, _) {
    return f === null || f.tag !== 7 ? (f = Lt(h, p.mode, w, _), f.return = p, f) : (f = l(f, h), f.return = p, f);
  }
  function m(p, f, h) {
    if (typeof f == "string" && f !== "" || typeof f == "number") return f = bl("" + f, p.mode, h), f.return = p, f;
    if (typeof f == "object" && f !== null) {
      switch (f.$$typeof) {
        case cr:
          return h = Ur(f.type, f.key, f.props, null, p.mode, h), h.ref = xn(p, null, f), h.return = p, h;
        case Ut:
          return f = ei(f, p.mode, h), f.return = p, f;
        case rt:
          var w = f._init;
          return m(p, w(f._payload), h);
      }
      if (zn(f) || yn(f)) return f = Lt(f, p.mode, h, null), f.return = p, f;
      kr(p, f);
    }
    return null;
  }
  function d(p, f, h, w) {
    var _ = f !== null ? f.key : null;
    if (typeof h == "string" && h !== "" || typeof h == "number") return _ !== null ? null : u(p, f, "" + h, w);
    if (typeof h == "object" && h !== null) {
      switch (h.$$typeof) {
        case cr:
          return h.key === _ ? a(p, f, h, w) : null;
        case Ut:
          return h.key === _ ? s(p, f, h, w) : null;
        case rt:
          return _ = h._init, d(
            p,
            f,
            _(h._payload),
            w
          );
      }
      if (zn(h) || yn(h)) return _ !== null ? null : c(p, f, h, w, null);
      kr(p, h);
    }
    return null;
  }
  function y(p, f, h, w, _) {
    if (typeof w == "string" && w !== "" || typeof w == "number") return p = p.get(h) || null, u(f, p, "" + w, _);
    if (typeof w == "object" && w !== null) {
      switch (w.$$typeof) {
        case cr:
          return p = p.get(w.key === null ? h : w.key) || null, a(f, p, w, _);
        case Ut:
          return p = p.get(w.key === null ? h : w.key) || null, s(f, p, w, _);
        case rt:
          var z = w._init;
          return y(p, f, h, z(w._payload), _);
      }
      if (zn(w) || yn(w)) return p = p.get(h) || null, c(f, p, w, _, null);
      kr(f, w);
    }
    return null;
  }
  function v(p, f, h, w) {
    for (var _ = null, z = null, P = f, x = f = 0, T = null; P !== null && x < h.length; x++) {
      P.index > x ? (T = P, P = null) : T = P.sibling;
      var N = d(p, P, h[x], w);
      if (N === null) {
        P === null && (P = T);
        break;
      }
      e && P && N.alternate === null && t(p, P), f = i(N, f, x), z === null ? _ = N : z.sibling = N, z = N, P = T;
    }
    if (x === h.length) return n(p, P), B && Ct(p, x), _;
    if (P === null) {
      for (; x < h.length; x++) P = m(p, h[x], w), P !== null && (f = i(P, f, x), z === null ? _ = P : z.sibling = P, z = P);
      return B && Ct(p, x), _;
    }
    for (P = r(p, P); x < h.length; x++) T = y(P, p, x, h[x], w), T !== null && (e && T.alternate !== null && P.delete(T.key === null ? x : T.key), f = i(T, f, x), z === null ? _ = T : z.sibling = T, z = T);
    return e && P.forEach(function(I) {
      return t(p, I);
    }), B && Ct(p, x), _;
  }
  function k(p, f, h, w) {
    var _ = yn(h);
    if (typeof _ != "function") throw Error(S(150));
    if (h = _.call(h), h == null) throw Error(S(151));
    for (var z = _ = null, P = f, x = f = 0, T = null, N = h.next(); P !== null && !N.done; x++, N = h.next()) {
      P.index > x ? (T = P, P = null) : T = P.sibling;
      var I = d(p, P, N.value, w);
      if (I === null) {
        P === null && (P = T);
        break;
      }
      e && P && I.alternate === null && t(p, P), f = i(I, f, x), z === null ? _ = I : z.sibling = I, z = I, P = T;
    }
    if (N.done) return n(
      p,
      P
    ), B && Ct(p, x), _;
    if (P === null) {
      for (; !N.done; x++, N = h.next()) N = m(p, N.value, w), N !== null && (f = i(N, f, x), z === null ? _ = N : z.sibling = N, z = N);
      return B && Ct(p, x), _;
    }
    for (P = r(p, P); !N.done; x++, N = h.next()) N = y(P, p, x, N.value, w), N !== null && (e && N.alternate !== null && P.delete(N.key === null ? x : N.key), f = i(N, f, x), z === null ? _ = N : z.sibling = N, z = N);
    return e && P.forEach(function(ae) {
      return t(p, ae);
    }), B && Ct(p, x), _;
  }
  function D(p, f, h, w) {
    if (typeof h == "object" && h !== null && h.type === Bt && h.key === null && (h = h.props.children), typeof h == "object" && h !== null) {
      switch (h.$$typeof) {
        case cr:
          e: {
            for (var _ = h.key, z = f; z !== null; ) {
              if (z.key === _) {
                if (_ = h.type, _ === Bt) {
                  if (z.tag === 7) {
                    n(p, z.sibling), f = l(z, h.props.children), f.return = p, p = f;
                    break e;
                  }
                } else if (z.elementType === _ || typeof _ == "object" && _ !== null && _.$$typeof === rt && Mu(_) === z.type) {
                  n(p, z.sibling), f = l(z, h.props), f.ref = xn(p, z, h), f.return = p, p = f;
                  break e;
                }
                n(p, z);
                break;
              } else t(p, z);
              z = z.sibling;
            }
            h.type === Bt ? (f = Lt(h.props.children, p.mode, w, h.key), f.return = p, p = f) : (w = Ur(h.type, h.key, h.props, null, p.mode, w), w.ref = xn(p, f, h), w.return = p, p = w);
          }
          return o(p);
        case Ut:
          e: {
            for (z = h.key; f !== null; ) {
              if (f.key === z) if (f.tag === 4 && f.stateNode.containerInfo === h.containerInfo && f.stateNode.implementation === h.implementation) {
                n(p, f.sibling), f = l(f, h.children || []), f.return = p, p = f;
                break e;
              } else {
                n(p, f);
                break;
              }
              else t(p, f);
              f = f.sibling;
            }
            f = ei(h, p.mode, w), f.return = p, p = f;
          }
          return o(p);
        case rt:
          return z = h._init, D(p, f, z(h._payload), w);
      }
      if (zn(h)) return v(p, f, h, w);
      if (yn(h)) return k(p, f, h, w);
      kr(p, h);
    }
    return typeof h == "string" && h !== "" || typeof h == "number" ? (h = "" + h, f !== null && f.tag === 6 ? (n(p, f.sibling), f = l(f, h), f.return = p, p = f) : (n(p, f), f = bl(h, p.mode, w), f.return = p, p = f), o(p)) : n(p, f);
  }
  return D;
}
var an = Ns(!0), Ts = Ns(!1), el = St(null), tl = null, Xt = null, Po = null;
function zo() {
  Po = Xt = tl = null;
}
function No(e) {
  var t = el.current;
  U(el), e._currentValue = t;
}
function Ii(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function nn(e, t) {
  tl = e, Po = Xt = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (he = !0), e.firstContext = null);
}
function je(e) {
  var t = e._currentValue;
  if (Po !== e) if (e = { context: e, memoizedValue: t, next: null }, Xt === null) {
    if (tl === null) throw Error(S(308));
    Xt = e, tl.dependencies = { lanes: 0, firstContext: e };
  } else Xt = Xt.next = e;
  return t;
}
var Nt = null;
function To(e) {
  Nt === null ? Nt = [e] : Nt.push(e);
}
function js(e, t, n, r) {
  var l = t.interleaved;
  return l === null ? (n.next = n, To(t)) : (n.next = l.next, l.next = n), t.interleaved = n, qe(e, r);
}
function qe(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
  return n.tag === 3 ? n.stateNode : null;
}
var lt = !1;
function jo(e) {
  e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function Ls(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function Xe(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function pt(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, M & 2) {
    var l = r.pending;
    return l === null ? t.next = t : (t.next = l.next, l.next = t), r.pending = t, qe(e, n);
  }
  return l = r.interleaved, l === null ? (t.next = t, To(r)) : (t.next = l.next, l.next = t), r.interleaved = t, qe(e, n);
}
function Mr(e, t, n) {
  if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, ho(e, n);
  }
}
function Iu(e, t) {
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
function nl(e, t, n, r) {
  var l = e.updateQueue;
  lt = !1;
  var i = l.firstBaseUpdate, o = l.lastBaseUpdate, u = l.shared.pending;
  if (u !== null) {
    l.shared.pending = null;
    var a = u, s = a.next;
    a.next = null, o === null ? i = s : o.next = s, o = a;
    var c = e.alternate;
    c !== null && (c = c.updateQueue, u = c.lastBaseUpdate, u !== o && (u === null ? c.firstBaseUpdate = s : u.next = s, c.lastBaseUpdate = a));
  }
  if (i !== null) {
    var m = l.baseState;
    o = 0, c = s = a = null, u = i;
    do {
      var d = u.lane, y = u.eventTime;
      if ((r & d) === d) {
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
          switch (d = t, y = n, k.tag) {
            case 1:
              if (v = k.payload, typeof v == "function") {
                m = v.call(y, m, d);
                break e;
              }
              m = v;
              break e;
            case 3:
              v.flags = v.flags & -65537 | 128;
            case 0:
              if (v = k.payload, d = typeof v == "function" ? v.call(y, m, d) : v, d == null) break e;
              m = H({}, m, d);
              break e;
            case 2:
              lt = !0;
          }
        }
        u.callback !== null && u.lane !== 0 && (e.flags |= 64, d = l.effects, d === null ? l.effects = [u] : d.push(u));
      } else y = { eventTime: y, lane: d, tag: u.tag, payload: u.payload, callback: u.callback, next: null }, c === null ? (s = c = y, a = m) : c = c.next = y, o |= d;
      if (u = u.next, u === null) {
        if (u = l.shared.pending, u === null) break;
        d = u, u = d.next, d.next = null, l.lastBaseUpdate = d, l.shared.pending = null;
      }
    } while (!0);
    if (c === null && (a = m), l.baseState = a, l.firstBaseUpdate = s, l.lastBaseUpdate = c, t = l.shared.interleaved, t !== null) {
      l = t;
      do
        o |= l.lane, l = l.next;
      while (l !== t);
    } else i === null && (l.shared.lanes = 0);
    It |= o, e.lanes = o, e.memoizedState = m;
  }
}
function $u(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], l = r.callback;
    if (l !== null) {
      if (r.callback = null, r = n, typeof l != "function") throw Error(S(191, l));
      l.call(r);
    }
  }
}
var or = {}, We = St(or), Zn = St(or), Jn = St(or);
function Tt(e) {
  if (e === or) throw Error(S(174));
  return e;
}
function Lo(e, t) {
  switch (O(Jn, t), O(Zn, e), O(We, or), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : hi(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = hi(t, e);
  }
  U(We), O(We, t);
}
function sn() {
  U(We), U(Zn), U(Jn);
}
function Rs(e) {
  Tt(Jn.current);
  var t = Tt(We.current), n = hi(t, e.type);
  t !== n && (O(Zn, e), O(We, n));
}
function Ro(e) {
  Zn.current === e && (U(We), U(Zn));
}
var V = St(0);
function rl(e) {
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
var Gl = [];
function Do() {
  for (var e = 0; e < Gl.length; e++) Gl[e]._workInProgressVersionPrimary = null;
  Gl.length = 0;
}
var Ir = et.ReactCurrentDispatcher, Yl = et.ReactCurrentBatchConfig, Mt = 0, W = null, X = null, q = null, ll = !1, In = !1, qn = 0, Id = 0;
function le() {
  throw Error(S(321));
}
function Mo(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!Oe(e[n], t[n])) return !1;
  return !0;
}
function Io(e, t, n, r, l, i) {
  if (Mt = i, W = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Ir.current = e === null || e.memoizedState === null ? Ad : Ud, e = n(r, l), In) {
    i = 0;
    do {
      if (In = !1, qn = 0, 25 <= i) throw Error(S(301));
      i += 1, q = X = null, t.updateQueue = null, Ir.current = Bd, e = n(r, l);
    } while (In);
  }
  if (Ir.current = il, t = X !== null && X.next !== null, Mt = 0, q = X = W = null, ll = !1, t) throw Error(S(300));
  return e;
}
function $o() {
  var e = qn !== 0;
  return qn = 0, e;
}
function Ue() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return q === null ? W.memoizedState = q = e : q = q.next = e, q;
}
function Le() {
  if (X === null) {
    var e = W.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = X.next;
  var t = q === null ? W.memoizedState : q.next;
  if (t !== null) q = t, X = e;
  else {
    if (e === null) throw Error(S(310));
    X = e, e = { memoizedState: X.memoizedState, baseState: X.baseState, baseQueue: X.baseQueue, queue: X.queue, next: null }, q === null ? W.memoizedState = q = e : q = q.next = e;
  }
  return q;
}
function bn(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function Xl(e) {
  var t = Le(), n = t.queue;
  if (n === null) throw Error(S(311));
  n.lastRenderedReducer = e;
  var r = X, l = r.baseQueue, i = n.pending;
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
      if ((Mt & c) === c) a !== null && (a = a.next = { lane: 0, action: s.action, hasEagerState: s.hasEagerState, eagerState: s.eagerState, next: null }), r = s.hasEagerState ? s.eagerState : e(r, s.action);
      else {
        var m = {
          lane: c,
          action: s.action,
          hasEagerState: s.hasEagerState,
          eagerState: s.eagerState,
          next: null
        };
        a === null ? (u = a = m, o = r) : a = a.next = m, W.lanes |= c, It |= c;
      }
      s = s.next;
    } while (s !== null && s !== i);
    a === null ? o = r : a.next = u, Oe(r, t.memoizedState) || (he = !0), t.memoizedState = r, t.baseState = o, t.baseQueue = a, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    l = e;
    do
      i = l.lane, W.lanes |= i, It |= i, l = l.next;
    while (l !== e);
  } else l === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function Zl(e) {
  var t = Le(), n = t.queue;
  if (n === null) throw Error(S(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch, l = n.pending, i = t.memoizedState;
  if (l !== null) {
    n.pending = null;
    var o = l = l.next;
    do
      i = e(i, o.action), o = o.next;
    while (o !== l);
    Oe(i, t.memoizedState) || (he = !0), t.memoizedState = i, t.baseQueue === null && (t.baseState = i), n.lastRenderedState = i;
  }
  return [i, r];
}
function Ds() {
}
function Ms(e, t) {
  var n = W, r = Le(), l = t(), i = !Oe(r.memoizedState, l);
  if (i && (r.memoizedState = l, he = !0), r = r.queue, Fo(Fs.bind(null, n, r, e), [e]), r.getSnapshot !== t || i || q !== null && q.memoizedState.tag & 1) {
    if (n.flags |= 2048, er(9, $s.bind(null, n, r, l, t), void 0, null), b === null) throw Error(S(349));
    Mt & 30 || Is(n, t, l);
  }
  return l;
}
function Is(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = W.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, W.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function $s(e, t, n, r) {
  t.value = n, t.getSnapshot = r, Os(t) && As(e);
}
function Fs(e, t, n) {
  return n(function() {
    Os(t) && As(e);
  });
}
function Os(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Oe(e, n);
  } catch {
    return !0;
  }
}
function As(e) {
  var t = qe(e, 1);
  t !== null && Fe(t, e, 1, -1);
}
function Fu(e) {
  var t = Ue();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: bn, lastRenderedState: e }, t.queue = e, e = e.dispatch = Od.bind(null, W, e), [t.memoizedState, e];
}
function er(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = W.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, W.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function Us() {
  return Le().memoizedState;
}
function $r(e, t, n, r) {
  var l = Ue();
  W.flags |= e, l.memoizedState = er(1 | t, n, void 0, r === void 0 ? null : r);
}
function yl(e, t, n, r) {
  var l = Le();
  r = r === void 0 ? null : r;
  var i = void 0;
  if (X !== null) {
    var o = X.memoizedState;
    if (i = o.destroy, r !== null && Mo(r, o.deps)) {
      l.memoizedState = er(t, n, i, r);
      return;
    }
  }
  W.flags |= e, l.memoizedState = er(1 | t, n, i, r);
}
function Ou(e, t) {
  return $r(8390656, 8, e, t);
}
function Fo(e, t) {
  return yl(2048, 8, e, t);
}
function Bs(e, t) {
  return yl(4, 2, e, t);
}
function Vs(e, t) {
  return yl(4, 4, e, t);
}
function Ws(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function Hs(e, t, n) {
  return n = n != null ? n.concat([e]) : null, yl(4, 4, Ws.bind(null, t, e), n);
}
function Oo() {
}
function Qs(e, t) {
  var n = Le();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Mo(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function Ks(e, t) {
  var n = Le();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Mo(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function Gs(e, t, n) {
  return Mt & 21 ? (Oe(n, t) || (n = qa(), W.lanes |= n, It |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, he = !0), e.memoizedState = n);
}
function $d(e, t) {
  var n = $;
  $ = n !== 0 && 4 > n ? n : 4, e(!0);
  var r = Yl.transition;
  Yl.transition = {};
  try {
    e(!1), t();
  } finally {
    $ = n, Yl.transition = r;
  }
}
function Ys() {
  return Le().memoizedState;
}
function Fd(e, t, n) {
  var r = ht(e);
  if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, Xs(e)) Zs(t, n);
  else if (n = js(e, t, n, r), n !== null) {
    var l = ce();
    Fe(n, e, r, l), Js(n, t, r);
  }
}
function Od(e, t, n) {
  var r = ht(e), l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (Xs(e)) Zs(t, l);
  else {
    var i = e.alternate;
    if (e.lanes === 0 && (i === null || i.lanes === 0) && (i = t.lastRenderedReducer, i !== null)) try {
      var o = t.lastRenderedState, u = i(o, n);
      if (l.hasEagerState = !0, l.eagerState = u, Oe(u, o)) {
        var a = t.interleaved;
        a === null ? (l.next = l, To(t)) : (l.next = a.next, a.next = l), t.interleaved = l;
        return;
      }
    } catch {
    } finally {
    }
    n = js(e, t, l, r), n !== null && (l = ce(), Fe(n, e, r, l), Js(n, t, r));
  }
}
function Xs(e) {
  var t = e.alternate;
  return e === W || t !== null && t === W;
}
function Zs(e, t) {
  In = ll = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function Js(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, ho(e, n);
  }
}
var il = { readContext: je, useCallback: le, useContext: le, useEffect: le, useImperativeHandle: le, useInsertionEffect: le, useLayoutEffect: le, useMemo: le, useReducer: le, useRef: le, useState: le, useDebugValue: le, useDeferredValue: le, useTransition: le, useMutableSource: le, useSyncExternalStore: le, useId: le, unstable_isNewReconciler: !1 }, Ad = { readContext: je, useCallback: function(e, t) {
  return Ue().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: je, useEffect: Ou, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, $r(
    4194308,
    4,
    Ws.bind(null, t, e),
    n
  );
}, useLayoutEffect: function(e, t) {
  return $r(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return $r(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = Ue();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = Ue();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = Fd.bind(null, W, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = Ue();
  return e = { current: e }, t.memoizedState = e;
}, useState: Fu, useDebugValue: Oo, useDeferredValue: function(e) {
  return Ue().memoizedState = e;
}, useTransition: function() {
  var e = Fu(!1), t = e[0];
  return e = $d.bind(null, e[1]), Ue().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = W, l = Ue();
  if (B) {
    if (n === void 0) throw Error(S(407));
    n = n();
  } else {
    if (n = t(), b === null) throw Error(S(349));
    Mt & 30 || Is(r, t, n);
  }
  l.memoizedState = n;
  var i = { value: n, getSnapshot: t };
  return l.queue = i, Ou(Fs.bind(
    null,
    r,
    i,
    e
  ), [e]), r.flags |= 2048, er(9, $s.bind(null, r, i, n, t), void 0, null), n;
}, useId: function() {
  var e = Ue(), t = b.identifierPrefix;
  if (B) {
    var n = Ye, r = Ge;
    n = (r & ~(1 << 32 - $e(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = qn++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = Id++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: !1 }, Ud = {
  readContext: je,
  useCallback: Qs,
  useContext: je,
  useEffect: Fo,
  useImperativeHandle: Hs,
  useInsertionEffect: Bs,
  useLayoutEffect: Vs,
  useMemo: Ks,
  useReducer: Xl,
  useRef: Us,
  useState: function() {
    return Xl(bn);
  },
  useDebugValue: Oo,
  useDeferredValue: function(e) {
    var t = Le();
    return Gs(t, X.memoizedState, e);
  },
  useTransition: function() {
    var e = Xl(bn)[0], t = Le().memoizedState;
    return [e, t];
  },
  useMutableSource: Ds,
  useSyncExternalStore: Ms,
  useId: Ys,
  unstable_isNewReconciler: !1
}, Bd = { readContext: je, useCallback: Qs, useContext: je, useEffect: Fo, useImperativeHandle: Hs, useInsertionEffect: Bs, useLayoutEffect: Vs, useMemo: Ks, useReducer: Zl, useRef: Us, useState: function() {
  return Zl(bn);
}, useDebugValue: Oo, useDeferredValue: function(e) {
  var t = Le();
  return X === null ? t.memoizedState = e : Gs(t, X.memoizedState, e);
}, useTransition: function() {
  var e = Zl(bn)[0], t = Le().memoizedState;
  return [e, t];
}, useMutableSource: Ds, useSyncExternalStore: Ms, useId: Ys, unstable_isNewReconciler: !1 };
function De(e, t) {
  if (e && e.defaultProps) {
    t = H({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function $i(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : H({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var gl = { isMounted: function(e) {
  return (e = e._reactInternals) ? Ot(e) === e : !1;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = ce(), l = ht(e), i = Xe(r, l);
  i.payload = t, n != null && (i.callback = n), t = pt(e, i, l), t !== null && (Fe(t, e, l, r), Mr(t, e, l));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = ce(), l = ht(e), i = Xe(r, l);
  i.tag = 1, i.payload = t, n != null && (i.callback = n), t = pt(e, i, l), t !== null && (Fe(t, e, l, r), Mr(t, e, l));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = ce(), r = ht(e), l = Xe(n, r);
  l.tag = 2, t != null && (l.callback = t), t = pt(e, l, r), t !== null && (Fe(t, e, r, n), Mr(t, e, r));
} };
function Au(e, t, n, r, l, i, o) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, i, o) : t.prototype && t.prototype.isPureReactComponent ? !Kn(n, r) || !Kn(l, i) : !0;
}
function qs(e, t, n) {
  var r = !1, l = gt, i = t.contextType;
  return typeof i == "object" && i !== null ? i = je(i) : (l = ye(t) ? Rt : ue.current, r = t.contextTypes, i = (r = r != null) ? on(e, l) : gt), t = new t(n, i), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = gl, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = l, e.__reactInternalMemoizedMaskedChildContext = i), t;
}
function Uu(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && gl.enqueueReplaceState(t, t.state, null);
}
function Fi(e, t, n, r) {
  var l = e.stateNode;
  l.props = n, l.state = e.memoizedState, l.refs = {}, jo(e);
  var i = t.contextType;
  typeof i == "object" && i !== null ? l.context = je(i) : (i = ye(t) ? Rt : ue.current, l.context = on(e, i)), l.state = e.memoizedState, i = t.getDerivedStateFromProps, typeof i == "function" && ($i(e, t, i, n), l.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof l.getSnapshotBeforeUpdate == "function" || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (t = l.state, typeof l.componentWillMount == "function" && l.componentWillMount(), typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount(), t !== l.state && gl.enqueueReplaceState(l, l.state, null), nl(e, n, l, r), l.state = e.memoizedState), typeof l.componentDidMount == "function" && (e.flags |= 4194308);
}
function cn(e, t) {
  try {
    var n = "", r = t;
    do
      n += hf(r), r = r.return;
    while (r);
    var l = n;
  } catch (i) {
    l = `
Error generating stack: ` + i.message + `
` + i.stack;
  }
  return { value: e, source: t, stack: l, digest: null };
}
function Jl(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function Oi(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function() {
      throw n;
    });
  }
}
var Vd = typeof WeakMap == "function" ? WeakMap : Map;
function bs(e, t, n) {
  n = Xe(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    ul || (ul = !0, Yi = r), Oi(e, t);
  }, n;
}
function ec(e, t, n) {
  n = Xe(-1, n), n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var l = t.value;
    n.payload = function() {
      return r(l);
    }, n.callback = function() {
      Oi(e, t);
    };
  }
  var i = e.stateNode;
  return i !== null && typeof i.componentDidCatch == "function" && (n.callback = function() {
    Oi(e, t), typeof r != "function" && (mt === null ? mt = /* @__PURE__ */ new Set([this]) : mt.add(this));
    var o = t.stack;
    this.componentDidCatch(t.value, { componentStack: o !== null ? o : "" });
  }), n;
}
function Bu(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new Vd();
    var l = /* @__PURE__ */ new Set();
    r.set(t, l);
  } else l = r.get(t), l === void 0 && (l = /* @__PURE__ */ new Set(), r.set(t, l));
  l.has(n) || (l.add(n), e = np.bind(null, e, t, n), t.then(e, e));
}
function Vu(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function Wu(e, t, n, r, l) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = l, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = Xe(-1, 1), t.tag = 2, pt(n, t, 1))), n.lanes |= 1), e);
}
var Wd = et.ReactCurrentOwner, he = !1;
function se(e, t, n, r) {
  t.child = e === null ? Ts(t, null, n, r) : an(t, e.child, n, r);
}
function Hu(e, t, n, r, l) {
  n = n.render;
  var i = t.ref;
  return nn(t, l), r = Io(e, t, n, r, i, l), n = $o(), e !== null && !he ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, be(e, t, l)) : (B && n && _o(t), t.flags |= 1, se(e, t, r, l), t.child);
}
function Qu(e, t, n, r, l) {
  if (e === null) {
    var i = n.type;
    return typeof i == "function" && !Ko(i) && i.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = i, tc(e, t, i, r, l)) : (e = Ur(n.type, null, r, t, t.mode, l), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (i = e.child, !(e.lanes & l)) {
    var o = i.memoizedProps;
    if (n = n.compare, n = n !== null ? n : Kn, n(o, r) && e.ref === t.ref) return be(e, t, l);
  }
  return t.flags |= 1, e = vt(i, r), e.ref = t.ref, e.return = t, t.child = e;
}
function tc(e, t, n, r, l) {
  if (e !== null) {
    var i = e.memoizedProps;
    if (Kn(i, r) && e.ref === t.ref) if (he = !1, t.pendingProps = r = i, (e.lanes & l) !== 0) e.flags & 131072 && (he = !0);
    else return t.lanes = e.lanes, be(e, t, l);
  }
  return Ai(e, t, n, r, l);
}
function nc(e, t, n) {
  var r = t.pendingProps, l = r.children, i = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, O(Jt, Se), Se |= n;
  else {
    if (!(n & 1073741824)) return e = i !== null ? i.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, O(Jt, Se), Se |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = i !== null ? i.baseLanes : n, O(Jt, Se), Se |= r;
  }
  else i !== null ? (r = i.baseLanes | n, t.memoizedState = null) : r = n, O(Jt, Se), Se |= r;
  return se(e, t, l, n), t.child;
}
function rc(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function Ai(e, t, n, r, l) {
  var i = ye(n) ? Rt : ue.current;
  return i = on(t, i), nn(t, l), n = Io(e, t, n, r, i, l), r = $o(), e !== null && !he ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, be(e, t, l)) : (B && r && _o(t), t.flags |= 1, se(e, t, n, l), t.child);
}
function Ku(e, t, n, r, l) {
  if (ye(n)) {
    var i = !0;
    Jr(t);
  } else i = !1;
  if (nn(t, l), t.stateNode === null) Fr(e, t), qs(t, n, r), Fi(t, n, r, l), r = !0;
  else if (e === null) {
    var o = t.stateNode, u = t.memoizedProps;
    o.props = u;
    var a = o.context, s = n.contextType;
    typeof s == "object" && s !== null ? s = je(s) : (s = ye(n) ? Rt : ue.current, s = on(t, s));
    var c = n.getDerivedStateFromProps, m = typeof c == "function" || typeof o.getSnapshotBeforeUpdate == "function";
    m || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (u !== r || a !== s) && Uu(t, o, r, s), lt = !1;
    var d = t.memoizedState;
    o.state = d, nl(t, r, o, l), a = t.memoizedState, u !== r || d !== a || ve.current || lt ? (typeof c == "function" && ($i(t, n, c, r), a = t.memoizedState), (u = lt || Au(t, n, u, r, d, a, s)) ? (m || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = a), o.props = r, o.state = a, o.context = s, r = u) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    o = t.stateNode, Ls(e, t), u = t.memoizedProps, s = t.type === t.elementType ? u : De(t.type, u), o.props = s, m = t.pendingProps, d = o.context, a = n.contextType, typeof a == "object" && a !== null ? a = je(a) : (a = ye(n) ? Rt : ue.current, a = on(t, a));
    var y = n.getDerivedStateFromProps;
    (c = typeof y == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (u !== m || d !== a) && Uu(t, o, r, a), lt = !1, d = t.memoizedState, o.state = d, nl(t, r, o, l);
    var v = t.memoizedState;
    u !== m || d !== v || ve.current || lt ? (typeof y == "function" && ($i(t, n, y, r), v = t.memoizedState), (s = lt || Au(t, n, s, r, d, v, a) || !1) ? (c || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, v, a), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, v, a)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || u === e.memoizedProps && d === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || u === e.memoizedProps && d === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = v), o.props = r, o.state = v, o.context = a, r = s) : (typeof o.componentDidUpdate != "function" || u === e.memoizedProps && d === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || u === e.memoizedProps && d === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return Ui(e, t, n, r, i, l);
}
function Ui(e, t, n, r, l, i) {
  rc(e, t);
  var o = (t.flags & 128) !== 0;
  if (!r && !o) return l && Lu(t, n, !1), be(e, t, i);
  r = t.stateNode, Wd.current = t;
  var u = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && o ? (t.child = an(t, e.child, null, i), t.child = an(t, null, u, i)) : se(e, t, u, i), t.memoizedState = r.state, l && Lu(t, n, !0), t.child;
}
function lc(e) {
  var t = e.stateNode;
  t.pendingContext ? ju(e, t.pendingContext, t.pendingContext !== t.context) : t.context && ju(e, t.context, !1), Lo(e, t.containerInfo);
}
function Gu(e, t, n, r, l) {
  return un(), Co(l), t.flags |= 256, se(e, t, n, r), t.child;
}
var Bi = { dehydrated: null, treeContext: null, retryLane: 0 };
function Vi(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function ic(e, t, n) {
  var r = t.pendingProps, l = V.current, i = !1, o = (t.flags & 128) !== 0, u;
  if ((u = o) || (u = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0), u ? (i = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (l |= 1), O(V, l & 1), e === null)
    return Mi(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (o = r.children, e = r.fallback, i ? (r = t.mode, i = t.child, o = { mode: "hidden", children: o }, !(r & 1) && i !== null ? (i.childLanes = 0, i.pendingProps = o) : i = kl(o, r, 0, null), e = Lt(e, r, n, null), i.return = t, e.return = t, i.sibling = e, t.child = i, t.child.memoizedState = Vi(n), t.memoizedState = Bi, e) : Ao(t, o));
  if (l = e.memoizedState, l !== null && (u = l.dehydrated, u !== null)) return Hd(e, t, o, r, u, l, n);
  if (i) {
    i = r.fallback, o = t.mode, l = e.child, u = l.sibling;
    var a = { mode: "hidden", children: r.children };
    return !(o & 1) && t.child !== l ? (r = t.child, r.childLanes = 0, r.pendingProps = a, t.deletions = null) : (r = vt(l, a), r.subtreeFlags = l.subtreeFlags & 14680064), u !== null ? i = vt(u, i) : (i = Lt(i, o, n, null), i.flags |= 2), i.return = t, r.return = t, r.sibling = i, t.child = r, r = i, i = t.child, o = e.child.memoizedState, o = o === null ? Vi(n) : { baseLanes: o.baseLanes | n, cachePool: null, transitions: o.transitions }, i.memoizedState = o, i.childLanes = e.childLanes & ~n, t.memoizedState = Bi, r;
  }
  return i = e.child, e = i.sibling, r = vt(i, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function Ao(e, t) {
  return t = kl({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function xr(e, t, n, r) {
  return r !== null && Co(r), an(t, e.child, null, n), e = Ao(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function Hd(e, t, n, r, l, i, o) {
  if (n)
    return t.flags & 256 ? (t.flags &= -257, r = Jl(Error(S(422))), xr(e, t, o, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (i = r.fallback, l = t.mode, r = kl({ mode: "visible", children: r.children }, l, 0, null), i = Lt(i, l, o, null), i.flags |= 2, r.return = t, i.return = t, r.sibling = i, t.child = r, t.mode & 1 && an(t, e.child, null, o), t.child.memoizedState = Vi(o), t.memoizedState = Bi, i);
  if (!(t.mode & 1)) return xr(e, t, o, null);
  if (l.data === "$!") {
    if (r = l.nextSibling && l.nextSibling.dataset, r) var u = r.dgst;
    return r = u, i = Error(S(419)), r = Jl(i, r, void 0), xr(e, t, o, r);
  }
  if (u = (o & e.childLanes) !== 0, he || u) {
    if (r = b, r !== null) {
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
      l = l & (r.suspendedLanes | o) ? 0 : l, l !== 0 && l !== i.retryLane && (i.retryLane = l, qe(e, l), Fe(r, e, l, -1));
    }
    return Qo(), r = Jl(Error(S(421))), xr(e, t, o, r);
  }
  return l.data === "$?" ? (t.flags |= 128, t.child = e.child, t = rp.bind(null, e), l._reactRetry = t, null) : (e = i.treeContext, ke = dt(l.nextSibling), xe = t, B = !0, Ie = null, e !== null && (Pe[ze++] = Ge, Pe[ze++] = Ye, Pe[ze++] = Dt, Ge = e.id, Ye = e.overflow, Dt = t), t = Ao(t, r.children), t.flags |= 4096, t);
}
function Yu(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), Ii(e.return, t, n);
}
function ql(e, t, n, r, l) {
  var i = e.memoizedState;
  i === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: l } : (i.isBackwards = t, i.rendering = null, i.renderingStartTime = 0, i.last = r, i.tail = n, i.tailMode = l);
}
function oc(e, t, n) {
  var r = t.pendingProps, l = r.revealOrder, i = r.tail;
  if (se(e, t, r.children, n), r = V.current, r & 2) r = r & 1 | 2, t.flags |= 128;
  else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && Yu(e, n, t);
      else if (e.tag === 19) Yu(e, n, t);
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
  if (O(V, r), !(t.mode & 1)) t.memoizedState = null;
  else switch (l) {
    case "forwards":
      for (n = t.child, l = null; n !== null; ) e = n.alternate, e !== null && rl(e) === null && (l = n), n = n.sibling;
      n = l, n === null ? (l = t.child, t.child = null) : (l = n.sibling, n.sibling = null), ql(t, !1, l, n, i);
      break;
    case "backwards":
      for (n = null, l = t.child, t.child = null; l !== null; ) {
        if (e = l.alternate, e !== null && rl(e) === null) {
          t.child = l;
          break;
        }
        e = l.sibling, l.sibling = n, n = l, l = e;
      }
      ql(t, !0, n, null, i);
      break;
    case "together":
      ql(t, !1, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function Fr(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
}
function be(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), It |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(S(153));
  if (t.child !== null) {
    for (e = t.child, n = vt(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = vt(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function Qd(e, t, n) {
  switch (t.tag) {
    case 3:
      lc(t), un();
      break;
    case 5:
      Rs(t);
      break;
    case 1:
      ye(t.type) && Jr(t);
      break;
    case 4:
      Lo(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, l = t.memoizedProps.value;
      O(el, r._currentValue), r._currentValue = l;
      break;
    case 13:
      if (r = t.memoizedState, r !== null)
        return r.dehydrated !== null ? (O(V, V.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? ic(e, t, n) : (O(V, V.current & 1), e = be(e, t, n), e !== null ? e.sibling : null);
      O(V, V.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return oc(e, t, n);
        t.flags |= 128;
      }
      if (l = t.memoizedState, l !== null && (l.rendering = null, l.tail = null, l.lastEffect = null), O(V, V.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, nc(e, t, n);
  }
  return be(e, t, n);
}
var uc, Wi, ac, sc;
uc = function(e, t) {
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
Wi = function() {
};
ac = function(e, t, n, r) {
  var l = e.memoizedProps;
  if (l !== r) {
    e = t.stateNode, Tt(We.current);
    var i = null;
    switch (n) {
      case "input":
        l = fi(e, l), r = fi(e, r), i = [];
        break;
      case "select":
        l = H({}, l, { value: void 0 }), r = H({}, r, { value: void 0 }), i = [];
        break;
      case "textarea":
        l = mi(e, l), r = mi(e, r), i = [];
        break;
      default:
        typeof l.onClick != "function" && typeof r.onClick == "function" && (e.onclick = Xr);
    }
    vi(n, r);
    var o;
    n = null;
    for (s in l) if (!r.hasOwnProperty(s) && l.hasOwnProperty(s) && l[s] != null) if (s === "style") {
      var u = l[s];
      for (o in u) u.hasOwnProperty(o) && (n || (n = {}), n[o] = "");
    } else s !== "dangerouslySetInnerHTML" && s !== "children" && s !== "suppressContentEditableWarning" && s !== "suppressHydrationWarning" && s !== "autoFocus" && (An.hasOwnProperty(s) ? i || (i = []) : (i = i || []).push(s, null));
    for (s in r) {
      var a = r[s];
      if (u = l != null ? l[s] : void 0, r.hasOwnProperty(s) && a !== u && (a != null || u != null)) if (s === "style") if (u) {
        for (o in u) !u.hasOwnProperty(o) || a && a.hasOwnProperty(o) || (n || (n = {}), n[o] = "");
        for (o in a) a.hasOwnProperty(o) && u[o] !== a[o] && (n || (n = {}), n[o] = a[o]);
      } else n || (i || (i = []), i.push(
        s,
        n
      )), n = a;
      else s === "dangerouslySetInnerHTML" ? (a = a ? a.__html : void 0, u = u ? u.__html : void 0, a != null && u !== a && (i = i || []).push(s, a)) : s === "children" ? typeof a != "string" && typeof a != "number" || (i = i || []).push(s, "" + a) : s !== "suppressContentEditableWarning" && s !== "suppressHydrationWarning" && (An.hasOwnProperty(s) ? (a != null && s === "onScroll" && A("scroll", e), i || u === a || (i = [])) : (i = i || []).push(s, a));
    }
    n && (i = i || []).push("style", n);
    var s = i;
    (t.updateQueue = s) && (t.flags |= 4);
  }
};
sc = function(e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function _n(e, t) {
  if (!B) switch (e.tailMode) {
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
function ie(e) {
  var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
  if (t) for (var l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags & 14680064, r |= l.flags & 14680064, l.return = e, l = l.sibling;
  else for (l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags, r |= l.flags, l.return = e, l = l.sibling;
  return e.subtreeFlags |= r, e.childLanes = n, t;
}
function Kd(e, t, n) {
  var r = t.pendingProps;
  switch (Eo(t), t.tag) {
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
      return ie(t), null;
    case 1:
      return ye(t.type) && Zr(), ie(t), null;
    case 3:
      return r = t.stateNode, sn(), U(ve), U(ue), Do(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (Sr(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Ie !== null && (Ji(Ie), Ie = null))), Wi(e, t), ie(t), null;
    case 5:
      Ro(t);
      var l = Tt(Jn.current);
      if (n = t.type, e !== null && t.stateNode != null) ac(e, t, n, r, l), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(S(166));
          return ie(t), null;
        }
        if (e = Tt(We.current), Sr(t)) {
          r = t.stateNode, n = t.type;
          var i = t.memoizedProps;
          switch (r[Be] = t, r[Xn] = i, e = (t.mode & 1) !== 0, n) {
            case "dialog":
              A("cancel", r), A("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              A("load", r);
              break;
            case "video":
            case "audio":
              for (l = 0; l < Tn.length; l++) A(Tn[l], r);
              break;
            case "source":
              A("error", r);
              break;
            case "img":
            case "image":
            case "link":
              A(
                "error",
                r
              ), A("load", r);
              break;
            case "details":
              A("toggle", r);
              break;
            case "input":
              ru(r, i), A("invalid", r);
              break;
            case "select":
              r._wrapperState = { wasMultiple: !!i.multiple }, A("invalid", r);
              break;
            case "textarea":
              iu(r, i), A("invalid", r);
          }
          vi(n, i), l = null;
          for (var o in i) if (i.hasOwnProperty(o)) {
            var u = i[o];
            o === "children" ? typeof u == "string" ? r.textContent !== u && (i.suppressHydrationWarning !== !0 && wr(r.textContent, u, e), l = ["children", u]) : typeof u == "number" && r.textContent !== "" + u && (i.suppressHydrationWarning !== !0 && wr(
              r.textContent,
              u,
              e
            ), l = ["children", "" + u]) : An.hasOwnProperty(o) && u != null && o === "onScroll" && A("scroll", r);
          }
          switch (n) {
            case "input":
              fr(r), lu(r, i, !0);
              break;
            case "textarea":
              fr(r), ou(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof i.onClick == "function" && (r.onclick = Xr);
          }
          r = l, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          o = l.nodeType === 9 ? l : l.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Fa(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = o.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = o.createElement(n, { is: r.is }) : (e = o.createElement(n), n === "select" && (o = e, r.multiple ? o.multiple = !0 : r.size && (o.size = r.size))) : e = o.createElementNS(e, n), e[Be] = t, e[Xn] = r, uc(e, t, !1, !1), t.stateNode = e;
          e: {
            switch (o = yi(n, r), n) {
              case "dialog":
                A("cancel", e), A("close", e), l = r;
                break;
              case "iframe":
              case "object":
              case "embed":
                A("load", e), l = r;
                break;
              case "video":
              case "audio":
                for (l = 0; l < Tn.length; l++) A(Tn[l], e);
                l = r;
                break;
              case "source":
                A("error", e), l = r;
                break;
              case "img":
              case "image":
              case "link":
                A(
                  "error",
                  e
                ), A("load", e), l = r;
                break;
              case "details":
                A("toggle", e), l = r;
                break;
              case "input":
                ru(e, r), l = fi(e, r), A("invalid", e);
                break;
              case "option":
                l = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, l = H({}, r, { value: void 0 }), A("invalid", e);
                break;
              case "textarea":
                iu(e, r), l = mi(e, r), A("invalid", e);
                break;
              default:
                l = r;
            }
            vi(n, l), u = l;
            for (i in u) if (u.hasOwnProperty(i)) {
              var a = u[i];
              i === "style" ? Ua(e, a) : i === "dangerouslySetInnerHTML" ? (a = a ? a.__html : void 0, a != null && Oa(e, a)) : i === "children" ? typeof a == "string" ? (n !== "textarea" || a !== "") && Un(e, a) : typeof a == "number" && Un(e, "" + a) : i !== "suppressContentEditableWarning" && i !== "suppressHydrationWarning" && i !== "autoFocus" && (An.hasOwnProperty(i) ? a != null && i === "onScroll" && A("scroll", e) : a != null && ao(e, i, a, o));
            }
            switch (n) {
              case "input":
                fr(e), lu(e, r, !1);
                break;
              case "textarea":
                fr(e), ou(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + yt(r.value));
                break;
              case "select":
                e.multiple = !!r.multiple, i = r.value, i != null ? qt(e, !!r.multiple, i, !1) : r.defaultValue != null && qt(
                  e,
                  !!r.multiple,
                  r.defaultValue,
                  !0
                );
                break;
              default:
                typeof l.onClick == "function" && (e.onclick = Xr);
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
      return ie(t), null;
    case 6:
      if (e && t.stateNode != null) sc(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(S(166));
        if (n = Tt(Jn.current), Tt(We.current), Sr(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[Be] = t, (i = r.nodeValue !== n) && (e = xe, e !== null)) switch (e.tag) {
            case 3:
              wr(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && wr(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          i && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[Be] = t, t.stateNode = r;
      }
      return ie(t), null;
    case 13:
      if (U(V), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (B && ke !== null && t.mode & 1 && !(t.flags & 128)) zs(), un(), t.flags |= 98560, i = !1;
        else if (i = Sr(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!i) throw Error(S(318));
            if (i = t.memoizedState, i = i !== null ? i.dehydrated : null, !i) throw Error(S(317));
            i[Be] = t;
          } else un(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          ie(t), i = !1;
        } else Ie !== null && (Ji(Ie), Ie = null), i = !0;
        if (!i) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || V.current & 1 ? Z === 0 && (Z = 3) : Qo())), t.updateQueue !== null && (t.flags |= 4), ie(t), null);
    case 4:
      return sn(), Wi(e, t), e === null && Gn(t.stateNode.containerInfo), ie(t), null;
    case 10:
      return No(t.type._context), ie(t), null;
    case 17:
      return ye(t.type) && Zr(), ie(t), null;
    case 19:
      if (U(V), i = t.memoizedState, i === null) return ie(t), null;
      if (r = (t.flags & 128) !== 0, o = i.rendering, o === null) if (r) _n(i, !1);
      else {
        if (Z !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (o = rl(e), o !== null) {
            for (t.flags |= 128, _n(i, !1), r = o.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) i = n, e = r, i.flags &= 14680066, o = i.alternate, o === null ? (i.childLanes = 0, i.lanes = e, i.child = null, i.subtreeFlags = 0, i.memoizedProps = null, i.memoizedState = null, i.updateQueue = null, i.dependencies = null, i.stateNode = null) : (i.childLanes = o.childLanes, i.lanes = o.lanes, i.child = o.child, i.subtreeFlags = 0, i.deletions = null, i.memoizedProps = o.memoizedProps, i.memoizedState = o.memoizedState, i.updateQueue = o.updateQueue, i.type = o.type, e = o.dependencies, i.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return O(V, V.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        i.tail !== null && G() > fn && (t.flags |= 128, r = !0, _n(i, !1), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = rl(o), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), _n(i, !0), i.tail === null && i.tailMode === "hidden" && !o.alternate && !B) return ie(t), null;
        } else 2 * G() - i.renderingStartTime > fn && n !== 1073741824 && (t.flags |= 128, r = !0, _n(i, !1), t.lanes = 4194304);
        i.isBackwards ? (o.sibling = t.child, t.child = o) : (n = i.last, n !== null ? n.sibling = o : t.child = o, i.last = o);
      }
      return i.tail !== null ? (t = i.tail, i.rendering = t, i.tail = t.sibling, i.renderingStartTime = G(), t.sibling = null, n = V.current, O(V, r ? n & 1 | 2 : n & 1), t) : (ie(t), null);
    case 22:
    case 23:
      return Ho(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? Se & 1073741824 && (ie(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : ie(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(S(156, t.tag));
}
function Gd(e, t) {
  switch (Eo(t), t.tag) {
    case 1:
      return ye(t.type) && Zr(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return sn(), U(ve), U(ue), Do(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return Ro(t), null;
    case 13:
      if (U(V), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(S(340));
        un();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return U(V), null;
    case 4:
      return sn(), null;
    case 10:
      return No(t.type._context), null;
    case 22:
    case 23:
      return Ho(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var _r = !1, oe = !1, Yd = typeof WeakSet == "function" ? WeakSet : Set, E = null;
function Zt(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    Q(e, t, r);
  }
  else n.current = null;
}
function Hi(e, t, n) {
  try {
    n();
  } catch (r) {
    Q(e, t, r);
  }
}
var Xu = !1;
function Xd(e, t) {
  if (zi = Kr, e = ms(), xo(e)) {
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
        var o = 0, u = -1, a = -1, s = 0, c = 0, m = e, d = null;
        t: for (; ; ) {
          for (var y; m !== n || l !== 0 && m.nodeType !== 3 || (u = o + l), m !== i || r !== 0 && m.nodeType !== 3 || (a = o + r), m.nodeType === 3 && (o += m.nodeValue.length), (y = m.firstChild) !== null; )
            d = m, m = y;
          for (; ; ) {
            if (m === e) break t;
            if (d === n && ++s === l && (u = o), d === i && ++c === r && (a = o), (y = m.nextSibling) !== null) break;
            m = d, d = m.parentNode;
          }
          m = y;
        }
        n = u === -1 || a === -1 ? null : { start: u, end: a };
      } else n = null;
    }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (Ni = { focusedElem: e, selectionRange: n }, Kr = !1, E = t; E !== null; ) if (t = E, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, E = e;
  else for (; E !== null; ) {
    t = E;
    try {
      var v = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (v !== null) {
            var k = v.memoizedProps, D = v.memoizedState, p = t.stateNode, f = p.getSnapshotBeforeUpdate(t.elementType === t.type ? k : De(t.type, k), D);
            p.__reactInternalSnapshotBeforeUpdate = f;
          }
          break;
        case 3:
          var h = t.stateNode.containerInfo;
          h.nodeType === 1 ? h.textContent = "" : h.nodeType === 9 && h.documentElement && h.removeChild(h.documentElement);
          break;
        case 5:
        case 6:
        case 4:
        case 17:
          break;
        default:
          throw Error(S(163));
      }
    } catch (w) {
      Q(t, t.return, w);
    }
    if (e = t.sibling, e !== null) {
      e.return = t.return, E = e;
      break;
    }
    E = t.return;
  }
  return v = Xu, Xu = !1, v;
}
function $n(e, t, n) {
  var r = t.updateQueue;
  if (r = r !== null ? r.lastEffect : null, r !== null) {
    var l = r = r.next;
    do {
      if ((l.tag & e) === e) {
        var i = l.destroy;
        l.destroy = void 0, i !== void 0 && Hi(t, n, i);
      }
      l = l.next;
    } while (l !== r);
  }
}
function wl(e, t) {
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
function Qi(e) {
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
function cc(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, cc(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Be], delete t[Xn], delete t[Li], delete t[Ld], delete t[Rd])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function fc(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Zu(e) {
  e: for (; ; ) {
    for (; e.sibling === null; ) {
      if (e.return === null || fc(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      e.child.return = e, e = e.child;
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function Ki(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Xr));
  else if (r !== 4 && (e = e.child, e !== null)) for (Ki(e, t, n), e = e.sibling; e !== null; ) Ki(e, t, n), e = e.sibling;
}
function Gi(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child, e !== null)) for (Gi(e, t, n), e = e.sibling; e !== null; ) Gi(e, t, n), e = e.sibling;
}
var ee = null, Me = !1;
function nt(e, t, n) {
  for (n = n.child; n !== null; ) dc(e, t, n), n = n.sibling;
}
function dc(e, t, n) {
  if (Ve && typeof Ve.onCommitFiberUnmount == "function") try {
    Ve.onCommitFiberUnmount(fl, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      oe || Zt(n, t);
    case 6:
      var r = ee, l = Me;
      ee = null, nt(e, t, n), ee = r, Me = l, ee !== null && (Me ? (e = ee, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : ee.removeChild(n.stateNode));
      break;
    case 18:
      ee !== null && (Me ? (e = ee, n = n.stateNode, e.nodeType === 8 ? Ql(e.parentNode, n) : e.nodeType === 1 && Ql(e, n), Hn(e)) : Ql(ee, n.stateNode));
      break;
    case 4:
      r = ee, l = Me, ee = n.stateNode.containerInfo, Me = !0, nt(e, t, n), ee = r, Me = l;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!oe && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        l = r = r.next;
        do {
          var i = l, o = i.destroy;
          i = i.tag, o !== void 0 && (i & 2 || i & 4) && Hi(n, t, o), l = l.next;
        } while (l !== r);
      }
      nt(e, t, n);
      break;
    case 1:
      if (!oe && (Zt(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
        r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
      } catch (u) {
        Q(n, t, u);
      }
      nt(e, t, n);
      break;
    case 21:
      nt(e, t, n);
      break;
    case 22:
      n.mode & 1 ? (oe = (r = oe) || n.memoizedState !== null, nt(e, t, n), oe = r) : nt(e, t, n);
      break;
    default:
      nt(e, t, n);
  }
}
function Ju(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new Yd()), t.forEach(function(r) {
      var l = lp.bind(null, e, r);
      n.has(r) || (n.add(r), r.then(l, l));
    });
  }
}
function Re(e, t) {
  var n = t.deletions;
  if (n !== null) for (var r = 0; r < n.length; r++) {
    var l = n[r];
    try {
      var i = e, o = t, u = o;
      e: for (; u !== null; ) {
        switch (u.tag) {
          case 5:
            ee = u.stateNode, Me = !1;
            break e;
          case 3:
            ee = u.stateNode.containerInfo, Me = !0;
            break e;
          case 4:
            ee = u.stateNode.containerInfo, Me = !0;
            break e;
        }
        u = u.return;
      }
      if (ee === null) throw Error(S(160));
      dc(i, o, l), ee = null, Me = !1;
      var a = l.alternate;
      a !== null && (a.return = null), l.return = null;
    } catch (s) {
      Q(l, t, s);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) pc(t, e), t = t.sibling;
}
function pc(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (Re(t, e), Ae(e), r & 4) {
        try {
          $n(3, e, e.return), wl(3, e);
        } catch (k) {
          Q(e, e.return, k);
        }
        try {
          $n(5, e, e.return);
        } catch (k) {
          Q(e, e.return, k);
        }
      }
      break;
    case 1:
      Re(t, e), Ae(e), r & 512 && n !== null && Zt(n, n.return);
      break;
    case 5:
      if (Re(t, e), Ae(e), r & 512 && n !== null && Zt(n, n.return), e.flags & 32) {
        var l = e.stateNode;
        try {
          Un(l, "");
        } catch (k) {
          Q(e, e.return, k);
        }
      }
      if (r & 4 && (l = e.stateNode, l != null)) {
        var i = e.memoizedProps, o = n !== null ? n.memoizedProps : i, u = e.type, a = e.updateQueue;
        if (e.updateQueue = null, a !== null) try {
          u === "input" && i.type === "radio" && i.name != null && Ia(l, i), yi(u, o);
          var s = yi(u, i);
          for (o = 0; o < a.length; o += 2) {
            var c = a[o], m = a[o + 1];
            c === "style" ? Ua(l, m) : c === "dangerouslySetInnerHTML" ? Oa(l, m) : c === "children" ? Un(l, m) : ao(l, c, m, s);
          }
          switch (u) {
            case "input":
              di(l, i);
              break;
            case "textarea":
              $a(l, i);
              break;
            case "select":
              var d = l._wrapperState.wasMultiple;
              l._wrapperState.wasMultiple = !!i.multiple;
              var y = i.value;
              y != null ? qt(l, !!i.multiple, y, !1) : d !== !!i.multiple && (i.defaultValue != null ? qt(
                l,
                !!i.multiple,
                i.defaultValue,
                !0
              ) : qt(l, !!i.multiple, i.multiple ? [] : "", !1));
          }
          l[Xn] = i;
        } catch (k) {
          Q(e, e.return, k);
        }
      }
      break;
    case 6:
      if (Re(t, e), Ae(e), r & 4) {
        if (e.stateNode === null) throw Error(S(162));
        l = e.stateNode, i = e.memoizedProps;
        try {
          l.nodeValue = i;
        } catch (k) {
          Q(e, e.return, k);
        }
      }
      break;
    case 3:
      if (Re(t, e), Ae(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        Hn(t.containerInfo);
      } catch (k) {
        Q(e, e.return, k);
      }
      break;
    case 4:
      Re(t, e), Ae(e);
      break;
    case 13:
      Re(t, e), Ae(e), l = e.child, l.flags & 8192 && (i = l.memoizedState !== null, l.stateNode.isHidden = i, !i || l.alternate !== null && l.alternate.memoizedState !== null || (Vo = G())), r & 4 && Ju(e);
      break;
    case 22:
      if (c = n !== null && n.memoizedState !== null, e.mode & 1 ? (oe = (s = oe) || c, Re(t, e), oe = s) : Re(t, e), Ae(e), r & 8192) {
        if (s = e.memoizedState !== null, (e.stateNode.isHidden = s) && !c && e.mode & 1) for (E = e, c = e.child; c !== null; ) {
          for (m = E = c; E !== null; ) {
            switch (d = E, y = d.child, d.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                $n(4, d, d.return);
                break;
              case 1:
                Zt(d, d.return);
                var v = d.stateNode;
                if (typeof v.componentWillUnmount == "function") {
                  r = d, n = d.return;
                  try {
                    t = r, v.props = t.memoizedProps, v.state = t.memoizedState, v.componentWillUnmount();
                  } catch (k) {
                    Q(r, n, k);
                  }
                }
                break;
              case 5:
                Zt(d, d.return);
                break;
              case 22:
                if (d.memoizedState !== null) {
                  bu(m);
                  continue;
                }
            }
            y !== null ? (y.return = d, E = y) : bu(m);
          }
          c = c.sibling;
        }
        e: for (c = null, m = e; ; ) {
          if (m.tag === 5) {
            if (c === null) {
              c = m;
              try {
                l = m.stateNode, s ? (i = l.style, typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none") : (u = m.stateNode, a = m.memoizedProps.style, o = a != null && a.hasOwnProperty("display") ? a.display : null, u.style.display = Aa("display", o));
              } catch (k) {
                Q(e, e.return, k);
              }
            }
          } else if (m.tag === 6) {
            if (c === null) try {
              m.stateNode.nodeValue = s ? "" : m.memoizedProps;
            } catch (k) {
              Q(e, e.return, k);
            }
          } else if ((m.tag !== 22 && m.tag !== 23 || m.memoizedState === null || m === e) && m.child !== null) {
            m.child.return = m, m = m.child;
            continue;
          }
          if (m === e) break e;
          for (; m.sibling === null; ) {
            if (m.return === null || m.return === e) break e;
            c === m && (c = null), m = m.return;
          }
          c === m && (c = null), m.sibling.return = m.return, m = m.sibling;
        }
      }
      break;
    case 19:
      Re(t, e), Ae(e), r & 4 && Ju(e);
      break;
    case 21:
      break;
    default:
      Re(
        t,
        e
      ), Ae(e);
  }
}
function Ae(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (fc(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(S(160));
      }
      switch (r.tag) {
        case 5:
          var l = r.stateNode;
          r.flags & 32 && (Un(l, ""), r.flags &= -33);
          var i = Zu(e);
          Gi(e, i, l);
          break;
        case 3:
        case 4:
          var o = r.stateNode.containerInfo, u = Zu(e);
          Ki(e, u, o);
          break;
        default:
          throw Error(S(161));
      }
    } catch (a) {
      Q(e, e.return, a);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function Zd(e, t, n) {
  E = e, mc(e);
}
function mc(e, t, n) {
  for (var r = (e.mode & 1) !== 0; E !== null; ) {
    var l = E, i = l.child;
    if (l.tag === 22 && r) {
      var o = l.memoizedState !== null || _r;
      if (!o) {
        var u = l.alternate, a = u !== null && u.memoizedState !== null || oe;
        u = _r;
        var s = oe;
        if (_r = o, (oe = a) && !s) for (E = l; E !== null; ) o = E, a = o.child, o.tag === 22 && o.memoizedState !== null ? ea(l) : a !== null ? (a.return = o, E = a) : ea(l);
        for (; i !== null; ) E = i, mc(i), i = i.sibling;
        E = l, _r = u, oe = s;
      }
      qu(e);
    } else l.subtreeFlags & 8772 && i !== null ? (i.return = l, E = i) : qu(e);
  }
}
function qu(e) {
  for (; E !== null; ) {
    var t = E;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            oe || wl(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !oe) if (n === null) r.componentDidMount();
            else {
              var l = t.elementType === t.type ? n.memoizedProps : De(t.type, n.memoizedProps);
              r.componentDidUpdate(l, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var i = t.updateQueue;
            i !== null && $u(t, i, r);
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
              $u(t, o, n);
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
                  var m = c.dehydrated;
                  m !== null && Hn(m);
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
            throw Error(S(163));
        }
        oe || t.flags & 512 && Qi(t);
      } catch (d) {
        Q(t, t.return, d);
      }
    }
    if (t === e) {
      E = null;
      break;
    }
    if (n = t.sibling, n !== null) {
      n.return = t.return, E = n;
      break;
    }
    E = t.return;
  }
}
function bu(e) {
  for (; E !== null; ) {
    var t = E;
    if (t === e) {
      E = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      n.return = t.return, E = n;
      break;
    }
    E = t.return;
  }
}
function ea(e) {
  for (; E !== null; ) {
    var t = E;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            wl(4, t);
          } catch (a) {
            Q(t, n, a);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var l = t.return;
            try {
              r.componentDidMount();
            } catch (a) {
              Q(t, l, a);
            }
          }
          var i = t.return;
          try {
            Qi(t);
          } catch (a) {
            Q(t, i, a);
          }
          break;
        case 5:
          var o = t.return;
          try {
            Qi(t);
          } catch (a) {
            Q(t, o, a);
          }
      }
    } catch (a) {
      Q(t, t.return, a);
    }
    if (t === e) {
      E = null;
      break;
    }
    var u = t.sibling;
    if (u !== null) {
      u.return = t.return, E = u;
      break;
    }
    E = t.return;
  }
}
var Jd = Math.ceil, ol = et.ReactCurrentDispatcher, Uo = et.ReactCurrentOwner, Te = et.ReactCurrentBatchConfig, M = 0, b = null, Y = null, te = 0, Se = 0, Jt = St(0), Z = 0, tr = null, It = 0, Sl = 0, Bo = 0, Fn = null, me = null, Vo = 0, fn = 1 / 0, Qe = null, ul = !1, Yi = null, mt = null, Er = !1, at = null, al = 0, On = 0, Xi = null, Or = -1, Ar = 0;
function ce() {
  return M & 6 ? G() : Or !== -1 ? Or : Or = G();
}
function ht(e) {
  return e.mode & 1 ? M & 2 && te !== 0 ? te & -te : Md.transition !== null ? (Ar === 0 && (Ar = qa()), Ar) : (e = $, e !== 0 || (e = window.event, e = e === void 0 ? 16 : is(e.type)), e) : 1;
}
function Fe(e, t, n, r) {
  if (50 < On) throw On = 0, Xi = null, Error(S(185));
  rr(e, n, r), (!(M & 2) || e !== b) && (e === b && (!(M & 2) && (Sl |= n), Z === 4 && ot(e, te)), ge(e, r), n === 1 && M === 0 && !(t.mode & 1) && (fn = G() + 500, vl && kt()));
}
function ge(e, t) {
  var n = e.callbackNode;
  Mf(e, t);
  var r = Qr(e, e === b ? te : 0);
  if (r === 0) n !== null && su(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && su(n), t === 1) e.tag === 0 ? Dd(ta.bind(null, e)) : Es(ta.bind(null, e)), Td(function() {
      !(M & 6) && kt();
    }), n = null;
    else {
      switch (ba(r)) {
        case 1:
          n = mo;
          break;
        case 4:
          n = Za;
          break;
        case 16:
          n = Hr;
          break;
        case 536870912:
          n = Ja;
          break;
        default:
          n = Hr;
      }
      n = xc(n, hc.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function hc(e, t) {
  if (Or = -1, Ar = 0, M & 6) throw Error(S(327));
  var n = e.callbackNode;
  if (rn() && e.callbackNode !== n) return null;
  var r = Qr(e, e === b ? te : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = sl(e, r);
  else {
    t = r;
    var l = M;
    M |= 2;
    var i = yc();
    (b !== e || te !== t) && (Qe = null, fn = G() + 500, jt(e, t));
    do
      try {
        ep();
        break;
      } catch (u) {
        vc(e, u);
      }
    while (!0);
    zo(), ol.current = i, M = l, Y !== null ? t = 0 : (b = null, te = 0, t = Z);
  }
  if (t !== 0) {
    if (t === 2 && (l = xi(e), l !== 0 && (r = l, t = Zi(e, l))), t === 1) throw n = tr, jt(e, 0), ot(e, r), ge(e, G()), n;
    if (t === 6) ot(e, r);
    else {
      if (l = e.current.alternate, !(r & 30) && !qd(l) && (t = sl(e, r), t === 2 && (i = xi(e), i !== 0 && (r = i, t = Zi(e, i))), t === 1)) throw n = tr, jt(e, 0), ot(e, r), ge(e, G()), n;
      switch (e.finishedWork = l, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(S(345));
        case 2:
          Pt(e, me, Qe);
          break;
        case 3:
          if (ot(e, r), (r & 130023424) === r && (t = Vo + 500 - G(), 10 < t)) {
            if (Qr(e, 0) !== 0) break;
            if (l = e.suspendedLanes, (l & r) !== r) {
              ce(), e.pingedLanes |= e.suspendedLanes & l;
              break;
            }
            e.timeoutHandle = ji(Pt.bind(null, e, me, Qe), t);
            break;
          }
          Pt(e, me, Qe);
          break;
        case 4:
          if (ot(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, l = -1; 0 < r; ) {
            var o = 31 - $e(r);
            i = 1 << o, o = t[o], o > l && (l = o), r &= ~i;
          }
          if (r = l, r = G() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * Jd(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = ji(Pt.bind(null, e, me, Qe), r);
            break;
          }
          Pt(e, me, Qe);
          break;
        case 5:
          Pt(e, me, Qe);
          break;
        default:
          throw Error(S(329));
      }
    }
  }
  return ge(e, G()), e.callbackNode === n ? hc.bind(null, e) : null;
}
function Zi(e, t) {
  var n = Fn;
  return e.current.memoizedState.isDehydrated && (jt(e, t).flags |= 256), e = sl(e, t), e !== 2 && (t = me, me = n, t !== null && Ji(t)), e;
}
function Ji(e) {
  me === null ? me = e : me.push.apply(me, e);
}
function qd(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
        var l = n[r], i = l.getSnapshot;
        l = l.value;
        try {
          if (!Oe(i(), l)) return !1;
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
function ot(e, t) {
  for (t &= ~Bo, t &= ~Sl, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - $e(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function ta(e) {
  if (M & 6) throw Error(S(327));
  rn();
  var t = Qr(e, 0);
  if (!(t & 1)) return ge(e, G()), null;
  var n = sl(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = xi(e);
    r !== 0 && (t = r, n = Zi(e, r));
  }
  if (n === 1) throw n = tr, jt(e, 0), ot(e, t), ge(e, G()), n;
  if (n === 6) throw Error(S(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, Pt(e, me, Qe), ge(e, G()), null;
}
function Wo(e, t) {
  var n = M;
  M |= 1;
  try {
    return e(t);
  } finally {
    M = n, M === 0 && (fn = G() + 500, vl && kt());
  }
}
function $t(e) {
  at !== null && at.tag === 0 && !(M & 6) && rn();
  var t = M;
  M |= 1;
  var n = Te.transition, r = $;
  try {
    if (Te.transition = null, $ = 1, e) return e();
  } finally {
    $ = r, Te.transition = n, M = t, !(M & 6) && kt();
  }
}
function Ho() {
  Se = Jt.current, U(Jt);
}
function jt(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, Nd(n)), Y !== null) for (n = Y.return; n !== null; ) {
    var r = n;
    switch (Eo(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && Zr();
        break;
      case 3:
        sn(), U(ve), U(ue), Do();
        break;
      case 5:
        Ro(r);
        break;
      case 4:
        sn();
        break;
      case 13:
        U(V);
        break;
      case 19:
        U(V);
        break;
      case 10:
        No(r.type._context);
        break;
      case 22:
      case 23:
        Ho();
    }
    n = n.return;
  }
  if (b = e, Y = e = vt(e.current, null), te = Se = t, Z = 0, tr = null, Bo = Sl = It = 0, me = Fn = null, Nt !== null) {
    for (t = 0; t < Nt.length; t++) if (n = Nt[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var l = r.next, i = n.pending;
      if (i !== null) {
        var o = i.next;
        i.next = l, r.next = o;
      }
      n.pending = r;
    }
    Nt = null;
  }
  return e;
}
function vc(e, t) {
  do {
    var n = Y;
    try {
      if (zo(), Ir.current = il, ll) {
        for (var r = W.memoizedState; r !== null; ) {
          var l = r.queue;
          l !== null && (l.pending = null), r = r.next;
        }
        ll = !1;
      }
      if (Mt = 0, q = X = W = null, In = !1, qn = 0, Uo.current = null, n === null || n.return === null) {
        Z = 1, tr = t, Y = null;
        break;
      }
      e: {
        var i = e, o = n.return, u = n, a = t;
        if (t = te, u.flags |= 32768, a !== null && typeof a == "object" && typeof a.then == "function") {
          var s = a, c = u, m = c.tag;
          if (!(c.mode & 1) && (m === 0 || m === 11 || m === 15)) {
            var d = c.alternate;
            d ? (c.updateQueue = d.updateQueue, c.memoizedState = d.memoizedState, c.lanes = d.lanes) : (c.updateQueue = null, c.memoizedState = null);
          }
          var y = Vu(o);
          if (y !== null) {
            y.flags &= -257, Wu(y, o, u, i, t), y.mode & 1 && Bu(i, s, t), t = y, a = s;
            var v = t.updateQueue;
            if (v === null) {
              var k = /* @__PURE__ */ new Set();
              k.add(a), t.updateQueue = k;
            } else v.add(a);
            break e;
          } else {
            if (!(t & 1)) {
              Bu(i, s, t), Qo();
              break e;
            }
            a = Error(S(426));
          }
        } else if (B && u.mode & 1) {
          var D = Vu(o);
          if (D !== null) {
            !(D.flags & 65536) && (D.flags |= 256), Wu(D, o, u, i, t), Co(cn(a, u));
            break e;
          }
        }
        i = a = cn(a, u), Z !== 4 && (Z = 2), Fn === null ? Fn = [i] : Fn.push(i), i = o;
        do {
          switch (i.tag) {
            case 3:
              i.flags |= 65536, t &= -t, i.lanes |= t;
              var p = bs(i, a, t);
              Iu(i, p);
              break e;
            case 1:
              u = a;
              var f = i.type, h = i.stateNode;
              if (!(i.flags & 128) && (typeof f.getDerivedStateFromError == "function" || h !== null && typeof h.componentDidCatch == "function" && (mt === null || !mt.has(h)))) {
                i.flags |= 65536, t &= -t, i.lanes |= t;
                var w = ec(i, u, t);
                Iu(i, w);
                break e;
              }
          }
          i = i.return;
        } while (i !== null);
      }
      wc(n);
    } catch (_) {
      t = _, Y === n && n !== null && (Y = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function yc() {
  var e = ol.current;
  return ol.current = il, e === null ? il : e;
}
function Qo() {
  (Z === 0 || Z === 3 || Z === 2) && (Z = 4), b === null || !(It & 268435455) && !(Sl & 268435455) || ot(b, te);
}
function sl(e, t) {
  var n = M;
  M |= 2;
  var r = yc();
  (b !== e || te !== t) && (Qe = null, jt(e, t));
  do
    try {
      bd();
      break;
    } catch (l) {
      vc(e, l);
    }
  while (!0);
  if (zo(), M = n, ol.current = r, Y !== null) throw Error(S(261));
  return b = null, te = 0, Z;
}
function bd() {
  for (; Y !== null; ) gc(Y);
}
function ep() {
  for (; Y !== null && !Cf(); ) gc(Y);
}
function gc(e) {
  var t = kc(e.alternate, e, Se);
  e.memoizedProps = e.pendingProps, t === null ? wc(e) : Y = t, Uo.current = null;
}
function wc(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = Gd(n, t), n !== null) {
        n.flags &= 32767, Y = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        Z = 6, Y = null;
        return;
      }
    } else if (n = Kd(n, t, Se), n !== null) {
      Y = n;
      return;
    }
    if (t = t.sibling, t !== null) {
      Y = t;
      return;
    }
    Y = t = e;
  } while (t !== null);
  Z === 0 && (Z = 5);
}
function Pt(e, t, n) {
  var r = $, l = Te.transition;
  try {
    Te.transition = null, $ = 1, tp(e, t, n, r);
  } finally {
    Te.transition = l, $ = r;
  }
  return null;
}
function tp(e, t, n, r) {
  do
    rn();
  while (at !== null);
  if (M & 6) throw Error(S(327));
  n = e.finishedWork;
  var l = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(S(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var i = n.lanes | n.childLanes;
  if (If(e, i), e === b && (Y = b = null, te = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || Er || (Er = !0, xc(Hr, function() {
    return rn(), null;
  })), i = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || i) {
    i = Te.transition, Te.transition = null;
    var o = $;
    $ = 1;
    var u = M;
    M |= 4, Uo.current = null, Xd(e, n), pc(n, e), kd(Ni), Kr = !!zi, Ni = zi = null, e.current = n, Zd(n), Pf(), M = u, $ = o, Te.transition = i;
  } else e.current = n;
  if (Er && (Er = !1, at = e, al = l), i = e.pendingLanes, i === 0 && (mt = null), Tf(n.stateNode), ge(e, G()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) l = t[n], r(l.value, { componentStack: l.stack, digest: l.digest });
  if (ul) throw ul = !1, e = Yi, Yi = null, e;
  return al & 1 && e.tag !== 0 && rn(), i = e.pendingLanes, i & 1 ? e === Xi ? On++ : (On = 0, Xi = e) : On = 0, kt(), null;
}
function rn() {
  if (at !== null) {
    var e = ba(al), t = Te.transition, n = $;
    try {
      if (Te.transition = null, $ = 16 > e ? 16 : e, at === null) var r = !1;
      else {
        if (e = at, at = null, al = 0, M & 6) throw Error(S(331));
        var l = M;
        for (M |= 4, E = e.current; E !== null; ) {
          var i = E, o = i.child;
          if (E.flags & 16) {
            var u = i.deletions;
            if (u !== null) {
              for (var a = 0; a < u.length; a++) {
                var s = u[a];
                for (E = s; E !== null; ) {
                  var c = E;
                  switch (c.tag) {
                    case 0:
                    case 11:
                    case 15:
                      $n(8, c, i);
                  }
                  var m = c.child;
                  if (m !== null) m.return = c, E = m;
                  else for (; E !== null; ) {
                    c = E;
                    var d = c.sibling, y = c.return;
                    if (cc(c), c === s) {
                      E = null;
                      break;
                    }
                    if (d !== null) {
                      d.return = y, E = d;
                      break;
                    }
                    E = y;
                  }
                }
              }
              var v = i.alternate;
              if (v !== null) {
                var k = v.child;
                if (k !== null) {
                  v.child = null;
                  do {
                    var D = k.sibling;
                    k.sibling = null, k = D;
                  } while (k !== null);
                }
              }
              E = i;
            }
          }
          if (i.subtreeFlags & 2064 && o !== null) o.return = i, E = o;
          else e: for (; E !== null; ) {
            if (i = E, i.flags & 2048) switch (i.tag) {
              case 0:
              case 11:
              case 15:
                $n(9, i, i.return);
            }
            var p = i.sibling;
            if (p !== null) {
              p.return = i.return, E = p;
              break e;
            }
            E = i.return;
          }
        }
        var f = e.current;
        for (E = f; E !== null; ) {
          o = E;
          var h = o.child;
          if (o.subtreeFlags & 2064 && h !== null) h.return = o, E = h;
          else e: for (o = f; E !== null; ) {
            if (u = E, u.flags & 2048) try {
              switch (u.tag) {
                case 0:
                case 11:
                case 15:
                  wl(9, u);
              }
            } catch (_) {
              Q(u, u.return, _);
            }
            if (u === o) {
              E = null;
              break e;
            }
            var w = u.sibling;
            if (w !== null) {
              w.return = u.return, E = w;
              break e;
            }
            E = u.return;
          }
        }
        if (M = l, kt(), Ve && typeof Ve.onPostCommitFiberRoot == "function") try {
          Ve.onPostCommitFiberRoot(fl, e);
        } catch {
        }
        r = !0;
      }
      return r;
    } finally {
      $ = n, Te.transition = t;
    }
  }
  return !1;
}
function na(e, t, n) {
  t = cn(n, t), t = bs(e, t, 1), e = pt(e, t, 1), t = ce(), e !== null && (rr(e, 1, t), ge(e, t));
}
function Q(e, t, n) {
  if (e.tag === 3) na(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      na(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (mt === null || !mt.has(r))) {
        e = cn(n, e), e = ec(t, e, 1), t = pt(t, e, 1), e = ce(), t !== null && (rr(t, 1, e), ge(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function np(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = ce(), e.pingedLanes |= e.suspendedLanes & n, b === e && (te & n) === n && (Z === 4 || Z === 3 && (te & 130023424) === te && 500 > G() - Vo ? jt(e, 0) : Bo |= n), ge(e, t);
}
function Sc(e, t) {
  t === 0 && (e.mode & 1 ? (t = mr, mr <<= 1, !(mr & 130023424) && (mr = 4194304)) : t = 1);
  var n = ce();
  e = qe(e, t), e !== null && (rr(e, t, n), ge(e, n));
}
function rp(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), Sc(e, n);
}
function lp(e, t) {
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
      throw Error(S(314));
  }
  r !== null && r.delete(t), Sc(e, n);
}
var kc;
kc = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || ve.current) he = !0;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return he = !1, Qd(e, t, n);
    he = !!(e.flags & 131072);
  }
  else he = !1, B && t.flags & 1048576 && Cs(t, br, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      Fr(e, t), e = t.pendingProps;
      var l = on(t, ue.current);
      nn(t, n), l = Io(null, t, r, e, l, n);
      var i = $o();
      return t.flags |= 1, typeof l == "object" && l !== null && typeof l.render == "function" && l.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, ye(r) ? (i = !0, Jr(t)) : i = !1, t.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null, jo(t), l.updater = gl, t.stateNode = l, l._reactInternals = t, Fi(t, r, e, n), t = Ui(null, t, r, !0, i, n)) : (t.tag = 0, B && i && _o(t), se(null, t, l, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (Fr(e, t), e = t.pendingProps, l = r._init, r = l(r._payload), t.type = r, l = t.tag = op(r), e = De(r, e), l) {
          case 0:
            t = Ai(null, t, r, e, n);
            break e;
          case 1:
            t = Ku(null, t, r, e, n);
            break e;
          case 11:
            t = Hu(null, t, r, e, n);
            break e;
          case 14:
            t = Qu(null, t, r, De(r.type, e), n);
            break e;
        }
        throw Error(S(
          306,
          r,
          ""
        ));
      }
      return t;
    case 0:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : De(r, l), Ai(e, t, r, l, n);
    case 1:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : De(r, l), Ku(e, t, r, l, n);
    case 3:
      e: {
        if (lc(t), e === null) throw Error(S(387));
        r = t.pendingProps, i = t.memoizedState, l = i.element, Ls(e, t), nl(t, r, null, n);
        var o = t.memoizedState;
        if (r = o.element, i.isDehydrated) if (i = { element: r, isDehydrated: !1, cache: o.cache, pendingSuspenseBoundaries: o.pendingSuspenseBoundaries, transitions: o.transitions }, t.updateQueue.baseState = i, t.memoizedState = i, t.flags & 256) {
          l = cn(Error(S(423)), t), t = Gu(e, t, r, n, l);
          break e;
        } else if (r !== l) {
          l = cn(Error(S(424)), t), t = Gu(e, t, r, n, l);
          break e;
        } else for (ke = dt(t.stateNode.containerInfo.firstChild), xe = t, B = !0, Ie = null, n = Ts(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (un(), r === l) {
            t = be(e, t, n);
            break e;
          }
          se(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return Rs(t), e === null && Mi(t), r = t.type, l = t.pendingProps, i = e !== null ? e.memoizedProps : null, o = l.children, Ti(r, l) ? o = null : i !== null && Ti(r, i) && (t.flags |= 32), rc(e, t), se(e, t, o, n), t.child;
    case 6:
      return e === null && Mi(t), null;
    case 13:
      return ic(e, t, n);
    case 4:
      return Lo(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = an(t, null, r, n) : se(e, t, r, n), t.child;
    case 11:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : De(r, l), Hu(e, t, r, l, n);
    case 7:
      return se(e, t, t.pendingProps, n), t.child;
    case 8:
      return se(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return se(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, l = t.pendingProps, i = t.memoizedProps, o = l.value, O(el, r._currentValue), r._currentValue = o, i !== null) if (Oe(i.value, o)) {
          if (i.children === l.children && !ve.current) {
            t = be(e, t, n);
            break e;
          }
        } else for (i = t.child, i !== null && (i.return = t); i !== null; ) {
          var u = i.dependencies;
          if (u !== null) {
            o = i.child;
            for (var a = u.firstContext; a !== null; ) {
              if (a.context === r) {
                if (i.tag === 1) {
                  a = Xe(-1, n & -n), a.tag = 2;
                  var s = i.updateQueue;
                  if (s !== null) {
                    s = s.shared;
                    var c = s.pending;
                    c === null ? a.next = a : (a.next = c.next, c.next = a), s.pending = a;
                  }
                }
                i.lanes |= n, a = i.alternate, a !== null && (a.lanes |= n), Ii(
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
            if (o = i.return, o === null) throw Error(S(341));
            o.lanes |= n, u = o.alternate, u !== null && (u.lanes |= n), Ii(o, n, t), o = i.sibling;
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
        se(e, t, l.children, n), t = t.child;
      }
      return t;
    case 9:
      return l = t.type, r = t.pendingProps.children, nn(t, n), l = je(l), r = r(l), t.flags |= 1, se(e, t, r, n), t.child;
    case 14:
      return r = t.type, l = De(r, t.pendingProps), l = De(r.type, l), Qu(e, t, r, l, n);
    case 15:
      return tc(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : De(r, l), Fr(e, t), t.tag = 1, ye(r) ? (e = !0, Jr(t)) : e = !1, nn(t, n), qs(t, r, l), Fi(t, r, l, n), Ui(null, t, r, !0, e, n);
    case 19:
      return oc(e, t, n);
    case 22:
      return nc(e, t, n);
  }
  throw Error(S(156, t.tag));
};
function xc(e, t) {
  return Xa(e, t);
}
function ip(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function Ne(e, t, n, r) {
  return new ip(e, t, n, r);
}
function Ko(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function op(e) {
  if (typeof e == "function") return Ko(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === co) return 11;
    if (e === fo) return 14;
  }
  return 2;
}
function vt(e, t) {
  var n = e.alternate;
  return n === null ? (n = Ne(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function Ur(e, t, n, r, l, i) {
  var o = 2;
  if (r = e, typeof e == "function") Ko(e) && (o = 1);
  else if (typeof e == "string") o = 5;
  else e: switch (e) {
    case Bt:
      return Lt(n.children, l, i, t);
    case so:
      o = 8, l |= 8;
      break;
    case ui:
      return e = Ne(12, n, t, l | 2), e.elementType = ui, e.lanes = i, e;
    case ai:
      return e = Ne(13, n, t, l), e.elementType = ai, e.lanes = i, e;
    case si:
      return e = Ne(19, n, t, l), e.elementType = si, e.lanes = i, e;
    case Ra:
      return kl(n, l, i, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case ja:
          o = 10;
          break e;
        case La:
          o = 9;
          break e;
        case co:
          o = 11;
          break e;
        case fo:
          o = 14;
          break e;
        case rt:
          o = 16, r = null;
          break e;
      }
      throw Error(S(130, e == null ? e : typeof e, ""));
  }
  return t = Ne(o, n, t, l), t.elementType = e, t.type = r, t.lanes = i, t;
}
function Lt(e, t, n, r) {
  return e = Ne(7, e, r, t), e.lanes = n, e;
}
function kl(e, t, n, r) {
  return e = Ne(22, e, r, t), e.elementType = Ra, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
}
function bl(e, t, n) {
  return e = Ne(6, e, null, t), e.lanes = n, e;
}
function ei(e, t, n) {
  return t = Ne(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function up(e, t, n, r, l) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Ml(0), this.expirationTimes = Ml(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ml(0), this.identifierPrefix = r, this.onRecoverableError = l, this.mutableSourceEagerHydrationData = null;
}
function Go(e, t, n, r, l, i, o, u, a) {
  return e = new up(e, t, n, u, a), t === 1 ? (t = 1, i === !0 && (t |= 8)) : t = 0, i = Ne(3, null, null, t), e.current = i, i.stateNode = e, i.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, jo(i), e;
}
function ap(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: Ut, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function _c(e) {
  if (!e) return gt;
  e = e._reactInternals;
  e: {
    if (Ot(e) !== e || e.tag !== 1) throw Error(S(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (ye(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(S(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (ye(n)) return _s(e, n, t);
  }
  return t;
}
function Ec(e, t, n, r, l, i, o, u, a) {
  return e = Go(n, r, !0, e, l, i, o, u, a), e.context = _c(null), n = e.current, r = ce(), l = ht(n), i = Xe(r, l), i.callback = t ?? null, pt(n, i, l), e.current.lanes = l, rr(e, l, r), ge(e, r), e;
}
function xl(e, t, n, r) {
  var l = t.current, i = ce(), o = ht(l);
  return n = _c(n), t.context === null ? t.context = n : t.pendingContext = n, t = Xe(i, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = pt(l, t, o), e !== null && (Fe(e, l, o, i), Mr(e, l, o)), o;
}
function cl(e) {
  if (e = e.current, !e.child) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function ra(e, t) {
  if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function Yo(e, t) {
  ra(e, t), (e = e.alternate) && ra(e, t);
}
function sp() {
  return null;
}
var Cc = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function Xo(e) {
  this._internalRoot = e;
}
_l.prototype.render = Xo.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(S(409));
  xl(e, t, null, null);
};
_l.prototype.unmount = Xo.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    $t(function() {
      xl(null, e, null, null);
    }), t[Je] = null;
  }
};
function _l(e) {
  this._internalRoot = e;
}
_l.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = ns();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < it.length && t !== 0 && t < it[n].priority; n++) ;
    it.splice(n, 0, e), n === 0 && ls(e);
  }
};
function Zo(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function El(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function la() {
}
function cp(e, t, n, r, l) {
  if (l) {
    if (typeof r == "function") {
      var i = r;
      r = function() {
        var s = cl(o);
        i.call(s);
      };
    }
    var o = Ec(t, r, e, 0, null, !1, !1, "", la);
    return e._reactRootContainer = o, e[Je] = o.current, Gn(e.nodeType === 8 ? e.parentNode : e), $t(), o;
  }
  for (; l = e.lastChild; ) e.removeChild(l);
  if (typeof r == "function") {
    var u = r;
    r = function() {
      var s = cl(a);
      u.call(s);
    };
  }
  var a = Go(e, 0, !1, null, null, !1, !1, "", la);
  return e._reactRootContainer = a, e[Je] = a.current, Gn(e.nodeType === 8 ? e.parentNode : e), $t(function() {
    xl(t, a, n, r);
  }), a;
}
function Cl(e, t, n, r, l) {
  var i = n._reactRootContainer;
  if (i) {
    var o = i;
    if (typeof l == "function") {
      var u = l;
      l = function() {
        var a = cl(o);
        u.call(a);
      };
    }
    xl(t, o, e, l);
  } else o = cp(n, t, e, l, r);
  return cl(o);
}
es = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Nn(t.pendingLanes);
        n !== 0 && (ho(t, n | 1), ge(t, G()), !(M & 6) && (fn = G() + 500, kt()));
      }
      break;
    case 13:
      $t(function() {
        var r = qe(e, 1);
        if (r !== null) {
          var l = ce();
          Fe(r, e, 1, l);
        }
      }), Yo(e, 1);
  }
};
vo = function(e) {
  if (e.tag === 13) {
    var t = qe(e, 134217728);
    if (t !== null) {
      var n = ce();
      Fe(t, e, 134217728, n);
    }
    Yo(e, 134217728);
  }
};
ts = function(e) {
  if (e.tag === 13) {
    var t = ht(e), n = qe(e, t);
    if (n !== null) {
      var r = ce();
      Fe(n, e, t, r);
    }
    Yo(e, t);
  }
};
ns = function() {
  return $;
};
rs = function(e, t) {
  var n = $;
  try {
    return $ = e, t();
  } finally {
    $ = n;
  }
};
wi = function(e, t, n) {
  switch (t) {
    case "input":
      if (di(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var l = hl(r);
            if (!l) throw Error(S(90));
            Ma(r), di(r, l);
          }
        }
      }
      break;
    case "textarea":
      $a(e, n);
      break;
    case "select":
      t = n.value, t != null && qt(e, !!n.multiple, t, !1);
  }
};
Wa = Wo;
Ha = $t;
var fp = { usingClientEntryPoint: !1, Events: [ir, Qt, hl, Ba, Va, Wo] }, En = { findFiberByHostInstance: zt, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, dp = { bundleType: En.bundleType, version: En.version, rendererPackageName: En.rendererPackageName, rendererConfig: En.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: et.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = Ga(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: En.findFiberByHostInstance || sp, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Cr = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Cr.isDisabled && Cr.supportsFiber) try {
    fl = Cr.inject(dp), Ve = Cr;
  } catch {
  }
}
Ee.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = fp;
Ee.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!Zo(t)) throw Error(S(200));
  return ap(e, t, null, n);
};
Ee.createRoot = function(e, t) {
  if (!Zo(e)) throw Error(S(299));
  var n = !1, r = "", l = Cc;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (l = t.onRecoverableError)), t = Go(e, 1, !1, null, null, n, !1, r, l), e[Je] = t.current, Gn(e.nodeType === 8 ? e.parentNode : e), new Xo(t);
};
Ee.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function" ? Error(S(188)) : (e = Object.keys(e).join(","), Error(S(268, e)));
  return e = Ga(t), e = e === null ? null : e.stateNode, e;
};
Ee.flushSync = function(e) {
  return $t(e);
};
Ee.hydrate = function(e, t, n) {
  if (!El(t)) throw Error(S(200));
  return Cl(null, e, t, !0, n);
};
Ee.hydrateRoot = function(e, t, n) {
  if (!Zo(e)) throw Error(S(405));
  var r = n != null && n.hydratedSources || null, l = !1, i = "", o = Cc;
  if (n != null && (n.unstable_strictMode === !0 && (l = !0), n.identifierPrefix !== void 0 && (i = n.identifierPrefix), n.onRecoverableError !== void 0 && (o = n.onRecoverableError)), t = Ec(t, null, e, 1, n ?? null, l, !1, i, o), e[Je] = t.current, Gn(e), r) for (e = 0; e < r.length; e++) n = r[e], l = n._getVersion, l = l(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, l] : t.mutableSourceEagerHydrationData.push(
    n,
    l
  );
  return new _l(t);
};
Ee.render = function(e, t, n) {
  if (!El(t)) throw Error(S(200));
  return Cl(null, e, t, !1, n);
};
Ee.unmountComponentAtNode = function(e) {
  if (!El(e)) throw Error(S(40));
  return e._reactRootContainer ? ($t(function() {
    Cl(null, null, e, !1, function() {
      e._reactRootContainer = null, e[Je] = null;
    });
  }), !0) : !1;
};
Ee.unstable_batchedUpdates = Wo;
Ee.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!El(n)) throw Error(S(200));
  if (e == null || e._reactInternals === void 0) throw Error(S(38));
  return Cl(e, t, n, !1, r);
};
Ee.version = "18.3.1-next-f1338f8080-20240426";
function Pc() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Pc);
    } catch (e) {
      console.error(e);
    }
}
Pc(), ya.exports = Ee;
var pp = ya.exports, zc, ia = pp;
zc = ia.createRoot, ia.hydrateRoot;
function mp(e) {
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
function hp(e) {
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
const vp = {}, oa = (e) => {
  let t;
  const n = /* @__PURE__ */ new Set(), r = (c, m) => {
    const d = typeof c == "function" ? c(t) : c;
    if (!Object.is(d, t)) {
      const y = t;
      t = m ?? (typeof d != "object" || d === null) ? d : Object.assign({}, t, d), n.forEach((v) => v(t, y));
    }
  }, l = () => t, a = { setState: r, getState: l, getInitialState: () => s, subscribe: (c) => (n.add(c), () => n.delete(c)), destroy: () => {
    (vp ? "production" : void 0) !== "production" && console.warn(
      "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
    ), n.clear();
  } }, s = t = e(r, l, a);
  return a;
}, yp = (e) => e ? oa(e) : oa;
var Nc = { exports: {} }, Tc = {}, jc = { exports: {} }, Lc = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var dn = F;
function gp(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var wp = typeof Object.is == "function" ? Object.is : gp, Sp = dn.useState, kp = dn.useEffect, xp = dn.useLayoutEffect, _p = dn.useDebugValue;
function Ep(e, t) {
  var n = t(), r = Sp({ inst: { value: n, getSnapshot: t } }), l = r[0].inst, i = r[1];
  return xp(
    function() {
      l.value = n, l.getSnapshot = t, ti(l) && i({ inst: l });
    },
    [e, n, t]
  ), kp(
    function() {
      return ti(l) && i({ inst: l }), e(function() {
        ti(l) && i({ inst: l });
      });
    },
    [e]
  ), _p(n), n;
}
function ti(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !wp(e, n);
  } catch {
    return !0;
  }
}
function Cp(e, t) {
  return t();
}
var Pp = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? Cp : Ep;
Lc.useSyncExternalStore = dn.useSyncExternalStore !== void 0 ? dn.useSyncExternalStore : Pp;
jc.exports = Lc;
var zp = jc.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Pl = F, Np = zp;
function Tp(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var jp = typeof Object.is == "function" ? Object.is : Tp, Lp = Np.useSyncExternalStore, Rp = Pl.useRef, Dp = Pl.useEffect, Mp = Pl.useMemo, Ip = Pl.useDebugValue;
Tc.useSyncExternalStoreWithSelector = function(e, t, n, r, l) {
  var i = Rp(null);
  if (i.current === null) {
    var o = { hasValue: !1, value: null };
    i.current = o;
  } else o = i.current;
  i = Mp(
    function() {
      function a(y) {
        if (!s) {
          if (s = !0, c = y, y = r(y), l !== void 0 && o.hasValue) {
            var v = o.value;
            if (l(v, y))
              return m = v;
          }
          return m = y;
        }
        if (v = m, jp(c, y)) return v;
        var k = r(y);
        return l !== void 0 && l(v, k) ? (c = y, v) : (c = y, m = k);
      }
      var s = !1, c, m, d = n === void 0 ? null : n;
      return [
        function() {
          return a(t());
        },
        d === null ? void 0 : function() {
          return a(d());
        }
      ];
    },
    [t, n, r, l]
  );
  var u = Lp(e, i[0], i[1]);
  return Dp(
    function() {
      o.hasValue = !0, o.value = u;
    },
    [u]
  ), Ip(u), u;
};
Nc.exports = Tc;
var $p = Nc.exports;
const Fp = /* @__PURE__ */ va($p), Rc = {}, { useDebugValue: Op } = af, { useSyncExternalStoreWithSelector: Ap } = Fp;
let ua = !1;
const Up = (e) => e;
function Bp(e, t = Up, n) {
  (Rc ? "production" : void 0) !== "production" && n && !ua && (console.warn(
    "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
  ), ua = !0);
  const r = Ap(
    e.subscribe,
    e.getState,
    e.getServerState || e.getInitialState,
    t,
    n
  );
  return Op(r), r;
}
const aa = (e) => {
  (Rc ? "production" : void 0) !== "production" && typeof e != "function" && console.warn(
    "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
  );
  const t = typeof e == "function" ? yp(e) : e, n = (r, l) => Bp(t, r, l);
  return Object.assign(n, t), n;
}, Vp = (e) => e ? aa(e) : aa;
function Wp() {
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
function Hp() {
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
function Qp() {
  return typeof window < "u" && window.__TAURI_INTERNALS__ ? Hp() : Wp();
}
const sa = "text/x-vnd.veusz-widget-3", Kp = "text/x-vnd.veusz-data-1";
function qi(e, t) {
  const n = [];
  for (const r of e.settings) n.push(ca(t, r.name));
  for (const r of e.subgroups) n.push(...qi(r, ca(t, r.name)));
  return n;
}
function ca(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
const Gp = 33;
function Yp(e, t = Qp()) {
  let n = null, r = null;
  return Vp((l, i) => {
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
          const m = u[0], d = Dc(i().tree, m);
          if (!d) {
            l({ schema: null, values: {} });
            return;
          }
          const y = await o(() => e.doc.schema(d));
          if (!y) {
            l({ schema: null, values: {} });
            return;
          }
          const v = qi(y, m), k = await o(() => e.doc.get(v)) ?? {};
          l({ schema: y, values: k });
          return;
        }
        const a = await o(() => e.doc.commonSchema(u));
        if (!a) {
          l({ schema: null, values: {} });
          return;
        }
        const s = qi(a, u[0]), c = await o(() => e.doc.get(s)) ?? {};
        l({ schema: a, values: c });
      },
      setValue: async (u, a) => {
        const s = await o(() => e.doc.set([{ path: u, value: a }]));
        if (!s) return;
        const c = { ...i().values };
        for (const m of s.diffs) c[m.path] = m.new;
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
          c.includes(u) && await i().select(c.map((m) => m === u ? s.path : m));
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
        const s = [...u].sort((m, d) => d.length - m.length);
        for (const m of s)
          await o(() => e.doc.remove(m));
        const c = i().selected.filter((m) => !u.includes(m));
        c.length !== i().selected.length && await i().select(c), l({ cutPaths: u }), await i().refreshTree(), await i().refreshUndoState();
      },
      pasteWidgets: async (u) => {
        const a = await t.read([sa]);
        if (!a) return [];
        const s = await o(() => e.doc.pasteWidgetsMime(
          u,
          a.mime_type,
          a.payload_b64
        ));
        return s ? (l({ cutPaths: [] }), await i().refreshTree(), await i().refreshUndoState(), s.paths) : [];
      },
      canPasteWidgets: async (u) => {
        const a = await t.read([sa]);
        if (!a) return !1;
        const s = await o(() => e.doc.canPasteMime(
          u,
          a.mime_type,
          a.payload_b64
        ));
        return (s == null ? void 0 : s.ok) ?? !1;
      },
      copyWidgetAsImage: async (u, a, s, c = 96) => {
        const m = await o(() => e.render.copyImage(u, a, s, c, "png"));
        m && await t.write({
          mime_type: m.mime_type,
          payload_b64: m.payload_b64
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
        const u = await t.read([Kp]);
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
          const { webgpuAvailable: a } = await Promise.resolve().then(() => Fc);
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
        const m = i().backend;
        if (m === "vello-gpu" && i().gpuNativeAvailable === !0) {
          const v = await o(() => e.render.scene(u, a, s, c));
          if (v) {
            const { gpuRenderScene: k } = await import("./velloNative-Cn1MRGX6.js"), D = await o(() => k(v.scene_b64, v.width, v.height));
            D && l({ render: {
              png: D,
              width: v.width,
              height: v.height,
              bounds: v.bounds
            } });
          }
          return;
        }
        if (m === "vello-wasm" && i().webgpuAvailable === !0) {
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
        const d = m === "vello-wasm" || m === "vello-gpu" ? "vello" : m, y = await o(() => e.render.png(u, a, s, c, i().antialias, d));
        y && l({ render: y });
      },
      requestRender: (u, a, s, c = 96) => {
        r = { page: u, w: a, h: s, dpi: c }, n && clearTimeout(n), n = setTimeout(() => {
          n = null;
          const m = r;
          r = null, m && i().renderAt(m.page, m.w, m.h, m.dpi);
        }, Gp);
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
function Dc(e, t) {
  if (!e) return null;
  if (e.path === t) return e.type;
  for (const n of e.children) {
    const r = Dc(n, t);
    if (r) return r;
  }
  return null;
}
function Xp() {
  return (globalThis.__VEUSZ_WASM_BASE__ ?? "/wasm").replace(/\/+$/, "");
}
let Pr = null;
function Zp() {
  return Pr || (Pr = (async () => {
    const e = Xp(), t = await import(
      /* @vite-ignore */
      `${e}/veusz_paint_wasm.js`
    );
    return await t.default({ module_or_path: `${e}/veusz_paint_wasm_bg.wasm` }), t;
  })().catch((e) => {
    throw Pr = null, e;
  })), Pr;
}
async function Mc() {
  try {
    const e = navigator.gpu;
    return e ? await e.requestAdapter() != null : !1;
  } catch {
    return !1;
  }
}
function Ic(e) {
  const t = atob(e), n = new Uint8Array(t.length);
  for (let r = 0; r < t.length; r++) n[r] = t.charCodeAt(r);
  return n;
}
async function $c(e, t, n = [0, 0, 0, 0]) {
  await (await Zp()).render_scene_to_canvas(e, t, n[0], n[1], n[2], n[3]);
}
async function Jp(e, t, n = [0, 0, 0, 0]) {
  await $c(e, Ic(t), n);
}
const Fc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base64ToBytes: Ic,
  renderSceneBytesToCanvas: $c,
  renderSceneToCanvas: Jp,
  webgpuAvailable: Mc
}, Symbol.toStringTag, { value: "Module" })), qp = "0.26.4", bp = `https://cdn.jsdelivr.net/pyodide/v${qp}/full/`;
let Cn = null;
async function em(e) {
  if (Cn) return Cn;
  const t = e.pyodideIndexUrl ?? bp, n = e.onProgress ?? (() => {
  });
  return Cn = (async () => {
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
    throw Cn = null, r;
  }), Cn;
}
let tm = 0;
async function nm(e = {}) {
  const t = e.onProgress ?? (() => {
  });
  e.wasmBase && (globalThis.__VEUSZ_WASM_BASE__ = e.wasmBase);
  const n = await em(e);
  t("Starting renderer…");
  const l = n.pyimport("veusz.daemon.pyodide_bridge").Bridge(), i = mp(l), o = `/veusz/figure_${tm++}.vsz`, u = async (a) => {
    try {
      n.FS.writeFile(o, a);
    } catch {
      await n.runPythonAsync("import os; os.makedirs('/veusz', exist_ok=True)"), n.FS.writeFile(o, a);
    }
    return i.call("file.open", { path: o });
  };
  return t("Ready"), { transport: i, bridge: l, loadVsz: u, pyodide: n };
}
async function rm(e, t = {}) {
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
    const c = o(s.url), m = i.get(s.url), d = {};
    m.etag && (d["If-None-Match"] = m.etag), m.lastModified && (d["If-Modified-Since"] = m.lastModified), l({ url: s.url, phase: "fetching" });
    try {
      const y = await fetch(c, { headers: d, cache: "no-store" });
      if (y.status === 304) {
        await e.call(
          "data.url_refresh",
          { url: s.url, not_modified: !0 }
        ), l({ url: s.url, phase: "not_modified" });
        return;
      }
      if (!y.ok) throw new Error(`HTTP ${y.status}`);
      const v = new Uint8Array(await y.arrayBuffer()), k = Oc(v), D = y.headers.get("etag"), p = y.headers.get("last-modified"), f = y.headers.get("content-type");
      await e.call("data.url_refresh", {
        url: s.url,
        bytes_b64: k,
        etag: D,
        last_modified: p,
        content_type: f
      }), m.etag = D, m.lastModified = p, l({ url: s.url, phase: "ok" });
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
async function lm(e, t, n = {}) {
  const r = im(e), l = n.onError ?? ((i, o) => console.warn(`[veusz-figure] pre-fetch ${i}: ${o.message}`));
  return await Promise.allSettled(r.map(async (i) => {
    const o = n.urlMap && Object.prototype.hasOwnProperty.call(n.urlMap, i) ? n.urlMap[i] : n.urlBase ? new URL(i, n.urlBase).toString() : i;
    try {
      const u = await fetch(o, { cache: "no-store" });
      if (!u.ok) throw new Error(`HTTP ${u.status}`);
      const a = new Uint8Array(await u.arrayBuffer());
      await t.call("data.url_ingest", {
        url: i,
        // Python's cache key = original URL
        bytes_b64: Oc(a),
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
function im(e) {
  const t = [], n = /ImportFileURL\s*\(\s*(['"])([^'"\n]+)\1/g;
  let r;
  for (; (r = n.exec(e)) !== null; ) t.push(r[2]);
  return t;
}
function Oc(e) {
  let t = "";
  for (let r = 0; r < e.length; r += 32768)
    t += String.fromCharCode.apply(
      null,
      Array.from(e.subarray(r, r + 32768))
    );
  return btoa(t);
}
var Ac = { exports: {} }, zl = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var om = F, um = Symbol.for("react.element"), am = Symbol.for("react.fragment"), sm = Object.prototype.hasOwnProperty, cm = om.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, fm = { key: !0, ref: !0, __self: !0, __source: !0 };
function Uc(e, t, n) {
  var r, l = {}, i = null, o = null;
  n !== void 0 && (i = "" + n), t.key !== void 0 && (i = "" + t.key), t.ref !== void 0 && (o = t.ref);
  for (r in t) sm.call(t, r) && !fm.hasOwnProperty(r) && (l[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) l[r] === void 0 && (l[r] = t[r]);
  return { $$typeof: um, type: e, key: i, ref: o, props: l, _owner: cm.current };
}
zl.Fragment = am;
zl.jsx = Uc;
zl.jsxs = Uc;
Ac.exports = zl;
var g = Ac.exports;
function dm({
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
    Bc,
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
function pm(e) {
  return e.shiftKey ? "range" : e.ctrlKey || e.metaKey ? "toggle" : "replace";
}
function Bc({
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
      mm,
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
        onClick: (c) => r(e.path, pm(c)),
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
      Bc,
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
function mm({
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
function bi({ schema: e, value: t, onChange: n }) {
  const r = e.typename === "int", [l, i] = F.useState(
    () => t == null ? "" : String(t)
  );
  F.useEffect(() => {
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
function eo({ schema: e, value: t, onChange: n }) {
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
      bi,
      {
        schema: e,
        value: t,
        onChange: n
      }
    )
  ] });
}
function hm({ schema: e, value: t, onChange: n, siblings: r }) {
  if (!((r == null ? void 0 : r.mode) === "datetime"))
    return /* @__PURE__ */ g.jsx(eo, { schema: e, value: t, onChange: n });
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
function vm({ schema: e, value: t, onChange: n }) {
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
function we({ schema: e, value: t, onChange: n, editable: r = !1 }) {
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
function ym({ schema: e, value: t, onChange: n }) {
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
        value: wm(r),
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
const fa = /* @__PURE__ */ new Map(), gm = {
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
function wm(e) {
  if (/^#[0-9a-fA-F]{6}$/.test(e)) return e;
  const t = gm[e.toLowerCase()];
  if (t) return t;
  if (typeof document > "u") return "#000000";
  const n = fa.get(e);
  if (n) return n;
  const r = document.createElement("div");
  r.style.color = e, r.style.display = "none", document.body.appendChild(r);
  const l = getComputedStyle(r).color;
  document.body.removeChild(r);
  const i = l.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!i) return "#000000";
  const o = "#" + [i[1], i[2], i[3]].map((u) => parseInt(u, 10).toString(16).padStart(2, "0")).join("");
  return fa.set(e, o), o;
}
function zr({
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
const da = /^(-?\d+(?:\.\d+)?)\s*(pt|cm|mm|in|%|\/)?$/;
function ni({ schema: e, value: t, onChange: n, allowAuto: r = !1 }) {
  const l = typeof t == "string" ? t : "", i = l.toLowerCase() === "auto", o = (() => {
    if (i) return { num: "", unit: "pt" };
    const d = l.match(da);
    return { num: (d == null ? void 0 : d[1]) ?? "", unit: (d == null ? void 0 : d[2]) ?? "pt" };
  })(), [u, a] = F.useState(o.num), [s, c] = F.useState(o.unit);
  F.useEffect(() => {
    if (i) return;
    const d = l.match(da);
    d && (a(d[1] ?? ""), c(d[2] ?? "pt"));
  }, [l, i]);
  const m = (d, y) => {
    d.trim() !== "" && n(`${d}${y}`);
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
          onChange: (d) => n(d.target.checked ? "Auto" : "1pt")
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
          onChange: (d) => a(d.target.value),
          onBlur: (d) => m(d.target.value, s),
          onKeyDown: (d) => {
            d.key === "Enter" && m(d.target.value, s);
          }
        }
      ),
      /* @__PURE__ */ g.jsx(
        "select",
        {
          value: s,
          "data-testid": `setting-${e.name}-unit`,
          "aria-label": `${e.usertext || e.name} unit`,
          onChange: (d) => {
            c(d.target.value), m(u, d.target.value);
          },
          children: ["pt", "cm", "mm", "in", "%"].map((d) => /* @__PURE__ */ g.jsx("option", { value: d, children: d }, d))
        }
      )
    ] })
  ] });
}
function ri({
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
function Sm({ schema: e, value: t, onChange: n }) {
  const r = km(t), [l, i] = F.useState(r);
  F.useEffect(() => i(r), [r]);
  const o = (u) => {
    if (u.startsWith("=")) {
      n(u);
      return;
    }
    const a = u.split(`
`).map((c) => c.trim()).filter(Boolean), s = {};
    for (const c of a) {
      const [m, d] = c.split("=", 2).map((v) => v == null ? void 0 : v.trim());
      if (!m) continue;
      const y = Number(d);
      if (!Number.isFinite(y)) {
        n(u);
        return;
      }
      s[m] = y;
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
function km(e) {
  return typeof e == "string" ? e : e && typeof e == "object" && !Array.isArray(e) ? Object.entries(e).map(([t, n]) => `${t}=${n}`).join(`
`) : "";
}
function xm({ schema: e, value: t, onChange: n }) {
  const r = Array.isArray(t) ? t.join(", ") : typeof t == "string" ? t : "", [l, i] = F.useState(r);
  F.useEffect(() => i(r), [r]);
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
function _m({ schema: e, value: t, onChange: n }) {
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
function Em({ schema: e, value: t, onChange: n }) {
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
function li({ schema: e, value: t, onChange: n }) {
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
function Cm({ schema: e, value: t, onChange: n }) {
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
function Nr({ schema: e, value: t, onChange: n }) {
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
function ii({
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
const Vc = {
  // Atomic
  str: Nr,
  "str-notes": Nr,
  bool: vm,
  int: bi,
  float: bi,
  "float-or-auto": eo,
  "int-or-auto": eo,
  "float-slider": _m,
  distance: ni,
  "distance-or-auto": (e) => /* @__PURE__ */ g.jsx(ni, { ...e, allowAuto: !0 }),
  displacement: ni,
  choice: we,
  "choice-or-more": (e) => /* @__PURE__ */ g.jsx(we, { ...e, editable: !0 }),
  "float-choice": (e) => /* @__PURE__ */ g.jsx(we, { ...e, editable: !0 }),
  color: ym,
  colormap: we,
  marker: Cm,
  arrow: we,
  "line-style": Em,
  "fill-style": we,
  "fill-style-ext": we,
  "errorbar-style": we,
  "align-horz": we,
  "align-vert": we,
  "align-horz-+manual": we,
  "align-vert-+manual": we,
  "font-family": Nr,
  "font-style": Nr,
  "rotate-interval": we,
  "axis-bound": hm,
  // List / composite
  "float-list": xm,
  "float-dict": Sm,
  "str-multi": li,
  "line-multi": li,
  "fill-multi": li,
  // Reference-by-path
  dataset: zr,
  "dataset-multi": zr,
  "dataset-extended": zr,
  "dataset-or-str": zr,
  "widget-path": ii,
  "widget-choice": ii,
  axis: ii,
  // File-system
  filename: ri,
  "filename-image": ri,
  "filename-svg": ri,
  // Internal — kept hidden by the inspector via `setting.hidden`,
  // but mapped here so the registry-coverage assertions report 100%.
  "backward-compat": () => null
};
new Set(
  Object.keys(Vc)
);
function Pm(e) {
  return Vc[e] ?? null;
}
function zm(e) {
  var i;
  const t = e.widgetPaths[0], n = e.widgetPaths.length > 1, r = (o, u) => {
    var c;
    if (!n) {
      e.onChange(o, u);
      return;
    }
    const a = o.slice(t.length), s = e.widgetPaths.map((m) => ({ path: m + a, value: u }));
    (c = e.onChangeMany) == null || c.call(e, s);
  }, l = n ? `${((i = e.schema.typenames) == null ? void 0 : i.join(", ")) ?? "widgets"} ×${e.widgetPaths.length}` : e.schema.typename ?? "";
  return /* @__PURE__ */ g.jsxs(
    "div",
    {
      "data-testid": "inspector",
      "data-widget": t,
      "data-multi": n || void 0,
      "data-count": e.widgetPaths.length,
      children: [
        /* @__PURE__ */ g.jsx("h3", { "data-testid": "inspector-title", children: l }),
        /* @__PURE__ */ g.jsx(
          Wc,
          {
            group: e.schema,
            basePath: t,
            widgetPath: t,
            values: e.values,
            datasets: e.datasets,
            onChange: r,
            settingMenu: e.settingMenu
          }
        )
      ]
    }
  );
}
function Wc({ group: e, basePath: t, widgetPath: n, values: r, datasets: l, onChange: i, settingMenu: o, groupLabel: u }) {
  return /* @__PURE__ */ g.jsxs(F.Fragment, { children: [
    e.settings.map(
      (a) => a.hidden ? null : /* @__PURE__ */ g.jsx(
        Nm,
        {
          schema: a,
          basePath: t,
          widgetPath: n,
          value: r[to(t, a.name)],
          datasets: l,
          onChange: i,
          settingMenu: o,
          groupLabel: u
        },
        a.name
      )
    ),
    e.subgroups.map((a) => {
      const s = a.usertext || Tm(a.name);
      return /* @__PURE__ */ g.jsxs("details", { "data-testid": `subgroup-${a.name}`, open: !0, children: [
        /* @__PURE__ */ g.jsx("summary", { children: s }),
        /* @__PURE__ */ g.jsx(
          Wc,
          {
            group: a,
            basePath: to(t, a.name),
            widgetPath: n,
            values: r,
            datasets: l,
            onChange: i,
            settingMenu: o,
            groupLabel: s
          }
        )
      ] }, a.name);
    })
  ] });
}
function Nm({
  schema: e,
  basePath: t,
  widgetPath: n,
  value: r,
  datasets: l,
  onChange: i,
  settingMenu: o,
  groupLabel: u
}) {
  const a = Pm(e.typename), s = to(t, e.name), c = Lm(e, u), m = e.mixed_value === !0, d = (y) => o ? o(
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
      "data-mixed": m || void 0,
      children: [
        d(
          /* @__PURE__ */ g.jsxs("label", { style: m ? { fontStyle: "italic", color: "#888" } : void 0, children: [
            c,
            m ? " (mixed)" : ""
          ] })
        ),
        /* @__PURE__ */ g.jsx(
          a,
          {
            schema: e,
            value: m ? void 0 : r,
            datasets: l,
            onChange: (y) => i(s, y)
          }
        )
      ]
    }
  ) : /* @__PURE__ */ g.jsxs("div", { "data-testid": `row-${e.name}`, "data-mixed": m || void 0, children: [
    d(/* @__PURE__ */ g.jsx("label", { children: c })),
    /* @__PURE__ */ g.jsx("code", { "data-testid": `fallback-${e.name}`, children: r === void 0 ? "(unset)" : JSON.stringify(r) }),
    /* @__PURE__ */ g.jsxs("small", { children: [
      " [typename=",
      e.typename,
      "]"
    ] })
  ] });
}
function to(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
function Tm(e) {
  if (!e) return e;
  const t = e.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
const jm = /* @__PURE__ */ new Set(["color", "hide", "width", "style"]);
function Lm(e, t) {
  const n = e.usertext || e.name;
  return t ? jm.has(e.name) ? `${t} ${n.toLowerCase()}` : n : e.name === "color" && e.descr ? e.descr : n;
}
function Rm(e, t) {
  const n = new Map(t.map((l) => [l.path, l])), r = [];
  for (const l of e) {
    const i = n.get(l.path);
    if (!i) continue;
    const o = Math.min(l.value, i.value), u = Math.max(l.value, i.value);
    !(u > o) || !Number.isFinite(o) || !Number.isFinite(u) || (r.push({ path: `${l.path}/min`, value: o }), r.push({ path: `${l.path}/max`, value: u }));
  }
  return r;
}
function Dm(e) {
  const t = [];
  for (const n of new Set(e))
    t.push({ path: `${n}/min`, value: "Auto" }), t.push({ path: `${n}/max`, value: "Auto" });
  return t;
}
function Mm(e, t, n) {
  const r = new Map(t.map((i) => [i.path, i])), l = [];
  for (const i of e) {
    const o = r.get(i.path), u = n.get(i.path);
    if (!o || !u) continue;
    const a = i.value - o.value;
    Number.isFinite(a) && (l.push({ path: `${i.path}/min`, value: u.min + a }), l.push({ path: `${i.path}/max`, value: u.max + a }));
  }
  return l;
}
function Im(e) {
  const t = (i) => {
    const o = Math.abs(i);
    return o !== 0 && (o < 1e-3 || o >= 1e5) ? i.toExponential(3) : Number(i.toPrecision(5)).toString();
  }, n = e.find((i) => i.direction === "horizontal"), r = e.find((i) => i.direction === "vertical"), l = [];
  return n && l.push(`x: ${t(n.value)}`), r && l.push(`y: ${t(r.value)}`), l.join("   ");
}
const pa = 4;
function $m({
  store: e,
  width: t,
  height: n
}) {
  const r = e((x) => x.render), l = e((x) => x.tree), i = e((x) => x.currentPage), o = e((x) => x.values), u = e((x) => x.requestRender), a = F.useRef(null), s = F.useRef(null), [c, m] = F.useState(null), [d, y] = F.useState(null), v = F.useRef(/* @__PURE__ */ new Set()), k = F.useRef(null), D = F.useRef(0);
  F.useEffect(() => {
    l && l.children.length > 0 && u(i, t, n);
  }, [l, o, i, t, n, u]), F.useEffect(() => {
    const x = r == null ? void 0 : r.sceneB64, T = a.current;
    if (!x || !T) return;
    let N = !1;
    return (async () => {
      try {
        const { renderSceneToCanvas: I } = await Promise.resolve().then(() => Fc);
        N || await I(T, x, [1, 1, 1, 1]);
      } catch (I) {
        N || console.error("embed scene render failed", I);
      }
    })(), () => {
      N = !0;
    };
  }, [r == null ? void 0 : r.sceneB64, t, n]);
  const p = () => e.getState().rpc, f = (x) => {
    const N = a.current.getBoundingClientRect();
    return [
      (x.clientX - N.left) * (t / N.width),
      (x.clientY - N.top) * (n / N.height)
    ];
  }, h = (x) => {
    const [T, N] = f(x), I = x.shiftKey || x.button === 1;
    k.current = { mode: I ? "pan" : "zoom", sx: T, sy: N, moved: !1 }, I && p().render.pixelToData(T, N).then(async (ae) => {
      if (!k.current) return;
      k.current.from = ae.axes;
      const re = /* @__PURE__ */ new Map();
      for (const pe of ae.axes) {
        const xt = await p().doc.get([`${pe.path}/min`, `${pe.path}/max`]), He = Number(xt[`${pe.path}/min`]), tt = Number(xt[`${pe.path}/max`]);
        Number.isFinite(He) && Number.isFinite(tt) && re.set(pe.path, { min: He, max: tt });
      }
      k.current.ranges = re;
    });
  }, w = (x) => {
    const [T, N] = f(x), I = k.current;
    if (I) {
      (Math.abs(T - I.sx) > pa || Math.abs(N - I.sy) > pa) && (I.moved = !0), I.mode === "zoom" && I.moved && m({ x0: I.sx, y0: I.sy, x1: T, y1: N });
      return;
    }
    const ae = performance.now();
    ae - D.current < 40 || (D.current = ae, p().render.pixelToData(T, N).then((re) => {
      re.axes.forEach((tt) => v.current.add(tt.path));
      const pe = Im(re.axes);
      if (!pe) {
        y(null);
        return;
      }
      const xt = s.current, He = xt ? xt.getBoundingClientRect() : { left: 0, top: 0 };
      y({ left: x.clientX - He.left + 12, top: x.clientY - He.top + 12, text: pe });
    }));
  }, _ = (x) => {
    const T = k.current;
    if (k.current = null, m(null), !T || !T.moved) return;
    const [N, I] = f(x);
    T.mode === "zoom" ? (async () => {
      const [ae, re] = await Promise.all([
        p().render.pixelToData(T.sx, T.sy),
        p().render.pixelToData(N, I)
      ]), pe = Rm(ae.axes, re.axes);
      pe.length && await P(pe);
    })() : T.mode === "pan" && T.from && T.ranges && (async () => {
      const ae = await p().render.pixelToData(N, I), re = Mm(T.from, ae.axes, T.ranges);
      re.length && await P(re);
    })();
  }, z = () => {
    v.current.size && P(Dm(v.current));
  }, P = async (x) => {
    await e.getState().setValues(x), u(i, t, n);
  };
  return /* @__PURE__ */ g.jsxs(
    "div",
    {
      ref: s,
      "data-testid": "embed-plot",
      style: { position: "relative", width: "100%", lineHeight: 0 },
      onMouseLeave: () => {
        y(null);
      },
      children: [
        /* @__PURE__ */ g.jsx(
          "canvas",
          {
            ref: a,
            width: t,
            height: n,
            "data-testid": "embed-canvas",
            onMouseDown: h,
            onMouseMove: w,
            onMouseUp: _,
            onDoubleClick: z,
            style: {
              width: "100%",
              height: "auto",
              display: "block",
              cursor: "crosshair",
              touchAction: "none"
            }
          }
        ),
        c && /* @__PURE__ */ g.jsx("div", { "data-testid": "embed-zoomband", style: {
          position: "absolute",
          pointerEvents: "none",
          border: "1px solid #1f6feb",
          background: "rgba(31,111,235,0.12)",
          left: `${Math.min(c.x0, c.x1) / t * 100}%`,
          top: `${Math.min(c.y0, c.y1) / n * 100}%`,
          width: `${Math.abs(c.x1 - c.x0) / t * 100}%`,
          height: `${Math.abs(c.y1 - c.y0) / n * 100}%`
        } }),
        d && /* @__PURE__ */ g.jsx("div", { "data-testid": "embed-tooltip", style: {
          position: "absolute",
          left: d.left,
          top: d.top,
          pointerEvents: "none",
          background: "rgba(20,22,26,0.9)",
          color: "#fff",
          font: "12px system-ui",
          padding: "2px 6px",
          borderRadius: 4,
          whiteSpace: "nowrap",
          zIndex: 5
        }, children: d.text })
      ]
    }
  );
}
function Fm({
  store: e,
  width: t = 600,
  height: n = 400,
  editable: r = !0,
  title: l
}) {
  const i = e((v) => v.tree), o = e((v) => v.selected), u = e((v) => v.schema), a = e((v) => v.values), s = e((v) => v.datasets), c = e((v) => v.error), m = e((v) => v.webgpuAvailable), [d, y] = F.useState(!1);
  return F.useEffect(() => {
    const v = e.getState();
    return v.setBackend("vello-wasm"), v.probeWebgpu(), v.loadPlotPrefs(), v.refreshAll(), v.subscribeToDaemon();
  }, [e]), m === !1 ? /* @__PURE__ */ g.jsx("div", { "data-testid": "veusz-figure", style: ma, children: /* @__PURE__ */ g.jsx("div", { "data-testid": "veusz-needs-webgpu", style: { padding: 16, color: "#b06000" }, children: "This interactive figure needs WebGPU. Open in Chrome or Safari 26+." }) }) : /* @__PURE__ */ g.jsxs("div", { "data-testid": "veusz-figure", style: ma, children: [
    /* @__PURE__ */ g.jsxs("div", { style: Om, children: [
      /* @__PURE__ */ g.jsx("strong", { style: { fontSize: 13 }, children: l ?? "Veusz figure" }),
      /* @__PURE__ */ g.jsx("span", { style: { flex: 1 } }),
      c && /* @__PURE__ */ g.jsx("span", { "data-testid": "veusz-error", style: { color: "crimson", fontSize: 12 }, children: c }),
      r && /* @__PURE__ */ g.jsx(
        "button",
        {
          type: "button",
          "data-testid": "veusz-edit-toggle",
          "aria-pressed": d,
          onClick: () => y((v) => !v),
          style: Um(d),
          children: "Edit"
        }
      )
    ] }),
    /* @__PURE__ */ g.jsxs("div", { style: { display: "flex", alignItems: "stretch" }, children: [
      /* @__PURE__ */ g.jsx("div", { style: { flex: 1, minWidth: 0, padding: 8 }, children: /* @__PURE__ */ g.jsx($m, { store: e, width: t, height: n }) }),
      d && /* @__PURE__ */ g.jsxs("aside", { "data-testid": "veusz-edit-panel", style: Am, children: [
        i ? /* @__PURE__ */ g.jsx(
          dm,
          {
            root: i,
            selected: o,
            onSelect: (v) => {
              e.getState().select([v]);
            }
          }
        ) : /* @__PURE__ */ g.jsx("p", { style: { color: "#888" }, children: "Loading…" }),
        /* @__PURE__ */ g.jsx("hr", { style: { border: 0, borderTop: "1px solid #eee", margin: "8px 0" } }),
        u && o.length > 0 ? /* @__PURE__ */ g.jsx(
          zm,
          {
            schema: u,
            widgetPaths: o,
            values: a,
            datasets: s.map((v) => v.name),
            onChange: (v, k) => {
              e.getState().setValue(v, k);
            },
            onChangeMany: (v) => {
              e.getState().setValues(v);
            }
          }
        ) : /* @__PURE__ */ g.jsx("p", { style: { color: "#888", fontSize: 13 }, children: "Select a widget to edit." })
      ] })
    ] })
  ] });
}
const ma = {
  border: "1px solid #e2e4e8",
  borderRadius: 10,
  overflow: "hidden",
  background: "#fff",
  font: "14px system-ui, sans-serif"
}, Om = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderBottom: "1px solid #eee",
  background: "#fafbfc"
}, Am = {
  width: 300,
  flex: "0 0 300px",
  borderLeft: "1px solid #eee",
  padding: 8,
  overflow: "auto",
  maxHeight: 520
};
function Um(e) {
  return {
    border: "1px solid #d0d3d9",
    borderRadius: 6,
    padding: "3px 10px",
    cursor: "pointer",
    fontSize: 12,
    background: e ? "#1f6feb" : "#fff",
    color: e ? "#fff" : "#222"
  };
}
const ha = "This interactive figure needs WebGPU. Open in Chrome or Safari 26+.";
class Bm extends HTMLElement {
  constructor() {
    super(...arguments);
    vn(this, "root", null);
    vn(this, "mounted", !1);
    vn(this, "noteEl", null);
    vn(this, "urlLinks", null);
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
    if (i.src = n, i.alt = this.getAttribute("title") ?? "Veusz figure", i.style.cssText = "display:block;width:100%;height:auto;", i.addEventListener("error", () => this.status(r.note ?? ha)), l.appendChild(i), r.onActivate) {
      const o = document.createElement("button");
      o.type = "button", o.setAttribute("data-testid", "veusz-figure-activate"), o.setAttribute("aria-label", "Load the interactive figure"), o.textContent = "▶ Interact", o.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border:0;border-radius:999px;padding:8px 16px;cursor:pointer;font:600 13px system-ui;color:#fff;background:rgba(31,111,235,0.92);box-shadow:0 1px 6px rgba(0,0,0,0.25);", o.addEventListener("click", () => r.onActivate()), l.appendChild(o);
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
    if (!await Mc()) {
      r ? this.showPoster(r, {
        note: "Static image — the interactive view needs WebGPU (Chrome or Safari 26+)."
      }) : this.status(ha);
      return;
    }
    this.getAttribute("eager") === "true" || !r ? await this.bootInteractive(n, r) : this.showPoster(r, {
      onActivate: () => {
        this.bootInteractive(n, r);
      }
    });
  }
  /** Load the Pyodide runtime + document and mount the live figure. Keeps the
   *  poster (with progress in its caption) until the figure is ready. */
  async bootInteractive(n, r) {
    r ? this.showPoster(r, { note: "Loading interactive figure…" }) : this.status("Loading…");
    try {
      const l = await nm({
        wasmBase: this.getAttribute("wasm-base") ?? void 0,
        pyodideIndexUrl: this.getAttribute("pyodide-index") ?? void 0,
        veuszWheelUrl: this.getAttribute("veusz-wheel") ?? void 0,
        onProgress: (c) => {
          r ? this.setNote(c) : this.status(c);
        }
      }), i = await fetch(n);
      if (!i.ok) throw new Error(`fetch ${n}: ${i.status}`);
      const o = await i.text(), u = {
        urlBase: this.getAttribute("data-url-base") ?? new URL(".", new URL(n, location.href)).toString(),
        urlMap: Vm(this.getAttribute("data-url-map"))
      };
      await lm(o, l.transport, u), await l.loadVsz(o), this.urlLinks = await rm(l.transport, u);
      const a = Yp(hp(l.transport));
      this.replaceChildren(), this.noteEl = null;
      const s = document.createElement("div");
      this.appendChild(s), this.root = zc(s), this.root.render(F.createElement(Fm, {
        store: a,
        width: Number(this.getAttribute("width") ?? 600),
        height: Number(this.getAttribute("height") ?? 400),
        editable: this.getAttribute("editable") !== "false",
        title: this.getAttribute("title") ?? void 0
      }));
    } catch (l) {
      const i = l.message;
      r ? this.showPoster(r, {
        note: `Couldn’t load the interactive view: ${i}. Click to retry.`,
        onActivate: () => {
          this.bootInteractive(n, r);
        }
      }) : this.status(`Failed to load figure: ${i}`);
    }
  }
}
function Vm(e) {
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
typeof customElements < "u" && !customElements.get("veusz-figure") && customElements.define("veusz-figure", Bm);
export {
  Bm as VeuszFigureElement
};
//# sourceMappingURL=veusz-embed.js.map
