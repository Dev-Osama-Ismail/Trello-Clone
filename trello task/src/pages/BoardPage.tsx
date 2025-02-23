import React, { useEffect, useState } from "react";
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  DragEndEvent, 
  UniqueIdentifier 
} from "@dnd-kit/core";
import { useBoardStore } from "../store/useBoardStore";
import Column from "../components/Column";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BoardPage: React.FC = () => {
  const { boards, moveCard, addBoard, deleteBoard, addColumn } = useBoardStore();
  const [columnName, setColumnName] = useState("");
  const [boardName, setBoardName] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState<string>(boards.length > 0 ? boards[0].id : "");
  const board = boards.find((b) => b.id === selectedBoardId) || null;

  useEffect(() => {
    const channel = new BroadcastChannel("board-sync");
    channel.onmessage = (event) => {
      if (event.data.type === "sync-boards") {
        useBoardStore.setState({ boards: event.data.boards });
      } else if (event.data.type === "update-selected-board") {
        setSelectedBoardId(event.data.boardId);
      }
    };
    return () => channel.close();
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (active.data.current?.type === "card") {
      const fromColumnId = active.data.current?.columnId;
      const toColumnId = over.data.current?.columnId;
      if (!fromColumnId || !toColumnId || fromColumnId === toColumnId) return;

      moveCard(selectedBoardId, fromColumnId, toColumnId, activeId);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="p-6 min-h-screen bg-gray-900 text-white overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Trello Clone</h1>
          <Select value={selectedBoardId} onValueChange={(value) => setSelectedBoardId(value)}>
            <SelectTrigger className="w-48 bg-white text-white border-gray-300">
              <SelectValue placeholder="Select a Board" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black border-gray-300">
              {boards.map((b) => (
                <SelectItem key={b.id} value={b.id} className="hover:bg-gray-200">
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>


          {board && (
            <Button
              variant="destructive"
              onClick={() => {
                deleteBoard(board.id);
                setSelectedBoardId(boards.length > 1 ? boards[1].id : "");
              }}
            >
              🗑 Delete Board
            </Button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="New Board Name"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="w-1/3"
          />
          <Button
            onClick={() => {
              if (boardName.trim()) {
                const newBoardId = addBoard(boardName);
                setSelectedBoardId(newBoardId);
                setBoardName("");
              }
            }}
          >
            + Add Board
          </Button>
        </div>

        {!board ? (
          <p className="text-gray-400">No boards yet. Create one!</p>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder="Column Name"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="w-1/3"
              />
              <Button
                variant="default"
                onClick={() => {
                  if (columnName.trim()) {
                    addColumn(board.id, columnName);
                    setColumnName("");
                  }
                }}
              >
                + Add Column
              </Button>

            </div>
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
