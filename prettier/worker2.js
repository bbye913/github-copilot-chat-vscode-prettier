'use strict'
var Fe = Object.create
var Q = Object.defineProperty
var Ce = Object.getOwnPropertyDescriptor
var Oe = Object.getOwnPropertyNames
var De = Object.getPrototypeOf,
  ke = Object.prototype.hasOwnProperty
var Le = (t, e) => () => e || t((e = { exports: {} }).exports, e), e.exports,
  Ue = (t, e) => {
    for (var n in e) Q(t, n, { get: e[n], enumerable: !0 })
  },
  Be = (t, e, n, r) => {
    if ((e && typeof e == 'object') || typeof e == 'function')
      for (let s of Oe(e))
        !ke.call(t, s) && s !== n && Q(t, s, { get: () => e[s], enumerable: !(r = Ce(e, s)) || r.enumerable })
    return t
  }
var ie = (t, e, n) => (
  (n = t != null ? Fe(De(t)) : {}), Be(e || !t || !t.__esModule ? Q(n, 'default', { value: t, enumerable: !0 }) : n, t)
)
var oe = Le((exports, module) => {
  var Module = Module !== void 0 ? Module : {},
    TreeSitter = (function () {
      var initPromise,
        document = typeof window == 'object' ? { currentScript: window.document.currentScript } : null
      class Parser {
        constructor() {
          this.initialize()
        }
        initialize() {
          throw new Error('cannot construct a Parser before calling `init()`')
        }
        static init(moduleOptions) {
          return (
            initPromise ||
            ((Module = Object.assign({}, Module, moduleOptions)),
            (initPromise = new Promise(resolveInitPromise => {
              var moduleOverrides = Object.assign({}, Module),
                arguments_ = [],
                thisProgram = './this.program',
                quit_ = (t, e) => {
                  throw e
                },
                ENVIRONMENT_IS_WEB = typeof window == 'object',
                ENVIRONMENT_IS_WORKER = typeof importScripts == 'function',
                ENVIRONMENT_IS_NODE =
                  typeof process == 'object' &&
                  typeof process.versions == 'object' &&
                  typeof process.versions.node == 'string',
                scriptDirectory = '',
                read_,
                readAsync,
                readBinary,
                setWindowTitle
              function locateFile(t) {
                return Module.locateFile ? Module.locateFile(t, scriptDirectory) : scriptDirectory + t
              }
              function logExceptionOnExit(t) {
                t instanceof ExitStatus || err('exiting due to exception: ' + t)
              }
              if (ENVIRONMENT_IS_NODE) {
                var fs = require('fs'),
                  nodePath = require('path')
                ;(scriptDirectory = ENVIRONMENT_IS_WORKER ? nodePath.dirname(scriptDirectory) + '/' : __dirname + '/'),
                  (read_ = (t, e) => (
                    (t = isFileURI(t) ? new URL(t) : nodePath.normalize(t)), fs.readFileSync(t, e ? void 0 : 'utf8')
                  )),
                  (readBinary = t => {
                    var e = read_(t, !0)
                    return e.buffer || (e = new Uint8Array(e)), e
                  }),
                  (readAsync = (t, e, n) => {
                    ;(t = isFileURI(t) ? new URL(t) : nodePath.normalize(t)),
                      fs.readFile(t, function (r, s) {
                        r ? n(r) : e(s.buffer)
                      })
                  }),
                  process.argv.length > 1 && (thisProgram = process.argv[1].replace(/\\/g, '/')),
                  (arguments_ = process.argv.slice(2)),
                  typeof module < 'u' && (module.exports = Module),
                  (quit_ = (t, e) => {
                    if (keepRuntimeAlive()) throw ((process.exitCode = t), e)
                    logExceptionOnExit(e), process.exit(t)
                  }),
                  (Module.inspect = function () {
                    return '[Emscripten Module object]'
                  })
              } else
                (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) &&
                  (ENVIRONMENT_IS_WORKER
                    ? (scriptDirectory = self.location.href)
                    : document !== void 0 && document.currentScript && (scriptDirectory = document.currentScript.src),
                  (scriptDirectory =
                    scriptDirectory.indexOf('blob:') !== 0
                      ? scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1)
                      : ''),
                  (read_ = t => {
                    var e = new XMLHttpRequest()
                    return e.open('GET', t, !1), e.send(null), e.responseText
                  }),
                  ENVIRONMENT_IS_WORKER &&
                    (readBinary = t => {
                      var e = new XMLHttpRequest()
                      return (
                        e.open('GET', t, !1), (e.responseType = 'arraybuffer'), e.send(null), new Uint8Array(e.response)
                      )
                    }),
                  (readAsync = (t, e, n) => {
                    var r = new XMLHttpRequest()
                    r.open('GET', t, !0),
                      (r.responseType = 'arraybuffer'),
                      (r.onload = () => {
                        r.status == 200 || (r.status == 0 && r.response) ? e(r.response) : n()
                      }),
                      (r.onerror = n),
                      r.send(null)
                  }),
                  (setWindowTitle = t => (document.title = t)))
              var out = Module.print || console.log.bind(console),
                err = Module.printErr || console.warn.bind(console)
              Object.assign(Module, moduleOverrides),
                (moduleOverrides = null),
                Module.arguments && (arguments_ = Module.arguments),
                Module.thisProgram && (thisProgram = Module.thisProgram),
                Module.quit && (quit_ = Module.quit)
              var STACK_ALIGN = 16,
                dynamicLibraries = Module.dynamicLibraries || [],
                wasmBinary
              Module.wasmBinary && (wasmBinary = Module.wasmBinary)
              var noExitRuntime = Module.noExitRuntime || !0,
                wasmMemory
              typeof WebAssembly != 'object' && abort('no native wasm support detected')
              var ABORT = !1,
                EXITSTATUS,
                UTF8Decoder = typeof TextDecoder < 'u' ? new TextDecoder('utf8') : void 0,
                buffer,
                HEAP8,
                HEAPU8,
                HEAP16,
                HEAPU16,
                HEAP32,
                HEAPU32,
                HEAPF32,
                HEAPF64
              function UTF8ArrayToString(t, e, n) {
                for (var r = e + n, s = e; t[s] && !(s >= r); ) ++s
                if (s - e > 16 && t.buffer && UTF8Decoder) return UTF8Decoder.decode(t.subarray(e, s))
                for (var a = ''; e < s; ) {
                  var i = t[e++]
                  if (128 & i) {
                    var o = 63 & t[e++]
                    if ((224 & i) != 192) {
                      var _ = 63 & t[e++]
                      if (
                        (i =
                          (240 & i) == 224
                            ? ((15 & i) << 12) | (o << 6) | _
                            : ((7 & i) << 18) | (o << 12) | (_ << 6) | (63 & t[e++])) < 65536
                      )
                        a += String.fromCharCode(i)
                      else {
                        var l = i - 65536
                        a += String.fromCharCode(55296 | (l >> 10), 56320 | (1023 & l))
                      }
                    } else a += String.fromCharCode(((31 & i) << 6) | o)
                  } else a += String.fromCharCode(i)
                }
                return a
              }
              function UTF8ToString(t, e) {
                return t ? UTF8ArrayToString(HEAPU8, t, e) : ''
              }
              function stringToUTF8Array(t, e, n, r) {
                if (!(r > 0)) return 0
                for (var s = n, a = n + r - 1, i = 0; i < t.length; ++i) {
                  var o = t.charCodeAt(i)
                  if (
                    (o >= 55296 && o <= 57343 && (o = (65536 + ((1023 & o) << 10)) | (1023 & t.charCodeAt(++i))),
                    o <= 127)
                  ) {
                    if (n >= a) break
                    e[n++] = o
                  } else if (o <= 2047) {
                    if (n + 1 >= a) break
                    ;(e[n++] = 192 | (o >> 6)), (e[n++] = 128 | (63 & o))
                  } else if (o <= 65535) {
                    if (n + 2 >= a) break
                    ;(e[n++] = 224 | (o >> 12)), (e[n++] = 128 | ((o >> 6) & 63)), (e[n++] = 128 | (63 & o))
                  } else {
                    if (n + 3 >= a) break
                    ;(e[n++] = 240 | (o >> 18)),
                      (e[n++] = 128 | ((o >> 12) & 63)),
                      (e[n++] = 128 | ((o >> 6) & 63)),
                      (e[n++] = 128 | (63 & o))
                  }
                }
                return (e[n] = 0), n - s
              }
              function stringToUTF8(t, e, n) {
                return stringToUTF8Array(t, HEAPU8, e, n)
              }
              function lengthBytesUTF8(t) {
                for (var e = 0, n = 0; n < t.length; ++n) {
                  var r = t.charCodeAt(n)
                  r <= 127 ? e++ : r <= 2047 ? (e += 2) : r >= 55296 && r <= 57343 ? ((e += 4), ++n) : (e += 3)
                }
                return e
              }
              function updateGlobalBufferAndViews(t) {
                ;(buffer = t),
                  (Module.HEAP8 = HEAP8 = new Int8Array(t)),
                  (Module.HEAP16 = HEAP16 = new Int16Array(t)),
                  (Module.HEAP32 = HEAP32 = new Int32Array(t)),
                  (Module.HEAPU8 = HEAPU8 = new Uint8Array(t)),
                  (Module.HEAPU16 = HEAPU16 = new Uint16Array(t)),
                  (Module.HEAPU32 = HEAPU32 = new Uint32Array(t)),
                  (Module.HEAPF32 = HEAPF32 = new Float32Array(t)),
                  (Module.HEAPF64 = HEAPF64 = new Float64Array(t))
              }
              var INITIAL_MEMORY = Module.INITIAL_MEMORY || 33554432
              ;(wasmMemory = Module.wasmMemory
                ? Module.wasmMemory
                : new WebAssembly.Memory({ initial: INITIAL_MEMORY / 65536, maximum: 32768 })),
                wasmMemory && (buffer = wasmMemory.buffer),
                (INITIAL_MEMORY = buffer.byteLength),
                updateGlobalBufferAndViews(buffer)
              var wasmTable = new WebAssembly.Table({ initial: 20, element: 'anyfunc' }),
                __ATPRERUN__ = [],
                __ATINIT__ = [],
                __ATMAIN__ = [],
                __ATPOSTRUN__ = [],
                __RELOC_FUNCS__ = [],
                runtimeInitialized = !1
              function keepRuntimeAlive() {
                return noExitRuntime
              }
              function preRun() {
                if (Module.preRun)
                  for (typeof Module.preRun == 'function' && (Module.preRun = [Module.preRun]); Module.preRun.length; )
                    addOnPreRun(Module.preRun.shift())
                callRuntimeCallbacks(__ATPRERUN__)
              }
              function initRuntime() {
                ;(runtimeInitialized = !0), callRuntimeCallbacks(__RELOC_FUNCS__), callRuntimeCallbacks(__ATINIT__)
              }
              function preMain() {
                callRuntimeCallbacks(__ATMAIN__)
              }
              function postRun() {
                if (Module.postRun)
                  for (
                    typeof Module.postRun == 'function' && (Module.postRun = [Module.postRun]);
                    Module.postRun.length;

                  )
                    addOnPostRun(Module.postRun.shift())
                callRuntimeCallbacks(__ATPOSTRUN__)
              }
              function addOnPreRun(t) {
                __ATPRERUN__.unshift(t)
              }
              function addOnInit(t) {
                __ATINIT__.unshift(t)
              }
              function addOnPostRun(t) {
                __ATPOSTRUN__.unshift(t)
              }
              var runDependencies = 0,
                runDependencyWatcher = null,
                dependenciesFulfilled = null
              function addRunDependency(t) {
                runDependencies++, Module.monitorRunDependencies && Module.monitorRunDependencies(runDependencies)
              }
              function removeRunDependency(t) {
                if (
                  (runDependencies--,
                  Module.monitorRunDependencies && Module.monitorRunDependencies(runDependencies),
                  runDependencies == 0 &&
                    (runDependencyWatcher !== null &&
                      (clearInterval(runDependencyWatcher), (runDependencyWatcher = null)),
                    dependenciesFulfilled))
                ) {
                  var e = dependenciesFulfilled
                  ;(dependenciesFulfilled = null), e()
                }
              }
              function abort(t) {
                throw (
                  (Module.onAbort && Module.onAbort(t),
                  err((t = 'Aborted(' + t + ')')),
                  (ABORT = !0),
                  (EXITSTATUS = 1),
                  (t += '. Build with -sASSERTIONS for more info.'),
                  new WebAssembly.RuntimeError(t))
                )
              }
              var dataURIPrefix = 'data:application/octet-stream;base64,',
                wasmBinaryFile,
                tempDouble,
                tempI64
              function isDataURI(t) {
                return t.startsWith(dataURIPrefix)
              }
              function isFileURI(t) {
                return t.startsWith('file://')
              }
              function getBinary(t) {
                try {
                  if (t == wasmBinaryFile && wasmBinary) return new Uint8Array(wasmBinary)
                  if (readBinary) return readBinary(t)
                  throw 'both async and sync fetching of the wasm failed'
                } catch (e) {
                  abort(e)
                }
              }
              function getBinaryPromise() {
                if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
                  if (typeof fetch == 'function' && !isFileURI(wasmBinaryFile))
                    return fetch(wasmBinaryFile, { credentials: 'same-origin' })
                      .then(function (t) {
                        if (!t.ok) throw "failed to load wasm binary file at '" + wasmBinaryFile + "'"
                        return t.arrayBuffer()
                      })
                      .catch(function () {
                        return getBinary(wasmBinaryFile)
                      })
                  if (readAsync)
                    return new Promise(function (t, e) {
                      readAsync(
                        wasmBinaryFile,
                        function (n) {
                          t(new Uint8Array(n))
                        },
                        e
                      )
                    })
                }
                return Promise.resolve().then(function () {
                  return getBinary(wasmBinaryFile)
                })
              }
              function createWasm() {
                var t = {
                  env: asmLibraryArg,
                  wasi_snapshot_preview1: asmLibraryArg,
                  'GOT.mem': new Proxy(asmLibraryArg, GOTHandler),
                  'GOT.func': new Proxy(asmLibraryArg, GOTHandler),
                }
                function e(s, a) {
                  var i = s.exports
                  i = relocateExports(i, 1024)
                  var o = getDylinkMetadata(a)
                  o.neededDynlibs && (dynamicLibraries = o.neededDynlibs.concat(dynamicLibraries)),
                    mergeLibSymbols(i, 'main'),
                    (Module.asm = i),
                    addOnInit(Module.asm.__wasm_call_ctors),
                    __RELOC_FUNCS__.push(Module.asm.__wasm_apply_data_relocs),
                    removeRunDependency('wasm-instantiate')
                }
                function n(s) {
                  e(s.instance, s.module)
                }
                function r(s) {
                  return getBinaryPromise()
                    .then(function (a) {
                      return WebAssembly.instantiate(a, t)
                    })
                    .then(function (a) {
                      return a
                    })
                    .then(s, function (a) {
                      err('failed to asynchronously prepare wasm: ' + a), abort(a)
                    })
                }
                if ((addRunDependency('wasm-instantiate'), Module.instantiateWasm))
                  try {
                    return Module.instantiateWasm(t, e)
                  } catch (s) {
                    return err('Module.instantiateWasm callback failed with error: ' + s), !1
                  }
                return (
                  wasmBinary ||
                  typeof WebAssembly.instantiateStreaming != 'function' ||
                  isDataURI(wasmBinaryFile) ||
                  isFileURI(wasmBinaryFile) ||
                  ENVIRONMENT_IS_NODE ||
                  typeof fetch != 'function'
                    ? r(n)
                    : fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (s) {
                        return WebAssembly.instantiateStreaming(s, t).then(n, function (a) {
                          return (
                            err('wasm streaming compile failed: ' + a),
                            err('falling back to ArrayBuffer instantiation'),
                            r(n)
                          )
                        })
                      }),
                  {}
                )
              }
              ;(wasmBinaryFile = 'tree-sitter.wasm'),
                isDataURI(wasmBinaryFile) || (wasmBinaryFile = locateFile(wasmBinaryFile))
              var ASM_CONSTS = {}
              function ExitStatus(t) {
                ;(this.name = 'ExitStatus'),
                  (this.message = 'Program terminated with exit(' + t + ')'),
                  (this.status = t)
              }
              var GOT = {},
                CurrentModuleWeakSymbols = new Set([]),
                GOTHandler = {
                  get: function (t, e) {
                    var n = GOT[e]
                    return (
                      n || (n = GOT[e] = new WebAssembly.Global({ value: 'i32', mutable: !0 })),
                      CurrentModuleWeakSymbols.has(e) || (n.required = !0),
                      n
                    )
                  },
                }
              function callRuntimeCallbacks(t) {
                for (; t.length > 0; ) t.shift()(Module)
              }
              function getDylinkMetadata(t) {
                var e = 0,
                  n = 0
                function r() {
                  for (var f = 0, u = 1; ; ) {
                    var w = t[e++]
                    if (((f += (127 & w) * u), (u *= 128), !(128 & w))) break
                  }
                  return f
                }
                function s() {
                  var f = r()
                  return UTF8ArrayToString(t, (e += f) - f, f)
                }
                function a(f, u) {
                  if (f) throw new Error(u)
                }
                var i = 'dylink.0'
                if (t instanceof WebAssembly.Module) {
                  var o = WebAssembly.Module.customSections(t, i)
                  o.length === 0 && ((i = 'dylink'), (o = WebAssembly.Module.customSections(t, i))),
                    a(o.length === 0, 'need dylink section'),
                    (n = (t = new Uint8Array(o[0])).length)
                } else {
                  a(
                    new Uint32Array(new Uint8Array(t.subarray(0, 24)).buffer)[0] != 1836278016,
                    'need to see wasm magic number'
                  ),
                    a(t[8] !== 0, 'need the dylink section to be first'),
                    (e = 9)
                  var _ = r()
                  ;(n = e + _), (i = s())
                }
                var l = { neededDynlibs: [], tlsExports: new Set(), weakImports: new Set() }
                if (i == 'dylink') {
                  ;(l.memorySize = r()), (l.memoryAlign = r()), (l.tableSize = r()), (l.tableAlign = r())
                  for (var d = r(), c = 0; c < d; ++c) {
                    var h = s()
                    l.neededDynlibs.push(h)
                  }
                } else
                  for (a(i !== 'dylink.0'); e < n; ) {
                    var g = t[e++],
                      b = r()
                    if (g === 1) (l.memorySize = r()), (l.memoryAlign = r()), (l.tableSize = r()), (l.tableAlign = r())
                    else if (g === 2) for (d = r(), c = 0; c < d; ++c) (h = s()), l.neededDynlibs.push(h)
                    else if (g === 3)
                      for (var m = r(); m--; ) {
                        var p = s()
                        256 & r() && l.tlsExports.add(p)
                      }
                    else if (g === 4) for (m = r(); m--; ) s(), (p = s()), (3 & r()) == 1 && l.weakImports.add(p)
                    else e += b
                  }
                return l
              }
              function getValue(t, e = 'i8') {
                switch ((e.endsWith('*') && (e = '*'), e)) {
                  case 'i1':
                  case 'i8':
                    return HEAP8[t >> 0]
                  case 'i16':
                    return HEAP16[t >> 1]
                  case 'i32':
                  case 'i64':
                    return HEAP32[t >> 2]
                  case 'float':
                    return HEAPF32[t >> 2]
                  case 'double':
                    return HEAPF64[t >> 3]
                  case '*':
                    return HEAPU32[t >> 2]
                  default:
                    abort('invalid type for getValue: ' + e)
                }
                return null
              }
              function asmjsMangle(t) {
                return t.indexOf('dynCall_') == 0 ||
                  ['stackAlloc', 'stackSave', 'stackRestore', 'getTempRet0', 'setTempRet0'].includes(t)
                  ? t
                  : '_' + t
              }
              function mergeLibSymbols(t, e) {
                for (var n in t)
                  if (t.hasOwnProperty(n)) {
                    asmLibraryArg.hasOwnProperty(n) || (asmLibraryArg[n] = t[n])
                    var r = asmjsMangle(n)
                    Module.hasOwnProperty(r) || (Module[r] = t[n]), n == '__main_argc_argv' && (Module._main = t[n])
                  }
              }
              var LDSO = { loadedLibsByName: {}, loadedLibsByHandle: {} }
              function dynCallLegacy(t, e, n) {
                var r = Module['dynCall_' + t]
                return n && n.length ? r.apply(null, [e].concat(n)) : r.call(null, e)
              }
              var wasmTableMirror = []
              function getWasmTableEntry(t) {
                var e = wasmTableMirror[t]
                return (
                  e ||
                    (t >= wasmTableMirror.length && (wasmTableMirror.length = t + 1),
                    (wasmTableMirror[t] = e = wasmTable.get(t))),
                  e
                )
              }
              function dynCall(t, e, n) {
                return t.includes('j') ? dynCallLegacy(t, e, n) : getWasmTableEntry(e).apply(null, n)
              }
              function createInvokeFunction(t) {
                return function () {
                  var e = stackSave()
                  try {
                    return dynCall(t, arguments[0], Array.prototype.slice.call(arguments, 1))
                  } catch (n) {
                    if ((stackRestore(e), n !== n + 0)) throw n
                    _setThrew(1, 0)
                  }
                }
              }
              var ___heap_base = 78144
              function zeroMemory(t, e) {
                return HEAPU8.fill(0, t, t + e), t
              }
              function getMemory(t) {
                if (runtimeInitialized) return zeroMemory(_malloc(t), t)
                var e = ___heap_base,
                  n = (e + t + 15) & -16
                return (___heap_base = n), (GOT.__heap_base.value = n), e
              }
              function isInternalSym(t) {
                return [
                  '__cpp_exception',
                  '__c_longjmp',
                  '__wasm_apply_data_relocs',
                  '__dso_handle',
                  '__tls_size',
                  '__tls_align',
                  '__set_stack_limits',
                  '_emscripten_tls_init',
                  '__wasm_init_tls',
                  '__wasm_call_ctors',
                  '__start_em_asm',
                  '__stop_em_asm',
                ].includes(t)
              }
              function uleb128Encode(t, e) {
                t < 128 ? e.push(t) : e.push(t % 128 | 128, t >> 7)
              }
              function sigToWasmTypes(t) {
                for (
                  var e = { i: 'i32', j: 'i32', f: 'f32', d: 'f64', p: 'i32' },
                    n = { parameters: [], results: t[0] == 'v' ? [] : [e[t[0]]] },
                    r = 1;
                  r < t.length;
                  ++r
                )
                  n.parameters.push(e[t[r]]), t[r] === 'j' && n.parameters.push('i32')
                return n
              }
              function generateFuncType(t, e) {
                var n = t.slice(0, 1),
                  r = t.slice(1),
                  s = { i: 127, p: 127, j: 126, f: 125, d: 124 }
                e.push(96), uleb128Encode(r.length, e)
                for (var a = 0; a < r.length; ++a) e.push(s[r[a]])
                n == 'v' ? e.push(0) : e.push(1, s[n])
              }
              function convertJsFunctionToWasm(t, e) {
                if (typeof WebAssembly.Function == 'function') return new WebAssembly.Function(sigToWasmTypes(e), t)
                var n = [1]
                generateFuncType(e, n)
                var r = [0, 97, 115, 109, 1, 0, 0, 0, 1]
                uleb128Encode(n.length, r),
                  r.push.apply(r, n),
                  r.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0)
                var s = new WebAssembly.Module(new Uint8Array(r))
                return new WebAssembly.Instance(s, { e: { f: t } }).exports.f
              }
              function updateTableMap(t, e) {
                if (functionsInTableMap)
                  for (var n = t; n < t + e; n++) {
                    var r = getWasmTableEntry(n)
                    r && functionsInTableMap.set(r, n)
                  }
              }
              var functionsInTableMap = void 0,
                freeTableIndexes = []
              function getEmptyTableSlot() {
                if (freeTableIndexes.length) return freeTableIndexes.pop()
                try {
                  wasmTable.grow(1)
                } catch (t) {
                  throw t instanceof RangeError ? 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.' : t
                }
                return wasmTable.length - 1
              }
              function setWasmTableEntry(t, e) {
                wasmTable.set(t, e), (wasmTableMirror[t] = wasmTable.get(t))
              }
              function addFunction(t, e) {
                if (
                  (functionsInTableMap || ((functionsInTableMap = new WeakMap()), updateTableMap(0, wasmTable.length)),
                  functionsInTableMap.has(t))
                )
                  return functionsInTableMap.get(t)
                var n = getEmptyTableSlot()
                try {
                  setWasmTableEntry(n, t)
                } catch (r) {
                  if (!(r instanceof TypeError)) throw r
                  setWasmTableEntry(n, convertJsFunctionToWasm(t, e))
                }
                return functionsInTableMap.set(t, n), n
              }
              function updateGOT(t, e) {
                for (var n in t)
                  if (!isInternalSym(n)) {
                    var r = t[n]
                    n.startsWith('orig$') && ((n = n.split('$')[1]), (e = !0)),
                      GOT[n] || (GOT[n] = new WebAssembly.Global({ value: 'i32', mutable: !0 })),
                      (e || GOT[n].value == 0) &&
                        (typeof r == 'function'
                          ? (GOT[n].value = addFunction(r))
                          : typeof r == 'number'
                          ? (GOT[n].value = r)
                          : err('unhandled export type for `' + n + '`: ' + typeof r))
                  }
              }
              function relocateExports(t, e, n) {
                var r = {}
                for (var s in t) {
                  var a = t[s]
                  typeof a == 'object' && (a = a.value), typeof a == 'number' && (a += e), (r[s] = a)
                }
                return updateGOT(r, n), r
              }
              function resolveGlobalSymbol(t, e) {
                var n
                return (
                  e && (n = asmLibraryArg['orig$' + t]),
                  n || ((n = asmLibraryArg[t]) && n.stub && (n = void 0)),
                  n || (n = Module[asmjsMangle(t)]),
                  !n && t.startsWith('invoke_') && (n = createInvokeFunction(t.split('_')[1])),
                  n
                )
              }
              function alignMemory(t, e) {
                return Math.ceil(t / e) * e
              }
              function loadWebAssemblyModule(binary, flags, handle) {
                var metadata = getDylinkMetadata(binary)
                function loadModule() {
                  var firstLoad = !handle || !HEAP8[(handle + 12) >> 0]
                  if (firstLoad) {
                    var memAlign = Math.pow(2, metadata.memoryAlign)
                    memAlign = Math.max(memAlign, STACK_ALIGN)
                    var memoryBase = metadata.memorySize
                        ? alignMemory(getMemory(metadata.memorySize + memAlign), memAlign)
                        : 0,
                      tableBase = metadata.tableSize ? wasmTable.length : 0
                    handle &&
                      ((HEAP8[(handle + 12) >> 0] = 1),
                      (HEAPU32[(handle + 16) >> 2] = memoryBase),
                      (HEAP32[(handle + 20) >> 2] = metadata.memorySize),
                      (HEAPU32[(handle + 24) >> 2] = tableBase),
                      (HEAP32[(handle + 28) >> 2] = metadata.tableSize))
                  } else (memoryBase = HEAPU32[(handle + 16) >> 2]), (tableBase = HEAPU32[(handle + 24) >> 2])
                  var tableGrowthNeeded = tableBase + metadata.tableSize - wasmTable.length,
                    moduleExports
                  function resolveSymbol(t) {
                    var e = resolveGlobalSymbol(t, !1)
                    return e || (e = moduleExports[t]), e
                  }
                  tableGrowthNeeded > 0 && wasmTable.grow(tableGrowthNeeded)
                  var proxyHandler = {
                      get: function (t, e) {
                        switch (e) {
                          case '__memory_base':
                            return memoryBase
                          case '__table_base':
                            return tableBase
                        }
                        if (e in asmLibraryArg) return asmLibraryArg[e]
                        var n
                        return (
                          e in t ||
                            (t[e] = function () {
                              return n || (n = resolveSymbol(e)), n.apply(null, arguments)
                            }),
                          t[e]
                        )
                      },
                    },
                    proxy = new Proxy({}, proxyHandler),
                    info = {
                      'GOT.mem': new Proxy({}, GOTHandler),
                      'GOT.func': new Proxy({}, GOTHandler),
                      env: proxy,
                      wasi_snapshot_preview1: proxy,
                    }
                  function postInstantiation(instance) {
                    function addEmAsm(addr, body) {
                      for (var args = [], arity = 0; arity < 16 && body.indexOf('$' + arity) != -1; arity++)
                        args.push('$' + arity)
                      args = args.join(',')
                      var func = '(' + args + ' ) => { ' + body + '};'
                      ASM_CONSTS[start] = eval(func)
                    }
                    if (
                      (updateTableMap(tableBase, metadata.tableSize),
                      (moduleExports = relocateExports(instance.exports, memoryBase)),
                      flags.allowUndefined || reportUndefinedSymbols(),
                      '__start_em_asm' in moduleExports)
                    )
                      for (
                        var start = moduleExports.__start_em_asm, stop = moduleExports.__stop_em_asm;
                        start < stop;

                      ) {
                        var jsString = UTF8ToString(start)
                        addEmAsm(start, jsString), (start = HEAPU8.indexOf(0, start) + 1)
                      }
                    var applyRelocs = moduleExports.__wasm_apply_data_relocs
                    applyRelocs && (runtimeInitialized ? applyRelocs() : __RELOC_FUNCS__.push(applyRelocs))
                    var init = moduleExports.__wasm_call_ctors
                    return init && (runtimeInitialized ? init() : __ATINIT__.push(init)), moduleExports
                  }
                  if (flags.loadAsync) {
                    if (binary instanceof WebAssembly.Module) {
                      var instance = new WebAssembly.Instance(binary, info)
                      return Promise.resolve(postInstantiation(instance))
                    }
                    return WebAssembly.instantiate(binary, info).then(function (t) {
                      return postInstantiation(t.instance)
                    })
                  }
                  var module = binary instanceof WebAssembly.Module ? binary : new WebAssembly.Module(binary),
                    instance = new WebAssembly.Instance(module, info)
                  return postInstantiation(instance)
                }
                return (
                  (CurrentModuleWeakSymbols = metadata.weakImports),
                  flags.loadAsync
                    ? metadata.neededDynlibs
                        .reduce(function (t, e) {
                          return t.then(function () {
                            return loadDynamicLibrary(e, flags)
                          })
                        }, Promise.resolve())
                        .then(function () {
                          return loadModule()
                        })
                    : (metadata.neededDynlibs.forEach(function (t) {
                        loadDynamicLibrary(t, flags)
                      }),
                      loadModule())
                )
              }
              function loadDynamicLibrary(t, e, n) {
                e = e || { global: !0, nodelete: !0 }
                var r = LDSO.loadedLibsByName[t]
                if (r)
                  return (
                    e.global && !r.global && ((r.global = !0), r.module !== 'loading' && mergeLibSymbols(r.module, t)),
                    e.nodelete && r.refcount !== 1 / 0 && (r.refcount = 1 / 0),
                    r.refcount++,
                    n && (LDSO.loadedLibsByHandle[n] = r),
                    !e.loadAsync || Promise.resolve(!0)
                  )
                function s(o) {
                  if (e.fs && e.fs.findObject(o)) {
                    var _ = e.fs.readFile(o, { encoding: 'binary' })
                    return _ instanceof Uint8Array || (_ = new Uint8Array(_)), e.loadAsync ? Promise.resolve(_) : _
                  }
                  if (((o = locateFile(o)), e.loadAsync))
                    return new Promise(function (l, d) {
                      readAsync(o, c => l(new Uint8Array(c)), d)
                    })
                  if (!readBinary)
                    throw new Error(o + ': file not found, and synchronous loading of external files is not available')
                  return readBinary(o)
                }
                function a() {
                  if (typeof preloadedWasm < 'u' && preloadedWasm[t]) {
                    var o = preloadedWasm[t]
                    return e.loadAsync ? Promise.resolve(o) : o
                  }
                  return e.loadAsync
                    ? s(t).then(function (_) {
                        return loadWebAssemblyModule(_, e, n)
                      })
                    : loadWebAssemblyModule(s(t), e, n)
                }
                function i(o) {
                  r.global && mergeLibSymbols(o, t), (r.module = o)
                }
                return (
                  (r = { refcount: e.nodelete ? 1 / 0 : 1, name: t, module: 'loading', global: e.global }),
                  (LDSO.loadedLibsByName[t] = r),
                  n && (LDSO.loadedLibsByHandle[n] = r),
                  e.loadAsync
                    ? a().then(function (o) {
                        return i(o), !0
                      })
                    : (i(a()), !0)
                )
              }
              function reportUndefinedSymbols() {
                for (var t in GOT)
                  if (GOT[t].value == 0) {
                    var e = resolveGlobalSymbol(t, !0)
                    if (!e && !GOT[t].required) continue
                    if (typeof e == 'function') GOT[t].value = addFunction(e, e.sig)
                    else {
                      if (typeof e != 'number') throw new Error('bad export type for `' + t + '`: ' + typeof e)
                      GOT[t].value = e
                    }
                  }
              }
              function preloadDylibs() {
                dynamicLibraries.length
                  ? (addRunDependency('preloadDylibs'),
                    dynamicLibraries
                      .reduce(function (t, e) {
                        return t.then(function () {
                          return loadDynamicLibrary(e, { loadAsync: !0, global: !0, nodelete: !0, allowUndefined: !0 })
                        })
                      }, Promise.resolve())
                      .then(function () {
                        reportUndefinedSymbols(), removeRunDependency('preloadDylibs')
                      }))
                  : reportUndefinedSymbols()
              }
              function setValue(t, e, n = 'i8') {
                switch ((n.endsWith('*') && (n = '*'), n)) {
                  case 'i1':
                  case 'i8':
                    HEAP8[t >> 0] = e
                    break
                  case 'i16':
                    HEAP16[t >> 1] = e
                    break
                  case 'i32':
                    HEAP32[t >> 2] = e
                    break
                  case 'i64':
                    ;(tempI64 = [
                      e >>> 0,
                      ((tempDouble = e),
                      +Math.abs(tempDouble) >= 1
                        ? tempDouble > 0
                          ? (0 | Math.min(+Math.floor(tempDouble / 4294967296), 4294967295)) >>> 0
                          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                        : 0),
                    ]),
                      (HEAP32[t >> 2] = tempI64[0]),
                      (HEAP32[(t + 4) >> 2] = tempI64[1])
                    break
                  case 'float':
                    HEAPF32[t >> 2] = e
                    break
                  case 'double':
                    HEAPF64[t >> 3] = e
                    break
                  case '*':
                    HEAPU32[t >> 2] = e
                    break
                  default:
                    abort('invalid type for setValue: ' + n)
                }
              }
              var ___memory_base = new WebAssembly.Global({ value: 'i32', mutable: !1 }, 1024),
                ___stack_pointer = new WebAssembly.Global({ value: 'i32', mutable: !0 }, 78144),
                ___table_base = new WebAssembly.Global({ value: 'i32', mutable: !1 }, 1),
                nowIsMonotonic = !0,
                _emscripten_get_now
              function __emscripten_get_now_is_monotonic() {
                return nowIsMonotonic
              }
              function _abort() {
                abort('')
              }
              function _emscripten_date_now() {
                return Date.now()
              }
              function _emscripten_memcpy_big(t, e, n) {
                HEAPU8.copyWithin(t, e, e + n)
              }
              function getHeapMax() {
                return 2147483648
              }
              function emscripten_realloc_buffer(t) {
                try {
                  return (
                    wasmMemory.grow((t - buffer.byteLength + 65535) >>> 16),
                    updateGlobalBufferAndViews(wasmMemory.buffer),
                    1
                  )
                } catch {}
              }
              function _emscripten_resize_heap(t) {
                var e = HEAPU8.length
                t >>>= 0
                var n = getHeapMax()
                if (t > n) return !1
                for (var r = 1; r <= 4; r *= 2) {
                  var s = e * (1 + 0.2 / r)
                  if (
                    ((s = Math.min(s, t + 100663296)),
                    emscripten_realloc_buffer(Math.min(n, (a = Math.max(t, s)) + (((i = 65536) - (a % i)) % i))))
                  )
                    return !0
                }
                var a, i
                return !1
              }
              ;(__emscripten_get_now_is_monotonic.sig = 'i'),
                (Module._abort = _abort),
                (_abort.sig = 'v'),
                (_emscripten_date_now.sig = 'd'),
                (_emscripten_get_now = ENVIRONMENT_IS_NODE
                  ? () => {
                      var t = process.hrtime()
                      return 1e3 * t[0] + t[1] / 1e6
                    }
                  : () => performance.now()),
                (_emscripten_get_now.sig = 'd'),
                (_emscripten_memcpy_big.sig = 'vppp'),
                (_emscripten_resize_heap.sig = 'ip')
              var SYSCALLS = {
                DEFAULT_POLLMASK: 5,
                calculateAt: function (t, e, n) {
                  if (PATH.isAbs(e)) return e
                  var r
                  if ((t === -100 ? (r = FS.cwd()) : (r = SYSCALLS.getStreamFromFD(t).path), e.length == 0)) {
                    if (!n) throw new FS.ErrnoError(44)
                    return r
                  }
                  return PATH.join2(r, e)
                },
                doStat: function (t, e, n) {
                  try {
                    var r = t(e)
                  } catch (o) {
                    if (o && o.node && PATH.normalize(e) !== PATH.normalize(FS.getPath(o.node))) return -54
                    throw o
                  }
                  ;(HEAP32[n >> 2] = r.dev),
                    (HEAP32[(n + 8) >> 2] = r.ino),
                    (HEAP32[(n + 12) >> 2] = r.mode),
                    (HEAPU32[(n + 16) >> 2] = r.nlink),
                    (HEAP32[(n + 20) >> 2] = r.uid),
                    (HEAP32[(n + 24) >> 2] = r.gid),
                    (HEAP32[(n + 28) >> 2] = r.rdev),
                    (tempI64 = [
                      r.size >>> 0,
                      ((tempDouble = r.size),
                      +Math.abs(tempDouble) >= 1
                        ? tempDouble > 0
                          ? (0 | Math.min(+Math.floor(tempDouble / 4294967296), 4294967295)) >>> 0
                          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                        : 0),
                    ]),
                    (HEAP32[(n + 40) >> 2] = tempI64[0]),
                    (HEAP32[(n + 44) >> 2] = tempI64[1]),
                    (HEAP32[(n + 48) >> 2] = 4096),
                    (HEAP32[(n + 52) >> 2] = r.blocks)
                  var s = r.atime.getTime(),
                    a = r.mtime.getTime(),
                    i = r.ctime.getTime()
                  return (
                    (tempI64 = [
                      Math.floor(s / 1e3) >>> 0,
                      ((tempDouble = Math.floor(s / 1e3)),
                      +Math.abs(tempDouble) >= 1
                        ? tempDouble > 0
                          ? (0 | Math.min(+Math.floor(tempDouble / 4294967296), 4294967295)) >>> 0
                          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                        : 0),
                    ]),
                    (HEAP32[(n + 56) >> 2] = tempI64[0]),
                    (HEAP32[(n + 60) >> 2] = tempI64[1]),
                    (HEAPU32[(n + 64) >> 2] = (s % 1e3) * 1e3),
                    (tempI64 = [
                      Math.floor(a / 1e3) >>> 0,
                      ((tempDouble = Math.floor(a / 1e3)),
                      +Math.abs(tempDouble) >= 1
                        ? tempDouble > 0
                          ? (0 | Math.min(+Math.floor(tempDouble / 4294967296), 4294967295)) >>> 0
                          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                        : 0),
                    ]),
                    (HEAP32[(n + 72) >> 2] = tempI64[0]),
                    (HEAP32[(n + 76) >> 2] = tempI64[1]),
                    (HEAPU32[(n + 80) >> 2] = (a % 1e3) * 1e3),
                    (tempI64 = [
                      Math.floor(i / 1e3) >>> 0,
                      ((tempDouble = Math.floor(i / 1e3)),
                      +Math.abs(tempDouble) >= 1
                        ? tempDouble > 0
                          ? (0 | Math.min(+Math.floor(tempDouble / 4294967296), 4294967295)) >>> 0
                          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                        : 0),
                    ]),
                    (HEAP32[(n + 88) >> 2] = tempI64[0]),
                    (HEAP32[(n + 92) >> 2] = tempI64[1]),
                    (HEAPU32[(n + 96) >> 2] = (i % 1e3) * 1e3),
                    (tempI64 = [
                      r.ino >>> 0,
                      ((tempDouble = r.ino),
                      +Math.abs(tempDouble) >= 1
                        ? tempDouble > 0
                          ? (0 | Math.min(+Math.floor(tempDouble / 4294967296), 4294967295)) >>> 0
                          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                        : 0),
                    ]),
                    (HEAP32[(n + 104) >> 2] = tempI64[0]),
                    (HEAP32[(n + 108) >> 2] = tempI64[1]),
                    0
                  )
                },
                doMsync: function (t, e, n, r, s) {
                  if (!FS.isFile(e.node.mode)) throw new FS.ErrnoError(43)
                  if (2 & r) return 0
                  var a = HEAPU8.slice(t, t + n)
                  FS.msync(e, a, s, n, r)
                },
                varargs: void 0,
                get: function () {
                  return (SYSCALLS.varargs += 4), HEAP32[(SYSCALLS.varargs - 4) >> 2]
                },
                getStr: function (t) {
                  return UTF8ToString(t)
                },
                getStreamFromFD: function (t) {
                  var e = FS.getStream(t)
                  if (!e) throw new FS.ErrnoError(8)
                  return e
                },
              }
              function _proc_exit(t) {
                ;(EXITSTATUS = t),
                  keepRuntimeAlive() || (Module.onExit && Module.onExit(t), (ABORT = !0)),
                  quit_(t, new ExitStatus(t))
              }
              function exitJS(t, e) {
                ;(EXITSTATUS = t), _proc_exit(t)
              }
              _proc_exit.sig = 'vi'
              var _exit = exitJS
              function _fd_close(t) {
                try {
                  var e = SYSCALLS.getStreamFromFD(t)
                  return FS.close(e), 0
                } catch (n) {
                  if (typeof FS > 'u' || !(n instanceof FS.ErrnoError)) throw n
                  return n.errno
                }
              }
              function convertI32PairToI53Checked(t, e) {
                return (e + 2097152) >>> 0 < 4194305 - !!t ? (t >>> 0) + 4294967296 * e : NaN
              }
              function _fd_seek(t, e, n, r, s) {
                try {
                  var a = convertI32PairToI53Checked(e, n)
                  if (isNaN(a)) return 61
                  var i = SYSCALLS.getStreamFromFD(t)
                  return (
                    FS.llseek(i, a, r),
                    (tempI64 = [
                      i.position >>> 0,
                      ((tempDouble = i.position),
                      +Math.abs(tempDouble) >= 1
                        ? tempDouble > 0
                          ? (0 | Math.min(+Math.floor(tempDouble / 4294967296), 4294967295)) >>> 0
                          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                        : 0),
                    ]),
                    (HEAP32[s >> 2] = tempI64[0]),
                    (HEAP32[(s + 4) >> 2] = tempI64[1]),
                    i.getdents && a === 0 && r === 0 && (i.getdents = null),
                    0
                  )
                } catch (o) {
                  if (typeof FS > 'u' || !(o instanceof FS.ErrnoError)) throw o
                  return o.errno
                }
              }
              function doWritev(t, e, n, r) {
                for (var s = 0, a = 0; a < n; a++) {
                  var i = HEAPU32[e >> 2],
                    o = HEAPU32[(e + 4) >> 2]
                  e += 8
                  var _ = FS.write(t, HEAP8, i, o, r)
                  if (_ < 0) return -1
                  ;(s += _), r !== void 0 && (r += _)
                }
                return s
              }
              function _fd_write(t, e, n, r) {
                try {
                  var s = doWritev(SYSCALLS.getStreamFromFD(t), e, n)
                  return (HEAPU32[r >> 2] = s), 0
                } catch (a) {
                  if (typeof FS > 'u' || !(a instanceof FS.ErrnoError)) throw a
                  return a.errno
                }
              }
              function _tree_sitter_log_callback(t, e) {
                if (currentLogCallback) {
                  let n = UTF8ToString(e)
                  currentLogCallback(n, t !== 0)
                }
              }
              function _tree_sitter_parse_callback(t, e, n, r, s) {
                var a = currentParseCallback(e, { row: n, column: r })
                typeof a == 'string'
                  ? (setValue(s, a.length, 'i32'), stringToUTF16(a, t, 10240))
                  : setValue(s, 0, 'i32')
              }
              function handleException(t) {
                if (t instanceof ExitStatus || t == 'unwind') return EXITSTATUS
                quit_(1, t)
              }
              function allocateUTF8OnStack(t) {
                var e = lengthBytesUTF8(t) + 1,
                  n = stackAlloc(e)
                return stringToUTF8Array(t, HEAP8, n, e), n
              }
              function stringToUTF16(t, e, n) {
                if ((n === void 0 && (n = 2147483647), n < 2)) return 0
                for (var r = e, s = (n -= 2) < 2 * t.length ? n / 2 : t.length, a = 0; a < s; ++a) {
                  var i = t.charCodeAt(a)
                  ;(HEAP16[e >> 1] = i), (e += 2)
                }
                return (HEAP16[e >> 1] = 0), e - r
              }
              function AsciiToString(t) {
                for (var e = ''; ; ) {
                  var n = HEAPU8[t++ >> 0]
                  if (!n) return e
                  e += String.fromCharCode(n)
                }
              }
              ;(_exit.sig = 'vi'), (_fd_close.sig = 'ii'), (_fd_seek.sig = 'iijip'), (_fd_write.sig = 'iippp')
              var asmLibraryArg = {
                  __heap_base: ___heap_base,
                  __indirect_function_table: wasmTable,
                  __memory_base: ___memory_base,
                  __stack_pointer: ___stack_pointer,
                  __table_base: ___table_base,
                  _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
                  abort: _abort,
                  emscripten_get_now: _emscripten_get_now,
                  emscripten_memcpy_big: _emscripten_memcpy_big,
                  emscripten_resize_heap: _emscripten_resize_heap,
                  exit: _exit,
                  fd_close: _fd_close,
                  fd_seek: _fd_seek,
                  fd_write: _fd_write,
                  memory: wasmMemory,
                  tree_sitter_log_callback: _tree_sitter_log_callback,
                  tree_sitter_parse_callback: _tree_sitter_parse_callback,
                },
                asm = createWasm(),
                ___wasm_call_ctors = (Module.___wasm_call_ctors = function () {
                  return (___wasm_call_ctors = Module.___wasm_call_ctors = Module.asm.__wasm_call_ctors).apply(
                    null,
                    arguments
                  )
                }),
                ___wasm_apply_data_relocs = (Module.___wasm_apply_data_relocs = function () {
                  return (___wasm_apply_data_relocs = Module.___wasm_apply_data_relocs =
                    Module.asm.__wasm_apply_data_relocs).apply(null, arguments)
                }),
                _malloc = (Module._malloc = function () {
                  return (_malloc = Module._malloc = Module.asm.malloc).apply(null, arguments)
                }),
                _calloc = (Module._calloc = function () {
                  return (_calloc = Module._calloc = Module.asm.calloc).apply(null, arguments)
                }),
                _realloc = (Module._realloc = function () {
                  return (_realloc = Module._realloc = Module.asm.realloc).apply(null, arguments)
                }),
                _free = (Module._free = function () {
                  return (_free = Module._free = Module.asm.free).apply(null, arguments)
                }),
                _ts_language_symbol_count = (Module._ts_language_symbol_count = function () {
                  return (_ts_language_symbol_count = Module._ts_language_symbol_count =
                    Module.asm.ts_language_symbol_count).apply(null, arguments)
                }),
                _ts_language_version = (Module._ts_language_version = function () {
                  return (_ts_language_version = Module._ts_language_version = Module.asm.ts_language_version).apply(
                    null,
                    arguments
                  )
                }),
                _ts_language_field_count = (Module._ts_language_field_count = function () {
                  return (_ts_language_field_count = Module._ts_language_field_count =
                    Module.asm.ts_language_field_count).apply(null, arguments)
                }),
                _ts_language_symbol_name = (Module._ts_language_symbol_name = function () {
                  return (_ts_language_symbol_name = Module._ts_language_symbol_name =
                    Module.asm.ts_language_symbol_name).apply(null, arguments)
                }),
                _ts_language_symbol_for_name = (Module._ts_language_symbol_for_name = function () {
                  return (_ts_language_symbol_for_name = Module._ts_language_symbol_for_name =
                    Module.asm.ts_language_symbol_for_name).apply(null, arguments)
                }),
                _ts_language_symbol_type = (Module._ts_language_symbol_type = function () {
                  return (_ts_language_symbol_type = Module._ts_language_symbol_type =
                    Module.asm.ts_language_symbol_type).apply(null, arguments)
                }),
                _ts_language_field_name_for_id = (Module._ts_language_field_name_for_id = function () {
                  return (_ts_language_field_name_for_id = Module._ts_language_field_name_for_id =
                    Module.asm.ts_language_field_name_for_id).apply(null, arguments)
                }),
                _memset = (Module._memset = function () {
                  return (_memset = Module._memset = Module.asm.memset).apply(null, arguments)
                }),
                _memcpy = (Module._memcpy = function () {
                  return (_memcpy = Module._memcpy = Module.asm.memcpy).apply(null, arguments)
                }),
                _ts_parser_delete = (Module._ts_parser_delete = function () {
                  return (_ts_parser_delete = Module._ts_parser_delete = Module.asm.ts_parser_delete).apply(
                    null,
                    arguments
                  )
                }),
                _ts_parser_reset = (Module._ts_parser_reset = function () {
                  return (_ts_parser_reset = Module._ts_parser_reset = Module.asm.ts_parser_reset).apply(
                    null,
                    arguments
                  )
                }),
                _ts_parser_set_language = (Module._ts_parser_set_language = function () {
                  return (_ts_parser_set_language = Module._ts_parser_set_language =
                    Module.asm.ts_parser_set_language).apply(null, arguments)
                }),
                _ts_parser_timeout_micros = (Module._ts_parser_timeout_micros = function () {
                  return (_ts_parser_timeout_micros = Module._ts_parser_timeout_micros =
                    Module.asm.ts_parser_timeout_micros).apply(null, arguments)
                }),
                _ts_parser_set_timeout_micros = (Module._ts_parser_set_timeout_micros = function () {
                  return (_ts_parser_set_timeout_micros = Module._ts_parser_set_timeout_micros =
                    Module.asm.ts_parser_set_timeout_micros).apply(null, arguments)
                }),
                _memmove = (Module._memmove = function () {
                  return (_memmove = Module._memmove = Module.asm.memmove).apply(null, arguments)
                }),
                _memcmp = (Module._memcmp = function () {
                  return (_memcmp = Module._memcmp = Module.asm.memcmp).apply(null, arguments)
                }),
                _ts_query_new = (Module._ts_query_new = function () {
                  return (_ts_query_new = Module._ts_query_new = Module.asm.ts_query_new).apply(null, arguments)
                }),
                _ts_query_delete = (Module._ts_query_delete = function () {
                  return (_ts_query_delete = Module._ts_query_delete = Module.asm.ts_query_delete).apply(
                    null,
                    arguments
                  )
                }),
                _iswspace = (Module._iswspace = function () {
                  return (_iswspace = Module._iswspace = Module.asm.iswspace).apply(null, arguments)
                }),
                _iswalnum = (Module._iswalnum = function () {
                  return (_iswalnum = Module._iswalnum = Module.asm.iswalnum).apply(null, arguments)
                }),
                _ts_query_pattern_count = (Module._ts_query_pattern_count = function () {
                  return (_ts_query_pattern_count = Module._ts_query_pattern_count =
                    Module.asm.ts_query_pattern_count).apply(null, arguments)
                }),
                _ts_query_capture_count = (Module._ts_query_capture_count = function () {
                  return (_ts_query_capture_count = Module._ts_query_capture_count =
                    Module.asm.ts_query_capture_count).apply(null, arguments)
                }),
                _ts_query_string_count = (Module._ts_query_string_count = function () {
                  return (_ts_query_string_count = Module._ts_query_string_count =
                    Module.asm.ts_query_string_count).apply(null, arguments)
                }),
                _ts_query_capture_name_for_id = (Module._ts_query_capture_name_for_id = function () {
                  return (_ts_query_capture_name_for_id = Module._ts_query_capture_name_for_id =
                    Module.asm.ts_query_capture_name_for_id).apply(null, arguments)
                }),
                _ts_query_string_value_for_id = (Module._ts_query_string_value_for_id = function () {
                  return (_ts_query_string_value_for_id = Module._ts_query_string_value_for_id =
                    Module.asm.ts_query_string_value_for_id).apply(null, arguments)
                }),
                _ts_query_predicates_for_pattern = (Module._ts_query_predicates_for_pattern = function () {
                  return (_ts_query_predicates_for_pattern = Module._ts_query_predicates_for_pattern =
                    Module.asm.ts_query_predicates_for_pattern).apply(null, arguments)
                }),
                _ts_tree_copy = (Module._ts_tree_copy = function () {
                  return (_ts_tree_copy = Module._ts_tree_copy = Module.asm.ts_tree_copy).apply(null, arguments)
                }),
                _ts_tree_delete = (Module._ts_tree_delete = function () {
                  return (_ts_tree_delete = Module._ts_tree_delete = Module.asm.ts_tree_delete).apply(null, arguments)
                }),
                _ts_init = (Module._ts_init = function () {
                  return (_ts_init = Module._ts_init = Module.asm.ts_init).apply(null, arguments)
                }),
                _ts_parser_new_wasm = (Module._ts_parser_new_wasm = function () {
                  return (_ts_parser_new_wasm = Module._ts_parser_new_wasm = Module.asm.ts_parser_new_wasm).apply(
                    null,
                    arguments
                  )
                }),
                _ts_parser_enable_logger_wasm = (Module._ts_parser_enable_logger_wasm = function () {
                  return (_ts_parser_enable_logger_wasm = Module._ts_parser_enable_logger_wasm =
                    Module.asm.ts_parser_enable_logger_wasm).apply(null, arguments)
                }),
                _ts_parser_parse_wasm = (Module._ts_parser_parse_wasm = function () {
                  return (_ts_parser_parse_wasm = Module._ts_parser_parse_wasm = Module.asm.ts_parser_parse_wasm).apply(
                    null,
                    arguments
                  )
                }),
                _ts_language_type_is_named_wasm = (Module._ts_language_type_is_named_wasm = function () {
                  return (_ts_language_type_is_named_wasm = Module._ts_language_type_is_named_wasm =
                    Module.asm.ts_language_type_is_named_wasm).apply(null, arguments)
                }),
                _ts_language_type_is_visible_wasm = (Module._ts_language_type_is_visible_wasm = function () {
                  return (_ts_language_type_is_visible_wasm = Module._ts_language_type_is_visible_wasm =
                    Module.asm.ts_language_type_is_visible_wasm).apply(null, arguments)
                }),
                _ts_tree_root_node_wasm = (Module._ts_tree_root_node_wasm = function () {
                  return (_ts_tree_root_node_wasm = Module._ts_tree_root_node_wasm =
                    Module.asm.ts_tree_root_node_wasm).apply(null, arguments)
                }),
                _ts_tree_edit_wasm = (Module._ts_tree_edit_wasm = function () {
                  return (_ts_tree_edit_wasm = Module._ts_tree_edit_wasm = Module.asm.ts_tree_edit_wasm).apply(
                    null,
                    arguments
                  )
                }),
                _ts_tree_get_changed_ranges_wasm = (Module._ts_tree_get_changed_ranges_wasm = function () {
                  return (_ts_tree_get_changed_ranges_wasm = Module._ts_tree_get_changed_ranges_wasm =
                    Module.asm.ts_tree_get_changed_ranges_wasm).apply(null, arguments)
                }),
                _ts_tree_cursor_new_wasm = (Module._ts_tree_cursor_new_wasm = function () {
                  return (_ts_tree_cursor_new_wasm = Module._ts_tree_cursor_new_wasm =
                    Module.asm.ts_tree_cursor_new_wasm).apply(null, arguments)
                }),
                _ts_tree_cursor_delete_wasm = (Module._ts_tree_cursor_delete_wasm = function () {
                  return (_ts_tree_cursor_delete_wasm = Module._ts_tree_cursor_delete_wasm =
                    Module.asm.ts_tree_cursor_delete_wasm).apply(null, arguments)
                }),
                _ts_tree_cursor_reset_wasm = (Module._ts_tree_cursor_reset_wasm = function () {
                  return (_ts_tree_cursor_reset_wasm = Module._ts_tree_cursor_reset_wasm =
                    Module.asm.ts_tree_cursor_reset_wasm).apply(null, arguments)
                }),
                _ts_tree_cursor_goto_first_child_wasm = (Module._ts_tree_cursor_goto_first_child_wasm = function () {
                  return (_ts_tree_cursor_goto_first_child_wasm = Module._ts_tree_cursor_goto_first_child_wasm =
                    Module.asm.ts_tree_cursor_goto_first_child_wasm).apply(null, arguments)
                }),
                _ts_tree_cursor_goto_next_sibling_wasm = (Module._ts_tree_cursor_goto_next_sibling_wasm = function () {
                  return (_ts_tree_cursor_goto_next_sibling_wasm = Module._ts_tree_cursor_goto_next_sibling_wasm =
                    Module.asm.ts_tree_cursor_goto_next_sibling_wasm).apply(null, arguments)
                }),
                _ts_tree_cursor_goto_parent_wasm = (Module._ts_tree_cursor_goto_parent_wasm = function () {
                  return (_ts_tree_cursor_goto_parent_wasm = Module._ts_tree_cursor_goto_parent_wasm =
                    Module.asm.ts_tree_cursor_goto_parent_wasm).apply(null, arguments)
                }),
                _ts_tree_cursor_current_node_type_id_wasm = (Module._ts_tree_cursor_current_node_type_id_wasm =
                  function () {
                    return (_ts_tree_cursor_current_node_type_id_wasm =
                      Module._ts_tree_cursor_current_node_type_id_wasm =
                        Module.asm.ts_tree_cursor_current_node_type_id_wasm).apply(null, arguments)
                  }),
                _ts_tree_cursor_current_node_is_named_wasm = (Module._ts_tree_cursor_current_node_is_named_wasm =
                  function () {
                    return (_ts_tree_cursor_current_node_is_named_wasm =
                      Module._ts_tree_cursor_current_node_is_named_wasm =
                        Module.asm.ts_tree_cursor_current_node_is_named_wasm).apply(null, arguments)
                  }),
                _ts_tree_cursor_current_node_is_missing_wasm = (Module._ts_tree_cursor_current_node_is_missing_wasm =
                  function () {
                    return (_ts_tree_cursor_current_node_is_missing_wasm =
                      Module._ts_tree_cursor_current_node_is_missing_wasm =
                        Module.asm.ts_tree_cursor_current_node_is_missing_wasm).apply(null, arguments)
                  }),
                _ts_tree_cursor_current_node_id_wasm = (Module._ts_tree_cursor_current_node_id_wasm = function () {
                  return (_ts_tree_cursor_current_node_id_wasm = Module._ts_tree_cursor_current_node_id_wasm =
                    Module.asm.ts_tree_cursor_current_node_id_wasm).apply(null, arguments)
                }),
                _ts_tree_cursor_start_position_wasm = (Module._ts_tree_cursor_start_position_wasm = function () {
                  return (_ts_tree_cursor_start_position_wasm = Module._ts_tree_cursor_start_position_wasm =
                    Module.asm.ts_tree_cursor_start_position_wasm).apply(null, arguments)
                }),
                _ts_tree_cursor_end_position_wasm = (Module._ts_tree_cursor_end_position_wasm = function () {
                  return (_ts_tree_cursor_end_position_wasm = Module._ts_tree_cursor_end_position_wasm =
                    Module.asm.ts_tree_cursor_end_position_wasm).apply(null, arguments)
                }),
                _ts_tree_cursor_start_index_wasm = (Module._ts_tree_cursor_start_index_wasm = function () {
                  return (_ts_tree_cursor_start_index_wasm = Module._ts_tree_cursor_start_index_wasm =
                    Module.asm.ts_tree_cursor_start_index_wasm).apply(null, arguments)
                }),
                _ts_tree_cursor_end_index_wasm = (Module._ts_tree_cursor_end_index_wasm = function () {
                  return (_ts_tree_cursor_end_index_wasm = Module._ts_tree_cursor_end_index_wasm =
                    Module.asm.ts_tree_cursor_end_index_wasm).apply(null, arguments)
                }),
                _ts_tree_cursor_current_field_id_wasm = (Module._ts_tree_cursor_current_field_id_wasm = function () {
                  return (_ts_tree_cursor_current_field_id_wasm = Module._ts_tree_cursor_current_field_id_wasm =
                    Module.asm.ts_tree_cursor_current_field_id_wasm).apply(null, arguments)
                }),
                _ts_tree_cursor_current_node_wasm = (Module._ts_tree_cursor_current_node_wasm = function () {
                  return (_ts_tree_cursor_current_node_wasm = Module._ts_tree_cursor_current_node_wasm =
                    Module.asm.ts_tree_cursor_current_node_wasm).apply(null, arguments)
                }),
                _ts_node_symbol_wasm = (Module._ts_node_symbol_wasm = function () {
                  return (_ts_node_symbol_wasm = Module._ts_node_symbol_wasm = Module.asm.ts_node_symbol_wasm).apply(
                    null,
                    arguments
                  )
                }),
                _ts_node_child_count_wasm = (Module._ts_node_child_count_wasm = function () {
                  return (_ts_node_child_count_wasm = Module._ts_node_child_count_wasm =
                    Module.asm.ts_node_child_count_wasm).apply(null, arguments)
                }),
                _ts_node_named_child_count_wasm = (Module._ts_node_named_child_count_wasm = function () {
                  return (_ts_node_named_child_count_wasm = Module._ts_node_named_child_count_wasm =
                    Module.asm.ts_node_named_child_count_wasm).apply(null, arguments)
                }),
                _ts_node_child_wasm = (Module._ts_node_child_wasm = function () {
                  return (_ts_node_child_wasm = Module._ts_node_child_wasm = Module.asm.ts_node_child_wasm).apply(
                    null,
                    arguments
                  )
                }),
                _ts_node_named_child_wasm = (Module._ts_node_named_child_wasm = function () {
                  return (_ts_node_named_child_wasm = Module._ts_node_named_child_wasm =
                    Module.asm.ts_node_named_child_wasm).apply(null, arguments)
                }),
                _ts_node_child_by_field_id_wasm = (Module._ts_node_child_by_field_id_wasm = function () {
                  return (_ts_node_child_by_field_id_wasm = Module._ts_node_child_by_field_id_wasm =
                    Module.asm.ts_node_child_by_field_id_wasm).apply(null, arguments)
                }),
                _ts_node_next_sibling_wasm = (Module._ts_node_next_sibling_wasm = function () {
                  return (_ts_node_next_sibling_wasm = Module._ts_node_next_sibling_wasm =
                    Module.asm.ts_node_next_sibling_wasm).apply(null, arguments)
                }),
                _ts_node_prev_sibling_wasm = (Module._ts_node_prev_sibling_wasm = function () {
                  return (_ts_node_prev_sibling_wasm = Module._ts_node_prev_sibling_wasm =
                    Module.asm.ts_node_prev_sibling_wasm).apply(null, arguments)
                }),
                _ts_node_next_named_sibling_wasm = (Module._ts_node_next_named_sibling_wasm = function () {
                  return (_ts_node_next_named_sibling_wasm = Module._ts_node_next_named_sibling_wasm =
                    Module.asm.ts_node_next_named_sibling_wasm).apply(null, arguments)
                }),
                _ts_node_prev_named_sibling_wasm = (Module._ts_node_prev_named_sibling_wasm = function () {
                  return (_ts_node_prev_named_sibling_wasm = Module._ts_node_prev_named_sibling_wasm =
                    Module.asm.ts_node_prev_named_sibling_wasm).apply(null, arguments)
                }),
                _ts_node_parent_wasm = (Module._ts_node_parent_wasm = function () {
                  return (_ts_node_parent_wasm = Module._ts_node_parent_wasm = Module.asm.ts_node_parent_wasm).apply(
                    null,
                    arguments
                  )
                }),
                _ts_node_descendant_for_index_wasm = (Module._ts_node_descendant_for_index_wasm = function () {
                  return (_ts_node_descendant_for_index_wasm = Module._ts_node_descendant_for_index_wasm =
                    Module.asm.ts_node_descendant_for_index_wasm).apply(null, arguments)
                }),
                _ts_node_named_descendant_for_index_wasm = (Module._ts_node_named_descendant_for_index_wasm =
                  function () {
                    return (_ts_node_named_descendant_for_index_wasm = Module._ts_node_named_descendant_for_index_wasm =
                      Module.asm.ts_node_named_descendant_for_index_wasm).apply(null, arguments)
                  }),
                _ts_node_descendant_for_position_wasm = (Module._ts_node_descendant_for_position_wasm = function () {
                  return (_ts_node_descendant_for_position_wasm = Module._ts_node_descendant_for_position_wasm =
                    Module.asm.ts_node_descendant_for_position_wasm).apply(null, arguments)
                }),
                _ts_node_named_descendant_for_position_wasm = (Module._ts_node_named_descendant_for_position_wasm =
                  function () {
                    return (_ts_node_named_descendant_for_position_wasm =
                      Module._ts_node_named_descendant_for_position_wasm =
                        Module.asm.ts_node_named_descendant_for_position_wasm).apply(null, arguments)
                  }),
                _ts_node_start_point_wasm = (Module._ts_node_start_point_wasm = function () {
                  return (_ts_node_start_point_wasm = Module._ts_node_start_point_wasm =
                    Module.asm.ts_node_start_point_wasm).apply(null, arguments)
                }),
                _ts_node_end_point_wasm = (Module._ts_node_end_point_wasm = function () {
                  return (_ts_node_end_point_wasm = Module._ts_node_end_point_wasm =
                    Module.asm.ts_node_end_point_wasm).apply(null, arguments)
                }),
                _ts_node_start_index_wasm = (Module._ts_node_start_index_wasm = function () {
                  return (_ts_node_start_index_wasm = Module._ts_node_start_index_wasm =
                    Module.asm.ts_node_start_index_wasm).apply(null, arguments)
                }),
                _ts_node_end_index_wasm = (Module._ts_node_end_index_wasm = function () {
                  return (_ts_node_end_index_wasm = Module._ts_node_end_index_wasm =
                    Module.asm.ts_node_end_index_wasm).apply(null, arguments)
                }),
                _ts_node_to_string_wasm = (Module._ts_node_to_string_wasm = function () {
                  return (_ts_node_to_string_wasm = Module._ts_node_to_string_wasm =
                    Module.asm.ts_node_to_string_wasm).apply(null, arguments)
                }),
                _ts_node_children_wasm = (Module._ts_node_children_wasm = function () {
                  return (_ts_node_children_wasm = Module._ts_node_children_wasm =
                    Module.asm.ts_node_children_wasm).apply(null, arguments)
                }),
                _ts_node_named_children_wasm = (Module._ts_node_named_children_wasm = function () {
                  return (_ts_node_named_children_wasm = Module._ts_node_named_children_wasm =
                    Module.asm.ts_node_named_children_wasm).apply(null, arguments)
                }),
                _ts_node_descendants_of_type_wasm = (Module._ts_node_descendants_of_type_wasm = function () {
                  return (_ts_node_descendants_of_type_wasm = Module._ts_node_descendants_of_type_wasm =
                    Module.asm.ts_node_descendants_of_type_wasm).apply(null, arguments)
                }),
                _ts_node_is_named_wasm = (Module._ts_node_is_named_wasm = function () {
                  return (_ts_node_is_named_wasm = Module._ts_node_is_named_wasm =
                    Module.asm.ts_node_is_named_wasm).apply(null, arguments)
                }),
                _ts_node_has_changes_wasm = (Module._ts_node_has_changes_wasm = function () {
                  return (_ts_node_has_changes_wasm = Module._ts_node_has_changes_wasm =
                    Module.asm.ts_node_has_changes_wasm).apply(null, arguments)
                }),
                _ts_node_has_error_wasm = (Module._ts_node_has_error_wasm = function () {
                  return (_ts_node_has_error_wasm = Module._ts_node_has_error_wasm =
                    Module.asm.ts_node_has_error_wasm).apply(null, arguments)
                }),
                _ts_node_is_missing_wasm = (Module._ts_node_is_missing_wasm = function () {
                  return (_ts_node_is_missing_wasm = Module._ts_node_is_missing_wasm =
                    Module.asm.ts_node_is_missing_wasm).apply(null, arguments)
                }),
                _ts_query_matches_wasm = (Module._ts_query_matches_wasm = function () {
                  return (_ts_query_matches_wasm = Module._ts_query_matches_wasm =
                    Module.asm.ts_query_matches_wasm).apply(null, arguments)
                }),
                _ts_query_captures_wasm = (Module._ts_query_captures_wasm = function () {
                  return (_ts_query_captures_wasm = Module._ts_query_captures_wasm =
                    Module.asm.ts_query_captures_wasm).apply(null, arguments)
                }),
                ___cxa_atexit = (Module.___cxa_atexit = function () {
                  return (___cxa_atexit = Module.___cxa_atexit = Module.asm.__cxa_atexit).apply(null, arguments)
                }),
                _iswdigit = (Module._iswdigit = function () {
                  return (_iswdigit = Module._iswdigit = Module.asm.iswdigit).apply(null, arguments)
                }),
                _iswalpha = (Module._iswalpha = function () {
                  return (_iswalpha = Module._iswalpha = Module.asm.iswalpha).apply(null, arguments)
                }),
                _iswlower = (Module._iswlower = function () {
                  return (_iswlower = Module._iswlower = Module.asm.iswlower).apply(null, arguments)
                }),
                _memchr = (Module._memchr = function () {
                  return (_memchr = Module._memchr = Module.asm.memchr).apply(null, arguments)
                }),
                _strlen = (Module._strlen = function () {
                  return (_strlen = Module._strlen = Module.asm.strlen).apply(null, arguments)
                }),
                _towupper = (Module._towupper = function () {
                  return (_towupper = Module._towupper = Module.asm.towupper).apply(null, arguments)
                }),
                _setThrew = (Module._setThrew = function () {
                  return (_setThrew = Module._setThrew = Module.asm.setThrew).apply(null, arguments)
                }),
                stackSave = (Module.stackSave = function () {
                  return (stackSave = Module.stackSave = Module.asm.stackSave).apply(null, arguments)
                }),
                stackRestore = (Module.stackRestore = function () {
                  return (stackRestore = Module.stackRestore = Module.asm.stackRestore).apply(null, arguments)
                }),
                stackAlloc = (Module.stackAlloc = function () {
                  return (stackAlloc = Module.stackAlloc = Module.asm.stackAlloc).apply(null, arguments)
                }),
                __Znwm = (Module.__Znwm = function () {
                  return (__Znwm = Module.__Znwm = Module.asm._Znwm).apply(null, arguments)
                }),
                __ZdlPv = (Module.__ZdlPv = function () {
                  return (__ZdlPv = Module.__ZdlPv = Module.asm._ZdlPv).apply(null, arguments)
                }),
                __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev =
                  (Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev = function () {
                    return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev =
                      Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev =
                        Module.asm._ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED2Ev).apply(
                      null,
                      arguments
                    )
                  }),
                __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEmmmmmm =
                  (Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEmmmmmm =
                    function () {
                      return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEmmmmmm =
                        Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEmmmmmm =
                          Module.asm._ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEmmmmmm).apply(
                        null,
                        arguments
                      )
                    }),
                __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm =
                  (Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm = function () {
                    return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm =
                      Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm =
                        Module.asm._ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcm).apply(
                      null,
                      arguments
                    )
                  }),
                __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm =
                  (Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm = function () {
                    return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm =
                      Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm =
                        Module.asm._ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm).apply(
                      null,
                      arguments
                    )
                  }),
                __ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4copyEPcmm =
                  (Module.__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4copyEPcmm = function () {
                    return (__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4copyEPcmm =
                      Module.__ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4copyEPcmm =
                        Module.asm._ZNKSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE4copyEPcmm).apply(
                      null,
                      arguments
                    )
                  }),
                __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc =
                  (Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc = function () {
                    return (__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc =
                      Module.__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc =
                        Module.asm._ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc).apply(
                      null,
                      arguments
                    )
                  }),
                __ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED2Ev =
                  (Module.__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED2Ev = function () {
                    return (__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED2Ev =
                      Module.__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED2Ev =
                        Module.asm._ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED2Ev).apply(
                      null,
                      arguments
                    )
                  }),
                __ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw =
                  (Module.__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw = function () {
                    return (__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw =
                      Module.__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw =
                        Module.asm._ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw).apply(
                      null,
                      arguments
                    )
                  }),
                __ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6resizeEmw =
                  (Module.__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6resizeEmw = function () {
                    return (__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6resizeEmw =
                      Module.__ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6resizeEmw =
                        Module.asm._ZNSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6resizeEmw).apply(
                      null,
                      arguments
                    )
                  }),
                dynCall_jiji = (Module.dynCall_jiji = function () {
                  return (dynCall_jiji = Module.dynCall_jiji = Module.asm.dynCall_jiji).apply(null, arguments)
                }),
                _orig$ts_parser_timeout_micros = (Module._orig$ts_parser_timeout_micros = function () {
                  return (_orig$ts_parser_timeout_micros = Module._orig$ts_parser_timeout_micros =
                    Module.asm.orig$ts_parser_timeout_micros).apply(null, arguments)
                }),
                _orig$ts_parser_set_timeout_micros = (Module._orig$ts_parser_set_timeout_micros = function () {
                  return (_orig$ts_parser_set_timeout_micros = Module._orig$ts_parser_set_timeout_micros =
                    Module.asm.orig$ts_parser_set_timeout_micros).apply(null, arguments)
                }),
                calledRun
              function callMain(t) {
                var e = Module._main
                if (e) {
                  ;(t = t || []).unshift(thisProgram)
                  var n = t.length,
                    r = stackAlloc(4 * (n + 1)),
                    s = r >> 2
                  t.forEach(i => {
                    HEAP32[s++] = allocateUTF8OnStack(i)
                  }),
                    (HEAP32[s] = 0)
                  try {
                    var a = e(n, r)
                    return exitJS(a, !0), a
                  } catch (i) {
                    return handleException(i)
                  }
                }
              }
              ;(Module.AsciiToString = AsciiToString),
                (Module.stringToUTF16 = stringToUTF16),
                (dependenciesFulfilled = function t() {
                  calledRun || run(), calledRun || (dependenciesFulfilled = t)
                })
              var dylibsLoaded = !1
              function run(t) {
                function e() {
                  calledRun ||
                    ((calledRun = !0),
                    (Module.calledRun = !0),
                    ABORT ||
                      (initRuntime(),
                      preMain(),
                      Module.onRuntimeInitialized && Module.onRuntimeInitialized(),
                      shouldRunNow && callMain(t),
                      postRun()))
                }
                ;(t = t || arguments_),
                  runDependencies > 0 ||
                    (!dylibsLoaded && (preloadDylibs(), (dylibsLoaded = !0), runDependencies > 0)) ||
                    (preRun(),
                    runDependencies > 0 ||
                      (Module.setStatus
                        ? (Module.setStatus('Running...'),
                          setTimeout(function () {
                            setTimeout(function () {
                              Module.setStatus('')
                            }, 1),
                              e()
                          }, 1))
                        : e()))
              }
              if (Module.preInit)
                for (
                  typeof Module.preInit == 'function' && (Module.preInit = [Module.preInit]);
                  Module.preInit.length > 0;

                )
                  Module.preInit.pop()()
              var shouldRunNow = !0
              Module.noInitialRun && (shouldRunNow = !1), run()
              let C = Module,
                INTERNAL = {},
                SIZE_OF_INT = 4,
                SIZE_OF_NODE = 5 * SIZE_OF_INT,
                SIZE_OF_POINT = 2 * SIZE_OF_INT,
                SIZE_OF_RANGE = 2 * SIZE_OF_INT + 2 * SIZE_OF_POINT,
                ZERO_POINT = { row: 0, column: 0 },
                QUERY_WORD_REGEX = /[\w-.]*/g,
                PREDICATE_STEP_TYPE_CAPTURE = 1,
                PREDICATE_STEP_TYPE_STRING = 2,
                LANGUAGE_FUNCTION_REGEX = /^_?tree_sitter_\w+/
              var VERSION, MIN_COMPATIBLE_VERSION, TRANSFER_BUFFER, currentParseCallback, currentLogCallback
              class ParserImpl {
                static init() {
                  ;(TRANSFER_BUFFER = C._ts_init()),
                    (VERSION = getValue(TRANSFER_BUFFER, 'i32')),
                    (MIN_COMPATIBLE_VERSION = getValue(TRANSFER_BUFFER + SIZE_OF_INT, 'i32'))
                }
                initialize() {
                  C._ts_parser_new_wasm(),
                    (this[0] = getValue(TRANSFER_BUFFER, 'i32')),
                    (this[1] = getValue(TRANSFER_BUFFER + SIZE_OF_INT, 'i32'))
                }
                delete() {
                  C._ts_parser_delete(this[0]), C._free(this[1]), (this[0] = 0), (this[1] = 0)
                }
                setLanguage(e) {
                  let n
                  if (e) {
                    if (e.constructor !== Language) throw new Error('Argument must be a Language')
                    {
                      n = e[0]
                      let r = C._ts_language_version(n)
                      if (r < MIN_COMPATIBLE_VERSION || VERSION < r)
                        throw new Error(
                          `Incompatible language version ${r}. Compatibility range ${MIN_COMPATIBLE_VERSION} through ${VERSION}.`
                        )
                    }
                  } else (n = 0), (e = null)
                  return (this.language = e), C._ts_parser_set_language(this[0], n), this
                }
                getLanguage() {
                  return this.language
                }
                parse(e, n, r) {
                  if (typeof e == 'string') currentParseCallback = (_, l, d) => e.slice(_, d)
                  else {
                    if (typeof e != 'function') throw new Error('Argument must be a string or a function')
                    currentParseCallback = e
                  }
                  this.logCallback
                    ? ((currentLogCallback = this.logCallback), C._ts_parser_enable_logger_wasm(this[0], 1))
                    : ((currentLogCallback = null), C._ts_parser_enable_logger_wasm(this[0], 0))
                  let s = 0,
                    a = 0
                  if (r && r.includedRanges) {
                    ;(s = r.includedRanges.length), (a = C._calloc(s, SIZE_OF_RANGE))
                    let _ = a
                    for (let l = 0; l < s; l++) marshalRange(_, r.includedRanges[l]), (_ += SIZE_OF_RANGE)
                  }
                  let i = C._ts_parser_parse_wasm(this[0], this[1], n ? n[0] : 0, a, s)
                  if (!i)
                    throw ((currentParseCallback = null), (currentLogCallback = null), new Error('Parsing failed'))
                  let o = new Tree(INTERNAL, i, this.language, currentParseCallback)
                  return (currentParseCallback = null), (currentLogCallback = null), o
                }
                reset() {
                  C._ts_parser_reset(this[0])
                }
                setTimeoutMicros(e) {
                  C._ts_parser_set_timeout_micros(this[0], e)
                }
                getTimeoutMicros() {
                  return C._ts_parser_timeout_micros(this[0])
                }
                setLogger(e) {
                  if (e) {
                    if (typeof e != 'function') throw new Error('Logger callback must be a function')
                  } else e = null
                  return (this.logCallback = e), this
                }
                getLogger() {
                  return this.logCallback
                }
              }
              class Tree {
                constructor(e, n, r, s) {
                  assertInternal(e), (this[0] = n), (this.language = r), (this.textCallback = s)
                }
                copy() {
                  let e = C._ts_tree_copy(this[0])
                  return new Tree(INTERNAL, e, this.language, this.textCallback)
                }
                delete() {
                  C._ts_tree_delete(this[0]), (this[0] = 0)
                }
                edit(e) {
                  marshalEdit(e), C._ts_tree_edit_wasm(this[0])
                }
                get rootNode() {
                  return C._ts_tree_root_node_wasm(this[0]), unmarshalNode(this)
                }
                getLanguage() {
                  return this.language
                }
                walk() {
                  return this.rootNode.walk()
                }
                getChangedRanges(e) {
                  if (e.constructor !== Tree) throw new TypeError('Argument must be a Tree')
                  C._ts_tree_get_changed_ranges_wasm(this[0], e[0])
                  let n = getValue(TRANSFER_BUFFER, 'i32'),
                    r = getValue(TRANSFER_BUFFER + SIZE_OF_INT, 'i32'),
                    s = new Array(n)
                  if (n > 0) {
                    let a = r
                    for (let i = 0; i < n; i++) (s[i] = unmarshalRange(a)), (a += SIZE_OF_RANGE)
                    C._free(r)
                  }
                  return s
                }
              }
              class Node {
                constructor(e, n) {
                  assertInternal(e), (this.tree = n)
                }
                get typeId() {
                  return marshalNode(this), C._ts_node_symbol_wasm(this.tree[0])
                }
                get type() {
                  return this.tree.language.types[this.typeId] || 'ERROR'
                }
                get endPosition() {
                  return marshalNode(this), C._ts_node_end_point_wasm(this.tree[0]), unmarshalPoint(TRANSFER_BUFFER)
                }
                get endIndex() {
                  return marshalNode(this), C._ts_node_end_index_wasm(this.tree[0])
                }
                get text() {
                  return getText(this.tree, this.startIndex, this.endIndex)
                }
                isNamed() {
                  return marshalNode(this), C._ts_node_is_named_wasm(this.tree[0]) === 1
                }
                hasError() {
                  return marshalNode(this), C._ts_node_has_error_wasm(this.tree[0]) === 1
                }
                hasChanges() {
                  return marshalNode(this), C._ts_node_has_changes_wasm(this.tree[0]) === 1
                }
                isMissing() {
                  return marshalNode(this), C._ts_node_is_missing_wasm(this.tree[0]) === 1
                }
                equals(e) {
                  return this.id === e.id
                }
                child(e) {
                  return marshalNode(this), C._ts_node_child_wasm(this.tree[0], e), unmarshalNode(this.tree)
                }
                namedChild(e) {
                  return marshalNode(this), C._ts_node_named_child_wasm(this.tree[0], e), unmarshalNode(this.tree)
                }
                childForFieldId(e) {
                  return marshalNode(this), C._ts_node_child_by_field_id_wasm(this.tree[0], e), unmarshalNode(this.tree)
                }
                childForFieldName(e) {
                  let n = this.tree.language.fields.indexOf(e)
                  if (n !== -1) return this.childForFieldId(n)
                }
                get childCount() {
                  return marshalNode(this), C._ts_node_child_count_wasm(this.tree[0])
                }
                get namedChildCount() {
                  return marshalNode(this), C._ts_node_named_child_count_wasm(this.tree[0])
                }
                get firstChild() {
                  return this.child(0)
                }
                get firstNamedChild() {
                  return this.namedChild(0)
                }
                get lastChild() {
                  return this.child(this.childCount - 1)
                }
                get lastNamedChild() {
                  return this.namedChild(this.namedChildCount - 1)
                }
                get children() {
                  if (!this._children) {
                    marshalNode(this), C._ts_node_children_wasm(this.tree[0])
                    let e = getValue(TRANSFER_BUFFER, 'i32'),
                      n = getValue(TRANSFER_BUFFER + SIZE_OF_INT, 'i32')
                    if (((this._children = new Array(e)), e > 0)) {
                      let r = n
                      for (let s = 0; s < e; s++) (this._children[s] = unmarshalNode(this.tree, r)), (r += SIZE_OF_NODE)
                      C._free(n)
                    }
                  }
                  return this._children
                }
                get namedChildren() {
                  if (!this._namedChildren) {
                    marshalNode(this), C._ts_node_named_children_wasm(this.tree[0])
                    let e = getValue(TRANSFER_BUFFER, 'i32'),
                      n = getValue(TRANSFER_BUFFER + SIZE_OF_INT, 'i32')
                    if (((this._namedChildren = new Array(e)), e > 0)) {
                      let r = n
                      for (let s = 0; s < e; s++)
                        (this._namedChildren[s] = unmarshalNode(this.tree, r)), (r += SIZE_OF_NODE)
                      C._free(n)
                    }
                  }
                  return this._namedChildren
                }
                descendantsOfType(e, n, r) {
                  Array.isArray(e) || (e = [e]), n || (n = ZERO_POINT), r || (r = ZERO_POINT)
                  let s = [],
                    a = this.tree.language.types
                  for (let d = 0, c = a.length; d < c; d++) e.includes(a[d]) && s.push(d)
                  let i = C._malloc(SIZE_OF_INT * s.length)
                  for (let d = 0, c = s.length; d < c; d++) setValue(i + d * SIZE_OF_INT, s[d], 'i32')
                  marshalNode(this),
                    C._ts_node_descendants_of_type_wasm(this.tree[0], i, s.length, n.row, n.column, r.row, r.column)
                  let o = getValue(TRANSFER_BUFFER, 'i32'),
                    _ = getValue(TRANSFER_BUFFER + SIZE_OF_INT, 'i32'),
                    l = new Array(o)
                  if (o > 0) {
                    let d = _
                    for (let c = 0; c < o; c++) (l[c] = unmarshalNode(this.tree, d)), (d += SIZE_OF_NODE)
                  }
                  return C._free(_), C._free(i), l
                }
                get nextSibling() {
                  return marshalNode(this), C._ts_node_next_sibling_wasm(this.tree[0]), unmarshalNode(this.tree)
                }
                get previousSibling() {
                  return marshalNode(this), C._ts_node_prev_sibling_wasm(this.tree[0]), unmarshalNode(this.tree)
                }
                get nextNamedSibling() {
                  return marshalNode(this), C._ts_node_next_named_sibling_wasm(this.tree[0]), unmarshalNode(this.tree)
                }
                get previousNamedSibling() {
                  return marshalNode(this), C._ts_node_prev_named_sibling_wasm(this.tree[0]), unmarshalNode(this.tree)
                }
                get parent() {
                  return marshalNode(this), C._ts_node_parent_wasm(this.tree[0]), unmarshalNode(this.tree)
                }
                descendantForIndex(e, n = e) {
                  if (typeof e != 'number' || typeof n != 'number') throw new Error('Arguments must be numbers')
                  marshalNode(this)
                  let r = TRANSFER_BUFFER + SIZE_OF_NODE
                  return (
                    setValue(r, e, 'i32'),
                    setValue(r + SIZE_OF_INT, n, 'i32'),
                    C._ts_node_descendant_for_index_wasm(this.tree[0]),
                    unmarshalNode(this.tree)
                  )
                }
                namedDescendantForIndex(e, n = e) {
                  if (typeof e != 'number' || typeof n != 'number') throw new Error('Arguments must be numbers')
                  marshalNode(this)
                  let r = TRANSFER_BUFFER + SIZE_OF_NODE
                  return (
                    setValue(r, e, 'i32'),
                    setValue(r + SIZE_OF_INT, n, 'i32'),
                    C._ts_node_named_descendant_for_index_wasm(this.tree[0]),
                    unmarshalNode(this.tree)
                  )
                }
                descendantForPosition(e, n = e) {
                  if (!isPoint(e) || !isPoint(n)) throw new Error('Arguments must be {row, column} objects')
                  marshalNode(this)
                  let r = TRANSFER_BUFFER + SIZE_OF_NODE
                  return (
                    marshalPoint(r, e),
                    marshalPoint(r + SIZE_OF_POINT, n),
                    C._ts_node_descendant_for_position_wasm(this.tree[0]),
                    unmarshalNode(this.tree)
                  )
                }
                namedDescendantForPosition(e, n = e) {
                  if (!isPoint(e) || !isPoint(n)) throw new Error('Arguments must be {row, column} objects')
                  marshalNode(this)
                  let r = TRANSFER_BUFFER + SIZE_OF_NODE
                  return (
                    marshalPoint(r, e),
                    marshalPoint(r + SIZE_OF_POINT, n),
                    C._ts_node_named_descendant_for_position_wasm(this.tree[0]),
                    unmarshalNode(this.tree)
                  )
                }
                walk() {
                  return (
                    marshalNode(this), C._ts_tree_cursor_new_wasm(this.tree[0]), new TreeCursor(INTERNAL, this.tree)
                  )
                }
                toString() {
                  marshalNode(this)
                  let e = C._ts_node_to_string_wasm(this.tree[0]),
                    n = AsciiToString(e)
                  return C._free(e), n
                }
              }
              class TreeCursor {
                constructor(e, n) {
                  assertInternal(e), (this.tree = n), unmarshalTreeCursor(this)
                }
                delete() {
                  marshalTreeCursor(this),
                    C._ts_tree_cursor_delete_wasm(this.tree[0]),
                    (this[0] = this[1] = this[2] = 0)
                }
                reset(e) {
                  marshalNode(e),
                    marshalTreeCursor(this, TRANSFER_BUFFER + SIZE_OF_NODE),
                    C._ts_tree_cursor_reset_wasm(this.tree[0]),
                    unmarshalTreeCursor(this)
                }
                get nodeType() {
                  return this.tree.language.types[this.nodeTypeId] || 'ERROR'
                }
                get nodeTypeId() {
                  return marshalTreeCursor(this), C._ts_tree_cursor_current_node_type_id_wasm(this.tree[0])
                }
                get nodeId() {
                  return marshalTreeCursor(this), C._ts_tree_cursor_current_node_id_wasm(this.tree[0])
                }
                get nodeIsNamed() {
                  return marshalTreeCursor(this), C._ts_tree_cursor_current_node_is_named_wasm(this.tree[0]) === 1
                }
                get nodeIsMissing() {
                  return marshalTreeCursor(this), C._ts_tree_cursor_current_node_is_missing_wasm(this.tree[0]) === 1
                }
                get nodeText() {
                  marshalTreeCursor(this)
                  let e = C._ts_tree_cursor_start_index_wasm(this.tree[0]),
                    n = C._ts_tree_cursor_end_index_wasm(this.tree[0])
                  return getText(this.tree, e, n)
                }
                get startPosition() {
                  return (
                    marshalTreeCursor(this),
                    C._ts_tree_cursor_start_position_wasm(this.tree[0]),
                    unmarshalPoint(TRANSFER_BUFFER)
                  )
                }
                get endPosition() {
                  return (
                    marshalTreeCursor(this),
                    C._ts_tree_cursor_end_position_wasm(this.tree[0]),
                    unmarshalPoint(TRANSFER_BUFFER)
                  )
                }
                get startIndex() {
                  return marshalTreeCursor(this), C._ts_tree_cursor_start_index_wasm(this.tree[0])
                }
                get endIndex() {
                  return marshalTreeCursor(this), C._ts_tree_cursor_end_index_wasm(this.tree[0])
                }
                currentNode() {
                  return (
                    marshalTreeCursor(this), C._ts_tree_cursor_current_node_wasm(this.tree[0]), unmarshalNode(this.tree)
                  )
                }
                currentFieldId() {
                  return marshalTreeCursor(this), C._ts_tree_cursor_current_field_id_wasm(this.tree[0])
                }
                currentFieldName() {
                  return this.tree.language.fields[this.currentFieldId()]
                }
                gotoFirstChild() {
                  marshalTreeCursor(this)
                  let e = C._ts_tree_cursor_goto_first_child_wasm(this.tree[0])
                  return unmarshalTreeCursor(this), e === 1
                }
                gotoNextSibling() {
                  marshalTreeCursor(this)
                  let e = C._ts_tree_cursor_goto_next_sibling_wasm(this.tree[0])
                  return unmarshalTreeCursor(this), e === 1
                }
                gotoParent() {
                  marshalTreeCursor(this)
                  let e = C._ts_tree_cursor_goto_parent_wasm(this.tree[0])
                  return unmarshalTreeCursor(this), e === 1
                }
              }
              class Language {
                constructor(e, n) {
                  assertInternal(e), (this[0] = n), (this.types = new Array(C._ts_language_symbol_count(this[0])))
                  for (let r = 0, s = this.types.length; r < s; r++)
                    C._ts_language_symbol_type(this[0], r) < 2 &&
                      (this.types[r] = UTF8ToString(C._ts_language_symbol_name(this[0], r)))
                  this.fields = new Array(C._ts_language_field_count(this[0]) + 1)
                  for (let r = 0, s = this.fields.length; r < s; r++) {
                    let a = C._ts_language_field_name_for_id(this[0], r)
                    this.fields[r] = a !== 0 ? UTF8ToString(a) : null
                  }
                }
                get version() {
                  return C._ts_language_version(this[0])
                }
                get fieldCount() {
                  return this.fields.length - 1
                }
                fieldIdForName(e) {
                  let n = this.fields.indexOf(e)
                  return n !== -1 ? n : null
                }
                fieldNameForId(e) {
                  return this.fields[e] || null
                }
                idForNodeType(e, n) {
                  let r = lengthBytesUTF8(e),
                    s = C._malloc(r + 1)
                  stringToUTF8(e, s, r + 1)
                  let a = C._ts_language_symbol_for_name(this[0], s, r, n)
                  return C._free(s), a || null
                }
                get nodeTypeCount() {
                  return C._ts_language_symbol_count(this[0])
                }
                nodeTypeForId(e) {
                  let n = C._ts_language_symbol_name(this[0], e)
                  return n ? UTF8ToString(n) : null
                }
                nodeTypeIsNamed(e) {
                  return !!C._ts_language_type_is_named_wasm(this[0], e)
                }
                nodeTypeIsVisible(e) {
                  return !!C._ts_language_type_is_visible_wasm(this[0], e)
                }
                query(e) {
                  let n = lengthBytesUTF8(e),
                    r = C._malloc(n + 1)
                  stringToUTF8(e, r, n + 1)
                  let s = C._ts_query_new(this[0], r, n, TRANSFER_BUFFER, TRANSFER_BUFFER + SIZE_OF_INT)
                  if (!s) {
                    let m = getValue(TRANSFER_BUFFER + SIZE_OF_INT, 'i32'),
                      p = UTF8ToString(r, getValue(TRANSFER_BUFFER, 'i32')).length,
                      f = e.substr(p, 100).split(`
`)[0],
                      u,
                      w = f.match(QUERY_WORD_REGEX)[0]
                    switch (m) {
                      case 2:
                        u = new RangeError(`Bad node name '${w}'`)
                        break
                      case 3:
                        u = new RangeError(`Bad field name '${w}'`)
                        break
                      case 4:
                        u = new RangeError(`Bad capture name @${w}`)
                        break
                      case 5:
                        ;(u = new TypeError(`Bad pattern structure at offset ${p}: '${f}'...`)), (w = '')
                        break
                      default:
                        ;(u = new SyntaxError(`Bad syntax at offset ${p}: '${f}'...`)), (w = '')
                    }
                    throw ((u.index = p), (u.length = w.length), C._free(r), u)
                  }
                  let a = C._ts_query_string_count(s),
                    i = C._ts_query_capture_count(s),
                    o = C._ts_query_pattern_count(s),
                    _ = new Array(i),
                    l = new Array(a)
                  for (let m = 0; m < i; m++) {
                    let p = C._ts_query_capture_name_for_id(s, m, TRANSFER_BUFFER),
                      f = getValue(TRANSFER_BUFFER, 'i32')
                    _[m] = UTF8ToString(p, f)
                  }
                  for (let m = 0; m < a; m++) {
                    let p = C._ts_query_string_value_for_id(s, m, TRANSFER_BUFFER),
                      f = getValue(TRANSFER_BUFFER, 'i32')
                    l[m] = UTF8ToString(p, f)
                  }
                  let d = new Array(o),
                    c = new Array(o),
                    h = new Array(o),
                    g = new Array(o),
                    b = new Array(o)
                  for (let m = 0; m < o; m++) {
                    let p = C._ts_query_predicates_for_pattern(s, m, TRANSFER_BUFFER),
                      f = getValue(TRANSFER_BUFFER, 'i32')
                    ;(g[m] = []), (b[m] = [])
                    let u = [],
                      w = p
                    for (let re = 0; re < f; re++) {
                      let se = getValue(w, 'i32')
                      w += SIZE_OF_INT
                      let ae = getValue(w, 'i32')
                      if (((w += SIZE_OF_INT), se === PREDICATE_STEP_TYPE_CAPTURE))
                        u.push({ type: 'capture', name: _[ae] })
                      else if (se === PREDICATE_STEP_TYPE_STRING) u.push({ type: 'string', value: l[ae] })
                      else if (u.length > 0) {
                        if (u[0].type !== 'string') throw new Error('Predicates must begin with a literal value')
                        let O = u[0].value,
                          D = !0
                        switch (O) {
                          case 'not-eq?':
                            D = !1
                          case 'eq?':
                            if (u.length !== 3)
                              throw new Error(
                                'Wrong number of arguments to `#eq?` predicate. Expected 2, got ' + (u.length - 1)
                              )
                            if (u[1].type !== 'capture')
                              throw new Error(
                                `First argument of \`#eq?\` predicate must be a capture. Got "${u[1].value}"`
                              )
                            if (u[2].type === 'capture') {
                              let N = u[1].name,
                                v = u[2].name
                              b[m].push(function (V) {
                                let F, j
                                for (let Z of V) Z.name === N && (F = Z.node), Z.name === v && (j = Z.node)
                                return F === void 0 || j === void 0 || (F.text === j.text) === D
                              })
                            } else {
                              let N = u[1].name,
                                v = u[2].value
                              b[m].push(function (V) {
                                for (let F of V) if (F.name === N) return (F.node.text === v) === D
                                return !0
                              })
                            }
                            break
                          case 'not-match?':
                            D = !1
                          case 'match?':
                            if (u.length !== 3)
                              throw new Error(
                                `Wrong number of arguments to \`#match?\` predicate. Expected 2, got ${u.length - 1}.`
                              )
                            if (u[1].type !== 'capture')
                              throw new Error(
                                `First argument of \`#match?\` predicate must be a capture. Got "${u[1].value}".`
                              )
                            if (u[2].type !== 'string')
                              throw new Error(
                                `Second argument of \`#match?\` predicate must be a string. Got @${u[2].value}.`
                              )
                            let Ae = u[1].name,
                              ve = new RegExp(u[2].value)
                            b[m].push(function (N) {
                              for (let v of N) if (v.name === Ae) return ve.test(v.node.text) === D
                              return !0
                            })
                            break
                          case 'set!':
                            if (u.length < 2 || u.length > 3)
                              throw new Error(
                                `Wrong number of arguments to \`#set!\` predicate. Expected 1 or 2. Got ${
                                  u.length - 1
                                }.`
                              )
                            if (u.some(N => N.type !== 'string'))
                              throw new Error('Arguments to `#set!` predicate must be a strings.".')
                            d[m] || (d[m] = {}), (d[m][u[1].value] = u[2] ? u[2].value : null)
                            break
                          case 'is?':
                          case 'is-not?':
                            if (u.length < 2 || u.length > 3)
                              throw new Error(
                                `Wrong number of arguments to \`#${O}\` predicate. Expected 1 or 2. Got ${
                                  u.length - 1
                                }.`
                              )
                            if (u.some(N => N.type !== 'string'))
                              throw new Error(`Arguments to \`#${O}\` predicate must be a strings.".`)
                            let G = O === 'is?' ? c : h
                            G[m] || (G[m] = {}), (G[m][u[1].value] = u[2] ? u[2].value : null)
                            break
                          default:
                            g[m].push({ operator: O, operands: u.slice(1) })
                        }
                        u.length = 0
                      }
                    }
                    Object.freeze(d[m]), Object.freeze(c[m]), Object.freeze(h[m])
                  }
                  return (
                    C._free(r), new Query(INTERNAL, s, _, b, g, Object.freeze(d), Object.freeze(c), Object.freeze(h))
                  )
                }
                static load(e) {
                  let n
                  if (e instanceof Uint8Array) n = Promise.resolve(e)
                  else {
                    let s = e
                    if (typeof process < 'u' && process.versions && process.versions.node) {
                      let a = require('fs')
                      n = Promise.resolve(a.readFileSync(s))
                    } else
                      n = fetch(s).then(a =>
                        a.arrayBuffer().then(i => {
                          if (a.ok) return new Uint8Array(i)
                          {
                            let o = new TextDecoder('utf-8').decode(i)
                            throw new Error(`Language.load failed with status ${a.status}.

${o}`)
                          }
                        })
                      )
                  }
                  let r = typeof loadSideModule == 'function' ? loadSideModule : loadWebAssemblyModule
                  return n
                    .then(s => r(s, { loadAsync: !0 }))
                    .then(s => {
                      let a = Object.keys(s),
                        i = a.find(_ => LANGUAGE_FUNCTION_REGEX.test(_) && !_.includes('external_scanner_'))
                      i ||
                        console.log(`Couldn't find language function in WASM file. Symbols:
${JSON.stringify(a, null, 2)}`)
                      let o = s[i]()
                      return new Language(INTERNAL, o)
                    })
                }
              }
              class Query {
                constructor(e, n, r, s, a, i, o, _) {
                  assertInternal(e),
                    (this[0] = n),
                    (this.captureNames = r),
                    (this.textPredicates = s),
                    (this.predicates = a),
                    (this.setProperties = i),
                    (this.assertedProperties = o),
                    (this.refutedProperties = _),
                    (this.exceededMatchLimit = !1)
                }
                delete() {
                  C._ts_query_delete(this[0]), (this[0] = 0)
                }
                matches(e, n, r, s) {
                  n || (n = ZERO_POINT), r || (r = ZERO_POINT), s || (s = {})
                  let a = s.matchLimit
                  if (a === void 0) a = 0
                  else if (typeof a != 'number') throw new Error('Arguments must be numbers')
                  marshalNode(e), C._ts_query_matches_wasm(this[0], e.tree[0], n.row, n.column, r.row, r.column, a)
                  let i = getValue(TRANSFER_BUFFER, 'i32'),
                    o = getValue(TRANSFER_BUFFER + SIZE_OF_INT, 'i32'),
                    _ = getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, 'i32'),
                    l = new Array(i)
                  this.exceededMatchLimit = !!_
                  let d = 0,
                    c = o
                  for (let h = 0; h < i; h++) {
                    let g = getValue(c, 'i32')
                    c += SIZE_OF_INT
                    let b = getValue(c, 'i32')
                    c += SIZE_OF_INT
                    let m = new Array(b)
                    if (((c = unmarshalCaptures(this, e.tree, c, m)), this.textPredicates[g].every(p => p(m)))) {
                      l[d++] = { pattern: g, captures: m }
                      let p = this.setProperties[g]
                      p && (l[h].setProperties = p)
                      let f = this.assertedProperties[g]
                      f && (l[h].assertedProperties = f)
                      let u = this.refutedProperties[g]
                      u && (l[h].refutedProperties = u)
                    }
                  }
                  return (l.length = d), C._free(o), l
                }
                captures(e, n, r, s) {
                  n || (n = ZERO_POINT), r || (r = ZERO_POINT), s || (s = {})
                  let a = s.matchLimit
                  if (a === void 0) a = 0
                  else if (typeof a != 'number') throw new Error('Arguments must be numbers')
                  marshalNode(e), C._ts_query_captures_wasm(this[0], e.tree[0], n.row, n.column, r.row, r.column, a)
                  let i = getValue(TRANSFER_BUFFER, 'i32'),
                    o = getValue(TRANSFER_BUFFER + SIZE_OF_INT, 'i32'),
                    _ = getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, 'i32'),
                    l = []
                  this.exceededMatchLimit = !!_
                  let d = [],
                    c = o
                  for (let h = 0; h < i; h++) {
                    let g = getValue(c, 'i32')
                    c += SIZE_OF_INT
                    let b = getValue(c, 'i32')
                    c += SIZE_OF_INT
                    let m = getValue(c, 'i32')
                    if (
                      ((c += SIZE_OF_INT),
                      (d.length = b),
                      (c = unmarshalCaptures(this, e.tree, c, d)),
                      this.textPredicates[g].every(p => p(d)))
                    ) {
                      let p = d[m],
                        f = this.setProperties[g]
                      f && (p.setProperties = f)
                      let u = this.assertedProperties[g]
                      u && (p.assertedProperties = u)
                      let w = this.refutedProperties[g]
                      w && (p.refutedProperties = w), l.push(p)
                    }
                  }
                  return C._free(o), l
                }
                predicatesForPattern(e) {
                  return this.predicates[e]
                }
                didExceedMatchLimit() {
                  return this.exceededMatchLimit
                }
              }
              function getText(t, e, n) {
                let r = n - e,
                  s = t.textCallback(e, null, n)
                for (e += s.length; e < n; ) {
                  let a = t.textCallback(e, null, n)
                  if (!(a && a.length > 0)) break
                  ;(e += a.length), (s += a)
                }
                return e > n && (s = s.slice(0, r)), s
              }
              function unmarshalCaptures(t, e, n, r) {
                for (let s = 0, a = r.length; s < a; s++) {
                  let i = getValue(n, 'i32'),
                    o = unmarshalNode(e, (n += SIZE_OF_INT))
                  ;(n += SIZE_OF_NODE), (r[s] = { name: t.captureNames[i], node: o })
                }
                return n
              }
              function assertInternal(t) {
                if (t !== INTERNAL) throw new Error('Illegal constructor')
              }
              function isPoint(t) {
                return t && typeof t.row == 'number' && typeof t.column == 'number'
              }
              function marshalNode(t) {
                let e = TRANSFER_BUFFER
                setValue(e, t.id, 'i32'),
                  (e += SIZE_OF_INT),
                  setValue(e, t.startIndex, 'i32'),
                  (e += SIZE_OF_INT),
                  setValue(e, t.startPosition.row, 'i32'),
                  (e += SIZE_OF_INT),
                  setValue(e, t.startPosition.column, 'i32'),
                  (e += SIZE_OF_INT),
                  setValue(e, t[0], 'i32')
              }
              function unmarshalNode(t, e = TRANSFER_BUFFER) {
                let n = getValue(e, 'i32')
                if (n === 0) return null
                let r = getValue((e += SIZE_OF_INT), 'i32'),
                  s = getValue((e += SIZE_OF_INT), 'i32'),
                  a = getValue((e += SIZE_OF_INT), 'i32'),
                  i = getValue((e += SIZE_OF_INT), 'i32'),
                  o = new Node(INTERNAL, t)
                return (o.id = n), (o.startIndex = r), (o.startPosition = { row: s, column: a }), (o[0] = i), o
              }
              function marshalTreeCursor(t, e = TRANSFER_BUFFER) {
                setValue(e + 0 * SIZE_OF_INT, t[0], 'i32'),
                  setValue(e + 1 * SIZE_OF_INT, t[1], 'i32'),
                  setValue(e + 2 * SIZE_OF_INT, t[2], 'i32')
              }
              function unmarshalTreeCursor(t) {
                ;(t[0] = getValue(TRANSFER_BUFFER + 0 * SIZE_OF_INT, 'i32')),
                  (t[1] = getValue(TRANSFER_BUFFER + 1 * SIZE_OF_INT, 'i32')),
                  (t[2] = getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, 'i32'))
              }
              function marshalPoint(t, e) {
                setValue(t, e.row, 'i32'), setValue(t + SIZE_OF_INT, e.column, 'i32')
              }
              function unmarshalPoint(t) {
                return { row: getValue(t, 'i32'), column: getValue(t + SIZE_OF_INT, 'i32') }
              }
              function marshalRange(t, e) {
                marshalPoint(t, e.startPosition),
                  marshalPoint((t += SIZE_OF_POINT), e.endPosition),
                  setValue((t += SIZE_OF_POINT), e.startIndex, 'i32'),
                  setValue((t += SIZE_OF_INT), e.endIndex, 'i32'),
                  (t += SIZE_OF_INT)
              }
              function unmarshalRange(t) {
                let e = {}
                return (
                  (e.startPosition = unmarshalPoint(t)),
                  (t += SIZE_OF_POINT),
                  (e.endPosition = unmarshalPoint(t)),
                  (t += SIZE_OF_POINT),
                  (e.startIndex = getValue(t, 'i32')),
                  (t += SIZE_OF_INT),
                  (e.endIndex = getValue(t, 'i32')),
                  e
                )
              }
              function marshalEdit(t) {
                let e = TRANSFER_BUFFER
                marshalPoint(e, t.startPosition),
                  (e += SIZE_OF_POINT),
                  marshalPoint(e, t.oldEndPosition),
                  (e += SIZE_OF_POINT),
                  marshalPoint(e, t.newEndPosition),
                  (e += SIZE_OF_POINT),
                  setValue(e, t.startIndex, 'i32'),
                  (e += SIZE_OF_INT),
                  setValue(e, t.oldEndIndex, 'i32'),
                  (e += SIZE_OF_INT),
                  setValue(e, t.newEndIndex, 'i32'),
                  (e += SIZE_OF_INT)
              }
              for (let t of Object.getOwnPropertyNames(ParserImpl.prototype))
                Object.defineProperty(Parser.prototype, t, {
                  value: ParserImpl.prototype[t],
                  enumerable: !1,
                  writable: !1,
                })
              ;(Parser.Language = Language),
                (Module.onRuntimeInitialized = () => {
                  ParserImpl.init(), resolveInitPromise()
                })
            })))
          )
        }
      }
      return Parser
    })()
  typeof exports == 'object' && (module.exports = TreeSitter)
})
var Re = require('worker_threads')
var ne = {}
Ue(ne, {
  TreeSitterOffsetRange: () => T,
  _clean: () => Ve,
  _extractDoc: () => ct,
  _getCallExpressions: () => Xe,
  _getClassDeclarations: () => tt,
  _getCoarseParentScope: () => _t,
  _getDocumentableNodeIfOnIdentifier: () => ut,
  _getFixSelectionOfInterest: () => lt,
  _getFunctionBodies: () => ot,
  _getFunctionDefinitions: () => et,
  _getFunctionPositions: () => it,
  _getNewExpressions: () => st,
  _getNodeMatchingSelection: () => Pe,
  _getNodeToDocument: () => dt,
  _getSemanticChunkTree: () => at,
  _getTypeDeclarations: () => nt,
  _getTypeReferences: () => rt,
  _parse: () => E,
})
var U = ie(require('path')),
  W = ie(oe())
