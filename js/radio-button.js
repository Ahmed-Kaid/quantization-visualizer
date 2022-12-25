function disableMatrix() {
	for (let i = 1; i < 9; i++) {
		for (let j = 1; j < 9; j++) {
			document.getElementById("m"+i+j).setAttribute("disabled", "true");
		}
	}
}

function enableMatrix() {
	for (let i = 1; i < 9; i++) {
		for (let j = 1; j < 9; j++) {
			document.getElementById("m"+i+j).removeAttribute("disabled");
		}
	}
}

function disableSlider() {
	document.getElementById("qSlider").setAttribute("disabled", "true");
}

function enableSlider() {
	document.getElementById("qSlider").removeAttribute("disabled");
}

document.getElementById("standardRadio").checked = true;
document.getElementById("customRadio").checked = false;
disableMatrix();
enableSlider();
