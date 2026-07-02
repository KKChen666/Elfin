import { ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export type NextStepAction = {
  label: string;
  to: string;
  primary?: boolean;
};

type NextStepPanelProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions: NextStepAction[];
};

export default function NextStepPanel({
  eyebrow = '下一步',
  title,
  description,
  actions,
}: NextStepPanelProps) {
  return (
    <section className="ios-panel mb-5 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium text-[#6b7280]">{eyebrow}</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.01em] text-[#202123]">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6b7280]">{description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {actions.map((action) => (
            <Link
              key={`${action.to}-${action.label}`}
              to={action.to}
              className={action.primary ? 'ios-button-primary' : 'ios-button-secondary'}
            >
              {action.label}
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
