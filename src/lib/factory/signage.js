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
	ctx.fillText(`${lineCount} LINES ON THE FLOOR · EACH ONE IS A PROJECT`, x, 960 - 34);
	return c;
}

/** Banner hung over each line. 1024×128. */
export function drawLineSign(code, title) {
	const [c, ctx] = canvas(1024, 128);
	ctx.fillStyle = TAPE;
	ctx.fillRect(0, 0, 1024, 128);
	ctx.fillStyle = INK;
	ctx.fillRect(0, 0, 190, 128);
	ctx.fillStyle = TAPE;
	ctx.font = `400 46px ${MONO}`;
	ctx.textBaseline = 'middle';
	ctx.fillText(code, 26, 66);

	ctx.fillStyle = INK;
	let size = 84;
	const text = title.toUpperCase();
	do {
		ctx.font = `700 ${size}px ${HEAD}`;
		size -= 4;
	} while (ctx.measureText(text).width > 1024 - 230 && size > 30);
	ctx.fillText(text, 216, 68);
	return c;
}
