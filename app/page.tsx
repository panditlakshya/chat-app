"use client";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
// import ChatPage from "./chatpage/page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoReload } from "react-icons/io5";
import { useToast } from "@/components/ui/use-toast";
import ChatPage from "./chatpage/page";
// import { Socket } from "socket.io";

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [roomId, setroomId] = useState("");
  const { toast } = useToast();
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    if (!socket) {
      const _socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`);
      setSocket(_socket);
    }
  }, []);

  const handleJoin = () => {
    if (socket && userName !== "" && roomId !== "") {
      socket.emit("join_room", roomId, userName);
      setShowSpinner(true);
      // You can remove this setTimeout and add your own logic
      setTimeout(() => {
        setShowChat(true);
        setShowSpinner(false);
      }, 500);
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Please enter both username and room id.",
        // action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const handleLeave = () => {
    setShowChat(false);
    setUserName("");
    setroomId("");
  };

  return (
    <div>
      <div
        className={
          !showChat
            ? "flex h-screen w-screen flex-col items-center justify-center"
            : "hidden"
        }
      >
        <div
          className="flex flex-col gap-4 w-1/3"
          style={{ display: showChat ? "none" : "" }}
        >
          <h1 className="text-3xl font-bold">Chat App</h1>
          <Input
            type="text"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={showSpinner}
          />
          <Input
            type="text"
            placeholder="Room"
            value={roomId}
            onChange={(e) => setroomId(e.target.value)}
            disabled={showSpinner}
          />
          <Button disabled={showSpinner} onClick={() => handleJoin()}>
            {!showSpinner ? (
              "Join"
            ) : (
              <>
                <IoReload className="mr-2 h-4 w-4 animate-spin" />
                <span>Connecting</span>
              </>
            )}
          </Button>
        </div>
      </div>
      <div style={{ display: !showChat ? "none" : "" }}>
        <ChatPage
          socket={socket}
          roomId={roomId}
          username={userName}
          handleLeave={handleLeave}
        />
      </div>
    </div>
  );
}
