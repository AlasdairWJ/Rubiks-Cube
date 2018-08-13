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

const defaultConfig = [0,0,0,0,0,0,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,1,1,1,2,2,2,3,3,3,4,4,4,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,5,5,5,5,5,5];

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
	[1.0, 1.0, 1.0], // White
	[0.0, 0.6, 0.1], // Green
	[0.7, 0.1, 0.2], // Red
	[0.0, 0.3, 0.7], // Blue
	[1.0, 0.3, 0.0], // Orange
	[1.0, 0.8, 0.0], // Yellow
	[0.1, 0.1, 0.1], // Black-ish
];

const Y = true;
const N = false;
const cubeDescriptors = [
	{	position: [ -2,  2,  2],
		faces: [  6, 11, 12, -1, -1, -1] },
	{	position: [  0,  2,  2],
		faces: [  7, -1, 13, -1, -1, -1] },
	{	position: [  2,  2,  2],
		faces: [  8, -1, 14, 15, -1, -1] },
	{	position: [ -2,  0,  2],
		faces: [ -1, 23, 24, -1, -1, -1] },
	{	position: [  0,  0,  2],
		faces: [ -1, -1, 25, -1, -1, -1] },
	{	position: [  2,  0,  2],
		faces: [ -1, -1, 26, 27, -1, -1] },
	{	position: [ -2, -2,  2],
		faces: [ -1, 35, 36, -1, -1, 45] },
	{	position: [  0, -2,  2],
		faces: [ -1, -1, 37, -1, -1, 46] },
	{	position: [  2, -2,  2],
		faces: [ -1, -1, 38, 39, -1, 47] },
	{	position: [ -2,  2,  0],
		faces: [  3, 10, -1, -1, -1, -1] },
	{	position: [  0,  2,  0],
		faces: [  4, -1, -1, -1, -1, -1] },
	{	position: [  2,  2,  0],
		faces: [  5, -1, -1, 16, -1, -1] },
	{	position: [ -2,  0,  0],
		faces: [ -1, 22, -1, -1, -1, -1] },
	{	position: [  2,  0,  0],
		faces: [ -1, -1, -1, 28, -1, -1] },
	{	position: [ -2, -2,  0],
		faces: [ -1, 34, -1, -1, -1, 48] },
	{	position: [  0, -2,  0],
		faces: [ -1, -1, -1, -1, -1, 49] },
	{	position: [  2, -2,  0],
		faces: [ -1, -1, -1, 40, -1, 50] },
	{	position: [ -2,  2, -2],
		faces: [  0,  9, -1, -1, 20, -1] },
	{	position: [  0,  2, -2],
		faces: [  1, -1, -1, -1, 19, -1] },
	{	position: [  2,  2, -2],
		faces: [  2, -1, -1, 17, 18, -1] },
	{	position: [ -2,  0, -2],
		faces: [ -1, 21, -1, -1, 32, -1] },
	{	position: [  0,  0, -2],
		faces: [ -1, -1, -1, -1, 31, -1] },
	{	position: [  2,  0, -2],
		faces: [ -1, -1, -1, 29, 30, -1] },
	{	position: [ -2, -2, -2],
		faces: [ -1, 33, -1, -1, 44, 51] },
	{	position: [  0, -2, -2],
		faces: [ -1, -1, -1, -1, 43, 52] },
	{	position: [  2, -2, -2],
		faces: [ -1, -1, -1, 41, 42, 53] }
];

const cubeVeritices = [
	// Top face
	-1.0,  1.0, -1.0,
	-1.0,  1.0,  1.0,
	 1.0,  1.0,  1.0,
	 1.0,  1.0, -1.0,

	// Left face
	-1.0, -1.0, -1.0,
	-1.0, -1.0,  1.0,
	-1.0,  1.0,  1.0,
	-1.0,  1.0, -1.0,

	// Front face
	-1.0, -1.0,  1.0,
	 1.0, -1.0,  1.0,
	 1.0,  1.0,  1.0,
	-1.0,  1.0,  1.0,

	// Right face
	 1.0, -1.0, -1.0,
	 1.0,  1.0, -1.0,
	 1.0,  1.0,  1.0,
	 1.0, -1.0,  1.0,

	// Back face
	-1.0, -1.0, -1.0,
	-1.0,  1.0, -1.0,
	 1.0,  1.0, -1.0,
	 1.0, -1.0, -1.0,

	// Bottom face
	-1.0, -1.0, -1.0,
	 1.0, -1.0, -1.0,
	 1.0, -1.0,  1.0,
	-1.0, -1.0,  1.0,
];


const cubeFaceVertexIndicies = [
	0,  1,  2,      0,  2,  3,    // front
	4,  5,  6,      4,  6,  7,    // back
	8,  9,  10,     8,  10, 11,   // top
	12, 13, 14,     12, 14, 15,   // bottom
	16, 17, 18,     16, 18, 19,   // right
	20, 21, 22,     20, 22, 23,   // left
];

var cubeVertexColours = [];

var projectionMat;

var cubeVertexBuffer;
var cubeVertexColourBuffer;
var cubeFaceVertexIndexBuffer;

var theShaderProgram;

var activeConfig = defaultConfig;

var theta = 0.0;
var thetaRate = 1.0;

var currentActionId = 0;
var actionRate = 2.0;
var actionProgess = 0;

