var ff = Object.defineProperty;
var df = (e, t, n) => t in e ? ff(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Sn = (e, t, n) => df(e, typeof t != "symbol" ? t + "" : t, n);
function Ra(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Da = { exports: {} }, Pe = {}, Ma = { exports: {} }, $ = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var or = Symbol.for("react.element"), pf = Symbol.for("react.portal"), mf = Symbol.for("react.fragment"), hf = Symbol.for("react.strict_mode"), vf = Symbol.for("react.profiler"), yf = Symbol.for("react.provider"), gf = Symbol.for("react.context"), wf = Symbol.for("react.forward_ref"), Sf = Symbol.for("react.suspense"), xf = Symbol.for("react.memo"), kf = Symbol.for("react.lazy"), cu = Symbol.iterator;
function _f(e) {
  return e === null || typeof e != "object" ? null : (e = cu && e[cu] || e["@@iterator"], typeof e == "function" ? e : null);
}
var Ia = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, $a = Object.assign, Oa = {};
function hn(e, t, n) {
  this.props = e, this.context = t, this.refs = Oa, this.updater = n || Ia;
}
hn.prototype.isReactComponent = {};
hn.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
hn.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function Fa() {
}
Fa.prototype = hn.prototype;
function uo(e, t, n) {
  this.props = e, this.context = t, this.refs = Oa, this.updater = n || Ia;
}
var ao = uo.prototype = new Fa();
ao.constructor = uo;
$a(ao, hn.prototype);
ao.isPureReactComponent = !0;
var fu = Array.isArray, Aa = Object.prototype.hasOwnProperty, so = { current: null }, Ua = { key: !0, ref: !0, __self: !0, __source: !0 };
function Ba(e, t, n) {
  var r, l = {}, i = null, o = null;
  if (t != null) for (r in t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (i = "" + t.key), t) Aa.call(t, r) && !Ua.hasOwnProperty(r) && (l[r] = t[r]);
  var u = arguments.length - 2;
  if (u === 1) l.children = n;
  else if (1 < u) {
    for (var a = Array(u), s = 0; s < u; s++) a[s] = arguments[s + 2];
    l.children = a;
  }
  if (e && e.defaultProps) for (r in u = e.defaultProps, u) l[r] === void 0 && (l[r] = u[r]);
  return { $$typeof: or, type: e, key: i, ref: o, props: l, _owner: so.current };
}
function Ef(e, t) {
  return { $$typeof: or, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function co(e) {
  return typeof e == "object" && e !== null && e.$$typeof === or;
}
function Cf(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var du = /\/+/g;
function Ml(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? Cf("" + e.key) : t.toString(36);
}
function Mr(e, t, n, r, l) {
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
        case or:
        case pf:
          o = !0;
      }
  }
  if (o) return o = e, l = l(o), e = r === "" ? "." + Ml(o, 0) : r, fu(l) ? (n = "", e != null && (n = e.replace(du, "$&/") + "/"), Mr(l, t, n, "", function(s) {
    return s;
  })) : l != null && (co(l) && (l = Ef(l, n + (!l.key || o && o.key === l.key ? "" : ("" + l.key).replace(du, "$&/") + "/") + e)), t.push(l)), 1;
  if (o = 0, r = r === "" ? "." : r + ":", fu(e)) for (var u = 0; u < e.length; u++) {
    i = e[u];
    var a = r + Ml(i, u);
    o += Mr(i, t, n, a, l);
  }
  else if (a = _f(e), typeof a == "function") for (e = a.call(e), u = 0; !(i = e.next()).done; ) i = i.value, a = r + Ml(i, u++), o += Mr(i, t, n, a, l);
  else if (i === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return o;
}
function mr(e, t, n) {
  if (e == null) return e;
  var r = [], l = 0;
  return Mr(e, r, "", "", function(i) {
    return t.call(n, i, l++);
  }), r;
}
function Pf(e) {
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
var pe = { current: null }, Ir = { transition: null }, zf = { ReactCurrentDispatcher: pe, ReactCurrentBatchConfig: Ir, ReactCurrentOwner: so };
function Va() {
  throw Error("act(...) is not supported in production builds of React.");
}
$.Children = { map: mr, forEach: function(e, t, n) {
  mr(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return mr(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return mr(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!co(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
$.Component = hn;
$.Fragment = mf;
$.Profiler = vf;
$.PureComponent = uo;
$.StrictMode = hf;
$.Suspense = Sf;
$.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = zf;
$.act = Va;
$.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = $a({}, e.props), l = e.key, i = e.ref, o = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (i = t.ref, o = so.current), t.key !== void 0 && (l = "" + t.key), e.type && e.type.defaultProps) var u = e.type.defaultProps;
    for (a in t) Aa.call(t, a) && !Ua.hasOwnProperty(a) && (r[a] = t[a] === void 0 && u !== void 0 ? u[a] : t[a]);
  }
  var a = arguments.length - 2;
  if (a === 1) r.children = n;
  else if (1 < a) {
    u = Array(a);
    for (var s = 0; s < a; s++) u[s] = arguments[s + 2];
    r.children = u;
  }
  return { $$typeof: or, type: e.type, key: l, ref: i, props: r, _owner: o };
};
$.createContext = function(e) {
  return e = { $$typeof: gf, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: yf, _context: e }, e.Consumer = e;
};
$.createElement = Ba;
$.createFactory = function(e) {
  var t = Ba.bind(null, e);
  return t.type = e, t;
};
$.createRef = function() {
  return { current: null };
};
$.forwardRef = function(e) {
  return { $$typeof: wf, render: e };
};
$.isValidElement = co;
$.lazy = function(e) {
  return { $$typeof: kf, _payload: { _status: -1, _result: e }, _init: Pf };
};
$.memo = function(e, t) {
  return { $$typeof: xf, type: e, compare: t === void 0 ? null : t };
};
$.startTransition = function(e) {
  var t = Ir.transition;
  Ir.transition = {};
  try {
    e();
  } finally {
    Ir.transition = t;
  }
};
$.unstable_act = Va;
$.useCallback = function(e, t) {
  return pe.current.useCallback(e, t);
};
$.useContext = function(e) {
  return pe.current.useContext(e);
};
$.useDebugValue = function() {
};
$.useDeferredValue = function(e) {
  return pe.current.useDeferredValue(e);
};
$.useEffect = function(e, t) {
  return pe.current.useEffect(e, t);
};
$.useId = function() {
  return pe.current.useId();
};
$.useImperativeHandle = function(e, t, n) {
  return pe.current.useImperativeHandle(e, t, n);
};
$.useInsertionEffect = function(e, t) {
  return pe.current.useInsertionEffect(e, t);
};
$.useLayoutEffect = function(e, t) {
  return pe.current.useLayoutEffect(e, t);
};
$.useMemo = function(e, t) {
  return pe.current.useMemo(e, t);
};
$.useReducer = function(e, t, n) {
  return pe.current.useReducer(e, t, n);
};
$.useRef = function(e) {
  return pe.current.useRef(e);
};
$.useState = function(e) {
  return pe.current.useState(e);
};
$.useSyncExternalStore = function(e, t, n) {
  return pe.current.useSyncExternalStore(e, t, n);
};
$.useTransition = function() {
  return pe.current.useTransition();
};
$.version = "18.3.1";
Ma.exports = $;
var O = Ma.exports;
const Nf = /* @__PURE__ */ Ra(O);
var Wa = { exports: {} }, Ha = {};
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
  function t(y, P) {
    var E = y.length;
    y.push(P);
    e: for (; 0 < E; ) {
      var j = E - 1 >>> 1, R = y[j];
      if (0 < l(R, P)) y[j] = P, y[E] = R, E = j;
      else break e;
    }
  }
  function n(y) {
    return y.length === 0 ? null : y[0];
  }
  function r(y) {
    if (y.length === 0) return null;
    var P = y[0], E = y.pop();
    if (E !== P) {
      y[0] = E;
      e: for (var j = 0, R = y.length, A = R >>> 1; j < A; ) {
        var M = 2 * (j + 1) - 1, V = y[M], I = M + 1, U = y[I];
        if (0 > l(V, E)) I < R && 0 > l(U, V) ? (y[j] = U, y[I] = E, j = I) : (y[j] = V, y[M] = E, j = M);
        else if (I < R && 0 > l(U, E)) y[j] = U, y[I] = E, j = I;
        else break e;
      }
    }
    return P;
  }
  function l(y, P) {
    var E = y.sortIndex - P.sortIndex;
    return E !== 0 ? E : y.id - P.id;
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
  var a = [], s = [], c = 1, p = null, d = 3, g = !1, w = !1, k = !1, L = typeof setTimeout == "function" ? setTimeout : null, m = typeof clearTimeout == "function" ? clearTimeout : null, f = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function h(y) {
    for (var P = n(s); P !== null; ) {
      if (P.callback === null) r(s);
      else if (P.startTime <= y) r(s), P.sortIndex = P.expirationTime, t(a, P);
      else break;
      P = n(s);
    }
  }
  function v(y) {
    if (k = !1, h(y), !w) if (n(a) !== null) w = !0, gn(_);
    else {
      var P = n(s);
      P !== null && wn(v, P.startTime - y);
    }
  }
  function _(y, P) {
    w = !1, k && (k = !1, m(T), T = -1), g = !0;
    var E = d;
    try {
      for (h(P), p = n(a); p !== null && (!(p.expirationTime > P) || y && !Se()); ) {
        var j = p.callback;
        if (typeof j == "function") {
          p.callback = null, d = p.priorityLevel;
          var R = j(p.expirationTime <= P);
          P = e.unstable_now(), typeof R == "function" ? p.callback = R : p === n(a) && r(a), h(P);
        } else r(a);
        p = n(a);
      }
      if (p !== null) var A = !0;
      else {
        var M = n(s);
        M !== null && wn(v, M.startTime - P), A = !1;
      }
      return A;
    } finally {
      p = null, d = E, g = !1;
    }
  }
  var N = !1, C = null, T = -1, W = 5, D = -1;
  function Se() {
    return !(e.unstable_now() - D < W);
  }
  function _t() {
    if (C !== null) {
      var y = e.unstable_now();
      D = y;
      var P = !0;
      try {
        P = C(!0, y);
      } finally {
        P ? Et() : (N = !1, C = null);
      }
    } else N = !1;
  }
  var Et;
  if (typeof f == "function") Et = function() {
    f(_t);
  };
  else if (typeof MessageChannel < "u") {
    var fr = new MessageChannel(), Dl = fr.port2;
    fr.port1.onmessage = _t, Et = function() {
      Dl.postMessage(null);
    };
  } else Et = function() {
    L(_t, 0);
  };
  function gn(y) {
    C = y, N || (N = !0, Et());
  }
  function wn(y, P) {
    T = L(function() {
      y(e.unstable_now());
    }, P);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(y) {
    y.callback = null;
  }, e.unstable_continueExecution = function() {
    w || g || (w = !0, gn(_));
  }, e.unstable_forceFrameRate = function(y) {
    0 > y || 125 < y ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : W = 0 < y ? Math.floor(1e3 / y) : 5;
  }, e.unstable_getCurrentPriorityLevel = function() {
    return d;
  }, e.unstable_getFirstCallbackNode = function() {
    return n(a);
  }, e.unstable_next = function(y) {
    switch (d) {
      case 1:
      case 2:
      case 3:
        var P = 3;
        break;
      default:
        P = d;
    }
    var E = d;
    d = P;
    try {
      return y();
    } finally {
      d = E;
    }
  }, e.unstable_pauseExecution = function() {
  }, e.unstable_requestPaint = function() {
  }, e.unstable_runWithPriority = function(y, P) {
    switch (y) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        y = 3;
    }
    var E = d;
    d = y;
    try {
      return P();
    } finally {
      d = E;
    }
  }, e.unstable_scheduleCallback = function(y, P, E) {
    var j = e.unstable_now();
    switch (typeof E == "object" && E !== null ? (E = E.delay, E = typeof E == "number" && 0 < E ? j + E : j) : E = j, y) {
      case 1:
        var R = -1;
        break;
      case 2:
        R = 250;
        break;
      case 5:
        R = 1073741823;
        break;
      case 4:
        R = 1e4;
        break;
      default:
        R = 5e3;
    }
    return R = E + R, y = { id: c++, callback: P, priorityLevel: y, startTime: E, expirationTime: R, sortIndex: -1 }, E > j ? (y.sortIndex = E, t(s, y), n(a) === null && y === n(s) && (k ? (m(T), T = -1) : k = !0, wn(v, E - j))) : (y.sortIndex = R, t(a, y), w || g || (w = !0, gn(_))), y;
  }, e.unstable_shouldYield = Se, e.unstable_wrapCallback = function(y) {
    var P = d;
    return function() {
      var E = d;
      d = P;
      try {
        return y.apply(this, arguments);
      } finally {
        d = E;
      }
    };
  };
})(Ha);
Wa.exports = Ha;
var Tf = Wa.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var jf = O, Ce = Tf;
function x(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var Qa = /* @__PURE__ */ new Set(), Wn = {};
function Ft(e, t) {
  un(e, t), un(e + "Capture", t);
}
function un(e, t) {
  for (Wn[e] = t, e = 0; e < t.length; e++) Qa.add(t[e]);
}
var qe = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), fi = Object.prototype.hasOwnProperty, Lf = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, pu = {}, mu = {};
function Rf(e) {
  return fi.call(mu, e) ? !0 : fi.call(pu, e) ? !1 : Lf.test(e) ? mu[e] = !0 : (pu[e] = !0, !1);
}
function Df(e, t, n, r) {
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
function Mf(e, t, n, r) {
  if (t === null || typeof t > "u" || Df(e, t, n, r)) return !0;
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
function me(e, t, n, r, l, i, o) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = l, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = i, this.removeEmptyString = o;
}
var oe = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
  oe[e] = new me(e, 0, !1, e, null, !1, !1);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
  var t = e[0];
  oe[t] = new me(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
  oe[e] = new me(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
  oe[e] = new me(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
  oe[e] = new me(e, 3, !1, e.toLowerCase(), null, !1, !1);
});
["checked", "multiple", "muted", "selected"].forEach(function(e) {
  oe[e] = new me(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function(e) {
  oe[e] = new me(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function(e) {
  oe[e] = new me(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function(e) {
  oe[e] = new me(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var fo = /[\-:]([a-z])/g;
function po(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
  var t = e.replace(
    fo,
    po
  );
  oe[t] = new me(t, 1, !1, e, null, !1, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(fo, po);
  oe[t] = new me(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(fo, po);
  oe[t] = new me(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  oe[e] = new me(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
oe.xlinkHref = new me("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function(e) {
  oe[e] = new me(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function mo(e, t, n, r) {
  var l = oe.hasOwnProperty(t) ? oe[t] : null;
  (l !== null ? l.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (Mf(t, n, l, r) && (n = null), r || l === null ? Rf(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : l.mustUseProperty ? e[l.propertyName] = n === null ? l.type === 3 ? !1 : "" : n : (t = l.attributeName, r = l.attributeNamespace, n === null ? e.removeAttribute(t) : (l = l.type, n = l === 3 || l === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var nt = jf.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, hr = Symbol.for("react.element"), Vt = Symbol.for("react.portal"), Wt = Symbol.for("react.fragment"), ho = Symbol.for("react.strict_mode"), di = Symbol.for("react.profiler"), Ya = Symbol.for("react.provider"), Xa = Symbol.for("react.context"), vo = Symbol.for("react.forward_ref"), pi = Symbol.for("react.suspense"), mi = Symbol.for("react.suspense_list"), yo = Symbol.for("react.memo"), lt = Symbol.for("react.lazy"), Ka = Symbol.for("react.offscreen"), hu = Symbol.iterator;
function xn(e) {
  return e === null || typeof e != "object" ? null : (e = hu && e[hu] || e["@@iterator"], typeof e == "function" ? e : null);
}
var Z = Object.assign, Il;
function jn(e) {
  if (Il === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    Il = t && t[1] || "";
  }
  return `
` + Il + e;
}
var $l = !1;
function Ol(e, t) {
  if (!e || $l) return "";
  $l = !0;
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
    $l = !1, Error.prepareStackTrace = n;
  }
  return (e = e ? e.displayName || e.name : "") ? jn(e) : "";
}
function If(e) {
  switch (e.tag) {
    case 5:
      return jn(e.type);
    case 16:
      return jn("Lazy");
    case 13:
      return jn("Suspense");
    case 19:
      return jn("SuspenseList");
    case 0:
    case 2:
    case 15:
      return e = Ol(e.type, !1), e;
    case 11:
      return e = Ol(e.type.render, !1), e;
    case 1:
      return e = Ol(e.type, !0), e;
    default:
      return "";
  }
}
function hi(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Wt:
      return "Fragment";
    case Vt:
      return "Portal";
    case di:
      return "Profiler";
    case ho:
      return "StrictMode";
    case pi:
      return "Suspense";
    case mi:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case Xa:
      return (e.displayName || "Context") + ".Consumer";
    case Ya:
      return (e._context.displayName || "Context") + ".Provider";
    case vo:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case yo:
      return t = e.displayName || null, t !== null ? t : hi(e.type) || "Memo";
    case lt:
      t = e._payload, e = e._init;
      try {
        return hi(e(t));
      } catch {
      }
  }
  return null;
}
function $f(e) {
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
      return hi(t);
    case 8:
      return t === ho ? "StrictMode" : "Mode";
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
function gt(e) {
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
function Ga(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function Of(e) {
  var t = Ga(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
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
function vr(e) {
  e._valueTracker || (e._valueTracker = Of(e));
}
function Za(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(), r = "";
  return e && (r = Ga(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
}
function Yr(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function vi(e, t) {
  var n = t.checked;
  return Z({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function vu(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = gt(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function Ja(e, t) {
  t = t.checked, t != null && mo(e, "checked", t, !1);
}
function yi(e, t) {
  Ja(e, t);
  var n = gt(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? gi(e, t.type, n) : t.hasOwnProperty("defaultValue") && gi(e, t.type, gt(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function yu(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function gi(e, t, n) {
  (t !== "number" || Yr(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var Ln = Array.isArray;
function en(e, t, n, r) {
  if (e = e.options, t) {
    t = {};
    for (var l = 0; l < n.length; l++) t["$" + n[l]] = !0;
    for (n = 0; n < e.length; n++) l = t.hasOwnProperty("$" + e[n].value), e[n].selected !== l && (e[n].selected = l), l && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + gt(n), t = null, l = 0; l < e.length; l++) {
      if (e[l].value === n) {
        e[l].selected = !0, r && (e[l].defaultSelected = !0);
        return;
      }
      t !== null || e[l].disabled || (t = e[l]);
    }
    t !== null && (t.selected = !0);
  }
}
function wi(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(x(91));
  return Z({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function gu(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(x(92));
      if (Ln(n)) {
        if (1 < n.length) throw Error(x(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = { initialValue: gt(n) };
}
function qa(e, t) {
  var n = gt(t.value), r = gt(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function wu(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function ba(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function Si(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? ba(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var yr, es = function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, l) {
    MSApp.execUnsafeLocalFunction(function() {
      return e(t, n, r, l);
    });
  } : e;
}(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
  else {
    for (yr = yr || document.createElement("div"), yr.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = yr.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
    for (; t.firstChild; ) e.appendChild(t.firstChild);
  }
});
function Hn(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var Mn = {
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
}, Ff = ["Webkit", "ms", "Moz", "O"];
Object.keys(Mn).forEach(function(e) {
  Ff.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), Mn[t] = Mn[e];
  });
});
function ts(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || Mn.hasOwnProperty(e) && Mn[e] ? ("" + t).trim() : t + "px";
}
function ns(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, l = ts(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, l) : e[n] = l;
  }
}
var Af = Z({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
function xi(e, t) {
  if (t) {
    if (Af[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(x(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(x(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(x(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(x(62));
  }
}
function ki(e, t) {
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
var _i = null;
function go(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var Ei = null, tn = null, nn = null;
function Su(e) {
  if (e = sr(e)) {
    if (typeof Ei != "function") throw Error(x(280));
    var t = e.stateNode;
    t && (t = Sl(t), Ei(e.stateNode, e.type, t));
  }
}
function rs(e) {
  tn ? nn ? nn.push(e) : nn = [e] : tn = e;
}
function ls() {
  if (tn) {
    var e = tn, t = nn;
    if (nn = tn = null, Su(e), t) for (e = 0; e < t.length; e++) Su(t[e]);
  }
}
function is(e, t) {
  return e(t);
}
function os() {
}
var Fl = !1;
function us(e, t, n) {
  if (Fl) return e(t, n);
  Fl = !0;
  try {
    return is(e, t, n);
  } finally {
    Fl = !1, (tn !== null || nn !== null) && (os(), ls());
  }
}
function Qn(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = Sl(n);
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
  if (n && typeof n != "function") throw Error(x(231, t, typeof n));
  return n;
}
var Ci = !1;
if (qe) try {
  var kn = {};
  Object.defineProperty(kn, "passive", { get: function() {
    Ci = !0;
  } }), window.addEventListener("test", kn, kn), window.removeEventListener("test", kn, kn);
} catch {
  Ci = !1;
}
function Uf(e, t, n, r, l, i, o, u, a) {
  var s = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, s);
  } catch (c) {
    this.onError(c);
  }
}
var In = !1, Xr = null, Kr = !1, Pi = null, Bf = { onError: function(e) {
  In = !0, Xr = e;
} };
function Vf(e, t, n, r, l, i, o, u, a) {
  In = !1, Xr = null, Uf.apply(Bf, arguments);
}
function Wf(e, t, n, r, l, i, o, u, a) {
  if (Vf.apply(this, arguments), In) {
    if (In) {
      var s = Xr;
      In = !1, Xr = null;
    } else throw Error(x(198));
    Kr || (Kr = !0, Pi = s);
  }
}
function At(e) {
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
function as(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function xu(e) {
  if (At(e) !== e) throw Error(x(188));
}
function Hf(e) {
  var t = e.alternate;
  if (!t) {
    if (t = At(e), t === null) throw Error(x(188));
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
        if (i === n) return xu(l), e;
        if (i === r) return xu(l), t;
        i = i.sibling;
      }
      throw Error(x(188));
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
        if (!o) throw Error(x(189));
      }
    }
    if (n.alternate !== r) throw Error(x(190));
  }
  if (n.tag !== 3) throw Error(x(188));
  return n.stateNode.current === n ? e : t;
}
function ss(e) {
  return e = Hf(e), e !== null ? cs(e) : null;
}
function cs(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = cs(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var fs = Ce.unstable_scheduleCallback, ku = Ce.unstable_cancelCallback, Qf = Ce.unstable_shouldYield, Yf = Ce.unstable_requestPaint, q = Ce.unstable_now, Xf = Ce.unstable_getCurrentPriorityLevel, wo = Ce.unstable_ImmediatePriority, ds = Ce.unstable_UserBlockingPriority, Gr = Ce.unstable_NormalPriority, Kf = Ce.unstable_LowPriority, ps = Ce.unstable_IdlePriority, vl = null, He = null;
function Gf(e) {
  if (He && typeof He.onCommitFiberRoot == "function") try {
    He.onCommitFiberRoot(vl, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var Fe = Math.clz32 ? Math.clz32 : qf, Zf = Math.log, Jf = Math.LN2;
function qf(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (Zf(e) / Jf | 0) | 0;
}
var gr = 64, wr = 4194304;
function Rn(e) {
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
function Zr(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0, l = e.suspendedLanes, i = e.pingedLanes, o = n & 268435455;
  if (o !== 0) {
    var u = o & ~l;
    u !== 0 ? r = Rn(u) : (i &= o, i !== 0 && (r = Rn(i)));
  } else o = n & ~l, o !== 0 ? r = Rn(o) : i !== 0 && (r = Rn(i));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & l) && (l = r & -r, i = t & -t, l >= i || l === 16 && (i & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - Fe(t), l = 1 << n, r |= e[n], t &= ~l;
  return r;
}
function bf(e, t) {
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
function ed(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, i = e.pendingLanes; 0 < i; ) {
    var o = 31 - Fe(i), u = 1 << o, a = l[o];
    a === -1 ? (!(u & n) || u & r) && (l[o] = bf(u, t)) : a <= t && (e.expiredLanes |= u), i &= ~u;
  }
}
function zi(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function ms() {
  var e = gr;
  return gr <<= 1, !(gr & 4194240) && (gr = 64), e;
}
function Al(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function ur(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - Fe(t), e[t] = n;
}
function td(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var l = 31 - Fe(n), i = 1 << l;
    t[l] = 0, r[l] = -1, e[l] = -1, n &= ~i;
  }
}
function So(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
    var r = 31 - Fe(n), l = 1 << r;
    l & t | e[r] & t && (e[r] |= t), n &= ~l;
  }
}
var B = 0;
function hs(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var vs, xo, ys, gs, ws, Ni = !1, Sr = [], ct = null, ft = null, dt = null, Yn = /* @__PURE__ */ new Map(), Xn = /* @__PURE__ */ new Map(), ot = [], nd = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function _u(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      ct = null;
      break;
    case "dragenter":
    case "dragleave":
      ft = null;
      break;
    case "mouseover":
    case "mouseout":
      dt = null;
      break;
    case "pointerover":
    case "pointerout":
      Yn.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      Xn.delete(t.pointerId);
  }
}
function _n(e, t, n, r, l, i) {
  return e === null || e.nativeEvent !== i ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: i, targetContainers: [l] }, t !== null && (t = sr(t), t !== null && xo(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, l !== null && t.indexOf(l) === -1 && t.push(l), e);
}
function rd(e, t, n, r, l) {
  switch (t) {
    case "focusin":
      return ct = _n(ct, e, t, n, r, l), !0;
    case "dragenter":
      return ft = _n(ft, e, t, n, r, l), !0;
    case "mouseover":
      return dt = _n(dt, e, t, n, r, l), !0;
    case "pointerover":
      var i = l.pointerId;
      return Yn.set(i, _n(Yn.get(i) || null, e, t, n, r, l)), !0;
    case "gotpointercapture":
      return i = l.pointerId, Xn.set(i, _n(Xn.get(i) || null, e, t, n, r, l)), !0;
  }
  return !1;
}
function Ss(e) {
  var t = Nt(e.target);
  if (t !== null) {
    var n = At(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = as(n), t !== null) {
          e.blockedOn = t, ws(e.priority, function() {
            ys(n);
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
function $r(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Ti(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      _i = r, n.target.dispatchEvent(r), _i = null;
    } else return t = sr(n), t !== null && xo(t), e.blockedOn = n, !1;
    t.shift();
  }
  return !0;
}
function Eu(e, t, n) {
  $r(e) && n.delete(t);
}
function ld() {
  Ni = !1, ct !== null && $r(ct) && (ct = null), ft !== null && $r(ft) && (ft = null), dt !== null && $r(dt) && (dt = null), Yn.forEach(Eu), Xn.forEach(Eu);
}
function En(e, t) {
  e.blockedOn === t && (e.blockedOn = null, Ni || (Ni = !0, Ce.unstable_scheduleCallback(Ce.unstable_NormalPriority, ld)));
}
function Kn(e) {
  function t(l) {
    return En(l, e);
  }
  if (0 < Sr.length) {
    En(Sr[0], e);
    for (var n = 1; n < Sr.length; n++) {
      var r = Sr[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (ct !== null && En(ct, e), ft !== null && En(ft, e), dt !== null && En(dt, e), Yn.forEach(t), Xn.forEach(t), n = 0; n < ot.length; n++) r = ot[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < ot.length && (n = ot[0], n.blockedOn === null); ) Ss(n), n.blockedOn === null && ot.shift();
}
var rn = nt.ReactCurrentBatchConfig, Jr = !0;
function id(e, t, n, r) {
  var l = B, i = rn.transition;
  rn.transition = null;
  try {
    B = 1, ko(e, t, n, r);
  } finally {
    B = l, rn.transition = i;
  }
}
function od(e, t, n, r) {
  var l = B, i = rn.transition;
  rn.transition = null;
  try {
    B = 4, ko(e, t, n, r);
  } finally {
    B = l, rn.transition = i;
  }
}
function ko(e, t, n, r) {
  if (Jr) {
    var l = Ti(e, t, n, r);
    if (l === null) Gl(e, t, r, qr, n), _u(e, r);
    else if (rd(l, e, t, n, r)) r.stopPropagation();
    else if (_u(e, r), t & 4 && -1 < nd.indexOf(e)) {
      for (; l !== null; ) {
        var i = sr(l);
        if (i !== null && vs(i), i = Ti(e, t, n, r), i === null && Gl(e, t, r, qr, n), i === l) break;
        l = i;
      }
      l !== null && r.stopPropagation();
    } else Gl(e, t, r, null, n);
  }
}
var qr = null;
function Ti(e, t, n, r) {
  if (qr = null, e = go(r), e = Nt(e), e !== null) if (t = At(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = as(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return qr = e, null;
}
function xs(e) {
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
      switch (Xf()) {
        case wo:
          return 1;
        case ds:
          return 4;
        case Gr:
        case Kf:
          return 16;
        case ps:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var at = null, _o = null, Or = null;
function ks() {
  if (Or) return Or;
  var e, t = _o, n = t.length, r, l = "value" in at ? at.value : at.textContent, i = l.length;
  for (e = 0; e < n && t[e] === l[e]; e++) ;
  var o = n - e;
  for (r = 1; r <= o && t[n - r] === l[i - r]; r++) ;
  return Or = l.slice(e, 1 < r ? 1 - r : void 0);
}
function Fr(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function xr() {
  return !0;
}
function Cu() {
  return !1;
}
function ze(e) {
  function t(n, r, l, i, o) {
    this._reactName = n, this._targetInst = l, this.type = r, this.nativeEvent = i, this.target = o, this.currentTarget = null;
    for (var u in e) e.hasOwnProperty(u) && (n = e[u], this[u] = n ? n(i) : i[u]);
    return this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1) ? xr : Cu, this.isPropagationStopped = Cu, this;
  }
  return Z(t.prototype, { preventDefault: function() {
    this.defaultPrevented = !0;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = xr);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = xr);
  }, persist: function() {
  }, isPersistent: xr }), t;
}
var vn = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, Eo = ze(vn), ar = Z({}, vn, { view: 0, detail: 0 }), ud = ze(ar), Ul, Bl, Cn, yl = Z({}, ar, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: Co, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== Cn && (Cn && e.type === "mousemove" ? (Ul = e.screenX - Cn.screenX, Bl = e.screenY - Cn.screenY) : Bl = Ul = 0, Cn = e), Ul);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : Bl;
} }), Pu = ze(yl), ad = Z({}, yl, { dataTransfer: 0 }), sd = ze(ad), cd = Z({}, ar, { relatedTarget: 0 }), Vl = ze(cd), fd = Z({}, vn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), dd = ze(fd), pd = Z({}, vn, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), md = ze(pd), hd = Z({}, vn, { data: 0 }), zu = ze(hd), vd = {
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
}, yd = {
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
}, gd = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function wd(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = gd[e]) ? !!t[e] : !1;
}
function Co() {
  return wd;
}
var Sd = Z({}, ar, { key: function(e) {
  if (e.key) {
    var t = vd[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = Fr(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? yd[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: Co, charCode: function(e) {
  return e.type === "keypress" ? Fr(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? Fr(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), xd = ze(Sd), kd = Z({}, yl, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Nu = ze(kd), _d = Z({}, ar, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: Co }), Ed = ze(_d), Cd = Z({}, vn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Pd = ze(Cd), zd = Z({}, yl, {
  deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  },
  deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), Nd = ze(zd), Td = [9, 13, 27, 32], Po = qe && "CompositionEvent" in window, $n = null;
qe && "documentMode" in document && ($n = document.documentMode);
var jd = qe && "TextEvent" in window && !$n, _s = qe && (!Po || $n && 8 < $n && 11 >= $n), Tu = " ", ju = !1;
function Es(e, t) {
  switch (e) {
    case "keyup":
      return Td.indexOf(t.keyCode) !== -1;
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
function Cs(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var Ht = !1;
function Ld(e, t) {
  switch (e) {
    case "compositionend":
      return Cs(t);
    case "keypress":
      return t.which !== 32 ? null : (ju = !0, Tu);
    case "textInput":
      return e = t.data, e === Tu && ju ? null : e;
    default:
      return null;
  }
}
function Rd(e, t) {
  if (Ht) return e === "compositionend" || !Po && Es(e, t) ? (e = ks(), Or = _o = at = null, Ht = !1, e) : null;
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
      return _s && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var Dd = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
function Lu(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!Dd[e.type] : t === "textarea";
}
function Ps(e, t, n, r) {
  rs(r), t = br(t, "onChange"), 0 < t.length && (n = new Eo("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var On = null, Gn = null;
function Md(e) {
  Os(e, 0);
}
function gl(e) {
  var t = Xt(e);
  if (Za(t)) return e;
}
function Id(e, t) {
  if (e === "change") return t;
}
var zs = !1;
if (qe) {
  var Wl;
  if (qe) {
    var Hl = "oninput" in document;
    if (!Hl) {
      var Ru = document.createElement("div");
      Ru.setAttribute("oninput", "return;"), Hl = typeof Ru.oninput == "function";
    }
    Wl = Hl;
  } else Wl = !1;
  zs = Wl && (!document.documentMode || 9 < document.documentMode);
}
function Du() {
  On && (On.detachEvent("onpropertychange", Ns), Gn = On = null);
}
function Ns(e) {
  if (e.propertyName === "value" && gl(Gn)) {
    var t = [];
    Ps(t, Gn, e, go(e)), us(Md, t);
  }
}
function $d(e, t, n) {
  e === "focusin" ? (Du(), On = t, Gn = n, On.attachEvent("onpropertychange", Ns)) : e === "focusout" && Du();
}
function Od(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return gl(Gn);
}
function Fd(e, t) {
  if (e === "click") return gl(t);
}
function Ad(e, t) {
  if (e === "input" || e === "change") return gl(t);
}
function Ud(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Ue = typeof Object.is == "function" ? Object.is : Ud;
function Zn(e, t) {
  if (Ue(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var l = n[r];
    if (!fi.call(t, l) || !Ue(e[l], t[l])) return !1;
  }
  return !0;
}
function Mu(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function Iu(e, t) {
  var n = Mu(e);
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
    n = Mu(n);
  }
}
function Ts(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Ts(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function js() {
  for (var e = window, t = Yr(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = Yr(e.document);
  }
  return t;
}
function zo(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
}
function Bd(e) {
  var t = js(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && Ts(n.ownerDocument.documentElement, n)) {
    if (r !== null && zo(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
      else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var l = n.textContent.length, i = Math.min(r.start, l);
        r = r.end === void 0 ? i : Math.min(r.end, l), !e.extend && i > r && (l = r, r = i, i = l), l = Iu(n, i);
        var o = Iu(
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
var Vd = qe && "documentMode" in document && 11 >= document.documentMode, Qt = null, ji = null, Fn = null, Li = !1;
function $u(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Li || Qt == null || Qt !== Yr(r) || (r = Qt, "selectionStart" in r && zo(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), Fn && Zn(Fn, r) || (Fn = r, r = br(ji, "onSelect"), 0 < r.length && (t = new Eo("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = Qt)));
}
function kr(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var Yt = { animationend: kr("Animation", "AnimationEnd"), animationiteration: kr("Animation", "AnimationIteration"), animationstart: kr("Animation", "AnimationStart"), transitionend: kr("Transition", "TransitionEnd") }, Ql = {}, Ls = {};
qe && (Ls = document.createElement("div").style, "AnimationEvent" in window || (delete Yt.animationend.animation, delete Yt.animationiteration.animation, delete Yt.animationstart.animation), "TransitionEvent" in window || delete Yt.transitionend.transition);
function wl(e) {
  if (Ql[e]) return Ql[e];
  if (!Yt[e]) return e;
  var t = Yt[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in Ls) return Ql[e] = t[n];
  return e;
}
var Rs = wl("animationend"), Ds = wl("animationiteration"), Ms = wl("animationstart"), Is = wl("transitionend"), $s = /* @__PURE__ */ new Map(), Ou = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function St(e, t) {
  $s.set(e, t), Ft(t, [e]);
}
for (var Yl = 0; Yl < Ou.length; Yl++) {
  var Xl = Ou[Yl], Wd = Xl.toLowerCase(), Hd = Xl[0].toUpperCase() + Xl.slice(1);
  St(Wd, "on" + Hd);
}
St(Rs, "onAnimationEnd");
St(Ds, "onAnimationIteration");
St(Ms, "onAnimationStart");
St("dblclick", "onDoubleClick");
St("focusin", "onFocus");
St("focusout", "onBlur");
St(Is, "onTransitionEnd");
un("onMouseEnter", ["mouseout", "mouseover"]);
un("onMouseLeave", ["mouseout", "mouseover"]);
un("onPointerEnter", ["pointerout", "pointerover"]);
un("onPointerLeave", ["pointerout", "pointerover"]);
Ft("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
Ft("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
Ft("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Ft("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
Ft("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
Ft("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var Dn = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Qd = new Set("cancel close invalid load scroll toggle".split(" ").concat(Dn));
function Fu(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, Wf(r, t, void 0, e), e.currentTarget = null;
}
function Os(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n], l = r.event;
    r = r.listeners;
    e: {
      var i = void 0;
      if (t) for (var o = r.length - 1; 0 <= o; o--) {
        var u = r[o], a = u.instance, s = u.currentTarget;
        if (u = u.listener, a !== i && l.isPropagationStopped()) break e;
        Fu(l, u, s), i = a;
      }
      else for (o = 0; o < r.length; o++) {
        if (u = r[o], a = u.instance, s = u.currentTarget, u = u.listener, a !== i && l.isPropagationStopped()) break e;
        Fu(l, u, s), i = a;
      }
    }
  }
  if (Kr) throw e = Pi, Kr = !1, Pi = null, e;
}
function Q(e, t) {
  var n = t[$i];
  n === void 0 && (n = t[$i] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (Fs(t, e, 2, !1), n.add(r));
}
function Kl(e, t, n) {
  var r = 0;
  t && (r |= 4), Fs(n, e, r, t);
}
var _r = "_reactListening" + Math.random().toString(36).slice(2);
function Jn(e) {
  if (!e[_r]) {
    e[_r] = !0, Qa.forEach(function(n) {
      n !== "selectionchange" && (Qd.has(n) || Kl(n, !1, e), Kl(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[_r] || (t[_r] = !0, Kl("selectionchange", !1, t));
  }
}
function Fs(e, t, n, r) {
  switch (xs(t)) {
    case 1:
      var l = id;
      break;
    case 4:
      l = od;
      break;
    default:
      l = ko;
  }
  n = l.bind(null, t, n, e), l = void 0, !Ci || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (l = !0), r ? l !== void 0 ? e.addEventListener(t, n, { capture: !0, passive: l }) : e.addEventListener(t, n, !0) : l !== void 0 ? e.addEventListener(t, n, { passive: l }) : e.addEventListener(t, n, !1);
}
function Gl(e, t, n, r, l) {
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
        if (o = Nt(u), o === null) return;
        if (a = o.tag, a === 5 || a === 6) {
          r = i = o;
          continue e;
        }
        u = u.parentNode;
      }
    }
    r = r.return;
  }
  us(function() {
    var s = i, c = go(n), p = [];
    e: {
      var d = $s.get(e);
      if (d !== void 0) {
        var g = Eo, w = e;
        switch (e) {
          case "keypress":
            if (Fr(n) === 0) break e;
          case "keydown":
          case "keyup":
            g = xd;
            break;
          case "focusin":
            w = "focus", g = Vl;
            break;
          case "focusout":
            w = "blur", g = Vl;
            break;
          case "beforeblur":
          case "afterblur":
            g = Vl;
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
            g = Pu;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            g = sd;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            g = Ed;
            break;
          case Rs:
          case Ds:
          case Ms:
            g = dd;
            break;
          case Is:
            g = Pd;
            break;
          case "scroll":
            g = ud;
            break;
          case "wheel":
            g = Nd;
            break;
          case "copy":
          case "cut":
          case "paste":
            g = md;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            g = Nu;
        }
        var k = (t & 4) !== 0, L = !k && e === "scroll", m = k ? d !== null ? d + "Capture" : null : d;
        k = [];
        for (var f = s, h; f !== null; ) {
          h = f;
          var v = h.stateNode;
          if (h.tag === 5 && v !== null && (h = v, m !== null && (v = Qn(f, m), v != null && k.push(qn(f, v, h)))), L) break;
          f = f.return;
        }
        0 < k.length && (d = new g(d, w, null, n, c), p.push({ event: d, listeners: k }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (d = e === "mouseover" || e === "pointerover", g = e === "mouseout" || e === "pointerout", d && n !== _i && (w = n.relatedTarget || n.fromElement) && (Nt(w) || w[be])) break e;
        if ((g || d) && (d = c.window === c ? c : (d = c.ownerDocument) ? d.defaultView || d.parentWindow : window, g ? (w = n.relatedTarget || n.toElement, g = s, w = w ? Nt(w) : null, w !== null && (L = At(w), w !== L || w.tag !== 5 && w.tag !== 6) && (w = null)) : (g = null, w = s), g !== w)) {
          if (k = Pu, v = "onMouseLeave", m = "onMouseEnter", f = "mouse", (e === "pointerout" || e === "pointerover") && (k = Nu, v = "onPointerLeave", m = "onPointerEnter", f = "pointer"), L = g == null ? d : Xt(g), h = w == null ? d : Xt(w), d = new k(v, f + "leave", g, n, c), d.target = L, d.relatedTarget = h, v = null, Nt(c) === s && (k = new k(m, f + "enter", w, n, c), k.target = h, k.relatedTarget = L, v = k), L = v, g && w) t: {
            for (k = g, m = w, f = 0, h = k; h; h = Bt(h)) f++;
            for (h = 0, v = m; v; v = Bt(v)) h++;
            for (; 0 < f - h; ) k = Bt(k), f--;
            for (; 0 < h - f; ) m = Bt(m), h--;
            for (; f--; ) {
              if (k === m || m !== null && k === m.alternate) break t;
              k = Bt(k), m = Bt(m);
            }
            k = null;
          }
          else k = null;
          g !== null && Au(p, d, g, k, !1), w !== null && L !== null && Au(p, L, w, k, !0);
        }
      }
      e: {
        if (d = s ? Xt(s) : window, g = d.nodeName && d.nodeName.toLowerCase(), g === "select" || g === "input" && d.type === "file") var _ = Id;
        else if (Lu(d)) if (zs) _ = Ad;
        else {
          _ = Od;
          var N = $d;
        }
        else (g = d.nodeName) && g.toLowerCase() === "input" && (d.type === "checkbox" || d.type === "radio") && (_ = Fd);
        if (_ && (_ = _(e, s))) {
          Ps(p, _, n, c);
          break e;
        }
        N && N(e, d, s), e === "focusout" && (N = d._wrapperState) && N.controlled && d.type === "number" && gi(d, "number", d.value);
      }
      switch (N = s ? Xt(s) : window, e) {
        case "focusin":
          (Lu(N) || N.contentEditable === "true") && (Qt = N, ji = s, Fn = null);
          break;
        case "focusout":
          Fn = ji = Qt = null;
          break;
        case "mousedown":
          Li = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Li = !1, $u(p, n, c);
          break;
        case "selectionchange":
          if (Vd) break;
        case "keydown":
        case "keyup":
          $u(p, n, c);
      }
      var C;
      if (Po) e: {
        switch (e) {
          case "compositionstart":
            var T = "onCompositionStart";
            break e;
          case "compositionend":
            T = "onCompositionEnd";
            break e;
          case "compositionupdate":
            T = "onCompositionUpdate";
            break e;
        }
        T = void 0;
      }
      else Ht ? Es(e, n) && (T = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (T = "onCompositionStart");
      T && (_s && n.locale !== "ko" && (Ht || T !== "onCompositionStart" ? T === "onCompositionEnd" && Ht && (C = ks()) : (at = c, _o = "value" in at ? at.value : at.textContent, Ht = !0)), N = br(s, T), 0 < N.length && (T = new zu(T, e, null, n, c), p.push({ event: T, listeners: N }), C ? T.data = C : (C = Cs(n), C !== null && (T.data = C)))), (C = jd ? Ld(e, n) : Rd(e, n)) && (s = br(s, "onBeforeInput"), 0 < s.length && (c = new zu("onBeforeInput", "beforeinput", null, n, c), p.push({ event: c, listeners: s }), c.data = C));
    }
    Os(p, t);
  });
}
function qn(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function br(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var l = e, i = l.stateNode;
    l.tag === 5 && i !== null && (l = i, i = Qn(e, n), i != null && r.unshift(qn(e, i, l)), i = Qn(e, t), i != null && r.push(qn(e, i, l))), e = e.return;
  }
  return r;
}
function Bt(e) {
  if (e === null) return null;
  do
    e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function Au(e, t, n, r, l) {
  for (var i = t._reactName, o = []; n !== null && n !== r; ) {
    var u = n, a = u.alternate, s = u.stateNode;
    if (a !== null && a === r) break;
    u.tag === 5 && s !== null && (u = s, l ? (a = Qn(n, i), a != null && o.unshift(qn(n, a, u))) : l || (a = Qn(n, i), a != null && o.push(qn(n, a, u)))), n = n.return;
  }
  o.length !== 0 && e.push({ event: t, listeners: o });
}
var Yd = /\r\n?/g, Xd = /\u0000|\uFFFD/g;
function Uu(e) {
  return (typeof e == "string" ? e : "" + e).replace(Yd, `
`).replace(Xd, "");
}
function Er(e, t, n) {
  if (t = Uu(t), Uu(e) !== t && n) throw Error(x(425));
}
function el() {
}
var Ri = null, Di = null;
function Mi(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var Ii = typeof setTimeout == "function" ? setTimeout : void 0, Kd = typeof clearTimeout == "function" ? clearTimeout : void 0, Bu = typeof Promise == "function" ? Promise : void 0, Gd = typeof queueMicrotask == "function" ? queueMicrotask : typeof Bu < "u" ? function(e) {
  return Bu.resolve(null).then(e).catch(Zd);
} : Ii;
function Zd(e) {
  setTimeout(function() {
    throw e;
  });
}
function Zl(e, t) {
  var n = t, r = 0;
  do {
    var l = n.nextSibling;
    if (e.removeChild(n), l && l.nodeType === 8) if (n = l.data, n === "/$") {
      if (r === 0) {
        e.removeChild(l), Kn(t);
        return;
      }
      r--;
    } else n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = l;
  } while (n);
  Kn(t);
}
function pt(e) {
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
function Vu(e) {
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
var yn = Math.random().toString(36).slice(2), We = "__reactFiber$" + yn, bn = "__reactProps$" + yn, be = "__reactContainer$" + yn, $i = "__reactEvents$" + yn, Jd = "__reactListeners$" + yn, qd = "__reactHandles$" + yn;
function Nt(e) {
  var t = e[We];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[be] || n[We]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = Vu(e); e !== null; ) {
        if (n = e[We]) return n;
        e = Vu(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function sr(e) {
  return e = e[We] || e[be], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function Xt(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(x(33));
}
function Sl(e) {
  return e[bn] || null;
}
var Oi = [], Kt = -1;
function xt(e) {
  return { current: e };
}
function Y(e) {
  0 > Kt || (e.current = Oi[Kt], Oi[Kt] = null, Kt--);
}
function H(e, t) {
  Kt++, Oi[Kt] = e.current, e.current = t;
}
var wt = {}, ce = xt(wt), ye = xt(!1), Dt = wt;
function an(e, t) {
  var n = e.type.contextTypes;
  if (!n) return wt;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var l = {}, i;
  for (i in n) l[i] = t[i];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = l), l;
}
function ge(e) {
  return e = e.childContextTypes, e != null;
}
function tl() {
  Y(ye), Y(ce);
}
function Wu(e, t, n) {
  if (ce.current !== wt) throw Error(x(168));
  H(ce, t), H(ye, n);
}
function As(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var l in r) if (!(l in t)) throw Error(x(108, $f(e) || "Unknown", l));
  return Z({}, n, r);
}
function nl(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || wt, Dt = ce.current, H(ce, e), H(ye, ye.current), !0;
}
function Hu(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(x(169));
  n ? (e = As(e, t, Dt), r.__reactInternalMemoizedMergedChildContext = e, Y(ye), Y(ce), H(ce, e)) : Y(ye), H(ye, n);
}
var Ke = null, xl = !1, Jl = !1;
function Us(e) {
  Ke === null ? Ke = [e] : Ke.push(e);
}
function bd(e) {
  xl = !0, Us(e);
}
function kt() {
  if (!Jl && Ke !== null) {
    Jl = !0;
    var e = 0, t = B;
    try {
      var n = Ke;
      for (B = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(!0);
        while (r !== null);
      }
      Ke = null, xl = !1;
    } catch (l) {
      throw Ke !== null && (Ke = Ke.slice(e + 1)), fs(wo, kt), l;
    } finally {
      B = t, Jl = !1;
    }
  }
  return null;
}
var Gt = [], Zt = 0, rl = null, ll = 0, Ne = [], Te = 0, Mt = null, Ge = 1, Ze = "";
function Pt(e, t) {
  Gt[Zt++] = ll, Gt[Zt++] = rl, rl = e, ll = t;
}
function Bs(e, t, n) {
  Ne[Te++] = Ge, Ne[Te++] = Ze, Ne[Te++] = Mt, Mt = e;
  var r = Ge;
  e = Ze;
  var l = 32 - Fe(r) - 1;
  r &= ~(1 << l), n += 1;
  var i = 32 - Fe(t) + l;
  if (30 < i) {
    var o = l - l % 5;
    i = (r & (1 << o) - 1).toString(32), r >>= o, l -= o, Ge = 1 << 32 - Fe(t) + l | n << l | r, Ze = i + e;
  } else Ge = 1 << i | n << l | r, Ze = e;
}
function No(e) {
  e.return !== null && (Pt(e, 1), Bs(e, 1, 0));
}
function To(e) {
  for (; e === rl; ) rl = Gt[--Zt], Gt[Zt] = null, ll = Gt[--Zt], Gt[Zt] = null;
  for (; e === Mt; ) Mt = Ne[--Te], Ne[Te] = null, Ze = Ne[--Te], Ne[Te] = null, Ge = Ne[--Te], Ne[Te] = null;
}
var Ee = null, _e = null, X = !1, Oe = null;
function Vs(e, t) {
  var n = je(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function Qu(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, Ee = e, _e = pt(t.firstChild), !0) : !1;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, Ee = e, _e = null, !0) : !1;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = Mt !== null ? { id: Ge, overflow: Ze } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = je(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, Ee = e, _e = null, !0) : !1;
    default:
      return !1;
  }
}
function Fi(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function Ai(e) {
  if (X) {
    var t = _e;
    if (t) {
      var n = t;
      if (!Qu(e, t)) {
        if (Fi(e)) throw Error(x(418));
        t = pt(n.nextSibling);
        var r = Ee;
        t && Qu(e, t) ? Vs(r, n) : (e.flags = e.flags & -4097 | 2, X = !1, Ee = e);
      }
    } else {
      if (Fi(e)) throw Error(x(418));
      e.flags = e.flags & -4097 | 2, X = !1, Ee = e;
    }
  }
}
function Yu(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  Ee = e;
}
function Cr(e) {
  if (e !== Ee) return !1;
  if (!X) return Yu(e), X = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !Mi(e.type, e.memoizedProps)), t && (t = _e)) {
    if (Fi(e)) throw Ws(), Error(x(418));
    for (; t; ) Vs(e, t), t = pt(t.nextSibling);
  }
  if (Yu(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(x(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              _e = pt(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      _e = null;
    }
  } else _e = Ee ? pt(e.stateNode.nextSibling) : null;
  return !0;
}
function Ws() {
  for (var e = _e; e; ) e = pt(e.nextSibling);
}
function sn() {
  _e = Ee = null, X = !1;
}
function jo(e) {
  Oe === null ? Oe = [e] : Oe.push(e);
}
var ep = nt.ReactCurrentBatchConfig;
function Pn(e, t, n) {
  if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
    if (n._owner) {
      if (n = n._owner, n) {
        if (n.tag !== 1) throw Error(x(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(x(147, e));
      var l = r, i = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === i ? t.ref : (t = function(o) {
        var u = l.refs;
        o === null ? delete u[i] : u[i] = o;
      }, t._stringRef = i, t);
    }
    if (typeof e != "string") throw Error(x(284));
    if (!n._owner) throw Error(x(290, e));
  }
  return e;
}
function Pr(e, t) {
  throw e = Object.prototype.toString.call(t), Error(x(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function Xu(e) {
  var t = e._init;
  return t(e._payload);
}
function Hs(e) {
  function t(m, f) {
    if (e) {
      var h = m.deletions;
      h === null ? (m.deletions = [f], m.flags |= 16) : h.push(f);
    }
  }
  function n(m, f) {
    if (!e) return null;
    for (; f !== null; ) t(m, f), f = f.sibling;
    return null;
  }
  function r(m, f) {
    for (m = /* @__PURE__ */ new Map(); f !== null; ) f.key !== null ? m.set(f.key, f) : m.set(f.index, f), f = f.sibling;
    return m;
  }
  function l(m, f) {
    return m = yt(m, f), m.index = 0, m.sibling = null, m;
  }
  function i(m, f, h) {
    return m.index = h, e ? (h = m.alternate, h !== null ? (h = h.index, h < f ? (m.flags |= 2, f) : h) : (m.flags |= 2, f)) : (m.flags |= 1048576, f);
  }
  function o(m) {
    return e && m.alternate === null && (m.flags |= 2), m;
  }
  function u(m, f, h, v) {
    return f === null || f.tag !== 6 ? (f = li(h, m.mode, v), f.return = m, f) : (f = l(f, h), f.return = m, f);
  }
  function a(m, f, h, v) {
    var _ = h.type;
    return _ === Wt ? c(m, f, h.props.children, v, h.key) : f !== null && (f.elementType === _ || typeof _ == "object" && _ !== null && _.$$typeof === lt && Xu(_) === f.type) ? (v = l(f, h.props), v.ref = Pn(m, f, h), v.return = m, v) : (v = Qr(h.type, h.key, h.props, null, m.mode, v), v.ref = Pn(m, f, h), v.return = m, v);
  }
  function s(m, f, h, v) {
    return f === null || f.tag !== 4 || f.stateNode.containerInfo !== h.containerInfo || f.stateNode.implementation !== h.implementation ? (f = ii(h, m.mode, v), f.return = m, f) : (f = l(f, h.children || []), f.return = m, f);
  }
  function c(m, f, h, v, _) {
    return f === null || f.tag !== 7 ? (f = Rt(h, m.mode, v, _), f.return = m, f) : (f = l(f, h), f.return = m, f);
  }
  function p(m, f, h) {
    if (typeof f == "string" && f !== "" || typeof f == "number") return f = li("" + f, m.mode, h), f.return = m, f;
    if (typeof f == "object" && f !== null) {
      switch (f.$$typeof) {
        case hr:
          return h = Qr(f.type, f.key, f.props, null, m.mode, h), h.ref = Pn(m, null, f), h.return = m, h;
        case Vt:
          return f = ii(f, m.mode, h), f.return = m, f;
        case lt:
          var v = f._init;
          return p(m, v(f._payload), h);
      }
      if (Ln(f) || xn(f)) return f = Rt(f, m.mode, h, null), f.return = m, f;
      Pr(m, f);
    }
    return null;
  }
  function d(m, f, h, v) {
    var _ = f !== null ? f.key : null;
    if (typeof h == "string" && h !== "" || typeof h == "number") return _ !== null ? null : u(m, f, "" + h, v);
    if (typeof h == "object" && h !== null) {
      switch (h.$$typeof) {
        case hr:
          return h.key === _ ? a(m, f, h, v) : null;
        case Vt:
          return h.key === _ ? s(m, f, h, v) : null;
        case lt:
          return _ = h._init, d(
            m,
            f,
            _(h._payload),
            v
          );
      }
      if (Ln(h) || xn(h)) return _ !== null ? null : c(m, f, h, v, null);
      Pr(m, h);
    }
    return null;
  }
  function g(m, f, h, v, _) {
    if (typeof v == "string" && v !== "" || typeof v == "number") return m = m.get(h) || null, u(f, m, "" + v, _);
    if (typeof v == "object" && v !== null) {
      switch (v.$$typeof) {
        case hr:
          return m = m.get(v.key === null ? h : v.key) || null, a(f, m, v, _);
        case Vt:
          return m = m.get(v.key === null ? h : v.key) || null, s(f, m, v, _);
        case lt:
          var N = v._init;
          return g(m, f, h, N(v._payload), _);
      }
      if (Ln(v) || xn(v)) return m = m.get(h) || null, c(f, m, v, _, null);
      Pr(f, v);
    }
    return null;
  }
  function w(m, f, h, v) {
    for (var _ = null, N = null, C = f, T = f = 0, W = null; C !== null && T < h.length; T++) {
      C.index > T ? (W = C, C = null) : W = C.sibling;
      var D = d(m, C, h[T], v);
      if (D === null) {
        C === null && (C = W);
        break;
      }
      e && C && D.alternate === null && t(m, C), f = i(D, f, T), N === null ? _ = D : N.sibling = D, N = D, C = W;
    }
    if (T === h.length) return n(m, C), X && Pt(m, T), _;
    if (C === null) {
      for (; T < h.length; T++) C = p(m, h[T], v), C !== null && (f = i(C, f, T), N === null ? _ = C : N.sibling = C, N = C);
      return X && Pt(m, T), _;
    }
    for (C = r(m, C); T < h.length; T++) W = g(C, m, T, h[T], v), W !== null && (e && W.alternate !== null && C.delete(W.key === null ? T : W.key), f = i(W, f, T), N === null ? _ = W : N.sibling = W, N = W);
    return e && C.forEach(function(Se) {
      return t(m, Se);
    }), X && Pt(m, T), _;
  }
  function k(m, f, h, v) {
    var _ = xn(h);
    if (typeof _ != "function") throw Error(x(150));
    if (h = _.call(h), h == null) throw Error(x(151));
    for (var N = _ = null, C = f, T = f = 0, W = null, D = h.next(); C !== null && !D.done; T++, D = h.next()) {
      C.index > T ? (W = C, C = null) : W = C.sibling;
      var Se = d(m, C, D.value, v);
      if (Se === null) {
        C === null && (C = W);
        break;
      }
      e && C && Se.alternate === null && t(m, C), f = i(Se, f, T), N === null ? _ = Se : N.sibling = Se, N = Se, C = W;
    }
    if (D.done) return n(
      m,
      C
    ), X && Pt(m, T), _;
    if (C === null) {
      for (; !D.done; T++, D = h.next()) D = p(m, D.value, v), D !== null && (f = i(D, f, T), N === null ? _ = D : N.sibling = D, N = D);
      return X && Pt(m, T), _;
    }
    for (C = r(m, C); !D.done; T++, D = h.next()) D = g(C, m, T, D.value, v), D !== null && (e && D.alternate !== null && C.delete(D.key === null ? T : D.key), f = i(D, f, T), N === null ? _ = D : N.sibling = D, N = D);
    return e && C.forEach(function(_t) {
      return t(m, _t);
    }), X && Pt(m, T), _;
  }
  function L(m, f, h, v) {
    if (typeof h == "object" && h !== null && h.type === Wt && h.key === null && (h = h.props.children), typeof h == "object" && h !== null) {
      switch (h.$$typeof) {
        case hr:
          e: {
            for (var _ = h.key, N = f; N !== null; ) {
              if (N.key === _) {
                if (_ = h.type, _ === Wt) {
                  if (N.tag === 7) {
                    n(m, N.sibling), f = l(N, h.props.children), f.return = m, m = f;
                    break e;
                  }
                } else if (N.elementType === _ || typeof _ == "object" && _ !== null && _.$$typeof === lt && Xu(_) === N.type) {
                  n(m, N.sibling), f = l(N, h.props), f.ref = Pn(m, N, h), f.return = m, m = f;
                  break e;
                }
                n(m, N);
                break;
              } else t(m, N);
              N = N.sibling;
            }
            h.type === Wt ? (f = Rt(h.props.children, m.mode, v, h.key), f.return = m, m = f) : (v = Qr(h.type, h.key, h.props, null, m.mode, v), v.ref = Pn(m, f, h), v.return = m, m = v);
          }
          return o(m);
        case Vt:
          e: {
            for (N = h.key; f !== null; ) {
              if (f.key === N) if (f.tag === 4 && f.stateNode.containerInfo === h.containerInfo && f.stateNode.implementation === h.implementation) {
                n(m, f.sibling), f = l(f, h.children || []), f.return = m, m = f;
                break e;
              } else {
                n(m, f);
                break;
              }
              else t(m, f);
              f = f.sibling;
            }
            f = ii(h, m.mode, v), f.return = m, m = f;
          }
          return o(m);
        case lt:
          return N = h._init, L(m, f, N(h._payload), v);
      }
      if (Ln(h)) return w(m, f, h, v);
      if (xn(h)) return k(m, f, h, v);
      Pr(m, h);
    }
    return typeof h == "string" && h !== "" || typeof h == "number" ? (h = "" + h, f !== null && f.tag === 6 ? (n(m, f.sibling), f = l(f, h), f.return = m, m = f) : (n(m, f), f = li(h, m.mode, v), f.return = m, m = f), o(m)) : n(m, f);
  }
  return L;
}
var cn = Hs(!0), Qs = Hs(!1), il = xt(null), ol = null, Jt = null, Lo = null;
function Ro() {
  Lo = Jt = ol = null;
}
function Do(e) {
  var t = il.current;
  Y(il), e._currentValue = t;
}
function Ui(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function ln(e, t) {
  ol = e, Lo = Jt = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (ve = !0), e.firstContext = null);
}
function Re(e) {
  var t = e._currentValue;
  if (Lo !== e) if (e = { context: e, memoizedValue: t, next: null }, Jt === null) {
    if (ol === null) throw Error(x(308));
    Jt = e, ol.dependencies = { lanes: 0, firstContext: e };
  } else Jt = Jt.next = e;
  return t;
}
var Tt = null;
function Mo(e) {
  Tt === null ? Tt = [e] : Tt.push(e);
}
function Ys(e, t, n, r) {
  var l = t.interleaved;
  return l === null ? (n.next = n, Mo(t)) : (n.next = l.next, l.next = n), t.interleaved = n, et(e, r);
}
function et(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
  return n.tag === 3 ? n.stateNode : null;
}
var it = !1;
function Io(e) {
  e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function Xs(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function Je(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function mt(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, F & 2) {
    var l = r.pending;
    return l === null ? t.next = t : (t.next = l.next, l.next = t), r.pending = t, et(e, n);
  }
  return l = r.interleaved, l === null ? (t.next = t, Mo(r)) : (t.next = l.next, l.next = t), r.interleaved = t, et(e, n);
}
function Ar(e, t, n) {
  if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, So(e, n);
  }
}
function Ku(e, t) {
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
function ul(e, t, n, r) {
  var l = e.updateQueue;
  it = !1;
  var i = l.firstBaseUpdate, o = l.lastBaseUpdate, u = l.shared.pending;
  if (u !== null) {
    l.shared.pending = null;
    var a = u, s = a.next;
    a.next = null, o === null ? i = s : o.next = s, o = a;
    var c = e.alternate;
    c !== null && (c = c.updateQueue, u = c.lastBaseUpdate, u !== o && (u === null ? c.firstBaseUpdate = s : u.next = s, c.lastBaseUpdate = a));
  }
  if (i !== null) {
    var p = l.baseState;
    o = 0, c = s = a = null, u = i;
    do {
      var d = u.lane, g = u.eventTime;
      if ((r & d) === d) {
        c !== null && (c = c.next = {
          eventTime: g,
          lane: 0,
          tag: u.tag,
          payload: u.payload,
          callback: u.callback,
          next: null
        });
        e: {
          var w = e, k = u;
          switch (d = t, g = n, k.tag) {
            case 1:
              if (w = k.payload, typeof w == "function") {
                p = w.call(g, p, d);
                break e;
              }
              p = w;
              break e;
            case 3:
              w.flags = w.flags & -65537 | 128;
            case 0:
              if (w = k.payload, d = typeof w == "function" ? w.call(g, p, d) : w, d == null) break e;
              p = Z({}, p, d);
              break e;
            case 2:
              it = !0;
          }
        }
        u.callback !== null && u.lane !== 0 && (e.flags |= 64, d = l.effects, d === null ? l.effects = [u] : d.push(u));
      } else g = { eventTime: g, lane: d, tag: u.tag, payload: u.payload, callback: u.callback, next: null }, c === null ? (s = c = g, a = p) : c = c.next = g, o |= d;
      if (u = u.next, u === null) {
        if (u = l.shared.pending, u === null) break;
        d = u, u = d.next, d.next = null, l.lastBaseUpdate = d, l.shared.pending = null;
      }
    } while (!0);
    if (c === null && (a = p), l.baseState = a, l.firstBaseUpdate = s, l.lastBaseUpdate = c, t = l.shared.interleaved, t !== null) {
      l = t;
      do
        o |= l.lane, l = l.next;
      while (l !== t);
    } else i === null && (l.shared.lanes = 0);
    $t |= o, e.lanes = o, e.memoizedState = p;
  }
}
function Gu(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], l = r.callback;
    if (l !== null) {
      if (r.callback = null, r = n, typeof l != "function") throw Error(x(191, l));
      l.call(r);
    }
  }
}
var cr = {}, Qe = xt(cr), er = xt(cr), tr = xt(cr);
function jt(e) {
  if (e === cr) throw Error(x(174));
  return e;
}
function $o(e, t) {
  switch (H(tr, t), H(er, e), H(Qe, cr), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Si(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Si(t, e);
  }
  Y(Qe), H(Qe, t);
}
function fn() {
  Y(Qe), Y(er), Y(tr);
}
function Ks(e) {
  jt(tr.current);
  var t = jt(Qe.current), n = Si(t, e.type);
  t !== n && (H(er, e), H(Qe, n));
}
function Oo(e) {
  er.current === e && (Y(Qe), Y(er));
}
var K = xt(0);
function al(e) {
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
var ql = [];
function Fo() {
  for (var e = 0; e < ql.length; e++) ql[e]._workInProgressVersionPrimary = null;
  ql.length = 0;
}
var Ur = nt.ReactCurrentDispatcher, bl = nt.ReactCurrentBatchConfig, It = 0, G = null, ee = null, ne = null, sl = !1, An = !1, nr = 0, tp = 0;
function ue() {
  throw Error(x(321));
}
function Ao(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!Ue(e[n], t[n])) return !1;
  return !0;
}
function Uo(e, t, n, r, l, i) {
  if (It = i, G = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Ur.current = e === null || e.memoizedState === null ? ip : op, e = n(r, l), An) {
    i = 0;
    do {
      if (An = !1, nr = 0, 25 <= i) throw Error(x(301));
      i += 1, ne = ee = null, t.updateQueue = null, Ur.current = up, e = n(r, l);
    } while (An);
  }
  if (Ur.current = cl, t = ee !== null && ee.next !== null, It = 0, ne = ee = G = null, sl = !1, t) throw Error(x(300));
  return e;
}
function Bo() {
  var e = nr !== 0;
  return nr = 0, e;
}
function Ve() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return ne === null ? G.memoizedState = ne = e : ne = ne.next = e, ne;
}
function De() {
  if (ee === null) {
    var e = G.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = ee.next;
  var t = ne === null ? G.memoizedState : ne.next;
  if (t !== null) ne = t, ee = e;
  else {
    if (e === null) throw Error(x(310));
    ee = e, e = { memoizedState: ee.memoizedState, baseState: ee.baseState, baseQueue: ee.baseQueue, queue: ee.queue, next: null }, ne === null ? G.memoizedState = ne = e : ne = ne.next = e;
  }
  return ne;
}
function rr(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function ei(e) {
  var t = De(), n = t.queue;
  if (n === null) throw Error(x(311));
  n.lastRenderedReducer = e;
  var r = ee, l = r.baseQueue, i = n.pending;
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
      if ((It & c) === c) a !== null && (a = a.next = { lane: 0, action: s.action, hasEagerState: s.hasEagerState, eagerState: s.eagerState, next: null }), r = s.hasEagerState ? s.eagerState : e(r, s.action);
      else {
        var p = {
          lane: c,
          action: s.action,
          hasEagerState: s.hasEagerState,
          eagerState: s.eagerState,
          next: null
        };
        a === null ? (u = a = p, o = r) : a = a.next = p, G.lanes |= c, $t |= c;
      }
      s = s.next;
    } while (s !== null && s !== i);
    a === null ? o = r : a.next = u, Ue(r, t.memoizedState) || (ve = !0), t.memoizedState = r, t.baseState = o, t.baseQueue = a, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    l = e;
    do
      i = l.lane, G.lanes |= i, $t |= i, l = l.next;
    while (l !== e);
  } else l === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function ti(e) {
  var t = De(), n = t.queue;
  if (n === null) throw Error(x(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch, l = n.pending, i = t.memoizedState;
  if (l !== null) {
    n.pending = null;
    var o = l = l.next;
    do
      i = e(i, o.action), o = o.next;
    while (o !== l);
    Ue(i, t.memoizedState) || (ve = !0), t.memoizedState = i, t.baseQueue === null && (t.baseState = i), n.lastRenderedState = i;
  }
  return [i, r];
}
function Gs() {
}
function Zs(e, t) {
  var n = G, r = De(), l = t(), i = !Ue(r.memoizedState, l);
  if (i && (r.memoizedState = l, ve = !0), r = r.queue, Vo(bs.bind(null, n, r, e), [e]), r.getSnapshot !== t || i || ne !== null && ne.memoizedState.tag & 1) {
    if (n.flags |= 2048, lr(9, qs.bind(null, n, r, l, t), void 0, null), re === null) throw Error(x(349));
    It & 30 || Js(n, t, l);
  }
  return l;
}
function Js(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = G.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, G.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function qs(e, t, n, r) {
  t.value = n, t.getSnapshot = r, ec(t) && tc(e);
}
function bs(e, t, n) {
  return n(function() {
    ec(t) && tc(e);
  });
}
function ec(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Ue(e, n);
  } catch {
    return !0;
  }
}
function tc(e) {
  var t = et(e, 1);
  t !== null && Ae(t, e, 1, -1);
}
function Zu(e) {
  var t = Ve();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: rr, lastRenderedState: e }, t.queue = e, e = e.dispatch = lp.bind(null, G, e), [t.memoizedState, e];
}
function lr(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = G.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, G.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function nc() {
  return De().memoizedState;
}
function Br(e, t, n, r) {
  var l = Ve();
  G.flags |= e, l.memoizedState = lr(1 | t, n, void 0, r === void 0 ? null : r);
}
function kl(e, t, n, r) {
  var l = De();
  r = r === void 0 ? null : r;
  var i = void 0;
  if (ee !== null) {
    var o = ee.memoizedState;
    if (i = o.destroy, r !== null && Ao(r, o.deps)) {
      l.memoizedState = lr(t, n, i, r);
      return;
    }
  }
  G.flags |= e, l.memoizedState = lr(1 | t, n, i, r);
}
function Ju(e, t) {
  return Br(8390656, 8, e, t);
}
function Vo(e, t) {
  return kl(2048, 8, e, t);
}
function rc(e, t) {
  return kl(4, 2, e, t);
}
function lc(e, t) {
  return kl(4, 4, e, t);
}
function ic(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function oc(e, t, n) {
  return n = n != null ? n.concat([e]) : null, kl(4, 4, ic.bind(null, t, e), n);
}
function Wo() {
}
function uc(e, t) {
  var n = De();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Ao(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function ac(e, t) {
  var n = De();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Ao(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function sc(e, t, n) {
  return It & 21 ? (Ue(n, t) || (n = ms(), G.lanes |= n, $t |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, ve = !0), e.memoizedState = n);
}
function np(e, t) {
  var n = B;
  B = n !== 0 && 4 > n ? n : 4, e(!0);
  var r = bl.transition;
  bl.transition = {};
  try {
    e(!1), t();
  } finally {
    B = n, bl.transition = r;
  }
}
function cc() {
  return De().memoizedState;
}
function rp(e, t, n) {
  var r = vt(e);
  if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, fc(e)) dc(t, n);
  else if (n = Ys(e, t, n, r), n !== null) {
    var l = de();
    Ae(n, e, r, l), pc(n, t, r);
  }
}
function lp(e, t, n) {
  var r = vt(e), l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (fc(e)) dc(t, l);
  else {
    var i = e.alternate;
    if (e.lanes === 0 && (i === null || i.lanes === 0) && (i = t.lastRenderedReducer, i !== null)) try {
      var o = t.lastRenderedState, u = i(o, n);
      if (l.hasEagerState = !0, l.eagerState = u, Ue(u, o)) {
        var a = t.interleaved;
        a === null ? (l.next = l, Mo(t)) : (l.next = a.next, a.next = l), t.interleaved = l;
        return;
      }
    } catch {
    } finally {
    }
    n = Ys(e, t, l, r), n !== null && (l = de(), Ae(n, e, r, l), pc(n, t, r));
  }
}
function fc(e) {
  var t = e.alternate;
  return e === G || t !== null && t === G;
}
function dc(e, t) {
  An = sl = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function pc(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, So(e, n);
  }
}
var cl = { readContext: Re, useCallback: ue, useContext: ue, useEffect: ue, useImperativeHandle: ue, useInsertionEffect: ue, useLayoutEffect: ue, useMemo: ue, useReducer: ue, useRef: ue, useState: ue, useDebugValue: ue, useDeferredValue: ue, useTransition: ue, useMutableSource: ue, useSyncExternalStore: ue, useId: ue, unstable_isNewReconciler: !1 }, ip = { readContext: Re, useCallback: function(e, t) {
  return Ve().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: Re, useEffect: Ju, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Br(
    4194308,
    4,
    ic.bind(null, t, e),
    n
  );
}, useLayoutEffect: function(e, t) {
  return Br(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return Br(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = Ve();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = Ve();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = rp.bind(null, G, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = Ve();
  return e = { current: e }, t.memoizedState = e;
}, useState: Zu, useDebugValue: Wo, useDeferredValue: function(e) {
  return Ve().memoizedState = e;
}, useTransition: function() {
  var e = Zu(!1), t = e[0];
  return e = np.bind(null, e[1]), Ve().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = G, l = Ve();
  if (X) {
    if (n === void 0) throw Error(x(407));
    n = n();
  } else {
    if (n = t(), re === null) throw Error(x(349));
    It & 30 || Js(r, t, n);
  }
  l.memoizedState = n;
  var i = { value: n, getSnapshot: t };
  return l.queue = i, Ju(bs.bind(
    null,
    r,
    i,
    e
  ), [e]), r.flags |= 2048, lr(9, qs.bind(null, r, i, n, t), void 0, null), n;
}, useId: function() {
  var e = Ve(), t = re.identifierPrefix;
  if (X) {
    var n = Ze, r = Ge;
    n = (r & ~(1 << 32 - Fe(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = nr++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = tp++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: !1 }, op = {
  readContext: Re,
  useCallback: uc,
  useContext: Re,
  useEffect: Vo,
  useImperativeHandle: oc,
  useInsertionEffect: rc,
  useLayoutEffect: lc,
  useMemo: ac,
  useReducer: ei,
  useRef: nc,
  useState: function() {
    return ei(rr);
  },
  useDebugValue: Wo,
  useDeferredValue: function(e) {
    var t = De();
    return sc(t, ee.memoizedState, e);
  },
  useTransition: function() {
    var e = ei(rr)[0], t = De().memoizedState;
    return [e, t];
  },
  useMutableSource: Gs,
  useSyncExternalStore: Zs,
  useId: cc,
  unstable_isNewReconciler: !1
}, up = { readContext: Re, useCallback: uc, useContext: Re, useEffect: Vo, useImperativeHandle: oc, useInsertionEffect: rc, useLayoutEffect: lc, useMemo: ac, useReducer: ti, useRef: nc, useState: function() {
  return ti(rr);
}, useDebugValue: Wo, useDeferredValue: function(e) {
  var t = De();
  return ee === null ? t.memoizedState = e : sc(t, ee.memoizedState, e);
}, useTransition: function() {
  var e = ti(rr)[0], t = De().memoizedState;
  return [e, t];
}, useMutableSource: Gs, useSyncExternalStore: Zs, useId: cc, unstable_isNewReconciler: !1 };
function Ie(e, t) {
  if (e && e.defaultProps) {
    t = Z({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function Bi(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : Z({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var _l = { isMounted: function(e) {
  return (e = e._reactInternals) ? At(e) === e : !1;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = de(), l = vt(e), i = Je(r, l);
  i.payload = t, n != null && (i.callback = n), t = mt(e, i, l), t !== null && (Ae(t, e, l, r), Ar(t, e, l));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = de(), l = vt(e), i = Je(r, l);
  i.tag = 1, i.payload = t, n != null && (i.callback = n), t = mt(e, i, l), t !== null && (Ae(t, e, l, r), Ar(t, e, l));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = de(), r = vt(e), l = Je(n, r);
  l.tag = 2, t != null && (l.callback = t), t = mt(e, l, r), t !== null && (Ae(t, e, r, n), Ar(t, e, r));
} };
function qu(e, t, n, r, l, i, o) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, i, o) : t.prototype && t.prototype.isPureReactComponent ? !Zn(n, r) || !Zn(l, i) : !0;
}
function mc(e, t, n) {
  var r = !1, l = wt, i = t.contextType;
  return typeof i == "object" && i !== null ? i = Re(i) : (l = ge(t) ? Dt : ce.current, r = t.contextTypes, i = (r = r != null) ? an(e, l) : wt), t = new t(n, i), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = _l, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = l, e.__reactInternalMemoizedMaskedChildContext = i), t;
}
function bu(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && _l.enqueueReplaceState(t, t.state, null);
}
function Vi(e, t, n, r) {
  var l = e.stateNode;
  l.props = n, l.state = e.memoizedState, l.refs = {}, Io(e);
  var i = t.contextType;
  typeof i == "object" && i !== null ? l.context = Re(i) : (i = ge(t) ? Dt : ce.current, l.context = an(e, i)), l.state = e.memoizedState, i = t.getDerivedStateFromProps, typeof i == "function" && (Bi(e, t, i, n), l.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof l.getSnapshotBeforeUpdate == "function" || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (t = l.state, typeof l.componentWillMount == "function" && l.componentWillMount(), typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount(), t !== l.state && _l.enqueueReplaceState(l, l.state, null), ul(e, n, l, r), l.state = e.memoizedState), typeof l.componentDidMount == "function" && (e.flags |= 4194308);
}
function dn(e, t) {
  try {
    var n = "", r = t;
    do
      n += If(r), r = r.return;
    while (r);
    var l = n;
  } catch (i) {
    l = `
Error generating stack: ` + i.message + `
` + i.stack;
  }
  return { value: e, source: t, stack: l, digest: null };
}
function ni(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function Wi(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function() {
      throw n;
    });
  }
}
var ap = typeof WeakMap == "function" ? WeakMap : Map;
function hc(e, t, n) {
  n = Je(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    dl || (dl = !0, bi = r), Wi(e, t);
  }, n;
}
function vc(e, t, n) {
  n = Je(-1, n), n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var l = t.value;
    n.payload = function() {
      return r(l);
    }, n.callback = function() {
      Wi(e, t);
    };
  }
  var i = e.stateNode;
  return i !== null && typeof i.componentDidCatch == "function" && (n.callback = function() {
    Wi(e, t), typeof r != "function" && (ht === null ? ht = /* @__PURE__ */ new Set([this]) : ht.add(this));
    var o = t.stack;
    this.componentDidCatch(t.value, { componentStack: o !== null ? o : "" });
  }), n;
}
function ea(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new ap();
    var l = /* @__PURE__ */ new Set();
    r.set(t, l);
  } else l = r.get(t), l === void 0 && (l = /* @__PURE__ */ new Set(), r.set(t, l));
  l.has(n) || (l.add(n), e = kp.bind(null, e, t, n), t.then(e, e));
}
function ta(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function na(e, t, n, r, l) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = l, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = Je(-1, 1), t.tag = 2, mt(n, t, 1))), n.lanes |= 1), e);
}
var sp = nt.ReactCurrentOwner, ve = !1;
function fe(e, t, n, r) {
  t.child = e === null ? Qs(t, null, n, r) : cn(t, e.child, n, r);
}
function ra(e, t, n, r, l) {
  n = n.render;
  var i = t.ref;
  return ln(t, l), r = Uo(e, t, n, r, i, l), n = Bo(), e !== null && !ve ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, tt(e, t, l)) : (X && n && No(t), t.flags |= 1, fe(e, t, r, l), t.child);
}
function la(e, t, n, r, l) {
  if (e === null) {
    var i = n.type;
    return typeof i == "function" && !Jo(i) && i.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = i, yc(e, t, i, r, l)) : (e = Qr(n.type, null, r, t, t.mode, l), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (i = e.child, !(e.lanes & l)) {
    var o = i.memoizedProps;
    if (n = n.compare, n = n !== null ? n : Zn, n(o, r) && e.ref === t.ref) return tt(e, t, l);
  }
  return t.flags |= 1, e = yt(i, r), e.ref = t.ref, e.return = t, t.child = e;
}
function yc(e, t, n, r, l) {
  if (e !== null) {
    var i = e.memoizedProps;
    if (Zn(i, r) && e.ref === t.ref) if (ve = !1, t.pendingProps = r = i, (e.lanes & l) !== 0) e.flags & 131072 && (ve = !0);
    else return t.lanes = e.lanes, tt(e, t, l);
  }
  return Hi(e, t, n, r, l);
}
function gc(e, t, n) {
  var r = t.pendingProps, l = r.children, i = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, H(bt, ke), ke |= n;
  else {
    if (!(n & 1073741824)) return e = i !== null ? i.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, H(bt, ke), ke |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = i !== null ? i.baseLanes : n, H(bt, ke), ke |= r;
  }
  else i !== null ? (r = i.baseLanes | n, t.memoizedState = null) : r = n, H(bt, ke), ke |= r;
  return fe(e, t, l, n), t.child;
}
function wc(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function Hi(e, t, n, r, l) {
  var i = ge(n) ? Dt : ce.current;
  return i = an(t, i), ln(t, l), n = Uo(e, t, n, r, i, l), r = Bo(), e !== null && !ve ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, tt(e, t, l)) : (X && r && No(t), t.flags |= 1, fe(e, t, n, l), t.child);
}
function ia(e, t, n, r, l) {
  if (ge(n)) {
    var i = !0;
    nl(t);
  } else i = !1;
  if (ln(t, l), t.stateNode === null) Vr(e, t), mc(t, n, r), Vi(t, n, r, l), r = !0;
  else if (e === null) {
    var o = t.stateNode, u = t.memoizedProps;
    o.props = u;
    var a = o.context, s = n.contextType;
    typeof s == "object" && s !== null ? s = Re(s) : (s = ge(n) ? Dt : ce.current, s = an(t, s));
    var c = n.getDerivedStateFromProps, p = typeof c == "function" || typeof o.getSnapshotBeforeUpdate == "function";
    p || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (u !== r || a !== s) && bu(t, o, r, s), it = !1;
    var d = t.memoizedState;
    o.state = d, ul(t, r, o, l), a = t.memoizedState, u !== r || d !== a || ye.current || it ? (typeof c == "function" && (Bi(t, n, c, r), a = t.memoizedState), (u = it || qu(t, n, u, r, d, a, s)) ? (p || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = a), o.props = r, o.state = a, o.context = s, r = u) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    o = t.stateNode, Xs(e, t), u = t.memoizedProps, s = t.type === t.elementType ? u : Ie(t.type, u), o.props = s, p = t.pendingProps, d = o.context, a = n.contextType, typeof a == "object" && a !== null ? a = Re(a) : (a = ge(n) ? Dt : ce.current, a = an(t, a));
    var g = n.getDerivedStateFromProps;
    (c = typeof g == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (u !== p || d !== a) && bu(t, o, r, a), it = !1, d = t.memoizedState, o.state = d, ul(t, r, o, l);
    var w = t.memoizedState;
    u !== p || d !== w || ye.current || it ? (typeof g == "function" && (Bi(t, n, g, r), w = t.memoizedState), (s = it || qu(t, n, s, r, d, w, a) || !1) ? (c || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, w, a), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, w, a)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || u === e.memoizedProps && d === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || u === e.memoizedProps && d === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = w), o.props = r, o.state = w, o.context = a, r = s) : (typeof o.componentDidUpdate != "function" || u === e.memoizedProps && d === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || u === e.memoizedProps && d === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return Qi(e, t, n, r, i, l);
}
function Qi(e, t, n, r, l, i) {
  wc(e, t);
  var o = (t.flags & 128) !== 0;
  if (!r && !o) return l && Hu(t, n, !1), tt(e, t, i);
  r = t.stateNode, sp.current = t;
  var u = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && o ? (t.child = cn(t, e.child, null, i), t.child = cn(t, null, u, i)) : fe(e, t, u, i), t.memoizedState = r.state, l && Hu(t, n, !0), t.child;
}
function Sc(e) {
  var t = e.stateNode;
  t.pendingContext ? Wu(e, t.pendingContext, t.pendingContext !== t.context) : t.context && Wu(e, t.context, !1), $o(e, t.containerInfo);
}
function oa(e, t, n, r, l) {
  return sn(), jo(l), t.flags |= 256, fe(e, t, n, r), t.child;
}
var Yi = { dehydrated: null, treeContext: null, retryLane: 0 };
function Xi(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function xc(e, t, n) {
  var r = t.pendingProps, l = K.current, i = !1, o = (t.flags & 128) !== 0, u;
  if ((u = o) || (u = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0), u ? (i = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (l |= 1), H(K, l & 1), e === null)
    return Ai(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (o = r.children, e = r.fallback, i ? (r = t.mode, i = t.child, o = { mode: "hidden", children: o }, !(r & 1) && i !== null ? (i.childLanes = 0, i.pendingProps = o) : i = Pl(o, r, 0, null), e = Rt(e, r, n, null), i.return = t, e.return = t, i.sibling = e, t.child = i, t.child.memoizedState = Xi(n), t.memoizedState = Yi, e) : Ho(t, o));
  if (l = e.memoizedState, l !== null && (u = l.dehydrated, u !== null)) return cp(e, t, o, r, u, l, n);
  if (i) {
    i = r.fallback, o = t.mode, l = e.child, u = l.sibling;
    var a = { mode: "hidden", children: r.children };
    return !(o & 1) && t.child !== l ? (r = t.child, r.childLanes = 0, r.pendingProps = a, t.deletions = null) : (r = yt(l, a), r.subtreeFlags = l.subtreeFlags & 14680064), u !== null ? i = yt(u, i) : (i = Rt(i, o, n, null), i.flags |= 2), i.return = t, r.return = t, r.sibling = i, t.child = r, r = i, i = t.child, o = e.child.memoizedState, o = o === null ? Xi(n) : { baseLanes: o.baseLanes | n, cachePool: null, transitions: o.transitions }, i.memoizedState = o, i.childLanes = e.childLanes & ~n, t.memoizedState = Yi, r;
  }
  return i = e.child, e = i.sibling, r = yt(i, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function Ho(e, t) {
  return t = Pl({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function zr(e, t, n, r) {
  return r !== null && jo(r), cn(t, e.child, null, n), e = Ho(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function cp(e, t, n, r, l, i, o) {
  if (n)
    return t.flags & 256 ? (t.flags &= -257, r = ni(Error(x(422))), zr(e, t, o, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (i = r.fallback, l = t.mode, r = Pl({ mode: "visible", children: r.children }, l, 0, null), i = Rt(i, l, o, null), i.flags |= 2, r.return = t, i.return = t, r.sibling = i, t.child = r, t.mode & 1 && cn(t, e.child, null, o), t.child.memoizedState = Xi(o), t.memoizedState = Yi, i);
  if (!(t.mode & 1)) return zr(e, t, o, null);
  if (l.data === "$!") {
    if (r = l.nextSibling && l.nextSibling.dataset, r) var u = r.dgst;
    return r = u, i = Error(x(419)), r = ni(i, r, void 0), zr(e, t, o, r);
  }
  if (u = (o & e.childLanes) !== 0, ve || u) {
    if (r = re, r !== null) {
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
      l = l & (r.suspendedLanes | o) ? 0 : l, l !== 0 && l !== i.retryLane && (i.retryLane = l, et(e, l), Ae(r, e, l, -1));
    }
    return Zo(), r = ni(Error(x(421))), zr(e, t, o, r);
  }
  return l.data === "$?" ? (t.flags |= 128, t.child = e.child, t = _p.bind(null, e), l._reactRetry = t, null) : (e = i.treeContext, _e = pt(l.nextSibling), Ee = t, X = !0, Oe = null, e !== null && (Ne[Te++] = Ge, Ne[Te++] = Ze, Ne[Te++] = Mt, Ge = e.id, Ze = e.overflow, Mt = t), t = Ho(t, r.children), t.flags |= 4096, t);
}
function ua(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), Ui(e.return, t, n);
}
function ri(e, t, n, r, l) {
  var i = e.memoizedState;
  i === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: l } : (i.isBackwards = t, i.rendering = null, i.renderingStartTime = 0, i.last = r, i.tail = n, i.tailMode = l);
}
function kc(e, t, n) {
  var r = t.pendingProps, l = r.revealOrder, i = r.tail;
  if (fe(e, t, r.children, n), r = K.current, r & 2) r = r & 1 | 2, t.flags |= 128;
  else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && ua(e, n, t);
      else if (e.tag === 19) ua(e, n, t);
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
  if (H(K, r), !(t.mode & 1)) t.memoizedState = null;
  else switch (l) {
    case "forwards":
      for (n = t.child, l = null; n !== null; ) e = n.alternate, e !== null && al(e) === null && (l = n), n = n.sibling;
      n = l, n === null ? (l = t.child, t.child = null) : (l = n.sibling, n.sibling = null), ri(t, !1, l, n, i);
      break;
    case "backwards":
      for (n = null, l = t.child, t.child = null; l !== null; ) {
        if (e = l.alternate, e !== null && al(e) === null) {
          t.child = l;
          break;
        }
        e = l.sibling, l.sibling = n, n = l, l = e;
      }
      ri(t, !0, n, null, i);
      break;
    case "together":
      ri(t, !1, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function Vr(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
}
function tt(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), $t |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(x(153));
  if (t.child !== null) {
    for (e = t.child, n = yt(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = yt(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function fp(e, t, n) {
  switch (t.tag) {
    case 3:
      Sc(t), sn();
      break;
    case 5:
      Ks(t);
      break;
    case 1:
      ge(t.type) && nl(t);
      break;
    case 4:
      $o(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, l = t.memoizedProps.value;
      H(il, r._currentValue), r._currentValue = l;
      break;
    case 13:
      if (r = t.memoizedState, r !== null)
        return r.dehydrated !== null ? (H(K, K.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? xc(e, t, n) : (H(K, K.current & 1), e = tt(e, t, n), e !== null ? e.sibling : null);
      H(K, K.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return kc(e, t, n);
        t.flags |= 128;
      }
      if (l = t.memoizedState, l !== null && (l.rendering = null, l.tail = null, l.lastEffect = null), H(K, K.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, gc(e, t, n);
  }
  return tt(e, t, n);
}
var _c, Ki, Ec, Cc;
_c = function(e, t) {
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
Ki = function() {
};
Ec = function(e, t, n, r) {
  var l = e.memoizedProps;
  if (l !== r) {
    e = t.stateNode, jt(Qe.current);
    var i = null;
    switch (n) {
      case "input":
        l = vi(e, l), r = vi(e, r), i = [];
        break;
      case "select":
        l = Z({}, l, { value: void 0 }), r = Z({}, r, { value: void 0 }), i = [];
        break;
      case "textarea":
        l = wi(e, l), r = wi(e, r), i = [];
        break;
      default:
        typeof l.onClick != "function" && typeof r.onClick == "function" && (e.onclick = el);
    }
    xi(n, r);
    var o;
    n = null;
    for (s in l) if (!r.hasOwnProperty(s) && l.hasOwnProperty(s) && l[s] != null) if (s === "style") {
      var u = l[s];
      for (o in u) u.hasOwnProperty(o) && (n || (n = {}), n[o] = "");
    } else s !== "dangerouslySetInnerHTML" && s !== "children" && s !== "suppressContentEditableWarning" && s !== "suppressHydrationWarning" && s !== "autoFocus" && (Wn.hasOwnProperty(s) ? i || (i = []) : (i = i || []).push(s, null));
    for (s in r) {
      var a = r[s];
      if (u = l != null ? l[s] : void 0, r.hasOwnProperty(s) && a !== u && (a != null || u != null)) if (s === "style") if (u) {
        for (o in u) !u.hasOwnProperty(o) || a && a.hasOwnProperty(o) || (n || (n = {}), n[o] = "");
        for (o in a) a.hasOwnProperty(o) && u[o] !== a[o] && (n || (n = {}), n[o] = a[o]);
      } else n || (i || (i = []), i.push(
        s,
        n
      )), n = a;
      else s === "dangerouslySetInnerHTML" ? (a = a ? a.__html : void 0, u = u ? u.__html : void 0, a != null && u !== a && (i = i || []).push(s, a)) : s === "children" ? typeof a != "string" && typeof a != "number" || (i = i || []).push(s, "" + a) : s !== "suppressContentEditableWarning" && s !== "suppressHydrationWarning" && (Wn.hasOwnProperty(s) ? (a != null && s === "onScroll" && Q("scroll", e), i || u === a || (i = [])) : (i = i || []).push(s, a));
    }
    n && (i = i || []).push("style", n);
    var s = i;
    (t.updateQueue = s) && (t.flags |= 4);
  }
};
Cc = function(e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function zn(e, t) {
  if (!X) switch (e.tailMode) {
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
function ae(e) {
  var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
  if (t) for (var l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags & 14680064, r |= l.flags & 14680064, l.return = e, l = l.sibling;
  else for (l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags, r |= l.flags, l.return = e, l = l.sibling;
  return e.subtreeFlags |= r, e.childLanes = n, t;
}
function dp(e, t, n) {
  var r = t.pendingProps;
  switch (To(t), t.tag) {
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
      return ae(t), null;
    case 1:
      return ge(t.type) && tl(), ae(t), null;
    case 3:
      return r = t.stateNode, fn(), Y(ye), Y(ce), Fo(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (Cr(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Oe !== null && (no(Oe), Oe = null))), Ki(e, t), ae(t), null;
    case 5:
      Oo(t);
      var l = jt(tr.current);
      if (n = t.type, e !== null && t.stateNode != null) Ec(e, t, n, r, l), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(x(166));
          return ae(t), null;
        }
        if (e = jt(Qe.current), Cr(t)) {
          r = t.stateNode, n = t.type;
          var i = t.memoizedProps;
          switch (r[We] = t, r[bn] = i, e = (t.mode & 1) !== 0, n) {
            case "dialog":
              Q("cancel", r), Q("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              Q("load", r);
              break;
            case "video":
            case "audio":
              for (l = 0; l < Dn.length; l++) Q(Dn[l], r);
              break;
            case "source":
              Q("error", r);
              break;
            case "img":
            case "image":
            case "link":
              Q(
                "error",
                r
              ), Q("load", r);
              break;
            case "details":
              Q("toggle", r);
              break;
            case "input":
              vu(r, i), Q("invalid", r);
              break;
            case "select":
              r._wrapperState = { wasMultiple: !!i.multiple }, Q("invalid", r);
              break;
            case "textarea":
              gu(r, i), Q("invalid", r);
          }
          xi(n, i), l = null;
          for (var o in i) if (i.hasOwnProperty(o)) {
            var u = i[o];
            o === "children" ? typeof u == "string" ? r.textContent !== u && (i.suppressHydrationWarning !== !0 && Er(r.textContent, u, e), l = ["children", u]) : typeof u == "number" && r.textContent !== "" + u && (i.suppressHydrationWarning !== !0 && Er(
              r.textContent,
              u,
              e
            ), l = ["children", "" + u]) : Wn.hasOwnProperty(o) && u != null && o === "onScroll" && Q("scroll", r);
          }
          switch (n) {
            case "input":
              vr(r), yu(r, i, !0);
              break;
            case "textarea":
              vr(r), wu(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof i.onClick == "function" && (r.onclick = el);
          }
          r = l, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          o = l.nodeType === 9 ? l : l.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = ba(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = o.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = o.createElement(n, { is: r.is }) : (e = o.createElement(n), n === "select" && (o = e, r.multiple ? o.multiple = !0 : r.size && (o.size = r.size))) : e = o.createElementNS(e, n), e[We] = t, e[bn] = r, _c(e, t, !1, !1), t.stateNode = e;
          e: {
            switch (o = ki(n, r), n) {
              case "dialog":
                Q("cancel", e), Q("close", e), l = r;
                break;
              case "iframe":
              case "object":
              case "embed":
                Q("load", e), l = r;
                break;
              case "video":
              case "audio":
                for (l = 0; l < Dn.length; l++) Q(Dn[l], e);
                l = r;
                break;
              case "source":
                Q("error", e), l = r;
                break;
              case "img":
              case "image":
              case "link":
                Q(
                  "error",
                  e
                ), Q("load", e), l = r;
                break;
              case "details":
                Q("toggle", e), l = r;
                break;
              case "input":
                vu(e, r), l = vi(e, r), Q("invalid", e);
                break;
              case "option":
                l = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, l = Z({}, r, { value: void 0 }), Q("invalid", e);
                break;
              case "textarea":
                gu(e, r), l = wi(e, r), Q("invalid", e);
                break;
              default:
                l = r;
            }
            xi(n, l), u = l;
            for (i in u) if (u.hasOwnProperty(i)) {
              var a = u[i];
              i === "style" ? ns(e, a) : i === "dangerouslySetInnerHTML" ? (a = a ? a.__html : void 0, a != null && es(e, a)) : i === "children" ? typeof a == "string" ? (n !== "textarea" || a !== "") && Hn(e, a) : typeof a == "number" && Hn(e, "" + a) : i !== "suppressContentEditableWarning" && i !== "suppressHydrationWarning" && i !== "autoFocus" && (Wn.hasOwnProperty(i) ? a != null && i === "onScroll" && Q("scroll", e) : a != null && mo(e, i, a, o));
            }
            switch (n) {
              case "input":
                vr(e), yu(e, r, !1);
                break;
              case "textarea":
                vr(e), wu(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + gt(r.value));
                break;
              case "select":
                e.multiple = !!r.multiple, i = r.value, i != null ? en(e, !!r.multiple, i, !1) : r.defaultValue != null && en(
                  e,
                  !!r.multiple,
                  r.defaultValue,
                  !0
                );
                break;
              default:
                typeof l.onClick == "function" && (e.onclick = el);
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
      return ae(t), null;
    case 6:
      if (e && t.stateNode != null) Cc(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(x(166));
        if (n = jt(tr.current), jt(Qe.current), Cr(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[We] = t, (i = r.nodeValue !== n) && (e = Ee, e !== null)) switch (e.tag) {
            case 3:
              Er(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && Er(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          i && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[We] = t, t.stateNode = r;
      }
      return ae(t), null;
    case 13:
      if (Y(K), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (X && _e !== null && t.mode & 1 && !(t.flags & 128)) Ws(), sn(), t.flags |= 98560, i = !1;
        else if (i = Cr(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!i) throw Error(x(318));
            if (i = t.memoizedState, i = i !== null ? i.dehydrated : null, !i) throw Error(x(317));
            i[We] = t;
          } else sn(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          ae(t), i = !1;
        } else Oe !== null && (no(Oe), Oe = null), i = !0;
        if (!i) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || K.current & 1 ? te === 0 && (te = 3) : Zo())), t.updateQueue !== null && (t.flags |= 4), ae(t), null);
    case 4:
      return fn(), Ki(e, t), e === null && Jn(t.stateNode.containerInfo), ae(t), null;
    case 10:
      return Do(t.type._context), ae(t), null;
    case 17:
      return ge(t.type) && tl(), ae(t), null;
    case 19:
      if (Y(K), i = t.memoizedState, i === null) return ae(t), null;
      if (r = (t.flags & 128) !== 0, o = i.rendering, o === null) if (r) zn(i, !1);
      else {
        if (te !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (o = al(e), o !== null) {
            for (t.flags |= 128, zn(i, !1), r = o.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) i = n, e = r, i.flags &= 14680066, o = i.alternate, o === null ? (i.childLanes = 0, i.lanes = e, i.child = null, i.subtreeFlags = 0, i.memoizedProps = null, i.memoizedState = null, i.updateQueue = null, i.dependencies = null, i.stateNode = null) : (i.childLanes = o.childLanes, i.lanes = o.lanes, i.child = o.child, i.subtreeFlags = 0, i.deletions = null, i.memoizedProps = o.memoizedProps, i.memoizedState = o.memoizedState, i.updateQueue = o.updateQueue, i.type = o.type, e = o.dependencies, i.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return H(K, K.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        i.tail !== null && q() > pn && (t.flags |= 128, r = !0, zn(i, !1), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = al(o), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), zn(i, !0), i.tail === null && i.tailMode === "hidden" && !o.alternate && !X) return ae(t), null;
        } else 2 * q() - i.renderingStartTime > pn && n !== 1073741824 && (t.flags |= 128, r = !0, zn(i, !1), t.lanes = 4194304);
        i.isBackwards ? (o.sibling = t.child, t.child = o) : (n = i.last, n !== null ? n.sibling = o : t.child = o, i.last = o);
      }
      return i.tail !== null ? (t = i.tail, i.rendering = t, i.tail = t.sibling, i.renderingStartTime = q(), t.sibling = null, n = K.current, H(K, r ? n & 1 | 2 : n & 1), t) : (ae(t), null);
    case 22:
    case 23:
      return Go(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? ke & 1073741824 && (ae(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : ae(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(x(156, t.tag));
}
function pp(e, t) {
  switch (To(t), t.tag) {
    case 1:
      return ge(t.type) && tl(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return fn(), Y(ye), Y(ce), Fo(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return Oo(t), null;
    case 13:
      if (Y(K), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(x(340));
        sn();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return Y(K), null;
    case 4:
      return fn(), null;
    case 10:
      return Do(t.type._context), null;
    case 22:
    case 23:
      return Go(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var Nr = !1, se = !1, mp = typeof WeakSet == "function" ? WeakSet : Set, z = null;
function qt(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    J(e, t, r);
  }
  else n.current = null;
}
function Gi(e, t, n) {
  try {
    n();
  } catch (r) {
    J(e, t, r);
  }
}
var aa = !1;
function hp(e, t) {
  if (Ri = Jr, e = js(), zo(e)) {
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
        var o = 0, u = -1, a = -1, s = 0, c = 0, p = e, d = null;
        t: for (; ; ) {
          for (var g; p !== n || l !== 0 && p.nodeType !== 3 || (u = o + l), p !== i || r !== 0 && p.nodeType !== 3 || (a = o + r), p.nodeType === 3 && (o += p.nodeValue.length), (g = p.firstChild) !== null; )
            d = p, p = g;
          for (; ; ) {
            if (p === e) break t;
            if (d === n && ++s === l && (u = o), d === i && ++c === r && (a = o), (g = p.nextSibling) !== null) break;
            p = d, d = p.parentNode;
          }
          p = g;
        }
        n = u === -1 || a === -1 ? null : { start: u, end: a };
      } else n = null;
    }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (Di = { focusedElem: e, selectionRange: n }, Jr = !1, z = t; z !== null; ) if (t = z, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, z = e;
  else for (; z !== null; ) {
    t = z;
    try {
      var w = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (w !== null) {
            var k = w.memoizedProps, L = w.memoizedState, m = t.stateNode, f = m.getSnapshotBeforeUpdate(t.elementType === t.type ? k : Ie(t.type, k), L);
            m.__reactInternalSnapshotBeforeUpdate = f;
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
          throw Error(x(163));
      }
    } catch (v) {
      J(t, t.return, v);
    }
    if (e = t.sibling, e !== null) {
      e.return = t.return, z = e;
      break;
    }
    z = t.return;
  }
  return w = aa, aa = !1, w;
}
function Un(e, t, n) {
  var r = t.updateQueue;
  if (r = r !== null ? r.lastEffect : null, r !== null) {
    var l = r = r.next;
    do {
      if ((l.tag & e) === e) {
        var i = l.destroy;
        l.destroy = void 0, i !== void 0 && Gi(t, n, i);
      }
      l = l.next;
    } while (l !== r);
  }
}
function El(e, t) {
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
function Zi(e) {
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
function Pc(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, Pc(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[We], delete t[bn], delete t[$i], delete t[Jd], delete t[qd])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function zc(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function sa(e) {
  e: for (; ; ) {
    for (; e.sibling === null; ) {
      if (e.return === null || zc(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      e.child.return = e, e = e.child;
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function Ji(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = el));
  else if (r !== 4 && (e = e.child, e !== null)) for (Ji(e, t, n), e = e.sibling; e !== null; ) Ji(e, t, n), e = e.sibling;
}
function qi(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child, e !== null)) for (qi(e, t, n), e = e.sibling; e !== null; ) qi(e, t, n), e = e.sibling;
}
var le = null, $e = !1;
function rt(e, t, n) {
  for (n = n.child; n !== null; ) Nc(e, t, n), n = n.sibling;
}
function Nc(e, t, n) {
  if (He && typeof He.onCommitFiberUnmount == "function") try {
    He.onCommitFiberUnmount(vl, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      se || qt(n, t);
    case 6:
      var r = le, l = $e;
      le = null, rt(e, t, n), le = r, $e = l, le !== null && ($e ? (e = le, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : le.removeChild(n.stateNode));
      break;
    case 18:
      le !== null && ($e ? (e = le, n = n.stateNode, e.nodeType === 8 ? Zl(e.parentNode, n) : e.nodeType === 1 && Zl(e, n), Kn(e)) : Zl(le, n.stateNode));
      break;
    case 4:
      r = le, l = $e, le = n.stateNode.containerInfo, $e = !0, rt(e, t, n), le = r, $e = l;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!se && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        l = r = r.next;
        do {
          var i = l, o = i.destroy;
          i = i.tag, o !== void 0 && (i & 2 || i & 4) && Gi(n, t, o), l = l.next;
        } while (l !== r);
      }
      rt(e, t, n);
      break;
    case 1:
      if (!se && (qt(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
        r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
      } catch (u) {
        J(n, t, u);
      }
      rt(e, t, n);
      break;
    case 21:
      rt(e, t, n);
      break;
    case 22:
      n.mode & 1 ? (se = (r = se) || n.memoizedState !== null, rt(e, t, n), se = r) : rt(e, t, n);
      break;
    default:
      rt(e, t, n);
  }
}
function ca(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new mp()), t.forEach(function(r) {
      var l = Ep.bind(null, e, r);
      n.has(r) || (n.add(r), r.then(l, l));
    });
  }
}
function Me(e, t) {
  var n = t.deletions;
  if (n !== null) for (var r = 0; r < n.length; r++) {
    var l = n[r];
    try {
      var i = e, o = t, u = o;
      e: for (; u !== null; ) {
        switch (u.tag) {
          case 5:
            le = u.stateNode, $e = !1;
            break e;
          case 3:
            le = u.stateNode.containerInfo, $e = !0;
            break e;
          case 4:
            le = u.stateNode.containerInfo, $e = !0;
            break e;
        }
        u = u.return;
      }
      if (le === null) throw Error(x(160));
      Nc(i, o, l), le = null, $e = !1;
      var a = l.alternate;
      a !== null && (a.return = null), l.return = null;
    } catch (s) {
      J(l, t, s);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) Tc(t, e), t = t.sibling;
}
function Tc(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (Me(t, e), Be(e), r & 4) {
        try {
          Un(3, e, e.return), El(3, e);
        } catch (k) {
          J(e, e.return, k);
        }
        try {
          Un(5, e, e.return);
        } catch (k) {
          J(e, e.return, k);
        }
      }
      break;
    case 1:
      Me(t, e), Be(e), r & 512 && n !== null && qt(n, n.return);
      break;
    case 5:
      if (Me(t, e), Be(e), r & 512 && n !== null && qt(n, n.return), e.flags & 32) {
        var l = e.stateNode;
        try {
          Hn(l, "");
        } catch (k) {
          J(e, e.return, k);
        }
      }
      if (r & 4 && (l = e.stateNode, l != null)) {
        var i = e.memoizedProps, o = n !== null ? n.memoizedProps : i, u = e.type, a = e.updateQueue;
        if (e.updateQueue = null, a !== null) try {
          u === "input" && i.type === "radio" && i.name != null && Ja(l, i), ki(u, o);
          var s = ki(u, i);
          for (o = 0; o < a.length; o += 2) {
            var c = a[o], p = a[o + 1];
            c === "style" ? ns(l, p) : c === "dangerouslySetInnerHTML" ? es(l, p) : c === "children" ? Hn(l, p) : mo(l, c, p, s);
          }
          switch (u) {
            case "input":
              yi(l, i);
              break;
            case "textarea":
              qa(l, i);
              break;
            case "select":
              var d = l._wrapperState.wasMultiple;
              l._wrapperState.wasMultiple = !!i.multiple;
              var g = i.value;
              g != null ? en(l, !!i.multiple, g, !1) : d !== !!i.multiple && (i.defaultValue != null ? en(
                l,
                !!i.multiple,
                i.defaultValue,
                !0
              ) : en(l, !!i.multiple, i.multiple ? [] : "", !1));
          }
          l[bn] = i;
        } catch (k) {
          J(e, e.return, k);
        }
      }
      break;
    case 6:
      if (Me(t, e), Be(e), r & 4) {
        if (e.stateNode === null) throw Error(x(162));
        l = e.stateNode, i = e.memoizedProps;
        try {
          l.nodeValue = i;
        } catch (k) {
          J(e, e.return, k);
        }
      }
      break;
    case 3:
      if (Me(t, e), Be(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        Kn(t.containerInfo);
      } catch (k) {
        J(e, e.return, k);
      }
      break;
    case 4:
      Me(t, e), Be(e);
      break;
    case 13:
      Me(t, e), Be(e), l = e.child, l.flags & 8192 && (i = l.memoizedState !== null, l.stateNode.isHidden = i, !i || l.alternate !== null && l.alternate.memoizedState !== null || (Xo = q())), r & 4 && ca(e);
      break;
    case 22:
      if (c = n !== null && n.memoizedState !== null, e.mode & 1 ? (se = (s = se) || c, Me(t, e), se = s) : Me(t, e), Be(e), r & 8192) {
        if (s = e.memoizedState !== null, (e.stateNode.isHidden = s) && !c && e.mode & 1) for (z = e, c = e.child; c !== null; ) {
          for (p = z = c; z !== null; ) {
            switch (d = z, g = d.child, d.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                Un(4, d, d.return);
                break;
              case 1:
                qt(d, d.return);
                var w = d.stateNode;
                if (typeof w.componentWillUnmount == "function") {
                  r = d, n = d.return;
                  try {
                    t = r, w.props = t.memoizedProps, w.state = t.memoizedState, w.componentWillUnmount();
                  } catch (k) {
                    J(r, n, k);
                  }
                }
                break;
              case 5:
                qt(d, d.return);
                break;
              case 22:
                if (d.memoizedState !== null) {
                  da(p);
                  continue;
                }
            }
            g !== null ? (g.return = d, z = g) : da(p);
          }
          c = c.sibling;
        }
        e: for (c = null, p = e; ; ) {
          if (p.tag === 5) {
            if (c === null) {
              c = p;
              try {
                l = p.stateNode, s ? (i = l.style, typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none") : (u = p.stateNode, a = p.memoizedProps.style, o = a != null && a.hasOwnProperty("display") ? a.display : null, u.style.display = ts("display", o));
              } catch (k) {
                J(e, e.return, k);
              }
            }
          } else if (p.tag === 6) {
            if (c === null) try {
              p.stateNode.nodeValue = s ? "" : p.memoizedProps;
            } catch (k) {
              J(e, e.return, k);
            }
          } else if ((p.tag !== 22 && p.tag !== 23 || p.memoizedState === null || p === e) && p.child !== null) {
            p.child.return = p, p = p.child;
            continue;
          }
          if (p === e) break e;
          for (; p.sibling === null; ) {
            if (p.return === null || p.return === e) break e;
            c === p && (c = null), p = p.return;
          }
          c === p && (c = null), p.sibling.return = p.return, p = p.sibling;
        }
      }
      break;
    case 19:
      Me(t, e), Be(e), r & 4 && ca(e);
      break;
    case 21:
      break;
    default:
      Me(
        t,
        e
      ), Be(e);
  }
}
function Be(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (zc(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(x(160));
      }
      switch (r.tag) {
        case 5:
          var l = r.stateNode;
          r.flags & 32 && (Hn(l, ""), r.flags &= -33);
          var i = sa(e);
          qi(e, i, l);
          break;
        case 3:
        case 4:
          var o = r.stateNode.containerInfo, u = sa(e);
          Ji(e, u, o);
          break;
        default:
          throw Error(x(161));
      }
    } catch (a) {
      J(e, e.return, a);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function vp(e, t, n) {
  z = e, jc(e);
}
function jc(e, t, n) {
  for (var r = (e.mode & 1) !== 0; z !== null; ) {
    var l = z, i = l.child;
    if (l.tag === 22 && r) {
      var o = l.memoizedState !== null || Nr;
      if (!o) {
        var u = l.alternate, a = u !== null && u.memoizedState !== null || se;
        u = Nr;
        var s = se;
        if (Nr = o, (se = a) && !s) for (z = l; z !== null; ) o = z, a = o.child, o.tag === 22 && o.memoizedState !== null ? pa(l) : a !== null ? (a.return = o, z = a) : pa(l);
        for (; i !== null; ) z = i, jc(i), i = i.sibling;
        z = l, Nr = u, se = s;
      }
      fa(e);
    } else l.subtreeFlags & 8772 && i !== null ? (i.return = l, z = i) : fa(e);
  }
}
function fa(e) {
  for (; z !== null; ) {
    var t = z;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            se || El(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !se) if (n === null) r.componentDidMount();
            else {
              var l = t.elementType === t.type ? n.memoizedProps : Ie(t.type, n.memoizedProps);
              r.componentDidUpdate(l, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var i = t.updateQueue;
            i !== null && Gu(t, i, r);
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
              Gu(t, o, n);
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
                  var p = c.dehydrated;
                  p !== null && Kn(p);
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
            throw Error(x(163));
        }
        se || t.flags & 512 && Zi(t);
      } catch (d) {
        J(t, t.return, d);
      }
    }
    if (t === e) {
      z = null;
      break;
    }
    if (n = t.sibling, n !== null) {
      n.return = t.return, z = n;
      break;
    }
    z = t.return;
  }
}
function da(e) {
  for (; z !== null; ) {
    var t = z;
    if (t === e) {
      z = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      n.return = t.return, z = n;
      break;
    }
    z = t.return;
  }
}
function pa(e) {
  for (; z !== null; ) {
    var t = z;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            El(4, t);
          } catch (a) {
            J(t, n, a);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var l = t.return;
            try {
              r.componentDidMount();
            } catch (a) {
              J(t, l, a);
            }
          }
          var i = t.return;
          try {
            Zi(t);
          } catch (a) {
            J(t, i, a);
          }
          break;
        case 5:
          var o = t.return;
          try {
            Zi(t);
          } catch (a) {
            J(t, o, a);
          }
      }
    } catch (a) {
      J(t, t.return, a);
    }
    if (t === e) {
      z = null;
      break;
    }
    var u = t.sibling;
    if (u !== null) {
      u.return = t.return, z = u;
      break;
    }
    z = t.return;
  }
}
var yp = Math.ceil, fl = nt.ReactCurrentDispatcher, Qo = nt.ReactCurrentOwner, Le = nt.ReactCurrentBatchConfig, F = 0, re = null, b = null, ie = 0, ke = 0, bt = xt(0), te = 0, ir = null, $t = 0, Cl = 0, Yo = 0, Bn = null, he = null, Xo = 0, pn = 1 / 0, Xe = null, dl = !1, bi = null, ht = null, Tr = !1, st = null, pl = 0, Vn = 0, eo = null, Wr = -1, Hr = 0;
function de() {
  return F & 6 ? q() : Wr !== -1 ? Wr : Wr = q();
}
function vt(e) {
  return e.mode & 1 ? F & 2 && ie !== 0 ? ie & -ie : ep.transition !== null ? (Hr === 0 && (Hr = ms()), Hr) : (e = B, e !== 0 || (e = window.event, e = e === void 0 ? 16 : xs(e.type)), e) : 1;
}
function Ae(e, t, n, r) {
  if (50 < Vn) throw Vn = 0, eo = null, Error(x(185));
  ur(e, n, r), (!(F & 2) || e !== re) && (e === re && (!(F & 2) && (Cl |= n), te === 4 && ut(e, ie)), we(e, r), n === 1 && F === 0 && !(t.mode & 1) && (pn = q() + 500, xl && kt()));
}
function we(e, t) {
  var n = e.callbackNode;
  ed(e, t);
  var r = Zr(e, e === re ? ie : 0);
  if (r === 0) n !== null && ku(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && ku(n), t === 1) e.tag === 0 ? bd(ma.bind(null, e)) : Us(ma.bind(null, e)), Gd(function() {
      !(F & 6) && kt();
    }), n = null;
    else {
      switch (hs(r)) {
        case 1:
          n = wo;
          break;
        case 4:
          n = ds;
          break;
        case 16:
          n = Gr;
          break;
        case 536870912:
          n = ps;
          break;
        default:
          n = Gr;
      }
      n = Fc(n, Lc.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function Lc(e, t) {
  if (Wr = -1, Hr = 0, F & 6) throw Error(x(327));
  var n = e.callbackNode;
  if (on() && e.callbackNode !== n) return null;
  var r = Zr(e, e === re ? ie : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = ml(e, r);
  else {
    t = r;
    var l = F;
    F |= 2;
    var i = Dc();
    (re !== e || ie !== t) && (Xe = null, pn = q() + 500, Lt(e, t));
    do
      try {
        Sp();
        break;
      } catch (u) {
        Rc(e, u);
      }
    while (!0);
    Ro(), fl.current = i, F = l, b !== null ? t = 0 : (re = null, ie = 0, t = te);
  }
  if (t !== 0) {
    if (t === 2 && (l = zi(e), l !== 0 && (r = l, t = to(e, l))), t === 1) throw n = ir, Lt(e, 0), ut(e, r), we(e, q()), n;
    if (t === 6) ut(e, r);
    else {
      if (l = e.current.alternate, !(r & 30) && !gp(l) && (t = ml(e, r), t === 2 && (i = zi(e), i !== 0 && (r = i, t = to(e, i))), t === 1)) throw n = ir, Lt(e, 0), ut(e, r), we(e, q()), n;
      switch (e.finishedWork = l, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(x(345));
        case 2:
          zt(e, he, Xe);
          break;
        case 3:
          if (ut(e, r), (r & 130023424) === r && (t = Xo + 500 - q(), 10 < t)) {
            if (Zr(e, 0) !== 0) break;
            if (l = e.suspendedLanes, (l & r) !== r) {
              de(), e.pingedLanes |= e.suspendedLanes & l;
              break;
            }
            e.timeoutHandle = Ii(zt.bind(null, e, he, Xe), t);
            break;
          }
          zt(e, he, Xe);
          break;
        case 4:
          if (ut(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, l = -1; 0 < r; ) {
            var o = 31 - Fe(r);
            i = 1 << o, o = t[o], o > l && (l = o), r &= ~i;
          }
          if (r = l, r = q() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * yp(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = Ii(zt.bind(null, e, he, Xe), r);
            break;
          }
          zt(e, he, Xe);
          break;
        case 5:
          zt(e, he, Xe);
          break;
        default:
          throw Error(x(329));
      }
    }
  }
  return we(e, q()), e.callbackNode === n ? Lc.bind(null, e) : null;
}
function to(e, t) {
  var n = Bn;
  return e.current.memoizedState.isDehydrated && (Lt(e, t).flags |= 256), e = ml(e, t), e !== 2 && (t = he, he = n, t !== null && no(t)), e;
}
function no(e) {
  he === null ? he = e : he.push.apply(he, e);
}
function gp(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
        var l = n[r], i = l.getSnapshot;
        l = l.value;
        try {
          if (!Ue(i(), l)) return !1;
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
function ut(e, t) {
  for (t &= ~Yo, t &= ~Cl, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - Fe(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function ma(e) {
  if (F & 6) throw Error(x(327));
  on();
  var t = Zr(e, 0);
  if (!(t & 1)) return we(e, q()), null;
  var n = ml(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = zi(e);
    r !== 0 && (t = r, n = to(e, r));
  }
  if (n === 1) throw n = ir, Lt(e, 0), ut(e, t), we(e, q()), n;
  if (n === 6) throw Error(x(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, zt(e, he, Xe), we(e, q()), null;
}
function Ko(e, t) {
  var n = F;
  F |= 1;
  try {
    return e(t);
  } finally {
    F = n, F === 0 && (pn = q() + 500, xl && kt());
  }
}
function Ot(e) {
  st !== null && st.tag === 0 && !(F & 6) && on();
  var t = F;
  F |= 1;
  var n = Le.transition, r = B;
  try {
    if (Le.transition = null, B = 1, e) return e();
  } finally {
    B = r, Le.transition = n, F = t, !(F & 6) && kt();
  }
}
function Go() {
  ke = bt.current, Y(bt);
}
function Lt(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, Kd(n)), b !== null) for (n = b.return; n !== null; ) {
    var r = n;
    switch (To(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && tl();
        break;
      case 3:
        fn(), Y(ye), Y(ce), Fo();
        break;
      case 5:
        Oo(r);
        break;
      case 4:
        fn();
        break;
      case 13:
        Y(K);
        break;
      case 19:
        Y(K);
        break;
      case 10:
        Do(r.type._context);
        break;
      case 22:
      case 23:
        Go();
    }
    n = n.return;
  }
  if (re = e, b = e = yt(e.current, null), ie = ke = t, te = 0, ir = null, Yo = Cl = $t = 0, he = Bn = null, Tt !== null) {
    for (t = 0; t < Tt.length; t++) if (n = Tt[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var l = r.next, i = n.pending;
      if (i !== null) {
        var o = i.next;
        i.next = l, r.next = o;
      }
      n.pending = r;
    }
    Tt = null;
  }
  return e;
}
function Rc(e, t) {
  do {
    var n = b;
    try {
      if (Ro(), Ur.current = cl, sl) {
        for (var r = G.memoizedState; r !== null; ) {
          var l = r.queue;
          l !== null && (l.pending = null), r = r.next;
        }
        sl = !1;
      }
      if (It = 0, ne = ee = G = null, An = !1, nr = 0, Qo.current = null, n === null || n.return === null) {
        te = 1, ir = t, b = null;
        break;
      }
      e: {
        var i = e, o = n.return, u = n, a = t;
        if (t = ie, u.flags |= 32768, a !== null && typeof a == "object" && typeof a.then == "function") {
          var s = a, c = u, p = c.tag;
          if (!(c.mode & 1) && (p === 0 || p === 11 || p === 15)) {
            var d = c.alternate;
            d ? (c.updateQueue = d.updateQueue, c.memoizedState = d.memoizedState, c.lanes = d.lanes) : (c.updateQueue = null, c.memoizedState = null);
          }
          var g = ta(o);
          if (g !== null) {
            g.flags &= -257, na(g, o, u, i, t), g.mode & 1 && ea(i, s, t), t = g, a = s;
            var w = t.updateQueue;
            if (w === null) {
              var k = /* @__PURE__ */ new Set();
              k.add(a), t.updateQueue = k;
            } else w.add(a);
            break e;
          } else {
            if (!(t & 1)) {
              ea(i, s, t), Zo();
              break e;
            }
            a = Error(x(426));
          }
        } else if (X && u.mode & 1) {
          var L = ta(o);
          if (L !== null) {
            !(L.flags & 65536) && (L.flags |= 256), na(L, o, u, i, t), jo(dn(a, u));
            break e;
          }
        }
        i = a = dn(a, u), te !== 4 && (te = 2), Bn === null ? Bn = [i] : Bn.push(i), i = o;
        do {
          switch (i.tag) {
            case 3:
              i.flags |= 65536, t &= -t, i.lanes |= t;
              var m = hc(i, a, t);
              Ku(i, m);
              break e;
            case 1:
              u = a;
              var f = i.type, h = i.stateNode;
              if (!(i.flags & 128) && (typeof f.getDerivedStateFromError == "function" || h !== null && typeof h.componentDidCatch == "function" && (ht === null || !ht.has(h)))) {
                i.flags |= 65536, t &= -t, i.lanes |= t;
                var v = vc(i, u, t);
                Ku(i, v);
                break e;
              }
          }
          i = i.return;
        } while (i !== null);
      }
      Ic(n);
    } catch (_) {
      t = _, b === n && n !== null && (b = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function Dc() {
  var e = fl.current;
  return fl.current = cl, e === null ? cl : e;
}
function Zo() {
  (te === 0 || te === 3 || te === 2) && (te = 4), re === null || !($t & 268435455) && !(Cl & 268435455) || ut(re, ie);
}
function ml(e, t) {
  var n = F;
  F |= 2;
  var r = Dc();
  (re !== e || ie !== t) && (Xe = null, Lt(e, t));
  do
    try {
      wp();
      break;
    } catch (l) {
      Rc(e, l);
    }
  while (!0);
  if (Ro(), F = n, fl.current = r, b !== null) throw Error(x(261));
  return re = null, ie = 0, te;
}
function wp() {
  for (; b !== null; ) Mc(b);
}
function Sp() {
  for (; b !== null && !Qf(); ) Mc(b);
}
function Mc(e) {
  var t = Oc(e.alternate, e, ke);
  e.memoizedProps = e.pendingProps, t === null ? Ic(e) : b = t, Qo.current = null;
}
function Ic(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = pp(n, t), n !== null) {
        n.flags &= 32767, b = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        te = 6, b = null;
        return;
      }
    } else if (n = dp(n, t, ke), n !== null) {
      b = n;
      return;
    }
    if (t = t.sibling, t !== null) {
      b = t;
      return;
    }
    b = t = e;
  } while (t !== null);
  te === 0 && (te = 5);
}
function zt(e, t, n) {
  var r = B, l = Le.transition;
  try {
    Le.transition = null, B = 1, xp(e, t, n, r);
  } finally {
    Le.transition = l, B = r;
  }
  return null;
}
function xp(e, t, n, r) {
  do
    on();
  while (st !== null);
  if (F & 6) throw Error(x(327));
  n = e.finishedWork;
  var l = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(x(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var i = n.lanes | n.childLanes;
  if (td(e, i), e === re && (b = re = null, ie = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || Tr || (Tr = !0, Fc(Gr, function() {
    return on(), null;
  })), i = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || i) {
    i = Le.transition, Le.transition = null;
    var o = B;
    B = 1;
    var u = F;
    F |= 4, Qo.current = null, hp(e, n), Tc(n, e), Bd(Di), Jr = !!Ri, Di = Ri = null, e.current = n, vp(n), Yf(), F = u, B = o, Le.transition = i;
  } else e.current = n;
  if (Tr && (Tr = !1, st = e, pl = l), i = e.pendingLanes, i === 0 && (ht = null), Gf(n.stateNode), we(e, q()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) l = t[n], r(l.value, { componentStack: l.stack, digest: l.digest });
  if (dl) throw dl = !1, e = bi, bi = null, e;
  return pl & 1 && e.tag !== 0 && on(), i = e.pendingLanes, i & 1 ? e === eo ? Vn++ : (Vn = 0, eo = e) : Vn = 0, kt(), null;
}
function on() {
  if (st !== null) {
    var e = hs(pl), t = Le.transition, n = B;
    try {
      if (Le.transition = null, B = 16 > e ? 16 : e, st === null) var r = !1;
      else {
        if (e = st, st = null, pl = 0, F & 6) throw Error(x(331));
        var l = F;
        for (F |= 4, z = e.current; z !== null; ) {
          var i = z, o = i.child;
          if (z.flags & 16) {
            var u = i.deletions;
            if (u !== null) {
              for (var a = 0; a < u.length; a++) {
                var s = u[a];
                for (z = s; z !== null; ) {
                  var c = z;
                  switch (c.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Un(8, c, i);
                  }
                  var p = c.child;
                  if (p !== null) p.return = c, z = p;
                  else for (; z !== null; ) {
                    c = z;
                    var d = c.sibling, g = c.return;
                    if (Pc(c), c === s) {
                      z = null;
                      break;
                    }
                    if (d !== null) {
                      d.return = g, z = d;
                      break;
                    }
                    z = g;
                  }
                }
              }
              var w = i.alternate;
              if (w !== null) {
                var k = w.child;
                if (k !== null) {
                  w.child = null;
                  do {
                    var L = k.sibling;
                    k.sibling = null, k = L;
                  } while (k !== null);
                }
              }
              z = i;
            }
          }
          if (i.subtreeFlags & 2064 && o !== null) o.return = i, z = o;
          else e: for (; z !== null; ) {
            if (i = z, i.flags & 2048) switch (i.tag) {
              case 0:
              case 11:
              case 15:
                Un(9, i, i.return);
            }
            var m = i.sibling;
            if (m !== null) {
              m.return = i.return, z = m;
              break e;
            }
            z = i.return;
          }
        }
        var f = e.current;
        for (z = f; z !== null; ) {
          o = z;
          var h = o.child;
          if (o.subtreeFlags & 2064 && h !== null) h.return = o, z = h;
          else e: for (o = f; z !== null; ) {
            if (u = z, u.flags & 2048) try {
              switch (u.tag) {
                case 0:
                case 11:
                case 15:
                  El(9, u);
              }
            } catch (_) {
              J(u, u.return, _);
            }
            if (u === o) {
              z = null;
              break e;
            }
            var v = u.sibling;
            if (v !== null) {
              v.return = u.return, z = v;
              break e;
            }
            z = u.return;
          }
        }
        if (F = l, kt(), He && typeof He.onPostCommitFiberRoot == "function") try {
          He.onPostCommitFiberRoot(vl, e);
        } catch {
        }
        r = !0;
      }
      return r;
    } finally {
      B = n, Le.transition = t;
    }
  }
  return !1;
}
function ha(e, t, n) {
  t = dn(n, t), t = hc(e, t, 1), e = mt(e, t, 1), t = de(), e !== null && (ur(e, 1, t), we(e, t));
}
function J(e, t, n) {
  if (e.tag === 3) ha(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      ha(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (ht === null || !ht.has(r))) {
        e = dn(n, e), e = vc(t, e, 1), t = mt(t, e, 1), e = de(), t !== null && (ur(t, 1, e), we(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function kp(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = de(), e.pingedLanes |= e.suspendedLanes & n, re === e && (ie & n) === n && (te === 4 || te === 3 && (ie & 130023424) === ie && 500 > q() - Xo ? Lt(e, 0) : Yo |= n), we(e, t);
}
function $c(e, t) {
  t === 0 && (e.mode & 1 ? (t = wr, wr <<= 1, !(wr & 130023424) && (wr = 4194304)) : t = 1);
  var n = de();
  e = et(e, t), e !== null && (ur(e, t, n), we(e, n));
}
function _p(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), $c(e, n);
}
function Ep(e, t) {
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
      throw Error(x(314));
  }
  r !== null && r.delete(t), $c(e, n);
}
var Oc;
Oc = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || ye.current) ve = !0;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return ve = !1, fp(e, t, n);
    ve = !!(e.flags & 131072);
  }
  else ve = !1, X && t.flags & 1048576 && Bs(t, ll, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      Vr(e, t), e = t.pendingProps;
      var l = an(t, ce.current);
      ln(t, n), l = Uo(null, t, r, e, l, n);
      var i = Bo();
      return t.flags |= 1, typeof l == "object" && l !== null && typeof l.render == "function" && l.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, ge(r) ? (i = !0, nl(t)) : i = !1, t.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null, Io(t), l.updater = _l, t.stateNode = l, l._reactInternals = t, Vi(t, r, e, n), t = Qi(null, t, r, !0, i, n)) : (t.tag = 0, X && i && No(t), fe(null, t, l, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (Vr(e, t), e = t.pendingProps, l = r._init, r = l(r._payload), t.type = r, l = t.tag = Pp(r), e = Ie(r, e), l) {
          case 0:
            t = Hi(null, t, r, e, n);
            break e;
          case 1:
            t = ia(null, t, r, e, n);
            break e;
          case 11:
            t = ra(null, t, r, e, n);
            break e;
          case 14:
            t = la(null, t, r, Ie(r.type, e), n);
            break e;
        }
        throw Error(x(
          306,
          r,
          ""
        ));
      }
      return t;
    case 0:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Ie(r, l), Hi(e, t, r, l, n);
    case 1:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Ie(r, l), ia(e, t, r, l, n);
    case 3:
      e: {
        if (Sc(t), e === null) throw Error(x(387));
        r = t.pendingProps, i = t.memoizedState, l = i.element, Xs(e, t), ul(t, r, null, n);
        var o = t.memoizedState;
        if (r = o.element, i.isDehydrated) if (i = { element: r, isDehydrated: !1, cache: o.cache, pendingSuspenseBoundaries: o.pendingSuspenseBoundaries, transitions: o.transitions }, t.updateQueue.baseState = i, t.memoizedState = i, t.flags & 256) {
          l = dn(Error(x(423)), t), t = oa(e, t, r, n, l);
          break e;
        } else if (r !== l) {
          l = dn(Error(x(424)), t), t = oa(e, t, r, n, l);
          break e;
        } else for (_e = pt(t.stateNode.containerInfo.firstChild), Ee = t, X = !0, Oe = null, n = Qs(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (sn(), r === l) {
            t = tt(e, t, n);
            break e;
          }
          fe(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return Ks(t), e === null && Ai(t), r = t.type, l = t.pendingProps, i = e !== null ? e.memoizedProps : null, o = l.children, Mi(r, l) ? o = null : i !== null && Mi(r, i) && (t.flags |= 32), wc(e, t), fe(e, t, o, n), t.child;
    case 6:
      return e === null && Ai(t), null;
    case 13:
      return xc(e, t, n);
    case 4:
      return $o(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = cn(t, null, r, n) : fe(e, t, r, n), t.child;
    case 11:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Ie(r, l), ra(e, t, r, l, n);
    case 7:
      return fe(e, t, t.pendingProps, n), t.child;
    case 8:
      return fe(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return fe(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, l = t.pendingProps, i = t.memoizedProps, o = l.value, H(il, r._currentValue), r._currentValue = o, i !== null) if (Ue(i.value, o)) {
          if (i.children === l.children && !ye.current) {
            t = tt(e, t, n);
            break e;
          }
        } else for (i = t.child, i !== null && (i.return = t); i !== null; ) {
          var u = i.dependencies;
          if (u !== null) {
            o = i.child;
            for (var a = u.firstContext; a !== null; ) {
              if (a.context === r) {
                if (i.tag === 1) {
                  a = Je(-1, n & -n), a.tag = 2;
                  var s = i.updateQueue;
                  if (s !== null) {
                    s = s.shared;
                    var c = s.pending;
                    c === null ? a.next = a : (a.next = c.next, c.next = a), s.pending = a;
                  }
                }
                i.lanes |= n, a = i.alternate, a !== null && (a.lanes |= n), Ui(
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
            if (o = i.return, o === null) throw Error(x(341));
            o.lanes |= n, u = o.alternate, u !== null && (u.lanes |= n), Ui(o, n, t), o = i.sibling;
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
        fe(e, t, l.children, n), t = t.child;
      }
      return t;
    case 9:
      return l = t.type, r = t.pendingProps.children, ln(t, n), l = Re(l), r = r(l), t.flags |= 1, fe(e, t, r, n), t.child;
    case 14:
      return r = t.type, l = Ie(r, t.pendingProps), l = Ie(r.type, l), la(e, t, r, l, n);
    case 15:
      return yc(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Ie(r, l), Vr(e, t), t.tag = 1, ge(r) ? (e = !0, nl(t)) : e = !1, ln(t, n), mc(t, r, l), Vi(t, r, l, n), Qi(null, t, r, !0, e, n);
    case 19:
      return kc(e, t, n);
    case 22:
      return gc(e, t, n);
  }
  throw Error(x(156, t.tag));
};
function Fc(e, t) {
  return fs(e, t);
}
function Cp(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function je(e, t, n, r) {
  return new Cp(e, t, n, r);
}
function Jo(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function Pp(e) {
  if (typeof e == "function") return Jo(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === vo) return 11;
    if (e === yo) return 14;
  }
  return 2;
}
function yt(e, t) {
  var n = e.alternate;
  return n === null ? (n = je(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function Qr(e, t, n, r, l, i) {
  var o = 2;
  if (r = e, typeof e == "function") Jo(e) && (o = 1);
  else if (typeof e == "string") o = 5;
  else e: switch (e) {
    case Wt:
      return Rt(n.children, l, i, t);
    case ho:
      o = 8, l |= 8;
      break;
    case di:
      return e = je(12, n, t, l | 2), e.elementType = di, e.lanes = i, e;
    case pi:
      return e = je(13, n, t, l), e.elementType = pi, e.lanes = i, e;
    case mi:
      return e = je(19, n, t, l), e.elementType = mi, e.lanes = i, e;
    case Ka:
      return Pl(n, l, i, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case Ya:
          o = 10;
          break e;
        case Xa:
          o = 9;
          break e;
        case vo:
          o = 11;
          break e;
        case yo:
          o = 14;
          break e;
        case lt:
          o = 16, r = null;
          break e;
      }
      throw Error(x(130, e == null ? e : typeof e, ""));
  }
  return t = je(o, n, t, l), t.elementType = e, t.type = r, t.lanes = i, t;
}
function Rt(e, t, n, r) {
  return e = je(7, e, r, t), e.lanes = n, e;
}
function Pl(e, t, n, r) {
  return e = je(22, e, r, t), e.elementType = Ka, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
}
function li(e, t, n) {
  return e = je(6, e, null, t), e.lanes = n, e;
}
function ii(e, t, n) {
  return t = je(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function zp(e, t, n, r, l) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Al(0), this.expirationTimes = Al(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Al(0), this.identifierPrefix = r, this.onRecoverableError = l, this.mutableSourceEagerHydrationData = null;
}
function qo(e, t, n, r, l, i, o, u, a) {
  return e = new zp(e, t, n, u, a), t === 1 ? (t = 1, i === !0 && (t |= 8)) : t = 0, i = je(3, null, null, t), e.current = i, i.stateNode = e, i.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Io(i), e;
}
function Np(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: Vt, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function Ac(e) {
  if (!e) return wt;
  e = e._reactInternals;
  e: {
    if (At(e) !== e || e.tag !== 1) throw Error(x(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (ge(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(x(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (ge(n)) return As(e, n, t);
  }
  return t;
}
function Uc(e, t, n, r, l, i, o, u, a) {
  return e = qo(n, r, !0, e, l, i, o, u, a), e.context = Ac(null), n = e.current, r = de(), l = vt(n), i = Je(r, l), i.callback = t ?? null, mt(n, i, l), e.current.lanes = l, ur(e, l, r), we(e, r), e;
}
function zl(e, t, n, r) {
  var l = t.current, i = de(), o = vt(l);
  return n = Ac(n), t.context === null ? t.context = n : t.pendingContext = n, t = Je(i, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = mt(l, t, o), e !== null && (Ae(e, l, o, i), Ar(e, l, o)), o;
}
function hl(e) {
  if (e = e.current, !e.child) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function va(e, t) {
  if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function bo(e, t) {
  va(e, t), (e = e.alternate) && va(e, t);
}
function Tp() {
  return null;
}
var Bc = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function eu(e) {
  this._internalRoot = e;
}
Nl.prototype.render = eu.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(x(409));
  zl(e, t, null, null);
};
Nl.prototype.unmount = eu.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    Ot(function() {
      zl(null, e, null, null);
    }), t[be] = null;
  }
};
function Nl(e) {
  this._internalRoot = e;
}
Nl.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = gs();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < ot.length && t !== 0 && t < ot[n].priority; n++) ;
    ot.splice(n, 0, e), n === 0 && Ss(e);
  }
};
function tu(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function Tl(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function ya() {
}
function jp(e, t, n, r, l) {
  if (l) {
    if (typeof r == "function") {
      var i = r;
      r = function() {
        var s = hl(o);
        i.call(s);
      };
    }
    var o = Uc(t, r, e, 0, null, !1, !1, "", ya);
    return e._reactRootContainer = o, e[be] = o.current, Jn(e.nodeType === 8 ? e.parentNode : e), Ot(), o;
  }
  for (; l = e.lastChild; ) e.removeChild(l);
  if (typeof r == "function") {
    var u = r;
    r = function() {
      var s = hl(a);
      u.call(s);
    };
  }
  var a = qo(e, 0, !1, null, null, !1, !1, "", ya);
  return e._reactRootContainer = a, e[be] = a.current, Jn(e.nodeType === 8 ? e.parentNode : e), Ot(function() {
    zl(t, a, n, r);
  }), a;
}
function jl(e, t, n, r, l) {
  var i = n._reactRootContainer;
  if (i) {
    var o = i;
    if (typeof l == "function") {
      var u = l;
      l = function() {
        var a = hl(o);
        u.call(a);
      };
    }
    zl(t, o, e, l);
  } else o = jp(n, t, e, l, r);
  return hl(o);
}
vs = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Rn(t.pendingLanes);
        n !== 0 && (So(t, n | 1), we(t, q()), !(F & 6) && (pn = q() + 500, kt()));
      }
      break;
    case 13:
      Ot(function() {
        var r = et(e, 1);
        if (r !== null) {
          var l = de();
          Ae(r, e, 1, l);
        }
      }), bo(e, 1);
  }
};
xo = function(e) {
  if (e.tag === 13) {
    var t = et(e, 134217728);
    if (t !== null) {
      var n = de();
      Ae(t, e, 134217728, n);
    }
    bo(e, 134217728);
  }
};
ys = function(e) {
  if (e.tag === 13) {
    var t = vt(e), n = et(e, t);
    if (n !== null) {
      var r = de();
      Ae(n, e, t, r);
    }
    bo(e, t);
  }
};
gs = function() {
  return B;
};
ws = function(e, t) {
  var n = B;
  try {
    return B = e, t();
  } finally {
    B = n;
  }
};
Ei = function(e, t, n) {
  switch (t) {
    case "input":
      if (yi(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var l = Sl(r);
            if (!l) throw Error(x(90));
            Za(r), yi(r, l);
          }
        }
      }
      break;
    case "textarea":
      qa(e, n);
      break;
    case "select":
      t = n.value, t != null && en(e, !!n.multiple, t, !1);
  }
};
is = Ko;
os = Ot;
var Lp = { usingClientEntryPoint: !1, Events: [sr, Xt, Sl, rs, ls, Ko] }, Nn = { findFiberByHostInstance: Nt, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Rp = { bundleType: Nn.bundleType, version: Nn.version, rendererPackageName: Nn.rendererPackageName, rendererConfig: Nn.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: nt.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = ss(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: Nn.findFiberByHostInstance || Tp, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var jr = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!jr.isDisabled && jr.supportsFiber) try {
    vl = jr.inject(Rp), He = jr;
  } catch {
  }
}
Pe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Lp;
Pe.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!tu(t)) throw Error(x(200));
  return Np(e, t, null, n);
};
Pe.createRoot = function(e, t) {
  if (!tu(e)) throw Error(x(299));
  var n = !1, r = "", l = Bc;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (l = t.onRecoverableError)), t = qo(e, 1, !1, null, null, n, !1, r, l), e[be] = t.current, Jn(e.nodeType === 8 ? e.parentNode : e), new eu(t);
};
Pe.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function" ? Error(x(188)) : (e = Object.keys(e).join(","), Error(x(268, e)));
  return e = ss(t), e = e === null ? null : e.stateNode, e;
};
Pe.flushSync = function(e) {
  return Ot(e);
};
Pe.hydrate = function(e, t, n) {
  if (!Tl(t)) throw Error(x(200));
  return jl(null, e, t, !0, n);
};
Pe.hydrateRoot = function(e, t, n) {
  if (!tu(e)) throw Error(x(405));
  var r = n != null && n.hydratedSources || null, l = !1, i = "", o = Bc;
  if (n != null && (n.unstable_strictMode === !0 && (l = !0), n.identifierPrefix !== void 0 && (i = n.identifierPrefix), n.onRecoverableError !== void 0 && (o = n.onRecoverableError)), t = Uc(t, null, e, 1, n ?? null, l, !1, i, o), e[be] = t.current, Jn(e), r) for (e = 0; e < r.length; e++) n = r[e], l = n._getVersion, l = l(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, l] : t.mutableSourceEagerHydrationData.push(
    n,
    l
  );
  return new Nl(t);
};
Pe.render = function(e, t, n) {
  if (!Tl(t)) throw Error(x(200));
  return jl(null, e, t, !1, n);
};
Pe.unmountComponentAtNode = function(e) {
  if (!Tl(e)) throw Error(x(40));
  return e._reactRootContainer ? (Ot(function() {
    jl(null, null, e, !1, function() {
      e._reactRootContainer = null, e[be] = null;
    });
  }), !0) : !1;
};
Pe.unstable_batchedUpdates = Ko;
Pe.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!Tl(n)) throw Error(x(200));
  if (e == null || e._reactInternals === void 0) throw Error(x(38));
  return jl(e, t, n, !1, r);
};
Pe.version = "18.3.1-next-f1338f8080-20240426";
function Vc() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Vc);
    } catch (e) {
      console.error(e);
    }
}
Vc(), Da.exports = Pe;
var Dp = Da.exports, Wc, ga = Dp;
Wc = ga.createRoot, ga.hydrateRoot;
function Mp(e) {
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
function Ip(e) {
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
const $p = {}, wa = (e) => {
  let t;
  const n = /* @__PURE__ */ new Set(), r = (c, p) => {
    const d = typeof c == "function" ? c(t) : c;
    if (!Object.is(d, t)) {
      const g = t;
      t = p ?? (typeof d != "object" || d === null) ? d : Object.assign({}, t, d), n.forEach((w) => w(t, g));
    }
  }, l = () => t, a = { setState: r, getState: l, getInitialState: () => s, subscribe: (c) => (n.add(c), () => n.delete(c)), destroy: () => {
    ($p ? "production" : void 0) !== "production" && console.warn(
      "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
    ), n.clear();
  } }, s = t = e(r, l, a);
  return a;
}, Op = (e) => e ? wa(e) : wa;
var Hc = { exports: {} }, Qc = {}, Yc = { exports: {} }, Xc = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var mn = O;
function Fp(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Ap = typeof Object.is == "function" ? Object.is : Fp, Up = mn.useState, Bp = mn.useEffect, Vp = mn.useLayoutEffect, Wp = mn.useDebugValue;
function Hp(e, t) {
  var n = t(), r = Up({ inst: { value: n, getSnapshot: t } }), l = r[0].inst, i = r[1];
  return Vp(
    function() {
      l.value = n, l.getSnapshot = t, oi(l) && i({ inst: l });
    },
    [e, n, t]
  ), Bp(
    function() {
      return oi(l) && i({ inst: l }), e(function() {
        oi(l) && i({ inst: l });
      });
    },
    [e]
  ), Wp(n), n;
}
function oi(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Ap(e, n);
  } catch {
    return !0;
  }
}
function Qp(e, t) {
  return t();
}
var Yp = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? Qp : Hp;
Xc.useSyncExternalStore = mn.useSyncExternalStore !== void 0 ? mn.useSyncExternalStore : Yp;
Yc.exports = Xc;
var Xp = Yc.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ll = O, Kp = Xp;
function Gp(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Zp = typeof Object.is == "function" ? Object.is : Gp, Jp = Kp.useSyncExternalStore, qp = Ll.useRef, bp = Ll.useEffect, em = Ll.useMemo, tm = Ll.useDebugValue;
Qc.useSyncExternalStoreWithSelector = function(e, t, n, r, l) {
  var i = qp(null);
  if (i.current === null) {
    var o = { hasValue: !1, value: null };
    i.current = o;
  } else o = i.current;
  i = em(
    function() {
      function a(g) {
        if (!s) {
          if (s = !0, c = g, g = r(g), l !== void 0 && o.hasValue) {
            var w = o.value;
            if (l(w, g))
              return p = w;
          }
          return p = g;
        }
        if (w = p, Zp(c, g)) return w;
        var k = r(g);
        return l !== void 0 && l(w, k) ? (c = g, w) : (c = g, p = k);
      }
      var s = !1, c, p, d = n === void 0 ? null : n;
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
  var u = Jp(e, i[0], i[1]);
  return bp(
    function() {
      o.hasValue = !0, o.value = u;
    },
    [u]
  ), tm(u), u;
};
Hc.exports = Qc;
var nm = Hc.exports;
const rm = /* @__PURE__ */ Ra(nm), Kc = {}, { useDebugValue: lm } = Nf, { useSyncExternalStoreWithSelector: im } = rm;
let Sa = !1;
const om = (e) => e;
function um(e, t = om, n) {
  (Kc ? "production" : void 0) !== "production" && n && !Sa && (console.warn(
    "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
  ), Sa = !0);
  const r = im(
    e.subscribe,
    e.getState,
    e.getServerState || e.getInitialState,
    t,
    n
  );
  return lm(r), r;
}
const xa = (e) => {
  (Kc ? "production" : void 0) !== "production" && typeof e != "function" && console.warn(
    "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
  );
  const t = typeof e == "function" ? Op(e) : e, n = (r, l) => um(t, r, l);
  return Object.assign(n, t), n;
}, am = (e) => e ? xa(e) : xa;
function sm() {
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
function cm() {
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
function fm() {
  return typeof window < "u" && window.__TAURI_INTERNALS__ ? cm() : sm();
}
const ka = "text/x-vnd.veusz-widget-3", dm = "text/x-vnd.veusz-data-1";
function ro(e, t) {
  const n = [];
  for (const r of e.settings) n.push(_a(t, r.name));
  for (const r of e.subgroups) n.push(...ro(r, _a(t, r.name)));
  return n;
}
function _a(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
const pm = 33;
function mm(e, t = fm()) {
  let n = null, r = null;
  return am((l, i) => {
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
          const p = u[0], d = Gc(i().tree, p);
          if (!d) {
            l({ schema: null, values: {} });
            return;
          }
          const g = await o(() => e.doc.schema(d));
          if (!g) {
            l({ schema: null, values: {} });
            return;
          }
          const w = ro(g, p), k = await o(() => e.doc.get(w)) ?? {};
          l({ schema: g, values: k });
          return;
        }
        const a = await o(() => e.doc.commonSchema(u));
        if (!a) {
          l({ schema: null, values: {} });
          return;
        }
        const s = ro(a, u[0]), c = await o(() => e.doc.get(s)) ?? {};
        l({ schema: a, values: c });
      },
      setValue: async (u, a) => {
        const s = await o(() => e.doc.set([{ path: u, value: a }]));
        if (!s) return;
        const c = { ...i().values };
        for (const p of s.diffs) c[p.path] = p.new;
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
          c.includes(u) && await i().select(c.map((p) => p === u ? s.path : p));
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
        const s = [...u].sort((p, d) => d.length - p.length);
        for (const p of s)
          await o(() => e.doc.remove(p));
        const c = i().selected.filter((p) => !u.includes(p));
        c.length !== i().selected.length && await i().select(c), l({ cutPaths: u }), await i().refreshTree(), await i().refreshUndoState();
      },
      pasteWidgets: async (u) => {
        const a = await t.read([ka]);
        if (!a) return [];
        const s = await o(() => e.doc.pasteWidgetsMime(
          u,
          a.mime_type,
          a.payload_b64
        ));
        return s ? (l({ cutPaths: [] }), await i().refreshTree(), await i().refreshUndoState(), s.paths) : [];
      },
      canPasteWidgets: async (u) => {
        const a = await t.read([ka]);
        if (!a) return !1;
        const s = await o(() => e.doc.canPasteMime(
          u,
          a.mime_type,
          a.payload_b64
        ));
        return (s == null ? void 0 : s.ok) ?? !1;
      },
      copyWidgetAsImage: async (u, a, s, c = 96) => {
        const p = await o(() => e.render.copyImage(u, a, s, c, "png"));
        p && await t.write({
          mime_type: p.mime_type,
          payload_b64: p.payload_b64
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
        const u = await t.read([dm]);
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
          const { webgpuAvailable: a } = await Promise.resolve().then(() => ef);
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
        const p = i().backend;
        if (p === "vello-gpu" && i().gpuNativeAvailable === !0) {
          const w = await o(() => e.render.scene(u, a, s, c));
          if (w) {
            const { gpuRenderScene: k } = await import("./velloNative-Cn1MRGX6.js"), L = await o(() => k(w.scene_b64, w.width, w.height));
            L && l({ render: {
              png: L,
              width: w.width,
              height: w.height,
              bounds: w.bounds
            } });
          }
          return;
        }
        if (p === "vello-wasm" && i().webgpuAvailable === !0) {
          const w = await o(() => e.render.scene(u, a, s, c));
          w && l({ render: {
            png: "",
            sceneB64: w.scene_b64,
            width: w.width,
            height: w.height,
            bounds: w.bounds
          } });
          return;
        }
        const d = p === "vello-wasm" || p === "vello-gpu" ? "vello" : p, g = await o(() => e.render.png(u, a, s, c, i().antialias, d));
        g && l({ render: g });
      },
      requestRender: (u, a, s, c = 96) => {
        r = { page: u, w: a, h: s, dpi: c }, n && clearTimeout(n), n = setTimeout(() => {
          n = null;
          const p = r;
          r = null, p && i().renderAt(p.page, p.w, p.h, p.dpi);
        }, pm);
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
function Gc(e, t) {
  if (!e) return null;
  if (e.path === t) return e.type;
  for (const n of e.children) {
    const r = Gc(n, t);
    if (r) return r;
  }
  return null;
}
function hm() {
  return (globalThis.__VEUSZ_WASM_BASE__ ?? "/wasm").replace(/\/+$/, "");
}
let Lr = null;
function nu() {
  return Lr || (Lr = (async () => {
    const e = hm(), t = await import(
      /* @vite-ignore */
      `${e}/veusz_paint_wasm.js`
    );
    return await t.default({ module_or_path: `${e}/veusz_paint_wasm_bg.wasm` }), t;
  })().catch((e) => {
    throw Lr = null, e;
  })), Lr;
}
async function Zc() {
  try {
    const e = navigator.gpu;
    return e ? await e.requestAdapter() != null : !1;
  } catch {
    return !1;
  }
}
function ru(e) {
  const t = atob(e), n = new Uint8Array(t.length);
  for (let r = 0; r < t.length; r++) n[r] = t.charCodeAt(r);
  return n;
}
async function Jc(e, t, n = [0, 0, 0, 0]) {
  await (await nu()).render_scene_to_canvas(e, t, n[0], n[1], n[2], n[3]);
}
async function vm(e, t, n = [0, 0, 0, 0]) {
  await Jc(e, ru(t), n);
}
async function qc() {
  try {
    return typeof (await nu()).scene_to_svg == "function";
  } catch {
    return !1;
  }
}
async function bc(e, t, n) {
  const r = await nu();
  if (typeof r.scene_to_svg != "function")
    throw new Error("this runtime does not include the SVG exporter");
  return r.scene_to_svg(ru(e), t, n);
}
const ef = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base64ToBytes: ru,
  renderSceneBytesToCanvas: Jc,
  renderSceneToCanvas: vm,
  sceneToSvg: bc,
  svgExportAvailable: qc,
  webgpuAvailable: Zc
}, Symbol.toStringTag, { value: "Module" })), ym = "0.26.4", gm = `https://cdn.jsdelivr.net/pyodide/v${ym}/full/`;
let Tn = null;
async function wm(e) {
  if (Tn) return Tn;
  const t = e.pyodideIndexUrl ?? gm, n = e.onProgress ?? (() => {
  });
  return Tn = (async () => {
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
    throw Tn = null, r;
  }), Tn;
}
let Sm = 0;
async function xm(e = {}) {
  const t = e.onProgress ?? (() => {
  });
  e.wasmBase && (globalThis.__VEUSZ_WASM_BASE__ = e.wasmBase);
  const n = await wm(e);
  t("Starting renderer…");
  const l = n.pyimport("veusz.daemon.pyodide_bridge").Bridge(), i = Mp(l), o = `/veusz/fig_${Sm++}`, u = `${o}/figure.vsz`, a = async (s, c = []) => {
    await n.runPythonAsync(`import os; os.makedirs(${JSON.stringify(o)}, exist_ok=True)`);
    for (const p of c) {
      const d = `${o}/${p.name}`, g = d.slice(0, d.lastIndexOf("/"));
      g && g !== o && await n.runPythonAsync(`import os; os.makedirs(${JSON.stringify(g)}, exist_ok=True)`), n.FS.writeFile(d, p.bytes);
    }
    return n.FS.writeFile(u, s), i.call("file.open", { path: u });
  };
  return t("Ready"), { transport: i, bridge: l, loadVsz: a, pyodide: n };
}
async function km(e, t = {}) {
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
    const c = o(s.url), p = i.get(s.url), d = {};
    p.etag && (d["If-None-Match"] = p.etag), p.lastModified && (d["If-Modified-Since"] = p.lastModified), l({ url: s.url, phase: "fetching" });
    try {
      const g = await fetch(c, { headers: d, cache: "no-store" });
      if (g.status === 304) {
        await e.call(
          "data.url_refresh",
          { url: s.url, not_modified: !0 }
        ), l({ url: s.url, phase: "not_modified" });
        return;
      }
      if (!g.ok) throw new Error(`HTTP ${g.status}`);
      const w = new Uint8Array(await g.arrayBuffer()), k = tf(w), L = g.headers.get("etag"), m = g.headers.get("last-modified"), f = g.headers.get("content-type");
      await e.call("data.url_refresh", {
        url: s.url,
        bytes_b64: k,
        etag: L,
        last_modified: m,
        content_type: f
      }), p.etag = L, p.lastModified = m, l({ url: s.url, phase: "ok" });
    } catch (g) {
      const w = g instanceof Error ? g : new Error(String(g));
      r(s.url, w), l({ url: s.url, phase: "error", detail: w.message });
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
async function _m(e, t, n = {}) {
  const r = Em(e), l = n.onError ?? ((i, o) => console.warn(`[veusz-figure] pre-fetch ${i}: ${o.message}`));
  return await Promise.allSettled(r.map(async (i) => {
    const o = n.urlMap && Object.prototype.hasOwnProperty.call(n.urlMap, i) ? n.urlMap[i] : n.urlBase ? new URL(i, n.urlBase).toString() : i;
    try {
      const u = await fetch(o, { cache: "no-store" });
      if (!u.ok) throw new Error(`HTTP ${u.status}`);
      const a = new Uint8Array(await u.arrayBuffer());
      await t.call("data.url_ingest", {
        url: i,
        // Python's cache key = original URL
        bytes_b64: tf(a),
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
function Em(e) {
  const t = [], n = /ImportFileURL\s*\(\s*(['"])([^'"\n]+)\1/g;
  let r;
  for (; (r = n.exec(e)) !== null; ) t.push(r[2]);
  return t;
}
function tf(e) {
  let t = "";
  for (let r = 0; r < e.length; r += 32768)
    t += String.fromCharCode.apply(
      null,
      Array.from(e.subarray(r, r + 32768))
    );
  return btoa(t);
}
const Cm = /\bImport[A-Za-z0-9]*\s*\(\s*[uUrRbB]?(['"])([^'"\n]+)\1/g;
function Pm(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e.matchAll(Cm)) {
    const r = n[2];
    /^[a-z][a-z0-9+.-]*:\/\//i.test(r) || /\.[A-Za-z0-9]+$/.test(r) && t.add(r);
  }
  return [...t];
}
async function zm(e, t, n = {}, r = fetch) {
  const l = Pm(e);
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
var nf = { exports: {} }, Rl = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Nm = O, Tm = Symbol.for("react.element"), jm = Symbol.for("react.fragment"), Lm = Object.prototype.hasOwnProperty, Rm = Nm.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, Dm = { key: !0, ref: !0, __self: !0, __source: !0 };
function rf(e, t, n) {
  var r, l = {}, i = null, o = null;
  n !== void 0 && (i = "" + n), t.key !== void 0 && (i = "" + t.key), t.ref !== void 0 && (o = t.ref);
  for (r in t) Lm.call(t, r) && !Dm.hasOwnProperty(r) && (l[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) l[r] === void 0 && (l[r] = t[r]);
  return { $$typeof: Tm, type: e, key: i, ref: o, props: l, _owner: Rm.current };
}
Rl.Fragment = jm;
Rl.jsx = rf;
Rl.jsxs = rf;
nf.exports = Rl;
var S = nf.exports;
function Mm({
  root: e,
  selected: t,
  onSelect: n,
  onContextMenu: r,
  renamingPath: l,
  onRenameCommit: i,
  cutPaths: o
}) {
  const u = new Set(t), a = new Set(o ?? []);
  return /* @__PURE__ */ S.jsx("ul", { "data-testid": "tree", role: "tree", children: /* @__PURE__ */ S.jsx(
    lf,
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
function Im(e) {
  return e.shiftKey ? "range" : e.ctrlKey || e.metaKey ? "toggle" : "replace";
}
function lf({
  node: e,
  selectedSet: t,
  cutSet: n,
  onSelect: r,
  onContextMenu: l,
  renamingPath: i,
  onRenameCommit: o
}) {
  const u = t.has(e.path), a = n.has(e.path), s = i === e.path;
  return /* @__PURE__ */ S.jsxs("li", { role: "treeitem", "aria-selected": u, children: [
    s ? /* @__PURE__ */ S.jsx(
      $m,
      {
        initial: e.name,
        onCommit: (c) => o == null ? void 0 : o(e.path, c)
      }
    ) : /* @__PURE__ */ S.jsxs(
      "button",
      {
        type: "button",
        "data-testid": `tree-node-${e.path}`,
        "data-selected": u || void 0,
        "data-cut": a || void 0,
        style: a ? { opacity: 0.5 } : void 0,
        onClick: (c) => r(e.path, Im(c)),
        onContextMenu: (c) => l == null ? void 0 : l(e.path, c),
        children: [
          /* @__PURE__ */ S.jsxs("span", { "data-testid": `tree-type-${e.path}`, children: [
            "[",
            e.type,
            "]"
          ] }),
          " ",
          /* @__PURE__ */ S.jsx("span", { "data-testid": `tree-name-${e.path}`, children: e.name || "/" })
        ]
      }
    ),
    e.children.length > 0 && /* @__PURE__ */ S.jsx("ul", { role: "group", children: e.children.map((c) => /* @__PURE__ */ S.jsx(
      lf,
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
function $m({
  initial: e,
  onCommit: t
}) {
  return /* @__PURE__ */ S.jsx(
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
function lo({ schema: e, value: t, onChange: n }) {
  const r = e.typename === "int", [l, i] = O.useState(
    () => t == null ? "" : String(t)
  );
  O.useEffect(() => {
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
  return /* @__PURE__ */ S.jsx(
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
function io({ schema: e, value: t, onChange: n }) {
  const r = typeof t == "string" && t.toLowerCase() === "auto";
  return /* @__PURE__ */ S.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ S.jsxs("label", { children: [
      /* @__PURE__ */ S.jsx(
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
    !r && /* @__PURE__ */ S.jsx(
      lo,
      {
        schema: e,
        value: t,
        onChange: n
      }
    )
  ] });
}
function Om({ schema: e, value: t, onChange: n, siblings: r }) {
  if (!((r == null ? void 0 : r.mode) === "datetime"))
    return /* @__PURE__ */ S.jsx(io, { schema: e, value: t, onChange: n });
  const i = typeof t == "string" ? t : "", o = i.toLowerCase() === "auto";
  return /* @__PURE__ */ S.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ S.jsxs("label", { children: [
      /* @__PURE__ */ S.jsx(
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
    !o && /* @__PURE__ */ S.jsx(
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
function Fm({ schema: e, value: t, onChange: n }) {
  const r = !!t;
  return /* @__PURE__ */ S.jsx(
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
function xe({ schema: e, value: t, onChange: n, editable: r = !1 }) {
  const l = e.vallist ?? [], i = e.uilist ?? l.map((u) => String(u)), o = t == null ? "" : String(t);
  return r && !l.includes(o) ? /* @__PURE__ */ S.jsx(
    "input",
    {
      type: "text",
      value: o,
      list: `opt-${e.name}`,
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (u) => n(u.target.value)
    }
  ) : /* @__PURE__ */ S.jsx(
    "select",
    {
      value: o,
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (u) => n(u.target.value),
      children: l.map((u, a) => /* @__PURE__ */ S.jsx("option", { value: String(u), children: i[a] ?? String(u) }, String(u)))
    }
  );
}
function Am({ schema: e, value: t, onChange: n }) {
  const r = typeof t == "string" ? t : "auto", l = r === "auto", i = t == null ? void 0 : t.$ref;
  return /* @__PURE__ */ S.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ S.jsxs("label", { children: [
      /* @__PURE__ */ S.jsx(
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
    !l && /* @__PURE__ */ S.jsx(
      "input",
      {
        type: "color",
        value: Bm(r),
        "data-testid": `setting-${e.name}-color`,
        "aria-label": e.usertext || e.name,
        onChange: (o) => n(o.target.value)
      }
    ),
    i && /* @__PURE__ */ S.jsxs("span", { "data-testid": `setting-${e.name}-ref`, children: [
      "ref: ",
      /* @__PURE__ */ S.jsx("code", { children: i })
    ] })
  ] });
}
const Ea = /* @__PURE__ */ new Map(), Um = {
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
function Bm(e) {
  if (/^#[0-9a-fA-F]{6}$/.test(e)) return e;
  const t = Um[e.toLowerCase()];
  if (t) return t;
  if (typeof document > "u") return "#000000";
  const n = Ea.get(e);
  if (n) return n;
  const r = document.createElement("div");
  r.style.color = e, r.style.display = "none", document.body.appendChild(r);
  const l = getComputedStyle(r).color;
  document.body.removeChild(r);
  const i = l.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!i) return "#000000";
  const o = "#" + [i[1], i[2], i[3]].map((u) => parseInt(u, 10).toString(16).padStart(2, "0")).join("");
  return Ea.set(e, o), o;
}
function Rr({
  schema: e,
  value: t,
  onChange: n,
  datasets: r = []
}) {
  const l = t == null ? "" : String(t), i = `ds-${e.name}`;
  return /* @__PURE__ */ S.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ S.jsx(
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
    /* @__PURE__ */ S.jsx("datalist", { id: i, children: r.map((o) => /* @__PURE__ */ S.jsx("option", { value: o }, o)) })
  ] });
}
const Ca = /^(-?\d+(?:\.\d+)?)\s*(pt|cm|mm|in|%|\/)?$/;
function ui({ schema: e, value: t, onChange: n, allowAuto: r = !1 }) {
  const l = typeof t == "string" ? t : "", i = l.toLowerCase() === "auto", o = (() => {
    if (i) return { num: "", unit: "pt" };
    const d = l.match(Ca);
    return { num: (d == null ? void 0 : d[1]) ?? "", unit: (d == null ? void 0 : d[2]) ?? "pt" };
  })(), [u, a] = O.useState(o.num), [s, c] = O.useState(o.unit);
  O.useEffect(() => {
    if (i) return;
    const d = l.match(Ca);
    d && (a(d[1] ?? ""), c(d[2] ?? "pt"));
  }, [l, i]);
  const p = (d, g) => {
    d.trim() !== "" && n(`${d}${g}`);
  };
  return /* @__PURE__ */ S.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    r && /* @__PURE__ */ S.jsxs("label", { children: [
      /* @__PURE__ */ S.jsx(
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
    !i && /* @__PURE__ */ S.jsxs(S.Fragment, { children: [
      /* @__PURE__ */ S.jsx(
        "input",
        {
          type: "text",
          inputMode: "decimal",
          value: u,
          "data-testid": `setting-${e.name}-num`,
          "aria-label": `${e.usertext || e.name} value`,
          onChange: (d) => a(d.target.value),
          onBlur: (d) => p(d.target.value, s),
          onKeyDown: (d) => {
            d.key === "Enter" && p(d.target.value, s);
          }
        }
      ),
      /* @__PURE__ */ S.jsx(
        "select",
        {
          value: s,
          "data-testid": `setting-${e.name}-unit`,
          "aria-label": `${e.usertext || e.name} unit`,
          onChange: (d) => {
            c(d.target.value), p(u, d.target.value);
          },
          children: ["pt", "cm", "mm", "in", "%"].map((d) => /* @__PURE__ */ S.jsx("option", { value: d, children: d }, d))
        }
      )
    ] })
  ] });
}
function ai({
  schema: e,
  value: t,
  onChange: n,
  onBrowse: r
}) {
  const l = t == null ? "" : String(t);
  return /* @__PURE__ */ S.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ S.jsx(
      "input",
      {
        type: "text",
        value: l,
        "data-testid": `setting-${e.name}-path`,
        "aria-label": e.usertext || e.name,
        onChange: (i) => n(i.target.value)
      }
    ),
    r && /* @__PURE__ */ S.jsx(
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
function Vm({ schema: e, value: t, onChange: n }) {
  const r = Wm(t), [l, i] = O.useState(r);
  O.useEffect(() => i(r), [r]);
  const o = (u) => {
    if (u.startsWith("=")) {
      n(u);
      return;
    }
    const a = u.split(`
`).map((c) => c.trim()).filter(Boolean), s = {};
    for (const c of a) {
      const [p, d] = c.split("=", 2).map((w) => w == null ? void 0 : w.trim());
      if (!p) continue;
      const g = Number(d);
      if (!Number.isFinite(g)) {
        n(u);
        return;
      }
      s[p] = g;
    }
    n(s);
  };
  return /* @__PURE__ */ S.jsx(
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
function Wm(e) {
  return typeof e == "string" ? e : e && typeof e == "object" && !Array.isArray(e) ? Object.entries(e).map(([t, n]) => `${t}=${n}`).join(`
`) : "";
}
function Hm({ schema: e, value: t, onChange: n }) {
  const r = Array.isArray(t) ? t.join(", ") : typeof t == "string" ? t : "", [l, i] = O.useState(r);
  O.useEffect(() => i(r), [r]);
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
  return /* @__PURE__ */ S.jsx(
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
function Qm({ schema: e, value: t, onChange: n }) {
  const r = typeof t == "number" ? t : Number(t) || 0, l = e.minval ?? 0, i = e.maxval ?? 100, o = e.step ?? 1;
  return /* @__PURE__ */ S.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ S.jsx(
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
    /* @__PURE__ */ S.jsx(
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
function Ym({ schema: e, value: t, onChange: n }) {
  const r = e.vallist ?? [];
  return /* @__PURE__ */ S.jsx(
    "select",
    {
      value: t == null ? "" : String(t),
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (l) => n(l.target.value),
      children: r.map((l) => /* @__PURE__ */ S.jsx("option", { value: l, children: l }, l))
    }
  );
}
function si({ schema: e, value: t, onChange: n }) {
  const r = Array.isArray(t) ? JSON.stringify(t, null, 2) : "";
  return /* @__PURE__ */ S.jsx(
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
function Xm({ schema: e, value: t, onChange: n }) {
  const r = e.vallist ?? [];
  return /* @__PURE__ */ S.jsx(
    "select",
    {
      value: t == null ? "" : String(t),
      "data-testid": `setting-${e.name}`,
      "aria-label": e.usertext || e.name,
      onChange: (l) => n(l.target.value),
      children: r.map((l) => /* @__PURE__ */ S.jsx("option", { value: l, children: l }, l))
    }
  );
}
function Dr({ schema: e, value: t, onChange: n }) {
  return /* @__PURE__ */ S.jsx(
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
function ci({
  schema: e,
  value: t,
  onChange: n,
  candidates: r = []
}) {
  const l = t == null ? "" : String(t), i = `wp-${e.name}`;
  return /* @__PURE__ */ S.jsxs("span", { "data-testid": `setting-${e.name}`, children: [
    /* @__PURE__ */ S.jsx(
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
    /* @__PURE__ */ S.jsx("datalist", { id: i, children: r.map((o) => /* @__PURE__ */ S.jsx("option", { value: o }, o)) })
  ] });
}
const of = {
  // Atomic
  str: Dr,
  "str-notes": Dr,
  bool: Fm,
  int: lo,
  float: lo,
  "float-or-auto": io,
  "int-or-auto": io,
  "float-slider": Qm,
  distance: ui,
  "distance-or-auto": (e) => /* @__PURE__ */ S.jsx(ui, { ...e, allowAuto: !0 }),
  displacement: ui,
  choice: xe,
  "choice-or-more": (e) => /* @__PURE__ */ S.jsx(xe, { ...e, editable: !0 }),
  "float-choice": (e) => /* @__PURE__ */ S.jsx(xe, { ...e, editable: !0 }),
  color: Am,
  colormap: xe,
  marker: Xm,
  arrow: xe,
  "line-style": Ym,
  "fill-style": xe,
  "fill-style-ext": xe,
  "errorbar-style": xe,
  "align-horz": xe,
  "align-vert": xe,
  "align-horz-+manual": xe,
  "align-vert-+manual": xe,
  "font-family": Dr,
  "font-style": Dr,
  "rotate-interval": xe,
  "axis-bound": Om,
  // List / composite
  "float-list": Hm,
  "float-dict": Vm,
  "str-multi": si,
  "line-multi": si,
  "fill-multi": si,
  // Reference-by-path
  dataset: Rr,
  "dataset-multi": Rr,
  "dataset-extended": Rr,
  "dataset-or-str": Rr,
  "widget-path": ci,
  "widget-choice": ci,
  axis: ci,
  // File-system
  filename: ai,
  "filename-image": ai,
  "filename-svg": ai,
  // Internal — kept hidden by the inspector via `setting.hidden`,
  // but mapped here so the registry-coverage assertions report 100%.
  "backward-compat": () => null
};
new Set(
  Object.keys(of)
);
function Km(e) {
  return of[e] ?? null;
}
function Gm(e) {
  var s;
  const t = e.widgetPaths[0], n = e.widgetPaths.length > 1, [r, l] = O.useState({}), i = (c, p) => r[c] ?? !uf(p), o = (c, p) => l((d) => ({ ...d, [c]: p })), u = (c, p) => {
    var w;
    if (!n) {
      e.onChange(c, p);
      return;
    }
    const d = c.slice(t.length), g = e.widgetPaths.map((k) => ({ path: k + d, value: p }));
    (w = e.onChangeMany) == null || w.call(e, g);
  }, a = n ? `${((s = e.schema.typenames) == null ? void 0 : s.join(", ")) ?? "widgets"} ×${e.widgetPaths.length}` : e.schema.typename ?? "";
  return /* @__PURE__ */ S.jsxs(
    "div",
    {
      "data-testid": "inspector",
      "data-widget": t,
      "data-multi": n || void 0,
      "data-count": e.widgetPaths.length,
      children: [
        /* @__PURE__ */ S.jsx("h3", { "data-testid": "inspector-title", children: a }),
        /* @__PURE__ */ S.jsx(
          af,
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
function uf(e) {
  if (e.setnsmode) return e.setnsmode === "formatting";
  const t = e.settings.filter((n) => !n.hidden);
  return t.length > 0 ? t.every((n) => n.formatting) : e.subgroups.length > 0 ? e.subgroups.every(uf) : !1;
}
function af({ group: e, basePath: t, widgetPath: n, values: r, datasets: l, onChange: i, settingMenu: o, groupLabel: u, groupOpen: a, setGroupOpen: s }) {
  return /* @__PURE__ */ S.jsxs(O.Fragment, { children: [
    e.settings.map(
      (c) => c.hidden ? null : /* @__PURE__ */ S.jsx(
        Zm,
        {
          schema: c,
          basePath: t,
          widgetPath: n,
          value: r[oo(t, c.name)],
          datasets: l,
          onChange: i,
          settingMenu: o,
          groupLabel: u
        },
        c.name
      )
    ),
    e.subgroups.map((c) => {
      const p = c.usertext || Jm(c.name), d = oo(t, c.name), g = a(d, c);
      return /* @__PURE__ */ S.jsxs(
        "details",
        {
          "data-testid": `subgroup-${c.name}`,
          open: g,
          onToggle: (w) => {
            const k = w.currentTarget, L = typeof k.open == "boolean" ? k.open : k.hasAttribute("open");
            L !== g && s(d, L);
          },
          children: [
            /* @__PURE__ */ S.jsx("summary", { children: p }),
            /* @__PURE__ */ S.jsx(
              af,
              {
                group: c,
                basePath: d,
                widgetPath: n,
                values: r,
                datasets: l,
                onChange: i,
                settingMenu: o,
                groupLabel: p,
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
function Zm({
  schema: e,
  basePath: t,
  widgetPath: n,
  value: r,
  datasets: l,
  onChange: i,
  settingMenu: o,
  groupLabel: u
}) {
  const a = Km(e.typename), s = oo(t, e.name), c = bm(e, u), p = e.mixed_value === !0, d = (g) => o ? o(
    {
      path: s,
      name: e.name,
      widgetPath: n,
      isReference: e.is_reference === !0,
      isStylesheet: s.startsWith("/StyleSheet/")
    },
    g
  ) : g;
  return a ? /* @__PURE__ */ S.jsxs(
    "div",
    {
      "data-testid": `row-${e.name}`,
      "data-mixed": p || void 0,
      children: [
        d(
          /* @__PURE__ */ S.jsxs("label", { style: p ? { fontStyle: "italic", color: "#888" } : void 0, children: [
            c,
            p ? " (mixed)" : ""
          ] })
        ),
        /* @__PURE__ */ S.jsx(
          a,
          {
            schema: e,
            value: p ? void 0 : r,
            datasets: l,
            onChange: (g) => i(s, g)
          }
        )
      ]
    }
  ) : /* @__PURE__ */ S.jsxs("div", { "data-testid": `row-${e.name}`, "data-mixed": p || void 0, children: [
    d(/* @__PURE__ */ S.jsx("label", { children: c })),
    /* @__PURE__ */ S.jsx("code", { "data-testid": `fallback-${e.name}`, children: r === void 0 ? "(unset)" : JSON.stringify(r) }),
    /* @__PURE__ */ S.jsxs("small", { children: [
      " [typename=",
      e.typename,
      "]"
    ] })
  ] });
}
function oo(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
function Jm(e) {
  if (!e) return e;
  const t = e.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
const qm = /* @__PURE__ */ new Set(["color", "hide", "width", "style"]);
function bm(e, t) {
  const n = e.usertext || e.name;
  return t ? qm.has(e.name) ? `${t} ${n.toLowerCase()}` : n : e.name === "color" && e.descr ? e.descr : n;
}
function eh(e, t) {
  const n = new Map(t.map((l) => [l.path, l])), r = [];
  for (const l of e) {
    const i = n.get(l.path);
    if (!i) continue;
    const o = Math.min(l.value, i.value), u = Math.max(l.value, i.value);
    !(u > o) || !Number.isFinite(o) || !Number.isFinite(u) || (r.push({ path: `${l.path}/min`, value: o }), r.push({ path: `${l.path}/max`, value: u }));
  }
  return r;
}
function th(e) {
  const t = [];
  for (const n of new Set(e))
    t.push({ path: `${n}/min`, value: "Auto" }), t.push({ path: `${n}/max`, value: "Auto" });
  return t;
}
function nh(e, t, n) {
  const r = new Map(t.map((i) => [i.path, i])), l = [];
  for (const i of e) {
    const o = r.get(i.path), u = n.get(i.path);
    if (!o || !u) continue;
    const a = i.value - o.value;
    Number.isFinite(a) && (l.push({ path: `${i.path}/min`, value: u.min + a }), l.push({ path: `${i.path}/max`, value: u.max + a }));
  }
  return l;
}
function rh(e, t, n, r, l) {
  const i = new Map(t.map((s) => [s.path, s])), o = new Map(n.map((s) => [s.path, s])), u = new Map(r.map((s) => [s.path, s])), a = [];
  for (const s of e) {
    const c = i.get(s.path), p = o.get(s.path), d = u.get(s.path), g = l.get(s.path);
    if (!c || !p || !d || !g) continue;
    const w = s.value, k = c.value, L = p.value, f = d.value - L;
    if (!Number.isFinite(f) || f === 0) continue;
    const h = (k - w) / f;
    if (!Number.isFinite(h) || h <= 0) continue;
    const v = w + h * (g.min - L), _ = w + h * (g.max - L);
    if (!Number.isFinite(v) || !Number.isFinite(_)) continue;
    const N = Math.min(v, _), C = Math.max(v, _);
    C > N && (a.push({ path: `${s.path}/min`, value: N }), a.push({ path: `${s.path}/max`, value: C }));
  }
  return a;
}
function lh(e) {
  const t = (i) => {
    const o = Math.abs(i);
    return o !== 0 && (o < 1e-3 || o >= 1e5) ? i.toExponential(3) : Number(i.toPrecision(5)).toString();
  }, n = e.find((i) => i.direction === "horizontal"), r = e.find((i) => i.direction === "vertical"), l = [];
  return n && l.push(`x: ${t(n.value)}`), r && l.push(`y: ${t(r.value)}`), l.join("   ");
}
const Pa = 4, za = 2400;
function ih({
  store: e,
  width: t,
  height: n
}) {
  const r = e((y) => y.render), l = e((y) => y.tree), i = e((y) => y.currentPage), o = e((y) => y.values), u = e((y) => y.requestRender), a = O.useRef(null), s = O.useRef(null), [c, p] = O.useState({ w: t, h: n }), [d, g] = O.useState(null), [w, k] = O.useState(null), [L, m] = O.useState(null), f = O.useRef(/* @__PURE__ */ new Set()), h = O.useRef(null), v = O.useRef(null), _ = O.useRef(/* @__PURE__ */ new Map()), N = O.useRef(0);
  O.useEffect(() => {
    const y = s.current;
    if (!y) return;
    const P = t > 0 ? n / t : 0.6667, E = typeof window < "u" && window.devicePixelRatio || 1, j = () => {
      const A = y.clientWidth || t;
      let M = Math.round(A * E), V = Math.round(A * P * E);
      const I = Math.max(M, V);
      if (I > za) {
        const U = za / I;
        M = Math.round(M * U), V = Math.round(V * U);
      }
      M > 0 && V > 0 && p((U) => U.w === M && U.h === V ? U : { w: M, h: V });
    };
    if (j(), typeof ResizeObserver > "u") return;
    const R = new ResizeObserver(j);
    return R.observe(y), () => R.disconnect();
  }, [t, n]), O.useEffect(() => {
    l && l.children.length > 0 && u(i, c.w, c.h);
  }, [l, o, i, c.w, c.h, u]), O.useEffect(() => {
    const y = r == null ? void 0 : r.sceneB64, P = a.current;
    if (!y || !P) return;
    let E = !1;
    return (async () => {
      try {
        const { renderSceneToCanvas: j } = await Promise.resolve().then(() => ef);
        E || await j(P, y, [1, 1, 1, 1]);
      } catch (j) {
        E || console.error("embed scene render failed", j);
      }
    })(), () => {
      E = !0;
    };
  }, [r == null ? void 0 : r.sceneB64, c.w, c.h]);
  const C = () => e.getState().rpc, T = (y, P) => {
    const j = a.current.getBoundingClientRect();
    return [
      (y - j.left) * (c.w / j.width),
      (P - j.top) * (c.h / j.height)
    ];
  }, W = async (y) => {
    await e.getState().setValues(y), u(i, c.w, c.h);
  }, D = () => {
    const y = a.current;
    if (!y) return;
    const P = [..._.current.keys()];
    if (P.length < 2) return;
    const [E, j] = P, R = _.current.get(E), A = _.current.get(j), M = y.getBoundingClientRect(), V = R.clientX - M.left, I = R.clientY - M.top, U = A.clientX - M.left, Ye = A.clientY - M.top, Ut = Math.hypot(U - V, Ye - I) || 1;
    v.current = {
      id1: E,
      id2: j,
      startDist: Ut,
      startCx: (V + U) / 2,
      startCy: (I + Ye) / 2
    }, h.current = null, g(null), (async () => {
      const [dr, pr] = [T(R.clientX, R.clientY), T(A.clientX, A.clientY)], [lu, iu] = await Promise.all([
        C().render.pixelToData(dr[0], dr[1]),
        C().render.pixelToData(pr[0], pr[1])
      ]);
      if (!v.current) return;
      v.current.data1 = lu.axes, v.current.data2 = iu.axes;
      const ou = /* @__PURE__ */ new Map(), cf = new Set([...lu.axes, ...iu.axes].map((Ct) => Ct.path));
      for (const Ct of cf) {
        const uu = await C().doc.get([`${Ct}/min`, `${Ct}/max`]), au = Number(uu[`${Ct}/min`]), su = Number(uu[`${Ct}/max`]);
        Number.isFinite(au) && Number.isFinite(su) && ou.set(Ct, { min: au, max: su });
      }
      v.current && (v.current.ranges = ou);
    })();
  }, Se = () => {
    const y = v.current, P = a.current;
    if (!y || !P) return;
    const E = _.current.get(y.id1), j = _.current.get(y.id2);
    if (!E || !j) return;
    const R = P.getBoundingClientRect(), A = E.clientX - R.left, M = E.clientY - R.top, V = j.clientX - R.left, I = j.clientY - R.top, U = Math.hypot(V - A, I - M) || 1;
    m({
      scale: U / y.startDist,
      ox: y.startCx,
      oy: y.startCy,
      tx: (A + V) / 2 - y.startCx,
      ty: (M + I) / 2 - y.startCy
    });
  }, _t = (y, P) => {
    const E = v.current;
    if (v.current = null, m(null), !E || !E.data1 || !E.data2 || !E.ranges) return;
    const j = E.id1 === P ? y : _.current.get(E.id1), R = E.id2 === P ? y : _.current.get(E.id2);
    if (!j || !R) return;
    const A = T(j.clientX, j.clientY), M = T(R.clientX, R.clientY);
    (async () => {
      const [V, I] = await Promise.all([
        C().render.pixelToData(A[0], A[1]),
        C().render.pixelToData(M[0], M[1])
      ]), U = rh(
        E.data1,
        E.data2,
        V.axes,
        I.axes,
        E.ranges
      );
      U.length && await W(U);
    })();
  }, Et = (y) => {
    var R, A;
    if ((A = (R = y.currentTarget).setPointerCapture) == null || A.call(R, y.pointerId), _.current.set(y.pointerId, { clientX: y.clientX, clientY: y.clientY }), _.current.size >= 2) {
      D();
      return;
    }
    const [P, E] = T(y.clientX, y.clientY), j = y.pointerType === "mouse" ? y.shiftKey || y.button === 1 : !0;
    h.current = { pointerId: y.pointerId, mode: j ? "pan" : "zoom", sx: P, sy: E, moved: !1 }, j && C().render.pixelToData(P, E).then(async (M) => {
      if (!h.current) return;
      h.current.from = M.axes;
      const V = /* @__PURE__ */ new Map();
      for (const I of M.axes) {
        const U = await C().doc.get([`${I.path}/min`, `${I.path}/max`]), Ye = Number(U[`${I.path}/min`]), Ut = Number(U[`${I.path}/max`]);
        Number.isFinite(Ye) && Number.isFinite(Ut) && V.set(I.path, { min: Ye, max: Ut });
      }
      h.current && (h.current.ranges = V);
    });
  }, fr = (y) => {
    if (_.current.has(y.pointerId) && _.current.set(y.pointerId, { clientX: y.clientX, clientY: y.clientY }), v.current) {
      Se();
      return;
    }
    const P = h.current;
    if (P && P.pointerId === y.pointerId) {
      const [A, M] = T(y.clientX, y.clientY);
      (Math.abs(A - P.sx) > Pa || Math.abs(M - P.sy) > Pa) && (P.moved = !0), P.mode === "zoom" && P.moved && g({ x0: P.sx, y0: P.sy, x1: A, y1: M });
      return;
    }
    if (y.pointerType !== "mouse" || y.buttons !== 0) return;
    const E = performance.now();
    if (E - N.current < 40) return;
    N.current = E;
    const [j, R] = T(y.clientX, y.clientY);
    C().render.pixelToData(j, R).then((A) => {
      A.axes.forEach((pr) => f.current.add(pr.path));
      const M = lh(A.axes);
      if (!M) {
        k(null);
        return;
      }
      const V = s.current, I = V ? V.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 }, U = y.clientX - I.left, Ye = y.clientY - I.top, Ut = I.width > 0 && U > I.width * 0.6, dr = I.height > 0 && Ye > I.height * 0.85;
      k({
        ...Ut ? { right: Math.max(4, I.width - U + 12) } : { left: U + 12 },
        top: dr ? Math.max(4, Ye - 22) : Ye + 12,
        text: M
      });
    });
  }, Dl = (y) => {
    var A, M;
    (M = (A = y.currentTarget).releasePointerCapture) == null || M.call(A, y.pointerId);
    const P = _.current.get(y.pointerId) ?? { clientX: y.clientX, clientY: y.clientY };
    if (v.current) {
      _t(P, y.pointerId), _.current.delete(y.pointerId);
      return;
    }
    _.current.delete(y.pointerId);
    const E = h.current;
    if (!E || E.pointerId !== y.pointerId || (h.current = null, g(null), !E.moved)) return;
    const [j, R] = T(y.clientX, y.clientY);
    E.mode === "zoom" ? (async () => {
      const [V, I] = await Promise.all([
        C().render.pixelToData(E.sx, E.sy),
        C().render.pixelToData(j, R)
      ]), U = eh(V.axes, I.axes);
      U.length && await W(U);
    })() : E.mode === "pan" && E.from && E.ranges && (async () => {
      const V = await C().render.pixelToData(j, R), I = nh(E.from, V.axes, E.ranges);
      I.length && await W(I);
    })();
  }, gn = (y) => {
    _.current.delete(y.pointerId), v.current = null, h.current = null, g(null), m(null);
  }, wn = () => {
    f.current.size && W(th(f.current));
  };
  return /* @__PURE__ */ S.jsxs(
    "div",
    {
      ref: s,
      "data-testid": "embed-plot",
      style: { position: "relative", width: "100%", lineHeight: 0 },
      onPointerLeave: () => {
        k(null);
      },
      children: [
        /* @__PURE__ */ S.jsx(
          "canvas",
          {
            ref: a,
            width: c.w,
            height: c.h,
            "data-testid": "embed-canvas",
            onPointerDown: Et,
            onPointerMove: fr,
            onPointerUp: Dl,
            onPointerCancel: gn,
            onDoubleClick: wn,
            style: {
              width: "100%",
              height: "auto",
              display: "block",
              cursor: "crosshair",
              touchAction: "none",
              transform: L ? `translate(${L.tx}px, ${L.ty}px) scale(${L.scale})` : void 0,
              transformOrigin: L ? `${L.ox}px ${L.oy}px` : void 0
            }
          }
        ),
        d && /* @__PURE__ */ S.jsx("div", { "data-testid": "embed-zoomband", style: {
          position: "absolute",
          pointerEvents: "none",
          border: "1px solid #1f6feb",
          background: "rgba(31,111,235,0.12)",
          left: `${Math.min(d.x0, d.x1) / c.w * 100}%`,
          top: `${Math.min(d.y0, d.y1) / c.h * 100}%`,
          width: `${Math.abs(d.x1 - d.x0) / c.w * 100}%`,
          height: `${Math.abs(d.y1 - d.y0) / c.h * 100}%`
        } }),
        w && /* @__PURE__ */ S.jsx("div", { "data-testid": "embed-tooltip", style: {
          position: "absolute",
          left: w.left,
          right: w.right,
          top: w.top,
          pointerEvents: "none",
          background: "rgba(20,22,26,0.9)",
          color: "#fff",
          font: "12px system-ui",
          padding: "2px 6px",
          borderRadius: 4,
          whiteSpace: "nowrap",
          zIndex: 5
        }, children: w.text })
      ]
    }
  );
}
const Na = "veusz-embed-styles", oh = 520, uh = `
.vz-fig {
  container-type: inline-size;
  container-name: veuszfig;
}
.vz-fig .vz-body {
  position: relative;
  display: flex;
  align-items: stretch;
}
.vz-fig .vz-plot {
  flex: 1 1 auto;
  min-width: 0;
  padding: 8px;
}
.vz-fig .vz-panel {
  box-sizing: border-box;
  flex: 0 0 300px;
  width: 300px;
  max-height: 520px;
  padding: 8px;
  overflow: auto;
  border-left: 1px solid #eee;
  background: #fff;
}

/* Narrow container: the side column would overflow the figure, so float the
   edit panel up from the bottom as a drawer over the plot. */
@container veuszfig (max-width: ${oh}px) {
  .vz-fig .vz-panel {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: auto;
    flex: none;
    max-height: 70%;
    border-left: 0;
    border-top: 1px solid #ddd;
    box-shadow: 0 -2px 14px rgba(0, 0, 0, 0.16);
    z-index: 4;
  }
}
`;
function sf() {
  if (typeof document > "u" || document.getElementById(Na)) return;
  const e = document.createElement("style");
  e.id = Na, e.textContent = uh, document.head.appendChild(e);
}
async function ah(e, t) {
  const { rpc: n } = e.getState(), r = await n.render.scene(t.page, t.width, t.height, t.dpi ?? 96), l = await bc(r.scene_b64, r.width, r.height);
  sh(l, t.filename ?? "figure.svg", "image/svg+xml");
}
function sh(e, t, n) {
  const r = URL.createObjectURL(new Blob([e], { type: n })), l = document.createElement("a");
  l.href = r, l.download = t, document.body.appendChild(l), l.click(), l.remove(), setTimeout(() => URL.revokeObjectURL(r), 1e3);
}
sf();
function ch({
  store: e,
  width: t = 600,
  height: n = 400,
  editable: r = !0,
  title: l
}) {
  const i = e((v) => v.tree), o = e((v) => v.selected), u = e((v) => v.schema), a = e((v) => v.values), s = e((v) => v.datasets), c = e((v) => v.error), p = e((v) => v.webgpuAvailable), d = e((v) => v.currentPage), [g, w] = O.useState(!1), [k, L] = O.useState(!1), [m, f] = O.useState(!1);
  O.useEffect(() => {
    sf();
    const v = e.getState();
    return v.setBackend("vello-wasm"), v.probeWebgpu(), v.loadPlotPrefs(), v.refreshAll(), v.subscribeToDaemon();
  }, [e]), O.useEffect(() => {
    let v = !0;
    return qc().then((_) => {
      v && L(_);
    }), () => {
      v = !1;
    };
  }, []);
  const h = async () => {
    f(!0);
    try {
      await ah(e, {
        page: d,
        width: t,
        height: n,
        filename: `${(l ?? "figure").replace(/\s+/g, "_")}.svg`
      });
    } catch (v) {
      e.setState({ error: `SVG export failed: ${v.message}` });
    } finally {
      f(!1);
    }
  };
  return p === !1 ? /* @__PURE__ */ S.jsx("div", { "data-testid": "veusz-figure", style: Ta, children: /* @__PURE__ */ S.jsx("div", { "data-testid": "veusz-needs-webgpu", style: { padding: 16, color: "#b06000" }, children: "This interactive figure needs WebGPU. Open in Chrome or Safari 26+." }) }) : /* @__PURE__ */ S.jsxs("div", { "data-testid": "veusz-figure", className: "vz-fig", style: Ta, children: [
    /* @__PURE__ */ S.jsxs("div", { style: fh, children: [
      /* @__PURE__ */ S.jsx("strong", { style: { fontSize: 13 }, children: l ?? "Veusz figure" }),
      /* @__PURE__ */ S.jsx("span", { style: { flex: 1 } }),
      c && /* @__PURE__ */ S.jsx("span", { "data-testid": "veusz-error", style: { color: "crimson", fontSize: 12 }, children: c }),
      k && /* @__PURE__ */ S.jsx(
        "button",
        {
          type: "button",
          "data-testid": "veusz-export-svg",
          disabled: m,
          onClick: () => {
            h();
          },
          style: ja(!1),
          title: "Download this figure as a vector SVG",
          children: m ? "…" : "SVG"
        }
      ),
      r && /* @__PURE__ */ S.jsx(
        "button",
        {
          type: "button",
          "data-testid": "veusz-edit-toggle",
          "aria-pressed": g,
          onClick: () => w((v) => !v),
          style: ja(g),
          children: "Edit"
        }
      )
    ] }),
    /* @__PURE__ */ S.jsxs("div", { className: "vz-body", children: [
      /* @__PURE__ */ S.jsx("div", { className: "vz-plot", children: /* @__PURE__ */ S.jsx(ih, { store: e, width: t, height: n }) }),
      g && /* @__PURE__ */ S.jsxs("aside", { "data-testid": "veusz-edit-panel", className: "vz-panel", children: [
        r && /* @__PURE__ */ S.jsxs("div", { style: dh, children: [
          /* @__PURE__ */ S.jsx("span", { style: { fontSize: 12, color: "#666" }, children: "Edit" }),
          /* @__PURE__ */ S.jsx(
            "button",
            {
              type: "button",
              "data-testid": "veusz-edit-close",
              "aria-label": "Close edit panel",
              onClick: () => w(!1),
              style: ph,
              children: "×"
            }
          )
        ] }),
        i ? /* @__PURE__ */ S.jsx(
          Mm,
          {
            root: i,
            selected: o,
            onSelect: (v) => {
              e.getState().select([v]);
            }
          }
        ) : /* @__PURE__ */ S.jsx("p", { style: { color: "#888" }, children: "Loading…" }),
        /* @__PURE__ */ S.jsx("hr", { style: { border: 0, borderTop: "1px solid #eee", margin: "8px 0" } }),
        u && o.length > 0 ? /* @__PURE__ */ S.jsx(
          Gm,
          {
            schema: u,
            widgetPaths: o,
            values: a,
            datasets: s.map((v) => v.name),
            onChange: (v, _) => {
              e.getState().setValue(v, _);
            },
            onChangeMany: (v) => {
              e.getState().setValues(v);
            }
          }
        ) : /* @__PURE__ */ S.jsx("p", { style: { color: "#888", fontSize: 13 }, children: "Select a widget to edit." })
      ] })
    ] })
  ] });
}
const Ta = {
  border: "1px solid #e2e4e8",
  borderRadius: 10,
  overflow: "hidden",
  background: "#fff",
  font: "14px system-ui, sans-serif"
}, fh = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderBottom: "1px solid #eee",
  background: "#fafbfc"
}, dh = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 4
}, ph = {
  border: 0,
  background: "transparent",
  cursor: "pointer",
  fontSize: 18,
  lineHeight: 1,
  color: "#888",
  padding: "0 4px"
};
function ja(e) {
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
const La = "This interactive figure needs WebGPU. Open in Chrome or Safari 26+.";
class mh extends HTMLElement {
  constructor() {
    super(...arguments);
    Sn(this, "root", null);
    Sn(this, "mounted", !1);
    Sn(this, "noteEl", null);
    Sn(this, "urlLinks", null);
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
    if (i.src = n, i.alt = this.getAttribute("title") ?? "Veusz figure", i.style.cssText = "display:block;width:100%;height:auto;", i.addEventListener("error", () => this.status(r.note ?? La)), l.appendChild(i), r.onActivate) {
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
    if (!await Zc()) {
      r ? this.showPoster(r, {
        note: "Static image — the interactive view needs WebGPU (Chrome or Safari 26+)."
      }) : this.status(La);
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
      const l = await xm({
        wasmBase: this.getAttribute("wasm-base") ?? void 0,
        pyodideIndexUrl: this.getAttribute("pyodide-index") ?? void 0,
        veuszWheelUrl: this.getAttribute("veusz-wheel") ?? void 0,
        onProgress: (p) => {
          r ? this.setNote(p) : this.status(p);
        }
      }), i = await fetch(n);
      if (!i.ok) throw new Error(`fetch ${n}: ${i.status}`);
      const o = await i.text(), u = {
        urlBase: this.getAttribute("data-url-base") ?? new URL(".", new URL(n, location.href)).toString(),
        urlMap: hh(this.getAttribute("data-url-map"))
      };
      await _m(o, l.transport, u);
      const a = await zm(o, n, u);
      await l.loadVsz(o, a), this.urlLinks = await km(l.transport, u);
      const s = mm(Ip(l.transport));
      this.replaceChildren(), this.noteEl = null;
      const c = document.createElement("div");
      this.appendChild(c), this.root = Wc(c), this.root.render(O.createElement(ch, {
        store: s,
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
function hh(e) {
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
typeof customElements < "u" && !customElements.get("veusz-figure") && customElements.define("veusz-figure", mh);
export {
  mh as VeuszFigureElement
};
//# sourceMappingURL=veusz-embed.js.map
