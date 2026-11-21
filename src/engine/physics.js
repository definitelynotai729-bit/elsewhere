// Physics: Rapier (deterministic build, so a run can later be replayed and verified bit-for-bit).
import RAPIER from '@dimforge/rapier3d-deterministic-compat';
import { DEG } from './util.js';

export { RAPIER };
let ready = null;
export const initPhysics = () => ready || (ready = RAPIER.init());

export class Physics {
  constructor(gravity = -24) {
    this.world = new RAPIER.World({ x: 0, y: gravity, z: 0 });
    this.world.timestep = 1 / 60;
    this.info = new Map(); // collider handle -> info (mover, crumble, tag...)
    this.ground = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  }
  desc(shape, d) {
    switch (shape) {
      case 'box': return RAPIER.ColliderDesc.cuboid(d.size[0] / 2, d.size[1] / 2, d.size[2] / 2);
      case 'cyl': return RAPIER.ColliderDesc.cylinder(d.h / 2, d.r);
      case 'cone': return RAPIER.ColliderDesc.cone(d.h / 2, d.r);
      case 'ball': return RAPIER.ColliderDesc.ball(d.r);
      case 'hull': return RAPIER.ColliderDesc.convexHull(new Float32Array(d.points));
      case 'mesh': return RAPIER.ColliderDesc.trimesh(new Float32Array(d.vertices), new Uint32Array(d.indices));
      default: throw new Error('unknown shape ' + shape);
    }
  }
  // static collider attached to the shared fixed body
  addStatic(desc, pos, quat, info) {
    desc.setTranslation(pos.x, pos.y, pos.z);
    if (quat) desc.setRotation(quat);
    const col = this.world.createCollider(desc, this.ground);
    if (info) this.info.set(col.handle, info);
    return col;
  }
  addKinematic(desc, pos, quat, info) {
    const bd = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(pos.x, pos.y, pos.z);
    if (quat) bd.setRotation(quat);
    const body = this.world.createRigidBody(bd);
    const col = this.world.createCollider(desc, body);
    if (info) this.info.set(col.handle, info);
    return { body, col };
  }
  addDynamic(desc, pos, o = {}) {
    const bd = RAPIER.RigidBodyDesc.dynamic().setTranslation(pos.x, pos.y, pos.z).setLinearDamping(o.damping == null ? 0.25 : o.damping).setAngularDamping(o.angularDamping == null ? 0.4 : o.angularDamping).setCcdEnabled(true);
    const body = this.world.createRigidBody(bd);
    desc.setDensity(o.density == null ? 0.4 : o.density).setRestitution(o.bounce == null ? 0.55 : o.bounce).setFriction(o.friction == null ? 0.6 : o.friction);
    const col = this.world.createCollider(desc, body);
    if (o.info) this.info.set(col.handle, o.info);
    return { body, col };
  }
  createCharacter(pos) {
    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(pos.x, pos.y, pos.z));
    const col = this.world.createCollider(RAPIER.ColliderDesc.capsule(0.5, 0.4), body);
    const ctl = this.world.createCharacterController(0.03);
    ctl.setUp({ x: 0, y: 1, z: 0 });
    ctl.enableAutostep(0.45, 0.2, false);
    ctl.enableSnapToGround(0.3);
    ctl.setMaxSlopeClimbAngle(50 * DEG);
    ctl.setMinSlopeSlideAngle(56 * DEG);
    ctl.setSlideEnabled(true);
    ctl.setApplyImpulsesToDynamicBodies(true);
    ctl.setCharacterMass(70);
    return { body, col, ctl };
  }
  ray(origin, dir, maxDist, exclude) {
    const hit = this.world.castRay(new RAPIER.Ray(origin, dir), maxDist, true, RAPIER.QueryFilterFlags.EXCLUDE_SENSORS, undefined, exclude);
    return hit ? { toi: hit.timeOfImpact, collider: hit.collider } : null;
  }
  step() { this.world.step(); }
  free() { try { this.world.free(); } catch (e) {} }
}
