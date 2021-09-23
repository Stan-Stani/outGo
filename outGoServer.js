var sqliteResponseArr = [];

const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('./db/lanco.db');





var fs = require('fs');
const cors = require('cors');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('C:/Users/ISLAU/Coding/SQLite/sslcert/example.key');

var certificate = fs.readFileSync('C:/Users/ISLAU/Coding/SQLite/sslcert/example.crt');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(cors({
    origin: 'https://cdpn.io'
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send(sqliteResponseArr)
})

app.post('/', function(req, res){

  console.log(req.body);
  let clientJSON = req.body;

   switch(clientJSON.reqID) {
     case 'nameDatalistFill':


    /* var sql = `SELECT CustomerID id,
                       LastName lastName,
                       FirstName firstName
                FROM "Lanco Customers"
                WHERE LastName LIKE ?
                AND FirstName LIKE ?
                ORDER BY lower(LastName) ASC, lower(FirstName) ASC
                LIMIT 5`; */

        var sql = `SELECT  lastName,
                           NULL as middleName,
                           firstName
                    FROM "legacyCustomers"
                    WHERE LastName LIKE ?
                    AND FirstName LIKE ?
                    UNION
                    SELECT  lastName,
                            middleName,
							              firstName
          					FROM "customers"
          					WHERE lastName LIKE ?
                    AND firstName LIKE ?
          					ORDER BY lastName COLLATE NOCASE ASC, firstName COLLATE NOCASE ASC
          					LIMIT 5`;


      var startOfLastName = clientJSON.customerLastName + "%";
      var startOfFirstName = clientJSON.customerFirstName + "%";

    // apparently asynch. Does not block program.
      db.each(sql, [startOfLastName, startOfFirstName, startOfLastName, startOfFirstName], (err, row) => {
        if (err) {
          console.error(err.message);
        }
        row
          ? sqliteResponseArr.push(row)
          : sqliteResponseArr.push(`no match`)
        // completion call back
      }, () => {
        console.log(sqliteResponseArr);
        res.send(sqliteResponseArr);
        sqliteResponseArr = [];
      });

      break;

    case 'customerSearch':

      // Probably need to implement a limit like in the datalist request.
      var sql =      `SELECT lastName,
                         firstName,
                         NULL AS middleName,
                         customerId,
                         "legacyCustomers" AS originTable
                  FROM "legacyCustomers"
                  WHERE LastName LIKE ?
                  AND FirstName LIKE ?
                  UNION
                  SELECT  lastName,
                          firstName,
                          middleName,
                          customerId,
                          "customers" AS originTable
                  FROM customers
                  WHERE lastName LIKE ?
                            AND firstName LIKE ?
                  ORDER BY lastName COLLATE NOCASE ASC, firstName COLLATE NOCASE`;


       var startOfLastName = clientJSON.customerLastName + "%";
       var startOfFirstName = clientJSON.customerFirstName + "%";


        db.each(sql, [startOfLastName, startOfFirstName, startOfLastName, startOfFirstName], (err, row) => {
          if (err) {
            console.error(err.message);
          }
          row
            ? sqliteResponseArr.push(row)
            : sqliteResponseArr.push(`no match`)
          // completion call back
        }, () => {
          console.log(sqliteResponseArr);
          res.send(sqliteResponseArr);
          sqliteResponseArr = [];
        });


      break;

    case 'beginCustomerCreate':

      sql = `INSERT
               customerId,
               lastName,
               firstName,
               middleName,
               mobilePhone,
               workPhone,
               otherPhone,
               email,
               billingAddressLine1,
               billingAddressLine2,
               city,
               state,
               zipCode
             FROM customers
             WHERE customerId = ?
             ORDER BY lower(LastName) ASC, lower(FirstName) ASC;`;

      var customerId = clientJSON.ID;

      db.all(sql, [customerId], (err, rows) => {
        if (err || rows.length > 1) {
          console.error(err.message);
          console.error('rows length:' + rows.length + ' Should be 1! There is more than one customer with the same ID!');
        }

        console.log(rows[0]);
        res.send(rows[0]);

      });

      break;

    case 'finishCustomerCreate':


        var sql = `INSERT INTO customers (lastName, firstName, middleName, mobilePhone, workPhone, otherPhone, email, billingAddressLine1, billingAddressLine2, city, state, zipCode)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
         var lastName = clientJSON.customerLastName;
         var firstName = clientJSON.customerFirstName;
         var middleName = clientJSON.customerMiddleName;
         var mobilePhone = clientJSON.mobilePhone;
         var workPhone = clientJSON.workPhone;
         var otherPhone = clientJSON.otherPhone;
         var email = clientJSON.email;
         var billingAddressLine1 = clientJSON.billingAddressLine1;
         var billingAddressLine2 = clientJSON.billingAddressLine2;
         var city = clientJSON.city;
         var state = clientJSON.state;
         var zipCode = clientJSON.zipCode;

         db.run(sql, [lastName, firstName, middleName, mobilePhone, workPhone, otherPhone, email, billingAddressLine1, billingAddressLine2, city, state, zipCode, customerId], (err) => {
           if (err) {
             console.error(err.message);
           }

           res.send({queryStatus: 'complete'})
           console.log('Created customer with name:', firstName, middleName, lastName)




         })

    case 'beginCustomerEdit':

      sql = `SELECT
               customerId,
               lastName,
               firstName,
               middleName,
               mobilePhone,
               workPhone,
               otherPhone,
               email,
               billingAddressLine1,
               billingAddressLine2,
               city,
               state,
               zipCode
             FROM customers
             WHERE customerId = ?
             ORDER BY lower(LastName) ASC, lower(FirstName) ASC;`;

      var customerId = clientJSON.ID;

      db.all(sql, [customerId], (err, rows) => {
        if (err || rows.length > 1) {
          console.error(err.message);
          console.error('rows length:' + rows.length + ' Should be 1! There is more than one customer with the same ID!');
        }

        console.log(rows[0]);
        res.send(rows[0]);

      });

      break;

    case 'finishCustomerEdit':


        var sql = `UPDATE customers
                   SET lastName = ?,
                       firstName = ?,
                       middleName = ?,
                       mobilePhone = ?,
                       workPhone = ?,
                       otherPhone = ?,
                       email = ?,
                       billingAddressLine1 = ?,
                       billingAddressLine2 = ?,
                       city = ?,
                       state = ?,
                       zipCode = ?
                   WHERE customerId = ?`;
         var customerId = clientJSON.ID;
         var lastName = clientJSON.customerLastName;
         var firstName = clientJSON.customerFirstName;
         var middleName = clientJSON.customerMiddleName;
         var mobilePhone = clientJSON.mobilePhone;
         var workPhone = clientJSON.workPhone;
         var otherPhone = clientJSON.otherPhone;
         var email = clientJSON.email;
         var billingAddressLine1 = clientJSON.billingAddressLine1;
         var billingAddressLine2 = clientJSON.billingAddressLine2;
         var city = clientJSON.city;
         var state = clientJSON.state;
         var zipCode = clientJSON.zipCode;

         db.run(sql, [lastName, firstName, middleName, mobilePhone, workPhone, otherPhone, email, billingAddressLine1, billingAddressLine2, city, state, zipCode, customerId], (err) => {
           if (err) {
             console.error(err.message);
           }

           res.send({queryStatus: 'complete'})
           console.log('Updated customer with Id:', customerId)




         })


    break;

    case 'beginLegacyCustomerImport':


      var sql = `SELECT
                   customerId,
                   lastName,
                   firstName,
                   homePhone,
                   hisWorkPhone,
                   herWorkPhone,
                   address,
                   city,
                   state,
                   zipCode
                 FROM legacyCustomers
                 WHERE customerId = ?;`;

       var customerId = clientJSON.ID;

       db.all(sql, [customerId], (err, rows) => {
         if (err || rows.length > 1) {
           console.error(err.message);
           console.error('rows length:' + rows.length + ' Should be 1! There is more than one customer with the same ID!');
         }

         console.log(rows[0]);
         res.send(rows[0])

       });

       break;



    case 'viewLegacyData':

      var sql = `SELECT *
           FROM legacyCustomers
           WHERE customerId = ?;`;
      var customerId = clientJSON.ID;

      db.all(sql, [customerId], (err, rows) => {
        if (err || rows.length > 1) {
          console.error(err.message)
        }
        console.log(rows[0]);
        res.send(rows[0])

      })


      break;

    case 'finishLegacyCustomerImport':



       //customerNotes insert old data as first note for this customer
       var sql = `SELECT *
             FROM legacyCustomers
             WHERE customerId = ?;`


       var customerId = clientJSON.ID;

       db.all(sql, [customerId], (err, rows) => {
        if (err || rows.length > 1) {
          console.error(err.message);
          console.error('rows length:' + rows.length + ' Should be 1! There is more than one customer with the same ID!');
        }


        var sql = `INSERT INTO customers (lastName, firstName, middleName, mobilePhone, workPhone, otherPhone, email, billingAddressLine1, billingAddressLine2, city, state, zipCode, wasLegacyCustomer)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);
                  `;

        var lastName = clientJSON.customerLastName;
        var firstName = clientJSON.customerFirstName;
        var middleName = clientJSON.customerMiddleName;
        var mobilePhone = clientJSON.mobilePhone;
        var workPhone = clientJSON.workPhone;
        var otherPhone = clientJSON.otherPhone;
        var email = clientJSON.email;
        var billingAddressLine1 = clientJSON.billingAddressLine1;
        var billingAddressLine2 = clientJSON.billingAddressLine2;
        var city = clientJSON.city;
        var state = clientJSON.state;
        var zipCode = clientJSON.zipCode;

        db.run(sql, [lastName, firstName, middleName, mobilePhone, workPhone, otherPhone, email, billingAddressLine1, billingAddressLine2, city, state, zipCode], (err) => {
          if (err) {
            console.error(err.message);
          }

          let sql = `DELETE FROM legacyCustomers
                     WHERE customerId = ?;`;

          db.run(sql, [customerId], function(err) {
            if (err) {
              console.error(err.message);
            }

            if (this.changes === 1) {
              console.log('Deleted customer with Id:', customerId, 'from legacyCustomers table.')

            } else {
              throw new Error("SQLite DELETE query did not work as expected!");
            }


            let sql = `INSERT INTO customerNotes (customerId, noteContent)
                    VALUES (last_insert_rowid(), ?);`;

                    db.run(sql, [JSON.stringify(rows[0])], (err) => console.log(err))



          });







        });













        console.log(rows[0]);
        res.send({queryStatus: 'complete'})

      });

      break;

    case 'beginViewCustomerNotes':


      var sql = `SELECT
                   noteContent,
                   noteId,
                   timeStamp
                 FROM customerNotes
                 WHERE customerId = ?;`;

      var customerId = clientJSON.ID;






       db.each(sql, [customerId], (err, row) => {
         if (err) {
           console.error(err.message);
         }
         sqliteResponseArr.push({noteContent: row.noteContent, noteId: row.noteId, timeStamp: row.timeStamp});
         console.log('run');
         // completion call back
       }, () => {
         console.log(sqliteResponseArr);
         res.send(sqliteResponseArr);
         sqliteResponseArr = [];
       });





       break;

     case 'addNote':

       var sql = `INSERT INTO customerNotes  (customerId, noteContent)
                  VALUES(?, ?);`;

        var customerId = clientJSON.ID;

        db.run(sql, [customerId, clientJSON.newNote], (err) => {
          if (err) {console.error(err.message)}
          res.send({queryStatus: 'complete'});
        });



        break;

  }








});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(8443);
console.log('\nServer started...')

// close the database connection
//db.close();
