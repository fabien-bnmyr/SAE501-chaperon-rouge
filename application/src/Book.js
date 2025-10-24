/**
 * Book.js
 * Contrôleur simple pour afficher un livre en overlay.
 */

// Contenu par défaut du livre : 21 pages (Le Petit Chaperon Rouge, extrait)
const DEFAULT_PAGES_CONTENT = [
    `Il était une fois une petite fille, la plus jolie qu’on eût su voir. Sa mère en était folle, et sa grand-mère encore plus. Celle-ci lui fit faire un petit chaperon de velours rouge, qui lui seyait si bien que partout, on l’appelait le Petit Chaperon rouge.`,
    `Un jour, sa mère, ayant cuit et fait des galettes, lui dit :\n— Va voir comment se porte ta mère-grand, car on m’a dit qu’elle était malade. Porte-lui une galette et ce petit pot de beurre.`,
    `Le Petit Chaperon rouge partit aussitôt pour aller chez sa mère-grand, qui demeurait dans un autre village.`,
    `En passant dans un bois, elle rencontra le loup, qui eut bien envie de la manger. Mais il n’osa pas, à cause de quelques bûcherons qui étaient dans la forêt.`,
    `Il lui demanda où elle allait.\n— Je vais voir ma mère-grand, dit-elle, et lui porter une galette avec un petit pot de beurre que ma mère lui envoie.`,
    `— Demeure-t-elle bien loin ? lui dit le loup.\n— Oh ! oui, dit le Petit Chaperon rouge, c’est par-delà le moulin que vous voyez tout là-bas, à la première maison du village.`,
    `— Eh bien ! dit le loup, je veux l’aller voir aussi ; je m’y en vais par ce chemin-ci, et toi par ce chemin-là, et nous verrons qui plus tôt y sera.\nLe loup se mit à courir de toute sa force par le chemin le plus court, et la petite fille s’en alla par le chemin le plus long.`,
    `Elle s’amusait à cueillir des noisettes, à courir après des papillons et à faire des bouquets de petites fleurs qu’elle rencontrait.`,
    `Le loup ne fut pas longtemps à arriver à la maison de la mère-grand ; il heurta :\n— Toc, toc !\n— Qui est là ?`,
    `— C’est votre petite-fille, le Petit Chaperon rouge, dit le loup, en contrefaisant sa voix, qui vous apporte une galette et un petit pot de beurre que ma mère vous envoie.\nLa bonne mère-grand, qui était dans son lit, parce qu’elle se trouvait un peu mal, lui cria :\n— Tire la chevillette, la porte est ouverte.`,
    `Le loup tira la chevillette, et la porte s’ouvrit. Il se jeta sur la bonne femme et la dévora en moins de rien, car il y avait plus de trois jours qu’il n’avait mangé.`,
    `Ensuite, il ferma la porte et alla se coucher dans le lit de la mère-grand, en attendant le Petit Chaperon rouge, qui, quelque temps après, vint heurter à la porte.`,
    `— Toc, toc !\n— Qui est là ?\nLe Petit Chaperon rouge, entendant la grosse voix du loup, eut peur d’abord ; mais, croyant que sa mère-grand était enrhumée, répondit :\n— C’est votre petite-fille, le Petit Chaperon rouge, qui vous apporte une galette et un petit pot de beurre que ma mère vous envoie.`,
    `Le loup lui cria, en adoucissant un peu sa voix :\n— Tire la chevillette, la porte est ouverte.\nLe Petit Chaperon rouge tira la chevillette, et la porte s’ouvrit. Le loup, la voyant entrer, lui dit en se cachant dans le lit, sous la couverture :\n— Mets la galette et le petit pot de beurre sur la huche, et approche-toi un peu, ma fille.`,
    `Le Petit Chaperon rouge s’approcha du lit et fut bien étonnée de voir sa mère-grand en chemise, le bonnet bien enfoncé sur la tête et l’air bien changé.\nElle s’arrêta près du chevet et lui dit :\n— Ma mère-grand, que vous avez de grands bras !\n— C’est pour mieux t’embrasser, ma fille.`,
    `— Ma mère-grand, que vous avez de grandes jambes !\n— C’est pour mieux courir, mon enfant.\n— Ma mère-grand, que vous avez de grandes oreilles !\n— C’est pour mieux écouter, mon enfant.\n— Ma mère-grand, que vous avez de grands yeux !\n— C’est pour mieux voir, mon enfant.`,
    `— Ma mère-grand, que vous avez de grandes dents !\n— C’est pour mieux te manger !\nEt, en disant ces mots, le méchant loup se jeta sur le Petit Chaperon rouge, et la mangea.`,
    `Mais, comme il avait fait un bon repas, il se coucha dans le lit et se mit à dormir à grands coups de gosier.\nUn chasseur qui passait par là entendit le loup ronfler. Il entra dans la maison, et voyant le loup couché, il pensa qu’il avait mangé la vieille femme. Il prit des ciseaux et se mit à lui fendre le ventre.`,
    `À peine eut-il fait deux coups qu’il vit briller le petit chaperon rouge. Encore deux coups, et la petite fille sortit et s’écria :\n— Ah ! que j’ai eu peur ! Il faisait bien noir dans le ventre du loup !`,
    `Ensuite sortit la mère-grand, bien vivante, mais à peine pouvant respirer.\nLe chasseur alla chercher de grosses pierres, dont ils remplirent le ventre du loup. Quand il se réveilla et voulut s’enfuir, les pierres étaient si lourdes qu’il tomba mort raide.`,
    `Tous trois se réjouirent. Le chasseur prit la peau du loup, la mère-grand mangea la galette et but le petit pot de beurre que le Petit Chaperon rouge avait apportés, et le Petit Chaperon rouge se dit :\n« Je n’irai plus jamais seule dans le bois, quand ma mère me l’a défendu. »`
]

