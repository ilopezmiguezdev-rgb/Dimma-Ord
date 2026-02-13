import React, { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Check, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const DynamicInput = ({ value, name, list, onValueChange, placeholder, setList }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleSelect = (currentValue) => {
    const newValue = currentValue === value ? "" : currentValue;
    onValueChange(name, newValue);
    setInputValue(newValue);
    setOpen(false);
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    onValueChange(name, e.target.value);
  }

  const handleAddNew = () => {
    if (inputValue && !list.includes(inputValue)) {
      setList(prevList => [...prevList, inputValue]);
      onValueChange(name, inputValue);
    }
    setOpen(false);
  };
  
  const currentDisplayValue = list.find(item => item.toLowerCase() === value?.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? currentDisplayValue || value : `Seleccionar ${placeholder}...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput 
            placeholder={`Buscar o añadir ${placeholder}...`} 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="p-2">
                <p className="text-sm text-center mb-2">No se encontró "{inputValue}".</p>
                <Button onClick={handleAddNew} className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4"/> Añadir y seleccionar
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {list.map((item) => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DynamicInput;