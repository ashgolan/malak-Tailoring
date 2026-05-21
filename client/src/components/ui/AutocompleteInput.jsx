export default function AutocompleteInput({
  value, onChange, suggestions = [], placeholder = "", required = false,
  id, style, onFocus, onBlur,
}) {
  const listId = id ? `list-${id}` : `list-${Math.random()}`;
  return (
    <>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        list={listId}
        autoComplete="off"
        style={style}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <datalist id={listId}>
        {[...new Set(suggestions)].filter(Boolean).sort().map((s, i) => (
          <option key={i} value={s} />
        ))}
      </datalist>
    </>
  );
}