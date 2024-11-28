import React, { useState, useRef } from "react";
import { MdOutlineSearch } from "react-icons/md";

const Search = ({ placeholder, onSearch }) => {
  const [term, setTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleChange = (event) => {
    const value = event.target.value;
    setTerm(value);
    onSearch(value); // Llama a la función onSearch con el nuevo término
  };

  const handleDivClick = () => {
    inputRef.current.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div
      className={`caja_busqueda ${isFocused ? "focused" : ""}`}
      onClick={handleDivClick}
    >
      <input
        type="text"
        ref={inputRef}
        value={term}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="input_busqueda"
      />
      <MdOutlineSearch />
    </div>
  );
};

export default Search;
