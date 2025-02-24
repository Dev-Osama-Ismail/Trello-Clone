import { act, renderHook } from "@testing-library/react-hooks";
import { useBoardStore } from "./useBoardStore";

describe("Board Store", () => {
  beforeEach(() => {
    useBoardStore.setState({ boards: [], selectedBoardId: "", past: [], future: [] });
  });

  test("adds a board", () => {
    const { result } = renderHook(() => useBoardStore());

    act(() => {
      result.current.addBoard("New Board");
    });

    expect(result.current.boards.length).toBe(1);
    expect(result.current.boards[0].name).toBe("New Board");
  });

  test("deletes a board", () => {
    const { result } = renderHook(() => useBoardStore());

    act(() => {
      const boardId = result.current.addBoard("Board to Delete");
      result.current.deleteBoard(boardId);
    });

    expect(result.current.boards.length).toBe(0);
  });

  test("adds a column", () => {
    const { result } = renderHook(() => useBoardStore());

    act(() => {
      const boardId = result.current.addBoard("Board with Column");
      result.current.addColumn(boardId, "New Column");
    });

    expect(result.current.boards[0].columns.length).toBe(1);
    expect(result.current.boards[0].columns[0].name).toBe("New Column");
  });

  test("undo and redo functionality", () => {
    const { result } = renderHook(() => useBoardStore());

    act(() => {
      result.current.addBoard("Board 1");
      result.current.undo();
    });

    expect(result.current.boards.length).toBe(0);

    act(() => {
      result.current.redo();
    });

    expect(result.current.boards.length).toBe(1);
    expect(result.current.boards[0].name).toBe("Board 1");
  });
});
