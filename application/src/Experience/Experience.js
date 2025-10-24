import * as THREE from 'three'

import Debug from './Utils/Debug.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'

import sources from './sources.js'

let instance = null

export default class Experience
{
    constructor(_canvas)
    {
        // Singleton
        if(instance)
        {
            return instance
        }
        instance = this
        
        // Global access
        window.experience = this

        // Options
        this.canvas = _canvas

        // Setup
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
    // Add a soft, fanciful fog for the fairy-tale atmosphere
    // Use FogExp2 for a smooth exponential falloff
    const fogColor = new THREE.Color(0.08, 0.06, 0.12) // base twilight
    // tint slightly warm/pinkish
    fogColor.lerp(new THREE.Color(0.9, 0.72, 0.84), 0.06)
    this.scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.02)
        this.resources = new Resources(sources)
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.world = new World()

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        // Time tick event
        this.time.on('tick', () =>
        {
            this.update()
        })

        // Optional debug UI to tweak fog if debug is active
        try {
            if (this.debug && this.debug.active && this.debug.ui) {
                const folder = this.debug.ui.addFolder('fog')
                folder.addColor({ color: `#${this.scene.fog.color.getHexString()}` }, 'color').onChange((v) => {
                    this.scene.fog.color.set(v)
                })
                folder.add(this.scene.fog, 'density', 0.0, 0.2, 0.001)
            }
        } catch (e) {}
    }

    resize()
    {
        this.camera.resize()
        this.renderer.resize()
    }

    update()
    {
        this.camera.update()
        this.world.update()
        this.renderer.update()
    }

    destroy()
    {
        this.sizes.off('resize')
        this.time.off('tick')

        // Traverse the whole scene
        this.scene.traverse((child) =>
        {
            // Test if it's a mesh
            if(child instanceof THREE.Mesh)
            {
                child.geometry.dispose()

                // Loop through the material properties
                for(const key in child.material)
                {
                    const value = child.material[key]

                    // Test if there is a dispose function
                    if(value && typeof value.dispose === 'function')
                    {
                        value.dispose()
                    }
                }
            }
        })

        this.camera.controls.dispose()
        this.renderer.instance.dispose()

        if(this.debug.active)
            this.debug.ui.destroy()
    }
}