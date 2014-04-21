var _ = function() {
    function n(n, t, r) {
        r = (r || 0) - 1;
        for (var e = n ? n.length : 0; ++r < e; ) if (n[r] === t) return r;
        return -1;
    }
    function t(t, r) {
        var e = typeof r;
        if (t = t.l, "boolean" == e || null == r) return t[r] ? 0 : -1;
        "number" != e && "string" != e && (e = "object");
        var u = "number" == e ? r : m + r;
        return t = (t = t[e]) && t[u], "object" == e ? t && -1 < n(t, r) ? 0 : -1 : t ? 0 : -1;
    }
    function r(n) {
        var t = this.l, r = typeof n;
        if ("boolean" == r || null == n) t[n] = true; else {
            "number" != r && "string" != r && (r = "object");
            var e = "number" == r ? n : m + n, t = t[r] || (t[r] = {});
            "object" == r ? (t[e] || (t[e] = [])).push(n) : t[e] = true;
        }
    }
    function e(n) {
        return n.charCodeAt(0);
    }
    function u(n, t) {
        for (var r = n.m, e = t.m, u = -1, o = r.length; ++u < o; ) {
            var i = r[u], f = e[u];
            if (i !== f) {
                if (i > f || typeof i == "undefined") return 1;
                if (i < f || typeof f == "undefined") return -1;
            }
        }
        return n.n - t.n;
    }
    function o(n) {
        var t = -1, e = n.length, u = n[0], o = n[e / 2 | 0], i = n[e - 1];
        if (u && typeof u == "object" && o && typeof o == "object" && i && typeof i == "object") return false;
        for (u = a(), u["false"] = u["null"] = u["true"] = u.undefined = false, o = a(), 
        o.k = n, o.l = u, o.push = r; ++t < e; ) o.push(n[t]);
        return o;
    }
    function i(n) {
        return "\\" + L[n];
    }
    function f() {
        return v.pop() || [];
    }
    function a() {
        return g.pop() || {
            k: null,
            l: null,
            m: null,
            "false": false,
            n: 0,
            "null": false,
            number: null,
            object: null,
            push: null,
            string: null,
            "true": false,
            undefined: false,
            o: null
        };
    }
    function l(n) {
        n.length = 0, v.length < d && v.push(n);
    }
    function c(n) {
        var t = n.l;
        t && c(t), n.k = n.l = n.m = n.object = n.number = n.string = n.o = null, g.length < d && g.push(n);
    }
    function p(n, t, r) {
        t || (t = 0), typeof r == "undefined" && (r = n ? n.length : 0);
        var e = -1;
        r = r - t || 0;
        for (var u = Array(0 > r ? 0 : r); ++e < r; ) u[e] = n[t + e];
        return u;
    }
    function s(r) {
        function v(n, t, r) {
            if (!n || !K[typeof n]) return n;
            t = t && typeof r == "undefined" ? t : Z(t, r, 3);
            var e = n.length;
            if (r = -1, e && vt(n)) for (;++r < e && (r += "", false !== t(n[r], r, n)); ) ; else for (r in e = typeof n == "function", 
            n) if ((!e || "prototype" != r) && vr.call(n, r) && false === t(n[r], r, n)) break;
            return n;
        }
        function g(n, t, r) {
            if (!n || !K[typeof n]) return n;
            t = t && typeof r == "undefined" ? t : Z(t, r, 3);
            var e = n.length;
            if (r = -1, e && vt(n)) for (;++r < e && (r += "", false !== t(n[r], r, n)); ) ; else for (r in e = typeof n == "function", 
            n) if ((!e || "prototype" != r) && false === t(n[r], r, n)) break;
            return n;
        }
        function d(n, t, r) {
            var e, u = n, o = u;
            if (!u) return o;
            for (var i = arguments, f = 0, a = typeof r == "number" ? 2 : i.length; ++f < a; ) if ((u = i[f]) && K[typeof u]) {
                var l = u.length;
                if (e = -1, l && vt(u)) for (;++e < l; ) e += "", "undefined" == typeof o[e] && (o[e] = u[e]); else for (e in l = typeof u == "function", 
                u) l && "prototype" == e || !vr.call(u, e) || "undefined" == typeof o[e] && (o[e] = u[e]);
            }
            return o;
        }
        function L(n, t, r) {
            var e, u = n, o = u;
            if (!u) return o;
            var i = arguments, f = 0, a = typeof r == "number" ? 2 : i.length;
            if (3 < a && "function" == typeof i[a - 2]) var l = Z(i[--a - 1], i[a--], 2); else 2 < a && "function" == typeof i[a - 1] && (l = i[--a]);
            for (;++f < a; ) if ((u = i[f]) && K[typeof u]) {
                var c = u.length;
                if (e = -1, c && vt(u)) for (;++e < c; ) e += "", o[e] = l ? l(o[e], u[e]) : u[e]; else for (e in c = typeof u == "function", 
                u) c && "prototype" == e || !vr.call(u, e) || (o[e] = l ? l(o[e], u[e]) : u[e]);
            }
            return o;
        }
        function V(n, t, r) {
            if (!n) return n;
            t = t && typeof r == "undefined" ? t : Z(t, r, 3);
            var e = n.length;
            if (r = -1, typeof e == "number") for (;++r < e && false !== t(n[r], r, n); ) ; else for (r in e = typeof n == "function", 
            n) if ((!e || "prototype" != r) && vr.call(n, r) && false === t(n[r], r, n)) break;
            return n;
        }
        function U(n) {
            var t, r = [];
            if (!n || !K[typeof n]) return r;
            var e = n.length;
            if (t = -1, e && vt(n)) for (;++t < e; ) t += "", r.push(t); else for (t in e = typeof n == "function", 
            n) e && "prototype" == t || !vr.call(n, t) || r.push(t);
            return r;
        }
        function G(n) {
            return n && typeof n == "object" && !Sr(n) && vr.call(n, "__wrapped__") ? n : new H(n);
        }
        function H(n, t) {
            this.__chain__ = !!t, this.__wrapped__ = n;
        }
        function Q(n) {
            function t() {
                if (e) {
                    var n = p(e);
                    gr.apply(n, arguments);
                }
                if (this instanceof t) {
                    var o = Y(r.prototype), n = r.apply(o, n || arguments);
                    return dt(n) ? n : o;
                }
                return r.apply(u, n || arguments);
            }
            var r = n[0], e = n[2], u = n[4];
            return t;
        }
        function X(n, t, r, e, u) {
            if (r) {
                var o = r(n);
                if (typeof o != "undefined") return o;
            }
            if (!dt(n)) return n;
            var i = ar.call(n);
            if (!z[i]) return n;
            var a = Ir[i];
            switch (i) {
              case $:
              case F:
                return new a(+n);

              case B:
              case q:
                return new a(n);

              case P:
                return o = a(n.source, C.exec(n)), o.lastIndex = n.lastIndex, o;
            }
            if (i = Sr(n), t) {
                var c = !e;
                e || (e = f()), u || (u = f());
                for (var s = e.length; s--; ) if (e[s] == n) return u[s];
                o = i ? a(n.length) : {};
            } else o = i ? p(n) : L({}, n);
            return i && (vr.call(n, "index") && (o.index = n.index), vr.call(n, "input") && (o.input = n.input)), 
            t ? (e.push(n), u.push(o), (i ? V : v)(n, function(n, i) {
                o[i] = X(n, t, r, e, u);
            }), c && (l(e), l(u)), o) : o;
        }
        function Y(n) {
            return dt(n) ? dr(n) : {};
        }
        function Z(n, t, r) {
            if (typeof n != "function") return Mt;
            if (typeof t == "undefined" || !("prototype" in n)) return n;
            switch (r) {
              case 1:
                return function(r) {
                    return n.call(t, r);
                };

              case 2:
                return function(r, e) {
                    return n.call(t, r, e);
                };

              case 3:
                return function(r, e, u) {
                    return n.call(t, r, e, u);
                };

              case 4:
                return function(r, e, u, o) {
                    return n.call(t, r, e, u, o);
                };
            }
            return Kt(n, t);
        }
        function nt(n) {
            function t() {
                var n = a ? i : this;
                if (u) {
                    var v = p(u);
                    gr.apply(v, arguments);
                }
                return (o || c) && (v || (v = p(arguments)), o && gr.apply(v, o), c && v.length < f) ? (e |= 16, 
                nt([ r, s ? e : -4 & e, v, null, i, f ])) : (v || (v = arguments), l && (r = n[h]), 
                this instanceof t ? (n = Y(r.prototype), v = r.apply(n, v), dt(v) ? v : n) : r.apply(n, v));
            }
            var r = n[0], e = n[1], u = n[2], o = n[3], i = n[4], f = n[5], a = 1 & e, l = 2 & e, c = 4 & e, s = 8 & e, h = r;
            return t;
        }
        function tt(r, e) {
            var u = -1, i = ct(), f = r ? r.length : 0, a = f >= b && i === n, l = [];
            if (a) {
                var p = o(e);
                p ? (i = t, e = p) : a = false;
            }
            for (;++u < f; ) p = r[u], 0 > i(e, p) && l.push(p);
            return a && c(e), l;
        }
        function rt(n, t, r, e) {
            e = (e || 0) - 1;
            for (var u = n ? n.length : 0, o = []; ++e < u; ) {
                var i = n[e];
                if (i && typeof i == "object" && typeof i.length == "number" && (Sr(i) || vt(i))) {
                    t || (i = rt(i, t, r));
                    var f = -1, a = i.length, l = o.length;
                    for (o.length += a; ++f < a; ) o[l++] = i[f];
                } else r || o.push(i);
            }
            return o;
        }
        function et(n, t, r, e, u, o) {
            if (r) {
                var i = r(n, t);
                if (typeof i != "undefined") return !!i;
            }
            if (n === t) return 0 !== n || 1 / n == 1 / t;
            if (n === n && !(n && K[typeof n] || t && K[typeof t])) return false;
            if (null == n || null == t) return n === t;
            var a = ar.call(n), c = ar.call(t);
            if (a == N && (a = D), c == N && (c = D), a != c) return false;
            switch (a) {
              case $:
              case F:
                return +n == +t;

              case B:
                return n != +n ? t != +t : 0 == n ? 1 / n == 1 / t : n == +t;

              case P:
              case q:
                return n == rr(t);
            }
            if (c = a == R, !c) {
                var p = vr.call(n, "__wrapped__"), s = vr.call(t, "__wrapped__");
                if (p || s) return et(p ? n.__wrapped__ : n, s ? t.__wrapped__ : t, r, e, u, o);
                if (a != D) return false;
                if (a = n.constructor, p = t.constructor, a != p && !(bt(a) && a instanceof a && bt(p) && p instanceof p) && "constructor" in n && "constructor" in t) return false;
            }
            for (a = !u, u || (u = f()), o || (o = f()), p = u.length; p--; ) if (u[p] == n) return o[p] == t;
            var h = 0, i = true;
            if (u.push(n), o.push(t), c) {
                if (p = n.length, h = t.length, (i = h == p) || e) for (;h--; ) if (c = p, s = t[h], 
                e) for (;c-- && !(i = et(n[c], s, r, e, u, o)); ) ; else if (!(i = et(n[h], s, r, e, u, o))) break;
            } else g(t, function(t, f, a) {
                return vr.call(a, f) ? (h++, i = vr.call(n, f) && et(n[f], t, r, e, u, o)) : void 0;
            }), i && !e && g(n, function(n, t, r) {
                return vr.call(r, t) ? i = -1 < --h : void 0;
            });
            return u.pop(), o.pop(), a && (l(u), l(o)), i;
        }
        function ut(n, t, r, e, u) {
            (Sr(t) ? Ot : v)(t, function(t, o) {
                var i, f, a = t, l = n[o];
                if (t && ((f = Sr(t)) || Br(t))) {
                    for (a = e.length; a--; ) if (i = e[a] == t) {
                        l = u[a];
                        break;
                    }
                    if (!i) {
                        var c;
                        r && (a = r(l, t), c = typeof a != "undefined") && (l = a), c || (l = f ? Sr(l) ? l : [] : Br(l) ? l : {}), 
                        e.push(t), u.push(l), c || ut(l, t, r, e, u);
                    }
                } else r && (a = r(l, t), typeof a == "undefined" && (a = t)), typeof a != "undefined" && (l = a);
                n[o] = l;
            });
        }
        function ot(n, t) {
            return n + sr(Or() * (t - n + 1));
        }
        function it(r, e, u) {
            var i = -1, a = ct(), p = r ? r.length : 0, s = [], h = !e && p >= b && a === n, v = u || h ? f() : s;
            for (h && (v = o(v), a = t); ++i < p; ) {
                var g = r[i], y = u ? u(g, i, r) : g;
                (e ? !i || v[v.length - 1] !== y : 0 > a(v, y)) && ((u || h) && v.push(y), s.push(g));
            }
            return h ? (l(v.k), c(v)) : u && l(v), s;
        }
        function ft(n) {
            return function(t, r, e) {
                var u = {};
                if (r = G.createCallback(r, e, 3), Sr(t)) {
                    e = -1;
                    for (var o = t.length; ++e < o; ) {
                        var i = t[e];
                        n(u, i, r(i, e, t), t);
                    }
                } else V(t, function(t, e, o) {
                    n(u, t, r(t, e, o), o);
                });
                return u;
            };
        }
        function at(n, t, r, e, u, o) {
            var i = 16 & t, f = 32 & t;
            if (!(2 & t || bt(n))) throw new er();
            return i && !r.length && (t &= -17, r = false), f && !e.length && (t &= -33, e = false), 
            (1 == t || 17 === t ? Q : nt)([ n, t, r, e, u, o ]);
        }
        function lt(n) {
            return Rr[n];
        }
        function ct() {
            var t = (t = G.indexOf) === Bt ? n : t;
            return t;
        }
        function pt(n) {
            return typeof n == "function" && lr.test(n);
        }
        function st(n) {
            var t, r;
            return n && ar.call(n) == D && (t = n.constructor, !bt(t) || t instanceof t) ? (g(n, function(n, t) {
                r = t;
            }), typeof r == "undefined" || vr.call(n, r)) : false;
        }
        function ht(n) {
            return $r[n];
        }
        function vt(n) {
            return n && typeof n == "object" && typeof n.length == "number" && ar.call(n) == N || false;
        }
        function gt(n, t, r) {
            var e = Nr(n), u = e.length;
            for (t = Z(t, r, 3); u-- && (r = e[u], false !== t(n[r], r, n)); ) ;
            return n;
        }
        function yt(n) {
            var t = [];
            return g(n, function(n, r) {
                bt(n) && t.push(r);
            }), t.sort();
        }
        function mt(n) {
            for (var t = -1, r = Nr(n), e = r.length, u = {}; ++t < e; ) {
                var o = r[t];
                u[n[o]] = o;
            }
            return u;
        }
        function bt(n) {
            return typeof n == "function";
        }
        function dt(n) {
            return !(!n || !K[typeof n]);
        }
        function _t(n) {
            return typeof n == "number" || n && typeof n == "object" && ar.call(n) == B || false;
        }
        function wt(n) {
            return typeof n == "string" || n && typeof n == "object" && ar.call(n) == q || false;
        }
        function jt(n) {
            for (var t = -1, r = Nr(n), e = r.length, u = Ht(e); ++t < e; ) u[t] = n[r[t]];
            return u;
        }
        function kt(n, t, r) {
            var e = -1, u = ct(), o = n ? n.length : 0, i = false;
            return r = (0 > r ? xr(0, o + r) : r) || 0, Sr(n) ? i = -1 < u(n, t, r) : typeof o == "number" ? i = -1 < (wt(n) ? n.indexOf(t, r) : u(n, t, r)) : V(n, function(n) {
                return ++e < r ? void 0 : !(i = n === t);
            }), i;
        }
        function xt(n, t, r) {
            var e = true;
            if (t = G.createCallback(t, r, 3), Sr(n)) {
                r = -1;
                for (var u = n.length; ++r < u && (e = !!t(n[r], r, n)); ) ;
            } else V(n, function(n, r, u) {
                return e = !!t(n, r, u);
            });
            return e;
        }
        function Ct(n, t, r) {
            var e = [];
            if (t = G.createCallback(t, r, 3), Sr(n)) {
                r = -1;
                for (var u = n.length; ++r < u; ) {
                    var o = n[r];
                    t(o, r, n) && e.push(o);
                }
            } else V(n, function(n, r, u) {
                t(n, r, u) && e.push(n);
            });
            return e;
        }
        function Et(n, t, r) {
            if (t = G.createCallback(t, r, 3), !Sr(n)) {
                var e;
                return V(n, function(n, r, u) {
                    return t(n, r, u) ? (e = n, false) : void 0;
                }), e;
            }
            r = -1;
            for (var u = n.length; ++r < u; ) {
                var o = n[r];
                if (t(o, r, n)) return o;
            }
        }
        function Ot(n, t, r) {
            if (t && typeof r == "undefined" && Sr(n)) {
                r = -1;
                for (var e = n.length; ++r < e && false !== t(n[r], r, n); ) ;
            } else V(n, t, r);
            return n;
        }
        function It(n, t, r) {
            var e = n ? n.length : 0;
            if (t = t && typeof r == "undefined" ? t : Z(t, r, 3), Sr(n)) for (;e-- && false !== t(n[e], e, n); ) ; else {
                if (typeof e != "number") var u = Nr(n), e = u.length;
                V(n, function(r, o, i) {
                    return o = u ? u[--e] : --e, t(n[o], o, i);
                });
            }
            return n;
        }
        function At(n, t, r) {
            var e = -1, u = n ? n.length : 0, o = Ht(typeof u == "number" ? u : 0);
            if (t = G.createCallback(t, r, 3), Sr(n)) for (;++e < u; ) o[e] = t(n[e], e, n); else V(n, function(n, r, u) {
                o[++e] = t(n, r, u);
            });
            return o;
        }
        function St(n, t, r) {
            var u = -1 / 0, o = u;
            if (typeof t != "function" && r && r[t] === n && (t = null), null == t && Sr(n)) {
                r = -1;
                for (var i = n.length; ++r < i; ) {
                    var f = n[r];
                    f > o && (o = f);
                }
            } else t = null == t && wt(n) ? e : G.createCallback(t, r, 3), V(n, function(n, r, e) {
                r = t(n, r, e), r > u && (u = r, o = n);
            });
            return o;
        }
        function Nt(n, t, r, e) {
            var u = 3 > arguments.length;
            if (t = G.createCallback(t, e, 4), Sr(n)) {
                var o = -1, i = n.length;
                for (u && (r = n[++o]); ++o < i; ) r = t(r, n[o], o, n);
            } else V(n, function(n, e, o) {
                r = u ? (u = false, n) : t(r, n, e, o);
            });
            return r;
        }
        function Rt(n, t, r, e) {
            var u = 3 > arguments.length;
            return t = G.createCallback(t, e, 4), It(n, function(n, e, o) {
                r = u ? (u = false, n) : t(r, n, e, o);
            }), r;
        }
        function $t(n) {
            var t = -1, r = n ? n.length : 0, e = Ht(typeof r == "number" ? r : 0);
            return Ot(n, function(n) {
                var r = ot(0, ++t);
                e[t] = e[r], e[r] = n;
            }), e;
        }
        function Ft(n, t, r) {
            var e;
            if (t = G.createCallback(t, r, 3), Sr(n)) {
                r = -1;
                for (var u = n.length; ++r < u && !(e = t(n[r], r, n)); ) ;
            } else V(n, function(n, r, u) {
                return !(e = t(n, r, u));
            });
            return !!e;
        }
        function Tt(n, t, r) {
            var e = 0, u = n ? n.length : 0;
            if (typeof t != "number" && null != t) {
                var o = -1;
                for (t = G.createCallback(t, r, 3); ++o < u && t(n[o], o, n); ) e++;
            } else if (e = t, null == e || r) return n ? n[0] : h;
            return p(n, 0, Cr(xr(0, e), u));
        }
        function Bt(t, r, e) {
            if (typeof e == "number") {
                var u = t ? t.length : 0;
                e = 0 > e ? xr(0, u + e) : e || 0;
            } else if (e) return e = Pt(t, r), t[e] === r ? e : -1;
            return n(t, r, e);
        }
        function Dt(n, t, r) {
            if (typeof t != "number" && null != t) {
                var e = 0, u = -1, o = n ? n.length : 0;
                for (t = G.createCallback(t, r, 3); ++u < o && t(n[u], u, n); ) e++;
            } else e = null == t || r ? 1 : xr(0, t);
            return p(n, e);
        }
        function Pt(n, t, r, e) {
            var u = 0, o = n ? n.length : u;
            for (r = r ? G.createCallback(r, e, 1) : Mt, t = r(t); u < o; ) e = u + o >>> 1, 
            r(n[e]) < t ? u = e + 1 : o = e;
            return u;
        }
        function qt(n, t, r, e) {
            return typeof t != "boolean" && null != t && (e = r, r = typeof t != "function" && e && e[t] === n ? null : t, 
            t = false), null != r && (r = G.createCallback(r, e, 3)), it(n, t, r);
        }
        function zt() {
            for (var n = 1 < arguments.length ? arguments : arguments[0], t = -1, r = n ? St(zr(n, "length")) : 0, e = Ht(0 > r ? 0 : r); ++t < r; ) e[t] = zr(n, t);
            return e;
        }
        function Wt(n, t) {
            var r = -1, e = n ? n.length : 0, u = {};
            for (t || !e || Sr(n[0]) || (t = []); ++r < e; ) {
                var o = n[r];
                t ? u[o] = t[r] : o && (u[o[0]] = o[1]);
            }
            return u;
        }
        function Kt(n, t) {
            return 2 < arguments.length ? at(n, 17, p(arguments, 2), null, t) : at(n, 1, null, null, t);
        }
        function Lt(n, t, r) {
            function e() {
                c && pr(c), i = c = p = h, (g || v !== t) && (s = Wr(), f = n.apply(l, o), c || i || (o = l = null));
            }
            function u() {
                var r = t - (Wr() - a);
                0 < r ? c = mr(u, r) : (i && pr(i), r = p, i = c = p = h, r && (s = Wr(), f = n.apply(l, o), 
                c || i || (o = l = null)));
            }
            var o, i, f, a, l, c, p, s = 0, v = false, g = true;
            if (!bt(n)) throw new er();
            if (t = xr(0, t) || 0, true === r) var y = true, g = false; else dt(r) && (y = r.leading, 
            v = "maxWait" in r && (xr(t, r.maxWait) || 0), g = "trailing" in r ? r.trailing : g);
            return function() {
                if (o = arguments, a = Wr(), l = this, p = g && (c || !y), false === v) var r = y && !c; else {
                    i || y || (s = a);
                    var h = v - (a - s), m = 0 >= h;
                    m ? (i && (i = pr(i)), s = a, f = n.apply(l, o)) : i || (i = mr(e, h));
                }
                return m && c ? c = pr(c) : c || t === v || (c = mr(u, t)), r && (m = true, f = n.apply(l, o)), 
                !m || c || i || (o = l = null), f;
            };
        }
        function Mt(n) {
            return n;
        }
        function Vt(n, t, r) {
            var e = true, u = t && yt(t);
            t && (r || u.length) || (null == r && (r = t), o = H, t = n, n = G, u = yt(t)), 
            false === r ? e = false : dt(r) && "chain" in r && (e = r.chain);
            var o = n, i = bt(o);
            Ot(u, function(r) {
                var u = n[r] = t[r];
                i && (o.prototype[r] = function() {
                    var t = this.__chain__, r = this.__wrapped__, i = [ r ];
                    if (gr.apply(i, arguments), i = u.apply(n, i), e || t) {
                        if (r === i && dt(i)) return this;
                        i = new o(i), i.__chain__ = t;
                    }
                    return i;
                });
            });
        }
        function Ut(n) {
            return function(t) {
                return t[n];
            };
        }
        function Gt() {
            return this.__wrapped__;
        }
        r = r ? J.defaults(M.Object(), r, J.pick(M, S)) : M;
        var Ht = r.Array, Jt = r.Boolean, Qt = r.Date, Xt = r.Function, Yt = r.Math, Zt = r.Number, nr = r.Object, tr = r.RegExp, rr = r.String, er = r.TypeError, ur = [], or = r.Error.prototype, ir = nr.prototype, fr = r._, ar = ir.toString, lr = tr("^" + rr(ar).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/toString| for [^\]]+/g, ".*?") + "$"), cr = Yt.ceil, pr = r.clearTimeout, sr = Yt.floor, hr = pt(hr = nr.getPrototypeOf) && hr, vr = ir.hasOwnProperty, gr = ur.push, yr = ir.propertyIsEnumerable, mr = r.setTimeout, br = ur.splice, dr = pt(dr = nr.create) && dr, _r = pt(_r = Ht.isArray) && _r, wr = r.isFinite, jr = r.isNaN, kr = pt(kr = nr.keys) && kr, xr = Yt.max, Cr = Yt.min, Er = r.parseInt, Or = Yt.random, Ir = {};
        Ir[R] = Ht, Ir[$] = Jt, Ir[F] = Qt, Ir[T] = Xt, Ir[D] = nr, Ir[B] = Zt, Ir[P] = tr, 
        Ir[q] = rr, H.prototype = G.prototype;
        var Ar = G.support = {};
        Ar.enumErrorProps = yr.call(or, "message") || yr.call(or, "name"), Ar.enumPrototypes = true, 
        Ar.nonEnumArgs = true, G.templateSettings = {
            escape: /<%-([\s\S]+?)%>/g,
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: E,
            variable: "",
            imports: {
                _: G
            }
        }, dr || (Y = function() {
            function n() {}
            return function(t) {
                if (dt(t)) {
                    n.prototype = t;
                    var e = new n();
                    n.prototype = null;
                }
                return e || r.Object();
            };
        }());
        var Sr = _r || function(n) {
            return n && typeof n == "object" && typeof n.length == "number" && ar.call(n) == R || false;
        }, Nr = kr ? function(n) {
            return dt(n) ? Ar.enumPrototypes && typeof n == "function" || Ar.nonEnumArgs && n.length && vt(n) ? U(n) : kr(n) : [];
        } : U, Rr = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }, $r = mt(Rr), Fr = tr("(" + Nr($r).join("|") + ")", "g"), Tr = tr("[" + Nr(Rr).join("") + "]", "g");
        bt(/x/) && (bt = function(n) {
            return typeof n == "function" && ar.call(n) == T;
        });
        var Br = hr ? function(n) {
            if (!n || ar.call(n) != D) return false;
            var t = n.valueOf, r = pt(t) && (r = hr(t)) && hr(r);
            return r ? n == r || hr(n) == r : st(n);
        } : st, Dr = ft(function(n, t, r) {
            vr.call(n, r) ? n[r]++ : n[r] = 1;
        }), Pr = ft(function(n, t, r) {
            (vr.call(n, r) ? n[r] : n[r] = []).push(t);
        }), qr = ft(function(n, t, r) {
            n[r] = t;
        }), zr = At, Wr = pt(Wr = Qt.now) && Wr || function() {
            return new Qt().getTime();
        }, Kr = 8 == Er(_ + "08") ? Er : function(n, t) {
            return Er(wt(n) ? n.replace(O, "") : n, t || 0);
        };
        return G.after = function(n, t) {
            if (!bt(t)) throw new er();
            return function() {
                return 1 > --n ? t.apply(this, arguments) : void 0;
            };
        }, G.assign = L, G.at = function(n) {
            for (var t = arguments, r = -1, e = rt(t, true, false, 1), t = t[2] && t[2][t[1]] === n ? 1 : e.length, u = Ht(t); ++r < t; ) u[r] = n[e[r]];
            return u;
        }, G.bind = Kt, G.bindAll = function(n) {
            for (var t = 1 < arguments.length ? rt(arguments, true, false, 1) : yt(n), r = -1, e = t.length; ++r < e; ) {
                var u = t[r];
                n[u] = at(n[u], 1, null, null, n);
            }
            return n;
        }, G.bindKey = function(n, t) {
            return 2 < arguments.length ? at(t, 19, p(arguments, 2), null, n) : at(t, 3, null, null, n);
        }, G.chain = function(n) {
            return n = new H(n), n.__chain__ = true, n;
        }, G.compact = function(n) {
            for (var t = -1, r = n ? n.length : 0, e = []; ++t < r; ) {
                var u = n[t];
                u && e.push(u);
            }
            return e;
        }, G.compose = function() {
            for (var n = arguments, t = n.length; t--; ) if (!bt(n[t])) throw new er();
            return function() {
                for (var t = arguments, r = n.length; r--; ) t = [ n[r].apply(this, t) ];
                return t[0];
            };
        }, G.constant = function(n) {
            return function() {
                return n;
            };
        }, G.countBy = Dr, G.create = function(n, t) {
            var r = Y(n);
            return t ? L(r, t) : r;
        }, G.createCallback = function(n, t, r) {
            var e = typeof n;
            if (null == n || "function" == e) return Z(n, t, r);
            if ("object" != e) return Ut(n);
            var u = Nr(n), o = u[0], i = n[o];
            return 1 != u.length || i !== i || dt(i) ? function(t) {
                for (var r = u.length, e = false; r-- && (e = et(t[u[r]], n[u[r]], null, true)); ) ;
                return e;
            } : function(n) {
                return n = n[o], i === n && (0 !== i || 1 / i == 1 / n);
            };
        }, G.curry = function(n, t) {
            return t = typeof t == "number" ? t : +t || n.length, at(n, 4, null, null, null, t);
        }, G.debounce = Lt, G.defaults = d, G.defer = function(n) {
            if (!bt(n)) throw new er();
            var t = p(arguments, 1);
            return mr(function() {
                n.apply(h, t);
            }, 1);
        }, G.delay = function(n, t) {
            if (!bt(n)) throw new er();
            var r = p(arguments, 2);
            return mr(function() {
                n.apply(h, r);
            }, t);
        }, G.difference = function(n) {
            return tt(n, rt(arguments, true, true, 1));
        }, G.filter = Ct, G.flatten = function(n, t, r, e) {
            return typeof t != "boolean" && null != t && (e = r, r = typeof t != "function" && e && e[t] === n ? null : t, 
            t = false), null != r && (n = At(n, r, e)), rt(n, t);
        }, G.forEach = Ot, G.forEachRight = It, G.forIn = g, G.forInRight = function(n, t, r) {
            var e = [];
            g(n, function(n, t) {
                e.push(t, n);
            });
            var u = e.length;
            for (t = Z(t, r, 3); u-- && false !== t(e[u--], e[u], n); ) ;
            return n;
        }, G.forOwn = v, G.forOwnRight = gt, G.functions = yt, G.groupBy = Pr, G.indexBy = qr, 
        G.initial = function(n, t, r) {
            var e = 0, u = n ? n.length : 0;
            if (typeof t != "number" && null != t) {
                var o = u;
                for (t = G.createCallback(t, r, 3); o-- && t(n[o], o, n); ) e++;
            } else e = null == t || r ? 1 : t || e;
            return p(n, 0, Cr(xr(0, u - e), u));
        }, G.intersection = function() {
            for (var r = [], e = -1, u = arguments.length, i = f(), a = ct(), p = a === n, s = f(); ++e < u; ) {
                var h = arguments[e];
                (Sr(h) || vt(h)) && (r.push(h), i.push(p && h.length >= b && o(e ? r[e] : s)));
            }
            var p = r[0], v = -1, g = p ? p.length : 0, y = [];
            n: for (;++v < g; ) {
                var m = i[0], h = p[v];
                if (0 > (m ? t(m, h) : a(s, h))) {
                    for (e = u, (m || s).push(h); --e; ) if (m = i[e], 0 > (m ? t(m, h) : a(r[e], h))) continue n;
                    y.push(h);
                }
            }
            for (;u--; ) (m = i[u]) && c(m);
            return l(i), l(s), y;
        }, G.invert = mt, G.invoke = function(n, t) {
            var r = p(arguments, 2), e = -1, u = typeof t == "function", o = n ? n.length : 0, i = Ht(typeof o == "number" ? o : 0);
            return Ot(n, function(n) {
                i[++e] = (u ? t : n[t]).apply(n, r);
            }), i;
        }, G.keys = Nr, G.map = At, G.mapValues = function(n, t, r) {
            var e = {};
            return t = G.createCallback(t, r, 3), v(n, function(n, r, u) {
                e[r] = t(n, r, u);
            }), e;
        }, G.max = St, G.memoize = function(n, t) {
            function r() {
                var e = r.cache, u = t ? t.apply(this, arguments) : m + arguments[0];
                return vr.call(e, u) ? e[u] : e[u] = n.apply(this, arguments);
            }
            if (!bt(n)) throw new er();
            return r.cache = {}, r;
        }, G.merge = function(n) {
            var t = arguments, r = 2;
            if (!dt(n)) return n;
            if ("number" != typeof t[2] && (r = t.length), 3 < r && "function" == typeof t[r - 2]) var e = Z(t[--r - 1], t[r--], 2); else 2 < r && "function" == typeof t[r - 1] && (e = t[--r]);
            for (var t = p(arguments, 1, r), u = -1, o = f(), i = f(); ++u < r; ) ut(n, t[u], e, o, i);
            return l(o), l(i), n;
        }, G.min = function(n, t, r) {
            var u = 1 / 0, o = u;
            if (typeof t != "function" && r && r[t] === n && (t = null), null == t && Sr(n)) {
                r = -1;
                for (var i = n.length; ++r < i; ) {
                    var f = n[r];
                    f < o && (o = f);
                }
            } else t = null == t && wt(n) ? e : G.createCallback(t, r, 3), V(n, function(n, r, e) {
                r = t(n, r, e), r < u && (u = r, o = n);
            });
            return o;
        }, G.omit = function(n, t, r) {
            var e = {};
            if (typeof t != "function") {
                var u = [];
                g(n, function(n, t) {
                    u.push(t);
                });
                for (var u = tt(u, rt(arguments, true, false, 1)), o = -1, i = u.length; ++o < i; ) {
                    var f = u[o];
                    e[f] = n[f];
                }
            } else t = G.createCallback(t, r, 3), g(n, function(n, r, u) {
                t(n, r, u) || (e[r] = n);
            });
            return e;
        }, G.once = function(n) {
            var t, r;
            if (!bt(n)) throw new er();
            return function() {
                return t ? r : (t = true, r = n.apply(this, arguments), n = null, r);
            };
        }, G.pairs = function(n) {
            for (var t = -1, r = Nr(n), e = r.length, u = Ht(e); ++t < e; ) {
                var o = r[t];
                u[t] = [ o, n[o] ];
            }
            return u;
        }, G.partial = function(n) {
            return at(n, 16, p(arguments, 1));
        }, G.partialRight = function(n) {
            return at(n, 32, null, p(arguments, 1));
        }, G.pick = function(n, t, r) {
            var e = {};
            if (typeof t != "function") for (var u = -1, o = rt(arguments, true, false, 1), i = dt(n) ? o.length : 0; ++u < i; ) {
                var f = o[u];
                f in n && (e[f] = n[f]);
            } else t = G.createCallback(t, r, 3), g(n, function(n, r, u) {
                t(n, r, u) && (e[r] = n);
            });
            return e;
        }, G.pluck = zr, G.property = Ut, G.pull = function(n) {
            for (var t = arguments, r = 0, e = t.length, u = n ? n.length : 0; ++r < e; ) for (var o = -1, i = t[r]; ++o < u; ) n[o] === i && (br.call(n, o--, 1), 
            u--);
            return n;
        }, G.range = function(n, t, r) {
            n = +n || 0, r = typeof r == "number" ? r : +r || 1, null == t && (t = n, n = 0);
            var e = -1;
            t = xr(0, cr((t - n) / (r || 1)));
            for (var u = Ht(t); ++e < t; ) u[e] = n, n += r;
            return u;
        }, G.reject = function(n, t, r) {
            return t = G.createCallback(t, r, 3), Ct(n, function(n, r, e) {
                return !t(n, r, e);
            });
        }, G.remove = function(n, t, r) {
            var e = -1, u = n ? n.length : 0, o = [];
            for (t = G.createCallback(t, r, 3); ++e < u; ) r = n[e], t(r, e, n) && (o.push(r), 
            br.call(n, e--, 1), u--);
            return o;
        }, G.rest = Dt, G.shuffle = $t, G.sortBy = function(n, t, r) {
            var e = -1, o = Sr(t), i = n ? n.length : 0, p = Ht(typeof i == "number" ? i : 0);
            for (o || (t = G.createCallback(t, r, 3)), Ot(n, function(n, r, u) {
                var i = p[++e] = a();
                o ? i.m = At(t, function(t) {
                    return n[t];
                }) : (i.m = f())[0] = t(n, r, u), i.n = e, i.o = n;
            }), i = p.length, p.sort(u); i--; ) n = p[i], p[i] = n.o, o || l(n.m), c(n);
            return p;
        }, G.tap = function(n, t) {
            return t(n), n;
        }, G.throttle = function(n, t, r) {
            var e = true, u = true;
            if (!bt(n)) throw new er();
            return false === r ? e = false : dt(r) && (e = "leading" in r ? r.leading : e, u = "trailing" in r ? r.trailing : u), 
            W.leading = e, W.maxWait = t, W.trailing = u, Lt(n, t, W);
        }, G.times = function(n, t, r) {
            n = -1 < (n = +n) ? n : 0;
            var e = -1, u = Ht(n);
            for (t = Z(t, r, 1); ++e < n; ) u[e] = t(e);
            return u;
        }, G.toArray = function(n) {
            return n && typeof n.length == "number" ? p(n) : jt(n);
        }, G.transform = function(n, t, r, e) {
            var u = Sr(n);
            if (null == r) if (u) r = []; else {
                var o = n && n.constructor;
                r = Y(o && o.prototype);
            }
            return t && (t = G.createCallback(t, e, 4), (u ? V : v)(n, function(n, e, u) {
                return t(r, n, e, u);
            })), r;
        }, G.union = function() {
            return it(rt(arguments, true, true));
        }, G.uniq = qt, G.values = jt, G.where = Ct, G.without = function(n) {
            return tt(n, p(arguments, 1));
        }, G.wrap = function(n, t) {
            return at(t, 16, [ n ]);
        }, G.xor = function() {
            for (var n = -1, t = arguments.length; ++n < t; ) {
                var r = arguments[n];
                if (Sr(r) || vt(r)) var e = e ? it(tt(e, r).concat(tt(r, e))) : r;
            }
            return e || [];
        }, G.zip = zt, G.zipObject = Wt, G.collect = At, G.drop = Dt, G.each = Ot, G.eachRight = It, 
        G.extend = L, G.methods = yt, G.object = Wt, G.select = Ct, G.tail = Dt, G.unique = qt, 
        G.unzip = zt, Vt(G), G.clone = function(n, t, r, e) {
            return typeof t != "boolean" && null != t && (e = r, r = t, t = false), X(n, t, typeof r == "function" && Z(r, e, 1));
        }, G.cloneDeep = function(n, t, r) {
            return X(n, true, typeof t == "function" && Z(t, r, 1));
        }, G.contains = kt, G.escape = function(n) {
            return null == n ? "" : rr(n).replace(Tr, lt);
        }, G.every = xt, G.find = Et, G.findIndex = function(n, t, r) {
            var e = -1, u = n ? n.length : 0;
            for (t = G.createCallback(t, r, 3); ++e < u; ) if (t(n[e], e, n)) return e;
            return -1;
        }, G.findKey = function(n, t, r) {
            var e;
            return t = G.createCallback(t, r, 3), v(n, function(n, r, u) {
                return t(n, r, u) ? (e = r, false) : void 0;
            }), e;
        }, G.findLast = function(n, t, r) {
            var e;
            return t = G.createCallback(t, r, 3), It(n, function(n, r, u) {
                return t(n, r, u) ? (e = n, false) : void 0;
            }), e;
        }, G.findLastIndex = function(n, t, r) {
            var e = n ? n.length : 0;
            for (t = G.createCallback(t, r, 3); e--; ) if (t(n[e], e, n)) return e;
            return -1;
        }, G.findLastKey = function(n, t, r) {
            var e;
            return t = G.createCallback(t, r, 3), gt(n, function(n, r, u) {
                return t(n, r, u) ? (e = r, false) : void 0;
            }), e;
        }, G.has = function(n, t) {
            return n ? vr.call(n, t) : false;
        }, G.identity = Mt, G.indexOf = Bt, G.isArguments = vt, G.isArray = Sr, G.isBoolean = function(n) {
            return true === n || false === n || n && typeof n == "object" && ar.call(n) == $ || false;
        }, G.isDate = function(n) {
            return n && typeof n == "object" && ar.call(n) == F || false;
        }, G.isElement = function(n) {
            return n && 1 === n.nodeType || false;
        }, G.isEmpty = function(n) {
            var t = true;
            if (!n) return t;
            var r = ar.call(n), e = n.length;
            return r == R || r == q || r == N || r == D && typeof e == "number" && bt(n.splice) ? !e : (v(n, function() {
                return t = false;
            }), t);
        }, G.isEqual = function(n, t, r, e) {
            return et(n, t, typeof r == "function" && Z(r, e, 2));
        }, G.isFinite = function(n) {
            return wr(n) && !jr(parseFloat(n));
        }, G.isFunction = bt, G.isNaN = function(n) {
            return _t(n) && n != +n;
        }, G.isNull = function(n) {
            return null === n;
        }, G.isNumber = _t, G.isObject = dt, G.isPlainObject = Br, G.isRegExp = function(n) {
            return n && K[typeof n] && ar.call(n) == P || false;
        }, G.isString = wt, G.isUndefined = function(n) {
            return typeof n == "undefined";
        }, G.lastIndexOf = function(n, t, r) {
            var e = n ? n.length : 0;
            for (typeof r == "number" && (e = (0 > r ? xr(0, e + r) : Cr(r, e - 1)) + 1); e--; ) if (n[e] === t) return e;
            return -1;
        }, G.mixin = Vt, G.noConflict = function() {
            return r._ = fr, this;
        }, G.noop = function() {}, G.now = Wr, G.parseInt = Kr, G.random = function(n, t, r) {
            var e = null == n, u = null == t;
            return null == r && (typeof n == "boolean" && u ? (r = n, n = 1) : u || typeof t != "boolean" || (r = t, 
            u = true)), e && u && (t = 1), n = +n || 0, u ? (t = n, n = 0) : t = +t || 0, r || n % 1 || t % 1 ? (r = Or(), 
            Cr(n + r * (t - n + parseFloat("1e-" + ((r + "").length - 1))), t)) : ot(n, t);
        }, G.reduce = Nt, G.reduceRight = Rt, G.result = function(n, t) {
            if (n) {
                var r = n[t];
                return bt(r) ? n[t]() : r;
            }
        }, G.runInContext = s, G.size = function(n) {
            var t = n ? n.length : 0;
            return typeof t == "number" ? t : Nr(n).length;
        }, G.some = Ft, G.sortedIndex = Pt, G.template = function(n, t, r) {
            var e = G.templateSettings;
            n = rr(n || ""), r = d({}, r, e);
            var u, o = d({}, r.imports, e.imports), e = Nr(o), o = jt(o), f = 0, a = r.interpolate || I, l = "__p+='", a = tr((r.escape || I).source + "|" + a.source + "|" + (a === E ? x : I).source + "|" + (r.evaluate || I).source + "|$", "g");
            n.replace(a, function(t, r, e, o, a, c) {
                return e || (e = o), l += n.slice(f, c).replace(A, i), r && (l += "'+__e(" + r + ")+'"), 
                a && (u = true, l += "';" + a + ";\n__p+='"), e && (l += "'+((__t=(" + e + "))==null?'':__t)+'"), 
                f = c + t.length, t;
            }), l += "';", a = r = r.variable, a || (r = "obj", l = "with(" + r + "){" + l + "}"), 
            l = (u ? l.replace(w, "") : l).replace(j, "$1").replace(k, "$1;"), l = "function(" + r + "){" + (a ? "" : r + "||(" + r + "={});") + "var __t,__p='',__e=_.escape" + (u ? ",__j=Array.prototype.join;function print(){__p+=__j.call(arguments,'')}" : ";") + l + "return __p}";
            try {
                var c = Xt(e, "return " + l).apply(h, o);
            } catch (p) {
                throw p.source = l, p;
            }
            return t ? c(t) : (c.source = l, c);
        }, G.unescape = function(n) {
            return null == n ? "" : rr(n).replace(Fr, ht);
        }, G.uniqueId = function(n) {
            var t = ++y;
            return rr(null == n ? "" : n) + t;
        }, G.all = xt, G.any = Ft, G.detect = Et, G.findWhere = Et, G.foldl = Nt, G.foldr = Rt, 
        G.include = kt, G.inject = Nt, Vt(function() {
            var n = {};
            return v(G, function(t, r) {
                G.prototype[r] || (n[r] = t);
            }), n;
        }(), false), G.first = Tt, G.last = function(n, t, r) {
            var e = 0, u = n ? n.length : 0;
            if (typeof t != "number" && null != t) {
                var o = u;
                for (t = G.createCallback(t, r, 3); o-- && t(n[o], o, n); ) e++;
            } else if (e = t, null == e || r) return n ? n[u - 1] : h;
            return p(n, xr(0, u - e));
        }, G.sample = function(n, t, r) {
            return n && typeof n.length != "number" && (n = jt(n)), null == t || r ? n ? n[ot(0, n.length - 1)] : h : (n = $t(n), 
            n.length = Cr(xr(0, t), n.length), n);
        }, G.take = Tt, G.head = Tt, v(G, function(n, t) {
            var r = "sample" !== t;
            G.prototype[t] || (G.prototype[t] = function(t, e) {
                var u = this.__chain__, o = n(this.__wrapped__, t, e);
                return u || null != t && (!e || r && typeof t == "function") ? new H(o, u) : o;
            });
        }), G.VERSION = "2.4.1", G.prototype.chain = function() {
            return this.__chain__ = true, this;
        }, G.prototype.toString = function() {
            return rr(this.__wrapped__);
        }, G.prototype.value = Gt, G.prototype.valueOf = Gt, V([ "join", "pop", "shift" ], function(n) {
            var t = ur[n];
            G.prototype[n] = function() {
                var n = this.__chain__, r = t.apply(this.__wrapped__, arguments);
                return n ? new H(r, n) : r;
            };
        }), V([ "push", "reverse", "sort", "unshift" ], function(n) {
            var t = ur[n];
            G.prototype[n] = function() {
                return t.apply(this.__wrapped__, arguments), this;
            };
        }), V([ "concat", "slice", "splice" ], function(n) {
            var t = ur[n];
            G.prototype[n] = function() {
                return new H(t.apply(this.__wrapped__, arguments), this.__chain__);
            };
        }), G;
    }
    var h, v = [], g = [], y = 0, m = +new Date() + "", b = 75, d = 40, _ = " 	\f ﻿\n\r\u2028\u2029 ᠎             　", w = /\b__p\+='';/g, j = /\b(__p\+=)''\+/g, k = /(__e\(.*?\)|\b__t\))\+'';/g, x = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, C = /\w*$/, E = /<%=([\s\S]+?)%>/g, O = RegExp("^[" + _ + "]*0+(?=.$)"), I = /($^)/, A = /['\n\r\t\u2028\u2029\\]/g, S = "Array Boolean Date Error Function Math Number Object RegExp String _ attachEvent clearTimeout isFinite isNaN parseInt setTimeout".split(" "), N = "[object Arguments]", R = "[object Array]", $ = "[object Boolean]", F = "[object Date]", T = "[object Function]", B = "[object Number]", D = "[object Object]", P = "[object RegExp]", q = "[object String]", z = {};
    z[T] = false, z[N] = z[R] = z[$] = z[F] = z[B] = z[D] = z[P] = z[q] = true;
    var W = {
        leading: false,
        maxWait: 0,
        trailing: false
    }, K = {
        "boolean": false,
        "function": true,
        object: true,
        number: false,
        string: false,
        undefined: false
    }, L = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "	": "t",
        "\u2028": "u2028",
        "\u2029": "u2029"
    }, M = K[typeof window] && window || this, V = K[typeof exports] && exports && !exports.nodeType && exports, U = K[typeof module] && module && !module.nodeType && module, G = U && U.exports === V && V, H = K[typeof global] && global;
    !H || H.global !== H && H.window !== H || (M = H);
    var J = s();
    typeof define == "function" && typeof define.amd == "object" && define.amd ? (M._ = J, 
    define(function() {
        return J;
    })) : V && U ? G ? (U.exports = J)._ = J : V._ = J : M._ = J;
    return J;
}.call(this);

