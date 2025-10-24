
import Experience from './Experience/Experience.js'

const experience = new Experience(document.querySelector('canvas.webgl'))

// Simple loading overlay control: wait for resources + illustrations
const loaderEl = document.getElementById('loader')
const loaderPercent = document.getElementById('loader-percent')
const bgMusic = document.getElementById('bg-music')
const loaderSpinner = document.getElementById('loader-spinner')

// Background music handling: attempt autoplay, fallback to first user gesture
let bgMusicStarted = false
let bgMusicMutedAutoplay = false

// Target background music level (0.0 - 1.0) when MASTER_VOLUME is 1.0.
// Set to 1.0 so a user volume of 100 maps to max background music loudness.
const BG_MUSIC_TARGET_VOLUME = 1.0
// Master volume (0.0 - 1.0). UI slider maps 0..100 to this range.
// Default to 40% unless the user has a saved preference.
let MASTER_VOLUME = 0.4
let isMuted = false

// Restore persisted user volume/mute if available so the last-used value is
// the default on next launch.
try {
	const saved = localStorage.getItem('pc_master_volume')
	if (saved !== null) {
		const n = Number(saved)
		if (!Number.isNaN(n)) MASTER_VOLUME = Math.max(0, Math.min(1, n))
	}
	const sm = localStorage.getItem('pc_is_muted')
	if (sm !== null) {
		isMuted = (sm === '1' || sm === 'true')
	}
} catch (e) {}

// UI elements will be looked up when needed (they live inside the book nav)
let volumeBtn = null
let volumeSlider = null

// cover slider reference (created dynamically inside .livre.nav.volume-control)
let coverVolumeSlider = null

// Helper: get icon path depending on mute/level
function updateVolumeIcon() {
	try {
		if (!volumeBtn) return
		if (isMuted || MASTER_VOLUME <= 0) volumeBtn.src = '/volume-off.png'
		else volumeBtn.src = '/volume-on.png'
	} catch (e) {}
}

// Paint a two-tone background on a range input so the left (filled) part is
// `#687f88` and the right (empty) part is `#b7b4ad`.
function setRangeBackground(el, value) {
	try {
		if (!el) return
		const v = Math.max(0, Math.min(100, Number(value ?? el.value ?? 0)))
		// Use a CSS variable for the fill percentage so pseudo-element tracks can
		// reference it and paint the gradient reliably across browsers (Chrome/Edge)
		el.style.setProperty('--slider-fill', v + '%')
	} catch (e) {}
}

// (removed debug flag)

// Apply master volume to all audio sources we control
function applyMasterVolume() {
	try {
		const effective = isMuted ? 0 : MASTER_VOLUME
		// Background music should respect BG_MUSIC_TARGET_VOLUME as a relative level
		if (bgMusic) {
			// if bgMusic is playing or started, set its volume proportionally
			try { bgMusic.volume = (BG_MUSIC_TARGET_VOLUME * effective) } catch (e) {}
			// keep mute flag in sync
			try { bgMusic.muted = isMuted } catch (e) {}
		}
		if (narration) {
			try { narration.volume = effective } catch (e) {}
			try { narration.muted = isMuted } catch (e) {}
		}
		if (pageFlip) {
			try { pageFlip.volume = 0.9 * effective } catch (e) {}
			try { pageFlip.muted = isMuted } catch (e) {}
		}
	} catch (e) {}
}

// Initialize UI
function ensureVolumeElements() {
	if (!volumeBtn) volumeBtn = document.getElementById('volume-btn')
    if (!volumeSlider) volumeSlider = document.getElementById('volume-slider')

	// Only the click toggle is needed now (no slider)
	if (volumeBtn && !volumeBtn._hasClickHandler) {
		volumeBtn._hasClickHandler = true
		volumeBtn.addEventListener('click', () => {
			try {
				isMuted = !isMuted
				if (!isMuted && MASTER_VOLUME <= 0) MASTER_VOLUME = 0.4
				updateVolumeIcon()
				applyMasterVolume()
				// persist mute state
				try { localStorage.setItem('pc_is_muted', isMuted ? '1' : '0') } catch (e) {}
			} catch (err) {}
		})
	}

	// Initialize global slider visuals and wire input events so the filled
	// portion (left) is #687f88 and the empty portion (right) is #b7b4ad.
	try {
		if (volumeSlider) {
			// init visual
			// ensure slider reflects MASTER_VOLUME (restored or default)
			try { volumeSlider.value = Math.round((MASTER_VOLUME || 0) * 100) } catch (e) {}
			setRangeBackground(volumeSlider, volumeSlider.value)
			if (!volumeSlider._hasInputHandler) {
				volumeSlider._hasInputHandler = true
				volumeSlider.addEventListener('input', (e) => {
					try {
						const v = Math.max(0, Math.min(100, Number(e.target.value || 100)))
                        
						MASTER_VOLUME = v / 100
						if (MASTER_VOLUME > 0) isMuted = false
						updateVolumeIcon()
						applyMasterVolume()
						setRangeBackground(e.target, v)
						// sync cover slider visually and by value
						try { if (coverVolumeSlider) { coverVolumeSlider.value = v; setRangeBackground(coverVolumeSlider, v) } } catch (er) {}
						// persist volume
						try { localStorage.setItem('pc_master_volume', MASTER_VOLUME.toString()) } catch (er) {}
					} catch (err) {}
				})
			}
		}
	} catch (e) {}

	// make sure UI and audio reflect restored/default volume immediately
	try { updateVolumeIcon(); applyMasterVolume() } catch (e) {}
}

