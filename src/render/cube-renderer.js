import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {
  FACE_NORMALS,
  COLOR_HEX,
  buildRenderModel
} from './cube-render-model.js';
import { CameraController } from '../camera-controller.js';
import { CubeOrientationController } from '../interaction/cube-orientation-controller.js';

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
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(options.background ?? '#11151b');

    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    this.camera.position.set(5.8, 4.7, 6.6);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // The cube has no ground plane; dynamic shadow maps add GPU work without
    // meaningful visual value for this compact interactive viewer.
    this.renderer.shadowMap.enabled = false;
    container.replaceChildren(this.renderer.domElement);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x20242a, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 3.0);
    key.position.set(4, 7, 8);
    this.scene.add(key);

    this._bodyGeometry = new THREE.BoxGeometry(this.cubieSize, this.cubieSize, this.cubieSize);
    this._bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.62, metalness: 0.02 });
    this._stickerGeometry = new THREE.PlaneGeometry(this.stickerSize, this.stickerSize);
    this._stickerMaterials = Object.freeze(Object.fromEntries(
      Object.entries(COLOR_HEX).map(([color, hex]) => [color, new THREE.MeshStandardMaterial({
        color: hex,
        roughness: 0.48,
        metalness: 0,
        side: THREE.FrontSide
      })])
    ));

    this.cubeGroup = new THREE.Group();
    this.scene.add(this.cubeGroup);

    this.cameraController = new CameraController({
      camera: this.camera,
      domElement: this.renderer.domElement,
      onChange: () => {}
    });
    // The camera is a fixed viewer in Phase 5. The Rubik object itself rotates.
    this.cameraController.setPointerOrbitEnabled(false);
    this.cubeOrientationController = new CubeOrientationController({
      object: this.cubeGroup,
      camera: this.camera
    });

    this._resizeObserver = new ResizeObserver(() => this.resize());
    this._resizeObserver.observe(container);
    this.resize();

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
      group.userData.logicalPosition = [...cubie.logicalPosition];
      group.userData.cubieType = cubie.type;
      group.position.set(...cubie.renderPosition);
      group.rotation.set(0, 0, 0);
      group.scale.set(1, 1, 1);
      this._syncStickers(group, cubie.stickers);
    }

    for (const [id, group] of this.objects) {
      if (!seen.has(id)) {
        this.cubeGroup.remove(group);
        this.objects.delete(id);
      }
    }
  }

  /**
   * Return the visible sticker under a viewport client coordinate.
   * The logical face is read from the sticker mesh, while the world normal
   * is calculated from that sticker's current transform.
   */
  pickFace(clientX, clientY) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersections = this.raycaster.intersectObjects(this.cubeGroup.children, true);
    for (const hit of intersections) {
      const object = hit.object;
      if (!object.userData?.face || !object.visible) continue;
      const face = object.userData.face;
      const normal = new THREE.Vector3(...FACE_NORMALS[face])
        .applyQuaternion(object.getWorldQuaternion(new THREE.Quaternion()))
        .normalize();

      return Object.freeze({
        face,
        normal: [normal.x, normal.y, normal.z],
        cubieId: object.parent?.userData?.cubieId ?? null,
        cubieType: object.parent?.userData?.cubieType ?? null,
        logicalPosition: object.parent?.userData?.logicalPosition ? [...object.parent.userData.logicalPosition] : null,
        object
      });
    }
    return null;
  }

  resize() {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(width, height, false);
  }

  dispose() {
    this._resizeObserver.disconnect();
    this.cameraController.dispose();
    this._bodyGeometry.dispose();
    this._bodyMaterial.dispose();
    this._stickerGeometry.dispose();
    Object.values(this._stickerMaterials).forEach(material => material.dispose());
    this.renderer.dispose();
  }

  renderFrame() {
    this.renderer.render(this.scene, this.camera);
  }

  _createCubie(cubie) {
    const group = new THREE.Group();
    group.name = cubie.id;
    group.userData = { cubieId: cubie.id, cubieType: cubie.type, stickers: [] };

    const body = new THREE.Mesh(this._bodyGeometry, this._bodyMaterial);
    group.add(body);

    // A cubie can expose at most three stickers. Reuse shared geometry/materials
    // instead of allocating six meshes, six geometries, and six materials per cubie.
    for (let i = 0; i < 3; i += 1) {
      const sticker = new THREE.Mesh(this._stickerGeometry, this._stickerMaterials.yellow);
      sticker.name = `sticker-${i}`;
      sticker.visible = false;
      group.userData.stickers.push(sticker);
      group.add(sticker);
    }
    return group;
  }

  _syncStickers(group, stickers) {
    const meshes = group.userData.stickers;
    for (let i = 0; i < meshes.length; i += 1) {
      const sticker = meshes[i];
      const descriptor = stickers[i];
      sticker.visible = Boolean(descriptor);
      if (!descriptor) continue;

      const desc = FACE_AXES[descriptor.face];
      sticker.position.set(...desc.position);
      sticker.rotation.set(...desc.rotation);
      sticker.material = this._stickerMaterials[descriptor.color];
      sticker.userData.face = descriptor.face;
      sticker.userData.stickerId = descriptor.id;
    }
  }

}
