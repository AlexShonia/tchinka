import { TICK_MS, PLAYER_MAX_HEALTH, PLAYER_MAX_MANA } from "../../../../shared/combatConfig.js";

const NS        = "http://www.w3.org/2000/svg";
const BRASS     = "#c8963e";
const SLOT_BG   = "#2b170b";
const SLOT_SIZE = 44;
const SLOT_GAP  = 10;
const SLOT_X    = 90;   // first slot's left edge in the frame
const SLOT_Y    = 47;
const FRAME_W   = 440;
const FRAME_H   = 100;

// the liquid fills a glass bulb (circle r 29) plus its neck, from the neck top (y 8) down to the bulb bottom (y 89)
const BULB_Y     = 60;
const LIQUID_TOP = 8;
const LIQUID_H   = 81;
const XP_X       = 84;
const XP_W       = 272;

const ICON_JUMP = `<svg viewBox="0 0 40 40" width="34" height="34" fill="none" stroke-linecap="round" stroke-linejoin="round">
	<path d="M13 3v8M20 1v10M27 3v8" stroke="#ffb347" stroke-width="2"/>
	<rect x="13" y="12" width="14" height="14" transform="rotate(-8 20 19)" fill="#fff2d8" stroke="#ff8a1f" stroke-width="2"/>
	<ellipse cx="20" cy="34" rx="15" ry="3.2" stroke="#ff8a1f" stroke-width="2"/>
	<ellipse cx="20" cy="34" rx="8" ry="1.8" stroke="#ffd08a" stroke-width="1.5"/>
	<path d="M5 29l3 2M35 29l-3 2" stroke="#ffb347" stroke-width="2"/>
</svg>`;

// one entry per slot: the key shown on it, the server's ability name (none = not implemented yet), its icon and a color theme
const SLOTS = [
	{ key: "Q", ability: "jumpingAttack", icon: ICON_JUMP, accent: "#ff9a2e", glow: "#5a2608" },
	{ key: "W" },
	{ key: "E" },
	{ key: "R" },
	{ key: "T" },
];

export class Hud {
	constructor(pingService) {
		this._pingService = pingService;
		this._perfEl = document.createElement("div");
		Object.assign(this._perfEl.style, {
			position: "fixed", top: "8px", right: "12px",
			zIndex: "200", font: "12px/1.6 monospace",
			color: "#0f0", textShadow: "0 0 4px #000",
			textAlign: "right", pointerEvents: "none",
		});
		document.body.appendChild(this._perfEl);
		this._frameCount  = 0;
		this._fps         = 0;
		this._windowStart = 0;

		this._waveEl = document.createElement("div");
		Object.assign(this._waveEl.style, {
			position: "fixed", top: "10px", left: "50%", transform: "translateX(-50%)",
			color: "#fff", fontSize: "14px", fontWeight: "bold", letterSpacing: "2px",
			fontFamily: "sans-serif", pointerEvents: "none",
		});
		document.body.appendChild(this._waveEl);

		// the whole HUD is one unit: a wooden plate with a glass bulb at each end (mana left, health right), xp groove on its top edge and the ability slots on top
		const root = document.createElement("div");
		Object.assign(root.style, {
			position: "fixed", bottom: "14px", left: "50%", transform: "translateX(-50%)",
			width: `${FRAME_W}px`, height: `${FRAME_H}px`, pointerEvents: "none", fontFamily: "sans-serif",
		});
		this._frame = this._makeFrame();
		this._slots = SLOTS.map((def, i) => {
			const ui = { def, ...this._makeSlot(def) };
			Object.assign(ui.slot.style, { position: "absolute", left: `${SLOT_X + i * (SLOT_SIZE + SLOT_GAP)}px`, top: `${SLOT_Y}px` });
			return ui;
		});
		root.append(this._frame.svg, ...this._slots.map(s => s.slot));
		document.body.appendChild(root);

		this._deadEl = document.createElement("div");
		Object.assign(this._deadEl.style, {
			position: "fixed", top: "50%", left: "50%",
			transform: "translate(-50%, -50%)",
			color: "#e03030", fontSize: "52px", fontWeight: "bold",
			fontFamily: "sans-serif", letterSpacing: "4px",
			pointerEvents: "none", display: "none",
		});
		this._deadEl.textContent = "YOU DIED";
		document.body.appendChild(this._deadEl);
	}

