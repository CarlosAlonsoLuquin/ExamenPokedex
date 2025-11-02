
let trainerData = null; // Datos del entrenador actual
let pokemonEncontrado = null; // Pokémon encontrado en la búsqueda

const trainerForm = document.getElementById('trainer-form');
const trainerNameInput = document.getElementById('trainer-name');
const trainerEmailInput = document.getElementById('trainer-email');
const trainerDateInput = document.getElementById('trainer-date');

const errorName = document.getElementById('error-name');
const errorEmail = document.getElementById('error-email');
const errorDate = document.getElementById('error-date');

const registroSection = document.getElementById('registro-section');
const busquedaSection = document.getElementById('busqueda-section');
const equipoSection = document.getElementById('equipo-section');

const pokemonSearchInput = document.getElementById('pokemon-search');
const btnBuscar = document.getElementById('btn-buscar');
const searchError = document.getElementById('search-error');
const pokemonPreview = document.getElementById('pokemon-preview');
const previewSprite = document.getElementById('preview-sprite');
const previewName = document.getElementById('preview-name');
const btnAddTeam = document.getElementById('btn-add-team');

const trainerInfo = document.getElementById('trainer-info');
const equipoList = document.getElementById('equipo-list');
const btnLogout = document.getElementById('btn-logout');


window.addEventListener('DOMContentLoaded', () => {
    cargarEntrenador();
    configurarValidacion();
    configurarLogout();
});


function configurarValidacion() {
    // Validar nombre 
    trainerNameInput.addEventListener('input', () => {
        if (trainerNameInput.value.length < 3) {
            errorName.textContent = 'El nombre debe tener al menos 3 caracteres';
            trainerNameInput.classList.add('invalid');
            trainerNameInput.classList.remove('valid');
        } else {
            errorName.textContent = '';
            trainerNameInput.classList.add('valid');
            trainerNameInput.classList.remove('invalid');
        }
    });

    // Validar email
    trainerEmailInput.addEventListener('input', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trainerEmailInput.value)) {
            errorEmail.textContent = 'Ingresa un email válido';
            trainerEmailInput.classList.add('invalid');
            trainerEmailInput.classList.remove('valid');
        } else {
            errorEmail.textContent = '';
            trainerEmailInput.classList.add('valid');
            trainerEmailInput.classList.remove('invalid');
        }
    });

    trainerDateInput.addEventListener('input', () => {
        const fechaSeleccionada = new Date(trainerDateInput.value);
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0);

        if (fechaSeleccionada > fechaActual) {
            errorDate.textContent = 'La fecha no puede ser en el futuro';
            trainerDateInput.classList.add('invalid');
            trainerDateInput.classList.remove('valid');
        } else {
            errorDate.textContent = '';
            trainerDateInput.classList.add('valid');
            trainerDateInput.classList.remove('invalid');
        }
    });
}

trainerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombreValido = trainerNameInput.value.length >= 3;
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trainerEmailInput.value);
    const fechaSeleccionada = new Date(trainerDateInput.value);
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);
    const fechaValida = fechaSeleccionada <= fechaActual;

    if (nombreValido && emailValido && fechaValida) {
        trainerData = {
            id: Date.now(), 
            trainerName: trainerNameInput.value,
            email: trainerEmailInput.value,
            startDate: trainerDateInput.value,
            equipo: []
        };

       
        localStorage.setItem('trainer', JSON.stringify(trainerData));

        
        registroSection.classList.add('hidden');
        busquedaSection.classList.remove('hidden');
        equipoSection.classList.remove('hidden');

        mostrarInfoEntrenador();
    } else {
        alert('Por favor, corrige los errores en el formulario');
    }
});

function cargarEntrenador() {
    const trainerGuardado = localStorage.getItem('trainer');
    
    if (trainerGuardado) {
        trainerData = JSON.parse(trainerGuardado);
        
        // Ocultar formulario y mostrar secciones
        registroSection.classList.add('hidden');
        busquedaSection.classList.remove('hidden');
        equipoSection.classList.remove('hidden');
        
        mostrarInfoEntrenador();
        renderizarEquipo();
    }
}


function mostrarInfoEntrenador() {
    trainerInfo.innerHTML = `
        <h3>👤 Entrenador: ${trainerData.trainerName}</h3>
        <p>📧 Email: ${trainerData.email}</p>
        <p>📅 Inicio de aventura: ${trainerData.startDate}</p>
        <p>⚡ Pokémon en el equipo: ${trainerData.equipo.length}</p>
    `;
}
btnBuscar.addEventListener('click', buscarPokemon);

pokemonSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        buscarPokemon();
    }
});

