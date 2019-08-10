import parseColor from "../parseColor.js";

export default class StopElement extends HTMLElement implements PartialStop {
  get position() {
    return this.getAttribute("position");
  }
  get coord() {
    const x = this.getAttribute("x");
    const y = this.getAttribute("y");
    return {
      ...(x !== null && { x: parseFloat(x) }),
      ...(y !== null && { y: parseFloat(y) })
    };
  }

  get color() {
    const color = this.getAttribute("color");

    if (color === null) {
      return null;
    }
    return parseColor(color);
  }

  get cp1() {
    const cp1x = this.getAttribute("cp1x");
    const cp1y = this.getAttribute("cp1y");

    return {
      ...this.coord,
      ...(cp1x !== null && { x: parseFloat(cp1x) }),
      ...(cp1y !== null && { y: parseFloat(cp1y) })
    };
  }

  get cp2() {
    const cp2x = this.getAttribute("cp2x");
    const cp2y = this.getAttribute("cp2y");

    return {
      ...this.coord,
      ...(cp2x !== null && { x: parseFloat(cp2x) }),
      ...(cp2y !== null && { y: parseFloat(cp2y) })
    };
  }
}
