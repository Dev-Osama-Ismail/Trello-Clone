import React, { useState } from "react";
import { useBoardStore } from "../store/useBoardStore";
import Column from "./Column";

const Board: React.FC = () => {
  const { boards, addBoard, addColumn } = useBoardStore();
  const [boardName, setBoardName] = useState("");
  const [columnName, setColumnName] = useState("");

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Trello Board</h1>

      {/* Create New Board */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Board Name"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            if (boardName.trim()) {
              addBoard(boardName);
              setBoardName("");
            }
          }}
        >
          Add Board
        </button>
      </div>

      {/* Show Boards and Columns */}
      {boards.map((board) => (
        <div key={board.id} className="mb-6 p-4 bg-white rounded shadow-md">
          <h2 className="text-xl font-bold mb-3">{board.name}</h2>

          {/* Create New Column */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Column Name"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              className="border p-2 rounded"
            />
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => {
                if (columnName.trim()) {
                  addColumn(board.id, columnName);
                  setColumnName("");
                }
              }}
            >
              Add Column
            </button>
          </div>

          {/* Render Columns */}
          <div className="flex gap-4">
            {board.columns.map((column) => (
              <Column key={column.id} boardId={board.id} column={column} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Board;
