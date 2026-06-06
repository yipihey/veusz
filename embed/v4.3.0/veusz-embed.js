var Wd = Object.defineProperty;
var Vd = (e, t, n) => t in e ? Wd(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Rn = (e, t, n) => Vd(e, typeof t != "symbol" ? t + "" : t, n);
function tu(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var nu = { exports: {} }, Le = {}, ru = { exports: {} }, O = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var wr = Symbol.for("react.element"), bd = Symbol.for("react.portal"), Hd = Symbol.for("react.fragment"), Qd = Symbol.for("react.strict_mode"), Yd = Symbol.for("react.profiler"), Xd = Symbol.for("react.provider"), Kd = Symbol.for("react.context"), Gd = Symbol.for("react.forward_ref"), Zd = Symbol.for("react.suspense"), Jd = Symbol.for("react.memo"), qd = Symbol.for("react.lazy"), Na = Symbol.iterator;
function ef(e) {
  return e === null || typeof e != "object" ? null : (e = Na && e[Na] || e["@@iterator"], typeof e == "function" ? e : null);
}
var lu = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, iu = Object.assign, ou = {};
function Cn(e, t, n) {
  this.props = e, this.context = t, this.refs = ou, this.updater = n || lu;
}
Cn.prototype.isReactComponent = {};
Cn.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
Cn.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function au() {
}
au.prototype = Cn.prototype;
function Po(e, t, n) {
  this.props = e, this.context = t, this.refs = ou, this.updater = n || lu;
}
var zo = Po.prototype = new au();
zo.constructor = Po;
iu(zo, Cn.prototype);
zo.isPureReactComponent = !0;
var Ta = Array.isArray, su = Object.prototype.hasOwnProperty, No = { current: null }, uu = { key: !0, ref: !0, __self: !0, __source: !0 };
function cu(e, t, n) {
  var r, l = {}, i = null, o = null;
  if (t != null) for (r in t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (i = "" + t.key), t) su.call(t, r) && !uu.hasOwnProperty(r) && (l[r] = t[r]);
  var a = arguments.length - 2;
  if (a === 1) l.children = n;
  else if (1 < a) {
    for (var s = Array(a), u = 0; u < a; u++) s[u] = arguments[u + 2];
    l.children = s;
  }
  if (e && e.defaultProps) for (r in a = e.defaultProps, a) l[r] === void 0 && (l[r] = a[r]);
  return { $$typeof: wr, type: e, key: i, ref: o, props: l, _owner: No.current };
}
function tf(e, t) {
  return { $$typeof: wr, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function To(e) {
  return typeof e == "object" && e !== null && e.$$typeof === wr;
}
function nf(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var Da = /\/+/g;
function ql(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? nf("" + e.key) : t.toString(36);
}
function Xr(e, t, n, r, l) {
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
        case wr:
        case bd:
          o = !0;
      }
  }
  if (o) return o = e, l = l(o), e = r === "" ? "." + ql(o, 0) : r, Ta(l) ? (n = "", e != null && (n = e.replace(Da, "$&/") + "/"), Xr(l, t, n, "", function(u) {
    return u;
  })) : l != null && (To(l) && (l = tf(l, n + (!l.key || o && o.key === l.key ? "" : ("" + l.key).replace(Da, "$&/") + "/") + e)), t.push(l)), 1;
  if (o = 0, r = r === "" ? "." : r + ":", Ta(e)) for (var a = 0; a < e.length; a++) {
    i = e[a];
    var s = r + ql(i, a);
    o += Xr(i, t, n, s, l);
  }
  else if (s = ef(e), typeof s == "function") for (e = s.call(e), a = 0; !(i = e.next()).done; ) i = i.value, s = r + ql(i, a++), o += Xr(i, t, n, s, l);
  else if (i === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return o;
}
function jr(e, t, n) {
  if (e == null) return e;
  var r = [], l = 0;
  return Xr(e, r, "", "", function(i) {
    return t.call(n, i, l++);
  }), r;
}
function rf(e) {
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
var xe = { current: null }, Kr = { transition: null }, lf = { ReactCurrentDispatcher: xe, ReactCurrentBatchConfig: Kr, ReactCurrentOwner: No };
function du() {
  throw Error("act(...) is not supported in production builds of React.");
}
O.Children = { map: jr, forEach: function(e, t, n) {
  jr(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return jr(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return jr(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!To(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
O.Component = Cn;
O.Fragment = Hd;
O.Profiler = Yd;
O.PureComponent = Po;
O.StrictMode = Qd;
O.Suspense = Zd;
O.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = lf;
O.act = du;
O.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = iu({}, e.props), l = e.key, i = e.ref, o = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (i = t.ref, o = No.current), t.key !== void 0 && (l = "" + t.key), e.type && e.type.defaultProps) var a = e.type.defaultProps;
    for (s in t) su.call(t, s) && !uu.hasOwnProperty(s) && (r[s] = t[s] === void 0 && a !== void 0 ? a[s] : t[s]);
  }
  var s = arguments.length - 2;
  if (s === 1) r.children = n;
  else if (1 < s) {
    a = Array(s);
    for (var u = 0; u < s; u++) a[u] = arguments[u + 2];
    r.children = a;
  }
  return { $$typeof: wr, type: e.type, key: l, ref: i, props: r, _owner: o };
};
O.createContext = function(e) {
  return e = { $$typeof: Kd, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: Xd, _context: e }, e.Consumer = e;
};
O.createElement = cu;
O.createFactory = function(e) {
  var t = cu.bind(null, e);
  return t.type = e, t;
};
O.createRef = function() {
  return { current: null };
};
O.forwardRef = function(e) {
  return { $$typeof: Gd, render: e };
};
O.isValidElement = To;
O.lazy = function(e) {
  return { $$typeof: qd, _payload: { _status: -1, _result: e }, _init: rf };
};
O.memo = function(e, t) {
  return { $$typeof: Jd, type: e, compare: t === void 0 ? null : t };
};
O.startTransition = function(e) {
  var t = Kr.transition;
  Kr.transition = {};
  try {
    e();
  } finally {
    Kr.transition = t;
  }
};
O.unstable_act = du;
O.useCallback = function(e, t) {
  return xe.current.useCallback(e, t);
};
O.useContext = function(e) {
  return xe.current.useContext(e);
};
O.useDebugValue = function() {
};
O.useDeferredValue = function(e) {
  return xe.current.useDeferredValue(e);
};
O.useEffect = function(e, t) {
  return xe.current.useEffect(e, t);
};
O.useId = function() {
  return xe.current.useId();
};
O.useImperativeHandle = function(e, t, n) {
  return xe.current.useImperativeHandle(e, t, n);
};
O.useInsertionEffect = function(e, t) {
  return xe.current.useInsertionEffect(e, t);
};
O.useLayoutEffect = function(e, t) {
  return xe.current.useLayoutEffect(e, t);
};
O.useMemo = function(e, t) {
  return xe.current.useMemo(e, t);
};
O.useReducer = function(e, t, n) {
  return xe.current.useReducer(e, t, n);
};
O.useRef = function(e) {
  return xe.current.useRef(e);
};
O.useState = function(e) {
  return xe.current.useState(e);
};
O.useSyncExternalStore = function(e, t, n) {
  return xe.current.useSyncExternalStore(e, t, n);
};
O.useTransition = function() {
  return xe.current.useTransition();
};
O.version = "18.3.1";
ru.exports = O;
var E = ru.exports;
const of = /* @__PURE__ */ tu(E);
var fu = { exports: {} }, pu = {};
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
  function t(D, M) {
    var $ = D.length;
    D.push(M);
    e: for (; 0 < $; ) {
      var Z = $ - 1 >>> 1, S = D[Z];
      if (0 < l(S, M)) D[Z] = M, D[$] = S, $ = Z;
      else break e;
    }
  }
  function n(D) {
    return D.length === 0 ? null : D[0];
  }
  function r(D) {
    if (D.length === 0) return null;
    var M = D[0], $ = D.pop();
    if ($ !== M) {
      D[0] = $;
      e: for (var Z = 0, S = D.length, F = S >>> 1; Z < F; ) {
        var L = 2 * (Z + 1) - 1, U = D[L], A = L + 1, I = D[A];
        if (0 > l(U, $)) A < S && 0 > l(I, U) ? (D[Z] = I, D[A] = $, Z = A) : (D[Z] = U, D[L] = $, Z = L);
        else if (A < S && 0 > l(I, $)) D[Z] = I, D[A] = $, Z = A;
        else break e;
      }
    }
    return M;
  }
  function l(D, M) {
    var $ = D.sortIndex - M.sortIndex;
    return $ !== 0 ? $ : D.id - M.id;
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
  var s = [], u = [], f = 1, p = null, c = 3, v = !1, y = !1, x = !1, j = typeof setTimeout == "function" ? setTimeout : null, m = typeof clearTimeout == "function" ? clearTimeout : null, h = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function g(D) {
    for (var M = n(u); M !== null; ) {
      if (M.callback === null) r(u);
      else if (M.startTime <= D) r(u), M.sortIndex = M.expirationTime, t(s, M);
      else break;
      M = n(u);
    }
  }
  function w(D) {
    if (x = !1, g(D), !y) if (n(s) !== null) y = !0, zn(C);
    else {
      var M = n(u);
      M !== null && Nn(w, M.startTime - D);
    }
  }
  function C(D, M) {
    y = !1, x && (x = !1, m(N), N = -1), v = !0;
    var $ = c;
    try {
      for (g(M), p = n(s); p !== null && (!(p.expirationTime > M) || D && !W()); ) {
        var Z = p.callback;
        if (typeof Z == "function") {
          p.callback = null, c = p.priorityLevel;
          var S = Z(p.expirationTime <= M);
          M = e.unstable_now(), typeof S == "function" ? p.callback = S : p === n(s) && r(s), g(M);
        } else r(s);
        p = n(s);
      }
      if (p !== null) var F = !0;
      else {
        var L = n(u);
        L !== null && Nn(w, L.startTime - M), F = !1;
      }
      return F;
    } finally {
      p = null, c = $, v = !1;
    }
  }
  var T = !1, P = null, N = -1, _ = 5, z = -1;
  function W() {
    return !(e.unstable_now() - z < _);
  }
  function re() {
    if (P !== null) {
      var D = e.unstable_now();
      z = D;
      var M = !0;
      try {
        M = P(!0, D);
      } finally {
        M ? ke() : (T = !1, P = null);
      }
    } else T = !1;
  }
  var ke;
  if (typeof h == "function") ke = function() {
    h(re);
  };
  else if (typeof MessageChannel < "u") {
    var Yt = new MessageChannel(), Xt = Yt.port2;
    Yt.port1.onmessage = re, ke = function() {
      Xt.postMessage(null);
    };
  } else ke = function() {
    j(re, 0);
  };
  function zn(D) {
    P = D, T || (T = !0, ke());
  }
  function Nn(D, M) {
    N = j(function() {
      D(e.unstable_now());
    }, M);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(D) {
    D.callback = null;
  }, e.unstable_continueExecution = function() {
    y || v || (y = !0, zn(C));
  }, e.unstable_forceFrameRate = function(D) {
    0 > D || 125 < D ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : _ = 0 < D ? Math.floor(1e3 / D) : 5;
  }, e.unstable_getCurrentPriorityLevel = function() {
    return c;
  }, e.unstable_getFirstCallbackNode = function() {
    return n(s);
  }, e.unstable_next = function(D) {
    switch (c) {
      case 1:
      case 2:
      case 3:
        var M = 3;
        break;
      default:
        M = c;
    }
    var $ = c;
    c = M;
    try {
      return D();
    } finally {
      c = $;
    }
  }, e.unstable_pauseExecution = function() {
  }, e.unstable_requestPaint = function() {
  }, e.unstable_runWithPriority = function(D, M) {
    switch (D) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        D = 3;
    }
    var $ = c;
    c = D;
    try {
      return M();
    } finally {
      c = $;
    }
  }, e.unstable_scheduleCallback = function(D, M, $) {
    var Z = e.unstable_now();
    switch (typeof $ == "object" && $ !== null ? ($ = $.delay, $ = typeof $ == "number" && 0 < $ ? Z + $ : Z) : $ = Z, D) {
      case 1:
        var S = -1;
        break;
      case 2:
        S = 250;
        break;
      case 5:
        S = 1073741823;
        break;
      case 4:
        S = 1e4;
        break;
      default:
        S = 5e3;
    }
    return S = $ + S, D = { id: f++, callback: M, priorityLevel: D, startTime: $, expirationTime: S, sortIndex: -1 }, $ > Z ? (D.sortIndex = $, t(u, D), n(s) === null && D === n(u) && (x ? (m(N), N = -1) : x = !0, Nn(w, $ - Z))) : (D.sortIndex = S, t(s, D), y || v || (y = !0, zn(C))), D;
  }, e.unstable_shouldYield = W, e.unstable_wrapCallback = function(D) {
    var M = c;
    return function() {
      var $ = c;
      c = M;
      try {
        return D.apply(this, arguments);
      } finally {
        c = $;
      }
    };
  };
})(pu);
fu.exports = pu;
var af = fu.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var sf = E, Re = af;
function k(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var hu = /* @__PURE__ */ new Set(), tr = {};
function Ht(e, t) {
  vn(e, t), vn(e + "Capture", t);
}
function vn(e, t) {
  for (tr[e] = t, e = 0; e < t.length; e++) hu.add(t[e]);
}
var ot = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Ti = Object.prototype.hasOwnProperty, uf = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, Ra = {}, La = {};
function cf(e) {
  return Ti.call(La, e) ? !0 : Ti.call(Ra, e) ? !1 : uf.test(e) ? La[e] = !0 : (Ra[e] = !0, !1);
}
function df(e, t, n, r) {
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
function ff(e, t, n, r) {
  if (t === null || typeof t > "u" || df(e, t, n, r)) return !0;
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
function Se(e, t, n, r, l, i, o) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = l, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = i, this.removeEmptyString = o;
}
var fe = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
  fe[e] = new Se(e, 0, !1, e, null, !1, !1);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
  var t = e[0];
  fe[t] = new Se(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
  fe[e] = new Se(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
  fe[e] = new Se(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
  fe[e] = new Se(e, 3, !1, e.toLowerCase(), null, !1, !1);
});
["checked", "multiple", "muted", "selected"].forEach(function(e) {
  fe[e] = new Se(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function(e) {
  fe[e] = new Se(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function(e) {
  fe[e] = new Se(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function(e) {
  fe[e] = new Se(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var Do = /[\-:]([a-z])/g;
function Ro(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
  var t = e.replace(
    Do,
    Ro
  );
  fe[t] = new Se(t, 1, !1, e, null, !1, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(Do, Ro);
  fe[t] = new Se(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(Do, Ro);
  fe[t] = new Se(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  fe[e] = new Se(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
fe.xlinkHref = new Se("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function(e) {
  fe[e] = new Se(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function Lo(e, t, n, r) {
  var l = fe.hasOwnProperty(t) ? fe[t] : null;
  (l !== null ? l.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (ff(t, n, l, r) && (n = null), r || l === null ? cf(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : l.mustUseProperty ? e[l.propertyName] = n === null ? l.type === 3 ? !1 : "" : n : (t = l.attributeName, r = l.attributeNamespace, n === null ? e.removeAttribute(t) : (l = l.type, n = l === 3 || l === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var ct = sf.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, Pr = Symbol.for("react.element"), Zt = Symbol.for("react.portal"), Jt = Symbol.for("react.fragment"), Mo = Symbol.for("react.strict_mode"), Di = Symbol.for("react.profiler"), mu = Symbol.for("react.provider"), gu = Symbol.for("react.context"), Io = Symbol.for("react.forward_ref"), Ri = Symbol.for("react.suspense"), Li = Symbol.for("react.suspense_list"), $o = Symbol.for("react.memo"), ft = Symbol.for("react.lazy"), vu = Symbol.for("react.offscreen"), Ma = Symbol.iterator;
function Ln(e) {
  return e === null || typeof e != "object" ? null : (e = Ma && e[Ma] || e["@@iterator"], typeof e == "function" ? e : null);
}
var ee = Object.assign, ei;
function Wn(e) {
  if (ei === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    ei = t && t[1] || "";
  }
  return `
` + ei + e;
}
var ti = !1;
function ni(e, t) {
  if (!e || ti) return "";
  ti = !0;
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
    ti = !1, Error.prepareStackTrace = n;
  }
  return (e = e ? e.displayName || e.name : "") ? Wn(e) : "";
}
function pf(e) {
  switch (e.tag) {
    case 5:
      return Wn(e.type);
    case 16:
      return Wn("Lazy");
    case 13:
      return Wn("Suspense");
    case 19:
      return Wn("SuspenseList");
    case 0:
    case 2:
    case 15:
      return e = ni(e.type, !1), e;
    case 11:
      return e = ni(e.type.render, !1), e;
    case 1:
      return e = ni(e.type, !0), e;
    default:
      return "";
  }
}
function Mi(e) {
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
    case Mo:
      return "StrictMode";
    case Ri:
      return "Suspense";
    case Li:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case gu:
      return (e.displayName || "Context") + ".Consumer";
    case mu:
      return (e._context.displayName || "Context") + ".Provider";
    case Io:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case $o:
      return t = e.displayName || null, t !== null ? t : Mi(e.type) || "Memo";
    case ft:
      t = e._payload, e = e._init;
      try {
        return Mi(e(t));
      } catch {
      }
  }
  return null;
}
function hf(e) {
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
      return Mi(t);
    case 8:
      return t === Mo ? "StrictMode" : "Mode";
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
function jt(e) {
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
function yu(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function mf(e) {
  var t = yu(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
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
function zr(e) {
  e._valueTracker || (e._valueTracker = mf(e));
}
function wu(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(), r = "";
  return e && (r = yu(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
}
function al(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function Ii(e, t) {
  var n = t.checked;
  return ee({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function Ia(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = jt(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function xu(e, t) {
  t = t.checked, t != null && Lo(e, "checked", t, !1);
}
function $i(e, t) {
  xu(e, t);
  var n = jt(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? Fi(e, t.type, n) : t.hasOwnProperty("defaultValue") && Fi(e, t.type, jt(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function $a(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function Fi(e, t, n) {
  (t !== "number" || al(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var Vn = Array.isArray;
function cn(e, t, n, r) {
  if (e = e.options, t) {
    t = {};
    for (var l = 0; l < n.length; l++) t["$" + n[l]] = !0;
    for (n = 0; n < e.length; n++) l = t.hasOwnProperty("$" + e[n].value), e[n].selected !== l && (e[n].selected = l), l && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + jt(n), t = null, l = 0; l < e.length; l++) {
      if (e[l].value === n) {
        e[l].selected = !0, r && (e[l].defaultSelected = !0);
        return;
      }
      t !== null || e[l].disabled || (t = e[l]);
    }
    t !== null && (t.selected = !0);
  }
}
function Ai(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(k(91));
  return ee({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function Fa(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(k(92));
      if (Vn(n)) {
        if (1 < n.length) throw Error(k(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = { initialValue: jt(n) };
}
function Su(e, t) {
  var n = jt(t.value), r = jt(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function Aa(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function ku(e) {
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
  return e == null || e === "http://www.w3.org/1999/xhtml" ? ku(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var Nr, Eu = function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, l) {
    MSApp.execUnsafeLocalFunction(function() {
      return e(t, n, r, l);
    });
  } : e;
}(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
  else {
    for (Nr = Nr || document.createElement("div"), Nr.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = Nr.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
    for (; t.firstChild; ) e.appendChild(t.firstChild);
  }
});
function nr(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var Qn = {
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
Object.keys(Qn).forEach(function(e) {
  gf.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), Qn[t] = Qn[e];
  });
});
function _u(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || Qn.hasOwnProperty(e) && Qn[e] ? ("" + t).trim() : t + "px";
}
function Cu(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, l = _u(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, l) : e[n] = l;
  }
}
var vf = ee({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
function Ui(e, t) {
  if (t) {
    if (vf[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(k(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(k(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(k(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(k(62));
  }
}
function Bi(e, t) {
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
var Wi = null;
function Fo(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var Vi = null, dn = null, fn = null;
function Oa(e) {
  if (e = kr(e)) {
    if (typeof Vi != "function") throw Error(k(280));
    var t = e.stateNode;
    t && (t = Il(t), Vi(e.stateNode, e.type, t));
  }
}
function ju(e) {
  dn ? fn ? fn.push(e) : fn = [e] : dn = e;
}
function Pu() {
  if (dn) {
    var e = dn, t = fn;
    if (fn = dn = null, Oa(e), t) for (e = 0; e < t.length; e++) Oa(t[e]);
  }
}
function zu(e, t) {
  return e(t);
}
function Nu() {
}
var ri = !1;
function Tu(e, t, n) {
  if (ri) return e(t, n);
  ri = !0;
  try {
    return zu(e, t, n);
  } finally {
    ri = !1, (dn !== null || fn !== null) && (Nu(), Pu());
  }
}
function rr(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = Il(n);
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
var bi = !1;
if (ot) try {
  var Mn = {};
  Object.defineProperty(Mn, "passive", { get: function() {
    bi = !0;
  } }), window.addEventListener("test", Mn, Mn), window.removeEventListener("test", Mn, Mn);
} catch {
  bi = !1;
}
function yf(e, t, n, r, l, i, o, a, s) {
  var u = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, u);
  } catch (f) {
    this.onError(f);
  }
}
var Yn = !1, sl = null, ul = !1, Hi = null, wf = { onError: function(e) {
  Yn = !0, sl = e;
} };
function xf(e, t, n, r, l, i, o, a, s) {
  Yn = !1, sl = null, yf.apply(wf, arguments);
}
function Sf(e, t, n, r, l, i, o, a, s) {
  if (xf.apply(this, arguments), Yn) {
    if (Yn) {
      var u = sl;
      Yn = !1, sl = null;
    } else throw Error(k(198));
    ul || (ul = !0, Hi = u);
  }
}
function Qt(e) {
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
function Du(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function Ua(e) {
  if (Qt(e) !== e) throw Error(k(188));
}
function kf(e) {
  var t = e.alternate;
  if (!t) {
    if (t = Qt(e), t === null) throw Error(k(188));
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
        if (i === n) return Ua(l), e;
        if (i === r) return Ua(l), t;
        i = i.sibling;
      }
      throw Error(k(188));
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
        if (!o) throw Error(k(189));
      }
    }
    if (n.alternate !== r) throw Error(k(190));
  }
  if (n.tag !== 3) throw Error(k(188));
  return n.stateNode.current === n ? e : t;
}
function Ru(e) {
  return e = kf(e), e !== null ? Lu(e) : null;
}
function Lu(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = Lu(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var Mu = Re.unstable_scheduleCallback, Ba = Re.unstable_cancelCallback, Ef = Re.unstable_shouldYield, _f = Re.unstable_requestPaint, ne = Re.unstable_now, Cf = Re.unstable_getCurrentPriorityLevel, Ao = Re.unstable_ImmediatePriority, Iu = Re.unstable_UserBlockingPriority, cl = Re.unstable_NormalPriority, jf = Re.unstable_LowPriority, $u = Re.unstable_IdlePriority, Dl = null, Je = null;
function Pf(e) {
  if (Je && typeof Je.onCommitFiberRoot == "function") try {
    Je.onCommitFiberRoot(Dl, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var He = Math.clz32 ? Math.clz32 : Tf, zf = Math.log, Nf = Math.LN2;
function Tf(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (zf(e) / Nf | 0) | 0;
}
var Tr = 64, Dr = 4194304;
function bn(e) {
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
function dl(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0, l = e.suspendedLanes, i = e.pingedLanes, o = n & 268435455;
  if (o !== 0) {
    var a = o & ~l;
    a !== 0 ? r = bn(a) : (i &= o, i !== 0 && (r = bn(i)));
  } else o = n & ~l, o !== 0 ? r = bn(o) : i !== 0 && (r = bn(i));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & l) && (l = r & -r, i = t & -t, l >= i || l === 16 && (i & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - He(t), l = 1 << n, r |= e[n], t &= ~l;
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
function Rf(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, i = e.pendingLanes; 0 < i; ) {
    var o = 31 - He(i), a = 1 << o, s = l[o];
    s === -1 ? (!(a & n) || a & r) && (l[o] = Df(a, t)) : s <= t && (e.expiredLanes |= a), i &= ~a;
  }
}
function Qi(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function Fu() {
  var e = Tr;
  return Tr <<= 1, !(Tr & 4194240) && (Tr = 64), e;
}
function li(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function xr(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - He(t), e[t] = n;
}
function Lf(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var l = 31 - He(n), i = 1 << l;
    t[l] = 0, r[l] = -1, e[l] = -1, n &= ~i;
  }
}
function Oo(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
    var r = 31 - He(n), l = 1 << r;
    l & t | e[r] & t && (e[r] |= t), n &= ~l;
  }
}
var H = 0;
function Au(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var Ou, Uo, Uu, Bu, Wu, Yi = !1, Rr = [], yt = null, wt = null, xt = null, lr = /* @__PURE__ */ new Map(), ir = /* @__PURE__ */ new Map(), ht = [], Mf = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function Wa(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      yt = null;
      break;
    case "dragenter":
    case "dragleave":
      wt = null;
      break;
    case "mouseover":
    case "mouseout":
      xt = null;
      break;
    case "pointerover":
    case "pointerout":
      lr.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      ir.delete(t.pointerId);
  }
}
function In(e, t, n, r, l, i) {
  return e === null || e.nativeEvent !== i ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: i, targetContainers: [l] }, t !== null && (t = kr(t), t !== null && Uo(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, l !== null && t.indexOf(l) === -1 && t.push(l), e);
}
function If(e, t, n, r, l) {
  switch (t) {
    case "focusin":
      return yt = In(yt, e, t, n, r, l), !0;
    case "dragenter":
      return wt = In(wt, e, t, n, r, l), !0;
    case "mouseover":
      return xt = In(xt, e, t, n, r, l), !0;
    case "pointerover":
      var i = l.pointerId;
      return lr.set(i, In(lr.get(i) || null, e, t, n, r, l)), !0;
    case "gotpointercapture":
      return i = l.pointerId, ir.set(i, In(ir.get(i) || null, e, t, n, r, l)), !0;
  }
  return !1;
}
function Vu(e) {
  var t = It(e.target);
  if (t !== null) {
    var n = Qt(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = Du(n), t !== null) {
          e.blockedOn = t, Wu(e.priority, function() {
            Uu(n);
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
function Gr(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Xi(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      Wi = r, n.target.dispatchEvent(r), Wi = null;
    } else return t = kr(n), t !== null && Uo(t), e.blockedOn = n, !1;
    t.shift();
  }
  return !0;
}
function Va(e, t, n) {
  Gr(e) && n.delete(t);
}
function $f() {
  Yi = !1, yt !== null && Gr(yt) && (yt = null), wt !== null && Gr(wt) && (wt = null), xt !== null && Gr(xt) && (xt = null), lr.forEach(Va), ir.forEach(Va);
}
function $n(e, t) {
  e.blockedOn === t && (e.blockedOn = null, Yi || (Yi = !0, Re.unstable_scheduleCallback(Re.unstable_NormalPriority, $f)));
}
function or(e) {
  function t(l) {
    return $n(l, e);
  }
  if (0 < Rr.length) {
    $n(Rr[0], e);
    for (var n = 1; n < Rr.length; n++) {
      var r = Rr[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (yt !== null && $n(yt, e), wt !== null && $n(wt, e), xt !== null && $n(xt, e), lr.forEach(t), ir.forEach(t), n = 0; n < ht.length; n++) r = ht[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < ht.length && (n = ht[0], n.blockedOn === null); ) Vu(n), n.blockedOn === null && ht.shift();
}
var pn = ct.ReactCurrentBatchConfig, fl = !0;
function Ff(e, t, n, r) {
  var l = H, i = pn.transition;
  pn.transition = null;
  try {
    H = 1, Bo(e, t, n, r);
  } finally {
    H = l, pn.transition = i;
  }
}
function Af(e, t, n, r) {
  var l = H, i = pn.transition;
  pn.transition = null;
  try {
    H = 4, Bo(e, t, n, r);
  } finally {
    H = l, pn.transition = i;
  }
}
function Bo(e, t, n, r) {
  if (fl) {
    var l = Xi(e, t, n, r);
    if (l === null) hi(e, t, r, pl, n), Wa(e, r);
    else if (If(l, e, t, n, r)) r.stopPropagation();
    else if (Wa(e, r), t & 4 && -1 < Mf.indexOf(e)) {
      for (; l !== null; ) {
        var i = kr(l);
        if (i !== null && Ou(i), i = Xi(e, t, n, r), i === null && hi(e, t, r, pl, n), i === l) break;
        l = i;
      }
      l !== null && r.stopPropagation();
    } else hi(e, t, r, null, n);
  }
}
var pl = null;
function Xi(e, t, n, r) {
  if (pl = null, e = Fo(r), e = It(e), e !== null) if (t = Qt(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = Du(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return pl = e, null;
}
function bu(e) {
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
      switch (Cf()) {
        case Ao:
          return 1;
        case Iu:
          return 4;
        case cl:
        case jf:
          return 16;
        case $u:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var gt = null, Wo = null, Zr = null;
function Hu() {
  if (Zr) return Zr;
  var e, t = Wo, n = t.length, r, l = "value" in gt ? gt.value : gt.textContent, i = l.length;
  for (e = 0; e < n && t[e] === l[e]; e++) ;
  var o = n - e;
  for (r = 1; r <= o && t[n - r] === l[i - r]; r++) ;
  return Zr = l.slice(e, 1 < r ? 1 - r : void 0);
}
function Jr(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function Lr() {
  return !0;
}
function ba() {
  return !1;
}
function Me(e) {
  function t(n, r, l, i, o) {
    this._reactName = n, this._targetInst = l, this.type = r, this.nativeEvent = i, this.target = o, this.currentTarget = null;
    for (var a in e) e.hasOwnProperty(a) && (n = e[a], this[a] = n ? n(i) : i[a]);
    return this.isDefaultPrevented = (i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1) ? Lr : ba, this.isPropagationStopped = ba, this;
  }
  return ee(t.prototype, { preventDefault: function() {
    this.defaultPrevented = !0;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = Lr);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = Lr);
  }, persist: function() {
  }, isPersistent: Lr }), t;
}
var jn = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, Vo = Me(jn), Sr = ee({}, jn, { view: 0, detail: 0 }), Of = Me(Sr), ii, oi, Fn, Rl = ee({}, Sr, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: bo, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== Fn && (Fn && e.type === "mousemove" ? (ii = e.screenX - Fn.screenX, oi = e.screenY - Fn.screenY) : oi = ii = 0, Fn = e), ii);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : oi;
} }), Ha = Me(Rl), Uf = ee({}, Rl, { dataTransfer: 0 }), Bf = Me(Uf), Wf = ee({}, Sr, { relatedTarget: 0 }), ai = Me(Wf), Vf = ee({}, jn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), bf = Me(Vf), Hf = ee({}, jn, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), Qf = Me(Hf), Yf = ee({}, jn, { data: 0 }), Qa = Me(Yf), Xf = {
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
}, Kf = {
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
}, Gf = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function Zf(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = Gf[e]) ? !!t[e] : !1;
}
function bo() {
  return Zf;
}
var Jf = ee({}, Sr, { key: function(e) {
  if (e.key) {
    var t = Xf[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = Jr(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Kf[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: bo, charCode: function(e) {
  return e.type === "keypress" ? Jr(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? Jr(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), qf = Me(Jf), ep = ee({}, Rl, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Ya = Me(ep), tp = ee({}, Sr, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: bo }), np = Me(tp), rp = ee({}, jn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), lp = Me(rp), ip = ee({}, Rl, {
  deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  },
  deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), op = Me(ip), ap = [9, 13, 27, 32], Ho = ot && "CompositionEvent" in window, Xn = null;
ot && "documentMode" in document && (Xn = document.documentMode);
var sp = ot && "TextEvent" in window && !Xn, Qu = ot && (!Ho || Xn && 8 < Xn && 11 >= Xn), Xa = " ", Ka = !1;
function Yu(e, t) {
  switch (e) {
    case "keyup":
      return ap.indexOf(t.keyCode) !== -1;
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
function Xu(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var qt = !1;
function up(e, t) {
  switch (e) {
    case "compositionend":
      return Xu(t);
    case "keypress":
      return t.which !== 32 ? null : (Ka = !0, Xa);
    case "textInput":
      return e = t.data, e === Xa && Ka ? null : e;
    default:
      return null;
  }
}
function cp(e, t) {
  if (qt) return e === "compositionend" || !Ho && Yu(e, t) ? (e = Hu(), Zr = Wo = gt = null, qt = !1, e) : null;
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
      return Qu && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var dp = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
function Ga(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!dp[e.type] : t === "textarea";
}
function Ku(e, t, n, r) {
  ju(r), t = hl(t, "onChange"), 0 < t.length && (n = new Vo("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var Kn = null, ar = null;
function fp(e) {
  oc(e, 0);
}
function Ll(e) {
  var t = nn(e);
  if (wu(t)) return e;
}
function pp(e, t) {
  if (e === "change") return t;
}
var Gu = !1;
if (ot) {
  var si;
  if (ot) {
    var ui = "oninput" in document;
    if (!ui) {
      var Za = document.createElement("div");
      Za.setAttribute("oninput", "return;"), ui = typeof Za.oninput == "function";
    }
    si = ui;
  } else si = !1;
  Gu = si && (!document.documentMode || 9 < document.documentMode);
}
function Ja() {
  Kn && (Kn.detachEvent("onpropertychange", Zu), ar = Kn = null);
}
function Zu(e) {
  if (e.propertyName === "value" && Ll(ar)) {
    var t = [];
    Ku(t, ar, e, Fo(e)), Tu(fp, t);
  }
}
function hp(e, t, n) {
  e === "focusin" ? (Ja(), Kn = t, ar = n, Kn.attachEvent("onpropertychange", Zu)) : e === "focusout" && Ja();
}
function mp(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return Ll(ar);
}
function gp(e, t) {
  if (e === "click") return Ll(t);
}
function vp(e, t) {
  if (e === "input" || e === "change") return Ll(t);
}
function yp(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Ye = typeof Object.is == "function" ? Object.is : yp;
function sr(e, t) {
  if (Ye(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var l = n[r];
    if (!Ti.call(t, l) || !Ye(e[l], t[l])) return !1;
  }
  return !0;
}
function qa(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function es(e, t) {
  var n = qa(e);
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
    n = qa(n);
  }
}
function Ju(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Ju(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function qu() {
  for (var e = window, t = al(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = al(e.document);
  }
  return t;
}
function Qo(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
}
function wp(e) {
  var t = qu(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && Ju(n.ownerDocument.documentElement, n)) {
    if (r !== null && Qo(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
      else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var l = n.textContent.length, i = Math.min(r.start, l);
        r = r.end === void 0 ? i : Math.min(r.end, l), !e.extend && i > r && (l = r, r = i, i = l), l = es(n, i);
        var o = es(
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
var xp = ot && "documentMode" in document && 11 >= document.documentMode, en = null, Ki = null, Gn = null, Gi = !1;
function ts(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Gi || en == null || en !== al(r) || (r = en, "selectionStart" in r && Qo(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), Gn && sr(Gn, r) || (Gn = r, r = hl(Ki, "onSelect"), 0 < r.length && (t = new Vo("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = en)));
}
function Mr(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var tn = { animationend: Mr("Animation", "AnimationEnd"), animationiteration: Mr("Animation", "AnimationIteration"), animationstart: Mr("Animation", "AnimationStart"), transitionend: Mr("Transition", "TransitionEnd") }, ci = {}, ec = {};
ot && (ec = document.createElement("div").style, "AnimationEvent" in window || (delete tn.animationend.animation, delete tn.animationiteration.animation, delete tn.animationstart.animation), "TransitionEvent" in window || delete tn.transitionend.transition);
function Ml(e) {
  if (ci[e]) return ci[e];
  if (!tn[e]) return e;
  var t = tn[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in ec) return ci[e] = t[n];
  return e;
}
var tc = Ml("animationend"), nc = Ml("animationiteration"), rc = Ml("animationstart"), lc = Ml("transitionend"), ic = /* @__PURE__ */ new Map(), ns = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function zt(e, t) {
  ic.set(e, t), Ht(t, [e]);
}
for (var di = 0; di < ns.length; di++) {
  var fi = ns[di], Sp = fi.toLowerCase(), kp = fi[0].toUpperCase() + fi.slice(1);
  zt(Sp, "on" + kp);
}
zt(tc, "onAnimationEnd");
zt(nc, "onAnimationIteration");
zt(rc, "onAnimationStart");
zt("dblclick", "onDoubleClick");
zt("focusin", "onFocus");
zt("focusout", "onBlur");
zt(lc, "onTransitionEnd");
vn("onMouseEnter", ["mouseout", "mouseover"]);
vn("onMouseLeave", ["mouseout", "mouseover"]);
vn("onPointerEnter", ["pointerout", "pointerover"]);
vn("onPointerLeave", ["pointerout", "pointerover"]);
Ht("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
Ht("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
Ht("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Ht("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
Ht("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
Ht("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var Hn = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Ep = new Set("cancel close invalid load scroll toggle".split(" ").concat(Hn));
function rs(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, Sf(r, t, void 0, e), e.currentTarget = null;
}
function oc(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n], l = r.event;
    r = r.listeners;
    e: {
      var i = void 0;
      if (t) for (var o = r.length - 1; 0 <= o; o--) {
        var a = r[o], s = a.instance, u = a.currentTarget;
        if (a = a.listener, s !== i && l.isPropagationStopped()) break e;
        rs(l, a, u), i = s;
      }
      else for (o = 0; o < r.length; o++) {
        if (a = r[o], s = a.instance, u = a.currentTarget, a = a.listener, s !== i && l.isPropagationStopped()) break e;
        rs(l, a, u), i = s;
      }
    }
  }
  if (ul) throw e = Hi, ul = !1, Hi = null, e;
}
function X(e, t) {
  var n = t[to];
  n === void 0 && (n = t[to] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (ac(t, e, 2, !1), n.add(r));
}
function pi(e, t, n) {
  var r = 0;
  t && (r |= 4), ac(n, e, r, t);
}
var Ir = "_reactListening" + Math.random().toString(36).slice(2);
function ur(e) {
  if (!e[Ir]) {
    e[Ir] = !0, hu.forEach(function(n) {
      n !== "selectionchange" && (Ep.has(n) || pi(n, !1, e), pi(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Ir] || (t[Ir] = !0, pi("selectionchange", !1, t));
  }
}
function ac(e, t, n, r) {
  switch (bu(t)) {
    case 1:
      var l = Ff;
      break;
    case 4:
      l = Af;
      break;
    default:
      l = Bo;
  }
  n = l.bind(null, t, n, e), l = void 0, !bi || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (l = !0), r ? l !== void 0 ? e.addEventListener(t, n, { capture: !0, passive: l }) : e.addEventListener(t, n, !0) : l !== void 0 ? e.addEventListener(t, n, { passive: l }) : e.addEventListener(t, n, !1);
}
function hi(e, t, n, r, l) {
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
        if (o = It(a), o === null) return;
        if (s = o.tag, s === 5 || s === 6) {
          r = i = o;
          continue e;
        }
        a = a.parentNode;
      }
    }
    r = r.return;
  }
  Tu(function() {
    var u = i, f = Fo(n), p = [];
    e: {
      var c = ic.get(e);
      if (c !== void 0) {
        var v = Vo, y = e;
        switch (e) {
          case "keypress":
            if (Jr(n) === 0) break e;
          case "keydown":
          case "keyup":
            v = qf;
            break;
          case "focusin":
            y = "focus", v = ai;
            break;
          case "focusout":
            y = "blur", v = ai;
            break;
          case "beforeblur":
          case "afterblur":
            v = ai;
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
            v = Ha;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            v = Bf;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            v = np;
            break;
          case tc:
          case nc:
          case rc:
            v = bf;
            break;
          case lc:
            v = lp;
            break;
          case "scroll":
            v = Of;
            break;
          case "wheel":
            v = op;
            break;
          case "copy":
          case "cut":
          case "paste":
            v = Qf;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            v = Ya;
        }
        var x = (t & 4) !== 0, j = !x && e === "scroll", m = x ? c !== null ? c + "Capture" : null : c;
        x = [];
        for (var h = u, g; h !== null; ) {
          g = h;
          var w = g.stateNode;
          if (g.tag === 5 && w !== null && (g = w, m !== null && (w = rr(h, m), w != null && x.push(cr(h, w, g)))), j) break;
          h = h.return;
        }
        0 < x.length && (c = new v(c, y, null, n, f), p.push({ event: c, listeners: x }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (c = e === "mouseover" || e === "pointerover", v = e === "mouseout" || e === "pointerout", c && n !== Wi && (y = n.relatedTarget || n.fromElement) && (It(y) || y[at])) break e;
        if ((v || c) && (c = f.window === f ? f : (c = f.ownerDocument) ? c.defaultView || c.parentWindow : window, v ? (y = n.relatedTarget || n.toElement, v = u, y = y ? It(y) : null, y !== null && (j = Qt(y), y !== j || y.tag !== 5 && y.tag !== 6) && (y = null)) : (v = null, y = u), v !== y)) {
          if (x = Ha, w = "onMouseLeave", m = "onMouseEnter", h = "mouse", (e === "pointerout" || e === "pointerover") && (x = Ya, w = "onPointerLeave", m = "onPointerEnter", h = "pointer"), j = v == null ? c : nn(v), g = y == null ? c : nn(y), c = new x(w, h + "leave", v, n, f), c.target = j, c.relatedTarget = g, w = null, It(f) === u && (x = new x(m, h + "enter", y, n, f), x.target = g, x.relatedTarget = j, w = x), j = w, v && y) t: {
            for (x = v, m = y, h = 0, g = x; g; g = Kt(g)) h++;
            for (g = 0, w = m; w; w = Kt(w)) g++;
            for (; 0 < h - g; ) x = Kt(x), h--;
            for (; 0 < g - h; ) m = Kt(m), g--;
            for (; h--; ) {
              if (x === m || m !== null && x === m.alternate) break t;
              x = Kt(x), m = Kt(m);
            }
            x = null;
          }
          else x = null;
          v !== null && ls(p, c, v, x, !1), y !== null && j !== null && ls(p, j, y, x, !0);
        }
      }
      e: {
        if (c = u ? nn(u) : window, v = c.nodeName && c.nodeName.toLowerCase(), v === "select" || v === "input" && c.type === "file") var C = pp;
        else if (Ga(c)) if (Gu) C = vp;
        else {
          C = mp;
          var T = hp;
        }
        else (v = c.nodeName) && v.toLowerCase() === "input" && (c.type === "checkbox" || c.type === "radio") && (C = gp);
        if (C && (C = C(e, u))) {
          Ku(p, C, n, f);
          break e;
        }
        T && T(e, c, u), e === "focusout" && (T = c._wrapperState) && T.controlled && c.type === "number" && Fi(c, "number", c.value);
      }
      switch (T = u ? nn(u) : window, e) {
        case "focusin":
          (Ga(T) || T.contentEditable === "true") && (en = T, Ki = u, Gn = null);
          break;
        case "focusout":
          Gn = Ki = en = null;
          break;
        case "mousedown":
          Gi = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Gi = !1, ts(p, n, f);
          break;
        case "selectionchange":
          if (xp) break;
        case "keydown":
        case "keyup":
          ts(p, n, f);
      }
      var P;
      if (Ho) e: {
        switch (e) {
          case "compositionstart":
            var N = "onCompositionStart";
            break e;
          case "compositionend":
            N = "onCompositionEnd";
            break e;
          case "compositionupdate":
            N = "onCompositionUpdate";
            break e;
        }
        N = void 0;
      }
      else qt ? Yu(e, n) && (N = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (N = "onCompositionStart");
      N && (Qu && n.locale !== "ko" && (qt || N !== "onCompositionStart" ? N === "onCompositionEnd" && qt && (P = Hu()) : (gt = f, Wo = "value" in gt ? gt.value : gt.textContent, qt = !0)), T = hl(u, N), 0 < T.length && (N = new Qa(N, e, null, n, f), p.push({ event: N, listeners: T }), P ? N.data = P : (P = Xu(n), P !== null && (N.data = P)))), (P = sp ? up(e, n) : cp(e, n)) && (u = hl(u, "onBeforeInput"), 0 < u.length && (f = new Qa("onBeforeInput", "beforeinput", null, n, f), p.push({ event: f, listeners: u }), f.data = P));
    }
    oc(p, t);
  });
}
function cr(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function hl(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var l = e, i = l.stateNode;
    l.tag === 5 && i !== null && (l = i, i = rr(e, n), i != null && r.unshift(cr(e, i, l)), i = rr(e, t), i != null && r.push(cr(e, i, l))), e = e.return;
  }
  return r;
}
function Kt(e) {
  if (e === null) return null;
  do
    e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function ls(e, t, n, r, l) {
  for (var i = t._reactName, o = []; n !== null && n !== r; ) {
    var a = n, s = a.alternate, u = a.stateNode;
    if (s !== null && s === r) break;
    a.tag === 5 && u !== null && (a = u, l ? (s = rr(n, i), s != null && o.unshift(cr(n, s, a))) : l || (s = rr(n, i), s != null && o.push(cr(n, s, a)))), n = n.return;
  }
  o.length !== 0 && e.push({ event: t, listeners: o });
}
var _p = /\r\n?/g, Cp = /\u0000|\uFFFD/g;
function is(e) {
  return (typeof e == "string" ? e : "" + e).replace(_p, `
`).replace(Cp, "");
}
function $r(e, t, n) {
  if (t = is(t), is(e) !== t && n) throw Error(k(425));
}
function ml() {
}
var Zi = null, Ji = null;
function qi(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var eo = typeof setTimeout == "function" ? setTimeout : void 0, jp = typeof clearTimeout == "function" ? clearTimeout : void 0, os = typeof Promise == "function" ? Promise : void 0, Pp = typeof queueMicrotask == "function" ? queueMicrotask : typeof os < "u" ? function(e) {
  return os.resolve(null).then(e).catch(zp);
} : eo;
function zp(e) {
  setTimeout(function() {
    throw e;
  });
}
function mi(e, t) {
  var n = t, r = 0;
  do {
    var l = n.nextSibling;
    if (e.removeChild(n), l && l.nodeType === 8) if (n = l.data, n === "/$") {
      if (r === 0) {
        e.removeChild(l), or(t);
        return;
      }
      r--;
    } else n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = l;
  } while (n);
  or(t);
}
function St(e) {
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
function as(e) {
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
var Pn = Math.random().toString(36).slice(2), Ze = "__reactFiber$" + Pn, dr = "__reactProps$" + Pn, at = "__reactContainer$" + Pn, to = "__reactEvents$" + Pn, Np = "__reactListeners$" + Pn, Tp = "__reactHandles$" + Pn;
function It(e) {
  var t = e[Ze];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[at] || n[Ze]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = as(e); e !== null; ) {
        if (n = e[Ze]) return n;
        e = as(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function kr(e) {
  return e = e[Ze] || e[at], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function nn(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(k(33));
}
function Il(e) {
  return e[dr] || null;
}
var no = [], rn = -1;
function Nt(e) {
  return { current: e };
}
function K(e) {
  0 > rn || (e.current = no[rn], no[rn] = null, rn--);
}
function Y(e, t) {
  rn++, no[rn] = e.current, e.current = t;
}
var Pt = {}, ve = Nt(Pt), Ce = Nt(!1), Ut = Pt;
function yn(e, t) {
  var n = e.type.contextTypes;
  if (!n) return Pt;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var l = {}, i;
  for (i in n) l[i] = t[i];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = l), l;
}
function je(e) {
  return e = e.childContextTypes, e != null;
}
function gl() {
  K(Ce), K(ve);
}
function ss(e, t, n) {
  if (ve.current !== Pt) throw Error(k(168));
  Y(ve, t), Y(Ce, n);
}
function sc(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var l in r) if (!(l in t)) throw Error(k(108, hf(e) || "Unknown", l));
  return ee({}, n, r);
}
function vl(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Pt, Ut = ve.current, Y(ve, e), Y(Ce, Ce.current), !0;
}
function us(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(k(169));
  n ? (e = sc(e, t, Ut), r.__reactInternalMemoizedMergedChildContext = e, K(Ce), K(ve), Y(ve, e)) : K(Ce), Y(Ce, n);
}
var nt = null, $l = !1, gi = !1;
function uc(e) {
  nt === null ? nt = [e] : nt.push(e);
}
function Dp(e) {
  $l = !0, uc(e);
}
function Tt() {
  if (!gi && nt !== null) {
    gi = !0;
    var e = 0, t = H;
    try {
      var n = nt;
      for (H = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(!0);
        while (r !== null);
      }
      nt = null, $l = !1;
    } catch (l) {
      throw nt !== null && (nt = nt.slice(e + 1)), Mu(Ao, Tt), l;
    } finally {
      H = t, gi = !1;
    }
  }
  return null;
}
var ln = [], on = 0, yl = null, wl = 0, Ie = [], $e = 0, Bt = null, rt = 1, lt = "";
function Lt(e, t) {
  ln[on++] = wl, ln[on++] = yl, yl = e, wl = t;
}
function cc(e, t, n) {
  Ie[$e++] = rt, Ie[$e++] = lt, Ie[$e++] = Bt, Bt = e;
  var r = rt;
  e = lt;
  var l = 32 - He(r) - 1;
  r &= ~(1 << l), n += 1;
  var i = 32 - He(t) + l;
  if (30 < i) {
    var o = l - l % 5;
    i = (r & (1 << o) - 1).toString(32), r >>= o, l -= o, rt = 1 << 32 - He(t) + l | n << l | r, lt = i + e;
  } else rt = 1 << i | n << l | r, lt = e;
}
function Yo(e) {
  e.return !== null && (Lt(e, 1), cc(e, 1, 0));
}
function Xo(e) {
  for (; e === yl; ) yl = ln[--on], ln[on] = null, wl = ln[--on], ln[on] = null;
  for (; e === Bt; ) Bt = Ie[--$e], Ie[$e] = null, lt = Ie[--$e], Ie[$e] = null, rt = Ie[--$e], Ie[$e] = null;
}
var De = null, Te = null, G = !1, be = null;
function dc(e, t) {
  var n = Fe(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function cs(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, De = e, Te = St(t.firstChild), !0) : !1;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, De = e, Te = null, !0) : !1;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = Bt !== null ? { id: rt, overflow: lt } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = Fe(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, De = e, Te = null, !0) : !1;
    default:
      return !1;
  }
}
function ro(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function lo(e) {
  if (G) {
    var t = Te;
    if (t) {
      var n = t;
      if (!cs(e, t)) {
        if (ro(e)) throw Error(k(418));
        t = St(n.nextSibling);
        var r = De;
        t && cs(e, t) ? dc(r, n) : (e.flags = e.flags & -4097 | 2, G = !1, De = e);
      }
    } else {
      if (ro(e)) throw Error(k(418));
      e.flags = e.flags & -4097 | 2, G = !1, De = e;
    }
  }
}
function ds(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  De = e;
}
function Fr(e) {
  if (e !== De) return !1;
  if (!G) return ds(e), G = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !qi(e.type, e.memoizedProps)), t && (t = Te)) {
    if (ro(e)) throw fc(), Error(k(418));
    for (; t; ) dc(e, t), t = St(t.nextSibling);
  }
  if (ds(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(k(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              Te = St(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      Te = null;
    }
  } else Te = De ? St(e.stateNode.nextSibling) : null;
  return !0;
}
function fc() {
  for (var e = Te; e; ) e = St(e.nextSibling);
}
function wn() {
  Te = De = null, G = !1;
}
function Ko(e) {
  be === null ? be = [e] : be.push(e);
}
var Rp = ct.ReactCurrentBatchConfig;
function An(e, t, n) {
  if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
    if (n._owner) {
      if (n = n._owner, n) {
        if (n.tag !== 1) throw Error(k(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(k(147, e));
      var l = r, i = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === i ? t.ref : (t = function(o) {
        var a = l.refs;
        o === null ? delete a[i] : a[i] = o;
      }, t._stringRef = i, t);
    }
    if (typeof e != "string") throw Error(k(284));
    if (!n._owner) throw Error(k(290, e));
  }
  return e;
}
function Ar(e, t) {
  throw e = Object.prototype.toString.call(t), Error(k(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function fs(e) {
  var t = e._init;
  return t(e._payload);
}
function pc(e) {
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
    return m = Ct(m, h), m.index = 0, m.sibling = null, m;
  }
  function i(m, h, g) {
    return m.index = g, e ? (g = m.alternate, g !== null ? (g = g.index, g < h ? (m.flags |= 2, h) : g) : (m.flags |= 2, h)) : (m.flags |= 1048576, h);
  }
  function o(m) {
    return e && m.alternate === null && (m.flags |= 2), m;
  }
  function a(m, h, g, w) {
    return h === null || h.tag !== 6 ? (h = Ei(g, m.mode, w), h.return = m, h) : (h = l(h, g), h.return = m, h);
  }
  function s(m, h, g, w) {
    var C = g.type;
    return C === Jt ? f(m, h, g.props.children, w, g.key) : h !== null && (h.elementType === C || typeof C == "object" && C !== null && C.$$typeof === ft && fs(C) === h.type) ? (w = l(h, g.props), w.ref = An(m, h, g), w.return = m, w) : (w = il(g.type, g.key, g.props, null, m.mode, w), w.ref = An(m, h, g), w.return = m, w);
  }
  function u(m, h, g, w) {
    return h === null || h.tag !== 4 || h.stateNode.containerInfo !== g.containerInfo || h.stateNode.implementation !== g.implementation ? (h = _i(g, m.mode, w), h.return = m, h) : (h = l(h, g.children || []), h.return = m, h);
  }
  function f(m, h, g, w, C) {
    return h === null || h.tag !== 7 ? (h = Ot(g, m.mode, w, C), h.return = m, h) : (h = l(h, g), h.return = m, h);
  }
  function p(m, h, g) {
    if (typeof h == "string" && h !== "" || typeof h == "number") return h = Ei("" + h, m.mode, g), h.return = m, h;
    if (typeof h == "object" && h !== null) {
      switch (h.$$typeof) {
        case Pr:
          return g = il(h.type, h.key, h.props, null, m.mode, g), g.ref = An(m, null, h), g.return = m, g;
        case Zt:
          return h = _i(h, m.mode, g), h.return = m, h;
        case ft:
          var w = h._init;
          return p(m, w(h._payload), g);
      }
      if (Vn(h) || Ln(h)) return h = Ot(h, m.mode, g, null), h.return = m, h;
      Ar(m, h);
    }
    return null;
  }
  function c(m, h, g, w) {
    var C = h !== null ? h.key : null;
    if (typeof g == "string" && g !== "" || typeof g == "number") return C !== null ? null : a(m, h, "" + g, w);
    if (typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case Pr:
          return g.key === C ? s(m, h, g, w) : null;
        case Zt:
          return g.key === C ? u(m, h, g, w) : null;
        case ft:
          return C = g._init, c(
            m,
            h,
            C(g._payload),
            w
          );
      }
      if (Vn(g) || Ln(g)) return C !== null ? null : f(m, h, g, w, null);
      Ar(m, g);
    }
    return null;
  }
  function v(m, h, g, w, C) {
    if (typeof w == "string" && w !== "" || typeof w == "number") return m = m.get(g) || null, a(h, m, "" + w, C);
    if (typeof w == "object" && w !== null) {
      switch (w.$$typeof) {
        case Pr:
          return m = m.get(w.key === null ? g : w.key) || null, s(h, m, w, C);
        case Zt:
          return m = m.get(w.key === null ? g : w.key) || null, u(h, m, w, C);
        case ft:
          var T = w._init;
          return v(m, h, g, T(w._payload), C);
      }
      if (Vn(w) || Ln(w)) return m = m.get(g) || null, f(h, m, w, C, null);
      Ar(h, w);
    }
    return null;
  }
  function y(m, h, g, w) {
    for (var C = null, T = null, P = h, N = h = 0, _ = null; P !== null && N < g.length; N++) {
      P.index > N ? (_ = P, P = null) : _ = P.sibling;
      var z = c(m, P, g[N], w);
      if (z === null) {
        P === null && (P = _);
        break;
      }
      e && P && z.alternate === null && t(m, P), h = i(z, h, N), T === null ? C = z : T.sibling = z, T = z, P = _;
    }
    if (N === g.length) return n(m, P), G && Lt(m, N), C;
    if (P === null) {
      for (; N < g.length; N++) P = p(m, g[N], w), P !== null && (h = i(P, h, N), T === null ? C = P : T.sibling = P, T = P);
      return G && Lt(m, N), C;
    }
    for (P = r(m, P); N < g.length; N++) _ = v(P, m, N, g[N], w), _ !== null && (e && _.alternate !== null && P.delete(_.key === null ? N : _.key), h = i(_, h, N), T === null ? C = _ : T.sibling = _, T = _);
    return e && P.forEach(function(W) {
      return t(m, W);
    }), G && Lt(m, N), C;
  }
  function x(m, h, g, w) {
    var C = Ln(g);
    if (typeof C != "function") throw Error(k(150));
    if (g = C.call(g), g == null) throw Error(k(151));
    for (var T = C = null, P = h, N = h = 0, _ = null, z = g.next(); P !== null && !z.done; N++, z = g.next()) {
      P.index > N ? (_ = P, P = null) : _ = P.sibling;
      var W = c(m, P, z.value, w);
      if (W === null) {
        P === null && (P = _);
        break;
      }
      e && P && W.alternate === null && t(m, P), h = i(W, h, N), T === null ? C = W : T.sibling = W, T = W, P = _;
    }
    if (z.done) return n(
      m,
      P
    ), G && Lt(m, N), C;
    if (P === null) {
      for (; !z.done; N++, z = g.next()) z = p(m, z.value, w), z !== null && (h = i(z, h, N), T === null ? C = z : T.sibling = z, T = z);
      return G && Lt(m, N), C;
    }
    for (P = r(m, P); !z.done; N++, z = g.next()) z = v(P, m, N, z.value, w), z !== null && (e && z.alternate !== null && P.delete(z.key === null ? N : z.key), h = i(z, h, N), T === null ? C = z : T.sibling = z, T = z);
    return e && P.forEach(function(re) {
      return t(m, re);
    }), G && Lt(m, N), C;
  }
  function j(m, h, g, w) {
    if (typeof g == "object" && g !== null && g.type === Jt && g.key === null && (g = g.props.children), typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case Pr:
          e: {
            for (var C = g.key, T = h; T !== null; ) {
              if (T.key === C) {
                if (C = g.type, C === Jt) {
                  if (T.tag === 7) {
                    n(m, T.sibling), h = l(T, g.props.children), h.return = m, m = h;
                    break e;
                  }
                } else if (T.elementType === C || typeof C == "object" && C !== null && C.$$typeof === ft && fs(C) === T.type) {
                  n(m, T.sibling), h = l(T, g.props), h.ref = An(m, T, g), h.return = m, m = h;
                  break e;
                }
                n(m, T);
                break;
              } else t(m, T);
              T = T.sibling;
            }
            g.type === Jt ? (h = Ot(g.props.children, m.mode, w, g.key), h.return = m, m = h) : (w = il(g.type, g.key, g.props, null, m.mode, w), w.ref = An(m, h, g), w.return = m, m = w);
          }
          return o(m);
        case Zt:
          e: {
            for (T = g.key; h !== null; ) {
              if (h.key === T) if (h.tag === 4 && h.stateNode.containerInfo === g.containerInfo && h.stateNode.implementation === g.implementation) {
                n(m, h.sibling), h = l(h, g.children || []), h.return = m, m = h;
                break e;
              } else {
                n(m, h);
                break;
              }
              else t(m, h);
              h = h.sibling;
            }
            h = _i(g, m.mode, w), h.return = m, m = h;
          }
          return o(m);
        case ft:
          return T = g._init, j(m, h, T(g._payload), w);
      }
      if (Vn(g)) return y(m, h, g, w);
      if (Ln(g)) return x(m, h, g, w);
      Ar(m, g);
    }
    return typeof g == "string" && g !== "" || typeof g == "number" ? (g = "" + g, h !== null && h.tag === 6 ? (n(m, h.sibling), h = l(h, g), h.return = m, m = h) : (n(m, h), h = Ei(g, m.mode, w), h.return = m, m = h), o(m)) : n(m, h);
  }
  return j;
}
var xn = pc(!0), hc = pc(!1), xl = Nt(null), Sl = null, an = null, Go = null;
function Zo() {
  Go = an = Sl = null;
}
function Jo(e) {
  var t = xl.current;
  K(xl), e._currentValue = t;
}
function io(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function hn(e, t) {
  Sl = e, Go = an = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (_e = !0), e.firstContext = null);
}
function Oe(e) {
  var t = e._currentValue;
  if (Go !== e) if (e = { context: e, memoizedValue: t, next: null }, an === null) {
    if (Sl === null) throw Error(k(308));
    an = e, Sl.dependencies = { lanes: 0, firstContext: e };
  } else an = an.next = e;
  return t;
}
var $t = null;
function qo(e) {
  $t === null ? $t = [e] : $t.push(e);
}
function mc(e, t, n, r) {
  var l = t.interleaved;
  return l === null ? (n.next = n, qo(t)) : (n.next = l.next, l.next = n), t.interleaved = n, st(e, r);
}
function st(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
  return n.tag === 3 ? n.stateNode : null;
}
var pt = !1;
function ea(e) {
  e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function gc(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function it(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function kt(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, B & 2) {
    var l = r.pending;
    return l === null ? t.next = t : (t.next = l.next, l.next = t), r.pending = t, st(e, n);
  }
  return l = r.interleaved, l === null ? (t.next = t, qo(r)) : (t.next = l.next, l.next = t), r.interleaved = t, st(e, n);
}
function qr(e, t, n) {
  if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, Oo(e, n);
  }
}
function ps(e, t) {
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
function kl(e, t, n, r) {
  var l = e.updateQueue;
  pt = !1;
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
              pt = !0;
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
    Vt |= o, e.lanes = o, e.memoizedState = p;
  }
}
function hs(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], l = r.callback;
    if (l !== null) {
      if (r.callback = null, r = n, typeof l != "function") throw Error(k(191, l));
      l.call(r);
    }
  }
}
var Er = {}, qe = Nt(Er), fr = Nt(Er), pr = Nt(Er);
function Ft(e) {
  if (e === Er) throw Error(k(174));
  return e;
}
function ta(e, t) {
  switch (Y(pr, t), Y(fr, e), Y(qe, Er), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Oi(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Oi(t, e);
  }
  K(qe), Y(qe, t);
}
function Sn() {
  K(qe), K(fr), K(pr);
}
function vc(e) {
  Ft(pr.current);
  var t = Ft(qe.current), n = Oi(t, e.type);
  t !== n && (Y(fr, e), Y(qe, n));
}
function na(e) {
  fr.current === e && (K(qe), K(fr));
}
var J = Nt(0);
function El(e) {
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
var vi = [];
function ra() {
  for (var e = 0; e < vi.length; e++) vi[e]._workInProgressVersionPrimary = null;
  vi.length = 0;
}
var el = ct.ReactCurrentDispatcher, yi = ct.ReactCurrentBatchConfig, Wt = 0, q = null, ie = null, ae = null, _l = !1, Zn = !1, hr = 0, Lp = 0;
function pe() {
  throw Error(k(321));
}
function la(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!Ye(e[n], t[n])) return !1;
  return !0;
}
function ia(e, t, n, r, l, i) {
  if (Wt = i, q = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, el.current = e === null || e.memoizedState === null ? Fp : Ap, e = n(r, l), Zn) {
    i = 0;
    do {
      if (Zn = !1, hr = 0, 25 <= i) throw Error(k(301));
      i += 1, ae = ie = null, t.updateQueue = null, el.current = Op, e = n(r, l);
    } while (Zn);
  }
  if (el.current = Cl, t = ie !== null && ie.next !== null, Wt = 0, ae = ie = q = null, _l = !1, t) throw Error(k(300));
  return e;
}
function oa() {
  var e = hr !== 0;
  return hr = 0, e;
}
function Ge() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return ae === null ? q.memoizedState = ae = e : ae = ae.next = e, ae;
}
function Ue() {
  if (ie === null) {
    var e = q.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = ie.next;
  var t = ae === null ? q.memoizedState : ae.next;
  if (t !== null) ae = t, ie = e;
  else {
    if (e === null) throw Error(k(310));
    ie = e, e = { memoizedState: ie.memoizedState, baseState: ie.baseState, baseQueue: ie.baseQueue, queue: ie.queue, next: null }, ae === null ? q.memoizedState = ae = e : ae = ae.next = e;
  }
  return ae;
}
function mr(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function wi(e) {
  var t = Ue(), n = t.queue;
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
    var a = o = null, s = null, u = i;
    do {
      var f = u.lane;
      if ((Wt & f) === f) s !== null && (s = s.next = { lane: 0, action: u.action, hasEagerState: u.hasEagerState, eagerState: u.eagerState, next: null }), r = u.hasEagerState ? u.eagerState : e(r, u.action);
      else {
        var p = {
          lane: f,
          action: u.action,
          hasEagerState: u.hasEagerState,
          eagerState: u.eagerState,
          next: null
        };
        s === null ? (a = s = p, o = r) : s = s.next = p, q.lanes |= f, Vt |= f;
      }
      u = u.next;
    } while (u !== null && u !== i);
    s === null ? o = r : s.next = a, Ye(r, t.memoizedState) || (_e = !0), t.memoizedState = r, t.baseState = o, t.baseQueue = s, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    l = e;
    do
      i = l.lane, q.lanes |= i, Vt |= i, l = l.next;
    while (l !== e);
  } else l === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function xi(e) {
  var t = Ue(), n = t.queue;
  if (n === null) throw Error(k(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch, l = n.pending, i = t.memoizedState;
  if (l !== null) {
    n.pending = null;
    var o = l = l.next;
    do
      i = e(i, o.action), o = o.next;
    while (o !== l);
    Ye(i, t.memoizedState) || (_e = !0), t.memoizedState = i, t.baseQueue === null && (t.baseState = i), n.lastRenderedState = i;
  }
  return [i, r];
}
function yc() {
}
function wc(e, t) {
  var n = q, r = Ue(), l = t(), i = !Ye(r.memoizedState, l);
  if (i && (r.memoizedState = l, _e = !0), r = r.queue, aa(kc.bind(null, n, r, e), [e]), r.getSnapshot !== t || i || ae !== null && ae.memoizedState.tag & 1) {
    if (n.flags |= 2048, gr(9, Sc.bind(null, n, r, l, t), void 0, null), se === null) throw Error(k(349));
    Wt & 30 || xc(n, t, l);
  }
  return l;
}
function xc(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = q.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, q.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function Sc(e, t, n, r) {
  t.value = n, t.getSnapshot = r, Ec(t) && _c(e);
}
function kc(e, t, n) {
  return n(function() {
    Ec(t) && _c(e);
  });
}
function Ec(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Ye(e, n);
  } catch {
    return !0;
  }
}
function _c(e) {
  var t = st(e, 1);
  t !== null && Qe(t, e, 1, -1);
}
function ms(e) {
  var t = Ge();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: mr, lastRenderedState: e }, t.queue = e, e = e.dispatch = $p.bind(null, q, e), [t.memoizedState, e];
}
function gr(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = q.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, q.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function Cc() {
  return Ue().memoizedState;
}
function tl(e, t, n, r) {
  var l = Ge();
  q.flags |= e, l.memoizedState = gr(1 | t, n, void 0, r === void 0 ? null : r);
}
function Fl(e, t, n, r) {
  var l = Ue();
  r = r === void 0 ? null : r;
  var i = void 0;
  if (ie !== null) {
    var o = ie.memoizedState;
    if (i = o.destroy, r !== null && la(r, o.deps)) {
      l.memoizedState = gr(t, n, i, r);
      return;
    }
  }
  q.flags |= e, l.memoizedState = gr(1 | t, n, i, r);
}
function gs(e, t) {
  return tl(8390656, 8, e, t);
}
function aa(e, t) {
  return Fl(2048, 8, e, t);
}
function jc(e, t) {
  return Fl(4, 2, e, t);
}
function Pc(e, t) {
  return Fl(4, 4, e, t);
}
function zc(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function Nc(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Fl(4, 4, zc.bind(null, t, e), n);
}
function sa() {
}
function Tc(e, t) {
  var n = Ue();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && la(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function Dc(e, t) {
  var n = Ue();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && la(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function Rc(e, t, n) {
  return Wt & 21 ? (Ye(n, t) || (n = Fu(), q.lanes |= n, Vt |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, _e = !0), e.memoizedState = n);
}
function Mp(e, t) {
  var n = H;
  H = n !== 0 && 4 > n ? n : 4, e(!0);
  var r = yi.transition;
  yi.transition = {};
  try {
    e(!1), t();
  } finally {
    H = n, yi.transition = r;
  }
}
function Lc() {
  return Ue().memoizedState;
}
function Ip(e, t, n) {
  var r = _t(e);
  if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, Mc(e)) Ic(t, n);
  else if (n = mc(e, t, n, r), n !== null) {
    var l = we();
    Qe(n, e, r, l), $c(n, t, r);
  }
}
function $p(e, t, n) {
  var r = _t(e), l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (Mc(e)) Ic(t, l);
  else {
    var i = e.alternate;
    if (e.lanes === 0 && (i === null || i.lanes === 0) && (i = t.lastRenderedReducer, i !== null)) try {
      var o = t.lastRenderedState, a = i(o, n);
      if (l.hasEagerState = !0, l.eagerState = a, Ye(a, o)) {
        var s = t.interleaved;
        s === null ? (l.next = l, qo(t)) : (l.next = s.next, s.next = l), t.interleaved = l;
        return;
      }
    } catch {
    } finally {
    }
    n = mc(e, t, l, r), n !== null && (l = we(), Qe(n, e, r, l), $c(n, t, r));
  }
}
function Mc(e) {
  var t = e.alternate;
  return e === q || t !== null && t === q;
}
function Ic(e, t) {
  Zn = _l = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function $c(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, Oo(e, n);
  }
}
var Cl = { readContext: Oe, useCallback: pe, useContext: pe, useEffect: pe, useImperativeHandle: pe, useInsertionEffect: pe, useLayoutEffect: pe, useMemo: pe, useReducer: pe, useRef: pe, useState: pe, useDebugValue: pe, useDeferredValue: pe, useTransition: pe, useMutableSource: pe, useSyncExternalStore: pe, useId: pe, unstable_isNewReconciler: !1 }, Fp = { readContext: Oe, useCallback: function(e, t) {
  return Ge().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: Oe, useEffect: gs, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, tl(
    4194308,
    4,
    zc.bind(null, t, e),
    n
  );
}, useLayoutEffect: function(e, t) {
  return tl(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return tl(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = Ge();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = Ge();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = Ip.bind(null, q, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = Ge();
  return e = { current: e }, t.memoizedState = e;
}, useState: ms, useDebugValue: sa, useDeferredValue: function(e) {
  return Ge().memoizedState = e;
}, useTransition: function() {
  var e = ms(!1), t = e[0];
  return e = Mp.bind(null, e[1]), Ge().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = q, l = Ge();
  if (G) {
    if (n === void 0) throw Error(k(407));
    n = n();
  } else {
    if (n = t(), se === null) throw Error(k(349));
    Wt & 30 || xc(r, t, n);
  }
  l.memoizedState = n;
  var i = { value: n, getSnapshot: t };
  return l.queue = i, gs(kc.bind(
    null,
    r,
    i,
    e
  ), [e]), r.flags |= 2048, gr(9, Sc.bind(null, r, i, n, t), void 0, null), n;
}, useId: function() {
  var e = Ge(), t = se.identifierPrefix;
  if (G) {
    var n = lt, r = rt;
    n = (r & ~(1 << 32 - He(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = hr++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = Lp++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: !1 }, Ap = {
  readContext: Oe,
  useCallback: Tc,
  useContext: Oe,
  useEffect: aa,
  useImperativeHandle: Nc,
  useInsertionEffect: jc,
  useLayoutEffect: Pc,
  useMemo: Dc,
  useReducer: wi,
  useRef: Cc,
  useState: function() {
    return wi(mr);
  },
  useDebugValue: sa,
  useDeferredValue: function(e) {
    var t = Ue();
    return Rc(t, ie.memoizedState, e);
  },
  useTransition: function() {
    var e = wi(mr)[0], t = Ue().memoizedState;
    return [e, t];
  },
  useMutableSource: yc,
  useSyncExternalStore: wc,
  useId: Lc,
  unstable_isNewReconciler: !1
}, Op = { readContext: Oe, useCallback: Tc, useContext: Oe, useEffect: aa, useImperativeHandle: Nc, useInsertionEffect: jc, useLayoutEffect: Pc, useMemo: Dc, useReducer: xi, useRef: Cc, useState: function() {
  return xi(mr);
}, useDebugValue: sa, useDeferredValue: function(e) {
  var t = Ue();
  return ie === null ? t.memoizedState = e : Rc(t, ie.memoizedState, e);
}, useTransition: function() {
  var e = xi(mr)[0], t = Ue().memoizedState;
  return [e, t];
}, useMutableSource: yc, useSyncExternalStore: wc, useId: Lc, unstable_isNewReconciler: !1 };
function We(e, t) {
  if (e && e.defaultProps) {
    t = ee({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function oo(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : ee({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var Al = { isMounted: function(e) {
  return (e = e._reactInternals) ? Qt(e) === e : !1;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = we(), l = _t(e), i = it(r, l);
  i.payload = t, n != null && (i.callback = n), t = kt(e, i, l), t !== null && (Qe(t, e, l, r), qr(t, e, l));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = we(), l = _t(e), i = it(r, l);
  i.tag = 1, i.payload = t, n != null && (i.callback = n), t = kt(e, i, l), t !== null && (Qe(t, e, l, r), qr(t, e, l));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = we(), r = _t(e), l = it(n, r);
  l.tag = 2, t != null && (l.callback = t), t = kt(e, l, r), t !== null && (Qe(t, e, r, n), qr(t, e, r));
} };
function vs(e, t, n, r, l, i, o) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, i, o) : t.prototype && t.prototype.isPureReactComponent ? !sr(n, r) || !sr(l, i) : !0;
}
function Fc(e, t, n) {
  var r = !1, l = Pt, i = t.contextType;
  return typeof i == "object" && i !== null ? i = Oe(i) : (l = je(t) ? Ut : ve.current, r = t.contextTypes, i = (r = r != null) ? yn(e, l) : Pt), t = new t(n, i), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = Al, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = l, e.__reactInternalMemoizedMaskedChildContext = i), t;
}
function ys(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Al.enqueueReplaceState(t, t.state, null);
}
function ao(e, t, n, r) {
  var l = e.stateNode;
  l.props = n, l.state = e.memoizedState, l.refs = {}, ea(e);
  var i = t.contextType;
  typeof i == "object" && i !== null ? l.context = Oe(i) : (i = je(t) ? Ut : ve.current, l.context = yn(e, i)), l.state = e.memoizedState, i = t.getDerivedStateFromProps, typeof i == "function" && (oo(e, t, i, n), l.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof l.getSnapshotBeforeUpdate == "function" || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (t = l.state, typeof l.componentWillMount == "function" && l.componentWillMount(), typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount(), t !== l.state && Al.enqueueReplaceState(l, l.state, null), kl(e, n, l, r), l.state = e.memoizedState), typeof l.componentDidMount == "function" && (e.flags |= 4194308);
}
function kn(e, t) {
  try {
    var n = "", r = t;
    do
      n += pf(r), r = r.return;
    while (r);
    var l = n;
  } catch (i) {
    l = `
Error generating stack: ` + i.message + `
` + i.stack;
  }
  return { value: e, source: t, stack: l, digest: null };
}
function Si(e, t, n) {
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
var Up = typeof WeakMap == "function" ? WeakMap : Map;
function Ac(e, t, n) {
  n = it(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    Pl || (Pl = !0, wo = r), so(e, t);
  }, n;
}
function Oc(e, t, n) {
  n = it(-1, n), n.tag = 3;
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
    so(e, t), typeof r != "function" && (Et === null ? Et = /* @__PURE__ */ new Set([this]) : Et.add(this));
    var o = t.stack;
    this.componentDidCatch(t.value, { componentStack: o !== null ? o : "" });
  }), n;
}
function ws(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new Up();
    var l = /* @__PURE__ */ new Set();
    r.set(t, l);
  } else l = r.get(t), l === void 0 && (l = /* @__PURE__ */ new Set(), r.set(t, l));
  l.has(n) || (l.add(n), e = eh.bind(null, e, t, n), t.then(e, e));
}
function xs(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function Ss(e, t, n, r, l) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = l, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = it(-1, 1), t.tag = 2, kt(n, t, 1))), n.lanes |= 1), e);
}
var Bp = ct.ReactCurrentOwner, _e = !1;
function ye(e, t, n, r) {
  t.child = e === null ? hc(t, null, n, r) : xn(t, e.child, n, r);
}
function ks(e, t, n, r, l) {
  n = n.render;
  var i = t.ref;
  return hn(t, l), r = ia(e, t, n, r, i, l), n = oa(), e !== null && !_e ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, ut(e, t, l)) : (G && n && Yo(t), t.flags |= 1, ye(e, t, r, l), t.child);
}
function Es(e, t, n, r, l) {
  if (e === null) {
    var i = n.type;
    return typeof i == "function" && !ga(i) && i.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = i, Uc(e, t, i, r, l)) : (e = il(n.type, null, r, t, t.mode, l), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (i = e.child, !(e.lanes & l)) {
    var o = i.memoizedProps;
    if (n = n.compare, n = n !== null ? n : sr, n(o, r) && e.ref === t.ref) return ut(e, t, l);
  }
  return t.flags |= 1, e = Ct(i, r), e.ref = t.ref, e.return = t, t.child = e;
}
function Uc(e, t, n, r, l) {
  if (e !== null) {
    var i = e.memoizedProps;
    if (sr(i, r) && e.ref === t.ref) if (_e = !1, t.pendingProps = r = i, (e.lanes & l) !== 0) e.flags & 131072 && (_e = !0);
    else return t.lanes = e.lanes, ut(e, t, l);
  }
  return uo(e, t, n, r, l);
}
function Bc(e, t, n) {
  var r = t.pendingProps, l = r.children, i = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Y(un, Ne), Ne |= n;
  else {
    if (!(n & 1073741824)) return e = i !== null ? i.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, Y(un, Ne), Ne |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = i !== null ? i.baseLanes : n, Y(un, Ne), Ne |= r;
  }
  else i !== null ? (r = i.baseLanes | n, t.memoizedState = null) : r = n, Y(un, Ne), Ne |= r;
  return ye(e, t, l, n), t.child;
}
function Wc(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function uo(e, t, n, r, l) {
  var i = je(n) ? Ut : ve.current;
  return i = yn(t, i), hn(t, l), n = ia(e, t, n, r, i, l), r = oa(), e !== null && !_e ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, ut(e, t, l)) : (G && r && Yo(t), t.flags |= 1, ye(e, t, n, l), t.child);
}
function _s(e, t, n, r, l) {
  if (je(n)) {
    var i = !0;
    vl(t);
  } else i = !1;
  if (hn(t, l), t.stateNode === null) nl(e, t), Fc(t, n, r), ao(t, n, r, l), r = !0;
  else if (e === null) {
    var o = t.stateNode, a = t.memoizedProps;
    o.props = a;
    var s = o.context, u = n.contextType;
    typeof u == "object" && u !== null ? u = Oe(u) : (u = je(n) ? Ut : ve.current, u = yn(t, u));
    var f = n.getDerivedStateFromProps, p = typeof f == "function" || typeof o.getSnapshotBeforeUpdate == "function";
    p || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (a !== r || s !== u) && ys(t, o, r, u), pt = !1;
    var c = t.memoizedState;
    o.state = c, kl(t, r, o, l), s = t.memoizedState, a !== r || c !== s || Ce.current || pt ? (typeof f == "function" && (oo(t, n, f, r), s = t.memoizedState), (a = pt || vs(t, n, a, r, c, s, u)) ? (p || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = s), o.props = r, o.state = s, o.context = u, r = a) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    o = t.stateNode, gc(e, t), a = t.memoizedProps, u = t.type === t.elementType ? a : We(t.type, a), o.props = u, p = t.pendingProps, c = o.context, s = n.contextType, typeof s == "object" && s !== null ? s = Oe(s) : (s = je(n) ? Ut : ve.current, s = yn(t, s));
    var v = n.getDerivedStateFromProps;
    (f = typeof v == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (a !== p || c !== s) && ys(t, o, r, s), pt = !1, c = t.memoizedState, o.state = c, kl(t, r, o, l);
    var y = t.memoizedState;
    a !== p || c !== y || Ce.current || pt ? (typeof v == "function" && (oo(t, n, v, r), y = t.memoizedState), (u = pt || vs(t, n, u, r, c, y, s) || !1) ? (f || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, y, s), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(r, y, s)), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || a === e.memoizedProps && c === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && c === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = y), o.props = r, o.state = y, o.context = s, r = u) : (typeof o.componentDidUpdate != "function" || a === e.memoizedProps && c === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && c === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return co(e, t, n, r, i, l);
}
function co(e, t, n, r, l, i) {
  Wc(e, t);
  var o = (t.flags & 128) !== 0;
  if (!r && !o) return l && us(t, n, !1), ut(e, t, i);
  r = t.stateNode, Bp.current = t;
  var a = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && o ? (t.child = xn(t, e.child, null, i), t.child = xn(t, null, a, i)) : ye(e, t, a, i), t.memoizedState = r.state, l && us(t, n, !0), t.child;
}
function Vc(e) {
  var t = e.stateNode;
  t.pendingContext ? ss(e, t.pendingContext, t.pendingContext !== t.context) : t.context && ss(e, t.context, !1), ta(e, t.containerInfo);
}
function Cs(e, t, n, r, l) {
  return wn(), Ko(l), t.flags |= 256, ye(e, t, n, r), t.child;
}
var fo = { dehydrated: null, treeContext: null, retryLane: 0 };
function po(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function bc(e, t, n) {
  var r = t.pendingProps, l = J.current, i = !1, o = (t.flags & 128) !== 0, a;
  if ((a = o) || (a = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0), a ? (i = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (l |= 1), Y(J, l & 1), e === null)
    return lo(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (o = r.children, e = r.fallback, i ? (r = t.mode, i = t.child, o = { mode: "hidden", children: o }, !(r & 1) && i !== null ? (i.childLanes = 0, i.pendingProps = o) : i = Bl(o, r, 0, null), e = Ot(e, r, n, null), i.return = t, e.return = t, i.sibling = e, t.child = i, t.child.memoizedState = po(n), t.memoizedState = fo, e) : ua(t, o));
  if (l = e.memoizedState, l !== null && (a = l.dehydrated, a !== null)) return Wp(e, t, o, r, a, l, n);
  if (i) {
    i = r.fallback, o = t.mode, l = e.child, a = l.sibling;
    var s = { mode: "hidden", children: r.children };
    return !(o & 1) && t.child !== l ? (r = t.child, r.childLanes = 0, r.pendingProps = s, t.deletions = null) : (r = Ct(l, s), r.subtreeFlags = l.subtreeFlags & 14680064), a !== null ? i = Ct(a, i) : (i = Ot(i, o, n, null), i.flags |= 2), i.return = t, r.return = t, r.sibling = i, t.child = r, r = i, i = t.child, o = e.child.memoizedState, o = o === null ? po(n) : { baseLanes: o.baseLanes | n, cachePool: null, transitions: o.transitions }, i.memoizedState = o, i.childLanes = e.childLanes & ~n, t.memoizedState = fo, r;
  }
  return i = e.child, e = i.sibling, r = Ct(i, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function ua(e, t) {
  return t = Bl({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function Or(e, t, n, r) {
  return r !== null && Ko(r), xn(t, e.child, null, n), e = ua(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function Wp(e, t, n, r, l, i, o) {
  if (n)
    return t.flags & 256 ? (t.flags &= -257, r = Si(Error(k(422))), Or(e, t, o, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (i = r.fallback, l = t.mode, r = Bl({ mode: "visible", children: r.children }, l, 0, null), i = Ot(i, l, o, null), i.flags |= 2, r.return = t, i.return = t, r.sibling = i, t.child = r, t.mode & 1 && xn(t, e.child, null, o), t.child.memoizedState = po(o), t.memoizedState = fo, i);
  if (!(t.mode & 1)) return Or(e, t, o, null);
  if (l.data === "$!") {
    if (r = l.nextSibling && l.nextSibling.dataset, r) var a = r.dgst;
    return r = a, i = Error(k(419)), r = Si(i, r, void 0), Or(e, t, o, r);
  }
  if (a = (o & e.childLanes) !== 0, _e || a) {
    if (r = se, r !== null) {
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
      l = l & (r.suspendedLanes | o) ? 0 : l, l !== 0 && l !== i.retryLane && (i.retryLane = l, st(e, l), Qe(r, e, l, -1));
    }
    return ma(), r = Si(Error(k(421))), Or(e, t, o, r);
  }
  return l.data === "$?" ? (t.flags |= 128, t.child = e.child, t = th.bind(null, e), l._reactRetry = t, null) : (e = i.treeContext, Te = St(l.nextSibling), De = t, G = !0, be = null, e !== null && (Ie[$e++] = rt, Ie[$e++] = lt, Ie[$e++] = Bt, rt = e.id, lt = e.overflow, Bt = t), t = ua(t, r.children), t.flags |= 4096, t);
}
function js(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), io(e.return, t, n);
}
function ki(e, t, n, r, l) {
  var i = e.memoizedState;
  i === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: l } : (i.isBackwards = t, i.rendering = null, i.renderingStartTime = 0, i.last = r, i.tail = n, i.tailMode = l);
}
function Hc(e, t, n) {
  var r = t.pendingProps, l = r.revealOrder, i = r.tail;
  if (ye(e, t, r.children, n), r = J.current, r & 2) r = r & 1 | 2, t.flags |= 128;
  else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && js(e, n, t);
      else if (e.tag === 19) js(e, n, t);
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
      for (n = t.child, l = null; n !== null; ) e = n.alternate, e !== null && El(e) === null && (l = n), n = n.sibling;
      n = l, n === null ? (l = t.child, t.child = null) : (l = n.sibling, n.sibling = null), ki(t, !1, l, n, i);
      break;
    case "backwards":
      for (n = null, l = t.child, t.child = null; l !== null; ) {
        if (e = l.alternate, e !== null && El(e) === null) {
          t.child = l;
          break;
        }
        e = l.sibling, l.sibling = n, n = l, l = e;
      }
      ki(t, !0, n, null, i);
      break;
    case "together":
      ki(t, !1, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function nl(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
}
function ut(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), Vt |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(k(153));
  if (t.child !== null) {
    for (e = t.child, n = Ct(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = Ct(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function Vp(e, t, n) {
  switch (t.tag) {
    case 3:
      Vc(t), wn();
      break;
    case 5:
      vc(t);
      break;
    case 1:
      je(t.type) && vl(t);
      break;
    case 4:
      ta(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, l = t.memoizedProps.value;
      Y(xl, r._currentValue), r._currentValue = l;
      break;
    case 13:
      if (r = t.memoizedState, r !== null)
        return r.dehydrated !== null ? (Y(J, J.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? bc(e, t, n) : (Y(J, J.current & 1), e = ut(e, t, n), e !== null ? e.sibling : null);
      Y(J, J.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return Hc(e, t, n);
        t.flags |= 128;
      }
      if (l = t.memoizedState, l !== null && (l.rendering = null, l.tail = null, l.lastEffect = null), Y(J, J.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, Bc(e, t, n);
  }
  return ut(e, t, n);
}
var Qc, ho, Yc, Xc;
Qc = function(e, t) {
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
Yc = function(e, t, n, r) {
  var l = e.memoizedProps;
  if (l !== r) {
    e = t.stateNode, Ft(qe.current);
    var i = null;
    switch (n) {
      case "input":
        l = Ii(e, l), r = Ii(e, r), i = [];
        break;
      case "select":
        l = ee({}, l, { value: void 0 }), r = ee({}, r, { value: void 0 }), i = [];
        break;
      case "textarea":
        l = Ai(e, l), r = Ai(e, r), i = [];
        break;
      default:
        typeof l.onClick != "function" && typeof r.onClick == "function" && (e.onclick = ml);
    }
    Ui(n, r);
    var o;
    n = null;
    for (u in l) if (!r.hasOwnProperty(u) && l.hasOwnProperty(u) && l[u] != null) if (u === "style") {
      var a = l[u];
      for (o in a) a.hasOwnProperty(o) && (n || (n = {}), n[o] = "");
    } else u !== "dangerouslySetInnerHTML" && u !== "children" && u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && u !== "autoFocus" && (tr.hasOwnProperty(u) ? i || (i = []) : (i = i || []).push(u, null));
    for (u in r) {
      var s = r[u];
      if (a = l != null ? l[u] : void 0, r.hasOwnProperty(u) && s !== a && (s != null || a != null)) if (u === "style") if (a) {
        for (o in a) !a.hasOwnProperty(o) || s && s.hasOwnProperty(o) || (n || (n = {}), n[o] = "");
        for (o in s) s.hasOwnProperty(o) && a[o] !== s[o] && (n || (n = {}), n[o] = s[o]);
      } else n || (i || (i = []), i.push(
        u,
        n
      )), n = s;
      else u === "dangerouslySetInnerHTML" ? (s = s ? s.__html : void 0, a = a ? a.__html : void 0, s != null && a !== s && (i = i || []).push(u, s)) : u === "children" ? typeof s != "string" && typeof s != "number" || (i = i || []).push(u, "" + s) : u !== "suppressContentEditableWarning" && u !== "suppressHydrationWarning" && (tr.hasOwnProperty(u) ? (s != null && u === "onScroll" && X("scroll", e), i || a === s || (i = [])) : (i = i || []).push(u, s));
    }
    n && (i = i || []).push("style", n);
    var u = i;
    (t.updateQueue = u) && (t.flags |= 4);
  }
};
Xc = function(e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function On(e, t) {
  if (!G) switch (e.tailMode) {
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
function he(e) {
  var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
  if (t) for (var l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags & 14680064, r |= l.flags & 14680064, l.return = e, l = l.sibling;
  else for (l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags, r |= l.flags, l.return = e, l = l.sibling;
  return e.subtreeFlags |= r, e.childLanes = n, t;
}
function bp(e, t, n) {
  var r = t.pendingProps;
  switch (Xo(t), t.tag) {
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
      return he(t), null;
    case 1:
      return je(t.type) && gl(), he(t), null;
    case 3:
      return r = t.stateNode, Sn(), K(Ce), K(ve), ra(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (Fr(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, be !== null && (ko(be), be = null))), ho(e, t), he(t), null;
    case 5:
      na(t);
      var l = Ft(pr.current);
      if (n = t.type, e !== null && t.stateNode != null) Yc(e, t, n, r, l), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(k(166));
          return he(t), null;
        }
        if (e = Ft(qe.current), Fr(t)) {
          r = t.stateNode, n = t.type;
          var i = t.memoizedProps;
          switch (r[Ze] = t, r[dr] = i, e = (t.mode & 1) !== 0, n) {
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
              for (l = 0; l < Hn.length; l++) X(Hn[l], r);
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
              Ia(r, i), X("invalid", r);
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
            o === "children" ? typeof a == "string" ? r.textContent !== a && (i.suppressHydrationWarning !== !0 && $r(r.textContent, a, e), l = ["children", a]) : typeof a == "number" && r.textContent !== "" + a && (i.suppressHydrationWarning !== !0 && $r(
              r.textContent,
              a,
              e
            ), l = ["children", "" + a]) : tr.hasOwnProperty(o) && a != null && o === "onScroll" && X("scroll", r);
          }
          switch (n) {
            case "input":
              zr(r), $a(r, i, !0);
              break;
            case "textarea":
              zr(r), Aa(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof i.onClick == "function" && (r.onclick = ml);
          }
          r = l, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          o = l.nodeType === 9 ? l : l.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = ku(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = o.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = o.createElement(n, { is: r.is }) : (e = o.createElement(n), n === "select" && (o = e, r.multiple ? o.multiple = !0 : r.size && (o.size = r.size))) : e = o.createElementNS(e, n), e[Ze] = t, e[dr] = r, Qc(e, t, !1, !1), t.stateNode = e;
          e: {
            switch (o = Bi(n, r), n) {
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
                for (l = 0; l < Hn.length; l++) X(Hn[l], e);
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
                Ia(e, r), l = Ii(e, r), X("invalid", e);
                break;
              case "option":
                l = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, l = ee({}, r, { value: void 0 }), X("invalid", e);
                break;
              case "textarea":
                Fa(e, r), l = Ai(e, r), X("invalid", e);
                break;
              default:
                l = r;
            }
            Ui(n, l), a = l;
            for (i in a) if (a.hasOwnProperty(i)) {
              var s = a[i];
              i === "style" ? Cu(e, s) : i === "dangerouslySetInnerHTML" ? (s = s ? s.__html : void 0, s != null && Eu(e, s)) : i === "children" ? typeof s == "string" ? (n !== "textarea" || s !== "") && nr(e, s) : typeof s == "number" && nr(e, "" + s) : i !== "suppressContentEditableWarning" && i !== "suppressHydrationWarning" && i !== "autoFocus" && (tr.hasOwnProperty(i) ? s != null && i === "onScroll" && X("scroll", e) : s != null && Lo(e, i, s, o));
            }
            switch (n) {
              case "input":
                zr(e), $a(e, r, !1);
                break;
              case "textarea":
                zr(e), Aa(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + jt(r.value));
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
                typeof l.onClick == "function" && (e.onclick = ml);
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
      return he(t), null;
    case 6:
      if (e && t.stateNode != null) Xc(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(k(166));
        if (n = Ft(pr.current), Ft(qe.current), Fr(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[Ze] = t, (i = r.nodeValue !== n) && (e = De, e !== null)) switch (e.tag) {
            case 3:
              $r(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && $r(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          i && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[Ze] = t, t.stateNode = r;
      }
      return he(t), null;
    case 13:
      if (K(J), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (G && Te !== null && t.mode & 1 && !(t.flags & 128)) fc(), wn(), t.flags |= 98560, i = !1;
        else if (i = Fr(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!i) throw Error(k(318));
            if (i = t.memoizedState, i = i !== null ? i.dehydrated : null, !i) throw Error(k(317));
            i[Ze] = t;
          } else wn(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          he(t), i = !1;
        } else be !== null && (ko(be), be = null), i = !0;
        if (!i) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || J.current & 1 ? oe === 0 && (oe = 3) : ma())), t.updateQueue !== null && (t.flags |= 4), he(t), null);
    case 4:
      return Sn(), ho(e, t), e === null && ur(t.stateNode.containerInfo), he(t), null;
    case 10:
      return Jo(t.type._context), he(t), null;
    case 17:
      return je(t.type) && gl(), he(t), null;
    case 19:
      if (K(J), i = t.memoizedState, i === null) return he(t), null;
      if (r = (t.flags & 128) !== 0, o = i.rendering, o === null) if (r) On(i, !1);
      else {
        if (oe !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (o = El(e), o !== null) {
            for (t.flags |= 128, On(i, !1), r = o.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) i = n, e = r, i.flags &= 14680066, o = i.alternate, o === null ? (i.childLanes = 0, i.lanes = e, i.child = null, i.subtreeFlags = 0, i.memoizedProps = null, i.memoizedState = null, i.updateQueue = null, i.dependencies = null, i.stateNode = null) : (i.childLanes = o.childLanes, i.lanes = o.lanes, i.child = o.child, i.subtreeFlags = 0, i.deletions = null, i.memoizedProps = o.memoizedProps, i.memoizedState = o.memoizedState, i.updateQueue = o.updateQueue, i.type = o.type, e = o.dependencies, i.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return Y(J, J.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        i.tail !== null && ne() > En && (t.flags |= 128, r = !0, On(i, !1), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = El(o), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), On(i, !0), i.tail === null && i.tailMode === "hidden" && !o.alternate && !G) return he(t), null;
        } else 2 * ne() - i.renderingStartTime > En && n !== 1073741824 && (t.flags |= 128, r = !0, On(i, !1), t.lanes = 4194304);
        i.isBackwards ? (o.sibling = t.child, t.child = o) : (n = i.last, n !== null ? n.sibling = o : t.child = o, i.last = o);
      }
      return i.tail !== null ? (t = i.tail, i.rendering = t, i.tail = t.sibling, i.renderingStartTime = ne(), t.sibling = null, n = J.current, Y(J, r ? n & 1 | 2 : n & 1), t) : (he(t), null);
    case 22:
    case 23:
      return ha(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? Ne & 1073741824 && (he(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : he(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(k(156, t.tag));
}
function Hp(e, t) {
  switch (Xo(t), t.tag) {
    case 1:
      return je(t.type) && gl(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return Sn(), K(Ce), K(ve), ra(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return na(t), null;
    case 13:
      if (K(J), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(k(340));
        wn();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return K(J), null;
    case 4:
      return Sn(), null;
    case 10:
      return Jo(t.type._context), null;
    case 22:
    case 23:
      return ha(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var Ur = !1, me = !1, Qp = typeof WeakSet == "function" ? WeakSet : Set, R = null;
function sn(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    te(e, t, r);
  }
  else n.current = null;
}
function mo(e, t, n) {
  try {
    n();
  } catch (r) {
    te(e, t, r);
  }
}
var Ps = !1;
function Yp(e, t) {
  if (Zi = fl, e = qu(), Qo(e)) {
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
  for (Ji = { focusedElem: e, selectionRange: n }, fl = !1, R = t; R !== null; ) if (t = R, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, R = e;
  else for (; R !== null; ) {
    t = R;
    try {
      var y = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (y !== null) {
            var x = y.memoizedProps, j = y.memoizedState, m = t.stateNode, h = m.getSnapshotBeforeUpdate(t.elementType === t.type ? x : We(t.type, x), j);
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
          throw Error(k(163));
      }
    } catch (w) {
      te(t, t.return, w);
    }
    if (e = t.sibling, e !== null) {
      e.return = t.return, R = e;
      break;
    }
    R = t.return;
  }
  return y = Ps, Ps = !1, y;
}
function Jn(e, t, n) {
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
function Ol(e, t) {
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
function Kc(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, Kc(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Ze], delete t[dr], delete t[to], delete t[Np], delete t[Tp])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function Gc(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function zs(e) {
  e: for (; ; ) {
    for (; e.sibling === null; ) {
      if (e.return === null || Gc(e.return)) return null;
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
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = ml));
  else if (r !== 4 && (e = e.child, e !== null)) for (vo(e, t, n), e = e.sibling; e !== null; ) vo(e, t, n), e = e.sibling;
}
function yo(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child, e !== null)) for (yo(e, t, n), e = e.sibling; e !== null; ) yo(e, t, n), e = e.sibling;
}
var ce = null, Ve = !1;
function dt(e, t, n) {
  for (n = n.child; n !== null; ) Zc(e, t, n), n = n.sibling;
}
function Zc(e, t, n) {
  if (Je && typeof Je.onCommitFiberUnmount == "function") try {
    Je.onCommitFiberUnmount(Dl, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      me || sn(n, t);
    case 6:
      var r = ce, l = Ve;
      ce = null, dt(e, t, n), ce = r, Ve = l, ce !== null && (Ve ? (e = ce, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : ce.removeChild(n.stateNode));
      break;
    case 18:
      ce !== null && (Ve ? (e = ce, n = n.stateNode, e.nodeType === 8 ? mi(e.parentNode, n) : e.nodeType === 1 && mi(e, n), or(e)) : mi(ce, n.stateNode));
      break;
    case 4:
      r = ce, l = Ve, ce = n.stateNode.containerInfo, Ve = !0, dt(e, t, n), ce = r, Ve = l;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!me && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        l = r = r.next;
        do {
          var i = l, o = i.destroy;
          i = i.tag, o !== void 0 && (i & 2 || i & 4) && mo(n, t, o), l = l.next;
        } while (l !== r);
      }
      dt(e, t, n);
      break;
    case 1:
      if (!me && (sn(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
        r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
      } catch (a) {
        te(n, t, a);
      }
      dt(e, t, n);
      break;
    case 21:
      dt(e, t, n);
      break;
    case 22:
      n.mode & 1 ? (me = (r = me) || n.memoizedState !== null, dt(e, t, n), me = r) : dt(e, t, n);
      break;
    default:
      dt(e, t, n);
  }
}
function Ns(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new Qp()), t.forEach(function(r) {
      var l = nh.bind(null, e, r);
      n.has(r) || (n.add(r), r.then(l, l));
    });
  }
}
function Be(e, t) {
  var n = t.deletions;
  if (n !== null) for (var r = 0; r < n.length; r++) {
    var l = n[r];
    try {
      var i = e, o = t, a = o;
      e: for (; a !== null; ) {
        switch (a.tag) {
          case 5:
            ce = a.stateNode, Ve = !1;
            break e;
          case 3:
            ce = a.stateNode.containerInfo, Ve = !0;
            break e;
          case 4:
            ce = a.stateNode.containerInfo, Ve = !0;
            break e;
        }
        a = a.return;
      }
      if (ce === null) throw Error(k(160));
      Zc(i, o, l), ce = null, Ve = !1;
      var s = l.alternate;
      s !== null && (s.return = null), l.return = null;
    } catch (u) {
      te(l, t, u);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) Jc(t, e), t = t.sibling;
}
function Jc(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (Be(t, e), Xe(e), r & 4) {
        try {
          Jn(3, e, e.return), Ol(3, e);
        } catch (x) {
          te(e, e.return, x);
        }
        try {
          Jn(5, e, e.return);
        } catch (x) {
          te(e, e.return, x);
        }
      }
      break;
    case 1:
      Be(t, e), Xe(e), r & 512 && n !== null && sn(n, n.return);
      break;
    case 5:
      if (Be(t, e), Xe(e), r & 512 && n !== null && sn(n, n.return), e.flags & 32) {
        var l = e.stateNode;
        try {
          nr(l, "");
        } catch (x) {
          te(e, e.return, x);
        }
      }
      if (r & 4 && (l = e.stateNode, l != null)) {
        var i = e.memoizedProps, o = n !== null ? n.memoizedProps : i, a = e.type, s = e.updateQueue;
        if (e.updateQueue = null, s !== null) try {
          a === "input" && i.type === "radio" && i.name != null && xu(l, i), Bi(a, o);
          var u = Bi(a, i);
          for (o = 0; o < s.length; o += 2) {
            var f = s[o], p = s[o + 1];
            f === "style" ? Cu(l, p) : f === "dangerouslySetInnerHTML" ? Eu(l, p) : f === "children" ? nr(l, p) : Lo(l, f, p, u);
          }
          switch (a) {
            case "input":
              $i(l, i);
              break;
            case "textarea":
              Su(l, i);
              break;
            case "select":
              var c = l._wrapperState.wasMultiple;
              l._wrapperState.wasMultiple = !!i.multiple;
              var v = i.value;
              v != null ? cn(l, !!i.multiple, v, !1) : c !== !!i.multiple && (i.defaultValue != null ? cn(
                l,
                !!i.multiple,
                i.defaultValue,
                !0
              ) : cn(l, !!i.multiple, i.multiple ? [] : "", !1));
          }
          l[dr] = i;
        } catch (x) {
          te(e, e.return, x);
        }
      }
      break;
    case 6:
      if (Be(t, e), Xe(e), r & 4) {
        if (e.stateNode === null) throw Error(k(162));
        l = e.stateNode, i = e.memoizedProps;
        try {
          l.nodeValue = i;
        } catch (x) {
          te(e, e.return, x);
        }
      }
      break;
    case 3:
      if (Be(t, e), Xe(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        or(t.containerInfo);
      } catch (x) {
        te(e, e.return, x);
      }
      break;
    case 4:
      Be(t, e), Xe(e);
      break;
    case 13:
      Be(t, e), Xe(e), l = e.child, l.flags & 8192 && (i = l.memoizedState !== null, l.stateNode.isHidden = i, !i || l.alternate !== null && l.alternate.memoizedState !== null || (fa = ne())), r & 4 && Ns(e);
      break;
    case 22:
      if (f = n !== null && n.memoizedState !== null, e.mode & 1 ? (me = (u = me) || f, Be(t, e), me = u) : Be(t, e), Xe(e), r & 8192) {
        if (u = e.memoizedState !== null, (e.stateNode.isHidden = u) && !f && e.mode & 1) for (R = e, f = e.child; f !== null; ) {
          for (p = R = f; R !== null; ) {
            switch (c = R, v = c.child, c.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                Jn(4, c, c.return);
                break;
              case 1:
                sn(c, c.return);
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
                sn(c, c.return);
                break;
              case 22:
                if (c.memoizedState !== null) {
                  Ds(p);
                  continue;
                }
            }
            v !== null ? (v.return = c, R = v) : Ds(p);
          }
          f = f.sibling;
        }
        e: for (f = null, p = e; ; ) {
          if (p.tag === 5) {
            if (f === null) {
              f = p;
              try {
                l = p.stateNode, u ? (i = l.style, typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none") : (a = p.stateNode, s = p.memoizedProps.style, o = s != null && s.hasOwnProperty("display") ? s.display : null, a.style.display = _u("display", o));
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
      Be(t, e), Xe(e), r & 4 && Ns(e);
      break;
    case 21:
      break;
    default:
      Be(
        t,
        e
      ), Xe(e);
  }
}
function Xe(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (Gc(n)) {
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
          r.flags & 32 && (nr(l, ""), r.flags &= -33);
          var i = zs(e);
          yo(e, i, l);
          break;
        case 3:
        case 4:
          var o = r.stateNode.containerInfo, a = zs(e);
          vo(e, a, o);
          break;
        default:
          throw Error(k(161));
      }
    } catch (s) {
      te(e, e.return, s);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function Xp(e, t, n) {
  R = e, qc(e);
}
function qc(e, t, n) {
  for (var r = (e.mode & 1) !== 0; R !== null; ) {
    var l = R, i = l.child;
    if (l.tag === 22 && r) {
      var o = l.memoizedState !== null || Ur;
      if (!o) {
        var a = l.alternate, s = a !== null && a.memoizedState !== null || me;
        a = Ur;
        var u = me;
        if (Ur = o, (me = s) && !u) for (R = l; R !== null; ) o = R, s = o.child, o.tag === 22 && o.memoizedState !== null ? Rs(l) : s !== null ? (s.return = o, R = s) : Rs(l);
        for (; i !== null; ) R = i, qc(i), i = i.sibling;
        R = l, Ur = a, me = u;
      }
      Ts(e);
    } else l.subtreeFlags & 8772 && i !== null ? (i.return = l, R = i) : Ts(e);
  }
}
function Ts(e) {
  for (; R !== null; ) {
    var t = R;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            me || Ol(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !me) if (n === null) r.componentDidMount();
            else {
              var l = t.elementType === t.type ? n.memoizedProps : We(t.type, n.memoizedProps);
              r.componentDidUpdate(l, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var i = t.updateQueue;
            i !== null && hs(t, i, r);
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
              hs(t, o, n);
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
                  p !== null && or(p);
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
        me || t.flags & 512 && go(t);
      } catch (c) {
        te(t, t.return, c);
      }
    }
    if (t === e) {
      R = null;
      break;
    }
    if (n = t.sibling, n !== null) {
      n.return = t.return, R = n;
      break;
    }
    R = t.return;
  }
}
function Ds(e) {
  for (; R !== null; ) {
    var t = R;
    if (t === e) {
      R = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      n.return = t.return, R = n;
      break;
    }
    R = t.return;
  }
}
function Rs(e) {
  for (; R !== null; ) {
    var t = R;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            Ol(4, t);
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
            go(t);
          } catch (s) {
            te(t, i, s);
          }
          break;
        case 5:
          var o = t.return;
          try {
            go(t);
          } catch (s) {
            te(t, o, s);
          }
      }
    } catch (s) {
      te(t, t.return, s);
    }
    if (t === e) {
      R = null;
      break;
    }
    var a = t.sibling;
    if (a !== null) {
      a.return = t.return, R = a;
      break;
    }
    R = t.return;
  }
}
var Kp = Math.ceil, jl = ct.ReactCurrentDispatcher, ca = ct.ReactCurrentOwner, Ae = ct.ReactCurrentBatchConfig, B = 0, se = null, le = null, de = 0, Ne = 0, un = Nt(0), oe = 0, vr = null, Vt = 0, Ul = 0, da = 0, qn = null, Ee = null, fa = 0, En = 1 / 0, tt = null, Pl = !1, wo = null, Et = null, Br = !1, vt = null, zl = 0, er = 0, xo = null, rl = -1, ll = 0;
function we() {
  return B & 6 ? ne() : rl !== -1 ? rl : rl = ne();
}
function _t(e) {
  return e.mode & 1 ? B & 2 && de !== 0 ? de & -de : Rp.transition !== null ? (ll === 0 && (ll = Fu()), ll) : (e = H, e !== 0 || (e = window.event, e = e === void 0 ? 16 : bu(e.type)), e) : 1;
}
function Qe(e, t, n, r) {
  if (50 < er) throw er = 0, xo = null, Error(k(185));
  xr(e, n, r), (!(B & 2) || e !== se) && (e === se && (!(B & 2) && (Ul |= n), oe === 4 && mt(e, de)), Pe(e, r), n === 1 && B === 0 && !(t.mode & 1) && (En = ne() + 500, $l && Tt()));
}
function Pe(e, t) {
  var n = e.callbackNode;
  Rf(e, t);
  var r = dl(e, e === se ? de : 0);
  if (r === 0) n !== null && Ba(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && Ba(n), t === 1) e.tag === 0 ? Dp(Ls.bind(null, e)) : uc(Ls.bind(null, e)), Pp(function() {
      !(B & 6) && Tt();
    }), n = null;
    else {
      switch (Au(r)) {
        case 1:
          n = Ao;
          break;
        case 4:
          n = Iu;
          break;
        case 16:
          n = cl;
          break;
        case 536870912:
          n = $u;
          break;
        default:
          n = cl;
      }
      n = ad(n, ed.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function ed(e, t) {
  if (rl = -1, ll = 0, B & 6) throw Error(k(327));
  var n = e.callbackNode;
  if (mn() && e.callbackNode !== n) return null;
  var r = dl(e, e === se ? de : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = Nl(e, r);
  else {
    t = r;
    var l = B;
    B |= 2;
    var i = nd();
    (se !== e || de !== t) && (tt = null, En = ne() + 500, At(e, t));
    do
      try {
        Jp();
        break;
      } catch (a) {
        td(e, a);
      }
    while (!0);
    Zo(), jl.current = i, B = l, le !== null ? t = 0 : (se = null, de = 0, t = oe);
  }
  if (t !== 0) {
    if (t === 2 && (l = Qi(e), l !== 0 && (r = l, t = So(e, l))), t === 1) throw n = vr, At(e, 0), mt(e, r), Pe(e, ne()), n;
    if (t === 6) mt(e, r);
    else {
      if (l = e.current.alternate, !(r & 30) && !Gp(l) && (t = Nl(e, r), t === 2 && (i = Qi(e), i !== 0 && (r = i, t = So(e, i))), t === 1)) throw n = vr, At(e, 0), mt(e, r), Pe(e, ne()), n;
      switch (e.finishedWork = l, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(k(345));
        case 2:
          Mt(e, Ee, tt);
          break;
        case 3:
          if (mt(e, r), (r & 130023424) === r && (t = fa + 500 - ne(), 10 < t)) {
            if (dl(e, 0) !== 0) break;
            if (l = e.suspendedLanes, (l & r) !== r) {
              we(), e.pingedLanes |= e.suspendedLanes & l;
              break;
            }
            e.timeoutHandle = eo(Mt.bind(null, e, Ee, tt), t);
            break;
          }
          Mt(e, Ee, tt);
          break;
        case 4:
          if (mt(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, l = -1; 0 < r; ) {
            var o = 31 - He(r);
            i = 1 << o, o = t[o], o > l && (l = o), r &= ~i;
          }
          if (r = l, r = ne() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * Kp(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = eo(Mt.bind(null, e, Ee, tt), r);
            break;
          }
          Mt(e, Ee, tt);
          break;
        case 5:
          Mt(e, Ee, tt);
          break;
        default:
          throw Error(k(329));
      }
    }
  }
  return Pe(e, ne()), e.callbackNode === n ? ed.bind(null, e) : null;
}
function So(e, t) {
  var n = qn;
  return e.current.memoizedState.isDehydrated && (At(e, t).flags |= 256), e = Nl(e, t), e !== 2 && (t = Ee, Ee = n, t !== null && ko(t)), e;
}
function ko(e) {
  Ee === null ? Ee = e : Ee.push.apply(Ee, e);
}
function Gp(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
        var l = n[r], i = l.getSnapshot;
        l = l.value;
        try {
          if (!Ye(i(), l)) return !1;
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
function mt(e, t) {
  for (t &= ~da, t &= ~Ul, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - He(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function Ls(e) {
  if (B & 6) throw Error(k(327));
  mn();
  var t = dl(e, 0);
  if (!(t & 1)) return Pe(e, ne()), null;
  var n = Nl(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Qi(e);
    r !== 0 && (t = r, n = So(e, r));
  }
  if (n === 1) throw n = vr, At(e, 0), mt(e, t), Pe(e, ne()), n;
  if (n === 6) throw Error(k(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, Mt(e, Ee, tt), Pe(e, ne()), null;
}
function pa(e, t) {
  var n = B;
  B |= 1;
  try {
    return e(t);
  } finally {
    B = n, B === 0 && (En = ne() + 500, $l && Tt());
  }
}
function bt(e) {
  vt !== null && vt.tag === 0 && !(B & 6) && mn();
  var t = B;
  B |= 1;
  var n = Ae.transition, r = H;
  try {
    if (Ae.transition = null, H = 1, e) return e();
  } finally {
    H = r, Ae.transition = n, B = t, !(B & 6) && Tt();
  }
}
function ha() {
  Ne = un.current, K(un);
}
function At(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, jp(n)), le !== null) for (n = le.return; n !== null; ) {
    var r = n;
    switch (Xo(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && gl();
        break;
      case 3:
        Sn(), K(Ce), K(ve), ra();
        break;
      case 5:
        na(r);
        break;
      case 4:
        Sn();
        break;
      case 13:
        K(J);
        break;
      case 19:
        K(J);
        break;
      case 10:
        Jo(r.type._context);
        break;
      case 22:
      case 23:
        ha();
    }
    n = n.return;
  }
  if (se = e, le = e = Ct(e.current, null), de = Ne = t, oe = 0, vr = null, da = Ul = Vt = 0, Ee = qn = null, $t !== null) {
    for (t = 0; t < $t.length; t++) if (n = $t[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var l = r.next, i = n.pending;
      if (i !== null) {
        var o = i.next;
        i.next = l, r.next = o;
      }
      n.pending = r;
    }
    $t = null;
  }
  return e;
}
function td(e, t) {
  do {
    var n = le;
    try {
      if (Zo(), el.current = Cl, _l) {
        for (var r = q.memoizedState; r !== null; ) {
          var l = r.queue;
          l !== null && (l.pending = null), r = r.next;
        }
        _l = !1;
      }
      if (Wt = 0, ae = ie = q = null, Zn = !1, hr = 0, ca.current = null, n === null || n.return === null) {
        oe = 1, vr = t, le = null;
        break;
      }
      e: {
        var i = e, o = n.return, a = n, s = t;
        if (t = de, a.flags |= 32768, s !== null && typeof s == "object" && typeof s.then == "function") {
          var u = s, f = a, p = f.tag;
          if (!(f.mode & 1) && (p === 0 || p === 11 || p === 15)) {
            var c = f.alternate;
            c ? (f.updateQueue = c.updateQueue, f.memoizedState = c.memoizedState, f.lanes = c.lanes) : (f.updateQueue = null, f.memoizedState = null);
          }
          var v = xs(o);
          if (v !== null) {
            v.flags &= -257, Ss(v, o, a, i, t), v.mode & 1 && ws(i, u, t), t = v, s = u;
            var y = t.updateQueue;
            if (y === null) {
              var x = /* @__PURE__ */ new Set();
              x.add(s), t.updateQueue = x;
            } else y.add(s);
            break e;
          } else {
            if (!(t & 1)) {
              ws(i, u, t), ma();
              break e;
            }
            s = Error(k(426));
          }
        } else if (G && a.mode & 1) {
          var j = xs(o);
          if (j !== null) {
            !(j.flags & 65536) && (j.flags |= 256), Ss(j, o, a, i, t), Ko(kn(s, a));
            break e;
          }
        }
        i = s = kn(s, a), oe !== 4 && (oe = 2), qn === null ? qn = [i] : qn.push(i), i = o;
        do {
          switch (i.tag) {
            case 3:
              i.flags |= 65536, t &= -t, i.lanes |= t;
              var m = Ac(i, s, t);
              ps(i, m);
              break e;
            case 1:
              a = s;
              var h = i.type, g = i.stateNode;
              if (!(i.flags & 128) && (typeof h.getDerivedStateFromError == "function" || g !== null && typeof g.componentDidCatch == "function" && (Et === null || !Et.has(g)))) {
                i.flags |= 65536, t &= -t, i.lanes |= t;
                var w = Oc(i, a, t);
                ps(i, w);
                break e;
              }
          }
          i = i.return;
        } while (i !== null);
      }
      ld(n);
    } catch (C) {
      t = C, le === n && n !== null && (le = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function nd() {
  var e = jl.current;
  return jl.current = Cl, e === null ? Cl : e;
}
function ma() {
  (oe === 0 || oe === 3 || oe === 2) && (oe = 4), se === null || !(Vt & 268435455) && !(Ul & 268435455) || mt(se, de);
}
function Nl(e, t) {
  var n = B;
  B |= 2;
  var r = nd();
  (se !== e || de !== t) && (tt = null, At(e, t));
  do
    try {
      Zp();
      break;
    } catch (l) {
      td(e, l);
    }
  while (!0);
  if (Zo(), B = n, jl.current = r, le !== null) throw Error(k(261));
  return se = null, de = 0, oe;
}
function Zp() {
  for (; le !== null; ) rd(le);
}
function Jp() {
  for (; le !== null && !Ef(); ) rd(le);
}
function rd(e) {
  var t = od(e.alternate, e, Ne);
  e.memoizedProps = e.pendingProps, t === null ? ld(e) : le = t, ca.current = null;
}
function ld(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = Hp(n, t), n !== null) {
        n.flags &= 32767, le = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        oe = 6, le = null;
        return;
      }
    } else if (n = bp(n, t, Ne), n !== null) {
      le = n;
      return;
    }
    if (t = t.sibling, t !== null) {
      le = t;
      return;
    }
    le = t = e;
  } while (t !== null);
  oe === 0 && (oe = 5);
}
function Mt(e, t, n) {
  var r = H, l = Ae.transition;
  try {
    Ae.transition = null, H = 1, qp(e, t, n, r);
  } finally {
    Ae.transition = l, H = r;
  }
  return null;
}
function qp(e, t, n, r) {
  do
    mn();
  while (vt !== null);
  if (B & 6) throw Error(k(327));
  n = e.finishedWork;
  var l = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(k(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var i = n.lanes | n.childLanes;
  if (Lf(e, i), e === se && (le = se = null, de = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || Br || (Br = !0, ad(cl, function() {
    return mn(), null;
  })), i = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || i) {
    i = Ae.transition, Ae.transition = null;
    var o = H;
    H = 1;
    var a = B;
    B |= 4, ca.current = null, Yp(e, n), Jc(n, e), wp(Ji), fl = !!Zi, Ji = Zi = null, e.current = n, Xp(n), _f(), B = a, H = o, Ae.transition = i;
  } else e.current = n;
  if (Br && (Br = !1, vt = e, zl = l), i = e.pendingLanes, i === 0 && (Et = null), Pf(n.stateNode), Pe(e, ne()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) l = t[n], r(l.value, { componentStack: l.stack, digest: l.digest });
  if (Pl) throw Pl = !1, e = wo, wo = null, e;
  return zl & 1 && e.tag !== 0 && mn(), i = e.pendingLanes, i & 1 ? e === xo ? er++ : (er = 0, xo = e) : er = 0, Tt(), null;
}
function mn() {
  if (vt !== null) {
    var e = Au(zl), t = Ae.transition, n = H;
    try {
      if (Ae.transition = null, H = 16 > e ? 16 : e, vt === null) var r = !1;
      else {
        if (e = vt, vt = null, zl = 0, B & 6) throw Error(k(331));
        var l = B;
        for (B |= 4, R = e.current; R !== null; ) {
          var i = R, o = i.child;
          if (R.flags & 16) {
            var a = i.deletions;
            if (a !== null) {
              for (var s = 0; s < a.length; s++) {
                var u = a[s];
                for (R = u; R !== null; ) {
                  var f = R;
                  switch (f.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Jn(8, f, i);
                  }
                  var p = f.child;
                  if (p !== null) p.return = f, R = p;
                  else for (; R !== null; ) {
                    f = R;
                    var c = f.sibling, v = f.return;
                    if (Kc(f), f === u) {
                      R = null;
                      break;
                    }
                    if (c !== null) {
                      c.return = v, R = c;
                      break;
                    }
                    R = v;
                  }
                }
              }
              var y = i.alternate;
              if (y !== null) {
                var x = y.child;
                if (x !== null) {
                  y.child = null;
                  do {
                    var j = x.sibling;
                    x.sibling = null, x = j;
                  } while (x !== null);
                }
              }
              R = i;
            }
          }
          if (i.subtreeFlags & 2064 && o !== null) o.return = i, R = o;
          else e: for (; R !== null; ) {
            if (i = R, i.flags & 2048) switch (i.tag) {
              case 0:
              case 11:
              case 15:
                Jn(9, i, i.return);
            }
            var m = i.sibling;
            if (m !== null) {
              m.return = i.return, R = m;
              break e;
            }
            R = i.return;
          }
        }
        var h = e.current;
        for (R = h; R !== null; ) {
          o = R;
          var g = o.child;
          if (o.subtreeFlags & 2064 && g !== null) g.return = o, R = g;
          else e: for (o = h; R !== null; ) {
            if (a = R, a.flags & 2048) try {
              switch (a.tag) {
                case 0:
                case 11:
                case 15:
                  Ol(9, a);
              }
            } catch (C) {
              te(a, a.return, C);
            }
            if (a === o) {
              R = null;
              break e;
            }
            var w = a.sibling;
            if (w !== null) {
              w.return = a.return, R = w;
              break e;
            }
            R = a.return;
          }
        }
        if (B = l, Tt(), Je && typeof Je.onPostCommitFiberRoot == "function") try {
          Je.onPostCommitFiberRoot(Dl, e);
        } catch {
        }
        r = !0;
      }
      return r;
    } finally {
      H = n, Ae.transition = t;
    }
  }
  return !1;
}
function Ms(e, t, n) {
  t = kn(n, t), t = Ac(e, t, 1), e = kt(e, t, 1), t = we(), e !== null && (xr(e, 1, t), Pe(e, t));
}
function te(e, t, n) {
  if (e.tag === 3) Ms(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      Ms(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (Et === null || !Et.has(r))) {
        e = kn(n, e), e = Oc(t, e, 1), t = kt(t, e, 1), e = we(), t !== null && (xr(t, 1, e), Pe(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function eh(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = we(), e.pingedLanes |= e.suspendedLanes & n, se === e && (de & n) === n && (oe === 4 || oe === 3 && (de & 130023424) === de && 500 > ne() - fa ? At(e, 0) : da |= n), Pe(e, t);
}
function id(e, t) {
  t === 0 && (e.mode & 1 ? (t = Dr, Dr <<= 1, !(Dr & 130023424) && (Dr = 4194304)) : t = 1);
  var n = we();
  e = st(e, t), e !== null && (xr(e, t, n), Pe(e, n));
}
function th(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), id(e, n);
}
function nh(e, t) {
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
  r !== null && r.delete(t), id(e, n);
}
var od;
od = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || Ce.current) _e = !0;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return _e = !1, Vp(e, t, n);
    _e = !!(e.flags & 131072);
  }
  else _e = !1, G && t.flags & 1048576 && cc(t, wl, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      nl(e, t), e = t.pendingProps;
      var l = yn(t, ve.current);
      hn(t, n), l = ia(null, t, r, e, l, n);
      var i = oa();
      return t.flags |= 1, typeof l == "object" && l !== null && typeof l.render == "function" && l.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, je(r) ? (i = !0, vl(t)) : i = !1, t.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null, ea(t), l.updater = Al, t.stateNode = l, l._reactInternals = t, ao(t, r, e, n), t = co(null, t, r, !0, i, n)) : (t.tag = 0, G && i && Yo(t), ye(null, t, l, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (nl(e, t), e = t.pendingProps, l = r._init, r = l(r._payload), t.type = r, l = t.tag = lh(r), e = We(r, e), l) {
          case 0:
            t = uo(null, t, r, e, n);
            break e;
          case 1:
            t = _s(null, t, r, e, n);
            break e;
          case 11:
            t = ks(null, t, r, e, n);
            break e;
          case 14:
            t = Es(null, t, r, We(r.type, e), n);
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
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : We(r, l), uo(e, t, r, l, n);
    case 1:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : We(r, l), _s(e, t, r, l, n);
    case 3:
      e: {
        if (Vc(t), e === null) throw Error(k(387));
        r = t.pendingProps, i = t.memoizedState, l = i.element, gc(e, t), kl(t, r, null, n);
        var o = t.memoizedState;
        if (r = o.element, i.isDehydrated) if (i = { element: r, isDehydrated: !1, cache: o.cache, pendingSuspenseBoundaries: o.pendingSuspenseBoundaries, transitions: o.transitions }, t.updateQueue.baseState = i, t.memoizedState = i, t.flags & 256) {
          l = kn(Error(k(423)), t), t = Cs(e, t, r, n, l);
          break e;
        } else if (r !== l) {
          l = kn(Error(k(424)), t), t = Cs(e, t, r, n, l);
          break e;
        } else for (Te = St(t.stateNode.containerInfo.firstChild), De = t, G = !0, be = null, n = hc(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (wn(), r === l) {
            t = ut(e, t, n);
            break e;
          }
          ye(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return vc(t), e === null && lo(t), r = t.type, l = t.pendingProps, i = e !== null ? e.memoizedProps : null, o = l.children, qi(r, l) ? o = null : i !== null && qi(r, i) && (t.flags |= 32), Wc(e, t), ye(e, t, o, n), t.child;
    case 6:
      return e === null && lo(t), null;
    case 13:
      return bc(e, t, n);
    case 4:
      return ta(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = xn(t, null, r, n) : ye(e, t, r, n), t.child;
    case 11:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : We(r, l), ks(e, t, r, l, n);
    case 7:
      return ye(e, t, t.pendingProps, n), t.child;
    case 8:
      return ye(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return ye(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, l = t.pendingProps, i = t.memoizedProps, o = l.value, Y(xl, r._currentValue), r._currentValue = o, i !== null) if (Ye(i.value, o)) {
          if (i.children === l.children && !Ce.current) {
            t = ut(e, t, n);
            break e;
          }
        } else for (i = t.child, i !== null && (i.return = t); i !== null; ) {
          var a = i.dependencies;
          if (a !== null) {
            o = i.child;
            for (var s = a.firstContext; s !== null; ) {
              if (s.context === r) {
                if (i.tag === 1) {
                  s = it(-1, n & -n), s.tag = 2;
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
            if (o = i.return, o === null) throw Error(k(341));
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
        ye(e, t, l.children, n), t = t.child;
      }
      return t;
    case 9:
      return l = t.type, r = t.pendingProps.children, hn(t, n), l = Oe(l), r = r(l), t.flags |= 1, ye(e, t, r, n), t.child;
    case 14:
      return r = t.type, l = We(r, t.pendingProps), l = We(r.type, l), Es(e, t, r, l, n);
    case 15:
      return Uc(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : We(r, l), nl(e, t), t.tag = 1, je(r) ? (e = !0, vl(t)) : e = !1, hn(t, n), Fc(t, r, l), ao(t, r, l, n), co(null, t, r, !0, e, n);
    case 19:
      return Hc(e, t, n);
    case 22:
      return Bc(e, t, n);
  }
  throw Error(k(156, t.tag));
};
function ad(e, t) {
  return Mu(e, t);
}
function rh(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function Fe(e, t, n, r) {
  return new rh(e, t, n, r);
}
function ga(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function lh(e) {
  if (typeof e == "function") return ga(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === Io) return 11;
    if (e === $o) return 14;
  }
  return 2;
}
function Ct(e, t) {
  var n = e.alternate;
  return n === null ? (n = Fe(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function il(e, t, n, r, l, i) {
  var o = 2;
  if (r = e, typeof e == "function") ga(e) && (o = 1);
  else if (typeof e == "string") o = 5;
  else e: switch (e) {
    case Jt:
      return Ot(n.children, l, i, t);
    case Mo:
      o = 8, l |= 8;
      break;
    case Di:
      return e = Fe(12, n, t, l | 2), e.elementType = Di, e.lanes = i, e;
    case Ri:
      return e = Fe(13, n, t, l), e.elementType = Ri, e.lanes = i, e;
    case Li:
      return e = Fe(19, n, t, l), e.elementType = Li, e.lanes = i, e;
    case vu:
      return Bl(n, l, i, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case mu:
          o = 10;
          break e;
        case gu:
          o = 9;
          break e;
        case Io:
          o = 11;
          break e;
        case $o:
          o = 14;
          break e;
        case ft:
          o = 16, r = null;
          break e;
      }
      throw Error(k(130, e == null ? e : typeof e, ""));
  }
  return t = Fe(o, n, t, l), t.elementType = e, t.type = r, t.lanes = i, t;
}
function Ot(e, t, n, r) {
  return e = Fe(7, e, r, t), e.lanes = n, e;
}
function Bl(e, t, n, r) {
  return e = Fe(22, e, r, t), e.elementType = vu, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
}
function Ei(e, t, n) {
  return e = Fe(6, e, null, t), e.lanes = n, e;
}
function _i(e, t, n) {
  return t = Fe(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function ih(e, t, n, r, l) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = li(0), this.expirationTimes = li(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = li(0), this.identifierPrefix = r, this.onRecoverableError = l, this.mutableSourceEagerHydrationData = null;
}
function va(e, t, n, r, l, i, o, a, s) {
  return e = new ih(e, t, n, a, s), t === 1 ? (t = 1, i === !0 && (t |= 8)) : t = 0, i = Fe(3, null, null, t), e.current = i, i.stateNode = e, i.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, ea(i), e;
}
function oh(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: Zt, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function sd(e) {
  if (!e) return Pt;
  e = e._reactInternals;
  e: {
    if (Qt(e) !== e || e.tag !== 1) throw Error(k(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (je(t.type)) {
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
    if (je(n)) return sc(e, n, t);
  }
  return t;
}
function ud(e, t, n, r, l, i, o, a, s) {
  return e = va(n, r, !0, e, l, i, o, a, s), e.context = sd(null), n = e.current, r = we(), l = _t(n), i = it(r, l), i.callback = t ?? null, kt(n, i, l), e.current.lanes = l, xr(e, l, r), Pe(e, r), e;
}
function Wl(e, t, n, r) {
  var l = t.current, i = we(), o = _t(l);
  return n = sd(n), t.context === null ? t.context = n : t.pendingContext = n, t = it(i, o), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = kt(l, t, o), e !== null && (Qe(e, l, o, i), qr(e, l, o)), o;
}
function Tl(e) {
  if (e = e.current, !e.child) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function Is(e, t) {
  if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function ya(e, t) {
  Is(e, t), (e = e.alternate) && Is(e, t);
}
function ah() {
  return null;
}
var cd = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function wa(e) {
  this._internalRoot = e;
}
Vl.prototype.render = wa.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(k(409));
  Wl(e, t, null, null);
};
Vl.prototype.unmount = wa.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    bt(function() {
      Wl(null, e, null, null);
    }), t[at] = null;
  }
};
function Vl(e) {
  this._internalRoot = e;
}
Vl.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = Bu();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < ht.length && t !== 0 && t < ht[n].priority; n++) ;
    ht.splice(n, 0, e), n === 0 && Vu(e);
  }
};
function xa(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function bl(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function $s() {
}
function sh(e, t, n, r, l) {
  if (l) {
    if (typeof r == "function") {
      var i = r;
      r = function() {
        var u = Tl(o);
        i.call(u);
      };
    }
    var o = ud(t, r, e, 0, null, !1, !1, "", $s);
    return e._reactRootContainer = o, e[at] = o.current, ur(e.nodeType === 8 ? e.parentNode : e), bt(), o;
  }
  for (; l = e.lastChild; ) e.removeChild(l);
  if (typeof r == "function") {
    var a = r;
    r = function() {
      var u = Tl(s);
      a.call(u);
    };
  }
  var s = va(e, 0, !1, null, null, !1, !1, "", $s);
  return e._reactRootContainer = s, e[at] = s.current, ur(e.nodeType === 8 ? e.parentNode : e), bt(function() {
    Wl(t, s, n, r);
  }), s;
}
function Hl(e, t, n, r, l) {
  var i = n._reactRootContainer;
  if (i) {
    var o = i;
    if (typeof l == "function") {
      var a = l;
      l = function() {
        var s = Tl(o);
        a.call(s);
      };
    }
    Wl(t, o, e, l);
  } else o = sh(n, t, e, l, r);
  return Tl(o);
}
Ou = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = bn(t.pendingLanes);
        n !== 0 && (Oo(t, n | 1), Pe(t, ne()), !(B & 6) && (En = ne() + 500, Tt()));
      }
      break;
    case 13:
      bt(function() {
        var r = st(e, 1);
        if (r !== null) {
          var l = we();
          Qe(r, e, 1, l);
        }
      }), ya(e, 1);
  }
};
Uo = function(e) {
  if (e.tag === 13) {
    var t = st(e, 134217728);
    if (t !== null) {
      var n = we();
      Qe(t, e, 134217728, n);
    }
    ya(e, 134217728);
  }
};
Uu = function(e) {
  if (e.tag === 13) {
    var t = _t(e), n = st(e, t);
    if (n !== null) {
      var r = we();
      Qe(n, e, t, r);
    }
    ya(e, t);
  }
};
Bu = function() {
  return H;
};
Wu = function(e, t) {
  var n = H;
  try {
    return H = e, t();
  } finally {
    H = n;
  }
};
Vi = function(e, t, n) {
  switch (t) {
    case "input":
      if ($i(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var l = Il(r);
            if (!l) throw Error(k(90));
            wu(r), $i(r, l);
          }
        }
      }
      break;
    case "textarea":
      Su(e, n);
      break;
    case "select":
      t = n.value, t != null && cn(e, !!n.multiple, t, !1);
  }
};
zu = pa;
Nu = bt;
var uh = { usingClientEntryPoint: !1, Events: [kr, nn, Il, ju, Pu, pa] }, Un = { findFiberByHostInstance: It, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, ch = { bundleType: Un.bundleType, version: Un.version, rendererPackageName: Un.rendererPackageName, rendererConfig: Un.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ct.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = Ru(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: Un.findFiberByHostInstance || ah, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Wr = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Wr.isDisabled && Wr.supportsFiber) try {
    Dl = Wr.inject(ch), Je = Wr;
  } catch {
  }
}
Le.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = uh;
Le.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!xa(t)) throw Error(k(200));
  return oh(e, t, null, n);
};
Le.createRoot = function(e, t) {
  if (!xa(e)) throw Error(k(299));
  var n = !1, r = "", l = cd;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (l = t.onRecoverableError)), t = va(e, 1, !1, null, null, n, !1, r, l), e[at] = t.current, ur(e.nodeType === 8 ? e.parentNode : e), new wa(t);
};
Le.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function" ? Error(k(188)) : (e = Object.keys(e).join(","), Error(k(268, e)));
  return e = Ru(t), e = e === null ? null : e.stateNode, e;
};
Le.flushSync = function(e) {
  return bt(e);
};
Le.hydrate = function(e, t, n) {
  if (!bl(t)) throw Error(k(200));
  return Hl(null, e, t, !0, n);
};
Le.hydrateRoot = function(e, t, n) {
  if (!xa(e)) throw Error(k(405));
  var r = n != null && n.hydratedSources || null, l = !1, i = "", o = cd;
  if (n != null && (n.unstable_strictMode === !0 && (l = !0), n.identifierPrefix !== void 0 && (i = n.identifierPrefix), n.onRecoverableError !== void 0 && (o = n.onRecoverableError)), t = ud(t, null, e, 1, n ?? null, l, !1, i, o), e[at] = t.current, ur(e), r) for (e = 0; e < r.length; e++) n = r[e], l = n._getVersion, l = l(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, l] : t.mutableSourceEagerHydrationData.push(
    n,
    l
  );
  return new Vl(t);
};
Le.render = function(e, t, n) {
  if (!bl(t)) throw Error(k(200));
  return Hl(null, e, t, !1, n);
};
Le.unmountComponentAtNode = function(e) {
  if (!bl(e)) throw Error(k(40));
  return e._reactRootContainer ? (bt(function() {
    Hl(null, null, e, !1, function() {
      e._reactRootContainer = null, e[at] = null;
    });
  }), !0) : !1;
};
Le.unstable_batchedUpdates = pa;
Le.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!bl(n)) throw Error(k(200));
  if (e == null || e._reactInternals === void 0) throw Error(k(38));
  return Hl(e, t, n, !1, r);
};
Le.version = "18.3.1-next-f1338f8080-20240426";
function dd() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(dd);
    } catch (e) {
      console.error(e);
    }
}
dd(), nu.exports = Le;
var fd = nu.exports, pd, Fs = fd;
pd = Fs.createRoot, Fs.hydrateRoot;
function dh(e) {
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
function fh(e) {
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
const ph = {}, As = (e) => {
  let t;
  const n = /* @__PURE__ */ new Set(), r = (f, p) => {
    const c = typeof f == "function" ? f(t) : f;
    if (!Object.is(c, t)) {
      const v = t;
      t = p ?? (typeof c != "object" || c === null) ? c : Object.assign({}, t, c), n.forEach((y) => y(t, v));
    }
  }, l = () => t, s = { setState: r, getState: l, getInitialState: () => u, subscribe: (f) => (n.add(f), () => n.delete(f)), destroy: () => {
    (ph ? "production" : void 0) !== "production" && console.warn(
      "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
    ), n.clear();
  } }, u = t = e(r, l, s);
  return s;
}, hh = (e) => e ? As(e) : As;
var hd = { exports: {} }, md = {}, gd = { exports: {} }, vd = {};
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
function mh(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var gh = typeof Object.is == "function" ? Object.is : mh, vh = _n.useState, yh = _n.useEffect, wh = _n.useLayoutEffect, xh = _n.useDebugValue;
function Sh(e, t) {
  var n = t(), r = vh({ inst: { value: n, getSnapshot: t } }), l = r[0].inst, i = r[1];
  return wh(
    function() {
      l.value = n, l.getSnapshot = t, Ci(l) && i({ inst: l });
    },
    [e, n, t]
  ), yh(
    function() {
      return Ci(l) && i({ inst: l }), e(function() {
        Ci(l) && i({ inst: l });
      });
    },
    [e]
  ), xh(n), n;
}
function Ci(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !gh(e, n);
  } catch {
    return !0;
  }
}
function kh(e, t) {
  return t();
}
var Eh = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? kh : Sh;
vd.useSyncExternalStore = _n.useSyncExternalStore !== void 0 ? _n.useSyncExternalStore : Eh;
gd.exports = vd;
var _h = gd.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ql = E, Ch = _h;
function jh(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Ph = typeof Object.is == "function" ? Object.is : jh, zh = Ch.useSyncExternalStore, Nh = Ql.useRef, Th = Ql.useEffect, Dh = Ql.useMemo, Rh = Ql.useDebugValue;
md.useSyncExternalStoreWithSelector = function(e, t, n, r, l) {
  var i = Nh(null);
  if (i.current === null) {
    var o = { hasValue: !1, value: null };
    i.current = o;
  } else o = i.current;
  i = Dh(
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
        if (y = p, Ph(f, v)) return y;
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
  var a = zh(e, i[0], i[1]);
  return Th(
    function() {
      o.hasValue = !0, o.value = a;
    },
    [a]
  ), Rh(a), a;
};
hd.exports = md;
var Lh = hd.exports;
const Mh = /* @__PURE__ */ tu(Lh), yd = {}, { useDebugValue: Ih } = of, { useSyncExternalStoreWithSelector: $h } = Mh;
let Os = !1;
const Fh = (e) => e;
function Ah(e, t = Fh, n) {
  (yd ? "production" : void 0) !== "production" && n && !Os && (console.warn(
    "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
  ), Os = !0);
  const r = $h(
    e.subscribe,
    e.getState,
    e.getServerState || e.getInitialState,
    t,
    n
  );
  return Ih(r), r;
}
const Us = (e) => {
  (yd ? "production" : void 0) !== "production" && typeof e != "function" && console.warn(
    "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
  );
  const t = typeof e == "function" ? hh(e) : e, n = (r, l) => Ah(t, r, l);
  return Object.assign(n, t), n;
}, Oh = (e) => e ? Us(e) : Us;
function Uh() {
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
function Bh() {
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
function Wh() {
  return typeof window < "u" && window.__TAURI_INTERNALS__ ? Bh() : Uh();
}
const Bs = "text/x-vnd.veusz-widget-3", Vh = "text/x-vnd.veusz-data-1";
function Eo(e, t) {
  const n = [];
  for (const r of e.settings) n.push(Ws(t, r.name));
  for (const r of e.subgroups) n.push(...Eo(r, Ws(t, r.name)));
  return n;
}
function Ws(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
const bh = 33;
function Hh(e, t = Wh()) {
  let n = null, r = null;
  return Oh((l, i) => {
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
          const p = a[0], c = wd(i().tree, p);
          if (!c) {
            l({ schema: null, values: {} });
            return;
          }
          const v = await o(() => e.doc.schema(c));
          if (!v) {
            l({ schema: null, values: {} });
            return;
          }
          const y = Eo(v, p), x = await o(() => e.doc.get(y)) ?? {};
          l({ schema: v, values: x });
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
        const a = await t.read([Vh]);
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
          const { webgpuAvailable: s } = await Promise.resolve().then(() => Ed);
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
            const { gpuRenderScene: x } = await import("./velloNative-Cn1MRGX6.js"), j = await o(() => x(y.scene_b64, y.width, y.height));
            j && l({ render: {
              png: j,
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
        }, bh);
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
function wd(e, t) {
  if (!e) return null;
  if (e.path === t) return e.type;
  for (const n of e.children) {
    const r = wd(n, t);
    if (r) return r;
  }
  return null;
}
function Qh() {
  return (globalThis.__VEUSZ_WASM_BASE__ ?? "/wasm").replace(/\/+$/, "");
}
let Vr = null, Vs = !1;
function Yh() {
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
function Sa() {
  return Vr || (Vr = (async () => {
    Yh();
    const e = Qh(), t = await import(
      /* @vite-ignore */
      `${e}/veusz_paint_wasm.js`
    );
    return await t.default({ module_or_path: `${e}/veusz_paint_wasm_bg.wasm` }), t;
  })().catch((e) => {
    throw Vr = null, e;
  })), Vr;
}
async function xd() {
  try {
    const e = navigator.gpu;
    return e ? await e.requestAdapter() != null : !1;
  } catch {
    return !1;
  }
}
function Yl(e) {
  const t = atob(e), n = new Uint8Array(t.length);
  for (let r = 0; r < t.length; r++) n[r] = t.charCodeAt(r);
  return n;
}
async function ka(e, t, n = [0, 0, 0, 0]) {
  await (await Sa()).render_scene_to_canvas(e, t, n[0], n[1], n[2], n[3]);
}
async function Xh(e, t, n = [0, 0, 0, 0]) {
  await ka(e, Yl(t), n);
}
async function Xl(e, t, n, r = "image/png", l = 0.92, i = [1, 1, 1, 1]) {
  const o = document.createElement("canvas");
  o.width = Math.max(1, Math.round(t)), o.height = Math.max(1, Math.round(n)), o.style.cssText = "position:absolute;left:-99999px;top:0;pointer-events:none", document.body.appendChild(o);
  try {
    await ka(o, Yl(e), i);
    const a = await new Promise((s) => o.toBlob(s, r, l));
    if (!a) throw new Error("canvas.toBlob returned null");
    return a;
  } finally {
    o.remove();
  }
}
async function Sd() {
  try {
    return typeof (await Sa()).scene_to_svg == "function";
  } catch {
    return !1;
  }
}
async function kd(e, t, n) {
  const r = await Sa();
  if (typeof r.scene_to_svg != "function")
    throw new Error("this runtime does not include the SVG exporter");
  return r.scene_to_svg(Yl(e), t, n);
}
const Ed = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base64ToBytes: Yl,
  renderSceneBytesToCanvas: ka,
  renderSceneToCanvas: Xh,
  renderSceneToImageBlob: Xl,
  sceneToSvg: kd,
  svgExportAvailable: Sd,
  webgpuAvailable: xd
}, Symbol.toStringTag, { value: "Module" })), Kh = "0.26.4", Gh = `https://cdn.jsdelivr.net/pyodide/v${Kh}/full/`;
let Bn = null;
async function Zh(e) {
  if (Bn) return Bn;
  const t = e.pyodideIndexUrl ?? Gh, n = e.onProgress ?? (() => {
  });
  return Bn = (async () => {
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
    throw Bn = null, r;
  }), Bn;
}
let Jh = 0;
async function qh(e = {}) {
  const t = e.onProgress ?? (() => {
  });
  e.wasmBase && (globalThis.__VEUSZ_WASM_BASE__ = e.wasmBase);
  const n = await Zh(e);
  t("Starting renderer…");
  const l = n.pyimport("veusz.daemon.pyodide_bridge").Bridge(), i = dh(l), o = `/veusz/fig_${Jh++}`, a = `${o}/figure.vsz`, s = async (u, f = []) => {
    await n.runPythonAsync(`import os; os.makedirs(${JSON.stringify(o)}, exist_ok=True)`);
    for (const p of f) {
      const c = `${o}/${p.name}`, v = c.slice(0, c.lastIndexOf("/"));
      v && v !== o && await n.runPythonAsync(`import os; os.makedirs(${JSON.stringify(v)}, exist_ok=True)`), n.FS.writeFile(c, p.bytes);
    }
    return n.FS.writeFile(a, u), i.call("file.open", { path: a });
  };
  return t("Ready"), { transport: i, bridge: l, loadVsz: s, pyodide: n };
}
async function em(e, t = {}) {
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
      const y = new Uint8Array(await v.arrayBuffer()), x = _d(y), j = v.headers.get("etag"), m = v.headers.get("last-modified"), h = v.headers.get("content-type");
      await e.call("data.url_refresh", {
        url: u.url,
        bytes_b64: x,
        etag: j,
        last_modified: m,
        content_type: h
      }), p.etag = j, p.lastModified = m, l({ url: u.url, phase: "ok" });
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
async function tm(e, t, n = {}) {
  const r = nm(e), l = n.onError ?? ((i, o) => console.warn(`[veusz-figure] pre-fetch ${i}: ${o.message}`));
  return await Promise.allSettled(r.map(async (i) => {
    const o = n.urlMap && Object.prototype.hasOwnProperty.call(n.urlMap, i) ? n.urlMap[i] : n.urlBase ? new URL(i, n.urlBase).toString() : i;
    try {
      const a = await fetch(o, { cache: "no-store" });
      if (!a.ok) throw new Error(`HTTP ${a.status}`);
      const s = new Uint8Array(await a.arrayBuffer());
      await t.call("data.url_ingest", {
        url: i,
        // Python's cache key = original URL
        bytes_b64: _d(s),
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
function nm(e) {
  const t = [], n = /ImportFileURL\s*\(\s*(['"])([^'"\n]+)\1/g;
  let r;
  for (; (r = n.exec(e)) !== null; ) t.push(r[2]);
  return t;
}
function _d(e) {
  let t = "";
  for (let r = 0; r < e.length; r += 32768)
    t += String.fromCharCode.apply(
      null,
      Array.from(e.subarray(r, r + 32768))
    );
  return btoa(t);
}
const rm = /\bImport[A-Za-z0-9]*\s*\(\s*[uUrRbB]?(['"])([^'"\n]+)\1/g;
function lm(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e.matchAll(rm)) {
    const r = n[2];
    /^[a-z][a-z0-9+.-]*:\/\//i.test(r) || /\.[A-Za-z0-9]+$/.test(r) && t.add(r);
  }
  return [...t];
}
async function im(e, t, n = {}, r = fetch) {
  const l = lm(e);
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
var Cd = { exports: {} }, Kl = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var om = E, am = Symbol.for("react.element"), sm = Symbol.for("react.fragment"), um = Object.prototype.hasOwnProperty, cm = om.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, dm = { key: !0, ref: !0, __self: !0, __source: !0 };
function jd(e, t, n) {
  var r, l = {}, i = null, o = null;
  n !== void 0 && (i = "" + n), t.key !== void 0 && (i = "" + t.key), t.ref !== void 0 && (o = t.ref);
  for (r in t) um.call(t, r) && !dm.hasOwnProperty(r) && (l[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) l[r] === void 0 && (l[r] = t[r]);
  return { $$typeof: am, type: e, key: i, ref: o, props: l, _owner: cm.current };
}
Kl.Fragment = sm;
Kl.jsx = jd;
Kl.jsxs = jd;
Cd.exports = Kl;
var d = Cd.exports;
function fm(e, t) {
  const n = new Map(t.map((l) => [l.path, l])), r = [];
  for (const l of e) {
    const i = n.get(l.path);
    if (!i) continue;
    const o = Math.min(l.value, i.value), a = Math.max(l.value, i.value);
    !(a > o) || !Number.isFinite(o) || !Number.isFinite(a) || (r.push({ path: `${l.path}/min`, value: o }), r.push({ path: `${l.path}/max`, value: a }));
  }
  return r;
}
function pm(e) {
  const t = [];
  for (const n of new Set(e))
    t.push({ path: `${n}/min`, value: "Auto" }), t.push({ path: `${n}/max`, value: "Auto" });
  return t;
}
function hm(e, t, n) {
  const r = new Map(t.map((i) => [i.path, i])), l = [];
  for (const i of e) {
    const o = r.get(i.path), a = n.get(i.path);
    if (!o || !a) continue;
    const s = i.value - o.value;
    Number.isFinite(s) && (l.push({ path: `${i.path}/min`, value: a.min + s }), l.push({ path: `${i.path}/max`, value: a.max + s }));
  }
  return l;
}
function mm(e, t, n, r, l) {
  const i = new Map(t.map((u) => [u.path, u])), o = new Map(n.map((u) => [u.path, u])), a = new Map(r.map((u) => [u.path, u])), s = [];
  for (const u of e) {
    const f = i.get(u.path), p = o.get(u.path), c = a.get(u.path), v = l.get(u.path);
    if (!f || !p || !c || !v) continue;
    const y = u.value, x = f.value, j = p.value, h = c.value - j;
    if (!Number.isFinite(h) || h === 0) continue;
    const g = (x - y) / h;
    if (!Number.isFinite(g) || g <= 0) continue;
    const w = y + g * (v.min - j), C = y + g * (v.max - j);
    if (!Number.isFinite(w) || !Number.isFinite(C)) continue;
    const T = Math.min(w, C), P = Math.max(w, C);
    P > T && (s.push({ path: `${u.path}/min`, value: T }), s.push({ path: `${u.path}/max`, value: P }));
  }
  return s;
}
function gm(e) {
  const t = (i) => {
    const o = Math.abs(i);
    return o !== 0 && (o < 1e-3 || o >= 1e5) ? i.toExponential(3) : Number(i.toPrecision(5)).toString();
  }, n = e.find((i) => i.direction === "horizontal"), r = e.find((i) => i.direction === "vertical"), l = [];
  return n && l.push(`x: ${t(n.value)}`), r && l.push(`y: ${t(r.value)}`), l.join("   ");
}
const Pd = 96, vm = 1, ym = 3;
function zd() {
  const e = typeof window < "u" ? window.devicePixelRatio : 2;
  return !Number.isFinite(e) || e <= 0 ? 1 : Math.min(ym, Math.max(vm, e));
}
const bs = 4, Hs = 4096;
function Nd({
  store: e,
  width: t,
  height: n
}) {
  const r = e((S) => S.render), l = e((S) => S.tree), i = e((S) => S.currentPage), o = e((S) => S.values), a = e((S) => S.requestRender), s = E.useRef(null), u = E.useRef(null), f = E.useRef(null), p = E.useMemo(() => zd(), []), c = E.useMemo(() => {
    let S = Math.max(1, Math.round(t * p)), F = Math.max(1, Math.round(n * p));
    const L = Math.max(S, F);
    if (L > Hs) {
      const U = Hs / L;
      S = Math.round(S * U), F = Math.round(F * U);
    }
    return { w: S, h: F };
  }, [t, n, p]), v = Math.round(Pd * (c.w / Math.max(t, 1))), [y, x] = E.useState({ w: t, h: n }), [j, m] = E.useState(null), [h, g] = E.useState(null), [w, C] = E.useState(null), T = E.useRef(/* @__PURE__ */ new Set()), P = E.useRef(null), N = E.useRef(null), _ = E.useRef(/* @__PURE__ */ new Map()), z = E.useRef(0);
  E.useEffect(() => {
    const S = u.current;
    if (!S) return;
    const F = t > 0 ? n / t : 0.7143, L = () => {
      const A = S.clientWidth, I = S.clientHeight;
      let V, Q;
      if (A > 0 && I > 0) {
        const b = Math.min(A / t, I / n);
        V = t * b, Q = n * b;
      } else A > 0 ? (V = A, Q = A * F) : (V = t, Q = n);
      x((b) => Math.abs(b.w - V) < 0.5 && Math.abs(b.h - Q) < 0.5 ? b : { w: V, h: Q });
    };
    if (L(), typeof ResizeObserver > "u") return;
    const U = new ResizeObserver(L);
    return U.observe(S), () => U.disconnect();
  }, [t, n]), E.useEffect(() => {
    l && l.children.length > 0 && a(i, c.w, c.h, v);
  }, [l, o, i, c.w, c.h, a]), E.useEffect(() => {
    const S = r == null ? void 0 : r.sceneB64, F = s.current;
    if (!S || !F) return;
    let L = !1;
    return (async () => {
      var U;
      try {
        const { renderSceneToCanvas: A } = await Promise.resolve().then(() => Ed);
        L || await A(F, S, [1, 1, 1, 1]);
      } catch (A) {
        if (!L) {
          const I = A, V = (I == null ? void 0 : I.message) || ((U = I == null ? void 0 : I.toString) == null ? void 0 : U.call(I)) || String(A);
          console.error("embed scene render failed:", V), I != null && I.stack && console.error(I.stack);
        }
      }
    })(), () => {
      L = !0;
    };
  }, [r == null ? void 0 : r.sceneB64]);
  const W = () => e.getState().rpc, re = (S, F) => {
    const U = s.current.getBoundingClientRect();
    return [
      (S - U.left) * (c.w / (U.width || 1)),
      (F - U.top) * (c.h / (U.height || 1))
    ];
  }, ke = async (S) => {
    await e.getState().setValues(S), a(i, c.w, c.h, v);
  }, Yt = () => {
    const S = s.current;
    if (!S) return;
    const F = [..._.current.keys()];
    if (F.length < 2) return;
    const [L, U] = F, A = _.current.get(L), I = _.current.get(U), V = S.getBoundingClientRect(), Q = A.clientX - V.left, b = A.clientY - V.top, ue = I.clientX - V.left, Dt = I.clientY - V.top;
    N.current = {
      id1: L,
      id2: U,
      startDist: Math.hypot(ue - Q, Dt - b) || 1,
      startCx: (Q + ue) / 2,
      startCy: (b + Dt) / 2
    }, P.current = null, m(null), (async () => {
      const [Rt, Tn] = [re(A.clientX, A.clientY), re(I.clientX, I.clientY)], [_r, Ca] = await Promise.all([
        W().render.pixelToData(Rt[0], Rt[1]),
        W().render.pixelToData(Tn[0], Tn[1])
      ]);
      if (!N.current) return;
      N.current.data1 = _r.axes, N.current.data2 = Ca.axes;
      const ja = /* @__PURE__ */ new Map();
      for (const Dn of new Set([..._r.axes, ...Ca.axes].map((Cr) => Cr.path))) {
        const Cr = await W().doc.get([`${Dn}/min`, `${Dn}/max`]), Pa = Number(Cr[`${Dn}/min`]), za = Number(Cr[`${Dn}/max`]);
        Number.isFinite(Pa) && Number.isFinite(za) && ja.set(Dn, { min: Pa, max: za });
      }
      N.current && (N.current.ranges = ja);
    })();
  }, Xt = () => {
    const S = N.current, F = s.current;
    if (!S || !F) return;
    const L = _.current.get(S.id1), U = _.current.get(S.id2);
    if (!L || !U) return;
    const A = F.getBoundingClientRect(), I = L.clientX - A.left, V = L.clientY - A.top, Q = U.clientX - A.left, b = U.clientY - A.top, ue = Math.hypot(Q - I, b - V) || 1;
    C({
      scale: ue / S.startDist,
      ox: S.startCx,
      oy: S.startCy,
      tx: (I + Q) / 2 - S.startCx,
      ty: (V + b) / 2 - S.startCy
    });
  }, zn = (S, F) => {
    const L = N.current;
    if (N.current = null, C(null), !L || !L.data1 || !L.data2 || !L.ranges) return;
    const U = L.id1 === F ? S : _.current.get(L.id1), A = L.id2 === F ? S : _.current.get(L.id2);
    if (!U || !A) return;
    const I = re(U.clientX, U.clientY), V = re(A.clientX, A.clientY);
    (async () => {
      const [Q, b] = await Promise.all([
        W().render.pixelToData(I[0], I[1]),
        W().render.pixelToData(V[0], V[1])
      ]), ue = mm(L.data1, L.data2, Q.axes, b.axes, L.ranges);
      ue.length && await ke(ue);
    })();
  }, Nn = (S) => {
    var A, I;
    if ((I = (A = S.currentTarget).setPointerCapture) == null || I.call(A, S.pointerId), _.current.set(S.pointerId, { clientX: S.clientX, clientY: S.clientY }), _.current.size >= 2) {
      Yt();
      return;
    }
    const [F, L] = re(S.clientX, S.clientY), U = S.pointerType === "mouse" ? S.shiftKey || S.button === 1 : !0;
    P.current = { pointerId: S.pointerId, mode: U ? "pan" : "zoom", sx: F, sy: L, moved: !1 }, U && W().render.pixelToData(F, L).then(async (V) => {
      if (!P.current) return;
      P.current.from = V.axes;
      const Q = /* @__PURE__ */ new Map();
      for (const b of V.axes) {
        const ue = await W().doc.get([`${b.path}/min`, `${b.path}/max`]), Dt = Number(ue[`${b.path}/min`]), Rt = Number(ue[`${b.path}/max`]);
        Number.isFinite(Dt) && Number.isFinite(Rt) && Q.set(b.path, { min: Dt, max: Rt });
      }
      P.current && (P.current.ranges = Q);
    });
  }, D = (S) => {
    if (_.current.has(S.pointerId) && _.current.set(S.pointerId, { clientX: S.clientX, clientY: S.clientY }), N.current) {
      Xt();
      return;
    }
    const F = P.current;
    if (F && F.pointerId === S.pointerId) {
      const [I, V] = re(S.clientX, S.clientY);
      (Math.abs(I - F.sx) > bs || Math.abs(V - F.sy) > bs) && (F.moved = !0), F.mode === "zoom" && F.moved && m({ x0: F.sx, y0: F.sy, x1: I, y1: V });
      return;
    }
    if (S.pointerType !== "mouse" || S.buttons !== 0) return;
    const L = performance.now();
    if (L - z.current < 40) return;
    z.current = L;
    const [U, A] = re(S.clientX, S.clientY);
    W().render.pixelToData(U, A).then((I) => {
      var Tn;
      I.axes.forEach((_r) => T.current.add(_r.path));
      const V = gm(I.axes);
      if (!V) {
        g(null);
        return;
      }
      const Q = ((Tn = f.current) == null ? void 0 : Tn.getBoundingClientRect()) ?? { left: 0, top: 0, width: 0, height: 0 }, b = S.clientX - Q.left, ue = S.clientY - Q.top, Dt = Q.width > 0 && b > Q.width * 0.6, Rt = Q.height > 0 && ue > Q.height * 0.85;
      g({
        ...Dt ? { right: Math.max(4, Q.width - b + 12) } : { left: b + 12 },
        top: Rt ? Math.max(4, ue - 22) : ue + 12,
        text: V
      });
    });
  }, M = (S) => {
    var I, V;
    (V = (I = S.currentTarget).releasePointerCapture) == null || V.call(I, S.pointerId);
    const F = _.current.get(S.pointerId) ?? { clientX: S.clientX, clientY: S.clientY };
    if (N.current) {
      zn(F, S.pointerId), _.current.delete(S.pointerId);
      return;
    }
    _.current.delete(S.pointerId);
    const L = P.current;
    if (!L || L.pointerId !== S.pointerId || (P.current = null, m(null), !L.moved)) return;
    const [U, A] = re(S.clientX, S.clientY);
    L.mode === "zoom" ? (async () => {
      const [Q, b] = await Promise.all([
        W().render.pixelToData(L.sx, L.sy),
        W().render.pixelToData(U, A)
      ]), ue = fm(Q.axes, b.axes);
      ue.length && await ke(ue);
    })() : L.mode === "pan" && L.from && L.ranges && (async () => {
      const Q = await W().render.pixelToData(U, A), b = hm(L.from, Q.axes, L.ranges);
      b.length && await ke(b);
    })();
  }, $ = (S) => {
    _.current.delete(S.pointerId), N.current = null, P.current = null, m(null), C(null);
  }, Z = () => {
    T.current.size && ke(pm(T.current));
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
        g(null);
      },
      children: /* @__PURE__ */ d.jsxs("div", { ref: f, style: { position: "relative", width: y.w, height: y.h }, children: [
        /* @__PURE__ */ d.jsx(
          "canvas",
          {
            ref: s,
            width: c.w,
            height: c.h,
            "data-testid": "embed-canvas",
            onPointerDown: Nn,
            onPointerMove: D,
            onPointerUp: M,
            onPointerCancel: $,
            onDoubleClick: Z,
            style: {
              width: "100%",
              height: "100%",
              display: "block",
              cursor: "crosshair",
              touchAction: "none",
              transform: w ? `translate(${w.tx}px, ${w.ty}px) scale(${w.scale})` : void 0,
              transformOrigin: w ? `${w.ox}px ${w.oy}px` : void 0
            }
          }
        ),
        j && /* @__PURE__ */ d.jsx("div", { "data-testid": "embed-zoomband", style: {
          position: "absolute",
          pointerEvents: "none",
          border: "1px solid #1f6feb",
          background: "rgba(31,111,235,0.12)",
          left: `${Math.min(j.x0, j.x1) / c.w * 100}%`,
          top: `${Math.min(j.y0, j.y1) / c.h * 100}%`,
          width: `${Math.abs(j.x1 - j.x0) / c.w * 100}%`,
          height: `${Math.abs(j.y1 - j.y0) / c.h * 100}%`
        } }),
        h && /* @__PURE__ */ d.jsx("div", { "data-testid": "embed-tooltip", style: {
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
function wm({
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
    Td,
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
function xm(e) {
  return e.shiftKey ? "range" : e.ctrlKey || e.metaKey ? "toggle" : "replace";
}
function Td({
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
      Sm,
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
        onClick: (f) => r(e.path, xm(f)),
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
      Td,
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
function Sm({
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
function Co({ schema: e, value: t, onChange: n }) {
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
      _o,
      {
        schema: e,
        value: t,
        onChange: n
      }
    )
  ] });
}
function km({ schema: e, value: t, onChange: n, siblings: r }) {
  if (!((r == null ? void 0 : r.mode) === "datetime"))
    return /* @__PURE__ */ d.jsx(Co, { schema: e, value: t, onChange: n });
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
function Em({ schema: e, value: t, onChange: n }) {
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
function ze({ schema: e, value: t, onChange: n, editable: r = !1 }) {
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
function _m({ schema: e, value: t, onChange: n }) {
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
        value: jm(r),
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
const Qs = /* @__PURE__ */ new Map(), Cm = {
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
function jm(e) {
  if (/^#[0-9a-fA-F]{6}$/.test(e)) return e;
  const t = Cm[e.toLowerCase()];
  if (t) return t;
  if (typeof document > "u") return "#000000";
  const n = Qs.get(e);
  if (n) return n;
  const r = document.createElement("div");
  r.style.color = e, r.style.display = "none", document.body.appendChild(r);
  const l = getComputedStyle(r).color;
  document.body.removeChild(r);
  const i = l.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!i) return "#000000";
  const o = "#" + [i[1], i[2], i[3]].map((a) => parseInt(a, 10).toString(16).padStart(2, "0")).join("");
  return Qs.set(e, o), o;
}
function br({
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
const Ys = /^(-?\d+(?:\.\d+)?)\s*(pt|cm|mm|in|%|\/)?$/;
function ji({ schema: e, value: t, onChange: n, allowAuto: r = !1 }) {
  const l = typeof t == "string" ? t : "", i = l.toLowerCase() === "auto", o = (() => {
    if (i) return { num: "", unit: "pt" };
    const c = l.match(Ys);
    return { num: (c == null ? void 0 : c[1]) ?? "", unit: (c == null ? void 0 : c[2]) ?? "pt" };
  })(), [a, s] = E.useState(o.num), [u, f] = E.useState(o.unit);
  E.useEffect(() => {
    if (i) return;
    const c = l.match(Ys);
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
function Pi({
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
function Pm({ schema: e, value: t, onChange: n }) {
  const r = zm(t), [l, i] = E.useState(r);
  E.useEffect(() => i(r), [r]);
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
function zm(e) {
  return typeof e == "string" ? e : e && typeof e == "object" && !Array.isArray(e) ? Object.entries(e).map(([t, n]) => `${t}=${n}`).join(`
`) : "";
}
function Nm({ schema: e, value: t, onChange: n }) {
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
function Tm({ schema: e, value: t, onChange: n }) {
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
function Dm({ schema: e, value: t, onChange: n }) {
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
function zi({ schema: e, value: t, onChange: n }) {
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
function Rm({ schema: e, value: t, onChange: n }) {
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
function Hr({ schema: e, value: t, onChange: n }) {
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
function Ni({
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
const Dd = {
  // Atomic
  str: Hr,
  "str-notes": Hr,
  bool: Em,
  int: _o,
  float: _o,
  "float-or-auto": Co,
  "int-or-auto": Co,
  "float-slider": Tm,
  distance: ji,
  "distance-or-auto": (e) => /* @__PURE__ */ d.jsx(ji, { ...e, allowAuto: !0 }),
  displacement: ji,
  choice: ze,
  "choice-or-more": (e) => /* @__PURE__ */ d.jsx(ze, { ...e, editable: !0 }),
  "float-choice": (e) => /* @__PURE__ */ d.jsx(ze, { ...e, editable: !0 }),
  color: _m,
  colormap: ze,
  marker: Rm,
  arrow: ze,
  "line-style": Dm,
  "fill-style": ze,
  "fill-style-ext": ze,
  "errorbar-style": ze,
  "align-horz": ze,
  "align-vert": ze,
  "align-horz-+manual": ze,
  "align-vert-+manual": ze,
  "font-family": Hr,
  "font-style": Hr,
  "rotate-interval": ze,
  "axis-bound": km,
  // List / composite
  "float-list": Nm,
  "float-dict": Pm,
  "str-multi": zi,
  "line-multi": zi,
  "fill-multi": zi,
  // Reference-by-path
  dataset: br,
  "dataset-multi": br,
  "dataset-extended": br,
  "dataset-or-str": br,
  "widget-path": Ni,
  "widget-choice": Ni,
  axis: Ni,
  // File-system
  filename: Pi,
  "filename-image": Pi,
  "filename-svg": Pi,
  // Internal — kept hidden by the inspector via `setting.hidden`,
  // but mapped here so the registry-coverage assertions report 100%.
  "backward-compat": () => null
};
new Set(
  Object.keys(Dd)
);
function Lm(e) {
  return Dd[e] ?? null;
}
function Mm(e) {
  var p;
  const t = e.widgetPaths[0], n = e.widgetPaths.length > 1, [r, l] = E.useState({}), i = (c, v) => r[c] ?? !Rd(v), o = (c, v) => l((y) => ({ ...y, [c]: v })), [a, s] = E.useState(!1), u = (c, v) => {
    var j;
    if (!n) {
      e.onChange(c, v);
      return;
    }
    const y = c.slice(t.length), x = e.widgetPaths.map((m) => ({ path: m + y, value: v }));
    (j = e.onChangeMany) == null || j.call(e, x);
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
          Md,
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
function Rd(e) {
  if (e.setnsmode) return e.setnsmode === "formatting";
  const t = e.settings.filter((n) => !n.hidden);
  return t.length > 0 ? t.every((n) => n.formatting) : e.subgroups.length > 0 ? e.subgroups.every(Rd) : !1;
}
function Ld(e, t, n) {
  for (const r of e.settings)
    if (!r.hidden && !Ea(r, n[yr(t, r.name)], r.mixed_value === !0))
      return !0;
  for (const r of e.subgroups)
    if (Ld(r, yr(t, r.name), n)) return !0;
  return !1;
}
function Md({ group: e, basePath: t, widgetPath: n, values: r, datasets: l, onChange: i, settingMenu: o, groupLabel: a, groupOpen: s, setGroupOpen: u, hideDefaults: f }) {
  return /* @__PURE__ */ d.jsxs(E.Fragment, { children: [
    e.settings.map((p) => {
      if (p.hidden) return null;
      const c = r[yr(t, p.name)];
      return f && Ea(p, c, p.mixed_value === !0) ? null : /* @__PURE__ */ d.jsx(
        $m,
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
      const c = p.usertext || Fm(p.name), v = yr(t, p.name), y = Ld(p, v, r);
      if (f && !y) return null;
      const x = f ? y : s(v, p);
      return /* @__PURE__ */ d.jsxs(
        "details",
        {
          "data-testid": `subgroup-${p.name}`,
          "data-customised": y || void 0,
          open: x,
          onToggle: (j) => {
            const m = j.currentTarget, h = typeof m.open == "boolean" ? m.open : m.hasAttribute("open");
            h !== x && u(v, h);
          },
          children: [
            /* @__PURE__ */ d.jsx("summary", { style: { opacity: y ? 1 : 0.5, fontWeight: y ? 600 : 400 }, children: c }),
            /* @__PURE__ */ d.jsx(
              Md,
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
function Im(e, t) {
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
function Ea(e, t, n) {
  return n ? !1 : t === void 0 ? !0 : Im(t, e.default);
}
function Xs(e) {
  return {
    borderLeft: `2px solid ${e ? "transparent" : "#1f6feb"}`,
    paddingLeft: 6,
    opacity: e ? 0.5 : 1
  };
}
function $m({
  schema: e,
  basePath: t,
  widgetPath: n,
  value: r,
  datasets: l,
  onChange: i,
  settingMenu: o,
  groupLabel: a
}) {
  const s = Lm(e.typename), u = yr(t, e.name), f = Om(e, a), p = e.mixed_value === !0, c = Ea(e, r, p), v = (y) => o ? o(
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
      style: Xs(c),
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
      style: Xs(c),
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
function yr(e, t) {
  return e === "/" ? "/" + t : e + "/" + t;
}
function Fm(e) {
  if (!e) return e;
  const t = e.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
const Am = /* @__PURE__ */ new Set(["color", "hide", "width", "style"]);
function Om(e, t) {
  const n = e.usertext || e.name;
  return t ? Am.has(e.name) ? `${t} ${n.toLowerCase()}` : n : e.name === "color" && e.descr ? e.descr : n;
}
function Um({
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
  return /* @__PURE__ */ d.jsxs("div", { "data-testid": `datadlg-${t}`, style: { minWidth: 380, fontSize: 13 }, children: [
    t === "create1d" && /* @__PURE__ */ d.jsx(Bm, { rpc: a, busy: i, run: s }),
    t === "create2d" && /* @__PURE__ */ d.jsx(Wm, { rpc: a, busy: i, run: s }),
    t === "filter" && /* @__PURE__ */ d.jsx(Vm, { rpc: a, datasets: l.datasets.map((u) => u.name), busy: i, run: s }),
    t === "histogram" && /* @__PURE__ */ d.jsx(bm, { rpc: a, datasets: l.datasets.map((u) => u.name), busy: i, run: s })
  ] });
}
function Bm({ rpc: e, busy: t, run: n }) {
  const [r, l] = E.useState("newdata"), [i, o] = E.useState("expression"), [a, s] = E.useState(""), [u, f] = E.useState(100), [p, c] = E.useState(0), [v, y] = E.useState(1);
  return /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
    /* @__PURE__ */ d.jsx(ge, { label: "Name", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "dc-name", value: r, onChange: (x) => l(x.target.value) }) }),
    /* @__PURE__ */ d.jsx(ge, { label: "Method", children: /* @__PURE__ */ d.jsxs("select", { "data-testid": "dc-mode", value: i, onChange: (x) => o(x.target.value), children: [
      /* @__PURE__ */ d.jsx("option", { value: "expression", children: "Expression" }),
      /* @__PURE__ */ d.jsx("option", { value: "range", children: "Range (linspace)" }),
      /* @__PURE__ */ d.jsx("option", { value: "parametric", children: "Parametric" })
    ] }) }),
    (i === "expression" || i === "parametric") && /* @__PURE__ */ d.jsx(ge, { label: "Expression", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "dc-expr", value: a, onChange: (x) => s(x.target.value), placeholder: i === "parametric" ? "cos(t)" : "x*2 + 1" }) }),
    (i === "range" || i === "parametric") && /* @__PURE__ */ d.jsxs(ge, { label: "Steps / min / max", children: [
      /* @__PURE__ */ d.jsx("input", { "data-testid": "dc-nsteps", type: "number", value: u, onChange: (x) => f(+x.target.value), style: ol }),
      /* @__PURE__ */ d.jsx("input", { "data-testid": "dc-min", type: "number", value: p, onChange: (x) => c(+x.target.value), style: ol }),
      /* @__PURE__ */ d.jsx("input", { "data-testid": "dc-max", type: "number", value: v, onChange: (x) => y(+x.target.value), style: ol })
    ] }),
    /* @__PURE__ */ d.jsx(Gl, { busy: t, testid: "dc-create", onClick: () => n(() => e.data.create({ name: r, mode: i, expr: a, nsteps: u, min: p, max: v })) })
  ] });
}
function Wm({ rpc: e, busy: t, run: n }) {
  const [r, l] = E.useState("newdata2d"), [i, o] = E.useState("x+y"), [a, s] = E.useState("0,1,0.1"), [u, f] = E.useState("0,1,0.1");
  return /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
    /* @__PURE__ */ d.jsx(ge, { label: "Name", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "d2-name", value: r, onChange: (p) => l(p.target.value) }) }),
    /* @__PURE__ */ d.jsx(ge, { label: "z = f(x, y)", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "d2-expr", value: i, onChange: (p) => o(p.target.value) }) }),
    /* @__PURE__ */ d.jsx(ge, { label: "x min,max,step", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "d2-xstep", value: a, onChange: (p) => s(p.target.value) }) }),
    /* @__PURE__ */ d.jsx(ge, { label: "y min,max,step", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "d2-ystep", value: u, onChange: (p) => f(p.target.value) }) }),
    /* @__PURE__ */ d.jsx(Gl, { busy: t, testid: "d2-create", onClick: () => n(() => e.data.create2d({
      name: r,
      mode: "xyfunc",
      expr: i,
      xstep: a.split(",").map(Number),
      ystep: u.split(",").map(Number)
    })) })
  ] });
}
function Vm({ rpc: e, datasets: t, busy: n, run: r }) {
  const [l, i] = E.useState(""), [o, a] = E.useState([]), [s, u] = E.useState("f_"), [f, p] = E.useState(!1);
  return /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
    /* @__PURE__ */ d.jsx(ge, { label: "Filter (e.g. x>0)", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "flt-expr", value: l, onChange: (c) => i(c.target.value) }) }),
    /* @__PURE__ */ d.jsx(ge, { label: "Datasets", children: /* @__PURE__ */ d.jsx(
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
    /* @__PURE__ */ d.jsx(ge, { label: "Prefix", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "flt-prefix", value: s, onChange: (c) => u(c.target.value) }) }),
    /* @__PURE__ */ d.jsx(ge, { label: "Invert", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "flt-invert", type: "checkbox", checked: f, onChange: (c) => p(c.target.checked) }) }),
    /* @__PURE__ */ d.jsx(Gl, { busy: n, testid: "flt-run", onClick: () => r(() => e.data.filter({ filter: l, datasets: o, prefix: s, invert: f })) })
  ] });
}
function bm({ rpc: e, datasets: t, busy: n, run: r }) {
  const [l, i] = E.useState(t[0] ?? ""), [o, a] = E.useState("bins"), [s, u] = E.useState("counts"), [f, p] = E.useState(10), [c, v] = E.useState("counts");
  return /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
    /* @__PURE__ */ d.jsx(ge, { label: "Input dataset/expr", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "hist-expr", value: l, onChange: (y) => i(y.target.value) }) }),
    /* @__PURE__ */ d.jsxs(ge, { label: "Out bins / values", children: [
      /* @__PURE__ */ d.jsx("input", { "data-testid": "hist-outbins", value: o, onChange: (y) => a(y.target.value) }),
      /* @__PURE__ */ d.jsx("input", { "data-testid": "hist-outvals", value: s, onChange: (y) => u(y.target.value) })
    ] }),
    /* @__PURE__ */ d.jsx(ge, { label: "Bins", children: /* @__PURE__ */ d.jsx("input", { "data-testid": "hist-bins", type: "number", value: f, onChange: (y) => p(+y.target.value), style: ol }) }),
    /* @__PURE__ */ d.jsx(ge, { label: "Method", children: /* @__PURE__ */ d.jsxs("select", { "data-testid": "hist-method", value: c, onChange: (y) => v(y.target.value), children: [
      /* @__PURE__ */ d.jsx("option", { value: "counts", children: "Counts" }),
      /* @__PURE__ */ d.jsx("option", { value: "density", children: "Density" }),
      /* @__PURE__ */ d.jsx("option", { value: "fractions", children: "Fractions" })
    ] }) }),
    /* @__PURE__ */ d.jsx(Gl, { busy: n, testid: "hist-run", onClick: () => r(() => e.data.histogram({ expr: l, outbins: o, outvals: s, bins: f, method: c })) })
  ] });
}
function ge({ label: e, children: t }) {
  return /* @__PURE__ */ d.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }, children: [
    /* @__PURE__ */ d.jsx("span", { style: { flex: 1 }, children: e }),
    /* @__PURE__ */ d.jsx("span", { style: { display: "flex", gap: 4 }, children: t })
  ] });
}
function Gl({ busy: e, onClick: t, testid: n }) {
  return /* @__PURE__ */ d.jsx("div", { style: { textAlign: "right", marginTop: 8 }, children: /* @__PURE__ */ d.jsx("button", { type: "button", "data-testid": n, disabled: e, onClick: t, children: e ? "Working…" : "Create" }) });
}
const ol = { width: 70 }, Hm = 1e5;
function Qm({
  store: e,
  notify: t,
  initialName: n
}) {
  const r = e(), l = r.datasets.map((g) => g.name), [i, o] = E.useState(n ?? r.selectedDatasets[0] ?? l[0] ?? ""), [a, s] = E.useState(""), [u, f] = E.useState(0), [p, c] = E.useState(0), [v, y] = E.useState(!1), [x, j] = E.useState(!1);
  E.useEffect(() => {
    if (!i) return;
    let g = !1;
    return y(!0), r.rpc.data.peek(i, 0, Hm).then((w) => {
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
    j(!0);
    try {
      await r.rpc.data.set(i, g), await r.refreshDatasets(), t(`Saved ${i} (${g.length} values)`);
    } catch (w) {
      t(w.message);
    } finally {
      j(!1);
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
const Ks = [
  { id: "definition", label: "Definitions", nameHint: "pi  or  f(x)", valHint: "3.14159  or  x**2" },
  { id: "import", label: "Imports", nameHint: "numpy", valHint: "arange, sin" },
  { id: "color", label: "Colors", nameHint: "brand", valHint: "#ff8800" }
];
function Ym({
  store: e,
  notify: t
}) {
  const n = e.getState().rpc, [r, l] = E.useState("definition"), [i, o] = E.useState([]), [a, s] = E.useState(!1);
  E.useEffect(() => {
    let c = !1;
    return n.doc.getCustoms().then((v) => {
      c || o((v[r] ?? []).map(([y, x]) => [y, String(x)]));
    }).catch((v) => t(v.message)), () => {
      c = !0;
    };
  }, [r]);
  const u = (c, v, y) => o((x) => x.map((j, m) => m === c ? v === 0 ? [y, j[1]] : [j[0], y] : j)), f = async () => {
    s(!0);
    try {
      const c = i.filter(([v]) => v.trim());
      await n.doc.setCustoms(r, c), t(`Saved ${c.length} ${r}(s)`);
    } catch (c) {
      t(c.message);
    } finally {
      s(!1);
    }
  }, p = Ks.find((c) => c.id === r);
  return /* @__PURE__ */ d.jsxs("div", { "data-testid": "custom", style: { minWidth: 420, fontSize: 13 }, children: [
    /* @__PURE__ */ d.jsx("div", { style: { display: "flex", gap: 4, marginBottom: 8 }, children: Ks.map((c) => /* @__PURE__ */ d.jsx(
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
        /* @__PURE__ */ d.jsx("td", { children: /* @__PURE__ */ d.jsx("button", { type: "button", "data-testid": `custom-del-${v}`, onClick: () => o((y) => y.filter((x, j) => j !== v)), children: "✕" }) })
      ] }, v)) })
    ] }),
    /* @__PURE__ */ d.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 8 }, children: [
      /* @__PURE__ */ d.jsx("button", { type: "button", "data-testid": "custom-add", onClick: () => o((c) => [...c, ["", ""]]), children: "+ Add" }),
      /* @__PURE__ */ d.jsx("button", { type: "button", "data-testid": "custom-save", disabled: a, onClick: () => void f(), children: a ? "Saving…" : "Save" })
    ] })
  ] });
}
async function et(e, t) {
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
const Gt = (e) => e.selected.length > 0, Id = [
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
function Xm() {
  const e = {};
  for (const { items: t } of Id)
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
const Zl = {
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
    run: ({ store: e }) => et("undo", e)
  },
  "edit.redo": {
    id: "edit.redo",
    label: "Redo",
    shortcut: "Ctrl+Shift+Z",
    enabled: (e) => e.canRedo,
    run: ({ store: e }) => et("redo", e)
  },
  "edit.cut": {
    id: "edit.cut",
    label: "Cut",
    shortcut: "Ctrl+X",
    enabled: Gt,
    run: ({ store: e }) => et("cut", e)
  },
  "edit.copy": {
    id: "edit.copy",
    label: "Copy",
    shortcut: "Ctrl+C",
    enabled: Gt,
    run: ({ store: e }) => et("copy", e)
  },
  "edit.paste": {
    id: "edit.paste",
    label: "Paste",
    shortcut: "Ctrl+V",
    enabled: Gt,
    run: ({ store: e }) => et("paste", e)
  },
  "edit.copyimage": {
    id: "edit.copyimage",
    label: "Copy as image",
    shortcut: "Ctrl+Alt+C",
    enabled: (e) => !!e.render,
    run: ({ store: e }) => et("copyAsImage", e)
  },
  "edit.delete": {
    id: "edit.delete",
    label: "Delete",
    shortcut: "Del",
    enabled: Gt,
    run: ({ store: e }) => et("delete", e)
  },
  "edit.moveup": {
    id: "edit.moveup",
    label: "Move up",
    shortcut: "Ctrl+Shift+PgUp",
    enabled: Gt,
    run: ({ store: e }) => et("moveUp", e)
  },
  "edit.movedown": {
    id: "edit.movedown",
    label: "Move down",
    shortcut: "Ctrl+Shift+PgDn",
    enabled: Gt,
    run: ({ store: e }) => et("moveDown", e)
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
  ...Xm()
};
function jo(e, t) {
  return typeof e.label == "function" ? e.label(t) : e.label;
}
function $d({ store: e, ctx: t, density: n, onReload: r }) {
  var s;
  const l = e(), i = ((s = l.tree) == null ? void 0 : s.children.length) ?? 0, o = n === "inline", a = l.datasets.some((u) => u.linked);
  return /* @__PURE__ */ d.jsxs(
    "div",
    {
      "data-testid": o ? "embed-toolbar-inline" : "embed-toolbar-full",
      style: o ? qm : eg,
      children: [
        /* @__PURE__ */ d.jsx(Gm, { state: l, ctx: t, compact: o }),
        /* @__PURE__ */ d.jsx(Ke, { id: "edit.undo", state: l, ctx: t, label: "↶", title: "Undo" }),
        /* @__PURE__ */ d.jsx(Ke, { id: "edit.redo", state: l, ctx: t, label: "↷", title: "Redo" }),
        a && /* @__PURE__ */ d.jsx(Km, { ctx: t, compact: o, onReload: r }),
        !o && /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
          /* @__PURE__ */ d.jsx(Qr, {}),
          /* @__PURE__ */ d.jsx(Ke, { id: "edit.cut", state: l, ctx: t, label: "✂ Cut" }),
          /* @__PURE__ */ d.jsx(Ke, { id: "edit.copy", state: l, ctx: t, label: "⧉ Copy" }),
          /* @__PURE__ */ d.jsx(Ke, { id: "edit.paste", state: l, ctx: t, label: "↥ Paste" }),
          /* @__PURE__ */ d.jsx(Ke, { id: "edit.delete", state: l, ctx: t, label: "🗑 Delete" }),
          /* @__PURE__ */ d.jsx(Qr, {}),
          /* @__PURE__ */ d.jsx(Ke, { id: "edit.moveup", state: l, ctx: t, label: "▲", title: "Move up" }),
          /* @__PURE__ */ d.jsx(Ke, { id: "edit.movedown", state: l, ctx: t, label: "▼", title: "Move down" }),
          /* @__PURE__ */ d.jsx(Qr, {}),
          /* @__PURE__ */ d.jsx(Jm, { state: l, ctx: t }),
          i > 1 && /* @__PURE__ */ d.jsxs(d.Fragment, { children: [
            /* @__PURE__ */ d.jsx(Qr, {}),
            /* @__PURE__ */ d.jsx(Ke, { id: "view.prevpage", state: l, ctx: t, label: "◀", title: "Previous page" }),
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
            /* @__PURE__ */ d.jsx(Ke, { id: "view.nextpage", state: l, ctx: t, label: "▶", title: "Next page" })
          ] })
        ] })
      ]
    }
  );
}
function Ke({
  id: e,
  state: t,
  ctx: n,
  label: r,
  title: l
}) {
  const i = Zl[e];
  if (!i || !(i.visible ? i.visible(t) : !0)) return null;
  const a = i.enabled ? i.enabled(t) : !0, s = r ?? jo(i, t), u = l ?? jo(i, t) + (i.shortcut ? `  (${i.shortcut})` : "");
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
      style: Jl(a),
      children: s
    }
  );
}
function Qr() {
  return /* @__PURE__ */ d.jsx("span", { style: { width: 1, height: 18, background: "#e2e4e8" } });
}
function Km({
  ctx: e,
  compact: t,
  onReload: n
}) {
  const [r, l] = E.useState(!1), i = Zl["data.reload"], o = async () => {
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
      style: Jl(!r),
      children: [
        r ? "⟳" : "↻",
        t ? "" : " Reload"
      ]
    }
  );
}
function Gm({
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
  }, [r]), /* @__PURE__ */ d.jsxs("div", { ref: i, style: { position: "relative" }, "data-testid": "embed-insert", children: [
    /* @__PURE__ */ d.jsxs(
      "button",
      {
        type: "button",
        "data-testid": "embed-insert-btn",
        onClick: () => l((o) => !o),
        "aria-expanded": r,
        title: "Insert a new element",
        style: Jl(!0),
        children: [
          "＋ ",
          n ? "" : "Insert ",
          "▾"
        ]
      }
    ),
    r && /* @__PURE__ */ d.jsx("div", { role: "menu", "data-testid": "embed-insert-menu", style: Fd, children: Id.map((o) => /* @__PURE__ */ d.jsxs(E.Fragment, { children: [
      /* @__PURE__ */ d.jsx("div", { style: tg, children: o.group }),
      o.items.map(([a, s]) => {
        const u = `add.${a}`, f = Zl[u];
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
            style: Ad(p),
            children: s
          },
          a
        );
      })
    ] }, o.group)) })
  ] });
}
const Zm = [
  "data.create",
  "data.create2d",
  "data.filter",
  "data.histogram",
  "data.edit",
  "edit.custom"
];
function Jm({ state: e, ctx: t }) {
  const [n, r] = E.useState(!1), l = E.useRef(null);
  return E.useEffect(() => {
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
        style: Jl(!0),
        children: "∑ Data ▾"
      }
    ),
    n && /* @__PURE__ */ d.jsx("div", { role: "menu", "data-testid": "embed-data-menu", style: Fd, children: Zm.map((i) => {
      const o = Zl[i];
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
          style: Ad(a),
          children: jo(o, e)
        },
        i
      );
    }) })
  ] });
}
const qm = { display: "flex", gap: 4, alignItems: "center" }, eg = {
  display: "flex",
  gap: 4,
  alignItems: "center",
  flexWrap: "wrap"
}, Fd = {
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
}, tg = {
  fontSize: 10.5,
  color: "#888",
  textTransform: "uppercase",
  padding: "6px 6px 2px",
  letterSpacing: "0.04em"
}, Ad = (e) => ({
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
}), Jl = (e) => ({
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 9px",
  cursor: e ? "pointer" : "default",
  fontSize: 12,
  lineHeight: 1.2,
  background: "#fff",
  color: e ? "#222" : "#aaa"
});
function Od(e, t) {
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
function ng({
  store: e,
  title: t,
  width: n,
  height: r,
  toolbar: l,
  onReload: i,
  onClose: o
}) {
  const a = e((_) => _.tree), s = e((_) => _.selected), u = e((_) => _.schema), f = e((_) => _.values), p = e((_) => _.datasets), c = e((_) => _.error), [v, y] = E.useState(!1), [x, j] = E.useState(!1), [m, h] = E.useState(null);
  E.useEffect(() => {
    if (typeof document > "u") return;
    const _ = document.documentElement, z = document.body, W = _.style.overflow, re = z.style.overflow;
    return _.style.overflow = "hidden", z.style.overflow = "hidden", () => {
      _.style.overflow = W, z.style.overflow = re;
    };
  }, []);
  const g = async () => {
    j(!0);
    try {
      for (let _ = 0; _ < 1e3 && e.getState().canUndo; _++)
        await e.getState().undo();
    } finally {
      j(!1);
    }
  }, w = /* @__PURE__ */ new Set([
    "dataCreate",
    "dataCreate2d",
    "filter",
    "histogram",
    "dataEdit",
    "custom"
  ]), C = Od(e, {
    notify: (_) => e.setState({ error: _ }),
    openDialog: (_) => {
      w.has(_) ? h(_) : e.setState({ error: `"${_}" dialog is unavailable in the embed.` });
    },
    toggleFullScreen: () => y((_) => !_)
  }), T = {
    dataCreate: "create1d",
    dataCreate2d: "create2d",
    filter: "filter",
    histogram: "histogram"
  }, P = () => h(null), N = (_) => e.setState({ error: _ });
  return fd.createPortal(
    /* @__PURE__ */ d.jsx(
      "div",
      {
        "data-testid": "veusz-modal",
        style: lg,
        onMouseDown: (_) => {
          _.target === _.currentTarget && o();
        },
        children: /* @__PURE__ */ d.jsxs("div", { style: v ? ig : Ud, "data-testid": "veusz-modal-window", children: [
          /* @__PURE__ */ d.jsxs("header", { style: og, children: [
            /* @__PURE__ */ d.jsx("strong", { style: { fontSize: 14 }, children: t ?? "Edit figure" }),
            /* @__PURE__ */ d.jsx($d, { store: e, density: "full", ctx: C, onReload: i }),
            /* @__PURE__ */ d.jsx(
              "button",
              {
                type: "button",
                "data-testid": "veusz-reset",
                onClick: () => void g(),
                disabled: !e.getState().canUndo || x,
                style: Yr,
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
                onClick: () => y((_) => !_),
                style: Yr,
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
                style: Yr,
                title: "Close (Esc)",
                children: "✕"
              }
            )
          ] }),
          /* @__PURE__ */ d.jsxs("div", { style: ag, children: [
            /* @__PURE__ */ d.jsx("div", { style: sg, children: /* @__PURE__ */ d.jsx(Nd, { store: e, width: n, height: r }) }),
            /* @__PURE__ */ d.jsxs("aside", { style: ug, "data-testid": "veusz-edit-panel", children: [
              a ? /* @__PURE__ */ d.jsx(
                wm,
                {
                  root: a,
                  selected: s,
                  onSelect: (_) => {
                    e.getState().select([_]);
                  }
                }
              ) : /* @__PURE__ */ d.jsx("p", { style: { color: "#888" }, children: "Loading…" }),
              /* @__PURE__ */ d.jsx("hr", { style: { border: 0, borderTop: "1px solid #eee", margin: "8px 0" } }),
              u && s.length > 0 ? /* @__PURE__ */ d.jsx(
                Mm,
                {
                  schema: u,
                  widgetPaths: s,
                  values: f,
                  datasets: p.map((_) => _.name),
                  onChange: (_, z) => {
                    e.getState().setValue(_, z);
                  },
                  onChangeMany: (_) => {
                    e.getState().setValues(_);
                  }
                }
              ) : /* @__PURE__ */ d.jsx("p", { style: { color: "#888", fontSize: 13 }, children: "Select a widget to edit." })
            ] })
          ] }),
          m && /* @__PURE__ */ d.jsx(
            "div",
            {
              style: cg,
              onMouseDown: (_) => {
                _.target === _.currentTarget && P();
              },
              children: /* @__PURE__ */ d.jsxs(
                "div",
                {
                  style: dg,
                  "data-testid": `embed-dialog-${m}`,
                  children: [
                    /* @__PURE__ */ d.jsxs("div", { style: fg, children: [
                      /* @__PURE__ */ d.jsx("strong", { style: { fontSize: 13 }, children: rg[m] }),
                      /* @__PURE__ */ d.jsx("span", { style: { flex: 1 } }),
                      /* @__PURE__ */ d.jsx(
                        "button",
                        {
                          type: "button",
                          "data-testid": "embed-dialog-close",
                          onClick: P,
                          style: Yr,
                          children: "Close"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ d.jsxs("div", { style: { padding: 12 }, children: [
                      T[m] && /* @__PURE__ */ d.jsx(
                        Um,
                        {
                          store: e,
                          mode: T[m],
                          onClose: P,
                          notify: N
                        }
                      ),
                      m === "dataEdit" && /* @__PURE__ */ d.jsx(Qm, { store: e, notify: N }),
                      m === "custom" && /* @__PURE__ */ d.jsx(Ym, { store: e, notify: N })
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
const rg = {
  dataCreate: "Create dataset",
  dataCreate2d: "Create 2D dataset",
  filter: "Filter data",
  histogram: "Histogram",
  dataEdit: "Data editor",
  custom: "Custom definitions"
}, lg = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,17,21,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1e3,
  font: "14px system-ui, sans-serif"
}, Ud = {
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
}, ig = {
  ...Ud,
  width: "100vw",
  height: "100vh",
  borderRadius: 0,
  resize: "none"
}, og = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
  background: "#fafbfc",
  flex: "0 0 auto"
}, Yr = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
  padding: "3px 9px",
  lineHeight: 1
}, ag = {
  flex: "1 1 auto",
  display: "flex",
  minHeight: 0,
  alignItems: "stretch"
}, sg = {
  flex: "1 1 auto",
  minWidth: 0,
  minHeight: 0,
  padding: 10,
  background: "#fff"
}, ug = {
  flex: "0 0 320px",
  width: 320,
  borderLeft: "1px solid #eee",
  padding: 10,
  overflow: "auto",
  overscrollBehavior: "contain",
  background: "#fff"
}, cg = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.30)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10
}, dg = {
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  minWidth: 420,
  maxWidth: "90%",
  maxHeight: "85%",
  overflow: "auto"
}, fg = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderBottom: "1px solid #eee"
};
function Gs({ items: e, disabled: t, busy: n }) {
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
        style: pg,
        title: "Download this figure",
        children: n ? "…" : "⤓ Download ▾"
      }
    ),
    r && /* @__PURE__ */ d.jsx("div", { role: "menu", "data-testid": "veusz-download-menu", style: hg, children: e.map((o) => {
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
          style: Zs,
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
          style: Zs,
          children: a
        },
        s
      );
    }) })
  ] });
}
const pg = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 10px",
  cursor: "pointer",
  fontSize: 12,
  background: "#fff",
  color: "#222"
}, hg = {
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
}, Zs = {
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
}, Js = "veusz-embed-styles", mg = `
.vz-fig { position: relative; }
.vz-fig .vz-inline { display: block; }
.vz-fig .vz-preview { display: block; width: 100%; height: auto; background: #fff; }
`;
function Bd() {
  if (typeof document > "u" || document.getElementById(Js)) return;
  const e = document.createElement("style");
  e.id = Js, e.textContent = mg, document.head.appendChild(e);
}
const gn = 2;
async function gg(e, t) {
  const { rpc: n } = e.getState(), r = await n.render.scene(t.page, t.width, t.height, t.dpi ?? 96), l = await kd(r.scene_b64, r.width, r.height);
  wg(l, t.filename ?? "figure.svg", "image/svg+xml");
}
async function vg(e, t) {
  const { rpc: n } = e.getState(), r = t.width * gn, l = t.height * gn, i = await n.render.scene(t.page, r, l, (t.dpi ?? 96) * gn), o = await Xl(i.scene_b64, i.width, i.height, "image/png");
  _a(o, t.filename ?? "figure.png");
}
async function yg(e, t) {
  const { rpc: n } = e.getState(), r = t.width * gn, l = t.height * gn, i = await n.render.scene(t.page, r, l, (t.dpi ?? 96) * gn), o = await Xl(i.scene_b64, i.width, i.height, "image/jpeg"), a = new Uint8Array(await o.arrayBuffer()), s = xg(a, i.width, i.height, t.width, t.height);
  _a(new Blob([s], { type: "application/pdf" }), t.filename ?? "figure.pdf");
}
function wg(e, t, n) {
  _a(new Blob([e], { type: n }), t);
}
function _a(e, t) {
  const n = URL.createObjectURL(e), r = document.createElement("a");
  r.href = n, r.download = t, document.body.appendChild(r), r.click(), r.remove(), setTimeout(() => URL.revokeObjectURL(n), 1e3);
}
function xg(e, t, n, r, l) {
  const i = new TextEncoder(), o = [], a = [];
  let s = 0;
  const u = (j) => {
    const m = typeof j == "string" ? i.encode(j) : j;
    o.push(m), s += m.length;
  }, f = (j, m) => {
    a[j] = s, u(`${j} 0 obj
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
  for (let j = 1; j <= 5; j++) v += `${String(a[j]).padStart(10, "0")} 00000 n 
`;
  u(v), u(`trailer
<< /Size 6 /Root 1 0 R >>
startxref
${c}
%%EOF
`);
  const y = new Uint8Array(s);
  let x = 0;
  for (const j of o)
    y.set(j, x), x += j.length;
  return y;
}
Bd();
function Sg({
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
  const u = e((z) => z.error), f = e((z) => z.webgpuAvailable), p = e((z) => z.currentPage), [c, v] = E.useState(!!a), [y, x] = E.useState(!1), [j, m] = E.useState(!1), [h, g] = E.useState(i), w = E.useRef(null);
  E.useEffect(() => {
    Bd();
    const z = e.getState();
    return z.setBackend("vello-wasm"), z.probeWebgpu(), z.loadPlotPrefs(), z.refreshAll(), z.subscribeToDaemon();
  }, [e]), E.useEffect(() => {
    let z = !0;
    return Sd().then((W) => {
      z && x(W);
    }), () => {
      z = !1;
    };
  }, []), E.useEffect(() => () => {
    w.current && URL.revokeObjectURL(w.current);
  }, []);
  const C = (z) => `${(l ?? "figure").replace(/\s+/g, "_")}.${z}`, T = async (z, W) => {
    m(!0);
    try {
      await z();
    } catch (re) {
      e.setState({ error: `${W} failed: ${re.message}` });
    } finally {
      m(!1);
    }
  }, P = async () => {
    try {
      const z = zd(), W = Math.round(t * z), re = Math.round(n * z), ke = await e.getState().rpc.render.scene(p, W, re, Math.round(Pd * z)), Yt = await Xl(ke.scene_b64, ke.width, ke.height, "image/png"), Xt = URL.createObjectURL(Yt);
      w.current && URL.revokeObjectURL(w.current), w.current = Xt, g(Xt);
    } catch {
    }
  }, N = () => {
    v(!1), h !== void 0 && P();
  }, _ = () => {
    const z = [];
    return o && z.push({ label: "Veusz", href: o, download: C("vsz"), hint: ".vsz" }), y && z.push({ label: "SVG", hint: "vector", onSelect: () => void T(() => gg(e, { page: p, width: t, height: n, filename: C("svg") }), "SVG export") }), z.push({ label: "PNG", hint: "image", onSelect: () => void T(() => vg(e, { page: p, width: t, height: n, filename: C("png") }), "PNG export") }), z.push({ label: "PDF", hint: "page", onSelect: () => void T(() => yg(e, { page: p, width: t, height: n, filename: C("pdf") }), "PDF export") }), z;
  };
  return f === !1 ? /* @__PURE__ */ d.jsx("div", { "data-testid": "veusz-figure", className: "vz-fig", style: qs, children: /* @__PURE__ */ d.jsx("div", { "data-testid": "veusz-needs-webgpu", style: { padding: 16, color: "#b06000" }, children: "This interactive figure needs WebGPU. Open in Chrome or Safari 26+." }) }) : /* @__PURE__ */ d.jsxs("div", { "data-testid": "veusz-figure", className: "vz-fig", style: qs, children: [
    /* @__PURE__ */ d.jsxs("div", { className: "vz-toolbar", style: kg, children: [
      r && /* @__PURE__ */ d.jsx(
        $d,
        {
          store: e,
          density: "inline",
          ctx: Od(e, {
            notify: (z) => e.setState({ error: z })
          }),
          onReload: s
        }
      ),
      /* @__PURE__ */ d.jsx(Gs, { items: _(), busy: j }),
      r && /* @__PURE__ */ d.jsx(
        "button",
        {
          type: "button",
          "data-testid": "veusz-edit-toggle",
          onClick: () => v(!0),
          style: Eg,
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
      ) : /* @__PURE__ */ d.jsx("div", { style: { height: Math.round(n / t * 100) + "%", minHeight: 200 }, children: /* @__PURE__ */ d.jsx(Nd, { store: e, width: t, height: n }) }),
      u && !c && /* @__PURE__ */ d.jsx("div", { "data-testid": "veusz-error", style: _g, children: u })
    ] }),
    c && /* @__PURE__ */ d.jsx(
      ng,
      {
        store: e,
        title: l,
        width: t,
        height: n,
        toolbar: /* @__PURE__ */ d.jsx(Gs, { items: _(), busy: j }),
        onReload: s,
        onClose: N
      }
    )
  ] });
}
const qs = {
  position: "relative",
  border: "1px solid #e2e4e8",
  borderRadius: 10,
  overflow: "hidden",
  background: "#fff",
  font: "14px system-ui, sans-serif"
}, kg = {
  position: "absolute",
  top: 8,
  right: 8,
  zIndex: 3,
  display: "flex",
  gap: 6,
  alignItems: "flex-start"
}, Eg = {
  border: "1px solid #d0d3d9",
  borderRadius: 6,
  padding: "3px 10px",
  cursor: "pointer",
  fontSize: 12,
  background: "#fff",
  color: "#222"
}, _g = {
  position: "absolute",
  left: 8,
  bottom: 8,
  color: "crimson",
  fontSize: 12,
  background: "rgba(255,255,255,0.9)",
  padding: "2px 6px",
  borderRadius: 4
}, eu = "This interactive figure needs WebGPU. Open in Chrome or Safari 26+.";
class Cg extends HTMLElement {
  constructor() {
    super(...arguments);
    Rn(this, "root", null);
    Rn(this, "mounted", !1);
    Rn(this, "noteEl", null);
    Rn(this, "urlLinks", null);
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
    if (i.src = n, i.alt = this.getAttribute("title") ?? "Veusz figure", i.style.cssText = "display:block;width:100%;height:auto;", i.addEventListener("error", () => this.status(r.note ?? eu)), l.appendChild(i), r.onActivate) {
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
    if (!await xd()) {
      r ? this.showPoster(r, {
        note: "Static image — the interactive view needs WebGPU (Chrome or Safari 26+)."
      }) : this.status(eu);
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
      const i = await qh({
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
        urlMap: jg(this.getAttribute("data-url-map"))
      };
      await tm(a, i.transport, s);
      const u = await im(a, n, s);
      await i.loadVsz(a, u), this.urlLinks = await em(i.transport, s);
      const f = Hh(fh(i.transport));
      this.replaceChildren(), this.noteEl = null;
      const p = document.createElement("div");
      this.appendChild(p), this.root = pd(p);
      const c = async () => {
        var v;
        await ((v = this.urlLinks) == null ? void 0 : v.refresh()), await f.getState().reloadFile();
      };
      this.root.render(E.createElement(Sg, {
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
function jg(e) {
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
typeof customElements < "u" && !customElements.get("veusz-figure") && customElements.define("veusz-figure", Cg);
export {
  Cg as VeuszFigureElement
};
//# sourceMappingURL=veusz-embed.js.map
