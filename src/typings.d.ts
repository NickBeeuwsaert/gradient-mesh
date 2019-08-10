type Nullable<T> = T extends object
  ? { [K in keyof T]: Nullable<T[K]> | null }
  : T | null;

interface Point {
  x: number;
  y: number;
}
interface PartialPoint {
  x?: number;
  y?: number;
}

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface Stop {
  coord: Point;
  color: Color;
  cp1: Point;
  cp2: Point;
}
interface PartialStop {
  coord: PartialPoint | null;
  color: Color | null;
  cp1: PartialPoint | null;
  cp2: PartialPoint | null;
}
interface Edge {
  start: Point;
  end: Point;
  cp1: Point;
  cp2: Point;
}

interface Patch {
  topLeft: Stop;
  topRight: Stop;
  bottomLeft: Stop;
  bottomRight: Stop;
}

interface PartialPatch {
  topLeft: PartialStop | null;
  topRight: PartialStop | null;
  bottomLeft: PartialStop | null;
  bottomRight: PartialStop | null;
}
