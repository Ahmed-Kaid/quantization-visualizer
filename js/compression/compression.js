fetch("img/example.jpg").then(res => res.blob()).then(blob => file = blob).then(file => file.name = "example.jpg");

function inputToJpg() {
	var urlCreator = window.URL || window.webkitURL;

	if (file.name.endsWith("jpg") || file.name.endsWith("jpeg")) {
		document.getElementById("inputImg").setAttribute("src", urlCreator.createObjectURL(file));
		return
	}

  imageConversion.compress(file,{
		quality: 1,
		type: "image/jpeg",
		scale: 1
	}).then(res=>{
		document.getElementById("inputImg").setAttribute("src", urlCreator.createObjectURL(res));
  });
}