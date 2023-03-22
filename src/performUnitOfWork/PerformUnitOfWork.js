import { reconcileChildren } from "../reconcileChildren/ReconcileChildren"
//performs the work but also returns the next unit of work
export const performUnitOfWork = (fiber) => {
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
    