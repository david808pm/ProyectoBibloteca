import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, toast } from '@blinkdotnew/ui'
import { blink } from '../blink/client'
import { clearDraft, loadDraft, saveDraft } from '../lib/storage'
import { createLocalRecord, updateLocalRecord } from '../lib/localDb'

const userTypeLabel = {
  student: 'Estudiante',
  teacher: 'Docente',
  external: 'Externo',
}

export default function LoanForm({ books, users, onSuccess, onCancel }) {
  const storageKey = 'form:loan:new'
  const draft = loadDraft(storageKey, {})
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      userId: '',
      bookId: '',
      loanDate: new Date().toISOString().split('T')[0],
      returnDate: '',
      status: 'active',
      ...draft,
    },
  })

  useEffect(() => {
    const subscription = watch((values) => saveDraft(storageKey, values))
    return () => subscription.unsubscribe?.()
  }, [watch, storageKey])

  const userId = watch('userId')
  const bookId = watch('bookId')
  const status = watch('status')

  const availableBooks = books.filter(b => Number(b.available) > 0)

  const onSubmit = async (values) => {
    try {
      const user = users.find(u => u.id === values.userId)
      const loan = {
        ...values,
        id: `PREST-${Date.now()}`,
        userType: user?.userType ?? 'student',
        createdAt: new Date().toISOString(),
      }
      await blink.db.loans.create(loan).catch(() => createLocalRecord('loans', loan))
      await blink.db.books.update(values.bookId, { available: 0 }).catch(() => updateLocalRecord('books', values.bookId, { available: 0 }))
      clearDraft(storageKey)
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
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Libro *</label>
        <Select value={bookId} onValueChange={v => setValue('bookId', v)}>
          <SelectTrigger><SelectValue placeholder="Seleccionar libro disponible..." /></SelectTrigger>
          <SelectContent>
            {availableBooks.map(b => (
              <SelectItem key={b.id} value={b.id}>
                {b.title} — {b.shelfLocation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha de préstamo *</label>
          <Input {...register('loanDate', { required: true })} type="date" />
          {errors.loanDate && <p className="text-xs text-destructive">Requerido</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha de devolución *</label>
          <Input {...register('returnDate', { required: true })} type="date" />
          {errors.returnDate && <p className="text-xs text-destructive">Requerido</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Estado *</label>
        <Select value={status} onValueChange={v => setValue('status', v)}>
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
        <Button type="submit" disabled={isSubmitting || !userId || !bookId}>
          {isSubmitting ? 'Guardando...' : 'Registrar Préstamo'}
        </Button>
      </div>
    </form>
  )
}
