import { useState } from "react";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { useTags, useCreateTag } from "@/hooks/use-tags";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";

export function TagPicker({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const { data: tags = [] } = useTags();
  const { mutate: createTag } = useCreateTag();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const exactMatch = tags.find(
    (t) => t.name.toLowerCase() === search.toLowerCase(),
  );
  const showCreate = search.trim().length > 0 && !exactMatch;

  function handleSelect(tagId: string) {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedIds, tagId]);
    }
    setSearch("");
  }

  function handleRemove(tagId: string) {
    onChange(selectedIds.filter((id) => id !== tagId));
  }

  function handleCreate() {
    createTag(search.trim(), {
      onSuccess: (tag) => {
        onChange([...selectedIds, tag.id]);
        setSearch("");
      },
    });
  }

  const selectedTags = tags.filter((t) => selectedIds.includes(t.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className="flex flex-wrap gap-1.5 p-2 min-h-10 w-full rounded-none border border-input bg-transparent text-xs text-left cursor-pointer focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
        >
          {selectedTags.length > 0 ? (
            selectedTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {tag.name}
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(tag.id);
                  }}
                  className="inline-flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                >
                  <XIcon className="w-3 h-3" />
                </span>
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">Add tags...</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search tags..."
          />
          <CommandList>
            <CommandEmpty>
              {showCreate ? (
                <button
                  type="button"
                  className="w-full text-left px-2 py-2 text-xs text-chart-2 hover:bg-muted transition-colors flex items-center gap-1.5"
                  onClick={handleCreate}
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Create &ldquo;{search.trim()}&rdquo;
                </button>
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No tags found
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((tag) => (
                <CommandItem
                  key={tag.id}
                  onSelect={() => handleSelect(tag.id)}
                  data-checked={selectedIds.includes(tag.id)}
                >
                  {tag.name}
                </CommandItem>
              ))}
              {showCreate && filtered.length > 0 && (
                <CommandItem onSelect={handleCreate} className="text-chart-2 gap-1.5">
                  <PlusIcon className="w-3.5 h-3.5" />
                  Create &ldquo;{search.trim()}&rdquo;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