(function(root) {
    "use strict";
    (function(factory) {
        if (typeof define === "function" && define.amd) {
            define(factory);
        } else if (typeof exports === "object") {
            if (Object.keys(module.exports).length !== 0) {
                module.exports.p = module.exports.Dfd = factory();
            } else {
                module.exports = factory();
            }
        } else {
            root.p = factory();
            if (typeof root._ !== "undefined") {
                root._.Dfd = root.p;
            }
        }
    })(function() {
        function extend(a, b) {
            for (var key in b) {
                a[key] = b[key];
            }
        }
        function isFunction(a) {
            return !!(a && Object.prototype.toString.call(a) === "[object Function]");
        }
        function isObject(a) {
            return !!(a && Object.prototype.toString.call(a) === "[object Object]");
        }
        function isArray(a) {
            return !!(a && Object.prototype.toString.call(a) === "[object Array]");
        }
        function isPromise(promise) {
            if (typeof promise !== "undefined" && promise !== null && promise.toString && promise.toString() === "[object Promise]") {
                return true;
            }
            return false;
        }
        function isDeferred(deferred) {
            if (typeof deferred !== "undefined" && deferred !== null && deferred.toString && deferred.toString() === "[object Deferred]") {
                return true;
            }
            return false;
        }
        var setTimeout = root.setTimeout;
        if (typeof process === "object" && isFunction(process.nextTick)) {
            setTimeout = process.nextTick;
        }
        function callback(scope, data, cbs) {
            setTimeout(function() {
                cbs.forEach(function(item) {
                    item.call(scope, data);
                });
            }, 0);
        }
        function sanitizeCbs(cbs) {
            if (cbs && !isArray(cbs)) {
                cbs = [ cbs ];
            }
            return cbs;
        }
        var internalFilteredDataInstance = {
            mine: "mine"
        };
        var filteredData = internalFilteredDataInstance;
        function getThenFilterCallback(filter, newp, what) {
            return function(data) {
                filteredData = internalFilteredDataInstance;
                if (filter && isFunction(filter)) {
                    try {
                        filteredData = filter.call(undefined, data);
                    } catch (e) {
                        filteredData = internalFilteredDataInstance;
                        newp.reject(e);
                    }
                    if (filteredData !== internalFilteredDataInstance) {
                        if (what === "reject") {
                            newp.resolve(filteredData);
                        } else {
                            newp[what](filteredData);
                        }
                    }
                } else {
                    newp[what](data);
                }
            };
        }
        function doIsPromiseSteal(data, scope) {
            data.done(function(resData) {
                scope.doResolve(resData);
            });
            data.fail(function(rejData) {
                scope.doReject(rejData);
            });
            data.progress(function(progData) {
                scope.doNotify(progData);
            });
        }
        function doWhatYouShould(data, what, scope) {
            switch (what) {
              case "resolve":
                scope.doResolve(data);
                break;

              case "reject":
                scope.doReject(data);
                break;

              case "notify":
                scope.doNotify(data);
                break;
            }
        }
        function doTryAndGetDatasThen(data, scope) {
            var ret = {
                failed: false,
                datasThen: undefined
            };
            try {
                ret.datasThen = data.then;
            } catch (e) {
                ret.datasThen = undefined;
                ret.failed = true;
                scope.doReject(e);
            }
            return ret;
        }
        function doDatasThenIsAFunction(datasThen, data, scope) {
            var fCalled = false;
            try {
                var datasThenp = new p();
                datasThenp.done(function(resData) {
                    scope.doResolve(resData);
                }).fail(function(rejData) {
                    scope.doReject(rejData);
                }).progress(function(progData) {
                    scope.doProgress(progData);
                });
                datasThen.call(data, function(resData) {
                    if (!fCalled) {
                        fCalled = true;
                        datasThenp.resolve(resData);
                    }
                }, function(rejData) {
                    if (!fCalled) {
                        fCalled = true;
                        datasThenp.reject(rejData);
                    }
                }, function(progData) {
                    datasThenp.notify(progData);
                });
            } catch (e) {
                if (!fCalled) {
                    scope.doReject(e);
                }
            }
        }
        function doStealDatasThen(data, what, scope) {
            var ret = doTryAndGetDatasThen(data, scope);
            if (!ret.failed) {
                if (isFunction(ret.datasThen)) {
                    doDatasThenIsAFunction(ret.datasThen, data, scope);
                } else {
                    doWhatYouShould(data, what, scope);
                }
            }
        }
        var p = function p(beforeStart) {
            if (this.constructor !== p) {
                throw new Error("You must create deferreds with the 'new' keyword");
            }
            this.internalState = 0;
            this.internalWith = undefined;
            this.internalData = null;
            this.callbacks = {
                done: [],
                fail: [],
                always: [],
                progress: []
            };
            this._pro = null;
            if (beforeStart && isFunction(beforeStart)) {
                beforeStart.call(this, this);
            }
            return this;
        };
        var Promise = function(p, target) {
            this.done = p.done.bind(p);
            this.fail = p.fail.bind(p);
            this.progress = p.progress.bind(p);
            this.always = p.always.bind(p);
            this.then = p.then.bind(p);
            this.state = function() {
                return p.internalState;
            };
            if (target && isObject(target)) {
                extend(target, this);
                return target;
            }
            return this;
        };
        extend(Promise.prototype, {
            toString: function() {
                return "[object Promise]";
            }
        });
        extend(p.prototype, {
            toString: function() {
                return "[object Deferred]";
            },
            Promise: Promise,
            notify: function(data) {
                if (this.internalState === 0) {
                    this.internalData = data;
                    callback(this.internalWith, this.internalData, this.callbacks.progress);
                }
                return this;
            },
            notifyWith: function(scope, data) {
                if (this.internalState === 0) {
                    this.internalWith = scope;
                    this.internalData = data;
                    callback(this.internalWith, this.internalData, this.callbacks.progress);
                }
                return this;
            },
            doNotify: function(data) {
                this.internalData = data;
                callback(this.internalWith, this.internalData, this.callbacks.progress);
            },
            reject: function(data) {
                if (this.internalState === 0) {
                    this.deNestSanitizeTheInsanityAndCall(data, "reject");
                }
                return this;
            },
            rejectWith: function(scope, data) {
                if (this.internalState === 0) {
                    this.internalWith = scope;
                    this.deNestSanitizeTheInsanityAndCall(data, "reject");
                }
                return this;
            },
            doReject: function(data) {
                this.internalData = data;
                this.internalState = 2;
                callback(this.internalWith, this.internalData, this.callbacks.fail.concat(this.callbacks.always));
            },
            resolve: function(data) {
                if (this.internalState === 0) {
                    this.deNestSanitizeTheInsanityAndCall(data, "resolve");
                }
                return this;
            },
            resolveWith: function(scope, data) {
                if (this.internalState === 0) {
                    this.internalWith = scope;
                    this.deNestSanitizeTheInsanityAndCall(data, "resolve");
                }
                return this;
            },
            doResolve: function(data) {
                this.internalData = data;
                this.internalState = 1;
                callback(this.internalWith, this.internalData, this.callbacks.done.concat(this.callbacks.always));
            },
            always: function(cbs) {
                cbs = sanitizeCbs(cbs);
                if (cbs.length > 0) {
                    if (this.internalState !== 0) {
                        callback(this.internalWith, this.internalData, cbs);
                    } else {
                        this.callbacks.always = this.callbacks.always.concat(cbs);
                    }
                }
                return this.promise();
            },
            done: function(cbs) {
                cbs = sanitizeCbs(cbs);
                if (cbs.length > 0) {
                    if (this.internalState === 1) {
                        callback(this.internalWith, this.internalData, cbs);
                    } else {
                        this.callbacks.done = this.callbacks.done.concat(cbs);
                    }
                }
                return this.promise();
            },
            fail: function(cbs) {
                cbs = sanitizeCbs(cbs);
                if (cbs.length > 0) {
                    if (this.internalState === 2) {
                        callback(this.internalWith, this.internalData, cbs);
                    } else {
                        this.callbacks.fail = this.callbacks.fail.concat(cbs);
                    }
                }
                return this.promise();
            },
            progress: function(cbs) {
                if (this.internalState === 0) {
                    cbs = sanitizeCbs(cbs);
                    this.callbacks.progress = this.callbacks.progress.concat(cbs);
                }
                return this.promise();
            },
            deNestSanitizeTheInsanityAndCall: function(data, what) {
                if (data === this.promise()) {
                    this.doReject(new TypeError("Promise Tried to Resolve with Self"));
                } else if (isPromise(data)) {
                    doIsPromiseSteal(data, this);
                } else if (isObject(data) || isFunction(data)) {
                    doStealDatasThen(data, what, this);
                } else {
                    doWhatYouShould(data, what, this);
                }
            },
            then: function(doneFilter, failFilter, progressFilter) {
                var newp = new p();
                this.done(getThenFilterCallback(doneFilter, newp, "resolve")).fail(getThenFilterCallback(failFilter, newp, "reject")).progress(getThenFilterCallback(progressFilter, newp, "notify"));
                return newp.promise();
            },
            wrap: function(thennable) {
                var newp = new p();
                var datasThen;
                if (isPromise(thennable) || isDeferred(thennable)) {
                    doIsPromiseSteal(thennable, newp);
                } else if (isObject(thennable) || isFunction(thennable)) {
                    doStealDatasThen(thennable, "resolve", newp);
                } else {
                    newp.resolve(thennable);
                }
                return newp.promise();
            },
            when: function() {
                var args = Array.prototype.slice.call(arguments);
                var promises = [];
                var newp = new p();
                var resolvedCount = 0;
                var handledCount = 0;
                var whenData = [];
                args.forEach(function(item) {
                    if (isArray(item)) {
                        promises = promises.concat(item);
                    } else {
                        promises.push(item);
                    }
                });
                if (promises.length === 0) {
                    newp.resolve(whenData);
                }
                promises.forEach(function(promise, i) {
                    if (isPromise(promise) || isDeferred(promise)) {
                        promise.done(function(data) {
                            resolvedCount++;
                            handledCount++;
                            whenData[i] = data;
                            newp.notify({
                                index: i,
                                action: "resolved",
                                data: data,
                                resolved: resolvedCount,
                                handled: handledCount
                            });
                            if (resolvedCount === promises.length) {
                                newp.resolve(whenData);
                            } else if (handledCount === promises.length) {
                                newp.reject(whenData);
                            }
                        }).fail(function(data) {
                            handledCount++;
                            whenData[i] = data;
                            newp.notify({
                                index: i,
                                action: "rejected",
                                data: data,
                                resolved: resolvedCount,
                                handled: handledCount
                            });
                            if (resolvedCount === promises.length) {
                                newp.resolve(whenData);
                            } else if (handledCount === promises.length) {
                                newp.reject(whenData);
                            }
                        }).progress(function(data) {
                            newp.notify(data);
                        });
                    } else if (!!promise) {
                        resolvedCount++;
                        handledCount++;
                        whenData[i] = promise;
                    } else {
                        handledCount++;
                        whenData[i] = promise;
                    }
                });
                if (resolvedCount === promises.length) {
                    newp.resolve(whenData);
                } else if (handledCount === promises.length) {
                    newp.reject(whenData);
                }
                return newp.promise();
            },
            promise: function(target) {
                if (!this._pro) {
                    this._pro = new this.Promise(this, target);
                }
                return this._pro;
            },
            state: function() {
                return this.internalState;
            }
        });
        p.when = p.prototype.when;
        p.wrap = p.prototype.wrap;
        if (Object.freeze) {
            Object.freeze(p.prototype);
        }
        return p;
    });
})(this);

