import React, { useEffect, useState } from 'react';

export default function FieldMapper({ sourceFields, targetFields, value, onAddTarget, onApply }) {
    const [mapping, setMapping] = useState(value || {});
    const [comboTextBySource, setComboTextBySource] = useState({});
    const [openBySource, setOpenBySource] = useState({});

    const handleChange = (source, target) => {
        const next = { ...mapping, [source]: target };
        setMapping(next);
    };

    useEffect(() => {
        // hydrate from parent-provided value when it changes (e.g., after refresh/load)
        if (value && typeof value === 'object') {
            setMapping(value);
        }
    }, [value]);



    return (
        <div className="mapper">
            <div className="subtext">Select which target field each source column should fill.</div>
            <div className="mapper-grid">
                {sourceFields.map(field => {
                    const query = (comboTextBySource[field] ?? '');
                    const suggestions = targetFields.filter(t => t.includes(query));
                    const showAdd = query && !targetFields.some(t => t === query);
                    return (
                        <div key={field} className="mapper-row">
                            <div className="pill">{field}</div>
                            <div className="arrow">→</div>
                            <div className="combobox">
                                <input
                                    className="combo-input"
                                    placeholder="Search or add target"
                                    value={openBySource[field] ? (comboTextBySource[field] ?? '') : ((comboTextBySource[field] && comboTextBySource[field].length) ? comboTextBySource[field] : (mapping[field] || ''))}
                                    onChange={(e) => { setComboTextBySource({ ...comboTextBySource, [field]: e.target.value }); setOpenBySource({ ...openBySource, [field]: true }); }}
                                    onFocus={() => setOpenBySource({ ...openBySource, [field]: true })}
                                    onBlur={() => setTimeout(() => setOpenBySource(prev => ({ ...prev, [field]: false })), 120)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const raw = (comboTextBySource[field] ?? '').trim();
                                            if (!raw) return;
                                            if (!targetFields.includes(raw)) onAddTarget?.(raw);
                                            handleChange(field, raw);
                                            setComboTextBySource({ ...comboTextBySource, [field]: '' });
                                            setOpenBySource(prev => ({ ...prev, [field]: false }));
                                        }
                                        if (e.key === 'Escape') {
                                            setOpenBySource(prev => ({ ...prev, [field]: false }));
                                        }
                                    }}
                                />
                                {openBySource[field] && (suggestions.length > 0 || showAdd) && (
                                    <div className="combo-list">
                                        {suggestions.map(s => (
                                            <button
                                                key={s}
                                                className="combo-item"
                                                type="button"
                                                onMouseDown={(e) => { e.preventDefault(); handleChange(field, s); setComboTextBySource({ ...comboTextBySource, [field]: '' }); setOpenBySource(prev => ({ ...prev, [field]: false })); }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                        {showAdd && (
                                            <button
                                                type="button"
                                                className="combo-item add"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    const val = (comboTextBySource[field] || '').trim();
                                                    if (!val) return;
                                                    onAddTarget?.(val);
                                                    handleChange(field, val);
                                                    setComboTextBySource({ ...comboTextBySource, [field]: '' });
                                                    setOpenBySource(prev => ({ ...prev, [field]: false }));
                                                }}
                                            >
                                                + Add "{comboTextBySource[field]}"
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mapper-actions">
                <button className="button" onClick={() => onApply?.(mapping)}>Map to JSON</button>
            </div>
        </div>
    );
}
