// Inicializar datos de prueba en localStorage
export function initializeTestData() {
  const existingUsers = localStorage.getItem('users');
  
  if (!existingUsers) {
    const testUsers = [
      {
        id: 1,
        nombre: 'Admin Usuario',
        email: 'admin@biblioteca.com',
        password: 'admin123', // En producción, esto debe ser hasheado
      },
      {
        id: 2,
        nombre: 'Juan Pérez',
        email: 'juan@biblioteca.com',
        password: 'juan123',
      },
      {
        id: 3,
        nombre: 'María García',
        email: 'maria@biblioteca.com',
        password: 'maria123',
      },
    ];
    
    localStorage.setItem('users', JSON.stringify(testUsers));
  }
}
