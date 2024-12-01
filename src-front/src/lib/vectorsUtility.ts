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


export function calculateVecSquared3(
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

  
  const invDistance = fastSqrt2(distanceSquared);

  // Calculate repulsion force (increases as objects get closer)
  const forceMagnitude = coef * (1 - 1/invDistance / repulsionRadius);

  // Calculate force components (negative to repel)
  const fx = -(dx * invDistance) * forceMagnitude;
  const fy = -(dy * invDistance) * forceMagnitude;

  return new Vector(fx, fy);
}

function Q_rsqrt(number: number)
{ 
    var i;
    var x2, y;
    const threehalfs = 1.5;
  
    x2 = number * 0.5;
    y = number;
    //evil floating bit level hacking
    var buf = new ArrayBuffer(4);
    (new Float32Array(buf))[0] = number;
    i =  (new Uint32Array(buf))[0];
    i = (0x5f3759df - (i >> 1)); //What the fuck?
    (new Uint32Array(buf))[0] = i;
    y = (new Float32Array(buf))[0];
    y  = y * ( threehalfs - ( x2 * y * y ) );   // 1st iteration
//  y  = y * ( threehalfs - ( x2 * y * y ) );   // 2nd iteration, this can be removed

    return y;
}

function fastSqrt(x: number): number {
  const y = x;
  const i = new Float32Array(1);
  i[0] = y;
  i[0] = 0x5f3759df - (i[0] >> 1);
  return y * i[0] * (1.5 - 0.5 * y * i[0] * i[0]);
}

function fastSqrt2(x: number) {
  const buf = new ArrayBuffer(4);
  const f32 = new Float32Array(buf);
  const u32 = new Uint32Array(buf);
  
  f32[0] = x;
  u32[0] = (0x5f3759df - (u32[0] >> 1));
  let y = f32[0];
  
  // One iteration of Newton's method
  y = y * (1.5 - (0.5 * x * y * y));
  
  return y;
}