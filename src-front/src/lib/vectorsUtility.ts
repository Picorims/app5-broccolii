export class Vector {
  constructor(
    public x: number,
    public y: number,
  ) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  mult(coef: number): Vector {
    return new Vector(this.x * coef, this.y * coef);
  }
}

/*export interface Point {
  x: number;
  y: number;
}*/

export class Point {

  constructor(
    public x: number,
    public y: number
  ) {}

  add(vector : Vector) {
    return new Point(this.x + vector.x, this.y + vector.y);
  }
}

export function calculateVec(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  coef: number,
) {
  const x = (x2 - x1) * coef;
  const y = (y2 - y1) * coef;

  const res = new Vector(x, y);

  return res;
}

export function calculateVecSquared(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  coef: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distanceSquared = dx * dx + dy * dy;
  const repulsionRadius = 400;

  if (distanceSquared == 0) {
    return new Vector(1, 1);
  }

  // Only apply repulsion within the repulsion radius
  if (distanceSquared > repulsionRadius * repulsionRadius) {
    return new Vector(0, 0);
  }

  const distance = Math.sqrt(distanceSquared);

  // Calculate repulsion force (increases as objects get closer)
  const forceMagnitude = coef * (1 - distance / repulsionRadius);

  // Calculate force components (negative to repel)
  const fx = -(dx / distance) * forceMagnitude;
  const fy = -(dy / distance) * forceMagnitude;

  return new Vector(fx, fy);
}

export function calculateVecSquared2(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  coef: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distanceSquared = dx * dx + dy * dy;
  const repulsionRadiusSquared = 400 * 400;

  if (distanceSquared === 0) {
    return new Vector(1, 1);
  }

  // Only apply repulsion within the repulsion radius
  if (distanceSquared > repulsionRadiusSquared) {
    return new Vector(0, 0);
  }

  // Calculate repulsion force (increases as objects get closer)
  const forceMagnitude = coef * (1 - Math.sqrt(distanceSquared / repulsionRadiusSquared));

  // Calculate force components (negative to repel)
  const factor = forceMagnitude * Math.sqrt(distanceSquared);
  const fx = -dx * factor;
  const fy = -dy * factor;

  return new Vector(fx, fy);
}