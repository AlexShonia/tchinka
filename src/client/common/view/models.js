import * as THREE from "three";

// Character models built from primitives. The origin is the body center, feet at local y = -0.5 and the front is +z,
// so the views can move, squash, turn and tilt the group exactly like the old box.
// userData.glow(hex) lights the whole body in one color (hit flash, armed ability, hover); 0 turns it off.

function builder() {
	const group = new THREE.Group();
	const lit   = [];
	return {
		group,
		mat(color, opts = {}) {
			const m = new THREE.MeshLambertMaterial({ color, ...opts });
			lit.push(m);
			return m;
		},
		add(geometry, material, x = 0, y = 0, z = 0, rot = [0, 0, 0], parent = group) {
			const mesh = new THREE.Mesh(geometry, material);
			mesh.position.set(x, y, z);
			mesh.rotation.set(...rot);
			parent.add(mesh);
			return mesh;
		},
		finish() {
			group.userData.glow = (hex) => lit.forEach(m => m.emissive.setHex(hex));
			return group;
		},
	};
}

const box  = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cone = (r, h, seg = 6) => new THREE.ConeGeometry(r, h, seg);

const KNIGHT_PALETTE = {
	local: { plate: 0xc9d1dc, trim: 0x7c8794, cloth: 0x2b4fa8 },
	other: { plate: 0xb9d8d6, trim: 0x6f8f8d, cloth: 0x1f8a80 },
};

// a knight in plate: great helm with a plume, pauldrons, sword in the right hand, shield on the left arm
export function createKnight(isLocal) {
	const p = KNIGHT_PALETTE[isLocal ? "local" : "other"];
	const b = builder();
	const plate = b.mat(p.plate), trim = b.mat(p.trim), cloth = b.mat(p.cloth);
	const gold  = b.mat(0xd4a72c), dark = b.mat(0x15171c), leather = b.mat(0x5a3a22);
	const blade = b.mat(0xe8eef5);

	for (const s of [-1, 1]) {
		b.add(box(0.2, 0.42, 0.24), trim,  s * 0.14, -0.3, 0);          // greaves
		b.add(box(0.22, 0.1, 0.34), dark,  s * 0.14, -0.45, 0.04);      // boots
		b.add(box(0.15, 0.4, 0.15), trim,  s * 0.4, 0.08, 0);           // arms
		b.add(new THREE.SphereGeometry(0.18, 10, 8), plate, s * 0.38, 0.33, 0); // pauldrons
		b.add(box(0.17, 0.14, 0.17), dark, s * 0.4, -0.14, 0);          // gauntlets
	}
	b.add(box(0.56, 0.5, 0.36), plate, 0, 0.12, 0);                   // torso
	b.add(box(0.4, 0.3, 0.04), trim,   0, 0.18, 0.2);                 // breastplate ridge
	b.add(box(0.58, 0.08, 0.38), leather, 0, -0.14, 0);               // belt
	b.add(box(0.5, 0.26, 0.04), cloth, 0, -0.27, 0.2);                // tabard front
	b.add(box(0.5, 0.5, 0.04), cloth, 0, 0.0, -0.2);                  // cape

	b.add(box(0.32, 0.32, 0.32), plate, 0, 0.6, 0);                   // great helm
	b.add(box(0.26, 0.05, 0.04), dark,  0, 0.62, 0.17);               // visor slit
	b.add(box(0.04, 0.2, 0.04), dark,   0, 0.52, 0.17);               // breath slit
	b.add(box(0.06, 0.1, 0.4), cloth,   0, 0.8, -0.02);               // plume
	b.add(box(0.06, 0.1, 0.18), cloth,  0, 0.74, -0.24);

	const sword = new THREE.Group();                                  // right hand (-x), pointing forward
	b.add(box(0.07, 0.03, 0.8), blade, 0, 0, 0.5, [0, 0, 0], sword);
	b.add(box(0.24, 0.05, 0.06), gold, 0, 0, 0.08, [0, 0, 0], sword);
	b.add(box(0.05, 0.05, 0.16), leather, 0, 0, -0.02, [0, 0, 0], sword);
	b.add(new THREE.SphereGeometry(0.05, 6, 6), gold, 0, 0, -0.12, [0, 0, 0], sword);
	sword.position.set(-0.4, -0.12, 0.1);
	b.group.add(sword);

	const shield = new THREE.Group();                                 // left arm (+x)
	b.add(box(0.07, 0.5, 0.36), trim, 0, 0, 0, [0, 0, 0], shield);
	b.add(box(0.08, 0.08, 0.24), gold, 0.02, 0.06, 0, [0, 0, 0], shield);
	b.add(box(0.08, 0.28, 0.08), gold, 0.02, 0.06, 0, [0, 0, 0], shield);
	shield.position.set(0.56, 0.1, 0.06);
	b.group.add(shield);

	return b.finish();
}

