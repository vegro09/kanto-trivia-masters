import { CATEGORIES, type CategoryId, type Difficulty, type Question } from "@/data/questions";

export function fisherYatesShuffle<T>(arr: readonly T[] | T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = temp;
  }
  return copy;
}

export interface DeckBuilderOptions {
  pool: Question[];
  selectedCategories: CategoryId[];
  selectedDifficulties: Difficulty[];
  roundLimit: number;
}

/**
 * Builds an interleaved, anti-monotony question deck:
 * 1. Groups questions by category and difficulty buckets.
 * 2. Shuffles each sub-bucket independently with Fisher-Yates.
 * 3. Rotates through categories in a round-robin cycle with controlled randomness.
 * 4. Strictly prevents consecutive questions from the same category (unless only one category exists).
 * 5. Applies a balanced, rhythmic difficulty sequence (e.g. Easy -> Medium -> Hard -> Medium).
 */
export function buildInterleavedDeck({
  pool,
  selectedCategories,
  selectedDifficulties,
  roundLimit,
}: DeckBuilderOptions): Question[] {
  if (pool.length === 0 || selectedCategories.length === 0 || selectedDifficulties.length === 0) {
    return [];
  }

  // Canonical category names
  const categoryNames = selectedCategories.map((id) => {
    const found = CATEGORIES.find((c) => c.id === id);
    return found ? found.name : id;
  });

  // Randomized starting category order to provide controlled randomness on game start
  const activeCategoryOrder = fisherYatesShuffle(categoryNames);

  // Group into Bucket_Category -> Bucket_Difficulty
  const categoryBuckets = new Map<string, Map<Difficulty, Question[]>>();

  for (const catName of activeCategoryOrder) {
    const diffMap = new Map<Difficulty, Question[]>();
    for (const d of selectedDifficulties) {
      diffMap.set(d, []);
    }
    categoryBuckets.set(catName, diffMap);
  }

  // Populate buckets
  for (const q of pool) {
    const catMap = categoryBuckets.get(q.category);
    if (!catMap) continue;
    if (catMap.has(q.difficulty)) {
      catMap.get(q.difficulty)!.push(q);
    } else if (catMap.has("صعب") && q.difficulty === "متوسط") {
      // Safe fallback for categories without hard tier (e.g. Islamic):
      // Put medium questions into the hard bucket when hard is active
      catMap.get("صعب")!.push(q);
    }
  }

  // Internally shuffle each sub-bucket
  for (const diffMap of categoryBuckets.values()) {
    for (const [diff, list] of diffMap.entries()) {
      diffMap.set(diff, fisherYatesShuffle(list));
    }
  }

  // Difficulty rhythm cycle
  const difficultyRhythm: Difficulty[] = (() => {
    const hasEasy = selectedDifficulties.includes("سهل");
    const hasMed = selectedDifficulties.includes("متوسط");
    const hasHard = selectedDifficulties.includes("صعب");

    if (hasEasy && hasMed && hasHard) {
      // Natural progression with gentle descent
      return ["سهل", "متوسط", "صعب", "متوسط"];
    }
    if (hasEasy && hasMed) {
      return ["سهل", "متوسط"];
    }
    if (hasMed && hasHard) {
      return ["متوسط", "صعب"];
    }
    if (hasEasy && hasHard) {
      return ["سهل", "صعب"];
    }
    return [selectedDifficulties[0] ?? "سهل"];
  })();

  const totalAvailable = pool.length;
  const targetCount = roundLimit > 0 ? Math.min(roundLimit, totalAvailable) : totalAvailable;

  const deck: Question[] = [];
  let rhythmIndex = 0;
  let lastCategory: string | null = null;
  let currentCatIndex = 0;

  const countRemainingInCategory = (catName: string): number => {
    const catMap = categoryBuckets.get(catName);
    if (!catMap) return 0;
    let count = 0;
    for (const list of catMap.values()) count += list.length;
    return count;
  };

  const drawFromCategory = (catName: string, desiredDiff: Difficulty): Question | null => {
    const catMap = categoryBuckets.get(catName);
    if (!catMap) return null;

    // 1. Primary choice: desired rhythmic difficulty
    const targetQueue = catMap.get(desiredDiff);
    if (targetQueue && targetQueue.length > 0) {
      return targetQueue.pop()!;
    }

    // 2. Safe Fallback: closest available difficulty within same category
    // (e.g. serving from medium pool when hard is requested for Islamic category)
    for (const queue of catMap.values()) {
      if (queue.length > 0) {
        return queue.pop()!;
      }
    }

    return null;
  };

  while (deck.length < targetCount) {
    const remainingCategories = activeCategoryOrder.filter(
      (cat) => countRemainingInCategory(cat) > 0,
    );

    if (remainingCategories.length === 0) break;

    // Select next category adhering to Anti-Repetition Rule
    let chosenCat: string | null = null;

    if (remainingCategories.length === 1) {
      // Only one category left, no alternative
      chosenCat = remainingCategories[0];
    } else {
      // Multiple categories available: advance circular pointer until finding
      // an active category that is NOT lastCategory
      let attempts = 0;
      while (attempts < activeCategoryOrder.length) {
        const candidate = activeCategoryOrder[currentCatIndex % activeCategoryOrder.length];
        currentCatIndex++;
        attempts++;

        if (candidate !== lastCategory && countRemainingInCategory(candidate) > 0) {
          chosenCat = candidate;
          break;
        }
      }

      // If loop didn't find candidate due to edge case, fallback to any non-lastCategory
      if (!chosenCat) {
        chosenCat = remainingCategories.find((c) => c !== lastCategory) ?? remainingCategories[0];
      }
    }

    if (!chosenCat) break;

    const desiredDiff = difficultyRhythm[rhythmIndex % difficultyRhythm.length];
    const pickedQuestion = drawFromCategory(chosenCat, desiredDiff);

    if (pickedQuestion) {
      deck.push(pickedQuestion);
      lastCategory = pickedQuestion.category;
      rhythmIndex++;
    } else {
      break;
    }
  }

  return deck;
}
