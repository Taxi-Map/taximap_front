export class TaxiPhysics {
    x: number;
    y: number;
    angle: number;
    speed: number;
    acceleration: number;
    friction: number;
    maxSpeed: number;
    // Controls
    controls: { forward: boolean; left: boolean; right: boolean; reverse: boolean };

    constructor(scale: number = 0.000005) {
        this.x = 0;
        this.y = 0;
        this.angle = Math.PI / 2; // Start facing North
        this.speed = 0;

        // Tuned for geographic coordinates - SLOWER to prevent orbiting
        this.acceleration = 0.05 * scale;
        this.friction = 0.02 * scale;
        this.maxSpeed = 0.5 * scale;

        this.controls = {
            forward: false,
            left: false,
            right: false,
            reverse: false
        };
    }

    setPosition(lat: number, lng: number) {
        // x = Lng (East-West), y = Lat (North-South) for standard math
        this.x = lng;
        this.y = lat;
    }

    // "AI" Driver to follow a path
    driveTowards(targetLat: number, targetLng: number) {
        // Calculate angle to target
        // Note: Math.atan2(y, x). formatting for Lat/Lng direction (North is 0 usually in maps, but Math is East 0)
        // We will stick to standard Math for the physics, then map to visual rotation later

        // Vector to target (x=Lng, y=Lat)
        const dx = targetLng - this.x;
        const dy = targetLat - this.y;

        // Standard math: atan2(dy, dx) gives angle from East
        const targetAngle = Math.atan2(dy, dx);

        // Normalize angle difference to -PI to PI
        let diff = targetAngle - this.angle;
        while (diff <= -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        // Simple steering logic
        this.controls.forward = true;
        this.controls.left = false;
        this.controls.right = false;

        if (Math.abs(diff) > 0.05) {
            if (diff > 0) {
                this.controls.left = true; // In standard circle, +angle is CounterClockwise/Left? 
                // Wait. Canvas Y is down. Geographic Lat is Up. 
                // Let's stick to abstract math: x=lat, y=lng.
                // atan2(lng, lat). 
                // We'll trust the simulation convergence. 
                // if diff is positive, we need to increase angle. 
                // car.js: left -> angle += 0.03
                this.controls.left = true;
            } else {
                this.controls.right = true; // angle -= 0.03
            }
        }
    }

    update() {
        this.#move();
    }

    // Exact logic from car.js (converted to TS private method)
    #move() {
        // Update position based on speed
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }
        // Limit the speed
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed) {
            this.speed = -this.maxSpeed / 2;
        }

        // Apply friction
        if (this.speed > 0) {
            this.speed -= this.friction;
        } else if (this.speed < 0) {
            this.speed += this.friction;
        }

        // Stop the car if speed is very low
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        // Update position based on speed and angle
        if (this.speed !== 0) {
            const direction = this.speed > 0 ? 1 : -1;
            // Turning speed needs to be independent of coordinate scale? 
            // In car.js it was 0.03. That's radians. 
            // Turning circle shouldn't shrink with coordinates? 
            // Actually, keep it same.
            // Faster turning to reach target quicker
            if (this.controls.left) {
                this.angle += 0.08 * direction;
            }
            if (this.controls.right) {
                this.angle -= 0.08 * direction;
            }
        }

        // IMPORTANT: 
        // car.js used: x -= sin(angle)*speed; y -= cos(angle)*speed;
        // This assumes specific coordinate system (Y down, 0 is Up?). 
        // We defined Angle via atan2(dy, dx), which corresponds to:
        // x += cos(angle)*speed
        // y += sin(angle)*speed
        // We will switch to standard trigonometry to match our atan2 steering logic.

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }
}
