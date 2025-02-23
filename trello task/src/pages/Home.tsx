import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useBoardStore } from "../store/useBoardStore";

const Home: React.FC = () => {
  const { boards, addBoard } = useBoardStore();

  useEffect(() => {
    // Prevent scrolling on the home page
    document.body.style.overflow = "hidden";
    return () => {
      // Restore scrolling when leaving the page
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-6">🚀 Welcome to Trello Clone</h1>
      <p className="text-lg text-gray-300 mb-6">
        Organize your tasks and projects efficiently.
      </p>

      {boards.length === 0 ? (
        <button
          onClick={() => addBoard("My First Board")}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition duration-300"
        >
          Create Board
        </button>
      ) : (
        <Link
          to={`/board/${boards[0].id}`}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition duration-300"
        >
          Go to My Board
        </Link>
      )}
    </div>
  );
};

export default Home;
