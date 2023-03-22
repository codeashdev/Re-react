// This function creates a new element object with a given type, props, and children.
export const createElement = (type, props, ...children) => {
  return {
    // The type of the element, e.g. "div", "p", "h1", etc.
    type,
    // The props object, which contains key-value pairs for attributes and event handlers.
    props: {
      // Spread the props argument to include any additional properties passed in.
      ...props,
      // Map over the children array and create text element objects for any non-object values.
      children: children.map(child =>
        typeof child === "object" ? child : createTextElement(child)
      )
    }
  };
}

// This function creates a new text element object with a given text value.
export const createTextElement = (text) => {
  return {
    // The type of the element, which is always "TEXT_ELEMENT" for text nodes.
    type: "TEXT_ELEMENT",
    // The props object, which includes a nodeValue property for the text value and an empty children array.
    props: {
      nodeValue: text,
      children: []
    }
  };
}