function ensureCoverSlider() {
	try {
		if (!livreEl) return
		const vc = livreEl.querySelector('.nav .volume-control')
		if (!vc) return
		// if already created, use it
		// The canonical slider lives in the nav (we added it to index.html). Use
		// that element as the single source of truth.
		coverVolumeSlider = vc.querySelector('#volume-slider') || vc.querySelector('input.cover-volume-slider')
		if (coverVolumeSlider) {
			// ensure value reflects MASTER_VOLUME and visuals are initialized
			try { coverVolumeSlider.value = Math.round((MASTER_VOLUME || 0) * 100); setRangeBackground(coverVolumeSlider, coverVolumeSlider.value) } catch (e) {}
			// wire events if needed (global slider may already have handlers)
			if (!coverVolumeSlider._hasInputHandler) {
				coverVolumeSlider._hasInputHandler = true
				coverVolumeSlider.addEventListener('input', (e) => {
					try {
						const v = Math.max(0, Math.min(100, Number(e.target.value || 100)))
						MASTER_VOLUME = v / 100
						if (MASTER_VOLUME > 0) isMuted = false
						updateVolumeIcon()
						applyMasterVolume()
						setRangeBackground(e.target, v)
						try { if (volumeSlider && volumeSlider !== coverVolumeSlider) { volumeSlider.value = v; setRangeBackground(volumeSlider, v) } } catch (er) {}
						try { localStorage.setItem('pc_master_volume', MASTER_VOLUME.toString()) } catch (er) {}
					} catch (err) {}
				})
			}
		}
	} catch (e) {}
}

function fadeVolume(audio, from, to, duration = 800) {
	const start = performance.now()
	function step(now) {
		const t = Math.min(1, (now - start) / duration)
		// clamp and apply master volume
		const raw = from + (to - from) * t
		const effective = isMuted ? 0 : (raw * MASTER_VOLUME)
		try { audio.volume = Math.max(0, Math.min(1, effective)) } catch (e) {}
		if (t < 1) requestAnimationFrame(step)
	}
	requestAnimationFrame(step)
}

function startBgMusic(withSound = true) {
	if (bgMusicStarted || !bgMusic) return
	try {
		bgMusic.loop = true
		if (withSound) {
			bgMusic.muted = false
			// start from zero then fade to target * master
			bgMusic.volume = 0.0
			const p = bgMusic.play()
			if (p && typeof p.then === 'function') {
				p.then(() => {
					bgMusicStarted = true
					fadeVolume(bgMusic, 0.0, BG_MUSIC_TARGET_VOLUME, 800)
				}).catch(() => {
					// play blocked: fallback to muted autoplay
					tryAutoplayMuted()
				})
			} else {
				bgMusicStarted = true
			}
		} else {
			// start muted autoplay (usually allowed)
			bgMusic.muted = true
			bgMusic.volume = 0.0
			const p = bgMusic.play()
			if (p && typeof p.then === 'function') {
				p.then(() => {
					bgMusicStarted = true
					bgMusicMutedAutoplay = true
				}).catch(() => {
					// muted autoplay failed too; will wait for gesture
				})
			} else {
				bgMusicStarted = true
				bgMusicMutedAutoplay = true
			}
		}
	} catch (e) {}
}

function tryAutoplayMuted() {
	try {
		startBgMusic(false)
	} catch (e) {}
}

// Attempt muted autoplay first (browsers generally allow muted autoplay)
tryAutoplayMuted()

// On first user gesture: if we autoplayed muted, unmute and fade in; otherwise try to start with sound
function onFirstGesture() {
	try {
		if (!bgMusic) return
		if (bgMusicMutedAutoplay && bgMusicStarted) {
			// unmute and fade in
			bgMusic.muted = false
			fadeVolume(bgMusic, 0.0, BG_MUSIC_TARGET_VOLUME, 800)
			bgMusicMutedAutoplay = false
		} else if (!bgMusicStarted) {
			// try to start with sound now
			startBgMusic(true)
		}
	} catch (e) {}
}

