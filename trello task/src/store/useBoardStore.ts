import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Card {
  id: string;
  title: string;
}

export interface Column {
  id: string;
  name: string;
  cards: Card[];
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
}

interface BoardState {
  boards: Board[];
  selectedBoardId: string;
  setSelectedBoardId: (boardId: string) => void;
  addBoard: (name: string) => string;
  deleteBoard: (boardId: string) => void;
  addColumn: (boardId: string, columnName: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  addCard: (boardId: string, columnId: string, cardTitle: string) => void;
  deleteCard: (boardId: string, columnId: string, cardId: string) => void;
  moveCard: (boardId: string, fromColumnId: string, toColumnId: string, cardId: string, newIndex?: number) => void;
  moveColumn: (boardId: string, fromIndex: number, toIndex: number) => void;
  syncBoards: (newBoards: Board[]) => void;
}

const channel = new BroadcastChannel("board-sync");

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      boards: [],
      selectedBoardId: "",
      
      setSelectedBoardId: (boardId: string) => set({ selectedBoardId: boardId }),

      addBoard: (name: string): string => {
        const newBoard: Board = { id: crypto.randomUUID(), name, columns: [] };
        const newBoards = [...get().boards, newBoard];
        set({ boards: newBoards, selectedBoardId: newBoard.id });
        channel.postMessage({ type: "sync-boards", boards: newBoards });
        channel.postMessage({ type: "update-selected-board", boardId: newBoard.id });
        return newBoard.id;
      },

      deleteBoard: (boardId) => {
        const updatedBoards = get().boards.filter((board) => board.id !== boardId);
        const newSelectedBoardId = updatedBoards.length > 0 ? updatedBoards[0].id : "";
        set({ boards: updatedBoards, selectedBoardId: newSelectedBoardId });
        channel.postMessage({ type: "sync-boards", boards: updatedBoards });
        channel.postMessage({ type: "update-selected-board", boardId: newSelectedBoardId });
      },

      addColumn: (boardId, columnName) => {
        const updatedBoards = get().boards.map((board) =>
          board.id === boardId
            ? { ...board, columns: [...board.columns, { id: crypto.randomUUID(), name: columnName, cards: [] }] }
            : board
        );
        set({ boards: updatedBoards });
        channel.postMessage({ type: "sync-boards", boards: updatedBoards });
        channel.postMessage({ type: "update-selected-board", boardId });
      },

      deleteColumn: (boardId, columnId) => {
        const updatedBoards = get().boards.map((board) =>
          board.id === boardId
            ? { ...board, columns: board.columns.filter((col) => col.id !== columnId) }
            : board
        );
        set({ boards: updatedBoards });
        channel.postMessage({ type: "sync-boards", boards: updatedBoards });
        channel.postMessage({ type: "update-selected-board", boardId });
      },

      addCard: (boardId, columnId, cardTitle) => {
        const updatedBoards = get().boards.map((board) =>
          board.id === boardId
            ? {
                ...board,
                columns: board.columns.map((column) =>
                  column.id === columnId
                    ? { ...column, cards: [...column.cards, { id: crypto.randomUUID(), title: cardTitle }] }
                    : column
                ),
              }
            : board
        );
        set({ boards: updatedBoards });
        channel.postMessage({ type: "sync-boards", boards: updatedBoards });
        channel.postMessage({ type: "update-selected-board", boardId });
      },

      deleteCard: (boardId, columnId, cardId) => {
        const updatedBoards = get().boards.map((board) =>
          board.id === boardId
            ? {
                ...board,
                columns: board.columns.map((column) =>
                  column.id === columnId
                    ? { ...column, cards: column.cards.filter((card) => card.id !== cardId) }
                    : column
                ),
              }
            : board
        );
        set({ boards: updatedBoards });
        channel.postMessage({ type: "sync-boards", boards: updatedBoards });
        channel.postMessage({ type: "update-selected-board", boardId });
      },

      moveCard: (boardId, fromColumnId, toColumnId, cardId, newIndex = -1) => {
        let cardToMove: Card | undefined;
        const updatedBoards = get().boards.map((board) => {
          if (board.id === boardId) {
            return {
              ...board,
              columns: board.columns.map((column) => {
                if (column.id === fromColumnId) {
                  const cardIndex = column.cards.findIndex((card) => card.id === cardId);
                  if (cardIndex !== -1) {
                    cardToMove = column.cards.splice(cardIndex, 1)[0];
                  }
                }
                return column;
              }),
            };
          }
          return board;
        });

        if (cardToMove) {
          const newBoards = updatedBoards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) =>
                    column.id === toColumnId
                      ? {
                          ...column,
                          cards:
                            newIndex !== -1
                              ? [
                                  ...column.cards.slice(0, newIndex),
                                  cardToMove!,
                                  ...column.cards.slice(newIndex),
                                ]
                              : [...column.cards, cardToMove!],
                        }
                      : column
                  ),
                }
              : board
          );
          set({ boards: newBoards });
          channel.postMessage({ type: "sync-boards", boards: newBoards });
          return;
        }
        set({ boards: updatedBoards });
      },

      moveColumn: (boardId, fromIndex, toIndex) => {
        const updatedBoards = get().boards.map((board) => {
          if (board.id === boardId) {
            const columns = [...board.columns];
            const [movedColumn] = columns.splice(fromIndex, 1);
            columns.splice(toIndex, 0, movedColumn);
            return { ...board, columns };
          }
          return board;
        });
        set({ boards: updatedBoards });
        channel.postMessage({ type: "sync-boards", boards: updatedBoards });
      },

      syncBoards: (newBoards) => {
        if (JSON.stringify(get().boards) !== JSON.stringify(newBoards)) {
          set({ boards: newBoards });
        }
      },
    }),
    { name: "board-storage", version: 1 }
  )
);

channel.onmessage = (event) => {
  if (event.data.type === "sync-boards") {
    useBoardStore.setState({ boards: event.data.boards });
  }
  if (event.data.type === "update-selected-board") {
    useBoardStore.setState({ selectedBoardId: event.data.boardId });
  }
};