(function() {
    "use strict";
    var i = 0;
    _.__i__ = function() {
        return i++;
    };
    _.textToDate = function(targetDateRange, current) {
        var data = {
            start: null,
            stop: null,
            text: null
        };
        current = _.isDate(current) && current || current && new Date(current) || new Date();
        if (targetDateRange === "default") {
            targetDateRange = "lastDays7";
        }
        if (targetDateRange === "today") {
            data.start = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 0, 0);
            data.stop = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 23, 59, 59, 999);
        } else if (targetDateRange === "yesterday") {
            data.start = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1, 0, 0);
            data.stop = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1, 23, 59, 59, 999);
        } else if (targetDateRange.match(/^lastDays\d+$/)) {
            var matches = targetDateRange.match(/^lastDays(\d+)$/);
            var days = matches[1];
            data.start = new Date(current.getFullYear(), current.getMonth(), current.getDate() - days, 0, 0);
            data.stop = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 23, 59, 59, 999);
        } else if (targetDateRange === "thisWeek") {
            data.start = new Date(current.getFullYear(), current.getMonth(), current.getDate() - current.getDay(), 0, 0);
            data.stop = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 23, 59, 59, 999);
        } else if (targetDateRange === "thisMonth") {
            data.start = new Date(current.getFullYear(), current.getMonth(), 0, 0, 0);
            data.stop = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 23, 59, 59, 999);
        } else if (targetDateRange === "lastWeek") {
            data.start = new Date(current.getFullYear(), current.getMonth(), current.getDate() - current.getDay() - 7, 0, 0);
            data.stop = new Date(current.getFullYear(), current.getMonth(), current.getDate() - current.getDay() - 1, 23, 59, 59, 999);
        } else if (targetDateRange === "lastMonth") {
            var month = new Date(current.getFullYear(), current.getMonth() - 1, 0, 0, 0);
            data.start = new Date(month.getFullYear(), month.getMonth(), month.getDate() + 1, 0, 0);
            data.stop = new Date(new Date(current.getFullYear(), current.getMonth()).getTime() - 1e3 * 60 * 60 * 24);
        } else if (targetDateRange === "lastMonth3") {
            var month = new Date(current.getFullYear(), current.getMonth() - 3, 0, 0, 0);
            data.start = new Date(month.getFullYear(), month.getMonth(), month.getDate() + 1, 0, 0);
            data.stop = new Date(new Date(current.getFullYear(), current.getMonth()).getTime() - 1e3 * 60 * 60 * 24);
        } else if (targetDateRange === "lastYear") {
            data.start = new Date(current.getFullYear() - 1, 0, 1, 0, 0);
            data.stop = new Date(current.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        }
        data.start = data.start.getTime();
        data.stop = data.stop.getTime();
        data.text = targetDateRange;
        return data;
    };
    _.fileSystemError = function(e) {
        var msg = "";
        switch (e.name) {
          case "QUOTA_EXCEEDED_ERR":
            msg = "QUOTA_EXCEEDED_ERR";
            break;

          case "NOT_FOUND_ERR":
            msg = "NOT_FOUND_ERR";
            break;

          case "SECURITY_ERR":
            msg = "SECURITY_ERR";
            break;

          case "INVALID_MODIFICATION_ERR":
            msg = "INVALID_MODIFICATION_ERR";
            break;

          case "INVALID_STATE_ERR":
            msg = "INVALID_STATE_ERR";
            break;

          default:
            msg = "Unknown Error";
            break;
        }
        console.log("Error: " + msg);
        return;
    };
    _.lockProperty = function(scope, prop) {
        Object.defineProperty(scope, prop, {
            enumerable: true,
            configurable: false,
            writable: false
        });
        return;
    };
    _.createProps = function(scope, props) {
        for (var i = 0; i < props.length; i++) {
            Object.defineProperty(scope, props[i].name, props[i].attrs);
        }
        return;
    };
    _.createProp = function(scope, prop) {
        Object.defineProperty(scope, prop.name, prop.attrs);
        return;
    };
    _.updateProp = function(scope, prop) {
        Object.defineProperty(scope, prop.name, prop.attrs);
        return;
    };
    _.parseVersion = function(version) {
        var versions = version.split(",");
        var resp = {};
        if (versions.length > 1) {
            var start = versions[0].charAt(0);
            var end = versions[1].charAt(versions[1].length - 1);
            if (start == "[") {
                resp.gte = versions[0].substring(1).trim();
            } else if (start == "(" || start == "{") {
                resp.gt = versions[0].substring(1).trim();
            }
            if (end == "]") {
                resp.lte = versions[1].substring(0, versions[1].length - 1).trim();
            } else if (end == ")" || end == "}") {
                resp.lt = versions[1].substring(0, versions[1].length - 1).trim();
            }
        } else {
            resp.eq = versions[0];
        }
        return resp;
    };
    _.sanitizeVersion = function(version) {
        var num = 0;
        var splits = version.split(".");
        var dif = 3 - splits.length;
        for (var i = 0; i < dif; i++) {
            splits.push(0);
        }
        num += parseInt(splits[0], 10) * 1e6;
        num += parseInt(splits[1], 10) * 1e3;
        num += parseInt(splits[2], 10);
        return num;
    };
    _.versionMatch = function(exp, imp) {
        var target = _.sanitizeVersion(exp.eq);
        if (imp.eq && _.sanitizeVersion(imp.eq) != target) return false;
        if (imp.gte && _.sanitizeVersion(imp.gte) > target) return false;
        if (imp.gt && _.sanitizeVersion(imp.gt) >= target) return false;
        if (imp.lte && _.sanitizeVersion(imp.lte) < target) return false;
        if (imp.lt && _.sanitizeVersion(imp.lt) <= target) return false;
        return true;
    };
    _.hash = function(str) {
        if (_.isNormalObject(str)) {
            str = JSON.stringify(str);
        }
        str = _.encode_utf8(str);
        var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
        var crc = 0, x = 0, y = 0;
        crc = crc ^ -1;
        for (var i = 0, iTop = str.length; i < iTop; i++) {
            y = (crc ^ str.charCodeAt(i)) & 255;
            x = "0x" + table.substr(y * 9, 8);
            crc = crc >>> 8 ^ x;
        }
        return crc ^ -1 + 4294967296;
    };
    _.encode_utf8 = function(str) {
        return encodeURIComponent(escape(str));
    };
    _.decode_utf8 = function(str) {
        return unescape(decodeURIComponent(str));
    };
    _.queryStringEncode = function(obj) {
        var ret = [];
        if (_.isNormalObject(obj)) {
            for (var key in obj) {
                ret.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
            }
        }
        return ret.join("&");
    };
    _.queryStringDecode = function(str) {
        str = str.replace(/^\?/, "");
        var ret = {};
        if (_.isString(str)) {
            var pairs = str.split("&");
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split("=");
                ret[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            }
        }
        return ret;
    };
    var linkify_regex = new RegExp("(" + "\\b([a-z][-a-z0-9+.]+://|www\\.)" + "[^\\s'\"<>()]+" + "|" + "\\b[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}\\b" + ")", "gi");
    var youtube_regex = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    _.youtube_parser = function(url) {
        var match = url.match(youtube_regex);
        if (match && match[1].length == 11) {
            return match[1];
        } else {
            return false;
        }
    };
    var vimeo_regex = /http:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/;
    _.vimeo_parser = function(url) {
        var match = url.match(vimeo_regex);
        if (match) {
            return match[2];
        } else {
            return false;
        }
    };
    _.htmlLinkify = function(string) {
        var m;
        var result = "";
        var p = 0;
        while (m = linkify_regex.exec(string)) {
            result += string.substr(p, m.index - p);
            var l = m[0].replace(/\.*$/, "");
            var yt = _.youtube_parser(l);
            var vm = _.vimeo_parser(l);
            if (yt) {
                result += "<div class='video-container'><iframe id='ytplayer' type='text/html' src='http://www.youtube.com/embed/" + yt + "?autoplay=0' frameborder='0' allowfullscreen></iframe></div>";
            } else if (vm) {
                result += "<div class='video-container'><iframe src='http://player.vimeo.com/video/" + vm + "' frameborder='0' allowFullScreen></iframe></div>";
            } else if (l.indexOf("@") > 0) {
                result += '<a target="_blank" href="';
                result += "mailto:";
                result += l + '">' + string.substr(m.index, l.length) + "</a>";
            } else if (l.indexOf(":/") < 0) {
                result += '<a target="_blank" href="';
                result += "http://";
                result += l + '">' + string.substr(m.index, l.length) + "</a>";
            } else {
                result += '<a target="_blank" href="';
                result += l + '">' + string.substr(m.index, l.length) + "</a>";
            }
            p = m.index + l.length;
        }
        return result + string.substr(p);
    };
    _.getCurrentLocationRoute = function() {
        var data = {
            route: window.location.pathname + window.location.hash,
            host: window.location.host,
            pathname: window.location.pathname,
            search: window.location.search,
            href: window.location.href,
            hash: window.location.hash
        };
        data.route = data.route.replace(/\/#\/|\/#|#/, "/");
        data.route = data.route.replace(/^\/|\/$/g, "");
        data.route = data.route.replace(/\//g, ":");
        return data;
    };
    _.getByteLength = function(str) {
        if (str === null || str === undefined) {
            return 0;
        }
        var m = encodeURIComponent(str).match(/%[89ABab]/g);
        return str.length + (m ? m.length : 0);
    };
    _.getOption = function(target, optionName) {
        if (!target || !optionName) {
            return;
        }
        if (target.options && optionName in target.options && target.options[optionName] !== undefined) {
            return target.options[optionName];
        } else {
            return target[optionName];
        }
    };
    _.dirtyKeys = function(a, b, keys, options) {
        options = options || {};
        keys = keys || null;
        a = a || {};
        b = b || {};
        var aKeys, bKeys;
        var dirtyKeys = {};
        var keysArray;
        var i = 0;
        var tempAKeys = Object.keys(a);
        var tempBKeys = Object.keys(b);
        if (keys) {
            aKeys = keys;
            bKeys = keys;
            for (var i = 0; i < keys.length; i++) {
                if (tempAKeys.indexOf(keys[i]) === -1 || tempBKeys.indexOf(keys[i]) === -1) {
                    return false;
                }
            }
        } else {
            aKeys = tempAKeys;
            bKeys = tempBKeys;
        }
        for (i = 0; i < aKeys.length; i++) {
            dirtyKeys[aKeys[i]] = dirtyKeys[aKeys[i]] || {};
            dirtyKeys[aKeys[i]].aVal = a[aKeys[i]];
        }
        for (i = 0; i < bKeys.length; i++) {
            dirtyKeys[bKeys[i]] = dirtyKeys[bKeys[i]] || {};
            dirtyKeys[bKeys[i]].bVal = b[bKeys[i]];
            if (typeof dirtyKeys[bKeys[i]].aVal !== "undefined" && _.isEqual(dirtyKeys[bKeys[i]].aVal, dirtyKeys[bKeys[i]].bVal, null, options) || typeof dirtyKeys[bKeys[i]].aVal === "undefined" && typeof dirtyKeys[bKeys[i]].bVal === "undefined") {
                delete dirtyKeys[bKeys[i]];
            }
        }
        keysArray = Object.keys(dirtyKeys);
        for (i = 0; i < keysArray.length; i++) {
            dirtyKeys[keysArray[i]].diff = _.diffValues(dirtyKeys[keysArray[i]].aVal, dirtyKeys[keysArray[i]].bVal, options);
        }
        return dirtyKeys;
    };
    _.diffValues = function(a, b, options) {
        options = options || {
            arrayOrderMatters: false
        };
        var aType, bType;
        if (typeof a === "undefined") {
            aType = "undefined";
        } else {
            aType = Object.prototype.toString.call(a);
        }
        if (typeof b === "undefined") {
            bType = "undefined";
        } else {
            bType = Object.prototype.toString.call(b);
        }
        if (aType !== bType) {
            return {
                from: {
                    type: aType,
                    value: a
                },
                to: {
                    type: bType,
                    value: b
                }
            };
        } else {
            switch (aType) {
              case "[object Object]":
                return {
                    objectChange: _.dirtyKeys(a, b)
                };
                break;

              case "[object Array]":
                var ret = {
                    removed: [],
                    added: [],
                    changed: []
                };
                if (options.arrayOrderMatters) {
                    var i, j;
                    var iMax = a.length;
                    var jMax = b.length;
                    while (i < iMax && j < jMax) {
                        if (_.isEqual(a[i], b[j])) {
                            i++;
                            j++;
                        }
                        if (j < jMax && i < iMax) {
                            ret.changed.push({
                                index: i,
                                from: a[i],
                                to: b[j],
                                diff: _.diffValues(a[i], b[j], options)
                            });
                            j++;
                            i++;
                        } else if (i < iMax && j >= jMax) {
                            ret.removed.push({
                                index: i,
                                from: a[i],
                                to: null
                            });
                            i++;
                        } else if (j < jMax && i >= iMax) {
                            ret.added.push({
                                index: i,
                                from: null,
                                to: b[j]
                            });
                            i++;
                        }
                    }
                    return ret;
                } else {
                    var aIndexesMatched = [];
                    var bIndexesMatched = [];
                    var aIndexMatched, bIndexMatched, i = 0, j = 0;
                    for (i = 0; i < a.length; i++) {
                        aIndexMatched = false;
                        for (j = 0; j < b.length; j++) {
                            if (_.isEqual(a[i], b[j])) {
                                aIndexMatched = true;
                                aIndexesMatched.push(i);
                                bIndexesMatched.push(j);
                                break;
                            }
                        }
                        if (!aIndexMatched) {
                            ret.removed.push({
                                index: null,
                                from: a[i],
                                to: null
                            });
                        }
                    }
                    for (j = 0; j < b.length; j++) {
                        bIndexMatched = false;
                        if (bIndexesMatched.indexOf(j) >= 0) {
                            continue;
                        }
                        ret.added.push({
                            index: null,
                            from: null,
                            to: b[j]
                        });
                    }
                    return ret;
                }
                break;

              default:
                return {
                    from: {
                        type: aType,
                        value: a
                    },
                    to: {
                        type: bType,
                        value: b
                    }
                };
                break;
            }
        }
    };
    _.isDirtyEqual = function(a, b, keys, options) {
        keys = keys || null;
        options = options || {};
        var aKeys, bKeys, aType, bType;
        if (a === b || a == b) {
            return true;
        }
        aType = Object.prototype.toString.call(a);
        bType = Object.prototype.toString.call(b);
        if (aType !== bType) {
            return false;
        }
        switch (aType) {
          case "[object Object]":
            var tempAKeys = Object.keys(a);
            var tempBKeys = Object.keys(b);
            if (keys) {
                aKeys = keys;
                bKeys = keys;
                if (options.ignoreKeys !== true) {
                    for (var i = 0; i < keys.length; i++) {
                        if (tempAKeys.indexOf(keys[i]) === -1 || tempBKeys.indexOf(keys[i]) === -1) {
                            return false;
                        }
                    }
                }
            } else {
                aKeys = tempAKeys;
                bKeys = tempBKeys;
            }
            if (aKeys.length !== bKeys.length) {
                return false;
            }
            if (keys || _.isDirtyEqual(aKeys, bKeys, null, options)) {
                for (var i = 0; i < aKeys.length; i++) {
                    if (!_.isDirtyEqual(a[aKeys[i]], b[bKeys[i]], null, options)) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
            break;

          case "[object Array]":
            if (a.length !== b.length) {
                return false;
            }
            for (var i = 0; i < a.length; i++) {
                if (!_.isDirtyEqual(a[i], b[i], null, options)) {
                    return false;
                }
            }
            return true;
            break;

          case "[object Function]":
            if (a.toString() !== b.toString()) {
                return false;
            }
            break;

          case "[object Number]":
            if (a != b) {
                return false;
            }
            break;

          case "[object Date]":
            if (a.getTime() != b.getTime()) {
                return false;
            } else {
                return true;
            }
            break;
        }
        return false;
    };
    _.isNormalObject = function(item) {
        return Boolean(item) && Object.prototype.toString.call(item) === "[object Object]";
    };
    var isUrnRegex = /^[^:]+:.*[^:]$/;
    _.isUrn = function(urn) {
        return _.isString(urn) && isUrnRegex.exec(urn);
    };
    _.isRegex = _.isRegExp;
    _.genericizeTargetSelectorQueryString = function(ele) {
        var qs = [];
        if (ele.globalSelectorString != "" && ele.globalSelectorString != null && ele.globalSelectorString != undefined) {
            return ele.globalSelectorString;
        }
        qs = recursiveGenericizeTargetSelectorQueryString(ele, qs);
        qs = qs.join(" > ");
        ele.globalSelectorString = qs;
        return qs;
    };
    function recursiveGenericizeTargetSelectorQueryString(ele, qs) {
        if (ele.tagName == "BODY" || ele.tagName == "body") {
            qs.unshift("body");
            return qs;
        } else {
            var id = "#" + ele.id;
            if (id != "#") {
                qs.unshift(id);
                return qs;
            }
            var className = "." + ele.className.split(" ").join(".");
            if (className !== ".") {
                var siblings = ele.parentNode.children;
                var siblingsThatMatter = [];
                for (var i = 0; i < siblings.length; i++) {
                    if (siblings[i].className.split(" ").join(".") == className) {
                        siblingsThatMatter.push(siblings[i]);
                    }
                }
                if (siblingsThatMatter.length > 1) {
                    var index = Array.prototype.indexOf.call(siblingsThatMatter, ele) + 1;
                    className = className + ":nth-child(" + index + ")";
                }
                qs.unshift(className);
                return recursiveGenericizeTargetSelectorQueryString(ele.parentNode, qs);
            }
            var tagName = ele.tagName;
            var siblings = ele.parentNode.children;
            var siblingsThatMatter = [];
            for (var i = 0; i < siblings.length; i++) {
                if (siblings[i].tagName == tagName) {
                    siblingsThatMatter.push(siblings[i]);
                }
            }
            if (siblingsThatMatter.length > 1) {
                var index = Array.prototype.indexOf.call(siblingsThatMatter, ele) + 1;
                tagName = tagName + ":nth-child(" + index + ")";
            }
            qs.unshift(tagName);
            return recursiveGenericizeTargetSelectorQueryString(ele.parentNode, qs);
        }
    }
    _.whiteListDomEvent = function(e, ele) {
        ele = ele || e.currentTarget;
        var data = {
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey,
            button: e.button,
            charCode: e.charCode,
            keyCode: e.keyCode,
            which: e.which,
            clientX: e.clientX,
            clientY: e.clientY,
            screenX: e.screenX,
            screenY: e.screenY,
            x: e.x,
            y: e.y,
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            pageX: e.pageX,
            pageY: e.pageY,
            layerX: e.layerX,
            layerY: e.layerY,
            webkitMovementX: e.webkitMovementX,
            movementX: e.movementX,
            webkitMovementY: e.webkitMovementY,
            movementY: e.movementY,
            timeStamp: e.timeStamp,
            type: e.type,
            target: _.genericizeTargetSelectorQueryString(e.target),
            currentTarget: _.genericizeTargetSelectorQueryString(ele),
            clipboardData: e.clipboardData,
            targetValue: e.target.value,
            currentTargetValue: e.currentTarget.value
        };
        return data;
    };
    _.preallocateXhrs = function(keys) {
        var resp = {
            dfds: {},
            pros: []
        };
        for (var i = 0; i < keys.length; i++) {
            resp.dfds[keys[i]] = new _.Dfd();
            resp.pros.push(resp.dfds[keys[i]].promise());
        }
        return resp;
    };
    _.viewHelpers = {
        roundAndPad: function(number, howManyToRound, howManyToPad, roundFunc) {
            number = number || 0;
            howManyToRound = "" + Math.pow(10, howManyToRound);
            var numberArray = ("" + Math[roundFunc](number * howManyToRound) / howManyToRound).split(".");
            if (!numberArray[1]) {
                numberArray[1] = "";
                for (var i = 0; i < howManyToPad; i++) {
                    numberArray[1] = numberArray[1] + "0";
                }
            } else {
                for (var j = 1; j < howManyToPad - numberArray[1].length; j++) {
                    numberArray[1] = numberArray[1] + "0";
                }
            }
            if (!numberArray[1]) {
                return numberArray[0];
            } else {
                return numberArray[0] + "." + numberArray[1];
            }
        },
        isDate: _.isDate,
        roundThreeAndPad: function(number) {
            var numberArray = ("" + Math.round(number * 1e3) / 1e3).split(".");
            if (!numberArray[1]) {
                numberArray[1] = "000";
            } else if (numberArray[1].length === 1) {
                numberArray[1] = "" + numberArray[1] + "00";
            } else if (numberArray[1].length === 2) {
                numberArray[1] = "" + numberArray[1] + "0";
            }
            return numberArray[0] + "." + numberArray[1];
        },
        canonicalizeMenu: function(menu) {
            var canonicalMenu = canonicalMenu || {};
            for (var i = 0; i < menu.length; i++) {
                var menuData = menu[i].data;
                var conflictData = {};
                var conflictsCounter = {};
                for (var menuName in menuData) {
                    canonicalMenu[menuName] = canonicalMenu[menuName] || {
                        children: menuData[menuName]["children"],
                        "class": menuData[menuName]["class"],
                        name: menuData[menuName]["name"],
                        link: menuData[menuName]["link"],
                        parentClass: menuData[menuName]["parentClass"]
                    };
                    if (Object.keys(canonicalMenu[menuName].children).length === 0 && Object.keys(menuData[menuName].children).length === 0) {} else {
                        if (Object.keys(menuData[menuName].children).length === 0 || Object.keys(canonicalMenu[menuName].children).length === 0) {
                            conflictsCounter[menuName] = conflictsCounter[menuName] || 0;
                            conflictsCounter[menuName]++;
                            conflictData[menuName + " (" + conflictsCounter[menuName] + ")"] = menuData[menuName];
                        } else {
                            canonicalMenu[menuName].children = _.viewHelpers.canonicalizeMenuChildren(canonicalMenu[menuName].children, menuData[menuName].children || {});
                        }
                    }
                }
                for (var menuName in conflictData) {
                    canonicalMenu[menuName] = canonicalMenu[menuName] || {
                        children: conflictData[menuName]["children"],
                        "class": conflictData[menuName]["class"],
                        name: conflictData[menuName]["name"],
                        link: conflictData[menuName]["link"],
                        parentClass: conflictData[menuName]["parentClass"]
                    };
                    if (Object.keys(canonicalMenu[menuName].children).length === 0 && Object.keys(conflictData[menuName].children).length === 0) {} else {
                        canonicalMenu[menuName].children = _.viewHelpers.canonicalizeMenuChildren(canonicalMenu[menuName].children, conflictData[menuName].children || {});
                    }
                }
            }
            return canonicalMenu;
        },
        canonicalizeMenuChildren: function(currentChildren, newChildren) {
            if (!currentChildren && !newChildren) {
                return {};
            }
            var canonicalizedChildren = {};
            var key;
            for (key in currentChildren) {
                canonicalizedChildren[key] = currentChildren[key];
                if (newChildren[key]) {
                    canonicalizedChildren[key].children = _.viewHelpers.canonicalizeMenuChildren(currentChildren[key].children, newChildren[key].children);
                    canonicalizedChildren[key]["class"] = currentChildren[key]["class"] + " " + newChildren[key]["class"];
                    canonicalizedChildren[key]["name"] = currentChildren[key]["name"] + " " + newChildren[key]["name"];
                    canonicalizedChildren[key]["link"] = newChildren[key]["link"];
                }
            }
            for (key in newChildren) {
                if (!canonicalizedChildren[key]) {
                    canonicalizedChildren[key] = newChildren[key];
                }
            }
            return canonicalizedChildren;
        },
        prettifyDate: function(firstTime, lastTime) {
            if (lastTime && lastTime.getTime) {
                lastTime = lastTime.getTime();
            } else if (lastTime) {
                lastTime = new Date(lastTime).getTime();
            } else {
                lastTime = new Date().getTime();
            }
            if (firstTime && firstTime.getTime) {
                firstTime = firstTime.getTime();
            } else if (firstTime) {
                firstTime = new Date(firstTime).getTime();
            } else {
                firstTime = new Date().getTime();
            }
            var diff = Math.abs(lastTime - firstTime);
            var days = diff / (1e3 * 60 * 60 * 24);
            var hours = days % 1 * 24;
            var minutes = hours % 1 * 60;
            var seconds = minutes % 1 * 60;
            days = Math.floor(days);
            hours = Math.floor(hours);
            minutes = Math.floor(minutes);
            seconds = Math.floor(seconds);
            if (days) {
                days += "d ";
                hours += "hr";
                return days + hours;
            } else if (hours) {
                hours += "hr ";
                minutes += "m";
                return hours + minutes;
            } else if (minutes) {
                if (minutes < 10 && seconds > 0) {
                    minutes += "m ";
                    seconds += "s";
                    return minutes + seconds;
                } else {
                    minutes += "m";
                    return minutes;
                }
            } else {
                seconds += "s";
                return seconds;
            }
        },
        formatDate: function(format, date) {
            var ret = "";
            if (!_.isDate(date)) {
                date = new Date(date);
                if (!_.isDate(date)) {
                    date = new Date();
                }
            }
            ret = date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
            return ret;
        },
        formatTime: function(format, date) {
            var ret = "";
            if (!_.isDate(date)) {
                date = new Date(date);
                if (!_.isDate(date)) {
                    date = new Date();
                }
            }
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var AMPM;
            if (hours >= 12) {
                hours -= 12;
                AMPM = "PM";
            } else {
                AMPM = "AM";
            }
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            ret = hours + ":" + minutes + " " + AMPM;
            return ret;
        },
        escapeHtml: _.escape,
        escape: _.escape
    };
    return _;
})();

(function() {
    "use strict";
    _.enableRetardMode = function() {
        if (!Object.keys) {
            Object.keys = function() {
                "use strict";
                var hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !{
                    toString: null
                }.propertyIsEnumerable("toString"), dontEnums = [ "toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor" ], dontEnumsLength = dontEnums.length;
                return function(obj) {
                    if (typeof obj !== "object" && (typeof obj !== "function" || obj === null)) {
                        throw new TypeError("Object.keys called on non-object");
                    }
                    var result = [], prop, i;
                    for (prop in obj) {
                        if (hasOwnProperty.call(obj, prop)) {
                            result.push(prop);
                        }
                    }
                    if (hasDontEnumBug) {
                        for (i = 0; i < dontEnumsLength; i++) {
                            if (hasOwnProperty.call(obj, dontEnums[i])) {
                                result.push(dontEnums[i]);
                            }
                        }
                    }
                    return result;
                };
            }();
        }
        if (!Object.create) {
            Object.create = function() {
                function F() {}
                return function(o) {
                    if (arguments.length != 1) {
                        throw new Error("Object.create implementation only accepts one parameter.");
                    }
                    F.prototype = o;
                    return new F();
                };
            }();
        }
        if (!Object.freeze) {
            Object.freeze = function(obj) {
                return obj;
            };
            Object.isFrozen = function() {
                return false;
            };
        }
        if (!Object.seal) {
            Object.seal = function(obj) {
                return obj;
            };
            Object.isSealed = function() {
                return false;
            };
        }
        if (!Object.preventExtensions) {
            Object.preventExtensions = function(obj) {
                return obj;
            };
            Object.isExtensible = function() {
                return false;
            };
        }
        if (!Function.prototype.bind) {
            Function.prototype.bind = function(oThis) {
                if (typeof this !== "function") {
                    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                }
                var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function() {}, fBound = function() {
                    return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                };
                fNOP.prototype = this.prototype;
                fBound.prototype = new fNOP();
                return fBound;
            };
        }
        if (!Array.prototype.forEach) {
            Array.prototype.forEach = function forEach(callback, thisArg) {
                "use strict";
                var T, k;
                if (this == null) {
                    throw new TypeError("this is null or not defined");
                }
                var kValue, O = Object(this), len = O.length >>> 0;
                if ({}.toString.call(callback) !== "[object Function]") {
                    throw new TypeError(callback + " is not a function");
                }
                if (arguments.length >= 2) {
                    T = thisArg;
                }
                k = 0;
                while (k < len) {
                    if (k in O) {
                        kValue = O[k];
                        callback.call(T, kValue, k, O);
                    }
                    k++;
                }
            };
        }
        if (!Array.prototype.map) {
            Array.prototype.map = function(callback, thisArg) {
                var T, A, k;
                if (this == null) {
                    throw new TypeError(" this is null or not defined");
                }
                var O = Object(this);
                var len = O.length >>> 0;
                if (typeof callback !== "function") {
                    throw new TypeError(callback + " is not a function");
                }
                if (thisArg) {
                    T = thisArg;
                }
                A = new Array(len);
                k = 0;
                while (k < len) {
                    var kValue, mappedValue;
                    if (k in O) {
                        kValue = O[k];
                        mappedValue = callback.call(T, kValue, k, O);
                        A[k] = mappedValue;
                    }
                    k++;
                }
                return A;
            };
        }
        if (!Array.prototype.filter) {
            Array.prototype.filter = function(fun) {
                "use strict";
                if (!this) {
                    throw new TypeError();
                }
                var objects = Object(this);
                var len = objects.length >>> 0;
                if (typeof fun !== "function") {
                    throw new TypeError();
                }
                var res = [];
                var thisp = arguments[1];
                for (var i in objects) {
                    if (objects.hasOwnProperty(i)) {
                        if (fun.call(thisp, objects[i], i, objects)) {
                            res.push(objects[i]);
                        }
                    }
                }
                return res;
            };
        }
        if (!("every" in Array.prototype)) {
            Array.prototype.every = function(tester, that) {
                for (var i = 0, n = this.length; i < n; i++) if (i in this && !tester.call(that, this[i], i, this)) return false;
                return true;
            };
        }
        if (!("some" in Array.prototype)) {
            Array.prototype.some = function(tester, that) {
                for (var i = 0, n = this.length; i < n; i++) if (i in this && tester.call(that, this[i], i, this)) return true;
                return false;
            };
        }
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(searchElement) {
                "use strict";
                if (this == null) {
                    throw new TypeError();
                }
                var n, k, t = Object(this), len = t.length >>> 0;
                if (len === 0) {
                    return -1;
                }
                n = 0;
                if (arguments.length > 1) {
                    n = Number(arguments[1]);
                    if (n != n) {
                        n = 0;
                    } else if (n != 0 && n != Infinity && n != -Infinity) {
                        n = (n > 0 || -1) * Math.floor(Math.abs(n));
                    }
                }
                if (n >= len) {
                    return -1;
                }
                for (k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) {
                    if (k in t && t[k] === searchElement) {
                        return k;
                    }
                }
                return -1;
            };
        }
        if (!String.prototype.trim) {
            String.prototype.trim = function() {
                return this.replace(/^\s+|\s+$/g, "");
            };
        }
        if (typeof Array.prototype.lastIndexOf === "undefined") {
            Array.prototype.lastIndexOf = function(find, i) {
                if (i === undefined) i = this.length - 1;
                if (i < 0) i += this.length;
                if (i > this.length - 1) i = this.length - 1;
                for (i++; i-- > 0; ) if (i in this && this[i] === find) return i;
                return -1;
            };
        }
    };
})();

(function(global, undefined) {
    "use strict";
    var nextHandle = 1;
    var freeHandle;
    var cbsByHandle = [];
    var argsByHandle = [];
    var howMany = 0;
    global.setImmediateDebug = function() {
        return {
            nextHandle: nextHandle,
            freeHandle: freeHandle,
            cbsByHandle: cbsByHandle,
            argsByHandle: argsByHandle,
            howMany: howMany
        };
    };
    var handle;
    function addFromSetImmediate(cb, args) {
        handle = freeHandle !== undefined ? freeHandle : nextHandle++;
        cbsByHandle[handle] = cb;
        argsByHandle[handle] = args;
        freeHandle = undefined;
        return handle;
    }
    function runIfPresent(key) {
        key = parseInt(key, 10);
        cbsByHandle[key] ? cbsByHandle[key].apply(undefined, argsByHandle[key]) : false;
        freeHandle = key;
        howMany++;
    }
    function canUseNextTick() {
        return typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";
    }
    function canUsePostMessage() {
        if (!global.postMessage || global.importScripts) {
            return false;
        }
        var postMessageIsAsynchronous = true;
        var oldOnMessage = global.onmessage;
        global.onmessage = function() {
            postMessageIsAsynchronous = false;
        };
        global.postMessage("", "*");
        global.onmessage = oldOnMessage;
        return postMessageIsAsynchronous;
    }
    function canUseMessageChannel() {
        return !!global.MessageChannel;
    }
    function installNextTickImplementation(attachTo) {
        attachTo.setImmediate = function() {
            var args = arguments;
            process.nextTick(function() {
                args[0].call(undefined, Array.prototype.slice.call(args, 1));
            });
        };
    }
    function installPostMessageImplementation(attachTo) {
        var MESSAGE_PREFIX = "com.setImmediate" + Math.random();
        var MESSAGE_PREFIX_LENGTH = MESSAGE_PREFIX.length;
        function isStringAndStartsWith(string) {
            return typeof string === "string" && string.substring(0, MESSAGE_PREFIX_LENGTH) === MESSAGE_PREFIX;
        }
        function onGlobalMessage(event) {
            if (event.source === global && isStringAndStartsWith(event.data)) {
                runIfPresent(event.data.substring(MESSAGE_PREFIX_LENGTH));
            }
        }
        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }
        attachTo.setImmediate = function() {
            var cb = arguments[0];
            var args = Array.prototype.slice.call(arguments, 1);
            global.postMessage(MESSAGE_PREFIX + addFromSetImmediate(cb, args), "*");
        };
    }
    function installMessageChannelImplementation(attachTo) {
        var channel = new global.MessageChannel();
        channel.port1.onmessage = function(event) {
            runIfPresent(event.data);
        };
        attachTo.setImmediate = function() {
            var cb = arguments[0];
            var args = Array.prototype.slice.call(arguments, 1);
            channel.port2.postMessage(addFromSetImmediate(cb, args));
        };
    }
    function installSetTimeoutImplementation(attachTo) {
        attachTo.setImmediate = function() {
            var cb = arguments[0];
            var args = Array.prototype.slice.call(arguments, 1);
            global.setTimeout(function() {
                cb.call(undefined, args);
            }, 0);
        };
    }
    if (!global.setImmediate) {
        var attachTo = typeof Object.getPrototypeOf === "function" && "setTimeout" in Object.getPrototypeOf(global) ? Object.getPrototypeOf(global) : global;
        if (canUseNextTick()) {
            installNextTickImplementation(attachTo);
        } else if (canUsePostMessage()) {
            installPostMessageImplementation(attachTo);
        } else if (canUseMessageChannel()) {
            installMessageChannelImplementation(attachTo);
        } else {
            installSetTimeoutImplementation(attachTo);
        }
    }
})(typeof self === "object" && self ? self : this);

