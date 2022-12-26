/* from https://gist.github.com/bellbind/eb3419516e00fdfa13f472d82fd1b495 */
/* eslint no-unused-vars: 0, no-multi-spaces: 0 */
"use strict";

// [JPEG encode process]
// 1. RGB to YUV
// 2. Padding & chunk to 8x8-blocks
// 3. DCT
// 4. Quantization
// 5. zigzag scan
// 6. Huffman coding
//    a. (DC) diff array of first 0 byte of blocks
//    b. (AC) remain 1-63 bit of a block with run length only 0
// 7. pack bytes of JPEG container format


// Algorithms for JPEG processing (nothing optimized)

// array helpers
function range(n, map = v => v) {
    return Array.from(Array(n), (_, i) => map(i));
}
function split(arr, size, count) {
    return range(count, i => arr.slice(i * size, i * size + size));
}

// DCT(Discrete Cosine Transform) and IDCT(Inverse DCT) for JPEG
function dct2d(mat, w = 8, h = 8) {
    console.assert(mat.length === w * h);
    const cos = Math.cos, PI = Math.PI, isqrt2 = 1 / Math.sqrt(2);
    const px = PI / w, py = PI / h;
    return range(w * h, uvw => { // uvw = u + v * w
        const u = uvw % w, v = (uvw - u) / w;
        const c = (u === 0 ? isqrt2 : 1) * (v === 0 ? isqrt2 : 1);
        return mat.reduce((t, fxy, xyw) => { // xyw = x + y * w
            const x = xyw % w, y = (xyw - x) / w;
            return t + fxy * cos(px * (x + 0.5) * u) * cos(py * (y + 0.5) * v);
        }, 0) * c / 4;
    });
}
function idct2d(mat, w = 8, h = 8) {
    console.assert(mat.length === w * h);
    const cos = Math.cos, PI = Math.PI, isqrt2 = 1 / Math.sqrt(2);
    const px = PI / w, py = PI / h;
    return range(w * h, xyw => {
        const x = xyw % w, y = (xyw - x) / w;
        return mat.reduce((t, fuv, uvw) => {
            const u = uvw % w, v = (uvw - u) / w;
            const c = (u === 0 ? isqrt2 : 1) * (v === 0 ? isqrt2 : 1);
            return t +
                c * fuv * cos(px * (x + 0.5) * u) * cos(py * (y + 0.5) * v);
        }, 0) / 4;
    });
}


// pad 8nx8m size <=> shrink original size
function padding(mat, w, h, cw = 8, ch = 8) {
    console.assert(mat.length === w * h);
    const rw = Math.ceil(w / cw) * cw, rh = Math.ceil(h / ch) * ch;
    const extw = split(mat, w, h).map(l => {
        const last = l[l.length - 1];
        const ext = range(rw - w, _ => last);
        return l.concat(ext);
    });
    const lastl = extw[extw.length - 1];
    const extl = range(rh - h, _ => lastl.slice());
    return [].concat(...extw, ...extl);
}
function shrink(mat, w, h, cw = 8, ch = 8) {
    const rw = Math.ceil(w / cw) * cw, rh = Math.ceil(h / ch) * ch;
    console.assert(mat.length === rw * rh);
    return [].concat(
        ...split(mat, rw, rh).map(l => l.slice(0, w)).slice(0, h));
}

// block chunk list <=> full screen flat matrix
function chunks2d(mat, w, h, cw = 8, ch = 8) {
    console.assert(w % cw === 0 && h % ch === 0);
    const tw = w / cw, th = h / ch;
    return range(tw * th, ti => {
        const tx = ti % tw, ty = (ti / tw) | 0;
        const lx = tx * cw, ly = ty * ch;
        return [].concat(...range(ch, li => {
            const s = (ly + li) * w + lx;
            return mat.slice(s, s + cw);
        }));
    });
}
function concat2d(chunks, w, h, cw = 8, ch = 8) {
    console.assert(w % cw === 0 && h % ch === 0);
    const tw = w / cw, th = h / ch;
    return [].concat(...range(th, ti => {
        const tl = chunks.slice(ti * tw, ti * tw + tw);
        return [].concat(...range(ch, ci => {
            const ls = tl.map(chunk => chunk.slice(ci * cw, ci * cw + cw));
            return [].concat(...ls);
        }));
    }));
}