window.addEventListener('click', onFirstGesture, { once: true })
window.addEventListener('keydown', onFirstGesture, { once: true })

// Animate loader spinner with subtle random speed changes
let spinnerInterval = null
function setRandomSpinnerSpeed() {
	try {
		if (!loaderSpinner) return
		// random duration between 0.9s and 2.2s
		const dur = (0.9 + Math.random() * 1.3).toFixed(2) + 's'
		loaderSpinner.style.animation = `spin-base ${dur} linear infinite`
	} catch (e) {}
}
function startSpinnerVariation() {
	setRandomSpinnerSpeed()
	spinnerInterval = setInterval(setRandomSpinnerSpeed, 1200 + Math.random() * 1400)
}
function stopSpinnerVariation() {
	if (spinnerInterval) clearInterval(spinnerInterval)
	spinnerInterval = null
}

function setLoaderPercent(p) {
	try { if (loaderPercent) loaderPercent.textContent = Math.round(p) + '%' } catch (e) {}
}

function hideLoader() {
	try {
		if (!loaderEl) return
		loaderEl.classList.add('loader-hidden')
		// remove from layout after transition
		setTimeout(() => {
			try { loaderEl.style.display = 'none' } catch (e) {}
		}, 480)
	} catch (e) {}
}

// Keep Three.js scene hidden until Experience resources are loaded,
// then reveal it automatically.
if (experience && experience.scene) {
	try { experience.scene.visible = false } catch (e) {}
}

// Wait for Three.js resources to be ready
if (experience && experience.resources) {
	// resources trigger 'ready' when models/textures are loaded
	const onResourcesReady = () => {
		// start spinner speed variations
		startSpinnerVariation()

		// Mark loader complete and reveal the scene automatically
		try { setLoaderPercent(100) } catch (e) {}
		try {
			if (experience && experience.scene) experience.scene.visible = true
		} catch (e) {}
		try {
			// stop spinner, hide loader and start bg music (gesture may be required)
			stopSpinnerVariation()
			hideLoader()
			startBgMusic(true)
		} catch (e) {}
	}

	experience.resources.on('ready', onResourcesReady)

	// If resources already finished loading before we attached the listener,
	// call the handler immediately so the Enter button appears.
	try {
		if (experience.resources.loaded === experience.resources.toLoad) onResourcesReady()
	} catch (e) {}
}

// (enter button removed) no-op
// --- Book page rendering (image left, text right) ---
const container = document.querySelector('.container')
const pageImageContainer = container ? container.querySelector('.page-image') : null
const pageTextContainer = container ? container.querySelector('.page-text') : null
const bgImageEl = container ? container.querySelector('.livre .bg') : null
const livreEl = container ? container.querySelector('.livre') : null
const btnClose = container ? container.querySelector('.close') : null
const btnNext = container ? container.querySelector('.fleche-droite') : null
const btnPrev = container ? container.querySelector('.fleche-gauche') : null

// remember original livre CSS background-image so we can restore it when leaving cover mode
let originalBgImage = ''
try {
	if (livreEl) originalBgImage = getComputedStyle(livreEl).backgroundImage || ''
} catch (e) { originalBgImage = '' }

// Audio element for narration (one file per page expected at /audio/pageN.mp3)
const narration = new Audio()
narration.preload = 'auto'

// Page flip sound (placed in static/ as /page-flip.mp3)
const pageFlip = new Audio('/page-flip.mp3')
pageFlip.preload = 'auto'
try { pageFlip.volume = 0.9 } catch (e) {}

// When narration plays, we lower the background music with a short fade.
// This factor controls how quiet the BG music becomes during narration
// (fraction of BG_MUSIC_TARGET_VOLUME). 0.18 ~= -14dB which keeps ambience.
const NARRATION_BG_FACTOR = 0.18

function lowerBgForNarration() {
	try {
		if (!bgMusic || !bgMusicStarted) return
		// Use raw target values (before master volume) so fade algorithm scales correctly
		const fromRaw = (typeof bgMusic.volume === 'number') ? (bgMusic.volume / Math.max(0.0001, MASTER_VOLUME)) : BG_MUSIC_TARGET_VOLUME
		const toRaw = Math.max(0, BG_MUSIC_TARGET_VOLUME * NARRATION_BG_FACTOR)
		fadeVolume(bgMusic, fromRaw, toRaw, 600)
	} catch (e) {}
}

function restoreBgAfterNarration() {
	try {
		if (!bgMusic || !bgMusicStarted) return
		const fromRaw = (typeof bgMusic.volume === 'number') ? (bgMusic.volume / Math.max(0.0001, MASTER_VOLUME)) : 0
		fadeVolume(bgMusic, fromRaw, BG_MUSIC_TARGET_VOLUME, 800)
	} catch (e) {}
}

