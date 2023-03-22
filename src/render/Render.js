import { workLoop } from "../workLoop/WorkLoop"
import { deletions, nextUnitOfWork, currentRoot, wipRoot } from "../renderingVariables/Vars"

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
// requestIdleCallback gives a deadline parameter 
// to check how much time until the browser needs to take control again
requestIdleCallback(workLoop)


