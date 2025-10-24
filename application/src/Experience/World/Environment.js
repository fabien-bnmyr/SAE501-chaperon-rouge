import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        // Debug
        if (this.debug && this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('environment')
        }

        this.setLights()
    }

    setLights() {
        // Ambient Light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
        this.scene.add(this.ambientLight)

        // Point lights
        this.pointLights = []
        const lightIntensity = 1.2

        const lantern1 = new THREE.PointLight(0xffffff, lightIntensity, 0)
        lantern1.position.set(1.6, 1.5, 1.97)
        lantern1.castShadow = true
        lantern1.shadow.mapSize.set(1024, 1024)
        this.scene.add(lantern1)
        if (this.debug && this.debug.active) {
            this.scene.add(new THREE.PointLightHelper(lantern1, 0.3))
        }
        this.pointLights.push(lantern1)

        const lantern2 = new THREE.PointLight(0xffffff, lightIntensity, 0)
        lantern2.position.set(2.92, 1.5, 1.97)
        lantern2.castShadow = true
        lantern2.shadow.mapSize.set(1024, 1024)
        this.scene.add(lantern2)
        if (this.debug && this.debug.active) {
            this.scene.add(new THREE.PointLightHelper(lantern2, 0.3))
        }
        this.pointLights.push(lantern2)

        const lantern3 = new THREE.PointLight(0xffffff, lightIntensity, 0)
        lantern3.position.set(1.6, 1.5, 3.52)
        lantern3.castShadow = true
        lantern3.shadow.mapSize.set(1024, 1024)
        this.scene.add(lantern3)
        if (this.debug && this.debug.active) {
            this.scene.add(new THREE.PointLightHelper(lantern3, 0.3))
        }
        this.pointLights.push(lantern3)

        const lantern4 = new THREE.PointLight(0xffffff, lightIntensity, 0)
        lantern4.position.set(2.92, 1.5, 3.52)
        lantern4.castShadow = true
        lantern4.shadow.mapSize.set(1024, 1024)
        this.scene.add(lantern4)
        if (this.debug && this.debug.active) {
            this.scene.add(new THREE.PointLightHelper(lantern4, 0.3))
        }
        this.pointLights.push(lantern4)


        const fire = new THREE.PointLight(0xFF7C12, 2, 15)
        fire.position.set(0.5, 0.4, 4.1)
        fire.castShadow = true
        fire.shadow.mapSize.set(1024, 1024)
        this.scene.add(fire)
        if (this.debug && this.debug.active) {
            this.scene.add(new THREE.PointLightHelper(fire, 0.3))
        }
        this.pointLights.push(fire)

        // Debug controls
        if (this.debug && this.debug.active) {
            this.debugFolder
                .add(this.ambientLight, 'intensity')
                .name('ambientIntensity')
                .min(0)
                .max(2)
                .step(0.01)
        }
    }
}