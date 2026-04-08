import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Brain, Zap, FileText, MessageCircle, TrendingUp, Target, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ quizzes: 0, flashcards: 0, materials: 0 });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => setProfile(data));
    supabase.from("quiz_sessions").select("id", { count: "exact" }).eq("user_id", user.id).then(({ count }) => setStats(s => ({ ...s, quizzes: count || 0 })));
    supabase.from("flashcard_decks").select("id", { count: "exact" }).eq("user_id", user.id).then(({ count }) => setStats(s => ({ ...s, flashcards: count || 0 })));
    supabase.from("study_materials").select("id", { count: "exact" }).eq("user_id", user.id).then(({ count }) => setStats(s => ({ ...s, materials: count || 0 })));
  }, [user]);

  const quickActions = [
    { icon: BookOpen, label: "AP Mode", desc: "Practice AP-style questions", path: "/ap-mode", color: "from-primary to-accent" },
    { icon: Zap, label: "Quick Quiz", desc: "Standard practice questions", path: "/quiz", color: "from-secondary to-primary" },
    { icon: FileText, label: "Content Converter", desc: "Turn notes into study tools", path: "/converter", color: "from-accent to-secondary" },
    { icon: Brain, label: "Flashcards", desc: "Spaced repetition cards", path: "/flashcards", color: "from-primary to-secondary" },
    { icon: MessageCircle, label: "AI Tutor", desc: "Get explanations & help", path: "/tutor", color: "from-secondary to-accent" },
    { icon: Target, label: "Weakness Attack", desc: "Target your weak areas", path: "/ap-mode", color: "from-accent to-primary" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="text-gradient">{profile?.display_name?.split(" ")[0] || "Student"}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Ready to study? Pick a mode to get started.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: "Quizzes Taken", value: stats.quizzes },
          { icon: Brain, label: "Flashcard Decks", value: stats.flashcards },
          { icon: FileText, label: "Study Materials", value: stats.materials },
          { icon: Clock, label: "Day Streak", value: profile?.streak_count || 0 },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border/50 p-4 shadow-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <stat.icon className="h-4 w-4" />
              <span className="text-xs">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Study Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="group bg-card rounded-xl border border-border/50 p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
            >
              <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${action.color} mb-3`}>
                <action.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-1">{action.label}</h3>
              <p className="text-sm text-muted-foreground">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
