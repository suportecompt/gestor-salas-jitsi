/**
 * config.js - Configurações extraídas do sistema principal
 */

const CONFIG = {
    // 1. SUPABASE CONFIGURATION
    supabaseUrl: 'https://supabase1.myserver.pt',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjEyMzQ1Njc4LCJleHAiOjI2MTIzNDU2Nzh9.szPPmYS9Pa9WENwHSgsrd7i_YaYLmmORiVqA9jguyGc',
    
    // Endpoints para chamadas AJAX
    endpoints: {
        auth: "/auth/v1/token?grant_type=password",
        rest: "/rest/v1/jitsi" // Usamos a tabela 'jitsi' conforme definido
    },

    // 2. JITSI CONFIGURATION
    jitsi: {
        baseUrl: 'https://meet.jit.si/',
        domain: 'meet.jit.si',
        defaults: {
            displayName: 'Suporte Técnico', // Nombre para el trabajador
            startAudioMuted: 0,
            disableDeepLinking: true
        }
    }
};

// Constantes de compatibilidade (Caso precises em outros scripts legados)
const SUPABASE_URL = CONFIG.supabaseUrl;
const SUPABASE_ANON_KEY = CONFIG.supabaseKey;
const JITSI_TABLE_URL = `${CONFIG.supabaseUrl}${CONFIG.endpoints.rest}`;