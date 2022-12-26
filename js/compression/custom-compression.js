// const { dataURLtoFile } = require("image-conversion");

function customCompression() {
	// //console.log("Custom Compression");
	// Convert Input to JPG, so we can unpack it (from "js/compression/compression.js")
	const outputImg = document.getElementById("outputImg");
	var img = new Image();
	img.src = document.getElementById("inputImg").getAttribute("src");

	outputImg.setAttribute("src", "")
	outputImg.setAttribute("alt", "Custom Compression is running... Please wait.")

	// inputToJpg();
	
	qmat = []; // Generate quantization Matrix from user input 

	for (let i = 1; i <= 8; i++) {
		for (let j = 1; j <= 8; j++) {
			qmat.push(document.getElementById("m"+i+j).value);
		}
	}

	//console.log(file);

	img.addEventListener("load", _ev => {        flow(function* () {
		//console.log("doing something")
		const raw = document.createElement("canvas");
		raw.width = img.width; raw.height = img.height;
		const raw2d = raw.getContext("2d");
		raw2d.drawImage(img, 0, 0);
		// append(raw, "Raw Image");
		yield wait();
		//console.log("doing something 2")
		const rawdata = raw2d.getImageData(0, 0, raw.width, raw.height);
		//addCanvas(diff(rawdata, rawdata), "DIFF RAW: RAW");
		const rgbdata = imagedata2rgb(rawdata);
		const yuvdata = rgb2yuv(rgbdata);
		let imageyuv = null;
		{
				const rgbFromYuv = yuv2rgb(yuvdata);
				const imagedata = rgb2imagedata(rgbFromYuv);
				// addCanvas(imagedata, "YUV Converted");
				// addCanvas(diff(imagedata, rawdata), "DIFF RAW: YUV Converted");
				imageyuv = imagedata;
				yield wait();
		}
		const blocks = chunk(yuvdata);
		//{
		//    const merged = concat(blocks);
		//    const rgbFromYuv = yuv2rgb(merged);
		//    const imagedata = rgb2imagedata(rgbFromYuv);
		//    addCanvas(imagedata, "Block");
		//    yield wait();
		//}
		let imagedct = null;
		const dcts = applyDCT(blocks);
		{
				const idcts = applyIDCT(dcts);
				const merged = concat(idcts);
				const rgbFromYuv = yuv2rgb(merged);
				const imagedata = rgb2imagedata(rgbFromYuv);
				// addCanvas(imagedata, "DCT Converted");
				// addCanvas(diff(imagedata, rawdata), "DIFF RAW: DCT Converted");
				// addCanvas(diff(imagedata, imageyuv), "DIFF YUV: DCT Converted");
				imagedct = imagedata;
				yield wait();
		}
		const quants = applyQuantize(dcts);
		{
				const dequants = applyDequantize(quants);
				const idcts = applyIDCT(dequants);
				const merged = concat(idcts);
				const rgbFromYuv = yuv2rgb(merged);
				const imagedata = rgb2imagedata(rgbFromYuv);
				// addCanvas(imagedata, "Quantized");
				// addCanvas(diff(imagedata, rawdata), "DIFF RAW: Quantized");
				// addCanvas(diff(imagedata, imageyuv), "DIFF YUV: Quantized");
				// addCanvas(diff(imagedata, imagedct), "DIFF DCT: Quantized");
				//console.log(imagedata)
				var out = imagedata_to_image(imagedata);
				//console.log("Out:");
				//console.log(out.src);

				var urlCreator = window.URL || window.webkitURL;

				imageConversion.dataURLtoFile(out.src).then(res => {
					//console.log(res);
					document.getElementById("outputImg").setAttribute("src", urlCreator.createObjectURL(res));
					document.getElementById("download").setAttribute("href", urlCreator.createObjectURL(res));
					//console.log("Fully done!");
				})

			}
});
});


}

/* globals rgb2yuv, yuv2rgb, range, padding, shrink, chunks2d, concat2d,
dct2d, idct2d, uint2int, int2uint, quantize, dequantize
*/
"use strict";

function flow(gfunc) {
		return new Promise((f, r) => {
				const g = gfunc(), n = r => g.next(r), t = r => g.throw(r);
				const step = item => item.done ? f(item.value) :
									Promise.resolve(item.value).then(n, t).then(step, r);
				step(n());
		});
}
function wait(o) {
		return new Promise(f => {
				setTimeout(_ => f(o), 0);
		});
}