(function() {
    "use strict";
    Set.prototype = Object.create(Object.prototype);
    Set.prototype.get = function(key) {
        return this.find(key);
    };
    Set.prototype.has = function(key) {
        if (this.find(key)) {
            return true;
        }
        return false;
    };
    Set.prototype.toString = function() {
        return "[object Set]";
    };
    if (Object.defineProperties) {
        Object.defineProperty(Set.prototype, "get", {
            enumerable: false,
            writable: false
        });
        Object.defineProperty(Set.prototype, "has", {
            enumerable: false,
            writable: false
        });
        Object.defineProperty(Set.prototype, "toString", {
            enumerable: false,
            writable: false
        });
    }
    function Set(seed) {
        var innerData = [];
        if (seed !== null && seed != undefined && typeof seed !== "undefined") innerData = seed;
        this.add = function(key) {
            if (this.find(key) === undefined) innerData.push(key);
        };
        this["delete"] = function(key) {
            var i = 0;
            for (i; i < innerData.length; i++) {
                if (innerData[i] === key) {
                    innerData.splice(i, 1);
                    break;
                }
            }
        };
        this.size = function() {
            return innerData.length;
        };
        this.find = function(key) {
            var ret = undefined;
            for (var i = 0; i < innerData.length; i++) {
                if (innerData[i] === key) {
                    ret = innerData[i];
                    break;
                }
            }
            return ret;
        };
        this.toJSON = function() {
            return innerData;
        };
        if (Object.defineProperties) {
            Object.defineProperty(this, "add", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "delete", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "size", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "toJSON", {
                enumerable: false,
                writable: false
            });
        }
        return this;
    }
    _.Set = Set;
})();