// 24bit RGB <=> YUV444
function yuvFactors(YR = 0.299, YB = 0.114, UB = 1 / 2, VR = 1 / 2) {
    // constraints: YR + YG + YB = 1, UR + UG + UB = 0, VR + VG + VB = 0
    //              BU * UB + YB = 1, RV * VR + YR = 1
    // [RGB<=>YUV Formula]
    // Y = YR * R + YG * G + YB * B
    // U = UR * R + UG * G + UB * B
    // V = VR * R + VG * G + VB * B
    // R = Y +  0 * U + RV * V
    // G = Y + GU * U + GV * V
    // B = Y + BU * U +  0 * V

    const RU = 0, BV = 0;
    const YG = 1 - YR - YB;   //=>  0.587
    const BU = (1 - YB) / UB; //=>  1.772
    const RV = (1 - YR) / VR; //=>  1.402
    const UR = -YR / BU;      //=> -0.168736
    const UG = -UB - UR;      //=> -0.331264
    const VB = -YB / RV;      //=> -0.081312
    const VG = -VR - VB;      //=> -0.418688
    const GU = -BU * YB / YG; //=> -0.344136
    const GV = -RV * YR / YG; //=> -0.714136
    return {
        YR, YG, YB, UR, UG, UB, VR, VG, VB,
        RU, RV, GU, GV, BU, BV
    };
}
//console.log(yuvFactors(0.299, 0.114, 0.5, 0.5)); // for JPEG
//console.log(yuvFactors(0.299, 0.114, 0.436, 0.615)); // for SDTV-BT601
//console.log(yuvFactors(0.2126, 0.0722, 0.436, 0.615)); // for HDTV-BT709
function clampUint8(n) {
    //return Math.min(Math.max(0, n), 255);
    return Math.min(Math.max(0, Math.round(n)), 255);
}
function rgb2yuv(rgb) {
    const {YR, YG, YB, UR, UG, UB, VR, VG, VB} = yuvFactors();
    return {
        y: rgb.r.map((r, i) => {
            const g = rgb.g[i], b = rgb.b[i];
            return clampUint8(YR * r + YG * g + YB * b);
        }),
        u: rgb.r.map((r, i) => {
            const g = rgb.g[i], b = rgb.b[i];
            return clampUint8(128 + UR * r + UG * g + UB * b);
        }),
        v: rgb.r.map((r, i) => {
            const g = rgb.g[i], b = rgb.b[i];
            return clampUint8(128 + VR * r + VG * g + VB * b);
        }),
        w: rgb.w, h: rgb.h, format: "RGB"
    };
}
function yuv2rgb(yuv) {
    const {RU, RV, GU, GV, BU, BV} = yuvFactors();
    return {
        r: yuv.y.map((y, i) => {
            const u = yuv.u[i] - 128, v = yuv.v[i] - 128;
            return clampUint8(y + RU * u + RV * v);
        }),
        g: yuv.y.map((y, i) => {
            const u = yuv.u[i] - 128, v = yuv.v[i] - 128;
            return clampUint8(y + GU * u + GV * v);
        }),
        b: yuv.y.map((y, i) => {
            const u = yuv.u[i] - 128, v = yuv.v[i] - 128;
            return clampUint8(y + BU * u + BV * v);
        }),
        w: yuv.w, h: yuv.h, format: "YUV444"
    };
}

// 0-255(stored color) <=> -128-127(for DCT)
function uint2int(mat) {
    return mat.map(v => v - 128);
}
function int2uint(mat) {
    return mat.map(v => v + 128);
}

// quantization <=> dequantization
var qmat = [
    16,  11,  10,  16,  24,  40,  51,  61,
    12,  12,  14,  19,  26,  58,  60,  55,
    14,  13,  16,  24,  40,  57,  69,  56,
    14,  17,  22,  29,  51,  87,  80,  62,
    18,  22,  37,  56,  68, 109, 103,  77,
    24,  35,  55,  64,  81, 104, 113,  92,
    49,  64,  78,  87, 103, 121, 120, 101,
    72,  92,  95,  98, 112, 100, 103,  99];
function quantize(color8x8) {
    return color8x8.map((c, i) => Math.round(c / qmat[i]));
}
function dequantize(quant8x8) {
    return quant8x8.map((q, i) => q * qmat[i]);
}

