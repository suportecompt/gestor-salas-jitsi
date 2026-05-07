/**
 * supabase.js - Interfaz de comunicación con la base de datos
 */
const SupabaseAPI = {
    // 1. Autenticación del trabajador
    async login(email, password) {
        const response = await fetch(`${CONFIG.supabaseUrl}${CONFIG.endpoints.auth}`, {
            method: 'POST',
            headers: {
                'apikey': CONFIG.supabaseKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Erro na autenticação');
        }
        
        return await response.json();
    },

    // 2. Obtener salas actuales para verificar duplicados
    async obtenerSalas() {
        const token = localStorage.getItem('supabase_token');
        const response = await fetch(`${CONFIG.supabaseUrl}${CONFIG.endpoints.rest}`, {
            method: 'GET',
            headers: {
                'apikey': CONFIG.supabaseKey,
                'Authorization': `${token}`, 
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) return [];
        return await response.json();
    },

    // 3. Borrar todas las salas antiguas (Vaciar tabla)
    async borrarSalas() {
        const token = localStorage.getItem('supabase_token');
        // Añadimos ?url=not.is.null para asegurar que el servidor procese el borrado de todas las filas
        const response = await fetch(`${CONFIG.supabaseUrl}${CONFIG.endpoints.rest}?url=not.is.null`, {
            method: 'DELETE',
            headers: {
                'apikey': CONFIG.supabaseKey,
                'Authorization': `${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response;
    },

    // 4. Crear la nueva sala (Insertar la única línea permitida)
    async crearSala(urlSala) {
        const token = localStorage.getItem('supabase_token');
        const response = await fetch(`${CONFIG.supabaseUrl}${CONFIG.endpoints.rest}`, {
            method: 'POST',
            headers: {
                'apikey': CONFIG.supabaseKey,
                'Authorization': `${token}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ url: urlSala })
        });
        
        if (!response.ok) throw new Error('Erro ao criar sala');
        return await response.json();
    }
};