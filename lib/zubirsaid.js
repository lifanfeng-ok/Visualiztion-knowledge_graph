
const song1 = 'Majulah_Singapura-Work'
const song2 = 'Semoga_Bahagia-Work'


function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const parameter = urlParams.get('parameter')

  if (parameter != null) {
    // console.log(parameter)
    retrieve(parameter, queryText0, 'query','json-table0')
    retrieve(parameter, queryText1b, 'query','json-table')
    retrieve(parameter, queryText1d, 'query','json-table2')

  }

}



/** Create connection object **/
const driver = neo4j.driver(
  'neo4j+s://0c8dfc4e.databases.neo4j.io',
  neo4j.auth.basic('anonymous', 'anonymous')
)

// Check connection
/*
try {
  driver.verifyConnectivity()
  console.log('Driver created')
} catch (error) {
  console.log(`connectivity verification failed. ${error}`)
} 
*/


/** Cypher query texts **/

// Retrieve 1 node by ID
// Browse by CreativeWork genre -- photograph, letter, etc.
const queryText0 =
  `MATCH (Entity {id: $param})
  RETURN Entity`

// MusicalWork -(realization)-> MusicalExpression [ -()-> Performance -()-> Item]
const queryText1a =
  `MATCH (:MusicalWork {id: $param})-[:REALIZATION]->(Musical_Expression:MusicalExpression)
  OPTIONAL MATCH (Musical_Expression)-[Relation:ARRANGEMENT|ARRANGER|COMPOSER|CONDUCTOR|CONTRIBUTOR|DIRECTOR|EVENT|HAS_PART|PERFORMED_IN|PERFORMER|ITEM]->(Entity)
  OPTIONAL MATCH (Entity)-[:ITEM]->(Item)
  RETURN Musical_Expression, Relation, Entity, Item`

// Neighbor nodes with relations pointing away: [Entity1] -(relation)-> [Entity2] -(relation)-> [Entity3]
// Leave out 'type' relation
const queryText1b =
  `MATCH (Entity1 {id: $param})-[Relation1:ABOUT|ARRANGEMENT|ARRANGER|AUTHOR|BIOGRAPHY|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|ITEM|LOCATION|MENTIONS|PERFORMED_IN|PERFORMER|PERSON_SHOWN|PRINCIPAL|PUBLISHED_AS|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]->(Entity2)
  OPTIONAL MATCH (Entity2)-[Relation2:ABOUT|ARRANGEMENT|ARRANGER|AUTHOR|BIOGRAPHY|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|ITEM|LOCATION|MENTIONS|PERFORMED_IN|PERFORMER|PERSON_SHOWN|PRINCIPAL|PUBLISHED_AS|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]->(Entity3)
  RETURN Relation1,Entity2,Relation2,Entity3`

// Neighbor nodes: [Entity1] -(relation)-> [Entity2] -(relation)-> [Entity3]
// But leave out music related relations -- realization, performed in, arrangement
const queryText1c =
  `MATCH (Entity1 {id: $param})-[Relation1:ABOUT|ARRANGER|AUTHOR|BIOGRAPHY|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|ITEM|LOCATION|MENTIONS|PERFORMER|PERSON_SHOWN|PRINCIPAL|PUBLISHED_AS|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]->(Entity2)
  OPTIONAL MATCH (Entity2)-[Relation2:ABOUT|ARRANGER|AUTHOR|BIOGRAPHY|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|ITEM|LOCATION|MENTIONS|PERFORMER|PERSON_SHOWN|PRINCIPAL|PUBLISHED_AS|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]->(Entity3)
  RETURN Relation1,Entity2,Relation2,Entity3`

  // Neighbor nodes with relations pointing towards it: [Entity1] <-(relation)- [Entity2] <-(relation)- [Entity3]
  // Leave out 'type' relation
const queryText1d =
  `MATCH (Entity1 {id: $param})<-[Relation1:ABOUT|ARRANGEMENT|ARRANGER|AUTHOR|BIOGRAPHY|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|ITEM|LOCATION|MENTIONS|PERFORMED_IN|PERFORMER|PERSON_SHOWN|PRINCIPAL|PUBLISHED_AS|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Entity2)
  OPTIONAL MATCH (Entity2)<-[Relation2:ABOUT|ARRANGEMENT|ARRANGER|AUTHOR|BIOGRAPHY|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|ITEM|LOCATION|MENTIONS|PERFORMED_IN|PERFORMER|PERSON_SHOWN|PRINCIPAL|PUBLISHED_AS|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Entity3)
  RETURN Entity3,Relation2,Entity2,Relation1,Entity1`


// List letters, and audio & video files related to song
//const queryText1e =
//  `MATCH (n1:MusicalWork {id: $param})-[*1..3]->(n2)-[:ITEM]->(n3))
//  RETURN n2,n3`


