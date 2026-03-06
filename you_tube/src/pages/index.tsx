import CategoryTabs from "@/components/ui/category-tabs";
import Viedogrid from "@/components/Viedogrid";
import { Suspense } from "react";


export default function Home() {
  return (
    <main className="flex-1 p-4">
      <CategoryTabs />
      <Suspense fallback={<div>Loading Viedos...</div>}>
        <Viedogrid />
      </Suspense>

    </main>


  );
}
