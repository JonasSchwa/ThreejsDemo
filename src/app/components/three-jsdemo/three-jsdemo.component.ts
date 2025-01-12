import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RangeCustomEvent } from '@ionic/angular';
import { AmbientLight, BoxGeometry, BufferAttribute, BufferGeometry, Clock, DirectionalLight, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, Scene, SphereGeometry, SpotLight, Texture, TextureLoader, Vector3, WebGLRenderer } from 'three'

@Component({
  selector: 'app-three-jsdemo',
  templateUrl: './three-jsdemo.component.html',
  styleUrls: ['./three-jsdemo.component.scss'],
})
export class ThreeJSDemoComponent implements OnInit, AfterViewInit {
  @ViewChild('threejs')
  private canvas!: ElementRef<HTMLCanvasElement>;
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private cube!: Mesh<BoxGeometry, MeshStandardMaterial>
  private rotationspeed = 0;
  private clock = new Clock();
  private map!: Mesh;
  private spotlight!: SpotLight;
  private spotlight2!: SpotLight;
  private plane!: Mesh<PlaneGeometry, MeshPhysicalMaterial>;

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer({ canvas: this.canvas.nativeElement, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshStandardMaterial({ color: 0xffff00 });
    this.cube = new Mesh(geometry, material);
    this.cube.position.set(0, 15, 0);
    this.cube.castShadow = true;
    this.cube.receiveShadow = true;

    const sphere = new Mesh(new SphereGeometry(3), new MeshStandardMaterial({ color: 0x0000ff }));
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.position.set(-0.5, 7, -1.5);
    this.scene.add(sphere);

    this.scene.add(this.cube);
    this.scene.add(new AmbientLight(0xFFFFFF, 0.3));


    const planeloader = new TextureLoader();
    planeloader.load('assets/maps/NormalMap(1).png', (diffuseTexture) => {
      planeloader.load('assets/maps/bildfuernormalmap.jpg', (normalTexture) => {
        const planematerial = new MeshPhysicalMaterial({
          map: diffuseTexture,
          normalMap: normalTexture,
          roughness: 0.5,
          metalness: 0.1
        })
        const planeGeometry = new PlaneGeometry(50, 50);
        this.plane = new Mesh(planeGeometry, planematerial);
        this.plane.position.set(0, 25, -25);
        this.plane.castShadow = true;
        this.plane.receiveShadow = true;
        this.scene.add(this.plane);
        this.spotlight2.target = this.plane;
      });
    });

    


    this.spotlight = new SpotLight(0xFFFFFF, 100);
    this.spotlight.position.set(0, 40, 0);
    this.spotlight.castShadow = true;
    this.spotlight.shadow.mapSize.set(4096, 4096);
    this.spotlight.shadow.bias = -0.0000000005;
    this.spotlight.shadow.camera.far = 100;
    this.scene.add(this.spotlight);

    this.spotlight2 = new SpotLight(0xFFFFFF, 200);
    this.spotlight2.position.set(0, 25, 10);
    this.spotlight2.castShadow = true;
    this.spotlight2.shadow.mapSize.set(4096, 4096);
    this.spotlight2.shadow.bias = -0.0000000005;
    this.spotlight2.shadow.camera.far = 100;
    this.scene.add(this.spotlight2);

    this.camera.position.set(50, 30, 50);
    this.camera.lookAt(0, 0, 0);

    const loader = new TextureLoader();
    loader.load('assets/maps/heightmap2.png', (texture: Texture) => this.onTextureLoaded(texture));

    this.renderer.shadowMap.enabled = true;
    this.renderer.setAnimationLoop(() => this.animate(10));
  }


  private onTextureLoaded(texture: Texture) {
    const canvas = document.createElement('canvas');
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.drawImage(texture.image, 0, 0);

    const data = context.getImageData(0, 0, canvas.width, canvas.height);
    this.generateTerrain(data);
  }

  animate(total: number) {
    const elapsed = this.clock.getDelta();
    this.cube.rotation.x += (this.rotationspeed + 1) * 1 * elapsed;
    this.cube.rotation.y += (this.rotationspeed + 1) * 1 * elapsed;
    if (this.map) {
      this.map.rotation.y += (this.rotationspeed + 1) * 0.05 * elapsed;
    }
    if (this.plane) {
      this.plane.rotation.y += (this.rotationspeed + 1) * 0.01 * elapsed
    }
    this.spotlight.rotation.y += 0.2 * elapsed;
    this.renderer.render(this.scene, this.camera);
  }

  onRotationSpeedChanged(event: Event) {
    const rangeEvent = event as RangeCustomEvent;
    this.rotationspeed = rangeEvent.detail.value as number;
  }

  private generateTerrain(pngData: ImageData) {
    const colorData = [[0.38, 0.68, 0.3], [0.8, 0.8, 0.3], [0.99, 0.99, 0.99], [0.2, 0.2, 0.5]];
    const vertices = [];

    const colors = [];
    for (let z = 0; z < pngData.height; z++) {
      for (let x = 0; x < pngData.width; x++) {
        const index = x * 4 + z * pngData.width * 4;
        const y = pngData.data[index] / 255;
        vertices.push(x - pngData.width / 2);
        vertices.push(y * 5);
        vertices.push(z - pngData.height / 2);
        if (y <= 0.1) {
          colors.push(...colorData[3], 1);
        } else if (y > 0.1 && y <= 0.5) {
          colors.push(...colorData[0], 1);
        }
        else if (y > 0.5 && y <= 0.8) {
          colors.push(...colorData[1], 1);
        } else {
          colors.push(...colorData[2], 1);
        }
      }
    }
    const indices = [];
    for (let i = 0; i < pngData.height - 1; i++) {
      const offset = i * pngData.width;
      for (let j = offset; j < offset + pngData.width - 1; j++) {
        indices.push(j);
        indices.push(j + pngData.width);
        indices.push(j + 1);

        indices.push(j + 1);
        indices.push(j + pngData.width);
        indices.push(j + 1 + pngData.width);
      }
    }
    const geometry = new BufferGeometry();
    geometry.setIndex(indices);
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 4));
    geometry.computeVertexNormals();


    const material = new MeshStandardMaterial();
    material.vertexColors = true;
    material.wireframe = false;
    material.flatShading = true;

    this.map = new Mesh(geometry, material);
    this.map.receiveShadow = true;
    this.map.castShadow = false;
    this.scene.add(this.map);

  }

}
