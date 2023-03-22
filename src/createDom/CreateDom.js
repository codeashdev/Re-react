 // This function takes in a fiber object and returns a DOM element.
const createDom = (fiber) => {
    // If the fiber's type is "TEXT_ELEMENT", create a text node, otherwise create a regular DOM element.
    const dom =
      fiber.type == "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(fiber.type)
  
    // This function filters out the "children" key from the props object.
    const isProperty = key => key !== "children"
  
    // Loop through each property of the fiber's props object, excluding "children".
    Object.keys(fiber.props)
      .filter(isProperty)
      .forEach(name => {
        // Set the corresponding property on the DOM element to the value of the fiber's props.
        dom[name] = fiber.props[name]
      })
  
    // Return the newly created DOM element.
    return dom
  }
  export default createDom