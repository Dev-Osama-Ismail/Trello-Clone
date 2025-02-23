import React, { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { useBoardStore } from "../store/useBoardStore";
import Column from "../components/Column";

const BoardPage: React.FC = () => {
  const { boards, addBoard, deleteBoard, moveCard, moveColumn, addColumn } = useBoardStore();
  const [columnName, setColumnName] = useState("");
  const [boardName, setBoardName] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState<string>(boards.length > 0 ? boards[0].id : "");

  const board = boards.find((b) => b.id === selectedBoardId) || null;

  // ✅ FIX: Ensure `addBoard` returns the new board ID



  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || !active) return;

    const activeId = active.id;
    const overId = over.id;

    const isCard = active.data.current?.type === "card";
    const isColumn = active.data.current?.type === "column";

    if (isCard) {
      const fromColumnId = active.data.current?.columnId;
      const toColumnId = over.data.current?.columnId;
      if (!fromColumnId || !toColumnId || fromColumnId === toColumnId) return;
      moveCard(board!.id, fromColumnId, toColumnId, activeId);
    } else if (isColumn) {
      moveColumn(board!.id, activeId, overId);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="p-6 min-h-screen bg-gray-900 text-white overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Trello Clone</h1>

          {/* Board Selection */}
          <select
            className="border p-2 rounded bg-gray-700 text-white"
            value={selectedBoardId}
            onChange={(e) => setSelectedBoardId(e.target.value)}
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Delete Board Button */}
          {board && (
            <button
              className="bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => {
                deleteBoard(board.id);
                setSelectedBoardId(boards.length > 1 ? boards[1].id : "");
              }}
            >
              🗑 Delete Board
            </button>
          )}
        </div>

        {/* Add Board */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="New Board Name"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="border p-2 rounded w-1/3 bg-gray-700 text-white"
          />
       <button
  className="bg-blue-500 text-white px-4 py-2 rounded"
  onClick={() => {
    if (boardName.trim()) {
      const newBoardId = addBoard(boardName); // Ensure addBoard returns the new board ID
      setBoardName(""); // Clear input
      
      // ✅ Force React to update selectedBoardId properly
    
    }
  }}
>
  + Add Board
</button>


        </div>

        {/* No Board Message */}
        {!board ? (
          <p className="text-gray-400">No boards yet. Create one!</p>
        ) : (
          <>
            {/* Add Column */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Column Name"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="border p-2 rounded w-1/3 bg-gray-700 text-white"
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
                + Add Column
              </button>
            </div>

            {/* Columns */}
            <div className="flex gap-4  p-4">
              {board.columns.length ? (
                board.columns.map((column) => (
                  <Column key={column.id} boardId={board.id} column={column} />
                ))
              ) : (
                <p className="text-gray-400">No columns yet. Add one!</p>
              )}
            </div>
          </>
        )}
      </div>
    </DndContext>
  );
};

export default BoardPage;
