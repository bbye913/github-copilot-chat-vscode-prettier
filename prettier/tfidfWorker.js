'use strict'
var ne = Object.defineProperty
var Ue = Object.getOwnPropertyDescriptor
var Ie = Object.getOwnPropertyNames
var Re = Object.prototype.hasOwnProperty
var ye = (t, e, n, i) => {
  if ((e && typeof e == 'object') || typeof e == 'function')
    for (let s of Ie(e))
      !Re.call(t, s) && s !== n && ne(t, s, { get: () => e[s], enumerable: !(i = Ue(e, s)) || i.enumerable })
  return t
}
var ve = t => ye(ne({}, '__esModule', { value: !0 }), t)
var ft = {}
module.exports = ve(ft)
var Ee = require('worker_threads')
function Te(t, e) {
  let n
  return (
    e.length === 0
      ? (n = t)
      : (n = t.replace(/\{(\d+)\}/g, function (i, s) {
          let r = s[0]
          return typeof e[r] < 'u' ? e[r] : i
        })),
    n
  )
}
function ie(t, e, ...n) {
  return Te(e, n)
}
var k = 'en',
  G = !1,
  W = !1,
  V = !1,
  Le = !1,
  de = !1,
  re = !1,
  De = !1,
  Se = !1,
  Oe = !1,
  Fe = !1,
  B,
  $ = k,
  se = k,
  Ke,
  v,
  T = globalThis,
  I
typeof T.vscode < 'u' && typeof T.vscode.process < 'u' ? (I = T.vscode.process) : typeof process < 'u' && (I = process)
var oe = typeof I?.versions?.electron == 'string',
  ke = oe && I?.type === 'renderer'
if (typeof navigator == 'object' && !ke)
  (v = navigator.userAgent),
    (G = v.indexOf('Windows') >= 0),
    (W = v.indexOf('Macintosh') >= 0),
    (Se =
      (v.indexOf('Macintosh') >= 0 || v.indexOf('iPad') >= 0 || v.indexOf('iPhone') >= 0) &&
      !!navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 0),
    (V = v.indexOf('Linux') >= 0),
    (Fe = v?.indexOf('Mobi') >= 0),
    (re = !0),
    (B = (ie({ key: 'ensureLoaderPluginIsLoaded', comment: ['{Locked}'] }, '_'), void 0) || k),
    ($ = B),
    (se = navigator.language)
else if (typeof I == 'object') {
  ;(G = I.platform === 'win32'),
    (W = I.platform === 'darwin'),
    (V = I.platform === 'linux'),
    (Le = V && !!I.env.SNAP && !!I.env.SNAP_REVISION),
    (De = oe),
    (Oe = !!I.env.CI || !!I.env.BUILD_ARTIFACTSTAGINGDIRECTORY),
    (B = k),
    ($ = k)
  let t = I.env.VSCODE_NLS_CONFIG
  if (t)
    try {
      let e = JSON.parse(t),
        n = e.availableLanguages['*']
      ;(B = e.locale), (se = e.osLocale), ($ = n || k), (Ke = e._translationsConfigFile)
    } catch {}
  de = !0
} else console.error('Unable to resolve platform.')
var X = 0
W ? (X = 1) : G ? (X = 3) : V && (X = 2)
var O = G,
  le = W
var Ne = re && typeof T.importScripts == 'function',
  mt = Ne ? T.origin : void 0
var y = v,
  w = $,
  Pe
;(i => {
  function t() {
    return w
  }
  i.value = t
  function e() {
    return w.length === 2 ? w === 'en' : w.length >= 3 ? w[0] === 'e' && w[1] === 'n' && w[2] === '-' : !1
  }
  i.isDefaultVariant = e
  function n() {
    return w === 'en'
  }
  i.isDefault = n
})((Pe ||= {}))
var he = typeof T.postMessage == 'function' && !T.importScripts,
  pt = (() => {
    if (he) {
      let t = []
      T.addEventListener('message', n => {
        if (n.data && n.data.vscodeScheduleAsyncWork)
          for (let i = 0, s = t.length; i < s; i++) {
            let r = t[i]
            if (r.id === n.data.vscodeScheduleAsyncWork) {
              t.splice(i, 1), r.callback()
              return
            }
          }
      })
      let e = 0
      return n => {
        let i = ++e
        t.push({ id: i, callback: n }), T.postMessage({ vscodeScheduleAsyncWork: i }, '*')
      }
    }
    return t => setTimeout(t)
  })()
var Me = !!(y && y.indexOf('Chrome') >= 0),
  xt = !!(y && y.indexOf('Firefox') >= 0),
  bt = !!(!Me && y && y.indexOf('Safari') >= 0),
  Et = !!(y && y.indexOf('Edg/') >= 0),
  At = !!(y && y.indexOf('Android') >= 0)
var F,
  Y = globalThis.vscode
if (typeof Y < 'u' && typeof Y.process < 'u') {
  let t = Y.process
  F = {
    get platform() {
      return t.platform
    },
    get arch() {
      return t.arch
    },
    get env() {
      return t.env
    },
    cwd() {
      return t.cwd()
    },
  }
} else
  typeof process < 'u'
    ? (F = {
        get platform() {
          return process.platform
        },
        get arch() {
          return process.arch
        },
        get env() {
          return process.env
        },
        cwd() {
          return process.env.VSCODE_CWD || process.cwd()
        },
      })
    : (F = {
        get platform() {
          return O ? 'win32' : le ? 'darwin' : 'linux'
        },
        get arch() {},
        get env() {
          return {}
        },
        cwd() {
          return '/'
        },
      })
var h = F.cwd,
  ce = F.env,
  fe = F.platform,
  yt = F.arch
var Ve = 65,
  $e = 97,
  Ge = 90,
  We = 122,
  D = 46,
  E = 47,
  A = 92,
  L = 58,
  He = 63,
  H = class extends Error {
    constructor(n, i, s) {
      let r
      typeof i == 'string' && i.indexOf('not ') === 0
        ? ((r = 'must not be'), (i = i.replace(/^not /, '')))
        : (r = 'must be')
      let o = n.indexOf('.') !== -1 ? 'property' : 'argument',
        l = `The "${n}" ${o} ${r} of type ${i}`
      l += `. Received type ${typeof s}`
      super(l)
      this.code = 'ERR_INVALID_ARG_TYPE'
    }
  }
