export default function ExampleSelector({ examples, selectedId, onSelect }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        Example
      </label>
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-800 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
      >
        <option value="custom">Custom / Enter Your Own</option>
        {examples.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name} ({ex.subtitle})
          </option>
        ))}
      </select>
    </div>
  );
}
