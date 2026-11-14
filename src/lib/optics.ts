export const N = 6;
export type M = 0 | 1 | 2; // 0 empty, 1 "/", 2 "\\"
export function trace(grid: M[][], row: number) {
  const cells: [number, number][] = []; let y = row, x = 0, dy = 0, dx = 1;
  for (let i = 0; i < 200 && y >= 0 && x >= 0 && y < N && x < N; i++) {
    cells.push([y, x]);
    const m = grid[y][x];
    if (m === 1) [dy, dx] = [-dx, -dy]; else if (m === 2) [dy, dx] = [dx, dy];
    y += dy; x += dx;
  }
  return cells;
}
