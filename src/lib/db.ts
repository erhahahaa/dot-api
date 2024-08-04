import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { clubs, clubsRelations } from "~/schemas/clubs";
import { exams, examsRelations } from "~/schemas/clubs/exam";
import {
  examEvaluations,
  examEvaluationsRelations,
} from "~/schemas/clubs/exam/evaluation";
import {
  examQuestions,
  examQuestionsRelations,
} from "~/schemas/clubs/exam/question";
import { programs, programsRelations } from "~/schemas/clubs/programs";
import {
  programExercises,
  programExercisesRelations,
} from "~/schemas/clubs/programs/exercise";
import { tacticalRelations, tacticals } from "~/schemas/clubs/tacticals";
import { medias, mediasRelations } from "~/schemas/media";
import { users, usersRelations } from "~/schemas/users";
import { usersToClubs, usersToClubsRelations } from "~/schemas/users/relations";

config();

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, {
  // logger: true,
  schema: {
    // MEDIA
    medias,
    mediasRelations,

    // USER
    users,
    usersRelations,
    // CLUB
    clubs,
    clubsRelations,
    // USER TO CLUB RELATION
    usersToClubs,
    usersToClubsRelations,

    // PROGRAM
    programs,
    programsRelations,
    // PROGRAM EXERCISE
    programExercises,
    programExercisesRelations,

    // EXAM
    exams,
    examsRelations,
    // EXAM QUESTION
    examQuestions,
    examQuestionsRelations,
    // EXAM EVALUATION
    examEvaluations,
    examEvaluationsRelations,

    // TACTICAL
    tacticals,
    tacticalRelations,
  },
});
