import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// #region agent log
fetch('http://127.0.0.1:7267/ingest/a96f543a-6f38-4522-b1d9-e498be3ccd4f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'227859'},body:JSON.stringify({sessionId:'227859',runId:'startup',hypothesisId:'H_env',location:'lib/supabase.ts:env-check',message:'Supabase env presence check',data:{hasUrl:!!supabaseUrl,urlLen:supabaseUrl?.length??0,hasAnonKey:!!supabaseAnonKey,anonKeyLen:supabaseAnonKey?.length??0},timestamp:Date.now()})}).catch(()=>{});
// #endregion

if (!supabaseUrl || !supabaseAnonKey) {
  // #region agent log
  fetch('http://127.0.0.1:7267/ingest/a96f543a-6f38-4522-b1d9-e498be3ccd4f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'227859'},body:JSON.stringify({sessionId:'227859',runId:'startup',hypothesisId:'H_env',location:'lib/supabase.ts:env-check',message:'Missing Supabase env vars; throwing',data:{missingUrl:!supabaseUrl,missingAnonKey:!supabaseAnonKey},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  throw new Error(
    'Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (e.g. in .env.local) and restart the dev server.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
