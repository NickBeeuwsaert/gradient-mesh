const flip = (point: Point, around: Point) => ({
  x: around.x + around.x - point.x,
  y: around.y + around.y - point.y
});

const swapControlPoints = (stop: Stop) => ({
  ...stop,
  cp1: stop.cp2,
  cp2: stop.cp1
});

const flipSecondControlPoint = (stop: Stop) => ({
  ...stop,
  cp2: flip(stop.cp2, stop.coord)
});

const flipFirstControlPoint = (stop: Stop) => ({
  ...stop,
  cp1: flip(stop.cp1, stop.coord)
});

const mergeStop = (defaults: PartialStop | null, stop: PartialStop | null) => {
  if (defaults === null) return stop;
  if (stop === null) return defaults;
  return {
    coord: { ...defaults.coord, ...stop.coord },
    cp1: { ...defaults.cp1, ...stop.cp1 },
    cp2: { ...defaults.cp2, ...stop.cp2 },
    color: stop.color || defaults.color
  };
};

export const mergePatches = (defaults: PartialPatch, patch: PartialPatch) => ({
  topLeft: mergeStop(defaults.topLeft, patch.topLeft),
  topRight: mergeStop(defaults.topRight, patch.topRight),
  bottomLeft: mergeStop(defaults.bottomLeft, patch.bottomLeft),
  bottomRight: mergeStop(defaults.bottomRight, patch.bottomRight)
});

export const defaultPatch = (
  topPatch: Patch | null,
  previousPatch: Patch | null
): PartialPatch => {
  const topDefault = topPatch && {
    topLeft: swapControlPoints(flipSecondControlPoint(topPatch.bottomLeft)),
    topRight: swapControlPoints(flipFirstControlPoint(topPatch.bottomRight))
  };
  const previousDefault = previousPatch && {
    topLeft: swapControlPoints(flipFirstControlPoint(previousPatch.topRight)),
    bottomLeft: swapControlPoints(
      flipSecondControlPoint(previousPatch.bottomRight)
    )
  };

  return {
    topLeft: null,
    topRight: null,
    bottomLeft: null,
    bottomRight: null,
    ...topDefault,
    ...previousDefault
  };
};

export const patchBoundingBox = (patch: Patch) => {
  const coords = [
    patch.topLeft.coord,
    patch.topRight.coord,
    patch.bottomLeft.coord,
    patch.bottomRight.coord
  ];
  const top = Math.min(...coords.map(c => c.y));
  const left = Math.min(...coords.map(c => c.x));
  const right = Math.max(...coords.map(c => c.y));
  const bottom = Math.max(...coords.map(c => c.x));
  return {
    left,
    right,
    top,
    bottom
  };
};
const cubic = (cp0: number, cp1: number, cp2: number, cp3: number, t: number) =>
  (1 - t) ** 3 * cp0 +
  3 * (1 - t) ** 2 * t * cp1 +
  3 * (1 - t) * t * t * cp2 +
  t ** 3 * cp3;

const lerp = (s: number, e: number, t: number) => s + (e - s) * t;
export const tesselate = (
  { topLeft, topRight, bottomLeft, bottomRight }: Patch,
  w = 10,
  h = 10
) => {
  const top = {
    start: topLeft.coord,
    cp1: topLeft.cp2,
    cp2: topRight.cp1,
    end: topRight.coord
  };
  const right = {
    start: topRight.coord,
    cp1: topRight.cp2,
    cp2: bottomRight.cp1,
    end: bottomRight.coord
  };
  const bottom = {
    start: bottomLeft.coord,
    cp1: bottomLeft.cp1,
    cp2: bottomRight.cp2,
    end: bottomRight.coord
  };
  const left = {
    start: topLeft.coord,
    cp1: topLeft.cp1,
    cp2: bottomLeft.cp2,
    end: bottomLeft.coord
  };

  const curve = (edge: Edge, startColor: Color, stopColor: Color) => (
    t: number
  ) => ({
    x: cubic(edge.start.x, edge.cp1.x, edge.cp2.x, edge.end.x, t),
    y: cubic(edge.start.y, edge.cp1.y, edge.cp2.y, edge.end.y, t),
    r: lerp(startColor.r, stopColor.r, t),
    g: lerp(startColor.g, stopColor.g, t),
    b: lerp(startColor.b, stopColor.b, t),
    a: lerp(startColor.a, stopColor.a, t)
  });
  const c0 = curve(top, topLeft.color, topRight.color);
  const c1 = curve(bottom, bottomLeft.color, bottomRight.color);
  const d0 = curve(left, topLeft.color, bottomLeft.color);
  const d1 = curve(right, topRight.color, bottomRight.color);
  const channels = ["x", "y", "r", "g", "b", "a"] as [
    "x",
    "y",
    "r",
    "g",
    "b",
    "a"
  ];
  // see https://en.wikipedia.org/wiki/Coons_patch#Bilinear_blending
  const Lc = (s: number, t: number) => {
    const [x, y, r, g, b, a] = channels.map(
      a => (1 - t) * c0(s)[a] + t * c1(s)[a]
    );
    return { x, y, r, g, b, a };
  };

  const Ld = (s: number, t: number) => {
    const [x, y, r, g, b, a] = channels.map(
      a => (1 - s) * d0(t)[a] + s * d1(t)[a]
    );

    return { x, y, r, g, b, a };
  };

  const B = (s: number, t: number) => {
    const [x, y, r, g, b, a] = channels.map(
      a =>
        c0(0)[a] * (1 - s) * (1 - t) +
        c0(1)[a] * s * (1 - t) +
        c1(0)[a] * (1 - s) * t +
        c1(1)[a] * s * t
    );
    return { x, y, r, g, b, a };
  };
  const C = (s: number, t: number) => {
    const [x, y, r, g, b, a] = channels.map(
      a => Lc(s, t)[a] + Ld(s, t)[a] - B(s, t)[a]
    );
    return { x, y, r, g, b, a };
  };

  const data = Array.from({ length: w * h }, (_, idx) => {
    const x = idx % w;
    const y = Math.floor(idx / w);
    const vert = C(x / (w - 1), y / (h - 1));

    return [
      vert.x,
      vert.y,
      vert.r / 255,
      vert.g / 255,
      vert.b / 255,
      vert.a / 255
    ];
  }).flat();

  const indices = Array.from({ length: (w - 1) * (h - 1) }, (_, idx) => {
    const x = idx % (w - 1);
    const y = Math.floor(idx / (w - 1));
    const o = y * w + x;
    const a = o;
    const b = o + 1;
    const c = o + w;
    const d = o + w + 1;

    return [a, b, c, c, d, b];
  }).flat();

  return {
    data: new Float32Array(data),
    indices: new Uint16Array(indices)
  };
};
