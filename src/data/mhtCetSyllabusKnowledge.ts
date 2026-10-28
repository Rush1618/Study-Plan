// Comprehensive MAH-MBA/MMS-CET 2027 Knowledge Base & Syllabus Matrix
// Built for Ruvi Autonomous AI Companion & Study Mentor for Sanskriti

export interface SyllabusTopicDetail {
  id: string;
  section: 'Logical Reasoning' | 'Abstract Reasoning' | 'Quantitative Aptitude' | 'Verbal Ability';
  name: string;
  subtopics: string[];
  totalExpectedQuestions: number;
  weightageRank: 'Critical' | 'High' | 'Medium' | 'Foundational';
  status: 'Mastered' | 'In Progress' | 'Remaining';
  targetSolveSpeedSecs: number;
  coreFormulas: string[];
  examinerTraps: string[];
  hinglishIntuition: string;
}

export interface ExamPatternInfo {
  examName: string;
  conductingBody: string;
  targetYear: number;
  totalQuestions: number;
  totalMarks: number;
  totalTimeMinutes: number;
  averageTimePerQuestionSecs: number;
  markingScheme: {
    correct: number;
    incorrect: number;
    unattempted: number;
    sectionalTimeLimit: boolean;
    negativeMarking: boolean;
  };
  targetColleges: {
    name: string;
    targetPercentile: string;
    expectedScore: string;
    location: string;
  }[];
}

export const MAH_CET_EXAM_INFO: ExamPatternInfo = {
  examName: "MAH-MBA/MMS CET (Maharashtra Common Entrance Test)",
  conductingBody: "State Common Entrance Test Cell, Maharashtra",
  targetYear: 2027,
  totalQuestions: 200,
  totalMarks: 200,
  totalTimeMinutes: 150,
  averageTimePerQuestionSecs: 45,
  markingScheme: {
    correct: 1,
    incorrect: 0,
    unattempted: 0,
    sectionalTimeLimit: false,
    negativeMarking: false
  },
  targetColleges: [
    { name: "Jamnalal Bajaj Institute of Management Studies (JBIMS)", targetPercentile: "99.99 %ile", expectedScore: "142 - 155+", location: "Mumbai (Churchgate)" },
    { name: "Sydneham Institute of Management Studies (SIMSREE)", targetPercentile: "99.95 %ile", expectedScore: "135 - 145", location: "Mumbai (Churchgate)" },
    { name: "Department of Management Sciences (PUMBA)", targetPercentile: "99.50 %ile", expectedScore: "122 - 132", location: "Pune University" },
    { name: "Prin. L. N. Welingkar Institute (WeSchool)", targetPercentile: "99.30 %ile", expectedScore: "118 - 128", location: "Mumbai (Matunga)" },
    { name: "SIES College of Management Studies", targetPercentile: "98.50 %ile", expectedScore: "112 - 122", location: "Navi Mumbai" },
    { name: "Xavier Institute of Management & Research (XIMR)", targetPercentile: "98.20 %ile", expectedScore: "110 - 120", location: "Mumbai" }
  ]
};

