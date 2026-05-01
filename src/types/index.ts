export interface LibraryUser {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  userType: 'student' | 'teacher' | 'external'
  createdAt: string
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  createdAt: string
}

export interface Book {
  id: string
  title: string
  author: string
  editor: string
  pages: number
  shelfLocation: string
  genre: string
  available: number
  createdAt: string
}

export interface Loan {
  id: string
  userId: string
  userType: string
  bookId: string
  loanDate: string
  returnDate: string
  status: 'active' | 'returned' | 'overdue'
  createdAt: string
}

export interface Reservation {
  id: string
  bookId: string
  userId: string
  reservationDate: string
  returnDate: string
  userStatus: 'active' | 'inactive' | 'suspended'
  employeeId: string
  createdAt: string
}
