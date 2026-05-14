import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, toast } from '@blinkdotnew/ui'
import { AlertCircle } from 'lucide-react'
import { blink } from '../blink/client'
import { clearDraft, loadDraft, saveDraft } from '../lib/storage'
import { createLocalRecord } from '../lib/localDb'

export default function ReservationForm({ books, users, employees, onSuccess, onCancel }) {
  const storageKey = 'form:reservation:new'
  const draft = loadDraft(storageKey, {})
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      bookId: '',
      userId: '',
      reservationDate: new Date().toISOString().split('T')[0],
      returnDate: '',
      userStatus: 'active',
      employeeId: '',
      ...draft,
    },
  })

  useEffect(() => {
    const subscription = watch((values) => saveDraft(storageKey, values))
    return () => subscription.unsubscribe?.()
  }, [watch, storageKey])

  const bookId = watch('bookId')
  const userId = watch('userId')
  const employeeId = watch('employeeId')
  const availableBooks = books.filter(b => Number(b.available) > 0)
  const noAvailableBooks = availableBooks.length === 0
  const selectedUser = users.find(u => u.id === userId)
  const selectedEmployee = employees.find(e => e.id === employeeId)

  const onSubmit = async (values) => {
    try {
      const reservation = {
        ...values,
        id: `RES-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      await blink.db.reservations.create(reservation).catch(() => createLocalRecord('reservations', reservation))
      clearDraft(storageKey)
      toast.success('Reserva registrada correctamente')
      onSuccess()
    } catch {
      toast.error('Error al registrar la reserva')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Select value={userStatus} onValueChange={v => setValue('userStatus', v)}>
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
        <Button type="submit" disabled={isSubmitting || noAvailableBooks || !bookId || !userId || !employeeId}>
          {isSubmitting ? 'Guardando...' : 'Registrar Reserva'}
        </Button>
      </div>
    </form>
  )
}
