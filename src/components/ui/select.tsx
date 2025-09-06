'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    className={cn(
      'block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
));
Select.displayName = 'Select';

const SelectGroup = React.forwardRef<
  HTMLOptGroupElement,
  React.HTMLAttributes<HTMLOptGroupElement>
>(({ className, ...props }, ref) => (
  <optgroup
    className={cn('', className)}
    ref={ref}
    {...props}
  />
));
SelectGroup.displayName = 'SelectGroup';

const SelectOption = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, ...props }, ref) => (
  <option
    className={cn('', className)}
    ref={ref}
    {...props}
  />
));
SelectOption.displayName = 'SelectOption';

export { Select, SelectGroup, SelectOption };
