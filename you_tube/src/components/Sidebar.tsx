"use client";
import Link from "next/link";
import { History, ThumbsUp, Clock, User, Home, Compass, PlaySquare } from "lucide-react";
import { usePathname } from "next/navigation";

import React, { useState } from "react";
import { Button } from "./ui/button";
import HistoryContent from "./HistoryContent";
import ChannelDialogue from "./ChannelDialogue";
// ❌ removed DropdownMenuItem import

import { useUser } from "@/lib/AuthContext";

const Sidebar = () => {
    const pathname = usePathname();
    const { user } = useUser();
    const [isdialogueopen, SetIsdialogueopen] = useState(false);
    
    // Check if user has a channel by looking for channelname in DB
    const hasChannel = !!user?.channelname;

    return (
        <aside className="w-64 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] min-h-screen p-2 transition-colors duration-300">
            <nav className="space-y-1">
                <Link href="/">
                    <Button variant="ghost" className="w-full justify-start">
                        <Home className="w-5 h-5 mr-3" />
                        Home
                    </Button>
                </Link>

                <Link href="/explore">
                    <Button variant="ghost" className="w-full justify-start">
                        <Compass className="w-5 h-5 mr-3" />
                        Explore
                    </Button>
                </Link>

                <Link href="/subscriptions">
                    <Button variant="ghost" className="w-full justify-start">
                        <PlaySquare className="w-5 h-5 mr-3" />
                        Subscriptions
                    </Button>
                </Link>

                {user && (
                    <>
                        <div className="border-t pt-2 mt-2">
                            <Link href="/history">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    disabled={pathname === "/history"}
                                >
                                    <History className="w-5 h-5 mr-3" />
                                    History
                                </Button>
                            </Link>

                            <Link href="/liked">
                                <Button variant="ghost" className="w-full justify-start">
                                    <ThumbsUp className="w-5 h-5 mr-3" />
                                    Liked videos
                                </Button>
                            </Link>

                            <Link href="/watch-later">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Clock className="w-5 h-5 mr-3" />
                                    Watch later
                                </Button>
                            </Link>

                            {hasChannel ? (
                                <div>
                                    <Link href={`/channel/${user?._id}`}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            <User className="w-5 h-5 mr-3" />
                                            Your channel
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="px-2 py-1.5">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="w-full  text-black-100"
                                        onClick={() => SetIsdialogueopen(true)}
                                    >
                                        Create a Channel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </nav>
            <ChannelDialogue isopen={isdialogueopen} onclose={() => SetIsdialogueopen(false)} mode="create" />

        </aside>
    );
};

export default Sidebar;
