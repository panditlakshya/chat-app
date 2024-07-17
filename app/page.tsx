"use client";
import { io } from "socket.io-client";
import { useState } from "react";
import ChatPage from "./chatpage/page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoReload } from "react-icons/io5";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [roomId, setroomId] = useState("");
  const { toast } = useToast();

  var socket: any;
  socket = io("http://localhost:3001");

  const handleJoin = () => {
    if (userName !== "" && roomId !== "") {
      // console.log(userName, "userName", roomId, "roomId");
      socket.emit("join_room", roomId, userName);
      setShowSpinner(true);
      // You can remove this setTimeout and add your own logic
      setTimeout(() => {
        setShowChat(true);
        setShowSpinner(false);
      }, 1000);
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Please enter both username and room id.",
        // action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
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
          className="flex flex-col gap-4"
          style={{ display: showChat ? "none" : "" }}
        >
          <Input
            type="text"
            placeholder="Username"
            onChange={(e) => setUserName(e.target.value)}
            disabled={showSpinner}
          />
          <Input
            type="text"
            placeholder="room id"
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
        <ChatPage socket={socket} roomId={roomId} username={userName} />
      </div>
    </div>
  );
}
