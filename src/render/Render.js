import { createDom } from "../createDom/CreateDom"
import {updateDom} from "../updateDom/UpdateDom"

const commitRoot = () => {
    // Remove any deleted nodes by calling commitWork on each deleted fiber.
    deletions.forEach(commitWork)     
    // Commit the new or updated nodes by calling commitWork on the first child of the work-in-progress root.
    commitWork(wipRoot.child)
    // Set the current root to the work-in-progress root.
    currentRoot = wipRoot
    // Reset the work-in-progress root to null.
    wipRoot = null
  }
/*This function recursively commits the changes made to the DOM by looping through
    each fiber and appending, updating, or deleting the corresponding DOM element as necessary.*/
const commitWork = (fiber) => {
      // If there is no fiber, return.
      if (!fiber) {
        return
      }
      // Get the parent DOM element of the fiber.
      const domParent = fiber.parent.dom
      // If the fiber's effect tag is PLACEMENT and the fiber has a DOM element,
      //  append the DOM element to the parent DOM element.
      if (
        fiber.effectTag === "PLACEMENT" &&
        fiber.dom != null
      ) {
        domParent.appendChild(fiber.dom)
      // If the fiber's effect tag is UPDATE and the fiber has a DOM element,
      //  update the DOM element's properties using the updateDom function.
      } else if (
        fiber.effectTag === "UPDATE" &&
        fiber.dom != null
      ) {
        updateDom(
          fiber.dom,
          fiber.alternate.props,
          fiber.props
        )
      // If the fiber's effect tag is DELETION, remove the DOM element from the parent DOM element.
      } else if (fiber.effectTag === "DELETION") {
        domParent.removeChild(fiber.dom)
      }
      // Recursively commit the changes to the child fibers and sibling fibers.
      commitWork(fiber.child)
      commitWork(fiber.sibling)
    }
/* This function renders the given element to the given container
    by setting the work-in-progress root to an object with the container as its DOM element, the element as its child,
    and the current root as its alternate. It also initializes the deletions array and sets the next unit of work to the work-in-progress root.*/
export const render = (element, container) => {
      // Set the work-in-progress root to an object with the container as its DOM element, the element as its child, and the current root as its alternate.
      wipRoot = {
        dom: container,
        props: {
          children: [element],
        },
        alternate: currentRoot,
      }
      // Initialize the deletions array.
      deletions = []
      // Set the next unit of work to the work-in-progress root.
      nextUnitOfWork = wipRoot
    }
// Initialize the variables used in the rendering process.
let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
let deletions = null

/* This function sets the first unit of work to the root of the fiber tree and
   then continuously loops through the fiber tree until there are no more units
    of work to be done or the browser needs to yield to other tasks. Once there are no more
    units of work and there is a work-in-progress root, it commits the changes to the DOM.
    It then requests the browser to run this function again when it has time to idle.*/
const workLoop = (deadline) => {
      // Set shouldYield to false and loop through the fiber tree until there are no more units of work or the browser needs to yield to other tasks.
      let shouldYield = false
      while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(
          nextUnitOfWork
        )
        shouldYield = deadline.timeRemaining() < 1
      }
    
      // If there are no more units of work and there is a work-in-progress root, commit the changes to the DOM.
      if (!nextUnitOfWork && wipRoot) {
        commitRoot()
      }
    
      // Request the browser to run this function again when it has time to idle.
      requestIdleCallback(workLoop)
    }
// requestIdleCallback gives a deadline parameter 
// to check how much time until the browser needs to take control again
requestIdleCallback(workLoop)

const performUnitOfWork = (fiber) => {
  //keep track of the DOM node in the fiber.dom property  
    if (!fiber.dom) {
      fiber.dom = createDom(fiber)
    }
  // for each child create a new fiber
    const elements = fiber.props.children
    reconcileChildren(fiber, elements)
  //search for the next unit of work. We first try with the child,
  //then with the sibling, then with the uncle, and so on
    if (fiber.child) {
      return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling
      }
      nextFiber = nextFiber.parent
    }
  }
//reconcile the old fibers with the new elements
const reconcileChildren = (wipFiber, elements) => {
  let index = 0
  let oldFiber =
    wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (
    index < elements.length ||
    oldFiber != null
  ) {
    const element = elements[index]
    let newFiber = null

    const sameType =
      oldFiber &&
      element &&
      element.type === oldFiber.type
//if the old fiber and the new element have the same type,
//keep the DOM node and just update it with the new props
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
// if the type is different and there is a new element,
// create a new DOM node    
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }
// if the types are different and there is an old fiber, remove the old node   
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }
//Add to the fiber tree setting it either as a child or as a sibling, 
//  depending on whether it’s the first child or not.
    if (index === 0) {
      wipFiber.child = newFiber
    } else if (element) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}
