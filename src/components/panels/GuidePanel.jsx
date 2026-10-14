import { guideSteps } from '../../data/guideSteps';

export default function GuidePanel() {
  return (
    <div className="panel-inner">
      {guideSteps.map((step, i) => (
        <div
          key={i}
          className="flex items-start gap-4 px-6 py-4 border-b border-white/[0.08] last:border-b-0"
        >
          <span className="w-7 h-7 bg-ps-blue rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0">
            {i + 1}
          </span>
          <p
            className="text-sm text-white/70 leading-relaxed pt-[3px] [&>strong]:text-white"
            dangerouslySetInnerHTML={{ __html: step.text }}
          />
        </div>
      ))}
    </div>
  );
}