// Fade BG music down when narration starts playing, restore on pause/end
narration.addEventListener('playing', () => {
	try {
		// Only duck background music when the book UI is open
		const bookOpen = (typeof container !== 'undefined') && container && !container.classList.contains('hidden')
		if (bookOpen) lowerBgForNarration()
	} catch (e) {}
})
narration.addEventListener('pause', () => {
	// small restore when narration is paused
	restoreBgAfterNarration()
})
narration.addEventListener('ended', () => {
	restoreBgAfterNarration()
})

// Textes réels pour chaque page (fourni par l'utilisateur)
const pageTexts = [
    "Il était une fois une petite fille, la plus jolie qu’on eût su voir. Sa mère en était folle, et sa grand-mère encore plus. Celle-ci lui fit faire un petit chaperon de velours rouge, qui lui seyait si bien que partout, on l’appelait le Petit Chaperon rouge.",
    "Un jour, sa mère, ayant cuit et fait des galettes, lui dit : — Va voir comment se porte ta mère-grand, car on m’a dit qu’elle était malade. Porte-lui une galette et ce petit pot de beurre.",
    "Le Petit Chaperon rouge partit aussitôt pour aller chez sa mère-grand, qui demeurait dans un autre village.",
    "En passant dans un bois, elle rencontra le loup, qui eut bien envie de la manger. Mais il n’osa pas, à cause de quelques bûcherons qui étaient dans la forêt.",
    "Il lui demanda où elle allait. — Je vais voir ma mère-grand, dit-elle, et lui porter une galette avec un petit pot de beurre que ma mère lui envoie.",
    "— Demeure-t-elle bien loin ? lui dit le loup. — Oh ! oui, dit le Petit Chaperon rouge, c’est par-delà le moulin que vous voyez tout là-bas, à la première maison du village.",
    "— Eh bien ! dit le loup, je veux l’aller voir aussi ; je m’y en vais par ce chemin-ci, et toi par ce chemin-là, et nous verrons qui plus tôt y sera. Le loup se mit à courir de toute sa force par le chemin le plus court, et la petite fille s’en alla par le chemin le plus long.",
    "Elle s’amusait à cueillir des noisettes, à courir après des papillons et à faire des bouquets de petites fleurs qu’elle rencontrait.",
    "Le loup ne fut pas longtemps à arriver à la maison de la mère-grand ; il heurta : — Toc, toc ! — Qui est là ?",
    "— C’est votre petite-fille, le Petit Chaperon rouge, dit le loup, en contrefaisant sa voix, qui vous apporte une galette et un petit pot de beurre que ma mère vous envoie. La bonne mère-grand, qui était dans son lit, parce qu’elle se trouvait un peu mal, lui cria : — Tire la chevillette, la porte est ouverte.",
    "Le loup tira la chevillette, et la porte s’ouvrit. Il se jeta sur la bonne femme et la dévora en moins de rien, car il y avait plus de trois jours qu’il n’avait mangé.",
    "Ensuite, il ferma la porte et alla se coucher dans le lit de la mère-grand, en attendant le Petit Chaperon rouge, qui, quelque temps après, vint heurter à la porte.",
    "— Toc, toc ! — Qui est là ? Le Petit Chaperon rouge, entendant la grosse voix du loup, eut peur d’abord ; mais, croyant que sa mère-grand était enrhumée, répondit : — C’est votre petite-fille, le Petit Chaperon rouge, qui vous apporte une galette et un petit pot de beurre que ma mère vous envoie.",
    "Le loup lui cria, en adoucissant un peu sa voix : — Tire la chevillette, la porte est ouverte. Le Petit Chaperon rouge tira la chevillette, et la porte s’ouvrit. Le loup, la voyant entrer, lui dit en se cachant dans le lit, sous la couverture : — Mets la galette et le petit pot de beurre sur la huche, et approche-toi un peu, ma fille.",
    "Le Petit Chaperon rouge s’approcha du lit et fut bien étonnée de voir sa mère-grand en chemise, le bonnet bien enfoncé sur la tête et l’air bien changé. Elle s’arrêta près du chevet et lui dit : — Ma mère-grand, que vous avez de grands bras ! — C’est pour mieux t’embrasser, ma fille.",
    "— Ma mère-grand, que vous avez de grandes jambes ! — C’est pour mieux courir, mon enfant. — Ma mère-grand, que vous avez de grandes oreilles ! — C’est pour mieux écouter, mon enfant. — Ma mère-grand, que vous avez de grands yeux ! — C’est pour mieux voir, mon enfant.",
    "— Ma mère-grand, que vous avez de grandes dents ! — C’est pour mieux te manger ! Et, en disant ces mots, le méchant loup se jeta sur le Petit Chaperon rouge, et la mangea.",
    "Mais, comme il avait fait un bon repas, il se coucha dans le lit et se mit à dormir à grands coups de gosier. Un chasseur qui passait par là entendit le loup ronfler. Il entra dans la maison, et voyant le loup couché, il pensa qu’il avait mangé la vieille femme. Il prit des ciseaux et se mit à lui fendre le ventre.",
    "À peine eut-il fait deux coups qu’il vit briller le petit chaperon rouge. Encore deux coups, et la petite fille sortit et s’écria : — Ah ! que j’ai eu peur ! Il faisait bien noir dans le ventre du loup !",
    "Ensuite sortit la mère-grand, bien vivante, mais à peine pouvant respirer. Le chasseur alla chercher de grosses pierres, dont ils remplirent le ventre du loup. Quand il se réveilla et voulut s’enfuir, les pierres étaient si lourdes qu’il tomba mort raide.",
	"Tous trois se réjouirent. Le chasseur prit la peau du loup, la mère-grand mangea la galette et but le petit pot de beurre que le Petit Chaperon rouge avait apportés, et le Petit Chaperon rouge se dit : « Je n’irai plus jamais seule dans le bois, quand ma mère me l’a défendu. »",
	// Final credits page marker — this will render the left text and a credit image on the right
	"Credit"
]

