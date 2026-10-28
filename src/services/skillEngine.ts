// In-App Agent Skill & Intelligence Engine
// Integrates:
// 1. quiz-maker: Question architecture, plausible distractors, instant grading with explanations
// 2. quiz-and-assessment-design: Actionable diagnostic segmentation (speed slip vs conceptual gap)
// 3. research: Systematic syllabus & web discovery, concept synthesis
// 4. tutor: Concept-level tracking, Socratic dialogue, Hinglish intuition anchors

import { Question } from '../types';
import { MhtCetKnowledgeEngine, SyllabusTopicDetail } from '../data/mhtCetSyllabusKnowledge';

export interface AppSkillMetadata {
  id: string;
  name: string;
  category: string;
  installs: string;
  description: string;
  activeStatus: 'Active' | 'Ready' | 'Loaded';
  source: string;
}

export const INSTALLED_APP_SKILLS: AppSkillMetadata[] = [
  {
    id: 'quiz-maker',
    name: 'Quiz Maker',
    category: 'Assessment Design',
    installs: '10.4K+',
    description: 'Auto-generates 5-choice CET multiple-choice questions with plausible distractors, latency targets, and instant Hinglish explanations.',
    activeStatus: 'Active',
    source: 'onewave-ai/claude-skills@quiz-maker'
  },
  {
    id: 'quiz-and-assessment-design',
    name: 'Quiz & Assessment Design',
    category: 'Growth & Diagnostics',
    installs: '15.2K+',
    description: 'Actionable diagnostic segmentation. Distinguishes careless speed slips (<25s) from fundamental conceptual gaps and maps targeted revision.',
    activeStatus: 'Active',
    source: 'rampstackco/claude-skills@quiz-and-assessment-design'
  },
  {
    id: 'research',
    name: 'Research Protocol Engine',
    category: 'Knowledge Discovery',
    installs: '727K+',
    description: 'Systematic syllabus & web discovery, college cutoff benchmarking (JBIMS/SIMSREE), and topic weightage indexing.',
    activeStatus: 'Active',
    source: 'mattpocock/skills@research'
  },
  {
    id: 'tutor',
    name: 'Metacognitive Socratic Tutor',
    category: 'Pedagogy & Memory',
    installs: '2.4K+',
    description: 'Concept-level mastery tracking, blind spot discovery, and warm Hinglish memory anchors tailored for Sanskriti.',
    activeStatus: 'Active',
    source: 'bevibing/tutor-skills@tutor'
  }
];

export const SkillEngine = {
  getInstalledSkills(): AppSkillMetadata[] {
    return INSTALLED_APP_SKILLS;
  },

  /**
   * Skill 1: quiz-maker
   * Formulate plausible distractors and valid questions based on target syllabus topic
   */
  generateCalibratedQuiz(topic: SyllabusTopicDetail, count: number = 3): Question[] {
    const questions: Question[] = [];
    const timestamp = Date.now();

    // Question 1: Core Concept Application
    questions.push({
      id: `sm-qm-${topic.id}-${timestamp}-1`,
      subject: topic.section as any,
      topic: topic.name,
      subtopic: topic.subtopics[0] || topic.name,
      difficulty: 'CET Standard',
      questionText: `In ${topic.name}, what is the critical rule to solve questions under the 45-second CET benchmark?`,
      options: {
        A: topic.coreFormulas[0] || 'Apply the fundamental shortcut formula',
        B: 'Solve by full algebraic expansion without eliminating options',
        C: 'Guess the middle option without verifying the denominator shift',
        D: 'Calculate exact decimals to 4 places instead of using round numbers',
        E: 'None of the above / Contextual variation'
      },
      correctAnswer: 'A',
      explanation: `Correct: ${topic.coreFormulas[0]}. This formula bypasses redundant algebraic steps and secures the answer in under 35 seconds.`,
      hinglishExplanation: topic.hinglishIntuition,
      conceptFormula: topic.coreFormulas[0],
      sourceDocTitle: `MAH-CET Official Study Blueprint (${topic.section})`
    });

    // Question 2: Examiner Trap & Distractor Identification
    if (topic.examinerTraps.length > 0) {
      questions.push({
        id: `sm-qm-${topic.id}-${timestamp}-2`,
        subject: topic.section as any,
        topic: topic.name,
        subtopic: topic.subtopics[1] || topic.name,
        difficulty: 'CET Standard',
        questionText: `Which common trap is deliberately planted by CET paper setters in ${topic.name}?`,
        options: {
          A: 'Using standard Vedic speed math shortcuts',
          B: topic.examinerTraps[0],
          C: 'Allowing negative marking on difficult questions',
          D: 'Adding sectional time limits to confuse pacing',
          E: 'All questions have symmetrical answers'
        },
        correctAnswer: 'B',
        explanation: `Examiner Trap: ${topic.examinerTraps[0]}. Avoiding this trap protects your CET score.`,
        hinglishExplanation: 'CET examiners jaante hain ki rush me student jaldi se wrong option choose karega. Pehle trap ko identify karo.',
        conceptFormula: 'Plausible Distractor Elimination Principle',
        sourceDocTitle: `MAH-CET Official Study Blueprint (${topic.section})`
      });
    }

    return questions;
  },

  /**
   * Skill 2: quiz-and-assessment-design
   * Diagnose whether a student error is a Careless Speed Rush or a Conceptual Gap
   */
  diagnoseAttempt(isCorrect: boolean, timeSpentSeconds: number, targetSpeedSeconds: number): {
    category: 'Mastery' | 'Careless Slip (Speed Rush)' | 'Conceptual Gap' | 'Optimal Pace';
    recommendation: string;
    hinglishNote: string;
  } {
    if (isCorrect) {
      if (timeSpentSeconds <= targetSpeedSeconds) {
        return {
          category: 'Mastery',
          recommendation: 'Optimal execution. Target speed met with full accuracy.',
          hinglishNote: 'Badhiya! Speed bhi sahi hai aur answer bhi correct hai.'
        };
      }
      return {
        category: 'Optimal Pace',
        recommendation: 'Accurate but slightly slow. Practice shortcut formulas to save 10 seconds.',
        hinglishNote: 'Answer sahi hai par thoda time zyada lag gaya. Formula yaad karo taaki 30 sec me ho jaye.'
      };
    }

    // If Incorrect:
    if (timeSpentSeconds < 25) {
      return {
        category: 'Careless Slip (Speed Rush)',
        recommendation: 'Careless rush error. Read all 5 options before confirming your answer.',
        hinglishNote: 'Jaldi-baazi me trap option choose ho gaya! 10 second aur le kar confirm karo.'
      };
    }

    return {
      category: 'Conceptual Gap',
      recommendation: 'Fundamental misunderstanding. Review Chapter Study Notes and Hinglish memory hook.',
      hinglishNote: 'Concept thoda hila hua hai. Pehle study notes me formula aur example dekh lo phir dubara attempt karo.'
    };
  },

  /**
   * Skill 3: research
   * Query syllabus knowledge base for CET facts, college cutoffs, and remaining topics
   */
  researchSyllabus(query: string) {
    return MhtCetKnowledgeEngine.searchKnowledge(query);
  },

  /**
   * Skill 4: tutor
   * Socratic response generation with warm encouraging tone for Sanskriti
   */
  generateTutorResponse(query: string, language: 'English' | 'Hinglish') {
    const research = this.researchSyllabus(query);
    if (language === 'Hinglish' && research.hinglish) {
      return `${research.hinglish}\n\n${research.answer}`;
    }
    return research.answer;
  }
};
