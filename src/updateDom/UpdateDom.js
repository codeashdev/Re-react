  // This function returns true if the key starts with "on", indicating that it is an event listener.
  const isEvent = key => key.startsWith("on")

  // This function returns true if the key is not "children" and does not start with "on", indicating that it is a regular property.
  const isProperty = key =>
    key !== "children" && !isEvent(key)
  
  // This function returns true if the value of a key in the next props is different from the value of the same key in the previous props.
  const isNew = (prev, next) => key =>
    prev[key] !== next[key]
  
  // This function returns true if a key is not present in the next props, indicating that it has been removed.
  const isGone = (prev, next) => key => !(key in next)
  
  // This function updates a DOM element with new props by removing old props, setting new or changed props, and adding event listeners.
const updateDom = (dom, prevProps, nextProps) => {
    // Remove old properties by looping through each property in the previous props 
    // object and setting the corresponding property on the DOM element to an empty string if it has been removed.
    Object.keys(prevProps)
      .filter(isProperty)
      .filter(isGone(prevProps, nextProps))
      .forEach(name => {
        dom[name] = ""
      })
  
    // Set new or changed properties by looping through each property in the next props object
    //  and setting the corresponding property on the DOM element if it is new or has changed.
    Object.keys(nextProps)
      .filter(isProperty)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        dom[name] = nextProps[name]
      })
  
    // Add event listeners by looping through each property in the next props object that starts with "on" and adding an event listener for that type of event.
    Object.keys(nextProps)
      .filter(isEvent)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        const eventType = name
          .toLowerCase()
          .substring(2)
        dom.addEventListener(
          eventType,
          nextProps[name]
        )
      })
  }

  export default updateDom;