function _e(t, e, n) {
  let r = 0,
    s = t.length
  for (; r < s; ) {
    let a = (r + s) >>> 1
    n(t[a], e) ? (r = a + 1) : (s = a)
  }
  return r
}
function le(t, e) {
  if (t.length === 0) return
  let n = t[0]
  for (let r = 1; r < t.length; r++) {
    let s = t[r]
    e(s, n) > 0 && (n = s)
  }
  return n
}
var z = class {
    constructor(e = 10) {
      this.values = new Map()
      this.lruKeys = []
      if (e < 1) throw new Error('Cache size must be at least 1')
      this.size = e
    }
    removeKeyFromLRU(e) {
      let n = this.lruKeys.indexOf(e)
      n !== -1 && this.lruKeys.splice(n, 1)
    }
    touchKeyInLRU(e) {
      this.removeKeyFromLRU(e), this.lruKeys.push(e)
    }
    clear() {
      this.values.clear(), (this.lruKeys = [])
    }
    deleteKey(e) {
      this.removeKeyFromLRU(e)
      let n = this.values.get(e)
      return n !== void 0 && this.values.delete(e), n
    }
    get(e) {
      if (this.values.has(e)) {
        let n = this.values.get(e)
        return this.touchKeyInLRU(e), n
      }
    }
    keys() {
      return this.lruKeys.slice()
    }
    getValues() {
      return this.values.values()
    }
    put(e, n) {
      let r
      if (!this.values.has(e) && this.lruKeys.length === this.size) {
        let s = this.lruKeys.shift(),
          a = this.deleteKey(s)
        r = [s, a]
      }
      return this.values.set(e, n), this.touchKeyInLRU(e), r
    }
  },
  H = class {
    constructor(e) {
      this.actual = new z(e)
    }
    dispose() {
      this.clear()
    }
    clear() {
      let e = this.actual.getValues()
      for (let n of e) n.dispose()
      this.actual.clear()
    }
    deleteKey(e) {
      let n = this.actual.deleteKey(e)
      n && n.dispose()
    }
    get(e) {
      return this.actual.get(e)
    }
    keys() {
      return this.actual.keys()
    }
    getValues() {
      return this.actual.getValues()
    }
    put(e, n) {
      let r = this.actual.put(e, n)
      r && r[1].dispose()
    }
  }
