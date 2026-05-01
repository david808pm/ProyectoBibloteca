import { useForm } from 'react-hook-form'
import { Button, Input, toast } from '@blinkdotnew/ui'
import { blink } from '../blink/client'
import type { Employee } from '../types'

interface Props {
  initialData?: Employee | null
  onSuccess: () => void
  onCancel: () => void
}

interface FormValues {
  firstName: string
  lastName: string
  phone: string
  email: string
}

export default function EmployeeForm({ initialData, onSuccess, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      firstName: initialData?.firstName ?? '',
      lastName: initialData?.lastName ?? '',
      phone: initialData?.phone ?? '',
      email: initialData?.email ?? '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      if (initialData) {
        await blink.db.employees.update(initialData.id, values)
        toast.success('Empleado actualizado')
      } else {
        await blink.db.employees.create({
          ...values,
          id: `EMP-${Date.now()}`,
          createdAt: new Date().toISOString(),
        })
        toast.success('Empleado creado correctamente')
      }
      onSuccess()
    } catch {
      toast.error('Error al guardar el empleado')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nombre *</label>
          <Input {...register('firstName', { required: true })} placeholder="Ej: María" />
          {errors.firstName && <p className="text-xs text-destructive">Requerido</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Apellido *</label>
          <Input {...register('lastName', { required: true })} placeholder="Ej: López" />
          {errors.lastName && <p className="text-xs text-destructive">Requerido</p>}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Teléfono *</label>
        <Input {...register('phone', { required: true })} placeholder="Ej: +57 300 0000000" />
        {errors.phone && <p className="text-xs text-destructive">Requerido</p>}
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Correo electrónico *</label>
        <Input {...register('email', { required: true })} type="email" placeholder="empleado@biblioteca.com" />
        {errors.email && <p className="text-xs text-destructive">Requerido</p>}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</Button>
      </div>
    </form>
  )
}
