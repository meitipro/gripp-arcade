export interface GameProps {
  seed: number;                 // from the server, identical for a replay
  mode: "ranked" | "practice";  // practice never touches boards
  locale: "en" | "fa";
  reducedMotion: boolean;
  onReady(): void;
  onProgress?(score: number): void;
  onFinish(result: { score: number; log: unknown[] }): void;
}
export type Game = (props: GameProps) => React.JSX.Element;
