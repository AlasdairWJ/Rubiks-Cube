var gl = null;
var canvas = null;
const screenW = 800;
const screenH = 480;

function arraysAreEqual(A, B) {
	if (A === B) return true;
	if (A == null || B == null) return false;
	if (A.length != B.length) return false;

	for (var i = 0; i < A.length; ++i) {
		if (A[i] !== B[i]) {
			return false;
		}
	}

	return true;
}


const WHITE = makecol(255, 255, 255);
const BLACK = makecol(0, 0, 0);

const WHITE_ISH = makecol(240, 240, 240);
const BLACK_ISH = makecol(16, 16, 16);

const RED = 0xFFB71234; //makecol(255, 0, 0);
const BLUE = 0xFF0046AD; //makecol(0, 0, 255);
const GREEN = 0xFF009B48; //makecol(0, 255, 0);
const ORANGE = 0xFFFF5800; //makecol(255, 102, 0);
const YELLOW = 0xFFFFD500; //makecol(255, 255, 0);

/*
           +----------+
           |  0  1  2 |
           |  3  4  5 |
           |  6  7  8 |
+----------+----------+----------+----------+
|  9 10 11 | 12 13 14 | 15 16 17 | 18 19 20 |
| 21 22 23 | 24 25 26 | 27 28 29 | 30 31 32 |
| 33 34 35 | 36 37 38 | 39 40 41 | 42 43 44 |
+----------+----------+----------+----------+
           | 45 46 47 |
           | 48 49 50 |
           | 51 52 53 |
           +----------+
*/

/*
   U          0
 L F R B    1 2 3 4
   D          5

 Front:     Middle:    Back:

  0  1  2    9 10 11   17 18 19
  3  4  5   12    13   20 21 22
  6  7  8   14 15 16   23 24 25
*/

const COLOURS = [ WHITE, GREEN, RED, BLUE, ORANGE, YELLOW ];

const defaultConfig = [0,0,0,0,0,0,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,1,1,1,2,2,2,3,3,3,4,4,4,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,5,5,5,5,5,5];

//  [  U,  L,  F,  R,  B,  D]
var cube_face_colours = [
	[  6, 11, 12, -1, -1, -1],
	[  7, -1, 13, -1, -1, -1],
	[  8, -1, 14, 15, -1, -1],
	[ -1, 23, 24, -1, -1, -1],
	[ -1, -1, 25, -1, -1, -1],
	[ -1, -1, 26, 27, -1, -1],
	[ -1, 35, 36, -1, -1, 45],
	[ -1, -1, 37, -1, -1, 46],
	[ -1, -1, 38, 39, -1, 47],

	[  3, 10, -1, -1, -1, -1],
	[  4, -1, -1, -1, -1, -1],
	[  5, -1, -1, 16, -1, -1],

	[ -1, 22, -1, -1, -1, -1],
//	[ -1, -1, -1, -1, -1, -1],
	[ -1, -1, -1, 28, -1, -1],

	[ -1, 34, -1, -1, -1, 48],
	[ -1, -1, -1, -1, -1, 49],
	[ -1, -1, -1, 40, -1, 50],

	[  0,  9, -1, -1, 20, -1],
	[  1, -1, -1, -1, 19, -1],
	[  2, -1, -1, 17, 18, -1],
	[ -1, 21, -1, -1, 32, -1],
	[ -1, -1, -1, -1, 31, -1],
	[ -1, -1, -1, 29, 30, -1],
	[ -1, 33, -1, -1, 44, 51],
	[ -1, -1, -1, -1, 43, 52],
	[ -1, -1, -1, 41, 42, 53],
];

var d = 2.25;

