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
// import { CiMenuKebab } from "react-icons/ci";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

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

  const [goal, setGoal] = useState(350);

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)));
  }

  return (
    <div className="sm:grid sm:grid-cols-4 sm:gap-1 p-1 sm:p-2 h-screen">
      <Card className="relative sm:col-span-3 flex flex-col h-full sm:max-h-[calc(100vh-1rem)]">
        <CardHeader className="bg-[#3b3b3b] rounded-t-lg text-white z-[4]">
          <CardTitle className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-2 justify-center items-center">
              <IoIosPeople
                className="w-9 h-9 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10"
                size={26}
              />
              <span>{roomId}</span>
            </div>
            <div>
              <div className="flex gap-2">
                <div className="block sm:hidden sm:pointer-events-none">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button
                        className="text-black px-2 py-1 text-sm"
                        type="button"
                        variant={"outline"}
                      >
                        Members
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="px-2">
                        <h2 className="font-medium text-lg">Current Members</h2>
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
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>

                <Menubar className="bg-[#3b3b3b] border-none ">
                  <MenubarMenu>
                    <MenubarTrigger className="bg-[#3b3b3b] px-0 focus:bg-none focus:text-white">
                      {/* <button className="bg-transparent" type="button"> */}
                      <BsThreeDotsVertical size={20} />
                      {/* </button> */}
                    </MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem
                        onClick={async () => {
                          socket.emit("leave_room", roomId, username);
                          handleLeave();
                          setChat([]);
                          toast({
                            description: "You've left the room",
                          });
                        }}
                      >
                        Leave room
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              </div>
              {/* <div className="hidden sm:block">
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
              </div> */}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 gap-1 overflow-auto pb-2 pt-1">
          {chat.map(({ roomId, user, msg, time }, key) => (
            <div key={key}>
              <h3 className={user === username ? "text-right " : "text-left"}>
                <div
                  className={
                    user === username
                      ? "inline-block px-3 py-1 rounded-xl border border-1 mr-2 bg-[#204F46] text-white"
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
        <CardFooter className="z-[4] bg-[#3b3b3b] flex justify-center items-center p-2 sm:p-3 rounded-b-lg">
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
                  emojiButtonSize={32}
                  onClickOutside={() => setEmoji(false)}
                />
              </span>
            )}
            <Button className="bg-[#204F46]">Send</Button>
          </form>
        </CardFooter>
      </Card>
      <Card className="hidden sm:block sm:col-span-1">
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
