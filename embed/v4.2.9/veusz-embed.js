var _f = Object.defineProperty;
var Cf = (e, t, n) => t in e ? _f(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var _n = (e, t, n) => Cf(e, typeof t != "symbol" ? t + "" : t, n);
function Wa(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Ha = { exports: {} }, Te = {}, Qa = { exports: {} }, O = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var dr = Symbol.for("react.element"), Pf = Symbol.for("react.portal"), zf = Symbol.for("react.fragment"), Tf = Symbol.for("react.strict_mode"), Nf = Symbol.for("react.profiler"), jf = Symbol.for("react.provider"), Rf = Symbol.for("react.context"), Lf = Symbol.for("react.forward_ref"), Df = Symbol.for("react.suspense"), Mf = Symbol.for("react.memo"), If = Symbol.for("react.lazy"), yu = Symbol.iterator;
function $f(e) {
  return e === null || typeof e != "object" ? null : (e = yu && e[yu] || e["@@iterator"], typeof e == "function" ? e : null);
}
var Ya = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, Xa = Object.assign, Ka = {};
function yn(e, t, n) {
  this.props = e, this.context = t, this.refs = Ka, this.updater = n || Ya;
}
yn.prototype.isReactComponent = {};
yn.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
yn.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function Ga() {
}
Ga.prototype = yn.prototype;
function ho(e, t, n) {
  this.props = e, this.context = t, this.refs = Ka, this.updater = n || Ya;
}
var vo = ho.prototype = new Ga();
vo.constructor = ho;
Xa(vo, yn.prototype);
vo.isPureReactComponent = !0;
var gu = Array.isArray, Za = Object.prototype.hasOwnProperty, yo = { current: null }, Ja = { key: !0, ref: !0, __self: !0, __source: !0 };
function qa(e, t, n) {
  var r, l = {}, i = null, o = null;
  if (t != null) for (r in t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (i = "" + t.key), t) Za.call(t, r) && !Ja.hasOwnProperty(r) && (l[r] = t[r]);
  var u = arguments.length - 2;
  if (u === 1) l.children = n;
  else if (1 < u) {
    for (var a = Array(u), s = 0; s < u; s++) a[s] = arguments[s + 2];
    l.children = a;
  }
  if (e && e.defaultProps) for (r in u = e.defaultProps, u) l[r] === void 0 && (l[r] = u[r]);
  return { $$typeof: dr, type: e, key: i, ref: o, props: l, _owner: yo.current };
}
function Of(e, t) {
  return { $$typeof: dr, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function go(e) {
  return typeof e == "object" && e !== null && e.$$typeof === dr;
}
function Ff(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var wu = /\/+/g;
function Vl(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? Ff("" + e.key) : t.toString(36);
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
        case dr:
        case Pf:
          o = !0;
      }
  }
  if (o) return o = e, l = l(o), e = r === "" ? "." + Vl(o, 0) : r, gu(l) ? (n = "", e != null && (n = e.replace(wu, "$&/") + "/"), Ar(l, t, n, "", function(s) {
    return s;
  })) : l != null && (go(l) && (l = Of(l, n + (!l.key || o && o.key === l.key ? "" : ("" + l.key).replace(wu, "$&/") + "/") + e)), t.push(l)), 1;
  if (o = 0, r = r === "" ? "." : r + ":", gu(e)) for (var u = 0; u < e.length; u++) {
    i = e[u];
    var a = r + Vl(i, u);
    o += Ar(i, t, n, a, l);
  }
  else if (a = $f(e), typeof a == "function") for (e = a.call(e), u = 0; !(i = e.next()).done; ) i = i.value, a = r + Vl(i, u++), o += Ar(i, t, n, a, l);
  else if (i === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return o;
}
function Sr(e, t, n) {
  if (e == null) return e;
  var r = [], l = 0;
  return Ar(e, r, "", "", function(i) {
    return t.call(n, i, l++);
  }), r;
}
function Uf(e) {
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
var ve = { current: null }, Br = { transition: null }, Af = { ReactCurrentDispatcher: ve, ReactCurrentBatchConfig: Br, ReactCurrentOwner: yo };
function ba() {
  throw Error("act(...) is not supported in production builds of React.");
}
O.Children = { map: Sr, forEach: function(e, t, n) {
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
  if (!go(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
O.Component = yn;
O.Fragment = zf;
O.Profiler = Nf;
O.PureComponent = ho;
O.StrictMode = Tf;
O.Suspense = Df;
O.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Af;
O.act = ba;
O.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = Xa({}, e.props), l = e.key, i = e.ref, o = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (i = t.ref, o = yo.current), t.key !== void 0 && (l = "" + t.key), e.type && e.type.defaultProps) var u = e.type.defaultProps;
    for (a in t) Za.call(t, a) && !Ja.hasOwnProperty(a) && (r[a] = t[a] === void 0 && u !== void 0 ? u[a] : t[a]);
  }
  var a = arguments.length - 2;
  if (a === 1) r.children = n;
  else if (1 < a) {
    u = Array(a);
    for (var s = 0; s < a; s++) u[s] = arguments[s + 2];
    r.children = u;
  }
  return { $$typeof: dr, type: e.type, key: l, ref: i, props: r, _owner: o };
};
O.createContext = function(e) {
  return e = { $$typeof: Rf, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: jf, _context: e }, e.Consumer = e;
};
O.createElement = qa;
O.createFactory = function(e) {
  var t = qa.bind(null, e);
  return t.type = e, t;
};
O.createRef = function() {
  return { current: null };
};
O.forwardRef = function(e) {
  return { $$typeof: Lf, render: e };
};
O.isValidElement = go;
O.lazy = function(e) {
  return { $$typeof: If, _payload: { _status: -1, _result: e }, _init: Uf };
};
O.memo = function(e, t) {
  return { $$typeof: Mf, type: e, compare: t === void 0 ? null : t };
};
O.startTransition = function(e) {
  var t = Br.transition;
  Br.transition = {};
  try {
    e();
  } finally {
    Br.transition = t;
  }
};
O.unstable_act = ba;
O.useCallback = function(e, t) {
  return ve.current.useCallback(e, t);
};
O.useContext = function(e) {
  return ve.current.useContext(e);
};
O.useDebugValue = function() {
};
O.useDeferredValue = function(e) {
  return ve.current.useDeferredValue(e);
};
O.useEffect = function(e, t) {
  return ve.current.useEffect(e, t);
};
O.useId = function() {
  return ve.current.useId();
};
O.useImperativeHandle = function(e, t, n) {
  return ve.current.useImperativeHandle(e, t, n);
};
O.useInsertionEffect = function(e, t) {
  return ve.current.useInsertionEffect(e, t);
};
O.useLayoutEffect = function(e, t) {
  return ve.current.useLayoutEffect(e, t);
};
O.useMemo = function(e, t) {
  return ve.current.useMemo(e, t);
};
O.useReducer = function(e, t, n) {
  return ve.current.useReducer(e, t, n);
};
O.useRef = function(e) {
  return ve.current.useRef(e);
};
O.useState = function(e) {
  return ve.current.useState(e);
};
O.useSyncExternalStore = function(e, t, n) {
  return ve.current.useSyncExternalStore(e, t, n);
};
O.useTransition = function() {
  return ve.current.useTransition();
};
O.version = "18.3.1";
Qa.exports = O;
var M = Qa.exports;
const Bf = /* @__PURE__ */ Wa(M);
var es = { exports: {} }, ts = {};
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
    var w = z.length;
    z.push(I);
    e: for (; 0 < w; ) {
      var L = w - 1 >>> 1, T = z[L];
      if (0 < l(T, I)) z[L] = I, z[w] = T, w = L;
      else break e;
    }
  }
  function n(z) {
    return z.length === 0 ? null : z[0];
  }
  function r(z) {
    if (z.length === 0) return null;
    var I = z[0], w = z.pop();
    if (w !== I) {
      z[0] = w;
      e: for (var L = 0, T = z.length, $ = T >>> 1; L < $; ) {
        var U = 2 * (L + 1) - 1, V = z[U], F = U + 1, A = z[F];
        if (0 > l(V, w)) F < T && 0 > l(A, V) ? (z[L] = A, z[F] = w, L = F) : (z[L] = V, z[U] = w, L = U);
        else if (F < T && 0 > l(A, w)) z[L] = A, z[F] = w, L = F;
        else break e;
      }
    }
    return I;
  }
  function l(z, I) {
    var w = z.sortIndex - I.sortIndex;
    return w !== 0 ? w : z.id - I.id;
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
  var a = [], s = [], c = 1, f = null, p = 3, y = !1, v = !1, k = !1, P = typeof setTimeout == "function" ? setTimeout : null, m = typeof clearTimeout == "function" ? clearTimeout : null, d = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function h(z) {
    for (var I = n(s); I !== null; ) {
      if (I.callback === null) r(s);
      else if (I.startTime <= z) r(s), I.sortIndex = I.expirationTime, t(a, I);
      else break;
      I = n(s);
    }
  }
  function x(z) {
    if (k = !1, h(z), !v) if (n(a) !== null) v = !0, Sn(S);
    else {
      var I = n(s);
      I !== null && xn(x, I.startTime - z);
    }
  }
  function S(z, I) {
    v = !1, k && (k = !1, m(R), R = -1), y = !0;
    var w = p;
    try {
      for (h(I), f = n(a); f !== null && (!(f.expirationTime > I) || z && !b()); ) {
        var L = f.callback;
        if (typeof L == "function") {
          f.callback = null, p = f.priorityLevel;
          var T = L(f.expirationTime <= I);
          I = e.unstable_now(), typeof T == "function" ? f.callback = T : f === n(a) && r(a), h(I);
        } else r(a);
        f = n(a);
      }
      if (f !== null) var $ = !0;
      else {
        var U = n(s);
        U !== null && xn(x, U.startTime - I), $ = !1;
      }
      return $;
    } finally {
      f = null, p = w, y = !1;
    }
  }
  var _ = !1, C = null, R = -1, j = 5, D = -1;
  function b() {
    return !(e.unstable_now() - D < j);
  }
  function _t() {
    if (C !== null) {
      var z = e.unstable_now();
      D = z;
      var I = !0;
      try {
        I = C(!0, z);
      } finally {
        I ? Ct() : (_ = !1, C = null);
      }
    } else _ = !1;
  }
  var Ct;
  if (typeof d == "function") Ct = function() {
    d(_t);
  };
  else if (typeof MessageChannel < "u") {
    var yr = new MessageChannel(), Bl = yr.port2;
    yr.port1.onmessage = _t, Ct = function() {
      Bl.postMessage(null);
    };
  } else Ct = function() {
    P(_t, 0);
  };
  function Sn(z) {
    C = z, _ || (_ = !0, Ct());
  }
  function xn(z, I) {
    R = P(function() {
      z(e.unstable_now());
    }, I);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(z) {
    z.callback = null;
  }, e.unstable_continueExecution = function() {
    v || y || (v = !0, Sn(S));
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
    var w = p;
    p = I;
    try {
      return z();
    } finally {
      p = w;
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
    var w = p;
    p = z;
    try {
      return I();
    } finally {
      p = w;
    }
  }, e.unstable_scheduleCallback = function(z, I, w) {
    var L = e.unstable_now();
    switch (typeof w == "object" && w !== null ? (w = w.delay, w = typeof w == "number" && 0 < w ? L + w : L) : w = L, z) {
      case 1:
        var T = -1;
        break;
      case 2:
        T = 250;
        break;
      case 5:
        T = 1073741823;
        break;
      case 4:
        T = 1e4;
        break;
      default:
        T = 5e3;
    }
    return T = w + T, z = { id: c++, callback: I, priorityLevel: z, startTime: w, expirationTime: T, sortIndex: -1 }, w > L ? (z.sortIndex = w, t(s, z), n(a) === null && z === n(s) && (k ? (m(R), R = -1) : k = !0, xn(x, w - L))) : (z.sortIndex = T, t(a, z), v || y || (v = !0, Sn(S))), z;
  }, e.unstable_shouldYield = b, e.unstable_wrapCallback = function(z) {
    var I = p;
    return function() {
      var w = p;
      p = I;
      try {
        return z.apply(this, arguments);
      } finally {
        p = w;
      }
    };
  };
})(ts);
es.exports = ts;
var Vf = es.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Wf = M, ze = Vf;
function E(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var ns = /* @__PURE__ */ new Set(), Kn = {};
function At(e, t) {
  sn(e, t), sn(e + "Capture", t);
}
function sn(e, t) {
  for (Kn[e] = t, e = 0; e < t.length; e++) ns.add(t[e]);
}
var be = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), wi = Object.prototype.hasOwnProperty, Hf = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, Su = {}, xu = {};
function Qf(e) {
  return wi.call(xu, e) ? !0 : wi.call(Su, e) ? !1 : Hf.test(e) ? xu[e] = !0 : (Su[e] = !0, !1);
}
function Yf(e, t, n, r) {
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
function Xf(e, t, n, r) {
  if (t === null || typeof t > "u" || Yf(e, t, n, r)) return !0;
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
  (l !== null ? l.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (Xf(t, n, l, r) && (n = null), r || l === null ? Qf(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : l.mustUseProperty ? e[l.propertyName] = n === null ? l.type === 3 ? !1 : "" : n : (t = l.attributeName, r = l.attributeNamespace, n === null ? e.removeAttribute(t) : (l = l.type, n = l === 3 || l === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var rt = Wf.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, xr = Symbol.for("react.element"), Wt = Symbol.for("react.portal"), Ht = Symbol.for("react.fragment"), ko = Symbol.for("react.strict_mode"), Si = Symbol.for("react.profiler"), rs = Symbol.for("react.provider"), ls = Symbol.for("react.context"), Eo = Symbol.for("react.forward_ref"), xi = Symbol.for("react.suspense"), ki = Symbol.for("react.suspense_list"), _o = Symbol.for("react.memo"), it = Symbol.for("react.lazy"), is = Symbol.for("react.offscreen"), ku = Symbol.iterator;
function Cn(e) {
  return e === null || typeof e != "object" ? null : (e = ku && e[ku] || e["@@iterator"], typeof e == "function" ? e : null);
}
var J = Object.assign, Wl;
function In(e) {
  if (Wl === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    Wl = t && t[1] || "";
  }
  return `
` + Wl + e;
}
var Hl = !1;
function Ql(e, t) {
  if (!e || Hl) return "";
  Hl = !0;
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
    Hl = !1, Error.prepareStackTrace = n;
  }
  return (e = e ? e.displayName || e.name : "") ? In(e) : "";
}
function Kf(e) {
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
      return e = Ql(e.type, !1), e;
    case 11:
      return e = Ql(e.type.render, !1), e;
    case 1:
      return e = Ql(e.type, !0), e;
    default:
      return "";
  }
}
function Ei(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Ht:
      return "Fragment";
    case Wt:
      return "Portal";
    case Si:
      return "Profiler";
    case ko:
      return "StrictMode";
    case xi:
      return "Suspense";
    case ki:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case ls:
      return (e.displayName || "Context") + ".Consumer";
    case rs:
      return (e._context.displayName || "Context") + ".Provider";
    case Eo:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case _o:
      return t = e.displayName || null, t !== null ? t : Ei(e.type) || "Memo";
    case it:
      t = e._payload, e = e._init;
      try {
        return Ei(e(t));
      } catch {
      }
  }
  return null;
}
function Gf(e) {
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
      return Ei(t);
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
function os(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function Zf(e) {
  var t = os(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
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
function kr(e) {
  e._valueTracker || (e._valueTracker = Zf(e));
}
function us(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(), r = "";
  return e && (r = os(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
}
function qr(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function _i(e, t) {
  var n = t.checked;
  return J({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function Eu(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = wt(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function as(e, t) {
  t = t.checked, t != null && xo(e, "checked", t, !1);
}
function Ci(e, t) {
  as(e, t);
  var n = wt(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? Pi(e, t.type, n) : t.hasOwnProperty("defaultValue") && Pi(e, t.type, wt(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function _u(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function Pi(e, t, n) {
  (t !== "number" || qr(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
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
function zi(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(E(91));
  return J({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function Cu(e, t) {
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
function ss(e, t) {
  var n = wt(t.value), r = wt(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function Pu(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function cs(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function Ti(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? cs(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var Er, fs = function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, l) {
    MSApp.execUnsafeLocalFunction(function() {
      return e(t, n, r, l);
    });
  } : e;
}(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
  else {
    for (Er = Er || document.createElement("div"), Er.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = Er.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
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
}, Jf = ["Webkit", "ms", "Moz", "O"];
Object.keys(Un).forEach(function(e) {
  Jf.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), Un[t] = Un[e];
  });
});
function ds(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || Un.hasOwnProperty(e) && Un[e] ? ("" + t).trim() : t + "px";
}
function ps(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, l = ds(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, l) : e[n] = l;
  }
}
var qf = J({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
function Ni(e, t) {
  if (t) {
    if (qf[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(E(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(E(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(E(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(E(62));
  }
}
function ji(e, t) {
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
var Ri = null;
function Co(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var Li = null, nn = null, rn = null;
function zu(e) {
  if (e = hr(e)) {
    if (typeof Li != "function") throw Error(E(280));
    var t = e.stateNode;
    t && (t = Pl(t), Li(e.stateNode, e.type, t));
  }
}
function ms(e) {
  nn ? rn ? rn.push(e) : rn = [e] : nn = e;
}
function hs() {
  if (nn) {
    var e = nn, t = rn;
    if (rn = nn = null, zu(e), t) for (e = 0; e < t.length; e++) zu(t[e]);
  }
}
function vs(e, t) {
  return e(t);
}
function ys() {
}
var Yl = !1;
function gs(e, t, n) {
  if (Yl) return e(t, n);
  Yl = !0;
  try {
    return vs(e, t, n);
  } finally {
    Yl = !1, (nn !== null || rn !== null) && (ys(), hs());
  }
}
function Zn(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = Pl(n);
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
var Di = !1;
if (be) try {
  var Pn = {};
  Object.defineProperty(Pn, "passive", { get: function() {
    Di = !0;
  } }), window.addEventListener("test", Pn, Pn), window.removeEventListener("test", Pn, Pn);
} catch {
  Di = !1;
}
function bf(e, t, n, r, l, i, o, u, a) {
  var s = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, s);
  } catch (c) {
    this.onError(c);
  }
}
var An = !1, br = null, el = !1, Mi = null, ed = { onError: function(e) {
  An = !0, br = e;
} };
function td(e, t, n, r, l, i, o, u, a) {
  An = !1, br = null, bf.apply(ed, arguments);
}
function nd(e, t, n, r, l, i, o, u, a) {
  if (td.apply(this, arguments), An) {
    if (An) {
      var s = br;
      An = !1, br = null;
    } else throw Error(E(198));
    el || (el = !0, Mi = s);
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
function ws(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function Tu(e) {
  if (Bt(e) !== e) throw Error(E(188));
}
function rd(e) {
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
        if (i === n) return Tu(l), e;
        if (i === r) return Tu(l), t;
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
function Ss(e) {
  return e = rd(e), e !== null ? xs(e) : null;
}
function xs(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = xs(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var ks = ze.unstable_scheduleCallback, Nu = ze.unstable_cancelCallback, ld = ze.unstable_shouldYield, id = ze.unstable_requestPaint, ee = ze.unstable_now, od = ze.unstable_getCurrentPriorityLevel, Po = ze.unstable_ImmediatePriority, Es = ze.unstable_UserBlockingPriority, tl = ze.unstable_NormalPriority, ud = ze.unstable_LowPriority, _s = ze.unstable_IdlePriority, kl = null, Ye = null;
function ad(e) {
  if (Ye && typeof Ye.onCommitFiberRoot == "function") try {
    Ye.onCommitFiberRoot(kl, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var Ae = Math.clz32 ? Math.clz32 : fd, sd = Math.log, cd = Math.LN2;
function fd(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (sd(e) / cd | 0) | 0;
}
var _r = 64, Cr = 4194304;
function On(e) {
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
function nl(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0, l = e.suspendedLanes, i = e.pingedLanes, o = n & 268435455;
  if (o !== 0) {
    var u = o & ~l;
    u !== 0 ? r = On(u) : (i &= o, i !== 0 && (r = On(i)));
  } else o = n & ~l, o !== 0 ? r = On(o) : i !== 0 && (r = On(i));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & l) && (l = r & -r, i = t & -t, l >= i || l === 16 && (i & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - Ae(t), l = 1 << n, r |= e[n], t &= ~l;
  return r;
}
function dd(e, t) {
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
function pd(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, i = e.pendingLanes; 0 < i; ) {
    var o = 31 - Ae(i), u = 1 << o, a = l[o];
    a === -1 ? (!(u & n) || u & r) && (l[o] = dd(u, t)) : a <= t && (e.expiredLanes |= u), i &= ~u;
  }
}
function Ii(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function Cs() {
  var e = _r;
  return _r <<= 1, !(_r & 4194240) && (_r = 64), e;
}
function Xl(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function pr(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - Ae(t), e[t] = n;
}
function md(e, t) {
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
function Ps(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var zs, To, Ts, Ns, js, $i = !1, Pr = [], ft = null, dt = null, pt = null, Jn = /* @__PURE__ */ new Map(), qn = /* @__PURE__ */ new Map(), ut = [], hd = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function ju(e, t) {
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
function vd(e, t, n, r, l) {
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
function Rs(e) {
  var t = jt(e.target);
  if (t !== null) {
    var n = Bt(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = ws(n), t !== null) {
          e.blockedOn = t, js(e.priority, function() {
            Ts(n);
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
function Vr(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Oi(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      Ri = r, n.target.dispatchEvent(r), Ri = null;
    } else return t = hr(n), t !== null && To(t), e.blockedOn = n, !1;
    t.shift();
  }
  return !0;
}
function Ru(e, t, n) {
  Vr(e) && n.delete(t);
}
function yd() {
  $i = !1, ft !== null && Vr(ft) && (ft = null), dt !== null && Vr(dt) && (dt = null), pt !== null && Vr(pt) && (pt = null), Jn.forEach(Ru), qn.forEach(Ru);
}
function Tn(e, t) {
  e.blockedOn === t && (e.blockedOn = null, $i || ($i = !0, ze.unstable_scheduleCallback(ze.unstable_NormalPriority, yd)));
}
function bn(e) {
  function t(l) {
    return Tn(l, e);
  }
  if (0 < Pr.length) {
    Tn(Pr[0], e);
    for (var n = 1; n < Pr.length; n++) {
      var r = Pr[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (ft !== null && Tn(ft, e), dt !== null && Tn(dt, e), pt !== null && Tn(pt, e), Jn.forEach(t), qn.forEach(t), n = 0; n < ut.length; n++) r = ut[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < ut.length && (n = ut[0], n.blockedOn === null); ) Rs(n), n.blockedOn === null && ut.shift();
}
var ln = rt.ReactCurrentBatchConfig, rl = !0;
function gd(e, t, n, r) {
  var l = H, i = ln.transition;
  ln.transition = null;
  try {
    H = 1, No(e, t, n, r);
  } finally {
    H = l, ln.transition = i;
  }
}
function wd(e, t, n, r) {
  var l = H, i = ln.transition;
  ln.transition = null;
  try {
    H = 4, No(e, t, n, r);
  } finally {
    H = l, ln.transition = i;
  }
}
function No(e, t, n, r) {
  if (rl) {
    var l = Oi(e, t, n, r);
    if (l === null) ri(e, t, r, ll, n), ju(e, r);
    else if (vd(l, e, t, n, r)) r.stopPropagation();
    else if (ju(e, r), t & 4 && -1 < hd.indexOf(e)) {
      for (; l !== null; ) {
        var i = hr(l);
        if (i !== null && zs(i), i = Oi(e, t, n, r), i === null && ri(e, t, r, ll, n), i === l) break;
        l = i;
      }
      l !== null && r.stopPropagation();
    } else ri(e, t, r, null, n);
  }
}
var ll = null;
function Oi(e, t, n, r) {
  if (ll = null, e = Co(r), e = jt(e), e !== null) if (t = Bt(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = ws(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return ll = e, null;
}
function Ls(e) {
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
      switch (od()) {
        case Po:
          return 1;
        case Es:
          return 4;
        case tl:
        case ud:
          return 16;
        case _s:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var st = null, jo = null, Wr = null;
function Ds() {
  if (Wr) return Wr;
  var e, t = jo, n = t.length, r, l = "value" in st ? st.value : st.textContent, i = l.length;
  for (e = 0; e < n && t[e] === l[e]; e++) ;
  var o = n - e;
  for (r = 1; r <= o && t[n - r] === l[i - r]; r++) ;
  return Wr = l.slice(e, 1 < r ? 1 - r : void 0);
}
function Hr(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function zr() {
  return !0;
}
function Lu() {
  return !1;
}
function Ne(e) {
  function t(n, r, l, i, o) {
    this._reactName = n, this._targetInst = l, this.type = r, this.nativeEvent = i, this.target = o, this.currentTarget = null;
    for (var u in e) e.hasOwnProperty(u) && (n = e[u], this[u] = n ? n(i) : i[u]);
    return this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1) ? zr : Lu, this.isPropagationStopped = Lu, this;
  }
  return J(t.prototype, { preventDefault: function() {
    this.defaultPrevented = !0;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = zr);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = zr);
  }, persist: function() {
  }, isPersistent: zr }), t;
}
var gn = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, Ro = Ne(gn), mr = J({}, gn, { view: 0, detail: 0 }), Sd = Ne(mr), Kl, Gl, Nn, El = J({}, mr, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: Lo, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== Nn && (Nn && e.type === "mousemove" ? (Kl = e.screenX - Nn.screenX, Gl = e.screenY - Nn.screenY) : Gl = Kl = 0, Nn = e), Kl);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : Gl;
} }), Du = Ne(El), xd = J({}, El, { dataTransfer: 0 }), kd = Ne(xd), Ed = J({}, mr, { relatedTarget: 0 }), Zl = Ne(Ed), _d = J({}, gn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Cd = Ne(_d), Pd = J({}, gn, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), zd = Ne(Pd), Td = J({}, gn, { data: 0 }), Mu = Ne(Td), Nd = {
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
}, jd = {
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
}, Rd = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function Ld(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = Rd[e]) ? !!t[e] : !1;
}
function Lo() {
  return Ld;
}
var Dd = J({}, mr, { key: function(e) {
  if (e.key) {
    var t = Nd[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = Hr(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? jd[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: Lo, charCode: function(e) {
  return e.type === "keypress" ? Hr(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? Hr(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), Md = Ne(Dd), Id = J({}, El, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Iu = Ne(Id), $d = J({}, mr, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: Lo }), Od = Ne($d), Fd = J({}, gn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Ud = Ne(Fd), Ad = J({}, El, {
  deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  },
  deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), Bd = Ne(Ad), Vd = [9, 13, 27, 32], Do = be && "CompositionEvent" in window, Bn = null;
be && "documentMode" in document && (Bn = document.documentMode);
var Wd = be && "TextEvent" in window && !Bn, Ms = be && (!Do || Bn && 8 < Bn && 11 >= Bn), $u = " ", Ou = !1;
function Is(e, t) {
  switch (e) {
    case "keyup":
      return Vd.indexOf(t.keyCode) !== -1;
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
function $s(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var Qt = !1;
function Hd(e, t) {
  switch (e) {
    case "compositionend":
      return $s(t);
    case "keypress":
      return t.which !== 32 ? null : (Ou = !0, $u);
    case "textInput":
      return e = t.data, e === $u && Ou ? null : e;
    default:
      return null;
  }
}
function Qd(e, t) {
  if (Qt) return e === "compositionend" || !Do && Is(e, t) ? (e = Ds(), Wr = jo = st = null, Qt = !1, e) : null;
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
      return Ms && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var Yd = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
function Fu(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!Yd[e.type] : t === "textarea";
}
function Os(e, t, n, r) {
  ms(r), t = il(t, "onChange"), 0 < t.length && (n = new Ro("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var Vn = null, er = null;
function Xd(e) {
  Ks(e, 0);
}
function _l(e) {
  var t = Kt(e);
  if (us(t)) return e;
}
function Kd(e, t) {
  if (e === "change") return t;
}
var Fs = !1;
if (be) {
  var Jl;
  if (be) {
    var ql = "oninput" in document;
    if (!ql) {
      var Uu = document.createElement("div");
      Uu.setAttribute("oninput", "return;"), ql = typeof Uu.oninput == "function";
    }
    Jl = ql;
  } else Jl = !1;
  Fs = Jl && (!document.documentMode || 9 < document.documentMode);
}
function Au() {
  Vn && (Vn.detachEvent("onpropertychange", Us), er = Vn = null);
}
function Us(e) {
  if (e.propertyName === "value" && _l(er)) {
    var t = [];
    Os(t, er, e, Co(e)), gs(Xd, t);
  }
}
function Gd(e, t, n) {
  e === "focusin" ? (Au(), Vn = t, er = n, Vn.attachEvent("onpropertychange", Us)) : e === "focusout" && Au();
}
function Zd(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return _l(er);
}
function Jd(e, t) {
  if (e === "click") return _l(t);
}
function qd(e, t) {
  if (e === "input" || e === "change") return _l(t);
}
function bd(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Ve = typeof Object.is == "function" ? Object.is : bd;
function tr(e, t) {
  if (Ve(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var l = n[r];
    if (!wi.call(t, l) || !Ve(e[l], t[l])) return !1;
  }
  return !0;
}
function Bu(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function Vu(e, t) {
  var n = Bu(e);
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
    n = Bu(n);
  }
}
function As(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? As(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function Bs() {
  for (var e = window, t = qr(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = qr(e.document);
  }
  return t;
}
function Mo(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
}
function ep(e) {
  var t = Bs(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && As(n.ownerDocument.documentElement, n)) {
    if (r !== null && Mo(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
      else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var l = n.textContent.length, i = Math.min(r.start, l);
        r = r.end === void 0 ? i : Math.min(r.end, l), !e.extend && i > r && (l = r, r = i, i = l), l = Vu(n, i);
        var o = Vu(
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
var tp = be && "documentMode" in document && 11 >= document.documentMode, Yt = null, Fi = null, Wn = null, Ui = !1;
function Wu(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Ui || Yt == null || Yt !== qr(r) || (r = Yt, "selectionStart" in r && Mo(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), Wn && tr(Wn, r) || (Wn = r, r = il(Fi, "onSelect"), 0 < r.length && (t = new Ro("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = Yt)));
}
function Tr(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var Xt = { animationend: Tr("Animation", "AnimationEnd"), animationiteration: Tr("Animation", "AnimationIteration"), animationstart: Tr("Animation", "AnimationStart"), transitionend: Tr("Transition", "TransitionEnd") }, bl = {}, Vs = {};
be && (Vs = document.createElement("div").style, "AnimationEvent" in window || (delete Xt.animationend.animation, delete Xt.animationiteration.animation, delete Xt.animationstart.animation), "TransitionEvent" in window || delete Xt.transitionend.transition);
function Cl(e) {
  if (bl[e]) return bl[e];
  if (!Xt[e]) return e;
  var t = Xt[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in Vs) return bl[e] = t[n];
  return e;
}
var Ws = Cl("animationend"), Hs = Cl("animationiteration"), Qs = Cl("animationstart"), Ys = Cl("transitionend"), Xs = /* @__PURE__ */ new Map(), Hu = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function xt(e, t) {
  Xs.set(e, t), At(t, [e]);
}
for (var ei = 0; ei < Hu.length; ei++) {
  var ti = Hu[ei], np = ti.toLowerCase(), rp = ti[0].toUpperCase() + ti.slice(1);
  xt(np, "on" + rp);
}
xt(Ws, "onAnimationEnd");
xt(Hs, "onAnimationIteration");
xt(Qs, "onAnimationStart");
xt("dblclick", "onDoubleClick");
xt("focusin", "onFocus");
xt("focusout", "onBlur");
xt(Ys, "onTransitionEnd");
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
var Fn = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), lp = new Set("cancel close invalid load scroll toggle".split(" ").concat(Fn));
function Qu(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, nd(r, t, void 0, e), e.currentTarget = null;
}
function Ks(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n], l = r.event;
    r = r.listeners;
    e: {
      var i = void 0;
      if (t) for (var o = r.length - 1; 0 <= o; o--) {
        var u = r[o], a = u.instance, s = u.currentTarget;
        if (u = u.listener, a !== i && l.isPropagationStopped()) break e;
        Qu(l, u, s), i = a;
      }
      else for (o = 0; o < r.length; o++) {
        if (u = r[o], a = u.instance, s = u.currentTarget, u = u.listener, a !== i && l.isPropagationStopped()) break e;
        Qu(l, u, s), i = a;
      }
    }
  }
  if (el) throw e = Mi, el = !1, Mi = null, e;
}
function Y(e, t) {
  var n = t[Hi];
  n === void 0 && (n = t[Hi] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (Gs(t, e, 2, !1), n.add(r));
}
function ni(e, t, n) {
  var r = 0;
  t && (r |= 4), Gs(n, e, r, t);
}
var Nr = "_reactListening" + Math.random().toString(36).slice(2);
function nr(e) {
  if (!e[Nr]) {
    e[Nr] = !0, ns.forEach(function(n) {
      n !== "selectionchange" && (lp.has(n) || ni(n, !1, e), ni(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Nr] || (t[Nr] = !0, ni("selectionchange", !1, t));
  }
}
function Gs(e, t, n, r) {
  switch (Ls(t)) {
    case 1:
      var l = gd;
      break;
    case 4:
      l = wd;
      break;
    default:
      l = No;
  }
  n = l.bind(null, t, n, e), l = void 0, !Di || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (l = !0), r ? l !== void 0 ? e.addEventListener(t, n, { capture: !0, passive: l }) : e.addEventListener(t, n, !0) : l !== void 0 ? e.addEventListener(t, n, { passive: l }) : e.addEventListener(t, n, !1);
}
function ri(e, t, n, r, l) {
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
  gs(function() {
    var s = i, c = Co(n), f = [];
    e: {
      var p = Xs.get(e);
      if (p !== void 0) {
        var y = Ro, v = e;
        switch (e) {
          case "keypress":
            if (Hr(n) === 0) break e;
          case "keydown":
          case "keyup":
            y = Md;
            break;
          case "focusin":
            v = "focus", y = Zl;
            break;
          case "focusout":
            v = "blur", y = Zl;
            break;
          case "beforeblur":
          case "afterblur":
            y = Zl;
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
            y = Du;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            y = kd;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            y = Od;
            break;
          case Ws:
          case Hs:
          case Qs:
            y = Cd;
            break;
          case Ys:
            y = Ud;
            break;
          case "scroll":
            y = Sd;
            break;
          case "wheel":
            y = Bd;
            break;
          case "copy":
          case "cut":
          case "paste":
            y = zd;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            y = Iu;
        }
        var k = (t & 4) !== 0, P = !k && e === "scroll", m = k ? p !== null ? p + "Capture" : null : p;
        k = [];
        for (var d = s, h; d !== null; ) {
          h = d;
          var x = h.stateNode;
          if (h.tag === 5 && x !== null && (h = x, m !== null && (x = Zn(d, m), x != null && k.push(rr(d, x, h)))), P) break;
          d = d.return;
        }
        0 < k.length && (p = new y(p, v, null, n, c), f.push({ event: p, listeners: k }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (p = e === "mouseover" || e === "pointerover", y = e === "mouseout" || e === "pointerout", p && n !== Ri && (v = n.relatedTarget || n.fromElement) && (jt(v) || v[et])) break e;
        if ((y || p) && (p = c.window === c ? c : (p = c.ownerDocument) ? p.defaultView || p.parentWindow : window, y ? (v = n.relatedTarget || n.toElement, y = s, v = v ? jt(v) : null, v !== null && (P = Bt(v), v !== P || v.tag !== 5 && v.tag !== 6) && (v = null)) : (y = null, v = s), y !== v)) {
          if (k = Du, x = "onMouseLeave", m = "onMouseEnter", d = "mouse", (e === "pointerout" || e === "pointerover") && (k = Iu, x = "onPointerLeave", m = "onPointerEnter", d = "pointer"), P = y == null ? p : Kt(y), h = v == null ? p : Kt(v), p = new k(x, d + "leave", y, n, c), p.target = P, p.relatedTarget = h, x = null, jt(c) === s && (k = new k(m, d + "enter", v, n, c), k.target = h, k.relatedTarget = P, x = k), P = x, y && v) t: {
            for (k = y, m = v, d = 0, h = k; h; h = Vt(h)) d++;
            for (h = 0, x = m; x; x = Vt(x)) h++;
            for (; 0 < d - h; ) k = Vt(k), d--;
            for (; 0 < h - d; ) m = Vt(m), h--;
            for (; d--; ) {
              if (k === m || m !== null && k === m.alternate) break t;
              k = Vt(k), m = Vt(m);
            }
            k = null;
          }
          else k = null;
          y !== null && Yu(f, p, y, k, !1), v !== null && P !== null && Yu(f, P, v, k, !0);
        }
      }
      e: {
        if (p = s ? Kt(s) : window, y = p.nodeName && p.nodeName.toLowerCase(), y === "select" || y === "input" && p.type === "file") var S = Kd;
        else if (Fu(p)) if (Fs) S = qd;
        else {
          S = Zd;
          var _ = Gd;
        }
        else (y = p.nodeName) && y.toLowerCase() === "input" && (p.type === "checkbox" || p.type === "radio") && (S = Jd);
        if (S && (S = S(e, s))) {
          Os(f, S, n, c);
          break e;
        }
        _ && _(e, p, s), e === "focusout" && (_ = p._wrapperState) && _.controlled && p.type === "number" && Pi(p, "number", p.value);
      }
      switch (_ = s ? Kt(s) : window, e) {
        case "focusin":
          (Fu(_) || _.contentEditable === "true") && (Yt = _, Fi = s, Wn = null);
          break;
        case "focusout":
          Wn = Fi = Yt = null;
          break;
        case "mousedown":
          Ui = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Ui = !1, Wu(f, n, c);
          break;
        case "selectionchange":
          if (tp) break;
        case "keydown":
        case "keyup":
          Wu(f, n, c);
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
      else Qt ? Is(e, n) && (R = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (R = "onCompositionStart");
      R && (Ms && n.locale !== "ko" && (Qt || R !== "onCompositionStart" ? R === "onCompositionEnd" && Qt && (C = Ds()) : (st = c, jo = "value" in st ? st.value : st.textContent, Qt = !0)), _ = il(s, R), 0 < _.length && (R = new Mu(R, e, null, n, c), f.push({ event: R, listeners: _ }), C ? R.data = C : (C = $s(n), C !== null && (R.data = C)))), (C = Wd ? Hd(e, n) : Qd(e, n)) && (s = il(s, "onBeforeInput"), 0 < s.length && (c = new Mu("onBeforeInput", "beforeinput", null, n, c), f.push({ event: c, listeners: s }), c.data = C));
    }
    Ks(f, t);
  });
}
function rr(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function il(e, t) {
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
function Yu(e, t, n, r, l) {
  for (var i = t._reactName, o = []; n !== null && n !== r; ) {
    var u = n, a = u.alternate, s = u.stateNode;
    if (a !== null && a === r) break;
    u.tag === 5 && s !== null && (u = s, l ? (a = Zn(n, i), a != null && o.unshift(rr(n, a, u))) : l || (a = Zn(n, i), a != null && o.push(rr(n, a, u)))), n = n.return;
  }
  o.length !== 0 && e.push({ event: t, listeners: o });
}
var ip = /\r\n?/g, op = /\u0000|\uFFFD/g;
function Xu(e) {
  return (typeof e == "string" ? e : "" + e).replace(ip, `
`).replace(op, "");
}
function jr(e, t, n) {
  if (t = Xu(t), Xu(e) !== t && n) throw Error(E(425));
}
function ol() {
}
var Ai = null, Bi = null;
function Vi(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var Wi = typeof setTimeout == "function" ? setTimeout : void 0, up = typeof clearTimeout == "function" ? clearTimeout : void 0, Ku = typeof Promise == "function" ? Promise : void 0, ap = typeof queueMicrotask == "function" ? queueMicrotask : typeof Ku < "u" ? function(e) {
  return Ku.resolve(null).then(e).catch(sp);
} : Wi;
function sp(e) {
  setTimeout(function() {
    throw e;
  });
}
function li(e, t) {
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
function mt(e) {
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
function Gu(e) {
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
var wn = Math.random().toString(36).slice(2), Qe = "__reactFiber$" + wn, lr = "__reactProps$" + wn, et = "__reactContainer$" + wn, Hi = "__reactEvents$" + wn, cp = "__reactListeners$" + wn, fp = "__reactHandles$" + wn;
function jt(e) {
  var t = e[Qe];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[et] || n[Qe]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = Gu(e); e !== null; ) {
        if (n = e[Qe]) return n;
        e = Gu(e);
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
function Pl(e) {
  return e[lr] || null;
}
var Qi = [], Gt = -1;
function kt(e) {
  return { current: e };
}
function X(e) {
  0 > Gt || (e.current = Qi[Gt], Qi[Gt] = null, Gt--);
}
function Q(e, t) {
  Gt++, Qi[Gt] = e.current, e.current = t;
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
function ul() {
  X(Se), X(pe);
}
function Zu(e, t, n) {
  if (pe.current !== St) throw Error(E(168));
  Q(pe, t), Q(Se, n);
}
function Zs(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var l in r) if (!(l in t)) throw Error(E(108, Gf(e) || "Unknown", l));
  return J({}, n, r);
}
function al(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || St, It = pe.current, Q(pe, e), Q(Se, Se.current), !0;
}
function Ju(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(E(169));
  n ? (e = Zs(e, t, It), r.__reactInternalMemoizedMergedChildContext = e, X(Se), X(pe), Q(pe, e)) : X(Se), Q(Se, n);
}
var Ge = null, zl = !1, ii = !1;
function Js(e) {
  Ge === null ? Ge = [e] : Ge.push(e);
}
function dp(e) {
  zl = !0, Js(e);
}
function Et() {
  if (!ii && Ge !== null) {
    ii = !0;
    var e = 0, t = H;
    try {
      var n = Ge;
      for (H = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(!0);
        while (r !== null);
      }
      Ge = null, zl = !1;
    } catch (l) {
      throw Ge !== null && (Ge = Ge.slice(e + 1)), ks(Po, Et), l;
    } finally {
      H = t, ii = !1;
    }
  }
  return null;
}
var Zt = [], Jt = 0, sl = null, cl = 0, je = [], Re = 0, $t = null, Ze = 1, Je = "";
function Tt(e, t) {
  Zt[Jt++] = cl, Zt[Jt++] = sl, sl = e, cl = t;
}
function qs(e, t, n) {
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
  e.return !== null && (Tt(e, 1), qs(e, 1, 0));
}
function $o(e) {
  for (; e === sl; ) sl = Zt[--Jt], Zt[Jt] = null, cl = Zt[--Jt], Zt[Jt] = null;
  for (; e === $t; ) $t = je[--Re], je[Re] = null, Je = je[--Re], je[Re] = null, Ze = je[--Re], je[Re] = null;
}
var Pe = null, Ce = null, K = !1, Ue = null;
function bs(e, t) {
  var n = Le(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function qu(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, Pe = e, Ce = mt(t.firstChild), !0) : !1;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, Pe = e, Ce = null, !0) : !1;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = $t !== null ? { id: Ze, overflow: Je } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = Le(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, Pe = e, Ce = null, !0) : !1;
    default:
      return !1;
  }
}
function Yi(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function Xi(e) {
  if (K) {
    var t = Ce;
    if (t) {
      var n = t;
      if (!qu(e, t)) {
        if (Yi(e)) throw Error(E(418));
        t = mt(n.nextSibling);
        var r = Pe;
        t && qu(e, t) ? bs(r, n) : (e.flags = e.flags & -4097 | 2, K = !1, Pe = e);
      }
    } else {
      if (Yi(e)) throw Error(E(418));
      e.flags = e.flags & -4097 | 2, K = !1, Pe = e;
    }
  }
}
function bu(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  Pe = e;
}
function Rr(e) {
  if (e !== Pe) return !1;
  if (!K) return bu(e), K = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !Vi(e.type, e.memoizedProps)), t && (t = Ce)) {
    if (Yi(e)) throw ec(), Error(E(418));
    for (; t; ) bs(e, t), t = mt(t.nextSibling);
  }
  if (bu(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(E(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              Ce = mt(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      Ce = null;
    }
  } else Ce = Pe ? mt(e.stateNode.nextSibling) : null;
  return !0;
}
function ec() {
  for (var e = Ce; e; ) e = mt(e.nextSibling);
}
function fn() {
  Ce = Pe = null, K = !1;
}
function Oo(e) {
  Ue === null ? Ue = [e] : Ue.push(e);
}
var pp = rt.ReactCurrentBatchConfig;
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
function Lr(e, t) {
  throw e = Object.prototype.toString.call(t), Error(E(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function ea(e) {
  var t = e._init;
  return t(e._payload);
}
function tc(e) {
  function t(m, d) {
    if (e) {
      var h = m.deletions;
      h === null ? (m.deletions = [d], m.flags |= 16) : h.push(d);
    }
  }
  function n(m, d) {
    if (!e) return null;
    for (; d !== null; ) t(m, d), d = d.sibling;
    return null;
  }
  function r(m, d) {
    for (m = /* @__PURE__ */ new Map(); d !== null; ) d.key !== null ? m.set(d.key, d) : m.set(d.index, d), d = d.sibling;
    return m;
  }
  function l(m, d) {
    return m = gt(m, d), m.index = 0, m.sibling = null, m;
  }
  function i(m, d, h) {
    return m.index = h, e ? (h = m.alternate, h !== null ? (h = h.index, h < d ? (m.flags |= 2, d) : h) : (m.flags |= 2, d)) : (m.flags |= 1048576, d);
  }
  function o(m) {
    return e && m.alternate === null && (m.flags |= 2), m;
  }
  function u(m, d, h, x) {
    return d === null || d.tag !== 6 ? (d = di(h, m.mode, x), d.return = m, d) : (d = l(d, h), d.return = m, d);
  }
  function a(m, d, h, x) {
    var S = h.type;
    return S === Ht ? c(m, d, h.props.children, x, h.key) : d !== null && (d.elementType === S || typeof S == "object" && S !== null && S.$$typeof === it && ea(S) === d.type) ? (x = l(d, h.props), x.ref = jn(m, d, h), x.return = m, x) : (x = Jr(h.type, h.key, h.props, null, m.mode, x), x.ref = jn(m, d, h), x.return = m, x);
  }
  function s(m, d, h, x) {
    return d === null || d.tag !== 4 || d.stateNode.containerInfo !== h.containerInfo || d.stateNode.implementation !== h.implementation ? (d = pi(h, m.mode, x), d.return = m, d) : (d = l(d, h.children || []), d.return = m, d);
  }
  function c(m, d, h, x, S) {
    return d === null || d.tag !== 7 ? (d = Mt(h, m.mode, x, S), d.return = m, d) : (d = l(d, h), d.return = m, d);
  }
  function f(m, d, h) {
    if (typeof d == "string" && d !== "" || typeof d == "number") return d = di("" + d, m.mode, h), d.return = m, d;
    if (typeof d == "object" && d !== null) {
      switch (d.$$typeof) {
        case xr:
          return h = Jr(d.type, d.key, d.props, null, m.mode, h), h.ref = jn(m, null, d), h.return = m, h;
        case Wt:
          return d = pi(d, m.mode, h), d.return = m, d;
        case it:
          var x = d._init;
          return f(m, x(d._payload), h);
      }
      if ($n(d) || Cn(d)) return d = Mt(d, m.mode, h, null), d.return = m, d;
      Lr(m, d);
    }
    return null;
  }
  function p(m, d, h, x) {
    var S = d !== null ? d.key : null;
    if (typeof h == "string" && h !== "" || typeof h == "number") return S !== null ? null : u(m, d, "" + h, x);
    if (typeof h == "object" && h !== null) {
      switch (h.$$typeof) {
        case xr:
          return h.key === S ? a(m, d, h, x) : null;
        case Wt:
          return h.key === S ? s(m, d, h, x) : null;
        case it:
          return S = h._init, p(
            m,
            d,
            S(h._payload),
            x
          );
      }
      if ($n(h) || Cn(h)) return S !== null ? null : c(m, d, h, x, null);
      Lr(m, h);
    }
    return null;
  }
  function y(m, d, h, x, S) {
    if (typeof x == "string" && x !== "" || typeof x == "number") return m = m.get(h) || null, u(d, m, "" + x, S);
    if (typeof x == "object" && x !== null) {
      switch (x.$$typeof) {
        case xr:
          return m = m.get(x.key === null ? h : x.key) || null, a(d, m, x, S);
        case Wt:
          return m = m.get(x.key === null ? h : x.key) || null, s(d, m, x, S);
        case it:
          var _ = x._init;
          return y(m, d, h, _(x._payload), S);
      }
      if ($n(x) || Cn(x)) return m = m.get(h) || null, c(d, m, x, S, null);
      Lr(d, x);
    }
    return null;
  }
  function v(m, d, h, x) {
    for (var S = null, _ = null, C = d, R = d = 0, j = null; C !== null && R < h.length; R++) {
      C.index > R ? (j = C, C = null) : j = C.sibling;
      var D = p(m, C, h[R], x);
      if (D === null) {
        C === null && (C = j);
        break;
      }
      e && C && D.alternate === null && t(m, C), d = i(D, d, R), _ === null ? S = D : _.sibling = D, _ = D, C = j;
    }
    if (R === h.length) return n(m, C), K && Tt(m, R), S;
    if (C === null) {
      for (; R < h.length; R++) C = f(m, h[R], x), C !== null && (d = i(C, d, R), _ === null ? S = C : _.sibling = C, _ = C);
      return K && Tt(m, R), S;
    }
    for (C = r(m, C); R < h.length; R++) j = y(C, m, R, h[R], x), j !== null && (e && j.alternate !== null && C.delete(j.key === null ? R : j.key), d = i(j, d, R), _ === null ? S = j : _.sibling = j, _ = j);
    return e && C.forEach(function(b) {
      return t(m, b);
    }), K && Tt(m, R), S;
  }
  function k(m, d, h, x) {
    var S = Cn(h);
    if (typeof S != "function") throw Error(E(150));
    if (h = S.call(h), h == null) throw Error(E(151));
    for (var _ = S = null, C = d, R = d = 0, j = null, D = h.next(); C !== null && !D.done; R++, D = h.next()) {
      C.index > R ? (j = C, C = null) : j = C.sibling;
      var b = p(m, C, D.value, x);
      if (b === null) {
        C === null && (C = j);
        break;
      }
      e && C && b.alternate === null && t(m, C), d = i(b, d, R), _ === null ? S = b : _.sibling = b, _ = b, C = j;
    }
    if (D.done) return n(
      m,
      C
    ), K && Tt(m, R), S;
    if (C === null) {
      for (; !D.done; R++, D = h.next()) D = f(m, D.value, x), D !== null && (d = i(D, d, R), _ === null ? S = D : _.sibling = D, _ = D);
      return K && Tt(m, R), S;
    }
    for (C = r(m, C); !D.done; R++, D = h.next()) D = y(C, m, R, D.value, x), D !== null && (e && D.alternate !== null && C.delete(D.key === null ? R : D.key), d = i(D, d, R), _ === null ? S = D : _.sibling = D, _ = D);
    return e && C.forEach(function(_t) {
      return t(m, _t);
    }), K && Tt(m, R), S;
  }
  function P(m, d, h, x) {
    if (typeof h == "object" && h !== null && h.type === Ht && h.key === null && (h = h.props.children), typeof h == "object" && h !== null) {
      switch (h.$$typeof) {
        case xr:
          e: {
            for (var S = h.key, _ = d; _ !== null; ) {
              if (_.key === S) {
                if (S = h.type, S === Ht) {
                  if (_.tag === 7) {
                    n(m, _.sibling), d = l(_, h.props.children), d.return = m, m = d;
                    break e;
                  }
                } else if (_.elementType === S || typeof S == "object" && S !== null && S.$$typeof === it && ea(S) === _.type) {
                  n(m, _.sibling), d = l(_, h.props), d.ref = jn(m, _, h), d.return = m, m = d;
                  break e;
                }
                n(m, _);
                break;
              } else t(m, _);
              _ = _.sibling;
            }
            h.type === Ht ? (d = Mt(h.props.children, m.mode, x, h.key), d.return = m, m = d) : (x = Jr(h.type, h.key, h.props, null, m.mode, x), x.ref = jn(m, d, h), x.return = m, m = x);
          }
          return o(m);
        case Wt:
          e: {
            for (_ = h.key; d !== null; ) {
              if (d.key === _) if (d.tag === 4 && d.stateNode.containerInfo === h.containerInfo && d.stateNode.implementation === h.implementation) {
                n(m, d.sibling), d = l(d, h.children || []), d.return = m, m = d;
                break e;
              } else {
                n(m, d);
                break;
              }
              else t(m, d);
              d = d.sibling;
            }
            d = pi(h, m.mode, x), d.return = m, m = d;
          }
          return o(m);
        case it:
          return _ = h._init, P(m, d, _(h._payload), x);
      }
      if ($n(h)) return v(m, d, h, x);
      if (Cn(h)) return k(m, d, h, x);
      Lr(m, h);
    }
    return typeof h == "string" && h !== "" || typeof h == "number" ? (h = "" + h, d !== null && d.tag === 6 ? (n(m, d.sibling), d = l(d, h), d.return = m, m = d) : (n(m, d), d = di(h, m.mode, x), d.return = m, m = d), o(m)) : n(m, d);
  }
  return P;
}
var dn = tc(!0), nc = tc(!1), fl = kt(null), dl = null, qt = null, Fo = null;
function Uo() {
  Fo = qt = dl = null;
}
function Ao(e) {
  var t = fl.current;
  X(fl), e._currentValue = t;
}
function Ki(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function on(e, t) {
  dl = e, Fo = qt = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (we = !0), e.firstContext = null);
}
function Me(e) {
  var t = e._currentValue;
  if (Fo !== e) if (e = { context: e, memoizedValue: t, next: null }, qt === null) {
    if (dl === null) throw Error(E(308));
    qt = e, dl.dependencies = { lanes: 0, firstContext: e };
  } else qt = qt.next = e;
  return t;
}
var Rt = null;
function Bo(e) {
  Rt === null ? Rt = [e] : Rt.push(e);
}
function rc(e, t, n, r) {
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
function lc(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function qe(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function ht(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, B & 2) {
    var l = r.pending;
    return l === null ? t.next = t : (t.next = l.next, l.next = t), r.pending = t, tt(e, n);
  }
  return l = r.interleaved, l === null ? (t.next = t, Bo(r)) : (t.next = l.next, l.next = t), r.interleaved = t, tt(e, n);
}
function Qr(e, t, n) {
  if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, zo(e, n);
  }
}
function ta(e, t) {
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
function pl(e, t, n, r) {
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
          var v = e, k = u;
          switch (p = t, y = n, k.tag) {
            case 1:
              if (v = k.payload, typeof v == "function") {
                f = v.call(y, f, p);
                break e;
              }
              f = v;
              break e;
            case 3:
              v.flags = v.flags & -65537 | 128;
            case 0:
              if (v = k.payload, p = typeof v == "function" ? v.call(y, f, p) : v, p == null) break e;
              f = J({}, f, p);
              break e;
            case 2:
              ot = !0;
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
    Ft |= o, e.lanes = o, e.memoizedState = f;
  }
}
function na(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], l = r.callback;
    if (l !== null) {
      if (r.callback = null, r = n, typeof l != "function") throw Error(E(191, l));
      l.call(r);
    }
  }
}
var vr = {}, Xe = kt(vr), ir = kt(vr), or = kt(vr);
function Lt(e) {
  if (e === vr) throw Error(E(174));
  return e;
}
function Wo(e, t) {
  switch (Q(or, t), Q(ir, e), Q(Xe, vr), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Ti(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Ti(t, e);
  }
  X(Xe), Q(Xe, t);
}
function pn() {
  X(Xe), X(ir), X(or);
}
function ic(e) {
  Lt(or.current);
  var t = Lt(Xe.current), n = Ti(t, e.type);
  t !== n && (Q(ir, e), Q(Xe, n));
}
function Ho(e) {
  ir.current === e && (X(Xe), X(ir));
}
var G = kt(0);
function ml(e) {
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
var oi = [];
function Qo() {
  for (var e = 0; e < oi.length; e++) oi[e]._workInProgressVersionPrimary = null;
  oi.length = 0;
}
var Yr = rt.ReactCurrentDispatcher, ui = rt.ReactCurrentBatchConfig, Ot = 0, Z = null, ne = null, le = null, hl = !1, Hn = !1, ur = 0, mp = 0;
function ce() {
  throw Error(E(321));
}
function Yo(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!Ve(e[n], t[n])) return !1;
  return !0;
}
function Xo(e, t, n, r, l, i) {
  if (Ot = i, Z = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Yr.current = e === null || e.memoizedState === null ? gp : wp, e = n(r, l), Hn) {
    i = 0;
    do {
      if (Hn = !1, ur = 0, 25 <= i) throw Error(E(301));
      i += 1, le = ne = null, t.updateQueue = null, Yr.current = Sp, e = n(r, l);
    } while (Hn);
  }
  if (Yr.current = vl, t = ne !== null && ne.next !== null, Ot = 0, le = ne = Z = null, hl = !1, t) throw Error(E(300));
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
function ai(e) {
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
      if ((Ot & c) === c) a !== null && (a = a.next = { lane: 0, action: s.action, hasEagerState: s.hasEagerState, eagerState: s.eagerState, next: null }), r = s.hasEagerState ? s.eagerState : e(r, s.action);
      else {
        var f = {
          lane: c,
          action: s.action,
          hasEagerState: s.hasEagerState,
          eagerState: s.eagerState,
          next: null
        };
        a === null ? (u = a = f, o = r) : a = a.next = f, Z.lanes |= c, Ft |= c;
      }
      s = s.next;
    } while (s !== null && s !== i);
    a === null ? o = r : a.next = u, Ve(r, t.memoizedState) || (we = !0), t.memoizedState = r, t.baseState = o, t.baseQueue = a, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    l = e;
    do
      i = l.lane, Z.lanes |= i, Ft |= i, l = l.next;
    while (l !== e);
  } else l === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function si(e) {
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
function oc() {
}
function uc(e, t) {
  var n = Z, r = Ie(), l = t(), i = !Ve(r.memoizedState, l);
  if (i && (r.memoizedState = l, we = !0), r = r.queue, Go(cc.bind(null, n, r, e), [e]), r.getSnapshot !== t || i || le !== null && le.memoizedState.tag & 1) {
    if (n.flags |= 2048, sr(9, sc.bind(null, n, r, l, t), void 0, null), ie === null) throw Error(E(349));
    Ot & 30 || ac(n, t, l);
  }
  return l;
}
function ac(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = Z.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, Z.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function sc(e, t, n, r) {
  t.value = n, t.getSnapshot = r, fc(t) && dc(e);
}
function cc(e, t, n) {
  return n(function() {
    fc(t) && dc(e);
  });
}
function fc(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Ve(e, n);
  } catch {
    return !0;
  }
}
function dc(e) {
  var t = tt(e, 1);
  t !== null && Be(t, e, 1, -1);
}
function ra(e) {
  var t = He();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: ar, lastRenderedState: e }, t.queue = e, e = e.dispatch = yp.bind(null, Z, e), [t.memoizedState, e];
}
function sr(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = Z.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, Z.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function pc() {
  return Ie().memoizedState;
}
function Xr(e, t, n, r) {
  var l = He();
  Z.flags |= e, l.memoizedState = sr(1 | t, n, void 0, r === void 0 ? null : r);
}
function Tl(e, t, n, r) {
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
function la(e, t) {
  return Xr(8390656, 8, e, t);
}
function Go(e, t) {
  return Tl(2048, 8, e, t);
}
function mc(e, t) {
  return Tl(4, 2, e, t);
}
function hc(e, t) {
  return Tl(4, 4, e, t);
}
function vc(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function yc(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Tl(4, 4, vc.bind(null, t, e), n);
}
function Zo() {
}
function gc(e, t) {
  var n = Ie();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Yo(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function wc(e, t) {
  var n = Ie();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Yo(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function Sc(e, t, n) {
  return Ot & 21 ? (Ve(n, t) || (n = Cs(), Z.lanes |= n, Ft |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, we = !0), e.memoizedState = n);
}
function hp(e, t) {
  var n = H;
  H = n !== 0 && 4 > n ? n : 4, e(!0);
  var r = ui.transition;
  ui.transition = {};
  try {
    e(!1), t();
  } finally {
    H = n, ui.transition = r;
  }
}
function xc() {
  return Ie().memoizedState;
}
function vp(e, t, n) {
  var r = yt(e);
  if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, kc(e)) Ec(t, n);
  else if (n = rc(e, t, n, r), n !== null) {
    var l = he();
    Be(n, e, r, l), _c(n, t, r);
  }
}
function yp(e, t, n) {
  var r = yt(e), l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (kc(e)) Ec(t, l);
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
    n = rc(e, t, l, r), n !== null && (l = he(), Be(n, e, r, l), _c(n, t, r));
  }
}
function kc(e) {
  var t = e.alternate;
  return e === Z || t !== null && t === Z;
}
function Ec(e, t) {
  Hn = hl = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function _c(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, zo(e, n);
  }
}
var vl = { readContext: Me, useCallback: ce, useContext: ce, useEffect: ce, useImperativeHandle: ce, useInsertionEffect: ce, useLayoutEffect: ce, useMemo: ce, useReducer: ce, useRef: ce, useState: ce, useDebugValue: ce, useDeferredValue: ce, useTransition: ce, useMutableSource: ce, useSyncExternalStore: ce, useId: ce, unstable_isNewReconciler: !1 }, gp = { readContext: Me, useCallback: function(e, t) {
  return He().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: Me, useEffect: la, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Xr(
    4194308,
    4,
    vc.bind(null, t, e),
    n
  );
}, useLayoutEffect: function(e, t) {
  return Xr(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return Xr(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = He();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = He();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = vp.bind(null, Z, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = He();
  return e = { current: e }, t.memoizedState = e;
}, useState: ra, useDebugValue: Zo, useDeferredValue: function(e) {
  return He().memoizedState = e;
}, useTransition: function() {
  var e = ra(!1), t = e[0];
  return e = hp.bind(null, e[1]), He().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = Z, l = He();
  if (K) {
    if (n === void 0) throw Error(E(407));
    n = n();
  } else {
    if (n = t(), ie === null) throw Error(E(349));
    Ot & 30 || ac(r, t, n);
  }
  l.memoizedState = n;
  var i = { value: n, getSnapshot: t };
  return l.queue = i, la(cc.bind(
    null,
    r,
    i,
    e
  ), [e]), r.flags |= 2048, sr(9, sc.bind(null, r, i, n, t), void 0, null), n;
}, useId: function() {
  var e = He(), t = ie.identifierPrefix;
  if (K) {
    var n = Je, r = Ze;
    n = (r & ~(1 << 32 - Ae(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = ur++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = mp++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: !1 }, wp = {
  readContext: Me,
  useCallback: gc,
  useContext: Me,
  useEffect: Go,
  useImperativeHandle: yc,
  useInsertionEffect: mc,
  useLayoutEffect: hc,
  useMemo: wc,
  useReducer: ai,
  useRef: pc,
  useState: function() {
    return ai(ar);
  },
  useDebugValue: Zo,
  useDeferredValue: function(e) {
    var t = Ie();
    return Sc(t, ne.memoizedState, e);
  },
  useTransition: function() {
    var e = ai(ar)[0], t = Ie().memoizedState;
    return [e, t];
  },
  useMutableSource: oc,
  useSyncExternalStore: uc,
  useId: xc,
  unstable_isNewReconciler: !1
}, Sp = { readContext: Me, useCallback: gc, useContext: Me, useEffect: Go, useImperativeHandle: yc, useInsertionEffect: mc, useLayoutEffect: hc, useMemo: wc, useReducer: si, useRef: pc, useState: function() {
  return si(ar);
}, useDebugValue: Zo, useDeferredValue: function(e) {
  var t = Ie();
  return ne === null ? t.memoizedState = e : Sc(t, ne.memoizedState, e);
}, useTransition: function() {
  var e = si(ar)[0], t = Ie().memoizedState;
  return [e, t];
}, useMutableSource: oc, useSyncExternalStore: uc, useId: xc, unstable_isNewReconciler: !1 };
function Oe(e, t) {
  if (e && e.defaultProps) {
    t = J({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function Gi(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : J({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var Nl = { isMounted: function(e) {
  return (e = e._reactInternals) ? Bt(e) === e : !1;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = he(), l = yt(e), i = qe(r, l);
  i.payload = t, n != null && (i.callback = n), t = ht(e, i, l), t !== null && (Be(t, e, l, r), Qr(t, e, l));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = he(), l = yt(e), i = qe(r, l);
  i.tag = 1, i.payload = t, n != null && (i.callback = n), t = ht(e, i, l), t !== null && (Be(t, e, l, r), Qr(t, e, l));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = he(), r = yt(e), l = qe(n, r);
  l.tag = 2, t != null && (l.callback = t), t = ht(e, l, r), t !== null && (Be(t, e, r, n), Qr(t, e, r));
} };
function ia(e, t, n, r, l, i, o) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, i, o) : t.prototype && t.prototype.isPureReactComponent ? !tr(n, r) || !tr(l, i) : !0;
}
function Cc(e, t, n) {
  var r = !1, l = St, i = t.contextType;
  return typeof i == "object" && i !== null ? i = Me(i) : (l = xe(t) ? It : pe.current, r = t.contextTypes, i = (r = r != null) ? cn(e, l) : St), t = new t(n, i), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = Nl, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = l, e.__reactInternalMemoizedMaskedChildContext = i), t;
}
function oa(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Nl.enqueueReplaceState(t, t.state, null);
}
function Zi(e, t, n, r) {
  var l = e.stateNode;
  l.props = n, l.state = e.memoizedState, l.refs = {}, Vo(e);
  var i = t.contextType;
  typeof i == "object" && i !== null ? l.context = Me(i) : (i = xe(t) ? It : pe.current, l.context = cn(e, i)), l.state = e.memoizedState, i = t.getDerivedStateFromProps, typeof i == "function" && (Gi(e, t, i, n), l.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof l.getSnapshotBeforeUpdate == "function" || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (t = l.state, typeof l.componentWillMount == "function" && l.componentWillMount(), typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount(), t !== l.state && Nl.enqueueReplaceState(l, l.state, null), pl(e, n, l, r), l.state = e.memoizedState), typeof l.componentDidMount == "function" && (e.flags |= 4194308);
}
function mn(e, t) {
  try {
    var n = "", r = t;
    do
      n += Kf(r), r = r.return;
    while (r);
    var l = n;
  } catch (i) {
    l = `
Error generating stack: ` + i.message + `
` + i.stack;
  }
  return { value: e, source: t, stack: l, digest: null };
}
function ci(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function Ji(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function() {
      throw n;
    });
  }
}
var xp = typeof WeakMap == "function" ? WeakMap : Map;
function Pc(e, t, n) {
  n = qe(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    gl || (gl = !0, uo = r), Ji(e, t);
  }, n;
}
function zc(e, t, n) {
  n = qe(-1, n), n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var l = t.value;
    n.payload = function() {
      return r(l);
    }, n.callback = function() {
      Ji(e, t);
    };
  }
  var i = e.stateNode;
  return i !== null && typeof i.componentDidCatch == "function" && (n.callback = function() {
    Ji(e, t), typeof r != "function" && (vt === null ? vt = /* @__PURE__ */ new Set([this]) : vt.add(this));
    var o = t.stack;
    this.componentDidCatch(t.value, { componentStack: o !== null ? o : "" });
  }), n;
}
function ua(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new xp();
    var l = /* @__PURE__ */ new Set();
    r.set(t, l);
  } else l = r.get(t), l === void 0 && (l = /* @__PURE__ */ new Set(), r.set(t, l));
  l.has(n) || (l.add(n), e = Ip.bind(null, e, t, n), t.then(e, e));
}
function aa(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function sa(e, t, n, r, l) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = l, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = qe(-1, 1), t.tag = 2, ht(n, t, 1))), n.lanes |= 1), e);
}
var kp = rt.ReactCurrentOwner, we = !1;
function me(e, t, n, r) {
  t.child = e === null ? nc(t, null, n, r) : dn(t, e.child, n, r);
}
function ca(e, t, n, r, l) {
  n = n.render;
  var i = t.ref;
  return on(t, l), r = Xo(e, t, n, r, i, l), n = Ko(), e !== null && !we ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, nt(e, t, l)) : (K && n && Io(t), t.flags |= 1, me(e, t, r, l), t.child);
}
function fa(e, t, n, r, l) {
  if (e === null) {
    var i = n.type;
    return typeof i == "function" && !lu(i) && i.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = i, Tc(e, t, i, r, l)) : (e = Jr(n.type, null, r, t, t.mode, l), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (i = e.child, !(e.lanes & l)) {
    var o = i.memoizedProps;
    if (n = n.compare, n = n !== null ? n : tr, n(o, r) && e.ref === t.ref) return nt(e, t, l);
  }
  return t.flags |= 1, e = gt(i, r), e.ref = t.ref, e.return = t, t.child = e;
}
function Tc(e, t, n, r, l) {
  if (e !== null) {
    var i = e.memoizedProps;
    if (tr(i, r) && e.ref === t.ref) if (we = !1, t.pendingProps = r = i, (e.lanes & l) !== 0) e.flags & 131072 && (we = !0);
    else return t.lanes = e.lanes, nt(e, t, l);
  }
  return qi(e, t, n, r, l);
}
function Nc(e, t, n) {
  var r = t.pendingProps, l = r.children, i = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Q(en, _e), _e |= n;
  else {
    if (!(n & 1073741824)) return e = i !== null ? i.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, Q(en, _e), _e |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = i !== null ? i.baseLanes : n, Q(en, _e), _e |= r;
  }
  else i !== null ? (r = i.baseLanes | n, t.memoizedState = null) : r = n, Q(en, _e), _e |= r;
  return me(e, t, l, n), t.child;
}
function jc(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function qi(e, t, n, r, l) {
  var i = xe(n) ? It : pe.current;
  return i = cn(t, i), on(t, l), n = Xo(e, t, n, r, i, l), r = Ko(), e !== null && !we ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, nt(e, t, l)) : (K && r && Io(t), t.flags |= 1, me(e, t, n, l), t.child);
}
function da(e, t, n, r, l) {
  if (xe(n)) {
    var i = !0;
    al(t);
  } else i = !1;
  if (on(t, l), t.stateNode === null) Kr(e, t), Cc(t, n, r), Zi(t, n, r, l), r = !0;
  else if (e === null) {
    var o = t.stateNode, u = t.memoizedProps;
    o.props = u;
    var a = o.context, s = n.contextType;
    typeof s == "object" && s !== null ? s = Me(s) : (s = xe(n) ? It : pe.current, s = cn(t, s));
    var c = n.getDerivedStateFromProps, f = typeof c == "function" || typeof o.getSnapshotBeforeUpdate == "function";
    f || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (u !== r || a !== s) && oa(t, o, r, s), ot = !1;
    var p = t.memoizedState;
    o.state = p, pl(t, r, o, l), a = t.memoizedState, u !== r || p !== a || Se.current || ot ? (typeof c == "function" && (Gi(t, n, c, r), a = t.memoizedState), (u = ot || ia(t, n, u, r, p, a, s)) ? (f || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = a), o.props = r, o.state = a, o.context = s, r = u) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    o = t.stateNode, lc(e, t), u = t.memoizedProps, s = t.type === t.elementType ? u : Oe(t.type, u), o.props = s, f = t.pendingProps, p = o.context, a = n.contextType, typeof a == "object" && a !== null ? a = Me(a) : (a = xe(n) ? It : pe.current, a = cn(t, a));
    var y = n.getDerivedStateFromProps;
    (c = typeof y == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (u !== f || p !== a) && oa(t, o, r, a), ot = !1, p = t.memoizedState, o.state = p, pl(t, r, o, l);
    var v = t.memoizedState;
    u !== f || p !== v || Se.current || ot ? (typeof y == "function" && (Gi(t, n, y, r), v = t.memoizedState), (s = ot || ia(t, n, s, r, p, v, a) || !1) ? (c || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, v, a), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, v, a)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || u === e.memoizedProps && p === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || u === e.memoizedProps && p === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = v), o.props = r, o.state = v, o.context = a, r = s) : (typeof o.componentDidUpdate != "function" || u === e.memoizedProps && p === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || u === e.memoizedProps && p === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return bi(e, t, n, r, i, l);
}
function bi(e, t, n, r, l, i) {
  jc(e, t);
  var o = (t.flags & 128) !== 0;
  if (!r && !o) return l && Ju(t, n, !1), nt(e, t, i);
  r = t.stateNode, kp.current = t;
  var u = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && o ? (t.child = dn(t, e.child, null, i), t.child = dn(t, null, u, i)) : me(e, t, u, i), t.memoizedState = r.state, l && Ju(t, n, !0), t.child;
}
function Rc(e) {
  var t = e.stateNode;
  t.pendingContext ? Zu(e, t.pendingContext, t.pendingContext !== t.context) : t.context && Zu(e, t.context, !1), Wo(e, t.containerInfo);
}
function pa(e, t, n, r, l) {
  return fn(), Oo(l), t.flags |= 256, me(e, t, n, r), t.child;
}
var eo = { dehydrated: null, treeContext: null, retryLane: 0 };
function to(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function Lc(e, t, n) {
  var r = t.pendingProps, l = G.current, i = !1, o = (t.flags & 128) !== 0, u;
  if ((u = o) || (u = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0), u ? (i = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (l |= 1), Q(G, l & 1), e === null)
    return Xi(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (o = r.children, e = r.fallback, i ? (r = t.mode, i = t.child, o = { mode: "hidden", children: o }, !(r & 1) && i !== null ? (i.childLanes = 0, i.pendingProps = o) : i = Ll(o, r, 0, null), e = Mt(e, r, n, null), i.return = t, e.return = t, i.sibling = e, t.child = i, t.child.memoizedState = to(n), t.memoizedState = eo, e) : Jo(t, o));
  if (l = e.memoizedState, l !== null && (u = l.dehydrated, u !== null)) return Ep(e, t, o, r, u, l, n);
  if (i) {
    i = r.fallback, o = t.mode, l = e.child, u = l.sibling;
    var a = { mode: "hidden", children: r.children };
    return !(o & 1) && t.child !== l ? (r = t.child, r.childLanes = 0, r.pendingProps = a, t.deletions = null) : (r = gt(l, a), r.subtreeFlags = l.subtreeFlags & 14680064), u !== null ? i = gt(u, i) : (i = Mt(i, o, n, null), i.flags |= 2), i.return = t, r.return = t, r.sibling = i, t.child = r, r = i, i = t.child, o = e.child.memoizedState, o = o === null ? to(n) : { baseLanes: o.baseLanes | n, cachePool: null, transitions: o.transitions }, i.memoizedState = o, i.childLanes = e.childLanes & ~n, t.memoizedState = eo, r;
  }
  return i = e.child, e = i.sibling, r = gt(i, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function Jo(e, t) {
  return t = Ll({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function Dr(e, t, n, r) {
  return r !== null && Oo(r), dn(t, e.child, null, n), e = Jo(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function Ep(e, t, n, r, l, i, o) {
  if (n)
    return t.flags & 256 ? (t.flags &= -257, r = ci(Error(E(422))), Dr(e, t, o, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (i = r.fallback, l = t.mode, r = Ll({ mode: "visible", children: r.children }, l, 0, null), i = Mt(i, l, o, null), i.flags |= 2, r.return = t, i.return = t, r.sibling = i, t.child = r, t.mode & 1 && dn(t, e.child, null, o), t.child.memoizedState = to(o), t.memoizedState = eo, i);
  if (!(t.mode & 1)) return Dr(e, t, o, null);
  if (l.data === "$!") {
    if (r = l.nextSibling && l.nextSibling.dataset, r) var u = r.dgst;
    return r = u, i = Error(E(419)), r = ci(i, r, void 0), Dr(e, t, o, r);
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
    return ru(), r = ci(Error(E(421))), Dr(e, t, o, r);
  }
  return l.data === "$?" ? (t.flags |= 128, t.child = e.child, t = $p.bind(null, e), l._reactRetry = t, null) : (e = i.treeContext, Ce = mt(l.nextSibling), Pe = t, K = !0, Ue = null, e !== null && (je[Re++] = Ze, je[Re++] = Je, je[Re++] = $t, Ze = e.id, Je = e.overflow, $t = t), t = Jo(t, r.children), t.flags |= 4096, t);
}
function ma(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), Ki(e.return, t, n);
}
function fi(e, t, n, r, l) {
  var i = e.memoizedState;
  i === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: l } : (i.isBackwards = t, i.rendering = null, i.renderingStartTime = 0, i.last = r, i.tail = n, i.tailMode = l);
}
function Dc(e, t, n) {
  var r = t.pendingProps, l = r.revealOrder, i = r.tail;
  if (me(e, t, r.children, n), r = G.current, r & 2) r = r & 1 | 2, t.flags |= 128;
  else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && ma(e, n, t);
      else if (e.tag === 19) ma(e, n, t);
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
      for (n = t.child, l = null; n !== null; ) e = n.alternate, e !== null && ml(e) === null && (l = n), n = n.sibling;
      n = l, n === null ? (l = t.child, t.child = null) : (l = n.sibling, n.sibling = null), fi(t, !1, l, n, i);
      break;
    case "backwards":
      for (n = null, l = t.child, t.child = null; l !== null; ) {
        if (e = l.alternate, e !== null && ml(e) === null) {
          t.child = l;
          break;
        }
        e = l.sibling, l.sibling = n, n = l, l = e;
      }
      fi(t, !0, n, null, i);
      break;
    case "together":
      fi(t, !1, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function Kr(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
}
function nt(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), Ft |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(E(153));
  if (t.child !== null) {
    for (e = t.child, n = gt(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = gt(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function _p(e, t, n) {
  switch (t.tag) {
    case 3:
      Rc(t), fn();
      break;
    case 5:
      ic(t);
      break;
    case 1:
      xe(t.type) && al(t);
      break;
    case 4:
      Wo(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, l = t.memoizedProps.value;
      Q(fl, r._currentValue), r._currentValue = l;
      break;
    case 13:
      if (r = t.memoizedState, r !== null)
        return r.dehydrated !== null ? (Q(G, G.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? Lc(e, t, n) : (Q(G, G.current & 1), e = nt(e, t, n), e !== null ? e.sibling : null);
      Q(G, G.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return Dc(e, t, n);
        t.flags |= 128;
      }
      if (l = t.memoizedState, l !== null && (l.rendering = null, l.tail = null, l.lastEffect = null), Q(G, G.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, Nc(e, t, n);
  }
  return nt(e, t, n);
}
var Mc, no, Ic, $c;
Mc = function(e, t) {
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
no = function() {
};
Ic = function(e, t, n, r) {
  var l = e.memoizedProps;
  if (l !== r) {
    e = t.stateNode, Lt(Xe.current);
    var i = null;
    switch (n) {
      case "input":
        l = _i(e, l), r = _i(e, r), i = [];
        break;
      case "select":
        l = J({}, l, { value: void 0 }), r = J({}, r, { value: void 0 }), i = [];
        break;
      case "textarea":
        l = zi(e, l), r = zi(e, r), i = [];
        break;
      default:
        typeof l.onClick != "function" && typeof r.onClick == "function" && (e.onclick = ol);
    }
    Ni(n, r);
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
$c = function(e, t, n, r) {
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
function Cp(e, t, n) {
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
      return xe(t.type) && ul(), fe(t), null;
    case 3:
      return r = t.stateNode, pn(), X(Se), X(pe), Qo(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (Rr(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Ue !== null && (co(Ue), Ue = null))), no(e, t), fe(t), null;
    case 5:
      Ho(t);
      var l = Lt(or.current);
      if (n = t.type, e !== null && t.stateNode != null) Ic(e, t, n, r, l), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(E(166));
          return fe(t), null;
        }
        if (e = Lt(Xe.current), Rr(t)) {
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
              for (l = 0; l < Fn.length; l++) Y(Fn[l], r);
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
              Eu(r, i), Y("invalid", r);
              break;
            case "select":
              r._wrapperState = { wasMultiple: !!i.multiple }, Y("invalid", r);
              break;
            case "textarea":
              Cu(r, i), Y("invalid", r);
          }
          Ni(n, i), l = null;
          for (var o in i) if (i.hasOwnProperty(o)) {
            var u = i[o];
            o === "children" ? typeof u == "string" ? r.textContent !== u && (i.suppressHydrationWarning !== !0 && jr(r.textContent, u, e), l = ["children", u]) : typeof u == "number" && r.textContent !== "" + u && (i.suppressHydrationWarning !== !0 && jr(
              r.textContent,
              u,
              e
            ), l = ["children", "" + u]) : Kn.hasOwnProperty(o) && u != null && o === "onScroll" && Y("scroll", r);
          }
          switch (n) {
            case "input":
              kr(r), _u(r, i, !0);
              break;
            case "textarea":
              kr(r), Pu(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof i.onClick == "function" && (r.onclick = ol);
          }
          r = l, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          o = l.nodeType === 9 ? l : l.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = cs(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = o.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = o.createElement(n, { is: r.is }) : (e = o.createElement(n), n === "select" && (o = e, r.multiple ? o.multiple = !0 : r.size && (o.size = r.size))) : e = o.createElementNS(e, n), e[Qe] = t, e[lr] = r, Mc(e, t, !1, !1), t.stateNode = e;
          e: {
            switch (o = ji(n, r), n) {
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
                for (l = 0; l < Fn.length; l++) Y(Fn[l], e);
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
                Eu(e, r), l = _i(e, r), Y("invalid", e);
                break;
              case "option":
                l = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, l = J({}, r, { value: void 0 }), Y("invalid", e);
                break;
              case "textarea":
                Cu(e, r), l = zi(e, r), Y("invalid", e);
                break;
              default:
                l = r;
            }
            Ni(n, l), u = l;
            for (i in u) if (u.hasOwnProperty(i)) {
              var a = u[i];
              i === "style" ? ps(e, a) : i === "dangerouslySetInnerHTML" ? (a = a ? a.__html : void 0, a != null && fs(e, a)) : i === "children" ? typeof a == "string" ? (n !== "textarea" || a !== "") && Gn(e, a) : typeof a == "number" && Gn(e, "" + a) : i !== "suppressContentEditableWarning" && i !== "suppressHydrationWarning" && i !== "autoFocus" && (Kn.hasOwnProperty(i) ? a != null && i === "onScroll" && Y("scroll", e) : a != null && xo(e, i, a, o));
            }
            switch (n) {
              case "input":
                kr(e), _u(e, r, !1);
                break;
              case "textarea":
                kr(e), Pu(e);
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
                typeof l.onClick == "function" && (e.onclick = ol);
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
      if (e && t.stateNode != null) $c(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(E(166));
        if (n = Lt(or.current), Lt(Xe.current), Rr(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[Qe] = t, (i = r.nodeValue !== n) && (e = Pe, e !== null)) switch (e.tag) {
            case 3:
              jr(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && jr(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          i && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[Qe] = t, t.stateNode = r;
      }
      return fe(t), null;
    case 13:
      if (X(G), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (K && Ce !== null && t.mode & 1 && !(t.flags & 128)) ec(), fn(), t.flags |= 98560, i = !1;
        else if (i = Rr(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!i) throw Error(E(318));
            if (i = t.memoizedState, i = i !== null ? i.dehydrated : null, !i) throw Error(E(317));
            i[Qe] = t;
          } else fn(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          fe(t), i = !1;
        } else Ue !== null && (co(Ue), Ue = null), i = !0;
        if (!i) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || G.current & 1 ? re === 0 && (re = 3) : ru())), t.updateQueue !== null && (t.flags |= 4), fe(t), null);
    case 4:
      return pn(), no(e, t), e === null && nr(t.stateNode.containerInfo), fe(t), null;
    case 10:
      return Ao(t.type._context), fe(t), null;
    case 17:
      return xe(t.type) && ul(), fe(t), null;
    case 19:
      if (X(G), i = t.memoizedState, i === null) return fe(t), null;
      if (r = (t.flags & 128) !== 0, o = i.rendering, o === null) if (r) Rn(i, !1);
      else {
        if (re !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (o = ml(e), o !== null) {
            for (t.flags |= 128, Rn(i, !1), r = o.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) i = n, e = r, i.flags &= 14680066, o = i.alternate, o === null ? (i.childLanes = 0, i.lanes = e, i.child = null, i.subtreeFlags = 0, i.memoizedProps = null, i.memoizedState = null, i.updateQueue = null, i.dependencies = null, i.stateNode = null) : (i.childLanes = o.childLanes, i.lanes = o.lanes, i.child = o.child, i.subtreeFlags = 0, i.deletions = null, i.memoizedProps = o.memoizedProps, i.memoizedState = o.memoizedState, i.updateQueue = o.updateQueue, i.type = o.type, e = o.dependencies, i.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return Q(G, G.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        i.tail !== null && ee() > hn && (t.flags |= 128, r = !0, Rn(i, !1), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = ml(o), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), Rn(i, !0), i.tail === null && i.tailMode === "hidden" && !o.alternate && !K) return fe(t), null;
        } else 2 * ee() - i.renderingStartTime > hn && n !== 1073741824 && (t.flags |= 128, r = !0, Rn(i, !1), t.lanes = 4194304);
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
function Pp(e, t) {
  switch ($o(t), t.tag) {
    case 1:
      return xe(t.type) && ul(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
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
var Mr = !1, de = !1, zp = typeof WeakSet == "function" ? WeakSet : Set, N = null;
function bt(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    q(e, t, r);
  }
  else n.current = null;
}
function ro(e, t, n) {
  try {
    n();
  } catch (r) {
    q(e, t, r);
  }
}
var ha = !1;
function Tp(e, t) {
  if (Ai = rl, e = Bs(), Mo(e)) {
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
  for (Bi = { focusedElem: e, selectionRange: n }, rl = !1, N = t; N !== null; ) if (t = N, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, N = e;
  else for (; N !== null; ) {
    t = N;
    try {
      var v = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (v !== null) {
            var k = v.memoizedProps, P = v.memoizedState, m = t.stateNode, d = m.getSnapshotBeforeUpdate(t.elementType === t.type ? k : Oe(t.type, k), P);
            m.__reactInternalSnapshotBeforeUpdate = d;
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
          throw Error(E(163));
      }
    } catch (x) {
      q(t, t.return, x);
    }
    if (e = t.sibling, e !== null) {
      e.return = t.return, N = e;
      break;
    }
    N = t.return;
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
        l.destroy = void 0, i !== void 0 && ro(t, n, i);
      }
      l = l.next;
    } while (l !== r);
  }
}
function jl(e, t) {
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
function lo(e) {
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
function Oc(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, Oc(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Qe], delete t[lr], delete t[Hi], delete t[cp], delete t[fp])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function Fc(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function va(e) {
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
function io(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = ol));
  else if (r !== 4 && (e = e.child, e !== null)) for (io(e, t, n), e = e.sibling; e !== null; ) io(e, t, n), e = e.sibling;
}
function oo(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child, e !== null)) for (oo(e, t, n), e = e.sibling; e !== null; ) oo(e, t, n), e = e.sibling;
}
var ue = null, Fe = !1;
function lt(e, t, n) {
  for (n = n.child; n !== null; ) Uc(e, t, n), n = n.sibling;
}
function Uc(e, t, n) {
  if (Ye && typeof Ye.onCommitFiberUnmount == "function") try {
    Ye.onCommitFiberUnmount(kl, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      de || bt(n, t);
    case 6:
      var r = ue, l = Fe;
      ue = null, lt(e, t, n), ue = r, Fe = l, ue !== null && (Fe ? (e = ue, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : ue.removeChild(n.stateNode));
      break;
    case 18:
      ue !== null && (Fe ? (e = ue, n = n.stateNode, e.nodeType === 8 ? li(e.parentNode, n) : e.nodeType === 1 && li(e, n), bn(e)) : li(ue, n.stateNode));
      break;
    case 4:
      r = ue, l = Fe, ue = n.stateNode.containerInfo, Fe = !0, lt(e, t, n), ue = r, Fe = l;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!de && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        l = r = r.next;
        do {
          var i = l, o = i.destroy;
          i = i.tag, o !== void 0 && (i & 2 || i & 4) && ro(n, t, o), l = l.next;
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
function ya(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new zp()), t.forEach(function(r) {
      var l = Op.bind(null, e, r);
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
            ue = u.stateNode, Fe = !1;
            break e;
          case 3:
            ue = u.stateNode.containerInfo, Fe = !0;
            break e;
          case 4:
            ue = u.stateNode.containerInfo, Fe = !0;
            break e;
        }
        u = u.return;
      }
      if (ue === null) throw Error(E(160));
      Uc(i, o, l), ue = null, Fe = !1;
      var a = l.alternate;
      a !== null && (a.return = null), l.return = null;
    } catch (s) {
      q(l, t, s);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) Ac(t, e), t = t.sibling;
}
function Ac(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ($e(t, e), We(e), r & 4) {
        try {
          Qn(3, e, e.return), jl(3, e);
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
          u === "input" && i.type === "radio" && i.name != null && as(l, i), ji(u, o);
          var s = ji(u, i);
          for (o = 0; o < a.length; o += 2) {
            var c = a[o], f = a[o + 1];
            c === "style" ? ps(l, f) : c === "dangerouslySetInnerHTML" ? fs(l, f) : c === "children" ? Gn(l, f) : xo(l, c, f, s);
          }
          switch (u) {
            case "input":
              Ci(l, i);
              break;
            case "textarea":
              ss(l, i);
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
      $e(t, e), We(e), l = e.child, l.flags & 8192 && (i = l.memoizedState !== null, l.stateNode.isHidden = i, !i || l.alternate !== null && l.alternate.memoizedState !== null || (eu = ee())), r & 4 && ya(e);
      break;
    case 22:
      if (c = n !== null && n.memoizedState !== null, e.mode & 1 ? (de = (s = de) || c, $e(t, e), de = s) : $e(t, e), We(e), r & 8192) {
        if (s = e.memoizedState !== null, (e.stateNode.isHidden = s) && !c && e.mode & 1) for (N = e, c = e.child; c !== null; ) {
          for (f = N = c; N !== null; ) {
            switch (p = N, y = p.child, p.tag) {
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
                  wa(f);
                  continue;
                }
            }
            y !== null ? (y.return = p, N = y) : wa(f);
          }
          c = c.sibling;
        }
        e: for (c = null, f = e; ; ) {
          if (f.tag === 5) {
            if (c === null) {
              c = f;
              try {
                l = f.stateNode, s ? (i = l.style, typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none") : (u = f.stateNode, a = f.memoizedProps.style, o = a != null && a.hasOwnProperty("display") ? a.display : null, u.style.display = ds("display", o));
              } catch (k) {
                q(e, e.return, k);
              }
            }
          } else if (f.tag === 6) {
            if (c === null) try {
              f.stateNode.nodeValue = s ? "" : f.memoizedProps;
            } catch (k) {
              q(e, e.return, k);
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
      $e(t, e), We(e), r & 4 && ya(e);
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
          var i = va(e);
          oo(e, i, l);
          break;
        case 3:
        case 4:
          var o = r.stateNode.containerInfo, u = va(e);
          io(e, u, o);
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
function Np(e, t, n) {
  N = e, Bc(e);
}
function Bc(e, t, n) {
  for (var r = (e.mode & 1) !== 0; N !== null; ) {
    var l = N, i = l.child;
    if (l.tag === 22 && r) {
      var o = l.memoizedState !== null || Mr;
      if (!o) {
        var u = l.alternate, a = u !== null && u.memoizedState !== null || de;
        u = Mr;
        var s = de;
        if (Mr = o, (de = a) && !s) for (N = l; N !== null; ) o = N, a = o.child, o.tag === 22 && o.memoizedState !== null ? Sa(l) : a !== null ? (a.return = o, N = a) : Sa(l);
        for (; i !== null; ) N = i, Bc(i), i = i.sibling;
        N = l, Mr = u, de = s;
      }
      ga(e);
    } else l.subtreeFlags & 8772 && i !== null ? (i.return = l, N = i) : ga(e);
  }
}
function ga(e) {
  for (; N !== null; ) {
    var t = N;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            de || jl(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !de) if (n === null) r.componentDidMount();
            else {
              var l = t.elementType === t.type ? n.memoizedProps : Oe(t.type, n.memoizedProps);
              r.componentDidUpdate(l, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var i = t.updateQueue;
            i !== null && na(t, i, r);
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
              na(t, o, n);
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
            throw Error(E(163));
        }
        de || t.flags & 512 && lo(t);
      } catch (p) {
        q(t, t.return, p);
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
function wa(e) {
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
function Sa(e) {
  for (; N !== null; ) {
    var t = N;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            jl(4, t);
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
            lo(t);
          } catch (a) {
            q(t, i, a);
          }
          break;
        case 5:
          var o = t.return;
          try {
            lo(t);
          } catch (a) {
            q(t, o, a);
          }
      }
    } catch (a) {
      q(t, t.return, a);
    }
    if (t === e) {
      N = null;
      break;
    }
    var u = t.sibling;
    if (u !== null) {
      u.return = t.return, N = u;
      break;
    }
    N = t.return;
  }
}
var jp = Math.ceil, yl = rt.ReactCurrentDispatcher, qo = rt.ReactCurrentOwner, De = rt.ReactCurrentBatchConfig, B = 0, ie = null, te = null, ae = 0, _e = 0, en = kt(0), re = 0, cr = null, Ft = 0, Rl = 0, bo = 0, Yn = null, ge = null, eu = 0, hn = 1 / 0, Ke = null, gl = !1, uo = null, vt = null, Ir = !1, ct = null, wl = 0, Xn = 0, ao = null, Gr = -1, Zr = 0;
function he() {
  return B & 6 ? ee() : Gr !== -1 ? Gr : Gr = ee();
}
function yt(e) {
  return e.mode & 1 ? B & 2 && ae !== 0 ? ae & -ae : pp.transition !== null ? (Zr === 0 && (Zr = Cs()), Zr) : (e = H, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Ls(e.type)), e) : 1;
}
function Be(e, t, n, r) {
  if (50 < Xn) throw Xn = 0, ao = null, Error(E(185));
  pr(e, n, r), (!(B & 2) || e !== ie) && (e === ie && (!(B & 2) && (Rl |= n), re === 4 && at(e, ae)), ke(e, r), n === 1 && B === 0 && !(t.mode & 1) && (hn = ee() + 500, zl && Et()));
}
function ke(e, t) {
  var n = e.callbackNode;
  pd(e, t);
  var r = nl(e, e === ie ? ae : 0);
  if (r === 0) n !== null && Nu(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && Nu(n), t === 1) e.tag === 0 ? dp(xa.bind(null, e)) : Js(xa.bind(null, e)), ap(function() {
      !(B & 6) && Et();
    }), n = null;
    else {
      switch (Ps(r)) {
        case 1:
          n = Po;
          break;
        case 4:
          n = Es;
          break;
        case 16:
          n = tl;
          break;
        case 536870912:
          n = _s;
          break;
        default:
          n = tl;
      }
      n = Gc(n, Vc.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function Vc(e, t) {
  if (Gr = -1, Zr = 0, B & 6) throw Error(E(327));
  var n = e.callbackNode;
  if (un() && e.callbackNode !== n) return null;
  var r = nl(e, e === ie ? ae : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = Sl(e, r);
  else {
    t = r;
    var l = B;
    B |= 2;
    var i = Hc();
    (ie !== e || ae !== t) && (Ke = null, hn = ee() + 500, Dt(e, t));
    do
      try {
        Dp();
        break;
      } catch (u) {
        Wc(e, u);
      }
    while (!0);
    Uo(), yl.current = i, B = l, te !== null ? t = 0 : (ie = null, ae = 0, t = re);
  }
  if (t !== 0) {
    if (t === 2 && (l = Ii(e), l !== 0 && (r = l, t = so(e, l))), t === 1) throw n = cr, Dt(e, 0), at(e, r), ke(e, ee()), n;
    if (t === 6) at(e, r);
    else {
      if (l = e.current.alternate, !(r & 30) && !Rp(l) && (t = Sl(e, r), t === 2 && (i = Ii(e), i !== 0 && (r = i, t = so(e, i))), t === 1)) throw n = cr, Dt(e, 0), at(e, r), ke(e, ee()), n;
      switch (e.finishedWork = l, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(E(345));
        case 2:
          Nt(e, ge, Ke);
          break;
        case 3:
          if (at(e, r), (r & 130023424) === r && (t = eu + 500 - ee(), 10 < t)) {
            if (nl(e, 0) !== 0) break;
            if (l = e.suspendedLanes, (l & r) !== r) {
              he(), e.pingedLanes |= e.suspendedLanes & l;
              break;
            }
            e.timeoutHandle = Wi(Nt.bind(null, e, ge, Ke), t);
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
          if (r = l, r = ee() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * jp(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = Wi(Nt.bind(null, e, ge, Ke), r);
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
  return ke(e, ee()), e.callbackNode === n ? Vc.bind(null, e) : null;
}
function so(e, t) {
  var n = Yn;
  return e.current.memoizedState.isDehydrated && (Dt(e, t).flags |= 256), e = Sl(e, t), e !== 2 && (t = ge, ge = n, t !== null && co(t)), e;
}
function co(e) {
  ge === null ? ge = e : ge.push.apply(ge, e);
}
function Rp(e) {
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
  for (t &= ~bo, t &= ~Rl, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - Ae(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function xa(e) {
  if (B & 6) throw Error(E(327));
  un();
  var t = nl(e, 0);
  if (!(t & 1)) return ke(e, ee()), null;
  var n = Sl(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Ii(e);
    r !== 0 && (t = r, n = so(e, r));
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
    B = n, B === 0 && (hn = ee() + 500, zl && Et());
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
  if (n !== -1 && (e.timeoutHandle = -1, up(n)), te !== null) for (n = te.return; n !== null; ) {
    var r = n;
    switch ($o(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && ul();
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
  if (ie = e, te = e = gt(e.current, null), ae = _e = t, re = 0, cr = null, bo = Rl = Ft = 0, ge = Yn = null, Rt !== null) {
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
function Wc(e, t) {
  do {
    var n = te;
    try {
      if (Uo(), Yr.current = vl, hl) {
        for (var r = Z.memoizedState; r !== null; ) {
          var l = r.queue;
          l !== null && (l.pending = null), r = r.next;
        }
        hl = !1;
      }
      if (Ot = 0, le = ne = Z = null, Hn = !1, ur = 0, qo.current = null, n === null || n.return === null) {
        re = 1, cr = t, te = null;
        break;
      }
      e: {
        var i = e, o = n.return, u = n, a = t;
        if (t = ae, u.flags |= 32768, a !== null && typeof a == "object" && typeof a.then == "function") {
          var s = a, c = u, f = c.tag;
          if (!(c.mode & 1) && (f === 0 || f === 11 || f === 15)) {
            var p = c.alternate;
            p ? (c.updateQueue = p.updateQueue, c.memoizedState = p.memoizedState, c.lanes = p.lanes) : (c.updateQueue = null, c.memoizedState = null);
          }
          var y = aa(o);
          if (y !== null) {
            y.flags &= -257, sa(y, o, u, i, t), y.mode & 1 && ua(i, s, t), t = y, a = s;
            var v = t.updateQueue;
            if (v === null) {
              var k = /* @__PURE__ */ new Set();
              k.add(a), t.updateQueue = k;
            } else v.add(a);
            break e;
          } else {
            if (!(t & 1)) {
              ua(i, s, t), ru();
              break e;
            }
            a = Error(E(426));
          }
        } else if (K && u.mode & 1) {
          var P = aa(o);
          if (P !== null) {
            !(P.flags & 65536) && (P.flags |= 256), sa(P, o, u, i, t), Oo(mn(a, u));
            break e;
          }
        }
        i = a = mn(a, u), re !== 4 && (re = 2), Yn === null ? Yn = [i] : Yn.push(i), i = o;
        do {
          switch (i.tag) {
            case 3:
              i.flags |= 65536, t &= -t, i.lanes |= t;
              var m = Pc(i, a, t);
              ta(i, m);
              break e;
            case 1:
              u = a;
              var d = i.type, h = i.stateNode;
              if (!(i.flags & 128) && (typeof d.getDerivedStateFromError == "function" || h !== null && typeof h.componentDidCatch == "function" && (vt === null || !vt.has(h)))) {
                i.flags |= 65536, t &= -t, i.lanes |= t;
                var x = zc(i, u, t);
                ta(i, x);
                break e;
              }
          }
          i = i.return;
        } while (i !== null);
      }
      Yc(n);
    } catch (S) {
      t = S, te === n && n !== null && (te = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function Hc() {
  var e = yl.current;
  return yl.current = vl, e === null ? vl : e;
}
function ru() {
  (re === 0 || re === 3 || re === 2) && (re = 4), ie === null || !(Ft & 268435455) && !(Rl & 268435455) || at(ie, ae);
}
function Sl(e, t) {
  var n = B;
  B |= 2;
  var r = Hc();
  (ie !== e || ae !== t) && (Ke = null, Dt(e, t));
  do
    try {
      Lp();
      break;
    } catch (l) {
      Wc(e, l);
    }
  while (!0);
  if (Uo(), B = n, yl.current = r, te !== null) throw Error(E(261));
  return ie = null, ae = 0, re;
}
function Lp() {
  for (; te !== null; ) Qc(te);
}
function Dp() {
  for (; te !== null && !ld(); ) Qc(te);
}
function Qc(e) {
  var t = Kc(e.alternate, e, _e);
  e.memoizedProps = e.pendingProps, t === null ? Yc(e) : te = t, qo.current = null;
}
function Yc(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = Pp(n, t), n !== null) {
        n.flags &= 32767, te = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        re = 6, te = null;
        return;
      }
    } else if (n = Cp(n, t, _e), n !== null) {
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
    De.transition = null, H = 1, Mp(e, t, n, r);
  } finally {
    De.transition = l, H = r;
  }
  return null;
}
function Mp(e, t, n, r) {
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
  if (md(e, i), e === ie && (te = ie = null, ae = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || Ir || (Ir = !0, Gc(tl, function() {
    return un(), null;
  })), i = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || i) {
    i = De.transition, De.transition = null;
    var o = H;
    H = 1;
    var u = B;
    B |= 4, qo.current = null, Tp(e, n), Ac(n, e), ep(Bi), rl = !!Ai, Bi = Ai = null, e.current = n, Np(n), id(), B = u, H = o, De.transition = i;
  } else e.current = n;
  if (Ir && (Ir = !1, ct = e, wl = l), i = e.pendingLanes, i === 0 && (vt = null), ad(n.stateNode), ke(e, ee()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) l = t[n], r(l.value, { componentStack: l.stack, digest: l.digest });
  if (gl) throw gl = !1, e = uo, uo = null, e;
  return wl & 1 && e.tag !== 0 && un(), i = e.pendingLanes, i & 1 ? e === ao ? Xn++ : (Xn = 0, ao = e) : Xn = 0, Et(), null;
}
function un() {
  if (ct !== null) {
    var e = Ps(wl), t = De.transition, n = H;
    try {
      if (De.transition = null, H = 16 > e ? 16 : e, ct === null) var r = !1;
      else {
        if (e = ct, ct = null, wl = 0, B & 6) throw Error(E(331));
        var l = B;
        for (B |= 4, N = e.current; N !== null; ) {
          var i = N, o = i.child;
          if (N.flags & 16) {
            var u = i.deletions;
            if (u !== null) {
              for (var a = 0; a < u.length; a++) {
                var s = u[a];
                for (N = s; N !== null; ) {
                  var c = N;
                  switch (c.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Qn(8, c, i);
                  }
                  var f = c.child;
                  if (f !== null) f.return = c, N = f;
                  else for (; N !== null; ) {
                    c = N;
                    var p = c.sibling, y = c.return;
                    if (Oc(c), c === s) {
                      N = null;
                      break;
                    }
                    if (p !== null) {
                      p.return = y, N = p;
                      break;
                    }
                    N = y;
                  }
                }
              }
              var v = i.alternate;
              if (v !== null) {
                var k = v.child;
                if (k !== null) {
                  v.child = null;
                  do {
                    var P = k.sibling;
                    k.sibling = null, k = P;
                  } while (k !== null);
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
                Qn(9, i, i.return);
            }
            var m = i.sibling;
            if (m !== null) {
              m.return = i.return, N = m;
              break e;
            }
            N = i.return;
          }
        }
        var d = e.current;
        for (N = d; N !== null; ) {
          o = N;
          var h = o.child;
          if (o.subtreeFlags & 2064 && h !== null) h.return = o, N = h;
          else e: for (o = d; N !== null; ) {
            if (u = N, u.flags & 2048) try {
              switch (u.tag) {
                case 0:
                case 11:
                case 15:
                  jl(9, u);
              }
            } catch (S) {
              q(u, u.return, S);
            }
            if (u === o) {
              N = null;
              break e;
            }
            var x = u.sibling;
            if (x !== null) {
              x.return = u.return, N = x;
              break e;
            }
            N = u.return;
          }
        }
        if (B = l, Et(), Ye && typeof Ye.onPostCommitFiberRoot == "function") try {
          Ye.onPostCommitFiberRoot(kl, e);
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
function ka(e, t, n) {
  t = mn(n, t), t = Pc(e, t, 1), e = ht(e, t, 1), t = he(), e !== null && (pr(e, 1, t), ke(e, t));
}
function q(e, t, n) {
  if (e.tag === 3) ka(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      ka(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (vt === null || !vt.has(r))) {
        e = mn(n, e), e = zc(t, e, 1), t = ht(t, e, 1), e = he(), t !== null && (pr(t, 1, e), ke(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function Ip(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = he(), e.pingedLanes |= e.suspendedLanes & n, ie === e && (ae & n) === n && (re === 4 || re === 3 && (ae & 130023424) === ae && 500 > ee() - eu ? Dt(e, 0) : bo |= n), ke(e, t);
}
function Xc(e, t) {
  t === 0 && (e.mode & 1 ? (t = Cr, Cr <<= 1, !(Cr & 130023424) && (Cr = 4194304)) : t = 1);
  var n = he();
  e = tt(e, t), e !== null && (pr(e, t, n), ke(e, n));
}
function $p(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), Xc(e, n);
}
function Op(e, t) {
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
  r !== null && r.delete(t), Xc(e, n);
}
var Kc;
Kc = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || Se.current) we = !0;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return we = !1, _p(e, t, n);
    we = !!(e.flags & 131072);
  }
  else we = !1, K && t.flags & 1048576 && qs(t, cl, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      Kr(e, t), e = t.pendingProps;
      var l = cn(t, pe.current);
      on(t, n), l = Xo(null, t, r, e, l, n);
      var i = Ko();
      return t.flags |= 1, typeof l == "object" && l !== null && typeof l.render == "function" && l.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, xe(r) ? (i = !0, al(t)) : i = !1, t.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null, Vo(t), l.updater = Nl, t.stateNode = l, l._reactInternals = t, Zi(t, r, e, n), t = bi(null, t, r, !0, i, n)) : (t.tag = 0, K && i && Io(t), me(null, t, l, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (Kr(e, t), e = t.pendingProps, l = r._init, r = l(r._payload), t.type = r, l = t.tag = Up(r), e = Oe(r, e), l) {
          case 0:
            t = qi(null, t, r, e, n);
            break e;
          case 1:
            t = da(null, t, r, e, n);
            break e;
          case 11:
            t = ca(null, t, r, e, n);
            break e;
          case 14:
            t = fa(null, t, r, Oe(r.type, e), n);
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
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Oe(r, l), qi(e, t, r, l, n);
    case 1:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Oe(r, l), da(e, t, r, l, n);
    case 3:
      e: {
        if (Rc(t), e === null) throw Error(E(387));
        r = t.pendingProps, i = t.memoizedState, l = i.element, lc(e, t), pl(t, r, null, n);
        var o = t.memoizedState;
        if (r = o.element, i.isDehydrated) if (i = { element: r, isDehydrated: !1, cache: o.cache, pendingSuspenseBoundaries: o.pendingSuspenseBoundaries, transitions: o.transitions }, t.updateQueue.baseState = i, t.memoizedState = i, t.flags & 256) {
          l = mn(Error(E(423)), t), t = pa(e, t, r, n, l);
          break e;
        } else if (r !== l) {
          l = mn(Error(E(424)), t), t = pa(e, t, r, n, l);
          break e;
        } else for (Ce = mt(t.stateNode.containerInfo.firstChild), Pe = t, K = !0, Ue = null, n = nc(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (fn(), r === l) {
            t = nt(e, t, n);
            break e;
          }
          me(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return ic(t), e === null && Xi(t), r = t.type, l = t.pendingProps, i = e !== null ? e.memoizedProps : null, o = l.children, Vi(r, l) ? o = null : i !== null && Vi(r, i) && (t.flags |= 32), jc(e, t), me(e, t, o, n), t.child;
    case 6:
      return e === null && Xi(t), null;
    case 13:
      return Lc(e, t, n);
    case 4:
      return Wo(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = dn(t, null, r, n) : me(e, t, r, n), t.child;
    case 11:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Oe(r, l), ca(e, t, r, l, n);
    case 7:
      return me(e, t, t.pendingProps, n), t.child;
    case 8:
      return me(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return me(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, l = t.pendingProps, i = t.memoizedProps, o = l.value, Q(fl, r._currentValue), r._currentValue = o, i !== null) if (Ve(i.value, o)) {
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
                i.lanes |= n, a = i.alternate, a !== null && (a.lanes |= n), Ki(
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
            o.lanes |= n, u = o.alternate, u !== null && (u.lanes |= n), Ki(o, n, t), o = i.sibling;
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
        me(e, t, l.children, n), t = t.child;
      }
      return t;
    case 9:
      return l = t.type, r = t.pendingProps.children, on(t, n), l = Me(l), r = r(l), t.flags |= 1, me(e, t, r, n), t.child;
    case 14:
      return r = t.type, l = Oe(r, t.pendingProps), l = Oe(r.type, l), fa(e, t, r, l, n);
    case 15:
      return Tc(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Oe(r, l), Kr(e, t), t.tag = 1, xe(r) ? (e = !0, al(t)) : e = !1, on(t, n), Cc(t, r, l), Zi(t, r, l, n), bi(null, t, r, !0, e, n);
    case 19:
      return Dc(e, t, n);
    case 22:
      return Nc(e, t, n);
  }
  throw Error(E(156, t.tag));
};
function Gc(e, t) {
  return ks(e, t);
}
function Fp(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function Le(e, t, n, r) {
  return new Fp(e, t, n, r);
}
function lu(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function Up(e) {
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
function Jr(e, t, n, r, l, i) {
  var o = 2;
  if (r = e, typeof e == "function") lu(e) && (o = 1);
  else if (typeof e == "string") o = 5;
  else e: switch (e) {
    case Ht:
      return Mt(n.children, l, i, t);
    case ko:
      o = 8, l |= 8;
      break;
    case Si:
      return e = Le(12, n, t, l | 2), e.elementType = Si, e.lanes = i, e;
    case xi:
      return e = Le(13, n, t, l), e.elementType = xi, e.lanes = i, e;
    case ki:
      return e = Le(19, n, t, l), e.elementType = ki, e.lanes = i, e;
    case is:
      return Ll(n, l, i, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case rs:
          o = 10;
          break e;
        case ls:
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
function Ll(e, t, n, r) {
  return e = Le(22, e, r, t), e.elementType = is, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
}
function di(e, t, n) {
  return e = Le(6, e, null, t), e.lanes = n, e;
}
function pi(e, t, n) {
  return t = Le(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function Ap(e, t, n, r, l) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Xl(0), this.expirationTimes = Xl(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Xl(0), this.identifierPrefix = r, this.onRecoverableError = l, this.mutableSourceEagerHydrationData = null;
}
function iu(e, t, n, r, l, i, o, u, a) {
  return e = new Ap(e, t, n, u, a), t === 1 ? (t = 1, i === !0 && (t |= 8)) : t = 0, i = Le(3, null, null, t), e.current = i, i.stateNode = e, i.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Vo(i), e;
}
function Bp(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: Wt, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function Zc(e) {
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
    if (xe(n)) return Zs(e, n, t);
  }
  return t;
}
function Jc(e, t, n, r, l, i, o, u, a) {
  return e = iu(n, r, !0, e, l, i, o, u, a), e.context = Zc(null), n = e.current, r = he(), l = yt(n), i = qe(r, l), i.callback = t ?? null, ht(n, i, l), e.current.lanes = l, pr(e, l, r), ke(e, r), e;
}
function Dl(e, t, n, r) {
  var l = t.current, i = he(), o = yt(l);
  return n = Zc(n), t.context === null ? t.context = n : t.pendingContext = n, t = qe(i, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = ht(l, t, o), e !== null && (Be(e, l, o, i), Qr(e, l, o)), o;
}
function xl(e) {
  if (e = e.current, !e.child) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function Ea(e, t) {
  if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function ou(e, t) {
  Ea(e, t), (e = e.alternate) && Ea(e, t);
}
function Vp() {
  return null;
}
var qc = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function uu(e) {
  this._internalRoot = e;
}
Ml.prototype.render = uu.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(E(409));
  Dl(e, t, null, null);
};
Ml.prototype.unmount = uu.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    Ut(function() {
      Dl(null, e, null, null);
    }), t[et] = null;
  }
};
function Ml(e) {
  this._internalRoot = e;
}
Ml.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = Ns();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < ut.length && t !== 0 && t < ut[n].priority; n++) ;
    ut.splice(n, 0, e), n === 0 && Rs(e);
  }
};
function au(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function Il(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function _a() {
}
function Wp(e, t, n, r, l) {
  if (l) {
    if (typeof r == "function") {
      var i = r;
      r = function() {
        var s = xl(o);
        i.call(s);
      };
    }
    var o = Jc(t, r, e, 0, null, !1, !1, "", _a);
    return e._reactRootContainer = o, e[et] = o.current, nr(e.nodeType === 8 ? e.parentNode : e), Ut(), o;
  }
  for (; l = e.lastChild; ) e.removeChild(l);
  if (typeof r == "function") {
    var u = r;
    r = function() {
      var s = xl(a);
      u.call(s);
    };
  }
  var a = iu(e, 0, !1, null, null, !1, !1, "", _a);
  return e._reactRootContainer = a, e[et] = a.current, nr(e.nodeType === 8 ? e.parentNode : e), Ut(function() {
    Dl(t, a, n, r);
  }), a;
}
function $l(e, t, n, r, l) {
  var i = n._reactRootContainer;
  if (i) {
    var o = i;
    if (typeof l == "function") {
      var u = l;
      l = function() {
        var a = xl(o);
        u.call(a);
      };
    }
    Dl(t, o, e, l);
  } else o = Wp(n, t, e, l, r);
  return xl(o);
}
zs = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = On(t.pendingLanes);
        n !== 0 && (zo(t, n | 1), ke(t, ee()), !(B & 6) && (hn = ee() + 500, Et()));
      }
      break;
    case 13:
      Ut(function() {
        var r = tt(e, 1);
        if (r !== null) {
          var l = he();
          Be(r, e, 1, l);
        }
      }), ou(e, 1);
  }
};
To = function(e) {
  if (e.tag === 13) {
    var t = tt(e, 134217728);
    if (t !== null) {
      var n = he();
      Be(t, e, 134217728, n);
    }
    ou(e, 134217728);
  }
};
Ts = function(e) {
  if (e.tag === 13) {
    var t = yt(e), n = tt(e, t);
    if (n !== null) {
      var r = he();
      Be(n, e, t, r);
    }
    ou(e, t);
  }
};
Ns = function() {
  return H;
};
js = function(e, t) {
  var n = H;
  try {
    return H = e, t();
  } finally {
    H = n;
  }
};
Li = function(e, t, n) {
  switch (t) {
    case "input":
      if (Ci(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var l = Pl(r);
            if (!l) throw Error(E(90));
            us(r), Ci(r, l);
          }
        }
      }
      break;
    case "textarea":
      ss(e, n);
      break;
    case "select":
      t = n.value, t != null && tn(e, !!n.multiple, t, !1);
  }
};
vs = tu;
ys = Ut;
var Hp = { usingClientEntryPoint: !1, Events: [hr, Kt, Pl, ms, hs, tu] }, Ln = { findFiberByHostInstance: jt, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Qp = { bundleType: Ln.bundleType, version: Ln.version, rendererPackageName: Ln.rendererPackageName, rendererConfig: Ln.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: rt.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = Ss(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: Ln.findFiberByHostInstance || Vp, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var $r = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!$r.isDisabled && $r.supportsFiber) try {
    kl = $r.inject(Qp), Ye = $r;
  } catch {
  }
}
Te.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Hp;
Te.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!au(t)) throw Error(E(200));
  return Bp(e, t, null, n);
};
Te.createRoot = function(e, t) {
  if (!au(e)) throw Error(E(299));
  var n = !1, r = "", l = qc;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (l = t.onRecoverableError)), t = iu(e, 1, !1, null, null, n, !1, r, l), e[et] = t.current, nr(e.nodeType === 8 ? e.parentNode : e), new uu(t);
};
Te.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function" ? Error(E(188)) : (e = Object.keys(e).join(","), Error(E(268, e)));
  return e = Ss(t), e = e === null ? null : e.stateNode, e;
};
Te.flushSync = function(e) {
  return Ut(e);
};
Te.hydrate = function(e, t, n) {
  if (!Il(t)) throw Error(E(200));
  return $l(null, e, t, !0, n);
};
Te.hydrateRoot = function(e, t, n) {
  if (!au(e)) throw Error(E(405));
  var r = n != null && n.hydratedSources || null, l = !1, i = "", o = qc;
  if (n != null && (n.unstable_strictMode === !0 && (l = !0), n.identifierPrefix !== void 0 && (i = n.identifierPrefix), n.onRecoverableError !== void 0 && (o = n.onRecoverableError)), t = Jc(t, null, e, 1, n ?? null, l, !1, i, o), e[et] = t.current, nr(e), r) for (e = 0; e < r.length; e++) n = r[e], l = n._getVersion, l = l(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, l] : t.mutableSourceEagerHydrationData.push(
    n,
    l
  );
  return new Ml(t);
};
Te.render = function(e, t, n) {
  if (!Il(t)) throw Error(E(200));
  return $l(null, e, t, !1, n);
};
Te.unmountComponentAtNode = function(e) {
  if (!Il(e)) throw Error(E(40));
  return e._reactRootContainer ? (Ut(function() {
    $l(null, null, e, !1, function() {
      e._reactRootContainer = null, e[et] = null;
    });
  }), !0) : !1;
};
Te.unstable_batchedUpdates = tu;
Te.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!Il(n)) throw Error(E(200));
  if (e == null || e._reactInternals === void 0) throw Error(E(38));
  return $l(e, t, n, !1, r);
};
Te.version = "18.3.1-next-f1338f8080-20240426";
function bc() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(bc);
    } catch (e) {
      console.error(e);
    }
}
bc(), Ha.exports = Te;
var ef = Ha.exports, tf, Ca = ef;
tf = Ca.createRoot, Ca.hydrateRoot;
function Yp(e) {
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
function Xp(e) {
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
const Kp = {}, Pa = (e) => {
  let t;
  const n = /* @__PURE__ */ new Set(), r = (c, f) => {
    const p = typeof c == "function" ? c(t) : c;
    if (!Object.is(p, t)) {
      const y = t;
      t = f ?? (typeof p != "object" || p === null) ? p : Object.assign({}, t, p), n.forEach((v) => v(t, y));
    }
  }, l = () => t, a = { setState: r, getState: l, getInitialState: () => s, subscribe: (c) => (n.add(c), () => n.delete(c)), destroy: () => {
    (Kp ? "production" : void 0) !== "production" && console.warn(
      "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
    ), n.clear();
  } }, s = t = e(r, l, a);
  return a;
}, Gp = (e) => e ? Pa(e) : Pa;
var nf = { exports: {} }, rf = {}, lf = { exports: {} }, of = {};
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
function Zp(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Jp = typeof Object.is == "function" ? Object.is : Zp, qp = vn.useState, bp = vn.useEffect, em = vn.useLayoutEffect, tm = vn.useDebugValue;
function nm(e, t) {
  var n = t(), r = qp({ inst: { value: n, getSnapshot: t } }), l = r[0].inst, i = r[1];
  return em(
    function() {
      l.value = n, l.getSnapshot = t, mi(l) && i({ inst: l });
    },
    [e, n, t]
  ), bp(
    function() {
      return mi(l) && i({ inst: l }), e(function() {
        mi(l) && i({ inst: l });
      });
    },
    [e]
  ), tm(n), n;
}
function mi(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Jp(e, n);
  } catch {
    return !0;
  }
}
function rm(e, t) {
  return t();
}
var lm = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? rm : nm;
of.useSyncExternalStore = vn.useSyncExternalStore !== void 0 ? vn.useSyncExternalStore : lm;
lf.exports = of;
var im = lf.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ol = M, om = im;
function um(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var am = typeof Object.is == "function" ? Object.is : um, sm = om.useSyncExternalStore, cm = Ol.useRef, fm = Ol.useEffect, dm = Ol.useMemo, pm = Ol.useDebugValue;
rf.useSyncExternalStoreWithSelector = function(e, t, n, r, l) {
  var i = cm(null);
  if (i.current === null) {
    var o = { hasValue: !1, value: null };
    i.current = o;
  } else o = i.current;
  i = dm(
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
        if (v = f, am(c, y)) return v;
        var k = r(y);
        return l !== void 0 && l(v, k) ? (c = y, v) : (c = y, f = k);
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
  var u = sm(e, i[0], i[1]);
  return fm(
    function() {
      o.hasValue = !0, o.value = u;
    },
    [u]
  ), pm(u), u;
};
nf.exports = rf;
var mm = nf.exports;
const hm = /* @__PURE__ */ Wa(mm), uf = {}, { useDebugValue: vm } = Bf, { useSyncExternalStoreWithSelector: ym } = hm;
let za = !1;
const gm = (e) => e;
function wm(e, t = gm, n) {
  (uf ? "production" : void 0) !== "production" && n && !za && (console.warn(
    "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
  ), za = !0);
  const r = ym(
    e.subscribe,
    e.getState,
    e.getServerState || e.getInitialState,
    t,
    n
  );
  return vm(r), r;
}
const Ta = (e) => {
  (uf ? "production" : void 0) !== "production" && typeof e != "function" && console.warn(
    "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
  );
  const t = typeof e == "function" ? Gp(e) : e, n = (r, l) => wm(t, r, l);
  return Object.assign(n, t), n;
}, Sm = (e) => e ? Ta(e) : Ta;
function xm() {
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
function km() {
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
function Em() {
  return typeof window < "u" && window.__TAURI_INTERNALS__ ? km() : xm();
}
const Na = "text/x-vnd.veusz-widget-3", _m = "text/x-vnd.veusz-data-1";
function fo(e, t) {
  const n = [];
  for (const r of e.settings) n.push(ja(t, r.name));
  for (const r of e.subgroups) n.push(...fo(r, ja(t, r.name)));
  return n;
}
function ja(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
const Cm = 33;
function Pm(e, t = Em()) {
  let n = null, r = null;
  return Sm((l, i) => {
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
          const f = u[0], p = af(i().tree, f);
          if (!p) {
            l({ schema: null, values: {} });
            return;
          }
          const y = await o(() => e.doc.schema(p));
          if (!y) {
            l({ schema: null, values: {} });
            return;
          }
          const v = fo(y, f), k = await o(() => e.doc.get(v)) ?? {};
          l({ schema: y, values: k });
          return;
        }
        const a = await o(() => e.doc.commonSchema(u));
        if (!a) {
          l({ schema: null, values: {} });
          return;
        }
        const s = fo(a, u[0]), c = await o(() => e.doc.get(s)) ?? {};
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
        const a = await t.read([Na]);
        if (!a) return [];
        const s = await o(() => e.doc.pasteWidgetsMime(
          u,
          a.mime_type,
          a.payload_b64
        ));
        return s ? (l({ cutPaths: [] }), await i().refreshTree(), await i().refreshUndoState(), s.paths) : [];
      },
      canPasteWidgets: async (u) => {
        const a = await t.read([Na]);
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
        const u = await t.read([_m]);
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
          const { webgpuAvailable: a } = await Promise.resolve().then(() => df);
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
            const { gpuRenderScene: k } = await import("./velloNative-Cn1MRGX6.js"), P = await o(() => k(v.scene_b64, v.width, v.height));
            P && l({ render: {
              png: P,
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
        }, Cm);
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
function af(e, t) {
  if (!e) return null;
  if (e.path === t) return e.type;
  for (const n of e.children) {
    const r = af(n, t);
    if (r) return r;
  }
  return null;
}
function zm() {
  return (globalThis.__VEUSZ_WASM_BASE__ ?? "/wasm").replace(/\/+$/, "");
}
let Or = null, Ra = !1;
function Tm() {
  if (Ra) return;
  const e = globalThis.GPUAdapter;
  if (!e) return;
  Ra = !0;
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
  return Or || (Or = (async () => {
    Tm();
    const e = zm(), t = await import(
      /* @vite-ignore */
      `${e}/veusz_paint_wasm.js`
    );
    return await t.default({ module_or_path: `${e}/veusz_paint_wasm_bg.wasm` }), t;
  })().catch((e) => {
    throw Or = null, e;
  })), Or;
}
async function sf() {
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
async function Nm(e, t, n = [0, 0, 0, 0]) {
  await cu(e, Fl(t), n);
}
async function Ul(e, t, n, r = "image/png", l = 0.92, i = [1, 1, 1, 1]) {
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
async function cf() {
  try {
    return typeof (await su()).scene_to_svg == "function";
  } catch {
    return !1;
  }
}
async function ff(e, t, n) {
  const r = await su();
  if (typeof r.scene_to_svg != "function")
    throw new Error("this runtime does not include the SVG exporter");
  return r.scene_to_svg(Fl(e), t, n);
}
const df = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base64ToBytes: Fl,
  renderSceneBytesToCanvas: cu,
  renderSceneToCanvas: Nm,
  renderSceneToImageBlob: Ul,
  sceneToSvg: ff,
  svgExportAvailable: cf,
  webgpuAvailable: sf
}, Symbol.toStringTag, { value: "Module" })), jm = "0.26.4", Rm = `https://cdn.jsdelivr.net/pyodide/v${jm}/full/`;
let Dn = null;
async function Lm(e) {
  if (Dn) return Dn;
  const t = e.pyodideIndexUrl ?? Rm, n = e.onProgress ?? (() => {
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
let Dm = 0;
async function Mm(e = {}) {
  const t = e.onProgress ?? (() => {
  });
  e.wasmBase && (globalThis.__VEUSZ_WASM_BASE__ = e.wasmBase);
  const n = await Lm(e);
  t("Starting renderer…");
  const l = n.pyimport("veusz.daemon.pyodide_bridge").Bridge(), i = Yp(l), o = `/veusz/fig_${Dm++}`, u = `${o}/figure.vsz`, a = async (s, c = []) => {
    await n.runPythonAsync(`import os; os.makedirs(${JSON.stringify(o)}, exist_ok=True)`);
    for (const f of c) {
      const p = `${o}/${f.name}`, y = p.slice(0, p.lastIndexOf("/"));
      y && y !== o && await n.runPythonAsync(`import os; os.makedirs(${JSON.stringify(y)}, exist_ok=True)`), n.FS.writeFile(p, f.bytes);
    }
    return n.FS.writeFile(u, s), i.call("file.open", { path: u });
  };
  return t("Ready"), { transport: i, bridge: l, loadVsz: a, pyodide: n };
}
async function Im(e, t = {}) {
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
      const v = new Uint8Array(await y.arrayBuffer()), k = pf(v), P = y.headers.get("etag"), m = y.headers.get("last-modified"), d = y.headers.get("content-type");
      await e.call("data.url_refresh", {
        url: s.url,
        bytes_b64: k,
        etag: P,
        last_modified: m,
        content_type: d
      }), f.etag = P, f.lastModified = m, l({ url: s.url, phase: "ok" });
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
async function $m(e, t, n = {}) {
  const r = Om(e), l = n.onError ?? ((i, o) => console.warn(`[veusz-figure] pre-fetch ${i}: ${o.message}`));
  return await Promise.allSettled(r.map(async (i) => {
    const o = n.urlMap && Object.prototype.hasOwnProperty.call(n.urlMap, i) ? n.urlMap[i] : n.urlBase ? new URL(i, n.urlBase).toString() : i;
    try {
      const u = await fetch(o, { cache: "no-store" });
      if (!u.ok) throw new Error(`HTTP ${u.status}`);
      const a = new Uint8Array(await u.arrayBuffer());
      await t.call("data.url_ingest", {
        url: i,
        // Python's cache key = original URL
        bytes_b64: pf(a),
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
function Om(e) {
  const t = [], n = /ImportFileURL\s*\(\s*(['"])([^'"\n]+)\1/g;
  let r;
  for (; (r = n.exec(e)) !== null; ) t.push(r[2]);
  return t;
}
function pf(e) {
  let t = "";
  for (let r = 0; r < e.length; r += 32768)
    t += String.fromCharCode.apply(
      null,
      Array.from(e.subarray(r, r + 32768))
    );
  return btoa(t);
}
const Fm = /\bImport[A-Za-z0-9]*\s*\(\s*[uUrRbB]?(['"])([^'"\n]+)\1/g;
function Um(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e.matchAll(Fm)) {
    const r = n[2];
    /^[a-z][a-z0-9+.-]*:\/\//i.test(r) || /\.[A-Za-z0-9]+$/.test(r) && t.add(r);
  }
  return [...t];
}
async function Am(e, t, n = {}, r = fetch) {
  const l = Um(e);
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
var mf = { exports: {} }, Al = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Bm = M, Vm = Symbol.for("react.element"), Wm = Symbol.for("react.fragment"), Hm = Object.prototype.hasOwnProperty, Qm = Bm.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, Ym = { key: !0, ref: !0, __self: !0, __source: !0 };
function hf(e, t, n) {
  var r, l = {}, i = null, o = null;
  n !== void 0 && (i = "" + n), t.key !== void 0 && (i = "" + t.key), t.ref !== void 0 && (o = t.ref);
  for (r in t) Hm.call(t, r) && !Ym.hasOwnProperty(r) && (l[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) l[r] === void 0 && (l[r] = t[r]);
  return { $$typeof: Vm, type: e, key: i, ref: o, props: l, _owner: Qm.current };
}
Al.Fragment = Wm;
Al.jsx = hf;
Al.jsxs = hf;
mf.exports = Al;
var g = mf.exports;
function Xm(e, t) {
  const n = new Map(t.map((l) => [l.path, l])), r = [];
  for (const l of e) {
    const i = n.get(l.path);
    if (!i) continue;
    const o = Math.min(l.value, i.value), u = Math.max(l.value, i.value);
    !(u > o) || !Number.isFinite(o) || !Number.isFinite(u) || (r.push({ path: `${l.path}/min`, value: o }), r.push({ path: `${l.path}/max`, value: u }));
  }
  return r;
}
function Km(e) {
  const t = [];
  for (const n of new Set(e))
    t.push({ path: `${n}/min`, value: "Auto" }), t.push({ path: `${n}/max`, value: "Auto" });
  return t;
}
function Gm(e, t, n) {
  const r = new Map(t.map((i) => [i.path, i])), l = [];
  for (const i of e) {
    const o = r.get(i.path), u = n.get(i.path);
    if (!o || !u) continue;
    const a = i.value - o.value;
    Number.isFinite(a) && (l.push({ path: `${i.path}/min`, value: u.min + a }), l.push({ path: `${i.path}/max`, value: u.max + a }));
  }
  return l;
}
function Zm(e, t, n, r, l) {
  const i = new Map(t.map((s) => [s.path, s])), o = new Map(n.map((s) => [s.path, s])), u = new Map(r.map((s) => [s.path, s])), a = [];
  for (const s of e) {
    const c = i.get(s.path), f = o.get(s.path), p = u.get(s.path), y = l.get(s.path);
    if (!c || !f || !p || !y) continue;
    const v = s.value, k = c.value, P = f.value, d = p.value - P;
    if (!Number.isFinite(d) || d === 0) continue;
    const h = (k - v) / d;
    if (!Number.isFinite(h) || h <= 0) continue;
    const x = v + h * (y.min - P), S = v + h * (y.max - P);
    if (!Number.isFinite(x) || !Number.isFinite(S)) continue;
    const _ = Math.min(x, S), C = Math.max(x, S);
    C > _ && (a.push({ path: `${s.path}/min`, value: _ }), a.push({ path: `${s.path}/max`, value: C }));
  }
  return a;
}
function Jm(e) {
  const t = (i) => {
    const o = Math.abs(i);
    return o !== 0 && (o < 1e-3 || o >= 1e5) ? i.toExponential(3) : Number(i.toPrecision(5)).toString();
  }, n = e.find((i) => i.direction === "horizontal"), r = e.find((i) => i.direction === "vertical"), l = [];
  return n && l.push(`x: ${t(n.value)}`), r && l.push(`y: ${t(r.value)}`), l.join("   ");
}
const La = 4, Da = 2400, Ma = 2;
function vf({
  store: e,
  width: t,
  height: n
}) {
  const r = e((w) => w.render), l = e((w) => w.tree), i = e((w) => w.currentPage), o = e((w) => w.values), u = e((w) => w.requestRender), a = M.useRef(null), s = M.useRef(null), c = M.useRef(null), f = M.useMemo(() => {
    let w = Math.max(1, Math.round(t * Ma)), L = Math.max(1, Math.round(n * Ma));
    const T = Math.max(w, L);
    if (T > Da) {
      const $ = Da / T;
      w = Math.round(w * $), L = Math.round(L * $);
    }
    return { w, h: L };
  }, [t, n]), [p, y] = M.useState({ w: t, h: n }), [v, k] = M.useState(null), [P, m] = M.useState(null), [d, h] = M.useState(null), x = M.useRef(/* @__PURE__ */ new Set()), S = M.useRef(null), _ = M.useRef(null), C = M.useRef(/* @__PURE__ */ new Map()), R = M.useRef(0);
  M.useEffect(() => {
    const w = s.current;
    if (!w) return;
    const L = t > 0 ? n / t : 0.7143, T = () => {
      const U = w.clientWidth, V = w.clientHeight;
      let F, A;
      if (U > 0 && V > 0) {
        const W = Math.min(U / t, V / n);
        F = t * W, A = n * W;
      } else U > 0 ? (F = U, A = U * L) : (F = t, A = n);
      y((W) => Math.abs(W.w - F) < 0.5 && Math.abs(W.h - A) < 0.5 ? W : { w: F, h: A });
    };
    if (T(), typeof ResizeObserver > "u") return;
    const $ = new ResizeObserver(T);
    return $.observe(w), () => $.disconnect();
  }, [t, n]), M.useEffect(() => {
    l && l.children.length > 0 && u(i, f.w, f.h);
  }, [l, o, i, f.w, f.h, u]), M.useEffect(() => {
    const w = r == null ? void 0 : r.sceneB64, L = a.current;
    if (!w || !L) return;
    let T = !1;
    return (async () => {
      try {
        const { renderSceneToCanvas: $ } = await Promise.resolve().then(() => df);
        T || await $(L, w, [1, 1, 1, 1]);
      } catch ($) {
        T || console.error("embed scene render failed", $);
      }
    })(), () => {
      T = !0;
    };
  }, [r == null ? void 0 : r.sceneB64]);
  const j = () => e.getState().rpc, D = (w, L) => {
    const $ = a.current.getBoundingClientRect();
    return [
      (w - $.left) * (f.w / ($.width || 1)),
      (L - $.top) * (f.h / ($.height || 1))
    ];
  }, b = async (w) => {
    await e.getState().setValues(w), u(i, f.w, f.h);
  }, _t = () => {
    const w = a.current;
    if (!w) return;
    const L = [...C.current.keys()];
    if (L.length < 2) return;
    const [T, $] = L, U = C.current.get(T), V = C.current.get($), F = w.getBoundingClientRect(), A = U.clientX - F.left, W = U.clientY - F.top, oe = V.clientX - F.left, Pt = V.clientY - F.top;
    _.current = {
      id1: T,
      id2: $,
      startDist: Math.hypot(oe - A, Pt - W) || 1,
      startCx: (A + oe) / 2,
      startCy: (W + Pt) / 2
    }, S.current = null, k(null), (async () => {
      const [zt, kn] = [D(U.clientX, U.clientY), D(V.clientX, V.clientY)], [gr, pu] = await Promise.all([
        j().render.pixelToData(zt[0], zt[1]),
        j().render.pixelToData(kn[0], kn[1])
      ]);
      if (!_.current) return;
      _.current.data1 = gr.axes, _.current.data2 = pu.axes;
      const mu = /* @__PURE__ */ new Map();
      for (const En of new Set([...gr.axes, ...pu.axes].map((wr) => wr.path))) {
        const wr = await j().doc.get([`${En}/min`, `${En}/max`]), hu = Number(wr[`${En}/min`]), vu = Number(wr[`${En}/max`]);
        Number.isFinite(hu) && Number.isFinite(vu) && mu.set(En, { min: hu, max: vu });
      }
      _.current && (_.current.ranges = mu);
    })();
  }, Ct = () => {
    const w = _.current, L = a.current;
    if (!w || !L) return;
    const T = C.current.get(w.id1), $ = C.current.get(w.id2);
    if (!T || !$) return;
    const U = L.getBoundingClientRect(), V = T.clientX - U.left, F = T.clientY - U.top, A = $.clientX - U.left, W = $.clientY - U.top, oe = Math.hypot(A - V, W - F) || 1;
    h({
      scale: oe / w.startDist,
      ox: w.startCx,
      oy: w.startCy,
      tx: (V + A) / 2 - w.startCx,
      ty: (F + W) / 2 - w.startCy
    });
  }, yr = (w, L) => {
    const T = _.current;
    if (_.current = null, h(null), !T || !T.data1 || !T.data2 || !T.ranges) return;
    const $ = T.id1 === L ? w : C.current.get(T.id1), U = T.id2 === L ? w : C.current.get(T.id2);
    if (!$ || !U) return;
    const V = D($.clientX, $.clientY), F = D(U.clientX, U.clientY);
    (async () => {
      const [A, W] = await Promise.all([
        j().render.pixelToData(V[0], V[1]),
        j().render.pixelToData(F[0], F[1])
      ]), oe = Zm(T.data1, T.data2, A.axes, W.axes, T.ranges);
      oe.length && await b(oe);
    })();
  }, Bl = (w) => {
    var U, V;
    if ((V = (U = w.currentTarget).setPointerCapture) == null || V.call(U, w.pointerId), C.current.set(w.pointerId, { clientX: w.clientX, clientY: w.clientY }), C.current.size >= 2) {
      _t();
      return;
    }
    const [L, T] = D(w.clientX, w.clientY), $ = w.pointerType === "mouse" ? w.shiftKey || w.button === 1 : !0;
    S.current = { pointerId: w.pointerId, mode: $ ? "pan" : "zoom", sx: L, sy: T, moved: !1 }, $ && j().render.pixelToData(L, T).then(async (F) => {
      if (!S.current) return;
      S.current.from = F.axes;
      const A = /* @__PURE__ */ new Map();
      for (const W of F.axes) {
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
      const [V, F] = D(w.clientX, w.clientY);
      (Math.abs(V - L.sx) > La || Math.abs(F - L.sy) > La) && (L.moved = !0), L.mode === "zoom" && L.moved && k({ x0: L.sx, y0: L.sy, x1: V, y1: F });
      return;
    }
    if (w.pointerType !== "mouse" || w.buttons !== 0) return;
    const T = performance.now();
    if (T - R.current < 40) return;
    R.current = T;
    const [$, U] = D(w.clientX, w.clientY);
    j().render.pixelToData($, U).then((V) => {
      var kn;
      V.axes.forEach((gr) => x.current.add(gr.path));
      const F = Jm(V.axes);
      if (!F) {
        m(null);
        return;
      }
      const A = ((kn = c.current) == null ? void 0 : kn.getBoundingClientRect()) ?? { left: 0, top: 0, width: 0, height: 0 }, W = w.clientX - A.left, oe = w.clientY - A.top, Pt = A.width > 0 && W > A.width * 0.6, zt = A.height > 0 && oe > A.height * 0.85;
      m({
        ...Pt ? { right: Math.max(4, A.width - W + 12) } : { left: W + 12 },
        top: zt ? Math.max(4, oe - 22) : oe + 12,
        text: F
      });
    });
  }, xn = (w) => {
    var V, F;
    (F = (V = w.currentTarget).releasePointerCapture) == null || F.call(V, w.pointerId);
    const L = C.current.get(w.pointerId) ?? { clientX: w.clientX, clientY: w.clientY };
    if (_.current) {
      yr(L, w.pointerId), C.current.delete(w.pointerId);
      return;
    }
    C.current.delete(w.pointerId);
    const T = S.current;
    if (!T || T.pointerId !== w.pointerId || (S.current = null, k(null), !T.moved)) return;
    const [$, U] = D(w.clientX, w.clientY);
    T.mode === "zoom" ? (async () => {
      const [A, W] = await Promise.all([
        j().render.pixelToData(T.sx, T.sy),
        j().render.pixelToData($, U)
      ]), oe = Xm(A.axes, W.axes);
      oe.length && await b(oe);
    })() : T.mode === "pan" && T.from && T.ranges && (async () => {
      const A = await j().render.pixelToData($, U), W = Gm(T.from, A.axes, T.ranges);
      W.length && await b(W);
    })();
  }, z = (w) => {
    C.current.delete(w.pointerId), _.current = null, S.current = null, k(null), h(null);
  }, I = () => {
    x.current.size && b(Km(x.current));
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
        m(null);
      },
      children: /* @__PURE__ */ g.jsxs("div", { ref: c, style: { position: "relative", width: p.w, height: p.h }, children: [
        /* @__PURE__ */ g.jsx(
          "canvas",
          {
            ref: a,
            width: f.w,
            height: f.h,
            "data-testid": "embed-canvas",
            onPointerDown: Bl,
            onPointerMove: Sn,
            onPointerUp: xn,
            onPointerCancel: z,
            onDoubleClick: I,
            style: {
              width: "100%",
              height: "100%",
              display: "block",
              cursor: "crosshair",
              touchAction: "none",
              transform: d ? `translate(${d.tx}px, ${d.ty}px) scale(${d.scale})` : void 0,
              transformOrigin: d ? `${d.ox}px ${d.oy}px` : void 0
            }
          }
        ),
        v && /* @__PURE__ */ g.jsx("div", { "data-testid": "embed-zoomband", style: {
          position: "absolute",
          pointerEvents: "none",
          border: "1px solid #1f6feb",
          background: "rgba(31,111,235,0.12)",
          left: `${Math.min(v.x0, v.x1) / f.w * 100}%`,
          top: `${Math.min(v.y0, v.y1) / f.h * 100}%`,
          width: `${Math.abs(v.x1 - v.x0) / f.w * 100}%`,
          height: `${Math.abs(v.y1 - v.y0) / f.h * 100}%`
        } }),
        P && /* @__PURE__ */ g.jsx("div", { "data-testid": "embed-tooltip", style: {
          position: "absolute",
          left: P.left,
          right: P.right,
          top: P.top,
          pointerEvents: "none",
          background: "rgba(20,22,26,0.9)",
          color: "#fff",
          font: "12px system-ui",
          padding: "2px 6px",
          borderRadius: 4,
          whiteSpace: "nowrap",
          zIndex: 5
        }, children: P.text })
      ] })
    }
  );
}
function qm({
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
    yf,
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
function bm(e) {
  return e.shiftKey ? "range" : e.ctrlKey || e.metaKey ? "toggle" : "replace";
}
function yf({
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
      eh,
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
        onClick: (c) => r(e.path, bm(c)),
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
      yf,
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
function eh({
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
function po({ schema: e, value: t, onChange: n }) {
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
function mo({ schema: e, value: t, onChange: n }) {
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
      po,
      {
        schema: e,
        value: t,
        onChange: n
      }
    )
  ] });
}
function th({ schema: e, value: t, onChange: n, siblings: r }) {
  if (!((r == null ? void 0 : r.mode) === "datetime"))
    return /* @__PURE__ */ g.jsx(mo, { schema: e, value: t, onChange: n });
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
function nh({ schema: e, value: t, onChange: n }) {
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
function rh({ schema: e, value: t, onChange: n }) {
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
        value: ih(r),
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
const Ia = /* @__PURE__ */ new Map(), lh = {
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
function ih(e) {
  if (/^#[0-9a-fA-F]{6}$/.test(e)) return e;
  const t = lh[e.toLowerCase()];
  if (t) return t;
  if (typeof document > "u") return "#000000";
  const n = Ia.get(e);
  if (n) return n;
  const r = document.createElement("div");
  r.style.color = e, r.style.display = "none", document.body.appendChild(r);
  const l = getComputedStyle(r).color;
  document.body.removeChild(r);
  const i = l.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!i) return "#000000";
  const o = "#" + [i[1], i[2], i[3]].map((u) => parseInt(u, 10).toString(16).padStart(2, "0")).join("");
  return Ia.set(e, o), o;
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
const $a = /^(-?\d+(?:\.\d+)?)\s*(pt|cm|mm|in|%|\/)?$/;
function hi({ schema: e, value: t, onChange: n, allowAuto: r = !1 }) {
  const l = typeof t == "string" ? t : "", i = l.toLowerCase() === "auto", o = (() => {
    if (i) return { num: "", unit: "pt" };
    const p = l.match($a);
    return { num: (p == null ? void 0 : p[1]) ?? "", unit: (p == null ? void 0 : p[2]) ?? "pt" };
  })(), [u, a] = M.useState(o.num), [s, c] = M.useState(o.unit);
  M.useEffect(() => {
    if (i) return;
    const p = l.match($a);
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
function vi({
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
function oh({ schema: e, value: t, onChange: n }) {
  const r = uh(t), [l, i] = M.useState(r);
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
function uh(e) {
  return typeof e == "string" ? e : e && typeof e == "object" && !Array.isArray(e) ? Object.entries(e).map(([t, n]) => `${t}=${n}`).join(`
`) : "";
}
function ah({ schema: e, value: t, onChange: n }) {
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
function sh({ schema: e, value: t, onChange: n }) {
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
function ch({ schema: e, value: t, onChange: n }) {
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
function yi({ schema: e, value: t, onChange: n }) {
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
function fh({ schema: e, value: t, onChange: n }) {
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
function Ur({ schema: e, value: t, onChange: n }) {
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
function gi({
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
const gf = {
  // Atomic
  str: Ur,
  "str-notes": Ur,
  bool: nh,
  int: po,
  float: po,
  "float-or-auto": mo,
  "int-or-auto": mo,
  "float-slider": sh,
  distance: hi,
  "distance-or-auto": (e) => /* @__PURE__ */ g.jsx(hi, { ...e, allowAuto: !0 }),
  displacement: hi,
  choice: Ee,
  "choice-or-more": (e) => /* @__PURE__ */ g.jsx(Ee, { ...e, editable: !0 }),
  "float-choice": (e) => /* @__PURE__ */ g.jsx(Ee, { ...e, editable: !0 }),
  color: rh,
  colormap: Ee,
  marker: fh,
  arrow: Ee,
  "line-style": ch,
  "fill-style": Ee,
  "fill-style-ext": Ee,
  "errorbar-style": Ee,
  "align-horz": Ee,
  "align-vert": Ee,
  "align-horz-+manual": Ee,
  "align-vert-+manual": Ee,
  "font-family": Ur,
  "font-style": Ur,
  "rotate-interval": Ee,
  "axis-bound": th,
  // List / composite
  "float-list": ah,
  "float-dict": oh,
  "str-multi": yi,
  "line-multi": yi,
  "fill-multi": yi,
  // Reference-by-path
  dataset: Fr,
  "dataset-multi": Fr,
  "dataset-extended": Fr,
  "dataset-or-str": Fr,
  "widget-path": gi,
  "widget-choice": gi,
  axis: gi,
  // File-system
  filename: vi,
  "filename-image": vi,
  "filename-svg": vi,
  // Internal — kept hidden by the inspector via `setting.hidden`,
  // but mapped here so the registry-coverage assertions report 100%.
  "backward-compat": () => null
};
new Set(
  Object.keys(gf)
);
function dh(e) {
  return gf[e] ?? null;
}
function ph(e) {
  var f;
  const t = e.widgetPaths[0], n = e.widgetPaths.length > 1, [r, l] = M.useState({}), i = (p, y) => r[p] ?? !wf(y), o = (p, y) => l((v) => ({ ...v, [p]: y })), [u, a] = M.useState(!1), s = (p, y) => {
    var P;
    if (!n) {
      e.onChange(p, y);
      return;
    }
    const v = p.slice(t.length), k = e.widgetPaths.map((m) => ({ path: m + v, value: y }));
    (P = e.onChangeMany) == null || P.call(e, k);
  }, c = n ? `${((f = e.schema.typenames) == null ? void 0 : f.join(", ")) ?? "widgets"} ×${e.widgetPaths.length}` : e.schema.typename ?? "";
  return /* @__PURE__ */ g.jsxs(
    "div",
    {
      "data-testid": "inspector",
      "data-widget": t,
      "data-multi": n || void 0,
      "data-count": e.widgetPaths.length,
      children: [
        /* @__PURE__ */ g.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
          /* @__PURE__ */ g.jsx("h3", { "data-testid": "inspector-title", style: { margin: "0.3em 0" }, children: c }),
          /* @__PURE__ */ g.jsxs(
            "label",
            {
              style: { fontSize: 12, color: "#666", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", whiteSpace: "nowrap" },
              title: "Show only settings changed from their default",
              children: [
                /* @__PURE__ */ g.jsx(
                  "input",
                  {
                    type: "checkbox",
                    "data-testid": "inspector-only-customised",
                    checked: u,
                    onChange: (p) => a(p.target.checked)
                  }
                ),
                "Only customised"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ g.jsx(
          xf,
          {
            group: e.schema,
            basePath: t,
            widgetPath: t,
            values: e.values,
            datasets: e.datasets,
            onChange: s,
            settingMenu: e.settingMenu,
            groupOpen: i,
            setGroupOpen: o,
            hideDefaults: u
          }
        )
      ]
    }
  );
}
function wf(e) {
  if (e.setnsmode) return e.setnsmode === "formatting";
  const t = e.settings.filter((n) => !n.hidden);
  return t.length > 0 ? t.every((n) => n.formatting) : e.subgroups.length > 0 ? e.subgroups.every(wf) : !1;
}
function Sf(e, t, n) {
  for (const r of e.settings)
    if (!r.hidden && !fu(r, n[fr(t, r.name)], r.mixed_value === !0))
      return !0;
  for (const r of e.subgroups)
    if (Sf(r, fr(t, r.name), n)) return !0;
  return !1;
}
function xf({ group: e, basePath: t, widgetPath: n, values: r, datasets: l, onChange: i, settingMenu: o, groupLabel: u, groupOpen: a, setGroupOpen: s, hideDefaults: c }) {
  return /* @__PURE__ */ g.jsxs(M.Fragment, { children: [
    e.settings.map((f) => {
      if (f.hidden) return null;
      const p = r[fr(t, f.name)];
      return c && fu(f, p, f.mixed_value === !0) ? null : /* @__PURE__ */ g.jsx(
        hh,
        {
          schema: f,
          basePath: t,
          widgetPath: n,
          value: p,
          datasets: l,
          onChange: i,
          settingMenu: o,
          groupLabel: u
        },
        f.name
      );
    }),
    e.subgroups.map((f) => {
      const p = f.usertext || vh(f.name), y = fr(t, f.name), v = Sf(f, y, r);
      if (c && !v) return null;
      const k = c ? v : a(y, f);
      return /* @__PURE__ */ g.jsxs(
        "details",
        {
          "data-testid": `subgroup-${f.name}`,
          "data-customised": v || void 0,
          open: k,
          onToggle: (P) => {
            const m = P.currentTarget, d = typeof m.open == "boolean" ? m.open : m.hasAttribute("open");
            d !== k && s(y, d);
          },
          children: [
            /* @__PURE__ */ g.jsx("summary", { style: { opacity: v ? 1 : 0.5, fontWeight: v ? 600 : 400 }, children: p }),
            /* @__PURE__ */ g.jsx(
              xf,
              {
                group: f,
                basePath: y,
                widgetPath: n,
                values: r,
                datasets: l,
                onChange: i,
                settingMenu: o,
                groupLabel: p,
                groupOpen: a,
                setGroupOpen: s,
                hideDefaults: c
              }
            )
          ]
        },
        f.name
      );
    })
  ] });
}
function mh(e, t) {
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
function fu(e, t, n) {
  return n ? !1 : t === void 0 ? !0 : mh(t, e.default);
}
function Oa(e) {
  return {
    borderLeft: `2px solid ${e ? "transparent" : "#1f6feb"}`,
    paddingLeft: 6,
    opacity: e ? 0.5 : 1
  };
}
function hh({
  schema: e,
  basePath: t,
  widgetPath: n,
  value: r,
  datasets: l,
  onChange: i,
  settingMenu: o,
  groupLabel: u
}) {
  const a = dh(e.typename), s = fr(t, e.name), c = gh(e, u), f = e.mixed_value === !0, p = fu(e, r, f), y = (v) => o ? o(
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
      "data-mixed": f || void 0,
      "data-default": p || void 0,
      style: Oa(p),
      children: [
        y(
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
            onChange: (v) => i(s, v)
          }
        )
      ]
    }
  ) : /* @__PURE__ */ g.jsxs(
    "div",
    {
      "data-testid": `row-${e.name}`,
      "data-mixed": f || void 0,
      "data-default": p || void 0,
      style: Oa(p),
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
function fr(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
function vh(e) {
  if (!e) return e;
  const t = e.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
const yh = /* @__PURE__ */ new Set(["color", "hide", "width", "style"]);
function gh(e, t) {
  const n = e.usertext || e.name;
  return t ? yh.has(e.name) ? `${t} ${n.toLowerCase()}` : n : e.name === "color" && e.descr ? e.descr : n;
}
function wh({
  store: e,
  title: t,
  width: n,
  height: r,
  toolbar: l,
  onClose: i
}) {
  const o = e((S) => S.tree), u = e((S) => S.selected), a = e((S) => S.schema), s = e((S) => S.values), c = e((S) => S.datasets), f = e((S) => S.error), p = e((S) => S.canUndo), y = e((S) => S.canRedo), [v, k] = M.useState(!1), [P, m] = M.useState(!1);
  M.useEffect(() => {
    if (typeof document > "u") return;
    const S = document.documentElement, _ = document.body, C = S.style.overflow, R = _.style.overflow;
    return S.style.overflow = "hidden", _.style.overflow = "hidden", () => {
      S.style.overflow = C, _.style.overflow = R;
    };
  }, []);
  const d = () => {
    e.getState().undo();
  }, h = () => {
    e.getState().redo();
  }, x = async () => {
    m(!0);
    try {
      for (let S = 0; S < 1e3 && e.getState().canUndo; S++)
        await e.getState().undo();
    } finally {
      m(!1);
    }
  };
  return ef.createPortal(
    /* @__PURE__ */ g.jsx(
      "div",
      {
        "data-testid": "veusz-modal",
        style: Sh,
        onMouseDown: (S) => {
          S.target === S.currentTarget && i();
        },
        children: /* @__PURE__ */ g.jsxs("div", { style: v ? xh : kf, "data-testid": "veusz-modal-window", children: [
          /* @__PURE__ */ g.jsxs("header", { style: kh, children: [
            /* @__PURE__ */ g.jsx("strong", { style: { fontSize: 14 }, children: t ?? "Edit figure" }),
            /* @__PURE__ */ g.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
              /* @__PURE__ */ g.jsx(
                "button",
                {
                  type: "button",
                  "data-testid": "veusz-undo",
                  onClick: d,
                  disabled: !p || P,
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
                  onClick: h,
                  disabled: !y || P,
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
                  disabled: !p || P,
                  style: Mn,
                  title: "Reset all edits to the original figure",
                  children: "⟲ Reset"
                }
              )
            ] }),
            f && /* @__PURE__ */ g.jsx("span", { "data-testid": "veusz-error", style: { color: "crimson", fontSize: 12 }, children: f }),
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
          /* @__PURE__ */ g.jsxs("div", { style: Eh, children: [
            /* @__PURE__ */ g.jsx("div", { style: _h, children: /* @__PURE__ */ g.jsx(vf, { store: e, width: n, height: r }) }),
            /* @__PURE__ */ g.jsxs("aside", { style: Ch, "data-testid": "veusz-edit-panel", children: [
              o ? /* @__PURE__ */ g.jsx(
                qm,
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
                ph,
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
const Sh = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,17,21,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1e3,
  font: "14px system-ui, sans-serif"
}, kf = {
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
}, xh = {
  ...kf,
  width: "100vw",
  height: "100vh",
  borderRadius: 0,
  resize: "none"
}, kh = {
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
}, Eh = {
  flex: "1 1 auto",
  display: "flex",
  minHeight: 0,
  alignItems: "stretch"
}, _h = {
  flex: "1 1 auto",
  minWidth: 0,
  minHeight: 0,
  padding: 10,
  background: "#fff"
}, Ch = {
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
        style: Ph,
        title: "Download this figure",
        children: n ? "…" : "⤓ Download ▾"
      }
    ),
    r && /* @__PURE__ */ g.jsx("div", { role: "menu", "data-testid": "veusz-download-menu", style: zh, children: e.map((o) => {
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
          style: Ua,
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
          style: Ua,
          children: u
        },
        a
      );
    }) })
  ] });
}
const Ph = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 10px",
  cursor: "pointer",
  fontSize: 12,
  background: "#fff",
  color: "#222"
}, zh = {
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
}, Ua = {
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
}, Aa = "veusz-embed-styles", Th = `
.vz-fig { position: relative; }
.vz-fig .vz-inline { display: block; }
.vz-fig .vz-preview { display: block; width: 100%; height: auto; background: #fff; }
`;
function Ef() {
  if (typeof document > "u" || document.getElementById(Aa)) return;
  const e = document.createElement("style");
  e.id = Aa, e.textContent = Th, document.head.appendChild(e);
}
const an = 2;
async function Nh(e, t) {
  const { rpc: n } = e.getState(), r = await n.render.scene(t.page, t.width, t.height, t.dpi ?? 96), l = await ff(r.scene_b64, r.width, r.height);
  Lh(l, t.filename ?? "figure.svg", "image/svg+xml");
}
async function jh(e, t) {
  const { rpc: n } = e.getState(), r = t.width * an, l = t.height * an, i = await n.render.scene(t.page, r, l, (t.dpi ?? 96) * an), o = await Ul(i.scene_b64, i.width, i.height, "image/png");
  du(o, t.filename ?? "figure.png");
}
async function Rh(e, t) {
  const { rpc: n } = e.getState(), r = t.width * an, l = t.height * an, i = await n.render.scene(t.page, r, l, (t.dpi ?? 96) * an), o = await Ul(i.scene_b64, i.width, i.height, "image/jpeg"), u = new Uint8Array(await o.arrayBuffer()), a = Dh(u, i.width, i.height, t.width, t.height);
  du(new Blob([a], { type: "application/pdf" }), t.filename ?? "figure.pdf");
}
function Lh(e, t, n) {
  du(new Blob([e], { type: n }), t);
}
function du(e, t) {
  const n = URL.createObjectURL(e), r = document.createElement("a");
  r.href = n, r.download = t, document.body.appendChild(r), r.click(), r.remove(), setTimeout(() => URL.revokeObjectURL(n), 1e3);
}
function Dh(e, t, n, r, l) {
  const i = new TextEncoder(), o = [], u = [];
  let a = 0;
  const s = (P) => {
    const m = typeof P == "string" ? i.encode(P) : P;
    o.push(m), a += m.length;
  }, c = (P, m) => {
    u[P] = a, s(`${P} 0 obj
${m}
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
  for (let P = 1; P <= 5; P++) y += `${String(u[P]).padStart(10, "0")} 00000 n 
`;
  s(y), s(`trailer
<< /Size 6 /Root 1 0 R >>
startxref
${p}
%%EOF
`);
  const v = new Uint8Array(a);
  let k = 0;
  for (const P of o)
    v.set(P, k), k += P.length;
  return v;
}
Ef();
function Mh({
  store: e,
  width: t = 700,
  height: n = 500,
  editable: r = !0,
  title: l,
  poster: i,
  vszUrl: o,
  initialEditing: u
}) {
  const a = e((j) => j.error), s = e((j) => j.webgpuAvailable), c = e((j) => j.currentPage), [f, p] = M.useState(!!u), [y, v] = M.useState(!1), [k, P] = M.useState(!1), [m, d] = M.useState(i), h = M.useRef(null);
  M.useEffect(() => {
    Ef();
    const j = e.getState();
    return j.setBackend("vello-wasm"), j.probeWebgpu(), j.loadPlotPrefs(), j.refreshAll(), j.subscribeToDaemon();
  }, [e]), M.useEffect(() => {
    let j = !0;
    return cf().then((D) => {
      j && v(D);
    }), () => {
      j = !1;
    };
  }, []), M.useEffect(() => () => {
    h.current && URL.revokeObjectURL(h.current);
  }, []);
  const x = (j) => `${(l ?? "figure").replace(/\s+/g, "_")}.${j}`, S = async (j, D) => {
    P(!0);
    try {
      await j();
    } catch (b) {
      e.setState({ error: `${D} failed: ${b.message}` });
    } finally {
      P(!1);
    }
  }, _ = async () => {
    try {
      const j = await e.getState().rpc.render.scene(c, t, n, 96), D = await Ul(j.scene_b64, j.width, j.height, "image/png"), b = URL.createObjectURL(D);
      h.current && URL.revokeObjectURL(h.current), h.current = b, d(b);
    } catch {
    }
  }, C = () => {
    p(!1), m !== void 0 && _();
  }, R = () => {
    const j = [];
    return o && j.push({ label: "Veusz", href: o, download: x("vsz"), hint: ".vsz" }), y && j.push({ label: "SVG", hint: "vector", onSelect: () => void S(() => Nh(e, { page: c, width: t, height: n, filename: x("svg") }), "SVG export") }), j.push({ label: "PNG", hint: "image", onSelect: () => void S(() => jh(e, { page: c, width: t, height: n, filename: x("png") }), "PNG export") }), j.push({ label: "PDF", hint: "page", onSelect: () => void S(() => Rh(e, { page: c, width: t, height: n, filename: x("pdf") }), "PDF export") }), j;
  };
  return s === !1 ? /* @__PURE__ */ g.jsx("div", { "data-testid": "veusz-figure", className: "vz-fig", style: Ba, children: /* @__PURE__ */ g.jsx("div", { "data-testid": "veusz-needs-webgpu", style: { padding: 16, color: "#b06000" }, children: "This interactive figure needs WebGPU. Open in Chrome or Safari 26+." }) }) : /* @__PURE__ */ g.jsxs("div", { "data-testid": "veusz-figure", className: "vz-fig", style: Ba, children: [
    /* @__PURE__ */ g.jsxs("div", { className: "vz-toolbar", style: Ih, children: [
      /* @__PURE__ */ g.jsx(Fa, { items: R(), busy: k }),
      r && /* @__PURE__ */ g.jsx(
        "button",
        {
          type: "button",
          "data-testid": "veusz-edit-toggle",
          onClick: () => p(!0),
          style: $h,
          title: "Edit this figure",
          children: "✎ Edit"
        }
      )
    ] }),
    /* @__PURE__ */ g.jsxs("div", { className: "vz-inline", children: [
      m !== void 0 ? /* @__PURE__ */ g.jsx(
        "img",
        {
          src: m,
          alt: l ?? "Veusz figure",
          className: "vz-preview",
          "data-testid": "veusz-inline-poster"
        }
      ) : /* @__PURE__ */ g.jsx("div", { style: { height: Math.round(n / t * 100) + "%", minHeight: 200 }, children: /* @__PURE__ */ g.jsx(vf, { store: e, width: t, height: n }) }),
      a && !f && /* @__PURE__ */ g.jsx("div", { "data-testid": "veusz-error", style: Oh, children: a })
    ] }),
    f && /* @__PURE__ */ g.jsx(
      wh,
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
const Ba = {
  position: "relative",
  border: "1px solid #e2e4e8",
  borderRadius: 10,
  overflow: "hidden",
  background: "#fff",
  font: "14px system-ui, sans-serif"
}, Ih = {
  position: "absolute",
  top: 8,
  right: 8,
  zIndex: 3,
  display: "flex",
  gap: 6,
  alignItems: "flex-start"
}, $h = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 10px",
  cursor: "pointer",
  fontSize: 12,
  background: "#fff",
  color: "#222"
}, Oh = {
  position: "absolute",
  left: 8,
  bottom: 8,
  color: "crimson",
  fontSize: 12,
  background: "rgba(255,255,255,0.9)",
  padding: "2px 6px",
  borderRadius: 4
}, Va = "This interactive figure needs WebGPU. Open in Chrome or Safari 26+.";
class Fh extends HTMLElement {
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
    if (i.src = n, i.alt = this.getAttribute("title") ?? "Veusz figure", i.style.cssText = "display:block;width:100%;height:auto;", i.addEventListener("error", () => this.status(r.note ?? Va)), l.appendChild(i), r.onActivate) {
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
    if (!await sf()) {
      r ? this.showPoster(r, {
        note: "Static image — the interactive view needs WebGPU (Chrome or Safari 26+)."
      }) : this.status(Va);
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
      const i = await Mm({
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
        urlMap: Uh(this.getAttribute("data-url-map"))
      };
      await $m(u, i.transport, a);
      const s = await Am(u, n, a);
      await i.loadVsz(u, s), this.urlLinks = await Im(i.transport, a);
      const c = Pm(Xp(i.transport));
      this.replaceChildren(), this.noteEl = null;
      const f = document.createElement("div");
      this.appendChild(f), this.root = tf(f), this.root.render(M.createElement(Mh, {
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
function Uh(e) {
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
typeof customElements < "u" && !customElements.get("veusz-figure") && customElements.define("veusz-figure", Fh);
export {
  Fh as VeuszFigureElement
};
//# sourceMappingURL=veusz-embed.js.map