// Ensure TOTAL_PAGES is available before any resource-ready handler runs
const TOTAL_PAGES = pageTexts.length

let currentPage = 1
// Cover handling: show a closed-cover image when opening the book instead of jumping
// directly to page 1. Assumes the user added `/illustrations/livre-couverture.png`.
// If the file is missing, we gracefully fall back to page 1.
const coverFilename = '/illustrations/livre-couverture.png'
let coverShown = false
// typing control vars
let typingTimeout = null
let typingIndex = 0
let typingP = null
let durationMetadataHandler = null

function renderPage(n) {
	if (!pageImageContainer || !pageTextContainer) return

	// keep previous for flip sound decision
	const previousPage = currentPage

	if (n < 1) n = 1
	if (n > TOTAL_PAGES) n = TOTAL_PAGES

	// Play page flip only when the page number actually changes
	if (typeof previousPage !== 'undefined' && previousPage !== null && n !== previousPage) {
		try {
			// rewind and play, ignore promise rejection (autoplay policies)
			pageFlip.currentTime = 0
			const flipPromise = pageFlip.play()
			if (flipPromise && typeof flipPromise.then === 'function') flipPromise.catch(() => {})
		} catch (e) {}
	}

	currentPage = n

	// Render image on the left
	// Special-case: if this is the final credits marker, render credit image and title
	let isCredits = false
	if (n === TOTAL_PAGES) {
		const txt = (pageTexts[n - 1] || '').trim().toLowerCase()
		if (txt === 'credit' || txt === 'credits') isCredits = true
	}
	const img = document.createElement('img')
	img.src = isCredits ? `/illustrations/credit.png` : `/illustrations/page${n}.png`
	img.alt = isCredits ? `Credit` : `Illustration page ${n}`
	img.style.maxWidth = '100%'
	img.style.maxHeight = '100%'
	img.addEventListener('error', () => {
		pageImageContainer.innerHTML = `<div style="color:#fff">Illustration non trouvée (page ${n})</div>`
	})
	// Prevent the image from being dragged/selected via dragstart
	img.addEventListener('dragstart', (e) => { e.preventDefault(); return false })
	pageImageContainer.innerHTML = ''
	pageImageContainer.appendChild(img)

	// Effet d'écriture lettre par lettre pour le texte
	const text = pageTexts[n - 1] || ''

			// Set the page number for the CSS pseudo-element
			try { pageTextContainer.dataset.page = String(n) } catch (e) {}
	if (isCredits) {
		// Build structured credits content on the left side
		pageTextContainer.innerHTML = ''
		const title = document.createElement('h1')
		title.textContent = 'Crédits'
		title.className = 'credits-title'
		pageTextContainer.appendChild(title)

		const list = document.createElement('ul')
		list.className = 'credits-list'

		const items = [
			{ label: 'Conte', value: 'Les frères Grimm' },
			{ label: 'Blender / scène 3D', value: 'Bonnemayre Fabien' },
			{ label: "Développement de l'application", value: 'Bonnemayre Fabien' },
			{ label: 'Musique', value: 'Camille Enyal' },
			{ label: 'Voix narrative du conte', value: "Générée par IA" },
			{ label: "Illustrations du conte", value: 'Générée par IA' }
		]

		for (const it of items) {
			const li = document.createElement('li')
			const strong = document.createElement('strong')
			strong.textContent = it.label + ' : '
			const span = document.createElement('span')
			span.textContent = it.value
			li.appendChild(strong)
			li.appendChild(span)
			list.appendChild(li)
		}

		pageTextContainer.appendChild(list)

		// keep the right-side image minimal (credit image); do not start typing or narration
		try {
			if (narration) {
				narration.pause()
				narration.currentTime = 0
			}
		} catch (e) {}
		updateNavVisibility()
		return
	}

	// Prepare container for absolute positioning so we can place the text block
	try {
		pageTextContainer.style.position = 'relative'
	} catch (e) {}

	// Measure the full height of the text without showing it (inherits container styles)
	const measureP = document.createElement('p')
	measureP.style.visibility = 'hidden'
	measureP.style.position = 'absolute'
	measureP.style.left = '0'
	measureP.style.top = '0'
	measureP.style.whiteSpace = 'pre-wrap'
	measureP.style.width = '100%'
	measureP.textContent = text

	// Temporarily append to inherit font and width, then measure
	pageTextContainer.innerHTML = ''
	pageTextContainer.appendChild(measureP)
	const reservedHeight = measureP.offsetHeight || 0
	// remove measurement node
	pageTextContainer.removeChild(measureP)

	// Compute top to center the final block vertically inside pageTextContainer
	const containerHeight = pageTextContainer.clientHeight || 300
	let topOffset = Math.round((containerHeight - reservedHeight) / 2)
	if (topOffset < 0) topOffset = 0

	// Create visible paragraph positioned absolutely so its top stays fixed while typing
	const p = document.createElement('p')
	p.style.position = 'absolute'
	p.style.left = '0'
	p.style.right = '0'
	p.style.width = '100%'
	p.style.whiteSpace = 'pre-wrap'
	p.style.margin = '0'
	p.style.top = topOffset + 'px'
	pageTextContainer.appendChild(p)

	// Clear any previous typing
	function clearTyping() {
		if (typingTimeout) {
			clearTimeout(typingTimeout)
			typingTimeout = null
		}
		typingIndex = 0
		durationMetadataHandler = null
		typingP = null
	}

	clearTyping()
	typingP = p

	function startTypingWithDuration(durationSeconds) {
		// protect against zero/NaN
		if (!isFinite(durationSeconds) || durationSeconds <= 0) {
			// fallback: fixed speed per char
			const perChar = 75
			doType(perChar)
			return
		}
		const totalChars = text.length || 1
		const perChar = Math.max(10, Math.floor((durationSeconds * 1000) / totalChars))
		doType(perChar)
	}

	function doType(perCharMs) {
		// ensure any previous timeout cleared
		if (typingTimeout) clearTimeout(typingTimeout)
		function step() {
			if (typingIndex <= text.length) {
				typingP.textContent = text.slice(0, typingIndex)
				typingIndex++
				typingTimeout = setTimeout(step, perCharMs)
			} else {
				typingTimeout = null
			}

				// update nav visibility after rendering
				try { updateNavVisibility() } catch (e) {}
		}
		// start immediately
		step()
	}

	// Stop previous narration handler if any
	if (durationMetadataHandler) {
		narration.removeEventListener('loadedmetadata', durationMetadataHandler)
		durationMetadataHandler = null
	}

	// Prepare and start the narration for this page
	try {
		narration.pause()
		narration.currentTime = 0
		narration.src = `/audio/page${n}.mp3`
		// try to play (may be blocked)
		const playPromise = narration.play()
		if (playPromise && typeof playPromise.then === 'function') {
			playPromise.catch(() => {})
		}
	} catch (e) {
		console.warn('Audio play failed', e)
	}

	// Now start typing synchronized to the narration duration
	if (isFinite(narration.duration) && narration.duration > 0) {
		startTypingWithDuration(narration.duration)
	} else {
		// Listen for metadata to get duration
		durationMetadataHandler = () => {
			try {
				startTypingWithDuration(narration.duration)
			} catch (e) {}
			if (narration && durationMetadataHandler) {
				narration.removeEventListener('loadedmetadata', durationMetadataHandler)
				durationMetadataHandler = null
			}
		}
		narration.addEventListener('loadedmetadata', durationMetadataHandler)
		// fallback: if metadata doesn't arrive quickly, start with default per-char
		setTimeout(() => {
			if (!typingTimeout && durationMetadataHandler) {
				startTypingWithDuration(NaN)
			}
		}, 400)
	}
}

