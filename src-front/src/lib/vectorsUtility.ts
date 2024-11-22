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

export interface Point {
  x: number;
  y: number;
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
