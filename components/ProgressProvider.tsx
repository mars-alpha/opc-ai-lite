"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type {
  LearningStorageMode,
  ProgressMap
} from "../lib/learning/contracts";
import {
  defaultProgressAdapter,
  type ProgressAdapter
} from "../lib/learning/progress-adapter";

type Value = {
  ready: boolean;
  authenticated: boolean;
  completed: ProgressMap;
  enrolledCourses: string[];
  storageMode: LearningStorageMode | null;
  warning: string | null;
  isEnrolled: (course: string) => boolean;
  enrollCourse: (course: string) => Promise<void>;
  isCompleted: (course: string, lesson: string) => boolean;
  toggleLesson: (course: string, lesson: string) => Promise<void>;
  completedCount: (course: string) => number;
};

const Context = createContext<Value | null>(null);

export function ProgressProvider({
  children,
  adapter = defaultProgressAdapter
}: PropsWithChildren<{ adapter?: ProgressAdapter }>) {
  const [authenticated, setAuthenticated] = useState(false);
  const [completed, setCompleted] = useState<ProgressMap>({});
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [storageMode, setStorageMode] = useState<LearningStorageMode | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    adapter
      .load()
      .then((snapshot) => {
        if (!active) return;
        setAuthenticated(snapshot.authenticated);
        setCompleted(snapshot.completed);
        setEnrolledCourses(snapshot.enrolledCourses);
        setStorageMode(snapshot.storageMode);
        setWarning(snapshot.warning ?? null);
      })
      .catch((error) => {
        console.error("[OPC AI] Unable to load learning state.", error);
        if (active) setWarning("学习状态读取失败，请稍后重试。");
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, [adapter]);

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

      if (!enrolledCourses.includes(course)) {
        await adapter.enroll(course);
        setEnrolledCourses((current) =>
          current.includes(course) ? current : [...current, course]
        );
      }

      await adapter.setLessonCompleted(course, lesson, nextCompleted);
      setCompleted((current) => {
        const next = new Set(current[course] || []);
        nextCompleted ? next.add(lesson) : next.delete(lesson);
        return { ...current, [course]: Array.from(next) };
      });
    },
    [adapter, completed, enrolledCourses]
  );

  const value = useMemo<Value>(
    () => ({
      ready,
      authenticated,
      completed,
      enrolledCourses,
      storageMode,
      warning,
      isEnrolled: (course) => enrolledCourses.includes(course),
      enrollCourse,
      isCompleted: (course, lesson) => (completed[course] || []).includes(lesson),
      toggleLesson,
      completedCount: (course) => (completed[course] || []).length
    }),
    [
      authenticated,
      completed,
      enrollCourse,
      enrolledCourses,
      ready,
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

