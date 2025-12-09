console.log('DB_PROVIDER:', process.env.DB_PROVIDER);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL Host:', process.env.DATABASE_URL.includes('localhost') ? 'Localhost' : 'Remote (Supabase?)');
}
console.log('SUPABASE_DATABASE_URL:', process.env.SUPABASE_DATABASE_URL ? 'Set' : 'Not Set');
if (process.env.SUPABASE_DATABASE_URL) {
    console.log('SUPABASE_DATABASE_URL Host:', process.env.SUPABASE_DATABASE_URL.includes('supabase.co') ? 'Supabase' : 'Other');
}
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('LOCAL_DATABASE_URL:', process.env.LOCAL_DATABASE_URL);
