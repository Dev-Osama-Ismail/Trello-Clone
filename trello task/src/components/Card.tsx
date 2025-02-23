import React from "react";
import { Card as CardType, useBoardStore } from "../store/useBoardStore";
import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";

interface CardProps {
  boardId: string;
  columnId: string;
  card: CardType;
}

const Card: React.FC<CardProps> = ({ boardId, columnId, card }) => {
  const { deleteCard } = useBoardStore();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id,
    data: {
      type: "card",
      columnId,
    },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style} className="cursor-grab active:cursor-grabbing">
      <div className="block max-w-sm p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900">{card.title}</h5>
        <p className="text-gray-700">This is a draggable card.</p>
      </div>

      <Button variant="destructive" className="w-full mt-2" onMouseDown={() => deleteCard(boardId, columnId, card.id)}>
        ✖ Delete
      </Button>
    </div>
  );
};

export default Card;
