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
		this._frameCount = 0;
		this._fps        = 0;
		this._prevNow    = 0;

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

		this._healthBar = this._makeBar("#e03030");
		this._manaBar   = this._makeBar("#2255cc", false);

		root.appendChild(this._waveEl);
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
		if (this._frameCount % 10 === 0)
			this._fps = Math.round(1000 / (now - (this._prevNow || now)));
		this._prevNow = now;
		this._perfEl.textContent = `${this._fps} fps  ${this._pingService.ms} ms`;
	}

	update(player, wave) {
		this._waveEl.textContent = `WAVE ${wave}`;
		if (!player) return;
		this._healthBar.fill.style.width = `${(player.health / 100) * 100}%`;
		this._manaBar.fill.style.width   = `${(player.mana   / 100) * 100}%`;
		this._deadEl.style.display       = player.dead ? "block" : "none";
	}
}
