using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProAgil.Domain;

namespace ProAgil.Repository
{
    public class ProAgilRepository : IProAgilRepository
    {
        private readonly ProAgilContext _context;
        public ProAgilRepository(ProAgilContext context )
        {
            _context = context;
        }

        //GERAIS
        public void Add<T>(T entity) where T : class
        {
            _context.Add(entity);
        }

        public void Update<T>(T entity) where T : class
        {
            _context.Update(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            _context.Remove(entity);
        }
        public async Task<bool> SaveChangesAsync()
        {
            return (await _context.SaveChangesAsync()) > 0;
        }


        //EVENTOS
        public async Task<Evento[]> GetAllEventoAsync(bool includePalestrantes = false)
        {
            IQueryable<Evento> query = _context.Eventos
            .Include(c => c.Lotes)
            .Include(c => c.RedeSociais);

            if(includePalestrantes)
            {
                query = query
                    .Include(p => p.PalestranteEventos)
                    .ThenInclude(p => p.Palestrante);
            }

            query = query.OrderByDescending (c => c.DataEvento);

            return await query.ToArrayAsync();
        }

        public async Task<Evento[]> GetAllEventoAsyncTema(string tema, bool includePalestrantes)
        {
            IQueryable<Evento> query = _context.Eventos
            .Include(c => c.Lotes)
            .Include(c => c.RedeSociais);

            if(includePalestrantes)
            {
                query = query
                    .Include(p => p.PalestranteEventos)
                    .ThenInclude(p => p.Palestrante);
            }

            query = query.OrderByDescending (c => c.DataEvento)
                        .Where(c => c.Tema.ToLower().Contains(tema.ToLower()));

            return await query.ToArrayAsync();
        }

        public async Task<Evento> GetAllEventoAsyncById(int EventoId, bool includePalestrantes)
        {
            
            IQueryable<Evento> query = _context.Eventos
            .Include(c => c.Lotes)
            .Include(c => c.RedeSociais);

            if(includePalestrantes)
            {
                query = query
                    .Include(p => p.PalestranteEventos)
                    .ThenInclude(p => p.Palestrante);
            }

            query = query.OrderByDescending (c => c.DataEvento)
                        .Where(c => c.Id == EventoId);

            return await query.FirstOrDefaultAsync();
        }


        //PALESTRANTES
        public async Task<Palestrante> GetAllPalestranteAsyncById(int PalestranteId, bool includeEventos = false)
        {
            IQueryable<Palestrante> query = _context.Palestrantes
            .Include(c => c.RedeSociais);

            if(includeEventos)
            {
                query = query
                    .Include(p => p.PalestranteEventos)
                    .ThenInclude(e => e.Evento);
            }

            query = query.OrderBy(p => p.Nome)
                .Where(p => p.Id == PalestranteId );
                       

            return await query.FirstOrDefaultAsync();
        }

        public async Task<Palestrante[]> GetAllPalestranteAsync(string name, bool includeEventos)
        {
            IQueryable<Palestrante> query = _context.Palestrantes
            .Include(c => c.RedeSociais);

            if(includeEventos)
            {
                query = query
                    .Include(p => p.PalestranteEventos)
                    .ThenInclude(e => e.Evento);
            }

            query = query.OrderBy(p => p.Nome)
                .Where(p => p.Nome.ToLower().Contains(name.ToLower()));
                       

            return await query.ToArrayAsync();
        }
    }
}