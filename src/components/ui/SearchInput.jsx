const SearchInput = ({ value, onChange }) => (
    <div className="relative w-60">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
            type="text"
            placeholder="Search by name, department..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none"
        />
    </div>
);

export default SearchInput;