var T = {
    doesContain: (t, e) => t.startIndex <= e.startIndex && e.endIndex <= t.endIndex,
    ofSyntaxNode: t => ({ startIndex: t.startIndex, endIndex: t.endIndex }),
    compare: (t, e) => t.startIndex - e.startIndex || e.endIndex - t.endIndex,
    doIntersect: (t, e) => {
      let n = Math.max(t.startIndex, e.startIndex),
        r = Math.min(t.endIndex, e.endIndex)
      return n < r
    },
    len: t => t.endIndex - t.startIndex,
    intersectionSize: (t, e) => {
      let n = Math.max(t.startIndex, e.startIndex),
        r = Math.min(t.endIndex, e.endIndex)
      return Math.max(r - n, 0)
    },
    isTreeSitterOffsetRange(t) {
      return typeof t.startIndex == 'number' && typeof t.endIndex == 'number'
    },
    toTreeSitterOffsetRange(t, e) {
      return { startIndex: e.offsetAt(t.start), endIndex: e.offsetAt(t.end) }
    },
  },
  S = {
    isEqual(t, e) {
      return t.row === e.row && t.column === e.column
    },
    isBefore(t, e) {
      return t.row < e.row || (t.row === e.row && t.column < e.column)
    },
    isAfter(t, e) {
      return S.isBefore(e, t)
    },
    isBeforeOrEqual(t, e) {
      let n = S.isBefore(t, e),
        r = S.isEqual(t, e)
      return !!(n || r)
    },
    equals(t, e) {
      return t.column === e.column && t.row === e.row
    },
    isAfterOrEqual(t, e) {
      return S.isBeforeOrEqual(e, t)
    },
    ofPoint: t => ({ row: t.row, column: t.column }),
  },
  A = {
    doesContain: (t, e) =>
      S.isBeforeOrEqual(t.startPosition, e.startPosition) && S.isAfterOrEqual(t.endPosition, e.endPosition),
    equals: (t, e) => S.equals(t.startPosition, e.startPosition) && S.equals(t.endPosition, e.endPosition),
    ofSyntaxNode: t => ({ startPosition: t.startPosition, endPosition: t.endPosition }),
  },
  J = { ofSyntaxNode: t => ({ type: t.type, startIndex: t.startIndex, endIndex: t.endIndex }) },
  M = {
    ofSyntaxNode: t => ({ range: A.ofSyntaxNode(t), startIndex: t.startIndex, text: t.text, endIndex: t.endIndex }),
  }
