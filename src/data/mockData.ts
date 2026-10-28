import { 
  Question, 
  MistakeRecord, 
  TopicMastery, 
  LibraryDocument, 
  AIMemoryItem, 
  RoadmapWeek,
  UserProfile 
} from '../types';
import { extractedVocabQuestions } from './extractedVocabQuestions';

export const initialUserProfile: UserProfile = {
  name: "Sanskriti",
  targetExam: "MAH-MBA/MMS-CET 2027",
  examDateStatus: "Provisional (Official date not yet announced)",
  startDate: "28 October 2026",
  targetEndDate: "13 April 2027",
  totalWeeks: 24,
  dailyGoalHours: 3.5,
  preferredLanguage: "English",
  companionName: "J.A.R.V.I.S.",
  role: "student"
};

export const sampleQuestions: Question[] = [
  ...extractedVocabQuestions,
  {
    id: "q-cet-qa-01",
    subject: "Quantitative Aptitude",
    topic: "Percentages & Ratios",
    subtopic: "Successive Percentage & Base Value",
    difficulty: "CET Standard",
    questionText: "Due to festive season inflation, the price of an MBA prep workbook increased by 25%. By what percentage must the price now be decreased so that it returns to its original price?",
    options: {
      A: "25%",
      B: "20%",
      C: "16.67%",
      D: "33.33%",
      E: "22.5%"
    },
    correctAnswer: "B",
    explanation: "Let the original price be ₹100. After a 25% increase, the new price becomes ₹125. To return to ₹100, the required decrease is ₹25 on the NEW base of ₹125. Percentage reduction = (25 / 125) × 100 = 20%.",
    hinglishExplanation: "Maan lo shuru ka price 100 tha. 25% badh gaya to 125 ho gaya. Ab wapas 100 lane ke liye 25 ghatana padega, par base value ab 125 hai, 100 nahi! So (25 / 125) * 100 = 20%. Yeh classic base-value trap hai.",
    sourceDocId: "doc-math-01",
    sourceDocTitle: "MAH-CET-Speed-Math-Formulas.pdf",
    sourcePage: 42,
    conceptFormula: "Required % Decrease = [x / (100 + x)] × 100",
    parallelQuestionId: "q-cet-qa-01-par"
  },
  {
    id: "q-cet-qa-01-par",
    subject: "Quantitative Aptitude",
    topic: "Percentages & Ratios",
    subtopic: "Successive Percentage & Base Value",
    difficulty: "CET Standard",
    questionText: "If salary of Rohan is 50% more than that of Priya, by what percentage is Priya's salary less than Rohan's salary?",
    options: {
      A: "50%",
      B: "40%",
      C: "33.33%",
      D: "25%",
      E: "20%"
    },
    correctAnswer: "C",
    explanation: "Let Priya's salary = ₹100. Then Rohan's salary = ₹150. Difference = ₹50. Base is Rohan's salary (₹150). Percentage less = (50 / 150) × 100 = 33.33%.",
    hinglishExplanation: "Priya ko 100 maano, to Rohan ka 150 ho gaya. Difference 50 hai, par comparison Rohan se ho raha hai (base 150). So 50/150 = 1/3 = 33.33%.",
    sourceDocId: "doc-math-01",
    sourceDocTitle: "MAH-CET-Speed-Math-Formulas.pdf",
    sourcePage: 43,
    conceptFormula: "% Less = [Difference / Reference Person's Value] × 100"
  },
  {
    id: "q-cet-lr-01",
    subject: "Logical Reasoning",
    topic: "Seating Arrangements",
    subtopic: "Circular Arrangement (Facing Inward & Outward)",
    difficulty: "CET Standard",
    questionText: "Eight executives (P, Q, R, S, T, U, V, and W) are seated around a circular table. Four of them face the centre while four face outwards. P sits third to the right of W who faces the centre. R sits second to the left of P. Both immediate neighbours of R face the same direction as R. S is not an immediate neighbour of W. What is the position of S with respect to P?",
    options: {
      A: "Immediate left",
      B: "Second to the right",
      C: "Third to the left",
      D: "Opposite to P",
      E: "Cannot be determined without additional direction clues"
    },
    correctAnswer: "D",
    explanation: "W faces centre at 6 o'clock. Since P is 3rd to right of W (anticlockwise), P is at 12 o'clock (directly opposite W). R sits 2nd to left of P. Based on the outward/inward parity constraint and S not adjoining W, deduction uniquely places S opposite P (at 6 o'clock relative to circle symmetry) or directly facing across.",
    hinglishExplanation: "Circular puzzle me sabse pehle fixed facing wale person se shuru karte hain: W centre face kar raha hai. Uske 3rd right par P hai. Phir boundary conditions se S ka position uniquely P ke opposite align hota hai.",
    sourceDocId: "doc-lr-01",
    sourceDocTitle: "Logical-Puzzles-Advanced-Handbook.docx",
    sourcePage: 18,
    conceptFormula: "Circle Parity Rule: Fixed Reference Point -> Inward/Outward Direction Check"
  },
  {
    id: "q-cet-ar-01",
    subject: "Abstract Reasoning",
    topic: "Visual Patterns & Analogies",
    subtopic: "Rotational Symmetry & Element Movement",
    difficulty: "Moderate",
    questionText: "In a visual series: A square contains a black dot moving clockwise by 45°, 90°, 135°, and 180° in successive steps. Simultaneously, an arrow at the centre rotates counter-clockwise by 90° at each step. What is the orientation of the elements in the 5th figure?",
    options: {
      A: "Dot at top-right corner, Arrow pointing South",
      B: "Dot at bottom-left corner, Arrow pointing North",
      C: "Dot at original starting position, Arrow pointing East",
      D: "Dot at bottom-center, Arrow pointing West",
      E: "Dot at top-center, Arrow pointing North"
    },
    correctAnswer: "C",
    explanation: "Sum of clockwise moves for the dot: 45° + 90° + 135° + 180° = 450° = 360° + 90° (net 90° from initial). For the arrow: 4 rotations of 90° counter-clockwise = 360° total rotation = back to its original orientation (East). Thus dot and arrow return to their relative initial positions.",
    hinglishExplanation: "Abstract Reasoning me degrees ka cumulative progression calculate karo. Dot ka 45° step increase ho raha hai, aur arrow har step 90° anti-clockwise ghoom raha hai. 4 steps ke baad arrow 360° complete karke exact shuruat wali position pe aa jata hai.",
    sourceDocId: "doc-cet-past",
    sourceDocTitle: "CET-2025-Actual-Paper-Analysis.pdf",
    sourcePage: 12,
    conceptFormula: "Step Rotation Delta: Σ Δθ mod 360°"
  },
  {
    id: "q-cet-va-01",
    subject: "Verbal Ability",
    topic: "Critical Reasoning",
    subtopic: "Assumptions & Inferences",
    difficulty: "CET Standard",
    questionText: "Statement: 'The state transport department has decided to introduce 500 electric AC buses on suburban routes to curb vehicular emissions while accommodating commuter traffic.' Which of the following is an implicit assumption?",
    options: {
      A: "Electric buses are cheaper to manufacture than conventional diesel buses.",
      B: "Commuters will be willing to shift from private vehicles or accept AC electric buses on these routes.",
      C: "Diesel buses will be immediately banned across all state highways.",
      D: "The state has zero carbon emission from coal-based thermal power plants.",
      E: "Suburban train services will reduce their operations accordingly."
    },
    correctAnswer: "B",
    explanation: "For any policy introduction to curb emissions by providing public transit, it must be assumed that the intended commuters will actually patronize or accept the new buses; otherwise the goal of reducing emissions through transit diversion fails.",
    hinglishExplanation: "Assumption wo hidden premise hota hai jiske bina statement ka conclusion ya action fail ho jaye. Agar public in buses me baithegi hi nahi, to emission kam karne ka plan fail ho jayega. Isliye option B compulsory assumption hai.",
    sourceDocId: "doc-va-01",
    sourceDocTitle: "Verbal-Roots-and-Idioms.pdf",
    sourcePage: 67,
    conceptFormula: "Assumption Negation Test: If negated, does the core argument crumble?"
  },
  {
    id: "q-cet-qa-02",
    subject: "Quantitative Aptitude",
    topic: "Profit & Loss",
    subtopic: "Marked Price & Discount Succession",
    difficulty: "CET Standard",
    questionText: "A merchant marks his goods 40% above the cost price and allows a discount of 15% on the marked price. In addition, he gives a 5% cash discount for immediate payment. What is his net profit percentage?",
    options: {
      A: "13.05%",
      B: "12.50%",
      C: "14.20%",
      D: "15.00%",
      E: "11.85%"
    },
    correctAnswer: "A",
    explanation: "Let CP = 100. MP = 140. After 15% discount, SP1 = 140 × 0.85 = 119. After 5% cash discount, Final SP = 119 × 0.95 = 113.05. Profit = 113.05 - 100 = 13.05%.",
    hinglishExplanation: "CP ko 100 lo. Marked price ho gaya 140. Pehla discount 15%: 140 * 0.85 = 119. Fir 5% cash discount: 119 * 0.95 = 113.05. 100 ka maal 113.05 me bika, so 13.05% profit.",
    sourceDocId: "doc-math-01",
    sourceDocTitle: "MAH-CET-Speed-Math-Formulas.pdf",
    sourcePage: 49,
    conceptFormula: "Net SP = CP × (1 + Markup%) × (1 - D1) × (1 - D2)"
  },
  {
    id: "q-cet-lr-02",
    subject: "Logical Reasoning",
    topic: "Syllogisms",
    subtopic: "Only A Few & Possibility Cases",
    difficulty: "CET Standard",
    questionText: "Statements:\nI. Only a few pens are pencils.\nII. All pencils are markers.\nIII. No marker is a ruler.\n\nConclusions:\nI. Some pens are not rulers.\nII. All pens can never be pencils.",
    options: {
      A: "Only Conclusion I follows",
      B: "Only Conclusion II follows",
      C: "Either Conclusion I or II follows",
      D: "Both Conclusions I and II follow",
      E: "Neither Conclusion I nor II follows"
    },
    correctAnswer: "D",
    explanation: "From 'Only a few pens are pencils', it strictly implies: Some pens are pencils AND Some pens are NOT pencils. Therefore, 'All pens can never be pencils' is definitely TRUE (Conclusion II follows). Next, pens that are pencils are also markers (All pencils are markers). Since no marker is ruler, those pens can never be rulers. Thus 'Some pens are not rulers' is definitely TRUE (Conclusion I follows).",
    hinglishExplanation: "'Only a few A are B' ka matlab hota hai ki kuch A, B hain AUR kuch A kabhi B nahi ho sakte. Isliye All pens can never be pencils true hai. Aur jo pen pencil/marker ban chuke hain wo ruler nahi ho sakte, isliye dono follow hote hain.",
    sourceDocId: "doc-lr-01",
    sourceDocTitle: "Logical-Puzzles-Advanced-Handbook.docx",
    sourcePage: 25,
    conceptFormula: "Only a few A are B ≡ (Some A are B) + (Some A are NOT B)"
  }
];

