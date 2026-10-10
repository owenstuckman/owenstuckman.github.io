// Canvas-drawn signage for the factory: the about boards on the back wall and the line banners.
const INK = '#1b1d1f';
const PAPER = '#f7f6f2';
const MUTED = '#5f6064';
const TAPE = '#f2b705';
const HEAD = '"Barlow Condensed", "Arial Narrow", sans-serif';
const BODY = '"Atkinson Hyperlegible", system-ui, sans-serif';
const MONO = '"Fira Code", ui-monospace, monospace';

export async function loadFonts() {
	if (typeof document === 'undefined' || !document.fonts) return;
	await Promise.allSettled([
		document.fonts.load(`700 80px ${HEAD}`),
		document.fonts.load(`400 36px ${BODY}`),
		document.fonts.load(`700 36px ${BODY}`),
		document.fonts.load(`400 24px ${MONO}`)
	]);
}

function canvas(w, h) {
	const c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	return [c, c.getContext('2d')];
}

function hazard(ctx, x, y, w, h, size = 28) {
	ctx.save();
	ctx.beginPath();
	ctx.rect(x, y, w, h);
	ctx.clip();
	ctx.fillStyle = TAPE;
	ctx.fillRect(x, y, w, h);
	ctx.fillStyle = INK;
	for (let i = -h; i < w + h; i += size * 2) {
		ctx.beginPath();
		ctx.moveTo(x + i, y + h);
		ctx.lineTo(x + i + size, y + h);
		ctx.lineTo(x + i + size + h, y);
		ctx.lineTo(x + i + h, y);
		ctx.fill();
	}
	ctx.restore();
}

/** Word-wrap `text` into `maxWidth`; returns the y after the last line. */
function wrap(ctx, text, x, y, maxWidth, lineHeight) {
	let line = '';
	for (const word of text.split(' ')) {
		const test = line ? `${line} ${word}` : word;
		if (ctx.measureText(test).width > maxWidth && line) {
			ctx.fillText(line, x, y);
			line = word;
			y += lineHeight;
		} else {
			line = test;
		}
	}
	if (line) ctx.fillText(line, x, y);
	return y + lineHeight;
}

function loadImage(src) {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => resolve(null);
		img.src = src;
	});
}

/** Main wall board: name, photo, bio. 2048×1024 (2:1). */
export async function drawAboutBoard(about) {
	const [c, ctx] = canvas(2048, 1024);
	ctx.fillStyle = PAPER;
	ctx.fillRect(0, 0, 2048, 1024);
	hazard(ctx, 0, 0, 2048, 36);

	const photo = await loadImage('/headshot.webp');
	const pw = 470;
	const ph = photo ? Math.round((pw * photo.height) / photo.width) : 400;
	const px = 2048 - 90 - pw;
	ctx.fillStyle = '#e2e0d9';
	ctx.fillRect(px - 14, 96, pw + 28, ph + 76);
	if (photo) ctx.drawImage(photo, px, 110, pw, ph);
	ctx.fillStyle = MUTED;
	ctx.font = `400 26px ${MONO}`;
	ctx.fillText('ID · VT-CS', px, 110 + ph + 44);

	const x = 90;
	const width = px - 60 - x;
	ctx.fillStyle = MUTED;
	ctx.font = `400 28px ${MONO}`;
	ctx.fillText('STATION 01 · ABOUT', x, 112);

	ctx.fillStyle = INK;
	ctx.font = `700 150px ${HEAD}`;
	ctx.fillText(about.name.toUpperCase(), x, 250);

	ctx.fillStyle = MUTED;
	ctx.font = `400 42px ${BODY}`;
	let y = wrap(ctx, about.lede, x, 330, width, 56);

	ctx.fillStyle = INK;
	ctx.font = `400 34px ${BODY}`;
	y += 18;
	for (const p of about.paragraphs) {
		y = wrap(ctx, p, x, y, width, 48) + 14;
	}
	return c;
}

