import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/prepify-logo.png";
import {
  LayoutDashboard, BookOpen, Brain, Zap, MessageCircle,
  FileText, LogOut, Menu, X, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: BookOpen, label: "AP Mode", path: "/ap-mode" },
  { icon: Zap, label: "Quick Quiz", path: "/quiz" },
  { icon: FileText, label: "Content Converter", path: "/converter" },
  { icon: Brain, label: "Flashcards", path: "/flashcards" },
  { icon: MessageCircle, label: "AI Tutor", path: "/tutor" },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} flex flex-col`}>
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <img src={logo} alt="Prepify AI" className="h-8 w-auto" />
          <span className="text-lg font-bold text-gradient">Prepify AI</span>
          <button className="lg:hidden ml-auto" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              {user?.email?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-bold text-gradient">Prepify AI</span>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
