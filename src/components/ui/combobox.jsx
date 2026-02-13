import React, { useState } from 'react';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  onAddNew,
  addNewLabel = "Add new...",
  className,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const selectedOption = options.find(
    (option) => option.value.toLowerCase() === value?.toLowerCase()
  );

  const handleSelect = (currentValue) => {
    const newValue = currentValue === value?.toLowerCase() ? '' : currentValue;
    onValueChange(
      options.find(opt => opt.value.toLowerCase() === newValue)?.value || ''
    );
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
                <div className="py-4 text-center text-sm">
                    <p>{emptyMessage}</p>
                    {onAddNew && (
                        <Button
                            variant="link"
                            className="mt-2 text-sm text-teal-500"
                            onClick={() => {
                                onAddNew(inputValue);
                                setOpen(false);
                                setInputValue('');
                            }}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {addNewLabel}
                        </Button>
                    )}
                </div>
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value && value.toLowerCase() === option.value.toLowerCase()
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}