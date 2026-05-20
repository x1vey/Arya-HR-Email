"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "@/lib/blocks/types";

interface BlockListProps {
  blocks: Block[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (newBlocks: Block[]) => void;
  onDelete: (id: string) => void;
}

export function BlockList({
  blocks,
  selectedId,
  onSelect,
  onReorder,
  onDelete
}: BlockListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(blocks, oldIndex, newIndex));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted px-2">
        Blocks ({blocks.length})
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1">
            {blocks.map((block) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                isSelected={block.id === selectedId}
                onSelect={() => onSelect(block.id)}
                onDelete={() => onDelete(block.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <p className="text-xs text-muted px-2 mt-3 leading-relaxed">
        Drag to reorder. Click a block to edit its properties.
      </p>
    </div>
  );
}

function SortableBlockItem({
  block,
  isSelected,
  onSelect,
  onDelete
}: {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-md border bg-white px-2 py-2 text-sm transition ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-100"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-400 hover:text-slate-600 px-1"
        aria-label="Drag handle"
      >
        ⋮⋮
      </button>
      <button onClick={onSelect} className="flex-1 text-left">
        <div className="font-medium text-ink">{block.label}</div>
        <div className="text-xs text-muted">{block.type}</div>
      </button>
      {block.locked ? (
        <span title="Locked" className="text-xs text-slate-400 px-1">🔒</span>
      ) : (
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 text-xs px-1 transition"
          aria-label="Delete block"
        >
          ✕
        </button>
      )}
    </div>
  );
}
