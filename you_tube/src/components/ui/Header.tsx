"use client";

import Link from "next/link";
import { Bell, Menu, Mic, Search, User, Eye, VideoIcon, Router } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Button } from "./button";
import { Input } from "./input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import ChannelDialogue from "../ChannelDialogue";
import router from "next/router";
import { useUser } from "@/lib/AuthContext";
import AuthModal from "../auth/AuthModal";

const Header = () => {
    const { user, logout, handlegooglesignin } = useUser();
    // const user = {
    //     id: 1,
    //      name: "John Doe",
    //     email: "john.doe@example.com",
    //  image: "https://tse2.mm.bing.net/th/id/OIP.9-uO9K5uFpERhAc8OShvlQHaFj?pid=Api&P=0&h=180",
    //    };

    const [searchQuery, setSearchQuery] = useState("");
    const [hasChannel, SetHasChannel] = useState(false);
    const [isdialogueopen, SetIsdialogueopen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };
    const handleKeypress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch(e as any);
        }
    };

    return (
        <header className="flex items-center justify-between px-4 py-2 bg-[var(--background)] border-b border-[var(--border)] transition-colors duration-300">
            {/* Left */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                </Button>

                <Link href="/" className="flex items-center gap-1">
                    <div className="bg-red-600 p-1 rounded">
                        <svg width="24" height="24" viewBox="0 0 640 640">
                            <path d="M581.7 188.1C575.5 164.4 556.9 145.8 533.4 139.5C490.9 128 320.1 128 320.1 128C320.1 128 149.3 128 106.7 139.5C83.2 145.8 64.7 164.4 58.4 188.1C47 231 47 320.4 47 320.4C47 320.4 47 409.8 58.4 452.7C64.7 476.3 83.2 494.2 106.7 500.5C149.3 512 320.1 512 320.1 512C320.1 512 490.9 512 533.5 500.5C557 494.2 575.5 476.3 581.8 452.7C593.2 409.8 593.2 320.4 593.2 320.4C593.2 320.4 593.2 231 581.8 188.1zM264.2 401.6L264.2 239.2L406.9 320.4L264.2 401.6z" />
                        </svg>
                    </div>
                    <span className="text-xl font-medium">YouTube</span>
                    <span className="text-xs text-gray-400 ml-1">IN</span>
                </Link>
            </div>

            {/* Center */}
            <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 flex-1 max-w-2xl mx-4"
            >
                <div className="flex flex-1">
                    <Input
                        type="search"
                        placeholder="Search"
                        value={searchQuery}
                        onKeyPress={handleKeypress}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-l-full border-r-0 focus-visible:ring-0"
                    />

                    <Button
                        type="submit"
                        className="bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-none px-4"
                    >
                        <Search className="w-5 h-5" />
                    </Button>
                </div>

                <Button variant="ghost" size="icon" className="rounded-full">
                    <Mic className="w-5 h-5" />
                </Button>
            </form>

            {/* Right */}
            <div className="flex items-center gap-2">
                {user ? (
                    <>
                        <Button variant="ghost" size="icon">
                            <VideoIcon className="w-5 h-5" />
                        </Button>

                        <Button variant="ghost" size="icon">
                            <Bell className="w-5 h-5" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Avatar>
                                        <AvatarImage src={user.image} alt={user.name} />
                                        <AvatarFallback>
                                            {user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                {hasChannel ? (<DropdownMenuItem asChild>
                                    <Link href={`/channel/${user._id}`}>Your channel</Link>
                                </DropdownMenuItem>) : (
                                    <div className="px-2 py-1.5">
                                        <Button variant="secondary" size="sm" className="w-full bg-black text-gray-100" onClick={() => SetIsdialogueopen(true)}>
                                            Create a Channel
                                        </Button>
                                    </div>
                                )}

                                <DropdownMenuItem asChild>
                                    <Link href="/history">History</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/liked">Liked Videos</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/watch">Watch Later</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="bg-red-50 text-red-600 font-bold focus:bg-red-100 focus:text-red-700">
                                    <Link href="/plans">💎 Upgrade to Premium</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>

                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <Button className="flex items-center gap-2" onClick={() => setIsAuthModalOpen(true)}>
                        <User className="w-4 h-4" />
                        <span>Sign In</span>
                    </Button>
                )}
            </div>
            <ChannelDialogue isopen={isdialogueopen} onclose={() => SetIsdialogueopen(false)} mode="create" />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </header>
    );
};

export default Header;

