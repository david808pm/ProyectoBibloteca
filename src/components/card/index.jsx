const DEFAULT_COVER = 'https://images.cdn3.buscalibre.com/fit-in/360x360/61/8d/618d227e8967274cd9589a549adff52d.jpg'

const BookCard = ({ book }) => {
  const cover = book.coverUrl?.trim() || DEFAULT_COVER
  const available = Number(book.available) > 0
/*reducir el tamaño de la card para que se vean mas libros en la pantalla, 
eliminar el botón de acciones y mostrar el estado del libro (disponible o prestado) con un badge o etiqueta. Además, agregar un ícono pequeño en la esquina superior derecha de la imagen de portada para indicar el género del libro (por ejemplo, un ícono de ciencia ficción, historia, etc.) y mostrar la ubicación en la estantería debajo del título del libro.*/
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img
          className="h-full w-full object-cover"
          src={cover}
          alt={book.title || 'Portada del libro'}
        />
        <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold ${available ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {available ? 'Disponible' : 'Prestado'}
        </span>
      </div>

      <div className="space-y-2 p-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{book.title || 'Título no disponible'}</h3>
          <p className="text-sm text-muted-foreground">{book.author || 'Autor desconocido'}</p>
        </div>

        <p className="text-sm leading-6 text-slate-600 min-h-[3rem]">
          {book.description || 'No hay descripción disponible para este libro.'}
        </p>

        <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-100 px-2 py-1">
            <span className="block font-semibold text-slate-900">Género</span>
            <span>{book.genre || 'Sin género'}</span>
          </div>
          <div className="rounded-2xl bg-slate-100 px-3 py-2">
            <span className="block font-semibold text-slate-900">Estantería</span>
            <span>{book.shelfLocation || 'Sin ubicación'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{book.editor || 'Editorial no registrada'}</span>
          <span>{book.pages ? `${book.pages} págs` : 'Sin páginas'}</span>
        </div>
      </div>
    </article>
  )
}

export default BookCard 