export default function AssumedBadge({ isAssumed, label }) {
  if (!isAssumed) return null;
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 italic font-medium ml-1">
      {label || 'Assumed'}
    </span>
  );
}
