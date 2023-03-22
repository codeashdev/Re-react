import updateDom from "../updateDom/UpdateDom"
import { deletions, currentRoot, wipRoot } from "../renderingVariables/Vars"
/* This function commits the changes made to the DOM by recursively appending all nodes to the DOM.
    It starts by removing any deleted nodes, then commits the new or updated nodes, and finally sets the current root to 
    the work-in-progress root and resets the work-in-progress root to null.*/
    export const commitRoot = () => {
        // Remove any deleted nodes by calling commitWork on each deleted fiber.
        deletions.forEach(commitWork)
      
        // Commit the new or updated nodes by calling commitWork on the first child of the work-in-progress root.
        commitWork(wipRoot.child)
      
        // Set the current root to the work-in-progress root.
        currentRoot = wipRoot
      
        // Reset the work-in-progress root to null.
        wipRoot = null
      }
      
      // This function recursively commits the changes made to the DOM by looping through
      //  each fiber and appending, updating, or deleting the corresponding DOM element as necessary.
     export const commitWork = (fiber) => {
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