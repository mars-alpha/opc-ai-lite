"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type {
  LearningStorageMode,
  ProgressMap,
  LessonProgressStatus,
  LessonStatusMap,
  LessonStepMap
} from "../lib/learning/contracts";
import {
  defaultProgressAdapter,
  type LessonCompletionResult,
  type ProgressAdapter
} from "../lib/learning/progress-adapter";

type Value = {
  ready: boolean;
  authenticated: boolean;
  completed: ProgressMap;
  statusByCourse: LessonStatusMap;
  enrolledCourses: string[];
  storageMode: LearningStorageMode | null;
  warning: string | null;
  isEnrolled: (course: string) => boolean;
  enrollCourse: (course: string) => Promise<void>;
  isCompleted: (course: string, lesson: string) => boolean;
  getCompletionResult: (course: string, lesson: string) => LessonCompletionResult | null;
  toggleLesson: (course: string, lesson: string) => Promise<LessonCompletionResult>;
  completedCount: (course: string) => number;
  getStatus: (course: string, lesson: string) => LessonProgressStatus;
  getCurrentStep: (course: string, lesson: string) => number | null;
  markCurrentStep: (course: string, lesson: string, currentStep: number) => void;
  markLessonStatus: (course: string, lesson: string, status: LessonProgressStatus) => void;
  refresh: () => Promise<void>;
};

const Context = createContext<Value | null>(null);

export function ProgressProvider({
  children,
  adapter = defaultProgressAdapter
}: PropsWithChildren<{ adapter?: ProgressAdapter }>) {
  const [authenticated, setAuthenticated] = useState(false);
  const [completed, setCompleted] = useState<ProgressMap>({});
  const [statusByCourse, setStatusByCourse] = useState<LessonStatusMap>({});
  const [currentStepByCourse, setCurrentStepByCourse] = useState<LessonStepMap>({});
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [completionResults, setCompletionResults] = useState<Record<string, LessonCompletionResult>>({});
  const [storageMode, setStorageMode] = useState<LearningStorageMode | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const refreshInFlightRef = useRef<Promise<void> | null>(null);

  const refresh = useCallback(() => {
    if (refreshInFlightRef.current) return refreshInFlightRef.current;

    const request = (async () => {
      try {
        const snapshot = await adapter.load();
        setAuthenticated(snapshot.authenticated);
        setCompleted(snapshot.completed);
        setStatusByCourse(snapshot.statusByCourse);
        setCurrentStepByCourse(snapshot.currentStepByCourse);
        setEnrolledCourses(snapshot.enrolledCourses);
        setStorageMode(snapshot.storageMode);
        setWarning(snapshot.warning ?? null);
      } catch (error) {
        console.error("[OPC AI] Unable to load learning state.", error);
        setWarning("学习状态读取失败，请稍后重试。");
      } finally {
        setReady(true);
        refreshInFlightRef.current = null;
      }
    })();

    refreshInFlightRef.current = request;
    return request;
  }, [adapter]);

  useEffect(() => {
    void refresh();
    const refreshOnReturn = () => void refresh();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshOnReturn();
    };
    window.addEventListener("pageshow", refreshOnReturn);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("pageshow", refreshOnReturn);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh]);

  const markCurrentStep = useCallback(
    (course: string, lesson: string, currentStep: number) => {
      setCurrentStepByCourse((current) => ({
        ...current,
        [course]: { ...(current[course] || {}), [lesson]: currentStep }
      }));
    },
    []
  );

    const markLessonStatus = useCallback(
    (course: string, lesson: string, status: LessonProgressStatus) => {
      setStatusByCourse((current) => ({
        ...current,
        [course]: { ...(current[course] || {}), [lesson]: status }
      }));
      setCompleted((current) => {
        const next = new Set(current[course] || []);
        status === "COMPLETED" ? next.add(lesson) : next.delete(lesson);
        return { ...current, [course]: Array.from(next) };
      });
    },
    []
  );


  const enrollCourse = useCallback(
    async (course: string) => {
      if (enrolledCourses.includes(course)) return;
      await adapter.enroll(course);
      setEnrolledCourses((current) =>
        current.includes(course) ? current : [...current, course]
      );
    },
    [adapter, enrolledCourses]
  );

  const toggleLesson = useCallback(
    async (course: string, lesson: string) => {
      const currentlyCompleted = (completed[course] || []).includes(lesson);
      const nextCompleted = !currentlyCompleted;

      const result = await adapter.setLessonCompleted(course, lesson, nextCompleted);
      setCompletionResults((current) => ({
        ...current,
        [course + "::" + lesson]: result
      }));

      if (result.completed && !enrolledCourses.includes(course)) {
        setEnrolledCourses((current) =>
          current.includes(course) ? current : [...current, course]
        );
      }

      markLessonStatus(course, lesson, result.completed ? "COMPLETED" : "IN_PROGRESS");
      return result;
    },
    [adapter, completed, enrolledCourses, markLessonStatus]
  );

  const value = useMemo<Value>(
    () => ({
      ready,
      authenticated,
      completed,
      statusByCourse,
      currentStepByCourse,
      enrolledCourses,
      storageMode,
      warning,
      isEnrolled: (course) => enrolledCourses.includes(course),
      enrollCourse,
      isCompleted: (course, lesson) => (completed[course] || []).includes(lesson),
      getCompletionResult: (course, lesson) =>
        completionResults[course + "::" + lesson] ?? null,
      toggleLesson,
      completedCount: (course) => (completed[course] || []).length,
      getStatus: (course, lesson) => statusByCourse[course]?.[lesson] ?? "NOT_STARTED",
      getCurrentStep: (course, lesson) => currentStepByCourse[course]?.[lesson] ?? null,
      markCurrentStep,
      markLessonStatus,
      refresh
    }),
    [
      authenticated,
      completed,
      statusByCourse,
      currentStepByCourse,
      completionResults,
      enrollCourse,
      enrolledCourses,
      markCurrentStep,
      markLessonStatus,
      ready,
      refresh,
      storageMode,
      toggleLesson,
      warning
    ]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useProgress() {
  const value = useContext(Context);
  if (!value) throw new Error("ProgressProvider missing");
  return value;
}

