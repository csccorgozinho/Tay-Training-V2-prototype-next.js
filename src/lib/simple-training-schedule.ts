import prisma from "@/lib/prisma";

/**
 * Simple utility for training schedule operations
 * Does ONE thing: fetches and manages training schedules
 */

export interface SimpleTrainingSheet {
  id: number;
  name: string;
  publicName: string | null;
}

export interface ScheduleDay {
  day: number; // 1-7 for a week
  trainingSheetId: number | null;
  customName?: string; // Local display name only
}

export interface TrainingSchedule {
  id: number;
  name: string;
  description: string;
  pdfFile?: File;
  weekDays: ScheduleDay[]; // Days 1-7 for a week
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Fetch all available training sheets for selection
 */
export async function fetchAvailableWorkoutSheets(): Promise<
  SimpleTrainingSheet[]
> {
  try {
    const sheets = await prisma.trainingSheet.findMany({
      select: {
        id: true,
        name: true,
        publicName: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sheets;
  } catch (error) {
    console.error("Error fetching workout sheets:", error);
    throw new Error("Failed to fetch available workout sheets");
  }
}

/**
 * Get full details of a specific training sheet (with all exercises)
 */
export async function getTrainingSheetDetails(sheetId: number) {
  try {
    const sheet = await prisma.trainingSheet.findUnique({
      where: { id: sheetId },
      include: {
        trainingDays: {
          include: {
            exerciseGroup: {
              include: {
                exerciseMethods: {
                  include: {
                    exerciseConfigurations: {
                      include: {
                        exercise: true,
                        method: true,
                      },
                    },
                  },
                  orderBy: {
                    order: "asc",
                  },
                },
              },
            },
          },
        },
      },
    });

    return sheet;
  } catch (error) {
    console.error("Error fetching sheet details:", error);
    throw new Error("Failed to fetch training sheet details");
  }
}

/**
 * Save a training schedule (week plan with assigned workouts)
 */
export async function saveTrainingSchedule(data: {
  name: string;
  description: string;
  weekDays: ScheduleDay[];
}) {
  try {
    // For now, just return the data as it would be saved
    // In a real implementation, this would save to a TrainingSchedule model
    return {
      id: Date.now(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error saving training schedule:", error);
    throw new Error("Failed to save training schedule");
  }
}
