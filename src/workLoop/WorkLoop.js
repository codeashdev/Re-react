import commitRoot from "../commitWork/CommitWork"
import { performUnitOfWork } from "../performUnitOfWork/PerformUnitOfWork"
import { nextUnitOfWork, wipRoot } from "../renderingVariables/Vars"
/* This function sets the first unit of work to the root of the fiber tree and
   then continuously loops through the fiber tree until there are no more units
    of work to be done or the browser needs to yield to other tasks. Once there are no more
    units of work and there is a work-in-progress root, it commits the changes to the DOM.
    It then requests the browser to run this function again when it has time to idle.*/
    export const workLoop = (deadline) => {
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