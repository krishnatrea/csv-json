import React, { useMemo } from 'react';

export default function MappingPreview({ mapping, data, showJsonToCsv = false }) {
    const mappedData = useMemo(() => data.map(row => {
        const newRow = {};
        for (let source in mapping) {
            newRow[mapping[source]] = row[source];
        }
        return newRow;
    }), [data, mapping]);

    const copyJSON = () => {
        navigator.clipboard.writeText(JSON.stringify(mappedData, null, 2));
    };

    const download = (content, filename, type) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    };

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

    const handleDownloadJSON = () => download(JSON.stringify(mappedData, null, 2), 'mapped.json', 'application/json');
    const handleDownloadCSV = () => download(toCSV(mappedData), 'mapped.csv', 'text/csv');
    const handleCopyJSON = () => copyJSON();

    return (
        <div className="preview">
            <div className="preview-actions" style={{display:'flex', gap: '8px', marginBottom: '8px'}}>
                <button className="button small" onClick={handleCopyJSON}>Copy JSON</button>
                <button className="button small" onClick={handleDownloadJSON}>Download JSON</button>
                <button className="button small" onClick={handleDownloadCSV}>Download CSV</button>
            </div>
            <pre className="pre">{JSON.stringify(mappedData.slice(0, 50), null, 2)}</pre>
            {showJsonToCsv && (
                <div style={{marginTop: '12px'}}>
                    <div className="subtext">JSON to CSV panel moved to dedicated section.</div>
                </div>
            )}
        </div>
    );
}
