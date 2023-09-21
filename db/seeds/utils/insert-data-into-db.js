import format from "pg-format";

const insertDataIntoDb = (db, table, data) => {
  const fieldNames = Object.keys(data[0]);

  let insertSQL = `INSERT INTO ${table} (`;
  insertSQL += fieldNames.join(", ") + ") VALUES %L;";

  const valuesArray = data.map((record) =>
    fieldNames.map((fieldName) => record[fieldName])
  );

  const insertDataQueryStr = format(insertSQL, valuesArray);

  return db.query(insertDataQueryStr);
};

export default insertDataIntoDb;
