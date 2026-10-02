import { TICK_MS } from "../../../../shared/combatConfig.js";

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

		const root = document.createElement("div");
		Object.assign(root.style, {
			position: "fixed", bottom: "24px", left: "50%",
			transform: "translateX(-50%)",
			display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
			width: "340px", pointerEvents: "none", fontFamily: "sans-serif",
		});

		this._waveEl = document.createElement("div");
		Object.assign(this._waveEl.style, {
			color: "#fff", fontSize: "14px", fontWeight: "bold", letterSpacing: "2px",
		});

		this._jumpSlot  = this._makeAbilitySlot("Q");
		this._healthBar = this._makeBar("#e03030");
		this._manaBar   = this._makeBar("#2255cc", false);

		root.appendChild(this._waveEl);
		root.appendChild(this._jumpSlot.slot);
		root.appendChild(this._healthBar.wrap);
		root.appendChild(this._manaBar.wrap);
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

	_makeAbilitySlot(label) {
		const slot = document.createElement("div");
		Object.assign(slot.style, {
			position: "relative", width: "52px", height: "52px", boxSizing: "border-box",
			background: "#222", border: "2px solid #555", borderRadius: "6px", overflow: "hidden",
			display: "flex", alignItems: "center", justifyContent: "center",
			color: "#fff", fontSize: "22px", fontWeight: "bold",
		});
		slot.textContent = label;
		const shade = document.createElement("div");
		Object.assign(shade.style, {
			position: "absolute", left: "0", right: "0", top: "0", height: "0",
			background: "rgba(0, 0, 0, 0.7)",
		});
		const time = document.createElement("div");
		Object.assign(time.style, {
			position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center",
			fontSize: "15px", textShadow: "0 0 4px #000",
		});
		slot.append(shade, time);
		return { slot, shade, time };
	}

	_updateAbilitySlot(ui, ability) {
		const cooldown = ability?.cooldown ?? 0;
		const fraction = ability?.maxCooldown ? cooldown / ability.maxCooldown : 0;
		const armed    = ability?.armed ?? false;
		ui.shade.style.height     = `${fraction * 100}%`;
		ui.time.textContent       = cooldown > 0 ? (cooldown * TICK_MS / 1000).toFixed(1) : "";
		ui.slot.style.borderColor = armed ? "#ffcc33" : "#555";
		ui.slot.style.boxShadow   = armed ? "0 0 10px #ffcc33" : "none";
	}

	_makeBar(color, smooth = true) {
		const wrap = document.createElement("div");
		Object.assign(wrap.style, {
			width: "100%", height: "14px",
			background: "#222", borderRadius: "3px", overflow: "hidden",
		});
		const fill = document.createElement("div");
		Object.assign(fill.style, {
			height: "100%", width: "100%", background: color,
			...(smooth ? { transition: "width 0.15s" } : {}),
		});
		wrap.appendChild(fill);
		return { wrap, fill };
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
		this._healthBar.fill.style.width = `${(player.health / 100) * 100}%`;
		this._manaBar.fill.style.width   = `${(player.mana   / 100) * 100}%`;
		this._deadEl.style.display       = player.dead ? "block" : "none";
		this._updateAbilitySlot(this._jumpSlot, player.abilities.jumpingAttack);
	}
}
