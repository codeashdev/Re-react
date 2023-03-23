import { updateDom } from "../updateDom/UpdateDom"

// This function creates a DOM node based on a given Fiber object.
export const createDom = (fiber) => {
  // Create a DOM node of the type specified by the Fiber object.
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type)
  // Update the DOM node with the props specified by the Fiber object.
  updateDom(dom, {}, fiber.props)

  // Return the created DOM node.
  return dom
}