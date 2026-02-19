import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';

const Autocomplete = ({
                          options = [],
                          value = '',
                          onChange,
                          placeholder = '',
                          icon: Icon,
                          name,
                          required = false
                      }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState(value);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setSearch(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearch(value); // Reset search to current value on blur
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    useEffect(() => {
        if (search.trim() === '') {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter(option =>
                option.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredOptions(filtered);
        }
    }, [search, options]);

    const handleInputChange = (e) => {
        setSearch(e.target.value);
        setIsOpen(true);
        // Also call onChange if we want to allow custom values or just to update the parent state
        onChange({target: {name, value: e.target.value}});
    };

    const handleSelect = (option) => {
        onChange({target: {name, value: option}});
        setSearch(option);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {Icon && <Icon className="h-5 w-5 text-gray-400 "/>}
            </div>
            <input
                type="text"
                name={name}
                required={required}
                value={search}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                className="input-field pl-10 w-full"
                placeholder={placeholder}
                autoComplete="off"
            />

            <AnimatePresence>
                {isOpen && filteredOptions.length > 0 && (
                    <motion.ul
                        initial={{opacity: 0, y: -10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                        {filteredOptions.map((option, index) => (
                            <li
                                key={index}
                                onClick={() => handleSelect(option)}
                                className="px-4 py-2 hover:bg-primary-50 cursor-pointer text-sm text-gray-700 transition-colors"
                            >
                                {option}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Autocomplete;
