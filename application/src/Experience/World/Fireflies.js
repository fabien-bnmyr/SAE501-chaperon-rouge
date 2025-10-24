import * as THREE from 'three'

export default class Fireflies {
    constructor(scene, count = 180) {
        this.scene = scene
        this.count = count

        this.group = new THREE.Group()
        this.scene.add(this.group)

        this.createTexture()
        this.createPoints()
    }

    createTexture() {
        // create a small radial gradient circle as sprite
        const size = 128
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = size
        const ctx = canvas.getContext('2d')
        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
        gradient.addColorStop(0, 'rgba(255,255,255,1)')
        gradient.addColorStop(0.2, 'rgba(255,255,200,0.9)')
        gradient.addColorStop(0.4, 'rgba(255,200,150,0.7)')
        gradient.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = gradient
        ctx.fillRect(0,0,size,size)
        this.sprite = new THREE.CanvasTexture(canvas)
        this.sprite.minFilter = THREE.LinearFilter
    }

    createPoints() {
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(this.count * 3)
    const colors = new Float32Array(this.count * 3)
    const sizes = new Float32Array(this.count)
    const intensities = new Float32Array(this.count)
        const seed = Math.random() * 1000

    // sample a bright firefly palette from CSS variables (fallback to warm lights)
    const style = getComputedStyle(document.documentElement)
    const f1 = style.getPropertyValue('--firefly-1').trim() || '#fffdf5'
    const f2 = style.getPropertyValue('--firefly-2').trim() || '#fff5c2'
    const f3 = style.getPropertyValue('--firefly-3').trim() || '#ffd9a8'
    const f4 = style.getPropertyValue('--firefly-4').trim() || '#ffeecf'
    const palette = [new THREE.Color(f1), new THREE.Color(f2), new THREE.Color(f3), new THREE.Color(f4)]

        for (let i = 0; i < this.count; i++) {
            // distribute in a loose volume around origin
            const x = (Math.random() - 0.5) * 30
            // allow particles to appear lower and higher (range -10..14)
            const y = (Math.random() * 24) - 10
            const z = (Math.random() - 0.5) * 30
            positions[i*3] = x
            positions[i*3+1] = y
            positions[i*3+2] = z

            // random colorful hues
            // pick base from palette and add slight random perturbation
            const base = palette[Math.floor(Math.random() * palette.length)].clone()
            // slightly vary brightness/saturation
            base.offsetHSL((Math.random() - 0.5) * 0.06, (Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.12)
            const color = base
            colors[i*3] = color.r
            colors[i*3+1] = color.g
            colors[i*3+2] = color.b

            // smaller base sizes: range ~2px to ~8px (before perspective scaling)
            // smaller base sizes with more variation (before perspective scale)
            // slightly larger sizes for some particles
            sizes[i] = 1.2 + Math.random() * 4.5

            // intensity controls luminosity (used in shader). Increase base so particles are brighter on dark bg.
            intensities[i] = 1.0 + Math.random() * 2.0
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3))
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
        geometry.setAttribute('intensity', new THREE.BufferAttribute(intensities, 1))

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uSprite: { value: this.sprite },
                uTime: { value: 0.0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 customColor;
                attribute float intensity;
                    varying vec3 vColor;
                    varying float vIntensity;
                    uniform float uTime;
                    void main() {
                        vColor = customColor;
                        vIntensity = intensity;
                        // subtle time-based tinting factor could be applied in fragment shader
                        vec3 pos = position;
                        // gentle vertical bobbing, slightly larger amplitude for visibility
                        pos.y += sin(uTime * 1.0 + position.x * 0.12 + position.z * 0.09) * 0.45;
                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                        // Reduce perspective scaling to avoid huge points; clamp size for safety
                        float perspectiveFactor = 140.0 / -mvPosition.z;
                        gl_PointSize = clamp(size * perspectiveFactor, 1.5, 80.0);
                        gl_Position = projectionMatrix * mvPosition;
                    }
            `,
            fragmentShader: `
                uniform sampler2D uSprite;
                varying vec3 vColor;
                varying float vIntensity;
                uniform float uTime;
                void main() {
                    vec4 c = texture2D(uSprite, gl_PointCoord);
                    // stronger pulsation and slight bloom-friendly alpha
                    float t = sin(uTime * 1.2 + gl_FragCoord.x * 0.02) * 0.12;
                    vec3 col = clamp(vColor + t, 0.0, 1.0) * vIntensity;
                    // increase alpha for stronger additive blending; modulate by sprite alpha
                    float alpha = c.a * 1.0;
                    gl_FragColor = vec4(col, alpha) * c;
                    if (gl_FragColor.a < 0.01) discard;
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        })

        this.points = new THREE.Points(geometry, material)
    // Mark these points to both the default layer and the bloom layer so
    // they render in the normal pass and get picked up by the bloom pass
    const BLOOM_LAYER = 1
    // ensure default layer (0) is enabled as well
    this.points.layers.enable(0)
    this.points.layers.enable(BLOOM_LAYER)
    this.group.layers.enable(0)
    this.group.layers.enable(BLOOM_LAYER)
    this.group.add(this.points)
    }

    update(time) {
        if (!this.points) return
        this.points.material.uniforms.uTime.value = time * 0.001
        // optional slow rotation of the whole group
        this.group.rotation.y = Math.sin(time * 0.00012) * 0.12
    }
}