export const sampleMistakes: MistakeRecord[] = [
  {
    id: "mst-01",
    questionId: "q-cet-qa-01",
    subject: "Quantitative Aptitude",
    topic: "Percentages & Ratios",
    subtopic: "Successive Percentage & Base Value",
    mistakeCategory: "Wrong Base Value",
    questionExcerpt: "Due to festive season inflation, the price of an MBA prep workbook increased by 25%. By what percentage must the price now be decreased...",
    selectedAnswer: "A",
    correctAnswer: "B",
    misunderstandingIdentified: "Selected 25% because of assuming symmetry (believed decrease percentage equals original increase percentage).",
    correctReasoningFormula: "When original increases by x%, base value shifts upward. Required decrease = [x / (100 + x)] × 100. For 25%, formula gives 25/125 = 20%.",
    repeatedCount: 3,
    firstFailedDate: "2026-10-24",
    lastTestedDate: "2026-10-27",
    resolved: false,
    parallelQuestion: sampleQuestions[1]
  },
  {
    id: "mst-02",
    questionId: "q-cet-lr-01",
    subject: "Logical Reasoning",
    topic: "Seating Arrangements",
    subtopic: "Circular Arrangement (Facing Inward & Outward)",
    mistakeCategory: "Direction/Orientation Error",
    questionExcerpt: "Eight executives (P, Q, R, S, T, U, V, and W) are seated around a circular table. Four of them face the centre while four face outwards...",
    selectedAnswer: "B",
    correctAnswer: "D",
    misunderstandingIdentified: "Counted right-hand direction assuming outward facing instead of verified inward facing for executive W.",
    correctReasoningFormula: "Inward facing: Right is Anti-Clockwise, Left is Clockwise. Outward facing: Right is Clockwise, Left is Anti-Clockwise. Draw direction arrows on every node.",
    repeatedCount: 2,
    firstFailedDate: "2026-10-22",
    lastTestedDate: "2026-10-26",
    resolved: false
  },
  {
    id: "mst-03",
    questionId: "q-cet-va-01",
    subject: "Verbal Ability",
    topic: "Critical Reasoning",
    subtopic: "Assumptions & Inferences",
    mistakeCategory: "Conceptual Gap",
    questionExcerpt: "Statement: 'The state transport department has decided to introduce 500 electric AC buses on suburban routes...'",
    selectedAnswer: "A",
    correctAnswer: "B",
    misunderstandingIdentified: "Confused practical feasibility/cost benefit with core structural assumption necessary for the argument's validity.",
    correctReasoningFormula: "Apply the Negation Technique: 'If commuters do NOT use these buses, does the scheme fail?' Yes, so B is the assumption. Manufacturing cost doesn't break the emissions objective.",
    repeatedCount: 1,
    firstFailedDate: "2026-10-25",
    lastTestedDate: "2026-10-25",
    resolved: false
  }
];

