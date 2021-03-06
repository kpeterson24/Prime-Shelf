const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const { rejectUnauthenticated } = require('../modules/authentication-middleware');

/**
 * Get all of the items on the shelf
 */
router.get('/', (req, res) => {
    pool.query(`SELECT * FROM "item" ORDER BY "user_id", "id"`).then(result => {
        res.send(result.rows);
    })
    .catch( error => {
        console.log('Error with GET all items', error);
        res.sendStatus(500);
    })
});


/**
 * Add an item for the logged in user to the shelf
 */
router.post('/', rejectUnauthenticated, (req, res) => {
  // This deconstructs these properties for us to send
  const {description, image_url} = req.body;
  let queryText = `INSERT INTO "item" (description, image_url, user_id) VALUES($1, $2, $3)`;
  pool.query(queryText, [description, image_url, req.user.id])
  .then( () => {
    res.sendStatus(200)
  }).catch((error) => {
    console.log('error posting', error);
    res.sendStatus(500);
    
  })

});


/**
 * Delete an item if it's something the logged in user added
 */
router.delete('/:id', rejectUnauthenticated, async (req, res) => {
  const client = await pool.connect();
  try {
    const pictureUserID = await client.query(`SELECT "user_id" FROM "item" WHERE "id" = $1;`, [req.params.id])
    if(req.user.id === pictureUserID.rows[0]['user_id']){
      await client.query(`BEGIN`)
      await client.query(`DELETE FROM "item" WHERE "id" = $1;`,[req.params.id])
      await client.query('COMMIT');
      res.sendStatus(200);
    }  
    res.sendStatus(403);
  } catch (error) {
    client.query('ROLLBACK');
    console.log('error deleting', error)
    res.sendStatus(500);
  } finally {
    client.release();
  }
});


/**
 * Update an item if it's something the logged in user added
 */
router.put('/:id', (req, res) => {
    const queryText = `UPDATE "item" SET "description" = $1, "image_url" = $2 WHERE "id"=$3`;
    pool.query(queryText, [req.body.description, req.body.image_url, req.params.id])
    .then( () => {
        res.sendStatus(200)
      }).catch((error) => {
        console.log('error with PUT', error);
        res.sendStatus(500);
      })
});



/**
 * Return all users along with the total number of items 
 * they have added to the shelf
 */
router.get('/count', (req, res) => {

});


/**
 * Return a specific item by id
 */
router.get('/:id', rejectUnauthenticated, (req, res) => {
  pool.query(`SELECT * FROM "item" WHERE "user_id" = $1;`,[req.params.id]).then(result => {
      res.send(result.rows);
  })
  .catch( error => {
      console.log('Error with GET all items', error);
      res.sendStatus(500);
  })
});

module.exports = router;