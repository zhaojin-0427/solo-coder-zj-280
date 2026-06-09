import { NavLink } from 'react-router-dom';
import {
  Package,
  Calculator,
  Headphones,
  Archive,
  BarChart3,
  Home,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/materials', label: '材料库', icon: Package },
  { to: '/calculator', label: '音高计算器', icon: Calculator },
  { to: '/listener', label: '虚拟试听器', icon: Headphones },
  { to: '/archive', label: '作品归档', icon: Archive },
  { to: '/statistics', label: '统计分析', icon: BarChart3 },
];

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white text-xl">🔔</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                手作风铃工坊
              </h1>
              <p className="text-xs text-gray-500">材料管理 · 音色试听</p>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <nav className="md:hidden flex items-center justify-around px-4 py-2 border-t border-gray-100 bg-white">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-gray-500'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Header;
