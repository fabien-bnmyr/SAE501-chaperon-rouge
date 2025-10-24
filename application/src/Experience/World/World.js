import Experience from '../Experience.js'
import Environment from './Environment.js'
import House from './House.js'
import Character from './Character.js'
import Fireflies from './Fireflies.js'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Wait for resources
        this.resources.on('ready', () =>
        {
            this.house = new House()
            this.environment = new Environment()
            this.character = new Character()
            // add ambient decorative particles (fireflies)
            // increase count for denser effect
            this.fireflies = new Fireflies(this.scene, 320)
        })
    }

    update()
    {
        if(this.house && typeof this.house.update === 'function')
            this.house.update()

        if(this.environment && typeof this.environment.update === 'function')
            this.environment.update()

        if(this.character && typeof this.character.update === 'function')
            this.character.update()

        if (this.fireflies && typeof this.fireflies.update === 'function')
            this.fireflies.update(this.experience.time.elapsed)
    }
}