// Links between $specific_person and Zubir Said
// 1 link
const queryText2a1 =
  `MATCH (:Person {id: "Zubir_Said"})-[Relation:ARRANGEMENT|ARRANGER|AUTHOR|CC|COMPOSER|CONDUCTOR|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|PERFORMED_IN|PERFORMER|PERSON_SHOWN|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Person:Person)
  RETURN Relation,Person`
// 2 links
const queryText2a2 =
  `MATCH (:Person {id: "Zubir_Said"})-[Relation1:ARRANGEMENT|ARRANGER|AUTHOR|CC|COMPOSER|CONDUCTOR|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|PERFORMED_IN|PERFORMER|PERSON_SHOWN|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Entity)-[Relation2:ARRANGEMENT|ARRANGER|AUTHOR|CC|COMPOSER|CONDUCTOR|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|PERFORMED_IN|PERFORMER|PERSON_SHOWN|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Person:Person)
  RETURN Relation1,Entity,Relation2,Person`
// 3 links
const queryText2a3 =
  `MATCH (:Person {id: "Zubir_Said"})-[Relation1:ARRANGEMENT|ARRANGER|AUTHOR|CC|COMPOSER|CONDUCTOR|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|PERFORMED_IN|PERFORMER|PERSON_SHOWN|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Entity1)-[Relation2:ARRANGEMENT|ARRANGER|AUTHOR|CC|COMPOSER|CONDUCTOR|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|PERFORMED_IN|PERFORMER|PERSON_SHOWN|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Entity2)-[Relation3:ARRANGEMENT|ARRANGER|AUTHOR|CC|COMPOSER|CONDUCTOR|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|PERFORMED_IN|PERFORMER|PERSON_SHOWN|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Person:Person)
  RETURN Relation1,Entity1,Relation2,Entity2,Relation3,Person`


// Browse by CreativeWork genre -- photograph, letter, etc.
const queryText2b =
  `MATCH (Document:CreativeWork {type: $param})
  RETURN Document`

// Browse ALL Documents
  const queryText2c =
  `MATCH (Document:Document)
  RETURN Document`

// Browse all CreativeWorks
const queryText2d =
`MATCH (Document:CreativeWork)
RETURN Document`

//  `MATCH (Document:CreativeWork {type: $param})-[Relation1:ABOUT|AUTHOR|BIOGRAPHY|CC|CONTENT|CONTRIBUTOR|CREATOR|EVENT|HAS_PART|ISSUED_BY|LOCATION|MENTIONS|CURRENT_LOCATION|PERSON_SHOWN|PRINCIPAL|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE|STATE|ITEM]->(Entity1)-[Relation2]->(Entity2)
//  RETURN Document,Relation1,Entity1,Relation2,Entity2`

// Browse by $topic
const queryText2e =
  `MATCH (Topic:Topic)-[Relation:ABOUT]-(Entity)
  OPTIONAL MATCH (Entity)-[:ITEM]->(Item)
  RETURN Topic,Relation,Entity,Item`



/** Main async function to submit query, retrieve graph and display as table in elementID **/
/** Also displays query parameter in element ID 'query'                                   **/
/** and table label in element ID 'json-table-label'                                      **/
async function retrieve(parameter, queryText, elementID_query, elementID_table) {

// Display TOPIC (query keyword) as page header
document.getElementById(elementID_query).innerHTML = parameter.toUpperCase().replace(/_/g, ' ')

  const session = driver.session({ defaultAccessMode: neo4j.session.READ })

  try {
    const result = await session.readTransaction(tx =>
      tx.run(
        //  'MATCH (n:MusicalWork) RETURN n.id'
        queryText, { param: parameter }
      )
    )

    // Edit Json object, delete unneeded fields
    // for (x in records) {
    //  delete records[x].keys
    //  delete records[x].length
    //  delete records[x]._fieldLookup
    //  for (y in records[x]._fields) {
    //    delete records[x]._fields[y].identity
    //    delete records[x]._fields[y].start
    //    delete records[x]._fields[y].end
    //  }
    //}

    // Test display of retrieval result
    // console.log('Response from Neo4j:', JSON.stringify(records, null, 2))
    // document.getElementById('raw-json').innerHTML = JSON.stringify(records, null, 2)

    // Display table label and search results
    // document.getElementById('json-table-label').style.display = 'block'  // Display table label
    json2table(result.records, elementID_table)   // display search results in table

    // Display in JsonView
    // https://www.cssscript.com/json-data-tree-view/
    // const tree = JsonView.createTree(result.records);
    // JsonView.render(tree, document.querySelector('.json-view'))
    // document.querySelector('.json-view').innerHTML = ''  // first element with this class
    // const tree = JsonView.renderJSON(result.records, document.querySelector('.json-view'))
    // JsonView.expandChildren(tree);
    // JsonView.collapseChildren(tree);
  

    // return result.records

  } catch (error) {
    console.log(`unable to execute query. ${error}`)
  } finally {
    session.close()
  }
}


