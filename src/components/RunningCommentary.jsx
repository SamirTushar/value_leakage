import { formatCr } from '../utils/formatCurrency';

export default function RunningCommentary({ inputs, benchmarks, contradictions, gaps, llmParagraph, llmLoading }) {
  const b = benchmarks;
  if (!b) return null;

  const { revenue, adjustedAccuracy, reportedAccuracy, accuracyLevel, dio, fillRate, expeditedFreight, industryLabel, companyName } = inputs;
  const name = companyName || 'This company';
  const hasRevenue = revenue != null;
  const hasAccuracy = reportedAccuracy != null && reportedAccuracy !== '';
  const hasDIO = dio != null && dio !== '';
  const hasFillRate = fillRate != null && fillRate !== '';
  const hasExpedited = expeditedFreight != null && expeditedFreight !== '';

  if (!hasRevenue) return null;

  const paragraphs = [];

  // State 1: Revenue known
  paragraphs.push(
    `${name} has ${formatCr(revenue)} in revenue (${industryLabel}). To understand where value is leaking, we need to know how accurate their planning is — that's the upstream driver of everything else.`
  );

  // State 2: Accuracy
  if (hasAccuracy && adjustedAccuracy != null) {
    const bestMAPE = b.bestInClassMAPE.value;
    const gapToBest = (adjustedAccuracy - bestMAPE).toFixed(0);

    if (adjustedAccuracy < 50) {
      paragraphs.push(
        `Forecast accuracy at ${adjustedAccuracy.toFixed(0)}% is ${gapToBest} points below ${industryLabel} best-in-class of ${bestMAPE}%. This means roughly half the time, the plan is materially wrong. The cost of that shows up in inventory — stock buffers compensate for what the forecast misses. If you know their inventory value or DIO, we can size that cost.`
      );
    } else if (adjustedAccuracy <= 65) {
      paragraphs.push(
        `Accuracy at ${adjustedAccuracy.toFixed(0)}% is moderate — ${gapToBest} points off best-in-class of ${bestMAPE}%. There's room to improve and the downstream costs are real but not dramatic. Inventory data will tell us how much they're overcompensating.`
      );
    } else {
      paragraphs.push(
        `Accuracy at ${adjustedAccuracy.toFixed(0)}% is solid — only ${gapToBest} points from best-in-class of ${bestMAPE}%. If this is measured at SKU-week level, they're in the top tier. The value leakage here will be smaller and mostly in fine-tuning rather than structural gaps.`
      );
    }

    if (accuracyLevel !== 'SKU-Week') {
      paragraphs.push(
        `Note: this ${reportedAccuracy}% is at ${accuracyLevel} level. At SKU-week — where replenishment and production decisions actually happen — accuracy is typically around ${adjustedAccuracy.toFixed(0)}%. That's the number that matters.`
      );
    }
  }

  // State 3: DIO
  if (hasDIO) {
    const medianDIO = b.medianDIO.value;
    const excessDays = dio - medianDIO;

    if (excessDays > 0) {
      const excessInv = gaps.gap3?.excessInventory;
      const carryingCost = gaps.gap3?.value;

      let dioText = `DIO at ${dio} days puts them ${excessDays} days above the ${industryLabel} median of ${medianDIO} days.`;
      if (excessInv != null) {
        dioText += ` That's ${formatCr(excessInv)} in inventory above what peers carry. At ${(b.carryingCostRate.value * 100).toFixed(0)}% carrying cost, that's ${formatCr(carryingCost)}/year in trapped capital.`;
      }
      paragraphs.push(dioText);

      if (hasAccuracy && adjustedAccuracy < 50) {
        paragraphs.push(
          `With accuracy at ${adjustedAccuracy.toFixed(0)}%, this excess is almost certainly safety stock — the planning gap forces inventory to compensate. The money isn't in "reducing inventory" generically. It's in making the forecast good enough that you don't need the buffer.`
        );
      }
    } else {
      paragraphs.push(
        `DIO at ${dio} days is at or below ${industryLabel} median of ${medianDIO} days. Inventory efficiency isn't the issue here. The leakage is elsewhere — likely in freight costs or lost sales.`
      );
    }
  }

  // State 4: Fill Rate — the core contradiction logic
  if (hasFillRate) {
    const medianDIO = b.medianDIO.value;
    const excessDays = dio ? dio - medianDIO : 0;
    const typicalFill = b.typicalFillRate.value;
    const estGap2 = gaps.gap2?.value;

    if (fillRate > 97 && adjustedAccuracy != null && adjustedAccuracy <= 45) {
      // Very high fill + very low accuracy
      paragraphs.push(
        `Here's the contradiction: ${fillRate}% fill rate on ${adjustedAccuracy.toFixed(0)}% accuracy. Those numbers don't add up unless something expensive is in between.${
          gaps.gap3 ? ` We already sized the inventory buffer at ${formatCr(gaps.gap3.value)}/year.` : ''
        } The other bridge is premium freight — if you know roughly what they spend on expedited shipments, we can size that too.${
          estGap2 ? ` If not, industry pattern suggests around ${formatCr(estGap2)}.` : ''
        }`
      );
    } else if (fillRate >= 95 && fillRate <= 97 && adjustedAccuracy != null && adjustedAccuracy <= 45) {
      // Solid fill + low accuracy
      paragraphs.push(
        `Service at ${fillRate}% is solid but accuracy at ${adjustedAccuracy.toFixed(0)}% can't support it alone.${
          hasDIO && excessDays > 0
            ? ` The buffer is in your inventory — the DIO number above (${excessDays} days above median) confirms it.`
            : ' The buffer is likely in excess inventory and freight costs.'
        }`
      );
    } else if (fillRate >= 91 && fillRate <= 94 && adjustedAccuracy != null && adjustedAccuracy < 50) {
      // Slipping fill + low accuracy
      paragraphs.push(
        `Service at ${fillRate}% is already slipping${hasDIO ? ` despite ${dio} days of inventory` : ''}. Accuracy at ${adjustedAccuracy.toFixed(0)}% means the stock isn't positioned where demand actually is.`
      );
    } else if (fillRate > 97 && adjustedAccuracy != null && adjustedAccuracy >= 50 && adjustedAccuracy <= 65) {
      // High fill + moderate accuracy
      paragraphs.push(
        `Fill rate is strong at ${fillRate}%. Accuracy at ${adjustedAccuracy.toFixed(0)}% has room to improve — but the compensation cost is moderate. The question is whether they're overpaying for this service level.`
      );
    } else if (fillRate < 90) {
      // Very low fill
      paragraphs.push(
        `Service at ${fillRate}% is below ${industryLabel} typical of ${typicalFill}%. This is where lost revenue becomes real — not just a benchmark estimate.${
          hasDIO && dio > medianDIO
            ? ` And with DIO at ${dio} days (above median), they're carrying more stock than peers and still not serving customers well. That usually means the wrong products in the wrong places. The cost is double: trapped capital AND lost revenue from stockouts.`
            : ''
        }`
      );
    } else if (fillRate >= 90 && fillRate <= 94 && hasDIO && dio > medianDIO) {
      // Below-average fill + high DIO — Rule 3
      paragraphs.push(
        `Fill rate at ${fillRate}% is below ${industryLabel} typical of ${typicalFill}%. But DIO is ${dio} days — ${excessDays > 0 ? `${excessDays} days above` : 'near'} median. They're carrying more stock than peers and still not serving customers well. That usually means the wrong products in the wrong places.`
      );
    } else if (fillRate > 94 && adjustedAccuracy != null && adjustedAccuracy > 65) {
      // Good metrics overall
      paragraphs.push(
        `Fill rate at ${fillRate}% with accuracy at ${adjustedAccuracy.toFixed(0)}% — this is a healthy combination.${
          hasDIO && excessDays > 0
            ? ` There's still ${formatCr(gaps.gap3?.value)}/year in carrying cost from the ${excessDays}-day DIO gap, but the opportunity is in fine-tuning, not structural change.`
            : ' The opportunity is in closing the gap to best-in-class.'
        }`
      );
    } else {
      // Default with numbers
      paragraphs.push(
        `Fill rate at ${fillRate}% with${hasAccuracy ? ` accuracy at ${adjustedAccuracy.toFixed(0)}%` : ' accuracy unknown'}.${
          hasDIO ? ` DIO at ${dio} days.` : ''
        } See the detailed breakdown for the full cost sizing.`
      );
    }
  }

  // State 5: Expedited freight
  if (hasExpedited) {
    paragraphs.push(
      `Expedited freight at ${formatCr(expeditedFreight)}/year — now we know. That's the premium being paid to keep service at ${fillRate ?? 'current'}%${hasAccuracy ? ` when planning accuracy at ${adjustedAccuracy.toFixed(0)}% can't support it` : ''}. This replaces our estimate with a hard number.`
    );
  }

  // Inject LLM paragraph at the end (will become first after reverse)
  if (llmLoading) {
    paragraphs.push('...');
  } else if (llmParagraph) {
    paragraphs.push(llmParagraph);
  }

  const reversed = [...paragraphs].reverse();

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
      <div className="prose prose-sm max-w-none">
        {reversed.map((p, i) => (
          <p
            key={i}
            className={`text-sm leading-relaxed mb-3 last:mb-0 ${
              i === 0
                ? 'border-l-4 border-teal-500 pl-4 text-gray-800 font-medium'
                : 'text-gray-500'
            }`}
            style={i > 0 ? { opacity: Math.max(0.4, 1 - i * 0.2) } : undefined}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