var leftFaceCubes = [0, 3, 6, 9, 12, 14, 17, 20, 23];
var rightFaceCubes = [2, 5, 8, 11, 13, 16, 19, 22, 25];
var upFaceCubes = [0, 1, 2, 9, 10, 11, 17, 18, 19];
var downFaceCubes = [6, 7, 8, 14, 15, 16, 23, 24, 25];
var frontFaceCubes = [0, 1, 2, 3, 4, 5, 6, 7, 8];
var backFaceCubes = [17, 18, 19, 20, 21, 22, 23, 24, 25];

var actions = [
	{ axis: [0, -1, 0], move: moves.U, target: upFaceCubes },
	{ axis: [0, 1, 0], move: moves.U3, target: upFaceCubes },
	{ axis: [ 1, 0, 0], move: moves.L, target: leftFaceCubes },
	{ axis: [-1, 0, 0], move: moves.L3, target: leftFaceCubes },
	{ axis: [0, 0, -1], move: moves.F, target: frontFaceCubes },
	{ axis: [0, 0, 1], move: moves.F3, target: frontFaceCubes },
	{ axis: [-1, 0, 0], move: moves.R, target: rightFaceCubes },
	{ axis: [ 1, 0, 0], move: moves.R3, target: rightFaceCubes },
	{ axis: [0, 0,  1], move: moves.B, target: backFaceCubes },
	{ axis: [0, 0, -1], move: moves.B3, target: backFaceCubes },
	{ axis: [0,  1, 0], move: moves.D, target: downFaceCubes },
	{ axis: [0, -1, 0], move: moves.D3, target: downFaceCubes },
];

function currentAction() {
	return currentActionId == -1 ? null : actions[currentActionId];
}

function init() {
	for (var i=0; i<6; ++i) {
		cubeVertexColours = cubeVertexColours.concat(faceColours[i], faceColours[i], faceColours[i], faceColours[i]);
	}

	{
		const fieldOfView = Math.PI / 4.0;   // in radians
		const aspect = canvas.clientWidth / canvas.clientHeight
		const zNear = 0.1;
		const zFar = 100.0;
		projectionMatrix = mat4.create();
		mat4.perspective(
			projectionMatrix,
			fieldOfView,
			aspect,
			zNear,
			zFar
		);
	}

	theShaderProgram = initShaderProgram(
		vertexShaderSource,
		fragmentShaderSource,
		[ 'aVertexPosition', 'aVertexColor'],
		['uProjectionMatrix', 'uModelViewMatrix']
	);

	cubeVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVeritices), gl.STATIC_DRAW);

	cubeVertexColourBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColourBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexColours), gl.STATIC_DRAW);

	cubeFaceVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeFaceVertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeFaceVertexIndicies), gl.STATIC_DRAW);
}

function update(dt) {
	theta += thetaRate * dt;

	if (currentActionId != -1) {
		actionProgess += actionRate * dt;
		if (actionProgess >= 1.0) {
			actionProgess = 0;

			activeConfig = permute(activeConfig, currentAction().move);

			currentActionId = Math.floor(12 * Math.random());
		}
	}
}

function buildVertexColourData(configIndicies, config) {
	var cubeVertexColours = [];

	for (var faceId=0; faceId<6; ++faceId) {
		var faceIndex = configIndicies[faceId];
		var colourIndex;
		if (faceIndex == -1) {
			colourIndex = 6;
		} else {
			colourIndex = config[faceIndex];
		}
		var faceColour = faceColours[colourIndex];
		cubeVertexColours = cubeVertexColours.concat(faceColour, faceColour, faceColour, faceColour);
	}

	return cubeVertexColours;
}

var distance = 20.0;	

function renderCube(cube, config) {
	const cubeVertexColours = buildVertexColourData(cube.faces, activeConfig);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColourBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexColours), gl.STATIC_DRAW);

	const modelViewMat = mat4.create();

	mat4.translate(
		modelViewMat,     // destination matrix
		modelViewMat,     // matrix to translate
		[0.0, 0.0, -distance] // amount to translate
	);

	mat4.rotate(
		modelViewMat,  // destination matrix
		modelViewMat,  // matrix to rotate
		Math.PI * Math.sin(theta) / 2.0,  // amount to rotate in radians
		[0, 0, 1]      // axis to rotate around (Y)
	);


	mat4.rotate(
		modelViewMat,  // destination matrix
		modelViewMat,  // matrix to rotate
		theta,  // amount to rotate in radians
		[0, 1, 0]      // axis to rotate around (Y)
	);
	if (currentActionId != -1) {
		if (cube.faces[Math.floor(currentActionId / 2)] != -1) {			

			mat4.rotate(
				modelViewMat,  // destination matrix
				modelViewMat,  // matrix to rotate
				actionProgess * Math.PI / 2.0,  // amount to rotate in radians
				currentAction().axis      // axis to rotate around (Y)
			);

		}
	}

	mat4.translate(
		modelViewMat,
		modelViewMat,
		cube.position
	);

	{
		const numComponents = 3;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
		gl.vertexAttribPointer(
			theShaderProgram.attribLocs.vertexPosition,
			numComponents,
			type,
			normalize,
			stride,
			offset);
		
	}
	gl.enableVertexAttribArray( theShaderProgram.attribLocs.vertexPosition);
	
	{
		const numComponents = 3;
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
	}
	gl.enableVertexAttribArray(theShaderProgram.attribLocs.aVertexColor);

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
		modelViewMat
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
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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

		const deltaTime = (now - then) / 1000.0;
		then = now;

		update(deltaTime);
		render();

		requestAnimationFrame(gameloop);
	});

	return 0;
}

window.addEventListener("load", main);