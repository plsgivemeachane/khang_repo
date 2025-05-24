const paginate = async ({ model, page = 1, limit = 10, where = {}, include = [], order = [['createdAt', 'DESC']] }) => {
    const offset = (page - 1) * limit;
  
    const { count: totalItems, rows: items } = await model.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
    });
  
    const totalPages = Math.ceil(totalItems / limit);
  
    return {
      items,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  };
  
  module.exports = { paginate };
  