function renderCover() {
	// Show the configured cover image as the livre background and hide the page overlays
	if (!container) return

	coverShown = true

	// Swap the .livre CSS background-image to the cover (closed book look)
	try {
		if (livreEl) livreEl.style.backgroundImage = `url('${coverFilename}')`
		// hide the inner img.bg to avoid conflicts
		if (bgImageEl) bgImageEl.style.display = 'none'
		if (livreEl) livreEl.classList.add('cover-mode')
	} catch (e) {}

	// hide the page overlays while cover is shown
	try {
		if (pageImageContainer) pageImageContainer.style.display = 'none'
		if (pageTextContainer) pageTextContainer.style.display = 'none'
	} catch (e) {}

	// ensure nav stays visible (it lives above the bg)
	updateNavVisibility()
	// create and show the cover slider
	try { ensureCoverSlider() } catch (e) {}
	try {
		if (coverVolumeSlider) {
			coverVolumeSlider.value = Math.round((MASTER_VOLUME || 1.0) * 100)
			// visible via CSS in cover-mode; ensure not hidden inline
			coverVolumeSlider.style.display = ''
		}
	} catch (e) {}

	// stop any page narration when showing the cover
	try {
		if (narration) {
			narration.pause()
			narration.currentTime = 0
		}
		// restore background music if it was ducked for narration
		restoreBgAfterNarration()
	} catch (e) {}
}

