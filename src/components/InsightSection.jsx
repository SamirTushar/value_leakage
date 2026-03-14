import RunningCommentary from './RunningCommentary';
import MiniGapCards from './MiniGapCards';
import TotalDisplay from './TotalDisplay';

export default function InsightSection({ inputs, benchmarks, contradictions, gaps, hasDIO, onViewBreakdown, llmParagraph, llmLoading }) {
  const hasRevenue = inputs.revenue != null;

  if (!benchmarks || !hasRevenue) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-400">Select an industry and enter revenue to begin the diagnostic.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <RunningCommentary
        inputs={inputs}
        benchmarks={benchmarks}
        contradictions={contradictions}
        gaps={gaps}
        llmParagraph={llmParagraph}
        llmLoading={llmLoading}
      />
      {!gaps.gap1Only && <MiniGapCards gaps={gaps} />}
      <TotalDisplay
        total={gaps.total}
        totalPctOfRevenue={gaps.totalPctOfRevenue}
        hasDIO={hasDIO}
        gap1Only={gaps.gap1Only}
        onViewBreakdown={onViewBreakdown}
      />
    </div>
  );
}
