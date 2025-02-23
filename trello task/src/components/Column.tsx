import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Column as ColumnType, useBoardStore } from "../store/useBoardStore";
import Card from "./Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ColumnProps {
  boardId: string;
  column: ColumnType;
}

const Column: React.FC<ColumnProps> = ({ boardId, column }) => {
  const { addCard, deleteColumn } = useBoardStore();
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  const [cardTitle, setCardTitle] = useState("");

  return (
    <div ref={setNodeRef} className="bg-gray-800 p-4 rounded-lg w-72 shadow-lg flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">{column.name}</h3>
        <Button variant="destructive" size="sm" onClick={() => deleteColumn(boardId, column.id)}>
          ✖
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="New Card"
          value={cardTitle}
          onChange={(e) => setCardTitle(e.target.value)}
          className="w-full"
        />
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            if (cardTitle.trim()) {
              addCard(boardId, column.id, cardTitle);
              setCardTitle("");
            }
          }}
        >
          ➕
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {column.cards.map((card) => (
          <Card key={card.id} boardId={boardId} columnId={column.id} card={card} />
        ))}
      </div>
    </div>
  );
};

export default Column;
