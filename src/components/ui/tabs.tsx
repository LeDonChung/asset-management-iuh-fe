'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('space-y-2', className)}
    {...props}
  />
));
Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }

  const { activeTab, setActiveTab } = context;

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        activeTab === value ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50 hover:text-foreground',
        className
      )}
      onClick={() => setActiveTab(value)}
      {...props}
    />
  );
});
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }

  const { activeTab } = context;

  if (activeTab !== value) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        'mt-2 rounded-md p-4',
        className
      )}
      {...props}
    />
  );
});
TabsContent.displayName = 'TabsContent';

// Create context for Tab state
interface TabsContextType {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

interface TabsProviderProps {
  value: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const TabsProvider: React.FC<TabsProviderProps> = ({ 
  children, 
  value: externalValue,
  onValueChange
}) => {
  const [localValue, setLocalValue] = React.useState(externalValue);
  
  const value = React.useMemo(() => {
    const setValue = (newValue: string | ((prev: string) => string)) => {
      if (typeof newValue === 'function') {
        const updatedValue = newValue(localValue);
        setLocalValue(updatedValue);
        onValueChange?.(updatedValue);
      } else {
        setLocalValue(newValue);
        onValueChange?.(newValue);
      }
    };
    
    return {
      activeTab: externalValue || localValue,
      setActiveTab: setValue,
    };
  }, [externalValue, localValue, onValueChange]);

  React.useEffect(() => {
    if (externalValue !== localValue) {
      setLocalValue(externalValue);
    }
  }, [externalValue]);

  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
};

// Export a wrapped Tabs component that provides context
const TabsWithProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    value: string;
    onValueChange?: (value: string) => void;
  }
>(({ value, onValueChange, ...props }, ref) => (
  <TabsProvider value={value} onValueChange={onValueChange}>
    <Tabs ref={ref} {...props} />
  </TabsProvider>
));
TabsWithProvider.displayName = 'Tabs';

export { TabsWithProvider as Tabs, TabsList, TabsTrigger, TabsContent };