var cube_locations = [
	[ -d, -d, -d, 1], [  0, -d, -d, 1], [  d, -d, -d, 1],
	[ -d,  0, -d, 1], [  0,  0, -d, 1], [  d,  0, -d, 1],
	[ -d,  d, -d, 1], [  0,  d, -d, 1], [  d,  d, -d, 1],

	[ -d, -d,  0, 1], [  0, -d,  0, 1], [  d, -d,  0, 1],
	[ -d,  0,  0, 1],                   [  d,  0,  0, 1],
	[ -d,  d,  0, 1], [  0,  d,  0, 1], [  d,  d,  0, 1],

	[ -d, -d,  d, 1], [  0, -d,  d, 1], [  d, -d,  d, 1],
	[ -d,  0,  d, 1], [  0,  0,  d, 1], [  d,  0,  d, 1],
	[ -d,  d,  d, 1], [  0,  d,  d, 1], [  d,  d,  d, 1],
];

var cube_descriptor = {
	verticies: [
		[-1, -1, -1, 1], [ 1, -1, -1, 1],
		[-1,  1, -1, 1], [ 1,  1, -1, 1],
		[-1, -1,  1, 1], [ 1, -1,  1, 1],
		[-1,  1,  1, 1], [ 1,  1,  1, 1]
	],
	faces: [
		[1, 0, 4, 5], [0, 2, 6, 4], [0, 1, 3, 2],
		[3, 1, 5, 7], [5, 4, 6, 7], [2, 3, 7, 6], 
	]
};

/*
[	
	"l", "l2", "l'", "r", "r2", "r'", "u", "u2", "u'", "d", "d2", "d'",
	"f", "f2", "f'", "b", "b2", "b'", "m", "m2", "m'", "e", "e2", "e'",
	"s", "s2", "s'", "x", "x2", "x'", "y", "y2", "y'", "z", "z2", "z'"
]

 Front:     Middle:    Back:

  0  1  2    9 10 11   17 18 19
  3  4  5   12    13   20 21 22
  6  7  8   14 15 16   23 24 25

*/

var all_cubes = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25];

// same 
var action_targets = [
	[ 0, 3, 6, 9,12,14,17,20,23], // L
	[ 2, 5, 8,11,13,16,19,22,25], // R
	[ 0, 1, 2, 9,10,11,17,18,19], // U
	[ 6, 7, 8,14,15,16,23,24,25], // D
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8], // F
	[17,18,19,20,21,22,23,24,25], // B
	[ 1, 4, 7,10,15,18,21,24], // M
	[ 3, 4, 5,12,13,20,21,22], // E
	[ 9,10,11,12,13,14,15,16], // S
	all_cubes, all_cubes, all_cubes // X, Y, Z
];

function rot_x1(x) { return rot_x(x * Math.PI / 2.0); }
function rot_x2(x) { return rot_x(x * Math.PI); }
function rot_x3(x) { return rot_x(-x * Math.PI / 2.0); }

function rot_y1(x) { return rot_y(x * Math.PI / 2.0); }
function rot_y2(x) { return rot_y(x * Math.PI); }
function rot_y3(x) { return rot_y(-x * Math.PI / 2.0); }

function rot_z1(x) { return rot_z(x * Math.PI / 2.0); }
function rot_z2(x) { return rot_z(x * Math.PI); }
function rot_z3(x) { return rot_z(-x * Math.PI / 2.0); }

var action_perms = [
	rot_x1, rot_x2, rot_x3,
	rot_x3, rot_x2, rot_x1,
	rot_y1, rot_y2, rot_y3,
	rot_y3, rot_y2, rot_y1,
	rot_z1, rot_z2, rot_z3,
	rot_z3, rot_z2, rot_z1,
	
	rot_x1, rot_x2, rot_x3,
	rot_y3, rot_y2, rot_y1,
	rot_z1, rot_z2, rot_z3,
	
	rot_x3, rot_x2, rot_x1,
	rot_y1, rot_y2, rot_y3,
	rot_z1, rot_z2, rot_z3,
];

var framerate = 144.0;
var frametime = 1.0 / framerate;

