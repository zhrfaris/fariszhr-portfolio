import * as THREE from "three";

import { ZINE_PAGES } from "@/content/home";

/**
 * Page artwork, loaded on demand.
 *
 * The twelve spreads are large photographs, so loading all of them up front
 * would cost tens of megabytes before the first paint. Instead each page is
 * fetched when the reader is one turn away from needing it, and until it lands
 * the material samples a flat paper swatch — the same colour as the sheet
 * underneath, so a page that has not arrived reads as blank rather than broken.
 */
export class PageTextures {
  private loader = new THREE.TextureLoader();
  private textures: (THREE.Texture | null)[] = ZINE_PAGES.map(() => null);
  private pending = new Set<number>();
  readonly placeholder: THREE.Texture;

  constructor(
    private anisotropy: number,
    private onLoad: (index: number) => void,
  ) {
    const swatch = new Uint8Array([0xf7, 0xf7, 0xf5, 0xff]);
    this.placeholder = new THREE.DataTexture(swatch, 1, 1);
    this.placeholder.needsUpdate = true;
  }

  /** Best available artwork for a page index — never null, so the scene always draws. */
  get(index: number): THREE.Texture {
    return this.textures[index] ?? this.placeholder;
  }

  has(index: number) {
    return index >= 0 && index < ZINE_PAGES.length && !!this.textures[index];
  }

  load(index: number) {
    if (
      index < 0 ||
      index >= ZINE_PAGES.length ||
      this.textures[index] ||
      this.pending.has(index)
    )
      return;

    this.pending.add(index);
    this.loader.load(ZINE_PAGES[index], (texture) => {
      texture.anisotropy = this.anisotropy;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.generateMipmaps = true;
      this.textures[index] = texture;
      this.pending.delete(index);
      this.onLoad(index);
    });
  }

  /** The open spread plus the two pages a turn in either direction would reveal. */
  loadAround(spread: number) {
    [
      spread * 2,
      spread * 2 + 1,
      spread * 2 + 2,
      spread * 2 + 3,
      spread * 2 - 2,
      spread * 2 - 1,
    ].forEach((i) => this.load(i));
  }

  dispose() {
    this.textures.forEach((t) => t?.dispose());
    this.textures = ZINE_PAGES.map(() => null);
    this.placeholder.dispose();
  }
}
