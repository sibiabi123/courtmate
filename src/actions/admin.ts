'use server';

export async function verifyAdminPassword(password: string) {
  // In a real cloud deployment, this will read from process.env.ADMIN_PASSWORD
  const secretPassword = process.env.ADMIN_PASSWORD || 'omnipotent123';
  
  if (password === secretPassword) {
    return { success: true };
  }
  return { success: false, error: 'Access Denied: Invalid Credentials' };
}
