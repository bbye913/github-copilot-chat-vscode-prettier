var extensionExports = {}
defineProperties(extensionExports, { activate: () => activateExtension, createExtensionContext: () => createContext, onDeactivate: () => deactivateExtension })
module.exports = handleEsModuleExports(extensionExports)
var Bx = handleDefaultExports(requestLight())
i$().install()
var vscode = require('vscode')
var events = require('events')
class ErrorHandler {
  constructor() {
    this.listeners = []
    this.unexpectedErrorHandler = function (error) {
      setTimeout(() => {
        if (error.stack) {
          throw CodeExpectedError.isErrorNoTelemetry(error)
            ? new CodeExpectedError(error.message + '\n' + error.stack)
            : new Error(error.message + '\n' + error.stack)
        } else {
          throw error
        }
      }, 0)
    }
  }

  addListener(listener) {
    this.listeners.push(listener)
    return () => {
      this._removeListener(listener)
    }
  }

  emit(error) {
    this.listeners.forEach(listener => {
      listener(error)
    })
  }

  _removeListener(listener) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  setUnexpectedErrorHandler(handler) {
    this.unexpectedErrorHandler = handler
  }

  getUnexpectedErrorHandler() {
    return this.unexpectedErrorHandler
  }

  onUnexpectedError(error) {
    this.unexpectedErrorHandler(error)
    this.emit(error)
  }

  onUnexpectedExternalError(error) {
    this.unexpectedErrorHandler(error)
  }
}
var errorHandler = new ErrorHandler()
function handleUnexpectedError(error) {
  if (!isCancellationError(error)) {
    errorHandler.onUnexpectedError(error)
  }
}
var cancellationMessage = 'Canceled'
function isCancellationError(error) {
  return error instanceof CancellationError ? true : error instanceof Error && error.name === cancellationMessage && error.message === cancellationMessage
}
class CancellationError extends Error {
  constructor() {
    super(cancellationMessage)
    this.name = this.message
  }
}
function throwIllegalArgumentError(argument) {
  return argument ? new Error(`Illegal argument: ${argument}`) : new Error('Illegal argument')
}
class CodeExpectedError extends Error {
  constructor(message) {
    super(message)
    this.name = 'CodeExpectedError'
  }
  static fromError(error) {
    if (error instanceof CodeExpectedError) return error
    let newError = new CodeExpectedError()
    newError.message = error.message
    newError.stack = error.stack
    return newError
  }
  static isErrorNoTelemetry(error) {
    return error.name === 'CodeExpectedError'
  }
}

function binarySearch(array, predicate, start = 0, end = array.length) {
  let low = start,
    high = end
  while (low < high) {
    let mid = Math.floor((low + high) / 2)
    predicate(array[mid]) ? (low = mid + 1) : (high = mid)
  }
  return low - 1
}

class MonotonousArray {
  constructor(array) {
    this._array = array
    this._lastMonotonousIndex = 0
  }
  static {
    this.checkInvariants = false
  }
  findLastMonotonous(predicate) {
    if (MonotonousArray.checkInvariants) {
      if (this._previousPredicate) {
        for (let item of this._array)
          if (this._previousPredicate(item) && !predicate(item))
            throw new Error(
              'MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.'
            )
      }
      this._previousPredicate = predicate
    }
    let index = binarySearch(this._array, predicate, this._lastMonotonousIndex)
    this._lastMonotonousIndex = index + 1
    return index === -1 ? undefined : this._array[index]
  }
}
function filterTruthyValues(array) {
  return array.filter(item => !!item)
}
function shuffleArray(array, seed) {
  let random
  if (typeof seed == 'number') {
    let count = seed
    random = () => {
      let value = Math.sin(count++) * 179426549
      return value - Math.floor(value)
    }
  } else random = Math.random
  for (let i = array.length - 1; i > 0; i -= 1) {
    let j = Math.floor(random() * (i + 1)),
      temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}
var comparison
;(comparisonFunctions => {
  function isLessThan(value) {
    return value < 0
  }
  comparisonFunctions.isLessThan = isLessThan
  function isLessThanOrEqual(value) {
    return value <= 0
  }
  comparisonFunctions.isLessThanOrEqual = isLessThanOrEqual
  function isGreaterThan(value) {
    return value > 0
  }
  comparisonFunctions.isGreaterThan = isGreaterThan
  function isNeitherLessOrGreaterThan(value) {
    return value === 0
  }
  comparisonFunctions.isNeitherLessOrGreaterThan = isNeitherLessOrGreaterThan
  comparisonFunctions.greaterThan = 1
  comparisonFunctions.lessThan = -1
  comparisonFunctions.neitherLessOrGreaterThan = 0
})((comparison ||= {}))

function createComparator(transform, compare) {
  return (a, b) => compare(transform(a), transform(b))
}

var subtract = (a, b) => a - b

class Iterable {
  constructor(iterate) {
    this.iterate = iterate
  }
  static {
    this.empty = new Iterable(() => {})
  }
  forEach(action) {
    this.iterate(item => {
      action(item)
      return true
    })
  }
  toArray() {
    let array = []
    this.iterate(item => {
      array.push(item)
      return true
    })
    return array
  }
  filter(predicate) {
    return new Iterable(callback => this.iterate(item => (predicate(item) ? callback(item) : true)))
  }
  map(transform) {
    return new Iterable(callback => this.iterate(item => callback(transform(item))))
  }
  some(predicate) {
    let found = false
    this.iterate(item => {
      found = predicate(item)
      return !found
    })
    return found
  }
  findFirst(predicate) {
    let found
    this.iterate(item => {
      if (predicate(item)) {
        found = item
        return false
      }
      return true
    })
    return found
  }
  findLast(predicate) {
    let found
    this.iterate(item => {
      if (predicate(item)) {
        found = item
      }
      return true
    })
    return found
  }
  findLastMaxBy(compare) {
    let maxItem,
      isFirst = true
    this.iterate(item => {
      if (isFirst || comparison.isGreaterThan(compare(item, maxItem))) {
        isFirst = false
        maxItem = item
      }
      return true
    })
    return maxItem
  }
}

function groupBy(array, keySelector) {
  let groups = Object.create(null)
  for (let item of array) {
    let key = keySelector(item),
      group = groups[key]
    if (!group) {
      group = groups[key] = []
    }
    group.push(item)
  }
  return groups
}

class Resource {
  constructor(uri, value) {
    this.uri = uri
    this.value = value
  }
}

function isArray(variable) {
  return Array.isArray(variable)
}

var toStringTagSymbol
var ResourceMap = class {
  constructor(keySelectorOrMap, keySelector) {
    this[toStringTagSymbol] = 'ResourceMap'
    if (keySelectorOrMap instanceof ResourceMap) {
      this.map = new Map(keySelectorOrMap.map)
      this.toKey = keySelector ?? ResourceMap.defaultToKey
    } else if (isArray(keySelectorOrMap)) {
      this.map = new Map()
      this.toKey = keySelector ?? ResourceMap.defaultToKey
      for (let [key, value] of keySelectorOrMap) {
        this.set(key, value)
      }
    } else {
      this.map = new Map()
      this.toKey = keySelectorOrMap ?? ResourceMap.defaultToKey
    }
  }

  static {
    this.defaultToKey = key => key.toString()
  }
  set(key, value) {
    return this.map.set(this.toKey(key), new Resource(key, value)), this
  }
  get(key) {
    return this.map.get(this.toKey(key))?.value
  }
  has(key) {
    return this.map.has(this.toKey(key))
  }
  get size() {
    return this.map.size
  }
  clear() {
    this.map.clear()
  }
  delete(key) {
    return this.map.delete(this.toKey(key))
  }
  forEach(callback, thisArg) {
    if (typeof thisArg !== 'undefined') {
      callback = callback.bind(thisArg)
    }
    for (let [key, resource] of this.map) {
      callback(resource.value, resource.uri, this)
    }
  }
  *values() {
    for (let resource of this.map.values()) {
      yield resource.value
    }
  }
  *keys() {
    for (let resource of this.map.values()) {
      yield resource.uri
    }
  }
  *entries() {
    for (let resource of this.map.values()) {
      yield [resource.uri, resource.value]
    }
  }
  *[((toStringTagSymbol = Symbol.toStringTag), Symbol.iterator)]() {
    for (let [, resource] of this.map) {
      yield [resource.uri, resource.value]
    }
  }
}
var toStringTagSymbol
var ResourceSet = class {
constructor(keySelectorOrSet, keySelector) {
  this[toStringTagSymbol] = 'ResourceSet'
  if (!keySelectorOrSet || typeof keySelectorOrSet == 'function') {
    this._map = new ResourceMap(keySelectorOrSet)
  } else {
    this._map = new ResourceMap(keySelector)
    keySelectorOrSet.forEach(this.add, this)
  }
}
get size() {
  return this._map.size
}
add(resource) {
  return this._map.set(resource, resource), this
}
clear() {
  this._map.clear()
}
delete(resource) {
  return this._map.delete(resource)
}
forEach(callback, thisArg) {
  this._map.forEach((value, key) => callback.call(thisArg, key, key, this))
}
has(resource) {
  return this._map.has(resource)
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
[((toStringTagSymbol = Symbol.toStringTag), Symbol.iterator)]() {
  return this.keys()
}
}
var toStringTagSymbol
var LinkedMap = class {
  constructor() {
    this[toStringTagSymbol] = 'LinkedMap'
    this._map = new Map()
    this._head = undefined
    this._tail = undefined
    this._size = 0
    this._state = 0
  }
  clear() {
    this._map.clear()
    this._head = undefined
    this._tail = undefined
    this._size = 0
    this._state++
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
  has(key) {
    return this._map.has(key)
  }
  get(key, touch = 0) {
    let node = this._map.get(key)
    if (node) {
      if (touch !== 0) {
        this.touch(node, touch)
      }
      return node.value
    }
  }
  set(key, value, touch = 0) {
    let node = this._map.get(key)
    if (node) {
      node.value = value
      if (touch !== 0) {
        this.touch(node, touch)
      }
    } else {
      node = { key: key, value: value, next: undefined, previous: undefined }
      switch (touch) {
        case 0:
          this.addItemLast(node)
          break
        case 1:
          this.addItemFirst(node)
          break
        case 2:
          this.addItemLast(node)
          break
        default:
          this.addItemLast(node)
          break
      }
      this._map.set(key, node)
      this._size++
    }
    return this
  }
  delete(key) {
    return !!this.remove(key)
  }
  remove(key) {
    let node = this._map.get(key)
    if (node) {
      this._map.delete(key)
      this.removeItem(node)
      this._size--
      return node.value
    }
  }
  shift() {
    if (!this._head && !this._tail) return
    if (!this._head || !this._tail) throw new Error('Invalid list')
    let node = this._head
    this._map.delete(node.key)
    this.removeItem(node)
    this._size--
    return node.value
  }
  forEach(callback, thisArg) {
    let state = this._state
    let node = this._head
    while (node) {
      if (thisArg) {
        callback.bind(thisArg)(node.value, node.key, this)
      } else {
        callback(node.value, node.key, this)
      }
      if (this._state !== state) {
        throw new Error('LinkedMap got modified during iteration.')
      }
      node = node.next
    }
  }
  keys() {
    let linkedMap = this
    let state = this._state
    let node = this._head
    let iterator = {
      [Symbol.iterator]() {
        return iterator
      },
      next() {
        if (linkedMap._state !== state) {
          throw new Error('LinkedMap got modified during iteration.')
        }
        if (node) {
          let result = { value: node.key, done: false }
          node = node.next
          return result
        } else {
          return { value: undefined, done: true }
        }
      },
    }
    return iterator
  }
  values() {
    let linkedMap = this
    let state = this._state
    let node = this._head
    let iterator = {
      [Symbol.iterator]() {
        return iterator
      },
      next() {
        if (linkedMap._state !== state) {
          throw new Error('LinkedMap got modified during iteration.')
        }
        if (node) {
          let result = { value: node.value, done: false }
          node = node.next
          return result
        } else {
          return { value: undefined, done: true }
        }
      },
    }
    return iterator
  }
  entries() {
    let linkedMap = this
    let state = this._state
    let node = this._head
    let iterator = {
      [Symbol.iterator]() {
        return iterator
      },
      next() {
        if (linkedMap._state !== state) {
          throw new Error('LinkedMap got modified during iteration.')
        }
        if (node) {
          let result = { value: [node.key, node.value], done: false }
          node = node.next
          return result
        } else {
          return { value: undefined, done: true }
        }
      },
    }
    return iterator
  }
  [((toStringTagSymbol = Symbol.toStringTag), Symbol.iterator)]() {
    return this.entries()
  }

  trimOld(maxSize) {
    if (maxSize >= this.size) return
    if (maxSize === 0) {
      this.clear()
      return
    }
    let currentNode = this._head,
      currentSize = this.size
    for (; currentNode && currentSize > maxSize; ) {
      this._map.delete(currentNode.key), (currentNode = currentNode.next), currentSize--
    }
    this._head = currentNode
    this._size = currentSize
    if (currentNode) {
      currentNode.previous = undefined
    }
    this._state++
  }


  addItemFirst(item) {
    if (!this._head && !this._tail) {
      this._tail = item
    } else if (this._head) {
      item.next = this._head
      this._head.previous = item
    } else {
      throw new Error('Invalid list')
    }
    this._head = item
    this._state++
  }

  addItemLast(item) {
    if (!this._head && !this._tail) {
      this._head = item
    } else if (this._tail) {
      item.previous = this._tail
      this._tail.next = item
    } else {
      throw new Error('Invalid list')
    }
    this._tail = item
    this._state++
  }

  removeItem(item) {
    if (item === this._head && item === this._tail) {
      this._head = undefined
      this._tail = undefined
    } else if (item === this._head) {
      if (!item.next) throw new Error('Invalid list')
      item.next.previous = undefined
      this._head = item.next
    } else if (item === this._tail) {
      if (!item.previous) throw new Error('Invalid list')
      item.previous.next = undefined
      this._tail = item.previous
    } else {
      let nextNode = item.next,
        previousNode = item.previous
      if (!nextNode || !previousNode) throw new Error('Invalid list')
      nextNode.previous = previousNode
      previousNode.next = nextNode
    }
    item.next = undefined
    item.previous = undefined
    this._state++
  }

  touch(item, touchType) {
    if (!this._head || !this._tail) throw new Error('Invalid list')
    if (touchType === 1 || touchType === 2) {
      if (touchType === 1) {
        if (item === this._head) return
        let nextNode = item.next,
          previousNode = item.previous
        if (item === this._tail) {
          previousNode.next = undefined
          this._tail = previousNode
        } else {
          nextNode.previous = previousNode
          previousNode.next = nextNode
        }
        item.previous = undefined
        item.next = this._head
        this._head.previous = item
        this._head = item
        this._state++
      } else if (touchType === 2) {
        if (item === this._tail) return
        let nextNode = item.next,
          previousNode = item.previous
        if (item === this._head) {
          nextNode.previous = undefined
          this._head = nextNode
        } else {
          nextNode.previous = previousNode
          previousNode.next = nextNode
        }
        item.next = undefined
        item.previous = this._tail
        this._tail.next = item
        this._tail = item
        this._state++
      }
    }
  }

  toJSON() {
    let json = []
    this.forEach((value, key) => {
      json.push([key, value])
    })
    return json
  }

  fromJSON(json) {
    this.clear()
    for (let [key, value] of json) {
      this.set(key, value)
    }
  }
}
class LimitedLinkedMap extends LinkedMap {
  constructor(limit, ratio = 1) {
    super()
    this._limit = limit
    this._ratio = Math.min(Math.max(0, ratio), 1)
  }
  get limit() {
    return this._limit
  }
  set limit(value) {
    this._limit = value
    this.checkTrim()
  }
  get ratio() {
    return this._ratio
  }
  set ratio(value) {
    this._ratio = Math.min(Math.max(0, value), 1)
    this.checkTrim()
  }
  get(key, touchType = 2) {
    return super.get(key, touchType)
  }
  peek(key) {
    return super.get(key, 0)
  }
  set(key, value) {
    super.set(key, value, 2)
    this.checkTrim()
    return this
  }
  checkTrim() {
    if (this.size > this._limit) {
      this.trimOld(Math.round(this._limit * this._ratio))
    }
  }
}
class MultiMap {
  constructor() {
    this.map = new Map()
  }
  add(key, value) {
    let set = this.map.get(key)
    if (!set) {
      set = new Set()
      this.map.set(key, set)
    }
    set.add(value)
  }
  delete(key, value) {
    let set = this.map.get(key)
    if (set) {
      set.delete(value)
      if (set.size === 0) {
        this.map.delete(key)
      }
    }
  }
  forEach(key, callback) {
    let set = this.map.get(key)
    if (set) {
      set.forEach(callback)
    }
  }
  get(key) {
    let set = this.map.get(key)
    return set || new Set()
  }
}
function once(fn, cleanup) {
  let context = this,
    hasRun = false,
    result
  return function () {
    if (hasRun) return result
    hasRun = true
    if (cleanup) {
      try {
        result = fn.apply(context, arguments)
      } finally {
        cleanup()
      }
    } else {
      result = fn.apply(context, arguments)
    }
    return result
  }
}
var iterableUtils
;(utils => {
  function isIterable(item) {
    return item && typeof item == 'object' && typeof item[Symbol.iterator] == 'function'
  }
  utils.is = isIterable

  let emptyArray = Object.freeze([])
  function empty() {
    return emptyArray
  }
  utils.empty = empty

  function* single(item) {
    yield item
  }
  utils.single = single

  function wrap(item) {
    return isIterable(item) ? item : single(item)
  }
  utils.wrap = wrap

  function from(item) {
    return item || emptyArray
  }
  utils.from = from

  function* reverse(array) {
    for (let i = array.length - 1; i >= 0; i--) yield array[i]
  }
  utils.reverse = reverse

  function isEmpty(item) {
    return !item || item[Symbol.iterator]().next().done === true
  }
  utils.isEmpty = isEmpty

  function first(item) {
    return item[Symbol.iterator]().next().value
  }
  utils.first = first
  function some(array, predicate) {
    for (let item of array) if (predicate(item)) return true
    return false
  }
  utils.some = some

  function find(array, predicate) {
    for (let item of array) if (predicate(item)) return item
  }
  utils.find = find

  function* filter(array, predicate) {
    for (let item of array) if (predicate(item)) yield item
  }
  utils.filter = filter

  function* map(array, transform) {
    let index = 0
    for (let item of array) yield transform(item, index++)
  }
  utils.map = map

  function* concat(...arrays) {
    for (let array of arrays) yield* array
  }
  utils.concat = concat

  function reduce(array, reducer, initialValue) {
    let result = initialValue
    for (let item of array) result = reducer(result, item)
    return result
  }
  utils.reduce = reduce

  function* slice(array, start, end = array.length) {
    for (start < 0 && (start += array.length), end < 0 ? (end += array.length) : end > array.length && (end = array.length); start < end; start++) yield array[start]
  }
  utils.slice = slice

  function consume(array, count = Number.POSITIVE_INFINITY) {
    let result = []
    if (count === 0) return [result, array]
    let iterator = array[Symbol.iterator]()
    for (let i = 0; i < count; i++) {
      let next = iterator.next()
      if (next.done) return [result, utils.empty()]
      result.push(next.value)
    }
    return [
      result,
      {
        [Symbol.iterator]() {
          return iterator
        },
      },
    ]
  }
  utils.consume = consume
})((iterableUtils ||= {}))
let isInitialized = false;
let globalTracker = null;

class DisposableTracker {
  constructor() {
      this.livingDisposables = new Map();
      this.idx = 0;
  }

  getDisposableData(disposable) {
      let data = this.livingDisposables.get(disposable);
      if (!data) {
          data = { parent: null, source: null, isSingleton: false, value: disposable, idx: this.idx++ };
          this.livingDisposables.set(disposable, data);
      }
      return data;
  }

  trackDisposable(disposable) {
      let data = this.getDisposableData(disposable);
      if (!data.source) {
          data.source = new Error().stack;
      }
  }

  setParent(disposable, parent) {
      let data = this.getDisposableData(disposable);
      data.parent = parent;
  }

  markAsDisposed(disposable) {
      this.livingDisposables.delete(disposable);
  }

  markAsSingleton(disposable) {
      this.getDisposableData(disposable).isSingleton = true;
  }

  getRootParent(data, cache) {
      let root = cache.get(data);
      if (root) {
          return root;
      }
      root = data.parent ? this.getRootParent(this.getDisposableData(data.parent), cache) : data;
      cache.set(data, root);
      return root;
  }

  getTrackedDisposables() {
      let rootCache = new Map();
      return [...this.livingDisposables.entries()]
          .filter(([, data]) => data.source !== null && !this.getRootParent(data, rootCache).isSingleton)
          .flatMap(([disposable]) => disposable);
  }
  computeLeakingDisposables(maxLeaks = 10, disposables) {
    let leaks;
    if (disposables) {
        leaks = disposables;
    } else {
        let rootCache = new Map();
        let candidates = [...this.livingDisposables.values()].filter(
            data => data.source !== null && !this.getRootParent(data, rootCache).isSingleton
        );
        if (candidates.length === 0) {
            return;
        }
        let candidateSet = new Set(candidates.map(data => data.value));
        leaks = candidates.filter(data => !(data.parent && candidateSet.has(data.parent)));
        if (leaks.length === 0) {
            throw new Error('There are cyclic disposable chains!');
        }
    }
    if (!leaks) {
        return;
    }

    function getStackTrace(data) {
        function removeUnwantedLines(lines, unwantedLines) {
            while (lines.length > 0 && unwantedLines.some(unwanted => (typeof unwanted == 'string' ? unwanted === lines[0] : lines[0].match(unwanted)))) {
                lines.shift();
            }
        }
        let stackTrace = data.source
            .split('\n')
            .map(line => line.trim().replace('at ', ''))
            .filter(line => line !== '');
        removeUnwantedLines(stackTrace, ['Error', /^trackDisposable \(.*\)$/, /^DisposableTracker.trackDisposable \(.*\)$/]);
        return stackTrace.reverse();
    }

    let stackTraceMap = new MultiMap();
    for (let leak of leaks) {
        let stackTrace = getStackTrace(leak);
        for (let i = 0; i <= stackTrace.length; i++) {
            stackTraceMap.add(stackTrace.slice(0, i).join('\n'), leak);
        }
    }

    leaks.sort(createComparator(leak => leak.idx, subtract));

    let details = '';
    let count = 0;
    for (let leak of leaks.slice(0, maxLeaks)) {
        count++;
        let stackTrace = getStackTrace(leak);
        let lines = [];
        for (let i = 0; i < stackTrace.length; i++) {
            let line = stackTrace[i];
            line = `(shared with ${stackTraceMap.get(stackTrace.slice(0, i + 1).join('\n')).size}/${leaks.length} leaks) at ${line}`;
            let others = stackTraceMap.get(stackTrace.slice(0, i).join('\n'));
            let groupedOthers = groupBy([...others].map(other => getStackTrace(other)[i]), line => line);
            delete groupedOthers[stackTrace[i]];
            for (let [otherLine, otherLeaks] of Object.entries(groupedOthers)) {
                lines.unshift(`    - stacktraces of ${otherLeaks.length} other leaks continue with ${otherLine}`);
            }
            lines.unshift(line);
        }
        details += `

==================== Leaking disposable ${count}/${leaks.length}: ${leak.value.constructor.name} ====================
${lines.join('\n')}
============================================================

`;
    }

    if (leaks.length > maxLeaks) {
        details += `

... and ${leaks.length - maxLeaks} more leaking disposables

`;
    }

    return { leaks: leaks, details: details };
  }
}

function setGlobalTracker(tracker) {
  globalTracker = tracker;
}

if (isInitialized) {
  let trackingKey = '__is_disposable_tracked__';
  setGlobalTracker(
    new (class {
      trackDisposable(disposable) {
        let stackTrace = new Error('Potentially leaked disposable').stack;
        setTimeout(() => {
          if (!disposable[trackingKey]) {
            console.log(stackTrace);
          }
        }, 3000);
      }
      setParent(disposable, parent) {
        if (disposable && disposable !== Disposable.None) {
          try {
            disposable[trackingKey] = true;
          } catch {}
        }
      }
      markAsDisposed(disposable) {
        if (disposable && disposable !== Disposable.None) {
          try {
            disposable[trackingKey] = true;
          } catch {}
        }
      }
      markAsSingleton(disposable) {}
    })()
  );
}

function trackDisposable(disposable) {
  globalTracker?.trackDisposable(disposable);
  return disposable;
}

function markAsDisposed(disposable) {
  globalTracker?.markAsDisposed(disposable);
}

function setParent(disposable, parent) {
  globalTracker?.setParent(disposable, parent);
}

function setParentForAll(disposables, parent) {
  if (globalTracker) {
    for (let disposable of disposables) {
      globalTracker.setParent(disposable, parent);
    }
  }
}

function dispose(disposable) {
  if (iterableUtils.is(disposable)) {
    let errors = [];
    for (let item of disposable) {
      if (item) {
        try {
          item.dispose();
        } catch (error) {
          errors.push(error);
        }
      }
    }
    if (errors.length === 1) {
      throw errors[0];
    }
    if (errors.length > 1) {
      throw new AggregateError(errors, 'Encountered errors while disposing of store');
    }
    return Array.isArray(disposable) ? [] : disposable;
  } else if (disposable) {
    disposable.dispose();
    return disposable;
  }
}

function disposeAll(...disposables) {
  let disposable = createDisposable(() => dispose(disposables));
  setParentForAll(disposables, disposable);
  return disposable;
}

function createDisposable(disposeFunction) {
  let disposable = trackDisposable({
    dispose: once(() => {
      markAsDisposed(disposable);
      disposeFunction();
    }),
  });
  return disposable;
}

var DisposableStore = class {
  constructor() {
    this._toDispose = new Set()
    this._isDisposed = false
    trackDisposable(this)
  }
  static {
    this.DISABLE_DISPOSED_WARNING = false
  }
  dispose() {
    if (!this._isDisposed) {
      markAsDisposed(this)
      this._isDisposed = true
      this.clear()
    }
  }
  get isDisposed() {
    return this._isDisposed
  }
  clear() {
    if (this._toDispose.size !== 0) {
      try {
        dispose(this._toDispose)
      } finally {
        this._toDispose.clear()
      }
    }
  }
  add(disposable) {
    if (!disposable) return disposable
    if (disposable === this) throw new Error('Cannot register a disposable on itself!')
    setParent(disposable, this)
    if (this._isDisposed) {
      if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
        console.warn(
          new Error(
            'Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!'
          ).stack
        )
      }
    } else {
      this._toDispose.add(disposable)
    }
    return disposable
  }
  delete(disposable) {
    if (disposable) {
      if (disposable === this) throw new Error('Cannot dispose a disposable on itself!')
      this._toDispose.delete(disposable)
      disposable.dispose()
    }
  }
  deleteAndLeak(disposable) {
    if (disposable && this._toDispose.has(disposable)) {
      this._toDispose.delete(disposable)
      setParent(disposable, null)
    }
  }
}

var Disposable = class {
  constructor() {
    this._store = new DisposableStore()
    trackDisposable(this)
    setParent(this._store, this)
  }
  static {
    this.None = Object.freeze({ dispose() {} })
  }
  dispose() {
    markAsDisposed(this)
    this._store.dispose()
  }
  _register(disposable) {
    if (disposable === this) throw new Error('Cannot register a disposable on itself!')
    return this._store.add(disposable)
  }
}

var DisposableMap = class {
  constructor() {
    this._store = new Map()
    this._isDisposed = false
    trackDisposable(this)
  }
  dispose() {
    markAsDisposed(this)
    this._isDisposed = true
    this.clearAndDisposeAll()
  }
  clearAndDisposeAll() {
    if (this._store.size) {
      try {
        dispose(this._store.values())
      } finally {
        this._store.clear()
      }
    }
  }
  has(key) {
    return this._store.has(key)
  }
  get size() {
    return this._store.size
  }
  get(key) {
    return this._store.get(key)
  }
  set(key, value, doNotDispose = false) {
    if (this._isDisposed) {
      console.warn(
        new Error(
          'Trying to add a disposable to a DisposableMap that has already been disposed of. The added object will be leaked!'
        ).stack
      )
    }
    if (!doNotDispose) {
      this._store.get(key)?.dispose()
    }
    this._store.set(key, value)
  }
  deleteAndDispose(key) {
    this._store.get(key)?.dispose()
    this._store.delete(key)
  }
  keys() {
    return this._store.keys()
  }
  values() {
    return this._store.values()
  }
  [Symbol.iterator]() {
    return this._store[Symbol.iterator]()
  }
}

var packageInfo = getPackageInfo()
var isDevBuild = packageInfo.buildType !== 'dev'
var isPreRelease = packageInfo.isPreRelease || !isDevBuild

function isString(value) {
  return typeof value == 'string'
}

function isStringArray(value) {
  return Array.isArray(value) && value.every(e => isString(e))
}

function isPlainObject(value) {
  return typeof value == 'object' && value !== null && !Array.isArray(value) && !(value instanceof RegExp) && !(value instanceof Date)
}

var extensionId = 'github.copilot'

var ConfigManager = class {
  getConfigMixedWithDefaults(setting) {
    if (this.isDefaultSettingOverwritten(setting)) {
      let configValue = this.getConfig(setting)
      return isPlainObject(configValue) && isPlainObject(setting.defaultValue) ? { ...setting.defaultValue, ...configValue } : configValue
    }
    return setting.defaultValue
  }
}

var defaultValuesCache

function getDefaultValues() {
  if (!defaultValuesCache) {
    defaultValuesCache = new Map()
    let settings = config.contributes.configuration.properties
    for (let key of Object.keys(settings)) typeof settings[key].default < 'u' && defaultValuesCache.set(key, settings[key].default)
  }
  return defaultValuesCache
}

function validateAndFormatSetting(settingId, defaultValue) {
  let actualDefaultValue = getDefaultValues().get(`${extensionId}.${settingId}`)
  if (typeof actualDefaultValue < 'u' && defaultValue !== actualDefaultValue)
    throw new Error(`The default value for setting ${settingId} is different in package.json and in code`)
  let dotIndex = settingId.indexOf('.'),
    prefix = settingId.substring(0, dotIndex)
  if (prefix !== 'editor' && prefix !== 'chat' && prefix !== 'advanced' && prefix !== 'notebook')
    throw new Error(`Unexpected setting section ${prefix} in setting ${settingId}`)
  let suffix = settingId.substring(dotIndex + 1)
  return { id: settingId, firstPart: prefix, secondPart: suffix, defaultValue: defaultValue }
}

var settings = {
  EnableCodeActions: validateAndFormatSetting('editor.enableCodeActions', !0),
  LocaleOverride: validateAndFormatSetting('chat.localeOverride', 'auto'),
  WelcomeMessage: validateAndFormatSetting('chat.welcomeMessage', 'first'),
  AuthProvider: validateAndFormatSetting('advanced.authProvider', 'github'),
  NotebookIterativeImproving: validateAndFormatSetting('notebook.iterativeImproving', !1),
  DebugOverrideProxyUrl: validateAndFormatSetting('advanced.debug.overrideProxyUrl', ''),
  DebugChatOverrideProxyUrl: validateAndFormatSetting('advanced.debug.chatOverrideProxyUrl', ''),
  DebugTestOverrideProxyUrl: validateAndFormatSetting('advanced.debug.testOverrideProxyUrl', ''),
  DebugOverrideEngine: validateAndFormatSetting('advanced.debug.overrideEngine', ''),
  DebugOverrideChatEngine: validateAndFormatSetting('advanced.debug.overrideChatEngine', 'gpt-3.5-turbo'),
  DebugOverrideChatMaxTokenNum: validateAndFormatSetting('advanced.debug.overrideChatMaxTokenNum', 0),
  DebugOverrideChatOffTopicModel: validateAndFormatSetting('advanced.debug.overrideChatOffTopicModel', ''),
  DebugOverrideChatOffTopicModelTokenizer: validateAndFormatSetting('advanced.debug.overrideChatOffTopicModelTokenizer', ''),
  DebugOverrideChatOffTopicModelThreshold: validateAndFormatSetting('advanced.debug.overrideChatOffTopicModelThreshold', 0),
  DebugOverrideLogLevels: validateAndFormatSetting('advanced.debug.overrideLogLevels', {}),
  DebugFilterLogCategories: validateAndFormatSetting('advanced.debug.filterLogCategories', []),
  DebugReportFeedback: validateAndFormatSetting('advanced.debug.reportFeedback', !1),
  DebugUseNodeFetcher: validateAndFormatSetting('advanced.debug.useNodeFetcher', !1),
  ConversationSlashCommandEnablements: validateAndFormatSetting('advanced.slashCommands', { '*': !1 }),
  ConversationVariablesEnablements: validateAndFormatSetting('advanced.variables', { '*': isPreRelease }),
  ConversationAdditionalPromptContext: validateAndFormatSetting('advanced.conversationAdditionalPromptContext', 'firstTurn'),
  ConversationLoggingEnabled: validateAndFormatSetting('advanced.conversationLoggingEnabled', !1),
  ConversationIntentDetection: validateAndFormatSetting('advanced.conversationIntentDetection', !1),
  KerberosServicePrincipal: validateAndFormatSetting('advanced.kerberosServicePrincipal', ''),
  AgentsEndpointUrl: validateAndFormatSetting('advanced.agentsEndpointUrl', 'https://api.githubcopilot.com'),
  EnableRemoteAgents: validateAndFormatSetting('advanced.enableRemoteAgents', !1),
  ExplainIntentRefer: validateAndFormatSetting('advanced.explain.refer', !0),
  FixUseGPT4InInlineChat: validateAndFormatSetting('advanced.fix.useGPT4InInlineChat', !1),
  WorkspaceNewFlowEnabled: validateAndFormatSetting('advanced.workspace.useNewFlow', !0),
  WorkspaceCodeSearchEnabled: validateAndFormatSetting('advanced.workspace.codeSearchEnabled', void 0),
  WorkspaceUseAdaEnabled: validateAndFormatSetting('advanced.workspace.useAda', void 0),
  WorkspaceExperimentalFileLimit: validateAndFormatSetting('advanced.workspace.experimental.fileLimit', 0),
  InlineChatStreaming: validateAndFormatSetting('advanced.inlineChatStreaming', 'progressive'),
}
var LoggerManager = class {
    constructor(e, r) {
      this.logTargets = e
      this.configurationService = r
      this.loggers = new Map()
      this.promptResponseLoggers = new Map()
      this.myLogTarget = {
        logIt: (n, i, ...o) => {
          this.logTargets.forEach(s => s.logIt(n, i, ...o))
        },
      }
    }
    get defaultLogger() {
      return this.getLogger('extension')
    }
    getLogger(e) {
      return LoggerManager._getLogger(e, this.loggers, r => new Logger(r, this.myLogTarget, this.configurationService))
    }
    getPromptResponseLogger(e) {
      return LoggerManager._getLogger(e, this.promptResponseLoggers, r => new ConversationLogger(r, this.myLogTarget, this.configurationService))
    }
    registerAppender(e) {
      return (
        this.logTargets.push(e),
        createDisposable(() => {
          let r = this.logTargets.indexOf(e)
          r !== -1 && this.logTargets.splice(r, 1)
        })
      )
    }
    static _getLogger(e, r, n) {
      let i = r.get(e)
      return typeof i > 'u' && ((i = n(e)), r.set(e, i)), i
    }
  }

var LogLevel = ((level => (
  (level[(level.DEBUG = 0)] = 'DEBUG'),
  (level[(level.INFO = 1)] = 'INFO'),
  (level[(level.WARN = 2)] = 'WARN'),
  (level[(level.ERROR = 3)] = 'ERROR'),
  level
))(LogLevel || {}))

var ConsoleLogger = class {
  logIt(level, message, ...args) {
    level === LogLevel.ERROR ? console.error(message, ...args) : level === LogLevel.WARN && console.warn(message, ...args)
  }
}

var OutputLogger = class {
  constructor(output) {
    this.output = output
  }
  logIt(level, message, ...args) {
    this.output.appendLine(`${message} ${args.map(stringifyValue)}`)
  }
}

var Logger = class {
  constructor(category, target, configurationService) {
    this.category = category
    this.target = target
    this.configurationService = configurationService
  }
  stringToLevel(levelString) {
    return LogLevel[levelString]
  }
  log(level, ...messages) {
    if (!this.shouldLog(level, this.category)) return
    let prefix = `[${this.category}]`
    this.target.logIt(level, prefix, ...messages)
  }
  shouldLog(level, category) {
    let filterCategories = this.configurationService.getConfig(settings.DebugFilterLogCategories)
    if (filterCategories.length > 0 && !filterCategories.includes(category)) return false
    let overrideLevels = this.configurationService.getConfig(settings.DebugOverrideLogLevels),
      effectiveLevel = this.stringToLevel(overrideLevels[this.category]) ?? this.stringToLevel(overrideLevels['*']) ?? 1
    return level >= effectiveLevel
  }
  debug(...messages) {
    this.log(LogLevel.DEBUG, ...messages)
  }
  info(...messages) {
    this.log(LogLevel.INFO, ...messages)
  }
  warn(...messages) {
    this.log(LogLevel.WARN, ...messages)
  }
  error(...messages) {
    this.log(LogLevel.ERROR, ...messages)
  }
  exception(exception, message) {
    let prefix = message ? `${message}: ` : '',
      error = exception instanceof Error ? exception : new Error('Non-error thrown: ' + exception)
    this.log(LogLevel.ERROR, `${prefix}${error.stack}`)
  }
}

var ConversationLogger = class extends Logger {
  logPrompt(prompt) {
    if (!this.conversationLoggingEnabled()) return
    let separator = `
---------------------------------
`
    super.info(
      separator +
        prompt
          .map(
            entry => `${entry.role.toUpperCase()}:
${entry.content}`
          )
          .join(separator) +
        separator
    )
  }
  logResponse(response) {
    if (!this.conversationLoggingEnabled()) return
    let separator = `
---------------------------------
`
    if (typeof response != 'string') {
      if (response.type !== 'success') {
        super.info(`${separator}RESPONSE FAILED DUE TO ${response.type}${separator}`)
        return
      }
      response = Array.isArray(response.value)
        ? response.value.length === 1
          ? response.value[0]
          : `${response.value.map(value => `<<${value}>>`).join(', ')}`
        : response.value
    }
    super.info(`${separator}ASSISTANT:
${response}${separator}`)
  }
  debug(message, ...args) {
    this.conversationLoggingEnabled() && super.debug(message, ...args)
  }
  info(message, ...args) {
    this.conversationLoggingEnabled() && super.info(message, ...args)
  }
  warn(message, ...args) {
    this.conversationLoggingEnabled() && super.warn(message, ...args)
  }
  error(message, ...args) {
    this.conversationLoggingEnabled() && super.error(message, ...args)
  }
  conversationLoggingEnabled() {
    return this.configurationService.getConfig(settings.ConversationLoggingEnabled)
  }
}

function stringifyValue(value) {
  switch (typeof value) {
    case 'object':
      return JSON.stringify(value)
    default:
      return String(value)
  }
}
var BuildInfo = class {
    isProduction() {
      return isDevBuild
    }
    isPreRelease() {
      return isPreRelease
    }
    getBuildType() {
      return packageInfo.buildType
    }
    getVersion() {
      return packageInfo.version
    }
    getBuild() {
      return packageInfo.build
    }
    getName() {
      return packageInfo.name
    }
    getEditorVersionHeaders() {
      return {
        'Editor-Version': this.getEditorInfo().format(),
        'Editor-Plugin-Version': this.getEditorPluginInfo().format(),
      }
    }
  }
var VersionInfo = class {
  constructor(name, version) {
    this.name = name
    this.version = version
  }
  format() {
    return `${this.name}/${this.version}`
  }
}
var Events = require('events')
var EventEmitter = class extends events {
  constructor() {
    super()
  }
  emit(eventName, ...args) {
    return super.emit(eventName, ...args)
  }
}
function createServiceIdentifier(name) {
  return { name: name, _serviceIdentifierBrand: true }
}
var InstanceAccessor = class {
  constructor(instances, base) {
    this.constructionStack = []
    this.instances = new Map()
    this.isSealed = false
    this.base = base
    let stack = new Error().stack?.split(`
`)
    if (stack) this.constructionStack.push(...stack.slice(1))
    if (instances) for (let [key, value] of instances) this.instances.set(key, value)
  }
  get(identifier) {
    let instance = this.tryGet(identifier)
    if (instance) return instance
    throw new Error(`No instance of ${getName(identifier)} has been registered.
${this}`)
  }
  safeGet(identifier) {
    return this.tryGet(identifier)
  }
  tryGet(identifier) {
    let instance = this.instances.get(identifier)
    if (instance) return instance
    if (this.base) return this.base.tryGet(identifier)
  }
  define(identifier, instance) {
    if (this.isSealed) throw new Error('This accessor is sealed and cannot be modified anymore.')
    let oldInstance = this.instances.get(identifier)
    this.instances.set(identifier, instance)
    return oldInstance
  }
  defineIfNotDefined(identifier, instanceCreator) {
    if (!(typeof this.tryGet(identifier) < 'u')) return this.define(identifier, instanceCreator())
  }
  seal() {
    this.isSealed = true
  }
  toString() {
    let result = `    Accessor created at:
`
    for (let line of this.constructionStack || [])
      result += `    ${line}
`
    return (result += this.base?.toString() ?? ''), result
  }
  get debug() {
    let debugInfo = {}
    for (let [identifier, instance] of this.instances) debugInfo[getName(identifier)] = instance
    return debugInfo
  }
}
function getName(identifier) {
  return identifier.name
}
var TokenHandler = class {
  constructor(eventEmitter, trackingId, optedIn = false) {
    this.trackingId = trackingId
    this.optedIn = optedIn
    this.setupUpdateOnToken(eventEmitter)
  }
  setupUpdateOnToken(eventEmitter) {
    eventEmitter.get(EventEmitter).on('onCopilotToken', token => {
      let optedIn = token.getTokenValue('rt') === '1',
        trackingId = token.getTokenValue('tid'),
        organizationsList = token.organization_list
      if (trackingId !== void 0) {
        this.trackingId = trackingId
        this.organizationsList = organizationsList?.toString()
        this.optedIn = optedIn
      }
    })
  }
}
var telemetryUrl = 'https://copilot-telemetry.githubusercontent.com/telemetry'
var UrlProvider = class {
  constructor(url = telemetryUrl) {
    this.url = url
  }
  getUrl() {
    return this.url
  }
}
var IMSTelemetryService = createServiceIdentifier('IMSTelemetryService')
var IGHTelemetryService = createServiceIdentifier('IGHTelemetryService')
var Config = class {
  constructor(variables, assignmentContext, features) {
    this.variables = variables
    this.assignmentContext = assignmentContext
    this.features = features
  }
  static createFallbackConfig(telemetryService, reason) {
    telemetryService.get(IGHTelemetryService).sendExpProblemTelemetry({ reason: reason })
    return this.createEmptyConfig()
  }
  static createEmptyConfig() {
    return new Config({}, '', '')
  }
  addToTelemetry(telemetry) {
    telemetry.properties['VSCode.ABExp.Features'] = this.features
    telemetry.properties['abexp.assignmentcontext'] = this.assignmentContext
  }
}
var util = handleDefaultExports(require('util'))
var HeaderContributorList = class {
  constructor() {
    this.contributors = []
  }
  add(contributor) {
    this.contributors.push(contributor)
  }
  remove(contributor) {
    let index = this.contributors.indexOf(contributor)
    if (index !== -1) this.contributors.splice(index, 1)
  }
  contributeHeaders(headers) {
    for (let contributor of this.contributors) contributor.contributeHeaderValues(headers)
  }
  size() {
    return this.contributors.length
  }
}
var ConnectionSettings = class {
  set rejectUnauthorized(value) {
    this._rejectUnauthorized = value
  }
  get rejectUnauthorized() {
    return this._rejectUnauthorized
  }
}
var HttpResponse = class {
  constructor(status, statusText, headers, getText, getJson, getBody) {
    this.status = status
    this.statusText = statusText
    this.headers = headers
    this.getText = getText
    this.getJson = getJson
    this.getBody = getBody
    this.ok = this.status >= 200 && this.status < 300
  }
  async text() {
    return this.getText()
  }
  async json() {
    return this.getJson()
  }
  async body() {
    return this.getBody()
  }
}
var timeout = 30 * 1e3
function sendRequest(context, endpoint, token, intent, requestId, payload, cancellation) {
  let buildInfo = context.get(BuildInfo),
    headers = {
      Authorization: util.format('Bearer %s', token),
      'X-Request-Id': requestId,
      'VScode-SessionId': buildInfo.sessionId,
      'VScode-MachineId': buildInfo.machineId,
      ...buildInfo.getEditorVersionHeaders(),
      ...(endpoint.getExtraHeaders ? endpoint.getExtraHeaders() : {}),
    }
  endpoint.interceptBody && endpoint.interceptBody(payload), context.get(HeaderContributorList).contributeHeaders(headers), intent && (headers['OpenAI-Intent'] = intent)
  let options = { method: 'POST', headers: headers, json: payload, timeout: timeout },
    telemetryService = context.get(IGHTelemetryService),
    connectionSettings = context.get(ConnectionSettings)
  if (cancellation) {
    let abortController = connectionSettings.makeAbortController()
    cancellation.onCancellationRequested(() => {
      telemetryService.sendTelemetry('networking.cancelRequest', TelemetryEvent.createAndMarkAsIssued({ headerRequestId: requestId })), abortController.abort()
    }),
      (options.signal = abortController.signal)
  }
  return connectionSettings.fetch(endpoint.url, options).catch(error => {
    if (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ERR_HTTP2_INVALID_SESSION' ||
      error.message === 'ERR_HTTP2_GOAWAY_SESSION'
    )
      return telemetryService.sendTelemetry('networking.disconnectAll'), connectionSettings.disconnectAll().then(() => connectionSettings.fetch(endpoint.url, options))
    throw error
  })
}
var BaseExperimentFetcher = class {}
var DefaultExperimentFetcher = class extends BaseExperimentFetcher {
  async fetchExperiments(context, headers) {
    let connectionSettings = context.get(ConnectionSettings),
      response
    try {
      response = await connectionSettings.fetch('https://default.exp-tas.com/vscode/ab', { method: 'GET', headers: headers })
    } catch (error) {
      return Config.createFallbackConfig(context, `Error fetching ExP config: ${error}`)
    }
    if (!response.ok) return Config.createFallbackConfig(context, `ExP responded with ${response.status}`)
    let json = await response.json(),
      config = json.Configs.find(config => config.Id === 'vscode') ?? { Id: 'vscode', Parameters: {} },
      features = Object.entries(config.Parameters).map(([key, value]) => key + (value ? '' : 'cf'))
    return new Config(config.Parameters, json.AssignmentContext, features.join(';'))
  }
}
var EmptyExperimentFetcher = class extends BaseExperimentFetcher {
  async fetchExperiments(context, headers) {
    return Config.createEmptyConfig()
  }
}
var CopilotHeaders = {
  'X-Copilot-ClientTimeBucket': 'timeBucket',
  'X-Copilot-OverrideEngine': 'engine',
  'X-Copilot-Repository': 'repo',
  'X-Copilot-FileType': 'fileType',
  'X-Copilot-UserKind': 'userKind',
}
var FilterManager = class {
  constructor(filters) {
    this.filters = filters
    for (let [key, value] of Object.entries(this.filters)) if (value === '') delete this.filters[key]
  }
  extends(other) {
    for (let [key, value] of Object.entries(other.filters)) if (this.filters[key] !== value) return false
    return true
  }
  addToTelemetry(telemetry) {
    for (let [key, value] of Object.entries(this.filters)) {
      let header = CopilotHeaders[key]
      if (header !== undefined) telemetry.properties[header] = value
    }
  }
  stringify() {
    let keys = Object.keys(this.filters)
    keys.sort()
    return keys.map(key => `${key}:${this.filters[key]}`).join(';')
  }
  toHeaders() {
    return { ...this.filters }
  }
  withChange(key, value) {
    return new FilterManager({ ...this.filters, [key]: value })
  }
}
var PrefixManager = class {
  constructor(prefix) {
    this.prefix = prefix
  }
  getCurrentAndUpComingValues(context) {
    let currentValue = this.getValue(context),
      upcomingValues = this.getUpcomingValues(context)
    return [currentValue, upcomingValues]
  }
}
var FixedPrefixManager = class extends PrefixManager {
  getValue(context) {
    return this.prefix
  }
  getUpcomingValues(context) {
    return []
  }
}
var createFixedPrefixManager = t => new FixedPrefixManager(t)
var TimeBucketPrefixManager = class extends PrefixManager {
  constructor(prefix, fetchBeforeFactor = 0.5, anchor = new Date().setUTCHours(0, 0, 0, 0)) {
    super(prefix)
    this.prefix = prefix
    this.fetchBeforeFactor = fetchBeforeFactor
    this.anchor = anchor
  }
  setTimePeriod(timePeriod) {
    isNaN(timePeriod) ? (this.timePeriodLengthMs = undefined) : (this.timePeriodLengthMs = timePeriod)
  }
  setByCallBuckets(numBuckets) {
    isNaN(numBuckets) ? (this.numByCallBuckets = undefined) : (this.numByCallBuckets = numBuckets)
  }
  getValue(date) {
    return this.prefix + this.getTimePeriodBucketString(date) + (this.numByCallBuckets ? this.timeHash(date) : '')
  }
  getTimePeriodBucketString(date) {
    return this.timePeriodLengthMs ? this.dateToTimePartString(date) : ''
  }
  getUpcomingValues(date) {
    let values = [],
      timePeriodBucketStrings = this.getUpcomingTimePeriodBucketStrings(date),
      byCallBucketStrings = this.getUpcomingByCallBucketStrings()
    for (let timePeriodBucket of timePeriodBucketStrings)
      for (let byCallBucket of byCallBucketStrings)
        values.push(this.prefix + timePeriodBucket + byCallBucket)
    return values
  }
  getUpcomingTimePeriodBucketStrings(date) {
    if (this.timePeriodLengthMs === undefined) return ['']
    if ((date.getTime() - this.anchor) % this.timePeriodLengthMs < this.fetchBeforeFactor * this.timePeriodLengthMs)
      return [this.getTimePeriodBucketString(date)]
    {
      let nextDate = new Date(date.getTime() + this.timePeriodLengthMs)
      return [this.getTimePeriodBucketString(date), this.getTimePeriodBucketString(nextDate)]
    }
  }
  getUpcomingByCallBucketStrings() {
    return this.numByCallBuckets === undefined
      ? ['']
      : Array.from(Array(this.numByCallBuckets).keys()).map(num => num.toString())
  }
  timeHash(date) {
    return this.numByCallBuckets === undefined
      ? 0
      : (7883 * (date.getTime() % this.numByCallBuckets)) % this.numByCallBuckets
  }
  dateToTimePartString(date) {
    return this.timePeriodLengthMs === undefined
      ? ''
      : Math.floor((date.getTime() - this.anchor) / this.timePeriodLengthMs).toString()
  }
}
var clientTimeBucketHeader = 'X-Copilot-ClientTimeBucket'
var CurrentTimeProvider = class {
  now() {
    return new Date()
  }
}
var GranularitySelector = class {
  constructor(prefix, clock = new CurrentTimeProvider()) {
    this.specs = new Map()
    this.prefix = prefix
    this.clock = clock
    this.defaultGranularity = createFixedPrefixManager(prefix)
  }
  selectGranularity(extension) {
    for (let [spec, granularity] of this.specs.entries()) if (extension.extends(spec)) return granularity
    return this.defaultGranularity
  }
  update(extension, byCallBuckets, timePeriod) {
    if (((byCallBuckets = byCallBuckets > 1 ? byCallBuckets : NaN), (timePeriod = timePeriod > 0 ? timePeriod : NaN), isNaN(byCallBuckets) && isNaN(timePeriod))) this.specs.delete(extension)
    else {
      let granularity = new TimeBucketPrefixManager(this.prefix)
      isNaN(byCallBuckets) || granularity.setByCallBuckets(byCallBuckets), isNaN(timePeriod) || granularity.setTimePeriod(timePeriod * 3600 * 1e3), this.specs.set(extension, granularity)
    }
  }
  extendFilters(extension) {
    let granularity = this.selectGranularity(extension),
      [currentValue, upcomingValues] = granularity.getCurrentAndUpComingValues(this.clock.now())
    return { newFilterSettings: extension.withChange(clientTimeBucketHeader, currentValue), otherFilterSettingsToPrefetch: upcomingValues.map(value => extension.withChange(clientTimeBucketHeader, value)) }
  }
}
var ExperimentConfigFetcher = class {
  constructor(accessor) {
    this.accessor = accessor
    this.cache = new LimitedLinkedMap(200)
  }
  async fetchExpConfig(filter) {
    let cachedConfig = this.cache.get(filter.stringify())
    return (
      cachedConfig ||
        ((cachedConfig = new CachedConfigProducer(() => this.accessor.get(BaseExperimentFetcher).fetchExperiments(this.accessor, filter.toHeaders()), 1e3 * 60 * 60)),
        this.cache.set(filter.stringify(), cachedConfig)),
      cachedConfig.run()
    )
  }
  getCachedExpConfig(filter) {
    return this.cache.get(filter.stringify())?.value()
  }
}
var CachedConfigProducer = class {
  constructor(producer, expirationMs = 1 / 0) {
    this.producer = producer
    this.expirationMs = expirationMs
  }
  async run() {
    return (
      this.promise === void 0 &&
        ((this.promise = this.producer()),
        this.storeResult(this.promise).then(() => {
          this.expirationMs < 1 / 0 &&
            this.promise !== void 0 &&
            setTimeout(() => (this.promise = void 0), this.expirationMs)
        })),
      this.promise
    )
  }
  async storeResult(promise) {
    try {
      this.result = await promise
    } finally {
      this.result === void 0 && (this.promise = void 0)
    }
  }
  value() {
    return this.result
  }
}
var ExperimentManager = class {
  constructor(accessor) {
    this.accessor = accessor
    this.staticFilters = {}
    this.dynamicFilters = {}
    this.upcomingDynamicFilters = {}
    this.assignments = new ExperimentConfigFetcher(this.accessor)
  }
  static {
    this.upcomingDynamicFilterCheckDelayMs = 20
  }
  static {
    this.upcomingTimeBucketMinutes = 5 + Math.floor(Math.random() * 11)
  }
  registerStaticFilters(filters) {
    Object.assign(this.staticFilters, filters)
  }
  registerDynamicFilter(filterName, filterFunction) {
    this.dynamicFilters[filterName] = filterFunction
  }
  getDynamicFilterValues() {
    let dynamicFilterValues = {}
    for (let [filterName, filterFunction] of Object.entries(this.dynamicFilters)) dynamicFilterValues[filterName] = filterFunction()
    return dynamicFilterValues
  }
  async getAssignment(variableName, additionalFilters = {}, telemetryData) {
    let granularityDirectory = this.getGranularityDirectory(),
      filterSettings = this.makeFilterSettings(additionalFilters),
      extendedFilters = granularityDirectory.extendFilters(filterSettings),
      expConfig = await this.getExpConfig(extendedFilters.newFilterSettings)
    granularityDirectory.update(filterSettings, +(expConfig.variables.copilotbycallbuckets ?? NaN), +(expConfig.variables.copilottimeperiodsizeinh ?? NaN))
    let newExtendedFilters = granularityDirectory.extendFilters(filterSettings),
      newFilterSettings = newExtendedFilters.newFilterSettings,
      newExpConfig = await this.getExpConfig(newFilterSettings),
      delayPromise = new Promise(resolve => setTimeout(resolve, ExperimentManager.upcomingDynamicFilterCheckDelayMs))
    for (let filterSetting of newExtendedFilters.otherFilterSettingsToPrefetch)
      delayPromise = delayPromise.then(async () => {
        await new Promise(resolve => setTimeout(resolve, ExperimentManager.upcomingDynamicFilterCheckDelayMs)), this.getExpConfig(filterSetting)
      })
    this.prepareForUpcomingFilters(newFilterSettings)
    if (telemetryData) telemetryData.filtersAndExp = { exp: newExpConfig, filters: newFilterSettings }
    return newExpConfig.variables[variableName]
  }
  getGranularityDirectory() {
    if (!this.granularityDirectory) {
      let machineId = this.accessor.get(BuildInfo).machineId
      this.granularityDirectory = new GranularitySelector(machineId)
    }
    return this.granularityDirectory
  }
  makeFilterSettings(additionalFilters) {
    return new FilterManager({ ...this.staticFilters, ...this.getDynamicFilterValues(), ...additionalFilters })
  }
  async getExpConfig(filterSettings) {
    try {
      return this.assignments.fetchExpConfig(filterSettings)
    } catch (error) {
      return Config.createFallbackConfig(this.accessor, `Error fetching ExP config: ${error}`)
    }
  }
  async prepareForUpcomingFilters(filterSettings) {
    if (!(new Date().getMinutes() < 60 - ExperimentManager.upcomingTimeBucketMinutes))
      for (let [filterName, filterFunction] of Object.entries(this.upcomingDynamicFilters))
        await new Promise(resolve => setTimeout(resolve, ExperimentManager.upcomingDynamicFilterCheckDelayMs)),
          this.getExpConfig(filterSettings.withChange(filterName, filterFunction()))
  }
  async fastCancellation() {
    return (await this.getAssignment('copilotoverridefastcancellation')) ?? true
  }
  async chatExpModel() {
    return (await this.getAssignment('copilotchatexpmodel')) ?? ''
  }
  async chatMaxNumTokens() {
    return (await this.getAssignment('copilotchatmaxnumtokens')) ?? 0
  }
  async chatOffTopicModel() {
    return (await this.getAssignment('copilotchatofftopicmodel')) ?? ''
  }
  async chatOffTopicModelTokenizer() {
    return (await this.getAssignment('copilotchatofftopicmodeltokenizer')) ?? ''
  }
  async chatOffTopicModelThreshold() {
    return (await this.getAssignment('copilotchatofftopicmodelthreshold')) ?? 0
  }
  async addExpAndFilterToTelemetry(telemetryData) {
    let filterSettings = this.makeFilterSettings({})
    telemetryData.filtersAndExp = { filters: filterSettings, exp: await this.getExpConfig(filterSettings) }
  }
}
var generateUUID = (function () {
  if (typeof crypto == 'object' && typeof crypto.randomUUID == 'function') return crypto.randomUUID.bind(crypto)
  let randomFunc
  typeof crypto == 'object' && typeof crypto.getRandomValues == 'function'
    ? (randomFunc = crypto.getRandomValues.bind(crypto))
    : (randomFunc = function (array) {
        for (let i = 0; i < array.length; i++) array[i] = Math.floor(Math.random() * 256)
        return array
      })
  let byteArray = new Uint8Array(16),
    hexArray = []
  for (let i = 0; i < 256; i++) hexArray.push(i.toString(16).padStart(2, '0'))
  return function () {
    randomFunc(byteArray), (byteArray[6] = (byteArray[6] & 15) | 64), (byteArray[8] = (byteArray[8] & 63) | 128)
    let index = 0,
      uuid = ''
    return (
      (uuid += hexArray[byteArray[index++]]),
      (uuid += hexArray[byteArray[index++]]),
      (uuid += hexArray[byteArray[index++]]),
      (uuid += hexArray[byteArray[index++]]),
      (uuid += '-'),
      (uuid += hexArray[byteArray[index++]]),
      (uuid += hexArray[byteArray[index++]]),
      (uuid += '-'),
      (uuid += hexArray[byteArray[index++]]),
      (uuid += hexArray[byteArray[index++]]),
      (uuid += '-'),
      (uuid += hexArray[byteArray[index++]]),
      (uuid += hexArray[byteArray[index++]]),
      (uuid += '-'),
      (uuid += hexArray[byteArray[index++]]),
      (uuid += hexArray[byteArray[index++]]),
      (uuid += hexArray[byteArray[index++]]),
      (uuid += hexArray[byteArray[index++]]),
      (uuid += hexArray[byteArray[index++]]),
      (uuid += hexArray[byteArray[index++]]),
      uuid
    )
  }
})()
var TelemetryEvent = class Event {
  static {
    this.keysExemptedFromSanitization = ['abexp.assignmentcontext', 'VSCode.ABExp.Features']
  }
  constructor(properties, measurements, issuedTime) {
    this.properties = properties;
    this.measurements = measurements;
    this.issuedTime = issuedTime;
  }
  static createAndMarkAsIssued(properties, measurements) {
    return new Event(properties || {}, measurements || {}, Date.now())
  }
  extendedBy(properties, measurements) {
    let newProperties = { ...this.properties, ...properties },
      newMeasurements = { ...this.measurements, ...measurements },
      newEvent = new Event(newProperties, newMeasurements, this.issuedTime)
    newEvent.displayedTime = this.displayedTime;
    newEvent.filtersAndExp = this.filtersAndExp;
    return newEvent;
  }
  markAsDisplayed() {
    if(this.displayedTime === undefined) {
      this.displayedTime = Date.now();
    }
  }
  async extendWithExpTelemetry(experimentManager) {
    if(!this.filtersAndExp) {
      await experimentManager.get(ExperimentManager).addExpAndFilterToTelemetry(this);
    }
    this.filtersAndExp.exp.addToTelemetry(this);
    this.filtersAndExp.filters.addToTelemetry(this);
  }
  extendWithEditorAgnosticFields(buildInfo) {
    let info = buildInfo.get(BuildInfo);
    this.properties.editor_version = info.getEditorInfo().format();
    this.properties.editor_plugin_version = info.getEditorPluginInfo().format();
    this.properties.client_machineid = info.machineId;
    this.properties.client_sessionid = info.sessionId;
    this.properties.copilot_version = `copilot/${info.getVersion()}`;
    this.properties.common_extname = info.getEditorPluginInfo().name;
    this.properties.common_extversion = info.getEditorPluginInfo().version;
    this.properties.common_vscodeversion = info.getEditorInfo().format();
  }
  extendWithConfigProperties(configManager, buildInfo, tokenHandler) {
    let info = configManager.get(BuildInfo),
      config = configManager.get(ConfigManager).dumpConfig();
    config['copilot.build'] = info.getBuild();
    config['copilot.buildType'] = info.getBuildType();
    let token = configManager.get(TokenHandler);
    if(token.trackingId) {
      config['copilot.trackingId'] = token.trackingId;
    }
    if(token.organizationsList) {
      config.organizations_list = token.organizationsList;
    }
    this.properties = { ...this.properties, ...config };
  }
  extendWithRequestId(request) {
    let requestId = {
      completionId: request.completionId,
      created: request.created.toString(),
      headerRequestId: request.headerRequestId,
      serverExperiments: request.serverExperiments,
      deploymentId: request.deploymentId,
    }
    this.properties = { ...this.properties, ...requestId };
  }
  static {
    this.keysToRemoveFromStandardTelemetryHack = [
      'gitRepoHost',
      'gitRepoName',
      'gitRepoOwner',
      'gitRepoUrl',
      'gitRepoPath',
      'repo',
      'request_option_nwo',
      'userKind',
    ]
  }
  static maybeRemoveRepoInfoFromPropertiesHack(shouldRemove, properties) {
    if (shouldRemove) return properties;
    let newProperties = {};
    for (let key in properties) {
      if(!Event.keysToRemoveFromStandardTelemetryHack.includes(key)) {
        newProperties[key] = properties[key];
      }
    }
    return newProperties;
  }
  sanitizeKeys() {
    this.properties = Event.sanitizeKeys(this.properties);
    this.measurements = Event.sanitizeKeys(this.measurements);
  }
  static sanitizeKeys(properties) {
    properties = properties || {};
    let sanitizedProperties = {};
    for (let key in properties) {
      let sanitizedKey = Event.keysExemptedFromSanitization.includes(key) ? key : key.replace(/\./g, '_');
      sanitizedProperties[sanitizedKey] = properties[key];
    }
    return sanitizedProperties;
  }
  updateTimeSinceIssuedAndDisplayed() {
    let timeSinceIssued = Date.now() - this.issuedTime;
    this.measurements.timeSinceIssuedMs = timeSinceIssued;
    if(this.displayedTime !== undefined) {
      let timeSinceDisplayed = Date.now() - this.displayedTime;
      this.measurements.timeSinceDisplayedMs = timeSinceDisplayed;
    }
  }
  async makeReadyForSending(configManager, shouldIncludeExp) {
    this.extendWithConfigProperties(configManager);
    this.extendWithEditorAgnosticFields(configManager);
    this.sanitizeKeys();
    if(shouldIncludeExp === 'IncludeExp') {
      await this.extendWithExpTelemetry(configManager);
    }
    this.updateTimeSinceIssuedAndDisplayed();
    for (let key in this.properties) {
      if(this.properties[key] === undefined) {
        delete this.properties[key];
      }
    }
    addCommonProperties(configManager, this.properties);
  }
}
function addCommonProperties(configManager, properties) {
  properties.unique_id = generateUUID()
  let buildInfo = configManager.get(BuildInfo)
  properties.common_extname = buildInfo.getEditorPluginInfo().name
  properties.common_extversion = buildInfo.getEditorPluginInfo().version
  properties.common_vscodeversion = buildInfo.getEditorInfo().format()
}
var openURL = handleOpen()
var BaseUrlOpener = class {}
var URLHandler = class {
    async open(url) {
      await openURL(url)
    }
  }
var NotificationHandler = class {}
var certificateErrorCodes = ['UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'CERT_SIGNATURE_FAILURE']
var CertificateErrorHandler = class {
  constructor() {
    this.notifiedErrorCodes = []
  }
  async notifyUser(configManager, error) {
    if (certificateErrorCodes.includes(error.code) && !this.didNotifyBefore(error.code)) {
      this.displayCertificateErrorNotification(configManager, error)
      this.notifiedErrorCodes.push(error.code)
    }
  }
  displayCertificateErrorNotification(configManager, error) {
    let helpURL = 'https://aka.ms/copilot-ssc',
      errorMessage = "Your current Copilot license doesn't support proxy connections with self-signed certificates."
    configManager
      .get(LoggerManager)
      .getLogger('certificates')
      .error(`${errorMessage} Please visit ${helpURL} to learn more. Original cause: ${JSON.stringify(error)}`)
    this.showCertificateWarningMessage(configManager, errorMessage, helpURL)
  }
  showCertificateWarningMessage(configManager, errorMessage, helpURL) {
    let action = { title: 'Learn more' }
    configManager.get(NotificationHandler)
      .showWarningMessage(errorMessage, action)
      .then(selectedAction => {
        if (selectedAction?.title === action.title) {
          configManager.get(BaseUrlOpener).open(helpURL)
        }
      })
  }
  didNotifyBefore(errorCode) {
    return this.notifiedErrorCodes.indexOf(errorCode) !== -1
  }
}
function formatStringWithArguments(string, args) {
  let result
  if (args.length === 0) {
    result = string
  } else {
    result = string.replace(/\{(\d+)\}/g, function (match, group) {
      let index = group[0]
      return typeof args[index] < 'u' ? args[index] : match
    })
  }
  return result
}
function format(t, string, ...args) {
  return formatStringWithArguments(string, args)
}
var defaultLocale = 'en',
isWindows = false,
isMac = false,
isLinux = false,
isSnap = false,
isNode = false,
isBrowser = false,
isElectron = false,
isTouchDevice = false,
isCI = false,
isMobile = false,
locale,
language = defaultLocale,
osLocale = defaultLocale,
translationsConfigFile,
userAgent,
globalContext = globalThis,
processObject;

if (typeof globalContext.vscode < 'undefined' && typeof globalContext.vscode.process < 'undefined') {
  processObject = globalContext.vscode.process;
} else if (typeof process < 'undefined') {
  processObject = process;
}

isElectron = typeof processObject?.versions?.electron == 'string';
var isRenderer = isElectron && processObject?.type === 'renderer';

if (typeof navigator == 'object' && !isRenderer) {
  userAgent = navigator.userAgent;
  isWindows = userAgent.indexOf('Windows') >= 0;
  isMac = userAgent.indexOf('Macintosh') >= 0;
  isTouchDevice = (userAgent.indexOf('Macintosh') >= 0 || userAgent.indexOf('iPad') >= 0 || userAgent.indexOf('iPhone') >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
  isLinux = userAgent.indexOf('Linux') >= 0;
  isMobile = userAgent?.indexOf('Mobi') >= 0;
  isBrowser = true;
  locale = defaultLocale;
  language = locale;
  osLocale = navigator.language;
} else if (typeof processObject == 'object') {
  isWindows = processObject.platform === 'win32';
  isMac = processObject.platform === 'darwin';
  isLinux = processObject.platform === 'linux';
  isSnap = isLinux && !!processObject.env.SNAP && !!processObject.env.SNAP_REVISION;
  isElectron = isElectron;
  isCI = !!processObject.env.CI || !!processObject.env.BUILD_ARTIFACTSTAGINGDIRECTORY;
  locale = defaultLocale;
  language = defaultLocale;

  let nlsConfig = processObject.env.VSCODE_NLS_CONFIG;
  if (nlsConfig) {
    try {
      let parsedConfig = JSON.parse(nlsConfig),
      availableLanguage = parsedConfig.availableLanguages['*'];
      locale = parsedConfig.locale;
      osLocale = parsedConfig.osLocale;
      language = availableLanguage || defaultLocale;
      translationsConfigFile = parsedConfig._translationsConfigFile;
    } catch {}
    isNode = true;
  }
} else {
  console.error('Unable to resolve platform.');
}
var platform = 0;
isMac ? (platform = 1) : isWindows ? (platform = 3) : isLinux && (platform = 2);
var isWindowsFlag = isWindows,
  isMacFlag = isMac,
  isLinuxFlag = isLinux;
var isNodeFlag = isNode;
var isBrowserFlag = isBrowser,
  isImportScriptsAvailable = isBrowser && typeof global.importScripts == 'function',
  globalOrigin = isImportScriptsAvailable ? global.origin : undefined;
var userAgentString = userAgent,
  languageString = language,
  languageObject;

((languageObjectParam) => {
  function getValue() {
    return languageString;
  }
  languageObjectParam.value = getValue;
  function isDefaultVariant() {
    return languageString.length === 2 ? languageString === 'en' : languageString.length >= 3 ? languageString[0] === 'e' && languageString[1] === 'n' && languageString[2] === '-' : false;
  }
  languageObjectParam.isDefaultVariant = isDefaultVariant;
  function isDefault() {
    return languageString === 'en';
  }
  languageObjectParam.isDefault = isDefault;
})((languageObject ||= {}));

var isPostMessageAvailable = typeof global.postMessage == 'function' && !global.importScripts,
  scheduleAsyncWork = (() => {
    if (isPostMessageAvailable) {
      let tasks = [];
      global.addEventListener('message', event => {
        if (event.data && event.data.vscodeScheduleAsyncWork)
          for (let index = 0, length = tasks.length; index < length; index++) {
            let task = tasks[index];
            if (task.id === event.data.vscodeScheduleAsyncWork) {
              tasks.splice(index, 1), task.callback();
              return;
            }
          }
      });
      let idCounter = 0;
      return callback => {
        let id = ++idCounter;
        tasks.push({ id: id, callback: callback }), global.postMessage({ vscodeScheduleAsyncWork: id }, '*');
      };
    }
    return callback => setTimeout(callback);
  })();
  var isChrome = !!(userAgentString && userAgentString.indexOf('Chrome') >= 0),
  isFirefox = !!(userAgentString && userAgentString.indexOf('Firefox') >= 0),
  isSafari = !!(!isChrome && userAgentString && userAgentString.indexOf('Safari') >= 0),
  isEdge = !!(userAgentString && userAgentString.indexOf('Edg/') >= 0),
  isAndroid = !!(userAgentString && userAgentString.indexOf('Android') >= 0);
var platformInfo,
  vscodeGlobal = globalThis.vscode;
if (typeof vscodeGlobal < 'u' && typeof vscodeGlobal.process < 'u') {
  let process = vscodeGlobal.process;
  platformInfo = {
    get platform() {
      return process.platform;
    },
    get arch() {
      return process.arch;
    },
    get env() {
      return process.env;
    },
    cwd() {
      return process.cwd();
    },
  };
} else
  typeof process < 'u'
    ? (platformInfo = {
        get platform() {
          return process.platform;
        },
        get arch() {
          return process.arch;
        },
        get env() {
          return process.env;
        },
        cwd() {
          return process.env.VSCODE_CWD || process.cwd();
        },
      })
    : (platformInfo = {
        get platform() {
          return isWindowsFlag ? 'win32' : isMacFlag ? 'darwin' : 'linux';
        },
        get arch() {},
        get env() {
          return {};
        },
        cwd() {
          return '/';
        },
      });
var getCurrentWorkingDirectory = platformInfo.cwd,
  getEnvironment = platformInfo.env,
  getPlatform = platformInfo.platform,
  getArchitecture = platformInfo.arch;
var upperCaseA = 65,
  lowerCaseA = 97,
  upperCaseZ = 90,
  lowerCaseZ = 122,
  dot = 46,
  forwardSlash = 47,
  backSlash = 92,
  colon = 58,
  questionMark = 63,
  InvalidArgTypeError = class extends Error {
    constructor(arg, expectedType, receivedValue) {
      let notPrefix;
      typeof expectedType == 'string' && expectedType.indexOf('not ') === 0
        ? ((notPrefix = 'must not be'), (expectedType = expectedType.replace(/^not /, '')))
        : (notPrefix = 'must be');
      let type = arg.indexOf('.') !== -1 ? 'property' : 'argument',
        message = `The "${arg}" ${type} ${notPrefix} of type ${expectedType}`;
      message += `. Received type ${typeof receivedValue}`;
      super(message);
      this.code = 'ERR_INVALID_ARG_TYPE';
    }
  };
  function validateObject(input, argName) {
    if (input === null || typeof input != 'object') throw new InvalidArgTypeError(argName, 'Object', input)
  }
  function validateString(input, argName) {
    if (typeof input != 'string') throw new InvalidArgTypeError(argName, 'string', input)
  }
  var isWindows = getPlatform === 'win32'
  function isPathSeparator(charCode) {
    return charCode === forwardSlash || charCode === backSlash
  }
  function isForwardSlash(charCode) {
    return charCode === forwardSlash
  }
  function isAlphabet(charCode) {
    return (charCode >= upperCaseA && charCode <= upperCaseZ) || (charCode >= lowerCaseA && charCode <= lowerCaseZ)
  }
  function normalizePath(input, pathSeparator, dot, isPathSeparator) {
    let normalizedPath = '',
      dotCount = 0,
      lastSeparatorIndex = -1,
      consecutiveDots = 0,
      currentCharCode = 0
    for (let i = 0; i <= input.length; ++i) {
      if (i < input.length) currentCharCode = input.charCodeAt(i)
      else {
        if (isPathSeparator(currentCharCode)) break
        currentCharCode = forwardSlash
      }
      if (isPathSeparator(currentCharCode)) {
        if (!(lastSeparatorIndex === i - 1 || consecutiveDots === 1))
          if (consecutiveDots === 2) {
            if (normalizedPath.length < 2 || dotCount !== 2 || normalizedPath.charCodeAt(normalizedPath.length - 1) !== dot || normalizedPath.charCodeAt(normalizedPath.length - 2) !== dot) {
              if (normalizedPath.length > 2) {
                let lastDotIndex = normalizedPath.lastIndexOf(dot)
                lastDotIndex === -1 ? ((normalizedPath = ''), (dotCount = 0)) : ((normalizedPath = normalizedPath.slice(0, lastDotIndex)), (dotCount = normalizedPath.length - 1 - normalizedPath.lastIndexOf(dot))),
                  (lastSeparatorIndex = i),
                  (consecutiveDots = 0)
                continue
              } else if (normalizedPath.length !== 0) {
                ;(normalizedPath = ''), (dotCount = 0), (lastSeparatorIndex = i), (consecutiveDots = 0)
                continue
              }
            }
            pathSeparator && ((normalizedPath += normalizedPath.length > 0 ? `${dot}..` : '..'), (dotCount = 2))
          } else normalizedPath.length > 0 ? (normalizedPath += `${dot}${input.slice(lastSeparatorIndex + 1, i)}`) : (normalizedPath = input.slice(lastSeparatorIndex + 1, i)), (dotCount = i - lastSeparatorIndex - 1)
        ;(lastSeparatorIndex = i), (consecutiveDots = 0)
      } else currentCharCode === dot && consecutiveDots !== -1 ? ++consecutiveDots : (consecutiveDots = -1)
    }
    return normalizedPath
  }
  function formatPath(pathSeparator, pathObject) {
    validateObject(pathObject, 'pathObject')
    let directory = pathObject.dir || pathObject.root,
      base = pathObject.base || `${pathObject.name || ''}${pathObject.ext || ''}`
    return directory ? (directory === pathObject.root ? `${directory}${base}` : `${directory}${pathSeparator}${base}`) : base
  }
function formatPath(t, e) {
  validateObject(e, 'pathObject')
  let r = e.dir || e.root,
    n = e.base || `${e.name || ''}${e.ext || ''}`
  return r ? (r === e.root ? `${r}${n}` : `${r}${t}${n}`) : n
}
var win32PathOperations = {
  resolve(...paths) {
    let resolvedAbsolute = '',
        resolvedPath = '',
        isAbsolute = false;
    for (let i = paths.length - 1; i >= -1; i--) {
      let path;
      if (i >= 0) {
        path = paths[i];
        validateString(path, 'path');
        if (path.length === 0) continue;
      } else {
        if (resolvedAbsolute.length === 0) {
          path = getCurrentWorkingDirectory();
        } else {
          path = getEnvironmentVariable(resolvedAbsolute) || getCurrentWorkingDirectory();
          if (path === undefined || (path.slice(0, 2).toLowerCase() !== resolvedAbsolute.toLowerCase() && path.charCodeAt(2) === backSlash)) {
            path = `${resolvedAbsolute}\\`;
          }
        }
      }
      let pathLength = path.length,
          rootLength = 0,
          root = '',
          isUncPath = false,
          code = path.charCodeAt(0);
      if (pathLength === 1) {
        if (isPathSeparator(code)) {
          rootLength = 1;
          isUncPath = true;
        }
      } else if (isPathSeparator(code)) {
        if (isPathSeparator(path.charCodeAt(1))) {
          let j = 2,
              start = j;
          while (j < pathLength && !isPathSeparator(path.charCodeAt(j))) j++;
          if (j < pathLength && j !== start) {
            let hostname = path.slice(start, j);
            start = j;
            while (j < pathLength && isPathSeparator(path.charCodeAt(j))) j++;
            if (j < pathLength && j !== start) {
              while (j < pathLength && !isPathSeparator(path.charCodeAt(j))) j++;
              if (j === pathLength || j !== start) {
                root = `\\\\${hostname}\\${path.slice(start, j)}`;
                rootLength = j;
              }
            }
          }
        } else {
          rootLength = 1;
        }
      } else if (isAlphabet(code) && path.charCodeAt(1) === colon) {
        root = path.slice(0, 2);
        rootLength = 2;
        if (pathLength > 2 && isPathSeparator(path.charCodeAt(2))) {
          isUncPath = true;
          rootLength = 3;
        }
      }
      if (root.length > 0) {
        if (resolvedAbsolute.length > 0) {
          if (root.toLowerCase() !== resolvedAbsolute.toLowerCase()) continue;
        } else {
          resolvedAbsolute = root;
        }
      }
      if (isAbsolute) {
        if (resolvedAbsolute.length > 0) break;
      } else {
        resolvedPath = `${path.slice(rootLength)}\\${resolvedPath}`;
        isAbsolute = isUncPath;
        if (isUncPath && resolvedAbsolute.length > 0) break;
      }
    }
    resolvedPath = normalizePath(resolvedPath, !isAbsolute, '\\', isPathSeparator);
    return isAbsolute ? `${resolvedAbsolute}\\${resolvedPath}` : `${resolvedAbsolute}${resolvedPath}` || '.';
  },
  normalize(path) {
    validateString(path, 'path')
    let pathLength = path.length
    if (pathLength === 0) return '.'
    let rootEnd = 0,
      root,
      isAbsolute = false,
      firstCharCode = path.charCodeAt(0)
    if (pathLength === 1) return isForwardSlash(firstCharCode) ? '\\' : path
    if (isPathSeparator(firstCharCode))
      if ((isAbsolute = true, isPathSeparator(path.charCodeAt(1)))) {
        let separatorIndex = 2,
          nextPartStart = separatorIndex
        while (separatorIndex < pathLength && !isPathSeparator(path.charCodeAt(separatorIndex))) separatorIndex++
        if (separatorIndex < pathLength && separatorIndex !== nextPartStart) {
          let server = path.slice(nextPartStart, separatorIndex)
          while (separatorIndex < pathLength && isPathSeparator(path.charCodeAt(separatorIndex))) separatorIndex++
          if (separatorIndex < pathLength && separatorIndex !== nextPartStart) {
            nextPartStart = separatorIndex
            while (separatorIndex < pathLength && !isPathSeparator(path.charCodeAt(separatorIndex))) separatorIndex++
            if (separatorIndex === pathLength) return `\\\\${server}\\${path.slice(nextPartStart)}\\`
            if (separatorIndex !== nextPartStart) {
              root = `\\\\${server}\\${path.slice(nextPartStart, separatorIndex)}`
              rootEnd = separatorIndex
            }
          }
        }
      } else rootEnd = 1
    else
    isAlphabet(firstCharCode) &&
        path.charCodeAt(1) === colon &&
        ((root = path.slice(0, 2)), (rootEnd = 2), pathLength > 2 && isPathSeparator(path.charCodeAt(2)) && ((isAbsolute = true), (rootEnd = 3)))
    let tail = rootEnd < pathLength ? normalizePath(path.slice(rootEnd), !isAbsolute, '\\', isPathSeparator) : ''
    if (tail.length === 0 && !isAbsolute) tail = '.'
    if (tail.length > 0 && isPathSeparator(path.charCodeAt(pathLength - 1))) tail += '\\'
    return root === undefined ? (isAbsolute ? `\\${tail}` : tail) : isAbsolute ? `${root}\\${tail}` : `${root}${tail}`
  },
  isAbsolute(path) {
    validateString(path, 'path')
    let pathLength = path.length
    if (pathLength === 0) return false
    let firstCharCode = path.charCodeAt(0)
    return isPathSeparator(firstCharCode) || (pathLength > 2 && isAlphabet(firstCharCode) && path.charCodeAt(1) === colon && isPathSeparator(path.charCodeAt(2)))
  },
  join(...paths) {
    if (paths.length === 0) return '.'
    let joinedPath, firstPath
    for (let index = 0; index < paths.length; ++index) {
      let path = paths[index]
      validateString(path, 'path'), path.length > 0 && (joinedPath === void 0 ? (joinedPath = firstPath = path) : (joinedPath += `\\${path}`))
    }
    if (joinedPath === void 0) return '.'
    let isAbsolute = true,
      separatorIndex = 0
    if (typeof firstPath == 'string' && isPathSeparator(firstPath.charCodeAt(0))) {
      ++separatorIndex
      let pathLength = firstPath.length
      pathLength > 1 && isPathSeparator(firstPath.charCodeAt(1)) && (++separatorIndex, pathLength > 2 && (isPathSeparator(firstPath.charCodeAt(2)) ? ++separatorIndex : (isAbsolute = false)))
    }
    if (isAbsolute) {
      for (; separatorIndex < joinedPath.length && isPathSeparator(joinedPath.charCodeAt(separatorIndex)); ) separatorIndex++
      separatorIndex >= 2 && (joinedPath = `\\${joinedPath.slice(separatorIndex)}`)
    }
    return win32PathOperations.normalize(joinedPath)
  },
  relative(from, to) {
    if ((validateString(from, 'from'), validateString(to, 'to'), from === to)) return ''
    let resolvedFrom = win32PathOperations.resolve(from),
      resolvedTo = win32PathOperations.resolve(to)
    if (resolvedFrom === resolvedTo || ((from = resolvedFrom.toLowerCase()), (to = resolvedTo.toLowerCase()), from === to)) return ''
    let fromIndex = 0
    for (; fromIndex < from.length && from.charCodeAt(fromIndex) === backSlash; ) fromIndex++
    let fromLength = from.length
    for (; fromLength - 1 > fromIndex && from.charCodeAt(fromLength - 1) === backSlash; ) fromLength--
    let fromPartLength = fromLength - fromIndex,
      toIndex = 0
    for (; toIndex < to.length && to.charCodeAt(toIndex) === backSlash; ) toIndex++
    let toLength = to.length
    for (; toLength - 1 > toIndex && to.charCodeAt(toLength - 1) === backSlash; ) toLength--
    let toPartLength = toLength - toIndex,
      minLength = fromPartLength < toPartLength ? fromPartLength : toPartLength,
      lastCommonIndex = -1,
      currentIndex = 0
    for (; currentIndex < minLength; currentIndex++) {
      let fromCharCode = from.charCodeAt(fromIndex + currentIndex)
      if (fromCharCode !== to.charCodeAt(toIndex + currentIndex)) break
      fromCharCode === backSlash && (lastCommonIndex = currentIndex)
    }
    if (currentIndex !== minLength) {
      if (lastCommonIndex === -1) return resolvedTo
    } else {
      if (toPartLength > minLength) {
        if (to.charCodeAt(toIndex + currentIndex) === backSlash) return resolvedTo.slice(toIndex + currentIndex + 1)
        if (currentIndex === 2) return resolvedTo.slice(toIndex + currentIndex)
      }
      fromPartLength > minLength && (from.charCodeAt(fromIndex + currentIndex) === backSlash ? (lastCommonIndex = currentIndex) : currentIndex === 2 && (lastCommonIndex = 3)), lastCommonIndex === -1 && (lastCommonIndex = 0)
    }
    let relativePath = ''
    for (currentIndex = fromIndex + lastCommonIndex + 1; currentIndex <= fromLength; ++currentIndex) (currentIndex === fromLength || from.charCodeAt(currentIndex) === backSlash) && (relativePath += relativePath.length === 0 ? '..' : '\\..')
    return (toIndex += lastCommonIndex), relativePath.length > 0 ? `${relativePath}${resolvedTo.slice(toIndex, toLength)}` : (resolvedTo.charCodeAt(toIndex) === backSlash && ++toIndex, resolvedTo.slice(toIndex, toLength))
  },
  toNamespacedPath(path) {
    if (typeof path != 'string' || path.length === 0) return path
    let resolvedPath = win32PathOperations.resolve(path)
    if (resolvedPath.length <= 2) return path
    if (resolvedPath.charCodeAt(0) === backSlash) {
      if (resolvedPath.charCodeAt(1) === backSlash) {
        let thirdChar = resolvedPath.charCodeAt(2)
        if (thirdChar !== questionMark && thirdChar !== dot) return `\\\\?\\UNC\\${resolvedPath.slice(2)}`
      }
    } else if (isAlphabet(resolvedPath.charCodeAt(0)) && resolvedPath.charCodeAt(1) === colon && resolvedPath.charCodeAt(2) === backSlash) return `\\\\?\\${resolvedPath}`
    return path
  },
  dirname(path) {
    validateString(path, 'path')
    let pathLength = path.length
    if (pathLength === 0) return '.'
    let root = -1,
      rootEnd = 0,
      firstCharCode = path.charCodeAt(0)
    if (pathLength === 1) return isPathSeparator(firstCharCode) ? path : '.'
    if (isPathSeparator(firstCharCode)) {
      if (((root = rootEnd = 1), isPathSeparator(path.charCodeAt(1)))) {
        let separatorIndex = 2,
          nextPartStart = separatorIndex
        while (separatorIndex < pathLength && !isPathSeparator(path.charCodeAt(separatorIndex))) separatorIndex++
        if (separatorIndex < pathLength && separatorIndex !== nextPartStart) {
          nextPartStart = separatorIndex
          while (separatorIndex < pathLength && isPathSeparator(path.charCodeAt(separatorIndex))) separatorIndex++
          if (separatorIndex < pathLength && separatorIndex !== nextPartStart) {
            nextPartStart = separatorIndex
            while (separatorIndex < pathLength && !isPathSeparator(path.charCodeAt(separatorIndex))) separatorIndex++
            if (separatorIndex === pathLength) return path
            if (separatorIndex !== nextPartStart) root = rootEnd = separatorIndex + 1
          }
        }
      }
    } else if (isAlphabet(firstCharCode) && path.charCodeAt(1) === colon) root = rootEnd = pathLength > 2 && isPathSeparator(path.charCodeAt(2)) ? 3 : 2
    let tail = -1,
      isTail = true
    for (let separatorIndex = pathLength - 1; separatorIndex >= rootEnd; --separatorIndex)
      if (isPathSeparator(path.charCodeAt(separatorIndex))) {
        if (!isTail) {
          tail = separatorIndex
          break
        }
      } else isTail = false
    if (tail === -1) {
      if (root === -1) return '.'
      tail = root
    }
    return path.slice(0, tail)
  },
  basename(path, ext) {
    if (ext !== void 0) validateString(ext, 'ext')
    validateString(path, 'path')
    let root = 0,
      tail = -1,
      isTail = true,
      pathIndex
    if (
      (path.length >= 2 && isAlphabet(path.charCodeAt(0)) && path.charCodeAt(1) === colon && (root = 2),
      ext !== void 0 && ext.length > 0 && ext.length <= path.length)
    ) {
      if (ext === path) return ''
      let extLength = ext.length - 1,
        extIndex = -1
      for (pathIndex = path.length - 1; pathIndex >= root; --pathIndex) {
        let charCode = path.charCodeAt(pathIndex)
        if (isPathSeparator(charCode)) {
          if (!isTail) {
            root = pathIndex + 1
            break
          }
        } else
          extIndex === -1 && ((isTail = false), (extIndex = pathIndex + 1)),
            extLength >= 0 && (charCode === ext.charCodeAt(extLength) ? --extLength === -1 && (tail = pathIndex) : ((extLength = -1), (tail = extIndex)))
      }
      return root === tail ? (tail = extIndex) : tail === -1 && (tail = path.length), path.slice(root, tail)
    }
    for (pathIndex = path.length - 1; pathIndex >= root; --pathIndex)
      if (isPathSeparator(path.charCodeAt(pathIndex))) {
        if (!isTail) {
          root = pathIndex + 1
          break
        }
      } else tail === -1 && ((isTail = false), (tail = pathIndex + 1))
    return tail === -1 ? '' : path.slice(root, tail)
  },
  extname(path) {
    validateString(path, 'path')
    let start = 0,
      dotPosition = -1,
      rootEnd = 0,
      nameEnd = -1,
      pathSeparator = true,
      nameStart = 0
    path.length >= 2 && path.charCodeAt(1) === colon && isAlphabet(path.charCodeAt(0)) && (start = rootEnd = 2)
    for (let i = path.length - 1; i >= start; --i) {
      let char = path.charCodeAt(i)
      if (isPathSeparator(char)) {
        if (!pathSeparator) {
          rootEnd = i + 1
          break
        }
        continue
      }
      nameEnd === -1 && ((pathSeparator = false), (nameEnd = i + 1)), char === dot ? (dotPosition === -1 ? (dotPosition = i) : nameStart !== 1 && (nameStart = 1)) : dotPosition !== -1 && (nameStart = -1)
    }
    return dotPosition === -1 || nameEnd === -1 || nameStart === 0 || (nameStart === 1 && dotPosition === nameEnd - 1 && dotPosition === rootEnd + 1) ? '' : path.slice(dotPosition, nameEnd)
  },
  format: formatPath.bind(null, '\\'),
  parse(path) {
    validateString(path, 'path')
    let pathObject = { root: '', dir: '', base: '', ext: '', name: '' }
    if (path.length === 0) return pathObject
    let length = path.length,
      rootEnd = 0,
      charCode = path.charCodeAt(0)
    if (length === 1) return isPathSeparator(charCode) ? ((pathObject.root = pathObject.dir = path), pathObject) : ((pathObject.base = pathObject.name = path), pathObject)
    if (isPathSeparator(charCode)) {
      if (((rootEnd = 1), isPathSeparator(path.charCodeAt(1)))) {
        let position = 2,
          separatorPosition = position
        for (; position < length && !isPathSeparator(path.charCodeAt(position)); ) position++
        if (position < length && position !== separatorPosition) {
          for (separatorPosition = position; position < length && isPathSeparator(path.charCodeAt(position)); ) position++
          if (position < length && position !== separatorPosition) {
            for (separatorPosition = position; position < length && !isPathSeparator(path.charCodeAt(position)); ) position++
            position === length ? (rootEnd = position) : position !== separatorPosition && (rootEnd = position + 1)
          }
        }
      }
    } else if (isAlphabet(charCode) && path.charCodeAt(1) === colon) {
      if (length <= 2) return (pathObject.root = pathObject.dir = path), pathObject
      if (((rootEnd = 2), isPathSeparator(path.charCodeAt(2)))) {
        if (length === 3) return (pathObject.root = pathObject.dir = path), pathObject
        rootEnd = 3
      }
    }
    rootEnd > 0 && (pathObject.root = path.slice(0, rootEnd))
    let dotPosition = -1,
      nameStart = rootEnd,
      nameEnd = -1,
      pathSeparator = true,
      lastPosition = path.length - 1,
      namePosition = 0
    for (; lastPosition >= rootEnd; --lastPosition) {
      if (((charCode = path.charCodeAt(lastPosition)), isPathSeparator(charCode))) {
        if (!pathSeparator) {
          nameStart = lastPosition + 1
          break
        }
        continue
      }
      nameEnd === -1 && ((pathSeparator = false), (nameEnd = lastPosition + 1)), charCode === dot ? (dotPosition === -1 ? (dotPosition = lastPosition) : namePosition !== 1 && (namePosition = 1)) : dotPosition !== -1 && (namePosition = -1)
    }
    return (
      nameEnd !== -1 &&
        (dotPosition === -1 || namePosition === 0 || (namePosition === 1 && dotPosition === nameEnd - 1 && dotPosition === nameStart + 1)
          ? (pathObject.base = pathObject.name = path.slice(nameStart, nameEnd))
          : ((pathObject.name = path.slice(nameStart, dotPosition)), (pathObject.base = path.slice(nameStart, nameEnd)), (pathObject.ext = path.slice(dotPosition, nameEnd)))),
      nameStart > 0 && nameStart !== rootEnd ? (pathObject.dir = path.slice(0, nameStart - 1)) : (pathObject.dir = pathObject.root),
      pathObject
    )
  },
  sep: '\\',
  delimiter: ';',
  win32: null,
  posix: null,
}
var getTransformedPath = (() => {
  if (isWindows) {
    let backslashGlobal = /\\/g
    return () => {
      let currentPath = getCurrentWorkingDirectory().replace(backslashGlobal, '/')
      return currentPath.slice(currentPath.indexOf('/'))
    }
  }
  return () => getCurrentWorkingDirectory()
})()
var posixPathOperations = {
  resolve(...segments) {
    let resolvedPath = '';
    let isAbsolute = false;
    for (let i = segments.length - 1; i >= -1 && !isAbsolute; i--) {
      let segment = i >= 0 ? segments[i] : getTransformedPath();
      validateString(segment, 'path');
      if (segment.length !== 0) {
        resolvedPath = `${segment}/${resolvedPath}`;
        isAbsolute = segment.charCodeAt(0) === forwardSlashCharCode;
      }
    }
    resolvedPath = normalizePath(resolvedPath, !isAbsolute, '/', isForwardSlash);
    return isAbsolute ? `/${resolvedPath}` : resolvedPath.length > 0 ? resolvedPath : '.';
  },
  normalize(path) {
    validateString(path, 'path');
    if (path.length === 0) return '.';
    let startsWithSlash = path.charCodeAt(0) === forwardSlashCharCode;
    let endsWithSlash = path.charCodeAt(path.length - 1) === forwardSlashCharCode;
    path = normalizePath(path, !startsWithSlash, '/', isForwardSlash);
    if (path.length === 0) return startsWithSlash ? '/' : endsWithSlash ? './' : '.';
    if (endsWithSlash) path += '/';
    return startsWithSlash ? `/${path}` : path;
  },
  isAbsolute(path) {
    validateString(path, 'path');
    return path.length > 0 && path.charCodeAt(0) === forwardSlashCharCode;
  },
  join(...segments) {
    if (segments.length === 0) return '.';
    let joinedPath;
    for (let i = 0; i < segments.length; ++i) {
      let segment = segments[i];
      validateString(segment, 'path');
      if (segment.length > 0) {
        joinedPath = joinedPath === undefined ? segment : `${joinedPath}/${segment}`;
      }
    }
    return joinedPath === undefined ? '.' : pathOperations.normalize(joinedPath);
  },
  relative(fromPath, toPath) {
    if ((validateString(fromPath, 'from'), validateString(toPath, 'to'), fromPath === toPath || ((fromPath = posixPathOperations.resolve(fromPath)), (toPath = posixPathOperations.resolve(toPath)), fromPath === toPath))) return ''
    let fromStart = 1,
      fromLength = fromPath.length,
      fromEnd = fromLength - fromStart,
      toStart = 1,
      toEnd = toPath.length - toStart,
      minLength = fromEnd < toEnd ? fromEnd : toEnd,
      lastCommonSep = -1,
      index = 0
    for (; index < minLength; index++) {
      let charCode = fromPath.charCodeAt(fromStart + index)
      if (charCode !== toPath.charCodeAt(toStart + index)) break
      charCode === forwardSlash && (lastCommonSep = index)
    }
    if (index === minLength)
      if (toEnd > minLength) {
        if (toPath.charCodeAt(toStart + index) === forwardSlash) return toPath.slice(toStart + index + 1)
        if (index === 0) return toPath.slice(toStart + index)
      } else fromEnd > minLength && (fromPath.charCodeAt(fromStart + index) === forwardSlash ? (lastCommonSep = index) : index === 0 && (lastCommonSep = 0))
    let relativePath = ''
    for (index = fromStart + lastCommonSep + 1; index <= fromLength; ++index) (index === fromLength || fromPath.charCodeAt(index) === forwardSlash) && (relativePath += relativePath.length === 0 ? '..' : '/..')
    return `${relativePath}${toPath.slice(toStart + lastCommonSep)}`
  },
  toNamespacedPath(path) {
    return path
  },
  dirname(path) {
    if ((validateString(path, 'path'), path.length === 0)) return '.'
    let isAbsolute = path.charCodeAt(0) === forwardSlash,
      lastSep = -1,
      seenNonSep = !0
    for (let index = path.length - 1; index >= 1; --index)
      if (path.charCodeAt(index) === forwardSlash) {
        if (!seenNonSep) {
          lastSep = index
          break
        }
      } else seenNonSep = !1
    return lastSep === -1 ? (isAbsolute ? '/' : '.') : isAbsolute && lastSep === 1 ? '//' : path.slice(0, lastSep)
  },
  basename(path, ext) {
    if (ext !== void 0) validateString(ext, 'ext')
    validateString(path, 'path')

    let start = 0,
      end = -1,
      seenNonSep = true,
      index

    if (ext !== void 0 && ext.length > 0 && ext.length <= path.length) {
      if (ext === path) return ''

      let extIndex = ext.length - 1,
        firstNonSep = -1

      for (index = path.length - 1; index >= 0; --index) {
        let charCode = path.charCodeAt(index)
        if (charCode === forwardSlash) {
          if (!seenNonSep) {
            start = index + 1
            break
          }
        } else {
          if (firstNonSep === -1) {
            seenNonSep = false
            firstNonSep = index + 1
          }
          if (extIndex >= 0) {
            if (charCode === ext.charCodeAt(extIndex)) {
              if (--extIndex === -1) {
                end = index
              }
            } else {
              extIndex = -1
              end = firstNonSep
            }
          }
        }
      }
      if (start === end) {
        end = firstNonSep
      } else if (end === -1) {
        end = path.length
      }
      return path.slice(start, end)
    }

    for (index = path.length - 1; index >= 0; --index) {
      if (path.charCodeAt(index) === forwardSlash) {
        if (!seenNonSep) {
          start = index + 1
          break
        }
      } else if (end === -1) {
        seenNonSep = false
        end = index + 1
      }
    }
    return end === -1 ? '' : path.slice(start, end)
  },
  extname(path) {
    validateString(path, 'path')

    let dotPos = -1,
      slashPos = 0,
      endPos = -1,
      seenNonSep = true,
      state = 0

    for (let index = path.length - 1; index >= 0; --index) {
      let charCode = path.charCodeAt(index)
      if (charCode === forwardSlash) {
        if (!seenNonSep) {
          slashPos = index + 1
          break
        }
        continue
      }
      if (endPos === -1) {
        seenNonSep = false
        endPos = index + 1
      }
      if (charCode === dot) {
        if (dotPos === -1) {
          dotPos = index
        } else if (state !== 1) {
          state = 1
        }
      } else if (dotPos !== -1) {
        state = -1
      }
    }
    return dotPos === -1 || endPos === -1 || state === 0 || (state === 1 && dotPos === endPos - 1 && dotPos === slashPos + 1) ? '' : path.slice(dotPos, endPos)
  },
  format: formatPath.bind(null, '/'),
  parse(path) {
    validateString(path, 'path')

    let pathObject = { root: '', dir: '', base: '', ext: '', name: '' }
    if (path.length === 0) return pathObject

    let isAbsolute = path.charCodeAt(0) === forwardSlash,
      index
    isAbsolute ? ((pathObject.root = '/'), (index = 1)) : (index = 0)

    let dotPos = -1,
      slashPos = 0,
      endPos = -1,
      seenNonSep = true,
      pathEnd = path.length - 1,
      state = 0

    for (; pathEnd >= index; --pathEnd) {
      let charCode = path.charCodeAt(pathEnd)
      if (charCode === forwardSlash) {
        if (!seenNonSep) {
          slashPos = pathEnd + 1
          break
        }
        continue
      }
      if (endPos === -1) {
        seenNonSep = false
        endPos = pathEnd + 1
      }
      if (charCode === dot) {
        if (dotPos === -1) {
          dotPos = pathEnd
        } else if (state !== 1) {
          state = 1
        }
      } else if (dotPos !== -1) {
        state = -1
      }
    }
    if (endPos !== -1) {
      let start = slashPos === 0 && isAbsolute ? 1 : slashPos
      if (dotPos === -1 || state === 0 || (state === 1 && dotPos === endPos - 1 && dotPos === slashPos + 1)) {
        pathObject.base = pathObject.name = path.slice(start, endPos)
      } else {
        pathObject.name = path.slice(start, dotPos)
        pathObject.base = path.slice(start, endPos)
        pathObject.ext = path.slice(dotPos, endPos)
      }
    }
    if (slashPos > 0) {
      pathObject.dir = path.slice(0, slashPos - 1)
    } else if (isAbsolute) {
      pathObject.dir = '/'
    }
    return pathObject
  },
  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null,
}
posixPathOperations.win32 = win32PathOperations.win32 = win32PathOperations
posixPathOperations.posix = win32PathOperations.posix = posixPathOperations
var normalizePath = isWindows ? win32PathOperations.normalize : posixPathOperations.normalize,
isAbsolutePath = isWindows ? win32PathOperations.isAbsolute : posixPathOperations.isAbsolute,
joinPath = isWindows ? win32PathOperations.join : posixPathOperations.join,
joinPath = isWindows ? win32PathOperations.resolve : posixPathOperations.resolve,
relativePath = isWindows ? win32PathOperations.relative : posixPathOperations.relative,
dirname = isWindows ? win32PathOperations.dirname : posixPathOperations.dirname,
basename = isWindows ? win32PathOperations.basename : posixPathOperations.basename,
extname = isWindows ? win32PathOperations.extname : posixPathOperations.extname,
formatPath = isWindows ? win32PathOperations.format : posixPathOperations.format,
parsePath = isWindows ? win32PathOperations.parse : posixPathOperations.parse,
toNamespacedPath = isWindows ? win32PathOperations.toNamespacedPath : posixPathOperations.toNamespacedPath,
pathSeparator = isWindows ? win32PathOperations.sep : posixPathOperations.sep,
pathDelimiter = isWindows ? win32PathOperations.delimiter : posixPathOperations.delimiter
var schemeRegex = /^\w[\w\d+.-]*$/,
singleSlashRegex = /^\//,
doubleSlashRegex = /^\/\//
function validateUri(uri, flag) {
  if (!uri.scheme && flag)
    throw new Error(
      `[UriError]: Scheme is missing: {scheme: "", authority: "${uri.authority}", path: "${uri.path}", query: "${uri.query}", fragment: "${uri.fragment}"}`
    )
  if (uri.scheme && !schemeRegex.test(uri.scheme)) throw new Error('[UriError]: Scheme contains illegal characters.')
  if (uri.path) {
    if (uri.authority) {
      if (!singleSlashRegex.test(uri.path))
        throw new Error(
          '[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character'
        )
    } else if (doubleSlashRegex.test(uri.path))
      throw new Error(
        '[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")'
      )
  }
}
function getDefaultScheme(scheme, flag) {
  return !scheme && !flag ? 'file' : scheme
}
function addDefaultSlash(scheme, e) {
  switch (scheme) {
    case 'https':
    case 'http':
    case 'file':
      path ? path[0] !== slash && (path = slash + path) : (path = slash)
      break
  }
  return path
}
var emptyString = '',
slash = '/',
uriRegex = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/,
Uri = class Uri {
  static isUri(instance) {
    return instance instanceof Uri
      ? true
      : instance
      ? typeof instance.authority == 'string' &&
        typeof instance.fragment == 'string' &&
        typeof instance.path == 'string' &&
        typeof instance.query == 'string' &&
        typeof instance.scheme == 'string' &&
        typeof instance.fsPath == 'string' &&
        typeof instance.with == 'function' &&
        typeof instance.toString == 'function'
      : false
  }
  constructor(scheme, authority, path, query, fragment, isWindows = false) {
    typeof scheme == 'object'
      ? ((this.scheme = scheme.scheme || emptyString),
        (this.authority = scheme.authority || emptyString),
        (this.path = scheme.path || emptyString),
        (this.query = scheme.query || emptyString),
        (this.fragment = scheme.fragment || emptyString))
      : ((this.scheme = getDefaultScheme(scheme, isWindows)),
        (this.authority = authority || emptyString),
        (this.path = addDefaultSlash(this.scheme, path || emptyString)),
        (this.query = query || emptyString),
        (this.fragment = fragment || emptyString),
        validateUri(this, isWindows))
  }
  get fsPath() {
    return getFilePath(this, false)
  }
  with(changes) {
    if (!changes) return this
    let { scheme, authority, path, query, fragment } = changes
    return (
      scheme === undefined ? (scheme = this.scheme) : scheme === null && (scheme = emptyString),
      authority === undefined ? (authority = this.authority) : authority === null && (authority = emptyString),
      path === undefined ? (path = this.path) : path === null && (path = emptyString),
      query === undefined ? (query = this.query) : query === null && (query = emptyString),
      fragment === undefined ? (fragment = this.fragment) : fragment === null && (fragment = emptyString),
      scheme === this.scheme && authority === this.authority && path === this.path && query === this.query && fragment === this.fragment
        ? this
        : new UriWithFileSystemPath(scheme, authority, path, query, fragment)
    )
  }
  static parse(uriString, isWindows = false) {
    let match = uriRegex.exec(uriString)
    return match
      ? new UriWithFileSystemPath(match[2] || emptyString, decodeUri(match[4] || emptyString), decodeUri(match[5] || emptyString), decodeUri(match[7] || emptyString), decodeUri(match[9] || emptyString), isWindows)
      : new UriWithFileSystemPath(emptyString, emptyString, emptyString, emptyString, emptyString)
  }
  static file(path) {
    let authority = emptyString
    if ((isWindowsFlag && (path = path.replace(/\\/g, slash)), path[0] === slash && path[1] === slash)) {
      let index = path.indexOf(slash, 2)
      index === -1 ? ((authority = path.substring(2)), (path = slash)) : ((authority = path.substring(2, index)), (path = path.substring(index) || slash))
    }
    return new UriWithFileSystemPath('file', authority, path, emptyString, emptyString)
  }
  static from(uri, isWindows) {
    return new UriWithFileSystemPath(uri.scheme, uri.authority, uri.path, uri.query, uri.fragment, isWindows)
  }
  static joinPath(uri, ...paths) {
    if (!uri.path) throw new Error('[UriError]: cannot call joinPath on URI without path')
    let newPath
    return (
      isWindowsFlag && uri.scheme === 'file' ? (newPath = Uri.file(win32PathOperations.join(getFilePath(uri, true), ...paths)).path) : (newPath = posixPathOperations.join(uri.path, ...paths)),
      uri.with({ path: newPath })
    )
  }
  toString(skipEncoding = false) {
    return formatUri(this, skipEncoding)
  }
  toJSON() {
    return this
  }
  static revive(data) {
    if (data) {
      if (data instanceof Uri) return data
      {
        let revivedUri = new UriWithFileSystemPath(data)
        return (revivedUri._formatted = data.external ?? null), (revivedUri._fsPath = data._sep === pathSeparator ? data.fsPath ?? null : null), revivedUri
      }
    } else return data
  }
}
var pathSeparator = isWindowsFlag ? 1 : undefined;
var UriWithFileSystemPath = class extends Uri {
  constructor() {
    super(...arguments);
    this._formatted = null;
    this._fsPath = null;
  }

  get fsPath() {
    if (!this._fsPath) {
      this._fsPath = getFilePath(this, false);
    }
    return this._fsPath;
  }

  toString(skipEncoding = false) {
    if (!this._formatted) {
      this._formatted = formatUri(this, false);
    }
    return skipEncoding ? formatUri(this, true) : this._formatted;
  }

  toJSON() {
    let json = { $mid: 1 };

    if (this._fsPath) {
      json.fsPath = this._fsPath;
      json._sep = pathSeparator;
    }

    if (this._formatted) {
      json.external = this._formatted;
    }

    if (this.path) {
      json.path = this.path;
    }

    if (this.scheme) {
      json.scheme = this.scheme;
    }

    if (this.authority) {
      json.authority = this.authority;
    }

    if (this.query) {
      json.query = this.query;
    }

    if (this.fragment) {
      json.fragment = this.fragment;
    }

    return json;
  }
};

var encodedCharacters = {
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
};

function encodeUriComponent(uriComponent, allowSlash, allowColonBrackets) {
  let encoded,
    lastEncodedIndex = -1;

  for (let i = 0; i < uriComponent.length; i++) {
    let charCode = uriComponent.charCodeAt(i);

    if (
      (charCode >= 97 && charCode <= 122) ||
      (charCode >= 65 && charCode <= 90) ||
      (charCode >= 48 && charCode <= 57) ||
      charCode === 45 ||
      charCode === 46 ||
      charCode === 95 ||
      charCode === 126 ||
      (allowSlash && charCode === 47) ||
      (allowColonBrackets && charCode === 91) ||
      (allowColonBrackets && charCode === 93) ||
      (allowColonBrackets && charCode === 58)
    ) {
      if (lastEncodedIndex !== -1) {
        encoded += encodeURIComponent(uriComponent.substring(lastEncodedIndex, i));
        lastEncodedIndex = -1;
      }
      if (encoded !== undefined) {
        encoded += uriComponent.charAt(i);
      }
    } else {
      if (encoded === undefined) {
        encoded = uriComponent.substr(0, i);
      }
      let encodedChar = encodedCharacters[charCode];
      if (encodedChar !== undefined) {
        if (lastEncodedIndex !== -1) {
          encoded += encodeURIComponent(uriComponent.substring(lastEncodedIndex, i));
          lastEncodedIndex = -1;
        }
        encoded += encodedChar;
      } else if (lastEncodedIndex === -1) {
        lastEncodedIndex = i;
      }
    }
  }

  if (lastEncodedIndex !== -1) {
    encoded += encodeURIComponent(uriComponent.substring(lastEncodedIndex));
  }

  return encoded !== undefined ? encoded : uriComponent;
}

function encodeHashAndQuestionMark(uri) {
  let encodedUri;
  for (let i = 0; i < uri.length; i++) {
    let charCode = uri.charCodeAt(i);
    if (charCode === 35 || charCode === 63) { // '#' or '?'
      if (encodedUri === undefined) {
        encodedUri = uri.substr(0, i);
      }
      encodedUri += encodedCharacters[charCode];
    } else if (encodedUri !== undefined) {
      encodedUri += uri[i];
    }
  }
  return encodedUri !== undefined ? encodedUri : uri;
}

function getFilePath(uri, isWindows) {
  let filePath;
  if (uri.authority && uri.path.length > 1 && uri.scheme === 'file') {
    filePath = `//${uri.authority}${uri.path}`;
  } else if (uri.path.charCodeAt(0) === 47 && // '/'
    ((uri.path.charCodeAt(1) >= 65 && uri.path.charCodeAt(1) <= 90) || // 'A' - 'Z'
    (uri.path.charCodeAt(1) >= 97 && uri.path.charCodeAt(1) <= 122)) && // 'a' - 'z'
    uri.path.charCodeAt(2) === 58) { // ':'
    filePath = isWindows ? uri.path.substr(1) : uri.path[1].toLowerCase() + uri.path.substr(2);
  } else {
    filePath = uri.path;
  }
  if (isWindows) {
    filePath = filePath.replace(/\//g, '\\');
  }
  return filePath;
}

function formatUri(uri, skipEncoding) {
  let encode = skipEncoding ? encodeHashAndQuestionMark : encodeUriComponent;
  let formattedUri = '';
  let { scheme, authority, path, query, fragment } = uri;

  if (scheme) {
    formattedUri += scheme + ':';
  }
  if (authority || scheme === 'file') {
    formattedUri += '//' + authority;
  }
  if (authority) {
    let atIndex = authority.indexOf('@');
    if (atIndex !== -1) {
      let userInfo = authority.substr(0, atIndex);
      authority = authority.substr(atIndex + 1);
      let colonIndex = userInfo.lastIndexOf(':');
      if (colonIndex === -1) {
        formattedUri += encode(userInfo, false, false);
      } else {
        formattedUri += encode(userInfo.substr(0, colonIndex), false, false) + ':' + encode(userInfo.substr(colonIndex + 1), false, true);
      }
      formattedUri += '@';
    }
    authority = authority.toLowerCase();
    let colonIndex = authority.lastIndexOf(':');
    if (colonIndex === -1) {
      formattedUri += encode(authority, false, true);
    } else {
      formattedUri += encode(authority.substr(0, colonIndex), false, true) + authority.substr(colonIndex);
    }
  }
  if (path) {
    if (path.length >= 3 && path.charCodeAt(0) === 47 && path.charCodeAt(2) === 58) {
      let charCode = path.charCodeAt(1);
      if (charCode >= 65 && charCode <= 90) { // 'A' - 'Z'
        path = `/${String.fromCharCode(charCode + 32)}:${path.substr(3)}`;
      }
    } else if (path.length >= 2 && path.charCodeAt(1) === 58) { // ':'
      let charCode = path.charCodeAt(0);
      if (charCode >= 65 && charCode <= 90) { // 'A' - 'Z'
        path = `${String.fromCharCode(charCode + 32)}:${path.substr(2)}`;
      }
    }
    formattedUri += encode(path, true, false);
  }
  if (query) {
    formattedUri += '?' + encode(query, false, false);
  }
  if (fragment) {
    formattedUri += '#' + (skipEncoding ? fragment : encodeUriComponent(fragment, false, false));
  }
  return formattedUri;
}

function decodeUriComponent(uriComponent) {
  try {
    return decodeURIComponent(uriComponent);
  } catch {
    return uriComponent.length > 3 ? uriComponent.substr(0, 3) + decodeUriComponent(uriComponent.substr(3)) : uriComponent;
  }
}

var encodedUriPattern = /(%[0-9A-Za-z][0-9A-Za-z])+/g;

function decodeUri(uri) {
  return uri.match(encodedUriPattern) ? uri.replace(encodedUriPattern, component => decodeUriComponent(component)) : uri;
}

var githubDomain = 'github.com',
  defaultBaseUrl = `https://${githubDomain}`,
  BaseBaseGithubApiServiceClass = class {},
  GitHubAPI = class extends BaseGithubApiService {
    constructor(baseUrl = defaultBaseUrl) {
      super();
      this.recalculateUrls(baseUrl);
    }
    isGitHubEnterprise() {
      return this.isEnterprise;
    }
    getTokenUrl(config) {
      return config.devOverride?.copilotTokenUrl ?? this.tokenUrl;
    }
    getNotificationUrl(config) {
      return config.devOverride?.notificationUrl ?? this.notificationUrl;
    }
    updateBaseUrl(context, newBaseUrl) {
      if (!newBaseUrl) return;
      let oldBaseUri = this.baseUri;
      this.recalculateUrls(newBaseUrl);
      if (oldBaseUri.toString() !== this.baseUri.toString()) {
        context.get(TokenManager).resetCopilotToken(context);
      }
    }
    recalculateUrls(baseUrl) {
      this.baseUri = Uri.parse(baseUrl);
      let apiUri = Uri.parse(`${this.baseUri.scheme}://api.${this.baseUri.authority}`);
      this.isEnterprise = this.baseUri.authority !== githubDomain;
      this.tokenUrl = Uri.joinPath(apiUri, '/copilot_internal/v2/token').toString();
      this.notificationUrl = Uri.joinPath(apiUri, '/copilot_internal/notification').toString();
    }
  };

function getLogger(context) {
  return context.get(LoggerManager).getLogger('auth');
}

var tokenRefreshInterval = 60,
tokenRefreshedEvent = 'token_refreshed',
githubTokenChangedEvent = 'github_token_changed'
function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1e3)
}

async function fetchCopilotToken(context, config) {
  let logger = getLogger(context),
    telemetryService = context.get(TelemetryService);
  telemetryService.sendTelemetry('auth.new_login');

  let response = await fetchToken(context, config);
  if (!response) {
    logger.info('Failed to get copilot token');
    telemetryService.sendErrorTelemetry('auth.request_failed');
    return { kind: 'failure', reason: 'FailedToGetToken' };
  }

  let responseBody = await response.json();
  if (!responseBody) {
    logger.info('Failed to get copilot token');
    telemetryService.sendErrorTelemetry('auth.request_read_failed');
    return { kind: 'failure', reason: 'FailedToGetToken' };
  }

  if (response.status === 401) {
    logger.info('Failed to get copilot token due to 401 status');
    telemetryService.sendErrorTelemetry('auth.unknown_401');
    return { kind: 'failure', reason: 'HTTP401' };
  }

  if (!response.ok || !responseBody.token) {
    logger.info(`Invalid copilot token: missing token: ${response.status} ${response.statusText}`);
    telemetryService.sendErrorTelemetry(
      'auth.invalid_token',
      TelemetryEvent.createAndMarkAsIssued({ status: response.status.toString(), status_text: response.statusText })
    );
    return { kind: 'failure', reason: 'NotAuthorized', ...responseBody.error_details };
  }

  let originalExpiry = responseBody.expires_at;
  responseBody.expires_at = getCurrentTimestamp() + responseBody.refresh_in + tokenRefreshInterval;

  let { token, organization_list: organizations, ...otherDetails } = responseBody,
    copilotToken = new CopilotToken(token, organizations);

  return (
    context.get(EventEmitter).emit('onCopilotToken', copilotToken, otherDetails),
    telemetryService.sendTelemetry(
      'auth.new_token',
      TelemetryEvent.createAndMarkAsIssued({}, { adjusted_expires_at: responseBody.expires_at, expires_at: originalExpiry, current_time: getCurrentTimestamp() })
    ),
    { kind: 'success', ...responseBody }
  );
}

async function fetchToken(context, config) {
  let tokenUrl = context.get(BaseGithubApiService).getTokenUrl(config);
  try {
    return await context
      .get(ConnectionSettings)
      .fetch(tokenUrl, { headers: { Authorization: `token ${config.token}`, ...context.get(BuildInfo).getEditorVersionHeaders() } });
  } catch (error) {
    throw (context.get(CertificateErrorHandler).notifyUser(context, error), error);
  }
}

var TokenParser = class {
  constructor(token, organizationList) {
    this.token = token
    this.organizationList = organizationList
    this.tokenMap = this.parseToken(token)
  }
  parseToken(token) {
    let map = new Map(),
      items = token?.split(':')[0]?.split(';')
    for (let item of items) {
      let [key, value] = item.split('=')
      map.set(key, value)
    }
    return map
  }
  get isInternal() {
    let internalIds = [
      '4535c7beffc844b46bb1ed4aa04d759a',
      'a5db0bcaae94032fe715fb34a5e4bce2',
      '7184f66dfcee98cb5f08a1cb936d5225',
    ]
    if (!this.organizationList) return false
    for (let id of this.organizationList) if (internalIds.includes(id)) return true
    return false
  }
  getTokenValue(key) {
    return this.tokenMap.get(key)
  }
}
var BaseTokenHandler = class {
  constructor() {
    this.copilotTokenRefreshEventEmitter = new events.EventEmitter()
    this.githubTokenChangedEventEmitter = new events.EventEmitter()
  }
}
var DefaultTokenHandler = class extends BaseTokenHandler {
  constructor(completionsToken, embeddingsToken) {
    super()
    this.completionsToken = completionsToken
    this.embeddingsToken = embeddingsToken
    this.wasReset = false
  }
  getBasicGitHubToken() {
    return Promise.resolve('token')
  }
  getPermissiveGitHubToken() {
    return Promise.resolve('token')
  }
  async getCopilotToken(context, forceRefresh) {
    return new TokenParser(this.completionsToken)
  }
  async getEmbeddingsToken(context, forceRefresh) {
    return new TokenParser(this.embeddingsToken ?? this.completionsToken)
  }
  resetCopilotToken(context, httpErrorCode) {
    this.wasReset = true
  }
  async checkCopilotToken(context) {
    return { status: 'OK' }
  }
}
var GitHubTokenHandler = class extends BaseTokenHandler {
  constructor(githubToken) {
    super()
    this.githubToken = githubToken
    this.copilotToken = undefined
  }
  getBasicGitHubToken() {
    return Promise.resolve(this.githubToken.token)
  }
  getPermissiveGitHubToken() {
    return Promise.resolve(this.githubToken.token)
  }
  async getCopilotToken(context, forceRefresh) {
    if (!this.copilotToken || this.copilotToken.expires_at < getCurrentTimestamp() || forceRefresh) {
      let response = await fetchCopilotToken(context, this.githubToken)
      if (response.kind === 'failure') throw Error(`Failed to get copilot token: ${response.reason.toString()} ${response.message ?? ''}`)
      this.copilotToken = { ...response }
      scheduleTokenRefresh(context, this, response.refresh_in)
    }
    return new TokenParser(this.copilotToken.token, this.copilotToken.organizationList)
  }
  async checkCopilotToken(context) {
    if (!this.copilotToken || this.copilotToken.expires_at < getCurrentTimestamp()) {
      let response = await fetchCopilotToken(context, this.githubToken)
      if (response.kind === 'failure') return response
      this.copilotToken = { ...response }
      scheduleTokenRefresh(context, this, response.refresh_in)
    }
    return { status: 'OK' }
  }
  resetCopilotToken(context, httpErrorCode) {
    if (httpErrorCode !== undefined) {
      context.get(TelemetryService).sendTelemetry('auth.reset_token_' + httpErrorCode)
    }
    getLogger(context).debug(`Resetting copilot token on HTTP error ${httpErrorCode || 'unknown'}`)
    this.copilotToken = undefined
  }
}
var refreshCountMap = new WeakMap()
function scheduleTokenRefresh(context, tokenHandler, refreshIntervalInSeconds) {
  let currentTime = getCurrentTimestamp(),
    refreshCount = refreshCountMap.get(tokenHandler) ?? refreshCountMap.set(tokenHandler, { value: 0 }).get(tokenHandler)
  if (refreshCount.value <= 0) {
    refreshCount.value++
    setTimeout(async () => {
      let result,
        errorReason = ''
      try {
        refreshCount.value--
        await tokenHandler.getCopilotToken(context, true)
        result = 'success'
        tokenHandler.copilotTokenRefreshEventEmitter.emit(tokenRefreshedEvent)
      } catch (error) {
        result = 'failure'
        errorReason = error.toString()
      }
      let telemetryEvent = TelemetryEvent.createAndMarkAsIssued({ result: result }, { time_taken: getCurrentTimestamp() - currentTime, refresh_count: refreshCount.value })
      if (errorReason) {
        telemetryEvent.properties.reason = errorReason
      }
      context.get(TelemetryService).sendTelemetry('auth.token_refresh', telemetryEvent)
    }, refreshIntervalInSeconds * 1000)
  }
}
function handleGithubTokenChange(authProvider, tokenHandler) {
  if (authProvider.id === 'github') {
    tokenHandler.githubTokenChangedEventEmitter.emit(githubTokenChangedEvent, authProvider);
  }
}

var ContributionManager = new (class {
  constructor() {
    this.contributions = new Set();
  }
  start(contribution) {
    for (let contributor of this.contributions) contributor(contribution);
  }
  registerContribution(contribution) {
    this.contributions.add(contribution);
  }
})();
var ChatAgentServiceIdentifier = createServiceIdentifier('IChatAgentService'),
workspace = 'workspace',
vscode = 'vscode',
terminal = 'terminal'
var Crypto = require('crypto');

function createResponseMetadata(response, completion) {
  return {
    headerRequestId: response.headers.get('x-request-id') || '',
    completionId: completion && completion.id ? completion.id : '',
    created: completion && completion.created ? completion.created : 0,
    serverExperiments: response.headers.get('X-Copilot-Experiment') || '',
    deploymentId: response.headers.get('azureml-model-deployment') || '',
  };
}

function getProcessingTime(response) {
  let processingTime = response.headers.get('openai-processing-ms');
  return processingTime ? parseInt(processingTime, 10) : 0;
}

function isValidErrorDetails(error) {
  if (typeof error != 'object' || error === null || !('details' in error)) return false;
  let { details } = error;
  return (
    typeof details == 'object' &&
    details !== null &&
    'type' in details &&
    'description' in details &&
    typeof details.type == 'string' &&
    typeof details.description == 'string'
  );
}

var CompletionData = class {
  constructor() {
    this.logprobs = [];
    this.top_logprobs = [];
    this.text = [];
    this.newText = [];
    this.tokens = [];
    this.text_offset = [];
  }
  append(completion) {
    if (completion.text) {
      this.text.push(completion.text);
      this.newText.push(completion.text);
    }
    if (completion.delta?.content) {
      this.text.push(completion.delta.content);
      this.newText.push(completion.delta.content);
    }
    if (completion.logprobs) {
      this.tokens.push(completion.logprobs.tokens ?? []);
      this.text_offset.push(completion.logprobs.text_offset ?? []);
      this.logprobs.push(completion.logprobs.token_logprobs ?? []);
      this.top_logprobs.push(completion.logprobs.top_logprobs ?? []);
    }
  }
  flush() {
    let joinedText = this.newText.join('');
    this.newText = [];
    return joinedText;
  }
}

function splitAndFilterEmptyLines(text) {
  let lines = text.split('\n');
  let lastLine = lines.pop();
  return [lines.filter(line => line !== ''), lastLine];
}

var StreamProcessor = class {
  constructor(dependencies, expectedNumChoices, ourRequestId, response, body, telemetryData, dropCompletionReasons, fastCancellation, cancellationToken) {
    this.expectedNumChoices = expectedNumChoices;
    this.ourRequestId = ourRequestId;
    this.response = response;
    this.body = body;
    this.telemetryData = telemetryData;
    this.dropCompletionReasons = dropCompletionReasons;
    this.fastCancellation = fastCancellation;
    this.cancellationToken = cancellationToken;
    this.requestId = createResponseMetadata(this.response);
    this.stats = new ChoiceTracker(this.expectedNumChoices);
    this.solutions = {};
    this.logger = dependencies.get(LoggerManager).getLogger('streamChoices');
    this.ghTelemetry = dependencies.get(IGHTelemetryService);
  }
  static async create(dependencies, expectedNumChoices, ourRequestId, response, telemetryData, dropCompletionReasons, cancellationToken) {
    let body = await response.body();
    body.setEncoding('utf8');
    let fastCancellation = await dependencies.get(ExperimentManager).fastCancellation();
    return new StreamProcessor(dependencies, expectedNumChoices, ourRequestId, response, body, telemetryData, dropCompletionReasons ?? ['content_filter'], fastCancellation, cancellationToken);
  }
  async *processSSE(finishedCb = async () => {}) {
    try {
      yield* this.processSSEInner(finishedCb)
    } finally {
      this.fastCancellation && this.cancel(),
        this.logger.info(
          `request done: requestId: [${this.ourRequestId}] responseId: [${this.requestId.headerRequestId}] model deployment ID: [${this.requestId.deploymentId}]`
        ),
        this.logger.debug(`request stats: ${this.stats}`)
    }
  }
  async *processSSEInner(finishedCb) {
    let remaining = '',
      hasYielded = false;
    outer: for await (let chunk of this.body) {
      if (this.maybeCancel('after awaiting body chunk')) return;
      this.logger.debug('chunk', chunk.toString());
      let [lines, leftover] = splitAndFilterEmptyLines(remaining + chunk.toString());
      remaining = leftover;
      for (let line of lines) {
        let data = line.slice(5).trim();
        if (data === '[DONE]') {
          yield* this.finishSolutions();
          return;
        }
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch {
          this.logger.error(`Error parsing JSON stream data for request id ${this.requestId.headerRequestId}:`, line);
          logError(this.ghTelemetry, `Error parsing JSON stream data for request id ${this.requestId.headerRequestId}:`, a)
          continue;
        }
        if (parsedData.choices === undefined) {
          if (parsedData.error !== undefined) {
            this.logger.error(`Error in response for request id ${this.requestId.headerRequestId}:`, parsedData.error.message);
          } else {
            this.logger.error(`Unexpected response with no choices or error for request id ${this.requestId.headerRequestId}`);
          }
          continue;
        }
        if (this.requestId.created === 0) {
          this.requestId = createResponseMetadata(this.response, parsedData);
          if (this.requestId.created === 0 && parsedData.choices?.length) {
            this.logger.error(`Request id invalid, should have "completionId" and "created": ${JSON.stringify(this.requestId)}`, this.requestId);
          }
        }
        if (this.allSolutionsDone() && this.fastCancellation) break outer;
        for (let i = 0; i < parsedData.choices.length; i++) {
          let choice = parsedData.choices[i];
          this.logger.debug('choice', choice);
          this.stats.add(choice.index);
          if (!(choice.index in this.solutions)) this.solutions[choice.index] = new CompletionData();
          let solution = this.solutions[choice.index];
          if (solution === null) continue;
          let finishOffset,
            processChoice = async annotations => {
              if (annotations && (!Array.isArray(annotations) || !annotations.every(isValidErrorDetails))) {
                annotations = undefined;
              }
              finishOffset = await finishedCb(solution.text.join(''), choice.index, { text: solution.flush(), annotations });
              hasYielded = finishOffset !== undefined;
              return this.maybeCancel('after awaiting finishedCb');
            };
          if (choice.delta?.annotations?.CodeVulnerability) {
            if ((await processChoice()) || (!hasYielded && (solution.append(choice), await processChoice(choice.delta.annotations.CodeVulnerability)))) continue;
          } else {
            solution.append(choice);
            let hasNewline = choice.text?.indexOf('\n') > -1 || choice.delta?.content?.includes('\n');
            if ((choice.finish_reason || hasNewline) && (await processChoice())) continue;
          }
          if (!(!!choice.finish_reason || finishOffset !== undefined)) continue;
          let reason = choice.finish_reason ?? 'client-trimmed';
          if (this.dropCompletionReasons.includes(choice.finish_reason)) {
            this.solutions[choice.index] = null;
          } else {
            this.stats.markYielded(choice.index);
            yield {
              solution,
              finishOffset,
              reason,
              requestId: this.requestId,
              index: choice.index,
            };
            if (this.maybeCancel('after yielding finished choice')) return;
            this.solutions[choice.index] = null;
          }
        }
      }
    }
    for (let [index, solution] of Object.entries(this.solutions)) {
      let numericIndex = Number(index);
      if (
        solution !== null &&
        (this.stats.markYielded(numericIndex),
        yield { solution, finishOffset: undefined, reason: 'Iteration Done', requestId: this.requestId, index: numericIndex },
        this.maybeCancel('after yielding after iteration done'))
      )
        return;
    }
    if (remaining.length > 0 && !hasYielded) {
      try {
        let parsedData = JSON.parse(remaining);
        if (parsedData.error !== undefined) {
          this.logger.error(`Error in response: ${parsedData.error.message}`, parsedData.error);
        }
      } catch {
        this.logger.error(`Error parsing extraData for request id ${this.requestId.headerRequestId}: ${remaining}`);
      }
    }
  }
  async *finishSolutions() {
    for (let [index, solution] of Object.entries(this.solutions)) {
      let numericIndex = Number(index)
      if (
        solution !== null &&
        (this.stats.markYielded(numericIndex),
        yield { solution: solution, finishOffset: undefined, reason: 'DONE', requestId: this.requestId, index: numericIndex },
        this.maybeCancel('after yielding on DONE'))
      )
        return
    }
  }
  maybeCancel(reason) {
    return this.cancellationToken?.isCancellationRequested
      ? (this.logger.debug('Cancelled: ' + reason), this.cancel(), true)
      : false
  }
  cancel() {
    this.body.destroy()
  }
  allSolutionsDone() {
    let solutions = Object.values(this.solutions)
    return solutions.length === this.expectedNumChoices && solutions.every(solution => solution === null)
  }
}
function processResponse(response, data) {
  let processedData = { text: data.text.join(''), tokens: data.text }
  if (data.logprobs.length === 0) return processedData
  let tokenLogprobs = data.logprobs.reduce((accumulator, current) => accumulator.concat(current), []),
    topLogprobs = data.top_logprobs.reduce((accumulator, current) => accumulator.concat(current), []),
    textOffset = data.text_offset.reduce((accumulator, current) => accumulator.concat(current), []),
    tokens = data.tokens.reduce((accumulator, current) => accumulator.concat(current), [])
  return { ...processedData, logprobs: { token_logprobs: tokenLogprobs, top_logprobs: topLogprobs, text_offset: textOffset, tokens: tokens } }
}

var ChoiceTracker = class {
  constructor(size) {
    this.choices = new Map()
    for (let index = 0; index < size; index++) this.choices.set(index, new TokenCounter())
  }
  add(choiceIndex) {
    this.choices.get(choiceIndex).increment()
  }
  markYielded(choiceIndex) {
    this.choices.get(choiceIndex).markYielded()
  }
  toString() {
    return Array.from(this.choices.entries())
      .map(([index, counter]) => `${index}: ${counter.yieldedTokens} -> ${counter.seenTokens}`)
      .join(', ')
  }
}
var TokenCounter = class {
  constructor() {
    this.yieldedTokens = -1
    this.seenTokens = 0
  }
  increment() {
    this.seenTokens++
  }
  markYielded() {
    this.yieldedTokens = this.seenTokens
  }
}

function logError(telemetry, error, context) {
  let message = [error, context],
    formattedMessage = message.length > 0 ? JSON.stringify(message) : 'no msg'
  telemetry.sendRestrictedErrorTelemetry('log', TelemetryEvent.createAndMarkAsIssued({ context: 'fetch', level: LogLevel[3], message: formattedMessage })),
    telemetry.sendErrorTelemetry('log', TelemetryEvent.createAndMarkAsIssued({ context: 'fetch', level: LogLevel[3], message: '[redacted]' }))
}
var tokenSequenceConfig = [
  { max_token_sequence_length: 1, last_tokens_to_consider: 10 },
  { max_token_sequence_length: 10, last_tokens_to_consider: 30 },
  { max_token_sequence_length: 20, last_tokens_to_consider: 45 },
  { max_token_sequence_length: 30, last_tokens_to_consider: 60 },
]

function isClientTokenSequenceRepetitive(tokens, type = 'client') {
  if (type === 'proxy') return false
  let reversedTokens = tokens.slice()
  reversedTokens.reverse()
  return isRepetitive(reversedTokens) || isRepetitive(reversedTokens.filter(token => token.trim().length > 0))
}

function isRepetitive(tokens) {
  let prefixTable = buildPrefixTable(tokens)
  for (let config of tokenSequenceConfig) {
    if (tokens.length < config.last_tokens_to_consider) continue
    if (config.last_tokens_to_consider - 1 - prefixTable[config.last_tokens_to_consider - 1] <= config.max_token_sequence_length) return true
  }
  return false
}

function buildPrefixTable(tokens) {
  let prefixTable = Array(tokens.length).fill(0)
  prefixTable[0] = -1
  let matchedPrefixEnd = -1
  for (let i = 1; i < tokens.length; i++) {
    while (matchedPrefixEnd >= 0 && tokens[matchedPrefixEnd + 1] !== tokens[i]) {
      matchedPrefixEnd = prefixTable[matchedPrefixEnd]
    }
    if (tokens[matchedPrefixEnd + 1] === tokens[i]) {
      matchedPrefixEnd++
    }
    prefixTable[i] = matchedPrefixEnd
  }
  return prefixTable
}

function getConversationType(type) {
  switch (type) {
    case 1:
      return 'conversationInline'
    case 2:
      return 'conversationPanel'
    default:
      return 'none'
  }
}
var defaultExportsHandler = handleDefaultExports(AW()),
  path = require('path'),
  Tokenizer = class {
    constructor() {}
    tokenize(input) {
      if (!this._cl100kTokenizer) {
        this._cl100kTokenizer = this.initTokenizer();
      }
      return this._cl100kTokenizer.encode(input);
    }
    leadingString(input, prefix) {
      if (!this._cl100kTokenizer) {
        this._cl100kTokenizer = this.initTokenizer();
      }
      return this._cl100kTokenizer.encodeTrimPrefix(input, prefix).text;
    }
    tokenLength(input) {
      return input ? this.tokenize(input).length : 0;
    }
    initTokenizer() {
      return defaultExportsHandler.createTokenizer(
        path.join(__dirname, './cl100k_base.tiktoken'),
        defaultExportsHandler.getSpecialTokensByEncoder('cl100k_base'),
        defaultExportsHandler.getRegexByEncoder('cl100k_base'),
        64e3
      );
    }
  }
function calculateTokenLength(container, elements) {
  let tokenizer = container.get(Tokenizer),
    baseIncrement = 3,
    elementIncrement = 3,
    nameIncrement = -1,
    totalLength = 0;
  for (let element of elements) {
    totalLength += elementIncrement;
    for (let [key, value] of Object.entries(element)) {
      if (value) {
        totalLength += tokenizer.tokenLength(value);
        if (key === 'name') {
          totalLength += nameIncrement;
        }
      }
    }
  }
  return (totalLength += baseIncrement);
}
var Node = class Node {
  static {
    this.Undefined = new Node(void 0)
  }
  constructor(element) {
    this.element = element;
    this.next = Node.Undefined;
    this.prev = Node.Undefined;
  }
},
LinkedList = class {
  constructor() {
    this._first = Node.Undefined;
    this._last = Node.Undefined;
    this._size = 0;
  }
  get size() {
    return this._size;
  }
  isEmpty() {
    return this._first === Node.Undefined;
  }
  clear() {
    let node = this._first;
    while (node !== Node.Undefined) {
      let nextNode = node.next;
      node.prev = Node.Undefined;
      node.next = Node.Undefined;
      node = nextNode;
    }
    this._first = Node.Undefined;
    this._last = Node.Undefined;
    this._size = 0;
  }
  unshift(element) {
    return this._insert(element, false);
  }
  push(element) {
    return this._insert(element, true);
  }
  _insert(element, atEnd) {
    let newNode = new Node(element);
    if (this._first === Node.Undefined) {
      this._first = newNode;
      this._last = newNode;
    } else if (atEnd) {
      let lastNode = this._last;
      this._last = newNode;
      newNode.prev = lastNode;
      lastNode.next = newNode;
    } else {
      let firstNode = this._first;
      this._first = newNode;
      newNode.next = firstNode;
      firstNode.prev = newNode;
    }
    this._size += 1;
    let removed = false;
    return () => {
      if (!removed) {
        removed = true;
        this._remove(newNode);
      }
    }
  }
  shift() {
    if (this._first !== Node.Undefined) {
      let element = this._first.element;
      this._remove(this._first);
      return element;
    }
  }
  pop() {
    if (this._last !== Node.Undefined) {
      let element = this._last.element;
      this._remove(this._last);
      return element;
    }
  }
  _remove(node) {
    if (node.prev !== Node.Undefined && node.next !== Node.Undefined) {
      let prevNode = node.prev;
      prevNode.next = node.next;
      node.next.prev = prevNode;
    } else if (node.prev === Node.Undefined && node.next === Node.Undefined) {
      this._first = Node.Undefined;
      this._last = Node.Undefined;
    } else if (node.next === Node.Undefined) {
      this._last = this._last.prev;
      this._last.next = Node.Undefined;
    } else if (node.prev === Node.Undefined) {
      this._first = this._first.next;
      this._first.prev = Node.Undefined;
    }
    this._size -= 1;
  }
  *[Symbol.iterator]() {
    let node = this._first;
    while (node !== Node.Undefined) {
      yield node.element;
      node = node.next;
    }
  }
}
var isPerformanceNowSupported = globalThis.performance && typeof globalThis.performance.now == 'function',
Stopwatch = class Stopwatch {
  static create(useDateNow) {
    return new Stopwatch(useDateNow)
  }
  constructor(useDateNow) {
    this._now = isPerformanceNowSupported && useDateNow === false ? Date.now : globalThis.performance.now.bind(globalThis.performance);
    this._startTime = this._now();
    this._stopTime = -1;
  }
  stop() {
    this._stopTime = this._now();
  }
  reset() {
    this._startTime = this._now();
    this._stopTime = -1;
  }
  elapsed() {
    return this._stopTime !== -1 ? this._stopTime - this._startTime : this._now() - this._startTime;
  }
}
var isDebugMode = false,
isSnapshotEmitterEnabled = false,
EventUtils
;(exports => {
  exports.None = () => Disposable.None
  function e(L) {
    if (isSnapshotEmitterEnabled) {
      let { onDidAddListener: S } = L,
        T = StackTrace.create(),
        A = 0
      L.onDidAddListener = () => {
        ++A === 2 &&
          (console.warn(
            'snapshotted emitter LIKELY used public and SHOULD HAVE BEEN created with DisposableStore. snapshotted here'
          ),
          T.print()),
          S?.()
      }
    }
  }
  function defer(L, S) {
    return debounce(L, () => {}, 0, void 0, !0, void 0, S)
  }
  exports.defer = defer
  function once(L) {
    return (S, T = null, A) => {
      let X = !1,
        fe
      return (
        (fe = L(
          ce => {
            if (!X) return fe ? fe.dispose() : (X = !0), S.call(T, ce)
          },
          null,
          A
        )),
        X && fe.dispose(),
        fe
      )
    }
  }
  exports.once = once
  function map(L, S, T) {
    return u((A, X = null, fe) => L(ce => A.call(X, S(ce)), null, fe), T)
  }
  exports.map = map
  function forEach(L, S, T) {
    return u(
      (A, X = null, fe) =>
        L(
          ce => {
            S(ce), A.call(X, ce)
          },
          null,
          fe
        ),
      T
    )
  }
  exports.forEach = forEach
  function filter(L, S, T) {
    return u((A, X = null, fe) => L(ce => S(ce) && A.call(X, ce), null, fe), T)
  }
  exports.filter = filter
  function signal(L) {
    return L
  }
  exports.signal = signal
  function any(...L) {
    return (S, T = null, A) => {
      let X = disposeAll$(...L.map(fe => fe(ce => S.call(T, ce))))
      return p(X, A)
    }
  }
  exports.any = any
  function reduce(L, S, T, A) {
    let X = T
    return map(L, fe => ((X = S(X, fe)), X), A)
  }
  exports.reduce = reduce
  function u(L, S) {
    let T,
      A = {
        onWillAddFirstListener() {
          T = L(X.fire, X)
        },
        onDidRemoveLastListener() {
          T?.dispose()
        },
      }
    S || e(A)
    let X = new EventManager(A)
    return S?.add(X), X.event
  }
  function p(L, S) {
    return S instanceof Array ? S.push(L) : S && S.add(L), L
  }
  function debounce(L, S, T = 100, A = !1, X = !1, fe, ce) {
    let oe,
      ae,
      je,
      Ye = 0,
      Ze,
      ke = {
        leakWarningThreshold: fe,
        onWillAddFirstListener() {
          oe = L(tt => {
            Ye++,
              (ae = S(ae, tt)),
              A && !je && (st.fire(ae), (ae = void 0)),
              (Ze = () => {
                let ve = ae
                ;(ae = void 0), (je = void 0), (!A || Ye > 1) && st.fire(ve), (Ye = 0)
              }),
              typeof T == 'number'
                ? (clearTimeout(je), (je = setTimeout(Ze, T)))
                : je === void 0 && ((je = 0), queueMicrotask(Ze))
          })
        },
        onWillRemoveListener() {
          X && Ye > 0 && Ze?.()
        },
        onDidRemoveLastListener() {
          ;(Ze = void 0), oe.dispose()
        },
      }
    ce || e(ke)
    let st = new EventManager(ke)
    return ce?.add(st), st.event
  }
  exports.debounce = debounce
  function accumulate(L, S = 0, T) {
    return exports.debounce(L, (A, X) => (A ? (A.push(X), A) : [X]), S, void 0, !0, void 0, T)
  }
  exports.accumulate = accumulate
  function latch(L, S = (A, X) => A === X, T) {
    let A = !0,
      X
    return filter(
      L,
      fe => {
        let ce = A || !S(fe, X)
        return (A = !1), (X = fe), ce
      },
      T
    )
  }
  exports.latch = latch
  function split(L, S, T) {
    return [exports.filter(L, S, T), exports.filter(L, A => !S(A), T)]
  }
  exports.split = split
  function buffer(L, S = !1, T = [], A) {
    let X = T.slice(),
      fe = L(ae => {
        X ? X.push(ae) : oe.fire(ae)
      })
    A && A.add(fe)
    let ce = () => {
        X?.forEach(ae => oe.fire(ae)), (X = null)
      },
      oe = new EventManager({
        onWillAddFirstListener() {
          fe || ((fe = L(ae => oe.fire(ae))), A && A.add(fe))
        },
        onDidAddFirstListener() {
          X && (S ? setTimeout(ce) : ce())
        },
        onDidRemoveLastListener() {
          fe && fe.dispose(), (fe = null)
        },
      })
    return A && A.add(oe), oe.event
  }
  exports.buffer = buffer
  function chain(L, S) {
    return (A, X, fe) => {
      let ce = S(new y())
      return L(
        function (oe) {
          let ae = ce.evaluate(oe)
          ae !== _ && A.call(X, ae)
        },
        void 0,
        fe
      )
    }
  }
  exports.chain = chain
  let _ = Symbol('HaltChainable')
  class y {
    constructor() {
      this.steps = []
    }
    map(S) {
      return this.steps.push(S), this
    }
    forEach(S) {
      return this.steps.push(T => (S(T), T)), this
    }
    filter(S) {
      return this.steps.push(T => (S(T) ? T : _)), this
    }
    reduce(S, T) {
      let A = T
      return this.steps.push(X => ((A = S(A, X)), A)), this
    }
    latch(S = (T, A) => T === A) {
      let T = !0,
        A
      return (
        this.steps.push(X => {
          let fe = T || !S(X, A)
          return (T = !1), (A = X), fe ? X : _
        }),
        this
      )
    }
    evaluate(S) {
      for (let T of this.steps) if (((S = T(S)), S === _)) break
      return S
    }
  }
  function fromNodeEventEmitter(L, S, T = A => A) {
    let A = (...oe) => ce.fire(T(...oe)),
      X = () => L.on(S, A),
      fe = () => L.removeListener(S, A),
      ce = new EventManager({ onWillAddFirstListener: X, onDidRemoveLastListener: fe })
    return ce.event
  }
  exports.fromNodeEventEmitter = fromNodeEventEmitter
  function fromDOMEventEmitter(L, S, T = A => A) {
    let A = (...oe) => ce.fire(T(...oe)),
      X = () => L.addEventListener(S, A),
      fe = () => L.removeEventListener(S, A),
      ce = new EventManager({ onWillAddFirstListener: X, onDidRemoveLastListener: fe })
    return ce.event
  }
  exports.fromDOMEventEmitter = fromDOMEventEmitter
  function toPromise(L) {
    return new Promise(S => once(L)(S))
  }
  exports.toPromise = toPromise
  function fromPromise(L) {
    let S = new EventManager()
    return (
      L.then(
        T => {
          S.fire(T)
        },
        () => {
          S.fire(void 0)
        }
      ).finally(() => {
        S.dispose()
      }),
      S.event
    )
  }
  exports.fromPromise = fromPromise
  function runAndSubscribe(L, S, T) {
    return S(T), L(A => S(A))
  }
  exports.runAndSubscribe = runAndSubscribe
  function runAndSubscribeWithStorej(L, S) {
    let T = null
    function A(fe) {
      T?.dispose(), (T = new DisposableStore()), S(fe, T)
    }
    A(void 0)
    let X = L(fe => A(fe))
    return createDisposable(() => {
      X.dispose(), T?.dispose()
    })
  }
  exports.runAndSubscribeWithStore = runAndSubscribeWithStore
  class M {
    constructor(S, T) {
      this._observable = S
      this._counter = 0
      this._hasChanged = !1
      let A = {
        onWillAddFirstListener: () => {
          S.addObserver(this)
        },
        onDidRemoveLastListener: () => {
          S.removeObserver(this)
        },
      }
      T || e(A), (this.emitter = new EventManager(A)), T && T.add(this.emitter)
    }
    beginUpdate(S) {
      this._counter++
    }
    handlePossibleChange(S) {}
    handleChange(S, T) {
      this._hasChanged = !0
    }
    endUpdate(S) {
      this._counter--,
        this._counter === 0 &&
          (this._observable.reportChanges(),
          this._hasChanged && ((this._hasChanged = !1), this.emitter.fire(this._observable.get())))
    }
  }
  function fromObservable(L, S) {
    return new M(L, S).emitter.event
  }
  exports.fromObservable = fromObservable
  function fromObservableLight(L) {
    return (S, T, A) => {
      let X = 0,
        fe = !1,
        ce = {
          beginUpdate() {
            X++
          },
          endUpdate() {
            X--, X === 0 && (L.reportChanges(), fe && ((fe = !1), S.call(T)))
          },
          handlePossibleChange() {},
          handleChange() {
            fe = !0
          },
        }
      L.addObserver(ce), L.reportChanges()
      let oe = {
        dispose() {
          L.removeObserver(ce)
        },
      }
      return A instanceof DisposableStore ? A.add(oe) : Array.isArray(A) && A.push(oe), oe
    }
  }
  exports.fromObservableLight = fromObservableLight
})((EventUtils ||= {}))
var EventTracker = class EventTracker {
  constructor(eventName) {
    this.listenerCount = 0
    this.invocationCount = 0
    this.elapsedOverall = 0
    this.durations = []
    this.name = `${eventName}_${EventTracker._idPool++}`
    EventTracker.all.add(this)
  }
  static {
    this.all = new Set()
  }
  static {
    this._idPool = 0
  }
  start(listenerCount) {
    this._stopWatch = new Stopwatch()
    this.listenerCount = listenerCount
  }
  stop() {
    if (this._stopWatch) {
      let elapsed = this._stopWatch.elapsed()
      this.durations.push(elapsed)
      this.elapsedOverall += elapsed
      this.invocationCount += 1
      this._stopWatch = undefined
    }
  }
}
var PW = -1
var LeakDetector = class {
  constructor(threshold, name = Math.random().toString(18).slice(2, 5)) {
    this.threshold = threshold
    this.name = name
    this._warnCountdown = 0
  }
  dispose() {
    this._stacks?.clear()
  }
  check(stackTrace, listenerCount) {
    let threshold = this.threshold
    if (threshold <= 0 || listenerCount < threshold) return
    this._stacks || (this._stacks = new Map())
    let count = this._stacks.get(stackTrace.value) || 0
    if ((this._stacks.set(stackTrace.value, count + 1), (this._warnCountdown -= 1), this._warnCountdown <= 0)) {
      this._warnCountdown = threshold * 0.5
      let mostFrequent,
        maxCount = 0
      for (let [trace, count] of this._stacks) (!mostFrequent || maxCount < count) && ((mostFrequent = trace), (maxCount = count))
      console.warn(
        `[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${maxCount}):`
      ),
        console.warn(mostFrequent)
    }
    return () => {
      let count = this._stacks.get(stackTrace.value) || 0
      this._stacks.set(stackTrace.value, count - 1)
    }
  }
}
var StackTrace = class StackTrace {
  constructor(value) {
    this.value = value
  }
  static create() {
    return new StackTrace(new Error().stack ?? '')
  }
  print() {
    console.warn(
      this.value
        .split(
          `
`
        )
        .slice(2).join(`
`)
    )
  }
}
var idCounter = 0
var TraceId = class {
  constructor(value) {
    this.value = value
    this.id = idCounter++
  }
}
var JTe = 2
var processTrace = (trace, callback) => {
    if (trace instanceof TraceId) callback(trace)
    else
      for (let i = 0; i < trace.length; i++) {
        let item = trace[i]
        item && callback(item)
      }
  },
var EventManager = class {
    constructor(e) {
      this._size = 0
      ;(this._options = e),
        (this._leakageMon =
          PW > 0 || this._options?.leakWarningThreshold ? new LeakDetector(this._options?.leakWarningThreshold ?? PW) : void 0),
        (this._perfMon = this._options?._profName ? new EventTracker(this._options._profName) : void 0),
        (this._deliveryQueue = this._options?.deliveryQueue)
    }
    dispose() {
      if (!this._disposed) {
        if (
          ((this._disposed = !0), this._deliveryQueue?.current === this && this._deliveryQueue.reset(), this._listeners)
        ) {
          if (isDebugMode) {
            let e = this._listeners
            queueMicrotask(() => {
              ZTe(e, r => r.stack?.print())
            })
          }
          ;(this._listeners = void 0), (this._size = 0)
        }
        this._options?.onDidRemoveLastListener?.(), this._leakageMon?.dispose()
      }
    }
    get event() {
      return (
        (this._event ??= (e, r, n) => {
          if (this._leakageMon && this._size > this._leakageMon.threshold * 3)
            return (
              console.warn(
                `[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far`
              ),
              Disposable.None
            )
          if (this._disposed) return Disposable.None
          r && (e = e.bind(r))
          let i = new TraceId(e),
            o,
            s
          this._leakageMon &&
            this._size >= Math.ceil(this._leakageMon.threshold * 0.2) &&
            ((i.stack = StackTrace.create()), (o = this._leakageMon.check(i.stack, this._size + 1))),
            isDebugMode && (i.stack = s ?? StackTrace.create()),
            this._listeners
              ? this._listeners instanceof TraceId
                ? ((this._deliveryQueue ??= new Queue()), (this._listeners = [this._listeners, i]))
                : this._listeners.push(i)
              : (this._options?.onWillAddFirstListener?.(this),
                (this._listeners = i),
                this._options?.onDidAddFirstListener?.(this)),
            this._size++
          let a = createDisposable(() => {
            o?.(), this._removeListener(i)
          })
          return n instanceof DisposableStore ? n.add(a) : Array.isArray(n) && n.push(a), a
        }),
        this._event
      )
    }
    _removeListener(e) {
      if ((this._options?.onWillRemoveListener?.(this), !this._listeners)) return
      if (this._size === 1) {
        ;(this._listeners = void 0), this._options?.onDidRemoveLastListener?.(this), (this._size = 0)
        return
      }
      let r = this._listeners,
        n = r.indexOf(e)
      if (n === -1)
        throw (
          (console.log('disposed?', this._disposed),
          console.log('size?', this._size),
          console.log('arr?', JSON.stringify(this._listeners)),
          new Error('Attempted to dispose unknown listener'))
        )
      this._size--, (r[n] = void 0)
      let i = this._deliveryQueue.current === this
      if (this._size * JTe <= r.length) {
        let o = 0
        for (let s = 0; s < r.length; s++)
          r[s]
            ? (r[o++] = r[s])
            : i && (this._deliveryQueue.end--, o < this._deliveryQueue.i && this._deliveryQueue.i--)
        r.length = o
      }
    }
    _deliver(e, r) {
      if (!e) return
      let n = this._options?.onListenerError || handleUnexpectedError
      if (!n) {
        e.value(r)
        return
      }
      try {
        e.value(r)
      } catch (i) {
        n(i)
      }
    }
    _deliverQueue(e) {
      let r = e.current._listeners
      for (; e.i < e.end; ) this._deliver(r[e.i++], e.value)
      e.reset()
    }
    fire(e) {
      if (
        (this._deliveryQueue?.current && (this._deliverQueue(this._deliveryQueue), this._perfMon?.stop()),
        this._perfMon?.start(this._size),
        this._listeners)
      )
        if (this._listeners instanceof TraceId) this._deliver(this._listeners, e)
        else {
          let r = this._deliveryQueue
          r.enqueue(this, e, this._listeners.length), this._deliverQueue(r)
        }
      this._perfMon?.stop()
    }
    hasListeners() {
      return this._size > 0
    }
  }
class Queue {
  constructor() {
    this.index = -1;
    this.end = 0;
  }
  enqueue(element, value, end) {
    this.index = 0;
    this.end = end;
    this.current = element;
    this.value = value;
  }
  reset() {
    this.index = this.end;
    this.current = undefined;
    this.value = undefined;
  }
}
const DelayedExecution = Object.freeze(function (callback, context) {
  let timeoutId = setTimeout(callback.bind(context), 0);
  return {
    dispose() {
      clearTimeout(timeoutId);
    },
  };
});
let CancellationToken;
((CancellationToken = {}) => {
  function isCancellationToken(i) {
    return i === CancellationToken.None || i === CancellationToken.Cancelled || i instanceof Cancellation
      ? true
      : !i || typeof i != 'object'
      ? false
      : typeof i.isCancellationRequested == 'boolean' && typeof i.onCancellationRequested == 'function';
  }
  CancellationToken.isCancellationToken = isCancellationToken;
  CancellationToken.None = Object.freeze({ isCancellationRequested: false, onCancellationRequested: EventUtils.None });
  CancellationToken.Cancelled = Object.freeze({ isCancellationRequested: true, onCancellationRequested: DelayedExecution });
})(CancellationToken || (CancellationToken = {}));
class Cancellation {
  constructor() {
    this._isCancelled = false;
    this._emitter = null;
  }
  cancel() {
    if (!this._isCancelled) {
      this._isCancelled = true;
      if (this._emitter) {
        this._emitter.fire(undefined);
        this.dispose();
      }
    }
  }
  get isCancellationRequested() {
    return this._isCancelled;
  }
  get onCancellationRequested() {
    return this._isCancelled ? DelayedExecution : (this._emitter || (this._emitter = new EventManager()), this._emitter.event);
  }
  dispose() {
    if (this._emitter) {
      this._emitter.dispose();
      this._emitter = null;
    }
  }
}
class CancellationSource {
  constructor(parent) {
    this._token = undefined;
    this._parentListener = parent && parent.onCancellationRequested(this.cancel, this);
  }
  get token() {
    return this._token || (this._token = new Cancellation()), this._token;
  }
  cancel() {
    if (this._token) {
      if (this._token instanceof Cancellation) {
        this._token.cancel();
      }
    } else {
      this._token = CancellationToken.Cancelled;
    }
  }
  dispose(cancel = false) {
    if (cancel) {
      this.cancel();
    }
    this._parentListener?.dispose();
    if (this._token) {
      if (this._token instanceof Cancellation) {
        this._token.dispose();
      }
    } else {
      this._token = CancellationToken.None;
    }
  }
}
var Memoize = class {
  constructor(fn) {
    this.fn = fn;
    this.lastCache = undefined;
    this.lastArgKey = undefined;
  }
  get(arg) {
    let argKey = JSON.stringify(arg);
    if (this.lastArgKey !== argKey) {
      this.lastArgKey = argKey;
      this.lastCache = this.fn(arg);
    }
    return this.lastCache;
  }
}
var Lazy = class {
  constructor(executor) {
    this.executor = executor;
    this._didRun = false;
  }
  get hasValue() {
    return this._didRun;
  }
  get value() {
    if (!this._didRun) {
      try {
        this._value = this.executor();
      } catch (error) {
        this._error = error;
      } finally {
        this._didRun = true;
      }
    }
    if (this._error) throw this._error;
    return this._value;
  }
  get rawValue() {
    return this._value;
  }
}
function findFirstNonWhitespaceChar(str) {
  for (let i = 0, len = str.length; i < len; i++) {
    let code = str.charCodeAt(i);
    if (code !== 32 && code !== 9) return i;
  }
  return -1;
}
function replaceAllWithPromise(str, regex, replacer) {
  let result = [],
    lastIndex = 0;
  for (let match of str.matchAll(regex)) {
    result.push(str.slice(lastIndex, match.index));
    if (match.index === undefined) throw new Error('match.index should be defined');
    lastIndex = match.index + match[0].length;
    result.push(replacer(match[0], ...match.slice(1), match.index, str, match.groups));
  }
  result.push(str.slice(lastIndex));
  return Promise.all(result).then(parts => parts.join(''));
}
function compareNumbers(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
function compareStrings(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
  for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
    let aCode = a.charCodeAt(aStart),
      bCode = b.charCodeAt(bStart);
    if (aCode < bCode) return -1;
    if (aCode > bCode) return 1;
  }
  let aLength = aEnd - aStart,
    bLength = bEnd - bStart;
  return aLength < bLength ? -1 : aLength > bLength ? 1 : 0;
}
function compareStringsIgnoreCase(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
  for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
    let aCode = a.charCodeAt(aStart),
      bCode = b.charCodeAt(bStart);
    if (aCode === bCode) continue;
    if (aCode >= 128 || bCode >= 128) return compareStrings(a.toLowerCase(), b.toLowerCase(), aStart, aEnd, bStart, bEnd);
    isLowerCase(aCode) && (aCode -= 32), isLowerCase(bCode) && (bCode -= 32);
    let diff = aCode - bCode;
    if (diff !== 0) return diff;
  }
  let aLength = aEnd - aStart,
    bLength = bEnd - bStart;
  return aLength < bLength ? -1 : aLength > bLength ? 1 : 0;
}
function isLowerCase(code) {
  return code >= 97 && code <= 122;
}
function equalsIgnoreCase(a, b) {
  return a.length === b.length && compareStringsIgnoreCase(a, b) === 0;
}
function startsWithIgnoreCase(str, prefix) {
  let prefixLength = prefix.length;
  return prefix.length > str.length ? false : compareStringsIgnoreCase(str, prefix, 0, prefixLength) === 0;
}
var unicodeBOM = String.fromCharCode(65279);

var GraphemeBreakTypeGetter = class Singleton {
  static {
    this._INSTANCE = null;
  }
  static getInstance() {
    return Singleton._INSTANCE || (Singleton._INSTANCE = new Singleton()), Singleton._INSTANCE;
  }
  constructor() {
    this._data = getGraphemeBreakData();
  }
  getGraphemeBreakType(charCode) {
    if (charCode < 32) return charCode === 10 ? 3 : charCode === 13 ? 2 : 4;
    if (charCode < 127) return 0;
    let data = this._data,
      dataLength = data.length / 3,
      index = 1;
    for (; index <= dataLength; ) {
      if (charCode < data[3 * index]) index = 2 * index;
      else if (charCode > data[3 * index + 1]) index = 2 * index + 1;
      else return data[3 * index + 2];
    }
    return 0;
  }
}
function getGraphemeBreakData() {
  return JSON.parse(
    '[0,0,0,51229,51255,12,44061,44087,12,127462,127487,6,7083,7085,5,47645,47671,12,54813,54839,12,128678,128678,14,3270,3270,5,9919,9923,14,45853,45879,12,49437,49463,12,53021,53047,12,71216,71218,7,128398,128399,14,129360,129374,14,2519,2519,5,4448,4519,9,9742,9742,14,12336,12336,14,44957,44983,12,46749,46775,12,48541,48567,12,50333,50359,12,52125,52151,12,53917,53943,12,69888,69890,5,73018,73018,5,127990,127990,14,128558,128559,14,128759,128760,14,129653,129655,14,2027,2035,5,2891,2892,7,3761,3761,5,6683,6683,5,8293,8293,4,9825,9826,14,9999,9999,14,43452,43453,5,44509,44535,12,45405,45431,12,46301,46327,12,47197,47223,12,48093,48119,12,48989,49015,12,49885,49911,12,50781,50807,12,51677,51703,12,52573,52599,12,53469,53495,12,54365,54391,12,65279,65279,4,70471,70472,7,72145,72147,7,119173,119179,5,127799,127818,14,128240,128244,14,128512,128512,14,128652,128652,14,128721,128722,14,129292,129292,14,129445,129450,14,129734,129743,14,1476,1477,5,2366,2368,7,2750,2752,7,3076,3076,5,3415,3415,5,4141,4144,5,6109,6109,5,6964,6964,5,7394,7400,5,9197,9198,14,9770,9770,14,9877,9877,14,9968,9969,14,10084,10084,14,43052,43052,5,43713,43713,5,44285,44311,12,44733,44759,12,45181,45207,12,45629,45655,12,46077,46103,12,46525,46551,12,46973,46999,12,47421,47447,12,47869,47895,12,48317,48343,12,48765,48791,12,49213,49239,12,49661,49687,12,50109,50135,12,50557,50583,12,51005,51031,12,51453,51479,12,51901,51927,12,52349,52375,12,52797,52823,12,53245,53271,12,53693,53719,12,54141,54167,12,54589,54615,12,55037,55063,12,69506,69509,5,70191,70193,5,70841,70841,7,71463,71467,5,72330,72342,5,94031,94031,5,123628,123631,5,127763,127765,14,127941,127941,14,128043,128062,14,128302,128317,14,128465,128467,14,128539,128539,14,128640,128640,14,128662,128662,14,128703,128703,14,128745,128745,14,129004,129007,14,129329,129330,14,129402,129402,14,129483,129483,14,129686,129704,14,130048,131069,14,173,173,4,1757,1757,1,2200,2207,5,2434,2435,7,2631,2632,5,2817,2817,5,3008,3008,5,3201,3201,5,3387,3388,5,3542,3542,5,3902,3903,7,4190,4192,5,6002,6003,5,6439,6440,5,6765,6770,7,7019,7027,5,7154,7155,7,8205,8205,13,8505,8505,14,9654,9654,14,9757,9757,14,9792,9792,14,9852,9853,14,9890,9894,14,9937,9937,14,9981,9981,14,10035,10036,14,11035,11036,14,42654,42655,5,43346,43347,7,43587,43587,5,44006,44007,7,44173,44199,12,44397,44423,12,44621,44647,12,44845,44871,12,45069,45095,12,45293,45319,12,45517,45543,12,45741,45767,12,45965,45991,12,46189,46215,12,46413,46439,12,46637,46663,12,46861,46887,12,47085,47111,12,47309,47335,12,47533,47559,12,47757,47783,12,47981,48007,12,48205,48231,12,48429,48455,12,48653,48679,12,48877,48903,12,49101,49127,12,49325,49351,12,49549,49575,12,49773,49799,12,49997,50023,12,50221,50247,12,50445,50471,12,50669,50695,12,50893,50919,12,51117,51143,12,51341,51367,12,51565,51591,12,51789,51815,12,52013,52039,12,52237,52263,12,52461,52487,12,52685,52711,12,52909,52935,12,53133,53159,12,53357,53383,12,53581,53607,12,53805,53831,12,54029,54055,12,54253,54279,12,54477,54503,12,54701,54727,12,54925,54951,12,55149,55175,12,68101,68102,5,69762,69762,7,70067,70069,7,70371,70378,5,70720,70721,7,71087,71087,5,71341,71341,5,71995,71996,5,72249,72249,7,72850,72871,5,73109,73109,5,118576,118598,5,121505,121519,5,127245,127247,14,127568,127569,14,127777,127777,14,127872,127891,14,127956,127967,14,128015,128016,14,128110,128172,14,128259,128259,14,128367,128368,14,128424,128424,14,128488,128488,14,128530,128532,14,128550,128551,14,128566,128566,14,128647,128647,14,128656,128656,14,128667,128673,14,128691,128693,14,128715,128715,14,128728,128732,14,128752,128752,14,128765,128767,14,129096,129103,14,129311,129311,14,129344,129349,14,129394,129394,14,129413,129425,14,129466,129471,14,129511,129535,14,129664,129666,14,129719,129722,14,129760,129767,14,917536,917631,5,13,13,2,1160,1161,5,1564,1564,4,1807,1807,1,2085,2087,5,2307,2307,7,2382,2383,7,2497,2500,5,2563,2563,7,2677,2677,5,2763,2764,7,2879,2879,5,2914,2915,5,3021,3021,5,3142,3144,5,3263,3263,5,3285,3286,5,3398,3400,7,3530,3530,5,3633,3633,5,3864,3865,5,3974,3975,5,4155,4156,7,4229,4230,5,5909,5909,7,6078,6085,7,6277,6278,5,6451,6456,7,6744,6750,5,6846,6846,5,6972,6972,5,7074,7077,5,7146,7148,7,7222,7223,5,7416,7417,5,8234,8238,4,8417,8417,5,9000,9000,14,9203,9203,14,9730,9731,14,9748,9749,14,9762,9763,14,9776,9783,14,9800,9811,14,9831,9831,14,9872,9873,14,9882,9882,14,9900,9903,14,9929,9933,14,9941,9960,14,9974,9974,14,9989,9989,14,10006,10006,14,10062,10062,14,10160,10160,14,11647,11647,5,12953,12953,14,43019,43019,5,43232,43249,5,43443,43443,5,43567,43568,7,43696,43696,5,43765,43765,7,44013,44013,5,44117,44143,12,44229,44255,12,44341,44367,12,44453,44479,12,44565,44591,12,44677,44703,12,44789,44815,12,44901,44927,12,45013,45039,12,45125,45151,12,45237,45263,12,45349,45375,12,45461,45487,12,45573,45599,12,45685,45711,12,45797,45823,12,45909,45935,12,46021,46047,12,46133,46159,12,46245,46271,12,46357,46383,12,46469,46495,12,46581,46607,12,46693,46719,12,46805,46831,12,46917,46943,12,47029,47055,12,47141,47167,12,47253,47279,12,47365,47391,12,47477,47503,12,47589,47615,12,47701,47727,12,47813,47839,12,47925,47951,12,48037,48063,12,48149,48175,12,48261,48287,12,48373,48399,12,48485,48511,12,48597,48623,12,48709,48735,12,48821,48847,12,48933,48959,12,49045,49071,12,49157,49183,12,49269,49295,12,49381,49407,12,49493,49519,12,49605,49631,12,49717,49743,12,49829,49855,12,49941,49967,12,50053,50079,12,50165,50191,12,50277,50303,12,50389,50415,12,50501,50527,12,50613,50639,12,50725,50751,12,50837,50863,12,50949,50975,12,51061,51087,12,51173,51199,12,51285,51311,12,51397,51423,12,51509,51535,12,51621,51647,12,51733,51759,12,51845,51871,12,51957,51983,12,52069,52095,12,52181,52207,12,52293,52319,12,52405,52431,12,52517,52543,12,52629,52655,12,52741,52767,12,52853,52879,12,52965,52991,12,53077,53103,12,53189,53215,12,53301,53327,12,53413,53439,12,53525,53551,12,53637,53663,12,53749,53775,12,53861,53887,12,53973,53999,12,54085,54111,12,54197,54223,12,54309,54335,12,54421,54447,12,54533,54559,12,54645,54671,12,54757,54783,12,54869,54895,12,54981,55007,12,55093,55119,12,55243,55291,10,66045,66045,5,68325,68326,5,69688,69702,5,69817,69818,5,69957,69958,7,70089,70092,5,70198,70199,5,70462,70462,5,70502,70508,5,70750,70750,5,70846,70846,7,71100,71101,5,71230,71230,7,71351,71351,5,71737,71738,5,72000,72000,7,72160,72160,5,72273,72278,5,72752,72758,5,72882,72883,5,73031,73031,5,73461,73462,7,94192,94193,7,119149,119149,7,121403,121452,5,122915,122916,5,126980,126980,14,127358,127359,14,127535,127535,14,127759,127759,14,127771,127771,14,127792,127793,14,127825,127867,14,127897,127899,14,127945,127945,14,127985,127986,14,128000,128007,14,128021,128021,14,128066,128100,14,128184,128235,14,128249,128252,14,128266,128276,14,128335,128335,14,128379,128390,14,128407,128419,14,128444,128444,14,128481,128481,14,128499,128499,14,128526,128526,14,128536,128536,14,128543,128543,14,128556,128556,14,128564,128564,14,128577,128580,14,128643,128645,14,128649,128649,14,128654,128654,14,128660,128660,14,128664,128664,14,128675,128675,14,128686,128689,14,128695,128696,14,128705,128709,14,128717,128719,14,128725,128725,14,128736,128741,14,128747,128748,14,128755,128755,14,128762,128762,14,128981,128991,14,129009,129023,14,129160,129167,14,129296,129304,14,129320,129327,14,129340,129342,14,129356,129356,14,129388,129392,14,129399,129400,14,129404,129407,14,129432,129442,14,129454,129455,14,129473,129474,14,129485,129487,14,129648,129651,14,129659,129660,14,129671,129679,14,129709,129711,14,129728,129730,14,129751,129753,14,129776,129782,14,917505,917505,4,917760,917999,5,10,10,3,127,159,4,768,879,5,1471,1471,5,1536,1541,1,1648,1648,5,1767,1768,5,1840,1866,5,2070,2073,5,2137,2139,5,2274,2274,1,2363,2363,7,2377,2380,7,2402,2403,5,2494,2494,5,2507,2508,7,2558,2558,5,2622,2624,7,2641,2641,5,2691,2691,7,2759,2760,5,2786,2787,5,2876,2876,5,2881,2884,5,2901,2902,5,3006,3006,5,3014,3016,7,3072,3072,5,3134,3136,5,3157,3158,5,3260,3260,5,3266,3266,5,3274,3275,7,3328,3329,5,3391,3392,7,3405,3405,5,3457,3457,5,3536,3537,7,3551,3551,5,3636,3642,5,3764,3772,5,3895,3895,5,3967,3967,7,3993,4028,5,4146,4151,5,4182,4183,7,4226,4226,5,4253,4253,5,4957,4959,5,5940,5940,7,6070,6070,7,6087,6088,7,6158,6158,4,6432,6434,5,6448,6449,7,6679,6680,5,6742,6742,5,6754,6754,5,6783,6783,5,6912,6915,5,6966,6970,5,6978,6978,5,7042,7042,7,7080,7081,5,7143,7143,7,7150,7150,7,7212,7219,5,7380,7392,5,7412,7412,5,8203,8203,4,8232,8232,4,8265,8265,14,8400,8412,5,8421,8432,5,8617,8618,14,9167,9167,14,9200,9200,14,9410,9410,14,9723,9726,14,9733,9733,14,9745,9745,14,9752,9752,14,9760,9760,14,9766,9766,14,9774,9774,14,9786,9786,14,9794,9794,14,9823,9823,14,9828,9828,14,9833,9850,14,9855,9855,14,9875,9875,14,9880,9880,14,9885,9887,14,9896,9897,14,9906,9916,14,9926,9927,14,9935,9935,14,9939,9939,14,9962,9962,14,9972,9972,14,9978,9978,14,9986,9986,14,9997,9997,14,10002,10002,14,10017,10017,14,10055,10055,14,10071,10071,14,10133,10135,14,10548,10549,14,11093,11093,14,12330,12333,5,12441,12442,5,42608,42610,5,43010,43010,5,43045,43046,5,43188,43203,7,43302,43309,5,43392,43394,5,43446,43449,5,43493,43493,5,43571,43572,7,43597,43597,7,43703,43704,5,43756,43757,5,44003,44004,7,44009,44010,7,44033,44059,12,44089,44115,12,44145,44171,12,44201,44227,12,44257,44283,12,44313,44339,12,44369,44395,12,44425,44451,12,44481,44507,12,44537,44563,12,44593,44619,12,44649,44675,12,44705,44731,12,44761,44787,12,44817,44843,12,44873,44899,12,44929,44955,12,44985,45011,12,45041,45067,12,45097,45123,12,45153,45179,12,45209,45235,12,45265,45291,12,45321,45347,12,45377,45403,12,45433,45459,12,45489,45515,12,45545,45571,12,45601,45627,12,45657,45683,12,45713,45739,12,45769,45795,12,45825,45851,12,45881,45907,12,45937,45963,12,45993,46019,12,46049,46075,12,46105,46131,12,46161,46187,12,46217,46243,12,46273,46299,12,46329,46355,12,46385,46411,12,46441,46467,12,46497,46523,12,46553,46579,12,46609,46635,12,46665,46691,12,46721,46747,12,46777,46803,12,46833,46859,12,46889,46915,12,46945,46971,12,47001,47027,12,47057,47083,12,47113,47139,12,47169,47195,12,47225,47251,12,47281,47307,12,47337,47363,12,47393,47419,12,47449,47475,12,47505,47531,12,47561,47587,12,47617,47643,12,47673,47699,12,47729,47755,12,47785,47811,12,47841,47867,12,47897,47923,12,47953,47979,12,48009,48035,12,48065,48091,12,48121,48147,12,48177,48203,12,48233,48259,12,48289,48315,12,48345,48371,12,48401,48427,12,48457,48483,12,48513,48539,12,48569,48595,12,48625,48651,12,48681,48707,12,48737,48763,12,48793,48819,12,48849,48875,12,48905,48931,12,48961,48987,12,49017,49043,12,49073,49099,12,49129,49155,12,49185,49211,12,49241,49267,12,49297,49323,12,49353,49379,12,49409,49435,12,49465,49491,12,49521,49547,12,49577,49603,12,49633,49659,12,49689,49715,12,49745,49771,12,49801,49827,12,49857,49883,12,49913,49939,12,49969,49995,12,50025,50051,12,50081,50107,12,50137,50163,12,50193,50219,12,50249,50275,12,50305,50331,12,50361,50387,12,50417,50443,12,50473,50499,12,50529,50555,12,50585,50611,12,50641,50667,12,50697,50723,12,50753,50779,12,50809,50835,12,50865,50891,12,50921,50947,12,50977,51003,12,51033,51059,12,51089,51115,12,51145,51171,12,51201,51227,12,51257,51283,12,51313,51339,12,51369,51395,12,51425,51451,12,51481,51507,12,51537,51563,12,51593,51619,12,51649,51675,12,51705,51731,12,51761,51787,12,51817,51843,12,51873,51899,12,51929,51955,12,51985,52011,12,52041,52067,12,52097,52123,12,52153,52179,12,52209,52235,12,52265,52291,12,52321,52347,12,52377,52403,12,52433,52459,12,52489,52515,12,52545,52571,12,52601,52627,12,52657,52683,12,52713,52739,12,52769,52795,12,52825,52851,12,52881,52907,12,52937,52963,12,52993,53019,12,53049,53075,12,53105,53131,12,53161,53187,12,53217,53243,12,53273,53299,12,53329,53355,12,53385,53411,12,53441,53467,12,53497,53523,12,53553,53579,12,53609,53635,12,53665,53691,12,53721,53747,12,53777,53803,12,53833,53859,12,53889,53915,12,53945,53971,12,54001,54027,12,54057,54083,12,54113,54139,12,54169,54195,12,54225,54251,12,54281,54307,12,54337,54363,12,54393,54419,12,54449,54475,12,54505,54531,12,54561,54587,12,54617,54643,12,54673,54699,12,54729,54755,12,54785,54811,12,54841,54867,12,54897,54923,12,54953,54979,12,55009,55035,12,55065,55091,12,55121,55147,12,55177,55203,12,65024,65039,5,65520,65528,4,66422,66426,5,68152,68154,5,69291,69292,5,69633,69633,5,69747,69748,5,69811,69814,5,69826,69826,5,69932,69932,7,70016,70017,5,70079,70080,7,70095,70095,5,70196,70196,5,70367,70367,5,70402,70403,7,70464,70464,5,70487,70487,5,70709,70711,7,70725,70725,7,70833,70834,7,70843,70844,7,70849,70849,7,71090,71093,5,71103,71104,5,71227,71228,7,71339,71339,5,71344,71349,5,71458,71461,5,71727,71735,5,71985,71989,7,71998,71998,5,72002,72002,7,72154,72155,5,72193,72202,5,72251,72254,5,72281,72283,5,72344,72345,5,72766,72766,7,72874,72880,5,72885,72886,5,73023,73029,5,73104,73105,5,73111,73111,5,92912,92916,5,94095,94098,5,113824,113827,4,119142,119142,7,119155,119162,4,119362,119364,5,121476,121476,5,122888,122904,5,123184,123190,5,125252,125258,5,127183,127183,14,127340,127343,14,127377,127386,14,127491,127503,14,127548,127551,14,127744,127756,14,127761,127761,14,127769,127769,14,127773,127774,14,127780,127788,14,127796,127797,14,127820,127823,14,127869,127869,14,127894,127895,14,127902,127903,14,127943,127943,14,127947,127950,14,127972,127972,14,127988,127988,14,127992,127994,14,128009,128011,14,128019,128019,14,128023,128041,14,128064,128064,14,128102,128107,14,128174,128181,14,128238,128238,14,128246,128247,14,128254,128254,14,128264,128264,14,128278,128299,14,128329,128330,14,128348,128359,14,128371,128377,14,128392,128393,14,128401,128404,14,128421,128421,14,128433,128434,14,128450,128452,14,128476,128478,14,128483,128483,14,128495,128495,14,128506,128506,14,128519,128520,14,128528,128528,14,128534,128534,14,128538,128538,14,128540,128542,14,128544,128549,14,128552,128555,14,128557,128557,14,128560,128563,14,128565,128565,14,128567,128576,14,128581,128591,14,128641,128642,14,128646,128646,14,128648,128648,14,128650,128651,14,128653,128653,14,128655,128655,14,128657,128659,14,128661,128661,14,128663,128663,14,128665,128666,14,128674,128674,14,128676,128677,14,128679,128685,14,128690,128690,14,128694,128694,14,128697,128702,14,128704,128704,14,128710,128714,14,128716,128716,14,128720,128720,14,128723,128724,14,128726,128727,14,128733,128735,14,128742,128744,14,128746,128746,14,128749,128751,14,128753,128754,14,128756,128758,14,128761,128761,14,128763,128764,14,128884,128895,14,128992,129003,14,129008,129008,14,129036,129039,14,129114,129119,14,129198,129279,14,129293,129295,14,129305,129310,14,129312,129319,14,129328,129328,14,129331,129338,14,129343,129343,14,129351,129355,14,129357,129359,14,129375,129387,14,129393,129393,14,129395,129398,14,129401,129401,14,129403,129403,14,129408,129412,14,129426,129431,14,129443,129444,14,129451,129453,14,129456,129465,14,129472,129472,14,129475,129482,14,129484,129484,14,129488,129510,14,129536,129647,14,129652,129652,14,129656,129658,14,129661,129663,14,129667,129670,14,129680,129685,14,129705,129708,14,129712,129718,14,129723,129727,14,129731,129733,14,129744,129750,14,129754,129759,14,129768,129775,14,129783,129791,14,917504,917504,4,917506,917535,4,917632,917759,4,918000,921599,4,0,9,4,11,12,4,14,31,4,169,169,14,174,174,14,1155,1159,5,1425,1469,5,1473,1474,5,1479,1479,5,1552,1562,5,1611,1631,5,1750,1756,5,1759,1764,5,1770,1773,5,1809,1809,5,1958,1968,5,2045,2045,5,2075,2083,5,2089,2093,5,2192,2193,1,2250,2273,5,2275,2306,5,2362,2362,5,2364,2364,5,2369,2376,5,2381,2381,5,2385,2391,5,2433,2433,5,2492,2492,5,2495,2496,7,2503,2504,7,2509,2509,5,2530,2531,5,2561,2562,5,2620,2620,5,2625,2626,5,2635,2637,5,2672,2673,5,2689,2690,5,2748,2748,5,2753,2757,5,2761,2761,7,2765,2765,5,2810,2815,5,2818,2819,7,2878,2878,5,2880,2880,7,2887,2888,7,2893,2893,5,2903,2903,5,2946,2946,5,3007,3007,7,3009,3010,7,3018,3020,7,3031,3031,5,3073,3075,7,3132,3132,5,3137,3140,7,3146,3149,5,3170,3171,5,3202,3203,7,3262,3262,7,3264,3265,7,3267,3268,7,3271,3272,7,3276,3277,5,3298,3299,5,3330,3331,7,3390,3390,5,3393,3396,5,3402,3404,7,3406,3406,1,3426,3427,5,3458,3459,7,3535,3535,5,3538,3540,5,3544,3550,7,3570,3571,7,3635,3635,7,3655,3662,5,3763,3763,7,3784,3789,5,3893,3893,5,3897,3897,5,3953,3966,5,3968,3972,5,3981,3991,5,4038,4038,5,4145,4145,7,4153,4154,5,4157,4158,5,4184,4185,5,4209,4212,5,4228,4228,7,4237,4237,5,4352,4447,8,4520,4607,10,5906,5908,5,5938,5939,5,5970,5971,5,6068,6069,5,6071,6077,5,6086,6086,5,6089,6099,5,6155,6157,5,6159,6159,5,6313,6313,5,6435,6438,7,6441,6443,7,6450,6450,5,6457,6459,5,6681,6682,7,6741,6741,7,6743,6743,7,6752,6752,5,6757,6764,5,6771,6780,5,6832,6845,5,6847,6862,5,6916,6916,7,6965,6965,5,6971,6971,7,6973,6977,7,6979,6980,7,7040,7041,5,7073,7073,7,7078,7079,7,7082,7082,7,7142,7142,5,7144,7145,5,7149,7149,5,7151,7153,5,7204,7211,7,7220,7221,7,7376,7378,5,7393,7393,7,7405,7405,5,7415,7415,7,7616,7679,5,8204,8204,5,8206,8207,4,8233,8233,4,8252,8252,14,8288,8292,4,8294,8303,4,8413,8416,5,8418,8420,5,8482,8482,14,8596,8601,14,8986,8987,14,9096,9096,14,9193,9196,14,9199,9199,14,9201,9202,14,9208,9210,14,9642,9643,14,9664,9664,14,9728,9729,14,9732,9732,14,9735,9741,14,9743,9744,14,9746,9746,14,9750,9751,14,9753,9756,14,9758,9759,14,9761,9761,14,9764,9765,14,9767,9769,14,9771,9773,14,9775,9775,14,9784,9785,14,9787,9791,14,9793,9793,14,9795,9799,14,9812,9822,14,9824,9824,14,9827,9827,14,9829,9830,14,9832,9832,14,9851,9851,14,9854,9854,14,9856,9861,14,9874,9874,14,9876,9876,14,9878,9879,14,9881,9881,14,9883,9884,14,9888,9889,14,9895,9895,14,9898,9899,14,9904,9905,14,9917,9918,14,9924,9925,14,9928,9928,14,9934,9934,14,9936,9936,14,9938,9938,14,9940,9940,14,9961,9961,14,9963,9967,14,9970,9971,14,9973,9973,14,9975,9977,14,9979,9980,14,9982,9985,14,9987,9988,14,9992,9996,14,9998,9998,14,10000,10001,14,10004,10004,14,10013,10013,14,10024,10024,14,10052,10052,14,10060,10060,14,10067,10069,14,10083,10083,14,10085,10087,14,10145,10145,14,10175,10175,14,11013,11015,14,11088,11088,14,11503,11505,5,11744,11775,5,12334,12335,5,12349,12349,14,12951,12951,14,42607,42607,5,42612,42621,5,42736,42737,5,43014,43014,5,43043,43044,7,43047,43047,7,43136,43137,7,43204,43205,5,43263,43263,5,43335,43345,5,43360,43388,8,43395,43395,7,43444,43445,7,43450,43451,7,43454,43456,7,43561,43566,5,43569,43570,5,43573,43574,5,43596,43596,5,43644,43644,5,43698,43700,5,43710,43711,5,43755,43755,7,43758,43759,7,43766,43766,5,44005,44005,5,44008,44008,5,44012,44012,7,44032,44032,11,44060,44060,11,44088,44088,11,44116,44116,11,44144,44144,11,44172,44172,11,44200,44200,11,44228,44228,11,44256,44256,11,44284,44284,11,44312,44312,11,44340,44340,11,44368,44368,11,44396,44396,11,44424,44424,11,44452,44452,11,44480,44480,11,44508,44508,11,44536,44536,11,44564,44564,11,44592,44592,11,44620,44620,11,44648,44648,11,44676,44676,11,44704,44704,11,44732,44732,11,44760,44760,11,44788,44788,11,44816,44816,11,44844,44844,11,44872,44872,11,44900,44900,11,44928,44928,11,44956,44956,11,44984,44984,11,45012,45012,11,45040,45040,11,45068,45068,11,45096,45096,11,45124,45124,11,45152,45152,11,45180,45180,11,45208,45208,11,45236,45236,11,45264,45264,11,45292,45292,11,45320,45320,11,45348,45348,11,45376,45376,11,45404,45404,11,45432,45432,11,45460,45460,11,45488,45488,11,45516,45516,11,45544,45544,11,45572,45572,11,45600,45600,11,45628,45628,11,45656,45656,11,45684,45684,11,45712,45712,11,45740,45740,11,45768,45768,11,45796,45796,11,45824,45824,11,45852,45852,11,45880,45880,11,45908,45908,11,45936,45936,11,45964,45964,11,45992,45992,11,46020,46020,11,46048,46048,11,46076,46076,11,46104,46104,11,46132,46132,11,46160,46160,11,46188,46188,11,46216,46216,11,46244,46244,11,46272,46272,11,46300,46300,11,46328,46328,11,46356,46356,11,46384,46384,11,46412,46412,11,46440,46440,11,46468,46468,11,46496,46496,11,46524,46524,11,46552,46552,11,46580,46580,11,46608,46608,11,46636,46636,11,46664,46664,11,46692,46692,11,46720,46720,11,46748,46748,11,46776,46776,11,46804,46804,11,46832,46832,11,46860,46860,11,46888,46888,11,46916,46916,11,46944,46944,11,46972,46972,11,47000,47000,11,47028,47028,11,47056,47056,11,47084,47084,11,47112,47112,11,47140,47140,11,47168,47168,11,47196,47196,11,47224,47224,11,47252,47252,11,47280,47280,11,47308,47308,11,47336,47336,11,47364,47364,11,47392,47392,11,47420,47420,11,47448,47448,11,47476,47476,11,47504,47504,11,47532,47532,11,47560,47560,11,47588,47588,11,47616,47616,11,47644,47644,11,47672,47672,11,47700,47700,11,47728,47728,11,47756,47756,11,47784,47784,11,47812,47812,11,47840,47840,11,47868,47868,11,47896,47896,11,47924,47924,11,47952,47952,11,47980,47980,11,48008,48008,11,48036,48036,11,48064,48064,11,48092,48092,11,48120,48120,11,48148,48148,11,48176,48176,11,48204,48204,11,48232,48232,11,48260,48260,11,48288,48288,11,48316,48316,11,48344,48344,11,48372,48372,11,48400,48400,11,48428,48428,11,48456,48456,11,48484,48484,11,48512,48512,11,48540,48540,11,48568,48568,11,48596,48596,11,48624,48624,11,48652,48652,11,48680,48680,11,48708,48708,11,48736,48736,11,48764,48764,11,48792,48792,11,48820,48820,11,48848,48848,11,48876,48876,11,48904,48904,11,48932,48932,11,48960,48960,11,48988,48988,11,49016,49016,11,49044,49044,11,49072,49072,11,49100,49100,11,49128,49128,11,49156,49156,11,49184,49184,11,49212,49212,11,49240,49240,11,49268,49268,11,49296,49296,11,49324,49324,11,49352,49352,11,49380,49380,11,49408,49408,11,49436,49436,11,49464,49464,11,49492,49492,11,49520,49520,11,49548,49548,11,49576,49576,11,49604,49604,11,49632,49632,11,49660,49660,11,49688,49688,11,49716,49716,11,49744,49744,11,49772,49772,11,49800,49800,11,49828,49828,11,49856,49856,11,49884,49884,11,49912,49912,11,49940,49940,11,49968,49968,11,49996,49996,11,50024,50024,11,50052,50052,11,50080,50080,11,50108,50108,11,50136,50136,11,50164,50164,11,50192,50192,11,50220,50220,11,50248,50248,11,50276,50276,11,50304,50304,11,50332,50332,11,50360,50360,11,50388,50388,11,50416,50416,11,50444,50444,11,50472,50472,11,50500,50500,11,50528,50528,11,50556,50556,11,50584,50584,11,50612,50612,11,50640,50640,11,50668,50668,11,50696,50696,11,50724,50724,11,50752,50752,11,50780,50780,11,50808,50808,11,50836,50836,11,50864,50864,11,50892,50892,11,50920,50920,11,50948,50948,11,50976,50976,11,51004,51004,11,51032,51032,11,51060,51060,11,51088,51088,11,51116,51116,11,51144,51144,11,51172,51172,11,51200,51200,11,51228,51228,11,51256,51256,11,51284,51284,11,51312,51312,11,51340,51340,11,51368,51368,11,51396,51396,11,51424,51424,11,51452,51452,11,51480,51480,11,51508,51508,11,51536,51536,11,51564,51564,11,51592,51592,11,51620,51620,11,51648,51648,11,51676,51676,11,51704,51704,11,51732,51732,11,51760,51760,11,51788,51788,11,51816,51816,11,51844,51844,11,51872,51872,11,51900,51900,11,51928,51928,11,51956,51956,11,51984,51984,11,52012,52012,11,52040,52040,11,52068,52068,11,52096,52096,11,52124,52124,11,52152,52152,11,52180,52180,11,52208,52208,11,52236,52236,11,52264,52264,11,52292,52292,11,52320,52320,11,52348,52348,11,52376,52376,11,52404,52404,11,52432,52432,11,52460,52460,11,52488,52488,11,52516,52516,11,52544,52544,11,52572,52572,11,52600,52600,11,52628,52628,11,52656,52656,11,52684,52684,11,52712,52712,11,52740,52740,11,52768,52768,11,52796,52796,11,52824,52824,11,52852,52852,11,52880,52880,11,52908,52908,11,52936,52936,11,52964,52964,11,52992,52992,11,53020,53020,11,53048,53048,11,53076,53076,11,53104,53104,11,53132,53132,11,53160,53160,11,53188,53188,11,53216,53216,11,53244,53244,11,53272,53272,11,53300,53300,11,53328,53328,11,53356,53356,11,53384,53384,11,53412,53412,11,53440,53440,11,53468,53468,11,53496,53496,11,53524,53524,11,53552,53552,11,53580,53580,11,53608,53608,11,53636,53636,11,53664,53664,11,53692,53692,11,53720,53720,11,53748,53748,11,53776,53776,11,53804,53804,11,53832,53832,11,53860,53860,11,53888,53888,11,53916,53916,11,53944,53944,11,53972,53972,11,54000,54000,11,54028,54028,11,54056,54056,11,54084,54084,11,54112,54112,11,54140,54140,11,54168,54168,11,54196,54196,11,54224,54224,11,54252,54252,11,54280,54280,11,54308,54308,11,54336,54336,11,54364,54364,11,54392,54392,11,54420,54420,11,54448,54448,11,54476,54476,11,54504,54504,11,54532,54532,11,54560,54560,11,54588,54588,11,54616,54616,11,54644,54644,11,54672,54672,11,54700,54700,11,54728,54728,11,54756,54756,11,54784,54784,11,54812,54812,11,54840,54840,11,54868,54868,11,54896,54896,11,54924,54924,11,54952,54952,11,54980,54980,11,55008,55008,11,55036,55036,11,55064,55064,11,55092,55092,11,55120,55120,11,55148,55148,11,55176,55176,11,55216,55238,9,64286,64286,5,65056,65071,5,65438,65439,5,65529,65531,4,66272,66272,5,68097,68099,5,68108,68111,5,68159,68159,5,68900,68903,5,69446,69456,5,69632,69632,7,69634,69634,7,69744,69744,5,69759,69761,5,69808,69810,7,69815,69816,7,69821,69821,1,69837,69837,1,69927,69931,5,69933,69940,5,70003,70003,5,70018,70018,7,70070,70078,5,70082,70083,1,70094,70094,7,70188,70190,7,70194,70195,7,70197,70197,7,70206,70206,5,70368,70370,7,70400,70401,5,70459,70460,5,70463,70463,7,70465,70468,7,70475,70477,7,70498,70499,7,70512,70516,5,70712,70719,5,70722,70724,5,70726,70726,5,70832,70832,5,70835,70840,5,70842,70842,5,70845,70845,5,70847,70848,5,70850,70851,5,71088,71089,7,71096,71099,7,71102,71102,7,71132,71133,5,71219,71226,5,71229,71229,5,71231,71232,5,71340,71340,7,71342,71343,7,71350,71350,7,71453,71455,5,71462,71462,7,71724,71726,7,71736,71736,7,71984,71984,5,71991,71992,7,71997,71997,7,71999,71999,1,72001,72001,1,72003,72003,5,72148,72151,5,72156,72159,7,72164,72164,7,72243,72248,5,72250,72250,1,72263,72263,5,72279,72280,7,72324,72329,1,72343,72343,7,72751,72751,7,72760,72765,5,72767,72767,5,72873,72873,7,72881,72881,7,72884,72884,7,73009,73014,5,73020,73021,5,73030,73030,1,73098,73102,7,73107,73108,7,73110,73110,7,73459,73460,5,78896,78904,4,92976,92982,5,94033,94087,7,94180,94180,5,113821,113822,5,118528,118573,5,119141,119141,5,119143,119145,5,119150,119154,5,119163,119170,5,119210,119213,5,121344,121398,5,121461,121461,5,121499,121503,5,122880,122886,5,122907,122913,5,122918,122922,5,123566,123566,5,125136,125142,5,126976,126979,14,126981,127182,14,127184,127231,14,127279,127279,14,127344,127345,14,127374,127374,14,127405,127461,14,127489,127490,14,127514,127514,14,127538,127546,14,127561,127567,14,127570,127743,14,127757,127758,14,127760,127760,14,127762,127762,14,127766,127768,14,127770,127770,14,127772,127772,14,127775,127776,14,127778,127779,14,127789,127791,14,127794,127795,14,127798,127798,14,127819,127819,14,127824,127824,14,127868,127868,14,127870,127871,14,127892,127893,14,127896,127896,14,127900,127901,14,127904,127940,14,127942,127942,14,127944,127944,14,127946,127946,14,127951,127955,14,127968,127971,14,127973,127984,14,127987,127987,14,127989,127989,14,127991,127991,14,127995,127999,5,128008,128008,14,128012,128014,14,128017,128018,14,128020,128020,14,128022,128022,14,128042,128042,14,128063,128063,14,128065,128065,14,128101,128101,14,128108,128109,14,128173,128173,14,128182,128183,14,128236,128237,14,128239,128239,14,128245,128245,14,128248,128248,14,128253,128253,14,128255,128258,14,128260,128263,14,128265,128265,14,128277,128277,14,128300,128301,14,128326,128328,14,128331,128334,14,128336,128347,14,128360,128366,14,128369,128370,14,128378,128378,14,128391,128391,14,128394,128397,14,128400,128400,14,128405,128406,14,128420,128420,14,128422,128423,14,128425,128432,14,128435,128443,14,128445,128449,14,128453,128464,14,128468,128475,14,128479,128480,14,128482,128482,14,128484,128487,14,128489,128494,14,128496,128498,14,128500,128505,14,128507,128511,14,128513,128518,14,128521,128525,14,128527,128527,14,128529,128529,14,128533,128533,14,128535,128535,14,128537,128537,14]'
  )
}
class ConfusableCharacterHandler {
  constructor(dictionary) {
    this.confusableDictionary = dictionary;
  }
  static {
    this.ambiguousCharacterData = new Lazy(() =>
      JSON.parse('{common:[]}')
    );
  }
  static {
    this.cache = new Memoize(locales => {
      function createMapFromArray(array) {
        let map = new Map();
        for (let i = 0; i < array.length; i += 2) map.set(array[i], array[i + 1]);
        return map;
      }
      function mergeMaps(map1, map2) {
        let mergedMap = new Map(map1);
        for (let [key, value] of map2) mergedMap.set(key, value);
        return mergedMap;
      }
      function intersectMaps(map1, map2) {
        if (!map1) return map2;
        let intersectedMap = new Map();
        for (let [key, value] of map1) map2.has(key) && intersectedMap.set(key, value);
        return intersectedMap;
      }
      let data = this.ambiguousCharacterData.value,
        filteredLocales = locales.filter(locale => !locale.startsWith('_') && locale in data);
      filteredLocales.length === 0 && (filteredLocales = ['_default']);
      let intersectedMap;
      for (let locale of filteredLocales) {
        let map = createMapFromArray(data[locale]);
        intersectedMap = intersectMaps(intersectedMap, map);
      }
      let commonMap = createMapFromArray(data._common),
        mergedMap = mergeMaps(commonMap, intersectedMap);
      return new ConfusableCharacterHandler(mergedMap);
    });
  }
  static getInstance(locales) {
    return ConfusableCharacterHandler.cache.get(Array.from(locales));
  }
  static {
    this._locales = new Lazy(() => Object.keys(ConfusableCharacterHandler.ambiguousCharacterData.value).filter(locale => !locale.startsWith('_')));
  }
  static getLocales() {
    return ConfusableCharacterHandler._locales.value;
  }
  isAmbiguous(character) {
    return this.confusableDictionary.has(character);
  }
  getPrimaryConfusable(character) {
    return this.confusableDictionary.get(character);
  }
  getConfusableCodePoints() {
    return new Set(this.confusableDictionary.keys());
  }
};
class InvisibleCharacterHandler {
  static getRawData() {
    return JSON.parse('[]');
  }
  static {
    this._data = undefined;
  }
  static getData() {
    return this._data || (this._data = new Set(InvisibleCharacterHandler.getRawData())), this._data;
  }
  static isInvisibleCharacter(character) {
    return InvisibleCharacterHandler.getData().has(character);
  }
  static get codePoints() {
    return InvisibleCharacterHandler.getData();
  }
};
function isPathSeparator(charCode) {
  return charCode === 47 || charCode === 92;
}
function replacePathSeparators(path) {
  return path.replace(/[\\/]/g, posixPathOperations.sep);
}

function normalizeWindowsPath(path) {
  if (path.indexOf('/') === -1) {
    path = replacePathSeparators(path);
  }
  if (/^[a-zA-Z]:(\/|$)/.test(path)) {
    path = '/' + path;
  }
  return path;
}

function getRoot(path, separator = posixPathOperations.sep) {
  if (!path) return '';
  let length = path.length,
    firstCharCode = path.charCodeAt(0);
  if (isPathSeparator(firstCharCode)) {
    if (isPathSeparator(path.charCodeAt(1)) && !isPathSeparator(path.charCodeAt(2))) {
      let index = 3,
        start = index;
      for (; index < length && !isPathSeparator(path.charCodeAt(index)); index++);
      if (start !== index && !isPathSeparator(path.charCodeAt(index + 1))) {
        for (index += 1; index < length; index++) if (isPathSeparator(path.charCodeAt(index))) return path.slice(0, index + 1).replace(/[\\/]/g, separator);
      }
    }
    return separator;
  } else if (isAlphabet(firstCharCode) && path.charCodeAt(1) === 58) return isPathSeparator(path.charCodeAt(2)) ? path.slice(0, 2) + separator : path.slice(0, 2);
  let protocolIndex = path.indexOf('://');
  if (protocolIndex !== -1) {
    for (protocolIndex += 3; protocolIndex < length; protocolIndex++) if (isPathSeparator(path.charCodeAt(protocolIndex))) return path.slice(0, protocolIndex + 1);
  }
  return '';
}

function startsWithFolder(path, folder, caseSensitive, separator = pathSeparator) {
  if (path === folder) return true;
  if (!path || !folder || folder.length > path.length) return false;
  if (caseSensitive) {
    if (!startsWithIgnoreCase(path, folder)) return false;
    if (folder.length === path.length) return true;
    let folderLength = folder.length;
    return folder.charAt(folder.length - 1) === separator && folderLength--, path.charAt(folderLength) === separator;
  }
  return folder.charAt(folder.length - 1) !== separator && (folder += separator), path.indexOf(folder) === 0;
}

function isAlphabet(charCode) {
  return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
}
var resourceTypes;
((T) => (
  (T.inMemory = 'inmemory'),
  (T.vscode = 'vscode'),
  (T.internal = 'private'),
  (T.walkThrough = 'walkThrough'),
  (T.walkThroughSnippet = 'walkThroughSnippet'),
  (T.http = 'http'),
  (T.https = 'https'),
  (T.file = 'file'),
  (T.mailto = 'mailto'),
  (T.untitled = 'untitled'),
  (T.data = 'data'),
  (T.command = 'command'),
  (T.vscodeRemote = 'vscode-remote'),
  (T.vscodeRemoteResource = 'vscode-remote-resource'),
  (T.vscodeManagedRemoteResource = 'vscode-managed-remote-resource'),
  (T.vscodeUserData = 'vscode-userdata'),
  (T.vscodeCustomEditor = 'vscode-custom-editor'),
  (T.vscodeNotebookCell = 'vscode-notebook-cell'),
  (T.vscodeNotebookCellMetadata = 'vscode-notebook-cell-metadata'),
  (T.vscodeNotebookCellOutput = 'vscode-notebook-cell-output'),
  (T.vscodeInteractiveInput = 'vscode-interactive-input'),
  (T.vscodeSettings = 'vscode-settings'),
  (T.vscodeWorkspaceTrust = 'vscode-workspace-trust'),
  (T.vscodeTerminal = 'vscode-terminal'),
  (T.vscodeChatSesssion = 'vscode-chat-editor'),
  (T.webviewPanel = 'webview-panel'),
  (T.vscodeWebview = 'vscode-webview'),
  (T.extension = 'extension'),
  (T.vscodeFileResource = 'vscode-file'),
  (T.tmp = 'tmp'),
  (T.vsls = 'vsls'),
  (T.vscodeSourceControl = 'vscode-scm')
))((resourceTypes ||= {}))
var tokenKey = 'tkn',
  ResourceRewriter = class {
    constructor() {
      this._hosts = Object.create(null)
      this._ports = Object.create(null)
      this._connectionTokens = Object.create(null)
      this._preferredWebSchema = 'http'
      this._delegate = null
      this._remoteResourcesPath = `/${resourceTypes.vscodeRemoteResource}`
    }
    setPreferredWebSchema(schema) {
      this._preferredWebSchema = schema
    }
    setDelegate(delegate) {
      this._delegate = delegate
    }
    setServerRootPath(rootPath) {
      this._remoteResourcesPath = `${rootPath}/${resourceTypes.vscodeRemoteResource}`
    }
    set(host, port, connectionToken) {
      this._hosts[host] = port
      this._ports[host] = connectionToken
    }
    setConnectionToken(host, token) {
      this._connectionTokens[host] = token
    }
    getPreferredWebSchema() {
      return this._preferredWebSchema
    }
    rewrite(uri) {
      if (this._delegate)
        try {
          return this._delegate(uri)
        } catch (error) {
          return handleUnexpectedError(error), uri
        }
      let authority = uri.authority,
        host = this._hosts[authority]
      host && host.indexOf(':') !== -1 && host.indexOf('[') === -1 && (host = `[${host}]`)
      let port = this._ports[authority],
        connectionToken = this._connectionTokens[authority],
        query = `path=${encodeURIComponent(uri.path)}`
      return (
        typeof connectionToken == 'string' && (query += `&${tokenKey}=${encodeURIComponent(connectionToken)}`),
        Uri.from({
          scheme: isBrowserFlag ? this._preferredWebSchema : resourceTypes.vscodeRemoteResource,
          authority: `${host}:${port}`,
          path: this._remoteResourcesPath,
          query: query,
        })
      )
    }
  },
  resourceRewriterInstance = new ResourceRewriter()
var fallbackAuthority = 'vscode-app',
  ResourceHandler = class ResourceHandlerClass {
    static {
      this.FALLBACK_AUTHORITY = fallbackAuthority
    }
    asBrowserUri(resource) {
      let uri = this.toUri(resource, require)
      return this.uriToBrowserUri(uri)
    }
    uriToBrowserUri(uri) {
      return uri.scheme === resourceTypes.vscodeRemote
        ? resourceRewriterInstance.rewrite(uri)
        : uri.scheme === resourceTypes.file && (isNodeFlag || globalOrigin === `${resourceTypes.vscodeFileResource}://${ResourceHandlerClass.FALLBACK_AUTHORITY}`)
        ? uri.with({
            scheme: resourceTypes.vscodeFileResource,
            authority: uri.authority || ResourceHandlerClass.FALLBACK_AUTHORITY,
            query: null,
            fragment: null,
          })
        : uri
    }
    asFileUri(resource) {
      let uri = this.toUri(resource, require)
      return this.uriToFileUri(uri)
    }
    uriToFileUri(uri) {
      return uri.scheme === resourceTypes.vscodeFileResource
        ? uri.with({
            scheme: resourceTypes.file,
            authority: uri.authority !== ResourceHandlerClass.FALLBACK_AUTHORITY ? uri.authority : null,
            query: null,
            fragment: null,
          })
        : uri
    }
    toUri(resource, requireFunction) {
      return Uri.isUri(resource) ? resource : Uri.parse(requireFunction.toUrl(resource))
    }
  },
  resourceHandlerInstance = new ResourceHandler(),
  crossOriginSettings
;(crossOrigin => {
  let policyMap = new Map([
    ['1', { 'Cross-Origin-Opener-Policy': 'same-origin' }],
    ['2', { 'Cross-Origin-Embedder-Policy': 'require-corp' }],
    ['3', { 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' }],
  ])
  crossOrigin.CoopAndCoep = Object.freeze(policyMap.get('3'))
  let policyKey = 'vscode-coi'
  function getHeadersFromQuery(query) {
    let searchParams
    typeof query == 'string'
      ? (searchParams = new URL(query).searchParams)
      : query instanceof URL
      ? (searchParams = query.searchParams)
      : Uri.isUri(query) && (searchParams = new URL(query.toString(true)).searchParams)
    let policy = searchParams?.get(policyKey)
    if (policy) return policyMap.get(policy)
  }
  crossOrigin.getHeadersFromQuery = getHeadersFromQuery
  function addSearchParam(searchParams, coop, coep) {
    if (!globalThis.crossOriginIsolated) return
    let policy = coop && coep ? '3' : coep ? '2' : '1'
    searchParams instanceof URLSearchParams ? searchParams.set(policyKey, policy) : (searchParams[policyKey] = policy)
  }
  crossOrigin.addSearchParam = addSearchParam
})((crossOriginSettings ||= {}))
function getFilePathWithFlag(filePath, flag = true) {
  return getFilePath(filePath, flag);
}
var UriPathHandler = class {
  constructor(ignorePathCasing) {
    this._ignorePathCasing = ignorePathCasing;
  }

    compare(e, r, n = !1) {
      return e === r ? 0 : compareNumbers(this.getComparisonKey(e, n), this.getComparisonKey(r, n))
    }
    isEqual(e, r, n = !1) {
      return e === r ? !0 : !e || !r ? !1 : this.getComparisonKey(e, n) === this.getComparisonKey(r, n)
    }
    getComparisonKey(e, r = !1) {
      return e
        .with({ path: this._ignorePathCasing(e) ? e.path.toLowerCase() : void 0, fragment: r ? null : void 0 })
        .toString()
    }
    ignorePathCasing(e) {
      return this._ignorePathCasing(e)
    }
    isEqualOrParent(e, r, n = !1) {
      if (e.scheme === r.scheme) {
        if (e.scheme === resourceTypes.file)
          return startsWithFolder(getFilePathWithFlag(e), getFilePathWithFlag(r), this._ignorePathCasing(e)) && e.query === r.query && (n || e.fragment === r.fragment)
        if (areAuthoritiesEqual(e.authority, r.authority))
          return (
            startsWithFolder(e.path, r.path, this._ignorePathCasing(e), '/') &&
            e.query === r.query &&
            (n || e.fragment === r.fragment)
          )
      }
      return !1
    }
    joinPath(e, ...r) {
      return Uri.joinPath(e, ...r)
    }
    basenameOrAuthority(e) {
      return getBasename(e) || e.authority
    }
    basename(e) {
      return posixPathOperations.basename(e.path)
    }
    extname(e) {
      return posixPathOperations.extname(e.path)
    }
    dirname(e) {
      if (e.path.length === 0) return e
      let r
      return (
        e.scheme === resourceTypes.file
          ? (r = Uri.file(dirname(getFilePathWithFlag(e))).path)
          : ((r = posixPathOperations.dirname(e.path)),
            e.authority &&
              r.length &&
              r.charCodeAt(0) !== 47 &&
              (console.error(`dirname("${e.toString})) resulted in a relative path`), (r = '/'))),
        e.with({ path: r })
      )
    }
    normalizePath(e) {
      if (!e.path.length) return e
      let r
      return e.scheme === resourceTypes.file ? (r = Uri.file(normalizePath(getFilePathWithFlag(e))).path) : (r = posixPathOperations.normalize(e.path)), e.with({ path: r })
    }
    relativePath(e, r) {
      if (e.scheme !== r.scheme || !areAuthoritiesEqual(e.authority, r.authority)) return
      if (e.scheme === resourceTypes.file) {
        let o = relativePath(getFilePathWithFlag(e), getFilePathWithFlag(r))
        return isWindowsFlag ? replacePathSeparators(o) : o
      }
      let n = e.path || '/',
        i = r.path || '/'
      if (this._ignorePathCasing(e)) {
        let o = 0
        for (
          let s = Math.min(n.length, i.length);
          o < s && !(n.charCodeAt(o) !== i.charCodeAt(o) && n.charAt(o).toLowerCase() !== i.charAt(o).toLowerCase());
          o++
        );
        n = i.substr(0, o) + n.substr(o)
      }
      return posixPathOperations.relative(n, i)
    }
    resolvePath(e, r) {
      if (e.scheme === resourceTypes.file) {
        let n = Uri.file(joinPath(getFilePathWithFlag(e), r))
        return e.with({ authority: n.authority, path: n.path })
      }
      return (r = normalizeWindowsPath(r)), e.with({ path: posixPathOperations.resolve(e.path, r) })
    }
    isAbsolutePath(e) {
      return !!e.path && e.path[0] === '/'
    }
    isEqualAuthority(e, r) {
      return e === r || (e !== void 0 && r !== void 0 && equalsIgnoreCase(e, r))
    }
    hasTrailingPathSeparator(e, r = pathSeparator) {
      if (e.scheme === resourceTypes.file) {
        let n = getFilePathWithFlag(e)
        return n.length > getRoot(n).length && n[n.length - 1] === r
      } else {
        let n = e.path
        return n.length > 1 && n.charCodeAt(n.length - 1) === 47 && !/^[a-zA-Z]:(\/$|\\$)/.test(e.fsPath)
      }
    }
    removeTrailingPathSeparator(e, r = pathSeparator) {
      return hasTrailingPathSeparator(e, r) ? e.with({ path: e.path.substr(0, e.path.length - 1) }) : e
    }
    addTrailingPathSeparator(e, r = pathSeparator) {
      let n = !1
      if (e.scheme === resourceTypes.file) {
        let i = getFilePathWithFlag(e)
        n = i !== void 0 && i.length === getRoot(i).length && i[i.length - 1] === r
      } else {
        r = '/'
        let i = e.path
        n = i.length === 1 && i.charCodeAt(i.length - 1) === 47
      }
      return !n && !hasTrailingPathSeparator(e, r) ? e.with({ path: e.path + '/' }) : e
    }
  }
var defaultPathHandler = new UriPathHandler(() => false),
fileSystemPathHandler = new UriPathHandler(t => (t.scheme === resourceTypes.file ? !isLinuxFlag : !0)),
alwaysCaseSensitivePathHandler = new UriPathHandler(t => !0),
arePathsEqual = defaultPathHandler.isEqual.bind(defaultPathHandler),
isPathEqualOrParent = defaultPathHandler.isEqualOrParent.bind(defaultPathHandler),
getComparisonKey = defaultPathHandler.getComparisonKey.bind(defaultPathHandler),
getBasenameOrAuthority = defaultPathHandler.basenameOrAuthority.bind(defaultPathHandler),
getBasename = defaultPathHandler.basename.bind(defaultPathHandler),
getExtension = defaultPathHandler.extname.bind(defaultPathHandler),
getDirname = defaultPathHandler.dirname.bind(defaultPathHandler),
joinPaths = defaultPathHandler.joinPath.bind(defaultPathHandler),
normalizePath = defaultPathHandler.normalizePath.bind(defaultPathHandler),
getRelativePath = defaultPathHandler.relativePath.bind(defaultPathHandler),
resolvePath = defaultPathHandler.resolvePath.bind(defaultPathHandler),
isAbsolutePath = defaultPathHandler.isAbsolutePath.bind(defaultPathHandler),
areAuthoritiesEqual = defaultPathHandler.isEqualAuthority.bind(defaultPathHandler),
hasTrailingPathSeparator = defaultPathHandler.hasTrailingPathSeparator.bind(defaultPathHandler),
removeTrailingPathSeparator = defaultPathHandler.removeTrailingPathSeparator.bind(defaultPathHandler),
addTrailingPathSeparator = defaultPathHandler.addTrailingPathSeparator.bind(defaultPathHandler)
var metaData
;(metaDataObject => {
  ;(metaDataObject.META_DATA_LABEL = 'label'),
    (metaDataObject.META_DATA_DESCRIPTION = 'description'),
    (metaDataObject.META_DATA_SIZE = 'size'),
    (metaDataObject.META_DATA_MIME = 'mime')
  function parseMetaData(pathObject) {
    let metaDataMap = new Map()
    pathObject.path
      .substring(pathObject.path.indexOf(';') + 1, pathObject.path.lastIndexOf(';'))
      .split(';')
      .forEach(metaDataItem => {
        let [key, value] = metaDataItem.split(':')
        key && value && metaDataMap.set(key, value)
      })
    let mimeType = pathObject.path.substring(0, pathObject.path.indexOf(';'))
    return mimeType && metaDataMap.set(metaDataObject.META_DATA_MIME, mimeType), metaDataMap
  }
  metaDataObject.parseMetaData = parseMetaData
})((metaData ||= {}))
var microtaskDelaySymbol = Symbol('MicrotaskDelay')
function handleCancellation(promise, cancellationToken, cancellationValue) {
  return new Promise((resolve, reject) => {
    let cancellationDisposable = cancellationToken.onCancellationRequested(() => {
      cancellationDisposable.dispose(), resolve(cancellationValue)
    })
    promise.then(resolve, reject).finally(() => cancellationDisposable.dispose())
  })
}
function timeoutPromise(promise, timeout, onTimeout) {
  let timeoutCancel,
    timeoutId = setTimeout(() => {
      timeoutCancel?.(void 0), onTimeout?.()
    }, timeout)
  return Promise.race([promise.finally(() => clearTimeout(timeoutId)), new Promise(resolve => (timeoutCancel = resolve))])
}
var idleCallback, idleCallbackFunction
;(function () {
  typeof globalThis.requestIdleCallback != 'function' || typeof globalThis.cancelIdleCallback != 'function'
    ? (idleCallbackFunction = (callback, onTimeout) => {
      scheduleAsyncWork(() => {
          if (isDisposed) return
          let deadline = Date.now() + 15
          onTimeout(
            Object.freeze({
              didTimeout: true,
              timeRemaining() {
                return Math.max(0, deadline - Date.now())
              },
            })
          )
        })
        let isDisposed = false
        return {
          dispose() {
            isDisposed || (isDisposed = true)
          },
        }
      })
    : (idleCallbackFunction = (callback, onTimeout, timeout) => {
        let idleCallbackId = callback.requestIdleCallback(onTimeout, typeof timeout == 'number' ? { timeout: timeout } : void 0),
          isDisposed = false
        return {
          dispose() {
            isDisposed || ((isDisposed = true), callback.cancelIdleCallback(idleCallbackId))
          },
        }
      }),
    (idleCallback = callback => idleCallbackFunction(globalThis, callback))
})()
var PromiseOutcome = class {
  get isRejected() {
    return this.outcome?.outcome === 1
  }
  get isResolved() {
    return this.outcome?.outcome === 0
  }
  get isSettled() {
    return !!this.outcome
  }
  get value() {
    return this.outcome?.outcome === 0 ? this.outcome?.value : void 0
  }
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      ;(this.completeCallback = resolve), (this.errorCallback = reject)
    })
  }
  complete(value) {
    return new Promise(resolve => {
      this.completeCallback(value), (this.outcome = { outcome: 0, value: value }), resolve()
    })
  }
  error(value) {
    return new Promise(resolve => {
      this.errorCallback(value), (this.outcome = { outcome: 1, value: value }), resolve()
    })
  }
  cancel() {
    return this.error(new CancellationError())
  }
},
promiseUtils
;(utils => {
  async function settled(promises) {
    let error,
      results = await Promise.all(
        promises.map(promise =>
          promise.then(
            result => result,
            result => {
              error || (error = result)
            }
          )
        )
      )
    if (typeof error < 'u') throw error
    return results
  }
  utils.settled = settled
  function withAsyncBody(asyncFunction) {
    return new Promise(async (resolve, reject) => {
      try {
        await asyncFunction(resolve, reject)
      } catch (error) {
        reject(error)
      }
    })
  }
  utils.withAsyncBody = withAsyncBody
})((promiseUtils ||= {}))
class AsyncIterable {
  static fromArray(array) {
    return new AsyncIterable(emitter => {
      emitter.emitMany(array)
    })
  }
  static fromPromise(promise) {
    return new AsyncIterable(async emitter => {
      emitter.emitMany(await promise)
    })
  }
  static fromPromises(promises) {
    return new AsyncIterable(async emitter => {
      await Promise.all(promises.map(async promise => emitter.emitOne(await promise)))
    })
  }
  static merge(iterables) {
    return new AsyncIterable(async emitter => {
      await Promise.all(
        iterables.map(async iterable => {
          for await (let item of iterable) emitter.emitOne(item)
        })
      )
    })
  }
  static {
    this.EMPTY = AsyncIterable.fromArray([])
  }
  constructor(iterableFunction) {
    ;(this._state = 0),
      (this._results = []),
      (this._error = null),
      (this._onStateChanged = new EventManager()),
      queueMicrotask(async () => {
        let emitter = { emitOne: item => this.emitOne(item), emitMany: items => this.emitMany(items), reject: error => this.reject(error) }
        try {
          await Promise.resolve(iterableFunction(emitter)), this.resolve()
        } catch (error) {
          this.reject(error)
        } finally {
          ;(emitter.emitOne = void 0), (emitter.emitMany = void 0), (emitter.reject = void 0)
        }
      })
  }
  [Symbol.asyncIterator]() {
    let index = 0
    return {
      next: async () => {
        do {
          if (this._state === 2) throw this._error
          if (index < this._results.length) return { done: false, value: this._results[index++] }
          if (this._state === 1) return { done: true, value: void 0 }
          await EventUtils.toPromise(this._onStateChanged.event)
        } while (true)
      },
    }
  }
  static map(iterable, mapFunction) {
    return new AsyncIterable(async emitter => {
      for await (let item of iterable) emitter.emitOne(mapFunction(item))
    })
  }
  map(mapFunction) {
    return AsyncIterable.map(this, mapFunction)
  }
  static filter(iterable, filterFunction) {
    return new AsyncIterable(async emitter => {
      for await (let item of iterable) filterFunction(item) && emitter.emitOne(item)
    })
  }
  filter(filterFunction) {
    return AsyncIterable.filter(this, filterFunction)
  }
  static coalesce(iterable) {
    return AsyncIterable.filter(iterable, item => !!item)
  }
  coalesce() {
    return AsyncIterable.coalesce(this)
  }
  static async toPromise(iterable) {
    let results = []
    for await (let item of iterable) results.push(item)
    return results
  }
  toPromise() {
    return AsyncIterable.toPromise(this)
  }
  emitOne(item) {
    if (this._state === 0) {
      this._results.push(item)
      this._onStateChanged.fire()
    }
  }
  emitMany(items) {
    if (this._state === 0) {
      this._results = this._results.concat(items)
      this._onStateChanged.fire()
    }
  }
  resolve() {
    if (this._state === 0) {
      this._state = 1
      this._onStateChanged.fire()
    }
  }
  reject(error) {
    if (this._state === 0) {
      this._state = 2
      this._error = error
      this._onStateChanged.fire()
    }
  }
}
var DeferredAsyncIterable = class {
  constructor() {
    this._deferred = new PromiseOutcome()
    this._asyncIterable = new AsyncIterable(emitter => {
      if (error) {
        emitter.reject(error)
        return
      }
      return (
        items && emitter.emitMany(items),
        (this._errorFn = err => emitter.reject(err)),
        (this._emitFn = item => emitter.emitOne(item)),
        this._deferred.p
      )
    })
    let error, items
    ;(this._emitFn = item => {
      items || (items = []), items.push(item)
    }),
      (this._errorFn = err => {
        error || (error = err)
      })
  }
  get asyncIterable() {
    return this._asyncIterable
  }
  resolve() {
    this._deferred.complete()
  }
  reject(err) {
    this._errorFn(err), this._deferred.complete()
  }
  emitOne(item) {
    this._emitFn(item)
  }
}
var crypto = require('crypto')

function generateTelemetryEvent() {
  let id = (0, crypto.randomUUID)(),
    event = TelemetryEvent.createAndMarkAsIssued({ messageId: id })
  return new TelemetryEventWrapper(event)
}

var TelemetryEventWrapper = class {
  constructor(event) {
    this.raw = event
  }
  get properties() {
    return this.raw.properties
  }
  get measurements() {
    return this.raw.measurements
  }
  markAsDisplayed() {
    this.raw.markAsDisplayed()
  }
  extendedBy(properties, measurements) {
    let extendedEvent = this.raw.extendedBy(properties, measurements)
    return new TelemetryEventWrapper(extendedEvent)
  }
}

function extendTelemetryEventWithUserInput(conversation, conversationId, uiKind, message, promptTokenLen, suggestion, telemetryEvent) {
  let inputSources = conversation.turns[conversation.turns.length - 1].contextParts.map(part => part.kind).sort(),
    properties = {
      source: 'user',
      turnIndex: (conversation.turns.length - 1).toString(),
      conversationId: conversationId,
      uiKind: uiKind,
      inputSources: inputSources.join(','),
    },
    measurements = { promptTokenLen: promptTokenLen, messageCharLen: message.length }
  return suggestion && (properties.suggestion = suggestion), (telemetryEvent = telemetryEvent.extendedBy(properties, measurements)), telemetryEvent
}

function extendTelemetryEventWithOffTopicFlag(conversation, conversationId, uiKind, offTopicFlag, message, telemetryEvent) {
  offTopicFlag !== void 0 && (telemetryEvent = telemetryEvent.extendedBy({ offTopic: offTopicFlag.toString() })), sendTelemetryEvent(conversation, message, conversationId, uiKind, {}, {}, telemetryEvent)
}

function extendTelemetryEventWithModelOutput(conversation, conversationId, uiKind, message, headerRequestId, codeBlocks, telemetryEvent) {
  let codeBlockLanguages = extractCodeBlocks(codeBlocks)
  sendTelemetry(
    conversation,
    codeBlocks,
    uiKind,
    message,
    {
      source: 'model',
      turnIndex: conversation.turns.length.toString(),
      conversationId: conversationId,
      headerRequestId: headerRequestId,
      uiKind: uiKind,
      codeBlockLanguages: JSON.stringify({ ...codeBlockLanguages }),
    },
    { messageCharLen: message.length, numCodeBlocks: codeBlockLanguages.length },
    telemetryEvent
  )
}

function extendTelemetryEventWithOffTopicMessage(conversation, conversationId, uiKind, message, userMessageId, telemetryEvent) {
  sendTelemetry(
    conversation,
    telemetryEvent,
    uiKind,
    message,
    { source: 'offTopic', turnIndex: conversation.turns.length.toString(), conversationId: conversationId, userMessageId: userMessageId, uiKind: uiKind },
    { messageCharLen: message.length },
    telemetryEvent
  )
}
function sendTelemetryData(telemetryService, event, rawMessage, messageText, languageId, documentLength, extension) {
  let message = { ...(messageText ? { messageText: messageText } : {}), ...extension }
  if (languageId && documentLength) {
    extension.languageId = languageId;
    documentLength.documentLength = documentLength.getText().length;
  }
  let extendedByIO = extension.extendedBy(extension, documentLength),
    extendedByMessage = extension.extendedBy(message),
    conversationType = determineConversationType(event),
    telemetryServiceInstance = telemetryService.get(IGHTelemetryService)
  return telemetryServiceInstance.sendTelemetry(`${conversationType}.message`, extendedByIO.raw), telemetryServiceInstance.sendRestrictedTelemetry(`${conversationType}.messageText`, extendedByMessage.raw), extendedByIO.raw
}

function displaySuggestion(telemetryService, suggestion, messageId, suggestionId, extension) {
  return sendSuggestionTelemetry(telemetryService, extension, { suggestion: suggestion, messageId: messageId, suggestionId: suggestionId }, {}, 'conversation.suggestionShown')
}
function sendSuggestionTelemetry(telemetryService, languageId, documentLength, extension, event) {
  let telemetryEvent = TelemetryEvent.createAndMarkAsIssued()
  if (languageId && documentLength) {
    documentLength.languageId = languageId;
    documentLength.documentLength = documentLength.getText().length;
  }
  let extendedEvent = telemetryEvent.extendedBy(documentLength, extension)
  return telemetryService.get(IGHTelemetryService).sendTelemetry(event, extendedEvent), extendedEvent
}
async function sendEngineMessages(telemetryService, messages, extension) {
  let extendedEvent = extension.extendedBy({ messagesJson: JSON.stringify(messages) })
  await telemetryService.get(IGHTelemetryService).sendRestrictedTelemetry('engine.messages', extendedEvent)
}
function determineConversationType(event) {
  switch (event) {
    case 'conversationInline':
      return 'inlineConversation'
    case 'conversationPanel':
    default:
      return 'conversation'
  }
}
function extractCodeBlocks(text) {
  let lines = text.split(`\n`),
    codeBlocks = [],
    tempBlocks = []
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    line.startsWith('```') && (tempBlocks.length > 0 && line === '```' ? codeBlocks.push(tempBlocks.pop()) : tempBlocks.length === 0 && tempBlocks.push(line.substring(3)))
  }
  return codeBlocks
}

function getGithubRepository(url) {
  if (url !== void 0 && url !== 0 && url.hostname === 'github.com') return url.owner + '/' + url.repo
}

function processIncomingMessage(telemetryService, message, tokens, choiceIndex, requestId, blockFinished, finishReason, extension) {
  sendEngineMessages(telemetryService, [message], extension)
  return {
    message: message,
    choiceIndex: choiceIndex,
    requestId: requestId,
    blockFinished: blockFinished,
    finishReason: finishReason,
    tokens: tokens.tokens,
    numTokens: tokens.tokens.length,
    telemetryData: extension,
  }
}

function processStreamedMessages(telemetryService, message, extension) {
  let logger = telemetryService.get(LoggerManager).getLogger('streamMessages'),
    messageText = message.solution.text.join(''),
    earlyFinish = false
  if (message.finishOffset !== void 0) {
    logger.debug(`message ${message.index}: early finish at offset ${message.finishOffset}`)
    messageText = messageText.substring(0, message.finishOffset)
    earlyFinish = true
  }
  logger.info(`message ${message.index} returned. finish reason: [${message.reason}]`)
  logger.debug(`message ${message.index} details: finishOffset: [${message.finishOffset}] completionId: [{${message.requestId.completionId}}] created: [{${message.requestId.created}}]`)
  let response = processResponse(telemetryService, message.solution),
    processedMessage = { role: 'assistant', content: messageText }
  return processIncomingMessage(telemetryService, processedMessage, response, message.index, message.requestId, earlyFinish, message.reason, extension)
}

async function handleChatRequest(context, engine, request, callback, input, cancellationToken, settings) {
  let logger = context.get(LoggerManager).getLogger('chat fetch'),
    requestPayload = prepareRequestPayload(context, request)
  if (cancellationToken?.isCancellationRequested) return { type: 'canceled', reason: 'before fetch request' }
  logger.info(`engine ${engine.engineUrl}`),
    logger.info(`modelMaxTokenWindow ${engine.modelMaxTokenWindow}`),
    logger.info(`chat model ${request.model}`),
    request.intent_model && logger.info(`intent model ${request.intent_model}`),
    request.intent_tokenizer && logger.info(`intent tokenizer ${request.intent_tokenizer}`),
    request.intent_threshold && logger.info(`intent threshold ${request.intent_threshold}`)
  let secretKey = request.secretKey ?? (await context.get(BaseTokenHandler).getCopilotToken(context)).token
  if (!secretKey)
    return (
      logger.error(`Failed to send request to ${engine.url} due to missing key`),
      logError(context.get(IGHTelemetryService), `Failed to send request to ${engine.url} due to missing key`),
      { type: 'failed', failKind: 'tokenExpiredOrInvalid', reason: 'key is missing' }
    )
  let response = await sendChatRequest(context, engine, request.ourRequestId, requestPayload, secretKey, request.location, cancellationToken, settings)
  if (cancellationToken?.isCancellationRequested) {
    let responseBody = await response.body()
    try {
      responseBody.destroy()
    } catch (error) {
      logger.exception(error, 'Error destroying stream'), context.get(IGHTelemetryService).sendExceptionTelemetry(error, 'Error destroying stream')
    }
    return { type: 'canceled', reason: 'after fetch request' }
  }
  if (response.status !== 200) {
    let telemetryEvent = createTelemetryEvent(engine, context, request.location, request.ourRequestId)
    return logger.info('Request ID for failed request: ', request.ourRequestId), handleErrorResponse(context, telemetryEvent, response)
  }
  let concurrency = request.postOptions?.n ?? 1,
    streamProcessor = (await StreamProcessor.create(context, concurrency, request.ourRequestId, response, callback, [], cancellationToken)).processSSE(input)
  return { type: 'success', chatCompletions: AsyncIterable.map(streamProcessor, message => processStreamedMessages(context, message, callback)), getProcessingTime: () => getProcessingTime(response) }
}

function createTelemetryEvent(engine, context, location, requestId) {
  return TelemetryEvent.createAndMarkAsIssued({ endpoint: engine.endpoint, engineName: engine.engineName, uiKind: getConversationType(location), headerRequestId: requestId })
}

function prepareRequestPayload(context, request) {
  let payload = { messages: request.messages, model: request.model }
  request.postOptions && Object.assign(payload, request.postOptions)
  let githubRepo = getGithubRepository(request.repoInfo)
  if (githubRepo !== void 0) payload.nwo = githubRepo
  if (request.intent) {
    payload.intent = request.intent
    if (request.intent_model) payload.intent_model = request.intent_model
    if (request.intent_tokenizer) payload.intent_tokenizer = request.intent_tokenizer
    if (request.intent_threshold) payload.intent_threshold = request.intent_threshold
  }
  return payload
}

async function handleErrorResponse(context, telemetryEvent, response) {
  let logger = context.get(LoggerManager).getLogger('chat fetch'),
    telemetryService = context.get(IGHTelemetryService)
  telemetryEvent.properties.error = `Response status was ${response.status}`
  telemetryEvent.properties.status = String(response.status)
  telemetryService.sendTelemetry('request.shownWarning', telemetryEvent)
  if (response.status === 401 || response.status === 403) {
    context.get(BaseTokenHandler).resetCopilotToken(context, response.status)
    return { type: 'failed', failKind: 'tokenExpiredOrInvalid', reason: `token expired or invalid: ${response.status}` }
  }
  if (response.status === 499) {
    logger.info('Cancelled by server')
    return { type: 'failed', failKind: 'serverCanceled', reason: 'canceled by server' }
  }
  let responseText = await response.text()
  if (response.status === 466) {
    logger.info(responseText)
    return { type: 'failed', failKind: 'clientNotSupported', reason: `client not supported: ${responseText}` }
  } else if (response.status === 400 && responseText.includes('off_topic')) {
    return { type: 'failed', failKind: 'offTopic', reason: 'filtered as off_topic by intent classifier: message was not programming related' }
  } else if (response.status === 429) {
    return { type: 'failed', failKind: 'rateLimited', reason: responseText }
  } else if (response.status >= 500 && response.status < 600) {
    return { type: 'failed', failKind: 'serverError', reason: `${response.status} ${responseText}` }
  } else if (response.status === 422) {
    return { type: 'failed', failKind: 'contentFilter', reason: 'Filtered by Responsible AI Service' }
  } else {
    logger.error('Unhandled status from server:', response.status, responseText)
    logError(telemetryService, 'Unhandled status from server: ' + response.status, responseText)
    return { type: 'failed', failKind: 'unknown', reason: `unhandled status from server: ${response.status} ${responseText}` }
  }
}

function sendChatRequest(context, engine, requestId, options, token, location, cancellationToken, telemetryProps) {
  let logger = context.get(LoggerManager).getLogger('chat fetch'),
    telemetryService = context.get(IGHTelemetryService),
    telemetryEvent = TelemetryEvent.createAndMarkAsIssued(
      { endpoint: engine.endpoint, engineName: engine.engineName, uiKind: getConversationType(location), ...telemetryProps },
      { maxTokenWindow: engine.modelMaxTokenWindow }
    )
  for (let [optionKey, optionValue] of Object.entries(options))
    optionKey !== 'messages' && (telemetryEvent.properties[`request.option.${optionKey}`] = JSON.stringify(optionValue) ?? 'undefined')
  telemetryEvent.properties.headerRequestId = requestId
  telemetryService.sendTelemetry('request.sent', telemetryEvent)
  let startTime = Date.now(),
    locationStr = getLocationStr(location)
  return sendRequest(context, engine, token, locationStr, requestId, options, cancellationToken)
    .then(response => {
      let responseMetadata = createResponseMetadata(response, void 0)
      telemetryEvent.extendWithRequestId(responseMetadata)
      let elapsedTime = Date.now() - startTime
      telemetryEvent.measurements.totalTimeMs = elapsedTime
      logger.info(`request.response: [${engine.url}], took ${elapsedTime} ms`)
      logger.debug('request.response properties', telemetryEvent.properties)
      logger.debug('request.response measurements', telemetryEvent.measurements)
      logger.debug(`messages: ${JSON.stringify(options.messages)}`)
      telemetryService.sendTelemetry('request.response', telemetryEvent)
      return response
    })
    .catch(error => {
      if (context.get(ConnectionSettings).isAbortError(error)) throw error
      let errorTelemetryEvent = telemetryEvent.extendedBy({ error: 'Network exception' })
      telemetryService.sendTelemetry('request.shownWarning', errorTelemetryEvent)
      telemetryEvent.properties.code = String(error.code ?? '')
      telemetryEvent.properties.errno = String(error.errno ?? '')
      telemetryEvent.properties.message = String(error.message ?? '')
      telemetryEvent.properties.type = String(error.type ?? '')
      let elapsedTime = Date.now() - startTime
      telemetryEvent.measurements.totalTimeMs = elapsedTime
      logger.debug(`request.response: [${engine.url}] took ${elapsedTime} ms`)
      logger.debug('request.error properties', telemetryEvent.properties)
      logger.debug('request.error measurements', telemetryEvent.measurements)
      telemetryService.sendTelemetry('request.error', telemetryEvent)
      throw error
    })
    .finally(() => {
      sendEngineMessages(context, options.messages, telemetryEvent)
    })
}

function getLocationStr(location) {
  switch (location) {
    case 2:
      return 'conversation-panel'
    case 1:
      return 'conversation-inline'
  }
}

class DataRetriever {
  async fetchOne(entity, resource, network, input, options, settings, abortToken, logProps) {
    let collection = await this.fetchMany(entity, resource, network, input, options, { ...settings, count: 1 }, abortToken, logProps)
    return collection.type === 'success' ? { ...collection, value: collection.value[0] } : collection
  }
}

class ChatMLFetcher extends DataRetriever {
  constructor(accessor) {
    super()
    this.accessor = accessor
    this.logger = accessor.get(LoggerManager).getPromptResponseLogger('ChatMLFetcher')
  }
  async fetchMany(entity, resource, network, input, options, settings, abortToken, logProps) {
    let messageId = abortToken?.messageId ?? Crypto.randomUUID(),
      tokenLength = calculateTokenLength(this.accessor, entity)
    settings = { max_tokens: Math.max(options.modelMaxTokenWindow - tokenLength, 1024), ...settings }
    let postOptions = ChatMLFetcher.preparePostOptions(settings),
      model = options.model
    if (logProps) {
      logProps.intent_model = await this.getOffTopicModelName()
      logProps.intent_tokenizer = await this.getOffTopicModelTokenizer()
      logProps.intent_threshold = await this.getOffTopicModelThreshold()
    }
    let requestParams = {
        messages: entity.filter(msg => msg.content && msg.content !== ''),
        model: model,
        repoInfo: void 0,
        ourRequestId: messageId,
        location: input,
        postOptions: postOptions,
        secretKey: settings.secretKey,
        ...logProps,
      },
      telemetryEvent = TelemetryEvent.createAndMarkAsIssued({ ...abortToken, uiKind: getConversationType(input) })
    try {
      let response = await handleChatRequest(this.accessor, options, requestParams, telemetryEvent, resource || (async () => {}), network, abortToken),
        result
      switch (response.type) {
        case 'success':
          return await this.processSuccessfulResponse(response, requestParams.ourRequestId, abortToken, options)
        case 'canceled':
          return this.processCanceledResponse(response, requestParams.ourRequestId)
        case 'failed':
          result = this.processFailedResponse(response, requestParams.ourRequestId)
          this.accessor
            .get(IMSTelemetryService)
            .sendTelemetryEvent(
              'response.error',
              { type: result.type, source: abortToken?.messageSource ?? 'unknown', requestId: requestParams.ourRequestId, model: options.model },
              { maxTokenCount: options.modelMaxTokenWindow ?? -1 }
            )
          return result
      }
    } catch (error) {
      return this.processError(error, requestParams.ourRequestId)
    }
  }

  static preparePostOptions(request) {
    return { ...request, stream: true };
  }
  async processSuccessfulResponse(response, requestId, message, model) {
    let choices = [];
    for await (let chatCompletion of response.chatCompletions) {
      this.serviceAccessor
        .get(IMSTelemetryService)
        .sendTelemetryEvent(
          'response.success',
          {
            reason: chatCompletion.finishReason,
            source: message?.messageSource ?? 'unknown',
            model: model?.model,
            requestId: requestId
          },
          {
            tokenCount: chatCompletion.numTokens,
            maxTokenCount: model?.modelMaxTokenWindow ?? -1,
            processingTime: response.getProcessingTime(),
          }
        );
      if (!this.isRepetitive(chatCompletion, message)) {
        choices.push(chatCompletion);
      }
    }
    this.logger.debug(`Received choices: ${JSON.stringify(choices, null, 2)}`);
    let successfulChoices = choices.filter(choice => choice.finishReason === 'stop' || choice.finishReason === 'client-trimmed');
    if (successfulChoices.length >= 1) {
      return { type: 'success', value: successfulChoices.map(choice => choice.message.content), requestId: requestId };
    }
    switch (choices[0]?.finishReason) {
      case 'content_filter':
        return { type: 'filtered', reason: 'Response got filtered.', requestId: requestId };
      case 'length':
        return { type: 'length', reason: 'Response too long.', requestId: requestId };
    }
    return { type: 'unknown', reason: 'Response contained no choices.', requestId: requestId };
  }

  async getOffTopicModelName() {
    let configName = this.serviceAccessor.get(ConfigManager).getConfig(settings.DebugOverrideChatOffTopicModel);
    if (configName) return configName;
    let experimentName = await this.serviceAccessor.get(ExperimentManager).chatOffTopicModel();
    return experimentName || '';
  }

  async getOffTopicModelTokenizer() {
    let configTokenizer = this.serviceAccessor.get(ConfigManager).getConfig(settings.DebugOverrideChatOffTopicModelTokenizer);
    if (configTokenizer) return configTokenizer;
    let experimentTokenizer = await this.serviceAccessor.get(ExperimentManager).chatOffTopicModelTokenizer();
    return experimentTokenizer || '';
  }
  async getOffTopicModelThreshold() {
    let configThreshold = this.serviceAccessor.get(ConfigManager).getConfig(settings.DebugOverrideChatOffTopicModelThreshold);
    if (configThreshold !== 0) return configThreshold;
    let experimentThreshold = await this.serviceAccessor.get(ExperimentManager).chatOffTopicModelThreshold();
    return experimentThreshold !== 0 ? experimentThreshold : 0;
  }
  isRepetitive(response, message) {
    let isRepetitive = isClientTokenSequenceRepetitive(response.tokens);
    if (isRepetitive) {
      let telemetryEvent = TelemetryEvent.createAndMarkAsIssued();
      telemetryEvent.extendWithRequestId(response.requestId);
      let extendedEvent = telemetryEvent.extendedBy(message);
      this.serviceAccessor.get(IGHTelemetryService).sendRestrictedTelemetry('conversation.repetition.detected', extendedEvent);
      this.logger.info('Filtered out repetitive conversation result');
    }
    return isRepetitive;
  }
  processCanceledResponse(response, requestId) {
    this.logger.debug('Cancelled after awaiting fetchConversation');
    return { type: 'canceled', reason: response.reason, requestId: requestId };
  }
  processFailedResponse(response, requestId) {
    let failKind = response.failKind;
    let reason = response.reason;
    let resultType = 'failed'; // default type

    if (failKind === 'rateLimited') {
      resultType = 'rateLimited';
    } else if (failKind === 'offTopic') {
      resultType = 'offTopic';
    } else if (
      failKind === 'tokenExpiredOrInvalid' ||
      failKind === 'clientNotSupported' ||
      reason.includes('Bad request: ')
    ) {
      resultType = 'badRequest';
    } else if (failKind === 'serverError') {
      resultType = 'failed';
    } else if (failKind === 'contentFilter') {
      resultType = 'filtered';
    }

    return { type: resultType, reason: reason, requestId: requestId };
  }

  processError(error, requestId) {
    let connectionSettings = this.serviceAccessor.get(ConnectionSettings);
    let resultType = 'failed'; // default type
    let reason = 'Error on conversation request. Check the log for more details.'; // default reason

    if (connectionSettings.isAbortError(error)) {
      resultType = 'canceled';
      reason = 'network request aborted';
    } else {
      this.serviceAccessor.get(LoggerManager).defaultLogger.exception(error, 'Error on conversation request');
      this.serviceAccessor.get(IGHTelemetryService).sendExceptionTelemetry(error, 'Error on conversation request');

      if (connectionSettings.isDNSLookupFailedError(error)) {
        reason = "It appears you're not connected to the internet, please check your network connection and try again.";
      } else if (connectionSettings.isFetcherError(error)) {
        reason = `Please check your firewall rules and network connection then try again. Error Code: ${error.code}.`;
      }
    }

    return { type: resultType, reason: reason, requestId: requestId };
  }
}
var GitContextModelIdentifier = createServiceIdentifier('IGitContextModel')
var vscode = handleDefaultExports(require('vscode')),
VscodePosition = vscode.Position,
VscodeRange = vscode.Range,
VscodeSelection = vscode.Selection,
VscodeEventEmitter = vscode.EventEmitter,
VscodeCancellationTokenSource = vscode.CancellationTokenSource
var VscodeTextEdit = vscode.TextEdit,
VscodeWorkspaceEdit = vscode.WorkspaceEdit,
VscodeUri = vscode.Uri,
VscodeMarkdownString = vscode.MarkdownString,
VscodeInteractiveEditorResponseFeedbackKind = vscode.InteractiveEditorResponseFeedbackKind
var VscodeDiagnosticSeverity = vscode.DiagnosticSeverity,
VscodeExtensionMode = vscode.ExtensionMode,
VscodeLocation = vscode.Location
var vscodeL10n = { t: vscode.l10n.t }
var path = handleDefaultExports(require('path'))
var workerThreads = require('worker_threads'),

class WorkerHandler {
  constructor(workerPath, logger) {
    this.logger = logger;
    this.handlers = new Map();
    this.nextId = 1;
    this.worker = new workerThreads.Worker(workerPath);

    this.worker.on('message', ({ id, err, res }) => {
      let handler = this.handlers.get(id);
      if (handler) {
        this.handlers.delete(id);
        err ? handler.reject(err) : handler.resolve(res);
      }
    });

    this.worker.on('error', error => this.handleError(error));
    this.worker.on('exit', exitCode => {
      if (exitCode !== 0) {
        this.handleError(new Error(`Worker thread exited with code ${exitCode}.`));
      }
    });
  }

  terminate() {
    this.worker.removeAllListeners();
    this.worker.terminate();
    this.handlers.clear();
  }

  handleError(error) {
    this.logger?.exception(error);
    for (let handler of this.handlers.values()) {
      handler.reject(error);
    }
    this.handlers.clear();
  }

  remoteCall(functionName, args) {
    let id = this.nextId++;
    let resolve, reject;
    let promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    this.handlers.set(id, { resolve, reject });
    this.worker.postMessage({ id, fn: functionName, args });
    return promise;
  }
}

class WorkerProxy {
  constructor(workerPath, logger) {
    this.workerHandler = new WorkerHandler(workerPath, logger);
    let handler = {
      get: (target, prop) => {
        if (typeof prop == 'string' && !target[prop]) {
          target[prop] = (...args) => {
            if (!this.workerHandler) throw new Error('Worker was terminated!');
            return this.workerHandler.remoteCall(prop, args);
          };
        }
        return target[prop];
      },
    };
    this.proxy = new Proxy(Object.create(null), handler);
  }

  terminate() {
    this.workerHandler.terminate();
  }
}
var TreeSitterUtils = {}
defineProperties(TreeSitterUtils, {
  TreeSitterOffsetRange: () => TreeSitterOffsetRange,
  _clean: () => cleanUp,
  _extractDoc: () => extractDoc,
  _getCallExpressions: () => getCallExpressions,
  _getClassDeclarations: () => getClassDeclarations,
  _getCoarseParentScope: () => getCoarseParentScope,
  _getDocumentableNodeIfOnIdentifier: () => getDocumentableNodeIfOnIdentifier,
  _getFixSelectionOfInterest: () => getFixSelectionOfInterest,
  _getFunctionBodies: () => getFunctionBodies,
  _getFunctionDefinitions: () => getFunctionDefinitions,
  _getFunctionPositions: () => getFunctionPositions,
  _getNewExpressions: () => getNewExpressions,
  _getNodeMatchingSelection: () => getNodeMatchingSelection,
  _getNodeToDocument: () => getNodeToDocument,
  _getSemanticChunkTree: () => getSemanticChunkTree,
  _getTypeDeclarations: () => getTypeDeclarations,
  _getTypeReferences: () => getTypeReferences,
  _parse: () => parseCode,
})

var path = handleDefaultExports(require('path')),
  QI = handleDefaultExports(eK());

function binarySearch(array, value, comparator) {
  let start = 0,
    end = array.length;
  while (start < end) {
    let mid = (start + end) >>> 1;
    comparator(array[mid], value) ? (start = mid + 1) : (end = mid);
  }
  return start;
}

function findMax(array, comparator) {
  if (array.length === 0) return;
  let maxElement = array[0];
  for (let i = 1; i < array.length; i++) {
    let currentElement = array[i];
    if (comparator(currentElement, maxElement) > 0) {
      maxElement = currentElement;
    }
  }
  return maxElement;
}
var LRUCache = class {
  constructor(cacheSize = 10) {
    this.values = new Map()
    this.lruKeys = []
    if (cacheSize < 1) throw new Error('Cache size must be at least 1')
    this.size = cacheSize
  }
  removeKeyFromLRU(key) {
    let index = this.lruKeys.indexOf(key)
    index !== -1 && this.lruKeys.splice(index, 1)
  }
  touchKeyInLRU(key) {
    this.removeKeyFromLRU(key), this.lruKeys.push(key)
  }
  clear() {
    this.values.clear(), (this.lruKeys = [])
  }
  deleteKey(key) {
    this.removeKeyFromLRU(key)
    let value = this.values.get(key)
    return value !== void 0 && this.values.delete(key), value
  }
  get(key) {
    if (this.values.has(key)) {
      let value = this.values.get(key)
      return this.touchKeyInLRU(key), value
    }
  }
  keys() {
    return this.lruKeys.slice()
  }
  getValues() {
    return this.values.values()
  }
  put(key, value) {
    let evicted
    if (!this.values.has(key) && this.lruKeys.length === this.size) {
      let evictedKey = this.lruKeys.shift(),
        evictedValue = this.deleteKey(evictedKey)
      evicted = [evictedKey, evictedValue]
    }
    return this.values.set(key, value), this.touchKeyInLRU(key), evicted
  }
}
var DisposableLRUCache = class {
  constructor(cacheSize) {
    this.actual = new LRUCache(cacheSize)
  }
  dispose() {
    this.clear()
  }
  clear() {
    let values = this.actual.getValues()
    for (let value of values) value.dispose()
    this.actual.clear()
  }
  deleteKey(key) {
    let value = this.actual.deleteKey(key)
    value && value.dispose()
  }
  get(key) {
    return this.actual.get(key)
  }
  keys() {
    return this.actual.keys()
  }
  getValues() {
    return this.actual.getValues()
  }
  put(key, value) {
    let evicted = this.actual.put(key, value)
    evicted && evicted[1].dispose()
  }
}
var TreeSitterOffsetRange = {
  doesContain: (range, target) => range.startIndex <= target.startIndex && target.endIndex <= range.endIndex,
  ofSyntaxNode: node => ({ startIndex: node.startIndex, endIndex: node.endIndex }),
  compare: (range1, range2) => range1.startIndex - range2.startIndex || range2.endIndex - range1.endIndex,
  doIntersect: (range1, range2) => {
    let maxStart = Math.max(range1.startIndex, range2.startIndex),
      minEnd = Math.min(range1.endIndex, range2.endIndex)
    return maxStart < minEnd
  },
  len: range => range.endIndex - range.startIndex,
  intersectionSize: (range1, range2) => {
    let maxStart = Math.max(range1.startIndex, range2.startIndex),
      minEnd = Math.min(range1.endIndex, range2.endIndex)
    return Math.max(minEnd - maxStart, 0)
  },
  isTreeSitterOffsetRange: range => typeof range.startIndex == 'number' && typeof range.endIndex == 'number',
  toTreeSitterOffsetRange: (range, converter) => {
    return { startIndex: converter.offsetAt(range.start), endIndex: converter.offsetAt(range.end) }
  },
},
PositionComparator = {
  isEqual: (pos1, pos2) => pos1.row === pos2.row && pos1.column === pos2.column,
  isBefore: (pos1, pos2) => pos1.row < pos2.row || (pos1.row === pos2.row && pos1.column < pos2.column),
  isAfter: (pos1, pos2) => PositionComparator.isBefore(pos2, pos1),
  isBeforeOrEqual: (pos1, pos2) => {
    let isBefore = PositionComparator.isBefore(pos1, pos2),
      isEqual = PositionComparator.isEqual(pos1, pos2)
    return !!(isBefore || isEqual)
  },
  equals: (pos1, pos2) => pos1.column === pos2.column && pos1.row === pos2.row,
  isAfterOrEqual: (pos1, pos2) => PositionComparator.isBeforeOrEqual(pos2, pos1),
  ofPoint: point => ({ row: point.row, column: point.column }),
},
RangeComparator = {
  doesContain: (range, target) =>
    PositionComparator.isBeforeOrEqual(range.startPosition, target.startPosition) && PositionComparator.isAfterOrEqual(range.endPosition, target.endPosition),
  equals: (range1, range2) => PositionComparator.equals(range1.startPosition, range2.startPosition) && PositionComparator.equals(range1.endPosition, range2.endPosition),
  ofSyntaxNode: node => ({ startPosition: node.startPosition, endPosition: node.endPosition }),
},
SyntaxNodeRange = { ofSyntaxNode: node => ({ type: node.type, startIndex: node.startIndex, endIndex: node.endIndex }) },
SyntaxNodeDetails = {
  ofSyntaxNode: node => ({ range: RangeComparator.ofSyntaxNode(node), startIndex: node.startIndex, text: node.text, endIndex: node.endIndex }),
}
var SyntaxTree = class {
  constructor(nodes, root) {
    this.syntaxTreeRoot = root
    this.roots = []
    this.formTree(nodes)
  }
  formTree(nodes) {
    nodes.sort((node1, node2) => node1.mainBlock.startIndex - node2.mainBlock.startIndex || node1.mainBlock.endIndex - node2.mainBlock.endIndex)
    let stack = [],
      peek = () => stack[stack.length - 1],
      isSameBlock = (node1, node2) => node1.mainBlock.startIndex === node2.mainBlock.startIndex && node1.mainBlock.endIndex === node2.mainBlock.endIndex
    for (let node of nodes) {
      let tree = { info: node, children: [] },
        top = peek()
      if (!top) {
        this.roots.push(tree), stack.push(tree)
        continue
      }
      if (!isSameBlock(top.info, node)) {
        for (; top && !TreeSitterOffsetRange.doesContain(top.info.mainBlock, node.mainBlock); ) stack.pop(), (top = peek())
        top ? top.children.push(tree) : this.roots.push(tree), stack.push(tree)
      }
    }
  }
}
var UnrecognizedLanguageError = class extends Error {
  constructor(language) {
    super(`Unrecognized language: ${language}`)
  }
}
var languageMap = {
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
function isLanguageSupported(language) {
  return language in languageMap
}
function getLanguage(language) {
  if (isLanguageSupported(language)) return languageMap[language]
  throw new UnrecognizedLanguageError(language)
}
function mapToEntries(array, value) {
  return Object.fromEntries(array.map(item => [item, value]))
}
var languageQueryMap = {
    ...mapToEntries(
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
  classQueryMap = {
    ...mapToEntries(['javascript', 'typescript', 'tsx'], [['(class_declaration) @class_declaration']]),
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
  typeQueryMap = {
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
  typeIdentifierQueryMap = {
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
  newExpressionQueryMap = {
    ...mapToEntries(
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
  functionQueryMap = {
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
    ...mapToEntries(
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
  docCommentQueryMap = {
    ...mapToEntries(
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
  nodeTypeMap = {
    ...mapToEntries(
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
  languageElementMap = {
    typescript: [[generateScopeFor('typescript')]],
    tsx: [[generateScopeFor('tsx')]],
    javascript: [[generateScopeFor('javascript')]],
    java: [[generateScopeFor('java')]],
    cpp: [[generateScopeFor('cpp')]],
    csharp: [[generateScopeFor('csharp')]],
    python: [[generateScopeFor('python')]],
    go: [[generateScopeFor('go')]],
    ruby: [[generateScopeFor('ruby')]],
    rust: [[generateScopeFor('rust')]],
  },
  controlStructureMap = {
    ...mapToEntries(
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
  statementElementMap = {
    ...mapToEntries(['typescript', 'tsx'], ['lexical_declaration', 'expression_statement', 'public_field_definition']),
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
  declarationMap = {
    ...mapToEntries(
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
  languageTokenMap = {
    typescript: [[generateTokenFor('typescript')]],
    tsx: [[generateTokenFor('tsx')]],
    javascript: [[generateTokenFor('javascript')]],
    java: [[generateTokenFor('java')]],
    cpp: [[generateTokenFor('cpp')]],
    csharp: [[generateTokenFor('csharp')]],
    python: [[generateTokenFor('python')]],
    go: [[generateTokenFor('go')]],
    rust: [[generateTokenFor('rust')]],
    ruby: [[generateTokenFor('ruby')]],
  }
function generateScopeFor(language) {
  return nodeTypeMap[getLanguage(language)].map(nodeType => `(${nodeType}) @scope`).join(`
`)
}
function generateTokenFor(language) {
  return `[
		${declarationMap[getLanguage(language)].map(declaration => `(${declaration})`).join(`
`)}
	] @definition`
}
// Checks if a given type is a node type or control structure for a given language
function isNodeTypeOrControlStructure(language, type) {
  return nodeTypeMap[getLanguage(language)].includes(type) || controlStructureMap[getLanguage(language)].includes(type);
}
// Checks if a given type is a statement element for a given language
function isStatementElement(language, type) {
  return statementElementMap[getLanguage(language)].includes(type);
}
class LanguageLoader {
  constructor() {
      this.loadedLanguagesCache = new Map();
  }

  loadLanguage(language) {
      if (!this.loadedLanguagesCache.has(language)) {
          this.loadedLanguagesCache.set(language, this._loadLanguageFromFile(language));
      }
      return this.loadedLanguagesCache.get(language);
  }

  _loadLanguageFromFile(language) {
      let wasmFileName = `tree-sitter-${language === 'csharp' ? 'c-sharp' : language}.wasm`,
          wasmFilePath = ob.basename(__dirname) === 'dist' ? ob.resolve(__dirname, wasmFileName) : ob.resolve(__dirname, '../../../dist', wasmFileName);
      return QI.default.Language.load(wasmFilePath);
  }
}
function wrapTree(tree) {
  return { tree: tree, dispose: () => tree.delete() };
}
// Class for parsing and caching parse trees for different languages
var Parser = class {
  static {
      this.CACHE_SIZE_PER_LANGUAGE = 5;
  }
  constructor() {
      this.caches = new Map();
      this.languageLoader = new LanguageLoader();
      this._parser = null;
  }
  get parser() {
      return this._parser || (this._parser = new QI.default()), this._parser;
  }
  async parse(language, code) {
      await QI.default.init();
      let cache = this.getParseTreeCache(language),
          cachedTree = cache.get(code);
      if (cachedTree) return cachedTree.tree;
      let loadedLanguage = await this.languageLoader.loadLanguage(language);
      this.parser.setLanguage(loadedLanguage);
      let parseTree = this.parser.parse(code);
      cache.put(code, wrapTree(parseTree));
      return parseTree;
  }
  delete() {
      if (this._parser) {
          this.parser.delete();
          this._parser = null;
      }
      for (let cache of this.caches.values()) cache.dispose();
  }
  getParseTreeCache(language) {
      let cache = this.caches.get(language);
      if (!cache) {
          cache = new DisposableLRUCache(Parser.CACHE_SIZE_PER_LANGUAGE);
          this.caches.set(language, cache);
      }
      return cache;
  }
};
var parserInstance = new Parser();

function cleanUp() {
    parserInstance.delete();
}

function parseCode(language, code) {
    return parserInstance.parse(getLanguage(language), code);
}

function getQueryMatches(queries, parseTree) {
  let matches = [];
  for (let query of queries) {
      if (!query[1]) {
          let language = parseTree.tree.getLanguage();
          query[1] = language.query(query[0]);
      }
      matches.push(...query[1].matches(parseTree));
  }
  return matches;
}
// The following functions get query matches for different types of language elements
function getElementMatches(language, parseTree) {
  let queries = languageElementMap[getLanguage(language)];
  return getQueryMatches(queries, parseTree);
}

function getFunctionMatches(language, parseTree) {
    let queries = functionQueryMap[getLanguage(language)];
    return getQueryMatches(queries, parseTree);
}

function getLanguageMatches(language, parseTree) {
  let queries = languageQueryMap[getLanguage(language)];
  return queries ? getQueryMatches(queries, parseTree) : [];
}

function getClassMatches(language, parseTree) {
  let queries = classQueryMap[getLanguage(language)];
  return queries ? getQueryMatches(queries, parseTree) : [];
}

function getTypeMatches(language, parseTree) {
    let queries = typeQueryMap[getLanguage(language)];
    return queries ? getQueryMatches(queries, parseTree) : [];
}

function getTypeIdentifierMatches(language, parseTree) {
  let queries = typeIdentifierQueryMap[getLanguage(language)];
  return queries ? getQueryMatches(queries, parseTree) : [];
}

function getNewExpressionMatches(language, parseTree) {
    let queries = newExpressionQueryMap[getLanguage(language)];
    return queries ? getQueryMatches(queries, parseTree) : [];
}

function getTokenMatches(language, parseTree) {
  let queries = languageTokenMap[getLanguage(language)];
  return getQueryMatches(queries, parseTree);
}

async function getCallExpressions(language, code, range) {
  let parseTree = await parseCode(language, code)
  return getLanguageMatches(language, parseTree.rootNode).reduce((matches, capture) => {
    let callExpressionNode = capture.captures.find(c => c.name === 'call_expression').node
    if (TreeSitterOffsetRange.doIntersect(range, callExpressionNode)) {
      let identifierNode, identifierText
      if (language === 'ruby') {
        identifierNode = capture.captures.find(p => p.name === 'symbol')?.node
        identifierText = identifierNode?.text?.slice(1)
      }
      identifierNode ??= capture.captures.find(p => p.name === 'identifier')?.node
      identifierText ??= identifierNode?.text
      matches.push({
        identifier: identifierText ?? '',
        text: callExpressionNode.text,
        startIndex: (identifierNode ?? callExpressionNode).startIndex,
        endIndex: (identifierNode ?? callExpressionNode).endIndex
      })
    }
    return matches
  }, [])
}

async function getFunctionDefinitions(language, code) {
  let parseTree = await parseCode(language, code)
  return getFunctionMatches(language, parseTree.rootNode).map(match => {
    let functionNode = match.captures.find(capture => capture.name === 'function').node
    return {
      identifier: match.captures.find(capture => capture.name === 'identifier')?.node.text ?? '',
      text: functionNode.text,
      startIndex: functionNode.startIndex,
      endIndex: functionNode.endIndex,
    }
  })
}

async function getClassDeclarations(language, code) {
  let parseTree = await parseCode(language, code)
  return getClassMatches(language, parseTree.rootNode).map(match => {
    let classDeclarationNode = match.captures.find(capture => capture.name === 'class_declaration').node
    return {
      identifier:
        classDeclarationNode?.children.find(child => child.type === 'type_identifier' || child.type === 'identifier' || child.type === 'constant')?.text ??
        '',
      text: classDeclarationNode.text,
      startIndex: classDeclarationNode.startIndex,
      endIndex: classDeclarationNode.endIndex,
    }
  })
}

async function getTypeDeclarations(language, code) {
  let parseTree = await parseCode(language, code)
  return getTypeMatches(language, parseTree.rootNode).map(match => {
    let typeDeclarationNode = match.captures.find(capture => capture.name === 'type_declaration').node,
      typeIdentifierText = match.captures.find(capture => capture.name === 'type_identifier')?.node.text
    typeIdentifierText ||= typeDeclarationNode?.children.find(child => child.type === 'type_identifier')?.text
    return {
      identifier: typeIdentifierText ?? '',
      text: typeDeclarationNode.text,
      startIndex: typeDeclarationNode.startIndex,
      endIndex: typeDeclarationNode.endIndex
    }
  })
}

async function getTypeReferences(language, code, range) {
  let parseTree = await parseCode(language, code)
  return getTypeIdentifierMatches(language, parseTree.rootNode).reduce((matches, capture) => {
    let typeIdentifierNode = capture.captures.find(c => c.name === 'type_identifier').node
    if (TreeSitterOffsetRange.doIntersect(range, typeIdentifierNode)) {
      matches.push({
        identifier: typeIdentifierNode.text,
        text: typeIdentifierNode.text,
        startIndex: typeIdentifierNode.startIndex,
        endIndex: typeIdentifierNode.endIndex
      })
    }
    return matches
  }, [])
}

async function getNewExpressions(code, language, range) {
  let parsedCode = await parseCode(code, language)
  return getNewExpressionMatches(code, parsedCode.rootNode).reduce((expressions, match) => {
    let newExpressionNode = match.captures.find(capture => capture.name === 'new_expression').node
    if (TreeSitterOffsetRange.doIntersect(range, newExpressionNode)) {
      expressions.push({
        identifier: newExpressionNode.text,
        text: newExpressionNode.text,
        startIndex: newExpressionNode.startIndex,
        endIndex: newExpressionNode.endIndex
      })
    }
    return expressions
  }, [])
}

async function getSemanticChunkTree(code, language) {
  let parsedCode = await parseCode(code, language),
    tokenMatches = getTokenMatches(code, parsedCode.rootNode)
  return buildSyntaxTree(code, tokenMatches, parsedCode.rootNode)
}

async function getFunctionPositions(language, code) {
  let parseTree = await parseCode(language, code)
  return getFunctionMatches(language, parseTree.rootNode).map(match => {
    let functionNode = match.captures.find(capture => capture.name === 'function').node
    return { startIndex: functionNode.startIndex, endIndex: functionNode.endIndex }
  })
}

async function getFunctionBodies(language, code) {
  let parseTree = await parseCode(language, code)
  return getFunctionMatches(language, parseTree.rootNode).map(match => {
    let bodyNode = match.captures.find(capture => capture.name === 'body').node
    return { startIndex: bodyNode.startIndex, endIndex: bodyNode.endIndex }
  })
}

async function getCoarseParentScope(language, code, range) {
  let parseTree = await parseCode(language, code),
    elementMatches = getElementMatches(language, parseTree.rootNode),
    parentNode
  for (let match of elementMatches) {
    let node = match.captures[0].node,
      nodeRange = RangeComparator.ofSyntaxNode(node)
    if (RangeComparator.doesContain(nodeRange, range)) {
      parentNode = node
    }
    if (PositionComparator.isBefore(range.endPosition, nodeRange.startPosition)) break
  }
  if (parentNode) return RangeComparator.ofSyntaxNode(parentNode)
  throw new Error('No parent node found')
}

async function getFixSelectionOfInterest(language, code, range, threshold) {
  let rootNode = (await parseCode(language, code)).rootNode.descendantForPosition(range.startPosition, range.endPosition),
    initialRange = { startPosition: rootNode.startPosition, endPosition: rootNode.endPosition },
    adjustedRange = adjustRangeBasedOnThreshold(language, rootNode, threshold, range, true)
  return RangeComparator.equals(initialRange, adjustedRange) ? getAdjustedParentRange(language, rootNode) : adjustedRange
}

function getAdjustedParentRange(language, node) {
  let parentNode = node.parent,
    nodeRange = { startPosition: node.startPosition, endPosition: node.endPosition }
  if (isNodeTypeOrControlStructure(language, node) || !parentNode) return nodeRange
  let { filteredRanges: ranges, indexOfInterest: index } = getFilteredRangesAndIndex(language, parentNode.children, nodeRange, false)
  if (index - 1 >= 0 && index + 1 <= ranges.length - 1) {
    let previousRange = ranges[index - 1],
      nextRange = ranges[index + 1]
    return { startPosition: previousRange.startPosition, endPosition: nextRange.endPosition }
  }
  return getAdjustedParentRange(language, parentNode)
}
function adjustRangeBasedOnThreshold(language, node, threshold, range, isInitial) {
  let children = node.children
  if (node.endPosition.row - node.startPosition.row + 1 <= threshold) {
    let adjustedRange = isNodeTypeOrControlStructure(language, node) ? { startPosition: node.startPosition, endPosition: node.endPosition } : adjustRangeBasedOnChildren(language, children, threshold, range, isInitial),
      parentNode = node.parent
    return parentNode ? adjustRangeBasedOnThreshold(language, parentNode, threshold, adjustedRange, false) : adjustedRange
  }
  return adjustRangeBasedOnChildren(language, children, threshold, range, isInitial)
}

function getRowCount(rangeStart, rangeEnd) {
  return rangeEnd.endPosition.row - rangeStart.startPosition.row + 1
}

function adjustRangeBasedOnChildren(language, children, threshold, range, isInitial) {
  if (children.length === 0) return range
  let { filteredRanges: ranges, indexOfInterest: index } = getFilteredRangesAndIndex(language, children, range, isInitial),
    start = 0,
    end = ranges.length - 1,
    startRange = ranges[start],
    endRange = ranges[end]
  for (; getRowCount(startRange, endRange) > threshold && start !== end; ) index - start < end - index ? (end--, (endRange = ranges[end])) : (start++, (startRange = ranges[start]))
  return getRowCount(startRange, endRange) <= threshold ? { startPosition: startRange.startPosition, endPosition: endRange.endPosition } : range
}

function getFilteredRangesAndIndex(language, children, range, isInitial) {
  let filteredRanges, index
  if (
    (isInitial
      ? ((filteredRanges = children.filter(child => isNodeTypeOrControlStructure(language, child) || isStatementElement(language, child))),
        (index = binarySearch(filteredRanges, range, (child, range) => PositionComparator.isBefore(child.startPosition, range.startPosition))),
        filteredRanges.splice(index, 0, range))
      : ((filteredRanges = children.filter(child => RangeComparator.doesContain(child, range) || isNodeTypeOrControlStructure(language, child) || isStatementElement(language, child))),
        (index = filteredRanges.findIndex(child => RangeComparator.doesContain(child, range)))),
        index === -1)
  )
    throw new Error('Valid index not found')
  return { filteredRanges: filteredRanges, indexOfInterest: index }
}

function getNodeMatchingSelection(tree, range, language) {
  let nodes = [tree.rootNode],
    intersections = []
  for (;;) {
    let sortedIntersections = nodes
      .map(node => [node, TreeSitterOffsetRange.intersectionSize(node, range)])
      .filter(([node, intersectionSize]) => intersectionSize > 0)
      .sort(([node1, size1], [node2, size2]) => size2 - size1)
    if (sortedIntersections.length === 0) return intersections.length === 0 ? undefined : rK(intersections, ([node1, size1], [node2, size2]) => size1 - size2)[0]
    {
      let intersectionRatios = sortedIntersections.map(([node, intersectionSize]) => {
        let nodeLength = TreeSitterOffsetRange.len(node),
          difference = Math.abs(TreeSitterOffsetRange.len(range) - intersectionSize),
          ratio = (intersectionSize - difference) / nodeLength
        return [node, ratio]
      })
      intersections.push(...intersectionRatios.filter(([node, ratio]) => isNodeDocumentable(node, language))), (nodes = []), nodes.push(...intersectionRatios.flatMap(([node, ratio]) => node.children))
    }
  }
}

async function getDocumentableNodeIfOnIdentifier(language, code, range) {
  if (!isLanguageSupported(language)) return
  let node = (await parseCode(language, code)).rootNode.descendantForIndex(range.startIndex, range.endIndex)
  if (node.type.match(/identifier/) && (node.parent === null || isNodeDocumentable(node.parent, language))) {
    let parentNode = node.parent,
      parentRange = parentNode === null ? undefined : { startIndex: parentNode.startIndex, endIndex: parentNode.endIndex }
    return { identifier: node.text, nodeRange: parentRange }
  }
}

async function getNodeToDocument(language, code, range) {
  if (!isLanguageSupported(language)) return
  let tree = await parseCode(language, code),
    matchingNode = range.startIndex === range.endIndex ? undefined : getNodeMatchingSelection(tree, range, language)
  if (matchingNode) return { nodeIdentifier: getNodeIdentifier(matchingNode, language), nodeToDocument: SyntaxNodeRange.ofSyntaxNode(matchingNode), nodeSelectionBy: 'matchingSelection' }
  let node = tree.rootNode.descendantForIndex(range.startIndex, range.endIndex),
    expansionCount = 0
  for (; !isNodeDocumentable(node, language) && node.parent !== null; ) (node = node.parent), ++expansionCount
  return { nodeIdentifier: getNodeIdentifier(node, language), nodeToDocument: SyntaxNodeRange.ofSyntaxNode(node), nodeSelectionBy: 'expanding' }
}

function getNodeIdentifier(node, language) {
  switch (language) {
    case 'python':
    case 'csharp':
      return node.children.find(child => child.type.match(/identifier/))?.text
    case 'golang': {
      let identifierNode = node.children.find(child => child.type.match(/identifier/))
      return identifierNode
        ? identifierNode.text
        : node.children.find(child => child.type.match(/spec/))?.children.find(child => child.type.match(/identifier/))?.text
    }
    case 'javascript':
    case 'javascriptreact':
    case 'typescript':
    case 'typescriptreact':
    case 'cpp':
    case 'java': {
      let identifierNode = node.children.find(child => child.type.match(/identifier/))
      return identifierNode
        ? identifierNode.text
        : node.children.find(child => child.type.match(/declarator/))?.children.find(child => child.type.match(/identifier/))?.text
    }
    case 'ruby':
      return node.children.find(child => child.type.match(/constant|identifier/))?.text
    default:
      return node.children.find(child => child.type.match(/identifier/))?.text
  }
}

function isNodeDocumentable(node, language) {
  switch (language) {
    case 'typescript':
    case 'typescriptreact':
    case 'javascript':
    case 'javascriptreact':
      return node.type.match(/definition|declaration|declarator|export_statement/)
    case 'golang':
      return node.type.match(/definition|declaration|declarator|var_spec/)
    case 'cpp':
      return node.type.match(/definition|declaration|declarator|class_specifier/)
    case 'ruby':
      return node.type.match(/module|class|method|assignment/)
    default:
      return node.type.match(/definition|declaration|declarator/)
  }
}

async function extractDoc(language, code) {
  if (!new Set(['javascript', 'typescript', 'java', 'cpp', 'csharp', 'go', 'ruby']).has(language) || !isLanguageSupported(language)) return
  let parsedCode = await parseCode(language, code),
    docCommentQuery = docCommentQueryMap[getLanguage(language)],
    docComments = getQueryMatches(docCommentQuery, parsedCode.rootNode).flatMap(match => match.captures.filter(capture => capture.name === 'docComment')),
    filteredComments = filterComments(docComments)
  if (
    (filteredComments.length > 1 &&
      (filteredComments = filteredComments.filter(
        comment =>
          comment.includes(`
`) || !comment.match(/(code implementation|implementation details)/i)
      )),
    filteredComments.length === 1)
  )
    return filteredComments[0]
}

function filterComments(comments) {
  let filtered = []
  for (let i = 0; i < comments.length; ++i) {
    let commentLines = [comments[i].node.text]
    for (; i + 1 < comments.length && comments[i].node.endPosition.row + 1 === comments[i + 1].node.startPosition.row; )
      ++i, commentLines.push(comments[i].node.text)
    filtered.push(
      commentLines.join(`
`)
    )
  }
  return filtered
}

function buildSyntaxTree(language, matches, rootNode) {
  let parsedLanguage = getLanguage(language),
    syntaxDetails
  switch (parsedLanguage) {
    case 'python':
      syntaxDetails = processPythonMatches(matches)
      break
    case 'ruby':
      syntaxDetails = processRubyMatches(matches)
      break
    default: {
      syntaxDetails = processOtherMatches(matches, parsedLanguage)
      break
    }
  }
  return new SyntaxTree(syntaxDetails, SyntaxNodeDetails.ofSyntaxNode(rootNode))
}

function processOtherMatches(matches, language) {
  let syntaxMap = new Map()
  return (
    matches.forEach(match => {
      let definitionNode = match.captures.find(capture => capture.name === 'definition')?.node,
        bodyNode = definitionNode?.childForFieldName('body')
      if (definitionNode && bodyNode) {
        let comments
        switch (language) {
          case 'typescript':
          case 'javascript':
            comments = processJsTsComments(definitionNode)
            break
          case 'java':
          case 'rust':
            comments = processJavaRustComments(definitionNode)
            break
          default: {
            comments = processDefaultComments(definitionNode)
            break
          }
        }
        syntaxMap.get(definitionNode.id) ||
          syntaxMap.set(definitionNode.id, {
            mainBlock: SyntaxNodeDetails.ofSyntaxNode(definitionNode),
            detailBlocks: { comments: comments.map(c => SyntaxNodeDetails.ofSyntaxNode(c)), body: SyntaxNodeDetails.ofSyntaxNode(bodyNode) },
          })
      }
    }),
    Array.from(syntaxMap.values())
  )
}

function findNonParameterNode(nodes) {
  if (!(nodes.length < 2))
    for (let i = 1; i < nodes.length; i++) {
      let node = nodes[i]
      if (!node.type.includes('parameters')) return node
    }
}

function processRubyMatches(matches) {
  let syntaxMap = new Map()
  return (
    matches.forEach(match => {
      let definitionNode = match.captures.find(capture => capture.name === 'definition')?.node
      if (definitionNode) {
        let namedChildren = definitionNode.namedChildren,
          nonParameterNode = findNonParameterNode(namedChildren)
        if (nonParameterNode) {
          let lastChild = namedChildren[namedChildren.length - 1],
            bodyText = definitionNode.text.substring(nonParameterNode.startIndex - definitionNode.startIndex, lastChild.endIndex - definitionNode.startIndex),
            comments = processDefaultComments(definitionNode)
          syntaxMap.get(definitionNode.id) ||
            syntaxMap.set(definitionNode.id, {
              mainBlock: SyntaxNodeDetails.ofSyntaxNode(definitionNode),
              detailBlocks: {
                comments: comments.map(comment => SyntaxNodeDetails.ofSyntaxNode(comment)),
                body: {
                  range: {
                    startPosition: { row: nonParameterNode.startPosition.row, column: nonParameterNode.startPosition.column },
                    endPosition: { row: lastChild.endPosition.row, column: lastChild.endPosition.column },
                  },
                  startIndex: nonParameterNode.startIndex,
                  text: bodyText,
                  endIndex: lastChild.endIndex,
                },
              },
            })
        }
      }
    }),
    Array.from(syntaxMap.values())
  )
}
function processPythonMatches(matches) {
  let syntaxMap = new Map()
  return (
    matches.forEach(match => {
      let definitionNode = match.captures.find(capture => capture.name === 'definition')?.node,
        bodyNode = definitionNode?.childForFieldName('body')
      if (definitionNode && bodyNode) {
        let docstringNode = getDocstringNode(bodyNode),
          decoratorNode = getDecoratorNode(definitionNode)
        syntaxMap.set(definitionNode.id, {
          mainBlock: SyntaxNodeDetails.ofSyntaxNode(definitionNode),
          detailBlocks: {
            docstring: docstringNode ? SyntaxNodeDetails.ofSyntaxNode(docstringNode) : void 0,
            decorator: decoratorNode ? SyntaxNodeDetails.ofSyntaxNode(decoratorNode) : void 0,
            body: SyntaxNodeDetails.ofSyntaxNode(bodyNode),
          },
        })
        return
      }
    }),
    Array.from(syntaxMap.values())
  )
}

function getComments(node, commentTypes = ['comment']) {
  let comments = [],
    previousSibling = node.previousNamedSibling
  for (; previousSibling && commentTypes.some(type => type === previousSibling?.type); ) {
    comments.push(previousSibling),
    (previousSibling = previousSibling.previousNamedSibling)
  }
  return comments.reverse()
}

function processJavaRustComments(node) {
  return getComments(node, ['block_comment', 'line_comment'])
}

function processJavaRustComments(t) {
  return getComments(t, ['block_comment', 'line_comment'])
}

function getDecoratorNode(node) {
  let previousSibling = node.previousNamedSibling
  return previousSibling?.type === 'decorator' ? previousSibling : void 0
}

function getDocstringNode(node) {
  let firstChild = node.firstChild
  if (!firstChild || firstChild.type !== 'expression_statement') return
  let grandChild = firstChild.firstChild
  return grandChild?.type === 'string' ? grandChild : void 0
}

var workerPath = path.join(__dirname, 'worker2.js'),
worker = null,
treeSitterUtils = TreeSitterUtils

function initializeWorker(isWorkerRequired, workerOptions) {
  if (isWorkerRequired) {
    worker = new WorkerProxy(workerPath, workerOptions);
    treeSitterUtils = worker.proxy;
  }
}

function terminateWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
    treeSitterUtils = TreeSitterUtils;
    cleanUp();
  }
}

async function getFunctionPositions(code, language) {
  return treeSitterUtils._getFunctionPositions(code, language);
}

async function getFunctionBodies(code, language) {
  return treeSitterUtils._getFunctionBodies(code, language);
}

async function getCoarseParentScope(code, language, range) {
  return treeSitterUtils._getCoarseParentScope(code, language, range);
}

async function getFixSelectionOfInterest(code, language, range, threshold) {
  return treeSitterUtils._getFixSelectionOfInterest(code, language, range, threshold);
}

async function getCallExpressions(code, language, range) {
  return treeSitterUtils._getCallExpressions(code, language, range);
}

async function getFunctionDefinitions(code, language) {
  return treeSitterUtils._getFunctionDefinitions(code, language);
}

async function getNewExpressions(code, language, range) {
  return treeSitterUtils._getNewExpressions(code, language, range);
}

async function getClassDeclarations(code, language) {
  return treeSitterUtils._getClassDeclarations(code, language);
}

async function getTypeDeclarations(code, language) {
  return treeSitterUtils._getTypeDeclarations(code, language);
}

async function getTypeReferences(code, language, range) {
  return treeSitterUtils._getTypeReferences(code, language, range);
}

async function getSemanticChunkTree(code, language) {
  return treeSitterUtils._getSemanticChunkTree(code, language);
}

async function getDocumentableNodeIfOnIdentifier(code, language, position) {
  return treeSitterUtils._getDocumentableNodeIfOnIdentifier(code, language, position);
}

async function getNodeToDocument(code, language, range) {
  return treeSitterUtils._getNodeToDocument(code, language, range);
}

async function extractDoc(code, language) {
  return treeSitterUtils._extractDoc(code, language);
}

var conversationOptions = createServiceIdentifier('ConversationOptions')

var Anchor = class {
  constructor(anchor) {
    this.anchor = anchor;
  }
};

var Session = class {
  constructor(request, sessionId) {
    this.request = request;
    this.sessionId = sessionId;
    this.status = 'in-progress';
    this.contextParts = [];
    this.references = [];
  }
};

var ShortMessageSession = class extends Session {
  constructor(request, getShorterMessage) {
    super(request);
    this._getShorterMessage = getShorterMessage;
  }
  getShorterMessage() {
    return this._getShorterMessage();
  }
};

var Conversation = class {
  constructor(turns = []) {
    this.turns = turns;
  }
  copy() {
    let turnsCopy = JSON.parse(JSON.stringify(this.turns));
    return new Conversation(turnsCopy);
  }
  getLatestTurn() {
    return this.turns[this.turns.length - 1];
  }
  addTurn(turn) {
    this.turns.forEach(turn => (turn.chatMessages = []));
    this.turns.push(turn);
  }
  removeTurn(requestId) {
    let index = this.turns.findIndex(turn => turn.requestId === requestId);
    if (index !== -1) return this.turns.splice(index, 1)[0];
  }
  insertBeforeLatestTurn(turns) {
    this.turns.splice(this.turns.length - 1, 0, ...turns);
  }
  getState() {
    return { turns: this.turns };
  }
};

var BaseSymbolProvider = class {}
function isObjectWithTargetUri(obj) {
  return typeof obj == 'object' && obj !== null && 'targetUri' in obj
}
var WorkspaceClass = class {
  getWorkspaceFolder(uri) {
    return this.getWorkspaceFolders().find(
      folder => folder.scheme === uri.scheme && folder.authority === uri.authority && uri.fsPath.startsWith(folder.fsPath)
    )
  }
}
var extensionContext = class {}
var CommentSymbols = {
  abap: { start: '"', end: '' },
  bat: { start: 'REM', end: '' },
  bibtex: { start: '%', end: '' },
  blade: { start: '#', end: '' },
  c: { start: '//', end: '' },
  clojure: { start: ';', end: '' },
  coffeescript: { start: '//', end: '' },
  cpp: { start: '//', end: '' },
  csharp: { start: '//', end: '' },
  css: { start: '/*', end: '*/' },
  dart: { start: '//', end: '' },
  dockerfile: { start: '#', end: '' },
  elixir: { start: '#', end: '' },
  erb: { start: '<%#', end: '%>' },
  erlang: { start: '%', end: '' },
  fsharp: { start: '//', end: '' },
  go: { start: '//', end: '' },
  groovy: { start: '//', end: '' },
  haml: { start: '-#', end: '' },
  handlebars: { start: '{{!', end: '}}' },
  haskell: { start: '--', end: '' },
  html: { start: '<!--', end: '-->' },
  ini: { start: ';', end: '' },
  java: { start: '//', end: '' },
  javascript: { start: '//', end: '' },
  javascriptreact: { start: '//', end: '' },
  jsonc: { start: '//', end: '' },
  jsx: { start: '//', end: '' },
  julia: { start: '#', end: '' },
  kotlin: { start: '//', end: '' },
  latex: { start: '%', end: '' },
  less: { start: '//', end: '' },
  lua: { start: '--', end: '' },
  makefile: { start: '#', end: '' },
  markdown: { start: '[]: #', end: '' },
  'objective-c': { start: '//', end: '' },
  'objective-cpp': { start: '//', end: '' },
  perl: { start: '#', end: '' },
  php: { start: '//', end: '' },
  powershell: { start: '#', end: '' },
  pug: { start: '//', end: '' },
  python: { start: '#', end: '' },
  ql: { start: '//', end: '' },
  r: { start: '#', end: '' },
  razor: { start: '<!--', end: '-->' },
  ruby: { start: '#', end: '' },
  rust: { start: '//', end: '' },
  sass: { start: '//', end: '' },
  scala: { start: '//', end: '' },
  scss: { start: '//', end: '' },
  shellscript: { start: '#', end: '' },
  slim: { start: '/', end: '' },
  solidity: { start: '//', end: '' },
  sql: { start: '--', end: '' },
  stylus: { start: '//', end: '' },
  svelte: { start: '<!--', end: '-->' },
  swift: { start: '//', end: '' },
  terraform: { start: '#', end: '' },
  tex: { start: '%', end: '' },
  typescript: { start: '//', end: '' },
  typescriptreact: { start: '//', end: '' },
  vb: { start: "'", end: '' },
  verilog: { start: '//', end: '' },
  'vue-html': { start: '<!--', end: '-->' },
  vue: { start: '//', end: '' },
  xml: { start: '<!--', end: '-->' },
  xsl: { start: '<!--', end: '-->' },
  yaml: { start: '#', end: '' },
}

function compareLineDistance(range1, range2) {
  let startLineDistance = Math.abs(range1.start.line - range2.start.line),
    endLineDistance = Math.abs(range1.end.line - range2.end.line)
  return startLineDistance + endLineDistance > 30 ? range1 : range2
}

function adjustRange(document, ranges, range) {
  let startRange = getRangeAtOffset(document, ranges, range.start),
    endRange = getRangeAtOffset(document, ranges, range.end),
    startOffset = document.offsetAt(range.start),
    endOffset = document.offsetAt(range.end)
  if (startRange) {
    startOffset = Math.min(startOffset, startRange.startIndex)
    endOffset = Math.max(endOffset, startRange.endIndex)
  }
  if (endRange) {
    startOffset = Math.min(startOffset, endRange.startIndex)
    endOffset = Math.max(endOffset, endRange.endIndex)
  }
  return new VscodeRange(document.positionAt(startOffset), document.positionAt(endOffset))
}

async function getFunctionReferences(service, document, range, timeout) {
  let treeSitterRange = TreeSitterOffsetRange.toTreeSitterOffsetRange(range, document),
    callExpressions = await computeAsync(service, document, timeout, () => getCallExpressions(document.languageId, document.getText(), treeSitterRange), []),
    definitions = await computeAsync(
      service,
      document,
      timeout * 3,
      async () =>
        await Promise.all(
          callExpressions.map(async expression => {
            let position = document.positionAt(expression.startIndex),
              languageService = service.get(LanguageService)
            try {
              let implementations = await languageService.getImplementations(document.uri, position)
              return implementations.length ? implementations : await languageService.getDefinitions(document.uri, position)
            } catch {
              return []
            }
          })
        ),
      []
    ),
    functionReferences = []
  for (let i = 0; i < definitions.length; i++) {
    let expression = callExpressions[i],
      definition = definitions[i]
    for (let item of definition) {
      let { uri, range } = isObjectWithTargetUri(item) ? { uri: item.targetUri, range: item.targetRange } : item,
        targetDocument = await service.get(WorkspaceClass).openTextDocument(uri),
        functionDefinition = (await getFunctionDefinitions(targetDocument.languageId, targetDocument.getText())).find(def => def.identifier === expression.identifier)
      if (functionDefinition) {
        let targetRange = TreeSitterOffsetRange.toTreeSitterOffsetRange(range, targetDocument)
        functionReferences.push({
          uri,
          range,
          version: targetDocument.version,
          identifier: expression.identifier,
          startIndex: targetRange.startIndex,
          endIndex: targetRange.endIndex,
          text: functionDefinition.text,
        })
      }
    }
  }
  if (functionReferences.length !== 0) return functionReferences
  let text = document.getText(),
    functionDefinitions = await computeAsync(service, document, timeout, () => getFunctionDefinitions(document.languageId, text), []),
    matchedFunctions = []
  for (let definition of functionDefinitions)
    for (let expression of callExpressions)
      if (definition.identifier === expression.identifier)
        matchedFunctions.push(definition)
  return matchedFunctions.sort((a, b) => a.startIndex - b.startIndex)
}

async function getClassReferences(service, document, range, timeout) {
  let treeSitterRange = TreeSitterOffsetRange.toTreeSitterOffsetRange(range, document),
    newExpressions = await computeAsync(service, document, timeout, () => getNewExpressions(document.languageId, document.getText(), treeSitterRange), []),
    definitions = await computeAsync(
      service,
      document,
      timeout * 3,
      async () =>
        await Promise.all(
          newExpressions.map(async expression => {
            try {
              let position = document.positionAt(expression.startIndex),
                languageService = service.get(LanguageService),
                implementations = await languageService.getImplementations(document.uri, position)
              return implementations.length ? implementations : await languageService.getDefinitions(document.uri, position)
            } catch {
              return []
            }
          })
        ),
      []
    ),
    classReferences = []
  for (let i = 0; i < definitions.length; i++) {
    let expression = newExpressions[i],
      definition = definitions[i]
    for (let item of definition) {
      let { uri, range } = isObjectWithTargetUri(item) ? { uri: item.targetUri, range: item.targetRange } : item,
        targetDocument = await service.get(WorkspaceClass).openTextDocument(uri),
        classDeclaration = (await getClassDeclarations(targetDocument.languageId, targetDocument.getText())).find(def => def.identifier === expression.identifier)
      if (classDeclaration) {
        let targetRange = TreeSitterOffsetRange.toTreeSitterOffsetRange(range, targetDocument)
        classReferences.push({
          uri,
          range,
          version: targetDocument.version,
          identifier: expression.identifier,
          startIndex: targetRange.startIndex,
          endIndex: targetRange.endIndex,
          text: classDeclaration.text,
        })
      }
    }
  }
  if (classReferences.length !== 0) return classReferences
  let text = document.getText(),
    classDeclarations = await computeAsync(service, document, timeout, () => getClassDeclarations(document.languageId, text), []),
    matchedClasses = []
  for (let declaration of classDeclarations)
    for (let expression of newExpressions)
      if (declaration.identifier === expression.identifier)
        matchedClasses.push(declaration)
  return matchedClasses.sort((a, b) => a.startIndex - b.startIndex)
}

async function getSortedTypeReferences(service, document, range, timeout) {
  let treeSitterRange = TreeSitterOffsetRange.toTreeSitterOffsetRange(range, document),
    typeReferences = await computeAsync(service, document, timeout, () => getTypeReferences(document.languageId, document.getText(), treeSitterRange), []),
    text = document.getText(),
    typeDeclarations = await computeAsync(service, document, timeout, () => getTypeDeclarations(document.languageId, text), []),
    matchedTypes = []
  for (let declaration of typeDeclarations)
    for (let reference of typeReferences)
      if (declaration.identifier === reference.identifier)
        matchedTypes.push(declaration)
  return matchedTypes.sort((a, b) => a.startIndex - b.startIndex)
}

function getRangeAtOffset(document, ranges, offset) {
  let position = document.offsetAt(offset),
    range = null
  for (let item of ranges)
    if (!(item.endIndex < position)) {
      if (item.startIndex > position) break
      range = item
    }
  return range
}

function promiseWithTimeout(promise, timeout) {
  return timeout === 0
    ? promise.then(result => ({ type: 'success', value: result }))
    : new Promise((resolve, reject) => {
        let timer = setTimeout(() => resolve({ type: 'timeout' }), timeout)
        promise.then(result => {
          clearTimeout(timer), resolve({ type: 'success', value: result })
        }).catch(error => {
          clearTimeout(timer), reject(error)
        })
      })
}

async function getSortedFunctionPositions(service, document, timeout) {
  let functionPositions = await computeAsync(service, document, timeout, () => getFunctionPositions(document.languageId, document.getText()), [])
  return functionPositions.sort((a, b) => a.startIndex - b.startIndex), functionPositions
}

async function getSortedFunctionBodies(service, document, timeout) {
  let functionBodies = await computeAsync(service, document, timeout, () => getFunctionBodies(document.languageId, document.getText()), [])
  return functionBodies.sort((a, b) => a.startIndex - b.startIndex), removeNestedRanges(functionBodies)
}

function removeNestedRanges(ranges) {
  ranges.sort((a, b) => a.startIndex - b.startIndex || b.endIndex - a.endIndex)
  let result = []
  for (let i = 0, length = ranges.length; i < length; ) {
    result.push(ranges[i])
    let j = i + 1
    for (; j < ranges.length && TreeSitterOffsetRange.doesContain(ranges[i], ranges[j]); ) ++j
    i = j
  }
  return result
}

async function computeAsync(service, document, timeout, computation, defaultValue) {
  let logger = service.get(LoggerManager).getLogger('asyncCompute')
  try {
    let result = await promiseWithTimeout(retryIfVersionChanged(document, computation, defaultValue), timeout)
    return result.type === 'success' ? result.value : (logger.info(`Computing async parser based result took longer than ${timeout}ms`), defaultValue)
  } catch (error) {
    return (
      error instanceof UnrecognizedLanguageError ||
        (logger.exception(error, 'Failed to compute async parser based result'),
        service.get(IGHTelemetryService).sendExceptionTelemetry(error, 'Failed to compute async parser based result')),
      defaultValue
    )
  }
}

async function retryIfVersionChanged(document, computation, defaultValue, retryCount = 0) {
  let initialVersion = document.version,
    result = await computation()
  return document.version !== initialVersion ? (retryCount < 3 ? retryIfVersionChanged(document, computation, defaultValue, retryCount + 1) : defaultValue) : result
}

function getCommentSymbol(document) {
  let commentSymbols = CommentSymbols[document.languageId]
  return commentSymbols
    ? commentSymbols.end
      ? { languageId: document.languageId, lineCommentToken: '//' }
      : { languageId: document.languageId, lineCommentToken: commentSymbols.start }
    : { languageId: document.languageId, lineCommentToken: '//' }
}

var FilePathComment = class {
  static forDocument(language, document) {
    return this.forUri(language, document.uri)
  }
  static forUri(language, uri) {
    return `${this.forLanguage(language)}: ${uri.path}`
  }
  static forLanguage(language) {
    return `${language.lineCommentToken} FILEPATH`
  }
  static testLine(language, line) {
    let comment = FilePathComment.forLanguage(language)
    return line.trimStart().startsWith(comment)
  }
}

var BlockComment = class {
  static begin(language, identifier) {
    return typeof identifier > 'u' ? `${language.lineCommentToken} BEGIN:` : `${language.lineCommentToken} BEGIN: ${identifier}`
  }
  static end(language, identifier) {
    return typeof identifier > 'u' ? `${language.lineCommentToken} END:` : `${language.lineCommentToken} END: ${identifier}`
  }
}

function isCodeBlock(text) {
  return /```[\s\S]+\n```/m.test(text)
}

var analysisConfig = { analysisTimeoutMs: 100 }

async function analyzeDocument(service, document, range) {
  let timeout = service.get(extensionContext).extensionMode === VscodeExtensionMode.Test ? 0 : analysisConfig.analysisTimeoutMs,
    startTime = Date.now(),
    functionPositions = await getSortedFunctionPositions(service, document, timeout),
    elapsedTime = Date.now() - startTime,
    remainingTime = timeout === 0 ? 0 : Math.max(10, timeout - elapsedTime),
    functionBodies = await getSortedFunctionBodies(service, document, remainingTime),
    adjustedRange = adjustRange(document, functionPositions, range)
  return { expandedRange: document.validateRange(compareLineDistance(range, adjustedRange)), rangeExpandedToFunction: adjustedRange, functionBodies: functionBodies }
}
var contextInfo
;(context => {
  function isContextInfoAvailable(context) {
    return context && context.expandedRange && context.contextInfo
  }
  context.is = isContextInfoAvailable
})((contextInfo ||= {}))

var CharacterCounter = class {
  constructor(limit) {
    this.charLimit = limit
    this._totalChars = 0
  }
  get totalChars() {
    return this._totalChars
  }
  addLine(line) {
    this._totalChars += line.length + 1
  }
  lineWouldFit(line) {
    return this._totalChars + line.length + 1 < this.charLimit
  }
}
var CodeBlock = class CodeBlock {
  constructor(tracker, document, language, kindOrUniqueStr) {
    this.tracker = tracker
    this.document = document
    this.language = language
    this.kindOrUniqueStr = kindOrUniqueStr
    this.lines = []
    this.firstLineIndex = this.document.lineCount
    this.lastLineIndex = -1
    this.isComplete = false
    this.nonTrimWhitespaceCharCount = 0
    this._startMarker = BlockComment.begin(language, kindOrUniqueStr)
    this._endMarker = BlockComment.end(language, kindOrUniqueStr)
  }
  get startMarker() {
    return this._startMarker
  }
  get endMarker() {
    return this._endMarker
  }
  get lineCount() {
    return this.lines.length
  }
  get isVerySmallOrEmpty() {
    return this.nonTrimWhitespaceCharCount < 10
  }
  get hasContent() {
    return this.lines.length === 0 || this.nonTrimWhitespaceCharCount === 0 ? false : this.lines.length > 0
  }
  clone() {
    let clone = new CodeBlock(this.tracker, this.document, this.language, this.kindOrUniqueStr)
    clone._startMarker = this.startMarker
    clone._endMarker = this.endMarker
    clone.lines.push(...this.lines)
    clone.firstLineIndex = this.firstLineIndex
    clone.lastLineIndex = this.lastLineIndex
    clone.nonTrimWhitespaceCharCount = this.nonTrimWhitespaceCharCount
    return clone
  }
  clear() {
    this.lines.length = 0
    this.firstLineIndex = this.document.lineCount
    this.lastLineIndex = -1
    this.nonTrimWhitespaceCharCount = 0
  }
  generatePrompt(includeMarkers) {
    if (!this.hasContent) return []
    let prompt = []
    prompt.push('```' + this.language.languageId)
    prompt.push(FilePathComment.forDocument(this.language, this.document))
    if (includeMarkers) {
      prompt.push(`${this.startMarker}`)
      prompt.push(...this.lines)
      prompt.push(`${this.endMarker}`)
    }
    prompt.push('```')
    return prompt
  }
  prependLine(lineIndex) {
    let lineText = this.document.lineAt(lineIndex).text
    if (this.tracker.lineWouldFit(lineText)) {
      this.firstLineIndex = Math.min(this.firstLineIndex, lineIndex)
      this.lastLineIndex = Math.max(this.lastLineIndex, lineIndex)
      this.lines.unshift(lineText)
      this.tracker.addLine(lineText)
      this.nonTrimWhitespaceCharCount += lineText.trim().length
      return true
    }
    return false
  }
  appendLine(lineIndex) {
    let lineText = this.document.lineAt(lineIndex).text
    if (this.tracker.lineWouldFit(lineText)) {
      this.firstLineIndex = Math.min(this.firstLineIndex, lineIndex)
      this.lastLineIndex = Math.max(this.lastLineIndex, lineIndex)
      this.lines.push(lineText)
      this.tracker.addLine(lineText)
      this.nonTrimWhitespaceCharCount += lineText.trim().length
      return true
    }
    return false
  }
  trim(range) {
    let lastLineIndex = range ? Math.min(this.lastLineIndex, range.start.line) : this.lastLineIndex
    while (this.firstLineIndex < lastLineIndex && this.lines.length > 0 && this.lines[0].trim().length === 0) {
      this.firstLineIndex++
      this.lines.shift()
    }
    let firstLineIndex = range ? Math.max(this.firstLineIndex, range.end.line) : this.firstLineIndex
    while (firstLineIndex < this.lastLineIndex && this.lines.length > 0 && this.lines[this.lines.length - 1].trim().length === 0) {
      this.lastLineIndex--
      this.lines.pop()
    }
  }
  removeFirstNLines(numLines) {
    if (numLines >= this.lineCount) {
      let linesCopy = this.lines.slice(0),
        nonTrimWhitespaceCharCountCopy = this.nonTrimWhitespaceCharCount
      this.clear()
      return { lines: linesCopy, nonTrimWhitespaceCharCount: nonTrimWhitespaceCharCountCopy }
    }
    let removedLines = this.lines.splice(0, numLines),
      nonTrimWhitespaceCharCount = 0
    for (let line of removedLines) nonTrimWhitespaceCharCount += line.trim().length
    this.firstLineIndex += numLines
    this.nonTrimWhitespaceCharCount -= nonTrimWhitespaceCharCount
    return { lines: removedLines, nonTrimWhitespaceCharCount: nonTrimWhitespaceCharCount }
  }
  removeLastNLines(numLines) {
    if (numLines >= this.lineCount) {
      let linesCopy = this.lines.slice(0),
        nonTrimWhitespaceCharCountCopy = this.nonTrimWhitespaceCharCount
      this.clear()
      return { lines: linesCopy, nonTrimWhitespaceCharCount: nonTrimWhitespaceCharCountCopy }
    }
    let removedLines = this.lines.splice(this.lines.length - numLines, numLines),
      nonTrimWhitespaceCharCount = 0
    for (let line of removedLines) nonTrimWhitespaceCharCount += line.trim().length
    this.lastLineIndex -= numLines
    this.nonTrimWhitespaceCharCount -= nonTrimWhitespaceCharCount
    return { lines: removedLines, nonTrimWhitespaceCharCount: nonTrimWhitespaceCharCount }
  }
  takeFromAbove(codeBlock, numLines) {
    let { lines: removedLines, nonTrimWhitespaceCharCount } = codeBlock.removeLastNLines(numLines)
    this.lines.unshift(...removedLines)
    this.firstLineIndex -= removedLines.length
    this.nonTrimWhitespaceCharCount += nonTrimWhitespaceCharCount
  }
  takeFromBelow(codeBlock, numLines) {
    let { lines: removedLines, nonTrimWhitespaceCharCount } = codeBlock.removeFirstNLines(numLines)
    this.lines.push(...removedLines)
    this.lastLineIndex += removedLines.length
    this.nonTrimWhitespaceCharCount += nonTrimWhitespaceCharCount
  }  mergeFromAbove(codeBlock) {
    if (codeBlock.hasContent) {
      this.lines.unshift(...codeBlock.lines)
      this.firstLineIndex = codeBlock.firstLineIndex
      this.nonTrimWhitespaceCharCount += codeBlock.nonTrimWhitespaceCharCount
      codeBlock.clear()
    }
  }
  mergeFromBelow(codeBlock) {
    if (codeBlock.hasContent) {
      this.lines.push(...codeBlock.lines)
      this.lastLineIndex = codeBlock.lastLineIndex
      this.nonTrimWhitespaceCharCount += codeBlock.nonTrimWhitespaceCharCount
      codeBlock.clear()
    }
  }
  toRange() {
    try {
      let lastLineIndex = this.lastLineIndex === -1 ? this.document.lineCount - 1 : this.lastLineIndex,
        range = new VscodeRange(this.firstLineIndex, 0, lastLineIndex, this.document.lineAt(lastLineIndex).text.length)
      if (this.document.validateRange(range) === range) return range
    } catch {
      return
    }
  }
  toString() {
    return `{${this.firstLineIndex} -> ${this.lastLineIndex}}`
  }
}

var ContextResolverRegistry = new (class {
  constructor() {
    this._contextResolvers = new Map()
  }
  get contextResolvers() {
    return this._contextResolvers.values()
  }
  getContextResolver(type) {
    return this._contextResolvers.get(type)
  }
  register(resolver) {
    return this._contextResolvers.set(resolver.kind, resolver), resolver
  }
})()

var DocumentSelectionResolver = class {
  constructor(nodeToDocumentMapper = void 0) {
    this.nodeToDocumentMapper = nodeToDocumentMapper
    this.kind = 'doc-selection'
  }
  async resolveContext(service, context, options) {
    let documentContext = context.documentContext
    if (!documentContext) return
    let wholeRange = documentContext.wholeRange,
      nodeToDocument = this.nodeToDocumentMapper ?? (await DocumentSelectionResolver.determineNodeToDocument(service, documentContext)),
      docContext = await DocumentSelectionResolver.generateDocContext(context.endpoint, documentContext, nodeToDocument),
      userMessages = []
    {
      let messageParts = []
      messageParts.push('I have the following code in the selection:'),
        messageParts.push(...docContext.range.generatePrompt(false)),
        userMessages.push(
          messageParts.join(`
`)
        )
    }
    let usedContext = [{ uri: documentContext.document.uri, version: documentContext.document.version, ranges: filterTruthyValues([docContext.range.toRange()]) }]
    return { kind: this.kind, userMessages: userMessages, usedContext: usedContext, metadata: { expandedRange: wholeRange, contextInfo: docContext } }
  }
  static async determineNodeToDocument(service, context) {
    let selectionOffsetRange = DocumentSelectionResolver.toTreeSitterOffsetRange(context.selection, context.document),
      startTime = Date.now(),
      nodeToDocument = await getNodeToDocument(context.language.languageId, context.document.getText(), selectionOffsetRange),
      timeSpent = Date.now() - startTime
    if (nodeToDocument) {
      let wholeRangeOffsetRange = DocumentSelectionResolver.toTreeSitterOffsetRange(context.wholeRange, context.document)
      DocumentSelectionResolver.sendNodeToDocumentTelemetry(service, selectionOffsetRange, wholeRangeOffsetRange, nodeToDocument, context.document.languageId, timeSpent)
      let vscodeRange = new VscodeRange(
        context.document.positionAt(nodeToDocument.nodeToDocument.startIndex),
        context.document.positionAt(nodeToDocument.nodeToDocument.endIndex)
      )
      return { identifier: nodeToDocument.nodeIdentifier, range: vscodeRange }
    } else return { range: context.wholeRange }
  }
  static toTreeSitterOffsetRange(range, document) {
    return { startIndex: document.offsetAt(range.start), endIndex: document.offsetAt(range.end) }
  }
  static async generateDocContext(endpoint, context, nodeToDocument) {
    let { range: selectedRange } = nodeToDocument,
      characterCounter = new CharacterCounter((endpoint.modelMaxTokenWindow * 4) / 3),
      selectedCodeBlock = new CodeBlock(characterCounter, context.document, context.language, 'ed8c6549bwf9'),
      aboveCodeBlock = new CodeBlock(new CharacterCounter(0), context.document, context.language, 'abpxx6d04wxr'),
      belowCodeBlock = new CodeBlock(new CharacterCounter(0), context.document, context.language, 'be15d9bcejpp')
    for (
      let line = selectedRange.start.line, endLine = selectedRange.end.line;
      line <= endLine && !((line === endLine && selectedRange.end.character === 0) || !selectedCodeBlock.appendLine(line));
      ++line
    );
    return (
      selectedCodeBlock.trim(context.selection), { language: context.language, above: aboveCodeBlock, range: selectedCodeBlock, below: belowCodeBlock, outlineAbove: '', outlineBelow: '' }
    )
  }
  static sendNodeToDocumentTelemetry(service, selectionOffsetRange, wholeRangeOffsetRange, nodeToDocument, languageId, timeSpent) {
    service.get(IMSTelemetryService).sendTelemetryEvent(
      'getNodeToDocument',
      {
        languageId: languageId,
        typeOfNodeToDocument: nodeToDocument.nodeToDocument.type,
        nodeToDocumentStart: nodeToDocument.nodeToDocument.startIndex.toString(),
        nodeToDocumentEnd: nodeToDocument.nodeToDocument.endIndex.toString(),
        selectionOffsetRangeStart: selectionOffsetRange.startIndex.toString(),
        selectionOffsetRangeEnd: selectionOffsetRange.endIndex.toString(),
        wholeRangeOffsetRangeStart: wholeRangeOffsetRange.startIndex.toString(),
        wholeRangeOffsetRangeEnd: wholeRangeOffsetRange.endIndex.toString(),
      },
      { timeSpentMs: timeSpent }
    )
  }
}



var documentSelectionResolverInstance = ContextResolverRegistry.register(new DocumentSelectionResolver())
var util = require('util')
var BaseFileSystemOperations = class {}
var IgnoreServiceIdentifier = createServiceIdentifier('IIgnoreService')
var FileFinder = class {
  constructor(accessor) {
    this._accessor = accessor
  }
  async findFilesWithDefaultExcludes(includePattern, maxResults, progress) {
    let excludePattern = this._accessor?.safeGet(IgnoreServiceIdentifier)?.asMinimatchPattern({ includeCopilotIgnore: !0, includeGitIgnore: !1 }),
      searchOptions = { include: includePattern, maxResults: maxResults, exclude: excludePattern, useDefaultExcludes: !0 },
      foundFiles = [],
      progressReporter = {
        report(file) {
          foundFiles.push(file.uri)
        },
      }
    await this.findTextInFiles({ pattern: '.', isRegExp: !0 }, searchOptions, progressReporter, progress)
    return maxResults === 1 ? foundFiles[0] : foundFiles
  }
}
var BaseTabManager = class {}
var patternMatcher = handleDefaultExports(patternMatcherModule())
function isPathMatch(file, pattern) {
  return typeof pattern == 'string'
    ? patternMatcher.default.isMatch(file.fsPath, pattern, { dot: true })
    : patternMatcher.default.isMatch(file.fsPath, pattern.pattern, { dot: true })
}
var defaultNamingConvention = {
    location: 'sameFolder',
    prefix: 'test_',
    suffixes: ['.test', '.spec', '_test', 'Test', '_spec', '_test', 'Tests', '.Tests', 'Spec'],
  },
  languageSpecificNamingConvention = {
    csharp: { suffixes: ['Test'], location: 'testFolder' },
    dart: { suffixes: ['_test'], location: 'testFolder' },
    go: { suffixes: ['_test'], location: 'sameFolder' },
    java: { suffixes: ['Test'], location: 'testFolder' },
    javascript: { suffixes: ['.test', '.spec'], location: 'sameFolder' },
    kotlin: { suffixes: ['Test'], location: 'testFolder' },
    php: { suffixes: ['Test'], location: 'testFolder' },
    powershell: { suffixes: ['.Tests'], location: 'testFolder' },
    python: { prefix: 'test_', location: 'testFolder' },
    ruby: { suffixes: ['_test', '_spec'], location: 'testFolder' },
    rust: { suffixes: [''], location: 'testFolder' },
    swift: { suffixes: ['Tests'], location: 'testFolder' },
    typescript: { suffixes: ['.test', '.spec'], location: 'sameFolder' },
  },
  fileExtensionToLanguageMapping = {
    cs: 'csharp',
    dart: 'dart',
    go: 'go',
    java: 'java',
    js: 'javascript',
    kt: 'kotlin',
    php: 'php',
    ps1: 'powershell',
    py: 'python',
    rb: 'ruby',
    rs: 'rust',
    swift: 'swift',
    ts: 'typescript',
  },
  languageSpecificNamingByExtension = (function () {
    let mapping = {}
    for (let [extension, language] of Object.entries(fileExtensionToLanguageMapping))
      mapping[extension] = languageSpecificNamingConvention[language]
    return mapping
  })(),
  TestFileManager = class {
    constructor(search, tabs) {
      this._search = search
      this._tabs = tabs
    }
    _findTabMatchingPattern(pattern) {
      return this._tabs.tabs.find(tab => tab.uri && tab.uri.scheme !== resourceTypes.untitled && isPathMatch(tab.uri, pattern))?.uri
    }
    async findTestFileForSourceFile(sourceFile, token) {
      if (sourceFile.isUntitled) return
      let baseName = getBasename(sourceFile.uri),
        extension = getExtension(sourceFile.uri),
        namingConvention = languageSpecificNamingConvention[sourceFile.languageId] ?? defaultNamingConvention,
        potentialNames = []
      if ((namingConvention.prefix && potentialNames.push(namingConvention.prefix + baseName), namingConvention.suffixes))
        for (let suffix of namingConvention.suffixes ?? []) {
          let potentialName = baseName.replace(`${extension}`, `${suffix}${extension}`)
          potentialNames.push(potentialName)
        }
      let pattern = `**/{${potentialNames.join(',')}}`,
        matchingUri = this._findTabMatchingPattern(pattern)
      return matchingUri || (matchingUri = await this._search.findFilesWithDefaultExcludes(pattern, 1, token)), matchingUri
    }
    async findAnyTestFileForSourceFile(sourceFile, token) {
      let namingConvention = languageSpecificNamingConvention[sourceFile.languageId] ?? defaultNamingConvention,
        potentialPatterns = []
      if ((namingConvention.prefix && potentialPatterns.push(`${namingConvention.prefix}*`), namingConvention.suffixes)) {
        let extension = getExtension(sourceFile.uri)
        for (let suffix of namingConvention.suffixes ?? []) potentialPatterns.push(`*${suffix}${extension}`)
      }
      let pattern = `**/{${potentialPatterns.join(',')}}`,
        matchingUri = this._findTabMatchingPattern(pattern)
      return matchingUri || (matchingUri = await this._search.findFilesWithDefaultExcludes(pattern, 1, token)), matchingUri
    }
    async findSourceFileForTestFile(testFile, token) {
      let namingConvention = languageSpecificNamingConvention[testFile.languageId] ?? defaultNamingConvention,
        baseName = getBasename(testFile.uri),
        potentialPatterns = []
      namingConvention.suffixes && potentialPatterns.splice(0, 0, ...namingConvention.suffixes), namingConvention.prefix && potentialPatterns.splice(0, 0, namingConvention.prefix)
      for (let pattern of potentialPatterns) {
        let potentialName = baseName.replace(pattern, '')
        if (potentialName !== baseName) {
          let searchPattern = `**/${potentialName}`,
            matchingUri = this._findTabMatchingPattern(searchPattern)
          if ((matchingUri || (matchingUri = await this._search.findFilesWithDefaultExcludes(searchPattern, 1, token)), matchingUri)) return matchingUri
        }
      }
    }
  }

function isTestFile(uri) {
  let namingConvention
  Uri.isUri(uri) || ((namingConvention = languageSpecificNamingConvention[uri.languageId]), (uri = uri.uri))
  let baseName = getBasename(uri),
    extension = getExtension(uri)
  namingConvention ??= languageSpecificNamingByExtension[extension.replace('.', '')]
  return namingConvention
    ? !((namingConvention.suffixes && !namingConvention.suffixes.some(suffix => baseName.endsWith(suffix + extension))) || (namingConvention.prefix && !baseName.startsWith(namingConvention.prefix)))
    : !!(defaultNamingConvention.suffixes.some(suffix => baseName.endsWith(suffix + extension)) || baseName.startsWith(defaultNamingConvention.prefix))
}

function generateTestFileName(sourceFile) {
  let namingConvention = languageSpecificNamingConvention[sourceFile.languageId] ?? defaultNamingConvention,
    baseName = getBasename(sourceFile.uri)
  if (namingConvention.prefix) return namingConvention.prefix + baseName
  let extension = getExtension(sourceFile.uri),
    suffix = namingConvention.suffixes && namingConvention.suffixes.length > 0 ? namingConvention.suffixes[0] : '.test'
  return baseName.replace(`${extension}`, `${suffix}${extension}`)
}

var notebookCellScheme = 'vscode-notebook-cell'

function isNotebookCell(uri) {
  return uri.scheme === notebookCellScheme
}
var BaseVSCodeInfoProvider = class {}
var CommandManager = new (class {
  constructor() {
    this.commands = new Set()
  }
  registerCommand(command) {
    this.commands.add(command)
  }
  getCommand(commandId, location) {
    return this.getCommands(location).find(command => command.commandId === commandId)
  }
  getCommands(location) {
    return Array.from(this.commands.values()).filter(command => command.locations.includes(location))
  }
})()

var commandCategories = {
  workspace: ['explain', 'tests', 'fix', 'new', 'newNotebook'],
  vscode: ['search', 'api'],
  terminal: []
}

function getCommandCategory(command) {
  if (Object.keys(commandCategories).includes(command))
    return { category: command }

  for (let [category, commands] of Object.entries(commandCategories))
    if (commands.includes(command))
      return { category: category, specificCommand: command }
}

function getAssistantIntroduction() {
  return `
You are an AI programming assistant.
`.trim()
}
function getAssistantIdentity() {
  return `
When asked for your name, you must respond with "GitHub Copilot".
Follow the user's requirements carefully & to the letter.`.trim()
}
function getAssistantExpertise() {
  return `
Your expertise is strictly limited to software development topics.
Follow Microsoft content policies.
Avoid content that violates copyrights.
For questions not related to software development, simply give a reminder that you are an AI programming assistant.
Keep your answers short and impersonal.`.trim()
}
async function getAssistantCapabilities(commandManager, commandContext, modelInfo) {
  let capabilitiesDescription = Object.entries(commandCategories).reduce((description, [category, commands]) => {
    let categoryDescription = commandManager.getCommand(category, commandContext)?.intent?.description
    description += `
* ${categoryDescription}`
    for (let command of commands) {
      let commandDescription = commandManager.getCommand(command, commandContext)?.intent?.description
      description += `
* ${commandDescription}`
    }
    return description
  }, 'You can answer general programming questions and perform the following tasks:')
  try {
    capabilitiesDescription += `
You use the ${modelInfo.model.toUpperCase()} version of OpenAI's GPT models.`
  } catch {}
  return capabilitiesDescription
}
function getDevelopmentProcess() {
  return `
First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail.
Then output the code in a single code block.
Minimize any other prose.
`.trim()
}
function getFormattingGuidelines() {
  return `
Use Markdown formatting in your answers.
Make sure to include the programming language name at the start of the Markdown code blocks.
Avoid wrapping the whole response in triple backticks.
The user works in an IDE called Visual Studio Code which has a concept for editors with open files, integrated unit test support, an output pane that shows the output of running the code as well as an integrated terminal.
The active document is the source code the user is looking at right now.
You can only give one reply for each conversation turn.
`.trim()
}
async function generateAssistantMessage(t, e, r, n = { includeCodeGenerationRules: !0, includeCapabilities: !1 }) {
  let i = `
${n.roleplay ?? getAssistantIntroduction()}
${getAssistantIdentity()}
${getAssistantExpertise()}
`
  return (
    n.roleplay ||
      (i += `
${(await getAssistantCapabilities(t, e, r)).trim()}
`),
    (i += `
${n.includeCodeGenerationRules ? getDevelopmentProcess() : ''}
${getFormattingGuidelines()}
${getLocaleResponse(t)}
`.trim()),
    i
  )
}
var supportedLocales = ['auto', 'en', 'fr', 'it', 'de', 'es', 'ru', 'zh-CN', 'zh-TW', 'ja', 'ko', 'cs', 'pt-br', 'tr', 'pl']

function getLocaleResponse(t) {
  let locale = t.get(ConfigManager).getConfig(settings.LocaleOverride)
  if (!supportedLocales.find(i => locale === i)) return ''
  let language = locale !== 'auto' ? locale : t.get(BaseVSCodeInfoProvider).language
  return language === 'en' ? '' : `Respond in the following locale: ${language}`
}

function vscpp(type, props, ...children) {
  return { ctor: type, props: props, children: children.flat() }
}
function vscppf() {
  throw new Error('This should not be invoked!')
}
vscppf.isFragment = true
globalThis.vscpp = vscpp
globalThis.vscppf = vscppf

var BaseComponent = class {
  get priority() {
    return this.props.priority ?? 0
  }
  get supportsResizing() {
    return false
  }
  constructor(props, accessor) {
    this.props = props
    this.accessor = accessor
  }
}
var FragmentComponent = class extends BaseComponent {
    render() {
      return vscpp(vscppf, null, this.props.children)
    }
  }

var SystemComponent = class extends FragmentComponent {
  constructor(props, accessor) {
    props.role = 'system'
    super(props, accessor)
  }
}

var UserComponent = class extends FragmentComponent {
  constructor(props, accessor) {
    props.role = 'user'
    super(props, accessor)
  }
}

var ExpertiseComponent = class extends BaseComponent {
  render() {
    return vscpp(vscppf, null, getAssistantExpertise())
  }
}
var Renderer = class {
  constructor(accessor, tokenBudget, endpoint) {
    this._accessor = accessor
    this._tokenBudget = tokenBudget
    this._endpoint = endpoint
    this._meta = new Map()
    this._usedContext = []
  }
  getAllMeta() {
    return this._meta
  }
  getMeta(key) {
    return this._meta.get(key)
  }
  getUsedContext() {
    return this._usedContext
  }
  async render(element, props) {
    let environment = { tokenBudget: this._tokenBudget, zoomLevel: 0, endpoint: this._endpoint },
    rootNode = new Node(),
    renderQueue = [{ kind: 'obj', node: rootNode, minp: 0, maxp: 1e3, ctor: element, props: props, children: void 0 }],
    sortQueue = () => {
      renderQueue.sort((a, b) => b.maxp - a.maxp)
    },
    intrinsicElements = {
        meta: (node, props) => {
          this._addMeta(props.key, props.value)
        },
        br: (node, props) => {
          node.appendLineBreak()
        },
        usedContext: (node, props) => {
          this._addUsedContext(props.value)
        },
      },
      hasIntrinsicElement = element => intrinsicElements.hasOwnProperty(element),
      handleIntrinsicElement = (node, element, props) => {
        if (!hasIntrinsicElement(element)) throw new Error(`Unknown intrinsic element ${element}!`)
        return intrinsicElements[element](node, props)
      }
    for (; renderQueue.length > 0; ) {
      let current = renderQueue.shift()
      if (current.kind === 'obj') {
        Array.isArray(current.children) && ((current.props = current.props ?? {}), (current.props.children = current.children))
        let instance = new current.ctor(current.props, this._accessor)
        current.node.setObj(instance)
        let state = await instance.prepare?.()
        current.node.setState(state)
        let result = instance.render(current.node.getState(), environment)
        if (!result) continue
        if (isFragment(result)) {
          let flattenChildren = children =>
          children.reduce(
                (flat, child) =>
                  typeof child > 'u' || typeof child == 'boolean'
                    ? flat
                    : typeof child == 'string' || typeof child == 'number'
                    ? (flat.push(String(child)), flat)
                    : (isFragment(child) ? flat.push(...flattenChildren(child.children)) : flat.push(child), flat),
                []
              ),
            flatChildren = flattenChildren(result.children)
          for (let child of flatChildren) {
            if (typeof child == 'string') {
              current.node.appendStringChild(child)
              continue
            }
            if (typeof child.ctor == 'string') {
              handleIntrinsicElement(current.node, child.ctor, child.props)
              continue
            }
            if (typeof child.ctor > 'u') throw new Error('Unexpected result from render(), unexpected child!')
            let childNode = current.node.createChild()
            renderQueue.push({ kind: 'obj', node: childNode, minp: 0, maxp: 1e3, ctor: child.ctor, props: child.props, children: child.children })
          }
        } else {
          if (typeof result.ctor == 'string') {
            handleIntrinsicElement(current.node, result.ctor, result.props)
            continue
          }
          if (typeof result.ctor > 'u') throw new Error('Unexpected result from render() invocation!')
          let childNode = current.node.createChild()
          renderQueue.push({ kind: 'obj', node: childNode, minp: 0, maxp: 1e3, ctor: result.ctor, props: result.props, children: result.children })
        }
        sortQueue()
      }
    }
    return rootNode.materialize()
  }
  _addUsedContext(context) {
    this._usedContext.push(...context)
  }
  _addMeta(key, value) {
    if (this._meta.has(key)) throw new Error(`Duplicate meta key ${key}!`)
    this._meta.set(key, value)
  }
}

async function renderWithMetadata(accessor, endpoint, element, props) {
  let renderer = new Renderer(accessor, 8192, endpoint),
    messages = await renderer.render(element, props),
    metadatas = renderer.getAllMetaData(),
    usedContext = renderer.getUsedContext()
  return { messages: messages, metadatas: metadatas, usedContext: usedContext }
}

class Node {
  constructor(parent = null) {
    this.parent = parent;
    this.kind = 0;
    this._obj = null
    this._state = undefined;
    this._children = []
  }
  setObj(object) {
    this._obj = object
  }
  setState(state) {
    this._state = state
  }
  getState() {
    return this._state
  }

  createChild() {
    let child = new Node(this);
    this._children.push(child);
    return child;
  }

  appendStringChild(string) {
    this._children.push(new TextNode(this, string))
  }

  appendLineBreak() {
    this._children.push(new LineBreakNode(this, !0))
  }

  materialize() {
    let result = [];
    this._materialize(result);
    return result;
  }

  _materialize(e) {
    if (this._obj instanceof FragmentComponent) {
      if (!this._obj.props.role) throw new Error('Invalid ChatMessage!')
      let leafs = []
      for (let childi of this._children) child.collectLeafs(leafs)
      let content = []
      for (let leaf of leafs)
      leaf.kind === 1
          ? content.push(leaf.text)
          : (leaf.isExplicit ||
              (content.length > 0 &&
                content[content.length - 1] !==
                  `
`)) &&
            content.push(`
`)
      e.push({ role: this._obj.props.role, content: content.join('') })
    } else
      for (let child of this._children) {
        if (child.kind === 1 || child.kind === 2)
          throw new Error('Cannot have a text node or line break node outside a ChatMessage!')
          child._materialize(e)
      }
  }

  collectLeafs(result) {
    if (this._obj instanceof FragmentComponent) throw new Error('Cannot have a ChatMessage nested inside a ChatMessage!')
    result.push(new LineBreakNode(this, !1))
    for (let child of this._children) child.collectLeafs(result)
  }
}

class TextNode {
  constructor(parent, text) {
    this.parent = parent;
    this.text = text;
    this.kind = 1;
  }

  collectLeafs(tree) {
    tree.push(this);
  }
}


class LineBreakNode {
  constructor(parent, isExplicit) {
    this.parent = parent;
    this.isExplicit = isExplicit;
    this.kind = 2;
  }

  collectLeafs(tree) {
    tree.push(this);
  }
}

function isFragment(node) {
  return (typeof node.ctor == 'function' && node.ctor.isFragment) ?? false
}

var CodeRenderer = class extends BaseComponent {
  render() {
    return vscpp(
      vscppf,
      null,
      '```',
      this.props.language.languageId,
      vscpp('br', null),
      this.props.document &&
        vscpp(vscppf, null, FilePathComment.forDocument(this.props.language, this.props.document), vscpp('br', null)),
      this.props.code && vscpp(vscppf, null, this.props.code, vscpp('br', null)),
      '```'
    )
  }
}
var CodeRegionRenderer = class extends BaseComponent {
  render() {
    if (!this.props.codeRegion.hasContent) return
    let lines = []
    return (
      this.props.useMarkers && lines.push(this.props.codeRegion.startMarker),
      lines.push(...this.props.codeRegion.lines),
      this.props.useMarkers && lines.push(this.props.codeRegion.endMarker),
      vscpp(CodeRenderer, {
        language: this.props.codeRegion.language,
        document: this.props.codeRegion.document,
        code: lines.join(`
`),
      })
    )
  }
}
var InlineNotebookSelection = class extends BaseComponent {
  static {
    this.METADATA_ID = 'inlineNotebookSelection'
  }
  async prepare() {
    return await analyzeDocument(this.accessor, this.props.documentContext.document, this.props.documentContext.wholeRange)
  }
  render(e, r) {
    if (!isNotebookCell(this.props.documentContext.document.uri))
      throw throwIllegalArgumentError('InlineChatNotebookSelection should be used only with a notebook!')
    let { expandedRange: n } = e,
      i = processCodeAndCells(this.accessor, r.endpoint, this.props.documentContext, n, void 0),
      o = this.props.documentContext.document,
      s = { expandedRange: n, contextInfo: i },
      a = [{ uri: o.uri, version: o.version, ranges: filterTruthyValues([i.range.toRange(), i.above.toRange(), i.below.toRange()]) }]
    return vscpp(
      vscppf,
      null,
      vscpp('usedContext', { value: a }),
      vscpp('meta', { key: InlineNotebookSelection.METADATA_ID, value: s }),
      vscpp(NotebookRenderer, {
        documentContext: this.props.documentContext,
        above: i.above,
        range: i.range,
        below: i.below,
        aboveCells: i.aboveCells,
        belowCells: i.belowCells,
      })
    )
  }
}
var NotebookRenderer = class extends BaseComponent {
    static {
      this.METADATA_ID = 'inlineNotebookSelection'
    }
    render(props, state) {
      if (!isNotebookCell(this.props.documentContext.document.uri))
        throw throwIllegalArgumentError('InlineChatNotebookSelectionRenderer should be used only with a notebook!')
      let includeDelimeters = this.props.includeDelimeters ?? false,
        { below: belowCells, above: aboveCells, range: range, aboveCells: cellsAbove_, belowCells: cellsBelow_ } = this.props,
        cellsAbove = cellsAbove_ || [],
        cellsBelow = cellsBelow_ || [],
        language = this.props.documentContext.language
      return vscpp(
        vscppf,
        null,
        (cellsAbove.length > 0 || cellsBelow.length > 0) &&
          vscpp(
            UserComponent,
            null,
            'I am working on a Jupyter notebook.',
            vscpp('br', null),
            'This Jupyter Notebook already contains multiple cells.',
            vscpp('br', null),
            'The content of cells are listed below, each cell starts with CELL INDEX and a code block started with ```',
            language.languageId,
            vscpp('br', null),
            'Each cell is a block of code that can be executed independently.',
            vscpp('br', null),
            'Since it is Jupyter Notebook, if a module is already imported in a cell, it can be used in other cells as well.',
            vscpp('br', null),
            'For the same reason, if a variable is defined in a cell, it can be used in other cells as well.',
            vscpp('br', null),
            'We should not repeat the same import or variable definition in multiple cells, unless we want to overwrite the previous definition.',
            vscpp('br', null),
            'Do not generate CELL INDEX in your answer, it is only used to help you understand the context.',
            vscpp('br', null),
            vscpp('br', null),
            'Below you will find a set of examples of what you should respond with. Please follow the exmaples on how to avoid repeating code.',
            vscpp('br', null),
            '## Examples starts here',
            vscpp('br', null),
            'Here are the cells in this Jupyter Notebook:',
            vscpp('br', null),
            '`CELL INDEX: 0',
            vscpp('br', null),
            '```python',
            vscpp('br', null),
            'import pandas as pd',
            vscpp('br', null),
            vscpp('br', null),
            '# create a dataframe with sample data',
            vscpp('br', null),
            "df = pd.DataFrame({'Name': ['Alice', 'Bob', 'Charlie'], 'Age': [25, 30, 35], 'Gender': ['F', 'M', 'M']})",
            vscpp('br', null),
            'print(df)',
            vscpp('br', null),
            '```',
            vscpp('br', null),
            '---------------------------------',
            vscpp('br', null),
            'USER:',
            vscpp('br', null),
            'Now I create a new cell in this Jupyter Notebook document at index 1.',
            vscpp('br', null),
            'In this new cell, I am working with the following code:',
            vscpp('br', null),
            '```python',
            vscpp('br', null),
            '```',
            vscpp('br', null),
            '---------------------------------',
            vscpp('br', null),
            'USER:',
            vscpp('br', null),
            'plot the data frame',
            vscpp('br', null),
            vscpp('br', null),
            '---------------------------------',
            vscpp('br', null),
            'ChatGPT Answer',
            vscpp('br', null),
            '---------------------------------',
            vscpp('br', null),
            "To plot the dataframe, we can use the `plot()` method of pandas dataframe. Here's the code:",
            vscpp('br', null),
            vscpp('br', null),
            '```python',
            vscpp('br', null),
            "df.plot(x='Name', y='Age', kind='bar')",
            vscpp('br', null),
            '```',
            vscpp('br', null),
            '## Example ends here',
            vscpp('br', null),
            cellsAbove.length > 0 &&
              vscpp(CellGroupRenderer, {
                cells: cellsAbove,
                title: `Here are the cells in this Jupyter Notebook:
`,
              }),
              cellsBelow.length > 0 &&
              vscpp(CellGroupRenderer, {
                cells: cellsBelow,
                cellIndexDelta: cellsAbove.length + 1,
                title: `Here are the cells below the current cell that I am editing in this Jupyter Notebook:
`,
              })
          ),
          language.languageId === 'markdown'
          ? vscpp(MarkdownCellRenderer, { cellIndex: cellsAbove.length, selected: range, above: aboveCells, below: belowCells, includeDelimeters: includeDelimeters })
          : vscpp(NewCellRenderer, { cellIndex: cellsAbove.length, selected: range, above: aboveCells, below: belowCells, includeDelimeters: includeDelimeters })
      )
    }
  },
  MarkdownCellRenderer = class extends BaseComponent {
    render() {
      let includeDelimeters = this.props.includeDelimeters ?? (this.props.above.hasContent || this.props.below.hasContent)
      return vscpp(
        vscppf,
        null,
        vscpp(
          UserComponent,
          null,
          'Now I create a new cell in this Jupyter Notebook document at index ',
          this.props.cellIndex,
          '.',
          vscpp('br', null),
          'This is a markdown cell. Markdown cell is used to describte and document your workflow.',
          vscpp('br', null),
          this.props.selected.hasContent
            ? vscpp(
                vscppf,
                null,
                'I have the following content in the selection:',
                vscpp(CodeRegionRenderer, { codeRegion: this.props.selected, useMarkers: includeDelimeters })
              )
            : vscpp(
                vscppf,
                null,
                'In this new cell, I am working with the following content:',
                vscpp(CodeRenderer, { language: this.props.selected.language, code: '' })
              )
        ),
        this.props.above.hasContent &&
          vscpp(
            UserComponent,
            null,
            'In this new cell, I have the following markdown content above the selection:',
            vscpp(CodeRegionRenderer, { codeRegion: this.props.above, useMarkers: this.props.includeDelimeters })
          ),
        this.props.below.hasContent &&
          vscpp(
            UserComponent,
            null,
            'In this new cell, I have the following markdown content below the selection:',
            vscpp(CodeRegionRenderer, { codeRegion: this.props.below, useMarkers: this.props.includeDelimeters })
          )
      )
    }
  },
  NewCellRenderer = class extends BaseComponent {
    // render() {
    //   let includeDelimeters = this.props.includeDelimeters ?? (this.props.above.hasContent || this.props.below.hasContent);
    //   return vscpp(
    //       vscppf,
    //       null,
    //       this.renderUserComponent(includeDelimeters),
    //       this.props.above.hasContent && this.renderAboveContent(),
    //       this.props.below.hasContent && this.renderBelowContent()
    //   );
    // }

    // renderUserComponent(includeDelimeters) {
    //     return vscpp(
    //         UserComponent,
    //         null,
    //         'Now I create a new cell in this Jupyter Notebook document at index ',
    //         this.props.cellIndex,
    //         '.',
    //         vscpp('br', null),
    //         'This is a markdown cell. Markdown cell is used to describe and document your workflow.',
    //         vscpp('br', null),
    //         this.props.selected.hasContent
    //             ? this.renderSelectedContent(includeDelimeters)
    //             : this.renderEmptyContent()
    //     );
    // }

    // renderSelectedContent(includeDelimeters) {
    //     return vscpp(
    //         vscppf,
    //         null,
    //         'I have the following content in the selection:',
    //         vscpp(CodeRegionRenderer, { codeRegion: this.props.selected, useMarkers: includeDelimeters })
    //     );
    // }

    // renderEmptyContent() {
    //     return vscpp(
    //         vscppf,
    //         null,
    //         'In this new cell, I am working with the following content:',
    //         vscpp(CodeRenderer, { language: this.props.selected.language, code: '' })
    //     );
    // }

    // renderAboveContent() {
    //     return vscpp(
    //         UserComponent,
    //         null,
    //         'In this new cell, I have the following markdown content above the selection:',
    //         vscpp(CodeRegionRenderer, { codeRegion: this.props.above, useMarkers: this.props.includeDelimeters })
    //     );
    // }

    // renderBelowContent() {
    //     return vscpp(
    //         UserComponent,
    //         null,
    //         'In this new cell, I have the following markdown content below the selection:',
    //         vscpp(CodeRegionRenderer, { codeRegion: this.props.below, useMarkers: this.props.includeDelimeters })
    //     );
    // }

    render() {
      let includeDelimeters = this.props.includeDelimeters ?? (this.props.above.hasContent || this.props.below.hasContent)
      return vscpp(
        vscppf,
        null,
        vscpp(
          UserComponent,
          null,
          'Now I create a new cell in this Jupyter Notebook document at index ',
          this.props.cellIndex,
          '.',
          vscpp('br', null),
          this.props.selected.hasContent
            ? vscpp(
                vscppf,
                null,
                'I have the following code in the selection:',
                vscpp(CodeRegionRenderer, { codeRegion: this.props.selected, useMarkers: includeDelimeters })
              )
            : vscpp(
                vscppf,
                null,
                'In this new cell, I am working with the following code:',
                vscpp(CodeRenderer, { language: this.props.selected.language, code: '' })
              )
        ),
        this.props.above.hasContent &&
          vscpp(
            UserComponent,
            null,
            'In this new cell, I have the following code above the selection:',
            vscpp(CodeRegionRenderer, { codeRegion: this.props.above, useMarkers: this.props.includeDelimeters })
          ),
        this.props.below.hasContent &&
          vscpp(
            UserComponent,
            null,
            'In this new cell, I have the following code below the selection:',
            vscpp(CodeRegionRenderer, { codeRegion: this.props.below, useMarkers: this.props.includeDelimeters })
          )
      )
    }
  },
  CellGroupRenderer = class extends BaseComponent {
    render() {
      return vscpp(
        vscppf,
        null,
        this.props.title,
        vscpp('br', null),
        this.props.cells.map((cell, index) => vscpp(CellRenderer, { index: index + (this.props.cellIndexDelta ?? 0), cell: cell }))
      )
    }
  },
  CellRenderer = class extends BaseComponent {
    render() {
      return vscpp(
        vscppf,
        null,
        'CELL INDEX: ',
        this.props.index,
        vscpp('br', null),
        '```',
        this.props.cell.language.languageId,
        vscpp('br', null),
        this.props.cell.lines.join(`
`),
        vscpp('br', null),
        '```'
      )
    }
  }
function processCodeAndCells(workspaceService, config, context, codeBlockResult, maxTokenCount) {
  // If maxTokenCount is not provided, calculate it based on the modelMaxTokenWindow configuration
  maxTokenCount = maxTokenCount ?? (config.modelMaxTokenWindow * 4) / 3;

  let characterCounter = new CharacterCounter(maxTokenCount),
    processedCodeBlock = handleCodeBlock(context.document, context.selection, codeBlockResult, new VscodeRange(0, 0, context.document.lineCount, 0), context.language, characterCounter);

  // Process the cells in the notebook document that matches the context document
  return processNotebookCells(workspaceService.get(WorkspaceClass), context, processedCodeBlock, characterCounter);
}
var InlineChatSelection = class extends BaseComponent {
  static {
    this.METADATA_ID = 'inlineDocumentSelection'
  }
  async prepare() {
    return await analyzeDocument(this.accessor, this.props.documentContext.document, this.props.documentContext.wholeRange)
  }
  render(renderProps, renderContext) {
    if (isNotebookCell(this.props.documentContext.document.uri)) throw throwIllegalArgumentError('InlineChatSelection should not be used with a notebook!')

    let { expandedRange, rangeExpandedToFunction, functionBodies } = renderProps,
      processedCodeBlock = processCodeBlock(this.accessor, renderContext.endpoint, this.props.documentContext, expandedRange, rangeExpandedToFunction, functionBodies, undefined),
      document = this.props.documentContext.document,
      language = this.props.documentContext.language,
      metadata = { expandedRange, contextInfo: processedCodeBlock },
      usedContext = [{ uri: document.uri, version: document.version, ranges: filterTruthyValues([processedCodeBlock.range.toRange(), processedCodeBlock.above.toRange(), processedCodeBlock.below.toRange()]) }],
      hasContent = processedCodeBlock.above.hasContent || processedCodeBlock.below.hasContent || processedCodeBlock.outlineAbove.length > 0 || processedCodeBlock.outlineBelow.length > 0;

    return vscpp(
      vscppf,
      null,
      vscpp('usedContext', { value: usedContext }),
      vscpp('meta', { key: InlineChatSelection.METADATA_ID, value: metadata }),
      processedCodeBlock.outlineAbove.length > 0 &&
        vscpp(
          UserComponent,
          null,
          'I have the following code above:',
          vscpp(CodeRenderer, { language, document, code: processedCodeBlock.outlineAbove })
        ),
      processedCodeBlock.above.hasContent &&
        vscpp(
          UserComponent,
          null,
          'I have the following code above the selection:',
          vscpp(CodeRegionRenderer, { codeRegion: processedCodeBlock.above, useMarkers: hasContent })
        ),
      processedCodeBlock.below.hasContent &&
        vscpp(
          UserComponent,
          null,
          'I have the following code below the selection:',
          vscpp(CodeRegionRenderer, { codeRegion: processedCodeBlock.below, useMarkers: hasContent })
        ),
      processedCodeBlock.outlineBelow.length > 0 &&
        vscpp(
          UserComponent,
          null,
          'I have the following code below:',
          vscpp(CodeRenderer, { language, document, code: processedCodeBlock.outlineBelow })
        ),
      processedCodeBlock.range.hasContent &&
        vscpp(
          UserComponent,
          null,
          'I have the following code in the selection:',
          vscpp(CodeRegionRenderer, { codeRegion: processedCodeBlock.range, useMarkers: hasContent })
        ),
      !processedCodeBlock.range.hasContent &&
        !hasContent &&
        vscpp(UserComponent, null, 'I am in an empty file:', vscpp(CodeRenderer, { language, document, code: '' }))
    )
  }
}

function processCodeBlock(workspaceService, config, context, codeBlockResult, selectionRange, functionBodies, maxTokenCount) {
  // If maxTokenCount is not provided, calculate it based on the modelMaxTokenWindow configuration
  maxTokenCount = maxTokenCount ?? (config.modelMaxTokenWindow * 4) / 3;

  let characterCounter = new CharacterCounter(maxTokenCount),
    processedCodeBlock = handleCodeBlock(context.document, context.selection, codeBlockResult, new VscodeRange(0, 0, context.document.lineCount, 0), context.language, characterCounter);

  // If the above part of the code block has no content or is complete, return the processed code block without outlines
  if (!(processedCodeBlock.above.hasContent && !processedCodeBlock.above.isComplete))
    return { language: processedCodeBlock.language, above: processedCodeBlock.above, range: processedCodeBlock.range, below: processedCodeBlock.below, outlineAbove: '', outlineBelow: '' };

  let outlineCharacterCounter = new CharacterCounter(maxTokenCount),
    expandedSelectionRange = new VscodeRange(selectionRange.start.line, 0, selectionRange.end.line, context.document.lineAt(selectionRange.end.line).range.end.character),
    expandedProcessedCodeBlock = handleCodeBlock(context.document, context.selection, codeBlockResult, expandedSelectionRange, context.language, outlineCharacterCounter),
    outlineAbove = '',
    outlineBelow = '';

  // If the above and below parts of the expanded code block are complete, generate and split the outlines
  if (expandedProcessedCodeBlock.above.isComplete && expandedProcessedCodeBlock.below.isComplete) {
    let outline = generateOutline({ document: context.document, functionBodies: functionBodies, rangeExpandedToFunctionWholeLines: expandedSelectionRange }),
      splitOutline = splitOutlines(outline, outlineCharacterCounter);
    outlineAbove = splitOutline.outlineAbove;
    outlineBelow = splitOutline.outlineBelow;
  }

  return { language: expandedProcessedCodeBlock.language, above: expandedProcessedCodeBlock.above, range: expandedProcessedCodeBlock.range, below: expandedProcessedCodeBlock.below, outlineAbove: outlineAbove, outlineBelow: outlineBelow };
}

var InlineChatContextResolver = class {
  constructor() {
    this.kind = 'inline-chat-selection'
  }
  async resolveContext(extension, request, next) {
    let documentContext = request.documentContext
    if (!documentContext) return
    let selectionComponent = isNotebookCell(documentContext.document.uri) ? InlineNotebookSelection : InlineChatSelection,
      { messages, metadatas, usedContext } = await renderWithMetadata(extension, request.endpoint, selectionComponent, { documentContext }),
      metadata = metadatas.get(InlineChatSelection.METADATA_ID) || metadatas.get(InlineNotebookSelection.METADATA_ID)
    return { kind: this.kind, userMessages: messages.map(message => message.content), usedContext, metadata }
  }
},
  contextResolverRegistration = ContextResolverRegistry.register(new InlineChatContextResolver())
function handleCodeBlock(document, range, selection, viewport, language, editor) {
  let rangeBlock = new CodeBlock(editor, document, language, 'ed8c6549bwf9'),
    aboveBlock = new CodeBlock(editor, document, language, 'abpxx6d04wxr'),
    belowBlock = new CodeBlock(editor, document, language, 'be15d9bcejpp'),
    createResult = () => {
      aboveBlock.trim();
      rangeBlock.trim(range);
      belowBlock.trim();
      return { language: language, above: aboveBlock, range: rangeBlock, below: belowBlock };
    };

  // Prepend lines from the end of the selection to the start
  for (let lineIndex = selection.end.line; lineIndex >= selection.start.line; lineIndex--) {
    if (!rangeBlock.prependLine(lineIndex)) return createResult();
  }

  let lineIndices = {
    aboveLineIndex: selection.start.line - 1,
    belowLineIndex: selection.end.line + 1,
    minimumLineIndex: Math.max(0, viewport.start.line),
    maximumLineIndex: Math.min(document.lineCount - 1, viewport.end.line),
  };

  appendAndPrependLines(lineIndices, aboveBlock, belowBlock);
  return createResult();
}

function appendAndPrependLines(lineIndices, aboveBlock, belowBlock) {
  let aboveLineIndex = lineIndices.aboveLineIndex,
    canPrepend = true,
    belowLineIndex = lineIndices.belowLineIndex,
    canAppend = true;

  // Try to append and prepend lines until we reach the limits or we've tried 100 times
  for (let attempt = 0; attempt < 100 && (canPrepend || canAppend); attempt++) {
    if (!canPrepend || (canAppend && attempt % 4 === 3)) {
      if (belowLineIndex <= lineIndices.maximumLineIndex && belowBlock.appendLine(belowLineIndex)) {
        belowLineIndex++;
      } else {
        canAppend = false;
      }
    } else if (aboveLineIndex >= lineIndices.minimumLineIndex && aboveBlock.prependLine(aboveLineIndex)) {
      aboveLineIndex--;
    } else {
      canPrepend = false;
    }
  }

  aboveBlock.isComplete = aboveLineIndex < lineIndices.minimumLineIndex;
  belowBlock.isComplete = belowLineIndex > lineIndices.maximumLineIndex;
}
function generateOutline({ document, functionBodies, rangeExpandedToFunctionWholeLines }) {
  let endStatement = '';
  document.languageId === 'typescript' && (endStatement = ';');

  let isInRange = body => {
    let bodyRange = new VscodeRange(document.positionAt(body.startIndex), document.positionAt(body.endIndex));
    return bodyRange.end.line < rangeExpandedToFunctionWholeLines.start.line
      ? rangeExpandedToFunctionWholeLines.start.line - bodyRange.start.line > 50
      : bodyRange.start.line > rangeExpandedToFunctionWholeLines.end.line
      ? bodyRange.end.line - rangeExpandedToFunctionWholeLines.end.line > 50
      : true;
  };

  let bodiesInRange = functionBodies.filter(isInRange);
  let startOffset = document.offsetAt(rangeExpandedToFunctionWholeLines.start);
  let endOffset = document.offsetAt(rangeExpandedToFunctionWholeLines.end);
  let rangeOffsets = { startOffset, endOffset };

  let { outlineAbove, outlineBelow } = createOutlines(document.getText(), bodiesInRange, rangeOffsets, endStatement);

  return { outlineAboveRange: outlineAbove, outlineBelowRange: outlineBelow };
}

function createOutlines(text, bodies, rangeOffsets, endStatement) {
  let currentIndex = 0;
  let outlineAbove = '';
  let endOffset = rangeOffsets.endOffset;
  let outlineBelow = '';

  for (let body of bodies) {
    if (body.endIndex < rangeOffsets.startOffset) {
      outlineAbove += text.substring(currentIndex, body.startIndex);
      outlineAbove += endStatement;
      currentIndex = body.endIndex;
    } else if (body.startIndex > rangeOffsets.endOffset) {
      outlineBelow += text.substring(endOffset, body.startIndex);
      outlineBelow += endStatement;
      endOffset = body.endIndex;
    } else {
      continue;
    }
  }

  outlineAbove += text.substring(currentIndex, rangeOffsets.startOffset);
  outlineBelow += text.substring(endOffset, text.length);

  return { outlineAbove, outlineBelow };
}

function splitOutlines(outline, lineCounter) {
  let lineBreakPattern = /\r\n|\r|\n/g;
  let outlineAboveLines = outline.outlineAboveRange === '' ? [] : outline.outlineAboveRange.split(lineBreakPattern);
  let outlineBelowLines = outline.outlineBelowRange === '' ? [] : outline.outlineBelowRange.split(lineBreakPattern);
  let aboveLines = [];
  let belowLines = [];

  let addAboveLine = line => (lineCounter.lineWouldFit(line) ? (lineCounter.addLine(line), aboveLines.unshift(line), true) : false);
  let addBelowLine = line => (lineCounter.lineWouldFit(line) ? (lineCounter.addLine(line), belowLines.push(line), true) : false);

  let aboveLineIndex = outlineAboveLines.length - 1;
  let canAddAbove = true;
  let belowLineIndex = 0;
  let canAddBelow = true;

  for (let i = 0; i < 100 && (canAddAbove || canAddBelow); i++) {
    if (!canAddAbove || (canAddBelow && i % 4 === 3)) {
      if (belowLineIndex < outlineBelowLines.length && addBelowLine(outlineBelowLines[belowLineIndex])) {
        belowLineIndex++;
      } else {
        canAddBelow = false;
      }
    } else if (aboveLineIndex >= 0 && addAboveLine(outlineAboveLines[aboveLineIndex])) {
      aboveLineIndex--;
    } else {
      canAddAbove = false;
    }
  }

  return {
    outlineAbove: aboveLines.join('\n'),
    outlineBelow: belowLines.join('\n'),
  };
}

function processNotebookCells(notebookService, context, codeBlockResult, characterCounter) {
  // Find the notebook document that matches the context document
  let notebookDocument = notebookService.notebookDocuments.find(
    notebook => notebook.uri.fsPath === context.document.uri.fsPath && notebook.getCells().find(cell => cell.document === context.document)
  );

  // If no matching notebook document is found, return the codeBlockResult with empty outlines and cells
  if (!notebookDocument) return { ...codeBlockResult, outlineAbove: '', outlineBelow: '', aboveCells: [], belowCells: [] };

  let { language, above: aboveBlock, range: rangeBlock, below: belowBlock } = codeBlockResult,
    totalLines = aboveBlock.lines.length + rangeBlock.lines.length + belowBlock.lines.length,
    contextCellIndex = notebookDocument.getCells().findIndex(cell => cell.document === context.document),
    aboveCells = [],
    belowCells = [],
    createResult = () => (
      aboveCells.forEach(cell => cell.trim()),
      belowCells.forEach(cell => cell.trim()),
      { language, above: aboveBlock, range: rangeBlock, below: belowBlock, outlineAbove: '', outlineBelow: '', aboveCells, belowCells }
    ),
    canProcessAbove = true,
    canProcessBelow = true,
    aboveCellIndex = contextCellIndex - 1,
    belowCellIndex = contextCellIndex + 1;

  // Process cells above and below the context cell until we reach the limits or we've processed 100 lines
  for (let lineCount = totalLines; lineCount < 100 && (canProcessAbove || canProcessBelow); lineCount++) {
    if (canProcessAbove) {
      if (aboveCellIndex >= 0) {
        let cellDocument = notebookDocument.cellAt(aboveCellIndex).document,
          cellBlock = new CodeBlock(characterCounter, cellDocument, context.language, 'CELL:' + cellDocument.uri.fragment);
        for (let lineIndex = 0; lineIndex < cellDocument.lineCount; lineIndex++) cellBlock.appendLine(lineIndex);
        aboveCells.unshift(cellBlock);
        aboveCellIndex--;
      } else {
        canProcessAbove = false;
      }
    } else if (belowCellIndex < notebookDocument.cellCount) {
      let cellDocument = notebookDocument.cellAt(belowCellIndex).document,
        cellBlock = new CodeBlock(characterCounter, cellDocument, context.language, 'CELL:' + cellDocument.uri.fragment);
      for (let lineIndex = 0; lineIndex < cellDocument.lineCount; lineIndex++) cellBlock.appendLine(lineIndex);
      belowCells.push(cellBlock);
      belowCellIndex++;
    } else {
      canProcessBelow = false;
    }
  }

  return createResult();
}
var TestFileContextResolver = class {
  constructor() {
    this.kind = 'tests/impl2test'
    this._onDidFindCandidate = new VscodeEventEmitter()
    this.onDidFindCandidate = this._onDidFindCandidate.event
    this.metaContextResolverInfo = { description: 'Information about existing or related files containing tests.' }
    this._decoder = new util.TextDecoder()
  }

  async resolveContext(serviceProvider, request, cancellationToken) {
    let documentContext = request.documentContext
    if (!documentContext || isTestFile(documentContext.document)) return

    let fileSystemOperations = serviceProvider.get(BaseFileSystemOperations)
    let testFileManager = new TestFileManager(serviceProvider.get(FileFinder), serviceProvider.get(BaseTabManager))
    let maxTokenWindow = (request.endpoint.modelMaxTokenWindow * 4) / 3

    let readFileExcerpt = async (filePath, length = maxTokenWindow) => {
      let fileContent = this._decoder.decode(await fileSystemOperations.readFile(filePath)).substring(0, length)
      return `${FilePathComment.forUri(documentContext.language, filePath)}\n${fileContent}`
    }

    let testFile = await testFileManager.findTestFileForSourceFile(documentContext.document, cancellationToken)
    if (testFile) {
      this._onDidFindCandidate.fire(testFile)
      let markdownString = new VscodeMarkdownString()
      markdownString.appendMarkdown(`\nExcerpt of the existing test file:\n`)
      markdownString.appendCodeblock(await readFileExcerpt(testFile), documentContext.document.languageId)
      markdownString.appendMarkdown(`\nBecause a test file exists:\n- Do not generate preambles, like imports, copyright headers etc.\n- Do generate code that can be appended to the existing test file.`)
      return { kind: this.kind, userMessages: [markdownString.value], references: [new Anchor(testFile)] }
    }

    let anyTestFile = await testFileManager.findAnyTestFileForSourceFile(documentContext.document, cancellationToken)
    if (!anyTestFile) return
    let markdownString = new VscodeMarkdownString(`This is sample test file:\n`)
    markdownString.appendCodeblock(await readFileExcerpt(anyTestFile), documentContext.document.languageId)
    return { kind: this.kind, userMessages: [markdownString.value], references: [new Anchor(anyTestFile)] }
  }
}
var TestToImplContextResolver = class {
  constructor() {
    this.kind = 'tests/test2impl'
    this.metaContextResolverInfo = { description: 'Information about existing or related files containing tests.' }
    this._decoder = new util.TextDecoder()
  }

  async resolveContext(serviceProvider, request, cancellationToken) {
    let documentContext = request.documentContext
    if (!documentContext || !isTestFile(documentContext.document)) return

    let fileSystemOperations = serviceProvider.get(BaseFileSystemOperations)
    let testFileManager = new TestFileManager(serviceProvider.get(FileFinder), serviceProvider.get(BaseTabManager))
    let maxTokenWindow = (request.endpoint.modelMaxTokenWindow * 4) / 3

    let createFileExcerpt = (filePath, fileContent, length = maxTokenWindow) => {
      return `${FilePathComment.forUri(documentContext.language, filePath)}\n${fileContent.substring(0, length)}`
    }

    let readFileContent = async filePath => {
      let fileContent = this._decoder.decode(await fileSystemOperations.readFile(filePath))
      return createFileExcerpt(filePath, fileContent)
    }

    let implFile = await testFileManager.findFileForTestFile(documentContext.document, cancellationToken)
    if (!implFile) return

    let markdownString
    try {
      let document = await serviceProvider.get(WorkspaceClass).openTextDocument(implFile)
      let fileContent = document.getText()
      let functionBodies = await getSortedFunctionBodies(serviceProvider, document, 100)
      let { outlineAbove, outlineBelow } = createOutlines(fileContent, functionBodies, { startOffset: fileContent.length, endOffset: fileContent.length }, '')
      let outline = `${outlineAbove}\n${outlineBelow}`

      markdownString = new VscodeMarkdownString(`\nThis is an excerpt of the file that this test is covering:\n`)
      markdownString.appendCodeblock(createFileExcerpt(implFile, outline), documentContext.document.languageId)
    } catch {}

    if (!markdownString) {
      markdownString = new VscodeMarkdownString(`\nThis is an excerpt of the file that this test is covering:\n`)
      markdownString.appendCodeblock(await readFileContent(implFile), documentContext.document.languageId)
    }

    return { kind: this.kind, userMessages: [markdownString.value], references: [new Anchor(implFile)] }
  }
}
var Knt = ContextResolverRegistry.register(new TestFileContextResolver()),
var _Y = ContextResolverRegistry.register(new TestToImplContextResolver())
var path = require('path'),
var ActiveEditorContextResolver = class {
  constructor() {
    this.kind = 'current-editor'
    this.variableInfo = { name: 'editor', description: 'The source code in the active editor', defaultEnablement: false }
    this.metaContextResolverInfo = { description: 'Source code in the active document.' }
  }

  async resolveContext(serviceProvider, request) {
    let activeEditor = serviceProvider.get(BaseTabManager).activeTextEditor
    let visibleRange = activeEditor?.visibleRanges[0]

    if (visibleRange) {
      if (!activeEditor.selection.isEmpty) return

      let cursorLineInfo = ''
      if (activeEditor.selection.isSingleLine) {
        cursorLineInfo = `The cursor is on line: ${activeEditor.selection.start.line}`
      }

      let excerpt = 'Excerpt from active file ' +
        path.basename(activeEditor.document.uri.path) +
        ', lines ' +
        (visibleRange.start.line + 1) +
        ' to ' +
        (visibleRange.end.line + 1) +
        ':\n```' +
        activeEditor.document.languageId +
        '\n' +
        activeEditor.document.getText(visibleRange) +
        '\n```\n\n' +
        cursorLineInfo

      let usedContext = [{ uri: activeEditor.document.uri, version: activeEditor.document.version, ranges: [visibleRange] }]

      return {
        kind: this.kind,
        userMessages: [excerpt],
        usedContext: usedContext,
        references: [new Anchor({ uri: activeEditor.document.uri, range: visibleRange })],
      }
    }
  }
}
var activeEditorContextResolver = ContextResolverRegistry.register(new ActiveEditorContextResolver())
var path = handleDefaultExports(require('path'))
var CurrentSelectionContextResolver = class {
  constructor() {
    this.kind = 'current-selection'
    this.variableInfo = { name: 'selection', description: 'The current selection' }
    this.metaContextResolverInfo = { description: 'Active selection.' }
  }

  async resolveContext(serviceProvider, request) {
    let currentSelection = CurrentSelectionContextResolver.getCurrentSelection(serviceProvider.get(BaseTabManager))
    if (currentSelection) {
      let formattedSelection = CurrentSelectionContextResolver.formatSelection(currentSelection)
      let usedContext = [{ uri: currentSelection.activeDocument.uri, version: currentSelection.activeDocument.version, ranges: [currentSelection.range] }]

      return {
        kind: this.kind,
        userMessages: [
          `Active selection:\n${formattedSelection}`,
        ],
        usedContext: usedContext,
        references: [new Anchor(new VscodeLocation(currentSelection.activeDocument.uri, currentSelection.range))],
      }
    } else {
      return new ActiveEditorContextResolver().resolveContext(serviceProvider, request)
    }
  }

  static formatSelection(selection) {
    return `\n${
      selection.fileName
        ? `From the file: ${path.basename(selection.fileName)}\n`
        : ''
    }\`\`\`${selection.languageId}\n${selection.selectedText}\n\`\`\`\n`
  }

  static getCurrentSelection(tabManager) {
    let activeEditor = tabManager.activeTextEditor
    let activeDocument = activeEditor?.document
    if (activeDocument) {
      let selection = activeEditor.selection
      if (selection && !selection.isEmpty) {
        let languageId = activeDocument.languageId
        let selectedText = activeDocument.getText(selection)
        return { languageId: languageId, selectedText: selectedText, activeDocument: activeDocument, range: selection, fileName: activeDocument.fileName }
      }
    }
  }
},
var currentSelectionContextResolver = ContextResolverRegistry.register(new CurrentSelectionContextResolver())
var CurrentSelectionImplementationsResolver = class {
  constructor() {
    this.kind = 'current-selection-implementations'
    this.metaContextResolverInfo = { description: 'Relevant implementations referenced in active selection.' }
  }

  async resolveContext(serviceProvider, request, thirdParam, fourthParam) {
    let currentSelection = CurrentSelectionContextResolver.getCurrentSelection(serviceProvider.get(BaseTabManager))
    if (!currentSelection) return

    let activeDocument = currentSelection.activeDocument
    let delay = serviceProvider.get(extensionContext).extensionMode === VscodeExtensionMode.Test ? 0 : 200
    let userMessages = []
    let references = []
    let usedContext = []

    for (let { header, findImpls } of [
      { header: 'Relevant function implementations', findImpls: getFunctionReferences },
      { header: 'Relevant class declarations', findImpls: getClassReferences },
      { header: 'Relevant type declarations', findImpls: getSortedTypeReferences },
    ]) {
      let implementations = await findImpls(serviceProvider, activeDocument, currentSelection.range, delay)
      if (!implementations.length) continue

      let { references: implReferences, usedContext: implUsedContext, text: implText } = formatImplementations(activeDocument, implementations)
      let message = `${header}:\n\n${implText.map(text => `\`\`\`${currentSelection.languageId}\n${text}\n\`\`\``).join('\n\n')}\n`

      userMessages.push(message)
      references.push(...implReferences)
      usedContext.push(...implUsedContext)
    }

    return { kind: this.kind, references: references, userMessages: userMessages, usedContext: usedContext }
  }
}

function formatImplementations(document, implementations) {
  let references = []
  let contextMap = new Map()
  let seenSet = new Set()
  let text = []

  for (let impl of implementations) {
    let uri = impl.uri ?? document.uri
    let range = impl.range ?? new VscodeRange(document.positionAt(impl.startIndex), document.positionAt(impl.endIndex))
    let key = `${uri.toString()}-${range.start.line}-${range.start.character}-${range.end.line}-${range.end.character}`

    if (seenSet.has(key)) continue

    seenSet.add(key)
    references.push(new Anchor(new VscodeLocation(uri, range)))
    text.push(impl.text)

    let [version, ranges] = contextMap.get(uri) ?? [impl.version ?? document.version, []]
    ranges.push(range)
    contextMap.set(uri, [version, ranges])
  }

  return {
    references: references,
    usedContext: [...contextMap.entries()].map(([uri, [version, ranges]]) => ({ uri: uri, version: version, ranges: ranges })),
    text: text,
  }
}

var bY = ContextResolverRegistry.register(new CurrentSelectionImplementationsResolver())
var DisposableClass = class extends Disposable {}
var DebugConsoleOutputResolver = class {
  constructor() {
    this.kind = 'debug-console-output'
    this.variableInfo = {
      name: 'debugConsole',
      description: 'The output in the debug console',
      defaultEnablement: false,
    }
    this.metaContextResolverInfo = { description: 'Debug console output.' }
  }

  async resolveContext(serviceProvider) {
    return {
      kind: this.kind,
      userMessages: [
        `Debug console output:\n` + serviceProvider.get(DisposableClass).consoleOutput,
      ],
    }
  }
}
var Sit = ContextResolverRegistry.register(new DebugConsoleOutputResolver())
var DiagnosticWaiter = class {
  waitForNewDiagnostics(uri, cancellationToken, timeout = 5000) {
    let cancellationDisposable, diagnosticChangeDisposable, timeoutId

    return new Promise(resolve => {
      cancellationDisposable = cancellationToken.onCancellationRequested(() => resolve([]))
      timeoutId = setTimeout(() => resolve(this.getDiagnostics(uri)), timeout)
      diagnosticChangeDisposable = this.onDidChangeDiagnostics(diagnosticChangeEvent => {
        for (let changedUri of diagnosticChangeEvent.uris)
          if (arePathsEqual(changedUri, uri)) {
            resolve(this.getDiagnostics(uri))
            break
          }
      })
    }).finally(() => {
      cancellationDisposable.dispose()
      diagnosticChangeDisposable.dispose()
      clearTimeout(timeoutId)
    })
  }
}

function unionRanges(ranges) {
  return ranges.map(range => range.range).reduce((union, range) => union.union(range))
}

function isErrorDiagnostic(diagnostic) {
  return diagnostic.severity === VscodeDiagnosticSeverity.Error
}

var IY = handleDefaultExports(CY())

function wrapCodeWithBackticks(code, content) {
  let matches = content.matchAll(/^\s*(```+)/gm),
    backtickCount = Math.max(3, ...Array.from(matches, match => match[1].length + 1)),
    backticks = '`'.repeat(backtickCount)
  return `${backticks}${code}
${content.trim()}
${backticks}`
}

function extractCodeBlocks(content) {
  if (!content) return []
  let tokens = IY.marked.lexer(content)
  return flattenTokens(tokens).filter(token => token.type === 'code')
}

function flattenTokens(tokens) {
  let flattened = []
  for (let token of tokens) {
    if (token.type === 'list') {
      flattened.push(...flattenTokens(token.items.map(item => item.tokens).flat()))
    }
    flattened.push(token)
  }
  return flattened
}

var maxTokenCount = 15
var FixSelectionResolver = class {
  constructor() {
    this.kind = 'fix-selection'
  }
  async resolveContext(serviceProvider, request, cancellationToken) {
    let documentContext = request.documentContext
    if (!documentContext) return
    if (!isLanguageSupported(documentContext.language.languageId)) return contextResolverRegistration.resolveContext(serviceProvider, request, cancellationToken)
    let diagnostic = await getDiagnosticRange(serviceProvider.get(DiagnosticWaiter), request.message, documentContext.document, documentContext.wholeRange),
      endpoint = request.endpoint,
      contextInfo,
      prompts
      isNotebookCell(documentContext.document.uri)
      ? ((contextInfo = await this.generateFixContextInNotebook(serviceProvider, endpoint, documentContext, diagnostic)),
        (prompts = await this.generateFixContextPromptsForNotebook(serviceProvider, endpoint, documentContext, contextInfo)))
      : (({ contextInfo } = await this.generateFixContext(serviceProvider, endpoint, documentContext, diagnostic)), (prompts = this.generateFixContextPrompts(contextInfo)))
    let document = documentContext.document,
      usedContext = [{ uri: document.uri, version: document.version, ranges: filterTruthyValues([contextInfo.range.toRange(), contextInfo.above.toRange(), contextInfo.below.toRange()]) }]
    return { kind: this.kind, userMessages: prompts, usedContext: usedContext, metadata: { expandedRange: diagnostic.range, contextInfo: contextInfo } }
  }
  async generateFixContext(serviceProvider, endpoint, documentContext, diagnostic) {
    let maxTokenWindow = (endpoint.modelMaxTokenWindow * 4) / 3,
      characterCounter = new CharacterCounter(maxTokenWindow),
      document = documentContext.document,
      language = documentContext.language,
      rangeBlock = new CodeBlock(characterCounter, document, language, 'ed8c6549bwf9'),
      aboveBlock = new CodeBlock(characterCounter, document, language, 'abpxx6d04wxr'),
      belowBlock = new CodeBlock(characterCounter, document, language, 'be15d9bcejpp'),
      createContextInfo = () => (
        aboveBlock.trim(),
        rangeBlock.trim(),
        belowBlock.trim(),
        { contextInfo: { language: language, above: aboveBlock, range: rangeBlock, below: belowBlock, outlineAbove: '', outlineBelow: '' }, tracker: characterCounter }
      )
    if (!expandRangeToInterest(rangeBlock, diagnostic)) return createContextInfo()
    let lineIndices = {
      aboveLineIndex: diagnostic.rangeOfInterest.start.line - 1,
      belowLineIndex: diagnostic.rangeOfInterest.end.line + 1,
      minimumLineIndex: 0,
      maximumLineIndex: document.lineCount - 1,
    }
    return appendAndPrependLines(lineIndices, aboveBlock, belowBlock), createContextInfo()
  }
  generateFixContextPrompts(contextInfo) {
    let prompts = []
    if (contextInfo.above.hasContent) {
      let prompt = []
      prompt.push('I have the following code above the selection:'),
        prompt.push(...contextInfo.above.generatePrompt(!0)),
        prompts.push(
          prompt.join(`
`)
        )
    }
    if (contextInfo.below.hasContent) {
      let prompt = []
      prompt.push('I have the following code below the selection:'),
        prompt.push(...contextInfo.below.generatePrompt(!0)),
        prompts.push(
          prompt.join(`
`)
        )
    }
    if (contextInfo.range.hasContent) {
      let prompt = []
      prompt.push('I have the following code in the selection:'),
        prompt.push(...contextInfo.range.generatePrompt(!0)),
        prompts.push(
          prompt.join(`
`)
        )
    } else prompts.push('There is no code in the selection.')
    return (
      prompts.push(
        [
          `Only change the code inside of the selection, delimited by markers '${contextInfo.range.startMarker}' and '${contextInfo.range.endMarker}'. The code block with the suggested changes should also contain the markers.`,
        ].join(`
`)
      ),
      prompts
    )
  }
  async generateFixContextInNotebook(serviceProvider, endpoint, documentContext, diagnostic) {
    let { contextInfo, tracker } = await this.generateFixContext(serviceProvider, endpoint, documentContext, diagnostic)
    return processNotebookCells(serviceProvider.get(WorkspaceClass), documentContext, contextInfo, tracker)
  }
  async generateFixContextPromptsForNotebook(serviceProvider, endpoint, documentContext, contextInfo) {
    let renderOptions = { ...contextInfo, documentContext: documentContext, includeDelimeters: true },
      { messages: renderedMessages } = await renderWithMetadata(serviceProvider, endpoint, NotebookRenderer, renderOptions)
    return renderedMessages.map(message => message.content)
  }
}
var fixSelectionResolver = ContextResolverRegistry.register(new FixSelectionResolver())

function expandRangeToInterest(textEditor, rangeInfo) {
  let currentRange = rangeInfo.range,
    rangeOfInterest = rangeInfo.rangeOfInterest,
    middleLine = Math.floor((currentRange.start.line + currentRange.end.line) / 2),
    maxDistance = Math.max(middleLine - rangeOfInterest.start.line, rangeOfInterest.end.line - middleLine);

  textEditor.appendLine(middleLine);

  for (let distance = 1; distance <= maxDistance; distance++) {
    let lineAbove = middleLine - distance,
      lineBelow = middleLine + distance;

    if ((lineAbove >= rangeOfInterest.start.line && !textEditor.prependLine(lineAbove)) ||
        (lineBelow <= rangeOfInterest.end.line && !textEditor.appendLine(lineBelow)))
      return false;
  }

  return true;
}

async function getDiagnosticRange(textEditor, filterMessages, document, maxTokenCount) {
  let filteredDiagnostics = await filterDiagnostics(textEditor.getDiagnostics(document.uri), filterMessages, maxTokenCount),
    rangeOfInterest = isLanguageSupported(document.languageId) ?
                      await getRangeOfInterest(filteredDiagnostics, document, maxTokenCount) :
                      filteredDiagnostics.range;

  return { range: filteredDiagnostics.range, rangeOfInterest: rangeOfInterest };
}

async function filterDiagnostics(diagnostics, filterMessages, range) {
  let intersectingDiagnostics = diagnostics.filter(diagnostic => !!diagnostic.range.intersection(range));

  if (filterMessages) {
    let matchingDiagnostics = intersectingDiagnostics.filter(diagnostic => filterMessages.includes(diagnostic.message));
    intersectingDiagnostics = matchingDiagnostics.length > 0 ? matchingDiagnostics : intersectingDiagnostics;
  }

  return { range: intersectingDiagnostics.length > 0 ? unionRanges(intersectingDiagnostics) : range,
           diagnostics: intersectingDiagnostics };
}

async function getRangeOfInterest(diagnostic, document, maxTokenCount) {
  let diagnosticRange = diagnostic.range,
    lines = convertRangeToLines(diagnosticRange),
    maxLines = Math.max(maxTokenCount, diagnosticRange.end.line - diagnosticRange.start.line + maxTokenCount),
    fixSelection = await getFixSelectionOfInterest(document.languageId, document.getText(), lines, maxLines);

  return convertLinesToRange(fixSelection);
}

function convertRangeToLines(range) {
  return {
    startPosition: { row: range.start.line, column: range.start.character },
    endPosition: { row: range.end.line, column: range.end.character },
  };
}

function convertLinesToRange(lines) {
  return new VscodeRange(lines.startPosition.row, lines.startPosition.column, lines.endPosition.row, lines.endPosition.column);
}

var DiagnosticResolver = class {
  constructor() {
    this.kind = 'diagnostics';
    this.metaContextResolverInfo = { description: 'Diagnostics in the active editor.' };
  }
  async resolveContext(serviceProvider, context, unused) {
    let documentContext = context.documentContext;
    if (!documentContext) return;
    let { diagnostics } = await filterDiagnostics(serviceProvider.get(DiagnosticWaiter).getDiagnostics(documentContext.document.uri), context.message, documentContext.wholeRange),
      userMessages = await this.getDiagnosticsContextPrompts(serviceProvider.get(WorkspaceClass), diagnostics, documentContext.document);
    return { kind: this.kind, userMessages: userMessages };
  }
  async getRelatedInfo(serviceProvider, diagnostic) {
    if (diagnostic.relatedInformation) {
      let relatedInfo = [];
      for (let info of diagnostic.relatedInformation)
        try {
          let location = info.location,
            document = await serviceProvider.openTextDocument(location.uri),
            range = location.range,
            isSupported = isLanguageSupported(document.languageId),
            lines = convertRangeToLines(range),
            parentScope = isSupported ? await getCoarseParentScope(document.languageId, document.getText(), lines) : lines,
            text = document.getText(convertLinesToRange(parentScope));
          relatedInfo.push(wrapCodeWithBackticks('', text));
        } catch {}
      return relatedInfo.join('\n');
    }
  }
  async getDiagnosticsContextPrompts(serviceProvider, diagnostics, document) {
    let prompts = [];
    if (diagnostics.length > 0) {
      let source = diagnostics[0].source;
      prompts.push(`The code has the following ${source ? source + ' ' : ''}problems`);
      for (let i = 0; i < diagnostics.length; i++) {
        prompts.push(`Problem ${i + 1}:`);
        let diagnostic = diagnostics[i],
          code = document.getText(new VscodeRange(diagnostic.range.start.line, 0, diagnostic.range.end.line + 1, 0)).trim();
        if (code.length > 0 && code.length < 200) {
          prompts.push('This code', wrapCodeWithBackticks('', code), 'has the problem reported:');
          prompts.push(wrapCodeWithBackticks('', `${diagnostic.message}`));
          let relatedInfo = await this.getRelatedInfo(serviceProvider, diagnostic);
          if (relatedInfo) {
            prompts.push('This diagnostic has some related code:', `${relatedInfo}`);
          }
        }
      }
    }
    return prompts.length > 0 ? [prompts.join('\n')] : [];
  }
  },
  diagnosticResolver = ContextResolverRegistry.register(new DiagnosticResolver())
var EmbeddingsComputer = createServiceIdentifier('IEmbeddingsComputer')
var similarityThreshold = 0.72;

// Search function that returns the most matching embeddings
function searchEmbeddings(queryVector, embeddings, numResults, threshold = similarityThreshold) {
  return embeddings
    .flatMap(embedding => {
      let maxScore = 0;
      for (let vector of queryVector) {
        let score = embedding.embedding.reduce((sum, value, index) => sum + value * vector[index], 0);
        maxScore = Math.max(maxScore, score);
      }
      return { score: maxScore, item: embedding };
    })
    .filter(item => item.score > threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, numResults)
    .map(item => item.item);
}

// Function that calculates the cosine similarity between two vectors
function cosineSimilarity(vector1, vector2) {
  let dotProduct = vector1.reduce((sum, value, index) => sum + value * vector2[index], 0),
    magnitude1 = Math.sqrt(vector1.reduce((sum, value) => sum + value * value, 0)),
    magnitude2 = Math.sqrt(vector2.reduce((sum, value) => sum + value * value, 0));
  return dotProduct / (magnitude1 * magnitude2);
}

var CacheManager = class {
  constructor(accessor, cacheType, cacheKey, cacheVersion) {
    this.accessor = accessor;
    this.cacheType = cacheType;
    this.cacheKey = cacheKey;
    this.cacheVersion = cacheVersion;
    this.cacheVersionKey = `${cacheKey}-version`;
    this.fileSystem = accessor.get(BaseFileSystemOperations);
  }
  get cacheStorageUri() {
    return this.cacheType === 2 ? this.accessor.get(extensionContext).storageUri : this.accessor.get(extensionContext).globalStorageUri;
  }
  get cacheVersionMementoStorage() {
    return this.cacheType === 2 ? this.accessor.get(extensionContext).workspaceState : this.accessor.get(extensionContext).globalState;
  }
  async updateCache(data) {
    if (!this.cacheStorageUri || !this.fileSystem.isWritableFileSystem(this.cacheStorageUri.scheme)) return;
    try {
      await this.fileSystem.stat(this.cacheStorageUri);
    } catch {
      await this.fileSystem.createDirectory(this.cacheStorageUri);
    }
    await this.cacheVersionMementoStorage.update(this.cacheVersionKey, this.cacheVersion);
    if (this.cacheVersionMementoStorage.get(this.cacheKey)) {
      await this.cacheVersionMementoStorage.update(this.cacheKey, undefined);
    }
    let cacheFilePath = Uri.joinPath(this.cacheStorageUri, `${this.cacheKey}.json`);
    try {
      if (data === undefined) {
        await this.fileSystem.delete(cacheFilePath, { useTrash: false });
      } else {
        await this.fileSystem.writeFile(cacheFilePath, Buffer.from(JSON.stringify(data)));
      }
    } catch {
      if (data !== undefined) {
        console.error(`Failed to write cache to ${cacheFilePath}`);
      }
    }
  }
  async getCache() {
    if (!this.cacheStorageUri || this.cacheVersionMementoStorage.get(this.cacheVersionKey) !== this.cacheVersion) return;
    try {
      let cacheData = await this.fileSystem.readFile(Uri.joinPath(this.cacheStorageUri, `${this.cacheKey}.json`));
      return JSON.parse(cacheData.toString());
    } catch {
      return;
    }
  }
  async clearCache() {
    return this.updateCache(undefined);
  }
}
var RemoteCacheManager = class extends CacheManager {
  constructor(accessor, cacheType, cacheKey, cacheVersion, remotePath) {
    super(accessor, cacheType, cacheKey, cacheVersion);
    this.fetcher = accessor.get(ConnectionSettings);
    this.remoteCacheVersionKey = `${cacheKey}-version-remote`;
    this.remoteCacheURL = RemoteCacheManager.calculateRemoteCDNURL(remotePath, cacheVersion);
    this.remoteCacheLatestUpdateURL = RemoteCacheManager.calculateRemoteCDNLatestURL(remotePath, cacheVersion);
  }
  async fetchRemoteCache() {
    if (this._remoteCache) return this._remoteCache;
    try {
      let response = await this.fetcher.fetch(this.remoteCacheURL, { method: 'GET' });
      if (response.ok) {
        this._remoteCache = await response.json();
        return this._remoteCache;
      }
      console.error(`Failed to fetch remote cache from ${this.remoteCacheURL}`);
    } catch {
      console.error(`Failed to fetch remote cache from ${this.remoteCacheURL}`);
    }
  }
  async fetchRemoteCacheLatest() {
    try {
      let response = await this.fetcher.fetch(this.remoteCacheLatestUpdateURL, { method: 'GET' });
      if (response.ok) return response.text();
      console.error(`Failed to fetch remote cache from ${this.remoteCacheLatestUpdateURL}`);
    } catch {
      console.error(`Failed to fetch remote cache from ${this.remoteCacheLatestUpdateURL}`);
    }
  }
  async getCache() {
    let latestVersion = await this.fetchRemoteCacheLatest();
    let cache = await super.getCache();
    if (cache && latestVersion === this.cacheVersionMementoStorage.get(this.remoteCacheVersionKey)) return cache;
    let remoteCache = await this.fetchRemoteCache();
    await this.cacheVersionMementoStorage.update(this.remoteCacheVersionKey, latestVersion);
    await this.updateCache(remoteCache);
    return remoteCache;
  }
  async updateCache(data, forceUpdate) {
    if (data === undefined) return super.updateCache(data);
    if (!(await super.getCache()) || forceUpdate) return super.updateCache(data);
  }
  static calculateRemoteCDNURL(remotePath, version) {
    return `https://embeddings.vscode-cdn.net/embeddings/v${version}/${remotePath}/core.json`;
  }
  static calculateRemoteCDNLatestURL(remotePath, version) {
    return `https://embeddings.vscode-cdn.net/embeddings/v${version}/${remotePath}/latest.txt`;
  }
}
var ExtensionCacheManager = class extends RemoteCacheManager {
  constructor(accessor, cacheType, cacheKey, cacheVersion, remotePath) {
    super(accessor, cacheType, cacheKey, cacheVersion, remotePath);
    this._wasRemoteExtensionCacheUpdated = false;
    this.baseExtensionCDNURL = ExtensionCacheManager.calculateBaseRemoteExtensionCDNURL(remotePath, cacheVersion);
  }
  constructExposedCache() {
    if (!this._remoteExtensionCache) return;
    let cache = { ...this._remoteExtensionCache.core };
    for (let extension in this._remoteExtensionCache.extensions) {
      let extensionData = this._remoteExtensionCache.extensions[extension];
      for (let key in extensionData) cache[key] = extensionData[key];
    }
    return cache;
  }
  async fetchRemoteExtensionCache(extensionId) {
    let url = `${this.baseExtensionCDNURL}/${extensionId}.json`;
    try {
      let response = await this.fetcher.fetch(url, { method: 'GET' });
      if (response.ok) return await response.json();
      if (response.status === 404) return {};
      console.error(`Failed to fetch remote cache from ${url}`);
    } catch {
      console.error(`Failed to fetch remote cache from ${url}`);
    }
  }
  async getCache() {
    let cache = await super.getCache();
    if (cache === undefined) return;
    let newCache = { core: {}, extensions: {} };
    cache && ExtensionCacheManager.isEmbeddingsCacheEntriesWithExtensions(cache) ? (newCache = cache) : (newCache = { core: cache, extensions: {} });
    let installedExtensions = ExtensionCacheManager.getInstalledExtensionIds(this.accessor);
    let wasUpdated = false;
    for (let extension in newCache.extensions) {
      if (!installedExtensions.includes(extension)) {
        delete newCache.extensions[extension];
        wasUpdated = true;
      }
    }
    let missingExtensions = installedExtensions.filter(extension => !(extension in newCache.extensions) || newCache.extensions[extension] === undefined);
    for (let extension of missingExtensions) {
      let extensionData = await this.fetchRemoteExtensionCache(extension);
      if (extensionData) newCache.extensions[extension] = extensionData;
    }
    this._remoteExtensionCache = newCache;
    this._wasRemoteExtensionCacheUpdated = missingExtensions.length > 0 || wasUpdated;
    return this.constructExposedCache();
  }
  async updateCache(data, forceUpdate) {
    let updatedCache = data
      ? super.updateCache(this._remoteExtensionCache, forceUpdate || this._wasRemoteExtensionCacheUpdated)
      : super.updateCache(data, forceUpdate || this._wasRemoteExtensionCacheUpdated);
    this._wasRemoteExtensionCacheUpdated = false;
    return updatedCache;
  }
  static isEmbeddingsCacheEntriesWithExtensions(cache) {
    return 'core' in cache && 'extensions' in cache;
  }
  static getInstalledExtensionIds(accessor) {
    return accessor
      .get(BaseVSCodeInfoProvider)
      .getAllExtensions()
      .filter(extension => !extension.id.startsWith('vscode'))
      .map(extension => extension.id);
  }
  static calculateBaseRemoteExtensionCDNURL(remotePath, version) {
    return `https://embeddings.vscode-cdn.net/embeddings/v${version}/${remotePath}`;
  }
};
var EmbeddingsManager = class {
  constructor(loggerManager, cacheType, cacheKey, cacheVersion, embeddingsComputer, cacheConfig) {
    this.cacheKey = cacheKey;
    this.embeddingsComputer = embeddingsComputer;
    this._isIndexLoaded = false;
    this._logger = loggerManager.get(LoggerManager).getPromptResponseLogger(loggerManager);
    this._items = new Map();

    if (cacheConfig?.type && !cacheConfig.supportsExtensions) {
      this._embeddingsCache = new RemoteCacheManager(loggerManager, cacheType, cacheKey, cacheVersion, cacheConfig.type);
    } else if (cacheConfig?.type && cacheConfig.supportsExtensions) {
      this._embeddingsCache = new ExtensionCacheManager(loggerManager, cacheType, cacheKey, cacheVersion, cacheConfig.type);
    } else {
      this._embeddingsCache = new CacheManager(loggerManager, cacheType, cacheKey, cacheVersion);
    }
  }

  get isIndexLoaded() {
    return this._isIndexLoaded;
  }

  set isIndexLoaded(value) {
    this._isIndexLoaded = value;
  }

  async rebuildCache() {
    await this._embeddingsCache.clearCache();
    this._items.clear();
    return this.calculateEmbeddings();
  }

  nClosestValues(queryVector, numResults) {
    let items = Array.from(this._items.values()).map(item => {
      if (!item.embedding) return { item: item, similarity: 0 };
      let similarity = cosineSimilarity(queryVector, item.embedding);
      return { item: item, similarity: similarity };
    });

    items = items.filter(item => item.similarity > 0);
    items.sort((a, b) => b.similarity - a.similarity);
    return items.slice(0, numResults).map(item => item.item);
  }

  hasItem(key) {
    return this._items.has(key);
  }

  getItem(key) {
    return this._items.get(key);
  }

  async calculateEmbeddings() {
    if (this._calculationPromise) return this._calculationPromise;

    this._calculationPromise = this._calculateEmbeddings();
    this._calculationPromise.then(() => (this._calculationPromise = undefined));
    return this._calculationPromise;
  }

  async _calculateEmbeddings() {
    let startTime = Date.now();
    let latestItems = await this.getLatestItems();
    let cache = await this._embeddingsCache.getCache();
    let newItems = new Map();

    for (let item of latestItems) {
      let newItem = item;
      let existingItem = this._items.get(item.key);

      if (existingItem?.embedding) {
        newItem = existingItem;
      } else if (cache && cache[item.key]) {
        newItem = { ...item, ...cache[item.key] };
      }

      newItems.set(item.key, newItem);
    }

    this._items = newItems;
    await this._embeddingsCache.updateCache(cache);
    this._logger.debug(`Embeddings for ${this.cacheKey} calculated in ${Date.now() - startTime}ms`);
    this.isIndexLoaded = true;
  }

  async fetchEmbeddingsForItems(items) {
    return this.embeddingsComputer.computeEmbeddings(
      items.map(item => this.getEmbeddingQueryString(item)),
      undefined
    );
  }
};
function getMajorMinorVersion(versionString) {
  let versionParts = versionString.split('.')
  return `${versionParts[0]}.${versionParts[1]}`
}
var APIEmbeddingsManager = class {
  constructor(buildInfo) {
    let version = getMajorMinorVersion(buildInfo.get(BuildInfo).getEditorInfo().version)
    this.embeddingsCache = new RemoteCacheManager(buildInfo, 1, 'api', version, 'api')
  }

  async updateIndex() {
    this.apiChunks = await this.embeddingsCache.getCache()
  }

  nClosestValues(queryVector, numResults, minSimilarity = 0) {
    if (!this.apiChunks) return []
    let items = this.apiChunks.map(chunk => {
      if (!chunk.embedding) return { text: chunk.text, similarity: 0 }
      let similarity = cosineSimilarity(queryVector, chunk.embedding)
      return { text: this.toContextString(chunk), similarity: similarity }
    })

    items = items.filter(item => item.similarity > minSimilarity)
    items.sort((a, b) => b.similarity - a.similarity)
    return items.slice(0, numResults).map(item => item.text)
  }

  toContextString(chunk) {
    if (chunk.type === 'code') {
      return `Snippet from vscode.d.ts:\n${wrapCodeWithBackticks(chunk.lang, chunk.text)}`
    } else if (chunk.type === 'command') {
      return `${chunk.text}`
    } else if (chunk.type === 'documentationCodeBlock') {
      return `Example code from documentation:\n${wrapCodeWithBackticks(chunk.lang, chunk.text)}`
    } else {
      return ''
    }
  }
}
var ExtensionAPIContextResolver = class {
  constructor() {
    this.kind = 'extension-api'
  }

  async resolveContext(serviceProvider, request, cancellationToken) {
    this.embeddingComputer = this.embeddingComputer ?? serviceProvider.get(EmbeddingsComputer)
    let message = request.message

    if (!message || cancellationToken.isCancellationRequested) return

    this.apiEmbeddingsIndex = this.apiEmbeddingsIndex || new APIEmbeddingsManager(serviceProvider)
    await this.apiEmbeddingsIndex.updateIndex()

    let embeddings = await this.embeddingComputer?.computeEmbeddings([message], cancellationToken)

    if (!cancellationToken.isCancellationRequested && embeddings && embeddings.length > 0) {
      let closestValues = this.apiEmbeddingsIndex.nClosestValues(embeddings[0], 5, 0.7)
      if (closestValues.length) {
        let userMessage = [
          'Below are some potentially relevant code samples related to VS Code extension development. You may use information from these samples to help you answer the question if you believe it is relevant:',
          closestValues.join(`\n\n`),
        ].join(`\n`)
        return { kind: this.kind, userMessages: [userMessage] }
      }
    }
  }
}
var extensionAPIContextResolver = ContextResolverRegistry.register(new ExtensionAPIContextResolver())
var ExtensionEmbeddingsManager = class {
  constructor(buildInfo) {
    let version = getMajorMinorVersion(buildInfo.get(BuildInfo).getEditorInfo().version)
    this.embeddingsCache = new RemoteCacheManager(buildInfo, 1, 'extensionEmbeddings', version, 'extensions')
  }

  async updateIndex() {
    this._embeddings = await this.embeddingsCache.getCache()
  }

  nClosestValues(queryVector, numResults, minSimilarity = 0) {
    if (!this._embeddings) return []
    let items = Object.entries(this._embeddings).map(([key, value]) => {
      if (!value.embedding) return { key: `${value.name}(${key})`, similarity: 0 }
      let similarity = cosineSimilarity(queryVector, value.embedding)
      return { key: `${value.name}(${key})`, similarity: similarity }
    })

    items = items.filter(item => item.similarity > minSimilarity)
    items.sort((a, b) => b.similarity - a.similarity)
    return items.slice(0, numResults).map(item => item.key)
  }
}
var extensionInstructions = `
The current question is related to VS Code extensions. The application is currently open.
If an extension is not a valid answer, but it still relates to VS Code, please still respond.
Please do not guess a response and instead just respond with a polite apology if you are unsure.
If you believe the given context given to you is incorrect or not relevant you may ignore it.
At the end of your response, you must include a section wrapped with [COMMANDS START] and [COMMANDS END] that lists all extension IDs you referenced in your response.
The user cannot see the context you are given, so you must not mention it. If you want to refer to it, you must include it in your reply.
`.trimStart()
var ExtensionContextResolver = class {
  constructor() {
    this.kind = 'extensions'
  }

  async resolveContext(serviceProvider, request, cancellationToken) {
    let userMessage = extensionInstructions + `\n`

    this.embeddingComputer = this.embeddingComputer ?? serviceProvider.get(EmbeddingsComputer)
    let message = request.message

    if (!message || cancellationToken.isCancellationRequested) return

    this.extensionsIndex = this.extensionsIndex || new ExtensionEmbeddingsManager(serviceProvider)
    await this.extensionsIndex.updateIndex()

    let embeddings = await this.embeddingComputer?.computeEmbeddings([message], cancellationToken)

    if (!cancellationToken.isCancellationRequested && embeddings && embeddings.length > 0) {
      let closestValues = this.extensionsIndex.nClosestValues(embeddings[0], 5)
      if (closestValues.length) {
        userMessage += `Here are some possible extensions:\n`
        userMessage += closestValues.join(`\n\n`)
        return {
          kind: this.kind,
          userMessages: [
            `Relevant information about extensions for VS Code:\n` + userMessage,
          ],
        }
      }
    }
  }
}

var Lot = ContextResolverRegistry.register(new ExtensionContextResolver())
var path = handleDefaultExports(require('path'))
var BaseGitRepositoryManager = class {}
var GitMetadataContextResolver = class {
  constructor() {
    this.kind = 'git-metadata'
    this.variableInfo = { name: 'git', description: 'Information about the current git repository' }
    this.metaContextResolverInfo = { description: 'Metadata about the current git repository.' }
  }

  async resolveContext(serviceProvider, request, cancellationToken) {
    let workspace = serviceProvider.get(WorkspaceClass)
    let repositories = serviceProvider.get(BaseGitRepositoryManager).repositories
    let workspaceFolders = workspace.getWorkspaceFolders()

    if (!repositories || !workspaceFolders) return

    if (workspaceFolders.length > 1) {
      let documentUri = request.documentContext?.document.uri ?? serviceProvider.get(BaseTabManager).activeTextEditor?.document.uri
      if (documentUri) {
        let workspaceFolder = workspace.getWorkspaceFolder(documentUri)
        if (workspaceFolder) {
          let index = workspaceFolders.findIndex(folder => folder.toString() === workspaceFolder.toString())
          if (index !== -1) {
            repositories = [repositories[index]]
            workspaceFolders = [workspaceFolders[index]]
          }
        }
      }
    }

    let gitMetadata = []
    for (let i = 0; i < repositories.length; i++) {
      if (cancellationToken.isCancellationRequested) return
      let repository = repositories[i]
      let workspaceFolder = workspaceFolders[i]
      if (!repository) continue
      let metadata = []
      metadata.push(`Workspace Folder: ${path.basename(workspaceFolder.path)}`)
      metadata.push('```')
      if (repository.headBranchName) {
        metadata.push(`Current Branch name: ${repository.headBranchName}`)
        metadata.push(`Upstream: ${repository.upstreamBranchName ? repository.upstreamBranchName : 'none'}`)
      } else {
        metadata.push('Detached HEAD?: yes')
      }
      metadata.push(`Is currently rebasing?: ${repository.isRebasing ? 'yes' : 'no'}`)
      metadata.push(`Remotes: ${(repository.remotes ?? []).join(', ')}`)
      metadata.push('```')
      gitMetadata.push(metadata.join(`\n`))
    }

    return {
      kind: this.kind,
      userMessages: [
        `Metadata about the current git repository:\n` + gitMetadata.join(`\n`),
      ],
    }
  }
}
var gitMetadataContextResolver = ContextResolverRegistry.register(new GitMetadataContextResolver())
var BaseTerminalInfoProvider = class extends Disposable {}
var TerminalBufferResolver = class {
  constructor() {
    this.kind = 'terminal-buffer';
    this.variableInfo = { name: 'terminalBuffer', description: "The active terminal's buffer", defaultEnablement: false };
    this.metaContextResolverInfo = { description: "The active terminal's buffer." };
  }
  async resolveContext(serviceProvider) {
    let terminalBuffer = serviceProvider.get(BaseTerminalInfoProvider).terminalBuffer;
    return {
      kind: this.kind,
      userMessages: [
        `The active terminal's buffer:\n` + terminalBuffer,
      ],
    };
  }
};
var terminalBufferResolver = ContextResolverRegistry.register(new TerminalBufferResolver())
var TerminalLastCommandResolver = class {
  constructor() {
    this.kind = 'terminal-last-command';
    this.variableInfo = {
      name: 'terminalLastCommand',
      description: "The active terminal's last run command",
      defaultEnablement: true,
    };
    this.metaContextResolverInfo = { description: "The active terminal's last run command." };
  }
  async resolveContext(serviceProvider) {
    let lastCommand = serviceProvider.get(BaseTerminalInfoProvider).terminalLastCommand;
    if (!lastCommand) return;
    let messages = [];
    if (lastCommand.commandLine) {
      messages.push('The following is the last command run in the terminal:');
      messages.push(lastCommand.commandLine);
    }
    if (lastCommand.cwd) {
      messages.push('It was run in the directory:');
      messages.push(typeof lastCommand.cwd == 'object' ? lastCommand.cwd.toString() : lastCommand.cwd);
    }
    if (lastCommand.output) {
      messages.push('It has the following output:');
      messages.push(lastCommand.output);
    }
    let formattedMessages = messages.join('\n');
    return {
      kind: this.kind,
      userMessages: [
        `The active terminal's last run command:\n` + formattedMessages,
      ],
    };
  }
};
var terminalLastCommandResolver = ContextResolverRegistry.register(new TerminalLastCommandResolver())
var TerminalSelectionResolver = class {
  constructor() {
    this.kind = 'terminal-selection';
    this.variableInfo = {
      name: 'terminalSelection',
      description: "The active terminal's selection",
      defaultEnablement: true,
    };
    this.metaContextResolverInfo = { description: "The active terminal's selection." };
  }
  async resolveContext(serviceProvider) {
    let terminalSelection = serviceProvider.get(BaseTerminalInfoProvider).terminalSelection;
    return {
      kind: this.kind,
      userMessages: [
        `The active terminal's selection:\n` + terminalSelection,
      ],
    };
  }
};
var terminalSelectionResolver = ContextResolverRegistry.register(new TerminalSelectionResolver())
var TerminalShellTypeResolver = class {
  constructor() {
    this.kind = 'terminal-shell-type';
    this.variableInfo = { name: 'terminalShellType' };
  }
  async resolveContext(serviceProvider) {
    let terminalShellType = serviceProvider.get(BaseTerminalInfoProvider).terminalShellType;
    return {
      kind: this.kind,
      userMessages: [
        `The active terminal's shell type:\n` + terminalShellType,
      ],
    };
  }
};
var terminalShellTypeResolver = ContextResolverRegistry.register(new TerminalShellTypeResolver())
var requestLight = handleDefaultExports(requestLight())
var util = handleDefaultExports(require('util'))
var ExperimentationServiceIdentifier = createServiceIdentifier('IExperimentationService'),
  ExperimentationService = class {
    constructor() {
      this.initializePromise = Promise.resolve()
      this.initialFetch = Promise.resolve()
    }
    isFlightEnabled(feature) {
      return false
    }
    isCachedFlightEnabled(feature) {
      return Promise.resolve(false)
    }
    isFlightEnabledAsync(feature) {
      return Promise.resolve(false)
    }
    getTreatmentVariable(feature, variable) {}
    getTreatmentVariableAsync(feature, variable) {
      return Promise.resolve(undefined)
    }
  }
var EnvironmentFlags = class Flags {
  constructor(flags) {
    this.flags = flags
  }
  static fromEnvironment(environment) {
    return new Flags({
      debug: isDebugMode(process.argv, process.env),
      telemetryLogging: isTelemetryLogging(process.env),
      testMode: environment,
      recordInput: isRecordMode(process.argv, process.env),
    })
  }
}
function isTestMode(context) {
  return context.get(EnvironmentFlags).flags.testMode
}
function isDebugMode(args, env) {
  return args.includes('--debug') || isFlagEnabled(env, 'GITHUB_COPILOT_DEBUG')
}
function isTelemetryLogging(env) {
  return isFlagEnabled(env, 'COPILOT_LOG_TELEMETRY')
}
function isRecordMode(args, env) {
  return args.includes('--record') || isFlagEnabled(env, 'GITHUB_COPILOT_RECORD')
}
function isFlagEnabled(env, flag) {
  if (flag in env) {
    let value = env[flag]
    return value === '1' || value?.toLowerCase() === 'true'
  }
  return false
}
async function getProxyUrl(context) {
  let configManager = context.get(ConfigManager),
    testOverrideUrl = configManager.getConfig(settings.DebugTestOverrideProxyUrl)
  return isTestMode(context) && testOverrideUrl.length > 0 ? testOverrideUrl : configManager.getConfig(settings.DebugChatOverrideProxyUrl) ?? configManager.getConfig(settings.DebugOverrideProxyUrl)
}
async function getApiUrl(context, path) {
  let url = await getProxyUrl(context)
  return url.length === 0 ? ((url = 'https://api.githubcopilot.com'), `${url}${path}`) : url
}
async function getChatUrl(context) {
  return getApiUrl(context, '/chat')
}
async function getEmbeddingsUrl(t) {
  return 'https://api.githubcopilot.com/embeddings'
}
async function getChatEndpointInfo(context, type, action, model) {
  let experimentationService = context.get(IExperimentationService),
    modelType
  if (model) modelType = model
  else if (type === 2) (await experimentationService.getTreatmentVariableAsync('vscode', 'copilotchat.panelGpt4', true)) !== false && (modelType = 'gpt-4')
  else if (type === 1 && action === 'fix') {
    let useGpt4InChat = context.get(ConfigManager).getConfig(settings.FixUseGPT4InInlineChat)
    ;((await experimentationService.getTreatmentVariableAsync('vscode', 'copilotchat.fixInlineGpt4', true)) || useGpt4InChat) && (modelType = 'gpt-4')
  }
  return context.get(EndpointManager).getChatEndpointInfo(modelType)
}
async function getDefaultChatEndpointInfo(context) {
  return context.get(EndpointManager).getChatEndpointInfo(undefined)
}
async function getMaxTokenNum(context, model) {
  let tokenHandler = await context.get(BaseTokenHandler).getCopilotToken(context),
    maxTokenNum = tokenHandler.isInternal ? context.get(ConfigManager).getConfig(settings.DebugOverrideChatMaxTokenNum) : 0
  if (maxTokenNum > 0) return maxTokenNum
  let gpt4Context = await context.get(IExperimentationService).getTreatmentVariableAsync('vscode', 'copilotchat.panelGpt4Context', true)
  switch (model) {
    case 'gpt-3.5-turbo':
      return 8192
    case 'gpt-4':
      return gpt4Context || 4096
    default:
      return 8192
  }
}
var EndpointManager = class {
  constructor(accessor) {
    this.accessor = accessor
    this._chatEndpoints = new Map()
  }
  async getChatEndpointInfo(model) {
    let isInternal = (await this.accessor.get(BaseTokenHandler).getCopilotToken(this.accessor)).isInternal
    this._defaultModel ??= isInternal ? this.accessor.get(ConfigManager).getConfig(settings.DebugOverrideChatEngine) : 'gpt-3.5-turbo'
    let selectedModel = model ?? this._defaultModel,
      endpointInfo = this._chatEndpoints.get(selectedModel)
    if (endpointInfo) return endpointInfo
    let chatUrl = await getChatUrl(this.accessor),
      maxTokenNum = await getMaxTokenNum(this.accessor, selectedModel),
      disableSnippy = await this.shouldDisableSnippy()
    return (endpointInfo = new EngineService(chatUrl, 'completions', selectedModel, maxTokenNum, disableSnippy)), this._chatEndpoints.set(selectedModel, endpointInfo), endpointInfo
  }
  async shouldDisableSnippy() {
    let token = await this.accessor.get(BaseTokenHandler).getCopilotToken(this.accessor),
      isDevelopmentMode = this.accessor.get(extensionContext).extensionMode === VscodeExtensionMode.Development
    return token.isInternal && isDevelopmentMode
  }
  async getEmbeddingsEndpointInfo() {
    if (this._embeddingsEndpoint) return this._embeddingsEndpoint
    let disableSnippy = await this.shouldDisableSnippy(),
      embeddingsUrl = await getEmbeddingsUrl(this.accessor)
    return (this._embeddingsEndpoint = new ChatService(embeddingsUrl, 16, disableSnippy)), this._embeddingsEndpoint
  }
}
var EngineService = class {
    constructor(engineUrl, endpoint, model, maxTokens, disableSnippy) {
      this.engineUrl = engineUrl
      this.endpoint = endpoint
      this.disableSnippy = disableSnippy
      this._maxTokens = maxTokens
      this.model = model
    }
    get modelMaxTokenWindow() {
      return this._maxTokens
    }
    get engineName() {
      let lastPartOfUrl = this.engineUrl.split('/').pop()
      return lastPartOfUrl || this.engineUrl
    }
    get url() {
      return util.format('%s/%s', this.engineUrl, this.endpoint)
    }
    interceptBody(body) {
      if (body && this.disableSnippy) {
        body.snippy = { enabled: false }
        Object.keys(body).forEach(key => {
          if (key.startsWith('intent')) delete body[key]
        })
      }
    }
    getExtraHeaders() {
      let headers = {}
      if (this.disableSnippy) {
        headers['Editor-Plugin-Version'] = 'simulation-tests-plugin/2'
        headers['Editor-Version'] = 'simulation-tests-editor/1.85'
      }
      return {
        'Openai-Organization': 'github-copilot',
        'Copilot-Integration-Id': this.disableSnippy ? 'vscode-chat-dev' : 'vscode-chat',
        ...headers,
      }
    }
  }
var ChatService = class {
  constructor(url, maxBatchSize = 1, isDev) {
    this.url = url
    this.maxBatchSize = maxBatchSize
    this.isDev = isDev
    this.modelMaxTokenWindow = 8192
  }
  getExtraHeaders() {
    return {
      'Openai-Organization': 'github-copilot',
      'Copilot-Integration-Id': this.isDev ? 'vscode-chat-dev' : 'vscode-chat',
    }
  }
}
var requestLight = handleDefaultExports(requestLight()),
path = handleDefaultExports(require('path'))
var requestLight = handleDefaultExports(requestLight())
var MissingRepoOrgError = class extends Error {
  constructor() {
    super(...arguments)
    this.name = 'ERROR_TYPE_MISSING_INACCESSIBLE_REPO_ORG'
  }
}
var EmbeddingsUnavailableError = class extends Error {
  constructor() {
    super(...arguments)
    this.name = 'ERROR_TYPE_DOCS_EMBEDDINGS_UNAVAILABLE'
  }
}
var  MaxRetriesExceededError = class extends Error {
  constructor() {
    super(...arguments)
    this.name = 'ERROR_TYPE_MAX_RETRIES_EXCEEDED'
  }
}
var NoAccessToEndpointError = class extends Error {
  constructor() {
    super(...arguments)
    this.name = 'ERROR_TYPE_NO_ACCESS_TO_ENDPOINT'
  }
}
function createError({ error: errorType, message: errorMessage }) {
  switch (errorType) {
    case 'ERROR_TYPE_MISSING_INACCESSIBLE_REPO_ORG':
      return new MissingRepoOrgError(errorMessage)
    case 'ERROR_TYPE_DOCS_EMBEDDINGS_UNAVAILABLE':
      return new EmbeddingsUnavailableError(errorMessage)
    case 'ERROR_TYPE_MAX_RETRIES_EXCEEDED':
      return new MaxRetriesExceededError(errorMessage)
    case 'ERROR_TYPE_NO_ACCESS_TO_ENDPOINT':
      return new NoAccessToEndpointError(errorMessage)
    default:
      return new Error(errorMessage)
  }
}
function generateSearchQuery(queryParams) {
  let queryParts = [`repo:${queryParams.repo}`]
  if (queryParams.lang) queryParts.push(`(lang:${queryParams.lang.join(' OR lang:')})`)
  if (queryParams.notLang) queryParts.push(`NOT (lang:${queryParams.notLang.join(' OR lang:')})`)
  if (queryParams.path) queryParts.push(`(path:${queryParams.path.join(' OR path:')})`)
  if (queryParams.notPath) queryParts.push(`NOT (path:${queryParams.notPath.join(' OR path:')})`)
  return queryParts.join(' ')
}
function parseGithubUrl(url) {
  url = url.replace(/^git@/, '')
  url = url.replace(/\.git$/, '')
  try {
    let parsedUrl = Uri.parse(url)
    if (parsedUrl.authority !== 'github.com' && parsedUrl.scheme !== 'github.com') return
    return parsedUrl.path.replace(/^\//, '')
  } catch {
    return
  }
}
var SearchClient = class {
  constructor(accessor) {
    this.accessor = accessor
    this._logger = this.accessor.get(LoggerManager).getLogger('CodeOrDocsSearchClient')
    this._configurationService = this.accessor.get(ConfigManager)
  }
  async isAvailable() {
    try {
      this._logger.debug('Trying to use API to see if it is available')
      await this.search('the', { repo: 'microsoft/vscode' }, 1, 0.1, void 0)
      return true
    } catch {
      return false
    }
  }
  async search(query, scope, limit = 6, similarity = 0.766, options) {
    let tokenHandler = this.accessor.get(BaseTokenHandler),
      token = (await tokenHandler.getPermissiveGitHubToken({ silent: true })) ?? (await tokenHandler.getBasicGitHubToken()),
      url = `${this._configurationService.getConfig(settings.AgentsEndpointUrl)}/search/${this.slug}`,
      maxRetries = 5,
      retryCount = 0,
      errorMessages = new Set(),
      error
    while (retryCount < maxRetries) {
      try {
        let requestConfig = {
            url: url,
            modelMaxTokenWindow: 0,
            getExtraHeaders() {
              return { Accept: 'application/json', 'Copilot-Integration-Id': 'vscode-chat' }
            },
          },
          response = await sendRequest(
            this.accessor,
            requestConfig,
            token ?? '',
            void 0,
            generateUUID(),
            { query: query, scopingQuery: generateSearchQuery(scope), similarity: similarity, limit: limit },
            options
          ),
          responseText = await response.text()
        if (response.status === 404 || (response.status === 400 && responseText.includes('unknown integration'))) {
          error = createError({ error: 'ERROR_TYPE_NO_ACCESS_TO_ENDPOINT', message: `${this.slug}: ${responseText}` })
          break
        }
        let parsedResponse
        try {
          parsedResponse = JSON.parse(responseText)
        } catch {
          throw new Error(`Status: ${response.status}. Error: ${responseText}`)
        }
        if (!parsedResponse) {
          this._logger.debug(`[repo:${scope.repo}] Got 0 results from ${this.slug} search for query: ${query}`)
          return []
        }
        if (Array.isArray(parsedResponse)) {
          this._logger.debug(`[repo:${scope.repo}] Got ${parsedResponse.length} results from ${this.slug} search for query: ${query}`)
          return parsedResponse
        }
        this._logger.debug(`[repo:${scope.repo}] Error thrown when querying '${query}': ${responseText}`)
        error = createError(parsedResponse)
        break
      } catch (fetchError) {
        retryCount++
        let delay = retryCount * 1000
        errorMessages.add(`Error fetching ${this.slug} search. ${fetchError.message ?? fetchError}`)
        this._logger.warn(
          `[repo:${scope.repo}] Error fetching ${this.slug} search. Retrying in ${retryCount} seconds. Query: ${query}`
        )
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    if (retryCount >= maxRetries) {
      this._logger.warn(`[repo:${scope.repo}] Max Retry Error thrown while querying '${query}'`)
      error = createError({
        error: 'ERROR_TYPE_MAX_RETRIES_EXCEEDED',
        message: `${this.slug} search timed out after ${maxRetries} retries. ${Array.from(errorMessages).join('\n')}`,
      })
    }
    throw error
  }
},
  CodeSearchClient = class extends SearchClient {
    constructor() {
      super(...arguments)
      this.slug = 'code'
    }
  },
  DocsSearchClient = class extends SearchClient {
    constructor() {
      super(...arguments)
      this.slug = 'docs'
    }
  }
var debounceDelay = 250
function toVscodePosition(position) {
  return new VscodePosition(position.row, position.column)
}
function toVscodeRange(range) {
  return new VscodeRange(toVscodePosition(range.startPosition), toVscodePosition(range.endPosition))
}
function trimTrailingSpaces(text) {
  return text.replace(/\s+$/, '')
}
function truncateText(text, maxLength = 20000) {
  return text.length > maxLength ? text.slice(0, maxLength) : text
}
var TextChunker = class {
  constructor(accessor) {
    this._accessor = accessor
  }
  genericWholeFileChunking({ text, maxTokenLength = debounceDelay, removeEmptyLines = true }) {
    let lines = text.split(/\n/),
      startPos = new VscodePosition(0, 0),
      chunks = [],
      currentLines = [],
      currentTokenCount = 0,
      commonLeadingWhitespace,
      updateCommonLeadingWhitespace = () => {
        let result = this._trimCommonLeadingWhitespace(currentLines)
        commonLeadingWhitespace = result.shortestLeadingCommonWhitespace
        currentLines = result.trimmedLines
      },
      addLine = (line, tokenCount) => {
        currentLines.push(line)
        currentTokenCount += tokenCount
      },
      getTokenCount = () => currentTokenCount,
      createChunk = lineNum => {
        let chunkLines = currentLines.map(
          line =>
            line ||
            `
`
        )
        if (chunkLines.length === 1) chunkLines[0] = chunkLines[0]?.trim()
        else if (chunkLines.length === 0) return
        let endPos = new VscodePosition(lineNum, chunkLines[chunkLines.length - 1].length),
          range = new VscodeRange(startPos, endPos)
        chunks.push({ text: chunkLines.reduce((acc, line) => acc + line, ''), range: range }),
          (currentLines = []),
          (currentTokenCount = 0),
          (startPos = new VscodePosition(endPos.line + 1, 0)),
          (commonLeadingWhitespace = void 0)
      },
      fullRange = new VscodeRange(0, 0, lines.length - 1, lines[lines.length - 1].length)
    this._processLinesIntoChunks(lines, fullRange, maxTokenLength, '', createChunk, updateCommonLeadingWhitespace, addLine, getTokenCount, () => commonLeadingWhitespace, removeEmptyLines)
    if (currentLines) {
      if (commonLeadingWhitespace === void 0) updateCommonLeadingWhitespace()
      createChunk(fullRange.end.line)
    }
    return chunks.filter(chunk => !removeEmptyLines || (chunk.text.length && /[\w\d]{2}/.test(chunk.text)))
  }
  _processLinesIntoChunks(lines, range, maxTokenLength, prefix, createChunk, updateCommonLeadingWhitespace, addLine, getTokenCount, getCommonLeadingWhitespace, removeEmptyLines, isStartOfChunk = () => !1, numTokensInEllipsis = 0) {
    let tokenizer = this._accessor.get(Tokenizer),
      startLine = range.start.line,
      processLine = (line, lineNum) => {
        let remainingTokens = maxTokenLength - (isStartOfChunk() ? numTokensInEllipsis : 0),
          commonLeadingWhitespace = getCommonLeadingWhitespace(),
          trimmedLine = truncateText(line)
        trimmedLine = trimTrailingSpaces(trimmedLine)
        if (commonLeadingWhitespace !== void 0) {
          trimmedLine.startsWith(commonLeadingWhitespace) ? (trimmedLine = prefix + trimmedLine.substring(commonLeadingWhitespace.length)) : createChunk(startLine + lineNum)
        }
        let currentTokenCount = getTokenCount(),
          lineTokenCount = tokenizer.tokenLength(trimmedLine)
        if (currentTokenCount + lineTokenCount > remainingTokens) {
          if (commonLeadingWhitespace === void 0 && updateCommonLeadingWhitespace) {
            updateCommonLeadingWhitespace()
            processLine(trimmedLine, lineNum)
          } else {
            createChunk(startLine + lineNum)
            if (trimmedLine.length) processLine(tokenizer.leadingString(trimmedLine, remainingTokens), lineNum)
          }
        } else if (trimmedLine.length) {
          addLine(
            trimmedLine +
              (lineNum === lines.length - 1
                ? ''
                : `
`),
            lineTokenCount
          )
        }
      },
      remainingLine = ''
    for (let i = 0; i < lines.length; i++) {
      let line = trimTrailingSpaces(lines[i])
      if (line.length === 0 && i !== lines.length - 1) {
        if (!removeEmptyLines) addLine(void 0, 1)
        continue
      }
      processLine(remainingLine + line, i)
      remainingLine = ''
    }
  }
  genericChunking({
    lineRangeText: text,
    maxTokenLength: maxLength = debounceDelay,
    removeEmptyLines: removeEmpty = true,
    extraLineRangeSeparator: extraSeparator = '',
    numTokensInEllipsis: tokensInEllipsis = 0,
  }) {
    let isStartOfChunk = true
    if (maxLength < 0) throw Error('Cannot chunk text, not enough chunk room')
    if (text.length === 0) return []
    let startPos = text[0].range.start,
      chunks = [],
      tokenizer = this._accessor.get(Tokenizer),
      separatorTokenLength = tokenizer.tokenLength(extraSeparator),
      currentLines = [],
      currentTokenCount = 0,
      addLine = (line, tokenCount) => {
        currentLines.push(line), (currentTokenCount += tokenCount)
      },
      getTokenCount = () => currentTokenCount,
      createChunk = lineNum => {
        isStartOfChunk = false
        let chunkLines = currentLines.map(
          line =>
            line ||
            `
`
        )
        if (chunkLines.length === 0) {
          currentLines = [], currentTokenCount = 0
          return
        }
        let endPos = new VscodePosition(lineNum, chunkLines[chunkLines.length - 1].length),
          range = new VscodeRange(startPos, endPos)
        chunks.push({ text: trimTrailingSpaces(chunkLines.reduce((acc, line) => acc + line, '')), range: range }),
          (currentLines = []),
          (currentTokenCount = 0),
          chunkLines[chunkLines.length - 1].endsWith(`
`)
            ? (startPos = new VscodePosition(endPos.line + 1, 0))
            : (startPos = new VscodePosition(endPos.line, chunkLines[chunkLines.length - 1].length))
      }
    for (let i = 0; i < text.length; i++) {
      let lineRange = text[i]
      if (currentTokenCount > 0 && i > 0) {
        let remainingTokens = maxLength - currentTokenCount
        lineRange.text.length > 2e4 || tokenizer.tokenLength(lineRange.text) > remainingTokens ? (addLine(extraSeparator, separatorTokenLength), createChunk(text[i - 1].range.end.line)) : separatorTokenLength > 0 && addLine(extraSeparator, separatorTokenLength)
      }
      this._processLinesIntoChunks(
        lineRange.text.split(/\n/),
        lineRange.range,
        maxLength,
        '',
        createChunk,
        void 0,
        addLine,
        getTokenCount,
        () => {},
        removeEmpty,
        () => isStartOfChunk,
        tokensInEllipsis
      )
    }
    currentLines && createChunk(text[text.length - 1].range.end.line)
    let lastChunk = chunks[chunks.length - 1]
    chunks.pop(),
    this._processLinesIntoChunks(
      lastChunk.text.split(/\n/),
      lastChunk.range,
      maxLength - tokensInEllipsis,
      '',
      createChunk,
      void 0,
      addLine,
      getTokenCount,
      () => {},
      removeEmpty,
      () => isStartOfChunk,
      tokensInEllipsis
    ),
    currentLines && createChunk(text[text.length - 1].range.end.line)
    return chunks.filter(chunk => !removeEmpty || (chunk.text.length && /[^\s]/.test(chunk.text)))
  }
  _trimCommonLeadingWhitespace(lines) {
    let lineInfo = lines.map(line => {
        if (!line) return
        let leadingWhitespaceMatch = line.match(/^\s+/),
          leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[0] : '',
          trimmedLine = line.substring(leadingWhitespace?.length)
        return [leadingWhitespace, trimmedLine]
      }),
      nonEmptyLines = lineInfo.filter(line => !!line),
      commonLeadingWhitespace = this._getCommonLeadingWhitespace(nonEmptyLines) ?? '',
      commonWhitespaceLength = commonLeadingWhitespace.length
    return { trimmedLines: lineInfo.map(line => (line ? line[0].substring(commonWhitespaceLength) + line[1] : void 0)), shortestLeadingCommonWhitespace: commonLeadingWhitespace }
  }
  _getCommonLeadingWhitespace(lines) {
    let commonLeadingWhitespace
    for (let line of lines) {
      if (commonLeadingWhitespace === undefined) {
        commonLeadingWhitespace = line[0]
        continue
      }
      commonLeadingWhitespace = this._commonLeadingStr(commonLeadingWhitespace, line[0])
    }
    return commonLeadingWhitespace ?? ''
  }
  _commonLeadingStr(str1, str2) {
    let shorterStr = str1.length < str2.length ? str1 : str2
    if (shorterStr.length === 0) return ''
    for (let i = 1; i < shorterStr.length; i++)
      if (str1.substring(0, i) !== str2.substring(0, i))
        return shorterStr.substring(0, i - 1)
    return shorterStr
  }
}
var TextParser = class {
  constructor(e, r, n) {
    this._queryTree = e
    this.accessor = r
    this._naiveChunker = new TextChunker(r)
    let i = this.accessor.get(Tokenizer)
    ;(this._inlineComment = n?.blockWrap ?? { start: '', end: '' }),
      (this._elipsisPlaceholder = n?.elipsisPlaceholder ?? '...'),
      (this._lookForIndentInHeader = n?.lookForIndentInHeader ?? !0),
      (this._numTokensInEllipsis = i.tokenLength(this._elipsisPlaceholder) + 1)
  }
  get _summaryPlaceHolder() {
    return this._inlineComment.start + this._elipsisPlaceholder + this._inlineComment.end
  }
  async parse(e, r) {
    let n = await this._queryTree,
      i = this._parseBlocks(n.roots, '', e, r),
      o = i.content.flat(),
      s = i.outline ?? [],
      a = this.createOutlineSummary(
        '',
        '',
        e,
        { text: n.syntaxTreeRoot.text, range: toVscodeRange(n.syntaxTreeRoot) },
        s,
        new VscodeRange(0, 0, n.syntaxTreeRoot.range.endPosition.row, n.syntaxTreeRoot.range.endPosition.column),
        ''
      )
    return a.length === 1 && (a[0] = { ...a[0], isFullFile: !0 }), o.push(...a), o
  }
  _parseBlocks(e, r, n, i) {
    return this._parseSemanticStructure(e, r, n, i, (o, s, a, l) => {
      let c = l + s.text,
        u = () => {
          if (c.trim().length === 0) return { content: { text: [], isFull: !0 } }
          let h
          try {
            h = this._naiveChunker.genericChunking({
              lineRangeText: [{ range: s.range, text: c }],
              maxTokenLength: a,
              numTokensInEllipsis: this._numTokensInEllipsis,
            })
          } catch {
            return { content: { text: [], isFull: !1 }, outline: [] }
          }
          return { content: { text: h, isFull: !0 } }
        }
      if (this.accessor.get(Tokenizer).tokenLength(c) <= a)
        return { content: { text: [{ range: s.range, text: c.replace(/(^\s*\n)|(\n\s*$)/g, '') }], isFull: !0 } }
      if (o.length === 0) return u()
      let d = this._parseBlocks(o, l, a, i),
        f = d.content,
        m = d.outline
      return { content: { text: f, isFull: !1 }, outline: m }
    })
  }
  _parseSemanticStructure(e, r, n, i, o) {
    return { outline: void 0, content: [] }
  }
  _createOutlineBody(e, r, n) {
    let i = (n + e.text).split(`
`),
      o = e.range.start,
      s = [],
      a = o,
      l = d => {
        let f = d.line - o.line,
          m = d.character
        return o.line === d.line && (m = d.character - o.character), new VscodePosition(f, m)
      },
      c = d => {
        let f = d.character === i[d.line - o.line].length - 1
        return { newPosition: new VscodePosition(d.line, d.character + 1), isNewLine: f }
      },
      u = (d, f) => {
        let m = [],
          h = l(d),
          g = l(f),
          v = i[h.line].substring(h.character)
        if (h.line === g.line) {
          let y = v.substring(0, g.character - h.character),
            b = c(f)
          ;(a = b.newPosition),
            b.isNewLine &&
              (y += `
`),
            m.push(y)
        } else {
          let y = i[g.line].substring(0, g.character)
          y = y.replace(new RegExp(`${n}$`), '')
          let b = c(f)
          ;(a = b.newPosition),
            b.isNewLine &&
              (y += `
`),
            m.push(
              v +
                `
`
            )
          for (let x = h.line + 1; x < g.line; x++)
            m.push(
              i[x] +
                `
`
            )
          m.push(y)
        }
        let _ = m.join('')
        s.push({ text: _.replace(/(^\s+\n)/, ''), range: new VscodeRange(d, f) })
      },
      p = d => {
        s.push({
          text:
            d.summary +
            `

`,
          range: d.range,
        })
      }
    return (
      r.sort((d, f) => d.range.start.line - f.range.start.line || d.range.end.line - f.range.end.line),
      r.forEach(d => {
        u(a, d.range.start), p(d), (a = c(d.range.end).newPosition)
      }),
      u(a, e.range.end),
      s
    )
  }
  createOutlineSummary(e, r, n, i, o, s, a) {
    let l = this._createOutlineBody(
        i,
        o.map(u => ({ summary: trimTrailingSpaces(u.summary), range: u.range })),
        a
      ),
      c
    try {
      c = this._naiveChunker.genericChunking({
        lineRangeText: l,
        removeEmptyLines: !1,
        maxTokenLength: n,
        numTokensInEllipsis: this._numTokensInEllipsis,
      })
    } catch {
      return []
    }
    return this._createSummary(e, r, c, s, a)
  }
  _createSummary(e, r, n, i, o) {
    return n.length === 0
      ? []
      : filterTruthyValues(
          n.map((s, a) => {
            let l = e.length === 0 ? '' : `${e}`
            a !== 0 &&
              (l += `${o}${this._elipsisPlaceholder}
`)
            let c = ''
            if (
              (a !== n.length - 1 &&
                (c += `
${o}${this._elipsisPlaceholder}`),
              r.length > 0 && (c += r),
              Array.isArray(s))
            )
              return filterTruthyValues(
                s.map(u => {
                  if (u.text.trim().length !== 0) return { range: u.range, text: l + u.text + c }
                })
              )
            if (s.text.trim().length !== 0)
              return { range: new VscodeRange(a === 0 ? i.start : s.range.start, s.range.end), text: l + s.text + c }
          })
        ).flat()
  }
  findNewIndent(e, r, n) {
    let o = (this._lookForIndentInHeader ? r.text.substring(0, n.startIndex - r.startIndex) : n.text).match(
      new RegExp(`\\n+(\\s*)${e}${this._lookForIndentInHeader ? '$' : ''}`)
    )
    return o && o.length > 1 ? o[1] : ''
  }
}
var SemanticTextParser = class extends TextParser {
  _parseSemanticStructure(nodes, indent, maxTokenCount, maxLineCount, createSummary) {
    let outlines = [],
      parseNode = node => {
        let summaries = [],
          info = node.info,
          mainBlock = info.mainBlock,
          comments = info.detailBlocks.comments,
          body = info.detailBlocks.body,
          innerLineRangeText = this._getInnerLineRangeText({ text: body.text, range: toVscodeRange(body) }),
          bodyStartIndex = body.startIndex - mainBlock.startIndex + innerLineRangeText.prefix.length,
          newIndent = this.findNewIndent(indent, mainBlock, body),
          commentText = ''
        for (let comment of comments)
          commentText +=
            indent +
            comment.text +
            `
`
        let mainText = indent + mainBlock.text.substring(0, bodyStartIndex),
          summaryText = commentText + mainText,
          mainRange = toVscodeRange(mainBlock)
        if (comments.length > 0) {
          mainRange = mainRange.with(toVscodePosition(comments[0].range.startPosition))
        }
        let tokenizer = this.accessor.get(Tokenizer),
          maxTokens = maxLineCount * maxTokenCount,
          trimmedSummaryText = summaryText.replace(
            /(\n*)(\n\s*)$/g,
            `
`
          ),
          tokenCount = tokenizer.tokenLength(trimmedSummaryText)
        if (tokenCount > maxTokens) {
          trimmedSummaryText = mainText;
          tokenCount = tokenizer.tokenLength(mainText);
          if (tokenCount > maxTokens) {
            trimmedSummaryText = '';
            tokenCount = 0;
          }
        }
        let suffix = innerLineRangeText.suffix + mainBlock.text.substring(body.endIndex - mainBlock.startIndex),
          totalTokenCount = tokenizer.tokenLength(
            trimmedSummaryText +
              `
` +
              suffix
          ),
          remainingTokens = maxTokenCount - totalTokenCount,
          summary = createSummary(node.children, innerLineRangeText.body, remainingTokens, indent + newIndent)
        mainRange = new VscodeRange(mainRange.start, toVscodePosition(mainBlock.range.endPosition));
        summaries.push(...this._createSummary(trimmedSummaryText, suffix, summary.content.text, mainRange, indent + newIndent));
        let trimmedCommentText = trimTrailingSpaces(commentText + indent + mainBlock.text.substring(0, body.startIndex - mainBlock.startIndex));
        outlines.push({ summary: trimmedCommentText + ' ' + this._summaryPlaceHolder, range: mainRange });
        if (summary.outline !== void 0) {
          summaries.push(...this.createOutlineSummary(trimmedSummaryText, suffix, remainingTokens, innerLineRangeText.body, summary.outline, mainRange, indent + newIndent));
        }
        return summaries;
      },
      content = nodes.map(node => parseNode(node))
    return { outline: outlines, content: content }
  }
  _getInnerLineRangeText(rangeInfo) {
    let text = rangeInfo.text.replace(/(^\s*\{\s*)|(\s*\}\s*$)/g, ''),
      textStartIndex = rangeInfo.text.indexOf(text),
      prefix = rangeInfo.text.substring(0, textStartIndex),
      suffix = rangeInfo.text.substring(textStartIndex + text.length),
      prefixLineCount = (prefix.match(/\n/g) || []).length,
      prefixLastLineLength = prefix.match(/\n(.*)$/g)?.length ?? 0,
      textLineCount = (text.match(/\n/g) || []).length,
      textLastLineLength = text.match(/\n(.*)$/g)?.length ?? 0,
      start = new VscodePosition(rangeInfo.range.start.line + prefixLineCount, prefixLineCount === 0 ? rangeInfo.range.start.character + prefixLastLineLength : prefixLastLineLength),
      end = new VscodePosition(rangeInfo.range.start.line + textLineCount, textLineCount === 0 ? rangeInfo.range.start.character + textLastLineLength : textLastLineLength),
      trimmedPrefix = prefix.replace(/\{[^\S\r\n]*/g, '{'),
      trimmedSuffix = suffix.replace(/\}[^\S\r\n]*/g, '}')
    return { prefix: trimmedPrefix, body: { text: text, range: new VscodeRange(start, end) }, suffix: trimmedSuffix }
  }
}
var MdTextParser = class {
  constructor(text, accessor) {
    this._text = text;
    this.accessor = accessor;
    this.naiveChunker = new TextChunker(accessor);
  }
  parse(maxTokenLength) {
    let lineRangeText = this._getLineRangeText();
    return this.naiveChunker.genericChunking({
      lineRangeText: lineRangeText,
      maxTokenLength: maxTokenLength,
      extraLineRangeSeparator: `

`,
    });
  }
  _getLineRangeText() {
    let lines = this._text.split(`
`),
      currentLines = [],
      startPosition = new VscodePosition(0, 0),
      lineRanges = [];
    for (let i = 0; i < lines.length; i++)
      if (lines[i].trim().length === 0) {
        if (currentLines.length > 0) {
          lineRanges.push({
            text: currentLines.join(`
`),
            range: new VscodeRange(startPosition, new VscodePosition(i, lines[i].length)),
          });
          currentLines.length = 0;
          startPosition = new VscodePosition(i + 1, 0);
        }
        continue;
      } else currentLines.push(lines[i]);
    if (currentLines.length > 0) {
      lineRanges.push({
        text: currentLines.join(`
`),
        range: new VscodeRange(startPosition, new VscodePosition(lines.length - 1, lines[lines.length - 1].length - 1)),
      });
    }
    return lineRanges;
  }
}

var PythonSemanticTextParser = class extends TextParser {
  _parseSemanticStructure(nodes, indent, maxTokenCount, maxLineCount, createSummary) {
    let outlines = [],
      parseNode = node => {
        let parsedNodes = [],
          nodeInfo = node.info,
          mainBlock = nodeInfo.mainBlock,
          decorator = nodeInfo.detailBlocks.decorator,
          docstring = nodeInfo.detailBlocks.docstring,
          body = nodeInfo.detailBlocks.body,
          endIndex = mainBlock.text.length - 1;
        docstring ? (endIndex = docstring.endIndex - mainBlock.startIndex) : body && (endIndex = body.startIndex - mainBlock.startIndex);
        let newIndent = this.findNewIndent(indent, mainBlock, body),
          decoratorText = decorator
            ? indent +
              decorator.text +
              `
`
            : '',
          mainBlockText = indent + mainBlock.text.substring(0, endIndex),
          combinedText =
            decoratorText +
            mainBlockText +
            `
`,
          range = toVscodeRange(mainBlock);
        decorator && (range = range.with(toVscodePosition(decorator.range.startPosition)));
        let tokenizer = this.accessor.get(Tokenizer),
          maxTokenLength = maxLineCount * maxTokenCount,
          trimmedText = combinedText.replace(
            /\n+\s*$/g,
            `
`
          ),
          trimmedSpaces = trimTrailingSpaces(combinedText),
          tokenLength = tokenizer.tokenLength(trimmedText);
        if (tokenLength > maxTokenLength) {
          trimmedText = indent + combinedText.substring(0, body.startIndex - mainBlock.startIndex);
          tokenLength = tokenizer.tokenLength(trimmedText);
          if (tokenLength > maxTokenLength) {
            trimmedText = '';
            tokenLength = 0;
          }
        }
        range = new VscodeRange(range.start, toVscodePosition(mainBlock.range.endPosition));
        outlines.push({
          summary: docstring
            ? trimmedSpaces +
              `
${newIndent}` +
              this._summaryPlaceHolder
            : trimmedSpaces + ' ' + this._summaryPlaceHolder,
          range: range,
        });
        let bodyInfo = { text: body.text, range: toVscodeRange(body) },
          summary = createSummary(node.children, bodyInfo, maxTokenCount - tokenLength, indent + newIndent),
          mainBlockWithoutBody =
            indent +
            mainBlock.text.substring(0, body.startIndex - mainBlock.startIndex).replace(
              /\n+\s*$/g,
              `
`
            );
        if (summary.content.isFull) {
          trimmedText = mainBlockWithoutBody;
        }
        parsedNodes.push(...this._createSummary(trimmedText, '', summary.content.text, range, indent + newIndent));
        if (summary.outline !== void 0) {
          parsedNodes.push(...this.createOutlineSummary(mainBlockWithoutBody, '', maxTokenCount - tokenLength, bodyInfo, summary.outline, range, indent + newIndent));
        }
        return parsedNodes;
      },
      content = nodes.map(node => parseNode(node));
    return { outline: outlines, content: content };
  }
}

// 定义最大标题长度因子
var maxHeaderLengthFactor = 0.6;

// 获取语言配置的函数
function getConfigurationForLanguage(language) {
  // 如果语言不是Python和Ruby
  if (language !== 'python' && language !== 'ruby') {
    // 返回一个具有特定属性的对象
    return {
      elipsisPlaceholder: '/*...*/',
      blockWrap: { start: '{', end: '}' },
      lookForIndentInHeader: false
    };
  } else {
    // 对于Python和Ruby，返回一个空对象
    return {};
  }
}

var languageParsers = [
  {
    supportedExtensions: ['ts', 'mts', 'cts'],
    parse: (file, config, context) =>
      new SemanticTextParser(getSemanticChunkTreeAsync(file, 'typescript'), context, getConfigurationForLanguage('typescript')).parse(config.maxTokenLength, config.maxHeaderLengthFactor),
  },
  {
    supportedExtensions: ['tsx'],
    parse: (file, config, context) => new SemanticTextParser(getSemanticChunkTreeAsync(file, 'tsx'), context, getConfigurationForLanguage('tsx')).parse(config.maxTokenLength, config.maxHeaderLengthFactor),
  },
  {
    supportedExtensions: ['js', 'mjs', 'cjs', 'jsx'],
    parse: (file, config, context) =>
      new SemanticTextParser(getSemanticChunkTreeAsync(file, 'javascript'), context, getConfigurationForLanguage('javascript')).parse(config.maxTokenLength, config.maxHeaderLengthFactor),
  },
  {
    supportedExtensions: ['py'],
    parse: (file, config, context) => new PySemanticTextParser(getSemanticChunkTreeAsync(file, 'python'), context, getConfigurationForLanguage('python')).parse(config.maxTokenLength, config.maxHeaderLengthFactor),
  },
  {
    supportedExtensions: ['java'],
    parse: (file, config, context) => new SemanticTextParser(getSemanticChunkTreeAsync(file, 'java'), context, getConfigurationForLanguage('java')).parse(config.maxTokenLength, config.maxHeaderLengthFactor),
  },
  {
    supportedExtensions: ['cpp', 'cc', 'c++', 'cp', 'cxx', 'cppm', 'hpp', 'h', 'c'],
    parse: (file, config, context) => new SemanticTextParser(getSemanticChunkTreeAsync(file, 'cpp'), context, getConfigurationForLanguage('cpp')).parse(config.maxTokenLength, config.maxHeaderLengthFactor),
  },
  {
    supportedExtensions: ['cs'],
    parse: (file, config, context) => new SemanticTextParser(getSemanticChunkTreeAsync(file, 'csharp'), context, getConfigurationForLanguage('csharp')).parse(config.maxTokenLength, config.maxHeaderLengthFactor),
  },
  {
    supportedExtensions: ['go'],
    parse: (file, config, context) => new SemanticTextParser(getSemanticChunkTreeAsync(file, 'go'), context, getConfigurationForLanguage('go')).parse(config.maxTokenLength, config.maxHeaderLengthFactor),
  },
  {
    supportedExtensions: ['md'],
    parse: (file, config, context) => Promise.resolve(new MdTextParser(file, context).parse(config.maxTokenLength))
  },
  {
    supportedExtensions: ['rb'],
    parse: (file, config, context) => new SemanticTextParser(getSemanticChunkTreeAsync(file, 'ruby'), context, getConfigurationForLanguage('ruby')).parse(config.maxTokenLength, config.maxHeaderLengthFactor),
  },
  {
    supportedExtensions: ['rs'],
    parse: (file, config, context) => new SemanticTextParser(getSemanticChunkTreeAsync(file, 'rust'), context, getConfigurationForLanguage('rust')).parse(config.maxTokenLength, config.maxHeaderLengthFactor),
  },
]

// 根据文件扩展名查找解析器
function findParserByFileExtension(file) {
  // 获取文件扩展名，转换为小写，并移除点
  let extension = getExtension(file).toLowerCase().replace(/\./, '');

  // 在解析器列表中查找是否有支持该扩展名的解析器
  return languageParsers.find(parser => parser.fileExtensions.includes(extension));
}

// 检查是否存在支持给定扩展名的解析器
function hasParserForExtension(extension) {
  // 如果能找到解析器，返回true，否则返回false
  return !!findParserByFileExtension(extension);
}

// 保存获取语义块树的Promise
var semanticChunkTreePromise;

// 获取语义块树的函数
async function getSemanticChunkTreeAsync(param1, param2) {
  // 如果已经有一个获取语义块树的Promise正在进行，那么在该Promise完成后执行
  // 如果没有正在进行的Promise，那么立即开始获取语义块树
  semanticChunkTreePromise = semanticChunkTreePromise?.then(async () => await getSemanticChunkTree(param2, param1)) ?? getSemanticChunkTree(param2, param1);

  // 等待获取语义块树的Promise完成，并返回结果
  return await semanticChunkTreePromise;
}

async function parseText({
  text: inputText,
  accessor: accessor,
  maxTokenLength: maxTokenLength = debounceDelay,
  uri: fileUri,
  maxHeaderLengthFactor: maxHeaderLengthFactor = maxHeaderLengthFactor,
  shouldSemanticChunk: shouldSemanticChunk = false,
}) {
  let chunks = []
  try {
    if (shouldSemanticChunk) {
      let parsedChunks = await findParserByFileExtension(fileUri)?.parse(inputText, { maxTokenLength: maxTokenLength, maxHeaderLengthFactor: maxHeaderLengthFactor }, accessor)
      if (parsedChunks) {
        chunks.push(...parsedChunks.map(chunk => ({ file: fileUri, text: chunk.text, range: chunk.range, isFullFile: chunk.isFullFile })))
      }
    }
  } catch (error) {
    let logger = accessor.get(LoggerManager).getLogger('WorkspaceChunkSearch')
    logger.error('Error parsing semantic chunks for the following file: ' + fileUri.fsPath), logger.error(error), (chunks = [])
  }
  if (!chunks.length) {
    let genericChunks = new TextChunker(accessor).genericWholeFileChunking({ text: inputText, maxTokenLength: maxTokenLength })
    chunks.push(...genericChunks.map(chunk => ({ file: fileUri, text: chunk.text, range: chunk.range, isFullFile: genericChunks.length === 1 })))
  }
  return chunks.filter(chunk => chunk.text)
}

var crypto = require('crypto'),
  WY = handleDefaultExports(zY()),
  util = require('util')

// 定义一个名为BaseUriPattern的类
var BaseUriPattern = class {
  // 构造函数接收两个参数：baseUri和pattern
  constructor(baseUri, pattern) {
    this.baseUri = baseUri;
    this.pattern = pattern;
  }

  // 定义一个名为base的getter方法，该方法抛出一个"Not implemented"的错误
  get base() {
    throw new Error('Not implemented');
  }
}
var ignoredExtensions = new Set([
    'jpg',
    'jpeg',
    'jpe',
    'png',
    'gif',
    'bmp',
    'tif',
    'tiff',
    'tga',
    'ico',
    'webp',
    'svg',
    'eps',
    'heif',
    'heic',
    'pdf',
    'raw',
    'mp4',
    'm4v',
    'mkv',
    'webm',
    'mov',
    'avi',
    'wmv',
    'flv',
    'mp3',
    'wav',
    'm4a',
    'flac',
    'ogg',
    'wma',
    'weba',
    'aac',
    '7z',
    'bz2',
    'gz',
    'gz',
    'rar',
    'tar',
    'xz',
    'zip',
    'vsix',
    'db',
    'bin',
    'dat',
    'hex',
    'map',
    'wasm',
    'pyc',
    'pdb',
    'sym',
    'git',
  ]),
  ignoredFolders = ['node_modules', 'out', 'dist', '.git', '.yarn', '.npm', '.venv', 'foo.asar', '.vscode-test'],
  ignoredFiles = ['.DS_Store', 'Thumbs.db', 'package-lock.json', 'yarn.lock'],
  ignoredSchemes = ['vscode', 'vscode-userdata', 'output', 'inmemory', 'private', 'git']

// 定义一个函数，用于检查给定的URI是否应被忽略
function shouldIgnore(uri, workspace) {
  if (
    ignoredSchemes.includes(uri.scheme) ||
    (workspace && !['file', 'untitled'].includes(uri.scheme) && !workspace.getWorkspaceFolders().some(folder => uri.scheme === folder.scheme))
  )
    return false;
  let extension = getExtension(uri).replace(/\./, '').toLowerCase();
  return !(
    ignoredExtensions.has(extension) ||
    ignoredFiles.includes(getBasename(uri).toLowerCase()) ||
    uri.fsPath
      .toLowerCase()
      .split(/[/\\]/g)
      .some(folder => ignoredFolders.includes(folder))
  );
}

// 定义一个函数，用于在工作区中查找文件
async function findFilesInWorkspace(serviceContainer, maxFiles = 1e5, cancellationToken) {
  let workspace = serviceContainer.get(WorkspaceClass),
    fileFinder = serviceContainer.get(FileFinder),
    ignoreService = serviceContainer.get(IgnoreServiceIdentifier);
  if ((await ignoreService.init(), cancellationToken?.isCancellationRequested)) return [];
  let resourceMap = new ResourceMap();
  for (let workspaceFolder of workspace.getWorkspaceFolders() ?? []) {
    if (resourceMap.size >= maxFiles) break;
    let files = await fileFinder.findFiles(new BaseUriPattern(workspaceFolder, '**/*'), undefined, maxFiles - resourceMap.size);
    if (cancellationToken?.isCancellationRequested) return [];
    for (let file of files) shouldIgnore(file, workspace) && !ignoreService.isIgnored(file) && resourceMap.set(file);
  }
  return resourceMap.keys();
}

var TextChunker1 = class {
  constructor(uri, accessor) {
    this._uri = uri;
    this._accessor = accessor;
    this._isDisposed = false;
    this._disposedCts = new VscodeCancellationTokenSource();
  }
  dispose() {
    this._isDisposed = true;
    this._disposedCts.cancel();
    this._disposedCts.dispose();
  }
  get uri() {
    return this._uri;
  }
  async getHash(cancellationToken) {
    if (this._hash === undefined) {
      let text = await this.getText(cancellationToken);
      if (text !== undefined) {
        this._hash = crypto.createHash('sha256').update(text).digest('hex');
      }
    }
    return this._hash;
  }
  async getBasicChunks(cancellationToken) {
    this._basicChunks ??= this.getText(this._disposedCts.token).then(text =>
      this._isDisposed ? [] : parseText({ text: text, accessor: this._accessor, uri: this._uri, shouldSemanticChunk: false })
    );
    return (await handleCancellation(this._basicChunks, cancellationToken)) ?? [];
  }
  async getSemanticChunks(cancellationToken) {
    if (hasParserForExtension(this.uri)) {
      this._semanticChunks ??= this.getText(this._disposedCts.token).then(text =>
        this._isDisposed ? [] : parseText({ text: text, accessor: this._accessor, uri: this._uri, shouldSemanticChunk: true })
      );
      return (await handleCancellation(this._semanticChunks, cancellationToken)) ?? [];
    } else {
      return this.getBasicChunks(cancellationToken);
    }
  }
  },
  FileSystemTextChunker = class extends TextChunker1 {
    constructor(uri, accessor, fileSystem) {
      super(uri, accessor);
      this._fileSystem = fileSystem;
    }
    async getText(cancellationToken) {
      this._text ??= this._fileSystem.readFile(this.uri).then(
        async fileContent =>
          this._isDisposed || (await WY.isBinaryFile(Buffer.from(fileContent))) || this._isDisposed
            ? ''
            : new util.TextDecoder().decode(fileContent),
        error => ''
      );
      return (await handleCancellation(this._text, cancellationToken)) ?? '';
    }
  },
  DocumentTextChunker = class extends TextChunker1 {
    constructor(textDocument, accessor) {
      super(textDocument.uri, accessor);
      this._textDocument = textDocument;
    }
    async getText(cancellationToken) {
      return this._textDocument.getText();
    }
  },
  FileResourceTracker = class {
    constructor(accessor) {
      this._textDocumentFiles = new ResourceMap();
      this._fsFiles = new ResourceMap();
      this._disposables = [];
      this._listeners = new Set();
      this._accessor = accessor;
      this._fileSystem = accessor.get(BaseFileSystemOperations);
    }
    get size() {
      return this._fsFiles.size;
    }
    dispose() {
      this._disposables.forEach(disposable => disposable.dispose());
      for (let file of this._fsFiles.values()) file.dispose();
      this._fsFiles.clear();
      for (let file of this._textDocumentFiles.values()) file.dispose();
      this._textDocumentFiles.clear();
    }
    get(resource) {
      return this._textDocumentFiles.get(resource) || this._fsFiles.get(resource);
    }
    *entries() {
      let resourceMap = new ResourceMap();
      for (let [key, value] of this._textDocumentFiles.entries()) {
        yield [key, value];
        resourceMap.set(key);
      }
      for (let [key, value] of this._fsFiles.entries()) {
        if (!resourceMap.has(key)) {
          resourceMap.set(key);
          yield [key, value];
        }
      }
    }
    *keys() {
      for (let [key] of this.entries()) yield key;
    }
    *values() {
      for (let [, value] of this.entries()) yield value;
    }
    addListener(listener) {
      return this._listeners.has(listener)
        ? { dispose: () => {} }
        : (this._listeners.add(listener),
          {
            dispose: () => {
              this._listeners.delete(listener);
            },
          });
    }

    registerListeners() {
      let workspace = this._accessor.get(WorkspaceClass),
        fileSystemOperations = this._accessor.get(BaseFileSystemOperations),
        workspaceClass = this._accessor.get(WorkspaceClass),
        handleDocumentChange = document => {
          if (!shouldIgnore(document.uri, workspaceClass)) return;
          let textDocumentFile = this._textDocumentFiles.get(document.uri),
            fsFile = this._fsFiles.get(document.uri);
          if (textDocumentFile) {
            textDocumentFile.dispose();
          }
          this._textDocumentFiles.set(document.uri, new DocumentTextChunker(document, this._accessor));
          if (!textDocumentFile && !fsFile) {
            this._listeners.forEach(listener => listener.onDidCreateFile?.(document.uri));
          } else {
            this._listeners.forEach(listener => listener.onDidChangeFile?.(document.uri));
          }
        };
      this._disposables.push(workspace.onDidOpenTextDocument(handleDocumentChange)),
      this._disposables.push(workspace.onDidChangeTextDocument(event => handleDocumentChange(event.document))),
      this._disposables.push(
        workspace.onDidCloseTextDocument(document => {
          let textDocumentFile = this._textDocumentFiles.get(document.uri);
          if (!textDocumentFile) return;
          this._textDocumentFiles.delete(document.uri),
          textDocumentFile.dispose();
          if (this._fsFiles.get(document.uri)) {
            this._listeners.forEach(listener => listener.onDidChangeFile?.(document.uri));
          } else {
            this._listeners.forEach(listener => listener.onDidDeleteFile?.(document.uri));
          }
        })
      );
      let watcher = fileSystemOperations.createFileSystemWatcher('**/*');
      this._disposables.push(watcher),
      this._disposables.push(
        watcher.onDidChange(uri => {
          if (!shouldIgnore(uri, workspaceClass)) return;
          let exists = this._fsFiles.has(uri);
          this.createOrUpdateFsEntry(uri);
          if (exists) {
            this._listeners.forEach(listener => listener.onDidChangeFile?.(uri));
          } else {
            this._listeners.forEach(listener => listener.onDidCreateFile?.(uri));
          }
        })
      ),
      this._disposables.push(
        watcher.onDidCreate(uri => {
          if (shouldIgnore(uri, workspaceClass) && !this._fsFiles.has(uri)) {
            this.createOrUpdateFsEntry(uri);
            this._listeners.forEach(listener => listener.onDidCreateFile?.(uri));
          }
        })
      ),
      this._disposables.push(
        watcher.onDidDelete(uri => {
          let fsFile = this._fsFiles.get(uri);
          if (fsFile) {
            fsFile.dispose();
            this._fsFiles.delete(uri);
            this._listeners.forEach(listener => listener.onDidDeleteFile?.(uri));
          }
        })
      );
    }
    initialize() {
      return (
        (this._initializedWorkspacePromise ??= (async () => {
          this.registerListeners();
          let workspace = this._accessor.get(WorkspaceClass);
          for (let document of workspace.textDocuments) {
            if (shouldIgnore(document.uri, workspace)) {
              this._textDocumentFiles.set(document.uri, new DocumentTextChunker(document, this._accessor));
            }
          }
          let filesInWorkspace = await findFilesInWorkspace(this._accessor);
          for (let file of filesInWorkspace) {
            this.createOrUpdateFsEntry(file);
          }
        })()),
        this._initializedWorkspacePromise
      );
    }
    createOrUpdateFsEntry(resource) {
      let fsFile = this._fsFiles.get(resource);
      if (fsFile) fsFile.dispose();
      let newFsFile = new FileSystemTextChunker(resource, this._accessor, this._fileSystem);
      this._fsFiles.set(resource, newFsFile);
    }
  }
var SemanticChunker = class {
  constructor(accessor) {
    this._accessor = accessor;
    this.disposables = new Array();
  }
  dispose() {
    while (this.disposables.length) {
      this.disposables.pop()?.dispose();
    }
  }
  _register(resource) {
    this.disposables.push(resource);
    return resource;
  }
  async toSemanticChunks(input, cancellationToken) {
    let fileResourceTracker = this._accessor.get(FileResourceTracker),
      resourceMap = new ResourceMap();
    for (let item of input) {
      let existing = resourceMap.get(item.file);
      existing ? existing.push(item) : resourceMap.set(item.file, [item]);
    }
    let chunks = await Promise.all(
      Array.from(resourceMap, async ([file, items]) => {
        let resource = fileResourceTracker.get(file);
        if (resource && hasParserForExtension(file)) {
          let semanticChunks = await resource.getSemanticChunks(cancellationToken);
          if (cancellationToken.isCancellationRequested) return [];
          let resultSet = new Set();
          for (let item of items) {
            let intersected = false;
            for (let chunk of semanticChunks) {
              if (chunk.range.intersection(item.range)) {
                resultSet.add(chunk);
                intersected = true;
              }
            }
            if (!intersected) resultSet.add(item);
          }
          return Array.from(resultSet);
        } else return items;
      })
    );
    return Array.from(new Set(chunks.flat()));
  }
}
var path = require('path')
var cacheVersion = '1.0.8',
EmbeddingsIndex = class {
  constructor(accessor) {
      this._accessor = accessor;
      this._embeddingsMemoryCache = new Map();
      this.shouldSearchTimeout = true;
      this._embeddingsComputer = accessor.get(EmbeddingsComputer);
      this._workspaceIndex = accessor.get(FileResourceTracker);
      this._embeddingsStorageCache = new CacheManager(accessor, 2, 'workspaceEmbeddingsCache', version);
      this._logger = accessor.get(LoggerManager).getLogger('WorkspaceChunkEmbeddingsIndex');
      this.loadCacheFromStorage();
    }
    static {
      this._MAX_EMBEDDINGS_COMPUTATION_TIME = 10000;
    }
    static {
      this._MAX_CHUNK_LENGTH = 2000;
    }
    get size() {
      return this._workspaceIndex.size;
    }
    workspaceEmbeddingsInitialized() {
      this._initializedWorkspacePromise = this._initializedWorkspacePromise || this._workspaceIndex.initialize();
      return this._initializedWorkspacePromise;
    }
    async triggerIndexing(cancellationToken) {
      let workspaceValues = Array.from(this._workspaceIndex.values()),
        chunks = [];
      for (let value of workspaceValues) {
        let semanticChunks = await value.getSemanticChunks(cancellationToken);
        semanticChunks = semanticChunks.filter(chunk => chunk.text.length < EmbeddingsIndex._MAX_CHUNK_LENGTH);
        chunks.push(...semanticChunks);
      }
      if (cancellationToken.isCancellationRequested) return;
      let embeddings = await this.getEmbeddings(chunks, cancellationToken);
      this._logger.debug(`Indexed ${embeddings.length} chunks`);
    }
    async searchFileChunks(query, numResults, cancellationToken, chunks) {
      if (!chunks) {
        chunks = [];
        let workspaceChunks = (await Promise.all(Array.from(this._workspaceIndex.values(), value => value.getSemanticChunks(cancellationToken)))).flat();
        if (cancellationToken.isCancellationRequested) return [];
        chunks.push(...workspaceChunks);
      }
      chunks = chunks.filter(chunk => chunk.text.length < EmbeddingsIndex._MAX_CHUNK_LENGTH);
      let embeddings = this.shouldSearchTimeout
        ? await timeoutPromise(this.getEmbeddings(chunks, cancellationToken), EmbeddingsIndex._MAX_EMBEDDINGS_COMPUTATION_TIME)
        : await this.getEmbeddings(chunks, cancellationToken);
      if (!embeddings) throw new Error('Timeout computing embeddings');
      return searchEmbeddings(query, embeddings, numResults);
    }
    async loadCacheFromStorage() {
      let cache = await this._embeddingsStorageCache.getCache();
      if (!cache) await this._embeddingsStorageCache.clearCache();
      this._embeddingsMemoryCache.clear();
      for (let [key, value] of Object.entries(cache ?? {})) this._embeddingsMemoryCache.set(key, value);
    }
    async getEmbeddings(chunks, cancellationToken) {
      let toCompute = [];
      for (let chunk of chunks) {
        let embedding = this._embeddingsMemoryCache.get(chunk.text);
        if (embedding) {
          chunk.embedding = embedding;
        } else {
          toCompute.push(chunk);
        }
      }
      if (toCompute.length === 0) return chunks;
      let inputs = toCompute.map(chunk => {
          let workspaceFolder = this._accessor.get(WorkspaceClass).getWorkspaceFolder(chunk.file),
            relativePath = workspaceFolder ? path.relative(workspaceFolder.path, chunk.file.path) : chunk.file.fsPath;
          return formatFileContent(chunk, relativePath);
        }),
        embeddings = await this.computeEmbeddingsWithRetry(inputs, cancellationToken);
      for (let i = 0; i < toCompute.length; i++) {
        let chunk = toCompute[i];
        chunk.embedding = embeddings[i];
        this._embeddingsMemoryCache.set(chunk.text, chunk.embedding);
      }
      return chunks;
    }
    async computeEmbeddingsWithRetry(inputs, cancellationToken) {
      let attempts = 0,
        embeddings;
      while (attempts < 3) {
        try {
          embeddings = await this._embeddingsComputer.computeEmbeddings(inputs, cancellationToken);
          if (!embeddings) throw new Error('Failed to compute embeddings');
          return embeddings;
        } catch (error) {
          attempts++;
          if (attempts === 3) throw error;
          if (cancellationToken.isCancellationRequested) throw new Error('Cancelled computing embeddings');
          this._logger.warn(`Error computing embeddings. Retrying in ${attempts} seconds. Error: ${error}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
      throw new Error('Failed to compute embeddings');
    }
  }
function formatFileContent(fileContent, fileName) {
  return `File: \`${fileName}\`
\`\`\`${getExtension(fileContent.file).replace('.', '')}
${fileContent.text}
\`\`\``
}
var CodeSearchChunkSearch = class extends SemanticChunker {
  constructor(serviceAccessor, throwOnCodeSearchError = false) {
    super(serviceAccessor)
    this._throwOnCodeSearchError = throwOnCodeSearchError
    this.id = 'codesearch'
    this._codeSearchClient = serviceAccessor.get(CodeSearchClient)
    this._workspaceChunkIndex = serviceAccessor.get(FileResourceTracker)
    this._embeddingsIndex = serviceAccessor.get(EmbeddingsIndex)
    this._logger = serviceAccessor.get(LoggerManager).getLogger('CodeSearchChunkSearch')
  }

  async searchFileChunks(fileChunks, searchParams, cancellationToken) {
    if (!fileChunks.length || cancellationToken.isCancellationRequested) return []
    if ((await this.initialized(), cancellationToken.isCancellationRequested)) return []
    this._logger.debug('Fetching related workspace chunks in repository...')
    let similarFiles = await this.getSimilarFilesFromCodeSearch(fileChunks)
    return similarFiles ? (this._logger.debug('Remapping chunks to semantic chunks...'), await this.toSemanticChunks(similarFiles, cancellationToken)) : []
  }

  async isAvailable() {
    let codeSearchEnabled = this._accessor.get(ConfigManager).getConfig(settings.WorkspaceCodeSearchEnabled)
    return codeSearchEnabled === false ||
      (codeSearchEnabled === void 0 &&
        (await this._accessor.get(IExperimentationService).getTreatmentVariableAsync('vscode', 'copilotchat.useCodeSearch', true)) !== true)
      ? false
      : (this._isAvailable === void 0 && (this._isAvailable = this._codeSearchClient.isAvailable()), this._isAvailable)
  }

  initialized() {
    return this._embeddingsIndex.workspaceEmbeddingsInitialized()
  }

  async getSimilarFilesFromCodeSearch(fileChunks) {
    let workspaceFolders = this._accessor.get(WorkspaceClass).getWorkspaceFolders(),
      gitRepositories = this._accessor.safeGet(BaseGitRepositoryManager)?.repositories
    if (!workspaceFolders.length || !gitRepositories) return
    let searchPromises = []
    for (let repoIndex = 0; repoIndex < gitRepositories.length; repoIndex++) {
      let gitRepo = gitRepositories[repoIndex]
      if (!gitRepo) continue
      let workspaceFolder = workspaceFolders[repoIndex],
        repoNames = this.getRepoNamesFromContext(gitRepo)
      for (let fileChunk of fileChunks) for (let repoName of repoNames) searchPromises.push(this.doCodeSearch(fileChunk.fullText, workspaceFolder, { repo: repoName }))
    }
    let searchResults = await Promise.allSettled(searchPromises),
      fulfilledResults = new Array()
    for (let result of searchResults)
      if (result.status === 'fulfilled') fulfilledResults.push(...result.value)
      else {
        if (result.reason instanceof MissingRepoOrgError) throw result.reason
        if (this._throwOnCodeSearchError)
          throw (
            (this._logger.exception(result.reason),
            this._accessor.get(IGHTelemetryService).sendExceptionTelemetry(result.reason, 'Error'),
            result.reason)
          )
      }
    return fulfilledResults.sort((a, b) => b.score - a.score)
  }

  async doCodeSearch(searchText, workspaceFolder, searchOptions) {
    return (await this._codeSearchClient.search(searchText, searchOptions))
      .map(searchResult => {
        let workspaceChunk = this._workspaceChunkIndex.get(Uri.joinPath(workspaceFolder, searchResult.path))
        if (workspaceChunk)
          return { file: workspaceChunk.uri, score: searchResult.score, text: searchResult.contents, range: new VscodeRange(searchResult.range.start, 0, searchResult.range.end + 1, 0) }
      })
      .filter(searchResult => !!searchResult)
  }

  getRepoNamesFromContext(gitRepo) {
    return gitRepo.remoteFetchUrls
      ? gitRepo.remoteFetchUrls
          .filter(url => !!url)
          .map(url => parseGithubUrl(url))
          .filter(parsedUrl => !!parsedUrl)
      : []
  }
}
var EmbeddingsCacheChunkSearch = class extends SemanticChunker {
  constructor(serviceAccessor, inTests = false) {
    super(serviceAccessor)
    this._inTests = inTests
    this.id = 'ada'
    this._embeddingsComputer = serviceAccessor.get(EmbeddingsComputer)
    this._embeddingsIndex = serviceAccessor.get(EmbeddingsIndex)
    this._logger = serviceAccessor.get(LoggerManager).getLogger('EmbeddingsCacheChunkSearch')
    inTests && (this._embeddingsIndex.shouldSearchTimeout = false)
  }
  static {
    this.FILE_CAP = 200
  }
  async searchFileChunks(fileChunks, searchParams, cancellationToken) {
    if (!fileChunks.length || cancellationToken.isCancellationRequested) return []
    this._logger.debug('Computing embeddings for query...')
    let embeddings = await this._embeddingsComputer.computeEmbeddings(
      fileChunks.map(chunk => chunk.fullText),
      cancellationToken
    )
    if (!embeddings) {
      if (this._inTests) throw new Error('Failed to compute query embeddings')
      return []
    }
    return cancellationToken.isCancellationRequested
      ? []
      : (await this.initialized(),
        cancellationToken.isCancellationRequested
          ? []
          : (this._logger.debug('Fetching related workspace chunks in repository...'),
            await this._embeddingsIndex.searchFileChunks(embeddings, searchParams, cancellationToken)))
  }
  async isAvailable() {
    return this._isAvailable === undefined && (this._isAvailable = this.doIsAvailable()), this._isAvailable
  }
  async doIsAvailable() {
    await this.initialized()
    if (this._embeddingsIndex.size < EmbeddingsCacheChunkSearch.FILE_CAP) {
      this.triggerIndexing()
    }
    return false
  }
  initialized() {
    return this._embeddingsIndex.workspaceEmbeddingsInitialized()
  }
  triggerIndexing() {
    if (!this._initializedWorkspacePromise) {
      this._initializedWorkspacePromise = this._embeddingsIndex
        .triggerIndexing(CancellationToken.None)
        .then(() => {
          this._isAvailable = Promise.resolve(true)
          this._logger.debug('Workspace Chunk Embeddings Index initialized.')
        })
        .catch(error => {
          this._logger.warn(`Failed to index workspace: ${error}`)
          this._initializedWorkspacePromise = undefined
        })
    }
  }
}
var ConcurrencyModule = handleDefaultExports(ConcurrencyModule()),
var path = handleDefaultExports(require('path'))

function deepMap(object, transformFunc) {
  if (!object) return object
  if (Array.isArray(object)) return object.map(element => deepMap(element, transformFunc))
  if (typeof object == 'object') {
    let transformed = transformFunc(object)
    if (transformed) return transformed
    let newObject = {}
    for (let key in object) newObject[key] = deepMap(object[key], transformFunc)
    return newObject
  }
  return object
}

var tfidfWorkerPath = path.default.join(__dirname, 'tfidfWorker.js'),
  TfidfWorkerClass = class {
    constructor(fileResourceTracker) {
      this.id = 'tfidf'
      this._disposables = []
      this._tfIdfWorker = new Lazy(() => new WorkerProxy(tfidfWorkerPath))
      let handleFileChange = file => {
        let fileIndex = this._workspaceIndex.get(file)
        fileIndex && this.addOrUpdateTfidfEntries([fileIndex])
      }
      ;(this._workspaceIndex = fileResourceTracker.get(FileResourceTracker)),
        this._disposables.push(
          this._workspaceIndex.addListener({
            onDidChangeFile: handleFileChange,
            onDidCreateFile: handleFileChange,
            onDidDeleteFile: file => {
              this._tfIdfWorker.value.proxy.delete(file)
            },
          })
        )
    }
    dispose() {
      this._disposables.forEach(disposable => disposable.dispose()), this._tfIdfWorker.hasValue && this._tfIdfWorker.value.terminate()
    }
    initialized() {
      return (this._initializePromise ??= this._initializeWorkspaceFiles()), this._initializePromise
    }
    async searchFileChunks(fileChunks, searchParams, cancellationToken) {
      if ((await this.initialized(), cancellationToken.isCancellationRequested)) return []
      let searchResults = await this._tfIdfWorker.value.proxy.search(
        fileChunks.map(chunk => chunk.keywords.join(', ')),
        searchParams,
        -1 / 0
      )
      return convertToVscodeObjects(searchResults)
    }
    async isAvailable() {
      return true
    }
    async _initializeWorkspaceFiles() {
      await this._workspaceIndex.initialize(), await this.addOrUpdateTfidfEntries(this._workspaceIndex.values())
    }
    async addOrUpdateTfidfEntries(fileIndices) {
      let concurrencyLimit = (0, ConcurrencyModule.default)(20)
      this._tfIdfWorker.value.proxy.addOrUpdate(
        convertToSerializableObjects(
          await Promise.all(
            Array.from(fileIndices, fileIndex =>
              concurrencyLimit(async () => ({ uri: fileIndex.uri, text: await fileIndex.getText(CancellationToken.None), chunks: await fileIndex.getBasicChunks(CancellationToken.None) }))
            )
          )
        )
      )
    }
  }
function convertToSerializableObjects(object) {
  return deepMap(object, element => {
    if (Uri.isUri(element)) return { $mid: 'uri', ...element }
    if (element instanceof VscodeRange)
      return {
        $mid: 'range',
        start: { line: element.start.line, character: element.start.character },
        end: { line: element.end.line, character: element.end.character },
      }
  })
}
function convertToVscodeObjects(object) {
  return deepMap(object, element => {
    if (element.$mid === 'range') return new VscodeRange(element.start.line, element.start.character, element.end.line, element.end.character)
    if (element.$mid === 'uri') return Uri.revive(element)
  })
}

var TfIdfWithSemanticChunkSearch = class extends SemanticChunker {
  constructor(serviceAccessor) {
    super(serviceAccessor)
    this.id = 'tfidf'
    ;(this._tfidfWorker = this._register(new TfidfWorkerClass(serviceAccessor))),
    (this._logger = serviceAccessor.get(LoggerManager).getLogger('TfIdfWithRerankChunkSearch'))
  }
  async searchFileChunks(fileChunks, searchParams, cancellationToken) {
    this._logger.debug('Performing full workspace search for chunks...')
    let searchResults = await this._tfidfWorker.searchFileChunks(fileChunks, searchParams * 2, cancellationToken)
    if (cancellationToken.isCancellationRequested || !searchResults.length) return []
    this._logger.debug('Remapping chunks to semantic chunks...')
    let semanticChunks = await this.toSemanticChunks(searchResults, cancellationToken)
    return cancellationToken.isCancellationRequested || !semanticChunks.length ? [] : semanticChunks
  }
  isAvailable() {
    return Promise.resolve(true)
  }
}

var WorkspaceChunkSearch = class {
  constructor(serviceAccessor, forcedChunkSearchStrategy) {
    this._accessor = serviceAccessor
    this._forcedChunkSearchStrategy = forcedChunkSearchStrategy
    this._workspaceChunkEmbeddingsIndex = this._accessor.get(EmbeddingsIndex)
    this._embeddingsComputer = this._accessor.get(EmbeddingsComputer)
    this._logger = this._accessor.get(LoggerManager).getLogger('WorkspaceChunkSearch')
    this._inTests = !!this._forcedChunkSearchStrategy
    this._embeddingsCacheChunkSearch = new EmbeddingsCacheChunkSearch(serviceAccessor, this._inTests)
    this._codeSearchChunkSearch = new CodeSearchChunkSearch(serviceAccessor, this._inTests)
    this._tfIdfWithSemanticChunkSearch = new TfIdfWithSemanticChunkSearch(serviceAccessor)
  }
  static {
    this.ADDITIONAL_RESULTS_TIMEOUT = 5000
  }
  dispose() {
    this._embeddingsCacheChunkSearch.dispose()
    this._codeSearchChunkSearch.dispose()
    this._tfIdfWithSemanticChunkSearch.dispose()
  }
  async searchFileChunks(fileChunks, searchParams, cancellationToken) {
    let strategies = await this.getStrategies()
    if (cancellationToken.isCancellationRequested) return []
    let promiseOutcomes = strategies.map(() => new PromiseOutcome())
    for (let index = 0; index < strategies.length; index++) {
      let strategy = strategies[index]
      let promiseOutcome = promiseOutcomes[index]
      strategy.searchFileChunks(fileChunks, searchParams, cancellationToken)
        .then(result => {
          if (!promiseOutcome.isSettled) promiseOutcome.complete(result)
        })
        .catch(error => {
          if (!promiseOutcome.isSettled) promiseOutcome.error(error)
        })
    }
    let promises = promiseOutcomes.map(outcome => outcome.promise)
    try {
      await Promise.any(promises)
    } catch (error) {
      let promiseError = error
      throw promiseError.errors.length === 1 ? promiseError.errors[0] : error
    }
    if (cancellationToken.isCancellationRequested) return []
    let settledPromises = await timeoutPromise(Promise.allSettled(promises), WorkspaceChunkSearch.ADDITIONAL_RESULTS_TIMEOUT)
    if (cancellationToken.isCancellationRequested) return []
    if (!settledPromises) {
      for (let outcome of promiseOutcomes) if (!outcome.isSettled) await outcome.cancel()
      settledPromises = await Promise.allSettled(promises)
    }
    if (cancellationToken.isCancellationRequested) return []
    let results = new Array()
    let successfulStrategyId
    for (let index = 0; index < settledPromises.length; index++) {
      let settledPromise = settledPromises[index]
      let strategy = strategies[index]
      if (settledPromise.status === 'fulfilled') {
        if (!successfulStrategyId) successfulStrategyId = strategy.id
        results.push(...settledPromise.value)
        continue
      }
      if (settledPromise.reason instanceof MissingRepoOrgError && strategy instanceof CodeSearchChunkSearch)
        try {
          if (await this._accessor.get(BaseTokenHandler).getPermissiveGitHubToken({ silent: true })) continue
          if (
            await this._accessor
              .get(BaseTokenHandler)
              .getPermissiveGitHubToken({
                forceNewSession: { detail: requestLight.t('More permissions are required to search private repositories') },
              })
          ) {
            let additionalResults = await strategy.searchFileChunks(fileChunks, searchParams, cancellationToken)
            successfulStrategyId = strategy.id
            results.unshift(...additionalResults)
          }
        } catch {}
    }
    return this.reportTopSuccessfulFlow(successfulStrategyId), this.rerankChunks(fileChunks, results, searchParams, cancellationToken)
  }
  async rerankChunks(chunks, results, limit, cancellationToken) {
    if (!(await this.getShouldUseAda())) return results.slice(0, limit)
    if (cancellationToken.isCancellationRequested) return []
    let embeddings = await this._embeddingsComputer.computeEmbeddings(
      chunks.map(chunk => chunk.fullText),
      cancellationToken
    )
    if (cancellationToken.isCancellationRequested) return []
    if (!embeddings) {
      if (this._inTests) {
        let error = new Error('Failed to compute query embeddings')
        throw (this._logger.exception(error), this._accessor.get(IGHTelemetryService).sendExceptionTelemetry(error, 'Error'), error)
      }
      return this._logger.warn('Failed to compute query embeddings'), results.slice(0, limit)
    }
    try {
      return await this._workspaceChunkEmbeddingsIndex.searchFileChunks(embeddings, limit, cancellationToken, results)
    } catch (error) {
      return this._logger.warn('Failed to search chunk embeddings index: ', error), results.slice(0, limit)
    }
  }
  async getStrategies() {
    let strategies = new Array()
    switch (this._forcedChunkSearchStrategy) {
      case 'codesearch':
        strategies.push(this._codeSearchChunkSearch)
        break
      case 'ada':
        strategies.push(this._embeddingsCacheChunkSearch)
        break
      case 'tfidf':
        strategies.push(this._tfIdfWithSemanticChunkSearch)
        break
      default:
        ;(await this._codeSearchChunkSearch.isAvailable()) && strategies.push(this._codeSearchChunkSearch),
          (await this.getShouldUseAda()) &&
            (await this._embeddingsCacheChunkSearch.isAvailable()) &&
            strategies.push(this._embeddingsCacheChunkSearch),
          strategies.push(this._tfIdfWithSemanticChunkSearch)
        break
    }
    return this._logger.debug(`Using ${strategies.map(strategy => strategy.id).join(', ')} for chunk search`), strategies
  }
  async getShouldUseAda() {
    let useAda = this._accessor.get(ConfigManager).getConfig(settings.WorkspaceUseAdaEnabled)
    return useAda !== void 0
      ? useAda
      : (await this._accessor.get(IExperimentationService).getTreatmentVariableAsync('vscode', 'copilotchat.workspaceUseAda', true)) ?? true
  }
  reportTopSuccessfulFlow(strategyId) {
    this._logger.debug(`'${strategyId}' was the top working workspace chunk search strategy`),
      this._accessor.get(IMSTelemetryService).sendTelemetryEvent('workspaceChunkSearchStrategy', { strategy: strategyId ?? 'none' })
  }
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
function calculateLength(chunks) {
  return chunks.reduce((total, chunk) => total + chunk.value.length, 0) + Math.max(0, chunks.length - 1)
}
async function formatDirectoryTree(chunks, limit = Infinity, cancellationToken) {
  let formattedChunks = formatChunks(0, chunks, limit),
    remainingSpace = limit - calculateLength(formattedChunks)
  for (;;) {
    let hasMoreChunks = false,
      newChunks = []
    for (let chunk of formattedChunks)
      if (chunk.type === 'text') newChunks.push(chunk)
      else if (chunk.type === 'dir') {
        newChunks.push({ type: 'text', value: chunk.value })
        let children = await chunk.getChildren()
        if (cancellationToken?.isCancellationRequested) return ''
        let childChunks = formatChunks(chunk.level + 1, children, remainingSpace - 1)
        if (childChunks.length) {
          hasMoreChunks = true
          remainingSpace -= calculateLength(childChunks) + 1
          newChunks.push(...childChunks)
        }
      }
    if (((formattedChunks = newChunks), !hasMoreChunks)) break
  }
  return formattedChunks.map(chunk => chunk.value).join('\n')
}
function formatChunks(level, chunks, limit) {
  let indent = '\t'.repeat(level),
    formattedChunks = [],
    remainingSpace = limit
  for (let index = 0; index < chunks.length; ++index) {
    let chunk = chunks[index],
      line = indent + chunk.name + (chunk.type === 2 ? '/' : '')
    if (line.length > remainingSpace) {
      let ellipsis = indent + '...'
      while (ellipsis.length > remainingSpace && formattedChunks.length > 0) remainingSpace += formattedChunks.pop().value.length + 1
      if (ellipsis.length <= remainingSpace) formattedChunks.push({ type: 'text', value: ellipsis })
      break
    }
    chunk.type === 2
      ? formattedChunks.push({ type: 'dir', level: level, value: line, getChildren: chunk.getChildren })
      : formattedChunks.push({ type: 'text', value: line })
    remainingSpace -= line.length
    if (index !== chunks.length - 1) remainingSpace -= 1
  }
  return formattedChunks
}

async function formatDirectoryTree(serviceAccessor, directoryUri, limit, cancellationToken) {
  let fileSystemOperations = serviceAccessor.get(BaseFileSystemOperations),
    ignoreService = serviceAccessor.get(IgnoreServiceIdentifier)
  async function getChildren(directory) {
    let entries
    try {
      entries = await fileSystemOperations.readDirectory(directory)
    } catch (error) {
      console.error(error)
      return []
    }
    if (cancellationToken.isCancellationRequested) return []
    return entries
      .filter(entry => {
        let path = Uri.joinPath(directory, entry[0])
        return shouldIgnore(path) && !ignoreService.isIgnored(path)
      })
      .map(entry =>
        entry[1] === 2 ? { type: 2, name: entry[0], getChildren: () => getChildren(Uri.joinPath(directory, entry[0])) } : { type: 1, name: entry[0] }
      )
  }
  await ignoreService.init()
  if (cancellationToken.isCancellationRequested) return ''
  let chunks = await getChildren(directoryUri)
  return cancellationToken.isCancellationRequested ? '' : formatDirectoryTree(chunks, limit, cancellationToken)
}

var WorkspaceResolver = class {
  constructor() {
    this.kind = 'workspace'
    this.keywordLineRegexp = /^[\*\-]\s*(.+)/m
  }
  async resolveContext(context, request, cancellationToken, progress) {
    let message = request.message
    if (!message) return
    let dataRetriever = context.get(DataRetriever)
    this.logger || (this.logger = context.get(LoggerManager).getLogger('workspaceResolver')),
      this.logger.debug('Collecting workspace structure...'),
      progress.report({ message: requestLight.t('Collecting workspace structure') })
    let workspaceStructure = await getWorkspaceStructure(context, 1e3, cancellationToken)
    if (cancellationToken.isCancellationRequested) return
    this.logger.debug('Asking the model to update the user question and provide queries...'),
      progress.report({ message: requestLight.t('Deciding which workspace information to collect') })
    let modelResponse = await dataRetriever.fetchOne(
      filterTruthyValues([
        ...this.getHistory(request.conversation),
        { role: 'system', content: codingAssistantInstructions },
        workspaceStructure ? { role: 'user', content: workspaceStructure } : void 0,
        { role: 'user', content: message },
      ]),
      async () => {},
      cancellationToken,
      2,
      request.endpoint,
      { temperature: 0.1, top_p: 1, stop: ['dontStopBelieving'] },
      { messageSource: 'workspaceIntent' }
    )
    if (cancellationToken.isCancellationRequested) return
    if (modelResponse.type !== 'success')
      throw new Error(requestLight.t('Encountered an error while deciding what workspace information to collect: {0}', modelResponse.type))
    let parsedResponse = this.parseMetaPromptResponse(message, modelResponse.value)
    return (
      this.logger.debug('Running all tools...'),
      progress.report({ message: requestLight.t('Collecting workspace info') }),
      this.runTools(context, parsedResponse, cancellationToken)
    )
  }
  getHistory(conversation) {
    return conversation
      ? conversation.turns
          .slice(0, -1)
          .flatMap(turn =>
            turn.request.type === 'user'
              ? filterTruthyValues([
                  { role: 'user', content: turn.request.message },
                  turn.response ? { role: 'assistant', content: turn.response.message } : void 0,
                ])
              : []
          )
      : []
  }
  parseMetaPromptResponse(message, response) {
    let lines = response.trim().split(`
`),
      keywordLinesCount = 0,
      keywords = []
    for (let line of Array.from(lines).reverse()) {
      let match = line.match(this.keywordLineRegexp)
      if (match) {
        let keywordVariations = match[1].split(/,/g).map(keyword => keyword.trim())
        keywordVariations.length && keywords.unshift({ keyword: keywordVariations[0], variations: keywordVariations.slice(1) })
      } else if (keywords.length) break
      keywordLinesCount++
    }
    return {
      rephrasedQuestion:
        lines
          .slice(0, -keywordLinesCount)
          .join(
            `
`
          )
          .trim() || message.trim(),
      keywords: keywords,
    }
  }
  async runTools(context, parsedResponse, cancellationToken) {
    let request = { kind: this.kind, fullQuestionText: parsedResponse.rephrasedQuestion, keywords: parsedResponse.keywords }
    return (
      await Promise.all([
        getWorkspaceStructure(context, 500, cancellationToken).then(workspaceStructure => (workspaceStructure ? { kind: this.kind, userMessages: [workspaceStructure] } : void 0)),
        ...registeredResolvers.map(resolvers => resolvers.resolve(context, request, cancellationToken)),
      ])
    ).reduce(
      (result, toolResult) => ({
        kind: this.kind,
        userMessages: [...result.userMessages, ...(toolResult?.userMessages ?? [])],
        references: [...(result.references ?? []), ...(toolResult?.references ?? [])],
        usedContext: [...(result.usedContext ?? []), ...(toolResult?.usedContext ?? [])],
      }),
      { kind: this.kind, userMessages: [] }
    )
  }
}

async function getWorkspaceStructure(context, timeout = 500, cancellationToken) {
  let workspaceFolder = context.get(WorkspaceClass).getWorkspaceFolders().at(0)
  if (!workspaceFolder) return
  let directoryTree = await formatDirectoryTree(context, workspaceFolder, timeout, cancellationToken)
  return joinLines('I am working in a workspace that has the following structure:', '', wrapCodeWithBackticks('', directoryTree))
}

var codingAssistantInstructions = `
You are a coding assistant who help the user answer questions about code in their workspace by providing a list of relevant keywords they can search for to answer the question.
The user will provide you with potentially relevant information from the workspace. This information may be incomplete.
DO NOT ask the user for additional information or clarification.
DO NOT try to answer the user's question directly.

# Additional Rules

Think step by step:
1. Read the user's question to understand what they are asking about their workspace.

2. If there are pronouns in the question, such as 'it', 'that', 'this', try to understand what they refer to by looking at the rest of the question and the conversation history.

3. Output a precise version of question that resolves all pronouns to the nouns they stand for. Be sure to preserve the exact meaning of the question by only changing ambiguous pronouns.

4. Then output a short markdown list of up to 8 relevant keywords that user could try searching for to answer their question. These keywords could used as file name, symbol names, abbreviations, or comments in the relevant code. Put the keywords most relevant to the question first. Do not include overly generic keywords. Do not repeat keywords.

5. For each keyword in the markdown list of related keywords, if applicable add a comma separated list of variations after it. For example: for 'encode' possible variations include 'encoding', 'encoded', 'encoder', 'encoders'. Consider synonyms and plural forms. Do not repeat variations.

# Examples

User: Where's the code for base64 encoding?

Response:

Where's the code for base64 encoding?

- base64 encoding, base64 encoder, base64 encode
- base64, base 64
- encode, encoded, encoder, encoders
`.trim()
var SymbolResolver = new (class {
  constructor() {
    this.timeout = 15000
  }
  async resolve(accessor, query, cancellationToken) {
    let workspace = accessor.get(WorkspaceClass),
      tokenWindow = await calculateTokenWindow(accessor, { valueFor4096: 8, maxMultiplier: 4 })
    if (cancellationToken.isCancellationRequested) return
    let symbols = await this.getSymbols(accessor, query)
    if (!(symbols.length === 0 || cancellationToken.isCancellationRequested))
      return {
        kind: query.kind,
        userMessages: [
          joinLines(
            'Here are some potentially relevant symbols from the current workspace:',
            '',
            ...uniqueValues(symbols.map(symbol => `- ${symbol.name} \u2014 ${getRelativePath(workspace, symbol.location.uri)}`)).slice(0, tokenWindow)
          ),
        ],
      }
  }
  async getSymbols(accessor, query) {
    let ignoreService = accessor.get(IgnoreServiceIdentifier),
      foundSymbols = await Promise.all(
        query.keywords
          .flatMap(keyword => [keyword.keyword, ...keyword.variations])
          .map(keyword => timeoutPromise(accessor.get(BaseSymbolProvider).getWorkspaceSymbols(keyword), this.timeout))
      )
    return filterTruthyValues(foundSymbols.flat()).filter(symbol => !ignoreService.isIgnored(symbol.location.uri))
  }
})(),
  FileResolver = new (class {
    constructor() {
      this.timeout = 15000
    }
    async resolve(accessor, query, cancellationToken) {
      let workspace = accessor.get(WorkspaceClass),
        tokenWindow = await calculateTokenWindow(accessor, { valueFor4096: 8, maxMultiplier: 4 })
      if (cancellationToken.isCancellationRequested) return
      let foundFiles = await this.findFiles(accessor, query, tokenWindow, cancellationToken)
      if (!(foundFiles.length === 0 || cancellationToken.isCancellationRequested))
        return {
          kind: query.kind,
          userMessages: [
            joinLines(
              'Here are some potentially relevant file names from the workspace:',
              '',
              ...uniqueValues(foundFiles.map(file => `- ${getRelativePath(workspace, file)}`)).slice(0, tokenWindow)
            ),
          ],
        }
    }
    async findFiles(accessor, query, maxResults, cancellationToken) {
      let ignoreService = accessor.get(IgnoreServiceIdentifier),
        fileFinder = accessor.get(FileFinder),
        foundFiles = await Promise.all(
          query.keywords
            .flatMap(keyword => [keyword.keyword, ...keyword.variations])
            .map(keyword => timeoutPromise(Promise.resolve(fileFinder.findFiles(`**/*${keyword}*`, '**/node_modules/**', maxResults, cancellationToken)), this.timeout))
        )
      return filterTruthyValues(foundFiles.flat()).filter(file => !ignoreService.isIgnored(file))
    }
  })(),
  CodeExcerptResolver = new (class {
    async resolve(accessor, query, cancellationToken) {
      let workspace = accessor.get(WorkspaceClass),
        chunkSearch = accessor.get(WorkspaceChunkSearch),
        tokenWindow = await calculateTokenWindow(accessor, { valueFor4096: 8, maxMultiplier: 4 })
      if (cancellationToken.isCancellationRequested) return
      let searchCriteria = { fullText: query.fullQuestionText, keywords: query.keywords.flatMap(keyword => [keyword.keyword, ...keyword.variations]) },
        foundChunks = (await chunkSearch.searchFileChunks([searchCriteria], tokenWindow, cancellationToken)).slice(0, tokenWindow)
      if (cancellationToken.isCancellationRequested || !foundChunks.length) return
      let anchors = foundChunks
        .sort(
          (chunk1, chunk2) =>
            chunk1.file.fsPath.localeCompare(chunk2.file.fsPath) ||
            chunk1.range.start.compareTo(chunk2.range.start) ||
            chunk1.range.end.compareTo(chunk2.range.end)
        )
        .filter((chunk, index) => {
          for (let [otherIndex, otherChunk] of foundChunks.entries())
            if (
              index !== otherIndex &&
              chunk.file.fsPath === otherChunk.file.fsPath &&
              (otherChunk.isFullFile || chunk.range === otherChunk.range || otherChunk.range.contains(chunk.range))
            )
              return false
          return true
        })
        .map(chunk => new Anchor(chunk.isFullFile ? chunk.file : new VscodeLocation(chunk.file, chunk.range)))
      return {
        kind: query.kind,
        userMessages: [
          joinLines(
            'Here are some potentially relevant code excerpts from the workspace:',
            '',
            foundChunks.map(chunk => {
              let relativePath = getRelativePath(workspace, chunk.file)
              return joinLines(`\`${relativePath}\``, wrapCodeWithBackticks(getExtension(chunk.file).replace(/\./g, ''), chunk.text))
            }).join(`

`)
          ),
        ],
        references: anchors,
      }
    }
  })(),
  registeredResolvers = [SymbolResolver, FileResolver, CodeExcerptResolver]

function getRelativePath(workspace, file) {
  let folder = workspace.getWorkspaceFolder(file)
  return folder ? path.relative(folder.path, file.path) : file.fsPath
}

function uniqueValues(array) {
  return [...new Set(array)]
}

function joinLines(...lines) {
  return lines.join(`
`)
}

async function calculateTokenWindow(serviceAccessor, tokenConfig) {
  let maxTokenWindow = (await serviceAccessor.get(EndpointManager).getChatEndpointInfo()).modelMaxTokenWindow / 4096
  return clamp(Math.round(tokenConfig.valueFor4096 * maxTokenWindow), tokenConfig.valueFor4096, tokenConfig.valueFor4096 * tokenConfig.maxMultiplier)
}

var workspaceResolver = ContextResolverRegistry.register(new WorkspaceResolver())

var TerminalWorkspaceResolver = class {
  constructor() {
    this.kind = 'terminal-workspace'
  }
  async resolveContext(context, request, cancellationToken, progress) {
    let message = request.message
    if (!message) return
    let dataRetriever = context.get(DataRetriever)
    this.logger || (this.logger = context.get(LoggerManager).getLogger('workspaceResolver')),
      this.logger.debug('Determining whether workspace info is needed...'),
      progress.report({ message: requestLight.t('Determining whether to fetch info on the workspace') })
    let modelResponse = await dataRetriever.fetchOne(
      filterTruthyValues([
        { role: 'system', content: workspaceKnowledgeRules },
        { role: 'user', content: message },
      ]),
      async () => {},
      cancellationToken,
      2,
      await getDefaultChatEndpointInfo(context),
      { temperature: 0.1, top_p: 1, stop: ['dontStopBelieving'] },
      { messageSource: 'workspaceIntent' }
    )
    if (!cancellationToken.isCancellationRequested) {
      if (modelResponse.type !== 'success')
        throw new Error(
          requestLight.t('Encountered an error while deciding what workspace information to collect: {0}', modelResponse.type)
        )
      return modelResponse.value.trim() !== '0' ? workspaceResolver.resolveContext(context, request, cancellationToken, progress) : { kind: this.kind, userMessages: [] }
    }
  }
},
  workspaceKnowledgeRules = `
# Additional Rules

Think step by step:
1. Read the user's question to understand whether the question likely requires knowledge of the workspace.

2. Respond with 0 for general terminal questions unrelated to the workspace, or respond with 1 if workspace knowledge is required. If unsure, respond with 1.

# Examples

User: build the project

Response:

1

User: print hello world

Response:

0`.trim(),
terminalWorkspaceResolver = ContextResolverRegistry.register(new TerminalWorkspaceResolver())
function createScanner(input, e = !1) {
  let r = input.length,
    n = 0,
    i = '',
    o = 0,
    s = 16,
    a = 0,
    l = 0,
    c = 0,
    u = 0,
    p = 0
  function d(y, b) {
    let x = 0,
      P = 0
    for (; x < y || !b; ) {
      let U = input.charCodeAt(n)
      if (U >= 48 && U <= 57) P = P * 16 + U - 48
      else if (U >= 65 && U <= 70) P = P * 16 + U - 65 + 10
      else if (U >= 97 && U <= 102) P = P * 16 + U - 97 + 10
      else break
      n++, x++
    }
    return x < y && (P = -1), P
  }
  function setPosition(y) {
    ;(n = y), (i = ''), (o = 0), (s = 16), (p = 0)
  }
  function m() {
    let y = n
    if (input.charCodeAt(n) === 48) n++
    else for (n++; n < input.length && isDigit(input.charCodeAt(n)); ) n++
    if (n < input.length && input.charCodeAt(n) === 46)
      if ((n++, n < input.length && isDigit(input.charCodeAt(n)))) for (n++; n < input.length && isDigit(input.charCodeAt(n)); ) n++
      else return (p = 3), input.substring(y, n)
    let b = n
    if (n < input.length && (input.charCodeAt(n) === 69 || input.charCodeAt(n) === 101))
      if (
        (n++,
        ((n < input.length && input.charCodeAt(n) === 43) || input.charCodeAt(n) === 45) && n++,
        n < input.length && isDigit(input.charCodeAt(n)))
      ) {
        for (n++; n < input.length && isDigit(input.charCodeAt(n)); ) n++
        b = n
      } else p = 3
    return input.substring(y, b)
  }
  function h() {
    let y = '',
      b = n
    for (;;) {
      if (n >= r) {
        ;(y += input.substring(b, n)), (p = 2)
        break
      }
      let x = input.charCodeAt(n)
      if (x === 34) {
        ;(y += input.substring(b, n)), n++
        break
      }
      if (x === 92) {
        if (((y += input.substring(b, n)), n++, n >= r)) {
          p = 2
          break
        }
        switch (input.charCodeAt(n++)) {
          case 34:
            y += '"'
            break
          case 92:
            y += '\\'
            break
          case 47:
            y += '/'
            break
          case 98:
            y += '\b'
            break
          case 102:
            y += '\f'
            break
          case 110:
            y += `
`
            break
          case 114:
            y += '\r'
            break
          case 116:
            y += '	'
            break
          case 117:
            let U = d(4, !0)
            U >= 0 ? (y += String.fromCharCode(U)) : (p = 4)
            break
          default:
            p = 5
        }
        b = n
        continue
      }
      if (x >= 0 && x <= 31)
        if (isLineFeedOrCarriageReturn(x)) {
          ;(y += input.substring(b, n)), (p = 2)
          break
        } else p = 6
      n++
    }
    return y
  }
  function g() {
    if (((i = ''), (p = 0), (o = n), (l = a), (u = c), n >= r)) return (o = r), (s = 17)
    let y = input.charCodeAt(n)
    if (isSpaceOrTab(y)) {
      do n++, (i += String.fromCharCode(y)), (y = input.charCodeAt(n))
      while (isSpaceOrTab(y))
      return (s = 15)
    }
    if (isLineFeedOrCarriageReturn(y))
      return (
        n++,
        (i += String.fromCharCode(y)),
        y === 13 &&
        input.charCodeAt(n) === 10 &&
          (n++,
          (i += `
`)),
        a++,
        (c = n),
        (s = 14)
      )
    switch (y) {
      case 123:
        return n++, (s = 1)
      case 125:
        return n++, (s = 2)
      case 91:
        return n++, (s = 3)
      case 93:
        return n++, (s = 4)
      case 58:
        return n++, (s = 6)
      case 44:
        return n++, (s = 5)
      case 34:
        return n++, (i = h()), (s = 10)
      case 47:
        let b = n - 1
        if (input.charCodeAt(n + 1) === 47) {
          for (n += 2; n < r && !isLineFeedOrCarriageReturn(input.charCodeAt(n)); ) n++
          return (i = input.substring(b, n)), (s = 12)
        }
        if (input.charCodeAt(n + 1) === 42) {
          n += 2
          let x = r - 1,
            P = !1
          for (; n < x; ) {
            let U = input.charCodeAt(n)
            if (U === 42 && input.charCodeAt(n + 1) === 47) {
              ;(n += 2), (P = !0)
              break
            }
            n++, isLineFeedOrCarriageReturn(U) && (U === 13 && input.charCodeAt(n) === 10 && n++, a++, (c = n))
          }
          return P || (n++, (p = 1)), (i = input.substring(b, n)), (s = 13)
        }
        return (i += String.fromCharCode(y)), n++, (s = 16)
      case 45:
        if (((i += String.fromCharCode(y)), n++, n === r || !isDigit(input.charCodeAt(n)))) return (s = 16)
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return (i += m()), (s = 11)
      default:
        for (; n < r && v(y); ) n++, (y = input.charCodeAt(n))
        if (o !== n) {
          switch (((i = input.substring(o, n)), i)) {
            case 'true':
              return (s = 8)
            case 'false':
              return (s = 9)
            case 'null':
              return (s = 7)
          }
          return (s = 16)
        }
        return (i += String.fromCharCode(y)), n++, (s = 16)
    }
  }
  function v(y) {
    if (isSpaceOrTab(y) || isLineFeedOrCarriageReturn(y)) return !1
    switch (y) {
      case 125:
      case 93:
      case 123:
      case 91:
      case 34:
      case 58:
      case 44:
      case 47:
        return !1
    }
    return !0
  }
  function _() {
    let y
    do y = g()
    while (y >= 12 && y <= 15)
    return y
  }
  return {
    setPosition: setPosition,
    getPosition: () => n,
    scan: e ? _ : g,
    getToken: () => s,
    getTokenValue: () => i,
    getTokenOffset: () => o,
    getTokenLength: () => n - o,
    getTokenStartLine: () => l,
    getTokenStartCharacter: () => o - u,
    getTokenError: () => p,
  }
}
function isSpaceOrTab(character) {
  return character === 32 || character === 9
}
function isLineFeedOrCarriageReturn(character) {
  return character === 10 || character === 13
}
function isDigit(character) {
  return character >= 48 && character <= 57
}

var charCodes
;(function (charMap) {
  ;(charMap[(charMap.lineFeed = 10)] = 'lineFeed'),
    (charMap[(charMap.carriageReturn = 13)] = 'carriageReturn'),
    (charMap[(charMap.space = 32)] = 'space'),
    (charMap[(charMap._0 = 48)] = '_0'),
    (charMap[(charMap._1 = 49)] = '_1'),
    (charMap[(charMap._2 = 50)] = '_2'),
    (charMap[(charMap._3 = 51)] = '_3'),
    (charMap[(charMap._4 = 52)] = '_4'),
    (charMap[(charMap._5 = 53)] = '_5'),
    (charMap[(charMap._6 = 54)] = '_6'),
    (charMap[(charMap._7 = 55)] = '_7'),
    (charMap[(charMap._8 = 56)] = '_8'),
    (charMap[(charMap._9 = 57)] = '_9'),
    (charMap[(charMap.a = 97)] = 'a'),
    (charMap[(charMap.b = 98)] = 'b'),
    (charMap[(charMap.c = 99)] = 'c'),
    (charMap[(charMap.d = 100)] = 'd'),
    (charMap[(charMap.e = 101)] = 'e'),
    (charMap[(charMap.f = 102)] = 'f'),
    (charMap[(charMap.g = 103)] = 'g'),
    (charMap[(charMap.h = 104)] = 'h'),
    (charMap[(charMap.i = 105)] = 'i'),
    (charMap[(charMap.j = 106)] = 'j'),
    (charMap[(charMap.k = 107)] = 'k'),
    (charMap[(charMap.l = 108)] = 'l'),
    (charMap[(charMap.m = 109)] = 'm'),
    (charMap[(charMap.n = 110)] = 'n'),
    (charMap[(charMap.o = 111)] = 'o'),
    (charMap[(charMap.p = 112)] = 'p'),
    (charMap[(charMap.q = 113)] = 'q'),
    (charMap[(charMap.r = 114)] = 'r'),
    (charMap[(charMap.s = 115)] = 's'),
    (charMap[(charMap.t = 116)] = 't'),
    (charMap[(charMap.u = 117)] = 'u'),
    (charMap[(charMap.v = 118)] = 'v'),
    (charMap[(charMap.w = 119)] = 'w'),
    (charMap[(charMap.x = 120)] = 'x'),
    (charMap[(charMap.y = 121)] = 'y'),
    (charMap[(charMap.z = 122)] = 'z'),
    (charMap[(charMap.A = 65)] = 'A'),
    (charMap[(charMap.B = 66)] = 'B'),
    (charMap[(charMap.C = 67)] = 'C'),
    (charMap[(charMap.D = 68)] = 'D'),
    (charMap[(charMap.E = 69)] = 'E'),
    (charMap[(charMap.F = 70)] = 'F'),
    (charMap[(charMap.G = 71)] = 'G'),
    (charMap[(charMap.H = 72)] = 'H'),
    (charMap[(charMap.I = 73)] = 'I'),
    (charMap[(charMap.J = 74)] = 'J'),
    (charMap[(charMap.K = 75)] = 'K'),
    (charMap[(charMap.L = 76)] = 'L'),
    (charMap[(charMap.M = 77)] = 'M'),
    (charMap[(charMap.N = 78)] = 'N'),
    (charMap[(charMap.O = 79)] = 'O'),
    (charMap[(charMap.P = 80)] = 'P'),
    (charMap[(charMap.Q = 81)] = 'Q'),
    (charMap[(charMap.R = 82)] = 'R'),
    (charMap[(charMap.S = 83)] = 'S'),
    (charMap[(charMap.T = 84)] = 'T'),
    (charMap[(charMap.U = 85)] = 'U'),
    (charMap[(charMap.V = 86)] = 'V'),
    (charMap[(charMap.W = 87)] = 'W'),
    (charMap[(charMap.X = 88)] = 'X'),
    (charMap[(charMap.Y = 89)] = 'Y'),
    (charMap[(charMap.Z = 90)] = 'Z'),
    (charMap[(charMap.asterisk = 42)] = 'asterisk'),
    (charMap[(charMap.backslash = 92)] = 'backslash'),
    (charMap[(charMap.closeBrace = 125)] = 'closeBrace'),
    (charMap[(charMap.closeBracket = 93)] = 'closeBracket'),
    (charMap[(charMap.colon = 58)] = 'colon'),
    (charMap[(charMap.comma = 44)] = 'comma'),
    (charMap[(charMap.dot = 46)] = 'dot'),
    (charMap[(charMap.doubleQuote = 34)] = 'doubleQuote'),
    (charMap[(charMap.minus = 45)] = 'minus'),
    (charMap[(charMap.openBrace = 123)] = 'openBrace'),
    (charMap[(charMap.openBracket = 91)] = 'openBracket'),
    (charMap[(charMap.plus = 43)] = 'plus'),
    (charMap[(charMap.slash = 47)] = 'slash'),
    (charMap[(charMap.formFeed = 12)] = 'formFeed'),
    (charMap[(charMap.tab = 9)] = 'tab')
})(charCodes || (charCodes = {}))
var JsonParserSettings;
(function (settings) {
  settings.DEFAULT = { allowTrailingComma: false };
})(JsonParserSettings || (JsonParserSettings = {}));

function parseJson(jsonString, errors = [], settings = JsonParserSettings.DEFAULT) {
  let currentKey = null,
      currentObjectOrArray = [],
      objectOrArrayStack = [];

  function addValue(value) {
    Array.isArray(currentObjectOrArray) ? currentObjectOrArray.push(value) : currentKey !== null && (currentObjectOrArray[currentKey] = value);
  }

  return (
    parseJson1(
      jsonString,
      {
        onObjectBegin: () => {
          let newObject = {};
          addValue(newObject), objectOrArrayStack.push(currentObjectOrArray), (currentObjectOrArray = newObject), (currentKey = null);
        },
        onObjectProperty: key => {
          currentKey = key;
        },
        onObjectEnd: () => {
          currentObjectOrArray = objectOrArrayStack.pop();
        },
        onArrayBegin: () => {
          let newArray = [];
          addValue(newArray), objectOrArrayStack.push(currentObjectOrArray), (currentObjectOrArray = newArray), (currentKey = null);
        },
        onArrayEnd: () => {
          currentObjectOrArray = objectOrArrayStack.pop();
        },
        onLiteralValue: addValue,
        onError: (error, offset, length) => {
          errors.push({ error: error, offset: offset, length: length });
        },
      },
      settings
    ),
    currentObjectOrArray[0]
  );
}
function parseJson1(t, e, r = JsonParserSettings.DEFAULT) {
  let n = createScanner(t, !1),
    i = []
  function o(z) {
    return z
      ? () => z(n.getTokenOffset(), n.getTokenLength(), n.getTokenStartLine(), n.getTokenStartCharacter())
      : () => !0
  }
  function s(z) {
    return z
      ? () =>
          z(n.getTokenOffset(), n.getTokenLength(), n.getTokenStartLine(), n.getTokenStartCharacter(), () => i.slice())
      : () => !0
  }
  function a(z) {
    return z
      ? q => z(q, n.getTokenOffset(), n.getTokenLength(), n.getTokenStartLine(), n.getTokenStartCharacter())
      : () => !0
  }
  function l(z) {
    return z
      ? q =>
          z(q, n.getTokenOffset(), n.getTokenLength(), n.getTokenStartLine(), n.getTokenStartCharacter(), () =>
            i.slice()
          )
      : () => !0
  }
  let c = s(e.onObjectBegin),
    u = l(e.onObjectProperty),
    p = o(e.onObjectEnd),
    d = s(e.onArrayBegin),
    f = o(e.onArrayEnd),
    m = l(e.onLiteralValue),
    h = a(e.onSeparator),
    g = o(e.onComment),
    v = a(e.onError),
    _ = r && r.disallowComments,
    y = r && r.allowTrailingComma
  function b() {
    for (;;) {
      let z = n.scan()
      switch (n.getTokenError()) {
        case 4:
          x(14)
          break
        case 5:
          x(15)
          break
        case 3:
          x(13)
          break
        case 1:
          _ || x(11)
          break
        case 2:
          x(12)
          break
        case 6:
          x(16)
          break
      }
      switch (z) {
        case 12:
        case 13:
          _ ? x(10) : g()
          break
        case 16:
          x(1)
          break
        case 15:
        case 14:
          break
        default:
          return z
      }
    }
  }
  function x(z, q = [], L = []) {
    if ((v(z), q.length + L.length > 0)) {
      let S = n.getToken()
      for (; S !== 17; ) {
        if (q.indexOf(S) !== -1) {
          b()
          break
        } else if (L.indexOf(S) !== -1) break
        S = b()
      }
    }
  }
  function P(z) {
    let q = n.getTokenValue()
    return z ? m(q) : (u(q), i.push(q)), b(), !0
  }
  function U() {
    switch (n.getToken()) {
      case 11:
        let z = n.getTokenValue(),
          q = Number(z)
        isNaN(q) && (x(2), (q = 0)), m(q)
        break
      case 7:
        m(null)
        break
      case 8:
        m(!0)
        break
      case 9:
        m(!1)
        break
      default:
        return !1
    }
    return b(), !0
  }
  function H() {
    return n.getToken() !== 10
      ? (x(3, [], [2, 5]), !1)
      : (P(!1), n.getToken() === 6 ? (h(':'), b(), F() || x(4, [], [2, 5])) : x(5, [], [2, 5]), i.pop(), !0)
  }
  function j() {
    c(), b()
    let z = !1
    for (; n.getToken() !== 2 && n.getToken() !== 17; ) {
      if (n.getToken() === 5) {
        if ((z || x(4, [], []), h(','), b(), n.getToken() === 2 && y)) break
      } else z && x(6, [], [])
      H() || x(4, [], [2, 5]), (z = !0)
    }
    return p(), n.getToken() !== 2 ? x(7, [2], []) : b(), !0
  }
  function M() {
    d(), b()
    let z = !0,
      q = !1
    for (; n.getToken() !== 4 && n.getToken() !== 17; ) {
      if (n.getToken() === 5) {
        if ((q || x(4, [], []), h(','), b(), n.getToken() === 4 && y)) break
      } else q && x(6, [], [])
      z ? (i.push(0), (z = !1)) : i[i.length - 1]++, F() || x(4, [], [4, 5]), (q = !0)
    }
    return f(), z || i.pop(), n.getToken() !== 4 ? x(8, [4], []) : b(), !0
  }
  function F() {
    switch (n.getToken()) {
      case 3:
        return M()
      case 1:
        return j()
      case 10:
        return P(!0)
      default:
        return U()
    }
  }
  return (
    b(),
    n.getToken() === 17
      ? r.allowEmptyContent
        ? !0
        : (x(4, [], []), !1)
      : F()
      ? (n.getToken() !== 17 && x(9, [], []), !0)
      : (x(4, [], []), !1)
  )
}
var ParseError
;(function (error) {
  error[(error.None = 0)] = 'None';
  error[(error.UnexpectedEndOfComment = 1)] = 'UnexpectedEndOfComment';
  error[(error.UnexpectedEndOfString = 2)] = 'UnexpectedEndOfString';
  error[(error.UnexpectedEndOfNumber = 3)] = 'UnexpectedEndOfNumber';
  error[(error.InvalidUnicode = 4)] = 'InvalidUnicode';
  error[(error.InvalidEscapeCharacter = 5)] = 'InvalidEscapeCharacter';
  error[(error.InvalidCharacter = 6)] = 'InvalidCharacter';
})(ParseError || (ParseError = {}));

var TokenType
;(function (type) {
  type[(type.OpenBraceToken = 1)] = 'OpenBraceToken';
  type[(type.CloseBraceToken = 2)] = 'CloseBraceToken';
  type[(type.OpenBracketToken = 3)] = 'OpenBracketToken';
  type[(type.CloseBracketToken = 4)] = 'CloseBracketToken';
  type[(type.CommaToken = 5)] = 'CommaToken';
  type[(type.ColonToken = 6)] = 'ColonToken';
  type[(type.NullKeyword = 7)] = 'NullKeyword';
  type[(type.TrueKeyword = 8)] = 'TrueKeyword';
  type[(type.FalseKeyword = 9)] = 'FalseKeyword';
  type[(type.StringLiteral = 10)] = 'StringLiteral';
  type[(type.NumericLiteral = 11)] = 'NumericLiteral';
  type[(type.LineCommentTrivia = 12)] = 'LineCommentTrivia';
  type[(type.BlockCommentTrivia = 13)] = 'BlockCommentTrivia';
  type[(type.LineBreakTrivia = 14)] = 'LineBreakTrivia';
  type[(type.Trivia = 15)] = 'Trivia';
  type[(type.Unknown = 16)] = 'Unknown';
  type[(type.EOF = 17)] = 'EOF';
})(TokenType || (TokenType = {}));

var parseJson = parseJson;

var SyntaxError
;(function (error) {
  error[(error.InvalidSymbol = 1)] = 'InvalidSymbol';
  error[(error.InvalidNumberFormat = 2)] = 'InvalidNumberFormat';
  error[(error.PropertyNameExpected = 3)] = 'PropertyNameExpected';
  error[(error.ValueExpected = 4)] = 'ValueExpected';
  error[(error.ColonExpected = 5)] = 'ColonExpected';
  error[(error.CommaExpected = 6)] = 'CommaExpected';
  error[(error.CloseBraceExpected = 7)] = 'CloseBraceExpected';
  error[(error.CloseBracketExpected = 8)] = 'CloseBracketExpected';
  error[(error.EndOfFileExpected = 9)] = 'EndOfFileExpected';
  error[(error.InvalidCommentToken = 10)] = 'InvalidCommentToken';
  error[(error.UnexpectedEndOfComment = 11)] = 'UnexpectedEndOfComment';
  error[(error.UnexpectedEndOfString = 12)] = 'UnexpectedEndOfString';
  error[(error.UnexpectedEndOfNumber = 13)] = 'UnexpectedEndOfNumber';
  error[(error.InvalidUnicode = 14)] = 'InvalidUnicode';
  error[(error.InvalidEscapeCharacter = 15)] = 'InvalidEscapeCharacter';
  error[(error.InvalidCharacter = 16)] = 'InvalidCharacter';
})(SyntaxError || (SyntaxError = {}));

async function reportProgressAfterDelay(progress, message, promise, delay) {
  let timeoutId = null,
    isDone = false;
  timeoutId = setTimeout(() => {
    if (!isDone) {
      progress.report(message);
    }
  }, delay);
  try {
    let result = await promise;
    isDone = true;
    return result;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function generateSettingDescription(setting) {
  let description = `Setting Id: ${setting.key}
`;
  description += `Type: ${setting.type}
`;
  description += `Description: ${setting.description ?? setting.markdownDescription ?? ''}
`;
  if (setting.enum) {
    description += `Possible values:
`;
    for (let i = 0; i < setting.enum.length; i++) {
      description += ` - ${setting.enum[i]} - ${setting.enumDescriptions?.[i] ?? ''}
`;
    }
  }
  description += `
`;
  return description;
}

var RelatedInformationProvider = class extends EmbeddingsManager {
  constructor(logger, embeddingsComputer, items, relatedInformationConfig, ...args) {
    super(...args);
    this.relatedInformationConfig = relatedInformationConfig;
    this.isIndexLoaded = false;
  }
  async provideRelatedInformation(request, cancellationToken) {
    let startTime = Date.now();
    if (!this.isIndexLoaded) {
      this.calculateEmbeddings();
      this.logger.debug(`Related Information: Index not loaded yet triggering background calculation, returning ${Date.now() - startTime}ms`);
      return [];
    }
    if (cancellationToken.isCancellationRequested) {
      this.logger.debug(`Related Information: Request cancelled, returning ${Date.now() - startTime}ms`);
      return [];
    }
    let computationStartTime = Date.now();
    let embeddings = await this.embeddingsComputer.computeEmbeddings([request], cancellationToken);
    if (cancellationToken.isCancellationRequested || !embeddings || !embeddings[0]) {
      this.logger.debug(`Related Information: Request cancelled or no match found, returning ${Date.now() - startTime}ms`);
      return [];
    }
    let relatedInformation = [];
    for (let item of this.items.values()) {
      if (cancellationToken.isCancellationRequested) {
        this.logger.debug(`Related Information: Request cancelled, returning ${Date.now() - startTime}ms`);
        break;
      }
      if (item.embedding) {
        let similarity = cosineSimilarity(embeddings[0], item.embedding);
        if (similarity > this.relatedInformationConfig.threshold) {
          relatedInformation.push(this.toRelatedInformation(item, similarity));
        }
      }
    }
    this.logger.debug(`Related Information: Successfully Calculated, returning ${Date.now() - startTime}ms`);
    return relatedInformation.sort((a, b) => b.weight - a.weight).slice(0, this.relatedInformationConfig.maxResults);
  }
},
var CommandRelatedInfoProvider = class extends RelatedInformationProvider {
  constructor(accessor, buildInfo) {
    super(
      'CommandIdIndex',
      accessor,
      1,
      'commandEmbeddings',
      getMajorMinorVersion(accessor.get(buildInfo).getEditorInfo().version),
      buildInfo,
      { type: 2, threshold: 0.7, maxResults: 100 },
      { type: 'commands', supportsExtensions: true }
    )
    this.accessor = accessor
  }
  async getLatestItems() {
    let commands = await this.accessor.get(BaseVSCodeInfoProvider).getAllCommands()
    commands.push({
        label: 'Extensions: Search the marketplace for extensions',
        command: 'workbench.extensions.search',
        keybinding: 'Not set',
    });
    commands.push({
        label: 'Extensions: Install extension from marketplace',
        command: 'workbench.extensions.installExtension',
        keybinding: 'Not set',
    });
    return commands.map(command => ({
        key: command.command,
        label: command.label.replace('View: Toggle', 'View: Toggle or Show or Hide'),
        originalLabel: command.label,
        keybinding: command.keybinding ?? 'Not set',
    }));
  }
  getEmbeddingQueryString(command) {
    return `${command.label} - ${command.key}`
  }
  toRelatedInformation(command, weight) {
    return { type: 2, weight: weight, command: command.key }
  }
},
var SettingsRelatedInfoProvider = class extends RelatedInformationProvider {
  constructor(accessor, buildInfo) {
    super(
      'SettingsIndex',
      accessor,
      1,
      'settingEmbeddings',
      getMajorMinorVersion(accessor.get(buildInfo).getEditorInfo().version),
      buildInfo,
      { type: 4, threshold: 0.7, maxResults: 100 },
      { type: 'settings', supportsExtensions: true }
    )
    this.accessor = accessor;
    this.isIndexLoaded = false;
  }
  async getLatestItems() {
    let settings = await this.accessor.get(BaseVSCodeInfoProvider).getAllSettings();
    let nonDeprecatedSettings = [];
    for (let key of Object.keys(settings)) {
      let setting = settings[key];
      if (!setting.deprecationMessage && !setting.markdownDeprecationMessage) {
        nonDeprecatedSettings.push({ ...setting, key: key });
      }
    }
    return nonDeprecatedSettings;
  }
  getEmbeddingQueryString(setting) {
    return generateSettingDescription(setting);
  }
  toRelatedInformation(setting, weight) {
    return { type: 4, weight: weight, setting: setting.key };
  }
};
var IndexLoader = class {
  constructor(provider) {
    this._commandIdIndex = provider.get(CommandRelatedInfoProvider);
    this._settingsIndex = provider.get(SettingsRelatedInfoProvider);
  }
  async loadIndexes() {
    await Promise.all([
      this._commandIdIndex.isIndexLoaded ? Promise.resolve() : this._commandIdIndex.calculateEmbeddings(),
      this._settingsIndex.isIndexLoaded ? Promise.resolve() : this._settingsIndex.calculateEmbeddings(),
    ]);
  }
  async getClosestValues(query, numResults) {
    await this.loadIndexes();
    return {
      commands: this._commandIdIndex.getClosestValues(query, numResults),
      settings: this._settingsIndex.getClosestValues(query, numResults)
    };
  }
  hasSetting(settingKey) {
    return this._settingsIndex.hasItem(settingKey);
  }
  hasCommand(commandKey) {
    return this._commandIdIndex.hasItem(commandKey);
  }
  getSetting(settingKey) {
    return this._settingsIndex.getItem(settingKey);
  }
  getCommand(commandKey) {
    return this._commandIdIndex.getItem(commandKey);
  }
}

async function loadAndProcessIndexes(container, response) {
  let indexLoader = container.get(IndexLoader);
  await indexLoader.loadIndexes();
  let processedData = processResponse1(indexLoader, response.response?.message ?? '');
  return generateCommands(indexLoader, processedData.settings, processedData.commands);
}

function processResponse1(extension, response) {
  let settings = []
  response = response.replace(/\n/g, '')
  let jsonPattern = /```(json)?\s*([\s\S]+?)\s*```/g,
    jsonMatches = response.match(jsonPattern)
  for (let jsonMatch of jsonMatches ?? []) {
    let json = jsonMatch.replace(/```(json)?\s*|\s*```/g, ''),
      parsedJson
    try {
      parsedJson = parseJson(json)
    } catch {}
    parsedJson && !Array.isArray(parsedJson) && settings.push(parsedJson)
  }
  let commands = [],
    commandPattern = /\[COMMANDS START\]```(?:json)?(.+)\[COMMANDS END\]/g,
    commandMatch
  for (commandMatch of response.matchAll(commandPattern)) {
    let commandJson = commandMatch[1].trim(),
      parsedCommandJson
    try {
      parsedCommandJson = parseJson(commandJson)
    } catch {}
    parsedCommandJson && Array.isArray(parsedCommandJson) && commands.push(...parsedCommandJson)
  }
  let settingsValidationFailed = settings
      .map(setting => {
        for (let key of Object.keys(setting)) if (!extension.hasSetting(key)) return false
        return true
      })
      .some(result => result === false),
    commandsValidationFailed = commands
      .map(command => {
        if (command.command && !extension.hasCommand(command.command)) return false
      })
      .some(result => result === false)
  return { settings: settings, commands: commands, validationFailed: settingsValidationFailed || commandsValidationFailed }
}

async function generateCommands(extension, settings, commands) {
  let generatedCommands = [],
    commandCount = commands.length
  for (let setting of settings) {
    let args = ''
    for (let key of Object.keys(setting))
      generatedCommands.some(cmd => cmd.args && cmd.args[0].includes(`@id:${key}`)) || (extension.hasSetting(key) && (args += `@id:${key} `))
    args = args.trimEnd(),
      args && generatedCommands.push({ commandId: 'workbench.action.openSettings', args: [args], title: 'Show in Settings Editor' })
  }
  for (let command of commands)
    if (command.command === 'workbench.extensions.search' || command.command === 'workbench.extensions.installExtension') {
      let args = (Array.isArray(command.args) ? command.args : [command.args]).filter(arg => typeof arg == 'string')
      if (args.length === 1) {
        let categories = [
          'featured',
          'popular',
          'recentlyPublished',
          'recommended',
          'updates',
          'builtin',
          'enabled',
          'disabled',
          'installed',
          'workspaceUnsupported',
        ]
        args[0].includes(':') && !args[0].startsWith('@') ? (args[0] = `@${args[0]}`) : categories.includes(args[0]) && (args[0] = `@${args[0]}`)
      }
      generatedCommands.push({ commandId: 'workbench.extensions.search', args: args, title: 'Search Extension Marketplace' })
    } else {
      let cmd = extension.getCommand(command.command)
      if (!cmd) continue
      generatedCommands.push({
        commandId: 'workbench.action.quickOpen',
        args: [`>${cmd.originalLabel}`],
        title: commandCount > 1 ? `Show "${cmd.originalLabel}"` : 'Show in Command Palette',
      })
    }
  return generatedCommands
}

var vscodeContextMessage = `
The current question is related to VS Code. The application is currently open.
If a command or setting is not a valid answer, but it still relates to VS Code, please still respond.
Please do not guess a response and instead just respond with a polite apology if you are unsure.
If you believe the given context given to you is incorrect or not relevant you may ignore it.
At the end of your response, if you reference a command, you must include a section wrapped with [COMMANDS START] and [COMMANDS END] that lists all commands you referenced in your response.
The user cannot see the context you are given, so you must not mention it. If you want to refer to it, you must include it in your reply.
`.trimStart()
var VSCodeContextResolver = class {
  constructor() {
    this.kind = 'vscode'
    this.metaContextResolverInfo = { description: 'Relevant information about VS Code.' }
    this._docsSearchAvailable = false
  }
  async searchDocsForContext(serviceLocator, query, limit, cancellationToken) {
    this._docsSearchClient ||
      ((this._docsSearchClient = serviceLocator.get(DocsSearchClient)), (this._docsSearchAvailable = await this._docsSearchClient.isAvailable()))
    let docsContext = `

Below is a list of information from the VS Code documentation which might be relevant to the question. Feel free to use this context to help you formulate your response, but you are not required to.
`
    if (this._docsSearchAvailable) {
      let searchResults = await this._docsSearchClient.search(query, { repo: 'microsoft/vscode-docs' }, limit, 0.75, cancellationToken)
      for (let result of searchResults)
        docsContext += `
##${result?.title?.trim()} - ${result.path}
${result.contents}`
    }
  }
  async resolveContext(serviceLocator, context, cancellationToken, progress) {
    let vscodeContextMessage = vscodeContextMessage + `

`
    this._embeddingCompute ??= serviceLocator.get(EmbeddingsComputer)
    let message = context.message
    if (!message || !progress) return
    let docsSearch = await reportProgressAfterDelay(progress, { message: 'Searching doc index....' }, this.searchDocsForContext(serviceLocator, message, 10, cancellationToken), 1000)
    this._commandsAndSettingsIndex || (this._commandsAndSettingsIndex = serviceLocator.get(IndexLoader))
    let embeddings = await this._embeddingCompute?.computeEmbeddings([message], cancellationToken)
    if (!embeddings || cancellationToken.isCancellationRequested) return
    vscodeContextMessage +=
      'Below is a list of commands and settings we found which might be relevant to the question. For view related commands "Toggle" often means Show or Hide. A setting may reference another setting, that will appear as `#setting.id#`, you must return the referenced setting as well. You may use this context to help you formulate your response, but are not required to.'
    let closestValues = await reportProgressAfterDelay(
      progress,
      { message: 'Searching command and setting index....' },
      this._commandsAndSettingsIndex.nClosestValues(embeddings[0], 5),
      500
    )
    return (
      closestValues.commands.length &&
        ((vscodeContextMessage += `Here are some possible commands:
`),
        (vscodeContextMessage += closestValues.commands.map(command => `- ${command.label} ("${command.key}") (Keybinding: "${command.keybinding}")`).join(`
`))),
      closestValues.settings.length &&
        (closestValues.commands.length &&
          (vscodeContextMessage += `

`),
        (vscodeContextMessage += `Here are some possible settings:
`),
        (vscodeContextMessage += closestValues.settings.map(setting => generateSettingDescription(setting)).join(`
`))),
      this._docsSearchAvailable && (vscodeContextMessage += docsSearch),
      {
        kind: this.kind,
        userMessages: [
          `Relevant information about VS Code:
` + vscodeContextMessage,
        ],
      }
    )
  }
}
var vSCodeContextResolver = ContextResolverRegistry.register(new VSCodeContextResolver())
var util = require('util')
class WorkspaceLabelCollector {
  constructor() {
    this.indicators = new Map();
    this.contentIndicators = new Map();
    this._labels = [];
    this.initIndicators();
  }

  get labels() {
    if (this._labels.includes('javascript') && this._labels.includes('typescript')) {
      let index = this._labels.indexOf('javascript');
      this._labels.splice(index, 1);
    }
    return this._labels;
  }

  async collectContext(workspace) {
    let folders = workspace.get(WorkspaceClass).getWorkspaceFolders();
    if (folders) {
      for (let i = 0; i < folders.length; i++) {
        await this.addContextForFolders(workspace, folders[i]);
      }
    }
  }

  async addContextForFolders(workspace, folder) {
    for (let [indicator, labels] of this.indicators.entries()) {
      await this.addLabelIfApplicable(workspace, folder, indicator, labels);
    }
  }

  async addLabelIfApplicable(workspace, folder, indicator, labels) {
    let path = VscodeUri.joinPath(folder, indicator);
    try {
      await workspace.get(BaseFileSystemOperations).stat(path);
      labels.forEach(label => this._labels.push(label));
      let contentIndicator = this.contentIndicators.get(indicator);
      if (contentIndicator) {
        let content = await workspace.get(BaseFileSystemOperations).readFile(path);
        try {
          contentIndicator(new util.TextDecoder().decode(content)).forEach(label => this._labels.push(label));
        } catch {}
      }
    } catch {}
  }

  initIndicators() {
    this.addIndicator('package.json', 'javascript', 'npm');
    this.addIndicator('tsconfig.json', 'typescript');
    this.addIndicator('pom.xml', 'java', 'maven');
    this.addIndicator('build.gradle', 'java', 'gradle');
    this.addIndicator('requirements.txt', 'python', 'pip');
    this.addIndicator('Pipfile', 'python', 'pip');
    this.addIndicator('Cargo.toml', 'rust', 'cargo');
    this.addIndicator('go.mod', 'go', 'go.mod');
    this.addIndicator('pubspec.yaml', 'dart', 'pub');
    this.addIndicator('build.sbt', 'scala', 'sbt');
    this.addIndicator('build.boot', 'clojure', 'boot');
    this.addIndicator('project.clj', 'clojure', 'lein');
    this.addIndicator('mix.exs', 'elixir', 'mix');
    this.addIndicator('composer.json', 'php', 'composer');
    this.addIndicator('Gemfile', 'ruby', 'bundler');
    this.addIndicator('build.xml', 'java', 'ant');
    this.addIndicator('build.gradle.kts', 'java', 'gradle');
    this.addIndicator('yarn.lock', 'yarn');
    this.addContentIndicator('package.json', this.collectPackageJsonIndicators);
  }

  addIndicator(indicator, ...labels) {
    this.indicators.set(indicator, labels);
  }

  addContentIndicator(indicator, contentIndicator) {
    this.contentIndicators.set(indicator, contentIndicator);
  }

  collectPackageJsonIndicators(content) {
    let labels = [];
    let json = JSON.parse(content);
    let dependencies = json.dependencies;
    let devDependencies = json.devDependencies;
    if (dependencies) {
      if (dependencies['@angular/core']) labels.push('angular');
      if (dependencies.react) labels.push('react');
      if (dependencies.vue) labels.push('vue');
    }
    if (devDependencies && devDependencies.typescript) labels.push('typescript');
    let engines = json.engines;
    if (engines) {
      if (engines.node) labels.push('node');
      if (engines.vscode) labels.push('vscode extension');
    }
    return labels;
  }
}
class ProjectLabelResolver {
  constructor(workspaceLabelCollector) {
    this.workspaceLabels = workspaceLabelCollector;
    this.kind = 'project-labels';
  }

  async resolveContext(workspace, context) {
    await this.workspaceLabels.collectContext(workspace);
    if (this.workspaceLabels.labels.length > 0) {
      let labels = [...new Set(this.workspaceLabels.labels)]
        .sort()
        .reduce((accumulator, label) => `${accumulator}\n- ${label}`, '')
        .trim();
      return {
        kind: this.kind,
        userMessages: [
          `I am working on a project of the following nature:\n` + labels,
        ],
      };
    }
  }
}
var workspaceLabelCollector = new WorkspaceLabelCollector(),
var contextResolverRegistry = ContextResolverRegistry.register(new ProjectLabelResolver(workspaceLabelCollector))
var Reporter = class {
  async reportInline(e, r, n) {}
  async reportChat(e) {}
}
var requestLight = handleDefaultExports(requestLight())
class TextApplier {
  constructor(deltaApplier) {
    this.deltaApplier = deltaApplier;
    this._appliedLength = 0;
    this._appliedText = '';
  }

  get appliedText() {
    return Promise.resolve(this._appliedText);
  }

  apply(text) {
    let remainingText = text.substring(this._appliedLength, text.length);
    this.append(remainingText);
  }

  async append(text) {
    this.deltaApplier(text);
    this._appliedLength += text.length;
    this._appliedText += text;
  }
}
class AsyncIterableTextApplier extends TextApplier {
  constructor() {
    super(delta => this._source.emitOne(delta));
    this._source = new DeferredAsyncIterable();
  }

  get asyncIterable() {
    return this._source.asyncIterable;
  }

  finish() {
    this._source.resolve();
  }
}
var requestLight = handleDefaultExports(requestLight())
class TextDiff {
  constructor(originalStart, originalLength, modifiedStart, modifiedLength) {
    this.originalStart = originalStart;
    this.originalLength = originalLength;
    this.modifiedStart = modifiedStart;
    this.modifiedLength = modifiedLength;
  }

  getOriginalEnd() {
    return this.originalStart + this.originalLength;
  }

  getModifiedEnd() {
    return this.modifiedStart + this.modifiedLength;
  }
}


class LineOperator {
  constructor(lines) {
    this.lines = lines;
  }

  getElements() {
    let elements = [];
    for (let index = 0, length = this.lines.length; index < length; index++) {
      elements[index] = this.lines[index].trim();
    }
    return elements;
  }

  getCharCount() {
    let count = 0;
    for (let line of this.lines) {
      count += line.length;
    }
    return count;
  }
}

class Assert {
  static Assert(condition, message) {
    if (!condition) throw new Error(message);
  }
}

class ArrayCopy {
  static Copy(source, sourceIndex, destination, destinationIndex, length) {
    for (let i = 0; i < length; i++) {
      destination[destinationIndex + i] = source[sourceIndex + i];
    }
  }

  static Copy2(source, sourceIndex, destination, destinationIndex, length) {
    for (let i = 0; i < length; i++) {
      destination[destinationIndex + i] = source[sourceIndex + i];
    }
  }
}

class TextChangeTracker {
  constructor() {
    this.changes = [];
    this.originalStart = Number.MAX_SAFE_INTEGER;
    this.modifiedStart = Number.MAX_SAFE_INTEGER;
    this.originalCount = 0;
    this.modifiedCount = 0;
  }

  markNextChange() {
    if (this.originalCount > 0 || this.modifiedCount > 0) {
      this.changes.push(
        new TextDiff(this.originalStart, this.originalCount, this.modifiedStart, this.modifiedCount)
      );
    }
    this.originalCount = 0;
    this.modifiedCount = 0;
    this.originalStart = Number.MAX_SAFE_INTEGER;
    this.modifiedStart = Number.MAX_SAFE_INTEGER;
  }

  addOriginalElement(originalIndex, modifiedIndex) {
    this.originalStart = Math.min(this.originalStart, originalIndex);
    this.modifiedStart = Math.min(this.modifiedStart, modifiedIndex);
    this.originalCount++;
  }

  addModifiedElement(originalIndex, modifiedIndex) {
    this.originalStart = Math.min(this.originalStart, originalIndex);
    this.modifiedStart = Math.min(this.modifiedStart, modifiedIndex);
    this.modifiedCount++;
  }

  getChanges() {
    if (this.originalCount > 0 || this.modifiedCount > 0) {
      this.markNextChange();
    }
    return this.changes;
  }

  getReverseChanges() {
    if (this.originalCount > 0 || this.modifiedCount > 0) {
      this.markNextChange();
    }
    this.changes.reverse();
    return this.changes;
  }
}
var DiffAlgorithm = class {
  constructor(original, modified) {
    let [originalStrings, originalHash] = DiffAlgorithm._getElements(original),
      [modifiedStrings, modifiedHash] = DiffAlgorithm._getElements(modified)
    this._originalStringElements = originalStrings
    this._originalElementsOrHash = originalHash
    this._modifiedStringElements = modifiedStrings
    this._modifiedElementsOrHash = modifiedHash
    this.forwardHistory = []
    this.reverseHistory = []
  }
  static _getElements(element) {
    let elements = element.getElements(),
      hashArray = new Int32Array(elements.length)
    for (let i = 0, length = elements.length; i < length; i++)
      hashArray[i] = this._stringHash(elements[i], 0)
    return [elements, hashArray]
  }
  static _numberHash(number, hash) {
    return ((hash << 5) - hash + number) | 0
  }
  static _stringHash(string, hash) {
    hash = this._numberHash(149417, hash)
    for (let index = 0, length = string.length; index < length; index++)
      hash = this._numberHash(string.charCodeAt(index), hash)
    return hash
  }
  elementsAreEqual(originalIndex, modifiedIndex) {
    return this._originalElementsOrHash[originalIndex] !== this._modifiedElementsOrHash[modifiedIndex]
      ? false
      : this._originalStringElements[originalIndex] === this._modifiedStringElements[modifiedIndex]
  }
  computeDiff() {
    return this._computeDiff(0, this._originalElementsOrHash.length - 1, 0, this._modifiedElementsOrHash.length - 1)
  }
  _computeDiff(originalStart, originalEnd, modifiedStart, modifiedEnd) {
    return this.computeDiffRecursive(originalStart, originalEnd, modifiedStart, modifiedEnd)
  }
  computeDiffRecursive(originalStart, originalEnd, modifiedStart, modifiedEnd) {
    // Trim common elements from the start
    while (originalStart <= originalEnd && modifiedStart <= modifiedEnd && this.elementsAreEqual(originalStart, modifiedStart)) {
      originalStart++
      modifiedStart++
    }

    // Trim common elements from the end
    while (originalEnd >= originalStart && modifiedEnd >= modifiedStart && this.elementsAreEqual(originalEnd, modifiedEnd)) {
      originalEnd--
      modifiedEnd--
    }

    if (originalStart > originalEnd || modifiedStart > modifiedEnd) {
      let diffResult
      if (modifiedStart <= modifiedEnd) {
        Assert.assert(originalStart === originalEnd + 1, 'originalStart should only be one more than originalEnd')
        diffResult = [new TextDiff(originalStart, 0, modifiedStart, modifiedEnd - modifiedStart + 1)]
      } else if (originalStart <= originalEnd) {
        Assert.assert(modifiedStart === modifiedEnd + 1, 'modifiedStart should only be one more than modifiedEnd')
        diffResult = [new TextDiff(originalStart, originalEnd - originalStart + 1, modifiedStart, 0)]
      } else {
        Assert.assert(originalStart === originalEnd + 1, 'originalStart should only be one more than originalEnd')
        Assert.assert(modifiedStart === modifiedEnd + 1, 'modifiedStart should only be one more than modifiedEnd')
        diffResult = []
      }
      return diffResult
    }

    let midOriginal = [0],
      midModified = [0]
    let recursionPoint = this.computeRecursionPoint(originalStart, originalEnd, modifiedStart, modifiedEnd, midOriginal, midModified)
    if (recursionPoint !== null) return recursionPoint

    let diffResult1 = this.computeDiffRecursive(originalStart, midOriginal[0], modifiedStart, midModified[0])
    let diffResult2 = this.computeDiffRecursive(midOriginal[0] + 1, originalEnd, midModified[0] + 1, modifiedEnd)
    return this.concatenateChanges(diffResult1, diffResult2)
  }
    WALKTRACE(e, r, n, i, o, s, a, l, c, u, p, d, f, m, h, g, v) {
      let _ = null,
        y = null,
        b = new TextChangeTracker(),
        x = r,
        P = n,
        U = f[0] - g[0] - i,
        H = -1073741824,
        j = this.m_forwardHistory.length - 1
      do {
        let M = U + e
        M === x || (M < P && c[M - 1] < c[M + 1])
          ? ((p = c[M + 1]),
            (m = p - U - i),
            p < H && b.MarkNextChange(),
            (H = p),
            b.AddModifiedElement(p + 1, m),
            (U = M + 1 - e))
          : ((p = c[M - 1] + 1),
            (m = p - U - i),
            p < H && b.MarkNextChange(),
            (H = p - 1),
            b.AddOriginalElement(p, m + 1),
            (U = M - 1 - e)),
          j >= 0 && ((c = this.m_forwardHistory[j]), (e = c[0]), (x = 1), (P = c.length - 1))
      } while (--j >= -1)
      ;(_ = b.getReverseChanges()),
        (b = new TextChangeTracker()),
        (x = s),
        (P = a),
        (U = f[0] - g[0] - l),
        (H = 1073741824),
        (j = v ? this.m_reverseHistory.length - 1 : this.m_reverseHistory.length - 2)
      do {
        let M = U + o
        M === x || (M < P && u[M - 1] >= u[M + 1])
          ? ((p = u[M + 1] - 1),
            (m = p - U - l),
            p > H && b.MarkNextChange(),
            (H = p + 1),
            b.AddOriginalElement(p + 1, m + 1),
            (U = M + 1 - o))
          : ((p = u[M - 1]),
            (m = p - U - l),
            p > H && b.MarkNextChange(),
            (H = p),
            b.AddModifiedElement(p + 1, m + 1),
            (U = M - 1 - o)),
          j >= 0 && ((u = this.m_reverseHistory[j]), (o = u[0]), (x = 1), (P = u.length - 1))
      } while (--j >= -1)
      return (y = b.getChanges()), this.ConcatenateChanges(_, y)
    }
    ComputeRecursionPoint(e, r, n, i, o, s) {
      let a = 0,
        l = 0,
        c = 0,
        u = 0,
        p = 0,
        d = 0
      e--, n--, (o[0] = 0), (s[0] = 0), (this.m_forwardHistory = []), (this.m_reverseHistory = [])
      let f = r - e + (i - n),
        m = f + 1,
        h = new Int32Array(m),
        g = new Int32Array(m),
        v = i - n,
        _ = r - e,
        y = e - n,
        b = r - i,
        P = (_ - v) % 2 === 0
      ;(h[v] = e), (g[_] = r)
      for (let U = 1; U <= f / 2 + 1; U++) {
        let H = 0,
          j = 0
        ;(c = this.ClipDiagonalBound(v - U, U, v, m)), (u = this.ClipDiagonalBound(v + U, U, v, m))
        for (let M = c; M <= u; M += 2) {
          M === c || (M < u && h[M - 1] < h[M + 1]) ? (a = h[M + 1]) : (a = h[M - 1] + 1), (l = a - (M - v) - y)
          let F = a
          for (; a < r && l < i && this.ElementsAreEqual(a + 1, l + 1); ) a++, l++
          if (((h[M] = a), a + l > H + j && ((H = a), (j = l)), !P && Math.abs(M - _) <= U - 1 && a >= g[M]))
            return (
              (o[0] = a),
              (s[0] = l),
              F <= g[M] && 1447 > 0 && U <= 1447 + 1
                ? this.WALKTRACE(v, c, u, y, _, p, d, b, h, g, a, r, o, l, i, s, P)
                : null
            )
        }
        ;(p = this.ClipDiagonalBound(_ - U, U, _, m)), (d = this.ClipDiagonalBound(_ + U, U, _, m))
        for (let M = p; M <= d; M += 2) {
          M === p || (M < d && g[M - 1] >= g[M + 1]) ? (a = g[M + 1] - 1) : (a = g[M - 1]), (l = a - (M - _) - b)
          let F = a
          for (; a > e && l > n && this.ElementsAreEqual(a, l); ) a--, l--
          if (((g[M] = a), P && Math.abs(M - v) <= U && a <= h[M]))
            return (
              (o[0] = a),
              (s[0] = l),
              F >= h[M] && 1447 > 0 && U <= 1447 + 1
                ? this.WALKTRACE(v, c, u, y, _, p, d, b, h, g, a, r, o, l, i, s, P)
                : null
            )
        }
        if (U <= 1447) {
          let M = new Int32Array(u - c + 2)
          ;(M[0] = v - c + 1),
          ArrayCopy.Copy2(h, c, M, 1, u - c + 1),
            this.m_forwardHistory.push(M),
            (M = new Int32Array(d - p + 2)),
            (M[0] = _ - p + 1),
            ArrayCopy.Copy2(g, p, M, 1, d - p + 1),
            this.m_reverseHistory.push(M)
        }
      }
      return this.WALKTRACE(v, c, u, y, _, p, d, b, h, g, a, r, o, l, i, s, P)
    }
    ConcatenateChanges(e, r) {
      let n = []
      if (e.length === 0 || r.length === 0) return r.length > 0 ? r : e
      if (this.ChangesOverlap(e[e.length - 1], r[0], n)) {
        let i = new Array(e.length + r.length - 1)
        return ArrayCopy.Copy(e, 0, i, 0, e.length - 1), (i[e.length - 1] = n[0]), ArrayCopy.Copy(r, 1, i, e.length, r.length - 1), i
      } else {
        let i = new Array(e.length + r.length)
        return ArrayCopy.Copy(e, 0, i, 0, e.length), ArrayCopy.Copy(r, 0, i, e.length, r.length), i
      }
    }
    ChangesOverlap(e, r, n) {
      if (
        (Assert.Assert(e.originalStart <= r.originalStart, 'Left change is not less than or equal to right change'),
        Assert.Assert(e.modifiedStart <= r.modifiedStart, 'Left change is not less than or equal to right change'),
        e.originalStart + e.originalLength >= r.originalStart || e.modifiedStart + e.modifiedLength >= r.modifiedStart)
      ) {
        let i = e.originalStart,
          o = e.originalLength,
          s = e.modifiedStart,
          a = e.modifiedLength
        return (
          e.originalStart + e.originalLength >= r.originalStart &&
            (o = r.originalStart + r.originalLength - e.originalStart),
          e.modifiedStart + e.modifiedLength >= r.modifiedStart &&
            (a = r.modifiedStart + r.modifiedLength - e.modifiedStart),
          (n[0] = new TextDiff(i, o, s, a)),
          !0
        )
      } else return (n[0] = null), !1
    }
    ClipDiagonalBound(e, r, n, i) {
      if (e >= 0 && e < i) return e
      let o = n,
        s = i - n - 1,
        a = r % 2 === 0
      if (e < 0) {
        let l = o % 2 === 0
        return a === l ? 0 : 1
      } else {
        let l = s % 2 === 0
        return a === l ? i - 1 : i - 2
      }
    }
  }
class TextAlignment {
  constructor() {
    this.spacesDiff = 0;
    this.looksLikeAlignment = false;
  }
}
function calculateAlignment(str1, len1, str2, len2, alignment) {
  alignment.spacesDiff = 0;
  alignment.looksLikeAlignment = false;

  let commonLength;
  for (commonLength = 0; commonLength < len1 && commonLength < len2; commonLength++) {
    let charCode1 = str1.charCodeAt(commonLength),
      charCode2 = str2.charCodeAt(commonLength);
    if (charCode1 !== charCode2) break;
  }

  let spaces1 = 0,
    nonSpaces1 = 0;
  for (let i = commonLength; i < len1; i++) str1.charCodeAt(i) === 32 ? spaces1++ : nonSpaces1++;

  let spaces2 = 0,
    nonSpaces2 = 0;
  for (let i = commonLength; i < len2; i++) str2.charCodeAt(i) === 32 ? spaces2++ : nonSpaces2++;

  if ((spaces1 > 0 && nonSpaces1 > 0) || (spaces2 > 0 && nonSpaces2 > 0)) return;

  let nonSpacesDiff = Math.abs(nonSpaces1 - nonSpaces2),
    spacesDiff = Math.abs(spaces1 - spaces2);

  if (nonSpacesDiff === 0) {
    alignment.spacesDiff = spacesDiff;
    if (
      spacesDiff > 0 &&
      0 <= spaces2 - 1 &&
      spaces2 - 1 < str1.length &&
      spaces2 < str2.length &&
      str2.charCodeAt(spaces2) !== 32 &&
      str1.charCodeAt(spaces2 - 1) === 32 &&
      str1.charCodeAt(str1.length - 1) === 44
    ) {
      alignment.looksLikeAlignment = true;
    }
    return;
  }

  if (spacesDiff % nonSpacesDiff === 0) {
    alignment.spacesDiff = spacesDiff / nonSpacesDiff;
    return;
  }
}
function calculateIndentation(text, defaultTabSize, defaultInsertSpaces) {
  let lineCount = Math.min(text.getLineCount(), 1e4),
    tabLines = 0,
    spaceLines = 0,
    previousLine = '',
    previousLineIndentation = 0,
    tabSizes = [2, 4, 6, 8, 3, 5, 7],
    maxTabSize = 8,
    tabSizeCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0],
    alignment = new TextAlignment();

  for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
    let lineLength = text.getLineLength(lineNumber),
      lineContent = text.getLineContent(lineNumber),
      hasNonWhitespace = false,
      indentationLength = 0,
      spaceCount = 0,
      tabCount = 0;

    for (let charIndex = 0, charCount = lineLength; charIndex < charCount; charIndex++) {
      let charCode = lineContent.charCodeAt(charIndex);
      if (charCode === 9) tabCount++;
      else if (charCode === 32) spaceCount++;
      else {
        hasNonWhitespace = true;
        indentationLength = charIndex;
        break;
      }
    }

    if (!hasNonWhitespace || (tabCount > 0 ? tabLines++ : spaceCount > 1 && spaceLines++, calculateAlignment(previousLine, previousLineIndentation, lineContent, indentationLength, alignment), alignment.looksLikeAlignment && !(defaultInsertSpaces && defaultTabSize === alignment.spacesDiff)))
      continue;

    let spacesDiff = alignment.spacesDiff;
    if (spacesDiff <= maxTabSize) tabSizeCounts[spacesDiff]++;
    previousLine = lineContent;
    previousLineIndentation = indentationLength;
  }

  let insertSpaces = defaultInsertSpaces;
  if (tabLines !== spaceLines) insertSpaces = tabLines < spaceLines;

  let tabSize = defaultTabSize;
  if (insertSpaces) {
    let maxCount = insertSpaces ? 0 : 0.1 * lineCount;
    tabSizes.forEach(size => {
      let count = tabSizeCounts[size];
      if (count > maxCount) {
        maxCount = count;
        tabSize = size;
      }
    });

    if (tabSize === 4 && tabSizeCounts[4] > 0 && tabSizeCounts[2] > 0 && tabSizeCounts[2] >= tabSizeCounts[4] / 2) {
      tabSize = 2;
    }
  }

  return { insertSpaces: insertSpaces, tabSize: tabSize };
}

function calculateIndentationLength(text, tabSize) {
  let indentationLength = 0,
    charIndex = 0,
    textLength = text.length;

  for (; charIndex < textLength; ) {
    let charCode = text.charCodeAt(charIndex);
    if (charCode === 32) indentationLength++;
    else if (charCode === 9) indentationLength = indentationLength - (indentationLength % tabSize) + tabSize;
    else break;
    charIndex++;
  }

  return charIndex === textLength ? -1 : indentationLength;
}

function calculateIndentationLevel(text, tabSize) {
  let indentationLength = calculateIndentationLength(text, tabSize);
  return indentationLength === -1 ? indentationLength : Math.floor(indentationLength / tabSize);
}

function roundUpToNextMultiple(number, multiple) {
  return number + multiple - (number % multiple);
}

function createIndentationString(text, tabSize, useSpaces) {
  let indentationLength = 0;
  for (let charIndex = 0; charIndex < text.length; charIndex++) text.charAt(charIndex) === '\t' ? (indentationLength = roundUpToNextMultiple(indentationLength, tabSize)) : indentationLength++;

  let indentationString = '';
  if (!useSpaces) {
    let tabCount = Math.floor(indentationLength / tabSize);
    indentationLength = indentationLength % tabSize;
    for (let tabIndex = 0; tabIndex < tabCount; tabIndex++) indentationString += '\t';
  }

  for (let spaceIndex = 0; spaceIndex < indentationLength; spaceIndex++) indentationString += ' ';
  return indentationString;
}

function replaceIndentation(text, tabSize, useSpaces) {
  let firstNonWhitespaceCharIndex = findFirstNonWhitespaceChar(text);
  if (firstNonWhitespaceCharIndex === -1) firstNonWhitespaceCharIndex = text.length;
  return createIndentationString(text.substring(0, firstNonWhitespaceCharIndex), tabSize, useSpaces) + text.substring(firstNonWhitespaceCharIndex);
}

var TextEditGroup = class {
  constructor(firstLineIndex, endLineIndex, lines) {
    this.firstLineIndex = firstLineIndex;
    this.endLineIndex = endLineIndex;
    this.lines = lines;
  }
  toTextEdit() {
    let text =
      this.lines.length > 0
        ? this.lines.join('\n') + '\n'
        : '';
    return VscodeTextEdit.replace(new VscodeRange(this.firstLineIndex, 0, this.endLineIndex, 0), text);
  }
},
TextUtils;

((TextUtils) => {
function fromString(text) {
  return text.length === 0 ? [] : text.split(/\r\n|\r|\n/g);
}
TextUtils.fromString = fromString;
})((TextUtils ||= {}));

var DocumentContext = class {
  constructor(text, languageId) {
    this.text = text;
    this.languageId = languageId;
  }
  static fromDocumentContext(context) {
    return new DocumentContext(context.document.getText(), context.language.languageId);
  }
}

function processInputText(input, editor, rawText, marker, importFilter, options) {
  let lines = TextUtils.fromString(rawText)
  if (lines.length === editor.range.lines.length && editor.range.lines.every((line, index) => line === lines[index])) return []
  let startMarker = findStartMarker(editor, lines, importFilter),
    processedLines = [],
    hasFakeMarkers = false
  for (let line of lines) {
    let markerType = identifyMarkerType(editor, line)
    markerType === null ? processedLines.push(line) : (markerType.type === 'fakestart' || markerType.type === 'fakend') && (hasFakeMarkers = true)
  }
  let edit = generateEdit(input, editor, processedLines, importFilter),
    finalEdit
  if (!startMarker) finalEdit = edit
  else if (!edit) finalEdit = startMarker
  else {
    let markerScore = calculateMarkerScore(startMarker)
    calculateMarkerScore(edit) < markerScore ? (finalEdit = edit) : (finalEdit = startMarker)
  }
  finalEdit || (finalEdit = generateEdit(input, editor, marker, importFilter, hasFakeMarkers, processedLines))
  let edits = [finalEdit]
  return options && (edits = filterImports(options, edits)), edits.map(edit => edit.toTextEdit())
}

function generateEdit(input, editor, markerScore, importFilter, hasFakeMarkers, processedLines) {
  let logger = input.get(LoggerManager).getLogger('editGeneration')
  return hasFakeMarkers
    ? (logger.info('(case 6) Appending to selected code'), appendToBottom(editor.range, processedLines, importFilter))
    : markerScore === 3
    ? (logger.info('(case 7) Appending to selected code'), appendToBottom(editor.range, processedLines, importFilter))
    : markerScore === 1
    ? (logger.info('(case 8) Prepending to selected code'),
    createTextEditGroupAtFirstLine(
        editor.range,
        adjustIndentation(
          processedLines,
          editor.range.lines.filter(line => line.trim() !== '').length > 0
            ? { whichLine: 'topMost', lines: editor.range.lines }
            : { whichLine: 'bottomMost', lines: editor.above.lines },
          importFilter
        )
      ))
    : (logger.info('(Default) Replacing selected code'), generateTextEditGroup(editor.range, processedLines, importFilter))
}

function calculateMarkerScore(marker) {
  let lineDifference = marker.endLineIndex - marker.firstLineIndex,
    lineCount = marker.lines.length
  return lineDifference + lineCount
}

function findStartMarker(markerGroup, markers, textEditGroup) {
  let startMarker = null,
    markerList = []
  for (let marker of markers) {
    let identifiedMarker = identifyMarkerType(markerGroup, marker)
    if (identifiedMarker === null) markerList.push(marker)
    else if (startMarker) {
      if (identifiedMarker.type === 'end' && identifiedMarker.endMarker === startMarker) return generateTextEditGroup(startMarker, markerList, textEditGroup)
      if (identifiedMarker.type === 'end' && startMarker === markerGroup.above && identifiedMarker.endMarker === markerGroup.range) {
        let newRange = markerGroup.range.clone()
        return newRange.mergeFromAbove(markerGroup.above.clone()), generateTextEditGroup(newRange, markerList, textEditGroup)
      } else if (identifiedMarker.type === 'end' && startMarker === markerGroup.above && identifiedMarker.endMarker === markerGroup.below) {
        let newRange = markerGroup.range.clone()
        return newRange.mergeFromAbove(markerGroup.above.clone()), newRange.mergeFromBelow(markerGroup.below.clone()), generateTextEditGroup(newRange, markerList, textEditGroup)
      } else markerList.push(marker)
    } else identifiedMarker.type === 'start' && ((startMarker = identifiedMarker.startMarker), (markerList = []))
  }
  if (markerList.length > 0 && startMarker) return generateTextEditGroup(startMarker, markerList, textEditGroup)
}

function filterImports(document, textEditGroups) {
  let filteredGroups = [],
    lines = document.text.split(/\r\n|\r|\n/g),
    lastImportIndex = findLastIndex(lines, line => isImportStatement(line, document.languageId)),
    importLines = []
  for (let group of textEditGroups) {
    if (group.endLineIndex <= lastImportIndex + 1) return textEditGroups
    let isImport = false,
      nonImportLines = [],
      groupLines = group.lines
    for (let line of groupLines) isImportStatement(line, document.languageId) ? (importLines.push(trimLeadingSpaces(line)), (isImport = true)) : (isImport && line.length === 0) || (nonImportLines.push(line), (isImport = false))
    if (!isImport && nonImportLines.length > 0) {
      if (group.firstLineIndex < lastImportIndex + 1) return textEditGroups
      filteredGroups.push(new TextEditGroup(group.firstLineIndex, group.endLineIndex, nonImportLines))
    }
  }
  if (importLines.length === 0) return textEditGroups
  let newGroupIndex = lastImportIndex + 1
  return filteredGroups.unshift(new TextEditGroup(newGroupIndex, newGroupIndex, importLines)), filteredGroups
}

function findLastIndex(array, predicate) {
  for (let index = array.length - 1; index >= 0; index--) if (predicate(array[index])) return index
  return -1
}

function trimLeadingSpaces(text) {
  return text.replace(/^\s+/g, '')
}

function isImportStatement(line, languageId) {
  switch (languageId) {
    case 'java':
      return !!line.match(/^\s*import\s/)
    case 'typescript':
    case 'javascript':
      return !!line.match(/^\s*import[\s{*]|^\s*[var|const|let].*=\s*require\(/)
    case 'php':
      return !!line.match(/^\s*use/)
    case 'rust':
      return !!line.match(/^\s*use\s+[\w:{}, ]+\s*(as\s+\w+)?;/)
    case 'python':
      return !!line.match(/^\s*from\s+[\w.]+\s+import\s+[\w, *]+$/) || !!line.match(/^\s*import\s+[\w, ]+$/)
    default:
      return false
  }
}

var tabRegex = /^(\t+)/,
spaceMap = new Map()

function getSpaceRegex(spaceCount) {
  if (!spaceMap.has(spaceCount)) {
    spaceMap.set(spaceCount, new RegExp(`^(( {${spaceCount}})+)`));
  }
  return spaceMap.get(spaceCount);
}

function getIndentationInfo(line, insertSpaces, tabSize) {
  let regex = insertSpaces ? getSpaceRegex(tabSize) : tabRegex,
    match = line.match(regex)
  return match ? [match[0], match[0].length / (insertSpaces ? tabSize : 1)] : ['', 0]
}

function calculateMinIndentLevel(lines) {
  let lineInfo = {
      getLineCount: function () {
        return lines.length
      },
      getLineLength: function (index) {
        return lines[index - 1].length
      },
      getLineContent: function (index) {
        return lines[index - 1]
      },
    },
    { insertSpaces, tabSize } = calculateIndentation(lineInfo, 4, false),
    minIndentLevel = Number.MAX_VALUE

  for (let line of lines) {
    if (/^\s*$/.test(line)) continue
    let [, indentLevel] = getIndentationInfo(line, insertSpaces, tabSize)
    minIndentLevel = Math.min(minIndentLevel, indentLevel)
  }
  return { insertSpaces, tabSize, minIndentLevel }
}

function generateIndentation(character, count) {
  if (count === 0) return ''
  if (character === ' ')
    switch (count) {
      case 2:
        return '  '
      case 4:
        return '    '
      case 8:
        return '        '
      case 12:
        return '            '
    }
  if (character === '\t')
    switch (count) {
      case 1:
        return '\t'
      case 2:
        return '\t\t'
      case 3:
        return '\t\t\t'
    }
  return new Array(count).fill(character).join('')
}

function getIndentLevelFromLines(linesInfo, indentationInfo) {
  let lines = linesInfo.lines,
    lineToCheck
  if (linesInfo.whichLine === 'topMost') lineToCheck = lines.find(line => line !== '')
  else
    for (let i = lines.length - 1; i >= 0; --i)
      if (lines[i] !== '') {
        lineToCheck = lines[i]
        break
      }
  return lineToCheck === undefined ? 0 : getIndentationInfo(lineToCheck, indentationInfo.insertSpaces, indentationInfo.tabSize)[1]
}

function adjustIndentation(lines, linesInfo, indentationInfo) {
  if (indentationInfo === undefined) return lines
  let currentIndentLevel = getIndentLevelFromLines(linesInfo, indentationInfo),
    minIndentInfo = calculateMinIndentLevel(lines),
    indentation = indentationInfo.insertSpaces ? generateIndentation(' ', indentationInfo.tabSize) : '\t'
  return lines.map(line => {
    if (line === '') return ''
    {
      let [indentationString, indentLevel] = getIndentationInfo(line, minIndentInfo.insertSpaces, minIndentInfo.tabSize),
        content = line.substring(indentationString.length)
      return generateIndentation(indentation, currentIndentLevel + (indentLevel - minIndentInfo.minIndentLevel)) + content
    }
  })
}

function identifyMarkerType(markers, line) {
  switch (line) {
    case markers.above.startMarker:
      return { type: 'start', startMarker: markers.above }
    case markers.above.endMarker:
      return { type: 'end', endMarker: markers.above }
    case markers.range.startMarker:
      return { type: 'start', startMarker: markers.range }
    case markers.range.endMarker:
      return { type: 'end', endMarker: markers.range }
    case markers.below.startMarker:
      return { type: 'start', startMarker: markers.below }
    case markers.below.endMarker:
      return { type: 'end', endMarker: markers.below }
  }
  return line.trimStart().startsWith(BlockComment.begin(markers.language))
    ? { type: 'fakestart' }
    : line.trimStart().startsWith(BlockComment.end(markers.language))
    ? { type: 'fakend' }
    : null
}

function generateEdit(serviceLocator, editContext, modifiedLines, options) {
  let computeDiffMetrics = (diffResult, originalLines, modifiedLines) => {
      let totalCharsRemoved = 0
      for (let diff of diffResult)
        for (let lineIndex = diff.originalStart; lineIndex < diff.originalStart + diff.originalLength; lineIndex++) {
          let line = originalLines.lines[lineIndex]
          totalCharsRemoved += line.length
        }
      let originalCharCount = originalLines.getCharCount(),
        modifiedCharCount = modifiedLines.getCharCount(),
        equalCharCount = originalCharCount - totalCharsRemoved
      return {
        equalCharCount: equalCharCount,
        originalCharCount: originalCharCount,
        modifiedCharCount: modifiedCharCount,
        originalCharRatio: originalCharCount > 0 ? equalCharCount / originalCharCount : 0,
        modifiedCharRatio: modifiedCharCount > 0 ? equalCharCount / modifiedCharCount : 0,
      }
    },
    computeDiffForRange = range => {
      let originalLines = new LineOperator(range.lines),
        modifiedLinesOperator = new LineOperator(modifiedLines),
        diffResult = new DiffAlgorithm(originalLines, modifiedLinesOperator).ComputeDiff()
      return computeDiffMetrics(diffResult, originalLines, modifiedLinesOperator)
    },
    entireRange = editContext.range.clone()
  entireRange.mergeFromAbove(editContext.above.clone()), entireRange.mergeFromBelow(editContext.below.clone())
  let entireDiffMetrics = computeDiffForRange(entireRange),
    selectedDiffMetrics = computeDiffForRange(editContext.range),
    diffMetrics = { diffToEntireScore: entireDiffMetrics, diffToRangeScore: selectedDiffMetrics },
    logger = serviceLocator.get(LoggerManager).getLogger('editGeneration')
  if ((logger.info(`Diff metrics: ${JSON.stringify(diffMetrics, null, '	')}`), entireDiffMetrics.originalCharCount > 30 && entireDiffMetrics.originalCharRatio > 0.7))
    return logger.info('(case 1) Replacing entire code'), generateTextEditGroup(entireRange, modifiedLines, options)
  if (selectedDiffMetrics.originalCharCount > 20 && selectedDiffMetrics.originalCharRatio > 0.7)
    return logger.info('(case 2) Replacing selected code'), generateTextEditGroup(editContext.range, modifiedLines, options)
  let minEntireRatio = Math.min(entireDiffMetrics.originalCharRatio, entireDiffMetrics.modifiedCharRatio),
    minSelectedRatio = Math.min(selectedDiffMetrics.originalCharRatio, selectedDiffMetrics.modifiedCharRatio)
  if (minEntireRatio > 0.2 && minEntireRatio > minSelectedRatio) return logger.info('(case 3) Replacing entire code'), generateTextEditGroup(entireRange, modifiedLines, options)
  if (minSelectedRatio > 0.2) return logger.info('(case 4) Replacing selected code'), generateTextEditGroup(editContext.range, modifiedLines, options)
  if (!editContext.range.hasContent)
    return (
      logger.info('(case 5) Replacing empty selected code'),
      generateTextEditGroup(editContext.range, modifiedLines, options, { whichLine: 'bottomMost', lines: editContext.above.lines })
    )
}
function generateTextEditGroup(range, lines, indentation, options) {
  let adjustedLines = adjustIndentation(lines, options ?? { whichLine: 'topMost', lines: range.lines }, indentation).slice(0),
    originalLines = range.lines.slice(0),
    firstLineIndex = range.firstLineIndex,
    lastLineIndex = range.lastLineIndex
  if (originalLines.length === 1 && originalLines[0] === '') return new TextEditGroup(lastLineIndex, lastLineIndex, adjustedLines)
  let commonPrefixLength = findCommonPrefixLength(originalLines, adjustedLines)
  if (((firstLineIndex += commonPrefixLength), originalLines.splice(0, commonPrefixLength), adjustedLines.splice(0, commonPrefixLength), originalLines.length === 0)) return new TextEditGroup(lastLineIndex + 1, lastLineIndex + 1, adjustedLines)
  let commonSuffixLength = findCommonSuffixLength(originalLines, adjustedLines)
  return (
    (lastLineIndex -= commonSuffixLength),
    originalLines.splice(originalLines.length - commonSuffixLength, commonSuffixLength),
    adjustedLines.splice(adjustedLines.length - commonSuffixLength, commonSuffixLength),
    originalLines.length === 0 ? new TextEditGroup(firstLineIndex, firstLineIndex, adjustedLines) : new TextEditGroup(firstLineIndex, lastLineIndex + 1, adjustedLines)
  )
}

function findCommonPrefixLength(array1, array2) {
  let minLength = Math.min(array1.length, array2.length)
  for (let index = 0; index < minLength; index++) if (array1[index] !== array2[index]) return index
  return minLength
}

function findCommonSuffixLength(array1, array2) {
  let minLength = Math.min(array1.length, array2.length)
  for (let index = 0; index < minLength; index++) if (array1[array1.length - 1 - index] !== array2[array2.length - 1 - index]) return index
  return minLength
}

function createTextEditGroupAtFirstLine(range, lines) {
  return new TextEditGroup(range.firstLineIndex, range.firstLineIndex, lines)
}

function appendToBottom(range, lines, indentation) {
  let adjustedLines = adjustIndentation(lines, { whichLine: 'bottomMost', lines: range.lines }, indentation),
    nextLineIndex = range.lastLineIndex + 1
  return new TextEditGroup(nextLineIndex, nextLineIndex, adjustedLines)
}

function createInlineEdit(edits, newWholeRange, content, followUp) {
  return { type: 'inlineEdit', edits: edits, newWholeRange: newWholeRange, content: content, followUp: followUp }
}

function extractCodeBlock(context, text, filePathComment) {
  let codeBlock = findCodeBlock(context, text)
  if (!codeBlock) return null
  let { code, contentBeforeCode, language } = codeBlock
  if (FilePathComment.testLine(filePathComment, code)) {
    let newLineIndex = code.indexOf(`
`)
    code = code.substring(newLineIndex).trim()
  }
  return { code, contentBeforeCode, language }
}

function findCodeBlock(context, text) {
  text = text.trim()
  let codeStartIndex = text.startsWith('```') ? 0 : text.indexOf('```')
  if (codeStartIndex !== -1) {
    let codeEndIndex = text.indexOf('\n```', codeStartIndex + 1)
    codeEndIndex === -1 && (codeEndIndex = text.indexOf('```', codeStartIndex + 1))
    let codeBlockEndIndex = codeEndIndex !== -1 ? codeEndIndex : text.length,
      codeContentStartIndex = text.indexOf(
        `
`,
        codeStartIndex + 1
      ),
      codeContent = text.substring(codeContentStartIndex, codeBlockEndIndex)
    codeContent = codeContent.trim()
    let contentBeforeCode = text.substring(0, codeStartIndex).trim(),
      language = text.substring(codeStartIndex + 3, codeContentStartIndex).trim()
    return { code: codeContent, contentBeforeCode, language }
  }
  let lines = text.split(/\r\n|\r|\n/g),
    isCodeStarted = false,
    contentLines = [],
    codeLines = []
  for (let line of lines) {
    let markerType = identifyMarkerType(context, line)
    if (isCodeStarted) {
      if (markerType)
        return (
          codeLines.push(line),
          {
            code: codeLines.join(`
`),
            contentBeforeCode: contentLines.join(`
`),
            language: '',
          }
        )
      codeLines.push(line)
    } else markerType ? ((isCodeStarted = true), codeLines.push(line)) : contentLines.push(line)
  }
  return null
}

var BaseVariableResolver = class {}
async function resolveContexts(context, resolvers, param1, param2, param3) {
  let resolvedContexts = await Promise.all(resolvers.map(resolver => resolver.resolveContext(context, param1, param2, param3)))
  return filterTruthyValues(resolvedContexts)
}

function filterKinds(kinds, filterSet) {
  let filteredKinds = [],
    kindMap = new Map()
  for (let kind of kinds)
    if (!filterSet.has(kind.kind) && !kindMap.has(kind.kind)) {
      kindMap.set(kind.kind, filteredKinds.length)
      filteredKinds.push(kind)
    }
  let kindIndex = kindMap.get(activeEditorContextResolver.kind)
  if (kindIndex !== void 0 && kindMap.has(currentSelectionContextResolver.kind))
    filteredKinds.splice(kindIndex, 1)
  return filteredKinds
}

var ChatMessageProcessor = class {
  constructor(accessor, maxResponseTokens, maxTokenTestOverride) {
    this.accessor = accessor;
    this.maxResponseTokens = maxResponseTokens;
    this.maxTokenTestOverride = maxTokenTestOverride;
  }

  async toChatMessages(chatSession, systemContent, tokenLimit, isContextMerged = false) {
    let maxTokens = await this.computeMaxRequestTokens(tokenLimit),
      successfulTurns = chatSession.turns.filter(turn => turn.status === 'success' || turn.status === 'in-progress'),
      messages = [{ role: 'system', content: systemContent }],
      totalTokenCount = calculateTokenLength(this.accessor, messages),
      contextMessages = [];

    for (let i = successfulTurns.length - 1; i >= 0; i--) {
      let isLastTurn = i === successfulTurns.length - 1,
        currentTurn = successfulTurns[i],
        turnMessages = await this.turnToMessages(currentTurn, isLastTurn),
        turnTokenCount = calculateTokenLength(this.accessor, turnMessages);

      while (totalTokenCount + turnTokenCount >= maxTokens && turnMessages.length >= 1) {
        turnMessages.shift();
        turnTokenCount = calculateTokenLength(this.accessor, turnMessages);
      }

      if (!turnMessages.length && currentTurn instanceof ShortMessageSession) {
        let shorterMessage = await currentTurn.getShorterMessage();
        turnMessages.push({ role: 'user', content: shorterMessage, isContext: true });
        turnTokenCount = calculateTokenLength(this.accessor, turnMessages);

        while (totalTokenCount + turnTokenCount >= maxTokens && turnMessages.length >= 1) {
          turnMessages.shift();
          turnTokenCount = calculateTokenLength(this.accessor, turnMessages);
        }

        if (!turnMessages.length) throw new Error(vscodeL10n.t('Sorry, the included context is too long.'));
      }

      if (isLastTurn && !turnMessages.length) throw new Error(vscodeL10n.t('Sorry, this message is too long. Please try a shorter question.'));

      if (totalTokenCount + turnTokenCount < maxTokens) {
        contextMessages = [...turnMessages, ...contextMessages];
        totalTokenCount += turnTokenCount;
      } else break;
    }

    if (isContextMerged) {
      let lastMessage = messages[messages.length - 1];
      for (let i = messages.length - 2; i >= 0; i--) {
        let currentMessage = messages[i];
        if (currentMessage.isContext) {
          lastMessage.content = currentMessage.content + '\n\n' + lastMessage.content;
          messages.splice(i, 1);
        } else break;
      }
    }

    return { messages: messages.map(message => ({ role: message.role, content: message.content })), tokenCount: totalTokenCount };
  }
  async computeMaxRequestTokens(modelParams) {
    let maxTokenWindow = this.maxTokenTestOverride ?? modelParams.modelMaxTokenWindow
    if (this.maxResponseTokens !== void 0) return maxTokenWindow - this.maxResponseTokens
    let tokenRatio = maxTokenWindow < 8192 ? 0.25 : maxTokenWindow < 16384 ? 0.15 : 0.1
    return Math.floor(maxTokenWindow * (1 - tokenRatio))
  }
  async turnToMessages(turn, isLastTurn) {
    let messages = []
    if (isLastTurn) {
      turn.contextParts.forEach(contextPart => {
        contextPart.userMessages.forEach(userMessage => {
          messages.push({
            role: 'user',
            content: userMessage + `\n\n`,
          })
        })
      })
    }
    messages.push({ role: 'user', content: turn.request.message, isContext: turn.request.isContext })
    if (turn.response && turn.response.type !== 'meta') {
      messages.push({ role: 'assistant', content: turn.response.message })
    }
    return messages
  }
}
var ChatBuilder = class {
  constructor(accessor, options, location, context) {
    this.accessor = accessor;
    this.options = options;
    this.location = location;
    this.context = context;
    this._promptVariablesService = accessor.get(BaseVariableResolver);
  }
  get selectionContextMetadata() {
    return this._selectionContextMetadata;
  }
  async buildPrompt(conversation, endpoint, variables, reporter, context, session) {
    let latestTurn = conversation.getLatestTurn(),
      resolvedPrompt = await this._promptVariablesService.resolveVariablesInPrompt(latestTurn.request.message, variables),
      kindsSet = new Set(resolvedPrompt.parts.map(part => part.kind));
    latestTurn.request.message = resolvedPrompt.message;
    let contextResolvers = this.options.contextResolvers;
    Array.isArray(contextResolvers) || (contextResolvers = await contextResolvers.provideResolvers(conversation, context, session));
    contextResolvers = filterKinds(contextResolvers, kindsSet);
    let promptContext = { conversation: conversation, endpoint: endpoint, message: latestTurn.request.message, documentContext: this.context },
      resolvedContexts = await resolveContexts(this.accessor, contextResolvers, promptContext, session, reporter),
      sessions = [],
      references = [];
    for (let { userMessages: messages, usedContext: usedDocs, references: refs, metadata: meta, getShorterMessage: getShortMsg } of [
      resolvedPrompt.parts,
      resolvedContexts,
    ].flat()) {
      for (let message of messages)
        getShortMsg
          ? sessions.push(new ShortMessageSession({ message: message, type: 'user', isContext: true }, getShortMsg))
          : sessions.push(new Session({ message: message, type: 'user', isContext: true }));
      usedDocs && reporter.report({ documents: usedDocs });
      refs && references.push(...refs);
      !this._selectionContextMetadata && contextInfo.is(meta) && (this._selectionContextMetadata = meta);
    }
    let uniqueReferences = processAnchors(references);
    for (let ref of uniqueReferences) reporter.report({ reference: ref.anchor });
    conversation = new Conversation(conversation.turns);
    sessions.length > 0 && conversation.insertBeforeLatestTurn(sessions);
    let systemMessage;
    if (this.location === 1) {
      let rules = this.options.rules ?? (this.context && generateInstructions(this.context));
      systemMessage = this.createInlineChatSystemMessage(rules ?? '');
    } else if (this.location === 2) {
      systemMessage = await this.createPanelChatSystemMessage(endpoint);
    }
    systemMessage ??= await generateAssistantMessage(this.accessor, this.location, endpoint);
    if (this.options.turnFilter && this.location === 2) {
      let filteredTurns = this.options.turnFilter(conversation.turns);
      conversation = new Conversation(filteredTurns);
    }
    let latestTurnAfterFilter = conversation.getLatestTurn();
    if (latestTurnAfterFilter) {
      latestTurnAfterFilter.references = uniqueReferences;
      if (this.options.queryPrefix) {
        latestTurnAfterFilter.request.message = `${this.options.queryPrefix} ${latestTurnAfterFilter.request.message}`.trim();
      }
    }
    return new ChatMessageProcessor(this.accessor, this.accessor.get(conversationOptions).maxResponseTokens).toChatMessages(conversation, systemMessage, endpoint, false);
  }
  async createPanelChatSystemMessage(endpoint) {
    let systemPromptOptions = this.options.systemPromptOptions?.roleplay || this.options.systemPromptOptions,
      assistantMessage = systemPromptOptions
        ? await generateAssistantMessage(this.accessor, this.location, endpoint, this.options.systemPromptOptions)
        : await generateAssistantMessage(this.accessor, this.location, endpoint, { includeCodeGenerationRules: true, includeCapabilities: true }),
      rules = this.options.rules ?? '';
    return `
${assistantMessage}

${rules ? 'Additional Rules' : ''}
${rules ?? ''}

${this.options.systemPromptOptions?.examples ? 'Examples:' : ''}
${this.options.systemPromptOptions?.examples ?? ''}
`.trim();
  }
  createInlineChatSystemMessage(rules) {
    return `
${this.options.systemPromptOptions?.roleplay ?? getAssistantIntroduction()}
${getAssistantIdentity()}
${rules}
${getAssistantExpertise()}
${getLocaleResponse(this.accessor)}
`.trim();
  }
};
var generateInstructions = t =>
    `
The user has a ${t.language.languageId} file opened in a code editor.
The user includes some code snippets from the file.
Each code block starts with \`\`\` and ${FilePathComment.forLanguage(t.language)}.
Answer with a single ${t.language.languageId} code block.
If you modify existing code, you will use the ${BlockComment.begin(t.language)} and ${BlockComment.end(t.language)} markers.
${isNotebookCell(t.document.uri) ? generateNotebookInstructions() : ''}
`.trim()
function generateNotebookInstructions() {
  return `
When dealing with Jupyter Notebook, if a module is already imported in a cell, it can be used in other cells directly without importing it again. For the same reason, if a variable is defined in a cell, it can be used in other cells as well
When dealing with Jupyter Notebook, cells below the current cell can be executed before the current cell, you must use the variables defined in the cells below, unless you want to overwrite them.
When dealing with Jupyter Notebook, do not generate CELL INDEX in the code blocks in your answer, it is only used to help you understand the context.
`.trim()
}
var StreamProcessor = class {
  constructor(document, language, selection, defaultEditStrategy) {
    this.document = document
    this.language = language
    this.selection = selection
    this.defaultEditStrategy = defaultEditStrategy
    this.indentationTracker = null
  }
  async processStream(stream) {
    stream = extractCode(stream);
    stream = filterComments(stream, this.language);
    let lineIndex = this.document.firstSentLineIndex;
    for await (let line of this.findInitialAnchor(stream))
      typeof line != 'string'
        ? (lineIndex = this.handleFirstReplyLine(line.anchor, line.line))
        : (lineIndex = this.handleSubsequentReplyLine(lineIndex, line));
    if (this.document.didReplaceEdits && lineIndex <= this.document.lastRangeLine.lineIndex) {
        this.document.deleteLines(lineIndex, this.document.lastRangeLine.lineIndex);
    }
    return this.document.didEdits;
  }
  handleFirstReplyLine(anchor, line) {
    if (anchor) {
      this.indentationTracker = new IndentationTracker(this.document, anchor.lineIndex, line);
      let reindentedLine = this.indentationTracker.reindent(line, this.document.indentStyle);
      if (this.document.getLine(anchor.lineIndex).sentInCodeBlock === 2) {
        return this.document.replaceLines(this.document.firstRangeLine.lineIndex, anchor.lineIndex, reindentedLine);
      } else {
        return this.document.replaceLine(anchor.lineIndex, reindentedLine);
      }
    }
    let firstLineIndex = this.document.firstRangeLine.lineIndex;
    this.indentationTracker = new IndentationTracker(this.document, firstLineIndex, line);
    let reindentedLine = this.indentationTracker.reindent(line, this.document.indentStyle);
    if (this.selection.isEmpty &&
      this.document.getLine(this.selection.active.line).content === '' &&
      this.selection.active.line === this.document.firstRangeLine.lineIndex) {
      return this.document.insertLineBefore(firstLineIndex, reindentedLine);
    } else if (this.defaultEditStrategy === 1) {
      return this.document.insertLineBefore(firstLineIndex, reindentedLine);
    } else if (this.defaultEditStrategy === 3) {
      return this.document.insertLineAfter(firstLineIndex, reindentedLine);
    } else {
      return this.document.replaceLine(firstLineIndex, reindentedLine);
    }
  }
  handleSubsequentReplyLine(lineIndex, line) {
    let reindentedLine = this.indentationTracker.reindent(line, this.document.indentStyle);
    if (reindentedLine.trimmedContent !== '' || this.document.didReplaceEdits) {
      let matchedLine = this.matchReplyLine(reindentedLine, lineIndex);
      if (matchedLine) return this.document.replaceLines(lineIndex, matchedLine.lineIndex, reindentedLine);
    }
    if (lineIndex >= this.document.getLineCount()) return this.document.appendLineAtEndOfDocument(reindentedLine);
    let currentLine = this.document.getLine(lineIndex);
    if (!currentLine.isSent || currentLine.content === '' || reindentedLine.trimmedContent === '') {
      return this.document.insertLineBefore(lineIndex, reindentedLine);
    } else if (currentLine.indentLevel < reindentedLine.adjustedIndentLevel) {
      return this.document.insertLineBefore(lineIndex, reindentedLine);
    } else if (currentLine.indentLevel === reindentedLine.adjustedIndentLevel && !this.document.didReplaceEdits) {
      return this.document.insertLineBefore(lineIndex, reindentedLine);
    } else {
      return this.document.replaceLine(lineIndex, reindentedLine);
    }
  }
  matchReplyLine(line, lineIndex) {
    let isShortLine = line.trimmedContent.length <= 3;
    for (let i = lineIndex; i < this.document.getLineCount(); i++) {
      let currentLine = this.document.getLine(i);
      if (currentLine.isSent) {
        if (currentLine.normalizedContent === line.adjustedContent) return new LineIndex(i);
        if ((currentLine.trimmedContent.length > 0 && currentLine.indentLevel < line.adjustedIndentLevel) ||
          (isShortLine && currentLine.trimmedContent.length > 0)) {
          return null;
        }
      }
    }
    return null;
  }
  findInitialAnchor(stream) {
    return new AsyncIterable(async emitter => {
      let lines = [],
        totalLength = 0,
        foundAnchor = false;
      for await (let line of stream) {
        if (foundAnchor) emitter.emitOne(line);
        else {
          lines.push(line);
          totalLength += line.trim().length;
          if (totalLength > 10) {
            let equalSentLine = this.searchForEqualSentLines(lines);
            foundAnchor = true;
            emitter.emitOne(new AnchorLine(lines[0], equalSentLine));
            emitter.emitMany(lines.slice(1));
          }
        }
      }
    });
  }
  searchForEqualSentLines(lines) {
    let trimmedLines = lines.map(line => line.trim());
    for (let i = this.document.firstSentLineIndex, end = this.document.getLineCount() - lines.length; i <= end; i++) {
      if (!this.document.getLine(i).isSent) continue;
      let isMatch = true;
      for (let j = 0; j < trimmedLines.length; j++) {
        let currentLine = this.document.getLine(i + j);
        if (!currentLine.isSent || currentLine.trimmedContent !== trimmedLines[j]) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) return new LineIndex(i);
    }
    return null;
  }
};
class IndentationTracker {
  constructor(document, lineIndex, lineContent) {
    let indentLevel = 0
    for (let i = lineIndex; i >= 0; i--) {
      let currentLine = document.getLine(i)
      if (!/^\s*$/.test(currentLine.content)) {
        indentLevel = currentLine.indentLevel
        break
      }
    }
    this._replyIndentStyle = IndentationHelper.guessIndentStyleFromLine(lineContent)
    let calculatedIndentLevel = calculateIndentationLevel(lineContent, this._replyIndentStyle?.tabSize ?? 4)
    calculatedIndentLevel === -1 && (calculatedIndentLevel = 0), (this.indentDelta = calculatedIndentLevel - indentLevel)
  }
  reindent(lineContent, indentStyle) {
    if (lineContent === '') return new LineContent('', 0, '', 0)
    this._replyIndentStyle || (this._replyIndentStyle = IndentationHelper.guessIndentStyleFromLine(lineContent))
    let originalIndentLevel = 0,
      adjustedIndentLevel = 0,
      adjustIndentLevel = indentLevel => ((originalIndentLevel = indentLevel), (adjustedIndentLevel = Math.max(originalIndentLevel - this.indentDelta, 0)), adjustedIndentLevel),
      reindentedLine = IndentationHelper.reindentLine(lineContent, this._replyIndentStyle ?? { insertSpaces: true, tabSize: 4 }, indentStyle, adjustIndentLevel)
    return new LineContent(lineContent, originalIndentLevel, reindentedLine, adjustedIndentLevel)
  }
}
class AnchorLine {
  constructor(line, anchor) {
    this.line = line
    this.anchor = anchor
  }
}
class CodeEditor {
  constructor(progress, document, rangeInfo, indentSize) {
    this.progress = progress;
    this.lines = [];
    this._didEdits = false;
    this._didReplaceEdits = false;
    this.indentStyle = IndentationHelper.getDocumentIndentStyle(rangeInfo, indentSize);
    let textLines = document.getText().split(/\r\n|\r|\n/g);
    for (let index = 0; index < textLines.length; index++) {
      this.lines[index] = new CodeBlock(textLines[index], this.indentStyle);
    }
    let markLines = (range, mark) => {
      for (let index = 0; index < range.lines.length; index++) {
        let lineIndex = range.firstLineIndex + index;
        this.lines[lineIndex].markSent(mark);
      }
    };
    markLines(rangeInfo.above, 1);
    markLines(rangeInfo.range, 2);
    markLines(rangeInfo.below, 3);
    this.firstSentLineIndex = rangeInfo.above.hasContent ? rangeInfo.above.firstLineIndex : rangeInfo.range.firstLineIndex;
    this.firstRangeLine = new LineIndex(rangeInfo.range.firstLineIndex);
    this.lastRangeLine = new LineIndex(rangeInfo.range.firstLineIndex + rangeInfo.range.lines.length - 1);
  }
  get didEdits() {
    return this._didEdits;
  }
  get didReplaceEdits() {
    return this._didReplaceEdits;
  }
  getText() {
    return this.lines.map(line => line.content).join('\n');
  }
  getLineCount() {
    return this.lines.length;
  }
  getLine(index) {
    return this.lines[index];
  }
  replaceLine(index, lineContent) {
    this.lines[index] = new CodeBlock(lineContent.adjustedContent, this.indentStyle);
    this.progress.report({ edits: [new VscodeTextEdit(new VscodeRange(index, 0, index, 1e3), lineContent.adjustedContent)] });
    this._didEdits = true;
    this._didReplaceEdits = true;
    return index + 1;
  }
  replaceLines(startIndex, endIndex, lineContent) {
    if (startIndex === endIndex) {
      return this.replaceLine(startIndex, lineContent);
    } else {
      this.lines.splice(startIndex, endIndex - startIndex + 1, new CodeBlock(lineContent.adjustedContent, this.indentStyle));
      this.progress.report({ edits: [new Zs(new VscodeRange(startIndex, 0, endIndex, 1e3), lineContent.adjustedContent)] });
      this._didEdits = true;
      this._didReplaceEdits = true;
      return startIndex + 1;
    }
  }
  appendLineAtEndOfDocument(lineContent) {
    this.lines.push(new CodeBlock(lineContent.adjustedContent, this.indentStyle));
    this.progress.report({
      edits: [
        new VscodeTextEdit(
          new VscodeRange(this.lines.length - 1, 1e3, this.lines.length - 1, 1e3),
          '\n' + lineContent.adjustedContent
        ),
      ],
    });
    this._didEdits = true;
    return this.lines.length;
  }
  insertLineAfter(index, lineContent) {
    this.lines.splice(index + 1, 0, new CodeBlock(lineContent.adjustedContent, this.indentStyle));
    this.progress.report({
      edits: [
        new VscodeTextEdit(
          new VscodeRange(index, 1e3, index, 1e3),
          '\n' + lineContent.adjustedContent
        ),
      ],
    });
    this._didEdits = true;
    return index + 2;
  }
  insertLineBefore(index, lineContent) {
    this.lines.splice(index, 0, new CodeBlock(lineContent.adjustedContent, this.indentStyle));
    this.progress.report({
      edits: [
        new VscodeTextEdit(
          new VscodeRange(index, 0, index, 0),
          lineContent.adjustedContent + '\n'
        ),
      ],
    });
    this._didEdits = true;
    return index + 1;
  }
  deleteLines(startIndex, endIndex) {
    this.lines.splice(startIndex, endIndex - startIndex + 1);
    this.progress.report({ edits: [new VscodeTextEdit(new VscodeRange(startIndex, 0, endIndex + 1, 0), '')] });
    this._didEdits = true;
    this._didReplaceEdits = true;
    return startIndex + 1;
  }
}
class LineContent {
  constructor(originalContent, originalIndentLevel, adjustedContent, adjustedIndentLevel) {
    this.originalContent = originalContent
    this.originalIndentLevel = originalIndentLevel
    this.adjustedContent = adjustedContent
    this.adjustedIndentLevel = adjustedIndentLevel
    this.trimmedContent = this.originalContent.trim()
  }
}

class LineIndex {
  constructor(index) {
    this.lineIndex = index
  }
}

class CodeBlock {
  constructor(content, indentStyle) {
    this.content = content
    this._indentStyle = indentStyle
    this._sentInCodeBlock = 0
    this._trimmedContent = null
    this._normalizedContent = null
    this._indentLevel = -1
  }
  get isSent() {
    return this._sentInCodeBlock !== 0
  }
  get sentInCodeBlock() {
    return this._sentInCodeBlock
  }
  get trimmedContent() {
    if (this._trimmedContent === null) {
      this._trimmedContent = this.content.trim()
    }
    return this._trimmedContent
  }
  get normalizedContent() {
    if (this._normalizedContent === null) {
      this._normalizedContent = replaceIndentation(this.content, this._indentStyle.tabSize, this._indentStyle.insertSpaces)
    }
    return this._normalizedContent
  }
  get indentLevel() {
    if (this._indentLevel === -1) {
      this._indentLevel = calculateIndentationLevel(this.content, this._indentStyle.tabSize)
      if (this._indentLevel === -1) {
        this._indentLevel = 0
      }
    }
    return this._indentLevel
  }
  markSent(sentInCodeBlock) {
    this._sentInCodeBlock = sentInCodeBlock
  }
}

class IndentationHelper {
  static getDocumentIndentStyle(documentRange, indentStyle) {
    if (indentStyle) return indentStyle
    let document = documentRange.document
    return calculateIndentation(
      {
        getLineCount: function () {
          return document.lineCount
        },
        getLineLength: function (lineNumber) {
          return document.lineAt(lineNumber - 1).text.length
        },
        getLineContent: function (lineNumber) {
          return document.lineAt(lineNumber - 1).text
        },
      },
      4,
      false
    )
  }
  static guessIndentStyleFromLine(line) {
    let leadingWhitespace = IndentationHelper._getLeadingWhitespace(line)
    return leadingWhitespace === '' || leadingWhitespace === ' '
      ? undefined
      : calculateIndentation(
          {
            getLineCount: function () {
              return 1
            },
            getLineLength: function () {
              return line.length
            },
            getLineContent: function () {
              return line
            },
          },
          4,
          false
        )
  }
  static reindentLine(line, oldIndentStyle, newIndentStyle, adjustIndentLevel = level => level) {
    let indentLevel = calculateIndentationLevel(line, oldIndentStyle.tabSize)
    indentLevel === -1 && ((indentLevel = 0), (line = ''))
    let targetIndentLevel = adjustIndentLevel(indentLevel)
    while (indentLevel > 0) {
      line = this._outdent(line, oldIndentStyle)
      indentLevel--
    }
    while (indentLevel < targetIndentLevel) {
      line = '\t' + line
      indentLevel++
    }
    return replaceIndentation(line, newIndentStyle.tabSize, newIndentStyle.insertSpaces)
  }
  static _outdent(line, indentStyle) {
    let index = 0
    while (index < line.length) {
      let charCode = line.charCodeAt(index)
      if (charCode === 9 || (charCode === 32 && index === indentStyle.tabSize)) {
        break
      }
      index++
    }
    return line.substring(index)
  }
  static _getLeadingWhitespace(line) {
    for (let index = 0; index < line.length; index++) {
      let charCode = line.charCodeAt(index)
      if (charCode !== 32 && charCode !== 9) return line.substring(0, index)
    }
    return line
  }
}

function processCodeBlocks(input) {
  return new AsyncIterable(async output => {
    let state
    ;(stateEnum => (
      (stateEnum[(stateEnum.BeforeCodeBlock = 0)] = 'BeforeCodeBlock'),
      (stateEnum[(stateEnum.InCodeBlock = 1)] = 'InCodeBlock'),
      (stateEnum[(stateEnum.AfterCodeBlock = 2)] = 'AfterCodeBlock')
    ))((state ||= {}))
    let currentState = 0
    for await (let line of input) {
      if (currentState === 0) {
        if (/^```/.test(line)) {
          (currentState = 1), output.emitOne({ value: line, kind: 2 })
          continue
        }
      } else currentState === 1 && /^```/.test(line) && (currentState = 2)
      output.emitOne({ value: line, kind: currentState === 1 ? 1 : 2 })
    }
  })
}

function filterComments(input, language) {
  return new AsyncIterable(async output => {
    let commentStart = BlockComment.begin(language),
      commentEnd = BlockComment.end(language),
      isFirstLine = true,
      isNotEmpty = false
    for await (let line of input) {
      if (isFirstLine && FilePathComment.testLine(language, line)) {
        isFirstLine = false
        continue
      }
      ;(!isNotEmpty && /^\s*$/.test(line)) || line.startsWith(commentStart) || line.startsWith(commentEnd) || ((isNotEmpty = true), output.emitOne(line))
    }
  })
}

function extractCode(input) {
  let lines = splitLines(input)
  return processCodeBlocks(lines)
    .filter(line => line.kind === 1)
    .map(line => line.value)
}

function splitLines(input) {
  return new AsyncIterable(async output => {
    let buffer = ''
    for await (let chunk of input) {
      buffer += chunk
      do {
        let newlineIndex = buffer.indexOf(`
`)
        if (newlineIndex === -1) break
        let line = buffer.substring(0, newlineIndex)
        ;(buffer = buffer.substring(newlineIndex + 1)), output.emitOne(line)
      } while (!0)
    }
    buffer.length > 0 && output.emitOne(buffer)
  })
}

class ProgressMessageGenerator {
  constructor() {
    this._data = new Map()
    this._messages = {
      0: ProgressMessageGenerator._shuffleArray(ProgressMessageGenerator._progressMessages[0]),
      1: ProgressMessageGenerator._shuffleArray(ProgressMessageGenerator._progressMessages[1]),
      2: ProgressMessageGenerator._shuffleArray(ProgressMessageGenerator._progressMessages[2]),
      3: ProgressMessageGenerator._shuffleArray(ProgressMessageGenerator._progressMessages[3]),
    }
  }
  static {
    this._progressMessages = {
      0: [
        requestLight.t("Fetching response, it won't be long now."),
        requestLight.t('Working hard to get your response...'),
        requestLight.t('Request is being processed, sit tight!'),
        requestLight.t('Response is being prepared, please be patient.'),
      ],
      1: [
        requestLight.t('Data is on its way, please wait a moment.'),
        requestLight.t('Request is being processed, sit tight!'),
        requestLight.t('Response is being prepared, please be patient.'),
      ],
      2: [
        requestLight.t('Data is on its way, please wait a moment.'),
        requestLight.t('Source code arriving...'),
        requestLight.t("Hold on tight, we're almost there!"),
        requestLight.t('Response is being prepared, please be patient.'),
        requestLight.t('Code chunks incoming...'),
        requestLight.t('Receiving code, please wait...'),
        requestLight.t('Code is being processed, please wait...'),
      ],
      3: [requestLight.t('Almost done, just a few more seconds...'), requestLight.t('Processing response, please wait...')],
    }
  }
  next(progressType) {
    let progressData = this._data.get(progressType)
    if (progressData) {
      if (Date.now() - progressData.time < 3579) return this._messages[progressType][progressData.index]
      progressData.index += 1
      progressData.time = Date.now()
      let messages = this._messages[progressType]
      return messages[Math.min(messages.length - 1, progressData.index)]
    } else {
      this._data.set(progressType, { index: 0, time: Date.now() })
      return this._messages[progressType][0]
    }
  }
  static _shuffleArray(array) {
    return shuffleArray(array), array
  }
}
class ProgressReporter {
  constructor(progress) {
    this.progress = progress
    this._progressMessages = new ProgressMessageGenerator()
    this._lastText = undefined
  }
  _reportProgress(progressType) {
    let message = this._progressMessages.next(progressType)
    this.progress.report({ message: message })
  }
  update(text) {
    this._reportProgress(this._lastText ? (text.includes('```') ? 2 : 1) : 0)
    this._lastText = text
    return { shouldFinish: isCodeBlock(text) }
  }
  async finish() {
    if (!this._lastText) throw new Error('No text')
    this._reportProgress(3)
    return await this.interpretReply(this._lastText)
  }
}
class ReplyInterpreter extends ProgressReporter {
  constructor(interpreter, progress) {
    super(progress)
    this.replyInterpreter = interpreter
  }
  static createFactory(interpreter) {
    return progress => new ReplyInterpreter(interpreter, progress)
  }
  interpretReply(reply) {
    return this.replyInterpreter(reply, this.progress)
  }
}
class CodeReplyInterpreter extends ProgressReporter {
  constructor(accessor, selectionContextMetadata, context, editStrategy, progress) {
    super(progress)
    this.accessor = accessor
    this.selectionContextMetadata = selectionContextMetadata
    this.context = context
    this.editStrategy = editStrategy
  }
  static createFactory(accessor, selectionContext, context, editStrategy = 2) {
    return progress => {
      if (!selectionContext.selectionContextMetadata) throw new Error('code reply NEEDS a selection context')
      return new CodeReplyInterpreter(accessor, selectionContext.selectionContextMetadata, context, editStrategy, progress)
    }
  }
  interpretReply(reply) {
    if (!this.selectionContextMetadata) throw new Error('code reply NEEDS a selection context')
    let { contextInfo, expandedRange } = this.selectionContextMetadata,
      codeBlock = extractCodeBlock(contextInfo, reply, this.context.language)
    if (!codeBlock) return { type: 'conversational', content: reply }
    let { code } = codeBlock,
      processedText = processInputText(
        this.accessor,
        contextInfo,
        code,
        this.editStrategy,
        this.context.fileIndentInfo,
        DocumentContext.fromDocumentContext(this.context)
      )
    return createInlineEdit(processedText, expandedRange)
  }
}
class StreamProcessor {
  constructor(progress) {
    this._progress = progress
    this._responseStream = new DeferredAsyncIterable()
    this._lastLength = 0
    this._lastText = undefined
    this._promise = undefined
    this._progressMessages = new ProgressMessageGenerator()
  }
  static createFactory() {
    return progress => new StreamProcessor(progress)
  }
  _reportProgress(progressType) {
    let message = this._progressMessages.next(progressType)
    this._progress.report({ message: message })
  }
  update(text) {
    if (!this._promise) {
      this._reportProgress(0)
      this._promise = this.processStream(this._responseStream, this._progress)
    }
    this._reportProgress(1)
    let newText = text.slice(this._lastLength)
    this._lastLength = text.length
    this._lastText = text
    this._responseStream.emitOne(newText)
    return { shouldFinish: false }
  }
  async finish() {
    this._responseStream.resolve()
    return { type: 'conversational', content: this._lastText ?? '' }
  }
  async processStream(stream, progress) {
    for await (let content of stream.asyncIterable) progress.report({ content: content })
    return false
  }
}
function applyTextEdits(text, edits) {
  let offsetCalculator = new OffsetCalculator(text),
    sortedEdits = edits.map(edit => {
      let range = edit.range
      return { startOffset: offsetCalculator.getOffset(range.start), endOffset: offsetCalculator.getOffset(range.end), text: edit.newText }
    })
  sortedEdits.sort((edit1, edit2) => edit2.startOffset - edit1.startOffset || edit2.endOffset - edit1.endOffset)
  for (let edit of sortedEdits) text = text.substring(0, edit.startOffset) + edit.text + text.substring(edit.endOffset)
  return text
}

class OffsetCalculator {
    constructor(text) {
      this.lineStartOffsetByLineIdx = []
      this.lineStartOffsetByLineIdx.push(0)
      for (let i = 0; i < text.length; i++)
        if (text.charAt(i) === '\n') this.lineStartOffsetByLineIdx.push(i + 1)
      this.lineStartOffsetByLineIdx.push(text.length)
    }
    getOffset(position) {
      return this.lineStartOffsetByLineIdx[position.line] + position.character
    }
}
class CodeReplyInterpreter {
  constructor(accessor, selectionContextMetadata, context, editStrategy, progress) {
    this._accessor = accessor
    this._selectionContextMetadata = selectionContextMetadata
    this._context = context
    this._editStrategy = editStrategy
    this._progress = progress
    this._responseStream = new DeferredAsyncIterable()
    this._lastLength = 0
    this._lastText = undefined
    this._streamingPromise = undefined
    this._initialDocText = this._context.document.getText()
    this._progressMessages = new ProgressMessageGenerator()
    this._documentInfo = DocumentContext.fromDocumentContext(this._context)
    if (!this._selectionContextMetadata) throw new Error('code reply NEEDS a selection context')
    this._streamingWorkingCopyDocument = new CodeEditor(
      progress,
      this._context.document,
      this._selectionContextMetadata.contextInfo,
      this._context.fileIndentInfo
    )
    let streamProcessor = new StreamProcessor(
      this._streamingWorkingCopyDocument,
      this._context.language,
      this._context.selection,
      this._editStrategy
    )
    this._streamingPromise = streamProcessor.processStream(this._responseStream.asyncIterable)
  }
  static createFactory(accessor, metadata, context, editStrategy = 2) {
    return (progress, shouldCreateNewInstance) => {
      if (!metadata.selectionContextMetadata) throw new Error('code reply NEEDS a selection context')
      return shouldCreateNewInstance ? new CodeReplyInterpreter(accessor, metadata.selectionContextMetadata, context, editStrategy, progress) : new CodeReplyInterpreter(accessor, metadata.selectionContextMetadata, context, editStrategy, progress)
    }
  }
  update(text) {
    this._reportMessageProgress(this._lastText ? 2 : 0), (this._lastText = text)
    let newText = text.slice(this._lastLength)
    this._lastLength = text.length
    this._responseStream.emitOne(newText)
    return { shouldFinish: isCodeBlock(text) }
  }
  _reportMessageProgress(progressType) {
    let message = this._progressMessages.next(progressType)
    this._progress.report({ message: message })
  }
  async finish() {
    if (!this._lastText) throw new Error('No text')
    this._responseStream.resolve()
    let streamingResult = await this._streamingPromise,
      interpretedReply = await this._interpretReply(this._lastText)
    if (interpretedReply.type === 'inlineEdit') {
      let newText = applyTextEdits(this._initialDocText, interpretedReply.edits)
      return {
        type: 'inlineEdit',
        edits: [{ range: new VscodeRange(new VscodePosition(0, 0), new VscodePosition(Number.MAX_SAFE_INTEGER, 0)), newText: newText }],
        newWholeRange: interpretedReply.newWholeRange,
      }
    }
    if (streamingResult) {
      this._progress.report({
        edits: [{ range: new VscodeRange(new VscodePosition(0, 0), new VscodePosition(Number.MAX_SAFE_INTEGER, 0)), newText: this._initialDocText }],
      })
    }
    return interpretedReply
  }
  _interpretReply(text) {
    let { contextInfo, expandedRange } = this._selectionContextMetadata,
      codeBlock = extractCodeBlock(contextInfo, text, this._context.language)
    if (!codeBlock) return { type: 'conversational', content: text }
    let { code } = codeBlock,
      processedText = processInputText(this._accessor, contextInfo, code, this._editStrategy, this._context.fileIndentInfo, this._documentInfo)
    return createInlineEdit(processedText, expandedRange)
  }
}
class Intent {
  constructor(options) {
    this.opts = options
    this.id = options.id
    this.locations = Array.isArray(options.location) ? options.location : [options.location]
    this.description = options.description
    this.intentDetectionInput = {
      sampleQuestion: options.modelSampleQuestion,
      modelDescription: options.modelDescription ?? options.description,
    }
    this.commandInfo = options.commandInfo
  }
  async invoke(extension, context) {
    let location = context.location
    let documentContext = context.documentContext
    let chatBuilder = new ChatBuilder(extension, this.opts, location, documentContext)
    let endpoint = this.opts.endpoint ?? (await getChatEndpointInfo(extension, location, this.id))
    return {
      intent: this,
      location: location,
      promptCrafter: chatBuilder,
      endpoint: endpoint,
      followUps: this.opts.followUps,
      responseProcessor: this.opts.responseProcessor,
      createReplyInterpreter: documentContext && CodeReplyInterpreter.createFactory(extension, chatBuilder, documentContext),
    }
  }
}

function processAnchors(anchors) {
  let resourceMap = new ResourceMap(),
    mergeRanges = (range1, range2) => {
      if (range1.contains(range2)) return range1
      if (range2.contains(range1)) return range2
      let [smaller, larger] = range1.start.line < range2.start.line ? [range1, range2] : [range2, range1]
      if (smaller.end.line >= larger.start.line - 1) return new VscodeRange(smaller.start, larger.end)
    }
  return (
    anchors.forEach(anchorItem => {
      let anchor = anchorItem.anchor
      if (!isUriRange(anchor)) resourceMap.set(anchor, anchorItem)
      else {
        let existingItem = resourceMap.get(anchor.uri)
        if (!existingItem) resourceMap.set(anchor.uri, [anchorItem])
        else if (!(existingItem instanceof Anchor)) {
          let nonOverlappingAnchors = [],
            mergedRange = anchor.range
          existingItem.forEach(item => {
            if (!isUriRange(item.anchor)) return
            let merged = mergeRanges(mergedRange, item.anchor.range)
            merged ? (mergedRange = merged) : nonOverlappingAnchors.push(item.anchor)
          })
          let newAnchor = { uri: anchor.uri, range: mergedRange }
          resourceMap.set(
            anchor.uri,
            [...nonOverlappingAnchors, newAnchor]
              .sort((a, b) => a.range.start.line - b.range.start.line || a.range.end.line - b.range.end.line)
              .map(a => new Anchor(a))
          )
        }
      }
    }),
    Array.from(resourceMap.keys())
      .sort((uri1, uri2) => uri1.fsPath.localeCompare(uri2.fsPath))
      .map(uri => {
        let item = resourceMap.get(uri)
        return item || []
      })
      .flat()
  )
}

function isUriRange(item) {
  return 'uri' in item && 'range' in item
}

class CommandParser {
  constructor(accessor) {
    this.accessor = accessor
    this.commandPrefix = '/'
    this.readConfig()
  }
  readConfig() {
    this._enabledCommands = this.accessor.get(ConfigManager).getConfigMixedWithDefaults(settings.ConversationSlashCommandEnablements)
  }
  isCommandEnabled(commandId, context) {
    if (this._enabledCommands === void 0) return false
    if (this._enabledCommands[commandId] === void 0) {
      if (this._enabledCommands['*']) return true
      let defaultEnablement = CommandManager.getCommand(commandId, context)?.intent?.commandInfo?.defaultEnablement
      return typeof defaultEnablement == 'boolean' ? defaultEnablement : true
    }
    return !!this._enabledCommands[commandId]
  }
  parse(input, context) {
    if (((input = input.trimStart()), input.startsWith(this.commandPrefix))) {
      let matchGroups = /\/(?<intentId>\w+)(?::(?<intentArgument>\w*))?(?<restOfQuery>\s.*)?/s.exec(input)?.groups,
        intentId = matchGroups?.intentId ?? '',
        intentArgument = matchGroups?.intentArgument ?? '',
        restOfQuery = (matchGroups?.restOfQuery ?? '').trim(),
        command = CommandManager.getCommand(intentId, context)
      if ((this.readConfig(), command && this.isCommandEnabled(intentId, context)))
        return { command: command, intentArgument: intentArgument, restOfQuery: restOfQuery }
    }
    return { restOfQuery: input }
  }
  getCommand(commandId, context) {
    return this.allCommands(context).find(command => command.commandId === commandId)
  }
  allCommands(context) {
    return this.readConfig(), CommandManager.getCommands(context).filter(command => this.isCommandEnabled(command.commandId, context))
  }
}

var InstructionComponent = class extends BaseComponent {
  render() {
    let language = this.props.language
    return vscpp(
      vscppf,
      null,
      'You are an AI programming assistant.',
      vscpp('br', null),
      'When asked for your name, you must respond with "GitHub Copilot".',
      vscpp('br', null),
      "Follow the user's requirements carefully & to the letter.",
      vscpp('br', null),
      'The user has a ',
      language.languageId,
      ' file opened in a code editor.',
      vscpp('br', null),
      'The user includes some code snippets from the file.',
      vscpp('br', null),
      'Each code block starts with ``` and ',
      FilePathComment.forLanguage(language),
      '.',
      vscpp('br', null),
      'Answer with a single ',
      language.languageId,
      ' code block.',
      vscpp('br', null),
      'If you modify existing code, you will use the ',
      BlockComment.begin(language),
      ' and ',
      BlockComment.end(language),
      ' markers.'
    )
  }
}

var InlineChatPrompt = class extends BaseComponent {
  render() {
    if (isNotebookCell(this.props.documentContext.document.uri))
      throw throwIllegalArgumentError('InlineChatBasePrompt should not be used with a notebook!')
    let language = this.props.documentContext.language
    return vscpp(
      vscppf,
      null,
      vscpp(SystemComponent, null, vscpp(InstructionComponent, { language: language }), vscpp(ExpertiseComponent, null)),
      this.props.history && vscpp(UserComponent, null, this.props.history),
      vscpp(InlineChatSelection, { documentContext: this.props.documentContext }),
      vscpp(UserComponent, null, this.props.query)
    )
  }
}

var InlineNotebookPrompt = class extends BaseComponent {
  render() {
    if (!isNotebookCell(this.props.documentContext.document.uri))
      throw throwIllegalArgumentError('InlineChatNotebookBasePrompt should be used only with a notebook!')
    let language = this.props.documentContext.language
    return vscpp(
      vscppf,
      null,
      vscpp(
        SystemComponent,
        null,
        vscpp(InstructionComponent, { language: language }),
        vscpp('br', null),
        'When dealing with Jupyter Notebook, if a module is already imported in a cell, it can be used in other cells directly without importing it again. For the same reason, if a variable is defined in a cell, it can be used in other cells as well',
        vscpp('br', null),
        'When dealing with Jupyter Notebook, cells below the current cell can be executed before the current cell, you must use the variables defined in the cells below, unless you want to overwrite them.',
        vscpp('br', null),
        'When dealing with Jupyter Notebook, do not generate CELL INDEX in the code blocks in your answer, it is only used to help you understand the context.',
        vscpp('br', null),
        vscpp(ExpertiseComponent, null)
      ),
      this.props.history && vscpp(UserComponent, null, this.props.history),
      vscpp(InlineNotebookSelection, { documentContext: this.props.documentContext }),
      vscpp(UserComponent, null, this.props.query)
    )
  }
}

var IntentHandler = class IntentHandler {
  constructor(accessor, documentContext, editStrategy) {
    this.accessor = accessor
    this.documentContext = documentContext
    this.editStrategy = editStrategy
  }
  static async createIntentInvocation(intent, accessor, context, editStrategy) {
    let { location, documentContext } = context
    if (!documentContext) throw new Error('Open a file to add code.')
    let handler = new IntentHandler(accessor, documentContext, editStrategy),
      endpoint = await getChatEndpointInfo(accessor, location, intent.id)
    return {
      intent: intent,
      location: location,
      endpoint: endpoint,
      promptCrafter: handler,
      createReplyInterpreter: (reply, isCode) => handler.createReplyInterpreter(reply, isCode),
    }
  }
  async buildPrompt(chat, maxTokenCount, isCode, isTest, isDebug, isTrace) {
    let query = chat.getLatestTurn().request.message,
      history = chat.turns.length > 1 ? chat.turns[chat.turns.length - 2].request.message : void 0,
      renderer = new Renderer(this.accessor, 8192, maxTokenCount),
      promptType = isNotebookCell(this.documentContext.document.uri) ? InlineNotebookPrompt : InlineChatPrompt,
      messages = await renderer.render(promptType, { documentContext: this.documentContext, query: query, history: history })
    this.selectionContextMetadata = renderer.getMeta(InlineChatSelection.METADATA_ID) || renderer.getMeta(InlineNotebookSelection.METADATA_ID)
    return { messages: messages, tokenCount: 100 }
  }
  createReplyInterpreter(reply, isCode) {
    if (!this.selectionContextMetadata)
      throw new Error('Could not create reply interpreter without selection context metadata')
    return new CodeReplyInterpreter(this.accessor, this.selectionContextMetadata, this.documentContext, this.editStrategy, reply)
  }
}

var UnknownIntent = class UnknownIntent {
  constructor() {
    this.id = UnknownIntent.ID
    this.locations = [1, 2]
    this.description = 'Intent of this command is unclear or is not related to information technologies'
    this.commandInfo = { hiddenFromUser: true }
    this.intentDetectionInput = { sampleQuestion: 'Add a dog to this comment.' }
  }
  static {
    this.ID = 'unknown'
  }
  static {
    this.Instance = new UnknownIntent()
  }
  async invoke(accessor, context) {
    if (context.location === 1) return IntentHandler.createIntentInvocation(this, accessor, context, 2)
    let location = context.location,
      documentContext = context.documentContext,
      endpoint = await getChatEndpointInfo(accessor, location, this.id),
      chatBuilder = new ChatBuilder(accessor, { contextResolvers: [currentSelectionContextResolver] }, location, context.documentContext)
    return {
      intent: this,
      location: location,
      promptCrafter: chatBuilder,
      endpoint: endpoint,
      createReplyInterpreter: documentContext && CodeReplyInterpreter.createFactory(accessor, chatBuilder, documentContext),
    }
  }
}

var commandTypes = [
    'code',
    'doc',
    'edit',
    'search',
    'workspace',
    'tests',
    'fix',
    'explain',
    'terminal',
    'unknown',
    'api',
    'newNotebook',
    'new',
  ],
  IntentManager = new (class {
    constructor() {
      this.intents = new Set()
    }
    registerIntent(intent) {
      intent.locations.every(location => this.getIntent(intent.id, location)) ||
        (this.intents.add(intent),
        (!intent.commandInfo || !intent.commandInfo.hiddenFromUser) &&
          CommandManager.registerCommand({ commandId: intent.id, intent: intent, details: intent.description, locations: intent.locations }))
    }
    getIntents(location) {
      let findIndex = intentId => {
        let index = commandTypes.indexOf(intentId)
        return index === -1 ? Number.MAX_SAFE_INTEGER : index
      }
      return Array.from(this.intents.values())
        .filter(intent => intent.locations.includes(location))
        .sort((intent1, intent2) => findIndex(intent1.id) - findIndex(intent2.id))
    }
    getIntent(intentId, location) {
      return this.getIntents(location).find(intent => intent.id === intentId)
    }
  })()
var IntentDetector = class IntentDetector {
  constructor(accessor, location) {
    this.accessor = accessor
    this.location = location
    this.logger = accessor.get(LoggerManager).getPromptResponseLogger('intent detection')
    this.ghTelemetry = accessor.get(IGHTelemetryService)
    this.options = accessor.get(conversationOptions)
  }
  async detectIntent(document, preferredIntent, chatLocation, telemetryContext, request) {
    let textExcerpt
    try {
      if (document) {
        let selection = document.selection,
          range = new VscodeRange(
            new VscodePosition(Math.max(selection.start.line - 5, 0), 0),
            new VscodePosition(Math.min(selection.end.line + 5, document.document.lineCount), document.document.lineAt(selection.end.line).text.length)
          )
        textExcerpt = document.document.getText(range)
      }
    } catch {}
    let filePath = document?.document.uri.fsPath,
      prompt = this.createIntentDetectionPrompt(request, preferredIntent, filePath, textExcerpt),
      chatMessages = [{ role: 'system', content: prompt }]
    this.logger.logPrompt(chatMessages)
    let defaultChatEndpointInfo = await getDefaultChatEndpointInfo(this.accessor),
      chatResponses = await this.accessor
        .get(DataRetriever)
        .fetchMany(
          chatMessages,
          void 0,
          chatLocation,
          this.location,
          defaultChatEndpointInfo,
          { temperature: this.options.temperature, top_p: this.options.topP, stop: [';'], n: 1 },
          { messageSource: 'chat.intentprompt' }
        ),
      detectedIntent = this.handleResult(chatResponses, telemetryContext, request)
    return this.sendInternalTelemetry(request, preferredIntent, filePath, textExcerpt, detectedIntent?.id, document?.language.languageId), detectedIntent
  }
  handleResult(response, telemetryContext, request) {
    if ((this.logger.logResponse(response), response.type !== 'success')) {
      this.sendPromptIntentErrorTelemetry(telemetryContext, response)
      return
    }
    let responseValues = response.value.map(value =>
        value
          .trimStart()
          .split('\n')[0]
          .replace(/function id:|response:/i, '')
          .trim()
      ),
      intents = responseValues.map(value => IntentManager.getIntent(value, this.location)).filter(intent => intent !== void 0 && intent.id !== UnknownIntent.ID),
      mostFrequentIntent = IntentDetector.pickMostFrequent(intents)
    this.logger.info(`picked intent "${mostFrequentIntent?.id}" from ${JSON.stringify(response.value, null, '\t')}`)
    let extendedTelemetryContext = telemetryContext.extendedBy({ messageText: request, promptContext: responseValues.join(), intent: mostFrequentIntent?.id || 'unknown' })
    return this.ghTelemetry.sendRestrictedTelemetry('conversation.promptIntent', extendedTelemetryContext.raw), mostFrequentIntent
  }
  sendPromptIntentErrorTelemetry(telemetryContext, response) {
    let extendedContext = telemetryContext.extendedBy({ resultType: response.type, reason: response.reason })
    this.ghTelemetry.sendRestrictedTelemetry('conversation.promptIntentError', extendedContext.raw)
  }
  static pickMostFrequent(intents) {
    if (intents.length === 0) return
    let intentFrequencyMap = new Map()
    for (let intent of intents) {
      let frequencyAndIntent = intentFrequencyMap.get(intent.id) ?? [0, intent]
      ;(frequencyAndIntent[0] += 1), intentFrequencyMap.set(intent.id, frequencyAndIntent)
    }
    let [, mostFrequentIntent] = [...intentFrequencyMap.values()].reduce((currentMax, next) => (currentMax[0] > next[0] ? currentMax : next))
    return mostFrequentIntent
  }
  createIntentDetectionPrompt(request, preferredIntentId, filePath, fileExcerpt) {
    let intents = IntentManager.getIntents(this.location),
    fileLocation = filePath ? ` in file ${filePath}` : '',
    fileContent = fileExcerpt
        ? `Current active file contains following excerpt:
\`\`\`
${fileExcerpt}
\`\`\``
        : ''
    return `
${getAssistantIdentity()}

A software developer is using an AI chatbot in a code editor${fileLocation}.
${fileContent}
The developer added the following request to the chat and your goal is to select a function to perform the request.
${preferredIntentId ? `The developer probably wants Function Id '${preferredIntentId}', pick different only if you're certain.` : ''}
Request: ${request}

Available functions:
${intents.map(
  l => `Function Id: ${l.id}
Function Description: ${l.intentDetectionInput.modelDescription || l.description}
`
).join(`
`)}

Here are some examples to make the instructions clearer:
${intents.map(
  l => `Request: ${l.intentDetectionInput.sampleQuestion}
Response: ${l.id}
`
).join(`
`)}
Request: ${request}
Response:
`.trim()
  }
  sendInternalTelemetry(request, preferredIntent, filePath, fileExcerpt, detectedIntent, languageId) {
    fileExcerpt = fileExcerpt && fileExcerpt.length < 5000 ? fileExcerpt : void 0
    this.accessor
      .safeGet(IMSTelemetryService)
      ?.sendInternalTelemetryEvent(
        'intentDetection',
        {
          chatLocation: getConversationType(this.location),
          request: request,
          preferredIntent: preferredIntent ?? '<none>',
          filePath: filePath ?? '<none>',
          fileExcerpt: fileExcerpt ?? '<none>',
          detectedIntent: detectedIntent ?? '<none>',
          languageId: languageId ?? '<none>',
        },
        {}
      )
  }
}

async function processCommand(context, query, documentContext, commandData, filePath, languageId) {
  let commandParser = new CommandParser(context),
    intentArgument,
    intent,
    restOfQuery = '',
    parsedCommand = commandParser.parse(query, 1)
  if (parsedCommand.command) {
    intent = parsedCommand.command.intent
    restOfQuery = parsedCommand.restOfQuery
    intentArgument = parsedCommand.intentArgument
  } else {
    let configManager = context.get(ConfigManager)
    if (configManager.isDefaultSettingOverwritten(settings.ConversationIntentDetection)
      ? configManager.getConfig(settings.ConversationIntentDetection)
      : true) {
      intent = await new IntentDetector(context, 1).detectIntent(documentContext, query, languageId, filePath, commandData?.preferredIntent)
    }
    restOfQuery = query
  }
  let slashCommand
  if (intent && commandData) {
    slashCommand = commandData.slashCommands.find(command => command.command === intent.id)
  }
  intent = intent ?? UnknownIntent.Instance
  let intentInvocation = await intent.invoke(context, { location: 1, documentContext: documentContext, intentArgument: intentArgument }, slashCommand)
  return { queryWithoutCommand: restOfQuery, intentInvocation: intentInvocation, slashCommand: slashCommand }
}

async function generateMessages(commandResult, previousMessages, telemetryContext, telemetryProperties) {
  let conversation = new Conversation()
  if (previousMessages && previousMessages.length > 0) {
    let initialMessage = `The current code is a result of a previous interaction with you. Here are my previous messages:
- ${previousMessages.join(`
- `)}`
    let initialSession = new Session({ message: initialMessage, type: 'user' })
    conversation.addTurn(initialSession)
  }
  let userSession = new Session({ message: commandResult.queryWithoutCommand, type: 'user' })
  userSession.intentInvocation = commandResult.intentInvocation
  conversation.addTurn(userSession)
  let { messages: promptMessages } = await commandResult.intentInvocation.promptCrafter.buildPrompt(
    conversation,
    commandResult.intentInvocation.endpoint,
    {},
    { report() {} },
    telemetryContext,
    telemetryProperties
  )
  return promptMessages
}

var ConcurrencyModule = handleDefaultExports(ConcurrencyModule())
var PromptGenerator = class {
  constructor(accessor, id, description, roleplay, rules, sampleQuestion, options) {
    this.accessor = accessor
    this.id = id
    this.description = description
    this.roleplay = roleplay
    this.rules = rules
    this.sampleQuestion = sampleQuestion
    this.options = options
    this.pLimit = (0, ConcurrencyModule.default)(1)
    this.logger = accessor.get(LoggerManager).getLogger('GenerateFileContentsPrompt')
  }
  turnFilter(turns) {
    return turns.filter(
      turn => turn.intentInvocation?.intent.id === 'new' || (turn.request.type !== 'user' && turn.request.type !== 'follow-up')
    )
  }
  buildPrompt() {
    return [this.roleplay, this.rules, this.sampleQuestion].join(`
`)
  }
  async run(turns, replacements, options) {
    return this.pLimit(() => this.doRun(turns, replacements, options))
  }
  async doRun(turns, replacements, options) {
    let prompt = this.buildPrompt()
    for (let [key, value] of Object.entries(replacements)) prompt = prompt.replace(`{${key}}`, value)
    this.logger.info('prompt: ' + prompt)
    let endpointInfo = await getChatEndpointInfo(this.accessor, 2, this.id),
      fetchResult = await this.accessor
        .get(DataRetriever)
        .fetchOne(
          [{ role: 'system', content: getAssistantExpertise() }, ...turns, { role: 'user', content: prompt }],
          async a => {},
          options,
          2,
          endpointInfo,
          { temperature: this.options.temperature, top_p: this.options.topP, stop: ['stopIt'] },
          { messageSource: 'newIntent' }
        )
    return fetchResult.type !== 'success'
      ? (this.logError('fetch failure type: ' + fetchResult.type + ', reason: ' + fetchResult.reason), '')
      : (this.log('fetch response: ' + fetchResult.value), fetchResult.value)
  }
  logError(message) {
    this.logger.error(`[newIntent] ${this.id} `, message)
  }
  log(...messages) {
    this.logger.info(`[newIntent] ${this.id} `, ...messages)
  }
}

function generateExampleResponse(userInput, assistantResponse, replacements = {}) {
  let response = `Below you will find a set of examples of what you should respond with. Please follow these examples as closely as possible.

    ## Valid question

    User: ${userInput}
    Assistant: ${assistantResponse}`
  for (let [key, value] of Object.entries(replacements)) response = response.replace(`{${key}}`, value)
  return response
}

var ProjectPlanGenerator = class extends PromptGenerator {
  constructor(accessor, options) {
    let projectDescription =
        'I want to set up the following project: {PROJECT_DESCRIPTION}.\n		This is the project tree structure:\n		```markdown\n		{PROJECT_TREE_STRUCTURE}\n		```\n		',
      instructions = `
      Think step by step and respond with a text description that lists and summarizes each file inside this project.
      List the classes, types, interfaces, functions, and constants it exports and imports if it is a code file.
      You should be as specific as possible when listing the public properties and methods for each exported class.
      Do not use code blocks or backticks. Do not include any text before or after the file contents.
      Do not include product names such as Visual Studio in the comments.`.trim(),
      exampleResponse =
        'The project has the following files:\n		`src/app.ts`: This file is the entry point of the application. It creates an instance of the express app and sets up middleware and routes.\n		`src/controllers/index.ts`: This file exports a class `IndexController` which has a method `getIndex` that handles the root route of the application.\n		`src/routes/index.ts`: This file exports a function `setRoutes` which sets up the routes for the application. It uses the `IndexController` to handle the root route.\n		`src/types/index.ts`: This file exports interfaces `Request` and `Response` which extend the interfaces from the `express` library.\n		`tsconfig.json`: This file is the configuration file for TypeScript. It specifies the compiler options and the files to include in the compilation.\n		`package.json`: This file is the configuration file for npm. It lists the dependencies and scripts for the project.\n		`README.md`: This file contains the documentation for the project.',
      example = generateExampleResponse(projectDescription + instructions, exampleResponse, {
        PROJECT_DESCRIPTION: 'Create a TypeScript Express app',
        PROJECT_TREE_STRUCTURE: `
      my-express-app
      \u251C\u2500\u2500 src
      \u2502   \u251C\u2500\u2500 app.ts
      \u2502   \u251C\u2500\u2500 controllers
      \u2502   \u2502   \u2514\u2500\u2500 index.ts
      \u2502   \u251C\u2500\u2500 routes
      \u2502   \u2502   \u2514\u2500\u2500 index.ts
      \u2502   \u2514\u2500\u2500 types
      \u2502       \u2514\u2500\u2500 index.ts
      \u251C\u2500\u2500 package.json
      \u251C\u2500\u2500 tsconfig.json
      \u2514\u2500\u2500 README.md`,
      })
    super(accessor, 'generateProjectPlan', 'Generate a plan for the contents of a project', projectDescription, instructions, example, options)
  }
  async run(turns, replacements, options) {
    return super.run(turns, replacements, options)
  }
}
var FileGenerator = class extends PromptGenerator {
  constructor(accessor, options) {
    super(
      accessor,
      'generateFile',
      'Generate the contents of a file',
      'I want to set up the following project: {PROJECT_DESCRIPTION}.\n			This is the project tree structure:\n			```markdown\n			{PROJECT_TREE_STRUCTURE}\n			```\n			The project should adhere to the following specification:\n			{PROJECT_SPECIFICATION}',
      `
Think step by step and give me just the file {FILEPATH} within this project. The code should not contain bugs.
If the file is supposed to be empty, please respond with a code comment saying that this file is intentionally left blank.
Do not include comments in json files.
Do not use code blocks or backticks.
Do not include product names such as Visual Studio in the comments.`.trim(),
      '',
      options
    )
  }
  async run(turns, replacements, options) {
    let response = await super.run(turns, replacements, options),
      parsedContent = extractCodeFromResponse(replacements.FILEPATH, response)
    return (
      response.length !== 0 &&
        parsedContent.length === 0 &&
        (this.logError('failed to parse content'),
        this.log(`failed to parse ${replacements.FILEPATH} content
${response}`)),
      parsedContent.startsWith('Sorry, I cannot generate file contents')
        ? (this.logError('AI failed to generate file contents'),
          this.log(`failed to generate ${replacements.FILEPATH} content
${response}`),
          '')
        : parsedContent
    )
  }
}

function extractCodeFromResponse(filePath, response) {
  response = response.trimEnd().replace('[RESPONSE END]', '')

  function extractCode(content, regex) {
    try {
      let match = regex.exec(content.trim())
      if (match && match.length > 2) return match[2]
    } catch (error) {
      console.error(error)
    }
    return content
  }

  if (filePath.endsWith('.md')) {
    let extractedCode = extractCode(response, /^```([a-zA-Z]+)?\s*([\s\S]+?)\s*```$/),
      [firstLine, ...restLines] = extractedCode.split('#')
    return firstLine.length ? ['', ...restLines].join('#') : extractedCode
  } else return extractCode(response, /```([^\n]+)?\s*\n([\s\S]+?)\s*```/g)
}

var ProjectManager = class {
  constructor(accessor) {
    this.accessor = accessor
    this.promises = []
    this.responseScopedData = new Map()
    this.generatePlanPrompt = new ProjectPlanGenerator(this.accessor, {
      maxResponseTokens: undefined,
      temperature: 0.1,
      topP: 1,
      additionalPromptContext: 'none',
      rejectionMessage: '',
    })
    this.generateFilePrompt = new FileGenerator(this.accessor, {
      maxResponseTokens: undefined,
      temperature: 0.1,
      topP: 1,
      additionalPromptContext: 'none',
      rejectionMessage: '',
    })
  }
  set(responseId, projectName, userPrompt, projectStructure, treeData, chatMessages) {
    let projectSpecification = this.generatePlanPrompt.run(chatMessages, { PROJECT_DESCRIPTION: userPrompt, PROJECT_TREE_STRUCTURE: projectStructure }, new VscodeCancellationTokenSource().token)
    this.promises.push(projectSpecification),
      this._getResponseScopedData(responseId).set(projectName, {
        userPrompt: userPrompt,
        projectStructure: projectStructure,
        projectSpecification: projectSpecification,
        chatMessages: chatMessages,
        fileTreeData: this._prefetch(userPrompt, projectStructure, projectSpecification, treeData.treeData, chatMessages),
      })
  }
  get(responseId, filePath) {
    let { projectName, path } = this._getProjectMetadata(filePath),
      projectData = this._getResponseScopedData(responseId).get(projectName)
    if (!projectData) return
    let fileData = projectData.fileTreeData
    for (let part of path) fileData = fileData?.children?.find(child => child.label === part)
    if (fileData && !fileData?.content && !fileData?.children) {
      let file = fileData
      file.content = this._getFileContent(
        projectData.userPrompt,
        projectData.projectStructure,
        projectData.projectSpecification,
        filePath,
        projectData.chatMessages
      ).catch(() => (file.content = undefined))
    }
    return fileData
  }
  _prefetch(userPrompt, projectStructure, projectSpecification, treeData, chatMessages) {
    let currentTime = Date.now()
    return treeData.children
      ? { ...treeData, children: treeData.children.map(child => this._prefetch(userPrompt, projectStructure, projectSpecification, child, chatMessages)), ctime: currentTime }
      : { ...treeData, content: undefined, ctime: currentTime }
  }
  async _getFileContent(userPrompt, projectStructure, projectSpecification, filePath, chatMessages, cancellationToken = new VscodeCancellationTokenSource().token) {
    return this.generateFilePrompt
      .run(chatMessages, { PROJECT_DESCRIPTION: userPrompt, PROJECT_TREE_STRUCTURE: projectStructure, PROJECT_SPECIFICATION: await projectSpecification, FILEPATH: filePath }, cancellationToken)
      .then(content => Buffer.from(content))
  }
  _getResponseScopedData(responseId) {
    let data = this.responseScopedData.get(responseId)
    return data || ((data = new Map()), this.responseScopedData.set(responseId, data)), data
  }
  _getProjectMetadata(filePath) {
    let [, projectName, ...path] = filePath.split('/')
    return { projectName: projectName, path: path }
  }
},
var responseExamples = `
Below you will find a set of examples of what you should respond with. Please follow these examples as closely as possible.

## Valid setup question

User: Create a TypeScript express app
Assistant:

Sure, here's a proposed directory structure for a TypeScript Express app:

\`\`\`filetree
my-express-app
\u251C\u2500\u2500 src
\u2502   \u251C\u2500\u2500 app.ts
\u2502   \u251C\u2500\u2500 controllers
\u2502   \u2502   \u2514\u2500\u2500 index.ts
\u2502   \u251C\u2500\u2500 routes
\u2502   \u2502   \u2514\u2500\u2500 index.ts
\u2502   \u2514\u2500\u2500 types
\u2502       \u2514\u2500\u2500 index.ts
\u251C\u2500\u2500 package.json
\u251C\u2500\u2500 tsconfig.json
\u2514\u2500\u2500 README.md
\`\`\`

## Invalid setup question

User: Create a horse project
Assistant: Sorry, I don't know how to set up a horse project.`,
newIntentId = 'new'
function registerNewWorkspaceIntent() {
  let newWorkspaceIntent = new Intent({
    location: 2,
    id: newWorkspaceIntentId,
    description: requestLight.t('Scaffold code for a new workspace'),
    modelDescription: 'Scaffolds a new project from scratch based on requirements from the user.',
    modelSampleQuestion: 'Create a RESTful API server using typescript',
    commandInfo: {
      followupPlaceholder: 'Provide additional instructions to refine the proposed workspace',
      shouldRepopulate: true,
      allowsEmptyArgs: false,
      yieldsTo: [{ command: 'fix' }, { command: 'explain' }, { command: 'workspace' }, { command: 'tests' }],
      defaultEnablement: true,
      sampleRequest: requestLight.t('Create a RESTful API server using typescript'),
    },
    systemPromptOptions: {
      examples: responseExamples,
      roleplay:
        'You are a VS Code assistant. Your job is to suggest a filetree directory structure for a project that a user wants to create. If a step does not relate to filetree directory structures, do not respond. Please do not guess a response and instead just respond with a polite apology if you are unsure. Please end your response with [RESPONSE END] and do not include any other text.',
    },
    rules: `
You should generate a markdown file tree structure for the same project and include it in your response.
You should only list common files for the user's desired project type.
You should always include a README.md file which describes the project.
Do not include folders and files generated after compiling, building or running the project such as node_modules, dist, build, out
Do not include image files such as png, jpg, ico, etc
Do not include any descriptions or explanations in your response.`.trim(),
    turnFilter: turns =>
      turns.filter(
        turn => turn.intentInvocation?.intent.id === newWorkspaceIntentId || (turn.request.type !== 'user' && turn.request.type !== 'follow-up')
      ),
    responseProcessor: processNewWorkspaceResponse,
    followUps: generateWorkspaceCommands,
    contextResolvers: [],
  });

  IntentManager.registerIntent(newWorkspaceIntent);
}
ContributionManager.registerContribution(registerNewWorkspaceIntent)
function processNewWorkspaceResponse(context, response, reporter, messages) {
  let isFileTreeStarted = false,
    appliedText = '',
    fileTreeText = '',
    promiseOutcome,
    fileTreeStartRegex = /```filetree\n/,
    fileTreeEndRegex = /```[^\n]*/,
    userMessages = messages.filter(message => message.role !== 'system'),
    textApplier = new TextApplier(message => {
      let requestId = response.requestId ?? ''
      if (
        (response.response || (response.response = { message: appliedText, type: 'model' }),
        (message = message.replace('[RESPONSE END]', '')),
        (response.response.message += message),
        (appliedText += message),
        !message)
      )
        return
      let requestMessage = response.request.message,
        fileTreeMatch = message.match(/```filetree\n([\s\S]+?)\n```/)
      if (fileTreeMatch) {
        let [beforeFileTree, afterFileTree] = message.split(fileTreeMatch[0])
        fileTreeText = fileTreeMatch[1]
        let parsedFileTree = parseFileTree(fileTreeText),
          fileTreeItem = { treeData: generateFileTreeItem(requestId, parsedFileTree) }
        reporter.report({ content: beforeFileTree }),
          reporter.report({ placeholder: requestLight.t('Generating workspace preview...'), resolvedContent: Promise.resolve(fileTreeItem) }),
          reporter.report({ content: afterFileTree }),
          context.get(ProjectManager).set(requestId, fileTreeItem.treeData.label, requestMessage, fileTreeText, fileTreeItem, userMessages)
      } else if (message.trim().match(fileTreeEndRegex) && isFileTreeStarted && promiseOutcome) {
        fileTreeText = fileTreeText.trim()
        isFileTreeStarted = false
        let parsedFileTree = parseFileTree(fileTreeText),
          fileTreeItem = { treeData: generateFileTreeItem(requestId, parsedFileTree) }
        fileTreeItem.treeData.children?.length === 0
          ? promiseOutcome.complete({ content: requestLight.t('Sorry, something went wrong. Please try asking your question again.') })
          : (promiseOutcome.complete(fileTreeItem), context.get(ProjectManager).set(requestId, fileTreeItem.treeData.label, requestMessage, fileTreeText, fileTreeItem, userMessages))
      } else
        message.match(fileTreeStartRegex) && !isFileTreeStarted && !promiseOutcome
          ? (isFileTreeStarted = true,
            promiseOutcome = new PromiseOutcome(),
            reporter.report({ placeholder: requestLight.t('Generating workspace preview...'), resolvedContent: promiseOutcome.p }))
          : isFileTreeStarted
          ? (fileTreeText += message)
          : reporter.report({ content: message })
    })
  return {
    get appliedText() {
      return Promise.resolve(appliedText)
    },
    apply: message => textApplier.apply(message),
  }
}

async function generateWorkspaceCommands(context, response) {
  let logger = context.get(LoggerManager).getPromptResponseLogger('new')
  if (!response.response?.message) return []

  let fileTreeRegex = /```[^\n]*\n([\s\S]+?)\n```/,
    fileTreeMatch = response.response.message.match(fileTreeRegex),
    fileTreeText = fileTreeMatch && fileTreeMatch[1].trim()

  if (!fileTreeText) {
    logger.info(
      `[workspaceIntent] Response validation failed for response:
` + JSON.stringify(response.response.message)
    )
    return []
  }

  let parsedFileTree = parseFileTree(fileTreeText),
    projectItems = []

  if ((generateFileTree(parsedFileTree, '', projectItems), projectItems.length === 0)) {
    logger.info(
      `[workspaceIntent] Failed to fetch project items for
` + fileTreeText
    )
    return []
  }

  let commands = [],
    createProjectCommand = {
      commandId: 'github.copilot.createProject',
      args: [response.request.message, projectItems, fileTreeText.replace(/\n/g, ''), response.sessionId, response.requestId],
      title: requestLight.t('Create Workspace'),
    }

  commands.push(createProjectCommand)
  return commands
}

function calculateIndentationLevel(text) {
  let index = text.indexOf('\u2500\u2500 '),
    indentationLevel =
      index -
      text.indexOf(
        `
`,
        index
      ) -
      1
  return indentationLevel === -1 ? 0 : indentationLevel
}

var excludedFilesAndFolders = [
  'node_modules',
  'out',
  'bin',
  'debug',
  'obj',
  'lib',
  '.dll',
  '.pdb',
  '.lib',
  '.jpg',
  '.png',
  '.ico',
  '.gif',
  '.svg',
  '.jpeg',
  '.tiff',
  '.bmp',
  '.webp',
  '.jpeg',
  '.gitignore',
  'LICENSE.txt',
  'yarn.lock',
  'package-lock.json',
]

function filterOutExcludedFiles(node) {
  let filteredChildren = []
  for (let child of node.children) excludedFilesAndFolders.some(excluded => child.name.endsWith(excluded)) || filteredChildren.push(child)
  node.children = filteredChildren
  for (let child of node.children) filterOutExcludedFiles(child)
  return node
}

function parseFileTree(text) {
  let lines = text.trim().split(`
`),
    root = { name: '', depth: 0, parent: void 0, children: [] },
    current = root
  for (let line of lines) {
    let depth = calculateIndentationLevel(line),
      index = line.lastIndexOf('\u2500\u2500 '),
      node = { name: index >= 0 ? line.substring(index + 3) : line, depth: depth, parent: void 0, children: [] }
    if (depth === 0) {
      root.name = line
      continue
    } else if (current.depth < depth) (node.parent = current), current.children.push(node)
    else if (current.depth === depth) (node.parent = current.parent), current.parent?.children.push(node)
    else {
      for (; current.depth !== depth && current.parent; ) current = current.parent
      ;(node.parent = current.parent), current.parent?.children.push(node)
    }
    current = node
  }
  return filterOutExcludedFiles(root)
}

function isFile(path) {
  return /\.[^/.]+$/.test(path)
}

function generateFileTree(node, path = '', result) {
  let fullPath = path === '' ? node.name : `${path}/${node.name}`
  result.push({ type: node.children.length || !isFile(fullPath) ? 'folder' : 'file', path: fullPath })
  for (let child of node.children) generateFileTree(child, fullPath, result)
}

function generateFileTreeItem(workspace, node, path = '') {
  let fullPath = path === '' ? node.name : `${path}/${node.name}`,
    children = [],
    sortedChildren = node.children.sort((child1, child2) =>
      child1.children.length && child2.children.length ? child1.name.localeCompare(child2.name) : child1.children.length ? -1 : 1
    )
  for (let child of sortedChildren) children.push(generateFileTreeItem(workspace, child, fullPath))
  return { label: node.name, uri: generateUri(workspace, fullPath), children: children.length || !isFile(fullPath) ? children : void 0 }
}

async function processErrorAndFix(workspace, options, document, error, context) {
  let errorCode = error.code ? (typeof error.code == 'string' || typeof error.code == 'number' ? error.code : error.code.value) : '',
    errorMessage = `${error.message}. ${errorCode}`,
    messageSource = { messageSource: 'slash.new' },
    range = error.range,
    commandContext = { document: document, fileIndentInfo: void 0, language: getCommentSymbol(document), wholeRange: range, selection: new VscodeSelection(range.start, range.end) },
    commandResult = await processCommand(workspace, `/fix ${errorMessage}`, commandContext, void 0, generateTelemetryEvent(), context),
    endpoint = commandResult.intentInvocation.endpoint,
    messages = await generateMessages(commandResult, void 0, generateTelemetryEvent(), context),
    dataRetriever = workspace.get(DataRetriever),
    messageLength = async message => (isCodeBlock(message) ? message.length : void 0),
    fetchedMessage = await dataRetriever.fetchOne(messages, messageLength, context, 2, endpoint, { temperature: options.temperature, top_p: options.topP }, messageSource)
  if (fetchedMessage.type === 'success' && fetchedMessage.value.length > 0) {
    let replyInterpreter = commandResult.intentInvocation.createReplyInterpreter({ report() {} }, !1)
    replyInterpreter.update(fetchedMessage.value)
    let finalResult = await replyInterpreter.finish()
    return finalResult.type === 'inlineEdit' ? finalResult.edits : void 0
  }
}

function generateUri(workspace, path) {
  return VscodeUri.from({ scheme: 'vscode-copilot-workspace', authority: workspace ?? '', path: `/${path}` })
}

var BaseEnvironment = class {}

function registerExperimentFilters(container) {
  let experimentManager = container.get(ExperimentManager),
    configManager = container.get(ConfigManager)
  experimentManager.registerStaticFilters(mergeAllFilters(container)),
    experimentManager.registerDynamicFilter('X-Copilot-OverrideEngine', () => configManager.getConfig(settings.DebugOverrideEngine))
}

function mergeAllFilters(container) {
  let staticFilters = generateStaticFilters(container),
    dynamicFilters = container.get(BaseEnvironment).addEditorSpecificFilters()
  return { ...staticFilters, ...dynamicFilters }
}

function generateStaticFilters(container) {
  let buildInfo = container.get(BuildInfo),
    editorInfo = buildInfo.getEditorInfo()
  return {
    'X-VSCode-AppVersion': extractVersion(editorInfo.version),
    'X-MSEdge-ClientId': buildInfo.machineId,
    'X-VSCode-ExtensionName': buildInfo.getName(),
    'X-VSCode-ExtensionVersion': extractVersion(buildInfo.getVersion()),
    'X-VSCode-TargetPopulation': 'public',
  }
}

function extractVersion(versionString) {
  return versionString.split('-')[0]
}

var fetch = handleDefaultExports(fetch(), 1),
  iht = {
    ALPN_HTTP2: fetch.default.ALPN_HTTP2,
    ALPN_HTTP2C: fetch.default.ALPN_HTTP2C,
    ALPN_HTTP1_1: fetch.default.ALPN_HTTP1_1,
    ALPN_HTTP1_0: fetch.default.ALPN_HTTP1_0,
  },
  {
    fetch: oht,
    context: context,
    reset: sht,
    noCache: aht,
    h1: cht,
    keepAlive: lht,
    h1NoCache: uht,
    keepAliveNoCache: pht,
    cacheStats: dht,
    clearCache: fht,
    offPush: mht,
    onPush: hht,
    createUrl: ght,
    timeoutSignal: vht,
    Body: _ht,
    Headers: yht,
    Request: xht,
    Response: bht,
    AbortController: AbortController,
    AbortError: AbortError,
    AbortSignal: Eht,
    FetchBaseError: Tht,
    FetchError: FetchError,
    ALPN_HTTP2: Sht,
    ALPN_HTTP2C: Cht,
    ALPN_HTTP1_1: Iht,
    ALPN_HTTP1_0: wht,
  } = fetch.default
var tls = handleDefaultExports(require('tls'))
var fs = handleDefaultExports(require('fs'))
var Cache = class {
  constructor() {
    this.cache = new Map()
  }
  get(key) {
    return this.cache.get(key)
  }
  set(key, value) {
    this.cache.set(key, value)
  }
}

var BaseCertificateLoader = class {
  async loadCaCerts() {}
}

var BaseCertificateReader = class {},
var createInstance = (container, platform = process.platform) => new CertificateReader(container.get(EventEmitter), createCertificateLoader(platform, container), new EmptyCertificateReader()),

var CertificateReader = class extends BaseClass {
  constructor(eventEmitter, realReader, noopReader) {
    super()
    this.realReader = realReader
    this.noopReader = noopReader
    this.delegate = realReader
    eventEmitter.on('onCopilotToken', token => {
      this.delegate = token.getTokenValue('ssc') === '1' ? this.realReader : this.noopReader
    })
  }
  getAllRootCAs() {
    return this.delegate.getAllRootCAs()
  }
}
var createCertificateLoader = (platform, container) => {
    let loader = container.get(Cache).get(platform)
    if (loader) return loader
    let platformSpecificLoader = createPlatformSpecificLoader(platform, container),
      certificateManager = new ExtraCertificateReader(platformSpecificLoader),
      certificateValidator = new CachedCertificateReader(certificateManager),
      certificateLoader = new LoggerCertificateReader(container, certificateValidator)
    container.get(Cache).set(platform, certificateLoader)
    return certificateLoader
  }
var createPlatformSpecificLoader = (platform, container) => {
    switch (platform) {
      case 'linux':
        return new LinuxCertificateReader()
      case 'darwin':
        return new MacOSCertificateReader()
      case 'win32':
        return new WindowsCertificateReader(container)
      default:
        return new UnsupportedPlatformReader()
    }
  },
  LoggerCertificateReader = class extends BaseCertificateReader {
    constructor(accessor, delegate) {
      super()
      this.accessor = accessor
      this.delegate = delegate
    }
    async getAllRootCAs() {
      try {
        return await this.delegate.getAllRootCAs()
      } catch (error) {
        return this.accessor.get(LoggerManager).getLogger('certificates').warn(`Failed to read root certificates: ${error}`), []
      }
    }
  },
  CachedCertificateReader = class extends BaseCertificateReader {
    constructor(delegate) {
      super()
      this.delegate = delegate
    }
    async getAllRootCAs() {
      return this.certificates || (this.certificates = await this.delegate.getAllRootCAs()), this.certificates
    }
  },
  ExtraCertificateReader = class extends BaseCertificateReader {
    constructor(delegate) {
      super()
      this.delegate = delegate
    }
    async getAllRootCAs() {
      let rootCAs = await this.delegate.getAllRootCAs(),
        extraCertsPath = process.env.NODE_EXTRA_CA_CERTS
      if (!extraCertsPath) return rootCAs
      let extraCerts = await readCertificatesFromFile(extraCertsPath)
      return rootCAs.concat(extraCerts)
    }
  },
  LinuxCertificateReader = class extends BaseCertificateReader {
    async getAllRootCAs() {
      let rootCAs = []
      for (let path of ['/etc/ssl/certs/ca-certificates.crt', '/etc/ssl/certs/ca-bundle.crt']) {
        let certs = await readCertificatesFromFile(path)
        rootCAs = rootCAs.concat(certs)
      }
      return rootCAs
    }
  },
  MacOSCertificateReader = class extends BaseCertificateReader {
    async getAllRootCAs() {
      let macCerts = macCa()
      return macCerts.all(macCerts.der2.pem).filter(cert => cert !== void 0)
    }
  },
  WindowsCertificateReader = class extends BaseCertificateReader {
    constructor(accessor) {
      super()
      this.accessor = accessor
    }
    async getAllRootCAs() {
      return (await this.accessor.get(BaseCertificateLoader).loadCaCerts()) || []
    }
  },
  UnsupportedPlatformReader = class extends BaseCertificateReader {
    async getAllRootCAs() {
      throw new Error('No certificate reader available for unsupported platform')
    }
  },
  EmptyCertificateReader = class extends BaseCertificateReader {
    async getAllRootCAs() {
      return []
    }
  }
async function readCertificatesFromFile(filePath) {
  try {
    let fileContent = (await fs.promises.readFile(filePath, { encoding: 'utf8' }))
        .split(/(?=-----BEGIN CERTIFICATE-----)/g)
        .filter(cert => cert.length > 0),
      uniqueCerts = new Set(fileContent)
    return Array.from(uniqueCerts)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
  return []
}
var CertificateManager = class {
  constructor(dependency) {
    this._certificateReader = dependency.get(CertificateReader)
  }
  async enhanceProxySettings(settings) {
    let certificates = await this.getCertificates()
    return { ...settings, ca: certificates }
  }
  async getCertificates() {
    let certificates = await this._certificateReader.getAllRootCAs()
    if (certificates.length !== 0) return certificates
  }
  async applyToRequestOptions(options) {
    let certificates = await this._certificateReader.getAllRootCAs(),
      additionalCerts = { _vscodeAdditionalCaCerts: certificates }
    options.secureContext = tls.createSecureContext(additionalCerts)
    options.ca = certificates
    options.cert = certificates
    certificates.map(cert => {
      options.secureContext.context.addCACert(cert)
    })
  }
}
var http = handleDefaultExports(require('http'))
var BaseKerberosLoader = class {
  async loadKerberos() {}
}
var ProxyAuthorizationRequired = 407,
BaseSocketFactory = class {},
  ProxyError = class extends Error {
    constructor(message, cause, responseStatus) {
      super(message)
      this.cause = cause
      this.responseStatus = responseStatus
    }
  }
function createSocketFactory(t) {
  return new SocketFactory(t, new ProxySocketFactory(t))
}
var SocketFactory = class extends BaseSocketFactory {
  constructor(accessor, delegate, platform = process.platform) {
    super()
    this.accessor = accessor
    this.delegate = delegate
    this.platform = platform
    this.successfullyAuthorized = new LimitedLinkedMap(20)
    this.logger = accessor.get(LoggerManager).getLogger('proxy-socket-factory')
  }
  async createSocket(request, proxy) {
    if (this.successfullyAuthorized.get(this.getProxyCacheKey(proxy))) {
      this.logger.debug('Proxy authorization already successful once, skipping 407 rountrip')
      await this.reauthorize(request, proxy)
    }
    try {
      return await this.delegate.createSocket(request, proxy)
    } catch (error) {
      if (error instanceof ProxyError && error.responseStatus === ProxyAuthorizationRequired) {
        this.logger.debug('Proxy authorization required, trying to authorize first time')
        let socket = await this.authorizeAndCreateSocket(request, proxy)
        if (socket) {
          this.logger.debug('Proxy authorization successful, caching result')
          this.successfullyAuthorized.set(this.getProxyCacheKey(proxy), true)
          return socket
        }
      }
      throw error
    }
  }
  async reauthorize(request, proxy) {
    let token = await this.authorize(proxy)
    if (token) {
      this.logger.debug('Proxy re-authorization successful, received token')
      request.headers['Proxy-Authorization'] = 'Negotiate ' + token
    }
  }
  async authorizeAndCreateSocket(request, proxy) {
    let token = await this.authorize(proxy)
    if (token) {
      this.logger.debug('Proxy authorization successful, received token')
      this.logger.debug('Trying to create socket with proxy authorization')
      request.headers['Proxy-Authorization'] = 'Negotiate ' + token
      return await this.delegate.createSocket(request, proxy)
    }
  }
  async authorize(proxy) {
    this.logger.debug('Loading kerberos module')
    let kerberos = await loadKerberosModule(this.accessor)
    if (!kerberos) {
      this.logger.debug('Could not load kerberos module')
      return
    }
    let spn = this.computeSpn(proxy)
    this.logger.debug('Initializing kerberos client using spn', spn)
    let client = await kerberos.initializeClient(spn)
    this.logger.debug('Perform client side kerberos step')
    let serverResponse = await client.step('')
    this.logger.debug('Received kerberos server response')
    return serverResponse
  }
  computeSpn(proxy) {
    let configManager = this.accessor.get(ConfigManager)
    let spn = configManager.isDefaultSettingOverwritten(settings.KerberosServicePrincipal)
      ? configManager.getConfig(settings.KerberosServicePrincipal)
      : proxy.kerberosServicePrincipal
    if (spn) {
      this.logger.debug('Using configured kerberos spn', spn)
      return spn
    }
    let defaultSpn = this.platform === 'win32' ? `HTTP/${proxy.host}` : `HTTP@${proxy.host}`
    this.logger.debug('Using default kerberos spn', defaultSpn)
    return defaultSpn
  }
  getProxyCacheKey(proxy) {
    return proxy.host + ':' + proxy.port
  }
}
var ProxySocketFactory = class extends BaseSocketFactory {
    constructor(dependency) {
      super()
      this.logger = dependency.get(LoggerManager).getLogger('proxy-socket-factory')
    }
    async createSocket(request, proxy) {
      let requestOptions = this.createConnectRequestOptions(request, proxy)
      return new Promise((resolve, reject) => {
        this.logger.debug('Attempting to establish connection to proxy')
        let proxyRequest = http.request(requestOptions)
        proxyRequest.useChunkedEncodingByDefault = false
        proxyRequest.once('connect', (response, socket, head) => {
            this.logger.debug('Socket Connect returned status code', response.statusCode)
            proxyRequest.removeAllListeners()
            socket.removeAllListeners()
            if (response.statusCode !== 200) {
              socket.destroy()
              reject(new ProxyError('tunneling socket could not be established', undefined, response.statusCode))
            } else if (head.length > 0) {
              socket.destroy()
              reject(new ProxyError('got illegal response body from proxy'))
            } else {
              this.logger.debug('Successfully established tunneling connection to proxy')
              resolve(socket)
            }
          })
          proxyRequest.once('error', error => {
            this.logger.debug('Proxy socket connection error', error.message)
            proxyRequest.removeAllListeners()
            reject(new ProxyError('tunneling socket could not be established', error))
          })
          proxyRequest.on('timeout', () => {
            this.logger.debug('Proxy socket connection timeout')
            reject(new ProxyError(`tunneling socket could not be established, proxy socket connection timeout while connecting to ${requestOptions.host}:${requestOptions.port}`))
          })
          proxyRequest.end()
      })
    }
    createConnectRequestOptions(request, proxy) {
      let options = {
        ...proxy,
        method: 'CONNECT',
        path: request.host + ':' + request.port,
        agent: false,
        headers: { host: request.host + ':' + request.port, 'Proxy-Connection': 'keep-alive' },
        timeout: request.timeout,
      }
      if (request.localAddress) options.localAddress = request.localAddress
      this.configureProxyAuthorization(options, request)
      return options
    }
    configureProxyAuthorization(options, request) {
      options.headers['Proxy-Authorization'] = []
      if (options.proxyAuth) options.headers['Proxy-Authorization'].push('Basic ' + Buffer.from(options.proxyAuth).toString('base64'))
      if (request.headers && request.headers['Proxy-Authorization']) options.headers['Proxy-Authorization'].push(request.headers['Proxy-Authorization'])
    }
  }

async function loadKerberosModule(accessor) {
  try {
    return accessor.get(BaseKerberosLoader).loadKerberos()
  } catch {
    return
  }
}

var ConnectionManager = class extends ConnectionSettings {
  constructor(settings) {
    super()
    this.accessor = settings
    this.createSocketFactory = (settings, rejectUnauthorized) => async requestOptions => {
      requestOptions.rejectUnauthorized = rejectUnauthorized
      requestOptions.timeout = settings.connectionTimeoutInMs
      await this.certificateConfigurator.applyToRequestOptions(requestOptions)
      let proxySettings = await this.certificateConfigurator.enhanceProxySettings(settings)
      try {
        return await this.proxySocketFactory.createSocket(requestOptions, proxySettings)
      } catch (error) {
        throw error instanceof ProxyError && error.cause ? new Error(`${error.message}, cause=${error.cause.message}`) : new Error(error.message)
      }
    }
    this.fetchApi = this.createFetchApi(settings)
    this.certificateConfigurator = new CertificateManager(settings)
    this.proxySocketFactory = settings.get(BaseSocketFactory)
  }
  set proxySettings(settings) {
    this._proxySettings = settings
    this.fetchApi = this.createFetchApi(this.accessor)
  }
  get proxySettings() {
    return this._proxySettings
  }
  set rejectUnauthorized(settings) {
    super.rejectUnauthorized = settings
    this.fetchApi = this.createFetchApi(this.accessor)
  }
  get rejectUnauthorized() {
    return super.rejectUnauthorized
  }
  createFetchApi(settings) {
    let buildInfo = settings.get(BuildInfo)
    return context({
      userAgent: `GitHubCopilotChat/${buildInfo.getVersion()}`,
      socketFactory: this._proxySettings
        ? this.createSocketFactory(this._proxySettings, super.rejectUnauthorized)
        : void 0,
      rejectUnauthorized: super.rejectUnauthorized,
    })
  }
  async fetch(url, options) {
    let requestOptions = { ...options, body: options.body ? options.body : options.json, signal: options.signal }
    await this.certificateConfigurator.applyToRequestOptions(requestOptions)
    let certificates = await this.certificateConfigurator.getCertificates()
    this.fetchApi.setCA(certificates)
    let response = await this.fetchApi.fetch(url, requestOptions)
    return new HttpResponse(
      response.status,
      response.statusText,
      response.headers,
      () => response.text(),
      () => response.json(),
      async () => response.body
    )
  }
  disconnectAll() {
    return this.fetchApi.reset()
  }
  makeAbortController() {
    return new AbortController()
  }
  isAbortError(error) {
    return error instanceof AbortError
  }
  isDNSLookupFailedError(error) {
    return error instanceof FetchError && error.code === 'ENOTFOUND'
  }
  isFetcherError(error) {
    return error instanceof FetchError
  }
}
var http = handleDefaultExports(require('http')),
https = handleDefaultExports(require('https'))
var NetworkManager = class extends ConnectionSettings {
  constructor(runtimeInfoService) {
    super()
    this._runtimeInfoService = runtimeInfoService
  }
  fetch(url, options) {
    let headers = options.headers || {}
    headers['User-Agent'] = `GitHubCopilotChat/${this._runtimeInfoService.getVersion()}`
    let body = options.body
    if (options.json) {
      if (options.body) throw new Error("Illegal arguments! Cannot pass in both 'body' and 'json'!")
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(options.json)
    }
    let method = options.method || 'GET'
    if (method !== 'GET' && method !== 'POST') throw new Error("Illegal arguments! 'method' must be either 'GET' or 'POST'!")
    let signal = options.signal ?? new AbortController().signal
    if (signal && !(signal instanceof AbortSignal))
      throw new Error("Illegal arguments! 'signal' must be an instance of AbortSignal!")
    return this._fetch(url, method, headers, body, signal)
  }
  _fetch(url, method, headers, body, signal) {
    return new Promise((resolve, reject) => {
      let request = (url.startsWith('https:') ? https : http).request(url, { method: method, headers: headers }, response => {
        if (signal.aborted) {
          response.destroy()
          request.destroy()
          reject(getAbortReason(signal))
          return
        }
        let responseManager = new ResponseManager(request, response, signal)
        resolve(
          new HttpResponse(
            response.statusCode || 0,
            response.statusMessage || '',
            responseManager.headers,
            async () => responseManager.text(),
            async () => responseManager.json(),
            async () => responseManager.body()
          )
        )
      })
      request.setTimeout(60 * 1e3)
      request.on('error', reject)
      body && request.write(body)
      request.end()
    })
  }
  async disconnectAll() {}
  makeAbortController() {
    return new AbortController()
  }
  isAbortError(error) {
    return isAbortError(error)
  }
  isDNSLookupFailedError(error) {
    return error && error.code === 'ENOTFOUND'
  }
  isFetcherError(error) {
    return error && ['EADDRINUSE', 'ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'EPIPE', 'ETIMEDOUT'].includes(error.code)
  }
  set proxySettings(settings) {}
  get proxySettings() {}
}

function getAbortReason(signal) {
  return signal.reason
}

function isAbortError(error) {
  return error && error.name === 'AbortError'
}

var ResponseManager = class {
  constructor(request, response, signal) {
    this.req = request
    this.res = response
    this.signal = signal
    this.headers = new (class {
      get(headerName) {
        let headerValue = response.headers[headerName]
        return Array.isArray(headerValue) ? headerValue[0] : headerValue ?? null
      }
      [Symbol.iterator]() {
        let headerKeys = Object.keys(response.headers),
          index = 0
        return {
          next: () => {
            if (index >= headerKeys.length) return { done: true, value: undefined }
            let key = headerKeys[index++]
            return { done: false, value: [key, this.get(key)] }
          },
        }
      }
    })()
  }
  text() {
    return new Promise((resolve, reject) => {
      let chunks = []
      this.res.on('data', chunk => chunks.push(chunk)),
        this.res.on('end', () => resolve(Buffer.concat(chunks).toString())),
        this.res.on('error', reject),
        this.signal.addEventListener('abort', () => {
          this.res.destroy(), this.req.destroy(), reject(getAbortReason(this.signal))
        })
    })
  }
  async json() {
    let text = await this.text()
    return JSON.parse(text)
  }
  async body() {
    this.signal.addEventListener('abort', () => {
      this.res.emit('error', getAbortReason(this.signal)), this.res.destroy(), this.req.destroy()
    })
    return this.res
  }
}

var fs = handleDefaultExports(require('fs'))
var tokenFilePath = `${process.env.HOME || process.env.USERPROFILE}/.copilot-testing-gh-token`,
  tokenHandler
function getTokenHandler() {
  return tokenHandler || (tokenHandler = createTokenHandler()), tokenHandler
}
var createTokenHandler = () => {
  if (process.env.GITHUB_PAT) return new DefaultTokenHandler(process.env.GITHUB_PAT)
  let token = readTokenFromFile()
  if (token) return new GitHubTokenHandler({ token: token.trim() })
  throw new Error(
    `Tests: either GITHUB_PAT must be set, or there must be a GitHub token from an app with access to Copilot in ${tokenFilePath}. Run "npm run get_token" to get one.`
  )
}
function readTokenFromFile() {
  if (fs.existsSync(tokenFilePath)) return fs.readFileSync(tokenFilePath).toString()
}
var UrlOpener = class {
  constructor() {
    this.openedUrls = []
  }
  open(url) {
    this.openedUrls.push(url)
  }
}
var vscode = handleDefaultExports(require('vscode'))

function stringify(t) {
  return typeof t == 'string' ? t : JSON.stringify(t)
}

var WorkspaceConfigManager = class extends ConfigManager {
  constructor() {
    super()
    this.config = vscode.workspace.getConfiguration(extensionId)
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration(extensionId)) {
          this.config = vscode.workspace.getConfiguration(extensionId)
        }
      })
  }
  getConfig(setting) {
    return this.config[setting.firstPart] && this.config[setting.firstPart][setting.secondPart] !== void 0
      ? this.config[setting.firstPart][setting.secondPart]
      : setting.defaultValue
  }
  isDefaultSettingOverwritten(setting) {
    return this.config[setting.firstPart] && this.config[setting.firstPart][setting.secondPart] !== void 0
  }
  dumpConfig() {
    let configDump = {}
    try {
      let properties = packageInfo.contributes.configuration?.properties ?? {}
      for (let key in properties) {
        let value = key
          .replace(`${extensionId}.`, '')
          .split('.')
          .reduce((obj, prop) => obj[prop], this.config)
        if (typeof value == 'object' && value !== null) {
          Object.keys(value)
            .filter(prop => prop !== 'secret_key')
            .forEach(prop => (configDump[`${key}.${prop}`] = stringify(value[prop])))
        } else {
          configDump[key] = stringify(value)
        }
      }
    } catch (error) {
      console.error(`Failed to retrieve configuration properties ${error}`)
    }
    return configDump
  }
}

var vscode = require('vscode'),
  consoleOutput = []
function getConsoleOutput() {
  return consoleOutput.join(`
`)
}
function addOutput(output, maxOutputLength = 40) {
  consoleOutput.push(removeEscapeSequences(output))
  if (consoleOutput.length > maxOutputLength) {
    consoleOutput.shift()
  }
}
var DebugSessionHandler = class {
  constructor(session) {
    this.session = session
  }
  onWillStartSession() {}
  onWillReceiveMessage(message) {}
  onDidSendMessage(message) {
    if (vscode.debug.activeDebugSession !== this.session) return
    let output = this.extractOutput(message)
    output && addOutput(output)
  }
  extractOutput(message) {
    if (message.event === 'output' && (message.body.category === 'stdout' || message.body.category === 'stderr')) return message.body.output
  }
  onWillStopSession() {}
  onError(error) {}
  onExit(exitCode, signal) {}
}
function removeEscapeSequences(text) {
  let escapeSequenceRegex = /(:?\x1b\[|\x9B)[=?>!]?[\d;:]*["$#'* ]?[a-zA-Z@^`{}|~]/g
  return text && text.replace(escapeSequenceRegex, '')
}
function registerDebugAdapterTrackerFactory() {
  return [vscode.debug.registerDebugAdapterTrackerFactory('*', new DebugAdapterTrackerFactory())]
}
var DebugAdapterTrackerFactory = class {
  createDebugAdapterTracker(session) {
    return new DebugSessionHandler(session)
  }
}
var DebugConsole = class extends DisposableClass {
  constructor() {
    super()
    for (let trackerFactory of registerDebugAdapterTrackerFactory()) {
      this._register(trackerFactory)
    }
  }
  get consoleOutput() {
    return getConsoleOutput()
  }
}

var crypto = require('crypto')
var EmbeddingComputer = class {
  constructor(accessor) {
    this.accessor = accessor
  }
  async computeEmbeddings(inputs, telemetryContext) {
    this._embeddingEndpoint || (this._embeddingEndpoint = await this.accessor.get(EndpointManager).getEmbeddingsEndpointInfo())
    let maxBatchSize = this._embeddingEndpoint.maxBatchSize,
      modelMaxTokenWindow = this._embeddingEndpoint.modelMaxTokenWindow
    return this.fetchResponseWithBatches(inputs, telemetryContext, modelMaxTokenWindow, maxBatchSize)
  }
  async fetchResponseWithBatches(inputs, telemetryContext, maxTokenCount, maxBatchSize) {
    let embeddings = [],
      tokenizer = this.accessor.get(Tokenizer),
      batch = [],
      tokenCount = 0
    for (let input of inputs) {
      let inputTokenCount = tokenizer.tokenLength(input)
      if (tokenCount + inputTokenCount >= maxTokenCount || batch.length >= maxBatchSize) {
        let response = await this.rawEmbeddingsFetchWithTelemetry(this.accessor, (0, crypto.randomUUID)(), batch, telemetryContext)
        if (response.type === 'failed') return
        embeddings.push(...response.embeddings), (batch = []), (tokenCount = 0)
      }
      batch.push(input), (tokenCount += inputTokenCount)
    }
    if (batch.length > 0) {
      let response = await this.rawEmbeddingsFetchWithTelemetry(this.accessor, (0, crypto.randomUUID)(), batch, telemetryContext)
      if (response.type === 'failed') return
      embeddings.push(...response.embeddings)
    }
    return embeddings.length === 0 ? void 0 : embeddings
  }
  async rawEmbeddingsFetchWithTelemetry(accessor, requestId, inputs, telemetryContext) {
    let startTime = Date.now(),
      telemetryService = this.accessor.get(IMSTelemetryService),
      response = await this.rawEmbeddingsFetch(accessor, requestId, inputs, telemetryContext)
    return response.type === 'failed'
      ? (telemetryService.sendTelemetryEvent('embedding.error', { type: response.type, reason: response.reason }), response)
      : (telemetryService.sendTelemetryEvent(
          'embedding.success',
          {},
          {
            batchSize: inputs.length,
            inputTokenCount: inputs.reduce((count, input) => count + this.accessor.get(Tokenizer).tokenLength(input), 0),
            timeToComplete: Date.now() - startTime,
          }
        ),
        response)
  }
  async rawEmbeddingsFetch(accessor, requestId, inputs, telemetryContext) {
    this._embeddingEndpoint || (this._embeddingEndpoint = await this.accessor.get(EndpointManager).getEmbeddingsEndpointInfo())
    try {
      let tokenHandler = accessor.get(BaseTokenHandler),
        token = tokenHandler instanceof DefaultTokenHandler ? await tokenHandler.getEmbeddingsToken(accessor) : await tokenHandler.getCopilotToken(accessor),
        requestBody = { input: inputs, model: 'copilot-text-embedding-ada-002' }
      this._embeddingEndpoint.interceptBody?.(requestBody)
      let response = await sendRequest(accessor, this._embeddingEndpoint, token.token, 'copilot-panel', telemetryContext, requestBody, telemetryContext),
        responseBody = await response.json()
      return response.status === 200 && responseBody.data
        ? { type: 'success', embeddings: responseBody.data.map(item => item.embedding) }
        : { type: 'failed', reason: responseBody.error }
    } catch (error) {
      let errorMessage = error?.message ?? 'Unknown error'
      return errorMessage.match(/Unexpected.*JSON/i) && (errorMessage = 'timeout'), { type: 'failed', reason: errorMessage }
    }
  }
}

var vscode = handleDefaultExports(require('vscode'))
var VSCodeInfoProvider = class extends BaseVSCodeInfoProvider {
  get language() {
    return vscode.env.language
  }
  getAllExtensions() {
    return vscode.extensions.all
  }
  async getAllCommands() {
    return vscode.commands.executeCommand('_getAllCommands')
  }
  async getAllSettings() {
    return vscode.commands.executeCommand('_getAllSettings')
  }
}
var vscode = handleDefaultExports(require('vscode'))
var FileSystemOperations = class extends BaseFileSystemOperations {
  async stat(e) {
    return vscode.workspace.fs.stat(e)
  }
  async readDirectory(e) {
    return vscode.workspace.fs.readDirectory(e)
  }
  async createDirectory(e) {
    return vscode.workspace.fs.createDirectory(e)
  }
  async readFile(e) {
    return vscode.workspace.fs.readFile(e)
  }
  async writeFile(e, r) {
    return vscode.workspace.fs.writeFile(e, r)
  }
  async delete(e, r) {
    return vscode.workspace.fs.delete(e, r)
  }
  async rename(e, r, n) {
    return vscode.workspace.fs.rename(e, r, n)
  }
  async copy(e, r, n) {
    return vscode.workspace.fs.copy(e, r, n)
  }
  isWritableFileSystem(e) {
    return !!vscode.workspace.fs.isWritableFileSystem(e)
  }
  createFileSystemWatcher(e) {
    return vscode.workspace.createFileSystemWatcher(e)
  }
}
var BaseGitExtensionService = class {}
var vscode = handleDefaultExports(require('vscode'))
class GitExtensionService extends BaseGitExtensionService {
  constructor(accessor) {
    super();
    this.accessor = accessor;
    this._onDidChange = new vscode.EventEmitter();
    this.onDidChange = this._onDidChange.event;
    this._disposables = [];
    this._logger = accessor.get(LoggerManager).getLogger('gitExtensionService');
    this._logger.info('Initializing Git extension service.');
    this._disposables.push(...this._initializeExtensionApi());
  }

  getExtensionApi() {
    return this._api;
  }

  _initializeExtensionApi() {
    let disposables = [];
    let gitExtension = vscode.extensions.getExtension('vscode.git');

    let activateGitExtension = async () => {
      let activatedExtension = await gitExtension.activate();
      this._logger.info('Successfully activated the vscode.git extension.');

      let handleEnablementChange = isEnabled => {
        this._logger.info(`Enablement state of the vscode.git extension: ${isEnabled}.`);
        if (isEnabled) {
          this._api = activatedExtension.getAPI(1);
          this._onDidChange.fire();
          this._logger.info('Successfully registered Git commit message provider.');
        }
      };

      disposables.push(activatedExtension.onDidChangeEnablement(handleEnablementChange));
      handleEnablementChange(activatedExtension.enabled);
    };

    if (gitExtension) {
      activateGitExtension();
    } else {
      this._logger.info('vscode.git extension is not yet activated.');
      let onDidChange = vscode.extensions.onDidChange(() => {
        if (!gitExtension && vscode.extensions.getExtension('vscode.git')) {
          gitExtension = vscode.extensions.getExtension('vscode.git');
          activateGitExtension();
          onDidChange.dispose();
        }
      });
    }

    return disposables;
  }
}
var vscode = handleDefaultExports(require('vscode'))
class GitRepositoryManager extends BaseGitRepositoryManager {
  constructor(tabsAndEditors) {
    super();
    this.tabsAndEditors = tabsAndEditors;
  }

  get repositories() {
    let gitExtension = vscode.extensions.getExtension('vscode.git');
    if (!gitExtension) return;
    let workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;
    let gitApi = gitExtension.exports.getAPI(1);
    return workspaceFolders.map(folder => {
      let repository = gitApi.getRepository(folder.uri);
      if (repository)
        return {
          headBranchName: repository.state.HEAD?.name,
          upstreamBranchName: repository.state.HEAD?.upstream?.name,
          isRebasing: repository.state.rebaseCommit !== null,
          remotes: repository.state.remotes.map(remote => remote.name),
          remoteFetchUrls: repository.state.remotes.map(remote => remote.fetchUrl),
        };
    });
  }

  get currentRepository() {
    let gitExtension = vscode.extensions.getExtension('vscode.git');
    if (gitExtension) {
      let gitApi = gitExtension.exports.getAPI(1);
      let selectedRepository = this.selectRepository(gitApi);
      return selectedRepository
        ? {
            headBranchName: selectedRepository.state.HEAD?.name,
            upstreamBranchName: selectedRepository.state.HEAD?.upstream?.name,
            isRebasing: selectedRepository.state.rebaseCommit !== null,
            remotes: selectedRepository.state.remotes.map(remote => remote.name),
            remoteFetchUrls: selectedRepository.state.remotes.map(remote => remote.fetchUrl),
          }
        : undefined;
    }
  }

  selectRepository(gitApi) {
    if (gitApi.repositories.length === 0) return;
    if (gitApi.repositories.length === 1) return gitApi.repositories[0];
    let activeEditor = this.tabsAndEditors.activeTextEditor;
    return gitApi.repositories.filter(repo => activeEditor?.document.uri.fsPath.startsWith(repo.rootUri.fsPath))[0];
  }
}
var vscode = require('vscode')
function processPattern(pattern) {
  if (typeof pattern != 'string') throw new TypeError('Argument must be a string.')
  if (!pattern) return pattern

  let isNegated = pattern.startsWith('!'),
    trimmedPattern = isNegated ? pattern.slice(1) : pattern,
    modifiedPattern = trimmedPattern,
    isAbsolute = false

  switch ((trimmedPattern[0] === '/' && ((isAbsolute = true), (modifiedPattern = trimmedPattern.slice(1))), modifiedPattern[0])) {
    case '*':
      trimmedPattern[1] !== '*' && (modifiedPattern = '**/' + modifiedPattern)
      break
    default:
      if ((((!isAbsolute && !modifiedPattern.includes('/')) || modifiedPattern.endsWith('/')) && (modifiedPattern = '**/' + modifiedPattern), modifiedPattern.endsWith('*') || modifiedPattern.endsWith('?'))) break
      ;/\.[a-z\d_-]+$/.test(modifiedPattern) || (modifiedPattern.endsWith('/') || (modifiedPattern += '/'), (modifiedPattern += '**'))
  }

  return isNegated ? '!' + modifiedPattern : modifiedPattern
}
var Gee = handleDefaultExports(Hee())
var path = require('path')
class IgnoreFileManager {
  constructor() {
    this._ignoreMap = new Map()
    this._ignoreCache = new Map()
    this._searchRankCache = null
  }

  setIgnoreFile(file, patterns) {
    this._ignoreMap.set(file.fsPath, {
      ignore: (0, Gee.default)().add(patterns),
      patterns: patterns.split(/\r?\n/).filter(Boolean).map(processPattern),
    })
    this._searchRankCache = null
    this._ignoreCache.clear()
  }

  removeIgnoreFile(file) {
    this._ignoreMap.delete(file.fsPath)
    this._searchRankCache = null
    this._ignoreCache.clear()
  }

  removeWorkspace(workspace) {
    let count = 0
    for (let key of this._ignoreMap.keys()) {
      if (isPathEqualOrChild(workspace.fsPath, key)) {
        this._ignoreMap.delete(key)
        count += 1
      }
    }
    if (count > 0) {
      this._searchRankCache = null
      this._ignoreCache.clear()
    }
  }

  asMinimatchPatterns() {
    return [...this._ignoreMap.values()].flatMap(value => value.patterns)
  }

  isIgnored(file) {
    if (this._ignoreMap.size === 0) return false
    let filePath = file.fsPath
    if (this._ignoreCache.has(filePath)) return this._ignoreCache.get(filePath)
    let rank = 0
    let result = { ignored: false, unignored: false }
    try {
      let searchRank = this._searchRank
      for (let rankItem of searchRank) {
        rank += 1
        let dir = (0, path.dirname)(rankItem)
        let relativePath = (0, path.relative)(dir, filePath)
        if (!relativePath.startsWith('..') && dir !== filePath && isPathEqualOrChild(dir, filePath)) {
          let ignoreInfo = this._ignoreMap.get(rankItem)
          if (!ignoreInfo) throw new Error(`No ignore patterns found for ${rankItem}`)
          result = ignoreInfo.ignore.test(relativePath)
          if (result.ignored || result.unignored) break
        }
      }
      this._ignoreCache.set(filePath, result.ignored)
      return result.ignored
    } catch {
      return false
    }
  }

  get _searchRank() {
    if (this._searchRankCache !== null) return this._searchRankCache
    let pathLengths = {}
    let getPathLength = path => path.split(path.sep).length
    return (this._searchRankCache = [...this._ignoreMap.keys()].sort((path1, path2) => (pathLengths[path2] ||= getPathLength(path2)) - (pathLengths[path1] ||= getPathLength(path1))))
  }
}

function isPathEqualOrChild(parentPath, childPath) {
  return parentPath === childPath
    ? true
    : (parentPath.charAt(parentPath.length - 1) !== path.sep && (parentPath += path.sep), (0, path.normalize)(childPath).startsWith((0, path.normalize)(parentPath)))
}
const copilotIgnoreFileName = '.copilotignore'
const gitIgnoreFileName = '.gitignore'

class IgnoreFileHandler {
  constructor(accessor) {
    this.accessor = accessor
    this._gitIgnoreFiles = new IgnoreFileManager()
    this._copilotIgnoreFiles = new IgnoreFileManager()
    this._disposables = []
    this.fs = accessor.get(BaseFileSystemOperations)
  }

  dispose() {
    this._disposables.forEach(disposable => disposable.dispose())
    this._disposables = []
  }

  isIgnored(file, options) {
    let isGitIgnored = this._gitIgnoreFiles.isIgnored(file)
    let isCopilotIgnored = this._copilotIgnoreFiles.isIgnored(file)
    return !options || (options.includeGitIgnore && options.includeCopilotIgnore)
      ? isGitIgnored || isCopilotIgnored
      : options.includeGitIgnore && !options.includeCopilotIgnore
      ? isGitIgnored
      : !options.includeGitIgnore && options.includeCopilotIgnore
      ? isCopilotIgnored
      : false
  }

  asMinimatchPattern(options) {
    let patterns = []
    options.includeCopilotIgnore && patterns.push(this._copilotIgnoreFiles.asMinimatchPatterns())
    options.includeGitIgnore && patterns.push(this._gitIgnoreFiles.asMinimatchPatterns())
    let flatPatterns = patterns.flat()
    if (flatPatterns.length !== 0) return flatPatterns.length === 1 ? flatPatterns[0] : `{${flatPatterns.join(',')}}`
  }

  init() {
    return (
      (this._init ??= (async () => {
        for (let workspace of this.accessor.get(WorkspaceClass).getWorkspaceFolders()) await this.addWorkspace(workspace)
      })()),
      this._init
    )
  }

  trackIgnoreFile(file, patterns) {
    file.path.endsWith(gitIgnoreFileName)
      ? this._gitIgnoreFiles.setIgnoreFile(file, patterns)
      : file.path.endsWith(copilotIgnoreFileName) && this._copilotIgnoreFiles.setIgnoreFile(file, patterns)
  }

  removeIgnoreFile(file) {
    file.path.endsWith(gitIgnoreFileName)
      ? this._gitIgnoreFiles.removeIgnoreFile(file)
      : file.path.endsWith(copilotIgnoreFileName) && this._copilotIgnoreFiles.removeIgnoreFile(file)
  }

  removeWorkspace(workspace) {
    this._gitIgnoreFiles.removeWorkspace(workspace)
    this._copilotIgnoreFiles.removeWorkspace(workspace)
  }

  isIgnoreFile(file) {
    return file.path.endsWith(gitIgnoreFileName) ? true : !!file.path.endsWith(copilotIgnoreFileName)
  }

  async addWorkspace(workspace) {
    let files = []
    if (workspace.scheme !== 'file') return
    let fileFinder = this.accessor.get(FileFinder)
    files = files.concat(await fileFinder.findFiles(new BaseUriPattern(workspace, `**/${copilotIgnoreFileName}`)))
    files = files.concat(await fileFinder.findFiles(new BaseUriPattern(workspace, `**/${gitIgnoreFileName}`)))
    for (let file of files) {
      let content = (await this.fs.readFile(file)).toString()
      this.trackIgnoreFile(file, content)
    }
  }
}
var WorkspaceIgnoreFileHandler = class extends IgnoreFileHandler {
  constructor(accessor) {
    super(accessor)
    this.installListeners()
  }

  installListeners() {
    this._disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders(event => {
        for (let folder of event.removed) this.removeWorkspace(folder.uri)
        for (let folder of event.added) this.addWorkspace(folder.uri)
      })
    )

    this._disposables.push(
      vscode.workspace.onDidSaveTextDocument(async document => {
        if (this.isIgnoreFile(document.uri)) {
          let content = (await vscode.workspace.fs.readFile(document.uri)).toString()
          this.trackIgnoreFile(document.uri, content)
        }
      }),

      vscode.workspace.onDidDeleteFiles(event => {
        for (let file of event.files) this.removeIgnoreFile(file)
      }),

      vscode.workspace.onDidRenameFiles(async event => {
        for (let file of event.files)
          if (this.isIgnoreFile(file.newUri)) {
            let content = (await vscode.workspace.fs.readFile(file.newUri)).toString()
            this.removeIgnoreFile(file.oldUri)
            this.trackIgnoreFile(file.newUri, content)
          }
      })
    )
  }
}
var vscode = handleDefaultExports(require('vscode'))
var DiagnosticListener = class extends DiagnosticWaiter {
  constructor() {
    super(...arguments)
    this.onDidChangeDiagnostics = vscode.languages.onDidChangeDiagnostics
  }
  getDiagnostics(r) {
    return vscode.languages.getDiagnostics(r)
  }
}
var vscode = handleDefaultExports(require('vscode'))
var SymbolProvider = class extends BaseSymbolProvider {
  async getDefinitions(uri, position) {
    return await vscode.commands.executeCommand('vscode.executeDefinitionProvider', uri, position)
  }
  async getImplementations(uri, position) {
    return await vscode.commands.executeCommand('vscode.executeImplementationProvider', uri, position)
  }
  async getReferences(uri, position) {
    return await vscode.commands.executeCommand('vscode.executeReferenceProvider', uri, position)
  }
  async getWorkspaceSymbols(query) {
    return await vscode.commands.executeCommand('vscode.executeWorkspaceSymbolProvider', query)
  }
}
var fs = handleDefaultExports(require('fs')),
vscode = handleDefaultExports(require('vscode'))
var VariableManager = class {
  constructor(configProvider) {
    this._variableEnablements = configProvider.get(ConfigManager).getConfigMixedWithDefaults(settings.ConversationVariablesEnablements)
  }
  isVariableEnabled(variable) {
    return typeof this._variableEnablements[variable.name] == 'boolean'
      ? this._variableEnablements[variable.name]
      : typeof variable.defaultEnablement == 'boolean'
      ? variable.defaultEnablement
      : !!this._variableEnablements['*']
  }
  getVariables() {
    let variables = []
    for (let resolver of ContextResolverRegistry.contextResolvers)
      resolver.variableInfo &&
        this.isVariableEnabled(resolver.variableInfo) &&
        variables.push({
          name: resolver.variableInfo.name,
          kind: resolver.kind,
          description: resolver.variableInfo.description,
          resolve: resolver.resolveContext.bind(resolver),
        })
    return variables
  }
  getVariable(variableName) {
    return this.getVariables().find(variable => variable.name === variableName)
  }
}

var VariableResolver = class extends BaseEmptyClass {
  constructor(accessor) {
    super()
    this.accessor = accessor
    this._chatVariableService = accessor.get(VariableManager)
  }
  async resolveVariablesInPrompt(prompt, variables) {
    let regex = /(^|\s)\[([^\]]+)\]\(values:([^\)]+)\)/gi,
      parts = []
    for (;;) {
      let match = regex.exec(prompt)
      if (!match) return { parts, message: prompt }
      let [fullMatch, whitespace, variableName, variableKey] = match,
        variableValues = variables[variableKey]
      if (!variableValues || variableValues.length === 0) continue
      let cleanedKey = variableKey.replace(/^#/, ''),
        shortenFunction,
        selectedValue = variableValues.find(value => value.level === 3) ?? variableValues[0]
      if (selectedValue.value instanceof VscodeUri) {
        let uri = selectedValue.value
        selectedValue.value = wrapCodeWithBackticks('', (await fs.promises.readFile(selectedValue.value.fsPath)).toString()),
        shortenFunction = async () => formatContext(cleanedKey) + wrapCodeWithBackticks('', await this.shortenUriVariableValue(uri))
      }
      if (selectedValue.kind === 'github.docset') prompt = prompt.slice(0, match.index) + whitespace + selectedValue.value + prompt.slice(match.index + fullMatch.length)
      else {
        let variable = this._chatVariableService.getVariable(variableKey)
        parts.push({ kind: variable?.kind ?? 'variable', userMessages: [formatContext(cleanedKey) + selectedValue.value], getShorterMessage: shortenFunction }),
        prompt = prompt.slice(0, match.index) + whitespace + `[${variableName}](#${cleanedKey}-context)` + prompt.slice(match.index + fullMatch.length)
      }
    }
  }
  async shortenUriVariableValue(uri) {
    let document = await vscode.workspace.openTextDocument(uri),
      text = document.getText(),
      functionBodies = await getSortedFunctionBodies(this.accessor, document, 1e3),
      delimiter = document.languageId === 'typescript' ? ';' : ''
    return insertIntoStringAtIndicesjke(text, functionBodies, delimiter)
  }
}

function formatContext(context) {
  return `# ${context.toUpperCase()} CONTEXT
`
}

function insertIntoStringAtIndices(source, indices, insertValue) {
  let currentIndex = 0,
    result = ''
  for (let index of indices)
    if (currentIndex < index.startIndex) {
      result += source.substring(currentIndex, index.startIndex)
      result += insertValue
      currentIndex = index.endIndex
    }
  return result
}
var vscode = handleDefaultExports(require('vscode'))
var FileSearcher = class extends FileFinder {
  findTextInFiles(query, options, progress, token) {
    return Promise.resolve(vscode.workspace.findTextInFiles(query, options, match => progress.report(match), token))
  }
  findFiles(include, exclude, maxResults, token) {
    return vscode.workspace.findFiles(include, exclude, maxResults, token)
  }
}
var vscode = handleDefaultExports(require('vscode'))
var TabManager = class extends BaseTabManager {
  constructor() {
    super()
    this._disposableStore = new DisposableStore()
    this._tabGroupsUsageInfo = new Map()
    this._tabUsageCounter = 0
    this.onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor
    this.onDidChangeTabs = vscode.window.tabGroups.onDidChangeTabs
    this._disposableStore.add(
      vscode.window.tabGroups.onDidChangeTabGroups(tabGroupChangeEvent => {
        tabGroupChangeEvent.closed.forEach(closedGroup => this._tabGroupsUsageInfo.delete(closedGroup)),
          this._tabGroupsUsageInfo.set(vscode.window.tabGroups.activeTabGroup, this._tabUsageCounter++)
      })
    )
  }
  dispose() {
    this._disposableStore.dispose()
  }
  get activeTextEditor() {
    let activeEditor = vscode.window.activeTextEditor
    if (activeEditor && activeEditor.document.uri.scheme !== 'output') return activeEditor
    let visibleEditorsMap = new ResourceMap()
    vscode.window.visibleTextEditors.forEach(editor => visibleEditorsMap.set(editor.document.uri, editor))
    let usageInfoArray = [...this._tabGroupsUsageInfo]
    usageInfoArray.sort((a, b) => b[1] - a[1])
    for (let [group] of usageInfoArray)
      if (group.activeTab) {
        let tabInfo = this._convertToTabInfo(group.activeTab)
        if (tabInfo.uri && visibleEditorsMap.has(tabInfo.uri)) return visibleEditorsMap.get(tabInfo.uri)
      }
  }
  get tabs() {
    return vscode.window.tabGroups.all.flatMap(group => group.tabs).map(this._convertToTabInfo, this)
  }
  _convertToTabInfo(tab) {
    let uri
    return (
      tab.input instanceof vscode.TabInputText || tab.input instanceof vscode.TabInputNotebook
        ? (uri = tab.input.uri)
        : (tab.input instanceof vscode.TabInputTextDiff || tab.input instanceof vscode.TabInputNotebookDiff) &&
          (uri = tab.input.modified),
      { tab: tab, uri: uri }
    )
  }
}

var TelemetryManager = class {
  sendInternalTelemetryEvent(eventName, properties, measurements) {}
  postEvent(eventName, properties) {}
  setSharedProperty(name, value) {}
  sendTelemetryErrorEvent(eventName, properties, measurements) {}
  sendTelemetryEvent(eventName, properties, measurements) {}
}

var telemetryModule = handleDefaultExports(Hme()),
os = handleDefaultExports(require('os'))
var TelemetryClient = class {
  constructor(context, namespace, config) {
    this.namespace = namespace
    ;(this.client = createTelemetryClient(context, config)), setupTelemetryClient(context, this.client)
  }
  separateData(data) {
    let properties = {},
      measurements = {}
    for (let [key, value] of Object.entries(data)) typeof value == 'number' ? (measurements[key] = value) : (properties[key] = value)
    return { properties: properties, measurements: measurements }
  }
  sendEventData(eventName, data) {
    let { properties, measurements } = this.separateData(data || {})
    this.client.trackEvent({ name: this.qualifyEventName(eventName), properties: properties, measurements: measurements })
  }
  sendErrorData(error, data) {
    let { properties, measurements } = this.separateData(data || {})
    this.client.trackException({ exception: error, properties: properties, measurements: measurements })
  }
  flush() {
    return new Promise(resolve => {
      this.client.flush({
        callback: () => {
          resolve(void 0)
        },
      })
    })
  }
  qualifyEventName(eventName) {
    return eventName.startsWith(this.namespace) ? eventName : `${this.namespace}/${eventName}`
  }
}
function createTelemetryClient(context, config) {
  let client = new telemetryModule.TelemetryClient(config)
  return (
    (client.config.enableAutoCollectRequests = !1),
    (client.config.enableAutoCollectPerformance = !1),
    (client.config.enableAutoCollectExceptions = !1),
    (client.config.enableAutoCollectConsole = !1),
    (client.config.enableAutoCollectDependencies = !1),
    (client.config.noDiagnosticChannel = !0),
    setupTelemetryClient(context, client),
    client
  )
}
function setupTelemetryClient(context, client) {
  client.commonProperties = setupCommonProperties(client.commonProperties, context)
  let buildInfo = context.get(BuildInfo)
  ;(client.context.tags[client.context.keys.sessionId] = buildInfo.sessionId),
    (client.context.tags[client.context.keys.userId] = buildInfo.machineId),
    (client.context.tags[client.context.keys.cloudRoleInstance] = 'REDACTED'),
    (client.config.endpointUrl = context.get(UrlProvider).getUrl())
}
function setupCommonProperties(properties, context) {
  ;(properties = properties || {}), (properties.common_os = os.platform()), (properties.common_platformversion = os.release())
  let buildInfo = context.get(BuildInfo)
  return (
    (properties.common_vscodemachineid = buildInfo.machineId),
    (properties.common_vscodesessionid = buildInfo.sessionId),
    (properties.common_uikind = 'desktop'),
    (properties.common_remotename = 'none'),
    (properties.common_isnewappinstall = ''),
    properties
  )
}
var telemetryId1 = '7d7048df-6dd0-4048-bb23-b716c1461f8f',
telemetryId2 = '3fdd7f28-937a-48c8-9a21-ba337db23bd1'
async function setupTelemetry(context, namespace, shouldActivate) {
  let telemetryService = context.get(IGHTelemetryService);
  if ((await telemetryService.deactivate(), !shouldActivate)) return;
  let telemetryClient1 = new TelemetryClient(context, namespace, telemetryId1),
    telemetryClient2 = new TelemetryClient(context, namespace, telemetryId2);
  return (
    telemetryService.setReporter(telemetryClient1),
    telemetryService.setSecureReporter(telemetryClient2),
    {
      dispose() {
        telemetryService.setReporter(void 0), telemetryService.setSecureReporter(void 0), telemetryClient1.flush(), telemetryClient2.flush();
      },
    }
  );
}
var path = require('path'),
process = require('process'),
vscode = require('vscode'),
terminalDataMap = new Map(),
terminalCommandMap = new Map()
function getTerminalData() {
  let terminal = vscode.window.activeTerminal;
  return terminal === void 0
    ? ''
    : terminalDataMap.get(terminal)?.join(`
`) || '';
}

function getLastTerminalCommand() {
  let terminal = vscode.window.activeTerminal;
  if (terminal !== void 0) return terminalCommandMap.get(terminal)?.at(-1);
}

function getTerminalSelection() {
  try {
    return vscode.window.activeTerminal?.selection ?? '';
  } catch {
    return '';
  }
}
var lastShellType

function getShellType() {
  let terminal = vscode.window.activeTerminal;
  if (terminal && 'shellPath' in terminal.creationOptions) {
    let shellPath = terminal.creationOptions.shellPath;
    if (shellPath) {
      let shellType,
        baseName = (0, path.basename)(shellPath);
      if (baseName === 'bash.exe') shellType = 'Git Bash';
      else {
        let nameWithoutExtension = baseName.replace(/\..+/, '');
        switch (nameWithoutExtension) {
          case 'pwsh':
          case 'powershell':
            shellType = 'powershell';
          case '':
            break;
          default:
            shellType = nameWithoutExtension;
        }
      }
      if (shellType) return (lastShellType = shellType), shellType;
    }
  }
  return lastShellType || (process.platform === 'win32' ? 'powershell' : 'bash');
}

function limitArraySize(array, item) {
  array.push(item), array.length > 40 && array.shift();
}

function removeEscapeSequences(text) {
  let escapeSequenceRegex = /(:?\x1b\[|\x9B)[=?>!]?[\d;:]*["$#'* ]?[a-zA-Z@^`{}|~]/g;
  return text && (text = text.replace(escapeSequenceRegex, '')), text;
}

function setupTerminalListeners() {
  return [
    vscode.window.onDidWriteTerminalData(event => {
      let terminalData = terminalDataMap.get(event.terminal);
      terminalData || ((terminalData = []), terminalDataMap.set(event.terminal, terminalData)), limitArraySize(terminalData, removeEscapeSequences(event.data));
    }),
    vscode.window.onDidExecuteTerminalCommand(event => {
      let terminalCommands = terminalCommandMap.get(event.terminal);
      terminalCommands || ((terminalCommands = []), terminalCommandMap.set(event.terminal, terminalCommands)), limitArraySize(terminalCommands, event);
    }),
    vscode.window.onDidCloseTerminal(terminal => {
      terminalDataMap.delete(terminal);
    }),
  ];
}

var TerminalInfoProvider = class extends BaseTerminalInfoProvider {
  constructor() {
    super();
    for (let listener of setupTerminalListeners()) {
      this._register(listener);
    }
  }
  get terminalBuffer() {
    return getTerminalData();
  }
  get terminalLastCommand() {
    return getLastTerminalCommand();
  }
  get terminalSelection() {
    return getTerminalSelection();
  }
  get terminalShellType() {
    return getShellType();
  }
}

var vscode = require('vscode')
var WorkspaceManager = class extends WorkspaceClass {
  constructor(r) {
    super()
    this.onDidOpenTextDocument = vscode.workspace.onDidOpenTextDocument
    this.onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument
    this.onDidCloseTextDocument = vscode.workspace.onDidCloseTextDocument
  }
  get textDocuments() {
    return vscode.workspace.textDocuments
  }
  async openTextDocument(r) {
    return await vscode.workspace.openTextDocument(r)
  }
  get notebookDocuments() {
    return vscode.workspace.notebookDocuments
  }
  getWorkspaceFolders() {
    return vscode.workspace.workspaceFolders?.map(r => r.uri) ?? []
  }
}
var vscode = handleDefaultExports(require('vscode'))
var ChatLogger = class Logger {
  constructor(accessor, outputChannelProvider) {
    this.accessor = accessor
    this.outputChannelProvider = outputChannelProvider
    this.requestCount = -1
    this.logger = accessor.get(LoggerManager).getPromptResponseLogger('chat')
  }
  logRequest(request) {
    this.requestCount++, this.logInfo('REQUEST', `User:${this.headerSeparator()}${this.printMessageContent(request.message)}`)
  }
  logMessages(messages) {
    this.logInfo(
      'PROMPT MESSAGES',
      messages.map(message => `${this.getDisplayRole(message.role)}:${this.headerSeparator()}${this.printMessageContent(message.content)}`)
        .join(`
`)
    )
  }
  logProgress(progress, isResponse) {
    let content = 'markdownContent' in progress ? progress.markdownContent.value : 'content' in progress ? progress.content : void 0
    content && (isResponse ? this.logInfo('RESPONSE', `Assistant:	${content}`) : this.logInfo('', `${this.bodySeparator()}${content}`, false))
  }
  logResponse(response) {
    this.logInfo('', ''), response.errorDetails && this.logInfo('ERROR DETAILS', JSON.stringify(response.errorDetails, void 0, 4))
  }
  logFollowups(followups) {
    this.logInfo(
      'FOLLOWUPS',
      'Followups:	' +
        followups.map(
          (followup, index) => `${followup.title}
${this.bodySeparator()}`
        ).join(`
${this.bodySeparator()}`)
    )
  }
  logThrownError(error) {
    this.logInfo('THROWN ERROR', error.stack ? error.stack : error.message)
  }
  logIntent(intent, isUser) {
    this.logInfo(
      'INTENT',
      intent !== void 0
        ? `User intent determined to be '${intent}' via the ${isUser ? 'user' : 'model'}`
        : 'Intent could not be determined'
    )
  }
  logInfo(title, content, isNewLine = true) {
    if (!this.accessor.get(ConfigManager).getConfig(settings.ConversationLoggingEnabled)) return
    let timestamp = new Date().toISOString()
    title &&
      ((content = `[${title} ${this.requestCount}]
${content}`),
      (content = `${timestamp} [info] ${content}`)),
      Logger.outputChannel === void 0 && (Logger.outputChannel = this.outputChannelProvider()),
      isNewLine
        ? (this.logger.info(
            content +
              `
`
          ),
          Logger.outputChannel.appendLine(
            content +
              `
`
          ))
        : (this.logger.info(content), Logger.outputChannel.append(content))
  }
  printMessageContent(message) {
    return message.split(`
`).join(`
${this.bodySeparator()}`)
  }
  headerSeparator() {
    return '		'
  }
  bodySeparator() {
    return '			'
  }
  getDisplayRole(role) {
    switch (role) {
      case 'system':
        return 'System'
      case 'user':
        return 'User'
      case 'assistant':
        return 'Assistant'
    }
  }
}
var requestLight = handleDefaultExports(requestLight())
var uGe = `
[EXAMPLES START]
Below you will find a set of examples of what you should respond with. Please follow these examples as closely as possible.

## Settings response
Question: How do I disable telemetry?

Response:
\`\`\`json
{
    "telemetry.telemetryLevel": "off"
}
\`\`\`
is a setting which can be used to disable telemetry.

## Command response
Question: How do I close all editors?

Response:
You can use the **Close All Editors** command to close all editors.

[COMMANDS START]
\`\`\`json
[
    { "command": "workbench.action.closeAllEditors" }
]
\`\`\`
[COMMANDS END]

## No such command
Question: How do I move the terminal to a new window?

Response:
There is no such command.

## Invalid Question
Question: How do I bake a potato?

Response:
Sorry this question isn't related to VS Code.

## Marketplace search
Question: How do I add PHP support?

Response:
You can use the **Search marketplace** command to search for extensions that add PHP support.

[COMMANDS START]
\`\`\`json
[
    { "command": "workbench.extensions.search", "args": "php" }
]
\`\`\`
[COMMANDS END]
`,
  rq = 'vscode'
  IntentManager.registerIntent(
  new Intent({
    location: 2,
    id: rq,
    description: 'Ask questions about VS Code',
    modelDescription:
      'Looks up information about VS Code via commands, settings, and documentation to accomplish the given editor-specific task.',
    modelSampleQuestion: 'What is the command to open the integrated terminal?',
    systemPromptOptions: {
      examples: uGe,
      roleplay:
        'You are a VS Code assistant. Your job is to assist users in using VS Code by providing knowledge to accomplish their task. This knowledge should focus on settings and commands, but also includes documentation. Please do not guess a response and instead just respond with a polite apology if you are unsure.',
    },
    commandInfo: { allowsEmptyArgs: !1, sampleRequest: requestLight.t('What is the command to open the integrated terminal?') },
    rules: `
You must respond with either a setting to set or a command to execute when applicable.
When referring to a command, you must use the command name in markdown bold syntax.
When referring to any commands, you must include a section wrapped with [COMMANDS START] and [COMMANDS END] at the end of your response which lists all commands you referenced in your response in the order they were referenced in a JSON code block containing a JSON array.
If a command or setting references another command or setting, you must respond with the original setting or command and the referenced setting or command.
All referenced settings must be properly formatted in a JSON markdown code block to allow copying them into the user's settings.json file.
You must not respond with a setting that is not in a properly formatted JSON markdown code block.
If a setting and command will accomplish the same thing, you must suggest the command instead.
You must not suggest opening the settings editor.
You must not suggest pressing any keybindings or keyboard shortcuts to execute commands.
You must not suggest opening the command palette to execute commands.
You must not suggest commands or settings identifiers that do not exist.
If you believe the context given to you is incorrect or not relevant you may ignore it.
If an extension might help the user, you may suggest a search query for the extension marketplace. You must also include the command **Search marketplace** (\`workbench.extensions.search\`) with args set to the suggested query in the commands section at the end of your response. The query can also contain the tags "@popular", "@recommended", or "@featured" to filter the results.`.trim(),
    contextResolvers: [vSCodeContextResolver],
    followUps: loadAndProcessIndexes,
  })
)
var requestLight = handleDefaultExports(requestLight())
var path = require('path')
var openRelativePathCommand = '_github.copilot.openRelativePath',
  openSymbolInFileCommand = '_github.copilot.openSymbolInFile'

function createRelativePathLink(text, path) {
  return `[\`${text}\`](${createCommandLink(openRelativePathCommand, [path.replace(/\\/g, '/')])} "${escapeQuotes(path)}")`
}

function createSymbolInFileLink(symbol, path) {
  return `[\`${symbol}\`](${createCommandLink(openSymbolInFileCommand, [path.replace(/\\/g, '/'), symbol])} "${escapeQuotes(path)}")`
}

function createCommandLink(command, args) {
  return `command:${command}?${encodeURIComponent(JSON.stringify(args))}`
}

function escapeQuotes(text) {
  return text.replace(/"/g, '\\"')
}

var linkifiersSet = new Set()

function addLinkifier(linkifier) {
  linkifiersSet.add(linkifier)
  return { dispose: () => linkifiersSet.delete(linkifier) }
}
var TextLinkifier = class {
  constructor(references, workspaceFolders, fileSystem) {
    this.references = references
    this.workspaceFolders = workspaceFolders
    this.fileSystem = fileSystem
    this.additionalLinkifiers = Array.from(linkifiersSet, linkifier => linkifier(references, workspaceFolders, fileSystem))
  }
  async linkify(text, cancellationToken) {
    if (
      ((text = await replaceAllWithPromise(text, /\[`([^`\[\]]+?)`]\((\S+?\.\w+)\)/g, async (match, symbol, path) => {
        let uri = Uri.joinPath(this.workspaceFolders[0], path)
        return (await fileExists(this.fileSystem, uri)) ? createSymbolInFileLink(symbol, path) : '`' + symbol + '`'
      })),
      cancellationToken?.isCancellationRequested)
    )
      return ''
    let linkifyPath = async (match, linkText, path) => {
      if (/^\w+:/.test(path) || !this.workspaceFolders.length) return match
      let uri = Uri.joinPath(this.workspaceFolders[0], path)
      if (await fileExists(this.fileSystem, uri)) return createRelativePathLink(path, path)
      let basename = getBasename(uri),
        referenceUri = this.references.map(ref => (Uri.isUri(ref.anchor) ? ref.anchor : ref.anchor.uri)).find(uri => getBasename(uri) === basename)
      if (referenceUri) {
        let relativePath = (0, path.relative)(this.workspaceFolders[0].fsPath, referenceUri.fsPath)
        return createRelativePathLink(path, relativePath)
      }
      return linkText
    }
    if (((text = await replaceAllWithPromise(text, /\[([^`\s]+)\]\((\1)\)/g, linkifyPath)), cancellationToken?.isCancellationRequested)) return ''
    text = await replaceAllWithPromise(text, /(?<!\[)(`([^`\s]+)`)(?!\])/g, linkifyPath)
    for (let linkifier of this.additionalLinkifiers) if (((text = await linkifier.linkify(text, cancellationToken)), cancellationToken?.isCancellationRequested)) return ''
    return (text = text.replace(/\[([^\[\]]+)]\((\S+?\.\w+)\)/g, (match, linkText, path) => (/^\w+:/.test(path) ? match : linkText))), text
  }
}
async function fileExists(fileSystem, file) {
  try {
    await fileSystem.stat(file)
    return true
  } catch {
    return false
  }
}
var stepByStepGuide = `
Think step by step:

1. Read the provided relevant workspace information (code excerpts, file names, and symbols) to understand the user's workspace.

2. Consider how to answer the user's prompt based on the provided information and your specialized coding knowledge. Always assume that the user is asking about the code in their workspace instead of asking a general programming question. Prefer using variables, functions, types, and classes from the workspace over those from the standard library.

3. Generate a response that clearly and accurately answers the user's question. In your response, add fully qualified links for referenced symbols (example: [\`namespace.VariableName\`](path/to/file.ts)) and links for files (example: [path/to/file](path/to/file.ts)) so that the user can open them. If you do not have enough information to answer the question, respond with "I'm sorry, I can't answer that question with what I currently know about your workspace".

Remember that you MUST add links for all referenced symbols from the workspace and fully qualify the symbol name in the link, for example: [\`namespace.functionName\`](path/to/util.ts).
Remember that you MUST add links for all workspace files, for example: [path/to/file.js](path/to/file.js)
`.trim(),
var exampleDialogue = `
Question:
What file implements base64 encoding?

Response:
Base64 encoding is implemented in [src/base64.ts](src/base64.ts) as [\`encode\`](src/base64.ts) function.


Question:
How can I join strings with newlines?

Response:
You can use the [\`joinLines\`](src/utils/string.ts) function from [src/utils/string.ts](src/utils/string.ts) to join multiple strings with newlines.


Question:
How do I build this project?

Response:
To build this TypeScript project, run the \`build\` script in the [package.json](package.json) file:

\`\`\`sh
npm run build
\`\`\`


Question:
How do I read a file?

Response:
To read a file, you can use a [\`FileReader\`](src/fs/fileReader.ts) class from [src/fs/fileReader.ts](src/fs/fileReader.ts).
`.trim(),
var exampleDialogue = 'workspace',
var workspaceIntent = new Intent({
    location: 2,
    id: exampleDialogue,
    description: requestLight.t('Ask a question about the files in your current workspace'),
    modelSampleQuestion: 'How do I build this project?',
    commandInfo: { allowsEmptyArgs: !1, defaultEnablement: !0, sampleRequest: requestLight.t('How do I build this project?') },
    systemPromptOptions: {
      roleplay:
        'You are a software engineer with expert knowledge of the codebase the user has open in their workspace.',
      examples: exampleDialogue,
    },
    rules: stepByStepGuide,
    contextResolvers: [contextResolverRegistry, currentSelectionContextResolver, workspaceResolver],
    responseProcessor: (t, e, r, n, i) => new TextProcessor2(t, e, r, i),
  })
IntentManager.registerIntent(workspaceIntent)
var TextProcessor2 = class {
  constructor(context, references, reporter, cancellationToken, textApplier) {
    this._appliedText = ''
    this._isInCodeBlock = false
    this._promise = Promise.resolve('')
    let fileSystemOperations = context.get(BaseFileSystemOperations),
      workspace = context.get(WorkspaceClass)
    ;(this._appliesTextPromise = new PromiseOutcome()), cancellationToken.onCancellationRequested(() => this._appliesTextPromise.cancel())
    let textLinkifier = new TextLinkifier(references, workspace.getWorkspaceFolders(), fileSystemOperations)
    this._deltaCallback = new TextApplier(text => {
      this._promise = this._promise.then(async () => {
        text.startsWith('```') && (this._isInCodeBlock = !this._isInCodeBlock),
          this._isInCodeBlock || (text = await textLinkifier.linkify(text, cancellationToken))
        let markdownString = new VscodeMarkdownString(text)
        return (
          (markdownString.isTrusted = { enabledCommands: [
            openRelativePathCommand, openSymbolInFileCommand] }),
          (this._appliedText += text),
          reporter.report({ markdownContent: markdownString }),
          this._appliedText
        )
      })
    })
  }
  get appliedText() {
    return this._appliesTextPromise.p
  }
  apply(text) {
    this._deltaCallback.apply(text)
  }
  finish() {
    this._promise.then(
      text => this._appliesTextPromise.complete(text),
      error => this._appliesTextPromise.error(error)
    )
  }
}
var requestLight = handleDefaultExports(requestLight()),
crypto = require('crypto')
class FollowUpGenerator {
  constructor(accessor, messageConverter, options) {
    this.accessor = accessor;
    this.messageConverter = messageConverter;
    this.options = options;
    this.logger = accessor.get(LoggerManager).getLogger('ConversationFollowUp');
  }

  async followUp(chatSession, user, options) {
    let copiedChatSession = chatSession.copy();
    copiedChatSession.addTurn(
      new Session({
        type: 'meta',
        message:
          `Write a short one-sentence question that the user can ask that naturally follows from the previous few questions and answers. It should not ask a question which is already answered in the conversation. It should be a question that you are capable of answering. Reply with only the text of the question and nothing else.
                    ${getLocaleResponse(this.accessor)}`.trim(),
      })
    );

    let fetchOptions = options ? { ...options } : {};
    fetchOptions.messageSource = 'chat.followup';

    let tokenLimit = await getDefaultChatEndpointInfo(this.accessor),
      assistantMessage = await generateAssistantMessage(this.accessor, 2, tokenLimit),
      { messages: chatMessages } = await this.messageConverter.toChatMessages(copiedChatSession, assistantMessage, tokenLimit),
      fetchResult = await this.accessor
        .get(DataRetriever)
        .fetchOne(chatMessages, undefined, user, 2, tokenLimit, { temperature: this.options.temperature, top_p: this.options.topP }, fetchOptions);

    if (fetchResult.type === 'success') {
      let followUpQuestions = [];
      if (fetchResult.value) followUpQuestions.push(fetchResult.value.trim());
      return followUpQuestions;
    } else {
      this.logger.error(`Failed to fetch followups because of response type (${fetchResult.type}) and reason (${fetchResult.reason})`, fetchResult);
      return [];
    }
  }
}
var editorInfo;

((namespace) => {
  function extractEditorInfo(editor, config, range) {
    let { options, document, selection, visibleRanges } = config,
      fileIndentInfo = { insertSpaces: options.insertSpaces, tabSize: options.tabSize },
      language = getCommentSymbol(document);

    range = range || (visibleRanges.length === 1 ? visibleRanges[0] : visibleRanges.length > 1 ? visibleRanges[0].union(visibleRanges[visibleRanges.length - 1]) : selection);

    return { document, fileIndentInfo, language, selection, wholeRange: range };
  }

  namespace.fromEditor = extractEditorInfo;
})((editorInfo ||= {}));

var TextProcessor1 = class {
  constructor(stopStartMappings, progress, processNonReportedDelta) {
    this.stopStartMappings = stopStartMappings;
    this.progress = progress;
    this.processNonReportedDelta = processNonReportedDelta;
    this.stagedDeltasToApply = [];
    this.currentStartStop = undefined;
    this._appliedText = '';
    this.nonReportedDeltas = [];
  }

  get appliedText() {
    return Promise.resolve(this._appliedText);
  }

  apply(input, delta) {
    return this.applyDelta(delta);
  }

  applyDeltaToProgress(delta) {
    let annotations = delta.annotations?.map(annotation => ({ title: annotation.details.type, description: annotation.details.description }));
    (delta.text || annotations?.length) && this.progress.report({ content: delta.text, vulnerabilities: annotations?.length ? annotations : undefined });
  }

  updateStagedDeltasUpToIndex(index, length) {
    let updatedDeltas = [];
    for (let i = 0; i < index + length; ) {
      let delta = this.stagedDeltasToApply.shift();
      if (delta) {
        if (i + delta.text.length <= index) updatedDeltas.push(delta);
        else if (i < index || i < index + length) {
          if (i < index) {
            let newDelta = { ...delta };
            newDelta.text = delta.text.substring(0, index - i);
            updatedDeltas.push(newDelta);
          }
          let remainingDelta = { ...delta };
          remainingDelta.text = delta.text.substring(index - i + length);
          remainingDelta.text && this.stagedDeltasToApply.unshift(remainingDelta);
        }
        i += delta.text.length;
      } else break;
    }
    return updatedDeltas;
  }

  checkForKeyWords(keywords, delta, callback = this.applyDeltaToProgress.bind(this)) {
    let text = this.stagedDeltasToApply.map(delta => delta.text).join('') + delta.text;
    for (let keyword of keywords) {
      let index = text.indexOf(keyword);
      if (index === -1) continue;
      this.stagedDeltasToApply.push(delta);
      this.updateStagedDeltasUpToIndex(index, keyword.length).forEach(delta => callback(delta));
      return keyword;
    }
    for (let keyword of keywords)
      for (let i = keyword.length - 1; i > 0; i--) {
        let substring = keyword.substring(0, i);
        if (text.endsWith(substring)) {
          this.stagedDeltasToApply = [...this.stagedDeltasToApply, delta];
          return;
        }
      }
    [...this.stagedDeltasToApply, delta].forEach(delta => {
      callback(delta);
    });
    this.stagedDeltasToApply = [];
  }

  postReportRecordProgress(delta) {
    this.nonReportedDeltas.push(delta);
  }

  applyDelta(delta) {
    this._appliedText += delta.text;
    if (this.currentStartStop === undefined) {
      let stopKeyword = this.checkForKeyWords(
        this.stopStartMappings.map(mapping => mapping.stop),
        delta
      );
      if (stopKeyword) this.currentStartStop = this.stopStartMappings.find(mapping => mapping.stop === stopKeyword);
      return;
    } else {
      if (!this.currentStartStop.start) return;
      if (this.checkForKeyWords([this.currentStartStop.start], delta, this.postReportRecordProgress.bind(this))) {
        if (this.processNonReportedDelta) {
          this.processNonReportedDelta(this.nonReportedDeltas).forEach(text => this.applyDeltaToProgress({ text }));
        }
        this.currentStartStop = undefined;
        if (this.stagedDeltasToApply.length > 0) this.applyDelta({ text: '' });
      }
    }
  }
}
var CopilotConversationManager = class {
  constructor(etelemetryService, options, username, conversationLogger, isInternal, sessionId) {
    this.options = options
    this.username = username
    this.conversationLogger = conversationLogger
    this.isInternal = isInternal
    this.sessionId = sessionId
    this.inputPlaceholder = requestLight.t('Ask Copilot or type / for commands')
    ;(this._microsoftTelemetryService = telemetryService.get(IMSTelemetryService)),
      (this.accessor = telemetryService),
      (this.conversation = new Conversation()),
      (this.intentDetector = new IntentDetector(telemetryService, 2)),
      (this.conversation = this.intializeConversation()),
      (this.messageConverter = new ChatMessageProcessor(this.accessor, this.options.maxResponseTokens)),
      (this.conversationFollowUp = new FollowUpGenerator(this.accessor, this.messageConverter, this.options))
  }
  get responder() {
    return { name: 'GitHub Copilot' }
  }
  get requester() {
    return {
      name: this.username ?? requestLight.t('You'),
      icon: this.username ? Uri.parse(`https://avatars.githubusercontent.com/${this.username}`) : undefined,
    }
  }
  addHistory(historyItems) {
    historyItems.forEach((item, index) => {
      let nextItem = historyItems[index + 1];
      let response = nextItem && nextItem.role === 2 ? { message: nextItem.content, type: 'model' } : undefined;
      let session = new Session({ message: item.content, type: item.role === 1 ? 'user' : 'model' });
      if (response) {
        session.response = response;
        index++; // Skip the next item as it's already processed
      }
      this.conversation.addTurn(session);
    });
  }
  intializeConversation() {
    return new Conversation()
  }
  async provideResponseWithProgress(prompt, progress, cancellationToken, options) {
    this.refreshFollowupsCancellationToken();
    try {
      let isFirstReport = true,
        progressReporter = {
          report: report => {
            if (!('responseId' in report)) {
              this.conversationLogger?.logProgress(report, isFirstReport);
              isFirstReport = false;
            }
            progress.report(report);
          },
        },
        newTurn = this.createTurn(prompt),
        telemetryEvent = generateTelemetryEvent();
      telemetryEvent.markAsDisplayed();
      let response = await this._provideResponseWithProgress(newTurn, prompt, progressReporter, cancellationToken, telemetryEvent, options);
      this.conversationLogger?.logResponse(response);
      this._microsoftTelemetryService.sendInternalTelemetryEvent(
        'interactiveSessionResponse',
        {
          chatLocation: 'panel',
          intent: newTurn.intentInvocation?.intent.id ?? '',
          request: prompt.prompt,
          response: newTurn.response?.message ?? '',
          sessionId: this.sessionId,
        },
        { turnNumber: this.conversation.turns.length }
      );
      return { ...response, responseId: newTurn.requestId, session: this };
    } catch (error) {
      this.conversationLogger?.logThrownError(error);
      throw error;
    }
  }

  createTurn(prompt) {
    let message = { message: prompt.prompt, type: 'user' },
      newSession = new Session(message, this.sessionId);
    this.conversation.addTurn(newSession);
    return newSession;
  }
  async _provideResponseWithProgress(e, r, n, i, o, s) {
    if (i.isCancellationRequested) return (e.status = 'cancelled'), { errorDetails: { message: requestLight.t('Cancelled') } }
    try {
      let a = this.accessor.get(BaseTabManager).activeTextEditor,
        l = e.request.message
      this.conversationLogger?.logRequest(e.request)
      let c = { command: s.intentId ? CommandManager.getCommand(s.intentId, 2) : void 0, restOfQuery: l }
      if (c.command?.intent && !(c.command.intent.commandInfo?.allowsEmptyArgs ?? !0) && !c.restOfQuery) {
        let y = getCommandCategory(c.command.intent.id),
          b = ''
        return (
          y && ((b = `@${y.agent} `), y.command && (b += ` /${y.command}`), (b += ` ${c.command.details}`)),
          (e.response = {
            message: requestLight.t(
              `Please specify a question when using this command.

Usage: {0}`,
              b
            ),
            type: 'meta',
          }),
          (e.status = 'error'),
          { errorDetails: { message: e.response.message, responseIsFiltered: !1, responseIsIncomplete: !1 } }
        )
      }
      let u = c?.command?.intent,
        p
      u &&
        ((e.request = { message: c.restOfQuery || u.intentDetectionInput.sampleQuestion, type: 'user' }),
        this.conversationLogger?.logIntent(u.id, !0)),
        !u && this.accessor.get(ConfigManager).getConfig(settings.ConversationIntentDetection)
          ? ((u = p = await this.intentDetector.detectIntent(void 0, l, i, o, void 0)),
            this.conversationLogger?.logIntent(u?.id, !1))
          : this.isInternal &&
            (p =
              u || this.conversation.turns.length !== 1
                ? void 0
                : await this.intentDetector.detectIntent(void 0, l, i, o, void 0)),
        (u ??= UnknownIntent.Instance)
      let d = a ? editorInfo.fromEditor(this.accessor, a) : void 0,
        f = await u.invoke(this.accessor, { location: 2, documentContext: d }, void 0)
      e.intentInvocation = f
      let m = f.endpoint,
        { messages: h, tokenCount: g } = await f.promptCrafter.buildPrompt(this.conversation, m, r.variables, n, o, i),
        v = this.conversation.getLatestTurn()?.contextParts.map(y => y.kind) ?? []
      if (
        (this._microsoftTelemetryService.sendInternalTelemetryEvent(
          'interactiveSessionMessage',
          { intent: u?.id ?? 'none', detectedIntent: p?.id ?? 'none', contextTypes: v.join(','), query: c.restOfQuery },
          {}
        ),
        (e.chatMessages = h),
        this.conversationLogger?.logMessages(h),
        (o = extendTelemetryEventWithUserInput(this.conversation, this.sessionId, 'conversationPanel', l, g, u?.id, o)),
        i.isCancellationRequested)
      )
        return (e.status = 'cancelled'), { errorDetails: { message: requestLight.t('Cancelled') } }
      let _ = f?.responseProcessor
        ? f.responseProcessor(this.accessor, e, n, h, i)
        : new TextProcessor1([{ stop: '[COMMANDS START]' }], n)
      return await this.fetchConversationResponse(e, m, l, h, i, n, _, o, {
        messageId: o.properties.messageId,
        messageSource: 'chat.user',
      })
    } catch (a) {
      this.accessor.get(LoggerManager).defaultLogger.exception(a),
        this.accessor.get(IGHTelemetryService).sendExceptionTelemetry(a, 'Error'),
        this.conversationLogger?.logThrownError(a)
      let l = a.message
      return (
        (e.status = 'error'),
        (e.response = { message: l, type: 'meta' }),
        { errorDetails: { message: l, responseIsIncomplete: !0 } }
      )
    }
  }
  async fetchConversationResponse(e, r, n, i, o, s, a, l, c) {
    let u = generateTelemetryEvent()
    e.requestId = u.properties.messageId
    let p = Date.now(),
      d = 0,
      f = new Set(),
      m = await this.accessor.get(DataRetriever).fetchOne(
        i,
        async (x, P, U) => {
          d === 0 && (d = Date.now()),
            U.annotations &&
              (!((x.match(/(^|\n)```/g)?.length ?? 0) % 2 === 1) || x.match(/(^|\n)```\w*\s*$/)) &&
              (U.annotations = void 0),
            U.annotations &&
              ((U.annotations = U.annotations.filter(H => !f.has(H.details.type))),
              U.annotations.forEach(H => f.add(H.details.type))),
            a.apply(x, U)
        },
        o,
        2,
        r,
        { temperature: this.options.temperature, top_p: this.options.topP },
        c,
        { intent: !0 }
      )
    a.finish?.()
    let h = await a.appliedText,
      g = h ? extractCodeBlocks(h) : [],
      v = l.raw.displayedTime ?? p,
      _ = ['programming-related tasks', 'programming related questions', 'related to programming'],
      y = 0
    m.type === 'success' &&
      !h.trim().includes(`
`) &&
      _.some(x => h.toLowerCase().includes(x)) &&
      (y = 1)
    let b = this.accessor.get(Tokenizer)
    switch (
      (this._microsoftTelemetryService.sendTelemetryEvent(
        'panel.request',
        {
          command: e.intentInvocation?.intent.id ?? 'none',
          contextTypes: e.contextParts.map(x => x.kind).join(',') ?? 'none',
          promptTypes: i.map(x => `${x.role}${x.name ? `-${x.name}` : ''}:${x.content.length}`).join(','),
          conversationId: this.sessionId,
          requestId: e.requestId,
          responseId: m.requestId,
          responseType: m.type,
          codeBlocks: g.join(','),
          model: r.model,
        },
        {
          turn: this.conversation.turns.length,
          textBlocks: g.length ? -1 : h.split(/\n{2,}/).length ?? 0,
          maybeOffTopic: y,
          messageTokenCount: b.tokenLength(e.request.message),
          promptTokenCount: calculateTokenLength(this.accessor, i),
          userPromptCount: i.filter(x => x.role === 'user').length,
          responseTokenCount: b.tokenLength(h) ?? 0,
          timeToRequest: p - v,
          timeToFirstToken: d ? d - v : -1,
          timeToComplete: Date.now() - v,
        }
      ),
      extendTelemetryEventWithOffTopicFlag(
        this.accessor,
        'conversationPanel',
        n,
        m.type === 'offTopic',
        this.accessor.get(BaseTabManager).activeTextEditor?.document,
        l
      ),
      m.type)
    ) {
      case 'success':
        return await this.processSuccessfulFetchResult(r, e, a, m.requestId, u)
      case 'offTopic':
        return this.processOffTopicFetchResult(s, e, n, l)
      case 'canceled':
        return (
          (e.status = 'cancelled'), (e.response = { message: 'Cancelled', type: 'user' }), { errorDetails: e.response }
        )
      case 'rateLimited':
        return (
          (e.status = 'error'),
          {
            errorDetails: {
              message: requestLight.t('Sorry, your request was rate-limited. Please wait and try sending again later.'),
              responseIsFiltered: !0,
            },
          }
        )
      case 'badRequest':
      case 'failed':
        return (e.status = 'error'), (e.response = { message: m.reason, type: 'server' }), { errorDetails: e.response }
      case 'filtered':
        return (
          (e.status = 'filtered'),
          {
            errorDetails: {
              message: requestLight.t({
                message:
                  'Sorry, the response matched public code so it was blocked. Please rephrase your prompt. [Learn more](https://aka.ms/copilot-chat-filtered-docs).',
                comment: ["{Locked='](https://aka.ms/copilot-chat-filtered-docs)'}"],
              }),
              responseIsFiltered: !0,
            },
          }
        )
      case 'length':
        return (
          (e.status = 'error'),
          { errorDetails: { message: requestLight.t('Sorry, the response hit the length limit. Please rephrase your prompt.') } }
        )
      case 'unknown':
        return (
          (e.status = 'error'),
          { errorDetails: { message: requestLight.t('Sorry, no response was returned.'), responseIsFiltered: !1 } }
        )
    }
  }
  async processSuccessfulFetchResult(e, r, n, i, o) {
    let s = await n.appliedText
    return s.length > 0
      ? ((r.status = 'success'),
        (r.response = { message: s, type: 'model' }),
        o.markAsDisplayed(),
        extendTelemetryEventWithModelOutput(
          this.accessor,
          this.conversation,
          this.sessionId,
          'conversationPanel',
          s,
          i,
          this.accessor.get(BaseTabManager).activeTextEditor?.document,
          o
        ),
        { followupsPromise: this.computeFollowups(!0, { messageId: o.properties.messageId }) })
      : ((r.status = 'error'),
        (r.response = {
          message: requestLight.t(
            'The model unexpectedly did not return a response, which may indicate a service issue. Please report a bug.'
          ),
          type: 'meta',
        }),
        { errorDetails: r.response })
  }
  processOffTopicFetchResult(e, r, n, i) {
    let o = generateTelemetryEvent()
    return (
      e.report({ content: this.options.rejectionMessage }),
      (r.response = { message: this.options.rejectionMessage, type: 'offtopic-detection' }),
      (r.status = 'off-topic'),
      o.markAsDisplayed(),
      extendTelemetryEventWithOffTopicMessage(
        this.accessor,
        this.conversation,
        this.sessionId,
        'conversationPanel',
        n,
        i.properties.messageId,
        this.accessor.get(BaseTabManager).activeTextEditor?.document,
        o
      ),
      { followupsPromise: this.computeFollowups(!1) }
    )
  }
  getLatestTurn() {
    return this.conversation.getLatestTurn()
  }
  removeRequest(e) {
    let r = this.conversation.removeTurn(e)
    this._microsoftTelemetryService.sendTelemetryEvent('panel.action.remove', {
      command: r?.intentInvocation?.intent.id,
      contextTypes: r?.contextParts.map(n => n.kind).join(',') ?? 'none',
      responseType: r?.response?.type,
      conversationId: this.sessionId,
      requestId: e,
    })
  }
  refreshFollowupsCancellationToken() {
    this.lastResponseFollowupsCancellation?.cancel(),
      this.lastResponseFollowupsCancellation?.dispose(),
      (this.lastResponseFollowupsCancellation = new VscodeCancellationTokenSource())
  }
  async computeFollowups(e = !0, r) {
    let n = this.lastResponseFollowupsCancellation.token,
      o = (e ? await this.conversationFollowUp.followUp(this.conversation, n, r) : []).map(c =>
        generateSuggestion(c, this.accessor, r)
      )
    n.isCancellationRequested || this.conversationLogger?.logFollowups(o)
    let s = this.conversation.getLatestTurn(),
      a = [],
      l = s?.intentInvocation
    return l?.followUps && (a = await l.followUps(this.accessor, s)), o.concat(a)
  }
}
function generateSuggestion(message, context, metadata = {}) {
  metadata.suggestionId = (0, crypto.randomUUID)();
  metadata.suggestionType = 'Follow-up from model';
  displaySuggestion(context, metadata.suggestionType, metadata.messageId, metadata.suggestionId, context.get(BaseTabManager).activeTextEditor?.document);
  return { message, title: message, metadata };
}
var vscode = handleDefaultExports(require('vscode'))
function generateSuggestion(message, context, metadata = {}) {
  metadata.suggestionId = (0, crypto.randomUUID)();
  metadata.suggestionType = 'Follow-up from model';
  displaySuggestion(context, metadata.suggestionType, metadata.messageId, metadata.suggestionId, context.get(BaseTabManager).activeTextEditor?.document);
  return { message, title: message, metadata };
}

var vscode = handleDefaultExports(require('vscode'));

function handleAction(service, actionResult) {
  let activeDocument = vscode.window.activeTextEditor?.document,
    activeSelection = vscode.window.activeTextEditor?.selection,
    result = actionResult.result,
    telemetryService = service.get(IMSTelemetryService);

  switch (actionResult.action.kind) {
    case 'copy':
      telemetryService.sendTelemetryEvent(
        'panel.action.copy',
        { languageId: activeDocument?.languageId, requestId: result.responseId },
        {
          codeBlockIndex: actionResult.action.codeBlockIndex,
          copyType: actionResult.action.copyKind,
          characterCount: actionResult.action.copiedCharacters,
          lineCount: actionResult.action.copiedText.split('\n').length,
        }
      );
      break;
    case 'insert':
      telemetryService.sendTelemetryEvent(
        'panel.action.insert',
        { languageId: activeDocument?.languageId, requestId: result.responseId },
        { codeBlockIndex: actionResult.action.codeBlockIndex, characterCount: actionResult.action.totalCharacters }
      );
      break;
    case 'runInTerminal':
      telemetryService.sendTelemetryEvent(
        'panel.action.runinterminal',
        { languageId: activeDocument?.languageId, requestId: result.responseId, blockLanguage: actionResult.action.languageId },
        { codeBlockIndex: actionResult.action.codeBlockIndex }
      );
      break;
    case 'followUp':
      break;
    case 'bug':
      service.get(Reporter)?.reportChat(result.session);
      break;
  }

  if (actionResult.action.kind === 'copy' || actionResult.action.kind === 'insert') {
    let telemetryData = { totalCharacters: actionResult.action.totalCharacters };
    if (actionResult.action.kind === 'copy') {
      telemetryData = { ...telemetryData, copiedCharacters: actionResult.action.copiedCharacters };
    }
    if (activeDocument && activeSelection) {
      telemetryData = { ...telemetryData, cursorLocation: activeDocument.offsetAt(activeSelection.active) };
    }
    sendSuggestionTelemetry(
      service,
      vscode.window.activeTextEditor?.document,
      { codeBlockIndex: actionResult.action.codeBlockIndex.toString(), messageId: result.responseId },
      telemetryData,
      actionResult.action.kind === 'copy' ? 'conversation.acceptedCopy' : 'conversation.acceptedInsert'
    );
  }
}
function handleVote(service, feedback) {
  let activeDocument = vscode.window.activeTextEditor?.document,
    result = feedback.result;
  service
    .get(IMSTelemetryService)
    .sendTelemetryEvent(
      'panel.action.vote',
      { languageId: activeDocument?.languageId, requestId: result.responseId },
      { direction: feedback.kind === vscode.ChatAgentResultFeedbackKind.Helpful ? 1 : 2 }
    );
  sendSuggestionTelemetry(
    service,
    activeDocument,
    { rating: feedback.kind === vscode.ChatAgentResultFeedbackKind.Helpful ? 'positive' : 'negative', messageId: result.responseId },
    {},
    'conversation.messageRating'
  );
}
var ExtensionProvider = class {
  constructor(accessor) {
    this.accessor = accessor
  }
  async register(options) {
    return new ChatAgentRegistrar(this.accessor, options).register()
  }
},
ChatAgentRegistrar = class {
    constructor(e, r) {
      this.accessor = e
      this.options = r
      this._logger = new ChatLogger(this.accessor, () =>
      vscode.window.createOutputChannel('GitHub Copilot Chat Conversation', 'log')
      )
    }
    async register() {
      ;(this._isInternal = (await this.accessor.get(BaseTokenHandler).getCopilotToken(this.accessor))?.isInternal),
        this.accessor
          .get(extensionContext)
          .subscriptions.push(
            this.registerWorkspaceAgent(),
            this.registerVSCodeAgent(),
            this.registerTerminalAgent(),
            this.registerDefaultAgent()
          )
    }
    createAgent(e, r) {
      let n = vscode.chat.createChatAgent(e, this.getChatAgentHandler(r))
      return (
        n.onDidPerformAction(i => handleAction(this.accessor, i)),
        n.onDidReceiveFeedback(i => handleVote(this.accessor, i)),
        (n.supportIssueReporting = this.accessor.get(ConfigManager).getConfig(settings.DebugReportFeedback)),
        n
      )
    }
    registerWorkspaceAgent() {
      let e = this.createAgent(workspace, exampleDialogue)
      return (
        (e.fullName = 'Workspace'),
        (e.description = 'Ask about your workspace'),
        (e.followupProvider = { provideFollowups: (r, n) => ('followupsPromise' in r ? r.followupsPromise : []) }),
        (e.iconPath = new vscode.ThemeIcon('code')),
        (e.slashCommandProvider = { provideSlashCommands: r => this.getSlashCommands(commandCategories.workspace) }),
        (e.isSecondary = !0),
        (e.sampleRequest = CommandManager.getCommand('workspace', 2)?.intent?.commandInfo?.sampleRequest),
        e
      )
    }
    registerVSCodeAgent() {
      let e = this.createAgent(vscode, rq)
      ;(e.fullName = 'VS Code'),
        (e.description = 'Ask about VS Code'),
        (e.followupProvider = { provideFollowups: (n, i) => ('followupsPromise' in n ? n.followupsPromise : []) }),
        (e.slashCommandProvider = { provideSlashCommands: n => this.getSlashCommands(commandCategories.vscode) })
      let r = vscode.env.appName.includes('Insiders') || vscode.env.appName.includes('OSS')
      return (
        (e.iconPath = Uri.joinPath(
          this.accessor.get(extensionContext).extensionUri,
          'assets',
          r ? 'vscode-chat-avatar-insiders.svg' : 'vscode-chat-avatar-stable.svg'
        )),
        (e.sampleRequest = CommandManager.getCommand('vscode', 2)?.intent?.commandInfo?.sampleRequest),
        e
      )
    }
    registerTerminalAgent() {
      let e = this.createAgent(terminal, 'terminal')
      return (
        (e.fullName = 'Terminal'),
        (e.description = 'Ask how to do something in the terminal'),
        (e.followupProvider = { provideFollowups: (r, n) => ('followupsPromise' in r ? r.followupsPromise : []) }),
        (e.iconPath = new vscode.ThemeIcon('terminal')),
        (e.slashCommandProvider = { provideSlashCommands: r => this.getSlashCommands(commandCategories.terminal) }),
        (e.sampleRequest = CommandManager.getCommand('terminal', 2)?.intent?.commandInfo?.sampleRequest),
        e
      )
    }
    registerDefaultAgent() {
      let e = this.createAgent('', '')
      ;(e.isDefault = !0),
        (e.helpTextPrefix = vscode.l10n.t(
          'You can ask me general programming questions, or chat with the following agents which have specialized expertise and can perform actions:'
        ))
      let r = vscode.l10n.t({
          message: `To have a great conversation, ask me questions as if I was a real programmer:

* **Show me the code** you want to talk about by having the files open and selecting the most important lines.
* **Make refinements** by asking me follow-up questions, adding clarifications, providing errors, etc.
* **Review my suggested code** and tell me about issues or improvements, so I can iterate on it.

You can also ask me questions about your editor selection by [starting an inline chat session](command:inlineChat.start).

Learn more about [GitHub Copilot](https://docs.github.com/copilot/getting-started-with-github-copilot?tool=vscode) in [Visual Studio Code](https://code.visualstudio.com/docs/editor/artificial-intelligence).`,
          comment: "{Locked='](command:inlineChat.start)'}",
        }),
        n = new vscode.MarkdownString(r)
      return (
        (n.isTrusted = { enabledCommands: ['inlineChat.start'] }),
        (e.helpTextPostfix = n),
        (e.fullName = 'GitHub Copilot'),
        (e.description = ''),
        (e.followupProvider = { provideFollowups: (i, o) => ('followupsPromise' in i ? i.followupsPromise : []) }),
        (e.slashCommandProvider = { provideSlashCommands: i => [] }),
        e
      )
    }
    getSlashCommands(e) {
      let r = []
      return (
        e.forEach(n => {
          let i = CommandManager.getCommand(n, 2)?.intent
          i &&
            r.push({
              name: i.id,
              description: i.description,
              followupPlaceholder: i.commandInfo?.followupPlaceholder,
              shouldRepopulate: i.commandInfo?.shouldRepopulate,
              sampleRequest: i.commandInfo?.sampleRequest,
            })
        }),
        r
      )
    }
    getChatAgentHandler(e) {
      return async (r, n, i, o) => {
        let s = new CopilotConversationManager(this.accessor, this.options, '', this._logger, this._isInternal, '')
        s.addHistory(n.history)
        let a = r.slashCommand?.name ?? e
        return await s.provideResponseWithProgress(r, i, o, { intentId: a })
      }
    }
  }
var vscode = handleDefaultExports(require('vscode'))
var MainComponent = class extends BaseComponent {
    render() {
      return vscpp(
        vscppf,
        null,
        vscpp(SystemComponent, null, vscpp(AIAssistantComponent, null), vscpp(ExpertiseComponent, null)),
        vscpp(UserComponent, null, vscpp(GitDiffComponent, { diff: this.props.diff }), vscpp(CommitMessageComponent, null))
      )
    }
  },
  AIAssistantComponent = class extends BaseComponent {
    render() {
      return vscpp(
        vscppf,
        null,
        'You are an AI programming assistant.',
        vscpp('br', null),
        'You are helping a software developer to commit some changes to a Git repository.'
      )
    }
  },
  CommitMessageComponent = class extends BaseComponent {
    render() {
      return vscpp(
        vscppf,
        null,
        'The commit message should be short and concise that describes the changes in the code.',
        vscpp('br', null),
        'The commit message should start with *** and end with ***.'
      )
    }
  },
  GitDiffComponent = class extends BaseComponent {
    render() {
      return vscpp(
        vscppf,
        null,
        'Below is a git diff that contains the changes that the developer has made:',
        vscpp('br', null),
        this.props.diff.join(`

`),
        vscpp('br', null),
        'Based on the git diff, please suggest a commit message for the developer to use.'
      )
    }
  }
  var GitCommitMessageGenerator = class {
    constructor(accessor) {
      this.accessor = accessor;
      this.microsoftTelemetryService = accessor.get(IMSTelemetryService);
      this.logger = accessor.get(LoggerManager).getPromptResponseLogger('git commit message generator');
      this.options = accessor.get(conversationOptions);
    }
    async generateGitCommitMessage(diff, attemptCount, cancellationToken) {
      let startTime = Date.now(),
        chatEndpointInfo = await getChatEndpointInfo(this.accessor, 3),
        maxTokenWindow = Math.floor((chatEndpointInfo.modelMaxTokenWindow * 4) / 3),
        processedDiff = this.processDiff(diff, maxTokenWindow),
        renderedComponent = await new Renderer(this.accessor, chatEndpointInfo.modelMaxTokenWindow, chatEndpointInfo).render(MainComponent, { diff: diff }),
        temperature = Math.min(this.options.temperature * (1 + attemptCount), 2),
        requestTime = Date.now(),
        response = await this.accessor
          .get(DataRetriever)
          .fetchOne(
            renderedComponent,
            undefined,
            cancellationToken,
            3,
            chatEndpointInfo,
            { temperature: temperature, top_p: this.options.topP },
            { messageSource: 'command.generateGitCommitMessagePrompt' }
          );
      if (
        (this.logger.logResponse(response),
        this.microsoftTelemetryService.sendTelemetryEvent(
          'git.generateCommitMessage',
          { model: chatEndpointInfo.model, requestId: response.requestId, responseType: response.type },
          {
            attemptCount: attemptCount,
            originalDiffFileCount: diff.length,
            originalDiffLength: diff.join('').length,
            processedDiffFileCount: processedDiff.length,
            processedDiffLength: processedDiff.join('').length,
            timeToRequest: requestTime - startTime,
            timeToComplete: Date.now() - startTime,
          }
        ),
        response.type === 'success')
      )
        return this.processGeneratedCommitMessage(response.value);
    }
    processDiff(diff, maxTokenWindow) {
      let threshold = maxTokenWindow - Math.floor(maxTokenWindow * 0.1),
        diffLength = diff.join(`

  `).length;
      if (diffLength > threshold)
        for (diff.sort((a, b) => a.length - b.length); diffLength > threshold && diff.length > 0; ) {
          let removedDiff = diff.pop();
          diffLength -= removedDiff.length;
        }
      return diff;
    }
    processGeneratedCommitMessage(commitMessage) {
      return commitMessage.replace(/\*\*\*/gm, '').trim();
    }
  }
var requestLight = handleDefaultExports(requestLight()),
crypto = require('crypto')
var requestLight = handleDefaultExports(requestLight())
var CodeEditor = class Editor {
  constructor() {
    this.id = Editor.ID
    this.description = requestLight.t('Make changes to existing code')
    this.intentDetectionInput = {
      sampleQuestion: 'Change this method to use async/await',
      modelDescription: 'Make changes to existing code',
    }
    this.locations = [1]
    this.commandInfo = { hiddenFromUser: true }
  }
  static {
    this.ID = 'edit'
  }
  async invoke(intent, context) {
    return IntentHandler.createIntentInvocation(this, intent, context, 2)
  }
}
var requestLight = handleDefaultExports(requestLight())
var CodeGenerator = class {
  constructor() {
    this.id = CodeGenerator.ID
    this.description = requestLight.t('Generate new code')
    this.intentDetectionInput = {
      sampleQuestion: 'Add a function that returns the sum of two numbers',
      modelDescription: 'Generate new code',
    }
    this.locations = [1]
    this.commandInfo = { hiddenFromUser: !0 }
  }
  static {
    this.ID = 'generate'
  }
  async invoke(e, r) {
    return IntentHandler.createIntentInvocation(this, e, r, 3)
  }
}
var SamplingParameters = { top_p: 1, temperature: 0.1 }
var Conversation = class {
  constructor(placeholder, slashCommands, wholeRange, document, formattingOptions, message, input, preferredIntent) {
    this.placeholder = placeholder
    this.slashCommands = slashCommands
    this.wholeRange = wholeRange
    this.document = document
    this.formattingOptions = formattingOptions
    this.message = message
    this.input = input
    this.preferredIntent = preferredIntent
    this._requests = []
    this.sessionId = crypto.randomUUID()
    this.conversation = undefined
  }
  addRequest(request) {
    this._requests.push(request)
  }
  getRequests() {
    return this._requests
  }
},
CopilotInteractiveEditorSessionProvider = class CopilotInteractiveEditorSessionProvider {
    constructor(accessor, rejectionMessage) {
      this.accessor = accessor
      this.rejectionMessage = rejectionMessage
      ;(this.logger = accessor.get(LoggerManager).getPromptResponseLogger('interactiveEditor')),
        (this.tabAndEditorsService = accessor.get(BaseTabManager)),
        (this.languageDiagnosticService = accessor.get(DiagnosticWaiter)),
        (this._microsoftTelemetryService = accessor.get(IMSTelemetryService)),
        this.logger.info(
          `CopilotInteractiveEditorSessionProvider created, with rejection message: ${this.rejectionMessage}`
        )
    }
    async prepareInteractiveEditorSession(e) {
      let r
      if (this.tabAndEditorsService.activeTextEditor?.document.uri.toString() === e.document.uri.toString()) {
        let d = this.tabAndEditorsService.activeTextEditor.options
        r = { insertSpaces: d.insertSpaces, tabSize: d.tabSize }
      }
      let n,
        i = this.languageDiagnosticService.getDiagnostics(e.document.uri).find(d => d.range.contains(e.selection))
      i && (i.severity === VscodeDiagnosticSeverity.Warning || i.severity === VscodeDiagnosticSeverity.Error) && (n = `/fix ${i.message}`)
      let o = {
          document: e.document,
          fileIndentInfo: r,
          language: getCommentSymbol(e.document),
          selection: e.selection,
          wholeRange: e.selection,
        },
        s = []
      for (let d of CommandManager.getCommands(1))
        d.intent?.asSlashCommand
          ? s.push(await d.intent.asSlashCommand(this.accessor, o))
          : s.push({ command: d.commandId, detail: d.details, executeImmediately: d.executeImmediately })
      let a = [
        requestLight.t({
            message: '{0} Copilot generated code may be incorrect',
            args: ['$(copilot-logo)'],
            comment: ["{Locked='Copilot'}", "Do not translate 'Copilot'"],
          }),
        ],
        l = requestLight.t({
          message: '{0} You can also type / for commands',
          args: ['$(copilot-logo)'],
          comment: ["{Locked='Copilot'}", "Do not translate 'Copilot'"],
        }),
        c,
        u
      e.selection.isEmpty && e.document.lineAt(e.selection.start.line).text.trim() === ''
        ? (a.push(
            l,
            requestLight.t({
              message: '{0} You can also select code to make an edit',
              args: ['$(copilot-logo)'],
              comment: ["{Locked='Copilot'}", "Do not translate 'Copilot'"],
            })
          ),
          (u = requestLight.t('Ask Copilot to generate code...')),
          (c = CodeGenerator.ID))
        : !e.selection.isEmpty && e.selection.start.line !== e.selection.end.line
        ? (a.push(l), (u = requestLight.t('Ask Copilot to edit code...')), (c = CodeEditor.ID))
        : (u = requestLight.t('Ask Copilot or type / for commands'))
      let p = a[Math.floor(Math.random() * a.length)]
      return new Conversation(u, s, e.selection, e.document, r, p, n, c)
    }
    async provideInteractiveEditorResponse(e, r, n, i) {
      this.logger.info(`CopilotInteractiveEditorSessionProvider query: ${r.prompt}`),
        n.report({ message: requestLight.t('Fetching response...'), edits: [] }),
        r.attempt === 0 && e.addRequest(r.prompt)
      let o = this.accessor.get(ConfigManager).getConfig(settings.InlineChatStreaming),
        s = r.live
      if (o === 'off') s = !1
      else if (o === 'instant') {
        let l = n
        n = {
          report: c => {
            l.report({ ...c, editsShouldBeInstant: !0 })
          },
        }
      }
      let a = await this.fetchResponse(e, r, n, s, i)
      if (a) return handleReply(a, s)
    }
    async provideFollowups(e, r, n) {
      return r.reply.followUp?.(n)
    }
    handleInteractiveEditorResponseFeedback(e, r, n) {
      if (
        (this.logger.debug('CopilotInteractiveEditorSessionProvider feedback received'), n === VscodeInteractiveEditorResponseFeedbackKind.Bug && e.conversation)
      ) {
        this.accessor.get(Reporter)?.reportInline(e.conversation, r.promptQuery, r.reply)
        return
      }
      let i = { messageId: r.messageId },
        o,
        { selection: s, wholeRange: a, intent: l, query: c } = r.promptQuery,
        u = e.conversation?.getLatestTurn()?.requestId ?? '',
        p = e.sessionId,
        d = l?.id,
        f = e.document.languageId,
        m = r.reply.type,
        h = m === 'inlineEdit' ? r.reply.edits : null,
        g = generateDiagnosticsTelemetry(s, this.languageDiagnosticService.getDiagnostics(e.document.uri)),
        v = isNotebookCell(e.document.uri) ? 1 : 0,
        _ = { languageId: f, replyType: m, conversationId: p, requestId: u, command: d },
        y = {
          selectionLineCount: s ? Math.abs(s.end.line - s.start.line) : -1,
          wholeRangeLineCount: a ? Math.abs(a.end.line - a.start.line) : -1,
          editCount: h?.length ?? -1,
          editLineCount:
            h?.reduce(
              (x, P) =>
                x +
                P.newText.split(`
`).length,
              0
            ) ?? -1,
          isNotebook: v,
          problemsCount: g.fileDiagnosticsTelemetry.problemsCount,
          selectionProblemsCount: g.selectionDiagnosticsTelemetry.problemsCount,
          diagnosticsCount: g.fileDiagnosticsTelemetry.diagnosticsCount,
          selectionDiagnosticsCount: g.selectionDiagnosticsTelemetry.diagnosticsCount,
        },
        b = (x, P) => {
          this._microsoftTelemetryService.sendInternalTelemetryEvent(
            x,
            {
              language: f,
              intent: d,
              query: c,
              conversationId: p,
              requestId: u,
              replyType: m,
              problems: g.fileDiagnosticsTelemetry.problems,
              selectionProblems: g.selectionDiagnosticsTelemetry.problems,
              diagnosticCodes: g.fileDiagnosticsTelemetry.diagnosticCodes,
              selectionDiagnosticCodes: g.selectionDiagnosticsTelemetry.diagnosticCodes,
            },
            { isNotebook: v, ...P }
          )
        }
      if (n === VscodeInteractiveEditorResponseFeedbackKind.Helpful || n === VscodeInteractiveEditorResponseFeedbackKind.Unhelpful) {
        let x = n === VscodeInteractiveEditorResponseFeedbackKind.Helpful ? 1 : 0
        this._microsoftTelemetryService.sendTelemetryEvent('inline.action.vote', _, { ...y, vote: x }),
          b('interactiveSessionVote', { vote: x })
      } else if (n === VscodeInteractiveEditorResponseFeedbackKind.Undone || n === VscodeInteractiveEditorResponseFeedbackKind.Accepted) {
        let x = n === VscodeInteractiveEditorResponseFeedbackKind.Accepted ? 1 : 0
        this._microsoftTelemetryService.sendTelemetryEvent('inline.done', _, { ...y, accepted: x }),
          b('interactiveSessionDone', { accepted: x })
      }
      switch (n) {
        case VscodeInteractiveEditorResponseFeedbackKind.Helpful:
          ;(i.rating = 'positive'), (o = 'inlineConversation.messageRating')
          break
        case VscodeInteractiveEditorResponseFeedbackKind.Unhelpful:
          ;(i.rating = 'negative'), (o = 'inlineConversation.messageRating')
          break
        case VscodeInteractiveEditorResponseFeedbackKind.Undone:
          ;(i.action = 'undo'), (o = 'inlineConversation.undo')
          break
        case VscodeInteractiveEditorResponseFeedbackKind.Accepted:
          ;(i.action = 'accept'), (o = 'inlineConversation.accept')
          break
        case VscodeInteractiveEditorResponseFeedbackKind.Bug:
          o = ''
          break
      }
      o && sendSuggestionTelemetry(this.accessor, e.document, i, {}, o)
    }
    async fetchResponse(e, r, n, i, o) {
      let s = generateTelemetryEvent(),
        a = Date.now(),
        l = {
          document: e.document,
          fileIndentInfo: e.formattingOptions,
          language: getCommentSymbol(e.document),
          selection: r.selection,
          wholeRange: r.wholeRange,
        }
      ;(e.getRequests().length > 1 || r.attempt > 0) && (e.preferredIntent = void 0)
      let c = await processCommand(this.accessor, r.prompt, l, e, s, o),
        u = c.intentInvocation
      n.report({ slashCommand: c.slashCommand })
      let p = await generateMessages(c, e.getRequests().slice(0, -1), s, o)
      if (o.isCancellationRequested) return
      let d = e.conversation,
        f = d === void 0
      d || (d = e.conversation = new Conversation())
      let m = p.map(T => T.content).join(`
`),
        h = new Session({ message: m, type: 'user' })
      ;(h.chatMessages = p),
        d.addTurn(h),
        (s = extendTelemetryEventWithUserInput(d, e.sessionId, 'conversationInline', r.prompt, calculateTokenLength(this.accessor, p), u.intent.id, s))
      let g = s.properties.messageId
      ;(h.requestId = g), this.logger.logPrompt(p)
      let v,
        _,
        y = 0,
        b = u.createReplyInterpreter(n, i),
        x = async T => (y === 0 && (y = Date.now()), b.update(T).shouldFinish ? T.length : void 0),
        P = Date.now(),
        U = u.endpoint
      try {
        v = await this.accessor
          .get(DataRetriever)
          .fetchOne(
            p,
            x,
            o,
            1,
            U,
            { temperature: CopilotInteractiveEditorSessionProvider.pickTemperature(r), top_p: SamplingParameters.top_p },
            { messageId: g, messageSource: 'inline.user' },
            { intent: !0 }
          )
      } catch (T) {
        throw (
          (this.logger.exception(T, 'Fetching failed: '),
          this.accessor.get(IGHTelemetryService).sendExceptionTelemetry(T, 'Fetching failed: '),
          (h.status = 'error'),
          (h.response = { message: T.message, type: 'server' }),
          new Error('Failed to make request'))
        )
      }
      this.logger.logResponse(v),
      extendTelemetryEventWithOffTopicFlag(
          this.accessor,
          'conversationInline',
          r.prompt,
          v.type === 'offTopic',
          this.tabAndEditorsService.activeTextEditor?.document,
          s
        )
      let H = isNotebookCell(e.document.uri) ? 1 : 0,
        j = generateDiagnosticsTelemetry(r.selection, this.languageDiagnosticService.getDiagnostics(e.document.uri)),
        M = this.accessor.get(Tokenizer),
        F = T => {
          this._microsoftTelemetryService.sendTelemetryEvent(
            'inline.request',
            {
              command: u.intent.id ?? '',
              contextTypes: 'none',
              promptTypes: p.map(A => `${A.role}${A.name ? `-${A.name}` : ''}:${A.content.length}`).join(','),
              conversationId: e.sessionId,
              requestId: g,
              languageId: this.tabAndEditorsService.activeTextEditor?.document?.languageId,
              responseType: v.type,
              replyType: T?.type,
              model: U.model,
              diagnosticsProvider: j.diagnosticsProvider,
            },
            {
              firstTurn: f ? 1 : 0,
              isNotebook: H,
              messageTokenCount: M.tokenLength(c.queryWithoutCommand),
              promptTokenCount: calculateTokenLength(this.accessor, p),
              responseTokenCount: v.type === 'success' ? M.tokenLength(v.value) : -1,
              implicitCommand: r.prompt.trim().startsWith(`/${u.intent.id}`) ? 0 : 1,
              attemptCount: r.attempt || 0,
              selectionLineCount: r.selection ? Math.abs(r.selection.end.line - r.selection.start.line) + 1 : -1,
              wholeRangeLineCount: r.wholeRange ? Math.abs(r.wholeRange.end.line - r.wholeRange.start.line) + 1 : -1,
              editCount: T?.type === 'inlineEdit' ? T.edits.length : -1,
              editLineCount:
                T?.type === 'inlineEdit'
                  ? T.edits.reduce(
                      (A, X) =>
                        A +
                        X.newText.split(`
`).length,
                      0
                    )
                  : -1,
              problemsCount: j.fileDiagnosticsTelemetry.problemsCount,
              selectionProblemsCount: j.selectionDiagnosticsTelemetry.problemsCount,
              diagnosticsCount: j.fileDiagnosticsTelemetry.diagnosticsCount,
              selectionDiagnosticsCount: j.selectionDiagnosticsTelemetry.diagnosticsCount,
              timeToRequest: P - a,
              timeToFirstToken: y ? y - a : -1,
              timeToComplete: Date.now() - a,
            }
          )
        },
        z = (T, A) => {
          this._microsoftTelemetryService.sendInternalTelemetryEvent(
            'interactiveSessionResponse',
            {
              chatLocation: 'inline',
              intent: u.intent.id ?? '',
              problems: j.fileDiagnosticsTelemetry.problems,
              selectionProblems: j.selectionDiagnosticsTelemetry.problems,
              diagnosticCodes: j.fileDiagnosticsTelemetry.diagnosticCodes,
              selectionDiagnosticCodes: j.selectionDiagnosticsTelemetry.diagnosticCodes,
              diagnosticsProvider: j.diagnosticsProvider,
              language: this.tabAndEditorsService.activeTextEditor?.document?.languageId,
              request: r.prompt,
              responseType: T,
              response: A,
            },
            { isNotebook: H }
          )
        }
      switch (v.type) {
        case 'rateLimited': {
          let T = `Response failed ${v.type}: ${v.reason}`
          throw (
            ((h.status = 'error'),
            (h.response = { message: T, type: 'server' }),
            F(),
            z(v.type, T),
            new Error('Oops, your request failed due to a rate limit. Please try again later.'))
          )
        }
        case 'badRequest': {
          let T = `Response failed ${v.type}: ${v.reason}`
          throw (
            ((h.status = 'error'),
            (h.response = { message: T, type: 'server' }),
            F(),
            z(v.type, T),
            new Error('Failed to make request'))
          )
        }
        case 'failed': {
          this.logger.error(`Response failed: ${v.reason}`), (h.status = 'error')
          let T = v.reason
          throw ((h.response = { message: T, type: 'server' }), F(), z(v.type, T), new Error('Failed to make request'))
        }
        case 'canceled': {
          this.logger.debug(`Response canceled: ${v.reason}`), (h.status = 'error')
          let T = 'Cancelled'
          ;(h.response = { message: T, type: 'user' }), F(), z(v.type, T)
          return
        }
        case 'unknown': {
          let T = `Response is empty: ${v.reason}`
          this.logger.info(T), (h.status = 'error'), (h.response = { message: T, type: 'server' }), F(), z(v.type, T)
          return
        }
        case 'filtered': {
          let T = `Response got filtered: ${v.reason}`
          throw (
            (this.logger.info(T),
            (h.status = 'filtered'),
            (h.response = { message: T, type: 'server' }),
            F(),
            z(v.type, T),
            new Error('Oops, response got filtered. Please rephrase your prompt.'))
          )
        }
        case 'offTopic': {
          this.logger.info(`Response marked as offtopic: ${v.reason}`), (h.status = 'off-topic')
          let T = this.rejectionMessage
          ;(h.response = { message: T, type: 'offtopic-detection' }),
            F(),
            z(v.type, T),
            extendTelemetryEventWithOffTopicMessage(this.accessor, d, e.sessionId, 'conversationInline', r.prompt, g, e.document, s)
          return
        }
        case 'length': {
          let T = `Response was too long: ${v.reason}`
          this.logger.info(T), (h.status = 'error'), (h.response = { message: T, type: 'server' }), F(), z(v.type, T)
          return
        }
        case 'success':
          break
        default: {
          this.logger.error('Unexpected response type'), this.logger.info(JSON.stringify(v)), (h.status = 'error')
          let T = `Unexpected response type: ${JSON.stringify(v)}`
          ;(h.response = { message: T, type: 'server' }), F(), z('unknown', T)
          return
        }
      }
      if (((_ = v.value), _.length === 0)) {
        this.logger.info('Response is empty.'), F(), z('unknown', 'Empty response')
        return
      }
      b.update(_)
      let q = await b.finish()
      h.status = 'success'
      let L = _
      return (
        (h.response = { message: L, type: 'model' }),
        F(q),
        z('success', L),
        (s = s.extendedBy({ replyType: q.type })),
        extendTelemetryEventWithModelOutput(this.accessor, d, e.sessionId, 'conversationInline', _, g, e.document, s),
        this.logger.info(`Parsed response: ${JSON.stringify(q, null, '	')}`),
        {
          promptQuery: { query: c.queryWithoutCommand, ...l, intent: u.intent },
          parsedReply: q,
          messageId: s.properties.messageId,
        }
      )
    }
    static pickTemperature(e) {
      return 'attempt' in e && typeof e.attempt == 'number'
        ? Math.min(SamplingParameters.temperature * (e.attempt + 1), 2)
        : SamplingParameters.temperature
    }
  }

function handleReply(reply, context) {
  let { promptQuery, parsedReply, messageId } = reply
  if (parsedReply.type === 'conversational') return { contents: new VscodeMarkdownString(parsedReply.content), promptQuery, reply: parsedReply, messageId }
  let contents = parsedReply.content !== void 0 ? new VscodeMarkdownString(parsedReply.content) : void 0
  return parsedReply.type === 'workspaceEdit'
    ? { edits: parsedReply.workspaceEdit, promptQuery, reply: parsedReply, messageId, contents }
    : {
        edits: parsedReply.edits,
        wholeRange: parsedReply.newWholeRange,
        reply: parsedReply,
        promptQuery,
        messageId,
        contents: parsedReply.content !== void 0 ? new VscodeMarkdownString(parsedReply.content) : void 0,
      }
}

function calculateTokenLength(tokenizer, tokens) {
  let totalLength = 0
  for (let token of tokens) totalLength += tokenizer.tokenLength(token.content)
  return totalLength
}

function generateDiagnosticsTelemetry(range, diagnostics) {
  let filteredDiagnostics = diagnostics.filter(diagnostic => range.intersection(diagnostic.range)),
    fileDiagnosticsTelemetry = {
      problems: diagnostics.map(diagnostic => diagnostic.message).join(', '),
      problemsCount: diagnostics.length,
      diagnosticCodes: '',
      diagnosticsCount: 0,
    },
    selectionDiagnosticsTelemetry = {
      problems: filteredDiagnostics.map(diagnostic => diagnostic.message).join(', '),
      problemsCount: filteredDiagnostics.length,
      diagnosticCodes: '',
      diagnosticsCount: 0,
    },
    fileDiagnosticCodes = new Map(),
    selectionDiagnosticCodes = new Map()
  diagnostics.forEach(diagnostic => {
    let code = diagnostic.code,
      codeString = typeof code == 'string' || typeof code == 'number' ? code.toString() : code ? code.value.toString() : ''
    fileDiagnosticCodes.set(codeString, (fileDiagnosticCodes.get(codeString) || 0) + 1), range.intersection(diagnostic.range) && selectionDiagnosticCodes.set(codeString, (selectionDiagnosticCodes.get(codeString) || 0) + 1)
  })
  let generateDiagnosticCodesString = map => {
    let result = ''
    map.forEach((count, code) => {
      result += `${code}:${count},`
    })
    return result
  }
  fileDiagnosticsTelemetry.diagnosticCodes = generateDiagnosticCodesString(fileDiagnosticCodes)
  fileDiagnosticsTelemetry.diagnosticsCount = fileDiagnosticCodes.size
  selectionDiagnosticsTelemetry.diagnosticCodes = generateDiagnosticCodesString(selectionDiagnosticCodes)
  selectionDiagnosticsTelemetry.diagnosticsCount = selectionDiagnosticCodes.size
  let diagnosticsProvider = diagnostics.length > 0 ? diagnostics[0].source ?? '' : ''
  return { fileDiagnosticsTelemetry, selectionDiagnosticsTelemetry, diagnosticsProvider }
}
var requestLight = handleDefaultExports(requestLight())
var TextProcessor = class {
  constructor(turn, progress, textApplier) {
    this.turn = turn
    this.progress = progress
    this.stagedTextToApply = ''
    this.reporting = true
    this._appliedText = ''
    this._resolvedContentDeferredPromise = new PromiseOutcome()
    this._incodeblock = false
    this.conversationCallback = new TextApplier(delta => this.applyDelta(delta))
  }
  get appliedText() {
    return Promise.resolve(this._appliedText)
  }
  apply(text) {
    this.conversationCallback.apply(text)
  }
  applyDeltaToTurn(delta) {
    this.turn.response || (this.turn.response = { message: delta, type: 'model' }),
      (this._appliedText += delta),
      (this.turn.response.message += delta)
  }
  applyDeltaToProgress(delta) {
    this.progress.report({ content: delta })
  }
  applyDelta(delta) {
    if (!this.reporting) {
      this.applyDeltaToTurn(delta)
      return
    }
    delta = this.stagedTextToApply + delta
    if (this._incodeblock) {
      let codeBlockEndIndex = delta.indexOf('```')
      if (codeBlockEndIndex === -1) {
        this.stagedTextToApply = delta
        this.applyDeltaToProgress('')
        this.applyDeltaToTurn('')
        return
      } else {
        this._incodeblock = false
        delta = delta.substring(0, codeBlockEndIndex) + '```'
        try {
          this.applyDeltaToTurn(delta)
        } catch {
        } finally {
          this.reporting = false
          this.stagedTextToApply = ''
          this._resolvedContentDeferredPromise.complete({ content: '' })
        }
        return
      }
    }
    let codeBlockStartIndex = delta.indexOf('```')
    if (codeBlockStartIndex !== -1) {
      this._incodeblock = true
      let codeBlockEndIndex = delta.indexOf('```', codeBlockStartIndex + 3)
      if (codeBlockEndIndex !== -1) {
        this._incodeblock = false
        this.applyDeltaToProgress(delta.substring(0, codeBlockStartIndex))
        this.applyDeltaToProgress(delta.substring(codeBlockEndIndex + 3))
        this.applyDeltaToTurn(delta)
        this.reporting = false
        this.stagedTextToApply = ''
        return
      } else {
        let textBeforeCodeBlock = delta.substring(0, codeBlockStartIndex)
        this.applyDeltaToProgress(textBeforeCodeBlock)
        this.applyDeltaToTurn(delta)
        this.stagedTextToApply = ''
        this.progress.report({
          placeholder: 'Thinking ...',
          resolvedContent: this._resolvedContentDeferredPromise.p,
        })
        return
      }
    }
    this.applyDeltaToProgress(delta)
    this.applyDeltaToTurn(delta)
    this.stagedTextToApply = ''
  }
},
outlineInstructions = `
DO NOT include Introduction or Conclusion section in the outline!
Focus only on sections that will need code!

Generate the outline as two parts:
- First part is markdown bullet list of section titles
- Second part is the JSON data that will validate against this JSON schema, wrap the response in code block. We assume that a code block begins with \`\`\`[optionally the language] and ends with \`\`\`

The JSON schema is:
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
	"description": {
	  "type": "string"
	},
	"sections": {
	  "type": "array",
	  "items": {
		"type": "object",
		"properties": {
		  "title": {
			"type": "string"
		  },
		  "content": {
			"type": "string"
		  }
		},
		"required": ["title", "content"]
	  }
	}
  },
  "required": ["sections"]
}`,
exampleResponse = `
Below you will find a set of examples of what you should respond with. Please follow these examples as closely as possible.

## Valid notebook creation question

user: Creating Random Arrays with Numpy

assistant: Here's an outline for a Jupyter notebook that creates Random Arrays with Numpy:

* **Import Required Libraries**
* **Create Random Arrays**
* **Seed the Random Number Generator**
* **Generate Random Integers**

\`\`\`json
{
  "description": "A Jupyter notebook that creates Random Arrays with Numpy.",
  "sections": [
    {
      "title": "Import Required Libraries",
      "content": "Import the necessary libraries, including NumPy."
    },
    {
      "title": "Create Random Arrays",
      "content": "Use NumPy to create random arrays of various shapes and sizes, including 1D, 2D, and 3D arrays."
    },
    {
      "title": "Seed the Random Number Generator",
      "content": "Use the seed() function to seed the random number generator for reproducibility."
    },
	{
	  "title": "Generate Random Integers",
	  "content": "Use the randint() function to generate random integers within a specified range."
	}
  ]
}
\`\`\`
`
function createNewNotebookIntent() {
  let newNotebookIntent = new Intent({
    location: 2,
    id: 'newNotebook',
    description: requestLight.t('Create a new Jupyter Notebook'),
    modelDescription:
      'Creates a new Jupyter Notebook for tasks such as data analysis, scientific computing, and machine learning.',
    modelSampleQuestion: 'How do I create a notebook to load data from a csv file?',
    commandInfo: {
      allowsEmptyArgs: false,
      yieldsTo: [{ command: 'fix' }, { command: 'explain' }, { command: 'workspace' }, { command: 'tests' }],
      defaultEnablement: true,
      sampleRequest: requestLight.t('How do I create a notebook to load data from a csv file?'),
    },
    systemPromptOptions: {
      examples: exampleResponse,
      roleplay: 'You are an AI that creates a detailed content outline for a Jupyter notebook on a given topic.',
    },
    rules: outlineInstructions,
    turnFilter: intents =>
    intents.filter(
      intent =>
        intent.intentInvocation?.intent.id === 'newNotebook' ||
          (intent.request.type !== 'user' && intent.request.type !== 'follow-up')
      ),
    responseProcessor: (response, intent, context) => new TextProcessor(response, intent, context),
    followUps: async (response, intent) => {
      let message = (intent.response?.message ?? '').replace(/\n/g, ''),
        jsonMatch = /```(?:json)?(.+)/g.exec(message)
      if (jsonMatch)
        try {
          let json = jsonMatch[1],
            endOfJson = json.indexOf('```'),
            jsonContent = endOfJson === -1 ? json : json.substring(0, endOfJson)
          return [{ commandId: 'github.copilot.newNotebook', args: [JSON.parse(jsonContent)], title: 'Create Notebook' }]
        } catch {}
      return []
    },
    contextResolvers: [contextResolverRegistry, currentSelectionContextResolver],
  })
  IntentManager.registerIntent(newNotebookIntent)
}
ContributionManager.registerContribution(createNewNotebookIntent)
async function generatePythonCodeForSection(serviceProvider, context, options, notebookTopic, sectionInfo, existingCode, sessionId) {
  let messageSource = { messageSource: 'slash.newNotebook' },
    prompt = `
    You are an AI that writes Python code for a single section of a Jupyter notebook.
    Overall topic of the notebook: ${notebookTopic}
    Title of the notebook section: ${sectionInfo.title}
    Description of the notebok section: ${sectionInfo.content}
    Given this information, write all the code for this section and this section only.
    Your output should be valid Python code with inline comments.
    You should return the code directly without any explantion.
    You should not print message to explain the code or purpose of the code.

    Code in the notebook so far:

    ${existingCode}

    Please make sure the new code you generate works fine with the code above.
    You should return the code directly, without wrapping it inside \`\`\`.

    Please make sure that the new code is syntactically valid Python code. It can be validated by running it in a Python interpreter.
    For example, it should pass the validation through builtin module codeop \`codeop.compile_command(statement)\`.
    `,
    response = await serviceProvider
      .get(DataRetriever)
      .fetchOne([{ content: prompt, role: 'user' }], undefined, sessionId, 2, context, { temperature: options.temperature, top_p: options.topP }, messageSource)
  if (response.type === 'success') return response.value
}
async function improvePythonCode(serviceProvider, context, options, notebookTopic, sectionInfo, existingCode, codeToImprove, sessionId) {
  let messageSource = { messageSource: 'slash.newNotebook' },
    prompt = `
You are an AI that improves Python code with respect to readability and performance for a single section of a Jupyter notebook.
You MUST return Python code as your answer.
DO NOT explain in inline comments for your the improvements
Overall topic of the notebook: ${notebookTopic}
Title of the notebook section: ${sectionInfo.title}
Description of the notebok section: ${sectionInfo.content}

Code in the notebook so far:

${existingCode}

Given this information, improve the following code.

Make sure the new code you generate works fine with the code above.
Make sure if a module is already imported in the code above, it can be used in the new code directly without importing it again. For the same reason, if a variable is defined above, it can be used in new code as well.
Make sure to return the code only - don't give an explanation of the improvements.

${codeToImprove}
    `,
    response = await serviceProvider
      .get(DataRetriever)
      .fetchOne([{ content: prompt, role: 'user' }], undefined, sessionId, 2, context, { temperature: options.temperature, top_p: options.topP }, messageSource)
  if (response.type === 'success') return response.value
}
var vscode = handleDefaultExports(require('vscode'))
var ChatResponseProvider = class {
  constructor(context) {
    this.context = context
  }
  async provideChatResponse(messages, options, progress, cancellationToken) {
    let formattedMessages = messages.map(message => {
        let formattedMessage = { content: message.content, name: message.name, role: 'user' }
        switch (message.role) {
          case vscode.ChatMessageRole.System:
            formattedMessage.role = 'system'
            break
          case vscode.ChatMessageRole.Assistant:
            formattedMessage.role = 'assistant'
            break
          case vscode.ChatMessageRole.User:
            formattedMessage.role = 'user'
            break
        }
        return formattedMessage
      }),
      chatEndpointInfo = await getChatEndpointInfo(this.context, 3),
      dataRetriever = this.context.get(DataRetriever),
      offset = 0
    await dataRetriever.fetchMany(
      formattedMessages,
      async (content, index) => {
        let part = content.substring(offset)
        offset += part.length
        progress.report({ part: part, index: index })
      },
      cancellationToken,
      3,
      chatEndpointInfo,
      { n: options.n, stream: true }
    )
  }
}
var vscode = handleDefaultExports(require('vscode'))
var GitCommitGenerator = class {
  constructor(accessor) {
    this.accessor = accessor
    this._changesMap = new Map()
  }
  async run(repository, cancellationToken) {
    if (cancellationToken.isCancellationRequested || !repository) return
    let extensionApi = this.accessor.get(BaseGitExtensionService).getExtensionApi()
    if (!extensionApi) return
    let repo = extensionApi.getRepository(repository)
    repo &&
      (await vscode.window.withProgress({ location: vscode.ProgressLocation.SourceControl }, async () => {
        let diff = await repo.getDiff(),
          attemptCount = this._getAttemptCount(repo, diff),
          commitMessage = await new GitCommitMessageGenerator(this.accessor).generateGitCommitMessage(diff, attemptCount, cancellationToken)
        commitMessage && ((repo.inputBox.value = commitMessage), this._changesMap.set(repo.rootUri.fsPath, [diff, attemptCount]))
      }))
  }
  _getAttemptCount(repo, diff) {
    let [previousDiff, previousAttemptCount] = this._changesMap.get(repo.rootUri.fsPath) ?? [[], 1]
    if (previousDiff.length !== diff.length) return 1
    for (let index = 0; index < diff.length; index++) if (previousDiff[index] !== diff[index]) return 1
    return previousAttemptCount + 1
  }
}
var vscode = handleDefaultExports(require('vscode'))
var PullRequestProvider = class {
  constructor(accessor) {
    this.accessor = accessor
    this.disposables = new DisposableStore()
    this.lastContext = { commitMessages: [], patches: [] }
    this.internalLogger = accessor.get(LoggerManager).getPromptResponseLogger('GitHub pull request title and description generator')
    this.logger = accessor.get(LoggerManager).getLogger('githubTitleAndDescriptionProvider')
    this.logger.info('Initializing GitHub PR title and description provider provider.')
    this.options = accessor.get(conversationOptions)
  }
  dispose() {
    this.disposables.dispose()
  }
  isRegenerate(commitMessages, patches) {
    if (commitMessages.length !== this.lastContext.commitMessages.length || patches.length !== this.lastContext.patches.length) return false
    for (let index = 0; index < commitMessages.length; index++) if (commitMessages[index] !== this.lastContext.commitMessages[index]) return false
    for (let index = 0; index < patches.length; index++) if (patches[index] !== this.lastContext.patches[index]) return false
    return true
  }
  async provideTitleAndDescription(commitMessages, patches, issues, cancellationToken) {
    let chatEndpointInfo = await getChatEndpointInfo(this.accessor, 3)
    let maxTokenWindow = Math.floor((chatEndpointInfo.modelMaxTokenWindow * 4) / 3)
    let prTitleAndDescriptionPrompt = this.createPRTitleAndDescriptionPrompt(commitMessages, patches, issues, maxTokenWindow)
    let prompt = [{ role: 'system', content: prTitleAndDescriptionPrompt }]
    this.internalLogger.logPrompt(prompt)
    let fetchResult = await this.accessor
      .get(DataRetriever)
      .fetchOne(
        prompt,
        undefined,
        cancellationToken,
        3,
        chatEndpointInfo,
        {
          temperature: this.isRegenerate(commitMessages, patches) ? this.options.temperature + 0.1 : this.options.temperature,
          top_p: this.options.topP,
        },
        { messageSource: 'extension.providePullRequestTitleAndDescription' }
      )
    this.internalLogger.logResponse(fetchResult)
    this.lastContext = { commitMessages: commitMessages, patches: patches }
    if (fetchResult.type === 'success') return PullRequestProvider.parseFetchResult(fetchResult.value)
  }

  static parseFetchResult(fetchResult, isRecursive = true) {
    fetchResult = fetchResult.trim()
    let result = fetchResult,
      firstDelimiterIndex = result.indexOf('+++')
    if (firstDelimiterIndex === -1) return
    let lastDelimiterIndex = result.lastIndexOf('+++')
    result = result
      .substring(firstDelimiterIndex + 3, lastDelimiterIndex > firstDelimiterIndex + 3 ? lastDelimiterIndex : void 0)
      .trim()
      .replace(/\+\+\+?(\n)\+\+\+/, '+++')
    let splitResult = result.split('+++').filter(part => part.trim().length > 0),
      titleAndDescription
    if (splitResult.length === 1)
      titleAndDescription = splitResult[0].split(`
`)
    else if (splitResult.length > 1) {
      let descriptionParts = splitResult
        .slice(1)
        .map(part =>
          part.split(`
`)
        )
        .flat()
        .filter(part => part.trim().length > 0)
      titleAndDescription = [splitResult[0], ...descriptionParts]
    } else return
    let title, description
    if (titleAndDescription.length === 1) {
      if (
        ((title = titleAndDescription[0].trim()),
        isRecursive &&
          fetchResult.includes(`
`) &&
          fetchResult.split('+++').length === 3)
      )
        return this.parseFetchResult(fetchResult + '+++', false)
    } else if (titleAndDescription.length > 1) {
      title = titleAndDescription[0].trim()
      description = ''
      let descriptionParts = titleAndDescription.slice(1)
      for (let part of descriptionParts)
        part.includes('commit message') ||
          (description += `${part.trim()}

`)
    }
    if (title)
      return (
        (title = title.replace(/Title\:\s/, '').trim()),
        description && (description = description.replace(/Description\:\s/, '').trim()),
        { title: title, description: description }
      )
  }
  createPRTitleAndDescriptionPrompt(commitMessages, patches, issues, maxTokenWindow) {
    let commitList = commitMessages.map(message => `* ${message}`).join(`
`),
      availableSpace = maxTokenWindow - Math.floor(maxTokenWindow * 0.1) - commitList.length,
      patchesLength = patches.join(`

`).length
    if (patchesLength > availableSpace)
      for (patches.sort((a, b) => a.length - b.length); patchesLength > availableSpace && patches.length > 0; ) {
        let patch = patches.pop()
        patchesLength -= patch.length
      }
    let promptIntro
    issues && issues.length > 0
      ? (promptIntro = `You are an AI assistant for a software developer who is about to make a pull request to a GitHub repository to fix the following issues:
${issues
  .map(
    issue => `
-------
Issue ${issue.reference}:
${issue.content}`
  )
  .join()}
-------
`)
      : (promptIntro = `You are an AI assistant for a software developer who is about to make a pull request to a GitHub repository.
`)
    let examples
    issues && issues.length > 0
        ? (examples = `Example One:
    +++Batch mark/unmark files as viewed
    +++Previously, when marking/unmarking a folder as viewed, a request was sent for every single file. This PR ensures that only one request is sent when marking/unmarking a folder as viewed.
    Fixes #4520+++
Example two:
    +++Fallback to hybrid after 20 process ports
    +++Additionally the \`remote.autoForwardPortsSource\` setting has been updated to remove the \`markdownDescription\` reference to a reload being required for changes to take effect.
    Fixes microsoft/vscode-internalbacklog#4533+++`)
        : (examples = `Example One:
    +++Batch mark/unmark files as viewed
    +++Previously, when marking/unmarking a folder as viewed, a request was sent for every single file. This PR ensures that only one request is sent when marking/unmarking a folder as viewed.+++
Example two:
    +++Fallback to hybrid after 20 process ports
    +++Additionally the \`remote.autoForwardPortsSource\` setting has been updated to remove the \`markdownDescription\` reference to a reload being required for changes to take effect.+++`),
      return `
${getAssistantIdentity()}
${getAssistantExpertise()}

${promptIntro}
Pull requests have a short and concise title that describes the changes in the code and a slightly longer description.
The description can be more detailed but should still be concise. Do not list commits, files or patches. Do not make up an issue reference if the pull request isn't fixing an issue.
The title and description of a pull request should be markdown and start with +++ and end with +++. Here are two good examples.
--------
${examples}
--------
These are the commits that will be included in the pull request you are about to make:
${commitList}
Below is a list of git patches that contain the file changes for all the files that will be included in the pull request:
${patches.join(`

`)}

Based on the git patches and on the git commit messages above, the title and description of the pull request should be:
`
  }
}
var GitHubPRProvider = class extends PullRequestProvider {
  constructor(accessor) {
    super(accessor)
    this.initializeGitHubPRExtensionApi()
  }
  getExtension() {
    return vscode.extensions.getExtension('github.vscode-pull-request-github')
  }
  initializeGitHubPRExtensionApi() {
    let extension = this.getExtension(),
      activateExtension = async () => {
        if (extension) {
          let activatedExtension = await extension.activate()
          this.logger.info('Successfully activated the GitHub.vscode-pull-request-github extension.'),
            (this.gitHubExtensionApi = activatedExtension),
            this.registerTitleAndDescriptionProvider()
        }
      }
    if (extension) activateExtension()
    else {
      this.logger.info('GitHub.vscode-pull-request-github extension is not yet activated.')
      let onDidChangeHandler = vscode.extensions.onDidChange(() => {
        ;(extension = this.getExtension()), extension && (activateExtension(), onDidChangeHandler.dispose())
      })
      this.disposables.add(onDidChangeHandler)
    }
  }
  async registerTitleAndDescriptionProvider() {
    if (this.gitHubExtensionApi)
      try {
        this.disposables.add(
          this.gitHubExtensionApi.registerTitleAndDescriptionProvider(vscode.l10n.t('Generate with Copilot'), this)
        ),
          this.logger.info('Successfully registered GitHub PR title and description provider.')
      } catch {}
  }
}
var vscode = handleDefaultExports(require('vscode'))
var EditProvider = class {
  provideMappedEdits(document, edits, editDocument, options) {
    if (editDocument.documents.length === 0) return null
    let firstDocument = editDocument.documents[0],
      documentUri = document.uri.toString(),
      matchedDocument = firstDocument.find(_ => _.uri.toString() === documentUri)
    if (!matchedDocument) return null
    let ranges = matchedDocument.ranges
    if (ranges.length !== 1 || edits.length !== 1) return null
    let firstRange = ranges[0],
      firstEdit = edits[0]
    if (
      !document
        .getText(new vscode.Range(new vscode.Position(firstRange.start.line, 0), new vscode.Position(firstRange.start.line, firstRange.start.character)))
        .match(/^\s*$/)
    )
      return null
    let activeEditor = vscode.window.activeTextEditor,
      indentationOptions
    if (activeEditor && activeEditor.options && document.languageId === activeEditor.document.languageId) {
      let options = activeEditor.options,
        tabSize = typeof options.tabSize == 'number' ? options.tabSize : 4,
        insertSpaces = typeof options.insertSpaces == 'boolean' ? options.insertSpaces : true
      indentationOptions = { tabSize: tabSize, insertSpaces: insertSpaces }
    }
    let rangeToReplace = new vscode.Range(new vscode.Position(firstRange.start.line, 0), firstRange.end),
      textInRange = document.getText(rangeToReplace),
      adjustedIndentation = adjustIndentation(
        firstEdit.split(`
`),
        {
          whichLine: 'topMost',
          lines: textInRange.split(`
`),
        },
        indentationOptions
      ).join(`
`),
      workspaceEdit = new vscode.WorkspaceEdit()
    return workspaceEdit.replace(document.uri, rangeToReplace, adjustedIndentation), workspaceEdit
  }
}
var vscode = handleDefaultExports(require('vscode'))
var requestLight = handleDefaultExports(requestLight())
var maxTextLength = 6e4,
  maxLineCount = 1500,
  DocumentationCommand = class Command {
    constructor() {
      this.id = Command.ID
      this.description = requestLight.t('Add documentation comment for this symbol')
      this.intentDetectionInput = { sampleQuestion: 'Add jsdoc to this method' }
      this.locations = [1]
      this.commandInfo = { executeImmediately: true }
    }
    static {
      this.ID = 'doc'
    }
    async asSlashCommand(accessor, context) {
      if (context.document.lineCount > maxLineCount || context.document.getText().length > maxTextLength)
        return new SlashCommand('Add documentation comment for this symbol')
      let nodeToDocument = await DocumentSelectionResolver.determineNodeToDocument(accessor, context),
        detail = nodeToDocument.identifier
          ? requestLight.t("Add documentation comment for '{0}'", nodeToDocument.identifier)
          : requestLight.t('Add documentation comment for this symbol')
      return new SlashCommand(detail, nodeToDocument)
    }
    async invoke(accessor, context, slashCommand) {
      let documentContext = context.documentContext
      if (!documentContext) throw new Error('Open a file to add documentation.')
      let nodeToDocument
      slashCommand instanceof SlashCommand
        ? (nodeToDocument = slashCommand.nodeToDocument)
        : accessor
            .get(LoggerManager)
            .getLogger('InlineDocIntent#invoke')
            .warn('Unexpected: SlashCommand given to intent invocation is not a DocSlashCommand')
      let endpointInfo = await getChatEndpointInfo(accessor, context.location, this.id)
      return new DocumentationAssistant(accessor, endpointInfo, documentContext, this, nodeToDocument)
    }
  },
  SlashCommand = class {
    constructor(detail, nodeToDocument = void 0) {
      this.detail = detail
      this.nodeToDocument = nodeToDocument
      this.command = DocumentationCommand.ID
      this.executeImmediately = true
    }
  },
var DocumentationAssistant = class Assistant {
  constructor(accessor, endpoint, context, intent, nodeToDocument = void 0) {
    this.accessor = accessor
    this.endpoint = endpoint
    this.context = context
    this.intent = intent
    this.nodeToDocument = nodeToDocument
    this.location = 1
    this.createReplyInterpreter = ReplyInterpreter.createFactory(async message => {
      if (!this.contextInfo || !this.expandedRange) throw new Error('doc intent NEEDS a selection context')
      let codeBlock = extractCodeBlock(this.contextInfo, message, this.context.language)
      if (!codeBlock) return { type: 'conversational', content: message }
      let code = codeBlock.code,
        startTime = Date.now(),
        extractedDoc = await extractDoc(this.context.document.languageId, code),
        timeSpent = Date.now() - startTime
      Assistant._sendExtractDocTelemetry(this.accessor.get(IMSTelemetryService), this.context.document.languageId, code.length, extractedDoc, timeSpent),
        extractedDoc && (code = extractedDoc)
      let processedInput = processInputText(this.accessor, this.contextInfo, code, 1, this.context.fileIndentInfo)
      return createInlineEdit(processedInput, this.expandedRange)
    })
    let self = this,
      rules = this.computeRules(context)
    this.promptCrafter = new (class extends ChatBuilder {
      constructor() {
        super(accessor, { rules: rules, contextResolvers: [] }, 1, context)
      }
      async buildPrompt(conversation, endpoint, user, prompt, delay, feedback) {
        self.nodeToDocument || (self.nodeToDocument = await DocumentSelectionResolver.determineNodeToDocument(self.accessor, self.context))
        let contextResolution = await new DocumentSelectionResolver(self.nodeToDocument).resolveContext(
          self.accessor,
          { endpoint: endpoint, conversation: conversation, documentContext: self.context, message: void 0 },
          void 0
        )
        if (contextResolution) {
          self.contextInfo = contextResolution?.metadata.contextInfo
          self.expandedRange = contextResolution?.metadata.expandedRange
          let queryPrefix = await self.computeQueryPrefix(accessor, context),
            sessions = []
          for (let message of contextResolution.userMessages) sessions.push(new Session({ message: message, type: 'user' }))
          let lastTurn = conversation.getLatestTurn()
          if (!lastTurn) throw new Error('No last message')
          lastTurn.request.message = `${queryPrefix} ${lastTurn.request.message}`.trim()
          conversation = new Conversation([sessions, conversation.turns].flat())
        }
        return super.buildPrompt(conversation, endpoint, user, prompt, delay, feedback)
      }
    })()
  }
  computeRules(context) {
    return `
- Each code block starts with \`\`\` and ${FilePathComment.forLanguage(context.language)}.
- You always answer with ${context.language.languageId} code.
- When the user asks you to document something, you must answer in the form of a ${
      context.language.languageId
    } code block.`.trim()
  }
  async computeQueryPrefix(accessor, context) {
    let isNode, identifier
    this.nodeToDocument === void 0 || !this.nodeToDocument.identifier
      ? ((isNode = false), (identifier = 'the selection'))
      : ((isNode = true), (identifier = this.nodeToDocument.identifier))
    let docType
    switch (context.document.languageId) {
      case 'typescript':
      case 'typescriptreact':
        docType = isNode ? 'a TSDoc comment' : 'TSDoc comment'
        break
      case 'javascript':
      case 'javascriptreact':
        docType = isNode ? 'a JSDoc comment' : 'JSDoc comment'
        break
      case 'python':
        docType = 'docstring'
        break
      default:
        docType = 'documentation comment'
    }
    return `Please add ${docType} for ${identifier}.`
  }
  static _sendExtractDocTelemetry(telemetryService, languageId, codeBlockLen, couldExtractDoc, timeSpentMs) {
    telemetryService.sendTelemetryEvent(
      'extractDoc',
      { languageId: languageId, couldExtractDoc: couldExtractDoc === void 0 ? 'false' : 'true' },
      { codeBlockLen: codeBlockLen, timeSpentMs: timeSpentMs }
    )
  }
}
var requestLight = handleDefaultExports(requestLight())
var EXPLANATION_PROMPT = 'Write an explanation for the active selection as paragraphs of text.',
explanationOptions = {
  systemPromptOptions: {
    includeCodeGenerationRules: false,
    roleplay:
      'You are a world-class coding tutor. Your code explanations perfectly balance high-level concepts and granular details. Your approach ensures that students not only understand how to write code, but also grasp the underlying principles that guide effective programming.',
  },
  rules: `
Think step by step:
1. Examine the provided code selection and any other context like user question, related errors, project details, class definitions, etc.
2. If you are unsure about the code, concepts, or the user's question, ask clarifying questions.
3. If the user provided a specific question or error, answer it based on the selected code and additional provided context. Otherwise focus on explaining the selected code.
4. Provide suggestions if you see opportunities to improve code readability, performance, etc.

Focus on being clear, helpful, and thorough without assuming extensive prior knowledge.
Use developer-friendly terms and analogies in your explanations.
Identify 'gotchas' or less obvious parts of the code that might trip up someone new.
Provide clear and relevant examples aligned with any provided context.
`.trim(),
  contextResolvers: [currentSelectionContextResolver, bY, contextResolverRegistry],
  turnFilter: turn => turn.map(message => (message.request.message.startsWith(EXPLANATION_PROMPT) && (message.request.message = EXPLANATION_PROMPT), message)),
},
DefaultPanelPromptCrafter = class {
  constructor(context) {
    this.defaultPanelPromptCrafter = new ChatBuilder(context, explanationOptions, 2, undefined)
  }
  async buildPrompt(conversation, endpoint, context, reporter, prompt, message) {
    return this.defaultPanelPromptCrafter.buildPrompt(conversation, endpoint, context, reporter, prompt, message)
  }
},
ExplainIntent = class {
  constructor() {
    this.id = 'explain'
    this.locations = [2, 1]
    this.description = requestLight.t('Explain how the selected code works')
    this.intentDetectionInput = { sampleQuestion: 'Write an explanation for the code above as paragraphs of text.' }
  }
  static {
    this.ID = 'explain'
  }
  async invoke(context, request, workspace) {
    let location = request.location,
      endpointInfo = await getChatEndpointInfo(context, location, this.id)
    if (location === 1) {
      let documentContext = request.documentContext,
        customChatBuilder = new (class extends ChatBuilder {
          async buildPrompt(conversation, endpoint, context, reporter, prompt, message) {
            let latestTurn = conversation.getLatestTurn()
            if (latestTurn?.request.message === '') {
              latestTurn.request = { message: EXPLANATION_PROMPT, type: 'user' }
            }
            return super.buildPrompt(conversation, endpoint, context, reporter, prompt, message)
          }
        })(context, explanationOptions, 1, documentContext),
        replyInterpreterFactory = documentContext && StreamProcessor.createFactory()
      return { intent: this, location: location, endpoint: endpointInfo, promptCrafter: customChatBuilder, createReplyInterpreter: replyInterpreterFactory }
    }
    return { intent: this, location: location, endpoint: endpointInfo, promptCrafter: new DefaultPanelPromptCrafter(context) }
  }
  async asSlashCommand(context, request) {
    return { command: this.id, detail: this.description, refer: context.get(ConfigManager).getConfig(settings.ExplainIntentRefer) }
  }
}
var vscode = require('vscode')

function registerCommandWithTelemetry(context, commandId, commandHandler) {
  let command = vscode.commands.registerCommand(commandId, async (...args) => {
    try {
      return await commandHandler(...args)
    } catch (error) {
      context.get(IGHTelemetryService).sendExceptionTelemetry(error, commandId)
    }
  })
  context.get(extensionContext).subscriptions.push(command)
}
var vscode = handleDefaultExports(require('vscode'))

var AIAction = class extends vscode.CodeAction {
    constructor() {
      super(...arguments)
      this.isAI = true
    }
  },
  CodeActionProvider = class {
    constructor(accessor) {
      this.accessor = accessor
    }
    static {
      this.providedCodeActionKinds = [vscode.CodeActionKind.QuickFix]
    }
    static getSevereDiagnostics(diagnostics) {
      let severeDiagnostics = diagnostics.filter(diagnostic => diagnostic.severity <= vscode.DiagnosticSeverity.Warning)
      return severeDiagnostics.length === 0 ? [] : severeDiagnostics
    }
    static getDiagnosticsAsText(diagnostics) {
      return diagnostics.map(diagnostic => diagnostic.message).join(', ')
    }
    async provideCodeActions(document, range, context) {
      if (!vscode.workspace.getConfiguration('github.copilot.editor').get('enableCodeActions')) return
      let actions = []
      if (!vscode.window.activeTextEditor) return actions
      let severeDiagnostics = CodeActionProvider.getSevereDiagnostics(context.diagnostics)
      if (severeDiagnostics.length === 0) return actions
      let unionRange = severeDiagnostics.map(diagnostic => diagnostic.range).reduce((range, current) => range.union(current)),
        selection = new vscode.Selection(unionRange.start, unionRange.end),
        diagnosticsText = CodeActionProvider.getDiagnosticsAsText(severeDiagnostics),
        fixAction = new AIAction(vscode.l10n.t('Fix using Copilot'), vscode.CodeActionKind.QuickFix)
      fixAction.diagnostics = severeDiagnostics
      fixAction.command = {
          title: fixAction.title,
          command: 'vscode.editorChat.start',
          arguments: [{ autoSend: true, message: `/fix ${diagnosticsText}`, position: unionRange.start, initialSelection: selection, initialRange: unionRange }],
        }
      let explainAction = new AIAction(vscode.l10n.t('Explain using Copilot'), vscode.CodeActionKind.QuickFix)
      explainAction.diagnostics = severeDiagnostics
      let explainCommand = `/explain ${diagnosticsText}`
      if (this.accessor.get(ConfigManager).getConfig(settings.ExplainIntentRefer)) {
        explainCommand = `@${exampleDialogue} ${explainCommand}`
      }
      explainAction.command = { title: explainAction.title, command: 'github.copilot.interactiveEditor.explain', arguments: [explainCommand] }
      actions.push(fixAction, explainAction)
      return actions
    }
  }

var RefactorProvider = class {
  static {
    this.providedCodeActionKinds = [vscode.CodeActionKind.RefactorRewrite]
  }
  constructor(serviceProvider) {
    this.logger = serviceProvider.get(LoggerManager).getLogger('RefactorsProvider')
    this.ghTelemetryService = serviceProvider.get(IGHTelemetryService)
  }
  async provideCodeActions(document, range, context) {
    if (!vscode.workspace.getConfiguration('github.copilot.editor').get('enableCodeActions')) return
    let generateActions = this.provideGenerateUsingCopilotCodeAction(document, range)
    return [...(await this.provideDocumentUsingCopilotCodeAction(document, range)), ...generateActions]
  }
  provideGenerateUsingCopilotCodeAction(document, range) {
    let action
    if (range.isEmpty) {
      let lineText = document.lineAt(range.start.line).text
      if (/^\s*$/g.test(lineText)) {
        action = new AIAction(vscode.l10n.t('Generate using Copilot'), vscode.CodeActionKind.RefactorRewrite)
      }
    } else {
      let rangeText = document.getText(range)
      if (!/^\s*$/g.test(rangeText)) {
        action = new AIAction(vscode.l10n.t('Modify using Copilot'), vscode.CodeActionKind.RefactorRewrite)
      }
    }
    return action === undefined
      ? []
      : [this.createActionCommand(action, range)]
  }
  createActionCommand(action, range) {
    action.command = {
      title: action.title,
      command: 'vscode.editorChat.start',
      arguments: [{ position: range.start, initialSelection: range, initialRange: range }],
    }
    return action
  }
  async provideDocumentUsingCopilotCodeAction(document, range) {
    let startIndex = document.offsetAt(range.start),
      endIndex = document.offsetAt(range.end),
      indexRange = { startIndex: startIndex, endIndex: endIndex },
      documentableNode
    try {
      documentableNode = await getDocumentableNodeIfOnIdentifier(document.languageId, document.getText(), indexRange)
    } catch (error) {
      this.logger.exception(error, 'RefactorsProvider: getDocumentableNodeIfOnIdentifier failed')
      this.ghTelemetryService.sendExceptionTelemetry(
        error,
        'RefactorsProvider: getDocumentableNodeIfOnIdentifier failed'
      )
    }
    if (documentableNode === undefined) return []
    let actionTitle = vscode.l10n.t('Document using Copilot: {0}', documentableNode.identifier),
      action = new AIAction(actionTitle, vscode.CodeActionKind.RefactorRewrite),
      nodeRange =
        documentableNode.nodeRange === undefined
          ? undefined
          : new VscodeRange(document.positionAt(documentableNode.nodeRange.startIndex), document.positionAt(documentableNode.nodeRange.endIndex))
    action.command = {
      title: actionTitle,
      command: 'vscode.editorChat.start',
      arguments: [{ autoSend: true, message: '/doc', initialRange: nodeRange }],
    }
    return [action]
  }
}
var util = require('util'),
vscode = handleDefaultExports(require('vscode'))
var ERROR_MIME_TYPE = 'application/vnd.code.notebook.error'
var CellStatusBarProvider = class {
  constructor(serviceAccessor) {
    this.serviceAccessor = serviceAccessor
  }
  async provideCellStatusBarItems(cell, token) {
    let errorOutput = cell.outputs.flatMap(output => output.items).find(item => item.mime === ERROR_MIME_TYPE)
    if (!errorOutput) return []
    let error
    try {
      let decoder = new util.TextDecoder()
      error = JSON.parse(decoder.decode(errorOutput.data))
      if (!error.name && !error.message) return []
      let actionTitle = 'Fix using Copilot',
        errorMessage = [error.name, error.message]
          .filter(Boolean)
          .join(': ')
          .replace(/\s*\(\S+,\s*line\s*\d+\)/, '')
      return [
        {
          text: '$(sparkle)',
          alignment: vscode.NotebookCellStatusBarAlignment.Left,
          priority: Number.MAX_SAFE_INTEGER - 1,
          tooltip: actionTitle,
          command: {
            title: actionTitle,
            command: 'vscode.editorChat.start',
            arguments: [{ autoSend: true, message: `/fix ${errorMessage}` }],
          },
        },
      ]
    } catch (parseError) {
      this.serviceAccessor.get(LoggerManager).defaultLogger.error(`Failed to parse error output ${parseError}`)
    }
    return []
  }
}
function registerCommands(context) {
  let explainCommand = input => {
      let message = `@${exampleDialogue} /explain `
      if (typeof input == 'string' && input) message = input
      else {
        let currentSelection = CurrentSelectionContextResolver.getCurrentSelection(context.get(BaseTabManager))
        if (currentSelection) {
          let diagnostics = vscode.languages.getDiagnostics(currentSelection.activeDocument.uri),
            intersectingDiagnostics = diagnostics.filter(diagnostic => !!diagnostic.range.intersection(currentSelection.range))
            CodeActionProvider.getSevereDiagnostics(intersectingDiagnostics).length
            ? (message += CodeActionProvider.getDiagnosticsAsText(diagnostics))
            : ((message += EXPLANATION_PROMPT), (message += CurrentSelectionContextResolver.formatSelection({ languageId: currentSelection.languageId, selectedText: currentSelection.selectedText })))
        }
      }
      vscode.interactive.sendInteractiveRequestToProvider('copilot', { message: message })
    },
    generateCommand = () => vscode.commands.executeCommand('vscode.editorChat.start', { message: '/generate ' }),
    generateDocsCommand = () =>
    vscode.commands.executeCommand('vscode.editorChat.start', {
        message: `/${DocumentationCommand.ID} `,
        autoSend: true,
        initialRange: vscode.window.activeTextEditor?.selection,
      }),
    generateTestsCommand = () =>
    vscode.commands.executeCommand('vscode.editorChat.start', {
        message: '/tests ',
        autoSend: true,
        initialRange: vscode.window.activeTextEditor?.selection,
      }),
    fixCommand = () => {
      let activeEditor = vscode.window.activeTextEditor
      if (!activeEditor) return
      let selection = activeEditor.selection,
        diagnostics = vscode.languages
          .getDiagnostics(activeEditor.document.uri)
          .filter(diagnostic => !!selection.intersection(diagnostic.range))
          .map(diagnostic => diagnostic.message)
          .join(', ')
      return vscode.commands.executeCommand('vscode.editorChat.start', {
        message: `/fix ${diagnostics}`,
        autoSend: true,
        initialRange: vscode.window.activeTextEditor?.selection,
      })
    }
  try {
    registerCommandWithTelemetry(context, 'github.copilot.interactiveEditor.explain', explainCommand),
    registerCommandWithTelemetry(context, 'github.copilot.interactiveEditor.generate', generateCommand),
      registerCommandWithTelemetry(context, 'github.copilot.interactiveEditor.generateDocs', generateDocsCommand),
      registerCommandWithTelemetry(context, 'github.copilot.interactiveEditor.generateTests', generateTestsCommand),
      registerCommandWithTelemetry(context, 'github.copilot.interactiveEditor.fix', fixCommand)
  } catch (error) {
    context.get(LoggerManager).defaultLogger.exception(error, 'Could not register explain command'),
      context.get(IGHTelemetryService).sendExceptionTelemetry(error, 'Could not register explain command')
  }
  context.get(extensionContext).subscriptions.push(
    vscode.languages.registerCodeActionsProvider('*', new CodeActionProvider(context), { providedCodeActionKinds: CodeActionProvider.providedCodeActionKinds }),
    vscode.languages.registerCodeActionsProvider('*', new RefactorProvider(context), { providedCodeActionKinds: RefactorProvider.providedCodeActionKinds }),
    vscode.notebooks.registerNotebookCellStatusBarItemProvider('jupyter-notebook', new CellStatusBarProvider(context))
  )
}
var crypto = require('crypto'),
vscode = handleDefaultExports(require('vscode'))
var vscode = require('vscode')
var userReadScope = ['read:user'],
userEmailScope = ['user:email'],
fullScopes = ['read:user', 'user:email', 'repo', 'workflow'],
notSignedInMessage = 'You are not signed in to GitHub. Please sign in to use Copilot.'

function getAuthProvider(configManager) {
  return configManager.getConfig(settings.AuthProvider) === 'github-enterprise' ? 'github-enterprise' : 'github'
}

async function handleProvider(provider, serviceManager) {
  let authProvider = getAuthProvider(serviceManager.get(ConfigManager))
  if (provider.id === authProvider) {
    let { defaultLogger: logger } = serviceManager.get(LoggerManager)
    if (await vscode.authentication.getSession(authProvider, userEmailScope, { silent: true }))
      return await serviceManager.get(BaseTokenHandler).getCopilotToken(serviceManager, true)
    serviceManager.get(BaseTokenHandler).resetCopilotToken(serviceManager), logger.warn(notSignedInMessage)
  }
}

async function getSessionWithMinimalScope(configManager) {
  let authProvider = getAuthProvider(configManager)
  return (
    (await vscode.authentication.getSession(authProvider, userEmailScope, { silent: true })) ??
    (await vscode.authentication.getSession(authProvider, userReadScope, { silent: true }))
  )
}

async function getSessionWithFullScope(configManager, options) {
  let authProvider = getAuthProvider(configManager)
  return await vscode.authentication.getSession(authProvider, fullScopes, options)
}

var crypto = require('crypto'),
util = handleDefaultExports(require('util')),
vscode = require('vscode')
var agentMap = new Map()

async function initializeExtension(contextManager) {
  contextManager.get(extensionContext).subscriptions.push(new vscode.Disposable(() => agentMap.forEach(agent => agent.dispose()))), loadAgents(contextManager)
}

var supportedAgents = ['docs', 'datastax'],
  MP
async function loadAgents(contextManager) {
  return agentPromise || (agentPromise = fetchAgents(contextManager)), agentPromise.finally(() => (agentPromise = undefined))
}
async function fetchAgents(contextManager) {
  let logger = contextManager.get(LoggerManager).getLogger('RemoteAgents')
  if (!contextManager.get(ConfigManager).getConfig(settings.EnableRemoteAgents)) return
  let agentsEndpointUrl = contextManager.get(ConfigManager).getConfig(settings.AgentsEndpointUrl),
    existingAgents = new Set(agentMap.keys())
  try {
    let token = await contextManager.get(BaseTokenHandler).getBasicGitHubToken(),
      response = await (
        await contextManager
          .get(ConnectionSettings)
          .fetch(`${agentsEndpointUrl}/agents`, {
            method: 'GET',
            headers: { Authorization: util.format('Bearer %s', token), ...contextManager.get(BuildInfo).getEditorVersionHeaders() },
          })
      ).text(),
      agents
    try {
      agents = JSON.parse(response).agents
    } catch (error) {
      logger.warn(`Invalid remote agent response: ${response} (${error})`)
      return
    }
    for (let agent of agents) supportedAgents.includes(agent.slug) && (existingAgents.delete(agent.slug) || agentMap.set(agent.slug, createChatAgent(contextManager, logger, agent, agentsEndpointUrl)))
  } catch (error) {
    logger.warn(`Failed to load remote slash commands: ${error}`)
  }
  for (let agent of existingAgents) agentMap.get(agent).dispose(), agentMap.delete(agent)
}

function createChatAgent(contextManager, logger, agentInfo, agentsEndpointUrl) {
  let chatAgent = vscode.chat.createChatAgent(agentInfo.slug, async (chat, user, reporter, cancellation) => {
    try {
      let engineService = new EngineService(agentsEndpointUrl, `agents/${agentInfo.slug}?chat`, 'copilot-chat', 4096),
        resolvedPrompt = await contextManager.get(BaseVariableResolver).resolveVariablesInPrompt(chat.prompt, chat.variables),
        response = await contextManager.get(DataRetriever).fetchMany(
          [{ role: 'user', content: resolvedPrompt.message, intent: 'conversation' }],
          async (role, message, result) => {
            reporter.report({ content: result.text })
          },
          cancellation,
          2,
          engineService,
          { secretKey: await contextManager.get(BaseTokenHandler).getBasicGitHubToken() }
        )
      return response.type !== 'success'
        ? (logger.warn(`Bad response from /agents/${agentInfo.slug}: ${response.type} ${response.reason}`),
          response.reason.includes('400 no docs found')
            ? { errorDetails: { message: 'No docs found' } }
            : { errorDetails: { message: response.reason } })
        : {}
    } catch (error) {
      return logger.warn(`/agents/${agentInfo.slug} failed: ${error}`), {}
    }
  })
  return (
    (chatAgent.description = agentInfo.description),
    (chatAgent.fullName = agentInfo.name),
    (chatAgent.agentVariableProvider = {
      triggerCharacters: ['#'],
      provider: {
        async provideCompletionItems(chat, position) {
          return (await fetchCompletionItems(contextManager, agentInfo.slug, chat, logger, position)).map(item => {
            let completionItem = new vscode.ChatAgentCompletionItem('#' + item, [
              { value: '#' + item, level: vscode.ChatVariableLevel.Full, description: '', kind: 'github.docset' },
            ])
            return (completionItem.insertText = '#' + item.replace(/ /g, '')), completionItem
          })
        },
      },
    }),
    chatAgent
  )
}

async function fetchAutocompleteItems(contextManager, agentSlug, query, logger, position) {
  let requestParams = {
    url: `${contextManager.get(ConfigManager).getConfig(settings.AgentsEndpointUrl)}/agents/autocomplete`,
    modelMaxTokenWindow: 0
  }
  query.startsWith('#') && (query = query.substring(1))
  let token = await contextManager.get(BaseTokenHandler).getBasicGitHubToken(),
    responseText = await (await sendRequest(contextManager, requestParams, token ?? '', void 0, (0, crypto.randomUUID)(), { agents: [agentSlug], query: query }, position)).text()
  try {
    let parsedResponse = JSON.parse(responseText)
    if (parsedResponse === null) return []
    if (!Array.isArray(parsedResponse)) throw new Error('Expected array')
    return parsedResponse.map(item => item.metadata.display_name)
  } catch (error) {
    return logger.warn(`Invalid autocomplete response (${error.toString()}): ${responseText}`), []
  }
}

var ChatSessionManager = class {
  constructor(serviceAccessor, options) {
    this.serviceAccessor = serviceAccessor
    this.options = options
    this.hasShownWelcomeMessage = false
    this.isInternal = false
  }
  getLastSession() {
    return this.lastSession
  }
  async prepareSession(session) {
    if (!this.username) {
      let session = await getSessionWithMinimalScope(this.serviceAccessor.get(ConfigManager))
      this.isInternal = (await this.serviceAccessor.get(BaseTokenHandler).getCopilotToken(this.serviceAccessor))?.isInternal
      this.username = session?.account?.label
    }
    loadAgents(this.serviceAccessor)
    let sessionId = (0, crypto.randomUUID)(),
      chatLogger = new ChatLogger(this.serviceAccessor, () => vscode.window.createOutputChannel('GitHub Copilot Chat Conversation', { log: true })),
      conversationManager = new CopilotConversationManager(this.serviceAccessor, this.options, this.username, chatLogger, this.isInternal, sessionId)
    return (this.lastSession = conversationManager), conversationManager
  }
  async provideSampleQuestions(session) {
    let questions =
      vscode.window.activeNotebookEditor || vscode.window.activeTextEditor
        ? generateWorkspaceQuestions()
        : generateHelpQuestion([['', '/help', vscode.l10n.t('What can you do?')]])
    return displaySuggestions([...questions], this.serviceAccessor, 'welcome'), questions
  }
  async provideWelcomeMessage(session) {
    let feedbackUrl = generateFeedbackUrl(),
      welcomeMessageSetting = this.serviceAccessor.get(ConfigManager).getConfig(settings.WelcomeMessage),
      aiDisclaimer = vscode.l10n.t({
        message:
          "I'm powered by AI, so surprises and mistakes are possible. Make sure to verify any generated code or suggestions, and [share feedback]({0}) so that we can learn and improve. Check out the [{1} documentation]({2}) to learn more.",
        args: [feedbackUrl, 'Copilot', 'https://code.visualstudio.com/docs/editor/github-copilot#_chat-view'],
        comment: [
          "{Locked=']({'}",
          'the [text](url) is a markdown link syntax. Do not add any additional spaces between ] and (',
        ],
      }),
      usernamePrefix = this.username ? ' **@' + this.username + '**' : ''
    if (welcomeMessageSetting === 'never' || (this.hasShownWelcomeMessage && welcomeMessageSetting === 'first'))
      return [vscode.l10n.t('Hi{0}, how can I help you?', usernamePrefix)]
    this.hasShownWelcomeMessage = true
    let inlineChatCommand = 'workbench.action.quickchat.launchInlineChat',
      inlineChatPrompt =
        vscode.window.activeNotebookEditor || vscode.window.activeTextEditor
          ? vscode.l10n.t('You can also [start an inline chat session]({0}).', `command:${inlineChatCommand}`)
          : '',
      welcomeMessage = new vscode.MarkdownString(
        vscode.l10n.t("Welcome,{0}, I'm your {1} and I'm here to help you get things done faster. {2}", usernamePrefix, 'Copilot', inlineChatPrompt)
      )
    return (welcomeMessage.isTrusted = { enabledCommands: [inlineChatCommand] }), [welcomeMessage, aiDisclaimer]
  }
}

function displaySuggestions(suggestions, accessor, type) {
  suggestions.map(suggestion => {
    displaySuggestion(accessor, suggestion.message, type, suggestion.metadata.suggestionId, vscode.window.activeTextEditor?.document)
  })
}

function generateFeedbackUrl() {
  return 'https://aka.ms/microsoft/vscode-copilot-release'
}

function generateWorkspaceQuestions() {
  let workspacePrefix = '@workspace '
  return generateHelpQuestion([
    [workspacePrefix, '/fix', vscode.l10n.t('the problems in my code')],
    [workspacePrefix, '/tests', vscode.l10n.t('add unit tests for my code')],
    [workspacePrefix, '/explain', vscode.l10n.t('how the selected code works')],
  ])
}

function generateHelpQuestion(questions) {
  return questions.map(([prefix, command, description]) => ({
    message: prefix + command + ' ',
    title: command + ' ' + description,
    metadata: { messageId: 'welcome', suggestionId: (0, crypto.randomUUID)(), suggestionType: 'Follow-up from model' },
  }))
}

var path = require('path'),
util = require('util'),
vscode = require('vscode')
var vscode = require('vscode'),
var ReadOnlyFileSystem = class {
  constructor(contentManager) {
    this.contentManager = contentManager
    this._onDidChangeFile = new vscode.EventEmitter()
    this.onDidChangeFile = this._onDidChangeFile.event
  }
  async stat(uri) {
    let file = this.contentManager.get(uri.authority, uri.path)
    if (!file) throw vscode.FileSystemError.FileNotFound(uri)
    let size = (await file.content?.then(content => content?.length)) ?? 0
    return {
      ctime: file.ctime ?? 0,
      mtime: file.ctime ?? 0,
      size: size,
      type: file.children ? vscode.FileType.Directory : vscode.FileType.File,
      permissions: vscode.FilePermission.Readonly,
    }
  }
  readDirectory(uri) {
    let directory = this.contentManager.get(uri.authority, uri.path)
    if (!directory) throw vscode.FileSystemError.FileNotFound(uri)
    return directory.children?.map(child => [child.label, child.children ? vscode.FileType.Directory : vscode.FileType.File]) ?? []
  }
  async readFile(uri) {
    let file = this.contentManager.get(uri.authority, uri.path)
    if (!file) throw vscode.FileSystemError.FileNotFound(uri)
    let content
    try {
      content = await file.content
    } catch {}
    return content ?? new Uint8Array()
  }
  watch(uri, options) {
    return { dispose() {} }
  }
  createDirectory(uri) {
    throw vscode.FileSystemError.NoPermissions(uri)
  }
  writeFile(uri, content, options) {
    throw vscode.FileSystemError.NoPermissions(uri)
  }
  delete(uri, options) {
    throw vscode.FileSystemError.NoPermissions(uri)
  }
  rename(source, target, options) {
    throw vscode.FileSystemError.NoPermissions(target)
  }
  copy(source, target, options) {
    throw vscode.FileSystemError.NoPermissions(target)
  }
}
function registerCopilotCommands(contextManager, extensionContext) {
  return (
    processWorkspaceErrors(contextManager, extensionContext),
    vscode.Disposable.from(
      vscode.workspace.registerFileSystemProvider('vscode-copilot-workspace', new ReadOnlyFileSystem(contextManager.get(ProjectManager)), {
        isReadonly: new Jvscodee.MarkdownString(
          vscode.l10n.t(`This file preview was generated by Copilot and may contain surprises or mistakes.

Ask followup questions to refine it, then press Create Workspace.`)
        ),
      }),
      vscode.commands.registerCommand('github.copilot.createProject', async (fileSystemItems, paths, i, o, workspaceUri) => {
        let lastInteractiveSession = contextManager.get(ChatEngine).getLastInteractiveSession(),
          parentFolder = (
            await vscode.window.showOpenDialog({
              canSelectFolders: true,
              canSelectFiles: false,
              canSelectMany: false,
              openLabel: 'Select as Parent Folder',
            })
          )?.[0]
        if (!parentFolder) return
        let originalPath = paths[0].path,
          newPath = await generateUniqueName(parentFolder, originalPath),
          pathRegex = new RegExp(originalPath, 'g'),
          tabsToClose = []
          vscode.window.tabGroups.all.forEach(tabGroup => {
          tabGroup.tabs.forEach(tab => {
            tab.input instanceof vscode.TabInputText && tab.input.uri.scheme === 'vscode-copilot-workspace' && tabsToClose.push(tab)
          })
        }),
        vscode.window.tabGroups.close(tabsToClose, true),
          await vscode.window.withProgress(
            { location: vscode.ProgressLocation.Notification, cancellable: true },
            async (progress, cancellationToken) => {
              for (let item of paths) {
                let itemPath = item.path.replace(pathRegex, newPath),
                  itemUri = vscode.Uri.joinPath(parentFolder, itemPath)
                switch (item.type) {
                  case 'folder': {
                    progress.report({ message: vscode.l10n.t('Creating folder {0}...', itemPath) }),
                      await vscode.workspace.fs.createDirectory(itemUri)
                    break
                  }
                  case 'file': {
                    progress.report({ message: vscode.l10n.t('Creating file {0}...', itemPath) })
                    let sourceUri = generateUri(workspaceUri, item.path),
                      fileContent = await vscode.workspace.fs.readFile(sourceUri),
                      targetUri = vscode.Uri.joinPath(parentFolder, itemPath)
                    await vscode.workspace.fs.writeFile(targetUri, Buffer.from(fileContent))
                    break
                  }
                  default:
                    break
                }
              }
              let workspacePath = vscode.Uri.joinPath(parentFolder, newPath)
              lastInteractiveSession !== void 0 && vscode.interactive.transferChatSession(lastInteractiveSession, workspacePath),
                contextManager
                  .get(LoggerManager)
                  .getLogger('newIntent')
                  .info('Opening folder: ' + workspacePath.fsPath)
              let globalState = extensionContext.globalState,
                generatedWorkspaceUris = globalState.get('CopilotGeneratedWorkspaceUris', [])
              await globalState.update('CopilotGeneratedWorkspaceUris', [...generatedWorkspaceUris, workspacePath.toString()])
              try {
                await updateWorkspaceList(workspacePath)
              } catch {}
              await vscode.commands.executeCommand('vscode.openFolder', workspacePath)
            }
          )
      })
    )
  )
}

async function processWorkspaceErrors(contextManager, extensionContext) {
  let context = contextManager.get(extensionContext),
    workspaceUris = context.globalState.get('CopilotGeneratedWorkspaceUris', []),
    workspaceUri = vscode.workspace.workspaceFolders?.[0]?.uri.toString()
  if (!workspaceUri) return
  let [remainingUris, workspaceExists] = workspaceUris.reduce(([uris, exists], uri) => (uri === workspaceUri ? [uris, true] : [[...uris, uri], exists]), [[], false])
  if (workspaceExists) {
    let fileLimit = contextManager.get(ConfigManager).getConfig(settings.WorkspaceExperimentalFileLimit)
    if (fileLimit <= 0) return
    let documents = await getDocuments(vscode.Uri.parse(workspaceUri), fileLimit),
      workspaceEdit = new vscode.WorkspaceEdit(),
      cancellationToken = new vscode.CancellationTokenSource().token
    for (let document of documents) {
      let diagnostics = await getDiagnostics(document.uri, cancellationToken)
      if (!diagnostics.length) continue
      let edits = await processErrorAndFix(contextManager, extensionContext, document, diagnostics[0], cancellationToken)
      edits && workspaceEdit.set(document.uri, edits)
    }
    let applyFixes = vscode.l10n.t('Apply Fixes')
    if (workspaceEdit.size > 0) {
      if (
        (await vscode.window.showInformationMessage(
          vscode.l10n.t('We detected errors in your project. Would you like to apply the suggested fixes?'),
          applyFixes
        )) !== applyFixes
      )
        return
      await vscode.workspace.applyEdit(workspaceEdit)
    }
    await context.globalState.update('CopilotGeneratedWorkspaceUris', remainingUris)
  }
}

async function getDiagnostics(uri, cancellationToken, timeout = 5000) {
  let cancellationListener, timer
  return new Promise(resolve => {
    cancellationListener = cancellationToken.onCancellationRequested(resolve)
    let diagnosticsListener
    timer = setTimeout(() => {
      diagnosticsListener?.dispose(), resolve([])
    }, timeout),
      new Promise(resolveDiagnostics => {
        diagnosticsListener = vscode.languages.onDidChangeDiagnostics(async event => {
          if (event.uris.map(String).includes(uri.toString())) {
            let diagnostics = vscode.languages.getDiagnostics(uri)
            if (diagnostics.length > 0) {
              let relevantDiagnostics = diagnostics.filter(diagnostic => isErrorWithSuggestion(diagnostic))
              resolveDiagnostics(relevantDiagnostics)
            }
          } else resolveDiagnostics([])
        })
      }).then(diagnostics => {
        diagnosticsListener?.dispose(), resolve(diagnostics)
      })
  }).finally(() => {
    cancellationListener.dispose(), clearTimeout(timer)
  })
}

var ignoredExtensions = ['.txt', '.md', '.json', '.ini', '.lock', '.gitignore', '.gitattributes', '.env']

async function getDocuments(directoryUri, limit, documents = []) {
  let directoryEntries = await vscode.workspace.fs.readDirectory(directoryUri)
  for (let [entryName, entryType] of directoryEntries) {
    if (documents.length > limit) break
    if (entryType === vscode.FileType.File && !ignoredExtensions.includes(path.extname(entryName))) {
      let fileUri = vscode.Uri.joinPath(directoryUri, entryName),
        textDocument = await vscode.window.showTextDocument(fileUri)
      documents.push(textDocument.document)
    } else if (entryType === vscode.FileType.Directory) {
      await getDocuments(vscode.Uri.joinPath(directoryUri, entryName), limit, documents)
    }
  }
  return documents
}

function isErrorWithSuggestion(diagnostic) {
  return diagnostic.severity === vscode.DiagnosticSeverity.Error && diagnostic.message.includes('Did you mean')
}

async function generateUniqueName(directory, baseName) {
  let counter = 0,
    isUnique = true,
    name = baseName
  while (isUnique) {
    try {
      await vscode.workspace.fs.stat(vscode.Uri.joinPath(directory, name)), (name = baseName + '-' + ++counter)
    } catch {
      isUnique = false
    }
  }
  return name
}

async function fileExists(fileUri) {
  try {
    await vscode.workspace.fs.stat(fileUri)
    return true
  } catch {
    return false
  }
}

async function updateWorkspaceList(workspaceUri) {
  let storageFileUri = getStorageFileUri()
  if (storageFileUri)
    if (await fileExists(storageFileUri)) {
      let fileContent = await vscode.workspace.fs.readFile(storageFileUri).then(buffer => new util.TextDecoder().decode(buffer)),
        workspaceList = JSON.parse(fileContent)
      workspaceList.push(workspaceUri.toString()), await vscode.workspace.fs.writeFile(storageFileUri, Buffer.from(JSON.stringify(workspaceList, null, 2)))
    } else await vscode.workspace.fs.writeFile(storageFileUri, Buffer.from(JSON.stringify([workspaceUri.toString()], null, 2)))
}

function getStorageFileUri() {
  let appName =
      vscode.env.appName.indexOf('Insider') > 0 || vscode.env.appName.indexOf('Code - OSS Dev') >= 0
        ? 'Code - Insiders'
        : 'Code',
    homeDirectory = vscode.Uri.file(process.env.HOME || (process.env.USERPROFILE ? process.env.USERPROFILE : ''))
  switch (process.platform) {
    case 'darwin':
      return vscode.Uri.joinPath(
        homeDirectory,
        'Library',
        'Application Support',
        appName,
        'User',
        'workspaceStorage',
        'aiGeneratedWorkspaces.json'
      )
    case 'linux':
      return vscode.Uri.joinPath(homeDirectory, '.config', appName, 'User', 'workspaceStorage', 'aiGeneratedWorkspaces.json')
    case 'win32':
      return process.env.APPDATA
        ? vscode.Uri.joinPath(vscode.Uri.file(process.env.APPDATA), appName, 'User', 'workspaceStorage', 'aiGeneratedWorkspaces.json')
        : void 0
    default:
      return
  }
}

async function gatherWorkspaceInfo(container, symbolNames) {
  let tabManager = container.get(BaseTabManager),
    diagnosticWaiter = container.get(DiagnosticWaiter),
    symbolProvider = container.get(BaseSymbolProvider),
    workspace = container.get(WorkspaceClass),
    terminalInfoProvider = container.get(BaseTerminalInfoProvider),
    disposable = container.get(DisposableClass),
    gitRepoManager = container.get(BaseGitRepositoryManager),
    workspaceFoldersPaths = workspace.getWorkspaceFolders().map(folder => folder.fsPath + '/'),
    notebookDocumentsPaths = workspace.notebookDocuments.map(doc => doc.uri.fsPath),
    symbols = (await Promise.all(symbolNames.map(name => symbolProvider.getWorkspaceSymbols(name))))
      .flat()
      .map(symbol => ({
        name: symbol.name,
        kind: symbol.kind,
        containerName: symbol.containerName,
        filePath: symbol.location.uri.fsPath,
        start: symbol.location.range.start,
        end: symbol.location.range.end,
      })),
    activeFileDiagnostics = tabManager.activeTextEditor
      ? diagnosticWaiter
          .getDiagnostics(tabManager.activeTextEditor.document.uri)
          .map(diagnostic => ({
            start: diagnostic.range.start,
            end: diagnostic.range.end,
            message: diagnostic.message,
            severity: diagnostic.severity,
            relatedInformation: diagnostic.relatedInformation?.map(createDiagnosticInfo),
          }))
      : [],
    activeTextEditor = tabManager.activeTextEditor
      ? {
          selections:
            tabManager.activeTextEditor?.selections.map(selection => ({
              anchor: selection.anchor,
              active: selection.active,
              isReversed: selection.isReversed,
            })) ?? [],
          documentFilePath: tabManager.activeTextEditor?.document.uri.fsPath ?? '',
          visibleRanges: tabManager.activeTextEditor?.visibleRanges.map(range => ({ start: range.start, end: range.end })) ?? [],
          languageId: tabManager.activeTextEditor?.document.languageId ?? 'javascript',
        }
      : undefined,
    terminalLastCommand = terminalInfoProvider.terminalLastCommand
      ? {
          commandLine: terminalInfoProvider.terminalLastCommand.commandLine,
          cwd:
            typeof terminalInfoProvider.terminalLastCommand.cwd == 'object'
              ? terminalInfoProvider.terminalLastCommand.cwd.toString()
              : terminalInfoProvider.terminalLastCommand.cwd,
          exitCode: terminalInfoProvider.terminalLastCommand.exitCode,
          output: terminalInfoProvider.terminalLastCommand.output,
        }
      : undefined
  return {
    workspaceFoldersFilePaths,
    symbols,
    activeFileDiagnostics,
    activeTextEditor,
    debugConsoleOutput: disposable.consoleOutput,
    terminalBuffer: terminalInfoProvider.terminalBuffer,
    terminalLastCommand,
    terminalSelection: terminalInfoProvider.terminalSelection,
    terminalShellType: terminalInfoProvider.terminalShellType,
    repoContexts: gitRepoManager.repositories,
    notebookDocumentFilePaths: notebookDocumentsPaths,
  }
}
function createDiagnosticInfo(diagnostic) {
  return {
    filePath: diagnostic.location.uri.fsPath,
    start: diagnostic.location.range.start,
    end: diagnostic.location.range.end,
    message: diagnostic.message,
  }
}
var ChatEngine = class {
  constructor(serviceAccessor) {
    this.serviceAccessor = serviceAccessor
    this.logger = serviceAccessor.get(LoggerManager).getLogger('chat')
    this._enabled = false
    this._activated = false
    if (vscode.interactive?._version !== 1) {
      this.logger.warn('Not activating ConversationFeature- api version mismatch')
      return
    }
    this.registerCopilotTokenListener(serviceAccessor)
  }
  get enabled() {
    return this._enabled
  }
  set enabled(value) {
    if (value && !this.activated) {
      this.activated = true
    }
    vscode.commands.executeCommand('setContext', 'github.copilot.interactiveSession.disabled', !value)
    this._enabled = value
  }
  get activated() {
    return this._activated
  }
  set activated(value) {
    if (!this._activated && value) {
      let options = this.serviceAccessor.get(conversationOptions)
      this.registerProviders(options)
      this.registerCommands(options)
      this.registerRelatedInformationProviders()
      this.registerChatVariables()
    }
    this._activated = value
  }
  getLastInteractiveSession() {
    return this.interactiveSessionProvider?.getLastSession()
  }
  registerProviders(options) {
    try {
      let chatResponseProvider = vscode.chat.registerChatResponseProvider('copilot', new ChatResponseProvider(this.serviceAccessor), { name: 'gpt-3.5-turbo' })
      this.interactiveSessionProvider = new ChatSessionManager(this.serviceAccessor, options)
      let interactiveSessionProvider = vscode.interactive.registerInteractiveSessionProvider('copilot', this.interactiveSessionProvider)
      this.interactiveEditorSessionProvider = new CopilotInteractiveEditorSessionProvider(this.serviceAccessor, options.rejectionMessage)
      let interactiveEditorSessionProvider = vscode.interactive.registerInteractiveEditorSessionProvider(this.interactiveEditorSessionProvider, {
        supportReportIssue: this.serviceAccessor.get(ConfigManager).getConfig(settings.DebugReportFeedback),
      })
      registerCommands(this.serviceAccessor)
      this.serviceAccessor.get(extensionContext).subscriptions.push(chatResponseProvider, interactiveSessionProvider, interactiveEditorSessionProvider)
      if ('registerMappedEditsProvider' in vscode.chat) {
        vscode.chat.registerMappedEditsProvider('*', new EditProvider())
      }
      this.serviceAccessor
        .get(ChatAgentServiceIdentifier)
        .register(options)
        .catch(error => {
          this.logger.error('Registration of chat agents failed:', error.toString())
        })
    } catch (error) {
      this.logger.error('Registration of interactive providers failed:', error.toString())
    }
  }
  registerCommands(extensionAccessor) {
    let isBodyPresent = item => 'body' in item && (item.body instanceof vscode.MarkdownString || typeof item.body == 'string'),
    isRangePresent = item => 'range' in item && item.range instanceof vscode.Range
    this.accessor.get(extensionContext).subscriptions.push(
      vscode.commands.registerCommand('github.copilot.interactiveSession.feedback', async () =>
        vscode.env.openExternal(vscode.Uri.parse(generateFeedbackUrl()))
      ),
      vscode.commands.registerCommand('github.copilot.ghpr.applySuggestion', async (i, o) => {
        if (!isBodyPresent(i) || !isRangePresent(o)) return
        let s = i.body instanceof vscode.MarkdownString ? i.body.value : i.body
        await vscode.commands.executeCommand('vscode.editorChat.start', { initialRange: o.range, message: s, autoSend: !0 })
      }),
      vscode.commands.registerCommand('github.copilot.debug.workbenchState', async () => {
        let i = await vscode.window.showInputBox({
            prompt: 'Enter a comma-separated list of symbol queries. Can be left blank if not using WorkspaceSymbols',
          }),
          o = await vscode.window.showInputBox({
            prompt: 'Enter a file name - .state.json will be appended as the extension',
            value: 'workspaceState',
          })
        if (!o) return
        let s = await gatherWorkspaceInfo(this.accessor, i?.split(',') ?? [])
        if (!s) return
        let a = vscode.workspace.workspaceFolders?.[0].uri
        if (!a) return
        let l = vscode.Uri.joinPath(a, `${o}.state.json`),
          c = JSON.stringify(s, null, 2)
        ;(c = c.replace(new RegExp(`${a.fsPath}/`, 'g'), './')), vscode.workspace.fs.writeFile(l, Buffer.from(c))
      }),
      vscode.commands.registerCommand(
        'github.copilot.terminal.explainTerminalSelection',
        async () =>
          await vscode.commands.executeCommand('workbench.action.quickchat.toggle', { query: `@${terminal} #terminalSelection` })
      ),
      vscode.commands.registerCommand('github.copilot.terminal.explainTerminalSelectionContextMenu', () =>
        vscode.commands.executeCommand('github.copilot.terminal.explainTerminalSelection')
      ),
      vscode.commands.registerCommand(
        'github.copilot.terminal.explainTerminalLastCommand',
        async () =>
          await vscode.commands.executeCommand('workbench.action.quickchat.toggle', {
            query: `@${terminal} #terminalLastCommand`,
          })
      ),
      vscode.commands.registerCommand('github.copilot.terminal.suggestCommand', async () => {
        await vscode.commands.executeCommand('workbench.action.quickchat.toggle', { query: `@${terminal} `, isPartialQuery: !0 })
      }),
      vscode.commands.registerCommand('github.copilot.terminal.generateCommitMessage', async () => {
        let i = this.accessor.get(GitContextModelIdentifier),
          o = vscode.workspace.workspaceFolders
        if (!o?.length) return
        let s = o.length === 1 ? o[0].uri : await vscode.window.showWorkspaceFolderPick().then(f => f?.uri)
        if (!s) return
        let a = await i.getRepositoryDiff(s)
        if (!a?.length) {
          vscode.window.showInformationMessage('No changes to commit.')
          return
        }
        let l = new CancellationSource(),
          u = await new GitCommitMessageGenerator(this.accessor).generateGitCommitMessage(a, 3, l.token)
        if (!u || l.token.isCancellationRequested) return
        let d = `git commit -m "${u.replace(/"/g, '\\"').replace(/\\/g, '\\\\').replace(/\$/g, '\\$')}"`
        vscode.window.activeTerminal?.sendText(d, !1)
      }),
      vscode.commands.registerCommand('github.copilot.git.generateCommitMessage', async (i, o, s) => {
        await new GitCommitGenerator(this.accessor).run(i, s)
      }),
      vscode.commands.registerCommand(openRelativePathCommand, async i => {
        let o = vscode.workspace.workspaceFolders?.[0].uri
        if (!o) return
        let s = vscode.Uri.joinPath(o, i)
        if ((this.accessor.get(IMSTelemetryService).sendTelemetryEvent('panel.action.filelink'), await a(s)))
          await vscode.commands.executeCommand('revealInExplorer', s)
        else return vscode.commands.executeCommand('vscode.open', s)
        async function a(l) {
          if (s.path.endsWith('/')) return !0
          try {
            return (await vscode.workspace.fs.stat(l)).type === vscode.FileType.Directory
          } catch {
            return !1
          }
        }
      }),
      vscode.commands.registerCommand(openSymbolInFileCommand, async (i, o, s) => {
        if (((s ??= vscode.workspace.workspaceFolders?.[0].uri), !s)) return
        let a = vscode.Uri.joinPath(s, i),
          l = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', a)
        if (l) {
          let c = findSymbol(l, o)
          if ((this.accessor.get(IMSTelemetryService).sendTelemetryEvent('panel.action.symbollink', {}, { hadMatch: c ? 1 : 0 }), c)) {
            let u = c instanceof vscode.SymbolInformation ? c.location.range : c.selectionRange
            return vscode.commands.executeCommand('vscode.open', a, { selection: new vscode.Range(u.start, u.start) })
          }
        }
        return vscode.commands.executeCommand('vscode.open', a)
      }),
      addLinkifier((i, o, s) => {
        let a = /(?<!\[)`([^`\s]+)`(?!\])/g
        return new (class {
          constructor() {
            this.fileSymbols = new Lazy(async () => {
              let c = new ResourceSet()
              for (let p of i) c.add(Uri.isUri(p.anchor) ? p.anchor : p.anchor.uri)
              let u = new ResourceMap()
              return (
                await Promise.all(
                  Array.from(c, async p => {
                    let d = await timeoutPromise(
                      Promise.resolve(vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', p)),
                      5e3
                    )
                    d && u.set(p, d)
                  })
                ),
                u
              )
            })
            this.resolvedSymbols = new Map()
          }
          async linkify(c, u) {
            if (!o.length) return c
            let p = new Set()
            for (let [d, f] of c.matchAll(a)) this.resolvedSymbols.has(f) || p.add(f)
            if (p.size) {
              let d = await this.fileSymbols.value
              if (u?.isCancellationRequested) return c
              for (let f of p) {
                let m
                for (let [h, g] of d) {
                  let v = g && findSymbol(g, f)
                  if (v) {
                    m = v instanceof vscode.SymbolInformation ? v.location : new vscode.Location(h, v.range)
                    break
                  }
                }
                this.resolvedSymbols.set(f, m)
              }
            }
            return c.replace(a, (d, f) => {
              let m = this.resolvedSymbols.get(f)
              if (m) {
                let h = getRelativePath(o[0], m.uri)
                if (h) return createSymbolInFileLink(f, h)
              }
              return d
            })
          }
        })()
      }),
      registerNewNotebookCommand(this.accessor, extensionAccessor),
      registerCopilotCommands(this.accessor, extensionAccessor),
      createGitHubPRProvider(this.accessor),
      registerExecuteSearchCommand()
    )
  }
  registerRelatedInformationProviders() {
    this.accessor
      .get(extensionContext)
      .subscriptions.push(
        vscode.ai.registerRelatedInformationProvider(vscode.RelatedInformationType.CommandInformation, this.accessor.get(CommandRelatedInfoProvider)),
        vscode.ai.registerRelatedInformationProvider(vscode.RelatedInformationType.SettingInformation, this.accessor.get(SettingsRelatedInfoProvider))
      )
  }
  registerChatVariables() {
    this.accessor
      .get(VariableManager)
      .getVariables()
      .forEach(e => {
        this.accessor.get(extensionContext).subscriptions.push(
          vscode.chat.registerVariable(e.name, e.description ?? '', {
            resolve: async (r, n, i) => {
              let o = { endpoint: await getChatEndpointInfo(this.accessor, 3), message: n.message },
                s = await e.resolve(this.accessor, o, i)
              return s
                ? [
                    {
                      level: vscode.ChatVariableLevel ? vscode.ChatVariableLevel.Full : 'full',
                      value: s.userMessages.join(`

`),
                      description: '',
                    },
                  ]
                : []
            },
          })
        )
      })
  }
  registerCopilotTokenListener(e) {
    e.get(EventEmitter).on('onCopilotToken', (r, n) => {
      this.logger.info(`copilot token chat_enabled: ${n.chat_enabled}`), (this.enabled = n.chat_enabled ?? !1)
    })
  }
}
function registerNewNotebookCommand(serviceAccessor, chatEndpointProvider) {
  let configManager = serviceAccessor.get(ConfigManager)
  return vscode.commands.registerCommand('github.copilot.newNotebook', async notebookInfo => {
    let isImproving = configManager.getConfig(settings.NotebookIterativeImproving)
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification }, async progress => {
      let notebookData = new vscode.NotebookData([])
      notebookData.metadata = { custom: { cells: [], metadata: { orig_nbformat: 4 }, nbformat: 4, nbformat_minor: 2 } }
      let notebookDocument = await vscode.workspace.openNotebookDocument('jupyter-notebook', notebookData),
        notebookEditor = await vscode.window.showNotebookDocument(notebookDocument)
      progress.report({ message: vscode.l10n.t('Generating notebook...') })
      let description = notebookInfo.description,
        sections = notebookInfo.sections,
        chatEndpointInfo = await getChatEndpointInfo(serviceAccessor, 2)
      for (let section of sections) {
        let existingCode = notebookEditor.notebook
            .getCells()
            .filter(cell => cell.kind === vscode.NotebookCellKind.Code)
            .map(cell => cell.document.getText()).join(`
`),
          cancellationTokenSource = new vscode.CancellationTokenSource()
        progress.report({ message: vscode.l10n.t('Generating section "{0}"...', section.title) })
        let generatedCode = await generatePythonCodeForSection(serviceAccessor, chatEndpointInfo, chatEndpointProvider, description, section, existingCode, cancellationTokenSource.token)
        if (!generatedCode) return
        if (isImproving) {
          progress.report({ message: vscode.l10n.t('Improving code for section "{0}"...', section.title) })
          let improvedCode = await improvePythonCode(serviceAccessor, chatEndpointInfo, chatEndpointProvider, description, section, existingCode, generatedCode, cancellationTokenSource.token)
          if (!improvedCode) return
          generatedCode = improvedCode
        }
        let markdownCell = new vscode.NotebookCellData(
            vscode.NotebookCellKind.Markup,
            `# ${section.title}
${section.content}`,
            'markdown'
          ),
          codeCell = new vscode.NotebookCellData(vscode.NotebookCellKind.Code, generatedCode, 'python'),
          insertCellsEdit = vscode.NotebookEdit.insertCells(notebookDocument.cellCount, [markdownCell, codeCell]),
          workspaceEdit = new vscode.WorkspaceEdit()
        workspaceEdit.set(notebookDocument.uri, [insertCellsEdit]),
          await vscode.workspace.applyEdit(workspaceEdit),
          notebookEditor.revealRange(new vscode.NotebookRange(notebookDocument.cellCount - 1, notebookDocument.cellCount), vscode.NotebookEditorRevealType.Default),
          (notebookEditor.selection = new vscode.NotebookRange(notebookDocument.cellCount - 1, notebookDocument.cellCount))
      }
      progress.report({ increment: 100 })
    })
  })
}

function registerExecuteSearchCommand() {
  return vscode.commands.registerCommand('github.copilot.executeSearch', async searchParams => {
    let isFileFilterPresent = searchParams.filesToExclude.length > 0 || searchParams.filesToInclude.length > 0
    vscode.commands
      .executeCommand('workbench.view.search.focus')
      .then(() => vscode.commands.executeCommand('workbench.action.search.toggleQueryDetails', { show: isFileFilterPresent })),
      vscode.commands.executeCommand('workbench.action.findInFiles', searchParams)
  })
}

function createGitHubPRProvider(serviceAccessor) {
  return new GitHubPRProvider(serviceAccessor)
}

function findBestSymbolMatch(symbols, names) {
  if (!names.length) return
  let bestMatch
  for (let symbol of symbols)
    if (symbol.children) {
      let match = symbol.name === names[0] ? { symbol: symbol, matchCount: 1 } : undefined
      if (match) {
        let childMatch = findBestSymbolMatch(symbol.children, names.slice(1))
        childMatch && (match = { symbol: childMatch.symbol, matchCount: match.matchCount + childMatch.matchCount })
      }
      let childMatch = findBestSymbolMatch(symbol.children, names),
        finalMatch
      match && childMatch ? (finalMatch = match.matchCount >= childMatch.matchCount ? match : childMatch) : (finalMatch = match ?? childMatch),
        finalMatch && (!bestMatch || finalMatch.matchCount > bestMatch?.matchCount) && (bestMatch = finalMatch)
    } else symbol.name === names[0] && (bestMatch ??= { symbol: symbol, matchCount: 1 })
  return bestMatch
}

function findSymbol(symbols, name) {
  function extractNames(str) {
    return Array.from(str.matchAll(/[\w$][\w\d$]*/g), match => match[0])
  }
  return (findBestSymbolMatch(symbols, [name]) ?? findBestSymbolMatch(symbols, extractNames(name)))?.symbol
}

var vscode = handleDefaultExports(require('vscode'))
var separator = '---------------------------------',
class FeedbackReporter extends Reporter {
  constructor(accessor) {
    super();
    this.accessor = accessor;
  }

  async canReport() {
    const configManager = this.accessor.get(ConfigManager);
    const baseTokenHandler = this.accessor.get(BaseTokenHandler);
    const copilotToken = await baseTokenHandler.getCopilotToken(this.accessor);
    return configManager.getConfig(settings.DebugReportFeedback) && copilotToken?.isInternal;
  }

  async reportInline(chat, intent, parsedResponse) {
    if (!(await this.canReport())) return;
    const latestTurn = chat.getLatestTurn();
    if (!latestTurn) return;
    const intentBlock = intent ? this.embedCodeblock('INTENT', JSON.stringify(intent, null, '\t')) : '';
    const contextBlock = this.embedCodeblock(
      'CONTEXT',
      JSON.stringify(
        {
          document: intent.document.uri.toString(),
          fileIndentInfo: intent.fileIndentInfo,
          language: intent.language,
          wholeRange: intent.wholeRange,
          selection: intent.selection,
        },
        null,
        '\t'
      )
    );
    let promptMessagesBlock = '';
    const chatMessages = latestTurn.chatMessages;
    if (chatMessages && chatMessages.length > 0) {
      const messages = chatMessages.map(msg => this.embedCodeblock(msg.role.toUpperCase(), msg.content)).join('\n');
      promptMessagesBlock = `\t${separator}\n${this.headerSeparator()}PROMPT MESSAGES:\n${messages}`;
    } else {
      promptMessagesBlock = this.embedCodeblock(latestTurn.request.type.toUpperCase(), latestTurn.request.message);
    }
    const assistantBlock = this.embedCodeblock('ASSISTANT', latestTurn.response?.message || '');
    const parsedResponseBlock = this.embedCodeblock('Parsed response', JSON.stringify(parsedResponse, null, '\t'));
    const details = `${intentBlock}\n${contextBlock}\n${promptMessagesBlock}\n${assistantBlock}\n${parsedResponseBlock}\n`;
    const issueBody = `
* VS Code version: ${vscode.version}
* Language: ${vscode.env.language}

<details><summary>Details</summary>
<p>

${details}

</p>
</details>`;
    await this.reportIssue('Feedback for inline chat', issueBody);
  }

  embedCodeblock(header, content) {
    const formattedContent = this.bodySeparator() + content.split('\n').join(`\n${this.bodySeparator()}`);
    return `\t${separator}\n${this.headerSeparator()}${header}:\n${formattedContent}`;
  }

  headerSeparator() {
    return '\t';
  }

  bodySeparator() {
    return '\t\t';
  }

  async reportIssue(title, body) {
    const encodedTitle = encodeURIComponent(title);
    await vscode.env.clipboard.writeText(body);
    const encodedPrompt = encodeURIComponent('We have written the needed data into your clipboard because it was too large to send. Please paste.');
    const issueUrl = `https://github.com/microsoft/vscode-copilot/issues/new?title=${encodedTitle}&body=${encodedPrompt}`;
    vscode.env.clipboard.writeText(body);
    vscode.env.openExternal(vscode.Uri.parse(issueUrl));
  }
}
var vscode = handleDefaultExports(require('vscode')),
var GitExtensionHandler = class {
  constructor() {
    this._disposables = []
    this._disposables.push(...this.initializeGitExtensionApi())
  }
  initializeGitExtensionApi() {
    let disposables = [],
      gitExtension = vscode.extensions.getExtension('vscode.git'),
      activateExtension = async () => {
        let activatedExtension = await gitExtension.activate(),
          setGitApi = isEnabled => {
            this._gitExtensionApi = isEnabled ? activatedExtension.getAPI(1) : undefined
          }
        disposables.push(activatedExtension.onDidChangeEnablement(setGitApi)), setGitApi(activatedExtension.enabled)
      }
    if (gitExtension) activateExtension()
    else {
      let onExtensionChange = vscode.extensions.onDidChange(() => {
        if (!gitExtension && vscode.extensions.getExtension('vscode.git')) {
          gitExtension = vscode.extensions.getExtension('vscode.git');
          activateExtension();
          onExtensionChange.dispose();
        }
      })
    }
    return disposables
  }
  async getRepositoryDiff(repositoryPath) {
    let repository = await this._getRepository(repositoryPath)
    if (!repository) return
    let diffs = []
    if (repository.state.indexChanges.length !== 0)
      for (let filePath of repository.state.indexChanges.map(change => change.uri.fsPath)) diffs.push(await repository.diffIndexWithHEAD(filePath))
    else for (let filePath of repository.state.workingTreeChanges.map(change => change.uri.fsPath)) diffs.push(await repository.diffWithHEAD(filePath))
    return diffs
  }
  async _getRepository(repositoryPath) {
    return (await this._gitExtensionApi?.openRepository(repositoryPath)) ?? undefined
  }
  dispose() {
    this._disposables.forEach(disposable => disposable.dispose())
  }
}
var vscode = handleDefaultExports(require('vscode'))
var Environment = class extends BaseVscodeEnvironment {
  addEditorSpecificFilters() {
    return { 'X-VSCode-Build': vscode.env.appName, 'X-VSCode-Language': vscode.env.language }
  }
}
var requestLight = handleDefaultExports(requestLight())
var VsCodeExtensionDevelopmentIntent = class extends Intent {
  constructor() {
    super({
      location: 2,
      id: 'api',
      description: requestLight.t('Ask about VS Code extension development'),
      systemPromptOptions: {
        roleplay:
          'You are an expert in VS Code extension development. You know how to use the VS Code API to extend the editor. Your task is to help the Developer with their VS Code extension development.',
      },
      modelSampleQuestion: 'How do I add text to the status bar?',
      commandInfo: { sampleRequest: requestLight.t('How do I add text to the status bar?') },
      rules: `
Assume the question is about VS Code extension development.
Politely decline to answer if the question is not about VS Code extension development.
Please do not guess a response and instead just respond with a polite apology if you are unsure.
If you believe the API related context given to you is incorrect or not relevant you may ignore it.
The user cannot see the API context you are given, so you must not mention it. If you want to refer to it, you must include it in your reply.
Do not talk about initial setup of creating an extension unless the user asks about it.
Only provide information to related VS Code extension development.`.trim(),
      contextResolvers: [extensionAPIContextResolver, contextResolverRegistry],
    })
  }
}
var requestLight = handleDefaultExports(requestLight())
function calculateUpdatedRange(originalRange, edits) {
  let updatedRange = originalRange
  for (let edit of edits) {
    let start = edit.range.start,
      end = edit.range.end,
      originalStart = updatedRange.start,
      originalEnd = updatedRange.end,
      newLinesCount = edit.newText.split(`
`).length,
      lineChange = newLinesCount - (end.line - start.line) - 1,
      newStartLine = originalStart.line,
      newEndLine = originalStart.line
    end.isBefore(originalStart)
      ? ((newStartLine = originalStart.line + lineChange), (newEndLine = originalEnd.line + lineChange))
      : start.isBefore(originalStart) && end.isAfterOrEqual(originalStart) && end.isBeforeOrEqual(originalEnd)
      ? ((newStartLine = start.line), (newEndLine = originalEnd.line + lineChange))
      : start.isAfterOrEqual(originalStart) && start.isBeforeOrEqual(originalEnd) && end.isAfter(originalEnd)
      ? ((newStartLine = originalStart.line), (newEndLine = end.line + lineChange))
      : start.isAfter(originalEnd)
      ? ((newStartLine = originalStart.line), (newEndLine = originalEnd.line))
      : updatedRange.contains(edit.range)
      ? ((newStartLine = originalStart.line), (newEndLine = originalEnd.line + lineChange))
      : edit.range.contains(updatedRange) && ((newStartLine = start.line), (newEndLine = start.line + newLinesCount - 1)),
      (updatedRange = new VscodeRange(newStartLine, 0, newEndLine, 0))
  }
  return updatedRange
}
var modelVersions = { 3: 'gpt-3.5-turbo', 4: 'gpt-4', cl: 'code-llama' },
  CodeFixIntent = class {
    constructor() {
      this.id = 'fix'
      this.locations = [1, 2]
      this.description = requestLight.t('Propose a fix for the problems in the selected code')
      this.intentDetectionInput = {
        sampleQuestion: 'There is a problem in this code. Rewrite the code to show it with the bug fixed.',
      }
      this.commandInfo = {
        sampleRequest: requestLight.t('There is a problem in this code. Rewrite the code to show it with the bug fixed.'),
      }
    }
    static {
      this.ID = 'fix'
    }
    async invoke(context, request) {
      let documentContext = request.documentContext
      if (!documentContext) throw new Error('Open a file to fix an issue')
      let location = request.location,
        intentArgument = request.intentArgument,
        chatEndpointInfo = await getChatEndpointInfo(context, location, this.id, intentArgument ? modelVersions[intentArgument] : void 0)
      return isNotebookCell(documentContext.document.uri) && documentContext.document.languageId === 'python'
        ? new CodeFixWithRulesHandler(this, chatEndpointInfo, location, context, documentContext)
        : new CodeFixHandler(this, chatEndpointInfo, location, context, documentContext)
    }
  },
var CodeFixHandler = class {
  constructor(intent, endpoint, location, accessor, documentContext) {
    this.intent = intent
    this.endpoint = endpoint
    this.location = location
    this.accessor = accessor
    this.documentContext = documentContext
    let chatBuilderOptions = {
      queryPrefix: this.getQueryPrefix(),
      rules: this.getRules(),
      contextResolvers: this.getContextResolvers(),
    }
    this.promptCrafter = new ChatBuilder(accessor, chatBuilderOptions, location, documentContext),
    this.createReplyInterpreter = reply =>
        new (class extends ReplyInterpreter {
          constructor(interpreter) {
            super(interpreter, {
              report: report => {
                reply.report({ ...report, editsShouldBeInstant: true })
              },
            })
          }
          _reportProgress() {}
        })(this.interpretCodeReply.bind(this))
  }
  getContextResolvers() {
    return this.location === 1 ? [fixSelectionResolver, diagnosticResolver] : [currentSelectionContextResolver, diagnosticResolver, contextResolverRegistry]
  }
  getQueryPrefix() {
    return this.location === 1
      ? `Describe in a single sentence how you would solve the problem. After that sentence, add an empty line. Then add a code block with the fix.
`
      : 'Please fix my code.'
  }
  getRules() {
    return this.location === 1
      ? `First think step-by-step how you would fix the issue.
You are expected to either edit the selected code or propose a bash command to install missing packages.
If you propose a code change, use a single code block that starts with \`\`\` and ${FilePathComment.forLanguage(
          this.documentContext.language
        )}.
If you propose to run a bash command, use a code block that starts with \`\`\`bash.
When adding missing imports, always insert them inside of the selected code at the top, do not replace the rest of the selected code.
Describe in a single sentence how you would solve the problem. After that sentence, add an empty line. Then add a code block with the fix.`
      : `You specialize in being a highly skilled code generator. Your task is to help the Developer fix an issue.
If context is provided, try to match the style of the provided code as best as possible.
Generated code is readable and properly indented.
Markdown blocks are used to denote code.
Preserve user's code comment blocks, do not exclude them when refactoring code.
Pay especially close attention to the selection or exception context.
Given a description of what to do you can refactor, fix or enhance the existing code.`
  }
  async interpretCodeReply(reply) {
    let selectionContextMetadata = this.promptCrafter.selectionContextMetadata
    if (!selectionContextMetadata) throw new Error('code reply NEEDS a selection context')
    let codeBlock = extractCodeBlock(this.promptCrafter.selectionContextMetadata.contextInfo, reply, this.documentContext.language)
    if (!codeBlock || codeBlock.language === 'bash' || codeBlock.language === 'ps1') return { type: 'conversational', content: reply }
    let contentBeforeCode = codeBlock.contentBeforeCode.match(/^.+/)?.[0],
      edits = this.generateEdits(selectionContextMetadata, codeBlock.code),
      documentVersion = this.documentContext.document.version,
      generateFollowUps = cancellation => this.generateFollowUps(edits, selectionContextMetadata.expandedRange, documentVersion, cancellation)
    return createInlineEdit(edits, selectionContextMetadata.expandedRange, contentBeforeCode, generateFollowUps)
  }
  generateEdits(selectionContextMetadata, code) {
    return processInputText(
      this.accessor,
      selectionContextMetadata.contextInfo,
      code,
      2,
      this.documentContext.fileIndentInfo,
      DocumentContext.fromDocumentContext(this.documentContext)
    )
  }
  async generateFollowUps(edits, expandedRange, documentVersion, cancellation) {
    let diagnostics = await this.accessor.get(DiagnosticWaiter).waitForNewDiagnostics(this.documentContext.document.uri, cancellation)
    if (!cancellation.isCancellationRequested && diagnostics.length && this.documentContext.document.version !== documentVersion) {
      let updatedRange = calculateUpdatedRange(expandedRange, edits),
        errorDiagnostics = diagnostics.filter(diagnostic => isErrorDiagnostic(diagnostic) && diagnostic.range.intersection(updatedRange))
      if (errorDiagnostics.length)
        return errorDiagnostics.length === 1
          ? [
              {
                title: requestLight.t('An error remains after applying the change, click here to iterate.'),
                message: `/fix ${errorDiagnostics[0].message}`,
              },
            ]
          : [
              {
                title: requestLight.t('{0} errors remain after applying the change, click here to iterate.', errorDiagnostics.length),
                message: '/fix Fix the remaining errors',
              },
            ]
    }
  }
},
var CodeFixWithRulesHandler = class extends CodeFixHandler {
  getRules() {
    return this.location === 1
      ? generateInstructions(this.documentContext) +
          '\nIf you suggest to run a terminal command, use a code block that starts with ```bash.\nWhen fixing "ModuleNotFoundError" or "Import could not be resolved" errors, always use magic command "%pip install" to add the missing packages. The imports MUST be inserted at the top of the code block and it should not replace existing code.\nYou should not import the same module twice.'
      : super.getRules()
  }
  generateEdits(contextMetadata, code) {
    let codeLines = code.split(`
`),
      pipCommands = [],
      otherLines = []
    for (let line of codeLines) line.match(/^[%\!]pip/) ? pipCommands.push(line) : otherLines.push(line)
    if (!pipCommands.length) return super.generateEdits(contextMetadata, code)
    let edits = [],
      pipCommandsBlock =
      adjustIndentation(pipCommands, { whichLine: 'topMost', lines: contextMetadata.contextInfo.range.lines }, this.documentContext.fileIndentInfo).join(`
`) +
        `
`
    edits.push(new VscodeTextEdit(new VscodeRange(contextMetadata.expandedRange.start, contextMetadata.expandedRange.start), pipCommandsBlock)),
    otherLines.length &&
        edits.push(
          ...super.generateEdits(
            contextMetadata,
            otherLines.join(`
`)
          )
        )
    return edits
  }
}
var requestLight = handleDefaultExports(requestLight())
var questionExample = `
### Question:
Search for 'foo' in all files under my 'src' directory.

### Answer:
Populate the query field with 'foo' and specify the files to include as 'src/'.

[ARGS START]
\`\`\`json
{
    "query": "foo",
    "filesToInclude": "src" ,
}
\`\`\`
[ARGS END]

### Question:
Find all CamelCase words in all files under the 'src/extensions' directory.

### Answer:
Perform a regex search for camelCase variables by checking for any word that has a lowercase letter followed by an uppercase letter, followed by any number of lowercase letters. You can use \`\\b[a-z]+[A-Z][a-z]+\\b\` to acheive this.
This must be case-sensitive since the capitalization of the letters in our regex matters.

[ARGS START]
\`\`\`json
{
    "query": "\\\\b[a-z]+[A-Z][a-z]+\\\\b",
    "filesToInclude": "src/extensions" ,
    "isRegex": true,
    "isCaseSensitive": true,
}
\`\`\`
[ARGS END]

### Question:
Find all hex color codes in css files

### Answer:
Perform a search for 6-digit or 3-digit hex color codes using the regex \`#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b\`.

[ARGS START]
\`\`\`json
{
    "query": "#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\\\b",
    "filesToInclude": "*.css" ,
    "isRegex": true,
}
\`\`\`
[ARGS END]

### Question:
Find all HTTPS links in markdown.

### Answer:
Search all URLs that have the HTTPS protocol in a markdown file. Make sure to include all valid URL characters in their respective places. This regex should achieve this: \`https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#()?&//=]*)\`.

[ARGS START]
\`\`\`json
{
    "query": "https?:\\\\/\\\\/(www\\\\.)?[-a-zA-Z0-9@:%._\\\\+~#=]{2,256}\\\\.[a-z]{2,6}\\\\b([-a-zA-Z0-9@:%_\\\\+.~#()?&//=]*)",
    "filesToInclude": "*.md" ,
    "isRegex": true,
}
\`\`\`
[ARGS END]

### Question:
Replace all YYYY-MM-DD dates with MM/DD/YYYY dates. Don't do this in typescript files.

### Answer:
You will need to use the regex \`\\b(\\d{4})-(\\d{2})-(\\d{2})\\b\` to match the YYYY-MM-DD date format. Then, you will need to use the replace string \`$2/$3/$1\` to replace the date with the MM/DD/YYYY format.

[ARGS START]
\`\`\`json
{
    "query": "\\\\b(\\\\d{4})-(\\\\d{2})-(\\\\d{2})\\\\b",
    "replace: "$2/$3/$1",
    "filesToExclude": "*.ts",
    "isRegex": true,
}
\`\`\`
[ARGS END]

### Question:
Replace all camel case variable names with snake case variable names.

### Answer:
To replace all camel case variables with snake case, we will need to:
1. Find all sequences of lowercase letters succeeded by uppercase letters. Use \`([a-z]+)([A-Z])\` to capture these sequences.
2. Separate them with an underscore character. \`$1_$2\` does this.
3. Convert both characters to lowercase. Adjust the previous replace text to be \`\\l$1_\\l$2\`.

[ARGS START]
\`\`\`json
{
    "query": "([a-z]+)([A-Z])",
    "replace: "\\\\l$1_\\\\l$2",
    "isRegex": true,
    "isCaseSensitive": true,
}
\`\`\`
[ARGS END]

### Question:
alphanumeric

### Answer:
To find all alphanumeric characters, you can use the regex \`[a-zA-Z0-9]\`.

[ARGS START]
\`\`\`json
{
    "query": "[a-zA-Z0-9]",
    "isRegex": true,
    "isCaseSensitive": true,
}
\`\`\`
[ARGS END]

### Question:
link

### Answer:
To find all web links, use the regex \`https?:\\/\\/\\S+\`.

[ARGS START]
\`\`\`json
{
    "query": "https?:\\\\/\\\\/\\\\S+",
    "isRegex": true,
}
\`\`\`
[ARGS END]

### Question:
Search for actionbar files outside of my "extensions" directoy

### Answer:
To do this, use the query \`actionbar\` in all files except the ones in \`extensions\`.

[ARGS START]
\`\`\`json
{
    "query": "actionbar",
    "filesToExclude": "extensions",
}
\`\`\`
[ARGS END]

### Question:
typescript for loop

### Answer:
To look for "for" loops in most languages, use the query \`for\\s*\\(\`.

[ARGS START]
\`\`\`json
{
    "query": "for\\s*\\(",
	"isRegex: true,
	"filesToInclude: "*.ts"
}
\`\`\`
[ARGS END]

`
function generateSearchCommand(searchParams) {
  if (!searchParams) return []
  let commands = [],
    commandParams = {
      query: searchParams.query ?? '',
      replace: searchParams.replace ?? '',
      filesToInclude: searchParams.filesToInclude ?? '',
      filesToExclude: searchParams.filesToExclude ?? '',
      isRegex: searchParams.isRegex ?? false,
      isCaseSensitive: searchParams.isRegex ?? false,
    }
  commands.push({ commandId: 'github.copilot.executeSearch', args: [commandParams], title: 'Search' })
  return commands
}

function parseJsonFromMarkdown(markdownText) {
  let jsonRegex = /```(?:json)\s*([\s\S]+?\s*)```/g,
    jsonMatches = Array.from(markdownText.matchAll(jsonRegex), match => match[1]),
    firstMatch = jsonMatches && jsonMatches.length > 0 ? jsonMatches[0] : undefined,
    parsedJson
  if (firstMatch) {
    let json
    try {
      json = JSON.parse(firstMatch)
    } catch {}
    json && (parsedJson = json)
  }
  return parsedJson
}

function generateMarkdownTable(data) {
  if (!data) return []
  let table = [
    `| Parameter  | Value |
`,
    `| ------ | ----- |
`,
  ]
  for (let [key, value] of Object.entries(data)) {
    if (value === '') continue
    let formattedValue = value
    if (typeof value == 'string' || value instanceof String) {
      formattedValue = value.replace(/\|/g, '\\|')
    }
    table.push(`| ${key} | \`${formattedValue}\` |
`)
  }
  table.push(`
`)
  return table
}

function registerSearchIntent(isEnabledByDefault) {
  let searchIntent = new Intent({
    location: 2,
    id: 'search',
    description: requestLight.t('Generate query parameters for workspace search'),
    modelSampleQuestion: "Search for 'foo' in all files under my 'src' directory",
    systemPromptOptions: {
      examples: questionExample,
      roleplay:
        'You are a VS Code search expert who helps to write search queries for text in a workspace. Users want to search across a whole workspace. Your response will contain parameters to use in the search that targets what the user wants.',
    },
    commandInfo: {
      allowsEmptyArgs: false,
      defaultEnablement: isEnabledByDefault,
      sampleRequest: requestLight.t("Search for 'foo' in all files under my 'src' directory"),
    },
    rules: `
The user's question is ALWAYS related to search or replace. When the user's question does not seem to be related to searching or replacing, you MUST assume that they're searching for or replacing what they are describing.
For example, if the user says "emojis", try appending "I'm looking for _____" to the beginning (e.g. I'm looking for emojis) to make more sense of it.

For all valid questions, you MUST respond with a JSON object with search parameters to use.
- Your answer MUST wrap the JSON object in "[ARGS START]" and "[ARGS END]". "[ARGS START]" must be on a new line.
- Your answer MUST have an explanation in full, human-readable sentences. This goes before the "[ARGS START]" line.

If you put a regex in the "query" parameter, make sure to set "isRegex" to true.
If you put a regex in the "query" parameter, do not start and/or end with forward slashes to denote a regex literal.
You MUST NOT give an answer with an empty-string query parameter.

The "replace" string will be used to replace the query-matched search results.

If you want to target certain files, set "filesToInclude" to a glob pattern. DO NOT assume the "filesToInclude" and "filesToExclude" without being very sure that the user wants to target these files!

If the query is case sensitive, set "isCaseSensitive" to true.

By default, all string fields are the empty string, and all boolean fields are false. Only list the fields you want to change.

I want the JSON object of search parameters to be in this format:
[ARGS START]
\`\`\`json
{
    "query": ...,
    "replace": ...,
    "filesToInclude": ...,
    "filesToExclude": ...,
    "isRegex": ...,
    "isCaseSensitive": ...,
}
\`\`\`
[ARGS END]
`.trim(),
    responseProcessor: (r, n, i) =>
      new TextProcessor([{ start: '[ARGS END]', stop: '[ARGS START]' }], i, o => generateMarkdownTable(parseJsonFromMarkdown(o.join('')))),
    followUps: async (r, n) => {
      let parsedJson = parseJsonFromMarkdown(n.response?.message ?? '')
      return generateSearchCommand(parsedJson)
    },
    contextResolvers: [contextResolverRegistry, currentSelectionContextResolver],
  })
  IntentManager.registerIntent(searchIntent)
}

ContributionManager.registerContribution(registerSearchIntent)
var requestLight = handleDefaultExports(requestLight()),
process = require('process')
var commandExamples = `
User: How do I revert a specific commit?
Assistant:
\`\`\`sh
git revert {commit_id}
\`\`\`

User: How do I print all files recursively within a directory?
Assistant:
\`\`\`sh
ls -lR
\`\`\`

User: How do I delete a directory?
Assistant:
\`\`\`pwsh
rmdir {dir_name}
\`\`\`

User: Print all files starting with "pre"
\`\`\`bash
find . -type f -name 'pre*'
\`\`\`
`.trim(),
stepByStepInstructions = `
Think step by step:

1. Read the provided relevant workspace information (file names, project files in the project root) to understand the user's workspace.

2. Generate a response that clearly and accurately answers the user's question. In your response, follow the following:
    - Prefer single line commands.
    - Omit an explanation unless the suggestion is complex, if an explanation is included then be concise.
    - Provide the command suggestions using the active terminal's shell type for the ${getPlatform()} operating system.
    - Only use a tool like python or perl when it is not possible with the shell.
    - When there is text that needs to be replaced in the suggestion, prefix the text with '{', suffix the text with '}' and use underscores instead of whitespace.
    - Say "I'm not quite sure how to do that." when you aren't confident in your explanation

3. At the end of the response, list all text that needs to be replaced with associated descriptions in the form of a markdown list
`.trim(),
terminalHandlers = {
    terminalSelection: {
      location: 2,
      id: 'explainTerminal',
      description:
        'Explain the terminal selection if it exists, otherwise explain what is happening in the terminal buffer',
      modelSampleQuestion: 'Can you explain what is happening in the terminal selection',
      systemPromptOptions: {
        includeCodeGenerationRules: !1,
        roleplay:
          'You are a programmer who specializes in using the command line. You are an expert at explaining code to anyone. Your task is to help the Developer understand what is happening in the terminal.',
      },
      rules: `
Provide well thought out examples
Utilize provided context in examples
Match the style of provided context when using examples
Say "I'm not quite sure how to explain that." when you aren't confident in your explanation`.trim(),
      contextResolvers: [terminalSelectionResolver, terminalBufferResolver],
      commandInfo: { executeImmediately: !0 },
    },
    terminalLastCommand: {
      location: 2,
      id: 'explainTerminalLastCommand',
      description: 'Explain the command that was last run in the terminal',
      modelSampleQuestion: 'Can you explain what is happening in the last terminal command',
      systemPromptOptions: {
        includeCodeGenerationRules: !1,
        roleplay:
          'You are a programmer who specializes in using the command line. You are an expert at explaining code to anyone. Your task is to help the Developer understand what is happening in the terminal.',
        examples:
          '\nBelow you will find a set of examples of how to suggest to fix the command. Please follow these examples as closely as possible.\n```sh\necho "hello world"\n```',
      },
      rules: `
Provide well thought out examples
Utilize provided context in examples
Match the style of provided context when using examples
Say "I'm not quite sure how to explain that." when you aren't confident in your explanation
If the command can be fixed, make a suggestion wrapped in a markdown codefenced block`.trim(),
      contextResolvers: [terminalLastCommandResolver],
    },
  },
var commandPromptConfiguration = {
    systemPromptOptions: {
      includeCodeGenerationRules: false,
      roleplay:
        'You are a programmer who specializes in using the command line. Your task is to help the Developer craft a command to run on the command line.',
      examples: commandExamples,
    },
    rules: stepByStepInstructions,
    contextResolvers: [contextResolverRegistry, terminalShellTypeResolver, terminalWorkspaceResolver],
  },
  PromptBuilder = class {
    constructor(accessor) {
      this.accessor = accessor
      this.defaultPromptCreator = new ChatBuilder(accessor, commandPromptConfiguration, 2, undefined)
    }
    async buildPrompt(promptParams) {
      let handler
      for (let key of Object.keys(promptParams)) if ((handler = terminalHandlers[key])) break
      return handler
        ? new ChatBuilder(this.accessor, handler, 2, undefined).buildPrompt(promptParams)
        : this.defaultPromptCreator.buildPrompt(promptParams)
    }
  }
  async function explainCommand(terminal, response) {
    let explanationPrompt = `@${terminal} Explain the suggested command`,
      multipleCommands = false,
      responseMessage = response.response?.message
    if (responseMessage) {
      let codeBlocks = extractCodeBlocks(responseMessage)
      if (codeBlocks.length === 0) return []
      codeBlocks.length === 1
        ? (explanationPrompt = `@${terminal} Explain this command:

  ${codeBlocks[0].raw}`)
        : ((multipleCommands = true),
          (explanationPrompt = `@${terminal} Explain these commands:${codeBlocks
            .map(
              block => `

  ${block.raw}`
            )
            .join('')}`))
    }
    return [{ message: explanationPrompt, title: multipleCommands ? 'Explain the suggested commands' : 'Explain the suggested command' }]
  }
function getPlatform() {
  switch (process.platform) {
    case 'win32':
      return 'Windows'
    case 'darwin':
      return 'macOS'
    default:
      return 'Linux'
  }
}
var TerminalIntent = class {
  constructor() {
    this.locations = [2]
    this.id = 'terminal'
    this.description = requestLight.t('Ask how to do something in the terminal')
    this.intentDetectionInput = {
      sampleQuestion: 'How do I view all files within a directory including sub-directories',
    }
    this.commandInfo = { sampleRequest: requestLight.t('How do I view all files within a directory including sub-directories') }
  }
  async invoke(context, request, session) {
    let location = request.location,
      endpointInfo = await getChatEndpointInfo(context, location, this.id)
    return { intent: this, location: 2, endpoint: endpointInfo, promptCrafter: new PromptBuilder(context), followUps: explainCommand }
  }
}

var requestLight = handleDefaultExports(requestLight())
var TestGeneratorIntent = class {
  constructor() {
    this.id = 'tests'
    this.locations = [2, 1]
    this.description = requestLight.t('Generate unit tests for the selected code')
    this.intentDetectionInput = { sampleQuestion: 'Write a set of detailed unit test functions for the code above.' }
    this.commandInfo = undefined
  }
  static {
    this.ID = 'tests'
  }
  async invoke(context, request) {
    let documentContext = request.documentContext
    if (!documentContext) throw new Error('Open a file to generate tests.')
    let location = request.location,
      endpointInfo = await getChatEndpointInfo(context, location, this.id)
    return isTestFile(documentContext.document) ? new TestFileHandler(this, endpointInfo, location, context, documentContext) : new NonTestFileHandler(this, endpointInfo, location, context, documentContext)
  }
},
var TestFileHandler = class {
  constructor(intent, endpoint, location, accessor, context) {
    this.intent = intent
    this.endpoint = endpoint
    this.location = location
    this.accessor = accessor
    this.context = context
    this.promptCrafter = new ChatBuilder(
      this.accessor,
      { queryPrefix: 'Please generate tests for my code.', contextResolvers: [contextResolverRegistration, _Y] },
      this.location,
      this.context
    )
    this.createReplyInterpreter = CodeReplyInterpreter.createFactory(this.accessor, this.promptCrafter, this.context)
    this.responseProcessor = (input, output, reporter) => {
      let textApplier = new AsyncIterableTextApplier()
      return (
        (async () => {
          let commentPrefixes = [
            BlockComment.begin(this.context.language),
            BlockComment.end(this.context.language),
            FilePathComment.forLanguage(this.context.language),
          ]
          for await (let comment of filterComments(textApplier.asyncIterable))
            (comment.kind === 1 && commentPrefixes.some(prefix => comment.value.startsWith(prefix))) || reporter.report({ content: comment.value })
        })().catch(error => console.error(error)),
        textApplier
      )
    }
  }
}
var NonTestFileHandler = class {
  constructor(intent, endpoint, location, accessor, documentContext) {
    this.intent = intent
    this.endpoint = endpoint
    this.location = location
    this.accessor = accessor
    this.documentContext = documentContext
    this.createReplyInterpreter = ReplyInterpreter.createFactory(async (message, reporter) => {
      let codeBlock = extractCodeBlock(this.promptCrafter.selectionContextMetadata.contextInfo, message, this.documentContext.language)
      if (!codeBlock) return { type: 'conversational', content: message }
      reporter.report({ content: codeBlock.contentBeforeCode })
      let code = codeBlock.code,
        document = this.documentContext.document
      if (this.existingTestFile) {
        let testDocument = await this.accessor.get(WorkspaceClass).openTextDocument(this.existingTestFile),
          workspaceEdit = new VscodeWorkspaceEdit()
        return (
          workspaceEdit.set(this.existingTestFile, [VscodeTextEdit.insert(new VscodePosition(testDocument.lineCount, 0), code)]),
          { type: 'workspaceEdit', workspaceEdit: workspaceEdit }
        )
      }
      let testFileName = generateTestFileName(document),
        testFileUri = VscodeUri.joinPath(document.uri, `../${testFileName}`).with({ scheme: resourceTypes.untitled }),
        workspaceEdit = new VscodeWorkspaceEdit()
      return (
        workspaceEdit.createFile(testFileUri, { ignoreIfExists: true }),
        workspaceEdit.replace(testFileUri, new VscodeRange(0, 0, 0, 0), code),
        { type: 'workspaceEdit', workspaceEdit: workspaceEdit }
      )
    })
    let self = this
    this.promptCrafter = new (class extends ChatBuilder {
      constructor() {
        super(accessor, { queryPrefix: 'Please generate tests for my code.', contextResolvers: [documentSelectionResolverInstance] }, location, documentContext)
      }
      async buildPrompt(conversation, endpoint, context, reporter, prompt, message) {
        let testFileResolver = new TestFileContextResolver(),
          candidateHandler = testFileResolver.onDidFindCandidate(candidate => {
            self.existingTestFile = candidate
          }),
          resolvedContext = await testFileResolver.resolveContext(accessor, { endpoint: endpoint, conversation: conversation, documentContext: documentContext, message: undefined }, message)
        if ((candidateHandler.dispose(), resolvedContext)) {
          resolvedContext.references?.forEach(reference => reporter.report({ reference: reference.anchor }))
          let userMessages = []
          for (let userMessage of resolvedContext.userMessages) userMessages.push(new Session({ message: userMessage, type: 'user' }))
          conversation = new Conversation([conversation.turns.slice(0, -1), userMessages, conversation.turns.slice(-1)].flat())
        }
        return super.buildPrompt(conversation, endpoint, context, reporter, prompt, message)
      }
    })()
  }
}
IntentManager.registerIntent(new CodeGenerator())
IntentManager.registerIntent(new DocumentationCommand())
IntentManager.registerIntent(new CodeEditor())
IntentManager.registerIntent(new TestGeneratorIntent())
IntentManager.registerIntent(new CodeFixIntent())
IntentManager.registerIntent(new ExplainIntent())
IntentManager.registerIntent(new TerminalIntent())
IntentManager.registerIntent(UnknownIntent.Instance)
IntentManager.registerIntent(new VsCodeExtensionDevelopmentIntent())
var vscode = handleDefaultExports(require('vscode'))
var KerberosLoader = class extends BaseKerberosLoader {
  async loadKerberosModule() {
    try {
      return require(`${vscode.env.appRoot}/node_modules.asar/kerberos`)
    } catch {}
    try {
      return require(`${vscode.env.appRoot}/node_modules/kerberos`)
    } catch {}
  }
}
var os = handleDefaultExports(require('os')),
vscode = handleDefaultExports(require('vscode'))
var CertificateLoader = class extends BaseCertificateLoader {
  async loadCaCerts() {
    let winCAModule = await this.loadBuiltInWinCAModule(),
      certSet = new Set(),
      crypt32Instance = new winCAModule.Crypt32()
    try {
      let cert
      for (; (cert = crypt32Instance.next()); ) certSet.add(formatCertificate(cert))
    } finally {
      crypt32Instance.done()
    }
    return Array.from(certSet)
  }
  async loadBuiltInWinCAModule() {
    try {
      return require(`${vscode.env.appRoot}/node_modules.asar/@vscode/windows-ca-certs`)
    } catch {}
    try {
      return require(`${vscode.env.appRoot}/node_modules/@vscode/windows-ca-certs`)
    } catch {}
  }
}

function formatCertificate(cert) {
  let formattedCert = ['-----BEGIN CERTIFICATE-----'],
    base64Cert = cert.toString('base64')
  for (let index = 0; index < base64Cert.length; index += 64) formattedCert.push(base64Cert.substr(index, 64))
  return formattedCert.push('-----END CERTIFICATE-----', ''), formattedCert.join(os.EOL)
}

var ExperimentationService = handleDefaultExports(nve())

function getTargetPopulation(isInsider) {
  return isInsider ? ExperimentationService.TargetPopulation.Insiders : ExperimentationService.TargetPopulation.Public
}

async function getExperimentationService(extension, telemetry, isInsider) {
  let extensionId = extension.extension.id,
    version = extension.extension.packageJSON.version,
    targetPopulation = getTargetPopulation(isInsider)
  return (0, ExperimentationService.getExperimentationService)(extensionId, version, targetPopulation, telemetry, extension.globalState)
}

var TelemetryReporter = handleDefaultExports(Vxe())

var TelemetryManager = class {
  constructor(context, internalTelemetryKey, externalTelemetryKey, tokenService, subscriptions) {
    this._sharedProperties = {}
    this._isInternal = false
    tokenService.on('onCopilotToken', async (token, tokenData) => {
      if (
        ((this._username = (await getSessionWithMinimalScope(context))?.account?.label),
        (this._sku = token.getTokenValue('sku')),
        (this._isInternal = token.isInternal),
        this.sendTelemetryEvent('token', {}, { chatEnabled: tokenData.chat_enabled ? 1 : 0 }),
        !token.organization_list || !tokenData.chat_enabled)
      ) {
        this._internalTelemetryReporter = undefined
        return
      }
      token.isInternal &&
        ((this._internalTelemetryReporter = new TelemetryReporter.default(internalTelemetryKey)), subscriptions.subscriptions.push(this._internalTelemetryReporter))
    }),
      (this._externalTelemetryReporter = new TelemetryReporter.default(externalTelemetryKey)),
      subscriptions.subscriptions.push(this._externalTelemetryReporter)
  }
  setSharedProperty(key, value) {
    this._sharedProperties[key] = value
  }
  postEvent(eventName, properties) {
    let formattedProperties = {}
    for (let [key, value] of properties) formattedProperties[key] = value
    this._isInternal && this.sendInternalTelemetryEvent(eventName, formattedProperties), this.sendTelemetryEvent(eventName, formattedProperties)
  }
  sendInternalTelemetryEvent(eventName, properties, metrics) {
    this._internalTelemetryReporter &&
      ((properties = { ...properties, 'common.userName': this._username ?? 'undefined', ...this._sharedProperties }),
      this._internalTelemetryReporter.sendRawTelemetryEvent(eventName, properties, metrics))
  }
  sendTelemetryEvent(eventName, properties, metrics) {
    properties = { ...properties, 'common.sku': this._sku ?? 'undefined', ...this._sharedProperties }
    this._isInternal && (metrics = { ...metrics, 'common.internal': 1 })
    this._externalTelemetryReporter.sendTelemetryEvent(eventName, properties, metrics)
  }
  sendTelemetryErrorEvent(eventName, properties, metrics) {
    properties = { ...properties, 'common.sku': this._sku ?? 'undefined' }
    this._isInternal && (metrics = { ...metrics, 'common.internal': 1 })
    this._externalTelemetryReporter.sendTelemetryErrorEvent(eventName, properties, metrics)
  }
}

var vscode = require('vscode')
var hasShownInvalidTokenWarning = false;
async function fetchAndValidateCopilotToken(context) {
  let authLogger = context.get(LoggerManager).getLogger('auth'),
    session = await getSessionWithMinimalScope(context.get(ConfigManager))
  if (!session) {
    authLogger.info('GitHub login failed');
    context.get(IGHTelemetryService).sendErrorTelemetry('auth.github_login_failed');
    return { kind: 'failure', reason: 'GitHubLoginFailed' };
  }
  authLogger.info(`Logged in as ${session.account.label}`);
  let copilotToken = await fetchCopilotToken(context, { token: session.accessToken });
  if (copilotToken.kind === 'success') authLogger.info(`Got Copilot token for ${session.account.label}`);
  return copilotToken;
}
var WarningNotificationHandler = class {
  async showWarningMessage(message, ...actions) {
    return { title: await vscode.window.showWarningMessage(message, ...actions.map(action => action.title)) };
  }
},
NoAccessError = class extends Error {},
SubscriptionEndedError = class extends Error {},
EnterpriseAdminContactError = class extends Error {}

async function validateCopilotToken(context) {
  let copilotToken = await fetchAndValidateCopilotToken(context);
  if (copilotToken.kind === 'failure' && copilotToken.reason === 'NotAuthorized') {
    let errorMessage = copilotToken.message;
    if (errorMessage?.includes('No access to GitHub Copilot found')) throw new NoAccessError(errorMessage ?? 'User not authorized');
    if (errorMessage?.includes('Your subscription has ended')) throw new SubscriptionEndedError(errorMessage);
  }
  if (copilotToken.kind === 'failure') {
    let errorMessage = copilotToken.message;
    if (errorMessage?.includes('Please contact your enterprise admin to enable your managed account for Copilot for Business'))
      throw new EnterpriseAdminContactError(errorMessage);
  }
  if (copilotToken.kind === 'failure' && copilotToken.reason === 'HTTP401') {
    let errorMessage = 'Your GitHub token is invalid. Please sign out from your GitHub account using the VS Code accounts menu and try again.';
    if (!hasShownInvalidTokenWarning) {
      hasShownInvalidTokenWarning = true;
      vscode.window.showWarningMessage(errorMessage);
    }
    throw Error(errorMessage);
  }
  if (copilotToken.kind === 'failure' && copilotToken.reason === 'GitHubLoginFailed') throw Error('GitHubLoginFailed');
  if (copilotToken.kind === 'failure') throw Error('Failed to get copilot token');
  return copilotToken;
}

var TokenHandler = class extends BaseTokenHandler {
  constructor(configService) {
    super();
    this.configurationService = configService;
    this.copilotToken = undefined;
    this._disposable = vscode.Disposable.from(vscode.authentication.onDidChangeSessions(session => handleGithubTokenChange(session, this)));
  }
  dispose() {
    this._disposable.dispose();
  }
  async getBasicGitHubToken() {
    return (await getSessionWithMinimalScope(this.configurationService))?.accessToken;
  }
  async getPermissiveGitHubToken(scope) {
    return (await getSessionWithFullScope(this.configurationService, scope))?.accessToken;
  }
  async getCopilotToken(context, forceRefresh) {
    if (!this.copilotToken || this.copilotToken.expires_at < getCurrentTimestamp() || forceRefresh) {
      this.copilotToken = await validateCopilotToken(context);
      scheduleTokenRefresh(context, this, this.copilotToken.refresh_in);
    }
    return new TokenParser(this.copilotToken.token, this.copilotToken.organization_list);
  }
  resetCopilotToken(context, httpErrorCode) {
    if (httpErrorCode !== undefined) {
      context.get(IGHTelemetryService).sendTelemetry('auth.reset_token_' + httpErrorCode);
    }
    context
      .get(LoggerManager)
      .getLogger('auth')
      .debug(`Resetting copilot token on HTTP error ${httpErrorCode || 'unknown'}`);
    this.copilotToken = undefined;
  }
}
var vscode = require('vscode')
var enterpriseConfigKey = 'github-enterprise',
defaultGithubUrl = 'https://github.com'

function getGithubUrl(configService) {
  return configService.getConfig(settings.AuthProvider) === 'github-enterprise'
    ? vscode.workspace.getConfiguration(enterpriseConfigKey).get('uri') ?? defaultGithubUrl
    : defaultGithubUrl;
}

var GithubApiService = class extends GitHubAPI {
  constructor(configService) {
    super(getGithubUrl(configService));
    this.configurationService = configService;
  }
  updateBaseUrl(baseUrl, configService) {
    super.updateBaseUrl(baseUrl, getGithubUrl(this.configurationService));
  }
}

function updateBaseUrlOnConfigChange(configChange, serviceLocator) {
  if (configChange.affectsConfiguration(`${extensionId}.advanced`) || configChange.affectsConfiguration(`${enterpriseConfigKey}.uri`)) {
    serviceLocator.get(BaseGithubApiService).updateBaseUrl(serviceLocator);
  }
}

var net = require('net')
var url = require('url')
var vscode = require('vscode')

function getProxyFromEnv(env) {
  return env.HTTPS_PROXY || env.https_proxy || env.HTTP_PROXY || env.http_proxy || null;
}

function handleProxyConfigurationChange(proxySettings, env) {
  vscode.workspace.onDidChangeConfiguration(configChange => {
    let isProxyConfigChanged = configChange.affectsConfiguration('http.proxy');
    if (configChange.affectsConfiguration('http.proxyStrictSSL') ||
      configChange.affectsConfiguration('http.proxyAuthorization') ||
      configChange.affectsConfiguration('http.proxyKerberosServicePrincipal') ||
      isProxyConfigChanged) {
      updateProxySettings(proxySettings, env, isProxyConfigChanged);
    }
  });
  updateProxySettings(proxySettings, env);
}

var updateProxySettings = (proxySettings, env, isProxyConfigChanged) => {
  let proxy = vscode.workspace.getConfiguration('http').get('proxy') || getProxyFromEnv(env);
  if (proxy) {
    let headers = {},
      proxyAuthorization = vscode.workspace.getConfiguration('http').get('proxyAuthorization'),
      isStrictSSL = vscode.workspace.getConfiguration('http').get('proxyStrictSSL', true);
    proxyAuthorization && (headers['Proxy-Authorization'] = proxyAuthorization);
    let host = proxy,
      proxyParts = proxy.split(':');
    if (proxyParts.length > 2) {
      if (proxy.includes('[')) {
        let startIndex = proxy.indexOf('['),
          endIndex = proxy.indexOf(']');
        host = proxy.substring(startIndex + 1, endIndex);
      }
    } else host = proxyParts[0];
    let ipVersion = (0, net.isIP)(host);
    ipVersion === 4
      ? (proxy = `https://${proxy}`)
      : ipVersion === 6 && (proxy.includes('[') ? proxy.startsWith('https://') || (proxy = `https://${proxy}`) : (proxy = `https://[${proxy}]`));
    let { hostname, port, username, password } = parseProxyUrl(proxy),
      proxyAuth = username && password && `${decodeURIComponent(username)}:${decodeURIComponent(password)}`;
    proxySettings.proxySettings = { host: hostname, port: parseInt(port), proxyAuth, headers };
    let kerberosServicePrincipal = vscode.workspace.getConfiguration('http').get('proxyKerberosServicePrincipal');
    kerberosServicePrincipal && (proxySettings.proxySettings.kerberosServicePrincipal = kerberosServicePrincipal);
    proxySettings.rejectUnauthorized = isStrictSSL;
  } else if (isProxyConfigChanged && !proxy) {
    proxySettings.proxySettings = undefined;
  }
}

function parseProxyUrl(proxyUrl) {
  try {
    return new url.URL(proxyUrl);
  } catch {
    throw new Error(`Invalid proxy URL: '${proxyUrl}'`);
  }
}

var fs = handleDefaultExports(require('fs'))
var FileSystemOperations = class extends BaseFileSystemOperations {
  async getFileStats(fileUri) {
    let stats = await fs.promises.stat(fileUri.fsPath);
    return { type: stats.isFile() ? 1 : 2, ctime: stats.ctimeMs, mtime: stats.mtimeMs, size: stats.size };
  }

  async readDirectory(directoryUri) {
    validateUriScheme(directoryUri);
    let directoryEntries = await fs.promises.readdir(directoryUri.fsPath, { withFileTypes: true }),
      entries = [];
    for (let entry of directoryEntries) entries.push([entry.name, entry.isFile() ? 1 : 2]);
    return entries;
  }

  async createDirectory(directoryUri) {
    validateUriScheme(directoryUri);
    return fs.promises.mkdir(directoryUri.fsPath);
  }

  async readFile(fileUri) {
    validateUriScheme(fileUri);
    return fs.promises.readFile(fileUri.fsPath);
  }

  async writeFile(fileUri, data) {
    validateUriScheme(fileUri);
    return fs.promises.writeFile(fileUri.fsPath, data);
  }

  async delete(fileUri, options) {
    validateUriScheme(fileUri);
    return fs.promises.rm(fileUri.fsPath, { recursive: options?.recursive ?? false });
  }

  async rename(sourceUri, targetUri, options) {
    validateUriScheme(sourceUri);
    validateUriScheme(targetUri);
    if (!(options?.overwrite && fs.existsSync(targetUri.fsPath))) {
      return fs.promises.rename(sourceUri.fsPath, targetUri.fsPath);
    }
  }

  async copy(sourceUri, targetUri, options) {
    validateUriScheme(sourceUri);
    validateUriScheme(targetUri);
    let copyFlags = options?.overwrite ? fs.constants.COPYFILE_FICLONE : fs.constants.COPYFILE_EXCL;
    return fs.promises.copyFile(sourceUri.fsPath, targetUri.fsPath, copyFlags);
  }

  isWritableFileSystem(fileSystemId) {
    return true;
  }

  createFileSystemWatcher(fileSystemId) {
    return new (class {
      constructor() {
        this.ignoreCreateEvents = false;
        this.ignoreChangeEvents = false;
        this.ignoreDeleteEvents = false;
        this.onDidCreate = EventUtils.None;
        this.onDidChange = EventUtils.None;
        this.onDidDelete = EventUtils.None;
      }
      dispose() {}
    })();
  }
}

function validateUriScheme(uri) {
  if (uri.scheme !== 'file') throw new Error(`URI must be of file scheme, received ${uri.scheme}`);
}

var vscode = handleDefaultExports(require('vscode'))
var EnvironmentInfo = class extends BuildInfo {
  get sessionId() {
    return vscode.env.sessionId;
  }
  get machineId() {
    return vscode.env.machineId;
  }
  getEditorInfo() {
    return new VersionInfo('vscode', vscode.version);
  }
  getEditorPluginInfo() {
    return new VersionInfo('copilot-chat', packageInfo.version);
  }
}
var B$t = rbe()
var NoTelemetry = class {
  sendEventData(event, data) {
    throw new Error('Telemetry disabled')
  }
  sendErrorData(error, data) {
    throw new Error('Telemetry disabled')
  }
  flush() {
    return Promise.resolve()
  }
}
function redactFilePaths(text) {
  return text
    .replace(/([\s|(]|file:\/\/)(\/[^\s]+)/g, '$1[redacted]')
    .replace(/([\s|(]|file:\/\/)([a-zA-Z]:[(\\|/){1,2}][^\s]+)/gi, '$1[redacted]')
    .replace(/([\s|(]|file:\/\/)(\\[^\s]+)/gi, '$1[redacted]')
}
var TelemetryManager = class {
  getReporter(environment, secure) {
    if (!secure) return this.reporter
    if (isSecureEnvironment(environment)) return this.reporterSecure
    if (isTestMode(environment)) return new NoTelemetry()
  }
  setReporter(reporter) {
    this.reporter = reporter
  }
  setSecureReporter(reporter) {
    this.reporterSecure = reporter
  }
  async deactivate() {
    let reporterFlushPromise = Promise.resolve()
    if (this.reporter) {
      reporterFlushPromise = this.reporter.flush ? this.reporter.flush() : void 0
      this.reporter = void 0
    }

    let secureReporterFlushPromise = Promise.resolve()
    if (this.reporterSecure) {
      secureReporterFlushPromise = this.reporterSecure.flush ? this.reporterSecure.flush() : void 0
      this.reporterSecure = void 0
    }

    await Promise.all([reporterFlushPromise, secureReporterFlushPromise])
  }
}
var TelemetryController = class {
  constructor(accessor) {
    this.accessor = accessor;
    this.reporters = new TelemetryManager();
    this.openPromises = undefined;
  }
  withPromise(promise) {
    return this.openPromises
      ? (this.openPromises.add(promise),
        promise.then(() => {
          this.openPromises?.delete(promise)
        }))
      : promise
  }
  async enablePromiseTracking(enable) {
    enable ? this.openPromises || (this.openPromises = new Set()) : await this.awaitOpenPromises(undefined)
  }
  setSecureReporter(reporter) {
    this.reporters.setSecureReporter(reporter)
  }
  setReporter(reporter) {
    this.reporters.setReporter(reporter)
  }
  async sendTelemetry(eventName, event) {
    await this.withPromise(this._sendTelemetry(eventName, event, false))
  }
  async sendRestrictedTelemetry(eventName, event) {
    await this.withPromise(this._sendTelemetry(eventName, event, true))
  }
  async sendErrorTelemetry(eventName, event) {
    await this.withPromise(this._sendErrorTelemetry(eventName, event, false))
  }
  async sendRestrictedErrorTelemetry(eventName, event) {
    await this.withPromise(this._sendErrorTelemetry(eventName, event, true))
  }
  async sendExpProblemTelemetry(event) {
    await this.withPromise(this._sendExpProblemTelemetry(event))
  }
  async sendExceptionTelemetry(exception, origin) {
    await this.withPromise(this._sendExceptionTelemetry(exception, origin))
  }
  async deactivate() {
    await this.awaitOpenPromises(new Set()), await this.reporters.deactivate()
  }
  async awaitOpenPromises(newOpenPromises) {
    if (this.openPromises) {
      let promises = [...this.openPromises.values()]
      this.openPromises = newOpenPromises, await Promise.all(promises)
    }
  }
  async _sendTelemetry(eventName, event, isRestricted) {
    if (isRestricted && !isUserOptedIn(this.accessor)) return
    let telemetryEvent = event || TelemetryEvent.createAndMarkAsIssued({}, {})
    await telemetryEvent.makeReadyForSending(this.accessor, isRestricted ?? false, 'IncludeExp'), this.sendTelemetryEvent(isRestricted ?? false, eventName, telemetryEvent)
  }
  async _sendExpProblemTelemetry(event) {
    let eventName = 'expProblem',
      telemetryEvent = TelemetryEvent.createAndMarkAsIssued(event, {})
    await telemetryEvent.makeReadyForSending(this.accessor, false, 'SkipExp'), this.sendTelemetryEvent(false, eventName, telemetryEvent)
  }
  async _sendExceptionTelemetry(exception, origin) {
    let error = exception instanceof Error ? exception : new Error('Non-error thrown: ' + exception),
      isRestricted = isUserOptedIn(this.accessor),
      telemetryEvent = TelemetryEvent.createAndMarkAsIssued({
        origin: redactFilePaths(origin),
        reason: isRestricted ? 'Exception logged to restricted telemetry' : 'Exception, not logged due to opt-out',
      })
    if (
      (await telemetryEvent.makeReadyForSending(this.accessor, false, 'IncludeExp'), this.sendTelemetryEvent(false, 'exception', telemetryEvent), !isRestricted)
    )
      return
    let restrictedTelemetryEvent = TelemetryEvent.createAndMarkAsIssued({ origin: origin })
    await restrictedTelemetryEvent.makeReadyForSending(this.accessor, true, 'IncludeExp'), this.sendTelemetryException(true, error, restrictedTelemetryEvent)
  }
  async _sendErrorTelemetry(eventName, event, isRestricted) {
    if (isRestricted && !isUserOptedIn(this.accessor)) return
    let telemetryEvent = event || TelemetryEvent.createAndMarkAsIssued({}, {})
    await telemetryEvent.makeReadyForSending(this.accessor, isRestricted ?? false, 'IncludeExp'), this.sendTelemetryErrorEvent(isRestricted ?? false, eventName, telemetryEvent)
  }
  sendTelemetryEvent(isRestricted, eventName, telemetryEvent) {
    let reporter = this.reporters.getReporter(this.accessor, isRestricted);
    if (reporter) {
      let properties = TelemetryEvent.maybeRemoveRepoInfoFromPropertiesHack(isRestricted, telemetryEvent.properties);
      reporter.sendEventData(eventName, { ...properties, ...telemetryEvent.measurements });
    }
  }
  sendTelemetryException(isRestricted, error, telemetryEvent) {
    let reporter = this.reporters.getReporter(this.accessor, isRestricted);
    if (reporter) {
      let properties = TelemetryEvent.maybeRemoveRepoInfoFromPropertiesHack(isRestricted, telemetryEvent.properties);
      reporter.sendErrorData(error, { ...properties, ...this.telemetryEvent.measurements });
    }
  }
  sendTelemetryErrorEvent(isRestricted, eventName, telemetryEvent) {
    let reporter = this.reporters.getReporter(this.accessor, isRestricted);
    if (reporter) {
      let properties = TelemetryEvent.maybeRemoveRepoInfoFromPropertiesHack(isRestricted, telemetryEvent.properties);
      reporter.sendEventData(eventName, { ...properties, ...telemetryEvent.measurements });
    }
  }
}
function isUserOptedIn(context) {
  return context.get(TokenHandler).optedIn;
}
function initializeServices(context) {
  context.define(EndpointManager, new EndpointManager(context));
  context.define(BuildInfo, new EnvironmentInfo());
  context.define(IGHTelemetryService, new TelemetryController(context));
  context.define(EnvironmentFlags, EnvironmentFlags.fromEnvironment(false));
  context.define(EventEmitter, new EventEmitter());
  context.define(Cache, new Cache());
  context.define(BaseCertificateReader, createInstance(context));
  context.define(BaseSocketFactory, createSocketFactory(context));

  let config = context.get(ConfigManager).getConfig(settings.DebugUseNodeFetcher);
  context.define(ConnectionSettings, config ? new NetworkManager(context.get(BuildInfo)) : new ConnectionManager(context));
  context.define(TokenHandler, new TokenHandler(context));
  context.define(UrlProvider, new UrlProvider());
  context.define(HeaderContributorList, new HeaderContributorList());
  context.define(CertificateErrorHandler, new CertificateErrorHandler());
  context.define(BaseUrlOpener, new URLHandler());
  context.define(BaseExperimentFetcher, new EmptyExperimentFetcher());
  context.define(BaseFileSystemOperations, new FileSystemOperations());
  context.define(EmbeddingsComputer, new EmbeddingComputer(context));
  context.define(FileResourceTracker, new FileResourceTracker(context));
  context.define(CommandParser, new CommandParser(context));
  context.define(VariableManager, new VariableManager(context));
  context.define(CodeSearchClient, new CodeSearchClient(context));
  context.define(DocsSearchClient, new DocsSearchClient(context));
}
var copilotChatChannel = vscode.window.createOutputChannel('GitHub Copilot Chat', { log: true })
async function activateExtension(extensionContext, e) {
  if (extensionContext.extensionMode === vscode.ExtensionMode.Test && !e) return extensionContext
  vscode.l10n.bundle && Bx.config({ contents: vscode.l10n.bundle })
  let r = await createContext(extensionContext)
  extensionContext.subscriptions.push(deactivateExtension(r)),
  extensionContext.subscriptions.push(
      vscode.window.registerTerminalQuickFixProvider('copilot-chat.fixWithCopilot', {
        provideTerminalQuickFixes(o, s) {
          return [
            { command: 'github.copilot.terminal.explainTerminalLastCommand', title: Bx.t('Explain using Copilot') },
          ]
        },
      })
    ),
    extensionContext.subscriptions.push(
      vscode.window.registerTerminalQuickFixProvider('copilot-chat.generateCommitMessage', {
        async provideTerminalQuickFixes(o, s) {
          return [{ command: 'github.copilot.terminal.generateCommitMessage', title: Bx.t('Generate Commit Message') }]
        },
      })
    )
  let n = r.get(IGHTelemetryService)
  if (
    (await (async () => {
      let o = a => {
        let l = a.message || a
        n.sendErrorTelemetry('activationFailed', TelemetryEvent.createAndMarkAsIssued({ reason: l })), n.deactivate()
        let c =
          l === 'GitHubLoginFailed'
            ? notSignedInMessage
            : `GitHub Copilot could not connect to server. Extension activation failed: "${l}"`
        r.get(LoggerManager).defaultLogger.error(c), vscode.commands.executeCommand('setContext', 'github.copilot.activated', !1)
        let u = vscode.authentication.onDidChangeSessions(async p => {
          try {
            ;(await handleProvider(p, r)) !== void 0 &&
              (vscode.commands.executeCommand('setContext', 'github.copilot.activated', !0), updateCopilotStatus(r), u.dispose())
          } catch (d) {
            updateCopilotStatus(r, d), o(d)
          }
        })
      }
      try {
        await r.get(BaseTokenHandler).getCopilotToken(r), vscode.commands.executeCommand('setContext', 'github.copilot.activated', !0)
      } catch (a) {
        r.get(ConnectionSettings).isDNSLookupFailedError(a) && extensionContext.subscriptions.push(registerOfflineCommand(r, o)), updateCopilotStatus(r, a), o(a)
      }
      extensionContext.subscriptions.push(vscode.workspace.onDidChangeConfiguration(a => updateBaseUrlOnConfigChange(a, r)))
      let s = extensionContext.extensionMode !== vscode.ExtensionMode.Development
      initializeWorker(s, r.get(LoggerManager).getLogger('parser proxy')),
      initializeExtension(r),
        ContributionManager.start(r.get(BuildInfo).isPreRelease()),
        n.sendTelemetry('extension.activate')
    })(),
    vscode.ExtensionMode.Test === extensionContext.extensionMode)
  )
    return r
}
async function createContext(extensionContext) {
  let instanceAccessor = new InstanceAccessor()
  instanceAccessor.define(ConfigManager, new WorkspaceConfigManager()),
  instanceAccessor.define(LoggerManager, new LoggerManager([new ConsoleLogger(), new OutputLogger(copilotChatChannel)], instanceAccessor.get(ConfigManager))),
  initializeServices(instanceAccessor),
  instanceAccessor.define(BaseFileSystemOperations, new FileSystemOperations()),
  instanceAccessor.define(extensionContext, extensionContext),
  instanceAccessor.define(EmbeddingsIndex, new EmbeddingsIndex(instanceAccessor)),
  instanceAccessor.define(FileFinder, new FileSearcher(instanceAccessor))
  let tabManager = new TabManager()
  instanceAccessor.define(BaseTabManager, tabManager),
  instanceAccessor.define(BaseGitExtensionService, new GitExtensionService(instanceAccessor)),
  instanceAccessor.define(BaseGitRepositoryManager, new GitRepositoryManager(tabManager)),
  instanceAccessor.define(DiagnosticWaiter, new DiagnosticListener()),
  instanceAccessor.define(BaseVSCodeInfoProvider, new VSCodeInfoProvider()),
  instanceAccessor.define(BaseSymbolProvider, new SymbolProvider()),
  instanceAccessor.define(BaseKerberosLoader, new KerberosLoader()),
  instanceAccessor.define(BaseCertificateLoader, new CertificateLoader()),
  instanceAccessor.define(BaseTerminalInfoProvider, new TerminalInfoProvider()),
  instanceAccessor.define(DisposableClass, new DebugConsole()),
  instanceAccessor.define(ExperimentManager, new ExperimentManager(instanceAccessor)),
  instanceAccessor.define(ChatAgentServiceIdentifier, new ExtensionProvider(instanceAccessor))
  let internalAIKey = extensionContext.extension.packageJSON.internalAIKey ?? '',
    ariaKey = extensionContext.extension.packageJSON.ariaKey ?? ''
  if (extensionContext.extensionMode === vscode.ExtensionMode.Test)
    instanceAccessor.define(EnvironmentFlags, EnvironmentFlags.fromEnvironment(true)),
      instanceAccessor.define(BaseTokenHandler, getTokenHandler()),
      instanceAccessor.define(BaseUrlOpener, new UrlOpener()),
      await setupTelemetryAndExperimentationService(instanceAccessor, extensionContext, internalAIKey, ariaKey, 'copilot-test', true)
  else {
    let tokenHandler = new TokenHandler(instanceAccessor.get(ConfigManager))
    extensionContext.subscriptions.push(tokenHandler),
      instanceAccessor.define(BaseTokenHandler, tokenHandler),
      instanceAccessor.define(BaseExperimentFetcher, new DefaultExperimentFetcher()),
      await setupTelemetryAndExperimentationService(instanceAccessor, extensionContext, internalAIKey, ariaKey, extensionContext.extension.packageJSON.name, vscode.env.isTelemetryEnabled)
    let useNodeFetcher = await instanceAccessor.get(IExperimentationService).getTreatmentVariableAsync('vscode', 'copilotchat.useNodeFetcher', true),
      debugUseNodeFetcher = instanceAccessor.get(ConfigManager).getConfig(settings.DebugUseNodeFetcher) || useNodeFetcher
    instanceAccessor.define(ConnectionSettings, debugUseNodeFetcher ? new NetworkManager(instanceAccessor.get(BuildInfo)) : new ConnectionManager(instanceAccessor))
  }
  instanceAccessor.define(DataRetriever, new ChatMLFetcher(instanceAccessor)),
  instanceAccessor.define(Tokenizer, new Tokenizer()),
  instanceAccessor.define(EmbeddingsComputer, new EmbeddingComputer(instanceAccessor)),
  instanceAccessor.define(Reporter, new FeedbackReporter(instanceAccessor)),
  instanceAccessor.define(NotificationHandler, new WarningNotificationHandler()),
  instanceAccessor.define(BaseVscodeEnvironment, new Environment()),
  instanceAccessor.define(BaseGithubApiService, new GithubApiService(instanceAccessor.get(ConfigManager))),
  instanceAccessor.define(conversationOptions, {
    maxResponseTokens: undefined,
    temperature: 0.1,
    topP: 1,
    additionalPromptContext: instanceAccessor.get(ConfigManager).getConfig(settings.ConversationAdditionalPromptContext),
    rejectionMessage: Bx.t('Sorry, but I can only assist with programming related questions.'),
  }),
  handleProxyConfigurationChange(instanceAccessor.get(ConnectionSettings), process.env),
  registerExperimentFilters(instanceAccessor)
let workspaceManager = new WorkspaceManager(instanceAccessor)
instanceAccessor.define(WorkspaceClass, workspaceManager),
  instanceAccessor.define(CommandRelatedInfoProvider, new CommandRelatedInfoProvider(instanceAccessor, instanceAccessor.get(EmbeddingsComputer))),
  instanceAccessor.define(SettingsRelatedInfoProvider, new SettingsRelatedInfoProvider(instanceAccessor, instanceAccessor.get(EmbeddingsComputer))),
  instanceAccessor.define(IndexLoader, new IndexLoader(instanceAccessor)),
  instanceAccessor.define(WorkspaceChunkSearch, new WorkspaceChunkSearch(instanceAccessor)),
  instanceAccessor.define(ProjectManager, new ProjectManager(instanceAccessor)),
  instanceAccessor.define(ChatEngine, new ChatEngine(instanceAccessor)),
  instanceAccessor.define(GitContextModelIdentifier, new GitExtensionHandler()),
  instanceAccessor.define(BaseVariableResolver, new VariableResolver(instanceAccessor))
  let workspaceIgnoreFileHandler = new WorkspaceIgnoreFileHandler(instanceAccessor)
  return instanceAccessor.define(IgnoreServiceIdentifier, workspaceIgnoreFileHandler), extensionContext.subscriptions.push(workspaceIgnoreFileHandler), workspaceIgnoreFileHandler.init(), instanceAccessor.seal(), instanceAccessor
}
async function setupExperimentationService(instanceAccessor, extensionContext) {
  if (vscode.ExtensionMode.Production === extensionContext.extensionMode) {
    let telemetryService = instanceAccessor.get(IMSTelemetryService),
      experimentationService = await getExperimentationService(extensionContext, telemetryService, instanceAccessor.get(BuildInfo).isPreRelease())
    instanceAccessor.define(IExperimentationService, experimentationService)
  } else instanceAccessor.define(IExperimentationService, new ExperimentationService())
}
async function setupTelemetryAndExperimentationService(instanceAccessor, extensionContext, internalAIKey, ariaKey, extensionName, isTelemetryEnabled) {
  let telemetrySetup = await setupTelemetry(instanceAccessor, extensionName, isTelemetryEnabled),
    onTelemetryEnabledChange = vscode.env.onDidChangeTelemetryEnabled(async telemetryEnabled => {
      telemetrySetup?.dispose(), (telemetrySetup = await setupTelemetry(instanceAccessor, extensionContext.extension.packageJSON.name, telemetryEnabled && vscode.env.isTelemetryEnabled))
    })
  extensionContext.subscriptions.push(onTelemetryEnabledChange),
    extensionContext.subscriptions.push(new vscode.Disposable(() => telemetrySetup?.dispose())),
    vscode.ExtensionMode.Production === extensionContext.extensionMode
      ? instanceAccessor.define(IMSTelemetryService, new TelemetryManager(instanceAccessor.get(ConfigManager), internalAIKey, ariaKey, instanceAccessor.get(EventEmitter), extensionContext))
      : instanceAccessor.define(IMSTelemetryService, new TelemetryManager()),
      setupExperimentationService(instanceAccessor, extensionContext)
}
function deactivateExtension(context) {
  return {
    dispose: async () => {
      let telemetry = context.get(IGHTelemetryService)
      await telemetry.sendTelemetry('extension.deactivate'), telemetry.deactivate(), terminateWorker()
    },
  }
}
var CopilotStatus = {
  Offline: 'github.copilot.offline',
  IndividualDisabled: 'github.copilot.interactiveSession.individual.disabled',
  IndividualExpired: 'github.copilot.interactiveSession.individual.expired',
  EnterpriseDisabled: 'github.copilot.interactiveSession.enterprise.disabled',
}

function updateCopilotStatus(context, error) {
  let statusValues = Object.values(CopilotStatus),
    status;
  context.get(ConnectionSettings).isDNSLookupFailedError(error)
    ? (status = CopilotStatus.Offline)
    : error instanceof NoAccessError
    ? (status = CopilotStatus.IndividualDisabled)
    : error instanceof SubscriptionEndedError
    ? (status = CopilotStatus.IndividualExpired)
    : error instanceof EnterpriseAdminContactError && (status = CopilotStatus.EnterpriseDisabled);
  status && vscode.commands.executeCommand('setContext', status, true);
  for (let value of statusValues) value !== status && vscode.commands.executeCommand('setContext', value, false);
}

function registerOfflineCommand(context, errorHandler) {
  return vscode.commands.registerCommand('github.copilot.offline', async () => {
    try {
      await context.get(BaseTokenHandler).getCopilotToken(context),
        vscode.commands.executeCommand('setContext', 'github.copilot.activated', true),
        updateCopilotStatus(context);
    } catch (error) {
      if (context.get(ConnectionSettings).isDNSLookupFailedError(error)) return;
      updateCopilotStatus(context, error), errorHandler(error);
    }
  });
}
0 && (module.exports = { activate, createExtensionContext, onDeactivate })
//!!! DO NOT modify, this file was COPIED from 'microsoft/vscode'
/*! Bundled license information:

@microsoft/applicationinsights-web-snippet/dist/esm/applicationinsights-web-snippet.js:
  (*!
   * Application Insights JavaScript SDK - Web Snippet, 1.0.1
   * Copyright (c) Microsoft and contributors. All rights reserved.
   *)

mime-db/index.js:
  (*!
   * mime-db
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015-2022 Douglas Christopher Wilson
   * MIT Licensed
   *)

mime-types/index.js:
  (*!
   * mime-types
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