/** Side board: tooling list + how to use the floor. 1024×960. */
export function drawToolingBoard(about, lineCount) {
	const [c, ctx] = canvas(1024, 960);
	ctx.fillStyle = PAPER;
	ctx.fillRect(0, 0, 1024, 960);
	hazard(ctx, 0, 0, 1024, 36);

	const x = 70;
	ctx.fillStyle = INK;
	ctx.font = `700 84px ${HEAD}`;
	ctx.fillText('TOOLING', x, 140);

	let y = 210;
	for (const item of about.tooling) {
		ctx.strokeStyle = '#cdcac2';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(x, y - 40);
		ctx.lineTo(1024 - x, y - 40);
		ctx.stroke();
		ctx.fillStyle = INK;
		ctx.font = `700 34px ${BODY}`;
		ctx.fillText(item.name, x, y);
		ctx.fillStyle = MUTED;
		ctx.font = `400 24px ${BODY}`;
		ctx.fillText(item.note, x, y + 30);
		y += 74;
	}

	ctx.fillStyle = TAPE;
	ctx.fillRect(0, 960 - 92, 1024, 92);
	ctx.fillStyle = INK;
	ctx.font = `700 40px ${HEAD}`;
	ctx.fillText(`${lineCount} PROJECTS ON THE FLOOR · CLICK ANY OF THEM`, x, 960 - 34);
	return c;
}

function fitText(ctx, text, weight, family, maxSize, minSize, maxWidth) {
	let size = maxSize;
	do {
		ctx.font = `${weight} ${size}px ${family}`;
		size -= 2;
	} while (ctx.measureText(text).width > maxWidth && size > minSize);
}

/** Banner hung over each line. 1024×128. Construction lines get hazard stripes. */
export function drawLineSign(code, title, construction = false) {
	const [c, ctx] = canvas(1024, 128);
	if (construction) hazard(ctx, 0, 0, 1024, 128, 40);
	else {
		ctx.fillStyle = TAPE;
		ctx.fillRect(0, 0, 1024, 128);
	}
	const left = 190;
	ctx.fillStyle = INK;
	ctx.fillRect(0, 0, left, 128);
	ctx.fillStyle = TAPE;
	ctx.textBaseline = 'middle';
	fitText(ctx, code, 400, MONO, 46, 24, left - 30);
	ctx.fillText(code, 20, 66);

	const text = title.toUpperCase();
	if (construction) {
		ctx.fillStyle = PAPER;
		ctx.fillRect(left + 14, 12, 1024 - left - 28, 104);
		ctx.fillStyle = INK;
		fitText(ctx, text, 700, HEAD, 62, 28, 1024 - left - 60);
		ctx.fillText(text, left + 30, 50);
		ctx.font = `400 26px ${MONO}`;
		ctx.fillStyle = MUTED;
		ctx.fillText('UNDER CONSTRUCTION', left + 30, 96);
	} else {
		ctx.fillStyle = INK;
		fitText(ctx, text, 700, HEAD, 84, 30, 1024 - left - 40);
		ctx.fillText(text, left + 26, 68);
	}
	return c;
}

/** Small plate above each station naming the stage. 512×96. */
export function drawStationLabel(label) {
	const [c, ctx] = canvas(512, 96);
	ctx.fillStyle = INK;
	ctx.fillRect(0, 0, 512, 96);
	ctx.fillStyle = TAPE;
	ctx.fillRect(0, 88, 512, 8);
	ctx.fillStyle = PAPER;
	ctx.textBaseline = 'middle';
	const text = label.toUpperCase();
	fitText(ctx, text, 700, HEAD, 58, 24, 470);
	ctx.textAlign = 'center';
	ctx.fillText(text, 256, 48);
	return c;
}

/** Rack beam label for an archived project. 512×128. */
export function drawSlotLabel(code, title) {
	const [c, ctx] = canvas(512, 128);
	ctx.fillStyle = PAPER;
	ctx.fillRect(0, 0, 512, 128);
	ctx.fillStyle = INK;
	ctx.fillRect(0, 0, 116, 128);
	ctx.fillStyle = TAPE;
	ctx.textBaseline = 'middle';
	fitText(ctx, code, 400, MONO, 34, 18, 100);
	ctx.fillText(code, 12, 66);
	ctx.fillStyle = INK;
	const text = title.toUpperCase();
	fitText(ctx, text, 700, HEAD, 52, 22, 512 - 140);
	ctx.fillText(text, 130, 66);
	return c;
}

/** Overhead zone banner, e.g. WAREHOUSE. 1024×192. */
export function drawZoneBanner(title, subtitle) {
	const [c, ctx] = canvas(1024, 192);
	ctx.fillStyle = INK;
	ctx.fillRect(0, 0, 1024, 192);
	hazard(ctx, 0, 0, 1024, 22, 22);
	hazard(ctx, 0, 170, 1024, 22, 22);
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = TAPE;
	ctx.font = `700 92px ${HEAD}`;
	ctx.fillText(title.toUpperCase(), 512, 84);
	ctx.fillStyle = PAPER;
	ctx.font = `400 26px ${MONO}`;
	ctx.fillText(subtitle.toUpperCase(), 512, 142);
	return c;
}
