import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/prepify-logo.png";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Prepify AI" className="h-9 w-auto" />
          <span className="text-xl font-bold text-gradient">Prepify AI</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#ap-mode" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">AP Mode</a>
          <a href="#ai-tools" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">AI Tools</a>
          <a href="#social" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Community</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth"><Button variant="ghost" size="sm">Log In</Button></Link>
          <Link to="/auth"><Button size="sm" className="bg-gradient-primary text-primary-foreground border-0 hover:opacity-90">Get Started Free</Button></Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3 animate-fade-in">
          <a href="#features" className="block text-sm font-medium text-muted-foreground">Features</a>
          <a href="#ap-mode" className="block text-sm font-medium text-muted-foreground">AP Mode</a>
          <a href="#ai-tools" className="block text-sm font-medium text-muted-foreground">AI Tools</a>
          <a href="#social" className="block text-sm font-medium text-muted-foreground">Community</a>
          <div className="pt-2 flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1">Log In</Button>
            <Button size="sm" className="flex-1 bg-gradient-primary text-primary-foreground border-0">Get Started</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
