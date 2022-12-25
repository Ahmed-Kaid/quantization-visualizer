const hiddenImgUpload = document.querySelector("#hiddenImgUpload")
var uploaded_image = "";

hiddenImgUpload.addEventListener("change", function(){

	// Read uploaded image and replace left image with it

	const reader = new FileReader();
	
	reader.addEventListener("load", () =>  {

		uploaded_image = reader.result;
		document.getElementById("inputImg").setAttribute("src", uploaded_image);

	})

	reader.readAsDataURL(this.files[0]);
	
	file = this.files[0]

	// Start compression with current image

	if (document.getElementById("standardRadio").checked) {
		standardCompression();
	} else {
		customCompression();
	}

})