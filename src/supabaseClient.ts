
import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database.types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('VOTRE_URL_SUPABASE') || supabaseAnonKey.includes('VOTRE_CLE_ANON_SUPABASE')) {
    const errorMsg = "Erreur: Clés Supabase non configurées.\n\n" +
                     "Veuillez ouvrir le fichier `index.html` et remplacer les valeurs de `SUPABASE_URL` et `SUPABASE_ANON_KEY` par celles de votre projet Supabase.\n\n" +
                     "Vous trouverez ces clés dans les paramètres de votre projet sur supabase.com > Project Settings > API.";
    
    // Display a more user-friendly message on the page itself
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `<div style="padding: 2rem; font-family: sans-serif; background-color: #fff3f3; border: 2px solid #ff0000; margin: 2rem; border-radius: 8px;">
            <h1 style="color: #ff0000; font-size: 1.5rem;">Erreur de Configuration</h1>
            <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 1rem;">${errorMsg}</pre>
        </div>`;
    }
    
    throw new Error(errorMsg);
}

// Utilise le générique Database pour une auto-complétion et une sécurité de type complètes.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);