const FilterSelect = ({ label, value, onChange, options }) => (
    <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">{label}:</label>
        <select
            className="border px-2 py-1 rounded"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">All</option>
            {options.map((option, index) => (
                <option key={index} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
);

export default FilterSelect;