var q = class {
  constructor(e, n) {
    this.syntaxTreeRoot = n
    this.roots = []
    this.formTree(e)
  }
  formTree(e) {
    e.sort((a, i) => a.mainBlock.startIndex - i.mainBlock.startIndex || a.mainBlock.endIndex - i.mainBlock.endIndex)
    let n = [],
      r = () => n[n.length - 1],
      s = (a, i) => a.mainBlock.startIndex === i.mainBlock.startIndex && a.mainBlock.endIndex === i.mainBlock.endIndex
    for (let a of e) {
      let i = { info: a, children: [] },
        o = r()
      if (!o) {
        this.roots.push(i), n.push(i)
        continue
      }
      if (!s(o.info, a)) {
        for (; o && !T.doesContain(o.info.mainBlock, a.mainBlock); ) n.pop(), (o = r())
        o ? o.children.push(i) : this.roots.push(i), n.push(i)
      }
    }
  }
}
var $ = class extends Error {
    constructor(e) {
      super(`Unrecognized language: ${e}`)
    }
  },
  ue = {
    python: 'python',
    javascript: 'javascript',
    javascriptreact: 'javascript',
    jsx: 'javascript',
    typescript: 'typescript',
    tsx: 'tsx',
    go: 'go',
    ruby: 'ruby',
    csharp: 'csharp',
    cpp: 'cpp',
    java: 'java',
    rust: 'rust',
  }