(function() {
    "use strict";
    Map.prototype = Object.create(Object.prototype);
    Map.prototype.get = function(key) {
        var res = this.find(key);
        if (res) {
            return res.val;
        }
        return null;
    };
    Map.prototype.has = function(key) {
        if (this.find(key)) {
            return true;
        }
        return false;
    };
    Map.prototype.toString = function() {
        return "[object Map]";
    };
    if (Object.defineProperties) {
        Object.defineProperty(Map.prototype, "get", {
            enumerable: false,
            writable: false
        });
        Object.defineProperty(Map.prototype, "has", {
            enumerable: false,
            writable: false
        });
        Object.defineProperty(Map.prototype, "toString", {
            enumerable: false,
            writable: false
        });
    }
    function Map(seed) {
        var innerData = [];
        this.find = function(key) {
            var ret = undefined;
            for (var i = 0; i < innerData.length; i++) {
                if (innerData[i].key === key) {
                    ret = innerData[i];
                    break;
                }
            }
            return ret;
        };
        this.size = function() {
            return innerData.length;
        };
        this.set = function(key, val) {
            var res = this.find(key);
            if (res != undefined) {
                res.val = val;
            } else {
                innerData.push({
                    key: key,
                    val: val
                });
            }
            return;
        };
        this["delete"] = function(key) {
            var i = 0;
            for (i; i < innerData.length; i++) {
                if (innerData[i].key === key) {
                    innerData.splice(i, 1);
                    break;
                }
            }
        };
        this.toJSON = function() {
            return innerData;
        };
        if (Object.defineProperties) {
            Object.defineProperty(this, "find", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "size", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "set", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "delete", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "toJSON", {
                enumerable: false,
                writable: false
            });
        }
        if (!_.isArray(seed)) {
            seed = _.pairs(seed);
        }
        for (var i = 0; i < seed.length; i++) {
            var val = seed[i];
            if (_.isArray(val)) {
                this.set(val[0], val[1]);
            } else {
                for (var prop in val) {
                    this.set(prop, val[prop]);
                }
            }
        }
        return this;
    }
    _.Map = Map;
})();

