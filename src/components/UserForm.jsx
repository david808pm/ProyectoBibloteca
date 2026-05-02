import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, toast } from '@blinkdotnew/ui'
import { blink } from '../blink/client'
import { clearDraft, loadDraft, saveDraft } from '../lib/storage'

export default function UserForm({ initialData, onSuccess, onCancel }) {
  const storageKey = initialData ? `form:user:${initialData.id}` : 'form:user:new'
  const draft = loadDraft(storageKey, {})
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      id: initialData?.id ?? '',
      firstName: initialData?.firstName ?? '',
      lastName: initialData?.lastName ?? '',
      phone: initialData?.phone ?? '',
      email: initialData?.email ?? '',
      userType: initialData?.userType ?? 'student',
      ...draft,
    },
  })

  useEffect(() => {
    const subscription = watch((values) => saveDraft(storageKey, values))
    return () => subscription.unsubscribe?.()
  }, [watch, storageKey])

  const userType = watch('userType')
  const isEditing = !!initialData

  const onSubmit = async (values) => {
    try {
      if (isEditing) {
        await blink.db.libraryUsers.update(initialData.id, {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          email: values.email,
          userType: values.userType,
        })
        toast.success('Usuario actualizado')
      } else {
        const existing = await blink.db.libraryUsers.get(values.id.trim())
        if (existing) {
          toast.error(`El ID "${values.id}" ya está registrado`)
          return
        }
        await blink.db.libraryUsers.create({
          id: values.id.trim(),
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          email: values.email,
          userType: values.userType,
          createdAt: new Date().toISOString(),
        })
        toast.success('Usuario creado correctamente')
      }
      clearDraft(storageKey)
      onSuccess()
    } catch {
      toast.error('Error al guardar el usuario')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">
          ID de Usuario *
          {isEditing && <span className="ml-2 text-xs text-muted-foreground">(no editable)</span>}
        </label>
        <Input
          {...register('id', { required: !isEditing, validate: v => isEditing || v.trim().length > 0 || 'Requerido' })}
          placeholder="Ej: USR-001"
          disabled={isEditing}
          className={isEditing ? 'opacity-60 cursor-not-allowed' : ''}
        />
        {errors.id && <p className="text-xs text-destructive">El ID es requerido</p>}
        {!isEditing && <p className="text-xs text-muted-foreground">Ingresa un identificador único para el usuario</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nombre *</label>
          <Input {...register('firstName', { required: true })} placeholder="Ej: Juan" />
          {errors.firstName && <p className="text-xs text-destructive">Requerido</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Apellido *</label>
          <Input {...register('lastName', { required: true })} placeholder="Ej: Pérez" />
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
        <Input {...register('email', { required: true })} type="email" placeholder="usuario@correo.com" />
        {errors.email && <p className="text-xs text-destructive">Requerido</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Tipo de usuario *</label>
        <Select value={userType} onValueChange={(v) => setValue('userType', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Estudiante</SelectItem>
            <SelectItem value="teacher">Docente</SelectItem>
            <SelectItem value="external">Externo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</Button>
      </div>
    </form>
  )
}