function k(t) {
  return t in ue
}
function y(t) {
  if (k(t)) return ue[t]
  throw new $(t)
}
function P(t, e) {
  return Object.fromEntries(t.map(n => [n, e]))
}
var de = {
    ...P(
      ['javascript', 'typescript', 'tsx'],
      [
        [
          `[
				(call_expression
					function: (identifier) @identifier)
				(call_expression
					function: (member_expression
						(property_identifier) @identifier))
			] @call_expression`,
        ],
      ]
    ),
    python: [
      [
        `[
				(call
					function: (identifier) @identifier)
				(call
					function: (attribute
						attribute: (identifier) @identifier))
			] @call_expression`,
      ],
    ],
    csharp: [
      [
        `[
				(invocation_expression
					function: (identifier) @identifier)
				(invocation_expression
					function: (member_access_expression
						name: (identifier) @identifier))
			  ] @call_expression`,
      ],
    ],
    go: [
      [
        `[
				(call_expression
					((selector_expression
						(field_identifier) @identifier)))
				(call_expression
					(identifier) @identifier)
			] @call_expression`,
      ],
    ],
    java: [
      [
        `[
				(method_invocation
				  name: (identifier) @identifier)
			] @call_expression`,
      ],
    ],
    ruby: [
      [
        `[
				(call (identifier) @identifier
					(#not-match? @identifier "new|send|public_send|method"))
				(call
					receiver: (identifier)
					method: (identifier) @method
					(#match? @method "^(send|public_send|method)")
					arguments: (argument_list
						(simple_symbol) @symbol))
			] @call_expression`,
      ],
    ],
    cpp: [
      [
        `[
				(call_expression (identifier) @identifier)
				(call_expression
					(field_expression
						field: (field_identifier) @identifier))
				(call_expression
					(call_expression
						(primitive_type)
						(argument_list
							(pointer_expression
							(identifier) @identifier))))
			] @call_expression`,
      ],
    ],
    rust: [
      [
        `[
				(call_expression (identifier) @identifier)
				(call_expression (field_expression (identifier) (field_identifier) @identifier))
				(call_expression (scoped_identifier (identifier) (identifier) @identifier (#not-match? @identifier "new")))
			] @call_expression`,
      ],
    ],
  },
  ce = {
    ...P(['javascript', 'typescript', 'tsx'], [['(class_declaration) @class_declaration']]),
    java: [['(class_declaration) @class_declaration']],
    csharp: [['(class_declaration) @class_declaration']],
    python: [['(class_definition) @class_declaration']],
    cpp: [['(class_specifier) @class_declaration']],
    ruby: [['(class) @class_declaration']],
    go: [
      [
        `(type_declaration
				(type_spec
					(type_identifier) @type_identifier)) @class_declaration`,
      ],
    ],
    rust: [['(impl_item (type_identifier) @type_identifier) @class_declaration']],
  },
  me = {
    typescript: [
      [
        `[
				(interface_declaration)
				(type_alias_declaration)
			] @type_declaration`,
      ],
    ],
    csharp: [
      [
        `(interface_declaration
				(identifier) @type_identifier) @type_declaration`,
      ],
    ],
    cpp: [
      [
        `[
				(struct_specifier
					(type_identifier) @type_identifier)
				(union_specifier
					(type_identifier) @type_identifier)
				(enum_specifier
					(type_identifier) @type_identifier)
			] @type_declaration`,
      ],
    ],
    java: [
      [
        `(interface_declaration
				(identifier) @type_identifier) @type_declaration`,
      ],
    ],
    go: [
      [
        `(type_declaration
				(type_spec
					(type_identifier) @type_identifier)) @type_declaration`,
      ],
    ],
    ruby: [['((constant) @type_identifier) @type_declaration']],
    python: [
      [
        `(class_definition
				(identifier) @type_identifier) @type_declaration`,
      ],
    ],
  },
  pe = {
    typescript: [['(type_identifier) @type_identifier']],
    go: [['(type_identifier) @type_identifier']],
    ruby: [['(constant) @type_identifier']],
    csharp: [
      [
        `[
				(base_list
					(identifier) @type_identifier)
				(variable_declaration
					(identifier) @type_identifier)
			]`,
      ],
    ],
    cpp: [['(type_identifier) @type_identifier']],
    java: [['(type_identifier) @type_identifier']],
    python: [
      [
        `[
				(type (identifier) @type_identifier)
				(argument_list
					(identifier) @type_identifier)
			]`,
      ],
    ],
  },
  fe = {
    ...P(
      ['javascript', 'typescript', 'tsx'],
      [
        [
          `(new_expression
				constructor: (identifier) @new_expression)`,
        ],
      ]
    ),
    python: [
      [
        `(call
				function: (identifier) @new_expression)`,
      ],
    ],
    csharp: [
      [
        `(object_creation_expression
				(identifier) @new_expression)`,
      ],
    ],
    java: [
      [
        `(object_creation_expression
				(type_identifier) @new_expression)`,
      ],
    ],
    cpp: [
      [
        `(declaration
				(type_identifier) @new_expression)`,
      ],
    ],
    go: [['(composite_literal (type_identifier) @new_expression)']],
    ruby: [
      [
        `((call
				receiver: ((constant) @new_expression)
				method: (identifier) @method)
					(#eq? @method "new"))`,
      ],
    ],
    rust: [
      [
        `(call_expression
				(scoped_identifier
					(identifier) @new_expression
					(identifier) @identifier
					(#eq? @identifier "new")))`,
      ],
    ],
  },
  ge = {
    python: [
      [
        `[
				(function_definition
					name: (identifier) @identifier
					body: (block
							(expression_statement (string))? @docstring) @body)
				(assignment
					left: (identifier) @identifier
					right: (lambda) @body)
			] @function`,
      ],
      ['(ERROR ("def" (identifier) (parameters))) @function'],
    ],
    ...P(
      ['javascript', 'typescript', 'tsx'],
      [
        [
          `[
				(function
					name: (identifier)? @identifier
					body: (statement_block) @body)
				(function_declaration
					name: (identifier)? @identifier
					body: (statement_block) @body)
				(generator_function
					name: (identifier)? @identifier
					body: (statement_block) @body)
				(generator_function_declaration
					name: (identifier)? @identifier
					body: (statement_block) @body)
				(method_definition
					name: (property_identifier)? @identifier
					body: (statement_block) @body)
				(arrow_function
					body: (statement_block) @body)
			] @function`,
        ],
      ]
    ),
    go: [
      [
        `[
				(function_declaration
					name: (identifier) @identifier
					body: (block) @body)
				(method_declaration
					name: (field_identifier) @identifier
					body: (block) @body)
			] @function`,
      ],
    ],
    ruby: [
      [
        `[
				(method
					name: (_) @identifier
					parameters: (method_parameters)? @params
					[(_)+ "end"] @body)
				(singleton_method
					name: (_) @identifier
					parameters: (method_parameters)? @params
					[(_)+ "end"] @body)
			] @function`,
      ],
    ],
    csharp: [
      [
        `[
				(constructor_declaration
					(identifier) @identifier
					(block) @body)
				(destructor_declaration
					(identifier) @identifier
					(block) @body)
				(operator_declaration
					(block) @body)
				(method_declaration
					(identifier) @identifier
					(block) @body)
				(local_function_statement
					(identifier) @identifier
					(block) @body)
			] @function`,
      ],
    ],
    cpp: [
      [
        `(function_definition
					(_
					(identifier) @identifier)
				(compound_statement) @body) @function`,
      ],
    ],
    java: [
      [
        `[
				(constructor_declaration
					name: (identifier) @identifier
					body: (constructor_body) @body)
				(method_declaration
					name: (_) @identifier
					body: (block) @body)
				(lambda_expression
					body: (block) @body)
			] @function`,
      ],
    ],
    rust: [
      [
        `[
				(function_item (identifier) @identifier)
				(let_declaration (identifier) @identifier)
			] @function`,
      ],
    ],
  },
  he = {
    ...P(
      ['javascript', 'typescript', 'tsx'],
      [
        [
          `((comment) @comment
			(#match? @comment "^\\\\/\\\\*\\\\*")) @docComment`,
        ],
      ]
    ),
    java: [
      [
        `((block_comment) @block_comment
			(#match? @block_comment "^\\\\/\\\\*\\\\*")) @docComment`,
      ],
    ],
    cpp: [
      [
        `((comment) @comment
			(#match? @comment "^\\\\/\\\\*\\\\*")) @docComment`,
      ],
    ],
    csharp: [
      [
        `(
			((comment) @c
				(#match? @c "^\\\\/\\\\/\\\\/"))+
		) @docComment`,
      ],
    ],
    rust: [
      [
        `((line_comment) @comment
			(#match? @comment "^///|^//!"))+ @docComment`,
      ],
    ],
    go: [['((comment)+) @docComment']],
    ruby: [['((comment)+) @docComment']],
    python: [
      [
        `(expression_statement
			(string) @docComment)`,
      ],
    ],
  },
  ye = {
    ...P(
      ['typescript', 'tsx'],
      [
        'program',
        'interface_declaration',
        'class_declaration',
        'function_declaration',
        'function',
        'type_alias_declaration',
        'method_definition',
      ]
    ),
    javascript: ['program', 'class_declaration', 'function_declaration', 'function', 'method_definition'],
    java: ['program', 'class_declaration', 'interface_declaration', 'method_declaration'],
    cpp: ['translation_unit', 'class_declaration', 'function_definition'],
    csharp: ['compilation_unit', 'class_declaration', 'interface_declaration', 'method_declaration'],
    python: ['module', 'class_definition', 'function_definition'],
    go: ['source_file', 'type_declaration', 'function_declaration', 'method_declaration'],
    ruby: ['program', 'method', 'class', 'method'],
    rust: ['source_file', 'function_item', 'impl_item', 'let_declaration'],
  },
  we = {
    typescript: [[I('typescript')]],
    tsx: [[I('tsx')]],
    javascript: [[I('javascript')]],
    java: [[I('java')]],
    cpp: [[I('cpp')]],
    csharp: [[I('csharp')]],
    python: [[I('python')]],
    go: [[I('go')]],
    ruby: [[I('ruby')]],
    rust: [[I('rust')]],
  },
  He = {
    ...P(
      ['typescript', 'tsx', 'javascript'],
      [
        'for_in_statement',
        'for_statement',
        'if_statement',
        'while_statement',
        'do_statement',
        'try_statement',
        'switch_statement',
      ]
    ),
    java: [
      'for_statement',
      'enhanced_for_statement',
      'if_statement',
      'while_statement',
      'do_statement',
      'try_statement',
      'switch_expression',
    ],
    cpp: [
      'for_statement',
      'for_range_loop',
      'if_statement',
      'while_statement',
      'do_statement',
      'try_statement',
      'switch_statement',
    ],
    csharp: [
      'for_statement',
      'for_each_statement',
      'if_statement',
      'while_statement',
      'do_statement',
      'try_statement',
      'switch_expression',
    ],
    python: ['for_statement', 'if_statement', 'while_statement', 'try_statement'],
    go: ['for_statement', 'if_statement', 'type_switch_statement'],
    ruby: ['while', 'for', 'if', 'case'],
    rust: ['for_statement', 'if_statement', 'while_statement', 'loop_statement', 'match_expression'],
  },
  qe = {
    ...P(['typescript', 'tsx'], ['lexical_declaration', 'expression_statement', 'public_field_definition']),
    javascript: ['call_expression', 'expression_statement', 'variable_declaration', 'public_field_definition'],
    java: ['expression_statement', 'local_variable_declaration', 'field_declaration'],
    cpp: ['field_declaration', 'expression_statement', 'declaration'],
    csharp: ['field_declaration', 'expression_statement'],
    python: ['expression_statement'],
    go: ['short_var_declaration', 'call_expression'],
    ruby: ['call', 'assignment'],
    rust: [
      'expression_statement',
      'let_declaration',
      'use_declaration',
      'assignment_expression',
      'macro_definition',
      'extern_crate_declaration',
    ],
  },
  We = {
    ...P(
      ['typescript', 'tsx'],
      [
        'class_declaration',
        'function_declaration',
        'generator_function_declaration',
        'interface_declaration',
        'internal_module',
        'method_definition',
      ]
    ),
    javascript: ['class_declaration', 'function_declaration', 'generator_function_declaration', 'method_definition'],
    java: [
      'class_declaration',
      'constructor_declaration',
      'enum_declaration',
      'interface_declaration',
      'method_declaration',
      'module_declaration',
    ],
    cpp: ['class_specifier', 'function_definition', 'namespace_definition', 'struct_specifier'],
    csharp: [
      'class_declaration',
      'constructor_declaration',
      'destructor_declaration',
      'enum_declaration',
      'interface_declaration',
      'method_declaration',
      'namespace_declaration',
      'struct_declaration',
    ],
    python: ['function_definition', 'class_definition'],
    go: ['function_declaration', 'method_declaration'],
    ruby: ['class', 'method', 'module'],
    rust: ['function_item', 'impl_item', 'mod_item', 'struct_item', 'trait_item', 'union_item'],
  },
  Ee = {
    typescript: [[x('typescript')]],
    tsx: [[x('tsx')]],
    javascript: [[x('javascript')]],
    java: [[x('java')]],
    cpp: [[x('cpp')]],
    csharp: [[x('csharp')]],
    python: [[x('python')]],
    go: [[x('go')]],
    rust: [[x('rust')]],
    ruby: [[x('ruby')]],
  }
