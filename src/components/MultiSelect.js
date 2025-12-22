'use client';

import { useState, useRef, useEffect } from 'react';
import './MultiSelect.css';

export default function MultiSelect({
    options = [],
    value = [],
    onChange,
    placeholder = "Select...",
    disabled = false,
    onAddNew,
    singleSelect = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Filter options based on search
    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setTimeout(() => inputRef.current?.focus(), 0);
            }
        }
    };

    const handleSelect = (optionId) => {
        if (singleSelect) {
            onChange([optionId]);
            setIsOpen(false);
        } else {
            const newValue = value.includes(optionId)
                ? value.filter(id => id !== optionId)
                : [...value, optionId];
            onChange(newValue);
        }
    };

    const handleRemove = (e, optionId) => {
        e.stopPropagation();
        onChange(value.filter(id => id !== optionId));
    };

    // Get selected option objects
    const selectedOptions = options.filter(opt => value.includes(opt.id));

    return (
        <div className="msContainer" ref={containerRef}>
            <div className="msTrigger" onClick={handleToggle}>
                {selectedOptions.length > 0 ? (
                    singleSelect ? (
                        <span className="msSingleSelectedText">
                            {selectedOptions[0].name}
                        </span>
                    ) : (
                        selectedOptions.map(option => (
                            <span key={option.id} className="msSelectedTag">
                                {option.name}
                                <span
                                    className="msRemoveTag"
                                    onClick={(e) => handleRemove(e, option.id)}
                                >
                                    ×
                                </span>
                            </span>
                        ))
                    )
                ) : null}

                <input
                    ref={inputRef}
                    type="text"
                    className="msSearchInput"
                    placeholder={selectedOptions.length === 0 ? placeholder : ""}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled}
                />
            </div>

            <div className={`msDropdownMenu ${isOpen ? 'open' : ''}`}>
                {filteredOptions.length > 0 ? (
                    filteredOptions.map(option => {
                        const isSelected = value.includes(option.id);
                        return (
                            <div
                                key={option.id}
                                className={`msDropdownItem ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSelect(option.id)}
                            >
                                {!singleSelect && (
                                    <div className="msCheckbox">
                                        <span className="msCheckIcon">✔</span>
                                    </div>
                                )}
                                {option.name}
                            </div>
                        );
                    })
                ) : (
                    <div className="msNoOptions">
                        No options found
                    </div>
                )}

                {onAddNew && (
                    <div
                        className="msAddNewOption"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddNew();
                            setIsOpen(false);
                        }}
                    >
                        + Create "{searchTerm || 'New'}"
                    </div>
                )}
            </div>
        </div>
    );
}
