let state = { searchQuery: "", selectedGenre: "Todos", selectedMood: null, favorites: JSON.parse(sessionStorage.getItem("favs") || "[]"), activeModalAnimeId: null };

function renderCatalog() {
    const grid = document.getElementById("anime-grid");
    if (!grid) return;
    
    let filtered = animeCatalog.filter(anime => {
        const matchesGenre = state.selectedGenre === "Todos" || anime.genres.includes(state.selectedGenre);
        const matchesMood = !state.selectedMood || anime.mood === state.selectedMood;
        const q = state.searchQuery.toLowerCase().trim();
        // Filtro estricto para el catálogo principal también si se desea por inicio
        const matchesQuery = !q || anime.title.toLowerCase().startsWith(q) || anime.jpTitle.toLowerCase().startsWith(q);
        return matchesGenre && matchesMood && matchesQuery;
    });

    grid.innerHTML = filtered.map(anime => {
        const isFav = state.favorites.includes(anime.id);
        return `
        <article class="card-hover group bg-white/90 dark:bg-night-800/90 backdrop-blur-md rounded-3xl overflow-hidden border border-lily-200/80 dark:border-night-700 shadow-sm flex flex-col justify-between">
            <div onclick="window.location.href='detail.html?id=${anime.id}'" class="relative h-72 bg-slate-900 cursor-pointer overflow-hidden">
                <img src="${anime.customImage}" alt="${anime.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none"></div>
                
                <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span class="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-bold tracking-wide shadow-md">
                        ${anime.year} • ${anime.episodes}
                    </span>
                </div>

                <button onclick="event.stopPropagation(); toggleFavorite(${anime.id})" class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 dark:bg-night-900/95 hover:scale-110 transition-transform flex items-center justify-center shadow-lg">
                    <i data-lucide="heart" class="w-4 h-4 ${isFav ? 'fill-lily-600 text-lily-600' : 'text-slate-500 dark:text-slate-300'}"></i>
                </button>

                <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                    <span class="px-2.5 py-1 rounded-lg bg-lily-600/90 backdrop-blur-sm shadow-sm">${anime.studio}</span>
                    <span class="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm"><i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i> ${anime.rating}</span>
                </div>
            </div>

            <div class="p-6 space-y-3">
                <div class="flex flex-wrap gap-1.5">
                    ${anime.genres.map(g => `<span class="px-2.5 py-0.5 rounded-full bg-lily-100 dark:bg-night-700 text-lily-800 dark:text-lily-300 text-[10px] font-bold uppercase tracking-wider">${g}</span>`).join('')}
                </div>
                <h3 onclick="window.location.href='detail.html?id=${anime.id}'" class="font-serif text-2xl font-bold text-slate-900 dark:text-white group-hover:text-lily-600 dark:group-hover:text-lily-400 cursor-pointer line-clamp-1 transition-colors">
                    ${anime.title}
                </h3>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-medium -mt-1">${anime.jpTitle}</p>
                <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">${anime.synopsis}</p>
            </div>
        </article>`;
    }).join("");
    lucide.createIcons();
}

function setGenreFilter(genre) {
    state.selectedGenre = genre;
    document.querySelectorAll(".genre-pill").forEach(btn => {
        const isActive = btn.dataset.genre === genre;
        if (isActive) {
            btn.className = "genre-pill px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 bg-lily-600 text-white shadow-md shadow-lily-600/30 ring-2 ring-lily-400 scale-105";
        } else {
            btn.className = "genre-pill px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 bg-white dark:bg-night-800 text-slate-600 dark:text-slate-300 hover:bg-lily-100 dark:hover:bg-night-700 border border-lily-200/80 dark:border-night-700 shadow-xs";
        }
    });
    renderCatalog();
}

function setMoodFilter(mood) {
    state.selectedMood = (state.selectedMood === mood) ? null : mood;
    renderCatalog();
}

function toggleFavorite(id) {
    const index = state.favorites.indexOf(id);
    if (index > -1) state.favorites.splice(index, 1);
    else state.favorites.push(id);
    sessionStorage.setItem("favs", JSON.stringify(state.favorites));
    const badge = document.getElementById("favorites-count-badge");
    if (badge) badge.textContent = state.favorites.length;
    renderCatalog();
}

