import { TabKey } from '@/types';

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'friction', label: 'Friction Breakdown', icon: '⚡' },
  { key: 'intent', label: 'Intent Matrix', icon: '🎯' },
  { key: 'journey', label: 'Journey Tracker', icon: '🛤️' },
  { key: 'opportunity', label: 'Opportunity Matrix', icon: '💡' },
  { key: 'behavioural', label: 'Behavioural Analysis', icon: '🧠' },
  { key: 'discovery', label: 'Discovery Engine', icon: '🔍' },
  { key: 'segments', label: 'Segments', icon: '👥' },
  { key: 'insights', label: 'Insights', icon: '📈' },
  { key: 'architecture', label: 'Architecture', icon: '🏗️' },
];

interface TabNavigationProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export function TabNavigation({ active, onChange }: TabNavigationProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto rounded-2xl bg-white p-2 shadow-md">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
            active === tab.key
              ? 'bg-gradient-to-r from-myntra-pink to-myntra-orange text-white shadow-md scale-[1.02]'
              : 'text-myntra-text-light hover:bg-myntra-pink/5 hover:text-myntra-pink'
          }`}
        >
          <span className="text-base">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
