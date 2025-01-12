import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RangeCustomEvent } from '@ionic/angular';
import { AmbientLight, AnimationMixer, BoxGeometry, BufferAttribute, BufferGeometry, Clock, DirectionalLight, DirectionalLightHelper, DoubleSide, EquirectangularReflectionMapping, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, PointLightHelper, Raycaster, Scene, SphereGeometry, SpotLight, Texture, TextureLoader, Vector2, Vector3, WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';


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
  private mixer!: AnimationMixer;
  private clock = new Clock;

  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private selectedObject: Mesh | null = null;

  //light 
  private directionalLight!: DirectionalLight;
  private rotatingLight!: PointLight;
  private lightAngle!: number;


  //geometies
  private floorplane!: Mesh<PlaneGeometry, MeshStandardMaterial>;
  private cube!: Mesh<BoxGeometry, MeshPhongMaterial>;

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    //init
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer({ canvas: this.canvas.nativeElement, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    const textureLoader = new TextureLoader();

    const controls = new OrbitControls(this.camera, this.canvas.nativeElement);
    controls.target.set(0, 5, 0);
    controls.update();

    //hdr
    new RGBELoader().load('assets/hdr/rogland_clear_night_2k.hdr', (texture) => {
      texture.mapping = EquirectangularReflectionMapping;

      this.scene.background = texture;
      this.scene.environment = texture;

    });

    //load 3D graphics
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('assets/Blender/Threejs Projekt4.gltf', (gltf) => {
      const model = gltf.scene;

      model.traverse((child) => {
        if (child as Mesh) {
          const mesh = child;
          console.log(`Object name: ${mesh.name}`);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });
      this.mixer = new AnimationMixer(gltf.scene);
      const action = this.mixer.clipAction(gltf.animations[0]);
      action.play();

      this.scene.add(model);
    });

    //textures
    const floorTexture = textureLoader.load('assets/textures/wooden-textured-background.jpg');
    const floorNormalMap = textureLoader.load('assets/textures/wooden-textured-background-normal.png');

    const cubeTexture = textureLoader.load('assets/textures/jormungandr.jpg')
    const cubeHeightMap = textureLoader.load('assets/textures/jormungandrNormalMap.png');

    //geometries
    const floorGeometry = new PlaneGeometry(100, 100);
    const cubeGeometry = new BoxGeometry(5,5,5);

    //materials
    const floorMaterial = new MeshStandardMaterial({ map: floorTexture, displacementMap: floorNormalMap, color: 0x654321, side: DoubleSide });
    const cubeMaterial = new MeshPhongMaterial({map:cubeTexture, bumpMap: cubeHeightMap, bumpScale: 1, color: 0x6cfff4, specular: 0x111111, shininess: 30});

    //apply material + geometry
    this.floorplane = new Mesh(floorGeometry, floorMaterial);
    this.floorplane.rotation.x = -Math.PI / 2;
    this.floorplane.position.y = 1.6;

    this.cube = new Mesh(cubeGeometry, cubeMaterial);
    this.cube.position.set(30, 20, 0);

    //shadows
    this.floorplane.receiveShadow = true;
    this.floorplane.castShadow = true;

    this.cube.receiveShadow = true;
    this.cube.castShadow = true;

    // add everything to the scene
    this.scene.add(this.floorplane);
    this.scene.add(this.cube);


    //light

    this.directionalLight = new DirectionalLight(0xffffff, 4);
    this.directionalLight.castShadow = true;
    this.directionalLight.position.set(-55, 20, -5);
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;

    this.directionalLight.shadow.camera.left = -100;
    this.directionalLight.shadow.camera.right = 100;
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
    this.directionalLight.shadow.camera.near = 1;
    this.directionalLight.shadow.camera.far = 200;

    this.rotatingLight = new PointLight(0xffffff,5 ,20);
    this.rotatingLight.position.set(40, 20, 0);


    const directionalLightHelper = new DirectionalLightHelper(this.directionalLight, 5);
    this.scene.add(directionalLightHelper);
    const rotatingLightHelper = new PointLightHelper(this.rotatingLight, 1);
    this.scene.add(rotatingLightHelper);

    this.scene.add(this.directionalLight);
    this.scene.add(this.rotatingLight);

    //camera
    this.camera.position.set(-25, 10, -5);
    this.camera.lookAt(0, 0, 0);

    this.canvas.nativeElement.addEventListener('click', this.onClick.bind(this));

    const animate = () => {
      const delta = this.clock.getDelta();

      requestAnimationFrame(animate);

      if (this.mixer) {
        this.mixer.update(delta)
      }

      this.cube.rotation.x += 0.001;
      this.cube.rotation.y += 0.001;
      this.cube.rotation.z += 0.001;

      this.lightAngle += 0.01;
      const radius = 10;

      this.rotatingLight.position.x = Math.cos(this.lightAngle) * radius;
      this.rotatingLight.position.z = Math.sin(this.lightAngle) * radius;
      this.rotatingLight.position.y = 10;

      this.rotatingLight.lookAt(this.cube.position);

      if (this.selectedObject) {
        this.selectedObject.position.z -= 0.001;
      }
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }
  onClick(event: MouseEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      console.log('Intersected objects:', intersects);

      if (object.name === 'Cylinder007_1') {
        this.selectedObject = object as Mesh;
      }
    }
  }
}
