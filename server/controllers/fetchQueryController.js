const fetchQuery = {};

fetchQuery.fetchQuery = (req, res, next) => {
  let tables = new Set();
  const columns = new Set();
  const ids = new Set();

  if (req.body.currentSelected.length === 0) return next();
  if (req.body.currentJoinTable === null) {
    req.body = req.body.currentSelected;

    for (let i = 0; i < req.body.length; i++) {
      const currObj = JSON.parse(req.body[i]);
      tables.add(currObj.tableName);
      columns.add(currObj.tableName + '.' + currObj.columnName);
      ids.add(currObj.id);
    }

    res.locals.query = 'SELECT';
    columns.forEach((column) => {
      res.locals.query += ` ${column},`;
    });
    if (res.locals.query.includes('*')) {
      res.locals.query = 'SELECT';
      tables.forEach((table) => {
        res.locals.query += ` ${table}.*,`;
      });
    }
    res.locals.query = res.locals.query.slice(0, res.locals.query.length - 1);

    res.locals.query += ' FROM';
    tables.forEach((table) => {
      res.locals.query += ` ${table},`;
    });
    res.locals.query = res.locals.query.slice(0, res.locals.query.length - 1);

    res.locals.query += ' WHERE _id in (';
    ids.forEach((id) => {
      res.locals.query += `${id}, `;
    });
    res.locals.query = res.locals.query.slice(0, res.locals.query.length - 2);
    res.locals.query += ')';
    if (ids.has('*')) res.locals.query = res.locals.query.slice(0, res.locals.query.indexOf(' WHERE'));

    return next();
  } else if (req.body.joinTable === undefined) {
    let onJoin;
    let joinTableTable = req.body.currentJoinTable;
    for (let i = 0; i < req.body.currentSelected.length; i++) {
      if (JSON.parse(req.body.currentSelected[i]).tableName !== req.body.currentJoinTable) {
        let currentTableNameSingular;
        if (JSON.parse(req.body.currentSelected[i]).tableName === 'planets') currentTableNameSingular = 'homeworld';
        onJoin = `${req.body.currentJoinTable}.${currentTableNameSingular}_id = ${
          JSON.parse(req.body.currentSelected[i]).tableName
        }._id`;
        break;
      }
    }

    req.body = req.body.currentSelected;

    for (let i = 0; i < req.body.length; i++) {
      const currObj = JSON.parse(req.body[i]);
      tables.add(currObj.tableName);
      columns.add(currObj.tableName + '.' + currObj.columnName);
      if (currObj.tableName === joinTableTable) ids.add(currObj.id);
    }

    res.locals.query = 'SELECT';
    columns.forEach((column) => {
      res.locals.query += ` ${column} AS ${
        column.slice(0, column.indexOf('.')) + '_' + column.slice(column.indexOf('.') + 1)
      },`;
    });
    if (res.locals.query.includes('*')) {
      res.locals.query = 'SELECT';
      tables.forEach((column) => {
        res.locals.query += ` ${column}.*,`;
      });
    }
    res.locals.query = res.locals.query.slice(0, res.locals.query.length - 1);

    res.locals.query += ' FROM';
    tables.forEach((table) => {
      res.locals.query += ` ${table} INNER JOIN`;
    });
    res.locals.query = res.locals.query.slice(0, res.locals.query.length - 11);

    res.locals.query += ` ON ${onJoin}`;

    res.locals.query += ` WHERE ${joinTableTable}._id in (`;
    ids.forEach((id) => {
      res.locals.query += `${id}, `;
    });
    res.locals.query = res.locals.query.slice(0, res.locals.query.length - 2);
    res.locals.query += ')';
    if (ids.has('*')) res.locals.query = res.locals.query.slice(0, res.locals.query.indexOf(' WHERE'));

    return next();
  } else {
    let onJoin = [];
    let doneTable = new Set();
    let joinTableTable = req.body.currentJoinTable;
    for (let i = 0; i < req.body.currentSelected.length; i++) {
      if (!doneTable.has(JSON.parse(req.body.currentSelected[i]).tableName)) {
        let currentTableNameSingular;
        if (JSON.parse(req.body.currentSelected[i]).tableName === 'people') currentTableNameSingular = 'person';
        if (JSON.parse(req.body.currentSelected[i]).tableName === 'films') currentTableNameSingular = 'film';
        onJoin.push(
          `${JSON.parse(req.body.currentSelected[i]).tableName}._id = ${joinTableTable}.${currentTableNameSingular}_id`
        );
        doneTable.add(JSON.parse(req.body.currentSelected[i]).tableName);
      }
    }

    req.body = req.body.currentSelected;
    tables = [];
    let firstTable = null;
    for (let i = 0; i < req.body.length; i++) {
      const currObj = JSON.parse(req.body[i]);
      if (firstTable === null) firstTable = currObj.tableName;
      tables.push(currObj.tableName);
      columns.add(currObj.tableName + '.' + currObj.columnName);
      if (currObj.tableName === firstTable) ids.add(currObj.id);
    }

    res.locals.query = 'SELECT';
    columns.forEach((column) => {
      res.locals.query += ` ${column} AS ${
        column.slice(0, column.indexOf('.')) + '_' + column.slice(column.indexOf('.') + 1)
      },`;
    });
    if (res.locals.query.includes('*')) {
      res.locals.query = 'SELECT';
      tables.forEach((column) => {
        res.locals.query += ` ${column}.*,`;
      });
    }
    res.locals.query = res.locals.query.slice(0, res.locals.query.length - 1);

    res.locals.query += ' FROM';

    res.locals.query += ` ${tables[0]} INNER JOIN ${joinTableTable} `;

    res.locals.query += ` ON ${onJoin[0]} INNER JOIN`;

    res.locals.query += ` ${tables[1]}`;

    res.locals.query += ` ON ${onJoin[1]}`;

    res.locals.query += ` WHERE ${tables[0]}._id in (`;
    ids.forEach((id) => {
      res.locals.query += `${id}, `;
    });
    res.locals.query = res.locals.query.slice(0, res.locals.query.length - 2);
    res.locals.query += ')';
    if (ids.has('*')) res.locals.query = res.locals.query.slice(0, res.locals.query.indexOf(' WHERE'));

    return next();
  }
};

module.exports = fetchQuery;
