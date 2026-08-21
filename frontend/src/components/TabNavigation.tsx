import { TabKey } from '@/types';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'friction', label: 'Friction Breakdown' },
  { key: 'intent', label: 'Intent Matrix' },
  { key: 'journey', label: 'Journey Tracker' },
  { key: 'opportunity', label: 'Opportunity Matrix' },
  { key: 'discovery', label: 'Discovery Engine' },
  { key: 'segments', label: 'Segments' },
  { key: 'insights', label: 'Insights' },
  { key: 'architecture', label: 'Architecture' },
];

interface TabNavigationProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export function TabNavigation({ active, onChange }: TabNavigationProps) {
  return (
    <div className="flex space-x-1 overflow-x-auto rounded-lg bg-white p-1 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
            active === tab.key
              ? 'bg-myntra-pink text-white'
              : 'text-myntra-text-light hover:bg-myntra-gray'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
