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
  past: Board[][]
  future: Board[][]; 
  setSelectedBoardId: (boardId: string) => void;
  saveState: () => void;
  undo: () => void;
  redo: () => void;
  addBoard: (name: string) => string;
  deleteBoard: (boardId: string) => void;
  addColumn: (boardId: string, columnName: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  addCard: (boardId: string, columnId: string, cardTitle: string) => void;
  deleteCard: (boardId: string, columnId: string, cardId: string) => void;
  moveCard: (boardId: string, fromColumnId: string, toColumnId: string, cardId: string) => void;
  syncBoards: (newBoards: Board[]) => void;
}

const channel = new BroadcastChannel("board-sync");

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      boards: [],
      selectedBoardId: "",
      past: [],
      future: [],

      setSelectedBoardId: (boardId) => set({ selectedBoardId: boardId }),

      saveState: () => {
        const state = get();
        set({
          past: [...state.past, state.boards],
          future: [], 
        });
      },

      undo: () => {
        set((state) => {
          if (state.past.length === 0) return state;
      
          const previous = state.past[state.past.length - 1];
          const newPast = state.past.slice(0, -1);
          const newFuture = [state.boards, ...state.future];
      
          channel.postMessage({ type: "sync-boards", boards: previous }); 
          return { boards: previous, past: newPast, future: newFuture };
        });
      },
      
      redo: () => {
        set((state) => {
          if (state.future.length === 0) return state;
      
          const next = state.future[0];
          const newFuture = state.future.slice(1);
          const newPast = [...state.past, state.boards];
      
          channel.postMessage({ type: "sync-boards", boards: next }); 
          return { boards: next, past: newPast, future: newFuture };
        });
      },
      addBoard: (name) => {
        get().saveState();
        const newBoard: Board = { id: crypto.randomUUID(), name, columns: [] };
        const newBoards = [...get().boards, newBoard];
      
        set({ boards: newBoards, selectedBoardId: newBoard.id });
      
        channel.postMessage({ type: "sync-boards", boards: newBoards });
        channel.postMessage({ type: "add-board", boards: newBoards, boardId: newBoard.id });
      
        return newBoard.id;
      },      
      deleteBoard: (boardId) => {
        get().saveState();
        const updatedBoards = get().boards.filter((board) => board.id !== boardId);
        set({ boards: updatedBoards, selectedBoardId: updatedBoards[0]?.id || "" });
        channel.postMessage({ type: "sync-boards", boards: updatedBoards });
      },

      addColumn: (boardId, columnName) => {
        get().saveState();
        const updatedBoards = get().boards.map((board) =>
          board.id === boardId
            ? { ...board, columns: [...board.columns, { id: crypto.randomUUID(), name: columnName, cards: [] }] }
            : board
        );
        set({ boards: updatedBoards });
        channel.postMessage({ type: "sync-boards", boards: updatedBoards });
      },

      deleteColumn: (boardId, columnId) => {
        get().saveState();
        const updatedBoards = get().boards.map((board) =>
          board.id === boardId
            ? { ...board, columns: board.columns.filter((col) => col.id !== columnId) }
            : board
        );
        set({ boards: updatedBoards });
        channel.postMessage({ type: "sync-boards", boards: updatedBoards });
      },

      addCard: (boardId, columnId, cardTitle) => {
        get().saveState();
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
      },

      deleteCard: (boardId, columnId, cardId) => {
        get().saveState();
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
      },

      moveCard: (boardId, fromColumnId, toColumnId, cardId) => {
        get().saveState();
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
                    column.id === toColumnId ? { ...column, cards: [...column.cards, cardToMove!] } : column
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

      syncBoards: (newBoards) => {
        set(() => ({ boards: newBoards }));
        localStorage.setItem("boards", JSON.stringify(newBoards)); 
      },
    }),
    {
      name: "board-storage",
      version: 1,
    }
  )
);

channel.onmessage = (event) => {
  if (event.data.type === "sync-boards") {
    useBoardStore.setState({ boards: event.data.boards });
  }

  if (event.data.type === "update-selected-board") {
    useBoardStore.setState({ selectedBoardId: event.data.boardId });
  }
  if (event.data.type === "add-board") {
    useBoardStore.setState({ boards: event.data.boards, selectedBoardId: event.data.boardId });
    localStorage.setItem("boards", JSON.stringify(event.data.boards));
  }
};

