class PointA {
  constructor(public x: number, public y: number) {}
}
class PointB {
  constructor(public __x: number, public __y: number) {}
}

/**
 * @x9_conversion
 */
export function point_a_to_b(a: PointA): PointB {
  return new PointB(a.x, a.y)
}

/**
 * @x9_conversion
 */
function point_a_to_b2(a: PointA): PointB {
  return new PointB(a.x, a.y)
}

/**
 * @x9_conversion
 */
function point_b_to_a(b: PointB): PointA {
  return new PointA(b.__x, b.__y)
}

/**
 * @x9_conversion
 */
function point_b_to_c(b: PointB) {
  return new PointA(b.__x, b.__y)
}

function usage() {
  x9.convert<PointB>(new PointA(0, 0))
}