function I(t) {
  return ye[y(t)].map(e => `(${e}) @scope`).join(`
`)
}
function x(t) {
  return `[
		${We[y(t)].map(n => `(${n})`).join(`
`)}
	] @definition`
}
function L(t, e) {
  return ye[y(t)].includes(e.type) || He[y(t)].includes(e.type)
}
function K(t, e) {
  return qe[y(t)].includes(e.type)
}
var Y = class {
  constructor() {
    this.loadedLanguagesCache = new Map()
  }
  loadLanguage(e) {
    return (
      this.loadedLanguagesCache.has(e) || this.loadedLanguagesCache.set(e, this._doLoadLanguage(e)),
      this.loadedLanguagesCache.get(e)
    )
  }
  _doLoadLanguage(e) {
    let r = `tree-sitter-${e === 'csharp' ? 'c-sharp' : e}.wasm`,
      s = U.basename(__dirname) === 'dist' ? U.resolve(__dirname, r) : U.resolve(__dirname, '../../../dist', r)
    return W.default.Language.load(s)
  }
}
function Ge(t) {
  return { tree: t, dispose: () => t.delete() }
}
var X = class t {
    static {
      this.CACHE_SIZE_PER_LANGUAGE = 5
    }
    constructor() {
      ;(this.caches = new Map()), (this.languageLoader = new Y()), (this._parser = null)
    }
    get parser() {
      return this._parser || (this._parser = new W.default()), this._parser
    }
    async parse(e, n) {
      await W.default.init()
      let r = this.getParseTreeCache(e),
        s = r.get(n)
      if (s) return s.tree
      let a = await this.languageLoader.loadLanguage(e)
      this.parser.setLanguage(a)
      let i = this.parser.parse(n)
      return r.put(n, Ge(i)), i
    }
    delete() {
      this._parser && (this.parser.delete(), (this._parser = null))
      for (let e of this.caches.values()) e.dispose()
    }
    getParseTreeCache(e) {
      let n = this.caches.get(e)
      return n || ((n = new H(t.CACHE_SIZE_PER_LANGUAGE)), this.caches.set(e, n)), n
    }
  },
  Te = new X()
