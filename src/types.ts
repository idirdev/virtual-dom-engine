/** Props that can be assigned to a virtual DOM element */
export type Props = {
  [key: string]: any;
  key?: string | number;
  style?: Partial<CSSStyleDeclaration>;
  className?: string;
  onClick?: EventListener;
  onChange?: EventListener;
  onInput?: EventListener;
  onSubmit?: EventListener;
  onKeyDown?: EventListener;
  onKeyUp?: EventListener;
};

/** A virtual text node representing plain text content */
export interface VTextNode {
  type: 'text';
  value: string;
}

/** A virtual element node representing a DOM element */
export interface VElement {
  type: 'element';
  tag: string;
  props: Props;
  children: VNode[];
  key?: string | number;
}

/** A virtual node is either a text node or an element node */
export type VNode = VElement | VTextNode;

/** Types of patches that can be applied to the real DOM */
export enum PatchType {
  CREATE = 'CREATE',
  REMOVE = 'REMOVE',
  REPLACE = 'REPLACE',
  UPDATE = 'UPDATE',
  REORDER = 'REORDER',
}

export interface CreatePatch {
  type: PatchType.CREATE;
  newNode: VNode;
}

export interface RemovePatch {
  type: PatchType.REMOVE;
  index: number;
}

export interface ReplacePatch {
  type: PatchType.REPLACE;
  newNode: VNode;
}

export interface UpdatePatch {
  type: PatchType.UPDATE;
  propPatches: PropPatch[];
  childPatches: ChildPatch[];
}

export interface ReorderPatch {
  type: PatchType.REORDER;
  moves: ReorderMove[];
}

export interface PropPatch {
  key: string;
  value: any;
  oldValue?: any;
}

export interface ChildPatch {
  index: number;
  patch: Patch;
}

export interface ReorderMove {
  from: number;
  to: number;
  item?: VNode;
}

export type Patch = CreatePatch | RemovePatch | ReplacePatch | UpdatePatch | ReorderPatch;
