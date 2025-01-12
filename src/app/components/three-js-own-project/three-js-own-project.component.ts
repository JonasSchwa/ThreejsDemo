import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RangeCustomEvent } from '@ionic/angular';
import { AmbientLight, BoxGeometry, BufferAttribute, BufferGeometry, Clock, DirectionalLight, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, Scene, SphereGeometry, SpotLight, Texture, TextureLoader, Vector3, WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


@Component({
  selector: 'app-three-js-own-project',
  templateUrl: './three-js-own-project.component.html',
  styleUrls: ['./three-js-own-project.component.scss'],
})
export class ThreeJsOwnProjectComponent implements OnInit, AfterViewInit {
  @ViewChild('threejs')
  private canvas!: ElementRef<HTMLCanvasElement>;
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private ambientLight!: AmbientLight;
  private spotlight!: SpotLight;

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer({ canvas: this.canvas.nativeElement, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    const controls = new OrbitControls(this.camera, this.canvas.nativeElement);
    controls.target.set(0, 5, 0);
    controls.update();

    const gltfLoader = new GLTFLoader();
    const url = 'assets/Blender/Threejs Projekt4.gltf';
    gltfLoader.load(url, (gltf) => {
      const root = gltf.scene;
      this.scene.add(root);
    });

    this.ambientLight = new AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    this.camera.position.set(30, 20, -30);
    this.camera.lookAt(0, 0, 0);

    this.renderer.shadowMap.enabled = true;
    const animate = () => {
      requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }
}
