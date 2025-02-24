import React from "react";
import { Card as CardType, useBoardStore } from "../store/useBoardStore";
import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Trash } from "lucide-react";

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
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="relative cursor-grab active:cursor-grabbing"
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <div className="relative block max-w-sm p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
        
        {/* Delete Button - Positioned at the Top-Right */}
        <button
          onMouseDown={() => deleteCard(boardId, columnId, card.id)} // ✅ Removed unused event (e)
          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
        >
          <Trash size={16} />
        </button>

        {/* Card Content */}
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{card.title}</h5>
        <p className="text-gray-700 text-sm">You can change this card</p>
      </div>
    </motion.div>
  );
};

export default Card;
