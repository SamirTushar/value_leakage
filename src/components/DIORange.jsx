export default function DIORange({ dio, medianDIO, bestDIO }) {
  const maxScale = Math.max(dio, medianDIO, bestDIO) * 1.2;
  const bestPct = (bestDIO / maxScale) * 100;
  const medianPct = (medianDIO / maxScale) * 100;
  const dioPct = (dio / maxScale) * 100;

  return (
    <div className="mt-4">
      <div className="relative h-8 bg-gray-100 rounded-full overflow-visible">
        {/* Track fill up to company DIO */}
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: `${dioPct}%`,
            background: dio > medianDIO
              ? 'linear-gradient(90deg, #DBEAFE 0%, #93C5FD 50%, #EF4444 100%)'
              : 'linear-gradient(90deg, #DBEAFE 0%, #93C5FD 100%)',
          }}
        />

        {/* Best marker */}
        <div
          className="absolute top-0 h-full flex flex-col items-center"
          style={{ left: `${bestPct}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-0.5 h-full bg-green-500" />
        </div>

        {/* Median marker */}
        <div
          className="absolute top-0 h-full flex flex-col items-center"
          style={{ left: `${medianPct}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-0.5 h-full bg-gray-400" />
        </div>

        {/* Company DIO marker */}
        <div
          className="absolute top-0 h-full flex flex-col items-center"
          style={{ left: `${dioPct}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-2 h-full bg-blue-600 rounded-full" />
        </div>
      </div>

      {/* Labels */}
      <div className="relative h-5 mt-1 text-[10px] text-gray-500">
        <span
          className="absolute text-green-600 font-medium"
          style={{ left: `${bestPct}%`, transform: 'translateX(-50%)' }}
        >
          {bestDIO} best
        </span>
        <span
          className="absolute text-gray-500 font-medium"
          style={{ left: `${medianPct}%`, transform: 'translateX(-50%)' }}
        >
          {medianDIO} median
        </span>
        <span
          className="absolute text-blue-600 font-bold"
          style={{ left: `${dioPct}%`, transform: 'translateX(-50%)' }}
        >
          {dio} you
        </span>
      </div>
    </div>
  );
}
