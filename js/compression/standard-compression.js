function standardCompression() {
	inputToJpg();

	var urlCreator = window.URL || window.webkitURL;
	
	imageConversion.compress(file,{
		quality: slider.value / 100,
		type: "image/jpeg",
		scale: 1
	}).then(res=>{
		document.getElementById("outputImg").setAttribute("src", urlCreator.createObjectURL(res));
		document.getElementById("download").setAttribute("href", urlCreator.createObjectURL(res));
  });
}