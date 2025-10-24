import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Character
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time

        this.resource = this.resources.items.chaperonModel

        if(this.resource)
            this.setModel()

        // movement state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        }

        this.speed = 2 // units per second
        this.rotationSpeed = Math.PI // radians per second

        this._onKeyDown = this.onKeyDown.bind(this)
        this._onKeyUp = this.onKeyUp.bind(this)

        window.addEventListener('keydown', this._onKeyDown)
        window.addEventListener('keyup', this._onKeyUp)
    }

    setModel()
    {
        this.model = this.resource.scene.clone()

        this.model.position.set(5, 0.08, 3)
        this.model.scale.setScalar(0.5)


        // Enable shadows on all meshesz
        this.model.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true
                child.receiveShadow = true

                // Ensure standard materials update
                if(child.material)
                {
                    child.material.needsUpdate = true
                }
            }
        })
    }

    update()
    {
        // movement update: use time.delta for frame-independent movement
        const delta = (this.time && this.time.delta) ? this.time.delta / 1000 : 0.016

        if(!this.model) return

        // rotation
        if(this.keys.left) {
            this.model.rotation.y += this.rotationSpeed * delta
        }
        if(this.keys.right) {
            this.model.rotation.y -= this.rotationSpeed * delta
        }

    // forward/backward relative to model's rotation
    // Some models face +Z by default; use +1 so forward input moves the model visually forward.
    const forward = new THREE.Vector3(0, 0, 1)
        forward.applyQuaternion(this.model.quaternion)
        forward.y = 0
        forward.normalize()

        if(this.keys.forward) {
            this.model.position.addScaledVector(forward, this.speed * delta)
        }
        if(this.keys.backward) {
            this.model.position.addScaledVector(forward, -this.speed * delta)
        }
    }

    onKeyDown(event)
    {
        const key = event.key.toLowerCase()
        // Support AZERTY (zqsd), QWERTY (wasd) and arrow keys
        if(key === 'z' || key === 'w' || key === 'arrowup') this.keys.forward = true
        if(key === 's' || key === 'arrowdown') this.keys.backward = true
        if(key === 'q' || key === 'a' || key === 'arrowleft') this.keys.left = true
        if(key === 'd' || key === 'arrowright') this.keys.right = true
    }

    onKeyUp(event)
    {
        const key = event.key.toLowerCase()
        if(key === 'z' || key === 'w' || key === 'arrowup') this.keys.forward = false
        if(key === 's' || key === 'arrowdown') this.keys.backward = false
        if(key === 'q' || key === 'a' || key === 'arrowleft') this.keys.left = false
        if(key === 'd' || key === 'arrowright') this.keys.right = false
    }

    destroy()
    {
        window.removeEventListener('keydown', this._onKeyDown)
        window.removeEventListener('keyup', this._onKeyUp)
    }
}
