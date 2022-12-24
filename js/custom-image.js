const hiddenImgUpload = document.querySelector("#hiddenImgUpload")
var uploaded_image = "";

hiddenImgUpload.addEventListener("change", function(){
	
	const reader = new FileReader();
	
	reader.addEventListener("load", () =>  {

		uploaded_image = reader.result;
		document.getElementById("inputImg").setAttribute("src", uploaded_image);

	})

	reader.readAsDataURL(this.files[0]);

})
