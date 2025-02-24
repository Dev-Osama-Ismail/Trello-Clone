import React, { useState } from "react";
import { useBoardStore } from "../store/useBoardStore";
import Column from "./Column";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const Board: React.FC = () => {
  const { boards, addBoard, addColumn } = useBoardStore();
  const [boardName, setBoardName] = useState("");
  const [columnName, setColumnName] = useState("");

  return (
    <div className="p-6 bg-background min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">Trello Board</h1>

      <div className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Enter board name..."
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          className="w-full"
        />
        <Button
          onClick={() => {
            if (boardName.trim()) {
              addBoard(boardName);
              setBoardName("");
            }
          }}
        >
          Add Board
        </Button>
      </div>

      {boards.map((board) => (
        <Card key={board.id} className="p-4 mb-6 bg-card shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">{board.name}</h2>

          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Enter column name..."
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              className="w-full"
            />
            <Button
              variant="secondary"
              onClick={() => {
                if (columnName.trim()) {
                  addColumn(board.id, columnName);
                  setColumnName("");
                }
              }}
            >
              Add Column
            </Button>
          </div>

          <div className="flex gap-4 overflow-x-auto">
            {board.columns.map((column) => (
              <Column key={column.id} boardId={board.id} column={column} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Board;
