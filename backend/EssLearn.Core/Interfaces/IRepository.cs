namespace EssLearn.Core.Interfaces;

/// <summary>
/// Generic repository interface for data access operations.
/// </summary>
/// <typeparam name="T">The entity type</typeparam>
public interface IRepository<T> where T : class
{
    /// <summary>
    /// Gets an entity by its primary key.
    /// </summary>
    Task<T?> GetByIdAsync(int id);

    /// <summary>
    /// Gets all entities.
    /// </summary>
    Task<List<T>> GetAllAsync();

    /// <summary>
    /// Adds a new entity.
    /// </summary>
    Task AddAsync(T entity);

    /// <summary>
    /// Adds multiple entities.
    /// </summary>
    Task AddRangeAsync(IEnumerable<T> entities);

    /// <summary>
    /// Updates an existing entity.
    /// </summary>
    Task UpdateAsync(T entity);

    /// <summary>
    /// Removes an entity.
    /// </summary>
    Task RemoveAsync(T entity);

    /// <summary>
    /// Removes multiple entities.
    /// </summary>
    Task RemoveRangeAsync(IEnumerable<T> entities);

    /// <summary>
    /// Saves changes to the database.
    /// </summary>
    Task SaveChangesAsync();
}