export default class Book {
    constructor(options = {}) {
        // éléments DOM (attendus dans le HTML)
        this.overlay = document.getElementById('book-overlay')
        this.textEl = document.getElementById('book-text')
        this.imageEl = document.getElementById('book-image')
        this.closeBtn = document.getElementById('book-close')
        this.prevBtn = document.getElementById('book-prev')
        this.nextBtn = document.getElementById('book-next')

    // pages et pagination : si l'utilisateur fournit un tableau `pages`, l'utiliser
    // sinon utiliser le contenu par défaut défini ci-dessus
    this.pages = Array.isArray(options.pages) ? options.pages.slice() : (DEFAULT_PAGES_CONTENT.slice())
    // garantir la valeur totalPages cohérente
    this.totalPages = this.pages.length
        this.current = 1

        // chemin des images (par défaut le dossier illustrations du projet)
        this.imagesPath = options.imagesPath || './static/illustrations'

        // liaisons pour les handlers (éviter de recréer closures dans add/remove)
        this._onKey = this._onKey.bind(this)
        this._onPrev = this._onPrev.bind(this)
        this._onNext = this._onNext.bind(this)
        this._onClose = this._onClose.bind(this)

        // handlers utilisateur
        if (this.closeBtn) this.closeBtn.addEventListener('click', this._onClose)
        if (this.prevBtn) this.prevBtn.addEventListener('click', this._onPrev)
        if (this.nextBtn) this.nextBtn.addEventListener('click', this._onNext)

        // accessibilité : annoncer les changements de texte au lecteur d'écran
        if (this.textEl) this.textEl.setAttribute('aria-live', 'polite')

        // affichage initial
        this._updateView()
    }

    // Ouvre l'overlay du livre et active la navigation clavier
    open() {
        if (!this.overlay) return
        this.overlay.classList.add('active')
        this.overlay.setAttribute('aria-hidden', 'false')
        window.addEventListener('keydown', this._onKey)
        this._updateView()
        // si la UI hint globale existe, demander sa mise à jour (afficher/masquer le png)
        try { if (window && typeof window.showUiOpenHint === 'function') window.showUiOpenHint() } catch (e) {}
    }

    // Ferme le livre et retire la navigation clavier
    close() {
        if (!this.overlay) return
        this.overlay.classList.remove('active')
        this.overlay.setAttribute('aria-hidden', 'true')
        window.removeEventListener('keydown', this._onKey)
        // Mettre à jour la hint UI globale (réafficher le png si présent)
        try { if (window && typeof window.showUiOpenHint === 'function') window.showUiOpenHint() } catch (e) {}
    }

    // Aller à une page (borne entre 1 et totalPages)
    goto(page) {
        const p = Math.max(1, Math.min(this.totalPages, Number(page) || 1))
        if (p === this.current) return
        this.current = p
        this._updateView()
    }

    next() { this.goto(this.current + 1) }
    prev() { this.goto(this.current - 1) }

    // Met à jour l'affichage (texte à gauche, image à droite)
    _updateView() {
        if (!this.textEl || !this.imageEl) return

        const raw = this.pages[this.current - 1] || ''
        const txt = (typeof raw === 'string') ? raw.trim().toLowerCase() : ''
        const isCredits = (txt === 'credit' || txt === 'credits')

        if (isCredits) {
            // sur la page crédits, afficher une image dédiée dans la colonne de gauche
            this.textEl.innerHTML = ''
            const leftImg = document.createElement('img')
            leftImg.src = '/illustrations/credit.png'
            leftImg.alt = 'Crédits'
            leftImg.style.maxWidth = '100%'
            leftImg.style.maxHeight = '100%'
            leftImg.draggable = false
            leftImg.addEventListener('dragstart', (e) => { e.preventDefault(); return false })
            this.textEl.appendChild(leftImg)
        } else {
            // texte normal : simple texte (le rendu plus fin est géré ailleurs si besoin)
            this.textEl.textContent = raw
        }

        // Préparer la liste de sources d'image (image principale puis fallback pair)
        const candidates = []
        candidates.push(`${this.imagesPath}/page${this.current}.png`)
        const pairLow = (this.current % 2 === 0) ? this.current - 1 : this.current
        const pairHigh = pairLow + 1
        candidates.push(`${this.imagesPath}/page${pairLow}-${pairHigh}.png`)

        // Application minimaliste au DOM : change src + alt + dataset
        this.imageEl.src = candidates[0]
        this.imageEl.dataset.fallbacks = candidates.join(',')
        this.imageEl.alt = `Illustration page ${this.current}`

        // Mise à jour des boutons précédents / suivants
        if (this.prevBtn) this.prevBtn.disabled = this.current === 1
        if (this.nextBtn) this.nextBtn.disabled = this.current === this.totalPages
    }

    // Gestion clavier : Escape ferme, flèches naviguent (preventDefault pour éviter le scroll)
    _onKey(e) {
        if (e.key === 'Escape') {
            this.close()
            return
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault()
            this.next()
            return
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault()
            this.prev()
            return
        }
    }

    _onPrev() { this.prev() }
    _onNext() { this.next() }
    _onClose() { this.close() }

    // Génère des pages de placeholder si l'utilisateur n'en fournit pas
    _makePlaceholderPages(n) {
        const pages = []
        const total = Number(n) || DEFAULT_PAGES
        for (let i = 1; i <= total; i++) {
            pages.push(`Page ${i}\n\n(texte de la page ${i} à remplacer)`)
        }
        return pages
    }
}