export const sampleTopicMastery: TopicMastery[] = [
  {
    id: "tm-qa-01",
    subject: "Quantitative Aptitude",
    topicName: "Percentages & Base Values",
    status: "Needs Revision",
    accuracyPercent: 42,
    questionsAttempted: 24,
    sessionsCount: 3,
    confidenceRating: 2,
    averageTimePerQSeconds: 68,
    lastPracticedDate: "27 Oct 2026",
    nextRevisionDate: "28 Oct 2026 (Priority)",
    commonErrors: ["Using initial price instead of inflated price as base", "Confusing percentage points with percentage change"],
    evidenceText: "Accuracy fell across last two sessions (50% -> 33%). In 3 consecutive attempts, selected symmetric percentage without shifting base denominator."
  },
  {
    id: "tm-lr-01",
    subject: "Logical Reasoning",
    topicName: "Circular Seating Puzzles",
    status: "Practicing",
    accuracyPercent: 64,
    questionsAttempted: 38,
    sessionsCount: 5,
    confidenceRating: 3,
    averageTimePerQSeconds: 110,
    lastPracticedDate: "26 Oct 2026",
    nextRevisionDate: "30 Oct 2026",
    commonErrors: ["Left/Right inversion when facing outward", "Skipping dual-case branch diagrams"],
    evidenceText: "Solid baseline when all entities face inward (85% accuracy), but drops to 45% on mixed inward/outward variants."
  },
  {
    id: "tm-ar-01",
    subject: "Abstract Reasoning",
    topicName: "Series & Rotational Analogy",
    status: "Mastered",
    accuracyPercent: 88,
    questionsAttempted: 52,
    sessionsCount: 6,
    confidenceRating: 5,
    averageTimePerQSeconds: 34,
    lastPracticedDate: "25 Oct 2026",
    nextRevisionDate: "05 Nov 2026",
    commonErrors: ["Missing secondary element flips when primary element rotates 180°"],
    evidenceText: "Consistent high accuracy (>85%) over 50+ questions with speed well within CET budget (34s vs 45s target)."
  },
  {
    id: "tm-va-01",
    subject: "Verbal Ability",
    topicName: "Syllogisms & Critical Reasoning",
    status: "Practicing",
    accuracyPercent: 70,
    questionsAttempted: 30,
    sessionsCount: 4,
    confidenceRating: 4,
    averageTimePerQSeconds: 52,
    lastPracticedDate: "25 Oct 2026",
    nextRevisionDate: "31 Oct 2026",
    commonErrors: ["Treating 'Only a few' as simple 'Some'", "Confusing inference with assumption"],
    evidenceText: "Understands standard syllogisms well. Needs practice isolating implicit assumptions using negation tests."
  }
];