// chunk square array <=> zigzag scan array
function square2zigzag(square, w = 8) {
    console.assert(square.length === w * w);
    const zigzag = Array(square.length);
    const max = 2 * (w - 1);
    let i = 0;
    for (let sum = 0; sum <= max; sum++) {
        const start = sum < w ? 0 : sum - w + 1, end = sum < w ? sum : w - 1;
        if (sum % 2 === 0) {
            for (let x = start; x <= end; x++) {
                const y = sum - x;
                zigzag[i++] = square[y * w + x];
            }
        } else {
            for (let x = end; x >= start; x--) {
                const y = sum - x;
                zigzag[i++] = square[y * w + x];
            }
        }
    }
    return zigzag;
}
function zigzag2square(zigzag, w = 8) {
    console.assert(zigzag.length === w * w);
    const square = Array(zigzag.length);
    const max = 2 * (w - 1);
    let i = 0;
    for (let sum = 0; sum <= max; sum++) {
        const start = sum < w ? 0 : sum - w + 1, end = sum < w ? sum : w - 1;
        if (sum % 2 === 0) {
            for (let x = start; x <= end; x++) {
                const y = sum - x;
                square[y * w + x] = zigzag[i++];
            }
        } else {
            for (let x = end; x >= start; x--) {
                const y = sum - x;
                square[y * w + x] = zigzag[i++];
            }
        }
    }
    return square;
}


// huffman coding
// encode
function distribution(nums) {
    const dist = new Map();
    nums.forEach(n => dist.set(n, (dist.get(n) || 0) + 1));
    return Array.from(dist, kv => ({value: kv[0], count: kv[1]}));
}
function huffmanTree(nums) {
    const queue = distribution(nums).sort((a, b) => a.count - b.count);
    while (queue.length > 1) {
        const left = queue.shift();
        const right = queue.shift();
        const count = left.count + right.count;
        const index = queue.findIndex(n => n.count > count);
        queue.splice(index < 0 ? queue.length : index, 0,
                     {left, right, count});
    }
    return queue[0];
}
function huffmanTable(nums) {
    const tree = huffmanTree(nums);
    const table = new Map();
    (function walk(node, bits) {
        if (Reflect.has(node, "value")) {
            table.set(node.value, bits);
        } else {
            walk(node.left, bits.concat([0]));
            walk(node.right, bits.concat([1]));
        }
    })(tree, []);
    return table;
}
function huffmanEncode(nums) {
    const table = huffmanTable(nums);
    // pack from upper bits
    const bytes = [];
    let byte = 0, top = 7;
    nums.forEach(n => {
        table.get(n).forEach(b => {
            if (b) byte |= 1 << top; // put 1 to cursor
            top--;
            if (top < 0) {
                bytes.push(byte);
                byte = 0;
                top = 7;
            }
        });
    });
    if (top !== 7) bytes.push(byte);
    return {bytes, table, length: nums.length};
}
// decode (very slow)
function table2tree(table) {
    const ts = Array.from(table, kv => ({value: kv[0], bits: kv[1]}));
    return (function make(ts, top) {
        if (ts.length === 1) return ts[0];
        return [
            make(ts.filter(t => t.bits[top] === 0), top + 1),
            make(ts.filter(t => t.bits[top] === 1), top + 1),
        ];
    })(ts, 0);
}
function huffmanDecode({bytes, table, length}) {
    const tree = table2tree(table);
    //console.dir(tree, {depth: 6});
    const nums = [];
    let cur = tree, bindex = 0, byte = bytes[0], top = 7;
    while (nums.length < length) {
        // read 1 bit
        const b = (byte & (1 << top)) >>> top;
        top--;
        if (top < 0) {
            byte = bytes[++bindex];
            top = 7;
        }
        // walk huffman tree
        cur = cur[b];
        if (Reflect.has(cur, "value")) {
            nums.push(cur.value);
            cur = tree;
        }
    }
    return nums;
}


// packing as run length of former 0
function nums2zerorun(nums) {
    let zeros = 0;
    const r = [];
    nums.forEach(value => {
        if (value === 0) {
            zeros++;
        } else {
            r.push({zeros, value});
            zeros = 0;
        }
    });
    return r;
}
function zerorun2nums(zerolength, length = 63) {
    const decoded = [].concat(...zerolength.map(
        ({zeros, value}) => Array(zeros).fill(0).concat([value])));
    return decoded.concat(Array(length - decoded.length).fill(0));
}
