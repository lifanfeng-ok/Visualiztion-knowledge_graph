(function(){ 
  document.addEventListener('DOMContentLoaded', function(){

    /** Utility functions **/
    let $ = selector => document.querySelector( selector );  // to select HTML elements

    let tryPromise = fn => Promise.resolve().then( fn );  // to start executing a chain of functions

    let toJson = obj => obj.json();  // Convert json file content to javascript object

    let cy;  // cytoscape display canvas

    /* For retrieving cytoscape stylesheet store in separate json file */
    let getStylesheet = name => {
      return fetch(`stylesheets/${name}`).then( res => toJson(res) );
    };
	let applyStylesheet = stylesheet => {
      cy.style().fromJson( stylesheet ).update();
    };
	
    let applyStylesheetFromSelect = () => Promise.resolve( 'style.default.json' ).then( getStylesheet ).then( applyStylesheet );


    /** Handling of the popup modal window **/
    $("#modal1").style.display = "block";  // Display the modal

    // When the user clicks on <span> (x), close the modal
    $("#close1").addEventListener('click', function() { $("#modal1").style.display = "none" });
    $("#modal1").addEventListener('click', function() { $("#modal1").style.display = "none" });

    // Close graph popup info box, when user double-clicks on it
    $("#graph-popup1-close").addEventListener('click', function() { $("#graph-popup1").style.display = "none" });
    $("#graph-popup1").addEventListener('dblclick', function() { $("#graph-popup1").style.display = "none" });

    // When the user clicks anywhere outside of modal1, close it
    window.onclick = function(event) {
      if (event.target == $("#modal1")) {
         $("#modal1").style.display = "none";
      }
    }  


    /* Make the popup info box draggable */
    dragElement(document.getElementById("graph-popup1"));

    function dragElement(elmnt) {
      var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      elmnt.onmousedown = dragMouseDown;
      elmnt.ontouchstart = dragMouseDown;  // for touch screens

      function dragMouseDown(e) {
        e = e || window.event;
        // e.preventDefault();
		
		if ((e.clientX)&&(e.clientY)) {
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          // call a function whenever the cursor moves:
          document.onmousemove = elementDrag_mouse;

        } else if (e.targetTouches) {
          pos3 = e.targetTouches[0].clientX;
          pos4 = e.targetTouches[0].clientY;
		  document.ontouchend = closeDragElement;
          // call a function whenever the cursor moves:
          document.ontouchmove = elementDrag_touch;
        }
      }

      function elementDrag_mouse(e) {
        e = e || window.event;
        // e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }

      function elementDrag_touch(e) {
        e = e || window.event;
        // e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.targetTouches[0].clientX;
        pos2 = pos4 - e.targetTouches[0].clientY;
        pos3 = e.targetTouches[0].clientX;
        pos4 = e.targetTouches[0].clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }

      function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
		document.ontouchend = null;
        document.ontouchmove = null;
      }
    }

 
 
    /** Cypher query texts **/

    const song1 = 'Majulah_Singapura-Work'
    const song2 = 'Semoga_Bahagia-Work'

    // Retrieve neighboring nodes for the specified node
    // Browse by CreativeWork genre -- photograph, letter, etc.
    const queryText0 =
    `MATCH (Entity1 {id: $param})-[R]-(Entity2)
    RETURN Entity1, R, Entity2`

    // MusicalWork -(realization)-> MusicalExpression [ -()-> Performance -()-> Item]
    const queryText1a =
    `MATCH (MW:MusicalWork {id: $param})-[R1:REALIZATION|COMPOSER]->(Entity1)
    OPTIONAL MATCH (Entity1)-[R2:ARRANGEMENT|ARRANGER|COMPOSER|CONDUCTOR|CONTRIBUTOR|DIRECTOR|EVENT|HAS_PART|PERFORMED_IN|PERFORMER|ITEM]->(Entity2)
    RETURN MW, R1, Entity1, R2, Entity2`
    // OPTIONAL MATCH (Entity)-[R3:ITEM]->(Item)

    // Neighbor nodes with relations pointing away: [Entity1] -(relation)-> [Entity2] -(relation)-> [Entity3]
    // Leave out 'type' relation
    const queryText1b =
    `MATCH (Entity1 {id: $param})-[R1:ABOUT|ARRANGEMENT|ARRANGER|AUTHOR|BIOGRAPHY|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|ITEM|LOCATION|MENTIONS|PERFORMED_IN|PERFORMER|PERSON_SHOWN|PRINCIPAL|PUBLISHED_AS|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]->(Entity2)
    OPTIONAL MATCH (Entity2)-[R2:ABOUT|ARRANGEMENT|ARRANGER|AUTHOR|BIOGRAPHY|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|ITEM|LOCATION|MENTIONS|PERFORMED_IN|PERFORMER|PERSON_SHOWN|PRINCIPAL|PUBLISHED_AS|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]->(Entity3)
    RETURN Entity1, R1, Entity2, R2, Entity3`

    // Neighbor nodes: [Entity1] -(relation)-> [Entity2] -(relation)-> [Entity3]
    // But leave out music related relations -- realization, performed in, arrangement. Also leave out ITEM relation
    const queryText1c =
    `MATCH (Entity1 {id: $param})-[R1:ABOUT|ARRANGER|AUTHOR|BIOGRAPHY|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|LOCATION|MENTIONS|PERFORMER|PERSON_SHOWN|PRINCIPAL|PUBLISHED_AS|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]->(Entity2)
    OPTIONAL MATCH (Entity2)-[R2:ABOUT|ARRANGER|AUTHOR|BIOGRAPHY|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|ITEM|LOCATION|MENTIONS|PERFORMER|PERSON_SHOWN|PRINCIPAL|PUBLISHED_AS|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]->(Entity3)
    RETURN Entity1, R1, Entity2, R2, Entity3`

    // Neighbor nodes with relations pointing towards it: [Entity1] <-(relation)- [Entity2] <-(relation)- [Entity3]
    // Leave out 'type' relation
    const queryText1d =
    `MATCH (Entity1 {id: $param})<-[R1:ABOUT|ARRANGER|AUTHOR|BIOGRAPHY|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|LOCATION|MENTIONS|PERFORMER|PERSON_SHOWN|PRINCIPAL|PUBLISHED_AS|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Entity2)
    OPTIONAL MATCH (Entity2)<-[R2:ABOUT|ARRANGER|AUTHOR|BIOGRAPHY|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|LOCATION|MENTIONS|PERFORMER|PERSON_SHOWN|PRINCIPAL|PUBLISHED_AS|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Entity3)
    RETURN Entity3, R2, Entity2, R1, Entity1`

    // Combine queryText1c and QueryText1d (i.e. ignoring direction of relation)
    const queryText1cd =
    `MATCH (Entity1 {id: $param})-[R1:ABOUT|ARRANGER|AUTHOR|BIOGRAPHY|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|LOCATION|MENTIONS|PERFORMER|PERSON_SHOWN|PRINCIPAL|PUBLISHED_AS|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Entity2)
    OPTIONAL MATCH (Entity2)-[R2:ABOUT|ARRANGER|AUTHOR|BIOGRAPHY|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|OCATION|MENTIONS|PERFORMER|PERSON_SHOWN|PRINCIPAL|PUBLISHED_AS|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Entity3)
    RETURN Entity1, R1, Entity2, R2, Entity3`


    // List letters and other CreativeWork related to song
    const queryText1e1 =    // 1 link
    `MATCH (MW:MusicalWork {id: $param})-[R]->(CW:CreativeWork)
    RETURN MW, R, CW`

   const queryText1e2 =    // 2 link
    `MATCH (MW:MusicalWork {id: $param})-[R1]-(Entity)-[R2]->(CW:CreativeWork)
    RETURN MW, R1, Entity, R2, CW`

   const queryText1e3 =    // 3 link
    `MATCH (MW:MusicalWork {id: $param})-[R1:ABOUT|ARRANGEMENT|MENTIONS|PERFORMED_IN|REALIZATION]-(Entity1)-[R2:ABOUT|ARRANGEMENT|MENTIONS|PERFORMED_IN|REALIZATION]-(Entity2)-[R3:ABOUT|EVENT|HAS_PART|MENTIONS|PUBLISHED_AS|RESPONSE_TO]-(CW:CreativeWork)
    RETURN MW, R1, Entity1, R2, Entity2, R3, CW`
    // old: `MATCH (MW:MusicalWork {id: $param})-[R1:ABOUT|ARRANGEMENT|ARRANGER|AUTHOR|COMPOSER|CONDUCTOR|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|MENTIONS|PERFORMED_IN|PERFORMER|PRINCIPAL|REALIZATION]-(Entity1)-[R2]-(Entity2)-[R3:ABOUT|AUTHOR|CC|COMPOSER|CONDUCTOR|CONTENT|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|MENTIONS|PRINCIPAL|PUBLISHED_AS|RECIPIENT|RESPONSE_TO|SENDER]-(CW:CreativeWork)


     // Links between $specific_person and Zubir Said
    // 1 link
    const queryText2a1 =
    `MATCH (P1:Person {id: "Zubir_Said"})-[Relation:ARRANGEMENT|ARRANGER|AUTHOR|CC|COMPOSER|CONDUCTOR|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|PERFORMED_IN|PERFORMER|PERSON_SHOWN|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(P2:Person)
    RETURN P1, Relation, P2`
    // 2 links
    const queryText2a2 =
    `MATCH (P1:Person {id: "Zubir_Said"})-[R1:ARRANGEMENT|ARRANGER|AUTHOR|CC|COMPOSER|CONDUCTOR|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|PERFORMED_IN|PERFORMER|PERSON_SHOWN|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Entity)-[R2:ARRANGEMENT|ARRANGER|AUTHOR|CC|COMPOSER|CONDUCTOR|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|PERFORMED_IN|PERFORMER|PERSON_SHOWN|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(P2:Person)
    RETURN P1, R1, Entity, R2, P2`
    // 3 links
    const queryText2a3 =
    `MATCH (P1:Person {id: "Zubir_Said"})-[R1:ARRANGEMENT|ARRANGER|AUTHOR|CC|COMPOSER|CONDUCTOR|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|PERFORMED_IN|PERFORMER|PERSON_SHOWN|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Entity1)-[R2:ARRANGEMENT|ARRANGER|AUTHOR|CC|COMPOSER|CONDUCTOR|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|PERFORMED_IN|PERFORMER|PERSON_SHOWN|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(Entity2)-[R3:ARRANGEMENT|ARRANGER|AUTHOR|CC|COMPOSER|CONDUCTOR|CONTRIBUTOR|CREATOR|DIRECTOR|EVENT|HAS_PART|ISSUED_BY|PERFORMED_IN|PERFORMER|PERSON_SHOWN|REALIZATION|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE]-(P2:Person)
    RETURN P1, R1, Entity1, R2, Entity2, R3, P2`

    // Browse by CreativeWork genre -- photograph, letter, etc.
    const queryText2b =
    `MATCH (Document:CreativeWork {type: $param})-[R:ABOUT|AUTHOR|CC|CONTRIBUTOR|CREATOR|HAS_PART|MENTIONS|PERSON_SHOWN|RECIPIENT|RESPONSE_TO|SENDER]-(Entity)
    RETURN Document, R, Entity`

    // Browse by CreativeWork - any relation (for use with Comment and other types with few items
    const queryText2b2 =
    `MATCH (Document:CreativeWork {type: $param})-[R]-(Entity)
    RETURN Document, R, Entity`

    // Browse ALL Documents
    const queryText2c =
    `MATCH (Document:Document)-[R]-(Entity)
    RETURN Document, R, Entity`
    // `MATCH (Document:Document)-[R:ABOUT|AUTHOR|CONTRIBUTOR|CREATOR|HAS_PART|ISSUED_BY|MENTIONS]-(Entity)
    // RETURN Document, R, Entity`

    // Browse all CreativeWorks
    const queryText2d =
    `MATCH (Document:CreativeWork)-[R:ABOUT|AUTHOR|CONTRIBUTOR|CREATOR|HAS_PART|ISSUED_BY|MENTIONS]-(Entity)
    RETURN Document, R, Entity`

    //  `MATCH (Document:CreativeWork {type: $param})-[Relation1:ABOUT|AUTHOR|BIOGRAPHY|CC|CONTENT|CONTRIBUTOR|CREATOR|EVENT|HAS_PART|ISSUED_BY|LOCATION|MENTIONS|CURRENT_LOCATION|PERSON_SHOWN|PRINCIPAL|RECIPIENT|RESPONSE_TO|SENDER|SPOUSE|STATE|ITEM]->(Entity1)-[Relation2]->(Entity2)
    //  RETURN Document,Relation1,Entity1,Relation2,Entity2`

    // Browse by $topic
    const queryText2e =
    `MATCH (Topics:Topic)-[R:ABOUT]-(Entity)
    RETURN Topics, R, Entity`
    //  `MATCH (Topic:Topic)-[Relation:ABOUT]-(Entity)
    //  OPTIONAL MATCH (Entity)-[:ITEM]->(Item)
    //  RETURN Topic,Relation,Entity,Item`
 

    
  /** Listeners & Actions attached to HTML elements **/
  
  $('#majulah-music').addEventListener('click', function() { retrieve(song1,queryText1a,'query') });

  $('#majulah-letters').addEventListener('click', function(){ 
    retrieve(song1,queryText1e1,'query'); 
	retrieve(song1,queryText1e2,'query'); 
	retrieve(song1,queryText1e3,'query'); 
  });
	
  $('#semoga-music').addEventListener('click', function() { retrieve(song2,queryText1a,'query') });
	
  $('#semoga-letters').addEventListener('click', function() { 
    retrieve(song2,queryText1e1,'query'); 
	retrieve(song2,queryText1e2,'query'); 
	retrieve(song2,queryText1e3,'query'); 
  });
  
  $('#social_network').addEventListener('click', function() { 
      retrieve('Zubir_Said',queryText2a1,'query');
	  retrieve('Zubir_Said',queryText2a2,'query');
	  retrieve('Zubir_Said',queryText2a3,'query') ;
  });

  $('#genre-photos').addEventListener('click', function() { retrieve('Photograph',queryText2b,'query') });
 
  $('#genre-letters').addEventListener('click', function() { retrieve('Letter',queryText2b,'query') });
 
  $('#genre-speeches').addEventListener('click', function() { retrieve('Speech',queryText2b,'query') });

  $('#genre-docs').addEventListener('click', function() { retrieve('',queryText2c,'query') });
  
  $('#genre-commentary').addEventListener('click', function() { retrieve('Comment',queryText2b2,'query') });

  $('#genre-essays').addEventListener('click', function() { retrieve('Essay',queryText2b,'query') });

  $('#genre-news').addEventListener('click', function() { retrieve('NewsArticle',queryText2b,'query') });

  $('#genre-tv').addEventListener('click', function() { retrieve('TV_documentary',queryText2b2,'query') });

  $('#genre-all').addEventListener('click', function(){
	  retrieve('',queryText2d,'query');
	  retrieve('',queryText2c,'query');
  });

  $('#topic').addEventListener('click', function() { retrieve('',queryText2e,'query') });

  /* Example */
  // $stylesheet.addEventListener('change', applyStylesheetFromSelect);



  /** Create connection object for neo4j database **/
  const driver = neo4j.driver(
    'neo4j+s://0c8dfc4e.databases.neo4j.io',
    neo4j.auth.basic('anonymous', 'anonymous')
  )
 
 
  /** Main async function to submit query, retrieve graph and display as table in elementID_table **/
  /** Also displays query parameter in element ID 'query'                                   **/
  async function retrieve(parameter, queryText, elementID_query) {

    // Display TOPIC (query keyword) as page header
    document.getElementById(elementID_query).innerHTML = parameter.toUpperCase().replace(/_/g, ' ')

    // create a session for neo4j driver
    const session = driver.session({ defaultAccessMode: neo4j.session.READ })

    try {
      const result = await session.readTransaction(tx =>
        tx.run(
        //  'MATCH (n:MusicalWork) RETURN n.id'
        queryText, { param: parameter }
        )
      )

      // console.log(result.records);
      json2graph(result.records)           // add search results to graph
	  cy.layout( layouts['cola'] ).run();  // run default graph layout

    } catch (error) {
      console.log(`unable to execute query. ${error}`)
    } finally {
      session.close()
    }
  }
  
 
  /** Add Neo4j result records to Cytoscape graph */
  let json2graph = records => {

    let z_obj;      // to store properties[z] in JSON file from neo4j
	let cy_ele;     // to store newly created graph element 
	
    for (x in records) {  // Process each record

	  /* Process all the node fields first */
      for (y in records[x]._fields) {  // Process each field in record
     
        // check whether field represents a null (blank), a relation or a node
        if (records[x]._fields[y] === null) {   // field is blank (null) 
        
	    } else if (typeof records[x]._fields[y].type !== 'undefined') {

          // the field represents a RELATION. A Relation field has a "type" attribute, whereas a node has "labels"
          // skip for now
		  
        } else {    // field is a NODE, not relation
        
		  // create cytoscape node. Add mandatory fields
          cy.add({ data: {
			id: records[x]._fields[y].identity.low,            
			id2: records[x]._fields[y].properties.id,
			supertype: records[x]._fields[y].labels[0],
            type: records[x]._fields[y].properties.type,
			label: records[x]._fields[y].properties.label,
          }});

          cy_ele = cy.$id(records[x]._fields[y].identity.low) ;  // retrieve newly created node to add more fields

          // add other fields
          for (z in records[x]._fields[y].properties) { 
		    z_obj = records[x]._fields[y].properties[z] ;
		    switch (z) {          // handle dates & URLs
              case 'id': break;   // skip id field as already displayed
		      case 'type': break;   // skip id field as already displayed
		      case 'label': break;   // skip id field as already displayed
			  case 'birthDate': cy_ele.data( 
                    z , z_obj.year.low + '-' + z_obj.month.low + '-' + z_obj.day.low
				)
                break;
              case 'deathDate': cy_ele.data( 
                    z , z_obj.year.low + '-' + z_obj.month.low + '-' + z_obj.day.low
				)
                break;
              case 'date': cy_ele.data( 
                    z , z_obj.year.low + '-' + z_obj.month.low + '-' + z_obj.day.low
				)
                break;
              case 'thumbnailURL':  // array of URLs
			    cy_ele.data( z , z_obj)
                break;
              case 'accessURL':     // array of URLs
			    cy_ele.data( z , z_obj)
			    break;
              default: cy_ele.data( z , JSON.stringify(z_obj).slice(1,-1) ) ;   
            }		  
		  }
		  // console.log(cy_ele.data());
		  
		}
	  }
	  
	  /* Now process all the relations */
      for (y in records[x]._fields) {  // Process each field in record
     
        // check whether field represents a null (blank), a relation or a node
        if (records[x]._fields[y] === null) {   // field is blank (null) 
        
	    } else if (typeof records[x]._fields[y].type !== 'undefined') {

          // field represents a RELATION. A Relation field has a "type" attribute, whereas a node has "labels"
          // Add edge to graph
          cy.add({ data: {
            id: records[x]._fields[y].identity.low,
            source: records[x]._fields[y].start.low,
            target: records[x]._fields[y].end.low,
            type: records[x]._fields[y].type,
			label: records[x]._fields[y].properties.label,
          }});

		  cy_ele = cy.$id(records[x]._fields[y].identity.low) ;  // retrieve newly created node to add more fields

          // add other fields
          for (z in records[x]._fields[y].properties) { 
		    z_obj = records[x]._fields[y].properties[z] ;
		    switch (z) {          // handle dates & URLs
              case 'id': break;   // skip id field as already displayed
		      case 'type': break;   // skip id field as already displayed
		      case 'label': break;   // skip id field as already displayed
              case 'date': cy_ele.data( 
                    z , z_obj.year.low + '-' + z_obj.month.low + '-' + z_obj.day.low
				)
                break;
              default: cy_ele.data( z , JSON.stringify(z_obj).slice(1,-1) ) ;   
			}
          }	
		  // console.log(cy_ele.data());		  
        }
      }
    }
  }
 
 
 
  cy = cytoscape({
    
	container: $('#cy'),
	minZoom: 0.5,
    maxZoom: 4,
	
    elements: [ // list of graph elements to start with
    ],

    style: [ // the stylesheet for the graph
      {
        selector : "node",
        style : {
		  "label" : "data(label)",
		  "text-wrap" : "wrap",
		  "text-max-width" : "200px",
          "background-color" : "hsl(240,80%,90%)",
          "border-width" : 0.0,
          "height" : 30.0,
          "shape" : "ellipse",
          "font-size" : 12,
          "color" : "hsl(240,80%,20%)",
          "text-opacity" : 1.0,
          "text-valign" : "center",
          "text-halign" : "center",
          "font-family" : "Tahoma, Arial, sans-serif",
          "font-weight" : "normal",
          "border-opacity" : 0.0,
          "border-color" : "hsl(0,0%,100%)",
          "width" : 50.0,
          "background-opacity" : 1.0,
          "content" : "data(label)"
      }}, 
	  {
        selector : "edge",
        style : {
		  "label" : "data(label)",
		  "text-wrap" : "wrap",
		  "text-max-width" : "200px",
          "line-style" : "solid",
          "font-size" : 12,
          "color" : "hsl(240,80%,20%)",
          "line-color" : "hsl(240,80%,70%)",
          "text-opacity" : 1.0,
          "width" : 1.0,
          "font-family" : "Tahoma, Arial, sans-serif",
          "font-weight" : "normal",
          "opacity" : 1.0,
		  "source-arrow-color" : "hsl(0,0%,100%)",
          "source-arrow-shape" : "none",
		  "target-arrow-shape" : "triangle",
          "target-arrow-color" : "hsl(240,80%,20%)",
		  "target-arrow-fill" : "filled",
		  "arrow-scale" : 1,
          "content" : "data(label)"
      }}, 
	  {
        selector : "node[supertype = 'MusicalWork']",
        style : {
          "shape" : "octagon",
	      "background-color" : "hsl(0, 80%, 90%)",
	      "height" : 50.0,
		  "border-width" : 1.0,
          "border-opacity" : 1.0,
          "border-color" : "hsl(0, 80%, 50%)",
      }}, 
	  {
        selector : "node[supertype = 'Topic']",
        style : {
          "background-color" : "hsl(40, 80%, 90%)",
      }}, 
	  {
        selector : "node[supertype = 'Person']",
        style : {
          "background-color" : "hsl(80, 80%, 90%)",
	      "shape" : "round-rectangle",
		  "height" : 50.0,
	      "border-width" : 1.0,
          "border-opacity" : 1.0,
          "border-color" : "hsl(80, 80%, 50%)",
          "width" : 40.0,
          "background-opacity" : 1.0,
      }}, 
	  {
        selector : "node[supertype='CreativeWork'],[supertype='Document'],[supertype='Information_Object']",
        style : {
          "shape" : "rectangle",
	      "background-color" : "hsl(120, 80%, 90%)",
      }}, 
	  {
        selector : "node[supertype = 'Place']",
        style : {
	      "background-color" : "hsl(160, 80%, 90%)",
      }}, 
	  {
        selector : "node[supertype = 'Item']",
        style : {
    	  "background-color" : "hsl(200, 80%, 90%)",
	      "border-width" : 1.0,
          "height" : 20.0,
          "shape" : "ellipse",
          "border-opacity" : 1.0,
          "border-color" : "hsl(200, 50%, 50%)",
          "width" : 20.0,
          "background-opacity" : 1.0,
      }}, 
	  {
        selector : "edge[type = 'REALIZATION'],[type = 'PERFORMED_IN'],[type = 'ARRANGEMENT']",
        style : {
          "line-color" : "hsl(0, 100%, 90%)",
	      "width" : 3.0,
       }}, 
	   {
        selector : "edge[type = 'ITEM']",
        style : {
          "line-color" : "hsl(240,80%,50%)",
       }}, 
	   {
        selector : "node[supertype = 'Class']",
        style : {
	      "background-color" : "hsl(280, 60%, 90%)",
          "shape" : "triangle",
        }},
	  {
        selector : "node:selected",
        style : {
          "background-color" : "hsl(280,100%,70%)"
      }}, 
	  {
        selector : "edge:selected",
        style : {
          "line-color" : "hsl(280,100%,30%)",
      }},
    ],	  
  });


  let layouts = {
    cola: {
        name: 'cola',
		
        animate: true, // whether to show the layout as it's running
        refresh: 1, // number of ticks per frame; higher is faster but more jerky
        maxSimulationTime: 20000, // max length in ms to run the layout
        ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
        fit: false, // on every layout reposition of nodes, fit the viewport
        padding: 30, // padding around the simulation
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

        // layout event callbacks
        ready: function(){}, // on layoutready
        stop: function(){}, // on layoutstop

        // positioning options
        randomize: false, // use random node positions at beginning of layout
        avoidOverlap: true, // if true, prevents overlap of node bounding boxes
        handleDisconnected: true, // if true, avoids disconnected components from overlapping
        convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
        nodeSpacing: function( node ){ return 10; }, // extra spacing around nodes
        flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
        alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
        gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]

        // different methods of specifying edge length
        // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
        edgeLength: 100, // sets edge length directly in simulation
        edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
        edgeJaccardLength: undefined, // jaccard edge length in simulation

        // iterations of cola algorithm; uses default values on undefined
        unconstrIter: undefined, // unconstrained initial layout iterations
        userConstIter: undefined, // initial layout iterations with user-specified constraints
        allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
    },
    breadthfirst: {  	
	    name: 'breadthfirst',

        fit: false, // whether to fit the viewport to the graph
        directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
        padding: 30, // padding on fit
        circle: false, // put depths in concentric circles if true, put depths top down if false
        grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
        spacingFactor: 1.5, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap). default 1.75
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
        roots: undefined, // the roots of the trees
        maximal: false, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled,
        animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
        transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts

    },
    cose: {		  
        name: 'cose',

        ready: function(){},  // Called on `layoutready`
        stop: function(){},   // Called on `layoutstop`

        // Whether to animate while running the layout
        // true : Animate continuously as the layout is running
        // false : Just show the end result
        // 'end' : Animate with the end result, from the initial positions to the end positions
        animate: true,
        animationEasing: undefined,    // Easing of the animation for animate:'end'
        animationDuration: 10000,  // The duration of the animation for animate:'end'

        // A function that determines whether the node should be animated
        // All nodes animated by default on animate enabled
        // Non-animated nodes are positioned immediately when the layout starts
        animateFilter: function ( node, i ){ return true; },

        // The layout animates only after this many milliseconds for animate:true
        // (prevents flashing on fast runs)
        animationThreshold: 250,

        refresh: 20,    // Number of iterations between consecutive screen positions update
        fit: false,    // Whether to fit the network view after when done
        padding: 30,    // Padding on fit
        boundingBox: undefined,    // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }

        // Excludes the label when calculating node bounding boxes for the layout algorithm
        nodeDimensionsIncludeLabels: false,

        randomize: false,        // Randomize the initial positions of the nodes (true) or use existing positions (false)
        componentSpacing: 40,    // Extra spacing between components in non-compound graphs
        nodeRepulsion: function( node ){ return 2048; },    // Node repulsion (non overlapping) multiplier. Default 2048
        nodeOverlap: 5,          // Node repulsion (overlapping) multiplier. Default 4
        idealEdgeLength: function( edge ){ return 40; },    // Ideal edge (non nested) length
        edgeElasticity: function( edge ){ return 40; },     // Divisor to compute edge forces
        nestingFactor: 1.2,      // Nesting factor (multiplier) to compute ideal edge length for nested edges
        gravity: 1,              // Gravity force (constant)
        numIter: 20000,           // Maximum number of iterations to perform
        initialTemp: 1000,       // Initial temperature (maximum node displacement)
        coolingFactor: 0.99,     // Cooling factor (how the temperature is reduced between consecutive iterations
        minTemp: 1.0             // Lower temperature threshold (below this point the layout will end)
    }, 
	grid: {
      name: 'grid',

      fit: false, // whether to fit the viewport to the graph
      padding: 30, // padding used on fit
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
      nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
      spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      condense: false, // uses all available space on false, uses minimal space on true
      rows: undefined, // force num of rows in the grid
      cols: undefined, // force num of columns in the grid
      position: function( node ){}, // returns { row, col } for element
      sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts 
    },
	concentric: {
      name: 'concentric',

      fit: false, // whether to fit the viewport to the graph
      padding: 30, // the padding on fit
      startAngle: 3 / 2 * Math.PI, // where nodes start in radians
      sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
      clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
      equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
      minNodeSpacing: 10, // min spacing between outside of nodes (used for radius adjustment)
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
      height: undefined, // height of layout area (overrides container height)
      width: undefined, // width of layout area (overrides container width)
      spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      concentric: function( node ){ // returns numeric value for each node, placing higher nodes in levels towards the centre
        return node.degree();
      },
      levelWidth: function( nodes ){ // the variation of concentric values in each level
        return nodes.maxDegree() / 4;
      },
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
    },
	cose_bilkent: {
		name: 'cose-bilkent',
	    ready: function () { },
        stop: function () { },

        // 'draft', 'default' or 'proof" 
        // - 'draft' fast cooling rate 
        // - 'default' moderate cooling rate 
        // - "proof" slow cooling rate
        quality: 'default',

        nodeDimensionsIncludeLabels: false,  // Whether to include labels in node dimensions. Useful for avoiding label overlap
        refresh: 30,                     // number of ticks per frame; higher is faster but more jerky
        fit: false,                      // Whether to fit the network view after when done
        padding: 30,                     // Padding on fit
        randomize: false,                // Whether to enable incremental mode
        nodeRepulsion: 4500,             // Node repulsion (non overlapping) multiplier, default 4500
        idealEdgeLength: 100,             // Ideal (intra-graph) edge length, default 50
        edgeElasticity: 0.45,            // Divisor to compute edge forces, default 0.45
        nestingFactor: 0.1,              // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
        gravity: 0.25,                   // Gravity force (constant)
        numIter: 50000,                  // Maximum number of iterations to perform
        tile: true,                      // Whether to tile disconnected nodes
        animate: 'end',                  // Type of layout animation. The option set is {'during', 'end', false}
        animationDuration: 50000,        // Duration for animate:end
        tilingPaddingVertical: 10,       // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
        tilingPaddingHorizontal: 10,     // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
        gravityRangeCompound: 1.5,       // Gravity range (constant) for compounds
        gravityCompound: 1.0,            // Gravity force (constant) for compounds
        gravityRange: 3.8,               // Gravity range (constant)
        initialEnergyOnIncremental: 0.5  // Initial cooling factor for incremental layout
    },
  };



  /** Listeners & Actions attached to Cytoscape display & elements **/
  
  /* Change graph layout */
  $('#layout-breadthfirst').addEventListener('click', function(){ cy.layout( layouts['breadthfirst'] ).run() });
  $('#layout-cose').addEventListener('click', function(){ cy.layout( layouts['cose'] ).run() });
  $('#layout-concentric').addEventListener('click', function(){ cy.layout( layouts['concentric'] ).run() });
  $('#layout-cola').addEventListener('click', function(){ cy.layout( layouts['cola'] ).run() });
  $('#layout-cose-bilkent').addEventListener('click', function(){ cy.layout( layouts['cose_bilkent'] ).run() });
  $('#clear_canvas').addEventListener('click', function(){ cy.elements().remove() });
  $('#reset_zoom').addEventListener('click', function(){ cy.reset();  });


  /* Respond to clicks on graph nodes & edges */
  cy.on('tap', 'node', function(event){
    let node = event.target;      // event.target represents the element that was clicked

    // console.log( 'tapped ' + node.data() );
	// $('#graph-popup1-content').innerHTML = '<p>' + JSON.stringify(node.data()) + '</p>';

    // html text to display in panel. Start with ID2 field
    let txt = '<p><b>ID: ' + node.data()['id2'] + '</b></p>';  
	txt = txt.replace(/_/g, ' ')   // replace _ with space

    // temporary storage
    let comment_text;  
	let link_text;
	
    for (x in node.data()) {

      // console.log(x + " : " + node.data()[x])
      
       
        //ID: <a target="_blank" href="?parameter='
        //txt += records[x]._fields[y].properties.id  + '">'   // hyperlink
        //txt += records[x]._fields[y].properties.id.replace(/_/g, ' ') + '</a></b><br/>'  // text
     
      switch (x) {          // handle dates & URLs
        case 'id': break;   // skip id field as it is just a node no. We'll display id2
        case 'id2': break;  // already displayed
        case 'comment':
          comment_text = node.data()[x]
          comment_text = comment_text.replace(/\\n/g, '<br/>')  // replace \\n in the text with <br>
		  comment_text = comment_text.replace(/\\/g, '')  // remove \ <br>
          txt += '<p><em>comment</em>: ' + comment_text + '</p>'
          break;
        case 'thumbnailURL':  // display thumbnail image
              txt += '<p><a target="_blank" href="' + node.data().accessURL[0]  + '">'
              txt += '<img alt="Photograph" width="200" src="' + node.data().thumbnailURL[0] +'"/></a></p>'
          break;
        case 'accessURL':
          for (link in node.data()[x]) {
              link_URL = node.data().accessURL[link]

                if (link_URL.search("pdf")>=0) { link_text = 'PDF'   // PDF file
                } else if (link_URL.search("jpg")>=0) { link_text = 'JPG' 
                } else if (link_URL.search("youtube")>=0) { link_text = 'YouTube' 
                } else { link_text = 'Webpage' }

                txt += '<p><a href="' + link_URL +'" target="_blank"><b>' + link_text + '</b></a></p>'
          }
          break;
        default: txt += '<p><em>' + x + '</em>: ' + node.data()[x] + '</p>'
      }
    }
	$('#node-expand').value = node.data()['id2'];  // Add neo4j node ID2 to button value - to pass to listener when clicked
	$('#node-remove').value = node.data()['id'];   // Add cytoscape node ID to button value
    $('#graph-popup1-content').innerHTML = txt;
	$('#graph-popup1').style.display = 'block'; 
	$('#graph-popup1-menu').style.display = 'block'; 

  });

  cy.on('tap', 'edge', function(event){
    let edge = event.target;
    let txt = '<p><b>Relation: ' + edge.data()['type'] + '</b></p>';  // html text to display in panel
	
    for (x in edge.data()) {
     
      switch (x) {          
        case 'id': break;       // skip 
		case 'source': break;   // skip 
		case 'target': break;   // skip 
        case 'type':  break; 
        case 'comment':
          comment_text = edge.data()[x]
          comment_text = comment_text.replace(/\\n/g, '<br/>')
		  comment_text = comment_text.replace(/\\/g, '')
          txt += '<p><em>comment</em>: ' + comment_text + '</p>'
          break;
        default: txt += '<p><em>' + x + '</em>: ' + edge.data()[x] + '</p>'
      }
    }
    $('#graph-popup1-content').innerHTML = txt;
	$('#graph-popup1').style.display = 'block'; 
	$('#graph-popup1-menu').style.display = 'none'; 
  });

  /* Expand a node with neighboding nodes, when user rightclicks on a node */
  cy.on('cxttap', 'node', function(event){
    let node = event.target;      // event.target represents the element that was clicked
	node.select();   
    retrieve(node.data()['id2'],queryText0,'query')
  });
 
 
  /* Add listeners for expanding and removing existing Cytoscape nodes */
  // expand node id stored in button value
  $('#node-expand').addEventListener('click', function() { 
    retrieve( $('#node-expand').value, queryText0, 'query') // $('#node-expand').value contains the node ID used in neo4j database
  });
  // remove node stored in button value
  $('#node-remove').addEventListener('click', function() { 
    cy.$id($('#node-remove').value).remove()                // $('#node-remove').value contains the node ID used in Cytoscape
  });  

            
  });
})();