function addCanvas(imagedata, title) {
		const canvas = document.createElement("canvas");
		canvas.width = imagedata.width;
		canvas.height = imagedata.height;
		const c2d = canvas.getContext("2d");
		c2d.putImageData(imagedata, 0, 0);
		append(canvas, title);
}

function append(elem, title) {
		const h3 = document.createElement("h3");
		h3.textContent = title;
		const div = document.createElement("div");
		div.appendChild(h3);
		div.appendChild(elem);
		document.body.appendChild(div);
}
function diff(a, b) {
		const r = new ImageData(a.width, a.height);
		const size = r.width * r.height;
		//const d = (a, b) => a - b + 128;
		const d = (a, b) => (a - b) * 16 + 128;
		for (let i = 0; i < size; i++) {
				r.data[i * 4 + 0] = d(a.data[i * 4 + 0], b.data[i * 4 + 0]);
				r.data[i * 4 + 1] = d(a.data[i * 4 + 1], b.data[i * 4 + 1]);
				r.data[i * 4 + 2] = d(a.data[i * 4 + 2], b.data[i * 4 + 2]);
				r.data[i * 4 + 3] = 255;
		}
		return r;
}

function imagedata2rgb(imagedata) {
		const size = imagedata.width * imagedata.height;
		return {
				r: range(size, i => imagedata.data[i * 4 + 0]),
				g: range(size, i => imagedata.data[i * 4 + 1]),
				b: range(size, i => imagedata.data[i * 4 + 2]),
				w: imagedata.width, h: imagedata.height, format: "RGB"
		};
}
function rgb2imagedata(rgb) {
		const size = rgb.w * rgb.h;
		const imagedata = new ImageData(rgb.w, rgb.h);
		for (let i = 0; i < size; i++) {
				imagedata.data[i * 4 + 0] = rgb.r[i];
				imagedata.data[i * 4 + 1] = rgb.g[i];
				imagedata.data[i * 4 + 2] = rgb.b[i];
				imagedata.data[i * 4 + 3] = 255;
		}
		return imagedata;
}

// YUV blocks
function chunk(yuvdata) {
		const w = Math.ceil(yuvdata.w / 8) * 8;
		const h = Math.ceil(yuvdata.h / 8) * 8;
		const ow = yuvdata.w, oh = yuvdata.h;
		return {
				y: chunks2d(padding(yuvdata.y, ow, oh), w, h),
				u: chunks2d(padding(yuvdata.u, ow, oh), w, h),
				v: chunks2d(padding(yuvdata.v, ow, oh), w, h),
				w, h, ow, oh, format: yuvdata.format
		};
}
function concat(chunked) {
		const {w, h, ow, oh} = chunked;
		return {
				y: shrink(concat2d(chunked.y, w, h), ow, oh),
				u: shrink(concat2d(chunked.u, w, h), ow, oh),
				v: shrink(concat2d(chunked.v, w, h), ow, oh),
				w: ow, h: oh, format: chunked.format
		};
}

function applyDCT(blocks) {
		const {w, h, ow, oh, format} = blocks;
		return {
				y: blocks.y.map(block => dct2d(uint2int(block), 8, 8)),
				u: blocks.u.map(block => dct2d(uint2int(block), 8, 8)),
				v: blocks.v.map(block => dct2d(uint2int(block), 8, 8)),
				w, h, ow, oh, format
		};
}
function applyIDCT(blocks) {
		const {w, h, ow, oh, format} = blocks;
		return {
				y: blocks.y.map(block => int2uint(idct2d(block, 8, 8))),
				u: blocks.u.map(block => int2uint(idct2d(block, 8, 8))),
				v: blocks.v.map(block => int2uint(idct2d(block, 8, 8))),
				w, h, ow, oh, format
		};
}

function applyQuantize(blocks) {
		const {w, h, ow, oh, format} = blocks;
		return {
				y: blocks.y.map(block => quantize(block)),
				u: blocks.u.map(block => quantize(block)),
				v: blocks.v.map(block => quantize(block)),
				w, h, ow, oh, format
		};
}
function applyDequantize(blocks) {
		const {w, h, ow, oh, format} = blocks;
		return {
				y: blocks.y.map(block => dequantize(block)),
				u: blocks.u.map(block => dequantize(block)),
				v: blocks.v.map(block => dequantize(block)),
				w, h, ow, oh, format
		};
}

function imagedata_to_image(imagedata) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = imagedata.width;
	canvas.height = imagedata.height;
	ctx.putImageData(imagedata, 0, 0);

	var image = new Image();
	image.src = canvas.toDataURL("image/jpeg");
	//console.log(image);
	return image;
}