function ze(t, e) {
  if (t === null || typeof t != 'object') throw new H(e, 'Object', t)
}
function p(t, e) {
  if (typeof t != 'string') throw new H(e, 'string', t)
}
var U = fe === 'win32'
function _(t) {
  return t === E || t === A
}
function Z(t) {
  return t === E
}
function d(t) {
  return (t >= Ve && t <= Ge) || (t >= $e && t <= We)
}
function z(t, e, n, i) {
  let s = '',
    r = 0,
    o = -1,
    l = 0,
    f = 0
  for (let c = 0; c <= t.length; ++c) {
    if (c < t.length) f = t.charCodeAt(c)
    else {
      if (i(f)) break
      f = E
    }
    if (i(f)) {
      if (!(o === c - 1 || l === 1))
        if (l === 2) {
          if (s.length < 2 || r !== 2 || s.charCodeAt(s.length - 1) !== D || s.charCodeAt(s.length - 2) !== D) {
            if (s.length > 2) {
              let a = s.lastIndexOf(n)
              a === -1 ? ((s = ''), (r = 0)) : ((s = s.slice(0, a)), (r = s.length - 1 - s.lastIndexOf(n))),
                (o = c),
                (l = 0)
              continue
            } else if (s.length !== 0) {
              ;(s = ''), (r = 0), (o = c), (l = 0)
              continue
            }
          }
          e && ((s += s.length > 0 ? `${n}..` : '..'), (r = 2))
        } else s.length > 0 ? (s += `${n}${t.slice(o + 1, c)}`) : (s = t.slice(o + 1, c)), (r = c - o - 1)
      ;(o = c), (l = 0)
    } else f === D && l !== -1 ? ++l : (l = -1)
  }
  return s
}
function ue(t, e) {
  ze(e, 'pathObject')
  let n = e.dir || e.root,
    i = e.base || `${e.name || ''}${e.ext || ''}`
  return n ? (n === e.root ? `${n}${i}` : `${n}${t}${i}`) : i
}
var x = {
    resolve(...t) {
      let e = '',
        n = '',
        i = !1
      for (let s = t.length - 1; s >= -1; s--) {
        let r
        if (s >= 0) {
          if (((r = t[s]), p(r, 'path'), r.length === 0)) continue
        } else
          e.length === 0
            ? (r = h())
            : ((r = ce[`=${e}`] || h()),
              (r === void 0 || (r.slice(0, 2).toLowerCase() !== e.toLowerCase() && r.charCodeAt(2) === A)) &&
                (r = `${e}\\`))
        let o = r.length,
          l = 0,
          f = '',
          c = !1,
          a = r.charCodeAt(0)
        if (o === 1) _(a) && ((l = 1), (c = !0))
        else if (_(a))
          if (((c = !0), _(r.charCodeAt(1)))) {
            let u = 2,
              g = u
            for (; u < o && !_(r.charCodeAt(u)); ) u++
            if (u < o && u !== g) {
              let K = r.slice(g, u)
              for (g = u; u < o && _(r.charCodeAt(u)); ) u++
              if (u < o && u !== g) {
                for (g = u; u < o && !_(r.charCodeAt(u)); ) u++
                ;(u === o || u !== g) && ((f = `\\\\${K}\\${r.slice(g, u)}`), (l = u))
              }
            }
          } else l = 1
        else
          d(a) &&
            r.charCodeAt(1) === L &&
            ((f = r.slice(0, 2)), (l = 2), o > 2 && _(r.charCodeAt(2)) && ((c = !0), (l = 3)))
        if (f.length > 0)
          if (e.length > 0) {
            if (f.toLowerCase() !== e.toLowerCase()) continue
          } else e = f
        if (i) {
          if (e.length > 0) break
        } else if (((n = `${r.slice(l)}\\${n}`), (i = c), c && e.length > 0)) break
      }
      return (n = z(n, !i, '\\', _)), i ? `${e}\\${n}` : `${e}${n}` || '.'
    },
    normalize(t) {
      p(t, 'path')
      let e = t.length
      if (e === 0) return '.'
      let n = 0,
        i,
        s = !1,
        r = t.charCodeAt(0)
      if (e === 1) return Z(r) ? '\\' : t
      if (_(r))
        if (((s = !0), _(t.charCodeAt(1)))) {
          let l = 2,
            f = l
          for (; l < e && !_(t.charCodeAt(l)); ) l++
          if (l < e && l !== f) {
            let c = t.slice(f, l)
            for (f = l; l < e && _(t.charCodeAt(l)); ) l++
            if (l < e && l !== f) {
              for (f = l; l < e && !_(t.charCodeAt(l)); ) l++
              if (l === e) return `\\\\${c}\\${t.slice(f)}\\`
              l !== f && ((i = `\\\\${c}\\${t.slice(f, l)}`), (n = l))
            }
          }
        } else n = 1
      else
        d(r) &&
          t.charCodeAt(1) === L &&
          ((i = t.slice(0, 2)), (n = 2), e > 2 && _(t.charCodeAt(2)) && ((s = !0), (n = 3)))
      let o = n < e ? z(t.slice(n), !s, '\\', _) : ''
      return (
        o.length === 0 && !s && (o = '.'),
        o.length > 0 && _(t.charCodeAt(e - 1)) && (o += '\\'),
        i === void 0 ? (s ? `\\${o}` : o) : s ? `${i}\\${o}` : `${i}${o}`
      )
    },
    isAbsolute(t) {
      p(t, 'path')
      let e = t.length
      if (e === 0) return !1
      let n = t.charCodeAt(0)
      return _(n) || (e > 2 && d(n) && t.charCodeAt(1) === L && _(t.charCodeAt(2)))
    },
    join(...t) {
      if (t.length === 0) return '.'
      let e, n
      for (let r = 0; r < t.length; ++r) {
        let o = t[r]
        p(o, 'path'), o.length > 0 && (e === void 0 ? (e = n = o) : (e += `\\${o}`))
      }
      if (e === void 0) return '.'
      let i = !0,
        s = 0
      if (typeof n == 'string' && _(n.charCodeAt(0))) {
        ++s
        let r = n.length
        r > 1 && _(n.charCodeAt(1)) && (++s, r > 2 && (_(n.charCodeAt(2)) ? ++s : (i = !1)))
      }
      if (i) {
        for (; s < e.length && _(e.charCodeAt(s)); ) s++
        s >= 2 && (e = `\\${e.slice(s)}`)
      }
      return x.normalize(e)
    },
    relative(t, e) {
      if ((p(t, 'from'), p(e, 'to'), t === e)) return ''
      let n = x.resolve(t),
        i = x.resolve(e)
      if (n === i || ((t = n.toLowerCase()), (e = i.toLowerCase()), t === e)) return ''
      let s = 0
      for (; s < t.length && t.charCodeAt(s) === A; ) s++
      let r = t.length
      for (; r - 1 > s && t.charCodeAt(r - 1) === A; ) r--
      let o = r - s,
        l = 0
      for (; l < e.length && e.charCodeAt(l) === A; ) l++
      let f = e.length
      for (; f - 1 > l && e.charCodeAt(f - 1) === A; ) f--
      let c = f - l,
        a = o < c ? o : c,
        u = -1,
        g = 0
      for (; g < a; g++) {
        let te = t.charCodeAt(s + g)
        if (te !== e.charCodeAt(l + g)) break
        te === A && (u = g)
      }
      if (g !== a) {
        if (u === -1) return i
      } else {
        if (c > a) {
          if (e.charCodeAt(l + g) === A) return i.slice(l + g + 1)
          if (g === 2) return i.slice(l + g)
        }
        o > a && (t.charCodeAt(s + g) === A ? (u = g) : g === 2 && (u = 3)), u === -1 && (u = 0)
      }
      let K = ''
      for (g = s + u + 1; g <= r; ++g) (g === r || t.charCodeAt(g) === A) && (K += K.length === 0 ? '..' : '\\..')
      return (l += u), K.length > 0 ? `${K}${i.slice(l, f)}` : (i.charCodeAt(l) === A && ++l, i.slice(l, f))
    },
    toNamespacedPath(t) {
      if (typeof t != 'string' || t.length === 0) return t
      let e = x.resolve(t)
      if (e.length <= 2) return t
      if (e.charCodeAt(0) === A) {
        if (e.charCodeAt(1) === A) {
          let n = e.charCodeAt(2)
          if (n !== He && n !== D) return `\\\\?\\UNC\\${e.slice(2)}`
        }
      } else if (d(e.charCodeAt(0)) && e.charCodeAt(1) === L && e.charCodeAt(2) === A) return `\\\\?\\${e}`
      return t
    },
    dirname(t) {
      p(t, 'path')
      let e = t.length
      if (e === 0) return '.'
      let n = -1,
        i = 0,
        s = t.charCodeAt(0)
      if (e === 1) return _(s) ? t : '.'
      if (_(s)) {
        if (((n = i = 1), _(t.charCodeAt(1)))) {
          let l = 2,
            f = l
          for (; l < e && !_(t.charCodeAt(l)); ) l++
          if (l < e && l !== f) {
            for (f = l; l < e && _(t.charCodeAt(l)); ) l++
            if (l < e && l !== f) {
              for (f = l; l < e && !_(t.charCodeAt(l)); ) l++
              if (l === e) return t
              l !== f && (n = i = l + 1)
            }
          }
        }
      } else d(s) && t.charCodeAt(1) === L && ((n = e > 2 && _(t.charCodeAt(2)) ? 3 : 2), (i = n))
      let r = -1,
        o = !0
      for (let l = e - 1; l >= i; --l)
        if (_(t.charCodeAt(l))) {
          if (!o) {
            r = l
            break
          }
        } else o = !1
      if (r === -1) {
        if (n === -1) return '.'
        r = n
      }
      return t.slice(0, r)
    },
    basename(t, e) {
      e !== void 0 && p(e, 'ext'), p(t, 'path')
      let n = 0,
        i = -1,
        s = !0,
        r
      if (
        (t.length >= 2 && d(t.charCodeAt(0)) && t.charCodeAt(1) === L && (n = 2),
        e !== void 0 && e.length > 0 && e.length <= t.length)
      ) {
        if (e === t) return ''
        let o = e.length - 1,
          l = -1
        for (r = t.length - 1; r >= n; --r) {
          let f = t.charCodeAt(r)
          if (_(f)) {
            if (!s) {
              n = r + 1
              break
            }
          } else
            l === -1 && ((s = !1), (l = r + 1)),
              o >= 0 && (f === e.charCodeAt(o) ? --o === -1 && (i = r) : ((o = -1), (i = l)))
        }
        return n === i ? (i = l) : i === -1 && (i = t.length), t.slice(n, i)
      }
      for (r = t.length - 1; r >= n; --r)
        if (_(t.charCodeAt(r))) {
          if (!s) {
            n = r + 1
            break
          }
        } else i === -1 && ((s = !1), (i = r + 1))
      return i === -1 ? '' : t.slice(n, i)
    },
    extname(t) {
      p(t, 'path')
      let e = 0,
        n = -1,
        i = 0,
        s = -1,
        r = !0,
        o = 0
      t.length >= 2 && t.charCodeAt(1) === L && d(t.charCodeAt(0)) && (e = i = 2)
      for (let l = t.length - 1; l >= e; --l) {
        let f = t.charCodeAt(l)
        if (_(f)) {
          if (!r) {
            i = l + 1
            break
          }
          continue
        }
        s === -1 && ((r = !1), (s = l + 1)), f === D ? (n === -1 ? (n = l) : o !== 1 && (o = 1)) : n !== -1 && (o = -1)
      }
      return n === -1 || s === -1 || o === 0 || (o === 1 && n === s - 1 && n === i + 1) ? '' : t.slice(n, s)
    },
    format: ue.bind(null, '\\'),
    parse(t) {
      p(t, 'path')
      let e = { root: '', dir: '', base: '', ext: '', name: '' }
      if (t.length === 0) return e
      let n = t.length,
        i = 0,
        s = t.charCodeAt(0)
      if (n === 1) return _(s) ? ((e.root = e.dir = t), e) : ((e.base = e.name = t), e)
      if (_(s)) {
        if (((i = 1), _(t.charCodeAt(1)))) {
          let u = 2,
            g = u
          for (; u < n && !_(t.charCodeAt(u)); ) u++
          if (u < n && u !== g) {
            for (g = u; u < n && _(t.charCodeAt(u)); ) u++
            if (u < n && u !== g) {
              for (g = u; u < n && !_(t.charCodeAt(u)); ) u++
              u === n ? (i = u) : u !== g && (i = u + 1)
            }
          }
        }
      } else if (d(s) && t.charCodeAt(1) === L) {
        if (n <= 2) return (e.root = e.dir = t), e
        if (((i = 2), _(t.charCodeAt(2)))) {
          if (n === 3) return (e.root = e.dir = t), e
          i = 3
        }
      }
      i > 0 && (e.root = t.slice(0, i))
      let r = -1,
        o = i,
        l = -1,
        f = !0,
        c = t.length - 1,
        a = 0
      for (; c >= i; --c) {
        if (((s = t.charCodeAt(c)), _(s))) {
          if (!f) {
            o = c + 1
            break
          }
          continue
        }
        l === -1 && ((f = !1), (l = c + 1)), s === D ? (r === -1 ? (r = c) : a !== 1 && (a = 1)) : r !== -1 && (a = -1)
      }
      return (
        l !== -1 &&
          (r === -1 || a === 0 || (a === 1 && r === l - 1 && r === o + 1)
            ? (e.base = e.name = t.slice(o, l))
            : ((e.name = t.slice(o, r)), (e.base = t.slice(o, l)), (e.ext = t.slice(r, l)))),
        o > 0 && o !== i ? (e.dir = t.slice(0, o - 1)) : (e.dir = e.root),
        e
      )
    },
    sep: '\\',
    delimiter: ';',
    win32: null,
    posix: null,
  },
  qe = (() => {
    if (U) {
      let t = /\\/g
      return () => {
        let e = h().replace(t, '/')
        return e.slice(e.indexOf('/'))
      }
    }
    return () => h()
  })(),
  b = {
    resolve(...t) {
      let e = '',
        n = !1
      for (let i = t.length - 1; i >= -1 && !n; i--) {
        let s = i >= 0 ? t[i] : qe()
        p(s, 'path'), s.length !== 0 && ((e = `${s}/${e}`), (n = s.charCodeAt(0) === E))
      }
      return (e = z(e, !n, '/', Z)), n ? `/${e}` : e.length > 0 ? e : '.'
    },
    normalize(t) {
      if ((p(t, 'path'), t.length === 0)) return '.'
      let e = t.charCodeAt(0) === E,
        n = t.charCodeAt(t.length - 1) === E
      return (t = z(t, !e, '/', Z)), t.length === 0 ? (e ? '/' : n ? './' : '.') : (n && (t += '/'), e ? `/${t}` : t)
    },
    isAbsolute(t) {
      return p(t, 'path'), t.length > 0 && t.charCodeAt(0) === E
    },
    join(...t) {
      if (t.length === 0) return '.'
      let e
      for (let n = 0; n < t.length; ++n) {
        let i = t[n]
        p(i, 'path'), i.length > 0 && (e === void 0 ? (e = i) : (e += `/${i}`))
      }
      return e === void 0 ? '.' : b.normalize(e)
    },
    relative(t, e) {
      if ((p(t, 'from'), p(e, 'to'), t === e || ((t = b.resolve(t)), (e = b.resolve(e)), t === e))) return ''
      let n = 1,
        i = t.length,
        s = i - n,
        r = 1,
        o = e.length - r,
        l = s < o ? s : o,
        f = -1,
        c = 0
      for (; c < l; c++) {
        let u = t.charCodeAt(n + c)
        if (u !== e.charCodeAt(r + c)) break
        u === E && (f = c)
      }
      if (c === l)
        if (o > l) {
          if (e.charCodeAt(r + c) === E) return e.slice(r + c + 1)
          if (c === 0) return e.slice(r + c)
        } else s > l && (t.charCodeAt(n + c) === E ? (f = c) : c === 0 && (f = 0))
      let a = ''
      for (c = n + f + 1; c <= i; ++c) (c === i || t.charCodeAt(c) === E) && (a += a.length === 0 ? '..' : '/..')
      return `${a}${e.slice(r + f)}`
    },
    toNamespacedPath(t) {
      return t
    },
    dirname(t) {
      if ((p(t, 'path'), t.length === 0)) return '.'
      let e = t.charCodeAt(0) === E,
        n = -1,
        i = !0
      for (let s = t.length - 1; s >= 1; --s)
        if (t.charCodeAt(s) === E) {
          if (!i) {
            n = s
            break
          }
        } else i = !1
      return n === -1 ? (e ? '/' : '.') : e && n === 1 ? '//' : t.slice(0, n)
    },
    basename(t, e) {
      e !== void 0 && p(e, 'ext'), p(t, 'path')
      let n = 0,
        i = -1,
        s = !0,
        r
      if (e !== void 0 && e.length > 0 && e.length <= t.length) {
        if (e === t) return ''
        let o = e.length - 1,
          l = -1
        for (r = t.length - 1; r >= 0; --r) {
          let f = t.charCodeAt(r)
          if (f === E) {
            if (!s) {
              n = r + 1
              break
            }
          } else
            l === -1 && ((s = !1), (l = r + 1)),
              o >= 0 && (f === e.charCodeAt(o) ? --o === -1 && (i = r) : ((o = -1), (i = l)))
        }
        return n === i ? (i = l) : i === -1 && (i = t.length), t.slice(n, i)
      }
      for (r = t.length - 1; r >= 0; --r)
        if (t.charCodeAt(r) === E) {
          if (!s) {
            n = r + 1
            break
          }
        } else i === -1 && ((s = !1), (i = r + 1))
      return i === -1 ? '' : t.slice(n, i)
    },
    extname(t) {
      p(t, 'path')
      let e = -1,
        n = 0,
        i = -1,
        s = !0,
        r = 0
      for (let o = t.length - 1; o >= 0; --o) {
        let l = t.charCodeAt(o)
        if (l === E) {
          if (!s) {
            n = o + 1
            break
          }
          continue
        }
        i === -1 && ((s = !1), (i = o + 1)), l === D ? (e === -1 ? (e = o) : r !== 1 && (r = 1)) : e !== -1 && (r = -1)
      }
      return e === -1 || i === -1 || r === 0 || (r === 1 && e === i - 1 && e === n + 1) ? '' : t.slice(e, i)
    },
    format: ue.bind(null, '/'),
    parse(t) {
      p(t, 'path')
      let e = { root: '', dir: '', base: '', ext: '', name: '' }
      if (t.length === 0) return e
      let n = t.charCodeAt(0) === E,
        i
      n ? ((e.root = '/'), (i = 1)) : (i = 0)
      let s = -1,
        r = 0,
        o = -1,
        l = !0,
        f = t.length - 1,
        c = 0
      for (; f >= i; --f) {
        let a = t.charCodeAt(f)
        if (a === E) {
          if (!l) {
            r = f + 1
            break
          }
          continue
        }
        o === -1 && ((l = !1), (o = f + 1)), a === D ? (s === -1 ? (s = f) : c !== 1 && (c = 1)) : s !== -1 && (c = -1)
      }
      if (o !== -1) {
        let a = r === 0 && n ? 1 : r
        s === -1 || c === 0 || (c === 1 && s === o - 1 && s === r + 1)
          ? (e.base = e.name = t.slice(a, o))
          : ((e.name = t.slice(a, s)), (e.base = t.slice(a, o)), (e.ext = t.slice(s, o)))
      }
      return r > 0 ? (e.dir = t.slice(0, r - 1)) : n && (e.dir = '/'), e
    },
    sep: '/',
    delimiter: ':',
    win32: null,
    posix: null,
  }
