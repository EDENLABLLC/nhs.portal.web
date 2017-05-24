export const toArray = arrayLike => {
  if (Array.isArray(arrayLike)) {
    return arrayLike;
  }

  if (arrayLike instanceof Node) {
    return [arrayLike];
  }

  return Array.prototype.slice.call(arrayLike);
};

export const $ = (selector, context = document) => (
  toArray(context.querySelectorAll.call(context, selector))
);

export const selector = (block, elem, modName, modVal) => (
  `${block}__${elem}${modName ? (modVal ? `_${modName}_${modVal}` : `_${modName}`) : ''}`
);

export const buildClass = (...args) => `.${selector(...args)}`;

export class BEM extends null {
  constructor(name, node) {
    super();
    this.node = node;
    this.name = name;
  }

  elem(name, modName, modVal) {
    return this.node.querySelector(buildClass(this.name, name, modName, modVal));
  }

  elems(name, modName, modVal) {
    return $(buildClass(this.name, name, modName, modVal), this.node);
  }

  setMod(elem, elemName, modName, modValue) {
    toArray(elem).forEach(node => (
      node.classList.add(selector(this.name, elemName, modName, modValue))
    ));

    return this;
  }

  delMod(elem, elemName, modName) {
    toArray(elem).forEach(node => (
      node.classList.remove(selector(this.name, elemName, modName))
    ));

    return this;
  }
}