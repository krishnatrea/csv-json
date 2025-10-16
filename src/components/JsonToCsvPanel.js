import React, { useMemo, useState } from 'react';

export default function JsonToCsvPanel({ mapping }) {
    const [jsonText, setJsonText] = useState('');
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');

    const reverse = useMemo(() => {
        const rev = {};
        for (const s in mapping) { rev[mapping[s]] = s; }
        return rev;
    }, [mapping]);

    const toCSV = (rows) => {
        if (!rows.length) return '';
        const headers = Object.keys(rows[0]);
        const escape = (v) => {
            const s = v == null ? '' : String(v);
            return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        };
        const body = rows.map(r => headers.map(h => escape(r[h])).join(',')).join('\n');
        return [headers.join(','), body].filter(Boolean).join('\n');
    };

    const applyReverseMapping = (rows) => {
        // mapping: source -> target, reverse: target -> source
        return rows.map(row => {
            const out = {};
            for (const t in reverse) {
                out[t] = row[t];
            }
            return out;
        });
    };

    const handleDownloadCsv = () => {
        try {
            const parsed = JSON.parse(jsonText || '[]');
            const array = Array.isArray(parsed) ? parsed : [];
            const normalized = applyReverseMapping(array);
            const csv = toCSV(normalized);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'from-json.csv'; a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            alert('Invalid JSON');
        }
    };

    const handleFile = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const text = String(reader.result || '');
                // basic validate
                JSON.parse(text);
                setJsonText(text);
                setFileName(file.name || '');
                setError('');
            } catch (err) {
                setError('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    const clearJson = () => {
        setJsonText('');
        setFileName('');
        setError('');
    };

    // Preview conversion
    let previewRows = [];
    let previewHeaders = [];
    try {
        const parsed = JSON.parse(jsonText || '[]');
        const array = Array.isArray(parsed) ? parsed : [];
        const normalized = applyReverseMapping(array);
        previewRows = normalized.slice(0, 20);
        previewHeaders = previewRows.length ? Object.keys(previewRows[0]) : Object.keys(reverse);
    } catch (e) {
        // ignore; error already surfaced by actions
    }

    return (
        <div>
            <div className="subtext">Upload or paste a JSON array using target field names, then convert to CSV.</div>
            <label className="uploader" style={{marginBottom:'8px'}}>
                <input className="uploader-input" type="file" accept=".json,application/json" onChange={handleFile} />
                <div className="uploader-ui">
                    <div className="uploader-title">Click to upload JSON</div>
                    <div className="uploader-sub">or paste below</div>
                </div>
            </label>
            {fileName && (
                <div className="subtext" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: '4px'}}>
                    <span>Current file: <strong>{fileName}</strong></span>
                    <button className="button small" onClick={clearJson}>Clear</button>
                </div>
            )}
            {error && (
                <div className="hint" style={{marginTop:'6px'}}>{error}</div>
            )}
            <div style={{marginTop:'10px'}}>
                <div className="subtext">Field mapping (source → target)</div>
                <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                    {Object.keys(mapping).length === 0 && (
                        <div className="hint">No mapping selected yet. Switch to CSV → JSON to create one.</div>
                    )}
                    {Object.entries(mapping).map(([source, target]) => (
                        <div key={source} className="pill">{source} → {target}</div>
                    ))}
                </div>
            </div>
            <textarea className="input" style={{width:'100%', minHeight:'140px'}} value={jsonText} onChange={(e)=>setJsonText(e.target.value)} placeholder='[{"Name":"Ada"}]' />
            <div style={{marginTop:'8px'}}>
                <button className="button" onClick={handleDownloadCsv}>Convert & Download CSV</button>
            </div>
            <div style={{marginTop:'12px'}}>
                <div className="subtext">Preview (first {previewRows.length} rows)</div>
                <div style={{overflowX:'auto'}}>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                        <thead>
                            <tr>
                                {previewHeaders.map(h => (
                                    <th key={h} style={{textAlign:'left', fontWeight:600, fontSize:12, color:'#cfd8f9', padding:'6px 8px', borderBottom:'1px solid rgba(255,255,255,0.08)'}}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {previewRows.map((r, idx) => (
                                <tr key={idx}>
                                    {previewHeaders.map(h => (
                                        <td key={h} style={{padding:'6px 8px', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>{r[h] != null ? String(r[h]) : ''}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


