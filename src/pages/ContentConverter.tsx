import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileText, Upload, Youtube, Loader2, BookOpen, Brain, Zap, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

type ConvertResult = {
  summary: string;
  flashcards: { front: string; back: string }[];
  quiz: { question: string; choices: string[]; correct: number; explanation: string }[];
};

const ContentConverter = () => {
  const { user } = useAuth();
  const [inputType, setInputType] = useState<"text" | "youtube">("text");
  const [textInput, setTextInput] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "flashcards" | "quiz">("summary");
  const [savedFlashcards, setSavedFlashcards] = useState(false);

  const handleConvert = async () => {
    const content = inputType === "text" ? textInput : youtubeUrl;
    if (!content.trim()) return toast.error("Please enter content");
    if (!title.trim()) return toast.error("Please enter a title");

    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-study", {
        body: {
          type: "convert",
          content,
          sourceType: inputType,
          title,
        },
      });
      if (error) throw error;
      setResult(data);

      // Save to study materials
      if (user) {
        await supabase.from("study_materials").insert({
          user_id: user.id,
          title,
          source_type: inputType === "youtube" ? "youtube" : "text",
          source_url: inputType === "youtube" ? youtubeUrl : undefined,
          original_content: inputType === "text" ? textInput : youtubeUrl,
          summary: data.summary,
        });
      }
      toast.success("Content converted successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to convert content");
    } finally {
      setLoading(false);
    }
  };

  const saveFlashcards = async () => {
    if (!result || !user) return;
    try {
      const { data: deck } = await supabase.from("flashcard_decks").insert({
        user_id: user.id, title, subject: "Converted", card_count: result.flashcards.length,
      }).select().single();
      if (deck) {
        await supabase.from("flashcards").insert(
          result.flashcards.map(fc => ({
            deck_id: deck.id, user_id: user.id, front: fc.front, back: fc.back,
          }))
        );
      }
      setSavedFlashcards(true);
      toast.success("Flashcards saved to your deck!");
    } catch (e: any) {
      toast.error("Failed to save flashcards");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-accent to-secondary">
          <FileText className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Content Converter</h1>
          <p className="text-sm text-muted-foreground">Turn notes or YouTube videos into study materials</p>
        </div>
      </div>

      {!result ? (
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setInputType("text")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inputType === "text" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
              <Upload className="h-4 w-4" /> Paste Notes
            </button>
            <button onClick={() => setInputType("youtube")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inputType === "youtube" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
              <Youtube className="h-4 w-4" /> YouTube URL
            </button>
          </div>

          <Input placeholder="Title for this material" value={title} onChange={e => setTitle(e.target.value)} className="mb-4" />

          {inputType === "text" ? (
            <textarea
              placeholder="Paste your notes, lecture content, or study material here..."
              value={textInput} onChange={e => setTextInput(e.target.value)}
              className="w-full h-48 px-3 py-2 rounded-lg border border-border/50 bg-background text-sm resize-none mb-4"
            />
          ) : (
            <Input placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} className="mb-4" />
          )}

          <Button onClick={handleConvert} disabled={loading} className="bg-gradient-primary text-primary-foreground border-0 w-full py-5">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...</> : "Convert to Study Materials"}
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex gap-2 mb-4">
            {(["summary", "flashcards", "quiz"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
                {tab === "summary" && <BookOpen className="h-4 w-4" />}
                {tab === "flashcards" && <Brain className="h-4 w-4" />}
                {tab === "quiz" && <Zap className="h-4 w-4" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
            {activeTab === "summary" && (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{result.summary}</ReactMarkdown>
              </div>
            )}

            {activeTab === "flashcards" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">{result.flashcards.length} Flashcards</h3>
                  <Button size="sm" onClick={saveFlashcards} disabled={savedFlashcards}
                    className={savedFlashcards ? "" : "bg-gradient-primary text-primary-foreground border-0"}>
                    {savedFlashcards ? <><CheckCircle className="mr-1 h-4 w-4" /> Saved</> : "Save to My Decks"}
                  </Button>
                </div>
                <div className="space-y-3">
                  {result.flashcards.map((fc, i) => (
                    <div key={i} className="p-4 rounded-lg border border-border/50 bg-muted/20">
                      <p className="font-medium text-sm mb-2">{fc.front}</p>
                      <p className="text-sm text-muted-foreground">{fc.back}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "quiz" && (
              <QuizPreview questions={result.quiz} />
            )}
          </div>

          <Button variant="outline" className="mt-4" onClick={() => { setResult(null); setTextInput(""); setYoutubeUrl(""); setTitle(""); setSavedFlashcards(false); }}>
            Convert Another
          </Button>
        </div>
      )}
    </div>
  );
};

// Mini quiz component for converted content
const QuizPreview = ({ questions }: { questions: ConvertResult["quiz"] }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const letters = ["A", "B", "C", "D"];
  const q = questions[current];

  if (!q) return <p className="text-muted-foreground text-sm">No quiz questions generated.</p>;

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">Q{current + 1}/{questions.length}</p>
      <p className="font-medium mb-4">{q.question}</p>
      <div className="space-y-2 mb-4">
        {q.choices.map((c, i) => {
          let cls = "border-border/50 hover:border-primary/30";
          if (showAnswer) {
            if (i === q.correct) cls = "border-secondary bg-secondary/10 font-medium";
            else if (i === selected) cls = "border-destructive bg-destructive/10";
            else cls = "border-border/30 opacity-50";
          } else if (i === selected) cls = "border-primary bg-primary/10 font-medium";
          return (
            <button key={i} onClick={() => !showAnswer && setSelected(i)}
              className={`w-full text-left text-sm px-4 py-3 rounded-lg border transition-colors flex items-start gap-3 ${cls}`}>
              <span className="font-semibold text-muted-foreground">{letters[i]})</span>{c}
            </button>
          );
        })}
      </div>
      {showAnswer && <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted/30 rounded-lg">{q.explanation}</p>}
      <div className="flex gap-2">
        {!showAnswer ? (
          <Button size="sm" onClick={() => setShowAnswer(true)} disabled={selected === null}>Check</Button>
        ) : current < questions.length - 1 ? (
          <Button size="sm" onClick={() => { setCurrent(c => c + 1); setSelected(null); setShowAnswer(false); }}>Next</Button>
        ) : (
          <p className="text-sm text-muted-foreground">Quiz complete!</p>
        )}
      </div>
    </div>
  );
};

export default ContentConverter;
