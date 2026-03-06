import React from "react";
import Head from "next/head";

export default function Explore() {
    return (
        <div className="min-h-screen">
            <Head>
                <title>Explore | YourTube</title>
            </Head>
            <main className="p-8">
                <h1 className="text-2xl font-bold">Explore</h1>
                <p className="text-gray-500 mt-4">Discover new and trending content here.</p>
            </main>
        </div>
    );
}