function Ve() {
  Te.delete()
}
function E(t, e) {
  return Te.parse(y(t), e)
}
function R(t, e) {
  let n = []
  for (let r of t) {
    if (!r[1]) {
      let s = e.tree.getLanguage()
      r[1] = s.query(r[0])
    }
    n.push(...r[1].matches(e))
  }
  return n
}
function je(t, e) {
  let n = we[y(t)]
  return R(n, e)
}
function ee(t, e) {
  let n = ge[y(t)]
  return R(n, e)
}
function Qe(t, e) {
  let n = de[y(t)]
  return n ? R(n, e) : []
}
function ze(t, e) {
  let n = ce[y(t)]
  return n ? R(n, e) : []
}
function Je(t, e) {
  let n = me[y(t)]
  return n ? R(n, e) : []
}
function $e(t, e) {
  let n = pe[y(t)]
  return n ? R(n, e) : []
}
function Ke(t, e) {
  let n = fe[y(t)]
  return n ? R(n, e) : []
}
function Ye(t, e) {
  let n = Ee[y(t)]
  return R(n, e)
}
async function Xe(t, e, n) {
  let r = await E(t, e)
  return Qe(t, r.rootNode).reduce((i, o) => {
    let _ = o.captures.find(l => l.name === 'call_expression').node
    if (T.doIntersect(n, _)) {
      let l, d
      t === 'ruby' && ((d = o.captures.find(c => c.name === 'symbol')?.node), (l = d?.text?.slice(1))),
        (d ??= o.captures.find(c => c.name === 'identifier')?.node),
        (l ??= d?.text),
        i.push({ identifier: l ?? '', text: _.text, startIndex: (d ?? _).startIndex, endIndex: (d ?? _).endIndex })
    }
    return i
  }, [])
}
async function et(t, e) {
  let n = await E(t, e)
  return ee(t, n.rootNode).map(a => {
    let i = a.captures.find(_ => _.name === 'function').node
    return {
      identifier: a.captures.find(_ => _.name === 'identifier')?.node.text ?? '',
      text: i.text,
      startIndex: i.startIndex,
      endIndex: i.endIndex,
    }
  })
}
async function tt(t, e) {
  let n = await E(t, e)
  return ze(t, n.rootNode).map(a => {
    let i = a.captures.find(_ => _.name === 'class_declaration').node
    return {
      identifier:
        i?.children.find(_ => _.type === 'type_identifier' || _.type === 'identifier' || _.type === 'constant')?.text ??
        '',
      text: i.text,
      startIndex: i.startIndex,
      endIndex: i.endIndex,
    }
  })
}
async function nt(t, e) {
  let n = await E(t, e)
  return Je(t, n.rootNode).map(a => {
    let i = a.captures.find(_ => _.name === 'type_declaration').node,
      o = a.captures.find(_ => _.name === 'type_identifier')?.node.text
    return (
      o || (o = i?.children.find(_ => _.type === 'type_identifier')?.text),
      { identifier: o ?? '', text: i.text, startIndex: i.startIndex, endIndex: i.endIndex }
    )
  })
}
async function rt(t, e, n) {
  let r = await E(t, e)
  return $e(t, r.rootNode).reduce((i, o) => {
    let _ = o.captures.find(l => l.name === 'type_identifier').node
    return (
      T.doIntersect(n, _) &&
        i.push({ identifier: _.text, text: _.text, startIndex: _.startIndex, endIndex: _.endIndex }),
      i
    )
  }, [])
}
async function st(t, e, n) {
  let r = await E(t, e)
  return Ke(t, r.rootNode).reduce((i, o) => {
    let _ = o.captures.find(l => l.name === 'new_expression').node
    return (
      T.doIntersect(n, _) &&
        i.push({ identifier: _.text, text: _.text, startIndex: _.startIndex, endIndex: _.endIndex }),
      i
    )
  }, [])
}
async function at(t, e) {
  let n = await E(t, e),
    r = Ye(t, n.rootNode)
  return pt(t, r, n.rootNode)
}
async function it(t, e) {
  let n = await E(t, e)
  return ee(t, n.rootNode).map(a => {
    let i = a.captures.find(o => o.name === 'function').node
    return { startIndex: i.startIndex, endIndex: i.endIndex }
  })
}
async function ot(t, e) {
  let n = await E(t, e)
  return ee(t, n.rootNode).map(a => {
    let i = a.captures.find(o => o.name === 'body').node
    return { startIndex: i.startIndex, endIndex: i.endIndex }
  })
}
async function _t(t, e, n) {
  let r = await E(t, e),
    s = je(t, r.rootNode),
    a
  for (let i of s) {
    let o = i.captures[0].node,
      _ = A.ofSyntaxNode(o)
    if ((A.doesContain(_, n) && (a = o), S.isBefore(n.endPosition, _.startPosition))) break
  }
  if (a) return A.ofSyntaxNode(a)
  throw new Error('No parent node found')
}
async function lt(t, e, n, r) {
  let a = (await E(t, e)).rootNode.descendantForPosition(n.startPosition, n.endPosition),
    i = { startPosition: a.startPosition, endPosition: a.endPosition },
    o = xe(t, a, r, n, !0)
  return A.equals(i, o) ? Ie(t, a) : o
}
function Ie(t, e) {
  let n = e.parent,
    r = { startPosition: e.startPosition, endPosition: e.endPosition }
  if (L(t, e) || !n) return r
  let { filteredRanges: s, indexOfInterest: a } = Ne(t, n.children, r, !1)
  if (a - 1 >= 0 && a + 1 <= s.length - 1) {
    let i = s[a - 1],
      o = s[a + 1]
    return { startPosition: i.startPosition, endPosition: o.endPosition }
  }
  return Ie(t, n)
}
function xe(t, e, n, r, s) {
  let a = e.children
  if (e.endPosition.row - e.startPosition.row + 1 <= n) {
    let o = L(t, e) ? { startPosition: e.startPosition, endPosition: e.endPosition } : Se(t, a, n, r, s),
      _ = e.parent
    return _ ? xe(t, _, n, o, !1) : o
  }
  return Se(t, a, n, r, s)
}
function be(t, e) {
  return e.endPosition.row - t.startPosition.row + 1
}
function Se(t, e, n, r, s) {
  if (e.length === 0) return r
  let { filteredRanges: a, indexOfInterest: i } = Ne(t, e, r, s),
    o = 0,
    _ = a.length - 1,
    l = a[o],
    d = a[_]
  for (; be(l, d) > n && o !== _; ) i - o < _ - i ? (_--, (d = a[_])) : (o++, (l = a[o]))
  return be(l, d) <= n ? { startPosition: l.startPosition, endPosition: d.endPosition } : r
}
function Ne(t, e, n, r) {
  let s, a
  if (
    (r
      ? ((s = e.filter(i => L(t, i) || K(t, i))),
        (a = _e(s, n, (i, o) => S.isBefore(i.startPosition, o.startPosition))),
        s.splice(a, 0, n))
      : ((s = e.filter(i => A.doesContain(i, n) || L(t, i) || K(t, i))), (a = s.findIndex(i => A.doesContain(i, n)))),
    a === -1)
  )
    throw new Error('Valid index not found')
  return { filteredRanges: s, indexOfInterest: a }
}
function Pe(t, e, n) {
  let r = [t.rootNode],
    s = []
  for (;;) {
    let a = r
      .map(i => [i, T.intersectionSize(i, e)])
      .filter(([i, o]) => o > 0)
      .sort(([i, o], [_, l]) => l - o)
    if (a.length === 0) return s.length === 0 ? void 0 : le(s, ([i, o], [_, l]) => o - l)[0]
    {
      let i = a.map(([o, _]) => {
        let l = T.len(o),
          d = Math.abs(T.len(e) - _),
          h = (_ - d) / l
        return [o, h]
      })
      s.push(...i.filter(([o, _]) => te(o, n))), (r = []), r.push(...i.flatMap(([o, _]) => o.children))
    }
  }
}
async function ut(t, e, n) {
  if (!k(t)) return
  let s = (await E(t, e)).rootNode.descendantForIndex(n.startIndex, n.endIndex)
  if (s.type.match(/identifier/) && (s.parent === null || te(s.parent, t))) {
    let a = s.parent,
      i = a === null ? void 0 : { startIndex: a.startIndex, endIndex: a.endIndex }
    return { identifier: s.text, nodeRange: i }
  }
}
async function dt(t, e, n) {
  if (!k(t)) return
  let r = await E(t, e),
    a = n.startIndex === n.endIndex ? void 0 : Pe(r, n, t)
  if (a) return { nodeIdentifier: Me(a, t), nodeToDocument: J.ofSyntaxNode(a), nodeSelectionBy: 'matchingSelection' }
  let o = r.rootNode.descendantForIndex(n.startIndex, n.endIndex),
    _ = 0
  for (; !te(o, t) && o.parent !== null; ) (o = o.parent), ++_
  return { nodeIdentifier: Me(o, t), nodeToDocument: J.ofSyntaxNode(o), nodeSelectionBy: 'expanding' }
}
function Me(t, e) {
  switch (e) {
    case 'python':
    case 'csharp':
      return t.children.find(n => n.type.match(/identifier/))?.text
    case 'golang': {
      let n = t.children.find(s => s.type.match(/identifier/))
      return n
        ? n.text
        : t.children.find(s => s.type.match(/spec/))?.children.find(s => s.type.match(/identifier/))?.text
    }
    case 'javascript':
    case 'javascriptreact':
    case 'typescript':
    case 'typescriptreact':
    case 'cpp':
    case 'java': {
      let n = t.children.find(s => s.type.match(/identifier/))
      return n
        ? n.text
        : t.children.find(s => s.type.match(/declarator/))?.children.find(s => s.type.match(/identifier/))?.text
    }
    case 'ruby':
      return t.children.find(n => n.type.match(/constant|identifier/))?.text
    default:
      return t.children.find(n => n.type.match(/identifier/))?.text
  }
}
function te(t, e) {
  switch (e) {
    case 'typescript':
    case 'typescriptreact':
    case 'javascript':
    case 'javascriptreact':
      return t.type.match(/definition|declaration|declarator|export_statement/)
    case 'golang':
      return t.type.match(/definition|declaration|declarator|var_spec/)
    case 'cpp':
      return t.type.match(/definition|declaration|declarator|class_specifier/)
    case 'ruby':
      return t.type.match(/module|class|method|assignment/)
    default:
      return t.type.match(/definition|declaration|declarator/)
  }
}
async function ct(t, e) {
  if (!new Set(['javascript', 'typescript', 'java', 'cpp', 'csharp', 'go', 'ruby']).has(t) || !k(t)) return
  let r = await E(t, e),
    s = he[y(t)],
    a = R(s, r.rootNode).flatMap(o => o.captures.filter(_ => _.name === 'docComment')),
    i = mt(a)
  if (
    (i.length > 1 &&
      (i = i.filter(
        o =>
          o.includes(`
`) || !o.match(/(code implementation|implementation details)/i)
      )),
    i.length === 1)
  )
    return i[0]
}
function mt(t) {
  let e = []
  for (let n = 0; n < t.length; ++n) {
    let r = [t[n].node.text]
    for (; n + 1 < t.length && t[n].node.endPosition.row + 1 === t[n + 1].node.startPosition.row; )
      ++n, r.push(t[n].node.text)
    e.push(
      r.join(`
`)
    )
  }
  return e
}
function pt(t, e, n) {
  let r = y(t),
    s
  switch (r) {
    case 'python':
      s = yt(e)
      break
    case 'ruby':
      s = ht(e)
      break
    default: {
      s = ft(e, r)
      break
    }
  }
  return new q(s, M.ofSyntaxNode(n))
}
function ft(t, e) {
  let n = new Map()
  return (
    t.forEach(r => {
      let a = r.captures.find(o => o.name === 'definition')?.node,
        i = a?.childForFieldName('body')
      if (a && i) {
        let o
        switch (e) {
          case 'typescript':
          case 'javascript':
            o = wt(a)
            break
          case 'java':
          case 'rust':
            o = Et(a)
            break
          default: {
            o = B(a)
            break
          }
        }
        n.get(a.id) ||
          n.set(a.id, {
            mainBlock: M.ofSyntaxNode(a),
            detailBlocks: { comments: o.map(l => M.ofSyntaxNode(l)), body: M.ofSyntaxNode(i) },
          })
      }
    }),
    Array.from(n.values())
  )
}
function gt(t) {
  if (!(t.length < 2))
    for (let e = 1; e < t.length; e++) {
      let n = t[e]
      if (!n.type.includes('parameters')) return n
    }
}
function ht(t) {
  let e = new Map()
  return (
    t.forEach(n => {
      let s = n.captures.find(a => a.name === 'definition')?.node
      if (s) {
        let a = s.namedChildren,
          i = gt(a)
        if (i) {
          let o = a[a.length - 1],
            _ = s.text.substring(i.startIndex - s.startIndex, o.endIndex - s.startIndex),
            l = B(s)
          e.get(s.id) ||
            e.set(s.id, {
              mainBlock: M.ofSyntaxNode(s),
              detailBlocks: {
                comments: l.map(c => M.ofSyntaxNode(c)),
                body: {
                  range: {
                    startPosition: { row: i.startPosition.row, column: i.startPosition.column },
                    endPosition: { row: o.endPosition.row, column: o.endPosition.column },
                  },
                  startIndex: i.startIndex,
                  text: _,
                  endIndex: o.endIndex,
                },
              },
            })
        }
      }
    }),
    Array.from(e.values())
  )
}
function yt(t) {
  let e = new Map()
  return (
    t.forEach(n => {
      let s = n.captures.find(i => i.name === 'definition')?.node,
        a = s?.childForFieldName('body')
      if (s && a) {
        let i = St(a),
          o = bt(s)
        e.set(s.id, {
          mainBlock: M.ofSyntaxNode(s),
          detailBlocks: {
            docstring: i ? M.ofSyntaxNode(i) : void 0,
            decorator: o ? M.ofSyntaxNode(o) : void 0,
            body: M.ofSyntaxNode(a),
          },
        })
        return
      }
    }),
    Array.from(e.values())
  )
}
function B(t, e = ['comment']) {
  let n = [],
    r = t.previousNamedSibling
  for (; r && e.some(s => s === r?.type); ) n.push(r), (r = r.previousNamedSibling)
  return n.reverse()
}
function wt(t) {
  let e = t.parent
  return e?.type === 'export_statement' ? B(e) : B(t)
}
function Et(t) {
  return B(t, ['block_comment', 'line_comment'])
}
function bt(t) {
  let e = t.previousNamedSibling
  return e?.type === 'decorator' ? e : void 0
}
function St(t) {
  let e = t.firstChild
  if (!e || e.type !== 'expression_statement') return
  let n = e.firstChild
  return n?.type === 'string' ? n : void 0
}
function Mt() {
  let t = Re.parentPort
  if (!t) throw new Error('This module should only be used in a worker thread.')
  t.on('message', async ({ id: e, fn: n, args: r }) => {
    try {
      let s = await ne[n](...r)
      t.postMessage({ id: e, res: s })
    } catch (s) {
      t.postMessage({ id: e, err: s })
    }
  })
}
Mt()