/** FUNCTION: Display Neo4j Json object in a table in elementID.innerHTML */
function json2table(records, elementID) {

  /* Display in a table */
  var txt = '<h3>Related information</h3><table style="border-spacing: 2px;"><tr>'
  for (x in records[0].keys) {
    txt += '<th style="background-color:hsl(200,30%,80%)">' + records[0].keys[x].replace(/_/g, ' ') + '</th>'
  }
  txt += '</tr>'

  // display records in table rows
  for (x in records) {
    txt += '<tr>'

    for (y in records[x]._fields) {

      // console.log(typeof records[x]._fields[y].type)
      
      // check whether field represents a null (blank), a relation or a node
      if (records[x]._fields[y] === null) {

        // field is blank (null)
        txt += '<td style="background-color:hsl(0,100%,100%)"></td>'
      
      } else if (typeof records[x]._fields[y].type !== 'undefined') {

        // field represents a RELATION. A Relation field as a "type" attribute, whereas a node has "labels"
        txt += '<td style="background-color:hsl(150,30%,90%);width:100px">' + records[x]._fields[y].type.replace(/_/g, ' ') + '</td>'  

      } else {
        // field is a NODE, not relation
        txt += '<td style="background-color:hsl(170,20%,95%);width:200px"><b>ID: <a target="_blank" href="?parameter='
        txt += records[x]._fields[y].properties.id  + '">'   // hyperlink
        txt += records[x]._fields[y].properties.id.replace(/_/g, ' ') + '</a></b><br/>'  // text
        
        for (z in records[x]._fields[y].properties) {
          //txt += '<br/><em>' + z + '</em>: ' + JSON.stringify(records[x]._fields[1].properties[z]).slice(1,-1) 
          switch (z) {          // handle dates & URLs
            case 'id': break;   // skip id field as already displayed
            case 'birthDate':
              txt += '<br/><em>birthdate</em>: ' + records[x]._fields[y].properties[z].year.low
              txt += '-' + records[x]._fields[y].properties[z].month.low
              txt += '-' + records[x]._fields[y].properties[z].day.low
              break;
            case 'deathDate':
              txt += '<br/><em>deathdate</em>: ' + records[x]._fields[y].properties[z].year.low
              txt += '-' + records[x]._fields[y].properties[z].month.low
              txt += '-' + records[x]._fields[y].properties[z].day.low
              break;
            case 'date':
              txt += '<br/><em>date</em>: ' + records[x]._fields[y].properties[z].year.low
              txt += '-' + records[x]._fields[y].properties[z].month.low
              txt += '-' + records[x]._fields[y].properties[z].day.low
              break;
            case 'comment':
              comment_text = records[x]._fields[y].properties[z]
              comment_text = comment_text.replace(/\\n/g, '<br/>')
              txt += '<br/><em>comment</em>: ' + comment_text
              break;
            case 'thumbnailURL':  // display thumbnail image
              txt += '<br/><a target="_blank" href="' + records[x]._fields[y].properties.accessURL[0]  + '">'
              txt += '<img alt="Photograph" width="200" src="' + records[x]._fields[y].properties.thumbnailURL[0] +'"/></a>'
              break;
            case 'accessURL':
              for (link in records[x]._fields[y].properties[z]) {
                link_URL = records[x]._fields[y].properties.accessURL[link]

                if (link_URL.search("pdf")>=0) { link_text = 'PDF'   // PDF file
                } else if (link_URL.search("jpg")>=0) { link_text = 'JPG' 
                } else if (link_URL.search("youtube")>=0) { link_text = 'YouTube' 
                } else { link_text = 'Webpage' }

                txt += '<br/><a href="' + link_URL +'" target="_blank"><b>' + link_text + '</b></a>'
              }
              break;
            default:
              txt += '<br/><em>' + z + '</em>: ' + JSON.stringify(records[x]._fields[y].properties[z]).slice(1, -1)
          }
        }
      }
      txt += '</td>'
    }
    txt += '</tr>'
  }
  txt += '</table>'

  document.getElementById(elementID).innerHTML = txt;

}


/** Scripts to manipulate Json object **/

// var records = result.records
/*
for (let i = 0; i < records.length; i++) {
var row = records[i].get(0)
rows.push(row)
}
*/

// result.records.forEach(record => {
// console.log(`Found person: ${record.get('name')}`)
// })

/* console.log(result) */
/*
var singleRecord = result.records[0]
var node = singleRecord.get(0)
console.log(node.properties.name)
*/

// result.records.forEach(record => {
//   console.log(`retrieved: ${record.get('label')}`)
// })
