import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas

        this.setInstance()
        this.setControls()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 100)
        this.instance.position.set(5, 2, 5)
        this.scene.add(this.instance)
    }

    setControls()
    {
        // Keep OrbitControls for damping and potential programmatic use, but disable user interaction
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
        this.controls.enablePan = false
        this.controls.enableRotate = false
        this.controls.enableZoom = false

        // Automated subtle motion parameters
        this.autoParams = {
            enabled: true,
            amplitudeZ: 0.8, // how far back/forward (max ~2-3 requested)
            amplitudeX: 0.8, // left/right sway
            amplitudeY: 0.45, // larger up/down per user request
            speed: 0.5 // increased speed for more noticeable motion
        }

        // Debug UI controls
        try {
            const debug = this.experience.debug
            if(debug && debug.active && debug.ui)
            {
                const folder = debug.ui.addFolder('cameraAuto')
                folder.add(this.autoParams, 'enabled')
                folder.add(this.autoParams, 'amplitudeZ', 0, 3, 0.01).name('back/forward')
                folder.add(this.autoParams, 'amplitudeX', 0, 3, 0.01).name('left/right')
                folder.add(this.autoParams, 'amplitudeY', 0, 1.0, 0.01).name('up/down')
                folder.add(this.autoParams, 'speed', 0.01, 1.0, 0.01)
            }
        } catch(e) {}
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        // Apply damping update for controls (still useful internally)
        this.controls.update()

        // If auto motion enabled, compute a tiny sinusoidal displacement around base position
        if(this.autoParams && this.autoParams.enabled)
        {
            const t = this.experience.time.elapsed / 1000
            const ampZ = this.autoParams.amplitudeZ
            const ampX = this.autoParams.amplitudeX
            const speed = this.autoParams.speed

            // base position (where camera was originally placed)
            const base = { x: 6, y: 1.5, z: 8 }

            // small oscillations
            const offsetZ = (Math.sin(t * speed * 1.2) * 0.5 + Math.sin(t * speed * 0.7) * 0.25) * ampZ * 0.4
            const offsetX = Math.sin(t * speed * 0.9) * ampX * 0.15
            const offsetY = Math.sin(t * speed * 0.6) * this.autoParams.amplitudeY

            this.instance.position.x = base.x + offsetX
            this.instance.position.y = base.y + offsetY
            this.instance.position.z = base.z + offsetZ

            // keep looking at the scene center (or a slight target)
            this.instance.lookAt(0, 1.0, 0)
        }
    }
}