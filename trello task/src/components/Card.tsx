import React from "react";
import { Card as CardType, useBoardStore } from "../store/useBoardStore";
import { useDraggable } from "@dnd-kit/core";

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
      columnId: columnId,
    },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="cursor-grab active:cursor-grabbing"
    >
      <div className="block max-w-sm p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{card.title}</h5>
        <p className="text-gray-700">This is a draggable card.</p>
      </div>

      <button
  onMouseDown={(e) => {


    deleteCard(boardId, columnId, card.id);
  }}
  className="bg-red-500 text-white px-3 py-1 rounded mt-2 text-sm w-full hover:bg-red-600"
>
  ✖ Delete
</button>



    </div>
  );
};

export default Card;
