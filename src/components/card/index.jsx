import { formatRelative } from "date-fns"

const Card = () => {
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <figure className='relative mb-2 w-full h-4/5'>
                <span className='absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded'>Nuevo</span>
                <img src="https://images.cdn3.buscalibre.com/fit-in/360x360/61/8d/618d227e8967274cd9589a549adff52d.jpg" alt="Libro" />
                <div className='absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded'>Destacado</div>
            </figure>
            <p>
                <span>100 años de soledad</span>
                <span>autor</span>
                
            </p>
           
        </div>
  )
}      

export default Card 