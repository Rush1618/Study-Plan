import { 
  Question, 
  MistakeRecord, 
  TopicMastery, 
  AIMemoryItem, 
  MistakeCategory,
  SubjectType 
} from '../types';
import { StorageService, AttemptLog } from './storage';

export interface LearningAssessment {
  topicAccuracy: number;
  priorityTopic: string;
  identifiedGap: string;
  recommendationText: string;
  evidenceCitation: string;
  unresolvedMistakesCount: number;
}

export const LearningEngine = {
  /**
   * Core Step: Record an attempted answer, update mastery scores,
   * detect recurring misconceptions, and form hypotheses.
   */
  processAttempt(
    question: Question,
    chosenAnswer: 'A' | 'B' | 'C' | 'D' | 'E',
    timeSpentSeconds: number
  ): { isCorrect: boolean; feedback: string; newlyFormedHypothesis?: AIMemoryItem } {
    const isCorrect = chosenAnswer === question.correctAnswer;
    const now = new Date().toISOString();

    // 1. Log attempt
    const attempt: AttemptLog = {
      id: `att-${Date.now()}`,
      questionId: question.id,
      subject: question.subject,
      topic: question.topic,
      chosenAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      timeSpentSeconds,
      timestamp: now
    };
    StorageService.logAttempt(attempt);

    // 2. Update Topic Mastery
    const allMasteries = StorageService.getTopicMastery();
    let topicEntry = allMasteries.find(m => m.topicName.toLowerCase().includes(question.topic.toLowerCase()) || question.topic.toLowerCase().includes(m.topicName.toLowerCase()));

    if (!topicEntry) {
      topicEntry = {
        id: `tm-${Date.now()}`,
        subject: question.subject,
        topicName: question.topic,
        status: isCorrect ? 'Practicing' : 'Needs Revision',
        accuracyPercent: isCorrect ? 100 : 0,
        questionsAttempted: 1,
        sessionsCount: 1,
        confidenceRating: isCorrect ? 3 : 2,
        averageTimePerQSeconds: timeSpentSeconds,
        lastPracticedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        nextRevisionDate: isCorrect ? 'In 3 days' : 'Immediate Priority',
        commonErrors: isCorrect ? [] : [this.categorizeError(question, chosenAnswer)],
        evidenceText: `Started with 1 question. Result: ${isCorrect ? 'Correct' : 'Incorrect'}.`
      };
      allMasteries.push(topicEntry);
    } else {
      const prevTotal = topicEntry.questionsAttempted;
      const prevCorrect = Math.round((topicEntry.accuracyPercent / 100) * prevTotal);
      const newTotal = prevTotal + 1;
      const newCorrect = isCorrect ? prevCorrect + 1 : prevCorrect;
      const newAccuracy = Math.round((newCorrect / newTotal) * 100);

      topicEntry.questionsAttempted = newTotal;
      topicEntry.accuracyPercent = newAccuracy;
      topicEntry.averageTimePerQSeconds = Math.round((topicEntry.averageTimePerQSeconds * prevTotal + timeSpentSeconds) / newTotal);
      topicEntry.lastPracticedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      // Dynamic Status Transitions
      if (newAccuracy >= 80 && newTotal >= 10) {
        topicEntry.status = 'Mastered';
        topicEntry.nextRevisionDate = 'Weekly Maintenance';
      } else if (newAccuracy < 50) {
        topicEntry.status = 'Needs Revision';
        topicEntry.nextRevisionDate = 'Today (Priority)';
      } else {
        topicEntry.status = 'Practicing';
        topicEntry.nextRevisionDate = 'In 2 days';
      }

      topicEntry.evidenceText = `Logged ${newTotal} attempts (${newAccuracy}% overall accuracy). Last response took ${timeSpentSeconds}s.`;
    }
    StorageService.saveTopicMastery(allMasteries);

    // 3. If Incorrect: Analyze and categorize mistake, update Mistake Notebook
    let newlyFormedHypothesis: AIMemoryItem | undefined = undefined;

    if (!isCorrect) {
      const category = this.categorizeError(question, chosenAnswer);
      const allMistakes = StorageService.getMistakes();
      let existingMistake = allMistakes.find(m => m.questionId === question.id || (m.topic === question.topic && m.mistakeCategory === category));

      if (existingMistake) {
        existingMistake.repeatedCount += 1;
        existingMistake.lastTestedDate = new Date().toISOString().split('T')[0];
        existingMistake.resolved = false;
        existingMistake.selectedAnswer = chosenAnswer;
      } else {
        existingMistake = {
          id: `mst-${Date.now()}`,
          questionId: question.id,
          subject: question.subject,
          topic: question.topic,
          subtopic: question.subtopic,
          mistakeCategory: category,
          questionExcerpt: question.questionText.slice(0, 120),
          selectedAnswer: chosenAnswer,
          correctAnswer: question.correctAnswer,
          misunderstandingIdentified: `Chose (${chosenAnswer}) over (${question.correctAnswer}). Misunderstood constraint or formula inversion.`,
          correctReasoningFormula: question.conceptFormula || question.explanation.slice(0, 140),
          repeatedCount: 1,
          firstFailedDate: new Date().toISOString().split('T')[0],
          lastTestedDate: new Date().toISOString().split('T')[0],
          resolved: false,
          parallelQuestion: this.generateParallelQuestion(question)
        };
        allMistakes.unshift(existingMistake);
      }
      StorageService.saveMistakes(allMistakes);

      // 4. Form an AI Hypothesis if recurring
      if (existingMistake.repeatedCount >= 2) {
        const allMemories = StorageService.getAIMemories();
        const existingHypo = allMemories.find(m => m.title.includes(question.topic) && m.type === 'ai_hypothesis');

        if (!existingHypo) {
          newlyFormedHypothesis = {
            id: `hyp-${Date.now()}`,
            type: 'ai_hypothesis',
            category: 'Mistake Pattern',
            title: `Hypothesis: Recurring ${category} in ${question.topic}`,
            statement: `Sanskriti has made ${existingMistake.repeatedCount} repeated errors in ${question.topic}. She appears to confuse the base denominator with the initial value.`,
            evidenceSource: `Mistake log #${existingMistake.id} with ${existingMistake.repeatedCount} recorded failures`,
            confidenceScore: 85,
            lastUpdated: "Just now (Formed by Learning Engine)",
            editable: true
          };
          allMemories.unshift(newlyFormedHypothesis);
          StorageService.saveAIMemories(allMemories);
        }
      }
    } else {
      // If solved correctly and it was an unresolved mistake, mark resolved!
      const allMistakes = StorageService.getMistakes();
      const match = allMistakes.find(m => m.questionId === question.id || m.parallelQuestion?.id === question.id);
      if (match && !match.resolved) {
        match.resolved = true;
        StorageService.saveMistakes(allMistakes);
      }
    }

    return {
      isCorrect,
      feedback: isCorrect 
        ? "Excellent concept execution! Your accuracy rating in this topic increased." 
        : `Recorded in your Mistake Notebook. The companion will calibrate this with a parallel drill.`,
      newlyFormedHypothesis
    };
  },

  /**
   * Classify root cause of mistake based on question type and options
   */
  categorizeError(q: Question, chosen: string): MistakeCategory {
    const text = (q.questionText + " " + q.topic).toLowerCase();
    if (text.includes("percent") || text.includes("ratio") || text.includes("discount")) {
      return "Wrong Base Value";
    }
    if (text.includes("circular") || text.includes("facing") || text.includes("direction") || text.includes("row")) {
      return "Direction/Orientation Error";
    }
    if (text.includes("assump") || text.includes("infer") || text.includes("syllog")) {
      return "Conceptual Gap";
    }
    return "Careless Calculation";
  },

  /**
   * Synthesizes dynamic parallel practice questions with fresh values
   */
  generateParallelQuestion(baseQ: Question): Question {
    const randomShift = Math.floor(Math.random() * 3) + 1;
    if (baseQ.topic.includes("Percent")) {
      const increases = [20, 50, 100];
      const inc = increases[randomShift - 1] || 50;
      // inc = 50 -> dec = 50/150 = 33.33%
      // inc = 20 -> dec = 20/120 = 16.67%
      // inc = 100 -> dec = 100/200 = 50%
      const answersMap: Record<number, { dec: string; opts: { A: string; B: string; C: string; D: string; E: string } }> = {
        50: {
          dec: "33.33%",
          opts: { A: "50%", B: "40%", C: "33.33%", D: "25%", E: "20%" }
        },
        20: {
          dec: "16.67%",
          opts: { A: "20%", B: "16.67%", C: "25%", D: "12.5%", E: "15%" }
        },
        100: {
          dec: "50%",
          opts: { A: "100%", B: "75%", C: "50%", D: "33.33%", E: "25%" }
        }
      };

      const selected = answersMap[inc];
      return {
        id: `par-${Date.now()}`,
        subject: "Quantitative Aptitude",
        topic: baseQ.topic,
        subtopic: baseQ.subtopic,
        difficulty: "CET Standard",
        questionText: `If price of a study tablet increased by ${inc}%, by what percentage must the new price now be reduced to return to the original cost?`,
        options: selected.opts,
        correctAnswer: (inc === 50 ? "C" : inc === 20 ? "B" : "C") as any,
        explanation: `Let original price = 100. New price = ${100 + inc}. Required decrease is ${inc} on new base of ${100 + inc}. Reduction = (${inc} / ${100 + inc}) × 100 = ${selected.dec}.`,
        hinglishExplanation: `Shuruat ka price 100 tha, ab ${100 + inc} ho gaya. Ghatana ${inc} hai par naye base (${100 + inc}) pe. Isliye formula: ${inc}/${100 + inc} = ${selected.dec}.`,
        conceptFormula: `Required % Reduction = [x / (100 + x)] × 100`,
        sourceDocTitle: baseQ.sourceDocTitle,
        sourcePage: baseQ.sourcePage
      };
    }

    return {
      ...baseQ,
      id: `par-${Date.now()}`,
      questionText: `[Parallel Concept Variant]: ` + baseQ.questionText
    };
  },

  /**
   * Synthesize real-time recommendation grounded in Sanskriti's actual records
   */
  generateCurrentRecommendation(): LearningAssessment {
    const masteries = StorageService.getTopicMastery();
    const mistakes = StorageService.getMistakes();
    const unresolved = mistakes.filter(m => !m.resolved);

    // Find lowest accuracy topic that has been attempted
    const sorted = [...masteries].sort((a, b) => a.accuracyPercent - b.accuracyPercent);
    const lowest = sorted[0] || masteries[0];

    const isVeryLow = lowest.accuracyPercent < 50;
    const topMistake = unresolved[0];

    return {
      topicAccuracy: lowest.accuracyPercent,
      priorityTopic: lowest.topicName,
      identifiedGap: topMistake ? topMistake.mistakeCategory : "Foundational Speed Practice",
      recommendationText: isVeryLow
        ? `${lowest.topicName} is currently top priority because recorded accuracy is ${lowest.accuracyPercent}% across ${lowest.questionsAttempted} attempts. Focus on ${topMistake ? topMistake.mistakeCategory : 'root principles'} before next sectional mock.`
        : `Your accuracy in ${lowest.topicName} is at ${lowest.accuracyPercent}%. Maintain rhythm with 10 mixed speed drills.`,
      evidenceCitation: lowest.evidenceText,
      unresolvedMistakesCount: unresolved.length
    };
  }
};
