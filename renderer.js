"use strict";

// Globals...

let canvas = document.getElementById("main_canvas");
let ctx = canvas.getContext("2d");

function NewObject(x, y, z, speedx, speedy, speedz, mass, color) {

	let o = {x, y, z, speedx, speedy, speedz, mass, color};

	o.gravitate = function(other, constants) {

		let dx = other.x - this.x;
		let dy = other.y - this.y;
		let dz = other.z - this.z;

		let distance_squared = dx * dx + dy * dy + dz * dz;
		let distance = Math.sqrt(distance_squared);
		let distance_cubed = distance_squared * distance;

		if (distance_cubed < constants.min_divisor) {
			distance_cubed = constants.min_divisor;
		}

		let adjusted_force = other.mass / distance_cubed;
		this.speedx += dx * adjusted_force;
		this.speedy += dy * adjusted_force;
		this.speedz += dz * adjusted_force;
	};

	o.move = function() {
		this.x += this.speedx;
		this.y += this.speedy;
		this.z += this.speedz;
	};

	return o;
}

function DefaultSystem() {
	let system = [];
	system.push(NewObject(0, 0, 0, 0, 0, 0, 1000, "#ffff00"));
	system.push(NewObject(300, 0, 0, 0, 2, 0, 10, "#00ffff"));
	system.push(NewObject(300, 20, 0, -0.66, 2, 0, 0.1, "#ffffff"));
	return system;
}

function NewSim() {

	let sim = {
		i: 0,
		x: 0,
		y: 0,
		constants: {
			min_divisor: 1
		},
		objects: [],
	};

	sim.spin = function() {
		this.update();
		this.draw();
		window.requestAnimationFrame(() => {
			this.spin();
		});
	};

	sim.update = function() {

		this.i += 1;

		for (let a = 0; a < this.objects.length; a++) {
			for (let b = a + 1; b < this.objects.length; b++) {
				this.objects[a].gravitate(this.objects[b], this.constants);
				this.objects[b].gravitate(this.objects[a], this.constants);
			}
		}

		for (let o of this.objects) {
			o.move();
		}
	};

	sim.draw = function() {

		if (this.i % 60 === 1) {					// Every 60 frames, update the canvas size...
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		} else {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}

		let screen_mid_x = canvas.width / 2;
		let screen_mid_y = canvas.height / 2;

		for (let o of this.objects) {

			let screen_x = screen_mid_x + o.x;
			let screen_y = screen_mid_y + o.y;

			let radius = Math.ceil(Math.log(o.mass));

			if (radius < 1) {
				radius = 1;
			}

			ctx.beginPath();
			ctx.arc(screen_x, screen_y, radius, 0, 2 * Math.PI, false);
			ctx.fillStyle = o.color;
			ctx.strokeStyle = o.color;
			ctx.lineWidth = 0;
			ctx.fill();
			ctx.stroke();
		}

	};

	return sim;
}


let sim = NewSim();
sim.objects = DefaultSystem();
sim.spin();