b.win32 = x.win32 = x
b.posix = x.posix = b
var vt = U ? x.normalize : b.normalize,
  Tt = U ? x.isAbsolute : b.isAbsolute,
  wt = U ? x.join : b.join,
  Lt = U ? x.resolve : b.resolve,
  dt = U ? x.relative : b.relative,
  Dt = U ? x.dirname : b.dirname,
  St = U ? x.basename : b.basename,
  Ot = U ? x.extname : b.extname,
  Ft = U ? x.format : b.format,
  Kt = U ? x.parse : b.parse,
  kt = U ? x.toNamespacedPath : b.toNamespacedPath,
  Nt = U ? x.sep : b.sep,
  Pt = U ? x.delimiter : b.delimiter
var Xe = /^\w[\w\d+.-]*$/,
  Ye = /^\//,
  Ze = /^\/\//
function Qe(t, e) {
  if (!t.scheme && e)
    throw new Error(
      `[UriError]: Scheme is missing: {scheme: "", authority: "${t.authority}", path: "${t.path}", query: "${t.query}", fragment: "${t.fragment}"}`
    )
  if (t.scheme && !Xe.test(t.scheme)) throw new Error('[UriError]: Scheme contains illegal characters.')
  if (t.path) {
    if (t.authority) {
      if (!Ye.test(t.path))
        throw new Error(
          '[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character'
        )
    } else if (Ze.test(t.path))
      throw new Error(
        '[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")'
      )
  }
}
function Je(t, e) {
  return !t && !e ? 'file' : t
}
function Ce(t, e) {
  switch (t) {
    case 'https':
    case 'http':
    case 'file':
      e ? e[0] !== R && (e = R + e) : (e = R)
      break
  }
  return e
}
var m = '',
  R = '/',
  et = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/,
  N = class t {
    static isUri(e) {
      return e instanceof t
        ? !0
        : e
        ? typeof e.authority == 'string' &&
          typeof e.fragment == 'string' &&
          typeof e.path == 'string' &&
          typeof e.query == 'string' &&
          typeof e.scheme == 'string' &&
          typeof e.fsPath == 'string' &&
          typeof e.with == 'function' &&
          typeof e.toString == 'function'
        : !1
    }
    constructor(e, n, i, s, r, o = !1) {
      typeof e == 'object'
        ? ((this.scheme = e.scheme || m),
          (this.authority = e.authority || m),
          (this.path = e.path || m),
          (this.query = e.query || m),
          (this.fragment = e.fragment || m))
        : ((this.scheme = Je(e, o)),
          (this.authority = n || m),
          (this.path = Ce(this.scheme, i || m)),
          (this.query = s || m),
          (this.fragment = r || m),
          Qe(this, o))
    }
    get fsPath() {
      return Q(this, !1)
    }
    with(e) {
      if (!e) return this
      let { scheme: n, authority: i, path: s, query: r, fragment: o } = e
      return (
        n === void 0 ? (n = this.scheme) : n === null && (n = m),
        i === void 0 ? (i = this.authority) : i === null && (i = m),
        s === void 0 ? (s = this.path) : s === null && (s = m),
        r === void 0 ? (r = this.query) : r === null && (r = m),
        o === void 0 ? (o = this.fragment) : o === null && (o = m),
        n === this.scheme && i === this.authority && s === this.path && r === this.query && o === this.fragment
          ? this
          : new S(n, i, s, r, o)
      )
    }
    static parse(e, n = !1) {
      let i = et.exec(e)
      return i ? new S(i[2] || m, q(i[4] || m), q(i[5] || m), q(i[7] || m), q(i[9] || m), n) : new S(m, m, m, m, m)
    }
    static file(e) {
      let n = m
      if ((O && (e = e.replace(/\\/g, R)), e[0] === R && e[1] === R)) {
        let i = e.indexOf(R, 2)
        i === -1 ? ((n = e.substring(2)), (e = R)) : ((n = e.substring(2, i)), (e = e.substring(i) || R))
      }
      return new S('file', n, e, m, m)
    }
    static from(e, n) {
      return new S(e.scheme, e.authority, e.path, e.query, e.fragment, n)
    }
    static joinPath(e, ...n) {
      if (!e.path) throw new Error('[UriError]: cannot call joinPath on URI without path')
      let i
      return (
        O && e.scheme === 'file' ? (i = t.file(x.join(Q(e, !0), ...n)).path) : (i = b.join(e.path, ...n)),
        e.with({ path: i })
      )
    }
    toString(e = !1) {
      return J(this, e)
    }
    toJSON() {
      return this
    }
    static revive(e) {
      if (e) {
        if (e instanceof t) return e
        {
          let n = new S(e)
          return (n._formatted = e.external ?? null), (n._fsPath = e._sep === ge ? e.fsPath ?? null : null), n
        }
      } else return e
    }
  }
