const STORAGE_KEY = "mappings";

const uuid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

const readRaw = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const writeRaw = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

const normalize = (arr) =>
  arr.map((m, idx) => ({
    id: m.id || uuid(),
    name: m.name || `Mapping ${idx + 1}`,
    schema: m.schema || m,
    createdAt: m.createdAt || new Date().toISOString(),
    updatedAt: m.updatedAt || new Date().toISOString()
  }));

export const listMappings = () => {
  const normalized = normalize(readRaw());
  // If normalization added fields, persist once
  writeRaw(normalized);
  return normalized.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

export const createMapping = (name, schema) => {
  const mappings = listMappings();
  const item = {
    id: uuid(),
    name: name || `Mapping ${mappings.length + 1}`,
    schema,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  writeRaw([item, ...mappings]);
  return item;
};

export const getMapping = (id) => listMappings().find((m) => m.id === id) || null;

export const updateMapping = (id, updates) => {
  const mappings = listMappings();
  const next = mappings.map((m) =>
    m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
  );
  writeRaw(next);
  return next.find((m) => m.id === id) || null;
};

export const deleteMapping = (id) => {
  const mappings = listMappings();
  const next = mappings.filter((m) => m.id !== id);
  writeRaw(next);
  return true;
};

export const clearMappings = () => {
  writeRaw([]);
};

// Backwards compatibility exports
export const saveMapping = (name, schema) => {
  return createMapping(name, schema);
};

export const getMappings = () => {
  return listMappings();
};
