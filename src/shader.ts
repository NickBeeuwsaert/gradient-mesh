export interface someInterface {
  a: string;
}
export const compileShader = (
  gl: WebGLRenderingContext,
  type:
    | WebGLRenderingContext["VERTEX_SHADER"]
    | WebGLRenderingContext["FRAGMENT_SHADER"],
  source: string
) => {
  const shader = gl.createShader(type);

  if (shader === null) {
    throw new Error("Error creating shader");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
    const infoLog = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    if (infoLog === null) {
      throw new Error("Unable to compile shader");
    }
    throw new Error(infoLog);
  }

  return shader;
};

export const linkProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) => {
  const program = gl.createProgram();

  if (program === null) {
    throw new Error("Failed to create program");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  if (gl.getProgramParameter(program, gl.LINK_STATUS) == false) {
    const infoLog = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    if (infoLog === null) {
      throw new Error("Unable to link program");
    }
    throw new Error(infoLog);
  }

  return program;
};
