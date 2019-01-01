import shallowEqualLib from 'shallowequal'

export const shallowEqual = (objA, objB) => shallowEqualLib(objA, objB)

export const shallowEqualForeignProps = function(objA, objB, nativeProps) {
  const foreignComparator = (a, b, c) => {
    if(!c) {
      return;
    }
    return !nativeProps[a] && shallowEqual(a, b)
  }
  return shallowEqualLib(objA, objB, foreignComparator)
}