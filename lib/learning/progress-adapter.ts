import type { LearningSnapshot, LearningStateResponse } from "./contracts";

export class AuthRequiredError extends Error {
  constructor() {
    super("AUTH_REQUIRED");
    this.name = "AuthRequiredError";
  }
}

export interface ProgressAdapter {
  load(): Promise<LearningSnapshot>;
  enroll(courseSlug: string): Promise<void>;
  setLessonCompleted(courseSlug: string, lessonSlug: string, completed: boolean): Promise<void>;
}

const STORAGE_KEY = "opc-ai-course-progress-v1";
const ENROLLMENT_KEY = "opc-ai-course-enrollments-v1";

function emptyLocalSnapshot(): LearningSnapshot {
  return {
    authenticated: false,
    enrolledCourses: [],
    completed: {},
    storageMode: "local"
  };
}

export const localProgressAdapter: ProgressAdapter = {
  async load() {
    if (typeof window === "undefined") return emptyLocalSnapshot();

    try {
      const rawProgress = window.localStorage.getItem(STORAGE_KEY);
      const parsedProgress = rawProgress ? JSON.parse(rawProgress) : {};
      const completed =
        parsedProgress && typeof parsedProgress === "object" && !Array.isArray(parsedProgress)
          ? parsedProgress
          : {};

      const rawEnrollments = window.localStorage.getItem(ENROLLMENT_KEY);
      const parsedEnrollments = rawEnrollments ? JSON.parse(rawEnrollments) : [];
      const explicitEnrollments = Array.isArray(parsedEnrollments)
        ? parsedEnrollments.filter((item): item is string => typeof item === "string")
        : [];

      const inferred = Object.keys(completed).filter((courseSlug) => completed[courseSlug]?.length > 0);
      const enrolledCourses = Array.from(new Set([...explicitEnrollments, ...inferred]));

      return {
        authenticated: false,
        enrolledCourses,
        completed,
        storageMode: "local"
      };
    } catch {
      return emptyLocalSnapshot();
    }
  },

  async enroll(courseSlug) {
    if (typeof window === "undefined") return;
    const snapshot = await this.load();
    const enrolledCourses = Array.from(new Set([...snapshot.enrolledCourses, courseSlug]));
    window.localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(enrolledCourses));
  },

  async setLessonCompleted(courseSlug, lessonSlug, completedValue) {
    if (typeof window === "undefined") return;
    const snapshot = await this.load();
    const next = new Set(snapshot.completed[courseSlug] || []);
    completedValue ? next.add(lessonSlug) : next.delete(lessonSlug);
    const completed = { ...snapshot.completed, [courseSlug]: Array.from(next) };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }
};

async function requireApiOk(response: Response, message: string) {
  if (response.status === 401) throw new AuthRequiredError();
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `${message} (${response.status})`);
  }
}

const apiProgressAdapter: ProgressAdapter = {
  async load() {
    const response = await fetch("/api/learning/state", { cache: "no-store" });
    if (response.status === 401) {
      return {
        authenticated: false,
        enrolledCourses: [],
        completed: {},
        storageMode: "api"
      };
    }
    await requireApiOk(response, "Learning API unavailable");
    const data = (await response.json()) as LearningStateResponse;
    return { authenticated: true, ...data, storageMode: "api" };
  },

  async enroll(courseSlug) {
    const response = await fetch("/api/learning/enroll", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ courseSlug })
    });
    await requireApiOk(response, "Enrollment API failed");
  },

  async setLessonCompleted(courseSlug, lessonSlug, completed) {
    const response = await fetch("/api/learning/progress", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ courseSlug, lessonSlug, completed })
    });
    await requireApiOk(response, "Progress API failed");
  }
};

export function createHybridProgressAdapter(): ProgressAdapter {
  let active: ProgressAdapter = apiProgressAdapter;
  let usingLocalFallback = false;

  return {
    async load() {
      try {
        const snapshot = await apiProgressAdapter.load();
        active = apiProgressAdapter;
        usingLocalFallback = false;
        return snapshot;
      } catch (error) {
        console.warn("[OPC AI] Learning API unavailable; using local progress fallback.", error);
        active = localProgressAdapter;
        usingLocalFallback = true;
        const local = await localProgressAdapter.load();
        return {
          ...local,
          warning: "当前为本机体验模式，学习记录仅保存在这个浏览器。"
        };
      }
    },

    async enroll(courseSlug) {
      await active.enroll(courseSlug);
      if (usingLocalFallback) {
        console.info("[OPC AI] Enrollment saved locally because Learning API is unavailable.");
      }
    },

    async setLessonCompleted(courseSlug, lessonSlug, completed) {
      await active.setLessonCompleted(courseSlug, lessonSlug, completed);
      if (usingLocalFallback) {
        console.info("[OPC AI] Lesson progress saved locally because Learning API is unavailable.");
      }
    }
  };
}

export const defaultProgressAdapter = createHybridProgressAdapter();

