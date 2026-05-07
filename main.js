/**
 * main.js - Lógica de procesos del trabajador
 */

// --- UTILIDADES ---

function mostrarToast(mensagem, tipo, icone) {
    const toasts = document.querySelectorAll(".toastify");
    toasts.forEach(t => t.remove());

    let bgColor = "#334155"; 
    if (tipo === 'sucesso') bgColor = "#10b981"; 
    else if (tipo === 'erro') bgColor = "#ef4444"; 
    else if (tipo === 'aviso') bgColor = "#f59e0b"; 

    const contentNode = document.createElement("div");
    contentNode.className = "flex items-center justify-center gap-3 w-full";
    contentNode.innerHTML = `<i data-lucide="${icone}" class="w-5 h-5 flex-shrink-0"></i> <span class="text-left">${mensagem}</span>`;

    Toastify({
        node: contentNode,
        duration: 3500,
        gravity: "top",
        position: "center",
        style: { 
            background: bgColor, 
            borderRadius: "12px", 
            fontSize: "14px",     
            padding: "12px 20px",  
            fontWeight: "600",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            width: "90%",
            maxWidth: "400px",
            margin: "0 auto",
            position: "fixed",
            left: "0", right: "0", top: "20px"
        }
    }).showToast();

    if (window.lucide) lucide.createIcons();
}

function mostrarConfirmacionPersonalizada() {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm');
        const container = document.getElementById('modal-container');
        const btnAccept = document.getElementById('confirm-accept');
        const btnCancel = document.getElementById('confirm-cancel');

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
            container.classList.remove('scale-95', 'opacity-0');
            container.classList.add('scale-100', 'opacity-100');
        }, 10);

        function cerrar(valor) {
            container.classList.remove('scale-100', 'opacity-100');
            container.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                resolve(valor);
            }, 200);
        }

        btnAccept.onclick = () => cerrar(true);
        btnCancel.onclick = () => cerrar(false);
    });
}

// --- FUNCIÓN CORREGIDA: VERIFICAR ESTADO AL CARGAR ---
async function verificarEstadoSala() {
    const statusSala = document.getElementById('status-sala');
    const statusDot = document.getElementById('status-dot');
    
    if (!statusSala) return;

    try {
        const salas = await SupabaseAPI.obtenerSalas();
        
        // Verificamos si el array tiene contenido
        if (salas && salas.length > 0) {
            const salaAtiva = salas[0];
            const url = salaAtiva.url_sala || salaAtiva.url; 

            if (url) {
                const partes = url.split('/');
                const ultimaParte = partes[partes.length - 1] || "";
                const nombreSala = ultimaParte.split('#')[0] || "Sala Ativa";
                
                statusSala.innerHTML = `Ativa: <a href="${url}" target="_blank" class="underline hover:text-blue-600 transition-colors font-bold">${nombreSala}</a>`;
                
                if (statusDot) {
                    statusDot.classList.remove('bg-slate-300');
                    statusDot.classList.add('bg-emerald-500');
                }
            } else {
                statusSala.innerText = "Nenhuma chamada activa";
            }
        } else {
            // Si el array está vacío o no hay salas
            statusSala.innerText = "Nenhuma chamada activa";
            if (statusDot) {
                statusDot.classList.remove('bg-emerald-500');
                statusDot.classList.add('bg-slate-300');
            }
        }
    } catch (err) {
        console.error(err);
        statusSala.innerText = "Nenhuma llamada activa";
    }
}

// --- INICIO DE LA APLICACIÓN ---

document.addEventListener('DOMContentLoaded', () => {
    
    verificarEstadoSala();

    // --- 1. LÓGICA DE LOGIN ---
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;

            try {
                const data = await SupabaseAPI.login(email, password);
                if (data && data.access_token) {
                    localStorage.setItem('supabase_token', data.access_token);
                    mostrarToast("Bem-vindo!", "sucesso", "check-circle");
                    setTimeout(() => { window.location.href = 'gestao.html'; }, 1000);
                }
            } catch (err) {
                mostrarToast("Credenciais incorretas.", "erro", "alert-circle");
            }
        });
    }

    // --- 2. LÓGICA DE ACTIVACIÓN DE SALA ---
    const btnActivar = document.getElementById('btn-activar-video');
    if (btnActivar) {
        btnActivar.addEventListener('click', async () => {
            try {
                btnActivar.disabled = true;
                btnActivar.classList.add('opacity-50', 'cursor-wait');

                const salasExistentes = await SupabaseAPI.obtenerSalas();
                
                if (salasExistentes && salasExistentes.length > 0) {
                    const confirmar = await mostrarConfirmacionPersonalizada();
                    if (!confirmar) {
                        mostrarToast("Operação cancelada", "aviso", "x-circle");
                        btnActivar.disabled = false;
                        btnActivar.classList.remove('opacity-50', 'cursor-wait');
                        return; 
                    }
                }

                await SupabaseAPI.borrarSalas();

                const ahora = new Date();
                const fecha = ahora.getFullYear().toString() +
                              (ahora.getMonth() + 1).toString().padStart(2, '0') +
                              ahora.getDate().toString().padStart(2, '0');
                const hora = ahora.getHours().toString().padStart(2, '0') +
                             ahora.getMinutes().toString().padStart(2, '0') +
                             ahora.getSeconds().toString().padStart(2, '0');

                const timestamp = `${fecha}-${hora}`;
                const fullUrl = `https://zoom.myserver.pt:8443/suporte.com.pt-${timestamp}#userInfo.displayName=%22convidado%22&config.startAudioMuted=0&config.deeplinking.disabled=true`;

                await SupabaseAPI.crearSala(fullUrl);

                mostrarToast("Nova sala ativada!", "sucesso", "video");
                
                await verificarEstadoSala();

                setTimeout(() => {
                    window.open(fullUrl, '_blank');
                    btnActivar.disabled = false;
                    btnActivar.classList.remove('opacity-50', 'cursor-wait');
                }, 800);

            } catch (err) {
                console.error(err);
                mostrarToast("Erro ao crear sala.", "erro", "alert-triangle");
                btnActivar.disabled = false;
                btnActivar.classList.remove('opacity-50', 'cursor-wait');
            }
        });
    }

    // --- 3. LÓGICA DE LOGOUT ---
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('supabase_token');
            window.location.href = 'index.html';
        });
    }
});