"use client";
import { PropsWithChildren } from "react";
import { ProgressProvider } from "../components/ProgressProvider";
export function Providers({children}:PropsWithChildren){ return <ProgressProvider>{children}</ProgressProvider>; }

