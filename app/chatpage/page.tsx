"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import React, { useEffect, useRef, useState } from "react";
import { IoIosPeople } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { MdOutlineEmojiEmotions } from "react-icons/md";

interface IMsgDataTypes {
  roomId: String | number;
  user: String;
  msg: String;
  time: String;
}

const ChatPage = ({ socket, username, roomId, handleLeave }: any) => {
  const [currentMsg, setCurrentMsg] = useState("");
  const [chat, setChat] = useState<IMsgDataTypes[]>([]);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [emoji, setEmoji] = useState(false);
  const { toast } = useToast();

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
    // if (!!socket) {
    socket?.on("receive_msg", (data: IMsgDataTypes) => {
      setChat((pre) => [...pre, data]);
    });

    socket?.on("update users", (data: any) => {
      setUsers(data);
      setTimeout(() => {
        toast({
          description: "Welcome to the room!",
        });
      }, 500);
    });
    // }
  }, [socket]);

  return (
    <div className="grid grid-cols-4 gap-1 p-2 h-screen">
      <Card className="relative col-span-3 flex flex-col h-full max-h-[calc(100vh-1rem)]">
        <CardHeader className="bg-[#3b3b3b] rounded-t-lg text-white z-[4]">
          <CardTitle className="flex flex-row justify-between">
            <div className="flex flex-row gap-2">
              <IoIosPeople size={26} />
              <span>{roomId}</span>
            </div>
            <button
              type="button"
              onClick={async () => {
                socket.emit("leave_room", roomId, username);
                handleLeave();
                setChat([]);
                toast({
                  description: "You've left the room",
                });
              }}
            >
              <IoClose />
            </button>
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
        <CardFooter className=" z-[4] bg-[#3b3b3b] flex justify-center items-center p-3 rounded-b-lg">
          <form className="flex gap-2 w-full" onSubmit={(e) => sendData(e)}>
            <Input
              type="text"
              value={currentMsg}
              placeholder="Type your message.."
              onChange={(e) => setCurrentMsg(e.target.value)}
            />
            <button type="button" onClick={() => setEmoji(!emoji)}>
              <MdOutlineEmojiEmotions color="white" size={32} />
            </button>
            {emoji && (
              <span className="absolute bottom-8 -right-[12rem]">
                <Picker
                  data={data}
                  onEmojiSelect={(emoji: any) => {
                    console.log(emoji);
                    const sym = emoji.unified.split("_");
                    const codeArray: string[] = [];
                    sym.forEach((x: any) => {
                      codeArray.push("0x" + x);
                    });
                    //@ts-ignore
                    let _emoji = String.fromCodePoint(...codeArray);
                    setCurrentMsg(currentMsg + _emoji);
                  }}
                  emojiSize={20}
                  emojiButtonSize={28}
                  onClickOutside={() => setEmoji(false)}
                />
              </span>
            )}
            <Button className="bg-[#204F46]">Send</Button>
          </form>
        </CardFooter>
      </Card>
      <Card className="col-span-1">
        <CardHeader className="bg-[#3b3b3b] rounded-t-lg text-white z-[4]">
          <CardTitle>Current Members </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-y-2 h-80 overflow-auto mt-4">
            {users.map((x) => (
              <div
                className="px-4 py-2 bg-[#3b3b3b] rounded-sm text-white font-medium"
                key={x}
              >
                {x}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPage;
