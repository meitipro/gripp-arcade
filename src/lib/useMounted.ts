"use client";
import { useEffect, useState } from "react";
/** Date-dependent UI renders only after mount so static HTML never disagrees with the visitor's day. */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
