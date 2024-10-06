import React from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const CustomInput = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  showPasswordToggle,
  togglePasswordVisibility,
}) => {
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="block border border-grey-light w-full p-3 rounded mb-4"
        autoComplete="off"
      />
      {(name === "password" || name === "confirm_password") && (
        <span
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-4 cursor-pointer text-black/80 hover:text-black/40"
        >
          {showPasswordToggle ? <FaRegEyeSlash /> : <FaRegEye />}
        </span>
      )}
    </div>
  );
};

export default CustomInput;
