/*
* Adapted from Neil Wallis' Water Java simulation
* http://www.neilwallis.com/projects/java/water/index.php
*
*/
"use strict";
///////////////// worker thread code ///////////////////
const water = noWorkers => {
  "use strict";
	let canvas, ctx;
	let pointer = { x: 0, y: 0, isDown: false };
	let width, height, hwidth, hheight, size, map, oldind, newind;
	let textureBuffer8, textureBuffer32;
	let ripple, rippleBuffer8, rippleBuffer32;
	const window = {
		CP: {
			shouldStopExecution(e) {/* thanks, but no thank you! */},
			exitedLoop(e) {}
		}
	};
	// ---- messages from the main thread ----
	const message = e => {
		switch (e.data.msg) {
			case "pointerMove":
				pointer.x = e.data.x | 0;
				pointer.y = e.data.y | 0;
				break;
				case "pointerDown":
				pointer.x = e.data.x | 0;
				pointer.y = e.data.y | 0;
				pointer.isDown = true;
				break;
			case "pointerUp":
				pointer.isDown = false;
				break;
			case "start":
				canvas = e.data.elem;
				width = canvas.width;
				height = canvas.height;
				ctx = canvas.getContext("2d");
				hwidth = width / 2;
				hheight = height / 2;
				size = width * (height + 2) * 2;
				map = new Int16Array(size);
				oldind = width;
				newind = width * (height + 3);
				const textureBuffer = new ArrayBuffer(e.data.imgData.data.length);
				textureBuffer8 = new Uint8ClampedArray(textureBuffer); // 8 bit clamped view
				textureBuffer32 = new Uint32Array(textureBuffer); // 32 bits view
                textureBuffer8.set(e.data.imgData.data);
				// ripple texture
				ripple = e.data.imgData;
				const rippleBuffer = new ArrayBuffer(ripple.data.length);
				rippleBuffer8 = new Uint8ClampedArray(rippleBuffer);
				rippleBuffer32 = new Uint32Array(rippleBuffer);
				// start
				run();
                gloop();
				setInterval(gloop, 4000);
				break;
		}
	};
	// create wave
	function wave(dx, dy, r) {
		for (let j = -r; j < r; j++) {
			for (let k = -r; k < r; k++) {
        if (j * j + k * k < r * r) {
					map[oldind + (dy + j) * width + (dx + k)] += 256;
				}
			}
		}
	}
	function water() {
		// toggle maps each frame
		let i = oldind;
		oldind = newind;
		newind = i;
		let mapind = oldind;
    const len = width * height;
		for (let i = 0; i < len; i++) {
			const x = (i % width) | 0;
			const y = (i / width) | 0;
			let data =
				((map[mapind - width] +
					map[mapind + width] +
					map[mapind - 1] +
					map[mapind + 1]) >>
					1) -
				map[newind + i];
			data -= data >> 6;
			mapind++;
			if (x !== 0) map[newind + i] = data;
			data = 1024 - data;
			// offsets
			const a = ((x - hwidth) * data / 1024 + hwidth) | 0;
			const b = ((y - hheight) * data / 1024 + hheight) | 0;
			// 32 bits pixel copy
			rippleBuffer32[i] = textureBuffer32[a + b * width];
		}
		ripple.data.set(rippleBuffer8);
    ctx.putImageData(ripple, 0, 0);
	}
	function gloop() {
		wave(width*0.3, hheight, 28);
	}
	// main loop
	function run() {
		requestAnimationFrame(run);
		water();
		if (pointer.isDown) {
			wave(pointer.x, pointer.y, 16);
		}
	}
	// ---- main thread vs. worker
	if (noWorkers) {
		// ---- map postMessage ----
		return {
			postMessage(data) {
				message({ data: data });
			}
		};
	} else {
		// ---- worker messaging ----
		onmessage = message;
	}
};
///////////////// main thread code ///////////////////
let worker = null;
const createWorker = fn => {
	const URL = window.URL || window.webkitURL;
	return new Worker(URL.createObjectURL(new Blob(["(" + fn + ")()"])));
};
// ---- init canvas ----
const canvas = document.querySelector("canvas");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
// ---- source image ----
const img = document.getElementById("texture");
const texture = document.createElement("canvas");
texture.width = canvas.width;
texture.height = canvas.height;
const ctx = texture.getContext("2d");
ctx.drawImage(img, 1920 - canvas.width, 1080 - canvas.height, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// ---- instanciate worker ----
if (window.Worker && window.OffscreenCanvas) {
	worker = createWorker(water);
	const offscreen = canvas.transferControlToOffscreen();
	worker.postMessage({ msg: "start", elem: offscreen, imgData: imgData }, [
		offscreen
	]);
} else {
	worker = water(true);
	worker.postMessage({ msg: "start", elem: canvas, imgData: imgData });
}
// ---- pointer events ----
const pointer = {
	x: 0,
	y: 0,
	move(e) {
		if (e.targetTouches) {
			e.preventDefault();
			this.x = e.targetTouches[0].clientX;
			this.y = e.targetTouches[0].clientY;
		} else {
			this.x = e.clientX;
			this.y = e.clientY;
		}
		worker.postMessage({
			msg: "pointerMove",
			x: this.x - canvas.offsetLeft,
			y: this.y - canvas.offsetTop
		});
	},
	down(e) {
		this.move(e);
		worker.postMessage({
			msg: "pointerDown",
			x: this.x - canvas.offsetLeft,
			y: this.y - canvas.offsetTop
		});
	},
	up(e) {
		worker.postMessage({
			msg: "pointerUp"
		});
	}
};
window.addEventListener("mousemove", e => pointer.move(e), false);
canvas.addEventListener("touchmove", e => pointer.move(e), false);
window.addEventListener("mousedown", e => pointer.down(e), false);
window.addEventListener("touchstart", e => pointer.down(e), false);
window.addEventListener("mouseup", e => pointer.up(e), false);
window.addEventListener("touchend", e => pointer.up(e), false);