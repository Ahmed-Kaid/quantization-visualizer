var slider = document.getElementById("qSlider");
var output = document.getElementById("qSliderText");
var qString = "";

if (window.location.pathname.startsWith("/de")) {
	qString = "Qualität: ";
} else {
	qString = "Quality: ";
}

output.innerHTML = qString + slider.value + "%"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = qString + this.value + "%";
	standardCompression();
} 

slider.value = 90;
output.innerHTML = qString + slider.value + "%";