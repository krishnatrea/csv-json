import React from 'react';

export default function MappingHistory({ mappings, selectedId, onLoad, onDelete, onCreateNew }) {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="app-title">Quick Data Mapper</div>
                <div className="muted">Saved mappings</div>
                <button className="button small full" onClick={onCreateNew}>New Mapping</button>
            </div>
            <div className="mapping-list">
                {mappings.length === 0 && (
                    <div className="empty">No saved mappings yet</div>
                )}
                {mappings.map((m) => (
                    <div key={m.id} className={`mapping-item ${selectedId === m.id ? 'active' : ''}`}>
                        <button className="mapping-item-main" onClick={() => onLoad(m.id)}>
                            <div className="mapping-name">{m.name}</div>
                            <div className="mapping-meta">{new Date(m.updatedAt).toLocaleString()}</div>
                        </button>
                        <button className="icon-button danger" aria-label="Delete mapping" onClick={(e) => { e.stopPropagation(); onDelete(m.id); }}>
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}


