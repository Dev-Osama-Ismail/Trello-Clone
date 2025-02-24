import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useBoardStore } from "../store/useBoardStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Home: React.FC = () => {
  const { boards, addBoard } = useBoardStore();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-900 text-white p-6">
      <Card className="w-full max-w-xl text-center bg-gray-800 border border-gray-700 shadow-lg p-6">
      <h1 className="text-5xl font-bold mb-4 text-white">Welcome to Trello Clone</h1>
      <p className="text-lg text-gray-300 mb-6">
          Organize your tasks and projects efficiently.
        </p>

        {boards.length === 0 ? (
          <Button
            onClick={() => addBoard("My First Board")}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-lg font-semibold transition duration-300"
          >
            Create Board
          </Button>
        ) : (
          boards[0] && (
            <Link to={`/board/${boards[0].id}`}>
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white text-lg font-semibold transition duration-300">
                Go to My Boards
              </Button>
            </Link>
          )
        )}
      </Card>
    </div>
  );
};

export default Home;
