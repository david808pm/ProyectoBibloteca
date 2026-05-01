import { useForm } from 'react-hook-form'
import { Button, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, toast } from '@blinkdotnew/ui'
import { AlertCircle } from 'lucide-react'
import { blink } from '../blink/client'
import type { Book, LibraryUser, Employee } from '../types'

interface Props {
  books: Book[]
  users: LibraryUser[]
  employees: Employee[]
  onSuccess: () => void
  onCancel: () => void
}

interface FormValues {
  bookId: string
  userId: string
  reservationDate: string
  returnDate: string
  userStatus: 'active' | 'inactive' | 'suspended'
  employeeId: string
}

export default function ReservationForm({ books, users, employees, onSuccess, onCancel }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      bookId: '',
      userId: '',
      reservationDate: new Date().toISOString().split('T')[0],
      returnDate: '',
      userStatus: 'active',
      employeeId: '',
    },
  })

  const bookId = watch('bookId')
  const userId = watch('userId')
  const userStatus = watch('userStatus')
  const employeeId = watch('employeeId')

  // Only show books that are available (not on loan)
  const availableBooks = books.filter(b => Number(b.available) > 0)
  const noAvailableBooks = availableBooks.length === 0

  const selectedUser = users.find(u => u.id === userId)
  const selectedEmployee = employees.find(e => e.id === employeeId)

  const onSubmit = async (values: FormValues) => {
    try {
      await blink.db.reservations.create({
        ...values,
        id: `RES-${Date.now()}`,
        createdAt: new Date().toISOString(),
      })
      toast.success('Reserva registrada correctamente')
      onSuccess()
    } catch {
      toast.error('Error al registrar la reserva')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Book selector — only available books */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Libro *</label>
        {noAvailableBooks ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-3">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-sm font-medium text-destructive">NO HAY LIBROS DISPONIBLES PARA RESERVAR</span>
          </div>
        ) : (
          <Select value={bookId} onValueChange={v => setValue('bookId', v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar libro disponible..." /></SelectTrigger>
            <SelectContent>
              {availableBooks.map(b => (
                <SelectItem key={b.id} value={b.id}>
                  {b.title} — {b.shelfLocation} ({b.genre})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Usuario *</label>
        <Select value={userId} onValueChange={v => setValue('userId', v)}>
          <SelectTrigger><SelectValue placeholder="Seleccionar usuario..." /></SelectTrigger>
          <SelectContent>
            {users.map(u => (
              <SelectItem key={u.id} value={u.id}>
                {u.firstName} {u.lastName} ({u.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedUser && (
          <p className="text-xs text-muted-foreground">ID: <span className="font-mono font-semibold">{selectedUser.id}</span></p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha de reserva *</label>
          <Input {...register('reservationDate', { required: true })} type="date" />
          {errors.reservationDate && <p className="text-xs text-destructive">Requerido</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha de devolución *</label>
          <Input {...register('returnDate', { required: true })} type="date" />
          {errors.returnDate && <p className="text-xs text-destructive">Requerido</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Estado del usuario *</label>
        <Select value={userStatus} onValueChange={v => setValue('userStatus', v as FormValues['userStatus'])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
            <SelectItem value="suspended">Suspendido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Empleado que gestiona *</label>
        <Select value={employeeId} onValueChange={v => setValue('employeeId', v)}>
          <SelectTrigger><SelectValue placeholder="Seleccionar empleado..." /></SelectTrigger>
          <SelectContent>
            {employees.map(e => (
              <SelectItem key={e.id} value={e.id}>
                {e.firstName} {e.lastName} (ID: {e.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedEmployee && (
          <p className="text-xs text-muted-foreground">ID Empleado: <span className="font-mono font-semibold">{selectedEmployee.id}</span></p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button
          type="submit"
          disabled={isSubmitting || noAvailableBooks || !bookId || !userId || !employeeId}
        >
          {isSubmitting ? 'Guardando...' : 'Registrar Reserva'}
        </Button>
      </div>
    </form>
  )
}
