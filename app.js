const IMAGE_ELEMENT = document.querySelector('#upload-img');
const imageContainer = document.querySelector('.image-display');
const messageBody = document.querySelector('.msg');
let messageText = document.querySelector('.msg p');
let messageFaces = document.querySelector('.faces');

// LOAD MODELS ASYNCHRONOUSLY
Promise.all([
	faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
	faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
	faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
]).then(loadModels);

// FUNCTION THAT RUNS AFTER MODELS HAVE BEEN LOADED
async function loadModels() {
	// load test images
	const testImages = await loadTestImages();
	const faceMatcher = new faceapi.FaceMatcher(testImages, 0.5);
	messageText.innerHTML = 'MODEL HAS BEEN LOADED!';

	// declare variable for image and canvas
	let imageInput;
	let canvas;

	// add event to the image element when selected
	IMAGE_ELEMENT.addEventListener('change', async () => {
		// remove image and canvas when we select a new image
		if (imageInput) {
			imageInput.remove();
		}
		if (canvas) {
			canvas.remove();
		}

		// get image uploaded
		messageFaces.innerHTML = 'Loading Image....';

		console.log(IMAGE_ELEMENT);

		imageInput = await faceapi.bufferToImage(IMAGE_ELEMENT.files[0]);

		imageContainer.append(imageInput);

		// detect the number of face in the uploaded image
		messageFaces.innerHTML = 'Detecting Faces....';
		const detectedFaces = await faceapi
			.detectAllFaces(imageInput)
			.withFaceLandmarks()
			.withFaceDescriptors();
		messageFaces.innerHTML = `${detectedFaces.length} Face(s) detected`;

		// draw a box over the faces detected
		canvas = faceapi.createCanvasFromMedia(imageInput);
		imageContainer.append(canvas);

		const imageDisplaySize = {
			width: imageInput.width,
			height: imageInput.height,
		};
		faceapi.matchDimensions(canvas, imageDisplaySize);

		const resizeDetectedFaces = faceapi.resizeResults(
			detectedFaces,
			imageDisplaySize,
		);

		const matchedFaces = resizeDetectedFaces.map((faces) =>
			faceMatcher.findBestMatch(faces.descriptor),
		);

		matchedFaces.forEach((eachMatchedFace, matchedFaceIndex) => {
			const box = resizeDetectedFaces[matchedFaceIndex].detection.box;
			let labelName = eachMatchedFace.label

			const drawBox = new faceapi.draw.DrawBox(box, {
				label: `Person: ${labelName.toUpperCase()}`,
			});
			drawBox.draw(canvas);
		});
	});
}

// FUNCTION THAT LOADS THE TEST IMAGES
function loadTestImages() {
	// get the folder name of the test images
	const imageLabels = ['farouq', 'tobi', 'qudus', 'ibrahim'];

	return Promise.all(
		imageLabels.map(async (eachImageLabel) => {
			const testImagesDescriptions = [];

			for (let i = 1; i <= 2; i++) {
				const testImage = await faceapi.fetchImage(
					`./labeled_images/${eachImageLabel}/${i}.jpg`,
				);
				const facesDetected = await faceapi
					.detectSingleFace(testImage)
					.withFaceLandmarks()
					.withFaceDescriptor();
				testImagesDescriptions.push(facesDetected?.descriptor);
			}

			return new faceapi.LabeledFaceDescriptors(
				eachImageLabel,
				testImagesDescriptions,
			);
		}),
	);
}
