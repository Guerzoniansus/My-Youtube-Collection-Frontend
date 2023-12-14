/**
 * Returns a new array with the specified element removed from the input array.
 * @param element The element to remove.
 * @param array The array to remove an element from. Will not be modified.
 */
export function removeElementFromArray(element: any, array: any[]): any[] {
  return array.filter(x => x !== element);
}