export const sampleLibraryDocuments: LibraryDocument[] = [
  {
    id: "doc-math-01",
    title: "MAH-CET Speed Math & Arithmetic Formulas",
    fileName: "MAH-CET-Speed-Math-Formulas.pdf",
    fileType: "PDF",
    sizeFormatted: "4.8 MB",
    uploadDate: "26 Oct 2026",
    status: "Ready",
    totalPages: 58,
    topicsDetected: ["Percentages", "Profit & Loss", "Speed Ratios", "Time & Work", "Averages"],
    extractedMCQsCount: 35,
    chunksCount: 142,
    summary: "Complete breakdown of high-frequency arithmetic short-cuts for MAH-CET with fraction-to-percentage tables and marked-price chains.",
    sampleChunks: [
      {
        pageNumber: 42,
        chunkId: "chk-42-01",
        text: "Section 3.4: Base Value Shift in Successive Variations. When quantity A increases by x%, the new value is A(1 + x/100). To revert to A, the decrease is x/(100 + x) of the new value. Note: Never use the original base when calculating reverse changes.",
        keyFormulas: ["Reverse % = [x / (100 + x)] × 100", "Fraction 1/6 = 16.66%, 1/7 = 14.28%"]
      },
      {
        pageNumber: 49,
        chunkId: "chk-49-01",
        text: "Section 4.1: Discount Chains and Net Profit. Marked Price (MP) = CP × (1 + Markup). Selling Price (SP) = MP × (1 - Discount1) × (1 - Discount2). Always compute discounts sequentially unless combined equivalent discount formula is applied.",
        keyFormulas: ["Equivalent Discount = d1 + d2 - (d1 × d2)/100"]
      }
    ]
  },
  {
    id: "doc-lr-01",
    title: "Logical Puzzles Advanced Handbook",
    fileName: "Logical-Puzzles-Advanced-Handbook.docx",
    fileType: "DOCX",
    sizeFormatted: "2.1 MB",
    uploadDate: "24 Oct 2026",
    status: "Ready",
    totalPages: 36,
    topicsDetected: ["Circular Arrangement", "Linear Parallel Rows", "Floor & Flat Puzzles", "Blood Relations"],
    extractedMCQsCount: 28,
    chunksCount: 88,
    summary: "Step-by-step methods for decoding complex CET 8-person multi-variable puzzles without getting stuck in looping assumptions.",
    sampleChunks: [
      {
        pageNumber: 18,
        chunkId: "chk-18-01",
        text: "Mixed Inward/Outward Circular Tables: Step 1: Count total entities and check for parity (e.g. 4 in, 4 out). Step 2: Fix the first entity whose direction is explicitly stated. Draw two parallel candidate circles for ambiguous placement.",
        keyFormulas: ["Rule: Never guess direction; branch into Case A and Case B immediately."]
      }
    ]
  },
  {
    id: "doc-cet-past",
    title: "CET Actual Exam Analysis & Question Pattern",
    fileName: "CET-2025-Actual-Paper-Analysis.pdf",
    fileType: "PDF",
    sizeFormatted: "8.4 MB",
    uploadDate: "20 Oct 2026",
    status: "Ready",
    totalPages: 84,
    topicsDetected: ["Full Mock Breakdown", "Sectional Timing Strategy", "Abstract Reasoning Traps"],
    extractedMCQsCount: 120,
    chunksCount: 260,
    summary: "Historical sectional weightage analysis: Logical Reasoning (75), Abstract (25), Quant (50), Verbal (50). Time budget allocation recommendations.",
    sampleChunks: [
      {
        pageNumber: 12,
        chunkId: "chk-12-01",
        text: "Abstract Reasoning CET Sectional Strategy: 25 questions must be completed in exactly 20 minutes (approx. 48 seconds per question). Focus heavily on rotational symmetry and element displacement series.",
        keyFormulas: ["Target: 22+ Marks in Abstract within 20 mins budget"]
      }
    ]
  }
];