(function() {
    "use strict";
    WeakMap.prototype = Object.create(Object.prototype);
    WeakMap.prototype.get = function(key) {
        var res = this.find(key);
        if (res) return res.val;
    };
    WeakMap.prototype.has = function(key) {
        if (this.find(key)) return true; else return false;
    };
    WeakMap.prototype.toString = function() {
        return "[object WeakMap]";
    };
    if (Object.defineProperties) {
        Object.defineProperty(WeakMap.prototype, "get", {
            enumerable: false,
            writable: false
        });
        Object.defineProperty(WeakMap.prototype, "has", {
            enumerable: false,
            writable: false
        });
        Object.defineProperty(WeakMap.prototype, "toString", {
            enumerable: false,
            writable: false
        });
    }
    function WeakMap(seed) {
        var innerData = [];
        var that = this;
        that.explanation = "This is a Shim polyfil for the concept of a ES6.WeakMap.";
        that.find = function(key) {
            var ret = undefined;
            for (var i = 0; i < innerData.length; i++) {
                if (innerData[i].key === key) {
                    ret = innerData[i];
                    break;
                }
            }
            return ret;
        };
        that.size = function() {
            return innerData.length;
        };
        that.set = function(key, val) {
            var res = this.find(key);
            if (res != undefined) {
                res.val = val;
            } else {
                innerData.push({
                    key: key,
                    val: val
                });
            }
            return;
        };
        that["delete"] = function(key) {
            var i = 0;
            for (i; i < innerData.length; i++) {
                if (innerData[i].key === key) ;
                break;
            }
            innerData.splice(i, 1);
        };
        that.toJSON = function() {
            return innerData;
        };
        if (Object.defineProperties) {
            Object.defineProperty(that, "find", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(that, "size", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(that, "set", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(that, "delete", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(that, "toJSON", {
                enumerable: false,
                writable: false
            });
        }
        if (!_.isArray(seed)) seed = _.pairs(seed);
        for (var i = 0; i < seed.length; i++) {
            var val = seed[i];
            if (_.isArray(val)) {
                this.set(val[0], val[1]);
            } else {
                for (var prop in val) {
                    this.set(prop, val[prop]);
                }
            }
        }
        return that;
    }
    _.WeakMap = WeakMap;
})();

(function() {
    "use strict";
    Capped.prototype = Object.create(Array.prototype);
    Capped.prototype.toString = function() {
        return "[object Capped]";
    };
    if (Object.defineProperties) {
        Object.defineProperty(Capped.prototype, "toString", {
            enumerable: false,
            writable: false
        });
    }
    function Capped(args, seed) {
        args = args || {};
        _.defaults(args, {
            size: 1e3,
            rotate: true
        });
        var that = this;
        that.push = function() {
            var ms = Array.prototype.slice.call(arguments, 0);
            if (args.rotate === true) {
                Array.prototype.push.apply(this, ms);
                var over = this.length - args.size;
                if (over > 0) {
                    Array.prototype.splice.call(this, 0, over);
                }
            } else {
                var that = this;
                var diff = args.size - this.length;
                var toPush = ms.splice(0, diff);
                Array.prototype.push.apply(that, toPush);
            }
            return this.length;
        };
        that.unshift = function() {
            var ms = Array.prototype.slice.call(arguments, 0);
            if (args.rotate === true) {
                Array.prototype.unshift.apply(this, ms);
                var over = this.length - args.size;
                if (over > 0) {
                    Array.prototype.splice.call(this, -over, over);
                }
            } else {
                var that = this;
                var diff = args.size - this.length;
                var toShift = ms.splice(0, diff);
                Array.prototype.unshift.apply(that, toShift);
            }
            return this.length;
        };
        that.splice = function() {
            var ms = Array.prototype.slice.call(arguments, 0);
            var where = ms.shift();
            var howMany = ms.shift();
            var toAdd = ms;
            var ret = Array.prototype.splice.call(this, where, howMany);
            if (args.rotate === true) {
                toAdd.unshift(0);
                toAdd.unshift(where);
                Array.prototype.splice.apply(this, toAdd);
                var over = this.length - args.size;
                if (over > 0) {
                    Array.prototype.splice.call(this, -over, over);
                }
            } else {
                var that = this;
                var diff = args.size - this.length;
                var toSplice = toAdd.splice(0, diff);
                toSplice.unshift(0);
                toSplice.unshift(where);
                Array.prototype.splice.apply(this, toSplice);
            }
            return ret;
        };
        if (Object.defineProperties) {
            Object.defineProperty(that, "push", {
                enumerable: false,
                writable: false,
                configurable: false
            });
        }
        if (Object.defineProperties) {
            Object.defineProperty(that, "unshift", {
                enumerable: false,
                writable: false,
                configurable: false
            });
        }
        if (Object.defineProperties) {
            Object.defineProperty(that, "splice", {
                enumerable: false,
                writable: false,
                configurable: false
            });
        }
        if (seed) {
            for (var i = 0; i < seed.length; i++) {
                that.push(seed[i]);
            }
        }
        return that;
    }
    _.Capped = Capped;
})();

(function() {
    "use strict";
    function extend(dest, source) {
        for (var prop in source) {
            dest[prop] = source[prop];
        }
        return dest;
    }
    function callback(scope, data, cbs) {
        cbs = cbs || [];
        for (var i = 0; i < cbs.length; i++) {
            setTimeout(function(i) {
                cbs[i].call(scope, data);
            }, 0, i);
        }
    }
    function sanitizeCbs(cbs) {
        if (cbs && {}.toString.call(cbs) !== "[object Array]") {
            cbs = [ cbs ];
        }
        return cbs;
    }
    var State = function(options) {
        var that = this;
        options = options || {
            initState: "new",
            states: [ "new" ]
        };
        options.sync = options.sync || false;
        this.data = null;
        this.internalState = options.initState;
        this.states = [];
        this.callbacks = {
            all: {
                enter: [],
                leave: [],
                on: [],
                notify: []
            }
        };
        this.addStates(options.states);
        this.trigger = function(data, cbs) {
            callback(that, data, cbs);
        };
        if (Object.defineProperties) {
            Object.defineProperties(this, {
                internalState: {
                    enumerable: false,
                    writable: true,
                    configurable: false
                },
                states: {
                    enumerable: false,
                    writable: false,
                    configurable: false
                },
                callbacks: {
                    enumerable: false,
                    writable: false,
                    configurable: false
                }
            });
        }
        if (Object.seal) {
            Object.seal(this);
        }
        if (Object.freeze) {
            Object.freeze(State.prototype);
        }
        return this;
    };
    extend(State.prototype, {
        toString: function() {
            return "[object StateMachine]";
        },
        Promise: function(fsm, target) {
            this.toString = function() {
                return "[object StatePromise]";
            };
            this.on = fsm.done.bind(fsm);
            this.state = fsm.state.bind(fsm);
            this.getStates = fsm.getStates.bind(fsm);
            return this;
        },
        on: function(state, cbs, constraint) {
            constraint = constraint || "on";
            cbs = sanitizeCbs(cbs);
            if (cbs.length > 0) {
                var currentState = this.state();
                this.callbacks[state][constraint] = this.callbacks[state][constraint].concat(cbs);
            }
            return;
        },
        go: function(state, data) {
            data = data || {};
            this.data = data;
            if (state != this.state()) {
                var args = {
                    leavingState: this.state(),
                    enteringState: state,
                    data: data
                };
                var cbs = [];
                cbs = cbs.concat(this.callbacks.all.leave).concat(this.callbacks[this.state()].leave);
                this.trigger(args, cbs);
                cbs = [];
                cbs = cbs.concat(this.callbacks.all.enter).concat(this.callbacks[state].enter);
                this.trigger(args, cbs);
                this.setState(state);
                cbs = [];
                cbs = cbs.concat(this.callbacks.all.on).concat(this.callbacks[state].on);
                this.trigger(args, cbs);
            } else {
                var cbs = [];
                var args = {
                    leavingState: state,
                    enteringState: state,
                    data: data
                };
                cbs = cbs.concat(this.callbacks.all.notify).concat(this.callbacks[state].notify);
                this.trigger(args, cbs);
            }
            return;
        },
        addStates: function(states) {
            if (!(states && {}.toString.call(states) === "[object Array]")) {
                states = [ states ];
            }
            states.forEach(function(state) {
                this.states.push(state);
                this.callbacks[state] = this.callbacks[state] || {
                    enter: [],
                    leave: [],
                    on: [],
                    notify: []
                };
            }, this);
        },
        removeStates: function(states) {
            if (!(states && {}.toString.call(states) === "[object Array]")) {
                states = [ states ];
            }
            var toKill = [];
            for (var i = 0; i < this.states.length; i++) {
                if (this.states[i] in states) {
                    toKill.push(i);
                    delete this.callbacks[this.states[i]];
                }
            }
            toKill.forEach(function(index) {
                this.states.splice(index, 1);
            }, this);
        },
        getStates: function() {
            return this.states;
        },
        state: function() {
            return this.internalState;
        },
        setState: function(newState) {
            if (this.states.indexOf(newState) > -1) {
                this.internalState = newState;
            }
            return this.state();
        },
        promise: function() {
            var pro = new this.Promise(this);
            return pro;
        }
    });
    _.State = State;
    return State;
})();

(function(self) {
    var countdown = function(n, cb) {
        var args = [];
        return function() {
            for (var i = 0; i < arguments.length; ++i) args.push(arguments[i]);
            n -= 1;
            if (n == 0) cb.apply(this, args);
        };
    };
    var FilesystemAPIProvider = function() {
        function makeErrorHandler(dfd, finalDfd) {
            return function(e) {
                if (e.code == 1) {
                    dfd.resolve(undefined);
                } else {
                    if (finalDfd) finalDfd.reject(e); else dfd.reject(e);
                }
            };
        }
        function readDirEntries(reader, result) {
            var dfd = new _.Dfd();
            _readDirEntries(reader, result, dfd);
            return dfd.promise();
        }
        function _readDirEntries(reader, result, dfd) {
            reader.readEntries(function(entries) {
                if (entries.length == 0) {
                    dfd.resolve(result);
                } else {
                    result = result.concat(entries);
                    _readDirEntries(reader, result, dfd);
                }
            }, function(err) {
                dfd.reject(err);
            });
        }
        function entryToFile(entry, cb, eb) {
            entry.file(cb, eb);
        }
        function FSAPI(fs, numBytes, prefix) {
            this._fs = fs;
            this._capacity = numBytes;
            this._prefix = prefix;
            this.type = "FilesystemAPI";
        }
        FSAPI.prototype = {
            get: function(path, options) {
                var dfd = new _.Dfd();
                path = this._prefix + path;
                this._fs.root.getFile(path, {}, function(fileEntry) {
                    fileEntry.file(function(file) {
                        var reader = new FileReader();
                        reader.onloadend = function(e) {
                            var data = e.target.result;
                            var err;
                            if (data !== null && typeof data !== "undefined" && options && options.json) {
                                try {
                                    data = JSON.parse(data);
                                } catch (e) {
                                    err = new Error("unable to parse JSON for " + path);
                                }
                            }
                            if (err) {
                                dfd.reject(err);
                            } else {
                                dfd.resolve(data);
                            }
                        };
                        reader.readAsText(file);
                    }, makeErrorHandler(dfd));
                }, makeErrorHandler(dfd));
                return dfd.promise();
            },
            set: function(path, data, options) {
                var dfd = new _.Dfd();
                if (options && options.json) {
                    data = JSON.stringify(data);
                }
                path = this._prefix + path;
                this._fs.root.getFile(path, {
                    create: true
                }, function(fileEntry) {
                    fileEntry.createWriter(function(fileWriter) {
                        var blob;
                        fileWriter.onwriteend = function(e) {
                            fileWriter.onwriteend = function() {
                                dfd.resolve();
                            };
                            fileWriter.truncate(blob.size);
                        };
                        fileWriter.onerror = makeErrorHandler(dfd);
                        blob = new Blob([ data ], {
                            type: "application/json"
                        });
                        fileWriter.write(blob);
                    }, makeErrorHandler(dfd));
                }, makeErrorHandler(dfd));
                return dfd.promise();
            },
            list: function(options) {
                options = options || {};
                var dfd = new _.Dfd();
                this._fs.root.getDirectory(this._prefix, {
                    create: false
                }, function(entry) {
                    var reader = entry.createReader();
                    readDirEntries(reader, []).then(function(entries) {
                        var listing = [];
                        entries.forEach(function(entry) {
                            if (!entry.isDirectory) {
                                if (options.prefix) {
                                    if (entry.name.indexOf(options.prefix) === 0) {
                                        listing.push(entry.name);
                                    }
                                } else {
                                    listing.push(entry.name);
                                }
                            }
                        });
                        dfd.resolve(listing);
                    });
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise();
            },
            clear: function(options) {
                options = options || {};
                var dfd = new _.Dfd();
                var failed = false;
                var ecb = function(err) {
                    failed = true;
                    dfd.reject(err);
                };
                this._fs.root.getDirectory(this._prefix, {}, function(entry) {
                    var reader = entry.createReader();
                    reader.readEntries(function(entries) {
                        var latch = countdown(entries.length, function() {
                            if (!failed) {
                                dfd.resolve();
                            }
                        });
                        entries.forEach(function(entry) {
                            if (entry.isDirectory) {
                                entry.removeRecursively(latch, ecb);
                            } else {
                                if (options.prefix) {
                                    if (entry.name.indexOf(options.prefix) === 0) {
                                        entry.remove(latch, ecb);
                                    }
                                } else {
                                    entry.remove(latch, ecb);
                                }
                            }
                        });
                        if (entries.length == 0) dfd.resolve();
                    }, ecb);
                }, ecb);
                return dfd.promise();
            },
            remove: function(path) {
                var dfd = new _.Dfd();
                var finalDfd = new _.Dfd();
                path = this._prefix + path;
                this._fs.root.getFile(path, {
                    create: false
                }, function(entry) {
                    entry.remove(function() {
                        dfd.done(finalDfd.resolve);
                    }, function(err) {
                        finalDfd.reject(err);
                    });
                }, makeErrorHandler(finalDfd));
                return finalDfd.promise();
            },
            getCapacity: function() {
                return this._capacity;
            }
        };
        return {
            init: function(config) {
                var dfd = new _.Dfd();
                self.requestFileSystem = self.requestFileSystem || self.webkitRequestFileSystem;
                var persistentStorage = navigator.persistentStorage = navigator.persistentStorage || navigator.webkitPersistentStorage;
                var temporaryStorage = navigator.temporaryStorage = navigator.temporaryStorage || navigator.webkitTemporaryStorage;
                self.resolveLocalFileSystemURL = self.resolveLocalFileSystemURL || self.webkitResolveLocalFileSystemURL;
                if (!requestFileSystem) {
                    dfd.reject("No FSAPI");
                    return dfd.promise();
                }
                var prefix = config.name + "/";
                persistentStorage.requestQuota(config.size, function(numBytes) {
                    requestFileSystem(PERSISTENT, numBytes, function(fs) {
                        fs.root.getDirectory(config.name, {
                            create: true
                        }, function() {
                            dfd.resolve(new FSAPI(fs, numBytes, prefix));
                        }, function(err) {
                            dfd.reject(err);
                        });
                    }, function(err) {
                        dfd.reject(err);
                    });
                }, function(err) {
                    dfd.reject(err);
                });
                return dfd.promise();
            }
        };
    }();
    var IndexedDBProvider = function() {
        var URL = self.URL || self.webkitURL;
        function IDB(db) {
            this._db = db;
            this.type = "IndexedDB";
            this._supportsBlobs = false;
        }
        IDB.prototype = {
            get: function(docKey, options) {
                var dfd = new _.Dfd();
                var transaction = this._db.transaction([ "files" ], "readonly");
                var get = transaction.objectStore("files").get(docKey);
                get.onsuccess = function(e) {
                    var data = e.target.result;
                    if (data !== null && typeof data !== "undefined" && options && options.json) {
                        data = JSON.parse(data);
                    }
                    dfd.resolve(data);
                };
                get.onerror = function(e) {
                    dfd.reject(e);
                };
                return dfd.promise();
            },
            set: function(docKey, data, options) {
                var dfd = new _.Dfd();
                var transaction = this._db.transaction([ "files" ], "readwrite");
                if (options && options.json) {
                    data = JSON.stringify(data);
                }
                var put = transaction.objectStore("files").put(data, docKey);
                put.onsuccess = function(e) {
                    dfd.resolve(e.target.result);
                };
                put.onerror = function(e) {
                    dfd.reject(e);
                };
                return dfd.promise();
            },
            remove: function(docKey) {
                var dfd = new _.Dfd();
                var transaction = this._db.transaction([ "files" ], "readwrite");
                var del = transaction.objectStore("files")["delete"](docKey);
                put.onsuccess = function(e) {
                    dfd.resolve(e.target.result);
                };
                del.onerror = function(e) {
                    dfd.reject(e);
                };
                return dfd.promise();
            },
            list: function(options) {
                options = options || {};
                var dfd = new _.Dfd();
                var transaction = this._db.transaction([ "files" ], "readonly");
                var cursor = transaction.objectStore(store).openCursor();
                var listing = [];
                cursor.onsuccess = function(e) {
                    var cursor = e.target.result;
                    if (cursor) {
                        if (options.prefix) {
                            if (cursor.key.indexOf(options.prefix) === 0) {
                                listing.push(cursor.key);
                            }
                        } else {
                            listing.push(cursor.key);
                        }
                        listing.push(cursor.key);
                        cursor.continue();
                    } else {
                        dfd.resolve(listing);
                    }
                };
                cursor.onerror = function(e) {
                    dfd.reject(e);
                };
                return dfd.promise();
            },
            clear: function(options) {
                options = options || {};
                var dfd = new _.Dfd();
                var t = this._db.transaction([ "files" ], "readwrite");
                if (!options.prefix) {
                    var req1 = t.objectStore("files").clear();
                    req1.onsuccess = function(e) {
                        dfd.resolve(e.target.result);
                    };
                    req1.onerror = function(e) {
                        dfd.reject(e);
                    };
                } else {
                    var scope = this;
                    this.list(options).done(function(listing) {
                        var dfds = [ true ];
                        listing.forEach(function(item) {
                            dfds.push(scope.remove(item));
                        });
                        _.Dfd.when(dfds).done(function(ret) {
                            dfd.resolve(ret);
                        }).fail(function(e) {
                            dfd.reject(e);
                        });
                    }).fail(function(e) {
                        dfd.reject(e);
                    });
                }
                return dfd.promise();
            }
        };
        return {
            init: function(config) {
                var dfd = new _.Dfd();
                var indexedDB = self.indexedDB || self.webkitIndexedDB || self.mozIndexedDB || self.OIndexedDB || self.msIndexedDB, IDBTransaction = self.IDBTransaction || self.webkitIDBTransaction || self.OIDBTransaction || self.msIDBTransaction, dbVersion = 2;
                if (!indexedDB || !IDBTransaction) {
                    dfd.reject("No IndexedDB");
                    return dfd.promise();
                }
                var request = indexedDB.open(config.name, dbVersion);
                function createObjectStore(db) {
                    db.createObjectStore("files");
                }
                request.onerror = function(event) {
                    dfd.reject(event);
                };
                request.onsuccess = function(event) {
                    var db = request.result;
                    db.onerror = function(event) {
                        console.log(event);
                    };
                    if (db.setVersion) {
                        if (db.version != dbVersion) {
                            var setVersion = db.setVersion(dbVersion);
                            setVersion.onsuccess = function() {
                                createObjectStore(db);
                                dfd.resolve();
                            };
                        } else {
                            dfd.resolve(new IDB(db));
                        }
                    } else {
                        dfd.resolve(new IDB(db));
                    }
                };
                request.onupgradeneeded = function(event) {
                    createObjectStore(event.target.result);
                };
                return dfd.promise();
            }
        };
    }();
    var WebSQLProvider = function() {
        var URL = self.URL || self.webkitURL;
        function WSQL(db) {
            this._db = db;
            this.type = "WebSQL";
        }
        WSQL.prototype = {
            get: function(docKey, options) {
                var dfd = new _.Dfd();
                this._db.transaction(function(tx) {
                    tx.executeSql("SELECT value FROM files WHERE fname = ?", [ docKey ], function(tx, res) {
                        if (res.rows.length == 0) {
                            dfd.resolve(undefined);
                        } else {
                            var data = res.rows.item(0).value;
                            if (data !== null && typeof data !== "undefined" && options && options.json) {
                                data = JSON.parse(data);
                            }
                            dfd.resolve(data);
                        }
                    });
                }, function(err) {
                    dfd.reject(err);
                });
                return dfd.promise();
            },
            set: function(docKey, data, options) {
                var dfd = new _.Dfd();
                if (options && options.json) {
                    data = JSON.stringify(data);
                }
                this._db.transaction(function(tx) {
                    tx.executeSql("INSERT OR REPLACE INTO files (fname, value) VALUES(?, ?)", [ docKey, data ]);
                }, function(err) {
                    dfd.reject(err);
                }, function() {
                    dfd.resolve();
                });
                return dfd.promise();
            },
            remove: function(docKey) {
                var dfd = new _.Dfd();
                this._db.transaction(function(tx) {
                    tx.executeSql("DELETE FROM files WHERE fname = ?", [ docKey ]);
                }, function(err) {
                    dfd.reject(err);
                }, function() {
                    dfd.resolve();
                });
                return dfd.promise();
            },
            list: function(options) {
                options = options || {};
                var dfd = new _.Dfd();
                var select = "SELECT fname FROM files";
                var vals = [];
                if (options.prefix) {
                    select += " WHERE fname LIKE ?";
                    vals = [ options.prefix + "%" ];
                }
                this._db.transaction(function(tx) {
                    tx.executeSql(select, vals, function(tx, res) {
                        var listing = [];
                        for (var i = 0; i < res.rows.length; ++i) {
                            listing.push(res.rows.item(i)["fname"]);
                        }
                        dfd.resolve(listing);
                    }, function(err) {
                        dfd.reject(err);
                    });
                });
                return dfd.promise();
            },
            clear: function(options) {
                options = options || {};
                var dfd = new _.Dfd();
                var query = "DELETE FROM files";
                var vals = [];
                if (options.prefix) {
                    query += " WHERE fname LIKE ?";
                    vals = [ options.prefix + "%" ];
                }
                this._db.transaction(function(tx) {
                    tx.executeSql(query, vals, function() {
                        dfd.resolve();
                    });
                }, function(err) {
                    dfd.reject(err);
                });
                return dfd.promise();
            }
        };
        return {
            init: function(config) {
                var openDb = self.openDatabase;
                var dfd = new _.Dfd();
                if (!openDb) {
                    dfd.reject("No WebSQL");
                    return dfd.promise();
                }
                var db = openDb(config.name, "1.0", "large local storage", config.size);
                db.transaction(function(tx) {
                    tx.executeSql("CREATE TABLE IF NOT EXISTS files (fname unique, value)");
                }, function(err) {
                    dfd.reject(err);
                }, function() {
                    dfd.resolve(new WSQL(db));
                });
                return dfd.promise();
            }
        };
    }();
    var LocalStorageProvider = function() {
        function LS(options) {
            if (!options.type) {
                options.type = "LocalStorage";
            }
            this.type = options.type;
            if (this.type === "SessionStorage") {
                this.store = sessionStorage;
            } else {
                this.store = localStorage;
            }
            this._prefix = options.name + ":";
        }
        LS.prototype = {
            get: function(docKey, options) {
                var dfd = new _.Dfd();
                var data = this.store.getItem(this._prefix + docKey);
                if (data !== null && typeof data !== "undefined" && options && options.json) {
                    data = JSON.parse(data);
                }
                dfd.resolve(data);
                return dfd.promise();
            },
            set: function(docKey, data, options) {
                var dfd = new _.Dfd();
                if (options && options.json) {
                    data = JSON.stringify(data);
                }
                this.store.setItem(this._prefix + docKey, data);
                dfd.resolve();
                return dfd.promise();
            },
            remove: function(docKey, options) {
                var dfd = new _.Dfd();
                this.store.removeItem(this._prefix + docKey);
                dfd.resolve();
                return dfd.promise();
            },
            list: function(options) {
                options = options || {};
                var that = this;
                var dfd = new _.Dfd();
                var listing = Object.keys(this.store);
                var ret = [];
                var prefix = this._prefix;
                if (options.prefix) {
                    prefix += options.prefix;
                }
                listing.forEach(function(item) {
                    if (item.indexOf(prefix) === 0) {
                        ret.push(item.substr(that._prefix.length - 1));
                    }
                });
                dfd.resolve(ret);
                return dfd.promise();
            },
            clear: function(options) {
                options = options || {};
                var that = this;
                var dfd = new _.Dfd();
                var listing = Object.keys(this.store);
                var prefix = this._prefix;
                if (options.prefix) {
                    prefix += options.prefix;
                }
                listing.forEach(function(item) {
                    if (item.indexOf(prefix) === 0) {
                        that.store.removeItem(item);
                    }
                });
                dfd.resolve();
                return dfd.promise();
            }
        };
        return {
            init: function(config) {
                var dfd = new _.Dfd();
                if (this.type === "SessionStorage" && !self.sessionStorage) {
                    dfd.resolve(new LS(config));
                } else if (this.type === "LocalStorage" && !self.localStorage) {
                    dfd.resolve(new LS(config));
                } else {
                    dfd.reject();
                }
                return dfd.promise();
            }
        };
    }();
    var ChromeStorageProvider = function() {
        function CS(options) {
            this.store = chrome.storage.local;
            this._prefix = options.name + ":";
        }
        CS.prototype = {
            get: function(docKey, options) {
                var dfd = new _.Dfd();
                var data = this.store.get(this._prefix + docKey, function(data) {
                    if (chrome.runtime.lastError) {
                        dfd.reject(chrome.runtime.lastError);
                    } else {
                        if (data !== null && typeof data !== "undefined" && options && options.json) {
                            data = JSON.parse(data);
                        }
                        dfd.resolve(data);
                    }
                });
                return dfd.promise();
            },
            set: function(docKey, data, options) {
                var dfd = new _.Dfd();
                if (options && options.json) {
                    data = JSON.stringify(data);
                }
                var toSet = {};
                toSet[this._prefix + docKey] = data;
                this.store.set(toSet, function() {
                    if (chrome.runtime.lastError) {
                        dfd.reject(chrome.runtime.lastError);
                    } else {
                        dfd.resolve();
                    }
                });
                return dfd.promise();
            },
            remove: function(docKey, options) {
                var dfd = new _.Dfd();
                this.store.remove(this._prefix + docKey, function() {
                    if (chrome.runtime.lastError) {
                        dfd.reject(chrome.runtime.lastError);
                    } else {
                        dfd.resolve();
                    }
                });
                return dfd.promise();
            },
            list: function(options) {
                options = options || {};
                var that = this;
                var dfd = new _.Dfd();
                var prefix = this._prefix;
                if (options.prefix) {
                    prefix += options.prefix;
                }
                this.store.get(null, function(listing) {
                    var ret = [];
                    if (chrome.runtime.lastError) {
                        dfd.reject(chrome.runtime.lastError);
                    } else {
                        for (var key in items) {
                            if (key.indexOf(prefix) === 0) {
                                ret.push(key.substr(that._prefix.length - 1));
                            }
                        }
                        dfd.resolve(ret);
                    }
                });
                return dfd.promise();
            },
            clear: function(options) {
                options = options || {};
                var that = this;
                var dfd = new _.Dfd();
                var dfds = [ true ];
                var prefix = this._prefix;
                if (options.prefix) {
                    prefix += options.prefix;
                }
                this.store.get(null, function(listing) {
                    var ret = [];
                    if (chrome.runtime.lastError) {
                        dfd.reject(chrome.runtime.lastError);
                    } else {
                        function remove(key) {
                            var removeDfd = new _.Dfd();
                            dfds.push(removeDfd.promise());
                            this.store.remove(key, function() {
                                if (chrome.runtime.lastError) {
                                    removeDfd.reject(chrome.runtime.lastError);
                                } else {
                                    removeDfd.resolve();
                                }
                            });
                        }
                        for (var key in items) {
                            remove(key);
                        }
                        dfd.resolve(ret);
                    }
                });
                _.Dfd.when(dfds).done(function(rets) {
                    rets.shift();
                    dfd.resolve(rets);
                }).fail(function(errors) {
                    errors.shift();
                    dfd.resolve(errors);
                });
                return dfd.promise();
            }
        };
        return {
            init: function(config) {
                var dfd = new _.Dfd();
                if (typeof chrome === "object" && chrome.storage && chrome.storage.local) {
                    dfd.resolve(new CS(config));
                } else {
                    dfd.reject();
                }
                return dfd.promise();
            }
        };
    }();
    var LargeLocalStorage = function() {
        var providers = {
            FileSystemAPI: FilesystemAPIProvider,
            IndexedDB: IndexedDBProvider,
            WebSQL: WebSQLProvider,
            LocalStorage: LocalStorageProvider,
            SessionStorage: LocalStorageProvider,
            ChromeStorageProvider: ChromeStorageProvider
        };
        var defaultConfig = {
            size: 10 * 1024 * 1024,
            name: "lls"
        };
        function selectImplementation(config) {
            if (!config) config = {};
            for (var key in defaultConfig) {
                config[key] = config[key] || defaultConfig[key];
            }
            if (config.forceProvider) {
                return providers[config.forceProvider].init(config);
            }
            var dfd = new _.Dfd();
            ChromeStorageProvider.init(config).done(function(ret) {
                dfd.resolve(ret);
            }).fail(function() {
                LocalStorageProvider.init(config).done(function(ret) {
                    dfd.resolve(ret);
                }).fail(function() {
                    IndexedDBProvider.init(config).done(function(ret) {
                        dfd.resolve(ret);
                    }).fail(function() {
                        FilesystemAPIProvider.init(config).done(function(ret) {
                            dfd.resolve(ret);
                        }).fail(function() {
                            WebSQLProvider.init(config).done(function(ret) {
                                dfd.resolve(ret);
                            }).fail(function() {
                                dfd.reject("I have nothing.... leave me alone :(");
                            });
                        });
                    });
                });
            });
            return dfd.promise();
        }
        function LargeLocalStorage(config) {
            var scope = this;
            var dfd = new _.Dfd();
            selectImplementation(config).done(function(impl) {
                scope._impl = impl;
                dfd.resolve(scope);
            }).fail(function(e) {
                dfd.reject("No storage provider found");
            });
            scope.initialized = dfd.promise();
            return scope;
        }
        LargeLocalStorage.prototype = {
            ready: function() {
                return this.initialized;
            },
            list: function(docKey) {
                this._checkAvailability();
                return this._impl.list(docKey);
            },
            remove: function(docKey) {
                this._checkAvailability();
                return this._impl.remove(docKey);
            },
            clear: function() {
                this._checkAvailability();
                return this._impl.clear();
            },
            get: function(docKey, options) {
                this._checkAvailability();
                return this._impl.get(docKey, options);
            },
            set: function(docKey, data, options) {
                this._checkAvailability();
                return this._impl.set(docKey, data, options);
            },
            getCapacity: function() {
                this._checkAvailability();
                if (this._impl.getCapacity) return this._impl.getCapacity(); else return -1;
            },
            _checkAvailability: function() {
                if (!this._impl) {
                    throw {
                        msg: "No storage implementation is available yet.  The user most likely has not granted you app access to FileSystemAPI or IndexedDB",
                        code: "NO_IMPLEMENTATION"
                    };
                }
            }
        };
        return LargeLocalStorage;
    }();
    self._ = self._ || {};
    self._.LargeLocalStorage = LargeLocalStorage;
    return LargeLocalStorage;
})(typeof self !== "undefined" ? self : this);

(function() {
    "use strict";
    var urns = {};
    var collections = {};
    var isCollection = function(urn) {
        if (!urn.match(/\:[*#]$/)) {
            return true;
        } else {
            return false;
        }
    };
    var findModel = function findModel(urn) {
        for (var key in urns) {
            if (urns[key].regex.exec(urn)) {
                return urns[key].model;
            }
        }
    };
    var findCollection = function findCollection(urn) {
        for (var key in collections) {
            if (collections[key].regex.exec(urn)) {
                return collections[key].collection;
            }
        }
    };
    var makeForModelDeferDfds = {};
    var getDeffered = function getDeffered(urn, strict) {
        if (makeForModelDeferDfds[urn]) {
            return makeForModelDeferDfds[urn];
        } else {
            if (!strict) {
                for (var key in makeForModelDeferDfds) {
                    if (_.isRegex(makeForModelDeferDfds[key].regex) && makeForModelDeferDfds[key].regex.exec(urn)) {
                        return makeForModelDeferDfds[key];
                    }
                }
            }
        }
    };
    var makeAndGet = function makeAndGet(args, Model, collection, dfd, given) {
        var instance = new Model(args);
        if (!given) {
            instance.get().done(function() {
                dfd.resolve(instance);
            }).fail(function(e) {
                dfd.reject(e);
            });
        } else {
            collection.insert({
                entry: instance
            });
            dfd.resolve(instance);
        }
    };
    var makeForModel = function makeForModel(args, given) {
        var dfd = new _.Dfd();
        var collection = findCollection(args.urn);
        var Model = findModel(args.urn);
        var instance;
        if (collection) {
            instance = collection.queryOne({
                filter: {
                    urn: args.urn
                }
            });
            if (typeof instance !== "undefined") {
                dfd.resolve(instance);
            } else {
                var alreadyWaiting = getDeffered(args.urn);
                if (alreadyWaiting) {
                    alreadyWaiting.promise.done(function() {
                        instance = collection.queryOne({
                            filter: {
                                urn: args.urn
                            }
                        });
                        if (instance) {
                            dfd.resolve(instance);
                        } else {
                            var alreadyWaiting = getDeffered(args.urn, true);
                            if (alreadyWaiting) {
                                alreadyWaiting.promise.done(function() {
                                    instance = collection.queryOne({
                                        filter: {
                                            urn: args.urn
                                        }
                                    });
                                    if (instance) {
                                        dfd.resolve(instance);
                                    } else {
                                        makeAndGet(args, Model, collection, dfd, given);
                                    }
                                });
                            } else {
                                makeAndGet(args, Model, collection, dfd, given);
                            }
                        }
                    });
                } else {
                    makeAndGet(args, Model, collection, dfd, given);
                }
            }
        } else if (Model) {
            makeAndGet(args, Model, dfd, given);
        } else {
            dfd.reject("Couldn't find a model registered for " + args.urn);
        }
        return dfd.promise();
    };
    var populateRefs = function populateRefs(scope, args) {
        args = args || {};
        var dfd = new _.Dfd();
        var dfds = [ true ];
        function fetchForKey(key) {
            var ref = scope._options.refs[key];
            if (_.isArray(ref)) {
                scope[key].forEach(function(item, i) {
                    var eachDfd;
                    if (_.isNormalObject(item) && _.isUrn(item.urn) && !(item instanceof Model)) {
                        eachDfd = new _.Dfd();
                        makeForModel(item, true).done(function(ret) {
                            scope[key][i] = ret;
                            eachDfd.resolve();
                        });
                        dfds.push(eachDfd.promise());
                    } else if (_.isUrn(item)) {
                        eachDfd = new _.Dfd();
                        makeForModel({
                            urn: item
                        }).done(function(ret) {
                            scope[key][i] = ret;
                            eachDfd.resolve();
                        });
                        dfds.push(eachDfd.promise());
                    }
                });
            } else {
                var eachDfd;
                if (_.isNormalObject(scope[key]) && _.isUrn(scope[key].urn) && !(scope[key] instanceof Model)) {
                    eachDfd = new _.Dfd();
                    makeForModel(scope[key], true).done(function(ret) {
                        scope[key] = ret;
                        eachDfd.resolve();
                    });
                    dfds.push(eachDfd);
                } else if (_.isUrn(scope[key])) {
                    eachDfd = new _.Dfd();
                    makeForModel({
                        urn: scope[key]
                    }).done(function(ret) {
                        scope[key] = ret;
                        eachDfd.resolve();
                    });
                    dfds.push(eachDfd.promise());
                }
            }
        }
        for (var key in scope._options.refs) {
            fetchForKey(key);
        }
        _.Dfd.when(dfds).done(function() {
            dfd.resolve(scope);
        }).fail(function(errs) {
            console.log("Errors in populates", errs);
        });
        return dfd.promise();
    };
    var store = function store(args, scope) {
        var dfd = new _.Dfd();
        scope = scope || this;
        args.data = args.data || {};
        if (typeof args.remote === "undefined") {
            args.remote = true;
        }
        args.method = args.method.toUpperCase();
        if (scope._options.collection === true) {
            args.urn = args.urn || scope._options.urn;
        }
        if (typeof args === "undefined" || !args.method || !args.urn) {
            dfd.reject("Must Supply args object with method, url, and data");
            return dfd.promise();
        }
        if (scope._options.store.remote && args.remote) {
            if (args.method === "GET" && scope._options.store.localStorage && (scope._options._ttl && new Date().getTime() > scope._options._ttl)) {
                if (args.method === "GET") {
                    makeForModelDeferDfds[scope.urn] = makeForModelDeferDfds[scope.urn] || {
                        promise: dfd.promise()
                    };
                }
                local(args, scope).done(function(ret) {
                    dfd.resolve({
                        data: ret,
                        headers: {},
                        status: 200,
                        local: true
                    });
                }).fail(function(e) {
                    dfd.reject(e);
                });
            } else {
                if (args.method === "GET" && scope._options.collection === true) {
                    makeForModelDeferDfds[scope._options.urn] = {
                        promise: dfd.promise(),
                        regex: collections[scope._options.name].regex
                    };
                }
                ajax(args, scope).done(function(ret) {
                    if (args.method === "DELETE") {
                        var collection = findCollection(scope.urn);
                        if (collection) {
                            for (var i = 0; i < collection.entries.length; i++) {
                                if (collection.entries[i].urn === scope.urn) {
                                    collection.entries.splice(i, 1);
                                }
                            }
                        }
                    }
                    if (args.method === "POST") {
                        var wait = new _.Dfd();
                        makeForModelDeferDfds[ret.data.urn] = makeForModelDeferDfds[ret.data.urn] || {
                            promise: wait.promise(),
                            dfd: wait
                        };
                        makeForModelDeferDfds[ret.data.urn].promise.done(function(instance) {
                            if (instance) {
                                ret.model = ret.instance = instance;
                            } else {
                                var collection = findCollection(ret.data.urn);
                                if (collection) {
                                    ret.model = ret.instance = collection.queryOne({
                                        filter: {
                                            urn: ret.data.urn
                                        }
                                    });
                                }
                            }
                            dfd.resolve(ret);
                        });
                    } else {
                        dfd.resolve(ret);
                    }
                }).fail(function(e) {
                    dfd.reject(e);
                });
            }
        } else if (scope._options.store.localStorage) {
            if (args.method === "GET") {
                makeForModelDeferDfds[scope.urn] = makeForModelDeferDfds[scope.urn] || {
                    promise: dfd.promise()
                };
            }
            local(args, scope).done(function(ret) {
                dfd.resolve(ret);
            }).fail(function(e) {
                dfd.reject(e);
            });
        } else {
            dfd.resolve(args.data);
        }
        return dfd.promise();
    };
    var local = function local(args, scope) {
        var urn = args.urn;
        var dfd;
        var xhr;
        if (scope._options.collection === true) {
            var urnArray = scope._options.store.localStorage.split(":");
            urnArray.splice(-1);
            urn = urnArray.join(":");
        }
        switch (args.method) {
          case "GET":
            return self.Jive.Store.get(urn, {
                json: true
            });
            break;

          case "POST":
            return self.Jive.Store.set(urn, args.data, {
                json: true
            });
            break;

          case "PUT":
            return self.Jive.Store.set(urn, args.data, {
                json: true
            });
            break;

          case "PATCH":
            dfd = new _.Dfd();
            xhr = self.Jive.Store.get(urn, {
                json: true
            });
            xhr.done(function(ret) {
                _.extend(ret, args.data);
                self.Jive.Store.set(urn, ret, {
                    json: true
                }).done(function(ret) {
                    dfd.resolve(ret);
                }).fail(function(e) {
                    dfd.reject(e);
                });
            }).fail(function(e) {
                dfd.reject(e);
            });
            return dfd.promise();
            break;

          case "DELETE":
            return self.Jive.Store.remove(urn);
            break;

          case "HEAD":
            dfd = new _.Dfd();
            xhr = self.Jive.Store.get(urn, {
                json: true
            });
            xhr.done(function(ret) {
                dfd.resolve({
                    lastModified: ret.lastModified,
                    eTag: ret.eTag,
                    ttl: ret.ttl,
                    expires: ret.expires
                });
            }).fail(function(e) {
                dfd.reject(e);
            });
            return dfd.promise();
            break;

          case "OPTIONS":
          default:
            dfd = new _.Dfd();
            dfd.resolve();
            return dfd.promise();
            break;
        }
    };
    var rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm;
    var parseHeaders = function(headers) {
        var responseHeaders = {};
        var match;
        while (match = rheaders.exec(headers)) {
            responseHeaders[match[1].toLowerCase()] = match[2];
        }
        return responseHeaders;
    };
    var ajax = function ajax(args, scope) {
        scope = scope || this;
        var dfd = new _.Dfd();
        var data = args.data || {};
        var urn = args.data.urn || args.urn;
        if ((args.method == "POST" || args.method == "PUT" || args.method == "PATCH") && args.data) {
            data = JSON.stringify(data);
        } else if ((args.method == "GET" || args.method == "DELETE") && args.data) {
            urn += "?" + $.param(data);
        }
        var remote = scope._options.store.remote.replace(/\/$/g, "");
        var xhr = new XMLHttpRequest();
        xhr.open(args.method, (self.Jive.Features.APIBaseUrl || "") + remote + "/" + urn);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.onreadystatechange = function xhrOnReadyStateChange() {
            if (xhr.readyState === 4) {
                if (xhr.status > 400) {
                    dfd.reject({
                        e: xhr.status,
                        status: xhr.status,
                        headers: parseHeaders(xhr && xhr.getAllResponseHeaders() || "")
                    });
                } else {
                    var data = JSON.parse(xhr.responseText);
                    dfd.resolve({
                        data: data,
                        status: xhr.status,
                        headers: parseHeaders(xhr && xhr.getAllResponseHeaders() || "")
                    });
                }
            }
        };
        xhr.send(data);
        return dfd.promise();
    };
    var insertFunc = function insertFunc(args, scope) {
        scope = scope || this;
        args = args || {};
        if (args.entry) {
            var index = scope.entries.indexOf(args.entry.urn);
            if (index !== -1) {
                scope.entries[index] = args.entry;
            } else {
                scope.entries.push(args.entry);
            }
            store({
                method: "POST",
                urn: args.entry.urn,
                data: args.entry._options.persisted,
                remote: false
            }, args.entry);
            scope._options.persisted = scope.toJSON();
            store({
                method: "POST",
                urn: scope.urn,
                data: scope._options.persisted,
                remote: false
            }, scope);
        }
    };
    var eventFunc = function eventFunc(event, ret, scope) {
        scope = scope || this;
        var data = ret.data.body || ret.data;
        var toRet, populate, publish = false, dfd;
        if (scope._options.collection === true) {
            var Model = findModel(data.urn);
            var collection = findCollection(data.urn);
            var instance = typeof collection !== "undefined" ? collection.queryOne({
                filter: {
                    urn: data.urn
                }
            }) : undefined;
            switch (event) {
              case "posted":
                if (typeof instance === "undefined" && Model) {
                    instance = new Model(data);
                    if (makeForModelDeferDfds[instance.urn] && makeForModelDeferDfds[instance.urn].dfd) {
                        makeForModelDeferDfds[instance.urn].dfd.resolve(instance);
                    } else {
                        dfd = new _.Dfd();
                        makeForModelDeferDfds[instance.urn] = makeForModelDeferDfds[instance.urn] || {
                            promise: dfd.promise()
                        };
                    }
                    insertFunc({
                        entry: instance
                    }, collection);
                } else {
                    if (makeForModelDeferDfds[instance.urn] && makeForModelDeferDfds[instance.urn].dfd) {
                        makeForModelDeferDfds[instance.urn].dfd.resolve(instance);
                    }
                    _.extend(instance, data);
                }
                populate = true;
                publish = true;
                break;
            }
            toRet = instance;
        } else {
            var key;
            switch (event) {
              case "putted":
                if (typeof scope !== "undefined") {
                    for (key in scope) {
                        if (key !== "_options") {
                            delete scope[key];
                        }
                    }
                }

              case "patched":
                for (key in scope._options.keys) {
                    scope[key] = typeof data[key] !== "undefined" ? data[key] : scope[key];
                }
                for (key in scope._options.refs) {
                    if (typeof data[key] !== "undefined" && scope[key].urn !== data[key]) {
                        scope[key] = data[key];
                        populate = true;
                    }
                }
                publish = true;
                break;
            }
            toRet = scope;
        }
        if (populate === true) {
            toRet._options.inited = populateRefs(toRet);
        }
        if (publish === true) {
            toRet._options.inited.done(function() {
                if (dfd) {
                    dfd.resolve();
                }
                toRet.dispatch({
                    event: event,
                    data: toRet
                });
                if (event === "putted" || event === "patched") {
                    toRet.changed();
                }
            });
        }
        return toRet;
    };
    var deleteFunc = function deleteFunc(args, scope) {
        scope = scope || this;
        scope._options.subs.forEach(function(sub) {
            scope.off({
                sub: sub
            });
        });
        scope.dispatch({
            event: "deleted",
            data: args
        });
    };
    var doInitializeDefault = function doInitializeDefault(scope, key) {
        if (_.isFunction(scope._options.keys[key].default)) {
            scope[key] = scope._options.keys[key].default();
        } else {
            switch (scope._options.keys[key].type.toLowerCase()) {
              case "object":
                scope[key] = scope._options.keys[key].default || {};
                break;

              case "array":
                scope[key] = scope._options.keys[key].default || [];
                break;

              case "boolean":
                scope[key] = scope._options.keys[key].default || false;
                break;

              case "string":
                scope[key] = scope._options.keys[key].default || "";
                break;

              case "number":
                scope[key] = scope._options.keys[key].default || NaN;
                break;

              case "date":
                scope[key] = scope._options.keys[key].default || 0;
                break;

              case "regex":
                scope[key] = scope._options.keys[key].default || new Regex();
                break;
            }
        }
    };
    var initializeForInForNotOptimized = function initializeForInForNotOptimized(args, scope) {
        var key;
        for (key in scope._options.refs) {
            if (_.isArray(scope._options.refs[key])) {
                scope[key] = scope[key] || [];
            } else {
                scope[key] = scope[key] || null;
            }
        }
        for (key in scope._options.keys) {
            doInitializeDefault(scope, key);
        }
        for (key in scope._options.virtuals) {
            scope.virtuals[key].getter = scope.virtuals[key].getter.bind(scope);
            scope.virtuals[key].setter = scope.virtuals[key].getter.bind(scope);
        }
        for (key in args) {
            scope[key] = args[key];
        }
    };
    var initialize = function initialize(args, scope) {
        scope = scope || this;
        args = args || {};
        if (scope._options.collection === true) {
            collections[scope._options.name] = {
                regex: _.createRegex({
                    urn: scope._options.urn + ":*"
                }),
                collection: scope
            };
            if (_.isString(scope._options.rootUrn)) {
                scope.urn = scope._options.rootUrn;
            } else if (_.isString(scope._options.urn)) {
                scope.urn = scope._options.urn;
            }
            scope.insert = insertFunc.bind(scope);
        }
        scope._options.persisted = scope.toJSON();
        initializeForInForNotOptimized(args, scope);
        scope._options.inited = populateRefs(scope);
        scope._options.subs = [];
        if (typeof self !== "undefined" && self.Jive && self.Jive.Jazz) {
            scope._options.pubsub = self.Jive.Jazz;
        } else {
            scope._options.pubsub = new _.Fabric();
        }
        scope._options.postFunc = eventFunc.bind(scope, "posted");
        scope._options.putFunc = eventFunc.bind(scope, "putted");
        scope._options.patchFunc = eventFunc.bind(scope, "patched");
        scope._options.deleteFunc = deleteFunc.bind(scope);
        scope._options.persisted = scope.toJSON();
        if (scope._options.collection === true) {
            scope.on({
                event: "posted",
                session: true
            }).progress(function(ret) {
                scope._options.postFunc(ret);
            });
        } else {
            scope.on({
                event: "putted",
                session: true
            }).progress(function(ret) {
                scope._options.putFunc({
                    data: ret.data.body
                });
            });
            scope.on({
                event: "patched",
                session: true
            }).progress(function(ret) {
                scope._options.patchFunc({
                    data: ret.data.body
                });
            });
            scope.on({
                event: "deleted",
                session: true
            }).progress(function(ret) {
                scope._options.deleteFunc();
            });
        }
    };
    var Model = function(data, options) {
        var scope = this;
        data = data || {};
        options = options || {};
        scope._options = {
            _excludes: {
                _options: true
            }
        };
        scope.initialize(data);
        return scope;
    };
    Model.prototype = Object.create(Object.prototype);
    Model.prototype.initialize = function(args, scope) {
        scope = scope || this;
        args = args || {};
    };
    Model.prototype.get = function(args, scope) {
        scope = scope || this;
        args = args || {};
        var dfd = new _.Dfd();
        if (args.force || !scope._options.ttl || scope._options.ttl && new Date().getTime() > scope._options.ttl) {
            var xhr = store({
                method: "GET",
                urn: scope.urn,
                data: args
            }, scope).done(function(ret) {
                if (_.isNormalObject(ret.data)) {
                    if (scope._options.collection === true) {
                        scope.entries = scope.entries || [];
                        for (var i = 0; i < ret.data.entries.length; i++) {
                            if (_.isNormalObject(ret.data.entries[i]) && _.isUrn(ret.data.entries[i].urn)) {
                                var instance = scope && scope.queryOne({
                                    filter: {
                                        urn: ret.data.entries[i].urn
                                    }
                                });
                                if (instance) {
                                    instance.set(ret.data.entries[i]);
                                    setTimeout(function(instance) {
                                        store({
                                            method: "POST",
                                            urn: instance.urn,
                                            data: instance.toJSON(),
                                            remote: false
                                        }, instance);
                                    }, 0, instance);
                                } else {
                                    var Model = findModel(ret.data.entries[i].urn);
                                    if (Model) {
                                        instance = new Model(ret.data.entries[i]);
                                        setTimeout(function(instance) {
                                            store({
                                                method: "POST",
                                                urn: instance.urn,
                                                data: instance.toJSON(),
                                                remote: false
                                            }, instance);
                                        }, 0, instance);
                                        scope.entries.push(instance);
                                    }
                                }
                            } else {
                                scope.entries.push(ret.data.entries[i]);
                            }
                        }
                    } else {
                        for (var key in ret.data) {
                            scope[key] = ret.data[key];
                        }
                        var collection = findCollection(scope.urn);
                        if (collection) {
                            var entry = collection.queryOne({
                                filter: {
                                    urn: scope.urn
                                }
                            });
                            var index;
                            if (entry) {
                                index = collection.entries.indexOf(entry);
                                collection.entries[index] = scope;
                            } else {
                                index = collection.entries.indexOf(scope.urn);
                                if (index !== -1) {
                                    collection.entries[index] = scope;
                                } else {
                                    collection.entries.push(scope);
                                }
                            }
                        }
                    }
                    scope._options.persisted = scope.toJSON();
                    if (ret.headers["cache-control"] !== "no-cache" && ret.headers.expires) {
                        scope._options.ttl = new Date(ret.headers.expires).getTime();
                        scope._options.lastModified = new Date(ret.headers["last-modified"]).getTime();
                    } else {
                        scope._options.ttl = Date.now();
                    }
                    scope.dispatch({
                        event: "gotted",
                        data: scope
                    });
                    setTimeout(function() {
                        store({
                            method: "POST",
                            urn: scope.urn,
                            data: scope._options.persisted,
                            remote: false
                        }, scope);
                    }, 0);
                    scope._options.inited = populateRefs(scope, {
                        local: ret.local
                    }).done(function() {
                        dfd.resolve(scope);
                    });
                } else {
                    dfd.reject("Ret was noooo good.");
                }
            }).fail(function(ret) {
                dfd.reject(ret.error);
            });
        } else {
            dfd.resolve(scope);
        }
        return dfd.promise();
    };
    Model.prototype.post = function(args, scope) {
        scope = scope || this;
        args = args || {};
        var dfd = new _.Dfd();
        makeForModelDeferDfds[scope.urn] = makeForModelDeferDfds[scope.urn] || {
            dfd: dfd,
            promise: dfd.promise()
        };
        return store({
            method: "POST",
            urn: scope.urn,
            data: args
        }, scope);
    };
    Model.prototype.put = function(args, scope) {
        scope = scope || this;
        args = args || {};
        return store({
            method: "PUT",
            urn: scope.urn,
            data: args
        }, scope);
    };
    Model.prototype.patch = function(args, scope) {
        scope = scope || this;
        args = args || {};
        return store({
            method: "PATCH",
            urn: scope.urn,
            data: args
        }, scope);
    };
    Model.prototype["delete"] = function(args, scope) {
        scope = scope || this;
        args = args || {};
        return store({
            method: "DELETE",
            urn: scope.urn,
            data: args
        }, scope);
    };
    Model.prototype.options = function(args, scope) {
        scope = scope || this;
        args = args || {};
        var dfd = new _.Dfd();
        return store({
            method: "OPTIONS",
            urn: scope.urn,
            data: args
        }, scope).done(function(ret) {
            for (var key in args) {
                scope._options[key] = args[key];
            }
            dfd.resolve(scope);
        });
    };
    Model.prototype.head = function(args, scope) {
        scope = scope || this;
        args = args || {};
        var dfd = new _.Dfd();
        return store({
            method: "HEAD",
            urn: scope.urn,
            data: args
        }, scope).done(function(ret) {
            dfd.resolve(ret.headers);
        });
    };
    var subSelectRecurse = function(ret, keys) {
        var key = keys.shift();
        if (keys.length === 0) {
            return ret[key];
        }
        if (_.isNormalObject(ret[key])) {
            return subSelectRecurse(ret[key], keys);
        } else if (_.isArray(ret[key])) {
            var arrRet = [];
            for (var i = 0; i < ret[key].length; i++) {
                var arrKeys = _.clone(keys);
                arrRet[i] = subSelectRecurse(ret[key][i], arrKeys);
            }
            return arrRet;
        }
    };
    var subSelect = function(entry, key, args) {
        var keys = key.split(".");
        if (typeof entry[key] === "undefined" && _.isNormalObject(entry.virtuals) && entry.virtuals[key] && _.isFunction(entry.virtuals[key].getter)) {
            return entry.virtuals[key].getter(args, entry);
        } else {
            return subSelectRecurse(entry, keys);
        }
    };
    var walkObjectRecurse = function(obj, keys, val) {
        var key = keys.shift();
        if (keys.length === 0) {
            obj[key] = val;
            return obj;
        } else {
            obj[key] = obj[key] || {};
            return walkObjectRecurse(obj[key], keys, val);
        }
    };
    var walkObject = function(obj, key, val) {
        var keys = key.split(".");
        return walkObjectRecurse(obj, keys, val);
    };
    var createFromLazyObject = function(obj, lazyObj) {
        if (typeof lazyObj === undefined) {
            lazyObj = obj;
            obj = {};
        }
        var ret = obj;
        for (var key in lazyObj) {
            var keys = key.split(".");
            for (var i = 0; i < keys.length - 1; i++) {
                obj[keys[i]] = obj[keys[i]] || {};
                obj = obj[keys[i]];
            }
            obj[keys[i]] = lazyObj[key];
        }
        return ret;
    };
    var defaultFilter = function(filter, value) {
        if (_.isRegExp(filter)) {
            if (!filter.test(value)) {
                return false;
            }
        } else if (filter != value) {
            return false;
        }
        return true;
    };
    var filterCheckTheBastard = function(entry, filter) {
        if (_.isNormalObject(filter)) {
            for (var key in filter) {
                var val = subSelect(entry, key), length, temp, cleanVal;
                if (_.isNormalObject(filter[key])) {
                    for (var filterKey in filter[key]) {
                        switch (filterKey) {
                          case "$lt":
                            if (val >= filter[key][filterKey]) {
                                return false;
                            }
                            break;

                          case "$gt":
                            if (val <= filter[key][filterKey]) {
                                return false;
                            }
                            break;

                          case "$lte":
                            if (val > filter[key][filterKey]) {
                                return false;
                            }
                            break;

                          case "$gte":
                            if (val < filter[key][filterKey]) {
                                return false;
                            }
                            break;

                          case "$btw":
                            if (val <= filter[key][filterKey][0] || val >= filter[key][filterKey][1]) {
                                return false;
                            }
                            break;

                          case "$btwe":
                            if (val < filter[key][filterKey][0] || val > filter[key][filterKey][1]) {
                                return false;
                            }
                            break;

                          case "$nin":
                            length = 1;

                          case "$in":
                            length = length || 0;
                            if (_.isArray(val)) {
                                var intersection = _.intersection(val, filter[key][filterKey]);
                                if (intersection.length === length) {
                                    return false;
                                }
                            }
                            break;

                          case "$all":
                            if (_.isArray(val)) {
                                var diffs = _.diffValues(val, filter[key][filterKey]);
                                if (diffs.added.length !== 0 || diffs.changed.length !== 0 || diffs.removed.length !== 0) {
                                    return false;
                                }
                            }
                            break;

                          case "$neq":
                            var checkEqualFailCase = true;

                          case "$eq":
                            checkEqualFailCase = checkEqualFailCase || false;
                            if (_.isEqual(val, filter[key][filterKey]) === checkEqualFailCase) {
                                return false;
                            }
                            break;

                          case "$alphaNumSearch":
                            filter[key][filterKey] = ("" + filter[key][filterKey]).replace(/[^\w:\-\/]/g, "").toLowerCase();
                            if (_.isDate(val)) {
                                cleanVal = "" + val.toLocaleString();
                            } else {
                                cleanVal = "" + val;
                            }
                            cleanVal = cleanVal.replace(/[^\w:\-\/]/g, "").toLowerCase();

                          case "$search":
                            cleanVal = cleanVal || val;
                            if (("" + cleanVal).indexOf(filter[key][filterKey]) === -1) {
                                return false;
                            }
                            break;

                          case "$fuzzySearch":
                            var fuzzyFilter = new RegExp("\\b" + filter[key][filterKey] + "|" + filter[key][filterKey] + "\\b", "i");
                            if (!defaultFilter(fuzzyFilter, val)) {
                                return false;
                            }
                            break;

                          default:
                            if (!defaultFilter(filter[key][filterKey], val)) {
                                return false;
                            }
                            break;
                        }
                    }
                } else if (_.isFunction(filter[key])) {
                    if (!filter[key].call(entry, val, entry)) {
                        return false;
                    }
                } else {
                    if (!defaultFilter(filter[key], val)) {
                        return false;
                    }
                }
            }
        } else if (_.isFunction(filter)) {
            if (!filter.call(entry, entry)) {
                return false;
            }
        }
        return true;
    };
    var sortTheBastard = function(ret, keys, args) {
        ret = ret || [];
        ret = ret.sort(function sorter(a, b, keyIndex) {
            keyIndex = keyIndex || 0;
            if (keyIndex > keys.length - 1) {
                return 0;
            }
            var key = keys[keyIndex].key;
            var aVal = subSelect(a, key, args);
            var bVal = subSelect(b, key, args);
            aVal = _.isDate(aVal) ? aVal.getTime() : aVal;
            bVal = _.isDate(bVal) ? bVal.getTime() : bVal;
            var order = keys[keyIndex].order;
            var desc = order === "desc" || order === "descending" || order === "down";
            var asc = order === "asc" || order === "ascending" || order === "up";
            if (aVal === bVal || !desc && !asc) {
                keyIndex++;
                return sorter(a, b, keyIndex);
            }
            if (desc) {
                if (aVal > bVal) {
                    return -1;
                } else {
                    return 1;
                }
            } else if (asc) {
                if (aVal < bVal) {
                    return -1;
                } else {
                    return 1;
                }
            } else if (_.isFunction(keys[keyIndex].order)) {
                return keys[keyIndex].order(aVal, bVal);
            }
        });
        return ret;
    };
    var subSelectTheBastard = function(entry, selects, args) {
        var ret = {};
        selects.forEach(function(select) {
            var sub = subSelect(entry, select, args);
            if (typeof sub !== "undefined") {
                var lazyObj = {};
                lazyObj[select] = sub;
                createFromLazyObject(ret, lazyObj);
            }
        });
        return ret;
    };
    Model.prototype.query = Model.prototype.find = function(args, scope) {
        scope = scope || this;
        args = args || {};
        args.key = args.key || "entries";
        var ret = [];
        for (var i = 0; i < scope[args.key].length; i++) {
            var entry = scope[args.key][i];
            if (typeof args.filter === "undefined" || args.filter && filterCheckTheBastard(entry, args.filter, args)) {
                var toPush = entry;
                if (args.vm) {
                    if (entry.toVM && _.isFunction(entry.toVM)) {
                        toPush = entry.toVM({
                            vm: args.vm
                        });
                    } else {
                        toPush = _.clone(entry);
                    }
                } else if (args.select) {
                    toPush = subSelectTheBastard(entry, args.select, args);
                }
                ret.push(toPush);
            }
        }
        if (args.order) {
            sortTheBastard(ret, args.order, args);
        }
        if (args.offset) {
            ret.splice(0, args.offset);
        }
        if (args.limit === 1) {
            ret = ret[0];
        } else if (args.limit > 1) {
            ret = ret.splice(0, args.limit);
        }
        return ret;
    };
    Model.prototype.queryOne = Model.prototype.findOne = function(args, scope) {
        scope = scope || this;
        args = args || {};
        args.limit = 1;
        return scope.query(args, scope);
    };
    Model.prototype.dispatch = function(args, scope) {
        scope = scope || this;
        args = args || {};
        var urn = scope.urn + ":";
        if (scope._options.collection === true) {
            urn += "*:";
        }
        urn += args.event;
        var sub = scope._options.pubsub.publish({
            urn: urn,
            data: args.data
        });
    };
    Model.prototype.on = function(args, scope) {
        scope = scope || this;
        args = args || {};
        var urn = "";
        if (args.session === true) {
            urn += "session:";
        }
        if (scope._options.collection === true) {
            urn += scope._options.urn + ":*:";
        } else {
            urn += scope.urn + ":";
        }
        urn += args.event;
        var sub = scope._options.pubsub.subscribe({
            urn: urn
        });
        scope._options.subs.push(sub);
        return sub;
    };
    Model.prototype.off = function(args, scope) {
        scope = scope || this;
        args = args || {};
        if (typeof args.sub !== "undefined" && typeof args.sub.id !== "undefined") {
            scope._options.pubsub.unsubscribe({
                id: args.sub.id
            });
            scope._options.subs = _.without(scope._options.subs, sub);
            return true;
        } else {
            return false;
        }
    };
    Model.prototype.validate = function(args, scope) {
        scope = scope || this;
        args = args || {};
    };
    Model.prototype.changes = function(args, scope) {
        scope = scope || this;
        args = args || {};
        return scope._options.changes;
    };
    Model.prototype.changed = function(args, scope) {
        scope = scope || this;
        args = args || {};
        delete toJSONedCache[scope.urn];
        delete toVMedCache[scope.urn];
        var jsoned = scope.toJSON();
        scope._options.changes = _.dirtyKeys(scope._options.persisted, jsoned);
        scope.dispatch({
            event: "changed",
            data: scope
        });
        scope._options.persisted = jsoned;
    };
    Model.prototype.set = function(key, value, scope) {
        scope = scope || this;
        var toSet = {};
        if (typeof key === "object" && !value) {
            toSet = key;
        } else if (typeof key === "string" && typeof value !== "undefined") {
            toSet[key] = value;
        }
        for (key in toSet) {
            if (key in scope._options.refs) {
                continue;
            }
            scope[key] = toSet[key];
            scope._options.changes = scope._options.changes || {};
            scope._options.changes[key] = {
                aVal: scope._options.persisted[key],
                bVal: scope[key]
            };
        }
        scope.dispatch({
            event: "setted",
            data: toSet
        });
        scope.changed();
    };
    var toJSONedCache = {};
    Model.prototype.toJSON = Model.prototype.valueOf = function(args, scope) {
        scope = scope || this;
        args = args || {};
        args.excludes = args.excludes || {};
        if (toJSONedCache[scope.urn]) {
            return toJSONedCache[scope.urn];
        }
        var excludes = {};
        _.extend(excludes, scope._options.excludes, args.excludes);
        var temp = {};
        var keys = Object.keys(scope);
        for (var i = 0; i < keys.length; i++) {
            if (!excludes[keys[i]]) {
                temp[keys[i]] = scope[keys[i]];
            }
        }
        for (var key in scope._options.refs) {
            if (_.isNormalObject(scope[key]) && _.isUrn(scope[key].urn)) {
                temp[key] = scope[key].urn;
            } else if (_.isArray(scope[key])) {
                temp[key] = [];
                scope[key].forEach(function(entry, i) {
                    if (_.isNormalObject(scope[key][i]) && _.isUrn(scope[key][i].urn)) {
                        temp[key][i] = scope[key][i].urn;
                    } else {
                        temp[key][i] = scope[key][i];
                    }
                });
            } else {
                temp[key] = scope[key];
            }
        }
        toJSONedCache[scope.urn] = temp;
        return temp;
    };
    var toVMedCache = {};
    Model.prototype.toVM = function(args, scope) {
        scope = scope || this;
        args = args || {};
        args.vm = args.vm || "default";
        var ret = {};
        toVMedCache[scope.urn] = toVMedCache[scope.urn] || {};
        var toVMedCacheKey = args.toVMedCacheKey || "urn";
        if (toVMedCache[scope.urn][args.vm] && scope._options.collection === false) {
            ret = toVMedCache[scope.urn][args.vm];
        }
        var keys = args.keys || scope._options.vms[args.vm];
        if (typeof keys === "undefined") {
            keys = scope._options.vms.default;
        }
        if (keys === "*" || typeof keys === "undefined") {
            keys = Object.keys(scope);
        }
        if (scope._options.collection === true) {
            ret.entries = [];
            scope.entries.forEach(function(entry) {
                var vmed;
                toVMedCache[entry[toVMedCacheKey]] = toVMedCache[entry[toVMedCacheKey]] || {};
                if (typeof toVMedCache[entry[toVMedCacheKey]][args.vm] === "undefined") {
                    if (typeof entry.toVM !== "undefined" && _.isFunction(entry.toVM)) {
                        vmed = toVMedCache[entry[toVMedCacheKey]][args.vm] = entry.toVM({
                            vm: args.vm
                        });
                    } else {
                        vmed = toVMedCache[entry[toVMedCacheKey]][args.vm] = entry;
                    }
                } else {
                    vmed = toVMedCache[entry[toVMedCacheKey]][args.vm];
                }
                ret.entries.push(vmed);
            });
        } else {
            toVMedCache[scope.urn][args.vm] = ret;
            keys.forEach(function(key) {
                if (scope._options.refs[key]) {
                    if (_.isArray(scope._options.refs[key])) {
                        ret[key] = [];
                        scope[key].forEach(function(entry) {
                            var vmed;
                            toVMedCache[entry.urn] = toVMedCache[entry.urn] || {};
                            if (typeof toVMedCache[entry.urn][args.vm] === "undefined") {
                                if (_.isFunction(entry.toVM)) {
                                    vmed = toVMedCache[entry.urn][args.vm] = entry.toVM({
                                        vm: args.vm
                                    });
                                } else {
                                    console.log("wasn't a function thing", entry);
                                }
                            } else {
                                vmed = toVMedCache[entry.urn][args.vm];
                            }
                            ret[key].push(vmed);
                        });
                    } else if (scope[key] && scope[key].urn) {
                        var vmed;
                        toVMedCache[scope[key].urn] = toVMedCache[scope[key].urn] || {};
                        if (typeof toVMedCache[scope[key].urn][args.vm] === "undefined") {
                            vmed = toVMedCache[scope[key].urn][args.vm] = scope[key].toVM({
                                vm: args.vm
                            });
                        } else {
                            vmed = toVMedCache[scope[key].urn][args.vm];
                        }
                        ret[key] = vmed;
                    }
                } else if (key === "*") {
                    _.extend(ret, scope.toVM({
                        keys: "*",
                        vm: "default"
                    }));
                } else {
                    var sub = subSelect(scope, key, args);
                    if (typeof sub !== "undefined") {
                        walkObject(ret, key, sub);
                    }
                }
            });
        }
        toVMedCache[scope.urn][args.vm] = ret;
        return ret;
    };
    _.updateProp(Model.prototype, {
        name: "get",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "post",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "put",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "patch",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "delete",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "options",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "head",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "query",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "find",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "queryOne",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "findOne",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "dispatch",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "on",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "off",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "validate",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "changes",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "changed",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "set",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "toJSON",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "toVM",
        attrs: {
            enumerable: false
        }
    });
    var parseSchema = function(schema, model) {
        model._options.urn = schema.urn;
        model._options.rootUrn = schema.rootUrn;
        model._options.name = schema.name;
        urns[model._options.urn] = {
            regex: _.createRegex({
                urn: model._options.urn
            }),
            model: model
        };
        model._options.collection = isCollection(model._options.urn);
        if (typeof schema.store === "undefined") {
            if (typeof window !== "undefined") {
                if (document.localStorage) {
                    model._options.store = {
                        localStorage: "Jive:Data"
                    };
                } else {
                    model._options.store = {
                        memory: "Jive.Data"
                    };
                }
            } else {
                model._options.store = {
                    mongo: "mongoConnectionUrl"
                };
            }
        } else {
            model._options.store = schema.store;
        }
        if (typeof schema.vms === "undefined") {
            schema.vms = {
                "default": "*"
            };
        }
        if (typeof schema.subscriptions !== "undefined" && model._options.collection === true) {
            model._options.subscriptions = schema.subscriptions;
        } else if (typeof model._options.subscriptions === "undefined" && model._options.collection === true && model._options.urn) {
            model._options.subscriptions = [ model._options.urn, model._options.urn + ":*" ];
        }
        if (_.isArray(model._options.subscriptions) && self && self.Jive && self.Jive.SessionBridge) {
            if (model._options.collection === true) {
                for (var i = 0; i < model._options.subscriptions.length; i++) {
                    self.Jive.SessionBridge.subscribe({
                        urn: model._options.subscriptions[i]
                    });
                }
            }
        }
        model._options.vms = schema.vms;
        model._options.refs = schema.refs || {};
        var key;
        for (key in model._options.refs) {
            model._options.excludes[key] = true;
        }
        model._options.virtuals = schema.virtuals;
        if (typeof model._options.virtuals !== "undefined") {
            model.prototype.virtuals = {};
            for (key in model._options.virtuals) {
                model.prototype.virtuals[key] = {};
                model.prototype.virtuals[key].getter = model._options.virtuals[key].getter || function() {};
                model.prototype.virtuals[key].setter = model._options.virtuals[key].setter || function() {};
            }
        }
        model._options.keys = schema.keys || {};
        _.updateProp(model, {
            name: "_options",
            attrs: {
                enumerable: false
            }
        });
        _.lockProperty(model._options, "refs");
        _.lockProperty(model._options, "keys");
    };
    Model.create = function(schema) {
        var newModel = function(data, options) {
            var scope = this;
            data = data || {};
            options = options || {};
            scope._options = _.clone(newModel._options);
            _.extend(scope._options, options);
            initialize(data, scope);
            scope.initialize(data);
            return scope;
        };
        newModel._options = {
            excludes: {
                _options: true
            }
        };
        newModel.prototype = Object.create(Model.prototype);
        parseSchema(schema, newModel);
        if (schema.urn[schema.urn.length - 1] === "*") {
            var collectionSchema = _.clone(schema);
            var urnArray = schema.urn.split(":");
            urnArray.splice(-1);
            collectionSchema.urn = urnArray.join(":");
            collectionSchema.rootUrn = schema.rootUrn;
            if (collectionSchema.store.localStore) {
                collectionSchema.store.localStore = collectionSchema.urn;
            }
            if (!findModel(collectionSchema.urn)) {
                collectionSchema.refs = {
                    entries: [ {
                        type: "urn"
                    } ]
                };
                collectionSchema.keys = {
                    lastModified: {
                        type: "date"
                    },
                    createdDate: {
                        type: "date"
                    }
                };
                var NewCollection = Model.create(collectionSchema);
                new NewCollection();
            }
        }
        return newModel;
    };
    _.updateProp(Model, {
        name: "create",
        attrs: {
            enumerable: false
        }
    });
    Model.getCollections = function() {
        return collections;
    };
    _.updateProp(Model, {
        name: "getCollections",
        attrs: {
            enumerable: false
        }
    });
    _.Model = Model;
})();

(function() {
    var LinkedHashMap = function() {
        this._size = 0;
        this._map = {};
        this._Entry = function(key, value) {
            this.prev = null;
            this.next = null;
            this.key = key;
            this.value = value;
        };
        this._head = this._tail = null;
    };
    var _Iterator = function(start, property) {
        this.entry = start === null ? null : start;
        this.property = property;
    };
    _Iterator.prototype = {
        hasNext: function() {
            return this.entry !== null;
        },
        next: function() {
            if (this.entry === null) {
                return null;
            }
            var value = this.entry[this.property];
            this.entry = this.entry.next;
            return value;
        }
    };
    LinkedHashMap.prototype = {
        put: function(key, value) {
            var entry;
            if (!this.containsKey(key)) {
                entry = new this._Entry(key, value);
                if (this._size === 0) {
                    this._head = entry;
                    this._tail = entry;
                } else {
                    this._tail.next = entry;
                    entry.prev = this._tail;
                    this._tail = entry;
                }
                this._size++;
            } else {
                entry = this._map[key];
                entry.value = value;
            }
            this._map[key] = entry;
        },
        remove: function(key) {
            var entry;
            if (this.containsKey(key)) {
                this._size--;
                entry = this._map[key];
                delete this._map[key];
                if (entry === this._head) {
                    this._head = entry.next;
                    this._head.prev = null;
                } else if (entry === this._tail) {
                    this._tail = entry.prev;
                    this._tail.next = null;
                } else {
                    entry.prev.next = entry.next;
                    entry.next.prev = entry.prev;
                }
            } else {
                entry = null;
            }
            return entry === null ? null : entry.value;
        },
        containsKey: function(key) {
            return this._map.hasOwnProperty(key);
        },
        containsValue: function(value) {
            for (var key in this._map) {
                if (this._map.hasOwnProperty(key)) {
                    if (this._map[key].value === value) {
                        return true;
                    }
                }
            }
            return false;
        },
        get: function(key) {
            return this.containsKey(key) ? this._map[key].value : null;
        },
        clear: function() {
            this._size = 0;
            this._map = {};
            this._head = this._tail = null;
        },
        keys: function(from) {
            var keys = [], start = null;
            if (from) {
                start = this.containsKey(from) ? this._map[from] : null;
            } else {
                start = this._head;
            }
            for (var cur = start; cur != null; cur = cur.next) {
                keys.push(cur.key);
            }
            return keys;
        },
        values: function(from) {
            var values = [], start = null;
            if (from) {
                start = this.containsKey(from) ? this._map[from] : null;
            } else {
                start = this._head;
            }
            for (var cur = start; cur != null; cur = cur.next) {
                values.push(cur.value);
            }
            return values;
        },
        iterator: function(from, type) {
            var property = "value";
            if (type && (type === "key" || type === "keys")) {
                property = "key";
            }
            var entry = this.containsKey(from) ? this._map[from] : null;
            return new _Iterator(entry, property);
        },
        size: function() {
            return this._size;
        }
    };
    _.LinkedHashMap = LinkedHashMap;
})();

(function() {
    "use strict";
    function createRegex(args) {
        var parts = args.urn.split(":");
        var reg = [];
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] == "*") {
                reg.push("([^:]*?)");
            } else if (parts[i] == "#") {
                reg.push("([\\s\\S]*)");
            } else {
                reg.push("(" + parts[i] + ")");
            }
        }
        var regex = new RegExp("^" + reg.join("\\:") + "$", "i");
        return regex;
    }
    _.createRegex = _.createRegex || createRegex;
    var Fabric = function(args) {
        args = args || {};
        var AutoInc = 0;
        this.__i__ = function() {
            return AutoInc++;
        };
        var peekTimeout = args.peekTimeout || 5e3;
        var bindings = {};
        var subscriptions = {};
        var queue = {};
        var processing = {};
        var replay = args.replay ? true : false;
        var store = null;
        if (replay) {
            if (args.persistenceProvider) {
                store = args.persistenceProvider;
            } else {
                store = new _.LinkedHashMap();
            }
        }
        function cb(args) {
            if (args.next) {
                args.data = args.cb.call(null, {
                    data: args.data,
                    matches: args.matches,
                    raw: args.raw,
                    binding: args.binding,
                    key: args.key
                });
                args.index++;
                var next = bindings[args.binding].subs[args.index];
                args.cb = args.next;
                if (next) {
                    args.next = next.callback;
                } else if (typeof args.cb === "function") {
                    args.next = true;
                } else {
                    args.next = undefined;
                }
                if (args.next) {
                    setTimeout(function(args) {
                        cb(args);
                    }, 0, args);
                }
            } else {
                setTimeout(function(args) {
                    args.dfd.notify({
                        data: args.data,
                        matches: args.matches,
                        raw: args.raw,
                        binding: args.binding,
                        key: args.key
                    });
                    if (args.cb) {
                        args.cb.call(null, {
                            data: args.data,
                            matches: args.matches,
                            raw: args.raw,
                            binding: args.binding,
                            key: args.key
                        });
                    }
                }, 0, {
                    cb: args.cb,
                    dfd: args.dfd,
                    data: args.data,
                    matches: args.matches,
                    raw: args.raw,
                    binding: args.binding,
                    key: args.key
                });
            }
            return null;
        }
        var triggerPublishSeed = {};
        function triggerPublish(args) {
            if (!args.sync) {
                for (var i = 0; i < args.subs.length; i++) {
                    delete triggerPublishSeed.next;
                    triggerPublishSeed.data = args.data;
                    triggerPublishSeed.matches = args.matches;
                    triggerPublishSeed.binding = args.loc;
                    triggerPublishSeed.raw = args.data;
                    triggerPublishSeed.cb = args.subs[i].callback;
                    triggerPublishSeed.dfd = args.subs[i].dfd;
                    triggerPublishSeed.index = i + 1;
                    triggerPublishSeed.key = args.key;
                    cb(triggerPublishSeed);
                }
            } else {
                triggerPublishSeed.data = args.data;
                triggerPublishSeed.matches = args.matches;
                triggerPublishSeed.binding = args.loc;
                triggerPublishSeed.raw = args.data;
                triggerPublishSeed.cb = args.subs[0].callback;
                triggerPublishSeed.index = 1;
                triggerPublishSeed.key = args.key;
                if (args.subs[1]) {
                    triggerPublishSeed.next = args.subs[1].callback;
                }
                cb(triggerPublishSeed);
            }
            return null;
        }
        this.subscribe = function(args) {
            args = args || {};
            args.key = "subscription_" + this.__i__();
            args.dfd = new _.Dfd();
            bindings[args.urn] = bindings[args.urn] || {
                subs: []
            };
            bindings[args.urn].regex = bindings[args.urn].regex || _.createRegex({
                urn: args.urn
            });
            bindings[args.urn].subs.push(args);
            subscriptions[args.key] = args;
            var ret = args.dfd.promise();
            ret.key = args.key;
            ret.id = args.id;
            ret.callback = args.callback;
            return ret;
        };
        this.unsubscribe = function(args) {
            args = args || {};
            if (_.isString(args)) {
                args = subscriptions[args] || {};
            }
            if (args.key) {
                args = subscriptions[args.key];
                delete subscriptions[args.key];
            }
            var binding = bindings[args.urn];
            if (binding) {
                for (var i = 0; i < binding.subs.length; i++) {
                    if (args.key && args.key == binding.subs[i].key) {
                        bindings[args.urn].subs.splice(i, 1);
                        if (bindings[args.urn].subs.length == 0) {
                            delete bindings[args.urn];
                        }
                    } else if (args.callback && args.callback == binding.subs[i].callback) {
                        bindings[args.urn].subs.splice(i, 1);
                        if (bindings[args.urn].subs.length == 0) {
                            delete bindings[args.urn];
                        }
                    }
                }
                return args;
            } else {
                return false;
            }
        };
        var publishMatches;
        var publishKey;
        function internalPublish(args) {
            var published = false;
            publishKey = null;
            for (publishKey in bindings) {
                if (args.urn == publishKey) {
                    args.subs = bindings[publishKey].subs;
                    args.loc = publishKey;
                    triggerPublish(args);
                    published = true;
                } else {
                    publishMatches = bindings[publishKey].regex.exec(args.urn);
                    if (publishMatches) {
                        publishMatches.splice(0, 1);
                        args.matches = publishMatches;
                        args.subs = bindings[publishKey].subs;
                        args.loc = publishKey;
                        triggerPublish(args);
                        published = true;
                    }
                }
            }
            return {
                published: published,
                key: args.key
            };
        }
        function publishTo(message, subscriptionKeys) {
            var subscription, args, published = false;
            for (var i = 0; i < subscriptionKeys.length; i++) {
                subscription = subscriptions[subscriptionKeys[i]];
                if (subscription) {
                    message.loc = subscription.urn;
                    message.subs = [ subscription ];
                    if (message.urn == subscription.urn) {
                        triggerPublish(message);
                        published = true;
                    } else {
                        publishMatches = bindings[subscription.urn].regex.exec(message.urn);
                        if (publishMatches) {
                            publishMatches.splice(0, 1);
                            message.matches = publishMatches;
                            triggerPublish(message);
                            published = true;
                        }
                    }
                }
            }
            return {
                published: published,
                key: message.key
            };
        }
        this.publish = function(args) {
            args = args || {
                data: {}
            };
            args.data = args.data || {};
            args.key = "message_" + this.__i__();
            args.type = args.type || "publish";
            if (replay) {
                store.put(args.key, args);
            }
            return internalPublish(args);
        };
        this.request = function(args) {
            args = args || {};
            args.data = args.data || {};
            args.data.key = "message_" + this.__i__();
            args.data.cbUrn = args.urn + ":" + args.data.key;
            args.data.type = "request";
            args.data.key = this.subscribe({
                urn: args.data.cbUrn,
                callback: args.callback
            }).key;
            this.publish(args);
            return;
        };
        this.fulfill = function(args) {
            args = args || {};
            args.type = "fulfill";
            var key = args.key;
            var urn = args.urn;
            this.publish(args);
            this.unsubscribe({
                urn: urn,
                key: key
            });
            return;
        };
        this.command = function(args) {
            args = args || {};
            args.data = args.data || {};
            args.data.key = "message_" + this.__i__();
            args.data.cbUrn = args.urn + ":" + args.data.key;
            args.data.type = "command";
            args.data.key = this.subscribe({
                urn: args.data.cbUrn,
                callback: args.callback
            }).key;
            this.publish(args);
            return;
        };
        this.notify = function(args) {
            args = args || {};
            args.type = "notify";
            var key = args.key;
            var urn = args.urn;
            this.publish(args);
            this.unsubscribe({
                urn: urn,
                key: key
            });
            return;
        };
        this.enqueue = function(args) {
            args = args || {};
            args.key = "queued" + this.__i__();
            queue[args.urn] = queue[args.urn] || {
                items: []
            };
            queue[args.urn].regex = _.createRegex({
                urn: args.urn
            });
            queue[args.urn].items.push(args);
            return args;
        };
        this.dequeue = function(args) {
            args = args || {};
            for (var key in queue) {
                if (args.urn == key) {
                    var match = false;
                    var j = 0;
                    for (var i = 0; i < queue[key].items.length; i++) {
                        if (args.key === queue[key].items[i].key) {
                            match = true;
                            j = i;
                            break;
                        }
                    }
                    if (match) {
                        queue[key].items.splice(j, 1);
                        if (queue[key].items.length == 0) {
                            delete queue[key];
                        }
                    }
                }
            }
            return;
        };
        this.peek = function(args) {
            args = args || {};
            args.offset = args.offset || 0;
            var i = 0;
            var message = null;
            var match = null;
            for (var key in queue) {
                if (args.urn == key) {
                    if (queue[key].items.length > args.offset) {
                        message = queue[key].items[args.offset];
                        queue[key].items.splice(args.offset, 1);
                        match = key;
                        break;
                    }
                } else {
                    var matches = queue[key].regex.exec(args.urn);
                    if (matches) {
                        if (queue[key].items.length > args.offset) {
                            match = key;
                            message = queue[key].items[args.offset];
                            matches.splice(0, 1);
                            message.matches = matches;
                            queue[key].items.splice(args.offset, 1);
                            break;
                        }
                    }
                }
            }
            if (message) {
                var timeout = setTimeout(function() {
                    queue[match] = queue[match] || {
                        items: [],
                        regex: _.createRegex({
                            urn: match
                        })
                    };
                    queue[match].items.unshift(message);
                    delete processing[message.key];
                }, peekTimeout);
                processing[message.key] = {
                    message: message,
                    timeout: timeout
                };
                args.callback.call(null, {
                    data: message
                });
            } else {
                args.callback.call(null, {
                    data: {}
                });
            }
            return;
        };
        this.handle = function(args) {
            args = args || {};
            var message = processing[args.key];
            if (message) {
                clearTimeout(message.timeout);
                delete processing[args.key];
            }
            return;
        };
        this.release = function(args) {
            args = args || {};
            queue[processing[args.key].message.urn].items.unshift(processing[args.key].message);
            delete processing[args.key];
            return;
        };
        this.canReplay = function() {
            return replay;
        };
        this.replay = function(from, count, to) {
            if (!replay) {
                throw new Error("Cannot replay events since Fabric was not initialized with replay=true");
            }
            if (!store.containsKey(from)) {
                throw new Error("Cannot replay from '" + from + "', the message ID was not found");
            }
            if (arguments.length === 1) {
                count = -1;
                to = null;
            } else if (arguments.length === 2) {
                if (_.isArray(count)) {
                    to = count;
                    count = -1;
                } else {
                    to = null;
                }
            }
            var publishFunc;
            if (to) {
                publishFunc = function(message) {
                    return publishTo(message, to);
                };
            } else {
                publishFunc = internalPublish;
            }
            var itr = store.iterator(from + 1);
            var numPublished = 0;
            var publishedInfo;
            while (itr.hasNext() && (count < 0 || numPublished < count)) {
                var message = itr.next();
                publishedInfo = publishFunc(message);
                if (publishedInfo.published) {
                    numPublished++;
                }
            }
        };
        this.id = "Fabric_" + this.__i__();
        if (!args.debugMode) {
            if (Object.freeze) {
                Object.freeze(this);
            }
            if (Object.defineProperties) {
                Object.defineProperties(Fabric.prototype, {
                    name: {
                        writable: false
                    },
                    toString: {
                        writable: false
                    }
                });
            }
        } else {
            this.debug = function() {
                return {
                    bindings: bindings,
                    queue: queue,
                    processing: processing
                };
            };
        }
        return this;
    };
    _.extend(Fabric.prototype, {
        name: "Fabric",
        toString: function() {
            return "[object Fabric]";
        }
    });
    _.Fabric = Fabric;
})();