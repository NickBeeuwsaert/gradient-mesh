import { compileShader, linkProgram } from "../shader.js";
import RowElement from "./row.js";
import PatchElement from "./patch.js";
import {
  defaultPatch,
  mergePatches,
  patchBoundingBox,
  tesselate
} from "../patch.js";

function getPatches(row: RowElement, previousRow: Patch[] | null): Patch[] {
  let previousPatch: Patch | null = null;
  let patches = [];
  let i = 0;

  for (const patch of row.children) {
    if (!(patch instanceof PatchElement)) {
      continue;
    }

    const mergedPatch = mergePatches(
      defaultPatch(previousRow === null ? null : previousRow[i], previousPatch),
      patch
    );
    if (
      mergedPatch.topLeft === null ||
      mergedPatch.topRight === null ||
      mergedPatch.bottomLeft === null ||
      mergedPatch.bottomRight === null
    ) {
      throw new Error("Found a patch with missing stop!");
    }
    patches.push((previousPatch = mergedPatch as Patch));

    i += 1;
  }
  return patches;
}

function getAllPatches(mesh: MeshElement) {
  let previousRow: Patch[] | null = null;
  let rows = [];
  for (const row of mesh.children) {
    if (!(row instanceof RowElement)) {
      continue;
    }
    rows.push((previousRow = getPatches(row, previousRow)));
  }
  return rows.flat();
}

export default class MeshElement extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(this.canvas);
  }

  connectedCallback() {
    this.render();
  }

  get width() {
    const width = this.getAttribute("width");
    if (width === null) {
      return 512;
    }
    return parseInt(width, 10);
  }
  get height() {
    const height = this.getAttribute("height");
    if (height === null) {
      return 512;
    }
    return parseInt(height, 10);
  }

  get canvas() {
    const canvas = document.createElement("canvas");

    Object.defineProperty(this, "canvas", { value: canvas });
    return canvas;
  }

  get context() {
    const context = this.canvas.getContext("webgl");

    if (context === null) {
      throw new Error("Unable to get webgl context");
    }

    Object.defineProperty(this, "context", { value: context });

    return context;
  }

  get horizontalResolution() {
    const horizontalResolution = this.getAttribute("horizontal-resolution");
    if (horizontalResolution === null) {
      return 10;
    }
    return parseInt(horizontalResolution, 10);
  }
  get verticalResolution() {
    const verticalResolution = this.getAttribute("vertical-resolution");
    if (verticalResolution === null) {
      return 10;
    }
    return parseInt(verticalResolution, 10);
  }

  get vertexShader() {
    const shader = compileShader(
      this.context,
      this.context.VERTEX_SHADER,
      `
        uniform vec4 uBBox;
        attribute vec2 aVertex;
        attribute vec4 aColor;

        varying vec4 vColor;

        void main(void) {
            vColor = aColor;

            float left = uBBox.x;
            float top = uBBox.y;
            float right = uBBox.z;
            float bottom = uBBox.w;
            float width = right - left;
            float height = bottom - top;

            mat4 transform = mat4(
              vec4(2.0/width, 0, 0, 0),
              vec4(0, 2.0/height, 0, 0),
              vec4(0, 0, 1, 0),
              vec4(-1.0 + (2.0 * left) / width, 1.0 + (2.0 * top) / height, 0, 1)
            );

            gl_Position = transform * vec4(aVertex.x, -aVertex.y, 0.0, 1.0);
        }
    `
    );

    Object.defineProperty(this, "vertexShader", { value: shader });
    return shader;
  }

  get fragmentShader() {
    const shader = compileShader(
      this.context,
      this.context.FRAGMENT_SHADER,
      `
        precision highp float;
        varying vec4 vColor;
    
        void main() {
            gl_FragColor = vColor;
        }
    `
    );

    Object.defineProperty(this, "fragmentShader", { value: shader });
    return shader;
  }

  get program() {
    const program = linkProgram(
      this.context,
      this.vertexShader,
      this.fragmentShader
    );

    Object.defineProperty(this, "program", { value: program });
    return program;
  }

  render() {
    const { canvas, context: gl } = this;
    canvas.width = this.width;
    canvas.height = this.height;

    gl.viewport(0, 0, this.width, this.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vertexAttribute = gl.getAttribLocation(this.program, "aVertex");
    const colorAttribute = gl.getAttribLocation(this.program, "aColor");
    const bboxUniform = gl.getUniformLocation(this.program, "uBBox");

    const dataBuffer = gl.createBuffer();
    const indiceBuffer = gl.createBuffer();
    const patches = getAllPatches(this);

    const boundBox = patches
      .map(patchBoundingBox)
      .reduce(({ top, left, right, bottom }, bbox) => ({
        top: Math.min(top, bbox.top),
        left: Math.min(left, bbox.left),
        right: Math.max(right, bbox.right),
        bottom: Math.max(bottom, bbox.bottom)
      }));

    gl.useProgram(this.program);

    gl.enableVertexAttribArray(vertexAttribute);
    gl.enableVertexAttribArray(colorAttribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);

    gl.vertexAttribPointer(vertexAttribute, 4, gl.FLOAT, false, 4 * 6, 0);
    gl.vertexAttribPointer(colorAttribute, 4, gl.FLOAT, false, 4 * 6, 2 * 4);
    gl.uniform4f(
      bboxUniform,
      boundBox.left,
      boundBox.top,
      boundBox.right,
      boundBox.bottom
    );

    for (const patch of patches) {
      const { data, indices } = tesselate(
        patch,
        this.horizontalResolution,
        this.verticalResolution
      );
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indiceBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STREAM_DRAW);

      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }

    gl.disableVertexAttribArray(colorAttribute);
    gl.disableVertexAttribArray(vertexAttribute);
  }
}
