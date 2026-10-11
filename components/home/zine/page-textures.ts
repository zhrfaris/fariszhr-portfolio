import * as THREE from "three";

/**
 * One page face: an image URL (the home zine's pre-composed artwork), or a
 * function that draws the face on demand (the photo viewer composes each face
 * from its photos into a canvas).
 */
export type PageSource = string | (() => Promise<HTMLCanvasElement>);

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
  private textures: (THREE.Texture | null)[];
  private pending = new Set<number>();
  readonly placeholder: THREE.Texture;

  constructor(
    private anisotropy: number,
    private onLoad: (index: number) => void,
    private pages: PageSource[],
    /** The home zine loops; a book that doesn't has nothing past its ends. */
    private loop = true,
  ) {
    this.textures = pages.map(() => null);
    const swatch = new Uint8Array([0xf7, 0xf7, 0xf5, 0xff]);
    this.placeholder = new THREE.DataTexture(swatch, 1, 1);
    this.placeholder.needsUpdate = true;
  }

  /** A looping book wraps a page index past either end; otherwise it's -1. */
  private wrap(index: number) {
    const n = this.pages.length;
    if (!this.loop) return index >= 0 && index < n ? index : -1;
    return ((index % n) + n) % n;
  }

  /** Best available artwork for a page index — never null, so the scene always draws. */
  get(index: number): THREE.Texture {
    const i = this.wrap(index);
    return (i >= 0 && this.textures[i]) || this.placeholder;
  }

  has(index: number) {
    return index >= 0 && index < this.pages.length && !!this.textures[index];
  }

  private store(index: number, texture: THREE.Texture) {
    texture.anisotropy = this.anisotropy;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    this.textures[index] = texture;
    this.pending.delete(index);
    this.onLoad(index);
  }

  load(raw: number) {
    const index = this.wrap(raw);
    if (index < 0 || this.textures[index] || this.pending.has(index)) return;

    this.pending.add(index);
    const source = this.pages[index];
    if (typeof source === "string") {
      this.loader.load(source, (texture) => this.store(index, texture));
    } else {
      source()
        .then((canvas) => this.store(index, new THREE.CanvasTexture(canvas)))
        .catch(() => this.pending.delete(index));
    }
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
    this.textures = this.pages.map(() => null);
    this.placeholder.dispose();
  }
}
