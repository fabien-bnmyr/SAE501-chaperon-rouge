import * as THREE from 'three'
import Experience from '../Experience.js'

export default class House
{
	constructor()
	{
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.time = this.experience.time
		this.debug = this.experience.debug

		// resource should be ready when House is instantiated from World
		this.resource = this.resources.items.houseModel

		if(this.resource && this.resource.scene)
			this.setModel()
	}

	setModel()
	{
		this.model = this.resource.scene
		this.scene.add(this.model)

		// Shadows
		this.model.traverse((child) =>
		{
			if (child.isMesh)
			{
				// force shadow flags
				child.castShadow = true
				child.receiveShadow = true

				// log material type for debug
				if (this.debug && this.debug.active)
				{
				}
			}
		})

		// If the model contains a mesh named 'emission_light', mark it for bloom
		try {
			this.model.traverse((child) => {
				// Log every mesh name for debugging
				if (child.isMesh) {
					const lname = (child.name || '').toLowerCase()
					if (lname.includes('emission') || lname.includes('emission_light')) {
						// Use layer 1 for bloom
						child.layers.enable(1)
						// Try to ensure the material has emissive color if available
						try {
							if (child.material) {
								if (!child.material.emissive) child.material.emissive = new THREE.Color(0xffffff)
								child.material.emissiveIntensity = child.material.emissiveIntensity || 1.2
								child.material.needsUpdate = true
							}
						} catch (e) {}
					}
				}
			})
		} catch (e) {}

		// Center camera on model
		const box = new THREE.Box3().setFromObject(this.model)
		const center = box.getCenter(new THREE.Vector3())

		if(this.experience && this.experience.camera && this.experience.camera.instance)
		{
			this.experience.camera.instance.lookAt(center)
		}

	}


	update()
	{
		if(this.mixer && this.time)
			this.mixer.update(this.time.delta * 0.001)
	}
}