var ge = O ? 1 : void 0,
  S = class extends N {
    constructor() {
      super(...arguments)
      this._formatted = null
      this._fsPath = null
    }
    get fsPath() {
      return this._fsPath || (this._fsPath = Q(this, !1)), this._fsPath
    }
    toString(n = !1) {
      return n ? J(this, !0) : (this._formatted || (this._formatted = J(this, !1)), this._formatted)
    }
    toJSON() {
      let n = { $mid: 1 }
      return (
        this._fsPath && ((n.fsPath = this._fsPath), (n._sep = ge)),
        this._formatted && (n.external = this._formatted),
        this.path && (n.path = this.path),
        this.scheme && (n.scheme = this.scheme),
        this.authority && (n.authority = this.authority),
        this.query && (n.query = this.query),
        this.fragment && (n.fragment = this.fragment),
        n
      )
    }
  },
  me = {
    58: '%3A',
    47: '%2F',
    63: '%3F',
    35: '%23',
    91: '%5B',
    93: '%5D',
    64: '%40',
    33: '%21',
    36: '%24',
    38: '%26',
    39: '%27',
    40: '%28',
    41: '%29',
    42: '%2A',
    43: '%2B',
    44: '%2C',
    59: '%3B',
    61: '%3D',
    32: '%20',
  }