	// plate + two bulbs drawn as one silhouette: every outline shape is stroked brass first, then all are filled over it, so inner seams vanish
	_makeFrame() {
		const L = 44, R = FRAME_W - 44;
		const outline = `
			<rect x="60" y="26" width="320" height="70" rx="12"/>
			<circle cx="${L}" cy="${BULB_Y}" r="36"/><rect x="${L - 11}" y="4" width="22" height="34" rx="5"/>
			<circle cx="${R}" cy="${BULB_Y}" r="36"/><rect x="${R - 11}" y="4" width="22" height="34" rx="5"/>`;
		const bulb = (cx, id, light, mid, dark) => `
			<clipPath id="${id}c"><circle cx="${cx}" cy="${BULB_Y}" r="29"/><rect x="${cx - 6}" y="${LIQUID_TOP}" width="12" height="34"/></clipPath>
			<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="${light}"/><stop offset="0.5" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>
			</linearGradient>
			<circle cx="${cx}" cy="${BULB_Y}" r="29" fill="#1f0f06"/><rect x="${cx - 6}" y="${LIQUID_TOP}" width="12" height="34" fill="#1f0f06"/>
			<g clip-path="url(#${id}c)">
				<rect id="${id}l" x="${cx - 40}" y="${LIQUID_TOP}" width="80" height="${LIQUID_H}" fill="url(#${id}g)"/>
				<rect id="${id}s" x="${cx - 40}" y="${LIQUID_TOP}" width="80" height="2" fill="${light}"/>
				<ellipse cx="${cx - 12}" cy="${BULB_Y - 4}" rx="4" ry="10" fill="#fff" opacity="0.22" transform="rotate(20 ${cx - 12} ${BULB_Y - 4})"/>
			</g>
			<circle cx="${cx}" cy="${BULB_Y}" r="29" fill="none" stroke="${BRASS}" stroke-width="3"/>
			<rect x="${cx - 6}" y="${LIQUID_TOP}" width="12" height="34" fill="none"/>
			<path d="M${cx - 12} 6H${cx + 12}" stroke="${BRASS}" stroke-width="5" stroke-linecap="round"/>
			<text id="${id}n" x="${cx}" y="${BULB_Y + 5}" text-anchor="middle" font-size="14" font-weight="bold" fill="#fff" style="text-shadow:0 0 3px #000"></text>`;
		const svg = document.createElementNS(NS, "svg");
		svg.setAttribute("viewBox", `0 0 ${FRAME_W} ${FRAME_H}`);
		svg.setAttribute("width", FRAME_W);
		svg.setAttribute("height", FRAME_H);
		svg.style.cssText = "position:absolute;inset:0;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.55))";
		svg.innerHTML = `
			<defs><linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a4224"/><stop offset="1" stop-color="#3b2211"/></linearGradient></defs>
			<g fill="${BRASS}" stroke="${BRASS}" stroke-width="6" stroke-linejoin="round">${outline}</g>
			<g fill="url(#wood)">${outline}</g>
			<path d="M72 31H368" stroke="#fff" stroke-opacity="0.12" stroke-width="1"/>
			<rect x="${XP_X}" y="31" width="${XP_W}" height="9" rx="4.5" fill="#24120a" stroke="${BRASS}" stroke-width="1"/>
			<clipPath id="xpc"><rect x="${XP_X}" y="31" width="${XP_W}" height="9" rx="4.5"/></clipPath>
			<g clip-path="url(#xpc)">
				<rect id="xpf" x="${XP_X}" y="31" width="0" height="9" fill="#f2c230"/>
				<rect id="xph" x="${XP_X}" y="31" width="0" height="3" fill="#fff0a0" opacity="0.6"/>
				<path d="${Array.from({ length: 15 }, (_, i) => `M${XP_X + (i + 1) * 17} 31v9`).join("")}" stroke="#24120a" stroke-opacity="0.45"/>
			</g>
			<text id="xpt" x="${FRAME_W / 2}" y="38.2" text-anchor="middle" font-size="7.5" font-weight="bold" fill="#fff" letter-spacing="1" style="text-shadow:0 0 2px #000"></text>
			${bulb(L, "mana", "#8fbcff", "#2f6bea", "#143a96")}
			${bulb(R, "hp", "#ff7a6a", "#d3262f", "#7a1016")}`;
		const get = id => svg.querySelector("#" + id);
		const gauge = id => {
			const liquid = get(id + "l"), surface = get(id + "s"), num = get(id + "n");
			return (fraction, value) => {
				const f = Math.max(0, Math.min(1, fraction));
				const y = LIQUID_TOP + LIQUID_H * (1 - f);
				liquid.setAttribute("y", y);
				surface.setAttribute("y", y);
				surface.setAttribute("opacity", f > 0 ? 1 : 0);
				num.textContent = value;
			};
		};
		const xpf = get("xpf"), xph = get("xph"), xpt = get("xpt");
		return {
			svg,
			setMana:   gauge("mana"),
			setHealth: gauge("hp"),
			setXp(fraction, level) {
				const w = XP_W * Math.max(0, Math.min(1, fraction));
				xpf.setAttribute("width", w);
				xph.setAttribute("width", w);
				xpt.textContent = `LV ${level}`;
			},
		};
	}