export const sampleAIMemories: AIMemoryItem[] = [
  {
    id: "mem-01",
    type: "observed_fact",
    category: "Mastery",
    title: "Percentage Base Value Accuracy Deficit",
    statement: "Sanskriti answered only 4 out of the last 10 percentage change questions correctly (40% accuracy) across 2 sessions.",
    evidenceSource: "Practice Sessions #12 and #14 (24 Oct & 27 Oct 2026)",
    confidenceScore: 98,
    lastUpdated: "27 Oct 2026, 21:15 IST",
    editable: false
  },
  {
    id: "mem-02",
    type: "ai_hypothesis",
    category: "Mistake Pattern",
    title: "Hypothesis: Base Shift Symmetrical Assumption",
    statement: "She consistently confuses reverse percentage change with the forward increase percentage (e.g., selecting 25% decrease after a 25% increase).",
    evidenceSource: "3 distinct mistake records tagged 'Wrong Base Value' in topic 'Percentages & Ratios'",
    confidenceScore: 88,
    lastUpdated: "27 Oct 2026, 21:15 IST",
    editable: true,
    userCorrection: ""
  },
  {
    id: "mem-03",
    type: "observed_fact",
    category: "Mastery",
    title: "Abstract Reasoning Speed Excellence",
    statement: "Sanskriti consistently completes visual rotation and sequence questions in 34 seconds average with 88% accuracy.",
    evidenceSource: "52 questions attempted across 6 sessions in Abstract Reasoning",
    confidenceScore: 99,
    lastUpdated: "25 Oct 2026, 17:30 IST",
    editable: false
  },
  {
    id: "mem-04",
    type: "ai_hypothesis",
    category: "Learning Preference",
    title: "Hypothesis: Hinglish Worked Examples Accelerate Formula Retention",
    statement: "When explanations include intuitive everyday Hinglish analogies before the algebraic proof, she solves the subsequent parallel problem on first attempt.",
    evidenceSource: "Session #8 and #11 feedback ratings (5/5 stars on bilingual worked cards)",
    confidenceScore: 78,
    lastUpdated: "26 Oct 2026, 19:40 IST",
    editable: true
  },
  {
    id: "mem-05",
    type: "observed_fact",
    category: "Profile",
    title: "Evening High-Cognition Study Window",
    statement: "Peak session accuracy and lowest time-to-first-click occur between 19:00 and 22:00 IST.",
    evidenceSource: "Aggregated timestamps across 14 study sessions",
    confidenceScore: 92,
    lastUpdated: "26 Oct 2026",
    editable: true
  }
];

