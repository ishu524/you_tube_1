import React from "react";
import Head from "next/head";
import Header from "@/components/ui/Header";

export default function Subscriptions() {
    return (
        <div className="min-h-screen">
            <Head>
                <title>Subscriptions | YourTube</title>
            </Head>
            <main className="p-8">
                <h1 className="text-2xl font-bold">Subscriptions</h1>
                <p className="text-gray-500 mt-4">Feature coming soon! You will see videos from channels you subscribe to here.</p>
            </main>
        </div>
    );
}