function toggleFavoritesDrawer() {
    const drawer = document.getElementById("favorites-drawer");
    if (!drawer) return;
    drawer.classList.toggle("hidden");
    drawer.classList.toggle("flex");
    const container = document.getElementById("favorites-list-container");
    if (!container) return;
    
    if (state.favorites.length === 0) {
        container.innerHTML = `
        <div class="text-center py-12 space-y-3">
            <i data-lucide="heart" class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600"></i>
            <p class="text-sm text-slate-400 italic">Tu lista de favoritos está vacía.</p>
        </div>`;
    } else {
        container.innerHTML = state.favorites.map(id => {
            const anime = animeCatalog.find(a => a.id === id);
            if (!anime) return '';
            return `
            <div class="flex items-center justify-between p-3.5 bg-lily-50/80 dark:bg-night-900 rounded-2xl border border-lily-200/70 dark:border-night-700 shadow-xs hover:border-lily-400 transition-all group">
                <div onclick="window.location.href='detail.html?id=${anime.id}'" class="flex items-center gap-3.5 overflow-hidden cursor-pointer flex-1">
                    <img src="${anime.customImage}" alt="${anime.title}" class="w-12 h-16 object-cover rounded-xl shadow-sm shrink-0">
                    <div class="truncate">
                        <h4 class="font-serif text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-lily-600 transition-colors">${anime.title}</h4>
                        <p class="text-[11px] text-slate-400 dark:text-slate-500">${anime.jpTitle} • <span class="text-lily-600 font-semibold">${anime.year}</span></p>
                    </div>
                </div>
                <button onclick="toggleFavorite(${anime.id}); toggleFavoritesDrawer(); toggleFavoritesDrawer();" class="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500 transition-colors shrink-0 ml-2">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>`;
        }).join("");
    }
    lucide.createIcons();
}

function openAnimeModal(id) {
    window.location.href = `detail.html?id=${id}`;
}

function closeAnimeModal() {}

// --- LÓGICA DEL BUSCADOR ESTRICTO POR INICIALES ---
const searchInputDesktop = document.getElementById("search-input-desktop");
const clearSearchBtn = document.getElementById("clear-search-desktop");
const searchDropdown = document.getElementById("search-dropdown-results");

if (searchInputDesktop) {
    searchInputDesktop.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        state.searchQuery = query;
        renderCatalog();

        if (query.length > 0) {
            if (clearSearchBtn) clearSearchBtn.classList.remove("hidden");
            
            // FILTRO ESTRICTO: Solo obras cuyos títulos COMENCEN exactamente con lo que escribes
            const results = animeCatalog.filter(anime => 
                anime.title.toLowerCase().startsWith(query) ||
                anime.jpTitle.toLowerCase().startsWith(query)
            );

            if (searchDropdown) {
                if (results.length > 0) {
                    searchDropdown.innerHTML = results.map(anime => `
                        <a href="detail.html?id=${anime.id}" class="flex items-center gap-3.5 p-3 hover:bg-slate-800/80 transition-colors group">
                            <img src="${anime.customImage}" alt="${anime.title}" class="w-12 h-16 object-cover rounded-lg shrink-0 shadow-md">
                            <div class="flex-1 min-w-0">
                                <h4 class="text-xs sm:text-sm font-bold text-white group-hover:text-lily-400 truncate">${anime.title}</h4>
                                <p class="text-[11px] text-slate-400 mt-0.5">
                                    <span class="text-lily-400 font-semibold">${anime.status || 'Ongoing'}</span> • 
                                    <span class="text-slate-300">${anime.chapterName ? anime.chapterName.split(':')[0] : 'Cap. 1'}</span>
                                </p>
                                <p class="text-[10px] text-slate-500 truncate mt-1">
                                    ${anime.genres.join(", ")}
                                </p>
                            </div>
                        </a>
                    `).join("");
                    searchDropdown.classList.remove("hidden");
                } else {
                    searchDropdown.innerHTML = `<div class="p-4 text-center text-xs text-slate-400 italic">No se encontraron obras que comiencen con "${query}".</div>`;
                    searchDropdown.classList.remove("hidden");
                }
            }
        } else {
            if (clearSearchBtn) clearSearchBtn.classList.add("hidden");
            if (searchDropdown) searchDropdown.classList.add("hidden");
        }
    });
}

function clearSearch() {
    if (searchInputDesktop) {
        searchInputDesktop.value = "";
        if (clearSearchBtn) clearSearchBtn.classList.add("hidden");
        if (searchDropdown) searchDropdown.classList.add("hidden");
        state.searchQuery = "";
        renderCatalog();
    }
}

// Ocultar el desplegable si se hace clic fuera de él
document.addEventListener("click", (e) => {
    if (searchInputDesktop && searchDropdown) {
        if (!searchInputDesktop.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.classList.add("hidden");
        }
    }
});

function resetFilters(e) {
    if(e) e.preventDefault();
    setGenreFilter("Todos");
    clearSearch();
}

function toggleDarkMode() {
    document.documentElement.classList.toggle("dark");
    if (document.documentElement.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const badge = document.getElementById("favorites-count-badge");
    if (badge) badge.textContent = state.favorites.length;
    renderCatalog();
    lucide.createIcons();
});