export const MAH_CET_SYLLABUS_TOPICS: SyllabusTopicDetail[] = [
  // 1. VERBAL ABILITY & READING COMPREHENSION (50 Questions)
  {
    id: "va-01",
    section: "Verbal Ability",
    name: "Vocabulary & High-Frequency CET Words",
    subtopics: ["Latin & Greek Roots", "Synonyms & Antonyms", "Contextual Meaning in Sentence", "One Word Substitution"],
    totalExpectedQuestions: 15,
    weightageRank: "Critical",
    status: "In Progress",
    targetSolveSpeedSecs: 25,
    coreFormulas: [
      "Prefix + Root + Suffix = Etymological Core",
      "Tone Matching (+ / - / Neutral) eliminates 2 out of 4 options immediately"
    ],
    examinerTraps: [
      "Phonetic mimicry: Words that sound like familiar words but mean the opposite.",
      "Extreme synonyms: CET prefers moderate contextual meanings over obscure archaic ones."
    ],
    hinglishIntuition: "Word ka context dekho. Agar root pata hai (jaise Biblio = Book, Pyro = Fire), to bina rote memorization ke 100% accurate eliminate ho jata hai."
  },
  {
    id: "va-02",
    section: "Verbal Ability",
    name: "Words Confused & Misused",
    subtopics: ["Affect vs Effect", "Principal vs Principle", "Advice vs Advise", "Compliment vs Complement"],
    totalExpectedQuestions: 8,
    weightageRank: "High",
    status: "In Progress",
    targetSolveSpeedSecs: 25,
    coreFormulas: [
      "Affect = Verb (Action) | Effect = Noun (Outcome)",
      "Advice (-c) = Noun | Advise (-s) = Verb"
    ],
    examinerTraps: ["Part-of-speech trap: Inserting an adjective or noun when a verb is grammatically needed."],
    hinglishIntuition: "Sentence me dekho ki action ho raha hai ya result bata rahe hain. Action hai to 'affect', result hai to 'effect'."
  },
  {
    id: "va-03",
    section: "Verbal Ability",
    name: "Sentence Correction & Subject-Verb Agreement",
    subtopics: ["Subject-Verb Concord", "Intervening Prepositional Phrases", "Either...or / Neither...nor", "Parallelism"],
    totalExpectedQuestions: 10,
    weightageRank: "Critical",
    status: "Mastered",
    targetSolveSpeedSecs: 30,
    coreFormulas: [
      "Singular Subject + Singular Verb (adds -s)",
      "Ignore prepositional phrases between subject and verb (The box of chocolates IS heavy)"
    ],
    examinerTraps: ["Proximity Trap: Matching verb with the nearest plural noun inside 'of...' instead of true subject."],
    hinglishIntuition: "Ungli se prepositional phrase (jaise 'of chocolates') ko chhupa do, phir check karo main subject singular hai ya plural."
  },
  {
    id: "va-04",
    section: "Verbal Ability",
    name: "Reading Comprehension (RC Passages)",
    subtopics: ["Main Idea & Central Theme", "Direct Factual Retrieval", "Inference & Author Tone", "Title of Passage"],
    totalExpectedQuestions: 12,
    weightageRank: "Critical",
    status: "Remaining",
    targetSolveSpeedSecs: 60,
    coreFormulas: [
      "Question-first skimming: Read questions before passage to know key anchor words",
      "Tone classification: Objective / Critical / Laudatory / Analytical"
    ],
    examinerTraps: ["Out-of-scope extrapolation: Options that sound true in real life but are never mentioned in the passage."],
    hinglishIntuition: "Apna personal gyaan mat lagao. Jo passage me likha hai sirf wahi sacch hai CET me."
  },
  {
    id: "va-05",
    section: "Verbal Ability",
    name: "Para Jumbles & Sentence Sequence Shuffling",
    subtopics: ["Opening Sentence Identification", "Mandatory Noun-Pronoun Pairs", "Chronological & Transition Markers"],
    totalExpectedQuestions: 5,
    weightageRank: "High",
    status: "Remaining",
    targetSolveSpeedSecs: 50,
    coreFormulas: [
      "Mandatory Pair Rule: Noun always precedes its Pronoun",
      "Option Elimination: Check 1st and last pairs from option choices directly"
    ],
    examinerTraps: ["Starting with a sentence that has 'However', 'Therefore', or 'This'."],
    hinglishIntuition: "Poora arrange karne mat baitho. Sirf mandatory pair (jaise B ke turant baad D) dhoondho aur options eliminate karo."
  },

  // 2. QUANTITATIVE APTITUDE & DATA INTERPRETATION (50 Questions)
  {
    id: "qa-01",
    section: "Quantitative Aptitude",
    name: "Percentages & Reverse Base Value Shifts",
    subtopics: ["Successive Shifts", "Expenditure Constant Rule", "Reverse Denominator Traps", "Fraction to Percent Equivalents"],
    totalExpectedQuestions: 8,
    weightageRank: "Critical",
    status: "In Progress",
    targetSolveSpeedSecs: 40,
    coreFormulas: [
      "Required % Reduction = [x / (100 + x)] × 100",
      "If price rises by 1/n, consumption must fall by 1/(n+1) to keep budget constant",
      "Net Successive Change = x + y + (xy / 100)"
    ],
    examinerTraps: ["Symmetry trap: Assuming that a 25% increase is reversed by a 25% decrease."],
    hinglishIntuition: "100 se 125 hua. Ab wapas 100 aana hai to 25 kam hoga, par 125 pe! 25/125 = 20%, 25% nahi!"
  },
  {
    id: "qa-02",
    section: "Quantitative Aptitude",
    name: "Profit, Loss & Successive Discounts",
    subtopics: ["Marked Price vs Cost Price", "Equated Successive Discounts", "False Weights & Cheating Trader"],
    totalExpectedQuestions: 7,
    weightageRank: "High",
    status: "Remaining",
    targetSolveSpeedSecs: 45,
    coreFormulas: [
      "Single Equivalent Discount = d1 + d2 - (d1 × d2 / 100)",
      "CP : MP = (100 - Discount%) : (100 + Profit%)"
    ],
    examinerTraps: ["Adding discounts linearly: 20% + 10% is 28%, NOT 30%."],
    hinglishIntuition: "Marked price pe discount lagta hai, Cost price pe profit calculate hota hai."
  },
  {
    id: "qa-03",
    section: "Quantitative Aptitude",
    name: "Ratio, Proportion & Alligation",
    subtopics: ["Duplicate & Sub-duplicate ratios", "Rule of Alligation", "Partnership Profit Distribution"],
    totalExpectedQuestions: 6,
    weightageRank: "High",
    status: "Mastered",
    targetSolveSpeedSecs: 35,
    coreFormulas: [
      "Alligation Cross: (Cheaper Qty) / (Dearer Qty) = (Dearer Price - Mean) / (Mean - Cheaper Price)",
      "Profit Share = Investment × Time Duration"
    ],
    examinerTraps: ["Mixing time periods of different partners without standardizing to months."],
    hinglishIntuition: "Cross method lagao: beech me mean rate likho, cross subtract karo aur direct ratio pao."
  },
  {
    id: "qa-04",
    section: "Quantitative Aptitude",
    name: "Time, Speed, Distance & Trains",
    subtopics: ["Relative Velocity", "Trains Crossing Pole vs Platform", "Boats & Streams (Upstream/Downstream)"],
    totalExpectedQuestions: 6,
    weightageRank: "Critical",
    status: "Remaining",
    targetSolveSpeedSecs: 50,
    coreFormulas: [
      "Opposite direction: Relative Speed = S1 + S2",
      "Same direction: Relative Speed = S1 - S2",
      "km/h to m/s: Multiply by 5/18"
    ],
    examinerTraps: ["Forgetting that train length must be added to platform length when crossing."],
    hinglishIntuition: "Train jab platform ko cross karti hai to dono ki lambaai judti hai (Lt + Lp)."
  },
  {
    id: "qa-05",
    section: "Quantitative Aptitude",
    name: "Time & Work, Efficiency & Pipes-Cisterns",
    subtopics: ["Unitary Work Method", "Negative Work (Leak in tank)", "Men-Women-Days Equivalence (M1D1H1/W1)"],
    totalExpectedQuestions: 5,
    weightageRank: "High",
    status: "Remaining",
    targetSolveSpeedSecs: 45,
    coreFormulas: [
      "Total Work = LCM of individual times",
      "M1 × D1 × H1 / W1 = M2 × D2 × H2 / W2"
    ],
    examinerTraps: ["Adding times instead of adding rates/efficiencies."],
    hinglishIntuition: "Days ka LCM le kar total units of work maan lo, phir daily efficiency calculate kar lo."
  },
  {
    id: "qa-06",
    section: "Quantitative Aptitude",
    name: "Data Interpretation (Tables, Bar, Line & Pie Charts)",
    subtopics: ["Percentage Contribution", "Ratio of Growth", "Missing Data Tables", "Multi-Chart Combinations"],
    totalExpectedQuestions: 15,
    weightageRank: "Critical",
    status: "Remaining",
    targetSolveSpeedSecs: 45,
    coreFormulas: [
      "% Growth = [(New - Old) / Old] × 100",
      "Pie chart 1% = 3.6 degrees"
    ],
    examinerTraps: ["Calculating exact decimals when options have large spread (use approximation)."],
    hinglishIntuition: "Approximation use karo! Agar options door-door hain to round off karke 10 second me answer nikalo."
  },

  // 3. LOGICAL REASONING (75 Questions - Highest Weightage Section!)
  {
    id: "lr-01",
    section: "Logical Reasoning",
    name: "Circular Seating Arrangements",
    subtopics: ["All Inward Facing", "Inward & Outward Mixed", "Circular with Dual Attributes (Profession/Color)"],
    totalExpectedQuestions: 15,
    weightageRank: "Critical",
    status: "In Progress",
    targetSolveSpeedSecs: 45,
    coreFormulas: [
      "Inward Facing: Right = Counter-Clockwise | Left = Clockwise",
      "Outward Facing: Right = Clockwise | Left = Counter-Clockwise",
      "Bifurcation Rule: Always draw Case A and Case B simultaneously"
    ],
    examinerTraps: ["Mixing up personal right with outward-facing person right."],
    hinglishIntuition: "Bahar dekhne wale ke liye ghadi ki disha (clockwise) uska right hand hota hai. Hamesha 2 diagram banao."
  },
  {
    id: "lr-02",
    section: "Logical Reasoning",
    name: "Linear Row Arrangements (Single & Dual Row)",
    subtopics: ["Facing North", "Facing North & South Mixed", "Parallel Rows Facing Each Other"],
    totalExpectedQuestions: 15,
    weightageRank: "Critical",
    status: "Mastered",
    targetSolveSpeedSecs: 40,
    coreFormulas: [
      "Facing North: Right = User Right, Left = User Left",
      "Facing South: Right and Left invert"
    ],
    examinerTraps: ["Not placing definite end-point clues first."],
    hinglishIntuition: "Pehle pakki information (jaise 'A sits at extreme end') ko fix karo, guess work mat karo."
  },
  {
    id: "lr-03",
    section: "Logical Reasoning",
    name: "Syllogisms & Venn Logic",
    subtopics: ["Some / All / No / Some Not", "Possibility Cases", "Only A Few / Only"],
    totalExpectedQuestions: 8,
    weightageRank: "High",
    status: "Mastered",
    targetSolveSpeedSecs: 30,
    coreFormulas: [
      "'Only a few A are B' means: Some A are B AND Some A are NOT B",
      "If basic Venn diagram disproves a definite conclusion, conclusion is False"
    ],
    examinerTraps: ["Treating 'Only a few' as standard 'Some'."],
    hinglishIntuition: "'Only a few' ka matlab hai kuch to hain, par kuch pakka nahi hain."
  },
  {
    id: "lr-04",
    section: "Logical Reasoning",
    name: "Floor, Box & Scheduling Puzzles",
    subtopics: ["Multi-Story Building", "Boxes Stacked Above/Below", "Day-Month Scheduling with Attributes"],
    totalExpectedQuestions: 15,
    weightageRank: "Critical",
    status: "Remaining",
    targetSolveSpeedSecs: 50,
    coreFormulas: [
      "Create vertical grid with fixed entities (Floors 8 down to 1)",
      "Eliminate conflicting cases step by step"
    ],
    examinerTraps: ["Starting with negative statements ('X does not live on 4th floor')."],
    hinglishIntuition: "Hamesha structure (1 to 8 floors) draw karo aur side me clues note karo."
  },
  {
    id: "lr-05",
    section: "Logical Reasoning",
    name: "Coding-Decoding & Input-Output Sequencing",
    subtopics: ["Letter Shifting (+3/-2)", "Symbol Substitution", "Machine Step-by-Step Sorting Algorithm"],
    totalExpectedQuestions: 10,
    weightageRank: "High",
    status: "Remaining",
    targetSolveSpeedSecs: 40,
    coreFormulas: [
      "Check alphabetical position (A=1, Z=26, EJOTY = 5, 10, 15, 20, 25)",
      "Machine IO: Identify whether sorting is Alphabetical (Ascending/Descending) or Numerical"
    ],
    examinerTraps: ["Not noticing alternating words and numbers in machine output."],
    hinglishIntuition: "Last step dekho pehle! Last step se poora pattern (jaise word-number-word-number) turant samajh aa jata hai."
  },
  {
    id: "lr-06",
    section: "Logical Reasoning",
    name: "Critical Reasoning (Assumptions, Inferences & Conclusions)",
    subtopics: ["Statement & Assumption", "Statement & Course of Action", "Strengthen & Weaken Argument"],
    totalExpectedQuestions: 8,
    weightageRank: "High",
    status: "Remaining",
    targetSolveSpeedSecs: 45,
    coreFormulas: [
      "Assumption is the unstated premise necessary for the argument to hold true",
      "Negation test: If negating the assumption destroys the argument, it is valid"
    ],
    examinerTraps: ["Choosing extreme statements with words like 'Always', 'Never', 'All'."],
    hinglishIntuition: "Jo assumption argument ko hold karta hai wahi sahi hai. Extreme words ('always', 'only') wale options 90% galat hote hain."
  },

  // 4. ABSTRACT REASONING (25 Questions - High Speed Scoring!)
  {
    id: "ar-01",
    section: "Abstract Reasoning",
    name: "Visual Series Completion",
    subtopics: ["Clockwise / Counter-Clockwise Rotation (45°, 90°, 135°)", "Element Count Progression (+1, -1)", "Movement Across Quadrants"],
    totalExpectedQuestions: 12,
    weightageRank: "Critical",
    status: "In Progress",
    targetSolveSpeedSecs: 25,
    coreFormulas: [
      "Track ONE element at a time across figures 1 to 5",
      "Angle displacement rule: 45° corner to side, 90° corner to corner"
    ],
    examinerTraps: ["Looking at the entire complex figure at once instead of isolating individual symbols."],
    hinglishIntuition: "Poore diagram ko ek saath mat dekho. Sirf arrow ya dot ko pakdo aur dekho kitna ghoom raha hai."
  },
  {
    id: "ar-02",
    section: "Abstract Reasoning",
    name: "Figure Analogies & Inversions",
    subtopics: ["Pair Relationship (Fig A to Fig B = Fig C to Fig D)", "Horizontal / Vertical Mirror Flips", "Shading Inversion"],
    totalExpectedQuestions: 8,
    weightageRank: "High",
    status: "In Progress",
    targetSolveSpeedSecs: 25,
    coreFormulas: ["Identify transformation vector: Rotate + Invert + Shade"],
    examinerTraps: ["Mirror image vs Water image confusion."],
    hinglishIntuition: "Pehle pair ka relation dekho: kya invert hua ya rotate? Wahi same rule second pair pe lagao."
  },
  {
    id: "ar-03",
    section: "Abstract Reasoning",
    name: "Odd Figure Out (Classification)",
    subtopics: ["Symmetry lines", "Closed vs Open figures", "Internal angle counts"],
    totalExpectedQuestions: 5,
    weightageRank: "Medium",
    status: "Remaining",
    targetSolveSpeedSecs: 20,
    coreFormulas: ["Count number of sides, intersections, and rotational symmetry"],
    examinerTraps: ["Superficial similarity masking different number of line segments."],
    hinglishIntuition: "Lines count karo ya symmetry dekho. Ek figure alag rule follow kar rahi hogi."
  }
];