function openFirstPage() {
	// restore livre background and show the page layout, then render page 1
	coverShown = false
	try {
		// restore original CSS background-image so the open-book skin appears
		if (livreEl) livreEl.style.backgroundImage = originalBgImage || ''
		// ensure inner bg img is hidden (open-book layout uses the CSS background)
		if (bgImageEl) bgImageEl.style.display = 'none'
		if (livreEl) livreEl.classList.remove('cover-mode')
	} catch (e) {}

	try {
		if (pageImageContainer) pageImageContainer.style.display = ''
		if (pageTextContainer) pageTextContainer.style.display = ''
	} catch (e) {}
	renderPage(1)
}

function updateNavVisibility() {
	try {
		if (!btnPrev || !btnNext) return
		if (coverShown) {
			// can't go back from cover
			btnPrev.style.display = 'none'
			btnNext.style.display = ''
			return
		}
		// when showing pages: hide prev only if there's no previous page (we allow prev on page 1 to return to cover)
		btnPrev.style.display = ''
		// hide next on final page
		if (currentPage >= TOTAL_PAGES) btnNext.style.display = 'none'
		else btnNext.style.display = ''
	} catch (e) {}
}

function openContainer(page = 1) {
	if (!container) return
	container.classList.remove('hidden')
	// If opening to page 1, show the book cover first (if available)
	if (page === 1) renderCover()
	else renderPage(page)
	// When opening the book, ensure volume UI exists and is synced
	try {
		ensureVolumeElements()
		updateVolumeIcon()
		applyMasterVolume()
	} catch (e) {}
}

function closeContainer() {
	if (!container) return
	container.classList.add('hidden')
	try {
		narration.pause()
		narration.currentTime = 0
	} catch (e) {}
	// Reset text container styles and content so next open remeasures
	try {
		if (pageTextContainer) {
			pageTextContainer.style.position = ''
			pageTextContainer.style.minHeight = ''
			pageTextContainer.innerHTML = ''
		}
	} catch (e) {}
	// remove/hide cover slider and cover-mode if present
	try {
		if (coverVolumeSlider) {
			// hide when closing the book entirely; keep visible while pages are open
			coverVolumeSlider.style.display = 'none'
		}
		if (livreEl) {
			livreEl.classList.remove('cover-mode')
			// restore original background-image
			if (originalBgImage) livreEl.style.backgroundImage = originalBgImage
		}
	} catch (e) {}
}

// Button handlers (the nav elements are simple divs; click them)
if (btnNext) btnNext.addEventListener('click', () => {
	try {
		if (coverShown) openFirstPage()
		else renderPage(currentPage + 1)
	} catch (e) {}
})
if (btnPrev) btnPrev.addEventListener('click', () => {
	try {
		if (coverShown) {
			// If cover is shown, clicking prev should open the first page as well
			openFirstPage()
			return
		}
		if (currentPage === 1) {
			// go back to cover
			renderCover()
		} else {
			renderPage(currentPage - 1)
		}
	} catch (e) {}
})
if (btnClose) btnClose.addEventListener('click', closeContainer)

// Navigation intuitive : clic sur image = page suivante, clic sur texte = page précédente
if (pageImageContainer) {
	pageImageContainer.addEventListener('click', () => {
		try {
			if (coverShown) openFirstPage()
			else renderPage(currentPage + 1)
		} catch (e) {}
	})
}
if (pageTextContainer) {
	pageTextContainer.addEventListener('click', () => {
		try {
			if (coverShown) openFirstPage()
			else renderPage(currentPage - 1)
		} catch (e) {}
	})
}