// a hunched stone monkey-gargoyle: long knuckle-dragging arms, horns, big ears, bat wings, glowing red eyes, a tail
export function createGargoyle() {
	const b = builder();
	const stone = b.mat(0x6b6f78), shade = b.mat(0x4a4d55), horn = b.mat(0xd9d2c0);
	const eyes  = new THREE.MeshBasicMaterial({ color: 0xff2a1a });
	const wing  = b.mat(0x3a2d3f, { side: THREE.DoubleSide });

	b.add(box(0.5, 0.46, 0.4), stone, 0, 0.02, 0, [0.35, 0, 0]);       // hunched torso
	b.add(box(0.36, 0.14, 0.3), shade, 0, -0.18, -0.02, [0.2, 0, 0]);  // hips

	const head = new THREE.Group();
	head.position.set(0, 0.34, 0.24);
	b.add(box(0.36, 0.3, 0.3), stone, 0, 0, 0, [0, 0, 0], head);
	b.add(box(0.22, 0.14, 0.18), shade, 0, -0.08, 0.2, [0, 0, 0], head);   // muzzle
	b.add(box(0.2, 0.04, 0.02), dark(b), 0, -0.14, 0.3, [0, 0, 0], head);  // mouth
	b.add(box(0.05, 0.07, 0.03), horn, -0.06, -0.19, 0.3, [0, 0, 0], head); // fangs
	b.add(box(0.05, 0.07, 0.03), horn,  0.06, -0.19, 0.3, [0, 0, 0], head);
	b.add(box(0.5, 0.06, 0.04), shade, 0, 0.09, 0.15, [0, 0, 0], head);    // brow
	for (const s of [-1, 1]) {
		b.add(box(0.07, 0.07, 0.04), eyes, s * 0.09, 0.03, 0.16, [0, 0, 0], head);
		b.add(cone(0.06, 0.28), horn, s * 0.11, 0.26, -0.02, [-0.2, 0, -s * 0.25], head);   // horns
		b.add(box(0.2, 0.22, 0.04), shade, s * 0.27, 0.06, -0.02, [0, s * 0.3, 0], head);    // ears
	}
	b.group.add(head);

	for (const s of [-1, 1]) {
		b.add(box(0.14, 0.62, 0.14), stone, s * 0.36, -0.1, 0.12, [-0.15, 0, -s * 0.12]);    // long arms
		b.add(box(0.2, 0.14, 0.22), shade, s * 0.4, -0.43, 0.2);                             // fists
		for (const c of [-1, 0, 1]) b.add(cone(0.025, 0.12, 4), horn, s * 0.4 + c * 0.06, -0.5, 0.32, [Math.PI / 2, 0, 0]); // claws
		b.add(box(0.17, 0.28, 0.2), stone, s * 0.18, -0.34, -0.04, [-0.3, 0, 0]);            // bent legs
		b.add(box(0.18, 0.08, 0.28), shade, s * 0.18, -0.46, 0.06);                          // feet

		const w = new THREE.Group();                                                          // bat wings
		w.position.set(s * 0.2, 0.25, -0.2);
		w.rotation.set(0, s * 0.5, s * 0.35);
		b.add(wingShape(s), wing, 0, 0, 0, [0, 0, 0], w);
		b.add(box(0.6, 0.04, 0.04), shade, s * 0.3, 0.02, 0, [0, 0, s * 0.1], w);
		b.group.add(w);
	}

	for (let i = 0; i < 4; i++)                                                              // curled tail
		b.add(box(0.07, 0.07, 0.2), shade, 0, -0.22 + i * 0.07 * (i > 1 ? 1 : 0.3), -0.34 - i * 0.18, [0.3 + i * 0.25, 0, 0]);
	b.add(cone(0.07, 0.18, 4), horn, 0, -0.1, -1.0, [-Math.PI / 2 - 0.9, 0, 0]);

	return b.finish();
}

function dark(b) { return b.mat(0x15171c); }

// a flat bat-wing outline (mirrored by side), lying in the x/y plane
function wingShape(side) {
	const s = new THREE.Shape();
	s.moveTo(0, 0);
	s.lineTo(side * 0.45, 0.28);
	s.lineTo(side * 0.8, 0.12);
	s.lineTo(side * 0.62, -0.04);
	s.lineTo(side * 0.74, -0.2);
	s.lineTo(side * 0.45, -0.1);
	s.lineTo(side * 0.3, -0.3);
	s.lineTo(0, -0.12);
	return new THREE.ShapeGeometry(s);
}
