(function () {
	'use strict';

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// ── Theme ─────────────────────────────────────────
	const html = document.documentElement;
	const themeLabels = document.querySelectorAll('[data-theme-label]');

	function updateThemeLabels() {
		const next = html.classList.contains('dark') ? 'Light' : 'Dark';
		themeLabels.forEach((el) => { el.textContent = next; });
	}

	const saved = localStorage.getItem('theme');
	if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
		html.classList.add('dark');
	}
	updateThemeLabels();

	function toggleTheme() {
		html.classList.toggle('dark');
		localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
		updateThemeLabels();
	}

	document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
		btn.addEventListener('click', toggleTheme);
	});

	// ── Scroll: progress, nav, back-to-top ────────────
	const progressBar = document.getElementById('scroll-progress');
	const navDesktop = document.getElementById('section-nav');
	const backToTop = document.getElementById('back-to-top');

	function onScroll() {
		const scrollY = window.scrollY;
		const max = document.documentElement.scrollHeight - window.innerHeight;
		if (progressBar && max > 0) {
			progressBar.style.width = `${(scrollY / max) * 100}%`;
		}
		if (navDesktop) {
			navDesktop.classList.toggle('is-visible', scrollY > 280);
		}
		if (backToTop) {
			backToTop.classList.toggle('is-visible', scrollY > 600);
		}
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	if (backToTop) {
		backToTop.addEventListener('click', () => {
			window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
		});
	}

	// ── Reveal on scroll ──────────────────────────────
	document.querySelectorAll('.reveal').forEach((el) => {
		const obs = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						e.target.classList.add('is-visible');
						obs.unobserve(e.target);
					}
				});
			},
			{ threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
		);
		obs.observe(el);
	});

	// ── Active nav link ───────────────────────────────
	const navLinks = document.querySelectorAll('.nav-link[data-section]');
	const sections = [...navLinks].map((l) => document.getElementById(l.dataset.section)).filter(Boolean);

	if (sections.length) {
		const activeObs = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (!e.isIntersecting) return;
					const id = e.target.id;
					navLinks.forEach((l) => {
						l.classList.toggle('is-active', l.dataset.section === id);
						if (l.dataset.section === id) l.setAttribute('aria-current', 'true');
						else l.removeAttribute('aria-current');
					});
				});
			},
			{ rootMargin: '-40% 0px -55% 0px', threshold: 0 }
		);
		sections.forEach((s) => activeObs.observe(s));
	}

	// ── Mobile menu ───────────────────────────────────
	const mobileNav = document.getElementById('mobile-nav');
	const menuBtn = document.getElementById('mobile-menu-btn');
	const closeBtn = document.getElementById('mobile-close-btn');

	function setMenuOpen(open) {
		if (!mobileNav || !menuBtn) return;
		mobileNav.classList.toggle('is-open', open);
		mobileNav.setAttribute('aria-hidden', String(!open));
		menuBtn.setAttribute('aria-expanded', String(open));
		document.body.style.overflow = open ? 'hidden' : '';
	}

	if (menuBtn) menuBtn.addEventListener('click', () => setMenuOpen(!mobileNav.classList.contains('is-open')));
	if (closeBtn) closeBtn.addEventListener('click', () => setMenuOpen(false));
	document.querySelectorAll('.mobile-nav-link').forEach((l) => {
		l.addEventListener('click', () => setMenuOpen(false));
	});

	// ── Publication filters ───────────────────────────
	const pubCards = Array.from(document.querySelectorAll('.publication-card[data-type]'));
	const activeFilters = { type: 'all', year: 'all' };
	let isFiltering = false;

	document.querySelectorAll('.filter-btn').forEach((btn) => {
		btn.addEventListener('click', () => {
			if (isFiltering) return;
			const group = btn.dataset.filterGroup;
			const value = btn.dataset.filter;
			if (activeFilters[group] === value) return;
			isFiltering = true;
			document.querySelectorAll(`.filter-btn[data-filter-group="${group}"]`).forEach((b) => {
				b.classList.remove('active');
				b.setAttribute('aria-pressed', 'false');
			});
			btn.classList.add('active');
			btn.setAttribute('aria-pressed', 'true');
			activeFilters[group] = value;

			let pending = 0;
			pubCards.forEach((card) => {
				const match =
					(activeFilters.type === 'all' || card.dataset.type === activeFilters.type) &&
					(activeFilters.year === 'all' || card.dataset.year === activeFilters.year);
				const hidden = card.classList.contains('is-hidden');
				if (match) {
					if (hidden) {
						card.classList.remove('is-hidden');
						void card.offsetWidth;
						card.classList.remove('is-hiding');
					}
				} else if (!hidden) {
					pending++;
					card.classList.add('is-hiding');
					card.addEventListener(
						'transitionend',
						function handler(e) {
							if (e.propertyName !== 'opacity') return;
							card.classList.add('is-hidden');
							if (--pending === 0) isFiltering = false;
						},
						{ once: true }
					);
					setTimeout(() => {
						if (isFiltering && pending > 0 && !card.classList.contains('is-hidden')) {
							card.classList.add('is-hidden');
							if (--pending === 0) isFiltering = false;
						}
					}, 400);
				}
			});
			if (pending === 0) setTimeout(() => { isFiltering = false; }, 50);
		});
	});

	// ── Publication timeline ──────────────────────────
	const timelineEl = document.getElementById('pub-timeline');
	if (timelineEl && pubCards.length) {
		const years = [...new Set(pubCards.map((p) => p.dataset.year))].sort();
		years.forEach((year) => {
			const col = document.createElement('div');
			col.className = 'timeline-year';
			const label = document.createElement('span');
			label.textContent = year;
			col.appendChild(label);
			const nodes = document.createElement('div');
			nodes.className = 'timeline-nodes';
			pubCards
				.filter((p) => p.dataset.year === year)
				.forEach((pub) => {
					const node = document.createElement('button');
					node.type = 'button';
					node.className = `timeline-node ${pub.dataset.type === 'journal' ? 'journal' : 'conference'}`;
					node.setAttribute('aria-label', `Scroll to ${year} publication`);
					node.addEventListener('click', () => {
						pub.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
						pub.classList.add('is-highlight');
						setTimeout(() => pub.classList.remove('is-highlight'), 2000);
					});
					nodes.appendChild(node);
				});
			col.appendChild(nodes);
			timelineEl.appendChild(col);
		});
	}

	// ── Stat counters (respect reduced motion) ────────
	const countEls = document.querySelectorAll('[data-count]');
	if (countEls.length) {
		const showFinal = (el) => {
			const target = el.dataset.count;
			const suffix = el.dataset.suffix || '';
			el.textContent = target + suffix;
		};
		if (prefersReducedMotion) {
			countEls.forEach(showFinal);
		} else {
			const countObs = new IntersectionObserver(
				(entries) => {
					entries.forEach((e) => {
						if (!e.isIntersecting) return;
						const el = e.target;
						const target = +el.dataset.count;
						const suffix = el.dataset.suffix || '';
						const dur = 1200;
						const step = 16;
						const steps = dur / step;
						let cur = 0;
						const inc = () => {
							cur = Math.min(cur + target / steps, target);
							el.textContent = Math.round(cur) + suffix;
							if (cur < target) setTimeout(inc, step);
						};
						inc();
						countObs.unobserve(el);
					});
				},
				{ threshold: 0.5 }
			);
			countEls.forEach((el) => countObs.observe(el));
		}
	}

	// ── Cmd+K palette ─────────────────────────────────
	const cmdkOverlay = document.getElementById('cmdk-overlay');
	const cmdkInput = document.getElementById('cmdk-input');
	const cmdkResults = document.getElementById('cmdk-results');
	let cmdSelectedIndex = 0;

	const commands = [
		{ title: 'Go to About', type: 'Section', action: () => document.getElementById('about')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' }) },
		{ title: 'Go to Experience', type: 'Section', action: () => document.getElementById('experience')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' }) },
		{ title: 'Go to Publications', type: 'Section', action: () => document.getElementById('publications')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' }) },
		{ title: 'Go to Teaching', type: 'Section', action: () => document.getElementById('teaching')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' }) },
		{ title: 'Go to Expertise', type: 'Section', action: () => document.getElementById('expertise')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' }) },
		{ title: 'Go to Education', type: 'Section', action: () => document.getElementById('education')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' }) },
		{ title: 'Go to Honors', type: 'Section', action: () => document.getElementById('honors')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' }) },
		{ title: 'Toggle theme', type: 'Action', action: toggleTheme },
		{ title: 'Download short CV', type: 'Link', action: () => window.open('Theocharopoulos_CV.pdf', '_blank') },
		{ title: 'Download full CV', type: 'Link', action: () => window.open('PTheocharopoulos_ACV.pdf', '_blank') },
		{ title: 'Send email', type: 'Contact', action: () => { window.location.href = 'mailto:panos.t95@gmail.com'; } },
	];

	function closeCmdk() {
		if (!cmdkOverlay) return;
		cmdkOverlay.classList.remove('is-open');
		cmdkOverlay.setAttribute('aria-hidden', 'true');
		document.body.style.overflow = '';
		if (cmdkInput) cmdkInput.value = '';
	}

	function openCmdk() {
		if (!cmdkOverlay) return;
		cmdkOverlay.classList.add('is-open');
		cmdkOverlay.setAttribute('aria-hidden', 'false');
		document.body.style.overflow = 'hidden';
		cmdSelectedIndex = 0;
		renderCmdk('');
		setTimeout(() => cmdkInput?.focus(), 50);
	}

	function renderCmdk(query) {
		if (!cmdkResults) return;
		const q = query.toLowerCase();
		const filtered = commands.filter(
			(c) => c.title.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)
		);
		cmdkResults.innerHTML = '';
		filtered.forEach((cmd, idx) => {
			const el = document.createElement('div');
			el.className = 'cmdk-item' + (idx === cmdSelectedIndex ? ' is-selected' : '');
			el.innerHTML = `<span>${cmd.title}</span><span class="cmdk-item-type">${cmd.type}</span>`;
			el.addEventListener('click', () => { cmd.action(); closeCmdk(); });
			cmdkResults.appendChild(el);
		});
	}

	if (cmdkOverlay && cmdkInput) {
		cmdkOverlay.addEventListener('click', (e) => {
			if (e.target === cmdkOverlay) closeCmdk();
		});
		cmdkInput.addEventListener('input', () => {
			cmdSelectedIndex = 0;
			renderCmdk(cmdkInput.value);
		});
		document.addEventListener('keydown', (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				cmdkOverlay.classList.contains('is-open') ? closeCmdk() : openCmdk();
			}
			if (!cmdkOverlay.classList.contains('is-open')) return;
			if (e.key === 'Escape') closeCmdk();
			const filtered = commands.filter(
				(c) =>
					c.title.toLowerCase().includes(cmdkInput.value.toLowerCase()) ||
					c.type.toLowerCase().includes(cmdkInput.value.toLowerCase())
			);
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				cmdSelectedIndex = Math.min(cmdSelectedIndex + 1, filtered.length - 1);
				renderCmdk(cmdkInput.value);
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				cmdSelectedIndex = Math.max(cmdSelectedIndex - 1, 0);
				renderCmdk(cmdkInput.value);
			}
			if (e.key === 'Enter' && filtered[cmdSelectedIndex]) {
				e.preventDefault();
				filtered[cmdSelectedIndex].action();
				closeCmdk();
			}
		});
	}

	// ── Current year ──────────────────────────────────
	const yearEl = document.getElementById('current-year');
	if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
