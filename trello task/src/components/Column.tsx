import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Column as ColumnType, useBoardStore } from "../store/useBoardStore";
import Card from "./Card";

interface ColumnProps {
  boardId: string;
  column: ColumnType;
}

const Column: React.FC<ColumnProps> = ({ boardId, column }) => {
  const { addCard, deleteColumn, deleteCard } = useBoardStore();
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      columnId: column.id,
    },
  });

  const [cardTitle, setCardTitle] = useState("");

  return (
    <div ref={setNodeRef} className="bg-gray-800 p-4 rounded-lg w-72 shadow-lg flex flex-col  ">
      {/* Column Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">{column.name}</h3>
        <button
          onClick={() => deleteColumn(boardId, column.id)}
          className="bg-red-600 text-white px-2 py-1 rounded text-sm"
        >
          ✖
        </button>
      </div>

      {/* Add Card */}
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
          className="bg-green-500 text-white px-3 py-2 rounded"
        >
          ➕
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {column.cards.map((card) => (
          <Card key={card.id} boardId={boardId} columnId={column.id} card={card} />
        ))}
      </div>
    </div>
  );
};

export default Column;
