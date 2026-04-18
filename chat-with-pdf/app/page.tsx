import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background font-sans">
      {/* Theme toggle placed in top-right corner */}
      
      <main className="relative container flex min-h-screen flex-col">
      <div className=" p-4 flex h-14 items-center justify-between supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <header className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </header>
        <span className="font-bold">Chat-With-Pdf-AI SDK</span>
        
      </div>
      {/* <div className="flex flex-1 py-4">
        <div className="w-full">
          
        </div>
      </div> */}
    </main>
    </div>
  );
}

