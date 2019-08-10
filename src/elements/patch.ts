import StopElement from "./stop.js";

export default class PatchElement extends HTMLElement implements PartialPatch {
  _stop(position: keyof Patch) {
    for (const stop of this.children) {
      if (!(stop instanceof StopElement)) continue;
      if (stop.position !== position) continue;
      return {
        coord: stop.coord,
        cp1: stop.cp1,
        cp2: stop.cp2,
        color: stop.color
      };
    }

    return null;
  }
  get topLeft() {
    return this._stop("topLeft");
  }
  get topRight() {
    return this._stop("topRight");
  }
  get bottomLeft() {
    return this._stop("bottomLeft");
  }
  get bottomRight() {
    return this._stop("bottomRight");
  }
}
