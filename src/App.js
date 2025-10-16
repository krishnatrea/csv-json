import React, { useEffect, useMemo, useState } from 'react';
import CSVUploader from './components/CSVUploader';
import FieldMapper from './components/FieldMapper';
import MappingPreview from './components/MappingPreview';
import MappingHistory from './components/MappingHistory';
import { createMapping, listMappings, updateMapping, deleteMapping, getMapping } from './localStorage';

function App() {
  const [sourceFields, setSourceFields] = useState([]);
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [mapping, setMapping] = useState({});
  const [targetFields, setTargetFields] = useState(["Name", "SKU", "Quantity", "Location"]);
  const [sessionTargets, setSessionTargets] = useState([]); // targets added within mapper for this session only
  const [mappings, setMappings] = useState([]);
  const [activeMappingId, setActiveMappingId] = useState(null);
  const [mappingName, setMappingName] = useState("My Mapping");

  useEffect(() => {
    const all = listMappings();
    setMappings(all);
    if (all.length > 0 && !activeMappingId) {
      setActiveMappingId(all[0].id);
      setMapping(all[0].schema || {});
      setMappingName(all[0].name || 'My Mapping');
    }
  }, []);

  const handleUpload = (fields, rows, name) => {
    setSourceFields(fields);
    setData(rows);
    setFileName(name || "");
  };

  const handleSaveMapping = (map, { asNew } = {}) => {
    setMapping(map);
    if (activeMappingId && !asNew) {
      updateMapping(activeMappingId, { schema: map });
    } else {
      const created = createMapping(mappingName || "My Mapping", map);
      setActiveMappingId(created.id);
    }
    setMappings(listMappings());
  };

  const allTargets = useMemo(() => Array.from(new Set([...targetFields, ...sessionTargets])), [targetFields, sessionTargets]);
  const addSessionTarget = (label) => {
    const value = (label || "").trim();
    if (!value) return;
    if (!allTargets.includes(value)) setSessionTargets([value, ...sessionTargets]);
  };

  const handleLoadMapping = (id) => {
    const loaded = getMapping(id);
    if (loaded) {
      setActiveMappingId(id);
      setMapping(loaded.schema || {});
    }
  };

  const handleDeleteMapping = (id) => {
    deleteMapping(id);
    setMappings(listMappings());
    if (activeMappingId === id) {
      setActiveMappingId(null);
      setMapping({});
    }
  };

  return (
    <div className="app-layout">
      <MappingHistory
        mappings={mappings}
        selectedId={activeMappingId}
        onLoad={handleLoadMapping}
        onDelete={handleDeleteMapping}
        onCreateNew={() => { setActiveMappingId(null); setMapping({}); setMappingName("Untitled Mapping"); }}
      />
      <div className="main">
        <header className="header">
          <div className="header-title">Data Mapping</div>
          <div className="header-actions">
            <input className="input" style={{minWidth:'220px'}} placeholder="Mapping name" value={mappingName} onChange={(e)=>setMappingName(e.target.value)} />
            <button className="button" onClick={() => handleSaveMapping(mapping)}>Save</button>
            <button className="button" onClick={() => handleSaveMapping(mapping, { asNew: true })}>Save As New</button>
          </div>
        </header>
        <div className="content">
          <div className="card">
            <div className="card-title">Upload CSV</div>
            <div className="subtext">Upload your source file. Columns become source fields you can map.</div>
            <CSVUploader onUpload={handleUpload} currentFileName={fileName} onClear={()=>{ setSourceFields([]); setData([]); setFileName(""); }} />
          </div>
          {sourceFields.length > 0 && (
            <div className="card">
              <div className="card-title">Field Mapper</div>
              <div className="subtext">Target fields are the names you want in your final dataset. Map each source column to one target field.</div>
              <FieldMapper
                sourceFields={sourceFields}
                targetFields={allTargets}
                value={mapping}
                onAddTarget={addSessionTarget}
                onApply={(map)=> setMapping(map)}
              />
            </div>
          )}
          {Object.keys(mapping).length > 0 && (
            <div className="card">
              <div className="card-title">Preview</div>
              <div className="subtext">Preview shows what your output looks like after applying the mapping.</div>
              <MappingPreview mapping={mapping} data={data} />
            </div>
          )}
          <div className="card">
            <div className="card-title">Demo steps</div>
            <ol className="list">
              <li>Upload a CSV file with headers (e.g. first_name, sku_code, qty, warehouse).</li>
              <li>For each source column, pick a target field from the dropdown.</li>
              <li>Need a new target? Type it inline in the dropdown input, press Enter to add it for this mapping only.</li>
              <li>Click Save or Save As New to store this mapping. Use the left sidebar to re-open or create another.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