async function buscarPokemon() {
    const nombrePokemon = pokemonSearchInput.value.trim().toLowerCase();
    
    if (!nombrePokemon) {
        mostrarError('Por favor, escribe el nombre de un Pokémon');
        return;
    }

    try {
        
        const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombrePokemon}`);
        
        if (!respuesta.ok) {
            throw new Error('Pokémon no encontrado');
        }

        const pokemon = await respuesta.json();
        
        
        pokemonEncontrado = {
            id: pokemon.id,
            nombre: pokemon.name,
            sprite: pokemon.sprites.front_default
        };

        
        mostrarVistaPrevia(pokemonEncontrado);
        searchError.classList.add('hidden');

    } catch (error) {
        mostrarError('No se encontró el Pokémon. Intenta con otro nombre.');
        pokemonPreview.classList.add('hidden');
    }
}

function mostrarVistaPrevia(pokemon) {
    previewSprite.src = pokemon.sprite;
    previewName.textContent = pokemon.nombre;
    pokemonPreview.classList.remove('hidden');
}

btnAddTeam.addEventListener('click', () => {
    if (!pokemonEncontrado) return;

    
    const yaExiste = trainerData.equipo.some(p => p.id === pokemonEncontrado.id);
    
    if (yaExiste) {
        alert('¡Este Pokémon ya está en tu equipo!');
        return;
    }

    
    const nombrePokemon = pokemonEncontrado.nombre;

    
    trainerData.equipo.push({
        ...pokemonEncontrado,
        favorito: false
    });

    
    localStorage.setItem('trainer', JSON.stringify(trainerData));

   
    renderizarEquipo();
    mostrarInfoEntrenador();

   
    pokemonSearchInput.value = '';
    pokemonPreview.classList.add('hidden');
    pokemonEncontrado = null;

    alert(`¡${nombrePokemon} ha sido añadido a tu equipo!`);
});

function renderizarEquipo() {
    equipoList.innerHTML = '';

    if (trainerData.equipo.length === 0) {
        equipoList.innerHTML = '<p style="text-align: center; color: #999;">No tienes Pokémon en tu equipo aún. ¡Busca y captura algunos!</p>';
        return;
    }

    trainerData.equipo.forEach((pokemon, index) => {
        const li = document.createElement('li');
        li.className = `pokemon-item ${pokemon.favorito ? 'favorito' : ''}`;
        
        li.innerHTML = `
            <div class="pokemon-info">
                <img src="${pokemon.sprite}" alt="${pokemon.nombre}">
                <h3>${pokemon.nombre}</h3>
            </div>
            <div class="pokemon-actions">
                <label class="favorite-label">
                    <input type="checkbox" ${pokemon.favorito ? 'checked' : ''} 
                           onchange="toggleFavorito(${index})">
                    ⭐ Favorito
                </label>
                <button class="btn btn-danger" onclick="liberarPokemon(${index})">
                    Liberar
                </button>
            </div>
        `;
        
        equipoList.appendChild(li);
    });
}

function toggleFavorito(index) {
    trainerData.equipo[index].favorito = !trainerData.equipo[index].favorito;
    localStorage.setItem('trainer', JSON.stringify(trainerData));
    renderizarEquipo();
}
function liberarPokemon(index) {
    const pokemon = trainerData.equipo[index];
    
    if (confirm(`¿Estás seguro de que quieres liberar a ${pokemon.nombre}?`)) {
        trainerData.equipo.splice(index, 1);
        localStorage.setItem('trainer', JSON.stringify(trainerData));
        renderizarEquipo();
        mostrarInfoEntrenador();
    }
}


function mostrarError(mensaje) {
    searchError.textContent = mensaje;
    searchError.classList.remove('hidden');
}

function configurarLogout() {
    btnLogout.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres cerrar sesión? Se perderán todos los datos del entrenador y su equipo.')) {
           
            localStorage.removeItem('trainer');
            
            
            trainerData = null;
            
            trainerForm.reset();
            trainerNameInput.classList.remove('valid', 'invalid');
            trainerEmailInput.classList.remove('valid', 'invalid');
            trainerDateInput.classList.remove('valid', 'invalid');
            errorName.textContent = '';
            errorEmail.textContent = '';
            errorDate.textContent = '';
            
            
            pokemonSearchInput.value = '';
            pokemonPreview.classList.add('hidden');
            searchError.classList.add('hidden');
            
            
            registroSection.classList.remove('hidden');
            busquedaSection.classList.add('hidden');
            equipoSection.classList.add('hidden');
            
            alert('Sesión cerrada correctamente. ¡Hasta pronto, entrenador!');
        }
    });
}