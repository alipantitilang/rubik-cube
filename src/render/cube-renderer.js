import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {
  FACE_NORMALS,
  CUBE_COLORS,
  buildRenderModel
} from './cube-render-model.js';
import { CameraController } from '../camera-controller.js';

const FACE_AXES = {
  U: { position: [0, 0.491, 0], rotation: [-Math.PI / 2, 0, 0] },
  D: { position: [0, -0.491, 0], rotation: [Math.PI / 2, 0, 0] },
  R: { position: [0.491, 0, 0], rotation: [0, Math.PI / 2, 0] },
  L: { position: [-0.491, 0, 0], rotation: [0, -Math.PI / 2, 0] },
  F: { position: [0, 0, 0.491], rotation: [0, 0, 0] },
  B: { position: [0, 0, -0.491], rotation: [0, Math.PI, 0] }
};

export class RubikRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.spacing = options.spacing ?? 1.04;
    this.cubieSize = options.cubieSize ?? 0.96;
    this.stickerSize = options.stickerSize ?? 0.82;
    this.objects = new Map();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(options.background ?? '#11151b');

    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    this.camera.position.set(5.8, 4.7, 6.6);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.replaceChildren(this.renderer.domElement);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x20242a, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 3.0);
    key.position.set(4, 7, 8);
    key.castShadow = true;
    this.scene.add(key);

    this.cubeGroup = new THREE.Group();
    this.scene.add(this.cubeGroup);

    this.cameraController = new CameraController({
      camera: this.camera,
      domElement: this.renderer.domElement,
      onChange: () => {}
    });

    this._resizeObserver = new ResizeObserver(() => this.resize());
    this._resizeObserver.observe(container);
    this.resize();

    this._frame = this._frame.bind(this);
    requestAnimationFrame(this._frame);
  }

  renderCube(cubeState) {
    const model = buildRenderModel(cubeState, this.spacing);
    if (model.visibleCubieCount !== 26 || model.hasCoreCubie) {
      throw new Error('Renderer requires exactly 26 visible cubies and no core cubie.');
    }

    const seen = new Set();
    for (const cubie of model.cubies) {
      seen.add(cubie.id);
      let group = this.objects.get(cubie.id);
      if (!group) {
        group = this._createCubie(cubie);
        this.objects.set(cubie.id, group);
        this.cubeGroup.add(group);
      }
      group.position.set(...cubie.renderPosition);
      group.rotation.set(0, 0, 0);
      group.scale.set(1, 1, 1);
      this._syncStickers(group, cubie.stickers);
    }

    for (const [id, group] of this.objects) {
      if (!seen.has(id)) {
        this.cubeGroup.remove(group);
        group.traverse(obj => {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material?.dispose();
        });
        this.objects.delete(id);
      }
    }
  }

  resize() {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
  }

  dispose() {
    this._resizeObserver.disconnect();
    this.cameraController.dispose();
    this.renderer.dispose();
  }

  _createCubie(cubie) {
    const group = new THREE.Group();
    group.name = cubie.id;
    group.userData = { cubieId: cubie.id, cubieType: cubie.type };

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(this.cubieSize, this.cubieSize, this.cubieSize),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.62, metalness: 0.02 })
    );
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const stickerGeometry = new THREE.PlaneGeometry(this.stickerSize, this.stickerSize);
    for (const face of Object.keys(FACE_NORMALS)) {
      const material = new THREE.MeshStandardMaterial({
        color: CUBE_COLORS[face],
        roughness: 0.48,
        metalness: 0,
        side: THREE.FrontSide
      });
      const sticker = new THREE.Mesh(stickerGeometry.clone(), material);
      sticker.name = `sticker-${face}`;
      sticker.userData.face = face;
      sticker.visible = false;
      group.add(sticker);
    }
    return group;
  }

  _syncStickers(group, stickers) {
    const active = new Map(stickers.map(s => [s.face, s.color]));
    for (let i = 1; i < group.children.length; i++) {
      const sticker = group.children[i];
      const face = sticker.userData.face;
      const desc = FACE_AXES[face];
      sticker.visible = active.has(face);
      if (!sticker.visible) continue;
      sticker.position.set(...desc.position);
      sticker.rotation.set(...desc.rotation);
      sticker.material.color.set(CUBE_COLORS[face]);
    }
  }

  _frame() {
    this.renderer.render(this.scene, this.camera);
    this._animationFrame = requestAnimationFrame(this._frame);
  }
}
