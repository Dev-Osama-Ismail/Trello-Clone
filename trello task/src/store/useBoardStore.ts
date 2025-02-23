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
  addBoard: (name: string) => void;
  deleteBoard: (boardId: string) => void;
  addColumn: (boardId: string, columnName: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  addCard: (boardId: string, columnId: string, cardTitle: string) => void;
  deleteCard: (boardId: string, columnId: string, cardId: string) => void;
  moveCard: (boardId: string, fromColumnId: string, toColumnId: string, cardId: string, newIndex?: number) => void;
  moveColumn: (boardId: string, fromIndex: number, toIndex: number) => void;
  syncBoards: (newBoards: Board[]) => void;
}

// ✅ Initialize BroadcastChannel
const channel = new BroadcastChannel("board-sync");

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      boards: [],

      addBoard: (name: string) => {
        const newBoard = { id: crypto.randomUUID(), name, columns: [] };
        
        set((state) => {
          const updatedBoards = [...state.boards, newBoard];
          channel.postMessage(updatedBoards);
          return { boards: updatedBoards };
        });
      
        return newBoard.id; // ✅ Ensure addBoard returns the new board ID
      },
      

        deleteBoard: (boardId) =>
          set((state) => ({
            boards: state.boards.filter((board) => board.id !== boardId),
          })),

      addColumn: (boardId, columnName) =>
        set((state) => {
          const updatedBoards = state.boards.map((board) =>
            board.id === boardId
              ? { ...board, columns: [...board.columns, { id: crypto.randomUUID(), name: columnName, cards: [] }] }
              : board
          );
          channel.postMessage(updatedBoards);
          return { boards: updatedBoards };
        }),

      deleteColumn: (boardId, columnId) =>
        set((state) => {
          const updatedBoards = state.boards.map((board) =>
            board.id === boardId
              ? { ...board, columns: board.columns.filter((col) => col.id !== columnId) }
              : board
          );
          channel.postMessage(updatedBoards);
          return { boards: updatedBoards };
        }),

      addCard: (boardId, columnId, cardTitle) =>
        set((state) => {
          const updatedBoards = state.boards.map((board) =>
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
          channel.postMessage(updatedBoards);
          return { boards: updatedBoards };
        }),
        deleteCard: (boardId, columnId, cardId) =>
          set((state) => {
            console.log(boardId)
            const updatedBoards = state.boards.map((board) =>
              board.id === boardId
                ? {
                    ...board,
                    columns: board.columns.map((col) =>
                      col.id === columnId
                        ? { ...col, cards: col.cards.filter((card) => card.id !== cardId) }
                        : col
                    ),
                  }
                : board
            );
        
            set({ boards: updatedBoards }); // ✅ Ensure Zustand updates state
            channel.postMessage(updatedBoards); // ✅ Sync across tabs
            return { boards: updatedBoards };
          }),
        
        

      moveCard: (boardId, fromColumnId, toColumnId, cardId, newIndex = -1) =>
        set((state) => {
          let cardToMove: Card | undefined;

          const updatedBoards = state.boards.map((board) => {
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
            channel.postMessage(newBoards);
            return { boards: newBoards };
          }

          return { boards: updatedBoards };
        }),

      moveColumn: (boardId, fromIndex, toIndex) =>
        set((state) => {
          const updatedBoards = state.boards.map((board) => {
            if (board.id === boardId) {
              const columns = [...board.columns];
              const [movedColumn] = columns.splice(fromIndex, 1);
              columns.splice(toIndex, 0, movedColumn);
              return { ...board, columns };
            }
            return board;
          });

          set({ boards: updatedBoards });
          channel.postMessage(updatedBoards);
          return { boards: updatedBoards };
        }),

      syncBoards: (newBoards) => {
        if (JSON.stringify(get().boards) !== JSON.stringify(newBoards)) {
          set(() => ({ boards: newBoards }));
        }
      },
    }),
    { name: "board-storage" }
  )
);

// ✅ Listen for updates across tabs
channel.onmessage = (event) => {
  useBoardStore.getState().syncBoards(event.data);
};
