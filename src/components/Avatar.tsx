import { robotFace } from "@/lib/members";
export function Avatar({ handle, size = 48, round = false }: { handle: string; size?: number; round?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${handle} robot portrait`} style={{ borderRadius: round ? "50%" : size * 0.22, background: "#DFD8D0", flex: "none" }}
      dangerouslySetInnerHTML={{ __html: robotFace(handle) }} />
  );
}
