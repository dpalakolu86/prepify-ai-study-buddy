import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, Plus, RotateCcw, ChevronLeft, ChevronRight, Check, X, Trash2 } from "lucide-react";

type Deck = { id: string; title: string; subject: string | null; card_count: number | null };
type Card = { id: string; front: string; back: string; ease_factor: number; interval_days: number; next_review: string; review_count: number };

const Flashcards = () => {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [showAddCard, setShowAddCard] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    if (user) loadDecks();
  }, [user]);

  const loadDecks = async () => {
    if (!user) return;
    const { data } = await supabase.from("flashcard_decks").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setDecks(data || []);
  };

  const loadCards = async (deck: Deck) => {
    setSelectedDeck(deck);
    const { data } = await supabase.from("flashcards").select("*").eq("deck_id", deck.id).order("created_at");
    setCards(data || []);
    setCurrentCard(0);
    setFlipped(false);
  };

  const createDeck = async () => {
    if (!user || !newTitle) return;
    await supabase.from("flashcard_decks").insert({ user_id: user.id, title: newTitle, subject: newSubject || null });
    setNewTitle(""); setNewSubject(""); setShowNewDeck(false);
    loadDecks();
    toast.success("Deck created!");
  };

  const addCard = async () => {
    if (!user || !selectedDeck || !newFront || !newBack) return;
    await supabase.from("flashcards").insert({ deck_id: selectedDeck.id, user_id: user.id, front: newFront, back: newBack });
    await supabase.from("flashcard_decks").update({ card_count: (selectedDeck.card_count || 0) + 1 }).eq("id", selectedDeck.id);
    setNewFront(""); setNewBack(""); setShowAddCard(false);
    loadCards(selectedDeck);
    toast.success("Card added!");
  };

  const deleteDeck = async (deckId: string) => {
    await supabase.from("flashcard_decks").delete().eq("id", deckId);
    setSelectedDeck(null); setCards([]);
    loadDecks();
    toast.success("Deck deleted");
  };

  // Spaced repetition: SM-2 algorithm
  const reviewCard = async (quality: number) => {
    const card = cards[currentCard];
    if (!card) return;
    let ef = card.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    ef = Math.max(1.3, ef);
    let interval = quality < 3 ? 1 : card.review_count === 0 ? 1 : card.review_count === 1 ? 6 : Math.round(card.interval_days * ef);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    await supabase.from("flashcards").update({
      ease_factor: ef, interval_days: interval,
      next_review: nextReview.toISOString(),
      review_count: card.review_count + 1,
    }).eq("id", card.id);

    if (currentCard < cards.length - 1) {
      setCurrentCard(c => c + 1);
      setFlipped(false);
    } else {
      toast.success("Review session complete!");
      setReviewMode(false);
      if (selectedDeck) loadCards(selectedDeck);
    }
  };

  if (selectedDeck && cards.length > 0) {
    const card = cards[currentCard];
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { setSelectedDeck(null); setReviewMode(false); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Back to Decks
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{currentCard + 1}/{cards.length}</span>
            {!reviewMode && <Button size="sm" variant="outline" onClick={() => { setReviewMode(true); setCurrentCard(0); setFlipped(false); }}>
              <RotateCcw className="mr-1 h-4 w-4" /> Review
            </Button>}
            <Button size="sm" variant="outline" onClick={() => setShowAddCard(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add Card
            </Button>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">{selectedDeck.title}</h2>

        {/* Card */}
        <div
          onClick={() => setFlipped(!flipped)}
          className="bg-card rounded-xl border border-border/50 p-8 shadow-card min-h-[250px] flex items-center justify-center cursor-pointer hover:shadow-card-hover transition-all"
        >
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">{flipped ? "Answer" : "Question"}</p>
            <p className="text-lg font-medium">{flipped ? card.back : card.front}</p>
            {!flipped && <p className="text-xs text-muted-foreground mt-4">Tap to flip</p>}
          </div>
        </div>

        {/* Review buttons or navigation */}
        {reviewMode && flipped ? (
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1 border-destructive/30 text-destructive" onClick={() => reviewCard(1)}>
              <X className="mr-1 h-4 w-4" /> Hard
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => reviewCard(3)}>Okay</Button>
            <Button className="flex-1 bg-gradient-primary text-primary-foreground border-0" onClick={() => reviewCard(5)}>
              <Check className="mr-1 h-4 w-4" /> Easy
            </Button>
          </div>
        ) : !reviewMode ? (
          <div className="flex justify-between mt-4">
            <Button variant="outline" size="icon" disabled={currentCard === 0} onClick={() => { setCurrentCard(c => c - 1); setFlipped(false); }}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={currentCard >= cards.length - 1} onClick={() => { setCurrentCard(c => c + 1); setFlipped(false); }}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        {showAddCard && (
          <div className="bg-card rounded-xl border border-border/50 p-4 shadow-card mt-4 space-y-3">
            <Input placeholder="Front (question)" value={newFront} onChange={e => setNewFront(e.target.value)} />
            <Input placeholder="Back (answer)" value={newBack} onChange={e => setNewBack(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={addCard}>Add Card</Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddCard(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Deck list view
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary to-secondary">
          <Brain className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <p className="text-sm text-muted-foreground">Spaced repetition for better memorization</p>
        </div>
        <Button size="sm" onClick={() => setShowNewDeck(true)} className="bg-gradient-primary text-primary-foreground border-0">
          <Plus className="mr-1 h-4 w-4" /> New Deck
        </Button>
      </div>

      {showNewDeck && (
        <div className="bg-card rounded-xl border border-border/50 p-4 shadow-card mb-4 space-y-3">
          <Input placeholder="Deck title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <Input placeholder="Subject (optional)" value={newSubject} onChange={e => setNewSubject(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={createDeck}>Create</Button>
            <Button size="sm" variant="outline" onClick={() => setShowNewDeck(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {decks.length === 0 ? (
        <div className="bg-card rounded-xl border border-border/50 p-8 shadow-card text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No flashcard decks yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create a deck or convert content to get started</p>
          <Button size="sm" onClick={() => setShowNewDeck(true)}>Create Your First Deck</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {decks.map(deck => (
            <div key={deck.id} className="bg-card rounded-xl border border-border/50 p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer group" onClick={() => loadCards(deck)}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{deck.title}</h3>
                  {deck.subject && <p className="text-xs text-muted-foreground mt-0.5">{deck.subject}</p>}
                </div>
                <button onClick={e => { e.stopPropagation(); deleteDeck(deck.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">{deck.card_count || 0} cards</p>
            </div>
          ))}
        </div>
      )}

      {selectedDeck && cards.length === 0 && (
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card mt-4 text-center">
          <p className="text-muted-foreground mb-3">This deck is empty. Add some cards!</p>
          <Button size="sm" onClick={() => setShowAddCard(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add Card
          </Button>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