var display_mat = [
	25,  0, 0, 0,
	 0, 25, 0, 0,
	 0,  0, 1, 0,
	 0,  0, 0, 1
];

var rotation_mat = identity();

var current_action_id = 0;
var current_action_progress = 0;
var action_duration = 0.75;

function current_action_targets() {
	return action_targets[Math.floor(current_action_id / 3)];
}

function current_action_transform() {
	return action_perms[current_action_id](current_action_progress);
}

var theta = 0.0;
var theta_rate = frametime / 4;

function update() {
	rotation_mat = rot_y(theta);
	rotation_mat_2 = rot_x(theta / Math.sqrt(2));
	theta += theta_rate;

	if (current_action_id != -1) {

		current_action_progress += frametime / action_duration
		if (current_action_progress >= 1) {

			var perm = instruction_values[current_action_id];
			all_values = permute(all_values, perm);

			current_action_progress = 0;
			current_action_id = Math.floor(Math.random() * 18);
		}
	}
}

// *************************************************************

const vertexShaderSource = `
	attribute vec4 aVertexPosition;
	attribute vec4 aVertexColor;
	uniform mat4 uModelViewMatrix;
	uniform mat4 uProjectionMatrix;
	varying lowp vec4 vColor;

	void main(void) {
		gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
		vColor = aVertexColor;
	}
`;

const fragmentShaderSource = `
	varying lowp vec4 vColor;
	void main(void) {
		gl_FragColor = vColor;
	}
`;

function loadShader(type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

function initShaderProgram(vsSrc, fsSrc, attribLocNames, uniformLocNames) {
	const vertexShader = loadShader(gl.VERTEX_SHADER, vsSrc);
	const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSrc);

	// Create the shader program

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	var attribLocs = {};
	for (var k = 0; k < attribLocNames.length; k++) {
		var name = attribLocNames[k];
		attribLocs[name] = gl.getAttribLocation(shaderProgram, name);
	}

	var uniformLocs = {};
	for (var k = 0; k < uniformLocNames.length; k++) {
		var name = uniformLocNames[k];
		uniformLocs[name] = gl.getUniformLocation(shaderProgram, name);
	}

	return {
		program: shaderProgram,
		attribLocs: attribLocs,
		uniformLocs: uniformLocs
	};
}

const faceColours = [
	[0.7, 0.1, 0.2, 1.0], // Red
	[0.0, 0.6, 0.1, 1.0], // Green
	[0.0, 0.3, 0.7, 1.0], // Blue
	[1.0, 0.3, 0.0, 1.0], // Orange
	[1.0, 0.8, 0.0, 1.0], // Yellow
	[1.0, 1.0, 1.0, 1.0], // White
	[0.1, 0.1, 0.1, 1.0], // Black-ish
];

const cubeDescriptors = [
	{
		position: [-2.0, -2.0, -2.0],
		faces: [6, 11, 12, -1, -1, -1]
	},
	{
		position: [2.0, -2.0, -2.0],
		faces: [7, -1, 13, -1, -1, -1]
	},
	{
		position: [2.0, -2.0, -2.0],
		faces: [8, -1, 14, 15, -1, -1]
	},
];

const cubeVeritices = [
	-1.0, -1.0, -1.0,   -1.0, -1.0,  1.0,
	-1.0,  1.0, -1.0,   -1.0,  1.0,  1.0,
	 1.0, -1.0, -1.0,    1.0, -1.0,  1.0,
	 1.0,  1.0, -1.0,    1.0,  1.0,  1.0,
];

const cubeFaceVertexIndicies = [
	2, 3, 7,    2, 7, 6, // up		0,  1,  2,      0,  2,  3,    // front
	2, 3, 0,    2, 0, 1, // left	4,  5,  6,      4,  6,  7,    // back
	1, 3, 7,    1, 7, 5, // Front	8,  9,  10,     8,  10, 11,   // top
	6, 7, 4,    6, 4, 5, // right	12, 13, 14,     12, 14, 15,   // bottom
	2, 6, 4,    2, 4, 0, // back	16, 17, 18,     16, 18, 19,   // right
	0, 4, 5,    0, 5, 1  // bottom	20, 21, 22,     20, 22, 23,   // left
];

