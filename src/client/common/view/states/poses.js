export const TILT_BACK = 0.5; // end of windup / start of the strike
export const OVERSHOOT = 0.6; // end of the strike / start of recovery

// jump
export const JUMP_TILT_BACK = 0.8;  // tilt at the end of the jump windup / start of the leap
export const JUMP_LAND_TILT = 0.6;  // forward lean on landing, recovery straightens from here
export const JUMP_CROUCH    = 0.85; // scale.y at the end of the jump windup
export const JUMP_SQUASH    = 0.7;  // scale.y on landing
export const JUMP_HEIGHT    = 2;
export const smooth         = t => t * t * (3 - 2 * t);

// shoulder charge
export const CHARGE_PITCH = 0.45; // lean forward while rushing
export const CHARGE_YAW   = 0.7;  // the shoulder turns into the target

// spin
export const SPIN_RATE = 0.03;    // radians per ms

// shield throw
export const THROW_WIND_UP   = 0.7;  // arm pulled back
export const THROW_FOLLOW    = -0.6; // arm swung through
