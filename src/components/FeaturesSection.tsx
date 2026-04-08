import {
  BookOpen, Brain, Target, Zap, Mic, Camera,
  FileText, Layers, Users, TrendingUp, Headphones, Swords
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "AP Mode",
    desc: "Realistic A–E multiple-choice, stimulus-based questions, timed FRQs graded by AI with rubrics, and full exam simulators with 1–5 score predictions.",
    color: "from-primary to-accent",
  },
  {
    icon: Layers,
    title: "Normal Mode",
    desc: "Standard 4-choice MCQs for any subject, making it your go-to study tool for all classes — not just AP.",
    color: "from-secondary to-primary",
  },
  {
    icon: Brain,
    title: "AI Tutor",
    desc: "Get any topic explained in simple terms, generate practice questions on the fly, and get personalized help based on your weaknesses.",
    color: "from-accent to-primary",
  },
  {
    icon: Target,
    title: "Weakness Attack",
    desc: "Smart tracking monitors accuracy, timing, and weak units. Focused drills target exactly where you need to improve.",
    color: "from-primary to-secondary",
  },
  {
    icon: FileText,
    title: "Content Converter",
    desc: "Turn presentations, lectures, and YouTube videos into study docs, summaries, flashcards, and quizzes instantly.",
    color: "from-secondary to-accent",
  },
  {
    icon: Zap,
    title: "Smart Flashcards",
    desc: "Spaced repetition flashcards that adapt to what you know. Auto-generate cards from notes or let AI create them.",
    color: "from-accent to-secondary",
  },
  {
    icon: Users,
    title: "Study Community",
    desc: "Share and discover notes and guides. AI filters for quality and can turn any post into study materials.",
    color: "from-primary to-accent",
  },
  {
    icon: Headphones,
    title: "Podcast Mode",
    desc: "Convert lessons into audio so you can study while commuting, exercising, or just relaxing.",
    color: "from-secondary to-primary",
  },
  {
    icon: Camera,
    title: "Scan & Solve",
    desc: "Point your camera at any question. AI analyzes it and provides step-by-step solutions and explanations.",
    color: "from-accent to-primary",
  },
  {
    icon: Mic,
    title: "Voice Tutor",
    desc: "Speak directly to the AI. Ask questions, get explanations, and have natural study conversations.",
    color: "from-primary to-secondary",
  },
  {
    icon: Swords,
    title: "Quiz Battles",
    desc: "Compete with friends in live quiz battles. Climb leaderboards and make studying fun and competitive.",
    color: "from-secondary to-accent",
  },
  {
    icon: TrendingUp,
    title: "Adaptive Difficulty",
    desc: "Questions adjust in real time to your level. Plus streaks, cram mode, and offline access to keep you going.",
    color: "from-accent to-secondary",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to <span className="text-gradient">Ace Every Test</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From AP exams to everyday homework — one platform that adapts to how you learn.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative p-6 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.color} mb-4`}>
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