function _e(t, e, n) {
  let i,
    s = -1
  for (let r = 0; r < t.length; r++) {
    let o = t.charCodeAt(r)
    if (
      (o >= 97 && o <= 122) ||
      (o >= 65 && o <= 90) ||
      (o >= 48 && o <= 57) ||
      o === 45 ||
      o === 46 ||
      o === 95 ||
      o === 126 ||
      (e && o === 47) ||
      (n && o === 91) ||
      (n && o === 93) ||
      (n && o === 58)
    )
      s !== -1 && ((i += encodeURIComponent(t.substring(s, r))), (s = -1)), i !== void 0 && (i += t.charAt(r))
    else {
      i === void 0 && (i = t.substr(0, r))
      let l = me[o]
      l !== void 0
        ? (s !== -1 && ((i += encodeURIComponent(t.substring(s, r))), (s = -1)), (i += l))
        : s === -1 && (s = r)
    }
  }
  return s !== -1 && (i += encodeURIComponent(t.substring(s))), i !== void 0 ? i : t
}
function tt(t) {
  let e
  for (let n = 0; n < t.length; n++) {
    let i = t.charCodeAt(n)
    i === 35 || i === 63 ? (e === void 0 && (e = t.substr(0, n)), (e += me[i])) : e !== void 0 && (e += t[n])
  }
  return e !== void 0 ? e : t
}
function Q(t, e) {
  let n
  return (
    t.authority && t.path.length > 1 && t.scheme === 'file'
      ? (n = `//${t.authority}${t.path}`)
      : t.path.charCodeAt(0) === 47 &&
        ((t.path.charCodeAt(1) >= 65 && t.path.charCodeAt(1) <= 90) ||
          (t.path.charCodeAt(1) >= 97 && t.path.charCodeAt(1) <= 122)) &&
        t.path.charCodeAt(2) === 58
      ? e
        ? (n = t.path.substr(1))
        : (n = t.path[1].toLowerCase() + t.path.substr(2))
      : (n = t.path),
    O && (n = n.replace(/\//g, '\\')),
    n
  )
}
function J(t, e) {
  let n = e ? tt : _e,
    i = '',
    { scheme: s, authority: r, path: o, query: l, fragment: f } = t
  if ((s && ((i += s), (i += ':')), (r || s === 'file') && ((i += R), (i += R)), r)) {
    let c = r.indexOf('@')
    if (c !== -1) {
      let a = r.substr(0, c)
      ;(r = r.substr(c + 1)),
        (c = a.lastIndexOf(':')),
        c === -1
          ? (i += n(a, !1, !1))
          : ((i += n(a.substr(0, c), !1, !1)), (i += ':'), (i += n(a.substr(c + 1), !1, !0))),
        (i += '@')
    }
    ;(r = r.toLowerCase()),
      (c = r.lastIndexOf(':')),
      c === -1 ? (i += n(r, !1, !0)) : ((i += n(r.substr(0, c), !1, !0)), (i += r.substr(c)))
  }
  if (o) {
    if (o.length >= 3 && o.charCodeAt(0) === 47 && o.charCodeAt(2) === 58) {
      let c = o.charCodeAt(1)
      c >= 65 && c <= 90 && (o = `/${String.fromCharCode(c + 32)}:${o.substr(3)}`)
    } else if (o.length >= 2 && o.charCodeAt(1) === 58) {
      let c = o.charCodeAt(0)
      c >= 65 && c <= 90 && (o = `${String.fromCharCode(c + 32)}:${o.substr(2)}`)
    }
    i += n(o, !0, !1)
  }
  return l && ((i += '?'), (i += n(l, !1, !1))), f && ((i += '#'), (i += e ? f : _e(f, !1, !1))), i
}
function pe(t) {
  try {
    return decodeURIComponent(t)
  } catch {
    return t.length > 3 ? t.substr(0, 3) + pe(t.substr(3)) : t
  }
}
var ae = /(%[0-9A-Za-z][0-9A-Za-z])+/g
function q(t) {
  return t.match(ae) ? t.replace(ae, e => pe(e)) : t
}
var C = class {
  constructor(e, n) {
    this.uri = e
    this.value = n
  }
}
function nt(t) {
  return Array.isArray(t)
}
var it,
  P = class t {
    constructor(e, n) {
      this[it] = 'ResourceMap'
      if (e instanceof t) (this.map = new Map(e.map)), (this.toKey = n ?? t.defaultToKey)
      else if (nt(e)) {
        ;(this.map = new Map()), (this.toKey = n ?? t.defaultToKey)
        for (let [i, s] of e) this.set(i, s)
      } else (this.map = new Map()), (this.toKey = e ?? t.defaultToKey)
    }
    static {
      this.defaultToKey = e => e.toString()
    }
    set(e, n) {
      return this.map.set(this.toKey(e), new C(e, n)), this
    }
    get(e) {
      return this.map.get(this.toKey(e))?.value
    }
    has(e) {
      return this.map.has(this.toKey(e))
    }
    get size() {
      return this.map.size
    }
    clear() {
      this.map.clear()
    }
    delete(e) {
      return this.map.delete(this.toKey(e))
    }
    forEach(e, n) {
      typeof n < 'u' && (e = e.bind(n))
      for (let [i, s] of this.map) e(s.value, s.uri, this)
    }
    *values() {
      for (let e of this.map.values()) yield e.value
    }
    *keys() {
      for (let e of this.map.values()) yield e.uri
    }
    *entries() {
      for (let e of this.map.values()) yield [e.uri, e.value]
    }
    *[((it = Symbol.toStringTag), Symbol.iterator)]() {
      for (let [, e] of this.map) yield [e.uri, e.value]
    }
  },
  st,
  xe = class {
    constructor(e, n) {
      this[st] = 'ResourceSet'
      !e || typeof e == 'function' ? (this._map = new P(e)) : ((this._map = new P(n)), e.forEach(this.add, this))
    }
    get size() {
      return this._map.size
    }
    add(e) {
      return this._map.set(e, e), this
    }
    clear() {
      this._map.clear()
    }
    delete(e) {
      return this._map.delete(e)
    }
    forEach(e, n) {
      this._map.forEach((i, s) => e.call(n, s, s, this))
    }
    has(e) {
      return this._map.has(e)
    }
    entries() {
      return this._map.entries()
    }
    keys() {
      return this._map.keys()
    }
    values() {
      return this._map.keys()
    }
    [((st = Symbol.toStringTag), Symbol.iterator)]() {
      return this.keys()
    }
  }
var rt,
  be = class {
    constructor() {
      this[rt] = 'LinkedMap'
      ;(this._map = new Map()), (this._head = void 0), (this._tail = void 0), (this._size = 0), (this._state = 0)
    }
    clear() {
      this._map.clear(), (this._head = void 0), (this._tail = void 0), (this._size = 0), this._state++
    }
    isEmpty() {
      return !this._head && !this._tail
    }
    get size() {
      return this._size
    }
    get first() {
      return this._head?.value
    }
    get last() {
      return this._tail?.value
    }
    has(e) {
      return this._map.has(e)
    }
    get(e, n = 0) {
      let i = this._map.get(e)
      if (i) return n !== 0 && this.touch(i, n), i.value
    }
    set(e, n, i = 0) {
      let s = this._map.get(e)
      if (s) (s.value = n), i !== 0 && this.touch(s, i)
      else {
        switch (((s = { key: e, value: n, next: void 0, previous: void 0 }), i)) {
          case 0:
            this.addItemLast(s)
            break
          case 1:
            this.addItemFirst(s)
            break
          case 2:
            this.addItemLast(s)
            break
          default:
            this.addItemLast(s)
            break
        }
        this._map.set(e, s), this._size++
      }
      return this
    }
    delete(e) {
      return !!this.remove(e)
    }
    remove(e) {
      let n = this._map.get(e)
      if (n) return this._map.delete(e), this.removeItem(n), this._size--, n.value
    }
    shift() {
      if (!this._head && !this._tail) return
      if (!this._head || !this._tail) throw new Error('Invalid list')
      let e = this._head
      return this._map.delete(e.key), this.removeItem(e), this._size--, e.value
    }
    forEach(e, n) {
      let i = this._state,
        s = this._head
      for (; s; ) {
        if ((n ? e.bind(n)(s.value, s.key, this) : e(s.value, s.key, this), this._state !== i))
          throw new Error('LinkedMap got modified during iteration.')
        s = s.next
      }
    }
    keys() {
      let e = this,
        n = this._state,
        i = this._head,
        s = {
          [Symbol.iterator]() {
            return s
          },
          next() {
            if (e._state !== n) throw new Error('LinkedMap got modified during iteration.')
            if (i) {
              let r = { value: i.key, done: !1 }
              return (i = i.next), r
            } else return { value: void 0, done: !0 }
          },
        }
      return s
    }
    values() {
      let e = this,
        n = this._state,
        i = this._head,
        s = {
          [Symbol.iterator]() {
            return s
          },
          next() {
            if (e._state !== n) throw new Error('LinkedMap got modified during iteration.')
            if (i) {
              let r = { value: i.value, done: !1 }
              return (i = i.next), r
            } else return { value: void 0, done: !0 }
          },
        }
      return s
    }
    entries() {
      let e = this,
        n = this._state,
        i = this._head,
        s = {
          [Symbol.iterator]() {
            return s
          },
          next() {
            if (e._state !== n) throw new Error('LinkedMap got modified during iteration.')
            if (i) {
              let r = { value: [i.key, i.value], done: !1 }
              return (i = i.next), r
            } else return { value: void 0, done: !0 }
          },
        }
      return s
    }
    [((rt = Symbol.toStringTag), Symbol.iterator)]() {
      return this.entries()
    }
    trimOld(e) {
      if (e >= this.size) return
      if (e === 0) {
        this.clear()
        return
      }
      let n = this._head,
        i = this.size
      for (; n && i > e; ) this._map.delete(n.key), (n = n.next), i--
      ;(this._head = n), (this._size = i), n && (n.previous = void 0), this._state++
    }
    addItemFirst(e) {
      if (!this._head && !this._tail) this._tail = e
      else if (this._head) (e.next = this._head), (this._head.previous = e)
      else throw new Error('Invalid list')
      ;(this._head = e), this._state++
    }
    addItemLast(e) {
      if (!this._head && !this._tail) this._head = e
      else if (this._tail) (e.previous = this._tail), (this._tail.next = e)
      else throw new Error('Invalid list')
      ;(this._tail = e), this._state++
    }
    removeItem(e) {
      if (e === this._head && e === this._tail) (this._head = void 0), (this._tail = void 0)
      else if (e === this._head) {
        if (!e.next) throw new Error('Invalid list')
        ;(e.next.previous = void 0), (this._head = e.next)
      } else if (e === this._tail) {
        if (!e.previous) throw new Error('Invalid list')
        ;(e.previous.next = void 0), (this._tail = e.previous)
      } else {
        let n = e.next,
          i = e.previous
        if (!n || !i) throw new Error('Invalid list')
        ;(n.previous = i), (i.next = n)
      }
      ;(e.next = void 0), (e.previous = void 0), this._state++
    }
    touch(e, n) {
      if (!this._head || !this._tail) throw new Error('Invalid list')
      if (!(n !== 1 && n !== 2)) {
        if (n === 1) {
          if (e === this._head) return
          let i = e.next,
            s = e.previous
          e === this._tail ? ((s.next = void 0), (this._tail = s)) : ((i.previous = s), (s.next = i)),
            (e.previous = void 0),
            (e.next = this._head),
            (this._head.previous = e),
            (this._head = e),
            this._state++
        } else if (n === 2) {
          if (e === this._tail) return
          let i = e.next,
            s = e.previous
          e === this._head ? ((i.previous = void 0), (this._head = i)) : ((i.previous = s), (s.next = i)),
            (e.next = void 0),
            (e.previous = this._tail),
            (this._tail.next = e),
            (this._tail = e),
            this._state++
        }
      }
    }
    toJSON() {
      let e = []
      return (
        this.forEach((n, i) => {
          e.push([i, n])
        }),
        e
      )
    }
    fromJSON(e) {
      this.clear()
      for (let [n, i] of e) this.set(n, i)
    }
  }
function ot(t) {
  let e = new Map()
  for (let n of t) e.set(n, (e.get(n) ?? 0) + 1)
  return e
}
var ee = class {
    constructor(e, n = -1 / 0) {
      this.maxSize = e
      this.minScore = n
      this.store = []
    }
    toArray() {
      return Array.from(this.store, e => e.value)
    }
    add(e, n) {
      if (e <= this.minScore) return
      let i = this.store.findIndex(s => s.score < e)
      for (
        this.store.splice(i >= 0 ? i : this.store.length, 0, { score: e, value: n });
        this.store.length > this.maxSize;

      )
        this.store.pop()
      this.store.length === this.maxSize && (this.minScore = this.store.at(-1)?.score ?? this.minScore)
    }
  },
  j = class t {
    constructor() {
      this.chunkCount = 0
      this.chunkOccurrences = new Map()
      this.documents = new P()
    }
    static termFrequencies(e) {
      return ot(t.splitTerms(e))
    }
    static *splitTerms(e) {
      let n = i => i.toLowerCase()
      for (let [i] of e.matchAll(/\b[\p{Letter}_][\p{Alphabetic}_]{2,}\b/gu)) {
        let s = new Set()
        s.add(n(i))
        let r = [],
          o = i.split(/(?<=[a-z])(?=[A-Z])/g)
        o.length > 1 && r.push(...o)
        let l = i.split('_')
        l.length > 1 && r.push(...l)
        for (let f of r) f.length > 2 && /[\p{Alphabetic}_]{3,}/gu.test(f) && s.add(n(f))
        yield* s
      }
    }
    addOrUpdate(e) {
      for (let { uri: n } of e) this.delete(n)
      for (let n of e) {
        let i = []
        for (let s of n.chunks) {
          let r = t.termFrequencies(s.text)
          for (let o of r.keys()) this.chunkOccurrences.set(o, (this.chunkOccurrences.get(o) ?? 0) + 1)
          i.push({ ...s, tf: r })
        }
        ;(this.chunkCount += i.length), this.documents.set(n.uri, { chunks: i })
      }
    }
    delete(e) {
      let n = this.documents.get(e)
      if (n) {
        this.documents.delete(e), (this.chunkCount -= n.chunks.length)
        for (let i of n.chunks)
          for (let s of i.tf.keys()) {
            let r = this.chunkOccurrences.get(s)
            if (typeof r == 'number') {
              let o = r - 1
              o <= 0 ? this.chunkOccurrences.delete(s) : this.chunkOccurrences.set(s, o)
            }
          }
      }
    }
    search(e, n = 1 / 0, i = -1 / 0) {
      let s = new ee(n, i),
        r = e.map(l => this.computeEmbeddings(l)),
        o = new Map()
      for (let [l, f] of this.documents)
        for (let c of f.chunks) {
          let a = -1 / 0
          for (let u of r) a = Math.max(a, this.score(c, u, o))
          a > 0 && s.add(a, c)
        }
      return s.toArray()
    }
    computeEmbeddings(e) {
      let n = t.termFrequencies(e)
      return this.computeTfidf(n)
    }
    score(e, n, i) {
      let s = 0
      for (let [r, o] of Object.entries(n)) {
        let l = e.tf.get(r)
        if (!l) continue
        let f = i.get(r)
        typeof f != 'number' && ((f = this.idf(r)), i.set(r, f))
        let c = l * f
        s += c * o
      }
      return s
    }
    idf(e) {
      let n = this.chunkOccurrences.get(e) ?? 0
      return n > 0 ? Math.log((this.chunkCount + 1) / n) : 0
    }
    computeTfidf(e) {
      let n = Object.create(null)
      for (let [i, s] of e) {
        let r = this.idf(i)
        r > 0 && (n[i] = s * r)
      }
      return n
    }
  }
function M(t, e) {
  if (!t) return t
  if (Array.isArray(t)) return t.map(n => M(n, e))
  if (typeof t == 'object') {
    let n = e(t)
    if (n) return n
    let i = {}
    for (let s in t) i[s] = M(t[s], e)
    return i
  }
  return t
}
function lt(t) {
  return M(t, e => {
    if (N.isUri(e)) return { $mid: 'uri', ...e }
  })
}
function ct(t) {
  return M(t, e => {
    if (e.$mid === 'uri') return N.from(e)
  })
}
var Ae = Ee.parentPort
if (!Ae) throw new Error('This module should only be used in a worker thread.')
new (class {
  constructor(e) {
    this._tfIdf = new j()
    e.on('message', ({ id: n, fn: i, args: s }) => {
      try {
        let r = this._tfIdf[i](...ct(s))
        e.postMessage({ id: n, res: lt(r) })
      } catch (r) {
        e.postMessage({ id: n, err: r })
      }
    })
  }
})(Ae)
//!!! DO NOT modify, this file was COPIED from 'microsoft/vscode'
