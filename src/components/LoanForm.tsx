import { useForm } from 'react-hook-form'
import { Button, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, toast } from '@blinkdotnew/ui'
import { AlertCircle } from 'lucide-react'
import { blink } from '../blink/client'
import type { Book, LibraryUser } from '../types'

interface Props {
  books: Book[]
  users: LibraryUser[]
  onSuccess: () => void
  onCancel: () => void
}

interface FormValues {
  userId: string
  bookId: string
  loanDate: string
  returnDate: string
  status: 'active' | 'returned' | 'overdue'
}

const userTypeLabel: Record<string, string> = {
  student: 'Estudiante',
  teacher: 'Docente',
  external: 'Externo',
}

export default function LoanForm({ books, users, onSuccess, onCancel }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      userId: '',
      bookId: '',
      loanDate: new Date().toISOString().split('T')[0],
      returnDate: '',
      status: 'active',
    },
  })

  const userId = watch('userId')
  const bookId = watch('bookId')
  const status = watch('status')

  const selectedUser = users.find(u => u.id === userId)
  const availableBooks = books.filter(b => Number(b.available) > 0)

  const onSubmit = async (values: FormValues) => {
    try {
      const user = users.find(u => u.id === values.userId)
      await blink.db.loans.create({
        ...values,
        id: `PREST-${Date.now()}`,
        userType: user?.userType ?? 'student',
        createdAt: new Date().toISOString(),
      })
      // mark book as unavailable
      await blink.db.books.update(values.bookId, { available: 0 })
      toast.success('Préstamo registrado correctamente')
      onSuccess()
    } catch {
      toast.error('Error al registrar el préstamo')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Usuario *</label>
        <Select value={userId} onValueChange={v => setValue('userId', v)}>
          <SelectTrigger><SelectValue placeholder="Seleccionar usuario..." /></SelectTrigger>
          <SelectContent>
            {users.map(u => (
              <SelectItem key={u.id} value={u.id}>
                {u.firstName} {u.lastName} — {userTypeLabel[u.userType] ?? u.userType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedUser && (
          <p className="text-xs text-muted-foreground">ID: <span className="font-mono">{selectedUser.id}</span> · Tipo: <span className="font-semibold">{userTypeLabel[selectedUser.userType]}</span></p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Libro (disponibles) *</label>
        {availableBooks.length === 0 ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-3">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-sm font-medium text-destructive">NO HAY LIBROS DISPONIBLES</span>
          </div>
        ) : (
          <Select value={bookId} onValueChange={v => setValue('bookId', v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar libro..." /></SelectTrigger>
            <SelectContent>
              {availableBooks.map(b => (
                <SelectItem key={b.id} value={b.id}>
                  {b.title} — {b.shelfLocation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha de préstamo *</label>
          <Input {...register('loanDate', { required: true })} type="date" />
          {errors.loanDate && <p className="text-xs text-destructive">Requerido</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha de retorno *</label>
          <Input {...register('returnDate', { required: true })} type="date" />
          {errors.returnDate && <p className="text-xs text-destructive">Requerido</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Estado</label>
        <Select value={status} onValueChange={v => setValue('status', v as FormValues['status'])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="returned">Devuelto</SelectItem>
            <SelectItem value="overdue">Vencido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting || availableBooks.length === 0 || !userId || !bookId}>{isSubmitting ? 'Guardando...' : 'Registrar Préstamo'}</Button>
      </div>
    </form>
  )
}
