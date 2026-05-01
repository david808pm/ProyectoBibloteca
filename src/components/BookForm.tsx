import { useForm } from 'react-hook-form'
import { Button, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, toast } from '@blinkdotnew/ui'
import { blink } from '../blink/client'

const GENRES = ['Ficción', 'No Ficción', 'Ciencia', 'Historia', 'Tecnología', 'Arte', 'Filosofía', 'Literatura', 'Biología', 'Derecho', 'Economía', 'Matemáticas', 'Medicina', 'Psicología', 'Otro']

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

interface FormValues {
  title: string
  author: string
  editor: string
  pages: number
  shelfLocation: string
  genre: string
  quantity: number
}

export default function BookForm({ onSuccess, onCancel }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: { pages: 1, genre: 'Ficción', quantity: 1 },
  })

  const genre = watch('genre')
  const quantity = watch('quantity')

  const onSubmit = async (values: FormValues) => {
    try {
      const qty = Math.max(1, Number(values.quantity))
      const base = {
        title: values.title,
        author: values.author,
        editor: values.editor,
        pages: Number(values.pages),
        shelfLocation: values.shelfLocation.toUpperCase(),
        genre: values.genre,
        available: 1,
      }

      // Create one record per copy
      const creations = Array.from({ length: qty }, (_, i) =>
        blink.db.books.create({
          ...base,
          id: `LIB-${Date.now()}-${i + 1}`,
          createdAt: new Date().toISOString(),
        })
      )
      await Promise.all(creations)

      toast.success(qty === 1 ? 'Libro agregado al inventario' : `${qty} ejemplares agregados al inventario`)
      onSuccess()
    } catch {
      toast.error('Error al agregar el libro')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Título *</label>
        <Input {...register('title', { required: true })} placeholder="Ej: El Quijote" />
        {errors.title && <p className="text-xs text-destructive">Requerido</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Autor *</label>
          <Input {...register('author', { required: true })} placeholder="Ej: Cervantes" />
          {errors.author && <p className="text-xs text-destructive">Requerido</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Editorial *</label>
          <Input {...register('editor', { required: true })} placeholder="Ej: Planeta" />
          {errors.editor && <p className="text-xs text-destructive">Requerido</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Páginas *</label>
          <Input {...register('pages', { required: true, min: 1 })} type="number" min={1} placeholder="350" />
          {errors.pages && <p className="text-xs text-destructive">Requerido (mín 1)</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Ubicación / Estantería *</label>
          <Input
            {...register('shelfLocation', { required: true })}
            placeholder="Ej: EST-001"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.shelfLocation && <p className="text-xs text-destructive">Requerido</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Género *</label>
          <Select value={genre} onValueChange={v => setValue('genre', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Cantidad de ejemplares *</label>
          <Input
            {...register('quantity', { required: true, min: 1, max: 100 })}
            type="number"
            min={1}
            max={100}
            placeholder="1"
          />
          {errors.quantity && <p className="text-xs text-destructive">Mín 1, máx 100</p>}
          {quantity > 1 && (
            <p className="text-xs text-primary font-medium">Se crearán {quantity} ejemplares individuales</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : `Agregar ${Number(quantity) > 1 ? `${quantity} ejemplares` : 'libro'}`}
        </Button>
      </div>
    </form>
  )
}
