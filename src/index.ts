import MeshElement from "./elements/mesh.js";
import { TAG_PREFIX } from "./options.js";
import RowElement from "./elements/row.js";
import PatchElement from "./elements/patch.js";
import StopElement from "./elements/stop.js";
customElements.define(`${TAG_PREFIX}-stop`, StopElement);
customElements.define(`${TAG_PREFIX}-patch`, PatchElement);
customElements.define(`${TAG_PREFIX}-row`, RowElement);
customElements.define(`${TAG_PREFIX}-mesh`, MeshElement);
