"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useEffect, useRef, useState } from "react";
import { IoIosPeople } from "react-icons/io";

interface IMsgDataTypes {
  roomId: String | number;
  user: String;
  msg: String;
  time: String;
}

const ChatPage = ({ socket, username, roomId }: any) => {
  const [currentMsg, setCurrentMsg] = useState("");
  const [chat, setChat] = useState<IMsgDataTypes[]>([]);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentMsg !== "") {
      const msgData: IMsgDataTypes = {
        roomId,
        user: username,
        msg: currentMsg,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_msg", msgData);
      setCurrentMsg("");
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [chat.length]);

  useEffect(() => {
    socket.on("receive_msg", (data: IMsgDataTypes) => {
      setChat((pre) => [...pre, data]);
    });

    socket.on("update users", (data: any) => {
      console.log(data, "data");
      setUsers(data);
    });
  }, [socket]);

  return (
    <div className="grid grid-cols-4 gap-1 p-2 h-screen">
      <Card className="col-span-3 flex flex-col h-full max-h-[calc(100vh-1rem)]">
        <CardHeader className="bg-[#282829] rounded-t-lg text-white z-[4]">
          <CardTitle>
            <div className="flex flex-row gap-2">
              <IoIosPeople size={26} />
              <span>{roomId}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 gap-1 overflow-auto pb-2">
          {chat.map(({ roomId, user, msg, time }, key) => (
            <div key={key}>
              <h3 className={user === username ? "text-right " : "text-left"}>
                <div
                  className={
                    user === username
                      ? "inline-block px-4 py-2 rounded-xl border border-1 mr-2 bg-[#204F46] text-white"
                      : "inline-block px-4 py-2 rounded-xl border border-1 mr-2 bg-[#363638] text-white"
                  }
                >
                  {user !== username ? (
                    <div className="text-[0.7rem] leading-1 font-medium text-[#21b095]">
                      {user}
                    </div>
                  ) : (
                    ""
                  )}
                  {msg}
                </div>
              </h3>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="z-[4] bg-[#282829] flex justify-center items-center p-3 rounded-b-lg">
          <form className="flex gap-2 w-full" onSubmit={(e) => sendData(e)}>
            <Input
              type="text"
              value={currentMsg}
              placeholder="Type your message.."
              onChange={(e) => setCurrentMsg(e.target.value)}
            />
            <Button className="bg-[#204F46]">Send</Button>
          </form>
        </CardFooter>
      </Card>
      <Card className="col-span-1 ">
        <CardHeader className="bg-[#282829] rounded-t-lg text-white z-[4]">
          <CardTitle>Current Members </CardTitle>
        </CardHeader>
        <CardContent>
          {users.map((x) => (
            <div className="p-1" key={x}>
              {x}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPage;