export const sampleRoadmapWeeks: RoadmapWeek[] = [
  {
    weekNumber: 1,
    dateRange: "28 Oct 2026 – 03 Nov 2026",
    phaseName: "Phase 1: Foundation & Arithmetic Core",
    theme: "Diagnostic Baseline & Speed Math Foundations",
    isCurrentWeek: true,
    mentorNotes: "Prioritize percentage base shift and reciprocals (1/1 to 1/20) before moving to Compound Interest.",
    focusTopics: [
      { subject: "Quantitative Aptitude", topic: "Percentages & Base Inversion", targetQuestions: 40, completed: false },
      { subject: "Logical Reasoning", topic: "Basic Linear Seating Arrangements", targetQuestions: 30, completed: false },
      { subject: "Abstract Reasoning", topic: "Visual Clockwise/Anti-Clockwise Series", targetQuestions: 35, completed: true },
      { subject: "Verbal Ability", topic: "High Frequency Roots & Contextual Vocab", targetQuestions: 40, completed: false }
    ]
  },
  {
    weekNumber: 2,
    dateRange: "04 Nov 2026 – 10 Nov 2026",
    phaseName: "Phase 1: Foundation & Arithmetic Core",
    theme: "Ratios, Proportions & Syllogism Fundamentals",
    isCurrentWeek: false,
    mentorNotes: "Ensure 'Only a few' cases in syllogism are thoroughly diagrammed with Venn loops.",
    focusTopics: [
      { subject: "Quantitative Aptitude", topic: "Profit, Loss & Successive Discounts", targetQuestions: 40, completed: false },
      { subject: "Logical Reasoning", topic: "Syllogisms (Possibility & Only A Few)", targetQuestions: 40, completed: false },
      { subject: "Abstract Reasoning", topic: "Analogies & Figure Matrix", targetQuestions: 30, completed: false },
      { subject: "Verbal Ability", topic: "Para-Jumbles (Mandatory Pairs Strategy)", targetQuestions: 30, completed: false }
    ]
  },
  {
    weekNumber: 3,
    dateRange: "11 Nov 2026 – 17 Nov 2026",
    phaseName: "Phase 1: Foundation & Arithmetic Core",
    theme: "Averages, Mixtures & Circular Tables",
    isCurrentWeek: false,
    focusTopics: [
      { subject: "Quantitative Aptitude", topic: "Alligation & Weighted Averages", targetQuestions: 40, completed: false },
      { subject: "Logical Reasoning", topic: "Circular Tables (Inward & Outward Mixed)", targetQuestions: 35, completed: false },
      { subject: "Abstract Reasoning", topic: "Odd Figure Out & Dot Situations", targetQuestions: 30, completed: false },
      { subject: "Verbal Ability", topic: "Reading Comprehension: Tone & Main Idea", targetQuestions: 25, completed: false }
    ]
  },
  {
    weekNumber: 4,
    dateRange: "18 Nov 2026 – 24 Nov 2026",
    phaseName: "Phase 2: Core CET Reasoning & Speed",
    theme: "Time-Speed-Distance & Floor Puzzles",
    isCurrentWeek: false,
    focusTopics: [
      { subject: "Quantitative Aptitude", topic: "Time, Speed, Distance & Trains", targetQuestions: 45, completed: false },
      { subject: "Logical Reasoning", topic: "Floor & Flat Puzzles (2 Variables)", targetQuestions: 35, completed: false },
      { subject: "Abstract Reasoning", topic: "Complex Folding & Pattern Unfolding", targetQuestions: 30, completed: false },
      { subject: "Verbal Ability", topic: "Critical Reasoning: Assumption Identification", targetQuestions: 30, completed: false }
    ]
  },
  {
    weekNumber: 12,
    dateRange: "13 Jan 2027 – 19 Jan 2027",
    phaseName: "Phase 3: Data Interpretation & Sectional Sprints",
    theme: "Mid-Term Review & Sectional Timing Calibration",
    isCurrentWeek: false,
    focusTopics: [
      { subject: "Quantitative Aptitude", topic: "Caselet DI & Missing Data Tables", targetQuestions: 50, completed: false },
      { subject: "Logical Reasoning", topic: "Input-Output & Coding-Decoding Shuffling", targetQuestions: 40, completed: false },
      { subject: "Abstract Reasoning", topic: "Speed Test: 25 Qs in 20 Mins", targetQuestions: 50, completed: false },
      { subject: "Verbal Ability", topic: "Full Sectional Sprint (50 Qs / 35 Mins)", targetQuestions: 50, completed: false }
    ]
  },
  {
    weekNumber: 24,
    dateRange: "07 Apr 2027 – 13 Apr 2027",
    phaseName: "Phase 5: Final Confidence & Precision",
    theme: "Final Polish, Mistake Notebook Purge & Calm Conditioning",
    isCurrentWeek: false,
    mentorNotes: "Strictly avoid new heavy theory. Only review high-frequency mistake cards and maintain sleep hygiene.",
    focusTopics: [
      { subject: "Logical Reasoning", topic: "Mistake Notebook Final Clearance", targetQuestions: 50, completed: false },
      { subject: "Quantitative Aptitude", topic: "Formula Flashcards & Speed Arithmetic", targetQuestions: 50, completed: false },
      { subject: "Abstract Reasoning", topic: "Visual Sharpness Refresher", targetQuestions: 30, completed: false },
      { subject: "Verbal Ability", topic: "RC Quick Skim & Context Clues", targetQuestions: 30, completed: false }
    ]
  }
];

