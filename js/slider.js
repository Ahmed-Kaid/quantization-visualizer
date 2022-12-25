var slider = document.getElementById("qSlider");
var output = document.getElementById("qSliderText");
output.innerHTML = "Quality: " + slider.value + "%"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = "Quality: " + this.value + "%";
	standardCompression();
} 

slider.value = 90;
output.innerHTML = "Quality: " + slider.value + "%";