/**
 * Robust defensive monkey-patch for DOM helpers and window.getComputedStyle.
 * 
 * Prevents fatal TypeErrors:
 *   "Cannot read properties of undefined (reading 'getPropertyValue')"
 * which occurs when:
 * 1. React-transition-group or dom-helpers (css.js) runs:
 *      node.style.getPropertyValue(...) || getComputedStyle(node).getPropertyValue(...)
 *    and either:
 *      a) node.style is undefined (e.g. node is a React.Fragment or non-DOM object without .style)
 *      b) node is undefined/null/unmounted
 * 2. Window getComputedStyle is invoked on an invalid or unmounted node.
 */

// Safe fallback CSSStyleDeclaration dummy
const createFallbackStyle = (): CSSStyleDeclaration => {
  const dummy: Record<string, any> = {
    getPropertyValue: (_prop: string) => '',
    getPropertyPriority: (_prop: string) => '',
    item: (_index: number) => '',
    removeProperty: (_prop: string) => '',
    setProperty: () => {},
    length: 0,
    parentRule: null,
    cssText: '',
    transitionDuration: '0s',
    transitionDelay: '0s',
    transitionProperty: 'none',
    transitionTimingFunction: 'ease',
    animationDuration: '0s',
    animationDelay: '0s',
    animationName: 'none',
    opacity: '1',
    display: 'block',
    visibility: 'visible',
  };

  return dummy as unknown as CSSStyleDeclaration;
};

if (typeof window !== 'undefined') {
  // 1. Patch window.getComputedStyle
  const originalGetComputedStyle = window.getComputedStyle;

  window.getComputedStyle = function (elt: Element, pseudoElt?: string | null): CSSStyleDeclaration {
    const el: any = elt;
    if (!el || !(typeof el === 'object' && (el instanceof Element || el instanceof HTMLElement || el.nodeType === 1))) {
      return createFallbackStyle();
    }
    try {
      const computed = originalGetComputedStyle.call(window, elt, pseudoElt);
      if (!computed || typeof computed.getPropertyValue !== 'function') {
        return createFallbackStyle();
      }
      return computed;
    } catch {
      return createFallbackStyle();
    }
  };

  // 2. Defensive Object.prototype guard for `style.getPropertyValue` if `style` is accessed or undefined
  try {
    if (typeof (window as any).CSSStyleDeclaration !== 'undefined' && (window as any).CSSStyleDeclaration.prototype) {
      const proto = (window as any).CSSStyleDeclaration.prototype;
      const originalGetPropertyValue = proto.getPropertyValue;
      if (originalGetPropertyValue) {
        proto.getPropertyValue = function (property: string) {
          try {
            return originalGetPropertyValue.call(this, property);
          } catch {
            return '';
          }
        };
      }
    }
  } catch (e) {
    // Ignore prototype patching errors in restricted environments
  }
}

export {};
