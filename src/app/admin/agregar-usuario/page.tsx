export default function AgregarUsuarioPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="mb-6 text-2xl font-bold">Agregar Nuevo Usuario</h1>

      <form className="max-w-lg space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Nombre Completo</label>
          <input
            className="border-primary text-primary focus:border-primary w-full appearance-none rounded-lg border-2 px-4 py-3 leading-tight focus:outline-none"
            type="text"
            placeholder="Ej: María González"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Email Institucional</label>
          <input
            className="border-primary text-primary focus:border-primary w-full appearance-none rounded-lg border-2 px-4 py-3 leading-tight focus:outline-none"
            type="email"
            placeholder="maria@trinobeauty.com"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Rol</label>
            <select className="border-primary text-primary focus:border-primary w-full appearance-none rounded-lg border-2 px-4 py-3 leading-tight focus:outline-none">
              <option value="admin">Administrador General</option>
              <option value="vendedor">Vendedor</option>
              <option value="fulfillment">Fulfillment & Picking</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Permisos</label>
            <select className="border-primary text-primary focus:border-primary w-full appearance-none rounded-lg border-2 px-4 py-3 leading-tight focus:outline-none">
              <option value="full">Todos los permisos</option>
              <option value="pick">Solo picking</option>
              <option value="view">Solo visualización</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Fecha de inicio</label>
          <input
            className="border-primary text-primary focus:border-primary w-full appearance-none rounded-lg border-2 px-4 py-3 leading-tight focus:outline-none"
            type="date"
            required
          />
        </div>
      </form>

      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button className="bg-secondary text-on-secondary hover:bg-primary text-on-primary flex-1 rounded-lg px-4 py-3 text-sm font-medium tracking-wider uppercase">
          Cancelar
        </button>
        <button className="bg-primary text-on-primary flex-1 rounded-lg px-4 py-3 text-sm font-medium tracking-wider uppercase">
          Agregar Usuario
        </button>
      </div>
    </div>
  );
}