export const sampleDailyPlan: import('../types').DailyPlanTask[] = [
  {
    id: "dp-01",
    title: "Percentages & Base Values: Successive Shifts & Traps",
    subject: "Quantitative Aptitude",
    topic: "Percentages & Ratios",
    estimatedMinutes: 45,
    completed: false,
    assignedByMentor: true,
    mentorNote: "Focus on the [x / (100 + x)] denominator shift rule. Solve the 5 practice MCQs.",
    taskType: "practice"
  },
  {
    id: "dp-02",
    title: "Circular Seating: Inward vs Outward Facing Arrangements",
    subject: "Logical Reasoning",
    topic: "Circular Seating Arrangements",
    estimatedMinutes: 40,
    completed: false,
    assignedByMentor: true,
    mentorNote: "Draw clear outward arrows so right=clockwise is never mixed up.",
    taskType: "concept"
  },
  {
    id: "dp-03",
    title: "Abstract Reasoning: 10 Visual Series Pattern Drills",
    subject: "Abstract Reasoning",
    topic: "Series Completion",
    estimatedMinutes: 25,
    completed: false,
    assignedByMentor: false,
    taskType: "practice"
  },
  {
    id: "dp-04",
    title: "Read Speed Math Notes (Formula Sheet)",
    subject: "Quantitative Aptitude",
    topic: "Speed Calculation",
    estimatedMinutes: 20,
    completed: true,
    assignedByMentor: true,
    mentorNote: "Memorize fractional equivalents 1/2 to 1/16.",
    taskType: "revision"
  }
];

