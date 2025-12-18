'use client';

import { useState, useRef, useEffect } from 'react';
import './MultiSelect.css';

export default function MultiSelect({
    options = [],
    value = [],
    onChange,
    placeholder = "Select...",
    disabled = false
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
        const newValue = value.includes(optionId)
            ? value.filter(id => id !== optionId)
            : [...value, optionId];
        onChange(newValue);
    };

    const handleRemove = (e, optionId) => {
        e.stopPropagation();
        onChange(value.filter(id => id !== optionId));
    };

    // Get selected option objects
    const selectedOptions = options.filter(opt => value.includes(opt.id));

    return (
        <div className="multiSelectContainer" ref={containerRef}>
            <div className="multiSelectTrigger" onClick={handleToggle}>
                {selectedOptions.map(option => (
                    <span key={option.id} className="selectedTag">
                        {option.name}
                        <span
                            className="removeTag"
                            onClick={(e) => handleRemove(e, option.id)}
                        >
                            ×
                        </span>
                    </span>
                ))}

                <input
                    ref={inputRef}
                    type="text"
                    className="searchInput"
                    placeholder={selectedOptions.length === 0 ? placeholder : ""}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled}
                />
            </div>

            <div className={`dropdownMenu ${isOpen ? 'open' : ''}`}>
                {filteredOptions.length > 0 ? (
                    filteredOptions.map(option => {
                        const isSelected = value.includes(option.id);
                        return (
                            <div
                                key={option.id}
                                className={`dropdownItem ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSelect(option.id)}
                            >
                                <div className="checkbox">
                                    <span className="checkIcon">✔</span>
                                </div>
                                {option.name}
                            </div>
                        );
                    })
                ) : (
                    <div className="noOptions">
                        No options found
                    </div>
                )}
            </div>
        </div>
    );
}
