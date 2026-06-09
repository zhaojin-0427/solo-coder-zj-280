import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  header?: ReactNode;
}

const PageContainer = ({ children, className, title, subtitle, header }: PageContainerProps) => {
  return (
    <div className="min-h-screen bg-background pt-20 md:pt-16 pb-8">
      <div className={cn('max-w-7xl mx-auto px-6', className)}>
        {(title || header) && (
          <div className="mb-8">
            {header || (
              <div>
                {title && (
                  <h1
                    className="text-3xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "'Noto Serif SC', serif" }}
                  >
                    {title}
                  </h1>
                )}
                {subtitle && <p className="text-gray-600">{subtitle}</p>}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
