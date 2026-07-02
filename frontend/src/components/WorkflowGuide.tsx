import { ArrowRight, ChatCircleDots, Robot, Sparkle, Users } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

const steps = [
  { label: '添加亲友', helper: '记录生日和关系信息', icon: Users, to: '/add' },
  { label: '导入聊天', helper: '提取沟通风格', icon: ChatCircleDots, to: '/relatives' },
  { label: '生成技能', helper: '沉淀为可复用能力', icon: Sparkle, to: '/skills' },
  { label: '绑定 Agent', helper: '开始稳定对话', icon: Robot, to: '/agents' },
];

export default function WorkflowGuide() {
  return (
    <section className="ios-panel mb-6 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#202123]">推荐流程</h2>
          <p className="mt-0.5 text-xs text-[#6b7280]">先沉淀关系资料，再把它变成可对话的 Agent 能力。</p>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Link key={step.label} to={step.to} className="flex items-center gap-2 rounded-2xl bg-[#f7f7f8] p-3 hover:bg-[#ececf1]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#202123] ring-1 ring-[#e5e7eb]">
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#202123]">{step.label}</p>
                <p className="truncate text-xs text-[#6b7280]">{step.helper}</p>
              </div>
              {index < steps.length - 1 && <ArrowRight size={15} className="hidden shrink-0 text-[#9ca3af] md:block" />}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
