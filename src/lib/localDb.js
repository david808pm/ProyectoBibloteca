const STORAGE_PREFIX = 'localdb:'
const COLLECTIONS = ['books', 'library_users', 'employees', 'loans', 'reservations']

function storageKey(collection) {
  return `${STORAGE_PREFIX}${collection}`
}

function parseStoredValue(value) {
  try {
    return JSON.parse(value) ?? []
  } catch {
    return []
  }
}

function normalizeCollection(collection) {
  if (!COLLECTIONS.includes(collection)) {
    throw new Error(`Colección local desconocida: ${collection}`)
  }
  return collection
}

function generateId(prefix) {
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix.toUpperCase().slice(0, 3)}-${Date.now()}-${random}`
}

export function readLocalCollection(collection) {
  const name = normalizeCollection(collection)
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(storageKey(name))
  const items = parseStoredValue(raw)
  return Array.isArray(items)
    ? items.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : []
}

export function writeLocalCollection(collection, items) {
  const name = normalizeCollection(collection)
  if (typeof window === 'undefined') return []
  window.localStorage.setItem(storageKey(name), JSON.stringify(Array.isArray(items) ? items : []))
  return items
}

export function createLocalRecord(collection, record) {
  const name = normalizeCollection(collection)
  const current = readLocalCollection(name)
  const nextRecord = {
    ...record,
    id: record.id || generateId(name),
    createdAt: record.createdAt || new Date().toISOString(),
  }
  writeLocalCollection(name, [nextRecord, ...current])
  return nextRecord
}

export function updateLocalRecord(collection, id, data) {
  const name = normalizeCollection(collection)
  const current = readLocalCollection(name)
  const updated = current.map((item) => (item.id === id ? { ...item, ...data } : item))
  writeLocalCollection(name, updated)
  return updated.find((item) => item.id === id)
}

export function deleteLocalRecord(collection, id) {
  const name = normalizeCollection(collection)
  const current = readLocalCollection(name)
  const next = current.filter((item) => item.id !== id)
  writeLocalCollection(name, next)
  return true
}

export function countLocalRecords(collection) {
  return readLocalCollection(collection).length
}

export function getLocalRecord(collection, id) {
  const current = readLocalCollection(collection)
  return current.find((item) => item.id === id)
}
