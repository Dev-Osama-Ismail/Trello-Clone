import React, { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { useBoardStore } from "../store/useBoardStore";
import Column from "../components/Column";

const BoardPage: React.FC = () => {
  const { boards, addBoard, deleteBoard, addColumn } = useBoardStore();
  const [columnName, setColumnName] = useState("");
  const [boardName, setBoardName] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState<string>(boards.length > 0 ? boards[0].id : "");

  const board = Array.isArray(boards) ? boards.find((b) => b.id === selectedBoardId) || null : null;
  useEffect(() => {
    const channel = new BroadcastChannel("board-sync");
  
    channel.onmessage = (event) => {
      if (event.data.type === "sync-boards") {
        useBoardStore.setState({ boards: event.data.boards });
      }
    };
  
    return () => channel.close();
  }, []);
  
  useEffect(() => {
    // ✅ Sync board selection across tabs
    const channel = new BroadcastChannel("board-sync");
    channel.onmessage = (event) => {
      if (event.data.type === "sync-boards") {
        setSelectedBoardId(event.data.boards[0]?.id || "");
      }
    };

    return () => channel.close();
  }, []);

  return (
    <DndContext>
      <div className="p-6 min-h-screen bg-gray-900 text-white overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Trello Clone</h1>
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

        {/* Add New Board */}
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
                const newBoardId = addBoard(boardName);
                setSelectedBoardId(newBoardId);
                setBoardName("");
              }
            }}
          >
            + Add Board
          </button>
        </div>

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

            {/* Display Columns */}
            <div className="flex gap-4 p-4">
              {board.columns.length ? (
                board.columns.map((column) => <Column key={column.id} boardId={board.id} column={column} />)
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
