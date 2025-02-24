import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Column as ColumnType, useBoardStore } from "../store/useBoardStore";
import Card from "./Card";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";

interface ColumnProps {
  boardId: string;
  column: ColumnType;
}

const Column: React.FC<ColumnProps> = ({ boardId, column }) => {
  const { addCard, deleteColumn } = useBoardStore();
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      columnId: column.id,
    },
  });

  const [cardTitle, setCardTitle] = useState("");

  return (
    <motion.div
      ref={setNodeRef}
      className="bg-gray-800 p-4 rounded-lg w-72 shadow-lg flex flex-col"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">{column.name}</h3>
        <button
          onClick={() => deleteColumn(boardId, column.id)}
          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="New Card"
          value={cardTitle}
          onChange={(e) => setCardTitle(e.target.value)}
          className="border p-2 rounded w-full bg-gray-700 text-white"
        />
        <button
          onClick={() => {
            if (cardTitle.trim()) {
              addCard(boardId, column.id, cardTitle);
              setCardTitle("");
            }
          }}
          className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition"
        >
          <Plus size={18} />
        </button>
      </div>

      <AnimatePresence>
        {column.cards.map((card) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Card boardId={boardId} columnId={column.id} card={card} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default Column;