export const MhtCetKnowledgeEngine = {
  getExamOverview(): ExamPatternInfo {
    return MAH_CET_EXAM_INFO;
  },

  getAllTopics(): SyllabusTopicDetail[] {
    return MAH_CET_SYLLABUS_TOPICS;
  },

  getTopicsBySection(section: string): SyllabusTopicDetail[] {
    return MAH_CET_SYLLABUS_TOPICS.filter(t => t.section.toLowerCase() === section.toLowerCase());
  },

  getSyllabusStats() {
    const all = MAH_CET_SYLLABUS_TOPICS;
    const mastered = all.filter(t => t.status === 'Mastered');
    const inProgress = all.filter(t => t.status === 'In Progress');
    const remaining = all.filter(t => t.status === 'Remaining');

    return {
      totalTopics: all.length,
      masteredCount: mastered.length,
      inProgressCount: inProgress.length,
      remainingCount: remaining.length,
      percentComplete: Math.round((mastered.length / all.length) * 100),
      masteredList: mastered.map(t => t.name),
      inProgressList: inProgress.map(t => t.name),
      remainingList: remaining.map(t => t.name)
    };
  },

  searchKnowledge(query: string): { topic?: SyllabusTopicDetail; answer: string; hinglish?: string } {
    const q = query.toLowerCase();
    
    // Check if asking about colleges or cutoffs
    if (q.includes('college') || q.includes('cutoff') || q.includes('jbims') || q.includes('simsree') || q.includes('score')) {
      return {
        answer: `For MAH-MBA/MMS-CET, the target colleges and cutoffs are:\n\n1. **JBIMS (Mumbai)**: 99.99 %ile (Score: 142 - 155+)\n2. **SIMSREE (Mumbai)**: 99.95 %ile (Score: 135 - 145)\n3. **PUMBA (Pune)**: 99.50 %ile (Score: 122 - 132)\n4. **Welingkar WeSchool (Mumbai)**: 99.30 %ile (Score: 118 - 128)\n5. **SIES (Navi Mumbai)**: 98.50 %ile (Score: 112 - 122)\n\nZero negative marking applies across all 200 questions!`,
        hinglish: `Sanskriti, top priority JBIMS (99.99 %ile) aur SIMSREE (99.95 %ile) hain. 200 me se 140+ laana target hai. Har question 45 second me solve karna hai aur negative marking ZERO hai, isliye last me koi question chhodna nahi hai!`
      };
    }

    // Check if asking about remaining syllabus
    if (q.includes('remaining') || q.includes('what is left') || q.includes('syllabus left') || q.includes('kya bacha')) {
      const stats = this.getSyllabusStats();
      return {
        answer: `Here is what is currently remaining in your MAH-MBA/MMS-CET syllabus:\n\n` +
          `• **Completed/Mastered (${stats.masteredCount})**: ${stats.masteredList.join(', ')}\n` +
          `• **In Progress (${stats.inProgressCount})**: ${stats.inProgressList.join(', ')}\n` +
          `• **Remaining to Master (${stats.remainingCount})**:\n  - ` + stats.remainingList.join('\n  - ') +
          `\n\nOverall syllabus completion: ${stats.percentComplete}%.`,
        hinglish: `Sanskriti! Tumhara ~${stats.percentComplete}% syllabus strong ho chuka hai. Linear rows aur sentence correction mastered hain. Ab humara next target Circular Puzzles, Floor Puzzles, Time-Speed-Distance aur Reading Comprehension cover karna hai!`
      };
    }

    // Check match by topic
    const matched = MAH_CET_SYLLABUS_TOPICS.find(t => 
      t.name.toLowerCase().includes(q) || 
      t.subtopics.some(st => st.toLowerCase().includes(q)) ||
      q.includes(t.name.toLowerCase())
    );

    if (matched) {
      return {
        topic: matched,
        answer: `**${matched.name} (${matched.section})**\n\n` +
          `• **CET Weightage**: ~${matched.totalExpectedQuestions} Questions (${matched.weightageRank} Priority)\n` +
          `• **Target Speed**: ≤${matched.targetSolveSpeedSecs} seconds per question\n` +
          `• **Core Formulas**: ${matched.coreFormulas.join('; ')}\n` +
          `• **Examiner Traps to Avoid**: ${matched.examinerTraps.join('; ')}`,
        hinglish: matched.hinglishIntuition
      };
    }

    return {
      answer: `MAH-MBA/MMS-CET 2027 consists of 200 questions in 150 minutes across 4 sections: Logical Reasoning (75), Quantitative Aptitude (50), Verbal Ability (50), and Abstract Reasoning (25). No negative marking!`,
      hinglish: `CET me 200 questions hote hain aur 150 minutes milte hain (average 45s per Q). Negative marking zero hai!`
    };
  }
};