	_makeSlot({ key, icon, accent = "#555", glow = "#1c1c1c" }) {
		const slot = document.createElement("div");
		Object.assign(slot.style, {
			position: "relative", width: `${SLOT_SIZE}px`, height: `${SLOT_SIZE}px`, boxSizing: "border-box",
			border: "2px solid #6b4a2b", borderRadius: "6px", overflow: "hidden",
			display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
			background: icon
				? `radial-gradient(circle at 50% 75%, ${glow}, ${SLOT_BG} 75%)`
				: "repeating-linear-gradient(135deg, #3a2414 0 6px, #331e10 6px 12px)",
		});
		const iconEl = document.createElement("div");
		iconEl.innerHTML = icon ?? "";
		iconEl.style.display = "flex";
		const shade = document.createElement("div");
		Object.assign(shade.style, {
			position: "absolute", left: "0", right: "0", top: "0", height: "0",
			background: "rgba(0, 0, 0, 0.7)",
		});
		const time = this._makeLabel({ inset: "0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold" });
		const keyEl = this._makeLabel({ left: "0", right: "0", bottom: "0", textAlign: "center", fontSize: "10px", fontWeight: "bold", color: icon ? "#f3e2b3" : "#7d5c3b", background: "rgba(25,12,4,0.6)" }, key);
		const cost  = this._makeLabel({ right: "3px", top: "1px", fontSize: "11px", fontWeight: "bold", color: "#6a9cff" });
		const lock  = this._makeLabel({ inset: "0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#ccc" });
		slot.append(iconEl, shade, time, keyEl, cost, lock);
		return { slot, iconEl, shade, time, cost, lock };
	}

	_makeLabel(style, text = "") {
		const el = document.createElement("div");
		Object.assign(el.style, { position: "absolute", textShadow: "0 0 4px #000", ...style });
		el.textContent = text;
		return el;
	}

	_updateSlot(ui, ability, mana) {
		const implemented = !!ui.def.ability;
		const unlocked    = ability?.unlocked ?? false;
		const cooldown    = ability?.cooldown ?? 0;
		const fraction    = ability?.maxCooldown ? cooldown / ability.maxCooldown : 0;
		const armed       = ability?.armed ?? false;
		const noMana      = unlocked && !armed && mana < ability.manaCost;
		const accent      = ui.def.accent;
		ui.shade.style.height     = `${fraction * 100}%`;
		ui.time.textContent       = cooldown > 0 ? (cooldown * TICK_MS / 1000).toFixed(1) : "";
		ui.cost.textContent       = implemented && unlocked ? ability.manaCost : "";
		ui.cost.style.color       = noMana ? "#ff5050" : "#6a9cff";
		ui.lock.textContent       = implemented && !unlocked && ability ? `LV ${ability.unlockLevel}` : "";
		ui.iconEl.style.filter    = implemented && !unlocked ? "grayscale(1)" : noMana ? "saturate(0.4)" : "none";
		ui.iconEl.style.opacity   = implemented && !unlocked ? "0.3" : noMana ? "0.6" : "1";
		ui.slot.style.borderColor = armed ? "#ffe066" : implemented && unlocked ? accent : "#6b4a2b";
		ui.slot.style.boxShadow   = armed ? `0 0 12px 2px ${accent}, inset 0 0 10px ${accent}` : "none";
	}

	tickPerf(now) {
		this._frameCount++;
		if (this._frameCount % 10 === 0) {
			if (this._windowStart) this._fps = Math.round(10000 / (now - this._windowStart));
			this._windowStart = now;
		}
		this._perfEl.textContent = `${this._fps} fps  ${this._pingService.ms} ms`;
	}

	update(player, wave) {
		this._waveEl.textContent = `WAVE ${wave}`;
		if (!player) return;
		this._frame.setHealth(player.health / PLAYER_MAX_HEALTH, Math.ceil(player.health));
		this._frame.setMana(player.mana / PLAYER_MAX_MANA, Math.floor(player.mana));
		this._frame.setXp(player.xp / player.xpToNext, player.level);
		this._deadEl.style.display        = player.dead ? "block" : "none";
		for (const ui of this._slots)
			this._updateSlot(ui, player.abilities[ui.def.ability], player.mana);
	}
}
