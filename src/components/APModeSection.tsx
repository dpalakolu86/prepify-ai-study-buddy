import { CheckCircle } from "lucide-react";

const apFeatures = [
  "5-choice MCQs (A–E) matching real AP format",
  "Stimulus-based questions with passages, charts & maps",
  "Timed FRQs graded by AI using official rubrics",
  "Full exam simulator with realistic timing",
  "Score predictions from 1–5 with detailed feedback",
  "Model answers and reasoning explanations",
];

const APModeSection = () => {
  return (
    <section id="ap-mode" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              AP Mode
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Practice Like It's the <span className="text-gradient">Real AP Exam</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Our AI generates questions that mirror actual AP exams — from stimulus-based MCQs to rubric-graded FRQs — so you know exactly what to expect on test day.
            </p>
            <ul className="space-y-3">
              {apFeatures.map((feat) => (
                <li key={feat} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mock AP question card */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">AP U.S. History • Unit 5</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">MCQ</span>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              "The passage above best reflects which of the following developments in the period 1844–1877?"
            </p>
            <div className="space-y-2">
              {["A) The expansion of slavery into western territories",
                "B) The growth of abolitionist movements in the South",
                "C) Debates over federal vs. state authority",
                "D) The rise of industrialization in the North",
                "E) Increasing diplomatic tensions with Great Britain"
              ].map((opt, i) => (
                <div
                  key={opt}
                  className={`text-sm px-4 py-2.5 rounded-lg border transition-colors cursor-pointer ${i === 2
                    ? "border-secondary bg-secondary/10 text-foreground font-medium"
                    : "border-border/50 hover:border-primary/30"
                    }`}
                >
                  {opt}
                </div>
              ))}
            </div>
            <div className="pt-2 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
              <p className="text-xs font-medium text-secondary mb-1">✓ Correct!</p>
              <p className="text-xs text-muted-foreground">
                This passage reflects the ongoing debates over federal vs. state authority during the Reconstruction era...
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default APModeSection;
