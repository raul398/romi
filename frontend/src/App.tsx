import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import {
  Film,
  Image,
  Scissors,
  LayoutDashboard,
} from "lucide-react";
import Txt2Video from "@/pages/Txt2Video";
import Img2Video from "@/pages/Img2Video";
import Edit from "@/pages/Edit";
import Dashboard from "@/pages/Dashboard";
import JobView from "@/pages/JobView";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "txt2video", label: "Text to Video", icon: Film, path: "/txt2video" },
  { id: "img2video", label: "Image to Video", icon: Image, path: "/img2video" },
  { id: "edit", label: "Edit", icon: Scissors, path: "/edit" },
] as const;

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Film className="w-6 h-6 text-violet-400" />
          <h1 className="text-xl font-bold tracking-tight">ROMI</h1>
          <span className="text-xs text-zinc-500 ml-1">video generator</span>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="border-b border-zinc-800 px-6">
        <div className="max-w-5xl mx-auto flex gap-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors",
                  isActive
                    ? "bg-zinc-900 text-violet-400 border-b-2 border-violet-400"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                )
              }
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/job/:jobId" element={<JobView />} />
          <Route path="/txt2video" element={<Txt2Video />} />
          <Route path="/img2video" element={<Img2Video />} />
          <Route path="/edit" element={<Edit />} />
        </Routes>
      </main>
    </div>
  );
}
