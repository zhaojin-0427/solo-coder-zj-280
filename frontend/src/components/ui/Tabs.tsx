import { ReactNode, useState } from 'react';
import { cn } from '../../lib/utils';

interface TabItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onTabChange?: (key: string) => void;
  children: ReactNode;
  className?: string;
}

const Tabs = ({ tabs, defaultTab, onTabChange, children, className }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    onTabChange?.(key);
  };

  return (
    <div className={className}>
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={cn(
              'flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all duration-200',
              'border-b-2 -mb-px',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
};

interface TabPanelProps {
  tabKey: string;
  activeTab: string;
  children: ReactNode;
}

const TabPanel = ({ tabKey, activeTab, children }: TabPanelProps) => {
  if (tabKey !== activeTab) return null;
  return <div className="animate-fadeIn">{children}</div>;
};

export { Tabs, TabPanel };
