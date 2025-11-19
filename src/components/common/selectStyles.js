const selectStyles = {
  control: (base) => ({
    ...base,
    borderColor: "#e5e7eb",
    borderRadius: "10px",
    padding: "2px",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#4561db",
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#4561db"
      : state.isFocused
      ? "#e0e7ff"
      : "white",
    color: state.isSelected ? "white" : "#0b1120",
    fontSize: "14px",
  }),
  input: (base) => ({ ...base, color: "#0b1120" }),
  singleValue: (base) => ({ ...base, color: "#0b1120" }),
  placeholder: (base) => ({ ...base, color: "#9ca3af" }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export default selectStyles;