// Keyboard handling: X opens/closes, arrows navigate, Escape closes
window.addEventListener('keydown', (e) => {
	if (!e.key) return
	const key = e.key.toLowerCase()
	if (key === 'x') {
		if (!container) return
		if (container.classList.contains('hidden')) openContainer(1)
		else closeContainer()
		return
	}

	// If container is hidden, do not handle navigation keys
	if (!container || container.classList.contains('hidden')) return

		if (coverShown) {
			// If cover is shown, allow both arrows to open the first page
			if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
				try { e.preventDefault() } catch (er) {}
				openFirstPage()
			} else if (e.key === 'Escape') closeContainer()
			return
		}

	if (e.key === 'ArrowLeft') {
		// If we're on page 1 and not showing the cover, the left arrow should
		// return to the closed cover instead of trying to go to page 0.
		if (currentPage === 1) {
			renderCover()
		} else {
			renderPage(currentPage - 1)
		}
	} else if (e.key === 'ArrowRight') {
		renderPage(currentPage + 1)
	} else if (e.key === 'Escape') {
		closeContainer()
	}
})

// Expose minimal API for later use
window.bookBase = { openContainer, closeContainer, renderPage }

// --- Touch handling for tablets: toucher l'écran émule la touche 'X' ---
// Nous détectons les tablettes de manière pragmatique (userAgent + touchpoints
// + taille d'écran) et, si c'est une tablette, nous écoutons le premier
// 'pointerdown' / 'touchstart' pour basculer l'ouverture/fermeture du livre.
;(function() {
	try {
		const ua = (navigator && navigator.userAgent || '').toLowerCase()
		const hasTouch = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || ('ontouchstart' in window) || (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0)

		const isIos = /ipad|iphone|ipod/.test(ua)
		const isIpad = /ipad/.test(ua) || (isIos && (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
		const isAndroidTablet = /android/.test(ua) && !/mobile/.test(ua)
		const uaContainsTablet = /tablet/.test(ua)

		// Heuristique supplémentaire : si appareil tactile et écran relativement large
		const shortSide = Math.min(window.screen.width || 0, window.screen.height || 0) || 0
		const likelyTabletBySize = hasTouch && shortSide >= 600 && shortSide <= 1400

		const isTablet = Boolean(isIpad || isAndroidTablet || uaContainsTablet || likelyTabletBySize)

		if (!isTablet) return

		// Handler unique pour éviter multiples triggers lors de gestures
		let touchHandled = false
		function onFirstTouch(e) {
			try {
				if (touchHandled) return
				touchHandled = true
				// Si l'overlay du livre est caché, ouvrir sur la couverture/page 1
				if (!container) return
				if (container.classList.contains('hidden')) openContainer(1)
				else closeContainer()
			} catch (err) {}
		}

		// Use pointerdown when available (covers mouse/touch/pen) but prefer touchstart
		window.addEventListener('pointerdown', onFirstTouch, { passive: true, capture: false })
		window.addEventListener('touchstart', onFirstTouch, { passive: true, capture: false })
	} catch (e) {}
})()

// Wire up volume UI immediately so the global slider works without opening the book
try {
	ensureVolumeElements()
} catch (e) {}

// ------ Top-left UI hint (press X to open) ------
// Create a non-interactive visual hint that is visible while the book is closed
let uiOpenHint = null
function createUiOpenHint() {
	try {
		if (uiOpenHint) return uiOpenHint
		uiOpenHint = document.createElement('img')
		uiOpenHint.className = 'ui-open-hint'
		uiOpenHint.alt = 'Appuyez sur X pour ouvrir le livre'
		uiOpenHint.src = '/ui-interface.png'
		// Start hidden if the container is visible
		if (!container || !container.classList.contains('hidden')) {
			uiOpenHint.classList.add('hidden')
		}
		document.body.appendChild(uiOpenHint)
		return uiOpenHint
	} catch (e) { return null }
}

function showUiOpenHint() {
	try {
		const el = createUiOpenHint()
		if (!el) return
		if (container && !container.classList.contains('hidden')) {
			el.classList.add('hidden')
		} else {
			el.classList.remove('hidden')
		}
	} catch (e) {}
}

// Ensure hint updates when opening/closing the book
const originalOpenContainer = openContainer
const originalCloseContainer = closeContainer
openContainer = function(page = 1) {
	try { originalOpenContainer(page) } catch (e) {}
	try { showUiOpenHint() } catch (e) {}
}
closeContainer = function() {
	try { originalCloseContainer() } catch (e) {}
	try { showUiOpenHint() } catch (e) {}
}

// Initialize the hint once on load
try { createUiOpenHint(); showUiOpenHint() } catch (e) {}