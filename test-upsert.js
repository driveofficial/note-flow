const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://aoljjkygnczafkzzetor.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbGpqa3lnbmN6YWZrenpldG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NzU3MzYsImV4cCI6MjA4OTE1MTczNn0.PNlZeVdhiPrOn5tfNmntqHQb51c8eFKLUvb0bBute_c";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: readData } = await supabase.from('app_data').select('*').eq('id', 'main').single();
  let tables = readData.data.tables;
  
  // modify arbitrarily
  tables[0].title += " (tested)";
  
  const { data, error } = await supabase.from('app_data').upsert({
    id: 'main',
    data: { ...readData.data, tables }
  }).select();
  
  if (error) {
    console.error('UPSERT ERROR:', error);
  } else {
    console.log('UPSERT SUCCESS:', data[0].data.tables[0].title);
  }
}
test();
