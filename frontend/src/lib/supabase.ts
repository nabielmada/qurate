import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jaeqqsmyivzfbdumlbsj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZXFxc215aXZ6ZmJkdW1sYnNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNzAyMzAsImV4cCI6MjA5MTY0NjIzMH0.yktjPDeFQwvjOjukWO_EqwUWnxBj6L9d9BOZ9zBqHnE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