export const sampleSyllabusSections: import('../types').SyllabusSection[] = [
  {
    subject: "Logical Reasoning",
    totalQuestions: 75,
    totalMarks: 75,
    recommendedMinutes: 70,
    topics: [
      { id: "lr-top-1", name: "Linear Seating Arrangements (Single & Dual Row)", status: "Completed", targetQuestions: 50, completedQuestions: 52, weightageRank: "High" },
      { id: "lr-top-2", name: "Circular Seating Arrangements (Inward & Outward Mixed)", status: "In Progress", targetQuestions: 60, completedQuestions: 28, weightageRank: "High", keyNotes: "Crucial CET topic; right = clockwise when facing outward." },
      { id: "lr-top-3", name: "Floor & Box Puzzles (Multi-Variable Scheduling)", status: "Not Started", targetQuestions: 60, completedQuestions: 0, weightageRank: "High" },
      { id: "lr-top-4", name: "Syllogisms (Reverse & Possibility Rules)", status: "Completed", targetQuestions: 40, completedQuestions: 40, weightageRank: "High" },
      { id: "lr-top-5", name: "Coding-Decoding & Substitution", status: "Completed", targetQuestions: 30, completedQuestions: 30, weightageRank: "Medium" },
      { id: "lr-top-6", name: "Blood Relations & Coded Generations", status: "In Progress", targetQuestions: 35, completedQuestions: 15, weightageRank: "Medium" },
      { id: "lr-top-7", name: "Direction Sense & Shadow Tests", status: "Completed", targetQuestions: 25, completedQuestions: 25, weightageRank: "Foundational" },
      { id: "lr-top-8", name: "Input-Output Machine Sequencing", status: "Not Started", targetQuestions: 40, completedQuestions: 0, weightageRank: "Medium" },
      { id: "lr-top-9", name: "Critical Reasoning (Statement-Assumption & Inferences)", status: "Not Started", targetQuestions: 45, completedQuestions: 0, weightageRank: "High" }
    ]
  },
  {
    subject: "Abstract Reasoning",
    totalQuestions: 25,
    totalMarks: 25,
    recommendedMinutes: 20,
    topics: [
      { id: "ar-top-1", name: "Visual Series Completion & Rotation Cycles", status: "In Progress", targetQuestions: 50, completedQuestions: 35, weightageRank: "High" },
      { id: "ar-top-2", name: "Figure Analogies & Inversion Pairs", status: "In Progress", targetQuestions: 40, completedQuestions: 20, weightageRank: "High" },
      { id: "ar-top-3", name: "Odd Figure Out (Classification & Elements Count)", status: "Not Started", targetQuestions: 35, completedQuestions: 0, weightageRank: "Medium" },
      { id: "ar-top-4", name: "Paper Folding, Pattern Unfolding & Dot Situations", status: "Not Started", targetQuestions: 30, completedQuestions: 0, weightageRank: "Medium" }
    ]
  },
  {
    subject: "Quantitative Aptitude",
    totalQuestions: 50,
    totalMarks: 50,
    recommendedMinutes: 40,
    topics: [
      { id: "qa-top-1", name: "Percentages, Reverse Base Values & Successive Shifts", status: "In Progress", targetQuestions: 60, completedQuestions: 32, weightageRank: "High", keyNotes: "Always verify new denominator (100 + x)." },
      { id: "qa-top-2", name: "Profit, Loss, Discount & False Weights", status: "Not Started", targetQuestions: 45, completedQuestions: 0, weightageRank: "High" },
      { id: "qa-top-3", name: "Ratio, Proportion & Partnerships", status: "Completed", targetQuestions: 40, completedQuestions: 40, weightageRank: "High" },
      { id: "qa-top-4", name: "Averages, Weighted Mean & Alligations", status: "Not Started", targetQuestions: 40, completedQuestions: 0, weightageRank: "Medium" },
      { id: "qa-top-5", name: "Time, Speed, Distance, Trains & Relative Velocity", status: "Not Started", targetQuestions: 50, completedQuestions: 0, weightageRank: "High" },
      { id: "qa-top-6", name: "Time & Work, Efficiency & Pipes-Cisterns", status: "Not Started", targetQuestions: 45, completedQuestions: 0, weightageRank: "High" },
      { id: "qa-top-7", name: "Simple & Compound Interest", status: "Not Started", targetQuestions: 30, completedQuestions: 0, weightageRank: "Medium" },
      { id: "qa-top-8", name: "Data Interpretation: Tables & Missing Data", status: "Not Started", targetQuestions: 50, completedQuestions: 0, weightageRank: "High" },
      { id: "qa-top-9", name: "Data Interpretation: Bar, Line & Pie Charts", status: "Not Started", targetQuestions: 50, completedQuestions: 0, weightageRank: "High" }
    ]
  },
  {
    subject: "Verbal Ability",
    totalQuestions: 50,
    totalMarks: 50,
    recommendedMinutes: 20,
    topics: [
      { id: "va-top-1", name: "Reading Comprehension: Main Idea, Inference & Tone", status: "In Progress", targetQuestions: 60, completedQuestions: 24, weightageRank: "High" },
      { id: "va-top-2", name: "Vocabulary: Synonyms, Antonyms & Context Meanings", status: "In Progress", targetQuestions: 50, completedQuestions: 30, weightageRank: "High" },
      { id: "va-top-3", name: "Sentence Correction & Subject-Verb Agreement", status: "Completed", targetQuestions: 40, completedQuestions: 40, weightageRank: "High" },
      { id: "va-top-4", name: "Para Jumbles & Sentence Sequence Shuffling", status: "Not Started", targetQuestions: 45, completedQuestions: 0, weightageRank: "High" },
      { id: "va-top-5", name: "Cloze Test & Contextual Fillers", status: "Not Started", targetQuestions: 40, completedQuestions: 0, weightageRank: "Medium" }
    ]
  }
];

