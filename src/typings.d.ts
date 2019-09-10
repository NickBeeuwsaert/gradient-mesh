type Nullable<T> = T | null;

interface Point {
  x: number;
  y: number;
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
  coord: Nullable<Partial<Point>>;
  color: Nullable<Color>;
  cp1: Nullable<Partial<Point>>;
  cp2: Nullable<Partial<Point>>;
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
  topLeft: Nullable<PartialStop>;
  topRight: Nullable<PartialStop>;
  bottomLeft: Nullable<PartialStop>;
  bottomRight: Nullable<PartialStop>;
}
