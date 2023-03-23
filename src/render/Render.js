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
// This function recursively commits the changes made to the DOM by looping through
// each fiber and appending, updating, or deleting the corresponding DOM element as necessary.
const commitWork = (fiber) => {
  if (!fiber) { // if there is no fiber to commit, return
    return;
  }
  // find the nearest parent fiber with a DOM node
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  // get the DOM node of the parent fiber
  const domParent = domParentFiber.dom;
  // perform different actions based on the effect tag of the fiber
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    // if the fiber was newly added to the tree, append its DOM node to the parent DOM node
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    // if the fiber was updated, update its corresponding DOM node with the new props
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    // if the fiber was deleted, remove its corresponding DOM node from the parent DOM node
    commitDeletion(fiber, domParent);
  }
  // recursively commit the child and sibling fibers
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// This function recursively deletes the DOM nodes of a fiber and its children
const commitDeletion = (fiber, domParent) => {
  if (fiber.dom) {
    // if the fiber has a DOM node, remove it from the parent DOM node
    domParent.removeChild(fiber.dom);
  } else {
    // if the fiber has no DOM node, recursively delete the DOM nodes of its children
    commitDeletion(fiber.child, domParent);
  }
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

// This function performs the work on a fiber, updating the DOM or calling the function component
// to get the children that will be added to the component tree.
const performUnitOfWork = (fiber) => {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber); // update the function component
  } else {
    updateHostComponent(fiber); // update the host component (e.g. <div>, <span>, etc.)
  }
  if (fiber.child) {
    return fiber.child; // if the fiber has a child, return the child to continue performing work on it
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling; // if the fiber has a sibling, return the sibling to continue performing work on it
    }
    nextFiber = nextFiber.parent; // if the fiber has no child or sibling, move up to the parent and try again
  }
}

let wipFiber = null; // work in progress fiber
let hookIndex = null; // index of the hook being used

// This function updates a function component fiber and sets it as the work in progress fiber
const updateFunctionComponent = (fiber) => {
  wipFiber = fiber;
  // Reset hook index and hooks array for the new fiber
  hookIndex = 0;
  wipFiber.hooks = [];
  // Render the function component to get its children
  const children = [fiber.type(fiber.props)];
  // Reconcile the children of the function component with the old fiber's children
  reconcileChildren(fiber, children);
}


export const useState = (initial) => {
  // Retrieve the old hook object from the alternate fiber if it exists.
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  // Create a new hook object with initial state and an empty queue of state update actions.
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: []
  };
  // Apply all the state update actions in the queue to the hook state.
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = action(hook.state);
  });
  // Create a function to enqueue a new state update action.
  const setState = action => {
    hook.queue.push(action);
    // Reset the work-in-progress root fiber to the current root fiber,
    // and schedule a new update by setting the next unit of work to the root fiber.
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };
  // Add the new hook object to the work-in-progress fiber's array of hooks,
  // and increment the hook index for the next useState call.
  wipFiber.hooks.push(hook);
  hookIndex++;

  // Return the current state value and the setState function to the component.
  return [hook.state, setState];
};

const updateHostComponent = (fiber) => {
  // If the current fiber does not have a corresponding DOM node, create one
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  // Reconcile children fibers with the DOM node of the current fiber
  reconcileChildren(fiber, fiber.props.children);
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
