import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Zap, ArrowRight, CheckCircle, XCircle, RotateCcw, Clock } from "lucide-react";

type Question = {
  question: string;
  choices: string[];
  correct: number;
  explanation: string;
};

const SUBJECTS = [
  "Math", "Science", "English", "History", "Geography",
  "Biology", "Chemistry", "Physics", "Spanish", "French",
  "Economics", "Computer Science", "Art History", "Psychology",
];

const QuickQuiz = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  const startQuiz = async () => {
    if (!subject) return toast.error("Select a subject");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-study", {
        body: { type: "normal-quiz", subject, topic, count: 5 },
      });
      if (error) throw error;
      setQuestions(data.questions);
      setCurrentQ(0);
      setScore(0);
      setSelected(null);
      setShowAnswer(false);
      setQuizDone(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = () => {
    if (selected === null) return;
    setShowAnswer(true);
    if (selected === questions[currentQ].correct) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      setQuizDone(true);
      if (user) {
        supabase.from("quiz_sessions").insert({
          user_id: user.id, mode: "normal", subject,
          total_questions: questions.length,
          correct_answers: score + (selected === questions[currentQ].correct ? 1 : 0),
          completed_at: new Date().toISOString(),
        });
      }
    }
  };

  const letters = ["A", "B", "C", "D"];

  if (!questions.length) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-secondary to-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quick Quiz</h1>
            <p className="text-sm text-muted-foreground">Standard 4-choice MCQs for any subject</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
          <h2 className="font-semibold mb-4">Select Subject</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setSubject(s)}
                className={`text-sm px-3 py-2 rounded-lg border transition-colors text-left ${subject === s ? "border-primary bg-primary/10 text-primary font-medium" : "border-border/50 hover:border-primary/30 text-muted-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
          <input
            type="text" placeholder="Optional: specific topic (e.g. 'quadratic equations')"
            value={topic} onChange={e => setTopic(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm mb-4"
          />
          <Button onClick={startQuiz} disabled={!subject || loading} className="bg-gradient-primary text-primary-foreground border-0 w-full py-5">
            {loading ? "Generating..." : "Start Quiz"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (quizDone) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-card rounded-xl border border-border/50 p-8 shadow-card">
          <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-5xl font-bold text-gradient my-6">{score}/{questions.length}</p>
          <p className="text-muted-foreground mb-6">{Math.round((score / questions.length) * 100)}% correct</p>
          <Button onClick={() => { setQuestions([]); setSubject(""); }} className="bg-gradient-primary text-primary-foreground border-0">
            <RotateCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{subject}{topic ? ` · ${topic}` : ""}</span>
        <span className="text-sm font-medium">Q{currentQ + 1}/{questions.length}</span>
      </div>
      <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
        <p className="font-medium mb-5">{q.question}</p>
        <div className="space-y-2 mb-6">
          {q.choices.map((choice, i) => {
            let cls = "border-border/50 hover:border-primary/30";
            if (showAnswer) {
              if (i === q.correct) cls = "border-secondary bg-secondary/10 font-medium";
              else if (i === selected) cls = "border-destructive bg-destructive/10";
              else cls = "border-border/30 opacity-50";
            } else if (i === selected) cls = "border-primary bg-primary/10 font-medium";
            return (
              <button key={i} onClick={() => !showAnswer && setSelected(i)}
                className={`w-full text-left text-sm px-4 py-3 rounded-lg border transition-colors flex items-start gap-3 ${cls}`}>
                <span className="font-semibold text-muted-foreground shrink-0">{letters[i]})</span>{choice}
              </button>
            );
          })}
        </div>
        {showAnswer && (
          <div className={`p-4 rounded-lg border mb-4 ${selected === q.correct ? "bg-secondary/5 border-secondary/20" : "bg-destructive/5 border-destructive/20"}`}>
            <div className="flex items-center gap-2 mb-1">
              {selected === q.correct ? <><CheckCircle className="h-4 w-4 text-secondary" /><span className="text-sm font-medium text-secondary">Correct!</span></> : <><XCircle className="h-4 w-4 text-destructive" /><span className="text-sm font-medium text-destructive">Incorrect</span></>}
            </div>
            <p className="text-sm text-muted-foreground">{q.explanation}</p>
          </div>
        )}
        <div className="flex gap-3">
          {!showAnswer ? (
            <Button onClick={checkAnswer} disabled={selected === null} className="flex-1 bg-gradient-primary text-primary-foreground border-0">Check Answer</Button>
          ) : (
            <Button onClick={nextQuestion} className="flex-1 bg-gradient-primary text-primary-foreground border-0">
              {currentQ < questions.length - 1 ? "Next Question" : "See Results"}<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickQuiz;
