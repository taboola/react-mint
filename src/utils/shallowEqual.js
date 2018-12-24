import shallowEqualLib from 'shallowequal'

export const shallowEqual = (objA, objB) => shallowEqualLib(objA, objB)

export const shallowEqualForeignProps = function(objA, objB, nativeProps) {
  const foreignComparator = (a) => !nativeProps[a]
  return shallowEqualLib(objA, objB, foreignComparator)
}