import React from 'react';
import Papa from 'papaparse';

export default function CSVUploader({ onUpload, currentFileName, onClear }) {
    const handleFile = (e) => {
        const file = e.target.files[0];
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                onUpload(results.meta.fields, results.data, file?.name || '');
            }
        });
    };

    return (
        <div>
            <label className="uploader">
                <input className="uploader-input" type="file" accept=".csv" onChange={handleFile} />
                <div className="uploader-ui">
                    <div className="uploader-title">Click to upload CSV</div>
                    <div className="uploader-sub">or drag and drop</div>
                </div>
            </label>
            {currentFileName && (
                <div className="subtext" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: '8px'}}>
                    <span>Current file: <strong>{currentFileName}</strong></span>
                    <button className="button small" onClick={onClear}>Clear</button>
                </div>
            )}
        </div>
    );
}