var projectionMat = mat4.create();

var cubeVertexBuffer;
var cubeVertexColourBuffer;
var cubeFaceVertexIndexBuffer;

var theShaderProgram;

function init() {
	{
		const fieldOfView = Math.PI / 4.0;   // in radians
		const aspect = canvas.clientWidth / canvas.clientHeight
		const zNear = 0.1;
		const zFar = 100.0;

		mat4.perspective(
			projectionMatrix,
			fieldOfView,
			aspect,
			zNear,
			zFar
		);
	}

	theShaderProgram = initShaderProgram(
		vertexShaderProgramSource,
		fragmentShaderProgramSource,
		[ 'aVertexPosition', 'aVertexColor'],
		['uProjectionMatrix', 'uModelViewMatrix']
	);

	cubeVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVeritices), gl.STATIC_DRAW);

	cubeVertexColourBuffer = gl.createBuffer();
	//gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColourBuffer);
	//gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexColours), gl.STATIC_DRAW);

	cubeFaceVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeFaceVertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeFaceVertexIndicies), gl.STATIC_DRAW);
}

function update(dt) {

}

function buildVertexColourData(configIndicies, config) {
	var cubeVertexColours = [];

	for (var faceId=0; faceId<6; ++faceId) {
		var colourIndex = configIndicies[faceId];
		if (colourIndex == -1) {
			colourIndex = 6;
		} else {
			
		}
		var faceColour = faceColours[colourIndex];
		cubeVertexColours = cubeVertexColours.concat(faceColour, faceColour, faceColour, faceColour);
	}

	return cubeVertexColours;
}

function renderCube(cube, config) {
	const cubeVertexColours = buildVertexColourData(cube.faces);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColourBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexColours), gl.STATIC_DRAW);

	const modelViewMat = mat4.create();

	mat4.translate(
		modelViewMat,     // destination matrix
		modelViewMat,     // matrix to translate
		[-0.0, 0.0, -6.0] // amount to translate
	);

	mat4.rotate(
		modelViewMat,  // destination matrix
		modelViewMat,  // matrix to rotate
		cubeRotation,  // amount to rotate in radians
		[0, 1, 0]      // axis to rotate around (Z)
	);

	{
		const numComponents = 4;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColourBuffer);
		gl.vertexAttribPointer(
			theShaderProgram.attribLocs.aVertexColor,
			numComponents,
			type,
			normalize,
			stride,
			offset
		);
		gl.enableVertexAttribArray(theShaderProgram.attribLocs.aVertexColor);
	}

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeFaceVertexIndexBuffer);

	gl.useProgram(theShaderProgram.program);

	gl.uniformMatrix4fv(
		theShaderProgram.uniformLocs.uProjectionMatrix,
		false,
		projectionMatrix
	);

	gl.uniformMatrix4fv(
		theShaderProgram.uniformLocs.uModelViewMatrix,
		false,
		modelViewMatrix
	);

	{
		const vertexCount = 36;
		const type = gl.UNSIGNED_SHORT;
		const offset = 0;
		gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}
}

function render() {
	gl.clearColor(0.95, 0.95, 0.95, 1.0);
	gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	for (var i=0; i<cubeDescriptors.length; ++i) {
		renderCube(cubeDescriptors[i], defaultConfig);
	}
}

function main() {

	canvas = document.getElementById("thecanvas");
	gl = canvas.getContext("webgl");

	init();

	var then = 0;
	requestAnimationFrame(function gameloop(now) {

		const deltaTime = now - then;
		then = now;

		update(deltaTime);
		render();

		requestAnimationFrame(gameloop);
	});

	return 0;
}

window.addEventListener("load", main);