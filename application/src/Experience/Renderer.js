import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import Experience from './Experience.js'

export default class Renderer
{
    constructor()
    {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera

        this.setInstance()
    }

    setInstance()
    {
        // Make renderer alpha:true so the CSS background beneath the canvas is visible
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        })
        this.instance.toneMapping = THREE.CineonToneMapping
        this.instance.toneMappingExposure = 1.75
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        // Make the clear color fully transparent so the page's CSS background shows through
        this.instance.setClearColor(0x000000, 0)

        // NOTE: we intentionally do not set `scene.background` here so the CSS body background
        // (the colorful low-poly gradient) remains visible behind the WebGL canvas.
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)

        // Post-processing: composer + bloom
        try {
            this.composer = new EffectComposer(this.instance)
            const renderPass = new RenderPass(this.scene, this.camera.instance)
            this.composer.addPass(renderPass)

            // increase bloom strength and slightly lower threshold so bright fireflies bloom more
            const params = { strength: 1.6, threshold: 0.12, radius: 0.9 }
            this.bloomPass = new UnrealBloomPass(new THREE.Vector2(this.sizes.width, this.sizes.height), params.strength, params.radius, params.threshold)
            this.composer.addPass(this.bloomPass)
        } catch (e) {
            // if postprocessing fails, fall back to normal rendering
            console.warn('Postprocessing not available', e)
            this.composer = null
        }
    }

    // Utilities for selective bloom
    darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' })
    materials = {}

    darkenNonBloomed(obj) {
        if (obj.isMesh) {
            this.materials[obj.uuid] = obj.material
            obj.material = this.darkMaterial
        }
    }

    restoreMaterial(obj) {
        if (obj.isMesh && this.materials[obj.uuid]) {
            obj.material = this.materials[obj.uuid]
            delete this.materials[obj.uuid]
        }
    }

    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
        try {
            if (this.composer) {
                this.composer.setSize(this.sizes.width, this.sizes.height)
            }
        } catch (e) {}
    }

    update()
    {
        if (this.composer) {
            // Selective bloom: render only objects in BLOOM_LAYER to composer
            const BLOOM_LAYER = 1

            // Darken non-bloomed objects
            this.scene.traverse(this.darkenNonBloomed.bind(this))

            // Render bloom layer to composer
            const prevAutoClear = this.instance.autoClear
            this.instance.autoClear = false
            this.camera.instance.layers.set(BLOOM_LAYER)
            this.composer.render()

            // Restore camera/layers
            this.camera.instance.layers.set(0)
            this.instance.autoClear = prevAutoClear

            // Restore materials
            this.scene.traverse(this.restoreMaterial.bind(this))

            // Render the entire scene normally on top
            this.instance.render(this.scene, this.camera.instance)
        } else {
            this.instance.render(this.scene, this.camera.instance)
        }
    }
}