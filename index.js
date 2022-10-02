const pool = require("./pool");

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.static('client'));

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});


app.listen(port, () => {
  console.log(`App listening at port:${port}`);
});


const tableName = 'test_vue';
const promisePool = pool.promise();

app.get("/data", async (req, res) => {
  queryToDb.columnSortSet = req.query.sort;
  queryToDb.data = req.query.data;
  queryToDb.typeSet = req.query.type;

  pagePagination.currentPages = req.query.currentPage;
  pagePagination.limitRow = req.query.limitRow;
  //
  const connection = await promisePool.getConnection();

  const count = await connection.execute(
    `SELECT count(*) FROM ${tableName} ${queryToDb.result}`
  );
  pagePagination.allPages = count[0][0]["count(*)"];

  const result = await connection.execute(
    `SELECT * FROM ${tableName} ${queryToDb.result} ${pagePagination.result}`
  );
  //
  await connection.release();
  //

  const serverResponse = {
    count: pagePagination.allPages,
    result: result[0],
  };
  console.log(`>> ${JSON.stringify(req.query)} pag:>${pagePagination.result}<`);
  return res.status(200).json(serverResponse);
});

let queryToDb = {
  data: "",
  columnSortData: "",
  type: "",

  set dataSet(data) {
    this.data = data;
    if (!data) this.columnSortData = "";
  },

  set columnSortSet(column) {
    this.columnSortData = column;
    if (!column) this.columnSortData = "";
  },

  set typeSet(typeSort) {
    let gh = {
      more: ">",
      less: "<",
      equals: "=",
    };
    this.type = gh[typeSort];
  },

  get result() {
    let result = `WHERE ${this.columnSortData} ${this.type} '${this.data}'`;
    if (!this.columnSortData || !this.data || !this.type) {
      result = "";
    }
    return result;
  },
};

let pagePagination = {
  currentPages: 1,
  limitRow: 50,

  get result() {
    if (!this.currentPages || !this.limitRow){ return ""}
    return `LIMIT ${(this.currentPages - 1) * this.limitRow}, ${this.limitRow}`;
  },
};
